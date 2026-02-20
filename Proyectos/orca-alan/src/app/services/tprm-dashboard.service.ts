import { Injectable, inject, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import { TenantService } from './tenant.service';
import { TRAFFIC_LIGHT_COLORS } from '../core/constants/design-system.constants';

export interface TprmKpi {
  label: string;
  value: number;
  unit: string;
  semaforo: 'green' | 'yellow' | 'red';
  semaforoColor: string;
  trend: number;
  trendDirection: 'up' | 'down' | 'stable';
}

@Injectable({ providedIn: 'root' })
export class TprmDashboardService {
  private api = inject(ApiService);
  private tenantService = inject(TenantService);

  // Raw data signals
  private _quarterlyMetrics = signal<any[]>([]);
  private _serviceImpacts = signal<any[]>([]);
  private _businessObjectives = signal<any[]>([]);
  private _remediationActions = signal<any[]>([]);
  private _controls = signal<any[]>([]);
  private _riesgos = signal<any[]>([]);
  private _loading = signal(true);

  readonly loading = this._loading.asReadonly();
  readonly quarterlyMetrics = this._quarterlyMetrics.asReadonly();
  readonly serviceImpacts = this._serviceImpacts.asReadonly();
  readonly businessObjectives = this._businessObjectives.asReadonly();
  readonly remediationActions = this._remediationActions.asReadonly();
  readonly controls = this._controls.asReadonly();

  // Computed: KPI semáforos
  readonly semaforos = computed<TprmKpi[]>(() => {
    const metrics = this._quarterlyMetrics();
    const q1 = metrics.filter(m => m.quarter === 'Q1-2026');
    const q4 = metrics.filter(m => m.quarter === 'Q4-2025');

    if (q1.length === 0 && q4.length === 0) return [];

    const avgRiskQ1 = q1.length > 0 ? q1.reduce((s, m) => s + m.avgRiskScore, 0) / q1.length : 0;
    const avgRiskQ4 = q4.length > 0 ? q4.reduce((s, m) => s + m.avgRiskScore, 0) / q4.length : 0;
    const riskTrend = avgRiskQ4 > 0 ? ((avgRiskQ1 - avgRiskQ4) / avgRiskQ4) * 100 : 0;

    const totalIncQ1 = q1.reduce((s, m) => s + m.incidents, 0);
    const totalIncQ4 = q4.reduce((s, m) => s + m.incidents, 0);
    const incTrend = totalIncQ4 > 0 ? ((totalIncQ1 - totalIncQ4) / totalIncQ4) * 100 : 0;

    const avgSlaQ1 = q1.length > 0 ? q1.reduce((s, m) => s + m.slaCompliance, 0) / q1.length : 0;
    const avgSlaQ4 = q4.length > 0 ? q4.reduce((s, m) => s + m.slaCompliance, 0) / q4.length : 0;
    const slaTrend = avgSlaQ4 > 0 ? ((avgSlaQ1 - avgSlaQ4) / avgSlaQ4) * 100 : 0;

    const providersAtRiskQ1 = q1.filter(m => m.incidents > 2).length;
    const providersAtRiskQ4 = q4.filter(m => m.incidents > 2).length;
    const riskProvTrend = providersAtRiskQ4 > 0 ? ((providersAtRiskQ1 - providersAtRiskQ4) / providersAtRiskQ4) * 100 : 0;

    return [
      {
        label: 'Score Riesgo Promedio',
        value: Math.round(avgRiskQ1),
        unit: '/100',
        semaforo: avgRiskQ1 > 70 ? 'red' : avgRiskQ1 > 50 ? 'yellow' : 'green',
        semaforoColor: avgRiskQ1 > 70 ? TRAFFIC_LIGHT_COLORS.red : avgRiskQ1 > 50 ? TRAFFIC_LIGHT_COLORS.yellow : TRAFFIC_LIGHT_COLORS.green,
        trend: Math.round(riskTrend),
        trendDirection: riskTrend > 0 ? 'up' : riskTrend < 0 ? 'down' : 'stable'
      },
      {
        label: 'Incidentes Abiertos',
        value: totalIncQ1,
        unit: '',
        semaforo: totalIncQ1 > 8 ? 'red' : totalIncQ1 > 4 ? 'yellow' : 'green',
        semaforoColor: totalIncQ1 > 8 ? TRAFFIC_LIGHT_COLORS.red : totalIncQ1 > 4 ? TRAFFIC_LIGHT_COLORS.yellow : TRAFFIC_LIGHT_COLORS.green,
        trend: Math.round(incTrend),
        trendDirection: incTrend > 0 ? 'up' : incTrend < 0 ? 'down' : 'stable'
      },
      {
        label: 'SLA Cumplimiento',
        value: Math.round(avgSlaQ1),
        unit: '%',
        semaforo: avgSlaQ1 < 80 ? 'red' : avgSlaQ1 < 90 ? 'yellow' : 'green',
        semaforoColor: avgSlaQ1 < 80 ? TRAFFIC_LIGHT_COLORS.red : avgSlaQ1 < 90 ? TRAFFIC_LIGHT_COLORS.yellow : TRAFFIC_LIGHT_COLORS.green,
        trend: Math.round(slaTrend),
        trendDirection: slaTrend > 0 ? 'up' : slaTrend < 0 ? 'down' : 'stable'
      },
      {
        label: 'Proveedores en Riesgo',
        value: providersAtRiskQ1,
        unit: '',
        semaforo: providersAtRiskQ1 > 2 ? 'red' : providersAtRiskQ1 > 1 ? 'yellow' : 'green',
        semaforoColor: providersAtRiskQ1 > 2 ? TRAFFIC_LIGHT_COLORS.red : providersAtRiskQ1 > 1 ? TRAFFIC_LIGHT_COLORS.yellow : TRAFFIC_LIGHT_COLORS.green,
        trend: Math.round(riskProvTrend),
        trendDirection: riskProvTrend > 0 ? 'up' : riskProvTrend < 0 ? 'down' : 'stable'
      }
    ];
  });

  // Computed: Proveedores con severidad (para barras horizontales)
  readonly proveedoresSeveridad = computed(() => {
    const metrics = this._quarterlyMetrics();
    const q1 = metrics.filter(m => m.quarter === 'Q1-2026');
    const q4 = metrics.filter(m => m.quarter === 'Q4-2025');

    // Use Q1 if available, fallback to Q4
    const current = q1.length > 0 ? q1 : q4;

    return current.map(m => ({
      providerId: m.providerId,
      providerName: m.providerName,
      incidents: m.incidents,
      defects: m.defects,
      semaforo: m.incidents > 2 ? 'red' : m.incidents > 1 ? 'yellow' : 'green',
      semaforoColor: m.incidents > 2 ? TRAFFIC_LIGHT_COLORS.red : m.incidents > 1 ? TRAFFIC_LIGHT_COLORS.yellow : TRAFFIC_LIGHT_COLORS.green,
    })).sort((a, b) => b.incidents - a.incidents);
  });

  // Computed: Comparativo trimestral
  readonly comparativoTrimestral = computed(() => {
    const metrics = this._quarterlyMetrics();
    const providers = [...new Set(metrics.map(m => m.providerName))];

    return providers.map(name => {
      const q4 = metrics.find(m => m.providerName === name && m.quarter === 'Q4-2025');
      const q1 = metrics.find(m => m.providerName === name && m.quarter === 'Q1-2026');
      return {
        providerName: name,
        q4: q4 || null,
        q1: q1 || null,
        trend: q4 && q1 ? {
          incidents: q1.incidents - q4.incidents,
          riskScore: q1.avgRiskScore - q4.avgRiskScore,
          sla: q1.slaCompliance - q4.slaCompliance
        } : null
      };
    });
  });

  // Computed: Impacto en servicios
  readonly impactoServicios = computed(() => this._serviceImpacts());

  // Computed: Objetivos de negocio
  readonly objetivosNegocio = computed(() => this._businessObjectives());

  // Computed: Acciones derivadas
  readonly accionesDerivadas = computed(() => this._remediationActions());

  // Computed: Controles y reducción de riesgo
  readonly controlesReduccion = computed(() => {
    const controls = this._controls();
    // Group by provider
    const grouped = new Map<string, any[]>();
    controls.forEach(c => {
      if (!grouped.has(c.providerName)) grouped.set(c.providerName, []);
      grouped.get(c.providerName)!.push(c);
    });
    return Array.from(grouped.entries()).map(([name, ctrls]) => ({
      providerName: name,
      controls: ctrls,
      avgInherent: Math.round(ctrls.reduce((s, c) => s + c.inherentRisk, 0) / ctrls.length * 10) / 10,
      avgResidual: Math.round(ctrls.reduce((s, c) => s + c.residualRisk, 0) / ctrls.length * 10) / 10,
      avgEffectiveness: Math.round(ctrls.reduce((s, c) => s + c.effectiveness, 0) / ctrls.length),
    }));
  });

  // Computed: Risk map points
  readonly riskMapPoints = computed(() => {
    const riesgos = this._riesgos();
    return riesgos.map(r => ({
      id: r.id,
      name: r.descripcion?.substring(0, 60) + '...' || r.id,
      probability: r.probabilidad,
      impact: r.impacto,
    }));
  });

  loadData(): void {
    this._loading.set(true);

    this.api.getTprmQuarterlyMetrics().subscribe(data => {
      this._quarterlyMetrics.set(data);
      this.checkLoaded();
    });

    this.api.getTprmServiceImpacts().subscribe(data => {
      this._serviceImpacts.set(data);
      this.checkLoaded();
    });

    this.api.getTprmBusinessObjectives().subscribe(data => {
      this._businessObjectives.set(data);
      this.checkLoaded();
    });

    this.api.getTprmRemediationActions().subscribe(data => {
      this._remediationActions.set(data);
      this.checkLoaded();
    });

    this.api.getTprmControls().subscribe(data => {
      this._controls.set(data);
      this.checkLoaded();
    });

    this.api.getRiesgos().subscribe(data => {
      this._riesgos.set(data);
      this.checkLoaded();
    });
  }

  private loadedCount = 0;
  private checkLoaded(): void {
    this.loadedCount++;
    if (this.loadedCount >= 6) {
      this._loading.set(false);
      this.loadedCount = 0;
    }
  }
}
