import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
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
import { ChipModule } from 'primeng/chip';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProcessService, ExecutionVariable } from '../../services/process.service';
import { ProgressBar } from 'primeng/progressbar';
import { GroqService } from '../../services/groq.service';
import { ApiService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';
import {
  NODE_TYPES_METADATA,
  ProcessNodeType,
  ProcessNode,
  ACTIVO_PROPIEDADES_BASE,
  WEBHOOK_METHODS,
  WEBHOOK_AUTH_TYPES,
  WEBHOOK_CONTENT_TYPES,
  WEBHOOK_RETRY_STRATEGIES,
  DEFAULT_WEBHOOK_NODE_CONFIG,
  TRANSFORMACION_OPERACIONES,
  FILTER_OPERATORS,
  AGGREGATE_FUNCTIONS,
  FIELD_TRANSFORMS,
  DEFAULT_TRANSFORMACION_NODE_CONFIG,
  WebhookNodeConfig,
  TransformacionNodeConfig,
  FilterCondition,
  FilterConditionGroup,
  SortField,
  AggregateField,
  MapFieldConfig
} from '../../models/process-nodes';
import { Activo, PlantillaActivo } from '../../models';

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
    RouterLink,
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
    ProgressBar,
    MultiSelectModule,
    ChipModule,
    AccordionModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './procesos.html',
  styleUrl: './procesos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesosComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  private api = inject(ApiService);
  processService = inject(ProcessService);
  groqService = inject(GroqService);
  themeService = inject(ThemeService);

  // Data local cargada desde API
  activosData = signal<Activo[]>([]);
  plantillasData = signal<PlantillaActivo[]>([]);

  // Background del canvas dinámico según el tema
  vflowBackground = computed(() => {
    const isDark = this.themeService.isDarkMode();
    return {
      type: 'dots' as const,
      backgroundColor: isDark ? '#18181b' : '#fafafa',  // Fondo del canvas
      color: isDark ? '#3f3f46' : '#a1a1aa',            // Color de los puntos (zinc-700 / zinc-400)
      gap: 16,
      size: 2
    };
  });

  // ID del proceso actual (de la ruta)
  procesoId = signal<string | null>(null);

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
      type: 'html-template' as const,
      data: {
        nodeType: node.type,
        config: node.config,
        label: node.label
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

  // =============== PROCESS RUNNER SIGNALS ===============
  showVariableDetailDialog = signal(false);
  selectedVariable = signal<ExecutionVariable | null>(null);
  runnerActiveTab = signal<'flow' | 'variables' | 'context' | 'history'>('flow');

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

  // Opciones de departamentos para filtrar activos
  areaOptions = [
    { label: 'Todos los departamentos', value: '' },
    { label: 'TI', value: 'TI' },
    { label: 'Tecnología', value: 'Tecnologia' },
    { label: 'Infraestructura', value: 'Infraestructura' },
    { label: 'Operaciones', value: 'Operaciones' },
    { label: 'Ventas', value: 'Ventas' },
    { label: 'Dirección', value: 'Direccion' }
  ];

  // Departamento seleccionado actualmente en el nodo
  areaSeleccionadaActivo = computed<string>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return '';
    return ((node.config as unknown as Record<string, unknown>)['area'] as string) || '';
  });

  // Opciones de activos filtradas por departamento
  activoOptions = computed(() => {
    const area = this.areaSeleccionadaActivo();
    let activos = this.activosData();

    if (area) {
      activos = activos.filter(a => a.departamento === area);
    }

    return activos.map(a => ({
      label: `${a.nombre} (${a.tipo})`,
      value: a.id
    }));
  });

  // Contadores de selecciones para los labels
  contadorPropiedadesBase = computed(() => this.propiedadesExpuestasSeleccionadas().length);
  contadorPropiedadesCustom = computed(() => this.propiedadesCustomExpuestasSeleccionadas().length);
  contadorRiesgos = computed(() => this.riesgosSeleccionados().length);
  contadorIncidentes = computed(() => this.incidentesSeleccionados().length);
  contadorDefectos = computed(() => this.defectosSeleccionados().length);

  // ==================== CONFIGURACIÓN NODO ACTIVO ====================

  // Propiedades base para multiselect (formato label/value)
  propiedadesBaseOptionsForSelect = ACTIVO_PROPIEDADES_BASE.map(p => ({
    label: p.nombre,
    value: p.campo
  }));

  // Activo seleccionado en el nodo actual
  activoSeleccionadoParaNodo = computed<Activo | null>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return null;
    const activoId = (node.config as unknown as Record<string, unknown>)['activoId'] as string;
    if (!activoId) return null;
    return this.activosData().find(a => a.id === activoId) || null;
  });

  // Plantilla del activo seleccionado
  plantillaDelActivo = computed<PlantillaActivo | null>(() => {
    const activo = this.activoSeleccionadoParaNodo();
    if (!activo) return null;
    if (activo.plantillaId) {
      return this.plantillasData().find(p => p.id === activo.plantillaId) || null;
    }
    return this.plantillasData().find(p => p.tipoActivo === activo.tipo) || null;
  });

  // Propiedades custom para multiselect (con valor actual)
  propiedadesCustomOptionsForSelect = computed(() => {
    const plantilla = this.plantillaDelActivo();
    const activo = this.activoSeleccionadoParaNodo();
    if (!plantilla) return [];

    return plantilla.propiedades.map(p => {
      let valorActual = '';
      if (activo?.propiedadesCustom) {
        const prop = activo.propiedadesCustom.find(pc => pc.campo === p.campo);
        if (prop) {
          const v = prop.valor;
          if (Array.isArray(v)) valorActual = v.join(', ');
          else if (v instanceof Date) valorActual = v.toLocaleDateString();
          else if (typeof v === 'boolean') valorActual = v ? 'Sí' : 'No';
          else valorActual = String(v);
        }
      }
      return {
        label: valorActual ? `${p.nombre} (${valorActual})` : p.nombre,
        value: p.campo
      };
    });
  });

  // Propiedades base seleccionadas actualmente
  propiedadesExpuestasSeleccionadas = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    return (config['propiedadesExpuestas'] as string[]) || [];
  });

  // Propiedades custom seleccionadas actualmente
  propiedadesCustomExpuestasSeleccionadas = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    return (config['propiedadesCustomExpuestas'] as string[]) || [];
  });

  // Riesgos como opciones para multiselect
  riesgosOptionsForSelect = computed(() => {
    const activo = this.activoSeleccionadoParaNodo();
    if (!activo) return [];
    return activo.riesgos.map(r => ({
      label: `${r.descripcion} (P:${r.probabilidad} I:${r.impacto} - ${r.estado})`,
      value: r.id
    }));
  });

  // Incidentes como opciones para multiselect
  incidentesOptionsForSelect = computed(() => {
    const activo = this.activoSeleccionadoParaNodo();
    if (!activo) return [];
    return activo.incidentes.map(i => ({
      label: `${i.titulo} (${i.severidad} - ${i.estado})`,
      value: i.id
    }));
  });

  // Defectos como opciones para multiselect
  defectosOptionsForSelect = computed(() => {
    const activo = this.activoSeleccionadoParaNodo();
    if (!activo) return [];
    return activo.defectos.map(d => ({
      label: `${d.titulo} (${d.tipo} - ${d.estado})`,
      value: d.id
    }));
  });

  // IDs de riesgos seleccionados
  riesgosSeleccionados = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    return (config['riesgosSeleccionados'] as string[]) || [];
  });

  // IDs de incidentes seleccionados
  incidentesSeleccionados = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    return (config['incidentesSeleccionados'] as string[]) || [];
  });

  // IDs de defectos seleccionados
  defectosSeleccionados = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    return (config['defectosSeleccionados'] as string[]) || [];
  });

  // Variables de salida generadas
  variablesSalidaActivo = computed<string[]>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'activo') return [];
    const config = node.config as unknown as Record<string, unknown>;
    const propExpuestas = (config['propiedadesExpuestas'] as string[]) || [];
    const propCustomExpuestas = (config['propiedadesCustomExpuestas'] as string[]) || [];
    const riesgosIds = (config['riesgosSeleccionados'] as string[]) || [];
    const incidentesIds = (config['incidentesSeleccionados'] as string[]) || [];
    const defectosIds = (config['defectosSeleccionados'] as string[]) || [];

    const variables: string[] = [];

    // Variables de propiedades base
    propExpuestas.forEach(p => variables.push(`activo.${p}`));

    // Variables de propiedades custom
    propCustomExpuestas.forEach(p => variables.push(`activo.custom.${p}`));

    // Variables de riesgos seleccionados
    if (riesgosIds.length > 0) {
      variables.push(`activo.riesgos[${riesgosIds.length}]`);
    }

    // Variables de incidentes seleccionados
    if (incidentesIds.length > 0) {
      variables.push(`activo.incidentes[${incidentesIds.length}]`);
    }

    // Variables de defectos seleccionados
    if (defectosIds.length > 0) {
      variables.push(`activo.defectos[${defectosIds.length}]`);
    }

    return variables;
  });

  // Métodos para manejo de activo
  onAreaChange(area: string): void {
    this.updateNodeConfig({ area });
  }

  onActivoChange(activoId: string): void {
    const activo = this.activosData().find(a => a.id === activoId);
    if (activo) {
      this.updateNodeConfig({
        activoId,
        activoNombre: activo.nombre,
        criticidad: activo.criticidad,
        plantillaId: activo.plantillaId || '',
        propiedadesExpuestas: ['nombre', 'tipo', 'criticidad'],
        propiedadesCustomExpuestas: [],
        riesgosSeleccionados: [],
        incidentesSeleccionados: [],
        defectosSeleccionados: []
      });
    }
  }

  onPropiedadesExpuestasChange(valores: string[]): void {
    this.updateNodeConfig({ propiedadesExpuestas: valores });
  }

  onPropiedadesCustomExpuestasChange(valores: string[]): void {
    this.updateNodeConfig({ propiedadesCustomExpuestas: valores });
  }

  onRiesgosSeleccionadosChange(valores: string[]): void {
    this.updateNodeConfig({ riesgosSeleccionados: valores });
  }

  onIncidentesSeleccionadosChange(valores: string[]): void {
    this.updateNodeConfig({ incidentesSeleccionados: valores });
  }

  onDefectosSeleccionadosChange(valores: string[]): void {
    this.updateNodeConfig({ defectosSeleccionados: valores });
  }

  // Copiar texto al clipboard
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Feedback visual opcional - podría agregar un toast
      console.log('Copiado al portapapeles:', text);
    });
  }

  getValorPropiedadCustom(campo: string): any {
    const activo = this.activoSeleccionadoParaNodo();
    if (!activo || !activo.propiedadesCustom) return null;
    const prop = activo.propiedadesCustom.find(p => p.campo === campo);
    if (!prop) return null;

    // Formatear el valor para mostrar
    const valor = prop.valor;
    if (Array.isArray(valor)) {
      return valor.join(', ');
    }
    if (valor instanceof Date) {
      return valor.toLocaleDateString();
    }
    if (typeof valor === 'boolean') {
      return valor ? 'Sí' : 'No';
    }
    return valor;
  }

  // ==================== FIN CONFIGURACIÓN NODO ACTIVO ====================

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
    { key: 'integracion', label: 'Integración', icon: 'http' },
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

  // Opciones de operación transformación (expandidas)
  operacionOptions = TRANSFORMACION_OPERACIONES.map(op => ({
    label: op.label,
    value: op.value,
    icon: op.icon,
    description: op.description
  }));

  // Opciones de webhook
  webhookMethodOptions = WEBHOOK_METHODS;
  webhookAuthTypeOptions = WEBHOOK_AUTH_TYPES;
  webhookContentTypeOptions = WEBHOOK_CONTENT_TYPES;
  webhookRetryStrategyOptions = WEBHOOK_RETRY_STRATEGIES;

  // Opciones de filtro y agregación
  filterOperatorOptions = FILTER_OPERATORS;
  aggregateFunctionOptions = AGGREGATE_FUNCTIONS;
  fieldTransformOptions = FIELD_TRANSFORMS;

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

  // Opciones de tipo de comparación (CON-003)
  tipoComparacionOptions = [
    { label: 'Texto (string)', value: 'string' },
    { label: 'Número (number)', value: 'number' },
    { label: 'Booleano (true/false)', value: 'boolean' }
  ];

  // Opciones para DEDUPLICATE
  deduplicateStrategyOptions = [
    { label: 'Mantener primero', value: 'first' },
    { label: 'Mantener último', value: 'last' },
    { label: 'Mantener máximo', value: 'max' },
    { label: 'Mantener mínimo', value: 'min' }
  ];

  // Opciones para ENRICH
  enrichSourceTypeOptions = [
    { label: 'Variable del contexto', value: 'context' },
    { label: 'Lookup table', value: 'lookup' },
    { label: 'API externa', value: 'api' }
  ];

  enrichOnNotFoundOptions = [
    { label: 'Omitir registro', value: 'skip' },
    { label: 'Dejar nulo', value: 'null' },
    { label: 'Error', value: 'error' },
    { label: 'Usar valor por defecto', value: 'default' }
  ];

  // Opciones para FLATTEN
  flattenModeOptions = [
    { label: 'Expandir (un registro por elemento)', value: 'expand' },
    { label: 'Extraer (campos anidados)', value: 'extract' }
  ];

  // Opciones para SPLIT
  splitModeOptions = [
    { label: 'Expandir (múltiples registros)', value: 'expand' },
    { label: 'Array (un campo array)', value: 'array' }
  ];

  // Opciones para MERGE
  mergeJoinTypeOptions = [
    { label: 'Left Join', value: 'left' },
    { label: 'Inner Join', value: 'inner' },
    { label: 'Right Join', value: 'right' },
    { label: 'Full Join', value: 'full' }
  ];

  mergeConflictOptions = [
    { label: 'Prioridad izquierda', value: 'left' },
    { label: 'Prioridad derecha', value: 'right' },
    { label: 'Concatenar', value: 'concat' },
    { label: 'Crear array', value: 'array' }
  ];

  // Opciones para EXPRESSION
  expressionOutputTypeOptions = [
    { label: 'Texto', value: 'string' },
    { label: 'Número', value: 'number' },
    { label: 'Booleano', value: 'boolean' },
    { label: 'Objeto', value: 'object' },
    { label: 'Array', value: 'array' }
  ];

  estrategiaOptions = [
    { label: 'Paralela', value: 'paralela' },
    { label: 'Secuencial', value: 'secuencial' },
    { label: 'Prioridad', value: 'prioridad' },
    { label: 'Race (primera)', value: 'race' }
  ];

  // Opciones para estrategia de branching (BRA-002/003/004)
  estrategiaBranchingOptions = [
    { label: 'Paralela (todas simultáneamente)', value: 'paralela' },
    { label: 'Secuencial (en orden)', value: 'secuencial' },
    { label: 'Race (primera en terminar)', value: 'race' },
    { label: 'Prioridad (primera condición true)', value: 'prioridad' }
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

  // Opciones para nodo KPI
  origenValorOptions = [
    { label: 'Variable del flujo', value: 'variable' },
    { label: 'Valor fijo', value: 'fijo' },
    { label: 'Calculado (nodo previo)', value: 'calculado' }
  ];

  kpiUnidadOptions = [
    { label: 'Porcentaje (%)', value: 'porcentaje' },
    { label: 'Número', value: 'numero' },
    { label: 'Pesos MXN ($)', value: 'moneda_mxn' },
    { label: 'Dólares USD', value: 'moneda_usd' },
    { label: 'Días', value: 'tiempo_dias' },
    { label: 'Horas', value: 'tiempo_horas' },
    { label: 'Cantidad', value: 'cantidad' }
  ];

  direccionAlertaOptions = [
    { label: 'Menor que el umbral', value: 'menor' },
    { label: 'Mayor que el umbral', value: 'mayor' }
  ];

  // KPIs disponibles (obtenidos del proceso actual)
  kpisDisponibles = computed(() => {
    const proceso = this.processService.currentProceso();
    if (proceso?.kpis && proceso.kpis.length > 0) {
      return proceso.kpis.map(kpi => ({
        id: kpi.id,
        nombre: kpi.nombre,
        unidad: kpi.unidad
      }));
    }
    // Fallback: si no hay KPIs configurados, mostrar mensaje vacío
    return [];
  });

  // Modelos LLM disponibles
  llmModels = this.groqService.getAvailableModels();

  // =============== LIFECYCLE ===============

  ngOnInit(): void {
    // Cargar datos desde API
    this.cargarDatosIniciales();

    // Obtener ID de la ruta
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.procesoId.set(id);
      const loaded = this.processService.loadProceso(id);
      if (!loaded) {
        console.warn(`Proceso con ID ${id} no encontrado, redirigiendo...`);
        this.router.navigate(['/procesos']);
      }
    }
  }

  cargarDatosIniciales(): void {
    this.api.getActivos().subscribe({
      next: (data) => this.activosData.set(data),
      error: (err) => console.error('Error cargando activos:', err)
    });
    this.api.getPlantillasActivo().subscribe({
      next: (data) => this.plantillasData.set(data),
      error: (err) => console.error('Error cargando plantillas:', err)
    });
  }

  // Volver al listado
  volverAlListado(): void {
    this.router.navigate(['/procesos']);
  }

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

  // Eliminar nodo seleccionado (con confirmación)
  deleteSelectedNode(): void {
    const selected = this.processService.selectedNode();
    if (selected) {
      this.confirmationService.confirm({
        message: `¿Estás seguro de eliminar el nodo "${selected.label}"?`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'Cancelar',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.processService.deleteNode(selected.id);
          this.closeConfigSidebar();
        }
      });
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

  // Navegar al runner
  navegarRunner(): void {
    const procesoId = this.route.snapshot.paramMap.get('id');
    if (procesoId) {
      this.router.navigate(['/procesos', procesoId, 'runner']);
    } else {
      // Si no hay ID, primero guardar el proceso
      const current = this.processService.currentProceso();
      if (current?.id) {
        this.router.navigate(['/procesos', current.id, 'runner']);
      }
    }
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

  // =============== PROCESS RUNNER METHODS ===============

  // Mostrar detalle de variable
  showVariableDetail(variable: ExecutionVariable): void {
    this.selectedVariable.set(variable);
    this.showVariableDetailDialog.set(true);
  }

  // Obtener severity del tag segun tipo de variable
  getVariableTypeSeverity(type: ExecutionVariable['type']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<ExecutionVariable['type'], 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      string: 'info',
      number: 'success',
      boolean: 'warn',
      array: 'secondary',
      object: 'secondary',
      null: 'danger'
    };
    return severities[type] ?? 'secondary';
  }

  // Copiar valor de variable al portapapeles
  async copyVariableValue(variable: ExecutionVariable): Promise<void> {
    try {
      const valueStr = typeof variable.value === 'object'
        ? JSON.stringify(variable.value, null, 2)
        : String(variable.value);
      await navigator.clipboard.writeText(valueStr);
      // TODO: Mostrar toast de confirmacion
      console.log('Valor copiado al portapapeles');
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  }

  // Exportar contexto de ejecucion
  exportExecutionContext(): void {
    this.processService.downloadExecutionContext();
  }

  // Cargar ejecucion del historial
  loadHistoryExecution(executionId: string): void {
    this.processService.loadExecution(executionId);
  }

  // Formatear fecha del historial
  formatHistoryDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Seleccionar KPI y actualizar nombre y unidad automáticamente
  onKpiSelect(kpiId: string): void {
    const kpi = this.kpisDisponibles().find(k => k.id === kpiId);
    if (kpi) {
      this.updateNodeConfig({
        kpiId: kpi.id,
        kpiNombre: kpi.nombre,
        kpiUnidad: kpi.unidad
      });
    }
  }

  // Helper para obtener valor de umbral
  getUmbralValue(node: ProcessNode, field: string): unknown {
    const umbrales = (node.config as unknown as Record<string, unknown>)['umbrales'] as Record<string, unknown>;
    return umbrales ? umbrales[field] : undefined;
  }

  // Helper para actualizar umbral
  updateUmbral(field: string, value: unknown): void {
    const node = this.processService.selectedNode();
    if (node) {
      const currentUmbrales = (node.config as unknown as Record<string, unknown>)['umbrales'] as Record<string, unknown> || { direccion: 'menor' };
      this.updateNodeConfig({
        umbrales: { ...currentUmbrales, [field]: value }
      });
    }
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

  // Actualizar configuracion de un nodo por ID (para uso en template de nodos)
  updateNodeConfigById(nodeId: string, config: Record<string, unknown>): void {
    const node = this.processService.nodes().find(n => n.id === nodeId);
    if (node) {
      this.processService.updateNode(nodeId, {
        config: { ...node.config, ...config }
      });
    }
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

  // ==================== CONFIGURACIÓN NODO WEBHOOK ====================

  // Computed para obtener la configuración del webhook actual
  webhookConfig = computed<WebhookNodeConfig | null>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'webhook') return null;
    return node.config as unknown as WebhookNodeConfig;
  });

  // Tipo de autenticación actual
  webhookAuthType = computed<string>(() => {
    const config = this.webhookConfig();
    return config?.auth?.type || 'none';
  });

  // Inicializar nodo webhook con valores por defecto
  initWebhookNode(): void {
    this.updateNodeConfig(DEFAULT_WEBHOOK_NODE_CONFIG as unknown as Record<string, unknown>);
  }

  // Actualizar método HTTP
  onWebhookMethodChange(method: string): void {
    this.updateNodeConfig({ method });
  }

  // Actualizar URL
  onWebhookUrlChange(url: string): void {
    this.updateNodeConfig({ url });
  }

  // Actualizar tipo de autenticación
  onWebhookAuthTypeChange(authType: string): void {
    const authConfigs: Record<string, unknown> = {
      none: { type: 'none' },
      bearer: { type: 'bearer', token: '' },
      basic: { type: 'basic', username: '', password: '' },
      apiKey: { type: 'apiKey', key: '', value: '', location: 'header' },
      oauth2: { type: 'oauth2', clientId: '', clientSecret: '', tokenUrl: '', scope: '' }
    };
    this.updateNodeConfig({ auth: authConfigs[authType] || authConfigs['none'] });
  }

  // Actualizar propiedad de autenticación
  updateWebhookAuth(property: string, value: string): void {
    const config = this.webhookConfig();
    if (config?.auth) {
      this.updateNodeConfig({
        auth: { ...config.auth, [property]: value }
      });
    }
  }

  // Obtener campo de autenticación (para evitar errores de tipo en template)
  getWebhookAuthField(field: string): string {
    const config = this.webhookConfig();
    if (!config?.auth) return '';
    const auth = config.auth as unknown as Record<string, unknown>;
    return (auth[field] as string) || '';
  }

  // Agregar header
  addWebhookHeader(): void {
    const config = this.webhookConfig();
    const headers = { ...(config?.headers || {}), 'New-Header': '' };
    this.updateNodeConfig({ headers });
  }

  // Actualizar header
  updateWebhookHeader(oldKey: string, newKey: string, value: string): void {
    const config = this.webhookConfig();
    const headers = { ...(config?.headers || {}) };
    delete headers[oldKey];
    headers[newKey] = value;
    this.updateNodeConfig({ headers });
  }

  // Eliminar header
  removeWebhookHeader(key: string): void {
    const config = this.webhookConfig();
    const headers = { ...(config?.headers || {}) };
    delete headers[key];
    this.updateNodeConfig({ headers });
  }

  // Obtener headers como array para iteración
  getWebhookHeaders(): { key: string; value: string }[] {
    const config = this.webhookConfig();
    return Object.entries(config?.headers || {}).map(([key, value]) => ({ key, value }));
  }

  // Actualizar configuración de reintentos
  updateWebhookRetry(property: string, value: unknown): void {
    const config = this.webhookConfig();
    if (config?.retry) {
      this.updateNodeConfig({
        retry: { ...config.retry, [property]: value }
      });
    }
  }

  // Probar conexión del webhook
  async testWebhookConnection(): Promise<void> {
    const config = this.webhookConfig();
    if (!config?.url) {
      console.warn('URL requerida para probar conexión');
      return;
    }

    this.isTestRunning.set(true);
    try {
      // Llamar al endpoint de test en el backend
      const response = await fetch('/api/procesos/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const result = await response.json();
      this.testResult.set({
        success: result.success,
        data: result,
        error: result.error
      });
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

  // ==================== CONFIGURACIÓN NODO TRANSFORMACIÓN ====================

  // Computed para obtener la configuración de transformación actual
  transformConfig = computed<TransformacionNodeConfig | null>(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'transformacion') return null;
    return node.config as unknown as TransformacionNodeConfig;
  });

  // Operación actual
  transformOperation = computed<string>(() => {
    const config = this.transformConfig();
    return config?.operacion || 'filter';
  });

  // Inicializar nodo transformación con valores por defecto
  initTransformNode(): void {
    this.updateNodeConfig(DEFAULT_TRANSFORMACION_NODE_CONFIG as unknown as Record<string, unknown>);
  }

  // Cambiar operación de transformación
  onTransformOperationChange(operacion: string): void {
    this.updateNodeConfig({ operacion });
  }

  // Actualizar variable de entrada
  onTransformInputKeyChange(inputKey: string): void {
    this.updateNodeConfig({ inputKey });
  }

  // Actualizar variable de salida
  onTransformOutputKeyChange(outputKey: string): void {
    this.updateNodeConfig({ outputKey });
  }

  // ===== FILTER =====

  // Condiciones de filtro actuales
  filterConditions = computed<FilterCondition[]>(() => {
    const config = this.transformConfig();
    return config?.filterConfig?.conditionGroup?.conditions as FilterCondition[] || [];
  });

  // Agregar condición de filtro
  addFilterCondition(): void {
    const config = this.transformConfig();
    const conditions = [...(config?.filterConfig?.conditionGroup?.conditions || [])];
    conditions.push({
      field: '',
      operator: 'eq',
      value: ''
    } as FilterCondition);

    this.updateNodeConfig({
      filterConfig: {
        conditionGroup: {
          logic: config?.filterConfig?.conditionGroup?.logic || 'AND',
          conditions
        }
      }
    });
  }

  // Actualizar condición de filtro
  updateFilterCondition(index: number, property: string, value: unknown): void {
    const config = this.transformConfig();
    const conditions = [...(config?.filterConfig?.conditionGroup?.conditions || [])];
    if (conditions[index]) {
      conditions[index] = { ...conditions[index], [property]: value };
      this.updateNodeConfig({
        filterConfig: {
          conditionGroup: {
            logic: config?.filterConfig?.conditionGroup?.logic || 'AND',
            conditions
          }
        }
      });
    }
  }

  // Eliminar condición de filtro
  removeFilterCondition(index: number): void {
    const config = this.transformConfig();
    const conditions = (config?.filterConfig?.conditionGroup?.conditions || []).filter((_, i) => i !== index);
    this.updateNodeConfig({
      filterConfig: {
        conditionGroup: {
          logic: config?.filterConfig?.conditionGroup?.logic || 'AND',
          conditions
        }
      }
    });
  }

  // Cambiar lógica de filtro (AND/OR)
  toggleFilterLogic(): void {
    const config = this.transformConfig();
    const currentLogic = config?.filterConfig?.conditionGroup?.logic || 'AND';
    this.updateNodeConfig({
      filterConfig: {
        conditionGroup: {
          logic: currentLogic === 'AND' ? 'OR' : 'AND',
          conditions: config?.filterConfig?.conditionGroup?.conditions || []
        }
      }
    });
  }

  // ===== SORT =====

  // Campos de ordenamiento actuales
  sortFields = computed<SortField[]>(() => {
    const config = this.transformConfig();
    return config?.sortConfig?.fields || [];
  });

  // Agregar campo de ordenamiento
  addSortField(): void {
    const config = this.transformConfig();
    const fields = [...(config?.sortConfig?.fields || [])];
    fields.push({
      field: '',
      direction: 'asc'
    });
    this.updateNodeConfig({
      sortConfig: { fields }
    });
  }

  // Actualizar campo de ordenamiento
  updateSortField(index: number, property: string, value: unknown): void {
    const config = this.transformConfig();
    const fields = [...(config?.sortConfig?.fields || [])];
    if (fields[index]) {
      fields[index] = { ...fields[index], [property]: value };
      this.updateNodeConfig({
        sortConfig: { fields }
      });
    }
  }

  // Eliminar campo de ordenamiento
  removeSortField(index: number): void {
    const config = this.transformConfig();
    const fields = (config?.sortConfig?.fields || []).filter((_, i) => i !== index);
    this.updateNodeConfig({
      sortConfig: { fields }
    });
  }

  // ===== AGGREGATE =====

  // Campos de agregación actuales
  aggregateFields = computed<AggregateField[]>(() => {
    const config = this.transformConfig();
    return config?.aggregateConfig?.fields || [];
  });

  // Campos de GROUP BY
  aggregateGroupBy = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.aggregateConfig?.groupBy || [];
  });

  // Agregar campo de agregación
  addAggregateField(): void {
    const config = this.transformConfig();
    const fields = [...(config?.aggregateConfig?.fields || [])];
    fields.push({
      field: '',
      function: 'count',
      alias: ''
    });
    this.updateNodeConfig({
      aggregateConfig: {
        ...config?.aggregateConfig,
        fields
      }
    });
  }

  // Actualizar campo de agregación
  updateAggregateField(index: number, property: string, value: unknown): void {
    const config = this.transformConfig();
    const fields = [...(config?.aggregateConfig?.fields || [])];
    if (fields[index]) {
      fields[index] = { ...fields[index], [property]: value };
      this.updateNodeConfig({
        aggregateConfig: {
          ...config?.aggregateConfig,
          fields
        }
      });
    }
  }

  // Eliminar campo de agregación
  removeAggregateField(index: number): void {
    const config = this.transformConfig();
    const fields = (config?.aggregateConfig?.fields || []).filter((_, i) => i !== index);
    this.updateNodeConfig({
      aggregateConfig: {
        ...config?.aggregateConfig,
        fields
      }
    });
  }

  // Actualizar GROUP BY
  updateAggregateGroupBy(groupBy: string[]): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      aggregateConfig: {
        ...config?.aggregateConfig,
        groupBy
      }
    });
  }

  // Parsear string de GROUP BY y actualizar
  parseAndUpdateGroupBy(value: string): void {
    const groupBy = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateAggregateGroupBy(groupBy);
  }

  // ===== MAP =====

  // Mapeos de campos actuales
  mapFields = computed<MapFieldConfig[]>(() => {
    const config = this.transformConfig();
    return config?.mapConfig?.fields || [];
  });

  // Agregar mapeo de campo
  addMapField(): void {
    const config = this.transformConfig();
    const fields = [...(config?.mapConfig?.fields || [])];
    fields.push({
      sourceField: '',
      targetField: ''
    });
    this.updateNodeConfig({
      mapConfig: {
        ...config?.mapConfig,
        fields
      }
    });
  }

  // Actualizar mapeo de campo
  updateMapField(index: number, property: string, value: unknown): void {
    const config = this.transformConfig();
    const fields = [...(config?.mapConfig?.fields || [])];
    if (fields[index]) {
      fields[index] = { ...fields[index], [property]: value };
      this.updateNodeConfig({
        mapConfig: {
          ...config?.mapConfig,
          fields
        }
      });
    }
  }

  // Eliminar mapeo de campo
  removeMapField(index: number): void {
    const config = this.transformConfig();
    const fields = (config?.mapConfig?.fields || []).filter((_, i) => i !== index);
    this.updateNodeConfig({
      mapConfig: {
        ...config?.mapConfig,
        fields
      }
    });
  }

  // Preview de transformación
  async previewTransform(): Promise<void> {
    const config = this.transformConfig();
    if (!config) return;

    this.isTestRunning.set(true);
    try {
      const response = await fetch('/api/procesos/transform/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          context: {}, // El contexto vendría del flujo en ejecución real
          sampleSize: 10
        })
      });
      const result = await response.json();

      if (result.success && result.outputSample) {
        this.previewData.set(result.outputSample);
        if (result.outputSample.length > 0) {
          this.previewColumns.set(Object.keys(result.outputSample[0]));
        }
        this.showPreviewPanel.set(true);
      }

      this.testResult.set({
        success: result.success,
        data: result,
        error: result.error
      });
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

  // Helper para obtener descripción de operación
  getOperationDescription(operation: string): string {
    const op = TRANSFORMACION_OPERACIONES.find(o => o.value === operation);
    return op?.description || '';
  }

  // Helper para obtener icono de operación
  getOperationIcon(operation: string): string {
    const op = TRANSFORMACION_OPERACIONES.find(o => o.value === operation);
    return op?.icon || 'transform';
  }

  // ==================== MÉTODOS PARA MAP ====================

  updateMapConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      mapConfig: {
        ...config?.mapConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA DEDUPLICATE ====================

  deduplicateKeyFields = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.deduplicateConfig?.keyFields || [];
  });

  parseAndUpdateDeduplicateKeys(value: string): void {
    const keyFields = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateDeduplicateConfig('keyFields', keyFields);
  }

  updateDeduplicateConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      deduplicateConfig: {
        ...config?.deduplicateConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA ENRICH ====================

  updateEnrichConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      enrichConfig: {
        ...config?.enrichConfig,
        [property]: value
      }
    });
  }

  getEnrichMappingField(field: 'sourceField' | 'targetField'): string {
    const config = this.transformConfig();
    const mappings = config?.enrichConfig?.mappings || [];
    return mappings.length > 0 ? mappings[0][field] : '';
  }

  updateEnrichMappingField(field: 'sourceField' | 'targetField', value: string): void {
    const config = this.transformConfig();
    const mappings = config?.enrichConfig?.mappings || [{ sourceField: '', targetField: '' }];
    if (mappings.length === 0) {
      mappings.push({ sourceField: '', targetField: '' });
    }
    mappings[0] = { ...mappings[0], [field]: value };
    this.updateEnrichConfig('mappings', mappings);
  }

  getEnrichFieldsToAdd(): string {
    const config = this.transformConfig();
    const mappings = config?.enrichConfig?.mappings || [];
    return mappings.map(m => m.targetField).filter(f => f).join(', ');
  }

  updateEnrichFieldsToAdd(value: string): void {
    const config = this.transformConfig();
    const sourceField = config?.enrichConfig?.mappings?.[0]?.sourceField || '';
    const fields = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const mappings = fields.map(f => ({ sourceField, targetField: f }));
    this.updateEnrichConfig('mappings', mappings);
  }

  // ==================== MÉTODOS PARA FLATTEN ====================

  updateFlattenConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      flattenConfig: {
        ...config?.flattenConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA GROUP ====================

  groupKeyFields = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.groupConfig?.keyFields || [];
  });

  parseAndUpdateGroupKeys(value: string): void {
    const keyFields = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateGroupConfig('keyFields', keyFields);
  }

  updateGroupConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      groupConfig: {
        ...config?.groupConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA PIVOT ====================

  pivotRowFields = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.pivotConfig?.rowFields || [];
  });

  parseAndUpdatePivotRows(value: string): void {
    const rowFields = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updatePivotConfig('rowFields', rowFields);
  }

  updatePivotConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      pivotConfig: {
        ...config?.pivotConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA UNPIVOT ====================

  unpivotKeyFields = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.unpivotConfig?.keyFields || [];
  });

  unpivotColumns = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.unpivotConfig?.unpivotColumns || [];
  });

  parseAndUpdateUnpivotKeys(value: string): void {
    const keyFields = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateUnpivotConfig('keyFields', keyFields);
  }

  parseAndUpdateUnpivotColumns(value: string): void {
    const columns = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateUnpivotConfig('unpivotColumns', columns);
  }

  updateUnpivotConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      unpivotConfig: {
        ...config?.unpivotConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA SPLIT ====================

  updateSplitConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      splitConfig: {
        ...config?.splitConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA MERGE ====================

  mergeSources = computed<string[]>(() => {
    const config = this.transformConfig();
    return config?.mergeConfig?.sources || [];
  });

  parseAndUpdateMergeSources(value: string): void {
    const sources = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    this.updateMergeConfig('sources', sources);
  }

  getMergeJoinKey(side: 'left' | 'right'): string {
    const config = this.transformConfig();
    const joinKeys = config?.mergeConfig?.joinKeys || [];
    return joinKeys.length > 0 ? joinKeys[0][side] : '';
  }

  updateMergeJoinKey(side: 'left' | 'right', value: string): void {
    const config = this.transformConfig();
    const joinKeys = config?.mergeConfig?.joinKeys || [{ left: '', right: '' }];
    if (joinKeys.length === 0) {
      joinKeys.push({ left: '', right: '' });
    }
    joinKeys[0] = { ...joinKeys[0], [side]: value };
    this.updateMergeConfig('joinKeys', joinKeys);
  }

  updateMergeConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      mergeConfig: {
        ...config?.mergeConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA EXPRESSION ====================

  updateExpressionConfig(property: string, value: unknown): void {
    const config = this.transformConfig();
    this.updateNodeConfig({
      expressionConfig: {
        ...config?.expressionConfig,
        [property]: value
      }
    });
  }

  // ==================== MÉTODOS PARA NODO MATEMÁTICO ====================

  // Signal para el error de fórmula
  private formulaErrorSignal = signal<string>('');

  // Computed para contar variables numéricas
  numericVariablesCount = computed(() => {
    return this.availableVariables().filter(v => v.type === 'number').length;
  });

  // Obtener ejemplo de precisión
  getPrecisionExample(): string {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'matematico') return '1,234.57';
    const precision = (node.config as unknown as Record<string, unknown>)['precision'] as number ?? 2;
    return this.formatWithPrecision(1234.56789, precision);
  }

  // Valores de ejemplo para preview de fórmulas
  private sampleValues: Record<string, number> = {
    'archivo.nombre': 0,
    'archivo.email': 0,
    'archivo.status': 0,
    'activo.id': 1,
    'activo.criticidad': 3,
    'activo.valor': 150000,
    'precio': 100,
    'cantidad': 10,
    'impuesto': 0.16,
    'descuento': 0.05,
    'total': 1000,
    'a': 5,
    'b': 3,
    'c': 2,
    'x': 10,
    'y': 20
  };

  // Computed para validar si la fórmula es válida
  formulaIsValid = computed(() => {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'matematico') return false;
    const formula = (node.config as unknown as Record<string, unknown>)['formula'] as string;
    if (!formula) return false;

    try {
      this.validateFormula(formula);
      return true;
    } catch {
      return false;
    }
  });

  // Obtener mensaje de error de la fórmula
  formulaError(): string {
    return this.formulaErrorSignal();
  }

  // Validar sintaxis de fórmula
  private validateFormula(formula: string): void {
    // Verificar paréntesis balanceados
    let depth = 0;
    for (const char of formula) {
      if (char === '(') depth++;
      if (char === ')') depth--;
      if (depth < 0) {
        this.formulaErrorSignal.set('Paréntesis no balanceados: cierre sin apertura');
        throw new Error('Unbalanced parentheses');
      }
    }
    if (depth !== 0) {
      this.formulaErrorSignal.set('Paréntesis no balanceados: falta cerrar');
      throw new Error('Unbalanced parentheses');
    }

    // Verificar operadores consecutivos inválidos
    if (/[+\-*/^%]{2,}/.test(formula.replace(/\s/g, ''))) {
      this.formulaErrorSignal.set('Operadores consecutivos no válidos');
      throw new Error('Consecutive operators');
    }

    // Verificar que no empiece o termine con operador binario
    const trimmed = formula.trim();
    if (/^[*/^%]/.test(trimmed)) {
      this.formulaErrorSignal.set('No puede empezar con operador de multiplicación/división');
      throw new Error('Invalid start operator');
    }
    if (/[+\-*/^%]$/.test(trimmed)) {
      this.formulaErrorSignal.set('No puede terminar con un operador');
      throw new Error('Invalid end operator');
    }

    // Intentar evaluar con valores de ejemplo
    try {
      this.evaluateFormula(formula);
      this.formulaErrorSignal.set('');
    } catch (e) {
      this.formulaErrorSignal.set('Error de sintaxis: ' + (e as Error).message);
      throw e;
    }
  }

  // Evaluar fórmula con valores de ejemplo
  private evaluateFormula(formula: string): number {
    // Reemplazar funciones personalizadas
    let processedFormula = formula
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/round\(/g, 'Math.round(')
      .replace(/min\(/g, 'Math.min(')
      .replace(/max\(/g, 'Math.max(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pow\(/g, 'Math.pow(')
      .replace(/\^/g, '**');

    // Reemplazar variables con valores de ejemplo
    for (const [varName, value] of Object.entries(this.sampleValues)) {
      const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processedFormula = processedFormula.replace(new RegExp(`\\b${escaped}\\b`, 'g'), String(value));
    }

    // Evaluar de forma segura (solo permitir caracteres matemáticos)
    if (!/^[\d\s+\-*/().^%,Math.sqrtabsroundminmaxsincostanlogexppow]+$/.test(processedFormula.replace(/\*\*/g, ''))) {
      // Si hay variables no reconocidas, asignarles un valor por defecto
      processedFormula = processedFormula.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?\b/g, '1');
    }

    // Evaluar usando Function (más seguro que eval directo)
    const fn = new Function(`return ${processedFormula}`);
    const result = fn();

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Resultado no es un número válido');
    }

    return result;
  }

  // Handler para cambio de fórmula
  onFormulaChange(formula: string): void {
    this.updateNodeConfig({ formula });
    if (formula) {
      try {
        this.validateFormula(formula);
      } catch {
        // El error ya está en formulaErrorSignal
      }
    }
  }

  // Obtener fórmula expandida con valores de ejemplo
  getFormulaExpanded(): string {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'matematico') return '';
    const formula = (node.config as unknown as Record<string, unknown>)['formula'] as string;
    if (!formula) return '';

    let expanded = formula;
    for (const [varName, value] of Object.entries(this.sampleValues)) {
      const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expanded = expanded.replace(new RegExp(`\\b${escaped}\\b`, 'g'), String(value));
    }

    // Reemplazar variables no reconocidas con 1
    expanded = expanded.replace(/\b[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?\b/g, (match) => {
      // No reemplazar funciones
      if (['sqrt', 'abs', 'round', 'min', 'max', 'sin', 'cos', 'tan', 'log', 'exp', 'pow'].includes(match)) {
        return match;
      }
      return '1';
    });

    return expanded;
  }

  // Evaluar fórmula y mostrar resultado con preview
  evaluateFormulaPreview(): string {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'matematico') return '';
    const formula = (node.config as unknown as Record<string, unknown>)['formula'] as string;
    const precision = (node.config as unknown as Record<string, unknown>)['precision'] as number ?? 2;

    if (!formula) return '';

    try {
      const result = this.evaluateFormula(formula);
      return this.formatWithPrecision(result, precision);
    } catch {
      return 'Error';
    }
  }

  // Formatear número con precisión
  formatWithPrecision(value: number, precision: number): string {
    if (typeof precision !== 'number') precision = 2;
    return value.toLocaleString('es-MX', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  }

  // ==================== MÉTODOS PARA NODO CONDICIONAL ====================

  // Descripción del operador (CON-002)
  getOperadorDescription(operador: string | unknown): string {
    const op = String(operador || '');
    const descriptions: Record<string, string> = {
      '==': 'Compara si los valores son exactamente iguales',
      '!=': 'Compara si los valores son diferentes',
      '>': 'Verifica si el valor es mayor',
      '<': 'Verifica si el valor es menor',
      '>=': 'Verifica si el valor es mayor o igual',
      '<=': 'Verifica si el valor es menor o igual',
      'contains': 'Verifica si el texto contiene la subcadena',
      'startsWith': 'Verifica si el texto comienza con el valor',
      'endsWith': 'Verifica si el texto termina con el valor'
    };
    return descriptions[op] || 'Selecciona un operador';
  }

  // Símbolo visual del operador (CON-005)
  getOperadorSymbol(operador: string | unknown): string {
    const op = String(operador || '');
    const symbols: Record<string, string> = {
      '==': '=',
      '!=': '≠',
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
      'contains': '∋',
      'startsWith': '^=',
      'endsWith': '$='
    };
    return symbols[op] || '?';
  }

  // Evaluar condición con datos de ejemplo (CON-005)
  evaluateConditionPreview(): boolean {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'condicional') return false;

    const config = node.config as unknown as Record<string, unknown>;
    const variable = config['variable'] as string;
    const operador = config['operador'] as string;
    const valor = config['valor'] as string;
    const tipo = (config['tipoComparacion'] as string) || 'string';

    if (!variable || !operador) return false;

    // Obtener valor de ejemplo para la variable
    let varValue: string | number | boolean = '';
    const sampleVar = this.availableVariables().find(v => v.name === variable);
    if (sampleVar) {
      // Usar valores de ejemplo basados en el tipo
      if (sampleVar.type === 'number') {
        varValue = this.sampleValues[variable] ?? 100;
      } else if (sampleVar.type === 'string') {
        varValue = variable.includes('status') ? 'activo' : 'texto_ejemplo';
      } else {
        varValue = this.sampleValues[variable] ?? 'valor';
      }
    } else {
      varValue = this.sampleValues[variable] ?? 'valor_ejemplo';
    }

    // Convertir valores según el tipo de comparación
    let left: string | number | boolean = varValue;
    let right: string | number | boolean = valor || '';

    if (tipo === 'number') {
      left = Number(varValue) || 0;
      right = Number(valor) || 0;
    } else if (tipo === 'boolean') {
      left = String(varValue).toLowerCase() === 'true';
      right = String(valor).toLowerCase() === 'true';
    }

    // Evaluar condición
    switch (operador) {
      case '==': return left === right;
      case '!=': return left !== right;
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case 'contains': return String(left).includes(String(right));
      case 'startsWith': return String(left).startsWith(String(right));
      case 'endsWith': return String(left).endsWith(String(right));
      default: return false;
    }
  }

  // ==================== MÉTODOS PARA NODO BRANCHING ====================

  // Interfaz interna para ramas
  private defaultBranches = [
    { id: 'rama-1', nombre: 'Rama 1', tieneCondicion: false, condicion: '' },
    { id: 'rama-2', nombre: 'Rama 2', tieneCondicion: false, condicion: '' }
  ];

  // Obtener descripción de estrategia
  getEstrategiaDescription(estrategia: unknown): string {
    const descriptions: Record<string, string> = {
      'paralela': 'Todas las ramas se ejecutan simultáneamente',
      'secuencial': 'Las ramas se ejecutan una después de otra',
      'race': 'La primera rama en terminar continúa, las demás se cancelan',
      'prioridad': 'Se ejecuta solo la primera rama cuya condición sea verdadera'
    };
    return descriptions[String(estrategia)] || 'Selecciona una estrategia';
  }

  // Obtener etiqueta de estrategia
  getEstrategiaLabel(estrategia: unknown): string {
    const labels: Record<string, string> = {
      'paralela': 'Paralela',
      'secuencial': 'Secuencial',
      'race': 'Race',
      'prioridad': 'Prioridad'
    };
    return labels[String(estrategia)] || 'Paralela';
  }

  // Obtener cantidad de ramas
  getBranchCount(): number {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'branching') return 2;
    const config = node.config as unknown as Record<string, unknown>;
    const ramas = config['ramas'] as unknown[];
    return Array.isArray(ramas) ? ramas.length : 2;
  }

  // Obtener array de ramas
  getBranches(): Array<{ id: string; nombre: string; tieneCondicion: boolean; condicion: string }> {
    const node = this.processService.selectedNode();
    if (!node || node.type !== 'branching') return this.defaultBranches;
    const config = node.config as unknown as Record<string, unknown>;
    const ramas = config['ramas'] as Array<{ id: string; nombre: string; tieneCondicion?: boolean; condicion?: string }>;
    if (!Array.isArray(ramas) || ramas.length === 0) {
      // Inicializar con ramas por defecto si no hay
      this.updateNodeConfig({ ramas: this.defaultBranches });
      return this.defaultBranches;
    }
    return ramas.map(r => ({
      id: r.id,
      nombre: r.nombre || '',
      tieneCondicion: r.tieneCondicion || false,
      condicion: r.condicion || ''
    }));
  }

  // Agregar nueva rama
  addBranch(): void {
    const ramas = this.getBranches();
    if (ramas.length >= 10) return;
    const newId = `rama-${Date.now()}`;
    const newBranch = {
      id: newId,
      nombre: `Rama ${ramas.length + 1}`,
      tieneCondicion: false,
      condicion: ''
    };
    this.updateNodeConfig({ ramas: [...ramas, newBranch] });
  }

  // Eliminar rama
  removeBranch(id: string): void {
    const ramas = this.getBranches();
    if (ramas.length <= 2) return;
    const newRamas = ramas.filter(r => r.id !== id);
    this.updateNodeConfig({ ramas: newRamas });
  }

  // Actualizar nombre de rama
  updateBranchName(id: string, nombre: string): void {
    const ramas = this.getBranches();
    const updated = ramas.map(r => r.id === id ? { ...r, nombre } : r);
    this.updateNodeConfig({ ramas: updated });
  }

  // Actualizar condición de rama
  updateBranchCondition(id: string, field: 'tieneCondicion' | 'condicion', value: boolean | string): void {
    const ramas = this.getBranches();
    const updated = ramas.map(r => r.id === id ? { ...r, [field]: value } : r);
    this.updateNodeConfig({ ramas: updated });
  }
}
