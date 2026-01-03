import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';

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
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/notifications';

  private getHeaders(usuarioId?: string): HttpHeaders {
    let headers = new HttpHeaders();
    if (usuarioId) {
      headers = headers.set('X-User-Id', usuarioId);
    }
    return headers;
  }

  // ============================================================
  // PREFERENCIAS DE USUARIO
  // ============================================================

  getPreferences(usuarioId?: string): Observable<UserNotificationPreferences> {
    const headers = this.getHeaders(usuarioId);
    return this.http.get<UserNotificationPreferences>(`${this.baseUrl}/preferences`, { headers }).pipe(
      map(prefs => this.transformPreferencesFromBackend(prefs)),
      catchError(() => of(this.getDefaultPreferences()))
    );
  }

  updatePreferences(preferences: UserNotificationPreferences, usuarioId?: string): Observable<UserNotificationPreferences> {
    const headers = this.getHeaders(usuarioId);
    const payload = this.transformPreferencesToBackend(preferences);
    return this.http.put<UserNotificationPreferences>(`${this.baseUrl}/preferences`, payload, { headers }).pipe(
      map(prefs => this.transformPreferencesFromBackend(prefs))
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
    return this.http.get<NotificationRule[]>(`${this.baseUrl}/rules`).pipe(
      catchError(() => of([]))
    );
  }

  getNotificationRule(id: string): Observable<NotificationRule> {
    return this.http.get<NotificationRule>(`${this.baseUrl}/rules/${id}`);
  }

  createNotificationRule(rule: Partial<NotificationRule>): Observable<NotificationRule> {
    return this.http.post<NotificationRule>(`${this.baseUrl}/rules`, rule);
  }

  updateNotificationRule(id: string, rule: Partial<NotificationRule>): Observable<NotificationRule> {
    return this.http.put<NotificationRule>(`${this.baseUrl}/rules/${id}`, rule);
  }

  deleteNotificationRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rules/${id}`);
  }

  toggleNotificationRule(id: string): Observable<{ activo: boolean }> {
    return this.http.patch<{ activo: boolean }>(`${this.baseUrl}/rules/${id}/toggle`, {});
  }

  // ============================================================
  // ALERT RULES
  // ============================================================

  getAlertRules(): Observable<AlertRule[]> {
    return this.http.get<AlertRule[]>(`${this.baseUrl}/alerts`).pipe(
      catchError(() => of([]))
    );
  }

  getAlertRule(id: string): Observable<AlertRule> {
    return this.http.get<AlertRule>(`${this.baseUrl}/alerts/${id}`);
  }

  createAlertRule(rule: Partial<AlertRule>): Observable<AlertRule> {
    return this.http.post<AlertRule>(`${this.baseUrl}/alerts`, rule);
  }

  updateAlertRule(id: string, rule: Partial<AlertRule>): Observable<AlertRule> {
    return this.http.put<AlertRule>(`${this.baseUrl}/alerts/${id}`, rule);
  }

  deleteAlertRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/alerts/${id}`);
  }

  toggleAlertRule(id: string): Observable<{ activo: boolean }> {
    return this.http.patch<{ activo: boolean }>(`${this.baseUrl}/alerts/${id}/toggle`, {});
  }

  // ============================================================
  // EXPIRATION RULES
  // ============================================================

  getExpirationRules(): Observable<ExpirationRule[]> {
    return this.http.get<ExpirationRule[]>(`${this.baseUrl}/expiration-rules`).pipe(
      catchError(() => of([]))
    );
  }

  getExpirationRule(id: string): Observable<ExpirationRule> {
    return this.http.get<ExpirationRule>(`${this.baseUrl}/expiration-rules/${id}`);
  }

  createExpirationRule(rule: Partial<ExpirationRule>): Observable<ExpirationRule> {
    return this.http.post<ExpirationRule>(`${this.baseUrl}/expiration-rules`, rule);
  }

  updateExpirationRule(id: string, rule: Partial<ExpirationRule>): Observable<ExpirationRule> {
    return this.http.put<ExpirationRule>(`${this.baseUrl}/expiration-rules/${id}`, rule);
  }

  deleteExpirationRule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expiration-rules/${id}`);
  }

  toggleExpirationRule(id: string): Observable<{ activo: boolean }> {
    return this.http.patch<{ activo: boolean }>(`${this.baseUrl}/expiration-rules/${id}/toggle`, {});
  }

  // ============================================================
  // LOGS
  // ============================================================

  getLogs(params?: { page?: number; limit?: number; estado?: string; canal?: string }): Observable<NotificationLog[]> {
    return this.http.get<NotificationLog[]>(`${this.baseUrl}/logs`, { params: params as any }).pipe(
      catchError(() => of([]))
    );
  }

  // ============================================================
  // INBOX
  // ============================================================

  getInbox(usuarioId?: string): Observable<Notification[]> {
    const headers = this.getHeaders(usuarioId);
    return this.http.get<Notification[]>(`${this.baseUrl}/inbox`, { headers }).pipe(
      catchError(() => of([]))
    );
  }

  markAsRead(notificationId: string): Observable<Notification> {
    return this.http.patch<Notification>(`${this.baseUrl}/inbox/${notificationId}/read`, {});
  }

  markAllAsRead(usuarioId?: string): Observable<void> {
    const headers = this.getHeaders(usuarioId);
    return this.http.post<void>(`${this.baseUrl}/inbox/mark-all-read`, {}, { headers });
  }

  // ============================================================
  // ENTITY TREE
  // ============================================================

  getEntityTree(): Observable<EntityTreeNode[]> {
    return this.http.get<EntityTreeNode[]>(`${this.baseUrl}/entity-tree`).pipe(
      catchError(() => of([]))
    );
  }

  // ============================================================
  // SCHEDULER (Admin)
  // ============================================================

  getSchedulerStatus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/scheduler/status`);
  }

  runSchedulerJob(jobName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/scheduler/run/${jobName}`, {});
  }

  // ============================================================
  // TRIGGERS
  // ============================================================

  sendTestNotification(usuarioId: string, severidad: string = 'info'): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/trigger/test`, { usuarioId, severidad });
  }

  triggerEvent(eventoTipo: string, entidadTipo: string, entidadId: string, entidadData?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/trigger/event`, {
      eventoTipo,
      entidadTipo,
      entidadId,
      entidadData
    });
  }
}
