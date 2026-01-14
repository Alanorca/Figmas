import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DragDropModule } from 'primeng/dragdrop';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectButtonModule } from 'primeng/selectbutton';

// Models
import {
  WidgetCatalogItem,
  WidgetConfig,
  WidgetColumnConfig,
  WidgetOrdenamiento,
  KPIConfig,
  ChartConfigCompleta,
  ChartDataSource,
  ChartMetrica,
  ChartAgrupacion,
  ChartPeriodo,
  PaletaColores,
  LeyendaPosicion,
  TipoGrafica,
} from '../../models/dashboard.models';
import { FiltroActivo, ColumnaConfig } from '../../models/tabla-unificada.models';
import { TABLE_COLUMNS_BY_SOURCE, getColumnsForSource } from '../../models/widget-columns.config';

// Chart Config
import {
  CHART_DATA_SOURCES,
  CHART_METRICAS,
  CHART_AGRUPACIONES,
  CHART_PERIODOS,
  CHART_PALETAS,
  CHART_LEYENDA_POSICIONES,
  DEFAULT_BAR_CONFIG,
  DEFAULT_LINE_CONFIG,
  DEFAULT_DONUT_CONFIG,
  DEFAULT_AREA_CONFIG,
  DEFAULT_ESTILO_CONFIG,
  getDefaultChartConfig,
  getMetricasForDataSource,
  getAgrupacionesForDataSource,
  widgetTipoToChartTipo,
  esGraficaConfigurable,
  generatePreviewData,
  DataSourceOption,
  MetricaOption,
  AgrupacionOption,
  PeriodoOption,
  PaletaOption,
  LeyendaOption,
} from '../../models/widget-chart.config';

// Operadores por tipo de columna
const OPERADORES_TEXTO = [
  { label: 'Contiene', value: 'contiene' },
  { label: 'Igual a', value: 'igual' },
  { label: 'Empieza con', value: 'empieza_con' },
  { label: 'Termina con', value: 'termina_con' },
];

const OPERADORES_NUMERO = [
  { label: 'Igual a', value: 'igual' },
  { label: 'Mayor que', value: 'mayor' },
  { label: 'Menor que', value: 'menor' },
  { label: 'Entre', value: 'entre' },
];

const OPERADORES_FECHA = [
  { label: 'Igual a', value: 'igual' },
  { label: 'Antes de', value: 'antes' },
  { label: 'Después de', value: 'despues' },
  { label: 'Entre', value: 'entre' },
];

@Component({
  selector: 'app-widget-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    ChipModule,
    DividerModule,
    TabsModule,
    InputNumberModule,
    DatePickerModule,
    MultiSelectModule,
    TooltipModule,
    BadgeModule,
    TagModule,
    TableModule,
    CardModule,
    DragDropModule,
    SliderModule,
    ToggleSwitchModule,
    SelectButtonModule,
  ],
  templateUrl: './widget-configurator.html',
  styleUrl: './widget-configurator.scss',
})
export class WidgetConfiguratorComponent {
  // Inputs
  visible = input<boolean>(false);
  catalogItem = input<WidgetCatalogItem | null>(null);

  // Outputs
  visibleChange = output<boolean>();
  onConfirm = output<{
    titulo: string;
    subtitulo: string;
    config: WidgetConfig;
  }>();
  onCancel = output<void>();

  // Estado del formulario
  titulo = signal('');
  subtitulo = signal('');
  tableDataSource = signal<string>('');
  tableLimit = signal(5);
  showHeader = signal(true);

  // Columnas
  columnasDisponibles = signal<WidgetColumnConfig[]>([]);
  draggedColumn: WidgetColumnConfig | null = null;

  // Filtros
  filtrosActivos = signal<FiltroActivo[]>([]);
  nuevoFiltroColumna = signal<string>('');
  nuevoFiltroOperador = signal<string>('');
  nuevoFiltroValor = signal<any>(null);
  nuevoFiltroValorHasta = signal<any>(null);

  // Ordenamiento
  ordenamientoCampo = signal<string>('');
  ordenamientoDireccion = signal<'asc' | 'desc'>('asc');

  // Tab activo
  activeTab = signal(0);

  // ==================== CONFIGURACIÓN DE GRÁFICAS ====================

  // Tipo de gráfica actual
  chartTipo = signal<TipoGrafica | null>(null);

  // Datos
  chartDataSource = signal<ChartDataSource>('procesos');
  chartMetrica = signal<ChartMetrica>('cantidad');
  chartAgrupacion = signal<ChartAgrupacion>('estado');
  chartPeriodo = signal<ChartPeriodo>('mes');
  chartFechaInicio = signal<Date | null>(null);
  chartFechaFin = signal<Date | null>(null);

  // Estilo
  chartPaleta = signal<PaletaColores>('corporativa');
  chartLeyendaPosicion = signal<LeyendaPosicion>('bottom');
  chartMostrarGrid = signal(true);
  chartMostrarEjes = signal(true);
  chartAnimaciones = signal(true);
  chartTooltipEnabled = signal(true);

  // Configuración específica - Barras
  barOrientacion = signal<'vertical' | 'horizontal'>('vertical');
  barApilado = signal(false);
  barMostrarValores = signal(true);
  barBordeRedondeado = signal(true);
  barAnchoBarras = signal(60);

  // Configuración específica - Líneas
  lineCurvaSuave = signal(true);
  lineMostrarPuntos = signal(true);
  lineTamanoPuntos = signal(4);
  lineAreaRellena = signal(false);
  lineGrosorLinea = signal(2);
  lineLineaPunteada = signal(false);

