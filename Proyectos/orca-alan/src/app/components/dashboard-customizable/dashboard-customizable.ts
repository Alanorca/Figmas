// ============================================================================
// DASHBOARD CUSTOMIZABLE COMPONENT
// ============================================================================
// Componente principal del dashboard con drag and drop
// Usa angular-gridster2 para el layout de widgets
// Integrado con datos reales, ApexCharts interactivos y configuración de widgets
// ============================================================================

import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridsterModule } from 'angular-gridster2';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexFill,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  ApexGrid
} from 'ng-apexcharts';

import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardDataService,
  KPIMetricGlobal,
  AlertaConsolidada,
  ProcesoKPIResumen,
  ProcesoCompleto,
  ObjetivoCompleto
} from '../../services/dashboard-data.service';
import { ExportService, TableExportData } from '../../services/export.service';
import { DashboardWidgetComponent } from '../dashboard-widget/dashboard-widget';
import {
  GraficasInteractivasComponent,
  DatosGrafica,
  FiltroGrafica
} from '../graficas-interactivas/graficas-interactivas';

// Interfaz para actividad detallada con drilldown
export interface ActividadDetallada {
  id?: string;
  icono: string;
  color: string;
  texto: string;
  tiempo: string;
  tipo?: string;
  detalle?: string;
  usuario?: string;
  proceso?: string;
  entidad?: string;
  fechaCompleta?: string;
  cambios?: { campo: string; valorAnterior: string; valorNuevo: string }[];
}
import {
  DashboardWidget,
  WidgetCatalogItem,
  WIDGET_CATALOG,
  TipoWidget,
  WidgetConfig
} from '../../models/dashboard.models';
import { WidgetConfiguratorComponent } from '../widget-configurator/widget-configurator';
import { esGraficaConfigurable } from '../../models/widget-chart.config';
import { CalendarioWidgetComponent, CalendarioEvento } from '../calendario-widget/calendario-widget';
import { GraficasGuardadasWidgetComponent, GraficaGuardada } from '../graficas-guardadas-widget/graficas-guardadas-widget';
import { GraficaWizardComponent } from '../grafica-wizard/grafica-wizard';
import { GraficaWizardResult } from '../../models/grafica-wizard.models';

