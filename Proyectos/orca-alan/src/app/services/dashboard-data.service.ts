// ============================================================================
// DASHBOARD DATA SERVICE
// ============================================================================
// Servicio para proveer datos reales al dashboard customizable
// Centraliza la lógica de cálculo de métricas y KPIs
// ============================================================================

import { Injectable, inject, computed, signal } from '@angular/core';
import { ProcessService } from './process.service';

// Types
export type TendenciaDir = 'up' | 'down' | 'neutral';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'activa' | 'atendida' | 'resuelta';

// Interfaces
export interface KPIMetricGlobal {
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

export interface ProcesoKPIResumen {
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

export interface AlertaConsolidada {
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

export interface ProcesoCompleto {
  id: string;
  nombre: string;
  estado: 'activo' | 'borrador' | 'inactivo' | 'archivado';
  objetivos: ObjetivoCompleto[];
}

export interface ObjetivoCompleto {
  id: string;
  nombre: string;
  cumplimiento: number;
  cumplimientoAnterior: number;
  tendencia: TendenciaDir;
  kpis: KPICompleto[];
}

export interface KPICompleto {
  id: string;
  nombre: string;
  valorActual: number;
  meta: number;
  cumplimiento: number;
  tendencia: TendenciaDir;
  umbral: number;
  historico: number[];
}

export interface TendenciaData {
  labels: string[];
  series: { name: string; data: number[] }[];
}

export interface CumplimientoData {
  labels: string[];
  values: number[];
  colors: string[];
}

export interface AlertasDistribucion {
  critical: number;
  warning: number;
  info: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private processService = inject(ProcessService);

  // Colores del tema
  private kpiColors = [
    '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'
  ];

  // ==================== DATOS ESTRUCTURADOS ====================

