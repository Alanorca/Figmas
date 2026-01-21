import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ProcessService } from '../../services/process.service';
import { Proceso } from '../../models/process-nodes';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexLegend,
  ApexFill,
  ApexPlotOptions,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  ApexGrid
} from 'ng-apexcharts';

// Types for KPI Dashboard
type PeriodoFiltro = 'semana' | 'mes' | 'trimestre' | 'anio';
type TendenciaDir = 'up' | 'down' | 'neutral';
type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertStatus = 'activa' | 'atendida' | 'resuelta';

// Resumen de KPIs por proceso (para drill-down)
interface ProcesoKPIResumen {
  procesoId: string;
  procesoNombre: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  totalObjetivos: number;
  totalKPIs: number;
  cumplimientoPromedio: number;
  cumplimientoAnterior: number;
  tendencia: TendenciaDir;
  alertasActivas: number;
  alertasCriticas: number;
  ultimaActualizacion: Date;
}

// Alerta consolidada de cualquier proceso
interface AlertaConsolidada {
  id: string;
  procesoId: string;
  procesoNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  kpiId: string;
  kpiNombre: string;
  severity: AlertSeverity;
  status: AlertStatus;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  fechaCreacion: Date;
  diasAbierto: number;
}

// KPI Metric para widgets top
interface KPIMetricGlobal {
  id: string;
  nombre: string;
  valor: number;
  valorAnterior: number;
  meta?: number;
  unidad: string;
  tendencia: TendenciaDir;
  porcentajeCambio: number;
  color: string;
}

@Component({
  selector: 'app-procesos-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    DrawerModule,
    DividerModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    MenuModule,
    ToolbarModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    TabsModule,
    DatePickerModule,
    NgApexchartsModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './procesos-lista.html',
  styleUrl: './procesos-lista.scss'
})
export class ProcesosListaComponent {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  processService = inject(ProcessService);

  // Lista de procesos
  procesos = this.processService.procesos;

  // Drawer de detalle
  showDrawer = signal(false);
  procesoSeleccionado = signal<Proceso | null>(null);

  // Selección múltiple
  procesosSeleccionados = signal<Proceso[]>([]);

  // Edición in-place
  procesoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Drawer de drilldown - Proceso
  showDrilldownDrawer = signal(false);
  drilldownProceso = signal<ProcesoKPIResumen | null>(null);
  drilldownVistaDesglose = signal<'kpis' | 'objetivos'>('kpis');
  objetivoExpandido = signal<string | null>(null);

  // Drawer de drilldown - Alerta
  showAlertaDrilldown = signal(false);
  alertaSeleccionada = signal<AlertaConsolidada | null>(null);

  // Drawer de drilldown - Tendencia
  showTendenciaDrilldown = signal(false);
  tendenciaProcesoSeleccionado = signal<ProcesoKPIResumen | null>(null);

  // Opciones para el select de desglose
  desgloseOptions = [
    { label: 'Por KPIs', value: 'kpis' },
    { label: 'Por Objetivos', value: 'objetivos' }
  ];

  // Opciones de estado para filtro
  estadoOptions: { label: string; value: Proceso['estado'] }[] = [
    { label: 'Borrador', value: 'borrador' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
    { label: 'Archivado', value: 'archivado' }
  ];

  // ==================== DASHBOARD KPIs ====================
  tabActivo = signal<'tabla' | 'dashboard'>('tabla');

  // Filtros del dashboard
  periodoFiltro = signal<PeriodoFiltro>('mes');
  severidadFiltro = signal<AlertSeverity | null>(null);
  estadoProcesoFiltro = signal<string | null>(null);

  periodoOptions = [
    { label: 'Última semana', value: 'semana' },
    { label: 'Último mes', value: 'mes' },
    { label: 'Último trimestre', value: 'trimestre' },
    { label: 'Último año', value: 'anio' }
  ];

  severidadOptions = [
    { label: 'Todas', value: null },
    { label: 'Crítico', value: 'critical' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Info', value: 'info' }
  ];

  // KPIs Globales calculados desde datos reales
  kpiMetricsGlobal = computed<KPIMetricGlobal[]>(() => {
    const procesos = this.procesosKPIResumen();
    const alertas = this.alertasConsolidadas();

    // Procesos activos
    const procesosActivos = procesos.filter(p => p.estado === 'activo').length;
    const procesosActivosAnterior = Math.max(1, procesosActivos - 1); // Mock para periodo anterior

    // Cumplimiento promedio (solo procesos activos)
    const procesosParaCumplimiento = procesos.filter(p => p.estado === 'activo');
    const cumplimientoActual = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoPromedio, 0) / procesosParaCumplimiento.length
      : 0;
    const cumplimientoAnterior = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoAnterior, 0) / procesosParaCumplimiento.length
      : 0;

    // Alertas activas
    const alertasActivas = alertas.filter(a => a.status === 'activa').length;
    const alertasActivasAnterior = alertasActivas + 2; // Mock

    // KPIs en riesgo (alertas críticas)
    const kpisEnRiesgo = alertas.filter(a => a.status === 'activa' && a.severity === 'critical').length;
    const kpisEnRiesgoAnterior = kpisEnRiesgo + 1; // Mock

    const calcPorcentaje = (actual: number, anterior: number) =>
      anterior !== 0 ? ((actual - anterior) / anterior) * 100 : 0;

    return [
      {
        id: 'g1', nombre: 'Procesos Activos',
        valor: procesosActivos, valorAnterior: procesosActivosAnterior,
        unidad: '', tendencia: procesosActivos >= procesosActivosAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(procesosActivos, procesosActivosAnterior), color: 'primary'
      },
      {
        id: 'g2', nombre: 'Cumplimiento Promedio',
        valor: Math.round(cumplimientoActual * 10) / 10, valorAnterior: Math.round(cumplimientoAnterior * 10) / 10,
        unidad: '%', tendencia: cumplimientoActual >= cumplimientoAnterior ? 'up' : 'down',
        porcentajeCambio: Math.round(calcPorcentaje(cumplimientoActual, cumplimientoAnterior) * 10) / 10, color: 'success'
      },
      {
        id: 'g3', nombre: 'Alertas Activas',
        valor: alertasActivas, valorAnterior: alertasActivasAnterior,
        unidad: '', tendencia: alertasActivas <= alertasActivasAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(alertasActivas, alertasActivasAnterior), color: 'warning'
      },
      {
        id: 'g4', nombre: 'KPIs en Riesgo',
        valor: kpisEnRiesgo, valorAnterior: kpisEnRiesgoAnterior,
        unidad: '', tendencia: kpisEnRiesgo <= kpisEnRiesgoAnterior ? 'up' : 'down',
        porcentajeCambio: calcPorcentaje(kpisEnRiesgo, kpisEnRiesgoAnterior), color: 'danger'
      }
    ];
  });

