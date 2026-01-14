// ============================================================================
// ORCA DESIGN SYSTEM - CONSTANTES DE DISEÑO
// ============================================================================
// Este archivo centraliza todas las constantes de diseño para TypeScript.
// Usar estas constantes para mantener consistencia en severidades, estados y colores.
// ============================================================================

// ----------------------------------------------------------------------------
// TIPOS
// ----------------------------------------------------------------------------

export type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
export type Size = 'small' | 'normal' | 'large';

// ----------------------------------------------------------------------------
// MAPEO DE SEVERIDADES
// ----------------------------------------------------------------------------

/**
 * Mapeo de criticidad a severidad de PrimeNG
 * Usar para: Activos, Riesgos
 */
export const CRITICALITY_SEVERITY: Record<string, Severity> = {
  critica: 'danger',
  alta: 'danger',
  media: 'warn',
  baja: 'success',
  muy_baja: 'info',
} as const;

/**
 * Mapeo de estados de proceso a severidad
 * Usar para: Procesos, Workflows
 */
export const PROCESS_STATUS_SEVERITY: Record<string, Severity> = {
  activo: 'success',
  borrador: 'secondary',
  inactivo: 'warn',
  archivado: 'danger',
  pendiente: 'info',
} as const;

/**
 * Mapeo de estados de incidentes a severidad
 * Usar para: Incidentes, Tickets
 */
export const INCIDENT_STATUS_SEVERITY: Record<string, Severity> = {
  abierto: 'danger',
  en_progreso: 'warn',
  en_revision: 'info',
  resuelto: 'success',
  cerrado: 'secondary',
} as const;

/**
 * Mapeo de tipos de defectos a severidad
 * Usar para: Defectos, Bugs
 */
export const DEFECT_TYPE_SEVERITY: Record<string, Severity> = {
  seguridad: 'danger',
  funcional: 'info',
  rendimiento: 'warn',
  usabilidad: 'secondary',
  documentacion: 'secondary',
} as const;

/**
 * Mapeo de nivel de riesgo calculado a severidad
 * Usar para: Matriz de riesgos
 */
export function getRiskLevelSeverity(riskScore: number): Severity {
  if (riskScore >= 15) return 'danger';   // Crítico
  if (riskScore >= 10) return 'warn';     // Alto
  if (riskScore >= 5) return 'info';      // Medio
  return 'success';                        // Bajo
}

/**
 * Obtiene el label del nivel de riesgo
 */
export function getRiskLevelLabel(riskScore: number): string {
  if (riskScore >= 15) return 'Crítico';
  if (riskScore >= 10) return 'Alto';
  if (riskScore >= 5) return 'Medio';
  return 'Bajo';
}

/**
 * Mapeo de cumplimiento a severidad
 * Usar para: Compliance, Cuestionarios
 */
export function getComplianceSeverity(percentage: number): Severity {
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'info';
  if (percentage >= 40) return 'warn';
  return 'danger';
}

// ----------------------------------------------------------------------------
// COLORES PARA GRÁFICOS
// ----------------------------------------------------------------------------

/**
 * Paleta de colores para gráficos y visualizaciones
 * Usar en Chart.js, ApexCharts
 */
export const CHART_COLORS = {
  blue: '#42A5F5',
  green: '#66BB6A',
  orange: '#FFA726',
  purple: '#AB47BC',
  cyan: '#26C6DA',
  red: '#EF5350',
  yellow: '#FFCA28',
  pink: '#EC407A',
  indigo: '#5C6BC0',
  teal: '#26A69A',
} as const;

/**
 * Paleta ordenada para uso secuencial en gráficos
 */
export const CHART_PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.teal,
  CHART_COLORS.yellow,
  CHART_COLORS.red,
] as const;

/**
 * Colores para estados de semáforo
 */
export const TRAFFIC_LIGHT_COLORS = {
  red: '#EF5350',
  yellow: '#FFCA28',
  green: '#66BB6A',
} as const;

/**
 * Colores con transparencia para fondos de gráficos
 */
export const CHART_COLORS_ALPHA = {
  blue: 'rgba(66, 165, 245, 0.2)',
  green: 'rgba(102, 187, 106, 0.2)',
  orange: 'rgba(255, 167, 38, 0.2)',
  purple: 'rgba(171, 71, 188, 0.2)',
  cyan: 'rgba(38, 198, 218, 0.2)',
  red: 'rgba(239, 83, 80, 0.2)',
} as const;

