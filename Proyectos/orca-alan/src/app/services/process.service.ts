import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Proceso,
  ProcessNode,
  ProcessEdge,
  ProcessNodeType,
  ActivoNodeConfig,
  CsvNodeConfig,
  TransformacionNodeConfig,
  CondicionalNodeConfig,
  LlmNodeConfig,
  BranchingNodeConfig,
  EstadoNodeConfig,
  MatematicoNodeConfig,
  MlNodeConfig
} from '../models/process-nodes';
import { GroqService } from './groq.service';

// Interfaz para el resultado de ejecución
export interface ExecutionResult {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  output?: unknown;
  error?: string;
  duration?: number;
}

export interface ProcessExecution {
  id: string;
  procesoId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  results: ExecutionResult[];
  context: Record<string, unknown>;
}

const STORAGE_KEY = 'orca_procesos';
const EXECUTIONS_KEY = 'orca_executions';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private groqService = inject(GroqService);

  // Procesos guardados
  private _procesos = signal<Proceso[]>([]);
  procesos = this._procesos.asReadonly();

  // Proceso actualmente siendo editado
  private _currentProceso = signal<Proceso | null>(null);
  currentProceso = this._currentProceso.asReadonly();

  // Nodos del proceso actual
  private _nodes = signal<ProcessNode[]>([]);
  nodes = this._nodes.asReadonly();

  // Edges del proceso actual
  private _edges = signal<ProcessEdge[]>([]);
  edges = this._edges.asReadonly();

  // Nodo seleccionado para edición
  private _selectedNode = signal<ProcessNode | null>(null);
  selectedNode = this._selectedNode.asReadonly();

  // Estado de ejecución
  private _isExecuting = signal(false);
  isExecuting = this._isExecuting.asReadonly();

  private _currentExecution = signal<ProcessExecution | null>(null);
  currentExecution = this._currentExecution.asReadonly();

  private _executionResults = signal<ExecutionResult[]>([]);
  executionResults = this._executionResults.asReadonly();

  // Estadísticas del proceso actual
  stats = computed(() => ({
    totalNodes: this._nodes().length,
    nodesByType: this.countNodesByType(),
    totalEdges: this._edges().length,
    hasLlmNodes: this._nodes().some(n => n.type === 'llm'),
    isValid: this.validateProcess()
  }));

  constructor() {
    this.loadFromStorage();
    // Crear procesos de demo si no existen
    this.ensureDemoProcessesExist();
    // Cargar el primer proceso por defecto
    const procesos = this._procesos();
    if (procesos.length > 0 && !this._currentProceso()) {
      this.loadProceso(procesos[0].id);
    }
  }

  // Verificar que los procesos de demo existan
  private ensureDemoProcessesExist(): void {
    const demoIds = ['proc-demo-001', 'proc-demo-002', 'proc-demo-003', 'proc-demo-004', 'proc-demo-005'];
    const existingIds = new Set(this._procesos().map(p => p.id));

    // Si no existe ningún proceso de demo, crearlos todos
    const hasAnyDemo = demoIds.some(id => existingIds.has(id));
    if (!hasAnyDemo) {
      this.createDemoProcesses();
    }
  }

  // =============== PROCESOS DE DEMOSTRACIÓN ===============

  // Método público para forzar la recreación de procesos demo
  resetDemoProcesses(): void {
    // Eliminar procesos demo existentes
    const demoIds = ['proc-demo-001', 'proc-demo-002', 'proc-demo-003', 'proc-demo-004', 'proc-demo-005'];
    this._procesos.update(list => list.filter(p => !demoIds.includes(p.id)));
    // Recrear procesos demo
    this.createDemoProcesses();
    // Guardar y recargar
    this.saveToStorage();
    const procesos = this._procesos();
    if (procesos.length > 0) {
      this.loadProceso(procesos[0].id);
    }
  }

  // Método para limpiar todo el localStorage y empezar de nuevo
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXECUTIONS_KEY);
    this._procesos.set([]);
    this._currentProceso.set(null);
    this._nodes.set([]);
    this._edges.set([]);
    this.createDemoProcesses();
    const procesos = this._procesos();
    if (procesos.length > 0) {
      this.loadProceso(procesos[0].id);
    }
  }

  private createDemoProcesses(): void {
    // 1. Análisis de Riesgo de Créditos
    this.createDemoProcess1();
    // 2. Monitoreo de Activos TI
    this.createDemoProcess2();
    // 3. Clasificación de Incidentes
    this.createDemoProcess3();
    // 4. Evaluación de Proveedores
    this.createDemoProcess4();
    // 5. Auditoría de Cumplimiento
    this.createDemoProcess5();
  }

  private createDemoProcess1(): void {
    const proceso: Proceso = {
      id: 'proc-demo-001',
      nombre: 'Análisis de Riesgo de Créditos',
      descripcion: 'Proceso automatizado para evaluar el riesgo crediticio de solicitudes usando IA',
      version: '1.2.0',
      estado: 'activo',
      createdAt: new Date('2024-11-15'),
      updatedAt: new Date('2024-12-10'),
      createdBy: 'admin',
      nodes: [
        {
          id: 'node-csv-1',
          type: 'csv',
          label: 'Solicitudes de Crédito',
          position: { x: 100, y: 150 },
          config: {
            fileName: 'solicitudes_credito.csv',
            columns: ['id', 'cliente', 'monto', 'ingreso_mensual', 'historial_credito', 'años_empleo'],
            rowCount: 150,
            delimiter: ',',
            hasHeaders: true
          } as CsvNodeConfig
        },
        {
          id: 'node-trans-1',
          type: 'transformacion',
          label: 'Calcular Ratio Deuda/Ingreso',
          position: { x: 400, y: 150 },
          config: {
            operacion: 'mapear',
            mappings: [
              { source: 'monto', target: 'ratio_deuda' }
            ]
          } as TransformacionNodeConfig
        },
        {
          id: 'node-llm-1',
          type: 'llm',
          label: 'Análisis IA de Riesgo',
          position: { x: 700, y: 150 },
          config: {
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            prompt: 'Analiza el siguiente perfil crediticio y proporciona una evaluación de riesgo:\n\nCliente: {{cliente}}\nMonto solicitado: {{monto}}\nHistorial crediticio: {{historial_credito}}\nAños de empleo: {{años_empleo}}\n\nProporciona: nivel de riesgo (bajo/medio/alto), score de 0-100, y recomendación.',
            systemPrompt: 'Eres un analista de riesgo crediticio experto. Evalúa perfiles de crédito de forma objetiva.',
            temperature: 0.3,
            maxTokens: 500,
            inputVariables: ['cliente', 'monto', 'historial_credito', 'años_empleo'],
            outputVariable: 'analisis_riesgo'
          } as LlmNodeConfig
        },
        {
          id: 'node-cond-1',
          type: 'condicional',
          label: '¿Riesgo Aceptable?',
          position: { x: 1000, y: 150 },
          config: {
            variable: 'score_riesgo',
            operador: '>',
            valor: '60',
            tipoComparacion: 'number'
          } as CondicionalNodeConfig
        },
        {
          id: 'node-estado-1',
          type: 'estado',
          label: 'Crédito Aprobado',
          position: { x: 1300, y: 50 },
          config: {
            tipoEstado: 'success',
            nombreEstado: 'Aprobado',
            mensaje: 'Solicitud de crédito aprobada. Proceder con desembolso.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        },
        {
          id: 'node-estado-2',
          type: 'estado',
          label: 'Crédito Rechazado',
          position: { x: 1300, y: 250 },
          config: {
            tipoEstado: 'error',
            nombreEstado: 'Rechazado',
            mensaje: 'Solicitud rechazada por alto riesgo crediticio.',
            notificar: true,
            accionSiguiente: 'detener'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-1', sourceNodeId: 'node-csv-1', targetNodeId: 'node-trans-1' },
        { id: 'edge-2', sourceNodeId: 'node-trans-1', targetNodeId: 'node-llm-1' },
        { id: 'edge-3', sourceNodeId: 'node-llm-1', targetNodeId: 'node-cond-1' },
        { id: 'edge-4', sourceNodeId: 'node-cond-1', targetNodeId: 'node-estado-1', sourceHandle: 'true' },
        { id: 'edge-5', sourceNodeId: 'node-cond-1', targetNodeId: 'node-estado-2', sourceHandle: 'false' }
      ]
    };
    this._procesos.update(list => [...list, proceso]);
  }

  private createDemoProcess2(): void {
    const proceso: Proceso = {
      id: 'proc-demo-002',
      nombre: 'Monitoreo de Activos TI',
      descripcion: 'Monitoreo continuo de activos tecnológicos con cálculo de score de riesgo',
      version: '2.0.0',
      estado: 'activo',
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-12-08'),
      createdBy: 'admin',
      nodes: [
        {
          id: 'node-activo-1',
          type: 'activo',
          label: 'Servidor Principal',
          position: { x: 100, y: 150 },
          config: {
            area: 'Infraestructura TI',
            activoId: 'SRV-001',
            activoNombre: 'Servidor de Base de Datos',
            criticidad: 'alta'
          } as ActivoNodeConfig
        },
        {
          id: 'node-activo-2',
          type: 'activo',
          label: 'Firewall Perimetral',
          position: { x: 100, y: 350 },
          config: {
            area: 'Seguridad',
            activoId: 'FW-001',
            activoNombre: 'Firewall Principal',
            criticidad: 'alta'
          } as ActivoNodeConfig
        },
        {
          id: 'node-mat-1',
          type: 'matematico',
          label: 'Calcular Score Riesgo',
          position: { x: 400, y: 250 },
          config: {
            formula: '(criticidad * 0.4) + (vulnerabilidades * 0.3) + (exposicion * 0.3)',
            variablesSalida: 'score_riesgo',
            precision: 2
          } as MatematicoNodeConfig
        },
        {
          id: 'node-cond-2',
          type: 'condicional',
          label: '¿Score > 70?',
          position: { x: 700, y: 250 },
          config: {
            variable: 'score_riesgo',
            operador: '>',
            valor: '70',
            tipoComparacion: 'number'
          } as CondicionalNodeConfig
        },
        {
          id: 'node-estado-3',
          type: 'estado',
          label: 'Alerta Crítica',
          position: { x: 1000, y: 150 },
          config: {
            tipoEstado: 'error',
            nombreEstado: 'Riesgo Alto',
            mensaje: 'Activo con riesgo alto detectado. Requiere atención inmediata.',
            notificar: true,
            accionSiguiente: 'detener'
          } as EstadoNodeConfig
        },
        {
          id: 'node-estado-4',
          type: 'estado',
          label: 'Monitoreo Normal',
          position: { x: 1000, y: 350 },
          config: {
            tipoEstado: 'success',
            nombreEstado: 'Normal',
            mensaje: 'Activos dentro de parámetros normales.',
            notificar: false,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-6', sourceNodeId: 'node-activo-1', targetNodeId: 'node-mat-1' },
        { id: 'edge-7', sourceNodeId: 'node-activo-2', targetNodeId: 'node-mat-1' },
        { id: 'edge-8', sourceNodeId: 'node-mat-1', targetNodeId: 'node-cond-2' },
        { id: 'edge-9', sourceNodeId: 'node-cond-2', targetNodeId: 'node-estado-3', sourceHandle: 'true' },
        { id: 'edge-10', sourceNodeId: 'node-cond-2', targetNodeId: 'node-estado-4', sourceHandle: 'false' }
      ]
    };
    this._procesos.update(list => [...list, proceso]);
  }

  private createDemoProcess3(): void {
    const proceso: Proceso = {
      id: 'proc-demo-003',
      nombre: 'Clasificación de Incidentes',
      descripcion: 'Clasificación automática de incidentes usando Machine Learning',
      version: '1.5.0',
      estado: 'activo',
      createdAt: new Date('2024-09-20'),
      updatedAt: new Date('2024-12-05'),
      createdBy: 'admin',
      nodes: [
        {
          id: 'node-csv-2',
          type: 'csv',
          label: 'Incidentes Reportados',
          position: { x: 100, y: 200 },
          config: {
            fileName: 'incidentes_2024.csv',
            columns: ['id', 'descripcion', 'categoria', 'prioridad', 'fecha_reporte'],
            rowCount: 500,
            delimiter: ',',
            hasHeaders: true
          } as CsvNodeConfig
        },
        {
          id: 'node-ml-1',
          type: 'ml',
          label: 'Clasificador ML',
          position: { x: 400, y: 200 },
          config: {
            modeloId: 'clf-incidentes-v2',
            modeloNombre: 'Clasificador de Incidentes',
            tipoModelo: 'clasificacion',
            inputFeatures: ['descripcion', 'categoria'],
            outputField: 'clasificacion_ml'
          } as MlNodeConfig
        },
        {
          id: 'node-branch-1',
          type: 'branching',
          label: 'Distribuir por Tipo',
          position: { x: 700, y: 200 },
          config: {
            cantidadRamas: 3,
            estrategia: 'paralela',
            ramas: [
              { id: 'rama-seg', nombre: 'Seguridad', condicion: 'tipo == "seguridad"' },
              { id: 'rama-infra', nombre: 'Infraestructura', condicion: 'tipo == "infraestructura"' },
              { id: 'rama-app', nombre: 'Aplicaciones', condicion: 'tipo == "aplicacion"' }
            ]
          } as BranchingNodeConfig
        },
        {
          id: 'node-estado-seg',
          type: 'estado',
          label: 'Cola Seguridad',
          position: { x: 1000, y: 50 },
          config: {
            tipoEstado: 'error',
            nombreEstado: 'Seguridad',
            mensaje: 'Incidente asignado al equipo de Seguridad.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        },
        {
          id: 'node-estado-infra',
          type: 'estado',
          label: 'Cola Infraestructura',
          position: { x: 1000, y: 200 },
          config: {
            tipoEstado: 'warning',
            nombreEstado: 'Infraestructura',
            mensaje: 'Incidente asignado al equipo de Infraestructura.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        },
        {
          id: 'node-estado-app',
          type: 'estado',
          label: 'Cola Aplicaciones',
          position: { x: 1000, y: 350 },
          config: {
            tipoEstado: 'info',
            nombreEstado: 'Aplicaciones',
            mensaje: 'Incidente asignado al equipo de Desarrollo.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-11', sourceNodeId: 'node-csv-2', targetNodeId: 'node-ml-1' },
        { id: 'edge-12', sourceNodeId: 'node-ml-1', targetNodeId: 'node-branch-1' },
        { id: 'edge-13', sourceNodeId: 'node-branch-1', targetNodeId: 'node-estado-seg', sourceHandle: 'rama-seg' },
        { id: 'edge-14', sourceNodeId: 'node-branch-1', targetNodeId: 'node-estado-infra', sourceHandle: 'rama-infra' },
        { id: 'edge-15', sourceNodeId: 'node-branch-1', targetNodeId: 'node-estado-app', sourceHandle: 'rama-app' }
      ]
    };
    this._procesos.update(list => [...list, proceso]);
  }

  private createDemoProcess4(): void {
    const proceso: Proceso = {
      id: 'proc-demo-004',
      nombre: 'Evaluación de Proveedores',
      descripcion: 'Proceso de evaluación y scoring de proveedores con análisis de IA',
      version: '1.0.0',
      estado: 'borrador',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-12'),
      createdBy: 'admin',
      nodes: [
        {
          id: 'node-csv-3',
          type: 'csv',
          label: 'Base de Proveedores',
          position: { x: 100, y: 150 },
          config: {
            fileName: 'proveedores_2024.csv',
            columns: ['id', 'nombre', 'pais', 'certificaciones', 'años_operacion', 'facturacion_anual'],
            rowCount: 85,
            delimiter: ',',
            hasHeaders: true
          } as CsvNodeConfig
        },
        {
          id: 'node-trans-2',
          type: 'transformacion',
          label: 'Normalizar Datos',
          position: { x: 400, y: 150 },
          config: {
            operacion: 'mapear',
            mappings: [
              { source: 'certificaciones', target: 'score_certificaciones' },
              { source: 'años_operacion', target: 'score_experiencia' }
            ]
          } as TransformacionNodeConfig
        },
        {
          id: 'node-llm-2',
          type: 'llm',
          label: 'Análisis de Riesgo Proveedor',
          position: { x: 700, y: 150 },
          config: {
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            prompt: 'Evalúa el riesgo del siguiente proveedor:\n\nNombre: {{nombre}}\nPaís: {{pais}}\nCertificaciones: {{certificaciones}}\nAños de operación: {{años_operacion}}\n\nConsidera riesgos geopolíticos, financieros y operacionales. Proporciona un score de 0-100.',
            systemPrompt: 'Eres un experto en gestión de riesgos de terceros y cadena de suministro.',
            temperature: 0.4,
            maxTokens: 400,
            inputVariables: ['nombre', 'pais', 'certificaciones', 'años_operacion'],
            outputVariable: 'evaluacion_proveedor'
          } as LlmNodeConfig
        },
        {
          id: 'node-mat-2',
          type: 'matematico',
          label: 'Score Final',
          position: { x: 1000, y: 150 },
          config: {
            formula: '(score_certificaciones * 0.3) + (score_experiencia * 0.3) + (score_riesgo_ia * 0.4)',
            variablesSalida: 'score_final',
            precision: 1
          } as MatematicoNodeConfig
        },
        {
          id: 'node-estado-5',
          type: 'estado',
          label: 'Evaluación Completada',
          position: { x: 1300, y: 150 },
          config: {
            tipoEstado: 'success',
            nombreEstado: 'Evaluado',
            mensaje: 'Evaluación de proveedor completada. Score registrado.',
            notificar: false,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-16', sourceNodeId: 'node-csv-3', targetNodeId: 'node-trans-2' },
        { id: 'edge-17', sourceNodeId: 'node-trans-2', targetNodeId: 'node-llm-2' },
        { id: 'edge-18', sourceNodeId: 'node-llm-2', targetNodeId: 'node-mat-2' },
        { id: 'edge-19', sourceNodeId: 'node-mat-2', targetNodeId: 'node-estado-5' }
      ]
    };
    this._procesos.update(list => [...list, proceso]);
  }

  private createDemoProcess5(): void {
    const proceso: Proceso = {
      id: 'proc-demo-005',
      nombre: 'Auditoría de Cumplimiento SOX',
      descripcion: 'Proceso de auditoría automatizada para verificar controles SOX',
      version: '3.1.0',
      estado: 'activo',
      createdAt: new Date('2024-06-15'),
      updatedAt: new Date('2024-12-11'),
      createdBy: 'admin',
      nodes: [
        {
          id: 'node-activo-3',
          type: 'activo',
          label: 'Control SOX-404',
          position: { x: 100, y: 100 },
          config: {
            area: 'Cumplimiento',
            activoId: 'CTL-SOX-404',
            activoNombre: 'Control de Accesos Financieros',
            criticidad: 'alta'
          } as ActivoNodeConfig
        },
        {
          id: 'node-activo-4',
          type: 'activo',
          label: 'Control SOX-302',
          position: { x: 100, y: 300 },
          config: {
            area: 'Cumplimiento',
            activoId: 'CTL-SOX-302',
            activoNombre: 'Certificación de Estados Financieros',
            criticidad: 'alta'
          } as ActivoNodeConfig
        },
        {
          id: 'node-cond-3',
          type: 'condicional',
          label: '¿Evidencia Completa?',
          position: { x: 400, y: 200 },
          config: {
            variable: 'evidencias_completas',
            operador: '==',
            valor: 'true',
            tipoComparacion: 'boolean'
          } as CondicionalNodeConfig
        },
        {
          id: 'node-llm-3',
          type: 'llm',
          label: 'Análisis de Cumplimiento',
          position: { x: 700, y: 100 },
          config: {
            provider: 'groq',
            model: 'llama-3.3-70b-versatile',
            prompt: 'Analiza las siguientes evidencias de control SOX:\n\nControl: {{control_nombre}}\nEvidencias: {{evidencias}}\nPeriodo: {{periodo}}\n\nEvalúa si el control es efectivo, identifica gaps y proporciona recomendaciones.',
            systemPrompt: 'Eres un auditor SOX certificado con amplia experiencia en controles internos.',
            temperature: 0.2,
            maxTokens: 800,
            inputVariables: ['control_nombre', 'evidencias', 'periodo'],
            outputVariable: 'resultado_auditoria'
          } as LlmNodeConfig
        },
        {
          id: 'node-estado-6',
          type: 'estado',
          label: 'Solicitar Evidencias',
          position: { x: 700, y: 300 },
          config: {
            tipoEstado: 'warning',
            nombreEstado: 'Pendiente',
            mensaje: 'Evidencias incompletas. Notificar al responsable del control.',
            notificar: true,
            accionSiguiente: 'detener'
          } as EstadoNodeConfig
        },
        {
          id: 'node-estado-7',
          type: 'estado',
          label: 'Auditoría Completada',
          position: { x: 1000, y: 100 },
          config: {
            tipoEstado: 'success',
            nombreEstado: 'Completado',
            mensaje: 'Auditoría de control SOX completada exitosamente.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-20', sourceNodeId: 'node-activo-3', targetNodeId: 'node-cond-3' },
        { id: 'edge-21', sourceNodeId: 'node-activo-4', targetNodeId: 'node-cond-3' },
        { id: 'edge-22', sourceNodeId: 'node-cond-3', targetNodeId: 'node-llm-3', sourceHandle: 'true' },
        { id: 'edge-23', sourceNodeId: 'node-cond-3', targetNodeId: 'node-estado-6', sourceHandle: 'false' },
        { id: 'edge-24', sourceNodeId: 'node-llm-3', targetNodeId: 'node-estado-7' }
      ]
    };
    this._procesos.update(list => [...list, proceso]);
    this.saveToStorage();
  }

  // =============== PERSISTENCIA EN LOCALSTORAGE ===============

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as Proceso[];
        // Convertir fechas de string a Date
        const procesos = data.map(p => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt)
        }));
        this._procesos.set(procesos);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._procesos()));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // =============== GESTIÓN DE PROCESOS ===============

  createProceso(nombre: string, descripcion: string): Proceso {
    const proceso: Proceso = {
      id: `proc-${crypto.randomUUID()}`,
      nombre,
      descripcion,
      version: '1.0.0',
      estado: 'borrador',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };

    this._procesos.update(list => [...list, proceso]);
    this.saveToStorage();
    return proceso;
  }

  loadProceso(procesoId: string): boolean {
    const proceso = this._procesos().find(p => p.id === procesoId);
    if (proceso) {
      this._currentProceso.set({ ...proceso });
      this._nodes.set([...proceso.nodes]);
      this._edges.set([...proceso.edges]);
      this._selectedNode.set(null);
      return true;
    }
    return false;
  }

  newProceso(): void {
    const nuevo = this.createProceso('Nuevo Proceso', 'Descripción del proceso');
    this.loadProceso(nuevo.id);
  }

  deleteProceso(procesoId: string): void {
    this._procesos.update(list => list.filter(p => p.id !== procesoId));
    if (this._currentProceso()?.id === procesoId) {
      this._currentProceso.set(null);
      this._nodes.set([]);
      this._edges.set([]);
    }
    this.saveToStorage();
  }

  // Obtener proceso por ID
  getProcesoById(procesoId: string): Proceso | undefined {
    return this._procesos().find(p => p.id === procesoId);
  }

  // Duplicar proceso
  duplicateProceso(procesoId: string): Proceso | null {
    const original = this.getProcesoById(procesoId);
    if (!original) return null;

    const copia: Proceso = {
      ...original,
      id: `proc-${crypto.randomUUID()}`,
      nombre: `${original.nombre} (copia)`,
      estado: 'borrador',
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: original.nodes.map(n => ({ ...n, id: `node-${crypto.randomUUID().slice(0, 8)}` })),
      edges: []
    };

    this._procesos.update(list => [...list, copia]);
    this.saveToStorage();
    return copia;
  }

  // Actualizar estado del proceso
  updateProcesoEstado(procesoId: string, estado: Proceso['estado']): void {
    this._procesos.update(list =>
      list.map(p => p.id === procesoId ? { ...p, estado, updatedAt: new Date() } : p)
    );
    if (this._currentProceso()?.id === procesoId) {
      this._currentProceso.update(p => p ? { ...p, estado, updatedAt: new Date() } : null);
    }
    this.saveToStorage();
  }

  // Actualizar información básica del proceso
  updateProcesoInfo(procesoId: string, updates: { nombre?: string; descripcion?: string }): void {
    this._procesos.update(list =>
      list.map(p => p.id === procesoId ? { ...p, ...updates, updatedAt: new Date() } : p)
    );
    if (this._currentProceso()?.id === procesoId) {
      this._currentProceso.update(p => p ? { ...p, ...updates, updatedAt: new Date() } : null);
    }
    this.saveToStorage();
  }

  // =============== GESTIÓN DE NODOS ===============

  addNode(type: ProcessNodeType, x: number, y: number): ProcessNode {
    const nodeId = `node-${crypto.randomUUID().slice(0, 8)}`;

    const defaultConfigs: Record<ProcessNodeType, () => ProcessNode['config']> = {
      activo: () => ({ area: '', activoId: '', activoNombre: '', criticidad: 'media' } as ActivoNodeConfig),
      csv: () => ({ fileName: '', columns: [], rowCount: 0, delimiter: ',', hasHeaders: true } as CsvNodeConfig),
      transformacion: () => ({ operacion: 'mapear', mappings: [] } as TransformacionNodeConfig),
      condicional: () => ({ variable: '', operador: '==', valor: '', tipoComparacion: 'string' } as CondicionalNodeConfig),
      llm: () => ({
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        prompt: '',
        systemPrompt: 'Eres un asistente experto en análisis de riesgos.',
        temperature: 0.7,
        maxTokens: 2048,
        inputVariables: [],
        outputVariable: 'resultado_llm'
      } as LlmNodeConfig),
      branching: () => ({
        cantidadRamas: 2,
        estrategia: 'paralela',
        ramas: [{ id: 'rama-1', nombre: 'Rama 1' }, { id: 'rama-2', nombre: 'Rama 2' }]
      } as BranchingNodeConfig),
      estado: () => ({
        tipoEstado: 'success',
        nombreEstado: 'Completado',
        mensaje: '',
        notificar: false,
        accionSiguiente: 'continuar'
      } as EstadoNodeConfig),
      matematico: () => ({ formula: '', variablesSalida: 'resultado', precision: 2 } as MatematicoNodeConfig),
      ml: () => ({
        modeloId: '',
        modeloNombre: '',
        tipoModelo: 'clasificacion',
        inputFeatures: [],
        outputField: 'prediccion'
      } as MlNodeConfig)
    };

    const labels: Record<ProcessNodeType, string> = {
      activo: 'Nodo Activo',
      csv: 'Archivo CSV',
      transformacion: 'Transformación',
      condicional: 'Condicional',
      llm: 'Prompt LLM',
      branching: 'Branching',
      estado: 'Cambio de Estado',
      matematico: 'Matemático',
      ml: 'Machine Learning'
    };

    const node: ProcessNode = {
      id: nodeId,
      type,
      label: labels[type],
      config: defaultConfigs[type](),
      position: { x, y }
    };

    this._nodes.update(nodes => [...nodes, node]);
    this.autoSave();
    return node;
  }

  updateNode(nodeId: string, updates: Partial<ProcessNode>): void {
    this._nodes.update(nodes =>
      nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
    );

    // Actualizar también el nodo seleccionado si corresponde
    const selected = this._selectedNode();
    if (selected?.id === nodeId) {
      this._selectedNode.set({ ...selected, ...updates });
    }
    this.autoSave();
  }

  updateNodePosition(nodeId: string, x: number, y: number): void {
    this.updateNode(nodeId, { position: { x, y } });
  }

  deleteNode(nodeId: string): void {
    this._nodes.update(nodes => nodes.filter(n => n.id !== nodeId));
    this._edges.update(edges =>
      edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId)
    );

    if (this._selectedNode()?.id === nodeId) {
      this._selectedNode.set(null);
    }
    this.autoSave();
  }

  selectNode(nodeId: string | null): void {
    if (nodeId) {
      const node = this._nodes().find(n => n.id === nodeId);
      this._selectedNode.set(node || null);
    } else {
      this._selectedNode.set(null);
    }
  }

  // =============== GESTIÓN DE CONEXIONES ===============

  addEdge(sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string): ProcessEdge | null {
    const exists = this._edges().some(
      e => e.sourceNodeId === sourceId && e.targetNodeId === targetId
    );
    if (exists) return null;

    const sourceExists = this._nodes().some(n => n.id === sourceId);
    const targetExists = this._nodes().some(n => n.id === targetId);
    if (!sourceExists || !targetExists) return null;

    const edge: ProcessEdge = {
      id: `edge-${sourceId}-${targetId}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      sourceHandle,
      targetHandle
    };

    this._edges.update(edges => [...edges, edge]);
    this.autoSave();
    return edge;
  }

  deleteEdge(edgeId: string): void {
    this._edges.update(edges => edges.filter(e => e.id !== edgeId));
    this.autoSave();
  }

  // =============== GUARDAR PROCESO ===============

  saveProceso(): void {
    const current = this._currentProceso();
    if (!current) return;

    const updated: Proceso = {
      ...current,
      nodes: this._nodes(),
      edges: this._edges(),
      updatedAt: new Date()
    };

    this._procesos.update(list =>
      list.map(p => p.id === updated.id ? updated : p)
    );
    this._currentProceso.set(updated);
    this.saveToStorage();
  }

  private autoSave(): void {
    // Guardar automáticamente cada cambio
    this.saveProceso();
  }

  // =============== EJECUCIÓN DEL PROCESO ===============

  async executeProcess(inputData?: Record<string, unknown>): Promise<ProcessExecution> {
    const proceso = this._currentProceso();
    if (!proceso) {
      throw new Error('No hay proceso cargado');
    }

    const nodes = this._nodes();
    const edges = this._edges();

    if (nodes.length === 0) {
      throw new Error('El proceso no tiene nodos');
    }

    // Inicializar ejecución
    const execution: ProcessExecution = {
      id: `exec-${crypto.randomUUID().slice(0, 8)}`,
      procesoId: proceso.id,
      startTime: new Date(),
      status: 'running',
      results: [],
      context: inputData || {}
    };

    this._isExecuting.set(true);
    this._currentExecution.set(execution);
    this._executionResults.set([]);

    try {
      // Ordenar nodos topológicamente
      const orderedNodes = this.topologicalSort(nodes, edges);

      // Ejecutar cada nodo en orden
      for (const node of orderedNodes) {
        const result = await this.executeNode(node, execution.context);
        execution.results.push(result);
        this._executionResults.update(r => [...r, result]);

        if (result.status === 'error') {
          const config = node.config as unknown as Record<string, unknown>;
          const onError = config['onError'] as string;
          if (onError === 'fail') {
            execution.status = 'failed';
            break;
          }
        }

        // Agregar output al contexto
        if (result.output !== undefined) {
          const config = node.config as unknown as Record<string, unknown>;
          const outputVar = (config['outputVariable'] as string) || node.id;
          execution.context[outputVar] = result.output;
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
      }
    } catch (error) {
      execution.status = 'failed';
      console.error('Error executing process:', error);
    } finally {
      execution.endTime = new Date();
      this._isExecuting.set(false);
      this._currentExecution.set(execution);
      this.saveExecution(execution);
    }

    return execution;
  }

  private async executeNode(node: ProcessNode, context: Record<string, unknown>): Promise<ExecutionResult> {
    const startTime = Date.now();
    const result: ExecutionResult = {
      nodeId: node.id,
      nodeName: node.label,
      status: 'running'
    };

    // Actualizar estado visual
    this._executionResults.update(r => [...r.filter(x => x.nodeId !== node.id), result]);

    try {
      let output: unknown;

      switch (node.type) {
        case 'csv':
          output = await this.executeCsvNode(node, context);
          break;
        case 'activo':
          output = await this.executeActivoNode(node, context);
          break;
        case 'transformacion':
          output = await this.executeTransformacionNode(node, context);
          break;
        case 'condicional':
          output = await this.executeCondicionalNode(node, context);
          break;
        case 'llm':
          output = await this.executeLlmNode(node, context);
          break;
        case 'matematico':
          output = await this.executeMatematicoNode(node, context);
          break;
        case 'estado':
          output = await this.executeEstadoNode(node, context);
          break;
        case 'branching':
          output = await this.executeBranchingNode(node, context);
          break;
        case 'ml':
          output = await this.executeMlNode(node, context);
          break;
        default:
          output = { message: `Nodo ${node.type} ejecutado` };
      }

      result.status = 'success';
      result.output = output;
    } catch (error) {
      result.status = 'error';
      result.error = (error as Error).message;
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // Ejecutores específicos por tipo de nodo
  private async executeCsvNode(node: ProcessNode, _context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as CsvNodeConfig;
    // Simular carga de CSV
    return {
      fileName: config.fileName || 'datos.csv',
      columns: config.columns || ['nombre', 'email', 'status'],
      rows: [
        { nombre: 'Juan Pérez', email: 'juan@example.com', status: 'activo' },
        { nombre: 'María García', email: 'maria@example.com', status: 'activo' },
        { nombre: 'Carlos López', email: 'carlos@example.com', status: 'inactivo' }
      ],
      rowCount: 3
    };
  }

  private async executeActivoNode(node: ProcessNode, _context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as ActivoNodeConfig;
    return {
      id: config.activoId || 'ACT-001',
      nombre: config.activoNombre || 'Activo de ejemplo',
      area: config.area || 'TI',
      criticidad: config.criticidad || 'media',
      valor: 50000,
      riesgoCalculado: 0.35
    };
  }

  private async executeTransformacionNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as TransformacionNodeConfig;
    const inputData = Object.values(context).find(v => Array.isArray(v)) || [];

    switch (config.operacion) {
      case 'filtrar':
        return (inputData as unknown[]).filter(() => true);
      case 'mapear':
        return (inputData as unknown[]).map(item => ({ ...item as object, transformed: true }));
      case 'agregar':
        return { count: (inputData as unknown[]).length, items: inputData };
      default:
        return inputData;
    }
  }

  private async executeCondicionalNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as CondicionalNodeConfig;
    const value = context[config.variable];

    let result = false;
    switch (config.operador) {
      case '==':
        result = value == config.valor;
        break;
      case '!=':
        result = value != config.valor;
        break;
      case '>':
        result = Number(value) > Number(config.valor);
        break;
      case '<':
        result = Number(value) < Number(config.valor);
        break;
      case 'contains':
        result = String(value).includes(config.valor);
        break;
    }

    return { condition: `${config.variable} ${config.operador} ${config.valor}`, result, branch: result ? 'true' : 'false' };
  }

  private async executeLlmNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as LlmNodeConfig;

    // Reemplazar variables en el prompt
    let prompt = config.prompt || '';
    for (const [key, value] of Object.entries(context)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    }

    if (!prompt) {
      return { message: 'Prompt vacío', response: null };
    }

    try {
      const response = await this.groqService.ask(prompt, {
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        systemPrompt: config.systemPrompt
      });

      return {
        model: config.model,
        prompt: prompt.substring(0, 100) + '...',
        response,
        tokens: response.length
      };
    } catch (error) {
      return {
        model: config.model,
        error: (error as Error).message,
        response: null
      };
    }
  }

  private async executeMatematicoNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as MatematicoNodeConfig;
    let formula = config.formula || '0';

    // Reemplazar variables en la fórmula
    for (const [key, value] of Object.entries(context)) {
      if (typeof value === 'number') {
        formula = formula.replace(new RegExp(key, 'g'), String(value));
      }
    }

    try {
      // Evaluar fórmula matemática simple (solo números y operadores básicos)
      const sanitized = formula.replace(/[^0-9+\-*/().]/g, '');
      const result = Function(`"use strict"; return (${sanitized})`)();
      return {
        formula: config.formula,
        result: Number(result.toFixed(config.precision || 2))
      };
    } catch {
      return { formula: config.formula, result: 0, error: 'Error en fórmula' };
    }
  }

  private async executeEstadoNode(node: ProcessNode, _context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as EstadoNodeConfig;
    return {
      estado: config.tipoEstado,
      nombre: config.nombreEstado,
      mensaje: config.mensaje,
      timestamp: new Date().toISOString()
    };
  }

  private async executeBranchingNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as BranchingNodeConfig;
    return {
      estrategia: config.estrategia,
      ramas: config.ramas,
      contextoDistribuido: context
    };
  }

  private async executeMlNode(node: ProcessNode, context: Record<string, unknown>): Promise<unknown> {
    const config = node.config as MlNodeConfig;
    // Simular predicción ML
    return {
      modelo: config.modeloNombre || 'Modelo ML',
      tipo: config.tipoModelo,
      prediccion: Math.random() > 0.5 ? 'positivo' : 'negativo',
      confianza: Math.random() * 0.4 + 0.6,
      features: config.inputFeatures
    };
  }

  // Ordenamiento topológico para ejecutar nodos en orden correcto
  private topologicalSort(nodes: ProcessNode[], edges: ProcessEdge[]): ProcessNode[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    // Inicializar
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjacency.set(node.id, []);
    });

    // Construir grafo
    edges.forEach(edge => {
      inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) || 0) + 1);
      adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId);
    });

    // Cola con nodos sin dependencias
    const queue: string[] = [];
    nodes.forEach(node => {
      if ((inDegree.get(node.id) || 0) === 0) {
        queue.push(node.id);
      }
    });

    const result: ProcessNode[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId);
      if (node) result.push(node);

      adjacency.get(nodeId)?.forEach(targetId => {
        const newDegree = (inDegree.get(targetId) || 0) - 1;
        inDegree.set(targetId, newDegree);
        if (newDegree === 0) {
          queue.push(targetId);
        }
      });
    }

    // Si no se procesaron todos, hay ciclos - agregar los faltantes
    nodes.forEach(node => {
      if (!result.find(n => n.id === node.id)) {
        result.push(node);
      }
    });

    return result;
  }

  private saveExecution(execution: ProcessExecution): void {
    try {
      const stored = localStorage.getItem(EXECUTIONS_KEY);
      const executions: ProcessExecution[] = stored ? JSON.parse(stored) : [];
      executions.unshift(execution);
      // Mantener solo las últimas 50 ejecuciones
      const trimmed = executions.slice(0, 50);
      localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Error saving execution:', e);
    }
  }

  getExecutionHistory(): ProcessExecution[] {
    try {
      const stored = localStorage.getItem(EXECUTIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  cancelExecution(): void {
    const current = this._currentExecution();
    if (current && current.status === 'running') {
      current.status = 'cancelled';
      current.endTime = new Date();
      this._currentExecution.set(current);
      this._isExecuting.set(false);
    }
  }

  // =============== UTILIDADES ===============

  private countNodesByType(): Record<ProcessNodeType, number> {
    const counts: Record<ProcessNodeType, number> = {
      activo: 0, csv: 0, transformacion: 0, condicional: 0,
      llm: 0, branching: 0, estado: 0, matematico: 0, ml: 0
    };
    for (const node of this._nodes()) {
      counts[node.type]++;
    }
    return counts;
  }

  private validateProcess(): boolean {
    const nodes = this._nodes();
    if (nodes.length === 0) return false;
    if (nodes.length > 1 && this._edges().length === 0) return false;
    return true;
  }

  exportToJson(): string {
    const current = this._currentProceso();
    if (!current) return '';
    return JSON.stringify({
      ...current,
      nodes: this._nodes(),
      edges: this._edges()
    }, null, 2);
  }

  importFromJson(json: string): boolean {
    try {
      const data = JSON.parse(json) as Proceso;
      this._currentProceso.set(data);
      this._nodes.set(data.nodes || []);
      this._edges.set(data.edges || []);
      this.saveProceso();
      return true;
    } catch {
      return false;
    }
  }

  clearCanvas(): void {
    this._nodes.set([]);
    this._edges.set([]);
    this._selectedNode.set(null);
    this.autoSave();
  }
}