  // Configuración específica - Dona
  donutGrosorAnillo = signal(70);
  donutMostrarValorCentral = signal(true);
  donutValorCentralTipo = signal<'total' | 'porcentaje' | 'etiqueta'>('total');
  donutEtiquetaCentral = signal('');
  donutMaxSegmentos = signal(6);
  donutMostrarPorcentajes = signal(true);

  // Configuración específica - Área
  areaGradiente = signal(true);
  areaOpacidad = signal(0.3);
  areaMostrarLineaSuperior = signal(true);
  areaCurvaSuave = signal(true);
  areaApilado = signal(false);

  // ==================== CONFIGURACIÓN DE KPIs ====================

  // Tipo de KPI
  kpiType = signal<'cumplimiento' | 'procesos' | 'alertas' | 'objetivos' | 'personalizado'>('cumplimiento');

  // Estilo visual
  kpiColorPrimario = signal('#3B82F6');
  kpiColorSecundario = signal('#10B981');
  kpiIcono = signal('pi pi-chart-line');
  kpiMostrarTendencia = signal(true);
  kpiMostrarMeta = signal(false);
  kpiMetaValor = signal(100);
  kpiUnidad = signal('%');
  kpiFormato = signal<'numero' | 'porcentaje' | 'moneda'>('porcentaje');

  // Para KPI personalizado
  kpiTituloPersonalizado = signal('');
  kpiValorPersonalizado = signal(0);
  kpiDescripcionPersonalizado = signal('');

  // Opciones de tipo de KPI
  kpiTypeOptions = [
    { label: 'Cumplimiento General', value: 'cumplimiento', icon: 'pi pi-percentage', descripcion: 'Porcentaje de cumplimiento normativo' },
    { label: 'Procesos Activos', value: 'procesos', icon: 'pi pi-cog', descripcion: 'Cantidad de procesos en ejecución' },
    { label: 'Alertas Activas', value: 'alertas', icon: 'pi pi-exclamation-triangle', descripcion: 'Número de alertas pendientes' },
    { label: 'Objetivos Cumplidos', value: 'objetivos', icon: 'pi pi-check-circle', descripcion: 'Porcentaje de objetivos logrados' },
    { label: 'Personalizado', value: 'personalizado', icon: 'pi pi-sliders-h', descripcion: 'Configura tu propio KPI' },
  ];

  // Opciones de formato
  kpiFormatoOptions = [
    { label: 'Número', value: 'numero' },
    { label: 'Porcentaje', value: 'porcentaje' },
    { label: 'Moneda', value: 'moneda' },
  ];

  // Opciones de iconos comunes
  kpiIconoOptions = [
    { label: 'Línea', value: 'pi pi-chart-line' },
    { label: 'Porcentaje', value: 'pi pi-percentage' },
    { label: 'Engranaje', value: 'pi pi-cog' },
    { label: 'Alerta', value: 'pi pi-exclamation-triangle' },
    { label: 'Check', value: 'pi pi-check-circle' },
    { label: 'Usuario', value: 'pi pi-user' },
    { label: 'Calendario', value: 'pi pi-calendar' },
    { label: 'Dólar', value: 'pi pi-dollar' },
    { label: 'Bandera', value: 'pi pi-flag' },
    { label: 'Estrella', value: 'pi pi-star' },
  ];

  // Colores predefinidos
  kpiColoresOptions = [
    { label: 'Azul', value: '#3B82F6' },
    { label: 'Verde', value: '#10B981' },
    { label: 'Amarillo', value: '#F59E0B' },
    { label: 'Rojo', value: '#EF4444' },
    { label: 'Morado', value: '#8B5CF6' },
    { label: 'Rosa', value: '#EC4899' },
    { label: 'Cyan', value: '#06B6D4' },
    { label: 'Naranja', value: '#F97316' },
  ];

  // ==================== CONFIGURACIÓN DE GRÁFICAS INTERACTIVAS ====================

  // Tipo de gráfica interactiva
  giTipoGrafica = signal<string>('bar');

  // Datos
  giCampoEjeX = signal<string>('proceso');
  giCampoEjeY = signal<string | null>('cumplimiento');
  giCampoAgrupacion = signal<string | null>(null);

  // Estilo
  giPaleta = signal<string>('corporativo');
  giAnimaciones = signal(true);
  giMostrarLeyenda = signal(true);
  giMostrarDataLabels = signal(false);
  giMostrarTooltip = signal(true);
  giTema = signal<'light' | 'dark'>('light');
  giAltura = signal(300);

  // Filtros predeterminados
  giFiltros = signal<{ campo: string; valor: string; operador: string }[]>([]);

  // Opciones de tipo de gráfica (grupos)
  giTiposGraficaGrupos = [
    {
      label: 'Circulares',
      items: [
        { label: 'Pie', value: 'pie', icon: 'pi pi-chart-pie', descripcion: 'Distribución porcentual' },
        { label: 'Dona', value: 'donut', icon: 'pi pi-circle', descripcion: 'Distribución con hueco central' },
        { label: 'Radial', value: 'radialBar', icon: 'pi pi-spinner', descripcion: 'Barras radiales' },
      ]
    },
    {
      label: 'Barras',
      items: [
        { label: 'Barras Verticales', value: 'bar', icon: 'pi pi-chart-bar', descripcion: 'Comparación de valores' },
        { label: 'Barras Horizontales', value: 'column', icon: 'pi pi-align-left', descripcion: 'Comparación horizontal' },
        { label: 'Barras Apiladas', value: 'stackedBar', icon: 'pi pi-server', descripcion: 'Composición apilada' },
      ]
    },
    {
      label: 'Líneas',
      items: [
        { label: 'Línea', value: 'line', icon: 'pi pi-chart-line', descripcion: 'Tendencias temporales' },
        { label: 'Área', value: 'area', icon: 'pi pi-map', descripcion: 'Área bajo la curva' },
        { label: 'Spline', value: 'spline', icon: 'pi pi-wave-pulse', descripcion: 'Línea suavizada' },
      ]
    },
    {
      label: 'Avanzadas',
      items: [
        { label: 'Radar', value: 'radar', icon: 'pi pi-compass', descripcion: 'Múltiples métricas' },
        { label: 'Heatmap', value: 'heatmap', icon: 'pi pi-th-large', descripcion: 'Mapa de calor' },
        { label: 'Treemap', value: 'treemap', icon: 'pi pi-objects-column', descripcion: 'Jerarquía de datos' },
      ]
    }
  ];

