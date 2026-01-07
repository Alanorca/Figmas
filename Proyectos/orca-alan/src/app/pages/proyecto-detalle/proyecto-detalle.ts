import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular CDK Drag & Drop
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService } from 'primeng/api';

// FullCalendar
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// PrimeNG Charts
import { ChartModule } from 'primeng/chart';

// Services
import { ProyectosService } from '../../services/proyectos.service';

// Models
import {
  Project,
  ProjectPhase,
  Task,
  ProjectStatus,
  ProjectPriority,
  TaskStatus,
  TaskType,
  PhaseStatus,
  CreateTaskData,
  PROJECT_STATUS_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
  calculateDaysRemaining,
  isTaskOverdue
} from '../../models/proyectos.models';

interface GanttItem {
  id: string;
  name: string;
  type: 'phase' | 'task';
  startDate: Date;
  endDate: Date;
  progress: number;
  status: string;
  color: string;
  parent?: string;
}

// ============================================================
// OBJETIVOS Y KPIs INTERFACES (replicado de objetivos-kpis)
// ============================================================
type AlertSeverity = 'info' | 'warning' | 'critical';
type NotificationChannel = 'email' | 'in-app' | 'webhook';
type EvaluationFrequency = 'inmediata' | 'diaria' | 'semanal' | 'mensual';
type AlertStatus = 'activa' | 'atendida' | 'resuelta';

interface ProjectKPI {
  id: string;
  nombre: string;
  meta: number;
  actual: number;
  escala: string;
  umbralAlerta: number;
  umbralMaximo: number | null;
  severidad: AlertSeverity;
  canalesNotificacion: NotificationChannel[];
  frecuenciaEvaluacion: EvaluationFrequency;
  direccion: 'mayor_mejor' | 'menor_mejor';
}

interface ProjectObjetivo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: ProjectKPI[];
}

interface ProjectKPIAlert {
  id: string;
  kpiId: string;
  kpiNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  severity: AlertSeverity;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  tipoViolacion: 'bajo_minimo' | 'sobre_maximo';
  status: AlertStatus;
  fechaCreacion: Date;
  fechaAtendida?: Date;
  atendidaPor?: string;
  comentarioResolucion?: string;
}

interface TimelineEvent {
  title: string;
  date: string;
  icon: string;
  color: string;
  description?: string;
  type: 'phase' | 'task' | 'milestone';
}

// Kanban board interfaces
interface KanbanColumn {
  id: TaskStatus;
  title: string;
  icon: string;
  color: string;
  bgClass: string;
  tasks: Task[];
}