  // ==================== DATOS ESTRUCTURADOS COHERENTES ====================

  // Estructura completa de datos por proceso (fuente única de verdad)
  procesosCompletos = signal([
    {
      id: 'proc-demo-001',
      nombre: 'Gestión de Riesgos Operacionales',
      estado: 'activo' as const,
      objetivos: [
        {
          id: 'obj-001-1',
          nombre: 'Reducir incidentes de riesgo operacional',
          cumplimiento: 72,
          cumplimientoAnterior: 65,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-001-1-1', nombre: 'Incidentes reportados', valorActual: 12, meta: 8, cumplimiento: 67, tendencia: 'down' as const, umbral: 75, historico: [85, 78, 72, 67] },
            { id: 'kpi-001-1-2', nombre: 'Tiempo resolución (hrs)', valorActual: 4.2, meta: 4, cumplimiento: 95, tendencia: 'up' as const, umbral: 85, historico: [82, 88, 92, 95] },
            { id: 'kpi-001-1-3', nombre: 'Controles implementados', valorActual: 28, meta: 35, cumplimiento: 80, tendencia: 'up' as const, umbral: 70, historico: [65, 70, 75, 80] }
          ]
        },
        {
          id: 'obj-001-2',
          nombre: 'Mejorar cultura de gestión de riesgos',
          cumplimiento: 64,
          cumplimientoAnterior: 58,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-001-2-1', nombre: 'Capacitaciones completadas', valorActual: 156, meta: 200, cumplimiento: 78, tendencia: 'up' as const, umbral: 70, historico: [55, 62, 70, 78] },
            { id: 'kpi-001-2-2', nombre: 'Evaluación conocimiento', valorActual: 68, meta: 80, cumplimiento: 85, tendencia: 'up' as const, umbral: 75, historico: [72, 78, 82, 85] },
            { id: 'kpi-001-2-3', nombre: 'Reportes voluntarios', valorActual: 23, meta: 50, cumplimiento: 46, tendencia: 'down' as const, umbral: 60, historico: [52, 50, 48, 46] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-002',
      nombre: 'Control de Accesos y Seguridad',
      estado: 'activo' as const,
      objetivos: [
        {
          id: 'obj-002-1',
          nombre: 'Garantizar accesos autorizados',
          cumplimiento: 88,
          cumplimientoAnterior: 82,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-002-1-1', nombre: 'Accesos no autorizados', valorActual: 2, meta: 0, cumplimiento: 80, tendencia: 'up' as const, umbral: 90, historico: [65, 72, 76, 80] },
            { id: 'kpi-002-1-2', nombre: 'Revisiones de permisos', valorActual: 95, meta: 100, cumplimiento: 95, tendencia: 'up' as const, umbral: 85, historico: [78, 85, 90, 95] }
          ]
        },
        {
          id: 'obj-002-2',
          nombre: 'Proteger activos de información',
          cumplimiento: 76,
          cumplimientoAnterior: 74,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-002-2-1', nombre: 'Activos clasificados', valorActual: 342, meta: 400, cumplimiento: 86, tendencia: 'up' as const, umbral: 80, historico: [70, 75, 80, 86] },
            { id: 'kpi-002-2-2', nombre: 'Vulnerabilidades críticas', valorActual: 3, meta: 0, cumplimiento: 70, tendencia: 'down' as const, umbral: 85, historico: [88, 82, 76, 70] },
            { id: 'kpi-002-2-3', nombre: 'Parches aplicados', valorActual: 89, meta: 100, cumplimiento: 89, tendencia: 'up' as const, umbral: 90, historico: [75, 80, 85, 89] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-003',
      nombre: 'Cumplimiento Normativo SOX',
      estado: 'activo' as const,
      objetivos: [
        {
          id: 'obj-003-1',
          nombre: 'Cumplir regulaciones financieras',
          cumplimiento: 75,
          cumplimientoAnterior: 80,
          tendencia: 'down' as const,
          kpis: [
            { id: 'kpi-003-1-1', nombre: 'Controles SOX cumplidos', valorActual: 45, meta: 52, cumplimiento: 87, tendencia: 'up' as const, umbral: 95, historico: [80, 82, 85, 87] },
            { id: 'kpi-003-1-2', nombre: 'Hallazgos de auditoría', valorActual: 8, meta: 3, cumplimiento: 63, tendencia: 'down' as const, umbral: 80, historico: [85, 78, 70, 63] }
          ]
        },
        {
          id: 'obj-003-2',
          nombre: 'Documentación y evidencias',
          cumplimiento: 68,
          cumplimientoAnterior: 72,
          tendencia: 'down' as const,
          kpis: [
            { id: 'kpi-003-2-1', nombre: 'Documentos actualizados', valorActual: 78, meta: 100, cumplimiento: 78, tendencia: 'down' as const, umbral: 85, historico: [88, 85, 82, 78] },
            { id: 'kpi-003-2-2', nombre: 'Evidencias completas', valorActual: 156, meta: 200, cumplimiento: 78, tendencia: 'up' as const, umbral: 80, historico: [68, 72, 75, 78] },
            { id: 'kpi-003-2-3', nombre: 'Revisiones a tiempo', valorActual: 42, meta: 50, cumplimiento: 84, tendencia: 'down' as const, umbral: 90, historico: [92, 90, 87, 84] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-004',
      nombre: 'Gestión de Incidentes',
      estado: 'activo' as const,
      objetivos: [
        {
          id: 'obj-004-1',
          nombre: 'Respuesta rápida a incidentes',
          cumplimiento: 91,
          cumplimientoAnterior: 88,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-004-1-1', nombre: 'Tiempo primera respuesta', valorActual: 12, meta: 15, cumplimiento: 100, tendencia: 'up' as const, umbral: 85, historico: [82, 88, 94, 100] },
            { id: 'kpi-004-1-2', nombre: 'Incidentes resueltos 24h', valorActual: 87, meta: 90, cumplimiento: 97, tendencia: 'up' as const, umbral: 80, historico: [78, 85, 92, 97] }
          ]
        },
        {
          id: 'obj-004-2',
          nombre: 'Prevención de recurrencia',
          cumplimiento: 85,
          cumplimientoAnterior: 80,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-004-2-1', nombre: 'Análisis causa raíz', valorActual: 92, meta: 100, cumplimiento: 92, tendencia: 'up' as const, umbral: 85, historico: [75, 82, 88, 92] },
            { id: 'kpi-004-2-2', nombre: 'Acciones preventivas', valorActual: 34, meta: 40, cumplimiento: 85, tendencia: 'up' as const, umbral: 80, historico: [70, 75, 80, 85] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-005',
      nombre: 'Auditoría Interna',
      estado: 'borrador' as const,
      objetivos: [
        {
          id: 'obj-005-1',
          nombre: 'Ejecutar plan de auditoría',
          cumplimiento: 45,
          cumplimientoAnterior: 40,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-005-1-1', nombre: 'Auditorías completadas', valorActual: 8, meta: 20, cumplimiento: 40, tendencia: 'up' as const, umbral: 70, historico: [25, 30, 35, 40] },
            { id: 'kpi-005-1-2', nombre: 'Cobertura de procesos', valorActual: 35, meta: 80, cumplimiento: 44, tendencia: 'up' as const, umbral: 60, historico: [30, 35, 40, 44] }
          ]
        },
        {
          id: 'obj-005-2',
          nombre: 'Seguimiento de hallazgos',
          cumplimiento: 52,
          cumplimientoAnterior: 48,
          tendencia: 'up' as const,
          kpis: [
            { id: 'kpi-005-2-1', nombre: 'Hallazgos cerrados', valorActual: 18, meta: 35, cumplimiento: 51, tendencia: 'up' as const, umbral: 70, historico: [38, 42, 47, 51] },
            { id: 'kpi-005-2-2', nombre: 'Tiempo promedio cierre', valorActual: 45, meta: 30, cumplimiento: 67, tendencia: 'down' as const, umbral: 80, historico: [75, 72, 70, 67] }
          ]
        }
      ]
    }
  ]);

  // Computed: Resumen de KPIs por proceso (derivado de procesosCompletos)
  procesosKPIResumen = computed<ProcesoKPIResumen[]>(() => {
    return this.procesosCompletos().map(p => {
      const totalKPIs = p.objetivos.reduce((sum, obj) => sum + obj.kpis.length, 0);
      const cumplimientoPromedio = Math.round(
        p.objetivos.reduce((sum, obj) => sum + obj.cumplimiento, 0) / p.objetivos.length
      );
      const cumplimientoAnterior = Math.round(
        p.objetivos.reduce((sum, obj) => sum + obj.cumplimientoAnterior, 0) / p.objetivos.length
      );
      const alertasActivas = this.alertasConsolidadas().filter(a => a.procesoId === p.id && a.status === 'activa').length;
      const alertasCriticas = this.alertasConsolidadas().filter(a => a.procesoId === p.id && a.status === 'activa' && a.severity === 'critical').length;

      return {
        procesoId: p.id,
        procesoNombre: p.nombre,
        estado: p.estado,
        totalObjetivos: p.objetivos.length,
        totalKPIs,
        cumplimientoPromedio,
        cumplimientoAnterior,
        tendencia: cumplimientoPromedio >= cumplimientoAnterior ? 'up' as const : 'down' as const,
        alertasActivas,
        alertasCriticas,
        ultimaActualizacion: new Date()
      };
    });
  });

  // Alertas consolidadas (referenciando datos reales)
  alertasConsolidadas = signal<AlertaConsolidada[]>([
    {
      id: 'ALERT-001', procesoId: 'proc-demo-001', procesoNombre: 'Gestión de Riesgos Operacionales',
      objetivoId: 'obj-001-1', objetivoNombre: 'Reducir incidentes de riesgo operacional',
      kpiId: 'kpi-001-1-1', kpiNombre: 'Incidentes reportados',
      severity: 'critical', status: 'activa',
      mensaje: 'Incidentes por encima del umbral permitido (12 vs meta de 8)',
      valorActual: 67, valorUmbral: 75, fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), diasAbierto: 2
    },
    {
      id: 'ALERT-002', procesoId: 'proc-demo-001', procesoNombre: 'Gestión de Riesgos Operacionales',
      objetivoId: 'obj-001-2', objetivoNombre: 'Mejorar cultura de gestión de riesgos',
      kpiId: 'kpi-001-2-3', kpiNombre: 'Reportes voluntarios',
      severity: 'warning', status: 'activa',
      mensaje: 'Reportes voluntarios por debajo del umbral (46% < 60%)',
      valorActual: 46, valorUmbral: 60, fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), diasAbierto: 5
    },
    {
      id: 'ALERT-003', procesoId: 'proc-demo-003', procesoNombre: 'Cumplimiento Normativo SOX',
      objetivoId: 'obj-003-1', objetivoNombre: 'Cumplir regulaciones financieras',
      kpiId: 'kpi-003-1-2', kpiNombre: 'Hallazgos de auditoría',
      severity: 'critical', status: 'activa',
      mensaje: 'Hallazgos de auditoría críticos (63% < 80%)',
      valorActual: 63, valorUmbral: 80, fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), diasAbierto: 1
    },
    {
      id: 'ALERT-004', procesoId: 'proc-demo-002', procesoNombre: 'Control de Accesos y Seguridad',
      objetivoId: 'obj-002-2', objetivoNombre: 'Proteger activos de información',
      kpiId: 'kpi-002-2-2', kpiNombre: 'Vulnerabilidades críticas',
      severity: 'warning', status: 'activa',
      mensaje: 'Vulnerabilidades críticas por debajo del umbral (70% < 85%)',
      valorActual: 70, valorUmbral: 85, fechaCreacion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), diasAbierto: 3
    },
    {
      id: 'ALERT-005', procesoId: 'proc-demo-005', procesoNombre: 'Auditoría Interna',
      objetivoId: 'obj-005-1', objetivoNombre: 'Ejecutar plan de auditoría',
      kpiId: 'kpi-005-1-1', kpiNombre: 'Auditorías completadas',
      severity: 'warning', status: 'activa',
      mensaje: 'Auditorías completadas muy por debajo de meta (40% < 70%)',
      valorActual: 40, valorUmbral: 70, fechaCreacion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), diasAbierto: 7
    }
  ]);

  // Computed: Alertas filtradas
  alertasFiltradas = computed(() => {
    let alertas = this.alertasConsolidadas().filter(a => a.status === 'activa');
    if (this.severidadFiltro()) {
      alertas = alertas.filter(a => a.severity === this.severidadFiltro());
    }
    return alertas.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  });

  // Computed: Procesos filtrados
  procesosFiltrados = computed(() => {
    let procs = this.procesosKPIResumen();
    if (this.estadoProcesoFiltro()) {
      procs = procs.filter(p => p.estado === this.estadoProcesoFiltro());
    }
    return procs.sort((a, b) => b.alertasCriticas - a.alertasCriticas || b.alertasActivas - a.alertasActivas);
  });

  // ==================== APEXCHARTS CONFIGURATIONS ====================

  // Colores para procesos
  private processColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Chart: Tendencia por Proceso (Line Chart)
  apexTendenciaSeries = computed<ApexAxisChartSeries>(() => {
    const procesos = this.procesosKPIResumen();
    if (!procesos || procesos.length === 0) {
      return [{ name: 'Sin datos', data: [0, 0, 0, 0] }];
    }
    return procesos.slice(0, 5).map((p) => ({
      name: p.procesoNombre.length > 18 ? p.procesoNombre.substring(0, 18) + '...' : p.procesoNombre,
      data: this.generarTendenciaRandom(p.cumplimientoPromedio)
    }));
  });

  apexTendenciaChart: ApexChart = {
    type: 'line',
    height: 260,
    toolbar: { show: true },
    zoom: { enabled: false },
    events: {
      legendClick: (chartContext: any, seriesIndex: number, config: any) => {
        this.onTendenciaSeriesClick(seriesIndex);
      }
    }
  };

  // Método para manejar clic en serie de tendencia - abre drawer de tendencia
  onTendenciaSeriesClick(seriesIndex: number): void {
    const procesos = this.procesosKPIResumen();
    if (procesos && procesos[seriesIndex]) {
      this.abrirTendenciaDrilldown(procesos[seriesIndex]);
    }
  }

  apexTendenciaXAxis: ApexXAxis = {
    categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  };

  apexTendenciaYAxis: ApexYAxis = {
    min: 20,
    max: 100,
    labels: { formatter: (val: number) => val.toFixed(0) + '%' }
  };

  apexTendenciaStroke: ApexStroke = { curve: 'smooth', width: 2 };

  apexTendenciaColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  apexTendenciaLegend: ApexLegend = {
    position: 'bottom',
    horizontalAlign: 'center'
  };

  apexTendenciaGrid: ApexGrid = {
    borderColor: '#e2e8f0',
    strokeDashArray: 4
  };

  apexTendenciaTooltip: ApexTooltip = {
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => val.toFixed(1) + '%' }
  };

  // Chart: Cumplimiento por Proceso (Horizontal Bar)
  apexCumplimientoSeries = computed<ApexAxisChartSeries>(() => {
    const procesos = this.procesosKPIResumen();
    if (!procesos || procesos.length === 0) {
      return [{ name: 'Cumplimiento', data: [] }];
    }
    return [{
      name: 'Cumplimiento',
      data: procesos.map(p => p.cumplimientoPromedio)
    }];
  });

  apexCumplimientoChart: ApexChart = {
    type: 'bar',
    height: 260,
    toolbar: { show: false },
    events: {
      dataPointSelection: (event: any, chartContext: any, config: any) => {
        this.onCumplimientoBarClick(config.dataPointIndex);
      }
    }
  };

  // Método para manejar clic en barra de cumplimiento
  onCumplimientoBarClick(index: number): void {
    const procesos = this.procesosKPIResumen();
    if (procesos && procesos[index]) {
      this.abrirDrilldownProceso(procesos[index]);
    }
  }

  apexCumplimientoPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      distributed: true
    }
  };

  apexCumplimientoColors = computed(() => {
    const procesos = this.procesosKPIResumen();
    if (!procesos || procesos.length === 0) return ['#10b981'];
    return procesos.map(p =>
      p.cumplimientoPromedio >= 80 ? '#10b981' :
      p.cumplimientoPromedio >= 60 ? '#f59e0b' : '#ef4444'
    );
  });

  apexCumplimientoXAxis = computed<ApexXAxis>(() => {
    const procesos = this.procesosKPIResumen();
    if (!procesos || procesos.length === 0) return { categories: [] };
    return {
      categories: procesos.map(p =>
        p.procesoNombre.length > 22 ? p.procesoNombre.substring(0, 22) + '...' : p.procesoNombre
      )
    };
  });

  apexCumplimientoYAxis: ApexYAxis = {
    max: 100
  };

  apexCumplimientoDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toFixed(0) + '%',
    offsetX: 25,
    style: { fontSize: '11px', colors: ['#334155'] }
  };

