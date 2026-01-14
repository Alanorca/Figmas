// Tipos para el módulo de Resultados de Inteligencia (ResultsML)

// Tipos base
export type TipoEntidadML = 'activo' | 'proceso';
export type TipoHallazgo = 'tendencia' | 'mitigacion' | 'oportunidad' | 'riesgo';
export type TipoTendencia = 'correlacion' | 'anomalia' | 'patron_temporal' | 'cluster';
export type TipoOportunidad = 'optimizacion' | 'eficiencia' | 'reduccion_costos';
export type TipoMitigacion = 'evitar' | 'transferir' | 'reducir' | 'aceptar';
export type EstadoHallazgo = 'pendiente' | 'aprobado' | 'descartado' | 'en_evaluacion' | 'implementado';
export type EstadoAnalisis = 'completado' | 'en_proceso' | 'error';
export type NivelConfianza = 'alta' | 'media' | 'baja';
export type NivelPrioridad = 'alta' | 'media' | 'baja';

// Entidad seleccionada (activo o proceso)
export interface EntidadML {
  id: string;
  nombre: string;
  tipo: TipoEntidadML;
  area?: string;
  responsable?: string;
  cantidadHallazgosPendientes: number;
}

// Resultado de análisis para una entidad
export interface ResultadoAnalisis {
  entidadId: string;
  entidadNombre: string;
  entidadTipo: TipoEntidadML;
  fechaUltimoAnalisis: Date;
  estadoAnalisis: EstadoAnalisis;
  contadores: ContadoresHallazgos;
  tendencias: Tendencia[];
  mitigaciones: MitigacionSugerida[];
  oportunidades: Oportunidad[];
  riesgos: RiesgoML[];
}

// Contadores de hallazgos
export interface ContadoresHallazgos {
  totalTendencias: number;
  totalMitigaciones: number;
  totalOportunidades: number;
  totalRiesgos: number;
  pendientes: number;
  aprobados: number;
  descartados: number;
}

// Base para todos los hallazgos
export interface HallazgoBase {
  id: string;
  tipoHallazgo: TipoHallazgo;
  titulo: string;
  descripcion: string;
  confianza: number; // 0-100
  fechaDeteccion: Date;
  estado: EstadoHallazgo;
  fuentesDatos: string[];
  entidadId: string;
}

// Tendencia detectada
export interface Tendencia extends HallazgoBase {
  tipoHallazgo: 'tendencia';
  tipoTendencia: TipoTendencia;
  datosInvolucrados?: string[];
  metricasEstadisticas?: MetricaEstadistica[];
  periodoAnalisis?: { desde: Date; hasta: Date };
  impactoEstimado?: string;
  visualizacionTipo?: 'scatter' | 'line' | 'bar';
}

// Mitigación sugerida
export interface MitigacionSugerida extends HallazgoBase {
  tipoHallazgo: 'mitigacion';
  tipoMitigacion?: TipoMitigacion;
  riesgoAsociado: string;
  prioridadSugerida: NivelPrioridad;
  tendenciaOrigenId?: string;
  beneficioEsperado?: string;
  esfuerzoEstimado?: 'bajo' | 'medio' | 'alto';
  justificacionModelo?: string;
  riesgoExistenteId?: string; // Si ya existe un riesgo en el sistema
}

// Oportunidad identificada
export interface Oportunidad extends HallazgoBase {
  tipoHallazgo: 'oportunidad';
  tipoOportunidad: TipoOportunidad;
  impactoEstimado: string;
  areaImpacto?: string;
  beneficioCuantificado?: string;
  riesgosImplementacion?: string;
  analisisModelo?: string;
}

// Riesgo identificado por ML
export interface RiesgoML extends HallazgoBase {
  tipoHallazgo: 'riesgo';
  nivelRiesgo: NivelPrioridad;
  probabilidad: number;
  impacto: number;
  factoresRiesgo?: string[];
  controlSugerido?: string;
}

// Métricas estadísticas para tendencias
export interface MetricaEstadistica {
  nombre: string;
  valor: number | string;
  descripcion?: string;
}

