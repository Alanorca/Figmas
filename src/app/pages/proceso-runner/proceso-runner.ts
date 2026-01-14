import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ProcessService, ExecutionVariable, ProcessExecution } from '../../services/process.service';
import { Proceso, ProcessNode } from '../../models/process-nodes';

/**
 * Node display item for the flow visualization
 */
interface FlowNodeItem {
  id: string;
  name: string;
  nodeType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  executionOrder: number;
  outputData?: unknown;
  errorMessage?: string;
  duration?: number;
}

/**
 * Branch information for decision nodes
 */
interface FlowBranch {
  id: string;
  label: string;
  isDefault: boolean;
  nodes: FlowGraphNode[];
}

/**
 * Extended node item for graph visualization with branches
 */
interface FlowGraphNode extends FlowNodeItem {
  isDecision: boolean;
  branches?: FlowBranch[];
  nextNode?: FlowGraphNode | null;
}

/**
 * Storage destination type
 */
type StorageDestination = 'none' | 'process' | 'objective' | 'kpi' | 'asset' | 'risk_appetite';
type StorageMode = 'replace' | 'append';
type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'always';
type CreatableEntityType = 'risk' | 'incident' | 'defect';

interface StorageCondition {
  enabled: boolean;
  operator: ConditionOperator;
  compareValue?: string | number | boolean;
  variableKey?: string;
}

interface EntityFieldMapping {
  targetField: string;
  sourceType: 'variable' | 'manual';
  variableKey?: string;
  manualValue?: string | number | boolean;
}

interface EntityCreationConfig {
  enabled: boolean;
  entityType: CreatableEntityType;
  condition: StorageCondition;
  fieldMappings: EntityFieldMapping[];
  eventStatusId?: number;
  eventSubTypeId?: number;
  initialSeverityId?: number;
  propagationLevelId?: number;
  probabilityLevelId?: number;
  impactLevelId?: number;
  titleTemplate?: string;
  descriptionTemplate?: string;
  subTypePropertyMappings?: SubTypePropertyMapping[];
}

interface SubTypePropertyMapping {
  propertyId: number;
  propertyCode: string;
  propertyName: string;
  dataTypeCode: string;
  sourceType: 'variable' | 'manual';
  variableKey?: string;
  manualValue?: string | number | boolean;
}

interface OutputVariableStorageConfig {
  variableKey: string;
  destination: StorageDestination;
  sourceType: 'variable' | 'manual';
  manualValue?: string | number | boolean;
  condition: StorageCondition;
  assetId?: number;
  assetPropertyId?: number;
  assetStandardProperty?: string;
  assetPropertyType?: 'standard' | 'custom';
  processPropertyKey?: string;
  objectiveId?: number;
  objectiveProperty?: string;
  kpiObjectiveId?: number;
  kpiId?: number;
  kpiProperty?: string;
  riskAppetiteProperty?: string;
  mode: StorageMode;
}

interface OutputVariableDefinition {
  key: string;
  nodeId: string;
  nodeName: string;
  nodeTypeCode: string;
}

