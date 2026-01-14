// ============================================================================
// WIDGET CHART CONFIG
// ============================================================================
// Configuraciones predefinidas y opciones para gráficas de dashboard
// ============================================================================

import {
  TipoGrafica,
  ChartDataSource,
  ChartMetrica,
  ChartAgrupacion,
  ChartPeriodo,
  PaletaColores,
  LeyendaPosicion,
  ChartConfigCompleta,
  ChartBarConfig,
  ChartLineConfig,
  ChartDonutConfig,
  ChartAreaConfig,
  ChartEstiloConfig
} from './dashboard.models';

// ==================== OPCIONES DISPONIBLES ====================

// Fuentes de datos con metadatos
export interface DataSourceOption {
  value: ChartDataSource;
  label: string;
  descripcion: string;
  icono: string;
  metricasDisponibles: ChartMetrica[];
  agrupacionesDisponibles: ChartAgrupacion[];
}

export const CHART_DATA_SOURCES: DataSourceOption[] = [
  {
    value: 'procesos',
    label: 'Procesos',
    descripcion: 'Datos de procesos y su estado',
    icono: 'pi pi-cog',
    metricasDisponibles: ['cantidad', 'porcentaje', 'promedio'],
    agrupacionesDisponibles: ['estado', 'area', 'responsable', 'mes', 'semana']
  },
  {
    value: 'alertas',
    label: 'Alertas',
    descripcion: 'Alertas del sistema por severidad y tipo',
    icono: 'pi pi-exclamation-triangle',
    metricasDisponibles: ['cantidad', 'porcentaje'],
    agrupacionesDisponibles: ['estado', 'tipo', 'prioridad', 'fecha', 'mes']
  },
  {
    value: 'riesgos',
    label: 'Riesgos',
    descripcion: 'Matriz y análisis de riesgos',
    icono: 'pi pi-shield',
    metricasDisponibles: ['cantidad', 'porcentaje', 'promedio', 'maximo'],
    agrupacionesDisponibles: ['estado', 'area', 'prioridad', 'categoria', 'responsable']
  },
  {
    value: 'incidentes',
    label: 'Incidentes',
    descripcion: 'Registro de incidentes',
    icono: 'pi pi-bolt',
    metricasDisponibles: ['cantidad', 'porcentaje', 'promedio'],
    agrupacionesDisponibles: ['estado', 'tipo', 'prioridad', 'area', 'mes']
  },
  {
    value: 'cumplimiento',
    label: 'Cumplimiento',
    descripcion: 'Niveles de cumplimiento normativo',
    icono: 'pi pi-check-circle',
    metricasDisponibles: ['porcentaje', 'promedio'],
    agrupacionesDisponibles: ['area', 'responsable', 'categoria', 'mes']
  },
  {
    value: 'tendencias',
    label: 'Tendencias',
    descripcion: 'Evolución temporal de métricas',
    icono: 'pi pi-chart-line',
    metricasDisponibles: ['cantidad', 'porcentaje', 'promedio'],
    agrupacionesDisponibles: ['mes', 'semana', 'fecha']
  },
  {
    value: 'objetivos',
    label: 'Objetivos',
    descripcion: 'Progreso de objetivos estratégicos',
    icono: 'pi pi-flag',
    metricasDisponibles: ['porcentaje', 'cantidad'],
    agrupacionesDisponibles: ['estado', 'area', 'responsable', 'prioridad']
  },
  {
    value: 'activos',
    label: 'Activos',
    descripcion: 'Inventario de activos de información',
    icono: 'pi pi-database',
    metricasDisponibles: ['cantidad', 'porcentaje'],
    agrupacionesDisponibles: ['tipo', 'categoria', 'area', 'estado']
  }
];

// Métricas con metadatos
export interface MetricaOption {
  value: ChartMetrica;
  label: string;
  descripcion: string;
}

export const CHART_METRICAS: MetricaOption[] = [
  { value: 'cantidad', label: 'Cantidad', descripcion: 'Número total de elementos' },
  { value: 'porcentaje', label: 'Porcentaje', descripcion: 'Proporción sobre el total' },
  { value: 'promedio', label: 'Promedio', descripcion: 'Media aritmética de valores' },
  { value: 'suma', label: 'Suma', descripcion: 'Total acumulado' },
  { value: 'maximo', label: 'Máximo', descripcion: 'Valor más alto' },
  { value: 'minimo', label: 'Mínimo', descripcion: 'Valor más bajo' }
];

// Agrupaciones con metadatos
export interface AgrupacionOption {
  value: ChartAgrupacion;
  label: string;
  descripcion: string;
}

