// Tipos de nodos para el editor de procesos
export type ProcessNodeType =
  | 'activo'
  | 'csv'
  | 'transformacion'
  | 'condicional'
  | 'llm'
  | 'branching'
  | 'estado'
  | 'matematico'
  | 'ml'
  | 'kpi';

// Filtro para arrays de riesgos/incidentes
export interface FiltroRelacionados {
  campo: string;
  operador: 'igual' | 'diferente' | 'contiene' | 'mayor' | 'menor' | 'entre';
  valor: any;
  valorHasta?: any; // Para operador 'entre'
}

// Variable de salida del nodo activo
export interface ActivoOutputVariable {
  nombre: string;
  tipo: 'propiedad' | 'propiedadCustom' | 'riesgos' | 'incidentes' | 'defectos' | 'conteo';
  campo?: string; // Para propiedades específicas
  filtros?: FiltroRelacionados[]; // Para arrays filtrados
  descripcion?: string;
}

// Configuraciones específicas de cada tipo de nodo
export interface ActivoNodeConfig {
  // Identificación básica
  area: string;
  activoId: string;
  activoNombre: string;
  criticidad: 'alta' | 'media' | 'baja';

  // Referencia a plantilla (para saber qué propiedades custom tiene)
  plantillaId?: string;
  plantillaNombre?: string;

  // Propiedades del activo a exponer como variables
  propiedadesExpuestas: string[]; // campos de propiedades base (nombre, tipo, criticidad, etc.)
  propiedadesCustomExpuestas: string[]; // campos de propiedades custom

  // Configuración de arrays relacionados
  exponerRiesgos: boolean;
  filtrosRiesgos?: FiltroRelacionados[];
  exponerIncidentes: boolean;
  filtrosIncidentes?: FiltroRelacionados[];
  exponerDefectos: boolean;
  filtrosDefectos?: FiltroRelacionados[];

  // Variables de salida generadas
  variablesSalida: ActivoOutputVariable[];
}

export interface CsvNodeConfig {
  fileName: string | null;
  columns: string[];
  rowCount: number;
  delimiter: string;
  hasHeaders: boolean;
}

export interface TransformacionNodeConfig {
  operacion: 'mapear' | 'filtrar' | 'agregar' | 'ordenar' | 'enriquecer';
  mappings: { source: string; target: string }[];
  filterCondition?: string;
  aggregateField?: string;
  aggregateFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface CondicionalNodeConfig {
  variable: string;
  operador: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith';
  valor: string;
  tipoComparacion: 'string' | 'number' | 'boolean';
}

export interface LlmNodeConfig {
  provider: 'groq' | 'openai' | 'anthropic' | 'google';
  model: string;
  prompt: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  inputVariables: string[];
  outputVariable: string;
}

export interface BranchingNodeConfig {
  cantidadRamas: number;
  estrategia: 'paralela' | 'secuencial' | 'prioridad' | 'race';
  ramas: { id: string; nombre: string; condicion?: string }[];
}

export interface EstadoNodeConfig {
  tipoEstado: 'success' | 'warning' | 'error' | 'pending' | 'info';
  nombreEstado: string;
  mensaje: string;
  notificar: boolean;
  accionSiguiente: 'continuar' | 'detener' | 'rollback';
}

export interface MatematicoNodeConfig {
  formula: string;
  variablesSalida: string;
  precision: number;
}

export interface MlNodeConfig {
  modeloId: string;
  modeloNombre: string;
  tipoModelo: 'clasificacion' | 'regresion' | 'clustering' | 'anomalia';
  inputFeatures: string[];
  outputField: string;
  threshold?: number;
}

// Configuración del nodo Actualizar KPI
export interface KpiNodeConfig {
  // Origen del valor
  origenValor: 'variable' | 'fijo' | 'calculado';
  variableOrigen?: string;          // Variable del flujo que contiene el valor
  valorFijo?: number;               // Valor fijo manual
  nodoPrevioId?: string;            // ID del nodo previo para valor calculado

  // KPI destino
  kpiId: string;                    // ID del KPI a actualizar
  kpiNombre: string;                // Nombre del KPI para mostrar
  kpiUnidad: string;                // Unidad de medida (%, número, moneda, etc.)
  objetivoId?: string;              // ID del objetivo asociado

  // Configuración de alertas
  alertasHabilitadas: boolean;
  umbrales: {
    advertencia?: number;           // Umbral de advertencia
    critico?: number;               // Umbral crítico
    direccion: 'mayor' | 'menor';   // Si mayor o menor que el umbral dispara alerta
  };

  // Persistencia
  guardarHistorico: boolean;        // Almacenar fecha + valor para gráficas
  metadatosAdicionales?: {          // Datos adicionales a guardar
    campo: string;
    valor: string;
  }[];
}

// Union type de todas las configuraciones
export type ProcessNodeConfig =
  | ActivoNodeConfig
  | CsvNodeConfig
  | TransformacionNodeConfig
  | CondicionalNodeConfig
  | LlmNodeConfig
  | BranchingNodeConfig
  | EstadoNodeConfig
  | MatematicoNodeConfig
  | MlNodeConfig
  | KpiNodeConfig;

// Estructura de un nodo de proceso
export interface ProcessNode {
  id: string;
  type: ProcessNodeType;
  label: string;
  descripcion?: string;
  config: ProcessNodeConfig;
  position: { x: number; y: number };
}

// Conexión entre nodos
export interface ProcessEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;  // Para nodos condicionales: 'true' | 'false'
  targetHandle?: string;
  label?: string;
}

