// ============================================================================
// DRILL-DOWN NAVIGATOR COMPONENT
// ============================================================================
// Navegador jerárquico de 3 niveles con breadcrumb, miniatura del padre,
// gráfico interactivo y tabla detallada en nivel 3.
// Integrado con ApexCharts y PrimeNG Table.
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';
import {
  NivelDrillDown,
  EstadoDrillDown,
  TipoVisualizacion
} from '../../../models/analisis-inteligente.models';

@Component({
  selector: 'app-drill-down-navigator',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TableModule,
    TooltipModule,
    NgApexchartsModule
  ],
  template: `
    <!-- Drill-Down Navigator Container -->
    <div class="drill-down-navigator" [class.drill-down-animating]="isAnimating()">

      <!-- ====== BREADCRUMB BAR ====== -->
      <div class="drill-down-header">
        <div class="drill-down-breadcrumb">
          @for (crumb of breadcrumbItems(); track crumb.label; let i = $index; let last = $last) {
            @if (i > 0) {
              <span class="breadcrumb-separator">
                <i class="pi pi-angle-right"></i>
              </span>
            }
            @if (!last) {
              <button
                class="breadcrumb-item breadcrumb-clickable"
                (click)="navigateToBreadcrumb(i)"
                [title]="crumb.label">
                @if (i === 0) {
                  <i class="pi pi-home breadcrumb-icon"></i>
                }
                <span>{{ crumb.label }}</span>
              </button>
            } @else {
              <span class="breadcrumb-item breadcrumb-current">
                <span>{{ crumb.label }}</span>
              </span>
            }
          }
        </div>

        <div class="drill-down-actions">
          <!-- Subir nivel button -->
          @if (nivelActual() > 0) {
            <p-button
              icon="pi pi-arrow-up"
              label="Subir nivel"
              [text]="true"
              severity="secondary"
              size="small"
              (onClick)="handleSubirNivel()">
            </p-button>
          }
          <!-- Close / Back to chart button -->
          <p-button
            icon="pi pi-times"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            size="small"
            (onClick)="handleClose()"
            pTooltip="Cerrar drill-down">
          </p-button>
        </div>
      </div>

      <!-- ====== CONTENT AREA ====== -->
      <div class="drill-down-content" [class.drill-down-slide-in]="isAnimating()">

        <!-- Level title -->
        <div class="drill-down-level-info">
          <h4 class="drill-down-title">{{ nivelActualData()?.titulo || '' }}</h4>
          @if (nivelActualData()?.filtroAplicado) {
            <p-tag
              [value]="'Filtro: ' + nivelActualData()!.filtroAplicado"
              severity="info"
              [rounded]="true"
              icon="pi pi-filter">
            </p-tag>
          }
          <span class="drill-down-level-badge">
            Nivel {{ (nivelActual() || 0) + 1 }} de 3
          </span>
        </div>

        <!-- ====== PARENT MINIATURE (top right, when nivel > 0) ====== -->
        @if (nivelActual() > 0 && parentNivelData()) {
          <div class="drill-down-miniature" (click)="handleSubirNivel()">
            <div class="miniature-label">{{ parentNivelData()!.titulo }}</div>
            <div class="miniature-chart">
              <apx-chart
                [series]="parentChartSeries()"
                [chart]="parentChartOptions()"
                [labels]="parentNivelData()!.datos.labels"
                [xaxis]="parentXAxis()"
                [dataLabels]="miniDataLabels"
                [legend]="miniLegend"
                [grid]="miniGrid"
                [tooltip]="miniTooltip"
                [stroke]="miniStroke">
              </apx-chart>
            </div>
          </div>
        }

        <!-- ====== MAIN CHART (Levels 1 & 2) ====== -->
        @if (nivelActualData() && nivelActualData()!.tipoGrafico !== 'table') {
          <div class="drill-down-chart-container">
            <apx-chart
              [series]="mainChartSeries()"
              [chart]="mainChartOptions()"
              [labels]="nivelActualData()!.datos.labels"
              [xaxis]="mainXAxis()"
              [yaxis]="mainYAxis()"
              [dataLabels]="mainDataLabels()"
              [legend]="mainLegend"
              [grid]="mainGrid()"
              [tooltip]="mainTooltip"
              [stroke]="mainStroke()"
              [fill]="mainFill()"
              [plotOptions]="mainPlotOptions()"
              [colors]="chartColors">
            </apx-chart>

            <!-- Click hint -->
            @if (nivelActual() < 2) {
              <div class="drill-down-hint">
                <i class="pi pi-info-circle"></i>
                Haz clic en un elemento para explorar el siguiente nivel
              </div>
            }
          </div>
        }

        <!-- ====== TABLE VIEW (Level 3) ====== -->
        @if (nivelActualData()?.tipoGrafico === 'table' && registros().length > 0) {
          <div class="drill-down-table-container">
            <p-table
              [value]="registros()"
              [paginator]="registros().length > 10"
              [rows]="10"
              [rowHover]="true"
              [showGridlines]="false"
              [stripedRows]="true"
              sortMode="single"
              [globalFilterFields]="['id', 'nombre', 'estado', 'severidad', 'fecha']"
              styleClass="p-datatable-sm drill-down-table">

              <ng-template pTemplate="header">
                <tr>
                  <th pSortableColumn="id" style="width: 120px">
                    ID <p-sortIcon field="id"></p-sortIcon>
                  </th>
                  <th pSortableColumn="nombre">
                    Nombre <p-sortIcon field="nombre"></p-sortIcon>
                  </th>
                  <th pSortableColumn="estado" style="width: 130px">
                    Estado <p-sortIcon field="estado"></p-sortIcon>
                  </th>
                  <th pSortableColumn="severidad" style="width: 120px">
                    Severidad <p-sortIcon field="severidad"></p-sortIcon>
                  </th>
                  <th pSortableColumn="fecha" style="width: 130px">
                    Fecha <p-sortIcon field="fecha"></p-sortIcon>
                  </th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-registro>
                <tr class="drill-down-table-row" (click)="onRegistroClick(registro)">
                  <td>
                    <span class="registro-id">{{ registro.id }}</span>
                  </td>
                  <td>{{ registro.nombre }}</td>
                  <td>
                    <p-tag
                      [value]="registro.estado"
                      [severity]="getEstadoSeverity(registro.estado)"
                      [rounded]="true">
                    </p-tag>
                  </td>
                  <td>
                    <p-tag
                      [value]="registro.severidad"
                      [severity]="getSeveridadSeverity(registro.severidad)"
                      [rounded]="true">
                    </p-tag>
                  </td>
                  <td>{{ registro.fecha }}</td>
                </tr>
              </ng-template>

              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="drill-down-empty">
                    <i class="pi pi-inbox"></i>
                    <span>No se encontraron registros</span>
                  </td>
                </tr>
              </ng-template>

              <ng-template pTemplate="summary">
                <div class="drill-down-table-summary">
                  <span>{{ registros().length }} registro(s) encontrado(s)</span>
                </div>
              </ng-template>
            </p-table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    /* ====== CONTAINER ====== */
    .drill-down-navigator {
      display: flex;
      flex-direction: column;
      gap: 0;
      width: 100%;
      position: relative;
      background: var(--p-surface-0, #ffffff);
      border-radius: 12px;
      overflow: hidden;
    }

    /* ====== HEADER / BREADCRUMB BAR ====== */
    .drill-down-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: var(--p-surface-50, #f8fafc);
      border-bottom: 1px solid var(--p-surface-200, #e2e8f0);
      min-height: 44px;
    }

    .drill-down-breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      flex: 1;
      min-width: 0;
    }

    .breadcrumb-separator {
      color: var(--p-text-muted-color, #94a3b8);
      font-size: 0.75rem;
      display: flex;
      align-items: center;
    }

    .breadcrumb-item {
      font-size: 0.8125rem;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .breadcrumb-clickable {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--p-primary-color, #3b82f6);
      padding: 2px 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s ease, color 0.15s ease;
      font-family: inherit;
    }

    .breadcrumb-clickable:hover {
      background: var(--p-primary-50, #eff6ff);
      color: var(--p-primary-700, #1d4ed8);
    }

    .breadcrumb-icon {
      font-size: 0.75rem;
    }

    .breadcrumb-current {
      color: var(--p-text-color, #1e293b);
      font-weight: 600;
      padding: 2px 6px;
    }

    .drill-down-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    /* ====== CONTENT AREA ====== */
    .drill-down-content {
      position: relative;
      padding: 16px;
      animation: drillFadeIn 0.3s ease-out;
    }

    .drill-down-level-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .drill-down-title {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--p-text-color, #1e293b);
    }

    .drill-down-level-badge {
      font-size: 0.7rem;
      color: var(--p-text-muted-color, #94a3b8);
      background: var(--p-surface-100, #f1f5f9);
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
      margin-left: auto;
    }

    /* ====== PARENT MINIATURE ====== */
    .drill-down-miniature {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 160px;
      height: 110px;
      background: var(--p-surface-50, #f8fafc);
      border: 1px solid var(--p-surface-200, #e2e8f0);
      border-radius: 8px;
      padding: 6px;
      cursor: pointer;
      z-index: 10;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      overflow: hidden;
      opacity: 0.85;
    }

    .drill-down-miniature:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: scale(1.03);
      opacity: 1;
    }

    .miniature-label {
      font-size: 0.625rem;
      font-weight: 600;
      color: var(--p-text-muted-color, #94a3b8);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .miniature-chart {
      width: 100%;
      height: 80px;
      overflow: hidden;
    }

    /* ====== CHART CONTAINER ====== */
    .drill-down-chart-container {
      position: relative;
      margin-top: 8px;
    }

    .drill-down-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--p-text-muted-color, #94a3b8);
      padding: 8px 0 0;
      opacity: 0.7;
    }

    .drill-down-hint i {
      font-size: 0.8rem;
    }

    /* ====== TABLE CONTAINER (Level 3) ====== */
    .drill-down-table-container {
      margin-top: 8px;
    }

    :host ::ng-deep .drill-down-table {
      .p-datatable-thead > tr > th {
        background: var(--p-surface-50, #f8fafc);
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--p-text-muted-color, #64748b);
        padding: 10px 12px;
        border-bottom: 2px solid var(--p-surface-200, #e2e8f0);
      }

      .p-datatable-tbody > tr > td {
        padding: 10px 12px;
        font-size: 0.8125rem;
        border-bottom: 1px solid var(--p-surface-100, #f1f5f9);
      }
    }

    .drill-down-table-row {
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .drill-down-table-row:hover {
      background: var(--p-primary-50, #eff6ff) !important;
    }

    .registro-id {
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.75rem;
      color: var(--p-primary-color, #3b82f6);
      font-weight: 500;
    }

    .drill-down-empty {
      text-align: center;
      padding: 32px !important;
      color: var(--p-text-muted-color, #94a3b8);

      i {
        font-size: 2rem;
        display: block;
        margin-bottom: 8px;
      }
    }

    .drill-down-table-summary {
      font-size: 0.75rem;
      color: var(--p-text-muted-color, #94a3b8);
      text-align: right;
      padding: 8px 0 0;
    }

    /* ====== ANIMATIONS ====== */
    @keyframes drillFadeIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes drillFadeOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }

    .drill-down-slide-in {
      animation: drillFadeIn 0.3s ease-out;
    }

    .drill-down-animating {
      pointer-events: none;
    }

    /* ====== DARK MODE ====== */
    :host-context(.dark) {
      .drill-down-navigator {
        background: var(--p-surface-900, #0f172a);
      }

      .drill-down-header {
        background: var(--p-surface-800, #1e293b);
        border-bottom-color: var(--p-surface-700, #334155);
      }

      .breadcrumb-clickable:hover {
        background: rgba(59, 130, 246, 0.15);
      }

      .drill-down-miniature {
        background: var(--p-surface-800, #1e293b);
        border-color: var(--p-surface-700, #334155);
      }

      .drill-down-miniature:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      .drill-down-level-badge {
        background: var(--p-surface-700, #334155);
      }
    }

    /* ====== RESPONSIVE ====== */
    @media (max-width: 768px) {
      .drill-down-miniature {
        display: none;
      }

      .drill-down-breadcrumb {
        font-size: 0.75rem;
      }

      .breadcrumb-item {
        max-width: 120px;
      }

      .drill-down-content {
        padding: 12px;
      }
    }
  `]
})
export class DrillDownNavigatorComponent implements OnChanges {
  // ==================== INPUTS / OUTPUTS ====================

