// Tipos de nodos disponibles
export type NodeType =
  | 'csv'
  | 'activo'
  | 'transformacion'
  | 'condicional'
  | 'llm'
  | 'branching'
  | 'estado'
  | 'matematico'
  | 'ml'

// Metadata de cada tipo de nodo
export interface NodeTypeMetadata {
  type: NodeType
  label: string
  icon: string
  color: string
  gradient: string
  categoria: 'datos' | 'procesamiento' | 'logica' | 'ia' | 'estado'
  descripcion: string
}

// Configuraciones específicas por tipo
export interface CsvConfig {
  fileName: string
  delimiter: string
  hasHeaders: boolean
  columns: string[]
}

export interface ActivoConfig {
  activoId: string
  activoNombre: string
  area: string
  criticidad: 'alta' | 'media' | 'baja'
}

export interface TransformacionConfig {
  operacion: 'mapear' | 'filtrar' | 'agregar' | 'ordenar' | 'enriquecer' | 'agrupar'
  expresion: string
}

export interface CondicionalConfig {
  variable: string
  operador: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'startsWith' | 'endsWith'
  valor: string
}

export interface LlmConfig {
  model: string
  systemPrompt: string
  prompt: string
  temperature: number
  maxTokens: number
  topP: number
  onError: 'retry' | 'skip' | 'fail'
}

export interface BranchingConfig {
  cantidadRamas: number
  estrategia: 'paralela' | 'secuencial' | 'prioridad' | 'race'
}

export interface EstadoConfig {
  tipoEstado: 'success' | 'warning' | 'error' | 'pending' | 'info'
  nombreEstado: string
  mensaje: string
}

export interface MatematicoConfig {
  formula: string
  precision: number
}

export interface MlConfig {
  modeloNombre: string
  tipoModelo: 'clasificacion' | 'regresion' | 'clustering' | 'anomalia' | 'nlp'
  endpoint: string
  outputField: string
}

export type NodeConfig =
  | CsvConfig
  | ActivoConfig
  | TransformacionConfig
  | CondicionalConfig
  | LlmConfig
  | BranchingConfig
  | EstadoConfig
  | MatematicoConfig
  | MlConfig

// Nodo del proceso
export interface ProcessNode {
  id: string
  type: NodeType
  label: string
  config: NodeConfig
  position: { x: number; y: number }
  inputVariables: string[]
  outputVariable: string
}

// Conexión entre nodos
export interface ProcessEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

// Proceso completo
export interface Proceso {
  id: string
  nombre: string
  descripcion: string
  version: string
  estado: 'borrador' | 'activo' | 'inactivo'
  nodes: ProcessNode[]
  edges: ProcessEdge[]
  createdAt: Date
  updatedAt: Date
}

// Resultado de ejecución
export interface ExecutionResult {
  nodeId: string
  nodeName: string
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  output?: unknown
  error?: string
  duration?: number
}

export interface ProcessExecution {
  id: string
  procesoId: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  results: ExecutionResult[]
  context: Record<string, unknown>
}

// Metadata de todos los tipos de nodos
export const NODE_TYPES: NodeTypeMetadata[] = [
  {
    type: 'csv',
    label: 'Archivo CSV',
    icon: 'pi pi-file',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    categoria: 'datos',
    descripcion: 'Carga datos desde archivo CSV/Excel'
  },
  {
    type: 'activo',
    label: 'Activo',
    icon: 'pi pi-box',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    categoria: 'datos',
    descripcion: 'Referencia a un activo de la organización'
  },
  {
    type: 'transformacion',
    label: 'Transformación',
    icon: 'pi pi-sync',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    categoria: 'procesamiento',
    descripcion: 'Mapea, filtra o transforma datos'
  },
  {
    type: 'condicional',
    label: 'Condicional',
    icon: 'pi pi-sitemap',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    categoria: 'logica',
    descripcion: 'Bifurca el flujo según condiciones'
  },
  {
    type: 'llm',
    label: 'Prompt LLM',
    icon: 'pi pi-sparkles',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    categoria: 'ia',
    descripcion: 'Integración con modelos de IA (Groq)'
  },
  {
    type: 'branching',
    label: 'Branching',
    icon: 'pi pi-share-alt',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    categoria: 'logica',
    descripcion: 'Ejecuta múltiples ramas en paralelo'
  },
  {
    type: 'estado',
    label: 'Cambio Estado',
    icon: 'pi pi-flag',
    color: '#84cc16',
    gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)',
    categoria: 'estado',
    descripcion: 'Marca un estado en el flujo'
  },
  {
    type: 'matematico',
    label: 'Matemático',
    icon: 'pi pi-calculator',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    categoria: 'procesamiento',
    descripcion: 'Operaciones matemáticas y fórmulas'
  },
  {
    type: 'ml',
    label: 'Machine Learning',
    icon: 'pi pi-microchip-ai',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    categoria: 'ia',
    descripcion: 'Predicciones con modelos ML'
  }
]

// Configuraciones por defecto
export const DEFAULT_CONFIGS: Record<NodeType, () => NodeConfig> = {
  csv: () => ({ fileName: '', delimiter: ',', hasHeaders: true, columns: [] }),
  activo: () => ({ activoId: '', activoNombre: '', area: '', criticidad: 'media' }),
  transformacion: () => ({ operacion: 'mapear', expresion: '' }),
  condicional: () => ({ variable: '', operador: '==', valor: '' }),
  llm: () => ({
    model: 'llama-3.3-70b-versatile',
    systemPrompt: 'Eres un asistente experto en análisis de riesgos.',
    prompt: '',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1,
    onError: 'retry'
  }),
  branching: () => ({ cantidadRamas: 2, estrategia: 'paralela' }),
  estado: () => ({ tipoEstado: 'success', nombreEstado: 'Completado', mensaje: '' }),
  matematico: () => ({ formula: '', precision: 2 }),
  ml: () => ({ modeloNombre: '', tipoModelo: 'clasificacion', endpoint: '', outputField: 'prediccion' })
}
