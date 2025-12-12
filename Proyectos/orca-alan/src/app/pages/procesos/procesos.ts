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
    CheckboxModule
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
  getNodeMeta(type: ProcessNodeType | undefined): { title: string; icon: string; color: string } | null {
    if (!type) return null;
    const meta = this.nodeTypes.find(n => n.type === type);
    if (!meta) return null;
    return {
      title: meta.title,
      icon: meta.icon,
      color: meta.iconColor
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
}
