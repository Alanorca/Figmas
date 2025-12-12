import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vflow, Node, Edge, Connection } from 'ngx-vflow';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProcessService } from '../../services/process.service';
import { GroqService } from '../../services/groq.service';
import { NODE_TYPES_METADATA, ProcessNodeType, ProcessNode } from '../../models/process-nodes';

// Interfaces para el panel de configuracion
interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
}

interface Variable {
  name: string;
  type: string;
  source: string;
}

interface TestResult {
  success: boolean;
  data: unknown;
  error?: string;
}

@Component({
  selector: 'app-procesos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Vflow,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    TooltipModule,
    DividerModule,
    InputNumberModule,
    SliderModule,
    TagModule,
    TabsModule,
    BadgeModule,
    MessageModule,
    PanelModule,
    CheckboxModule,
    TableModule,
    MultiSelectModule
  ],
  templateUrl: './procesos.html',
  styleUrl: './procesos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesosComponent {
  processService = inject(ProcessService);
  groqService = inject(GroqService);

  // Metadata de tipos de nodos para el sidebar
  nodeTypes = NODE_TYPES_METADATA;

  // Tab activo en el panel de configuracion
  activeTab = signal<'input' | 'output' | 'config'>('config');

  // Variables seleccionadas para el nodo actual
  selectedVariables = signal<string[]>([]);

  // Schema de salida del nodo actual
  outputSchema = signal<SchemaField[]>([]);

  // Variables disponibles de nodos conectados
  availableVariables = signal<Variable[]>([
    { name: 'archivo.nombre', type: 'string', source: 'CSV' },
    { name: 'archivo.email', type: 'string', source: 'CSV' },
    { name: 'archivo.status', type: 'string', source: 'CSV' },
    { name: 'activo.id', type: 'string', source: 'Activo' },
    { name: 'activo.criticidad', type: 'string', source: 'Activo' },
    { name: 'activo.valor', type: 'number', source: 'Activo' }
  ]);

  // Test mode
  testData = '';
  testResult = signal<TestResult | null>(null);
  isTestRunning = signal(false);

  // Nodos y edges para ngx-vflow
  vflowNodes = computed<Node[]>(() => {
    return this.processService.nodes().map(node => ({
      id: node.id,
      point: { x: node.position.x, y: node.position.y },
      type: 'default',
      text: node.label,
      data: {
        nodeType: node.type,
        config: node.config
      }
    }));
  });

  vflowEdges = computed<Edge[]>(() => {
    return this.processService.edges().map(edge => ({
      id: edge.id,
      source: edge.sourceNodeId,
      target: edge.targetNodeId
    }));
  });

  // Estado del sidebar de configuracion
  showConfigSidebar = signal(false);

  // Dialog para API Key de Groq
  showApiKeyDialog = signal(false);
  apiKeyInput = signal('');

  // Dialog para guardar proceso
  showSaveDialog = signal(false);
  procesoNombre = signal('');
  procesoDescripcion = signal('');

  // Dialog para resultados de ejecucion
  showExecutionDialog = signal(false);

  // =============== NUEVAS PROPIEDADES V2 ===============
  sidebarCollapsed = signal(false);
  searchQuery = signal('');
  selectedNodeTypeToAdd = signal<string | null>(null);
  showPreviewPanel = signal(false);
  previewData = signal<Record<string, unknown>[]>([]);
  previewColumns = signal<string[]>([]);
  draggedNodeType = signal<ProcessNodeType | null>(null);

  // Opciones para el selector de nodos en toolbar
  nodeTypeOptions = NODE_TYPES_METADATA.map(n => ({
    label: n.title,
    value: n.type
  }));

  // Opciones para areas de activos
  areaOptions = [
    { label: 'TI (Tecnologia)', value: 'TI' },
    { label: 'RRHH (Recursos Humanos)', value: 'RRHH' },
    { label: 'Finanzas', value: 'FIN' },
    { label: 'Operaciones', value: 'OPS' },
    { label: 'Marketing', value: 'MKT' }
  ];

  // Opciones de activos por area (computed)
  activoOptions = computed(() => {
    const node = this.processService.selectedNode();
    if (!node) return [];
    const area = (node.config as unknown as Record<string, unknown>)['area'] as string;
    if (!area) return [];

    const activosPorArea: Record<string, { label: string; value: string }[]> = {
      'TI': [
        { label: 'Servidor Principal', value: 'servidor-principal' },
        { label: 'Base de Datos CRM', value: 'db-crm' },
        { label: 'Firewall Corporativo', value: 'firewall' }
      ],
      'RRHH': [
        { label: 'Sistema de Nomina', value: 'nomina' },
        { label: 'Portal de Empleados', value: 'portal-emp' }
      ],
      'FIN': [
        { label: 'Software Contable', value: 'contable' },
        { label: 'Sistema Facturacion', value: 'facturacion' }
      ],
      'OPS': [
        { label: 'Sistema Produccion', value: 'produccion' },
        { label: 'Control Inventario', value: 'inventario' }
      ],
      'MKT': [
        { label: 'CRM Marketing', value: 'crm-mkt' },
        { label: 'Plataforma Email', value: 'email-mkt' }
      ]
    };
    return activosPorArea[area] || [];
  });

  // Opciones de modelos LLM para selector
  llmModelOptions = this.groqService.getAvailableModels().map(m => ({
    label: m.name,
    value: m.id
  }));

  // =============== ASISTENTE IA ===============
  showAiAssistantModal = signal(false);
  aiMessages = signal<{ role: 'user' | 'assistant'; content: string }[]>([]);
  aiInputMessage = signal('');
  aiIsProcessing = signal(false);
  aiSuggestion = signal<{
    accion: 'crear_nodo' | 'conectar' | 'configurar' | 'ejecutar' | 'explicar';
    tipo_nodo?: string;
    configuracion?: Record<string, unknown>;
    explicacion?: string;
  } | null>(null);

  // Categorias de nodos para el sidebar
  categorias = [
    { key: 'datos', label: 'Datos', icon: 'database' },
    { key: 'procesamiento', label: 'Procesamiento', icon: 'settings' },
    { key: 'logica', label: 'Logica', icon: 'call_split' },
    { key: 'ia', label: 'Inteligencia Artificial', icon: 'psychology' },
    { key: 'estado', label: 'Estado', icon: 'flag' }
  ];

  // Opciones para selectores
  delimiterOptions = [
    { label: 'Coma (,)', value: ',' },
    { label: 'Punto y coma (;)', value: ';' },
    { label: 'Tab', value: '\t' },
    { label: 'Pipe (|)', value: '|' }
  ];

  criticidadOptions = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  operacionOptions = [
    { label: 'Mapear', value: 'mapear' },
    { label: 'Filtrar', value: 'filtrar' },
    { label: 'Agregar', value: 'agregar' },
    { label: 'Ordenar', value: 'ordenar' },
    { label: 'Enriquecer', value: 'enriquecer' },
    { label: 'Agrupar', value: 'agrupar' }
  ];

  operadorOptions = [
    { label: 'Igual (==)', value: '==' },
    { label: 'Diferente (!=)', value: '!=' },
    { label: 'Mayor (>)', value: '>' },
    { label: 'Menor (<)', value: '<' },
    { label: 'Mayor o igual (>=)', value: '>=' },
    { label: 'Menor o igual (<=)', value: '<=' },
    { label: 'Contiene', value: 'contains' },
    { label: 'Empieza con', value: 'startsWith' },
    { label: 'Termina con', value: 'endsWith' }
  ];

  estrategiaOptions = [
    { label: 'Paralela', value: 'paralela' },
    { label: 'Secuencial', value: 'secuencial' },
    { label: 'Prioridad', value: 'prioridad' },
    { label: 'Race (primera)', value: 'race' }
  ];

  tipoEstadoOptions = [
    { label: 'Exito', value: 'success' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Error', value: 'error' },
    { label: 'Pendiente', value: 'pending' },
    { label: 'Info', value: 'info' }
  ];

  tipoModeloOptions = [
    { label: 'Clasificacion', value: 'clasificacion' },
    { label: 'Regresion', value: 'regresion' },
    { label: 'Clustering', value: 'clustering' },
    { label: 'Deteccion de anomalias', value: 'anomalia' },
    { label: 'NLP', value: 'nlp' }
  ];

  // Modelos LLM disponibles
  llmModels = this.groqService.getAvailableModels();

  // Nodos filtrados por categoria
  getNodesByCategoria(categoria: string) {
    return this.nodeTypes.filter(n => n.categoria === categoria);
  }

  // Agregar nodo al canvas
  addNodeToCanvas(type: ProcessNodeType): void {
    const x = 200 + Math.random() * 200;
    const y = 100 + Math.random() * 200;
    this.processService.addNode(type, x, y);
  }

  // Manejar cuando se crea una conexion
  onConnect(connection: Connection): void {
    this.processService.addEdge(
      connection.source,
      connection.target,
      connection.sourceHandle,
      connection.targetHandle
    );
  }

  // Manejar seleccion de nodo
  onNodeSelect(nodeId: string): void {
    this.processService.selectNode(nodeId);
    this.showConfigSidebar.set(true);
    this.activeTab.set('config');

    // Cargar variables y schema del nodo seleccionado
    const node = this.processService.selectedNode();
    if (node) {
      const config = node.config as unknown as Record<string, unknown>;
      this.selectedVariables.set((config['selectedVariables'] as string[]) || []);
      this.outputSchema.set((config['outputSchema'] as SchemaField[]) || []);
    }
  }

  // Cerrar sidebar de configuracion
  closeConfigSidebar(): void {
    this.showConfigSidebar.set(false);
    this.processService.selectNode(null);
  }

  // Eliminar nodo seleccionado
  deleteSelectedNode(): void {
    const selected = this.processService.selectedNode();
    if (selected) {
      this.processService.deleteNode(selected.id);
      this.closeConfigSidebar();
    }
  }

  // Duplicar nodo seleccionado
  duplicateNode(): void {
    const selected = this.processService.selectedNode();
    if (selected) {
      const x = selected.position.x + 50;
      const y = selected.position.y + 50;
      this.processService.addNode(selected.type, x, y);
      const nodes = this.processService.nodes();
      const newNode = nodes[nodes.length - 1];
      if (newNode) {
        this.processService.updateNode(newNode.id, {
          label: `${selected.label} (copia)`,
          config: { ...selected.config }
        });
      }
    }
  }

  // Actualizar configuracion del nodo seleccionado
  updateNodeConfig(config: Record<string, unknown>): void {
    const selected = this.processService.selectedNode();
    if (selected) {
      this.processService.updateNode(selected.id, {
        config: { ...selected.config, ...config }
      });
    }
  }

  // Actualizar etiqueta del nodo
  updateNodeLabel(label: string): void {
    const selected = this.processService.selectedNode();
    if (selected) {
      this.processService.updateNode(selected.id, { label });
    }
  }

  // Tab management
  setActiveTab(tab: 'input' | 'output' | 'config'): void {
    this.activeTab.set(tab);
  }

  // Variables management
  isVariableSelected(name: string): boolean {
    return this.selectedVariables().includes(name);
  }

  toggleVariable(name: string): void {
    const current = this.selectedVariables();
    if (current.includes(name)) {
      this.selectedVariables.set(current.filter(v => v !== name));
    } else {
      this.selectedVariables.set([...current, name]);
    }
    this.updateNodeConfig({ selectedVariables: this.selectedVariables() });
  }

  getInputVariables(): string[] {
    return this.selectedVariables();
  }

  getContextPreview(): string {
    const selected = this.selectedVariables();
    if (selected.length === 0) {
      return '// Sin variables seleccionadas';
    }
    const obj: Record<string, string> = {};
    selected.forEach(v => {
      obj[v] = `<valor de ${v}>`;
    });
    return JSON.stringify(obj, null, 2);
  }

  // Schema management
  getOutputSchema(): SchemaField[] {
    return this.outputSchema();
  }

  addSchemaField(): void {
    const current = this.outputSchema();
    this.outputSchema.set([
      ...current,
      { name: '', type: 'string', required: false }
    ]);
    this.updateNodeConfig({ outputSchema: this.outputSchema() });
  }

  updateSchemaField(index: number, field: 'name' | 'type' | 'required', value: string | boolean): void {
    const current = [...this.outputSchema()];
    if (current[index]) {
      (current[index] as unknown as Record<string, unknown>)[field] = value;
      this.outputSchema.set(current);
      this.updateNodeConfig({ outputSchema: current });
    }
  }

  removeSchemaField(index: number): void {
    const current = this.outputSchema().filter((_, i) => i !== index);
    this.outputSchema.set(current);
    this.updateNodeConfig({ outputSchema: current });
  }

  // LLM helpers
  getProviderIcon(provider: string): string {
    const icons: Record<string, string> = {
      'groq': '⚡',
      'openai': '🤖',
      'anthropic': '🧠',
      'google': '🔮'
    };
    return icons[provider] || '🤖';
  }

  insertVariable(target: 'system' | 'user'): void {
    // TODO: Implementar insercion de variable con modal
    console.log('Insert variable to', target);
  }

  insertTemplate(target: 'system' | 'user', template: string): void {
    const templates: Record<string, string> = {
      'analyst': 'Eres un analista experto en riesgos empresariales. Tu tarea es analizar datos y proporcionar insights valiosos sobre posibles riesgos y vulnerabilidades.',
      'extractor': 'Eres un extractor de datos estructurados. Tu tarea es analizar el contenido proporcionado y extraer la informacion solicitada en formato JSON.'
    };
    if (target === 'system') {
      this.updateNodeConfig({ systemPrompt: templates[template] });
    }
  }

  insertVariableToPrompt(variable: string): void {
    const node = this.processService.selectedNode();
    if (node) {
      const currentPrompt = (node.config as unknown as Record<string, unknown>)['prompt'] as string || '';
      this.updateNodeConfig({ prompt: currentPrompt + ` {{${variable}}}` });
    }
  }

  // Test mode
  async runTest(): Promise<void> {
    this.isTestRunning.set(true);
    this.testResult.set(null);

    try {
      const testDataParsed = JSON.parse(this.testData || '{}');
      const node = this.processService.selectedNode();

      if (node?.type === 'llm') {
        const config = node.config as unknown as Record<string, unknown>;
        const prompt = (config['prompt'] as string || '').replace(/\{\{(\w+)\}\}/g, (_, key) => {
          return testDataParsed[key] || `[${key}]`;
        });

        const result = await this.groqService.ask(prompt, {
          model: config['model'] as string,
          temperature: config['temperature'] as number,
          maxTokens: config['maxTokens'] as number
        });

        this.testResult.set({
          success: true,
          data: result
        });
      } else {
        this.testResult.set({
          success: true,
          data: { message: 'Test ejecutado', input: testDataParsed }
        });
      }
    } catch (error) {
      this.testResult.set({
        success: false,
        data: null,
        error: (error as Error).message
      });
    } finally {
      this.isTestRunning.set(false);
    }
  }

  // Guardar proceso
  openSaveDialog(): void {
    const current = this.processService.currentProceso();
    if (current) {
      this.procesoNombre.set(current.nombre);
      this.procesoDescripcion.set(current.descripcion);
    }
    this.showSaveDialog.set(true);
  }

  saveProceso(): void {
    this.processService.saveProceso();
    this.showSaveDialog.set(false);
  }

  // Nuevo proceso
  newProceso(): void {
    this.processService.newProceso();
  }

  // Limpiar canvas
  clearCanvas(): void {
    this.processService.clearCanvas();
  }

  // Configuracion de API Key de Groq
  openApiKeyDialog(): void {
    this.apiKeyInput.set('');
    this.showApiKeyDialog.set(true);
  }

  saveApiKey(): void {
    const key = this.apiKeyInput();
    if (key) {
      this.groqService.setApiKey(key);
      this.showApiKeyDialog.set(false);
    }
  }

  // Exportar proceso
  exportProcess(): void {
    const json = this.processService.exportToJson();
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proceso-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  // Helper para obtener el icono del tipo de nodo
  getNodeIcon(type: ProcessNodeType): string {
    const meta = this.nodeTypes.find(n => n.type === type);
    return meta?.icon || 'help';
  }

  // Helper para obtener el color del tipo de nodo
  getNodeColor(type: ProcessNodeType): string {
    const meta = this.nodeTypes.find(n => n.type === type);
    return meta?.iconColor || '#757575';
  }

  // Helper para obtener gradiente del nodo
  getNodeGradient(type: ProcessNodeType): string {
    const color = this.getNodeColor(type);
    return `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
  }

  // Helper para oscurecer un color
  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  // Helper para obtener la descripcion del tipo de nodo
  getNodeDescription(type: ProcessNodeType): string {
    const meta = this.nodeTypes.find(n => n.type === type);
    return meta?.descripcion || '';
  }

  // Helper para acceder a propiedades del config de forma type-safe
  getConfigValue(node: ProcessNode, key: string): unknown {
    return (node.config as unknown as Record<string, unknown>)[key];
  }

  // =============== EJECUCION DEL PROCESO ===============

  async executeProcess(): Promise<void> {
    const nodes = this.processService.nodes();
    if (nodes.length === 0) {
      console.warn('No hay nodos para ejecutar');
      return;
    }

    this.showExecutionDialog.set(true);

    try {
      await this.processService.executeProcess();
    } catch (error) {
      console.error('Error ejecutando proceso:', error);
    }
  }

  cancelExecution(): void {
    this.processService.cancelExecution();
  }

  getExecutionDuration(execution: { startTime: Date; endTime?: Date }): number {
    if (!execution.endTime) return 0;
    const start = new Date(execution.startTime).getTime();
    const end = new Date(execution.endTime).getTime();
    return end - start;
  }

  // Helper para Object.keys en template
  Object = Object;

  // Helper para obtener metadata del nodo
  getNodeMeta(type: ProcessNodeType | undefined): { title: string; icon: string; color: string; descripcion: string } | null {
    if (!type) return null;
    const meta = this.nodeTypes.find(n => n.type === type);
    if (!meta) return null;
    return {
      title: meta.title,
      icon: meta.icon,
      color: meta.iconColor,
      descripcion: meta.descripcion
    };
  }

  // Helper para obtener preview del nodo
  getNodePreview(node: { data?: { nodeType?: ProcessNodeType; config?: Record<string, unknown> } }): string {
    const data = node.data;
    if (!data?.nodeType) return '';

    const config = data.config;
    if (!config) return '';

    // Mostrar preview basado en el tipo de nodo
    switch (data.nodeType) {
      case 'csv':
        return config['fileName'] as string || 'Sin archivo';
      case 'llm':
        return config['model'] as string || 'Sin modelo';
      case 'condicional':
        return `${config['variable'] || '?'} ${config['operador'] || '?'} ${config['valor'] || '?'}`;
      case 'transformacion':
        return config['operacion'] as string || 'Sin operación';
      case 'activo':
        return config['activoNombre'] as string || 'Sin activo';
      default:
        return '';
    }
  }

  // =============== ASISTENTE IA MODAL ===============

  openAiAssistant(): void {
    this.showAiAssistantModal.set(true);
    if (this.aiMessages().length === 0) {
      this.aiMessages.set([{
        role: 'assistant',
        content: 'Hola! Soy tu asistente para crear procesos. Puedo ayudarte a:\n\n- Crear nodos (CSV, LLM, condicional, etc.)\n- Configurar propiedades de nodos\n- Conectar nodos entre si\n- Explicar como funciona cada componente\n\nEjemplos:\n- "Crea un nodo CSV para leer datos.csv"\n- "Agrega un nodo LLM con el modelo llama-3.3-70b"\n- "Necesito un condicional que verifique si status == activo"'
      }]);
    }
  }

  closeAiAssistant(): void {
    this.showAiAssistantModal.set(false);
  }

  clearAiChat(): void {
    this.aiMessages.set([]);
    this.aiSuggestion.set(null);
  }

  async sendAiMessage(): Promise<void> {
    const message = this.aiInputMessage().trim();
    if (!message || this.aiIsProcessing()) return;

    // Agregar mensaje del usuario
    this.aiMessages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.aiInputMessage.set('');
    this.aiIsProcessing.set(true);
    this.aiSuggestion.set(null);

    try {
      const nodosActuales = this.processService.nodes().map(n => ({
        id: n.id,
        tipo: n.type,
        label: n.label
      }));

      const tiposDisponibles = this.nodeTypes.map(n => ({
        type: n.type,
        title: n.title,
        descripcion: n.descripcion,
        categoria: n.categoria
      }));

      const systemPrompt = `Eres un asistente experto en crear flujos de procesos visuales. Tu trabajo es ayudar al usuario a crear y configurar nodos de proceso.

TIPOS DE NODOS DISPONIBLES:
${JSON.stringify(tiposDisponibles, null, 2)}

NODOS ACTUALES EN EL CANVAS:
${JSON.stringify(nodosActuales, null, 2)}

INSTRUCCIONES:
1. Analiza lo que el usuario quiere hacer
2. Responde SIEMPRE en formato JSON con la siguiente estructura:
{
  "accion": "crear_nodo" | "conectar" | "configurar" | "ejecutar" | "explicar",
  "tipo_nodo": "csv" | "activo" | "transformacion" | "condicional" | "llm" | "branching" | "estado" | "matematico" | "ml" (solo para crear_nodo),
  "configuracion": { ... propiedades del nodo ... },
  "explicacion": "Texto explicativo para el usuario"
}

CONFIGURACIONES POR TIPO DE NODO:
- csv: { fileName: string, delimiter: string, hasHeaders: boolean }
- activo: { area: string, activoId: string, criticidad: "alta"|"media"|"baja" }
- transformacion: { operacion: "mapear"|"filtrar"|"agregar"|"ordenar", expresion: string }
- condicional: { variable: string, operador: "=="|"!="|">"|"<"|"contains", valor: string }
- llm: { model: string, systemPrompt: string, prompt: string, temperature: number, maxTokens: number }
- branching: { cantidadRamas: number, estrategia: "paralela"|"secuencial" }
- estado: { tipoEstado: "success"|"warning"|"error", nombreEstado: string, mensaje: string }
- matematico: { formula: string, precision: number }
- ml: { modeloNombre: string, tipoModelo: string, endpoint: string }

Responde UNICAMENTE con el JSON, sin texto adicional ni markdown.`;

      const response = await this.groqService.ask(message, {
        model: 'llama-3.3-70b-versatile',
        systemPrompt,
        temperature: 0.3,
        maxTokens: 1024
      });

      // Extraer JSON de la respuesta
      let jsonResponse;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        jsonResponse = {
          accion: 'explicar',
          explicacion: response
        };
      }

      // Guardar la sugerencia
      this.aiSuggestion.set(jsonResponse);

      // Agregar respuesta del asistente
      const assistantMessage = jsonResponse.explicacion ||
        (jsonResponse.accion === 'crear_nodo' ? `Puedo crear un nodo de tipo "${jsonResponse.tipo_nodo}" con la configuracion propuesta. ¿Deseas aplicarlo?` :
        jsonResponse.accion === 'configurar' ? 'Configuracion lista para aplicar. ¿Deseas aplicarla?' :
        'Listo para ejecutar la accion.');

      this.aiMessages.update(msgs => [...msgs, { role: 'assistant', content: assistantMessage }]);

    } catch (error) {
      console.error('Error en asistente IA:', error);
      this.aiMessages.update(msgs => [...msgs, {
        role: 'assistant',
        content: `Error: ${(error as Error).message}. Verifica que la API Key de Groq este configurada.`
      }]);
    } finally {
      this.aiIsProcessing.set(false);
    }
  }

  aplicarSugerenciaAi(): void {
    const sugerencia = this.aiSuggestion();
    if (!sugerencia) return;

    if (sugerencia.accion === 'crear_nodo' && sugerencia.tipo_nodo) {
      // Crear el nodo
      const x = 300 + Math.random() * 200;
      const y = 150 + Math.random() * 150;
      this.processService.addNode(sugerencia.tipo_nodo as ProcessNodeType, x, y);

      // Obtener el nodo recien creado y aplicar configuracion
      const nodes = this.processService.nodes();
      const newNode = nodes[nodes.length - 1];
      if (newNode && sugerencia.configuracion) {
        this.processService.updateNode(newNode.id, {
          config: { ...newNode.config, ...sugerencia.configuracion }
        });
      }

      this.aiMessages.update(msgs => [...msgs, {
        role: 'assistant',
        content: `Nodo "${sugerencia.tipo_nodo}" creado exitosamente con la configuracion aplicada.`
      }]);
    } else if (sugerencia.accion === 'configurar' && sugerencia.configuracion) {
      const selected = this.processService.selectedNode();
      if (selected) {
        this.processService.updateNode(selected.id, {
          config: { ...selected.config, ...sugerencia.configuracion }
        });
        this.aiMessages.update(msgs => [...msgs, {
          role: 'assistant',
          content: 'Configuracion aplicada al nodo seleccionado.'
        }]);
      } else {
        this.aiMessages.update(msgs => [...msgs, {
          role: 'assistant',
          content: 'No hay nodo seleccionado. Selecciona un nodo primero.'
        }]);
      }
    } else if (sugerencia.accion === 'ejecutar') {
      this.executeProcess();
      this.closeAiAssistant();
    }

    this.aiSuggestion.set(null);
  }

  getAiActionLabel(): string {
    const sugerencia = this.aiSuggestion();
    if (!sugerencia) return 'Aplicar';

    switch (sugerencia.accion) {
      case 'crear_nodo': return `Crear ${sugerencia.tipo_nodo}`;
      case 'configurar': return 'Aplicar config';
      case 'ejecutar': return 'Ejecutar proceso';
      default: return 'Aplicar';
    }
  }

  // =============== METODOS NUEVOS V2 ===============

  // Drag and drop de nodos
  onDragStart(event: DragEvent, type: ProcessNodeType): void {
    this.draggedNodeType.set(type);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('text/plain', type);
    }
  }

  onDragEnd(_event: DragEvent): void {
    this.draggedNodeType.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const type = this.draggedNodeType();
    if (type) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      this.processService.addNode(type, x, y);
    }
    this.draggedNodeType.set(null);
  }

  // Selector de nodos en toolbar
  onNodeTypeSelect(event: { value: string }): void {
    if (event.value) {
      this.addNodeToCanvas(event.value as ProcessNodeType);
      this.selectedNodeTypeToAdd.set(null);
    }
  }

  // Zoom controls
  zoomIn(): void {
    console.log('Zoom in');
  }

  zoomOut(): void {
    console.log('Zoom out');
  }

  fitView(): void {
    console.log('Fit view');
  }

  toggleLayers(): void {
    console.log('Toggle layers');
  }

  // Preview de datos
  previewDataFn(nodeId: string): void {
    console.log('Preview data for node:', nodeId);
    // Datos de ejemplo
    this.previewData.set([
      { nombre: 'Juan Perez', email: 'juan@test.com', status: 'activo' },
      { nombre: 'Maria Garcia', email: 'maria@test.com', status: 'pendiente' },
      { nombre: 'Carlos Lopez', email: 'carlos@test.com', status: 'activo' }
    ]);
    this.previewColumns.set(['nombre', 'email', 'status']);
    this.showPreviewPanel.set(true);
  }

  loadData(): void {
    console.log('Loading data...');
  }

  vincularActivo(): void {
    console.log('Vinculando activo...');
  }

  appendToFormula(op: string): void {
    const node = this.processService.selectedNode();
    if (node) {
      const current = (node.config as unknown as Record<string, unknown>)['formula'] as string || '';
      this.updateNodeConfig({ formula: current + op });
    }
  }

  guardarConfiguracionColumnas(): void {
    console.log('Guardando configuracion de columnas...');
    this.showPreviewPanel.set(false);
  }

  // Eliminar y duplicar nodos por ID
  deleteNodeById(nodeId: string): void {
    this.processService.deleteNode(nodeId);
  }

  duplicateNodeById(nodeId: string): void {
    const node = this.processService.nodes().find(n => n.id === nodeId);
    if (node) {
      const x = node.position.x + 50;
      const y = node.position.y + 50;
      this.processService.addNode(node.type, x, y);
      const nodes = this.processService.nodes();
      const newNode = nodes[nodes.length - 1];
      if (newNode) {
        this.processService.updateNode(newNode.id, {
          label: `${node.label} (copia)`,
          config: { ...node.config }
        });
      }
    }
  }

  // Helper para obtener el fondo del icono del nodo
  getNodeIconBg(type: ProcessNodeType): string {
    const color = this.getNodeColor(type);
    return `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 15)} 100%)`;
  }
}
