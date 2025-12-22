import { CommonModule } from '@angular/common';
import { Component, signal, computed, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { NotificationsService, Notification, NotificationAction } from '../../services/notifications.service';

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
                <span class="date-label">HOY</span>
              </div>
              @for (notif of todayNotifications(); track notif.id) {
                <ng-container *ngTemplateOutlet="notificationItem; context: { $implicit: notif }"></ng-container>
              }
            }

            <!-- Ayer -->
            @if (yesterdayNotifications().length > 0) {
              <div class="date-group">
                <span class="date-label">AYER</span>
              </div>
              @for (notif of yesterdayNotifications(); track notif.id) {
                <ng-container *ngTemplateOutlet="notificationItem; context: { $implicit: notif }"></ng-container>
              }
            }

            <!-- Anteriores -->
            @if (olderNotifications().length > 0) {
              <div class="date-group">
                <span class="date-label">ANTERIORES</span>
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
          [class.kpi-alert]="notif.tipo === 'kpi-alert'"
          [class.chat-message]="notif.tipo === 'chat'"
          [class.severity-critical]="notif.severity === 'critical'"
          [class.severity-warning]="notif.severity === 'warning'"
          [class.severity-info]="notif.severity === 'info'"
          (click)="onNotificationClick(notif)"
          pRipple
        >
          <!-- Avatar o ícono según tipo -->
          @if (notif.tipo === 'kpi-alert') {
            <div class="alert-icon" [class]="'severity-' + notif.severity">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
          } @else if (notif.tipo === 'chat') {
            <div class="chat-icon">
              <i class="pi pi-comments"></i>
            </div>
          } @else {
            <p-avatar
              [image]="notif.usuario.avatar"
              [label]="!notif.usuario.avatar ? getInitials(notif.usuario.nombre) : undefined"
              shape="circle"
              size="large"
              styleClass="notification-avatar"
            />
          }

          <!-- Content -->
          <div class="notification-content">
            <div class="notification-header-row">
              <div class="notification-user">
                {{ notif.usuario.nombre }}
                @if (notif.enSeguimiento) {
                  <i class="pi pi-bookmark-fill following-icon" pTooltip="En seguimiento"></i>
                }
              </div>
              <button class="menu-trigger" (click)="toggleMenu($event, notif.id)" pTooltip="Opciones">
                <i class="pi pi-ellipsis-h"></i>
              </button>
              <!-- Menú contextual -->
              @if (menuAbierto() === notif.id) {
                <div class="context-menu">
                  <button class="menu-item" (click)="onSeguimiento($event, notif.id)">
                    <i class="pi" [class.pi-bookmark]="!notif.enSeguimiento" [class.pi-bookmark-fill]="notif.enSeguimiento"></i>
                    {{ notif.enSeguimiento ? 'Quitar seguimiento' : 'Seguimiento' }}
                  </button>
                  @if (!notif.archivada) {
                    <button class="menu-item" (click)="onArchivar($event, notif.id)">
                      <i class="pi pi-inbox"></i>
                      Archivar
                    </button>
                  } @else {
                    <button class="menu-item" (click)="onDesarchivar($event, notif.id)">
                      <i class="pi pi-inbox"></i>
                      Desarchivar
                    </button>
                  }
                  <button class="menu-item delete" (click)="onEliminar($event, notif.id)">
                    <i class="pi pi-trash"></i>
                    Eliminar
                  </button>
                </div>
              }
            </div>
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
    // NOTIFICACIONES - Usando Design Tokens del Sistema
    // ============================================================================

    // ------------------------------------------------------------------------
    // BOTÓN DE CAMPANITA
    // ------------------------------------------------------------------------
    .notification-bell {
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-md);
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-duration);

      &:hover {
        background: var(--surface-100);
      }

      i {
        font-size: var(--icon-size);
        color: var(--surface-600);
        transition: color var(--transition-duration);
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
      border-radius: var(--border-radius-full);
      background: var(--red-500);
      color: var(--surface-0);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
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
      border-radius: var(--border-radius-xl);
      overflow: hidden;
    }

    // ------------------------------------------------------------------------
    // TABS
    // ------------------------------------------------------------------------
    .notifications-tabs {
      position: relative;
      border-bottom: 1px solid var(--surface-200);
      padding: 0 var(--spacing-4);
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
      gap: var(--spacing-6);
    }

    .tab-btn {
      padding: var(--spacing-4) 0;
      border: none;
      background: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--surface-800);
      cursor: pointer;
      white-space: nowrap;
      transition: color var(--transition-duration);
      position: relative;

      &:hover {
        color: var(--surface-900);
      }

      &.active {
        color: var(--primary-color);
        font-weight: var(--font-weight-semibold);
      }
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 2px;
      background: var(--primary-color);
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
      padding: var(--spacing-4) var(--spacing-5);

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
      padding: var(--spacing-3) 0 var(--spacing-4);
    }

    .date-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--text-color-secondary);
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    // ------------------------------------------------------------------------
    // ITEM DE NOTIFICACIÓN
    // ------------------------------------------------------------------------
    .notification-item {
      display: flex;
      gap: var(--spacing-4);
      padding: var(--spacing-4) 0;
      cursor: pointer;
      transition: opacity var(--transition-duration);

      &:hover {
        opacity: 0.85;
      }

      &.unread {
        .notification-user {
          color: var(--primary-color);
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
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin-bottom: var(--spacing-1);
    }

    .notification-message {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-normal);
      color: var(--text-color);
      line-height: var(--line-height-normal);
      margin-bottom: var(--spacing-2);
    }

    .notification-time {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    // ------------------------------------------------------------------------
    // ATTACHMENT
    // ------------------------------------------------------------------------
    .notification-attachment {
      display: flex;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      margin: var(--spacing-3) 0;
      background: var(--surface-50);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-lg);
    }

    .attachment-image {
      width: 108px;
      height: 80px;
      border-radius: var(--border-radius-md);
      object-fit: cover;
    }

    .attachment-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .attachment-title {
      font-size: var(--font-size-xs);
      color: var(--surface-900);
      line-height: 1.4;
    }

    .attachment-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    // ------------------------------------------------------------------------
    // ACTIONS
    // ------------------------------------------------------------------------
    .notification-actions {
      display: flex;
      gap: var(--spacing-3);
      margin-top: var(--spacing-4);
    }

    .action-btn {
      flex: 1;
      padding: var(--spacing-3) var(--spacing-4);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all var(--transition-duration);
      text-align: center;

      // Botón Cancel - usando tokens de botón secundario
      &.action-secondary {
        background: var(--button-secondary-background);
        border: 1px solid var(--surface-200);
        color: var(--button-secondary-color);

        &:hover {
          background: var(--button-secondary-hover-background);
          color: var(--button-secondary-hover-color);
        }
      }

      // Botón Confirm - usando tokens de botón primario
      &.action-primary {
        background: var(--button-primary-background);
        border: 1px solid var(--button-primary-border-color);
        color: var(--button-primary-color);

        &:hover {
          background: var(--button-primary-hover-background);
          border-color: var(--button-primary-hover-border-color);
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
      padding: calc(var(--spacing-6) * 3);
      color: var(--text-color-secondary);

      i {
        font-size: 3rem;
        margin-bottom: var(--spacing-4);
        color: var(--surface-300);
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    // ------------------------------------------------------------------------
    // ALERTAS KPI
    // ------------------------------------------------------------------------
    .alert-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.25rem;
      }

      &.severity-critical {
        background: var(--red-100);
        color: var(--red-600);
      }

      &.severity-warning {
        background: var(--orange-100);
        color: var(--orange-600);
      }

      &.severity-info {
        background: var(--blue-100);
        color: var(--blue-600);
      }
    }

    .notification-item.kpi-alert {
      border-left: 3px solid transparent;
      padding-left: calc(var(--spacing-4) - 3px);

      &.severity-critical {
        border-left-color: var(--red-500);
        background: color-mix(in srgb, var(--red-500) 3%, transparent);

        .notification-user {
          color: var(--red-600) !important;
        }
      }

      &.severity-warning {
        border-left-color: var(--orange-500);
        background: color-mix(in srgb, var(--orange-500) 3%, transparent);

        .notification-user {
          color: var(--orange-600) !important;
        }
      }

      &.severity-info {
        border-left-color: var(--blue-500);
        background: color-mix(in srgb, var(--blue-500) 3%, transparent);

        .notification-user {
          color: var(--blue-600) !important;
        }
      }
    }

    // ------------------------------------------------------------------------
    // MENSAJES DE CHAT
    // ------------------------------------------------------------------------
    .chat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--primary-100);
      color: var(--primary-600);

      i {
        font-size: 1.25rem;
      }
    }

    .notification-item.chat-message {
      border-left: 3px solid var(--primary-500);
      padding-left: calc(var(--spacing-4) - 3px);
      background: color-mix(in srgb, var(--primary-500) 3%, transparent);

      .notification-user {
        color: var(--primary-600) !important;
      }
    }

    // ------------------------------------------------------------------------
    // MENÚ CONTEXTUAL
    // ------------------------------------------------------------------------
    .notification-header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-2);
      position: relative;
    }

    .notification-user {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex: 1;

      .following-icon {
        font-size: var(--font-size-xs);
        color: var(--emerald-500);
      }
    }

    .menu-trigger {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      transition: all var(--transition-duration);
      flex-shrink: 0;

      i {
        font-size: var(--font-size-sm);
        color: var(--surface-500);
      }

      &:hover {
        background: var(--surface-100);

        i {
          color: var(--surface-700);
        }
      }
    }

    .notification-item:hover .menu-trigger {
      opacity: 1;
    }

    .context-menu {
      position: absolute;
      top: 100%;
      right: 0;
      z-index: 1000;
      min-width: 180px;
      background: var(--surface-0);
      border: 1px solid var(--surface-200);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--spacing-2);
      margin-top: var(--spacing-1);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      width: 100%;
      padding: var(--spacing-3);
      border: none;
      background: transparent;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--surface-700);
      cursor: pointer;
      text-align: left;
      transition: all var(--transition-duration);

      i {
        font-size: var(--font-size-sm);
        width: 16px;
        text-align: center;
        color: var(--surface-500);
      }

      &:hover {
        background: var(--surface-100);
        color: var(--surface-900);

        i {
          color: var(--surface-700);
        }
      }

      &.delete {
        color: var(--red-600);

        i {
          color: var(--red-500);
        }

        &:hover {
          background: var(--red-50);
          color: var(--red-700);

          i {
            color: var(--red-600);
          }
        }
      }
    }
  `]
})
export class NotificationsComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('op') popover!: Popover;

  // Inyectar el servicio de notificaciones
  private notificationsService = inject(NotificationsService);

  // Usar las notificaciones del servicio
  notifications = this.notificationsService.notifications;

  tabs = signal<TabItem[]>([
    { id: 'inbox', label: 'Nuevos' },
    { id: 'following', label: 'Seguimiento' },
    { id: 'all', label: 'Todas' },
    { id: 'archived', label: 'Archivadas' }
  ]);

  selectedTab = signal('inbox');
  indicatorWidth = signal(0);
  indicatorLeft = signal(0);

  // Usar el contador del servicio
  unreadCount = this.notificationsService.unreadCount;
  kpiAlertsCount = this.notificationsService.kpiAlertsCount;
  criticalAlertsCount = this.notificationsService.criticalAlertsCount;

  // Signal para menú contextual abierto
  menuAbierto = signal<string | null>(null);

  filteredNotifications = computed(() => {
    const tab = this.selectedTab();
    const notifs = this.notifications();

    switch (tab) {
      case 'following':
        return notifs.filter(n => n.enSeguimiento && !n.archivada);
      case 'archived':
        return notifs.filter(n => n.archivada);
      case 'all':
        return notifs.filter(n => !n.archivada);
      default: // inbox - nuevos (no leídos y no archivados)
        return notifs.filter(n => !n.leida && !n.archivada);
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
    if (!notification.leida) {
      this.notificationsService.markAsRead(notification.id);
    }
  }

  onActionClick(event: Event, action: NotificationAction): void {
    event.stopPropagation();
    console.log('Action clicked:', action.label);
    if (action.callback) {
      action.callback();
    }
  }

  // Menú contextual
  toggleMenu(event: Event, notifId: string): void {
    event.stopPropagation();
    if (this.menuAbierto() === notifId) {
      this.menuAbierto.set(null);
    } else {
      this.menuAbierto.set(notifId);
    }
  }

  cerrarMenu(): void {
    this.menuAbierto.set(null);
  }

  onSeguimiento(event: Event, notifId: string): void {
    event.stopPropagation();
    this.notificationsService.toggleSeguimiento(notifId);
    this.menuAbierto.set(null);
  }

  onEliminar(event: Event, notifId: string): void {
    event.stopPropagation();
    this.notificationsService.removeNotification(notifId);
    this.menuAbierto.set(null);
  }

  onArchivar(event: Event, notifId: string): void {
    event.stopPropagation();
    this.notificationsService.archivarNotification(notifId);
    this.menuAbierto.set(null);
  }

  onDesarchivar(event: Event, notifId: string): void {
    event.stopPropagation();
    this.notificationsService.desarchivarNotification(notifId);
    this.menuAbierto.set(null);
  }
}
