<script setup lang="ts">
import { ref } from 'vue'

// Views
import ProcessEditor from './views/ProcessEditor.vue'
import QuestionnaireList from './views/QuestionnaireList.vue'
import QuestionnaireBuilder from './views/QuestionnaireBuilder.vue'
import QuestionnaireResponse from './views/QuestionnaireResponse.vue'
import ComplianceDashboard from './views/ComplianceDashboard.vue'

// PrimeVue Components
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import Badge from 'primevue/badge'

// Navigation state
type View = 'dashboard' | 'processes' | 'questionnaires' | 'questionnaire-builder' | 'questionnaire-response'

const currentView = ref<View>('processes')
const editingQuestionnaireId = ref<string | null>(null)
const respondingAssignmentId = ref<string | null>(null)

// Menu items
const menuItems = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-bar',
    command: () => navigateTo('dashboard')
  },
  {
    label: 'Procesos',
    icon: 'pi pi-sitemap',
    command: () => navigateTo('processes')
  },
  {
    label: 'Cuestionarios',
    icon: 'pi pi-file-edit',
    command: () => navigateTo('questionnaires')
  }
])

// User menu
const userMenuRef = ref()
const userMenuItems = ref([
  { label: 'Mi Perfil', icon: 'pi pi-user' },
  { label: 'Configuración', icon: 'pi pi-cog' },
  { separator: true },
  { label: 'Cerrar Sesión', icon: 'pi pi-sign-out' }
])

// Navigation
const navigateTo = (view: View) => {
  currentView.value = view
  editingQuestionnaireId.value = null
  respondingAssignmentId.value = null
}

// Edit questionnaire
const editQuestionnaire = (id: string) => {
  editingQuestionnaireId.value = id
  currentView.value = 'questionnaire-builder'
}

// New questionnaire (builder without id)
const newQuestionnaire = () => {
  editingQuestionnaireId.value = null
  currentView.value = 'questionnaire-builder'
}

// Respond to assignment
const respondToAssignment = (assignmentId: string) => {
  respondingAssignmentId.value = assignmentId
  currentView.value = 'questionnaire-response'
}

// Back from builder/response
const backToList = () => {
  currentView.value = 'questionnaires'
  editingQuestionnaireId.value = null
  respondingAssignmentId.value = null
}

const toggleUserMenu = (event: Event) => {
  userMenuRef.value.toggle(event)
}
</script>

<template>
  <div class="app-container h-screen flex flex-column">
    <!-- Top Navigation Bar -->
    <div class="surface-card shadow-1 px-4 py-2 flex align-items-center justify-content-between border-bottom-1 surface-border">
      <!-- Logo & Brand -->
      <div class="flex align-items-center gap-4">
        <div class="flex align-items-center gap-2">
          <div class="flex align-items-center justify-content-center bg-primary border-round" style="width: 36px; height: 36px;">
            <i class="pi pi-shield text-white text-lg"></i>
          </div>
          <div>
            <div class="font-bold text-900">ORCA</div>
            <div class="text-xs text-500">GRC Platform</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex align-items-center gap-1 ml-4">
          <Button
            v-for="item in menuItems"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :text="currentView !== item.label.toLowerCase() && !(item.label === 'Dashboard' && currentView === 'dashboard')"
            :severity="(currentView === 'dashboard' && item.label === 'Dashboard') ||
                       (currentView === 'processes' && item.label === 'Procesos') ||
                       (currentView.includes('questionnaire') && item.label === 'Cuestionarios')
                       ? 'primary' : 'secondary'"
            size="small"
            @click="item.command"
            class="nav-button"
          />
        </div>
      </div>

      <!-- Right Side -->
      <div class="flex align-items-center gap-3">
        <!-- Notifications -->
        <Button
          icon="pi pi-bell"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Notificaciones'"
        >
          <Badge value="3" severity="danger" class="notification-badge" />
        </Button>

        <!-- Help -->
        <Button
          icon="pi pi-question-circle"
          text
          rounded
          severity="secondary"
          v-tooltip.bottom="'Ayuda'"
        />

        <!-- User Menu -->
        <div class="flex align-items-center gap-2 cursor-pointer surface-100 border-round-xl px-2 py-1" @click="toggleUserMenu">
          <Avatar
            label="AF"
            shape="circle"
            class="bg-primary text-white"
            style="width: 32px; height: 32px; font-size: 12px;"
          />
          <div class="hidden md:block">
            <div class="text-sm font-medium text-900">Alan Franco</div>
            <div class="text-xs text-500">Administrador</div>
          </div>
          <i class="pi pi-chevron-down text-400 text-xs ml-1"></i>
        </div>
        <Menu ref="userMenuRef" :model="userMenuItems" popup />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Dashboard -->
      <ComplianceDashboard
        v-if="currentView === 'dashboard'"
        @viewQuestionnaires="navigateTo('questionnaires')"
        @viewAssignment="respondToAssignment"
      />

      <!-- Process Editor -->
      <ProcessEditor v-else-if="currentView === 'processes'" />

      <!-- Questionnaire List -->
      <QuestionnaireList
        v-else-if="currentView === 'questionnaires'"
        @edit="editQuestionnaire"
        @assign="respondToAssignment"
      />

      <!-- Questionnaire Builder -->
      <QuestionnaireBuilder
        v-else-if="currentView === 'questionnaire-builder'"
        :questionnaireId="editingQuestionnaireId || undefined"
        @back="backToList"
        @saved="backToList"
      />

      <!-- Questionnaire Response -->
      <QuestionnaireResponse
        v-else-if="currentView === 'questionnaire-response' && respondingAssignmentId"
        :assignmentId="respondingAssignmentId"
        @back="backToList"
        @submitted="backToList"
      />
    </div>
  </div>
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

* {
  box-sizing: border-box;
}

.app-container {
  background: var(--surface-ground);
}

.nav-button {
  border-radius: 8px !important;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(25%, -25%);
}

/* Ensure proper layout for all views */
.app-container > .flex-1 > * {
  height: 100%;
}
</style>
