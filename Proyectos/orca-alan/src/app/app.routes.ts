import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'activos',
    loadComponent: () => import('./pages/activos/activos').then(m => m.ActivosComponent)
  },
  {
    path: 'organigramas',
    loadComponent: () => import('./pages/organigramas/organigramas').then(m => m.OrganigramasComponent)
  },
  {
    path: 'riesgos',
    loadComponent: () => import('./pages/riesgos/riesgos').then(m => m.RiesgosComponent)
  },
  {
    path: 'incidentes',
    loadComponent: () => import('./pages/incidentes/incidentes').then(m => m.IncidentesComponent)
  },
  {
    path: 'defectos',
    loadComponent: () => import('./pages/defectos/defectos').then(m => m.DefectosComponent)
  },
  {
    path: 'procesos',
    loadComponent: () => import('./pages/procesos/procesos').then(m => m.ProcesosComponent)
  },
  {
    path: 'cuestionarios',
    loadComponent: () => import('./pages/cuestionarios/cuestionarios').then(m => m.CuestionariosComponent)
  },
  {
    path: 'cumplimiento',
    loadComponent: () => import('./pages/cumplimiento/cumplimiento').then(m => m.CumplimientoComponent)
  },
  {
    path: 'tabla-unificada',
    loadComponent: () => import('./pages/tabla-unificada/tabla-unificada').then(m => m.TablaUnificadaComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
