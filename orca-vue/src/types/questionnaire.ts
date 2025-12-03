// Tipos de preguntas disponibles
export type QuestionType =
  | 'text'           // Texto libre
  | 'textarea'       // Texto largo
  | 'radio'          // Selección única
  | 'checkbox'       // Selección múltiple
  | 'scale'          // Escala numérica (1-5, 1-10)
  | 'date'           // Fecha
  | 'file'           // Adjuntar archivo
  | 'yes_no_na'      // Sí/No/No Aplica
  | 'table'          // Tabla de datos
  | 'number'         // Número
  | 'group'          // Grupo de campos

// Estado de una pregunta en una respuesta
export type AnswerStatus = 'pending' | 'answered' | 'skipped' | 'not_applicable'

// Estado de un cuestionario asignado
export type AssignmentStatus =
  | 'pending'        // Pendiente de responder
  | 'in_progress'    // En progreso
  | 'submitted'      // Enviado para revisión
  | 'under_review'   // En revisión
  | 'approved'       // Aprobado
  | 'rejected'       // Rechazado/Requiere correcciones
  | 'expired'        // Vencido

// Estado del cuestionario (plantilla)
export type QuestionnaireStatus = 'draft' | 'published' | 'archived'

// Opción para preguntas de selección
export interface QuestionOption {
  id: string
  label: string
  value: string
  score?: number        // Puntuación asociada
  requiresEvidence?: boolean  // Si requiere evidencia al seleccionar
}

// Configuración de escala
export interface ScaleConfig {
  min: number
  max: number
  minLabel?: string     // Ej: "Muy malo"
  maxLabel?: string     // Ej: "Excelente"
  step?: number
}

// Configuración de tabla
export interface TableConfig {
  columns: {
    id: string
    header: string
    type: 'text' | 'number' | 'date' | 'select'
    options?: string[]  // Para tipo select
    required?: boolean
  }[]
  minRows?: number
  maxRows?: number
}

// Condición para lógica condicional
export interface QuestionCondition {
  questionId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value: string | number | boolean
}

// Pregunta del cuestionario
export interface Question {
  id: string
  code: string          // Código único (ej: "Q-001")
  text: string          // Texto de la pregunta
  description?: string  // Descripción o ayuda
  type: QuestionType
  required: boolean
  weight?: number       // Peso para cálculo de puntuación
  options?: QuestionOption[]      // Para radio/checkbox
  scaleConfig?: ScaleConfig       // Para tipo scale
  tableConfig?: TableConfig       // Para tipo table
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string    // Regex para validación
    minValue?: number
    maxValue?: number
    allowedFileTypes?: string[]  // Ej: ['.pdf', '.docx']
    maxFileSize?: number         // En MB
  }
  conditionalLogic?: {
    action: 'show' | 'hide' | 'require'
    conditions: QuestionCondition[]
    logicType: 'and' | 'or'
  }
  controlMapping?: string[]      // IDs de controles relacionados
  normativeReferences?: string[] // Referencias normativas (ej: "ISO 27001 A.5.1")
  order: number
}

// Sección del cuestionario
export interface QuestionnaireSection {
  id: string
  title: string
  description?: string
  order: number
  questions: Question[]
  weight?: number       // Peso de la sección
}

