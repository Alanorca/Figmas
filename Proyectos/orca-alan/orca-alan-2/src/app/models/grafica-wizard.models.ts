// Modelos para el Wizard de Configuración de Gráficas Interactivas

import { TipoEntidad } from './tabla-unificada.models';

// Categorías de gráficas
export type CategoriaGrafica = 'circulares' | 'barras' | 'lineas' | 'avanzadas' | 'embudo' | 'estadisticas' | 'especializadas' | 'combinadas' | 'predictivo';

// Tipos de gráficas disponibles (sincronizado con graficas-interactivas)
export type TipoGraficaWizard =
  // Circulares (5)
  | 'pie' | 'donut' | 'radialBar' | 'polarArea' | 'gauge'
  // Barras (5)
  | 'bar' | 'column' | 'stackedBar' | 'groupedBar' | 'stackedBarHorizontal'
  // Líneas (5)
  | 'line' | 'area' | 'stepline' | 'spline' | 'stackedArea'
  // Avanzadas (5)
  | 'radar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap'
  // Embudo/Flujo (3)
  | 'funnel' | 'pyramid' | 'sankey'
  // Estadísticas (4)
  | 'waterfall' | 'bullet' | 'boxplot' | 'candlestick'
  // Especializadas (3)
  | 'sunburst' | 'riskMatrix' | 'correlationMatrix'
  // Combinadas (3)
  | 'combo' | 'dumbbell' | 'regression'
  // IA/Predictivo (3)
  | 'trendline' | 'forecast' | 'rangeArea';

// Tipo de campo para configuración dinámica
export type TipoCampo = 'categoria' | 'numerico' | 'fecha' | 'texto';

// Tipo de agregación
export type TipoAgregacion = 'conteo' | 'suma' | 'promedio' | 'minimo' | 'maximo';

// Campo de entidad para configuración
export interface CampoEntidad {
  field: string;
  label: string;
  tipo: TipoCampo;
  valoresUnicos?: string[];  // Se llena dinámicamente con datos de la BD
}

// Configuración de categoría de gráfica
export interface CategoriaGraficaConfig {
  id: CategoriaGrafica;
  nombre: string;
  icono: string;
  descripcion: string;
  tipos: TipoGraficaConfig[];
}

// Configuración de tipo de gráfica específico
export interface TipoGraficaConfig {
  id: TipoGraficaWizard;
  nombre: string;
  icono: string;
  descripcion: string;
  requiereEjes: boolean;  // true = barras/líneas, false = circulares
  soportaSeries: boolean;  // true = puede tener múltiples series
}

// Configuración de fuente de datos
export interface FuenteDatosConfig {
  id: TipoEntidad;
  nombre: string;
  icono: string;
  descripcion: string;
}

// Cruce de datos disponible
export interface CruceDatosConfig {
  origen: TipoEntidad;
  destino: TipoEntidad;
  campoRelacion: string;
  descripcion: string;
}

// Estado completo del wizard
export interface GraficaWizardState {
  // Paso 0: Tipo de gráfica
  categoriaGrafica: CategoriaGrafica | null;
  tipoGrafica: TipoGraficaWizard | null;

  // Paso 1: Fuente de datos
  fuenteDatos: TipoEntidad | null;
  datosDisponibles: any[];
  totalRegistros: number;
  cargandoDatos: boolean;
  errorDatos: string | null;

  // Paso 2: Configuración de campos
  // Para gráficas circulares
  campoAgrupacion: string | null;
  tipoAgregacion: TipoAgregacion;
  campoValor: string | null;  // Solo si agregación es suma/promedio

  // Para gráficas de ejes (barras, líneas)
  campoEjeX: string | null;
  campoEjeY: string | null;
  campoSeries: string | null;  // Opcional, para múltiples series

  // Cruce de datos (opcional)
  usarCruce: boolean;
  cruceSeleccionado: CruceDatosConfig | null;

  // Paso 3: Estilo y confirmación
  titulo: string;
  subtitulo: string;
  paleta: string;
  mostrarLeyenda: boolean;
  mostrarEtiquetas: boolean;
  mostrarAnimaciones: boolean;
  mostrarGrid: boolean;
}

// Configuración final que se emite al confirmar
export interface GraficaWizardResult {
  tipoGrafica: TipoGraficaWizard;
  fuenteDatos: TipoEntidad;
  configuracion: {
    campoAgrupacion?: string;
    tipoAgregacion: TipoAgregacion;
    campoValor?: string;
    campoEjeX?: string;
    campoEjeY?: string;
    campoSeries?: string;
    cruce?: CruceDatosConfig;
  };
  estilo: {
    titulo: string;
    subtitulo: string;
    paleta: string;
    mostrarLeyenda: boolean;
    mostrarEtiquetas: boolean;
    mostrarAnimaciones: boolean;
    mostrarGrid: boolean;
  };
  datos: any[];  // Datos preprocesados para la gráfica
}

