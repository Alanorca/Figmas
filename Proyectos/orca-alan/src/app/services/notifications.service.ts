import { Injectable, signal, computed } from '@angular/core';

// Types
export type NotificationType = 'riesgo' | 'control' | 'cuestionario' | 'incidente' | 'cumplimiento' | 'aprobacion' | 'alerta' | 'kpi-alert' | 'chat';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface NotificationAction {
  label: string;
  type: 'primary' | 'secondary';
  callback?: () => void;
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

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  // Signal principal de notificaciones
  private _notifications = signal<Notification[]>([
    // Alertas KPI de ejemplo
    {
      id: 'kpi-alert-1',
      tipo: 'kpi-alert',
      usuario: {
        nombre: 'Sistema de Alertas'
      },
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
      id: 'kpi-alert-2',
      tipo: 'kpi-alert',
      usuario: {
        nombre: 'Sistema de Alertas'
      },
      mensaje: 'El KPI "Tiempo de respuesta a incidentes" excede el umbral máximo (125% > 100%)',
      fecha: new Date(Date.now() - 45 * 60 * 1000),
      leida: false,
      enSeguimiento: false,
      archivada: false,
      severity: 'warning',
      kpiId: 'kpi-002',
      objetivoId: 'obj-002',
      metadata: {
        kpiNombre: 'Tiempo de respuesta a incidentes',
        objetivoNombre: 'Gestión de incidentes',
        valorActual: 125,
        valorUmbral: 100,
        tipoViolacion: 'sobre_maximo'
      },
      actions: [
        { label: 'Ver detalle', type: 'primary' },
        { label: 'Descartar', type: 'secondary' }
      ]
    },
    {
      id: 'kpi-alert-3',
      tipo: 'kpi-alert',
      usuario: {
        nombre: 'Sistema de Alertas'
      },
      mensaje: 'El KPI "Cobertura de auditoría" está por debajo del umbral mínimo (58% < 80%)',
      fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
      leida: false,
      enSeguimiento: true,
      archivada: false,
      severity: 'critical',
      kpiId: 'kpi-003',
      objetivoId: 'obj-003',
      metadata: {
        kpiNombre: 'Cobertura de auditoría',
        objetivoNombre: 'Control interno',
        valorActual: 58,
        valorUmbral: 80,
        tipoViolacion: 'bajo_minimo'
      },
      actions: [
        { label: 'Ver detalle', type: 'primary' },
        { label: 'Descartar', type: 'secondary' }
      ]
    },
    // Notificaciones de Chat de ejemplo
    {
      id: 'chat-1',
      tipo: 'chat',
      usuario: {
        nombre: 'María López',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-6.png'
      },
      mensaje: 'Nuevo mensaje en "Evaluación ISO 27001": Hola equipo, ya completé la sección de controles de acceso. ¿Pueden revisarla?',
      fecha: new Date(Date.now() - 10 * 60 * 1000),
      leida: false,
      enSeguimiento: false,
      archivada: false,
      metadata: {
        asignacionId: 'asig-001',
        cuestionarioId: 'cuest-iso-27001',
        mensajeCompleto: 'Hola equipo, ya completé la sección de controles de acceso. ¿Pueden revisarla cuando tengan un momento?'
      }
    },
    {
      id: 'chat-2',
      tipo: 'chat',
      usuario: {
        nombre: 'Carlos Mendoza',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-m-2.png'
      },
      mensaje: 'Nuevo mensaje en "Cumplimiento SOX Q4": Adjunté las evidencias del control A.5.2. Falta la firma del comité.',
      fecha: new Date(Date.now() - 25 * 60 * 1000),
      leida: false,
      enSeguimiento: false,
      archivada: false,
      metadata: {
        asignacionId: 'asig-002',
        cuestionarioId: 'cuest-sox-q4',
        mensajeCompleto: 'Adjunté las evidencias del control A.5.2. Falta la firma del comité para completar esta sección.'
      }
    },
    {
      id: 'chat-3',
      tipo: 'chat',
      usuario: {
        nombre: 'Ana Rodríguez',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-10.png'
      },
      mensaje: 'Nuevo mensaje en "Auditoría Interna": @Carlos, ¿puedes validar el hallazgo del control de segregación de funciones?',
      fecha: new Date(Date.now() - 1 * 60 * 60 * 1000),
      leida: false,
      enSeguimiento: true,
      archivada: false,
      metadata: {
        asignacionId: 'asig-003',
        cuestionarioId: 'cuest-auditoria',
        mensajeCompleto: '@Carlos, ¿puedes validar el hallazgo del control de segregación de funciones? Necesito tu opinión antes de cerrar.'
      }
    },
    // Notificaciones generales de ejemplo
    {
      id: '1',
      tipo: 'riesgo',
      usuario: {
        nombre: 'María López',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-6.png'
      },
      mensaje: 'Te ha asignado el cuestionario de evaluación ISO 27001 - Controles de Acceso. Fecha límite: 25 de diciembre.',
      fecha: new Date(Date.now() - 30 * 60 * 1000),
      leida: false,
      enSeguimiento: false,
      archivada: false
    },
    {
      id: '2',
      tipo: 'control',
      usuario: {
        nombre: 'Carlos Mendoza',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-m-2.png'
      },
      mensaje: 'Ha identificado un nuevo riesgo crítico en el proceso de gestión de accesos que requiere tu revisión.',
      fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
      leida: false,
      enSeguimiento: true,
      archivada: false,
      attachment: {
        type: 'image',
        url: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/feed/feed-image.jpg',
        title: 'Riesgo RSG-2024-089: Vulnerabilidad en sistema de autenticación',
        subtitle: '18 Dic a las 03:45 PM'
      }
    },
    {
      id: '3',
      tipo: 'aprobacion',
      usuario: {
        nombre: 'Ana Rodríguez',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-10.png'
      },
      mensaje: 'Ha enviado una solicitud de tratamiento de riesgo que requiere tu aprobación para el área de Operaciones.',
      fecha: new Date(Date.now() - 5 * 60 * 60 * 1000),
      leida: false,
      enSeguimiento: false,
      archivada: false,
      actions: [
        { label: 'Rechazar', type: 'secondary' },
        { label: 'Aprobar', type: 'primary' }
      ]
    },
    {
      id: '4',
      tipo: 'incidente',
      usuario: {
        nombre: 'Roberto Sánchez',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-4.png'
      },
      mensaje: 'Ha reportado un incidente de seguridad: Intento de acceso no autorizado al sistema de nómina.',
      fecha: new Date(Date.now() - 26 * 60 * 60 * 1000),
      leida: true,
      enSeguimiento: false,
      archivada: false
    },
    {
      id: '5',
      tipo: 'cumplimiento',
      usuario: {
        nombre: 'Laura García',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-1.png'
      },
      mensaje: 'Ha completado la evaluación de controles SOX Q4 2024 con un 94% de cumplimiento.',
      fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      leida: true,
      enSeguimiento: false,
      archivada: false
    }
  ]);

  // Computed para exponer las notificaciones como readonly
  readonly notifications = computed(() => this._notifications());

  // Contador de no leídas
  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.leida).length
  );

  // Contador de alertas KPI activas
  readonly kpiAlertsCount = computed(() =>
    this._notifications().filter(n => n.tipo === 'kpi-alert' && !n.leida).length
  );

  // Alertas críticas no leídas
  readonly criticalAlertsCount = computed(() =>
    this._notifications().filter(n => n.tipo === 'kpi-alert' && n.severity === 'critical' && !n.leida).length
  );

  // Agregar una notificación
  addNotification(notification: Omit<Notification, 'id' | 'fecha' | 'leida' | 'enSeguimiento' | 'archivada'>): void {
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

  // Agregar alerta de KPI
  addKPIAlert(alert: KPIAlertNotification): void {
    const severityLabels: Record<AlertSeverity, string> = {
      info: 'Información',
      warning: 'Advertencia',
      critical: 'Crítico'
    };

    const notification: Omit<Notification, 'id' | 'fecha' | 'leida' | 'enSeguimiento' | 'archivada'> = {
      tipo: 'kpi-alert',
      usuario: {
        nombre: 'Sistema de Alertas',
        avatar: undefined
      },
      mensaje: alert.mensaje,
      kpiId: alert.kpiId,
      objetivoId: alert.objetivoId,
      severity: alert.severity,
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
  markAsRead(notificationId: string): void {
    this._notifications.update(notifs =>
      notifs.map(n =>
        n.id === notificationId ? { ...n, leida: true } : n
      )
    );
  }

  // Marcar todas como leídas
  markAllAsRead(): void {
    this._notifications.update(notifs =>
      notifs.map(n => ({ ...n, leida: true }))
    );
  }

  // Eliminar notificación
  removeNotification(notificationId: string): void {
    this._notifications.update(notifs =>
      notifs.filter(n => n.id !== notificationId)
    );
  }

  // Toggle seguimiento
  toggleSeguimiento(notificationId: string): void {
    this._notifications.update(notifs =>
      notifs.map(n =>
        n.id === notificationId ? { ...n, enSeguimiento: !n.enSeguimiento } : n
      )
    );
  }

  // Archivar notificación
  archivarNotification(notificationId: string): void {
    this._notifications.update(notifs =>
      notifs.map(n =>
        n.id === notificationId ? { ...n, archivada: true } : n
      )
    );
  }

  // Desarchivar notificación
  desarchivarNotification(notificationId: string): void {
    this._notifications.update(notifs =>
      notifs.map(n =>
        n.id === notificationId ? { ...n, archivada: false } : n
      )
    );
  }

  // Contador de seguimiento
  readonly followingCount = computed(() =>
    this._notifications().filter(n => n.enSeguimiento && !n.archivada).length
  );

  // Contador de archivadas
  readonly archivedCount = computed(() =>
    this._notifications().filter(n => n.archivada).length
  );

  // Limpiar alertas de KPI
  clearKPIAlerts(): void {
    this._notifications.update(notifs =>
      notifs.filter(n => n.tipo !== 'kpi-alert')
    );
  }

  // Obtener notificaciones filtradas por tipo
  getNotificationsByType(tipo: NotificationType): Notification[] {
    return this._notifications().filter(n => n.tipo === tipo);
  }

  // Obtener alertas KPI de un objetivo específico
  getKPIAlertsByObjective(objetivoId: string): Notification[] {
    return this._notifications().filter(n =>
      n.tipo === 'kpi-alert' && n.objetivoId === objetivoId
    );
  }
}