  // Lista plana de tipos para fácil acceso
  giTiposGraficaFlat = this.giTiposGraficaGrupos.flatMap(g => g.items);

  // Campos disponibles para ejes
  giCamposDisponibles = [
    { label: 'Proceso', value: 'proceso', tipo: 'categoria', descripcion: 'Nombre del proceso' },
    { label: 'Área', value: 'area', tipo: 'categoria', descripcion: 'Área responsable' },
    { label: 'Estado', value: 'estado', tipo: 'categoria', descripcion: 'Estado actual' },
    { label: 'Responsable', value: 'responsable', tipo: 'categoria', descripcion: 'Usuario responsable' },
    { label: 'Cumplimiento', value: 'cumplimiento', tipo: 'numerico', descripcion: 'Porcentaje de cumplimiento' },
    { label: 'Riesgo', value: 'riesgo', tipo: 'numerico', descripcion: 'Nivel de riesgo' },
    { label: 'Alertas', value: 'alertas', tipo: 'numerico', descripcion: 'Cantidad de alertas' },
    { label: 'Tareas', value: 'tareas', tipo: 'numerico', descripcion: 'Cantidad de tareas' },
    { label: 'Fecha', value: 'fecha', tipo: 'fecha', descripcion: 'Fecha de registro' },
  ];

