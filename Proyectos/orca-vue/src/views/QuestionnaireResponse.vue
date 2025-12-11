<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaire'
import type {
  Questionnaire,
  QuestionnaireSection,
  Question,
  QuestionnaireResponse,
  QuestionAnswer
} from '../types/questionnaire'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Slider from 'primevue/slider'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import Panel from 'primevue/panel'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import StepPanels from 'primevue/steppanels'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  assignmentId: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'submitted'): void
}>()

const store = useQuestionnaireStore()
const toast = useToast()

// Estado
const assignment = ref(store.assignments.find(a => a.id === props.assignmentId))
const questionnaire = ref<Questionnaire | null>(null)
const response = ref<QuestionnaireResponse | null>(null)
const currentSectionIndex = ref(0)
const showSubmitDialog = ref(false)
const isSaving = ref(false)

// Respuestas locales (para binding)
const answers = ref<Record<string, any>>({})

// Cargar datos
onMounted(() => {
  if (assignment.value) {
    questionnaire.value = store.questionnaires.find(q => q.id === assignment.value!.questionnaireId) || null

    // Buscar respuesta existente o crear nueva
    const existingResponse = store.responses.find(r => r.assignmentId === props.assignmentId)
    if (existingResponse) {
      response.value = existingResponse
      // Cargar respuestas existentes
      existingResponse.answers.forEach(a => {
        answers.value[a.questionId] = a.value
      })
    } else {
      // Iniciar nueva respuesta
      response.value = store.startResponse(props.assignmentId)
    }
  }
})

// Sección actual
const currentSection = computed(() => {
  if (!questionnaire.value) return null
  return questionnaire.value.sections[currentSectionIndex.value]
})

// Progreso
const progress = computed(() => {
  if (!questionnaire.value || !response.value) return 0
  const totalQuestions = questionnaire.value.sections.reduce((sum, s) => sum + s.questions.length, 0)
  const answeredQuestions = Object.values(answers.value).filter(v => v !== null && v !== undefined && v !== '').length
  return Math.round((answeredQuestions / totalQuestions) * 100)
})

// Preguntas requeridas sin responder
const unansweredRequired = computed(() => {
  if (!questionnaire.value) return []
  const unanswered: Question[] = []
  questionnaire.value.sections.forEach(section => {
    section.questions.forEach(q => {
      if (q.required && (answers.value[q.id] === null || answers.value[q.id] === undefined || answers.value[q.id] === '')) {
        unanswered.push(q)
      }
    })
  })
  return unanswered
})

// Navegación
const canGoBack = computed(() => currentSectionIndex.value > 0)
const canGoNext = computed(() => questionnaire.value && currentSectionIndex.value < questionnaire.value.sections.length - 1)
const isLastSection = computed(() => questionnaire.value && currentSectionIndex.value === questionnaire.value.sections.length - 1)

const goBack = () => {
  if (canGoBack.value) {
    saveCurrentAnswers()
    currentSectionIndex.value--
  }
}

const goNext = () => {
  if (canGoNext.value) {
    saveCurrentAnswers()
    currentSectionIndex.value++
  }
}

const goToSection = (index: number) => {
  saveCurrentAnswers()
  currentSectionIndex.value = index
}

// Guardar respuestas
const saveCurrentAnswers = () => {
  if (!response.value) return

  Object.entries(answers.value).forEach(([questionId, value]) => {
    store.saveAnswer(response.value!.id, questionId, { value })
  })
}

const saveProgress = async () => {
  isSaving.value = true
  saveCurrentAnswers()

  // Simular guardado
  await new Promise(resolve => setTimeout(resolve, 500))

  isSaving.value = false
  toast.add({
    severity: 'success',
    summary: 'Guardado',
    detail: 'Progreso guardado correctamente',
    life: 2000
  })
}

// Enviar cuestionario
const confirmSubmit = () => {
  if (unansweredRequired.value.length > 0 && questionnaire.value?.settings.requireAllQuestions) {
    toast.add({
      severity: 'error',
      summary: 'Preguntas requeridas',
      detail: `Hay ${unansweredRequired.value.length} preguntas requeridas sin responder`,
      life: 5000
    })
    return
  }
  showSubmitDialog.value = true
}

const submitQuestionnaire = async () => {
  if (!response.value) return

  saveCurrentAnswers()
  store.submitResponse(response.value.id)

  showSubmitDialog.value = false
  toast.add({
    severity: 'success',
    summary: 'Enviado',
    detail: 'Cuestionario enviado correctamente',
    life: 3000
  })

  emit('submitted')
}