  @Input() state: EstadoDrillDown | null = null;

  @Output() onDrill = new EventEmitter<{ elemento: string; nivel: number }>();
  @Output() onSubirNivel = new EventEmitter<void>();

  // ==================== INTERNAL STATE ====================

  isAnimating = signal(false);

  /** Chart color palette */
  chartColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  // ==================== MINIATURE CHART STATIC OPTIONS ====================

  miniDataLabels = { enabled: false };
  miniLegend = { show: false };
  miniGrid = { show: false, padding: { top: -15, right: 0, bottom: -15, left: -5 } };
  miniTooltip = { enabled: false };
  miniStroke = { width: 1.5, curve: 'smooth' as const };

  // Main chart static options
  mainLegend = { position: 'bottom' as const, fontSize: '12px' };
  mainTooltip = { shared: true, intersect: false };

  // ==================== COMPUTED PROPERTIES ====================

  nivelActual = computed(() => this.state?.nivelActual ?? 0);

  breadcrumbItems = computed(() => {
    if (!this.state) return [];
    return this.state.breadcrumb.map((label, index) => ({
      label,
      index,
      isLast: index === this.state!.breadcrumb.length - 1
    }));
  });

  nivelActualData = computed((): NivelDrillDown | null => {
    if (!this.state) return null;
    return this.state.niveles[this.state.nivelActual] ?? null;
  });

