<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaire'
import type { Questionnaire, QuestionnaireStatus } from '../types/questionnaire'

// PrimeVue Components
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Toolbar from 'primevue/toolbar'
import Menu from 'primevue/menu'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

const store = useQuestionnaireStore()
const toast = useToast()
const confirm = useConfirm()

// Estado local
const searchQuery = ref('')
const statusFilter = ref<QuestionnaireStatus | null>(null)
const categoryFilter = ref<string | null>(null)
const showNewDialog = ref(false)
const selectedQuestionnaires = ref<Questionnaire[]>([])

// Nuevo cuestionario
const newQuestionnaire = ref({
  title: '',
  description: '',
  category: 'General'
})

// Opciones de filtro
const statusOptions = [
  { label: 'Todos', value: null },
  { label: 'Borrador', value: 'draft' },
  { label: 'Publicado', value: 'published' },
  { label: 'Archivado', value: 'archived' }
]

const categoryOptions = [
  { label: 'Todas', value: null },
  { label: 'Seguridad', value: 'Seguridad' },
  { label: 'Privacidad', value: 'Privacidad' },
  { label: 'Riesgos', value: 'Riesgos' },
  { label: 'Cumplimiento', value: 'Cumplimiento' },
  { label: 'General', value: 'General' }
]

// Cuestionarios filtrados
const filteredQuestionnaires = computed(() => {
  return store.searchQuestionnaires(searchQuery.value, {
    status: statusFilter.value || undefined,
    category: categoryFilter.value || undefined
  })
})

// Estadísticas rápidas
const stats = computed(() => ({
  total: store.questionnaires.length,
  published: store.publishedQuestionnaires.length,
  drafts: store.draftQuestionnaires.length,
  pendingResponses: store.pendingAssignments.length
}))

// Métodos
const getStatusSeverity = (status: QuestionnaireStatus) => {
  switch (status) {
    case 'published': return 'success'
    case 'draft': return 'warn'
    case 'archived': return 'secondary'
    default: return 'info'
  }
}

const getStatusLabel = (status: QuestionnaireStatus) => {
  switch (status) {
    case 'published': return 'Publicado'
    case 'draft': return 'Borrador'
    case 'archived': return 'Archivado'
    default: return status
  }
}

const formatDate = (date: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const openNewDialog = () => {
  newQuestionnaire.value = {
    title: '',
    description: '',
    category: 'General'
  }
  showNewDialog.value = true
}

const createQuestionnaire = () => {
  if (!newQuestionnaire.value.title.trim()) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'El título es requerido',
      life: 3000
    })
    return
  }

  const created = store.createQuestionnaire(newQuestionnaire.value)
  showNewDialog.value = false
  toast.add({
    severity: 'success',
    summary: 'Cuestionario creado',
    detail: `${created.code} - ${created.title}`,
    life: 3000
  })

  // Emitir evento para navegar al editor
  emit('edit', created.id)
}

const editQuestionnaire = (questionnaire: Questionnaire) => {
  emit('edit', questionnaire.id)
}

const duplicateQuestionnaire = (questionnaire: Questionnaire) => {
  const duplicated = store.createQuestionnaire({
    ...questionnaire,
    title: `${questionnaire.title} (Copia)`,
    status: 'draft'
  })
  toast.add({
    severity: 'success',
    summary: 'Cuestionario duplicado',
    detail: `${duplicated.code} creado`,
    life: 3000
  })
}