// ----------------------------------------------------------------------------
// DIMENSIONES DE COMPONENTES
// ----------------------------------------------------------------------------

/**
 * Anchos estándar para dialogs
 */
export const DIALOG_WIDTHS = {
  sm: '400px',
  md: '500px',
  lg: '650px',
  xl: '800px',
} as const;

/**
 * Anchos estándar para drawers
 */
export const DRAWER_WIDTHS = {
  sm: '350px',
  md: '400px',
  lg: '450px',
  xl: '550px',
} as const;

// ----------------------------------------------------------------------------
// ICONOS ESTANDARIZADOS
// ----------------------------------------------------------------------------

/**
 * Iconos por tipo de entidad
 */
export const ENTITY_ICONS = {
  activo: 'pi pi-box',
  riesgo: 'pi pi-exclamation-triangle',
  incidente: 'pi pi-bolt',
  defecto: 'pi pi-bug',
  proceso: 'pi pi-sitemap',
  cuestionario: 'pi pi-list-check',
  cumplimiento: 'pi pi-verified',
  usuario: 'pi pi-user',
  documento: 'pi pi-file',
  configuracion: 'pi pi-cog',
} as const;

/**
 * Iconos por acción
 */
export const ACTION_ICONS = {
  add: 'pi pi-plus',
  edit: 'pi pi-pencil',
  delete: 'pi pi-trash',
  view: 'pi pi-eye',
  download: 'pi pi-download',
  upload: 'pi pi-upload',
  search: 'pi pi-search',
  filter: 'pi pi-filter',
  refresh: 'pi pi-refresh',
  save: 'pi pi-check',
  cancel: 'pi pi-times',
  close: 'pi pi-times',
  expand: 'pi pi-chevron-down',
  collapse: 'pi pi-chevron-up',
  menu: 'pi pi-ellipsis-v',
  settings: 'pi pi-cog',
  export: 'pi pi-file-export',
  import: 'pi pi-file-import',
  copy: 'pi pi-copy',
  link: 'pi pi-link',
  send: 'pi pi-send',
} as const;

/**
 * Iconos por estado
 */
export const STATUS_ICONS = {
  success: 'pi pi-check-circle',
  warning: 'pi pi-exclamation-circle',
  error: 'pi pi-times-circle',
  info: 'pi pi-info-circle',
  pending: 'pi pi-clock',
  loading: 'pi pi-spin pi-spinner',
} as const;

// ----------------------------------------------------------------------------
// MENSAJES ESTANDARIZADOS
// ----------------------------------------------------------------------------

/**
 * Mensajes para empty states
 */
export const EMPTY_STATE_MESSAGES = {
  noData: 'No hay datos disponibles',
  noResults: 'No se encontraron resultados',
  noSelection: 'Selecciona un elemento para ver detalles',
  noPermission: 'No tienes permisos para ver este contenido',
  error: 'Ocurrió un error al cargar los datos',
} as const;

/**
 * Mensajes de confirmación
 */
export const CONFIRM_MESSAGES = {
  delete: '¿Estás seguro de que deseas eliminar este elemento?',
  deleteMultiple: '¿Estás seguro de que deseas eliminar los elementos seleccionados?',
  discard: '¿Deseas descartar los cambios sin guardar?',
  archive: '¿Estás seguro de que deseas archivar este elemento?',
} as const;

/**
 * Mensajes de éxito para toast
 */
export const SUCCESS_MESSAGES = {
  created: 'Elemento creado exitosamente',
  updated: 'Elemento actualizado exitosamente',
  deleted: 'Elemento eliminado exitosamente',
  saved: 'Cambios guardados exitosamente',
  imported: 'Datos importados exitosamente',
  exported: 'Datos exportados exitosamente',
} as const;

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

/**
 * Obtiene la severidad genérica basada en un valor string
 */
export function getSeverityFromValue(
  value: string,
  mapping: Record<string, Severity>
): Severity {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '_');
  return mapping[normalizedValue] ?? 'secondary';
}

/**
 * Genera clases CSS para un tag basado en severidad
 */
export function getTagClasses(severity: Severity): string {
  return `p-tag p-tag-${severity}`;
}
