import { Injectable, inject } from '@angular/core';
import { Observable, of, from, map, filter, switchMap } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';

// Interfaces para el backend
export interface UserNotificationPreferences {
  id?: string;
  usuarioId?: string;
  habilitado: boolean;
  emailHabilitado: boolean;
  inAppHabilitado: boolean;
  preferenciasPorEntidad?: Record<string, { inApp: boolean; email: boolean }>;
  notificarInfo: boolean;
  notificarWarning: boolean;
  notificarCritical: boolean;
  frecuenciaEmail: 'inmediato' | 'resumen_diario' | 'resumen_semanal';
  horaResumen: string;
  horarioNoMolestarHabilitado: boolean;
  horarioNoMolestarInicio?: string;
  horarioNoMolestarFin?: string;
  horarioNoMolestarDias?: number[]; // 0=Domingo, 1=Lunes, etc.
  preferenciasPorModulo?: Record<string, { inApp: boolean; email: boolean }>;
  // Rate Limiting
  rateLimitHabilitado?: boolean;
  rateLimitMaxPorHora?: number;
}

export interface NotificationRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  eventoTipo: string;
  activo: boolean;
  notificarCreador: boolean;
  notificarResponsable: boolean;
  notificarAprobadores: boolean;
  rolesDestino?: string;
  usuariosDestino?: string;
  enviarInApp: boolean;
  enviarEmail: boolean;
  plantillaMensaje?: string;
  severidad: string;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface AlertRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  entidadId?: string;
  metricaNombre: string;
  operador: string;
  valorUmbral: number;
  tipoAgregacion: string;
  periodoEvaluacion?: string;
  activo: boolean;
  rolesDestino?: string;
  usuariosDestino?: string;
  enviarInApp: boolean;
  enviarEmail: boolean;
  severidad: string;
  cooldownMinutos: number;
  ultimaEjecucion?: Date;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface ExpirationRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  diasAnticipacion: string; // JSON array
  diasDespuesVencido?: string; // JSON array
  activo: boolean;
  notificarResponsable: boolean;
  notificarSupervisor: boolean;
  rolesDestino?: string;
  enviarInApp: boolean;
  enviarEmail: boolean;
  fechaCreacion: Date;
  fechaModificacion?: Date;
}

export interface NotificationLog {
  id: string;
  notificationId?: string;
  usuarioId: string;
  canal: string;
  estado: string;
  errorMensaje?: string;
  reglaId?: string;
  reglaTipo?: string;
  metadata?: string;
  fechaEnvio: Date;
}

export interface Notification {
  id: string;
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  severidad: string;
  entidadTipo?: string;
  entidadId?: string;
  entidadNombre?: string;
  leida: boolean;
  archivada: boolean;
  enSeguimiento: boolean;
  acciones?: string;
  fechaCreacion: Date;
  fechaLeida?: Date;
}

export interface EntityTreeNode {
  key: string;
  label: string;
  icon?: string;
  selectable?: boolean;
  children?: EntityTreeNode[];
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private db = inject(IndexedDBService);
  private currentUserId = 'u1'; // Default user

  constructor() {
    this.db.init();
  }

  // ============================================================
  // PREFERENCIAS DE USUARIO
  // ============================================================

  getPreferences(usuarioId?: string): Observable<UserNotificationPreferences> {
    const uid = usuarioId || this.currentUserId;
    return from(this.db.getAll<any>('user_notification_preferences')).pipe(
      map(prefs => {
        const userPref = prefs.find(p => p.usuarioId === uid);
        if (userPref) {
          return this.transformPreferencesFromBackend(userPref);
        }
        return this.getDefaultPreferences();
      })
    );
  }

  updatePreferences(preferences: UserNotificationPreferences, usuarioId?: string): Observable<UserNotificationPreferences> {
    const uid = usuarioId || this.currentUserId;
    return from(this.db.getAll<any>('user_notification_preferences')).pipe(
      map(async prefs => {
        const existing = prefs.find(p => p.usuarioId === uid);
        const payload = this.transformPreferencesToBackend({ ...preferences, usuarioId: uid });

        if (existing) {
          await this.db.put('user_notification_preferences', { ...existing, ...payload });
        } else {
          await this.db.add('user_notification_preferences', payload);
        }

        return this.transformPreferencesFromBackend(payload);
      }),
      map(promise => promise as any)
    );
  }