  parentNivelData = computed((): NivelDrillDown | null => {
    if (!this.state || this.state.nivelActual <= 0) return null;
    return this.state.niveles[this.state.nivelActual - 1] ?? null;
  });

  registros = computed(() => {
    const data = this.nivelActualData();
    if (!data || data.tipoGrafico !== 'table') return [];
    return data.datos.registros || [];
  });

  // ==================== CHART OPTIONS (COMPUTED) ====================

  /** Main chart series for current level */
  mainChartSeries = computed((): ApexAxisChartSeries | ApexNonAxisChartSeries => {
    const data = this.nivelActualData();
    if (!data || data.tipoGrafico === 'table') return [];
    return this.buildSeries(data);
  });

  /** Main chart type/options */
  mainChartOptions = computed((): ApexChart => {
    const data = this.nivelActualData();
    if (!data) return { type: 'bar', height: 320 };

    const apexType = this.mapTipoGraficoToApex(data.tipoGrafico);
    const isDark = this.isDarkMode();

    return {
      type: apexType,
      height: 320,
      background: 'transparent',
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      animations: { enabled: true, speed: 400 },
      events: {
        dataPointSelection: (_e: any, _chart: any, config: any) => {
          this.handleChartClick(config);
        }
      },
      ...(isDark ? { foreColor: '#e5e7eb' } : {})
    };
  });

