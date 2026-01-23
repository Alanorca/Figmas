import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Representa un punto de riesgo en el mapa
 */
export interface RiskPoint {
  id: string;
  name: string;
  probability: number; // 1-5
  impact: number; // 1-5
  count?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Configuración de paleta de colores
 */
export interface RiskMapPalette {
  id: string;
  name: string;
  gridSize: number;
  colors: string[][];
  legend: { level: string; color: string; range: string }[];
}

/**
 * Paleta por defecto 5x5 (ISO 31000)
 */
const DEFAULT_PALETTE: RiskMapPalette = {
  id: 'enterprise-5x5',
  name: 'Empresarial 5x5 (ISO 31000)',
  gridSize: 5,
  colors: [
    ['#22c55e', '#4ade80', '#84cc16', '#eab308', '#f97316'],
    ['#4ade80', '#84cc16', '#eab308', '#f97316', '#ef4444'],
    ['#84cc16', '#eab308', '#f97316', '#ef4444', '#dc2626'],
    ['#eab308', '#f97316', '#ef4444', '#dc2626', '#b91c1c'],
    ['#f97316', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d']
  ],
  legend: [
    { level: 'Muy Bajo', color: '#22c55e', range: '1-4' },
    { level: 'Bajo', color: '#84cc16', range: '5-8' },
    { level: 'Medio', color: '#eab308', range: '9-12' },
    { level: 'Alto', color: '#f97316', range: '13-16' },
    { level: 'Muy Alto', color: '#ef4444', range: '17-20' },
    { level: 'Critico', color: '#7f1d1d', range: '21-25' }
  ]
};

const DEFAULT_AXIS_LABELS = {
  probability: ['Muy Improbable', 'Improbable', 'Posible', 'Probable', 'Casi Seguro'],
  impact: ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrofico']
};

@Component({
  selector: 'app-risk-map',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="risk-map-container">
      <!-- Header con titulo y leyenda -->
      <div class="risk-map-header">
        @if (title()) {
          <h3 class="risk-map-title">
            <i class="pi pi-th-large"></i>
            {{ title() }}
          </h3>
        }
        @if (showLegend()) {
          <div class="risk-map-legend">
            @for (item of activePalette().legend; track item.level) {
              <div class="legend-item">
                <span class="legend-dot" [style.background]="item.color"></span>
                <span class="legend-label">{{ item.level }}</span>
              </div>
            }
          </div>
        }
      </div>

      <!-- SVG Risk Map -->
      <div class="risk-map-svg-container">
        <svg
          [attr.viewBox]="viewBox()"
          class="risk-map-svg"
          preserveAspectRatio="xMidYMid meet">

          <!-- Definiciones para sombras y gradientes -->
          <defs>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.15"/>
            </filter>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Eje Y Label -->
          <text
            [attr.x]="margin().left / 2"
            [attr.y]="(svgHeight() - margin().top - margin().bottom) / 2 + margin().top"
            class="axis-label axis-y-label"
            text-anchor="middle"
            [attr.transform]="'rotate(-90, ' + margin().left / 2 + ', ' + ((svgHeight() - margin().top - margin().bottom) / 2 + margin().top) + ')'">
            {{ yAxisLabel() }}
          </text>

          <!-- Eje X Label -->
          <text
            [attr.x]="(svgWidth() - margin().left - margin().right) / 2 + margin().left"
            [attr.y]="svgHeight() - 10"
            class="axis-label"
            text-anchor="middle">
            {{ xAxisLabel() }}
          </text>

          <!-- Grid de celdas -->
          @for (row of gridRows(); track row; let rowIdx = $index) {
            @for (col of gridCols(); track col; let colIdx = $index) {
              <rect
                [attr.x]="getCellX(colIdx)"
                [attr.y]="getCellY(rowIdx)"
                [attr.width]="cellSize()"
                [attr.height]="cellSize()"
                [attr.fill]="getCellColor(rowIdx, colIdx)"
                [attr.rx]="4"
                [attr.ry]="4"
                class="risk-cell"
                [class.hovered]="hoveredCell()?.row === rowIdx && hoveredCell()?.col === colIdx"
                (mouseenter)="onCellHover(rowIdx, colIdx)"
                (mouseleave)="onCellLeave()"
                (click)="onCellClick(rowIdx, colIdx)"/>
            }
          }

          <!-- Etiquetas eje Y (Probabilidad) -->
          @for (label of probabilityLabels(); track label; let i = $index) {
            <text
              [attr.x]="margin().left - 8"
              [attr.y]="getCellY(gridSize() - 1 - i) + cellSize() / 2"
              class="axis-tick-label"
              text-anchor="end"
              dominant-baseline="middle">
              {{ label }}
            </text>
          }

          <!-- Etiquetas eje X (Impacto) -->
          @for (label of impactLabels(); track label; let i = $index) {
            <text
              [attr.x]="getCellX(i) + cellSize() / 2"
              [attr.y]="svgHeight() - margin().bottom + 16"
              class="axis-tick-label"
              text-anchor="middle">
              {{ label }}
            </text>
          }

          <!-- Puntos de riesgo -->
          @for (point of riskPointsPositioned(); track point.id) {
            <g
              class="risk-point-group"
              [class.selected]="selectedPoint()?.id === point.id"
              [attr.transform]="'translate(' + point.x + ',' + point.y + ')'"
              (click)="onPointClick(point, $event)"
              [pTooltip]="point.name + ' (' + point.count + ')'"
              tooltipPosition="top">
              <circle
                [attr.r]="getPointRadius(point.count || 1)"
                class="risk-point"
                filter="url(#pointGlow)"/>
              @if ((point.count || 1) > 1) {
                <text
                  class="risk-point-count"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  dy="1">
                  {{ point.count }}
                </text>
              }
            </g>
          }

          <!-- Lineas de grid (opcional) -->
          @if (showGridLines()) {
            @for (i of gridLineIndices(); track i) {
              <!-- Lineas verticales -->
              <line
                [attr.x1]="getCellX(i)"
                [attr.y1]="margin().top"
                [attr.x2]="getCellX(i)"
                [attr.y2]="svgHeight() - margin().bottom"
                class="grid-line"/>
              <!-- Lineas horizontales -->
              <line
                [attr.x1]="margin().left"
                [attr.y1]="getCellY(i)"
                [attr.x2]="svgWidth() - margin().right"
                [attr.y2]="getCellY(i)"
                class="grid-line"/>
            }
          }
        </svg>
      </div>

      <!-- Footer con estadisticas -->
      @if (showStats() && riskPoints().length > 0) {
        <div class="risk-map-stats">
          <div class="stat-item">
            <span class="stat-value">{{ riskPoints().length }}</span>
            <span class="stat-label">Total Riesgos</span>
          </div>
          <div class="stat-item stat-critical">
            <span class="stat-value">{{ criticalCount() }}</span>
            <span class="stat-label">Criticos</span>
          </div>
          <div class="stat-item stat-high">
            <span class="stat-value">{{ highCount() }}</span>
            <span class="stat-label">Altos</span>
          </div>
          <div class="stat-item stat-medium">
            <span class="stat-value">{{ mediumCount() }}</span>
            <span class="stat-label">Medios</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .risk-map-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      background: var(--surface-card);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--surface-border);
      padding: 1.25rem;
    }

    .risk-map-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .risk-map-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;

      i {
        color: var(--primary-color);
      }
    }

    .risk-map-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-label {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .risk-map-svg-container {
      width: 100%;
      aspect-ratio: 1.2;
      min-height: 280px;
    }

    .risk-map-svg {
      width: 100%;
      height: 100%;
    }

    .risk-cell {
      stroke: var(--surface-card);
      stroke-width: 2;
      cursor: pointer;
      transition: all 0.15s ease;
      opacity: 0.85;

      &:hover, &.hovered {
        opacity: 1;
        filter: brightness(1.1);
      }
    }

    .axis-label {
      font-size: 12px;
      font-weight: 500;
      fill: var(--text-color-secondary);
    }

    .axis-y-label {
      font-size: 11px;
    }

    .axis-tick-label {
      font-size: 10px;
      fill: var(--text-color-secondary);
    }

    .grid-line {
      stroke: var(--surface-border);
      stroke-width: 1;
      stroke-dasharray: 2, 2;
      opacity: 0.5;
    }

    .risk-point-group {
      cursor: pointer;
      transition: transform 0.15s ease;

      &:hover {
        transform: scale(1.15);
      }

      &.selected {
        .risk-point {
          stroke: var(--surface-0);
          stroke-width: 3;
        }
      }
    }

    .risk-point {
      fill: var(--surface-0);
      stroke: var(--text-color);
      stroke-width: 2;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .risk-point-count {
      font-size: 10px;
      font-weight: 700;
      fill: var(--text-color);
    }

    .risk-map-stats {
      display: flex;
      justify-content: space-around;
      padding-top: 0.75rem;
      border-top: 1px solid var(--surface-border);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;

      .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-color);
      }

      .stat-label {
        font-size: 0.6875rem;
        color: var(--text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      &.stat-critical .stat-value { color: var(--red-600); }
      &.stat-high .stat-value { color: var(--orange-500); }
      &.stat-medium .stat-value { color: var(--yellow-500); }
    }

    /* Dark mode */
    :host-context(.dark) {
      .risk-map-container {
        background: var(--surface-900);
        border-color: var(--surface-700);
      }

      .risk-cell {
        stroke: var(--surface-900);
      }

      .risk-point {
        fill: var(--surface-900);
        stroke: var(--surface-0);
      }

      .risk-point-count {
        fill: var(--surface-0);
      }

      .risk-map-stats {
        border-top-color: var(--surface-700);
      }
    }
  `
})
export class RiskMapComponent {
  // Inputs
  riskPoints = input<RiskPoint[]>([]);
  palette = input<RiskMapPalette>(DEFAULT_PALETTE);
  gridSize = input<number>(5);
  title = input<string>('Mapa de Riesgos');
  xAxisLabel = input<string>('Impacto');
  yAxisLabel = input<string>('Probabilidad');
  probabilityLabels = input<string[]>(DEFAULT_AXIS_LABELS.probability);
  impactLabels = input<string[]>(DEFAULT_AXIS_LABELS.impact);
  showLegend = input<boolean>(true);
  showStats = input<boolean>(true);
  showGridLines = input<boolean>(false);

  // Outputs
  pointSelected = output<RiskPoint>();
  cellSelected = output<{ probability: number; impact: number }>();

  // Internal state
  hoveredCell = signal<{ row: number; col: number } | null>(null);
  selectedPoint = signal<RiskPoint | null>(null);

  // Computed
  activePalette = computed(() => this.palette() || DEFAULT_PALETTE);

  svgWidth = computed(() => 400);
  svgHeight = computed(() => 350);

  margin = computed(() => ({
    top: 20,
    right: 20,
    bottom: 50,
    left: 80
  }));

  cellSize = computed(() => {
    const availableWidth = this.svgWidth() - this.margin().left - this.margin().right;
    const availableHeight = this.svgHeight() - this.margin().top - this.margin().bottom;
    return Math.min(availableWidth, availableHeight) / this.gridSize();
  });

  viewBox = computed(() =>
    `0 0 ${this.svgWidth()} ${this.svgHeight()}`
  );

  gridRows = computed(() => Array.from({ length: this.gridSize() }, (_, i) => i));
  gridCols = computed(() => Array.from({ length: this.gridSize() }, (_, i) => i));
  gridLineIndices = computed(() => Array.from({ length: this.gridSize() + 1 }, (_, i) => i));

  riskPointsPositioned = computed(() => {
    const points = this.riskPoints();
    const cellSize = this.cellSize();
    const margin = this.margin();
    const gridSize = this.gridSize();

    // Agrupar puntos por celda
    const grouped = new Map<string, RiskPoint[]>();
    points.forEach(p => {
      const key = `${p.probability}-${p.impact}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(p);
    });

    // Consolidar puntos por celda
    const result: (RiskPoint & { x: number; y: number })[] = [];
    grouped.forEach((cellPoints) => {
      const first = cellPoints[0];
      // Invertir Y para que probabilidad alta este arriba
      const row = gridSize - first.probability;
      const col = first.impact - 1;

      const x = margin.left + col * cellSize + cellSize / 2;
      const y = margin.top + row * cellSize + cellSize / 2;

      result.push({
        ...first,
        count: cellPoints.length,
        x,
        y
      });
    });

    return result;
  });

  // Estadisticas
  criticalCount = computed(() => {
    return this.riskPoints().filter(p => p.probability * p.impact >= 20).length;
  });

  highCount = computed(() => {
    return this.riskPoints().filter(p => {
      const score = p.probability * p.impact;
      return score >= 12 && score < 20;
    }).length;
  });

  mediumCount = computed(() => {
    return this.riskPoints().filter(p => {
      const score = p.probability * p.impact;
      return score >= 6 && score < 12;
    }).length;
  });

  // Methods
  getCellX(colIdx: number): number {
    return this.margin().left + colIdx * this.cellSize();
  }

  getCellY(rowIdx: number): number {
    return this.margin().top + rowIdx * this.cellSize();
  }

  getCellColor(rowIdx: number, colIdx: number): string {
    const colors = this.activePalette().colors;
    // Invertir fila para que colores criticos esten arriba-derecha
    const invertedRow = this.gridSize() - 1 - rowIdx;
    return colors[invertedRow]?.[colIdx] || '#gray';
  }

  getPointRadius(count: number): number {
    const baseRadius = Math.min(this.cellSize() / 4, 12);
    return Math.min(baseRadius + Math.log(count) * 2, this.cellSize() / 2.5);
  }

  onCellHover(row: number, col: number): void {
    this.hoveredCell.set({ row, col });
  }

  onCellLeave(): void {
    this.hoveredCell.set(null);
  }

  onCellClick(row: number, col: number): void {
    // Convertir coordenadas de grid a probabilidad/impacto
    const probability = this.gridSize() - row;
    const impact = col + 1;
    this.cellSelected.emit({ probability, impact });
  }

  onPointClick(point: RiskPoint, event: Event): void {
    event.stopPropagation();
    this.selectedPoint.set(point);
    this.pointSelected.emit(point);
  }
}
