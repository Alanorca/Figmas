import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MenubarModule, ButtonModule, AvatarModule, BadgeModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: '/dashboard'
    },
    {
      label: 'Activos',
      icon: 'pi pi-box',
      routerLink: '/activos'
    },
    {
      label: 'Organigrama',
      icon: 'pi pi-sitemap',
      routerLink: '/organigramas'
    },
    {
      label: 'Riesgos',
      icon: 'pi pi-exclamation-triangle',
      routerLink: '/riesgos'
    },
    {
      label: 'Incidentes',
      icon: 'pi pi-bolt',
      routerLink: '/incidentes'
    },
    {
      label: 'Defectos',
      icon: 'pi pi-bug',
      routerLink: '/defectos'
    },
    {
      label: 'Procesos',
      icon: 'pi pi-sitemap',
      routerLink: '/procesos'
    }
  ];
}
