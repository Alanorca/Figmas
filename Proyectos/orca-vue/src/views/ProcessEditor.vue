<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import type { Node, Edge, Connection } from '@vue-flow/core'
import { useProcessStore } from '../stores/processStore'
import { NODE_TYPES } from '../types/process'
import type { NodeType } from '../types/process'
import CustomNode from '../components/nodes/CustomNode.vue'
import PropertiesPanel from '../components/PropertiesPanel.vue'

// PrimeVue Components
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Badge from 'primevue/badge'
import Toolbar from 'primevue/toolbar'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'
import Panel from 'primevue/panel'
import ScrollPanel from 'primevue/scrollpanel'
import { useToast } from 'primevue/usetoast'

const store = useProcessStore()
const toast = useToast()
const { onConnect, onNodeDragStop } = useVueFlow()

// Categorías de nodos
const categorias = [
  { key: 'datos', label: 'Datos', icon: 'pi pi-database' },
  { key: 'procesamiento', label: 'Procesamiento', icon: 'pi pi-cog' },
  { key: 'logica', label: 'Lógica', icon: 'pi pi-sitemap' },
  { key: 'ia', label: 'Inteligencia Artificial', icon: 'pi pi-microchip-ai' },
  { key: 'estado', label: 'Estado', icon: 'pi pi-flag' }
]

// Tipos de nodos personalizados
const nodeTypes = {
  custom: markRaw(CustomNode)
}

// Convertir nodos del store a formato Vue Flow
const vueFlowNodes = computed<Node[]>(() => {
  return store.nodes.map(node => ({
    id: node.id,
    type: 'custom',
    position: node.position,
    data: {
      label: node.label,
      nodeType: node.type,
      config: node.config,
      selected: store.selectedNode?.id === node.id
    }
  }))
})

// Convertir edges del store a formato Vue Flow
const vueFlowEdges = computed<Edge[]>(() => {
  return store.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: { stroke: 'var(--primary-color)', strokeWidth: 2 }
  }))
})

// Handle connections
onConnect((params: Connection) => {
  store.addEdge(params.source!, params.target!, params.sourceHandle || undefined, params.targetHandle || undefined)
  toast.add({ severity: 'success', summary: 'Conexión creada', life: 2000 })
})

// Handle node drag
onNodeDragStop(({ node }) => {
  store.updateNodePosition(node.id, node.position.x, node.position.y)
})

// Agregar nodo al canvas
const addNodeToCanvas = (type: NodeType) => {
  const x = 300 + Math.random() * 200
  const y = 100 + Math.random() * 200
  store.addNode(type, x, y)
  toast.add({ severity: 'info', summary: 'Nodo agregado', detail: `Se agregó un nodo de tipo ${type}`, life: 2000 })
}

// Seleccionar nodo
const onNodeClick = (event: { node: Node }) => {
  store.selectNode(event.node.id)
}

// Deseleccionar al hacer click en el canvas
const onPaneClick = () => {
  store.selectNode(null)
}

// Diálogos
const showApiKeyDialog = ref(false)
const showSaveDialog = ref(false)
const showExecutionDialog = ref(false)
const apiKeyInput = ref('')
const procesoNombre = ref('')
const procesoDescripcion = ref('')

const openApiKeyDialog = () => {
  apiKeyInput.value = store.groqApiKey
  showApiKeyDialog.value = true
}

const saveApiKey = () => {
  store.setApiKey(apiKeyInput.value)
  showApiKeyDialog.value = false
  toast.add({ severity: 'success', summary: 'API Key guardada', life: 2000 })
}

const openSaveDialog = () => {
  if (store.currentProceso) {
    procesoNombre.value = store.currentProceso.nombre
    procesoDescripcion.value = store.currentProceso.descripcion
  }
  showSaveDialog.value = true
}

const saveProceso = () => {
  store.saveProceso()
  showSaveDialog.value = false
  toast.add({ severity: 'success', summary: 'Proceso guardado', detail: 'Los cambios han sido guardados', life: 3000 })
}