// Plantilla de cuestionario
export interface Questionnaire {
  id: string
  code: string          // Código único (ej: "CUES-2024-001")
  title: string
  description?: string
  version: string
  status: QuestionnaireStatus
  category: string      // Ej: "Seguridad", "Cumplimiento", "Riesgos"
  sections: QuestionnaireSection[]
  settings: {
    allowPartialSave: boolean
    requireAllQuestions: boolean
    allowComments: boolean
    requireEvidence: boolean
    showProgressBar: boolean
    randomizeQuestions: boolean
    timeLimit?: number          // En minutos
    maxAttempts?: number
  }
  scoring?: {
    enabled: boolean
    passingScore?: number       // Porcentaje mínimo para aprobar
    showScoreToRespondent: boolean
  }
  normativeFrameworks?: string[] // Marcos normativos relacionados
  tags?: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// Asignación de cuestionario
export interface QuestionnaireAssignment {
  id: string
  questionnaireId: string
  questionnaire?: Questionnaire
  assignedTo: {
    type: 'user' | 'role' | 'department' | 'process'
    ids: string[]
    names?: string[]
  }
  assignedBy: string
  assignedAt: Date
  dueDate: Date
  reminderDates?: Date[]
  status: AssignmentStatus
  priority: 'low' | 'medium' | 'high' | 'critical'
  instructions?: string
  relatedProcess?: string    // ID del proceso relacionado
  relatedAsset?: string      // ID del activo relacionado
  responses?: QuestionnaireResponse[]
}

// Respuesta a una pregunta individual
export interface QuestionAnswer {
  questionId: string
  value: string | string[] | number | boolean | null
  status: AnswerStatus
  comment?: string
  evidence?: Evidence[]
  answeredAt?: Date
  timeSpent?: number    // Segundos
}

// Respuesta completa a un cuestionario
export interface QuestionnaireResponse {
  id: string
  assignmentId: string
  respondentId: string
  respondentName?: string
  startedAt: Date
  submittedAt?: Date
  lastSavedAt: Date
  status: AssignmentStatus
  answers: QuestionAnswer[]
  progress: number      // Porcentaje completado
  score?: number        // Puntuación calculada
  review?: {
    reviewerId: string
    reviewerName?: string
    reviewedAt: Date
    status: 'approved' | 'rejected'
    comments?: string
    findings?: ReviewFinding[]
  }
}

// Hallazgo de revisión
export interface ReviewFinding {
  id: string
  questionId: string
  type: 'observation' | 'non_conformity' | 'improvement_opportunity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  recommendation?: string
  dueDate?: Date
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
}

// Evidencia adjunta
export interface Evidence {
  id: string
  name: string
  type: string          // MIME type
  size: number          // En bytes
  url: string
  uploadedBy: string
  uploadedAt: Date
  description?: string
  validUntil?: Date     // Fecha de vigencia
  status: 'valid' | 'expired' | 'pending_review'
}

// ============ TIPOS DE COMPLIANCE ============

// Estado de cumplimiento
export type ComplianceStatus =
  | 'compliant'         // Cumple
  | 'partial'           // Cumplimiento parcial
  | 'non_compliant'     // No cumple
  | 'not_applicable'    // No aplica
  | 'not_evaluated'     // No evaluado

// Marco normativo
export interface NormativeFramework {
  id: string
  code: string          // Ej: "ISO27001", "SOC2", "GDPR"
  name: string
  description?: string
  version: string
  effectiveDate: Date
  expirationDate?: Date
  category: 'security' | 'privacy' | 'financial' | 'operational' | 'industry'
  requirements: NormativeRequirement[]
  status: 'active' | 'deprecated' | 'draft'
  icon?: string
  color?: string
}

// Requisito normativo
export interface NormativeRequirement {
  id: string
  frameworkId: string
  code: string          // Ej: "A.5.1.1"
  title: string
  description: string
  category?: string
  parentId?: string     // Para requisitos jerárquicos
  level: number         // Nivel en la jerarquía
  isMandatory: boolean
  controlMappings?: ControlMapping[]
  evidenceTypes?: string[]      // Tipos de evidencia requeridos
  evaluationCriteria?: string
  order: number
}

// Control interno
export interface Control {
  id: string
  code: string          // Ej: "CTRL-001"
  name: string
  description: string
  category: string
  type: 'preventive' | 'detective' | 'corrective'
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  owner: string
  status: 'active' | 'inactive' | 'under_review'
  effectivenessRating?: number  // 0-100
  lastEvaluated?: Date
  relatedProcesses?: string[]
  relatedAssets?: string[]
}

// Mapeo de control a requisito
export interface ControlMapping {
  id: string
  controlId: string
  control?: Control
  requirementId: string
  requirement?: NormativeRequirement
  coveragePercentage: number    // 0-100
  notes?: string
  status: 'mapped' | 'pending_validation' | 'validated'
}

// Evaluación de cumplimiento
export interface ComplianceEvaluation {
  id: string
  frameworkId: string
  framework?: NormativeFramework
  evaluationDate: Date
  evaluatorId: string
  evaluatorName?: string
  period: {
    startDate: Date
    endDate: Date
  }
  overallScore: number          // 0-100
  overallStatus: ComplianceStatus
  requirementEvaluations: RequirementEvaluation[]
  summary?: string
  recommendations?: string[]
  nextEvaluationDate?: Date
  status: 'draft' | 'in_progress' | 'completed' | 'approved'
}

// Evaluación de un requisito específico
export interface RequirementEvaluation {
  requirementId: string
  requirement?: NormativeRequirement
  status: ComplianceStatus
  score: number         // 0-100
  evidence?: Evidence[]
  gaps?: string[]
  findings?: string[]
  correctiveActions?: CorrectiveAction[]
  notes?: string
  evaluatedAt: Date
}

// Acción correctiva
export interface CorrectiveAction {
  id: string
  title: string
  description: string
  type: 'corrective' | 'preventive' | 'improvement'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'completed' | 'verified' | 'closed'
  responsibleId: string
  responsibleName?: string
  dueDate: Date
  completedDate?: Date
  verifiedDate?: Date
  verifiedBy?: string
  relatedRequirements?: string[]
  relatedControls?: string[]
  evidence?: Evidence[]
  progress: number      // 0-100
  comments?: string[]
}

// Alerta de cumplimiento
export interface ComplianceAlert {
  id: string
  type: 'deadline' | 'gap' | 'control_failure' | 'evidence_expiry' | 'evaluation_due'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  relatedEntity?: {
    type: 'requirement' | 'control' | 'evidence' | 'evaluation' | 'action'
    id: string
    name: string
  }
  createdAt: Date
  dueDate?: Date
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

// Registro de auditoría
export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: 'create' | 'update' | 'delete' | 'view' | 'submit' | 'approve' | 'reject'
  entityType: 'questionnaire' | 'response' | 'framework' | 'control' | 'evaluation' | 'evidence'
  entityId: string
  entityName?: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  metadata?: Record<string, any>
  ipAddress?: string
}

// Dashboard de compliance
export interface ComplianceDashboard {
  overallCompliance: number     // 0-100
  frameworkSummaries: {
    frameworkId: string
    frameworkName: string
    frameworkCode: string
    complianceScore: number
    status: ComplianceStatus
    trend: 'improving' | 'stable' | 'declining'
    lastEvaluated?: Date
  }[]
  controlEffectiveness: {
    total: number
    effective: number
    needsImprovement: number
    ineffective: number
  }
  pendingActions: {
    total: number
    overdue: number
    dueThisWeek: number
    dueThisMonth: number
  }
  upcomingDeadlines: {
    date: Date
    type: string
    description: string
    entityId: string
  }[]
  recentAlerts: ComplianceAlert[]
  evidenceStatus: {
    valid: number
    expiringSoon: number
    expired: number
  }
}