@Component({
  selector: 'app-proceso-runner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
    DialogModule,
    ProgressBarModule,
    SelectModule,
    SelectButtonModule,
    CheckboxModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    TabsModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './proceso-runner.html',
  styleUrl: './proceso-runner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesoRunnerComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private processService = inject(ProcessService);
  private messageService = inject(MessageService);

  private readonly STORAGE_CONFIG_KEY = 'proceso-runner-config';

  // Signals
  processId = signal<string | null>(null);
  process = signal<Proceso | null>(null);
  isLoading = signal(false);
  showOutputDialog = signal(false);
  selectedNodeOutput = signal<unknown>(null);
  selectedNodeName = signal('');
  showVariableDialog = signal(false);
  selectedVariable = signal<ExecutionVariable | null>(null);
  showErrorDialog = signal(false);
  showConfigModal = signal(false);
  showContextDialog = signal(false);
  selectedExecution = signal<{ id: string; status: string; startTime?: Date; endTime?: Date } | null>(null);

  // Master-detail selection signals
  selectedVariableKey = signal<string | null>(null);
  selectedExecutionId = signal<string | null>(null);

  // Search filters
  variableSearchTerm = signal('');
  executionSearchTerm = signal('');
  variableTypeFilter = signal<string | null>(null);
  executionStatusFilter = signal<string | null>(null);

  // Filter options
  variableTypeFilterOptions = [
    { label: 'Todos los tipos', value: null },
    { label: 'Objeto', value: 'object' },
    { label: 'Numero', value: 'number' },
    { label: 'Texto', value: 'string' },
    { label: 'Booleano', value: 'boolean' },
    { label: 'Array', value: 'array' }
  ];

  executionStatusFilterOptions = [
    { label: 'Todos', value: null },
    { label: 'Completado', value: 'completed' },
    { label: 'Fallido', value: 'failed' },
    { label: 'En ejecucion', value: 'running' }
  ];

  // Storage configuration
  outputVariableDefinitions = signal<OutputVariableDefinition[]>([]);
  storageConfigs = signal<OutputVariableStorageConfig[]>([]);
  showConfigPanel = signal(true);

  // Entity creation configuration
  entityCreationConfigs = signal<EntityCreationConfig[]>([]);
  showEntityCreationPanel = signal(true);

  // Demo mode to show different states
  demoMode = signal(true);

  // ========== ZOOM Y PAN DEL FLUJO ==========
  zoom = signal<number>(1);
  panX = signal<number>(0);
  panY = signal<number>(0);
  isPanning = signal<boolean>(false);
  private lastPanPosition = { x: 0, y: 0 };

  readonly MIN_ZOOM = 0.25;
  readonly MAX_ZOOM = 2;
  readonly ZOOM_STEP = 0.1;

  // Transform computed para el canvas del flujo
  flowTransform = computed(() => {
    return `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`;
  });

  // Zoom percentage para mostrar en controles
  zoomPercentage = computed(() => Math.round(this.zoom() * 100));

  // Computed from service
  currentExecution = computed(() => {
    if (this.demoMode()) {
      return {
        id: 'exec-demo-001',
        status: 'failed',
        startTime: new Date(),
        endTime: new Date()
      };
    }
    return this.processService.currentExecution();
  });
  isExecuting = computed(() => this.processService.isExecuting());
  executionProgress = computed(() => this.demoMode() ? 60 : this.processService.executionProgress());
  currentExecutingNode = computed(() => this.processService.currentExecutingNode());
  executionVariables = computed(() => {
    if (this.demoMode()) {
      return [
        { key: 'resultado_csv', value: { rows: 150, processed: true }, type: 'object', typeLabel: 'Objeto', preview: '{ rows: 150, processed: true }' },
        { key: 'score_ml', value: 0.87, type: 'number', typeLabel: 'Numero', preview: '0.87' },
        { key: 'alerta_detectada', value: true, type: 'boolean', typeLabel: 'Booleano', preview: 'true' }
      ] as ExecutionVariable[];
    }
    return this.processService.executionVariables();
  });
  executionResults = computed(() => this.processService.executionResults());
  executionHistory = computed(() => {
    if (this.demoMode()) {
      const now = new Date();
      return [
        { id: 'exec-001-abc', status: 'failed', startTime: now, endTime: new Date(now.getTime() + 32000) },
        { id: 'exec-002-def', status: 'completed', startTime: new Date(now.getTime() - 3600000), endTime: new Date(now.getTime() - 3600000 + 45000) },
        { id: 'exec-003-ghi', status: 'completed', startTime: new Date(now.getTime() - 7200000), endTime: new Date(now.getTime() - 7200000 + 28000) },
        { id: 'exec-004-jkl', status: 'completed', startTime: new Date(now.getTime() - 86400000), endTime: new Date(now.getTime() - 86400000 + 52000) },
      ];
    }
    return this.processService.executionHistory();
  });
  nodes = computed(() => this.processService.nodes());

  // Flow nodes for visualization
  flowNodes = computed<FlowNodeItem[]>(() => {
    const allNodes = this.nodes();
    const results = this.executionResults();
    const currentNode = this.currentExecutingNode();

    // Demo mode: show mock nodes with different states
    if (this.demoMode() && allNodes.length === 0) {
      return [
        { id: '1', name: 'Leer CSV', nodeType: 'csv', status: 'completed', executionOrder: 1, outputData: { rows: 150 }, duration: 1200 },
        { id: '2', name: 'Transformar Datos', nodeType: 'transformacion', status: 'completed', executionOrder: 2, outputData: { transformed: true }, duration: 850 },
        { id: '3', name: 'Modelo ML', nodeType: 'ml', status: 'failed', executionOrder: 3, errorMessage: 'Error de conexion: No se pudo conectar al servidor de ML. Timeout despues de 30 segundos.', duration: 30000 },
        { id: '4', name: 'Enviar Alerta', nodeType: 'webhook', status: 'pending', executionOrder: 4 },
        { id: '5', name: 'Actualizar KPI', nodeType: 'kpi', status: 'pending', executionOrder: 5 }
      ];
    }

    if (!allNodes.length) return [];

    const sortedNodes = [...allNodes].sort((a, b) => {
      const xA = a.position?.x ?? 0;
      const xB = b.position?.x ?? 0;
      return xA - xB;
    });

    return sortedNodes.map((node, index) => {
      const result = results.find(r => r.nodeId === node.id);
      let status: FlowNodeItem['status'] = 'pending';

      if (result) {
        status = result.status === 'success' ? 'completed' :
                 result.status === 'error' ? 'failed' :
                 result.status === 'skipped' ? 'skipped' :
                 result.status === 'running' ? 'running' : 'pending';
      } else if (currentNode?.id === node.id) {
        status = 'running';
      }

      return {
        id: node.id,
        name: node.label || this.getNodeTypeName(node.type),
        nodeType: node.type,
        status,
        executionOrder: index + 1,
        outputData: result?.output,
        errorMessage: result?.error,
        duration: result?.duration
      };
    });
  });

  // Flow graph with branches for decision nodes
  flowGraph = computed<FlowGraphNode[]>(() => {
    const allNodes = this.nodes();
    const flowNodeItems = this.flowNodes();

    // In demo mode with no real nodes, return flowNodes as linked linear graph
    if (this.demoMode() && !allNodes.length && flowNodeItems.length > 0) {
      const demoNodes: FlowGraphNode[] = flowNodeItems.map(n => ({
        ...n,
        isDecision: n.nodeType === 'condicional' || n.nodeType === 'branching',
        nextNode: null
      }));
      // Link nodes together
      for (let i = 0; i < demoNodes.length - 1; i++) {
        demoNodes[i].nextNode = demoNodes[i + 1];
      }
      // Return only the first node as root (the rest are linked via nextNode)
      return [demoNodes[0]];
    }

    if (!allNodes.length) return [];

    const nodeMap = new Map<string, FlowGraphNode>();

    flowNodeItems.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        isDecision: node.nodeType === 'condicional' || node.nodeType === 'branching'
      });
    });

    // Build the graph structure
    const rootNodes: FlowGraphNode[] = [];
    const processedIds = new Set<string>();

    const buildGraph = (nodeId: string): FlowGraphNode | null => {
      if (processedIds.has(nodeId)) return nodeMap.get(nodeId) || null;
      processedIds.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const originalNode = allNodes.find(n => n.id === nodeId);
      const nodeConfig = originalNode?.config as unknown as Record<string, unknown> | undefined;

      if (node.isDecision && nodeConfig?.['branches']) {
        const branches = nodeConfig['branches'] as Array<{ id: string; label: string; isDefault?: boolean; targetNodeId?: string }>;
        node.branches = branches.map((branch) => ({
          id: branch.id,
          label: branch.label,
          isDefault: branch.isDefault || false,
          nodes: branch.targetNodeId ? [buildGraph(branch.targetNodeId)].filter(Boolean) as FlowGraphNode[] : []
        }));
      } else if (nodeConfig?.['nextNodeId']) {
        node.nextNode = buildGraph(nodeConfig['nextNodeId'] as string);
      }

      return node;
    };

    // Find root nodes (nodes with no incoming connections)
    const connectedTargets = new Set<string>();
    allNodes.forEach(node => {
      const cfg = node.config as unknown as Record<string, unknown>;
      if (cfg?.['nextNodeId']) connectedTargets.add(cfg['nextNodeId'] as string);
      if (cfg?.['branches']) {
        (cfg['branches'] as Array<{ targetNodeId?: string }>).forEach((b) => {
          if (b.targetNodeId) connectedTargets.add(b.targetNodeId);
        });
      }
    });

    allNodes.forEach(node => {
      if (!connectedTargets.has(node.id)) {
        const graphNode = buildGraph(node.id);
        if (graphNode) rootNodes.push(graphNode);
      }
    });

    return rootNodes.length > 0 ? rootNodes : flowNodeItems.map(n => ({
      ...n,
      isDecision: n.nodeType === 'condicional' || n.nodeType === 'branching'
    }));
  });

  hasBranches = computed(() => this.flowGraph().some(n => n.isDecision && n.branches?.length));

  currentNode = computed(() => this.flowNodes().find(n => n.status === 'running') || null);
  failedNode = computed(() => this.flowNodes().find(n => n.status === 'failed') || null);
  canStartExecution = computed(() => !this.isExecuting() && this.nodes().length > 0);

  // Computed: filtered variables for search
  filteredVariables = computed(() => {
    const term = this.variableSearchTerm().toLowerCase().trim();
    const typeFilter = this.variableTypeFilter();
    let variables = this.executionVariables();

    // Filter by type
    if (typeFilter) {
      variables = variables.filter(v => v.type === typeFilter);
    }

    // Filter by search term
    if (term) {
      variables = variables.filter(v =>
        v.key.toLowerCase().includes(term) ||
        v.typeLabel.toLowerCase().includes(term) ||
        (v.preview && v.preview.toLowerCase().includes(term))
      );
    }

    return variables;
  });

  // Computed: filtered execution history for search
  filteredExecutionHistory = computed(() => {
    const term = this.executionSearchTerm().toLowerCase().trim();
    const statusFilter = this.executionStatusFilter();
    const allHistory = this.executionHistory();

    return allHistory.filter(e => {
      // Filter by status
      if (statusFilter && e.status !== statusFilter) {
        return false;
      }

      // Filter by search term
      if (term) {
        return e.id.toLowerCase().includes(term) ||
               e.status.toLowerCase().includes(term);
      }

      return true;
    });
  });

  // Computed for master-detail: selected variable detail
  selectedVariableDetail = computed(() => {
    const key = this.selectedVariableKey();
    if (!key) return null;
    return this.executionVariables().find(v => v.key === key) || null;
  });

  // Computed for master-detail: selected execution detail
  selectedExecutionDetail = computed(() => {
    const id = this.selectedExecutionId();
    if (!id) return null;
    return this.executionHistory().find(e => e.id === id) || null;
  });

  // Computed: context for selected execution in master-detail
  selectedExecutionDetailContext = computed(() => {
    const exec = this.selectedExecutionDetail();
    if (!exec) return null;

    if (this.demoMode()) {
      return {
        resultado_csv: { rows: 150, columns: 12, processed: true },
        datos_transformados: { records: 148, errors: 2 },
        score_ml: 0.87,
        alerta_detectada: true,
        timestamp: new Date().toISOString(),
        proceso_id: this.processId(),
        ejecucion_id: exec.id
      };
    }
    return null;
  });

  // Selected execution context for the detail dialog
  selectedExecutionContext = computed(() => {
    const exec = this.selectedExecution();
    if (!exec) return null;

    // In demo mode, return mock context data
    if (this.demoMode()) {
      return {
        resultado_csv: { rows: 150, columns: 12, processed: true },
        datos_transformados: { records: 148, errors: 2 },
        score_ml: 0.87,
        alerta_detectada: true,
        timestamp: new Date().toISOString(),
        proceso_id: this.processId(),
        ejecucion_id: exec.id
      };
    }

    // In real mode, get context from service (to be implemented)
    return null;
  });

  progressPercentage = computed(() => {
    const execution = this.currentExecution();
    if (!execution) return 0;
    return this.executionProgress();
  });

  // Process objectives (mock for now)
  processObjectives = signal<{ id: number; label: string }[]>([
    { id: 1, label: 'Objetivo 1' },
    { id: 2, label: 'Objetivo 2' }
  ]);

  // Dropdown options
  destinationOptions = [
    { label: 'No guardar', value: 'none' },
    { label: 'Propiedad de proceso', value: 'process' },
    { label: 'Apetito de riesgo', value: 'risk_appetite' },
    { label: 'Objetivo de negocio', value: 'objective' },
    { label: 'KPI', value: 'kpi' },
    { label: 'Propiedad de activo', value: 'asset' }
  ];

  modeOptions = [
    { label: 'Reemplazar', value: 'replace' },
    { label: 'Agregar', value: 'append' }
  ];

  sourceTypeOptions = [
    { label: 'Variable', value: 'variable' },
    { label: 'Manual', value: 'manual' }
  ];

  conditionOperatorOptions = [
    { label: 'Siempre', value: 'always' },
    { label: 'Es igual a', value: 'equals' },
    { label: 'No es igual a', value: 'not_equals' },
    { label: 'Mayor que', value: 'greater_than' },
    { label: 'Menor que', value: 'less_than' },
    { label: 'Contiene', value: 'contains' },
    { label: 'No contiene', value: 'not_contains' },
    { label: 'Esta vacio', value: 'is_empty' },
    { label: 'No esta vacio', value: 'is_not_empty' }
  ];

  entityTypeOptions = [
    { label: 'Riesgo', value: 'risk' },
    { label: 'Incidente', value: 'incident' },
    { label: 'Defecto', value: 'defect' }
  ];

  entityFieldOptions = [
    { label: 'Titulo', value: 'title', required: true },
    { label: 'Descripcion', value: 'description', required: true },
    { label: 'Costo del evento', value: 'costEvent', required: false },
    { label: 'Costo de remediacion', value: 'costRemediation', required: false }
  ];

  processPropertyOptions = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripcion' }
  ];

  riskAppetitePropertyOptions = [
    { key: 'riskAppetitePercentage', label: 'Porcentaje de apetito' },
    { key: 'probability', label: 'Probabilidad' },
    { key: 'impact', label: 'Impacto' }
  ];

  objectivePropertyOptions = [
    { key: 'currentValue', label: 'Valor actual' },
    { key: 'targetValue', label: 'Valor objetivo' },
    { key: 'progressPercentage', label: 'Porcentaje de progreso' }
  ];

  kpiPropertyOptions = [
    { key: 'currentValue', label: 'Valor actual' },
    { key: 'targetValue', label: 'Valor objetivo' },
    { key: 'weight', label: 'Peso' }
  ];

  // Mock catalogs for entity creation
  severityLevels = signal([
    { id: 1, name: 'Bajo' },
    { id: 2, name: 'Medio' },
    { id: 3, name: 'Alto' },
    { id: 4, name: 'Critico' }
  ]);

  propagationLevels = signal([
    { id: 1, name: 'Local' },
    { id: 2, name: 'Departamental' },
    { id: 3, name: 'Organizacional' }
  ]);

  probabilityLevels = signal([
    { id: 1, name: 'Raro' },
    { id: 2, name: 'Poco probable' },
    { id: 3, name: 'Posible' },
    { id: 4, name: 'Probable' },
    { id: 5, name: 'Seguro' }
  ]);

  impactLevels = signal([
    { id: 1, name: 'Insignificante' },
    { id: 2, name: 'Menor' },
    { id: 3, name: 'Moderado' },
    { id: 4, name: 'Mayor' },
    { id: 5, name: 'Catastrofico' }
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.processId.set(id);
      this.loadProcess(id);
      this.loadStorageConfig();
      this.loadEntityCreationConfig();
      this.generateOutputVariableDefinitions();
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadProcess(id: string): void {
    this.isLoading.set(true);
    const proceso = this.processService.procesos().find(p => p.id === id);
    if (proceso) {
      this.process.set(proceso);
      this.processService.loadProceso(id);
    }
    this.isLoading.set(false);
  }

  private generateOutputVariableDefinitions(): void {
    const nodes = this.nodes();
    const definitions: OutputVariableDefinition[] = [];

    nodes.forEach(node => {
      const nodeConfig = node.config as unknown as Record<string, unknown> | undefined;
      // Generate output variable definitions based on node type
      if (nodeConfig?.['outputVariables']) {
        (nodeConfig['outputVariables'] as string[]).forEach((v: string) => {
          definitions.push({
            key: v,
            nodeId: node.id,
            nodeName: node.label || this.getNodeTypeName(node.type),
            nodeTypeCode: node.type
          });
        });
      } else if (nodeConfig?.['variableSalida']) {
        // Some nodes use variableSalida instead
        definitions.push({
          key: nodeConfig['variableSalida'] as string,
          nodeId: node.id,
          nodeName: node.label || this.getNodeTypeName(node.type),
          nodeTypeCode: node.type
        });
      } else {
        // Default output variable
        definitions.push({
          key: `${node.type}_output`,
          nodeId: node.id,
          nodeName: node.label || this.getNodeTypeName(node.type),
          nodeTypeCode: node.type
        });
      }
    });

    this.outputVariableDefinitions.set(definitions);
  }

  private loadStorageConfig(): void {
    const id = this.processId();
    if (!id) return;
    const key = `${this.STORAGE_CONFIG_KEY}-${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.storageConfigs.set(JSON.parse(stored));
      } catch {
        console.error('Failed to load storage config');
      }
    }
  }

  saveStorageConfig(): void {
    const id = this.processId();
    if (!id) return;
    const key = `${this.STORAGE_CONFIG_KEY}-${id}`;
    localStorage.setItem(key, JSON.stringify(this.storageConfigs()));
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Configuracion de almacenamiento guardada'
    });
  }

  private loadEntityCreationConfig(): void {
    const id = this.processId();
    if (!id) return;
    const key = `${this.STORAGE_CONFIG_KEY}-entities-${id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        this.entityCreationConfigs.set(JSON.parse(stored));
      } catch {
        console.error('Failed to load entity creation config');
      }
    }
  }

  saveEntityCreationConfig(): void {
    const id = this.processId();
    if (!id) return;
    const key = `${this.STORAGE_CONFIG_KEY}-entities-${id}`;
    localStorage.setItem(key, JSON.stringify(this.entityCreationConfigs()));
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Configuracion de entidades guardada'
    });
  }

  // Variable config methods
  getVariableConfig(variableKey: string): OutputVariableStorageConfig | undefined {
    return this.storageConfigs().find(c => c.variableKey === variableKey);
  }

  updateVariableConfig(variableKey: string, updates: Partial<OutputVariableStorageConfig>): void {
    const configs = [...this.storageConfigs()];
    const index = configs.findIndex(c => c.variableKey === variableKey);

    if (index >= 0) {
      configs[index] = { ...configs[index], ...updates };
    } else {
      configs.push({
        variableKey,
        destination: 'none',
        sourceType: 'variable',
        mode: 'replace',
        condition: { enabled: false, operator: 'always' },
        ...updates
      });
    }

    this.storageConfigs.set(configs);
  }

  getConfiguredItemsCount(): string {
    const variableCount = this.storageConfigs().filter(c => c.destination !== 'none').length;
    const entityCount = this.entityCreationConfigs().filter(c => c.enabled).length;
    const total = variableCount + entityCount;
    return total > 0 ? total.toString() : '';
  }

  // Entity creation methods
  addEntityCreationConfig(): void {
    const configs = [...this.entityCreationConfigs()];
    configs.push({
      enabled: true,
      entityType: 'risk',
      condition: { enabled: false, operator: 'always' },
      fieldMappings: [
        { targetField: 'title', sourceType: 'manual', manualValue: '' },
        { targetField: 'description', sourceType: 'manual', manualValue: '' }
      ]
    });
    this.entityCreationConfigs.set(configs);
  }

  removeEntityCreationConfig(index: number): void {
    const configs = [...this.entityCreationConfigs()];
    configs.splice(index, 1);
    this.entityCreationConfigs.set(configs);
  }

  updateEntityCreationConfig(index: number, updates: Partial<EntityCreationConfig>): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[index]) {
      configs[index] = { ...configs[index], ...updates };
      this.entityCreationConfigs.set(configs);
    }
  }

  addFieldMapping(configIndex: number): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[configIndex]) {
      configs[configIndex].fieldMappings.push({
        targetField: '',
        sourceType: 'variable'
      });
      this.entityCreationConfigs.set(configs);
    }
  }

  removeFieldMapping(configIndex: number, fieldIndex: number): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[configIndex]?.fieldMappings) {
      configs[configIndex].fieldMappings.splice(fieldIndex, 1);
      this.entityCreationConfigs.set(configs);
    }
  }

  updateFieldMapping(configIndex: number, fieldIndex: number, updates: Partial<EntityFieldMapping>): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[configIndex]?.fieldMappings?.[fieldIndex]) {
      configs[configIndex].fieldMappings[fieldIndex] = {
        ...configs[configIndex].fieldMappings[fieldIndex],
        ...updates
      };
      this.entityCreationConfigs.set(configs);
    }
  }

  insertVariableIntoTemplate(configIndex: number, field: 'title' | 'description', variableKey: string): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[configIndex]) {
      const template = field === 'title' ? configs[configIndex].titleTemplate || '' : configs[configIndex].descriptionTemplate || '';
      const insertion = `{{${variableKey}}}`;

      if (field === 'title') {
        configs[configIndex].titleTemplate = template + insertion;
      } else {
        configs[configIndex].descriptionTemplate = template + insertion;
      }

      this.entityCreationConfigs.set(configs);
    }
  }

  toggleConfigPanel(): void {
    this.showConfigPanel.update(v => !v);
  }

  toggleEntityCreationPanel(): void {
    this.showEntityCreationPanel.update(v => !v);
  }

  // Execution methods
  startExecution(): void {
    if (!this.canStartExecution()) return;
    this.messageService.add({
      severity: 'info',
      summary: 'Iniciando ejecucion',
      detail: 'El proceso esta siendo ejecutado...'
    });
    this.processService.executeProcess();
  }

  cancelExecution(): void {
    this.processService.cancelExecution();
    this.messageService.add({
      severity: 'warn',
      summary: 'Ejecucion cancelada',
      detail: 'La ejecucion del proceso fue cancelada'
    });
  }

  isExecutionActive(): boolean {
    return this.isExecuting();
  }

  // Node output methods
  showNodeOutput(node: FlowNodeItem | FlowGraphNode): void {
    if (node.outputData) {
      this.selectedNodeOutput.set(node.outputData);
      this.selectedNodeName.set(node.name);
      this.showOutputDialog.set(true);
    }
  }

  showVariableDetail(variable: ExecutionVariable): void {
    this.selectedVariable.set(variable);
    this.showVariableDialog.set(true);
  }

  // Master-detail selection methods
  selectVariable(variable: ExecutionVariable): void {
    this.selectedVariableKey.set(variable.key);
  }

  selectExecution(exec: { id: string; status: string; startTime?: Date; endTime?: Date }): void {
    this.selectedExecutionId.set(exec.id);
  }

  clearVariableSelection(): void {
    this.selectedVariableKey.set(null);
  }

  clearExecutionSelection(): void {
    this.selectedExecutionId.set(null);
  }

  showErrorDetails(): void {
    this.showErrorDialog.set(true);
  }

  exportContext(): void {
    const variables = this.executionVariables();
    const data = variables.reduce((acc, v) => {
      acc[v.key] = v.value;
      return acc;
    }, {} as Record<string, unknown>);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.process()?.nombre || 'proceso'}_resultado.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Resultados exportados correctamente'
    });
  }

  viewExecutionContext(exec: { id: string; status: string; startTime?: Date; endTime?: Date }): void {
    this.selectedExecution.set(exec);
    this.showContextDialog.set(true);
  }

  downloadExecutionContext(exec: { id: string; status: string; startTime?: Date; endTime?: Date }): void {
    // Get context data (mock for demo, real from service otherwise)
    let contextData: Record<string, unknown>;

    if (this.demoMode()) {
      contextData = {
        ejecucion_id: exec.id,
        status: exec.status,
        startTime: exec.startTime,
        endTime: exec.endTime,
        proceso_id: this.processId(),
        proceso_nombre: this.process()?.nombre,
        contexto: {
          resultado_csv: { rows: 150, columns: 12, processed: true },
          datos_transformados: { records: 148, errors: 2 },
          score_ml: 0.87,
          alerta_detectada: true
        }
      };
    } else {
      // In real mode, get from service
      contextData = {
        ejecucion_id: exec.id,
        status: exec.status,
        startTime: exec.startTime,
        endTime: exec.endTime
      };
    }

    const blob = new Blob([JSON.stringify(contextData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ejecucion_${exec.id.slice(0, 8)}_contexto.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Descargado',
      detail: 'Contexto de ejecucion descargado'
    });
  }

  // Helper methods
  getNodeTypeName(type: string): string {
    const names: Record<string, string> = {
      'csv': 'Archivo CSV',
      'webhook': 'Webhook',
      'transformacion': 'Transformacion',
      'condicional': 'Condicional',
      'llm': 'LLM/IA',
      'estado': 'Estado',
      'matematico': 'Matematico',
      'ml': 'Machine Learning',
      'kpi': 'KPI',
      'branching': 'Ramificacion',
      'activo': 'Activo',
      'integracion': 'Integracion'
    };
    return names[type] || type;
  }

  getNodeIcon(nodeType: string): string {
    const icons: Record<string, string> = {
      'csv': 'pi-file',
      'webhook': 'pi-globe',
      'transformacion': 'pi-sync',
      'condicional': 'pi-question-circle',
      'llm': 'pi-sparkles',
      'estado': 'pi-flag',
      'matematico': 'pi-calculator',
      'ml': 'pi-microchip-ai',
      'kpi': 'pi-chart-bar',
      'branching': 'pi-sitemap',
      'activo': 'pi-box',
      'integracion': 'pi-link'
    };
    return icons[nodeType] || 'pi-circle';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'RUNNING': 'En ejecucion',
      'COMPLETED': 'Completado',
      'FAILED': 'Fallido',
      'PENDING': 'Pendiente',
      'CANCELLED': 'Cancelado',
      'running': 'En ejecucion',
      'completed': 'Completado',
      'failed': 'Fallido',
      'pending': 'Pendiente'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'RUNNING': 'info',
      'COMPLETED': 'success',
      'FAILED': 'danger',
      'PENDING': 'secondary',
      'CANCELLED': 'warn',
      'running': 'info',
      'completed': 'success',
      'failed': 'danger',
      'pending': 'secondary'
    };
    return severities[status] || 'secondary';
  }

  getVariableIcon(type: string): string {
    const icons: Record<string, string> = {
      'string': 'pi-align-left',
      'number': 'pi-hashtag',
      'boolean': 'pi-check-square',
      'array': 'pi-list',
      'object': 'pi-code',
      'null': 'pi-minus'
    };
    return icons[type] || 'pi-circle';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(ms?: number): string {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  getExecutionDurationMs(exec: { startTime?: Date; endTime?: Date }): number | undefined {
    if (!exec.startTime || !exec.endTime) return undefined;
    return new Date(exec.endTime).getTime() - new Date(exec.startTime).getTime();
  }

  getVariableAsObject(value: unknown): Record<string, unknown> {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>;
    }
    return { value };
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/procesos']);
  }

  goToDetail(): void {
    const id = this.processId();
    if (id) {
      this.router.navigate(['/procesos', id, 'detalle']);
    }
  }

  goToDesigner(): void {
    const id = this.processId();
    if (id) {
      this.router.navigate(['/procesos', id]);
    }
  }

  // Mock methods for catalog filtering
  getSubTypesForEntityType(entityType: CreatableEntityType): { id: number; name: string }[] {
    // Mock subtypes
    return [
      { id: 1, name: 'Subtipo 1' },
      { id: 2, name: 'Subtipo 2' }
    ];
  }

  getFilteredEventStatuses(entityType: CreatableEntityType): { id: number; name: string }[] {
    return [
      { id: 1, name: 'Abierto' },
      { id: 2, name: 'En progreso' },
      { id: 3, name: 'Cerrado' }
    ];
  }

  onSubTypeChange(configIndex: number, subTypeId: number): void {
    this.updateEntityCreationConfig(configIndex, { eventSubTypeId: subTypeId });
  }

  updateSubTypePropertyMapping(configIndex: number, propertyId: number, updates: Partial<SubTypePropertyMapping>): void {
    const configs = [...this.entityCreationConfigs()];
    if (configs[configIndex]?.subTypePropertyMappings) {
      const propIndex = configs[configIndex].subTypePropertyMappings!.findIndex(p => p.propertyId === propertyId);
      if (propIndex >= 0) {
        configs[configIndex].subTypePropertyMappings![propIndex] = {
          ...configs[configIndex].subTypePropertyMappings![propIndex],
          ...updates
        };
        this.entityCreationConfigs.set(configs);
      }
    }
  }

  // ========== ZOOM Y PAN METHODS ==========

  zoomIn(): void {
    const newZoom = Math.min(this.zoom() + this.ZOOM_STEP, this.MAX_ZOOM);
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  zoomOut(): void {
    const newZoom = Math.max(this.zoom() - this.ZOOM_STEP, this.MIN_ZOOM);
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  resetZoom(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  fitToScreen(): void {
    this.zoom.set(0.8);
    this.panX.set(0);
    this.panY.set(0);
  }

  // Mouse wheel zoom
  onFlowWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom() + delta));
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  // Middle mouse button pan start
  onFlowMouseDown(event: MouseEvent): void {
    if (event.button === 1) {
      event.preventDefault();
      this.isPanning.set(true);
      this.lastPanPosition = { x: event.clientX, y: event.clientY };
    }
  }

  // Mouse move for panning
  onFlowMouseMove(event: MouseEvent): void {
    if (this.isPanning()) {
      event.preventDefault();
      const deltaX = event.clientX - this.lastPanPosition.x;
      const deltaY = event.clientY - this.lastPanPosition.y;

      this.panX.update(x => x + deltaX);
      this.panY.update(y => y + deltaY);

      this.lastPanPosition = { x: event.clientX, y: event.clientY };
    }
  }

  // Mouse up to stop panning
  onFlowMouseUp(event: MouseEvent): void {
    if (event.button === 1) {
      this.isPanning.set(false);
    }
  }

  // Mouse leave to stop panning
  onFlowMouseLeave(): void {
    this.isPanning.set(false);
  }

  // Keyboard shortcuts for zoom
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl/Cmd + Plus: Zoom in
    if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      this.zoomIn();
    }
    // Ctrl/Cmd + Minus: Zoom out
    if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault();
      this.zoomOut();
    }
    // Ctrl/Cmd + 0: Reset zoom
    if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault();
      this.resetZoom();
    }
    // Arrow keys for panning
    const PAN_AMOUNT = 50;
    if (event.key === 'ArrowUp' && !event.ctrlKey) {
      this.panY.update(y => y + PAN_AMOUNT);
    }
    if (event.key === 'ArrowDown' && !event.ctrlKey) {
      this.panY.update(y => y - PAN_AMOUNT);
    }
    if (event.key === 'ArrowLeft' && !event.ctrlKey) {
      this.panX.update(x => x + PAN_AMOUNT);
    }
    if (event.key === 'ArrowRight' && !event.ctrlKey) {
      this.panX.update(x => x - PAN_AMOUNT);
    }
  }
}
