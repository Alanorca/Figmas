// ============================================================================
// DASHBOARD CUSTOMIZABLE - MODELOS
// ============================================================================
// Modelos para el sistema de dashboard con widgets arrastrables
// Usa angular-gridster2 para el layout
// ============================================================================

import { GridsterItem } from 'angular-gridster2';
import { FiltroActivo, TipoColumna } from './tabla-unificada.models';

// Configuración de columna para widget
export interface WidgetColumnConfig {
  field: string;
  header: string;
  tipo: TipoColumna;
  visible: boolean;
  orden: number;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}

// Ordenamiento para widget
export interface WidgetOrdenamiento {
  campo: string;
  direccion: 'asc' | 'desc';
}

// ==================== CONFIGURACIÓN DE GRÁFICAS ====================

// Tipos de gráfica disponibles
export type TipoGrafica = 'bar' | 'line' | 'donut' | 'area' | 'radar';

// Fuentes de datos para gráficas
export type ChartDataSource =
  | 'procesos'
  | 'alertas'
  | 'riesgos'
  | 'incidentes'
  | 'cumplimiento'
  | 'tendencias'
  | 'objetivos'
  | 'activos';

// Métricas disponibles para gráficas
export type ChartMetrica = 'cantidad' | 'porcentaje' | 'promedio' | 'suma' | 'maximo' | 'minimo';

// Agrupaciones disponibles
export type ChartAgrupacion = 'estado' | 'area' | 'responsable' | 'fecha' | 'prioridad' | 'tipo' | 'categoria' | 'mes' | 'semana';

// Períodos de tiempo
export type ChartPeriodo = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'todo' | 'personalizado';

// Posición de leyenda
export type LeyendaPosicion = 'top' | 'bottom' | 'right' | 'left' | 'hidden';

// Paletas de colores predefinidas
export type PaletaColores = 'corporativa' | 'semaforo' | 'gradiente-azul' | 'gradiente-verde' | 'pastel' | 'vibrante' | 'monocromatica';

// Configuración específica para gráficas de barras
export interface ChartBarConfig {
  orientacion: 'vertical' | 'horizontal';
  apilado: boolean;
  mostrarValores: boolean;
  bordeRedondeado: boolean;
  anchoBarras: number; // porcentaje 20-100
}

// Configuración específica para gráficas de líneas
export interface ChartLineConfig {
  curvaSuave: boolean;
  mostrarPuntos: boolean;
  tamañoPuntos: number;
  areaRellena: boolean;
  grosorLinea: number;
  lineaPunteada: boolean;
}

// Configuración específica para gráficas de dona
export interface ChartDonutConfig {
  grosorAnillo: number; // porcentaje 30-90
  mostrarValorCentral: boolean;
  valorCentralTipo: 'total' | 'porcentaje' | 'etiqueta';
  etiquetaCentral?: string;
  maxSegmentos: number; // agrupa "otros" si hay más
  mostrarPorcentajes: boolean;
}

// Configuración específica para gráficas de área
export interface ChartAreaConfig {
  gradiente: boolean;
  opacidad: number; // 0.1 - 1
  mostrarLineaSuperior: boolean;
  curvaSuave: boolean;
  apilado: boolean;
}

// Configuración de estilo visual
export interface ChartEstiloConfig {
  paleta: PaletaColores;
  coloresPersonalizados?: string[];
  leyendaPosicion: LeyendaPosicion;
  mostrarGrid: boolean;
  mostrarEjes: boolean;
  animaciones: boolean;
  tooltipEnabled: boolean;
}

// Configuración completa de gráfica
export interface ChartConfigCompleta {
  // Datos
  dataSource: ChartDataSource;
  metrica: ChartMetrica;
  agrupacion: ChartAgrupacion;
  periodo: ChartPeriodo;
  fechaInicio?: Date;
  fechaFin?: Date;
  filtros?: FiltroActivo[];

  // Estilo
  estilo: ChartEstiloConfig;

  // Configuración específica por tipo
  barConfig?: ChartBarConfig;
  lineConfig?: ChartLineConfig;
  donutConfig?: ChartDonutConfig;
  areaConfig?: ChartAreaConfig;

