import { Component, inject, signal, computed, ViewChild, ElementRef, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule, Table } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { DatePickerModule } from 'primeng/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { DragDropModule } from 'primeng/dragdrop';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { DrawerModule } from 'primeng/drawer';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

// Componentes personalizados
import { GraficasInteractivasComponent, DatosGrafica, FiltroGrafica, TipoGraficaAvanzada } from '../../components/graficas-interactivas/graficas-interactivas';

// Type imports for Data Board (components not used but types referenced)
import type { RiskPoint } from '../../shared/components/data-board/risk-map/risk-map';
import type { KpiCardConfig } from '../../shared/components/data-board/kpi-card/kpi-card';

// Services & Models
import { TablaUnificadaService } from '../../services/tabla-unificada.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import {
  RegistroUnificado,
  TipoEntidad,
  ColumnaConfig,
  FiltroActivo,
  TipoColumna,
  ConfiguracionGrafica,
  TipoGrafica,
  WidgetGrafica,
  ExportacionProgramada,
  AlertaFiltro,
  VistaCompartida,
  GraphNode,
  GraphEdge
} from '../../models/tabla-unificada.models';

interface TipoGraficaOpcion {
  tipo: TipoGrafica;
  nombre: string;
  icono: string;
  descripcion: string;
}

interface ComentarioRegistro {
  id: string;
  registroId: string;
  texto: string;
  autor: string;
  fecha: Date;
  editado: boolean;
  fechaEdicion?: Date;
}

