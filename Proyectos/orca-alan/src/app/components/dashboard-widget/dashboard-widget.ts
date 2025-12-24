// ============================================================================
// DASHBOARD WIDGET COMPONENT
// ============================================================================
// Componente base para renderizar widgets del dashboard
// Soporta diferentes tipos de widget con contenido dinámico
// ============================================================================

import { Component, Input, Output, EventEmitter, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { DashboardWidget, TipoWidget } from '../../models/dashboard.models';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, MenuModule],
  template: `
    <div class="widget-container"
         [class.widget-selected]="isSelected()"
         [class.widget-editing]="modoEdicion()">

      <!-- Header del Widget -->
      @if (widget.config.showHeader !== false) {
        <div class="widget-header">
          <div class="widget-header-left">
            @if (modoEdicion()) {
              <span class="drag-handle" pTooltip="Arrastrar">
                <i class="pi pi-ellipsis-v"></i>
                <i class="pi pi-ellipsis-v"></i>
              </span>
            }
            @if (widget.icono) {
              <i [class]="widget.icono + ' widget-icon'"></i>
            }
            <div class="widget-titles">
              <span class="widget-title">{{ widget.titulo }}</span>
              @if (widget.subtitulo) {
                <span class="widget-subtitle">{{ widget.subtitulo }}</span>
              }
            </div>
          </div>

          <div class="widget-header-right">
            @if (widget.isLoading) {
              <i class="pi pi-spin pi-spinner"></i>
            }

            @if (modoEdicion()) {
              <p-button
                icon="pi pi-ellipsis-h"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="menu.toggle($event)"
                pTooltip="Opciones">
              </p-button>
              <p-menu #menu [model]="menuItems()" [popup]="true" appendTo="body"></p-menu>
            } @else if (widget.config.showActions) {
              <p-button
                icon="pi pi-external-link"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="onDrilldown.emit(widget)"
                pTooltip="Ver detalle">
              </p-button>
            }
          </div>
        </div>
      }

      <!-- Contenido del Widget -->
      <div class="widget-content" [class.no-header]="widget.config.showHeader === false">
        @if (widget.hasError) {
          <div class="widget-error">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ widget.errorMessage || 'Error cargando datos' }}</span>
            <p-button label="Reintentar" size="small" [text]="true" (onClick)="onRefresh.emit(widget)"></p-button>
          </div>
        } @else {
          <!-- El contenido se proyecta desde el padre -->
          <ng-content></ng-content>
        }
      </div>

      <!-- Indicadores de Resize (solo en modo edición) -->
      @if (modoEdicion()) {
        <div class="resize-handles">
          <div class="resize-handle resize-se"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all var(--transition-duration) var(--transition-timing);
    }

    .widget-container:hover {
      border-color: var(--surface-300);
    }

    .widget-container.widget-selected {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    .widget-container.widget-editing {
      cursor: move;
    }

    // Header
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--surface-100);
      background: var(--surface-50);
      min-height: 48px;
    }

    .widget-header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      min-width: 0;
    }

    .drag-handle {
      display: flex;
      gap: 1px;
      cursor: grab;
      padding: 0.25rem;
      color: var(--surface-400);
      opacity: 0.5;
      transition: opacity 0.15s;

      &:hover {
        opacity: 1;
        color: var(--surface-600);
      }

      &:active {
        cursor: grabbing;
      }

      i {
        font-size: 0.625rem;
      }
    }

    .widget-icon {
      font-size: 1rem;
      color: var(--primary-color);
    }

    .widget-titles {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .widget-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .widget-subtitle {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .widget-header-right {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    // Content
    .widget-content {
      flex: 1;
      padding: 1rem;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: 0;

      &.no-header {
        padding-top: 1rem;
      }

      // Para contenido que necesita scroll (listas, tablas)
      &.scrollable {
        overflow: auto;
      }
    }

    .widget-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 0.75rem;
      color: var(--text-color-secondary);
      text-align: center;

      i {
        font-size: 2rem;
        color: var(--red-400);
      }
    }

    // Resize handles
    .resize-handles {
      position: absolute;
      bottom: 0;
      right: 0;
      pointer-events: none;
    }

    .resize-handle {
      position: absolute;
      background: transparent;

      &.resize-se {
        bottom: 2px;
        right: 2px;
        width: 12px;
        height: 12px;
        cursor: se-resize;
        pointer-events: auto;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 10px 10px;
          border-color: transparent transparent var(--surface-300) transparent;
        }
      }
    }

    .widget-editing .resize-handle.resize-se::after {
      border-color: transparent transparent var(--primary-400) transparent;
    }
  `]
})
export class DashboardWidgetComponent {
  private dashboardService = inject(DashboardService);

  @Input({ required: true }) widget!: DashboardWidget;
  @Output() onEdit = new EventEmitter<DashboardWidget>();
  @Output() onRemove = new EventEmitter<DashboardWidget>();
  @Output() onDuplicate = new EventEmitter<DashboardWidget>();
  @Output() onDrilldown = new EventEmitter<DashboardWidget>();
  @Output() onRefresh = new EventEmitter<DashboardWidget>();

  modoEdicion = this.dashboardService.modoEdicion;

  isSelected = computed(() => {
    return this.dashboardService.widgetSeleccionado()?.id === this.widget.id;
  });

  menuItems = computed<MenuItem[]>(() => [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => this.onEdit.emit(this.widget),
      visible: this.widget.canEdit !== false
    },
    {
      label: 'Duplicar',
      icon: 'pi pi-copy',
      command: () => this.onDuplicate.emit(this.widget)
    },
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'p-menuitem-danger',
      command: () => this.onRemove.emit(this.widget),
      visible: this.widget.canRemove !== false
    }
  ]);
}
