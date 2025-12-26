import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { NotificationsComponent } from '../notifications/notifications';
import { ThemeService } from '../../services/theme.service';
import { FeatureFlagsService } from '../../services/feature-flags.service';
import { filter } from 'rxjs/operators';

interface SubMenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

interface MenuGroup {
  label: string;
  icon: string;
  expanded?: boolean;
  items: SubMenuItem[];
}

interface BreadcrumbItem {
  label?: string;
  routerLink?: string;
  icon?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, StyleClassModule, TooltipModule, ButtonModule, NotificationsComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar Container -->
      <div
        class="sidebar-container"
        [class.expanded]="isExpanded()"
        (mouseenter)="onSidebarMouseEnter()"
        (mouseleave)="onSidebarMouseLeave()"
      >
        <!-- Icon Bar (Primary) -->
        <div class="icon-bar">
          <!-- Logo -->
          <div class="logo-container">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.84219 2.87829C5.69766 3.67858 4.6627 4.62478 3.76426 5.68992C7.4357 5.34906 12.1001 5.90564 17.5155 8.61335C23.2984 11.5047 27.955 11.6025 31.1958 10.9773C30.9017 10.087 30.5315 9.23135 30.093 8.41791C26.3832 8.80919 21.6272 8.29127 16.0845 5.51998C12.5648 3.76014 9.46221 3.03521 6.84219 2.87829ZM27.9259 5.33332C24.9962 2.06 20.7387 0 16 0C14.6084 0 13.2581 0.177686 11.9709 0.511584C13.7143 0.987269 15.5663 1.68319 17.5155 2.65781C21.5736 4.68682 25.0771 5.34013 27.9259 5.33332ZM31.8887 14.1025C27.9735 14.8756 22.567 14.7168 16.0845 11.4755C10.024 8.44527 5.20035 8.48343 1.94712 9.20639C1.7792 9.24367 1.61523 9.28287 1.45522 9.32367C1.0293 10.25 0.689308 11.2241 0.445362 12.2356C0.705909 12.166 0.975145 12.0998 1.25293 12.0381C5.19966 11.161 10.7761 11.1991 17.5155 14.5689C23.5761 17.5991 28.3997 17.561 31.6529 16.838C31.7644 16.8133 31.8742 16.7877 31.9822 16.7613C31.9941 16.509 32 16.2552 32 16C32 15.358 31.9622 14.7248 31.8887 14.1025ZM31.4598 20.1378C27.5826 20.8157 22.3336 20.5555 16.0845 17.431C10.024 14.4008 5.20035 14.439 1.94712 15.1619C1.225 15.3223 0.575392 15.5178 0.002344 15.7241C0.000781601 15.8158 0 15.9078 0 16C0 24.8366 7.16344 32 16 32C23.4057 32 29.6362 26.9687 31.4598 20.1378Z" class="fill-primary-contrast"/>
            </svg>
          </div>

          <!-- Menu Icons -->
          <nav class="icon-nav">
            <ul class="icon-list">
              @for (group of menuGroups(); track group.label; let i = $index) {
                <li class="icon-item">
                  <a
                    class="icon-link"
                    [class.active]="activeTab() === i"
                    (click)="onIconClick(i)"
                    [pTooltip]="!isExpanded() ? group.label : ''"
                    tooltipPosition="right"
                  >
                    <i [class]="group.icon + ' icon-size'"></i>
                  </a>
                </li>
              }
            </ul>
          </nav>

          <!-- Bottom Section -->
          <div class="icon-bar-footer">
            <div class="icon-divider"></div>
            <div class="avatar-container">
              <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/avatar-amyels.png" class="user-avatar-small" />
            </div>
          </div>
        </div>

        <!-- Submenu Panel (Secondary) - Collapsible -->
        <div class="submenu-panel" [class.collapsed]="!isExpanded()">
          <!-- Panel Header -->
          <div class="panel-header">
            <span class="panel-title">{{ activeGroup()?.label }}</span>
          </div>

