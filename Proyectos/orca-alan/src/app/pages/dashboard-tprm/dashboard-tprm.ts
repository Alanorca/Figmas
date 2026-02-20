import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTooltip,
  ApexLegend,
  ApexGrid,
} from 'ng-apexcharts';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TprmDashboardService } from '../../services/tprm-dashboard.service';
import { ExportService } from '../../services/export.service';
import { TRAFFIC_LIGHT_COLORS, CHART_PALETTE } from '../../core/constants/design-system.constants';

@Component({
  selector: 'app-dashboard-tprm',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    TagModule,
    TableModule,
    TooltipModule,
    ProgressBarModule,
    ButtonModule,
    DividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <!-- Toolbar (mismo patrón que dashboard-customizable) -->
      <div class="dashboard-toolbar">
        <div class="toolbar-left">
          <h2 class="dashboard-title">
            <i class="pi pi-shield"></i>
            Dashboard TPRM Ejecutivo
          </h2>
          <span class="toolbar-subtitle">Especializado</span>
        </div>
        <div class="toolbar-right">
          <p-button
            icon="pi pi-arrow-left"
            label="Mis Dashboards"
            [outlined]="true"
            size="small"
            (onClick)="volverAlDashboard()"
            pTooltip="Volver al dashboard principal">
          </p-button>

          <p-button
            icon="pi pi-download"
            label="Exportar"
            [outlined]="true"
            size="small"
            [loading]="exportingPdf()"
            (onClick)="exportarDashboard()"
            pTooltip="Exportar dashboard como PDF">
          </p-button>
        </div>
      </div>

      <div class="dashboard-tprm">
        <!-- Page Header -->
        <div class="tprm-header">
          <div class="tprm-header-left">
            <h1 class="tprm-title">
              <i class="pi pi-shield"></i>
              Dashboard TPRM Ejecutivo
            </h1>
            <span class="tprm-subtitle">Third Party Risk Management - Proveedores de Embozado</span>
          </div>
          <div class="tprm-header-right">
            <span class="tprm-period">Q1-2026 vs Q4-2025</span>
          </div>
        </div>

        @if (tprmService.loading()) {
          <div class="loading-container">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
            <span>Cargando datos TPRM...</span>
          </div>
        } @else {

        <!-- SECTION 1: KPI Semáforos -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-gauge"></i>
            Indicadores Generales
          </h2>
          <div class="kpi-grid">
            @for (kpi of tprmService.semaforos(); track kpi.label) {
              <div class="kpi-card" [style.border-left-color]="kpi.semaforoColor">
                <div class="kpi-semaforo" [style.background]="kpi.semaforoColor"></div>
                <div class="kpi-content">
                  <span class="kpi-label">{{ kpi.label }}</span>
                  <div class="kpi-value-row">
                    <span class="kpi-value">{{ kpi.value }}</span>
                    <span class="kpi-unit">{{ kpi.unit }}</span>
                  </div>
                  <div class="kpi-trend" [class.trend-up]="kpi.trendDirection === 'up'" [class.trend-down]="kpi.trendDirection === 'down'">
                    @if (kpi.trendDirection === 'up') {
                      <i class="pi pi-arrow-up"></i>
                    } @else if (kpi.trendDirection === 'down') {
                      <i class="pi pi-arrow-down"></i>
                    } @else {
                      <i class="pi pi-minus"></i>
                    }
                    <span>{{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}% vs Q4</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- SECTION 2: Proveedores con Problemas - Barras de Severidad -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-chart-bar"></i>
            Proveedores por Severidad de Incidentes
          </h2>
          <p class="section-hint">Umbrales: >1 incidente = amarillo, >2 = rojo</p>
          <div class="chart-container">
            <apx-chart
              [series]="severityChartSeries()"
              [chart]="severityChartOptions"
              [xaxis]="severityXAxis()"
              [yaxis]="severityYAxis"
              [plotOptions]="severityPlotOptions"
              [dataLabels]="severityDataLabels"
              [tooltip]="chartTooltip"
              [grid]="chartGrid"
              [colors]="severityColors()"
            ></apx-chart>
          </div>
        </section>

        <!-- SECTION 3: Comparativo Trimestral -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-chart-line"></i>
            Comparativo Trimestral Q4-2025 vs Q1-2026
          </h2>
          <div class="chart-container">
            <apx-chart
              [series]="quarterlyChartSeries()"
              [chart]="quarterlyChartOptions"
              [xaxis]="quarterlyXAxis()"
              [yaxis]="quarterlyYAxis"
              [plotOptions]="quarterlyPlotOptions"
              [dataLabels]="quarterlyDataLabels"
              [legend]="chartLegend"
              [tooltip]="chartTooltip"
              [grid]="chartGrid"
            ></apx-chart>
          </div>
        </section>

        <!-- SECTION 4: Impacto en Servicios Internos -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-sitemap"></i>
            Impacto en Servicios Internos
          </h2>
          <p-table [value]="tprmService.impactoServicios()" [tableStyle]="{ 'min-width': '60rem' }" styleClass="p-datatable-sm p-datatable-striped">
            <ng-template #header>
              <tr>
                <th>Proveedor</th>
                <th>Servicio Contratado</th>
                <th>Servicios Internos Afectados</th>
              </tr>
            </ng-template>
            <ng-template #body let-item>
              <tr>
                <td class="font-semibold">{{ item.providerName }}</td>
                <td>{{ item.contractedService }}</td>
                <td>
                  <div class="services-list">
                    @for (svc of item.internalServices; track svc.name) {
                      <div class="service-item">
                        <p-tag
                          [value]="svc.criticality"
                          [severity]="getCriticalitySeverity(svc.criticality)"
                          class="service-tag"
                        />
                        <span>{{ svc.name }}</span>
                        <span class="service-area">({{ svc.businessArea }})</span>
                      </div>
                    }
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </section>

        <!-- SECTION 5: Vinculación con Objetivos de Negocio -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-bullseye"></i>
            Vinculación con Objetivos de Negocio
          </h2>
          <div class="objectives-grid">
            @for (obj of tprmService.objetivosNegocio(); track obj.id) {
              <div class="objective-card" [class.risk-alto]="obj.riskLevel === 'alto'" [class.risk-critico]="obj.riskLevel === 'critico'">
                <div class="objective-header">
                  <span class="objective-name">{{ obj.name }}</span>
                  <p-tag [value]="obj.riskLevel" [severity]="getRiskTagSeverity(obj.riskLevel)" />
                </div>
                <p class="objective-desc">{{ obj.description }}</p>
                <div class="objective-progress">
                  <div class="progress-label">
                    <span>Avance</span>
                    <span class="progress-value">{{ obj.currentValue }}{{ obj.unit }} / {{ obj.targetValue }}{{ obj.unit }}</span>
                  </div>
                  <p-progressBar [value]="(obj.currentValue / obj.targetValue) * 100" [showValue]="false" [style]="{ height: '8px' }" />
                </div>
                <p class="objective-risk-desc">
                  <i class="pi pi-exclamation-triangle"></i>
                  {{ obj.riskDescription }}
                </p>
              </div>
            }
          </div>
        </section>

        <!-- SECTION 6: Acciones Derivadas -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-list-check"></i>
            Acciones Derivadas (Remediación)
          </h2>
          <p-table [value]="tprmService.accionesDerivadas()" [tableStyle]="{ 'min-width': '70rem' }" styleClass="p-datatable-sm p-datatable-striped">
            <ng-template #header>
              <tr>
                <th>Tipo</th>
                <th>Proveedor</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Impacto Esperado</th>
                <th>Fecha Límite</th>
              </tr>
            </ng-template>
            <ng-template #body let-action>
              <tr>
                <td>
                  <p-tag [value]="getActionTypeLabel(action.type)" [severity]="getActionTypeSeverity(action.type)" />
                </td>
                <td class="font-semibold">{{ action.providerName }}</td>
                <td class="max-w-xs">{{ action.description }}</td>
                <td>
                  <p-tag [value]="getStatusLabel(action.status)" [severity]="getStatusSeverity(action.status)" />
                </td>
                <td class="text-sm">{{ action.expectedImpact }}</td>
                <td>{{ action.dueDate }}</td>
              </tr>
            </ng-template>
          </p-table>
        </section>

        <!-- SECTION 7: Controles y Reducción de Riesgo -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-shield"></i>
            Controles y Reducción de Riesgo (Inherente → Residual)
          </h2>
          <div class="chart-container">
            <apx-chart
              [series]="controlsChartSeries()"
              [chart]="controlsChartOptions"
              [xaxis]="controlsXAxis()"
              [yaxis]="controlsYAxis"
              [plotOptions]="quarterlyPlotOptions"
              [dataLabels]="controlsDataLabels"
              [legend]="chartLegend"
              [tooltip]="chartTooltip"
              [grid]="chartGrid"
              [colors]="['#EF5350', '#66BB6A']"
            ></apx-chart>
          </div>
        </section>

        <!-- SECTION 8: Mapa de Calor -->
        <section class="tprm-section">
          <h2 class="section-title">
            <i class="pi pi-th-large"></i>
            Mapa de Calor de Riesgos por Proveedor
          </h2>
          <p class="section-hint">Matriz 5×5: Probabilidad × Impacto (cantidad de riesgos por celda)</p>
          <div class="chart-container">
            <apx-chart
              [series]="heatmapChartSeries()"
              [chart]="heatmapChartOptions"
              [xaxis]="heatmapXAxis"
              [plotOptions]="heatmapPlotOptions"
              [dataLabels]="heatmapDataLabels"
              [tooltip]="chartTooltip"
              [colors]="['#66BB6A']"
            ></apx-chart>
          </div>
        </section>

        }
      </div>
    </div>
  `,
  styles: [`
    /* Toolbar - mismo patrón que dashboard-customizable */
    .dashboard-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4, 1rem) var(--spacing-6, 1.5rem);
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      flex-shrink: 0;
      margin-bottom: 1rem;
      border-radius: 12px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4, 1rem);
    }

    .dashboard-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);

      i { color: var(--primary-color); }
    }

    .toolbar-subtitle {
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      background: var(--primary-50);
      color: var(--primary-color);
      border-radius: 4px;
    }

    :host-context(.dark) .toolbar-subtitle,
    :host-context(.dark-mode) .toolbar-subtitle {
      background: rgba(16, 185, 129, 0.16);
      color: var(--emerald-400);
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-2, 0.5rem);
    }

    .dashboard-tprm {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Header */
    .tprm-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .tprm-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color);
      margin: 0;

      i { color: var(--primary-color); }
    }

    .tprm-subtitle {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-top: 0.25rem;
      display: block;
    }

    .tprm-period {
      padding: 0.375rem 0.75rem;
      background: var(--primary-50);
      color: var(--primary-color);
      border-radius: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    :host-context(.dark) .tprm-period,
    :host-context(.dark-mode) .tprm-period {
      background: rgba(16, 185, 129, 0.16);
      color: var(--emerald-400);
    }

    /* Sections */
    .tprm-section {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0 0 1rem 0;

      i {
        color: var(--primary-color);
        font-size: 1rem;
      }
    }

    .section-hint {
      font-size: 0.8125rem;
      color: var(--text-color-secondary);
      margin: -0.5rem 0 1rem 0;
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 4rem;
      color: var(--text-color-secondary);
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--surface-ground);
      border-radius: 10px;
      border-left: 4px solid;
      transition: transform 0.15s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .kpi-semaforo {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
      box-shadow: 0 0 6px currentColor;
    }

    .kpi-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-color);
    }

    .kpi-unit {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-color-secondary);

      i { font-size: 0.625rem; }

      &.trend-up {
        color: var(--red-500);
      }

      &.trend-down {
        color: var(--green-500);
      }
    }

    /* Chart containers */
    .chart-container {
      min-height: 350px;
    }

    /* Services list */
    .services-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .service-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .service-area {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    /* Objectives grid */
    .objectives-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .objective-card {
      padding: 1rem;
      background: var(--surface-ground);
      border-radius: 10px;
      border: 1px solid var(--surface-border);
      transition: border-color 0.15s ease;

      &.risk-alto {
        border-left: 3px solid var(--orange-500);
      }

      &.risk-critico {
        border-left: 3px solid var(--red-500);
      }
    }

    .objective-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .objective-name {
      font-weight: 600;
      font-size: 0.9375rem;
      color: var(--text-color);
    }

    .objective-desc {
      font-size: 0.8125rem;
      color: var(--text-color-secondary);
      margin: 0 0 0.75rem 0;
    }

    .objective-progress {
      margin-bottom: 0.75rem;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.375rem;
    }

    .progress-value {
      font-weight: 600;
      color: var(--text-color);
    }

    .objective-risk-desc {
      display: flex;
      align-items: flex-start;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--orange-600);
      margin: 0;
      padding: 0.5rem;
      background: var(--orange-50);
      border-radius: 6px;

      i {
        margin-top: 1px;
        flex-shrink: 0;
      }
    }

    :host-context(.dark) .objective-risk-desc,
    :host-context(.dark-mode) .objective-risk-desc {
      background: rgba(249, 115, 22, 0.12);
      color: var(--orange-400);
    }

    /* Heatmap chart */

    /* Responsive */
    @media (max-width: 768px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .objectives-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Table overrides */
    .max-w-xs {
      max-width: 20rem;
    }

    .font-semibold {
      font-weight: 600;
    }

    .text-sm {
      font-size: 0.875rem;
    }
  `],
})
export class DashboardTprmComponent implements OnInit {
  private router = inject(Router);
  private exportService = inject(ExportService);
  tprmService = inject(TprmDashboardService);

  exportingPdf = signal(false);

  // ---- Chart configurations ----

  // Section 2: Severity bars
  readonly severityChartOptions: ApexChart = {
    type: 'bar',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
  };

  readonly severityPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: true,
      barHeight: '60%',
      borderRadius: 4,
    },
  };

  readonly severityYAxis: ApexYAxis = {
    labels: {
      style: { colors: 'var(--text-color-secondary)', fontSize: '12px' },
    },
  };

  readonly severityDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '11px', fontWeight: 600 },
  };

  readonly severityChartSeries = computed<ApexAxisChartSeries>(() => {
    const data = this.tprmService.proveedoresSeveridad();
    return [
      {
        name: 'Incidentes',
        data: data.map(d => d.incidents),
      },
      {
        name: 'Defectos',
        data: data.map(d => d.defects),
      },
    ];
  });

  readonly severityXAxis = computed<ApexXAxis>(() => {
    const data = this.tprmService.proveedoresSeveridad();
    return {
      categories: data.map(d => d.providerName),
      labels: {
        style: { colors: 'var(--text-color-secondary)', fontSize: '12px' },
      },
    };
  });

  readonly severityColors = computed(() => {
    return [TRAFFIC_LIGHT_COLORS.red, TRAFFIC_LIGHT_COLORS.yellow];
  });

  // Section 3: Quarterly comparison
  readonly quarterlyChartOptions: ApexChart = {
    type: 'bar',
    height: 400,
    toolbar: { show: false },
    background: 'transparent',
  };

  readonly quarterlyPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4,
    },
  };

  readonly quarterlyYAxis: ApexYAxis = {
    labels: {
      style: { colors: 'var(--text-color-secondary)', fontSize: '12px' },
    },
  };

  readonly quarterlyDataLabels: ApexDataLabels = {
    enabled: false,
  };

  readonly chartLegend: ApexLegend = {
    position: 'top',
    horizontalAlign: 'right',
    labels: { colors: 'var(--text-color-secondary)' },
  };

  readonly chartTooltip: ApexTooltip = {
    theme: 'dark',
  };

  readonly chartGrid: ApexGrid = {
    borderColor: 'var(--surface-border)',
    strokeDashArray: 3,
  };

  readonly quarterlyChartSeries = computed<ApexAxisChartSeries>(() => {
    const data = this.tprmService.comparativoTrimestral();
    return [
      {
        name: 'Incidentes Q4-2025',
        data: data.map(d => d.q4?.incidents ?? 0),
      },
      {
        name: 'Incidentes Q1-2026',
        data: data.map(d => d.q1?.incidents ?? 0),
      },
      {
        name: 'SLA% Q4-2025',
        data: data.map(d => d.q4?.slaCompliance ?? 0),
      },
      {
        name: 'SLA% Q1-2026',
        data: data.map(d => d.q1?.slaCompliance ?? 0),
      },
    ];
  });

  readonly quarterlyXAxis = computed<ApexXAxis>(() => {
    const data = this.tprmService.comparativoTrimestral();
    return {
      categories: data.map(d => d.providerName),
      labels: {
        style: { colors: 'var(--text-color-secondary)', fontSize: '11px' },
        rotate: -45,
        rotateAlways: true,
      },
    };
  });

  // Section 7: Controls chart
  readonly controlsChartOptions: ApexChart = {
    type: 'bar',
    height: 380,
    toolbar: { show: false },
    background: 'transparent',
  };

  readonly controlsYAxis: ApexYAxis = {
    max: 10,
    labels: {
      style: { colors: 'var(--text-color-secondary)', fontSize: '12px' },
    },
  };

  readonly controlsDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '11px', fontWeight: 600 },
  };

  readonly controlsChartSeries = computed<ApexAxisChartSeries>(() => {
    const data = this.tprmService.controlesReduccion();
    return [
      {
        name: 'Riesgo Inherente',
        data: data.map(d => d.avgInherent),
      },
      {
        name: 'Riesgo Residual',
        data: data.map(d => d.avgResidual),
      },
    ];
  });

  readonly controlsXAxis = computed<ApexXAxis>(() => {
    const data = this.tprmService.controlesReduccion();
    return {
      categories: data.map(d => d.providerName),
      labels: {
        style: { colors: 'var(--text-color-secondary)', fontSize: '11px' },
        rotate: -45,
        rotateAlways: true,
      },
    };
  });

  // Section 8: Heatmap chart (probability x impact)
  readonly heatmapChartOptions: ApexChart = {
    type: 'heatmap',
    height: 350,
    toolbar: { show: false },
    background: 'transparent',
  };

  readonly heatmapXAxis: ApexXAxis = {
    categories: ['Impacto 1', 'Impacto 2', 'Impacto 3', 'Impacto 4', 'Impacto 5'],
    labels: {
      style: { colors: 'var(--text-color-secondary)', fontSize: '12px' },
    },
  };

  readonly heatmapPlotOptions: ApexPlotOptions = {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: 'var(--surface-200)', name: 'Sin riesgos' },
          { from: 1, to: 1, color: '#66BB6A', name: 'Bajo' },
          { from: 2, to: 3, color: '#FFCA28', name: 'Medio' },
          { from: 4, to: 6, color: '#FFA726', name: 'Alto' },
          { from: 7, to: 20, color: '#EF5350', name: 'Crítico' },
        ],
      },
    },
  };

  readonly heatmapDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '14px', fontWeight: 700 },
  };

  readonly heatmapChartSeries = computed<ApexAxisChartSeries>(() => {
    const points = this.tprmService.riskMapPoints();
    // Build 5x5 matrix: rows = probability (5→1), cols = impact (1→5)
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    points.forEach(p => {
      const row = p.probability - 1; // 0-4
      const col = p.impact - 1;      // 0-4
      if (row >= 0 && row < 5 && col >= 0 && col < 5) {
        matrix[row][col]++;
      }
    });
    // ApexCharts heatmap: series from top (Prob 5) to bottom (Prob 1)
    return [5, 4, 3, 2, 1].map(prob => ({
      name: `Prob. ${prob}`,
      data: matrix[prob - 1],
    }));
  });

  ngOnInit(): void {
    this.tprmService.loadData();
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard-custom']);
  }

  async exportarDashboard(): Promise<void> {
    const dashboardEl = document.querySelector('.dashboard-tprm') as HTMLElement;
    if (!dashboardEl) return;

    this.exportingPdf.set(true);
    try {
      const filename = this.exportService.generateFilename('dashboard-tprm');
      await this.exportService.exportDashboardCanvas(dashboardEl, { filename, format: 'pdf' });
    } finally {
      this.exportingPdf.set(false);
    }
  }

  // Helper methods
  getCriticalitySeverity(criticality: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      critica: 'danger',
      alta: 'danger',
      media: 'warn',
      baja: 'success',
    };
    return map[criticality] ?? 'secondary';
  }

  getRiskTagSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      critico: 'danger',
      alto: 'danger',
      medio: 'warn',
      bajo: 'success',
    };
    return map[level] ?? 'info';
  }

  getActionTypeLabel(type: string): string {
    const map: Record<string, string> = {
      penalization: 'Penalización',
      stop_payment: 'Detener Pago',
      cancel_contract: 'Cancelar Contrato',
      activate_alternate: 'Activar Alterno',
    };
    return map[type] ?? type;
  }

  getActionTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      penalization: 'warn',
      stop_payment: 'danger',
      cancel_contract: 'danger',
      activate_alternate: 'info',
    };
    return map[type] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completado',
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      pending: 'warn',
      in_progress: 'info',
      completed: 'success',
    };
    return map[status] ?? 'secondary';
  }
}
