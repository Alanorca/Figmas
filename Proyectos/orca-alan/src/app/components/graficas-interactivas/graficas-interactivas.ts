import { Component, Input, Output, EventEmitter, signal, computed, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
  ApexStroke,
  ApexFill,
  ApexGrid,
  ApexResponsive,
  ApexTheme,
  ApexTitleSubtitle,
  ApexAnnotations,
  ApexMarkers
} from 'ng-apexcharts';

// Tipos de gráficas disponibles
export type TipoGraficaAvanzada =
  | 'pie' | 'donut' | 'radialBar' | 'polarArea'  // Circulares
  | 'bar' | 'column' | 'stackedBar' | 'groupedBar'  // Barras
  | 'line' | 'area' | 'stepline' | 'spline'  // Líneas
  | 'radar' | 'scatter' | 'heatmap' | 'treemap'  // Avanzadas
  | 'funnel' | 'pyramid';  // Embudo

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
}

interface GrupoTiposGrafica {
  label: string;
  items: TipoGraficaItem[];
}

@Component({
  selector: 'app-graficas-interactivas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgApexchartsModule,
    ButtonModule, SelectModule, ToggleButtonModule, TabsModule,
    DividerModule, InputTextModule, TooltipModule, TagModule, CardModule
  ],
  templateUrl: './graficas-interactivas.html',
  styleUrl: './graficas-interactivas.scss'
})
export class GraficasInteractivasComponent {
  @ViewChild('chartRef') chartRef!: ChartComponent;

  @Input() set datos(value: DatosGrafica) {
    this.datosSignal.set(value);
  }
  @Input() titulo = 'Gráfica';
  @Input() subtitulo = '';

  @Output() dataPointClick = new EventEmitter<{ categoria: string; valor: number; serie?: string }>();
  @Output() legendClick = new EventEmitter<{ serie: string; visible: boolean }>();

  // Signal público para acceso en template
  readonly datosSignal = signal<DatosGrafica>({ labels: [], series: [] });

  // Estado del componente
  tipoGrafica = signal<TipoGraficaAvanzada>('donut');
  animaciones = signal(true);
  mostrarLeyenda = signal(true);
  mostrarDataLabels = signal(true);
  mostrarTooltip = signal(true);
  tema = signal<'light' | 'dark'>('light');
  paletaSeleccionada = signal('vibrant');

  // Paletas de colores predefinidas (estilo AmCharts)
  paletas: Record<string, string[]> = {
    vibrant: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#3F51B5', '#03A9F4', '#4CAF50', '#F9CE1D', '#FF9800'],
    pastel: ['#80DEEA', '#CE93D8', '#FFAB91', '#A5D6A7', '#90CAF9', '#FFF59D', '#BCAAA4', '#B0BEC5', '#F48FB1', '#81D4FA'],
    neon: ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FF0080', '#8000FF', '#FF8000', '#0080FF', '#80FF00', '#FF0000'],
    corporate: ['#2E5BFF', '#8C54FF', '#00C1D4', '#FAD02C', '#F7C137', '#33D9B2', '#FF5252', '#00B8D4', '#7C4DFF', '#FFAB40'],
    earth: ['#8D6E63', '#A1887F', '#BCAAA4', '#795548', '#6D4C41', '#5D4037', '#4E342E', '#3E2723', '#D7CCC8', '#EFEBE9'],
    ocean: ['#0277BD', '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE', '#006064'],
    sunset: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#FFE66D', '#C9E4CA', '#87CEEB', '#9370DB', '#FF69B4']
  };

  // Tipos de gráficas agrupados
  tiposGraficaOpciones: GrupoTiposGrafica[] = [
    {
      label: 'Circulares',
      items: [
        { label: 'Donut', value: 'donut', icon: 'pi pi-circle' },
        { label: 'Pie', value: 'pie', icon: 'pi pi-chart-pie' },
        { label: 'Radial Bar', value: 'radialBar', icon: 'pi pi-sun' },
        { label: 'Polar Area', value: 'polarArea', icon: 'pi pi-slack' }
      ]
    },
    {
      label: 'Barras',
      items: [
        { label: 'Columnas', value: 'column', icon: 'pi pi-chart-bar' },
        { label: 'Barras Horizontal', value: 'bar', icon: 'pi pi-align-left' },
        { label: 'Barras Apiladas', value: 'stackedBar', icon: 'pi pi-objects-column' },
        { label: 'Barras Agrupadas', value: 'groupedBar', icon: 'pi pi-th-large' }
      ]
    },
    {
      label: 'Líneas',
      items: [
        { label: 'Línea', value: 'line', icon: 'pi pi-chart-line' },
        { label: 'Área', value: 'area', icon: 'pi pi-chart-line' },
        { label: 'Spline', value: 'spline', icon: 'pi pi-wave-pulse' },
        { label: 'Step Line', value: 'stepline', icon: 'pi pi-minus' }
      ]
    },
    {
      label: 'Avanzadas',
      items: [
        { label: 'Radar', value: 'radar', icon: 'pi pi-stop' },
        { label: 'Scatter', value: 'scatter', icon: 'pi pi-circle-fill' },
        { label: 'Heatmap', value: 'heatmap', icon: 'pi pi-table' },
        { label: 'Treemap', value: 'treemap', icon: 'pi pi-objects-column' }
      ]
    },
    {
      label: 'Embudo',
      items: [
        { label: 'Embudo', value: 'funnel', icon: 'pi pi-filter' },
        { label: 'Pirámide', value: 'pyramid', icon: 'pi pi-caret-up' }
      ]
    }
  ];

