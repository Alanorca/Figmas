// ============================================================================
// WIDGET DE ANÁLISIS INTELIGENTE - MODELOS
// ============================================================================
// Modelos para consultas NLP, análisis predictivo y correlación
// Basado en especificación Widget_Analisis_Inteligente_Especificacion.docx
// ============================================================================

// Tipos de análisis disponibles
export type TipoAnalisis = 'descriptivo' | 'predictivo' | 'correlacion';

// Entidades disponibles para análisis
export type EntidadAnalisis =
  | 'riesgos'
  | 'controles'
  | 'incidentes'
  | 'activos'
  | 'areas'
  | 'cumplimiento'
  | 'procesos'
  | 'objetivos';

// Tipos de visualización sugeridos
export type TipoVisualizacion =
  | 'bar'
  | 'line'
  | 'pie'
  | 'donut'
  | 'area'
  | 'scatter'
  | 'heatmap'
  | 'radar'
  | 'funnel'
  | 'treemap'
  | 'table'
  | 'sankey'
  | 'gauge';

// Horizonte de predicción
export type HorizontePrediccion = 1 | 3 | 6 | 12; // meses

// Nivel de confianza del modelo
export type NivelConfianza = 'alta' | 'media' | 'baja';

// Frecuencia de actualización
export type FrecuenciaActualizacion = 'tiempo-real' | 'diario' | 'semanal' | 'manual';

// ==================== CONSULTA NLP ====================

// Filtro detectado en la consulta
export interface FiltroDetectado {
  campo: string;
  operador: 'igual' | 'mayor' | 'menor' | 'entre' | 'contiene';
  valor: string | number | Date;
  valorHasta?: string | number | Date;
  etiqueta: string;
}

// Interpretación de consulta NLP
export interface InterpretacionConsulta {
  consultaOriginal: string;
  entidadesDetectadas: EntidadAnalisis[];
  filtrosImplicitos: FiltroDetectado[];
  tipoAnalisisSugerido: TipoAnalisis;
  periodo?: {
    desde: Date;
    hasta: Date;
    etiqueta: string;
  };
  agrupacion?: string;
  metrica?: string;
  confianzaInterpretacion: number; // 0-100
  sugerenciasAlternativas?: string[];
}

// Consulta guardada en historial
export interface ConsultaHistorial {
  id: string;
  texto: string;
  fecha: Date;
  tipoAnalisis: TipoAnalisis;
  entidades: EntidadAnalisis[];
}

// ==================== VISUALIZACIÓN ====================

// Opción de visualización sugerida
export interface VisualizacionSugerida {
  tipo: TipoVisualizacion;
  nombre: string;
  icono: string;
  descripcion: string;
  recomendado: boolean;
  razonRecomendacion?: string;
  preview?: string; // URL o base64 de miniatura
}

// Configuración de visualización
export interface ConfiguracionVisualizacion {
  tipo: TipoVisualizacion;
  titulo: string;
  subtitulo?: string;

  // Colores y estilo
  paleta: 'corporativa' | 'semaforo' | 'gradiente' | 'pastel';
  mostrarLeyenda: boolean;
  posicionLeyenda: 'top' | 'bottom' | 'right' | 'left';
  mostrarDataLabels: boolean;
  mostrarGrid: boolean;
  animaciones: boolean;

  // Ejes (para gráficas con ejes)
  ejeX?: {
    campo: string;
    etiqueta: string;
    formato?: 'numero' | 'porcentaje' | 'fecha' | 'moneda';
  };
  ejeY?: {
    campo: string;
    etiqueta: string;
    formato?: 'numero' | 'porcentaje' | 'fecha' | 'moneda';
  };

  // Agrupación (para gráficas circulares)
  agrupacion?: string;
  metrica?: 'conteo' | 'suma' | 'promedio';
  campoValor?: string;
}

// ==================== ANÁLISIS PREDICTIVO ====================

// Punto de datos con predicción
export interface PuntoPrediccion {
  fecha: Date;
  valor: number;
  esPrediccion: boolean;
  intervaloConfianza?: {
    min: number;
    max: number;
  };
}