@Component({
  selector: 'app-dashboard-customizable',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GridsterModule,
    ButtonModule,
    TooltipModule,
    DrawerModule,
    InputTextModule,
    SelectModule,
    DividerModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    TabsModule,
    TagModule,
    ToggleButtonModule,
    DialogModule,
    RadioButtonModule,
    DashboardWidgetComponent,
    NgApexchartsModule,
    GraficasInteractivasComponent,
    WidgetConfiguratorComponent,
    CalendarioWidgetComponent,
    GraficasGuardadasWidgetComponent,
    GraficaWizardComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard-customizable.html',
  styleUrl: './dashboard-customizable.scss'
})
export class DashboardCustomizableComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  dashboardService = inject(DashboardService);
  dataService = inject(DashboardDataService);
  private exportService = inject(ExportService);

  // Estado local
  showCatalogoDrawer = signal(false);
  showConfigDrawer = signal(false);
  showLayoutDrawer = signal(false);
  catalogoFiltro = signal('');
  categoriaActiva = signal<string>('todos');

  // Widget Configurator avanzado (para tablas)
  showWidgetConfigurator = signal(false);
  configuratorCatalogItem = signal<WidgetCatalogItem | null>(null);

  // Drilldown Drawers
  showProcesoDrilldown = signal(false);
  showAlertaDrilldown = signal(false);
  showTendenciaDrilldown = signal(false);

  // Datos seleccionados para drilldown
  procesoSeleccionado = signal<ProcesoKPIResumen | null>(null);
  alertaSeleccionada = signal<AlertaConsolidada | null>(null);
  tendenciaProcesoSeleccionado = signal<ProcesoKPIResumen | null>(null);

  // Vista del desglose en drilldown
  drilldownVistaDesglose = signal<'kpis' | 'objetivos'>('kpis');
  desgloseOptions = [
    { label: 'Por KPIs', value: 'kpis' },
    { label: 'Por Objetivos', value: 'objetivos' }
  ];

  // Selectores del servicio
  widgets = this.dashboardService.widgets;
  modoEdicion = this.dashboardService.modoEdicion;
  gridsterOptions = this.dashboardService.gridsterOptions;
  configActual = this.dashboardService.configActual;
  configuraciones = this.dashboardService.configuraciones;
  hasUnsavedChanges = this.dashboardService.hasUnsavedChanges;
  widgetSeleccionado = this.dashboardService.widgetSeleccionado;
  widgetsPorCategoria = this.dashboardService.widgetsPorCategoria;

  // Datos del dashboard
  kpiMetrics = this.dataService.kpiMetricsGlobal;
  alertas = this.dataService.alertasConsolidadas;
  procesosResumen = this.dataService.procesosKPIResumen;
  cumplimientoData = this.dataService.cumplimientoData;
  tendenciaData = this.dataService.tendenciaData;
  alertasDistribucion = this.dataService.alertasDistribucion;

  // Detección de tema oscuro - computed basado en clase del body
  temaActual = computed<'light' | 'dark'>(() => {
    // Verificar tema del sistema
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const isDark = document.body.classList.contains('dark') ||
                     document.body.classList.contains('dark-mode') ||
                     document.documentElement.classList.contains('dark') ||
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'dark' : 'light';
    }
    return 'light';
  });

  // Cache de datos de gráficas por widget ID (computed para evitar recálculos)
  graficasDatosCache = computed(() => {
    const cache = new Map<string, DatosGrafica>();
    const widgets = this.dashboardService.widgets();
    const procesos = this.procesosResumen();

    widgets.forEach((widget: DashboardWidget) => {
      if (widget.tipo === 'graficas-interactivas') {
        const config = widget.config;
        const tipoGrafica = config.graficaTipo || 'donut';
        const circulares = ['pie', 'donut', 'radialBar', 'polarArea', 'funnel', 'pyramid', 'treemap'];
        const esCircular = circulares.includes(tipoGrafica);

        if (esCircular) {
          const agrupacion = config.graficaAgrupacion || 'estado';
          const valorCampo = config.graficaValor || 'count';
          cache.set(widget.id, this.generarDatosCirculares(procesos, agrupacion, valorCampo));
        } else {
          const ejeX = config.graficaEjeX || 'nombre';
          const ejeY = config.graficaEjeY || 'cumplimiento';
          cache.set(widget.id, this.generarDatosEjes(procesos, ejeX, ejeY));
        }
      }
    });

    return cache;
  });

  // Colores para KPIs
  kpiColors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

  // Catálogo filtrado
  catalogoFiltrado = computed(() => {
    const filtro = this.catalogoFiltro().toLowerCase();
    const categoria = this.categoriaActiva();

    return WIDGET_CATALOG.filter(w => {
      const matchFiltro = !filtro ||
        w.nombre.toLowerCase().includes(filtro) ||
        w.descripcion.toLowerCase().includes(filtro);

      const matchCategoria = categoria === 'todos' || w.categoria === categoria;

      return matchFiltro && matchCategoria;
    });
  });

  // Categorías para el catálogo
  categorias = [
    { label: 'Todos', value: 'todos', icon: 'pi pi-th-large' },
    { label: 'KPIs', value: 'kpis', icon: 'pi pi-chart-line' },
    { label: 'Gráficas', value: 'graficas', icon: 'pi pi-chart-bar' },
    { label: 'Tablas', value: 'tablas', icon: 'pi pi-table' },
    { label: 'Listas', value: 'listas', icon: 'pi pi-list' },
    { label: 'Otros', value: 'otros', icon: 'pi pi-ellipsis-h' }
  ];

  // Opciones de columnas para layout
  columnasOptions = [
    { label: '3 columnas', value: 3 },
    { label: '4 columnas', value: 4 },
    { label: '5 columnas', value: 5 },
    { label: '6 columnas', value: 6 }
  ];

  // Opciones de KPI type
  kpiTypeOptions = [
    { label: 'Cumplimiento', value: 'cumplimiento' },
    { label: 'Procesos Activos', value: 'procesos' },
    { label: 'Alertas Activas', value: 'alertas' },
    { label: 'KPIs en Riesgo', value: 'objetivos' }
  ];

  // Opciones de data source para charts
  chartDataSourceOptions = [
    { label: 'Cumplimiento por Proceso', value: 'cumplimiento' },
    { label: 'Tendencia de Procesos', value: 'tendencia' },
    { label: 'Distribución de Alertas', value: 'alertas' }
  ];

  // Opciones de data source para tablas
  tableDataSourceOptions = [
    { label: 'Procesos', value: 'procesos', descripcion: 'Lista de procesos con cumplimiento y estado' },
    { label: 'Riesgos Activos', value: 'riesgos', descripcion: 'Riesgos identificados y su estado' },
    { label: 'Resultados ML', value: 'results-ml', descripcion: 'Predicciones y resultados de modelos ML' },
    { label: 'Activos', value: 'activos', descripcion: 'Inventario de activos de información' },
    { label: 'Alertas', value: 'alertas', descripcion: 'Alertas generadas por el sistema' },
    { label: 'Incidentes', value: 'incidentes', descripcion: 'Incidentes de seguridad registrados' },
    { label: 'KPIs', value: 'kpis', descripcion: 'Indicadores clave de rendimiento' },
    { label: 'Objetivos', value: 'objetivos', descripcion: 'Objetivos y su progreso' }
  ];

  // Opciones de tipo de mapa de riesgos
  mapaRiesgosTypeOptions = [
    { label: 'Probabilidad vs Impacto', value: 'probabilidad-impacto', descripcion: 'Matriz clásica de riesgos' },
    { label: 'Activos vs Amenazas', value: 'activos-amenazas', descripcion: 'Relación entre activos y sus amenazas' },
    { label: 'Controles vs Efectividad', value: 'controles-efectividad', descripcion: 'Efectividad de controles implementados' },
    { label: 'Vulnerabilidades', value: 'vulnerabilidades', descripcion: 'Mapa de vulnerabilidades detectadas' }
  ];

  // ==================== DATOS PARA GRÁFICAS INTERACTIVAS ====================

  // Signal para el campo seleccionado en gráficas interactivas
  graficaInteractivaCampo = signal('estado');

  // Filtros activos para cascada (señales para actualización dinámica)
  graficaFiltrosCascada = signal<{ campo: string; valor: string }[]>([]);

  // Campos disponibles con conteo dinámico de items
  graficaInteractivaCamposDisponibles = computed(() => {
    const procesos = this.procesosResumen();
    const filtros = this.graficaFiltrosCascada();

    // Aplicar filtros en cascada
    let procesosFiltrados = procesos;
    filtros.forEach(filtro => {
      procesosFiltrados = this.aplicarFiltroCascada(procesosFiltrados, filtro.campo, filtro.valor);
    });

    // Calcular conteos para cada campo
    const conteos = this.calcularConteosDeValores(procesosFiltrados);

    return [
      {
        label: `Estado (${conteos['estado'].total})`,
        value: 'estado',
        tipo: 'categoria' as const,
        descripcion: `Activo: ${conteos['estado'].valores['Activo'] || 0}, Borrador: ${conteos['estado'].valores['Borrador'] || 0}`,
        conteo: conteos['estado'].total,
        valores: conteos['estado'].valores
      },
      {
        label: `Cumplimiento (${conteos['cumplimiento'].total})`,
        value: 'cumplimiento',
        tipo: 'numerico' as const,
        descripcion: this.formatearDescripcionConteo(conteos['cumplimiento'].valores),
        conteo: conteos['cumplimiento'].total,
        valores: conteos['cumplimiento'].valores
      },
      {
        label: `Alertas (${conteos['alertas'].total})`,
        value: 'alertas',
        tipo: 'numerico' as const,
        descripcion: this.formatearDescripcionConteo(conteos['alertas'].valores),
        conteo: conteos['alertas'].total,
        valores: conteos['alertas'].valores
      },
      {
        label: `Objetivos (${conteos['objetivos'].total})`,
        value: 'objetivos',
        tipo: 'numerico' as const,
        descripcion: this.formatearDescripcionConteo(conteos['objetivos'].valores),
        conteo: conteos['objetivos'].total,
        valores: conteos['objetivos'].valores
      },
      {
        label: `KPIs (${conteos['kpis'].total})`,
        value: 'kpis',
        tipo: 'numerico' as const,
        descripcion: this.formatearDescripcionConteo(conteos['kpis'].valores),
        conteo: conteos['kpis'].total,
        valores: conteos['kpis'].valores
      },
      {
        label: `Tendencia (${conteos['tendencia'].total})`,
        value: 'tendencia',
        tipo: 'categoria' as const,
        descripcion: this.formatearDescripcionConteo(conteos['tendencia'].valores),
        conteo: conteos['tendencia'].total,
        valores: conteos['tendencia'].valores
      }
    ];
  });

  // Datos para gráficas interactivas (computed)
  graficaInteractivaDatos = computed<DatosGrafica>(() => {
    const campo = this.graficaInteractivaCampo();
    const procesos = this.procesosResumen();

    // Agrupar datos según el campo seleccionado
    const agrupados = new Map<string, number>();

    procesos.forEach(proceso => {
      let categoria: string;
      let valor = 1;

      switch (campo) {
        case 'estado':
          categoria = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        case 'cumplimiento':
          // Agrupar por rangos de cumplimiento
          const cumpl = proceso.cumplimientoPromedio;
          if (cumpl >= 90) categoria = '90-100%';
          else if (cumpl >= 70) categoria = '70-89%';
          else if (cumpl >= 50) categoria = '50-69%';
          else categoria = '<50%';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        case 'alertas':
          // Agrupar por cantidad de alertas
          const alertas = proceso.alertasActivas;
          if (alertas === 0) categoria = 'Sin alertas';
          else if (alertas <= 2) categoria = '1-2 alertas';
          else if (alertas <= 5) categoria = '3-5 alertas';
          else categoria = '>5 alertas';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        case 'objetivos':
          categoria = `${proceso.totalObjetivos} objetivos`;
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        case 'kpis':
          // Agrupar por cantidad de KPIs
          const kpis = proceso.totalKPIs;
          if (kpis <= 5) categoria = '1-5 KPIs';
          else if (kpis <= 10) categoria = '6-10 KPIs';
          else categoria = '>10 KPIs';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        case 'tendencia':
          categoria = proceso.tendencia === 'up' ? 'Mejorando' : proceso.tendencia === 'down' ? 'Declinando' : 'Estable';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
          break;
        default:
          categoria = 'Otro';
          agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
      }
    });

    return {
      labels: Array.from(agrupados.keys()),
      series: Array.from(agrupados.values())
    };
  });

  // Valores disponibles para filtrado en gráficas interactivas (con conteo)
  graficaInteractivaValoresFiltrado = computed(() => {
    const procesos = this.procesosResumen();
    const filtros = this.graficaFiltrosCascada();

    // Aplicar filtros en cascada
    let procesosFiltrados = procesos;
    filtros.forEach(filtro => {
      procesosFiltrados = this.aplicarFiltroCascada(procesosFiltrados, filtro.campo, filtro.valor);
    });

    // Generar valores disponibles con conteo para cada campo
    const conteos = this.calcularConteosDeValores(procesosFiltrados);

    return [
      {
        campo: 'estado',
        valores: Object.entries(conteos['estado'].valores).map(([k, v]) => `${k} (${v})`),
        valoresRaw: Object.keys(conteos['estado'].valores)
      },
      {
        campo: 'cumplimiento',
        valores: Object.entries(conteos['cumplimiento'].valores).map(([k, v]) => `${k} (${v})`),
        valoresRaw: Object.keys(conteos['cumplimiento'].valores)
      },
      {
        campo: 'alertas',
        valores: Object.entries(conteos['alertas'].valores).map(([k, v]) => `${k} (${v})`),
        valoresRaw: Object.keys(conteos['alertas'].valores)
      },
      {
        campo: 'tendencia',
        valores: Object.entries(conteos['tendencia'].valores).map(([k, v]) => `${k} (${v})`),
        valoresRaw: Object.keys(conteos['tendencia'].valores)
      },
      {
        campo: 'procesoNombre',
        valores: procesosFiltrados.map(p => p.procesoNombre).filter(Boolean).sort(),
        valoresRaw: procesosFiltrados.map(p => p.procesoNombre).filter(Boolean).sort()
      }
    ];
  });

  // Handler para cambio de campo en gráficas interactivas
  onGraficaInteractivaCampoChange(event: { campo: string; tipo: string }): void {
    this.graficaInteractivaCampo.set(event.campo);
  }

  // Handler para click en data point de gráficas interactivas
  onGraficaInteractivaDataPointClick(event: { categoria: string; valor: number; serie?: string }): void {
    console.log('Data point clicked en gráfica interactiva:', event);
    // Se podría implementar drill-down o filtrado
  }

  // Handler para click en leyenda de gráficas interactivas
  onGraficaInteractivaLegendClick(event: { serie: string; visible: boolean }): void {
    console.log('Legend clicked en gráfica interactiva:', event);
  }

  // Handler para filtro aplicado desde gráficas interactivas
  onGraficaInteractivaFiltroAplicado(filtro: FiltroGrafica | null): void {
    console.log('Filtro aplicado desde gráfica interactiva:', filtro);
    // Se podría usar para filtrar otros widgets
  }

  /** Obtiene datos de gráfica desde el cache (preferido) o genera si no existe */
  getGraficaDatosParaWidget(widget: DashboardWidget): DatosGrafica {
    // Primero intentar obtener del cache
    const cached = this.graficasDatosCache().get(widget.id);
    if (cached) {
      return cached;
    }

    // Fallback: generar datos si no hay cache
    const config = widget.config;
    const tipoGrafica = config.graficaTipo || 'donut';
    const circulares = ['pie', 'donut', 'radialBar', 'polarArea', 'funnel', 'pyramid', 'treemap'];
    const esCircular = circulares.includes(tipoGrafica);
    const procesos = this.procesosResumen();

    if (esCircular) {
      const agrupacion = config.graficaAgrupacion || 'estado';
      const valorCampo = config.graficaValor || 'count';
      return this.generarDatosCirculares(procesos, agrupacion, valorCampo);
    } else {
      const ejeX = config.graficaEjeX || 'nombre';
      const ejeY = config.graficaEjeY || 'cumplimiento';
      return this.generarDatosEjes(procesos, ejeX, ejeY);
    }
  }

  /** Obtiene datos de gráfica cacheados por ID de widget */
  getGraficaDatosCacheados(widgetId: string): DatosGrafica {
    // Intentar obtener del cache
    const cached = this.graficasDatosCache().get(widgetId);
    if (cached) {
      return cached;
    }

    // Si no está en cache, buscar el widget y generar datos
    const widget = this.dashboardService.widgets().find(w => w.id === widgetId);
    if (widget) {
      return this.getGraficaDatosParaWidget(widget);
    }

    // Fallback: devolver datos vacíos
    return { labels: [], series: [] };
  }

  // ==================== MÉTODOS PARA CASCADA Y CONTEO ====================

  /** Aplica un filtro en cascada a los procesos */
  private aplicarFiltroCascada(procesos: ProcesoKPIResumen[], campo: string, valor: string): ProcesoKPIResumen[] {
    return procesos.filter(proceso => {
      switch (campo) {
        case 'estado':
          const estadoLabel = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
          return estadoLabel === valor;
        case 'tendencia':
          const tendenciaLabel = proceso.tendencia === 'up' ? 'Mejorando' :
                                 proceso.tendencia === 'down' ? 'Declinando' : 'Estable';
          return tendenciaLabel === valor;
        case 'cumplimiento':
          const cumpl = proceso.cumplimientoPromedio;
          let cumplLabel: string;
          if (cumpl >= 90) cumplLabel = '90-100%';
          else if (cumpl >= 70) cumplLabel = '70-89%';
          else if (cumpl >= 50) cumplLabel = '50-69%';
          else cumplLabel = '<50%';
          return cumplLabel === valor;
        case 'alertas':
          const alertas = proceso.alertasActivas;
          let alertasLabel: string;
          if (alertas === 0) alertasLabel = 'Sin alertas';
          else if (alertas <= 2) alertasLabel = '1-2 alertas';
          else if (alertas <= 5) alertasLabel = '3-5 alertas';
          else alertasLabel = '>5 alertas';
          return alertasLabel === valor;
        default:
          return true;
      }
    });
  }

  /** Calcula los conteos de valores para cada campo */
  private calcularConteosDeValores(procesos: ProcesoKPIResumen[]): { [key: string]: { total: number; valores: { [k: string]: number } } } {
    const resultado = {
      estado: { total: 0, valores: {} as { [k: string]: number } },
      cumplimiento: { total: 0, valores: {} as { [k: string]: number } },
      alertas: { total: 0, valores: {} as { [k: string]: number } },
      objetivos: { total: 0, valores: {} as { [k: string]: number } },
      kpis: { total: 0, valores: {} as { [k: string]: number } },
      tendencia: { total: 0, valores: {} as { [k: string]: number } }
    };

    procesos.forEach(proceso => {
      // Estado
      const estadoLabel = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
      resultado.estado.valores[estadoLabel] = (resultado.estado.valores[estadoLabel] || 0) + 1;
      resultado.estado.total++;

      // Cumplimiento
      const cumpl = proceso.cumplimientoPromedio;
      let cumplLabel: string;
      if (cumpl >= 90) cumplLabel = '90-100%';
      else if (cumpl >= 70) cumplLabel = '70-89%';
      else if (cumpl >= 50) cumplLabel = '50-69%';
      else cumplLabel = '<50%';
      resultado.cumplimiento.valores[cumplLabel] = (resultado.cumplimiento.valores[cumplLabel] || 0) + 1;
      resultado.cumplimiento.total++;

      // Alertas
      const alertas = proceso.alertasActivas;
      let alertasLabel: string;
      if (alertas === 0) alertasLabel = 'Sin alertas';
      else if (alertas <= 2) alertasLabel = '1-2 alertas';
      else if (alertas <= 5) alertasLabel = '3-5 alertas';
      else alertasLabel = '>5 alertas';
      resultado.alertas.valores[alertasLabel] = (resultado.alertas.valores[alertasLabel] || 0) + 1;
      resultado.alertas.total++;

      // Objetivos
      const objLabel = `${proceso.totalObjetivos} obj`;
      resultado.objetivos.valores[objLabel] = (resultado.objetivos.valores[objLabel] || 0) + 1;
      resultado.objetivos.total++;

      // KPIs
      const kpis = proceso.totalKPIs;
      let kpisLabel: string;
      if (kpis <= 5) kpisLabel = '1-5 KPIs';
      else if (kpis <= 10) kpisLabel = '6-10 KPIs';
      else kpisLabel = '>10 KPIs';
      resultado.kpis.valores[kpisLabel] = (resultado.kpis.valores[kpisLabel] || 0) + 1;
      resultado.kpis.total++;

      // Tendencia
      const tendenciaLabel = proceso.tendencia === 'up' ? 'Mejorando' :
                             proceso.tendencia === 'down' ? 'Declinando' : 'Estable';
      resultado.tendencia.valores[tendenciaLabel] = (resultado.tendencia.valores[tendenciaLabel] || 0) + 1;
      resultado.tendencia.total++;
    });

    return resultado;
  }

  /** Formatea los valores como descripción legible */
  private formatearDescripcionConteo(valores: Record<string, number>): string {
    return Object.entries(valores)
      .map(([k, v]) => `${k}: ${v}`)
      .slice(0, 3)
      .join(', ') + (Object.keys(valores).length > 3 ? '...' : '');
  }

  /** Agrega un filtro en cascada */
  agregarFiltroCascada(campo: string, valor: string): void {
    const filtrosActuales = this.graficaFiltrosCascada();
    // Remover filtros del mismo campo o posteriores
    const indice = filtrosActuales.findIndex(f => f.campo === campo);
    let nuevosFiltros: { campo: string; valor: string }[];
    if (indice >= 0) {
      nuevosFiltros = filtrosActuales.slice(0, indice);
    } else {
      nuevosFiltros = [...filtrosActuales];
    }
    nuevosFiltros.push({ campo, valor });
    this.graficaFiltrosCascada.set(nuevosFiltros);
  }

  /** Limpia todos los filtros en cascada */
  limpiarFiltrosCascada(): void {
    this.graficaFiltrosCascada.set([]);
  }

  /** Genera datos para gráficas circulares */
  private generarDatosCirculares(procesos: ProcesoKPIResumen[], agrupacion: string, valorCampo: string): DatosGrafica {
    const agrupados = new Map<string, number>();

    procesos.forEach(proceso => {
      let categoria: string;
      let valor = valorCampo === 'count' ? 1 : 0;

      // Obtener categoría según campo de agrupación
      switch (agrupacion) {
        case 'estado':
          categoria = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
          break;
        case 'rangoCumplimiento':
          const cumpl = proceso.cumplimientoPromedio;
          if (cumpl >= 90) categoria = '90-100%';
          else if (cumpl >= 70) categoria = '70-89%';
          else if (cumpl >= 50) categoria = '50-69%';
          else categoria = '<50%';
          break;
        case 'tendencia':
          categoria = proceso.tendencia === 'up' ? 'Mejorando' :
                      proceso.tendencia === 'down' ? 'Declinando' : 'Estable';
          break;
        case 'alertas':
          const alertas = proceso.alertasActivas;
          if (alertas === 0) categoria = 'Sin alertas';
          else if (alertas <= 2) categoria = '1-2 alertas';
          else if (alertas <= 5) categoria = '3-5 alertas';
          else categoria = '>5 alertas';
          break;
        default:
          categoria = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
      }

      // Obtener valor según campo de valor
      if (valorCampo === 'count') {
        valor = 1;
      } else if (valorCampo === 'cumplimiento') {
        valor = proceso.cumplimientoPromedio;
      } else if (valorCampo === 'totalObjetivos') {
        valor = proceso.totalObjetivos;
      } else if (valorCampo === 'totalKPIs') {
        valor = proceso.totalKPIs;
      } else if (valorCampo === 'alertasActivas') {
        valor = proceso.alertasActivas;
      }

      if (valorCampo === 'count') {
        agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
      } else {
        // Para promedios, acumular y luego promediar
        const current = agrupados.get(categoria) || 0;
        agrupados.set(categoria, current + valor);
      }
    });

    return {
      labels: Array.from(agrupados.keys()),
      series: Array.from(agrupados.values())
    };
  }

  /** Genera datos para gráficas de ejes (barras, líneas) */
  private generarDatosEjes(procesos: ProcesoKPIResumen[], ejeX: string, ejeY: string): DatosGrafica {
    const labels: string[] = [];
    const valores: number[] = [];

    // Limitar a los primeros 10 procesos para la visualización
    const procesosLimitados = procesos.slice(0, 10);

    procesosLimitados.forEach(proceso => {
      // Obtener etiqueta para eje X
      let label: string;
      switch (ejeX) {
        case 'nombre':
          label = proceso.procesoNombre || 'Sin nombre';
          break;
        case 'estado':
          label = proceso.estado === 'activo' ? 'Activo' : 'Borrador';
          break;
        case 'tendencia':
          label = proceso.tendencia === 'up' ? 'Mejorando' :
                  proceso.tendencia === 'down' ? 'Declinando' : 'Estable';
          break;
        default:
          label = proceso.procesoNombre || 'Sin nombre';
      }

      // Obtener valor para eje Y
      let valor: number;
      switch (ejeY) {
        case 'cumplimiento':
          valor = proceso.cumplimientoPromedio;
          break;
        case 'totalObjetivos':
          valor = proceso.totalObjetivos;
          break;
        case 'totalKPIs':
          valor = proceso.totalKPIs;
          break;
        case 'alertasActivas':
          valor = proceso.alertasActivas;
          break;
        case 'count':
          valor = 1;
          break;
        default:
          valor = proceso.cumplimientoPromedio;
      }

      labels.push(label);
      valores.push(valor);
    });

    return {
      labels,
      series: [{ name: this.getLabelCampoY(ejeY), data: valores }]
    };
  }

  /** Obtiene el label para el campo Y */
  private getLabelCampoY(campo: string): string {
    const labels: Record<string, string> = {
      'cumplimiento': 'Cumplimiento (%)',
      'totalObjetivos': 'Objetivos',
      'totalKPIs': 'KPIs',
      'alertasActivas': 'Alertas',
      'count': 'Cantidad'
    };
    return labels[campo] || campo;
  }

  // ==================== CONFIGURACIÓN DE APEXCHARTS INTERACTIVOS ====================

  // Gráfica de Barras - Cumplimiento por Proceso (con click)
  chartBarOptions = computed(() => {
    const data = this.cumplimientoData();
    return {
      series: [{
        name: 'Cumplimiento',
        data: data.values
      }] as ApexAxisChartSeries,
      chart: {
        type: 'bar',
        height: 250,
        toolbar: { show: false },
        fontFamily: 'inherit',
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            this.onCumplimientoBarClick(config.dataPointIndex);
          }
        }
      } as ApexChart,
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          distributed: true
        }
      } as ApexPlotOptions,
      dataLabels: {
        enabled: false
      } as ApexDataLabels,
      xaxis: {
        categories: data.labels,
        labels: {
          style: { fontSize: '11px' },
          rotate: -45,
          rotateAlways: true
        }
      } as ApexXAxis,
      yaxis: {
        max: 100,
        labels: {
          formatter: (val: number) => `${val}%`
        }
      } as ApexYAxis,
      colors: data.colors,
      legend: { show: false } as ApexLegend,
      tooltip: {
        y: {
          formatter: (val: number) => `${val}%`
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const proceso = this.procesosResumen()[dataPointIndex];
          return `
            <div class="apex-tooltip-custom">
              <div class="tooltip-title">${proceso?.procesoNombre || ''}</div>
              <div class="tooltip-value">${series[seriesIndex][dataPointIndex]}%</div>
              <div class="tooltip-hint">Click para ver detalle</div>
            </div>
          `;
        }
      } as ApexTooltip
    };
  });

  // Handler para click en barra de cumplimiento
  onCumplimientoBarClick(index: number): void {
    const procesos = this.procesosResumen();
    if (procesos && procesos[index]) {
      this.abrirProcesoDrilldown(procesos[index]);
    }
  }

  // Gráfica de Líneas - Tendencia (con click en leyenda)
  chartLineOptions = computed(() => {
    const data = this.tendenciaData();
    return {
      series: data.series as ApexAxisChartSeries,
      chart: {
        type: 'line',
        height: 250,
        toolbar: { show: false },
        fontFamily: 'inherit',
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        events: {
          legendClick: (chartContext: any, seriesIndex: number, config: any) => {
            this.onTendenciaSeriesClick(seriesIndex);
          }
        }
      } as ApexChart,
      stroke: {
        curve: 'smooth',
        width: 2
      } as ApexStroke,
      dataLabels: {
        enabled: false
      } as ApexDataLabels,
      xaxis: {
        categories: data.labels
      } as ApexXAxis,
      yaxis: {
        max: 100,
        labels: {
          formatter: (val: number) => `${val}%`
        }
      } as ApexYAxis,
      colors: ['#6366f1', '#22c55e', '#f59e0b'],
      legend: {
        position: 'bottom',
        fontSize: '11px',
        onItemClick: {
          toggleDataSeries: false
        }
      } as ApexLegend,
      grid: {
        borderColor: 'var(--surface-200)'
      } as ApexGrid,
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val}%`
        }
      } as ApexTooltip
    };
  });

  // Handler para click en serie de tendencia
  onTendenciaSeriesClick(seriesIndex: number): void {
    const procesos = this.procesosResumen().filter(p => p.estado === 'activo').slice(0, 3);
    if (procesos && procesos[seriesIndex]) {
      this.abrirTendenciaDrilldown(procesos[seriesIndex]);
    }
  }

  // Gráfica de Dona - Alertas (con click)
  chartDonutOptions = computed(() => {
    const dist = this.alertasDistribucion();
    return {
      series: [dist.critical, dist.warning, dist.info] as ApexNonAxisChartSeries,
      chart: {
        type: 'donut',
        height: 250,
        fontFamily: 'inherit',
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            this.onAlertasDonutClick(config.dataPointIndex);
          }
        }
      } as ApexChart,
      labels: ['Críticas', 'Advertencias', 'Info'],
      colors: ['#ef4444', '#f59e0b', '#3b82f6'],
      legend: {
        position: 'bottom',
        fontSize: '11px'
      } as ApexLegend,
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => `${dist.critical + dist.warning + dist.info}`
              }
            }
          }
        }
      } as ApexPlotOptions,
      dataLabels: {
        enabled: false
      } as ApexDataLabels,
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const labels = ['Críticas', 'Advertencias', 'Info'];
          return `
            <div class="apex-tooltip-custom">
              <div class="tooltip-title">${labels[seriesIndex]}</div>
              <div class="tooltip-value">${series[seriesIndex]} alertas</div>
              <div class="tooltip-hint">Click para ver detalle</div>
            </div>
          `;
        }
      } as ApexTooltip
    };
  });

  // Handler para click en donut de alertas
  onAlertasDonutClick(index: number): void {
    const severidades: ('critical' | 'warning' | 'info')[] = ['critical', 'warning', 'info'];
    const severidadSeleccionada = severidades[index];
    const alertas = this.alertas();
    const alerta = alertas.find(a => a.severity === severidadSeleccionada);
    if (alerta) {
      this.abrirAlertaDrilldown(alerta);
    }
  }

  // Gráfica de Área - Tendencia
  chartAreaOptions = computed(() => {
    const data = this.tendenciaData();
    return {
      series: data.series.slice(0, 1) as ApexAxisChartSeries,
      chart: {
        type: 'area',
        height: 250,
        toolbar: { show: false },
        fontFamily: 'inherit',
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {
            this.onTendenciaSeriesClick(0);
          }
        }
      } as ApexChart,
      stroke: {
        curve: 'smooth',
        width: 2
      } as ApexStroke,
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1
        }
      } as ApexFill,
      dataLabels: {
        enabled: false
      } as ApexDataLabels,
      xaxis: {
        categories: data.labels
      } as ApexXAxis,
      yaxis: {
        max: 100,
        labels: {
          formatter: (val: number) => `${val}%`
        }
      } as ApexYAxis,
      colors: ['#6366f1'],
      grid: {
        borderColor: 'var(--surface-200)'
      } as ApexGrid
    };
  });

  // ==================== DRILLDOWN DRAWERS ====================

  abrirProcesoDrilldown(proceso: ProcesoKPIResumen): void {
    this.procesoSeleccionado.set(proceso);
    this.drilldownVistaDesglose.set('kpis');
    this.showProcesoDrilldown.set(true);
  }

  abrirAlertaDrilldown(alerta: AlertaConsolidada): void {
    this.alertaSeleccionada.set(alerta);
    this.showAlertaDrilldown.set(true);
  }

  abrirTendenciaDrilldown(proceso: ProcesoKPIResumen): void {
    this.tendenciaProcesoSeleccionado.set(proceso);
    this.showTendenciaDrilldown.set(true);
  }

  // Computed para datos del drilldown de proceso
  drilldownKPIsData = computed(() => {
    const proceso = this.procesoSeleccionado();
    if (!proceso) return [];

    const vista = this.drilldownVistaDesglose();
    const procesoCompleto = this.dataService.procesosCompletos().find(p => p.id === proceso.procesoId);
    if (!procesoCompleto) return [];

    if (vista === 'objetivos') {
      return procesoCompleto.objetivos.map((obj, i) => ({
        id: obj.id,
        nombre: obj.nombre,
        valor: obj.cumplimiento,
        color: this.kpiColors[i % this.kpiColors.length]
      }));
    } else {
      const allKPIs: { id: string; nombre: string; valor: number; color: string }[] = [];
      procesoCompleto.objetivos.forEach((obj, objIndex) => {
        obj.kpis.forEach((kpi, kpiIndex) => {
          allKPIs.push({
            id: kpi.id,
            nombre: kpi.nombre,
            valor: kpi.cumplimiento,
            color: this.kpiColors[(objIndex * 2 + kpiIndex) % this.kpiColors.length]
          });
        });
      });
      return allKPIs;
    }
  });

  // Menú de configuraciones
  configMenu = computed<MenuItem[]>(() => {
    const configs = this.configuraciones();
    return [
      ...configs.map(c => ({
        label: c.nombre,
        icon: c.isDefault ? 'pi pi-star' : 'pi pi-file',
        command: () => this.dashboardService.cambiarConfiguracion(c.id),
        styleClass: this.configActual()?.id === c.id ? 'p-menuitem-active' : ''
      })),
      { separator: true },
      {
        label: 'Nueva configuración',
        icon: 'pi pi-plus',
        command: () => this.crearNuevaConfiguracion()
      }
    ];
  });

  ngOnInit(): void {
    // El servicio ya carga la configuración en el constructor
  }

  // ==================== HELPERS PARA DATOS DE WIDGETS ====================

  /** Obtiene el valor del KPI según el tipo (sin unidad) */
  getKPIValue(kpiType: string): string {
    const metric = this.dataService.getMetricByType(kpiType as any);
    if (!metric) return '--';
    return `${metric.valor}`;
  }

  /** Obtiene el valor numérico del KPI para cálculos */
  getKPINumericValue(kpiType: string): number {
    const metric = this.dataService.getMetricByType(kpiType as any);
    if (!metric) return 0;
    return metric.valor;
  }

  /** Obtiene la tendencia del KPI */
  getKPITrend(kpiType: string): { direction: string; value: string; isPositive: boolean } {
    const metric = this.dataService.getMetricByType(kpiType as any);
    if (!metric) return { direction: 'neutral', value: '0%', isPositive: true };

    const isPositive = metric.tendencia === 'up';
    return {
      direction: metric.tendencia,
      value: `${metric.porcentajeCambio > 0 ? '+' : ''}${Math.round(metric.porcentajeCambio)}%`,
      isPositive: kpiType === 'alertas' ? !isPositive : isPositive
    };
  }

  /** Obtiene la clase de color para el KPI card - estilo minimalist PrimeBlocks */
  getKPIColorClass(kpiType: string): string {
    const colorMap: Record<string, string> = {
      'cumplimiento': 'kpi-cyan',
      'procesos': 'kpi-purple',
      'alertas': 'kpi-amber',
      'objetivos': 'kpi-emerald',
      'riesgos': 'kpi-rose',
      'incidentes': 'kpi-orange'
    };
    return colorMap[kpiType] || 'kpi-cyan';
  }

  /** Obtiene métricas para el grid de KPIs */
  getKPIGridMetrics(): { label: string; value: string }[] {
    const metrics = this.kpiMetrics();
    return metrics.map(m => ({
      label: m.nombre,
      value: m.unidad ? `${m.valor}${m.unidad}` : `${m.valor}`
    }));
  }

  /** Toggle menú de acciones para KPI cards */
  @ViewChild('kpiMenu') kpiMenu: any;
  @ViewChild('kpiGridMenu') kpiGridMenu: any;

  toggleKpiMenu(event: Event, widget: DashboardWidget): void {
    if (this.kpiMenu) {
      this.kpiMenu.toggle(event);
    } else if (this.kpiGridMenu) {
      this.kpiGridMenu.toggle(event);
    }
  }

  /** Obtiene items del menú para KPI cards */
  getKpiMenuItems(widget: DashboardWidget): any[] {
    return [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarWidget(widget)
      },
      {
        label: 'Descargar',
        icon: 'pi pi-download',
        command: () => this.abrirExportModal(widget)
      },
      {
        separator: true
      },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'menu-item-danger',
        command: () => this.eliminarWidget(widget)
      }
    ];
  }

  /** Obtiene las alertas ordenadas por severidad */
  getAlertasOrdenadas(): AlertaConsolidada[] {
    return this.alertas().slice(0, 5);
  }

  /** Obtiene el cumplimiento general */
  getCumplimientoGeneral(): number {
    return this.dataService.getCumplimientoGeneral();
  }

  /** Obtiene datos para progreso de objetivos */
  getProgresoObjetivos(): { nombre: string; valor: number }[] {
    const procesos = this.dataService.procesosCompletos();
    const objetivos: { nombre: string; valor: number }[] = [];

    procesos.slice(0, 2).forEach(proc => {
      proc.objetivos.forEach(obj => {
        objetivos.push({
          nombre: obj.nombre.length > 20 ? obj.nombre.substring(0, 20) + '...' : obj.nombre,
          valor: obj.cumplimiento
        });
      });
    });

    return objetivos.slice(0, 4);
  }

  /** Obtiene actividad reciente */
  getActividadReciente(): { icono: string; color: string; texto: string; tiempo: string; tipo?: string; detalle?: string }[] {
    return this.dataService.getActividadReciente();
  }

  // ==================== FILTROS DE ACTIVIDAD RECIENTE ====================

  // Señales para filtros de actividad
  filtroActividadTipo = signal<'todos' | 'cambios' | 'alertas' | 'nuevos'>('todos');
  filtroActividadPeriodo = signal<'hoy' | 'semana' | 'mes' | 'todo'>('semana');

  // Opciones de período para el select
  opcionesPeriodoActividad = [
    { label: 'Hoy', value: 'hoy' },
    { label: 'Semana', value: 'semana' },
    { label: 'Mes', value: 'mes' },
    { label: 'Todo', value: 'todo' }
  ];

  // Filtro por usuario
  filtroActividadUsuario = signal<string>('todos');

  // Opciones de usuarios para el select
  opcionesUsuarioActividad = [
    { label: 'Todos', value: 'todos' },
    { label: 'Juan Pérez', value: 'juan.perez' },
    { label: 'María García', value: 'maria.garcia' },
    { label: 'Carlos López', value: 'carlos.lopez' },
    { label: 'Ana Martínez', value: 'ana.martinez' }
  ];

  // Drilldown de actividad
  showActividadDrilldown = signal(false);
  actividadSeleccionada = signal<ActividadDetallada | null>(null);

  // ==================== FILTROS Y ORDENAMIENTO DE TABLA (W3) ====================

  tablaFiltroTexto = signal('');
  tablaFiltroEstado = signal<string>('todos');
  tablaOrdenCampo = signal<'nombre' | 'estado' | 'cumplimiento'>('cumplimiento');
  tablaOrdenDir = signal<'asc' | 'desc'>('desc');

  tablaEstadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activo', value: 'activo' },
    { label: 'Borrador', value: 'borrador' }
  ];

  /** Obtiene tabla filtrada y ordenada */
  getTablaFiltradaOrdenada(): ProcesoKPIResumen[] {
    let procesos = [...this.procesosResumen()];
    const filtroTexto = this.tablaFiltroTexto().toLowerCase();
    const filtroEstado = this.tablaFiltroEstado();
    const ordenCampo = this.tablaOrdenCampo();
    const ordenDir = this.tablaOrdenDir();

    // Filtrar por texto
    if (filtroTexto) {
      procesos = procesos.filter(p =>
        p.procesoNombre.toLowerCase().includes(filtroTexto)
      );
    }

    // Filtrar por estado
    if (filtroEstado !== 'todos') {
      procesos = procesos.filter(p => p.estado === filtroEstado);
    }

    // Ordenar
    procesos.sort((a, b) => {
      let comparison = 0;
      switch (ordenCampo) {
        case 'nombre':
          comparison = a.procesoNombre.localeCompare(b.procesoNombre);
          break;
        case 'estado':
          comparison = a.estado.localeCompare(b.estado);
          break;
        case 'cumplimiento':
          comparison = a.cumplimientoPromedio - b.cumplimientoPromedio;
          break;
      }
      return ordenDir === 'asc' ? comparison : -comparison;
    });

    return procesos.slice(0, 10);
  }

  /** Ordena la tabla por campo */
  ordenarTabla(campo: 'nombre' | 'estado' | 'cumplimiento'): void {
    if (this.tablaOrdenCampo() === campo) {
      // Toggle dirección si es el mismo campo
      this.tablaOrdenDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.tablaOrdenCampo.set(campo);
      this.tablaOrdenDir.set(campo === 'cumplimiento' ? 'desc' : 'asc');
    }
  }

  /** Exporta tabla a CSV */
  exportarTabla(widget: DashboardWidget): void {
    const procesos = this.getTablaFiltradaOrdenada();
    const data: TableExportData = {
      headers: ['Proceso', 'Estado', 'Cumplimiento', 'Objetivos', 'KPIs', 'Alertas'],
      rows: procesos.map(p => [
        p.procesoNombre,
        p.estado,
        `${p.cumplimientoPromedio}%`,
        p.totalObjetivos,
        p.totalKPIs,
        p.alertasActivas
      ]),
      title: widget.titulo || 'Tabla de Procesos'
    };

    this.exportService.exportAsCSV(data, {
      filename: `tabla_${widget.titulo || 'datos'}`
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Tabla exportada a CSV'
    });
  }

  /** Obtiene actividad reciente filtrada */
  getActividadRecienteFiltrada(): ActividadDetallada[] {
    let actividades: ActividadDetallada[] = this.getActividadReciente().map((a, index) => ({
      ...a,
      id: `act-${index}`,
      tipo: a.tipo || this.inferirTipoActividad(a.icono),
      usuario: this.asignarUsuarioAleatorio(index),
      proceso: this.asignarProcesoAleatorio(index),
      entidad: this.asignarEntidadAleatoria(index),
      fechaCompleta: this.generarFechaAleatoria(index)
    }));

    const tipoFiltro = this.filtroActividadTipo();
    const periodoFiltro = this.filtroActividadPeriodo();
    const usuarioFiltro = this.filtroActividadUsuario();

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
      actividades = actividades.filter(a => a.tipo === tipoFiltro);
    }

    // Filtrar por usuario
    if (usuarioFiltro !== 'todos') {
      const usuarioNombre = this.opcionesUsuarioActividad.find(u => u.value === usuarioFiltro)?.label;
      actividades = actividades.filter(a => a.usuario === usuarioNombre);
    }

    // Filtrar por período (simulado ya que no tenemos fechas reales)
    const limites: Record<string, number> = {
      'hoy': 5,
      'semana': 10,
      'mes': 15,
      'todo': 100
    };

    return actividades.slice(0, limites[periodoFiltro] || 10);
  }

  /** Infiere el tipo de actividad basado en el icono */
  private inferirTipoActividad(icono: string): string {
    if (icono.includes('plus') || icono.includes('file')) return 'nuevos';
    if (icono.includes('pencil') || icono.includes('check') || icono.includes('sync')) return 'cambios';
    if (icono.includes('exclamation') || icono.includes('times') || icono.includes('bell')) return 'alertas';
    return 'cambios';
  }

  /** Asigna usuario aleatorio para demo */
  private asignarUsuarioAleatorio(index: number): string {
    const usuarios = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez'];
    return usuarios[index % usuarios.length];
  }

  /** Asigna proceso aleatorio para demo */
  private asignarProcesoAleatorio(index: number): string {
    const procesos = this.procesosResumen();
    return procesos[index % procesos.length]?.procesoNombre || 'Proceso General';
  }

  /** Asigna entidad aleatoria para demo */
  private asignarEntidadAleatoria(index: number): string {
    const entidades = ['KPI', 'Objetivo', 'Control', 'Riesgo', 'Indicador'];
    return entidades[index % entidades.length];
  }

  /** Genera fecha aleatoria para demo */
  private generarFechaAleatoria(index: number): string {
    const fecha = new Date();
    fecha.setHours(fecha.getHours() - index * 2);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /** Abre drilldown de actividad */
  abrirActividadDrilldown(actividad: ActividadDetallada): void {
    // Enriquecer con datos de cambios simulados si es tipo 'cambios'
    const actividadEnriquecida: ActividadDetallada = {
      ...actividad,
      cambios: actividad.tipo === 'cambios' ? [
        { campo: 'Estado', valorAnterior: 'Pendiente', valorNuevo: 'En proceso' },
        { campo: 'Cumplimiento', valorAnterior: '75%', valorNuevo: '82%' }
      ] : undefined
    };

    this.actividadSeleccionada.set(actividadEnriquecida);
    this.showActividadDrilldown.set(true);
  }

  /** Obtiene label del tipo de actividad */
  getLabelTipoActividad(tipo: string): string {
    const labels: Record<string, string> = {
      'cambios': 'Cambio',
      'alertas': 'Alerta',
      'nuevos': 'Nuevo'
    };
    return labels[tipo] || 'Actividad';
  }

  /** Navega al proceso desde actividad */
  navegarAProcesoDesdeActividad(): void {
    const actividad = this.actividadSeleccionada();
    if (actividad?.proceso) {
      // Buscar el proceso y abrir su drilldown
      const proceso = this.procesosResumen().find(p => p.procesoNombre === actividad.proceso);
      if (proceso) {
        this.showActividadDrilldown.set(false);
        this.abrirProcesoDrilldown(proceso);
      }
    }
  }

  /** Exporta actividades a CSV */
  exportarActividades(): void {
    const actividades = this.getActividadRecienteFiltrada();
    const data: TableExportData = {
      headers: ['Actividad', 'Tipo', 'Usuario', 'Proceso', 'Tiempo'],
      rows: actividades.map(a => [a.texto, a.tipo || '', a.usuario || '', a.proceso || '', a.tiempo]),
      title: 'Últimas Actividades'
    };

    this.exportService.exportAsCSV(data, {
      filename: 'actividades_recientes'
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Actividades exportadas a CSV'
    });
  }

  // ==================== ACCIONES DE TOOLBAR ====================

  toggleModoEdicion(): void {
    this.dashboardService.toggleModoEdicion();
  }

  guardarCambios(): void {
    this.dashboardService.guardarConfiguracion();
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Configuración guardada correctamente'
    });
  }

  descartarCambios(): void {
    this.confirmationService.confirm({
      message: '¿Descartar los cambios no guardados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        window.location.reload();
      }
    });
  }

  abrirCatalogo(): void {
    this.showCatalogoDrawer.set(true);
  }

  abrirLayoutConfig(): void {
    this.showLayoutDrawer.set(true);
  }

  // ==================== PRE-CONFIGURACIÓN DE WIDGETS ====================

  // Widget que se está pre-configurando (antes de agregarlo al dashboard)
  widgetPreConfig = signal<WidgetCatalogItem | null>(null);
  showPreConfigDrawer = signal(false);

  // Configuración temporal para el widget que se va a agregar
  preConfigTitulo = signal('');
  preConfigSubtitulo = signal('');
  preConfigKpiType = signal<'cumplimiento' | 'procesos' | 'alertas' | 'objetivos'>('cumplimiento');
  preConfigChartDataSource = signal<'cumplimiento' | 'tendencia' | 'alertas'>('cumplimiento');
  preConfigListLimit = signal(5);
  preConfigTableLimit = signal(5);
  preConfigTableDataSource = signal<'procesos' | 'alertas' | 'riesgos' | 'incidentes' | 'activos' | 'results-ml' | 'kpis' | 'objetivos'>('procesos');
  preConfigMapaRiesgosType = signal<'probabilidad-impacto' | 'activos-amenazas' | 'controles-efectividad' | 'vulnerabilidades'>('probabilidad-impacto');
  preConfigShowHeader = signal(true);

  // ==================== CONFIGURACIÓN DE GRÁFICAS INTERACTIVAS EN PRECONFIG ====================

  // Tab activa en la configuración de gráficas
  graficaConfigTab = signal<'tipo' | 'datos' | 'estilo' | 'ia'>('tipo');

  // Configuración de gráfica
  preConfigGraficaTipo = signal<string>('donut');
  preConfigGraficaPaleta = signal<string>('default');
  preConfigGraficaAnimaciones = signal(true);
  preConfigGraficaLeyenda = signal(true);
  preConfigGraficaEtiquetas = signal(false);

  // Configuración de datos dinámicos
  preConfigGraficaFuenteDatos = signal<string>('procesos');
  preConfigGraficaAgrupacion = signal<string>('estado');  // Para circulares
  preConfigGraficaValor = signal<string>('count');        // Para circulares (count = contar, o campo numérico)
  preConfigGraficaEjeX = signal<string>('nombre');        // Para barras/líneas
  preConfigGraficaEjeY = signal<string>('cumplimiento');  // Para barras/líneas
  preConfigGraficaSeries = signal<string>('');            // Para múltiples series
  preConfigGraficaFiltroNivel = signal<string>('');       // Filtro de nivel/área
  preConfigGraficaFiltroTipo = signal<string>('');        // Filtro de tipo

  // Fuentes de datos disponibles
  fuentesDatosOptions = [
    { label: 'Procesos', value: 'procesos', icon: 'pi pi-sitemap', descripcion: 'Procesos de gestión' },
    { label: 'Activos', value: 'activos', icon: 'pi pi-server', descripcion: 'Activos de información' },
    { label: 'Riesgos', value: 'riesgos', icon: 'pi pi-exclamation-triangle', descripcion: 'Riesgos identificados' },
    { label: 'Alertas', value: 'alertas', icon: 'pi pi-bell', descripcion: 'Alertas del sistema' },
    { label: 'Controles', value: 'controles', icon: 'pi pi-shield', descripcion: 'Controles implementados' },
    { label: 'KPIs', value: 'kpis', icon: 'pi pi-chart-line', descripcion: 'Indicadores clave' },
    { label: 'Objetivos', value: 'objetivos', icon: 'pi pi-flag', descripcion: 'Objetivos de control' },
    { label: 'Incidentes', value: 'incidentes', icon: 'pi pi-times-circle', descripcion: 'Incidentes registrados' }
  ];

  // Campos disponibles por fuente de datos (categóricos para agrupación)
  camposAgrupacionPorFuente: Record<string, { label: string; value: string; tipo: 'categoria' | 'numerico' }[]> = {
    'procesos': [
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Tendencia', value: 'tendencia', tipo: 'categoria' },
      { label: 'Rango Cumplimiento', value: 'rangoCumplimiento', tipo: 'categoria' },
      { label: 'Nivel de Alertas', value: 'alertas', tipo: 'categoria' }
    ],
    'activos': [
      { label: 'Tipo', value: 'tipo', tipo: 'categoria' },
      { label: 'Clasificación', value: 'clasificacion', tipo: 'categoria' },
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Criticidad', value: 'criticidad', tipo: 'categoria' },
      { label: 'Área', value: 'area', tipo: 'categoria' },
      { label: 'Propietario', value: 'propietario', tipo: 'categoria' }
    ],
    'riesgos': [
      { label: 'Nivel', value: 'nivel', tipo: 'categoria' },
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Categoría', value: 'categoria', tipo: 'categoria' },
      { label: 'Probabilidad', value: 'probabilidad', tipo: 'categoria' },
      { label: 'Impacto', value: 'impacto', tipo: 'categoria' },
      { label: 'Tratamiento', value: 'tratamiento', tipo: 'categoria' }
    ],
    'alertas': [
      { label: 'Severidad', value: 'severidad', tipo: 'categoria' },
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Tipo', value: 'tipo', tipo: 'categoria' },
      { label: 'Origen', value: 'origen', tipo: 'categoria' }
    ],
    'controles': [
      { label: 'Tipo', value: 'tipo', tipo: 'categoria' },
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Efectividad', value: 'efectividad', tipo: 'categoria' },
      { label: 'Automatización', value: 'automatizacion', tipo: 'categoria' },
      { label: 'Frecuencia', value: 'frecuencia', tipo: 'categoria' }
    ],
    'kpis': [
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Tendencia', value: 'tendencia', tipo: 'categoria' },
      { label: 'Categoría', value: 'categoria', tipo: 'categoria' },
      { label: 'Rango Meta', value: 'rangoMeta', tipo: 'categoria' }
    ],
    'objetivos': [
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Prioridad', value: 'prioridad', tipo: 'categoria' },
      { label: 'Rango Cumplimiento', value: 'rangoCumplimiento', tipo: 'categoria' }
    ],
    'incidentes': [
      { label: 'Severidad', value: 'severidad', tipo: 'categoria' },
      { label: 'Estado', value: 'estado', tipo: 'categoria' },
      { label: 'Tipo', value: 'tipo', tipo: 'categoria' },
      { label: 'Origen', value: 'origen', tipo: 'categoria' },
      { label: 'Categoría', value: 'categoria', tipo: 'categoria' }
    ]
  };

  // Campos numéricos por fuente de datos (para valores y ejes Y)
  camposValorPorFuente: Record<string, { label: string; value: string }[]> = {
    'procesos': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Cumplimiento (%)', value: 'cumplimiento' },
      { label: 'Objetivos', value: 'totalObjetivos' },
      { label: 'KPIs', value: 'totalKPIs' },
      { label: 'Alertas Activas', value: 'alertasActivas' }
    ],
    'activos': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Valor ($)', value: 'valor' },
      { label: 'Nivel Riesgo', value: 'nivelRiesgo' }
    ],
    'riesgos': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Nivel Inherente', value: 'nivelInherente' },
      { label: 'Nivel Residual', value: 'nivelResidual' },
      { label: 'Impacto Económico', value: 'impactoEconomico' }
    ],
    'alertas': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Días Abierto', value: 'diasAbierto' }
    ],
    'controles': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Efectividad (%)', value: 'efectividad' },
      { label: 'Costo', value: 'costo' }
    ],
    'kpis': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Valor Actual', value: 'valorActual' },
      { label: 'Meta', value: 'meta' },
      { label: 'Cumplimiento (%)', value: 'cumplimiento' }
    ],
    'objetivos': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Cumplimiento (%)', value: 'cumplimiento' },
      { label: 'KPIs Asociados', value: 'kpisAsociados' }
    ],
    'incidentes': [
      { label: 'Cantidad', value: 'count' },
      { label: 'Tiempo Resolución (hrs)', value: 'tiempoResolucion' },
      { label: 'Impacto Económico', value: 'impactoEconomico' }
    ]
  };

  // Campos para eje X por fuente (para barras y líneas)
  camposEjeXPorFuente: Record<string, { label: string; value: string }[]> = {
    'procesos': [
      { label: 'Nombre del Proceso', value: 'nombre' },
      { label: 'Estado', value: 'estado' },
      { label: 'Tendencia', value: 'tendencia' }
    ],
    'activos': [
      { label: 'Nombre del Activo', value: 'nombre' },
      { label: 'Tipo', value: 'tipo' },
      { label: 'Clasificación', value: 'clasificacion' },
      { label: 'Área', value: 'area' }
    ],
    'riesgos': [
      { label: 'Nombre del Riesgo', value: 'nombre' },
      { label: 'Categoría', value: 'categoria' },
      { label: 'Nivel', value: 'nivel' },
      { label: 'Mes', value: 'mes' }
    ],
    'alertas': [
      { label: 'Tipo', value: 'tipo' },
      { label: 'Severidad', value: 'severidad' },
      { label: 'Origen', value: 'origen' },
      { label: 'Fecha', value: 'fecha' }
    ],
    'controles': [
      { label: 'Nombre del Control', value: 'nombre' },
      { label: 'Tipo', value: 'tipo' },
      { label: 'Frecuencia', value: 'frecuencia' }
    ],
    'kpis': [
      { label: 'Nombre del KPI', value: 'nombre' },
      { label: 'Categoría', value: 'categoria' },
      { label: 'Período', value: 'periodo' }
    ],
    'objetivos': [
      { label: 'Nombre del Objetivo', value: 'nombre' },
      { label: 'Prioridad', value: 'prioridad' }
    ],
    'incidentes': [
      { label: 'Tipo', value: 'tipo' },
      { label: 'Categoría', value: 'categoria' },
      { label: 'Fecha', value: 'fecha' },
      { label: 'Mes', value: 'mes' }
    ]
  };

  // Opciones de filtros por nivel/área
  filtrosNivelOptions = [
    { label: 'Todos los niveles', value: '' },
    { label: 'Nivel 1 - Corporativo', value: 'nivel1' },
    { label: 'Nivel 2 - División', value: 'nivel2' },
    { label: 'Nivel 3 - Departamento', value: 'nivel3' },
    { label: 'Nivel 4 - Operativo', value: 'nivel4' }
  ];

  // Opciones de filtros por tipo (dinámico según fuente)
  getFiltrosTipoPorFuente(fuente: string): { label: string; value: string }[] {
    const filtros: Record<string, { label: string; value: string }[]> = {
      'activos': [
        { label: 'Todos', value: '' },
        { label: 'Tecnología', value: 'tecnologia' },
        { label: 'Información', value: 'informacion' },
        { label: 'Personas', value: 'personas' },
        { label: 'Infraestructura', value: 'infraestructura' },
        { label: 'Software', value: 'software' },
        { label: 'Hardware', value: 'hardware' }
      ],
      'riesgos': [
        { label: 'Todos', value: '' },
        { label: 'Operacional', value: 'operacional' },
        { label: 'Tecnológico', value: 'tecnologico' },
        { label: 'Cumplimiento', value: 'cumplimiento' },
        { label: 'Financiero', value: 'financiero' },
        { label: 'Reputacional', value: 'reputacional' }
      ],
      'controles': [
        { label: 'Todos', value: '' },
        { label: 'Preventivo', value: 'preventivo' },
        { label: 'Detectivo', value: 'detectivo' },
        { label: 'Correctivo', value: 'correctivo' },
        { label: 'Manual', value: 'manual' },
        { label: 'Automático', value: 'automatico' }
      ],
      'incidentes': [
        { label: 'Todos', value: '' },
        { label: 'Seguridad', value: 'seguridad' },
        { label: 'Disponibilidad', value: 'disponibilidad' },
        { label: 'Integridad', value: 'integridad' },
        { label: 'Confidencialidad', value: 'confidencialidad' }
      ]
    };
    return filtros[fuente] || [{ label: 'Todos', value: '' }];
  }

  /** Determina el modo de configuración según tipo de gráfica */
  getModoConfiguracion(tipo: string): 'circular' | 'ejes' | 'avanzado' {
    const circulares = ['pie', 'donut', 'radialBar', 'polarArea', 'funnel', 'pyramid', 'treemap'];
    const ejes = ['bar', 'column', 'stackedBar', 'groupedBar', 'line', 'area', 'stepline', 'spline', 'trendline', 'forecast', 'rangeArea'];

    if (circulares.includes(tipo)) return 'circular';
    if (ejes.includes(tipo)) return 'ejes';
    return 'avanzado';
  }

  /** Obtiene campos de agrupación para la fuente actual */
  getCamposAgrupacionActuales(): { label: string; value: string; tipo: 'categoria' | 'numerico' }[] {
    const fuente = this.preConfigGraficaFuenteDatos();
    return this.camposAgrupacionPorFuente[fuente] || [];
  }

  /** Obtiene campos de valor para la fuente actual */
  getCamposValorActuales(): { label: string; value: string }[] {
    const fuente = this.preConfigGraficaFuenteDatos();
    return this.camposValorPorFuente[fuente] || [];
  }

  /** Obtiene campos de eje X para la fuente actual */
  getCamposEjeXActuales(): { label: string; value: string }[] {
    const fuente = this.preConfigGraficaFuenteDatos();
    return this.camposEjeXPorFuente[fuente] || [];
  }

  /** Obtiene filtros de tipo para la fuente actual */
  getFiltrosTipoActuales(): { label: string; value: string }[] {
    return this.getFiltrosTipoPorFuente(this.preConfigGraficaFuenteDatos());
  }

  /** Handler cuando cambia la fuente de datos */
  onFuenteDatosChange(fuente: string): void {
    this.preConfigGraficaFuenteDatos.set(fuente);
    // Resetear campos a los primeros disponibles
    const camposAgrup = this.camposAgrupacionPorFuente[fuente];
    const camposValor = this.camposValorPorFuente[fuente];
    const camposEjeX = this.camposEjeXPorFuente[fuente];

    if (camposAgrup?.length) this.preConfigGraficaAgrupacion.set(camposAgrup[0].value);
    if (camposValor?.length) this.preConfigGraficaValor.set(camposValor[0].value);
    if (camposEjeX?.length) this.preConfigGraficaEjeX.set(camposEjeX[0].value);
    if (camposValor?.length) this.preConfigGraficaEjeY.set(camposValor[0].value);
    this.preConfigGraficaFiltroTipo.set('');
  }

  // Asistente IA para gráficas
  inputAsistenteGrafica = signal('');
  respuestaAsistenteGrafica = signal('');
  recomendacionTipoGrafica = signal('');

  // Tipos de gráfica agrupados para el select
  tiposGraficaOptions = [
    {
      label: 'Circulares',
      items: [
        { label: 'Pie', value: 'pie', icon: 'pi pi-chart-pie' },
        { label: 'Dona', value: 'donut', icon: 'pi pi-circle' },
        { label: 'Radial Bar', value: 'radialBar', icon: 'pi pi-spinner' },
        { label: 'Polar Area', value: 'polarArea', icon: 'pi pi-sun' }
      ]
    },
    {
      label: 'Barras',
      items: [
        { label: 'Barras Horizontal', value: 'bar', icon: 'pi pi-chart-bar' },
        { label: 'Columnas', value: 'column', icon: 'pi pi-align-justify' },
        { label: 'Barras Apiladas', value: 'stackedBar', icon: 'pi pi-server' },
        { label: 'Barras Agrupadas', value: 'groupedBar', icon: 'pi pi-th-large' }
      ]
    },
    {
      label: 'Líneas',
      items: [
        { label: 'Línea', value: 'line', icon: 'pi pi-chart-line' },
        { label: 'Área', value: 'area', icon: 'pi pi-stop' },
        { label: 'Stepline', value: 'stepline', icon: 'pi pi-sort-amount-down' },
        { label: 'Spline', value: 'spline', icon: 'pi pi-wave-pulse' }
      ]
    },
    {
      label: 'Avanzadas',
      items: [
        { label: 'Radar', value: 'radar', icon: 'pi pi-compass' },
        { label: 'Scatter', value: 'scatter', icon: 'pi pi-stop-circle' },
        { label: 'Heatmap', value: 'heatmap', icon: 'pi pi-table' },
        { label: 'Treemap', value: 'treemap', icon: 'pi pi-objects-column' }
      ]
    },
    {
      label: 'Embudo',
      items: [
        { label: 'Funnel', value: 'funnel', icon: 'pi pi-filter' },
        { label: 'Pirámide', value: 'pyramid', icon: 'pi pi-sort-amount-up' }
      ]
    },
    {
      label: 'IA / Predictivo',
      items: [
        { label: 'Línea de Tendencia', value: 'trendline', icon: 'pi pi-arrow-up-right' },
        { label: 'Pronóstico', value: 'forecast', icon: 'pi pi-sparkles' },
        { label: 'Rango Área', value: 'rangeArea', icon: 'pi pi-chart-scatter' }
      ]
    }
  ];

  // Paletas de colores disponibles
  paletasColoresOptions = [
    { label: 'Default (Orca)', value: 'default' },
    { label: 'Profesional', value: 'professional' },
    { label: 'Vibrante', value: 'vibrant' },
    { label: 'Tierra', value: 'earth' },
    { label: 'Océano', value: 'ocean' },
    { label: 'Pastel', value: 'pastel' },
    { label: 'Monocromo', value: 'mono' }
  ];

  // Sugerencias de IA predefinidas
  sugerenciasGraficaIA = [
    { label: 'Mejor para comparar', icon: 'pi pi-chart-bar', tipo: 'column', campo: 'cumplimiento', paleta: 'professional' },
    { label: 'Distribución', icon: 'pi pi-chart-pie', tipo: 'donut', campo: 'estado', paleta: 'vibrant' },
    { label: 'Tendencia temporal', icon: 'pi pi-chart-line', tipo: 'trendline', campo: 'cumplimiento', paleta: 'ocean' },
    { label: 'Análisis predictivo', icon: 'pi pi-sparkles', tipo: 'forecast', campo: 'cumplimiento', paleta: 'default' }
  ];

  /** Obtiene descripción del tipo de gráfica */
  getGraficaTipoDescripcion(tipo: string): string {
    const descripciones: Record<string, string> = {
      'pie': 'Gráfica circular para mostrar proporciones de un todo',
      'donut': 'Similar al pie pero con espacio central para información adicional',
      'radialBar': 'Barras circulares ideales para mostrar progreso o porcentajes',
      'polarArea': 'Combina características de pie y radar para comparaciones',
      'bar': 'Barras horizontales para comparar categorías',
      'column': 'Barras verticales ideales para series temporales',
      'stackedBar': 'Muestra composición y comparación simultáneamente',
      'groupedBar': 'Compara múltiples series lado a lado',
      'line': 'Muestra tendencias y cambios a lo largo del tiempo',
      'area': 'Similar a línea pero enfatiza el volumen bajo la curva',
      'stepline': 'Línea escalonada para datos discretos',
      'spline': 'Línea suavizada para tendencias continuas',
      'radar': 'Compara múltiples variables en ejes radiales',
      'scatter': 'Muestra correlación entre dos variables',
      'heatmap': 'Visualiza densidad o intensidad en una matriz',
      'treemap': 'Muestra jerarquías y proporciones con rectángulos',
      'funnel': 'Visualiza etapas de un proceso con reducción',
      'pyramid': 'Similar al funnel pero simétrico',
      'trendline': 'Línea con análisis de tendencia integrado',
      'forecast': 'Proyección predictiva basada en datos históricos',
      'rangeArea': 'Muestra rangos de valores con área sombreada'
    };
    return descripciones[tipo] || 'Selecciona un tipo de gráfica';
  }

  /** Obtiene descripción del campo */
  getCampoDescripcion(campo: string): string {
    const campoInfo = this.graficaInteractivaCamposDisponibles().find(c => c.value === campo);
    return campoInfo?.descripcion || '';
  }

  /** Obtiene campos recomendados según el tipo de gráfica */
  getCamposRecomendadosParaTipo(tipo: string): { label: string; value: string; descripcion: string }[] {
    const circulares = ['pie', 'donut', 'polarArea'];
    const barras = ['bar', 'column', 'stackedBar', 'groupedBar'];
    const lineas = ['line', 'area', 'stepline', 'spline', 'trendline', 'forecast'];

    if (circulares.includes(tipo)) {
      return this.graficaInteractivaCamposDisponibles().filter(c => c.tipo === 'categoria');
    } else if (barras.includes(tipo) || lineas.includes(tipo)) {
      return this.graficaInteractivaCamposDisponibles().filter(c => c.tipo === 'numerico');
    }
    return this.graficaInteractivaCamposDisponibles();
  }

  /** Obtiene colores de una paleta */
  getPaletaColores(paleta: string): string[] {
    const paletas: Record<string, string[]> = {
      'default': ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
      'professional': ['#1e3a5f', '#2d5a87', '#3d7ab3', '#5a9bd4', '#7ab8e3', '#9dd5f5', '#c0e8ff'],
      'vibrant': ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'],
      'earth': ['#6b4423', '#8b6914', '#a68b00', '#c4a35a', '#d4b896', '#e8d4b8', '#f5e6d3'],
      'ocean': ['#0a1628', '#1a365d', '#2a4a7f', '#3a5e9c', '#5a7fb8', '#7a9fd4', '#9abfef'],
      'pastel': ['#ffeaa7', '#fab1a0', '#74b9ff', '#a29bfe', '#fd79a8', '#55efc4', '#81ecec'],
      'mono': ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3']
    };
    return paletas[paleta] || paletas['default'];
  }

  /** Aplica una sugerencia predefinida de IA */
  aplicarSugerenciaGraficaIA(sugerencia: { tipo: string; campo: string; paleta: string }): void {
    this.preConfigGraficaTipo.set(sugerencia.tipo);
    this.preConfigGraficaAgrupacion.set(sugerencia.campo);
    this.preConfigGraficaPaleta.set(sugerencia.paleta);
    this.graficaConfigTab.set('tipo');
    this.respuestaAsistenteGrafica.set(`He configurado una gráfica de tipo "${sugerencia.tipo}" optimizada para el análisis seleccionado.`);
  }

  /** Toggle para animaciones de gráfica */
  toggleGraficaAnimaciones(): void {
    this.preConfigGraficaAnimaciones.update(v => !v);
  }

  /** Toggle para leyenda de gráfica */
  toggleGraficaLeyenda(): void {
    this.preConfigGraficaLeyenda.update(v => !v);
  }

  /** Toggle para etiquetas de gráfica */
  toggleGraficaEtiquetas(): void {
    this.preConfigGraficaEtiquetas.update(v => !v);
  }

  /** Procesa petición del asistente IA para gráficas */
  procesarPeticionAsistenteGrafica(): void {
    const input = this.inputAsistenteGrafica().toLowerCase().trim();
    if (!input) return;

    // Análisis simple de la petición
    let tipoSugerido = 'donut';
    let campoSugerido = 'estado';
    let paletaSugerida = 'default';
    let respuesta = '';

    if (input.includes('comparar') || input.includes('comparación')) {
      tipoSugerido = 'column';
      campoSugerido = 'cumplimiento';
      respuesta = 'Para comparaciones, recomiendo un gráfico de columnas con el campo de cumplimiento.';
    } else if (input.includes('tendencia') || input.includes('temporal') || input.includes('tiempo')) {
      tipoSugerido = 'trendline';
      campoSugerido = 'cumplimiento';
      paletaSugerida = 'ocean';
      respuesta = 'Para analizar tendencias temporales, he configurado una línea de tendencia.';
    } else if (input.includes('distribución') || input.includes('proporción')) {
      tipoSugerido = 'donut';
      campoSugerido = 'estado';
      paletaSugerida = 'vibrant';
      respuesta = 'Para mostrar distribución, una gráfica de dona es ideal.';
    } else if (input.includes('predicción') || input.includes('pronóstico') || input.includes('futuro')) {
      tipoSugerido = 'forecast';
      campoSugerido = 'cumplimiento';
      paletaSugerida = 'professional';
      respuesta = 'He configurado un gráfico de pronóstico para visualizar proyecciones futuras.';
    } else if (input.includes('alerta') || input.includes('riesgo')) {
      tipoSugerido = 'radialBar';
      campoSugerido = 'alertas';
      paletaSugerida = 'vibrant';
      respuesta = 'Para visualizar alertas, un RadialBar muestra claramente los niveles.';
    } else if (input.includes('kpi') || input.includes('objetivo')) {
      tipoSugerido = 'radar';
      campoSugerido = 'kpis';
      respuesta = 'Para múltiples KPIs, un gráfico radar permite comparar dimensiones.';
    } else {
      respuesta = 'He analizado tu petición. Te sugiero empezar con una gráfica de dona para una visión general.';
    }

    this.preConfigGraficaTipo.set(tipoSugerido);
    this.preConfigGraficaAgrupacion.set(campoSugerido);
    this.preConfigGraficaPaleta.set(paletaSugerida);
    this.respuestaAsistenteGrafica.set(respuesta);
    this.inputAsistenteGrafica.set('');
  }

  // Abre el drawer de pre-configuración en lugar de agregar directamente
  abrirPreConfiguracion(catalogItem: WidgetCatalogItem): void {
    this.widgetPreConfig.set(catalogItem);

    // Inicializar valores por defecto según el tipo
    this.preConfigTitulo.set(catalogItem.nombre);
    this.preConfigSubtitulo.set('');
    this.preConfigShowHeader.set(true);

    // Configuración por defecto según tipo de widget
    switch (catalogItem.tipo) {
      case 'kpi-card':
        this.preConfigKpiType.set('cumplimiento');
        break;
      case 'actividad-reciente':
        this.preConfigListLimit.set(5);
        break;
      case 'table-mini':
        this.preConfigTableLimit.set(5);
        this.preConfigTableDataSource.set('procesos');
        break;
      case 'graficas-interactivas':
        // Inicializar configuración de gráfica
        this.graficaConfigTab.set('tipo');
        this.preConfigGraficaTipo.set('donut');
        this.preConfigGraficaFuenteDatos.set('procesos');
        this.preConfigGraficaAgrupacion.set('estado');
        this.preConfigGraficaValor.set('count');
        this.preConfigGraficaEjeX.set('nombre');
        this.preConfigGraficaEjeY.set('cumplimiento');
        this.preConfigGraficaSeries.set('');
        this.preConfigGraficaFiltroNivel.set('');
        this.preConfigGraficaFiltroTipo.set('');
        this.preConfigGraficaPaleta.set('vibrant');
        this.preConfigGraficaAnimaciones.set(true);
        this.preConfigGraficaLeyenda.set(true);
        this.preConfigGraficaEtiquetas.set(false);
        this.inputAsistenteGrafica.set('');
        this.respuestaAsistenteGrafica.set('');
        break;
    }

    this.showCatalogoDrawer.set(false);
    this.showPreConfigDrawer.set(true);
  }

  // Confirma la configuración y agrega el widget al dashboard
  confirmarYAgregarWidget(): void {
    const catalogItem = this.widgetPreConfig();
    if (!catalogItem) return;

    // Construir la configuración personalizada
    const config: any = {
      showHeader: this.preConfigShowHeader()
    };

    // Agregar configuración específica según tipo
    switch (catalogItem.tipo) {
      case 'kpi-card':
        config.kpiType = this.preConfigKpiType();
        break;
      case 'actividad-reciente':
        config.listLimit = this.preConfigListLimit();
        break;
      case 'table-mini':
        config.tableLimit = this.preConfigTableLimit();
        config.tableDataSource = this.preConfigTableDataSource();
        break;
      case 'graficas-interactivas':
        config.graficaTipo = this.preConfigGraficaTipo();
        config.graficaFuenteDatos = this.preConfigGraficaFuenteDatos();
        config.graficaAgrupacion = this.preConfigGraficaAgrupacion();
        config.graficaValor = this.preConfigGraficaValor();
        config.graficaEjeX = this.preConfigGraficaEjeX();
        config.graficaEjeY = this.preConfigGraficaEjeY();
        config.graficaSeries = this.preConfigGraficaSeries();
        config.graficaFiltroNivel = this.preConfigGraficaFiltroNivel();
        config.graficaFiltroTipo = this.preConfigGraficaFiltroTipo();
        config.graficaPaleta = this.preConfigGraficaPaleta();
        config.graficaAnimaciones = this.preConfigGraficaAnimaciones();
        config.graficaMostrarLeyenda = this.preConfigGraficaLeyenda();
        config.graficaMostrarDataLabels = this.preConfigGraficaEtiquetas();
        break;
    }

    // Agregar widget con configuración personalizada
    this.dashboardService.agregarWidgetConConfig(
      catalogItem,
      this.preConfigTitulo(),
      this.preConfigSubtitulo(),
      config
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Widget agregado',
      detail: `${this.preConfigTitulo()} agregado al dashboard`
    });

    // Cerrar drawer y limpiar
    this.showPreConfigDrawer.set(false);
    this.widgetPreConfig.set(null);
  }

  // Cancelar pre-configuración y volver al catálogo
  cancelarPreConfig(): void {
    this.showPreConfigDrawer.set(false);
    this.widgetPreConfig.set(null);
    this.showCatalogoDrawer.set(true);
  }

  // Handler para cuando el wizard confirma la configuración
  onWizardConfirm(result: GraficaWizardResult): void {
    const catalogItem = this.widgetPreConfig();
    if (!catalogItem) return;

    // Construir configuración desde el resultado del wizard
    const config: any = {
      showHeader: true,
      graficaTipo: result.tipoGrafica,
      graficaFuenteDatos: result.fuenteDatos,
      graficaAgrupacion: result.configuracion.campoAgrupacion,
      graficaValor: result.configuracion.campoValor || 'count',
      graficaEjeX: result.configuracion.campoEjeX,
      graficaEjeY: result.configuracion.campoEjeY,
      graficaSeries: result.configuracion.campoSeries,
      graficaTipoAgregacion: result.configuracion.tipoAgregacion,
      graficaCruce: result.configuracion.cruce,
      graficaPaleta: result.estilo.paleta,
      graficaAnimaciones: result.estilo.mostrarAnimaciones,
      graficaMostrarLeyenda: result.estilo.mostrarLeyenda,
      graficaMostrarDataLabels: result.estilo.mostrarEtiquetas,
      graficaMostrarGrid: result.estilo.mostrarGrid,
      // Guardar los datos preprocesados para evitar re-carga
      graficaDatos: result.datos
    };

    // Agregar widget con configuración del wizard
    this.dashboardService.agregarWidgetConConfig(
      catalogItem,
      result.estilo.titulo,
      result.estilo.subtitulo,
      config
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Widget agregado',
      detail: `${result.estilo.titulo} agregado al dashboard`
    });

    // Cerrar drawer y limpiar - usar setTimeout para asegurar cierre correcto
    this.widgetPreConfig.set(null);
    setTimeout(() => {
      this.showPreConfigDrawer.set(false);
    }, 0);
  }

  // Handler para cuando el wizard cancela
  onWizardCancel(): void {
    this.cancelarPreConfig();
  }

  // ==================== ACCIONES DE WIDGETS ====================

  agregarWidget(catalogItem: WidgetCatalogItem): void {
    console.log('[Dashboard] agregarWidget llamado con:', catalogItem.tipo);
    console.log('[Dashboard] esGraficaConfigurable:', esGraficaConfigurable(catalogItem.tipo));

    // Graficas-interactivas usa el drawer de preconfig con tabs de configuración
    if (catalogItem.tipo === 'graficas-interactivas') {
      console.log('[Dashboard] Abriendo pre-configuración de gráficas interactivas');
      this.abrirPreConfiguracion(catalogItem);
      return;
    }

    // Usar configurador avanzado para tablas, gráficas legacy y KPIs
    const usaConfiguradorAvanzado =
      catalogItem.tipo === 'table-mini' ||
      catalogItem.tipo === 'kpi-card' ||
      catalogItem.tipo === 'kpi-grid' ||
      esGraficaConfigurable(catalogItem.tipo);

    if (usaConfiguradorAvanzado) {
      console.log('[Dashboard] Abriendo configurador avanzado');
      this.configuratorCatalogItem.set(catalogItem);
      this.showCatalogoDrawer.set(false);
      this.showWidgetConfigurator.set(true);
    } else {
      console.log('[Dashboard] Abriendo pre-configuración simple');
      // Usar pre-configuración simple para otros widgets
      this.abrirPreConfiguracion(catalogItem);
    }
  }

  // Handler para cuando el configurador avanzado confirma
  onWidgetConfigured(event: { titulo: string; subtitulo: string; config: WidgetConfig }): void {
    console.log('[Dashboard] onWidgetConfigured llamado con:', event);

    const catalogItem = this.configuratorCatalogItem();
    console.log('[Dashboard] catalogItem actual:', catalogItem);

    if (!catalogItem) {
      console.error('[Dashboard] ERROR: catalogItem es null!');
      return;
    }

    console.log('[Dashboard] Llamando a agregarWidgetConConfig...');
    this.dashboardService.agregarWidgetConConfig(
      catalogItem,
      event.titulo,
      event.subtitulo,
      event.config
    );

    console.log('[Dashboard] Widget agregado exitosamente');

    this.messageService.add({
      severity: 'success',
      summary: 'Widget agregado',
      detail: `${event.titulo} agregado al dashboard`
    });

    this.showWidgetConfigurator.set(false);
    this.configuratorCatalogItem.set(null);
  }

  // Handler para cuando el configurador avanzado cancela
  onWidgetConfiguratorCancel(): void {
    this.showWidgetConfigurator.set(false);
    this.configuratorCatalogItem.set(null);
    this.showCatalogoDrawer.set(true);
  }

  editarWidget(widget: DashboardWidget): void {
    this.dashboardService.seleccionarWidget(widget.id);
    this.showConfigDrawer.set(true);
  }

  eliminarWidget(widget: DashboardWidget): void {
    this.confirmationService.confirm({
      message: `¿Eliminar "${widget.titulo}" del dashboard?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.dashboardService.eliminarWidget(widget.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: 'Widget eliminado del dashboard'
        });
      }
    });
  }

  duplicarWidget(widget: DashboardWidget): void {
    this.dashboardService.duplicarWidget(widget.id);
    this.messageService.add({
      severity: 'success',
      summary: 'Duplicado',
      detail: 'Widget duplicado correctamente'
    });
  }

  onWidgetClick(widget: DashboardWidget): void {
    if (this.modoEdicion()) {
      this.dashboardService.seleccionarWidget(widget.id);
    }
  }

  // ==================== CONFIGURACIÓN DE WIDGET ====================

  actualizarTituloWidget(titulo: string): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, { titulo });
    }
  }

  actualizarSubtituloWidget(subtitulo: string): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, { subtitulo });
    }
  }

  actualizarKpiType(kpiType: string): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, {
        config: { ...widget.config, kpiType: kpiType as any }
      });
    }
  }

  actualizarChartDataSource(dataSource: string): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, {
        config: { ...widget.config, chartDataSource: dataSource as any }
      });
    }
  }

  actualizarShowHeader(show: boolean): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, {
        config: { ...widget.config, showHeader: show }
      });
    }
  }

  actualizarListLimit(limit: number): void {
    const widget = this.widgetSeleccionado();
    if (widget) {
      this.dashboardService.actualizarWidget(widget.id, {
        config: { ...widget.config, listLimit: limit }
      });
    }
  }

  // ==================== CONFIGURACIÓN DE LAYOUT ====================

  actualizarColumnas(columnas: number): void {
    this.dashboardService.actualizarLayoutOptions({ columns: columnas });
  }

  actualizarRowHeight(height: number): void {
    this.dashboardService.actualizarLayoutOptions({ rowHeight: height });
  }

  actualizarGap(gap: number): void {
    this.dashboardService.actualizarLayoutOptions({ gap });
  }

  restaurarDefecto(): void {
    this.confirmationService.confirm({
      message: '¿Restaurar la configuración por defecto? Se perderán todos los cambios.',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.dashboardService.restaurarDefecto();
        this.messageService.add({
          severity: 'info',
          summary: 'Restaurado',
          detail: 'Dashboard restaurado a la configuración por defecto'
        });
      }
    });
  }

  // ==================== CONFIGURACIONES ====================

  crearNuevaConfiguracion(): void {
    const nombre = prompt('Nombre de la nueva configuración:');
    if (nombre) {
      this.dashboardService.crearNuevaConfiguracion(nombre);
      this.messageService.add({
        severity: 'success',
        summary: 'Creado',
        detail: `Configuración "${nombre}" creada`
      });
    }
  }

  // ==================== HELPERS ====================

  getWidgetIcon(tipo: TipoWidget): string {
    const item = WIDGET_CATALOG.find(w => w.tipo === tipo);
    return item?.icono || 'pi pi-box';
  }

  trackByWidgetId(index: number, widget: DashboardWidget): string {
    return widget.id;
  }

  getSeverityColor(severity: string): 'danger' | 'warn' | 'info' | 'success' | 'secondary' | 'contrast' | undefined {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warn';
      case 'info': return 'info';
      default: return 'secondary';
    }
  }

  getTendenciaIcon(tendencia: string): string {
    switch (tendencia) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      default: return 'pi pi-minus';
    }
  }

  // ==================== CALENDARIO ====================

  // Eventos del calendario (pueden venir del backend)
  eventosCalendario = signal<CalendarioEvento[]>([]);

  // Handler para click en evento del calendario
  onCalendarioEventoClick(evento: CalendarioEvento): void {
    console.log('Evento de calendario seleccionado:', evento);
    // Se podría abrir un drawer con el detalle o navegar al proceso
    if (evento.proceso) {
      this.messageService.add({
        severity: 'info',
        summary: 'Evento',
        detail: `${evento.title} - ${evento.proceso}`
      });
    }
  }

  // Handler para click en fecha del calendario
  onCalendarioFechaClick(fecha: Date): void {
    console.log('Fecha seleccionada:', fecha);
    // Se podría abrir un modal para crear un nuevo evento
  }

  // ==================== GRÁFICAS GUARDADAS ====================

  // Handler para selección de gráfica guardada
  onGraficaGuardadaSeleccionada(grafica: GraficaGuardada): void {
    console.log('Gráfica guardada seleccionada:', grafica);
  }

  // Handler para cargar gráfica guardada en el dashboard
  onCargarGraficaGuardada(grafica: GraficaGuardada): void {
    console.log('Cargar gráfica guardada en dashboard:', grafica);
    // Aquí se podría crear un nuevo widget con la configuración de la gráfica
    this.messageService.add({
      severity: 'success',
      summary: 'Gráfica cargada',
      detail: `${grafica.nombre} cargada en el dashboard`
    });
  }

  // ==================== EXPORTACIÓN ====================

  // Modal de exportación
  showExportModal = signal(false);
  exportModalWidget = signal<DashboardWidget | null>(null);
  exportFormat = signal<'png' | 'jpg' | 'pdf' | 'csv' | 'xlsx' | 'svg'>('png');
  exportingCanvas = signal(false);

  // Opciones de exportación según tipo de widget
  getExportOptions(widget: DashboardWidget): { label: string; value: string; icon: string }[] {
    const isChart = ['graficas-interactivas'].includes(widget.tipo);
    const isTable = ['table-mini'].includes(widget.tipo);
    const isList = ['actividad-reciente'].includes(widget.tipo);

    const options = [
      { label: 'PNG (Imagen)', value: 'png', icon: 'pi pi-image' },
      { label: 'PDF (Documento)', value: 'pdf', icon: 'pi pi-file-pdf' }
    ];

    if (isChart) {
      options.push({ label: 'SVG (Vectorial)', value: 'svg', icon: 'pi pi-code' });
    }

    if (isTable || isList) {
      options.push({ label: 'CSV (Datos)', value: 'csv', icon: 'pi pi-file' });
      options.push({ label: 'Excel (XLS)', value: 'xlsx', icon: 'pi pi-file-excel' });
    }

    return options;
  }

  // Abrir modal de exportación para un widget
  abrirExportModal(widget: DashboardWidget): void {
    this.exportModalWidget.set(widget);
    this.exportFormat.set('png');
    this.showExportModal.set(true);
  }

  // Exportar widget según formato seleccionado
  async exportarWidget(): Promise<void> {
    const widget = this.exportModalWidget();
    if (!widget) return;

    const format = this.exportFormat();
    const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`) as HTMLElement;

    if (!widgetElement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar el widget'
      });
      return;
    }

    try {
      const filename = this.exportService.generateFilename(widget.titulo || 'widget');

      switch (format) {
        case 'png':
        case 'jpg':
          await this.exportService.exportAsImage(widgetElement, { filename, format });
          break;
        case 'pdf':
          await this.exportService.exportAsPDF(widgetElement, { filename });
          break;
        case 'svg':
          this.exportService.exportChartAsSVG(widgetElement, { filename });
          break;
        case 'csv':
          const csvData = this.prepareTableExportData(widget);
          if (csvData) {
            this.exportService.exportAsCSV(csvData, { filename });
          }
          break;
        case 'xlsx':
          const xlsData = this.prepareTableExportData(widget);
          if (xlsData) {
            this.exportService.exportAsExcel(xlsData, { filename });
          }
          break;
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Exportado',
        detail: `Widget exportado como ${format.toUpperCase()}`
      });
      this.showExportModal.set(false);
    } catch (error) {
      console.error('Error exportando:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo exportar el widget'
      });
    }
  }

  // Preparar datos para exportar tabla/lista como CSV/Excel
  prepareTableExportData(widget: DashboardWidget): TableExportData | null {
    switch (widget.tipo) {
      case 'table-mini':
        const procesos = this.procesosResumen();
        return {
          headers: ['Proceso', 'Estado', 'Cumplimiento', 'Objetivos', 'KPIs', 'Alertas'],
          rows: procesos.map(p => [
            p.procesoNombre,
            p.estado,
            `${p.cumplimientoPromedio}%`,
            p.totalObjetivos,
            p.totalKPIs,
            p.alertasActivas
          ]),
          title: widget.titulo
        };

      case 'actividad-reciente':
        const actividades = this.getActividadReciente();
        return {
          headers: ['Actividad', 'Tiempo'],
          rows: actividades.map(a => [a.texto, a.tiempo]),
          title: widget.titulo
        };

      default:
        return null;
    }
  }

  // Exportar dashboard completo
  async exportarDashboardCompleto(format: 'png' | 'pdf'): Promise<void> {
    const canvasElement = document.querySelector('.dashboard-grid') as HTMLElement;

    if (!canvasElement) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo encontrar el dashboard'
      });
      return;
    }

    this.exportingCanvas.set(true);

    try {
      const filename = this.exportService.generateFilename('dashboard');
      await this.exportService.exportDashboardCanvas(canvasElement, { filename, format });

      this.messageService.add({
        severity: 'success',
        summary: 'Exportado',
        detail: `Dashboard exportado como ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error exportando dashboard:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo exportar el dashboard'
      });
    } finally {
      this.exportingCanvas.set(false);
    }
  }

  // Exportar múltiples widgets seleccionados
  async exportarWidgetsSeleccionados(): Promise<void> {
    const widgetElements = document.querySelectorAll('[data-widget-id]') as NodeListOf<HTMLElement>;

    if (widgetElements.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'No hay widgets para exportar'
      });
      return;
    }

    this.exportingCanvas.set(true);

    try {
      const elements = Array.from(widgetElements);
      const filename = this.exportService.generateFilename('dashboard-widgets');
      await this.exportService.exportMultipleAsPDF(elements, { filename });

      this.messageService.add({
        severity: 'success',
        summary: 'Exportado',
        detail: 'Widgets exportados como PDF'
      });
    } catch (error) {
      console.error('Error exportando widgets:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo exportar los widgets'
      });
    } finally {
      this.exportingCanvas.set(false);
    }
  }
}
