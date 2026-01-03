import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import {
  Project,
  ProjectPhase,
  Task,
  ProjectDashboard,
  GanttData,
  CalendarEvent,
  CreateProjectData,
  CreateTaskData,
  CreatePhaseData,
  CreateObjectiveData,
  CreateKPIData,
  ProjectStatus,
  TaskStatus,
  ProjectPriority,
  TaskType,
  isTaskOverdue
} from '../models/proyectos.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  private api = inject(ApiService);

  // ============================================================
  // ESTADO (Signals)
  // ============================================================

  // Proyectos
  projects = signal<Project[]>([]);
  selectedProject = signal<Project | null>(null);
  projectDashboard = signal<ProjectDashboard | null>(null);
  ganttData = signal<GanttData | null>(null);
  calendarEvents = signal<CalendarEvent[]>([]);

  // Tareas
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);

  // Filtros
  statusFilter = signal<ProjectStatus | ''>('');
  priorityFilter = signal<ProjectPriority | ''>('');
  searchFilter = signal('');

  // Loading states
  loading = signal(false);
  loadingProject = signal(false);
  loadingTasks = signal(false);

  // ============================================================
  // COMPUTED
  // ============================================================

  filteredProjects = computed(() => {
    let result = this.projects();

    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const search = this.searchFilter().toLowerCase();

    if (status) {
      result = result.filter(p => p.status === status);
    }
    if (priority) {
      result = result.filter(p => p.priority === priority);
    }
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
      );
    }

    return result;
  });

  projectStats = computed(() => {
    const all = this.projects();
    return {
      total: all.length,
      planning: all.filter(p => p.status === 'planning').length,
      inProgress: all.filter(p => p.status === 'in_progress').length,
      paused: all.filter(p => p.status === 'paused').length,
      completed: all.filter(p => p.status === 'completed').length,
      cancelled: all.filter(p => p.status === 'cancelled').length
    };
  });

  taskStats = computed(() => {
    const all = this.tasks();
    return {
      total: all.length,
      pending: all.filter(t => t.status === 'pending').length,
      inProgress: all.filter(t => t.status === 'in_progress').length,
      inReview: all.filter(t => t.status === 'in_review').length,
      completed: all.filter(t => t.status === 'completed').length,
      blocked: all.filter(t => t.status === 'blocked').length,
      overdue: all.filter(t => isTaskOverdue(t)).length
    };
  });

  // ============================================================
  // PROYECTOS - CRUD
  // ============================================================

  async loadProjects(params?: Record<string, string>): Promise<void> {
    this.loading.set(true);
    try {
      const projects = await firstValueFrom(this.api.getProjects(params));
      this.projects.set(projects);
    } catch (error) {
      console.error('Error loading projects:', error);
      throw error;
    } finally {
      this.loading.set(false);
    }
  }

  async loadProjectById(id: string): Promise<Project> {
    this.loadingProject.set(true);
    try {
      const project = await firstValueFrom(this.api.getProjectById(id));
      this.selectedProject.set(project);
      return project;
    } catch (error) {
      console.error('Error loading project:', error);
      throw error;
    } finally {
      this.loadingProject.set(false);
    }
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const project = await firstValueFrom(this.api.createProject(data));
      this.projects.update(projects => [...projects, project]);
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const project = await firstValueFrom(this.api.updateProject(id, data));
      this.projects.update(projects =>
        projects.map(p => p.id === id ? project : p)
      );
      if (this.selectedProject()?.id === id) {
        this.selectedProject.set(project);
      }
      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteProject(id));
      this.projects.update(projects => projects.filter(p => p.id !== id));
      if (this.selectedProject()?.id === id) {
        this.selectedProject.set(null);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    try {
      const project = await firstValueFrom(this.api.updateProjectStatus(id, status));
      this.projects.update(projects =>
        projects.map(p => p.id === id ? { ...p, status } : p)
      );
      return project;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  // ============================================================
  // OBJETIVOS SMART
  // ============================================================

  async createObjective(projectId: string, data: CreateObjectiveData): Promise<void> {
    try {
      const objective = await firstValueFrom(this.api.createProjectObjective(projectId, data));
      // Actualizar proyecto en la lista
      this.projects.update(projects =>
        projects.map(p => {
          if (p.id === projectId) {
            return { ...p, objectives: [...(p.objectives || []), objective] };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Error creating objective:', error);
      throw error;
    }
  }

  async updateObjective(projectId: string, objectiveId: string, data: Partial<CreateObjectiveData>): Promise<void> {
    try {
      await firstValueFrom(this.api.updateProjectObjective(projectId, objectiveId, data));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error updating objective:', error);
      throw error;
    }
  }

  async deleteObjective(projectId: string, objectiveId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteProjectObjective(projectId, objectiveId));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error deleting objective:', error);
      throw error;
    }
  }

  // ============================================================
  // KPIs
  // ============================================================

  async createKPI(projectId: string, data: CreateKPIData): Promise<void> {
    try {
      await firstValueFrom(this.api.createProjectKPI(projectId, data));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error creating KPI:', error);
      throw error;
    }
  }

  async updateKPI(projectId: string, kpiId: string, data: Partial<CreateKPIData>): Promise<void> {
    try {
      await firstValueFrom(this.api.updateProjectKPI(projectId, kpiId, data));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error updating KPI:', error);
      throw error;
    }
  }

  async deleteKPI(projectId: string, kpiId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteProjectKPI(projectId, kpiId));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error deleting KPI:', error);
      throw error;
    }
  }

  // ============================================================
  // FASES
  // ============================================================

  async createPhase(projectId: string, data: CreatePhaseData): Promise<ProjectPhase> {
    try {
      const phase = await firstValueFrom(this.api.createProjectPhase(projectId, data));
      await this.loadProjectById(projectId);
      return phase;
    } catch (error) {
      console.error('Error creating phase:', error);
      throw error;
    }
  }

  async updatePhase(projectId: string, phaseId: string, data: Partial<ProjectPhase>): Promise<void> {
    try {
      await firstValueFrom(this.api.updateProjectPhase(projectId, phaseId, data));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error updating phase:', error);
      throw error;
    }
  }

  async deletePhase(projectId: string, phaseId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteProjectPhase(projectId, phaseId));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }
  }

  async updatePhaseStatus(projectId: string, phaseId: string, status: string): Promise<void> {
    try {
      await firstValueFrom(this.api.updatePhaseStatus(projectId, phaseId, status));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error updating phase status:', error);
      throw error;
    }
  }

  async reorderPhases(projectId: string, phases: { id: string; orderNum: number }[]): Promise<void> {
    try {
      await firstValueFrom(this.api.reorderProjectPhases(projectId, phases));
      await this.loadProjectById(projectId);
    } catch (error) {
      console.error('Error reordering phases:', error);
      throw error;
    }
  }

  // ============================================================
  // TAREAS
  // ============================================================

  async loadTasks(params?: Record<string, string>): Promise<void> {
    this.loadingTasks.set(true);
    try {
      const tasks = await firstValueFrom(this.api.getTasks(params));
      this.tasks.set(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    } finally {
      this.loadingTasks.set(false);
    }
  }

  async loadTaskById(id: string): Promise<Task> {
    try {
      const task = await firstValueFrom(this.api.getTaskById(id));
      this.selectedTask.set(task);
      return task;
    } catch (error) {
      console.error('Error loading task:', error);
      throw error;
    }
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      const task = await firstValueFrom(this.api.createTask(data));
      this.tasks.update(tasks => [...tasks, task]);
      // Recargar proyecto para actualizar progreso
      if (data.projectId) {
        await this.loadProjectById(data.projectId);
      }
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    try {
      const task = await firstValueFrom(this.api.updateTask(id, data));
      this.tasks.update(tasks =>
        tasks.map(t => t.id === id ? task : t)
      );
      if (this.selectedTask()?.id === id) {
        this.selectedTask.set(task);
      }
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    const task = this.tasks().find(t => t.id === id);
    try {
      await firstValueFrom(this.api.deleteTask(id));
      this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      if (this.selectedTask()?.id === id) {
        this.selectedTask.set(null);
      }
      // Recargar proyecto para actualizar progreso
      if (task?.projectId) {
        await this.loadProjectById(task.projectId);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus, userId?: string, comment?: string): Promise<Task> {
    const task = this.tasks().find(t => t.id === id);
    try {
      const updatedTask = await firstValueFrom(this.api.updateTaskStatus(id, status, userId, comment));
      this.tasks.update(tasks =>
        tasks.map(t => t.id === id ? updatedTask : t)
      );
      // Recargar proyecto para actualizar progreso
      if (task?.projectId) {
        await this.loadProjectById(task.projectId);
      }
      return updatedTask;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async updateTaskProgress(id: string, progress: number, actualHours?: number, userId?: string, comment?: string): Promise<Task> {
    const task = this.tasks().find(t => t.id === id);
    try {
      const updatedTask = await firstValueFrom(this.api.updateTaskProgress(id, progress, actualHours, userId, comment));
      this.tasks.update(tasks =>
        tasks.map(t => t.id === id ? updatedTask : t)
      );
      // Recargar proyecto para actualizar progreso
      if (task?.projectId) {
        await this.loadProjectById(task.projectId);
      }
      return updatedTask;
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }

  async assignTask(id: string, assignedTo: string, assignedBy?: string, reason?: string): Promise<Task> {
    try {
      const task = await firstValueFrom(this.api.assignTask(id, assignedTo, assignedBy, reason));
      this.tasks.update(tasks =>
        tasks.map(t => t.id === id ? task : t)
      );
      return task;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  // ============================================================
  // VISTAS: DASHBOARD, GANTT, CALENDARIO
  // ============================================================

  async loadProjectDashboard(projectId: string): Promise<ProjectDashboard> {
    try {
      const dashboard = await firstValueFrom(this.api.getProjectDashboard(projectId));
      this.projectDashboard.set(dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error loading project dashboard:', error);
      throw error;
    }
  }

  async loadGanttData(projectId: string): Promise<GanttData> {
    try {
      const data = await firstValueFrom(this.api.getProjectGantt(projectId));
      this.ganttData.set(data);
      return data;
    } catch (error) {
      console.error('Error loading Gantt data:', error);
      throw error;
    }
  }

  async loadCalendarEvents(projectId: string, start?: string, end?: string): Promise<CalendarEvent[]> {
    try {
      const events = await firstValueFrom(this.api.getProjectCalendar(projectId, { start, end }));
      this.calendarEvents.set(events);
      return events;
    } catch (error) {
      console.error('Error loading calendar events:', error);
      throw error;
    }
  }

  async loadMyTasks(userId: string, start?: string, end?: string): Promise<CalendarEvent[]> {
    try {
      const events = await firstValueFrom(this.api.getMyTasks(userId, { start, end }));
      return events;
    } catch (error) {
      console.error('Error loading my tasks:', error);
      throw error;
    }
  }

  // ============================================================
  // EVIDENCIAS
  // ============================================================

  async loadTaskEvidences(taskId: string): Promise<void> {
    try {
      const evidences = await firstValueFrom(this.api.getTaskEvidences(taskId));
      const task = this.selectedTask();
      if (task && task.id === taskId) {
        this.selectedTask.set({ ...task, evidences });
      }
    } catch (error) {
      console.error('Error loading task evidences:', error);
      throw error;
    }
  }

  async uploadEvidence(taskId: string, data: any): Promise<void> {
    try {
      await firstValueFrom(this.api.createTaskEvidence(taskId, data));
      await this.loadTaskEvidences(taskId);
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  async deleteEvidence(taskId: string, evidenceId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteTaskEvidence(taskId, evidenceId));
      await this.loadTaskEvidences(taskId);
    } catch (error) {
      console.error('Error deleting evidence:', error);
      throw error;
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  clearSelection(): void {
    this.selectedProject.set(null);
    this.selectedTask.set(null);
    this.projectDashboard.set(null);
    this.ganttData.set(null);
    this.calendarEvents.set([]);
  }

  resetFilters(): void {
    this.statusFilter.set('');
    this.priorityFilter.set('');
    this.searchFilter.set('');
  }
}
