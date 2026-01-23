import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
  contentChild,
  TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

/**
 * Nivel de decision para filtrado contextual
 */
export type DecisionLevel = 'executive' | 'tactical' | 'operational' | 'analytical';

/**
 * Opciones del menu de la grafica
 */
export interface ChartMenuOption {
  label: string;
  icon: string;
  command: () => void;
}

/**
 * Configuracion de filtro
 */
export interface ChartFilter {
  key: string;
  label: string;
  options: { label: string; value: unknown }[];
  value?: unknown;
}

@Component({
  selector: 'app-chart-container',
  standalone: true,
  imports: [CommonModule, ButtonModule, SelectModule, TooltipModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-container" [class]="sizeClass()">
      <!-- Header -->
      <div class="chart-header">
        <div class="chart-title-section">
          @if (icon()) {
            <i [class]="icon()"></i>
          }
          <h3 class="chart-title">{{ title() }}</h3>
          @if (subtitle()) {
            <span class="chart-subtitle">{{ subtitle() }}</span>
          }
        </div>

        <div class="chart-controls">
          <!-- Filtros -->
          @for (filter of filters(); track filter.key) {
            <p-select
              [options]="filter.options"
              [ngModel]="filter.value"
              (ngModelChange)="onFilterChange(filter.key, $event)"
              [placeholder]="filter.label"
              [style]="{ width: '140px' }"
              styleClass="chart-filter-select"
              appendTo="body">
            </p-select>
          }

          <!-- Menu Options -->
          @if (menuOptions().length > 0) {
            <div class="chart-menu">
              @for (option of menuOptions(); track option.label) {
                <p-button
                  [icon]="option.icon"
                  [text]="true"
                  severity="secondary"
                  size="small"
                  [pTooltip]="option.label"
                  tooltipPosition="bottom"
                  (onClick)="option.command()">
                </p-button>
              }
            </div>
          }

          <!-- Acciones rapidas -->
          @if (showRefresh()) {
            <p-button
              icon="pi pi-refresh"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Actualizar"
              tooltipPosition="bottom"
              (onClick)="refresh.emit()">
            </p-button>
          }

          @if (showExpand()) {
            <p-button
              icon="pi pi-expand"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Expandir"
              tooltipPosition="bottom"
              (onClick)="expand.emit()">
            </p-button>
          }

          @if (showDownload()) {
            <p-button
              icon="pi pi-download"
              [text]="true"
              severity="secondary"
              size="small"
              pTooltip="Descargar"
              tooltipPosition="bottom"
              (onClick)="download.emit()">
            </p-button>
          }
        </div>
      </div>

      <!-- Hint/Info -->
      @if (hint()) {
        <div class="chart-hint">
          <i class="pi pi-info-circle"></i>
          <span>{{ hint() }}</span>
        </div>
      }

      <!-- Loading State -->
      @if (loading()) {
        <div class="chart-loading">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Cargando datos...</span>
        </div>
      } @else if (empty()) {
        <!-- Empty State -->
        <div class="chart-empty">
          <i class="pi pi-chart-bar"></i>
          <p>{{ emptyMessage() }}</p>
        </div>
      } @else {
        <!-- Chart Body -->
        <div class="chart-body" [style.height]="bodyHeight()">
          <ng-content></ng-content>
        </div>
      }

      <!-- Footer -->
      @if (footerTemplate()) {
        <div class="chart-footer">
          <ng-container *ngTemplateOutlet="footerTemplate()!"></ng-container>
        </div>
      }

      <!-- Decision Level Badge -->
      @if (decisionLevel()) {
        <div class="decision-level-badge" [class]="decisionLevelClass()">
          <i [class]="decisionLevelIcon()"></i>
          {{ decisionLevelLabel() }}
        </div>
      }
    </div>
  `,
  styles: `
    .chart-container {
      position: relative;
      background: var(--surface-card);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--surface-border);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      height: 100%;

      /* Size variants */
      &.size-small .chart-body { height: 180px; }
      &.size-medium .chart-body { height: 280px; }
      &.size-large .chart-body { height: 380px; }
      &.size-auto .chart-body { flex: 1; min-height: 200px; }
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .chart-title-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;

      > i {
        color: var(--primary-color);
        font-size: 1rem;
        flex-shrink: 0;
      }
    }

    .chart-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chart-subtitle {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      background: var(--surface-100);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .chart-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .chart-menu {
      display: flex;
      gap: 0.25rem;
      padding-left: 0.5rem;
      border-left: 1px solid var(--surface-border);
    }

    .chart-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      background: var(--blue-50);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      margin-bottom: 0.75rem;
      border-left: 3px solid var(--blue-400);

      i { color: var(--blue-500); }
    }

    .chart-body {
      flex: 1;
      width: 100%;
      position: relative;
      min-height: 200px;

      :host ::ng-deep {
        apx-chart, .apexcharts-canvas {
          width: 100% !important;
          height: 100% !important;
        }
      }
    }

    .chart-loading,
    .chart-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      min-height: 200px;
      color: var(--text-color-secondary);

      i {
        font-size: 2.5rem;
        margin-bottom: 0.75rem;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .chart-loading i {
      color: var(--primary-color);
      opacity: 1;
    }

    .chart-footer {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--surface-border);
    }

    .decision-level-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius-sm);
      opacity: 0.9;

      i { font-size: 0.625rem; }

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

    /* Filter select styling */
    :host ::ng-deep .chart-filter-select {
      .p-select {
        font-size: 0.8125rem;
        height: 32px;
      }
    }

    /* Dark mode */
    :host-context(.dark) {
      .chart-container {
        background: var(--surface-900);
        border-color: var(--surface-700);
      }

      .chart-subtitle {
        background: var(--surface-800);
      }

      .chart-menu {
        border-left-color: var(--surface-700);
      }

      .chart-hint {
        background: color-mix(in srgb, var(--blue-500) 15%, var(--surface-900));
        border-left-color: var(--blue-600);

        i { color: var(--blue-400); }
      }

      .chart-footer {
        border-top-color: var(--surface-700);
      }

      .decision-level-badge {
        &.level-executive { background: color-mix(in srgb, var(--blue-500) 20%, var(--surface-900)); }
        &.level-tactical { background: color-mix(in srgb, var(--green-500) 20%, var(--surface-900)); }
        &.level-operational { background: color-mix(in srgb, var(--orange-500) 20%, var(--surface-900)); }
        &.level-analytical { background: color-mix(in srgb, var(--purple-500) 20%, var(--surface-900)); }
      }
    }
  `
})
export class ChartContainerComponent {
  // Inputs
  title = input.required<string>();
  subtitle = input<string>('');
  icon = input<string>('');
  hint = input<string>('');
  size = input<'small' | 'medium' | 'large' | 'auto'>('medium');
  height = input<string>('');
  loading = input<boolean>(false);
  empty = input<boolean>(false);
  emptyMessage = input<string>('No hay datos para mostrar');
  filters = input<ChartFilter[]>([]);
  menuOptions = input<ChartMenuOption[]>([]);
  decisionLevel = input<DecisionLevel | ''>('');
  showRefresh = input<boolean>(false);
  showExpand = input<boolean>(false);
  showDownload = input<boolean>(false);

  // Content projection
  footerTemplate = contentChild<TemplateRef<unknown>>('footer');

  // Outputs
  refresh = output<void>();
  expand = output<void>();
  download = output<void>();
  filterChange = output<{ key: string; value: unknown }>();

  // Computed
  sizeClass = computed(() => `size-${this.size()}`);

  bodyHeight = computed(() => {
    if (this.height()) return this.height();
    return 'auto';
  });

  decisionLevelClass = computed(() => {
    const level = this.decisionLevel();
    return level ? `level-${level}` : '';
  });

  decisionLevelIcon = computed(() => {
    const icons: Record<string, string> = {
      executive: 'pi pi-briefcase',
      tactical: 'pi pi-chart-line',
      operational: 'pi pi-cog',
      analytical: 'pi pi-search'
    };
    return icons[this.decisionLevel()] || '';
  });

  decisionLevelLabel = computed(() => {
    const labels: Record<string, string> = {
      executive: 'Ejecutivo',
      tactical: 'Tactico',
      operational: 'Operativo',
      analytical: 'Analitico'
    };
    return labels[this.decisionLevel()] || '';
  });

  // Methods
  onFilterChange(key: string, value: unknown): void {
    this.filterChange.emit({ key, value });
  }
}
