import { Component, Input, Output, EventEmitter, signal, computed, effect, ViewChild, inject } from '@angular/core';
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
import { GroqService } from '../../services/groq.service';
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

  private groqService = inject(GroqService);

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
  @Output() filtroAplicado = new EventEmitter<FiltroGrafica | null>();

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

  // Valores disponibles para filtrado (ej: nombres de servidores, activos, etc.)
  @Input() valoresFiltrado: { campo: string; valores: string[] }[] = [];

  // Filtro activo
  filtroActivo = signal<FiltroGrafica | null>(null);

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
    this.tema.set(config.configuracion.tema);
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
    const series = this.chartSeries();
    if (series.length === 0) return 0;

    if (typeof series[0] === 'number') {
      return (series as number[]).reduce((acc, val) => acc + val, 0);
    }

    return series.length;
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
    if (config.tema) this.tema.set(config.tema);

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
    if (config?.tema) this.tema.set(config.tema);

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
}