  mainXAxis = computed(() => {
    const data = this.nivelActualData();
    if (!data) return {};
    const tipo = data.tipoGrafico;
    if (tipo === 'pie' || tipo === 'donut' || tipo === 'radar') return {};

    const isDark = this.isDarkMode();
    return {
      categories: data.datos.labels,
      labels: {
        style: {
          colors: isDark ? '#e5e7eb' : '#374151',
          fontSize: '11px'
        },
        rotate: data.datos.labels.length > 6 ? -45 : 0,
        rotateAlways: data.datos.labels.length > 6
      }
    };
  });

  mainYAxis = computed(() => {
    const data = this.nivelActualData();
    if (!data) return {};
    const tipo = data.tipoGrafico;
    if (tipo === 'pie' || tipo === 'donut' || tipo === 'radar') return {};

    const isDark = this.isDarkMode();
    return {
      labels: {
        style: { colors: isDark ? '#e5e7eb' : '#374151', fontSize: '11px' }
      }
    };
  });

  mainDataLabels = computed(() => {
    const data = this.nivelActualData();
    if (!data) return { enabled: false };
    const tipo = data.tipoGrafico;
    return {
      enabled: tipo === 'pie' || tipo === 'donut',
      formatter: (val: number) => {
        if (tipo === 'pie' || tipo === 'donut') return `${Math.round(val)}%`;
        return `${val}`;
      }
    };
  });

  mainGrid = computed(() => {
    const isDark = this.isDarkMode();
    const data = this.nivelActualData();
    const tipo = data?.tipoGrafico;
    if (tipo === 'pie' || tipo === 'donut' || tipo === 'radar') {
      return { show: false };
    }
    return {
      show: true,
      borderColor: isDark ? '#374151' : '#e5e7eb',
      strokeDashArray: 3
    };
  });

  mainStroke = computed(() => {
    const data = this.nivelActualData();
    if (!data) return { width: 2 };
    const tipo = data.tipoGrafico;
    if (tipo === 'line' || tipo === 'area') {
      return { width: 2.5, curve: 'smooth' as const };
    }
    if (tipo === 'bar') {
      return { width: 0 };
    }
    return { width: 2 };
  });

