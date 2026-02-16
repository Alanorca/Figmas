import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

// Services
import { ProcessService } from '../../services/process.service';

// Types
import {
  Proceso,
  ProcessExecutionFull,
  ProcessExecutionStatus,
  NodeExecutionResult,
  OutputVariable,
  OutputStorageConfig,
  EntityCreationConfig,
  ProcessRunnerConfig,
  EXECUTION_STATUS_NAMES,
  NODE_TYPES_METADATA,
  ENTITY_CATALOGS,
  DEFAULT_STORAGE_CONDITION,
  NodeTypeMetadata
} from '../../models/process-nodes';

// Interface para nodo en el flujo visual
interface FlowNodeItem {
  id: string;
  name: string;
  type: string;
  typeName: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  output?: unknown;
  error?: { message: string; type: string };
}

@Component({
  selector: 'app-proceso-runner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    TagModule,
    TabsModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    CheckboxModule,
    ChipModule,
    BadgeModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    MenuModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './proceso-runner.html',
  styleUrl: './proceso-runner.scss'
})
export class ProcesoRunnerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private processService = inject(ProcessService);
  private messageService = inject(MessageService);

  // Zoom constants
  readonly MIN_ZOOM = 0.25;
  readonly MAX_ZOOM = 2;
  readonly ZOOM_STEP = 0.1;

  // Zoom state
  zoom = signal(1);
  panX = signal(0);
  panY = signal(0);
  isPanning = signal(false);
  private lastPanPoint = { x: 0, y: 0 };

  // Computed zoom values
  zoomPercentage = computed(() => Math.round(this.zoom() * 100));
  flowTransform = computed(() =>
    `scale(${this.zoom()}) translate(${this.panX()}px, ${this.panY()}px)`
  );

  // Estado del proceso
  proceso = signal<Proceso | null>(null);
  procesoId = signal<string>('');

  // Estado de ejecución
  currentExecution = signal<ProcessExecutionFull | null>(null);
  executionHistory = signal<ProcessExecutionFull[]>([]);
  isExecuting = signal(false);

  // Variables de salida
  outputVariables = signal<OutputVariable[]>([]);
  selectedVariable = signal<OutputVariable | null>(null);

  // Configuración de guardado
  showSaveConfigModal = signal(false);
  storageConfigs = signal<OutputStorageConfig[]>([]);
  entityConfigs = signal<EntityCreationConfig[]>([]);
  saveConfigActiveTab = signal(0);

  // Data Viewer - estado colapsable
  expandedSections = signal<Set<string>>(new Set());
  expandedArrays = signal<Set<string>>(new Set());

  // Variables disponibles para templates (extraídas de los nodos del proceso)
  availableVariables = computed(() => {
    const proc = this.proceso();
    if (!proc || !proc.nodes) return [];

    const variables: { key: string; nodeType: string; nodeName: string }[] = [];

    proc.nodes.forEach(node => {
      const metadata = NODE_TYPES_METADATA.find(m => m.type === node.type);
      const baseKey = node.label.toLowerCase().replace(/\s+/g, '_');

      // Cada tipo de nodo puede generar diferentes variables de salida
      switch (node.type) {
        case 'csv':
          variables.push({ key: `${baseKey}_output`, nodeType: 'csv', nodeName: node.label });
          break;
        case 'transformacion':
          variables.push({ key: `transformacion_output`, nodeType: 'transformacion', nodeName: node.label });
          break;
        case 'llm':
          variables.push({ key: `llm_output`, nodeType: 'llm', nodeName: node.label });
          break;
        case 'matematico':
          variables.push({ key: `matematico_output`, nodeType: 'matematico', nodeName: node.label });
          break;
        case 'condicional':
          variables.push({ key: `condicional_output`, nodeType: 'condicional', nodeName: node.label });
          break;
        case 'estado':
          variables.push({ key: `estado_output`, nodeType: 'estado', nodeName: node.label });
          break;
        case 'kpi':
          variables.push({ key: `kpi_output`, nodeType: 'kpi', nodeName: node.label });
          break;
        default:
          variables.push({ key: `${baseKey}_output`, nodeType: node.type, nodeName: node.label });
      }
    });

    return variables;
  });

  // Stats collapsible
  statsExpanded = signal(false);

  // Tabs
  activeTabIndex = signal(0);

  // Filtros
  searchTerm = signal('');
  historySearchTerm = signal('');
  selectedStatusFilter = signal<string>('all');
  selectedTypeFilter = signal<string>('all');

  // Computed
  flowNodes = computed<FlowNodeItem[]>(() => {
    const proc = this.proceso();
    const exec = this.currentExecution();
    if (!proc || !proc.nodes) return [];

    return proc.nodes.map(node => {
      const metadata = NODE_TYPES_METADATA.find(m => m.type === node.type);
      const nodeExec = exec?.nodes.find(n => n.nodeId === node.id);

      return {
        id: node.id,
        name: node.label,
        type: node.type,
        typeName: metadata?.title || node.type,
        icon: metadata?.icon || 'help',
        iconColor: metadata?.iconColor || '#666',
        bgColor: metadata?.bgColor || '#f5f5f5',
        status: nodeExec?.status || 'pending',
        duration: nodeExec?.duration,
        output: nodeExec?.output,
        error: nodeExec?.error
      };
    });
  });

  currentNodeId = computed(() => {
    const nodes = this.flowNodes();
    const running = nodes.find(n => n.status === 'running');
    return running?.id || null;
  });

  progressPercentage = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return 0;
    return Math.round(exec.metrics.percentage * 100);
  });

  filteredVariables = computed(() => {
    let vars = this.outputVariables();
    const search = this.searchTerm().toLowerCase();
    const typeFilter = this.selectedTypeFilter();

    if (search) {
      vars = vars.filter(v =>
        v.key.toLowerCase().includes(search) ||
        v.nodeName.toLowerCase().includes(search)
      );
    }

    if (typeFilter !== 'all') {
      vars = vars.filter(v => v.type === typeFilter);
    }

    return vars;
  });

  filteredHistory = computed(() => {
    let history = this.executionHistory();
    const statusFilter = this.selectedStatusFilter();

    if (statusFilter !== 'all') {
      history = history.filter(e => e.statusCode === statusFilter);
    }

    return history;
  });

  storageConfigCount = computed(() => {
    const storage = this.storageConfigs().filter(c => c.destination !== 'none').length;
    const entities = this.entityConfigs().filter(c => c.enabled).length;
    return storage + entities;
  });

  // Estadísticas de Ejecución
  executionStats = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return null;

    const completedNodes = exec.nodes.filter(n => n.status === 'completed');
    const totalDuration = exec.duration || 0;

    // Contar webhooks (nodos tipo webhook o activo con llamadas externas)
    const webhookNodes = exec.nodes.filter(n =>
      n.nodeType === 'activo' || n.nodeType === 'llm'
    );
    const webhookTotal = webhookNodes.reduce((sum, n) => sum + (n.duration || 0), 0);
    const webhookAvg = webhookNodes.length > 0 ? Math.round(webhookTotal / webhookNodes.length) : 0;

    // Calcular tamaño del contexto
    const contextStr = JSON.stringify(exec.context || {});
    const contextSize = new Blob([contextStr]).size;
    const contextVars = Object.keys(exec.context || {}).length;

    return {
      nodesExecuted: completedNodes.length,
      nodesAvg: completedNodes.length > 0
        ? Math.round(completedNodes.reduce((s, n) => s + (n.duration || 0), 0) / completedNodes.length)
        : 0,
      webhooksCalled: webhookNodes.length,
      webhooksTotal: webhookTotal,
      webhooksAvg: webhookAvg,
      contextSize: this.formatBytes(contextSize),
      contextVars,
      totalTime: this.formatDuration(totalDuration)
    };
  });

  // Desglose por tipo de nodo
  nodeTypeBreakdown = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return [];

    const totalDuration = exec.nodes.reduce((s, n) => s + (n.duration || 0), 0);
    const typeMap = new Map<string, { type: string; typeName: string; icon: string; iconColor: string; totalTime: number; count: number }>();

    exec.nodes.forEach(node => {
      const metadata = NODE_TYPES_METADATA.find(m => m.type === node.nodeType);
      const key = node.nodeType;
      if (!typeMap.has(key)) {
        typeMap.set(key, {
          type: key,
          typeName: metadata?.title || key,
          icon: metadata?.icon || 'help',
          iconColor: metadata?.iconColor || '#666',
          totalTime: 0,
          count: 0
        });
      }
      const entry = typeMap.get(key)!;
      entry.totalTime += node.duration || 0;
      entry.count++;
    });

    return Array.from(typeMap.values())
      .map(entry => ({
        ...entry,
        percentage: totalDuration > 0 ? (entry.totalTime / totalDuration) * 100 : 0,
        avg: entry.count > 0 ? Math.round(entry.totalTime / entry.count) : 0
      }))
      .sort((a, b) => b.totalTime - a.totalTime);
  });

  // Nodo actual / estado del proceso
  processCompletionStatus = computed(() => {
    const exec = this.currentExecution();
    if (!exec) return 'idle';
    if (exec.statusCode === 'COMPLETED') return 'completed';
    if (exec.statusCode === 'FAILED') return 'failed';
    if (exec.statusCode === 'RUNNING' || exec.statusCode === 'PENDING') return 'running';
    return 'idle';
  });

  currentRunningNode = computed(() => {
    const nodes = this.flowNodes();
    return nodes.find(n => n.status === 'running') || null;
  });

  // Opciones para filtros
  statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Fallido', value: 'FAILED' },
    { label: 'Cancelado', value: 'CANCELLED' }
  ];

  typeOptions = [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Texto', value: 'string' },
    { label: 'Numero', value: 'number' },
    { label: 'Booleano', value: 'boolean' },
    { label: 'Lista', value: 'array' },
    { label: 'Objeto', value: 'object' }
  ];

  // Menú contextual principal de descarga (Resultado Actual)
  downloadMenuItems: MenuItem[] = [
    {
      label: 'Exportar CSV',
      icon: 'pi pi-file',
      command: () => this.exportResultsCsv()
    },
    {
      label: 'Descargar JSON',
      icon: 'pi pi-file-export',
      command: () => this.exportCurrentResults()
    },
    {
      separator: true
    },
    {
      label: 'Reporte PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportReportPdf()
    }
  ];

  // Menú contextual de descarga para variables
  variableDownloadItems: MenuItem[] = [
    { label: 'Exportar CSV', icon: 'pi pi-file', command: () => this.exportVariableCsv() },
    { label: 'Descargar JSON', icon: 'pi pi-file-export', command: () => this.downloadSelectedVariableJson() },
    { separator: true },
    { label: 'Reporte PDF', icon: 'pi pi-file-pdf', command: () => this.exportReportPdf() }
  ];

  // Menú contextual de descarga para resultados
  resultsDownloadItems: MenuItem[] = [
    { label: 'Exportar CSV', icon: 'pi pi-file', command: () => this.exportResultsCsv() },
    { label: 'Descargar JSON', icon: 'pi pi-file-export', command: () => this.exportCurrentResults() },
    { separator: true },
    { label: 'Reporte PDF', icon: 'pi pi-file-pdf', command: () => this.exportReportPdf() }
  ];

  // Menú contextual de descarga para ejecuciones del historial
  executionDownloadItems: MenuItem[] = [
    { label: 'Exportar CSV', icon: 'pi pi-file', command: () => this.exportExecutionCsv() },
    { label: 'Descargar JSON', icon: 'pi pi-file-export', command: () => { const exec = this.currentExecution(); if (exec) this.downloadExecutionJson(exec); } },
    { separator: true },
    { label: 'Reporte PDF', icon: 'pi pi-file-pdf', command: () => this.exportReportPdf() }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.procesoId.set(id);
        this.loadProceso(id);
        // Generar datos de prueba si no existen
        this.processService.seedDemoExecutionHistory(id);
        this.loadExecutionHistory(id);
        this.loadRunnerConfig(id);
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  // ============ Carga de datos ============

  private loadProceso(id: string): void {
    const procesos = this.processService.procesos();
    const proceso = procesos.find(p => p.id === id);
    if (proceso) {
      this.proceso.set(proceso);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Proceso no encontrado'
      });
      this.router.navigate(['/procesos-lista']);
    }
  }

  private loadExecutionHistory(procesoId: string): void {
    const history = this.processService.getFullExecutionHistory(procesoId);
    this.executionHistory.set(history);
  }

  private loadRunnerConfig(procesoId: string): void {
    const config = this.processService.getRunnerConfig(procesoId);
    if (config) {
      this.storageConfigs.set(config.storageConfigs);
      this.entityConfigs.set(config.entityConfigs);
    }
  }

  // ============ Ejecucion ============

  async executeProcess(): Promise<void> {
    const procesoId = this.procesoId();
    if (!procesoId || this.isExecuting()) return;

    this.isExecuting.set(true);
    this.activeTabIndex.set(0); // Mostrar tab de resultado actual

    try {
      const execution = await this.processService.executeProcessWithTracking(
        procesoId,
        undefined,
        (progress) => {
          this.currentExecution.set(progress);
          // Extraer variables de salida en tiempo real
          const vars = this.processService.extractOutputVariables(progress);
          this.outputVariables.set(vars);
        }
      );

      // Actualizar historial
      this.loadExecutionHistory(procesoId);

      // Mostrar mensaje de resultado
      if (execution.statusCode === 'COMPLETED') {
        this.messageService.add({
          severity: 'success',
          summary: 'Proceso Completado',
          detail: `Ejecucion #${execution.id} finalizada exitosamente`
        });

        // Crear entidades si hay configuracion
        if (this.entityConfigs().length > 0) {
          const results = this.processService.createEntitiesFromExecution(
            execution,
            this.entityConfigs()
          );
          results.forEach(r => {
            if (r.created) {
              this.messageService.add({
                severity: 'info',
                summary: 'Entidad Creada',
                detail: `${r.entityType}: ${r.title}`
              });
            }
          });
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Proceso Fallido',
          detail: `Ejecucion #${execution.id} termino con errores`
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al ejecutar el proceso'
      });
    } finally {
      this.isExecuting.set(false);
    }
  }

  // ============ Navegacion ============

  goBack(): void {
    this.router.navigate(['/procesos-lista']);
  }

  openDetail(): void {
    this.router.navigate(['/proceso-detalle', this.procesoId()]);
  }

  openDesigner(): void {
    this.router.navigate(['/procesos', this.procesoId()]);
  }

  // ============ Seleccion de ejecucion ============

  selectExecution(execution: ProcessExecutionFull): void {
    this.currentExecution.set(execution);
    const vars = this.processService.extractOutputVariables(execution);
    this.outputVariables.set(vars);
    this.activeTabIndex.set(0);
    this.expandedSections.set(new Set());
    this.expandedArrays.set(new Set());
  }

  // ============ Variables ============

  selectVariable(variable: OutputVariable): void {
    this.selectedVariable.set(variable);
    this.expandedSections.set(new Set());
    this.expandedArrays.set(new Set());
  }

  getVariableIcon(type: string): string {
    switch (type) {
      case 'string': return 'pi pi-align-left';
      case 'number': return 'pi pi-hashtag';
      case 'boolean': return 'pi pi-check-square';
      case 'array': return 'pi pi-list';
      case 'object': return 'pi pi-code';
      default: return 'pi pi-circle';
    }
  }

  formatValue(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  // ============ Data Viewer ============

  toggleSection(key: string): void {
    this.expandedSections.update(set => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isSectionExpanded(key: string): boolean {
    return this.expandedSections().has(key);
  }

  toggleArrayExpand(key: string): void {
    this.expandedArrays.update(set => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  isArrayExpanded(key: string): boolean {
    return this.expandedArrays().has(key);
  }

  getValueDisplayType(value: unknown): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'array-primitives';
      const allPrimitives = value.every(v => v === null || typeof v !== 'object');
      return allPrimitives ? 'array-primitives' : 'array-objects';
    }
    if (typeof value === 'object') {
      const vals = Object.values(value as Record<string, unknown>);
      const isFlat = vals.every(v => v === null || typeof v !== 'object');
      return isFlat ? 'flat-object' : 'nested-object';
    }
    return 'string';
  }

  getTypeBadgeClass(value: unknown): string {
    if (value === null || value === undefined) return 'type-null';
    if (typeof value === 'string') return 'type-string';
    if (typeof value === 'number') return 'type-number';
    if (typeof value === 'boolean') return 'type-boolean';
    if (Array.isArray(value)) return 'type-array';
    if (typeof value === 'object') return 'type-object';
    return 'type-string';
  }

  getTypeLabel(value: unknown): string {
    if (value === null || value === undefined) return 'Nulo';
    if (typeof value === 'string') return 'Texto';
    if (typeof value === 'number') return 'Numero';
    if (typeof value === 'boolean') return 'Booleano';
    if (Array.isArray(value)) return `Lista (${value.length})`;
    if (typeof value === 'object') return `Objeto (${Object.keys(value as object).length})`;
    return 'Texto';
  }

  getArrayObjectKeys(arr: unknown[]): string[] {
    const keySet = new Set<string>();
    const limit = Math.min(arr.length, 5);
    for (let i = 0; i < limit; i++) {
      if (arr[i] && typeof arr[i] === 'object' && !Array.isArray(arr[i])) {
        Object.keys(arr[i] as Record<string, unknown>).forEach(k => keySet.add(k));
      }
    }
    return Array.from(keySet);
  }

  formatPrimitive(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Verdadero' : 'Falso';
    if (typeof value === 'number') return value.toLocaleString('es-MX');
    const str = String(value);
    return str.length > 300 ? str.substring(0, 300) + '...' : str;
  }

  isObject(value: unknown): boolean {
    return value !== null && value !== undefined && typeof value === 'object';
  }

  getObjectValue(obj: unknown, key: string): unknown {
    return (obj as Record<string, unknown>)?.[key];
  }

  // ============ Exportacion ============

  exportCurrentResults(): void {
    const exec = this.currentExecution();
    if (exec) {
      this.processService.exportVariablesAsJson(exec);
      this.messageService.add({
        severity: 'success',
        summary: 'Exportado',
        detail: 'Variables exportadas como JSON'
      });
    }
  }

  downloadExecutionJson(execution: ProcessExecutionFull): void {
    this.processService.exportExecutionAsJson(execution);
    this.messageService.add({
      severity: 'success',
      summary: 'Descargado',
      detail: 'Ejecucion descargada como JSON'
    });
  }

  downloadVariableJson(variable: OutputVariable): void {
    const data = {
      key: variable.key,
      type: variable.type,
      value: variable.value,
      nodeName: variable.nodeName,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `variable-${variable.key}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.messageService.add({
      severity: 'success',
      summary: 'Descargado',
      detail: `Variable ${variable.key} descargada como JSON`
    });
  }

  // ============ Exportacion CSV ============

  private downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportVariableCsv(): void {
    const variable = this.selectedVariable();
    if (!variable) return;

    let csv = '';
    if (variable.type === 'array' && Array.isArray(variable.value)) {
      const arr = variable.value as Record<string, unknown>[];
      if (arr.length > 0 && typeof arr[0] === 'object') {
        const headers = Object.keys(arr[0]);
        csv = headers.join(',') + '\n';
        csv += arr.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')).join('\n');
      } else {
        csv = 'value\n' + arr.map(v => JSON.stringify(v)).join('\n');
      }
    } else if (variable.type === 'object' && typeof variable.value === 'object') {
      csv = 'key,value\n';
      csv += Object.entries(variable.value as Record<string, unknown>)
        .map(([k, v]) => `${k},${JSON.stringify(v ?? '')}`)
        .join('\n');
    } else {
      csv = 'key,value\n' + `${variable.key},${JSON.stringify(variable.value)}`;
    }

    this.downloadFile(csv, `variable-${variable.key}.csv`, 'text/csv');
    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: `Variable ${variable.key} exportada como CSV`
    });
  }

  downloadSelectedVariableJson(): void {
    const variable = this.selectedVariable();
    if (variable) this.downloadVariableJson(variable);
  }

  exportResultsCsv(): void {
    const vars = this.outputVariables();
    if (vars.length === 0) return;

    let csv = 'key,type,nodeName,preview\n';
    csv += vars.map(v =>
      `${v.key},${v.type},${v.nodeName},${JSON.stringify(v.preview)}`
    ).join('\n');

    this.downloadFile(csv, `resultados-${this.procesoId()}.csv`, 'text/csv');
    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Resultados exportados como CSV'
    });
  }

  exportExecutionCsv(): void {
    const exec = this.currentExecution();
    if (!exec) return;

    let csv = 'nodeId,nodeName,nodeType,status,duration,executionOrder\n';
    csv += exec.nodes.map(n =>
      `${n.nodeId},${n.nodeName},${n.nodeType},${n.status},${n.duration || 0},${n.executionOrder}`
    ).join('\n');

    this.downloadFile(csv, `ejecucion-${exec.id}.csv`, 'text/csv');
    this.messageService.add({
      severity: 'success',
      summary: 'Exportado',
      detail: 'Ejecucion exportada como CSV'
    });
  }

  // ============ Reporte PDF ============

  exportReportPdf(): void {
    const exec = this.currentExecution();
    if (!exec) return;

    // Generar contenido del reporte
    const stats = this.executionStats();
    const vars = this.outputVariables();
    const breakdown = this.nodeTypeBreakdown();

    const reportContent = [
      `REPORTE DE EJECUCIÓN - ${this.proceso()?.nombre || 'Proceso'}`,
      `${'='.repeat(60)}`,
      ``,
      `ID Ejecución: ${exec.id}`,
      `Estado: ${exec.statusName}`,
      `Inicio: ${this.formatDate(exec.startTime)}`,
      `Duración: ${this.formatDuration(exec.duration)}`,
      ``,
      `ESTADÍSTICAS`,
      `${'-'.repeat(40)}`,
      stats ? `Nodos ejecutados: ${stats.nodesExecuted} (Promedio: ${this.formatDuration(stats.nodesAvg)})` : '',
      stats ? `Webhooks: ${stats.webhooksCalled} llamadas (Total: ${this.formatDuration(stats.webhooksTotal)})` : '',
      stats ? `Contexto: ${stats.contextSize} - ${stats.contextVars} variables` : '',
      stats ? `Tiempo Total: ${stats.totalTime}` : '',
      ``,
      `DESGLOSE POR TIPO DE NODO`,
      `${'-'.repeat(40)}`,
      ...breakdown.map(b => `${b.typeName}: ${this.formatDuration(b.totalTime)} (${b.percentage.toFixed(1)}%) [${b.count}x, avg ${this.formatDuration(b.avg)}]`),
      ``,
      `NODOS EJECUTADOS`,
      `${'-'.repeat(40)}`,
      ...exec.nodes.map(n => `${n.executionOrder}. ${n.nodeName} (${n.nodeType}) - ${n.status} - ${this.formatDuration(n.duration)}`),
      ``,
      `VARIABLES DE SALIDA (${vars.length})`,
      `${'-'.repeat(40)}`,
      ...vars.map(v => `${v.key} [${v.typeLabel}] → ${v.preview}`),
      ``,
      `CONTEXTO`,
      `${'-'.repeat(40)}`,
      JSON.stringify(exec.context, null, 2)
    ].join('\n');

    this.downloadFile(reportContent, `reporte-ejecucion-${exec.id}.pdf.txt`, 'text/plain');
    this.messageService.add({
      severity: 'success',
      summary: 'Reporte generado',
      detail: 'Reporte de ejecución descargado'
    });
  }

  // ============ Configuracion de guardado ============

  openSaveConfigModal(): void {
    this.showSaveConfigModal.set(true);
  }

  closeSaveConfigModal(): void {
    this.showSaveConfigModal.set(false);
  }

  saveConfig(): void {
    this.processService.saveRunnerConfig(
      this.procesoId(),
      this.storageConfigs(),
      this.entityConfigs()
    );
    this.showSaveConfigModal.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Configuracion de guardado actualizada'
    });
  }

  addEntityConfig(): void {
    const newConfig: EntityCreationConfig = {
      id: `entity-${Date.now()}`,
      enabled: true,
      entityType: 'risk',
      createConditionally: false,
      titleTemplate: '',
      descriptionTemplate: '',
      customFields: []
    };
    this.entityConfigs.update(configs => [...configs, newConfig]);
  }

  removeEntityConfig(id: string): void {
    this.entityConfigs.update(configs => configs.filter(c => c.id !== id));
  }

  // ============ Utilidades de UI ============

  getStatusSeverity(status: ProcessExecutionStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'RUNNING':
      case 'PENDING': return 'info';
      case 'PAUSED': return 'warn';
      case 'FAILED':
      case 'CANCELLED':
      case 'TIMED_OUT': return 'danger';
      default: return 'secondary';
    }
  }

  getNodeStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'node-completed';
      case 'running': return 'node-running';
      case 'failed': return 'node-failed';
      case 'skipped': return 'node-skipped';
      default: return 'node-pending';
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(ms: number | undefined): string {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    const seconds = (ms / 1000).toFixed(2);
    if (ms < 60000) return `${seconds}s`;
    const minutes = Math.floor(ms / 60000);
    const remainingSeconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Catálogos para entidades
  getEntityCatalogs(entityType: 'risk' | 'incident' | 'defect') {
    return ENTITY_CATALOGS[entityType] as {
      subtipos: { id: string; label: string }[];
      estados: { id: string; label: string }[];
      severidades: { id: string; label: string }[];
      probabilidades?: { id: string; label: string }[];
      impactos?: { id: string; label: string }[];
      propagaciones?: { id: string; label: string }[];
    };
  }

  getRiskCatalogs() {
    return ENTITY_CATALOGS.risk;
  }

  // ============ Inserción de Variables en Templates ============

  /**
   * Inserta una variable en el campo de título de una configuración de entidad
   */
  insertVariableInTitle(config: EntityCreationConfig, variableKey: string): void {
    config.titleTemplate = (config.titleTemplate || '') + `{{${variableKey}}}`;
  }

  /**
   * Inserta una variable en el campo de descripción de una configuración de entidad
   */
  insertVariableInDescription(config: EntityCreationConfig, variableKey: string): void {
    config.descriptionTemplate = (config.descriptionTemplate || '') + `{{${variableKey}}}`;
  }

  /**
   * Copia el valor de una variable al portapapeles
   */
  copyVariableValue(variable: OutputVariable): void {
    const value = this.formatValue(variable.value);
    navigator.clipboard.writeText(value).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: 'Valor copiado al portapapeles'
      });
    });
  }

  /**
   * Obtiene el icono de Material Icons según el tipo de nodo
   */
  getNodeTypeIcon(nodeType: string): string {
    const metadata = NODE_TYPES_METADATA.find(m => m.type === nodeType);
    return metadata?.icon || 'code';
  }

  // ============ Zoom Controls ============

  zoomIn(): void {
    const newZoom = Math.min(this.zoom() + this.ZOOM_STEP, this.MAX_ZOOM);
    this.zoom.set(Math.round(newZoom * 100) / 100);
  }

  zoomOut(): void {
    const newZoom = Math.max(this.zoom() - this.ZOOM_STEP, this.MIN_ZOOM);
    this.zoom.set(Math.round(newZoom * 100) / 100);
  }

  resetZoom(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  fitToScreen(): void {
    // Ajustar zoom para que todo el flujo sea visible
    const nodesCount = this.flowNodes().length;
    if (nodesCount > 0) {
      // Estimar el ancho total del flujo (cada nodo ~140px + conector ~60px)
      const estimatedWidth = nodesCount * 140 + (nodesCount - 1) * 60;
      const containerWidth = 800; // Ancho aproximado del contenedor
      const fitZoom = Math.min(containerWidth / estimatedWidth, 1);
      this.zoom.set(Math.max(fitZoom, this.MIN_ZOOM));
      this.panX.set(0);
      this.panY.set(0);
    }
  }

  onFlowWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom() + delta));
    this.zoom.set(Math.round(newZoom * 100) / 100);
  }

  onFlowMouseDown(event: MouseEvent): void {
    // Solo iniciar pan con boton central o shift+click
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      event.preventDefault();
      this.isPanning.set(true);
      this.lastPanPoint = { x: event.clientX, y: event.clientY };
    }
  }

  onFlowMouseMove(event: MouseEvent): void {
    if (!this.isPanning()) return;

    const deltaX = (event.clientX - this.lastPanPoint.x) / this.zoom();
    const deltaY = (event.clientY - this.lastPanPoint.y) / this.zoom();

    this.panX.update(x => x + deltaX);
    this.panY.update(y => y + deltaY);

    this.lastPanPoint = { x: event.clientX, y: event.clientY };
  }

  onFlowMouseUp(): void {
    this.isPanning.set(false);
  }

  onFlowMouseLeave(): void {
    this.isPanning.set(false);
  }
}
