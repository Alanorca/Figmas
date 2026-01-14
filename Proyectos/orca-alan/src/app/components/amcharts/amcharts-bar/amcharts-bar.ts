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
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import {
  AMBarChartConfig,
  DatosBarras,
  CategoriaBar,
  ChartClickEvent
} from '../amcharts.models';

@Component({
  selector: 'app-amcharts-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amcharts-bar.html',
  styleUrl: './amcharts-bar.scss'
})
export class AMChartsBarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartDiv') chartDiv!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);

  // Inputs
  config = input.required<AMBarChartConfig>();
  datos = input<DatosBarras>({ categorias: [] });

  // Outputs
  barClick = output<ChartClickEvent>();
  drillDownRequest = output<{ procesoId: string; procesoNombre: string }>();
  chartReady = output<void>();

  // AMCharts references
  private root: am5.Root | null = null;
  private chart: am5xy.XYChart | null = null;
  private categoryAxis: am5xy.CategoryAxis<am5xy.AxisRenderer> | null = null;
  private valueAxis: am5xy.ValueAxis<am5xy.AxisRenderer> | null = null;
  private barSeries: am5xy.ColumnSeries | null = null;
  private isReady = signal(false);

  constructor() {
    effect(() => {
      const datosBar = this.datos();
      if (this.isReady() && datosBar.categorias.length > 0) {
        this.updateData(datosBar);
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
    const isHorizontal = config.orientacion === 'horizontal';

    this.root = am5.Root.new(this.chartDiv.nativeElement);

    if (config.animaciones) {
      this.root.setThemes([am5themes_Animated.new(this.root)]);
    }

    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        layout: this.root.verticalLayout
      })
    );

    if (isHorizontal) {
      this.valueAxis = this.chart.xAxes.push(
        am5xy.ValueAxis.new(this.root, {
          min: 0,
          max: 100,
          renderer: am5xy.AxisRendererX.new(this.root, {})
        })
      );

      this.categoryAxis = this.chart.yAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          categoryField: 'nombre',
          renderer: am5xy.AxisRendererY.new(this.root, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
            minGridDistance: 20
          })
        })
      );
    } else {
      this.categoryAxis = this.chart.xAxes.push(
        am5xy.CategoryAxis.new(this.root, {
          categoryField: 'nombre',
          renderer: am5xy.AxisRendererX.new(this.root, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9
          })
        })
      );

      this.valueAxis = this.chart.yAxes.push(
        am5xy.ValueAxis.new(this.root, {
          min: 0,
          max: 100,
          renderer: am5xy.AxisRendererY.new(this.root, {})
        })
      );
    }

    this.barSeries = this.chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: 'Cumplimiento',
        xAxis: isHorizontal ? this.valueAxis! : this.categoryAxis!,
        yAxis: isHorizontal ? this.categoryAxis! : this.valueAxis!,
        valueXField: isHorizontal ? 'valor' : undefined,
        valueYField: isHorizontal ? undefined : 'valor',
        categoryXField: isHorizontal ? undefined : 'nombre',
        categoryYField: isHorizontal ? 'nombre' : undefined,
        tooltip: am5.Tooltip.new(this.root, {
          labelText: '{nombre}: {valor}%'
        })
      })
    );

    this.barSeries.columns.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: isHorizontal ? 4 : 0,
      cornerRadiusBR: isHorizontal ? 4 : 0,
      strokeOpacity: 0
    });

    if (config.colorPorValor) {
      this.barSeries.columns.template.adapters.add('fill', (fill, target) => {
        const dataItem = target.dataItem;
        if (dataItem) {
          const valor = (dataItem.dataContext as CategoriaBar)?.valor || 0;
          if (valor >= 80) return am5.color('#10b981');
          if (valor >= 60) return am5.color('#f59e0b');
          return am5.color('#ef4444');
        }
        return fill;
      });

      this.barSeries.columns.template.adapters.add('stroke', (stroke, target) => {
        const dataItem = target.dataItem;
        if (dataItem) {
          const valor = (dataItem.dataContext as CategoriaBar)?.valor || 0;
          if (valor >= 80) return am5.color('#10b981');
          if (valor >= 60) return am5.color('#f59e0b');
          return am5.color('#ef4444');
        }
        return stroke;
      });
    }

    if (config.drilldownEnabled) {
      this.barSeries.columns.template.setAll({
        cursorOverStyle: 'pointer'
      });

      this.barSeries.columns.template.events.on('click', (ev) => {
        const dataItem = ev.target.dataItem;
        if (dataItem && dataItem.dataContext) {
          const data = dataItem.dataContext as CategoriaBar;

          this.barClick.emit({
            tipo: 'bar',
            id: data.id,
            nombre: data.nombre,
            valor: data.valor,
            metadata: data.metadata
          });

          this.drillDownRequest.emit({
            procesoId: data.id,
            procesoNombre: data.nombre
          });
        }
      });

      this.barSeries.columns.template.states.create('hover', {
        fillOpacity: 0.8,
        scale: 1.02
      });
    }

    if (config.mostrarValores) {
      this.barSeries.bullets.push(() => {
        return am5.Bullet.new(this.root!, {
          locationX: isHorizontal ? 1 : 0.5,
          locationY: isHorizontal ? 0.5 : 1,
          sprite: am5.Label.new(this.root!, {
            text: '{valor}%',
            fill: am5.color('#ffffff'),
            centerX: isHorizontal ? am5.p100 : am5.p50,
            centerY: am5.p50,
            dx: isHorizontal ? -10 : 0,
            dy: isHorizontal ? 0 : -10,
            fontSize: 12,
            fontWeight: '600',
            populateText: true
          })
        });
      });
    }

    this.isReady.set(true);
    this.chartReady.emit();

    const datosBar = this.datos();
    if (datosBar.categorias.length > 0) {
      this.updateData(datosBar);
    }
  }

  updateData(data: DatosBarras): void {
    if (!this.barSeries || !this.categoryAxis) return;

    const config = this.config();
    let categorias = [...data.categorias];

    if (config.ordenamiento !== 'none') {
      categorias.sort((a, b) =>
        config.ordenamiento === 'asc'
          ? a.valor - b.valor
          : b.valor - a.valor
      );
    }

    if (config.maxItems && config.maxItems > 0) {
      categorias = categorias.slice(0, config.maxItems);
    }

    this.categoryAxis.data.setAll(categorias);
    this.barSeries.data.setAll(categorias);
  }

  private disposeChart(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
      this.chart = null;
    }
  }
}