@Component({
  selector: 'app-tabla-unificada',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, MultiSelectModule, TagModule, ChipModule,
    TooltipModule, MenuModule, PopoverModule, CheckboxModule, SliderModule,
    DatePickerModule, PaginatorModule, DragDropModule, ToggleButtonModule,
    SelectButtonModule, PanelModule, DividerModule, BadgeModule,
    InputNumberModule, SkeletonModule, DrawerModule, TabsModule,
    MessageModule, ToolbarModule, IconFieldModule, InputIconModule, AutoCompleteModule,
    TimelineModule, ToastModule, StepsModule, ToggleSwitchModule,
    GraficasInteractivasComponent
  ],
  providers: [MessageService],
  templateUrl: './tabla-unificada.html',
  styleUrl: './tabla-unificada.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TablaUnificadaComponent implements OnInit {
  private service = inject(TablaUnificadaService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  // Referencias
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('dt') dt!: Table;

  // Estado del servicio
  estado = this.service.getEstado();
  columnasConfig = this.service.columnasConfig;
  columnasVisibles = this.service.columnasVisibles;
  datosPaginados = this.service.datosPaginados;
  datosFiltrados = this.service.datosFiltrados;
  contadores = this.service.contadores;
  busquedaGlobal = this.service.busquedaGlobal;
  presetsFecha = this.service.presetsFecha;
  opcionesEstado = this.service.opcionesEstado;

  // Estado local del componente
  showDetalleDrawer = signal(false);
  registroSeleccionado = signal<RegistroUnificado | null>(null);
  registrosSeleccionados = signal<RegistroUnificado[]>([]);
  showColumnasDialog = signal(false);
  showGraficasDialog = signal(false);
  showFiltroPopover = signal(false);
  columnaFiltroActual = signal<ColumnaConfig | null>(null);
  busquedaColumna = signal('');

  // Edición in-place
  registroEditando = signal<string | null>(null); // ID del registro en edición
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);
  accionesMasivasValues = signal<Record<string, any>>({});
  accionesMasivasColumnasActivas = signal<Set<string>>(new Set());

  // Todas las columnas editables (excluye ID, tipoEntidad que no tiene sentido cambiar)
  accionesMasivasColumnas = computed(() => {
    return this.columnasConfig().filter(col =>
      !['id', 'tipoEntidad', 'nivelRiesgo'].includes(col.field)
    );
  });

  // Dialogs de acciones masivas (legacy)
  showAsignarResponsableDialog = signal(false);
  showCambiarEstadoDialog = signal(false);
  nuevoResponsable = signal('');
  nuevoEstadoMasivo = signal('');

  // Autocompletado para filtro de contenedor (Activo/Proceso)
  contenedoresFiltrados = signal<{ nombre: string; tipo: 'activo' | 'proceso'; id: string }[]>([]);
  filtroTipoContenedor = signal<'todos' | 'activo' | 'proceso'>('todos');

  // Filtros de rango numérico con slider
  filtroProbabilidadRango = signal<[number, number]>([1, 5]);
  filtroImpactoRango = signal<[number, number]>([1, 5]);
  filtroNivelRiesgoRango = signal<[number, number]>([1, 25]);

  // Lista completa de contenedores disponibles
  contenedoresDisponibles = computed(() => {
    const datos = this.service.getDatosUnificados();
    const contenedoresMap = new Map<string, { nombre: string; tipo: 'activo' | 'proceso'; id: string }>();

    datos.forEach(d => {
      if (d.contenedorNombre && d.contenedorId) {
        const key = `${d.tipoContenedor}-${d.contenedorId}`;
        if (!contenedoresMap.has(key)) {
          contenedoresMap.set(key, {
            nombre: d.contenedorNombre,
            tipo: d.tipoContenedor as 'activo' | 'proceso',
            id: d.contenedorId
          });
        }
      }
    });

    return Array.from(contenedoresMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // Dialog de historial
  showHistorialDialog = signal(false);
  historialRegistro = signal<{ fecha: Date; usuario: string; accion: string; detalles: string }[]>([]);

  // Sistema de comentarios en registros
  comentariosRegistro = signal<ComentarioRegistro[]>([]);
  nuevoComentario = signal('');
  comentarioEditandoId = signal<string | null>(null);
  comentarioEditandoTexto = signal('');
  mostrandoComentarios = signal(true);

  // Historial de cambios inline
  mostrandoHistorial = signal(false);
  historialInline = signal<{ fecha: Date; usuario: string; accion: string; detalles: string; campo?: string; valorAnterior?: any; valorNuevo?: any }[]>([]);

  // ==================== NUEVAS FUNCIONALIDADES FASE 2 ====================

  // Widgets de dashboard
  widgets = this.service.widgets;
  showGuardarWidgetDialog = signal(false);
  nuevoWidget = signal<Partial<WidgetGrafica>>({ titulo: '', descripcion: '', tamaño: 'mediano' });

  // Exportaciones programadas
  exportacionesProgramadas = this.service.exportacionesProgramadas;
  showExportacionesDialog = signal(false);
  exportacionesTabActivo = 'nueva'; // 'nueva' | 'lista'
  exportacionEditandoId = signal<string | null>(null);

  // Alertas basadas en filtros
  alertas = this.service.alertas;
  showAlertasDialog = signal(false);
  alertasTabActivo = 'nueva'; // 'nueva' | 'lista'
  alertaEditandoId = signal<string | null>(null);

  // Vistas compartidas
  vistasCompartidas = this.service.vistasCompartidas;
  showCompartirDialog = signal(false);
  showVistasCompartidasDialog = signal(false);
  showVistasDialog = signal(false);
  nombreVistaCompartida = signal('');
  descripcionVistaCompartida = signal('');
  urlVistaCopiada = signal(false);
  ultimaVistaCreada = signal<VistaCompartida | null>(null);
  urlVistaCompartida = signal('');

  // Drawer de vistas guardadas
  mostrandoFormGuardar = signal(false);
  vistaCompartiendoId = signal<string | null>(null);
  vistaEditandoId = signal<string | null>(null);
  nuevaVistaGuardada: { nombre: string; descripcion: string; fechaExpiracion: Date | null } = { nombre: '', descripcion: '', fechaExpiracion: null };
  vistaEditando: { nombre: string; descripcion: string; fechaExpiracion: Date | null } = { nombre: '', descripcion: '', fechaExpiracion: null };
  emailCompartir = '';

  // Objetos para formularios de dialogs
  widgetConfig = { titulo: '', descripcion: '', tamano: 'mediano' as 'pequeño' | 'mediano' | 'grande' };
  vistaCompartida = { nombre: '', descripcion: '', fechaExpiracion: null as Date | null };
  nuevaAlerta = { nombre: '', operadorUmbral: 'mayor', umbral: 5, prioridad: '', notificarEmail: false, notificarPush: false, notificarInApp: true };
  nuevaExportacion = { nombre: '', formato: '', frecuencia: '', hora: null as Date | null, destinatarios: '' };
  today = new Date();

  // Gráficas combinadas
  tipoGraficaCombinada = signal<'barras_linea' | 'area_linea' | 'barras_area'>('barras_linea');
  serieSecundariaColumna = signal('');
  serieSecundariaAgregacion = signal<'conteo' | 'suma' | 'promedio'>('conteo');
  mostrarEjeYSecundario = signal(true);

  // ==================== PANEL DE VISUALIZACIÓN SANKEY ====================
  mostrarPanelVisualizacion = signal(false);
  tipoGraficaVisualizacion = signal<TipoGraficaAvanzada>('sankey');
  nombreGraficoVisualizacion = signal('Flujo: Subtipo → Estado');

  // Gráficos guardados
  graficosGuardados = signal<{ id: string; nombre: string; tipo: string; config: any }[]>([
    { id: '1', nombre: 'Matriz de Correlación de Variables de Riesgo', tipo: 'correlationMatrix', config: {} },
    { id: '2', nombre: 'Flujo: Subtipo → Estado', tipo: 'sankey', config: {} },
    { id: '3', nombre: 'Distribución por Severidad', tipo: 'donut', config: {} }
  ]);
  graficoSeleccionadoId = signal<string>('2');

  // Período de tiempo para visualización
  periodoVisualizacion = signal<'todo' | 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año'>('todo');

  // Tipos de gráfica disponibles para el panel
  tiposGraficaVisualizacion: { tipo: TipoGraficaAvanzada; nombre: string; icono: string }[] = [
    { tipo: 'line', nombre: 'Línea', icono: 'pi pi-chart-line' },
    { tipo: 'bar', nombre: 'Barras', icono: 'pi pi-chart-bar' },
    { tipo: 'column', nombre: 'Barras H.', icono: 'pi pi-align-left' },
    { tipo: 'pie', nombre: 'Pastel', icono: 'pi pi-chart-pie' },
    { tipo: 'donut', nombre: 'Dona', icono: 'pi pi-circle' },
    { tipo: 'radar', nombre: 'Radar', icono: 'pi pi-compass' },
    { tipo: 'riskMatrix', nombre: 'Mapa de Riesgos', icono: 'pi pi-th-large' },
    { tipo: 'scatter', nombre: 'Dispersión', icono: 'pi pi-circle-fill' },
    { tipo: 'bubble', nombre: 'Burbujas', icono: 'pi pi-circle' },
    { tipo: 'correlationMatrix', nombre: 'Matriz Corr.', icono: 'pi pi-table' },
    { tipo: 'gauge', nombre: 'Velocímetro', icono: 'pi pi-gauge' },
    { tipo: 'stackedBar', nombre: 'Barras Apiladas', icono: 'pi pi-server' },
    { tipo: 'stackedBarHorizontal', nombre: 'Barras H. Apiladas', icono: 'pi pi-align-justify' },
    { tipo: 'area', nombre: 'Área', icono: 'pi pi-map' },
    { tipo: 'stackedArea', nombre: 'Áreas Apiladas', icono: 'pi pi-chart-line' },
    { tipo: 'combo', nombre: 'Barras + Línea', icono: 'pi pi-sliders-h' },
    { tipo: 'heatmap', nombre: 'Heatmap Temporal', icono: 'pi pi-calendar' },
    { tipo: 'boxplot', nombre: 'Boxplot', icono: 'pi pi-minus' },
    { tipo: 'regression', nombre: 'Regresión', icono: 'pi pi-chart-line' },
    { tipo: 'dumbbell', nombre: 'Dumbbell', icono: 'pi pi-arrows-h' },
    { tipo: 'treemap', nombre: 'Treemap', icono: 'pi pi-objects-column' },
    { tipo: 'sunburst', nombre: 'Sunburst', icono: 'pi pi-sun' },
    { tipo: 'waterfall', nombre: 'Cascada', icono: 'pi pi-chart-bar' },
    { tipo: 'bullet', nombre: 'Bullet', icono: 'pi pi-minus' },
    { tipo: 'sankey', nombre: 'Sankey', icono: 'pi pi-share-alt' }
  ];

  // Configuración de datos para el gráfico
  campoOrigenSankey = signal<string>('tipoEntidad');
  campoDestinoSankey = signal<string>('estado');

  // Computed: Datos para visualización según el tipo de gráfico
  datosVisualizacion = computed<DatosGrafica>(() => {
    const datos = this.datosFiltrados();
    const tipo = this.tipoGraficaVisualizacion();

    if (tipo === 'sankey') {
      return this.generarDatosSankey(datos);
    }

    // Para otros tipos, agrupar por estado
    const conteo: Record<string, number> = {};
    datos.forEach(d => {
      const key = d.estado || 'Sin estado';
      conteo[key] = (conteo[key] || 0) + 1;
    });

    return {
      labels: Object.keys(conteo),
      series: [{ name: 'Cantidad', data: Object.values(conteo) }]
    };
  });

  // Drawer de relaciones/grafo
  showRelacionesDrawer = signal(false);
  registroRelaciones = signal<RegistroUnificado | null>(null);
  graphData = signal<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  graphZoom = signal(1);
  graphPanX = signal(0);
  graphPanY = signal(0);
  isPanning = false;
  lastPanPosition = { x: 0, y: 0 };

  // Columnas ordenadas según el estado actual (para el drawer)
  columnasOrdenadas = computed(() => {
    const columnas = this.columnasConfig();
    const orden = this.estado().ordenColumnas;
    return [...columnas].sort((a, b) => {
      const indexA = orden.indexOf(a.field);
      const indexB = orden.indexOf(b.field);
      // Si no está en el orden, ponerlo al final
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  });

  // Columnas filtradas por búsqueda
  columnasFiltradas = computed(() => {
    const busqueda = this.busquedaColumna().toLowerCase().trim();
    const columnas = this.columnasOrdenadas();

    if (!busqueda) {
      return columnas;
    }

    return columnas.filter(col =>
      col.header.toLowerCase().includes(busqueda) ||
      col.field.toLowerCase().includes(busqueda) ||
      col.tipo.toLowerCase().includes(busqueda)
    );
  });

  // Estado del filtro temporal
  filtroTemp = signal<{
    operador: string;
    valor: any;
    valorHasta?: any;
    valoresSeleccionados: string[];
  }>({
    operador: 'contiene',
    valor: '',
    valorHasta: undefined,
    valoresSeleccionados: []
  });

  // Opciones de entidades
  entidadOptions = [
    { label: 'Riesgos', value: 'riesgo', icon: 'pi pi-shield' },
    { label: 'Incidentes', value: 'incidente', icon: 'pi pi-exclamation-triangle' },
    { label: 'Activos', value: 'activo', icon: 'pi pi-box' },
    { label: 'Procesos', value: 'proceso', icon: 'pi pi-sitemap' },
    { label: 'Defectos', value: 'defecto', icon: 'pi pi-bug' },
    { label: 'Revisiones', value: 'revision', icon: 'pi pi-file-check' },
    { label: 'Cumplimiento', value: 'cumplimiento', icon: 'pi pi-verified' }
  ];

  // Opciones para filtros de columna
  tipoEntidadOptions = [
    { label: 'Riesgo', value: 'riesgo', icon: 'pi pi-shield' },
    { label: 'Incidente', value: 'incidente', icon: 'pi pi-exclamation-triangle' },
    { label: 'Activo', value: 'activo', icon: 'pi pi-box' },
    { label: 'Proceso', value: 'proceso', icon: 'pi pi-sitemap' },
    { label: 'Defecto', value: 'defecto', icon: 'pi pi-bug' },
    { label: 'Revisión', value: 'revision', icon: 'pi pi-file-check' },
    { label: 'Cumplimiento', value: 'cumplimiento', icon: 'pi pi-verified' }
  ];

  estadoOptions = [
    { label: 'Identificado', value: 'identificado' },
    { label: 'Evaluado', value: 'evaluado' },
    { label: 'Mitigado', value: 'mitigado' },
    { label: 'Aceptado', value: 'aceptado' },
    { label: 'Abierto', value: 'abierto' },
    { label: 'En Proceso', value: 'en_proceso' },
    { label: 'Resuelto', value: 'resuelto' },
    { label: 'Cerrado', value: 'cerrado' }
  ];

  severidadOptions = [
    { label: 'Crítica', value: 'critica' },
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  nivelRiesgoOptions = [
    { label: 'Crítico (15-25)', value: 'critico', severity: 'danger' as const, min: 15, max: 25 },
    { label: 'Alto (10-14)', value: 'alto', severity: 'warn' as const, min: 10, max: 14 },
    { label: 'Medio (5-9)', value: 'medio', severity: 'info' as const, min: 5, max: 9 },
    { label: 'Bajo (1-4)', value: 'bajo', severity: 'success' as const, min: 1, max: 4 }
  ];

  // Opciones de operadores
  operadoresTexto = [
    { label: 'Contiene', value: 'contiene' },
    { label: 'Empieza con', value: 'empieza_con' },
    { label: 'Termina con', value: 'termina_con' },
    { label: 'Igual a', value: 'igual' }
  ];

  operadoresNumero = [
    { label: 'Igual a', value: 'igual' },
    { label: 'Mayor que', value: 'mayor' },
    { label: 'Menor que', value: 'menor' },
    { label: 'Entre', value: 'entre' }
  ];

  operadoresFecha = [
    { label: 'Igual a', value: 'igual' },
    { label: 'Antes de', value: 'antes' },
    { label: 'Después de', value: 'despues' },
    { label: 'Entre', value: 'entre' }
  ];

  // Opciones para alertas
  operadoresUmbral = [
    { label: 'Mayor que', value: 'mayor' },
    { label: 'Menor que', value: 'menor' },
    { label: 'Igual a', value: 'igual' },
    { label: 'Diferente de', value: 'diferente' }
  ];

  prioridadOptions = [
    { label: 'Baja', value: 'baja' },
    { label: 'Media', value: 'media' },
    { label: 'Alta', value: 'alta' },
    { label: 'Crítica', value: 'critica' }
  ];

  // Opciones para exportaciones programadas
  formatoExportacionOptions = [
    { label: 'Excel (.xlsx)', value: 'excel' },
    { label: 'CSV', value: 'csv' }
  ];

  frecuenciaOptions = [
    { label: 'Diaria', value: 'diaria' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' }
  ];

  // Opciones de registros por página
  registrosPorPaginaOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // ==================== DATA BOARD - KPIs & RISK MAP ====================
  showDashboardView = signal(false);

  // KPI Cards computados dinámicamente
  kpiCards = computed<KpiCardConfig[]>(() => {
    const datos = this.datosFiltrados();
    const contadores = this.contadores();

    // Contar por estado
    const enProgreso = datos.filter(d => ['evaluado', 'en_progreso', 'abierto'].includes(d.estado)).length;
    const criticos = datos.filter(d =>
      (d.nivelRiesgo && d.nivelRiesgo >= 15) ||
      d.severidad === 'critico' ||
      d.severidad === 'alto'
    ).length;
    const resueltos = datos.filter(d => ['mitigado', 'cerrado', 'resuelto'].includes(d.estado)).length;

    // Calcular tendencias (simulado - en producción sería con datos históricos)
    const totalAnterior = Math.max(1, contadores.total - Math.floor(Math.random() * 10));
    const cambioTotal = ((contadores.total - totalAnterior) / totalAnterior) * 100;

    return [
      {
        id: 'total',
        title: 'Total Registros',
        value: contadores.total,
        icon: 'pi pi-database',
        color: 'primary',
        percentChange: cambioTotal,
        trend: cambioTotal > 0 ? 'up' : cambioTotal < 0 ? 'down' : 'stable',
        decisionLevel: 'executive'
      },
      {
        id: 'riesgos',
        title: 'Riesgos',
        value: contadores.riesgos,
        icon: 'pi pi-shield',
        color: 'warning',
        percentChange: 5.2,
        trend: 'up',
        decisionLevel: 'tactical'
      },
      {
        id: 'incidentes',
        title: 'Incidentes',
        value: contadores.incidentes,
        icon: 'pi pi-exclamation-triangle',
        color: 'danger',
        percentChange: -3.1,
        trend: 'down',
        decisionLevel: 'operational'
      },
      {
        id: 'criticos',
        title: 'Críticos',
        value: criticos,
        icon: 'pi pi-exclamation-circle',
        color: 'danger',
        target: 0,
        targetLabel: 'Objetivo',
        decisionLevel: 'executive'
      },
      {
        id: 'en-progreso',
        title: 'En Progreso',
        value: enProgreso,
        icon: 'pi pi-spinner',
        color: 'info',
        decisionLevel: 'operational'
      },
      {
        id: 'resueltos',
        title: 'Resueltos',
        value: resueltos,
        icon: 'pi pi-check-circle',
        color: 'success',
        percentChange: 12.5,
        trend: 'up',
        decisionLevel: 'tactical'
      }
    ];
  });

  // Puntos para el Risk Map
  riskMapPoints = computed<RiskPoint[]>(() => {
    const datos = this.datosFiltrados();

    // Filtrar solo registros con probabilidad e impacto
    return datos
      .filter(d => d.probabilidad !== undefined && d.impacto !== undefined)
      .map(d => ({
        id: d.id,
        name: d.descripcion || d.titulo || d.id,
        probability: d.probabilidad!,
        impact: d.impacto!,
        metadata: {
          estado: d.estado,
          responsable: d.responsable,
          tipoEntidad: d.tipoEntidad
        }
      }));
  });

  // Toggle dashboard view
  toggleDashboardView(): void {
    this.showDashboardView.update(v => !v);
  }

  // Handler para click en KPI Card
  onKpiCardClick(config: KpiCardConfig): void {
    // Filtrar tabla por el tipo de KPI seleccionado
    switch (config.id) {
      case 'riesgos':
        this.onEntidadChange('riesgo');
        break;
      case 'incidentes':
        this.onEntidadChange('incidente');
        break;
      case 'criticos':
        // Filtrar por nivel crítico
        this.messageService.add({
          severity: 'info',
          summary: 'Filtro aplicado',
          detail: 'Mostrando registros críticos'
        });
        break;
    }
  }

  // Handler para click en punto del Risk Map
  onRiskMapPointClick(point: RiskPoint): void {
    const registro = this.datosFiltrados().find(d => d.id === point.id);
    if (registro) {
      this.verDetalle(registro);
    }
  }

  // Handler para click en celda del Risk Map
  onRiskMapCellClick(cell: { probability: number; impact: number }): void {
    const registrosEnCelda = this.datosFiltrados().filter(d =>
      d.probabilidad === cell.probability && d.impacto === cell.impact
    );

    if (registrosEnCelda.length > 0) {
      this.messageService.add({
        severity: 'info',
        summary: `Celda (${cell.probability}, ${cell.impact})`,
        detail: `${registrosEnCelda.length} registro(s) en esta posición`
      });
    }
  }

  // Estado del asistente de gráficas
  pasoGrafica = signal(1);
  columnaGraficaSeleccionada = signal('estado');
  configGrafica = signal<ConfiguracionGrafica>({
    tipo: 'pie',
    titulo: 'Gráfica',
    columnaCategoria: 'estado',
    agregacion: 'conteo',
    mostrarLeyenda: true,
    posicionLeyenda: 'derecha',
    mostrarEtiquetas: true,
    paletaColores: 'default',
    mostrarGrid: true
  });

  // Filtro activo para gráficas (desde asistente IA)
  filtroGraficaActivo = signal<FiltroGrafica | null>(null);

  // Datos para gráfica interactiva (ApexCharts)
  datosGraficaInteractiva = computed<DatosGrafica>(() => {
    let datos = this.datosFiltrados();
    const columna = this.columnaGraficaSeleccionada();
    const filtro = this.filtroGraficaActivo();

    // Aplicar filtro de gráfica si existe
    if (filtro && filtro.campo && filtro.valor) {
      datos = datos.filter(d => {
        const valorCampo = (d as any)[filtro.campo];
        if (valorCampo === undefined || valorCampo === null) return false;
        return String(valorCampo).toLowerCase().includes(filtro.valor.toLowerCase());
      });
    }

    const agrupados = new Map<string, number>();

    datos.forEach(d => {
      let valor = (d as any)[columna];
      if (valor === undefined || valor === null) valor = 'Sin definir';
      if (columna === 'nivelRiesgo' && typeof valor === 'number') {
        valor = this.getNivelRiesgoLabel(valor);
      }
      const categoria = String(valor);
      agrupados.set(categoria, (agrupados.get(categoria) || 0) + 1);
    });

    return {
      labels: Array.from(agrupados.keys()),
      series: Array.from(agrupados.values())
    };
  });

  // Valores disponibles para filtrado en gráficas (activos, responsables, etc.)
  valoresFiltradoGrafica = computed(() => {
    const datos = this.datosFiltrados();
    const contenedores = new Set<string>();
    const responsables = new Set<string>();

    datos.forEach(d => {
      if (d.contenedorNombre) contenedores.add(d.contenedorNombre);
      if (d.responsable) responsables.add(d.responsable);
    });

    return [
      { campo: 'contenedorNombre', valores: Array.from(contenedores).sort() },
      { campo: 'responsable', valores: Array.from(responsables).sort() }
    ];
  });

  // Opciones de columnas para gráficas
  columnasGraficaOptions = [
    { label: 'Tipo de Entidad', value: 'tipoEntidad' },
    { label: 'Estado', value: 'estado' },
    { label: 'Nivel de Riesgo', value: 'nivelRiesgo' },
    { label: 'Severidad', value: 'severidad' },
    { label: 'Activo/Proceso', value: 'contenedorNombre' },
    { label: 'Responsable', value: 'responsable' }
  ];

  tiposGrafica: TipoGraficaOpcion[] = [
    { tipo: 'pie', nombre: 'Pie', icono: 'pi pi-chart-pie', descripcion: 'Distribución porcentual' },
    { tipo: 'dona', nombre: 'Dona', icono: 'pi pi-circle', descripcion: 'Distribución con centro vacío' },
    { tipo: 'barras', nombre: 'Barras', icono: 'pi pi-chart-bar', descripcion: 'Comparar cantidades' },
    { tipo: 'lineas', nombre: 'Líneas', icono: 'pi pi-chart-line', descripcion: 'Tendencia temporal' },
    { tipo: 'radar', nombre: 'Radar', icono: 'pi pi-slack', descripcion: 'Múltiples dimensiones' },
    { tipo: 'embudo', nombre: 'Embudo', icono: 'pi pi-filter', descripcion: 'Procesos secuenciales con reducción' },
    { tipo: 'piramide', nombre: 'Pirámide', icono: 'pi pi-caret-up', descripcion: 'Jerarquías de importancia' },
    { tipo: 'radial', nombre: 'Radial', icono: 'pi pi-sun', descripcion: 'Progreso circular con porcentajes' }
  ];

  columnasParaGrafica = computed(() => {
    return this.columnasConfig()
      .filter(c => c.tipo === 'seleccion' || c.tipo === 'texto')
      .map(c => ({ label: c.header, value: c.field }));
  });

  columnasNumericas = computed(() => {
    return this.columnasConfig()
      .filter(c => c.tipo === 'numero')
      .map(c => ({ label: c.header, value: c.field }));
  });

  // Rango de valores para filtros numéricos con slider
  rangoSliderNumerico = signal<[number, number]>([0, 100]);

  // Computed para obtener min/max de un campo numérico
  rangoColumnaActual = computed(() => {
    const columna = this.columnaFiltroActual();
    if (!columna || columna.tipo !== 'numero') {
      return { min: 0, max: 100, step: 1 };
    }

    const datos = this.service.getDatosUnificados();
    const valores = datos
      .map(d => (d as any)[columna.field])
      .filter(v => v !== null && v !== undefined && typeof v === 'number');

    if (valores.length === 0) {
      return { min: 0, max: 100, step: 1 };
    }

    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const rango = max - min;

    // Calcular step adecuado según el rango
    let step = 1;
    if (rango <= 5) step = 0.5;
    else if (rango <= 10) step = 1;
    else if (rango <= 100) step = 5;
    else if (rango <= 1000) step = 10;
    else step = 50;

    return { min, max, step };
  });

  // Datos de la gráfica
  chartData = computed(() => {
    const config = this.configGrafica();
    const datos = this.service.obtenerDatosGrafica(
      config.columnaCategoria,
      config.agregacion,
      config.columnaValor
    );

    const colores = this.obtenerColores(datos.labels.length, config.paletaColores);

    if (config.tipo === 'pie' || config.tipo === 'dona') {
      return {
        labels: datos.labels,
        datasets: [{
          data: datos.valores,
          backgroundColor: colores,
          hoverBackgroundColor: colores.map(c => this.adjustBrightness(c, 20))
        }]
      };
    } else if (config.tipo === 'barras') {
      return {
        labels: datos.labels,
        datasets: [{
          label: config.titulo,
          data: datos.valores,
          backgroundColor: colores[0],
          borderColor: colores[0],
          borderWidth: 1
        }]
      };
    } else if (config.tipo === 'lineas') {
      const datosTemporal = this.service.obtenerDatosLineaTemporal(
        'fecha',
        config.agrupacionTemporal || 'mes',
        config.agregacion
      );
      return {
        labels: datosTemporal.labels,
        datasets: [{
          label: config.titulo,
          data: datosTemporal.valores,
          fill: false,
          borderColor: colores[0],
          tension: 0.4
        }]
      };
    } else if (config.tipo === 'radar') {
      return {
        labels: datos.labels,
        datasets: [{
          label: config.titulo,
          data: datos.valores,
          backgroundColor: colores[0] + '40',
          borderColor: colores[0],
          pointBackgroundColor: colores[0]
        }]
      };
    }

    return { labels: [], datasets: [] };
  });

  chartOptions = computed(() => {
    const config = this.configGrafica();
    const baseOptions = {
      plugins: {
        legend: {
          display: config.mostrarLeyenda,
          position: config.posicionLeyenda
        }
      },
      responsive: true,
      maintainAspectRatio: false
    };

    if (config.tipo === 'dona') {
      return { ...baseOptions, cutout: '50%' };
    }

    if (config.tipo === 'barras' || config.tipo === 'lineas') {
      return {
        ...baseOptions,
        scales: {
          x: { grid: { display: config.mostrarGrid } },
          y: { grid: { display: config.mostrarGrid }, beginAtZero: true }
        }
      };
    }

    return baseOptions;
  });

  // Computed: Entidad seleccionada (primera del array)
  entidadSeleccionada = computed(() => {
    const entidades = this.estado().entidadesSeleccionadas;
    return entidades.length > 0 ? entidades[0] : 'riesgo';
  });

  // Métodos de entidades
  onEntidadChange(entidad: TipoEntidad): void {
    this.service.setEntidadesSeleccionadas([entidad]);
  }

  onEntidadesChange(entidades: TipoEntidad[]): void {
    this.service.setEntidadesSeleccionadas(entidades);
  }

  // Métodos de filtros
  abrirFiltro(columna: ColumnaConfig, event: Event): void {
    this.columnaFiltroActual.set(columna);

    // Inicializar valores según el tipo de columna
    if (columna.tipo === 'numero') {
      // Calcular rango para slider
      const rango = this.rangoColumnaActual();
      this.rangoSliderNumerico.set([rango.min, rango.max]);
      this.filtroTemp.set({
        operador: 'entre', // Por defecto usar rango para numéricos
        valor: rango.min,
        valorHasta: rango.max,
        valoresSeleccionados: []
      });
    } else {
      this.filtroTemp.set({
        operador: columna.tipo === 'texto' ? 'contiene' : 'igual',
        valor: '',
        valorHasta: undefined,
        valoresSeleccionados: []
      });
    }

    this.showFiltroPopover.set(true);
  }

  // Método para actualizar filtro desde el slider de rango
  onSliderRangoChange(valores: number[]): void {
    if (valores.length >= 2) {
      this.rangoSliderNumerico.set([valores[0], valores[1]]);
      this.filtroTemp.update(f => ({
        ...f,
        valor: valores[0],
        valorHasta: valores[1]
      }));
    }
  }

  aplicarFiltro(): void {
    const columna = this.columnaFiltroActual();
    const temp = this.filtroTemp();

    if (!columna) return;

    let etiqueta = '';
    let valor = temp.valor;

    if (columna.tipo === 'seleccion' && temp.valoresSeleccionados.length > 0) {
      valor = temp.valoresSeleccionados;
      etiqueta = `${columna.header}: ${temp.valoresSeleccionados.join(', ')}`;
    } else if (columna.tipo === 'fecha') {
      etiqueta = `${columna.header}: ${temp.operador} ${new Date(temp.valor).toLocaleDateString()}`;
      if (temp.operador === 'entre' && temp.valorHasta) {
        etiqueta += ` - ${new Date(temp.valorHasta).toLocaleDateString()}`;
      }
    } else if (columna.tipo === 'numero') {
      etiqueta = `${columna.header}: ${temp.operador} ${temp.valor}`;
      if (temp.operador === 'entre' && temp.valorHasta !== undefined) {
        etiqueta += ` - ${temp.valorHasta}`;
      }
    } else {
      etiqueta = `${columna.header} ${temp.operador} "${temp.valor}"`;
    }

    const filtro: FiltroActivo = {
      columna: columna.field,
      tipo: columna.tipo,
      operador: temp.operador,
      valor: valor,
      valorHasta: temp.valorHasta,
      etiqueta
    };

    this.service.agregarFiltro(filtro);
    this.showFiltroPopover.set(false);
  }

  eliminarFiltro(index: number): void {
    this.service.eliminarFiltro(index);
  }

  limpiarTodosFiltros(): void {
    this.service.limpiarFiltros();
    if (this.dt) {
      this.dt.clear();
    }
  }

  aplicarPresetFecha(preset: any): void {
    const { desde, hasta } = preset.getFechas();
    this.filtroTemp.update(f => ({
      ...f,
      operador: 'entre',
      valor: desde,
      valorHasta: hasta
    }));
  }

  // Métodos de búsqueda global
  onBusquedaGlobal(valor: string): void {
    this.busquedaGlobal.set(valor);
  }

  // Métodos de filtros de rango numérico con slider
  onProbabilidadRangoChange(index: 0 | 1, valor: number, filterCallback: (value: any) => void): void {
    const rango = [...this.filtroProbabilidadRango()] as [number, number];
    rango[index] = valor || 1;
    // Asegurar que min <= max
    if (index === 0 && rango[0] > rango[1]) rango[1] = rango[0];
    if (index === 1 && rango[1] < rango[0]) rango[0] = rango[1];
    this.filtroProbabilidadRango.set(rango);
    this.aplicarFiltroRango('probabilidad', rango, filterCallback);
  }

  onProbabilidadSliderChange(rango: number[], filterCallback: (value: any) => void): void {
    this.filtroProbabilidadRango.set(rango as [number, number]);
    this.aplicarFiltroRango('probabilidad', rango as [number, number], filterCallback);
  }

  onImpactoRangoChange(index: 0 | 1, valor: number, filterCallback: (value: any) => void): void {
    const rango = [...this.filtroImpactoRango()] as [number, number];
    rango[index] = valor || 1;
    if (index === 0 && rango[0] > rango[1]) rango[1] = rango[0];
    if (index === 1 && rango[1] < rango[0]) rango[0] = rango[1];
    this.filtroImpactoRango.set(rango);
    this.aplicarFiltroRango('impacto', rango, filterCallback);
  }

  onImpactoSliderChange(rango: number[], filterCallback: (value: any) => void): void {
    this.filtroImpactoRango.set(rango as [number, number]);
    this.aplicarFiltroRango('impacto', rango as [number, number], filterCallback);
  }

  onNivelRiesgoRangoChange(index: 0 | 1, valor: number, filterCallback: (value: any) => void): void {
    const rango = [...this.filtroNivelRiesgoRango()] as [number, number];
    rango[index] = valor || 1;
    if (index === 0 && rango[0] > rango[1]) rango[1] = rango[0];
    if (index === 1 && rango[1] < rango[0]) rango[0] = rango[1];
    this.filtroNivelRiesgoRango.set(rango);
    this.aplicarFiltroRango('nivelRiesgo', rango, filterCallback);
  }

  onNivelRiesgoSliderChange(rango: number[], filterCallback: (value: any) => void): void {
    this.filtroNivelRiesgoRango.set(rango as [number, number]);
    this.aplicarFiltroRango('nivelRiesgo', rango as [number, number], filterCallback);
  }

  private aplicarFiltroRango(campo: string, rango: [number, number], filterCallback: (value: any) => void): void {
    // Si el rango cubre todo el espectro, limpiar filtro
    const esRangoCompleto = (campo === 'probabilidad' || campo === 'impacto')
      ? (rango[0] === 1 && rango[1] === 5)
      : (rango[0] === 1 && rango[1] === 25);

    if (esRangoCompleto) {
      filterCallback(null);
    } else {
      // Para filtros de rango, PrimeNG espera un objeto con matchMode 'between'
      // pero como usamos matchMode 'in', pasamos los valores permitidos
      const valoresPermitidos: number[] = [];
      for (let i = rango[0]; i <= rango[1]; i++) {
        valoresPermitidos.push(i);
      }
      filterCallback(valoresPermitidos);
    }
  }

  // Métodos de columnas
  toggleColumnaVisibilidad(field: string): void {
    this.service.toggleColumna(field);
  }

  restaurarColumnas(): void {
    this.service.restaurarColumnasDefecto();
  }

  // Manejar reorden de columnas desde la tabla (drag en headers)
  onColReorder(event: any): void {
    const columns = event.columns as ColumnaConfig[];
    const nuevoOrden = columns.map(col => col.field);
    this.service.reordenarColumnas(nuevoOrden);
  }

  // Drag and drop en el drawer de configuración
  draggedColumna: ColumnaConfig | null = null;

  onDragStartEvent(event: DragEvent, columna: ColumnaConfig): void {
    this.draggedColumna = columna;
  }

  onDragEnd(): void {
    this.draggedColumna = null;
  }

  onDropColumnaEvent(event: DragEvent, targetColumna: ColumnaConfig): void {
    if (this.draggedColumna && this.draggedColumna.field !== targetColumna.field) {
      // Usar las columnas ordenadas actualmente
      const columnas = [...this.columnasOrdenadas()];
      const draggedIndex = columnas.findIndex(c => c.field === this.draggedColumna!.field);
      const targetIndex = columnas.findIndex(c => c.field === targetColumna.field);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Reordenar el array
        const [removed] = columnas.splice(draggedIndex, 1);
        columnas.splice(targetIndex, 0, removed);

        // Actualizar el orden en el estado (usar método completo porque es desde el drawer)
        const nuevoOrden = columnas.map(c => c.field);
        this.service.reordenarColumnasCompleto(nuevoOrden);
      }
    }
    this.draggedColumna = null;
  }

  // Métodos de ordenamiento
  onSort(event: any): void {
    if (event.field && event.order) {
      this.service.setOrdenamiento(event.field, event.order === 1 ? 'asc' : 'desc');
    }
  }

  // Métodos de paginación
  onPageChange(event: any): void {
    this.service.setPagina(event.page);
    this.service.setRegistrosPorPagina(event.rows);
  }

  // Métodos de detalle
  verDetalle(registro: RegistroUnificado): void {
    this.registroSeleccionado.set(registro);
    this.cargarComentarios(registro.id); // Cargar comentarios del registro
    this.cargarHistorialInline(registro); // Cargar historial de cambios
    this.nuevoComentario.set(''); // Limpiar input de comentario
    this.comentarioEditandoId.set(null); // Cancelar cualquier edición
    this.showDetalleDrawer.set(true);
  }

  cargarHistorialInline(registro: RegistroUnificado): void {
    // En producción esto vendría del backend
    const historial = [
      {
        fecha: new Date(),
        usuario: 'Sistema',
        accion: 'Visualizado',
        detalles: 'Registro consultado',
        campo: undefined,
        valorAnterior: undefined,
        valorNuevo: undefined
      },
      {
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000),
        usuario: registro.responsable || 'Usuario',
        accion: 'Modificado',
        detalles: 'Estado actualizado',
        campo: 'estado',
        valorAnterior: 'pendiente',
        valorNuevo: registro.estado
      },
      {
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
        usuario: 'Admin',
        accion: 'Asignado',
        detalles: 'Responsable asignado',
        campo: 'responsable',
        valorAnterior: 'Sin asignar',
        valorNuevo: registro.responsable || 'Sin asignar'
      },
      {
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        usuario: registro.tipoEntidad === 'incidente' ? (registro.reportadoPor || 'Sistema') : 'Sistema',
        accion: 'Creado',
        detalles: `${this.getTipoEntidadLabel(registro.tipoEntidad)} registrado`,
        campo: undefined,
        valorAnterior: undefined,
        valorNuevo: undefined
      }
    ];
    this.historialInline.set(historial);
  }

  // Métodos de edición in-place
  iniciarEdicion(registro: RegistroUnificado, event: Event): void {
    event.stopPropagation();
    this.registroEditando.set(registro.id);
    // Copiar valores actuales para edición
    this.valoresEdicion.set({
      estado: registro.estado,
      severidad: registro.severidad,
      responsable: registro.responsable,
      descripcion: registro.descripcion,
      fecha: registro.fecha,
      probabilidad: registro.probabilidad,
      impacto: registro.impacto,
      contenedorNombre: registro.contenedorNombre
    });
  }

  estaEditando(registroId: string): boolean {
    return this.registroEditando() === registroId;
  }

  getValorEdicion(field: string): any {
    return this.valoresEdicion()[field];
  }

  setValorEdicion(field: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [field]: valor }));
  }

  guardarEdicion(registro: RegistroUnificado, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();

    console.log(`Guardando edición del registro ${registro.id}:`, valores);
    // Aquí implementarías la lógica real de guardado
    // Por ejemplo: this.service.actualizarRegistro(registro.id, valores);

    this.registroEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.registroEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de exportación
  exportarCSV(): void {
    this.service.exportarDatos('csv', true);
  }

  exportarExcel(): void {
    this.service.exportarDatos('excel', true);
  }

  exportarPDF(): void {
    this.service.exportarDatos('pdf', true);
  }

  // Métodos para gráficas interactivas
  getTituloGrafica(): string {
    const opcion = this.columnasGraficaOptions.find(o => o.value === this.columnaGraficaSeleccionada());
    return `Distribución por ${opcion?.label || 'Categoría'}`;
  }

  onCampoGraficaChange(event: { campo: string; tipo: string }): void {
    // Actualizar la columna seleccionada cuando cambia en el componente de gráficas
    this.columnaGraficaSeleccionada.set(event.campo);
  }

  onGraficaDataPointClick(event: { categoria: string; valor: number; serie?: string }): void {
    console.log('Data point clicked:', event);
    // Aquí se puede implementar drill-down o filtrado automático
  }

  onGraficaLegendClick(event: { serie: string; visible: boolean }): void {
    console.log('Legend clicked:', event);
  }

  onFiltroGraficaAplicado(filtro: FiltroGrafica | null): void {
    console.log('Filtro de gráfica aplicado:', filtro);
    this.filtroGraficaActivo.set(filtro);
  }

  exportarGraficaImagen(formato: 'png' | 'jpg'): void {
    const canvas = document.querySelector('.chart-container canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `grafica-${this.configGrafica().tipo}-${Date.now()}.${formato}`;

    if (formato === 'png') {
      link.href = canvas.toDataURL('image/png');
    } else {
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    }

    link.click();
  }

  // Métodos de gráficas
  seleccionarTipoGrafica(tipo: TipoGrafica): void {
    this.configGrafica.update(c => ({ ...c, tipo }));
  }

  siguientePasoGrafica(): void {
    this.pasoGrafica.update(p => Math.min(p + 1, 3));
  }

  anteriorPasoGrafica(): void {
    this.pasoGrafica.update(p => Math.max(p - 1, 1));
  }

  abrirGraficas(): void {
    this.pasoGrafica.set(1);
    this.showGraficasDialog.set(true);
  }

  // Helpers de severidad/estado
  getSeveridadTag(severidad: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (severidad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      case 'baja': return 'success';
      default: return 'secondary';
    }
  }

  getEstadoTag(estado: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (estado) {
      case 'identificado':
      case 'abierto': return 'danger';
      case 'evaluado':
      case 'en_proceso': return 'warn';
      case 'mitigado':
      case 'resuelto': return 'success';
      case 'aceptado':
      case 'cerrado': return 'info';
      default: return 'secondary';
    }
  }

  getNivelRiesgoTag(nivel: number): 'danger' | 'warn' | 'success' | 'info' {
    if (nivel >= 15) return 'danger';
    if (nivel >= 10) return 'warn';
    if (nivel >= 5) return 'info';
    return 'success';
  }

  getNivelRiesgoLabel(nivel: number): string {
    if (nivel >= 15) return 'Crítico';
    if (nivel >= 10) return 'Alto';
    if (nivel >= 5) return 'Medio';
    return 'Bajo';
  }

  formatearEstado(estado: string): string {
    return estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTipoEntidadIcon(tipo: TipoEntidad): string {
    const iconos: Record<string, string> = {
      'riesgo': 'pi pi-shield',
      'incidente': 'pi pi-exclamation-triangle',
      'activo': 'pi pi-box',
      'proceso': 'pi pi-sitemap',
      'defecto': 'pi pi-bug',
      'revision': 'pi pi-file-check',
      'cumplimiento': 'pi pi-verified'
    };
    return iconos[tipo] || 'pi pi-file';
  }

  getTipoEntidadLabel(tipo: TipoEntidad): string {
    const labels: Record<string, string> = {
      'riesgo': 'Riesgo',
      'incidente': 'Incidente',
      'activo': 'Activo',
      'proceso': 'Proceso',
      'defecto': 'Defecto',
      'revision': 'Revisión',
      'cumplimiento': 'Cumplimiento'
    };
    return labels[tipo] || tipo;
  }

  // Helpers de colores
  private obtenerColores(cantidad: number, paleta: string): string[] {
    const paletas: Record<string, string[]> = {
      default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'],
      semantica: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'],
      monocromatica: ['#1E3A5F', '#2E5984', '#3E78A9', '#4E97CE', '#6EB5E8', '#8ED3F2']
    };

    const coloresBase = paletas[paleta] || paletas['default'];
    const resultado: string[] = [];

    for (let i = 0; i < cantidad; i++) {
      resultado.push(coloresBase[i % coloresBase.length]);
    }

    return resultado;
  }

  private adjustBrightness(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }

  // Tracking para ngFor
  trackByField(index: number, columna: ColumnaConfig): string {
    return columna.field;
  }

  trackById(index: number, registro: RegistroUnificado): string {
    return registro.id;
  }

  // Menú contextual para registros
  getMenuItemsRegistro(registro: RegistroUnificado): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.verDetalle(registro) },
      { label: 'Ver relaciones', icon: 'pi pi-sitemap', command: () => this.verRelaciones(registro) },
      { label: 'Edición rápida', icon: 'pi pi-pencil', command: () => this.iniciarEdicionDesdeMenu(registro) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => console.log('Eliminar', registro.id) }
    ];
  }

  iniciarEdicionDesdeMenu(registro: RegistroUnificado): void {
    this.registroEditando.set(registro.id);
    this.valoresEdicion.set({
      descripcion: registro.descripcion,
      contenedorNombre: registro.contenedorNombre,
      estado: registro.estado,
      fecha: registro.fecha,
      responsable: registro.responsable,
      probabilidad: registro.probabilidad,
      impacto: registro.impacto,
      severidad: registro.severidad
    });
  }

  // Menú de exportación
  exportMenuItems: MenuItem[] = [
    { label: 'Excel (.xlsx)', icon: 'pi pi-file-excel', command: () => this.exportarExcel() },
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.exportarPDF() },
    { label: 'CSV', icon: 'pi pi-file', command: () => this.exportarCSV() },
    { separator: true },
    { label: 'Exportaciones programadas', icon: 'pi pi-calendar', command: () => this.showExportacionesDialog.set(true) }
  ];

  // Menú de acciones masivas
  accionesMasivasMenuItems: MenuItem[] = [
    {
      label: 'Cambiar estado',
      icon: 'pi pi-refresh',
      command: () => this.abrirCambiarEstadoDialog()
    },
    {
      label: 'Asignar responsable',
      icon: 'pi pi-user',
      command: () => this.abrirAsignarResponsableDialog()
    },
    { separator: true },
    {
      label: 'Exportar seleccionados',
      icon: 'pi pi-download',
      items: [
        { label: 'Excel (.xlsx)', icon: 'pi pi-file-excel', command: () => this.exportarSeleccionados('excel') },
        { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.exportarSeleccionados('pdf') },
        { label: 'CSV', icon: 'pi pi-file', command: () => this.exportarSeleccionados('csv') }
      ]
    },
    { separator: true },
    {
      label: 'Eliminar seleccionados',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.eliminarSeleccionados()
    }
  ];

  // Métodos de selección masiva
  onSelectionChange(registros: RegistroUnificado[]): void {
    this.registrosSeleccionados.set(registros);
  }

  seleccionarTodos(): void {
    this.registrosSeleccionados.set([...this.datosFiltrados()]);
  }

  deseleccionarTodos(): void {
    this.registrosSeleccionados.set([]);
  }

  // Drawer de acciones masivas
  abrirAccionesMasivasDrawer(): void {
    this.accionesMasivasValues.set({});
    this.accionesMasivasColumnasActivas.set(new Set());
    this.showAccionesMasivasDrawer.set(true);
  }

  toggleColumnaAccionMasiva(field: string): void {
    const activas = new Set(this.accionesMasivasColumnasActivas());
    if (activas.has(field)) {
      activas.delete(field);
      // Limpiar el valor al desactivar
      const valores = { ...this.accionesMasivasValues() };
      delete valores[field];
      this.accionesMasivasValues.set(valores);
    } else {
      activas.add(field);
    }
    this.accionesMasivasColumnasActivas.set(activas);
  }

  isColumnaAccionActiva(field: string): boolean {
    return this.accionesMasivasColumnasActivas().has(field);
  }

  actualizarValorAccionMasiva(field: string, valor: any): void {
    this.accionesMasivasValues.update(v => ({ ...v, [field]: valor }));
  }

  getValorAccionMasiva(field: string): any {
    return this.accionesMasivasValues()[field];
  }

  aplicarAccionesMasivas(): void {
    const seleccionados = this.registrosSeleccionados();
    const valores = this.accionesMasivasValues();
    const columnasActivas = this.accionesMasivasColumnasActivas();

    if (seleccionados.length === 0 || columnasActivas.size === 0) return;

    // Preparar los cambios
    const cambios: { campo: string; valor: any }[] = [];
    columnasActivas.forEach(field => {
      if (valores[field] !== undefined && valores[field] !== null && valores[field] !== '') {
        cambios.push({ campo: field, valor: valores[field] });
      }
    });

    if (cambios.length === 0) return;

    console.log(`Aplicando cambios masivos a ${seleccionados.length} registros:`, cambios);
    // Aquí implementarías la lógica real de actualización masiva
    // Por ejemplo: this.service.actualizarMasivo(seleccionados.map(r => r.id), cambios);

    this.showAccionesMasivasDrawer.set(false);
    this.deseleccionarTodos();
  }

  getCantidadCambiosPendientes(): number {
    const valores = this.accionesMasivasValues();
    const activas = this.accionesMasivasColumnasActivas();
    let count = 0;
    activas.forEach(field => {
      if (valores[field] !== undefined && valores[field] !== null && valores[field] !== '') {
        count++;
      }
    });
    return count;
  }

  // Dialogs de acciones masivas (legacy)
  abrirCambiarEstadoDialog(): void {
    this.nuevoEstadoMasivo.set('');
    this.showCambiarEstadoDialog.set(true);
  }

  abrirAsignarResponsableDialog(): void {
    this.nuevoResponsable.set('');
    this.showAsignarResponsableDialog.set(true);
  }

  confirmarCambiarEstado(): void {
    const seleccionados = this.registrosSeleccionados();
    const nuevoEstado = this.nuevoEstadoMasivo();
    if (seleccionados.length === 0 || !nuevoEstado) return;

    console.log(`Cambiando estado de ${seleccionados.length} registros a: ${nuevoEstado}`);
    // Aquí implementarías la lógica real de cambio de estado
    // Por ejemplo: this.service.cambiarEstadoMasivo(seleccionados.map(r => r.id), nuevoEstado);

    this.showCambiarEstadoDialog.set(false);
    this.deseleccionarTodos();
  }

  confirmarAsignarResponsable(): void {
    const seleccionados = this.registrosSeleccionados();
    const responsable = this.nuevoResponsable();
    if (seleccionados.length === 0 || !responsable) return;

    console.log(`Asignando responsable "${responsable}" a ${seleccionados.length} registros`);
    // Aquí implementarías la lógica real de asignación
    // Por ejemplo: this.service.asignarResponsableMasivo(seleccionados.map(r => r.id), responsable);

    this.showAsignarResponsableDialog.set(false);
    this.deseleccionarTodos();
  }

  exportarSeleccionados(formato: 'csv' | 'excel' | 'pdf'): void {
    const seleccionados = this.registrosSeleccionados();
    if (seleccionados.length === 0) return;

    // Exportar solo los seleccionados usando el servicio
    this.service.exportarDatosSeleccionados(seleccionados, formato);
  }

  eliminarSeleccionados(): void {
    const seleccionados = this.registrosSeleccionados();
    if (seleccionados.length === 0) return;

    console.log(`Eliminando ${seleccionados.length} registros`);
    // Aquí mostrarías un dialog de confirmación
    this.deseleccionarTodos();
  }

  // === AUTOCOMPLETADO DE CONTENEDORES ===
  buscarContenedores(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    const tipoFiltro = this.filtroTipoContenedor();

    let resultados = this.contenedoresDisponibles().filter(c =>
      c.nombre.toLowerCase().includes(query)
    );

    if (tipoFiltro !== 'todos') {
      resultados = resultados.filter(c => c.tipo === tipoFiltro);
    }

    this.contenedoresFiltrados.set(resultados);
  }

  onContenedorSeleccionado(event: any): void {
    if (event && event.nombre) {
      this.filtroTemp.update(f => ({ ...f, valor: event.nombre }));
    }
  }

  setFiltroTipoContenedor(tipo: 'todos' | 'activo' | 'proceso'): void {
    this.filtroTipoContenedor.set(tipo);
  }

  // === HIGHLIGHT DE BÚSQUEDA ===
  highlightText(texto: string | undefined | null): string {
    if (!texto) return '';
    const busqueda = this.busquedaGlobal().trim();
    if (!busqueda) return texto;

    // Soportar múltiples términos separados por espacios
    const terminos = busqueda.split(/\s+/).filter(t => t.length > 0);

    if (terminos.length === 0) return texto;

    let resultado = texto;

    // Aplicar highlight para cada término
    terminos.forEach((termino, index) => {
      const regex = new RegExp(`(${this.escapeRegex(termino)})`, 'gi');
      // Alternar entre clases para distinguir múltiples términos
      const className = index % 2 === 0 ? 'search-highlight' : 'search-highlight-alt';
      resultado = resultado.replace(regex, `<mark class="${className}">$1</mark>`);
    });

    return resultado;
  }

  // Contador de coincidencias para mostrar en UI
  getCoincidencias(texto: string | undefined | null): number {
    if (!texto) return 0;
    const busqueda = this.busquedaGlobal().trim();
    if (!busqueda) return 0;

    const terminos = busqueda.split(/\s+/).filter(t => t.length > 0);
    let total = 0;

    terminos.forEach(termino => {
      const regex = new RegExp(this.escapeRegex(termino), 'gi');
      const matches = texto.match(regex);
      total += matches ? matches.length : 0;
    });

    return total;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // === ACCIONES DEL DRAWER DE DETALLE ===
  editarDesdeDetalle(): void {
    const registro = this.registroSeleccionado();
    if (registro) {
      this.showDetalleDrawer.set(false);
      this.iniciarEdicion(registro, new Event('click'));
    }
  }

  verHistorial(): void {
    const registro = this.registroSeleccionado();
    if (!registro) return;

    // Simular historial (en producción vendría del backend)
    const historialSimulado = [
      {
        fecha: new Date(),
        usuario: 'Sistema',
        accion: 'Visualizado',
        detalles: 'Registro consultado'
      },
      {
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000),
        usuario: registro.responsable || 'Usuario',
        accion: 'Modificado',
        detalles: `Estado cambiado a "${registro.estado}"`
      },
      {
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        usuario: 'Admin',
        accion: 'Asignado',
        detalles: `Responsable asignado: ${registro.responsable || 'Sin asignar'}`
      },
      {
        fecha: registro.fecha,
        usuario: registro.tipoEntidad === 'incidente' ? (registro.reportadoPor || 'Sistema') : 'Sistema',
        accion: 'Creado',
        detalles: `${registro.tipoEntidad === 'riesgo' ? 'Riesgo' : 'Incidente'} registrado en el sistema`
      }
    ];

    this.historialRegistro.set(historialSimulado);
    this.showHistorialDialog.set(true);
  }

  navegarAlContenedor(): void {
    const registro = this.registroSeleccionado();
    if (!registro || !registro.contenedorId) return;

    const ruta = registro.tipoContenedor === 'activo' ? '/activos' : '/procesos';
    // En producción usarías el Router para navegar
    console.log(`Navegando a ${ruta}/${registro.contenedorId}`);
  }

  getHistorialIcon(accion: string): string {
    switch (accion.toLowerCase()) {
      case 'creado': return 'pi pi-plus-circle';
      case 'modificado': return 'pi pi-pencil';
      case 'asignado': return 'pi pi-user';
      case 'visualizado': return 'pi pi-eye';
      case 'eliminado': return 'pi pi-trash';
      default: return 'pi pi-circle';
    }
  }

  getHistorialColor(accion: string): string {
    switch (accion.toLowerCase()) {
      case 'creado': return 'var(--green-500)';
      case 'modificado': return 'var(--blue-500)';
      case 'asignado': return 'var(--purple-500)';
      case 'visualizado': return 'var(--gray-500)';
      case 'eliminado': return 'var(--red-500)';
      default: return 'var(--primary-color)';
    }
  }

  // ==================== SISTEMA DE COMENTARIOS ====================

  cargarComentarios(registroId: string): void {
    // En producción esto cargaría del backend
    // Por ahora simulamos algunos comentarios
    const comentariosSimulados: ComentarioRegistro[] = [
      {
        id: 'c1',
        registroId,
        texto: 'Se ha revisado este registro y requiere seguimiento adicional.',
        autor: 'Ana García',
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        editado: false
      },
      {
        id: 'c2',
        registroId,
        texto: 'Actualización: El responsable ha sido notificado del estado actual.',
        autor: 'Carlos López',
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        editado: true,
        fechaEdicion: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];
    this.comentariosRegistro.set(comentariosSimulados);
  }

  agregarComentario(): void {
    const texto = this.nuevoComentario().trim();
    const registro = this.registroSeleccionado();

    if (!texto || !registro) return;

    const nuevoComentario: ComentarioRegistro = {
      id: `c${Date.now()}`,
      registroId: registro.id,
      texto,
      autor: 'Usuario Actual', // En producción vendría del servicio de autenticación
      fecha: new Date(),
      editado: false
    };

    this.comentariosRegistro.update(comentarios => [nuevoComentario, ...comentarios]);
    this.nuevoComentario.set('');

    this.messageService.add({
      severity: 'success',
      summary: 'Comentario agregado',
      detail: 'Tu comentario ha sido guardado correctamente'
    });
  }

  iniciarEdicionComentario(comentario: ComentarioRegistro): void {
    this.comentarioEditandoId.set(comentario.id);
    this.comentarioEditandoTexto.set(comentario.texto);
  }

  guardarEdicionComentario(): void {
    const id = this.comentarioEditandoId();
    const texto = this.comentarioEditandoTexto().trim();

    if (!id || !texto) return;

    this.comentariosRegistro.update(comentarios =>
      comentarios.map(c =>
        c.id === id
          ? { ...c, texto, editado: true, fechaEdicion: new Date() }
          : c
      )
    );

    this.comentarioEditandoId.set(null);
    this.comentarioEditandoTexto.set('');

    this.messageService.add({
      severity: 'info',
      summary: 'Comentario editado',
      detail: 'Los cambios han sido guardados'
    });
  }

  cancelarEdicionComentario(): void {
    this.comentarioEditandoId.set(null);
    this.comentarioEditandoTexto.set('');
  }

  eliminarComentario(id: string): void {
    this.comentariosRegistro.update(comentarios =>
      comentarios.filter(c => c.id !== id)
    );

    this.messageService.add({
      severity: 'warn',
      summary: 'Comentario eliminado',
      detail: 'El comentario ha sido eliminado'
    });
  }

  formatearFechaComentario(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / (1000 * 60));
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    if (dias < 7) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
    return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }

  // ==================== WIDGETS DE DASHBOARD ====================
  abrirGuardarWidgetDialog(): void {
    this.nuevoWidget.set({
      titulo: this.configGrafica().titulo || 'Nueva gráfica',
      descripcion: '',
      tamaño: 'mediano'
    });
    this.showGuardarWidgetDialog.set(true);
  }

  guardarComoWidget(): void {
    const widget = this.nuevoWidget();
    if (!widget.titulo?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa un título para el widget'
      });
      return;
    }

    const nuevoWidget = this.service.guardarWidget({
      titulo: widget.titulo,
      descripcion: widget.descripcion,
      configuracion: this.configGrafica(),
      filtros: this.estado().filtrosActivos,
      entidades: this.estado().entidadesSeleccionadas,
      tamaño: widget.tamaño || 'mediano'
    });

    this.showGuardarWidgetDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Widget guardado',
      detail: `"${nuevoWidget.titulo}" se agregó al dashboard`
    });
  }

  eliminarWidget(id: string): void {
    this.service.eliminarWidget(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Widget eliminado',
      detail: 'El widget se eliminó del dashboard'
    });
  }

  // ==================== EXPORTAR GRÁFICA A EXCEL ====================
  exportarGraficaExcel(): void {
    const datos = this.datosGraficaInteractiva();
    const titulo = this.configGrafica().titulo || 'grafica';

    if (!datos.labels.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay datos para exportar'
      });
      return;
    }

    // Convertir series a valores simples
    let valores: number[] = [];
    if (typeof datos.series[0] === 'number') {
      valores = datos.series as number[];
    } else {
      valores = (datos.series[0] as any)?.data || [];
    }

    this.service.exportarGraficaExcel({ labels: datos.labels, valores }, titulo);
    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Los datos de la gráfica se exportaron a Excel'
    });
  }

  // ==================== EXPORTACIONES PROGRAMADAS ====================
  toggleExportacion(id: string): void {
    this.service.toggleExportacionProgramada(id);
  }

  eliminarExportacion(id: string): void {
    this.service.eliminarExportacionProgramada(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'Exportación programada eliminada'
    });
  }

  getFrecuenciaLabel(frecuencia: string): string {
    const labels: Record<string, string> = {
      'diaria': 'diariamente',
      'semanal': 'semanalmente',
      'mensual': 'mensualmente'
    };
    return labels[frecuencia] || frecuencia;
  }

  // ==================== ALERTAS ====================
  getAlertasActivasCount(): number {
    return this.alertas().filter(a => a.activa).length;
  }

  eliminarAlerta(id: string): void {
    this.service.eliminarAlerta(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'Alerta eliminada'
    });
  }

  verificarAlertas(): void {
    const alertasActivadas = this.service.verificarAlertas();
    if (alertasActivadas.length > 0) {
      alertasActivadas.forEach(alerta => {
        this.messageService.add({
          severity: this.getPrioridadSeverity(alerta.prioridad),
          summary: `Alerta: ${alerta.nombre}`,
          detail: alerta.descripcion || 'Se han cumplido las condiciones de la alerta',
          life: 10000
        });
      });
    }
  }

  getPrioridadSeverity(prioridad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'baja': 'success',
      'media': 'info',
      'alta': 'warn',
      'critica': 'danger'
    };
    return map[prioridad] || 'info';
  }

  getPrioridadColor(prioridad: string): string {
    const colors: Record<string, string> = {
      'baja': '#22c55e',
      'media': '#eab308',
      'alta': '#f97316',
      'critica': '#ef4444'
    };
    return colors[prioridad] || '#6b7280';
  }

  // ==================== VISTAS COMPARTIDAS ====================
  abrirCompartirDialog(): void {
    this.nombreVistaCompartida.set('');
    this.descripcionVistaCompartida.set('');
    this.ultimaVistaCreada.set(null);
    this.urlVistaCopiada.set(false);
    this.showCompartirDialog.set(true);
  }

  crearVistaCompartida(): void {
    const nombre = this.nombreVistaCompartida();
    if (!nombre.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa un nombre para la vista compartida'
      });
      return;
    }

    const vista = this.service.crearVistaCompartida(nombre, this.descripcionVistaCompartida());
    this.ultimaVistaCreada.set(vista);

    this.messageService.add({
      severity: 'success',
      summary: 'Vista compartida creada',
      detail: 'Copia el enlace para compartir'
    });
  }

  getUrlVistaCompartida(): string {
    const vista = this.ultimaVistaCreada();
    if (!vista) return '';
    return this.service.obtenerUrlVistaCompartida(vista.codigo);
  }

  copiarUrlAlPortapapeles(): void {
    const url = this.getUrlVistaCompartida();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.urlVistaCopiada.set(true);
        this.messageService.add({
          severity: 'success',
          summary: 'Copiado',
          detail: 'Enlace copiado al portapapeles'
        });
        setTimeout(() => this.urlVistaCopiada.set(false), 3000);
      });
    }
  }

  eliminarVistaCompartida(id: string): void {
    this.service.eliminarVistaCompartida(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'Vista compartida eliminada'
    });
  }

  aplicarVistaCompartida(vista: VistaCompartida): void {
    this.service.aplicarVistaCompartida(vista);
    this.showVistasCompartidasDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Vista aplicada',
      detail: `Se aplicó la configuración de "${vista.nombre}"`
    });
  }

  // ==================== INICIALIZACIÓN ====================
  ngOnInit(): void {
    // Verificar si hay una vista compartida en la URL
    this.route.queryParams.subscribe(params => {
      if (params['vista']) {
        const vista = this.service.obtenerVistaCompartida(params['vista']);
        if (vista) {
          this.service.aplicarVistaCompartida(vista);
          this.messageService.add({
            severity: 'info',
            summary: 'Vista cargada',
            detail: `Se aplicó la vista compartida "${vista.nombre}"`
          });
        }
      }
    });

    // Verificar alertas activas
    setTimeout(() => this.verificarAlertas(), 2000);
  }

  // ==================== MÉTODOS PARA DIALOGS DE UI ====================

  // Widget methods
  setWidgetTamano(tamano: 'pequeño' | 'mediano' | 'grande'): void {
    this.widgetConfig.tamano = tamano;
  }

  mostrarGuardarWidget(): void {
    this.widgetConfig = {
      titulo: this.getTituloGrafica(),
      descripcion: '',
      tamano: 'mediano'
    };
    this.showGuardarWidgetDialog.set(true);
  }

  guardarWidget(): void {
    if (!this.widgetConfig.titulo?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa un título para el widget'
      });
      return;
    }

    const nuevoWidget = this.service.guardarWidget({
      titulo: this.widgetConfig.titulo,
      descripcion: this.widgetConfig.descripcion,
      configuracion: this.configGrafica(),
      filtros: this.estado().filtrosActivos,
      entidades: this.estado().entidadesSeleccionadas,
      tamaño: this.widgetConfig.tamano
    });

    this.showGuardarWidgetDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Widget guardado',
      detail: `"${nuevoWidget.titulo}" se agregó al dashboard`
    });
  }

  // Alerta methods
  mostrarNuevaAlerta(): void {
    this.alertaEditandoId.set(null);
    this.nuevaAlerta = {
      nombre: '',
      operadorUmbral: 'mayor',
      umbral: 5,
      prioridad: '',
      notificarEmail: false,
      notificarPush: false,
      notificarInApp: true
    };
    this.alertasTabActivo = 'nueva';
    this.showAlertasDialog.set(true);
  }

  toggleAlertaActiva(alerta: AlertaFiltro): void {
    this.service.toggleAlerta(alerta.id);
  }

  crearAlerta(): void {
    if (!this.nuevaAlerta.nombre?.trim() || !this.nuevaAlerta.prioridad) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Completa todos los campos requeridos'
      });
      return;
    }

    const notificarPor: ('email' | 'push' | 'inApp')[] = [];
    if (this.nuevaAlerta.notificarEmail) notificarPor.push('email');
    if (this.nuevaAlerta.notificarPush) notificarPor.push('push');
    if (this.nuevaAlerta.notificarInApp) notificarPor.push('inApp');

    const nuevaAlerta = this.service.crearAlerta({
      nombre: this.nuevaAlerta.nombre,
      condiciones: this.estado().filtrosActivos,
      entidades: this.estado().entidadesSeleccionadas,
      umbral: this.nuevaAlerta.umbral,
      operadorUmbral: this.nuevaAlerta.operadorUmbral as 'mayor' | 'menor' | 'igual' | 'diferente',
      prioridad: this.nuevaAlerta.prioridad as 'baja' | 'media' | 'alta' | 'critica',
      notificarPor: notificarPor.length > 0 ? notificarPor : ['inApp'],
      destinatarios: [],
      activa: true
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Alerta creada',
      detail: `"${nuevaAlerta.nombre}" te notificará cuando se cumplan las condiciones`
    });
  }

  // Crear/editar alerta y cambiar al tab de lista
  crearAlertaYCambiarTab(): void {
    if (!this.nuevaAlerta.nombre?.trim() || !this.nuevaAlerta.prioridad) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Completa todos los campos requeridos'
      });
      return;
    }

    const notificarPor: ('email' | 'push' | 'inApp')[] = [];
    if (this.nuevaAlerta.notificarEmail) notificarPor.push('email');
    if (this.nuevaAlerta.notificarPush) notificarPor.push('push');
    if (this.nuevaAlerta.notificarInApp) notificarPor.push('inApp');

    const editandoId = this.alertaEditandoId();

    if (editandoId) {
      // Actualizar alerta existente
      this.service.actualizarAlerta(editandoId, {
        nombre: this.nuevaAlerta.nombre,
        umbral: this.nuevaAlerta.umbral,
        operadorUmbral: this.nuevaAlerta.operadorUmbral as 'mayor' | 'menor' | 'igual' | 'diferente',
        prioridad: this.nuevaAlerta.prioridad as 'baja' | 'media' | 'alta' | 'critica',
        notificarPor: notificarPor.length > 0 ? notificarPor : ['inApp']
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Alerta actualizada',
        detail: `"${this.nuevaAlerta.nombre}" ha sido actualizada`
      });

      this.alertaEditandoId.set(null);
    } else {
      // Crear nueva alerta
      const nuevaAlerta = this.service.crearAlerta({
        nombre: this.nuevaAlerta.nombre,
        condiciones: this.estado().filtrosActivos,
        entidades: this.estado().entidadesSeleccionadas,
        umbral: this.nuevaAlerta.umbral,
        operadorUmbral: this.nuevaAlerta.operadorUmbral as 'mayor' | 'menor' | 'igual' | 'diferente',
        prioridad: this.nuevaAlerta.prioridad as 'baja' | 'media' | 'alta' | 'critica',
        notificarPor: notificarPor.length > 0 ? notificarPor : ['inApp'],
        destinatarios: [],
        activa: true
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Alerta creada',
        detail: `"${nuevaAlerta.nombre}" te notificará cuando se cumplan las condiciones`
      });
    }

    // Limpiar formulario y cambiar al tab de lista
    this.nuevaAlerta = {
      nombre: '',
      operadorUmbral: 'mayor',
      umbral: 5,
      prioridad: '',
      notificarEmail: false,
      notificarPush: false,
      notificarInApp: true
    };
    this.alertasTabActivo = 'lista';
  }

  // Editar alerta existente
  editarAlerta(alerta: AlertaFiltro): void {
    this.alertaEditandoId.set(alerta.id);
    this.nuevaAlerta = {
      nombre: alerta.nombre,
      operadorUmbral: alerta.operadorUmbral,
      umbral: alerta.umbral,
      prioridad: alerta.prioridad,
      notificarEmail: alerta.notificarPor.includes('email'),
      notificarPush: alerta.notificarPor.includes('push'),
      notificarInApp: alerta.notificarPor.includes('inApp')
    };
    this.alertasTabActivo = 'nueva';
  }

  // Obtener label del operador
  getOperadorLabel(operador: string): string {
    const labels: Record<string, string> = {
      'mayor': 'más de',
      'menor': 'menos de',
      'igual': 'exactamente',
      'diferente': 'diferente de'
    };
    return labels[operador] || operador;
  }

  // Métodos para grafo de relaciones
  verRelaciones(registro: RegistroUnificado): void {
    this.registroRelaciones.set(registro);
    this.graphZoom.set(1);
    this.graphPanX.set(0);
    this.graphPanY.set(0);
    this.generarGraphData(registro);
    this.showRelacionesDrawer.set(true);
  }

  generarGraphData(registro: RegistroUnificado): void {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Nodo central (el registro seleccionado)
    nodes.push({
      id: registro.id,
      label: registro.descripcion || registro.nombre || 'Sin nombre',
      type: 'central',
      icon: this.getTipoEntidadIcon(registro.tipoEntidad),
      color: this.getNodeColor(registro.tipoEntidad)
    });

    // Buscar relaciones en los datos
    const datos = this.service.datosUnificados();

    // Si tiene contenedor, agregar el contenedor como nodo
    if (registro.contenedorId && registro.contenedorNombre) {
      const contenedorTipo = registro.tipoContenedor === 'activo' ? 'activo' : 'proceso';
      nodes.push({
        id: registro.contenedorId,
        label: registro.contenedorNombre,
        type: contenedorTipo as TipoEntidad,
        icon: this.getTipoEntidadIcon(contenedorTipo as TipoEntidad),
        color: this.getNodeColor(contenedorTipo as TipoEntidad)
      });
      edges.push({
        source: registro.id,
        target: registro.contenedorId,
        label: 'pertenece a'
      });
    }

    // Buscar otros registros que comparten el mismo contenedor
    if (registro.contenedorId) {
      const relacionados = datos.filter(d =>
        d.id !== registro.id &&
        d.contenedorId === registro.contenedorId
      ).slice(0, 6);

      relacionados.forEach(rel => {
        nodes.push({
          id: rel.id,
          label: rel.descripcion || rel.nombre || 'Sin nombre',
          type: rel.tipoEntidad,
          icon: this.getTipoEntidadIcon(rel.tipoEntidad),
          color: this.getNodeColor(rel.tipoEntidad)
        });
        edges.push({
          source: registro.contenedorId!,
          target: rel.id,
          label: 'contiene'
        });
      });
    }

    // Buscar registros del mismo tipo con estado similar
    const similares = datos.filter(d =>
      d.id !== registro.id &&
      d.tipoEntidad === registro.tipoEntidad &&
      d.estado === registro.estado &&
      !nodes.find(n => n.id === d.id)
    ).slice(0, 4);

    similares.forEach(sim => {
      nodes.push({
        id: sim.id,
        label: sim.descripcion || sim.nombre || 'Sin nombre',
        type: sim.tipoEntidad,
        icon: this.getTipoEntidadIcon(sim.tipoEntidad),
        color: this.getNodeColor(sim.tipoEntidad)
      });
      edges.push({
        source: registro.id,
        target: sim.id,
        label: 'relacionado'
      });
    });

    this.graphData.set({ nodes, edges });
  }

  getNodeColor(tipo: TipoEntidad | 'central'): string {
    const colors: Record<string, string> = {
      'central': '#6366f1',
      'riesgo': '#f59e0b',
      'incidente': '#ef4444',
      'activo': '#22c55e',
      'proceso': '#3b82f6',
      'defecto': '#ec4899',
      'revision': '#8b5cf6',
      'cumplimiento': '#06b6d4'
    };
    return colors[tipo] || '#6b7280';
  }

  getNodePosition(index: number, total: number, isCenter: boolean): { x: number; y: number } {
    if (isCenter) {
      return { x: 200, y: 200 };
    }
    const angle = (2 * Math.PI * index) / (total - 1) - Math.PI / 2;
    const radius = 150;
    return {
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle)
    };
  }

  onGraphWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.3, Math.min(3, this.graphZoom() + delta));
    this.graphZoom.set(newZoom);
  }

  onGraphMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      this.isPanning = true;
      this.lastPanPosition = { x: event.clientX, y: event.clientY };
    }
  }

  onGraphMouseMove(event: MouseEvent): void {
    if (!this.isPanning) return;

    const deltaX = event.clientX - this.lastPanPosition.x;
    const deltaY = event.clientY - this.lastPanPosition.y;

    const zoomFactor = this.graphZoom();
    this.graphPanX.update(x => x + deltaX / zoomFactor);
    this.graphPanY.update(y => y + deltaY / zoomFactor);

    this.lastPanPosition = { x: event.clientX, y: event.clientY };
  }

  onGraphMouseUp(): void {
    this.isPanning = false;
  }

  resetGraphView(): void {
    this.graphZoom.set(1);
    this.graphPanX.set(0);
    this.graphPanY.set(0);
  }

  zoomInGraph(): void {
    this.graphZoom.update(z => Math.min(z + 0.2, 3));
  }

  zoomOutGraph(): void {
    this.graphZoom.update(z => Math.max(z - 0.2, 0.3));
  }

  // Métodos helper para el grafo
  getEdgeSourcePosition(edge: GraphEdge): { x: number; y: number } {
    const data = this.graphData();
    if (!data) return { x: 0, y: 0 };
    const node = data.nodes.find(n => n.id === edge.source);
    if (!node) return { x: 0, y: 0 };
    const index = data.nodes.indexOf(node);
    return this.getNodePosition(index, data.nodes.length, node.type === 'central');
  }

  getEdgeTargetPosition(edge: GraphEdge): { x: number; y: number } {
    const data = this.graphData();
    if (!data) return { x: 0, y: 0 };
    const node = data.nodes.find(n => n.id === edge.target);
    if (!node) return { x: 0, y: 0 };
    const index = data.nodes.indexOf(node);
    return this.getNodePosition(index, data.nodes.length, node.type === 'central');
  }

  // Vista compartida methods
  mostrarCompartirVista(): void {
    this.vistaCompartida = {
      nombre: '',
      descripcion: '',
      fechaExpiracion: null
    };
    this.urlVistaCompartida.set('');
    this.showCompartirDialog.set(true);
  }

  generarEnlaceVista(): void {
    if (!this.vistaCompartida.nombre?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa un nombre para la vista'
      });
      return;
    }

    const vista = this.service.crearVistaCompartida(
      this.vistaCompartida.nombre,
      this.vistaCompartida.descripcion
    );
    const url = this.service.obtenerUrlVistaCompartida(vista.codigo);
    this.urlVistaCompartida.set(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Enlace generado',
      detail: 'Copia el enlace para compartir'
    });
  }

  copiarUrlVista(): void {
    const url = this.urlVistaCompartida();
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copiado',
          detail: 'Enlace copiado al portapapeles'
        });
      });
    }
  }

  aplicarVista(vista: VistaCompartida): void {
    this.service.aplicarVistaCompartida(vista);
    this.showVistasDialog.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Vista aplicada',
      detail: `Se aplicó la configuración de "${vista.nombre}"`
    });
  }

  copiarUrlVistaGuardada(vista: VistaCompartida): void {
    const url = this.service.obtenerUrlVistaCompartida(vista.codigo);
    navigator.clipboard.writeText(url).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Enlace copiado al portapapeles'
      });
    });
  }

  eliminarVista(id: string): void {
    this.service.eliminarVistaCompartida(id);
    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'Vista eliminada'
    });
  }

  // Métodos para drawer de vistas guardadas
  guardarVistaActual(): void {
    if (!this.nuevaVistaGuardada.nombre.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Ingresa un nombre para la vista'
      });
      return;
    }

    const vista = this.service.crearVistaCompartidaConExpiracion(
      this.nuevaVistaGuardada.nombre,
      this.nuevaVistaGuardada.descripcion,
      this.nuevaVistaGuardada.fechaExpiracion
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Vista guardada',
      detail: `"${vista.nombre}" ha sido guardada`
    });

    // Limpiar formulario
    this.nuevaVistaGuardada = { nombre: '', descripcion: '', fechaExpiracion: null };
    this.mostrandoFormGuardar.set(false);
  }

  cancelarGuardarVista(): void {
    this.nuevaVistaGuardada = { nombre: '', descripcion: '', fechaExpiracion: null };
    this.mostrandoFormGuardar.set(false);
  }

  getUrlVistaGuardada(vista: VistaCompartida): string {
    return this.service.obtenerUrlVistaCompartida(vista.codigo);
  }

  // Métodos de edición de vista
  iniciarEditarVista(vista: VistaCompartida): void {
    this.vistaEditandoId.set(vista.id);
    this.vistaEditando = {
      nombre: vista.nombre,
      descripcion: vista.descripcion || '',
      fechaExpiracion: vista.fechaExpiracion ? new Date(vista.fechaExpiracion) : null
    };
  }

  cancelarEditarVista(): void {
    this.vistaEditandoId.set(null);
    this.vistaEditando = { nombre: '', descripcion: '', fechaExpiracion: null };
  }

  guardarEdicionVista(): void {
    const vistaId = this.vistaEditandoId();
    if (!vistaId || !this.vistaEditando.nombre.trim()) return;

    this.service.actualizarVistaCompartida(vistaId, {
      nombre: this.vistaEditando.nombre,
      descripcion: this.vistaEditando.descripcion,
      fechaExpiracion: this.vistaEditando.fechaExpiracion || undefined
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Vista actualizada',
      detail: `"${this.vistaEditando.nombre}" ha sido actualizada`
    });

    this.vistaEditandoId.set(null);
    this.vistaEditando = { nombre: '', descripcion: '', fechaExpiracion: null };
  }

  enviarVistaPorCorreo(vista: VistaCompartida): void {
    if (!this.emailCompartir.trim()) return;

    const url = this.getUrlVistaGuardada(vista);
    const subject = encodeURIComponent(`Vista compartida: ${vista.nombre}`);
    const body = encodeURIComponent(`Hola,\n\nTe comparto esta vista de la tabla unificada:\n\n${vista.nombre}\n${vista.descripcion ? vista.descripcion + '\n' : ''}\nEnlace: ${url}\n\nSaludos`);

    window.open(`mailto:${this.emailCompartir}?subject=${subject}&body=${body}`, '_blank');

    this.messageService.add({
      severity: 'success',
      summary: 'Correo abierto',
      detail: 'Se abrió tu cliente de correo'
    });

    this.emailCompartir = '';
  }

  // Exportación programada methods
  mostrarNuevaExportacion(): void {
    this.exportacionEditandoId.set(null);
    this.nuevaExportacion = {
      nombre: '',
      formato: 'excel',
      frecuencia: 'semanal',
      hora: null,
      destinatarios: ''
    };
    this.exportacionesTabActivo = 'nueva';
    this.showExportacionesDialog.set(true);
  }

  toggleExportacionActiva(exp: ExportacionProgramada): void {
    this.service.toggleExportacionProgramada(exp.id);
  }

  crearExportacion(): void {
    if (!this.nuevaExportacion.nombre?.trim() || !this.nuevaExportacion.formato || !this.nuevaExportacion.frecuencia) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Completa todos los campos requeridos'
      });
      return;
    }

    const destinatarios = this.nuevaExportacion.destinatarios
      ? this.nuevaExportacion.destinatarios.split(',').map(e => e.trim()).filter(e => e)
      : [];

    const hora = this.nuevaExportacion.hora
      ? `${this.nuevaExportacion.hora.getHours().toString().padStart(2, '0')}:${this.nuevaExportacion.hora.getMinutes().toString().padStart(2, '0')}`
      : '09:00';

    const nuevaExp = this.service.crearExportacionProgramada({
      nombre: this.nuevaExportacion.nombre,
      formato: this.nuevaExportacion.formato as 'csv' | 'excel',
      frecuencia: this.nuevaExportacion.frecuencia as 'diaria' | 'semanal' | 'mensual',
      hora: hora,
      destinatarios: destinatarios,
      filtros: this.estado().filtrosActivos,
      entidades: this.estado().entidadesSeleccionadas,
      columnasIncluidas: this.estado().columnasVisibles,
      activa: true
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Exportación programada',
      detail: `"${nuevaExp.nombre}" se ejecutará ${this.getFrecuenciaLabel(nuevaExp.frecuencia)}`
    });
  }

  // Crear exportación y cambiar al tab de lista
  crearExportacionYCambiarTab(): void {
    if (!this.nuevaExportacion.nombre?.trim() || !this.nuevaExportacion.formato || !this.nuevaExportacion.frecuencia) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Completa todos los campos requeridos'
      });
      return;
    }

    const destinatarios = this.nuevaExportacion.destinatarios
      ? this.nuevaExportacion.destinatarios.split(',').map(e => e.trim()).filter(e => e)
      : [];

    const hora = this.nuevaExportacion.hora
      ? `${this.nuevaExportacion.hora.getHours().toString().padStart(2, '0')}:${this.nuevaExportacion.hora.getMinutes().toString().padStart(2, '0')}`
      : '09:00';

    const editandoId = this.exportacionEditandoId();

    if (editandoId) {
      // Actualizar exportación existente
      this.service.actualizarExportacionProgramada(editandoId, {
        nombre: this.nuevaExportacion.nombre,
        formato: this.nuevaExportacion.formato as 'csv' | 'excel',
        frecuencia: this.nuevaExportacion.frecuencia as 'diaria' | 'semanal' | 'mensual',
        hora: hora,
        destinatarios: destinatarios
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Exportación actualizada',
        detail: `"${this.nuevaExportacion.nombre}" ha sido actualizada`
      });

      this.exportacionEditandoId.set(null);
    } else {
      // Crear nueva exportación
      const nuevaExp = this.service.crearExportacionProgramada({
        nombre: this.nuevaExportacion.nombre,
        formato: this.nuevaExportacion.formato as 'csv' | 'excel',
        frecuencia: this.nuevaExportacion.frecuencia as 'diaria' | 'semanal' | 'mensual',
        hora: hora,
        destinatarios: destinatarios,
        filtros: this.estado().filtrosActivos,
        entidades: this.estado().entidadesSeleccionadas,
        columnasIncluidas: this.estado().columnasVisibles,
        activa: true
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Exportación programada',
        detail: `"${nuevaExp.nombre}" se ejecutará ${this.getFrecuenciaLabel(nuevaExp.frecuencia)}`
      });
    }

    // Limpiar formulario y cambiar al tab de lista
    this.nuevaExportacion = {
      nombre: '',
      formato: 'excel',
      frecuencia: 'semanal',
      hora: null,
      destinatarios: ''
    };
    this.exportacionesTabActivo = 'lista';
  }

  // Editar exportación existente
  editarExportacion(exp: ExportacionProgramada): void {
    this.exportacionEditandoId.set(exp.id);

    // Convertir hora string a Date para el datepicker
    let horaDate: Date | null = null;
    if (exp.hora) {
      const [hours, minutes] = exp.hora.split(':').map(Number);
      horaDate = new Date();
      horaDate.setHours(hours, minutes, 0, 0);
    }

    this.nuevaExportacion = {
      nombre: exp.nombre,
      formato: exp.formato,
      frecuencia: exp.frecuencia,
      hora: horaDate,
      destinatarios: exp.destinatarios?.join(', ') || ''
    };

    this.exportacionesTabActivo = 'nueva';
  }

  // ==================== MÉTODOS PANEL VISUALIZACIÓN ====================

  /**
   * Toggle del panel de visualización
   */
  togglePanelVisualizacion(): void {
    this.mostrarPanelVisualizacion.update(v => !v);
  }

  /**
   * Seleccionar tipo de gráfico
   */
  seleccionarTipoGrafico(tipo: TipoGraficaAvanzada): void {
    this.tipoGraficaVisualizacion.set(tipo);
  }

  /**
   * Seleccionar gráfico guardado
   */
  seleccionarGraficoGuardado(id: string): void {
    this.graficoSeleccionadoId.set(id);
    const grafico = this.graficosGuardados().find(g => g.id === id);
    if (grafico) {
      this.tipoGraficaVisualizacion.set(grafico.tipo as TipoGraficaAvanzada);
      this.nombreGraficoVisualizacion.set(grafico.nombre);
    }
  }

  /**
   * Guardar nuevo gráfico
   */
  guardarNuevoGrafico(): void {
    const nuevoId = Date.now().toString();
    const nuevoGrafico = {
      id: nuevoId,
      nombre: this.nombreGraficoVisualizacion(),
      tipo: this.tipoGraficaVisualizacion(),
      config: {
        campoOrigen: this.campoOrigenSankey(),
        campoDestino: this.campoDestinoSankey()
      }
    };
    this.graficosGuardados.update(graficos => [...graficos, nuevoGrafico]);
    this.graficoSeleccionadoId.set(nuevoId);
    this.messageService.add({
      severity: 'success',
      summary: 'Gráfico guardado',
      detail: `"${nuevoGrafico.nombre}" se ha guardado correctamente`
    });
  }

  /**
   * Eliminar gráfico guardado
   */
  eliminarGraficoGuardado(id: string): void {
    this.graficosGuardados.update(graficos => graficos.filter(g => g.id !== id));
    if (this.graficoSeleccionadoId() === id) {
      const primero = this.graficosGuardados()[0];
      if (primero) {
        this.seleccionarGraficoGuardado(primero.id);
      }
    }
  }

  /**
   * Generar datos para gráfico Sankey (flujo origen → destino)
   */
  generarDatosSankey(datos: RegistroUnificado[]): DatosGrafica {
    const campoOrigen = this.campoOrigenSankey();
    const campoDestino = this.campoDestinoSankey();

    // Contar flujos entre origen y destino
    const flujos: Record<string, Record<string, number>> = {};
    const origenes = new Set<string>();
    const destinos = new Set<string>();

    datos.forEach(d => {
      const origen = (d as any)[campoOrigen] || 'Sin clasificar';
      const destino = (d as any)[campoDestino] || 'Sin estado';

      origenes.add(origen);
      destinos.add(destino);

      if (!flujos[origen]) flujos[origen] = {};
      flujos[origen][destino] = (flujos[origen][destino] || 0) + 1;
    });

    // Convertir a formato para el gráfico
    const labels = [...Array.from(origenes), ...Array.from(destinos)];
    const series: { name: string; data: number[] }[] = [];

    // Crear series para cada origen
    Array.from(origenes).forEach(origen => {
      const valores = labels.map((_, i) => {
        if (i < origenes.size) return 0; // Los orígenes no tienen valores directos
        const destino = labels[i];
        return flujos[origen]?.[destino] || 0;
      });
      series.push({ name: origen, data: valores });
    });

    // Para Sankey, usamos metadata adicional
    return {
      labels,
      series,
      metadata: {
        tipo: 'sankey',
        origenes: Array.from(origenes),
        destinos: Array.from(destinos),
        flujos,
        totalNodos: origenes.size + destinos.size,
        totalFlujos: Object.values(flujos).reduce((acc, dest) =>
          acc + Object.values(dest).reduce((a, b) => a + b, 0), 0
        )
      }
    } as DatosGrafica;
  }

  /**
   * Obtener estadísticas del gráfico actual
   */
  getEstadisticasVisualizacion(): { nodos: number; flujos: number; total: number } {
    const datos = this.datosVisualizacion() as any;
    if (datos.metadata) {
      return {
        nodos: datos.metadata.totalNodos || 0,
        flujos: datos.metadata.totalFlujos || 0,
        total: this.datosFiltrados().length
      };
    }
    return {
      nodos: datos.labels.length,
      flujos: 0,
      total: this.datosFiltrados().length
    };
  }
}