// Validación de paso
export interface ValidacionPaso {
  valido: boolean;
  errores: string[];
}

// Constantes de configuración

export const CATEGORIAS_GRAFICAS: CategoriaGraficaConfig[] = [
  {
    id: 'circulares',
    nombre: 'Circulares',
    icono: 'pi pi-chart-pie',
    descripcion: 'Pie, Donut, Radial, Polar, Gauge',
    tipos: [
      { id: 'pie', nombre: 'Pie', icono: 'pi pi-chart-pie', descripcion: 'Gráfica circular clásica para distribuciones', requiereEjes: false, soportaSeries: false },
      { id: 'donut', nombre: 'Donut', icono: 'pi pi-circle', descripcion: 'Circular con hueco central para totales', requiereEjes: false, soportaSeries: false },
      { id: 'radialBar', nombre: 'Radial Bar', icono: 'pi pi-sun', descripcion: 'Barras radiales para rankings y progreso', requiereEjes: false, soportaSeries: false },
      { id: 'polarArea', nombre: 'Área Polar', icono: 'pi pi-slack', descripcion: 'Sectores con radio variable', requiereEjes: false, soportaSeries: false },
      { id: 'gauge', nombre: 'Velocímetro', icono: 'pi pi-gauge', descripcion: 'Medidor circular para KPIs individuales', requiereEjes: false, soportaSeries: false }
    ]
  },
  {
    id: 'barras',
    nombre: 'Barras',
    icono: 'pi pi-chart-bar',
    descripcion: 'Columnas, Horizontales, Apiladas, Agrupadas',
    tipos: [
      { id: 'bar', nombre: 'Barras Horizontales', icono: 'pi pi-align-left', descripcion: 'Barras horizontales clásicas', requiereEjes: true, soportaSeries: true },
      { id: 'column', nombre: 'Columnas', icono: 'pi pi-chart-bar', descripcion: 'Barras verticales (columnas)', requiereEjes: true, soportaSeries: true },
      { id: 'stackedBar', nombre: 'Apiladas Verticales', icono: 'pi pi-objects-column', descripcion: 'Barras apiladas verticalmente', requiereEjes: true, soportaSeries: true },
      { id: 'groupedBar', nombre: 'Agrupadas', icono: 'pi pi-th-large', descripcion: 'Barras agrupadas lado a lado', requiereEjes: true, soportaSeries: true },
      { id: 'stackedBarHorizontal', nombre: 'Apiladas Horizontales', icono: 'pi pi-bars', descripcion: 'Barras apiladas horizontalmente', requiereEjes: true, soportaSeries: true }
    ]
  },
  {
    id: 'lineas',
    nombre: 'Líneas',
    icono: 'pi pi-chart-line',
    descripcion: 'Líneas, Áreas, Spline, Steps',
    tipos: [
      { id: 'line', nombre: 'Líneas', icono: 'pi pi-chart-line', descripcion: 'Líneas simples para tendencias', requiereEjes: true, soportaSeries: true },
      { id: 'area', nombre: 'Áreas', icono: 'pi pi-chart-line', descripcion: 'Líneas con área rellena', requiereEjes: true, soportaSeries: true },
      { id: 'stepline', nombre: 'Escalonadas', icono: 'pi pi-minus', descripcion: 'Líneas en escalones discretos', requiereEjes: true, soportaSeries: true },
      { id: 'spline', nombre: 'Spline', icono: 'pi pi-wave-pulse', descripcion: 'Curvas suaves interpoladas', requiereEjes: true, soportaSeries: true },
      { id: 'stackedArea', nombre: 'Áreas Apiladas', icono: 'pi pi-chart-line', descripcion: 'Áreas apiladas para composición', requiereEjes: true, soportaSeries: true }
    ]
  },
  {
    id: 'avanzadas',
    nombre: 'Avanzadas',
    icono: 'pi pi-star',
    descripcion: 'Radar, Scatter, Bubble, Heatmap, Treemap',
    tipos: [
      { id: 'radar', nombre: 'Radar', icono: 'pi pi-stop', descripcion: 'Comparación multidimensional', requiereEjes: false, soportaSeries: true },
      { id: 'scatter', nombre: 'Dispersión', icono: 'pi pi-circle-fill', descripcion: 'Correlación entre variables', requiereEjes: true, soportaSeries: true },
      { id: 'bubble', nombre: 'Burbujas', icono: 'pi pi-circle', descripcion: 'Dispersión con 3 dimensiones', requiereEjes: true, soportaSeries: true },
      { id: 'heatmap', nombre: 'Mapa de Calor', icono: 'pi pi-table', descripcion: 'Matriz de colores para patrones', requiereEjes: true, soportaSeries: false },
      { id: 'treemap', nombre: 'Treemap', icono: 'pi pi-objects-column', descripcion: 'Jerarquías proporcionales', requiereEjes: false, soportaSeries: false }
    ]
  },
  {
    id: 'embudo',
    nombre: 'Embudo/Flujo',
    icono: 'pi pi-filter',
    descripcion: 'Embudo, Pirámide, Sankey',
    tipos: [
      { id: 'funnel', nombre: 'Embudo', icono: 'pi pi-filter', descripcion: 'Flujo de etapas decreciente', requiereEjes: false, soportaSeries: false },
      { id: 'pyramid', nombre: 'Pirámide', icono: 'pi pi-caret-up', descripcion: 'Jerarquía piramidal', requiereEjes: false, soportaSeries: false },
      { id: 'sankey', nombre: 'Sankey', icono: 'pi pi-arrows-h', descripcion: 'Flujos y conexiones entre nodos', requiereEjes: false, soportaSeries: false }
    ]
  },
  {
    id: 'estadisticas',
    nombre: 'Estadísticas',
    icono: 'pi pi-calculator',
    descripcion: 'Waterfall, Bullet, BoxPlot, Candlestick',
    tipos: [
      { id: 'waterfall', nombre: 'Waterfall', icono: 'pi pi-sort-amount-down', descripcion: 'Cambios acumulativos paso a paso', requiereEjes: true, soportaSeries: false },
      { id: 'bullet', nombre: 'Bullet', icono: 'pi pi-minus', descripcion: 'Comparación de objetivo vs actual', requiereEjes: true, soportaSeries: false },
      { id: 'boxplot', nombre: 'BoxPlot', icono: 'pi pi-box', descripcion: 'Distribución estadística (cuartiles)', requiereEjes: true, soportaSeries: true },
      { id: 'candlestick', nombre: 'Candlestick', icono: 'pi pi-chart-bar', descripcion: 'Apertura, cierre, máx, mín', requiereEjes: true, soportaSeries: false }
    ]
  },
  {
    id: 'especializadas',
    nombre: 'Especializadas',
    icono: 'pi pi-shield',
    descripcion: 'Sunburst, Matriz de Riesgo, Correlación',
    tipos: [
      { id: 'sunburst', nombre: 'Sunburst', icono: 'pi pi-sun', descripcion: 'Jerarquía radial multinivel', requiereEjes: false, soportaSeries: false },
      { id: 'riskMatrix', nombre: 'Matriz de Riesgo', icono: 'pi pi-th-large', descripcion: 'Probabilidad vs Impacto', requiereEjes: false, soportaSeries: false },
      { id: 'correlationMatrix', nombre: 'Matriz Correlación', icono: 'pi pi-table', descripcion: 'Correlaciones entre variables', requiereEjes: false, soportaSeries: false }
    ]
  },
  {
    id: 'combinadas',
    nombre: 'Combinadas',
    icono: 'pi pi-clone',
    descripcion: 'Combo, Dumbbell, Regresión',
    tipos: [
      { id: 'combo', nombre: 'Combo', icono: 'pi pi-clone', descripcion: 'Barras + Líneas combinadas', requiereEjes: true, soportaSeries: true },
      { id: 'dumbbell', nombre: 'Dumbbell', icono: 'pi pi-arrows-h', descripcion: 'Comparación antes/después', requiereEjes: true, soportaSeries: false },
      { id: 'regression', nombre: 'Regresión', icono: 'pi pi-chart-line', descripcion: 'Línea de tendencia ajustada', requiereEjes: true, soportaSeries: false }
    ]
  },
  {
    id: 'predictivo',
    nombre: 'IA/Predictivo',
    icono: 'pi pi-sparkles',
    descripcion: 'Tendencias, Forecast, Range Area',
    tipos: [
      { id: 'trendline', nombre: 'Tendencia', icono: 'pi pi-chart-line', descripcion: 'Análisis de tendencia temporal', requiereEjes: true, soportaSeries: true },
      { id: 'forecast', nombre: 'Forecast', icono: 'pi pi-forward', descripcion: 'Predicción con intervalos de confianza', requiereEjes: true, soportaSeries: false },
      { id: 'rangeArea', nombre: 'Área de Rango', icono: 'pi pi-chart-line', descripcion: 'Área con valores mín/máx', requiereEjes: true, soportaSeries: false }
    ]
  }
];

