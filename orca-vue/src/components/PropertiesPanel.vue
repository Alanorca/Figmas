<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProcessStore } from '../stores/processStore'
import { NODE_TYPES } from '../types/process'
import type { LlmConfig } from '../types/process'

// PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Slider from 'primevue/slider'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'
import InputNumber from 'primevue/inputnumber'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'
import Message from 'primevue/message'
import SelectButton from 'primevue/selectbutton'
import FloatLabel from 'primevue/floatlabel'

const store = useProcessStore()

const selectedNode = computed(() => store.selectedNode)
const metadata = computed(() => selectedNode.value ? NODE_TYPES.find(n => n.type === selectedNode.value!.type) : null)

// Opciones para selectores
const delimiterOptions = [
  { label: 'Coma (,)', value: ',' },
  { label: 'Punto y coma (;)', value: ';' },
  { label: 'Tab', value: '\t' },
  { label: 'Pipe (|)', value: '|' }
]

const criticidadOptions = [
  { label: 'Alta', value: 'alta' },
  { label: 'Media', value: 'media' },
  { label: 'Baja', value: 'baja' }
]

const operacionOptions = [
  { label: 'Mapear', value: 'mapear' },
  { label: 'Filtrar', value: 'filtrar' },
  { label: 'Agregar', value: 'agregar' },
  { label: 'Ordenar', value: 'ordenar' },
  { label: 'Enriquecer', value: 'enriquecer' },
  { label: 'Agrupar', value: 'agrupar' }
]

const operadorOptions = [
  { label: 'Igual (==)', value: '==' },
  { label: 'Diferente (!=)', value: '!=' },
  { label: 'Mayor (>)', value: '>' },
  { label: 'Menor (<)', value: '<' },
  { label: 'Mayor o igual (>=)', value: '>=' },
  { label: 'Menor o igual (<=)', value: '<=' },
  { label: 'Contiene', value: 'contains' },
  { label: 'Empieza con', value: 'startsWith' }
]

const estrategiaOptions = [
  { label: 'Paralela', value: 'paralela' },
  { label: 'Secuencial', value: 'secuencial' },
  { label: 'Prioridad', value: 'prioridad' },
  { label: 'Race', value: 'race' }
]

const tipoEstadoOptions = [
  { label: 'Éxito', value: 'success' },
  { label: 'Advertencia', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Pendiente', value: 'pending' },
  { label: 'Info', value: 'info' }
]

const tipoModeloOptions = [
  { label: 'Clasificación', value: 'clasificacion' },
  { label: 'Regresión', value: 'regresion' },
  { label: 'Clustering', value: 'clustering' },
  { label: 'Anomalías', value: 'anomalia' },
  { label: 'NLP', value: 'nlp' }
]

const llmModels = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Potente', icon: 'pi pi-bolt' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: 'Rápido', icon: 'pi pi-forward' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Balanceado', icon: 'pi pi-sliders-h' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', desc: 'Google', icon: 'pi pi-google' }
]

const onErrorOptions = [
  { label: 'Reintentar', value: 'retry', icon: 'pi pi-refresh' },
  { label: 'Omitir', value: 'skip', icon: 'pi pi-forward' },
  { label: 'Fallar', value: 'fail', icon: 'pi pi-times' }
]

// Métodos de actualización
const updateConfig = (updates: Record<string, unknown>) => {
  if (!selectedNode.value) return
  const newConfig = { ...selectedNode.value.config, ...updates }
  store.updateNode(selectedNode.value.id, { config: newConfig })
}

const updateLabel = (label: string) => {
  if (!selectedNode.value) return
  store.updateNode(selectedNode.value.id, { label })
}

const deleteNode = () => {
  if (!selectedNode.value) return
  store.deleteNode(selectedNode.value.id)
}

const duplicateNode = () => {
  if (!selectedNode.value) return
  const node = selectedNode.value
  const newNode = store.addNode(node.type, node.position.x + 50, node.position.y + 50)
  store.updateNode(newNode.id, {
    label: `${node.label} (copia)`,
    config: { ...node.config }
  })
}

const closePanel = () => {
  store.selectNode(null)
}

// Test mode para LLM
const testData = ref('')
const testResult = ref<{ success: boolean; data: unknown; error?: string } | null>(null)
const isTestRunning = ref(false)