// Resultado de análisis predictivo
export interface ResultadoPredictivo {
  datosHistoricos: PuntoPrediccion[];
  datosPrediccion: PuntoPrediccion[];
  horizonteMeses: HorizontePrediccion;
  nivelConfianza: NivelConfianza;
  porcentajeConfianza: number; // 0-100
  tendencia: 'ascendente' | 'descendente' | 'estable';
  resumenTexto: string;
  disclaimer: string;
}

// ==================== ANÁLISIS DE CORRELACIÓN ====================

// Par de correlación
export interface ParCorrelacion {
  variable1: string;
  variable2: string;
  coeficiente: number; // -1 a 1
  fuerza: 'fuerte' | 'moderada' | 'debil';
  direccion: 'positiva' | 'negativa';
  interpretacion: string;
}

// Punto para scatter plot
export interface PuntoScatter {
  x: number;
  y: number;
  etiqueta?: string;
  categoria?: string;
}

// Resultado de análisis de correlación
export interface ResultadoCorrelacion {
  variables: string[];
  matriz: number[][]; // Matriz de correlación
  pares: ParCorrelacion[];
  puntosMejorCorrelacion: PuntoScatter[];
  lineaTendencia?: {
    pendiente: number;
    intercepto: number;
    r2: number;
  };
  interpretacionGeneral: string;
}

// ==================== RESULTADO COMPLETO ====================

// Versión del resultado (para historial de refinamiento)
export interface VersionResultado {
  id: string;
  numero: number;
  fecha: Date;
  feedback?: string;
  configuracion: ConfiguracionVisualizacion;
  datos: any;
}

// Resultado completo del análisis
export interface ResultadoAnalisis {
  id: string;
  consulta: string;
  interpretacion: InterpretacionConsulta;
  tipoAnalisis: TipoAnalisis;
  configuracionVisualizacion: ConfiguracionVisualizacion;

  // Datos según tipo de análisis
  datosDescriptivos?: {
    labels: string[];
    series: number[];
    total?: number;
    estadisticas?: {
      min: number;
      max: number;
      promedio: number;
      mediana: number;
    };
  };
  datosPredictivos?: ResultadoPredictivo;
  datosCorrelacion?: ResultadoCorrelacion;

  // Metadata
  fechaGeneracion: Date;
  tiempoProcesamientoMs: number;
  versiones: VersionResultado[];
  versionActual: number;
}

// ==================== WIDGET CONFIG ====================

// Configuración del widget guardado
export interface AnalisisInteligenteWidgetConfig {
  // Resultado pre-generado (para widgets del dashboard)
  analisisResultado?: ResultadoAnalisis;

  consultaInicial?: string;
  tipoAnalisisDefault?: TipoAnalisis;
  entidadesPermitidas?: EntidadAnalisis[];
  visualizacionDefault?: TipoVisualizacion;
  graficaTipo?: TipoVisualizacion;
  showHeader?: boolean;

  // Predicción
  horizontePrediccion?: HorizontePrediccion;
  mostrarIntervaloConfianza?: boolean;

  // Correlación
  variablesCorrelacion?: string[];

  // Actualización
  frecuenciaActualizacion?: FrecuenciaActualizacion;
  ultimaActualizacion?: Date;

  // UI
  mostrarHistorialConsultas?: boolean;
  mostrarSugerencias?: boolean;
  modoCompacto?: boolean;
}

// Estado del widget
export interface AnalisisInteligenteState {
  paso: 'input' | 'interpretacion' | 'resultado' | 'refinamiento';
  consultaActual: string;
  interpretacion: InterpretacionConsulta | null;
  visualizacionessugeridas: VisualizacionSugerida[];
  visualizacionSeleccionada: TipoVisualizacion | null;
  resultado: ResultadoAnalisis | null;

  // UI State
  isProcessing: boolean;
  error: string | null;
  historialConsultas: ConsultaHistorial[];
  feedbackActual: string;
}

// ==================== V2: DATA SOURCING (Capa 1) ====================

// Categoría de fuente de datos
export type CategoriaFuente = 'grc' | 'seguridad' | 'cumplimiento' | 'operaciones';

// Fuente de datos disponible para análisis
export interface FuenteDatos {
  id: string;
  nombre: string;
  categoria: CategoriaFuente;
  entidad: EntidadAnalisis;
  conteoRegistros: number;
  ultimaActualizacion: Date;
  relaciones: string[]; // IDs de fuentes relacionadas
  icono: string;
}