const confirmDelete = (questionnaire: Questionnaire) => {
  confirm.require({
    message: `¿Está seguro de eliminar el cuestionario "${questionnaire.title}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Eliminar',
    acceptClass: 'p-button-danger',
    accept: () => {
      store.deleteQuestionnaire(questionnaire.id)
      toast.add({
        severity: 'success',
        summary: 'Eliminado',
        detail: 'Cuestionario eliminado correctamente',
        life: 3000
      })
    }
  })
}

const publishQuestionnaire = (questionnaire: Questionnaire) => {
  store.publishQuestionnaire(questionnaire.id)
  toast.add({
    severity: 'success',
    summary: 'Publicado',
    detail: `${questionnaire.title} está ahora disponible para asignar`,
    life: 3000
  })
}

const archiveQuestionnaire = (questionnaire: Questionnaire) => {
  store.archiveQuestionnaire(questionnaire.id)
  toast.add({
    severity: 'info',
    summary: 'Archivado',
    detail: 'Cuestionario archivado correctamente',
    life: 3000
  })
}

// Menú de acciones
const menuRef = ref()
const menuItems = ref<any[]>([])
const currentQuestionnaire = ref<Questionnaire | null>(null)

const showMenu = (event: Event, questionnaire: Questionnaire) => {
  currentQuestionnaire.value = questionnaire
  menuItems.value = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => editQuestionnaire(questionnaire)
    },
    {
      label: 'Duplicar',
      icon: 'pi pi-copy',
      command: () => duplicateQuestionnaire(questionnaire)
    },
    { separator: true },
    ...(questionnaire.status === 'draft' ? [{
      label: 'Publicar',
      icon: 'pi pi-check-circle',
      command: () => publishQuestionnaire(questionnaire)
    }] : []),
    ...(questionnaire.status === 'published' ? [{
      label: 'Archivar',
      icon: 'pi pi-inbox',
      command: () => archiveQuestionnaire(questionnaire)
    }] : []),
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      class: 'text-red-500',
      command: () => confirmDelete(questionnaire)
    }
  ]
  menuRef.value.toggle(event)
}

// Emits
const emit = defineEmits<{
  (e: 'edit', id: string): void
  (e: 'assign', id: string): void
}>()
</script>

<template>
  <div class="questionnaire-list p-4">
    <Toast />
    <ConfirmDialog />
    <Menu ref="menuRef" :model="menuItems" popup />

    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-900 m-0">Cuestionarios</h1>
        <p class="text-600 mt-1 mb-0">Gestiona plantillas de cuestionarios para evaluaciones</p>
      </div>
      <Button
        label="Nuevo Cuestionario"
        icon="pi pi-plus"
        @click="openNewDialog"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round-xl p-3 shadow-1">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-round-lg bg-blue-100" style="width: 48px; height: 48px;">
              <i class="pi pi-file text-blue-600 text-xl"></i>
            </div>
            <div>
              <div class="text-600 text-sm">Total</div>
              <div class="text-900 text-2xl font-bold">{{ stats.total }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round-xl p-3 shadow-1">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-round-lg bg-green-100" style="width: 48px; height: 48px;">
              <i class="pi pi-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <div class="text-600 text-sm">Publicados</div>
              <div class="text-900 text-2xl font-bold">{{ stats.published }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round-xl p-3 shadow-1">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-round-lg bg-yellow-100" style="width: 48px; height: 48px;">
              <i class="pi pi-file-edit text-yellow-600 text-xl"></i>
            </div>
            <div>
              <div class="text-600 text-sm">Borradores</div>
              <div class="text-900 text-2xl font-bold">{{ stats.drafts }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <div class="surface-card border-round-xl p-3 shadow-1">
          <div class="flex align-items-center gap-3">
            <div class="flex align-items-center justify-content-center border-round-lg bg-purple-100" style="width: 48px; height: 48px;">
              <i class="pi pi-send text-purple-600 text-xl"></i>
            </div>
            <div>
              <div class="text-600 text-sm">Asignaciones Pendientes</div>
              <div class="text-900 text-2xl font-bold">{{ stats.pendingResponses }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="surface-card border-round-xl p-4 shadow-1 mb-4">
      <div class="flex flex-column md:flex-row gap-3">
        <div class="flex-1">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Buscar por título, código o descripción..."
              class="w-full"
            />
          </span>
        </div>
        <Select
          v-model="statusFilter"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Estado"
          class="w-full md:w-auto"
          style="min-width: 150px;"
        />
        <Select
          v-model="categoryFilter"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Categoría"
          class="w-full md:w-auto"
          style="min-width: 150px;"
        />
      </div>
    </div>

    <!-- Data Table -->
    <div class="surface-card border-round-xl shadow-1 overflow-hidden">
      <DataTable
        :value="filteredQuestionnaires"
        v-model:selection="selectedQuestionnaires"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} cuestionarios"
        responsiveLayout="scroll"
        stripedRows
        class="p-datatable-sm"
      >
        <template #empty>
          <div class="flex flex-column align-items-center justify-content-center py-6">
            <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
            <span class="text-600">No se encontraron cuestionarios</span>
          </div>
        </template>

        <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

        <Column field="code" header="Código" sortable style="min-width: 120px;">
          <template #body="{ data }">
            <span class="font-mono text-sm font-semibold text-primary">{{ data.code }}</span>
          </template>
        </Column>

        <Column field="title" header="Título" sortable style="min-width: 250px;">
          <template #body="{ data }">
            <div>
              <div class="font-semibold text-900">{{ data.title }}</div>
              <div class="text-sm text-500 mt-1" v-if="data.description">
                {{ data.description.substring(0, 60) }}{{ data.description.length > 60 ? '...' : '' }}
              </div>
            </div>
          </template>
        </Column>

        <Column field="category" header="Categoría" sortable style="min-width: 120px;">
          <template #body="{ data }">
            <Tag :value="data.category" severity="info" />
          </template>
        </Column>

        <Column field="status" header="Estado" sortable style="min-width: 100px;">
          <template #body="{ data }">
            <Tag
              :value="getStatusLabel(data.status)"
              :severity="getStatusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column field="sections" header="Secciones" style="min-width: 100px;">
          <template #body="{ data }">
            <span class="text-600">{{ data.sections?.length || 0 }} secciones</span>
          </template>
        </Column>

        <Column field="version" header="Versión" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm text-600">v{{ data.version }}</span>
          </template>
        </Column>

        <Column field="updatedAt" header="Actualizado" sortable style="min-width: 120px;">
          <template #body="{ data }">
            <span class="text-sm text-600">{{ formatDate(data.updatedAt) }}</span>
          </template>
        </Column>

        <Column header="Acciones" style="min-width: 150px;" frozen alignFrozen="right">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                severity="secondary"
                v-tooltip.top="'Editar'"
                @click="editQuestionnaire(data)"
              />
              <Button
                v-if="data.status === 'published'"
                icon="pi pi-send"
                text
                rounded
                severity="info"
                v-tooltip.top="'Asignar'"
                @click="$emit('assign', data.id)"
              />
              <Button
                icon="pi pi-ellipsis-v"
                text
                rounded
                severity="secondary"
                @click="showMenu($event, data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- New Questionnaire Dialog -->
    <Dialog
      v-model:visible="showNewDialog"
      modal
      header="Nuevo Cuestionario"
      :style="{ width: '500px' }"
      :breakpoints="{ '640px': '90vw' }"
    >
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="title" class="font-semibold">Título *</label>
          <InputText
            id="title"
            v-model="newQuestionnaire.title"
            placeholder="Ej: Evaluación de Seguridad 2024"
            class="w-full"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="description" class="font-semibold">Descripción</label>
          <InputText
            id="description"
            v-model="newQuestionnaire.description"
            placeholder="Breve descripción del cuestionario..."
            class="w-full"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="category" class="font-semibold">Categoría</label>
          <Select
            id="category"
            v-model="newQuestionnaire.category"
            :options="categoryOptions.filter(c => c.value)"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar categoría"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-content-end gap-2">
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="showNewDialog = false"
          />
          <Button
            label="Crear Cuestionario"
            icon="pi pi-plus"
            @click="createQuestionnaire"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.questionnaire-list {
  min-height: 100vh;
  background: var(--surface-ground);
}

:deep(.p-datatable) {
  .p-datatable-header {
    background: transparent;
    border: none;
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    background: var(--surface-50);
    border-color: var(--surface-200);
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .p-datatable-tbody > tr {
    &:hover {
      background: var(--surface-50) !important;
    }

    > td {
      border-color: var(--surface-100);
      padding: 0.75rem 1rem;
    }
  }
}

:deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 1rem;
}

:deep(.p-input-icon-left) {
  width: 100%;

  > i {
    left: 0.75rem;
    color: var(--text-color-secondary);
  }

  > .p-inputtext {
    padding-left: 2.5rem;
  }
}
</style>
