import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  signal
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Datos de un KPI dentro de un objetivo
 */
export interface ObjectiveKpi {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  hasAlert?: boolean;
  alertSeverity?: 'critical' | 'warning' | 'info';
}

/**
 * Datos de un objetivo
 */
export interface ObjectiveData {
  id: string;
  name: string;
  description?: string;
  compliance: number; // 0-100
  trend?: 'up' | 'down' | 'stable';
  kpis: ObjectiveKpi[];
  alertsCount?: number;
}

@Component({
  selector: 'app-objective-progress',
  standalone: true,
  imports: [CommonModule, DecimalPipe, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="objective-progress-container">
      <!-- Header del objetivo -->
      <div
        class="objective-header"
        [class.expanded]="expanded()"
        [class.clickable]="expandable()"
        (click)="toggleExpand()">

        <div class="objective-info">
          <div class="objective-title-row">
            @if (expandable()) {
              <i class="pi expand-icon" [class.pi-chevron-down]="expanded()" [class.pi-chevron-right]="!expanded()"></i>
            }
            <span class="objective-name">{{ objective().name }}</span>
            @if (objective().alertsCount && objective().alertsCount! > 0) {
              <span class="alerts-badge" [pTooltip]="'Alertas activas'">
                {{ objective().alertsCount }}
              </span>
            }
          </div>
          @if (showDescription() && objective().description) {
            <span class="objective-description">{{ objective().description }}</span>
          }
        </div>

        <div class="objective-stats">
          <div class="progress-bar-container" [class]="progressColorClass()">
            <div
              class="progress-bar-fill"
              [style.width.%]="objective().compliance">
            </div>
          </div>
          <span class="compliance-value">{{ objective().compliance | number:'1.0-0' }}%</span>
          @if (objective().trend) {
            <i class="pi trend-icon"
               [class.pi-arrow-up]="objective().trend === 'up'"
               [class.pi-arrow-down]="objective().trend === 'down'"
               [class.pi-minus]="objective().trend === 'stable'"
               [class.trend-up]="objective().trend === 'up'"
               [class.trend-down]="objective().trend === 'down'">
            </i>
          }
        </div>
      </div>

      <!-- KPIs expandibles -->
      @if (expanded() && expandable()) {
        <div class="kpis-container" @slideDown>
          @for (kpi of objective().kpis; track kpi.id) {
            <div
              class="kpi-row"
              [class.has-alert]="kpi.hasAlert"
              [class.alert-critical]="kpi.alertSeverity === 'critical'"
              [class.alert-warning]="kpi.alertSeverity === 'warning'"
              (click)="onKpiClick(kpi, $event)">

              <div class="kpi-info">
                <span class="kpi-name">{{ kpi.name }}</span>
                <span class="kpi-values">
                  {{ kpi.currentValue | number:'1.0-1' }}{{ kpi.unit || '' }} / {{ kpi.targetValue | number:'1.0-1' }}{{ kpi.unit || '' }}
                </span>
              </div>

              <div class="kpi-progress">
                <div class="kpi-bar" [class]="getKpiProgressClass(kpi)">
                  <div
                    class="kpi-bar-fill"
                    [style.width.%]="getKpiCompliance(kpi)">
                  </div>
                </div>
                <span class="kpi-percent">{{ getKpiCompliance(kpi) | number:'1.0-0' }}%</span>
                @if (kpi.trend) {
                  <i class="pi trend-icon-sm"
                     [class.pi-arrow-up]="kpi.trend === 'up'"
                     [class.pi-arrow-down]="kpi.trend === 'down'"
                     [class.pi-minus]="kpi.trend === 'stable'"
                     [class.trend-up]="kpi.trend === 'up'"
                     [class.trend-down]="kpi.trend === 'down'">
                  </i>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .objective-progress-container {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--surface-300);
      }
    }

    .objective-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      gap: 1rem;
      transition: background 0.15s ease;

      &.clickable {
        cursor: pointer;

        &:hover {
          background: var(--surface-50);
        }
      }

      &.expanded {
        background: var(--surface-50);
        border-bottom: 1px solid var(--surface-200);
      }
    }

    .objective-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 0;
    }

    .objective-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .expand-icon {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      transition: transform 0.2s ease;
    }

    .objective-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .alerts-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 0.375rem;
      font-size: 0.6875rem;
      font-weight: 600;
      background: var(--red-500);
      color: var(--surface-0);
      border-radius: 9px;
    }

    .objective-description {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      padding-left: 1.25rem;
    }

    .objective-stats {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .progress-bar-container {
      width: 80px;
      height: 6px;
      background: var(--surface-200);
      border-radius: 3px;
      overflow: hidden;

      &.progress-excellent .progress-bar-fill { background: var(--green-500); }
      &.progress-good .progress-bar-fill { background: var(--primary-500); }
      &.progress-warning .progress-bar-fill { background: var(--yellow-500); }
      &.progress-danger .progress-bar-fill { background: var(--red-500); }
    }

    .progress-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .compliance-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      min-width: 40px;
      text-align: right;
    }

    .trend-icon {
      font-size: 0.75rem;
      color: var(--text-color-secondary);

      &.trend-up { color: var(--green-500); }
      &.trend-down { color: var(--red-500); }
    }

    .trend-icon-sm {
      font-size: 0.625rem;
      color: var(--text-color-secondary);

      &.trend-up { color: var(--green-500); }
      &.trend-down { color: var(--red-500); }
    }

    /* KPIs Container */
    .kpis-container {
      padding: 0.5rem;
      background: var(--surface-50);
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .kpi-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.625rem 0.75rem;
      background: var(--surface-card);
      border-radius: var(--border-radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        border-color: var(--surface-300);
      }

      &.has-alert {
        border-left: 3px solid;
      }

      &.alert-critical {
        border-left-color: var(--red-500);
      }

      &.alert-warning {
        border-left-color: var(--yellow-500);
      }
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      flex: 1;
      min-width: 0;
      padding-right: 1rem;
    }

    .kpi-name {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .kpi-values {
      font-size: 0.6875rem;
      color: var(--text-color-secondary);
    }

    .kpi-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .kpi-bar {
      width: 60px;
      height: 5px;
      background: var(--surface-200);
      border-radius: 2.5px;
      overflow: hidden;

      &.kpi-excellent .kpi-bar-fill { background: var(--green-500); }
      &.kpi-good .kpi-bar-fill { background: var(--primary-500); }
      &.kpi-warning .kpi-bar-fill { background: var(--yellow-500); }
      &.kpi-danger .kpi-bar-fill { background: var(--red-500); }
    }

    .kpi-bar-fill {
      height: 100%;
      border-radius: 2.5px;
      transition: width 0.3s ease;
    }

    .kpi-percent {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-color);
      min-width: 32px;
      text-align: right;
    }

    /* Dark mode */
    :host-context(.dark) {
      .objective-progress-container {
        background: var(--surface-900);
        border-color: var(--surface-700);

        &:hover {
          border-color: var(--surface-600);
        }
      }

      .objective-header {
        &.clickable:hover {
          background: var(--surface-800);
        }

        &.expanded {
          background: var(--surface-800);
          border-bottom-color: var(--surface-700);
        }
      }

      .progress-bar-container,
      .kpi-bar {
        background: var(--surface-700);
      }

      .kpis-container {
        background: var(--surface-800);
      }

      .kpi-row {
        background: var(--surface-900);

        &:hover {
          border-color: var(--surface-600);
        }
      }
    }
  `
})
export class ObjectiveProgressComponent {
  // Inputs
  objective = input.required<ObjectiveData>();
  expandable = input<boolean>(true);
  initialExpanded = input<boolean>(false);
  showDescription = input<boolean>(true);

  // Outputs
  objectiveClick = output<ObjectiveData>();
  kpiClick = output<ObjectiveKpi>();

  // Internal state
  expanded = signal(false);

  constructor() {
    // Set initial expanded state after input is resolved
    setTimeout(() => {
      this.expanded.set(this.initialExpanded());
    });
  }

  // Computed
  progressColorClass = computed(() => {
    const compliance = this.objective().compliance;
    if (compliance >= 90) return 'progress-excellent';
    if (compliance >= 75) return 'progress-good';
    if (compliance >= 50) return 'progress-warning';
    return 'progress-danger';
  });

  // Methods
  toggleExpand(): void {
    if (this.expandable()) {
      this.expanded.update(v => !v);
      this.objectiveClick.emit(this.objective());
    }
  }

  getKpiCompliance(kpi: ObjectiveKpi): number {
    if (kpi.targetValue === 0) return 0;
    return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
  }

  getKpiProgressClass(kpi: ObjectiveKpi): string {
    const compliance = this.getKpiCompliance(kpi);
    if (compliance >= 90) return 'kpi-excellent';
    if (compliance >= 75) return 'kpi-good';
    if (compliance >= 50) return 'kpi-warning';
    return 'kpi-danger';
  }

  onKpiClick(kpi: ObjectiveKpi, event: Event): void {
    event.stopPropagation();
    this.kpiClick.emit(kpi);
  }
}