  mainFill = computed(() => {
    const data = this.nivelActualData();
    if (!data) return { opacity: 1 };
    if (data.tipoGrafico === 'area') {
      return { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 95, 100] } };
    }
    return { opacity: 1 };
  });

  mainPlotOptions = computed(() => {
    const data = this.nivelActualData();
    if (!data) return {};
    if (data.tipoGrafico === 'bar') {
      return {
        bar: {
          borderRadius: 4,
          columnWidth: '55%',
          distributed: true
        }
      };
    }
    if (data.tipoGrafico === 'donut') {
      return {
        pie: {
          donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total' } } }
        }
      };
    }
    return {};
  });

  // ==================== PARENT MINIATURE CHART OPTIONS ====================

  parentChartSeries = computed((): ApexAxisChartSeries | ApexNonAxisChartSeries => {
    const data = this.parentNivelData();
    if (!data) return [];
    return this.buildSeries(data);
  });

  parentChartOptions = computed((): ApexChart => {
    const data = this.parentNivelData();
    if (!data) return { type: 'bar', height: 70 };

    return {
      type: this.mapTipoGraficoToApex(data.tipoGrafico),
      height: 70,
      sparkline: { enabled: true },
      background: 'transparent',
      animations: { enabled: false }
    };
  });

  parentXAxis = computed(() => {
    const data = this.parentNivelData();
    if (!data) return {};
    const tipo = data.tipoGrafico;
    if (tipo === 'pie' || tipo === 'donut' || tipo === 'radar') return {};
    return {
      categories: data.datos.labels,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    };
  });

  // ==================== LIFECYCLE ====================

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state']) {
      this.triggerAnimation();
    }
  }

  // ==================== EVENT HANDLERS ====================

  handleSubirNivel(): void {
    this.triggerAnimation();
    this.onSubirNivel.emit();
  }

  handleClose(): void {
    // Emit subir nivel repeatedly until we exit
    this.onSubirNivel.emit();
  }

  navigateToBreadcrumb(index: number): void {
    if (!this.state) return;
    const currentLevel = this.state.nivelActual;
    // Go up as many levels as needed
    const levelsToGoUp = currentLevel - index;
    if (levelsToGoUp > 0) {
      this.triggerAnimation();
      // Emit subir nivel for each level to go up
      for (let i = 0; i < levelsToGoUp; i++) {
        this.onSubirNivel.emit();
      }
    }
  }

  handleChartClick(config: any): void {
    const data = this.nivelActualData();
    if (!data || this.nivelActual() >= 2) return;

    const dataPointIndex = config.dataPointIndex;
    if (dataPointIndex < 0 || dataPointIndex >= data.datos.labels.length) return;

    const elemento = data.datos.labels[dataPointIndex];
    this.triggerAnimation();
    this.onDrill.emit({ elemento, nivel: data.nivel });
  }

  onRegistroClick(registro: any): void {
    // Could emit an event for detail view; for now just log
    console.log('Registro seleccionado:', registro);
  }

  // ==================== HELPERS: TAG SEVERITIES ====================

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'Abierto': 'danger',
      'En Proceso': 'warn',
      'Resuelto': 'success',
      'Cerrado': 'secondary'
    };
    return map[estado] || 'info';
  }

  getSeveridadSeverity(severidad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      'Critico': 'danger',
      'Alto': 'warn',
      'Medio': 'info',
      'Bajo': 'success'
    };
    return map[severidad] || 'info';
  }

  // ==================== HELPERS: CHART BUILDING ====================

  private buildSeries(nivel: NivelDrillDown): ApexAxisChartSeries | ApexNonAxisChartSeries {
    const tipo = nivel.tipoGrafico;
    if (tipo === 'pie' || tipo === 'donut') {
      return nivel.datos.series;
    }
    // Axis chart types: wrap in named series
    return [{
      name: nivel.titulo || 'Valor',
      data: nivel.datos.series
    }];
  }

  private mapTipoGraficoToApex(tipo: TipoVisualizacion): ApexChart['type'] {
    const map: Record<TipoVisualizacion, ApexChart['type']> = {
      bar: 'bar',
      line: 'line',
      pie: 'pie',
      donut: 'donut',
      area: 'area',
      scatter: 'scatter',
      heatmap: 'heatmap',
      radar: 'radar',
      funnel: 'bar',
      treemap: 'treemap',
      table: 'bar',
      sankey: 'bar',
      gauge: 'radialBar'
    };
    return map[tipo] || 'bar';
  }

  private isDarkMode(): boolean {
    if (typeof document === 'undefined') return false;
    return document.body.classList.contains('dark');
  }

  private triggerAnimation(): void {
    this.isAnimating.set(true);
    setTimeout(() => this.isAnimating.set(false), 350);
  }
}
