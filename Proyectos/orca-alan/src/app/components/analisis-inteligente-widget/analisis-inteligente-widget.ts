// ============================================================================
// WIDGET DE ANÁLISIS INTELIGENTE v2
// ============================================================================
// Drawer 4 pasos: Fuentes → Filtros → Consulta → Preview
// Integración con Groq LLM, drill-down, insight drawer, acciones asistidas
// ============================================================================

import { Component, inject, signal, computed, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { MenuModule } from 'primeng/menu';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';

// ApexCharts
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';

// Models
import {
  TipoAnalisis,
  EntidadAnalisis,
  TipoVisualizacion,
  HorizontePrediccion,
  InterpretacionConsulta,
  VisualizacionSugerida,
  ResultadoAnalisis,
  ConsultaHistorial,
  AnalisisInteligenteWidgetConfig,
  EJEMPLOS_CONSULTAS,
  ResultadoPredictivo,
  ResultadoCorrelacion,
  // V2
  FuenteDatos,
  CategoriaFuente,
  FiltroExtraccion,
  ResumenAlcance,
  EtapaProgreso,
  InsightIA,
  ContenidoInsightDrawer,
  NivelDrillDown,
  EstadoDrillDown
} from '../../models/analisis-inteligente.models';

// Services
import { AnalisisInteligenteService } from '../../services/analisis-inteligente.service';

// Sub-components
import { DrillDownNavigatorComponent } from './drill-down-navigator/drill-down-navigator';
import { InsightDrawerComponent } from './insight-drawer/insight-drawer';

// Interfaz para pasos del wizard
interface PasoConfig {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-analisis-inteligente-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TitleCasePipe,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    ChipModule,
    TooltipModule,
    SelectModule,
    ProgressSpinnerModule,
    DividerModule,
    AutoCompleteModule,
    ToggleSwitchModule,
    MessageModule,
    MenuModule,
    DrawerModule,
    BadgeModule,
    DatePickerModule,
    ProgressBarModule,
    NgApexchartsModule,
    DrillDownNavigatorComponent,
    InsightDrawerComponent
  ],
  templateUrl: './analisis-inteligente-widget.html',
  styleUrl: './analisis-inteligente-widget.scss'
})
export class AnalisisInteligenteWidgetComponent implements OnInit {
  private service = inject(AnalisisInteligenteService);

  // Inputs
  @Input() config?: AnalisisInteligenteWidgetConfig;
  @Input() modoWidget = false;

  // Outputs
  @Output() onGuardar = new EventEmitter<ResultadoAnalisis>();
  @Output() onCerrar = new EventEmitter<void>();

  // Estado del drawer
  showConfigDrawer = false;
  pasoActual = signal(0);

  // Pasos de configuración (4 pasos v2)
  pasosConfig: PasoConfig[] = [
    { id: 'fuentes', label: 'Fuentes', icon: 'pi pi-database' },
    { id: 'filtros', label: 'Filtros', icon: 'pi pi-filter' },
    { id: 'consulta', label: 'Consulta', icon: 'pi pi-search' },
    { id: 'preview', label: 'Preview', icon: 'pi pi-eye' }
  ];

  // Estado del componente
  consultaTexto = signal('');
  isProcessing = signal(false);
  error = signal<string | null>(null);

  // Interpretación
  interpretacion = signal<InterpretacionConsulta | null>(null);
  entidadesEditables = signal<EntidadAnalisis[]>([]);
  tipoAnalisisSeleccionado = signal<TipoAnalisis>('descriptivo');

  // Visualizaciones
  visualizacionesSugeridas = signal<VisualizacionSugerida[]>([]);
  visualizacionSeleccionada = signal<TipoVisualizacion | null>(null);

  // Resultado final (widget)
  resultado = signal<ResultadoAnalisis | null>(null);

  // Preview (drawer)
  resultadoPreview = signal<ResultadoAnalisis | null>(null);

  // Historial
  historialConsultas = signal<ConsultaHistorial[]>([]);
  sugerenciasFiltradas = signal<string[]>([]);

  // Predicción
  horizontePrediccion = signal<HorizontePrediccion>(6);
  mostrarIntervaloConfianza = signal(true);

  // Correlación
  variablesCorrelacion = signal<string[]>([]);

  // ==================== V2: FUENTES & FILTROS ====================

  fuentesDisponibles = signal<FuenteDatos[]>([]);
  fuentesPorCategoria = signal<Record<string, FuenteDatos[]>>({});
  fuentesSeleccionadas = signal<FuenteDatos[]>([]);

  // Filtros dinámicos
  filtroRangoFechas = signal<Date[] | null>(null);
  filtroEstado = signal<string>('');
  filtroCategoria = signal<string>('');

