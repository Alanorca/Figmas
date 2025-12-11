<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaire'
import type { Question, QuestionType } from '../types/questionnaire'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const props = defineProps<{
  questionnaireId?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'saved', id: string): void
}>()

const store = useQuestionnaireStore()
const toast = useToast()

// Form state
const formName = ref('')
const formDescription = ref('')
const formElements = ref<FormElement[]>([])
const selectedElementId = ref<string | null>(null)

// Tipos de elementos del formulario
interface FormElement {
  id: string
  type: QuestionType
  label: string
  machineName: string
  defaultValue: string
  placeholder: string
  columns: number
  isCalculated: boolean
  isAutoincrement: boolean
  required: boolean
  mustBeUnique: boolean
  searchable: boolean
  conditionalDisplay: boolean
  conditionalField: string
  options?: { label: string; value: string }[]
}

// Elementos disponibles en la paleta
const basicFields = [
  { type: 'group' as QuestionType, label: 'Group', icon: 'pi pi-circle', description: 'The elements below are grouped' },
  { type: 'text' as QuestionType, label: 'Text Input', icon: 'pi pi-pencil', description: 'Single line text field' },
  { type: 'number' as QuestionType, label: 'Number', icon: 'pi pi-hashtag', description: 'Numeric input with validation' },
  { type: 'textarea' as QuestionType, label: 'Textarea', icon: 'pi pi-align-left', description: 'Multi-line text area' },
  { type: 'checkbox' as QuestionType, label: 'Checkbox', icon: 'pi pi-check-square', description: 'True/false toggle' },
  { type: 'date' as QuestionType, label: 'Date Picker', icon: 'pi pi-calendar', description: 'Date selection field' }
]

const choiceFields = [
  { type: 'radio' as QuestionType, label: 'Dropdown', icon: 'pi pi-chevron-down', description: 'Single selection dropdown' },
  { type: 'checkbox' as QuestionType, label: 'Multi Select', icon: 'pi pi-list', description: 'Multiple choice selection' },
  { type: 'radio' as QuestionType, label: 'Radio Buttons', icon: 'pi pi-circle', description: 'Single choice options' }
]

// Elemento seleccionado
const selectedElement = computed(() => {
  if (!selectedElementId.value) return null
  return formElements.value.find(el => el.id === selectedElementId.value)
})

// Cargar cuestionario existente
onMounted(() => {
  if (props.questionnaireId) {
    const questionnaire = store.questionnaires.find(q => q.id === props.questionnaireId)
    if (questionnaire) {
      formName.value = questionnaire.title
      formDescription.value = questionnaire.description || ''
      // Convertir preguntas existentes a elementos del formulario
      questionnaire.sections.forEach(section => {
        section.questions.forEach(q => {
          formElements.value.push({
            id: q.id,
            type: q.type,
            label: q.text,
            machineName: q.code,
            defaultValue: '',
            placeholder: q.description || '',
            columns: 1,
            isCalculated: false,
            isAutoincrement: false,
            required: q.required,
            mustBeUnique: false,
            searchable: false,
            conditionalDisplay: false,
            conditionalField: '',
            options: q.options?.map(o => ({ label: o.label, value: o.value }))
          })
        })
      })
    }
  }
})

// Agregar elemento al formulario
const addElement = (fieldType: typeof basicFields[0]) => {
  const newElement: FormElement = {
    id: `el-${Date.now()}`,
    type: fieldType.type,
    label: fieldType.label,
    machineName: `field_${formElements.value.length + 1}`,
    defaultValue: '',
    placeholder: '',
    columns: 1,
    isCalculated: false,
    isAutoincrement: false,
    required: false,
    mustBeUnique: false,
    searchable: false,
    conditionalDisplay: false,
    conditionalField: '',
    options: fieldType.type === 'radio' || fieldType.type === 'checkbox' ? [{ label: 'Opción 1', value: 'option1' }] : undefined
  }
  formElements.value.push(newElement)
  selectedElementId.value = newElement.id
}

// Eliminar elemento
const deleteElement = (id: string) => {
  const index = formElements.value.findIndex(el => el.id === id)
  if (index !== -1) {
    formElements.value.splice(index, 1)
    if (selectedElementId.value === id) {
      selectedElementId.value = null
    }
  }
}

