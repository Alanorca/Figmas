// ============================================================================
// DASHBOARD CUSTOMIZABLE COMPONENT
// ============================================================================
// Componente principal del dashboard con drag and drop
// Usa angular-gridster2 para el layout de widgets
// Integrado con datos reales, ApexCharts interactivos y configuración de widgets
// ============================================================================

import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { DashboardWidgetComponent } from '../dashboard-widget/dashboard-widget';
import {
  GraficasInteractivasComponent,
  DatosGrafica,
  FiltroGrafica
} from '../graficas-interactivas/graficas-interactivas';
import {
  DashboardWidget,
  WidgetCatalogItem,
  WIDGET_CATALOG,
  TipoWidget,
  WidgetConfig
} from '../../models/dashboard.models';
import { WidgetConfiguratorComponent } from '../widget-configurator/widget-configurator';
import { esGraficaConfigurable } from '../../models/widget-chart.config';

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
    DashboardWidgetComponent,
    NgApexchartsModule,
    GraficasInteractivasComponent,
    WidgetConfiguratorComponent
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

  // Campos disponibles para el componente de gráficas interactivas
  graficaInteractivaCamposDisponibles = [
    { label: 'Estado', value: 'estado', tipo: 'categoria' as const, descripcion: 'Estado del proceso (activo, borrador)' },
    { label: 'Cumplimiento', value: 'cumplimiento', tipo: 'numerico' as const, descripcion: 'Nivel de cumplimiento por proceso' },
    { label: 'Alertas', value: 'alertas', tipo: 'numerico' as const, descripcion: 'Cantidad de alertas por proceso' },
    { label: 'Objetivos', value: 'objetivos', tipo: 'numerico' as const, descripcion: 'Cantidad de objetivos por proceso' },
    { label: 'KPIs', value: 'kpis', tipo: 'numerico' as const, descripcion: 'Cantidad de KPIs por proceso' },
    { label: 'Tendencia', value: 'tendencia', tipo: 'categoria' as const, descripcion: 'Tendencia del proceso (up, down, neutral)' }
  ];

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

  // Valores disponibles para filtrado en gráficas interactivas
  graficaInteractivaValoresFiltrado = computed(() => {
    const procesos = this.procesosResumen();
    const nombres = new Set<string>();

    procesos.forEach(p => {
      if (p.procesoNombre) nombres.add(p.procesoNombre);
    });

    return [
      { campo: 'procesoNombre', valores: Array.from(nombres).sort() }
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

  /** Obtiene métricas para el grid de KPIs */
  getKPIGridMetrics(): { label: string; value: string }[] {
    const metrics = this.kpiMetrics();
    return metrics.map(m => ({
      label: m.nombre,
      value: m.unidad ? `${m.valor}${m.unidad}` : `${m.valor}`
    }));
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
  getActividadReciente(): { icono: string; color: string; texto: string; tiempo: string }[] {
    return this.dataService.getActividadReciente();
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
      case 'chart-bar':
      case 'chart-line':
      case 'chart-area':
        this.preConfigChartDataSource.set('cumplimiento');
        break;
      case 'chart-donut':
        this.preConfigChartDataSource.set('alertas');
        break;
      case 'alertas-list':
      case 'actividad-reciente':
        this.preConfigListLimit.set(5);
        break;
      case 'table-mini':
        this.preConfigTableLimit.set(5);
        this.preConfigTableDataSource.set('procesos');
        break;
      case 'mapa-riesgos':
        this.preConfigMapaRiesgosType.set('probabilidad-impacto');
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
      case 'chart-bar':
      case 'chart-line':
      case 'chart-area':
      case 'chart-donut':
        config.chartDataSource = this.preConfigChartDataSource();
        break;
      case 'alertas-list':
      case 'actividad-reciente':
        config.listLimit = this.preConfigListLimit();
        break;
      case 'table-mini':
        config.tableLimit = this.preConfigTableLimit();
        config.tableDataSource = this.preConfigTableDataSource();
        break;
      case 'mapa-riesgos':
        config.mapaRiesgosType = this.preConfigMapaRiesgosType();
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

  // ==================== ACCIONES DE WIDGETS ====================

  agregarWidget(catalogItem: WidgetCatalogItem): void {
    console.log('[Dashboard] agregarWidget llamado con:', catalogItem.tipo);
    console.log('[Dashboard] esGraficaConfigurable:', esGraficaConfigurable(catalogItem.tipo));

    // Usar configurador avanzado para tablas, gráficas, KPIs y gráficas interactivas
    const usaConfiguradorAvanzado =
      catalogItem.tipo === 'table-mini' ||
      catalogItem.tipo === 'kpi-card' ||
      catalogItem.tipo === 'kpi-grid' ||
      catalogItem.tipo === 'graficas-interactivas' ||
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
}
