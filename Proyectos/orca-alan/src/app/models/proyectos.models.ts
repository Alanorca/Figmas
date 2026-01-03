// ============================================================
// TIPOS Y ENUMS
// ============================================================

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled';
export type TaskType = 'manual' | 'risk_mitigation' | 'opportunity' | 'incident_mitigation' | 'defect_mitigation';
export type PhaseStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type ObjectiveCategory = 'specific' | 'measurable' | 'achievable' | 'relevant' | 'time_bound';
export type ObjectiveStatus = 'pending' | 'in_progress' | 'achieved' | 'not_achieved';
export type KPIStatus = 'on_track' | 'at_risk' | 'off_track';
export type FormulaType = 'count' | 'average' | 'percentage' | 'custom';
export type EvidenceType = 'document' | 'image' | 'log' | 'screenshot' | 'other';
export type LinkedEntityType = 'RISK' | 'ML_RESULT' | 'INCIDENT' | 'DEFECT';

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  responsibleUserId: string;
  orgUnitId?: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  progress: number;
  reminderDays: number[];
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;

  // Relaciones (opcionales, dependen del include del backend)
  objectives?: ProjectObjective[];
  kpis?: ProjectKPI[];
  phases?: ProjectPhase[];
  tasks?: Task[];

  // Campos calculados (del backend)
  calculatedProgress?: number;
  taskStats?: TaskStats;
  _count?: {
    tasks: number;
    phases: number;
  };
}

export interface ProjectObjective {
  id: string;
  projectId: string;
  description: string;
  category: ObjectiveCategory;
  status: ObjectiveStatus;
  targetDate?: Date | string;
  completedDate?: Date | string;
}

export interface ProjectKPI {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  formulaType: FormulaType;
  formula?: string;
  status: KPIStatus;

  // Campo calculado
  percentage?: number;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  orderNum: number;
  startDate: Date | string;
  endDate: Date | string;
  actualStartDate?: Date | string;
  actualEndDate?: Date | string;
  status: PhaseStatus;
  weight: number;
  dependsOnPhaseId?: string;
  progress: number;
  createdAt: Date | string;
  updatedAt: Date | string;

  // Relaciones
  tasks?: Task[];
  dependsOn?: ProjectPhase;
  dependents?: ProjectPhase[];
}

export interface Task {
  id: string;
  projectId: string;
  phaseId: string;
  title: string;
  description?: string;

  // Asignación
  assignedTo: string;
  assignedBy: string;
  assignedAt: Date | string;

  // Fechas
  startDate: Date | string;
  dueDate: Date | string;
  completedDate?: Date | string;

  // Progreso
  progress: number;
  status: TaskStatus;
  priority: ProjectPriority;

  // Esfuerzo
  estimatedHours?: number;
  actualHours?: number;

  // Tipo y vinculación
  taskType: TaskType;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;

  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;

  // Relaciones
  project?: { id: string; name: string };
  phase?: { id: string; name: string };
  evidences?: TaskEvidence[];
  history?: TaskHistory[];
  _count?: {
    evidences: number;
    history: number;
  };
}

export interface TaskEvidence {
  id: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  evidenceType: EvidenceType;
  description?: string;
  documentDate?: Date | string;
  uploadedBy: string;
  uploadedAt: Date | string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'progress_updated';
  changes?: string; // JSON string
  comment?: string;
  timestamp: Date | string;
}

// ============================================================
// INTERFACES PARA VISTAS
// ============================================================

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  blocked: number;
  overdue?: number;
}

export interface ProjectDashboard {
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    startDate: Date | string;
    endDate: Date | string;
    daysRemaining: number;
  };
  progress: {
    overall: number;
    byPhase: {
      id: string;
      name: string;
      progress: number;
      status: PhaseStatus;
    }[];
  };
  tasks: TaskStats;
  objectives: {
    id: string;
    description: string;
    category: ObjectiveCategory;
    status: ObjectiveStatus;
  }[];
  kpis: {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    unit: string;
    status: KPIStatus;
    percentage: number;
  }[];
  upcomingTasks: Task[];
}

export interface GanttData {
  project: {
    id: string;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  items: GanttItem[];
}

export interface GanttItem {
  id: string;
  type: 'phase' | 'task';
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  progress: number;
  status: PhaseStatus | TaskStatus;
  dependsOn?: string;
  priority?: ProjectPriority;
  assignedTo?: string;
  phaseId?: string;
  children?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  status: TaskStatus;
  priority: ProjectPriority;
  phase?: string;
  phaseId?: string;
  project?: string;
  projectId?: string;
  assignedTo?: string;
  progress?: number;
  extendedProps?: {
    taskType: TaskType;
    linkedEntityType?: LinkedEntityType;
    linkedEntityId?: string;
  };
}

// ============================================================
// INTERFACES PARA FORMULARIOS
// ============================================================

export interface CreateProjectData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  responsibleUserId: string;
  orgUnitId?: string;
  priority?: ProjectPriority;
  status?: ProjectStatus;
  reminderDays?: number[];
  objectives?: Omit<ProjectObjective, 'id' | 'projectId'>[];
  kpis?: Omit<ProjectKPI, 'id' | 'projectId' | 'currentValue' | 'status'>[];
  phases?: Omit<ProjectPhase, 'id' | 'projectId' | 'progress' | 'createdAt' | 'updatedAt'>[];
  createdBy: string;
}