  // Resumen de alcance
  resumenAlcance = computed<ResumenAlcance | null>(() => {
    const fuentes = this.fuentesSeleccionadas();
    if (fuentes.length === 0) return null;

    const totalRegistros = fuentes.reduce((sum, f) => sum + f.conteoRegistros, 0);
    const rango = this.filtroRangoFechas();
    let periodo = 'Todo el período';
    if (rango && rango.length === 2 && rango[0] && rango[1]) {
      periodo = `${rango[0].toLocaleDateString('es')} - ${rango[1].toLocaleDateString('es')}`;
    }

    return {
      totalRegistros,
      fuentesSeleccionadas: fuentes.length,
      periodo,
      filtrosAplicados: [
        ...(this.filtroEstado() ? [`Estado: ${this.filtroEstado()}`] : []),
        ...(this.filtroCategoria() ? [`Categoría: ${this.filtroCategoria()}`] : [])
      ],
      entidades: fuentes.map(f => f.entidad)
    };
  });

  // ==================== V2: PROGRESO ====================

  estadoProgreso = this.service.estadoProgreso;

  etapasProgreso: { etapa: EtapaProgreso; label: string; icon: string }[] = [
    { etapa: 'extrayendo', label: 'Extrayendo datos', icon: 'pi pi-download' },
    { etapa: 'transformando', label: 'Transformando', icon: 'pi pi-sync' },
    { etapa: 'analizando', label: 'Analizando', icon: 'pi pi-microchip-ai' },
    { etapa: 'generando', label: 'Generando', icon: 'pi pi-sparkles' }
  ];

  getProgresoPercent(): number {
    const etapa = this.estadoProgreso();
    if (!etapa) return 0;
    const idx = this.etapasProgreso.findIndex(e => e.etapa === etapa);
    return ((idx + 1) / this.etapasProgreso.length) * 100;
  }

  getProgresoLabel(): string {
    const etapa = this.estadoProgreso();
    if (!etapa) return '';
    return this.etapasProgreso.find(e => e.etapa === etapa)?.label || '';
  }

  isEtapaCompleted(etapa: { etapa: EtapaProgreso; label: string; icon: string }): boolean {
    const actual = this.estadoProgreso();
    if (!actual) return false;
    const etapaIdx = this.etapasProgreso.indexOf(etapa);
    const actualIdx = this.etapasProgreso.findIndex(e => e.etapa === actual);
    return etapaIdx < actualIdx;
  }

  // ==================== V2: DRILL DOWN ====================

  drillDownActivo = signal(false);
  drillDownState = signal<EstadoDrillDown | null>(null);

  // ==================== V2: INSIGHT DRAWER ====================

  insightDrawerVisible = this.service.insightDrawerVisible;
  contenidoInsights = this.service.contenidoInsights;

  // ==================== V2: CHART DATA VALIDATION ====================

  hasSufficientChartData = computed<boolean>(() => {
    const series = this.chartSeries();
    const res = this.resultado();
    if (!res || !series) return false;

    const vis = res.configuracionVisualizacion.tipo;

    // Non-axis charts (pie/donut): series is number[]
    if (vis === 'pie' || vis === 'donut') {
      return Array.isArray(series) && series.length >= 1 && series.some((v: any) => typeof v === 'number' && v > 0);
    }

    // Axis charts: series is {name, data}[]
    if (!Array.isArray(series) || series.length === 0) return false;
    const firstSeries = series[0] as any;
    if (!firstSeries?.data || !Array.isArray(firstSeries.data)) return false;

    const minPoints = (vis === 'line' || vis === 'area') ? 2 : 1;
    return firstSeries.data.length >= minPoints;
  });

  getChartEmptySuggestion(): string {
    const res = this.resultado();
    if (!res) return 'Prueba con otra consulta.';
    const vis = res.configuracionVisualizacion.tipo;
    switch (vis) {
      case 'line': case 'area':
        return 'Prueba con: "Muestrame la distribucion por categoria"';
      case 'pie': case 'donut':
        return 'Prueba con: "Compara los valores entre periodos"';
      case 'scatter': case 'heatmap':
        return 'Prueba con: "Distribucion de riesgos por area"';
      default:
        return 'Prueba con: "Resumen de incidentes por severidad"';
    }
  }

  // ==================== V2: CHART TYPE SELECTOR ====================

  chartTypeOverlayVisible = signal(false);

  cambiarTipoGrafica(tipo: TipoVisualizacion): void {
    const res = this.resultado();
    if (!res) return;

    const updated = {
      ...res,
      configuracionVisualizacion: { ...res.configuracionVisualizacion, tipo }
    };
    this.resultado.set(updated);
    this.actualizarGrafica(updated);
    this.chartTypeOverlayVisible.set(false);
  }

  // ==================== V2: LEGEND INTERACTIVITY ====================

  hiddenSeries = signal<Set<string>>(new Set());

  toggleSerieVisibility(serieName: string): void {
    const current = new Set(this.hiddenSeries());
    if (current.has(serieName)) {
      current.delete(serieName);
    } else {
      current.add(serieName);
    }
    this.hiddenSeries.set(current);
  }

