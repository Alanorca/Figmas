import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Questionnaire,
  QuestionnaireSection,
  Question,
  QuestionnaireAssignment,
  QuestionnaireResponse,
  QuestionAnswer,
  NormativeFramework,
  Control,
  ComplianceEvaluation,
  ComplianceAlert,
  ComplianceDashboard,
  QuestionnaireStatus,
  AssignmentStatus,
  ComplianceStatus
} from '../types/questionnaire'

// Datos de ejemplo para marcos normativos
const sampleFrameworks: NormativeFramework[] = [
  {
    id: 'fw-1',
    code: 'ISO27001',
    name: 'ISO/IEC 27001:2022',
    description: 'Sistema de Gestión de Seguridad de la Información',
    version: '2022',
    effectiveDate: new Date('2022-10-25'),
    category: 'security',
    requirements: [],
    status: 'active',
    icon: 'pi pi-shield',
    color: '#3B82F6'
  },
  {
    id: 'fw-2',
    code: 'SOC2',
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2',
    version: '2017',
    effectiveDate: new Date('2017-01-01'),
    category: 'security',
    requirements: [],
    status: 'active',
    icon: 'pi pi-verified',
    color: '#10B981'
  },
  {
    id: 'fw-3',
    code: 'GDPR',
    name: 'GDPR',
    description: 'Reglamento General de Protección de Datos',
    version: '2016/679',
    effectiveDate: new Date('2018-05-25'),
    category: 'privacy',
    requirements: [],
    status: 'active',
    icon: 'pi pi-lock',
    color: '#8B5CF6'
  },
  {
    id: 'fw-4',
    code: 'PCI-DSS',
    name: 'PCI DSS v4.0',
    description: 'Payment Card Industry Data Security Standard',
    version: '4.0',
    effectiveDate: new Date('2022-03-31'),
    category: 'financial',
    requirements: [],
    status: 'active',
    icon: 'pi pi-credit-card',
    color: '#F59E0B'
  }
]

