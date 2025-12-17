import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';

interface MenuItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, StyleClassModule, TooltipModule],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="logo-section">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.84219 2.87829C5.69766 3.67858 4.6627 4.62478 3.76426 5.68992C7.4357 5.34906 12.1001 5.90564 17.5155 8.61335C23.2984 11.5047 27.955 11.6025 31.1958 10.9773C30.9017 10.087 30.5315 9.23135 30.093 8.41791C26.3832 8.80919 21.6272 8.29127 16.0845 5.51998C12.5648 3.76014 9.46221 3.03521 6.84219 2.87829ZM27.9259 5.33332C24.9962 2.06 20.7387 0 16 0C14.6084 0 13.2581 0.177686 11.9709 0.511584C13.7143 0.987269 15.5663 1.68319 17.5155 2.65781C21.5736 4.68682 25.0771 5.34013 27.9259 5.33332ZM31.8887 14.1025C27.9735 14.8756 22.567 14.7168 16.0845 11.4755C10.024 8.44527 5.20035 8.48343 1.94712 9.20639C1.7792 9.24367 1.61523 9.28287 1.45522 9.32367C1.0293 10.25 0.689308 11.2241 0.445362 12.2356C0.705909 12.166 0.975145 12.0998 1.25293 12.0381C5.19966 11.161 10.7761 11.1991 17.5155 14.5689C23.5761 17.5991 28.3997 17.561 31.6529 16.838C31.7644 16.8133 31.8742 16.7877 31.9822 16.7613C31.9941 16.509 32 16.2552 32 16C32 15.358 31.9622 14.7248 31.8887 14.1025ZM31.4598 20.1378C27.5826 20.8157 22.3336 20.5555 16.0845 17.431C10.024 14.4008 5.20035 14.439 1.94712 15.1619C1.225 15.3223 0.575392 15.5178 0.002344 15.7241C0.000781601 15.8158 0 15.9078 0 16C0 24.8366 7.16344 32 16 32C23.4057 32 29.6362 26.9687 31.4598 20.1378Z" fill="var(--primary-color)"/>
          </svg>
          <span class="logo-text">
            <span class="logo-bold">ORCA</span>
            <span class="logo-light">ALAN</span>
          </span>
        </div>

        <!-- Menu -->
        <nav class="menu-nav">
          @for (item of menuItems; track item.routerLink) {
            <a
              [routerLink]="item.routerLink"
              routerLinkActive="active-menu-item"
              class="menu-item"
              [pTooltip]="item.label"
              tooltipPosition="right"
              [tooltipOptions]="{showDelay: 300}"
            >
              <i [class]="item.icon"></i>
              <span class="menu-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- User -->
        <div class="user-section">
          <img src="https://fqjltiegiezfetthbags.supabase.co/storage/v1/render/image/public/block.images/blocks/avatars/avatar-amyels.png" class="user-avatar" />
          <div class="user-info">
            <div class="user-name">Alan Franco</div>
            <div class="user-role">Administrador</div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 72px;
      background: var(--surface-0);
      border-right: 1px solid var(--surface-200);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: width 0.2s ease;
      overflow: hidden;
    }

    .sidebar:hover {
      width: 240px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      border-bottom: 1px solid var(--surface-200);
      min-height: 65px;
    }

    .logo-section svg {
      flex-shrink: 0;
    }

    .logo-text {
      display: flex;
      gap: 4px;
      opacity: 0;
      white-space: nowrap;
      transition: opacity 0.2s ease;
    }

    .sidebar:hover .logo-text {
      opacity: 1;
    }

    .logo-bold {
      font-size: 20px;
      font-weight: 700;
      color: var(--surface-900);
    }

    .logo-light {
      font-size: 20px;
      font-weight: 300;
      color: var(--surface-500);
    }

    .menu-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-bottom: 4px;
      border-radius: 8px;
      color: var(--surface-700);
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s;
      white-space: nowrap;
    }

    .menu-item:hover {
      background-color: var(--surface-100);
    }

    .menu-item i {
      font-size: 18px;
      flex-shrink: 0;
      width: 24px;
      text-align: center;
    }

    .menu-label {
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .sidebar:hover .menu-label {
      opacity: 1;
    }

    .active-menu-item {
      background-color: var(--primary-color) !important;
      color: var(--primary-contrast-color) !important;
    }

    .active-menu-item i,
    .active-menu-item span {
      color: var(--primary-contrast-color) !important;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid var(--surface-200);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .user-info {
      opacity: 0;
      white-space: nowrap;
      transition: opacity 0.2s ease;
    }

    .sidebar:hover .user-info {
      opacity: 1;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--surface-900);
    }

    .user-role {
      font-size: 12px;
      color: var(--surface-500);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--surface-ground);
    }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Activos', icon: 'pi pi-box', routerLink: '/activos' },
    { label: 'Organigrama', icon: 'pi pi-sitemap', routerLink: '/organigramas' },
    { label: 'Riesgos', icon: 'pi pi-exclamation-triangle', routerLink: '/riesgos' },
    { label: 'Incidentes', icon: 'pi pi-bolt', routerLink: '/incidentes' },
    { label: 'Defectos', icon: 'pi pi-bug', routerLink: '/defectos' },
    { label: 'Procesos', icon: 'pi pi-cog', routerLink: '/procesos' },
    { label: 'Cuestionarios', icon: 'pi pi-list-check', routerLink: '/cuestionarios' },
    { label: 'Cumplimiento', icon: 'pi pi-check-circle', routerLink: '/cumplimiento' },
    { label: 'Tabla Unificada', icon: 'pi pi-table', routerLink: '/tabla-unificada' },
    { label: 'Results ML', icon: 'pi pi-chart-line', routerLink: '/results-ml' }
  ];
}
