import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

// Types
export type NotificationType = 'NOTIFICATION' | 'ALERT' | 'EXPIRATION_REMINDER' | 'OVERDUE' | 'APPROVAL_REQUEST' | 'riesgo' | 'control' | 'cuestionario' | 'incidente' | 'cumplimiento' | 'aprobacion' | 'alerta' | 'kpi-alert' | 'chat';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface NotificationAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  callback?: () => void;
  action?: string;
  url?: string;
}

export interface NotificationAttachment {
  type: 'image' | 'document';
  url: string;
  title?: string;
  subtitle?: string;
}

export interface Notification {
  id: string;
  tipo: NotificationType;
  usuario: {
    nombre: string;
    avatar?: string;
  };
  titulo?: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  enSeguimiento: boolean;
  archivada: boolean;
  attachment?: NotificationAttachment;
  actions?: NotificationAction[];
  // Campos para alertas KPI
  kpiId?: string;
  objetivoId?: string;
  severity?: AlertSeverity;
  metadata?: Record<string, unknown>;
  // Campos del backend
  entidadTipo?: string;
  entidadId?: string;
  entidadNombre?: string;
}

export interface KPIAlertNotification {
  kpiId: string;
  kpiNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  severity: AlertSeverity;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  tipoViolacion: 'bajo_minimo' | 'sobre_maximo';
}

// Interfaz para la respuesta del backend
interface BackendNotification {
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
  attachmentTipo?: string;
  attachmentUrl?: string;
  attachmentTitulo?: string;
  attachmentSubtitulo?: string;
  metadata?: string;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService implements OnDestroy {
  private apiService = inject(ApiService);

  // ID del usuario actual (temporal - usar auth service cuando esté disponible)
  private currentUserId = 'user-ciso'; // Roberto Torres - CISO

  // Intervalo de polling (30 segundos)
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly POLLING_MS = 30000;

  // Signal principal de notificaciones
  private _notifications = signal<Notification[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Computed para exponer las notificaciones como readonly
  readonly notifications = computed(() => this._notifications());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  // Contador de no leídas
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.leida && !n.archivada).length
  );

  // Contador de alertas KPI activas
  readonly kpiAlertsCount = computed(() =>
    this._notifications().filter(n =>
      (n.tipo === 'kpi-alert' || n.tipo === 'ALERT') && !n.leida
    ).length
  );

  // Alertas críticas no leídas
  readonly criticalAlertsCount = computed(() =>
    this._notifications().filter(n =>
      (n.tipo === 'kpi-alert' || n.tipo === 'ALERT') &&
      n.severity === 'critical' &&
      !n.leida
    ).length
  );

  // Contador de seguimiento
  readonly followingCount = computed(() =>
    this._notifications().filter(n => n.enSeguimiento && !n.archivada).length
  );

  // Contador de archivadas
  readonly archivedCount = computed(() =>
    this._notifications().filter(n => n.archivada).length
  );