export const FUENTES_DATOS: FuenteDatosConfig[] = [
  { id: 'riesgo', nombre: 'Riesgos', icono: 'pi pi-shield', descripcion: 'Riesgos identificados' },
  { id: 'incidente', nombre: 'Incidentes', icono: 'pi pi-exclamation-triangle', descripcion: 'Incidentes de seguridad' },
  { id: 'activo', nombre: 'Activos', icono: 'pi pi-box', descripcion: 'Activos de información' },
  { id: 'proceso', nombre: 'Procesos', icono: 'pi pi-sitemap', descripcion: 'Procesos del negocio' },
  { id: 'defecto', nombre: 'Defectos', icono: 'pi pi-bug', descripcion: 'Defectos encontrados' },
  { id: 'revision', nombre: 'Revisiones', icono: 'pi pi-file-check', descripcion: 'Revisiones de cumplimiento' },
  { id: 'cumplimiento', nombre: 'Cumplimiento', icono: 'pi pi-verified', descripcion: 'Marcos normativos' }
];

export const CAMPOS_POR_ENTIDAD: Record<TipoEntidad, CampoEntidad[]> = {
  riesgo: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'probabilidad', label: 'Probabilidad', tipo: 'numerico' },
    { field: 'impacto', label: 'Impacto', tipo: 'numerico' },
    { field: 'nivelRiesgo', label: 'Nivel de Riesgo', tipo: 'numerico' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' },
    { field: 'fecha', label: 'Fecha', tipo: 'fecha' }
  ],
  incidente: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'severidad', label: 'Severidad', tipo: 'categoria' },
    { field: 'reportadoPor', label: 'Reportado Por', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' },
    { field: 'fecha', label: 'Fecha', tipo: 'fecha' }
  ],
  activo: [
    { field: 'tipo', label: 'Tipo', tipo: 'categoria' },
    { field: 'criticidad', label: 'Criticidad', tipo: 'categoria' },
    { field: 'departamento', label: 'Departamento', tipo: 'categoria' },
    { field: 'estado', label: 'Estado', tipo: 'categoria' }
  ],
  proceso: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'version', label: 'Versión', tipo: 'texto' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' }
  ],
  defecto: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'prioridad', label: 'Prioridad', tipo: 'categoria' },
    { field: 'tipoDefecto', label: 'Tipo de Defecto', tipo: 'categoria' },
    { field: 'detectadoPor', label: 'Detectado Por', tipo: 'categoria' },
    { field: 'contenedorNombre', label: 'Activo', tipo: 'categoria' }
  ],
  revision: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' },
    { field: 'responsable', label: 'Responsable', tipo: 'categoria' }
  ],
  cumplimiento: [
    { field: 'estado', label: 'Estado', tipo: 'categoria' }
  ]
};

