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
  MlNodeConfig,
  KpiNodeConfig,
  ObjetivoProceso,
  KpiProceso
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
    // 6. Dashboard KPIs (Ejemplo con muchos KPIs)
    this.createDemoProcess6();
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
      objetivos: [
        {
          id: 'OBJ-CRED-001',
          nombre: 'Reducir morosidad crediticia',
          descripcion: 'Disminuir el porcentaje de créditos en mora mediante mejor evaluación de riesgo',
          tipo: 'estrategico',
          progreso: 65,
          kpis: [
            { id: 'KPI-CRED-001', nombre: 'Tasa de aprobación', meta: 70, escala: 'Porcentaje' },
            { id: 'KPI-CRED-002', nombre: 'Tasa de morosidad', meta: 5, escala: 'Porcentaje' },
            { id: 'KPI-CRED-003', nombre: 'Score promedio aprobados', meta: 75, escala: 'Unidades' }
          ]
        },
        {
          id: 'OBJ-CRED-002',
          nombre: 'Optimizar tiempo de evaluación',
          descripcion: 'Reducir el tiempo promedio de evaluación de solicitudes',
          tipo: 'operativo',
          progreso: 80,
          kpis: [
            { id: 'KPI-CRED-004', nombre: 'Tiempo promedio evaluación', meta: 24, escala: 'Horas' },
            { id: 'KPI-CRED-005', nombre: 'Solicitudes procesadas/día', meta: 50, escala: 'Unidades' }
          ]
        }
      ],
      kpis: [
        { id: 'KPI-CRED-001', nombre: 'Tasa de aprobación', unidad: 'porcentaje', meta: 70, valorActual: 68, objetivoId: 'OBJ-CRED-001', historico: [], alertas: { direccion: 'menor' } },
        { id: 'KPI-CRED-002', nombre: 'Tasa de morosidad', unidad: 'porcentaje', meta: 5, valorActual: 4.2, objetivoId: 'OBJ-CRED-001', historico: [], alertas: { advertencia: 7, critico: 10, direccion: 'mayor' } },
        { id: 'KPI-CRED-003', nombre: 'Score promedio aprobados', unidad: 'numero', meta: 75, valorActual: 78, objetivoId: 'OBJ-CRED-001', historico: [], alertas: { direccion: 'menor' } },
        { id: 'KPI-CRED-004', nombre: 'Tiempo promedio evaluación', unidad: 'tiempo_horas', meta: 24, valorActual: 18, objetivoId: 'OBJ-CRED-002', historico: [], alertas: { advertencia: 30, critico: 48, direccion: 'mayor' } },
        { id: 'KPI-CRED-005', nombre: 'Solicitudes procesadas/día', unidad: 'numero', meta: 50, valorActual: 45, objetivoId: 'OBJ-CRED-002', historico: [], alertas: { direccion: 'menor' } }
      ],
      nodes: [
        {
          id: 'node-csv-1',
          type: 'csv',
          label: 'Solicitudes de Crédito',
          position: { x: 100, y: 200 },
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
          position: { x: 350, y: 200 },
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
          position: { x: 600, y: 200 },
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
          id: 'node-mat-score',
          type: 'matematico',
          label: 'Calcular Score Final',
          position: { x: 850, y: 200 },
          config: {
            formula: '(historial_credito * 0.4) + (años_empleo * 5) + (ingreso_mensual / monto * 20)',
            variablesSalida: 'score_riesgo',
            precision: 2
          } as MatematicoNodeConfig
        },
        {
          id: 'node-cond-1',
          type: 'condicional',
          label: '¿Riesgo Aceptable?',
          position: { x: 1100, y: 200 },
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
          position: { x: 1350, y: 80 },
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
          position: { x: 1350, y: 320 },
          config: {
            tipoEstado: 'error',
            nombreEstado: 'Rechazado',
            mensaje: 'Solicitud rechazada por alto riesgo crediticio.',
            notificar: true,
            accionSiguiente: 'detener'
          } as EstadoNodeConfig
        },
        // Nodos KPI conectados al flujo
        {
          id: 'node-kpi-aprobacion',
          type: 'kpi',
          label: 'Actualizar Tasa Aprobación',
          position: { x: 1600, y: 80 },
          config: {
            origenValor: 'calculado',
            nodoPrevioId: 'node-mat-score',
            kpiId: 'KPI-CRED-001',
            kpiNombre: 'Tasa de aprobación',
            kpiUnidad: 'porcentaje',
            objetivoId: 'OBJ-CRED-001',
            alertasHabilitadas: true,
            umbrales: {
              advertencia: 65,
              critico: 50,
              direccion: 'menor'
            },
            guardarHistorico: true
          } as KpiNodeConfig
        },
        {
          id: 'node-kpi-score',
          type: 'kpi',
          label: 'Actualizar Score Promedio',
          position: { x: 1850, y: 80 },
          config: {
            origenValor: 'variable',
            variableOrigen: 'score_riesgo',
            kpiId: 'KPI-CRED-003',
            kpiNombre: 'Score promedio aprobados',
            kpiUnidad: 'numero',
            objetivoId: 'OBJ-CRED-001',
            alertasHabilitadas: true,
            umbrales: {
              advertencia: 70,
              critico: 60,
              direccion: 'menor'
            },
            guardarHistorico: true
          } as KpiNodeConfig
        },
        {
          id: 'node-kpi-morosidad',
          type: 'kpi',
          label: 'Actualizar Tasa Morosidad',
          position: { x: 1600, y: 320 },
          config: {
            origenValor: 'fijo',
            valorFijo: 5.2,
            kpiId: 'KPI-CRED-002',
            kpiNombre: 'Tasa de morosidad',
            kpiUnidad: 'porcentaje',
            objetivoId: 'OBJ-CRED-001',
            alertasHabilitadas: true,
            umbrales: {
              advertencia: 7,
              critico: 10,
              direccion: 'mayor'
            },
            guardarHistorico: true
          } as KpiNodeConfig
        }
      ],
      edges: [
        { id: 'edge-1', sourceNodeId: 'node-csv-1', targetNodeId: 'node-trans-1' },
        { id: 'edge-2', sourceNodeId: 'node-trans-1', targetNodeId: 'node-llm-1' },
        { id: 'edge-3', sourceNodeId: 'node-llm-1', targetNodeId: 'node-mat-score' },
        { id: 'edge-4', sourceNodeId: 'node-mat-score', targetNodeId: 'node-cond-1' },
        { id: 'edge-5', sourceNodeId: 'node-cond-1', targetNodeId: 'node-estado-1', sourceHandle: 'true' },
        { id: 'edge-6', sourceNodeId: 'node-cond-1', targetNodeId: 'node-estado-2', sourceHandle: 'false' },
        // Conexiones a nodos KPI
        { id: 'edge-7', sourceNodeId: 'node-estado-1', targetNodeId: 'node-kpi-aprobacion' },
        { id: 'edge-8', sourceNodeId: 'node-kpi-aprobacion', targetNodeId: 'node-kpi-score' },
        { id: 'edge-9', sourceNodeId: 'node-estado-2', targetNodeId: 'node-kpi-morosidad' }
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
      objetivos: [
        {
          id: 'OBJ-TI-001',
          nombre: 'Garantizar disponibilidad de infraestructura',
          descripcion: 'Mantener alta disponibilidad de los activos críticos de TI',
          tipo: 'estrategico',
          progreso: 92,
          kpis: [
            { id: 'KPI-TI-001', nombre: 'Disponibilidad de servidores', meta: 99.9, escala: 'Porcentaje' },
            { id: 'KPI-TI-002', nombre: 'Tiempo de inactividad mensual', meta: 4, escala: 'Horas' }
          ]
        },
        {
          id: 'OBJ-TI-002',
          nombre: 'Reducir vulnerabilidades',
          descripcion: 'Minimizar el número de vulnerabilidades críticas en activos',
          tipo: 'operativo',
          progreso: 75,
          kpis: [
            { id: 'KPI-TI-003', nombre: 'Vulnerabilidades críticas abiertas', meta: 0, escala: 'Unidades' },
            { id: 'KPI-TI-004', nombre: 'Score de riesgo promedio', meta: 30, escala: 'Unidades' },
            { id: 'KPI-TI-005', nombre: 'Activos actualizados', meta: 95, escala: 'Porcentaje' }
          ]
        }
      ],
      kpis: [
        { id: 'KPI-TI-001', nombre: 'Disponibilidad de servidores', unidad: 'porcentaje', meta: 99.9, valorActual: 99.7, objetivoId: 'OBJ-TI-001', historico: [], alertas: { advertencia: 99.5, critico: 99, direccion: 'menor' } },
        { id: 'KPI-TI-002', nombre: 'Tiempo de inactividad mensual', unidad: 'tiempo_horas', meta: 4, valorActual: 2.5, objetivoId: 'OBJ-TI-001', historico: [], alertas: { advertencia: 6, critico: 12, direccion: 'mayor' } },
        { id: 'KPI-TI-003', nombre: 'Vulnerabilidades críticas abiertas', unidad: 'numero', meta: 0, valorActual: 3, objetivoId: 'OBJ-TI-002', historico: [], alertas: { advertencia: 5, critico: 10, direccion: 'mayor' } },
        { id: 'KPI-TI-004', nombre: 'Score de riesgo promedio', unidad: 'numero', meta: 30, valorActual: 42, objetivoId: 'OBJ-TI-002', historico: [], alertas: { advertencia: 50, critico: 70, direccion: 'mayor' } },
        { id: 'KPI-TI-005', nombre: 'Activos actualizados', unidad: 'porcentaje', meta: 95, valorActual: 88, objetivoId: 'OBJ-TI-002', historico: [], alertas: { advertencia: 85, critico: 75, direccion: 'menor' } }
      ],
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
      objetivos: [
        {
          id: 'OBJ-INC-001',
          nombre: 'Mejorar tiempo de respuesta',
          descripcion: 'Reducir el tiempo desde reporte hasta resolución de incidentes',
          tipo: 'operativo',
          progreso: 70,
          kpis: [
            { id: 'KPI-INC-001', nombre: 'Tiempo medio de resolución', meta: 4, escala: 'Horas' },
            { id: 'KPI-INC-002', nombre: 'Incidentes resueltos en SLA', meta: 95, escala: 'Porcentaje' }
          ]
        },
        {
          id: 'OBJ-INC-002',
          nombre: 'Precisión de clasificación',
          descripcion: 'Mejorar la precisión del modelo de clasificación automática',
          tipo: 'estrategico',
          progreso: 85,
          kpis: [
            { id: 'KPI-INC-003', nombre: 'Precisión del modelo ML', meta: 92, escala: 'Porcentaje' },
            { id: 'KPI-INC-004', nombre: 'Incidentes reclasificados', meta: 5, escala: 'Porcentaje' }
          ]
        }
      ],
      kpis: [
        { id: 'KPI-INC-001', nombre: 'Tiempo medio de resolución', unidad: 'tiempo_horas', meta: 4, valorActual: 3.5, objetivoId: 'OBJ-INC-001', historico: [], alertas: { advertencia: 6, critico: 8, direccion: 'mayor' } },
        { id: 'KPI-INC-002', nombre: 'Incidentes resueltos en SLA', unidad: 'porcentaje', meta: 95, valorActual: 91, objetivoId: 'OBJ-INC-001', historico: [], alertas: { advertencia: 90, critico: 80, direccion: 'menor' } },
        { id: 'KPI-INC-003', nombre: 'Precisión del modelo ML', unidad: 'porcentaje', meta: 92, valorActual: 89, objetivoId: 'OBJ-INC-002', historico: [], alertas: { advertencia: 85, critico: 75, direccion: 'menor' } },
        { id: 'KPI-INC-004', nombre: 'Incidentes reclasificados', unidad: 'porcentaje', meta: 5, valorActual: 8, objetivoId: 'OBJ-INC-002', historico: [], alertas: { advertencia: 10, critico: 15, direccion: 'mayor' } }
      ],
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
      objetivos: [
        {
          id: 'OBJ-PROV-001',
          nombre: 'Gestión de riesgo de terceros',
          descripcion: 'Evaluar y mitigar riesgos asociados a proveedores críticos',
          tipo: 'estrategico',
          progreso: 60,
          kpis: [
            { id: 'KPI-PROV-001', nombre: 'Proveedores evaluados', meta: 100, escala: 'Porcentaje' },
            { id: 'KPI-PROV-002', nombre: 'Score promedio proveedores', meta: 75, escala: 'Unidades' },
            { id: 'KPI-PROV-003', nombre: 'Proveedores de alto riesgo', meta: 5, escala: 'Porcentaje' }
          ]
        }
      ],
      kpis: [
        { id: 'KPI-PROV-001', nombre: 'Proveedores evaluados', unidad: 'porcentaje', meta: 100, valorActual: 72, objetivoId: 'OBJ-PROV-001', historico: [], alertas: { advertencia: 80, critico: 60, direccion: 'menor' } },
        { id: 'KPI-PROV-002', nombre: 'Score promedio proveedores', unidad: 'numero', meta: 75, valorActual: 68, objetivoId: 'OBJ-PROV-001', historico: [], alertas: { advertencia: 60, critico: 50, direccion: 'menor' } },
        { id: 'KPI-PROV-003', nombre: 'Proveedores de alto riesgo', unidad: 'porcentaje', meta: 5, valorActual: 12, objetivoId: 'OBJ-PROV-001', historico: [], alertas: { advertencia: 10, critico: 20, direccion: 'mayor' } }
      ],
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
      objetivos: [
        {
          id: 'OBJ-SOX-001',
          nombre: 'Cumplimiento SOX 100%',
          descripcion: 'Asegurar el cumplimiento total de controles SOX',
          tipo: 'estrategico',
          progreso: 88,
          kpis: [
            { id: 'KPI-SOX-001', nombre: 'Controles efectivos', meta: 100, escala: 'Porcentaje' },
            { id: 'KPI-SOX-002', nombre: 'Hallazgos pendientes', meta: 0, escala: 'Unidades' },
            { id: 'KPI-SOX-003', nombre: 'Evidencias completas', meta: 100, escala: 'Porcentaje' }
          ]
        },
        {
          id: 'OBJ-SOX-002',
          nombre: 'Eficiencia en auditorías',
          descripcion: 'Optimizar el proceso de auditoría interna',
          tipo: 'operativo',
          progreso: 75,
          kpis: [
            { id: 'KPI-SOX-004', nombre: 'Tiempo de auditoría', meta: 5, escala: 'Días' },
            { id: 'KPI-SOX-005', nombre: 'Costo por auditoría', meta: 5000, escala: 'USD' }
          ]
        }
      ],
      kpis: [
        { id: 'KPI-SOX-001', nombre: 'Controles efectivos', unidad: 'porcentaje', meta: 100, valorActual: 94, objetivoId: 'OBJ-SOX-001', historico: [], alertas: { advertencia: 95, critico: 90, direccion: 'menor' } },
        { id: 'KPI-SOX-002', nombre: 'Hallazgos pendientes', unidad: 'numero', meta: 0, valorActual: 3, objetivoId: 'OBJ-SOX-001', historico: [], alertas: { advertencia: 5, critico: 10, direccion: 'mayor' } },
        { id: 'KPI-SOX-003', nombre: 'Evidencias completas', unidad: 'porcentaje', meta: 100, valorActual: 92, objetivoId: 'OBJ-SOX-001', historico: [], alertas: { advertencia: 95, critico: 85, direccion: 'menor' } },
        { id: 'KPI-SOX-004', nombre: 'Tiempo de auditoría', unidad: 'tiempo_dias', meta: 5, valorActual: 4, objetivoId: 'OBJ-SOX-002', historico: [], alertas: { advertencia: 7, critico: 10, direccion: 'mayor' } },
        { id: 'KPI-SOX-005', nombre: 'Costo por auditoría', unidad: 'moneda_usd', meta: 5000, valorActual: 4200, objetivoId: 'OBJ-SOX-002', historico: [], alertas: { advertencia: 6000, critico: 8000, direccion: 'mayor' } }
      ],
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

  // 6. Dashboard de KPIs - Ejemplo con múltiples objetivos y KPIs
  private createDemoProcess6(): void {
    const proceso: Proceso = {
      id: 'proc-demo-006',
      nombre: 'Dashboard de KPIs Empresariales',
      descripcion: 'Proceso de ejemplo para demostrar la configuración de múltiples KPIs en nodos',
      version: '1.0.0',
      estado: 'activo',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-17'),
      createdBy: 'admin',
      objetivos: [
        {
          id: 'OBJ-FIN-001',
          nombre: 'Rentabilidad Financiera',
          descripcion: 'Maximizar la rentabilidad de la empresa',
          tipo: 'estrategico',
          progreso: 72,
          kpis: [
            { id: 'KPI-FIN-001', nombre: 'Margen de Utilidad Neta', meta: 15, escala: 'Porcentaje' },
            { id: 'KPI-FIN-002', nombre: 'ROI (Retorno de Inversión)', meta: 20, escala: 'Porcentaje' },
            { id: 'KPI-FIN-003', nombre: 'EBITDA', meta: 5000000, escala: 'USD' },
            { id: 'KPI-FIN-004', nombre: 'Ratio de Liquidez', meta: 1.5, escala: 'Unidades' }
          ]
        },
        {
          id: 'OBJ-VEN-001',
          nombre: 'Crecimiento en Ventas',
          descripcion: 'Incrementar las ventas y participación de mercado',
          tipo: 'estrategico',
          progreso: 85,
          kpis: [
            { id: 'KPI-VEN-001', nombre: 'Ingresos Totales', meta: 10000000, escala: 'USD' },
            { id: 'KPI-VEN-002', nombre: 'Crecimiento Mensual', meta: 5, escala: 'Porcentaje' },
            { id: 'KPI-VEN-003', nombre: 'Ticket Promedio', meta: 250, escala: 'USD' },
            { id: 'KPI-VEN-004', nombre: 'Tasa de Conversión', meta: 3.5, escala: 'Porcentaje' }
          ]
        },
        {
          id: 'OBJ-CLI-001',
          nombre: 'Satisfacción del Cliente',
          descripcion: 'Mejorar la experiencia y retención de clientes',
          tipo: 'operativo',
          progreso: 68,
          kpis: [
            { id: 'KPI-CLI-001', nombre: 'NPS (Net Promoter Score)', meta: 70, escala: 'Unidades' },
            { id: 'KPI-CLI-002', nombre: 'Tasa de Retención', meta: 90, escala: 'Porcentaje' },
            { id: 'KPI-CLI-003', nombre: 'Tiempo de Respuesta', meta: 2, escala: 'Horas' },
            { id: 'KPI-CLI-004', nombre: 'CSAT (Satisfacción)', meta: 4.5, escala: 'Unidades' }
          ]
        },
        {
          id: 'OBJ-OPE-001',
          nombre: 'Eficiencia Operativa',
          descripcion: 'Optimizar procesos y reducir costos operativos',
          tipo: 'operativo',
          progreso: 55,
          kpis: [
            { id: 'KPI-OPE-001', nombre: 'Costo por Transacción', meta: 5, escala: 'USD' },
            { id: 'KPI-OPE-002', nombre: 'Tiempo de Ciclo', meta: 24, escala: 'Horas' },
            { id: 'KPI-OPE-003', nombre: 'Tasa de Error', meta: 1, escala: 'Porcentaje' },
            { id: 'KPI-OPE-004', nombre: 'Utilización de Capacidad', meta: 85, escala: 'Porcentaje' }
          ]
        },
        {
          id: 'OBJ-RH-001',
          nombre: 'Capital Humano',
          descripcion: 'Desarrollar y retener talento',
          tipo: 'estrategico',
          progreso: 78,
          kpis: [
            { id: 'KPI-RH-001', nombre: 'Rotación de Personal', meta: 10, escala: 'Porcentaje' },
            { id: 'KPI-RH-002', nombre: 'Satisfacción Empleados', meta: 80, escala: 'Porcentaje' },
            { id: 'KPI-RH-003', nombre: 'Horas de Capacitación', meta: 40, escala: 'Horas' },
            { id: 'KPI-RH-004', nombre: 'Productividad por Empleado', meta: 50000, escala: 'USD' }
          ]
        }
      ],
      kpis: [
        // Financieros
        { id: 'KPI-FIN-001', nombre: 'Margen de Utilidad Neta', unidad: 'porcentaje', meta: 15, valorActual: 12.5, objetivoId: 'OBJ-FIN-001', historico: [], alertas: { advertencia: 12, critico: 10, direccion: 'menor' } },
        { id: 'KPI-FIN-002', nombre: 'ROI (Retorno de Inversión)', unidad: 'porcentaje', meta: 20, valorActual: 18, objetivoId: 'OBJ-FIN-001', historico: [], alertas: { advertencia: 15, critico: 10, direccion: 'menor' } },
        { id: 'KPI-FIN-003', nombre: 'EBITDA', unidad: 'moneda_usd', meta: 5000000, valorActual: 4200000, objetivoId: 'OBJ-FIN-001', historico: [], alertas: { advertencia: 4000000, critico: 3000000, direccion: 'menor' } },
        { id: 'KPI-FIN-004', nombre: 'Ratio de Liquidez', unidad: 'numero', meta: 1.5, valorActual: 1.3, objetivoId: 'OBJ-FIN-001', historico: [], alertas: { advertencia: 1.2, critico: 1.0, direccion: 'menor' } },
        // Ventas
        { id: 'KPI-VEN-001', nombre: 'Ingresos Totales', unidad: 'moneda_usd', meta: 10000000, valorActual: 8500000, objetivoId: 'OBJ-VEN-001', historico: [], alertas: { advertencia: 7000000, critico: 5000000, direccion: 'menor' } },
        { id: 'KPI-VEN-002', nombre: 'Crecimiento Mensual', unidad: 'porcentaje', meta: 5, valorActual: 4.2, objetivoId: 'OBJ-VEN-001', historico: [], alertas: { advertencia: 3, critico: 0, direccion: 'menor' } },
        { id: 'KPI-VEN-003', nombre: 'Ticket Promedio', unidad: 'moneda_usd', meta: 250, valorActual: 235, objetivoId: 'OBJ-VEN-001', historico: [], alertas: { advertencia: 200, critico: 150, direccion: 'menor' } },
        { id: 'KPI-VEN-004', nombre: 'Tasa de Conversión', unidad: 'porcentaje', meta: 3.5, valorActual: 3.1, objetivoId: 'OBJ-VEN-001', historico: [], alertas: { advertencia: 2.5, critico: 2, direccion: 'menor' } },
        // Clientes
        { id: 'KPI-CLI-001', nombre: 'NPS (Net Promoter Score)', unidad: 'numero', meta: 70, valorActual: 62, objetivoId: 'OBJ-CLI-001', historico: [], alertas: { advertencia: 50, critico: 30, direccion: 'menor' } },
        { id: 'KPI-CLI-002', nombre: 'Tasa de Retención', unidad: 'porcentaje', meta: 90, valorActual: 87, objetivoId: 'OBJ-CLI-001', historico: [], alertas: { advertencia: 80, critico: 70, direccion: 'menor' } },
        { id: 'KPI-CLI-003', nombre: 'Tiempo de Respuesta', unidad: 'tiempo_horas', meta: 2, valorActual: 2.5, objetivoId: 'OBJ-CLI-001', historico: [], alertas: { advertencia: 4, critico: 8, direccion: 'mayor' } },
        { id: 'KPI-CLI-004', nombre: 'CSAT (Satisfacción)', unidad: 'numero', meta: 4.5, valorActual: 4.2, objetivoId: 'OBJ-CLI-001', historico: [], alertas: { advertencia: 4.0, critico: 3.5, direccion: 'menor' } },
        // Operativos
        { id: 'KPI-OPE-001', nombre: 'Costo por Transacción', unidad: 'moneda_usd', meta: 5, valorActual: 6.2, objetivoId: 'OBJ-OPE-001', historico: [], alertas: { advertencia: 7, critico: 10, direccion: 'mayor' } },
        { id: 'KPI-OPE-002', nombre: 'Tiempo de Ciclo', unidad: 'tiempo_horas', meta: 24, valorActual: 28, objetivoId: 'OBJ-OPE-001', historico: [], alertas: { advertencia: 36, critico: 48, direccion: 'mayor' } },
        { id: 'KPI-OPE-003', nombre: 'Tasa de Error', unidad: 'porcentaje', meta: 1, valorActual: 1.8, objetivoId: 'OBJ-OPE-001', historico: [], alertas: { advertencia: 2, critico: 5, direccion: 'mayor' } },
        { id: 'KPI-OPE-004', nombre: 'Utilización de Capacidad', unidad: 'porcentaje', meta: 85, valorActual: 72, objetivoId: 'OBJ-OPE-001', historico: [], alertas: { advertencia: 70, critico: 60, direccion: 'menor' } },
        // Recursos Humanos
        { id: 'KPI-RH-001', nombre: 'Rotación de Personal', unidad: 'porcentaje', meta: 10, valorActual: 12, objetivoId: 'OBJ-RH-001', historico: [], alertas: { advertencia: 15, critico: 20, direccion: 'mayor' } },
        { id: 'KPI-RH-002', nombre: 'Satisfacción Empleados', unidad: 'porcentaje', meta: 80, valorActual: 76, objetivoId: 'OBJ-RH-001', historico: [], alertas: { advertencia: 70, critico: 60, direccion: 'menor' } },
        { id: 'KPI-RH-003', nombre: 'Horas de Capacitación', unidad: 'tiempo_horas', meta: 40, valorActual: 35, objetivoId: 'OBJ-RH-001', historico: [], alertas: { advertencia: 30, critico: 20, direccion: 'menor' } },
        { id: 'KPI-RH-004', nombre: 'Productividad por Empleado', unidad: 'moneda_usd', meta: 50000, valorActual: 48000, objetivoId: 'OBJ-RH-001', historico: [], alertas: { advertencia: 45000, critico: 40000, direccion: 'menor' } }
      ],
      nodes: [
        // Nodo de datos CSV
        {
          id: 'node-csv-kpi',
          type: 'csv',
          label: 'Datos de Métricas',
          position: { x: 100, y: 200 },
          config: {
            fileName: 'metricas_empresariales.csv',
            columns: ['fecha', 'ingresos', 'costos', 'clientes', 'tickets', 'errores'],
            rowCount: 365,
            delimiter: ',',
            hasHeaders: true
          } as CsvNodeConfig
        },
        // Nodo matemático para calcular margen
        {
          id: 'node-math-1',
          type: 'matematico',
          label: 'Calcular Margen',
          position: { x: 350, y: 100 },
          config: {
            formula: '((ingresos - costos) / ingresos) * 100',
            precision: 2,
            variablesSalida: 'margen_calculado'
          } as MatematicoNodeConfig
        },
        // Nodo KPI - Margen de Utilidad
        {
          id: 'node-kpi-1',
          type: 'kpi',
          label: 'Actualizar Margen',
          position: { x: 600, y: 100 },
          config: {
            origenValor: 'variable',
            variableOrigen: 'margen_calculado',
            kpiId: 'KPI-FIN-001',
            kpiNombre: 'Margen de Utilidad Neta',
            kpiUnidad: 'porcentaje',
            alertasHabilitadas: true,
            umbrales: { advertencia: 12, critico: 10, direccion: 'menor' }
          } as KpiNodeConfig
        },
        // Nodo matemático para calcular conversión
        {
          id: 'node-math-2',
          type: 'matematico',
          label: 'Calcular Conversión',
          position: { x: 350, y: 300 },
          config: {
            formula: '(tickets / clientes) * 100',
            precision: 2,
            variablesSalida: 'tasa_conversion'
          } as MatematicoNodeConfig
        },
        // Nodo KPI - Tasa de Conversión
        {
          id: 'node-kpi-2',
          type: 'kpi',
          label: 'Actualizar Conversión',
          position: { x: 600, y: 300 },
          config: {
            origenValor: 'variable',
            variableOrigen: 'tasa_conversion',
            kpiId: 'KPI-VEN-004',
            kpiNombre: 'Tasa de Conversión',
            kpiUnidad: 'porcentaje',
            alertasHabilitadas: true,
            umbrales: { advertencia: 2.5, critico: 2, direccion: 'menor' }
          } as KpiNodeConfig
        },
        // Nodo matemático para calcular tasa de error
        {
          id: 'node-math-3',
          type: 'matematico',
          label: 'Calcular Tasa Error',
          position: { x: 350, y: 500 },
          config: {
            formula: '(errores / tickets) * 100',
            precision: 2,
            variablesSalida: 'tasa_error'
          } as MatematicoNodeConfig
        },
        // Nodo KPI - Tasa de Error
        {
          id: 'node-kpi-3',
          type: 'kpi',
          label: 'Actualizar Tasa Error',
          position: { x: 600, y: 500 },
          config: {
            origenValor: 'variable',
            variableOrigen: 'tasa_error',
            kpiId: 'KPI-OPE-003',
            kpiNombre: 'Tasa de Error',
            kpiUnidad: 'porcentaje',
            alertasHabilitadas: true,
            umbrales: { advertencia: 2, critico: 5, direccion: 'mayor' }
          } as KpiNodeConfig
        },
        // Nodo de estado final
        {
          id: 'node-estado-kpi',
          type: 'estado',
          label: 'KPIs Actualizados',
          position: { x: 850, y: 300 },
          config: {
            tipoEstado: 'success',
            nombreEstado: 'Completado',
            mensaje: 'Todos los KPIs han sido actualizados correctamente.',
            notificar: true,
            accionSiguiente: 'continuar'
          } as EstadoNodeConfig
        }
      ],
      edges: [
        { id: 'edge-kpi-1', sourceNodeId: 'node-csv-kpi', targetNodeId: 'node-math-1' },
        { id: 'edge-kpi-2', sourceNodeId: 'node-csv-kpi', targetNodeId: 'node-math-2' },
        { id: 'edge-kpi-3', sourceNodeId: 'node-csv-kpi', targetNodeId: 'node-math-3' },
        { id: 'edge-kpi-4', sourceNodeId: 'node-math-1', targetNodeId: 'node-kpi-1' },
        { id: 'edge-kpi-5', sourceNodeId: 'node-math-2', targetNodeId: 'node-kpi-2' },
        { id: 'edge-kpi-6', sourceNodeId: 'node-math-3', targetNodeId: 'node-kpi-3' },
        { id: 'edge-kpi-7', sourceNodeId: 'node-kpi-1', targetNodeId: 'node-estado-kpi' },
        { id: 'edge-kpi-8', sourceNodeId: 'node-kpi-2', targetNodeId: 'node-estado-kpi' },
        { id: 'edge-kpi-9', sourceNodeId: 'node-kpi-3', targetNodeId: 'node-estado-kpi' }
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

  createProceso(nombre: string, descripcion: string, objetivos?: ObjetivoProceso[]): Proceso {
    // Convertir objetivos a lista flat de KPIs para fácil acceso
    const kpis: KpiProceso[] = [];
    if (objetivos) {
      for (const objetivo of objetivos) {
        for (const kpi of objetivo.kpis) {
          kpis.push({
            id: kpi.id,
            nombre: kpi.nombre,
            unidad: this.mapEscalaToUnidad(kpi.escala),
            meta: kpi.meta,
            valorActual: 0,
            objetivoId: objetivo.id,
            historico: [],
            alertas: { direccion: 'menor' }
          });
        }
      }
    }

    const proceso: Proceso = {
      id: `proc-${crypto.randomUUID()}`,
      nombre,
      descripcion,
      version: '1.0.0',
      estado: 'borrador',
      nodes: [],
      edges: [],
      objetivos: objetivos || [],
      kpis: kpis,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user'
    };

    this._procesos.update(list => [...list, proceso]);
    this.saveToStorage();
    return proceso;
  }

  // Helper para mapear escala del wizard a unidad del KPI
  private mapEscalaToUnidad(escala: string): string {
    const map: Record<string, string> = {
      'Porcentaje': 'porcentaje',
      'Unidades': 'numero',
      'Días': 'tiempo_dias',
      'Horas': 'tiempo_horas',
      'USD': 'moneda_usd'
    };
    return map[escala] || 'numero';
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
      } as MlNodeConfig),
      kpi: () => ({
        origenValor: 'variable',
        kpiId: '',
        kpiNombre: '',
        kpiUnidad: 'porcentaje',
        alertasHabilitadas: false,
        umbrales: { direccion: 'menor' },
        guardarHistorico: true
      } as KpiNodeConfig)
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
      ml: 'Machine Learning',
      kpi: 'Actualizar KPI'
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
      llm: 0, branching: 0, estado: 0, matematico: 0, ml: 0, kpi: 0
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