// Formatear fecha límite
const formatDueDate = (date: Date) => {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const formatted = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  if (diffDays < 0) return { text: `Vencido hace ${Math.abs(diffDays)} días`, severity: 'danger' }
  if (diffDays === 0) return { text: 'Vence hoy', severity: 'danger' }
  if (diffDays <= 3) return { text: `Vence en ${diffDays} días`, severity: 'warn' }
  return { text: formatted, severity: 'secondary' }
}

const dueInfo = computed(() => assignment.value ? formatDueDate(assignment.value.dueDate) : null)

// Obtener respuesta de una pregunta
const getAnswer = (questionId: string) => {
  return answers.value[questionId]
}

// Verificar si pregunta está respondida
const isAnswered = (questionId: string) => {
  const val = answers.value[questionId]
  return val !== null && val !== undefined && val !== ''
}
</script>

<template>
  <div class="questionnaire-response h-screen flex flex-column">
    <Toast />

    <!-- Header -->
    <div class="surface-card border-bottom-1 surface-border px-4 py-3">
      <div class="flex align-items-center justify-content-between">
        <div class="flex align-items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            text
            rounded
            severity="secondary"
            @click="$emit('back')"
          />
          <div>
            <h2 class="m-0 text-xl font-semibold text-900">{{ questionnaire?.title }}</h2>
            <div class="flex align-items-center gap-2 mt-1">
              <Tag :value="questionnaire?.code" severity="info" class="text-xs" />
              <span class="text-sm text-500">|</span>
              <Tag
                v-if="dueInfo"
                :value="dueInfo.text"
                :severity="dueInfo.severity"
                class="text-xs"
              />
            </div>
          </div>
        </div>

        <div class="flex align-items-center gap-3">
          <div class="text-right">
            <div class="text-sm text-500">Progreso</div>
            <div class="text-xl font-bold text-primary">{{ progress }}%</div>
          </div>
          <div class="w-8rem">
            <ProgressBar :value="progress" :showValue="false" style="height: 8px;" />
          </div>
          <Button
            label="Guardar"
            icon="pi pi-save"
            severity="secondary"
            outlined
            :loading="isSaving"
            @click="saveProgress"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar - Sections Navigation -->
      <div class="w-18rem surface-card border-right-1 surface-border overflow-y-auto">
        <div class="p-3">
          <div class="text-sm font-semibold text-600 mb-3 uppercase" style="letter-spacing: 0.5px;">
            Secciones
          </div>
          <div class="flex flex-column gap-2">
            <div
              v-for="(section, idx) in questionnaire?.sections"
              :key="section.id"
              class="section-nav-item p-3 border-round-lg cursor-pointer transition-all"
              :class="{
                'section-active': currentSectionIndex === idx,
                'section-complete': section.questions.every(q => isAnswered(q.id))
              }"
              @click="goToSection(idx)"
            >
              <div class="flex align-items-center justify-content-between mb-1">
                <div class="flex align-items-center gap-2">
                  <div
                    class="flex align-items-center justify-content-center border-round"
                    :class="currentSectionIndex === idx ? 'bg-primary text-white' : 'surface-200 text-600'"
                    style="width: 24px; height: 24px; font-size: 12px;"
                  >
                    {{ idx + 1 }}
                  </div>
                  <span class="font-medium text-sm text-900">{{ section.title }}</span>
                </div>
                <i
                  v-if="section.questions.every(q => isAnswered(q.id))"
                  class="pi pi-check-circle text-green-500"
                ></i>
              </div>
              <div class="flex align-items-center gap-2 text-xs text-500 pl-5">
                <span>{{ section.questions.filter(q => isAnswered(q.id)).length }}/{{ section.questions.length }}</span>
                <span>preguntas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Questions Area -->
      <div class="flex-1 overflow-y-auto surface-ground">
        <div class="max-w-4xl mx-auto p-4">
          <!-- Section Header -->
          <div class="mb-4" v-if="currentSection">
            <div class="flex align-items-center gap-3 mb-2">
              <div
                class="flex align-items-center justify-content-center border-round-lg bg-primary"
                style="width: 40px; height: 40px;"
              >
                <span class="text-white font-bold">{{ currentSectionIndex + 1 }}</span>
              </div>
              <div>
                <h3 class="m-0 text-xl font-semibold text-900">{{ currentSection.title }}</h3>
                <p v-if="currentSection.description" class="m-0 text-500 text-sm mt-1">
                  {{ currentSection.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Questions -->
          <div class="flex flex-column gap-4">
            <Card
              v-for="(question, qIdx) in currentSection?.questions"
              :key="question.id"
              class="question-card"
              :class="{ 'question-answered': isAnswered(question.id) }"
            >
              <template #content>
                <div class="flex gap-3">
                  <div
                    class="question-number flex align-items-center justify-content-center border-round"
                    :class="isAnswered(question.id) ? 'bg-green-100 text-green-700' : 'surface-100 text-600'"
                    style="width: 28px; height: 28px; min-width: 28px; font-size: 12px;"
                  >
                    <i v-if="isAnswered(question.id)" class="pi pi-check text-xs"></i>
                    <span v-else>{{ qIdx + 1 }}</span>
                  </div>
                  <div class="flex-1">
                    <!-- Question Text -->
                    <div class="mb-3">
                      <p class="m-0 text-900 font-medium">
                        {{ question.text }}
                        <span v-if="question.required" class="text-red-500">*</span>
                      </p>
                      <p v-if="question.description" class="m-0 text-500 text-sm mt-1">
                        {{ question.description }}
                      </p>
                    </div>

                    <!-- Answer Input based on type -->
                    <!-- Text -->
                    <InputText
                      v-if="question.type === 'text'"
                      v-model="answers[question.id]"
                      class="w-full"
                      placeholder="Escriba su respuesta..."
                    />

                    <!-- Textarea -->
                    <Textarea
                      v-else-if="question.type === 'textarea'"
                      v-model="answers[question.id]"
                      rows="4"
                      class="w-full"
                      placeholder="Escriba su respuesta..."
                    />

                    <!-- Radio -->
                    <div v-else-if="question.type === 'radio'" class="flex flex-column gap-3">
                      <div
                        v-for="opt in question.options"
                        :key="opt.id"
                        class="flex align-items-center"
                      >
                        <RadioButton
                          v-model="answers[question.id]"
                          :inputId="`${question.id}-${opt.id}`"
                          :name="question.id"
                          :value="opt.value"
                        />
                        <label :for="`${question.id}-${opt.id}`" class="ml-2 cursor-pointer">
                          {{ opt.label }}
                        </label>
                      </div>
                    </div>

                    <!-- Checkbox -->
                    <div v-else-if="question.type === 'checkbox'" class="flex flex-column gap-3">
                      <div
                        v-for="opt in question.options"
                        :key="opt.id"
                        class="flex align-items-center"
                      >
                        <Checkbox
                          v-model="answers[question.id]"
                          :inputId="`${question.id}-${opt.id}`"
                          :name="question.id"
                          :value="opt.value"
                        />
                        <label :for="`${question.id}-${opt.id}`" class="ml-2 cursor-pointer">
                          {{ opt.label }}
                        </label>
                      </div>
                    </div>

                    <!-- Yes/No/NA -->
                    <div v-else-if="question.type === 'yes_no_na'" class="flex gap-3">
                      <div
                        v-for="opt in [
                          { value: 'yes', label: 'Sí', icon: 'pi pi-check', color: 'green' },
                          { value: 'no', label: 'No', icon: 'pi pi-times', color: 'red' },
                          { value: 'na', label: 'No Aplica', icon: 'pi pi-minus', color: 'gray' }
                        ]"
                        :key="opt.value"
                        class="flex-1"
                      >
                        <div
                          class="p-3 border-round-lg cursor-pointer text-center transition-all border-2"
                          :class="answers[question.id] === opt.value
                            ? `bg-${opt.color}-50 border-${opt.color}-500`
                            : 'surface-50 border-transparent hover:surface-100'"
                          @click="answers[question.id] = opt.value"
                        >
                          <i :class="opt.icon" class="text-xl mb-2 block" :style="{ color: answers[question.id] === opt.value ? `var(--${opt.color}-500)` : 'inherit' }"></i>
                          <span class="font-medium">{{ opt.label }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Scale -->
                    <div v-else-if="question.type === 'scale' && question.scaleConfig" class="py-2">
                      <div class="flex align-items-center justify-content-between mb-3">
                        <span class="text-sm text-500">{{ question.scaleConfig.minLabel || question.scaleConfig.min }}</span>
                        <span class="text-sm text-500">{{ question.scaleConfig.maxLabel || question.scaleConfig.max }}</span>
                      </div>
                      <div class="flex justify-content-between gap-2">
                        <div
                          v-for="n in (question.scaleConfig.max - question.scaleConfig.min + 1)"
                          :key="n"
                          class="flex-1"
                        >
                          <div
                            class="p-3 border-round-lg cursor-pointer text-center transition-all border-2"
                            :class="answers[question.id] === (question.scaleConfig.min + n - 1)
                              ? 'bg-primary-50 border-primary'
                              : 'surface-50 border-transparent hover:surface-100'"
                            @click="answers[question.id] = question.scaleConfig.min + n - 1"
                          >
                            <span class="font-bold" :class="answers[question.id] === (question.scaleConfig.min + n - 1) ? 'text-primary' : 'text-600'">
                              {{ question.scaleConfig.min + n - 1 }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Date -->
                    <DatePicker
                      v-else-if="question.type === 'date'"
                      v-model="answers[question.id]"
                      dateFormat="dd/mm/yy"
                      showIcon
                      class="w-full"
                    />

                    <!-- Number -->
                    <InputNumber
                      v-else-if="question.type === 'number'"
                      v-model="answers[question.id]"
                      class="w-full"
                    />

                    <!-- File -->
                    <FileUpload
                      v-else-if="question.type === 'file'"
                      mode="basic"
                      name="file"
                      accept="*/*"
                      :maxFileSize="10000000"
                      chooseLabel="Seleccionar archivo"
                      class="w-full"
                    />

                    <!-- Comment (if enabled) -->
                    <div v-if="questionnaire?.settings.allowComments" class="mt-3">
                      <Textarea
                        v-model="answers[`${question.id}_comment`]"
                        rows="2"
                        class="w-full"
                        placeholder="Agregar comentario (opcional)..."
                      />
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-content-between mt-4 pb-4">
            <Button
              label="Anterior"
              icon="pi pi-arrow-left"
              severity="secondary"
              outlined
              :disabled="!canGoBack"
              @click="goBack"
            />
            <div class="flex gap-2">
              <Button
                v-if="!isLastSection"
                label="Siguiente"
                icon="pi pi-arrow-right"
                iconPos="right"
                @click="goNext"
              />
              <Button
                v-else
                label="Enviar Cuestionario"
                icon="pi pi-send"
                severity="success"
                @click="confirmSubmit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Dialog -->
    <Dialog
      v-model:visible="showSubmitDialog"
      modal
      header="Confirmar Envío"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-4">
        <Message v-if="unansweredRequired.length > 0" severity="warn" :closable="false">
          Hay {{ unansweredRequired.length }} preguntas requeridas sin responder.
          <span v-if="!questionnaire?.settings.requireAllQuestions">
            Puede enviar de todas formas.
          </span>
        </Message>

        <div class="flex align-items-center gap-3 p-3 surface-50 border-round-lg">
          <div class="flex align-items-center justify-content-center bg-primary border-round-lg" style="width: 48px; height: 48px;">
            <i class="pi pi-send text-white text-xl"></i>
          </div>
          <div>
            <div class="font-semibold text-900">{{ questionnaire?.title }}</div>
            <div class="text-sm text-500">Progreso: {{ progress }}%</div>
          </div>
        </div>

        <p class="text-600 m-0">
          Una vez enviado, el cuestionario será revisado y no podrá modificar sus respuestas.
          ¿Desea continuar?
        </p>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          severity="secondary"
          text
          @click="showSubmitDialog = false"
        />
        <Button
          label="Enviar"
          icon="pi pi-send"
          severity="success"
          @click="submitQuestionnaire"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.questionnaire-response {
  background: var(--surface-ground);
}

.section-nav-item {
  background: var(--surface-card);
  border: 1px solid transparent;

  &:hover {
    background: var(--surface-50);
  }

  &.section-active {
    background: var(--primary-50);
    border-color: var(--primary-color);
  }

  &.section-complete:not(.section-active) {
    background: var(--green-50);
    border-color: var(--green-200);
  }
}

.question-card {
  border: 2px solid transparent;
  transition: all 0.2s;

  &.question-answered {
    border-left: 4px solid var(--green-500);
  }
}

:deep(.p-card-body) {
  padding: 1.25rem;
}

:deep(.p-inputtext),
:deep(.p-textarea),
:deep(.p-datepicker) {
  &:focus {
    box-shadow: 0 0 0 2px var(--primary-100);
  }
}
</style>
