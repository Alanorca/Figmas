import { Injectable } from '@angular/core';
import {
  SerieLinea,
  PuntoLinea,
  DatosBarras,
  CategoriaBar,
  DatosPie,
  SegmentoPie,
  ChartPeriodo,
  MetricaDisponible,
  RangoFechas,
  DrillDownData,
  DesgloseCumplimiento,
  ProcesoKPIResumen,
  AlertaConsolidada
} from '../components/amcharts/amcharts.models';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  private readonly COLORES = {
    procesos: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
    semaforo: {
      excelente: '#10b981',
      bueno: '#3b82f6',
      regular: '#f59e0b',
      bajo: '#ef4444'
    },
    alertas: {
      critical: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  };

  // ==================== TENDENCIA (LINE CHART) ====================

  transformarATendencia(
    procesos: ProcesoKPIResumen[],
    periodo: ChartPeriodo,
    metrica: MetricaDisponible,
    rangoCustom?: RangoFechas
  ): SerieLinea[] {
    const fechas = this.generarFechasPorPeriodo(periodo, rangoCustom);

    return procesos
      .filter(p => p.estado === 'activo')
      .slice(0, 4)
      .map((proceso, index) => ({
        id: proceso.procesoId,
        nombre: this.truncarNombre(proceso.procesoNombre, 20),
        color: this.COLORES.procesos[index % this.COLORES.procesos.length],
        datos: this.generarDatosTendencia(proceso, fechas, metrica)
      }));
  }

  private generarFechasPorPeriodo(periodo: ChartPeriodo, rangoCustom?: RangoFechas): Date[] {
    const fechas: Date[] = [];
    const hoy = new Date();
    let puntos: number;
    let intervalo: 'day' | 'week' | 'month';

    switch (periodo) {
      case 'semana':
        puntos = 7;
        intervalo = 'day';
        break;
      case 'mes':
        puntos = 4;
        intervalo = 'week';
        break;
      case 'trimestre':
        puntos = 12;
        intervalo = 'week';
        break;
      case 'anio':
        puntos = 12;
        intervalo = 'month';
        break;
      case 'custom':
        if (rangoCustom) {
          return this.generarFechasEnRango(rangoCustom.desde, rangoCustom.hasta);
        }
        puntos = 6;
        intervalo = 'month';
        break;
      default:
        puntos = 6;
        intervalo = 'month';
    }

    for (let i = puntos - 1; i >= 0; i--) {
      const fecha = new Date(hoy);
      switch (intervalo) {
        case 'day':
          fecha.setDate(fecha.getDate() - i);
          break;
        case 'week':
          fecha.setDate(fecha.getDate() - (i * 7));
          break;
        case 'month':
          fecha.setMonth(fecha.getMonth() - i);
          break;
      }
      fechas.push(fecha);
    }

    return fechas;
  }

  private generarFechasEnRango(desde: Date, hasta: Date): Date[] {
    const fechas: Date[] = [];
    const diff = hasta.getTime() - desde.getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const puntos = Math.min(Math.max(dias, 7), 30);

    for (let i = 0; i < puntos; i++) {
      const fecha = new Date(desde);
      fecha.setDate(fecha.getDate() + Math.floor((i / (puntos - 1)) * dias));
      fechas.push(fecha);
    }

    return fechas;
  }

  private generarDatosTendencia(
    proceso: ProcesoKPIResumen,
    fechas: Date[],
    metrica: MetricaDisponible
  ): PuntoLinea[] {
    const valorFinal = this.obtenerValorMetrica(proceso, metrica);
    const valorAnterior = this.obtenerValorAnteriorMetrica(proceso, metrica);

    return fechas.map((fecha, index) => {
      const progreso = index / (fechas.length - 1);
      const variacion = (Math.random() - 0.5) * 10;
      const valor = valorAnterior + (valorFinal - valorAnterior) * progreso + variacion;

      return {
        fecha,
        valor: Math.max(0, Math.min(100, Math.round(valor))),
        label: this.formatearFecha(fecha)
      };
    });
  }

  private obtenerValorMetrica(proceso: ProcesoKPIResumen, metrica: MetricaDisponible): number {
    switch (metrica) {
      case 'cumplimiento': return proceso.cumplimientoPromedio;
      case 'alertas': return proceso.alertasActivas;
      case 'kpisActivos': return proceso.totalKPIs;
      case 'objetivosCumplidos': return proceso.totalObjetivos;
      default: return proceso.cumplimientoPromedio;
    }
  }

  private obtenerValorAnteriorMetrica(proceso: ProcesoKPIResumen, metrica: MetricaDisponible): number {
    switch (metrica) {
      case 'cumplimiento': return proceso.cumplimientoAnterior;
      case 'alertas': return proceso.alertasActivas + 2;
      case 'kpisActivos': return proceso.totalKPIs;
      case 'objetivosCumplidos': return Math.max(0, proceso.totalObjetivos - 1);
      default: return proceso.cumplimientoAnterior;
    }
  }

  // ==================== CUMPLIMIENTO (BAR CHART) ====================

  transformarACumplimientoBarras(procesos: ProcesoKPIResumen[]): DatosBarras {
    const categorias: CategoriaBar[] = procesos
      .filter(p => p.estado === 'activo')
      .map(proceso => ({
        id: proceso.procesoId,
        nombre: this.truncarNombre(proceso.procesoNombre, 25),
        valor: proceso.cumplimientoPromedio,
        color: this.obtenerColorCumplimiento(proceso.cumplimientoPromedio),
        metadata: {
          totalKPIs: proceso.totalKPIs,
          totalObjetivos: proceso.totalObjetivos,
          alertasActivas: proceso.alertasActivas,
          alertasCriticas: proceso.alertasCriticas,
          tendencia: proceso.tendencia
        }
      }));

    return { categorias };
  }

  private obtenerColorCumplimiento(valor: number): string {
    if (valor >= 80) return this.COLORES.semaforo.excelente;
    if (valor >= 60) return this.COLORES.semaforo.regular;
    return this.COLORES.semaforo.bajo;
  }

  // ==================== ALERTAS (PIE/DONUT CHART) ====================

  transformarAAlertasPie(alertas: AlertaConsolidada[]): DatosPie {
    const alertasActivas = alertas.filter(a => a.status === 'activa');

    const critical = alertasActivas.filter(a => a.severity === 'critical').length;
    const warning = alertasActivas.filter(a => a.severity === 'warning').length;
    const info = alertasActivas.filter(a => a.severity === 'info').length;
    const total = critical + warning + info;

    return {
      segmentos: [
        {
          id: 'critical',
          nombre: 'Critico',
          valor: critical,
          color: this.COLORES.alertas.critical,
          porcentaje: total > 0 ? Math.round((critical / total) * 100) : 0
        },
        {
          id: 'warning',
          nombre: 'Advertencia',
          valor: warning,
          color: this.COLORES.alertas.warning,
          porcentaje: total > 0 ? Math.round((warning / total) * 100) : 0
        },
        {
          id: 'info',
          nombre: 'Info',
          valor: info,
          color: this.COLORES.alertas.info,
          porcentaje: total > 0 ? Math.round((info / total) * 100) : 0
        }
      ].filter(s => s.valor > 0)
    };
  }

  // ==================== DRILL-DOWN DATA ====================

  generarDrillDownData(
    procesoId: string,
    procesos: ProcesoKPIResumen[],
    alertas: AlertaConsolidada[]
  ): DrillDownData {
    const proceso = procesos.find(p => p.procesoId === procesoId);
    if (!proceso) {
      return { procesoId, procesoNombre: 'Desconocido', cumplimientoGeneral: 0, desglose: [] };
    }

    const alertasProceso = alertas.filter(a => a.procesoId === procesoId);
    const desglose: DesgloseCumplimiento[] = this.generarMockDesglose(proceso, alertasProceso);

    return {
      procesoId: proceso.procesoId,
      procesoNombre: proceso.procesoNombre,
      cumplimientoGeneral: proceso.cumplimientoPromedio,
      desglose
    };
  }

  private generarMockDesglose(
    proceso: ProcesoKPIResumen,
    alertas: AlertaConsolidada[]
  ): DesgloseCumplimiento[] {
    const alertasPorObjetivo = new Map<string, AlertaConsolidada[]>();
    alertas.forEach(a => {
      const current = alertasPorObjetivo.get(a.objetivoId) || [];
      alertasPorObjetivo.set(a.objetivoId, [...current, a]);
    });

    return Array.from({ length: proceso.totalObjetivos }, (_, i) => {
      const objetivoId = `obj-${i + 1}`;
      const alertasObjetivo = alertasPorObjetivo.get(objetivoId) ||
                              alertas.filter(a => a.objetivoId === (i + 1).toString());

      return {
        objetivoId,
        objetivoNombre: alertasObjetivo[0]?.objetivoNombre || `Objetivo ${i + 1}`,
        cumplimientoPromedio: Math.round(proceso.cumplimientoPromedio + (Math.random() - 0.5) * 20),
        kpis: this.generarMockKPIs(alertasObjetivo)
      };
    });
  }

  private generarMockKPIs(alertas: AlertaConsolidada[]): DesgloseCumplimiento['kpis'] {
    const kpisFromAlertas = alertas.map(a => ({
      id: a.kpiId,
      nombre: a.kpiNombre,
      valorActual: a.valorActual,
      valorMeta: a.valorUmbral,
      cumplimiento: Math.round((a.valorActual / a.valorUmbral) * 100),
      tendencia: 'down' as const,
      alertaActiva: a.status === 'activa',
      severidadAlerta: a.severity
    }));

    const kpisSinAlerta = Array.from({ length: 2 }, (_, i) => ({
      id: `kpi-ok-${i}`,
      nombre: `KPI ${kpisFromAlertas.length + i + 1}`,
      valorActual: 85 + Math.random() * 15,
      valorMeta: 80,
      cumplimiento: 100,
      tendencia: 'up' as const,
      alertaActiva: false
    }));

    return [...kpisFromAlertas, ...kpisSinAlerta];
  }

  // ==================== HELPERS ====================

  private truncarNombre(nombre: string, maxLength: number): string {
    if (nombre.length <= maxLength) return nombre;
    return nombre.substring(0, maxLength - 3) + '...';
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }

  getSubtituloPeriodo(periodo: ChartPeriodo, rangoCustom?: RangoFechas): string {
    switch (periodo) {
      case 'semana': return 'Ultimos 7 dias';
      case 'mes': return 'Ultimas 4 semanas';
      case 'trimestre': return 'Ultimos 3 meses';
      case 'anio': return 'Ultimos 12 meses';
      case 'custom':
        if (rangoCustom) {
          return `${this.formatearFecha(rangoCustom.desde)} - ${this.formatearFecha(rangoCustom.hasta)}`;
        }
        return 'Rango personalizado';
      default: return '';
    }
  }
}