// Filtro de extracción dinámico
export interface FiltroExtraccion {
  rangoFechas?: { desde: Date; hasta: Date };
  atributos: Record<string, string | number | boolean>;
  estado?: string;
  categoria?: string;
  entidades: EntidadAnalisis[];
}

// Resumen de alcance antes de ejecutar análisis
export interface ResumenAlcance {
  totalRegistros: number;
  fuentesSeleccionadas: number;
  periodo: string;
  filtrosAplicados: string[];
  entidades: EntidadAnalisis[];
}

// ==================== V2: IA INSIGHTS (Capa 6) ====================

// Severidad de hallazgo
export type SeveridadInsight = 'critica' | 'alta' | 'media' | 'baja';

// Hallazgo generado por IA
export interface InsightIA {
  id: string;
  titulo: string;
  descripcion: string;
  severidad: SeveridadInsight;
  datoEstadistico: string; // Ej: "45% de incremento"
  entidadRelacionada?: EntidadAnalisis;
  accionado: boolean;
}

// ==================== V2: ACCIONES ASISTIDAS (Capa 7) ====================

// Tipo de entidad a crear desde un hallazgo
export type TipoAccionEntidad =
  | 'riesgo'
  | 'incidente'
  | 'control'
  | 'mitigacion'
  | 'oportunidad'
  | 'proyecto'
  | 'activo';

// Acción sugerida por la IA
export interface AccionSugerida {
  id: string;
  tipo: TipoAccionEntidad;
  titulo: string;
  descripcion: string;
  prioridad: 'alta' | 'media' | 'baja';
  datosPreCargados: Record<string, any>;
  insightOrigenId: string;
  ejecutada: boolean;
  entidadCreadaId?: string;
}

// ==================== V2: RESPUESTA LLM ESTRUCTURADA ====================

// Respuesta estructurada del LLM
export interface RespuestaIA {
  chartType: TipoVisualizacion;
  titulo: string;
  data: {
    labels: string[];
    series: number[];
    datasets?: { name: string; data: number[] }[];
  };
  insights: InsightIA[];
  actions: AccionSugerida[];
  resumenEjecutivo: string;
}

// ==================== V2: DRILL DOWN (Capa 5) ====================

// Nivel individual del drill-down
export interface NivelDrillDown {
  nivel: number;
  titulo: string;
  tipoGrafico: TipoVisualizacion;
  datos: {
    labels: string[];
    series: number[];
    registros?: any[];
  };
  elementoSeleccionado?: string;
  filtroAplicado?: string;
}

// Estado completo del drill-down
export interface EstadoDrillDown {
  niveles: NivelDrillDown[];
  nivelActual: number;
  breadcrumb: string[];
  entidadBase: EntidadAnalisis;
}

// ==================== V2: INSIGHT DRAWER (Capa 6) ====================

// Comparativo benchmark (MoM, QoQ, YoY)
export interface ComparativoBenchmark {
  tipo: 'MoM' | 'QoQ' | 'YoY';
  etiqueta: string;
  valorAnterior: number;
  valorActual: number;
  porcentajeCambio: number;
  direccion: 'up' | 'down' | 'stable';
}

// Contenido completo del Insight Drawer
export interface ContenidoInsightDrawer {
  resumenEjecutivo: string;
  hallazgos: InsightIA[];
  comparativos: ComparativoBenchmark[];
  acciones: AccionSugerida[];
  fuentesAnalizadas: string[];
  periodoAnalisis: string;
  fechaGeneracion: Date;
}

// ==================== V2: PROGRESO Y ESTADOS (Capa 8) ====================

// Etapa del proceso de análisis
export type EtapaProgreso = 'extrayendo' | 'transformando' | 'analizando' | 'generando';

// Registro de auditoría de acciones ejecutadas
export interface AuditLogEntry {
  id: string;
  fecha: Date;
  accionId: string;
  tipoEntidad: TipoAccionEntidad;
  entidadCreadaId: string;
  usuario: string;
  contextoAnalisis: string;
  detalles: Record<string, any>;
}

// Jerarquía de drill-down por entidad
export type JerarquiaDrillDown = {
  nivel1: string;
  nivel2: string;
  nivel3: string;
};

