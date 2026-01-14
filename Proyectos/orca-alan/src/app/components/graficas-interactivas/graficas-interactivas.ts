import { Component, Input, Output, EventEmitter, signal, computed, inject, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GroqService } from '../../services/groq.service';
import { ThemeService } from '../../services/theme.service';

// Importar tipos de ApexCharts
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexFill,
  ApexStroke,
  ApexTooltip,
  ApexResponsive,
  ApexTheme,
  ApexGrid,
  ApexYAxis,
  ApexAnnotations,
  ApexMarkers
} from 'ng-apexcharts';

// Tipos de gráficas disponibles
export type TipoGraficaAvanzada =
  | 'pie' | 'donut' | 'radialBar' | 'polarArea' | 'gauge'  // Circulares
  | 'bar' | 'column' | 'stackedBar' | 'groupedBar' | 'stackedBarHorizontal'  // Barras
  | 'line' | 'area' | 'stepline' | 'spline' | 'stackedArea'  // Líneas
  | 'radar' | 'scatter' | 'bubble' | 'heatmap' | 'treemap'  // Avanzadas
  | 'funnel' | 'pyramid' | 'sankey'  // Embudo/Flujo
  | 'waterfall' | 'bullet' | 'boxplot' | 'candlestick'  // Estadísticas
  | 'sunburst' | 'riskMatrix' | 'correlationMatrix'  // Especializadas
  | 'combo' | 'dumbbell' | 'regression'  // Combinadas
  | 'trendline' | 'forecast' | 'rangeArea';  // IA/Predictivo

export interface DatosGrafica {
  labels: string[];
  series: { name: string; data: number[] }[] | number[];
}

export interface ConfigGraficaAvanzada {
  tipo: TipoGraficaAvanzada;
  titulo: string;
  subtitulo?: string;
  datos: DatosGrafica;
  animaciones: boolean;
  mostrarLeyenda: boolean;
  mostrarDataLabels: boolean;
  mostrarTooltip: boolean;
  tema: 'light' | 'dark';
  paleta: string[];
  altura: number;
}

interface TipoGraficaItem {
  label: string;
  value: TipoGraficaAvanzada;
  icon: string;
  descripcion: string;
  recomendadoPara: string[];
}

interface GrupoTiposGrafica {
  label: string;
  value: string;
  items: TipoGraficaItem[];
}

interface PaletaOption {
  label: string;
  value: string;
  descripcion: string;
}

interface CampoDisponible {
  label: string;
  value: string;
  tipo: 'categoria' | 'numerico' | 'fecha';
  descripcion: string;
  conteo?: number;
  valores?: { [k: string]: number };
}

interface RecomendacionAsistente {
  tipo: 'info' | 'success' | 'warn' | 'error';
  icono: string;
  titulo: string;
  mensaje: string;
}

// Interfaz para configuraciones guardadas
export interface ConfiguracionGuardada {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaCreacion: Date;
  configuracion: {
    tipoGrafica: TipoGraficaAvanzada;
    campoEjeX: string;
    campoEjeY: string | null;
    campoAgrupacion: string | null;
    paleta: string;
    animaciones: boolean;
    mostrarLeyenda: boolean;
    mostrarDataLabels: boolean;
    tema: 'light' | 'dark';
  };
}

// Interfaz para filtros de datos
export interface FiltroGrafica {
  campo: string;
  valor: string;
  operador?: 'igual' | 'contiene' | 'diferente';
}

// Interfaz para mensajes del asistente IA
export interface MensajeAsistente {
  id: string;
  tipo: 'user' | 'assistant';
  mensaje: string;
  fecha: Date;
  configuracionSugerida?: {
    tipoGrafica?: TipoGraficaAvanzada;
    campoEjeX?: string;
    campoEjeY?: string | null;
    paleta?: string;
    animaciones?: boolean;
    mostrarLeyenda?: boolean;
    mostrarDataLabels?: boolean;
    tema?: 'light' | 'dark';
    filtro?: FiltroGrafica;
  };
}

// Interfaz para anotaciones colaborativas
export interface AnotacionGrafica {
  id: string;
  tipo: 'punto' | 'rango' | 'texto';
  categoria?: string;
  valor?: number;
  texto: string;
  color: string;
  autor: string;
  fecha: Date;
  x?: number;
  x2?: number;  // Para rangos
  y?: number;
  y2?: number;
}

// Interfaz para comparación temporal
export interface ComparacionTemporal {
  habilitada: boolean;
  periodo1: { desde: Date; hasta: Date; label: string };
  periodo2: { desde: Date; hasta: Date; label: string };
  modo: 'overlay' | 'sideBySide';
}

// Opciones de ApexCharts combinadas
export interface ApexChartOptions {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  legend?: ApexLegend;
  fill?: ApexFill;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  responsive?: ApexResponsive[];
  theme?: ApexTheme;
  grid?: ApexGrid;
  colors?: string[];
  labels?: string[];
  annotations?: ApexAnnotations;
  markers?: ApexMarkers;
}

@Component({
  selector: 'app-graficas-interactivas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ChartModule,
    ButtonModule, SelectModule, ToggleButtonModule, TabsModule,
    DividerModule, InputTextModule, TooltipModule, TagModule, CardModule,
    AccordionModule, DialogModule, TextareaModule, ContextMenuModule, MenuModule,
    DrawerModule, InputNumberModule, CheckboxModule, NgApexchartsModule
  ],
  templateUrl: './graficas-interactivas.html',
  styleUrl: './graficas-interactivas.scss'
})
export class GraficasInteractivasComponent implements AfterViewInit, OnDestroy {