  // Interactividad
  clickable: boolean;
  zoomEnabled: boolean;
  exportable: boolean;

  // Actualización
  autoRefresh: boolean;
  refreshInterval: number; // segundos
}

// Tipos de widget disponibles
// Tipos de widget según historias de usuario (W1-W6)
export type TipoWidget =
  | 'kpi-card'              // W5: Tarjeta de KPI individual
  | 'kpi-grid'              // W5: Grid de KPIs (múltiples cards)
  | 'graficas-interactivas' // W1: Gráficas interactivas (todos los tipos)
  | 'graficas-guardadas'    // W2: Lista de gráficas guardadas
  | 'table-mini'            // W3: Tabla de datos
  | 'actividad-reciente'    // W4: Últimas actividades con filtros
  | 'calendario';           // W6: Calendario de eventos

// Tamaños predefinidos para widgets
export type TamanoWidget = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full';

// Configuración de tamaños
export const WIDGET_SIZES: Record<TamanoWidget, { cols: number; rows: number }> = {
  small: { cols: 1, rows: 1 },
  medium: { cols: 2, rows: 2 },
  large: { cols: 3, rows: 2 },
  wide: { cols: 4, rows: 1 },
  tall: { cols: 1, rows: 3 },
  full: { cols: 4, rows: 3 }
};

// Configuración avanzada de KPI
export interface KPIConfig {
  tipo: 'cumplimiento' | 'procesos' | 'alertas' | 'objetivos' | 'personalizado';
  colorPrimario?: string;
  colorSecundario?: string;
  icono?: string;
  mostrarTendencia?: boolean;
  mostrarMeta?: boolean;
  metaValor?: number;
  unidad?: string;
  formato?: 'numero' | 'porcentaje' | 'moneda';
  // Para KPI personalizado
  tituloPersonalizado?: string;
  valorPersonalizado?: number;
  descripcionPersonalizado?: string;
}

// Configuración específica de cada tipo de widget
export interface WidgetConfig {
  // Para KPI cards
  kpiId?: string;
  kpiType?: 'cumplimiento' | 'procesos' | 'alertas' | 'objetivos';
  kpiConfig?: KPIConfig;  // Configuración avanzada de KPI

  // Para gráficas (legacy - mantener compatibilidad)
  chartType?: 'bar' | 'line' | 'donut' | 'area' | 'radar';
  chartDataSource?: 'procesos' | 'alertas' | 'tendencia' | 'cumplimiento';
  chartOptions?: Record<string, any>;

  // Configuración avanzada de gráficas (nuevo)
  chartConfig?: ChartConfigCompleta;

  // Para tablas - opciones ampliadas de fuente de datos
  tableDataSource?: 'procesos' | 'alertas' | 'riesgos' | 'incidentes' | 'activos' | 'results-ml' | 'kpis' | 'objetivos';
  tableColumns?: string[];
  tableLimit?: number;

  // Configuración avanzada de tablas
  tableColumnsConfig?: WidgetColumnConfig[];  // Columnas con visibilidad y orden
  tableFilters?: FiltroActivo[];              // Filtros predeterminados
  tableOrdenamiento?: WidgetOrdenamiento;     // Ordenamiento por defecto

  // Para mapa de riesgos
  mapaRiesgosType?: 'probabilidad-impacto' | 'activos-amenazas' | 'controles-efectividad' | 'vulnerabilidades';

  // Para listas
  listFilter?: Record<string, any>;
  listLimit?: number;

  // Configuración de gráficas interactivas (modo widget)
  graficaTipo?: string;
  graficaFuenteDatos?: string;
  graficaAgrupacion?: string;       // Para gráficas circulares
  graficaValor?: string;            // Para gráficas circulares
  graficaEjeX?: string;             // Para gráficas de ejes
  graficaEjeY?: string;             // Para gráficas de ejes
  graficaSeries?: string;           // Para múltiples series
  graficaFiltroNivel?: string;      // Filtro por nivel/área
  graficaFiltroTipo?: string;       // Filtro por tipo específico
  graficaPaleta?: string;
  graficaAnimaciones?: boolean;
  graficaMostrarLeyenda?: boolean;
  graficaMostrarDataLabels?: boolean;
  graficaTema?: 'light' | 'dark';