export const JERARQUIAS_DRILL_DOWN: Record<string, JerarquiaDrillDown> = {
  riesgos: { nivel1: 'Categoría', nivel2: 'Estado', nivel3: 'Registros individuales' },
  incidentes: { nivel1: 'Severidad', nivel2: 'Temporal', nivel3: 'Registros individuales' },
  activos: { nivel1: 'Tipo', nivel2: 'Estado', nivel3: 'Registros individuales' },
  controles: { nivel1: 'Tipo', nivel2: 'Efectividad', nivel3: 'Registros individuales' },
  cumplimiento: { nivel1: 'Regulación', nivel2: 'Estado', nivel3: 'Registros individuales' },
  procesos: { nivel1: 'Estado', nivel2: 'Cumplimiento', nivel3: 'Registros individuales' },
  areas: { nivel1: 'Departamento', nivel2: 'Riesgos', nivel3: 'Registros individuales' },
  objetivos: { nivel1: 'Estado', nivel2: 'Progreso', nivel3: 'Registros individuales' }
};

// Fuentes de datos predefinidas
export const FUENTES_DATOS_DISPONIBLES: FuenteDatos[] = [
  { id: 'riesgos', nombre: 'Registro de Riesgos', categoria: 'grc', entidad: 'riesgos', conteoRegistros: 156, ultimaActualizacion: new Date(), relaciones: ['controles', 'incidentes'], icono: 'pi pi-shield' },
  { id: 'controles', nombre: 'Controles Implementados', categoria: 'grc', entidad: 'controles', conteoRegistros: 89, ultimaActualizacion: new Date(), relaciones: ['riesgos'], icono: 'pi pi-check-square' },
  { id: 'incidentes', nombre: 'Incidentes de Seguridad', categoria: 'seguridad', entidad: 'incidentes', conteoRegistros: 234, ultimaActualizacion: new Date(), relaciones: ['riesgos', 'activos'], icono: 'pi pi-exclamation-triangle' },
  { id: 'activos', nombre: 'Inventario de Activos', categoria: 'seguridad', entidad: 'activos', conteoRegistros: 312, ultimaActualizacion: new Date(), relaciones: ['incidentes'], icono: 'pi pi-box' },
  { id: 'cumplimiento', nombre: 'Estado de Cumplimiento', categoria: 'cumplimiento', entidad: 'cumplimiento', conteoRegistros: 45, ultimaActualizacion: new Date(), relaciones: ['procesos'], icono: 'pi pi-verified' },
  { id: 'procesos', nombre: 'Procesos de Negocio', categoria: 'operaciones', entidad: 'procesos', conteoRegistros: 67, ultimaActualizacion: new Date(), relaciones: ['cumplimiento', 'objetivos'], icono: 'pi pi-cog' },
  { id: 'areas', nombre: 'Áreas Organizativas', categoria: 'operaciones', entidad: 'areas', conteoRegistros: 28, ultimaActualizacion: new Date(), relaciones: ['riesgos', 'activos'], icono: 'pi pi-sitemap' },
  { id: 'objetivos', nombre: 'Objetivos Estratégicos', categoria: 'operaciones', entidad: 'objetivos', conteoRegistros: 18, ultimaActualizacion: new Date(), relaciones: ['procesos'], icono: 'pi pi-flag' }
];

// ==================== EJEMPLOS Y SUGERENCIAS ====================

// Ejemplo de consulta sugerida
export interface EjemploConsulta {
  texto: string;
  categoria: 'descriptivo' | 'predictivo' | 'correlacion';
  entidades: EntidadAnalisis[];
}