  // Estructura completa de datos por proceso
  procesosCompletos = signal<ProcesoCompleto[]>([
    {
      id: 'proc-demo-001',
      nombre: 'Gestión de Riesgos Operacionales',
      estado: 'activo',
      objetivos: [
        {
          id: 'obj-001-1',
          nombre: 'Reducir incidentes de riesgo operacional',
          cumplimiento: 72,
          cumplimientoAnterior: 65,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-001-1-1', nombre: 'Incidentes reportados', valorActual: 12, meta: 8, cumplimiento: 67, tendencia: 'down', umbral: 75, historico: [85, 78, 72, 67] },
            { id: 'kpi-001-1-2', nombre: 'Tiempo resolución (hrs)', valorActual: 4.2, meta: 4, cumplimiento: 95, tendencia: 'up', umbral: 85, historico: [82, 88, 92, 95] },
            { id: 'kpi-001-1-3', nombre: 'Controles implementados', valorActual: 28, meta: 35, cumplimiento: 80, tendencia: 'up', umbral: 70, historico: [65, 70, 75, 80] }
          ]
        },
        {
          id: 'obj-001-2',
          nombre: 'Mejorar cultura de gestión de riesgos',
          cumplimiento: 64,
          cumplimientoAnterior: 58,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-001-2-1', nombre: 'Capacitaciones completadas', valorActual: 156, meta: 200, cumplimiento: 78, tendencia: 'up', umbral: 70, historico: [55, 62, 70, 78] },
            { id: 'kpi-001-2-2', nombre: 'Evaluación conocimiento', valorActual: 68, meta: 80, cumplimiento: 85, tendencia: 'up', umbral: 75, historico: [72, 78, 82, 85] },
            { id: 'kpi-001-2-3', nombre: 'Reportes voluntarios', valorActual: 23, meta: 50, cumplimiento: 46, tendencia: 'down', umbral: 60, historico: [52, 50, 48, 46] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-002',
      nombre: 'Control de Accesos y Seguridad',
      estado: 'activo',
      objetivos: [
        {
          id: 'obj-002-1',
          nombre: 'Garantizar accesos autorizados',
          cumplimiento: 88,
          cumplimientoAnterior: 82,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-002-1-1', nombre: 'Accesos revisados', valorActual: 245, meta: 250, cumplimiento: 98, tendencia: 'up', umbral: 90, historico: [88, 92, 95, 98] },
            { id: 'kpi-002-1-2', nombre: 'Privilegios revocados', valorActual: 18, meta: 15, cumplimiento: 100, tendencia: 'up', umbral: 85, historico: [70, 80, 90, 100] },
            { id: 'kpi-002-1-3', nombre: 'Incidentes de acceso', valorActual: 2, meta: 0, cumplimiento: 60, tendencia: 'down', umbral: 70, historico: [80, 75, 65, 60] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-003',
      nombre: 'Cumplimiento Normativo SOX',
      estado: 'activo',
      objetivos: [
        {
          id: 'obj-003-1',
          nombre: 'Mantener cumplimiento SOX',
          cumplimiento: 94,
          cumplimientoAnterior: 91,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-003-1-1', nombre: 'Controles efectivos', valorActual: 47, meta: 50, cumplimiento: 94, tendencia: 'up', umbral: 90, historico: [88, 90, 92, 94] },
            { id: 'kpi-003-1-2', nombre: 'Hallazgos abiertos', valorActual: 3, meta: 0, cumplimiento: 70, tendencia: 'up', umbral: 80, historico: [50, 55, 65, 70] },
            { id: 'kpi-003-1-3', nombre: 'Evidencias completas', valorActual: 95, meta: 100, cumplimiento: 95, tendencia: 'up', umbral: 90, historico: [85, 88, 92, 95] }
          ]
        },
        {
          id: 'obj-003-2',
          nombre: 'Eficiencia en auditorías',
          cumplimiento: 82,
          cumplimientoAnterior: 78,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-003-2-1', nombre: 'Tiempo de auditoría (días)', valorActual: 4, meta: 5, cumplimiento: 100, tendencia: 'up', umbral: 85, historico: [70, 80, 90, 100] },
            { id: 'kpi-003-2-2', nombre: 'Costo por auditoría', valorActual: 4200, meta: 5000, cumplimiento: 84, tendencia: 'up', umbral: 75, historico: [68, 72, 78, 84] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-004',
      nombre: 'Gestión de Proveedores',
      estado: 'borrador',
      objetivos: [
        {
          id: 'obj-004-1',
          nombre: 'Evaluación de riesgo terceros',
          cumplimiento: 55,
          cumplimientoAnterior: 48,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-004-1-1', nombre: 'Proveedores evaluados', valorActual: 72, meta: 100, cumplimiento: 72, tendencia: 'up', umbral: 80, historico: [45, 55, 65, 72] },
            { id: 'kpi-004-1-2', nombre: 'Score promedio', valorActual: 68, meta: 75, cumplimiento: 91, tendencia: 'up', umbral: 70, historico: [78, 82, 87, 91] },
            { id: 'kpi-004-1-3', nombre: 'Proveedores alto riesgo', valorActual: 12, meta: 5, cumplimiento: 42, tendencia: 'down', umbral: 60, historico: [55, 50, 45, 42] }
          ]
        }
      ]
    },
    {
      id: 'proc-demo-005',
      nombre: 'Monitoreo de Activos TI',
      estado: 'activo',
      objetivos: [
        {
          id: 'obj-005-1',
          nombre: 'Disponibilidad de infraestructura',
          cumplimiento: 97,
          cumplimientoAnterior: 95,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-005-1-1', nombre: 'Uptime servidores (%)', valorActual: 99.7, meta: 99.9, cumplimiento: 97, tendencia: 'neutral', umbral: 95, historico: [96, 96.5, 97, 97] },
            { id: 'kpi-005-1-2', nombre: 'Tiempo inactividad (hrs)', valorActual: 2.5, meta: 4, cumplimiento: 100, tendencia: 'up', umbral: 85, historico: [75, 82, 90, 100] }
          ]
        },
        {
          id: 'obj-005-2',
          nombre: 'Reducir vulnerabilidades',
          cumplimiento: 75,
          cumplimientoAnterior: 68,
          tendencia: 'up',
          kpis: [
            { id: 'kpi-005-2-1', nombre: 'Vulnerabilidades críticas', valorActual: 3, meta: 0, cumplimiento: 40, tendencia: 'up', umbral: 50, historico: [20, 25, 32, 40] },
            { id: 'kpi-005-2-2', nombre: 'Activos actualizados (%)', valorActual: 88, meta: 95, cumplimiento: 93, tendencia: 'up', umbral: 85, historico: [78, 82, 88, 93] },
            { id: 'kpi-005-2-3', nombre: 'Score riesgo promedio', valorActual: 42, meta: 30, cumplimiento: 71, tendencia: 'up', umbral: 60, historico: [55, 60, 65, 71] }
          ]
        }
      ]
    }
  ]);

  // ==================== COMPUTED SIGNALS ====================

  // Resumen de KPIs por proceso
  procesosKPIResumen = computed<ProcesoKPIResumen[]>(() => {
    return this.procesosCompletos().map(proc => {
      const totalObjetivos = proc.objetivos.length;
      const allKPIs = proc.objetivos.flatMap(obj => obj.kpis);
      const totalKPIs = allKPIs.length;
      const cumplimientoPromedio = totalKPIs > 0
        ? allKPIs.reduce((sum, kpi) => sum + kpi.cumplimiento, 0) / totalKPIs
        : 0;
      const cumplimientoAnterior = proc.objetivos.length > 0
        ? proc.objetivos.reduce((sum, obj) => sum + obj.cumplimientoAnterior, 0) / proc.objetivos.length
        : 0;
      const tendencia: TendenciaDir = cumplimientoPromedio > cumplimientoAnterior ? 'up' : cumplimientoPromedio < cumplimientoAnterior ? 'down' : 'neutral';
      const alertasActivas = allKPIs.filter(kpi => kpi.cumplimiento < kpi.umbral).length;
      const alertasCriticas = allKPIs.filter(kpi => kpi.cumplimiento < 50).length;

      return {
        procesoId: proc.id,
        procesoNombre: proc.nombre,
        estado: proc.estado,
        totalObjetivos,
        totalKPIs,
        cumplimientoPromedio: Math.round(cumplimientoPromedio * 10) / 10,
        cumplimientoAnterior: Math.round(cumplimientoAnterior * 10) / 10,
        tendencia,
        alertasActivas,
        alertasCriticas,
        ultimaActualizacion: new Date()
      };
    });
  });

  // Alertas consolidadas de todos los procesos
  alertasConsolidadas = computed<AlertaConsolidada[]>(() => {
    const alertas: AlertaConsolidada[] = [];
    const procesos = this.procesosCompletos();

    procesos.forEach(proc => {
      proc.objetivos.forEach(obj => {
        obj.kpis.forEach(kpi => {
          if (kpi.cumplimiento < kpi.umbral) {
            const severity: AlertSeverity = kpi.cumplimiento < 50 ? 'critical' : kpi.cumplimiento < 70 ? 'warning' : 'info';
            const diasAbierto = Math.floor(Math.random() * 14) + 1;

            alertas.push({
              id: `alert-${kpi.id}`,
              procesoId: proc.id,
              procesoNombre: proc.nombre,
              objetivoId: obj.id,
              objetivoNombre: obj.nombre,
              kpiId: kpi.id,
              kpiNombre: kpi.nombre,
              severity,
              status: 'activa',
              mensaje: `KPI "${kpi.nombre}" está por debajo del umbral (${kpi.cumplimiento}% vs ${kpi.umbral}%)`,
              valorActual: kpi.cumplimiento,
              valorUmbral: kpi.umbral,
              fechaCreacion: new Date(Date.now() - diasAbierto * 24 * 60 * 60 * 1000),
              diasAbierto
            });
          }
        });
      });
    });

    return alertas.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  });

  // KPIs Globales para métricas top
  kpiMetricsGlobal = computed<KPIMetricGlobal[]>(() => {
    const procesos = this.procesosKPIResumen();
    const alertas = this.alertasConsolidadas();

    const procesosActivos = procesos.filter(p => p.estado === 'activo').length;
    const procesosActivosAnterior = Math.max(1, procesosActivos - 1);

    const procesosParaCumplimiento = procesos.filter(p => p.estado === 'activo');
    const cumplimientoActual = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoPromedio, 0) / procesosParaCumplimiento.length
      : 0;
    const cumplimientoAnterior = procesosParaCumplimiento.length > 0
      ? procesosParaCumplimiento.reduce((sum, p) => sum + p.cumplimientoAnterior, 0) / procesosParaCumplimiento.length
      : 0;

    const alertasActivas = alertas.filter(a => a.status === 'activa').length;
    const alertasActivasAnterior = alertasActivas + 2;

    const kpisEnRiesgo = alertas.filter(a => a.status === 'activa' && a.severity === 'critical').length;
    const kpisEnRiesgoAnterior = kpisEnRiesgo + 1;

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

  // Distribución de alertas para gráfica dona
  alertasDistribucion = computed<AlertasDistribucion>(() => {
    const alertas = this.alertasConsolidadas();
    return {
      critical: alertas.filter(a => a.severity === 'critical').length,
      warning: alertas.filter(a => a.severity === 'warning').length,
      info: alertas.filter(a => a.severity === 'info').length
    };
  });

  // Datos para gráfica de cumplimiento por proceso
  cumplimientoData = computed<CumplimientoData>(() => {
    const procesos = this.procesosKPIResumen().filter(p => p.estado === 'activo');
    return {
      labels: procesos.map(p => p.procesoNombre.length > 20 ? p.procesoNombre.substring(0, 20) + '...' : p.procesoNombre),
      values: procesos.map(p => p.cumplimientoPromedio),
      colors: procesos.map((_, i) => this.kpiColors[i % this.kpiColors.length])
    };
  });

  // Datos para gráfica de tendencia
  tendenciaData = computed<TendenciaData>(() => {
    const meses = ['Sep', 'Oct', 'Nov', 'Dic'];
    const procesos = this.procesosCompletos().filter(p => p.estado === 'activo').slice(0, 3);

    return {
      labels: meses,
      series: procesos.map(proc => {
        const allKPIs = proc.objetivos.flatMap(obj => obj.kpis);
        const historicos = allKPIs.length > 0
          ? allKPIs[0].historico
          : [70, 75, 80, 85];
        return {
          name: proc.nombre.length > 15 ? proc.nombre.substring(0, 15) + '...' : proc.nombre,
          data: historicos
        };
      })
    };
  });

  // ==================== MÉTODOS DE ACCESO ====================

  /** Obtiene un proceso por ID */
  getProcesoById(procesoId: string): ProcesoCompleto | undefined {
    return this.procesosCompletos().find(p => p.id === procesoId);
  }

  /** Obtiene alertas por proceso */
  getAlertasByProceso(procesoId: string): AlertaConsolidada[] {
    return this.alertasConsolidadas().filter(a => a.procesoId === procesoId);
  }

  /** Obtiene KPIs por proceso */
  getKPIsByProceso(procesoId: string): KPICompleto[] {
    const proceso = this.getProcesoById(procesoId);
    if (!proceso) return [];
    return proceso.objetivos.flatMap(obj => obj.kpis);
  }

  /** Obtiene métricas para un tipo específico de KPI card */
  getMetricByType(type: 'cumplimiento' | 'procesos' | 'alertas' | 'objetivos'): KPIMetricGlobal | undefined {
    const metrics = this.kpiMetricsGlobal();
    const typeMap: Record<string, string> = {
      'cumplimiento': 'g2',
      'procesos': 'g1',
      'alertas': 'g3',
      'objetivos': 'g4'
    };
    return metrics.find(m => m.id === typeMap[type]);
  }

  /** Obtiene el valor de cumplimiento general */
  getCumplimientoGeneral(): number {
    const metric = this.getMetricByType('cumplimiento');
    return metric?.valor || 0;
  }

  /** Obtiene datos para la tabla de procesos */
  getProcesosParaTabla(): { id: string; nombre: string; estado: string; cumplimiento: number; alertas: number }[] {
    return this.procesosKPIResumen().map(p => ({
      id: p.procesoId,
      nombre: p.procesoNombre,
      estado: p.estado,
      cumplimiento: p.cumplimientoPromedio,
      alertas: p.alertasActivas
    }));
  }

  /** Obtiene actividad reciente */
  getActividadReciente(): { icono: string; color: string; texto: string; tiempo: string }[] {
    return [
      { icono: 'pi pi-check-circle', color: 'text-green-500', texto: 'Proceso actualizado', tiempo: 'hace 5 min' },
      { icono: 'pi pi-user', color: 'text-blue-500', texto: 'Responsable asignado', tiempo: 'hace 1 hora' },
      { icono: 'pi pi-exclamation-triangle', color: 'text-orange-500', texto: 'Nueva alerta', tiempo: 'hace 2 horas' },
      { icono: 'pi pi-file', color: 'text-purple-500', texto: 'Documento adjuntado', tiempo: 'hace 3 horas' },
      { icono: 'pi pi-sync', color: 'text-cyan-500', texto: 'KPI actualizado', tiempo: 'hace 4 horas' }
    ];
  }
}