  // Computed: Configuración del chart
  chartOptions = computed(() => {
    const datos = this.datosSignal();
    const tipo = this.tipoGrafica();
    const paleta = this.paletas[this.paletaSeleccionada()];

    return this.buildChartOptions(tipo, datos, paleta);
  });

  chartSeries = computed(() => {
    const datos = this.datosSignal();
    const tipo = this.tipoGrafica();

    if (this.isNonAxisChart(tipo)) {
      // Para gráficas circulares, series es un array de números
      if (Array.isArray(datos.series) && typeof datos.series[0] === 'number') {
        return datos.series as number[];
      }
      // Si viene como array de objetos, extraer los datos del primero
      if (Array.isArray(datos.series) && datos.series.length > 0 && typeof datos.series[0] === 'object') {
        return (datos.series as { name: string; data: number[] }[])[0].data;
      }
      return [];
    }

    // Para gráficas de ejes
    if (Array.isArray(datos.series) && datos.series.length > 0) {
      if (typeof datos.series[0] === 'number') {
        return [{ name: this.titulo, data: datos.series as number[] }];
      }
      return datos.series as { name: string; data: number[] }[];
    }
    return [];
  });

  private isNonAxisChart(tipo: TipoGraficaAvanzada): boolean {
    return ['pie', 'donut', 'radialBar', 'polarArea'].includes(tipo);
  }

