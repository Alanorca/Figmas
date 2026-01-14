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
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  AMPieChartConfig,
  DatosPie,
  SegmentoPie,
  ChartClickEvent
} from '../amcharts.models';

@Component({
  selector: 'app-amcharts-pie',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="amcharts-pie-container">
      <div #chartDiv class="amchart-container" [style.height.px]="config().altura"></div>
    </div>
  `,
  styles: [`
    .amcharts-pie-container {
      width: 100%;
    }
    .amchart-container {
      width: 100%;
      min-height: 160px;
    }
  `]
})
export class AMChartsPieComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartDiv') chartDiv!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);

  // Inputs
  config = input.required<AMPieChartConfig>();
  datos = input<DatosPie>({ segmentos: [] });

  // Outputs
  segmentClick = output<ChartClickEvent>();
  chartReady = output<void>();

  // AMCharts references
  private root: am5.Root | null = null;
  private chart: am5percent.PieChart | null = null;
  private series: am5percent.PieSeries | null = null;
  private isReady = signal(false);

  constructor() {
    effect(() => {
      const datosPie = this.datos();
      if (this.isReady() && datosPie.segmentos.length > 0) {
        this.updateData(datosPie);
      }
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
      am5percent.PieChart.new(this.root, {
        layout: this.root.verticalLayout,
        innerRadius: config.tipo === 'donut' ? am5.percent(config.innerRadius || 50) : 0
      })
    );

    this.series = this.chart.series.push(
      am5percent.PieSeries.new(this.root, {
        valueField: 'valor',
        categoryField: 'nombre',
        tooltip: am5.Tooltip.new(this.root, {
          labelText: '{nombre}: {valor} ({porcentaje}%)'
        })
      })
    );

    this.series.slices.template.setAll({
      strokeWidth: 2,
      stroke: am5.color('#ffffff'),
      cursorOverStyle: 'pointer'
    });

    this.series.slices.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const data = dataItem.dataContext as SegmentoPie;
        return am5.color(data.color);
      }
      return fill;
    });

    this.series.slices.template.events.on('click', (ev) => {
      const dataItem = ev.target.dataItem;
      if (dataItem && dataItem.dataContext) {
        const data = dataItem.dataContext as SegmentoPie;
        this.segmentClick.emit({
          tipo: 'segment',
          id: data.id,
          nombre: data.nombre,
          valor: data.valor
        });
      }
    });

    this.series.slices.template.states.create('hover', {
      scale: 1.05
    });

    if (!config.mostrarLabels) {
      this.series.labels.template.set('visible', false);
      this.series.ticks.template.set('visible', false);
    }

    if (config.mostrarLeyenda) {
      const legend = this.chart.children.push(
        am5.Legend.new(this.root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          layout: this.root.horizontalLayout
        })
      );
      legend.data.setAll(this.series.dataItems);
    }

    this.isReady.set(true);
    this.chartReady.emit();

    const datosPie = this.datos();
    if (datosPie.segmentos.length > 0) {
      this.updateData(datosPie);
    }
  }

  updateData(data: DatosPie): void {
    if (!this.series) return;

    this.series.data.setAll(data.segmentos);

    if (this.config().mostrarLeyenda && this.chart) {
      const legend = this.chart.children.values.find(child => child instanceof am5.Legend);
      if (legend) {
        (legend as am5.Legend).data.setAll(this.series.dataItems);
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
}
