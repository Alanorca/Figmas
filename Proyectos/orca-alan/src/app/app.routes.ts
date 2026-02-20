import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard-custom',
    pathMatch: 'full'
  },
  {
    path: 'dashboard-custom',
    loadComponent: () => import('./components/dashboard-customizable/dashboard-customizable').then(m => m.DashboardCustomizableComponent)
  },
  {
    path: 'dashboard-tprm',
    loadComponent: () => import('./pages/dashboard-tprm/dashboard-tprm').then(m => m.DashboardTprmComponent)
  },
  {
    path: 'activos',
    loadComponent: () => import('./pages/activos/activos').then(m => m.ActivosComponent)
  },
  {
    path: 'activos/:id/detalle',
    loadComponent: () => import('./pages/activo-detalle/activo-detalle').then(m => m.ActivoDetalleComponent)
  },
  {
    path: 'organigramas',
    loadComponent: () => import('./pages/organigramas/organigramas').then(m => m.OrganigramasComponent)
  },
  {
    path: 'organigramas/:id/objetivos-kpis',
    loadComponent: () => import('./pages/objetivos-kpis/objetivos-kpis').then(m => m.ObjetivosKpisComponent)
  },
  // Riesgos
  {
    path: 'riesgos',
    loadComponent: () => import('./pages/riesgos/riesgos').then(m => m.RiesgosComponent)
  },
  {
    path: 'riesgos/crear',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  {
    path: 'riesgos/:id',
    loadComponent: () => import('./pages/riesgo-detalle/riesgo-detalle').then(m => m.RiesgoDetalleComponent)
  },
  {
    path: 'riesgos/:id/editar',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  // Incidentes
  {
    path: 'incidentes',
    loadComponent: () => import('./pages/incidentes/incidentes').then(m => m.IncidentesComponent)
  },
  {
    path: 'incidentes/crear',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  {
    path: 'incidentes/:id',
    loadComponent: () => import('./pages/incidente-detalle/incidente-detalle').then(m => m.IncidenteDetalleComponent)
  },
  {
    path: 'incidentes/:id/editar',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  // Defectos
  {
    path: 'defectos',
    loadComponent: () => import('./pages/defectos/defectos').then(m => m.DefectosComponent)
  },
  {
    path: 'defectos/crear',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  {
    path: 'defectos/:id',
    loadComponent: () => import('./pages/defecto-detalle/defecto-detalle').then(m => m.DefectoDetalleComponent)
  },
  {
    path: 'defectos/:id/editar',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  {
    path: 'procesos',
    loadComponent: () => import('./pages/procesos-lista/procesos-lista').then(m => m.ProcesosListaComponent)
  },
  {
    path: 'procesos/crear',
    loadComponent: () => import('./pages/proceso-crear/proceso-crear').then(m => m.ProcesoCrearComponent)
  },
  {
    path: 'procesos/:id',
    loadComponent: () => import('./pages/procesos/procesos').then(m => m.ProcesosComponent)
  },
  {
    path: 'procesos/:id/detalle',
    loadComponent: () => import('./pages/proceso-detalle/proceso-detalle').then(m => m.ProcesoDetalleComponent)
  },
  {
    path: 'procesos/:id/runner',
    loadComponent: () => import('./pages/proceso-runner/proceso-runner').then(m => m.ProcesoRunnerComponent)
  },
  {
    path: 'procesos/:id/objetivos-kpis',
    loadComponent: () => import('./pages/objetivos-kpis/objetivos-kpis').then(m => m.ObjetivosKpisComponent)
  },
  {
    path: 'cuestionarios',
    loadComponent: () => import('./pages/cuestionarios/cuestionarios').then(m => m.CuestionariosComponent)
  },
  {
    path: 'cuestionarios/crear',
    loadComponent: () => import('./pages/cuestionario-crear/cuestionario-crear').then(m => m.CuestionarioCrearComponent)
  },
  {
    path: 'cuestionarios/:id',
    loadComponent: () => import('./pages/cuestionario-detalle/cuestionario-detalle').then(m => m.CuestionarioDetalleComponent)
  },
  {
    path: 'cumplimiento',
    loadComponent: () => import('./pages/cumplimiento/cumplimiento').then(m => m.CumplimientoComponent)
  },
  {
    path: 'cumplimiento/revisiones/:id',
    loadComponent: () => import('./pages/cumplimiento-revision-detalle/cumplimiento-revision-detalle').then(m => m.CumplimientoRevisionDetalleComponent)
  },
  {
    path: 'tabla-unificada',
    loadComponent: () => import('./pages/tabla-unificada/tabla-unificada').then(m => m.TablaUnificadaComponent)
  },
  {
    path: 'results-ml',
    loadComponent: () => import('./pages/results-ml/results-ml').then(m => m.ResultsMLComponent)
  },
  {
    path: 'usuarios-roles',
    loadComponent: () => import('./pages/usuarios-roles/usuarios-roles').then(m => m.UsuariosRolesComponent)
  },
  {
    path: 'usuarios/:id',
    loadComponent: () => import('./pages/usuario-detalle/usuario-detalle').then(m => m.UsuarioDetalleComponent)
  },
  {
    path: 'asignacion-roles',
    loadComponent: () => import('./pages/asignacion-roles/asignacion-roles').then(m => m.AsignacionRolesComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil').then(m => m.PerfilComponent)
  },
  {
    path: 'notificaciones-preferencias',
    loadComponent: () => import('./pages/notificaciones-preferencias/notificaciones-preferencias').then(m => m.NotificacionesPreferenciasComponent)
  },
  {
    path: 'notificaciones-config',
    loadComponent: () => import('./pages/notificaciones-config/notificaciones-config').then(m => m.NotificacionesConfigComponent)
  },
  {
    path: 'notificaciones-reglas',
    loadComponent: () => import('./pages/notificaciones-reglas/notificaciones-reglas').then(m => m.NotificacionesReglasComponent)
  },
  {
    path: 'notificaciones-reglas/nueva',
    loadComponent: () => import('./pages/notificacion-regla-nueva/notificacion-regla-nueva').then(m => m.NotificacionReglaNuevaComponent)
  },
  {
    path: 'notificaciones-reglas/editar/:id',
    loadComponent: () => import('./pages/notificacion-regla-nueva/notificacion-regla-nueva').then(m => m.NotificacionReglaNuevaComponent)
  },
  {
    path: 'notificaciones-logs',
    loadComponent: () => import('./pages/notificaciones-logs/notificaciones-logs').then(m => m.NotificacionesLogsComponent)
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./pages/proyectos/proyectos').then(m => m.ProyectosComponent)
  },
  {
    path: 'proyectos/crear',
    loadComponent: () => import('./pages/proyecto-crear/proyecto-crear').then(m => m.ProyectoCrearComponent)
  },
  {
    path: 'proyectos/:id/editar',
    loadComponent: () => import('./pages/proyecto-crear/proyecto-crear').then(m => m.ProyectoCrearComponent)
  },
  {
    path: 'proyectos/:id',
    loadComponent: () => import('./pages/proyecto-detalle/proyecto-detalle').then(m => m.ProyectoDetalleComponent)
  },
  {
    path: 'integraciones',
    loadComponent: () => import('./pages/integraciones/integraciones').then(m => m.IntegracionesComponent)
  },
  {
    path: 'integraciones/crear',
    loadComponent: () => import('./pages/integraciones-crear/integraciones-crear').then(m => m.IntegracionesCrearComponent)
  },
  {
    path: 'integraciones/:id',
    loadComponent: () => import('./pages/integraciones-detalle/integraciones-detalle').then(m => m.IntegracionesDetalleComponent)
  },
  {
    path: 'integraciones/:id/editar',
    loadComponent: () => import('./pages/integraciones-crear/integraciones-crear').then(m => m.IntegracionesCrearComponent)
  },
  // Eventos
  {
    path: 'eventos',
    loadComponent: () => import('./pages/eventos/eventos').then(m => m.EventosComponent)
  },
  {
    path: 'eventos/crear',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  {
    path: 'eventos/:id',
    loadComponent: () => import('./pages/eventos-detalle/eventos-detalle').then(m => m.EventosDetalleComponent)
  },
  {
    path: 'eventos/:id/editar',
    loadComponent: () => import('./pages/eventos-crear/eventos-crear').then(m => m.EventosCrearComponent)
  },
  // Subtipos de eventos (plantillas)
  {
    path: 'evento-subtipos',
    loadComponent: () => import('./pages/evento-subtipos/evento-subtipos').then(m => m.EventoSubtiposComponent)
  },
  {
    path: 'evento-subtipos/crear',
    loadComponent: () => import('./pages/evento-subtipo-crear/evento-subtipo-crear').then(m => m.EventoSubtipoCrearComponent)
  },
  {
    path: 'evento-subtipos/:id/editar',
    loadComponent: () => import('./pages/evento-subtipo-crear/evento-subtipo-crear').then(m => m.EventoSubtipoCrearComponent)
  },
  // Design System
  {
    path: 'design-system',
    loadChildren: () => import('./pages/design-system/design-system.routes').then(m => m.DESIGN_SYSTEM_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard-custom'
  }
];