  private groqService = inject(GroqService);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);
  private themeService = inject(ThemeService);

  // ==================== RESIZE OBSERVER ====================

  @ViewChild('chartContainer') chartContainerRef!: ElementRef<HTMLDivElement>;

  private resizeObserver: ResizeObserver | null = null;
  private resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private themeObserver: MutationObserver | null = null;

  // CSS Variables cacheadas para design tokens
  private cssTokens = {
    textColor: '',
    textColorSecondary: '',
    surfaceBorder: '',
    surfaceCard: '',
    primaryColor: ''
  };

  // Signal para forzar actualización del chart
  private chartUpdateTrigger = signal(0);

  // Inputs con guards para evitar actualizaciones innecesarias
  private _lastDatos: DatosGrafica | null = null;
  @Input() set datos(value: DatosGrafica) {
    // Solo actualizar si los datos realmente cambiaron
    if (value && (
      !this._lastDatos ||
      JSON.stringify(value.labels) !== JSON.stringify(this._lastDatos.labels) ||
      JSON.stringify(value.series) !== JSON.stringify(this._lastDatos.series)
    )) {
      this._lastDatos = value;
      this.datosSignal.set(value);
    }
  }

  @Input() set campoInicial(value: string) {
    if (value && value !== this.campoEjeX()) {
      this.campoEjeX.set(value);
    }
  }

  @Input() titulo = 'Gráfica';
  @Input() subtitulo = '';

  // Modo widget: solo muestra la gráfica sin panel de configuración
  @Input() modoWidget = false;

  // ID único del widget para almacenar anotaciones separadas
  @Input() widgetId: string | null = null;

  // Inputs para configuración externa (con guards)
  private _lastTipo: TipoGraficaAvanzada | undefined;
  @Input() set tipoGraficaExterno(value: TipoGraficaAvanzada | undefined) {
    if (value && value !== this._lastTipo) {
      this._lastTipo = value;
      this.tipoGrafica.set(value);
    }
  }

  private _lastPaleta: string | undefined;
  @Input() set paletaExterna(value: string | undefined) {
    // Siempre actualizar si hay un valor válido
    // Esto asegura que la paleta externa siempre tenga prioridad
    if (value && this.paletas[value]) {
      this._lastPaleta = value;
      this.paletaSeleccionada.set(value);
    }
  }

  @Input() set animacionesExternas(value: boolean | undefined) {
    if (value !== undefined && value !== this.animaciones()) {
      this.animaciones.set(value);
    }
  }

  @Input() set mostrarLeyendaExterna(value: boolean | undefined) {
    if (value !== undefined && value !== this.mostrarLeyenda()) {
      this.mostrarLeyenda.set(value);
    }
  }

  @Input() set mostrarDataLabelsExterna(value: boolean | undefined) {
    if (value !== undefined && value !== this.mostrarDataLabels()) {
      this.mostrarDataLabels.set(value);
    }
  }

  private _lastTema: 'light' | 'dark' | undefined;
  @Input() set temaExterno(value: 'light' | 'dark' | undefined) {
    // El tema ahora se sincroniza con ThemeService - el input externo actualiza el servicio si es necesario
    if (value && value !== this._lastTema) {
      this._lastTema = value;
      this.themeService.setTheme(value);
    }
  }

  @Output() dataPointClick = new EventEmitter<{ categoria: string; valor: number; serie?: string }>();
  @Output() legendClick = new EventEmitter<{ serie: string; visible: boolean }>();
  @Output() filtroAplicado = new EventEmitter<FiltroGrafica | null>();

  // Signal público para acceso en template
  readonly datosSignal = signal<DatosGrafica>({ labels: [], series: [] });

  // Estado del componente
  tipoGrafica = signal<TipoGraficaAvanzada>('donut');
  animaciones = signal(true);
  mostrarLeyenda = signal(true);
  mostrarDataLabels = signal(true);
  mostrarTooltip = signal(true);
  // Usar el signal del ThemeService para tema unificado de la plataforma
  tema = computed(() => this.themeService.currentTheme());
  paletaSeleccionada = signal('vibrant');

  // Paletas de colores predefinidas (estilo AmCharts)
  paletas: Record<string, string[]> = {
    vibrant: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1'],
    pastel: ['#80DEEA', '#CE93D8', '#FFAB91', '#A5D6A7', '#90CAF9', '#FFF59D', '#BCAAA4', '#B0BEC5', '#F48FB1', '#81D4FA'],
    neon: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0080', '#8000FF', '#FF8000', '#0080FF', '#80FF00', '#FF0000'],
    corporate: ['#2E5BFF', '#8C54FF', '#00C1D4', '#FAD02C', '#F7C137', '#33D9B2', '#FF5252', '#00B8D4', '#7C4DFF', '#FFAB40'],
    earth: ['#8D6E63', '#A1887F', '#BCAAA4', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723', '#D7CCC8', '#EFEBE9'],
    ocean: ['#0277BD', '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE', '#006064'],
    sunset: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#FFE66D', '#C9E4CA', '#87CEEB', '#9370DB', '#FF69B4'],
    semaforo: ['#22C55E', '#EAB308', '#F97316', '#EF4444', '#DC2626'],
    monoazul: ['#1E3A5F', '#2E5984', '#3E78A9', '#4E97CE', '#6EB5E8', '#8ED3F2', '#AEE9FC']
  };

  // Opciones de paletas para el select
  paletasOptions: PaletaOption[] = [
    { label: 'Vibrante', value: 'vibrant', descripcion: 'Colores vivos y llamativos para presentaciones' },
    { label: 'Pastel', value: 'pastel', descripcion: 'Tonos suaves ideales para dashboards' },
    { label: 'Neón', value: 'neon', descripcion: 'Colores brillantes para temas oscuros' },
    { label: 'Corporativo', value: 'corporate', descripcion: 'Profesional para reportes ejecutivos' },
    { label: 'Tierra', value: 'earth', descripcion: 'Tonos naturales y cálidos' },
    { label: 'Océano', value: 'ocean', descripcion: 'Escala de azules para datos secuenciales' },
    { label: 'Atardecer', value: 'sunset', descripcion: 'Gradiente cálido para visualizaciones artísticas' },
    { label: 'Semáforo', value: 'semaforo', descripcion: 'Verde a rojo para indicadores de riesgo' },
    { label: 'Mono Azul', value: 'monoazul', descripcion: 'Escala monocromática profesional' }
  ];

  // Valores disponibles para filtrado (ej: nombres de servidores, activos, etc.)
  @Input() valoresFiltrado: { campo: string; valores: string[] }[] = [];

  // Filtro activo
  filtroActivo = signal<FiltroGrafica | null>(null);

  // Anotaciones colaborativas
  anotaciones = signal<AnotacionGrafica[]>([]);
  mostrarDialogAnotacion = signal(false);
  nuevaAnotacion = signal<Partial<AnotacionGrafica>>({});
  anotacionEditando = signal<string | null>(null);

  // Comparación temporal
  comparacionTemporal = signal<ComparacionTemporal>({
    habilitada: false,
    periodo1: { desde: new Date(), hasta: new Date(), label: 'Periodo actual' },
    periodo2: { desde: new Date(), hasta: new Date(), label: 'Periodo anterior' },
    modo: 'overlay'
  });
  mostrarDialogComparacion = signal(false);

  // Drawer de creación de alerta
  mostrarDrawerAlerta = signal(false);
  alertaForm = signal<{
    nombre: string;
    descripcion: string;
    metricaNombre: string;
    operador: string;
    valorUmbral: number;
    severidad: string;
    cooldownMinutos: number;
    enviarInApp: boolean;
    enviarEmail: boolean;
    activo: boolean;
    // Datos preseleccionados de la gráfica
    categoriaSeleccionada: string;
    campoSeleccionado: string;
  }>({
    nombre: '',
    descripcion: '',
    metricaNombre: '',
    operador: 'GT',
    valorUmbral: 0,
    severidad: 'warning',
    cooldownMinutos: 60,
    enviarInApp: true,
    enviarEmail: false,
    activo: true,
    categoriaSeleccionada: '',
    campoSeleccionado: ''
  });

  // Opciones para el formulario de alerta
  opcionesOperadorAlerta = [
    { label: 'Mayor que (>)', value: 'GT' },
    { label: 'Menor que (<)', value: 'LT' },
    { label: 'Mayor o igual (>=)', value: 'GTE' },
    { label: 'Menor o igual (<=)', value: 'LTE' },
    { label: 'Igual (=)', value: 'EQ' },
    { label: 'Diferente (!=)', value: 'NE' }
  ];

  opcionesSeveridadAlerta = [
    { label: 'Información', value: 'info' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Crítico', value: 'critical' }
  ];

  // Drill-down (siempre activo)
  drillDownStack = signal<{ campo: string; valor: string }[]>([]);
  drillDownActivo = signal(true); // Siempre activo

  // Menú de exportación
  exportMenuItems: MenuItem[] = [
    {
      label: 'Exportar como PNG',
      icon: 'pi pi-image',
      command: () => this.exportarPNG()
    },
    {
      label: 'Exportar como SVG',
      icon: 'pi pi-file',
      command: () => this.exportarSVG()
    }
  ];

  // Context menu para drill-down
  @ViewChild('drillDownMenu') drillDownMenu!: ContextMenu;
  contextMenuItems = signal<MenuItem[]>([]);
  selectedDataPoint = signal<{ categoria: string; valor: number; indice: number } | null>(null);
  contextMenuVisible = signal(false);
  contextMenuPosition = signal({ x: 0, y: 0 });

  // Opciones dinámicas de drill-down basadas en el campo actual
  drillDownOptions = computed<MenuItem[]>(() => {
    const currentField = this.campoEjeX();
    const dataPoint = this.selectedDataPoint();

    if (!dataPoint) return [];

    const baseItems: MenuItem[] = [
      {
        label: `Ver detalles de "${dataPoint.categoria}"`,
        icon: 'pi pi-eye',
        command: () => this.verDetallesDataPoint(dataPoint)
      },
      {
        label: `Filtrar por "${dataPoint.categoria}"`,
        icon: 'pi pi-filter',
        command: () => this.filtrarPorDataPoint(dataPoint)
      },
      { separator: true },
      {
        label: 'Desglosar por...',
        icon: 'pi pi-chart-bar',
        items: this.getDrillDownSubItems(currentField, dataPoint)
      }
    ];

    // Añadir opción de exportar segmento
    baseItems.push(
      { separator: true },
      {
        label: 'Exportar datos de este segmento',
        icon: 'pi pi-download',
        command: () => this.exportarSegmento(dataPoint)
      },
      {
        label: 'Crear alerta para este valor',
        icon: 'pi pi-bell',
        command: () => this.crearAlertaParaValor(dataPoint)
      }
    );

    return baseItems;
  });

  // Output para drill-down events
  @Output() drillDownEvent = new EventEmitter<{ tipo: string; categoria: string; campo: string; filtro?: FiltroGrafica }>();
  @Output() exportSegmentEvent = new EventEmitter<{ categoria: string; valor: number }>();
  @Output() createAlertEvent = new EventEmitter<{ categoria: string; valor: number; campo: string }>();
  @Output() configClick = new EventEmitter<void>();

  // Computed: Determinar si usar ApexCharts para el tipo actual
  usarApexCharts = computed(() => {
    const tipo = this.tipoGrafica();
    // Tipos que requieren ApexCharts para renderizado correcto
    const apexTypes = [
      'funnel', 'pyramid', 'radialBar', 'treemap', 'heatmap',
      'bubble', 'waterfall', 'sankey', 'sunburst', 'gauge',
      'boxplot', 'bullet', 'dumbbell', 'riskMatrix', 'correlationMatrix',
      'stackedBarHorizontal', 'stackedArea', 'combo', 'regression', 'rangeArea',
      'trendline', 'forecast'
    ];
    return apexTypes.includes(tipo);
  });

  // Campos disponibles para selección de datos
  @Input() camposDisponibles: CampoDisponible[] = [
    { label: 'Tipo de Entidad', value: 'tipoEntidad', tipo: 'categoria', descripcion: 'Riesgo o Incidente' },
    { label: 'Estado', value: 'estado', tipo: 'categoria', descripcion: 'Estado actual del registro' },
    { label: 'Severidad', value: 'severidad', tipo: 'categoria', descripcion: 'Nivel de severidad' },
    { label: 'Nivel de Riesgo', value: 'nivelRiesgo', tipo: 'numerico', descripcion: 'Valor calculado del riesgo' },
    { label: 'Responsable', value: 'responsable', tipo: 'categoria', descripcion: 'Persona asignada' },
    { label: 'Activo/Proceso', value: 'contenedorNombre', tipo: 'categoria', descripcion: 'Elemento relacionado' },
    { label: 'Fecha', value: 'fecha', tipo: 'fecha', descripcion: 'Fecha del registro' },
    { label: 'Probabilidad', value: 'probabilidad', tipo: 'numerico', descripcion: 'Probabilidad del riesgo (1-5)' },
    { label: 'Impacto', value: 'impacto', tipo: 'numerico', descripcion: 'Impacto del riesgo (1-5)' }
  ];

  // Campos seleccionados
  campoEjeX = signal('estado');
  campoEjeY = signal<string | null>(null);
  campoAgrupacion = signal<string | null>(null);

  @Output() campoSeleccionado = new EventEmitter<{ campo: string; tipo: string }>();

  // Configuraciones guardadas
  configuracionesGuardadas = signal<ConfiguracionGuardada[]>([]);
  mostrarDialogGuardar = signal(false);
  nombreConfiguracion = signal('');
  descripcionConfiguracion = signal('');
  tabActivo = signal<'config' | 'guardadas' | 'asistente'>('config');

  // Asistente IA
  mensajesAsistente = signal<MensajeAsistente[]>([]);
  inputAsistente = signal('');
  asistenteEscribiendo = signal(false);
  sugerenciasPredefinidas = [
    'Quiero ver los riesgos por estado en un gráfico de dona',
    'Muéstrame una gráfica de barras con la severidad',
    'Necesito ver la distribución por responsable',
    'Crear una línea de tiempo por fecha',
    'Gráfica de pastel con colores corporativos'
  ];

  // Cargar configuraciones desde localStorage al iniciar
  private readonly STORAGE_KEY = 'graficas-configuraciones';

  constructor() {
    this.cargarConfiguracionesDesdeStorage();
    this.cargarAnotacionesDesdeStorage();

    // Effect: Cuando cambia el drill-down stack o filtro, notificar resize para que ApexCharts recalcule
    effect(() => {
      // Leer los signals para establecer las dependencias
      const stack = this.drillDownStack();
      const filtro = this.filtroActivo();
      const campo = this.campoEjeX();
      // Solo en modo widget y después de un pequeño delay para que el DOM se actualice
      if (this.modoWidget) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);
      }
    });
  }

  // ==================== LIFECYCLE HOOKS ====================

  ngAfterViewInit(): void {
    // Inicializar ResizeObserver para detectar cambios de tamaño
    this.initResizeObserver();
    // Inicializar detección automática del tema
    this.initThemeDetection();
  }

  ngOnDestroy(): void {
    // Limpiar ResizeObserver
    this.destroyResizeObserver();
    // Limpiar ThemeObserver
    this.destroyThemeObserver();
  }

  // ==================== THEME & CSS TOKENS ====================

  private initThemeDetection(): void {
    // Leer CSS tokens iniciales del sistema de diseño
    this.updateCssTokens();

    // Observar cambios en el tema para actualizar los tokens CSS
    this.themeObserver = new MutationObserver(() => {
      this.ngZone.run(() => {
        this.updateCssTokens();
      });
    });

    const htmlElement = document.documentElement;
    this.themeObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }

  /** Lee los CSS variables del sistema de diseño */
  private updateCssTokens(): void {
    const styles = getComputedStyle(document.documentElement);
    this.cssTokens = {
      textColor: styles.getPropertyValue('--text-color').trim() || (this.tema() === 'dark' ? '#fafafa' : '#334155'),
      textColorSecondary: styles.getPropertyValue('--text-color-secondary').trim() || (this.tema() === 'dark' ? '#a1a1aa' : '#64748b'),
      surfaceBorder: styles.getPropertyValue('--surface-border').trim() || (this.tema() === 'dark' ? '#27272a' : '#e2e8f0'),
      surfaceCard: styles.getPropertyValue('--surface-card').trim() || (this.tema() === 'dark' ? '#18181b' : '#ffffff'),
      primaryColor: styles.getPropertyValue('--primary-color').trim() || '#10b981'
    };
  }

  /** Obtiene un token CSS con fallback */
  private getCssToken(token: keyof typeof this.cssTokens, fallbackLight: string, fallbackDark: string): string {
    const value = this.cssTokens[token];
    if (value) return value;
    return this.tema() === 'dark' ? fallbackDark : fallbackLight;
  }

  private destroyThemeObserver(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  // ==================== RESIZE OBSERVER METHODS ====================

  private initResizeObserver(): void {
    // Deshabilitado temporalmente - Chart.js ya tiene responsive: true
    // El ResizeObserver puede causar loops de re-render
  }

  private destroyResizeObserver(): void {
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
      this.resizeDebounceTimer = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  /** Método público para forzar resize desde componentes padres */
  forceChartResize(): void {
    // Chart.js con responsive: true se redimensiona automáticamente
  }

  private cargarConfiguracionesDesdeStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const configs = JSON.parse(stored);
        // Convertir fechas de string a Date
        configs.forEach((c: any) => c.fechaCreacion = new Date(c.fechaCreacion));
        this.configuracionesGuardadas.set(configs);
      }
    } catch (e) {
      console.error('Error cargando configuraciones:', e);
    }
  }

  private guardarConfiguracionesEnStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.configuracionesGuardadas()));
    } catch (e) {
      console.error('Error guardando configuraciones:', e);
    }
  }

  // Computed: campos para categorías (eje X)
  camposCategoria = computed(() =>
    this.camposDisponibles.filter(c => c.tipo === 'categoria')
  );

  // Computed: campos numéricos (eje Y)
  camposNumericos = computed(() =>
    this.camposDisponibles.filter(c => c.tipo === 'numerico')
  );

  // Computed: ¿Necesita Eje Y? (según tipo de gráfica)
  necesitaEjeY = computed(() => {
    const tipo = this.tipoGrafica();
    // Gráficas que necesitan dos ejes
    return ['scatter', 'heatmap', 'radar'].includes(tipo);
  });

  // Computed: ¿Es gráfica circular?
  esGraficaCircular = computed(() => {
    return this.isNonAxisChart(this.tipoGrafica());
  });

  // Computed: ¿Es gráfica de líneas/tiempo?
  esGraficaTemporal = computed(() => {
    const tipo = this.tipoGrafica();
    return ['line', 'area', 'spline', 'stepline'].includes(tipo);
  });

  // Computed: Campos recomendados para el tipo de gráfica actual
  camposRecomendados = computed(() => {
    const tipoInfo = this.getTipoGraficaInfo(this.tipoGrafica());
    if (!tipoInfo) return [];
    return this.camposDisponibles.filter(c =>
      tipoInfo.recomendadoPara.includes(c.value)
    );
  });

  // Computed: Recomendaciones del asistente
  recomendacionesAsistente = computed<RecomendacionAsistente[]>(() => {
    const tipo = this.tipoGrafica();
    const campoX = this.campoEjeX();
    const datos = this.datosSignal();
    const recomendaciones: RecomendacionAsistente[] = [];

    // Recomendación por tipo de gráfica
    const tipoInfo = this.getTipoGraficaInfo(tipo);
    if (tipoInfo) {
      recomendaciones.push({
        tipo: 'info',
        icono: 'pi pi-chart-bar',
        titulo: `Gráfica ${tipoInfo.label}`,
        mensaje: tipoInfo.descripcion
      });
    }

    // Campos recomendados para este tipo
    if (tipoInfo && tipoInfo.recomendadoPara.length > 0) {
      const camposRec = this.camposDisponibles
        .filter(c => tipoInfo.recomendadoPara.includes(c.value))
        .map(c => c.label)
        .join(', ');
      recomendaciones.push({
        tipo: 'success',
        icono: 'pi pi-lightbulb',
        titulo: 'Campos recomendados',
        mensaje: `Para este tipo de gráfica se recomienda: ${camposRec}`
      });
    }

    // Advertencia: Muchas categorías para gráficas circulares
    if (datos.labels.length > 8 && this.isNonAxisChart(tipo)) {
      recomendaciones.push({
        tipo: 'warn',
        icono: 'pi pi-exclamation-triangle',
        titulo: 'Muchas categorías',
        mensaje: `Tienes ${datos.labels.length} categorías. Para gráficas circulares se recomienda máximo 7-8. Considera usar barras.`
      });
    }

    // Advertencia: Pocos datos para líneas
    if (datos.labels.length <= 3 && this.esGraficaTemporal()) {
      recomendaciones.push({
        tipo: 'warn',
        icono: 'pi pi-info-circle',
        titulo: 'Pocos puntos',
        mensaje: 'Las gráficas de línea funcionan mejor con más puntos de datos para mostrar tendencias.'
      });
    }

    // Sugerencia de paleta según datos
    if (campoX === 'severidad' || campoX === 'nivelRiesgo' || campoX === 'estado') {
      recomendaciones.push({
        tipo: 'info',
        icono: 'pi pi-palette',
        titulo: 'Sugerencia de paleta',
        mensaje: 'Para datos de severidad o estados, la paleta "Semáforo" o "Corporativo" ayuda a identificar niveles visualmente.'
      });
    }

    return recomendaciones;
  });

  private getTipoGraficaInfo(tipo: TipoGraficaAvanzada): TipoGraficaItem | undefined {
    for (const grupo of this.tiposGraficaOpciones) {
      const item = grupo.items.find(i => i.value === tipo);
      if (item) return item;
    }
    return undefined;
  }

  // Tipos de gráficas agrupados
  tiposGraficaOpciones: GrupoTiposGrafica[] = [
    {
      label: 'Circulares',
      value: 'circulares',
      items: [
        { label: 'Donut', value: 'donut', icon: 'pi pi-circle', descripcion: 'Ideal para mostrar proporciones con total central. Recomendado para 3-7 categorías.', recomendadoPara: ['estado', 'severidad', 'tipoEntidad'] },
        { label: 'Pie', value: 'pie', icon: 'pi pi-chart-pie', descripcion: 'Muestra distribución porcentual. Mejor para pocas categorías bien diferenciadas.', recomendadoPara: ['estado', 'severidad'] },
        { label: 'Radial Bar', value: 'radialBar', icon: 'pi pi-sun', descripcion: 'Progreso circular con porcentajes. Útil para mostrar cumplimiento de metas.', recomendadoPara: ['probabilidad', 'impacto'] },
        { label: 'Polar Area', value: 'polarArea', icon: 'pi pi-slack', descripcion: 'Combina área y ángulo para comparar magnitudes. Ideal para datos cíclicos.', recomendadoPara: ['estado', 'tipoEntidad'] },
        { label: 'Velocímetro', value: 'gauge', icon: 'pi pi-gauge', descripcion: 'Medidor circular para mostrar un valor dentro de un rango. Ideal para KPIs.', recomendadoPara: ['nivelRiesgo', 'probabilidad', 'impacto'] }
      ]
    },
    {
      label: 'Barras',
      value: 'barras',
      items: [
        { label: 'Columnas', value: 'column', icon: 'pi pi-chart-bar', descripcion: 'Comparación vertical de categorías. La más común y fácil de interpretar.', recomendadoPara: ['estado', 'responsable', 'contenedorNombre'] },
        { label: 'Barras Horizontal', value: 'bar', icon: 'pi pi-align-left', descripcion: 'Ideal cuando las etiquetas son largas o hay muchas categorías.', recomendadoPara: ['responsable', 'contenedorNombre'] },
        { label: 'Barras Apiladas', value: 'stackedBar', icon: 'pi pi-objects-column', descripcion: 'Muestra composición y total. Útil para comparar partes del todo.', recomendadoPara: ['estado', 'severidad'] },
        { label: 'Barras H. Apiladas', value: 'stackedBarHorizontal', icon: 'pi pi-align-justify', descripcion: 'Barras horizontales apiladas. Ideal para muchas categorías con composición.', recomendadoPara: ['responsable', 'estado'] },
        { label: 'Barras Agrupadas', value: 'groupedBar', icon: 'pi pi-th-large', descripcion: 'Compara múltiples series lado a lado. Ideal para comparar grupos.', recomendadoPara: ['tipoEntidad', 'estado'] },
        { label: 'Barras + Línea', value: 'combo', icon: 'pi pi-chart-bar', descripcion: 'Combina barras y líneas para mostrar diferentes métricas en una sola gráfica.', recomendadoPara: ['fecha', 'estado'] }
      ]
    },
    {
      label: 'Líneas',
      value: 'lineas',
      items: [
        { label: 'Línea', value: 'line', icon: 'pi pi-chart-line', descripcion: 'Muestra tendencias en el tiempo. Ideal para datos secuenciales.', recomendadoPara: ['fecha'] },
        { label: 'Área', value: 'area', icon: 'pi pi-chart-line', descripcion: 'Línea con relleno que enfatiza el volumen. Buena para mostrar acumulados.', recomendadoPara: ['fecha'] },
        { label: 'Áreas Apiladas', value: 'stackedArea', icon: 'pi pi-chart-line', descripcion: 'Múltiples series apiladas. Muestra contribución de cada categoría al total.', recomendadoPara: ['fecha', 'estado'] },
        { label: 'Spline', value: 'spline', icon: 'pi pi-wave-pulse', descripcion: 'Línea suavizada para tendencias más fluidas. Estéticamente atractiva.', recomendadoPara: ['fecha'] },
        { label: 'Step Line', value: 'stepline', icon: 'pi pi-minus', descripcion: 'Muestra cambios discretos. Útil para datos que cambian en puntos específicos.', recomendadoPara: ['fecha', 'estado'] }
      ]
    },
    {
      label: 'Avanzadas',
      value: 'avanzadas',
      items: [
        { label: 'Radar', value: 'radar', icon: 'pi pi-stop', descripcion: 'Compara múltiples variables en un punto. Ideal para perfiles de riesgo.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Dispersión', value: 'scatter', icon: 'pi pi-circle-fill', descripcion: 'Muestra correlación entre dos variables numéricas.', recomendadoPara: ['probabilidad', 'impacto'] },
        { label: 'Burbujas', value: 'bubble', icon: 'pi pi-circle', descripcion: 'Scatter con tamaño variable. Muestra 3 dimensiones de datos.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Heatmap', value: 'heatmap', icon: 'pi pi-table', descripcion: 'Matriz de colores para identificar patrones. Útil para matrices de riesgo.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Treemap', value: 'treemap', icon: 'pi pi-objects-column', descripcion: 'Representa jerarquías con rectángulos proporcionales.', recomendadoPara: ['contenedorNombre', 'responsable'] },
        { label: 'Sunburst', value: 'sunburst', icon: 'pi pi-sun', descripcion: 'Gráfica radial jerárquica. Muestra relaciones padre-hijo en anillos concéntricos.', recomendadoPara: ['tipoEntidad', 'estado', 'severidad'] }
      ]
    },
    {
      label: 'Flujo/Embudo',
      value: 'flujo',
      items: [
        { label: 'Embudo', value: 'funnel', icon: 'pi pi-filter', descripcion: 'Visualiza procesos secuenciales con reducción. Ideal para flujos de trabajo.', recomendadoPara: ['estado'] },
        { label: 'Pirámide', value: 'pyramid', icon: 'pi pi-caret-up', descripcion: 'Similar al embudo pero invertido. Muestra jerarquías de importancia.', recomendadoPara: ['severidad', 'nivelRiesgo'] },
        { label: 'Sankey', value: 'sankey', icon: 'pi pi-share-alt', descripcion: 'Diagrama de flujo que muestra transferencias entre categorías. Ideal para análisis de propagación.', recomendadoPara: ['estado', 'tipoEntidad', 'responsable'] },
        { label: 'Cascada', value: 'waterfall', icon: 'pi pi-chart-bar', descripcion: 'Muestra efecto acumulativo de valores positivos/negativos. Ideal para análisis de impacto.', recomendadoPara: ['impacto', 'nivelRiesgo'] }
      ]
    },
    {
      label: 'Estadísticas',
      value: 'estadisticas',
      items: [
        { label: 'Boxplot', value: 'boxplot', icon: 'pi pi-minus', descripcion: 'Diagrama de caja y bigotes. Muestra distribución estadística de datos.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Bullet', value: 'bullet', icon: 'pi pi-minus', descripcion: 'Muestra progreso hacia un objetivo. Ideal para comparar rendimiento vs meta.', recomendadoPara: ['nivelRiesgo', 'impacto'] },
        { label: 'Dumbbell', value: 'dumbbell', icon: 'pi pi-arrows-h', descripcion: 'Compara dos valores por categoría. Ideal para mostrar cambios antes/después.', recomendadoPara: ['estado', 'probabilidad', 'impacto'] },
        { label: 'Regresión', value: 'regression', icon: 'pi pi-chart-line', descripcion: 'Línea de tendencia con análisis de regresión. Muestra correlación estadística.', recomendadoPara: ['probabilidad', 'impacto'] }
      ]
    },
    {
      label: 'Matrices',
      value: 'matrices',
      items: [
        { label: 'Mapa de Riesgos', value: 'riskMatrix', icon: 'pi pi-th-large', descripcion: 'Matriz de probabilidad vs impacto. Visualización estándar de riesgos.', recomendadoPara: ['probabilidad', 'impacto'] },
        { label: 'Matriz Correlación', value: 'correlationMatrix', icon: 'pi pi-table', descripcion: 'Muestra correlaciones entre múltiples variables. Identifica relaciones.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] }
      ]
    },
    {
      label: 'IA/Predictivo',
      value: 'ia-predictivo',
      items: [
        { label: 'Tendencias IA', value: 'trendline', icon: 'pi pi-sparkles', descripcion: 'Línea de tendencia con análisis predictivo basado en IA. Muestra proyecciones futuras.', recomendadoPara: ['fecha', 'nivelRiesgo'] },
        { label: 'Pronóstico', value: 'forecast', icon: 'pi pi-clock', descripcion: 'Gráfica con predicción de valores futuros usando análisis de tendencias históricas.', recomendadoPara: ['fecha'] },
        { label: 'Rango de Área', value: 'rangeArea', icon: 'pi pi-chart-line', descripcion: 'Muestra un rango de valores con zona de confianza. Ideal para intervalos de predicción.', recomendadoPara: ['fecha', 'probabilidad', 'impacto'] }
      ]
    }
  ];

  // Lista plana de tipos para el select
  tiposGraficaFlat = computed(() => {
    const items: { label: string; value: TipoGraficaAvanzada; group: string }[] = [];
    for (const grupo of this.tiposGraficaOpciones) {
      for (const item of grupo.items) {
        items.push({ label: item.label, value: item.value, group: grupo.label });
      }
    }
    return items;
  });

  // Método para cambiar campo y emitir evento
  onCampoChange(campo: string): void {
    this.campoEjeX.set(campo);
    this.campoSeleccionado.emit({ campo, tipo: 'ejeX' });
  }

  // Tipo de chart para Chart.js (usar tipo literal)
  chartType = computed<'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar'>(() => {
    const tipo = this.tipoGrafica();
    const typeMapping: Record<string, 'bar' | 'line' | 'scatter' | 'bubble' | 'pie' | 'doughnut' | 'polarArea' | 'radar'> = {
      'pie': 'pie', 'donut': 'doughnut', 'radialBar': 'doughnut', 'polarArea': 'polarArea', 'gauge': 'doughnut',
      'bar': 'bar', 'column': 'bar', 'stackedBar': 'bar', 'groupedBar': 'bar', 'stackedBarHorizontal': 'bar', 'combo': 'bar',
      'line': 'line', 'area': 'line', 'spline': 'line', 'stepline': 'line', 'stackedArea': 'line',
      'radar': 'radar', 'scatter': 'scatter', 'bubble': 'bubble',
      'funnel': 'bar', 'pyramid': 'bar', 'waterfall': 'bar',
      'trendline': 'line', 'forecast': 'line', 'rangeArea': 'line', 'regression': 'line',
      'dumbbell': 'bar', 'bullet': 'bar', 'boxplot': 'bar'
    };
    return typeMapping[tipo] || 'bar';
  });

  // Computed: Datos para Chart.js - Versión minimalista
  chartData = computed(() => {
    const datos = this.datosSignal();
    const tipo = this.tipoGrafica();
    // Fallback a paleta 'vibrant' si la seleccionada no existe
    const paleta = this.paletas[this.paletaSeleccionada()] || this.paletas['vibrant'];
    const isDark = this.tema() === 'dark';
    const comparacion = this.comparacionTemporal();

    // Validar que hay datos antes de procesar
    if (!datos || !datos.labels || !datos.series) {
      return { labels: [], datasets: [] };
    }

    // Función para generar datos de comparación (periodo anterior simulado)
    // Usa un seed basado en el valor para que sea consistente entre renders
    const generarDatosComparacion = (valores: number[]): number[] => {
      // Simular datos del periodo anterior con variación consistente
      return valores.map((v, i) => {
        // Usar el índice y valor como seed para variación consistente
        const seed = (v * 7 + i * 13) % 100;
        const variacion = 0.7 + (seed / 100) * 0.5; // Entre 0.7 y 1.2
        return Math.round(v * variacion);
      });
    };

    if (this.isNonAxisChart(tipo)) {
      // Para gráficas circulares - minimalistas
      let values: number[] = [];
      if (Array.isArray(datos.series) && typeof datos.series[0] === 'number') {
        values = datos.series as number[];
      } else if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
        values = (datos.series as { name: string; data: number[] }[])[0].data;
      }

      const datasets: any[] = [{
        label: comparacion.habilitada ? comparacion.periodo1.label : undefined,
        data: values,
        backgroundColor: paleta.slice(0, values.length).map(c => this.hexToRgba(c, 0.85)),
        borderColor: isDark ? '#1a1a2e' : '#ffffff',
        borderWidth: 1,
        hoverOffset: 4,
        hoverBorderWidth: 2
      }];

      // Agregar dataset de comparación si está habilitada (ambos modos)
      // Para gráficas circulares, overlay y sideBySide funcionan igual (anillos concéntricos en donut)
      if (comparacion.habilitada) {
        const valoresComparacion = generarDatosComparacion(values);
        datasets.push({
          label: comparacion.periodo2.label,
          data: valoresComparacion,
          backgroundColor: paleta.slice(0, values.length).map(c => this.hexToRgba(c, 0.45)),
          borderColor: isDark ? '#1a1a2e' : '#ffffff',
          borderWidth: 1,
          hoverOffset: 4,
          hoverBorderWidth: 2,
          // Para overlay en donut, hacer el segundo anillo más pequeño
          weight: comparacion.modo === 'overlay' ? 0.7 : 1
        });
      }

      return {
        labels: datos.labels,
        datasets
      };
    }

    // Para gráficas de ejes - minimalistas
    let datasets: any[] = [];
    const isLineType = ['line', 'area', 'spline', 'stepline'].includes(tipo);
    const isRadar = tipo === 'radar';
    const isScatter = tipo === 'scatter';
    const isBubble = tipo === 'bubble';

    if (Array.isArray(datos.series) && datos.series.length > 0) {
      if (typeof datos.series[0] === 'number') {
        // Para scatter, convertir datos a formato x,y
        const scatterFormattedData = isScatter || isBubble
          ? (datos.series as number[]).map((y, x) => ({ x, y, r: isBubble ? Math.max(5, y / 10) : undefined }))
          : datos.series as number[];

        datasets = [{
          label: this.titulo,
          data: scatterFormattedData,
          backgroundColor: isScatter || isBubble
            ? this.hexToRgba(paleta[0], 0.7) // Scatter/Bubble: puntos con buen contraste
            : isRadar
              ? this.hexToRgba(paleta[0], 0.35)
              : isLineType
                ? this.hexToRgba(paleta[0], 0.1)
                : paleta.map(c => this.hexToRgba(c, 0.8)),
          borderColor: isScatter || isBubble
            ? paleta[0] // Scatter/Bubble: borde del color de la paleta
            : isRadar || isLineType ? paleta[0] : 'transparent',
          borderWidth: isScatter || isBubble ? 2 : isRadar ? 2 : isLineType ? 2 : 0,
          fill: tipo === 'area' || isRadar,
          tension: tipo === 'spline' ? 0.4 : 0.1,
          stepped: tipo === 'stepline' ? 'before' : false,
          pointRadius: isScatter ? 8 : isBubble ? undefined : isRadar ? 4 : 0,
          pointHoverRadius: isScatter ? 10 : isBubble ? undefined : isRadar ? 6 : isLineType ? 4 : 0,
          pointBackgroundColor: paleta[0],
          pointBorderColor: isDark ? '#18181b' : '#fff',
          pointBorderWidth: 2,
          pointStyle: isScatter ? 'circle' : undefined
        }];
      } else {
        datasets = (datos.series as { name: string; data: number[] }[]).map((serie, index) => {
          // Para scatter, convertir datos a formato x,y
          const scatterFormattedData = isScatter || isBubble
            ? serie.data.map((y, x) => ({ x, y, r: isBubble ? Math.max(5, y / 10) : undefined }))
            : serie.data;

          return {
            label: serie.name,
            data: scatterFormattedData,
            backgroundColor: isScatter || isBubble
              ? this.hexToRgba(paleta[index % paleta.length], 0.7) // Scatter/Bubble: puntos visibles
              : isRadar
                ? this.hexToRgba(paleta[index % paleta.length], 0.35)
                : isLineType
                  ? this.hexToRgba(paleta[index % paleta.length], 0.1)
                  : this.hexToRgba(paleta[index % paleta.length], 0.8),
            borderColor: isScatter || isBubble
              ? paleta[index % paleta.length]
              : isRadar || isLineType ? paleta[index % paleta.length] : 'transparent',
            borderWidth: isScatter || isBubble ? 2 : isRadar ? 2 : isLineType ? 2 : 0,
            fill: tipo === 'area' || isRadar,
            tension: tipo === 'spline' ? 0.4 : 0.1,
            stepped: tipo === 'stepline' ? 'before' : false,
            pointRadius: isScatter ? 8 : isBubble ? undefined : isRadar ? 4 : 0,
            pointHoverRadius: isScatter ? 10 : isBubble ? undefined : isRadar ? 6 : 4,
            pointBackgroundColor: paleta[index % paleta.length],
            pointBorderColor: isDark ? '#18181b' : '#fff',
            pointBorderWidth: 2,
            pointStyle: isScatter ? 'circle' : undefined
          };
        });
      }
    }

    // Agregar dataset de comparación temporal si está habilitada (para gráficas de ejes)
    if (comparacion.habilitada && datasets.length > 0) {
      const isOverlay = comparacion.modo === 'overlay';
      const isBar = ['bar', 'column', 'stackedBar', 'groupedBar'].includes(tipo);

      const datasetsComparacion = datasets.map((ds, dsIndex) => {
        const valoresOriginales = Array.isArray(ds.data) ? ds.data : [];
        const valoresComparacion = valoresOriginales.map((v: any, i: number) => {
          if (typeof v === 'number') {
            // Usar seed consistente basado en valor e índice
            const seed = (v * 7 + i * 13 + dsIndex * 17) % 100;
            const variacion = 0.7 + (seed / 100) * 0.5;
            return Math.round(v * variacion);
          }
          // Para scatter/bubble con formato {x, y}
          if (v && typeof v === 'object' && 'y' in v) {
            const seed = (v.y * 7 + i * 13 + dsIndex * 17) % 100;
            const variacion = 0.7 + (seed / 100) * 0.5;
            return { ...v, y: Math.round(v.y * variacion) };
          }
          return v;
        });

        // Color de comparación depende del modo
        const colorPrincipal = paleta[dsIndex % paleta.length];
        const colorAlternativo = paleta[(dsIndex + 2) % paleta.length]; // Color contrastante

        // Overlay: mismo color pero más transparente
        // Side by side: color diferente y más visible
        const colorComparacion = isOverlay ? colorPrincipal : colorAlternativo;
        const opacidadBg = isOverlay ? 0.25 : 0.7;
        const opacidadBorder = isOverlay ? 0.5 : 1;

        return {
          ...ds,
          label: `${ds.label || 'Serie'} (${comparacion.periodo2.label})`,
          data: valoresComparacion,
          backgroundColor: isLineType || isRadar
            ? this.hexToRgba(colorComparacion, isOverlay ? 0.1 : 0.2)
            : this.hexToRgba(colorComparacion, opacidadBg),
          borderColor: this.hexToRgba(colorComparacion, opacidadBorder),
          borderDash: isLineType ? [5, 5] : undefined,
          borderWidth: isLineType || isRadar ? 2 : (isBar ? 1 : 0),
          order: isOverlay ? 1 : 0, // En overlay, mostrar detrás
          pointBackgroundColor: colorComparacion,
          pointRadius: isLineType ? 3 : (ds.pointRadius || 0),
          // Para barras en modo overlay, usar patrón diferente
          ...(isBar && isOverlay ? {
            borderWidth: 2,
            borderColor: colorPrincipal
          } : {})
        };
      });

      // Actualizar labels de datasets originales
      datasets.forEach((ds, index) => {
        ds.label = `${ds.label || 'Serie'} (${comparacion.periodo1.label})`;
        ds.order = isOverlay ? 0 : 0; // Mantener al frente en overlay
      });

      // Agregar datasets de comparación
      datasets.push(...datasetsComparacion);
    }

    return {
      labels: datos.labels,
      datasets
    };
  });

  // Computed: Opciones para Chart.js - Versión minimalista y responsiva
  chartOptions = computed(() => {
    const tipo = this.tipoGrafica();
    const isDark = this.tema() === 'dark';
    const isWidget = this.modoWidget;
    const comparacionActiva = this.comparacionTemporal().habilitada;

    // Usar CSS tokens del sistema de diseño
    const textColor = this.getCssToken('textColor', '#334155', '#fafafa');
    const textColorSecondary = this.getCssToken('textColorSecondary', '#64748b', '#a1a1aa');
    const surfaceBorder = this.getCssToken('surfaceBorder', '#e2e8f0', '#27272a');
    const surfaceCard = this.getCssToken('surfaceCard', '#ffffff', '#18181b');

    const baseOptions: any = {
      // Responsividad
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,

      // Layout minimalista
      layout: {
        padding: isWidget ? 4 : 8
      },

      plugins: {
        // Leyenda minimalista - usando CSS tokens
        // Mostrar leyenda siempre que haya comparación temporal activa
        legend: {
          display: comparacionActiva || (this.mostrarLeyenda() && !isWidget),
          position: 'bottom' as const,
          labels: {
            color: textColorSecondary,
            font: { size: isWidget ? 9 : 10, family: 'Inter, sans-serif' },
            padding: isWidget ? 4 : 6,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 6,
            boxHeight: 6
          }
        },

        // Tooltip - usando CSS tokens
        tooltip: {
          enabled: true,
          backgroundColor: isDark ? 'rgba(24,24,27,0.95)' : 'rgba(255,255,255,0.95)',
          titleColor: textColor,
          bodyColor: textColorSecondary,
          borderColor: surfaceBorder,
          borderWidth: 1,
          cornerRadius: 4,
          padding: 8,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          titleFont: { size: 11, weight: '600' as const },
          bodyFont: { size: 10 },
          callbacks: {
            label: (context: any) => {
              const value = context.parsed?.y ?? context.parsed ?? context.raw;
              return ` ${context.label || ''}: ${value?.toLocaleString('es-MX') || value}`;
            }
          }
        },

        // Sin datalabels para look limpio
        datalabels: { display: false }
      },

      // Animaciones suaves tipo "disolver"
      animation: this.animaciones() ? {
        duration: 1000,
        easing: 'easeInOutQuad' as const,
        delay: (context: any) => {
          // Delay escalonado suave para efecto de aparición gradual
          if (context.type === 'data') {
            return context.dataIndex * 30;
          }
          return 0;
        },
        // Animaciones específicas - todas con easing suave
        x: {
          type: 'number' as const,
          easing: 'easeOutSine' as const,
          duration: 800,
          from: (ctx: any) => ctx.chart?.scales?.x?.getPixelForValue(0) || 0
        },
        y: {
          type: 'number' as const,
          easing: 'easeOutSine' as const,
          duration: 900
        },
        radius: {
          type: 'number' as const,
          easing: 'easeOutSine' as const,
          duration: 800,
          from: 0
        }
      } : {
        duration: 0
      },

      // Animaciones de transición suaves
      transitions: {
        active: {
          animation: {
            duration: 300,
            easing: 'easeInOutQuad' as const
          }
        },
        resize: {
          animation: {
            duration: 500,
            easing: 'easeInOutQuad' as const
          }
        },
        show: {
          animations: {
            colors: { from: 'transparent', duration: 600, easing: 'easeOutSine' as const },
            visible: { type: 'boolean' as const, duration: 0 }
          }
        },
        hide: {
          animations: {
            colors: { to: 'transparent', duration: 400, easing: 'easeInSine' as const },
            visible: { type: 'boolean' as const, easing: 'linear', fn: (v: number) => v | 0 }
          }
        }
      },

      // Interacción
      interaction: {
        intersect: false,
        mode: 'index' as const
      }
    };

    // Colores de grid usando CSS tokens
    const gridColor = isDark ? 'rgba(161,161,170,0.1)' : 'rgba(100,116,139,0.1)';

    // Configuración específica según el tipo
    if (tipo === 'radar') {
      // Configuración especial para radar - usar scales.r en lugar de x/y
      baseOptions.plugins.legend.display = this.mostrarLeyenda();
      baseOptions.plugins.legend.position = 'bottom';
      baseOptions.scales = {
        r: {
          angleLines: {
            display: true,
            color: gridColor
          },
          grid: {
            color: gridColor,
            circular: true
          },
          pointLabels: {
            // Labels en los vértices del radar - crítico para dark mode
            color: textColor,
            font: { size: 11, family: 'Inter, sans-serif' }
          },
          ticks: {
            // Valores en el eje radial
            color: textColorSecondary,
            backdropColor: 'transparent',
            font: { size: 9 }
          },
          beginAtZero: true
        }
      };
    } else if (this.isNonAxisChart(tipo)) {
      // Gráficas circulares - minimalistas
      baseOptions.cutout = tipo === 'donut' ? '65%' : tipo === 'radialBar' ? '75%' : '0%';
      baseOptions.plugins.legend.display = this.mostrarLeyenda();
      baseOptions.plugins.legend.position = 'right';
      baseOptions.plugins.legend.labels.padding = 4;
    } else {
      // Gráficas con ejes - minimalistas (usando CSS tokens)
      baseOptions.indexAxis = tipo === 'bar' ? 'y' : 'x';
      baseOptions.scales = {
        x: {
          display: true,
          border: { display: false },
          grid: {
            display: tipo !== 'bar',
            color: gridColor,
            drawTicks: false
          },
          ticks: {
            color: textColorSecondary,
            font: { size: 9 },
            padding: 4,
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: isWidget ? 6 : 10
          },
          stacked: tipo === 'stackedBar'
        },
        y: {
          display: true,
          border: { display: false },
          grid: {
            display: tipo === 'bar',
            color: gridColor,
            drawTicks: false
          },
          ticks: {
            color: textColorSecondary,
            font: { size: 9 },
            padding: 4,
            maxTicksLimit: isWidget ? 5 : 8,
            callback: (value: number) => {
              if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
              return value;
            }
          },
          stacked: tipo === 'stackedBar',
          beginAtZero: true
        }
      };

      // Barras con bordes redondeados sutiles
      if (['bar', 'column', 'stackedBar', 'groupedBar'].includes(tipo)) {
        baseOptions.borderRadius = 3;
        // Ajustar el espacio de las barras según el modo de comparación
        if (comparacionActiva) {
          // Con comparación, hacer más espacio para las barras lado a lado
          baseOptions.barPercentage = 0.9;
          baseOptions.categoryPercentage = 0.9;
        } else {
          baseOptions.barPercentage = 0.7;
          baseOptions.categoryPercentage = 0.85;
        }
      }

      // Ajustes específicos para modo de comparación
      if (comparacionActiva) {
        // Forzar mostrar leyenda cuando hay comparación
        baseOptions.plugins.legend.display = true;
        baseOptions.plugins.legend.position = 'top';
      }
    }

    return baseOptions;
  });

  // ==================== APEXCHARTS OPTIONS ====================
  // Computed: Opciones de ApexCharts para gráficas avanzadas (Funnel, TreeMap, RadialBar, etc.)
  apexChartOptions = computed<ApexChartOptions>(() => {
    const tipo = this.tipoGrafica();
    const datos = this.datosSignal();
    const paleta = this.paletas[this.paletaSeleccionada()] || this.paletas['vibrant'];
    const isDark = this.tema() === 'dark';
    const comparacion = this.comparacionTemporal();

    // CSS tokens del sistema de diseño para ApexCharts
    const textColor = this.getCssToken('textColor', '#334155', '#fafafa');
    const textColorSecondary = this.getCssToken('textColorSecondary', '#64748b', '#a1a1aa');

    // Validar datos
    if (!datos || !datos.labels || !datos.series) {
      return {
        series: [],
        chart: { type: 'bar', height: '100%' }
      };
    }

    // Función para generar datos de comparación (periodo anterior simulado)
    const generarDatosComparacion = (valores: number[]): number[] => {
      return valores.map((v, i) => {
        const seed = (v * 7 + i * 13) % 100;
        const variacion = 0.7 + (seed / 100) * 0.5;
        return Math.round(v * variacion);
      });
    };

    // Obtener valores numéricos
    let values: number[] = [];
    if (Array.isArray(datos.series) && typeof datos.series[0] === 'number') {
      values = datos.series as number[];
    } else if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
      values = (datos.series as { name: string; data: number[] }[])[0].data;
    }

    // Ordenar datos para funnel (mayor a menor)
    let sortedData = datos.labels.map((label, i) => ({
      label,
      value: values[i] || 0
    }));

    if (tipo === 'funnel' || tipo === 'pyramid') {
      sortedData = sortedData.sort((a, b) => b.value - a.value);
    }

    const baseChart: ApexChart = {
      type: this.getApexChartType(tipo) as any,
      height: '100%',
      toolbar: { show: false }, // Desactivar toolbar - usamos nuestros propios botones de exportar
      animations: {
        enabled: this.animaciones(),
        speed: 1000,
        animateGradually: {
          enabled: true,
          delay: 80
        },
        dynamicAnimation: {
          enabled: true,
          speed: 600
        }
      },
      background: 'transparent',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 2,
        left: 2,
        blur: 4,
        opacity: isDark ? 0.3 : 0.15
      },
      events: {
        dataPointSelection: (_event: any, _chartContext: any, config: any) => {
          const categoria = sortedData[config.dataPointIndex]?.label || datos.labels[config.dataPointIndex];
          const valor = sortedData[config.dataPointIndex]?.value || values[config.dataPointIndex];
          this.handleDrillDown(categoria, valor);
        },
        dataPointMouseEnter: (_event: any, _chartContext: any, config: any) => {
          const element = document.querySelector(`[data-index="${config.dataPointIndex}"]`);
          if (element) {
            (element as HTMLElement).style.transform = 'scale(1.05)';
            (element as HTMLElement).style.transition = 'transform 0.2s ease';
          }
        },
        dataPointMouseLeave: (_event: any, _chartContext: any, config: any) => {
          const element = document.querySelector(`[data-index="${config.dataPointIndex}"]`);
          if (element) {
            (element as HTMLElement).style.transform = 'scale(1)';
          }
        }
      }
    };

    const baseOptions: ApexChartOptions = {
      series: [],
      chart: baseChart,
      colors: paleta,
      theme: { mode: isDark ? 'dark' : 'light' },
      legend: {
        show: this.mostrarLeyenda(),
        position: 'bottom',
        fontFamily: 'Inter, sans-serif',
        fontSize: '11px',
        labels: { colors: textColorSecondary }
      },
      dataLabels: {
        enabled: this.mostrarDataLabels(),
        style: { fontSize: '11px', fontFamily: 'Inter, sans-serif', colors: [textColor] }
      },
      tooltip: {
        enabled: true,
        theme: isDark ? 'dark' : 'light',
        style: { fontSize: '11px', fontFamily: 'Inter, sans-serif' },
        // Colores explícitos para asegurar visibilidad en dark mode
        fillSeriesColor: false,
        marker: { show: true },
        x: { show: true },
        y: {
          formatter: (val: number) => val?.toLocaleString() || '0',
          title: { formatter: (seriesName: string) => seriesName }
        },
        cssClass: isDark ? 'apexcharts-tooltip-dark' : 'apexcharts-tooltip-light'
      },
      responsive: [{
        breakpoint: 480,
        options: { legend: { position: 'bottom' } }
      }]
    };

    // Configuración específica por tipo
    switch (tipo) {
      case 'funnel':
        // Formato correcto para ApexCharts funnel: series con array de objetos data
        baseOptions.series = [{
          name: 'Funnel',
          data: sortedData.map(d => d.value)
        }];
        baseOptions.chart = { ...baseChart, type: 'bar', height: '100%', stacked: true };
        baseOptions.plotOptions = {
          bar: {
            horizontal: true,
            barHeight: '80%',
            isFunnel: true,
            borderRadius: 0,
            distributed: true
          }
        };
        baseOptions.colors = paleta;
        baseOptions.dataLabels = {
          enabled: true,
          formatter: (val: number, opts: any) => `${sortedData[opts.dataPointIndex]?.label || ''}: ${val}`,
          dropShadow: { enabled: false },
          style: { colors: ['#fff'] }
        };
        baseOptions.xaxis = { categories: sortedData.map(d => d.label) };
        baseOptions.legend = { show: false };
        break;

      case 'pyramid':
        // Formato correcto para ApexCharts pyramid (funnel invertido)
        const pyramidData = [...sortedData].sort((a, b) => a.value - b.value);
        baseOptions.series = [{
          name: 'Pyramid',
          data: pyramidData.map(d => d.value)
        }];
        baseOptions.chart = { ...baseChart, type: 'bar', height: '100%', stacked: true };
        baseOptions.plotOptions = {
          bar: {
            horizontal: true,
            barHeight: '80%',
            isFunnel: true,
            borderRadius: 0,
            distributed: true
          }
        };
        baseOptions.colors = paleta;
        baseOptions.dataLabels = {
          enabled: true,
          formatter: (val: number, opts: any) => `${pyramidData[opts.dataPointIndex]?.label || ''}: ${val}`,
          dropShadow: { enabled: false },
          style: { colors: ['#fff'] }
        };
        baseOptions.xaxis = { categories: pyramidData.map(d => d.label) };
        baseOptions.legend = { show: false };
        break;

      case 'radialBar':
        // Para radialBar, convertir valores a porcentajes (0-100)
        const maxValue = Math.max(...values);
        const percentages = values.map(v => Math.round((v / maxValue) * 100));
        baseOptions.series = percentages;
        baseOptions.labels = datos.labels;
        baseOptions.chart = { ...baseChart, type: 'radialBar', height: '100%' };
        baseOptions.plotOptions = {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: { margin: 5, size: '30%', background: 'transparent' },
            dataLabels: {
              name: { show: true, fontSize: '12px' },
              value: { show: true, fontSize: '14px', formatter: (val: number) => `${val}%` }
            },
            barLabels: {
              enabled: true,
              useSeriesColors: true,
              offsetX: -8,
              fontSize: '11px',
              formatter: (seriesName: string, opts: any) => `${seriesName}: ${values[opts.seriesIndex]}`
            }
          }
        };
        break;

      case 'treemap':
        baseOptions.series = [{
          data: datos.labels.map((label, i) => ({
            x: label,
            y: values[i] || 0
          }))
        }];
        baseOptions.chart = { ...baseChart, type: 'treemap', height: '100%' };
        baseOptions.plotOptions = {
          treemap: {
            distributed: true,
            enableShades: true,
            shadeIntensity: 0.5,
            colorScale: {
              ranges: paleta.slice(0, Math.min(datos.labels.length, paleta.length)).map((color, i) => ({
                from: i * (Math.max(...values) / paleta.length),
                to: (i + 1) * (Math.max(...values) / paleta.length),
                color
              }))
            }
          }
        };
        baseOptions.dataLabels = {
          enabled: true,
          style: { fontSize: '12px' },
          formatter: (text: string, op: any) => `${text}: ${op.value}`,
          offsetY: -4
        };
        break;

      case 'heatmap':
        // Crear datos de heatmap simulados
        baseOptions.series = datos.labels.map((label, i) => ({
          name: label,
          data: [{ x: 'Valor', y: values[i] || 0 }]
        })) as any;
        baseOptions.chart = { ...baseChart, type: 'heatmap', height: '100%' };
        baseOptions.plotOptions = {
          heatmap: {
            shadeIntensity: 0.5,
            colorScale: {
              ranges: [
                { from: 0, to: 25, color: paleta[4] || '#22c55e', name: 'Bajo' },
                { from: 26, to: 50, color: paleta[2] || '#eab308', name: 'Medio' },
                { from: 51, to: 75, color: paleta[1] || '#f97316', name: 'Alto' },
                { from: 76, to: 100, color: paleta[0] || '#ef4444', name: 'Crítico' }
              ]
            }
          }
        };
        break;

      case 'bubble':
        // Gráfico de burbujas - 3 dimensiones (x, y, tamaño)
        baseOptions.series = [{
          name: this.titulo,
          data: datos.labels.map((label, i) => ({
            x: i + 1,
            y: values[i] || 0,
            z: Math.max(10, values[i] * 2) // Tamaño de burbuja proporcional
          }))
        }];
        baseOptions.chart = { ...baseChart, type: 'bubble', height: '100%' };
        baseOptions.xaxis = {
          tickAmount: datos.labels.length,
          labels: {
            formatter: (val: number) => datos.labels[Math.round(val) - 1] || ''
          }
        };
        baseOptions.yaxis = { title: { text: 'Valor' } };
        baseOptions.fill = { opacity: 0.8 };
        baseOptions.plotOptions = {
          bubble: {
            minBubbleRadius: 10,
            maxBubbleRadius: 50
          }
        };
        break;

      case 'waterfall':
        // Gráfico de cascada (waterfall)
        const waterfallData = sortedData.map((d, i) => ({
          x: d.label,
          y: i === 0 ? d.value : (i === sortedData.length - 1 ? d.value : d.value - (sortedData[i-1]?.value || 0))
        }));
        baseOptions.series = [{ name: 'Impacto', data: waterfallData }];
        baseOptions.chart = { ...baseChart, type: 'bar', height: '100%' };
        baseOptions.plotOptions = {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            colors: {
              ranges: [
                { from: -1000000, to: 0, color: paleta[0] || '#ef4444' },
                { from: 0, to: 1000000, color: paleta[4] || '#22c55e' }
              ]
            }
          }
        };
        baseOptions.dataLabels = {
          enabled: true,
          formatter: (val: number) => val > 0 ? `+${val}` : `${val}`
        };
        baseOptions.xaxis = { categories: sortedData.map(d => d.label) };
        break;

      case 'gauge':
        // Velocímetro / Gauge
        const gaugeValue = values.length > 0 ? Math.round((values[0] / Math.max(...values)) * 100) : 0;
        baseOptions.series = [gaugeValue];
        baseOptions.labels = [datos.labels[0] || 'Valor'];
        baseOptions.chart = { ...baseChart, type: 'radialBar', height: '100%' };
        baseOptions.plotOptions = {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: { size: '70%' },
            track: {
              background: isDark ? '#333' : '#e7e7e7',
              strokeWidth: '100%'
            },
            dataLabels: {
              name: { offsetY: -10, color: isDark ? '#fff' : '#333', fontSize: '14px' },
              value: {
                offsetY: 5,
                color: isDark ? '#fff' : '#333',
                fontSize: '28px',
                formatter: () => `${values[0] || 0}`
              }
            }
          }
        };
        baseOptions.fill = {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            gradientToColors: [paleta[0]],
            stops: [0, 100]
          }
        };
        break;

      case 'stackedBarHorizontal':
        // Barras horizontales apiladas
        if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
          baseOptions.series = datos.series as any;
        } else {
          baseOptions.series = [{ name: this.titulo, data: values }];
        }
        baseOptions.chart = { ...baseChart, type: 'bar', height: '100%', stacked: true };
        baseOptions.plotOptions = {
          bar: {
            horizontal: true,
            barHeight: '70%',
            borderRadius: 4
          }
        };
        baseOptions.xaxis = { categories: datos.labels };
        break;

      case 'stackedArea':
        // Áreas apiladas
        if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
          baseOptions.series = datos.series as any;
        } else {
          baseOptions.series = [{ name: this.titulo, data: values }];
        }
        baseOptions.chart = { ...baseChart, type: 'area', height: '100%', stacked: true };
        baseOptions.stroke = { curve: 'smooth', width: 2 };
        baseOptions.fill = { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } };
        baseOptions.xaxis = { categories: datos.labels };
        break;

      case 'combo':
        // Gráfica combinada barras + línea
        baseOptions.series = [
          { name: 'Barras', type: 'column', data: values },
          { name: 'Tendencia', type: 'line', data: values.map((v, i, arr) => {
            // Calcular media móvil simple
            const start = Math.max(0, i - 2);
            const slice = arr.slice(start, i + 1);
            return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
          })}
        ];
        baseOptions.chart = { ...baseChart, type: 'line', height: '100%' };
        baseOptions.stroke = { width: [0, 3], curve: 'smooth' };
        baseOptions.plotOptions = { bar: { columnWidth: '60%', borderRadius: 4 } };
        baseOptions.xaxis = { categories: datos.labels };
        baseOptions.yaxis = { title: { text: 'Valor' } };
        break;

      case 'boxplot':
        // Diagrama de caja y bigotes
        const sortedValues = [...values].sort((a, b) => a - b);
        const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)] || 0;
        const median = sortedValues[Math.floor(sortedValues.length * 0.5)] || 0;
        const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)] || 0;
        const min = Math.min(...values);
        const max = Math.max(...values);
        baseOptions.series = [{
          type: 'boxPlot',
          data: [{ x: this.titulo, y: [min, q1, median, q3, max] }]
        }];
        baseOptions.chart = { ...baseChart, type: 'boxPlot', height: '100%' };
        baseOptions.plotOptions = {
          boxPlot: {
            colors: {
              upper: paleta[0] || '#8b5cf6',
              lower: paleta[2] || '#22c55e'
            }
          }
        };
        break;

      case 'bullet':
        // Gráfica bullet
        const bulletTarget = Math.max(...values) * 0.8;
        baseOptions.series = [{
          data: datos.labels.map((label, i) => ({
            x: label,
            y: values[i] || 0,
            goals: [{ name: 'Meta', value: bulletTarget, strokeWidth: 3, strokeColor: paleta[0] }]
          }))
        }];
        baseOptions.chart = { ...baseChart, type: 'bar', height: '100%' };
        baseOptions.plotOptions = {
          bar: {
            horizontal: true,
            barHeight: '50%',
            borderRadius: 4
          }
        };
        baseOptions.colors = [paleta[2] || '#22c55e'];
        break;

      case 'dumbbell':
        // Gráfica dumbbell (rangeBar)
        baseOptions.series = [{
          data: datos.labels.map((label, i) => ({
            x: label,
            y: [Math.min(values[i] || 0, (values[i] || 0) * 0.5), values[i] || 0]
          }))
        }];
        baseOptions.chart = { ...baseChart, type: 'rangeBar', height: '100%' };
        baseOptions.plotOptions = {
          bar: {
            horizontal: true,
            isDumbbell: true,
            dumbbellColors: [[paleta[0], paleta[2]]]
          }
        };
        break;

      case 'riskMatrix':
        // Mapa de riesgos (matriz probabilidad vs impacto)
        const riskData: { name: string; data: { x: string; y: number }[] }[] = [];
        const impactLabels = ['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'];
        const probLabels = ['Raro', 'Improbable', 'Posible', 'Probable', 'Casi Seguro'];

        probLabels.forEach((prob, i) => {
          riskData.push({
            name: prob,
            data: impactLabels.map((imp, j) => ({
              x: imp,
              y: (i + 1) * (j + 1) // Valor de riesgo = probabilidad * impacto
            }))
          });
        });
        baseOptions.series = riskData as any;
        baseOptions.chart = { ...baseChart, type: 'heatmap', height: '100%' };
        baseOptions.plotOptions = {
          heatmap: {
            shadeIntensity: 0.5,
            colorScale: {
              ranges: [
                { from: 1, to: 4, color: '#22c55e', name: 'Bajo' },
                { from: 5, to: 9, color: '#eab308', name: 'Medio' },
                { from: 10, to: 15, color: '#f97316', name: 'Alto' },
                { from: 16, to: 25, color: '#ef4444', name: 'Crítico' }
              ]
            }
          }
        };
        baseOptions.xaxis = { title: { text: 'Impacto' } };
        baseOptions.yaxis = { title: { text: 'Probabilidad' } } as any;
        break;

      case 'correlationMatrix':
        // Matriz de correlación
        const corrLabels = datos.labels.slice(0, 5); // Limitar a 5 variables
        const corrData: { name: string; data: { x: string; y: number }[] }[] = [];

        corrLabels.forEach((label1, i) => {
          corrData.push({
            name: label1,
            data: corrLabels.map((label2, j) => ({
              x: label2,
              y: i === j ? 1 : Math.round((Math.random() * 2 - 1) * 100) / 100 // Correlación simulada
            }))
          });
        });
        baseOptions.series = corrData as any;
        baseOptions.chart = { ...baseChart, type: 'heatmap', height: '100%' };
        baseOptions.plotOptions = {
          heatmap: {
            shadeIntensity: 0.5,
            colorScale: {
              ranges: [
                { from: -1, to: -0.5, color: '#ef4444', name: 'Negativa fuerte' },
                { from: -0.5, to: 0, color: '#fca5a5', name: 'Negativa débil' },
                { from: 0, to: 0.5, color: '#86efac', name: 'Positiva débil' },
                { from: 0.5, to: 1, color: '#22c55e', name: 'Positiva fuerte' }
              ]
            }
          }
        };
        baseOptions.dataLabels = {
          enabled: true,
          formatter: (val: number) => val.toFixed(2)
        };
        break;

      case 'sunburst':
        // Sunburst (usando treemap como fallback visual)
        baseOptions.series = [{
          data: datos.labels.map((label, i) => ({
            x: label,
            y: values[i] || 0
          }))
        }];
        baseOptions.chart = { ...baseChart, type: 'treemap', height: '100%' };
        baseOptions.plotOptions = {
          treemap: {
            distributed: true,
            enableShades: true,
            shadeIntensity: 0.5
          }
        };
        baseOptions.dataLabels = {
          enabled: true,
          style: { fontSize: '14px' },
          formatter: (text: string, op: any) => `${text}\n${op.value}`,
          offsetY: -4
        };
        break;

      case 'sankey':
        // Sankey (usando treemap jerárquico como fallback)
        const sankeyData = datos.labels.map((label, i) => ({
          x: label,
          y: values[i] || 0
        }));
        baseOptions.series = [{ data: sankeyData }];
        baseOptions.chart = { ...baseChart, type: 'treemap', height: '100%' };
        baseOptions.plotOptions = {
          treemap: {
            distributed: true,
            enableShades: true
          }
        };
        baseOptions.dataLabels = {
          enabled: true,
          style: { fontSize: '12px' },
          formatter: (text: string, op: any) => `${text}: ${op.value}`
        };
        break;

      case 'regression':
        // Línea con regresión - cálculo de mínimos cuadrados
        const regN = values.length;
        const regSumX = values.reduce((acc, _, i) => acc + i, 0);
        const regSumY = values.reduce((acc, v) => acc + v, 0);
        const regSumXY = values.reduce((acc, v, i) => acc + i * v, 0);
        const regSumX2 = values.reduce((acc, _, i) => acc + i * i, 0);
        const regDenom = regN * regSumX2 - regSumX * regSumX;
        const regSlope = regDenom !== 0 ? (regN * regSumXY - regSumX * regSumY) / regDenom : 0;
        const regIntercept = (regSumY - regSlope * regSumX) / regN;

        // Scatter para datos reales y línea para regresión
        const scatterData = values.map((v, i) => ({ x: datos.labels[i] || `${i}`, y: v }));
        const regressionLineData = values.map((_, i) => ({
          x: datos.labels[i] || `${i}`,
          y: Math.round(regSlope * i + regIntercept)
        }));

        baseOptions.series = [
          { name: 'Datos', type: 'scatter', data: scatterData },
          { name: 'Regresión', type: 'line', data: regressionLineData }
        ];
        baseOptions.chart = { ...baseChart, type: 'line', height: '100%' };
        baseOptions.stroke = { width: [0, 3], curve: 'straight' };
        baseOptions.markers = { size: [6, 0] };
        baseOptions.colors = [paleta[0], paleta[1] || paleta[0]];
        baseOptions.xaxis = {
          type: 'category',
          categories: datos.labels,
          labels: { style: { colors: textColor } }
        };
        baseOptions.yaxis = { labels: { style: { colors: textColor } } };
        baseOptions.dataLabels = { enabled: false };
        baseOptions.legend = {
          show: true,
          labels: { colors: textColor }
        };
        break;

      case 'rangeArea':
        // Área con rango (min-max)
        const rangeData = values.map((v, i) => ({
          x: datos.labels[i],
          y: [Math.max(0, v * 0.7), v * 1.3] // Rango simulado ±30%
        }));
        baseOptions.series = [{ name: 'Rango', data: rangeData }];
        baseOptions.chart = { ...baseChart, type: 'rangeArea', height: '100%' };
        baseOptions.stroke = { curve: 'smooth', width: 2 };
        baseOptions.fill = { opacity: 0.4 };
        baseOptions.xaxis = { categories: datos.labels };
        baseOptions.dataLabels = { enabled: false };
        break;

      case 'trendline':
        // Línea de tendencia con proyección IA
        const trendN = values.length;
        const trendSumX = values.reduce((acc, _, i) => acc + i, 0);
        const trendSumY = values.reduce((acc, v) => acc + v, 0);
        const trendSumXY = values.reduce((acc, v, i) => acc + i * v, 0);
        const trendSumX2 = values.reduce((acc, _, i) => acc + i * i, 0);
        const trendSlope = (trendN * trendSumXY - trendSumX * trendSumY) / (trendN * trendSumX2 - trendSumX * trendSumX);
        const trendIntercept = (trendSumY - trendSlope * trendSumX) / trendN;
        const trendLineData = values.map((_, i) => Math.round(trendSlope * i + trendIntercept));
        // Proyección futura (3 puntos adicionales)
        const futurePoints = [1, 2, 3].map(i => Math.round(trendSlope * (trendN + i - 1) + trendIntercept));
        const extendedLabels = [...datos.labels, 'Proy. 1', 'Proy. 2', 'Proy. 3'];

        baseOptions.series = [
          { name: 'Datos', type: 'line', data: [...values, null, null, null] },
          { name: 'Tendencia IA', type: 'line', data: [...trendLineData, ...futurePoints] }
        ];
        baseOptions.chart = { ...baseChart, type: 'line', height: '100%' };
        baseOptions.stroke = { width: [3, 2], curve: 'smooth', dashArray: [0, 5] };
        baseOptions.xaxis = { categories: extendedLabels };
        baseOptions.annotations = {
          xaxis: [{
            x: datos.labels[datos.labels.length - 1],
            borderColor: paleta[1],
            label: { text: 'Proyección', style: { color: '#fff', background: paleta[1] } }
          }]
        };
        break;

      case 'forecast':
        // Pronóstico con intervalos de confianza
        const forecastN = values.length;
        const forecastMean = values.reduce((a, b) => a + b, 0) / forecastN;
        const forecastStd = Math.sqrt(values.reduce((acc, v) => acc + Math.pow(v - forecastMean, 2), 0) / forecastN);
        const forecastLabels = [...datos.labels, 'F+1', 'F+2', 'F+3'];
        const lastValue = values[values.length - 1];
        const forecastValues = [lastValue, lastValue * 1.05, lastValue * 1.08];

        baseOptions.series = [
          { name: 'Histórico', type: 'line', data: [...values, null, null, null] },
          { name: 'Pronóstico', type: 'line', data: [...Array(values.length).fill(null), ...forecastValues] },
          { name: 'Límite sup.', type: 'line', data: [...Array(values.length).fill(null), ...forecastValues.map(v => v + forecastStd)] },
          { name: 'Límite inf.', type: 'line', data: [...Array(values.length).fill(null), ...forecastValues.map(v => Math.max(0, v - forecastStd))] }
        ];
        baseOptions.chart = { ...baseChart, type: 'line', height: '100%' };
        baseOptions.stroke = { width: [3, 3, 1, 1], curve: 'smooth', dashArray: [0, 5, 3, 3] };
        baseOptions.colors = [paleta[0], paleta[1], paleta[2], paleta[2]];
        baseOptions.xaxis = { categories: forecastLabels };
        baseOptions.fill = { type: 'solid', opacity: [1, 1, 0.3, 0.3] };
        break;

      default:
        // Fallback para otros tipos
        baseOptions.series = [{ name: this.titulo, data: values }];
        baseOptions.xaxis = { categories: datos.labels };
    }

    // ==================== COMPARACIÓN TEMPORAL PARA APEXCHARTS ====================
    // Agregar datos de comparación si está habilitada
    if (comparacion.habilitada && baseOptions.series && Array.isArray(baseOptions.series)) {
      const isOverlay = comparacion.modo === 'overlay';

      // Tipos que soportan comparación (con series de datos numéricos)
      const tiposSoportados = [
        'bar', 'column', 'stackedBar', 'groupedBar', 'stackedBarHorizontal',
        'line', 'area', 'stackedArea', 'spline', 'stepline',
        'radar', 'bubble', 'scatter'
      ];

      // Para tipos con series de objetos {name, data}
      if (tiposSoportados.includes(tipo) && baseOptions.series.length > 0) {
        const seriesComparacion: any[] = [];
        const coloresComparacion: string[] = [];

        baseOptions.series.forEach((serie: any, index: number) => {
          if (serie.data && Array.isArray(serie.data)) {
            const datosComparacion = generarDatosComparacion(
              serie.data.map((d: any) => typeof d === 'number' ? d : (d?.y || 0))
            );

            // Color de comparación
            const colorPrincipal = paleta[index % paleta.length];
            const colorAlternativo = paleta[(index + 2) % paleta.length];
            const colorComp = isOverlay ? colorPrincipal : colorAlternativo;

            seriesComparacion.push({
              name: `${serie.name || 'Serie'} (${comparacion.periodo2.label})`,
              data: datosComparacion,
              type: serie.type || undefined
            });
            coloresComparacion.push(colorComp);

            // Actualizar nombre de serie original
            serie.name = `${serie.name || 'Serie'} (${comparacion.periodo1.label})`;
          }
        });

        // Agregar series de comparación
        if (seriesComparacion.length > 0) {
          baseOptions.series = [...baseOptions.series, ...seriesComparacion];

          // Actualizar colores
          const coloresOriginales = paleta.slice(0, baseOptions.series.length - seriesComparacion.length);
          baseOptions.colors = [...coloresOriginales, ...coloresComparacion.map(c =>
            isOverlay ? this.hexToRgba(c, 0.4) : c
          )];

          // Mostrar leyenda cuando hay comparación
          baseOptions.legend = {
            ...baseOptions.legend,
            show: true,
            position: 'top'
          };

          // Para barras, ajustar el ancho
          if (['bar', 'column', 'stackedBar', 'groupedBar'].includes(tipo)) {
            baseOptions.plotOptions = {
              ...baseOptions.plotOptions,
              bar: {
                ...(baseOptions.plotOptions?.bar || {}),
                columnWidth: isOverlay ? '70%' : '85%'
              }
            };
          }

          // Para líneas en modo overlay, usar línea punteada para comparación
          if (['line', 'area', 'spline', 'stepline'].includes(tipo) && isOverlay) {
            const strokeWidth = baseOptions.stroke?.width;
            const dashArray = Array(baseOptions.series.length - seriesComparacion.length).fill(0);
            const dashArrayComp = Array(seriesComparacion.length).fill(5);
            baseOptions.stroke = {
              ...baseOptions.stroke,
              width: typeof strokeWidth === 'number'
                ? Array(baseOptions.series.length).fill(strokeWidth)
                : (strokeWidth || [2]),
              dashArray: [...dashArray, ...dashArrayComp]
            };
          }
        }
      }

      // Para tipos circulares (radialBar, pie, donut) - mostrar en tooltip
      if (['radialBar', 'gauge'].includes(tipo) && typeof baseOptions.series[0] === 'number') {
        // Para radialBar, agregar valores de comparación como segunda serie
        const valoresComparacion = generarDatosComparacion(baseOptions.series as number[]);

        // Actualizar labels para mostrar ambos periodos
        if (baseOptions.labels) {
          baseOptions.labels = baseOptions.labels.map((label: string, i: number) =>
            `${label}\n(Actual: ${baseOptions.series![i]}% | Anterior: ${valoresComparacion[i]}%)`
          );
        }
      }
    }

    return baseOptions;
  });

  // Helper para obtener tipo de ApexChart
  private getApexChartType(tipo: TipoGraficaAvanzada): string {
    const mapping: Record<string, string> = {
      // Circulares
      'pie': 'pie',
      'donut': 'donut',
      'radialBar': 'radialBar',
      'polarArea': 'polarArea',
      'gauge': 'radialBar',
      // Barras
      'bar': 'bar',
      'column': 'bar',
      'stackedBar': 'bar',
      'stackedBarHorizontal': 'bar',
      'groupedBar': 'bar',
      'funnel': 'bar',
      'pyramid': 'bar',
      'waterfall': 'bar',
      'bullet': 'bar',
      'dumbbell': 'rangeBar',
      // Líneas
      'line': 'line',
      'area': 'area',
      'stackedArea': 'area',
      'spline': 'line',
      'stepline': 'line',
      'combo': 'line',
      'regression': 'line',
      // Avanzadas
      'scatter': 'scatter',
      'bubble': 'bubble',
      'radar': 'radar',
      'heatmap': 'heatmap',
      'treemap': 'treemap',
      // Especializadas
      'boxplot': 'boxPlot',
      'candlestick': 'candlestick',
      'rangeArea': 'rangeArea',
      'sankey': 'treemap', // ApexCharts no tiene sankey nativo, usamos treemap como fallback
      'sunburst': 'treemap', // ApexCharts no tiene sunburst nativo, usamos treemap como fallback
      'riskMatrix': 'heatmap',
      'correlationMatrix': 'heatmap',
      // IA/Predictivo
      'trendline': 'line',
      'forecast': 'line'
    };
    return mapping[tipo] || 'bar';
  }

  // ==================== DRILL-DOWN ====================
  handleDrillDown(categoria: string, valor: number): void {
    console.log('Drill-down:', { categoria, valor });

    // Emitir evento de click en data point
    this.dataPointClick.emit({ categoria, valor });

    // Si drill-down está habilitado, agregar al stack
    if (this.drillDownActivo()) {
      this.drillDownStack.update(stack => [...stack, { campo: this.campoEjeX(), valor: categoria }]);
    }
  }

  // Método legacy - drill-down siempre activo, solo limpia el stack
  toggleDrillDown(): void {
    this.drillDownStack.set([]);
  }

  navegarDrillDown(index: number): void {
    // Navegar a un punto específico del stack
    this.drillDownStack.update(stack => stack.slice(0, index + 1));
  }

  salirDrillDown(): void {
    this.drillDownStack.update(stack => stack.slice(0, -1));
  }

  limpiarDrillDown(): void {
    this.drillDownStack.set([]);
  }

  // ==================== ANOTACIONES ====================
  abrirDialogAnotacion(): void {
    this.nuevaAnotacion.set({
      tipo: 'texto',
      texto: '',
      color: '#3B82F6',
      autor: 'Usuario'
    });
    this.anotacionEditando.set(null);
    this.mostrarDialogAnotacion.set(true);
  }

  guardarAnotacion(): void {
    const anotacion = this.nuevaAnotacion();
    if (!anotacion.texto?.trim()) return;

    if (this.anotacionEditando()) {
      // Editar existente
      this.anotaciones.update(list =>
        list.map(a => a.id === this.anotacionEditando() ? { ...a, ...anotacion } as AnotacionGrafica : a)
      );
    } else {
      // Nueva anotación
      const nuevaAnotacion: AnotacionGrafica = {
        id: Date.now().toString(),
        tipo: anotacion.tipo || 'texto',
        texto: anotacion.texto || '',
        color: anotacion.color || '#3B82F6',
        autor: anotacion.autor || 'Usuario',
        fecha: new Date(),
        categoria: anotacion.categoria,
        valor: anotacion.valor
      };
      this.anotaciones.update(list => [...list, nuevaAnotacion]);
    }

    this.cerrarDialogAnotacion();
    this.guardarAnotacionesEnStorage();
  }

  editarAnotacion(anotacion: AnotacionGrafica): void {
    this.nuevaAnotacion.set({ ...anotacion });
    this.anotacionEditando.set(anotacion.id);
    this.mostrarDialogAnotacion.set(true);
  }

  eliminarAnotacion(id: string): void {
    this.anotaciones.update(list => list.filter(a => a.id !== id));
    this.guardarAnotacionesEnStorage();
  }

  cerrarDialogAnotacion(): void {
    this.mostrarDialogAnotacion.set(false);
    this.nuevaAnotacion.set({});
    this.anotacionEditando.set(null);
  }

  private getAnotacionesStorageKey(): string {
    // Usar widgetId para separar anotaciones por widget
    return this.widgetId
      ? `graficas-anotaciones-${this.widgetId}`
      : 'graficas-anotaciones';
  }

  private guardarAnotacionesEnStorage(): void {
    try {
      const key = this.getAnotacionesStorageKey();
      localStorage.setItem(key, JSON.stringify(this.anotaciones()));
    } catch (e) {
      console.error('Error guardando anotaciones:', e);
    }
  }

  private cargarAnotacionesDesdeStorage(): void {
    try {
      const key = this.getAnotacionesStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        const anotaciones = JSON.parse(stored);
        anotaciones.forEach((a: any) => a.fecha = new Date(a.fecha));
        this.anotaciones.set(anotaciones);
      }
    } catch (e) {
      console.error('Error cargando anotaciones:', e);
    }
  }

  // ==================== COMPARACIÓN TEMPORAL ====================
  abrirDialogComparacion(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace60Dias = new Date(hoy.getTime() - 60 * 24 * 60 * 60 * 1000);

    this.comparacionTemporal.set({
      habilitada: false,
      periodo1: { desde: hace30Dias, hasta: hoy, label: 'Últimos 30 días' },
      periodo2: { desde: hace60Dias, hasta: hace30Dias, label: '30 días anteriores' },
      modo: 'overlay'
    });
    this.mostrarDialogComparacion.set(true);
  }

  aplicarComparacionTemporal(): void {
    this.comparacionTemporal.update(c => ({ ...c, habilitada: true }));
    this.mostrarDialogComparacion.set(false);
    // Aquí se emitiría un evento para que el componente padre recalcule los datos
  }

  desactivarComparacionTemporal(): void {
    this.comparacionTemporal.update(c => ({ ...c, habilitada: false }));
  }

  setModoComparacion(modo: 'overlay' | 'sideBySide'): void {
    this.comparacionTemporal.update(c => ({ ...c, modo }));
  }

  // Métodos para actualizar anotación
  setAnotacionTexto(texto: string): void {
    this.nuevaAnotacion.update(a => ({ ...a, texto }));
  }

  setAnotacionColor(color: string): void {
    this.nuevaAnotacion.update(a => ({ ...a, color }));
  }

  setAnotacionAutor(autor: string): void {
    this.nuevaAnotacion.update(a => ({ ...a, autor }));
  }

  // Helper para convertir hex a rgba
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private isNonAxisChart(tipo: TipoGraficaAvanzada): boolean {
    return ['pie', 'donut', 'radialBar', 'polarArea'].includes(tipo);
  }

  // Métodos públicos
  cambiarTipo(tipo: TipoGraficaAvanzada): void {
    this.tipoGrafica.set(tipo);
  }

  cambiarPaleta(paleta: string): void {
    this.paletaSeleccionada.set(paleta);
  }

  toggleAnimaciones(): void {
    this.animaciones.update(v => !v);
  }

  toggleLeyenda(): void {
    this.mostrarLeyenda.update(v => !v);
  }

  toggleDataLabels(): void {
    this.mostrarDataLabels.update(v => !v);
  }

  toggleTema(): void {
    this.themeService.toggleTheme();
  }

  exportarPNG(): void {
    // Chart.js export via canvas
    const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `grafica-${this.tipoGrafica()}-${Date.now()}.png`;
      link.click();
    }
  }

  exportarSVG(): void {
    // Si estamos usando ApexCharts, usar su exportación nativa de SVG
    if (this.usarApexCharts()) {
      const apexChart = document.querySelector('.chart-container .apexcharts-canvas');
      if (apexChart) {
        const svgElement = apexChart.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = `grafica-${this.tipoGrafica()}-${Date.now()}.svg`;
          link.click();
          URL.revokeObjectURL(svgUrl);
          return;
        }
      }
    }

    // Para Chart.js, convertir canvas a SVG simulado
    const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
    if (canvas) {
      // Crear SVG con imagen embebida del canvas
      const width = canvas.width;
      const height = canvas.height;
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>Gráfica ${this.getTipoLabel(this.tipoGrafica())} - ${this.titulo}</title>
  <desc>Exportado desde ORCA - ${new Date().toLocaleDateString('es-MX')}</desc>
  <image width="${width}" height="${height}" xlink:href="${dataUrl}"/>
</svg>`;

      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = `grafica-${this.tipoGrafica()}-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(svgUrl);
    }
  }

  resetZoom(): void {
    // Chart.js zoom reset - p-chart handles this internally
    // Trigger a re-render by updating a signal
    this.animaciones.update(v => v);
  }

  getTipoLabel(tipo: TipoGraficaAvanzada): string {
    const labels: Record<string, string> = {
      'pie': 'Pie', 'donut': 'Donut', 'radialBar': 'Radial', 'polarArea': 'Polar',
      'bar': 'Barras H', 'column': 'Columnas', 'stackedBar': 'Apiladas', 'groupedBar': 'Agrupadas',
      'line': 'Línea', 'area': 'Área', 'spline': 'Spline', 'stepline': 'Steps',
      'radar': 'Radar', 'scatter': 'Scatter', 'heatmap': 'Heatmap', 'treemap': 'Treemap',
      'funnel': 'Embudo', 'pyramid': 'Pirámide'
    };
    return labels[tipo] || tipo;
  }

  getTipoIcon(tipo: TipoGraficaAvanzada): string {
    const icons: Record<string, string> = {
      'pie': 'pi pi-chart-pie', 'donut': 'pi pi-circle', 'radialBar': 'pi pi-sun', 'polarArea': 'pi pi-slack',
      'bar': 'pi pi-align-left', 'column': 'pi pi-chart-bar', 'stackedBar': 'pi pi-objects-column', 'groupedBar': 'pi pi-th-large',
      'line': 'pi pi-chart-line', 'area': 'pi pi-chart-line', 'spline': 'pi pi-wave-pulse', 'stepline': 'pi pi-minus',
      'radar': 'pi pi-stop', 'scatter': 'pi pi-circle-fill', 'heatmap': 'pi pi-table', 'treemap': 'pi pi-objects-column',
      'funnel': 'pi pi-filter', 'pyramid': 'pi pi-caret-up'
    };
    return icons[tipo] || 'pi pi-chart-bar';
  }

  // Métodos para configuraciones guardadas
  guardarConfiguracionActual(): void {
    const nombre = this.nombreConfiguracion().trim();
    if (!nombre) return;

    const nuevaConfig: ConfiguracionGuardada = {
      id: Date.now().toString(),
      nombre,
      descripcion: this.descripcionConfiguracion().trim() || undefined,
      fechaCreacion: new Date(),
      configuracion: {
        tipoGrafica: this.tipoGrafica(),
        campoEjeX: this.campoEjeX(),
        campoEjeY: this.campoEjeY(),
        campoAgrupacion: this.campoAgrupacion(),
        paleta: this.paletaSeleccionada(),
        animaciones: this.animaciones(),
        mostrarLeyenda: this.mostrarLeyenda(),
        mostrarDataLabels: this.mostrarDataLabels(),
        tema: this.tema()
      }
    };

    this.configuracionesGuardadas.update(configs => [...configs, nuevaConfig]);
    this.guardarConfiguracionesEnStorage();
    this.cerrarDialogGuardar();
  }

  cargarConfiguracion(config: ConfiguracionGuardada): void {
    this.tipoGrafica.set(config.configuracion.tipoGrafica);
    this.campoEjeX.set(config.configuracion.campoEjeX);
    this.campoEjeY.set(config.configuracion.campoEjeY);
    this.campoAgrupacion.set(config.configuracion.campoAgrupacion);
    this.paletaSeleccionada.set(config.configuracion.paleta);
    this.animaciones.set(config.configuracion.animaciones);
    this.mostrarLeyenda.set(config.configuracion.mostrarLeyenda);
    this.mostrarDataLabels.set(config.configuracion.mostrarDataLabels);
    this.themeService.setTheme(config.configuracion.tema);
    this.tabActivo.set('config');
  }

  eliminarConfiguracion(id: string): void {
    this.configuracionesGuardadas.update(configs => configs.filter(c => c.id !== id));
    this.guardarConfiguracionesEnStorage();
  }

  abrirDialogGuardar(): void {
    this.nombreConfiguracion.set('');
    this.descripcionConfiguracion.set('');
    this.mostrarDialogGuardar.set(true);
    this.tabActivo.set('guardadas');
  }

  cerrarDialogGuardar(): void {
    this.mostrarDialogGuardar.set(false);
    this.nombreConfiguracion.set('');
    this.descripcionConfiguracion.set('');
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCampoDescripcion(campoValue: string): string {
    const campo = this.camposDisponibles.find(c => c.value === campoValue);
    return campo?.descripcion || '';
  }

  getTotalSeries(): number {
    const data = this.chartData();
    if (!data.datasets || data.datasets.length === 0) return 0;

    // Sumar todos los valores del primer dataset
    const firstDataset = data.datasets[0];
    if (firstDataset.data && Array.isArray(firstDataset.data)) {
      return firstDataset.data.reduce((acc: number, val: any) => {
        // Manejar tanto números como objetos (bubble/scatter charts)
        if (typeof val === 'number') {
          return acc + (val || 0);
        } else if (val && typeof val === 'object' && typeof val.y === 'number') {
          return acc + (val.y || 0);
        }
        return acc;
      }, 0);
    }

    return data.datasets.length;
  }

  // Métodos del Asistente IA
  async enviarMensajeAsistente(): Promise<void> {
    const mensaje = this.inputAsistente().trim();
    if (!mensaje) return;

    // Agregar mensaje del usuario
    const mensajeUsuario: MensajeAsistente = {
      id: Date.now().toString(),
      tipo: 'user',
      mensaje,
      fecha: new Date()
    };
    this.mensajesAsistente.update(msgs => [...msgs, mensajeUsuario]);
    this.inputAsistente.set('');
    this.asistenteEscribiendo.set(true);

    try {
      // Verificar si Groq está configurado
      if (!this.groqService.isConfigured) {
        const respuestaError: MensajeAsistente = {
          id: Date.now().toString(),
          tipo: 'assistant',
          mensaje: '⚠️ No hay API Key de Groq configurada. Por favor configura tu API Key en la sección de procesos para usar el asistente IA.\n\nMientras tanto, puedo ayudarte con comandos básicos. Intenta decir algo como "dona por estado" o "barras con severidad".',
          fecha: new Date()
        };
        this.mensajesAsistente.update(msgs => [...msgs, respuestaError]);
        this.asistenteEscribiendo.set(false);
        return;
      }

      const respuesta = await this.procesarMensajeConGroq(mensaje);
      this.mensajesAsistente.update(msgs => [...msgs, respuesta]);
    } catch (error) {
      console.error('Error con Groq:', error);
      const respuestaError: MensajeAsistente = {
        id: Date.now().toString(),
        tipo: 'assistant',
        mensaje: `❌ Error al procesar tu solicitud: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        fecha: new Date()
      };
      this.mensajesAsistente.update(msgs => [...msgs, respuestaError]);
    } finally {
      this.asistenteEscribiendo.set(false);
    }
  }

  usarSugerencia(sugerencia: string): void {
    this.inputAsistente.set(sugerencia);
    this.enviarMensajeAsistente();
  }

  aplicarConfiguracionSugerida(config: MensajeAsistente['configuracionSugerida']): void {
    if (!config) return;

    if (config.tipoGrafica) this.tipoGrafica.set(config.tipoGrafica);
    if (config.campoEjeX) {
      this.campoEjeX.set(config.campoEjeX);
      // Emitir evento para que el componente padre actualice los datos
      this.campoSeleccionado.emit({ campo: config.campoEjeX, tipo: 'ejeX' });
    }
    if (config.campoEjeY !== undefined) this.campoEjeY.set(config.campoEjeY);
    if (config.paleta) this.paletaSeleccionada.set(config.paleta);
    if (config.animaciones !== undefined) this.animaciones.set(config.animaciones);
    if (config.mostrarLeyenda !== undefined) this.mostrarLeyenda.set(config.mostrarLeyenda);
    if (config.mostrarDataLabels !== undefined) this.mostrarDataLabels.set(config.mostrarDataLabels);
    if (config.tema) this.themeService.setTheme(config.tema);

    // Manejar filtro
    if (config.filtro) {
      this.filtroActivo.set(config.filtro);
      this.filtroAplicado.emit(config.filtro);
    }

    // Cambiar a tab de configuración para ver el resultado
    this.tabActivo.set('config');
  }

  limpiarChatAsistente(): void {
    this.mensajesAsistente.set([]);
  }

  private async procesarMensajeConGroq(mensaje: string): Promise<MensajeAsistente> {
    // Construir lista de valores disponibles para filtrado
    const valoresDisponiblesStr = this.valoresFiltrado.length > 0
      ? this.valoresFiltrado.map(v => `- ${v.campo}: ${v.valores.slice(0, 10).join(', ')}${v.valores.length > 10 ? '...' : ''}`).join('\n')
      : 'No hay valores de filtrado disponibles';

    // Contexto actual para dar más información al modelo
    const contextoActual = `
CONFIGURACIÓN ACTUAL:
- Tipo de gráfica: ${this.tipoGrafica()}
- Campo eje X: ${this.campoEjeX()}
- Paleta: ${this.paletaSeleccionada()}
- Tema: ${this.tema()}
- Filtro activo: ${this.filtroActivo() ? `${this.filtroActivo()!.campo} = "${this.filtroActivo()!.valor}"` : 'Ninguno'}

DATOS ACTUALES (categorías): ${this.datosSignal().labels.slice(0, 10).join(', ')}${this.datosSignal().labels.length > 10 ? '...' : ''}

VALORES DISPONIBLES PARA FILTRAR:
${valoresDisponiblesStr}
`;

    const systemPrompt = `Eres un asistente experto en visualización de datos para una aplicación de gestión de riesgos e incidentes. Tu trabajo es ayudar a configurar gráficas basándote en lo que el usuario pide en lenguaje natural.

${contextoActual}

IMPORTANTE: El usuario puede mencionar términos específicos de su negocio como nombres de servidores, activos, procesos, etc. Si mencionan algo que parece ser un nombre específico (como "Servidor Principal", "Base de datos X", etc.), probablemente quieren filtrar o ver datos relacionados con ese elemento. En ese caso:
1. Sugiere usar "contenedorNombre" como campo para ver datos agrupados por activo/proceso
2. O pregunta amablemente qué tipo de visualización necesitan para ese elemento

DEBES responder SIEMPRE en formato JSON válido con esta estructura exacta:
{
  "mensaje": "Tu respuesta amigable al usuario explicando qué configuraste o preguntando más detalles",
  "configuracion": {
    "tipoGrafica": "valor o null",
    "campoEjeX": "valor o null",
    "paleta": "valor o null",
    "tema": "valor o null",
    "animaciones": true/false o null,
    "mostrarLeyenda": true/false o null,
    "mostrarDataLabels": true/false o null,
    "filtro": {
      "campo": "nombre del campo a filtrar o null",
      "valor": "valor específico a filtrar o null"
    }
  }
}

TIPOS DE GRÁFICA disponibles (usa exactamente estos valores):
- "donut" = dona, rosquilla, circular con hueco
- "pie" = pastel, circular, torta, pay
- "bar" = barras horizontales
- "column" = columnas, barras verticales, barras
- "stackedBar" = barras apiladas
- "groupedBar" = barras agrupadas
- "line" = línea, tendencia, evolución
- "area" = área, área rellena
- "spline" = línea suave, curva
- "stepline" = escalones, pasos
- "radar" = radar, araña, spider
- "scatter" = dispersión, puntos, correlación
- "heatmap" = mapa de calor, matriz
- "treemap" = treemap, mosaico, rectángulos
- "funnel" = embudo
- "pyramid" = pirámide
- "radialBar" = barras radiales, progreso circular
- "polarArea" = área polar

CAMPOS disponibles para campoEjeX (estos son los campos de datos que el usuario puede visualizar):
- "estado" = estado, estatus, situación actual (abierto, cerrado, en proceso, etc.)
- "severidad" = severidad, gravedad, criticidad, importancia (crítico, alto, medio, bajo)
- "responsable" = responsable, encargado, asignado, dueño, owner
- "fecha" = fecha, tiempo, temporal, cronológico, histórico, evolución
- "tipoEntidad" = tipo, entidad, categoría, clasificación (riesgo o incidente)
- "contenedorNombre" = activo, proceso, área, servidor, sistema, aplicación, elemento
- "probabilidad" = probabilidad, likelihood
- "impacto" = impacto, consecuencia, efecto
- "nivelRiesgo" = nivel de riesgo, riesgo total, score

PALETAS disponibles:
- "vibrant" = vibrante, vivo, llamativo, colorido, alegre
- "pastel" = pastel, suave, claro, tenue
- "neon" = neón, brillante, fluorescente, encendido
- "corporate" = corporativo, profesional, ejecutivo, formal, serio
- "earth" = tierra, natural, cálido, marrón, café
- "ocean" = océano, azul, mar, agua, fresco
- "sunset" = atardecer, cálido, naranja, degradado
- "semaforo" = semáforo, indicador, rojo-amarillo-verde, tráfico, alerta
- "monoazul" = monocromático, azul, uniforme, simple

TEMA:
- "dark" = oscuro, negro, noche, dark mode
- "light" = claro, blanco, día, light mode

FILTROS - MUY IMPORTANTE:
Cuando el usuario menciona un elemento específico (servidor, activo, proceso, área, sistema) Y quiere ver datos de ese elemento, DEBES usar el filtro:
- filtro.campo = "contenedorNombre" (para filtrar por activo/servidor/proceso)
- filtro.valor = el nombre exacto mencionado por el usuario

REGLAS:
1. Si el usuario menciona un tipo de gráfica, úsalo
2. Si el usuario menciona un concepto relacionado con los campos (estado, severidad, etc.), usa ese campo en campoEjeX
3. Si el usuario menciona un nombre específico de elemento (servidor, sistema, etc.) Y pide ver datos de él, USA EL FILTRO
4. El filtro se usa para mostrar SOLO los datos de ese elemento específico
5. campoEjeX es cómo agrupar los datos (por estado, severidad, etc.)
6. Solo incluye en configuracion los valores que puedas determinar del mensaje
7. Usa null para lo que no se mencione o no puedas determinar
8. El mensaje debe ser corto (1-2 oraciones), amigable y en español

EJEMPLOS de respuestas correctas:
- Input: "dona por estado" → {"mensaje": "¡Listo! He configurado una gráfica de dona agrupada por estado.", "configuracion": {"tipoGrafica": "donut", "campoEjeX": "estado"}}
- Input: "barras con severidad" → {"mensaje": "Perfecto, aquí tienes una gráfica de barras mostrando la distribución por severidad.", "configuracion": {"tipoGrafica": "column", "campoEjeX": "severidad"}}
- Input: "grafica de Servidor Principal por estado" → {"mensaje": "¡Listo! He filtrado los datos para mostrar solo 'Servidor Principal' agrupados por estado.", "configuracion": {"tipoGrafica": "donut", "campoEjeX": "estado", "filtro": {"campo": "contenedorNombre", "valor": "Servidor Principal"}}}
- Input: "quiero ver los riesgos del Servidor Principal" → {"mensaje": "Aquí tienes los riesgos del Servidor Principal agrupados por estado.", "configuracion": {"campoEjeX": "estado", "filtro": {"campo": "contenedorNombre", "valor": "Servidor Principal"}}}
- Input: "Servidor Principal con severidad en barras" → {"mensaje": "¡Listo! Gráfica de barras mostrando la severidad de los riesgos del Servidor Principal.", "configuracion": {"tipoGrafica": "column", "campoEjeX": "severidad", "filtro": {"campo": "contenedorNombre", "valor": "Servidor Principal"}}}
- Input: "quitar filtro" → {"mensaje": "He quitado el filtro. Ahora se muestran todos los datos.", "configuracion": {"filtro": null}}
- Input: "hola" → {"mensaje": "¡Hola! Soy tu asistente de gráficas. Dime qué quieres visualizar, por ejemplo: 'dona por estado' o 'gráfica de Servidor Principal por severidad'.", "configuracion": {}}`;

    const response = await this.groqService.ask(mensaje, {
      systemPrompt,
      temperature: 0.3,
      maxTokens: 500
    });

    console.log('Respuesta Groq:', response);

    try {
      // Intentar extraer JSON de la respuesta (puede venir con texto extra)
      let jsonStr = response;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      console.log('JSON parseado:', parsed);

      // Construir configuración limpia (solo valores no null)
      const configLimpia: MensajeAsistente['configuracionSugerida'] = {};

      if (parsed.configuracion) {
        if (parsed.configuracion.tipoGrafica) configLimpia.tipoGrafica = parsed.configuracion.tipoGrafica;
        if (parsed.configuracion.campoEjeX) configLimpia.campoEjeX = parsed.configuracion.campoEjeX;
        if (parsed.configuracion.paleta) configLimpia.paleta = parsed.configuracion.paleta;
        if (parsed.configuracion.tema) configLimpia.tema = parsed.configuracion.tema;
        if (parsed.configuracion.animaciones !== null && parsed.configuracion.animaciones !== undefined) {
          configLimpia.animaciones = parsed.configuracion.animaciones;
        }
        if (parsed.configuracion.mostrarLeyenda !== null && parsed.configuracion.mostrarLeyenda !== undefined) {
          configLimpia.mostrarLeyenda = parsed.configuracion.mostrarLeyenda;
        }
        if (parsed.configuracion.mostrarDataLabels !== null && parsed.configuracion.mostrarDataLabels !== undefined) {
          configLimpia.mostrarDataLabels = parsed.configuracion.mostrarDataLabels;
        }
        // Procesar filtro
        if (parsed.configuracion.filtro !== undefined) {
          if (parsed.configuracion.filtro === null) {
            // Usuario quiere quitar el filtro
            configLimpia.filtro = undefined;
          } else if (parsed.configuracion.filtro.campo && parsed.configuracion.filtro.valor) {
            configLimpia.filtro = {
              campo: parsed.configuracion.filtro.campo,
              valor: parsed.configuracion.filtro.valor
            };
          }
        }
      }

      const quitarFiltro = parsed.configuracion?.filtro === null;
      const tieneConfiguracion = Object.keys(configLimpia).length > 0 || quitarFiltro;

      // Si hay configuración válida, aplicarla automáticamente
      if (tieneConfiguracion) {
        console.log('Aplicando configuración automáticamente:', configLimpia, 'Quitar filtro:', quitarFiltro);
        this.aplicarConfiguracionSugeridaSinCambiarTab(configLimpia, quitarFiltro);
      }

      return {
        id: Date.now().toString(),
        tipo: 'assistant',
        mensaje: parsed.mensaje || response,
        fecha: new Date(),
        configuracionSugerida: tieneConfiguracion ? configLimpia : undefined
      };
    } catch (e) {
      console.error('Error parseando JSON:', e, 'Respuesta:', response);
      // Si no es JSON válido, devolver el texto tal cual
      return {
        id: Date.now().toString(),
        tipo: 'assistant',
        mensaje: response,
        fecha: new Date()
      };
    }
  }

  // Aplica configuración sin cambiar de tab (para aplicación automática)
  private aplicarConfiguracionSugeridaSinCambiarTab(config: MensajeAsistente['configuracionSugerida'], quitarFiltro = false): void {
    if (!config && !quitarFiltro) return;

    if (config?.tipoGrafica) this.tipoGrafica.set(config.tipoGrafica);
    if (config?.campoEjeX) {
      this.campoEjeX.set(config.campoEjeX);
      this.campoSeleccionado.emit({ campo: config.campoEjeX, tipo: 'ejeX' });
    }
    if (config?.campoEjeY !== undefined) this.campoEjeY.set(config.campoEjeY);
    if (config?.paleta) this.paletaSeleccionada.set(config.paleta);
    if (config?.animaciones !== undefined) this.animaciones.set(config.animaciones);
    if (config?.mostrarLeyenda !== undefined) this.mostrarLeyenda.set(config.mostrarLeyenda);
    if (config?.mostrarDataLabels !== undefined) this.mostrarDataLabels.set(config.mostrarDataLabels);
    if (config?.tema) this.themeService.setTheme(config.tema);

    // Manejar filtro
    if (quitarFiltro) {
      this.filtroActivo.set(null);
      this.filtroAplicado.emit(null);
      console.log('Filtro removido');
    } else if (config?.filtro) {
      this.filtroActivo.set(config.filtro);
      this.filtroAplicado.emit(config.filtro);
      console.log('Filtro aplicado:', config.filtro);
    }
  }

  // Método público para quitar el filtro
  quitarFiltro(): void {
    this.filtroActivo.set(null);
    this.filtroAplicado.emit(null);
  }

  formatHoraAsistente(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  // ==================== CONTEXT MENU DRILL-DOWN ====================

  /**
   * Genera los sub-items dinámicos para el menú "Desglosar por..."
   * basado en el campo actual y los campos disponibles
   */
  getDrillDownSubItems(currentField: string, dataPoint: { categoria: string; valor: number; indice: number }): MenuItem[] {
    // Obtener campos disponibles que no sean el actual
    const camposParaDesglose = this.camposDisponibles.filter(c =>
      c.value !== currentField && c.tipo === 'categoria'
    );

    return camposParaDesglose.map(campo => {
      // Crear sub-items con los valores reales del campo si existen
      const valoresItems: MenuItem[] = [];

      if (campo.valores && Object.keys(campo.valores).length > 0) {
        // Ordenar valores por conteo (mayor a menor)
        const valoresOrdenados = Object.entries(campo.valores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // Limitar a 10 valores para no sobrecargar el menú

        valoresOrdenados.forEach(([valor, conteo]) => {
          valoresItems.push({
            label: `${valor} (${conteo})`,
            icon: 'pi pi-circle-fill',
            command: () => {
              // Aplicar el campo y filtrar por el valor específico
              this.drillDownEvent.emit({
                tipo: 'desglose',
                categoria: valor,
                campo: campo.value,
                filtro: {
                  campo: campo.value,
                  valor: valor
                }
              });

              // Agregar al stack de drill-down
              if (this.drillDownActivo()) {
                this.drillDownStack.update(stack => [...stack, {
                  campo: currentField,
                  valor: dataPoint.categoria
                }]);
              }

              // Cambiar el campo del eje X
              this.campoEjeX.set(campo.value);
              this.campoSeleccionado.emit({ campo: campo.value, tipo: 'ejeX' });

              // Aplicar filtro por el valor seleccionado
              const filtro: FiltroGrafica = {
                campo: campo.value,
                valor: valor,
                operador: 'igual'
              };
              this.filtroActivo.set(filtro);
              this.filtroAplicado.emit(filtro);
            }
          });
        });

        // Agregar opción para ver todos
        if (Object.keys(campo.valores).length > 10) {
          valoresItems.push({ separator: true });
          valoresItems.push({
            label: `Ver todos (${Object.keys(campo.valores).length})`,
            icon: 'pi pi-list',
            command: () => this.aplicarDesgloseCompleto(campo, currentField, dataPoint)
          });
        }
      }

      // Si hay valores disponibles, mostrarlos como sub-menú
      if (valoresItems.length > 0) {
        return {
          label: `${campo.label} (${campo.conteo || Object.keys(campo.valores || {}).length} items)`,
          icon: this.getCampoIcon(campo.tipo),
          items: valoresItems
        };
      }

      // Si no hay valores, comportamiento original con clic directo
      return {
        label: campo.label,
        icon: this.getCampoIcon(campo.tipo),
        command: () => this.aplicarDesgloseCompleto(campo, currentField, dataPoint)
      };
    });
  }

  /**
   * Aplica un desglose completo por campo sin filtro de valor específico
   */
  private aplicarDesgloseCompleto(
    campo: CampoDisponible,
    currentField: string,
    dataPoint: { categoria: string; valor: number; indice: number }
  ): void {
    // Emitir evento de drill-down con el nuevo campo
    this.drillDownEvent.emit({
      tipo: 'desglose',
      categoria: dataPoint.categoria,
      campo: campo.value,
      filtro: {
        campo: currentField,
        valor: dataPoint.categoria
      }
    });

    // Agregar al stack de drill-down
    if (this.drillDownActivo()) {
      this.drillDownStack.update(stack => [...stack, {
        campo: currentField,
        valor: dataPoint.categoria
      }]);
    }

    // Cambiar el campo del eje X y emitir cambio
    this.campoEjeX.set(campo.value);
    this.campoSeleccionado.emit({ campo: campo.value, tipo: 'ejeX' });

    // Aplicar filtro por la categoría seleccionada
    const filtro: FiltroGrafica = {
      campo: currentField,
      valor: dataPoint.categoria,
      operador: 'igual'
    };
    this.filtroActivo.set(filtro);
    this.filtroAplicado.emit(filtro);
  }

  /**
   * Ver detalles de un datapoint específico
   */
  verDetallesDataPoint(dataPoint: { categoria: string; valor: number; indice: number }): void {
    this.drillDownEvent.emit({
      tipo: 'detalle',
      categoria: dataPoint.categoria,
      campo: this.campoEjeX()
    });

    // También emitir el evento de click normal para que el padre pueda manejarlo
    this.dataPointClick.emit({
      categoria: dataPoint.categoria,
      valor: dataPoint.valor
    });
  }

  /**
   * Filtrar la vista por un datapoint específico
   */
  filtrarPorDataPoint(dataPoint: { categoria: string; valor: number; indice: number }): void {
    const filtro: FiltroGrafica = {
      campo: this.campoEjeX(),
      valor: dataPoint.categoria,
      operador: 'igual'
    };

    this.filtroActivo.set(filtro);
    this.filtroAplicado.emit(filtro);

    this.drillDownEvent.emit({
      tipo: 'filtro',
      categoria: dataPoint.categoria,
      campo: this.campoEjeX(),
      filtro
    });
  }

  /**
   * Exportar solo los datos de un segmento específico
   */
  exportarSegmento(dataPoint: { categoria: string; valor: number; indice: number }): void {
    this.exportSegmentEvent.emit({
      categoria: dataPoint.categoria,
      valor: dataPoint.valor
    });
  }

  /**
   * Crear una alerta basada en el valor de un datapoint
   * Abre el drawer con los datos de la gráfica preseleccionados
   */
  crearAlertaParaValor(dataPoint: { categoria: string; valor: number; indice: number }): void {
    const campo = this.campoEjeX();
    const campoInfo = this.camposDisponibles.find(c => c.value === campo);

    // Pre-rellenar el formulario con datos de la gráfica
    this.alertaForm.set({
      nombre: `Alerta: ${dataPoint.categoria}`,
      descripcion: `Alerta automática para ${campoInfo?.label || campo}: ${dataPoint.categoria}`,
      metricaNombre: campo,
      operador: 'GT',
      valorUmbral: dataPoint.valor,
      severidad: 'warning',
      cooldownMinutos: 60,
      enviarInApp: true,
      enviarEmail: false,
      activo: true,
      categoriaSeleccionada: dataPoint.categoria,
      campoSeleccionado: campo
    });

    // Abrir el drawer
    this.mostrarDrawerAlerta.set(true);
  }

  /**
   * Actualizar un campo del formulario de alerta
   */
  updateAlertaForm(field: string, value: any): void {
    this.alertaForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  /**
   * Cerrar el drawer de alerta
   */
  cerrarDrawerAlerta(): void {
    this.mostrarDrawerAlerta.set(false);
  }

  /**
   * Guardar la alerta y emitir el evento
   */
  guardarAlerta(): void {
    const form = this.alertaForm();

    // Emitir el evento con todos los datos de la alerta
    this.createAlertEvent.emit({
      categoria: form.categoriaSeleccionada,
      valor: form.valorUmbral,
      campo: form.campoSeleccionado,
      // Datos adicionales del formulario
      nombre: form.nombre,
      descripcion: form.descripcion,
      operador: form.operador,
      severidad: form.severidad,
      cooldownMinutos: form.cooldownMinutos,
      enviarInApp: form.enviarInApp,
      enviarEmail: form.enviarEmail,
      activo: form.activo
    } as any);

    // Cerrar el drawer
    this.cerrarDrawerAlerta();
  }

  /**
   * Obtener icono para un tipo de campo
   */
  private getCampoIcon(tipo: string): string {
    switch (tipo) {
      case 'categoria': return 'pi pi-tag';
      case 'numerico': return 'pi pi-hashtag';
      case 'fecha': return 'pi pi-calendar';
      default: return 'pi pi-circle';
    }
  }

  /**
   * Manejar clic derecho en el contenedor de la gráfica
   */
  onChartContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const datos = this.datosSignal();
    if (datos.labels.length === 0) return;

    // Obtener el contenedor del chart
    const chartElement = this.chartContainerRef?.nativeElement;
    if (!chartElement) return;

    // Buscar el elemento de gráfica (canvas para Chart.js, cualquier SVG para ApexCharts)
    const canvas = chartElement.querySelector('canvas');
    const apexWrapper = chartElement.querySelector('.apexcharts-canvas');
    const svg = apexWrapper?.querySelector('svg') || chartElement.querySelector('svg');

    // Calcular rect para posicionamiento
    let rect: DOMRect;
    if (canvas) {
      rect = canvas.getBoundingClientRect();
    } else if (svg) {
      rect = svg.getBoundingClientRect();
    } else if (apexWrapper) {
      rect = (apexWrapper as HTMLElement).getBoundingClientRect();
    } else {
      rect = chartElement.getBoundingClientRect();
    }

    // Calcular posición relativa del clic
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calcular índice aproximado basado en la posición del clic y tipo de gráfica
    const tipoGrafica = this.tipoGrafica();
    let indiceValido: number;

    // Clasificar tipos de gráficas
    const esCircular = ['pie', 'donut', 'radialBar', 'gauge', 'polarArea'].includes(tipoGrafica);
    const esHorizontal = ['bar', 'stackedBarHorizontal', 'funnel', 'pyramid'].includes(tipoGrafica);
    const esMatriz = ['heatmap', 'treemap', 'riskMatrix', 'correlationMatrix'].includes(tipoGrafica);

    if (esCircular && rect.width > 0 && rect.height > 0) {
      // Para gráficas circulares, calcular basado en ángulo desde el centro
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360;
      indiceValido = Math.floor((angle / 360) * datos.labels.length);
    } else if (esHorizontal && rect.height > 0) {
      // Para gráficas horizontales, calcular basado en posición Y
      const indice = Math.floor((y / rect.height) * datos.labels.length);
      indiceValido = indice;
    } else if (esMatriz && rect.width > 0 && rect.height > 0) {
      // Para heatmaps y matrices, calcular basado en posición Y (filas)
      const indice = Math.floor((y / rect.height) * datos.labels.length);
      indiceValido = indice;
    } else if (rect.width > 0) {
      // Para gráficas verticales (columnas, líneas), calcular basado en posición X
      const indice = Math.floor((x / rect.width) * datos.labels.length);
      indiceValido = indice;
    } else {
      // Fallback: usar primer elemento
      indiceValido = 0;
    }

    // Asegurar que el índice sea válido
    indiceValido = Math.max(0, Math.min(indiceValido, datos.labels.length - 1));

    // Obtener valor
    let valor = 0;
    if (Array.isArray(datos.series) && datos.series.length > 0) {
      if (typeof datos.series[0] === 'number') {
        valor = (datos.series as number[])[indiceValido] || 0;
      } else if (typeof datos.series[0] === 'object' && 'data' in (datos.series[0] as any)) {
        const seriesData = datos.series as { name: string; data: number[] }[];
        valor = seriesData[0]?.data?.[indiceValido] || 0;
      }
    }

    // Establecer el datapoint seleccionado
    this.selectedDataPoint.set({
      categoria: datos.labels[indiceValido],
      valor: valor,
      indice: indiceValido
    });

    // Actualizar los items del menú contextual
    this.contextMenuItems.set(this.drillDownOptions());

    // Mostrar el menú contextual
    setTimeout(() => {
      if (this.drillDownMenu) {
        this.drillDownMenu.show(event);
      }
    }, 0);
  }

  /**
   * Manejar clic en un datapoint específico de la gráfica (para ApexCharts)
   */
  onApexDataPointClick(event: any, chartContext: any, config: any): void {
    const datos = this.datosSignal();
    const indice = config.dataPointIndex;

    if (indice >= 0 && indice < datos.labels.length) {
      let valor = 0;
      if (Array.isArray(datos.series) && typeof datos.series[0] === 'number') {
        valor = (datos.series as number[])[indice] || 0;
      } else if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
        valor = (datos.series as { name: string; data: number[] }[])[0].data[indice] || 0;
      }

      this.selectedDataPoint.set({
        categoria: datos.labels[indice],
        valor: valor,
        indice: indice
      });
    }
  }

  /**
   * Manejar mousedown para detectar clic derecho (button === 2)
   * Esto funciona mejor que contextmenu para ApexCharts
   */
  onChartMouseDown(event: MouseEvent): void {
    // Solo procesar clic derecho (button 2)
    if (event.button !== 2) return;

    // Prevenir comportamiento por defecto solo para clic derecho
    event.preventDefault();

    const datos = this.datosSignal();
    if (datos.labels.length === 0) return;

    const chartElement = this.chartContainerRef?.nativeElement;
    if (!chartElement) return;

    // Obtener rect del contenedor
    const rect = chartElement.getBoundingClientRect();

    // Calcular posición relativa
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determinar tipo de gráfica y calcular índice
    const tipoGrafica = this.tipoGrafica();
    let indiceValido: number;

    const esCircular = ['pie', 'donut', 'radialBar', 'gauge', 'polarArea'].includes(tipoGrafica);
    const esHorizontal = ['bar', 'stackedBarHorizontal', 'funnel', 'pyramid'].includes(tipoGrafica);
    const esMatriz = ['heatmap', 'treemap', 'riskMatrix', 'correlationMatrix'].includes(tipoGrafica);

    if (esCircular && rect.width > 0 && rect.height > 0) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360;
      indiceValido = Math.floor((angle / 360) * datos.labels.length);
    } else if (esHorizontal && rect.height > 0) {
      indiceValido = Math.floor((y / rect.height) * datos.labels.length);
    } else if (esMatriz && rect.height > 0) {
      indiceValido = Math.floor((y / rect.height) * datos.labels.length);
    } else if (rect.width > 0) {
      indiceValido = Math.floor((x / rect.width) * datos.labels.length);
    } else {
      indiceValido = 0;
    }

    indiceValido = Math.max(0, Math.min(indiceValido, datos.labels.length - 1));

    // Obtener valor
    let valor = 0;
    if (Array.isArray(datos.series) && datos.series.length > 0) {
      if (typeof datos.series[0] === 'number') {
        valor = (datos.series as number[])[indiceValido] || 0;
      } else if (typeof datos.series[0] === 'object' && 'data' in (datos.series[0] as any)) {
        const seriesData = datos.series as { name: string; data: number[] }[];
        valor = seriesData[0]?.data?.[indiceValido] || 0;
      }
    }

    // Establecer datapoint seleccionado
    this.selectedDataPoint.set({
      categoria: datos.labels[indiceValido],
      valor: valor,
      indice: indiceValido
    });

    // Actualizar menú y mostrarlo
    this.contextMenuItems.set(this.drillDownOptions());

    setTimeout(() => {
      if (this.drillDownMenu) {
        this.drillDownMenu.show(event);
      }
    }, 0);
  }
}