  // Paletas disponibles
  giPaletasOptions = [
    { label: 'Corporativo', value: 'corporativo', colores: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] },
    { label: 'Océano', value: 'oceano', colores: ['#0EA5E9', '#06B6D4', '#14B8A6', '#10B981'] },
    { label: 'Atardecer', value: 'atardecer', colores: ['#F97316', '#FB923C', '#FBBF24', '#EAB308'] },
    { label: 'Bosque', value: 'bosque', colores: ['#22C55E', '#16A34A', '#15803D', '#166534'] },
    { label: 'Monocromático', value: 'mono', colores: ['#1E293B', '#475569', '#94A3B8', '#CBD5E1'] },
    { label: 'Neón', value: 'neon', colores: ['#A855F7', '#EC4899', '#F43F5E', '#FB7185'] },
  ];

  // ==================== CONFIGURACIÓN DE MAPA DE RIESGOS ====================

  // Tipo de mapa de riesgos
  mrTipo = signal<'probabilidad-impacto' | 'activos-amenazas' | 'controles-efectividad' | 'vulnerabilidades'>('probabilidad-impacto');

  // Configuración visual
  mrMostrarEtiquetas = signal(true);
  mrMostrarValores = signal(true);
  mrMostrarLeyenda = signal(true);
  mrAnimaciones = signal(true);
  mrColorScheme = signal<'semaforo' | 'calor' | 'corporativo'>('semaforo');

  // Configuración de ejes
  mrEjeXLabel = signal('Probabilidad');
  mrEjeYLabel = signal('Impacto');
  mrNiveles = signal(5); // 3, 4, 5

  // Filtros
  mrFiltrarPorArea = signal<string | null>(null);
  mrFiltrarPorResponsable = signal<string | null>(null);

  // Opciones de tipo de mapa
  mrTipoOptions = [
    {
      label: 'Probabilidad vs Impacto',
      value: 'probabilidad-impacto',
      icon: 'pi pi-th-large',
      descripcion: 'Matriz clásica de evaluación de riesgos'
    },
    {
      label: 'Activos vs Amenazas',
      value: 'activos-amenazas',
      icon: 'pi pi-shield',
      descripcion: 'Relación entre activos y sus amenazas'
    },
    {
      label: 'Controles vs Efectividad',
      value: 'controles-efectividad',
      icon: 'pi pi-check-square',
      descripcion: 'Evaluación de efectividad de controles'
    },
    {
      label: 'Vulnerabilidades',
      value: 'vulnerabilidades',
      icon: 'pi pi-exclamation-triangle',
      descripcion: 'Mapa de vulnerabilidades detectadas'
    },
  ];

  // Esquemas de color
  mrColorSchemeOptions = [
    {
      label: 'Semáforo',
      value: 'semaforo',
      colores: ['#22C55E', '#EAB308', '#F97316', '#EF4444'],
      descripcion: 'Verde, amarillo, naranja, rojo'
    },
    {
      label: 'Mapa de Calor',
      value: 'calor',
      colores: ['#FEF3C7', '#FCD34D', '#F97316', '#DC2626'],
      descripcion: 'Degradado de calor'
    },
    {
      label: 'Corporativo',
      value: 'corporativo',
      colores: ['#DBEAFE', '#60A5FA', '#3B82F6', '#1E40AF'],
      descripcion: 'Tonos azules institucionales'
    },
  ];

  // Opciones de niveles
  mrNivelesOptions = [
    { label: '3x3', value: 3 },
    { label: '4x4', value: 4 },
    { label: '5x5', value: 5 },
  ];

  // Interactividad
  chartClickable = signal(true);
  chartZoomEnabled = signal(false);
  chartExportable = signal(true);

  // Actualización
  chartAutoRefresh = signal(false);
  chartRefreshInterval = signal(60);

  // Opciones disponibles (para selects)
  chartDataSourceOptions = CHART_DATA_SOURCES;
  chartPaletasOptions = CHART_PALETAS;
  chartLeyendaOptions = CHART_LEYENDA_POSICIONES;
  chartPeriodosOptions = CHART_PERIODOS;

  // Opciones de orientación para barras
  barOrientacionOptions = [
    { label: 'Vertical', value: 'vertical', icon: 'pi pi-arrows-v' },
    { label: 'Horizontal', value: 'horizontal', icon: 'pi pi-arrows-h' },
  ];

  // Opciones de valor central para dona
  donutValorCentralOptions = [
    { label: 'Total', value: 'total' },
    { label: 'Porcentaje', value: 'porcentaje' },
    { label: 'Etiqueta', value: 'etiqueta' },
  ];

  // Opciones de data sources
  dataSourceOptions = [
    { label: 'Procesos', value: 'procesos' },
    { label: 'Riesgos', value: 'riesgos' },
    { label: 'Incidentes', value: 'incidentes' },
    { label: 'Activos', value: 'activos' },
    { label: 'Alertas', value: 'alertas' },
    { label: 'Results ML', value: 'results-ml' },
    { label: 'KPIs', value: 'kpis' },
    { label: 'Objetivos', value: 'objetivos' },
  ];

  // Computed: columnas para el data source seleccionado
  columnasParaFiltro = computed(() => {
    const source = this.tableDataSource();
    if (!source) return [];
    return getColumnsForSource(source);
  });

  // Computed: operadores para la columna seleccionada
  operadoresDisponibles = computed(() => {
    const columnaField = this.nuevoFiltroColumna();
    if (!columnaField) return [];

    const columna = this.columnasParaFiltro().find((c) => c.field === columnaField);
    if (!columna) return [];

    switch (columna.tipo) {
      case 'texto':
      case 'contenedor':
        return OPERADORES_TEXTO;
      case 'numero':
        return OPERADORES_NUMERO;
      case 'fecha':
        return OPERADORES_FECHA;
      case 'seleccion':
        return [{ label: 'Es igual a', value: 'igual' }];
      default:
        return OPERADORES_TEXTO;
    }
  });

  // Computed: opciones para columnas de tipo selección
  opcionesColumnaSeleccionada = computed(() => {
    const columnaField = this.nuevoFiltroColumna();
    const columna = this.columnasParaFiltro().find((c) => c.field === columnaField);
    return columna?.opciones || [];
  });

  // Computed: tipo de la columna seleccionada para filtro
  tipoColumnaSeleccionada = computed(() => {
    const columnaField = this.nuevoFiltroColumna();
    const columna = this.columnasParaFiltro().find((c) => c.field === columnaField);
    return columna?.tipo || 'texto';
  });

  // Computed: columnas visibles ordenadas
  columnasVisibles = computed(() => {
    return this.columnasDisponibles()
      .filter((c) => c.visible)
      .sort((a, b) => a.orden - b.orden);
  });

  // Computed: resumen de configuración
  resumenConfig = computed(() => {
    const columnas = this.columnasVisibles().length;
    const filtros = this.filtrosActivos().length;
    const ordenamiento = this.ordenamientoCampo() ? 1 : 0;
    return { columnas, filtros, ordenamiento };
  });

  // Computed: es widget de tabla
  esTabla = computed(() => {
    const item = this.catalogItem();
    return item?.tipo === 'table-mini';
  });

  // Computed: es widget de gráfica
  esGrafica = computed(() => {
    const item = this.catalogItem();
    return item ? esGraficaConfigurable(item.tipo) : false;
  });

  // Computed: es widget de KPI
  esKPI = computed(() => {
    const item = this.catalogItem();
    return item?.tipo === 'kpi-card' || item?.tipo === 'kpi-grid';
  });

  // Computed: es widget de gráficas interactivas
  esGraficaInteractiva = computed(() => {
    const item = this.catalogItem();
    return item?.tipo === 'graficas-interactivas';
  });

  // Computed: es widget de mapa de riesgos (obsoleto - siempre falso)
  esMapaRiesgos = computed(() => false);

  // Computed: info del KPI seleccionado
  kpiInfoSeleccionado = computed(() => {
    return this.kpiTypeOptions.find(k => k.value === this.kpiType());
  });

  // Computed: preview del valor KPI
  kpiPreviewValor = computed(() => {
    const tipo = this.kpiType();
    switch (tipo) {
      case 'cumplimiento': return 87;
      case 'procesos': return 42;
      case 'alertas': return 12;
      case 'objetivos': return 75;
      case 'personalizado': return this.kpiValorPersonalizado();
      default: return 0;
    }
  });

  // Computed: preview de tendencia KPI
  kpiPreviewTendencia = computed(() => {
    const tipo = this.kpiType();
    switch (tipo) {
      case 'cumplimiento': return { valor: 3.2, direccion: 'up' as const };
      case 'procesos': return { valor: 5, direccion: 'up' as const };
      case 'alertas': return { valor: 2, direccion: 'down' as const };
      case 'objetivos': return { valor: 8.5, direccion: 'up' as const };
      default: return { valor: 0, direccion: 'neutral' as const };
    }
  });

  // Computed: métricas disponibles para el data source seleccionado
  chartMetricasDisponibles = computed(() => {
    return getMetricasForDataSource(this.chartDataSource());
  });

  // Computed: agrupaciones disponibles para el data source seleccionado
  chartAgrupacionesDisponibles = computed(() => {
    return getAgrupacionesForDataSource(this.chartDataSource());
  });

  // Computed: colores de la paleta seleccionada
  chartColoresPaleta = computed(() => {
    const paleta = CHART_PALETAS.find(p => p.value === this.chartPaleta());
    return paleta?.colores || CHART_PALETAS[0].colores;
  });

  // Computed: preview data para gráfica
  chartPreviewData = computed(() => {
    const tipo = this.chartTipo();
    if (!tipo) return null;

    const config = this.buildChartConfig();
    return generatePreviewData(config, tipo);
  });

  // Computed: resumen de configuración de gráfica
  resumenChartConfig = computed(() => {
    const dataSource = CHART_DATA_SOURCES.find(ds => ds.value === this.chartDataSource());
    const metrica = CHART_METRICAS.find(m => m.value === this.chartMetrica());
    const agrupacion = CHART_AGRUPACIONES.find(a => a.value === this.chartAgrupacion());
    const periodo = CHART_PERIODOS.find(p => p.value === this.chartPeriodo());
    const paleta = CHART_PALETAS.find(p => p.value === this.chartPaleta());

    return {
      dataSource: dataSource?.label || '',
      metrica: metrica?.label || '',
      agrupacion: agrupacion?.label || '',
      periodo: periodo?.label || '',
      paleta: paleta?.label || '',
    };
  });

  // Datos de preview (mock)
  previewData = computed(() => {
    const source = this.tableDataSource();
    return this.getMockDataForSource(source);
  });

  constructor() {
    // Efecto para inicializar valores cuando cambia el catalogItem
    effect(() => {
      const item = this.catalogItem();
      console.log('[WidgetConfigurator] catalogItem changed:', item);
      if (item) {
        console.log('[WidgetConfigurator] Widget tipo:', item.tipo);
        console.log('[WidgetConfigurator] esGraficaConfigurable:', esGraficaConfigurable(item.tipo));

        this.titulo.set(item.nombre);
        this.subtitulo.set('');
        this.showHeader.set(item.configDefault.showHeader ?? true);
        this.activeTab.set(0);

        if (item.tipo === 'table-mini') {
          console.log('[WidgetConfigurator] Inicializando como TABLA');
          // Inicializar configuración de tabla
          const defaultSource = item.configDefault.tableDataSource || 'procesos';
          this.tableDataSource.set(defaultSource);
          this.tableLimit.set(item.configDefault.tableLimit || 5);
          this.cargarColumnasParaSource(defaultSource);
        } else if (esGraficaConfigurable(item.tipo)) {
          console.log('[WidgetConfigurator] Inicializando como GRÁFICA');
          // Inicializar configuración de gráfica
          this.inicializarChartConfig(item);
        } else if (item.tipo === 'kpi-card' || item.tipo === 'kpi-grid') {
          console.log('[WidgetConfigurator] Inicializando como KPI');
          // Inicializar configuración de KPI
          this.inicializarKPIConfig(item);
        }
      }
    });
  }

  // Inicializar configuración de gráfica según el tipo
  inicializarChartConfig(item: WidgetCatalogItem) {
    const tipo = widgetTipoToChartTipo(item.tipo);
    if (!tipo) return;

    this.chartTipo.set(tipo);
    const defaultConfig = getDefaultChartConfig(tipo);

    // Datos
    this.chartDataSource.set(defaultConfig.dataSource);
    this.chartMetrica.set(defaultConfig.metrica);
    this.chartAgrupacion.set(defaultConfig.agrupacion);
    this.chartPeriodo.set(defaultConfig.periodo);

    // Estilo
    this.chartPaleta.set(defaultConfig.estilo.paleta);
    this.chartLeyendaPosicion.set(defaultConfig.estilo.leyendaPosicion);
    this.chartMostrarGrid.set(defaultConfig.estilo.mostrarGrid);
    this.chartMostrarEjes.set(defaultConfig.estilo.mostrarEjes);
    this.chartAnimaciones.set(defaultConfig.estilo.animaciones);
    this.chartTooltipEnabled.set(defaultConfig.estilo.tooltipEnabled);

    // Interactividad
    this.chartClickable.set(defaultConfig.clickable);
    this.chartZoomEnabled.set(defaultConfig.zoomEnabled);
    this.chartExportable.set(defaultConfig.exportable);
    this.chartAutoRefresh.set(defaultConfig.autoRefresh);
    this.chartRefreshInterval.set(defaultConfig.refreshInterval);

    // Configuración específica por tipo
    if (tipo === 'bar' && defaultConfig.barConfig) {
      this.barOrientacion.set(defaultConfig.barConfig.orientacion);
      this.barApilado.set(defaultConfig.barConfig.apilado);
      this.barMostrarValores.set(defaultConfig.barConfig.mostrarValores);
      this.barBordeRedondeado.set(defaultConfig.barConfig.bordeRedondeado);
      this.barAnchoBarras.set(defaultConfig.barConfig.anchoBarras);
    } else if (tipo === 'line' && defaultConfig.lineConfig) {
      this.lineCurvaSuave.set(defaultConfig.lineConfig.curvaSuave);
      this.lineMostrarPuntos.set(defaultConfig.lineConfig.mostrarPuntos);
      this.lineTamanoPuntos.set(defaultConfig.lineConfig.tamañoPuntos);
      this.lineAreaRellena.set(defaultConfig.lineConfig.areaRellena);
      this.lineGrosorLinea.set(defaultConfig.lineConfig.grosorLinea);
      this.lineLineaPunteada.set(defaultConfig.lineConfig.lineaPunteada);
    } else if (tipo === 'donut' && defaultConfig.donutConfig) {
      this.donutGrosorAnillo.set(defaultConfig.donutConfig.grosorAnillo);
      this.donutMostrarValorCentral.set(defaultConfig.donutConfig.mostrarValorCentral);
      this.donutValorCentralTipo.set(defaultConfig.donutConfig.valorCentralTipo);
      this.donutMaxSegmentos.set(defaultConfig.donutConfig.maxSegmentos);
      this.donutMostrarPorcentajes.set(defaultConfig.donutConfig.mostrarPorcentajes);
    } else if (tipo === 'area' && defaultConfig.areaConfig) {
      this.areaGradiente.set(defaultConfig.areaConfig.gradiente);
      this.areaOpacidad.set(defaultConfig.areaConfig.opacidad);
      this.areaMostrarLineaSuperior.set(defaultConfig.areaConfig.mostrarLineaSuperior);
      this.areaCurvaSuave.set(defaultConfig.areaConfig.curvaSuave);
      this.areaApilado.set(defaultConfig.areaConfig.apilado);
    }
  }

  // Inicializar configuración de KPI según el tipo
  inicializarKPIConfig(item: WidgetCatalogItem) {
    // Establecer tipo de KPI por defecto
    const defaultKpiType = (item.configDefault as any).kpiType || 'cumplimiento';
    this.kpiType.set(defaultKpiType);

    // Configurar icono y color según el tipo
    const kpiInfo = this.kpiTypeOptions.find(k => k.value === defaultKpiType);
    if (kpiInfo) {
      this.kpiIcono.set(kpiInfo.icon);
    }

    // Colores por defecto según tipo
    switch (defaultKpiType) {
      case 'cumplimiento':
        this.kpiColorPrimario.set('#3B82F6'); // Azul
        this.kpiUnidad.set('%');
        this.kpiFormato.set('porcentaje');
        break;
      case 'procesos':
        this.kpiColorPrimario.set('#10B981'); // Verde
        this.kpiUnidad.set('');
        this.kpiFormato.set('numero');
        break;
      case 'alertas':
        this.kpiColorPrimario.set('#F59E0B'); // Amarillo
        this.kpiUnidad.set('');
        this.kpiFormato.set('numero');
        break;
      case 'objetivos':
        this.kpiColorPrimario.set('#8B5CF6'); // Morado
        this.kpiUnidad.set('%');
        this.kpiFormato.set('porcentaje');
        break;
    }

    // Configuraciones por defecto
    this.kpiMostrarTendencia.set(true);
    this.kpiMostrarMeta.set(false);
    this.kpiMetaValor.set(100);
  }

  // Handler cuando cambia el tipo de KPI
  onKPITypeChange(tipo: string) {
    this.kpiType.set(tipo as any);

    const kpiInfo = this.kpiTypeOptions.find(k => k.value === tipo);
    if (kpiInfo) {
      this.kpiIcono.set(kpiInfo.icon);
      // Actualizar título si no es personalizado
      if (tipo !== 'personalizado') {
        this.titulo.set(kpiInfo.label);
      }
    }

    // Actualizar color y formato según tipo
    switch (tipo) {
      case 'cumplimiento':
        this.kpiColorPrimario.set('#3B82F6');
        this.kpiUnidad.set('%');
        this.kpiFormato.set('porcentaje');
        break;
      case 'procesos':
        this.kpiColorPrimario.set('#10B981');
        this.kpiUnidad.set('');
        this.kpiFormato.set('numero');
        break;
      case 'alertas':
        this.kpiColorPrimario.set('#F59E0B');
        this.kpiUnidad.set('');
        this.kpiFormato.set('numero');
        break;
      case 'objetivos':
        this.kpiColorPrimario.set('#8B5CF6');
        this.kpiUnidad.set('%');
        this.kpiFormato.set('porcentaje');
        break;
      case 'personalizado':
        this.kpiColorPrimario.set('#3B82F6');
        this.kpiFormato.set('numero');
        break;
    }
  }

  // Construir objeto ChartConfigCompleta desde las señales
  buildChartConfig(): ChartConfigCompleta {
    const tipo = this.chartTipo();

    const config: ChartConfigCompleta = {
      dataSource: this.chartDataSource(),
      metrica: this.chartMetrica(),
      agrupacion: this.chartAgrupacion(),
      periodo: this.chartPeriodo(),
      fechaInicio: this.chartFechaInicio() || undefined,
      fechaFin: this.chartFechaFin() || undefined,
      estilo: {
        paleta: this.chartPaleta(),
        leyendaPosicion: this.chartLeyendaPosicion(),
        mostrarGrid: this.chartMostrarGrid(),
        mostrarEjes: this.chartMostrarEjes(),
        animaciones: this.chartAnimaciones(),
        tooltipEnabled: this.chartTooltipEnabled(),
      },
      clickable: this.chartClickable(),
      zoomEnabled: this.chartZoomEnabled(),
      exportable: this.chartExportable(),
      autoRefresh: this.chartAutoRefresh(),
      refreshInterval: this.chartRefreshInterval(),
    };

    // Agregar configuración específica por tipo
    if (tipo === 'bar') {
      config.barConfig = {
        orientacion: this.barOrientacion(),
        apilado: this.barApilado(),
        mostrarValores: this.barMostrarValores(),
        bordeRedondeado: this.barBordeRedondeado(),
        anchoBarras: this.barAnchoBarras(),
      };
    } else if (tipo === 'line') {
      config.lineConfig = {
        curvaSuave: this.lineCurvaSuave(),
        mostrarPuntos: this.lineMostrarPuntos(),
        tamañoPuntos: this.lineTamanoPuntos(),
        areaRellena: this.lineAreaRellena(),
        grosorLinea: this.lineGrosorLinea(),
        lineaPunteada: this.lineLineaPunteada(),
      };
    } else if (tipo === 'donut') {
      config.donutConfig = {
        grosorAnillo: this.donutGrosorAnillo(),
        mostrarValorCentral: this.donutMostrarValorCentral(),
        valorCentralTipo: this.donutValorCentralTipo(),
        etiquetaCentral: this.donutEtiquetaCentral() || undefined,
        maxSegmentos: this.donutMaxSegmentos(),
        mostrarPorcentajes: this.donutMostrarPorcentajes(),
      };
    } else if (tipo === 'area') {
      config.areaConfig = {
        gradiente: this.areaGradiente(),
        opacidad: this.areaOpacidad(),
        mostrarLineaSuperior: this.areaMostrarLineaSuperior(),
        curvaSuave: this.areaCurvaSuave(),
        apilado: this.areaApilado(),
      };
    }

    return config;
  }

  // Cambiar data source de gráfica
  onChartDataSourceChange(source: ChartDataSource) {
    this.chartDataSource.set(source);

    // Resetear métrica y agrupación a valores válidos para el nuevo source
    const metricas = getMetricasForDataSource(source);
    const agrupaciones = getAgrupacionesForDataSource(source);

    if (!metricas.find(m => m.value === this.chartMetrica())) {
      this.chartMetrica.set(metricas[0]?.value || 'cantidad');
    }

    if (!agrupaciones.find(a => a.value === this.chartAgrupacion())) {
      this.chartAgrupacion.set(agrupaciones[0]?.value || 'estado');
    }
  }

  // Cargar columnas cuando cambia el data source
  onDataSourceChange(source: string) {
    this.tableDataSource.set(source);
    this.cargarColumnasParaSource(source);
    // Limpiar filtros y ordenamiento al cambiar fuente
    this.filtrosActivos.set([]);
    this.ordenamientoCampo.set('');
    this.nuevoFiltroColumna.set('');
  }

  cargarColumnasParaSource(source: string) {
    const columnas = getColumnsForSource(source);
    const widgetColumns: WidgetColumnConfig[] = columnas.map((col, index) => ({
      field: col.field,
      header: col.header,
      tipo: col.tipo,
      visible: col.visible,
      orden: index,
      sortable: col.sortable,
      filterable: col.filterable,
    }));
    this.columnasDisponibles.set(widgetColumns);
  }

  // Toggle visibilidad de columna
  toggleColumna(columna: WidgetColumnConfig) {
    const columnas = this.columnasDisponibles();
    const index = columnas.findIndex((c) => c.field === columna.field);
    if (index !== -1) {
      columnas[index] = { ...columnas[index], visible: !columnas[index].visible };
      this.columnasDisponibles.set([...columnas]);
    }
  }

  // Drag & Drop para reordenar columnas
  dragStart(columna: WidgetColumnConfig) {
    this.draggedColumn = columna;
  }

  dragEnd() {
    this.draggedColumn = null;
  }

  drop(targetColumna: WidgetColumnConfig) {
    if (this.draggedColumn && this.draggedColumn.field !== targetColumna.field) {
      const columnas = [...this.columnasDisponibles()];
      const draggedIndex = columnas.findIndex((c) => c.field === this.draggedColumn!.field);
      const targetIndex = columnas.findIndex((c) => c.field === targetColumna.field);

      // Intercambiar orden
      const temp = columnas[draggedIndex].orden;
      columnas[draggedIndex] = { ...columnas[draggedIndex], orden: columnas[targetIndex].orden };
      columnas[targetIndex] = { ...columnas[targetIndex], orden: temp };

      this.columnasDisponibles.set(columnas);
    }
    this.draggedColumn = null;
  }

  // Agregar filtro
  agregarFiltro() {
    const columnaField = this.nuevoFiltroColumna();
    const operador = this.nuevoFiltroOperador();
    const valor = this.nuevoFiltroValor();

    if (!columnaField || !operador || valor === null || valor === '') return;

    const columna = this.columnasParaFiltro().find((c) => c.field === columnaField);
    if (!columna) return;

    const nuevoFiltro: FiltroActivo = {
      columna: columnaField,
      tipo: columna.tipo,
      operador,
      valor,
      valorHasta: operador === 'entre' ? this.nuevoFiltroValorHasta() : undefined,
      etiqueta: this.generarEtiquetaFiltro(columna, operador, valor),
    };

    this.filtrosActivos.set([...this.filtrosActivos(), nuevoFiltro]);

    // Limpiar campos
    this.nuevoFiltroColumna.set('');
    this.nuevoFiltroOperador.set('');
    this.nuevoFiltroValor.set(null);
    this.nuevoFiltroValorHasta.set(null);
  }

  generarEtiquetaFiltro(columna: ColumnaConfig, operador: string, valor: any): string {
    const operadorLabel =
      [...OPERADORES_TEXTO, ...OPERADORES_NUMERO, ...OPERADORES_FECHA].find(
        (o) => o.value === operador
      )?.label || operador;

    let valorStr = valor;
    if (columna.tipo === 'seleccion' && columna.opciones) {
      valorStr = columna.opciones.find((o) => o.value === valor)?.label || valor;
    }

    return `${columna.header} ${operadorLabel.toLowerCase()} "${valorStr}"`;
  }

  // Eliminar filtro
  eliminarFiltro(index: number) {
    const filtros = this.filtrosActivos();
    filtros.splice(index, 1);
    this.filtrosActivos.set([...filtros]);
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    this.filtrosActivos.set([]);
  }

  // Cerrar drawer
  cerrar() {
    this.visibleChange.emit(false);
    this.onCancel.emit();
  }

  // Confirmar y agregar widget
  confirmar() {
    console.log('[WidgetConfigurator] ====== CONFIRMANDO WIDGET ======');
    console.log('[WidgetConfigurator] catalogItem:', this.catalogItem());
    console.log('[WidgetConfigurator] titulo:', this.titulo());
    console.log('[WidgetConfigurator] esTabla:', this.esTabla());
    console.log('[WidgetConfigurator] esGrafica:', this.esGrafica());
    console.log('[WidgetConfigurator] esKPI:', this.esKPI());
    console.log('[WidgetConfigurator] chartTipo:', this.chartTipo());

    const config: WidgetConfig = {
      showHeader: this.showHeader(),
    };

    // Configuración específica para tablas
    if (this.esTabla()) {
      config.tableDataSource = this.tableDataSource() as any;
      config.tableLimit = this.tableLimit();
      config.tableColumnsConfig = this.columnasDisponibles();
      config.tableFilters = this.filtrosActivos();

      if (this.ordenamientoCampo()) {
        config.tableOrdenamiento = {
          campo: this.ordenamientoCampo(),
          direccion: this.ordenamientoDireccion(),
        };
      }
    }

    // Configuración específica para gráficas
    if (this.esGrafica()) {
      config.chartType = this.chartTipo() as any;
      config.chartConfig = this.buildChartConfig();
    }

    // Configuración específica para KPIs
    if (this.esKPI()) {
      const kpiType = this.kpiType();
      config.kpiType = kpiType === 'personalizado' ? 'cumplimiento' : kpiType as any;

      // Guardar configuración extendida de KPI
      const kpiConfig: KPIConfig = {
        tipo: kpiType,
        colorPrimario: this.kpiColorPrimario(),
        colorSecundario: this.kpiColorSecundario(),
        icono: this.kpiIcono(),
        mostrarTendencia: this.kpiMostrarTendencia(),
        mostrarMeta: this.kpiMostrarMeta(),
        metaValor: this.kpiMetaValor(),
        unidad: this.kpiUnidad(),
        formato: this.kpiFormato(),
      };

      // Agregar valores personalizados si aplica
      if (kpiType === 'personalizado') {
        kpiConfig.tituloPersonalizado = this.kpiTituloPersonalizado();
        kpiConfig.valorPersonalizado = this.kpiValorPersonalizado();
        kpiConfig.descripcionPersonalizado = this.kpiDescripcionPersonalizado();
      }

      config.kpiConfig = kpiConfig;
    }

    const emitData = {
      titulo: this.titulo(),
      subtitulo: this.subtitulo(),
      config,
    };

    console.log('[WidgetConfigurator] Emitiendo onConfirm con:', emitData);
    this.onConfirm.emit(emitData);

    this.visibleChange.emit(false);
  }

  // Datos mock para preview
  getMockDataForSource(source: string): any[] {
    const mockData: Record<string, any[]> = {
      riesgos: [
        {
          id: 'R001',
          descripcion: 'Fallo en servidor',
          activoNombre: 'Servidor Principal',
          probabilidad: 3,
          impacto: 4,
          nivelRiesgo: 12,
          estado: 'evaluado',
        },
        {
          id: 'R002',
          descripcion: 'Brecha de seguridad',
          activoNombre: 'Base de Datos',
          probabilidad: 2,
          impacto: 5,
          nivelRiesgo: 10,
          estado: 'mitigado',
        },
        {
          id: 'R003',
          descripcion: 'Pérdida de datos',
          activoNombre: 'Backup System',
          probabilidad: 1,
          impacto: 5,
          nivelRiesgo: 5,
          estado: 'identificado',
        },
      ],
      procesos: [
        { id: 'P001', nombre: 'Gestión de Riesgos', estado: 'activo', cumplimiento: 85 },
        { id: 'P002', nombre: 'Control de Acceso', estado: 'revision', cumplimiento: 72 },
        { id: 'P003', nombre: 'Backup y Recuperación', estado: 'activo', cumplimiento: 95 },
      ],
      incidentes: [
        { id: 'I001', titulo: 'Caída del sistema', severidad: 'alta', estado: 'resuelto' },
        { id: 'I002', titulo: 'Intento de acceso', severidad: 'media', estado: 'abierto' },
        { id: 'I003', titulo: 'Error de configuración', severidad: 'baja', estado: 'cerrado' },
      ],
      activos: [
        { id: 'A001', nombre: 'Servidor Web', tipo: 'hardware', criticidad: 'alta' },
        { id: 'A002', nombre: 'ERP Sistema', tipo: 'software', criticidad: 'alta' },
        { id: 'A003', nombre: 'Red Interna', tipo: 'hardware', criticidad: 'media' },
      ],
      alertas: [
        { id: 'AL001', mensaje: 'CPU alto', tipo: 'sistema', severidad: 'media' },
        { id: 'AL002', mensaje: 'Backup fallido', tipo: 'proceso', severidad: 'alta' },
      ],
    };

    return mockData[source] || [];
  }

  // Helper para obtener el nombre de columna
  getColumnaHeader(field: string): string {
    const columna = this.columnasParaFiltro().find((c) => c.field === field);
    return columna?.header || field;
  }
}
