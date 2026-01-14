// ============================================================================
// WIDGET DE ANÁLISIS INTELIGENTE
// ============================================================================
// Configuración en drawer multistep con preview
// Incluye análisis descriptivo, predictivo (ML) y de correlación
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
  ResultadoCorrelacion
} from '../../models/analisis-inteligente.models';

// Service
import { AnalisisInteligenteService } from '../../services/analisis-inteligente.service';

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
    NgApexchartsModule
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

  // Pasos de configuración
  pasosConfig: PasoConfig[] = [
    { id: 'consulta', label: 'Consulta', icon: 'pi pi-search' },
    { id: 'configurar', label: 'Configurar', icon: 'pi pi-cog' },
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

  ngOnInit(): void {
    this.cargarHistorial();

    // Si hay un resultado pre-configurado (desde el dashboard), usarlo directamente
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
      // Paso 0 -> 1: Procesar consulta
      await this.procesarConsulta();
    } else if (paso === 1) {
      // Paso 1 -> 2: Generar preview
      await this.generarPreview();
    }
  }

  puedeAvanzar(): boolean {
    const paso = this.pasoActual();

    if (paso === 0) {
      return this.consultaTexto().trim().length > 0;
    } else if (paso === 1) {
      return this.visualizacionSeleccionada() !== null && this.entidadesEditables().length > 0;
    }

    return true;
  }

  // ==================== PASO 1: CONSULTA ====================

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

  private async procesarConsulta(): Promise<void> {
    const texto = this.consultaTexto().trim();
    if (!texto) return;

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const interpretacion = await this.service.interpretarConsulta(texto);
      this.interpretacion.set(interpretacion);
      this.entidadesEditables.set([...interpretacion.entidadesDetectadas]);
      this.tipoAnalisisSeleccionado.set(interpretacion.tipoAnalisisSugerido);

      const visualizaciones = this.service.sugerirVisualizaciones(
        interpretacion.tipoAnalisisSugerido,
        interpretacion.entidadesDetectadas
      );
      this.visualizacionesSugeridas.set(visualizaciones);

      const recomendada = visualizaciones.find(v => v.recomendado);
      this.visualizacionSeleccionada.set(recomendada?.tipo || visualizaciones[0]?.tipo || null);

      this.agregarAlHistorial(texto);
      this.pasoActual.set(1);
    } catch (err: any) {
      this.error.set(err.message || 'Error al procesar la consulta');
    } finally {
      this.isProcessing.set(false);
    }
  }

  // ==================== PASO 2: CONFIGURAR ====================

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

  private async generarPreview(): Promise<void> {
    const visualizacion = this.visualizacionSeleccionada();
    const interpretacion = this.interpretacion();

    if (!visualizacion || !interpretacion) return;

    this.isProcessing.set(true);
    this.error.set(null);
    this.pasoActual.set(2);

    try {
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
    } catch (err: any) {
      this.error.set(err.message || 'Error al generar el preview');
      this.pasoActual.set(1);
    } finally {
      this.isProcessing.set(false);
    }
  }

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
      this.previewChartSeries.set([{
        name: 'Valor',
        data: datos.series
      }]);
    }
  }

  private buildPredictiveChartForPreview(datos: ResultadoPredictivo): void {
    const historico = datos.datosHistoricos.map(p => ({
      x: new Date(p.fecha).getTime(),
      y: p.valor
    }));

    const prediccion = datos.datosPrediccion.map(p => ({
      x: new Date(p.fecha).getTime(),
      y: p.valor
    }));

    const series: ApexAxisChartSeries = [
      { name: 'Histórico', data: historico, type: 'line' },
      { name: 'Predicción', data: prediccion, type: 'line' }
    ];

    if (this.mostrarIntervaloConfianza() && datos.datosPrediccion[0]?.intervaloConfianza) {
      const rangoSuperior = datos.datosPrediccion.map(p => ({
        x: new Date(p.fecha).getTime(),
        y: p.intervaloConfianza?.max || p.valor
      }));
      const rangoInferior = datos.datosPrediccion.map(p => ({
        x: new Date(p.fecha).getTime(),
        y: p.intervaloConfianza?.min || p.valor
      }));

      series.push(
        { name: 'Límite Superior', data: rangoSuperior, type: 'area' },
        { name: 'Límite Inferior', data: rangoInferior, type: 'area' }
      );
    }

    this.previewChartSeries.set(series);
  }

  private buildCorrelationChartForPreview(datos: ResultadoCorrelacion, tipo: TipoVisualizacion): void {
    if (tipo === 'scatter') {
      const puntos = datos.puntosMejorCorrelacion.map(p => ({
        x: p.x,
        y: p.y
      }));
      this.previewChartSeries.set([{ name: 'Datos', data: puntos }]);
    } else if (tipo === 'heatmap') {
      const series = datos.variables.map((variable, i) => ({
        name: variable,
        data: datos.matriz[i].map((valor, j) => ({
          x: datos.variables[j],
          y: valor
        }))
      }));
      this.previewChartSeries.set(series);
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
      this.chartSeries.set([{
        name: 'Valor',
        data: datos.series
      }]);
    }
  }

  private buildPredictiveChart(datos: ResultadoPredictivo): void {
    const historico = datos.datosHistoricos.map(p => ({
      x: new Date(p.fecha).getTime(),
      y: p.valor
    }));

    const prediccion = datos.datosPrediccion.map(p => ({
      x: new Date(p.fecha).getTime(),
      y: p.valor
    }));

    const series: ApexAxisChartSeries = [
      { name: 'Histórico', data: historico, type: 'line' },
      { name: 'Predicción', data: prediccion, type: 'line' }
    ];

    if (this.mostrarIntervaloConfianza() && datos.datosPrediccion[0]?.intervaloConfianza) {
      const rangoSuperior = datos.datosPrediccion.map(p => ({
        x: new Date(p.fecha).getTime(),
        y: p.intervaloConfianza?.max || p.valor
      }));
      const rangoInferior = datos.datosPrediccion.map(p => ({
        x: new Date(p.fecha).getTime(),
        y: p.intervaloConfianza?.min || p.valor
      }));

      series.push(
        { name: 'Límite Superior', data: rangoSuperior, type: 'area' },
        { name: 'Límite Inferior', data: rangoInferior, type: 'area' }
      );
    }

    this.chartSeries.set(series);
  }

  private buildCorrelationChart(datos: ResultadoCorrelacion, tipo: TipoVisualizacion): void {
    if (tipo === 'scatter') {
      const puntos = datos.puntosMejorCorrelacion.map(p => ({
        x: p.x,
        y: p.y
      }));
      this.chartSeries.set([{ name: 'Datos', data: puntos }]);
    } else if (tipo === 'heatmap') {
      const series = datos.variables.map((variable, i) => ({
        name: variable,
        data: datos.matriz[i].map((valor, j) => ({
          x: datos.variables[j],
          y: valor
        }))
      }));
      this.chartSeries.set(series);
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
      animations: { enabled: true }
    };

    const theme = isDark ? 'dark' : 'light';

    if (vis === 'pie' || vis === 'donut') {
      return {
        chart: baseOptions,
        labels: resultado.datosDescriptivos?.labels || [],
        theme: { mode: theme },
        legend: { position: 'bottom' },
        dataLabels: { enabled: true }
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
      grid: {
        borderColor: isDark ? '#374151' : '#e5e7eb'
      },
      legend: { position: 'top' },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      fill: { opacity: resultado.tipoAnalisis === 'predictivo' ? [1, 1, 0.2, 0.2] : 1 }
    };
  }

  private mapVisualizacionToApexType(vis: TipoVisualizacion): ApexChart['type'] {
    const map: Record<TipoVisualizacion, ApexChart['type']> = {
      bar: 'bar',
      line: 'line',
      pie: 'pie',
      donut: 'donut',
      area: 'area',
      scatter: 'scatter',
      heatmap: 'heatmap',
      radar: 'radar',
      funnel: 'bar',
      treemap: 'treemap',
      table: 'bar'
    };
    return map[vis] || 'bar';
  }

  // ==================== EXPORTACIÓN ====================

  exportarImagen(formato: 'png' | 'svg'): void {
    // La exportación se maneja via ApexCharts toolbar
  }

  exportarDatos(formato: 'csv' | 'excel'): void {
    const resultado = this.resultado();
    if (!resultado) return;

    this.service.exportarDatos(resultado, formato);
  }

  // ==================== HISTORIAL ====================

  private cargarHistorial(): void {
    const historial = this.service.obtenerHistorial();
    this.historialConsultas.set(historial);
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
      bar: 'pi pi-chart-bar',
      line: 'pi pi-chart-line',
      pie: 'pi pi-chart-pie',
      donut: 'pi pi-circle',
      area: 'pi pi-chart-line',
      scatter: 'pi pi-share-alt',
      heatmap: 'pi pi-table',
      radar: 'pi pi-slack',
      funnel: 'pi pi-filter',
      treemap: 'pi pi-th-large',
      table: 'pi pi-table'
    };
    return iconos[tipo] || 'pi pi-chart-bar';
  }

  getVisualizacionLabel(): string {
    const vis = this.visualizacionSeleccionada();
    if (!vis) return '';
    const found = this.visualizacionesSugeridas().find(v => v.tipo === vis);
    return found?.nombre || vis;
  }

  getTipoAnalisisLabel(): string {
    const tipo = this.tipoAnalisisSeleccionado();
    const found = this.tiposAnalisisOptions.find(t => t.value === tipo);
    return found?.label || tipo;
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
