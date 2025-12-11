import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ProcessNode,
  ProcessEdge,
  Proceso,
  NodeType,
  ProcessExecution,
  ExecutionResult,
  LlmConfig
} from '../types/process'
import { DEFAULT_CONFIGS, NODE_TYPES } from '../types/process'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'orca_procesos'
const EXECUTIONS_KEY = 'orca_executions'
const API_KEY_STORAGE = 'groq_api_key'

export const useProcessStore = defineStore('process', () => {
  // State
  const procesos = ref<Proceso[]>([])
  const currentProceso = ref<Proceso | null>(null)
  const nodes = ref<ProcessNode[]>([])
  const edges = ref<ProcessEdge[]>([])
  const selectedNode = ref<ProcessNode | null>(null)
  const isExecuting = ref(false)
  const currentExecution = ref<ProcessExecution | null>(null)
  const executionResults = ref<ExecutionResult[]>([])
  const groqApiKey = ref<string>('')

  // Computed
  const nodeTypes = computed(() => NODE_TYPES)

  const getNodesByCategoria = (categoria: string) => {
    return NODE_TYPES.filter(n => n.categoria === categoria)
  }

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as Proceso[]
        procesos.value = data.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }))
      }
      const apiKey = localStorage.getItem(API_KEY_STORAGE)
      if (apiKey) {
        groqApiKey.value = apiKey
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e)
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(procesos.value))
    } catch (e) {
      console.error('Error saving to localStorage:', e)
    }
  }

  // Initialize
  const init = () => {
    loadFromStorage()
    if (procesos.value.length === 0) {
      createProceso('Mi Primer Proceso', 'Proceso de ejemplo')
    }
    if (procesos.value.length > 0 && !currentProceso.value) {
      loadProceso(procesos.value[0].id)
    }
  }

  // Create proceso
  const createProceso = (nombre: string, descripcion: string): Proceso => {
    const proceso: Proceso = {
      id: `proc-${uuidv4().slice(0, 8)}`,
      nombre,
      descripcion,
      version: '1.0.0',
      estado: 'borrador',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    procesos.value.push(proceso)
    saveToStorage()
    return proceso
  }

  // Load proceso
  const loadProceso = (procesoId: string): boolean => {
    const proceso = procesos.value.find(p => p.id === procesoId)
    if (proceso) {
      currentProceso.value = { ...proceso }
      nodes.value = [...proceso.nodes]
      edges.value = [...proceso.edges]
      selectedNode.value = null
      return true
    }
    return false
  }

  // Add node
  const addNode = (type: NodeType, x: number, y: number): ProcessNode => {
    const metadata = NODE_TYPES.find(n => n.type === type)!
    const node: ProcessNode = {
      id: `node-${uuidv4().slice(0, 8)}`,
      type,
      label: metadata.label,
      config: DEFAULT_CONFIGS[type](),
      position: { x, y },
      inputVariables: [],
      outputVariable: `output_${type}`
    }
    nodes.value.push(node)
    autoSave()
    return node
  }

  // Update node
  const updateNode = (nodeId: string, updates: Partial<ProcessNode>) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
      if (selectedNode.value?.id === nodeId) {
        selectedNode.value = { ...nodes.value[index] }
      }
      autoSave()
    }
  }

  // Update node position
  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    updateNode(nodeId, { position: { x, y } })
  }

  // Delete node
  const deleteNode = (nodeId: string) => {
    nodes.value = nodes.value.filter(n => n.id !== nodeId)
    edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null
    }
    autoSave()
  }

  // Select node
  const selectNode = (nodeId: string | null) => {
    if (nodeId) {
      const node = nodes.value.find(n => n.id === nodeId)
      selectedNode.value = node || null
    } else {
      selectedNode.value = null
    }
  }

  // Add edge
  const addEdge = (source: string, target: string, sourceHandle?: string, targetHandle?: string) => {
    const exists = edges.value.some(e => e.source === source && e.target === target)
    if (exists) return null

    const edge: ProcessEdge = {
      id: `edge-${source}-${target}`,
      source,
      target,
      sourceHandle,
      targetHandle
    }
    edges.value.push(edge)
    autoSave()
    return edge
  }

  // Delete edge
  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter(e => e.id !== edgeId)
    autoSave()
  }

  // Save proceso
  const saveProceso = () => {
    if (!currentProceso.value) return

    const updated: Proceso = {
      ...currentProceso.value,
      nodes: nodes.value,
      edges: edges.value,
      updatedAt: new Date()
    }

    const index = procesos.value.findIndex(p => p.id === updated.id)
    if (index !== -1) {
      procesos.value[index] = updated
    }
    currentProceso.value = updated
    saveToStorage()
  }

  const autoSave = () => {
    saveProceso()
  }

  // Clear canvas
  const clearCanvas = () => {
    nodes.value = []
    edges.value = []
    selectedNode.value = null
    autoSave()
  }

  // Set API Key
  const setApiKey = (key: string) => {
    groqApiKey.value = key
    localStorage.setItem(API_KEY_STORAGE, key)
  }

  // Execute process
  const executeProcess = async (inputData?: Record<string, unknown>): Promise<ProcessExecution> => {
    if (nodes.value.length === 0) {
      throw new Error('El proceso no tiene nodos')
    }

    const execution: ProcessExecution = {
      id: `exec-${uuidv4().slice(0, 8)}`,
      procesoId: currentProceso.value?.id || '',
      startTime: new Date(),
      status: 'running',
      results: [],
      context: inputData || {}
    }

    isExecuting.value = true
    currentExecution.value = execution
    executionResults.value = []

    try {
      const orderedNodes = topologicalSort(nodes.value, edges.value)

      for (const node of orderedNodes) {
        const result = await executeNode(node, execution.context)
        execution.results.push(result)
        executionResults.value = [...executionResults.value, result]

        if (result.status === 'error') {
          const config = node.config as LlmConfig
          if (config.onError === 'fail') {
            execution.status = 'failed'
            break
          }
        }

        if (result.output !== undefined) {
          execution.context[node.outputVariable || node.id] = result.output
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed'
      }
    } catch (error) {
      execution.status = 'failed'
      console.error('Error executing process:', error)
    } finally {
      execution.endTime = new Date()
      isExecuting.value = false
      currentExecution.value = execution
      saveExecution(execution)
    }

    return execution
  }

  const executeNode = async (node: ProcessNode, context: Record<string, unknown>): Promise<ExecutionResult> => {
    const startTime = Date.now()
    const result: ExecutionResult = {
      nodeId: node.id,
      nodeName: node.label,
      status: 'running'
    }

    executionResults.value = [...executionResults.value.filter(r => r.nodeId !== node.id), result]

    try {
      let output: unknown

      switch (node.type) {
        case 'csv':
          output = await executeCsvNode(node)
          break
        case 'activo':
          output = await executeActivoNode(node)
          break
        case 'transformacion':
          output = await executeTransformacionNode(node, context)
          break
        case 'condicional':
          output = await executeCondicionalNode(node, context)
          break
        case 'llm':
          output = await executeLlmNode(node, context)
          break
        case 'matematico':
          output = await executeMatematicoNode(node, context)
          break
        case 'estado':
          output = await executeEstadoNode(node)
          break
        case 'branching':
          output = await executeBranchingNode(node, context)
          break
        case 'ml':
          output = await executeMlNode(node)
          break
        default:
          output = { message: `Nodo ${node.type} ejecutado` }
      }

      result.status = 'success'
      result.output = output
    } catch (error) {
      result.status = 'error'
      result.error = (error as Error).message
    }

    result.duration = Date.now() - startTime
    return result
  }

  // Node executors
  const executeCsvNode = async (node: ProcessNode) => {
    const config = node.config as { fileName: string; columns: string[] }
    return {
      fileName: config.fileName || 'datos.csv',
      columns: config.columns || ['nombre', 'email', 'status'],
      rows: [
        { nombre: 'Juan Pérez', email: 'juan@example.com', status: 'activo' },
        { nombre: 'María García', email: 'maria@example.com', status: 'activo' },
        { nombre: 'Carlos López', email: 'carlos@example.com', status: 'inactivo' }
      ],
      rowCount: 3
    }
  }

  const executeActivoNode = async (node: ProcessNode) => {
    const config = node.config as { activoId: string; activoNombre: string; area: string; criticidad: string }
    return {
      id: config.activoId || 'ACT-001',
      nombre: config.activoNombre || 'Activo de ejemplo',
      area: config.area || 'TI',
      criticidad: config.criticidad || 'media',
      valor: 50000,
      riesgoCalculado: 0.35
    }
  }

  const executeTransformacionNode = async (node: ProcessNode, context: Record<string, unknown>) => {
    const config = node.config as { operacion: string }
    const inputData = Object.values(context).find(v => Array.isArray(v)) || []

    switch (config.operacion) {
      case 'filtrar':
        return (inputData as unknown[]).filter(() => true)
      case 'mapear':
        return (inputData as unknown[]).map(item => ({ ...(item as object), transformed: true }))
      case 'agregar':
        return { count: (inputData as unknown[]).length, items: inputData }
      default:
        return inputData
    }
  }

  const executeCondicionalNode = async (node: ProcessNode, context: Record<string, unknown>) => {
    const config = node.config as { variable: string; operador: string; valor: string }
    const value = context[config.variable]

    let result = false
    switch (config.operador) {
      case '==': result = value == config.valor; break
      case '!=': result = value != config.valor; break
      case '>': result = Number(value) > Number(config.valor); break
      case '<': result = Number(value) < Number(config.valor); break
      case 'contains': result = String(value).includes(config.valor); break
    }

    return { condition: `${config.variable} ${config.operador} ${config.valor}`, result, branch: result ? 'true' : 'false' }
  }

  const executeLlmNode = async (node: ProcessNode, context: Record<string, unknown>) => {
    const config = node.config as LlmConfig

    let prompt = config.prompt || ''
    for (const [key, value] of Object.entries(context)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value))
    }

    if (!prompt) {
      return { message: 'Prompt vacío', response: null }
    }

    if (!groqApiKey.value) {
      return { error: 'API Key no configurada', response: null }
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey.value}`,
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
      const content = data.choices?.[0]?.message?.content || 'Sin respuesta'

      return {
        model: config.model,
        prompt: prompt.substring(0, 100) + '...',
        response: content,
        tokens: data.usage?.total_tokens || 0
      }
    } catch (error) {
      return {
        model: config.model,
        error: (error as Error).message,
        response: null
      }
    }
  }

  const executeMatematicoNode = async (node: ProcessNode, context: Record<string, unknown>) => {
    const config = node.config as { formula: string; precision: number }
    let formula = config.formula || '0'

    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'number') {
        formula = formula.replace(new RegExp(key, 'g'), String(value))
      }
    }

    try {
      const sanitized = formula.replace(/[^0-9+\-*/().]/g, '')
      const result = Function(`"use strict"; return (${sanitized})`)()
      return {
        formula: config.formula,
        result: Number(result.toFixed(config.precision || 2))
      }
    } catch {
      return { formula: config.formula, result: 0, error: 'Error en fórmula' }
    }
  }

  const executeEstadoNode = async (node: ProcessNode) => {
    const config = node.config as { tipoEstado: string; nombreEstado: string; mensaje: string }
    return {
      estado: config.tipoEstado,
      nombre: config.nombreEstado,
      mensaje: config.mensaje,
      timestamp: new Date().toISOString()
    }
  }

  const executeBranchingNode = async (node: ProcessNode, context: Record<string, unknown>) => {
    const config = node.config as { estrategia: string; cantidadRamas: number }
    return {
      estrategia: config.estrategia,
      ramas: config.cantidadRamas,
      contextoDistribuido: context
    }
  }

  const executeMlNode = async (node: ProcessNode) => {
    const config = node.config as { modeloNombre: string; tipoModelo: string }
    return {
      modelo: config.modeloNombre || 'Modelo ML',
      tipo: config.tipoModelo,
      prediccion: Math.random() > 0.5 ? 'positivo' : 'negativo',
      confianza: Math.random() * 0.4 + 0.6
    }
  }

  // Topological sort
  const topologicalSort = (nodeList: ProcessNode[], edgeList: ProcessEdge[]): ProcessNode[] => {
    const inDegree = new Map<string, number>()
    const adjacency = new Map<string, string[]>()

    nodeList.forEach(node => {
      inDegree.set(node.id, 0)
      adjacency.set(node.id, [])
    })

    edgeList.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
      adjacency.get(edge.source)?.push(edge.target)
    })

    const queue: string[] = []
    nodeList.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id)
      }
    })

    const result: ProcessNode[] = []
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      const node = nodeList.find(n => n.id === nodeId)
      if (node) result.push(node)

      adjacency.get(nodeId)?.forEach(targetId => {
        const newDegree = (inDegree.get(targetId) || 0) - 1
        inDegree.set(targetId, newDegree)
        if (newDegree === 0) {
          queue.push(targetId)
        }
      })
    }

    nodeList.forEach(node => {
      if (!result.find(n => n.id === node.id)) {
        result.push(node)
      }
    })

    return result
  }

  const saveExecution = (execution: ProcessExecution) => {
    try {
      const stored = localStorage.getItem(EXECUTIONS_KEY)
      const executions: ProcessExecution[] = stored ? JSON.parse(stored) : []
      executions.unshift(execution)
      const trimmed = executions.slice(0, 50)
      localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(trimmed))
    } catch (e) {
      console.error('Error saving execution:', e)
    }
  }

  const cancelExecution = () => {
    if (currentExecution.value && currentExecution.value.status === 'running') {
      currentExecution.value.status = 'cancelled'
      currentExecution.value.endTime = new Date()
      isExecuting.value = false
    }
  }

  // Export to JSON
  const exportToJson = (): string => {
    if (!currentProceso.value) return ''
    return JSON.stringify({
      ...currentProceso.value,
      nodes: nodes.value,
      edges: edges.value
    }, null, 2)
  }

  return {
    // State
    procesos,
    currentProceso,
    nodes,
    edges,
    selectedNode,
    isExecuting,
    currentExecution,
    executionResults,
    groqApiKey,
    // Computed
    nodeTypes,
    // Methods
    init,
    getNodesByCategoria,
    createProceso,
    loadProceso,
    addNode,
    updateNode,
    updateNodePosition,
    deleteNode,
    selectNode,
    addEdge,
    deleteEdge,
    saveProceso,
    clearCanvas,
    setApiKey,
    executeProcess,
    cancelExecution,
    exportToJson
  }
})