  constructor() {
    // Cargar notificaciones al iniciar
    this.loadNotifications();
    // Iniciar polling
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // Iniciar polling
  private startPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.loadNotifications(true);
    }, this.POLLING_MS);
  }

  // Detener polling
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Cargar notificaciones desde el backend
  async loadNotifications(silent: boolean = false): Promise<void> {
    if (!silent) {
      this._loading.set(true);
    }
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.apiService.getNotificationsInbox({ archivada: false })
      );

      const notifications = (response.data || response || []).map((n: BackendNotification) =>
        this.transformBackendNotification(n)
      );

      this._notifications.set(notifications);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      this._error.set(err.message || 'Error al cargar notificaciones');

      // Si falla, mantener datos de ejemplo para desarrollo
      if (this._notifications().length === 0) {
        this._notifications.set(this.getMockNotifications());
      }
    } finally {
      this._loading.set(false);
    }
  }

  // Transformar notificación del backend al formato del frontend
  private transformBackendNotification(backend: BackendNotification): Notification {
    let actions: NotificationAction[] = [];
    if (backend.acciones) {
      try {
        const parsed = JSON.parse(backend.acciones);
        actions = parsed.map((a: any) => ({
          label: a.label,
          type: a.tipo || a.type || 'primary',
          action: a.action,
          url: a.url
        }));
      } catch (e) {
        console.warn('Error parsing actions:', e);
      }
    }

    let attachment: NotificationAttachment | undefined;
    if (backend.attachmentUrl) {
      attachment = {
        type: (backend.attachmentTipo as 'image' | 'document') || 'document',
        url: backend.attachmentUrl,
        title: backend.attachmentTitulo,
        subtitle: backend.attachmentSubtitulo
      };
    }

    let metadata: Record<string, unknown> = {};
    if (backend.metadata) {
      try {
        metadata = JSON.parse(backend.metadata);
      } catch (e) {
        console.warn('Error parsing metadata:', e);
      }
    }

    return {
      id: backend.id,
      tipo: backend.tipo as NotificationType,
      usuario: {
        nombre: this.getUsuarioNombre(backend.tipo),
        avatar: undefined
      },
      titulo: backend.titulo,
      mensaje: backend.mensaje,
      fecha: new Date(backend.fechaCreacion),
      leida: backend.leida,
      enSeguimiento: backend.enSeguimiento,
      archivada: backend.archivada,
      severity: backend.severidad as AlertSeverity,
      entidadTipo: backend.entidadTipo,
      entidadId: backend.entidadId,
      entidadNombre: backend.entidadNombre,
      actions,
      attachment,
      metadata
    };
  }

  // Obtener nombre de usuario según tipo de notificación
  private getUsuarioNombre(tipo: string): string {
    switch (tipo) {
      case 'ALERT':
      case 'kpi-alert':
        return 'Sistema de Alertas';
      case 'EXPIRATION_REMINDER':
      case 'OVERDUE':
        return 'Sistema de Vencimientos';
      case 'APPROVAL_REQUEST':
        return 'Sistema de Aprobaciones';
      default:
        return 'Sistema ORCA';
    }
  }

  // Agregar una notificación
  async addNotification(notification: Omit<Notification, 'id' | 'fecha' | 'leida' | 'enSeguimiento' | 'archivada'>): Promise<void> {
    try {
      await firstValueFrom(this.apiService.createNotification({
        usuarioId: this.currentUserId,
        tipo: notification.tipo,
        titulo: notification.titulo || '',
        mensaje: notification.mensaje,
        severidad: notification.severity || 'info',
        entidadTipo: notification.entidadTipo,
        entidadId: notification.entidadId,
        entidadNombre: notification.entidadNombre,
        acciones: notification.actions ? JSON.stringify(notification.actions) : undefined,
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : undefined
      }));

      // Recargar notificaciones
      await this.loadNotifications(true);
    } catch (err) {
      console.error('Error adding notification:', err);
      // Fallback: agregar localmente
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fecha: new Date(),
        leida: false,
        enSeguimiento: false,
        archivada: false
      };
      this._notifications.update(notifs => [newNotification, ...notifs]);
    }
  }

  // Agregar alerta de KPI
  addKPIAlert(alert: KPIAlertNotification): void {
    const notification: Omit<Notification, 'id' | 'fecha' | 'leida' | 'enSeguimiento' | 'archivada'> = {
      tipo: 'ALERT',
      usuario: {
        nombre: 'Sistema de Alertas',
        avatar: undefined
      },
      titulo: `Alerta: ${alert.kpiNombre}`,
      mensaje: alert.mensaje,
      kpiId: alert.kpiId,
      objetivoId: alert.objetivoId,
      severity: alert.severity,
      entidadTipo: 'KPI',
      entidadNombre: alert.kpiNombre,
      metadata: {
        kpiNombre: alert.kpiNombre,
        objetivoNombre: alert.objetivoNombre,
        valorActual: alert.valorActual,
        valorUmbral: alert.valorUmbral,
        tipoViolacion: alert.tipoViolacion
      },
      actions: [
        { label: 'Ver detalle', type: 'primary' },
        { label: 'Descartar', type: 'secondary' }
      ]
    };

    this.addNotification(notification);
  }

  // Marcar como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.markNotificationAsRead(notificationId));
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
      // Actualizar localmente de todos modos
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
    }
  }

  // Marcar todas como leídas
  async markAllAsRead(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.markAllNotificationsAsRead());
      this._notifications.update(notifs =>
        notifs.map(n => ({ ...n, leida: true }))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
      // Actualizar localmente de todos modos
      this._notifications.update(notifs =>
        notifs.map(n => ({ ...n, leida: true }))
      );
    }
  }

  // Eliminar notificación
  async removeNotification(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.deleteNotification(notificationId));
      this._notifications.update(notifs =>
        notifs.filter(n => n.id !== notificationId)
      );
    } catch (err) {
      console.error('Error removing notification:', err);
      // Remover localmente de todos modos
      this._notifications.update(notifs =>
        notifs.filter(n => n.id !== notificationId)
      );
    }
  }

  // Toggle seguimiento
  async toggleSeguimiento(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.toggleNotificationFollow(notificationId));
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, enSeguimiento: !n.enSeguimiento } : n
        )
      );
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Actualizar localmente
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, enSeguimiento: !n.enSeguimiento } : n
        )
      );
    }
  }

  // Archivar notificación
  async archivarNotification(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.toggleNotificationArchive(notificationId));
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, archivada: true } : n
        )
      );
    } catch (err) {
      console.error('Error archiving:', err);
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, archivada: true } : n
        )
      );
    }
  }

  // Desarchivar notificación
  async desarchivarNotification(notificationId: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.toggleNotificationArchive(notificationId));
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, archivada: false } : n
        )
      );
    } catch (err) {
      console.error('Error unarchiving:', err);
      this._notifications.update(notifs =>
        notifs.map(n =>
          n.id === notificationId ? { ...n, archivada: false } : n
        )
      );
    }
  }

  // Limpiar alertas de KPI
  clearKPIAlerts(): void {
    const kpiAlerts = this._notifications().filter(n =>
      n.tipo === 'kpi-alert' || n.tipo === 'ALERT'
    );

    // Eliminar cada alerta KPI
    kpiAlerts.forEach(alert => {
      this.removeNotification(alert.id);
    });
  }

  // Obtener notificaciones filtradas por tipo
  getNotificationsByType(tipo: NotificationType): Notification[] {
    return this._notifications().filter(n => n.tipo === tipo);
  }

  // Obtener alertas KPI de un objetivo específico
  getKPIAlertsByObjective(objetivoId: string): Notification[] {
    return this._notifications().filter(n =>
      (n.tipo === 'kpi-alert' || n.tipo === 'ALERT') && n.objetivoId === objetivoId
    );
  }

  // Cargar notificaciones archivadas
  async loadArchivedNotifications(): Promise<Notification[]> {
    try {
      const response = await firstValueFrom(
        this.apiService.getNotificationsInbox({ archivada: true })
      );

      return (response.data || response || []).map((n: BackendNotification) =>
        this.transformBackendNotification(n)
      );
    } catch (err) {
      console.error('Error loading archived notifications:', err);
      return [];
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<any> {
    try {
      return await firstValueFrom(this.apiService.getNotificationStats());
    } catch (err) {
      console.error('Error getting stats:', err);
      return {
        total: this._notifications().length,
        noLeidas: this.unreadCount(),
        enSeguimiento: this.followingCount(),
        archivadas: this.archivedCount()
      };
    }
  }

  // Datos mock para desarrollo (fallback)
  private getMockNotifications(): Notification[] {
    return [
      {
        id: 'kpi-alert-1',
        tipo: 'ALERT',
        usuario: { nombre: 'Sistema de Alertas' },
        titulo: 'Alerta KPI',
        mensaje: 'El KPI "Tasa de cumplimiento normativo" está por debajo del umbral mínimo (45.2% < 70%)',
        fecha: new Date(Date.now() - 15 * 60 * 1000),
        leida: false,
        enSeguimiento: false,
        archivada: false,
        severity: 'critical',
        kpiId: 'kpi-001',
        objetivoId: 'obj-001',
        metadata: {
          kpiNombre: 'Tasa de cumplimiento normativo',
          objetivoNombre: 'Cumplimiento regulatorio',
          valorActual: 45.2,
          valorUmbral: 70,
          tipoViolacion: 'bajo_minimo'
        },
        actions: [
          { label: 'Ver detalle', type: 'primary' },
          { label: 'Descartar', type: 'secondary' }
        ]
      },
      {
        id: 'notif-1',
        tipo: 'NOTIFICATION',
        usuario: { nombre: 'Sistema ORCA' },
        titulo: 'Nuevo riesgo identificado',
        mensaje: 'Se ha identificado un nuevo riesgo crítico en el Core Banking System.',
        fecha: new Date(Date.now() - 30 * 60 * 1000),
        leida: false,
        enSeguimiento: false,
        archivada: false,
        severity: 'critical',
        entidadTipo: 'RISK',
        entidadNombre: 'Acceso no autorizado a CBS'
      },
      {
        id: 'exp-1',
        tipo: 'EXPIRATION_REMINDER',
        usuario: { nombre: 'Sistema de Vencimientos' },
        titulo: 'Cuestionario próximo a vencer',
        mensaje: 'El cuestionario "Auditoría AML/PLD Semestral" vence en 7 días.',
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
        leida: false,
        enSeguimiento: false,
        archivada: false,
        severity: 'warning',
        entidadTipo: 'QUESTIONNAIRE'
      },
      {
        id: 'approval-1',
        tipo: 'APPROVAL_REQUEST',
        usuario: { nombre: 'Sistema de Aprobaciones' },
        titulo: 'Respuesta pendiente de aprobación',
        mensaje: 'Patricia Reyes Solís ha completado el cuestionario AML y requiere tu aprobación.',
        fecha: new Date(Date.now() - 5 * 60 * 60 * 1000),
        leida: false,
        enSeguimiento: false,
        archivada: false,
        severity: 'info',
        entidadTipo: 'QUESTIONNAIRE',
        actions: [
          { label: 'Aprobar', type: 'primary', action: 'approve' },
          { label: 'Rechazar', type: 'danger', action: 'reject' },
          { label: 'Ver detalles', type: 'secondary', url: '/cumplimiento/revisiones' }
        ]
      }
    ];
  }
}
