import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Tipos de variantes visuales para la KPI Card
 */
export type KpiCardVariant = 'default' | 'compact' | 'minimal' | 'hero';

/**
 * Tipos de tendencia
 */
export type KpiTrend = 'up' | 'down' | 'stable';

/**
 * Configuracion de la KPI Card
 */
export interface KpiCardConfig {
  id: string;
  title: string;
  value: number;
  unit?: string;
  previousValue?: number;
  percentChange?: number;
  trend?: KpiTrend;
  target?: number;
  targetLabel?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  decisionLevel?: 'executive' | 'tactical' | 'operational' | 'analytical';
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="kpi-card"
      [class]="variantClass()"
      [class.clickable]="clickable()"
      [class.selected]="selected()"
      [class]="cardColorClass()"
      (click)="onClick()">

      <!-- Header -->
      <div class="kpi-header">
        <div class="kpi-title-section">
          @if (config().icon) {
            <div class="kpi-icon" [class]="colorClass()">
              <i [class]="config().icon"></i>
            </div>
          }
          <span class="kpi-title">{{ config().title }}</span>
        </div>

        @if (showTrend() && config().percentChange !== undefined) {
          <div class="kpi-trend" [class]="trendClass()">
            <i [class]="trendIcon()"></i>
            <span>{{ config().percentChange! > 0 ? '+' : '' }}{{ config().percentChange! | number:'1.1-1' }}%</span>
          </div>
        }
      </div>

      <!-- Value -->
      <div class="kpi-value-section">
        <span class="kpi-value" [class]="valueColorClass()">
          {{ config().value | number:'1.0-1' }}
        </span>
        @if (config().unit) {
          <span class="kpi-unit">{{ config().unit }}</span>
        }
      </div>

      <!-- Meta / Target Progress -->
      @if (config().target && variant() !== 'minimal') {
        <div class="kpi-target">
          <div class="target-bar">
            <div
              class="target-fill"
              [class]="progressColorClass()"
              [style.width.%]="progressPercent()">
            </div>
          </div>
          <span class="target-label">
            {{ config().targetLabel || 'Meta' }}: {{ config().target | number:'1.0-1' }}{{ config().unit }}
          </span>
        </div>
      }

      <!-- Previous Value / Comparison -->
      @if (config().previousValue !== undefined && variant() !== 'minimal') {
        <span class="kpi-comparison">
          vs {{ config().previousValue | number:'1.0-1' }}{{ config().unit }} periodo anterior
        </span>
      }

      <!-- Decision Level Badge -->
      @if (showDecisionLevel() && config().decisionLevel) {
        <div class="kpi-decision-badge" [class]="decisionLevelClass()">
          {{ decisionLevelLabel() }}
        </div>
      }

      <!-- Drill indicator -->
      @if (clickable()) {
        <i class="pi pi-chevron-right drill-indicator"></i>
      }
    </div>
  `,
  styles: `
    .kpi-card {
      position: relative;
      background: var(--surface-card);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--surface-border);
      padding: 1.25rem;
      transition: all 0.2s ease;

