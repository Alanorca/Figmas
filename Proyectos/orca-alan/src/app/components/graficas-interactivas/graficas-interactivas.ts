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
import { AccordionModule } from 'primeng/accordion';
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
}

interface RecomendacionAsistente {
  tipo: 'info' | 'success' | 'warn' | 'error';
  icono: string;
  titulo: string;
  mensaje: string;
}

@Component({
  selector: 'app-graficas-interactivas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NgApexchartsModule,
    ButtonModule, SelectModule, ToggleButtonModule, TabsModule,
    DividerModule, InputTextModule, TooltipModule, TagModule, CardModule,
    AccordionModule
  ],
  templateUrl: './graficas-interactivas.html',
  styleUrl: './graficas-interactivas.scss'
})
export class GraficasInteractivasComponent {
  @ViewChild('chartRef') chartRef!: ChartComponent;

  @Input() set datos(value: DatosGrafica) {
    this.datosSignal.set(value);
  }
  @Input() set campoInicial(value: string) {
    if (value && value !== this.campoEjeX()) {
      this.campoEjeX.set(value);
    }
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
        { label: 'Polar Area', value: 'polarArea', icon: 'pi pi-slack', descripcion: 'Combina área y ángulo para comparar magnitudes. Ideal para datos cíclicos.', recomendadoPara: ['estado', 'tipoEntidad'] }
      ]
    },
    {
      label: 'Barras',
      value: 'barras',
      items: [
        { label: 'Columnas', value: 'column', icon: 'pi pi-chart-bar', descripcion: 'Comparación vertical de categorías. La más común y fácil de interpretar.', recomendadoPara: ['estado', 'responsable', 'contenedorNombre'] },
        { label: 'Barras Horizontal', value: 'bar', icon: 'pi pi-align-left', descripcion: 'Ideal cuando las etiquetas son largas o hay muchas categorías.', recomendadoPara: ['responsable', 'contenedorNombre'] },
        { label: 'Barras Apiladas', value: 'stackedBar', icon: 'pi pi-objects-column', descripcion: 'Muestra composición y total. Útil para comparar partes del todo.', recomendadoPara: ['estado', 'severidad'] },
        { label: 'Barras Agrupadas', value: 'groupedBar', icon: 'pi pi-th-large', descripcion: 'Compara múltiples series lado a lado. Ideal para comparar grupos.', recomendadoPara: ['tipoEntidad', 'estado'] }
      ]
    },
    {
      label: 'Líneas',
      value: 'lineas',
      items: [
        { label: 'Línea', value: 'line', icon: 'pi pi-chart-line', descripcion: 'Muestra tendencias en el tiempo. Ideal para datos secuenciales.', recomendadoPara: ['fecha'] },
        { label: 'Área', value: 'area', icon: 'pi pi-chart-line', descripcion: 'Línea con relleno que enfatiza el volumen. Buena para mostrar acumulados.', recomendadoPara: ['fecha'] },
        { label: 'Spline', value: 'spline', icon: 'pi pi-wave-pulse', descripcion: 'Línea suavizada para tendencias más fluidas. Estéticamente atractiva.', recomendadoPara: ['fecha'] },
        { label: 'Step Line', value: 'stepline', icon: 'pi pi-minus', descripcion: 'Muestra cambios discretos. Útil para datos que cambian en puntos específicos.', recomendadoPara: ['fecha', 'estado'] }
      ]
    },
    {
      label: 'Avanzadas',
      value: 'avanzadas',
      items: [
        { label: 'Radar', value: 'radar', icon: 'pi pi-stop', descripcion: 'Compara múltiples variables en un punto. Ideal para perfiles de riesgo.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Scatter', value: 'scatter', icon: 'pi pi-circle-fill', descripcion: 'Muestra correlación entre dos variables numéricas.', recomendadoPara: ['probabilidad', 'impacto'] },
        { label: 'Heatmap', value: 'heatmap', icon: 'pi pi-table', descripcion: 'Matriz de colores para identificar patrones. Útil para matrices de riesgo.', recomendadoPara: ['probabilidad', 'impacto', 'nivelRiesgo'] },
        { label: 'Treemap', value: 'treemap', icon: 'pi pi-objects-column', descripcion: 'Representa jerarquías con rectángulos proporcionales.', recomendadoPara: ['contenedorNombre', 'responsable'] }
      ]
    },
    {
      label: 'Embudo',
      value: 'embudo',
      items: [
        { label: 'Embudo', value: 'funnel', icon: 'pi pi-filter', descripcion: 'Visualiza procesos secuenciales con reducción. Ideal para flujos de trabajo.', recomendadoPara: ['estado'] },
        { label: 'Pirámide', value: 'pyramid', icon: 'pi pi-caret-up', descripcion: 'Similar al embudo pero invertido. Muestra jerarquías de importancia.', recomendadoPara: ['severidad', 'nivelRiesgo'] }
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

  getCampoDescripcion(campoValue: string): string {
    const campo = this.camposDisponibles.find(c => c.value === campoValue);
    return campo?.descripcion || '';
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