// Datos de ejemplo para cuestionarios
const sampleQuestionnaires: Questionnaire[] = [
  {
    id: 'q-1',
    code: 'CUES-2024-001',
    title: 'Evaluación de Seguridad de la Información',
    description: 'Cuestionario para evaluar controles de seguridad según ISO 27001',
    version: '1.0',
    status: 'published',
    category: 'Seguridad',
    sections: [
      {
        id: 's-1',
        title: 'Políticas de Seguridad',
        description: 'Evaluación de políticas y procedimientos',
        order: 1,
        weight: 20,
        questions: [
          {
            id: 'q1-1',
            code: 'SEC-001',
            text: '¿Existe una política de seguridad de la información documentada y aprobada?',
            type: 'yes_no_na',
            required: true,
            weight: 10,
            order: 1,
            normativeReferences: ['ISO 27001 A.5.1']
          },
          {
            id: 'q1-2',
            code: 'SEC-002',
            text: '¿Cuándo fue la última revisión de la política de seguridad?',
            type: 'date',
            required: true,
            weight: 5,
            order: 2
          },
          {
            id: 'q1-3',
            code: 'SEC-003',
            text: 'Describa los principales controles de seguridad implementados',
            type: 'textarea',
            required: true,
            weight: 10,
            order: 3,
            validation: { minLength: 50, maxLength: 1000 }
          }
        ]
      },
      {
        id: 's-2',
        title: 'Control de Acceso',
        description: 'Gestión de identidades y accesos',
        order: 2,
        weight: 30,
        questions: [
          {
            id: 'q2-1',
            code: 'ACC-001',
            text: '¿Se utiliza autenticación multifactor (MFA)?',
            type: 'radio',
            required: true,
            weight: 15,
            order: 1,
            options: [
              { id: 'o1', label: 'Sí, para todos los usuarios', value: 'all', score: 100 },
              { id: 'o2', label: 'Sí, solo para administradores', value: 'admin', score: 60 },
              { id: 'o3', label: 'En proceso de implementación', value: 'progress', score: 30 },
              { id: 'o4', label: 'No se utiliza', value: 'no', score: 0 }
            ]
          },
          {
            id: 'q2-2',
            code: 'ACC-002',
            text: 'Califique la madurez del proceso de gestión de identidades',
            type: 'scale',
            required: true,
            weight: 10,
            order: 2,
            scaleConfig: { min: 1, max: 5, minLabel: 'Inicial', maxLabel: 'Optimizado' }
          }
        ]
      }
    ],
    settings: {
      allowPartialSave: true,
      requireAllQuestions: false,
      allowComments: true,
      requireEvidence: true,
      showProgressBar: true,
      randomizeQuestions: false
    },
    scoring: {
      enabled: true,
      passingScore: 70,
      showScoreToRespondent: false
    },
    normativeFrameworks: ['ISO27001'],
    tags: ['seguridad', 'iso27001', 'controles'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01'),
    publishedAt: new Date('2024-03-01')
  },
  {
    id: 'q-2',
    code: 'CUES-2024-002',
    title: 'Evaluación de Protección de Datos',
    description: 'Cuestionario de cumplimiento GDPR',
    version: '1.0',
    status: 'published',
    category: 'Privacidad',
    sections: [
      {
        id: 's-3',
        title: 'Principios de Tratamiento',
        order: 1,
        questions: [
          {
            id: 'q3-1',
            code: 'GDPR-001',
            text: '¿Se documenta la base legal para cada tratamiento de datos personales?',
            type: 'yes_no_na',
            required: true,
            order: 1
          }
        ]
      }
    ],
    settings: {
      allowPartialSave: true,
      requireAllQuestions: true,
      allowComments: true,
      requireEvidence: true,
      showProgressBar: true,
      randomizeQuestions: false
    },
    normativeFrameworks: ['GDPR'],
    tags: ['privacidad', 'gdpr', 'datos personales'],
    createdBy: 'admin',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    publishedAt: new Date('2024-02-15')
  },
  {
    id: 'q-3',
    code: 'CUES-2024-003',
    title: 'Autoevaluación de Riesgos Operacionales',
    description: 'Cuestionario para identificar riesgos en procesos operativos',
    version: '2.0',
    status: 'draft',
    category: 'Riesgos',
    sections: [],
    settings: {
      allowPartialSave: true,
      requireAllQuestions: false,
      allowComments: true,
      requireEvidence: false,
      showProgressBar: true,
      randomizeQuestions: false
    },
    tags: ['riesgos', 'operaciones'],
    createdBy: 'admin',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
]

// Datos de ejemplo para asignaciones
const sampleAssignments: QuestionnaireAssignment[] = [
  {
    id: 'a-1',
    questionnaireId: 'q-1',
    assignedTo: {
      type: 'department',
      ids: ['dept-ti'],
      names: ['Tecnología de la Información']
    },
    assignedBy: 'admin',
    assignedAt: new Date('2024-03-01'),
    dueDate: new Date('2024-04-15'),
    status: 'in_progress',
    priority: 'high',
    instructions: 'Completar antes del cierre del trimestre'
  },
  {
    id: 'a-2',
    questionnaireId: 'q-2',
    assignedTo: {
      type: 'department',
      ids: ['dept-legal'],
      names: ['Legal y Cumplimiento']
    },
    assignedBy: 'admin',
    assignedAt: new Date('2024-02-20'),
    dueDate: new Date('2024-03-31'),
    status: 'submitted',
    priority: 'critical'
  },
  {
    id: 'a-3',
    questionnaireId: 'q-1',
    assignedTo: {
      type: 'department',
      ids: ['dept-rrhh'],
      names: ['Recursos Humanos']
    },
    assignedBy: 'admin',
    assignedAt: new Date('2024-03-05'),
    dueDate: new Date('2024-04-30'),
    status: 'pending',
    priority: 'medium'
  }
]

// Alertas de ejemplo
const sampleAlerts: ComplianceAlert[] = [
  {
    id: 'alert-1',
    type: 'deadline',
    severity: 'critical',
    title: 'Cuestionario próximo a vencer',
    description: 'El cuestionario de Seguridad de TI vence en 3 días',
    relatedEntity: { type: 'evaluation', id: 'a-1', name: 'Evaluación de Seguridad' },
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    id: 'alert-2',
    type: 'evidence_expiry',
    severity: 'warning',
    title: 'Evidencia por expirar',
    description: 'La certificación ISO 27001 expira en 30 días',
    relatedEntity: { type: 'evidence', id: 'ev-1', name: 'Certificado ISO 27001' },
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active'
  },
  {
    id: 'alert-3',
    type: 'gap',
    severity: 'warning',
    title: 'Brecha de cumplimiento detectada',
    description: 'Control ACC-003 no cumple con requisito A.9.4',
    relatedEntity: { type: 'control', id: 'ctrl-5', name: 'Control de Acceso Remoto' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'active'
  }
]

export const useQuestionnaireStore = defineStore('questionnaire', () => {
  // Estado
  const questionnaires = ref<Questionnaire[]>(sampleQuestionnaires)
  const assignments = ref<QuestionnaireAssignment[]>(sampleAssignments)
  const responses = ref<QuestionnaireResponse[]>([])
  const frameworks = ref<NormativeFramework[]>(sampleFrameworks)
  const controls = ref<Control[]>([])
  const evaluations = ref<ComplianceEvaluation[]>([])
  const alerts = ref<ComplianceAlert[]>(sampleAlerts)

  const selectedQuestionnaire = ref<Questionnaire | null>(null)
  const selectedAssignment = ref<QuestionnaireAssignment | null>(null)
  const currentResponse = ref<QuestionnaireResponse | null>(null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters computados
  const publishedQuestionnaires = computed(() =>
    questionnaires.value.filter(q => q.status === 'published')
  )

  const draftQuestionnaires = computed(() =>
    questionnaires.value.filter(q => q.status === 'draft')
  )

  const pendingAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'pending' || a.status === 'in_progress')
  )

  const overdueAssignments = computed(() =>
    assignments.value.filter(a => {
      const now = new Date()
      return (a.status === 'pending' || a.status === 'in_progress') && new Date(a.dueDate) < now
    })
  )

  const activeAlerts = computed(() =>
    alerts.value.filter(a => a.status === 'active')
  )

  const criticalAlerts = computed(() =>
    alerts.value.filter(a => a.status === 'active' && a.severity === 'critical')
  )

  // Dashboard de compliance
  const complianceDashboard = computed<ComplianceDashboard>(() => ({
    overallCompliance: 78,
    frameworkSummaries: frameworks.value.map(fw => ({
      frameworkId: fw.id,
      frameworkName: fw.name,
      frameworkCode: fw.code,
      complianceScore: Math.floor(Math.random() * 30) + 65, // Simulado
      status: 'partial' as ComplianceStatus,
      trend: 'improving' as const,
      lastEvaluated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    })),
    controlEffectiveness: {
      total: 45,
      effective: 32,
      needsImprovement: 10,
      ineffective: 3
    },
    pendingActions: {
      total: 15,
      overdue: 3,
      dueThisWeek: 5,
      dueThisMonth: 7
    },
    upcomingDeadlines: [
      { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), type: 'questionnaire', description: 'Evaluación de Seguridad TI', entityId: 'a-1' },
      { date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: 'audit', description: 'Auditoría interna Q1', entityId: 'audit-1' },
      { date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: 'evaluation', description: 'Revisión SOC 2', entityId: 'eval-1' }
    ],
    recentAlerts: alerts.value.slice(0, 5),
    evidenceStatus: {
      valid: 42,
      expiringSoon: 8,
      expired: 2
    }
  }))

  // Acciones - Cuestionarios
  function createQuestionnaire(data: Partial<Questionnaire>): Questionnaire {
    const newQuestionnaire: Questionnaire = {
      id: `q-${Date.now()}`,
      code: `CUES-${new Date().getFullYear()}-${String(questionnaires.value.length + 1).padStart(3, '0')}`,
      title: data.title || 'Nuevo Cuestionario',
      description: data.description,
      version: '1.0',
      status: 'draft',
      category: data.category || 'General',
      sections: data.sections || [],
      settings: data.settings || {
        allowPartialSave: true,
        requireAllQuestions: false,
        allowComments: true,
        requireEvidence: false,
        showProgressBar: true,
        randomizeQuestions: false
      },
      scoring: data.scoring,
      normativeFrameworks: data.normativeFrameworks,
      tags: data.tags,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    questionnaires.value.push(newQuestionnaire)
    return newQuestionnaire
  }

  function updateQuestionnaire(id: string, data: Partial<Questionnaire>) {
    const index = questionnaires.value.findIndex(q => q.id === id)
    if (index !== -1) {
      questionnaires.value[index] = {
        ...questionnaires.value[index],
        ...data,
        updatedAt: new Date()
      }
    }
  }

  function deleteQuestionnaire(id: string) {
    const index = questionnaires.value.findIndex(q => q.id === id)
    if (index !== -1) {
      questionnaires.value.splice(index, 1)
    }
  }

  function publishQuestionnaire(id: string) {
    updateQuestionnaire(id, {
      status: 'published',
      publishedAt: new Date()
    })
  }

  function archiveQuestionnaire(id: string) {
    updateQuestionnaire(id, { status: 'archived' })
  }

  // Acciones - Secciones y Preguntas
  function addSection(questionnaireId: string, section: Partial<QuestionnaireSection>) {
    const questionnaire = questionnaires.value.find(q => q.id === questionnaireId)
    if (questionnaire) {
      const newSection: QuestionnaireSection = {
        id: `s-${Date.now()}`,
        title: section.title || 'Nueva Sección',
        description: section.description,
        order: questionnaire.sections.length + 1,
        questions: section.questions || [],
        weight: section.weight
      }
      questionnaire.sections.push(newSection)
      questionnaire.updatedAt = new Date()
    }
  }

  function addQuestion(questionnaireId: string, sectionId: string, question: Partial<Question>) {
    const questionnaire = questionnaires.value.find(q => q.id === questionnaireId)
    if (questionnaire) {
      const section = questionnaire.sections.find(s => s.id === sectionId)
      if (section) {
        const newQuestion: Question = {
          id: `q-${Date.now()}`,
          code: `Q-${String(section.questions.length + 1).padStart(3, '0')}`,
          text: question.text || 'Nueva pregunta',
          type: question.type || 'text',
          required: question.required ?? false,
          order: section.questions.length + 1,
          ...question
        }
        section.questions.push(newQuestion)
        questionnaire.updatedAt = new Date()
      }
    }
  }

  // Acciones - Asignaciones
  function createAssignment(data: Partial<QuestionnaireAssignment>): QuestionnaireAssignment {
    const newAssignment: QuestionnaireAssignment = {
      id: `a-${Date.now()}`,
      questionnaireId: data.questionnaireId!,
      assignedTo: data.assignedTo!,
      assignedBy: 'current-user',
      assignedAt: new Date(),
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: data.priority || 'medium',
      instructions: data.instructions,
      relatedProcess: data.relatedProcess,
      relatedAsset: data.relatedAsset
    }
    assignments.value.push(newAssignment)
    return newAssignment
  }

  function updateAssignment(id: string, data: Partial<QuestionnaireAssignment>) {
    const index = assignments.value.findIndex(a => a.id === id)
    if (index !== -1) {
      assignments.value[index] = {
        ...assignments.value[index],
        ...data
      }
    }
  }

  // Acciones - Respuestas
  function startResponse(assignmentId: string): QuestionnaireResponse {
    const assignment = assignments.value.find(a => a.id === assignmentId)
    if (!assignment) throw new Error('Asignación no encontrada')

    const questionnaire = questionnaires.value.find(q => q.id === assignment.questionnaireId)
    if (!questionnaire) throw new Error('Cuestionario no encontrado')

    const newResponse: QuestionnaireResponse = {
      id: `r-${Date.now()}`,
      assignmentId,
      respondentId: 'current-user',
      respondentName: 'Usuario Actual',
      startedAt: new Date(),
      lastSavedAt: new Date(),
      status: 'in_progress',
      answers: [],
      progress: 0
    }

    // Inicializar respuestas vacías para todas las preguntas
    questionnaire.sections.forEach(section => {
      section.questions.forEach(question => {
        newResponse.answers.push({
          questionId: question.id,
          value: null,
          status: 'pending'
        })
      })
    })

    responses.value.push(newResponse)
    currentResponse.value = newResponse

    // Actualizar estado de la asignación
    updateAssignment(assignmentId, { status: 'in_progress' })

    return newResponse
  }

  function saveAnswer(responseId: string, questionId: string, answer: Partial<QuestionAnswer>) {
    const response = responses.value.find(r => r.id === responseId)
    if (response) {
      const answerIndex = response.answers.findIndex(a => a.questionId === questionId)
      if (answerIndex !== -1) {
        response.answers[answerIndex] = {
          ...response.answers[answerIndex],
          ...answer,
          status: answer.value !== null ? 'answered' : 'pending',
          answeredAt: new Date()
        }
      }

      // Actualizar progreso
      const answeredCount = response.answers.filter(a => a.status === 'answered').length
      response.progress = Math.round((answeredCount / response.answers.length) * 100)
      response.lastSavedAt = new Date()
    }
  }

  function submitResponse(responseId: string) {
    const response = responses.value.find(r => r.id === responseId)
    if (response) {
      response.status = 'submitted'
      response.submittedAt = new Date()

      // Actualizar estado de la asignación
      updateAssignment(response.assignmentId, { status: 'submitted' })
    }
  }

  // Acciones - Alertas
  function acknowledgeAlert(alertId: string) {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'acknowledged'
      alert.acknowledgedBy = 'current-user'
      alert.acknowledgedAt = new Date()
    }
  }

  function resolveAlert(alertId: string) {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
    }
  }

  // Selección
  function selectQuestionnaire(id: string | null) {
    selectedQuestionnaire.value = id
      ? questionnaires.value.find(q => q.id === id) || null
      : null
  }

  function selectAssignment(id: string | null) {
    selectedAssignment.value = id
      ? assignments.value.find(a => a.id === id) || null
      : null
  }

  // Búsqueda y filtrado
  function searchQuestionnaires(query: string, filters?: {
    status?: QuestionnaireStatus
    category?: string
    framework?: string
  }) {
    return questionnaires.value.filter(q => {
      const matchesQuery = !query ||
        q.title.toLowerCase().includes(query.toLowerCase()) ||
        q.code.toLowerCase().includes(query.toLowerCase()) ||
        q.description?.toLowerCase().includes(query.toLowerCase())

      const matchesStatus = !filters?.status || q.status === filters.status
      const matchesCategory = !filters?.category || q.category === filters.category
      const matchesFramework = !filters?.framework ||
        q.normativeFrameworks?.includes(filters.framework)

      return matchesQuery && matchesStatus && matchesCategory && matchesFramework
    })
  }

  return {
    // Estado
    questionnaires,
    assignments,
    responses,
    frameworks,
    controls,
    evaluations,
    alerts,
    selectedQuestionnaire,
    selectedAssignment,
    currentResponse,
    isLoading,
    error,

    // Getters
    publishedQuestionnaires,
    draftQuestionnaires,
    pendingAssignments,
    overdueAssignments,
    activeAlerts,
    criticalAlerts,
    complianceDashboard,

    // Acciones - Cuestionarios
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    publishQuestionnaire,
    archiveQuestionnaire,
    addSection,
    addQuestion,

    // Acciones - Asignaciones
    createAssignment,
    updateAssignment,

    // Acciones - Respuestas
    startResponse,
    saveAnswer,
    submitResponse,

    // Acciones - Alertas
    acknowledgeAlert,
    resolveAlert,

    // Selección
    selectQuestionnaire,
    selectAssignment,

    // Búsqueda
    searchQuestionnaires
  }
})