// Objetivo con KPIs asociados (usado en creación de proceso)
export interface ObjetivoProceso {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: KpiObjetivo[];
}

// KPI asociado a un objetivo
export interface KpiObjetivo {
  id: string;
  nombre: string;
  meta: number;
  escala: string;
}

// Proceso completo
export interface Proceso {
  id: string;
  nombre: string;
  descripcion: string;
  version: string;
  estado: 'borrador' | 'activo' | 'inactivo' | 'archivado';
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  objetivos?: ObjetivoProceso[];  // Objetivos configurados en la creación
  kpis?: KpiProceso[];            // KPIs del proceso (flat list para fácil acceso)
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Metadatos de tipos de nodos para el sidebar
export interface NodeTypeMetadata {
  type: ProcessNodeType;
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  descripcion: string;
  categoria: 'datos' | 'logica' | 'procesamiento' | 'estado' | 'ia';
}

export const NODE_TYPES_METADATA: NodeTypeMetadata[] = [
  {
    type: 'csv',
    icon: 'description',
    iconColor: '#ef6c00',
    bgColor: '#fff3e0',
    title: 'Archivo CSV/Excel',
    descripcion: 'Carga datos desde archivos CSV o Excel',
    categoria: 'datos'
  },
  {
    type: 'activo',
    icon: 'inventory_2',
    iconColor: '#2e7d32',
    bgColor: '#e8f5e9',
    title: 'Activo',
    descripcion: 'Expone propiedades, custom props y arrays de riesgos/incidentes filtrados',
    categoria: 'datos'
  },
  {
    type: 'transformacion',
    icon: 'transform',
    iconColor: '#7b1fa2',
    bgColor: '#f3e5f5',
    title: 'Transformación',
    descripcion: 'Mapea, filtra o agrega datos',
    categoria: 'procesamiento'
  },
  {
    type: 'condicional',
    icon: 'call_split',
    iconColor: '#1976d2',
    bgColor: '#e3f2fd',
    title: 'Condicional',
    descripcion: 'Ramifica el flujo según condiciones',
    categoria: 'logica'
  },
  {
    type: 'llm',
    icon: 'psychology',
    iconColor: '#00838f',
    bgColor: '#e0f7fa',
    title: 'Prompt LLM',
    descripcion: 'Procesa con modelos de lenguaje (Groq, OpenAI)',
    categoria: 'ia'
  },
  {
    type: 'branching',
    icon: 'account_tree',
    iconColor: '#22543d',
    bgColor: '#c6f6d5',
    title: 'Branching',
    descripcion: 'Crea flujos paralelos o secuenciales',
    categoria: 'logica'
  },
  {
    type: 'estado',
    icon: 'flag',
    iconColor: '#5e35b1',
    bgColor: '#ede7f6',
    title: 'Cambio de Estado',
    descripcion: 'Actualiza el estado del proceso',
    categoria: 'estado'
  },
  {
    type: 'matematico',
    icon: 'calculate',
    iconColor: '#c05621',
    bgColor: '#feebc8',
    title: 'Matemático',
    descripcion: 'Realiza cálculos y fórmulas',
    categoria: 'procesamiento'
  },
  {
    type: 'ml',
    icon: 'model_training',
    iconColor: '#234e52',
    bgColor: '#b2f5ea',
    title: 'Machine Learning',
    descripcion: 'Ejecuta modelos de ML',
    categoria: 'ia'
  },
  {
    type: 'kpi',
    icon: 'speed',
    iconColor: '#0d9488',
    bgColor: '#ccfbf1',
    title: 'Actualizar KPI',
    descripcion: 'Actualiza el valor de un KPI del proceso',
    categoria: 'estado'
  }
];

// Modelos disponibles para LLM
export const LLM_MODELS = {
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', maxTokens: 32768 },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', maxTokens: 8192 },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxTokens: 32768 },
    { id: 'gemma2-9b-it', name: 'Gemma 2 9B', maxTokens: 8192 }
  ],
  openai: [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
    { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 16385 }
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet', maxTokens: 200000 },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000 }
  ],
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro', maxTokens: 32768 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxTokens: 1000000 }
  ]
};

// ==================== KPI Types ====================

// Registro histórico de un KPI
export interface KpiHistoricoEntry {
  id: string;
  kpiId: string;
  valor: number;
  timestamp: Date;
  procesoId: string;
  nodoId: string;
  metadatos?: Record<string, any>;
}

