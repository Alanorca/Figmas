export interface Tenant {
  id: string;
  name: string;
  code: string;
  industry: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

/** Stores that are shared across all tenants (no tenantId filtering) */
export const GLOBAL_STORES: string[] = [
  'permisos',
  'modulos',
  'roles',
  'roles_permisos',
  'catalogos',
  'plantillas_activo',
  'usuarios',
  'usuarios_roles',
  'usuarios_activos',
  'logs_auditoria',
  'activos_acceso',
  '_meta',
  'event_subtypes',
  'user_notification_preferences',
  'notification_profiles',
  'notification_logs',
  'respuestas_cuestionario',
  'respuestas_pregunta',
  'evidencias',
  'hallazgos',
  'mensajes_chat',
  'alertas_cumplimiento',
  'kpi_historico',
  'task_evidences',
  'task_history',
  'evaluados_externos',
  'event_comments',
];

/** Stores that are filtered by tenantId */
export const TENANT_SCOPED_STORES: string[] = [
  'activos',
  'riesgos',
  'incidentes',
  'defectos',
  'procesos',
  'process_nodes',
  'process_edges',
  'objetivos_proceso',
  'kpis_proceso',
  'marcos_normativos',
  'requisitos_normativos',
  'cuestionarios',
  'secciones',
  'preguntas',
  'asignaciones_cuestionario',
  'organigramas',
  'nodos_organigrama',
  'projects',
  'project_objectives',
  'project_kpis',
  'project_phases',
  'tasks',
  'notifications',
  'dashboard_configs',
  'dashboard_widgets',
  'notification_rules',
  'alert_rules',
  'expiration_rules',
  'events',
  'radios',
  'pulses',
  'radio_sync_logs',
];