  apexCumplimientoTooltip: ApexTooltip = {
    y: { formatter: (val: number) => val.toFixed(1) + '%' }
  };

  // Chart: Alertas (Donut Chart)
  apexAlertasSeries = computed<ApexNonAxisChartSeries>(() => {
    const alertas = this.alertasConsolidadas().filter(a => a.status === 'activa');
    const critical = alertas.filter(a => a.severity === 'critical').length;
    const warning = alertas.filter(a => a.severity === 'warning').length;
    const info = alertas.filter(a => a.severity === 'info').length;
    // Ensure we have at least some value to show
    if (critical === 0 && warning === 0 && info === 0) {
      return [0, 0, 1]; // Show at least info
    }
    return [critical, warning, info];
  });

  apexAlertasChart: ApexChart = {
    type: 'donut',
    height: 200,
    events: {
      dataPointSelection: (event: any, chartContext: any, config: any) => {
        this.onAlertasDonutClick(config.dataPointIndex);
      }
    }
  };

  // Método para manejar clic en donut de alertas
  onAlertasDonutClick(index: number): void {
    // index: 0 = Críticas, 1 = Advertencias, 2 = Información
    const severidades: AlertSeverity[] = ['critical', 'warning', 'info'];
    const severidadSeleccionada = severidades[index];

    // Buscar la primera alerta de esa severidad
    const alertas = this.alertasFiltradas();
    const alerta = alertas.find(a => a.severity === severidadSeleccionada);

    if (alerta) {
      this.abrirAlertaDrilldown(alerta);
    }
  }