// KPI asociado a un proceso
export interface KpiProceso {
  id: string;
  nombre: string;
  descripcion?: string;
  unidad: string;
  meta: number;
  valorActual: number;
  objetivoId?: string;
  fechaUltimaActualizacion?: Date;
  historico: KpiHistoricoEntry[];
  alertas: {
    advertencia?: number;
    critico?: number;
    direccion: 'mayor' | 'menor';
  };
}

// Unidades disponibles para KPIs
export const KPI_UNIDADES = [
  { value: 'porcentaje', label: 'Porcentaje (%)', symbol: '%' },
  { value: 'numero', label: 'Número', symbol: '' },
  { value: 'moneda_mxn', label: 'Pesos MXN', symbol: '$' },
  { value: 'moneda_usd', label: 'Dólares USD', symbol: 'USD' },
  { value: 'tiempo_dias', label: 'Días', symbol: 'd' },
  { value: 'tiempo_horas', label: 'Horas', symbol: 'h' },
  { value: 'cantidad', label: 'Cantidad', symbol: 'u' }
];

// Configuración por defecto para nuevo nodo KPI
export const DEFAULT_KPI_NODE_CONFIG: KpiNodeConfig = {
  origenValor: 'variable',
  kpiId: '',
  kpiNombre: '',
  kpiUnidad: 'porcentaje',
  alertasHabilitadas: false,
  umbrales: {
    direccion: 'menor'
  },
  guardarHistorico: true
};

// ==================== Configuración de Nodo Activo ====================

// Propiedades base disponibles para exponer
export const ACTIVO_PROPIEDADES_BASE = [
  { campo: 'id', nombre: 'ID', tipo: 'texto' },
  { campo: 'nombre', nombre: 'Nombre', tipo: 'texto' },
  { campo: 'descripcion', nombre: 'Descripción', tipo: 'texto' },
  { campo: 'tipo', nombre: 'Tipo de Activo', tipo: 'seleccion' },
  { campo: 'criticidad', nombre: 'Criticidad', tipo: 'seleccion' },
  { campo: 'responsable', nombre: 'Responsable', tipo: 'texto' },
  { campo: 'departamento', nombre: 'Departamento', tipo: 'texto' },
  { campo: 'fechaRegistro', nombre: 'Fecha de Registro', tipo: 'fecha' },
];

// Campos disponibles para filtrar riesgos
export const FILTRO_CAMPOS_RIESGOS = [
  { campo: 'estado', nombre: 'Estado', tipo: 'seleccion', opciones: ['identificado', 'evaluado', 'mitigado', 'aceptado'] },
  { campo: 'probabilidad', nombre: 'Probabilidad', tipo: 'numero' },
  { campo: 'impacto', nombre: 'Impacto', tipo: 'numero' },
  { campo: 'responsable', nombre: 'Responsable', tipo: 'texto' },
  { campo: 'fechaIdentificacion', nombre: 'Fecha Identificación', tipo: 'fecha' },
];

// Campos disponibles para filtrar incidentes
export const FILTRO_CAMPOS_INCIDENTES = [
  { campo: 'estado', nombre: 'Estado', tipo: 'seleccion', opciones: ['abierto', 'en_proceso', 'resuelto', 'cerrado'] },
  { campo: 'severidad', nombre: 'Severidad', tipo: 'seleccion', opciones: ['critica', 'alta', 'media', 'baja'] },
  { campo: 'reportadoPor', nombre: 'Reportado Por', tipo: 'texto' },
  { campo: 'fechaReporte', nombre: 'Fecha Reporte', tipo: 'fecha' },
];

// Campos disponibles para filtrar defectos
export const FILTRO_CAMPOS_DEFECTOS = [
  { campo: 'estado', nombre: 'Estado', tipo: 'seleccion', opciones: ['nuevo', 'confirmado', 'en_correccion', 'corregido', 'verificado'] },
  { campo: 'tipo', nombre: 'Tipo', tipo: 'seleccion', opciones: ['funcional', 'seguridad', 'rendimiento', 'usabilidad'] },
  { campo: 'prioridad', nombre: 'Prioridad', tipo: 'seleccion', opciones: ['critica', 'alta', 'media', 'baja'] },
  { campo: 'detectadoPor', nombre: 'Detectado Por', tipo: 'texto' },
  { campo: 'fechaDeteccion', nombre: 'Fecha Detección', tipo: 'fecha' },
];

// Operadores disponibles para filtros
export const FILTRO_OPERADORES = [
  { value: 'igual', label: 'Igual a' },
  { value: 'diferente', label: 'Diferente de' },
  { value: 'contiene', label: 'Contiene' },
  { value: 'mayor', label: 'Mayor que' },
  { value: 'menor', label: 'Menor que' },
  { value: 'entre', label: 'Entre' },
];

// Configuración por defecto para nuevo nodo Activo
export const DEFAULT_ACTIVO_NODE_CONFIG: ActivoNodeConfig = {
  area: '',
  activoId: '',
  activoNombre: '',
  criticidad: 'media',
  propiedadesExpuestas: ['nombre', 'tipo', 'criticidad'],
  propiedadesCustomExpuestas: [],
  exponerRiesgos: false,
  exponerIncidentes: false,
  exponerDefectos: false,
  variablesSalida: []
};
