import { CommonModule } from '@angular/common';
import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';

type NotificationType = 'riesgo' | 'control' | 'cuestionario' | 'incidente' | 'cumplimiento' | 'aprobacion' | 'alerta';

interface NotificationAction {
  label: string;
  type: 'primary' | 'secondary';
  callback?: () => void;
}

interface NotificationAttachment {
  type: 'image' | 'document';
  url: string;
  title?: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  tipo: NotificationType;
  usuario: {
    nombre: string;
    avatar?: string;
  };
  mensaje: string;
  fecha: Date;
  leida: boolean;
  attachment?: NotificationAttachment;
  actions?: NotificationAction[];
}

interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    PopoverModule,
    AvatarModule,
    TooltipModule,
    RippleModule
  ],
  template: `
    <!-- Botón de campanita -->
    <button
      class="notification-bell"
      (click)="op.toggle($event)"
      pTooltip="Notificaciones"
      tooltipPosition="bottom"
    >
      <i class="pi pi-bell"></i>
      @if (unreadCount() > 0) {
        <span class="notification-badge">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
      }
    </button>

    <!-- Panel de notificaciones -->
    <p-popover #op [style]="{ width: '420px', padding: '0' }" styleClass="notifications-panel">
      <div class="notifications-container">
        <!-- Tabs -->
        <div class="notifications-tabs">
          <div #scrollContainer class="tabs-scroll">
            <ul class="tabs-list">
              @for (tab of tabs(); track tab.id; let index = $index) {
                <li>
                  <button
                    class="tab-btn"
                    [class.active]="selectedTab() === tab.id"
                    (click)="setActiveTab(index)"
                  >
                    {{ tab.label }}
                  </button>
                </li>
              }
            </ul>
            <div
              class="tab-indicator"
              [style.width.px]="indicatorWidth()"
              [style.transform]="'translateX(' + indicatorLeft() + 'px)'"
            ></div>
          </div>
        </div>

        <!-- Lista de notificaciones -->
        <div class="notifications-list">
          @if (filteredNotifications().length === 0) {
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>No hay notificaciones</p>
            </div>
          } @else {
            <!-- Hoy -->
            @if (todayNotifications().length > 0) {
              <div class="date-group">
                <span class="date-label">TODAY</span>
              </div>
              @for (notif of todayNotifications(); track notif.id) {
                <ng-container *ngTemplateOutlet="notificationItem; context: { $implicit: notif }"></ng-container>
              }
            }

            <!-- Ayer -->
            @if (yesterdayNotifications().length > 0) {
              <div class="date-group">
                <span class="date-label">YESTERDAY</span>
              </div>
              @for (notif of yesterdayNotifications(); track notif.id) {
                <ng-container *ngTemplateOutlet="notificationItem; context: { $implicit: notif }"></ng-container>
              }
            }

            <!-- Anteriores -->
            @if (olderNotifications().length > 0) {
              <div class="date-group">
                <span class="date-label">EARLIER</span>
              </div>
              @for (notif of olderNotifications(); track notif.id) {
                <ng-container *ngTemplateOutlet="notificationItem; context: { $implicit: notif }"></ng-container>
              }
            }
          }
        </div>
      </div>

      <!-- Template de notificación -->
      <ng-template #notificationItem let-notif>
        <div
          class="notification-item"
          [class.unread]="!notif.leida"
          (click)="onNotificationClick(notif)"
          pRipple
        >
          <!-- Avatar -->
          <p-avatar
            [image]="notif.usuario.avatar"
            [label]="!notif.usuario.avatar ? getInitials(notif.usuario.nombre) : undefined"
            shape="circle"
            size="large"
            styleClass="notification-avatar"
          />

          <!-- Content -->
          <div class="notification-content">
            <div class="notification-user">{{ notif.usuario.nombre }}</div>
            <div class="notification-message">{{ notif.mensaje }}</div>

            <!-- Attachment -->
            @if (notif.attachment) {
              <div class="notification-attachment">
                @if (notif.attachment.type === 'image') {
                  <img [src]="notif.attachment.url" [alt]="notif.attachment.title || 'Attachment'" class="attachment-image" />
                }
                @if (notif.attachment.title) {
                  <div class="attachment-info">
                    <div class="attachment-title">{{ notif.attachment.title }}</div>
                    @if (notif.attachment.subtitle) {
                      <div class="attachment-subtitle">{{ notif.attachment.subtitle }}</div>
                    }
                  </div>
                }
              </div>
            }

            <div class="notification-time">{{ formatDate(notif.fecha) }}</div>

            <!-- Actions -->
            @if (notif.actions && notif.actions.length > 0) {
              <div class="notification-actions">
                @for (action of notif.actions; track action.label) {
                  <button
                    class="action-btn"
                    [class.action-primary]="action.type === 'primary'"
                    [class.action-secondary]="action.type === 'secondary'"
                    (click)="onActionClick($event, action)"
                  >
                    {{ action.label }}
                  </button>
                }
              </div>
            }
          </div>
        </div>
      </ng-template>
    </p-popover>
  `,
  styles: [`
    // ============================================================================
    // NOTIFICACIONES - ESTILO BASADO EN DISEÑO DE REFERENCIA
    // ============================================================================

    // ------------------------------------------------------------------------
    // TOKENS DE COLOR - VERDE EMERALD (COLOR PRIMARIO DEL COMPONENTE)
    // ------------------------------------------------------------------------
    $color-primary: var(--emerald-500);
    $color-primary-hover: var(--emerald-600);
    $color-primary-text: var(--emerald-500);
    $color-primary-light: var(--emerald-50);
    $color-primary-100: var(--emerald-100);

    // ------------------------------------------------------------------------
    // TOKENS DE ESPACIADO
    // ------------------------------------------------------------------------
    $spacing-1: 0.25rem;
    $spacing-2: 0.5rem;
    $spacing-3: 0.75rem;
    $spacing-4: 1rem;
    $spacing-5: 1.25rem;
    $spacing-6: 1.5rem;

    // ------------------------------------------------------------------------
    // TOKENS DE TIPOGRAFÍA
    // ------------------------------------------------------------------------
    $font-size-xs: 0.75rem;
    $font-size-sm: 0.8125rem;
    $font-size-base: 0.875rem;
    $font-size-lg: 1rem;

    $font-weight-normal: 400;
    $font-weight-medium: 500;
    $font-weight-semibold: 600;

    // ------------------------------------------------------------------------
    // TOKENS DE BORDES Y SOMBRAS
    // ------------------------------------------------------------------------
    $border-radius-sm: 4px;
    $border-radius-md: 6px;
    $border-radius-lg: 8px;
    $border-radius-xl: 12px;
    $border-radius-full: 9999px;

    $shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

    // ------------------------------------------------------------------------
    // TOKENS DE TRANSICIONES
    // ------------------------------------------------------------------------
    $transition-fast: 150ms ease;
    $transition-normal: 200ms ease;

    // ------------------------------------------------------------------------
    // BOTÓN DE CAMPANITA
    // ------------------------------------------------------------------------
    .notification-bell {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: $border-radius-md;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all $transition-normal;

      &:hover {
        background: var(--surface-100);
      }

      i {
        font-size: 1rem;
        color: var(--surface-600);
        transition: color $transition-fast;
      }

      &:hover i {
        color: var(--surface-900);
      }
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: var(--red-500);
      color: white;
      font-size: 10px;
      font-weight: $font-weight-semibold;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--surface-ground);
    }

    // ------------------------------------------------------------------------
    // CONTENEDOR PRINCIPAL
    // ------------------------------------------------------------------------
    .notifications-container {
      display: flex;
      flex-direction: column;
      max-height: 600px;
      background: var(--surface-0);
      border-radius: $border-radius-xl;
      overflow: hidden;
    }

    // ------------------------------------------------------------------------
    // TABS
    // ------------------------------------------------------------------------
    .notifications-tabs {
      position: relative;
      border-bottom: 1px solid var(--surface-200);
      padding: 0 $spacing-4;
    }

    .tabs-scroll {
      overflow-x: auto;
      position: relative;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    .tabs-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: $spacing-6;
    }

    .tab-btn {
      padding: $spacing-4 0;
      border: none;
      background: none;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      color: #1e293b; // slate-800 - texto oscuro para tabs inactivos
      cursor: pointer;
      white-space: nowrap;
      transition: color $transition-fast;
      position: relative;

      &:hover {
        color: #0f172a; // slate-900
      }

      &.active {
        color: #10B981; // emerald-500 - verde primario para tab activo
        font-weight: $font-weight-semibold;
      }
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: #10B981; // emerald-500
      border-radius: 1px 1px 0 0;
      transition: transform 300ms ease, width 300ms ease;
    }

    // ------------------------------------------------------------------------
    // LISTA DE NOTIFICACIONES
    // ------------------------------------------------------------------------
    .notifications-list {
      flex: 1;
      overflow-y: auto;
      max-height: 520px;
      padding: $spacing-4 $spacing-5;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--surface-300);
        border-radius: 3px;
      }
    }

    .date-group {
      padding: $spacing-3 0 $spacing-4;
    }

    .date-label {
      font-size: $font-size-xs;
      font-weight: $font-weight-medium;
      color: var(--surface-500);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    // ------------------------------------------------------------------------
    // ITEM DE NOTIFICACIÓN
    // ------------------------------------------------------------------------
    .notification-item {
      display: flex;
      gap: $spacing-4;
      padding: $spacing-4 0;
      cursor: pointer;
      transition: opacity $transition-fast;

      &:hover {
        opacity: 0.85;
      }

      &.unread {
        .notification-user {
          color: #10B981; // emerald-500 - verde primario para nombre de usuario no leído
        }
      }
    }

    :host ::ng-deep .notification-avatar {
      width: 48px !important;
      height: 48px !important;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-user {
      font-size: $font-size-base;
      font-weight: $font-weight-semibold;
      color: var(--surface-900);
      margin-bottom: $spacing-1;
    }

    .notification-message {
      font-size: $font-size-base;
      font-weight: $font-weight-normal;
      color: var(--surface-700);
      line-height: 1.5;
      margin-bottom: $spacing-2;
    }

    .notification-time {
      font-size: $font-size-sm;
      color: var(--surface-500);
    }

    // ------------------------------------------------------------------------
    // ATTACHMENT
    // ------------------------------------------------------------------------
    .notification-attachment {
      display: flex;
      gap: $spacing-3;
      padding: $spacing-3;
      margin: $spacing-3 0;
      background: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: $border-radius-lg;
    }

    .attachment-image {
      width: 108px;
      height: 80px;
      border-radius: $border-radius-md;
      object-fit: cover;
    }

    .attachment-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: $spacing-1;
    }

    .attachment-title {
      font-size: $font-size-sm;
      color: var(--surface-900);
      line-height: 1.4;
    }

    .attachment-subtitle {
      font-size: $font-size-xs;
      color: var(--surface-500);
    }

    // ------------------------------------------------------------------------
    // ACTIONS
    // ------------------------------------------------------------------------
    .notification-actions {
      display: flex;
      gap: $spacing-3;
      margin-top: $spacing-4;
    }

    .action-btn {
      flex: 1;
      padding: $spacing-3 $spacing-4;
      border-radius: $border-radius-full;
      font-size: $font-size-base;
      font-weight: $font-weight-medium;
      cursor: pointer;
      transition: all $transition-fast;
      text-align: center;

      // Botón Cancel - fondo gris claro, texto oscuro
      &.action-secondary {
        background: #f1f5f9; // slate-100
        border: 1px solid #e2e8f0; // slate-200
        color: #1e293b; // slate-800 - TEXTO OSCURO

        &:hover {
          background: #e2e8f0; // slate-200
        }
      }

      // Botón Confirm - fondo verde, texto blanco
      &.action-primary {
        background: #10B981; // emerald-500
        border: 1px solid #10B981;
        color: #ffffff; // TEXTO BLANCO

        &:hover {
          background: #059669; // emerald-600
          border-color: #059669;
        }
      }
    }

    // ------------------------------------------------------------------------
    // ESTADO VACÍO
    // ------------------------------------------------------------------------
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: $spacing-6 * 3;
      color: var(--surface-500);

      i {
        font-size: 3rem;
        margin-bottom: $spacing-4;
        color: var(--surface-300);
      }

      p {
        margin: 0;
        font-size: $font-size-base;
      }
    }
  `]
})
export class NotificationsComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('op') popover!: Popover;

  // Datos de ejemplo contextualizados para GRC
  notifications = signal<Notification[]>([
    {
      id: '1',
      tipo: 'riesgo',
      usuario: {
        nombre: 'María López',
        avatar: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/circle/avatar-f-6.png'
      },
      mensaje: 'Te ha asignado el cuestionario de evaluación ISO 27001 - Controles de Acceso. Fecha límite: 25 de diciembre.',
      fecha: new Date(Date.now() - 30 * 60 * 1000),
      leida: false
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
      attachment: {
        type: 'image',
        url: 'https://fqjltiegiezfetthbags.supabase.co/storage/v1/object/public/block.images/blocks/feed/feed-image.jpg',
        title: 'Riesgo RSG-2024-089: Vulnerabilidad en sistema de autenticación',
        subtitle: 'Dec 18 at 03:45 PM'
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
      leida: true
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
      leida: true
    }
  ]);

  tabs = signal<TabItem[]>([
    { id: 'inbox', label: 'Inbox' },
    { id: 'following', label: 'Following' },
    { id: 'all', label: 'All' },
    { id: 'archived', label: 'Archived' }
  ]);

  selectedTab = signal('inbox');
  indicatorWidth = signal(0);
  indicatorLeft = signal(0);

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.leida).length
  );

  filteredNotifications = computed(() => {
    const tab = this.selectedTab();
    const notifs = this.notifications();

    switch (tab) {
      case 'following':
        return notifs.filter(n => !n.leida);
      case 'archived':
        return [];
      default:
        return notifs;
    }
  });

  todayNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredNotifications().filter(n => n.fecha >= today);
  });

  yesterdayNotifications = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.filteredNotifications().filter(n =>
      n.fecha >= yesterday && n.fecha < today
    );
  });

  olderNotifications = computed(() => {
    const yesterday = new Date();
    yesterday.setHours(0, 0, 0, 0);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.filteredNotifications().filter(n => n.fecha < yesterday);
  });

  ngAfterViewInit() {
    setTimeout(() => this.updateIndicator(), 0);
  }

  private updateIndicator(): void {
    const activeIndex = this.tabs().findIndex(item => item.id === this.selectedTab());
    const tabElements = this.scrollContainer?.nativeElement?.querySelectorAll('li');

    if (tabElements?.[activeIndex]) {
      const activeTab = tabElements[activeIndex].querySelector('button') as HTMLElement;
      if (activeTab) {
        this.indicatorWidth.set(activeTab.offsetWidth);
        this.indicatorLeft.set(activeTab.offsetLeft);
      }
    }
  }

  setActiveTab(index: number): void {
    this.selectedTab.set(this.tabs()[index].id);
    setTimeout(() => this.updateIndicator(), 0);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  }

  onNotificationClick(notification: Notification): void {
    const notifs = this.notifications();
    const index = notifs.findIndex(n => n.id === notification.id);
    if (index !== -1 && !notifs[index].leida) {
      notifs[index].leida = true;
      this.notifications.set([...notifs]);
    }
  }

  onActionClick(event: Event, action: NotificationAction): void {
    event.stopPropagation();
    console.log('Action clicked:', action.label);
    if (action.callback) {
      action.callback();
    }
  }
}