      &.clickable {
        cursor: pointer;

        &:hover {
          border-color: var(--primary-color);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);

          .drill-indicator {
            opacity: 1;
            transform: translateX(4px);
          }
        }
      }

      &.selected {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 5%, var(--surface-card));
      }

      /* Variants */
      &.variant-compact {
        padding: 1rem;

        .kpi-value { font-size: 1.5rem; }
        .kpi-title { font-size: 0.8125rem; }
      }

      &.variant-minimal {
        padding: 0.875rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .kpi-header { margin-bottom: 0; }
        .kpi-value-section { margin-bottom: 0; }
        .kpi-value { font-size: 1.25rem; }
      }

      &.variant-hero {
        padding: 1.5rem;
        text-align: center;

        .kpi-header { justify-content: center; }
        .kpi-value { font-size: 3rem; }
        .kpi-icon { width: 48px; height: 48px; }
        .kpi-icon i { font-size: 1.5rem; }
      }

      /* Card color backgrounds */
      &.card-primary {
        background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
        border-color: var(--primary-200);

        .kpi-icon {
          background: var(--primary-100);
          i { color: var(--primary-600); }
        }
        .kpi-value { color: var(--primary-700); }
      }

      &.card-success {
        background: linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%);
        border-color: var(--green-200);

        .kpi-icon {
          background: var(--green-100);
          i { color: var(--green-600); }
        }
        .kpi-value { color: var(--green-700); }
      }

      &.card-warning {
        background: linear-gradient(135deg, var(--yellow-50) 0%, var(--yellow-100) 100%);
        border-color: var(--yellow-200);

        .kpi-icon {
          background: var(--yellow-100);
          i { color: var(--yellow-600); }
        }
        .kpi-value { color: var(--yellow-700); }
      }

      &.card-danger {
        background: linear-gradient(135deg, var(--red-50) 0%, var(--red-100) 100%);
        border-color: var(--red-200);

        .kpi-icon {
          background: var(--red-100);
          i { color: var(--red-600); }
        }
        .kpi-value { color: var(--red-700); }
      }

      &.card-info {
        background: linear-gradient(135deg, var(--blue-50) 0%, var(--blue-100) 100%);
        border-color: var(--blue-200);

        .kpi-icon {
          background: var(--blue-100);
          i { color: var(--blue-600); }
        }
        .kpi-value { color: var(--blue-700); }
      }
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .kpi-title-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-md);
      background: var(--surface-100);

      i {
        font-size: 1rem;
        color: var(--text-color-secondary);
      }

      &.color-primary {
        background: var(--primary-50);
        i { color: var(--primary-500); }
      }

      &.color-success {
        background: var(--green-50);
        i { color: var(--green-500); }
      }

      &.color-warning {
        background: var(--yellow-50);
        i { color: var(--yellow-500); }
      }

      &.color-danger {
        background: var(--red-50);
        i { color: var(--red-500); }
      }

      &.color-info {
        background: var(--blue-50);
        i { color: var(--blue-500); }
      }
    }

    .kpi-title {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      font-weight: 500;
    }

    .kpi-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-md);

      i { font-size: 0.625rem; }

      &.trend-up {
        background: var(--green-50);
        color: var(--green-600);
      }

      &.trend-down {
        background: var(--red-50);
        color: var(--red-600);
      }

      &.trend-stable {
        background: var(--surface-100);
        color: var(--text-color-secondary);
      }
    }

    .kpi-value-section {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    .kpi-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-color);
      line-height: 1;

      &.value-success { color: var(--green-500); }
      &.value-warning { color: var(--yellow-600); }
      &.value-danger { color: var(--red-500); }
    }

    .kpi-unit {
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-color-secondary);
    }

    .kpi-target {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .target-bar {
      width: 100%;
      height: 4px;
      background: var(--surface-200);
      border-radius: 2px;
      overflow: hidden;
    }

    .target-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.3s ease;

      &.progress-success { background: var(--green-500); }
      &.progress-warning { background: var(--yellow-500); }
      &.progress-danger { background: var(--red-500); }
      &.progress-primary { background: var(--primary-color); }
    }

    .target-label {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .kpi-comparison {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .kpi-decision-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);

      &.level-executive {
        background: var(--blue-50);
        color: var(--blue-600);
      }

      &.level-tactical {
        background: var(--green-50);
        color: var(--green-600);
      }

      &.level-operational {
        background: var(--orange-50);
        color: var(--orange-600);
      }

      &.level-analytical {
        background: var(--purple-50);
        color: var(--purple-600);
      }
    }

    .drill-indicator {
      position: absolute;
      top: 50%;
      right: 1rem;
      transform: translateY(-50%);
      font-size: 1rem;
      color: var(--primary-color);
      opacity: 0;
      transition: all 0.2s ease;
    }

    /* Dark mode */
    :host-context(.dark) {
      .kpi-card {
        background: var(--surface-900);
        border-color: var(--surface-700);

        &.selected {
          background: color-mix(in srgb, var(--primary-color) 10%, var(--surface-900));
        }

        /* Card color backgrounds in dark mode */
        &.card-primary {
          background: linear-gradient(135deg, color-mix(in srgb, var(--primary-500) 12%, var(--surface-900)) 0%, color-mix(in srgb, var(--primary-500) 8%, var(--surface-900)) 100%);
          border-color: color-mix(in srgb, var(--primary-500) 25%, var(--surface-800));
          .kpi-value { color: var(--primary-400); }
        }

        &.card-success {
          background: linear-gradient(135deg, color-mix(in srgb, var(--green-500) 12%, var(--surface-900)) 0%, color-mix(in srgb, var(--green-500) 8%, var(--surface-900)) 100%);
          border-color: color-mix(in srgb, var(--green-500) 25%, var(--surface-800));
          .kpi-value { color: var(--green-400); }
        }

        &.card-warning {
          background: linear-gradient(135deg, color-mix(in srgb, var(--yellow-500) 12%, var(--surface-900)) 0%, color-mix(in srgb, var(--yellow-500) 8%, var(--surface-900)) 100%);
          border-color: color-mix(in srgb, var(--yellow-500) 25%, var(--surface-800));
          .kpi-value { color: var(--yellow-400); }
        }

        &.card-danger {
          background: linear-gradient(135deg, color-mix(in srgb, var(--red-500) 12%, var(--surface-900)) 0%, color-mix(in srgb, var(--red-500) 8%, var(--surface-900)) 100%);
          border-color: color-mix(in srgb, var(--red-500) 25%, var(--surface-800));
          .kpi-value { color: var(--red-400); }
        }

        &.card-info {
          background: linear-gradient(135deg, color-mix(in srgb, var(--blue-500) 12%, var(--surface-900)) 0%, color-mix(in srgb, var(--blue-500) 8%, var(--surface-900)) 100%);
          border-color: color-mix(in srgb, var(--blue-500) 25%, var(--surface-800));
          .kpi-value { color: var(--blue-400); }
        }
      }

      .kpi-icon {
        background: var(--surface-800);

        &.color-primary { background: color-mix(in srgb, var(--primary-500) 15%, var(--surface-900)); }
        &.color-success { background: color-mix(in srgb, var(--green-500) 15%, var(--surface-900)); }
        &.color-warning { background: color-mix(in srgb, var(--yellow-500) 15%, var(--surface-900)); }
        &.color-danger { background: color-mix(in srgb, var(--red-500) 15%, var(--surface-900)); }
        &.color-info { background: color-mix(in srgb, var(--blue-500) 15%, var(--surface-900)); }
      }

      .kpi-trend {
        &.trend-up { background: color-mix(in srgb, var(--green-500) 15%, var(--surface-900)); }
        &.trend-down { background: color-mix(in srgb, var(--red-500) 15%, var(--surface-900)); }
        &.trend-stable { background: var(--surface-800); }
      }

      .target-bar {
        background: var(--surface-700);
      }

      .kpi-decision-badge {
        &.level-executive { background: color-mix(in srgb, var(--blue-500) 15%, var(--surface-900)); }
        &.level-tactical { background: color-mix(in srgb, var(--green-500) 15%, var(--surface-900)); }
        &.level-operational { background: color-mix(in srgb, var(--orange-500) 15%, var(--surface-900)); }
        &.level-analytical { background: color-mix(in srgb, var(--purple-500) 15%, var(--surface-900)); }
      }
    }
  `
})
export class KpiCardComponent {
  // Inputs
  config = input.required<KpiCardConfig>();
  variant = input<KpiCardVariant>('default');
  clickable = input<boolean>(false);
  selected = input<boolean>(false);
  showTrend = input<boolean>(true);
  showDecisionLevel = input<boolean>(false);

  // Outputs
  cardClick = output<KpiCardConfig>();

  // Computed
  variantClass = computed(() => `variant-${this.variant()}`);

  colorClass = computed(() => {
    const color = this.config().color;
    return color ? `color-${color}` : '';
  });

  cardColorClass = computed(() => {
    const color = this.config().color;
    return color ? `card-${color}` : '';
  });

  trendClass = computed(() => {
    const trend = this.config().trend || this.computedTrend();
    return `trend-${trend}`;
  });

  trendIcon = computed(() => {
    const trend = this.config().trend || this.computedTrend();
    switch (trend) {
      case 'up': return 'pi pi-arrow-up';
      case 'down': return 'pi pi-arrow-down';
      default: return 'pi pi-minus';
    }
  });

  valueColorClass = computed(() => {
    const cfg = this.config();
    if (!cfg.target) return '';

    const percent = (cfg.value / cfg.target) * 100;
    if (percent >= 90) return 'value-success';
    if (percent >= 70) return 'value-warning';
    return 'value-danger';
  });

  progressColorClass = computed(() => {
    const cfg = this.config();
    if (!cfg.target) return 'progress-primary';

    const percent = (cfg.value / cfg.target) * 100;
    if (percent >= 90) return 'progress-success';
    if (percent >= 70) return 'progress-warning';
    return 'progress-danger';
  });

  progressPercent = computed(() => {
    const cfg = this.config();
    if (!cfg.target) return 0;
    return Math.min((cfg.value / cfg.target) * 100, 100);
  });

  decisionLevelClass = computed(() => {
    const level = this.config().decisionLevel;
    return level ? `level-${level}` : '';
  });

  decisionLevelLabel = computed(() => {
    const labels: Record<string, string> = {
      executive: 'Ejecutivo',
      tactical: 'Tactico',
      operational: 'Operativo',
      analytical: 'Analitico'
    };
    return labels[this.config().decisionLevel || ''] || '';
  });

  private computedTrend(): KpiTrend {
    const change = this.config().percentChange;
    if (change === undefined) return 'stable';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'stable';
  }

  onClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.config());
    }
  }
}
