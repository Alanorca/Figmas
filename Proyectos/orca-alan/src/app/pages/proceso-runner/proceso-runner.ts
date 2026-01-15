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
    InputIconModule
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
    this.activeTabIndex.set(0); // Cambiar a tab de resultado
  }

  // ============ Variables ============

  selectVariable(variable: OutputVariable): void {
    this.selectedVariable.set(variable);
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
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
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