  // Configuración general
  refreshInterval?: number; // en segundos, 0 = sin refresh
  showHeader?: boolean;
  showActions?: boolean;
  customStyles?: Record<string, string>;
}

// Widget del dashboard (extiende GridsterItem)
export interface DashboardWidget extends GridsterItem {
  id: string;
  tipo: TipoWidget;
  titulo: string;
  subtitulo?: string;
  icono?: string;
  config: WidgetConfig;

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;

  // Estado
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;

  // Permisos
  canResize?: boolean;
  canDrag?: boolean;
  canRemove?: boolean;
  canEdit?: boolean;
}

// Configuración del dashboard
export interface DashboardConfig {
  id: string;
  nombre: string;
  descripcion?: string;
  isDefault: boolean;
  isLocked: boolean;

  // Layout
  columns: number;
  rowHeight: number;
  gap: number;

  // Widgets
  widgets: DashboardWidget[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Estado del dashboard
export interface DashboardState {
  configActual: DashboardConfig | null;
  configuraciones: DashboardConfig[];
  modoEdicion: boolean;
  widgetSeleccionado: string | null;
  isDragging: boolean;
  isResizing: boolean;
  hasUnsavedChanges: boolean;
}

// Catálogo de widgets disponibles para agregar
export interface WidgetCatalogItem {
  tipo: TipoWidget;
  nombre: string;
  descripcion: string;
  icono: string;
  categoria: 'kpis' | 'graficas' | 'tablas' | 'listas' | 'otros' | 'indicadores' | 'datos' | 'actividad' | 'planificacion';
  tamanoDefault: TamanoWidget;
  minCols: number;
  minRows: number;
  maxCols: number;
  maxRows: number;
  configDefault: WidgetConfig;
}

// Catálogo de widgets según historias de usuario (W1-W6)
export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  // W5: Tarjetas KPI
  {
    tipo: 'kpi-card',
    nombre: 'Tarjeta KPI',
    descripcion: 'Indicador individual con valor, tendencia y drilldown',
    icono: 'pi pi-chart-line',
    categoria: 'indicadores',
    tamanoDefault: 'small',
    minCols: 1, minRows: 1, maxCols: 2, maxRows: 2,
    configDefault: { showHeader: true, showActions: true }
  },
  {
    tipo: 'kpi-grid',
    nombre: 'Grid de KPIs',
    descripcion: 'Múltiples indicadores en formato grid',
    icono: 'pi pi-th-large',
    categoria: 'indicadores',
    tamanoDefault: 'wide',
    minCols: 2, minRows: 1, maxCols: 4, maxRows: 2,
    configDefault: { showHeader: true }
  },

  // W1: Gráficas Interactivas
  {
    tipo: 'graficas-interactivas',
    nombre: 'Gráficas Interactivas',
    descripcion: 'Panel completo: barras, líneas, dona, área. Configuración, IA y guardado',
    icono: 'pi pi-chart-bar',
    categoria: 'graficas',
    tamanoDefault: 'large',
    minCols: 2, minRows: 2, maxCols: 4, maxRows: 4,
    configDefault: { showHeader: false }
  },

  // W2: Gráficas Guardadas
  {
    tipo: 'graficas-guardadas',
    nombre: 'Gráficas Guardadas',
    descripcion: 'Lista de configuraciones de gráficas guardadas',
    icono: 'pi pi-bookmark',
    categoria: 'graficas',
    tamanoDefault: 'medium',
    minCols: 2, minRows: 2, maxCols: 3, maxRows: 4,
    configDefault: { showHeader: true, listLimit: 10 }
  },

  // W3: Tablas
  {
    tipo: 'table-mini',
    nombre: 'Tabla de Datos',
    descripcion: 'Tabla con datos, ordenamiento y exportación CSV/Excel',
    icono: 'pi pi-table',
    categoria: 'datos',
    tamanoDefault: 'large',
    minCols: 2, minRows: 2, maxCols: 4, maxRows: 4,
    configDefault: { tableLimit: 10, showHeader: true }
  },

  // W4: Últimas Actividades
  {
    tipo: 'actividad-reciente',
    nombre: 'Últimas Actividades',
    descripcion: 'Actividad reciente con filtros por tipo y período',
    icono: 'pi pi-clock',
    categoria: 'actividad',
    tamanoDefault: 'medium',
    minCols: 2, minRows: 2, maxCols: 3, maxRows: 4,
    configDefault: { listLimit: 10, showHeader: true }
  },

  // W6: Calendario
  {
    tipo: 'calendario',
    nombre: 'Calendario',
    descripcion: 'Calendario con eventos, revisiones y fechas importantes',
    icono: 'pi pi-calendar',
    categoria: 'planificacion',
    tamanoDefault: 'medium',
    minCols: 2, minRows: 2, maxCols: 4, maxRows: 4,
    configDefault: { showHeader: true }
  }
];

// Configuración por defecto del dashboard
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  id: 'default',
  nombre: 'Dashboard Principal',
  descripcion: 'Vista ejecutiva de procesos y KPIs',
  isDefault: true,
  isLocked: false,
  columns: 4,
  rowHeight: 120,
  gap: 16,
  widgets: [
    // Fila 1: KPIs (W5)
    {
      id: 'widget-kpi-1',
      tipo: 'kpi-card',
      titulo: 'Cumplimiento General',
      icono: 'pi pi-percentage',
      x: 0, y: 0, cols: 1, rows: 1,
      config: { kpiType: 'cumplimiento', showHeader: true, showActions: true }
    },
    {
      id: 'widget-kpi-2',
      tipo: 'kpi-card',
      titulo: 'Procesos Activos',
      icono: 'pi pi-cog',
      x: 1, y: 0, cols: 1, rows: 1,
      config: { kpiType: 'procesos', showHeader: true, showActions: true }
    },
    {
      id: 'widget-kpi-3',
      tipo: 'kpi-card',
      titulo: 'Alertas Activas',
      icono: 'pi pi-exclamation-triangle',
      x: 2, y: 0, cols: 1, rows: 1,
      config: { kpiType: 'alertas', showHeader: true, showActions: true }
    },
    {
      id: 'widget-kpi-4',
      tipo: 'kpi-card',
      titulo: 'Objetivos Cumplidos',
      icono: 'pi pi-check-circle',
      x: 3, y: 0, cols: 1, rows: 1,
      config: { kpiType: 'objetivos', showHeader: true, showActions: true }
    },

    // Fila 2: Gráficas Interactivas (W1) y Tabla (W3)
    {
      id: 'widget-graficas',
      tipo: 'graficas-interactivas',
      titulo: 'Gráficas Interactivas',
      icono: 'pi pi-chart-bar',
      x: 0, y: 1, cols: 2, rows: 2,
      config: { showHeader: false }
    },
    {
      id: 'widget-tabla',
      tipo: 'table-mini',
      titulo: 'Procesos',
      icono: 'pi pi-table',
      x: 2, y: 1, cols: 2, rows: 2,
      config: { tableDataSource: 'procesos', tableLimit: 5, showHeader: true }
    },

    // Fila 3: Actividades (W4), Calendario (W6), Gráficas Guardadas (W2)
    {
      id: 'widget-actividades',
      tipo: 'actividad-reciente',
      titulo: 'Últimas Actividades',
      icono: 'pi pi-clock',
      x: 0, y: 3, cols: 2, rows: 2,
      config: { listLimit: 10, showHeader: true }
    },
    {
      id: 'widget-calendario',
      tipo: 'calendario',
      titulo: 'Calendario',
      icono: 'pi pi-calendar',
      x: 2, y: 3, cols: 2, rows: 2,
      config: { showHeader: true }
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Helper para generar ID único
export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper para crear un nuevo widget desde el catálogo
export function createWidgetFromCatalog(
  catalogItem: WidgetCatalogItem,
  position: { x: number; y: number }
): DashboardWidget {
  const size = WIDGET_SIZES[catalogItem.tamanoDefault];
  return {
    id: generateWidgetId(),
    tipo: catalogItem.tipo,
    titulo: catalogItem.nombre,
    icono: catalogItem.icono,
    x: position.x,
    y: position.y,
    cols: size.cols,
    rows: size.rows,
    config: { ...catalogItem.configDefault },
    canResize: true,
    canDrag: true,
    canRemove: true,
    canEdit: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