// Sugerencias predefinidas
export const EJEMPLOS_CONSULTAS: EjemploConsulta[] = [
  // Descriptivo
  { texto: '¿Cuántos riesgos críticos hay por área?', categoria: 'descriptivo', entidades: ['riesgos', 'areas'] },
  { texto: 'Distribución de incidentes por severidad', categoria: 'descriptivo', entidades: ['incidentes'] },
  { texto: 'Top 10 controles más costosos', categoria: 'descriptivo', entidades: ['controles'] },
  { texto: 'Estado de cumplimiento por proceso', categoria: 'descriptivo', entidades: ['cumplimiento', 'procesos'] },

  // Predictivo
  { texto: '¿Cuál será la tendencia de incidentes los próximos 6 meses?', categoria: 'predictivo', entidades: ['incidentes'] },
  { texto: 'Proyección de cumplimiento regulatorio para fin de año', categoria: 'predictivo', entidades: ['cumplimiento'] },
  { texto: 'Predicción de riesgos materializados por trimestre', categoria: 'predictivo', entidades: ['riesgos'] },

  // Correlación
  { texto: '¿Existe relación entre controles implementados y reducción de incidentes?', categoria: 'correlacion', entidades: ['controles', 'incidentes'] },
  { texto: 'Correlación entre inversión en seguridad e incidentes por área', categoria: 'correlacion', entidades: ['areas', 'incidentes'] },
  { texto: '¿Qué variables impactan más en el nivel de riesgo?', categoria: 'correlacion', entidades: ['riesgos'] }
];

// Atributos por entidad (para autocompletado)
export const ATRIBUTOS_ENTIDADES: Record<EntidadAnalisis, { campo: string; etiqueta: string }[]> = {
  riesgos: [
    { campo: 'nivel', etiqueta: 'Nivel de Riesgo' },
    { campo: 'categoria', etiqueta: 'Categoría' },
    { campo: 'probabilidad', etiqueta: 'Probabilidad' },
    { campo: 'impacto', etiqueta: 'Impacto' },
    { campo: 'estado', etiqueta: 'Estado' },
    { campo: 'area', etiqueta: 'Área' }
  ],
  controles: [
    { campo: 'tipo', etiqueta: 'Tipo' },
    { campo: 'efectividad', etiqueta: 'Efectividad' },
    { campo: 'frecuencia', etiqueta: 'Frecuencia' },
    { campo: 'costo', etiqueta: 'Costo' },
    { campo: 'responsable', etiqueta: 'Responsable' }
  ],
  incidentes: [
    { campo: 'severidad', etiqueta: 'Severidad' },
    { campo: 'fecha', etiqueta: 'Fecha' },
    { campo: 'impactoFinanciero', etiqueta: 'Impacto Financiero' },
    { campo: 'tiempoResolucion', etiqueta: 'Tiempo de Resolución' }
  ],
  activos: [
    { campo: 'tipo', etiqueta: 'Tipo' },
    { campo: 'valor', etiqueta: 'Valor' },
    { campo: 'criticidad', etiqueta: 'Criticidad' },
    { campo: 'ubicacion', etiqueta: 'Ubicación' },
    { campo: 'propietario', etiqueta: 'Propietario' }
  ],
  areas: [
    { campo: 'nombre', etiqueta: 'Nombre' },
    { campo: 'responsable', etiqueta: 'Responsable' },
    { campo: 'presupuesto', etiqueta: 'Presupuesto' },
    { campo: 'headcount', etiqueta: 'Personal' }
  ],
  cumplimiento: [
    { campo: 'regulacion', etiqueta: 'Regulación' },
    { campo: 'porcentaje', etiqueta: '% Cumplimiento' },
    { campo: 'gaps', etiqueta: 'Gaps' },
    { campo: 'fechaAuditoria', etiqueta: 'Fecha Auditoría' }
  ],
  procesos: [
    { campo: 'nombre', etiqueta: 'Nombre' },
    { campo: 'estado', etiqueta: 'Estado' },
    { campo: 'cumplimiento', etiqueta: 'Cumplimiento' },
    { campo: 'objetivos', etiqueta: 'Objetivos' }
  ],
  objetivos: [
    { campo: 'nombre', etiqueta: 'Nombre' },
    { campo: 'progreso', etiqueta: 'Progreso' },
    { campo: 'estado', etiqueta: 'Estado' },
    { campo: 'fechaLimite', etiqueta: 'Fecha Límite' }
  ]
};

// Visualizaciones recomendadas por tipo de análisis
export const VISUALIZACIONES_POR_TIPO: Record<TipoAnalisis, TipoVisualizacion[]> = {
  descriptivo: ['bar', 'pie', 'donut', 'table', 'treemap', 'funnel', 'gauge'],
  predictivo: ['line', 'area', 'sankey'],
  correlacion: ['scatter', 'heatmap', 'radar']
};
