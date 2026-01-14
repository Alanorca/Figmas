import {
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  input,
  output,
  signal,
  effect,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  AMLineChartConfig,
  SerieLinea,
  ChartPeriodo,
  MetricaDisponible,
  PeriodoOption,
  MetricaOption,
  PeriodoChangeEvent,
  MetricaChangeEvent,
  RangoFechas,
  ChartClickEvent
} from '../amcharts.models';

@Component({
  selector: 'app-amcharts-line',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    TooltipModule
  ],
  templateUrl: './amcharts-line.html',
  styleUrl: './amcharts-line.scss'
})
export class AMChartsLineComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartDiv') chartDiv!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);

  // Inputs
  config = input.required<AMLineChartConfig>();
  series = input<SerieLinea[]>([]);
  mostrarControles = input<boolean>(true);

  // Outputs
  periodoChange = output<PeriodoChangeEvent>();
  metricaChange = output<MetricaChangeEvent>();
  chartClick = output<ChartClickEvent>();
  chartReady = output<void>();

  // Internal state for controls
  periodoSeleccionado = signal<ChartPeriodo>('mes');
  metricaSeleccionada = signal<MetricaDisponible>('cumplimiento');
  rangoCustom = signal<Date[] | null>(null);
  mostrarRangoCustom = signal(false);

  // Options
  readonly periodoOptions: PeriodoOption[] = [
    { label: 'Semana', value: 'semana', icon: 'pi pi-calendar' },
    { label: 'Mes', value: 'mes', icon: 'pi pi-calendar' },
    { label: 'Trimestre', value: 'trimestre', icon: 'pi pi-calendar' },
    { label: 'Anio', value: 'anio', icon: 'pi pi-calendar' },
    { label: 'Personalizado', value: 'custom', icon: 'pi pi-calendar-plus' }
  ];

  readonly metricaOptions: MetricaOption[] = [
    { label: 'Cumplimiento', value: 'cumplimiento', icon: 'pi pi-check-circle', descripcion: 'Porcentaje de cumplimiento', color: '#10b981' },
    { label: 'Alertas', value: 'alertas', icon: 'pi pi-bell', descripcion: 'Cantidad de alertas activas', color: '#ef4444' },
    { label: 'KPIs Activos', value: 'kpisActivos', icon: 'pi pi-chart-bar', descripcion: 'KPIs monitoreados', color: '#3b82f6' },
    { label: 'Objetivos', value: 'objetivosCumplidos', icon: 'pi pi-flag', descripcion: 'Objetivos cumplidos', color: '#8b5cf6' }
  ];

  // AMCharts references
  private root: am5.Root | null = null;
  private chart: am5xy.XYChart | null = null;
  private xAxis: am5xy.DateAxis<am5xy.AxisRenderer> | null = null;
  private yAxis: am5xy.ValueAxis<am5xy.AxisRenderer> | null = null;
  private seriesMap = new Map<string, am5xy.LineSeries>();
  private isReady = signal(false);

  private readonly PALETTES = {
    corporate: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
  };

  constructor() {
    effect(() => {
      const seriesData = this.series();
      if (this.isReady() && seriesData.length > 0) {
        this.updateData(seriesData);
      }
    });

    effect(() => {
      const cfg = this.config();
      if (cfg.periodo) this.periodoSeleccionado.set(cfg.periodo);
      if (cfg.metrica) this.metricaSeleccionada.set(cfg.metrica);
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.initChart(), 0);
    }
  }

  ngOnDestroy(): void {
    this.disposeChart();
  }

  private initChart(): void {
    if (!this.chartDiv?.nativeElement) return;

    const config = this.config();

    this.root = am5.Root.new(this.chartDiv.nativeElement);

    if (config.animaciones) {
      this.root.setThemes([am5themes_Animated.new(this.root)]);
    }

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: config.zoomEnabled,
        panY: false,
        wheelX: config.zoomEnabled ? 'panX' : 'none',
        wheelY: config.zoomEnabled ? 'zoomX' : 'none',
        pinchZoomX: config.zoomEnabled,
        layout: this.root.verticalLayout
      })
    );

    this.xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 50
        }),
        tooltip: am5.Tooltip.new(this.root, {})
      })
    );

    this.yAxis = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        min: 0,
        max: 100,
        renderer: am5xy.AxisRendererY.new(this.root, {})
      })
    );

    if (config.scrollbarEnabled) {
      this.chart.set('scrollbarX', am5.Scrollbar.new(this.root, {
        orientation: 'horizontal'
      }));
    }

    this.chart.set('cursor', am5xy.XYCursor.new(this.root, {
      behavior: 'zoomX',
      xAxis: this.xAxis
    }));

    if (config.mostrarLeyenda) {
      const legend = this.chart.children.push(
        am5.Legend.new(this.root, {
          centerX: am5.p50,
          x: am5.p50
        })
      );
      legend.data.setAll(this.chart.series.values);
    }

    this.isReady.set(true);
    this.chartReady.emit();

    const seriesData = this.series();
    if (seriesData.length > 0) {
      this.updateData(seriesData);
    }
  }

  updateData(data: SerieLinea[]): void {
    if (!this.root || !this.chart) return;

    this.seriesMap.forEach(series => series.dispose());
    this.seriesMap.clear();

    data.forEach((serieData, index) => {
      const series = this.chart!.series.push(
        am5xy.LineSeries.new(this.root!, {
          name: serieData.nombre,
          xAxis: this.xAxis!,
          yAxis: this.yAxis!,
          valueYField: 'valor',
          valueXField: 'fecha',
          stroke: am5.color(serieData.color || this.PALETTES.corporate[index % 5]),
          tooltip: am5.Tooltip.new(this.root!, {
            labelText: '{name}: {valueY}%'
          })
        })
      );

      series.strokes.template.setAll({
        strokeWidth: 2
      });

      if (this.config().mostrarPuntos) {
        series.bullets.push(() => {
          return am5.Bullet.new(this.root!, {
            sprite: am5.Circle.new(this.root!, {
              radius: 4,
              fill: series.get('stroke')
            })
          });
        });
      }

      const transformedData = serieData.datos.map(punto => ({
        fecha: new Date(punto.fecha).getTime(),
        valor: punto.valor
      }));

      series.data.setAll(transformedData);
      this.seriesMap.set(serieData.id, series);
    });

    if (this.config().mostrarLeyenda) {
      const legend = this.chart.children.values.find(child => child instanceof am5.Legend);
      if (legend) {
        (legend as am5.Legend).data.setAll(this.chart.series.values);
      }
    }
  }

  private disposeChart(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
      this.chart = null;
    }
  }

  // Control handlers
  onPeriodoChange(periodo: ChartPeriodo): void {
    this.periodoSeleccionado.set(periodo);
    this.mostrarRangoCustom.set(periodo === 'custom');

    if (periodo !== 'custom') {
      this.periodoChange.emit({ periodo });
    }
  }

  onMetricaChange(metrica: MetricaDisponible): void {
    this.metricaSeleccionada.set(metrica);
    this.metricaChange.emit({ metrica });
  }

  onRangoChange(rango: Date[]): void {
    if (rango && rango.length === 2) {
      this.rangoCustom.set(rango);
      const rangoFechas: RangoFechas = {
        desde: rango[0],
        hasta: rango[1]
      };
      this.periodoChange.emit({
        periodo: 'custom',
        rangoFechas
      });
    }
  }

  exportPNG(): void {
    if (this.root && this.chart) {
      this.root.container.children.getIndex(0);
    }
  }
}