export interface CreateTaskData {
  projectId: string;
  phaseId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy?: string;
  startDate: string;
  dueDate: string;
  priority?: ProjectPriority;
  estimatedHours?: number;
  taskType?: TaskType;
  linkedEntityType?: LinkedEntityType;
  linkedEntityId?: string;
  createdBy: string;
}

export interface CreatePhaseData {
  name: string;
  description?: string;
  orderNum?: number;
  startDate: string;
  endDate: string;
  weight?: number;
  dependsOnPhaseId?: string;
}

export interface CreateObjectiveData {
  description: string;
  category: ObjectiveCategory;
  status?: ObjectiveStatus;
  targetDate?: string;
}

export interface CreateKPIData {
  name: string;
  description?: string;
  targetValue: number;
  unit: string;
  formulaType: FormulaType;
  formula?: string;
}

// ============================================================
// CONSTANTES Y OPCIONES
// ============================================================

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string; icon: string }[] = [
  { value: 'planning', label: 'Planificación', color: 'gray', icon: 'pi-file-edit' },
  { value: 'in_progress', label: 'En Progreso', color: 'blue', icon: 'pi-play' },
  { value: 'paused', label: 'Pausado', color: 'orange', icon: 'pi-pause' },
  { value: 'completed', label: 'Completado', color: 'green', icon: 'pi-check-circle' },
  { value: 'cancelled', label: 'Cancelado', color: 'red', icon: 'pi-times-circle' }
];

export const PROJECT_PRIORITY_OPTIONS: { value: ProjectPriority; label: string; color: string; severity: string }[] = [
  { value: 'low', label: 'Baja', color: 'gray', severity: 'secondary' },
  { value: 'medium', label: 'Media', color: 'blue', severity: 'info' },
  { value: 'high', label: 'Alta', color: 'orange', severity: 'warn' },
  { value: 'critical', label: 'Crítica', color: 'red', severity: 'danger' }
];

export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; icon: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'gray', icon: 'pi-clock' },
  { value: 'in_progress', label: 'En Progreso', color: 'blue', icon: 'pi-spinner' },
  { value: 'in_review', label: 'En Revisión', color: 'yellow', icon: 'pi-eye' },
  { value: 'completed', label: 'Completada', color: 'green', icon: 'pi-check' },
  { value: 'blocked', label: 'Bloqueada', color: 'red', icon: 'pi-ban' },
  { value: 'cancelled', label: 'Cancelada', color: 'gray', icon: 'pi-times' }
];

export const TASK_TYPE_OPTIONS: { value: TaskType; label: string; icon: string }[] = [
  { value: 'manual', label: 'Manual', icon: 'pi-pencil' },
  { value: 'risk_mitigation', label: 'Mitigación de Riesgo', icon: 'pi-shield' },
  { value: 'opportunity', label: 'Oportunidad (ML)', icon: 'pi-star' },
  { value: 'incident_mitigation', label: 'Mitigación de Incidente', icon: 'pi-exclamation-triangle' },
  { value: 'defect_mitigation', label: 'Mitigación de Defecto', icon: 'pi-bug' }
];

export const OBJECTIVE_CATEGORY_OPTIONS: { value: ObjectiveCategory; label: string; description: string }[] = [
  { value: 'specific', label: 'Específico', description: 'Claro y bien definido' },
  { value: 'measurable', label: 'Medible', description: 'Cuantificable con métricas' },
  { value: 'achievable', label: 'Alcanzable', description: 'Realista y factible' },
  { value: 'relevant', label: 'Relevante', description: 'Alineado con objetivos estratégicos' },
  { value: 'time_bound', label: 'Temporal', description: 'Con fecha límite definida' }
];

export const KPI_FORMULA_TYPE_OPTIONS: { value: FormulaType; label: string; description: string }[] = [
  { value: 'count', label: 'Conteo', description: 'Cuenta elementos' },
  { value: 'average', label: 'Promedio', description: 'Calcula promedio' },
  { value: 'percentage', label: 'Porcentaje', description: 'Calcula porcentaje' },
  { value: 'custom', label: 'Personalizado', description: 'Fórmula customizada' }
];

// ============================================================
// HELPERS
// ============================================================

export function getStatusColor(status: ProjectStatus | TaskStatus | PhaseStatus): string {
  const colors: Record<string, string> = {
    planning: 'var(--gray-500)',
    pending: 'var(--gray-500)',
    in_progress: 'var(--blue-500)',
    in_review: 'var(--yellow-500)',
    paused: 'var(--orange-500)',
    completed: 'var(--green-500)',
    blocked: 'var(--red-500)',
    cancelled: 'var(--gray-600)'
  };
  return colors[status] || 'var(--gray-500)';
}

export function getPriorityColor(priority: ProjectPriority): string {
  const colors: Record<ProjectPriority, string> = {
    low: 'var(--gray-400)',
    medium: 'var(--blue-500)',
    high: 'var(--orange-500)',
    critical: 'var(--red-500)'
  };
  return colors[priority];
}

export function getKPIStatusColor(status: KPIStatus): string {
  const colors: Record<KPIStatus, string> = {
    on_track: 'var(--green-500)',
    at_risk: 'var(--orange-500)',
    off_track: 'var(--red-500)'
  };
  return colors[status];
}

export function calculateDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate);
  const today = new Date();
  const diff = end.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed' || task.status === 'cancelled') {
    return false;
  }
  return new Date(task.dueDate) < new Date();
}

export function formatTaskType(type: TaskType): string {
  const option = TASK_TYPE_OPTIONS.find(t => t.value === type);
  return option?.label || type;
}