export const CRUCES_DISPONIBLES: CruceDatosConfig[] = [
  { origen: 'riesgo', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Riesgos por Activo' },
  { origen: 'incidente', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Incidentes por Activo' },
  { origen: 'defecto', destino: 'activo', campoRelacion: 'activoId', descripcion: 'Defectos por Activo' }
];

export const PALETAS_COLORES = [
  { id: 'vibrant', nombre: 'Vibrante', colores: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'] },
  { id: 'pastel', nombre: 'Pastel', colores: ['#80DEEA', '#CE93D8', '#FFAB91', '#A5D6A7', '#90CAF9', '#FFF59D'] },
  { id: 'neon', nombre: 'Neón', colores: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0080', '#8000FF'] },
  { id: 'corporate', nombre: 'Corporativo', colores: ['#2E5BFF', '#8C54FF', '#00C1D4', '#FAD02C', '#F7C137', '#33D9B2'] },
  { id: 'earth', nombre: 'Tierra', colores: ['#8D6E63', '#A1887F', '#BCAAA4', '#795548', '#6D4C41', '#5D4037'] },
  { id: 'ocean', nombre: 'Océano', colores: ['#0277BD', '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7'] },
  { id: 'sunset', nombre: 'Atardecer', colores: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#FFE66D'] },
  { id: 'semaforo', nombre: 'Semáforo', colores: ['#22C55E', '#EAB308', '#F97316', '#EF4444', '#DC2626'] },
  { id: 'monoazul', nombre: 'Mono Azul', colores: ['#1E3A5F', '#2E5984', '#3E78A9', '#4E97CE', '#6EB5E8', '#8ED3F2'] }
];

// Estado inicial del wizard
export const INITIAL_WIZARD_STATE: GraficaWizardState = {
  categoriaGrafica: null,
  tipoGrafica: null,
  fuenteDatos: null,
  datosDisponibles: [],
  totalRegistros: 0,
  cargandoDatos: false,
  errorDatos: null,
  campoAgrupacion: null,
  tipoAgregacion: 'conteo',
  campoValor: null,
  campoEjeX: null,
  campoEjeY: null,
  campoSeries: null,
  usarCruce: false,
  cruceSeleccionado: null,
  titulo: '',
  subtitulo: '',
  paleta: 'vibrant',
  mostrarLeyenda: true,
  mostrarEtiquetas: true,
  mostrarAnimaciones: true,
  mostrarGrid: true
};
