<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuestionnaireStore } from '../stores/questionnaire'
import type { ComplianceAlert, NormativeFramework } from '../types/questionnaire'

// PrimeVue Components
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Timeline from 'primevue/timeline'
import Knob from 'primevue/knob'
import Chart from 'primevue/chart'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Badge from 'primevue/badge'
import Divider from 'primevue/divider'
import Avatar from 'primevue/avatar'
import Message from 'primevue/message'

const store = useQuestionnaireStore()

// Dashboard data
const dashboard = computed(() => store.complianceDashboard)
const frameworks = computed(() => store.frameworks)
const alerts = computed(() => store.activeAlerts)
const pendingAssignments = computed(() => store.pendingAssignments)

// Chart data for frameworks compliance
const frameworkChartData = computed(() => ({
  labels: dashboard.value.frameworkSummaries.map(f => f.frameworkCode),
  datasets: [
    {
      label: 'Cumplimiento %',
      data: dashboard.value.frameworkSummaries.map(f => f.complianceScore),
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'],
      borderWidth: 0,
      borderRadius: 8
    }
  ]
}))

const frameworkChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: (value: number) => `${value}%` }
    }
  }
}

// Control effectiveness donut chart
const controlChartData = computed(() => ({
  labels: ['Efectivos', 'Necesitan Mejora', 'Inefectivos'],
  datasets: [
    {
      data: [
        dashboard.value.controlEffectiveness.effective,
        dashboard.value.controlEffectiveness.needsImprovement,
        dashboard.value.controlEffectiveness.ineffective
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }
  ]
}))

const controlChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '70%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, padding: 15 }
    }
  }
}

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const formatRelativeDate = (date: Date | string) => {
  const d = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays <= 7) return `En ${diffDays} días`
  return formatDate(date)
}

// Alert severity
const getAlertSeverity = (severity: ComplianceAlert['severity']) => {
  switch (severity) {
    case 'critical': return 'danger'
    case 'warning': return 'warn'
    default: return 'info'
  }
}

const getAlertIcon = (type: ComplianceAlert['type']) => {
  switch (type) {
    case 'deadline': return 'pi pi-clock'
    case 'gap': return 'pi pi-exclamation-triangle'
    case 'control_failure': return 'pi pi-times-circle'
    case 'evidence_expiry': return 'pi pi-file'
    case 'evaluation_due': return 'pi pi-calendar'
    default: return 'pi pi-info-circle'
  }
}

// Get compliance status color
const getComplianceColor = (score: number) => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

const getComplianceBg = (score: number) => {
  if (score >= 80) return 'bg-green-50'
  if (score >= 60) return 'bg-yellow-50'
  return 'bg-red-50'
}

// Trend icon
const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
  switch (trend) {
    case 'improving': return 'pi pi-arrow-up text-green-500'
    case 'declining': return 'pi pi-arrow-down text-red-500'
    default: return 'pi pi-minus text-gray-400'
  }
}

// Actions
const acknowledgeAlert = (alertId: string) => {
  store.acknowledgeAlert(alertId)
}

const emit = defineEmits<{
  (e: 'viewQuestionnaires'): void
  (e: 'viewAssignment', id: string): void
}>()
</script>