export const CHART_AGRUPACIONES: AgrupacionOption[] = [
  { value: 'estado', label: 'Estado', descripcion: 'Agrupar por estado actual' },
  { value: 'area', label: 'Área', descripcion: 'Agrupar por área o departamento' },
  { value: 'responsable', label: 'Responsable', descripcion: 'Agrupar por persona responsable' },
  { value: 'fecha', label: 'Fecha', descripcion: 'Agrupar por día' },
  { value: 'prioridad', label: 'Prioridad', descripcion: 'Agrupar por nivel de prioridad' },
  { value: 'tipo', label: 'Tipo', descripcion: 'Agrupar por tipo o categoría' },
  { value: 'categoria', label: 'Categoría', descripcion: 'Agrupar por categoría' },
  { value: 'mes', label: 'Mes', descripcion: 'Agrupar por mes' },
  { value: 'semana', label: 'Semana', descripcion: 'Agrupar por semana' }
];

// Períodos con metadatos
export interface PeriodoOption {
  value: ChartPeriodo;
  label: string;
  descripcion: string;
}

export const CHART_PERIODOS: PeriodoOption[] = [
  { value: 'hoy', label: 'Hoy', descripcion: 'Solo el día actual' },
  { value: 'semana', label: 'Esta semana', descripcion: 'Últimos 7 días' },
  { value: 'mes', label: 'Este mes', descripcion: 'Últimos 30 días' },
  { value: 'trimestre', label: 'Este trimestre', descripcion: 'Últimos 90 días' },
  { value: 'año', label: 'Este año', descripcion: 'Últimos 365 días' },
  { value: 'todo', label: 'Todo', descripcion: 'Sin límite de tiempo' },
  { value: 'personalizado', label: 'Personalizado', descripcion: 'Rango de fechas específico' }
];

// Paletas de colores con valores
export interface PaletaOption {
  value: PaletaColores;
  label: string;
  colores: string[];
}