const runTest = async () => {
  if (!selectedNode.value || selectedNode.value.type !== 'llm') return

  isTestRunning.value = true
  testResult.value = null

  try {
    const config = selectedNode.value.config as LlmConfig
    let prompt = config.prompt || ''

    try {
      const testDataParsed = JSON.parse(testData.value || '{}')
      for (const [key, value] of Object.entries(testDataParsed)) {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
      }
    } catch {
      // Si no es JSON válido, usar el prompt tal cual
    }

    if (!store.groqApiKey) {
      testResult.value = { success: false, data: null, error: 'API Key no configurada' }
      return
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${store.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: config.systemPrompt || '' },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2048
      })
    })

    const data = await response.json()
    testResult.value = {
      success: true,
      data: data.choices?.[0]?.message?.content || 'Sin respuesta'
    }
  } catch (error) {
    testResult.value = {
      success: false,
      data: null,
      error: (error as Error).message
    }
  } finally {
    isTestRunning.value = false
  }
}

// Helper para obtener valores de configuración de forma segura
const getConfigValue = <T>(key: string, defaultValue: T): T => {
  if (!selectedNode.value) return defaultValue
  const config = selectedNode.value.config as Record<string, unknown>
  return (config[key] as T) ?? defaultValue
}
</script>

<template>
  <aside class="properties-panel surface-card border-left-1 surface-border flex flex-column" v-if="selectedNode">
    <!-- Header -->
    <div class="panel-header p-4 surface-ground border-bottom-1 surface-border">
      <div class="flex align-items-start justify-content-between">
        <div class="flex align-items-center gap-3">
          <div
            class="flex align-items-center justify-content-center border-round-lg"
            :style="{ background: metadata?.gradient, width: '48px', height: '48px' }"
          >
            <i :class="metadata?.icon" class="text-white text-2xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-900 m-0 mb-1">{{ selectedNode.label }}</h3>
            <p class="text-500 text-sm m-0">{{ metadata?.descripcion }}</p>
          </div>
        </div>
        <Button icon="pi pi-times" text rounded severity="secondary" @click="closePanel" />
      </div>
    </div>

    <!-- Tabs -->
    <TabView class="flex-1 overflow-hidden panel-tabs">
      <!-- TAB: ENTRADA -->
      <TabPanel>
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-sign-in"></i>
            <span>Entrada</span>
          </div>
        </template>
        <div class="p-4">
          <div class="flex flex-column gap-3">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-arrow-right text-primary"></i>
              <span class="font-semibold text-900">Variables de entrada</span>
            </div>
            <p class="text-500 text-sm m-0 line-height-3">
              Variables disponibles de nodos anteriores conectados.
            </p>
            <Message severity="info" :closable="false" v-if="!selectedNode.inputVariables?.length">
              <template #icon>
                <i class="pi pi-info-circle"></i>
              </template>
              Conecta nodos anteriores para ver variables disponibles
            </Message>
          </div>
        </div>
      </TabPanel>

      <!-- TAB: SALIDA -->
      <TabPanel>
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-sign-out"></i>
            <span>Salida</span>
          </div>
        </template>
        <div class="p-4">
          <div class="flex flex-column gap-4">
            <div class="flex align-items-center gap-2 mb-2">
              <i class="pi pi-arrow-left text-primary"></i>
              <span class="font-semibold text-900">Variable de salida</span>
            </div>
            <div class="flex flex-column gap-2">
              <label for="outputVar" class="font-medium text-700">Nombre de la variable</label>
              <InputText
                id="outputVar"
                :modelValue="selectedNode.outputVariable"
                @update:modelValue="store.updateNode(selectedNode.id, { outputVariable: $event })"
                placeholder="output_nombre"
                class="w-full"
              />
              <small class="text-500">Otros nodos podrán acceder a este dato usando este nombre.</small>
            </div>
          </div>
        </div>
      </TabPanel>

      <!-- TAB: CONFIGURACIÓN -->
      <TabPanel>
        <template #header>
          <div class="flex align-items-center gap-2">
            <i class="pi pi-cog"></i>
            <span>Config</span>
          </div>
        </template>
        <div class="p-4 overflow-auto" style="max-height: calc(100vh - 300px);">
          <div class="flex flex-column gap-4">
            <!-- Etiqueta del nodo -->
            <div class="flex flex-column gap-2">
              <label class="font-semibold text-900">
                <i class="pi pi-tag mr-2 text-primary"></i>
                Etiqueta del nodo
              </label>
              <InputText
                :modelValue="selectedNode.label"
                @update:modelValue="updateLabel($event as string)"
                class="w-full"
              />
            </div>

            <Divider />

            <!-- CSV Config -->
            <template v-if="selectedNode.type === 'csv'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-file text-primary"></i>
                  <span class="font-semibold text-900">Configuración de archivo</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Nombre del archivo</label>
                  <InputText
                    :modelValue="getConfigValue('fileName', '')"
                    @update:modelValue="updateConfig({ fileName: $event })"
                    placeholder="datos.csv"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Delimitador</label>
                  <Select
                    :modelValue="getConfigValue('delimiter', ',')"
                    @update:modelValue="updateConfig({ delimiter: $event })"
                    :options="delimiterOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div class="flex align-items-center gap-2">
                  <Checkbox
                    :modelValue="getConfigValue('hasHeaders', true)"
                    @update:modelValue="updateConfig({ hasHeaders: $event })"
                    inputId="hasHeaders"
                    :binary="true"
                  />
                  <label for="hasHeaders" class="font-medium text-700">Tiene encabezados</label>
                </div>
              </div>
            </template>

            <!-- Activo Config -->
            <template v-if="selectedNode.type === 'activo'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-box text-primary"></i>
                  <span class="font-semibold text-900">Configuración del activo</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Área</label>
                  <InputText
                    :modelValue="getConfigValue('area', '')"
                    @update:modelValue="updateConfig({ area: $event })"
                    placeholder="Ej: Finanzas"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">ID del Activo</label>
                  <InputText
                    :modelValue="getConfigValue('activoId', '')"
                    @update:modelValue="updateConfig({ activoId: $event })"
                    placeholder="ACT-001"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Criticidad</label>
                  <Select
                    :modelValue="getConfigValue('criticidad', 'media')"
                    @update:modelValue="updateConfig({ criticidad: $event })"
                    :options="criticidadOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- Transformación Config -->
            <template v-if="selectedNode.type === 'transformacion'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-sync text-primary"></i>
                  <span class="font-semibold text-900">Configuración de transformación</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Operación</label>
                  <Select
                    :modelValue="getConfigValue('operacion', 'mapear')"
                    @update:modelValue="updateConfig({ operacion: $event })"
                    :options="operacionOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Expresión / Mapeo</label>
                  <Textarea
                    :modelValue="getConfigValue('expresion', '')"
                    @update:modelValue="updateConfig({ expresion: $event })"
                    rows="3"
                    placeholder="Escribe la expresión de mapeo..."
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- Condicional Config -->
            <template v-if="selectedNode.type === 'condicional'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-question-circle text-primary"></i>
                  <span class="font-semibold text-900">Configuración de condición</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Variable a evaluar</label>
                  <InputText
                    :modelValue="getConfigValue('variable', '')"
                    @update:modelValue="updateConfig({ variable: $event })"
                    placeholder="nombre_variable"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Operador</label>
                  <Select
                    :modelValue="getConfigValue('operador', '==')"
                    @update:modelValue="updateConfig({ operador: $event })"
                    :options="operadorOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Valor a comparar</label>
                  <InputText
                    :modelValue="getConfigValue('valor', '')"
                    @update:modelValue="updateConfig({ valor: $event })"
                    placeholder="valor"
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- LLM Config -->
            <template v-if="selectedNode.type === 'llm'">
              <div class="flex flex-column gap-4">
                <!-- Modelo -->
                <div class="flex flex-column gap-3">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-microchip-ai text-primary"></i>
                    <span class="font-semibold text-900">Modelo de IA</span>
                  </div>
                  <div class="grid">
                    <div
                      v-for="model in llmModels"
                      :key="model.id"
                      class="col-6"
                    >
                      <div
                        class="model-card p-3 border-round-lg cursor-pointer transition-all transition-duration-200"
                        :class="{ 'model-selected': getConfigValue('model', '') === model.id }"
                        @click="updateConfig({ model: model.id })"
                      >
                        <div class="flex align-items-center gap-2">
                          <i :class="model.icon" class="text-primary"></i>
                          <div>
                            <div class="font-semibold text-900 text-sm">{{ model.name }}</div>
                            <div class="text-500 text-xs">{{ model.desc }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- System Prompt -->
                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">System Prompt</label>
                  <Textarea
                    :modelValue="getConfigValue('systemPrompt', '')"
                    @update:modelValue="updateConfig({ systemPrompt: $event })"
                    rows="3"
                    placeholder="Eres un asistente experto en..."
                    class="w-full"
                  />
                </div>

                <!-- User Prompt -->
                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Prompt del usuario</label>
                  <Textarea
                    :modelValue="getConfigValue('prompt', '')"
                    @update:modelValue="updateConfig({ prompt: $event })"
                    rows="4"
                    placeholder="Analiza el siguiente contenido: {{variable}}"
                    class="w-full"
                  />
                </div>

                <!-- Parameters -->
                <div class="flex flex-column gap-3">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-sliders-h text-primary"></i>
                    <span class="font-semibold text-900">Parámetros</span>
                  </div>

                  <div class="flex flex-column gap-2">
                    <div class="flex justify-content-between align-items-center">
                      <label class="font-medium text-700">Temperatura</label>
                      <Tag :value="getConfigValue('temperature', 0.7).toString()" severity="secondary" />
                    </div>
                    <Slider
                      :modelValue="getConfigValue('temperature', 0.7)"
                      @update:modelValue="updateConfig({ temperature: $event })"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      class="w-full"
                    />
                    <small class="text-500">0 = Preciso, 2 = Creativo</small>
                  </div>

                  <div class="flex flex-column gap-2">
                    <div class="flex justify-content-between align-items-center">
                      <label class="font-medium text-700">Max Tokens</label>
                      <Tag :value="getConfigValue('maxTokens', 2048).toString()" severity="secondary" />
                    </div>
                    <Slider
                      :modelValue="getConfigValue('maxTokens', 2048)"
                      @update:modelValue="updateConfig({ maxTokens: $event })"
                      :min="256"
                      :max="8192"
                      :step="256"
                      class="w-full"
                    />
                  </div>
                </div>

                <!-- Error handling -->
                <div class="flex flex-column gap-3">
                  <div class="flex align-items-center gap-2">
                    <i class="pi pi-exclamation-triangle text-primary"></i>
                    <span class="font-semibold text-900">Manejo de errores</span>
                  </div>
                  <div class="flex gap-2">
                    <div
                      v-for="opt in onErrorOptions"
                      :key="opt.value"
                      class="error-option flex-1 p-3 border-round-lg text-center cursor-pointer transition-all"
                      :class="{ 'error-selected': getConfigValue('onError', 'retry') === opt.value }"
                      @click="updateConfig({ onError: opt.value })"
                    >
                      <i :class="opt.icon" class="block mb-2"></i>
                      <span class="text-sm font-medium">{{ opt.label }}</span>
                    </div>
                  </div>
                </div>

                <!-- Test Section -->
                <Card class="surface-ground">
                  <template #title>
                    <div class="flex align-items-center justify-content-between">
                      <div class="flex align-items-center gap-2">
                        <i class="pi pi-play text-primary"></i>
                        <span class="text-base">Modo de prueba</span>
                      </div>
                      <Button
                        label="Probar"
                        size="small"
                        :loading="isTestRunning"
                        @click="runTest"
                      />
                    </div>
                  </template>
                  <template #content>
                    <div class="flex flex-column gap-3">
                      <Textarea
                        v-model="testData"
                        rows="2"
                        placeholder='{"nombre": "Juan", "email": "juan@test.com"}'
                        class="w-full font-mono text-sm"
                      />
                      <Message v-if="testResult" :severity="testResult.success ? 'success' : 'error'" :closable="false">
                        <pre class="m-0 text-sm white-space-pre-wrap">{{ testResult.success ? testResult.data : testResult.error }}</pre>
                      </Message>
                    </div>
                  </template>
                </Card>
              </div>
            </template>

            <!-- Branching Config -->
            <template v-if="selectedNode.type === 'branching'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-share-alt text-primary"></i>
                  <span class="font-semibold text-900">Configuración de ramificación</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Cantidad de ramas</label>
                  <InputNumber
                    :modelValue="getConfigValue('cantidadRamas', 2)"
                    @update:modelValue="updateConfig({ cantidadRamas: $event })"
                    :min="2"
                    :max="10"
                    showButtons
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Estrategia de ejecución</label>
                  <Select
                    :modelValue="getConfigValue('estrategia', 'paralela')"
                    @update:modelValue="updateConfig({ estrategia: $event })"
                    :options="estrategiaOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- Estado Config -->
            <template v-if="selectedNode.type === 'estado'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-flag text-primary"></i>
                  <span class="font-semibold text-900">Configuración de estado</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Tipo de estado</label>
                  <Select
                    :modelValue="getConfigValue('tipoEstado', 'success')"
                    @update:modelValue="updateConfig({ tipoEstado: $event })"
                    :options="tipoEstadoOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Nombre del estado</label>
                  <InputText
                    :modelValue="getConfigValue('nombreEstado', '')"
                    @update:modelValue="updateConfig({ nombreEstado: $event })"
                    placeholder="Completado"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Mensaje</label>
                  <Textarea
                    :modelValue="getConfigValue('mensaje', '')"
                    @update:modelValue="updateConfig({ mensaje: $event })"
                    rows="2"
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- Matemático Config -->
            <template v-if="selectedNode.type === 'matematico'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-calculator text-primary"></i>
                  <span class="font-semibold text-900">Configuración matemática</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Fórmula</label>
                  <div class="flex gap-1 mb-2">
                    <Button icon="pi pi-plus" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + ' + ' })" />
                    <Button icon="pi pi-minus" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + ' - ' })" />
                    <Button label="×" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + ' * ' })" />
                    <Button label="÷" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + ' / ' })" />
                    <Button label="(" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + '(' })" />
                    <Button label=")" size="small" severity="secondary" outlined @click="updateConfig({ formula: getConfigValue('formula', '') + ')' })" />
                  </div>
                  <InputText
                    :modelValue="getConfigValue('formula', '')"
                    @update:modelValue="updateConfig({ formula: $event })"
                    placeholder="(a + b) * c"
                    class="w-full font-mono"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Precisión (decimales)</label>
                  <InputNumber
                    :modelValue="getConfigValue('precision', 2)"
                    @update:modelValue="updateConfig({ precision: $event })"
                    :min="0"
                    :max="10"
                    showButtons
                    class="w-full"
                  />
                </div>
              </div>
            </template>

            <!-- ML Config -->
            <template v-if="selectedNode.type === 'ml'">
              <div class="flex flex-column gap-4">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-chart-line text-primary"></i>
                  <span class="font-semibold text-900">Configuración de ML</span>
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Nombre del modelo</label>
                  <InputText
                    :modelValue="getConfigValue('modeloNombre', '')"
                    @update:modelValue="updateConfig({ modeloNombre: $event })"
                    placeholder="Mi modelo ML"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Tipo de modelo</label>
                  <Select
                    :modelValue="getConfigValue('tipoModelo', 'clasificacion')"
                    @update:modelValue="updateConfig({ tipoModelo: $event })"
                    :options="tipoModeloOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Endpoint / URL</label>
                  <InputText
                    :modelValue="getConfigValue('endpoint', '')"
                    @update:modelValue="updateConfig({ endpoint: $event })"
                    placeholder="https://api.ml/predict"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-column gap-2">
                  <label class="font-medium text-700">Campo de predicción</label>
                  <InputText
                    :modelValue="getConfigValue('outputField', '')"
                    @update:modelValue="updateConfig({ outputField: $event })"
                    placeholder="prediccion"
                    class="w-full"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Footer -->
    <div class="p-4 border-top-1 surface-border surface-ground flex gap-2">
      <Button
        icon="pi pi-copy"
        label="Duplicar"
        severity="secondary"
        outlined
        class="flex-1"
        @click="duplicateNode"
      />
      <Button
        icon="pi pi-trash"
        label="Eliminar"
        severity="danger"
        outlined
        class="flex-1"
        @click="deleteNode"
      />
    </div>
  </aside>