<template>
  <div class="compliance-dashboard p-4 surface-ground min-h-screen">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-900 m-0">Dashboard de Cumplimiento</h1>
        <p class="text-600 mt-1 mb-0">Monitoreo de marcos normativos y controles</p>
      </div>
      <div class="flex gap-2">
        <Button
          label="Cuestionarios"
          icon="pi pi-file-edit"
          severity="secondary"
          outlined
          @click="$emit('viewQuestionnaires')"
        />
        <Button
          label="Nueva Evaluación"
          icon="pi pi-plus"
        />
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid mb-4">
      <!-- Overall Compliance -->
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
          <template #content>
            <div class="flex align-items-center justify-content-between">
              <div>
                <div class="text-500 text-sm font-medium mb-1">Cumplimiento General</div>
                <div class="text-3xl font-bold" :class="getComplianceColor(dashboard.overallCompliance)">
                  {{ dashboard.overallCompliance }}%
                </div>
                <div class="flex align-items-center gap-1 mt-2">
                  <i class="pi pi-arrow-up text-green-500 text-xs"></i>
                  <span class="text-green-500 text-sm font-medium">+3%</span>
                  <span class="text-400 text-xs">vs mes anterior</span>
                </div>
              </div>
              <Knob
                :modelValue="dashboard.overallCompliance"
                :size="80"
                :strokeWidth="8"
                readonly
                valueColor="#10B981"
                rangeColor="#E5E7EB"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Controls -->
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
          <template #content>
            <div class="text-500 text-sm font-medium mb-2">Efectividad de Controles</div>
            <div class="flex align-items-center gap-3">
              <div class="text-3xl font-bold text-900">
                {{ Math.round((dashboard.controlEffectiveness.effective / dashboard.controlEffectiveness.total) * 100) }}%
              </div>
              <div class="flex-1">
                <div class="flex gap-1 h-2rem">
                  <div
                    class="bg-green-500 border-round-left"
                    :style="{ width: `${(dashboard.controlEffectiveness.effective / dashboard.controlEffectiveness.total) * 100}%` }"
                  ></div>
                  <div
                    class="bg-yellow-500"
                    :style="{ width: `${(dashboard.controlEffectiveness.needsImprovement / dashboard.controlEffectiveness.total) * 100}%` }"
                  ></div>
                  <div
                    class="bg-red-500 border-round-right"
                    :style="{ width: `${(dashboard.controlEffectiveness.ineffective / dashboard.controlEffectiveness.total) * 100}%` }"
                  ></div>
                </div>
                <div class="flex justify-content-between text-xs text-500 mt-1">
                  <span>{{ dashboard.controlEffectiveness.effective }} efectivos</span>
                  <span>{{ dashboard.controlEffectiveness.total }} total</span>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Pending Actions -->
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
          <template #content>
            <div class="text-500 text-sm font-medium mb-2">Acciones Pendientes</div>
            <div class="flex align-items-baseline gap-2 mb-2">
              <span class="text-3xl font-bold text-900">{{ dashboard.pendingActions.total }}</span>
              <span class="text-red-500 font-medium" v-if="dashboard.pendingActions.overdue > 0">
                ({{ dashboard.pendingActions.overdue }} vencidas)
              </span>
            </div>
            <div class="flex gap-3 text-sm">
              <div class="flex align-items-center gap-1">
                <div class="w-1rem h-1rem bg-red-500 border-round"></div>
                <span class="text-600">{{ dashboard.pendingActions.overdue }} vencidas</span>
              </div>
              <div class="flex align-items-center gap-1">
                <div class="w-1rem h-1rem bg-yellow-500 border-round"></div>
                <span class="text-600">{{ dashboard.pendingActions.dueThisWeek }} esta semana</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Evidence Status -->
      <div class="col-12 md:col-6 lg:col-3">
        <Card class="h-full">
          <template #content>
            <div class="text-500 text-sm font-medium mb-2">Estado de Evidencias</div>
            <div class="flex align-items-center gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-500">{{ dashboard.evidenceStatus.valid }}</div>
                <div class="text-xs text-500">Vigentes</div>
              </div>
              <Divider layout="vertical" />
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-500">{{ dashboard.evidenceStatus.expiringSoon }}</div>
                <div class="text-xs text-500">Por vencer</div>
              </div>
              <Divider layout="vertical" />
              <div class="text-center">
                <div class="text-2xl font-bold text-red-500">{{ dashboard.evidenceStatus.expired }}</div>
                <div class="text-xs text-500">Vencidas</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid">
      <!-- Left Column -->
      <div class="col-12 lg:col-8">
        <!-- Framework Compliance -->
        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <span>Cumplimiento por Marco Normativo</span>
              <Button label="Ver Detalle" text size="small" />
            </div>
          </template>
          <template #content>
            <div class="grid">
              <div class="col-12 md:col-7">
                <div style="height: 250px;">
                  <Chart type="bar" :data="frameworkChartData" :options="frameworkChartOptions" />
                </div>
              </div>
              <div class="col-12 md:col-5">
                <div class="flex flex-column gap-3">
                  <div
                    v-for="fw in dashboard.frameworkSummaries"
                    :key="fw.frameworkId"
                    class="flex align-items-center gap-3 p-3 border-round-lg"
                    :class="getComplianceBg(fw.complianceScore)"
                  >
                    <div
                      class="flex align-items-center justify-content-center border-round-lg"
                      style="width: 40px; height: 40px;"
                      :style="{ background: frameworks.find(f => f.code === fw.frameworkCode)?.color + '20' }"
                    >
                      <i
                        :class="frameworks.find(f => f.code === fw.frameworkCode)?.icon"
                        :style="{ color: frameworks.find(f => f.code === fw.frameworkCode)?.color }"
                      ></i>
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-900">{{ fw.frameworkCode }}</div>
                      <div class="text-xs text-500">{{ fw.frameworkName }}</div>
                    </div>
                    <div class="text-right">
                      <div class="font-bold" :class="getComplianceColor(fw.complianceScore)">
                        {{ fw.complianceScore }}%
                      </div>
                      <i :class="getTrendIcon(fw.trend)" class="text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Pending Questionnaires -->
        <Card>
          <template #title>
            <div class="flex align-items-center gap-2">
              <span>Cuestionarios Pendientes</span>
              <Badge :value="pendingAssignments.length" severity="warn" />
            </div>
          </template>
          <template #content>
            <DataTable
              :value="pendingAssignments"
              :rows="5"
              responsiveLayout="scroll"
              class="p-datatable-sm"
            >
              <template #empty>
                <div class="text-center py-4">
                  <i class="pi pi-check-circle text-4xl text-green-300 mb-2"></i>
                  <p class="text-500 m-0">No hay cuestionarios pendientes</p>
                </div>
              </template>

              <Column header="Cuestionario" style="min-width: 200px;">
                <template #body="{ data }">
                  <div class="flex align-items-center gap-2">
                    <Avatar icon="pi pi-file" shape="circle" class="bg-primary-100" />
                    <div>
                      <div class="font-medium text-900">
                        {{ store.questionnaires.find(q => q.id === data.questionnaireId)?.title }}
                      </div>
                      <div class="text-xs text-500">
                        {{ store.questionnaires.find(q => q.id === data.questionnaireId)?.code }}
                      </div>
                    </div>
                  </div>
                </template>
              </Column>

              <Column header="Asignado a" style="min-width: 150px;">
                <template #body="{ data }">
                  <Tag :value="data.assignedTo.names?.[0] || data.assignedTo.type" severity="secondary" />
                </template>
              </Column>

              <Column header="Fecha límite" style="min-width: 120px;">
                <template #body="{ data }">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-calendar text-500 text-sm"></i>
                    <span :class="new Date(data.dueDate) < new Date() ? 'text-red-500 font-semibold' : 'text-600'">
                      {{ formatRelativeDate(data.dueDate) }}
                    </span>
                  </div>
                </template>
              </Column>

              <Column header="Prioridad" style="min-width: 100px;">
                <template #body="{ data }">
                  <Tag
                    :value="data.priority"
                    :severity="data.priority === 'critical' ? 'danger' : data.priority === 'high' ? 'warn' : 'secondary'"
                  />
                </template>
              </Column>

              <Column header="Estado" style="min-width: 120px;">
                <template #body="{ data }">
                  <Tag
                    :value="data.status === 'pending' ? 'Pendiente' : 'En progreso'"
                    :severity="data.status === 'pending' ? 'warn' : 'info'"
                  />
                </template>
              </Column>

              <Column style="min-width: 80px;">
                <template #body="{ data }">
                  <Button
                    icon="pi pi-arrow-right"
                    text
                    rounded
                    @click="$emit('viewAssignment', data.id)"
                  />
                </template>
              </Column>
            </DataTable>
          </template>
        </Card>
      </div>

      <!-- Right Column -->
      <div class="col-12 lg:col-4">
        <!-- Alerts -->
        <Card class="mb-4">
          <template #title>
            <div class="flex align-items-center justify-content-between">
              <div class="flex align-items-center gap-2">
                <span>Alertas</span>
                <Badge v-if="alerts.length > 0" :value="alerts.length" severity="danger" />
              </div>
              <Button label="Ver todas" text size="small" />
            </div>
          </template>
          <template #content>
            <div v-if="alerts.length === 0" class="text-center py-4">
              <i class="pi pi-bell-slash text-4xl text-300 mb-2"></i>
              <p class="text-500 m-0">Sin alertas activas</p>
            </div>
            <div v-else class="flex flex-column gap-3">
              <div
                v-for="alert in alerts.slice(0, 5)"
                :key="alert.id"
                class="p-3 border-round-lg border-left-3"
                :class="{
                  'bg-red-50 border-red-500': alert.severity === 'critical',
                  'bg-yellow-50 border-yellow-500': alert.severity === 'warning',
                  'bg-blue-50 border-blue-500': alert.severity === 'info'
                }"
              >
                <div class="flex align-items-start gap-3">
                  <i
                    :class="getAlertIcon(alert.type)"
                    class="text-lg mt-1"
                    :style="{
                      color: alert.severity === 'critical' ? 'var(--red-500)' :
                             alert.severity === 'warning' ? 'var(--yellow-600)' : 'var(--blue-500)'
                    }"
                  ></i>
                  <div class="flex-1">
                    <div class="font-semibold text-900 text-sm">{{ alert.title }}</div>
                    <div class="text-xs text-600 mt-1">{{ alert.description }}</div>
                    <div class="flex align-items-center justify-content-between mt-2">
                      <span class="text-xs text-400">{{ formatRelativeDate(alert.createdAt) }}</span>
                      <Button
                        label="Atender"
                        text
                        size="small"
                        class="p-0"
                        @click="acknowledgeAlert(alert.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Upcoming Deadlines -->
        <Card class="mb-4">
          <template #title>Próximos Vencimientos</template>
          <template #content>
            <Timeline :value="dashboard.upcomingDeadlines" class="custom-timeline">
              <template #marker="{ item }">
                <span
                  class="flex align-items-center justify-content-center border-circle surface-card shadow-1"
                  style="width: 2rem; height: 2rem;"
                >
                  <i
                    :class="item.type === 'questionnaire' ? 'pi pi-file-edit' :
                            item.type === 'audit' ? 'pi pi-search' : 'pi pi-check-square'"
                    class="text-primary"
                  ></i>
                </span>
              </template>
              <template #content="{ item }">
                <div class="mb-3">
                  <div class="font-medium text-900">{{ item.description }}</div>
                  <div class="text-sm text-primary font-semibold">{{ formatRelativeDate(item.date) }}</div>
                </div>
              </template>
            </Timeline>
          </template>
        </Card>

        <!-- Control Effectiveness Chart -->
        <Card>
          <template #title>Distribución de Controles</template>
          <template #content>
            <div style="height: 200px;">
              <Chart type="doughnut" :data="controlChartData" :options="controlChartOptions" />
            </div>
            <div class="text-center mt-3">
              <span class="text-2xl font-bold text-900">{{ dashboard.controlEffectiveness.total }}</span>
              <span class="text-500 ml-1">controles totales</span>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.compliance-dashboard {
  max-width: 1600px;
  margin: 0 auto;
}

:deep(.p-card) {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.p-card-title) {
  font-size: 1rem;
  font-weight: 600;
}

:deep(.p-card-content) {
  padding-top: 0;
}

:deep(.p-datatable) {
  .p-datatable-thead > tr > th {
    background: transparent;
    border: none;
    font-weight: 600;
    color: var(--text-color-secondary);
    font-size: 0.75rem;
    text-transform: uppercase;
    padding: 0.75rem 1rem;
  }

  .p-datatable-tbody > tr > td {
    border: none;
    border-bottom: 1px solid var(--surface-100);
    padding: 0.75rem 1rem;
  }

  .p-datatable-tbody > tr:hover {
    background: var(--surface-50);
  }
}

.custom-timeline {
  :deep(.p-timeline-event-opposite) {
    display: none;
  }

  :deep(.p-timeline-event-content) {
    padding-left: 1rem;
  }

  :deep(.p-timeline-event-connector) {
    background: var(--surface-200);
  }
}

:deep(.p-knob-text) {
  font-weight: 700;
}
</style>