  // Opciones UI
  tiposAnalisisOptions = [
    { label: 'Descriptivo', value: 'descriptivo', icon: 'pi pi-chart-bar', descripcion: 'Analiza datos actuales' },
    { label: 'Predictivo', value: 'predictivo', icon: 'pi pi-chart-line', descripcion: 'Proyecta tendencias' },
    { label: 'Correlación', value: 'correlacion', icon: 'pi pi-share-alt', descripcion: 'Encuentra relaciones' }
  ];

  horizonteOptions = [
    { label: '1 mes', value: 1 },
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 },
    { label: '12 meses', value: 12 }
  ];

  estadoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Abierto', value: 'abierto' },
    { label: 'En Proceso', value: 'en_proceso' },
    { label: 'Resuelto', value: 'resuelto' },
    { label: 'Cerrado', value: 'cerrado' }
  ];

  categoriaLabels: Record<string, string> = {
    grc: 'GRC',
    seguridad: 'Seguridad',
    cumplimiento: 'Cumplimiento',
    operaciones: 'Operaciones'
  };

  entidadesDisponibles: { label: string; value: EntidadAnalisis; icon: string }[] = [
    { label: 'Riesgos', value: 'riesgos', icon: 'pi pi-shield' },
    { label: 'Controles', value: 'controles', icon: 'pi pi-check-square' },
    { label: 'Incidentes', value: 'incidentes', icon: 'pi pi-exclamation-triangle' },
    { label: 'Activos', value: 'activos', icon: 'pi pi-box' },
    { label: 'Áreas', value: 'areas', icon: 'pi pi-sitemap' },
    { label: 'Cumplimiento', value: 'cumplimiento', icon: 'pi pi-verified' },
    { label: 'Procesos', value: 'procesos', icon: 'pi pi-cog' },
    { label: 'Objetivos', value: 'objetivos', icon: 'pi pi-flag' }
  ];

  // Ejemplos según tipo de análisis
  ejemplosDescriptivos = EJEMPLOS_CONSULTAS.filter(e => e.categoria === 'descriptivo');
  ejemplosPredictivos = EJEMPLOS_CONSULTAS.filter(e => e.categoria === 'predictivo');
  ejemplosCorrelacion = EJEMPLOS_CONSULTAS.filter(e => e.categoria === 'correlacion');

  ejemplosActuales = computed(() => {
    const tipo = this.tipoAnalisisSeleccionado();
    switch (tipo) {
      case 'descriptivo': return this.ejemplosDescriptivos;
      case 'predictivo': return this.ejemplosPredictivos;
      case 'correlacion': return this.ejemplosCorrelacion;
      default: return EJEMPLOS_CONSULTAS;
    }
  });

  // Chart options para widget
  chartSeries = signal<ApexAxisChartSeries | ApexNonAxisChartSeries>([]);
  chartOptions = computed(() => this.buildChartOptions(this.resultado()));

  // Chart options para preview
  previewChartSeries = signal<ApexAxisChartSeries | ApexNonAxisChartSeries>([]);
  previewChartOptions = computed(() => this.buildChartOptions(this.resultadoPreview(), true));

  // Menú de exportación
  exportMenuItems = [
    { label: 'PNG', icon: 'pi pi-image', command: () => this.exportarImagen('png') },
    { label: 'SVG', icon: 'pi pi-file', command: () => this.exportarImagen('svg') },
    { separator: true },
    { label: 'CSV', icon: 'pi pi-file-excel', command: () => this.exportarDatos('csv') },
    { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.exportarDatos('excel') }
  ];

  // ==================== V2: EMPTY STATE PROMPTS ====================

  promptsSugeridos = [
    '¿Cuántos riesgos críticos hay por área?',
    'Tendencia de incidentes los próximos 6 meses',
    'Correlación entre controles e incidentes'
  ];

  ngOnInit(): void {
    this.cargarHistorial();
    this.cargarFuentes();

    if (this.config?.analisisResultado) {
      this.resultado.set(this.config.analisisResultado);
      this.actualizarGrafica(this.config.analisisResultado);
      return;
    }

    if (this.config?.consultaInicial) {
      this.consultaTexto.set(this.config.consultaInicial);
    }

    if (this.config?.tipoAnalisisDefault) {
      this.tipoAnalisisSeleccionado.set(this.config.tipoAnalisisDefault);
    }
  }

  private cargarFuentes(): void {
    const fuentes = this.service.obtenerFuentesDisponibles();
    this.fuentesDisponibles.set(fuentes);
    this.fuentesPorCategoria.set(this.service.obtenerFuentesPorCategoria());
  }

  // ==================== DRAWER CONTROL ====================

  abrirConfiguracion(): void {
    this.pasoActual.set(0);
    this.error.set(null);
    this.showConfigDrawer = true;
  }

  cerrarConfiguracion(): void {
    this.showConfigDrawer = false;
    this.resetConfiguracion();
  }

  private resetConfiguracion(): void {
    this.consultaTexto.set('');
    this.interpretacion.set(null);
    this.entidadesEditables.set([]);
    this.visualizacionesSugeridas.set([]);
    this.visualizacionSeleccionada.set(null);
    this.resultadoPreview.set(null);
    this.previewChartSeries.set([]);
    this.error.set(null);
    this.pasoActual.set(0);
    this.fuentesSeleccionadas.set([]);
    this.filtroRangoFechas.set(null);
    this.filtroEstado.set('');
    this.filtroCategoria.set('');
  }

  // ==================== NAVEGACIÓN PASOS ====================

  getTituloPaso(): string {
    return this.pasosConfig[this.pasoActual()]?.label || '';
  }

  irAPaso(paso: number): void {
    if (paso < this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.set(this.pasoActual() - 1);
    }
  }

  async siguientePaso(): Promise<void> {
    const paso = this.pasoActual();

    if (paso === 0) {
      // Paso 0 -> 1: Validar fuentes seleccionadas
      if (this.fuentesSeleccionadas().length === 0) {
        this.error.set('Selecciona al menos una fuente de datos');
        return;
      }
      this.error.set(null);
      this.pasoActual.set(1);
    } else if (paso === 1) {
      // Paso 1 -> 2: Filtros OK, avanzar a consulta
      this.error.set(null);
      this.pasoActual.set(2);
    } else if (paso === 2) {
      // Paso 2 -> 3: Procesar consulta + generar preview
      await this.procesarConsultaYGenerar();
    }
  }

  puedeAvanzar(): boolean {
    const paso = this.pasoActual();

    if (paso === 0) {
      return this.fuentesSeleccionadas().length > 0;
    } else if (paso === 1) {
      return true; // Filtros son opcionales
    } else if (paso === 2) {
      return this.consultaTexto().trim().length > 0;
    }

    return true;
  }

  // ==================== PASO 0: FUENTES ====================

  toggleFuente(fuente: FuenteDatos): void {
    const actuales = this.fuentesSeleccionadas();
    const idx = actuales.findIndex(f => f.id === fuente.id);
    if (idx >= 0) {
      this.fuentesSeleccionadas.set(actuales.filter(f => f.id !== fuente.id));
    } else {
      this.fuentesSeleccionadas.set([...actuales, fuente]);
    }
    this.error.set(null);
  }

  isFuenteSeleccionada(fuente: FuenteDatos): boolean {
    return this.fuentesSeleccionadas().some(f => f.id === fuente.id);
  }

  seleccionarTodasCategoria(categoria: string): void {
    const fuentesCat = this.fuentesPorCategoria()[categoria] || [];
    const actuales = this.fuentesSeleccionadas();
    const todasSeleccionadas = fuentesCat.every(f => actuales.some(a => a.id === f.id));

    if (todasSeleccionadas) {
      this.fuentesSeleccionadas.set(actuales.filter(a => !fuentesCat.some(f => f.id === a.id)));
    } else {
      const nuevas = fuentesCat.filter(f => !actuales.some(a => a.id === f.id));
      this.fuentesSeleccionadas.set([...actuales, ...nuevas]);
    }
  }

  getCategoriaSeleccionadaCount(categoria: string): number {
    const fuentesCat = this.fuentesPorCategoria()[categoria] || [];
    return fuentesCat.filter(f => this.fuentesSeleccionadas().some(s => s.id === f.id)).length;
  }

  getTotalRegistrosSeleccionados(): number {
    return this.fuentesSeleccionadas().reduce((sum, f) => sum + f.conteoRegistros, 0);
  }

  // ==================== PASO 1: FILTROS ====================

  // Filtros son dinámicos según fuentes seleccionadas
  // DatePicker range, estado, categoría

  // ==================== PASO 2: CONSULTA ====================

  onConsultaInput(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const ejemplos = EJEMPLOS_CONSULTAS.map(e => e.texto);
    const historial = this.historialConsultas().map(h => h.texto);

    const todas = [...new Set([...historial, ...ejemplos])];
    this.sugerenciasFiltradas.set(
      todas.filter(s => s.toLowerCase().includes(query)).slice(0, 8)
    );
  }

  usarEjemplo(texto: string): void {
    this.consultaTexto.set(texto);
  }

  usarConsultaHistorial(consulta: ConsultaHistorial): void {
    this.consultaTexto.set(consulta.texto);
    this.tipoAnalisisSeleccionado.set(consulta.tipoAnalisis);
  }

  usarPromptSugerido(texto: string): void {
    this.consultaTexto.set(texto);
    this.abrirConfiguracion();
    // Auto-select all sources and skip to step 2
    this.fuentesSeleccionadas.set([...this.fuentesDisponibles()]);
    this.pasoActual.set(2);
  }

  private async procesarConsultaYGenerar(): Promise<void> {
    const texto = this.consultaTexto().trim();
    if (!texto) return;

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      // Interpretar consulta (usa LLM si configurado, fallback a keywords)
      const interpretacion = await this.service.interpretarConsulta(texto);
      this.interpretacion.set(interpretacion);
      this.entidadesEditables.set([...interpretacion.entidadesDetectadas]);
      this.tipoAnalisisSeleccionado.set(interpretacion.tipoAnalisisSugerido);

      // Sugerir visualizaciones
      const visualizaciones = this.service.sugerirVisualizaciones(
        interpretacion.tipoAnalisisSugerido,
        interpretacion.entidadesDetectadas
      );
      this.visualizacionesSugeridas.set(visualizaciones);
      const recomendada = visualizaciones.find(v => v.recomendado);
      this.visualizacionSeleccionada.set(recomendada?.tipo || visualizaciones[0]?.tipo || null);

      // Generar análisis completo
      const visualizacion = this.visualizacionSeleccionada();
      if (!visualizacion) throw new Error('No se pudo determinar visualización');

      const resultado = await this.service.generarAnalisis(
        interpretacion,
        this.tipoAnalisisSeleccionado(),
        visualizacion,
        {
          horizontePrediccion: this.horizontePrediccion(),
          mostrarIntervaloConfianza: this.mostrarIntervaloConfianza(),
          variablesCorrelacion: this.variablesCorrelacion()
        }
      );

      this.resultadoPreview.set(resultado);
      this.actualizarPreviewChart(resultado);
      this.agregarAlHistorial(texto);
      this.pasoActual.set(3);
    } catch (err: any) {
      this.error.set(err.message || 'Error al procesar la consulta');
    } finally {
      this.isProcessing.set(false);
    }
  }

  // ==================== PASO 2: CONFIGURAR (DENTRO DE CONSULTA) ====================

  agregarEntidad(entidad: EntidadAnalisis): void {
    const actuales = this.entidadesEditables();
    if (!actuales.includes(entidad) && actuales.length < 4) {
      this.entidadesEditables.set([...actuales, entidad]);
    }
  }

  eliminarEntidad(entidad: EntidadAnalisis): void {
    const actuales = this.entidadesEditables();
    this.entidadesEditables.set(actuales.filter(e => e !== entidad));
  }

  seleccionarVisualizacion(tipo: TipoVisualizacion): void {
    this.visualizacionSeleccionada.set(tipo);
  }

  getEntidadesDisponiblesMenu(): { label: string; icon: string; command: () => void }[] {
    const editables = this.entidadesEditables();
    return this.entidadesDisponibles
      .filter(e => !editables.includes(e.value))
      .map(e => ({
        label: e.label,
        icon: e.icon,
        command: () => this.agregarEntidad(e.value)
      }));
  }

  // ==================== PASO 3: PREVIEW ====================

  private actualizarPreviewChart(resultado: ResultadoAnalisis): void {
    const tipo = resultado.tipoAnalisis;
    const vis = resultado.configuracionVisualizacion.tipo;

    if (tipo === 'descriptivo' && resultado.datosDescriptivos) {
      this.buildDescriptiveChartForPreview(resultado.datosDescriptivos, vis);
    } else if (tipo === 'predictivo' && resultado.datosPredictivos) {
      this.buildPredictiveChartForPreview(resultado.datosPredictivos);
    } else if (tipo === 'correlacion' && resultado.datosCorrelacion) {
      this.buildCorrelationChartForPreview(resultado.datosCorrelacion, vis);
    }
  }

  private buildDescriptiveChartForPreview(datos: any, tipo: TipoVisualizacion): void {
    if (tipo === 'pie' || tipo === 'donut') {
      this.previewChartSeries.set(datos.series);
    } else {
      this.previewChartSeries.set([{ name: 'Valor', data: datos.series }]);
    }
  }

  private buildPredictiveChartForPreview(datos: ResultadoPredictivo): void {
    const historico = datos.datosHistoricos.map(p => ({ x: new Date(p.fecha).getTime(), y: p.valor }));
    const prediccion = datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.valor }));
    const series: ApexAxisChartSeries = [
      { name: 'Histórico', data: historico, type: 'line' },
      { name: 'Predicción', data: prediccion, type: 'line' }
    ];

    if (this.mostrarIntervaloConfianza() && datos.datosPrediccion[0]?.intervaloConfianza) {
      series.push(
        { name: 'Límite Superior', data: datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.intervaloConfianza?.max || p.valor })), type: 'area' },
        { name: 'Límite Inferior', data: datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.intervaloConfianza?.min || p.valor })), type: 'area' }
      );
    }
    this.previewChartSeries.set(series);
  }

  private buildCorrelationChartForPreview(datos: ResultadoCorrelacion, tipo: TipoVisualizacion): void {
    if (tipo === 'scatter') {
      this.previewChartSeries.set([{ name: 'Datos', data: datos.puntosMejorCorrelacion.map(p => ({ x: p.x, y: p.y })) }]);
    } else if (tipo === 'heatmap') {
      this.previewChartSeries.set(datos.variables.map((variable, i) => ({
        name: variable,
        data: datos.matriz[i].map((valor, j) => ({ x: datos.variables[j], y: valor }))
      })));
    }
  }

  // ==================== GUARDAR WIDGET ====================

  guardarWidget(): void {
    const preview = this.resultadoPreview();
    if (preview) {
      this.resultado.set(preview);
      this.actualizarGrafica(preview);
      this.showConfigDrawer = false;
      this.onGuardar.emit(preview);
    }
  }

  private actualizarGrafica(resultado: ResultadoAnalisis): void {
    const tipo = resultado.tipoAnalisis;
    const vis = resultado.configuracionVisualizacion.tipo;

    if (tipo === 'descriptivo' && resultado.datosDescriptivos) {
      this.buildDescriptiveChart(resultado.datosDescriptivos, vis);
    } else if (tipo === 'predictivo' && resultado.datosPredictivos) {
      this.buildPredictiveChart(resultado.datosPredictivos);
    } else if (tipo === 'correlacion' && resultado.datosCorrelacion) {
      this.buildCorrelationChart(resultado.datosCorrelacion, vis);
    }
  }

  private buildDescriptiveChart(datos: any, tipo: TipoVisualizacion): void {
    if (tipo === 'pie' || tipo === 'donut') {
      this.chartSeries.set(datos.series);
    } else {
      this.chartSeries.set([{ name: 'Valor', data: datos.series }]);
    }
  }

  private buildPredictiveChart(datos: ResultadoPredictivo): void {
    const historico = datos.datosHistoricos.map(p => ({ x: new Date(p.fecha).getTime(), y: p.valor }));
    const prediccion = datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.valor }));
    const series: ApexAxisChartSeries = [
      { name: 'Histórico', data: historico, type: 'line' },
      { name: 'Predicción', data: prediccion, type: 'line' }
    ];

    if (this.mostrarIntervaloConfianza() && datos.datosPrediccion[0]?.intervaloConfianza) {
      series.push(
        { name: 'Límite Superior', data: datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.intervaloConfianza?.max || p.valor })), type: 'area' },
        { name: 'Límite Inferior', data: datos.datosPrediccion.map(p => ({ x: new Date(p.fecha).getTime(), y: p.intervaloConfianza?.min || p.valor })), type: 'area' }
      );
    }
    this.chartSeries.set(series);
  }

  private buildCorrelationChart(datos: ResultadoCorrelacion, tipo: TipoVisualizacion): void {
    if (tipo === 'scatter') {
      this.chartSeries.set([{ name: 'Datos', data: datos.puntosMejorCorrelacion.map(p => ({ x: p.x, y: p.y })) }]);
    } else if (tipo === 'heatmap') {
      this.chartSeries.set(datos.variables.map((variable, i) => ({
        name: variable,
        data: datos.matriz[i].map((valor, j) => ({ x: datos.variables[j], y: valor }))
      })));
    }
  }

  private buildChartOptions(resultado: ResultadoAnalisis | null, isPreview = false): any {
    if (!resultado) return {};

    const vis = resultado.configuracionVisualizacion.tipo;
    const isDark = document.body.classList.contains('dark');

    const baseOptions: ApexChart = {
      type: this.mapVisualizacionToApexType(vis),
      height: isPreview ? 280 : 300,
      background: 'transparent',
      toolbar: { show: !isPreview },
      animations: { enabled: true },
      events: !isPreview ? {
        dataPointSelection: (_e: any, _chart: any, config: any) => {
          this.onChartElementClick(config);
        }
      } : undefined
    };

    const theme = isDark ? 'dark' : 'light';

    if (vis === 'pie' || vis === 'donut') {
      return {
        chart: baseOptions,
        labels: resultado.datosDescriptivos?.labels || [],
        theme: { mode: theme },
        legend: { position: 'bottom' },
        dataLabels: { enabled: true },
        tooltip: {
          y: {
            formatter: (val: number) => {
              const total = resultado.datosDescriptivos?.total || 1;
              return `${val} (${Math.round(val / total * 100)}%)`;
            }
          }
        }
      };
    }

    return {
      chart: baseOptions,
      theme: { mode: theme },
      xaxis: {
        categories: resultado.datosDescriptivos?.labels || [],
        labels: { style: { colors: isDark ? '#e5e7eb' : '#374151' } }
      },
      yaxis: {
        labels: { style: { colors: isDark ? '#e5e7eb' : '#374151' } }
      },
      grid: { borderColor: isDark ? '#374151' : '#e5e7eb' },
      legend: { position: 'top' },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: { opacity: resultado.tipoAnalisis === 'predictivo' ? [1, 1, 0.2, 0.2] : 1 },
      tooltip: {
        shared: true,
        y: {
          formatter: (val: number) => {
            const total = resultado.datosDescriptivos?.total;
            if (total) return `${val} (${Math.round(val / total * 100)}%)`;
            return `${val}`;
          }
        }
      }
    };
  }

  // ==================== V2: CHART CLICK → DRILL DOWN ====================

  onChartElementClick(config: any): void {
    if (!this.resultado()) return;
    const res = this.resultado()!;
    const dataPointIndex = config.dataPointIndex;

    if (res.datosDescriptivos && dataPointIndex >= 0) {
      const label = res.datosDescriptivos.labels[dataPointIndex];
      this.iniciarDrillDown(label, res);
    }
  }

  private iniciarDrillDown(elemento: string, resultado: ResultadoAnalisis): void {
    const entidad = resultado.interpretacion.entidadesDetectadas[0];
    const nivel1: NivelDrillDown = {
      nivel: 1,
      titulo: resultado.configuracionVisualizacion.titulo,
      tipoGrafico: resultado.configuracionVisualizacion.tipo,
      datos: {
        labels: resultado.datosDescriptivos?.labels || [],
        series: resultado.datosDescriptivos?.series || []
      },
      elementoSeleccionado: elemento
    };

    // Generate level 2 data
    const subLabels = ['Sub-A', 'Sub-B', 'Sub-C', 'Sub-D'];
    const subSeries = subLabels.map(() => Math.floor(Math.random() * 20) + 5);
    const nivel2: NivelDrillDown = {
      nivel: 2,
      titulo: `${elemento} - Detalle`,
      tipoGrafico: 'bar',
      datos: { labels: subLabels, series: subSeries },
      filtroAplicado: elemento
    };

    this.drillDownState.set({
      niveles: [nivel1, nivel2],
      nivelActual: 1,
      breadcrumb: [resultado.configuracionVisualizacion.titulo, elemento],
      entidadBase: entidad
    });
    this.drillDownActivo.set(true);
  }

  onDrillDown(event: { elemento: string; nivel: number }): void {
    const state = this.drillDownState();
    if (!state || event.nivel >= 2) return;

    // Generate level 3 (table data)
    const registros = Array.from({ length: 8 }, (_, i) => ({
      id: `REG-${Math.floor(Math.random() * 9000) + 1000}`,
      nombre: `Registro ${i + 1} - ${event.elemento}`,
      estado: ['Abierto', 'En Proceso', 'Resuelto', 'Cerrado'][Math.floor(Math.random() * 4)],
      severidad: ['Crítico', 'Alto', 'Medio', 'Bajo'][Math.floor(Math.random() * 4)],
      fecha: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString('es')
    }));

    const nivel3: NivelDrillDown = {
      nivel: 3,
      titulo: `${event.elemento} - Registros`,
      tipoGrafico: 'table',
      datos: { labels: [], series: [], registros },
      filtroAplicado: event.elemento
    };

    this.drillDownState.set({
      ...state,
      niveles: [...state.niveles, nivel3],
      nivelActual: 2,
      breadcrumb: [...state.breadcrumb, event.elemento]
    });
  }

  onSubirNivel(): void {
    const state = this.drillDownState();
    if (!state || state.nivelActual <= 0) {
      this.drillDownActivo.set(false);
      this.drillDownState.set(null);
      return;
    }

    this.drillDownState.set({
      ...state,
      nivelActual: state.nivelActual - 1,
      breadcrumb: state.breadcrumb.slice(0, -1),
      niveles: state.niveles.slice(0, -1)
    });

    if (state.nivelActual - 1 < 0) {
      this.drillDownActivo.set(false);
    }
  }

  // ==================== V2: INSIGHT DRAWER TRIGGER ====================

  async toggleInsightDrawer(): Promise<void> {
    if (this.insightDrawerVisible()) {
      this.insightDrawerVisible.set(false);
      return;
    }

    const resultado = this.resultado();
    if (!resultado) return;

    this.insightDrawerVisible.set(true);

    // Generate insights if not already loaded
    if (!this.contenidoInsights()) {
      const [insights, resumen, comparativos] = await Promise.all([
        this.service.generarInsights(resultado),
        this.service.generarResumenEjecutivo(resultado),
        Promise.resolve(this.service.generarComparativos(resultado))
      ]);

      const acciones = await this.service.generarAccionesSugeridas(insights);

      this.contenidoInsights.set({
        resumenEjecutivo: resumen,
        hallazgos: insights,
        comparativos,
        acciones,
        fuentesAnalizadas: this.fuentesSeleccionadas().map(f => f.nombre),
        periodoAnalisis: this.resumenAlcance()?.periodo || 'No especificado',
        fechaGeneracion: new Date()
      });
    }
  }

  onInsightDrawerClose(): void {
    this.insightDrawerVisible.set(false);
  }

  onAccionEjecutada(event: { accionId: string; entidadId: string }): void {
    const contenido = this.contenidoInsights();
    if (!contenido) return;

    // Mark insight as actioned
    const hallazgos = contenido.hallazgos.map(h => {
      const accion = contenido.acciones.find(a => a.insightOrigenId === h.id && a.id === event.accionId);
      if (accion) return { ...h, accionado: true };
      return h;
    });

    // Mark action as executed
    const acciones = contenido.acciones.map(a =>
      a.id === event.accionId ? { ...a, ejecutada: true, entidadCreadaId: event.entidadId } : a
    );

    this.contenidoInsights.set({ ...contenido, hallazgos, acciones });
    this.service.marcarAccionEjecutada(event.accionId, event.entidadId);
  }

  private mapVisualizacionToApexType(vis: TipoVisualizacion): ApexChart['type'] {
    const map: Record<TipoVisualizacion, ApexChart['type']> = {
      bar: 'bar', line: 'line', pie: 'pie', donut: 'donut',
      area: 'area', scatter: 'scatter', heatmap: 'heatmap',
      radar: 'radar', funnel: 'bar', treemap: 'treemap',
      table: 'bar', sankey: 'bar', gauge: 'radialBar'
    };
    return map[vis] || 'bar';
  }

  // ==================== EXPORTACIÓN ====================

  exportarImagen(formato: 'png' | 'svg'): void {
    // Handled via ApexCharts toolbar
  }

  exportarDatos(formato: 'csv' | 'excel'): void {
    const resultado = this.resultado();
    if (!resultado) return;
    this.service.exportarDatos(resultado, formato);
  }

  // ==================== HISTORIAL ====================

  private cargarHistorial(): void {
    this.historialConsultas.set(this.service.obtenerHistorial());
  }

  private agregarAlHistorial(texto: string): void {
    const nuevaConsulta: ConsultaHistorial = {
      id: `consulta-${Date.now()}`,
      texto,
      fecha: new Date(),
      tipoAnalisis: this.tipoAnalisisSeleccionado(),
      entidades: this.entidadesEditables()
    };
    const historial = [nuevaConsulta, ...this.historialConsultas().slice(0, 9)];
    this.historialConsultas.set(historial);
    this.service.guardarHistorial(historial);
  }

  // ==================== HELPERS ====================

  getEntidadIcon(entidad: EntidadAnalisis): string {
    return this.entidadesDisponibles.find(e => e.value === entidad)?.icon || 'pi pi-circle';
  }

  getEntidadLabel(entidad: EntidadAnalisis): string {
    return this.entidadesDisponibles.find(e => e.value === entidad)?.label || entidad;
  }

  setTipoAnalisis(tipo: string): void {
    this.tipoAnalisisSeleccionado.set(tipo as TipoAnalisis);
  }

  getVisualizacionIcon(tipo: TipoVisualizacion): string {
    const iconos: Record<TipoVisualizacion, string> = {
      bar: 'pi pi-chart-bar', line: 'pi pi-chart-line', pie: 'pi pi-chart-pie',
      donut: 'pi pi-circle', area: 'pi pi-chart-line', scatter: 'pi pi-share-alt',
      heatmap: 'pi pi-table', radar: 'pi pi-slack', funnel: 'pi pi-filter',
      treemap: 'pi pi-th-large', table: 'pi pi-table',
      sankey: 'pi pi-arrows-h', gauge: 'pi pi-gauge'
    };
    return iconos[tipo] || 'pi pi-chart-bar';
  }

  getVisualizacionLabel(): string {
    const vis = this.visualizacionSeleccionada();
    if (!vis) return '';
    return this.visualizacionesSugeridas().find(v => v.tipo === vis)?.nombre || vis;
  }

  getTipoAnalisisLabel(): string {
    const tipo = this.tipoAnalisisSeleccionado();
    return this.tiposAnalisisOptions.find(t => t.value === tipo)?.label || tipo;
  }

  getNivelConfianzaColor(nivel: string): string {
    switch (nivel) {
      case 'alta': return 'success';
      case 'media': return 'warn';
      case 'baja': return 'danger';
      default: return 'secondary';
    }
  }

  getTagSeverity(tipo: TipoAnalisis): 'info' | 'warn' | 'success' | 'secondary' {
    switch (tipo) {
      case 'descriptivo': return 'info';
      case 'predictivo': return 'warn';
      case 'correlacion': return 'success';
      default: return 'secondary';
    }
  }

  getCorrelacionColor(coef: number): string {
    const abs = Math.abs(coef);
    if (abs >= 0.7) return coef > 0 ? '#22c55e' : '#ef4444';
    if (abs >= 0.4) return coef > 0 ? '#84cc16' : '#f97316';
    return '#9ca3af';
  }
}
