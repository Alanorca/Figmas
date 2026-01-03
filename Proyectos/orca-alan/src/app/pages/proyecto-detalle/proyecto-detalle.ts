import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';

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

interface TimelineEvent {
  title: string;
  date: string;
  icon: string;
  color: string;
  description?: string;
  type: 'phase' | 'task' | 'milestone';
}

@Component({
  selector: 'app-proyecto-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    SliderModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule
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

    // Agregar fases
    if (project.phases) {
      project.phases.forEach(phase => {
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
      });
    }

    // Agregar tareas
    this.tasks().forEach(task => {
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

    // Ordenar por fecha de inicio
    items.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    this.ganttItems.set(items);
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
}