</template>

<style scoped lang="scss">
.properties-panel {
  width: 400px;
  height: 100%;
  overflow: hidden;
}

:deep(.panel-tabs) {
  display: flex;
  flex-direction: column;
  height: 100%;

  .p-tabview-panels {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }

  .p-tabview-panel {
    height: 100%;
    overflow: auto;
  }

  .p-tabview-nav {
    background: var(--surface-ground);
    border: none;
    padding: 0 1rem;
  }

  .p-tabview-nav-link {
    border: none !important;
    border-radius: 0;
    margin: 0;

    &:not(.p-disabled):focus-visible {
      box-shadow: none;
    }
  }

  .p-tabview-ink-bar {
    background: var(--primary-color);
  }
}

.model-card {
  border: 2px solid var(--surface-border);
  background: var(--surface-card);

  &:hover {
    border-color: var(--primary-200);
    background: var(--primary-50);
  }

  &.model-selected {
    border-color: var(--primary-color);
    background: var(--primary-50);
  }
}

.error-option {
  border: 2px solid var(--surface-border);
  background: var(--surface-card);
  color: var(--text-color-secondary);

  &:hover {
    border-color: var(--primary-200);
  }

  &.error-selected {
    border-color: var(--primary-color);
    background: var(--primary-50);
    color: var(--primary-color);
  }
}
</style>