const KANBAN_COLUMNS_CONFIG: Omit<KanbanColumn, 'tasks'>[] = [
  { id: 'pending', title: 'Pendiente', icon: 'pi-clock', color: '#94a3b8', bgClass: 'kanban-pending' },
  { id: 'in_progress', title: 'En Progreso', icon: 'pi-spin pi-spinner', color: '#3b82f6', bgClass: 'kanban-progress' },
  { id: 'in_review', title: 'En Revisión', icon: 'pi-eye', color: '#f59e0b', bgClass: 'kanban-review' },
  { id: 'completed', title: 'Completado', icon: 'pi-check-circle', color: '#10b981', bgClass: 'kanban-completed' },
  { id: 'blocked', title: 'Bloqueado', icon: 'pi-ban', color: '#ef4444', bgClass: 'kanban-blocked' }
];

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ButtonModule,
    TabsModule,
    TagModule,
    ProgressBarModule,
    CardModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    DrawerModule,
    TableModule,
    TimelineModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    SliderModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    BadgeModule,
    FullCalendarModule,
    ChartModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proyecto-detalle.html',
  styleUrl: './proyecto-detalle.scss'
})
export class ProyectoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  proyectosService = inject(ProyectosService);

  // Estado
  projectId = signal<string>('');
  loading = signal(true);
  activeTab = signal(0);

  // Vista de planificación (Gantt, Tareas, Kanban, Calendario)
  activePlanningView = signal<'gantt' | 'tareas' | 'kanban' | 'calendario'>('gantt');

  // ============================================================
  // OBJETIVOS Y KPIs - Vista tipo objetivos-kpis
  // ============================================================
  kpiSelectedObjectiveId = signal<string | null>(null);
  kpiTabActivo = signal<'kpis' | 'alertas'>('kpis');
  kpiModo = signal<'ver' | 'editar'>('ver');
  kpiBusquedaObjetivos = signal('');

  // Objetivos del proyecto con KPIs
  projectObjetivos = signal<ProjectObjetivo[]>([
    {
      id: 'obj-1',
      nombre: 'Cumplir con el cronograma establecido',
      descripcion: 'Asegurar que todas las fases del proyecto se completen dentro de los plazos definidos, minimizando retrasos y optimizando recursos.',
      tipo: 'estrategico',
      progreso: 65,
      kpis: [
        { id: 'kpi-1-1', nombre: 'Cumplimiento de Hitos', meta: 100, actual: 75, escala: '%', umbralAlerta: 70, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' },
        { id: 'kpi-1-2', nombre: 'Desviación de Cronograma', meta: 5, actual: 8, escala: 'Días', umbralAlerta: 80, umbralMaximo: 15, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'diaria', direccion: 'menor_mejor' },
        { id: 'kpi-1-3', nombre: 'Tareas Completadas a Tiempo', meta: 90, actual: 82, escala: '%', umbralAlerta: 75, umbralMaximo: null, severidad: 'info', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: 'obj-2',
      nombre: 'Mantener la calidad del entregable',
      descripcion: 'Garantizar que todos los entregables cumplan con los estándares de calidad definidos y satisfagan las expectativas del cliente.',
      tipo: 'operativo',
      progreso: 80,
      kpis: [
        { id: 'kpi-2-1', nombre: 'Defectos Detectados', meta: 5, actual: 3, escala: 'Bugs', umbralAlerta: 60, umbralMaximo: 10, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'diaria', direccion: 'menor_mejor' },
        { id: 'kpi-2-2', nombre: 'Cobertura de Pruebas', meta: 80, actual: 78, escala: '%', umbralAlerta: 70, umbralMaximo: null, severidad: 'info', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' },
        { id: 'kpi-2-3', nombre: 'Satisfacción del Cliente', meta: 90, actual: 85, escala: '%', umbralAlerta: 75, umbralMaximo: null, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'mensual', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: 'obj-3',
      nombre: 'Optimizar el presupuesto asignado',
      descripcion: 'Mantener los costos del proyecto dentro del presupuesto aprobado, identificando oportunidades de ahorro sin comprometer la calidad.',
      tipo: 'estrategico',
      progreso: 45,
      kpis: [
        { id: 'kpi-3-1', nombre: 'Variación de Presupuesto', meta: 0, actual: 12, escala: '%', umbralAlerta: 80, umbralMaximo: 20, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'semanal', direccion: 'menor_mejor' },
        { id: 'kpi-3-2', nombre: 'ROI Proyectado', meta: 150, actual: 120, escala: '%', umbralAlerta: 100, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'mensual', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: 'obj-4',
      nombre: 'Asegurar la adopción del equipo',
      descripcion: 'Lograr que todo el equipo adopte las nuevas metodologías y herramientas implementadas en el proyecto.',
      tipo: 'operativo',
      progreso: 70,
      kpis: [
        { id: 'kpi-4-1', nombre: 'Capacitaciones Completadas', meta: 100, actual: 85, escala: '%', umbralAlerta: 70, umbralMaximo: null, severidad: 'info', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' },
        { id: 'kpi-4-2', nombre: 'Uso de Herramientas', meta: 90, actual: 72, escala: '%', umbralAlerta: 60, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'diaria', direccion: 'mayor_mejor' }
      ]
    }
  ]);

  // Alertas de KPIs del proyecto
  projectAlertas = signal<ProjectKPIAlert[]>([
    {
      id: 'alert-1',
      kpiId: 'kpi-1-2',
      kpiNombre: 'Desviación de Cronograma',
      objetivoId: 'obj-1',
      objetivoNombre: 'Cumplir con el cronograma establecido',
      severity: 'critical',
      mensaje: 'La desviación de cronograma (8 días) supera el umbral crítico de 5 días',
      valorActual: 8,
      valorUmbral: 5,
      tipoViolacion: 'sobre_maximo',
      status: 'activa',
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'alert-2',
      kpiId: 'kpi-3-1',
      kpiNombre: 'Variación de Presupuesto',
      objetivoId: 'obj-3',
      objetivoNombre: 'Optimizar el presupuesto asignado',
      severity: 'critical',
      mensaje: 'La variación de presupuesto (12%) requiere atención inmediata',
      valorActual: 12,
      valorUmbral: 0,
      tipoViolacion: 'sobre_maximo',
      status: 'activa',
      fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'alert-3',
      kpiId: 'kpi-4-2',
      kpiNombre: 'Uso de Herramientas',
      objetivoId: 'obj-4',
      objetivoNombre: 'Asegurar la adopción del equipo',
      severity: 'warning',
      mensaje: 'El uso de herramientas está por debajo del objetivo (72% vs 90%)',
      valorActual: 72,
      valorUmbral: 60,
      tipoViolacion: 'bajo_minimo',
      status: 'atendida',
      fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      fechaAtendida: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      atendidaPor: 'Carlos Martínez',
      comentarioResolucion: 'Se programaron sesiones de capacitación adicionales'
    }
  ]);

  // Computed para objetivos filtrados
  objetivosFiltrados = computed(() => {
    const busqueda = this.kpiBusquedaObjetivos().toLowerCase();
    if (!busqueda) return this.projectObjetivos();
    return this.projectObjetivos().filter(o =>
      o.nombre.toLowerCase().includes(busqueda) ||
      o.descripcion.toLowerCase().includes(busqueda)
    );
  });

  // Objetivo seleccionado
  objetivoSeleccionado = computed(() => {
    const id = this.kpiSelectedObjectiveId();
    if (!id) return null;
    return this.projectObjetivos().find(o => o.id === id) || null;
  });

  // Alertas del objetivo seleccionado
  alertasDelObjetivo = computed(() => {
    const objetivoId = this.kpiSelectedObjectiveId();
    if (!objetivoId) return [];
    return this.projectAlertas().filter(a => a.objetivoId === objetivoId);
  });

  // Contadores de alertas
  alertasActivasCount = computed(() =>
    this.projectAlertas().filter(a => a.status === 'activa').length
  );

  alertasActivasDelObjetivoCount = computed(() =>
    this.alertasDelObjetivo().filter(a => a.status === 'activa').length
  );

  tieneAlertasActivas = computed(() =>
    this.alertasDelObjetivo().some(a => a.status === 'activa')
  );

  tieneAlertaCriticaActiva = computed(() =>
    this.alertasDelObjetivo().some(a => a.severity === 'critical' && a.status === 'activa')
  );

  // Para el badge global de alertas
  tieneAlertaCriticaGlobal = computed(() =>
    this.projectAlertas().some(a => a.severity === 'critical' && a.status === 'activa')
  );

  // Opciones para selects de KPIs
  tipoObjetivoOptions = [
    { label: 'Estratégico', value: 'estrategico' },
    { label: 'Operativo', value: 'operativo' }
  ];

  escalasOptions = [
    { label: 'Porcentaje', value: '%' },
    { label: 'Días', value: 'Días' },
    { label: 'Horas', value: 'Horas' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Bugs', value: 'Bugs' }
  ];

  direccionOptions = [
    { label: 'Mayor es mejor', value: 'mayor_mejor' },
    { label: 'Menor es mejor', value: 'menor_mejor' }
  ];

  // Proyecto
  project = computed(() => this.proyectosService.selectedProject());
  tasks = computed(() => this.proyectosService.tasks());

  // Gantt Items
  ganttItems = signal<GanttItem[]>([]);
  timelineEvents = signal<TimelineEvent[]>([]);

  // Opciones
  statusOptions = PROJECT_STATUS_OPTIONS;
  priorityOptions = PROJECT_PRIORITY_OPTIONS;
  taskStatusOptions = TASK_STATUS_OPTIONS;
  taskTypeOptions = TASK_TYPE_OPTIONS;

  // Drawer de visualización
  showTaskDrawer = signal(false);
  selectedTask = signal<Task | null>(null);

  // Drawer de crear/editar tarea
  showTaskFormDrawer = signal(false);
  isEditingTask = signal(false);
  taskFormData = signal<Partial<CreateTaskData & { id?: string }>>({});

  // Filtro de tareas
  taskSearchFilter = signal('');
  taskStatusFilter = signal<TaskStatus | ''>('');

  // Edición inline de tareas
  editingTaskId = signal<string | null>(null);

  // Edición inline de KPIs
  editingKpiId = signal<string | null>(null);
  editingKpiValueId = signal<string | null>(null);

  // ============================================================
  // MODO EDICIÓN OBJETIVOS/KPIs (igual que objetivos-kpis)
  // ============================================================
  modoObjetivos = signal<'ver' | 'editar'>('ver');
  editandoObjetivo = signal(false);
  nuevoKPI = signal(false);
  editandoKPIId = signal<string | null>(null);

  // Form values para objetivo
  formObjetivoNombre = signal('');
  formObjetivoDescripcion = signal('');
  formObjetivoTipo = signal<'estrategico' | 'operativo'>('estrategico');

  // Form values para KPI (formulario completo)
  formKPINombre = signal('');
  formKPIMeta = signal<number>(100);
  formKPIActual = signal<number>(0);
  formKPIEscala = signal('%');
  formKPIUmbralAlerta = signal<number>(50);
  formKPIUmbralMaximo = signal<number | null>(null);
  formKPISeveridad = signal<'info' | 'warning' | 'critical'>('warning');
  formKPICanales = signal<('email' | 'in-app' | 'webhook')[]>(['in-app']);
  formKPIFrecuencia = signal<'inmediata' | 'diaria' | 'semanal' | 'mensual'>('diaria');
  formKPIDireccion = signal<'mayor_mejor' | 'menor_mejor'>('mayor_mejor');

  // Opciones para selects de KPIs
  escalasKPIOptions = [
    { label: '%', value: '%' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Días', value: 'Días' },
    { label: 'Horas', value: 'Horas' },
    { label: 'Escala 1-5', value: 'Escala 1-5' },
    { label: 'USD', value: 'USD' }
  ];

  direccionKPIOptions = [
    { label: 'Mejor si es más', value: 'mayor_mejor' },
    { label: 'Mejor si es menos', value: 'menor_mejor' }
  ];

  severidadKPIOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' }
  ];

  frecuenciaKPIOptions = [
    { label: 'Inmediata', value: 'inmediata' },
    { label: 'Diaria', value: 'diaria' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' }
  ];

  // Filtros para alertas
  busquedaAlertas = signal('');
  filtroAlertaSeveridad = signal<'info' | 'warning' | 'critical' | null>(null);
  filtroAlertaStatus = signal<'activa' | 'atendida' | 'resuelta' | null>(null);

  // Dialog para atender alerta
  showAtenderAlertaDialog = signal(false);
  alertaParaAtender = signal<ProjectKPIAlert | null>(null);
  comentarioAtencion = signal('');

  // Computed para tareas filtradas
  filteredTasks = computed(() => {
    let result = this.tasks();
    const search = this.taskSearchFilter().toLowerCase();
    const status = this.taskStatusFilter();

    if (search) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
      );
    }
    if (status) {
      result = result.filter(t => t.status === status);
    }
    return result;
  });

  // Opciones para select de fases del proyecto
  phaseOptions = computed(() => {
    const project = this.project();
    if (!project?.phases) return [];
    return project.phases.map(p => ({
      value: p.id,
      label: p.name
    }));
  });

  // ============================================================
  // KANBAN BOARD
  // ============================================================
  kanbanColumns = computed<KanbanColumn[]>(() => {
    const allTasks = this.tasks();
    return KANBAN_COLUMNS_CONFIG.map(col => ({
      ...col,
      tasks: allTasks.filter(t => t.status === col.id)
    }));
  });

  // IDs de conexión para drag & drop entre columnas
  kanbanColumnIds = KANBAN_COLUMNS_CONFIG.map(col => `kanban-${col.id}`);

  // ============================================================
  // GANTT CHART ENHANCED
  // ============================================================
  ganttZoomLevel = signal(100);

  // Estado de fases expandidas/colapsadas
  expandedPhases = signal<Set<string>>(new Set());

  // Orden personalizado de tareas por fase (phaseId -> [taskIds en orden])
  taskOrderByPhase = signal<Map<string, string[]>>(new Map());

  // Drag and Resize state (horizontal - fechas)
  ganttDragState = signal<{
    isDragging: boolean;
    isResizing: boolean;
    resizeEdge: 'left' | 'right' | null;
    itemId: string | null;
    startX: number;
    initialStartDate: Date | null;
    initialEndDate: Date | null;
    timelineWidth: number;
  }>({
    isDragging: false,
    isResizing: false,
    resizeEdge: null,
    itemId: null,
    startX: 0,
    initialStartDate: null,
    initialEndDate: null,
    timelineWidth: 0
  });

  // Reorder state (vertical - orden)
  ganttReorderState = signal<{
    isDragging: boolean;
    draggedItemId: string | null;
    draggedItemType: 'phase' | 'task' | null;
    dropTargetId: string | null;
    dropPosition: 'before' | 'after' | 'inside' | null;
  }>({
    isDragging: false,
    draggedItemId: null,
    draggedItemType: null,
    dropTargetId: null,
    dropPosition: null
  });

  // Computed para generar los meses del proyecto
  ganttMonths = computed(() => {
    const project = this.project();
    if (!project) return [];

    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months: { label: string; width: number }[] = [];

    let current = new Date(start);
    while (current <= end) {
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const effectiveEnd = monthEnd > end ? end : monthEnd;
      const effectiveStart = current < start ? start : current;
      const daysInMonth = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const widthPercent = (daysInMonth / totalDays) * 100;

      months.push({
        label: current.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        width: widthPercent
      });

      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    return months;
  });

  // ============================================================
  // CALENDAR VIEW
  // ============================================================
  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    events: this.calendarEvents(),
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this),
    selectable: true,
    editable: false,
    dayMaxEvents: 3,
    moreLinkText: 'más',
    eventDisplay: 'block',
    height: 'auto',
    aspectRatio: 1.8
  }));

  // Computed para eventos del calendario
  calendarEvents = computed(() => {
    const tasks = this.tasks();
    const project = this.project();
    const events: any[] = [];

    // Agregar tareas
    tasks.forEach(task => {
      events.push({
        id: task.id,
        title: task.title,
        start: task.startDate,
        end: task.dueDate,
        backgroundColor: this.getTaskColor(task.status),
        borderColor: this.getTaskColor(task.status),
        extendedProps: {
          type: 'task',
          status: task.status,
          progress: task.progress,
          priority: task.priority
        }
      });
    });

    // Agregar fases del proyecto
    if (project?.phases) {
      project.phases.forEach(phase => {
        events.push({
          id: `phase-${phase.id}`,
          title: `📁 ${phase.name}`,
          start: phase.startDate,
          end: phase.endDate,
          backgroundColor: this.getPhaseColor(phase.status),
          borderColor: this.getPhaseColor(phase.status),
          extendedProps: {
            type: 'phase',
            status: phase.status,
            progress: phase.progress
          }
        });
      });
    }

    return events;
  });

  // ============================================================
  // KPI CHARTS DATA
  // ============================================================

  // Chart options for task status distribution (Pie)
  taskStatusChartData = computed(() => {
    const tasks = this.tasks();
    const statusCounts = {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };

    return {
      labels: ['Pendiente', 'En Progreso', 'En Revisión', 'Completado', 'Bloqueado'],
      datasets: [{
        data: [statusCounts.pending, statusCounts.in_progress, statusCounts.in_review, statusCounts.completed, statusCounts.blocked],
        backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
        hoverBackgroundColor: ['#64748b', '#2563eb', '#d97706', '#059669', '#dc2626']
      }]
    };
  });

  taskStatusChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    maintainAspectRatio: false
  };

  // Chart for phase progress (Bar)
  phaseProgressChartData = computed(() => {
    const project = this.project();
    if (!project?.phases) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: project.phases.map(p => p.name),
      datasets: [{
        label: 'Progreso %',
        data: project.phases.map(p => p.progress),
        backgroundColor: project.phases.map(p => this.getPhaseColor(p.status)),
        borderWidth: 0,
        borderRadius: 4
      }]
    };
  });

  phaseProgressChartOptions = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: { display: false }
      },
      y: {
        grid: { display: false }
      }
    },
    maintainAspectRatio: false
  };

  // Priority distribution chart (Doughnut)
  priorityChartData = computed(() => {
    const tasks = this.tasks();
    const priorityCounts = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      critical: tasks.filter(t => t.priority === 'critical').length
    };

    return {
      labels: ['Baja', 'Media', 'Alta', 'Crítica'],
      datasets: [{
        data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high, priorityCounts.critical],
        backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#ef4444'],
        hoverBackgroundColor: ['#64748b', '#2563eb', '#d97706', '#dc2626']
      }]
    };
  });

  doughnutChartOptions = {
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    },
    maintainAspectRatio: false
  };

  // Weekly task completion (Line chart)
  weeklyCompletionChartData = computed(() => {
    // Generate last 4 weeks labels
    const weeks = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

    // Simulated data based on task count
    const tasksCount = this.tasks().length;
    const completedCount = this.tasks().filter(t => t.status === 'completed').length;

    return {
      labels: weeks,
      datasets: [
        {
          label: 'Tareas Completadas',
          data: [Math.floor(completedCount * 0.2), Math.floor(completedCount * 0.4), Math.floor(completedCount * 0.7), completedCount],
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Meta',
          data: [Math.floor(tasksCount * 0.25), Math.floor(tasksCount * 0.5), Math.floor(tasksCount * 0.75), tasksCount],
          fill: false,
          borderColor: '#94a3b8',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  });

  lineChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    },
    maintainAspectRatio: false
  };

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  async loadProject(id: string): Promise<void> {
    this.loading.set(true);
    try {
      await this.proyectosService.loadProjectById(id);
      await this.proyectosService.loadTasks({ projectId: id });
      this.buildGanttItems();
      this.buildTimelineEvents();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el proyecto'
      });
    } finally {
      this.loading.set(false);
    }
  }

  buildGanttItems(): void {
    const project = this.project();
    if (!project) return;

    const items: GanttItem[] = [];
    const expandedPhases = this.expandedPhases();
    const tasks = this.tasks();

    // Ordenar fases por su propiedad orderNum
    const sortedPhases = project.phases
      ? [...project.phases].sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
      : [];

    // Agregar fases con sus tareas agrupadas
    sortedPhases.forEach(phase => {
      // Agregar la fase
      items.push({
        id: phase.id,
        name: phase.name,
        type: 'phase',
        startDate: new Date(phase.startDate),
        endDate: new Date(phase.endDate),
        progress: phase.progress,
        status: phase.status,
        color: this.getPhaseColor(phase.status)
      });

      // Si la fase está expandida (por defecto todas expandidas), agregar sus tareas
      const isExpanded = expandedPhases.size === 0 || expandedPhases.has(phase.id);
      if (isExpanded) {
        const phaseTasks = tasks.filter(t => t.phaseId === phase.id);

        // Ordenar tareas según el orden personalizado si existe
        const taskOrder = this.taskOrderByPhase();
        const phaseTaskOrder = taskOrder.get(phase.id);

        let sortedTasks = phaseTasks;
        if (phaseTaskOrder && phaseTaskOrder.length > 0) {
          sortedTasks = [...phaseTasks].sort((a, b) => {
            const indexA = phaseTaskOrder.indexOf(a.id);
            const indexB = phaseTaskOrder.indexOf(b.id);
            // Si no está en la lista de orden, ponerlo al final
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
        }

        sortedTasks.forEach(task => {
          items.push({
            id: task.id,
            name: task.title,
            type: 'task',
            startDate: new Date(task.startDate),
            endDate: new Date(task.dueDate),
            progress: task.progress,
            status: task.status,
            color: this.getTaskColor(task.status),
            parent: task.phaseId
          });
        });
      }
    });

    // Agregar tareas sin fase al final
    const orphanTasks = tasks.filter(t => !t.phaseId || !sortedPhases.find(p => p.id === t.phaseId));
    orphanTasks.forEach(task => {
      items.push({
        id: task.id,
        name: task.title,
        type: 'task',
        startDate: new Date(task.startDate),
        endDate: new Date(task.dueDate),
        progress: task.progress,
        status: task.status,
        color: this.getTaskColor(task.status),
        parent: task.phaseId
      });
    });

    this.ganttItems.set(items);
  }

  // Método para expandir/colapsar fases
  togglePhaseExpand(phaseId: string): void {
    const expanded = this.expandedPhases();
    const newExpanded = new Set(expanded);

    // Si está vacío, inicializar con todas las fases expandidas excepto la que se hace clic
    if (newExpanded.size === 0) {
      const project = this.project();
      if (project?.phases) {
        project.phases.forEach(p => {
          if (p.id !== phaseId) newExpanded.add(p.id);
        });
      }
    } else if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }

    this.expandedPhases.set(newExpanded);
    this.buildGanttItems();
  }

  isPhaseExpanded(phaseId: string): boolean {
    const expanded = this.expandedPhases();
    // Si está vacío, todas están expandidas por defecto
    return expanded.size === 0 || expanded.has(phaseId);
  }

  getPhaseTaskCount(phaseId: string): number {
    return this.tasks().filter(t => t.phaseId === phaseId).length;
  }

  buildTimelineEvents(): void {
    const project = this.project();
    if (!project) return;

    const events: TimelineEvent[] = [];

    // Inicio del proyecto
    events.push({
      title: 'Inicio del Proyecto',
      date: this.formatDate(new Date(project.startDate)),
      icon: 'pi pi-flag',
      color: '#10b981',
      description: project.name,
      type: 'milestone'
    });

    // Fases
    if (project.phases) {
      project.phases.forEach(phase => {
        events.push({
          title: phase.name,
          date: `${this.formatDate(new Date(phase.startDate))} - ${this.formatDate(new Date(phase.endDate))}`,
          icon: 'pi pi-folder',
          color: this.getPhaseColor(phase.status),
          description: phase.description || `Progreso: ${phase.progress}%`,
          type: 'phase'
        });
      });
    }

    // Fin del proyecto
    events.push({
      title: 'Fin del Proyecto',
      date: this.formatDate(new Date(project.endDate)),
      icon: 'pi pi-check-circle',
      color: '#6366f1',
      description: 'Fecha de entrega planificada',
      type: 'milestone'
    });

    this.timelineEvents.set(events);
  }

  // Tab change
  onTabChange(value: string | number | undefined): void {
    if (typeof value === 'number') {
      this.activeTab.set(value);
    }
  }

  // Navegación
  volver(): void {
    this.router.navigate(['/proyectos']);
  }

  editarProyecto(): void {
    this.router.navigate(['/proyectos', this.projectId(), 'editar']);
  }

  // Acciones de Tareas
  abrirTask(task: Task): void {
    this.selectedTask.set(task);
    this.showTaskDrawer.set(true);
  }

  cerrarTaskDrawer(): void {
    this.showTaskDrawer.set(false);
    this.selectedTask.set(null);
  }

  async cambiarStatusTask(taskId: string, status: TaskStatus): Promise<void> {
    try {
      await this.proyectosService.updateTaskStatus(taskId, status);
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Estado de la tarea actualizado'
      });
      this.buildGanttItems();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado'
      });
    }
  }

  // Helpers
  getStatusLabel(status: ProjectStatus): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  getStatusSeverity(status: ProjectStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<ProjectStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      planning: 'secondary',
      in_progress: 'info',
      paused: 'warn',
      completed: 'success',
      cancelled: 'danger'
    };
    return severities[status];
  }

  getPriorityLabel(priority: ProjectPriority): string {
    return this.priorityOptions.find(p => p.value === priority)?.label || priority;
  }

  getPrioritySeverity(priority: ProjectPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<ProjectPriority, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warn',
      critical: 'danger'
    };
    return severities[priority];
  }

  getTaskStatusLabel(status: TaskStatus): string {
    return this.taskStatusOptions.find(s => s.value === status)?.label || status;
  }

  getTaskStatusSeverity(status: TaskStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<TaskStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      pending: 'secondary',
      in_progress: 'info',
      in_review: 'warn',
      completed: 'success',
      blocked: 'danger',
      cancelled: 'contrast'
    };
    return severities[status];
  }

  getPhaseColor(status: string): string {
    const colors: Record<string, string> = {
      pending: '#94a3b8',
      in_progress: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6366f1';
  }

  getPhaseStatusSeverity(status: PhaseStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<PhaseStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      pending: 'secondary',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger'
    };
    return severities[status];
  }

  getTaskColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      pending: '#94a3b8',
      in_progress: '#3b82f6',
      in_review: '#f59e0b',
      completed: '#10b981',
      blocked: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status];
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getDaysRemaining(endDate: Date | string): number {
    return calculateDaysRemaining(endDate);
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'var(--green-500)';
    if (progress >= 50) return 'var(--blue-500)';
    if (progress >= 25) return 'var(--orange-500)';
    return 'var(--red-500)';
  }

  // Computed values
  get projectDuration(): number {
    const project = this.project();
    if (!project) return 0;
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  get completedTasks(): number {
    return this.tasks().filter(t => t.status === 'completed').length;
  }

  get totalTasks(): number {
    return this.tasks().length;
  }

  get pendingTasks(): number {
    return this.tasks().filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  }

  get blockedTasks(): number {
    return this.tasks().filter(t => t.status === 'blocked').length;
  }

  // Gantt helpers
  getItemWidth(item: GanttItem): string {
    const project = this.project();
    if (!project) return '0%';

    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();
    const totalDuration = projectEnd - projectStart;

    const itemDuration = item.endDate.getTime() - item.startDate.getTime();
    const widthPercent = (itemDuration / totalDuration) * 100;

    return `${Math.max(widthPercent, 5)}%`;
  }

  getItemOffset(item: GanttItem): string {
    const project = this.project();
    if (!project) return '0%';

    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();
    const totalDuration = projectEnd - projectStart;

    const itemStart = item.startDate.getTime();
    const offsetDays = itemStart - projectStart;
    const offsetPercent = (offsetDays / totalDuration) * 100;

    return `${Math.max(offsetPercent, 0)}%`;
  }

  // ============================================================
  // GESTIÓN DE TAREAS - CRUD
  // ============================================================

  abrirFormularioNuevaTarea(): void {
    const project = this.project();
    if (!project) return;

    this.taskFormData.set({
      projectId: project.id,
      phaseId: project.phases?.[0]?.id || '',
      title: '',
      description: '',
      assignedTo: 'user-1',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: 'medium',
      taskType: 'manual',
      estimatedHours: 8,
      createdBy: 'user-1'
    });
    this.isEditingTask.set(false);
    this.showTaskFormDrawer.set(true);
  }

  abrirFormularioEditarTarea(task: Task): void {
    this.taskFormData.set({
      id: task.id,
      projectId: task.projectId,
      phaseId: task.phaseId,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      startDate: typeof task.startDate === 'string' ? task.startDate.split('T')[0] : new Date(task.startDate).toISOString().split('T')[0],
      dueDate: typeof task.dueDate === 'string' ? task.dueDate.split('T')[0] : new Date(task.dueDate).toISOString().split('T')[0],
      priority: task.priority,
      taskType: task.taskType,
      estimatedHours: task.estimatedHours,
      createdBy: task.createdBy
    });
    this.isEditingTask.set(true);
    this.showTaskFormDrawer.set(true);
    this.showTaskDrawer.set(false);
  }

  cerrarFormularioTarea(): void {
    this.showTaskFormDrawer.set(false);
    this.taskFormData.set({});
  }

  updateTaskFormField(field: string, value: any): void {
    this.taskFormData.update(form => ({ ...form, [field]: value }));
  }

  async guardarTarea(): Promise<void> {
    const data = this.taskFormData();
    if (!data.title || !data.phaseId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'El título y la fase son obligatorios'
      });
      return;
    }

    try {
      if (this.isEditingTask() && data.id) {
        // Actualizar tarea existente
        await this.proyectosService.updateTask(data.id, {
          title: data.title,
          description: data.description,
          phaseId: data.phaseId,
          assignedTo: data.assignedTo,
          startDate: data.startDate,
          dueDate: data.dueDate,
          priority: data.priority,
          taskType: data.taskType,
          estimatedHours: data.estimatedHours
        } as Partial<Task>);

        this.messageService.add({
          severity: 'success',
          summary: 'Tarea actualizada',
          detail: `La tarea "${data.title}" ha sido actualizada`
        });
      } else {
        // Crear nueva tarea
        await this.proyectosService.createTask(data as CreateTaskData);

        this.messageService.add({
          severity: 'success',
          summary: 'Tarea creada',
          detail: `La tarea "${data.title}" ha sido creada`
        });
      }

      this.cerrarFormularioTarea();
      this.buildGanttItems();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la tarea'
      });
    }
  }

  confirmarEliminarTarea(task: Task): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la tarea "${task.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.proyectosService.deleteTask(task.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Tarea eliminada',
            detail: `La tarea "${task.title}" ha sido eliminada`
          });
          this.cerrarTaskDrawer();
          this.buildGanttItems();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la tarea'
          });
        }
      }
    });
  }

  async actualizarProgresoTarea(task: Task, progress: number): Promise<void> {
    try {
      await this.proyectosService.updateTaskProgress(task.id, progress);
      this.messageService.add({
        severity: 'success',
        summary: 'Progreso actualizado',
        detail: `Progreso: ${progress}%`
      });
      this.buildGanttItems();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el progreso'
      });
    }
  }

  // Helpers de tareas
  getTaskTypeLabel(type: TaskType): string {
    return this.taskTypeOptions.find(t => t.value === type)?.label || type;
  }

  getTaskTypeIcon(type: TaskType): string {
    return this.taskTypeOptions.find(t => t.value === type)?.icon || 'pi-file';
  }

  isTaskOverdue(task: Task): boolean {
    return isTaskOverdue(task);
  }

  get overdueTasks(): number {
    return this.tasks().filter(t => this.isTaskOverdue(t)).length;
  }

  get inProgressTasks(): number {
    return this.tasks().filter(t => t.status === 'in_progress').length;
  }

  // ============================================================
  // INLINE EDITING - TAREAS
  // ============================================================

  iniciarEdicionTarea(taskId: string): void {
    this.editingTaskId.set(taskId);
  }

  cancelarEdicionTarea(): void {
    this.editingTaskId.set(null);
  }

  async guardarTituloTarea(task: Task, nuevoTitulo: string): Promise<void> {
    if (!nuevoTitulo.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El título no puede estar vacío'
      });
      return;
    }

    if (nuevoTitulo.trim() === task.title) {
      this.editingTaskId.set(null);
      return;
    }

    try {
      await this.proyectosService.updateTask(task.id, { title: nuevoTitulo.trim() } as Partial<Task>);
      this.messageService.add({
        severity: 'success',
        summary: 'Tarea actualizada',
        detail: `Título cambiado a "${nuevoTitulo.trim()}"`
      });
      this.editingTaskId.set(null);
      this.buildGanttItems();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el título'
      });
    }
  }

  // ============================================================
  // KANBAN DRAG & DROP
  // ============================================================

  /**
   * Maneja el evento de drop cuando una tarea se mueve entre columnas
   */
  async onTaskDrop(event: CdkDragDrop<Task[]>, targetStatus: TaskStatus): Promise<void> {
    const task = event.item.data as Task;
    const previousStatus = task.status;

    // Si se mueve a la misma columna, no hacer nada
    if (previousStatus === targetStatus) {
      return;
    }

    // Actualizar inmediatamente el estado local para feedback instantáneo
    this.proyectosService.tasks.update(tasks =>
      tasks.map(t => t.id === task.id ? { ...t, status: targetStatus } : t)
    );

    // Cambiar el estado de la tarea en el backend/storage
    try {
      await this.proyectosService.updateTaskStatus(task.id, targetStatus);

      // Mostrar mensaje con animación
      const statusLabel = this.getTaskStatusLabel(targetStatus);
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `"${task.title}" movida a ${statusLabel}`,
        life: 2000
      });

      // Actualizar Gantt items
      this.buildGanttItems();
    } catch (error) {
      // Revertir el cambio si falla
      this.proyectosService.tasks.update(tasks =>
        tasks.map(t => t.id === task.id ? { ...t, status: previousStatus } : t)
      );

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo mover la tarea'
      });
    }
  }

  /**
   * Obtiene el color de fondo de la columna según el estado
   */
  getKanbanColumnHeaderColor(status: TaskStatus): string {
    const colors: Record<TaskStatus, string> = {
      pending: 'rgba(148, 163, 184, 0.15)',
      in_progress: 'rgba(59, 130, 246, 0.15)',
      in_review: 'rgba(245, 158, 11, 0.15)',
      completed: 'rgba(16, 185, 129, 0.15)',
      blocked: 'rgba(239, 68, 68, 0.15)',
      cancelled: 'rgba(107, 114, 128, 0.15)'
    };
    return colors[status];
  }

  // ============================================================
  // GANTT CHART METHODS
  // ============================================================

  ganttZoomIn(): void {
    const current = this.ganttZoomLevel();
    if (current < 200) {
      this.ganttZoomLevel.set(current + 25);
    }
  }

  ganttZoomOut(): void {
    const current = this.ganttZoomLevel();
    if (current > 50) {
      this.ganttZoomLevel.set(current - 25);
    }
  }

  resetGanttZoom(): void {
    this.ganttZoomLevel.set(100);
  }

  getTodayPosition(): string {
    const project = this.project();
    if (!project) return '0%';

    const today = new Date();
    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();

    // Si hoy está fuera del rango del proyecto, no mostrar la línea
    if (today.getTime() < projectStart || today.getTime() > projectEnd) {
      return '-100%';
    }

    const totalDuration = projectEnd - projectStart;
    const offset = today.getTime() - projectStart;
    const offsetPercent = (offset / totalDuration) * 100;

    // Ajustar por el ancho de la columna de labels (200px aprox)
    return `calc(200px + ${offsetPercent}% * (100% - 200px) / 100%)`;
  }

  getItemWidthValue(item: GanttItem): number {
    const project = this.project();
    if (!project) return 0;

    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();
    const totalDuration = projectEnd - projectStart;

    const itemDuration = item.endDate.getTime() - item.startDate.getTime();
    return (itemDuration / totalDuration) * 100;
  }

  getGanttProgressSeverity(progress: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warn';
    return 'secondary';
  }

  getGanttTooltip(item: GanttItem): string {
    const start = this.formatDate(item.startDate);
    const end = this.formatDate(item.endDate);
    const duration = Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const type = item.type === 'phase' ? 'Fase' : 'Tarea';

    return `${type}: ${item.name}\nInicio: ${start}\nFin: ${end}\nDuración: ${duration} días\nProgreso: ${item.progress}%`;
  }

  onGanttItemClick(item: GanttItem): void {
    // Solo abrir si no estamos arrastrando
    const state = this.ganttDragState();
    if (state.isDragging || state.isResizing) return;

    if (item.type === 'task') {
      const task = this.tasks().find(t => t.id === item.id);
      if (task) {
        this.abrirTask(task);
      }
    }
  }

  // ============================================================
  // GANTT DRAG & RESIZE
  // ============================================================

  onGanttBarMouseDown(event: MouseEvent, item: GanttItem, edge: 'left' | 'right' | 'center'): void {
    event.preventDefault();
    event.stopPropagation();

    // Obtener el ancho del timeline
    const timelineElement = (event.target as HTMLElement).closest('.gantt-timeline') as HTMLElement;
    const timelineWidth = timelineElement?.offsetWidth || 1000;

    if (edge === 'center') {
      // Drag para mover
      this.ganttDragState.set({
        isDragging: true,
        isResizing: false,
        resizeEdge: null,
        itemId: item.id,
        startX: event.clientX,
        initialStartDate: new Date(item.startDate),
        initialEndDate: new Date(item.endDate),
        timelineWidth
      });
    } else {
      // Resize
      this.ganttDragState.set({
        isDragging: false,
        isResizing: true,
        resizeEdge: edge,
        itemId: item.id,
        startX: event.clientX,
        initialStartDate: new Date(item.startDate),
        initialEndDate: new Date(item.endDate),
        timelineWidth
      });
    }

    // Agregar listeners globales
    document.addEventListener('mousemove', this.onGanttMouseMove);
    document.addEventListener('mouseup', this.onGanttMouseUp);
  }

  onGanttMouseMove = (event: MouseEvent): void => {
    const state = this.ganttDragState();
    if (!state.isDragging && !state.isResizing) return;
    if (!state.itemId || !state.initialStartDate || !state.initialEndDate) return;

    const project = this.project();
    if (!project) return;

    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.endDate).getTime();
    const totalDuration = projectEnd - projectStart;

    // Calcular delta en píxeles y convertir a milisegundos
    const deltaX = event.clientX - state.startX;
    const deltaPercent = deltaX / state.timelineWidth;
    const deltaMs = deltaPercent * totalDuration;

    // Encontrar el item actual
    const items = this.ganttItems();
    const itemIndex = items.findIndex(i => i.id === state.itemId);
    if (itemIndex === -1) return;

    const currentItem = items[itemIndex];
    let newStartDate = state.initialStartDate;
    let newEndDate = state.initialEndDate;

    if (state.isDragging) {
      // Mover toda la barra
      newStartDate = new Date(state.initialStartDate.getTime() + deltaMs);
      newEndDate = new Date(state.initialEndDate.getTime() + deltaMs);

      // Limitar dentro del proyecto
      if (newStartDate.getTime() < projectStart) {
        const diff = projectStart - newStartDate.getTime();
        newStartDate = new Date(projectStart);
        newEndDate = new Date(newEndDate.getTime() + diff);
      }
      if (newEndDate.getTime() > projectEnd) {
        const diff = newEndDate.getTime() - projectEnd;
        newEndDate = new Date(projectEnd);
        newStartDate = new Date(newStartDate.getTime() - diff);
      }
    } else if (state.isResizing) {
      if (state.resizeEdge === 'left') {
        // Resize desde la izquierda
        newStartDate = new Date(state.initialStartDate.getTime() + deltaMs);
        // Mínimo 1 día de duración
        const minEnd = new Date(newStartDate.getTime() + 24 * 60 * 60 * 1000);
        if (newStartDate.getTime() < projectStart) {
          newStartDate = new Date(projectStart);
        }
        if (newStartDate.getTime() >= state.initialEndDate.getTime() - 24 * 60 * 60 * 1000) {
          newStartDate = new Date(state.initialEndDate.getTime() - 24 * 60 * 60 * 1000);
        }
      } else if (state.resizeEdge === 'right') {
        // Resize desde la derecha
        newEndDate = new Date(state.initialEndDate.getTime() + deltaMs);
        // Mínimo 1 día de duración
        if (newEndDate.getTime() > projectEnd) {
          newEndDate = new Date(projectEnd);
        }
        if (newEndDate.getTime() <= state.initialStartDate.getTime() + 24 * 60 * 60 * 1000) {
          newEndDate = new Date(state.initialStartDate.getTime() + 24 * 60 * 60 * 1000);
        }
      }
    }

    // Actualizar el item visualmente
    const updatedItems = [...items];
    updatedItems[itemIndex] = {
      ...currentItem,
      startDate: newStartDate,
      endDate: newEndDate
    };
    this.ganttItems.set(updatedItems);
  };

  onGanttMouseUp = (): void => {
    const state = this.ganttDragState();

    if ((state.isDragging || state.isResizing) && state.itemId) {
      // Guardar los cambios en la tarea o fase real
      const item = this.ganttItems().find(i => i.id === state.itemId);
      if (item) {
        this.updateGanttItemDates(item);
      }
    }

    // Reset state
    this.ganttDragState.set({
      isDragging: false,
      isResizing: false,
      resizeEdge: null,
      itemId: null,
      startX: 0,
      initialStartDate: null,
      initialEndDate: null,
      timelineWidth: 0
    });

    // Remover listeners
    document.removeEventListener('mousemove', this.onGanttMouseMove);
    document.removeEventListener('mouseup', this.onGanttMouseUp);
  };

  updateGanttItemDates(item: GanttItem): void {
    const project = this.project();
    if (!project) return;

    if (item.type === 'task') {
      // Actualizar tarea usando el servicio
      this.proyectosService.tasks.update(tasks =>
        tasks.map(t => t.id === item.id ? {
          ...t,
          startDate: item.startDate.toISOString().split('T')[0],
          dueDate: item.endDate.toISOString().split('T')[0]
        } : t)
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Tarea actualizada',
        detail: `"${item.name}" movida a ${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}`
      });
    } else if (item.type === 'phase') {
      // Actualizar fase usando el servicio
      const phases = project.phases || [];
      const phaseIndex = phases.findIndex(p => p.id === item.id);
      if (phaseIndex !== -1) {
        const updatedPhases = [...phases];
        updatedPhases[phaseIndex] = {
          ...updatedPhases[phaseIndex],
          startDate: item.startDate.toISOString().split('T')[0],
          endDate: item.endDate.toISOString().split('T')[0]
        };

        this.proyectosService.selectedProject.set({
          ...project,
          phases: updatedPhases
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Fase actualizada',
          detail: `"${item.name}" movida a ${this.formatDate(item.startDate)} - ${this.formatDate(item.endDate)}`
        });
      }
    }
  }

  isGanttItemDragging(itemId: string): boolean {
    const state = this.ganttDragState();
    return (state.isDragging || state.isResizing) && state.itemId === itemId;
  }

  // ============================================================
  // GANTT REORDER (Vertical drag & drop)
  // ============================================================

  onGanttRowDragStart(event: DragEvent, item: GanttItem): void {
    if (!event.dataTransfer) return;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);

    this.ganttReorderState.set({
      isDragging: true,
      draggedItemId: item.id,
      draggedItemType: item.type,
      dropTargetId: null,
      dropPosition: null
    });

    // Agregar clase al elemento arrastrado
    const target = event.target as HTMLElement;
    setTimeout(() => target.classList.add('dragging-row'), 0);
  }

  onGanttRowDragOver(event: DragEvent, targetItem: GanttItem): void {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const state = this.ganttReorderState();
    if (!state.isDragging || state.draggedItemId === targetItem.id) return;

    event.dataTransfer.dropEffect = 'move';

    // Determinar posición del drop (antes, después, o dentro si es fase)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const y = event.clientY - rect.top;
    const height = rect.height;

    let dropPosition: 'before' | 'after' | 'inside' = 'after';

    if (y < height * 0.3) {
      dropPosition = 'before';
    } else if (y > height * 0.7) {
      dropPosition = 'after';
    } else if (targetItem.type === 'phase' && state.draggedItemType === 'task') {
      // Solo permitir drop inside si el target es fase y el dragged es tarea
      dropPosition = 'inside';
    } else {
      dropPosition = y < height / 2 ? 'before' : 'after';
    }

    this.ganttReorderState.set({
      ...state,
      dropTargetId: targetItem.id,
      dropPosition
    });
  }

  onGanttRowDragLeave(event: DragEvent): void {
    // Solo limpiar si realmente salimos del elemento
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;

    if (!currentTarget.contains(relatedTarget)) {
      const state = this.ganttReorderState();
      this.ganttReorderState.set({
        ...state,
        dropTargetId: null,
        dropPosition: null
      });
    }
  }

  onGanttRowDrop(event: DragEvent, targetItem: GanttItem): void {
    event.preventDefault();
    event.stopPropagation();

    const state = this.ganttReorderState();
    if (!state.isDragging || !state.draggedItemId) return;

    const draggedItem = this.ganttItems().find(i => i.id === state.draggedItemId);
    if (!draggedItem || draggedItem.id === targetItem.id) {
      this.resetGanttReorderState();
      return;
    }

    this.executeGanttReorder(draggedItem, targetItem, state.dropPosition || 'after');
    this.resetGanttReorderState();
  }

  onGanttRowDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging-row');
    this.resetGanttReorderState();
  }

  resetGanttReorderState(): void {
    this.ganttReorderState.set({
      isDragging: false,
      draggedItemId: null,
      draggedItemType: null,
      dropTargetId: null,
      dropPosition: null
    });
  }

  executeGanttReorder(draggedItem: GanttItem, targetItem: GanttItem, position: 'before' | 'after' | 'inside' | null): void {
    const project = this.project();
    if (!project) return;

    // Si es mover una tarea dentro de una fase
    if (position === 'inside' && targetItem.type === 'phase' && draggedItem.type === 'task') {
      this.moveTaskToPhase(draggedItem.id, targetItem.id);
      return;
    }

    // Reordenar items del mismo tipo
    const validPosition: 'before' | 'after' = position === 'before' ? 'before' : 'after';

    if (draggedItem.type === 'phase' && targetItem.type === 'phase') {
      this.reorderPhases(draggedItem.id, targetItem.id, validPosition);
    } else if (draggedItem.type === 'task') {
      this.reorderTasks(draggedItem, targetItem, validPosition);
    }
  }

  moveTaskToPhase(taskId: string, phaseId: string): void {
    this.proyectosService.tasks.update(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, phaseId } : t)
    );

    this.buildGanttItems();

    this.messageService.add({
      severity: 'success',
      summary: 'Tarea movida',
      detail: 'La tarea fue movida a la nueva fase'
    });
  }

  reorderPhases(draggedId: string, targetId: string, position: 'before' | 'after'): void {
    const project = this.project();
    if (!project || !project.phases) return;

    const phases = [...project.phases];
    const draggedIndex = phases.findIndex(p => p.id === draggedId);
    const targetIndex = phases.findIndex(p => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remover el elemento arrastrado
    const [draggedPhase] = phases.splice(draggedIndex, 1);

    // Calcular nuevo índice
    let newIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      newIndex = position === 'before' ? targetIndex - 1 : targetIndex;
    } else {
      newIndex = position === 'before' ? targetIndex : targetIndex + 1;
    }

    // Insertar en nueva posición
    phases.splice(newIndex, 0, draggedPhase);

    // Actualizar orden
    const updatedPhases = phases.map((p, idx) => ({ ...p, orderNum: idx }));

    this.proyectosService.selectedProject.set({
      ...project,
      phases: updatedPhases
    });

    this.buildGanttItems();

    this.messageService.add({
      severity: 'success',
      summary: 'Orden actualizado',
      detail: 'Las fases han sido reordenadas'
    });
  }

  reorderTasks(draggedItem: GanttItem, targetItem: GanttItem, position: 'before' | 'after'): void {
    const tasks = this.tasks();

    // Obtener las tareas de la misma fase o todas si el target es una fase
    const draggedTask = tasks.find(t => t.id === draggedItem.id);
    if (!draggedTask) return;

    // Si el target es una fase, mover la tarea al final de esa fase
    if (targetItem.type === 'phase') {
      this.moveTaskToPhase(draggedItem.id, targetItem.id);
      return;
    }

    const targetTask = tasks.find(t => t.id === targetItem.id);
    if (!targetTask) return;

    const targetPhaseId = targetTask.phaseId;

    // Si están en diferentes fases, mover a la fase del target
    if (draggedTask.phaseId !== targetPhaseId) {
      this.proyectosService.tasks.update(allTasks =>
        allTasks.map(t => t.id === draggedTask.id ? { ...t, phaseId: targetPhaseId } : t)
      );
    }

    // Obtener o crear el orden de tareas para esta fase
    const currentTaskOrder = this.taskOrderByPhase();
    const newTaskOrder = new Map(currentTaskOrder);

    // Obtener las tareas de la fase destino
    const phaseTasks = tasks.filter(t => t.phaseId === targetPhaseId || t.id === draggedTask.id);
    let phaseTaskIds = newTaskOrder.get(targetPhaseId) || phaseTasks.map(t => t.id);

    // Si no existe orden, crear uno basado en las tareas actuales
    if (!newTaskOrder.has(targetPhaseId)) {
      phaseTaskIds = phaseTasks.filter(t => t.phaseId === targetPhaseId).map(t => t.id);
    }

    // Remover la tarea arrastrada de su posición actual
    phaseTaskIds = phaseTaskIds.filter(id => id !== draggedItem.id);

    // Encontrar la posición del target
    const targetIndex = phaseTaskIds.indexOf(targetItem.id);

    // Insertar en la nueva posición
    if (targetIndex !== -1) {
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      phaseTaskIds.splice(insertIndex, 0, draggedItem.id);
    } else {
      // Si no encuentra el target, agregar al final
      phaseTaskIds.push(draggedItem.id);
    }

    // Actualizar el mapa de orden
    newTaskOrder.set(targetPhaseId, phaseTaskIds);

    // Si se movió de otra fase, limpiar de la fase anterior
    if (draggedTask.phaseId !== targetPhaseId && draggedTask.phaseId) {
      const oldPhaseOrder = newTaskOrder.get(draggedTask.phaseId);
      if (oldPhaseOrder) {
        newTaskOrder.set(draggedTask.phaseId, oldPhaseOrder.filter(id => id !== draggedItem.id));
      }
    }

    this.taskOrderByPhase.set(newTaskOrder);
    this.buildGanttItems();

    this.messageService.add({
      severity: 'success',
      summary: 'Tarea reordenada',
      detail: `"${draggedItem.name}" movida ${position === 'before' ? 'antes de' : 'después de'} "${targetItem.name}"`
    });
  }

  getGanttDropIndicatorClass(itemId: string): string {
    const state = this.ganttReorderState();
    if (state.dropTargetId !== itemId) return '';

    return `drop-${state.dropPosition}`;
  }

  isGanttRowBeingDragged(itemId: string): boolean {
    const state = this.ganttReorderState();
    return state.isDragging && state.draggedItemId === itemId;
  }

  // ============================================================
  // CALENDAR EVENT HANDLERS
  // ============================================================

  handleEventClick(clickInfo: EventClickArg): void {
    const eventId = clickInfo.event.id;
    const eventType = clickInfo.event.extendedProps['type'];

    if (eventType === 'task') {
      const task = this.tasks().find(t => t.id === eventId);
      if (task) {
        this.abrirTask(task);
      }
    } else if (eventType === 'phase') {
      // Para fases, mostrar un toast con información
      this.messageService.add({
        severity: 'info',
        summary: 'Fase del proyecto',
        detail: clickInfo.event.title.replace('📁 ', ''),
        life: 3000
      });
    }
  }

  handleDateClick(dateInfo: any): void {
    // Abrir formulario de nueva tarea con la fecha seleccionada
    const project = this.project();
    if (!project) return;

    this.taskFormData.set({
      projectId: project.id,
      phaseId: project.phases?.[0]?.id || '',
      title: '',
      description: '',
      assignedTo: 'user-1',
      startDate: dateInfo.dateStr,
      dueDate: dateInfo.dateStr,
      priority: 'medium',
      taskType: 'manual',
      estimatedHours: 8,
      createdBy: 'user-1'
    });
    this.isEditingTask.set(false);
    this.showTaskFormDrawer.set(true);
  }

  // ============================================================
  // OBJETIVOS Y KPIs HELPERS
  // ============================================================

  seleccionarObjetivo(id: string): void {
    this.kpiSelectedObjectiveId.set(id);
    this.kpiTabActivo.set('kpis');
  }

  getTipoObjetivoLabel(tipo: 'estrategico' | 'operativo'): string {
    return tipo === 'estrategico' ? 'Estratégico' : 'Operativo';
  }

  getObjetivoProgresoColor(progreso: number): string {
    if (progreso >= 80) return 'high';
    if (progreso >= 50) return 'medium';
    if (progreso >= 25) return 'low';
    return 'critical';
  }

  getKPIProgreso(kpi: ProjectKPI): number {
    if (kpi.direccion === 'mayor_mejor') {
      return Math.min(100, Math.round((kpi.actual / kpi.meta) * 100));
    } else {
      // Para menor_mejor, invertimos la lógica
      if (kpi.actual <= kpi.meta) return 100;
      const exceso = kpi.actual - kpi.meta;
      const margen = kpi.umbralMaximo ? kpi.umbralMaximo - kpi.meta : kpi.meta;
      return Math.max(0, 100 - Math.round((exceso / margen) * 100));
    }
  }

  getKPIProgresoColor(kpi: ProjectKPI): string {
    const progreso = this.getKPIProgreso(kpi);
    if (progreso >= 80) return 'high';
    if (progreso >= 50) return 'medium';
    if (progreso >= 25) return 'low';
    return 'critical';
  }

  getKPIStatusClass(kpi: ProjectKPI): string {
    const progreso = this.getKPIProgreso(kpi);
    if (progreso >= 80) return 'on-track';
    if (progreso >= 50) return 'warning';
    return 'critical';
  }

  getAlertSeverityClass(severity: AlertSeverity): string {
    return severity;
  }

  getAlertStatusLabel(status: AlertStatus): string {
    const labels: Record<AlertStatus, string> = {
      activa: 'Activa',
      atendida: 'Atendida',
      resuelta: 'Resuelta'
    };
    return labels[status];
  }

  formatAlertDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // ============================================================
  // INLINE EDITING - KPIs
  // ============================================================

  iniciarEdicionKPI(kpiId: string): void {
    this.editingKpiId.set(kpiId);
  }

  cancelarEdicionKPI(): void {
    this.editingKpiId.set(null);
  }

  iniciarEdicionValorKPI(kpiId: string, tipo: 'actual' | 'meta'): void {
    this.editingKpiValueId.set(`${kpiId}-${tipo}`);
  }

  cancelarEdicionValorKPI(): void {
    this.editingKpiValueId.set(null);
  }

  guardarNombreKPI(objetivoId: string, kpi: ProjectKPI, nuevoNombre: string): void {
    if (!nuevoNombre.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre no puede estar vacío'
      });
      return;
    }

    if (nuevoNombre.trim() === kpi.nombre) {
      this.editingKpiId.set(null);
      return;
    }

    // Actualizar el KPI en el objetivo
    this.projectObjetivos.update(objetivos =>
      objetivos.map(obj => {
        if (obj.id === objetivoId) {
          return {
            ...obj,
            kpis: obj.kpis.map(k =>
              k.id === kpi.id ? { ...k, nombre: nuevoNombre.trim() } : k
            )
          };
        }
        return obj;
      })
    );

    this.messageService.add({
      severity: 'success',
      summary: 'KPI actualizado',
      detail: `Nombre cambiado a "${nuevoNombre.trim()}"`
    });
    this.editingKpiId.set(null);
  }

  guardarValorKPI(objetivoId: string, kpi: ProjectKPI, tipo: 'actual' | 'meta', nuevoValor: string): void {
    const valor = parseFloat(nuevoValor);
    if (isNaN(valor)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Valor inválido',
        detail: 'Debe ingresar un número válido'
      });
      return;
    }

    // Actualizar el KPI en el objetivo
    this.projectObjetivos.update(objetivos =>
      objetivos.map(obj => {
        if (obj.id === objetivoId) {
          return {
            ...obj,
            kpis: obj.kpis.map(k =>
              k.id === kpi.id ? { ...k, [tipo]: valor } : k
            )
          };
        }
        return obj;
      })
    );

    this.messageService.add({
      severity: 'success',
      summary: 'KPI actualizado',
      detail: `${tipo === 'actual' ? 'Valor actual' : 'Meta'} actualizado a ${valor}`
    });
    this.editingKpiValueId.set(null);
  }

  confirmarEliminarKPI(objetivoId: string, kpi: ProjectKPI): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el KPI "${kpi.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Eliminar el KPI del objetivo
        this.projectObjetivos.update(objetivos =>
          objetivos.map(obj => {
            if (obj.id === objetivoId) {
              return {
                ...obj,
                kpis: obj.kpis.filter(k => k.id !== kpi.id)
              };
            }
            return obj;
          })
        );

        // También eliminar alertas relacionadas con este KPI
        this.projectAlertas.update(alertas =>
          alertas.filter(a => a.kpiId !== kpi.id)
        );

        this.messageService.add({
          severity: 'success',
          summary: 'KPI eliminado',
          detail: `El KPI "${kpi.nombre}" ha sido eliminado`
        });
      }
    });
  }

  // ============================================================
  // MODO EDICIÓN OBJETIVOS/KPIs (estilo objetivos-kpis)
  // ============================================================

  cambiarModoObjetivos(nuevoModo: 'ver' | 'editar'): void {
    this.modoObjetivos.set(nuevoModo);
    if (nuevoModo === 'editar' && this.objetivoSeleccionado()) {
      this.iniciarEdicionObjetivo();
    } else {
      this.resetEditStatesObjetivos();
    }
  }

  resetEditStatesObjetivos(): void {
    this.editandoObjetivo.set(false);
    this.editandoKPIId.set(null);
    this.nuevoKPI.set(false);
  }

  iniciarEdicionObjetivo(): void {
    const obj = this.objetivoSeleccionado();
    if (obj) {
      this.formObjetivoNombre.set(obj.nombre);
      this.formObjetivoDescripcion.set(obj.descripcion || '');
      this.formObjetivoTipo.set(obj.tipo);
      this.editandoObjetivo.set(true);
    }
  }

  guardarObjetivo(): void {
    const objetivoId = this.kpiSelectedObjectiveId();
    if (!objetivoId || !this.formObjetivoNombre().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return;
    }

    this.projectObjetivos.update(list =>
      list.map(o =>
        o.id === objetivoId
          ? {
              ...o,
              nombre: this.formObjetivoNombre(),
              descripcion: this.formObjetivoDescripcion(),
              tipo: this.formObjetivoTipo()
            }
          : o
      )
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Objetivo actualizado correctamente'
    });
    this.editandoObjetivo.set(false);
  }

  eliminarObjetivo(): void {
    const id = this.kpiSelectedObjectiveId();
    if (!id) return;

    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este objetivo y todos sus KPIs?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.projectObjetivos.update(list => list.filter(o => o.id !== id));
        this.messageService.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: 'Objetivo eliminado'
        });

        const remaining = this.projectObjetivos();
        if (remaining.length > 0) {
          this.kpiSelectedObjectiveId.set(remaining[0].id);
        } else {
          this.kpiSelectedObjectiveId.set(null);
        }
        this.resetEditStatesObjetivos();
      }
    });
  }

  // ============================================================
  // CRUD KPIs con formulario completo
  // ============================================================

  iniciarNuevoKPIForm(): void {
    this.formKPINombre.set('');
    this.formKPIMeta.set(100);
    this.formKPIActual.set(0);
    this.formKPIEscala.set('%');
    this.formKPIUmbralAlerta.set(50);
    this.formKPIUmbralMaximo.set(null);
    this.formKPISeveridad.set('warning');
    this.formKPICanales.set(['in-app']);
    this.formKPIFrecuencia.set('diaria');
    this.formKPIDireccion.set('mayor_mejor');
    this.nuevoKPI.set(true);
    this.editandoKPIId.set(null);
  }

  iniciarEdicionKPIForm(kpi: ProjectKPI): void {
    this.formKPINombre.set(kpi.nombre);
    this.formKPIMeta.set(kpi.meta);
    this.formKPIActual.set(kpi.actual);
    this.formKPIEscala.set(kpi.escala);
    this.formKPIUmbralAlerta.set(kpi.umbralAlerta || 50);
    this.formKPIUmbralMaximo.set(kpi.umbralMaximo || null);
    this.formKPISeveridad.set(kpi.severidad || 'warning');
    this.formKPICanales.set(kpi.canalesNotificacion || ['in-app']);
    this.formKPIFrecuencia.set(kpi.frecuenciaEvaluacion || 'diaria');
    this.formKPIDireccion.set(kpi.direccion);
    this.editandoKPIId.set(kpi.id);
    this.nuevoKPI.set(false);
  }

  cancelarKPIForm(): void {
    this.nuevoKPI.set(false);
    this.editandoKPIId.set(null);
  }

  guardarKPIForm(): void {
    const objetivoId = this.kpiSelectedObjectiveId();
    if (!objetivoId || !this.formKPINombre().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre del KPI es requerido'
      });
      return;
    }

    const editandoId = this.editandoKPIId();
    const kpi: ProjectKPI = {
      id: editandoId || `KPI-${Date.now()}`,
      nombre: this.formKPINombre(),
      meta: this.formKPIMeta(),
      actual: this.formKPIActual(),
      escala: this.formKPIEscala(),
      umbralAlerta: this.formKPIUmbralAlerta(),
      umbralMaximo: this.formKPIUmbralMaximo(),
      severidad: this.formKPISeveridad(),
      canalesNotificacion: this.formKPICanales(),
      frecuenciaEvaluacion: this.formKPIFrecuencia(),
      direccion: this.formKPIDireccion()
    };

    if (editandoId) {
      this.projectObjetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: o.kpis.map(k => k.id === kpi.id ? kpi : k) }
            : o
        )
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'KPI actualizado'
      });
    } else {
      this.projectObjetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: [...o.kpis, kpi] }
            : o
        )
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Agregado',
        detail: 'KPI agregado'
      });
    }

    this.cancelarKPIForm();
  }

  eliminarKPIForm(kpiId: string): void {
    const objetivoId = this.kpiSelectedObjectiveId();
    if (!objetivoId) return;

    this.projectObjetivos.update(list =>
      list.map(o =>
        o.id === objetivoId
          ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) }
          : o
      )
    );
    this.messageService.add({
      severity: 'info',
      summary: 'Eliminado',
      detail: 'KPI eliminado'
    });
  }

  isChannelSelected(channel: 'email' | 'in-app' | 'webhook'): boolean {
    return this.formKPICanales().includes(channel);
  }

  toggleChannel(channel: 'email' | 'in-app' | 'webhook'): void {
    this.formKPICanales.update(channels => {
      if (channels.includes(channel)) {
        return channels.filter(c => c !== channel);
      }
      return [...channels, channel];
    });
  }

  tieneAlertaKPI(kpi: ProjectKPI): boolean {
    const progreso = this.getKPIProgreso(kpi);
    return progreso < (kpi.umbralAlerta || 50);
  }

  getDireccionLabel(direccion: 'mayor_mejor' | 'menor_mejor'): string {
    return direccion === 'mayor_mejor' ? 'Mejor +' : 'Mejor -';
  }

  // ============================================================
  // ALERTAS FILTRADAS Y GESTIÓN
  // ============================================================

  alertasFiltradas = computed(() => {
    let resultado = this.alertasDelObjetivo();

    const severidad = this.filtroAlertaSeveridad();
    if (severidad) {
      resultado = resultado.filter(a => a.severity === severidad);
    }

    const status = this.filtroAlertaStatus();
    if (status) {
      resultado = resultado.filter(a => a.status === status);
    }

    const busqueda = this.busquedaAlertas().toLowerCase();
    if (busqueda) {
      resultado = resultado.filter(a =>
        a.kpiNombre?.toLowerCase().includes(busqueda) ||
        a.mensaje?.toLowerCase().includes(busqueda)
      );
    }

    return resultado;
  });

  getSeverityLabel(severity: 'info' | 'warning' | 'critical'): string {
    const labels: Record<string, string> = {
      'info': 'Info',
      'warning': 'Warning',
      'critical': 'Crítico'
    };
    return labels[severity] || severity;
  }

  abrirAtenderAlerta(alerta: ProjectKPIAlert): void {
    this.alertaParaAtender.set(alerta);
    this.comentarioAtencion.set('');
    this.showAtenderAlertaDialog.set(true);
  }

  cancelarAtencion(): void {
    this.showAtenderAlertaDialog.set(false);
    this.alertaParaAtender.set(null);
    this.comentarioAtencion.set('');
  }

  confirmarAtencion(): void {
    const alerta = this.alertaParaAtender();
    const comentario = this.comentarioAtencion();

    if (!alerta || !comentario.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El comentario es requerido'
      });
      return;
    }

    this.projectAlertas.update(alertas =>
      alertas.map(a =>
        a.id === alerta.id
          ? {
              ...a,
              status: 'atendida' as AlertStatus,
              fechaAtendida: new Date(),
              atendidaPor: 'Usuario Actual',
              comentarioResolucion: comentario
            }
          : a
      )
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Alerta Atendida',
      detail: 'La alerta ha sido marcada como atendida'
    });

    this.cancelarAtencion();
  }

  verHistorialKPI(kpiId: string): void {
    const historial = this.projectAlertas().filter(a => a.kpiId === kpiId);
    this.messageService.add({
      severity: 'info',
      summary: 'Historial',
      detail: `Se encontraron ${historial.length} alertas para este KPI`
    });
  }

  formatDateAlertas(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
