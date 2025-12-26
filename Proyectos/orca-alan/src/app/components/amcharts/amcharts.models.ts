// ==================== PERIOD & METRIC SELECTORS ====================

export type ChartPeriodo = 'semana' | 'mes' | 'trimestre' | 'anio' | 'custom';

export interface PeriodoOption {
  label: string;
  value: ChartPeriodo;
  icon?: string;
}

export type MetricaDisponible =
  | 'cumplimiento'
  | 'alertas'
  | 'kpisActivos'
  | 'objetivosCumplidos'
  | 'tendenciaCumplimiento';

export interface MetricaOption {
  label: string;
  value: MetricaDisponible;
  icon: string;
  descripcion: string;
  color: string;
}

export interface RangoFechas {
  desde: Date;
  hasta: Date;
}

// ==================== CHART CONFIGURATION ====================

export interface AMChartConfig {
  id: string;
  tipo?: 'line' | 'bar' | 'pie' | 'donut' | 'xy';
  titulo?: string;
  subtitulo?: string;
  altura: number;
  animaciones?: boolean;
  tema?: 'light' | 'dark';
  exportable?: boolean;
  interactivo?: boolean;
}

export interface AMLineChartConfig extends AMChartConfig {
  tipo?: 'line';
  periodo?: ChartPeriodo;
  rangoCustom?: RangoFechas;
  metrica?: MetricaDisponible;
  mostrarLeyenda?: boolean;
  mostrarTooltip?: boolean;
  curvaSmooth?: boolean;
  mostrarPuntos?: boolean;
  zoomEnabled?: boolean;
  scrollbarEnabled?: boolean;
  mostrarScrollbar?: boolean;
  mostrarZoom?: boolean;
  colorScheme?: string[];
}

export interface AMBarChartConfig extends AMChartConfig {
  tipo?: 'bar';
  orientacion?: 'horizontal' | 'vertical';
  colorPorValor?: boolean;
  mostrarValores?: boolean;
  ordenamiento?: 'asc' | 'desc' | 'none';
  maxItems?: number;
  drilldownEnabled?: boolean;
  habilitarDrillDown?: boolean;
  umbrales?: {
    excelente: number;
    bueno: number;
    regular: number;
  };
}

export interface AMPieChartConfig extends AMChartConfig {
  tipo?: 'pie' | 'donut';
  innerRadius?: number;
  mostrarLeyenda?: boolean;
  mostrarLabels?: boolean;
  mostrarEtiquetas?: boolean;
  mostrarPorcentaje?: boolean;
}

// ==================== CHART DATA STRUCTURES ====================

export interface SerieLinea {
  id: string;
  nombre: string;
  datos: PuntoLinea[];
  color?: string;
  visible?: boolean;
}

export interface PuntoLinea {
  fecha: Date | string;
  valor: number;
  label?: string;
}

export interface DatosBarras {
  categorias: CategoriaBar[];
}

export interface CategoriaBar {
  id: string;
  nombre: string;
  valor: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface DatosPie {
  segmentos: SegmentoPie[];
}

export interface SegmentoPie {
  id: string;
  nombre: string;
  valor: number;
  color: string;
  porcentaje?: number;
}

// ==================== DRILL-DOWN STRUCTURES ====================

export interface DrillDownConfig {
  enabled: boolean;
  modo: 'drawer' | 'dialog' | 'inline';
  titulo: string;
}

export interface DrillDownData {
  procesoId: string;
  procesoNombre: string;
  cumplimientoGeneral: number;
  desglose: DesgloseCumplimiento[];
}

export interface DesgloseCumplimiento {
  objetivoId: string;
  objetivoNombre: string;
  kpis: KPIDesglose[];
  cumplimientoPromedio: number;
}

export interface KPIDesglose {
  id: string;
  nombre: string;
  valorActual: number;
  valorMeta: number;
  cumplimiento: number;
  tendencia: 'up' | 'down' | 'neutral';
  alertaActiva: boolean;
  severidadAlerta?: 'critical' | 'warning' | 'info';
}

// ==================== EVENT TYPES ====================

export interface ChartClickEvent {
  tipo: 'bar' | 'point' | 'segment';
  id: string;
  nombre: string;
  valor: number;
  metadata?: Record<string, unknown>;
}

export interface PeriodoChangeEvent {
  periodo: ChartPeriodo;
  rangoFechas?: RangoFechas;
}

export interface MetricaChangeEvent {
  metrica: MetricaDisponible;
}

// ==================== PROCESS KPI TYPES (re-exported for convenience) ====================

export type TendenciaDir = 'up' | 'down' | 'neutral';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'activa' | 'atendida' | 'resuelta';

export interface ProcesoKPIResumen {
  procesoId: string;
  procesoNombre: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  totalObjetivos: number;
  totalKPIs: number;
  cumplimientoPromedio: number;
  cumplimientoAnterior: number;
  tendencia: TendenciaDir;
  alertasActivas: number;
  alertasCriticas: number;
  ultimaActualizacion: Date;
}

export interface AlertaConsolidada {
  id: string;
  procesoId: string;
  procesoNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  kpiId: string;
  kpiNombre: string;
  severity: AlertSeverity;
  status: AlertStatus;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  fechaCreacion: Date;
  diasAbierto: number;
}