  private transformPreferencesFromBackend(prefs: any): UserNotificationPreferences {
    return {
      ...prefs,
      horarioNoMolestarDias: prefs.horarioNoMolestarDias
        ? (typeof prefs.horarioNoMolestarDias === 'string'
            ? JSON.parse(prefs.horarioNoMolestarDias)
            : prefs.horarioNoMolestarDias)
        : [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
      preferenciasPorEntidad: prefs.preferenciasPorEntidad
        ? (typeof prefs.preferenciasPorEntidad === 'string'
            ? JSON.parse(prefs.preferenciasPorEntidad)
            : prefs.preferenciasPorEntidad)
        : {},
      preferenciasPorModulo: prefs.preferenciasPorModulo
        ? (typeof prefs.preferenciasPorModulo === 'string'
            ? JSON.parse(prefs.preferenciasPorModulo)
            : prefs.preferenciasPorModulo)
        : {}
    };
  }

  private transformPreferencesToBackend(prefs: UserNotificationPreferences): any {
    return {
      ...prefs,
      horarioNoMolestarDias: prefs.horarioNoMolestarDias
        ? JSON.stringify(prefs.horarioNoMolestarDias)
        : null,
      preferenciasPorEntidad: prefs.preferenciasPorEntidad
        ? JSON.stringify(prefs.preferenciasPorEntidad)
        : null,
      preferenciasPorModulo: prefs.preferenciasPorModulo
        ? JSON.stringify(prefs.preferenciasPorModulo)
        : null
    };
  }

  private getDefaultPreferences(): UserNotificationPreferences {
    return {
      habilitado: true,
      emailHabilitado: true,
      inAppHabilitado: true,
      notificarInfo: true,
      notificarWarning: true,
      notificarCritical: true,
      frecuenciaEmail: 'inmediato',
      horaResumen: '09:00',
      horarioNoMolestarHabilitado: false,
      horarioNoMolestarInicio: '22:00',
      horarioNoMolestarFin: '07:00',
      horarioNoMolestarDias: [1, 2, 3, 4, 5],
      rateLimitHabilitado: true,
      rateLimitMaxPorHora: 100
    };
  }

  // ============================================================
  // NOTIFICATION RULES
  // ============================================================

  getNotificationRules(): Observable<NotificationRule[]> {
    return from(this.db.getAll<NotificationRule>('notification_rules'));
  }

  getNotificationRule(id: string): Observable<NotificationRule> {
    return from(this.db.get<NotificationRule>('notification_rules', id)).pipe(
      filter((rule): rule is NotificationRule => rule !== undefined)
    );
  }

  createNotificationRule(rule: Partial<NotificationRule>): Observable<NotificationRule> {
    const newRule = {
      ...rule,
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    } as NotificationRule;
    return from(this.db.add('notification_rules', newRule));
  }

  updateNotificationRule(id: string, rule: Partial<NotificationRule>): Observable<NotificationRule> {
    return from(this.db.get<NotificationRule>('notification_rules', id)).pipe(
      map(async existing => {
        const updated = { ...existing, ...rule, id, fechaModificacion: new Date() };
        await this.db.put('notification_rules', updated);
        return updated;
      }),
      map(promise => promise as any)
    );
  }

  deleteNotificationRule(id: string): Observable<void> {
    return from(this.db.delete('notification_rules', id));
  }

  toggleNotificationRule(id: string): Observable<{ activo: boolean }> {
    return from(this.db.get<NotificationRule>('notification_rules', id)).pipe(
      filter((rule): rule is NotificationRule => rule !== undefined),
      switchMap(async rule => {
        const updated = { ...rule, activo: !rule.activo, fechaModificacion: new Date() };
        await this.db.put('notification_rules', updated);
        return { activo: updated.activo };
      })
    );
  }

  // ============================================================
  // ALERT RULES
  // ============================================================

  getAlertRules(): Observable<AlertRule[]> {
    return from(this.db.getAll<AlertRule>('alert_rules'));
  }

  getAlertRule(id: string): Observable<AlertRule> {
    return from(this.db.get<AlertRule>('alert_rules', id)).pipe(
      filter((rule): rule is AlertRule => rule !== undefined)
    );
  }

  createAlertRule(rule: Partial<AlertRule>): Observable<AlertRule> {
    const newRule = {
      ...rule,
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    } as AlertRule;
    return from(this.db.add('alert_rules', newRule));
  }

  updateAlertRule(id: string, rule: Partial<AlertRule>): Observable<AlertRule> {
    return from(this.db.get<AlertRule>('alert_rules', id)).pipe(
      map(async existing => {
        const updated = { ...existing, ...rule, id, fechaModificacion: new Date() };
        await this.db.put('alert_rules', updated);
        return updated;
      }),
      map(promise => promise as any)
    );
  }

  deleteAlertRule(id: string): Observable<void> {
    return from(this.db.delete('alert_rules', id));
  }

  toggleAlertRule(id: string): Observable<{ activo: boolean }> {
    return from(this.db.get<AlertRule>('alert_rules', id)).pipe(
      filter((rule): rule is AlertRule => rule !== undefined),
      switchMap(async rule => {
        const updated = { ...rule, activo: !rule.activo, fechaModificacion: new Date() };
        await this.db.put('alert_rules', updated);
        return { activo: updated.activo };
      })
    );
  }

  // ============================================================
  // EXPIRATION RULES
  // ============================================================

  getExpirationRules(): Observable<ExpirationRule[]> {
    return from(this.db.getAll<ExpirationRule>('expiration_rules'));
  }

  getExpirationRule(id: string): Observable<ExpirationRule> {
    return from(this.db.get<ExpirationRule>('expiration_rules', id)).pipe(
      filter((rule): rule is ExpirationRule => rule !== undefined)
    );
  }

  createExpirationRule(rule: Partial<ExpirationRule>): Observable<ExpirationRule> {
    const newRule = {
      ...rule,
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    } as ExpirationRule;
    return from(this.db.add('expiration_rules', newRule));
  }

  updateExpirationRule(id: string, rule: Partial<ExpirationRule>): Observable<ExpirationRule> {
    return from(this.db.get<ExpirationRule>('expiration_rules', id)).pipe(
      map(async existing => {
        const updated = { ...existing, ...rule, id, fechaModificacion: new Date() };
        await this.db.put('expiration_rules', updated);
        return updated;
      }),
      map(promise => promise as any)
    );
  }

  deleteExpirationRule(id: string): Observable<void> {
    return from(this.db.delete('expiration_rules', id));
  }

  toggleExpirationRule(id: string): Observable<{ activo: boolean }> {
    return from(this.db.get<ExpirationRule>('expiration_rules', id)).pipe(
      filter((rule): rule is ExpirationRule => rule !== undefined),
      switchMap(async rule => {
        const updated = { ...rule, activo: !rule.activo, fechaModificacion: new Date() };
        await this.db.put('expiration_rules', updated);
        return { activo: updated.activo };
      })
    );
  }

  // ============================================================
  // LOGS
  // ============================================================

  getLogs(params?: { page?: number; limit?: number; estado?: string; canal?: string }): Observable<NotificationLog[]> {
    return from(this.db.getAll<NotificationLog>('notification_logs')).pipe(
      map(logs => {
        let filtered = logs;
        if (params?.estado) {
          filtered = filtered.filter(l => l.estado === params.estado);
        }
        if (params?.canal) {
          filtered = filtered.filter(l => l.canal === params.canal);
        }
        // Sort by date descending
        filtered.sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
        // Pagination
        const page = params?.page || 1;
        const limit = params?.limit || 50;
        const start = (page - 1) * limit;
        return filtered.slice(start, start + limit);
      })
    );
  }

  // ============================================================
  // INBOX
  // ============================================================

  getInbox(usuarioId?: string): Observable<Notification[]> {
    const uid = usuarioId || this.currentUserId;
    return from(this.db.getAll<Notification>('notifications')).pipe(
      map(notifications => {
        return notifications
          .filter(n => n.usuarioId === uid && !n.archivada)
          .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
      })
    );
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return from(this.db.get<Notification>('notifications', notificationId)).pipe(
      map(async notification => {
        const updated = { ...notification, leida: true, fechaLeida: new Date() };
        await this.db.put('notifications', updated);
        return updated;
      }),
      map(promise => promise as any)
    );
  }

  markAllAsRead(usuarioId?: string): Observable<void> {
    const uid = usuarioId || this.currentUserId;
    return from(this.db.getAll<Notification>('notifications')).pipe(
      map(async notifications => {
        const userNotifications = notifications.filter(n => n.usuarioId === uid && !n.leida);
        for (const notification of userNotifications) {
          await this.db.put('notifications', { ...notification, leida: true, fechaLeida: new Date() });
        }
      }),
      map(() => void 0)
    );
  }

  // ============================================================
  // ENTITY TREE
  // ============================================================

  getEntityTree(): Observable<EntityTreeNode[]> {
    // Return a static entity tree structure
    return of([
      {
        key: 'activos',
        label: 'Activos',
        icon: 'pi pi-server',
        selectable: false,
        children: [
          { key: 'activos_hardware', label: 'Hardware', selectable: true },
          { key: 'activos_software', label: 'Software', selectable: true },
          { key: 'activos_datos', label: 'Datos', selectable: true },
          { key: 'activos_servicios', label: 'Servicios', selectable: true }
        ]
      },
      {
        key: 'riesgos',
        label: 'Riesgos',
        icon: 'pi pi-exclamation-triangle',
        selectable: true
      },
      {
        key: 'incidentes',
        label: 'Incidentes',
        icon: 'pi pi-bolt',
        selectable: true
      },
      {
        key: 'defectos',
        label: 'Defectos',
        icon: 'pi pi-bug',
        selectable: true
      },
      {
        key: 'cuestionarios',
        label: 'Cuestionarios',
        icon: 'pi pi-list-check',
        selectable: true
      },
      {
        key: 'procesos',
        label: 'Procesos',
        icon: 'pi pi-sitemap',
        selectable: true
      },
      {
        key: 'proyectos',
        label: 'Proyectos',
        icon: 'pi pi-folder',
        selectable: true
      }
    ]);
  }

  // ============================================================
  // SCHEDULER (Stub - No backend needed)
  // ============================================================

  getSchedulerStatus(): Observable<any[]> {
    // Return mock scheduler status
    return of([
      { name: 'expiration-check', status: 'active', lastRun: new Date(), nextRun: new Date(Date.now() + 3600000) },
      { name: 'email-digest', status: 'active', lastRun: new Date(), nextRun: new Date(Date.now() + 86400000) }
    ]);
  }

  runSchedulerJob(jobName: string): Observable<any> {
    // Mock running a job
    return of({ success: true, job: jobName, message: 'Job ejecutado correctamente (modo demo)' });
  }

  // ============================================================
  // TRIGGERS
  // ============================================================

  sendTestNotification(usuarioId: string, severidad: string = 'info'): Observable<any> {
    const notification: Notification = {
      id: 'test-' + Date.now(),
      usuarioId,
      tipo: 'test',
      titulo: 'Notificación de prueba',
      mensaje: `Esta es una notificación de prueba con severidad ${severidad}`,
      severidad,
      leida: false,
      archivada: false,
      enSeguimiento: false,
      fechaCreacion: new Date()
    };

    return from(this.db.add('notifications', notification)).pipe(
      map(() => ({ success: true, notification }))
    );
  }

  triggerEvent(eventoTipo: string, entidadTipo: string, entidadId: string, entidadData?: any): Observable<any> {
    // In demo mode, just create a notification for the event
    const notification: Notification = {
      id: 'event-' + Date.now(),
      usuarioId: this.currentUserId,
      tipo: eventoTipo,
      titulo: `Evento: ${eventoTipo}`,
      mensaje: `Se ha disparado el evento ${eventoTipo} para ${entidadTipo} (${entidadId})`,
      severidad: 'info',
      entidadTipo,
      entidadId,
      leida: false,
      archivada: false,
      enSeguimiento: false,
      fechaCreacion: new Date()
    };

    return from(this.db.add('notifications', notification)).pipe(
      map(() => ({ success: true, processed: 1 }))
    );
  }
}