// Contexto agregado por usuario
export interface ContextoUsuario {
  id: string;
  entidadId: string;
  hallazgoId?: string; // Si es contexto específico de un hallazgo
  tipoContexto: 'evento_planificado' | 'cambio_reciente' | 'excepcion_conocida' | 'informacion_negocio' | 'otro';
  titulo: string;
  descripcion: string;
  periodoAplicacion?: { desde: Date; hasta: Date };
  relevancia: NivelPrioridad;
  adjuntos?: string[];
  fechaCreacion: Date;
  creadoPor: string;
  estado: 'activo' | 'expirado' | 'aplicado';
}

// Feedback del usuario
export interface FeedbackUsuario {
  id: string;
  hallazgoId: string;
  tipoFeedback: 'aprobacion' | 'descarte';
  motivo?: string;
  justificacion?: string;
  crearRiesgo?: boolean;
  crearTarea?: boolean;
  comentarios?: string;
  fecha: Date;
  usuario: string;
}

// Motivos de descarte predefinidos
export const MOTIVOS_DESCARTE = [
  { label: 'No aplica a este contexto', value: 'no_aplica' },
  { label: 'Ya fue implementado', value: 'ya_implementado' },
  { label: 'Información incorrecta', value: 'info_incorrecta' },
  { label: 'Prioridad muy baja', value: 'prioridad_baja' },
  { label: 'Duplicado de otra sugerencia', value: 'duplicado' },
  { label: 'Falso positivo', value: 'falso_positivo' },
  { label: 'Otro', value: 'otro' }
];

// Tipos de contexto
export const TIPOS_CONTEXTO = [
  { label: 'Evento planificado', value: 'evento_planificado', icon: 'pi pi-calendar' },
  { label: 'Cambio reciente', value: 'cambio_reciente', icon: 'pi pi-refresh' },
  { label: 'Excepción conocida', value: 'excepcion_conocida', icon: 'pi pi-exclamation-circle' },
  { label: 'Información de negocio', value: 'informacion_negocio', icon: 'pi pi-briefcase' },
  { label: 'Otro', value: 'otro', icon: 'pi pi-ellipsis-h' }
];

// Estado del módulo
export interface EstadoResultsML {
  entidadSeleccionada: EntidadML | null;
  categoriaActiva: TipoHallazgo;
  filtros: FiltroResultsML[];
  ordenamiento: { campo: string; direccion: 'asc' | 'desc' } | null;
}

// Filtros
export interface FiltroResultsML {
  campo: string;
  operador: string;
  valor: any;
  etiqueta: string;
}

// Opciones para selectores
export const ESTADO_HALLAZGO_OPTIONS = [
  { label: 'Pendiente', value: 'pendiente', severity: 'warn' as const },
  { label: 'Aprobado', value: 'aprobado', severity: 'success' as const },
  { label: 'Descartado', value: 'descartado', severity: 'secondary' as const },
  { label: 'En evaluación', value: 'en_evaluacion', severity: 'info' as const },
  { label: 'Implementado', value: 'implementado', severity: 'success' as const }
];

export const TIPO_TENDENCIA_OPTIONS = [
  { label: 'Correlación', value: 'correlacion', icon: 'pi pi-chart-scatter' },
  { label: 'Anomalía', value: 'anomalia', icon: 'pi pi-exclamation-triangle' },
  { label: 'Patrón Temporal', value: 'patron_temporal', icon: 'pi pi-clock' },
  { label: 'Cluster', value: 'cluster', icon: 'pi pi-th-large' }
];

export const PRIORIDAD_OPTIONS = [
  { label: 'Alta', value: 'alta', severity: 'danger' as const },
  { label: 'Media', value: 'media', severity: 'warn' as const },
  { label: 'Baja', value: 'baja', severity: 'success' as const }
];

export const TIPO_HALLAZGO_OPTIONS = [
  { label: 'Tendencia', value: 'tendencia', icon: 'pi pi-chart-line', severity: 'info' as const },
  { label: 'Mitigación', value: 'mitigacion', icon: 'pi pi-shield', severity: 'warn' as const },
  { label: 'Oportunidad', value: 'oportunidad', icon: 'pi pi-lightbulb', severity: 'success' as const },
  { label: 'Riesgo', value: 'riesgo', icon: 'pi pi-exclamation-triangle', severity: 'danger' as const }
];

export const CONFIANZA_RANGES = [
  { label: 'Alta (80-100%)', min: 80, max: 100, severity: 'success' as const },
  { label: 'Media (50-79%)', min: 50, max: 79, severity: 'warn' as const },
  { label: 'Baja (0-49%)', min: 0, max: 49, severity: 'danger' as const }
];