// Mover elemento arriba/abajo
const moveElement = (id: string, direction: 'up' | 'down') => {
  const index = formElements.value.findIndex(el => el.id === id)
  if (index === -1) return

  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= formElements.value.length) return

  const element = formElements.value.splice(index, 1)[0]
  formElements.value.splice(newIndex, 0, element)
}

// Agregar opción a campo de selección
const addOption = () => {
  if (selectedElement.value?.options) {
    selectedElement.value.options.push({
      label: `Opción ${selectedElement.value.options.length + 1}`,
      value: `option${selectedElement.value.options.length + 1}`
    })
  }
}

// Eliminar opción
const removeOption = (index: number) => {
  if (selectedElement.value?.options && selectedElement.value.options.length > 1) {
    selectedElement.value.options.splice(index, 1)
  }
}

// Guardar cuestionario
const saveQuestionnaire = () => {
  if (!formName.value.trim()) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'El nombre es requerido', life: 3000 })
    return
  }

  // Convertir elementos a estructura de cuestionario
  const questionnaire = {
    id: props.questionnaireId || `q-${Date.now()}`,
    code: `CUES-${new Date().getFullYear()}-${String(store.questionnaires.length + 1).padStart(3, '0')}`,
    title: formName.value,
    description: formDescription.value,
    version: '1.0',
    status: 'draft' as const,
    category: 'General',
    sections: [{
      id: 's-1',
      title: 'Sección Principal',
      order: 1,
      questions: formElements.value.map((el, idx) => ({
        id: el.id,
        code: el.machineName,
        text: el.label,
        description: el.placeholder,
        type: el.type,
        required: el.required,
        order: idx + 1,
        options: el.options?.map((opt, i) => ({
          id: `opt-${i}`,
          label: opt.label,
          value: opt.value
        }))
      }))
    }],
    settings: {
      allowPartialSave: true,
      requireAllQuestions: false,
      allowComments: true,
      requireEvidence: false,
      showProgressBar: true,
      randomizeQuestions: false
    },
    createdBy: 'current-user',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  if (props.questionnaireId) {
    store.updateQuestionnaire(props.questionnaireId, questionnaire)
  } else {
    store.questionnaires.push(questionnaire as any)
  }

  toast.add({ severity: 'success', summary: 'Guardado', detail: 'Plantilla guardada correctamente', life: 3000 })
  emit('saved', questionnaire.id)
}

// Guardar como borrador
const saveDraft = () => {
  saveQuestionnaire()
}

// Opciones de columnas
const columnOptions = [
  { label: '1 columna', value: 1 },
  { label: '2 columnas', value: 2 },
  { label: '3 columnas', value: 3 },
  { label: '4 columnas', value: 4 }
]

// Obtener icono del tipo de campo
const getFieldIcon = (type: QuestionType) => {
  const field = [...basicFields, ...choiceFields].find(f => f.type === type)
  return field?.icon || 'pi pi-question'
}
</script>