          <!-- Submenu Items -->
          <nav class="submenu-nav">
            @for (item of activeGroup()?.items; track item.routerLink) {
              <a
                [routerLink]="item.routerLink"
                routerLinkActive="submenu-active"
                class="submenu-item"
              >
                <i [class]="item.icon"></i>
                <span class="submenu-label">{{ item.label }}</span>
              </a>
            }
          </nav>
        </div>
      </div>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Dev Mode Warning Banner -->
        @if (featureFlags.isDevMode()) {
          <div class="dev-mode-banner">
            <i class="pi pi-exclamation-triangle"></i>
            <span>MODO DESARROLLO - Funcionalidades en prueba visibles</span>
            <button class="banner-close" (click)="featureFlags.toggleDevMode()">
              <i class="pi pi-times"></i>
            </button>
          </div>
        }

        <!-- Top Header -->
        <header class="top-header">
          <nav class="breadcrumb-nav">
            @for (item of breadcrumbs; track $index; let last = $last) {
              @if (item.icon) {
                <a [routerLink]="item.routerLink" class="breadcrumb-item breadcrumb-home">
                  <i [class]="item.icon"></i>
                </a>
              } @else if (item.routerLink && !last) {
                <a [routerLink]="item.routerLink" class="breadcrumb-item">{{ item.label }}</a>
              } @else {
                <span class="breadcrumb-current">{{ item.label }}</span>
              }
              @if (!last) {
                <span class="breadcrumb-separator">/</span>
              }
            }
          </nav>
          <div class="header-actions">
            <button
              pButton
              type="button"
              [icon]="themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"
              class="p-button-text p-button-rounded theme-toggle"
              (click)="themeService.toggleTheme()"
              [pTooltip]="themeService.isDarkMode() ? 'Modo claro' : 'Modo oscuro'"
              tooltipPosition="bottom"
            ></button>
            <app-notifications />
            <button
              pButton
              type="button"
              [icon]="featureFlags.isDevMode() ? 'pi pi-eye' : 'pi pi-eye-slash'"
              class="p-button-text p-button-rounded dev-toggle"
              [class.dev-mode-active]="featureFlags.isDevMode()"
              (click)="featureFlags.toggleDevMode()"
              [pTooltip]="featureFlags.isDevMode() ? 'Dev Mode: ON' : 'Dev Mode: OFF'"
              tooltipPosition="bottom"
            ></button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    /* ===== Layout Principal ===== */
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--surface-ground);
    }

    /* ===== Sidebar Container ===== */
    .sidebar-container {
      display: flex;
      height: 100vh;
      position: sticky;
      top: 0;
      flex-shrink: 0;
      border-right: 1px solid var(--surface-border);
    }

    /* ===== Icon Bar (Barra de iconos principal) ===== */
    /* Light mode: Fondo blanco/gris claro, iconos oscuros */
    .icon-bar {
      display: flex;
      flex-direction: column;
      width: 64px;
      background: var(--surface-0);
      border-right: 1px solid var(--surface-border);
      flex-shrink: 0;
    }

    /* Dark mode: Fondo oscuro, iconos verdes/blancos */
    :host-context(.dark-mode) .icon-bar,
    :host-context([data-theme="dark"]) .icon-bar {
      background: var(--surface-50);
      border-right-color: var(--surface-border);
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4);
      flex-shrink: 0;
    }

    /* Light mode: Logo verde */
    .logo-container svg path {
      fill: var(--primary-color);
    }

    /* Dark mode: Logo verde brillante */
    :host-context(.dark-mode) .logo-container svg path,
    :host-context([data-theme="dark"]) .logo-container svg path {
      fill: var(--emerald-400);
    }

    .icon-nav {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .icon-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }

    .icon-item {
      display: flex;
      justify-content: center;
      padding: var(--spacing-2) var(--spacing-4);
    }

    /* Light mode: Iconos grises oscuros */
    .icon-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-lg);
      color: var(--surface-600);
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .icon-link:hover {
      background: var(--surface-100);
      color: var(--primary-color);
    }

    .icon-link.active {
      background: var(--primary-50);
      color: var(--primary-color);
    }

    /* Dark mode: Iconos blancos, activo verde */
    :host-context(.dark-mode) .icon-link,
    :host-context([data-theme="dark"]) .icon-link {
      color: var(--surface-400);
    }

    :host-context(.dark-mode) .icon-link:hover,
    :host-context([data-theme="dark"]) .icon-link:hover {
      background: var(--surface-100);
      color: var(--emerald-400);
    }

    :host-context(.dark-mode) .icon-link.active,
    :host-context([data-theme="dark"]) .icon-link.active {
      background: rgba(16, 185, 129, 0.16);
      color: var(--emerald-400);
    }

    .icon-size {
      font-size: var(--font-size-xl) !important;
      line-height: var(--line-height-tight) !important;
    }

    .icon-bar-footer {
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    /* Light mode: Divisor gris claro */
    .icon-divider {
      width: 100%;
      height: 1px;
      background: var(--surface-200);
    }

    /* Dark mode: Divisor gris oscuro */
    :host-context(.dark-mode) .icon-divider,
    :host-context([data-theme="dark"]) .icon-divider {
      background: var(--surface-200);
    }

    .avatar-container {
      display: flex;
      justify-content: center;
      padding: var(--spacing-2);
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-full);
      cursor: pointer;
    }

    /* ===== Submenu Panel (Panel de submenús) ===== */
    /* Light mode: Fondo gris muy claro, texto oscuro */
    .submenu-panel {
      display: flex;
      flex-direction: column;
      width: 220px;
      background: var(--surface-50);
      padding: var(--spacing-4);
      overflow: hidden;
      flex-shrink: 0;
      /* Transición de expansión: 300ms ease-out */
      transition: width 300ms ease-out, padding 300ms ease-out, opacity 250ms ease-out;
      opacity: 1;
    }

    /* Estado colapsado */
    .submenu-panel.collapsed {
      width: 0;
      padding: var(--spacing-4) 0;
      opacity: 0;
      /* Transición de colapso: 250ms ease-in */
      transition: width 250ms ease-in, padding 250ms ease-in, opacity 200ms ease-in;
    }

    /* Dark mode: Fondo gris oscuro */
    :host-context(.dark-mode) .submenu-panel,
    :host-context([data-theme="dark"]) .submenu-panel {
      background: var(--surface-100);
    }

    .panel-header {
      margin-bottom: var(--spacing-6);
    }

    /* Light mode: Título oscuro */
    .panel-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--surface-800);
    }

    /* Dark mode: Título blanco */
    :host-context(.dark-mode) .panel-title,
    :host-context([data-theme="dark"]) .panel-title {
      color: var(--text-color);
    }

    .submenu-nav {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    /* Light mode: Items con texto gris oscuro */
    .submenu-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--border-radius-lg);
      color: var(--surface-600);
      text-decoration: none;
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .submenu-item:hover {
      background: var(--surface-100);
      color: var(--primary-color);
    }

    /* Dark mode: Items con texto gris claro, hover verde */
    :host-context(.dark-mode) .submenu-item,
    :host-context([data-theme="dark"]) .submenu-item {
      color: var(--surface-400);
    }

    :host-context(.dark-mode) .submenu-item:hover,
    :host-context([data-theme="dark"]) .submenu-item:hover {
      background: var(--surface-200);
      color: var(--emerald-400);
    }

    .submenu-item i {
      font-size: var(--font-size-base);
    }

    .submenu-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    /* Light mode: Item activo con fondo verde claro */
    .submenu-active {
      background: var(--primary-50) !important;
      color: var(--primary-color) !important;
    }

    /* Dark mode: Item activo con fondo verde translúcido */
    :host-context(.dark-mode) .submenu-active,
    :host-context([data-theme="dark"]) .submenu-active {
      background: rgba(16, 185, 129, 0.16) !important;
      color: var(--emerald-400) !important;
    }

    /* ===== Main Content ===== */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--surface-ground);
      min-width: 0;
      overflow: hidden;
    }

    /* ===== Dev Mode Banner ===== */
    .dev-mode-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-4);
      background: linear-gradient(90deg, var(--orange-500), var(--red-500));
      color: var(--surface-0);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-xs);
      letter-spacing: 0.3px;
      flex-shrink: 0;
      position: relative;

      i {
        font-size: var(--font-size-xs);
      }

      .banner-close {
        position: absolute;
        right: var(--spacing-2);
        background: transparent;
        border: none;
        color: var(--surface-0);
        opacity: 0.8;
        cursor: pointer;
        padding: var(--spacing-1);
        border-radius: var(--border-radius-sm);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-duration) var(--transition-timing);

        &:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.2);
        }

        i {
          font-size: var(--font-size-2xs);
        }
      }
    }

    /* ===== Top Header ===== */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-3) var(--spacing-8);
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      flex-shrink: 0;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
    }

    .breadcrumb-item {
      color: var(--text-color-secondary);
      text-decoration: none;
      transition: color var(--transition-duration) var(--transition-timing);

      &:hover {
        color: var(--primary-color);
      }
    }

    .breadcrumb-home {
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: var(--font-size-sm);
      }
    }

    .breadcrumb-separator {
      color: var(--surface-400);
      font-size: var(--font-size-xs);
    }

    .breadcrumb-current {
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .theme-toggle,
    .dev-toggle {
      width: 36px;
      height: 36px;
      color: var(--text-color-secondary);
      transition: all var(--transition-duration) var(--transition-timing);

      &:hover {
        color: var(--primary-color);
        background: var(--surface-hover);
      }
    }

    .dev-toggle.dev-mode-active {
      color: var(--orange-500);
      background: var(--orange-50);

      &:hover {
        color: var(--orange-600);
        background: var(--orange-100);
      }
    }

    :host-context(.dark-mode) .dev-toggle.dev-mode-active,
    :host-context([data-theme="dark"]) .dev-toggle.dev-mode-active {
      background: rgba(249, 115, 22, 0.16);

      &:hover {
        background: rgba(249, 115, 22, 0.24);
      }
    }

    /* ===== Content Area ===== */
    .content-area {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class SidebarComponent implements OnDestroy {
  private router = inject(Router);
  themeService = inject(ThemeService);
  featureFlags = inject(FeatureFlagsService);

  // Estado de expansión del menú (colapsado por defecto)
  isExpanded = signal<boolean>(false);

  // Timer para el delay del colapso
  private collapseTimeout: ReturnType<typeof setTimeout> | null = null;

  // Delay antes de colapsar (150ms para evitar cierres accidentales)
  private readonly COLLAPSE_DELAY = 150;

  // Menú base con todas las opciones
  private allMenuGroups: MenuGroup[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      expanded: true,
      items: [
        { label: 'Dashboard General', icon: 'pi pi-chart-bar', routerLink: '/dashboard' },
        { label: 'Dashboard Custom', icon: 'pi pi-th-large', routerLink: '/dashboard-custom' },
        { label: 'Tabla Unificada', icon: 'pi pi-table', routerLink: '/tabla-unificada' }
      ]
    },
    {
      label: 'Activos y Procesos',
      icon: 'pi pi-box',
      expanded: true,
      items: [
        { label: 'Activos', icon: 'pi pi-database', routerLink: '/activos' },
        { label: 'Procesos', icon: 'pi pi-cog', routerLink: '/procesos' }
      ]
    },
    {
      label: 'Cumplimiento',
      icon: 'pi pi-check-circle',
      expanded: true,
      items: [
        { label: 'Cuestionarios', icon: 'pi pi-list-check', routerLink: '/cuestionarios' },
        { label: 'Revisiones', icon: 'pi pi-file-check', routerLink: '/cumplimiento' }
      ]
    },
    {
      label: 'Riesgos',
      icon: 'pi pi-exclamation-triangle',
      expanded: true,
      items: [
        { label: 'Riesgos', icon: 'pi pi-exclamation-circle', routerLink: '/riesgos' },
        { label: 'Incidentes', icon: 'pi pi-bolt', routerLink: '/incidentes' },
        { label: 'Defectos', icon: 'pi pi-bug', routerLink: '/defectos' },
        { label: 'Controles', icon: 'pi pi-shield', routerLink: '/controles' }
      ]
    },
    {
      label: 'Configuracion',
      icon: 'pi pi-cog',
      expanded: true,
      items: [
        { label: 'Usuarios y Roles', icon: 'pi pi-users', routerLink: '/usuarios-roles' },
        { label: 'Asignacion Roles', icon: 'pi pi-id-card', routerLink: '/asignacion-roles' },
        { label: 'Organigrama', icon: 'pi pi-sitemap', routerLink: '/organigramas' }
      ]
    }
  ];

  // Tab activo (índice del grupo seleccionado)
  activeTab = signal<number>(0);

  // Menú filtrado según feature flags
  menuGroups = computed(() => {
    return this.allMenuGroups.map(group => ({
      ...group,
      items: group.items.filter(item => this.featureFlags.isFeatureEnabled(item.routerLink))
    })).filter(group => group.items.length > 0);
  });

  // Grupo activo basado en el tab seleccionado
  activeGroup = computed(() => {
    const groups = this.menuGroups();
    return groups[this.activeTab()] || groups[0];
  });

  breadcrumbs: BreadcrumbItem[] = [];

  // Route to label mapping
  private routeLabels: Record<string, string> = {
    'dashboard': 'Dashboard General',
    'dashboard-custom': 'Dashboard Custom',
    'activos': 'Activos',
    'organigramas': 'Organigrama',
    'riesgos': 'Riesgos',
    'incidentes': 'Incidentes',
    'defectos': 'Defectos',
    'controles': 'Controles',
    'procesos': 'Procesos',
    'procesos-lista': 'Lista de Procesos',
    'proceso-detalle': 'Detalle de Proceso',
    'proceso-crear': 'Crear Proceso',
    'cuestionarios': 'Cuestionarios',
    'cumplimiento': 'Revisiones',
    'tabla-unificada': 'Tabla Unificada',
    'results-ml': 'Results ML',
    'usuarios-roles': 'Usuarios y Roles',
    'asignacion-roles': 'Asignacion de Roles',
    'crear': 'Crear',
    'detalle': 'Detalle',
    'objetivos-kpis': 'Objetivos y KPIs',
    'nuevo': 'Nuevo'
  };

  constructor() {
    // Initial breadcrumb and active tab
    this.updateBreadcrumbs(this.router.url);
    this.updateActiveTabFromRoute(this.router.url);

    // Listen for route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateBreadcrumbs(event.urlAfterRedirects);
        this.updateActiveTabFromRoute(event.urlAfterRedirects);
      });
  }

  private updateActiveTabFromRoute(url: string): void {
    const groups = this.menuGroups();
    const tabIndex = groups.findIndex(group =>
      group.items.some(item => url.startsWith(item.routerLink))
    );
    if (tabIndex !== -1) {
      this.activeTab.set(tabIndex);
    }
  }

  setActiveTab(index: number): void {
    this.activeTab.set(index);
  }

  /**
   * Al hacer click en un ícono: expande el menú y selecciona el tab
   */
  onIconClick(index: number): void {
    // Cancelar cualquier timeout de colapso pendiente
    this.cancelCollapseTimeout();

    // Seleccionar el tab
    this.activeTab.set(index);

    // Expandir el menú
    this.isExpanded.set(true);
  }

  /**
   * Al entrar al área del sidebar: cancelar cualquier colapso pendiente
   */
  onSidebarMouseEnter(): void {
    this.cancelCollapseTimeout();
  }

  /**
   * Al salir del área del sidebar: colapsar con delay
   */
  onSidebarMouseLeave(): void {
    // Iniciar el timeout para colapsar
    this.collapseTimeout = setTimeout(() => {
      this.isExpanded.set(false);
    }, this.COLLAPSE_DELAY);
  }

  /**
   * Cancelar el timeout de colapso (cuando el usuario vuelve al sidebar)
   */
  private cancelCollapseTimeout(): void {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.cancelCollapseTimeout();
  }

  private updateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(s => s && !s.startsWith('?'));

    this.breadcrumbs = [
      { icon: 'pi pi-home', routerLink: '/dashboard' }
    ];

    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += '/' + segment;

      // Skip numeric IDs in breadcrumb labels but keep them in path
      if (/^\d+$/.test(segment) || segment.startsWith('PROC-')) {
        continue;
      }

      const label = this.routeLabels[segment] || this.capitalizeFirst(segment);

      // For the last segment, don't add routerLink
      if (i === segments.length - 1) {
        this.breadcrumbs.push({ label });
      } else {
        this.breadcrumbs.push({ label, routerLink: currentPath });
      }
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
}
