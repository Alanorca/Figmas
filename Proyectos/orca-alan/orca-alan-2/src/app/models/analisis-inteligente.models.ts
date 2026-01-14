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
  | 'table';

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
  descriptivo: ['bar', 'pie', 'donut', 'table', 'treemap', 'funnel'],
  predictivo: ['line', 'area'],
  correlacion: ['scatter', 'heatmap', 'radar']
};