// Ejecutar proceso
const executeProcess = async () => {
  if (store.nodes.length === 0) {
    toast.add({ severity: 'warn', summary: 'Sin nodos', detail: 'Agrega nodos al proceso para ejecutar', life: 3000 })
    return
  }
  showExecutionDialog.value = true
  try {
    await store.executeProcess()
    toast.add({ severity: 'success', summary: 'Ejecución completada', life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error de ejecución', detail: (error as Error).message, life: 5000 })
  }
}

const cancelExecution = () => {
  store.cancelExecution()
  toast.add({ severity: 'warn', summary: 'Ejecución cancelada', life: 2000 })
}

const getExecutionDuration = () => {
  if (!store.currentExecution?.endTime) return 0
  return new Date(store.currentExecution.endTime).getTime() - new Date(store.currentExecution.startTime).getTime()
}

// Exportar proceso
const exportProcess = () => {
  const json = store.exportToJson()
  if (json) {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proceso-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ severity: 'success', summary: 'Proceso exportado', life: 2000 })
  }
}

// Limpiar canvas
const clearCanvas = () => {
  store.clearCanvas()
  toast.add({ severity: 'info', summary: 'Canvas limpiado', life: 2000 })
}

// Inicializar
onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="process-editor surface-ground">
    <Toast position="top-right" />

    <!-- Header con estilo PrimeBlocks -->
    <Toolbar class="surface-card border-none shadow-2 px-4 py-3">
      <template #start>
        <div class="flex align-items-center gap-3">
          <div class="flex align-items-center justify-content-center bg-primary border-round" style="width: 2.5rem; height: 2.5rem;">
            <i class="pi pi-sitemap text-white text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-900 m-0">Editor de Procesos</h1>
            <p class="text-500 text-sm m-0">Diseña flujos de trabajo visuales</p>
          </div>
          <Tag v-if="store.currentProceso" :value="store.currentProceso.estado" severity="info" class="ml-3" />
        </div>
      </template>
      <template #end>
        <div class="flex align-items-center gap-2">
          <Button
            icon="pi pi-play"
            label="Ejecutar"
            severity="success"
            :loading="store.isExecuting"
            @click="executeProcess"
            v-tooltip.bottom="'Ejecutar proceso'"
          />
          <Divider layout="vertical" class="mx-1" />
          <Button
            icon="pi pi-key"
            severity="secondary"
            outlined
            @click="openApiKeyDialog"
            v-tooltip.bottom="'Configurar API Key'"
          />
          <Button
            icon="pi pi-trash"
            severity="secondary"
            outlined
            @click="clearCanvas"
            v-tooltip.bottom="'Limpiar canvas'"
          />
          <Button
            icon="pi pi-download"
            severity="secondary"
            outlined
            @click="exportProcess"
            v-tooltip.bottom="'Exportar JSON'"
          />
          <Divider layout="vertical" class="mx-1" />
          <Button
            icon="pi pi-save"
            label="Guardar"
            @click="openSaveDialog"
          />
        </div>
      </template>
    </Toolbar>

    <div class="editor-content flex flex-1 overflow-hidden">
      <!-- Sidebar izquierdo - Nodos disponibles (PrimeBlocks style) -->
      <aside class="nodes-sidebar surface-card border-right-1 surface-border" style="width: 300px;">
        <ScrollPanel style="width: 100%; height: 100%;">
          <div class="p-4">
            <div class="flex align-items-center gap-2 mb-4">
              <i class="pi pi-th-large text-primary"></i>
              <span class="font-semibold text-900 text-sm uppercase">Componentes</span>
            </div>

            <div v-for="cat in categorias" :key="cat.key" class="mb-4">
              <div class="flex align-items-center gap-2 mb-3 px-2">
                <i :class="cat.icon" class="text-500"></i>
                <span class="text-500 text-xs font-semibold uppercase letter-spacing-1">{{ cat.label }}</span>
              </div>

              <div class="flex flex-column gap-2">
                <div
                  v-for="nodeType in store.getNodesByCategoria(cat.key)"
                  :key="nodeType.type"
                  class="node-card surface-hover border-round-lg p-3 cursor-pointer transition-all transition-duration-200"
                  :style="{ '--node-color': nodeType.color }"
                  @click="addNodeToCanvas(nodeType.type)"
                  v-ripple
                >
                  <div class="flex align-items-center gap-3">
                    <div
                      class="node-icon flex align-items-center justify-content-center border-round-lg"
                      :style="{ background: nodeType.gradient, width: '44px', height: '44px' }"
                    >
                      <i :class="nodeType.icon" class="text-white text-xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-900 text-sm mb-1">{{ nodeType.label }}</div>
                      <div class="text-500 text-xs line-height-3 white-space-nowrap overflow-hidden text-overflow-ellipsis">
                        {{ nodeType.descripcion }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollPanel>
      </aside>

      <!-- Canvas central -->
      <main class="canvas-container flex-1">
        <VueFlow
          :nodes="vueFlowNodes"
          :edges="vueFlowEdges"
          :node-types="nodeTypes"
          :default-viewport="{ zoom: 1 }"
          :min-zoom="0.2"
          :max-zoom="2"
          fit-view-on-init
          @node-click="onNodeClick"
          @pane-click="onPaneClick"
          class="bg-gray-50"
        >
          <Background pattern-color="#dee2e6" :gap="20" />
          <Controls position="bottom-left" />
          <MiniMap position="bottom-right" />
        </VueFlow>
      </main>

      <!-- Panel de propiedades -->
      <PropertiesPanel v-if="store.selectedNode" />
    </div>

    <!-- Dialog API Key -->
    <Dialog
      v-model:visible="showApiKeyDialog"
      modal
      header="Configurar API Key de Groq"
      :style="{ width: '450px' }"
      :breakpoints="{ '640px': '90vw' }"
    >
      <div class="flex flex-column gap-4">
        <div class="surface-ground border-round p-3">
          <div class="flex align-items-center gap-2 mb-2">
            <i class="pi pi-info-circle text-primary"></i>
            <span class="font-semibold text-900">Información</span>
          </div>
          <p class="text-600 text-sm m-0 line-height-3">
            Ingresa tu API Key de Groq para habilitar los nodos de LLM.
            <a href="https://console.groq.com" target="_blank" class="text-primary font-medium">Obtener API Key</a>
          </p>
        </div>

        <div class="flex flex-column gap-2">
          <label for="apiKey" class="font-semibold text-900">API Key</label>
          <InputText
            id="apiKey"
            v-model="apiKeyInput"
            type="password"
            placeholder="gsk_..."
            class="w-full"
          />
        </div>

        <div v-if="store.groqApiKey" class="flex align-items-center gap-2 p-3 bg-green-50 border-round">
          <i class="pi pi-check-circle text-green-500"></i>
          <span class="text-green-700 font-medium">API Key configurada correctamente</span>
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showApiKeyDialog = false" />
        <Button label="Guardar" icon="pi pi-check" @click="saveApiKey" />
      </template>
    </Dialog>

    <!-- Dialog Guardar -->
    <Dialog
      v-model:visible="showSaveDialog"
      modal
      header="Guardar Proceso"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-4">
        <div class="flex flex-column gap-2">
          <label for="nombre" class="font-semibold text-900">Nombre del proceso *</label>
          <InputText
            id="nombre"
            v-model="procesoNombre"
            placeholder="Mi proceso"
            class="w-full"
          />
        </div>

        <div class="flex flex-column gap-2">
          <label for="descripcion" class="font-semibold text-900">Descripción</label>
          <Textarea
            id="descripcion"
            v-model="procesoDescripcion"
            rows="3"
            placeholder="Descripción del proceso..."
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="showSaveDialog = false" />
        <Button label="Guardar" icon="pi pi-save" @click="saveProceso" />
      </template>
    </Dialog>

    <!-- Dialog Ejecución -->
    <Dialog
      v-model:visible="showExecutionDialog"
      modal
      header="Resultados de Ejecución"
      :style="{ width: '700px' }"
      :closable="!store.isExecuting"
    >
      <div class="flex flex-column gap-4" v-if="store.currentExecution">
        <!-- Status header -->
        <div
          class="flex align-items-center gap-4 p-4 border-round-lg"
          :class="{
            'bg-blue-50 border-left-3 border-blue-500': store.currentExecution.status === 'running',
            'bg-green-50 border-left-3 border-green-500': store.currentExecution.status === 'completed',
            'bg-red-50 border-left-3 border-red-500': store.currentExecution.status === 'failed',
            'bg-yellow-50 border-left-3 border-yellow-500': store.currentExecution.status === 'cancelled'
          }"
        >
          <div class="flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
            <ProgressSpinner v-if="store.currentExecution.status === 'running'" style="width: 40px; height: 40px;" strokeWidth="4" />
            <i v-else-if="store.currentExecution.status === 'completed'" class="pi pi-check-circle text-green-500 text-4xl"></i>
            <i v-else-if="store.currentExecution.status === 'failed'" class="pi pi-times-circle text-red-500 text-4xl"></i>
            <i v-else class="pi pi-ban text-yellow-500 text-4xl"></i>
          </div>

          <div class="flex-1">
            <h4 class="m-0 mb-1 text-900 font-semibold">
              {{ store.currentExecution.status === 'running' ? 'Ejecutando...' :
                 store.currentExecution.status === 'completed' ? 'Completado' :
                 store.currentExecution.status === 'failed' ? 'Fallido' : 'Cancelado' }}
            </h4>
            <p class="m-0 text-600 text-sm">
              {{ store.executionResults.length }} nodos procesados
              <template v-if="store.currentExecution.endTime">
                en {{ getExecutionDuration() }}ms
              </template>
            </p>
          </div>

          <Button
            v-if="store.isExecuting"
            icon="pi pi-stop"
            label="Cancelar"
            severity="danger"
            size="small"
            @click="cancelExecution"
          />
        </div>

        <!-- Results list -->
        <div class="flex flex-column gap-2 max-h-20rem overflow-auto">
          <div
            v-for="result in store.executionResults"
            :key="result.nodeId"
            class="surface-card border-round-lg border-1 surface-border overflow-hidden"
            :class="{
              'border-left-3 border-green-500': result.status === 'success',
              'border-left-3 border-red-500': result.status === 'error',
              'border-left-3 border-blue-500': result.status === 'running',
              'border-left-3 border-300': result.status === 'pending'
            }"
          >
            <div class="flex align-items-center gap-3 p-3 surface-ground">
              <i v-if="result.status === 'pending'" class="pi pi-clock text-400"></i>
              <ProgressSpinner v-else-if="result.status === 'running'" style="width: 18px; height: 18px;" strokeWidth="4" />
              <i v-else-if="result.status === 'success'" class="pi pi-check text-green-500"></i>
              <i v-else-if="result.status === 'error'" class="pi pi-times text-red-500"></i>
              <i v-else class="pi pi-forward text-400"></i>

              <span class="font-medium text-900 flex-1">{{ result.nodeName }}</span>
              <Tag v-if="result.duration" :value="`${result.duration}ms`" severity="secondary" />
            </div>

            <div v-if="result.output || result.error" class="p-3 border-top-1 surface-border">
              <div v-if="result.error" class="flex align-items-start gap-2 text-red-600">
                <i class="pi pi-exclamation-triangle mt-1"></i>
                <span class="text-sm">{{ result.error }}</span>
              </div>
              <pre v-else class="m-0 text-sm surface-ground p-3 border-round overflow-auto" style="max-height: 150px;">{{ JSON.stringify(result.output, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- Final context -->
        <Panel
          v-if="!store.isExecuting && store.currentExecution.context && Object.keys(store.currentExecution.context).length > 0"
          header="Contexto Final"
          toggleable
          collapsed
        >
          <pre class="m-0 text-sm surface-ground p-3 border-round overflow-auto" style="max-height: 200px;">{{ JSON.stringify(store.currentExecution.context, null, 2) }}</pre>
        </Panel>
      </div>

      <template #footer>
        <Button label="Cerrar" icon="pi pi-times" @click="showExecutionDialog = false" :disabled="store.isExecuting" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped lang="scss">
.process-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.nodes-sidebar {
  overflow: hidden;
}

.node-card {
  border: 1px solid var(--surface-border);

  &:hover {
    border-color: var(--node-color, var(--primary-color));
    background: var(--surface-hover);
    transform: translateX(4px);
  }
}

.canvas-container {
  position: relative;
}

:deep(.vue-flow) {
  background: var(--surface-ground);
}

:deep(.vue-flow__edge-path) {
  stroke: var(--primary-color);
  stroke-width: 2;
}

:deep(.vue-flow__edge.selected .vue-flow__edge-path),
:deep(.vue-flow__edge:focus .vue-flow__edge-path),
:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  stroke: var(--primary-600);
  stroke-width: 3;
}

:deep(.vue-flow__connection-line) {
  stroke: var(--primary-color);
  stroke-width: 2;
  stroke-dasharray: 5;
}

:deep(.vue-flow__minimap) {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--surface-border);
}

:deep(.vue-flow__controls) {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 1px solid var(--surface-border);
}

:deep(.vue-flow__controls-button) {
  background: var(--surface-card);
  border: none;
  color: var(--text-color);

  &:hover {
    background: var(--surface-hover);
  }
}

.letter-spacing-1 {
  letter-spacing: 0.5px;
}
</style>