<template>
  <div class="questionnaire-builder h-screen flex flex-column">
    <Toast />

    <!-- Header con breadcrumb -->
    <div class="surface-card border-bottom-1 surface-border px-4 py-3">
      <div class="flex align-items-center gap-2 text-sm text-500 mb-2">
        <i class="pi pi-home"></i>
        <span>></span>
        <span>Electronics</span>
        <span>></span>
        <span>Computer</span>
        <span>></span>
        <span>Accessories</span>
        <span>></span>
        <span>Keyboard</span>
        <span>></span>
        <span class="text-700">Wireless</span>
      </div>
      <div class="flex align-items-center justify-content-between">
        <div>
          <h1 class="text-xl font-bold text-900 m-0">Plantillas de activos</h1>
          <span class="text-sm text-500">Orca@Securityby Design</span>
        </div>
      </div>
    </div>

    <!-- Main Content - 3 Column Layout -->
    <div class="flex-1 flex overflow-hidden">

      <!-- Left Sidebar - Elements Palette -->
      <div class="w-18rem surface-card border-right-1 surface-border overflow-y-auto">
        <div class="p-3">
          <!-- View/Edit Toggle -->
          <div class="flex gap-2 mb-4">
            <Button icon="pi pi-pencil" text rounded severity="secondary" />
            <Button icon="pi pi-eye" text rounded severity="secondary" />
          </div>

          <!-- Basic Fields -->
          <h3 class="text-sm font-bold text-900 mb-2">Elementos de Activos</h3>
          <p class="text-xs text-500 mb-3">Basic Fields</p>

          <div class="flex flex-column gap-2">
            <div
              v-for="field in basicFields"
              :key="field.type + field.label"
              class="field-item flex align-items-center gap-3 p-3 border-round-lg surface-hover cursor-pointer"
              @click="addElement(field)"
            >
              <div class="flex align-items-center justify-content-center w-2rem h-2rem border-round surface-100">
                <i :class="field.icon" class="text-500"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-900 text-sm">{{ field.label }}</div>
                <div class="text-xs text-400">{{ field.description }}</div>
              </div>
              <i class="pi pi-plus text-400"></i>
            </div>
          </div>

          <Divider />

          <!-- Choice Fields -->
          <p class="text-xs text-500 mb-3">Choice Fields</p>

          <div class="flex flex-column gap-2">
            <div
              v-for="field in choiceFields"
              :key="field.type + field.label"
              class="field-item flex align-items-center gap-3 p-3 border-round-lg surface-hover cursor-pointer"
              @click="addElement(field)"
            >
              <div class="flex align-items-center justify-content-center w-2rem h-2rem border-round surface-100">
                <i :class="field.icon" class="text-500"></i>
              </div>
              <div class="flex-1">
                <div class="font-medium text-900 text-sm">{{ field.label }}</div>
                <div class="text-xs text-400">{{ field.description }}</div>
              </div>
              <i class="pi pi-plus text-400"></i>
            </div>
          </div>

          <Divider />

          <!-- Advanced -->
          <p class="text-xs text-500 mb-3">Advanced</p>
        </div>
      </div>

      <!-- Center - Form Canvas -->
      <div class="flex-1 overflow-y-auto surface-ground p-4">
        <div class="max-w-4xl mx-auto">
          <!-- Search Bar -->
          <div class="flex align-items-center justify-content-between mb-4">
            <div class="flex align-items-center gap-2">
              <div class="flex align-items-center justify-content-center w-2rem h-2rem bg-primary border-circle">
                <i class="pi pi-check text-white text-sm"></i>
              </div>
            </div>
            <div class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <InputText placeholder="Buscar" class="w-15rem" />
            </div>
            <!-- Save Button -->
            <div class="flex align-items-center gap-2">
              <Button label="Guardar" icon="pi pi-chevron-down" iconPos="right" severity="success" @click="saveQuestionnaire" />
            </div>
          </div>

          <!-- Form Name & Description -->
          <div class="surface-card border-round-xl p-4 mb-4 shadow-1">
            <InputText
              v-model="formName"
              placeholder="Ingresa el nombre de la plantilla"
              class="w-full text-lg font-semibold border-none p-0 mb-2"
              style="background: transparent;"
            />
            <InputText
              v-model="formDescription"
              placeholder="Ingresa una descripción"
              class="w-full text-sm text-500 border-none p-0"
              style="background: transparent;"
            />
          </div>

          <!-- Form Elements -->
          <div class="flex flex-column gap-3">
            <div
              v-for="(element, index) in formElements"
              :key="element.id"
              class="form-element surface-card border-round-xl p-4 shadow-1 cursor-pointer"
              :class="{ 'element-selected': selectedElementId === element.id }"
              @click="selectedElementId = element.id"
            >
              <div class="flex align-items-start gap-3">
                <!-- Drag Handle -->
                <div class="drag-handle flex align-items-center justify-content-center text-400 cursor-move">
                  <i class="pi pi-ellipsis-v"></i>
                  <i class="pi pi-ellipsis-v" style="margin-left: -8px;"></i>
                </div>

                <!-- Field Content -->
                <div class="flex-1">
                  <div class="flex align-items-center gap-2 mb-2">
                    <span class="font-semibold text-900">{{ element.label }}</span>
                  </div>

                  <!-- Field Preview -->
                  <div v-if="element.type === 'text'" class="mb-2">
                    <span class="text-sm text-600">{{ element.placeholder || element.label }}</span>
                    <InputText :placeholder="element.placeholder || `Escribe el ${element.label.toLowerCase()}`" class="w-full mt-1" disabled />
                  </div>

                  <div v-else-if="element.type === 'number'" class="mb-2">
                    <span class="text-sm text-600">{{ element.placeholder || element.label }}</span>
                    <InputText placeholder="Monto Pesos" class="w-full mt-1" disabled />
                  </div>

                  <div v-else-if="element.type === 'textarea'" class="mb-2">
                    <span class="text-sm text-600">{{ element.placeholder || element.label }}</span>
                    <InputText placeholder="Placeholder" class="w-full mt-1" disabled />
                  </div>

                  <div v-else-if="element.type === 'checkbox'" class="mb-2">
                    <div class="flex align-items-center gap-2">
                      <Checkbox :binary="true" disabled />
                      <span class="text-sm text-600">{{ element.placeholder || 'Se lleno Completo' }}</span>
                    </div>
                  </div>

                  <div v-else-if="element.type === 'date'" class="mb-2">
                    <span class="text-sm text-600 mb-2 block">{{ element.placeholder || 'Ingresa la Fecha' }}</span>
                    <div class="surface-100 border-round p-3">
                      <div class="flex align-items-center justify-content-between mb-3">
                        <i class="pi pi-chevron-left text-400 cursor-pointer"></i>
                        <span class="font-semibold">July 2024</span>
                        <i class="pi pi-chevron-right text-400 cursor-pointer"></i>
                      </div>
                      <div class="grid text-center text-sm">
                        <div class="col text-400">Wk</div>
                        <div class="col">Su</div>
                        <div class="col">Mo</div>
                        <div class="col">Tu</div>
                        <div class="col">We</div>
                        <div class="col">Th</div>
                        <div class="col">Fr</div>
                        <div class="col">Sa</div>
                      </div>
                    </div>
                  </div>

                  <div v-else-if="element.type === 'radio'" class="mb-2">
                    <span class="text-sm text-600">{{ element.label }}</span>
                    <Select :options="element.options" optionLabel="label" placeholder="Seleccionar" class="w-full mt-1" disabled />
                  </div>
                </div>

                <!-- Delete Button -->
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="secondary"
                  @click.stop="deleteElement(element.id)"
                />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="formElements.length === 0"
              class="surface-card border-round-xl p-6 shadow-1 text-center"
            >
              <i class="pi pi-plus-circle text-4xl text-300 mb-3"></i>
              <p class="text-500 m-0">Haz clic en un elemento de la izquierda para agregarlo al formulario</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar - Properties Panel -->
      <div class="w-20rem surface-card border-left-1 surface-border overflow-y-auto">
        <div class="p-3">
          <!-- Save Options -->
          <div class="flex flex-column gap-2 mb-4">
            <div class="flex align-items-center gap-2 p-2 surface-hover border-round cursor-pointer" @click="saveQuestionnaire">
              <i class="pi pi-save text-500"></i>
              <span class="text-sm">Guardar</span>
            </div>
            <div class="flex align-items-center gap-2 p-2 surface-hover border-round cursor-pointer" @click="saveDraft">
              <i class="pi pi-file text-500"></i>
              <span class="text-sm">Borrador</span>
            </div>
          </div>

          <Divider />

          <!-- Properties -->
          <div v-if="selectedElement">
            <h3 class="text-sm font-bold text-900 mb-1">Propiedades</h3>
            <p class="text-xs text-500 mb-4">Configure selectd element</p>

            <div class="flex flex-column gap-4">
              <!-- Display Label -->
              <div class="flex flex-column gap-2">
                <label class="text-xs font-semibold text-600">Display Label</label>
                <InputText v-model="selectedElement.label" class="w-full" />
              </div>

              <!-- Machine Name -->
              <div class="flex flex-column gap-2">
                <label class="text-xs font-semibold text-600">Machine Name</label>
                <InputText v-model="selectedElement.machineName" class="w-full" />
              </div>

              <!-- Default Value -->
              <div class="flex flex-column gap-2">
                <label class="text-xs font-semibold text-600">Default Value (Optional)</label>
                <InputText v-model="selectedElement.defaultValue" placeholder="e.g.,Pending" class="w-full" />
              </div>

              <!-- Número de columnas -->
              <div class="flex flex-column gap-2">
                <label class="text-xs font-semibold text-600">Número de columnas</label>
                <Select
                  v-model="selectedElement.columns"
                  :options="columnOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>

              <!-- Checkboxes -->
              <div class="flex gap-4">
                <div class="flex align-items-center gap-2">
                  <Checkbox v-model="selectedElement.isCalculated" :binary="true" inputId="isCalc" />
                  <label for="isCalc" class="text-xs">Is Calculated?</label>
                </div>
                <div class="flex align-items-center gap-2">
                  <Checkbox v-model="selectedElement.isAutoincrement" :binary="true" inputId="isAuto" />
                  <label for="isAuto" class="text-xs">Is Autoincrement ID?</label>
                </div>
              </div>

              <Divider />

              <!-- Validation Rules -->
              <div>
                <h4 class="text-xs font-bold text-900 mb-3">Validation Rules</h4>
                <div class="flex flex-wrap gap-3">
                  <div class="flex align-items-center gap-2">
                    <Checkbox v-model="selectedElement.required" :binary="true" inputId="required" />
                    <label for="required" class="text-xs">Required Field</label>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <Checkbox v-model="selectedElement.mustBeUnique" :binary="true" inputId="unique" />
                    <label for="unique" class="text-xs">Must be Unique</label>
                  </div>
                  <div class="flex align-items-center gap-2">
                    <Checkbox v-model="selectedElement.searchable" :binary="true" inputId="search" />
                    <label for="search" class="text-xs">Searchable</label>
                  </div>
                </div>
              </div>

              <Divider />

              <!-- Visualización Condicional -->
              <div>
                <div class="flex align-items-center justify-content-between mb-2">
                  <span class="text-xs font-bold text-900">Visualización Condicional</span>
                  <InputSwitch v-model="selectedElement.conditionalDisplay" />
                </div>
                <Select
                  v-if="selectedElement.conditionalDisplay"
                  v-model="selectedElement.conditionalField"
                  :options="formElements.filter(e => e.id !== selectedElement?.id).map(e => ({ label: e.label, value: e.id }))"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Mostar este campo si"
                  class="w-full"
                />
              </div>

              <!-- Options for select/radio fields -->
              <div v-if="selectedElement.options">
                <Divider />
                <div class="flex align-items-center justify-content-between mb-2">
                  <span class="text-xs font-bold text-900">Opciones</span>
                  <Button icon="pi pi-plus" text size="small" @click="addOption" />
                </div>
                <div class="flex flex-column gap-2">
                  <div
                    v-for="(opt, idx) in selectedElement.options"
                    :key="idx"
                    class="flex align-items-center gap-2"
                  >
                    <InputText v-model="opt.label" placeholder="Etiqueta" class="flex-1" />
                    <InputText v-model="opt.value" placeholder="Valor" class="flex-1" />
                    <Button
                      icon="pi pi-times"
                      text
                      rounded
                      severity="danger"
                      size="small"
                      @click="removeOption(idx)"
                      :disabled="selectedElement.options!.length <= 1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Selection State -->
          <div v-else class="text-center py-6">
            <i class="pi pi-arrow-left text-4xl text-300 mb-3"></i>
            <p class="text-500 text-sm m-0">Selecciona un elemento para ver sus propiedades</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="surface-card border-top-1 surface-border px-4 py-2 flex align-items-center justify-content-between">
      <Button
        icon="pi pi-arrow-left"
        label="Volver"
        text
        severity="secondary"
        @click="$emit('back')"
      />
      <div class="flex align-items-center gap-2">
        <Button
          icon="pi pi-cog"
          text
          rounded
          severity="secondary"
        />
        <Button
          icon="pi pi-power-off"
          text
          rounded
          severity="secondary"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.questionnaire-builder {
  background: var(--surface-ground);
}

.field-item {
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: var(--surface-100);
    border-color: var(--surface-300);
  }
}

.form-element {
  transition: all 0.2s;
  border: 2px solid transparent;

  &:hover {
    border-color: var(--surface-300);
  }

  &.element-selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-100);
  }
}

.drag-handle {
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

:deep(.p-inputtext) {
  &:disabled {
    background: var(--surface-100);
    opacity: 1;
  }
}
</style>