export const CHART_PALETAS: PaletaOption[] = [
  {
    value: 'corporativa',
    label: 'Corporativa',
    colores: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  },
  {
    value: 'semaforo',
    label: 'Semáforo',
    colores: ['#22C55E', '#EAB308', '#F97316', '#EF4444']
  },
  {
    value: 'gradiente-azul',
    label: 'Gradiente Azul',
    colores: ['#DBEAFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8']
  },
  {
    value: 'gradiente-verde',
    label: 'Gradiente Verde',
    colores: ['#D1FAE5', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857']
  },
  {
    value: 'pastel',
    label: 'Pastel',
    colores: ['#FED7AA', '#FECACA', '#DDD6FE', '#A5F3FC', '#BBF7D0', '#FEF08A']
  },
  {
    value: 'vibrante',
    label: 'Vibrante',
    colores: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
  },
  {
    value: 'monocromatica',
    label: 'Monocromática',
    colores: ['#1E3A5F', '#2E5077', '#3E6690', '#4E7CA9', '#5E92C2', '#6EA8DB']
  }
];

// Posiciones de leyenda
export interface LeyendaOption {
  value: LeyendaPosicion;
  label: string;
  icono: string;
}

export const CHART_LEYENDA_POSICIONES: LeyendaOption[] = [
  { value: 'top', label: 'Arriba', icono: 'pi pi-arrow-up' },
  { value: 'bottom', label: 'Abajo', icono: 'pi pi-arrow-down' },
  { value: 'right', label: 'Derecha', icono: 'pi pi-arrow-right' },
  { value: 'left', label: 'Izquierda', icono: 'pi pi-arrow-left' },
  { value: 'hidden', label: 'Oculta', icono: 'pi pi-eye-slash' }
];

// ==================== CONFIGURACIONES POR DEFECTO ====================

export const DEFAULT_BAR_CONFIG: ChartBarConfig = {
  orientacion: 'vertical',
  apilado: false,
  mostrarValores: true,
  bordeRedondeado: true,
  anchoBarras: 60
};

export const DEFAULT_LINE_CONFIG: ChartLineConfig = {
  curvaSuave: true,
  mostrarPuntos: true,
  tamañoPuntos: 4,
  areaRellena: false,
  grosorLinea: 2,
  lineaPunteada: false
};

export const DEFAULT_DONUT_CONFIG: ChartDonutConfig = {
  grosorAnillo: 70,
  mostrarValorCentral: true,
  valorCentralTipo: 'total',
  maxSegmentos: 6,
  mostrarPorcentajes: true
};

export const DEFAULT_AREA_CONFIG: ChartAreaConfig = {
  gradiente: true,
  opacidad: 0.3,
  mostrarLineaSuperior: true,
  curvaSuave: true,
  apilado: false
};

export const DEFAULT_ESTILO_CONFIG: ChartEstiloConfig = {
  paleta: 'corporativa',
  leyendaPosicion: 'bottom',
  mostrarGrid: true,
  mostrarEjes: true,
  animaciones: true,
  tooltipEnabled: true
};

// Configuración completa por defecto
export function getDefaultChartConfig(tipo: TipoGrafica): ChartConfigCompleta {
  const base: ChartConfigCompleta = {
    dataSource: 'procesos',
    metrica: 'cantidad',
    agrupacion: 'estado',
    periodo: 'mes',
    estilo: { ...DEFAULT_ESTILO_CONFIG },
    clickable: true,
    zoomEnabled: false,
    exportable: true,
    autoRefresh: false,
    refreshInterval: 0
  };

  switch (tipo) {
    case 'bar':
      return { ...base, barConfig: { ...DEFAULT_BAR_CONFIG } };
    case 'line':
      return {
        ...base,
        agrupacion: 'mes',
        lineConfig: { ...DEFAULT_LINE_CONFIG }
      };
    case 'donut':
      return {
        ...base,
        estilo: { ...DEFAULT_ESTILO_CONFIG, leyendaPosicion: 'right' },
        donutConfig: { ...DEFAULT_DONUT_CONFIG }
      };
    case 'area':
      return {
        ...base,
        agrupacion: 'mes',
        areaConfig: { ...DEFAULT_AREA_CONFIG }
      };
    default:
      return base;
  }
}

// ==================== DATOS DE EJEMPLO PARA PREVIEW ====================

export interface ChartPreviewData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

// Genera datos de ejemplo según la configuración
export function generatePreviewData(config: ChartConfigCompleta, tipo: TipoGrafica): ChartPreviewData {
  const paleta = CHART_PALETAS.find(p => p.value === config.estilo.paleta)?.colores || CHART_PALETAS[0].colores;

  // Labels según agrupación
  const labelsMap: Record<ChartAgrupacion, string[]> = {
    estado: ['Activo', 'En Proceso', 'Pendiente', 'Completado', 'Cancelado'],
    area: ['TI', 'Finanzas', 'RRHH', 'Operaciones', 'Legal'],
    responsable: ['Usuario 1', 'Usuario 2', 'Usuario 3', 'Usuario 4'],
    fecha: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    prioridad: ['Crítica', 'Alta', 'Media', 'Baja'],
    tipo: ['Tipo A', 'Tipo B', 'Tipo C', 'Tipo D'],
    categoria: ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4'],
    mes: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    semana: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  };

  const labels = labelsMap[config.agrupacion] || labelsMap.estado;

  // Generar datos aleatorios pero consistentes
  const generateData = (length: number, max: number = 100): number[] => {
    return Array.from({ length }, (_, i) => Math.floor(20 + Math.random() * (max - 20) + i * 5) % max);
  };

  const data = generateData(labels.length, config.metrica === 'porcentaje' ? 100 : 150);

  if (tipo === 'donut') {
    return {
      labels: labels.slice(0, config.donutConfig?.maxSegmentos || 6),
      datasets: [{
        label: config.dataSource,
        data: data.slice(0, config.donutConfig?.maxSegmentos || 6),
        backgroundColor: paleta.slice(0, data.length)
      }]
    };
  }

  return {
    labels,
    datasets: [{
      label: CHART_DATA_SOURCES.find(ds => ds.value === config.dataSource)?.label || 'Datos',
      data,
      backgroundColor: tipo === 'bar' ? paleta.slice(0, data.length) : paleta[0],
      borderColor: paleta[0]
    }]
  };
}

// ==================== HELPERS ====================

// Obtiene las métricas disponibles para una fuente de datos
export function getMetricasForDataSource(dataSource: ChartDataSource): MetricaOption[] {
  const source = CHART_DATA_SOURCES.find(ds => ds.value === dataSource);
  if (!source) return CHART_METRICAS;
  return CHART_METRICAS.filter(m => source.metricasDisponibles.includes(m.value));
}

// Obtiene las agrupaciones disponibles para una fuente de datos
export function getAgrupacionesForDataSource(dataSource: ChartDataSource): AgrupacionOption[] {
  const source = CHART_DATA_SOURCES.find(ds => ds.value === dataSource);
  if (!source) return CHART_AGRUPACIONES;
  return CHART_AGRUPACIONES.filter(a => source.agrupacionesDisponibles.includes(a.value));
}

// Mapea tipo de widget a tipo de gráfica
export function widgetTipoToChartTipo(widgetTipo: string): TipoGrafica | null {
  const map: Record<string, TipoGrafica> = {
    'chart-bar': 'bar',
    'chart-line': 'line',
    'chart-donut': 'donut',
    'chart-area': 'area'
  };
  return map[widgetTipo] || null;
}

// Verifica si un tipo de widget es una gráfica configurable
export function esGraficaConfigurable(widgetTipo: string): boolean {
  return ['chart-bar', 'chart-line', 'chart-donut', 'chart-area'].includes(widgetTipo);
}