  apexAlertasLabels = ['Críticas', 'Advertencias', 'Información'];
  // Colores alineados con design tokens: --red-500, --amber-500, --blue-500
  apexAlertasColors = ['#ef4444', '#f59e0b', '#3b82f6'];

  apexAlertasPlotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          name: { show: true },
          value: { show: true },
          total: { show: true, label: 'Total' }
        }
      }
    }
  };

  apexAlertasLegend: ApexLegend = {
    position: 'bottom',
    horizontalAlign: 'center'
  };

  apexAlertasResponsive: ApexResponsive[] = [{
    breakpoint: 480,
    options: { chart: { width: 200 }, legend: { position: 'bottom' } }
  }];

  // ==================== DRILLDOWN APEXCHARTS ====================

  // Colores para KPIs en el drilldown (multicolor como en el diseño)
  private kpiColors = [
    '#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6'
  ];

  // Datos de KPIs u Objetivos para el drilldown (según selección)
  drilldownKPIsData = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return [];

    const vista = this.drilldownVistaDesglose();
    const procesoCompleto = this.procesosCompletos().find(p => p.id === proceso.procesoId);

    if (!procesoCompleto) return [];

    if (vista === 'objetivos') {
      // Mostrar objetivos
      return procesoCompleto.objetivos.map((obj, i) => ({
        id: obj.id,
        nombre: obj.nombre,
        valor: obj.cumplimiento,
        color: this.kpiColors[i % this.kpiColors.length]
      }));
    } else {
      // Mostrar KPIs (todos los KPIs de todos los objetivos)
      const allKPIs: { id: string; nombre: string; valor: number; color: string }[] = [];
      procesoCompleto.objetivos.forEach((obj, objIndex) => {
        obj.kpis.forEach((kpi, kpiIndex) => {
          allKPIs.push({
            id: kpi.id,
            nombre: kpi.nombre,
            valor: kpi.cumplimiento,
            color: this.kpiColors[(objIndex * 2 + kpiIndex) % this.kpiColors.length]
          });
        });
      });
      return allKPIs;
    }
  });

  // Drilldown Bar Chart - Series
  apexDrilldownBarSeries = computed<ApexAxisChartSeries>(() => {
    const kpis = this.drilldownKPIsData();
    if (!kpis.length) return [{ name: 'Cumplimiento', data: [] }];
    return [{ name: 'Cumplimiento', data: kpis.map(k => k.valor) }];
  });

  // Drilldown Bar Chart - Colors
  apexDrilldownBarColors = computed(() => {
    const kpis = this.drilldownKPIsData();
    return kpis.map(k => k.color);
  });

  // Drilldown Bar Chart - XAxis
  apexDrilldownBarXAxis = computed<ApexXAxis>(() => {
    const kpis = this.drilldownKPIsData();
    return {
      categories: kpis.map(k => k.nombre),
      labels: { style: { fontSize: '11px', colors: '#64748b' } }
    };
  });

  // Drilldown Bar Chart Config
  apexDrilldownBarChart: ApexChart = {
    type: 'bar',
    height: 300,
    toolbar: { show: false }
  };

  apexDrilldownBarPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      borderRadius: 4,
      distributed: true,
      barHeight: '70%',
      dataLabels: { position: 'center' }
    }
  };

  apexDrilldownBarYAxis: ApexYAxis = {
    max: 100,
    labels: { show: false }
  };

  apexDrilldownBarDataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number) => val.toFixed(0) + '%',
    style: { fontSize: '11px', colors: ['#ffffff'], fontWeight: 600 },
    offsetX: 0
  };

  apexDrilldownBarLegend: ApexLegend = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '10px',
    markers: { shape: 'square' },
    itemMargin: { horizontal: 8, vertical: 4 }
  };

  apexDrilldownBarGrid: ApexGrid = {
    show: true,
    borderColor: '#e2e8f0',
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: false } }
  };

  // Objetivos con detalle para el accordion (usa datos reales)
  drilldownObjetivosDetalle = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return [];

    const procesoCompleto = this.procesosCompletos().find(p => p.id === proceso.procesoId);
    if (!procesoCompleto) return [];

    return procesoCompleto.objetivos.map(obj => ({
      id: obj.id,
      nombre: obj.nombre,
      cumplimiento: obj.cumplimiento,
      tendencia: obj.tendencia,
      kpisList: obj.kpis.map(kpi => ({
        id: kpi.id,
        nombre: kpi.nombre,
        valorActual: kpi.cumplimiento,
        meta: 100,
        cumplimiento: kpi.cumplimiento,
        tendencia: kpi.tendencia
      }))
    }));
  });

  // Obtener detalle de KPI para una alerta
  getAlertaKPIDetalle = computed(() => {
    const alerta = this.alertaSeleccionada();
    if (!alerta) return null;

    const proceso = this.procesosCompletos().find(p => p.id === alerta.procesoId);
    if (!proceso) return null;

    const objetivo = proceso.objetivos.find(o => o.id === alerta.objetivoId);
    if (!objetivo) return null;

    const kpi = objetivo.kpis.find(k => k.id === alerta.kpiId);
    if (!kpi) return null;

    return { proceso, objetivo, kpi };
  });

  // Tendencia histórica y predicción para el drawer de tendencia
  tendenciaProcesoData = computed(() => {
    const proceso = this.tendenciaProcesoSeleccionado();
    if (!proceso) return null;

    const procesoCompleto = this.procesosCompletos().find(p => p.id === proceso.procesoId);
    if (!procesoCompleto) return null;

    // Calcular tendencia histórica basada en promedios de objetivos
    const historicoSemanas = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const historico = [0, 1, 2, 3].map(weekIndex => {
      const promedioSemana = procesoCompleto.objetivos.reduce((sum, obj) => {
        const promedioKPIs = obj.kpis.reduce((s, k) => s + (k.historico[weekIndex] || 0), 0) / obj.kpis.length;
        return sum + promedioKPIs;
      }, 0) / procesoCompleto.objetivos.length;
      return Math.round(promedioSemana);
    });

    // Calcular predicción (regresión lineal simple)
    const n = historico.length;
    const sumX = historico.reduce((s, _, i) => s + i, 0);
    const sumY = historico.reduce((s, v) => s + v, 0);
    const sumXY = historico.reduce((s, v, i) => s + i * v, 0);
    const sumX2 = historico.reduce((s, _, i) => s + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const prediccion = [4, 5, 6, 7].map(i => Math.round(Math.max(0, Math.min(100, intercept + slope * i))));
    const tendenciaGeneral = slope > 0.5 ? 'positiva' : slope < -0.5 ? 'negativa' : 'estable';

    return {
      proceso: procesoCompleto,
      historicoSemanas,
      historico,
      prediccionSemanas: ['Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
      prediccion,
      tendenciaGeneral,
      cambioPrediccion: prediccion[3] - historico[3]
    };
  });

  // Método para obtener clase de color según cumplimiento
  getCumplimientoColorClass(valor: number): string {
    if (valor >= 80) return 'color-success';
    if (valor >= 60) return 'color-warning';
    if (valor >= 40) return 'color-orange';
    return 'color-danger';
  }

  // ==================== TENDENCIA DRILLDOWN APEXCHARTS ====================

  // Series para gráfica de tendencia con predicción
  apexTendenciaDrilldownSeries = computed<ApexAxisChartSeries>(() => {
    const data = this.tendenciaProcesoData();
    if (!data) return [];

    return [
      {
        name: 'Histórico',
        data: [...data.historico, null, null, null, null] as (number | null)[]
      },
      {
        name: 'Predicción',
        data: [null, null, null, data.historico[3], ...data.prediccion] as (number | null)[]
      }
    ];
  });

  apexTendenciaDrilldownChart: ApexChart = {
    type: 'line',
    height: 280,
    toolbar: { show: true },
    zoom: { enabled: false }
  };

  apexTendenciaDrilldownXAxis = computed<ApexXAxis>(() => {
    const data = this.tendenciaProcesoData();
    if (!data) return { categories: [] };
    return {
      categories: [...data.historicoSemanas, ...data.prediccionSemanas]
    };
  });

  apexTendenciaDrilldownYAxis: ApexYAxis = {
    min: 0,
    max: 100,
    labels: { formatter: (val: number) => val.toFixed(0) + '%' }
  };

  apexTendenciaDrilldownColors = ['#10b981', '#6366f1'];

  apexTendenciaDrilldownStroke: ApexStroke = {
    width: [3, 3],
    curve: 'smooth',
    dashArray: [0, 5]
  };

  apexTendenciaDrilldownMarkers = {
    size: 6,
    strokeWidth: 2,
    hover: { size: 8 }
  };

  apexTendenciaDrilldownAnnotations = computed(() => {
    return {
      xaxis: [{
        x: 'Sem 4',
        borderColor: '#94a3b8',
        strokeDashArray: 4,
        label: {
          text: 'Hoy',
          style: { color: '#64748b', background: '#f1f5f9' }
        }
      }]
    };
  });

  // Gráfica de KPI histórico para drawer de alerta
  apexAlertaKPIHistoricoSeries = computed<ApexAxisChartSeries>(() => {
    const detalle = this.getAlertaKPIDetalle();
    if (!detalle) return [];

    return [{
      name: detalle.kpi.nombre,
      data: detalle.kpi.historico
    }];
  });

  apexAlertaKPIChart: ApexChart = {
    type: 'area',
    height: 180,
    sparkline: { enabled: false },
    toolbar: { show: false }
  };

  apexAlertaKPIXAxis: ApexXAxis = {
    categories: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    labels: { style: { fontSize: '10px' } }
  };

  apexAlertaKPIYAxis: ApexYAxis = {
    min: 0,
    max: 100
  };

  apexAlertaKPIColors = computed(() => {
    const detalle = this.getAlertaKPIDetalle();
    if (!detalle) return ['#94a3b8'];
    return detalle.kpi.tendencia === 'up' ? ['#10b981'] : ['#ef4444'];
  });

  apexAlertaKPIFill: ApexFill = {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 }
  };

  // Helper para generar tendencia mock (4 semanas)
  private generarTendenciaRandom(valorFinal: number): number[] {
    const result = [];
    let val = valorFinal - 15 + Math.random() * 10;
    for (let i = 0; i < 4; i++) {
      result.push(Math.round(Math.max(20, Math.min(100, val))));
      val += (valorFinal - val) * 0.4 + (Math.random() - 0.5) * 8;
    }
    result[3] = Math.round(valorFinal);
    return result;
  }

  // Estadísticas
  stats = computed(() => {
    const lista = this.procesos();
    return {
      total: lista.length,
      borradores: lista.filter(p => p.estado === 'borrador').length,
      activos: lista.filter(p => p.estado === 'activo').length,
      inactivos: lista.filter(p => p.estado === 'inactivo').length
    };
  });

  // Navegar a crear nuevo proceso
  crearProceso(): void {
    this.router.navigate(['/procesos/crear']);
  }

  // Ver detalle en pantalla completa
  verDetalle(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id, 'detalle']);
  }

  // Ver detalle en drawer (alternativo)
  verDetalleDrawer(proceso: Proceso): void {
    this.procesoSeleccionado.set(proceso);
    this.showDrawer.set(true);
  }

  // Editar proceso (navegar al editor)
  editarProceso(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id]);
  }

  // Duplicar proceso
  duplicarProceso(proceso: Proceso): void {
    const copia = this.processService.duplicateProceso(proceso.id);
    if (copia) {
      this.messageService.add({
        severity: 'success',
        summary: 'Duplicado',
        detail: `Proceso "${copia.nombre}" creado`
      });
    }
  }

  // Ejecutar proceso - navega al runner
  ejecutarProceso(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id, 'runner']);
  }

  // Eliminar proceso
  eliminarProceso(proceso: Proceso): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${proceso.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.processService.deleteProceso(proceso.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Proceso eliminado exitosamente'
        });
        if (this.procesoSeleccionado()?.id === proceso.id) {
          this.showDrawer.set(false);
        }
      }
    });
  }

  // Cambiar estado del proceso
  cambiarEstado(proceso: Proceso, estado: Proceso['estado']): void {
    this.processService.updateProcesoEstado(proceso.id, estado);
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Proceso marcado como "${estado}"`
    });
  }

  // Helpers para tags de estado
  getEstadoSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'borrador': 'secondary',
      'activo': 'success',
      'inactivo': 'warn',
      'archivado': 'danger'
    };
    return severities[estado] || 'info';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'archivado': 'Archivado'
    };
    return labels[estado] || estado;
  }

  // Formatear fecha
  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Resetear datos de demo
  resetDemoData(): void {
    this.confirmationService.confirm({
      message: '¿Deseas cargar los 5 procesos de demostración? Esto reemplazará los procesos demo existentes.',
      header: 'Cargar Datos Demo',
      icon: 'pi pi-database',
      acceptLabel: 'Cargar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.processService.resetDemoProcesses();
        this.messageService.add({
          severity: 'success',
          summary: 'Demo cargado',
          detail: 'Se han cargado 5 procesos de demostración con nodos funcionales'
        });
      }
    });
  }

  // Generar items del menú contextual
  getMenuItems(proceso: Proceso): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.verDetalle(proceso)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarProceso(proceso)
      },
      {
        label: 'Edición rápida',
        icon: 'pi pi-bolt',
        command: () => this.iniciarEdicionDesdeMenu(proceso)
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicarProceso(proceso)
      }
    ];

    if (proceso.estado === 'activo') {
      items.push({
        label: 'Ejecutar',
        icon: 'pi pi-play',
        command: () => this.ejecutarProceso(proceso)
      });
    }

    items.push({
      separator: true
    });

    items.push({
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.eliminarProceso(proceso)
    });

    return items;
  }

  // Métodos para el resumen del footer
  getCountByEstado(estado: string): number {
    return this.procesos().filter(p => p.estado === estado).length;
  }

  getTotalNodos(): number {
    return this.procesos().reduce((total, p) => total + (p.nodes?.length || 0), 0);
  }

  // Métodos de edición in-place
  iniciarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  iniciarEdicionDesdeMenu(proceso: Proceso): void {
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  estaEditando(procesoId: string): boolean {
    return this.procesoEditando() === procesoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  guardarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    console.log(`Guardando edición del proceso ${proceso.id}:`, valores);
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(procesos: Proceso[]): void {
    this.procesosSeleccionados.set(procesos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.procesosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }

  // ==================== MÉTODOS DASHBOARD ====================

  // Obtener clase de tendencia global
  getTendenciaClassGlobal(kpi: KPIMetricGlobal): string {
    // Para alertas y KPIs en riesgo, menos es mejor
    if (kpi.id === 'g3' || kpi.id === 'g4') {
      return kpi.porcentajeCambio < 0 ? 'tendencia-positiva' : 'tendencia-negativa';
    }
    return kpi.porcentajeCambio > 0 ? 'tendencia-positiva' : 'tendencia-negativa';
  }

  // Obtener icono de tendencia
  getTendenciaIconGlobal(kpi: KPIMetricGlobal): string {
    if (kpi.id === 'g3' || kpi.id === 'g4') {
      return kpi.porcentajeCambio < 0 ? 'pi pi-arrow-down' : 'pi pi-arrow-up';
    }
    return kpi.porcentajeCambio > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }

  // Obtener clase de color para KPI card
  getKpiColorClass(kpi: KPIMetricGlobal): string {
    return `kpi-${kpi.color}`;
  }

  // Obtener clase de tendencia para proceso
  getTendenciaClassProceso(proceso: ProcesoKPIResumen): string {
    return proceso.tendencia === 'up' ? 'tendencia-positiva' : proceso.tendencia === 'down' ? 'tendencia-negativa' : '';
  }

  // Obtener severity para alertas
  getAlertaSeverity(severity: AlertSeverity): 'danger' | 'warn' | 'info' {
    const map: Record<AlertSeverity, 'danger' | 'warn' | 'info'> = {
      'critical': 'danger',
      'warning': 'warn',
      'info': 'info'
    };
    return map[severity];
  }

  // Obtener color de barra de progreso
  getProgresoClass(valor: number): string {
    if (valor >= 85) return 'progreso-excelente';
    if (valor >= 70) return 'progreso-bueno';
    if (valor >= 50) return 'progreso-regular';
    return 'progreso-bajo';
  }

  // ========== DRILL-DOWN NAVIGATION ==========

  // Navegar a objetivos-kpis de un proceso específico
  navegarAObjetivosKPIs(procesoId: string): void {
    this.router.navigate(['/procesos', procesoId, 'objetivos-kpis']);
  }

  // Navegar a alerta específica (va a objetivos-kpis del proceso con la alerta)
  navegarAAlerta(alerta: AlertaConsolidada): void {
    // Navega al proceso y podría pasar query params para resaltar la alerta
    this.router.navigate(['/procesos', alerta.procesoId, 'objetivos-kpis'], {
      queryParams: { objetivoId: alerta.objetivoId, alertaId: alerta.id }
    });
  }

  // Ver detalle de proceso en drawer
  verResumenProceso(proceso: ProcesoKPIResumen): void {
    // Buscar proceso en la lista y mostrarlo en drawer
    const proc = this.procesos().find(p => p.id === proceso.procesoId);
    if (proc) {
      this.procesoSeleccionado.set(proc);
      this.showDrawer.set(true);
    } else {
      // Si no existe, navegar directamente
      this.navegarAObjetivosKPIs(proceso.procesoId);
    }
  }

  // ========== DRILLDOWN DRAWERS ==========
  abrirDrilldownProceso(proceso: ProcesoKPIResumen): void {
    this.drilldownProceso.set(proceso);
    this.objetivoExpandido.set(null);
    this.showDrilldownDrawer.set(true);
  }

  // Abrir drawer de alerta
  abrirAlertaDrilldown(alerta: AlertaConsolidada): void {
    this.alertaSeleccionada.set(alerta);
    this.showAlertaDrilldown.set(true);
  }

  // Abrir drawer de tendencia
  abrirTendenciaDrilldown(proceso: ProcesoKPIResumen): void {
    this.tendenciaProcesoSeleccionado.set(proceso);
    this.showTendenciaDrilldown.set(true);
  }

  // Objetivos del proceso para el drilldown
  drilldownObjetivos = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return [];
    // Datos mock de objetivos basados en el proceso
    const objetivosData = [
      {
        id: 'obj1',
        nombre: 'Reducir tiempo de respuesta',
        kpis: 3,
        cumplimiento: 78,
        cumplimientoAnterior: 72,
        alertas: 0,
        kpisList: [
          { id: 'kpi1-1', nombre: 'Tiempo promedio resolución', valor: 85, tendencia: 'up' as const },
          { id: 'kpi1-2', nombre: 'SLA cumplido', valor: 72, tendencia: 'down' as const },
          { id: 'kpi1-3', nombre: 'Tickets cerrados a tiempo', valor: 78, tendencia: 'up' as const }
        ]
      },
      {
        id: 'obj2',
        nombre: 'Mejorar satisfacción del cliente',
        kpis: 2,
        cumplimiento: 65,
        cumplimientoAnterior: 68,
        alertas: 1,
        kpisList: [
          { id: 'kpi2-1', nombre: 'NPS Score', valor: 68, tendencia: 'down' as const },
          { id: 'kpi2-2', nombre: 'Encuestas positivas', valor: 62, tendencia: 'neutral' as const }
        ]
      },
      {
        id: 'obj3',
        nombre: 'Optimizar recursos operativos',
        kpis: 2,
        cumplimiento: 82,
        cumplimientoAnterior: 75,
        alertas: 0,
        kpisList: [
          { id: 'kpi3-1', nombre: 'Eficiencia operativa', valor: 88, tendencia: 'up' as const },
          { id: 'kpi3-2', nombre: 'Costo por transacción', valor: 76, tendencia: 'up' as const }
        ]
      },
      {
        id: 'obj4',
        nombre: 'Cumplimiento normativo',
        kpis: 2,
        cumplimiento: 55,
        cumplimientoAnterior: 60,
        alertas: 2,
        kpisList: [
          { id: 'kpi4-1', nombre: 'Auditorías aprobadas', valor: 50, tendencia: 'down' as const },
          { id: 'kpi4-2', nombre: 'Controles implementados', valor: 60, tendencia: 'neutral' as const }
        ]
      }
    ];
    return objetivosData.slice(0, proceso.totalObjetivos);
  });

  // Toggle objetivo expandido
  toggleObjetivoExpandido(objetivoId: string): void {
    if (this.objetivoExpandido() === objetivoId) {
      this.objetivoExpandido.set(null);
    } else {
      this.objetivoExpandido.set(objetivoId);
    }
  }

  // Navegar al detalle completo del proceso
  navegarADetalleProceso(): void {
    const proceso = this.drilldownProceso();
    if (proceso) {
      this.showDrilldownDrawer.set(false);
      this.router.navigate(['/procesos', proceso.procesoId, 'objetivos-kpis']);
    }
  }

  // Alertas del proceso para el drilldown
  drilldownAlertas = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return [];
    return this.alertasConsolidadas()
      .filter(a => a.procesoId === proceso.procesoId)
      .slice(0, 5);
  });

  // Gráfica de cumplimiento para drilldown (doughnut)
  drilldownChartCumplimiento = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return { labels: [], datasets: [] };
    const cumplido = proceso.cumplimientoPromedio;
    const pendiente = 100 - cumplido;
    return {
      labels: ['Cumplido', 'Pendiente'],
      datasets: [{
        data: [cumplido, pendiente],
        backgroundColor: [
          cumplido >= 70 ? '#22c55e' : cumplido >= 50 ? '#f59e0b' : '#ef4444',
          '#e5e7eb'
        ],
        borderWidth: 0
      }]
    };
  });

  // Gráfica de tendencia para drilldown (line)
  drilldownChartTendencia = computed(() => {
    const proceso = this.drilldownProceso();
    if (!proceso) return { labels: [], datasets: [] };
    // Generar datos de tendencia basados en el cumplimiento actual
    const base = proceso.cumplimientoPromedio;
    const variacion = proceso.tendencia === 'up' ? 5 : proceso.tendencia === 'down' ? -5 : 0;
    return {
      labels: ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [{
        label: 'Cumplimiento',
        data: [
          Math.max(0, base - 15 + variacion),
          Math.max(0, base - 10 + variacion),
          Math.max(0, base - 8),
          Math.max(0, base - 5),
          Math.max(0, base - 2),
          base
        ],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6'
      }]
    };
  });

  // Opciones de gráfica doughnut para drilldown
  drilldownChartOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  };

  // Opciones de gráfica line para drilldown
  drilldownLineOptions = {
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { min: 0, max: 100, grid: { color: '#f3f4f6' } }
    },
    maintainAspectRatio: false
  };

  // Limpiar filtros del dashboard
  limpiarFiltrosDashboard(): void {
    this.periodoFiltro.set('mes');
    this.severidadFiltro.set(null);
    this.estadoProcesoFiltro.set(null);
  }

  // Exportar dashboard a PDF
  exportarDashboardPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando...',
      detail: 'Generando PDF del dashboard ejecutivo'
    });
  }

  // Formatear fecha relativa
  formatFechaRelativa(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
}