  private buildChartOptions(tipo: TipoGraficaAvanzada, datos: DatosGrafica, paleta: string[]): any {
    const baseOptions = {
      chart: this.getChartConfig(tipo),
      colors: paleta,
      labels: datos.labels,
      title: {
        text: this.titulo,
        align: 'center' as const,
        style: {
          fontSize: '18px',
          fontWeight: 600,
          color: this.tema() === 'dark' ? '#fff' : '#333'
        }
      },
      subtitle: {
        text: this.subtitulo,
        align: 'center' as const,
        style: {
          fontSize: '14px',
          color: this.tema() === 'dark' ? '#aaa' : '#666'
        }
      },
      legend: this.getLegendConfig(),
      tooltip: this.getTooltipConfig(),
      dataLabels: this.getDataLabelsConfig(tipo),
      theme: {
        mode: this.tema()
      },
      responsive: this.getResponsiveConfig()
    };

    // Agregar configuraciones específicas según el tipo
    switch (tipo) {
      case 'donut':
        return {
          ...baseOptions,
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: true,
                  name: { show: true, fontSize: '16px', fontWeight: 600 },
                  value: { show: true, fontSize: '22px', fontWeight: 700 },
                  total: {
                    show: true,
                    label: 'Total',
                    fontSize: '14px',
                    fontWeight: 500,
                    formatter: (w: any) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  }
                }
              },
              expandOnClick: true
            }
          }
        };

      case 'pie':
        return {
          ...baseOptions,
          plotOptions: {
            pie: {
              expandOnClick: true,
              offsetX: 0,
              offsetY: 0,
              customScale: 1,
              dataLabels: { offset: -10 }
            }
          }
        };

      case 'radialBar':
        return {
          ...baseOptions,
          plotOptions: {
            radialBar: {
              hollow: { size: '40%' },
              track: { background: '#e7e7e7', strokeWidth: '97%', margin: 5 },
              dataLabels: {
                name: { fontSize: '16px' },
                value: { fontSize: '22px', fontWeight: 700 },
                total: {
                  show: true,
                  label: 'Promedio',
                  formatter: (w: any) => {
                    const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                    return Math.round(total / w.globals.series.length) + '%';
                  }
                }
              }
            }
          }
        };

      case 'polarArea':
        return {
          ...baseOptions,
          plotOptions: {
            polarArea: {
              rings: { strokeWidth: 1 },
              spokes: { strokeWidth: 1 }
            }
          },
          stroke: { colors: ['#fff'], width: 1 },
          fill: { opacity: 0.8 }
        };

      case 'bar':
      case 'column':
        return {
          ...baseOptions,
          xaxis: this.getXAxisConfig(datos.labels),
          yaxis: this.getYAxisConfig(),
          plotOptions: {
            bar: {
              horizontal: tipo === 'bar',
              borderRadius: 6,
              borderRadiusApplication: 'end' as const,
              distributed: true,
              dataLabels: { position: 'top' }
            }
          },
          grid: this.getGridConfig()
        };

      case 'stackedBar':
        return {
          ...baseOptions,
          chart: { ...this.getChartConfig('bar'), stacked: true },
          xaxis: this.getXAxisConfig(datos.labels),
          yaxis: this.getYAxisConfig(),
          plotOptions: {
            bar: {
              horizontal: true,
              borderRadius: 4,
              dataLabels: { total: { enabled: true, style: { fontSize: '13px', fontWeight: 900 } } }
            }
          },
          grid: this.getGridConfig()
        };

      case 'groupedBar':
        return {
          ...baseOptions,
          chart: { ...this.getChartConfig('bar'), stacked: false },
          xaxis: this.getXAxisConfig(datos.labels),
          yaxis: this.getYAxisConfig(),
          plotOptions: {
            bar: {
              horizontal: false,
              borderRadius: 4,
              columnWidth: '70%'
            }
          },
          grid: this.getGridConfig()
        };

      case 'line':
      case 'spline':
      case 'stepline':
        return {
          ...baseOptions,
          chart: {
            ...this.getChartConfig('line'),
            zoom: { enabled: true, type: 'x' as const, autoScaleYaxis: true },
            toolbar: {
              autoSelected: 'zoom' as const,
              tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
            }
          },
          xaxis: this.getXAxisConfig(datos.labels),
          yaxis: this.getYAxisConfig(),
          stroke: {
            curve: tipo === 'spline' ? 'smooth' as const : tipo === 'stepline' ? 'stepline' as const : 'straight' as const,
            width: 3
          },
          markers: { size: 5, hover: { size: 8 } },
          grid: this.getGridConfig()
        };

      case 'area':
        return {
          ...baseOptions,
          chart: {
            ...this.getChartConfig('area'),
            zoom: { enabled: true, type: 'x' as const },
            toolbar: { autoSelected: 'zoom' as const }
          },
          xaxis: this.getXAxisConfig(datos.labels),
          yaxis: this.getYAxisConfig(),
          stroke: { curve: 'smooth' as const, width: 2 },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.2,
              stops: [0, 90, 100]
            }
          },
          grid: this.getGridConfig()
        };

      case 'radar':
        return {
          ...baseOptions,
          xaxis: { categories: datos.labels },
          plotOptions: {
            radar: {
              size: 140,
              polygons: {
                strokeColors: '#e9e9e9',
                fill: { colors: ['#f8f8f8', '#fff'] }
              }
            }
          },
          markers: { size: 4 }
        };

      case 'heatmap':
        return {
          ...baseOptions,
          plotOptions: {
            heatmap: {
              shadeIntensity: 0.5,
              colorScale: {
                ranges: [
                  { from: 0, to: 25, name: 'Bajo', color: '#00A100' },
                  { from: 26, to: 50, name: 'Medio', color: '#128FD9' },
                  { from: 51, to: 75, name: 'Alto', color: '#FFB200' },
                  { from: 76, to: 100, name: 'Crítico', color: '#FF0000' }
                ]
              }
            }
          }
        };

      case 'treemap':
        return {
          ...baseOptions,
          plotOptions: {
            treemap: {
              distributed: true,
              enableShades: true
            }
          }
        };

      case 'funnel':
        return {
          ...baseOptions,
          plotOptions: {
            bar: {
              horizontal: true,
              isFunnel: true,
              borderRadius: 0
            }
          },
          xaxis: { categories: datos.labels }
        };

      case 'pyramid':
        return {
          ...baseOptions,
          plotOptions: {
            bar: {
              horizontal: true,
              isFunnel: true,
              borderRadius: 0,
              barHeight: '80%'
            }
          },
          xaxis: { categories: datos.labels }
        };

      default:
        return baseOptions;
    }
  }

  private getChartConfig(tipo: string): ApexChart {
    let chartType: ApexChart['type'] = 'bar';

    const typeMapping: Record<string, ApexChart['type']> = {
      'pie': 'pie', 'donut': 'donut', 'radialBar': 'radialBar', 'polarArea': 'polarArea',
      'bar': 'bar', 'column': 'bar', 'stackedBar': 'bar', 'groupedBar': 'bar',
      'line': 'line', 'area': 'area', 'spline': 'line', 'stepline': 'line',
      'radar': 'radar', 'scatter': 'scatter', 'heatmap': 'heatmap', 'treemap': 'treemap',
      'funnel': 'bar', 'pyramid': 'bar'
    };

    chartType = typeMapping[tipo] || 'bar';

    return {
      type: chartType,
      height: 380,
      fontFamily: 'Inter, sans-serif',
      animations: {
        enabled: this.animaciones(),
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 8,
        left: 0,
        blur: 10,
        opacity: 0.1
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        },
        export: {
          csv: { filename: 'grafica-datos' },
          svg: { filename: 'grafica-svg' },
          png: { filename: 'grafica-png' }
        }
      },
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          const dataIndex = config.dataPointIndex;
          const seriesIndex = config.seriesIndex;
          this.dataPointClick.emit({
            categoria: this.datosSignal().labels[dataIndex],
            valor: Array.isArray(this.datosSignal().series[seriesIndex])
              ? 0
              : typeof this.datosSignal().series[seriesIndex] === 'number'
                ? this.datosSignal().series[seriesIndex] as number
                : 0,
            serie: typeof this.datosSignal().series[seriesIndex] === 'object'
              ? (this.datosSignal().series[seriesIndex] as { name: string }).name
              : undefined
          });
        },
        legendClick: (chartContext: any, seriesIndex: number, config: any) => {
          this.legendClick.emit({
            serie: this.datosSignal().labels[seriesIndex],
            visible: config.globals.collapsedSeriesIndices.indexOf(seriesIndex) === -1
          });
        }
      }
    };
  }

  private getLegendConfig(): ApexLegend {
    return {
      show: this.mostrarLeyenda(),
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '13px',
      fontWeight: 500,
      markers: { strokeWidth: 0 },
      itemMargin: { horizontal: 12, vertical: 8 },
      onItemClick: { toggleDataSeries: true },
      onItemHover: { highlightDataSeries: true }
    };
  }

  private getTooltipConfig(): ApexTooltip {
    return {
      enabled: this.mostrarTooltip(),
      shared: true,
      intersect: false,
      followCursor: true,
      theme: this.tema(),
      style: { fontSize: '13px' },
      x: { show: true },
      y: {
        formatter: (val: number) => {
          if (val === undefined || val === null) return '';
          return val.toLocaleString('es-MX');
        }
      },
      marker: { show: true }
    };
  }

  private getDataLabelsConfig(tipo: TipoGraficaAvanzada): ApexDataLabels {
    const isCircular = this.isNonAxisChart(tipo);
    return {
      enabled: this.mostrarDataLabels(),
      formatter: (val: number, opts: any) => {
        if (isCircular && typeof val === 'number') {
          return val.toFixed(1) + '%';
        }
        return val?.toLocaleString('es-MX') || '';
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: isCircular ? ['#fff'] : undefined
      },
      dropShadow: { enabled: isCircular, top: 1, left: 1, blur: 2, opacity: 0.5 }
    };
  }

  private getXAxisConfig(categories: string[]): ApexXAxis {
    return {
      categories,
      labels: {
        style: { fontSize: '12px', fontWeight: 500 },
        rotate: -45,
        rotateAlways: false
      },
      axisBorder: { show: true, color: '#e0e0e0' },
      axisTicks: { show: true, color: '#e0e0e0' }
    };
  }

  private getYAxisConfig(): ApexYAxis {
    return {
      labels: {
        style: { fontSize: '12px' },
        formatter: (val: number) => val?.toLocaleString('es-MX') || ''
      },
      axisBorder: { show: true, color: '#e0e0e0' }
    };
  }

  private getGridConfig(): ApexGrid {
    return {
      show: true,
      borderColor: '#f0f0f0',
      strokeDashArray: 3,
      position: 'back',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    };
  }

  private getResponsiveConfig(): ApexResponsive[] {
    return [
      {
        breakpoint: 768,
        options: {
          chart: { height: 300 },
          legend: { position: 'bottom', offsetY: 0 }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 250 },
          legend: { show: false }
        }
      }
    ];
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
    this.tema.update(t => t === 'light' ? 'dark' : 'light');
  }

  exportarPNG(): void {
    if (this.chartRef) {
      this.chartRef.dataURI().then((uri: any) => {
        const link = document.createElement('a');
        link.href = uri.imgURI;
        link.download = `grafica-${this.tipoGrafica()}-${Date.now()}.png`;
        link.click();
      });
    }
  }

  exportarSVG(): void {
    if (this.chartRef) {
      this.chartRef.dataURI({ scale: 2 }).then((uri: any) => {
        const link = document.createElement('a');
        link.href = uri.imgURI;
        link.download = `grafica-${this.tipoGrafica()}-${Date.now()}.svg`;
        link.click();
      });
    }
  }

  resetZoom(): void {
    if (this.chartRef) {
      this.chartRef.resetSeries();
    }
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

  getTotalSeries(): number {
    const series = this.chartSeries();
    if (series.length === 0) return 0;

    if (typeof series[0] === 'number') {
      return (series as number[]).reduce((acc, val) => acc + val, 0);
    }

    return series.length;
  }
}
