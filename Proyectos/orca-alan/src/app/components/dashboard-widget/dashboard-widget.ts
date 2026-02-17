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

            <!-- Botón de configurar widget (siempre visible) -->
            @if (widget.canEdit !== false) {
              <p-button
                icon="pi pi-cog"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="onEdit.emit(widget)"
                pTooltip="Configurar widget">
              </p-button>
            }

            @if (modoEdicion()) {
              <!-- Menú de opciones en modo edición -->
              <p-button
                icon="pi pi-ellipsis-h"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="menu.toggle($event)"
                pTooltip="Opciones">
              </p-button>
              <p-menu #menu [model]="menuItems()" [popup]="true" appendTo="body"></p-menu>
            } @else {
              <!-- Acciones adicionales fuera de modo edición -->
              <p-button
                icon="pi pi-download"
                [rounded]="true"
                [text]="true"
                size="small"
                (onClick)="onExport.emit(widget)"
                pTooltip="Descargar">
              </p-button>
              @if (widget.config.showActions) {
                <p-button
                  icon="pi pi-external-link"
                  [rounded]="true"
                  [text]="true"
                  size="small"
                  (onClick)="onDrilldown.emit(widget)"
                  pTooltip="Ver detalle">
                </p-button>
              }
            }
          </div>
        </div>
      }

      <!-- Barra de edición para widgets sin header (solo en modo edición) -->
      @if (widget.config.showHeader === false && modoEdicion()) {
        <div class="floating-edit-bar drag-handle">
          <div class="drag-grip">
            <i class="pi pi-ellipsis-v"></i>
            <i class="pi pi-ellipsis-v"></i>
          </div>
          <div class="floating-edit-actions">
            <p-button
              icon="pi pi-ellipsis-h"
              [rounded]="true"
              [text]="true"
              size="small"
              severity="secondary"
              (onClick)="floatingMenu.toggle($event)"
              pTooltip="Opciones">
            </p-button>
            <p-menu #floatingMenu [model]="menuItems()" [popup]="true" appendTo="body"></p-menu>
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
    :host {
      display: block;
      height: 100%;
      background: transparent;
    }

    .widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      transition: all var(--transition-duration) var(--transition-timing);
      position: relative;
    }

    // Dark mode - asegurar que no haya bordes claros visibles
    :host-context(:root.dark-mode) .widget-container,
    :host-context([data-theme="dark"]) .widget-container {
      border-color: var(--surface-700);
      background: var(--surface-800);
    }

    .widget-container:hover {
      border-color: var(--surface-400);
    }

    :host-context(:root.dark-mode) .widget-container:hover,
    :host-context([data-theme="dark"]) .widget-container:hover {
      border-color: var(--surface-600);
    }

    .widget-container.widget-selected {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px var(--primary-100);
    }

    :host-context(:root.dark-mode) .widget-container.widget-selected,
    :host-context([data-theme="dark"]) .widget-container.widget-selected {
      box-shadow: 0 0 0 2px rgba(var(--primary-500-rgb), 0.2);
    }

    .widget-container.widget-editing {
      cursor: move;
    }

    // Header - sin fondo, minimalista
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);
      background: transparent;
      min-height: 44px;
    }

    .widget-header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex: 1;
      min-width: 0;
    }

    .drag-handle {
      display: flex;
      gap: 1px;
      cursor: grab;
      padding: var(--spacing-1);
      color: var(--text-color-secondary);
      opacity: 0.5;
      transition: opacity var(--transition-duration) var(--transition-timing);

      &:hover {
        opacity: 1;
        color: var(--text-color);
      }

      &:active {
        cursor: grabbing;
      }

      i {
        font-size: var(--font-size-2xs);
      }
    }

    .widget-icon {
      font-size: var(--font-size-base);
      color: var(--text-color-secondary);
    }

    .widget-titles {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .widget-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }

    .widget-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
    }

    .widget-header-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);

      // Iconos de acción unificados
      :host ::ng-deep .p-button {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        transition: all 0.2s ease;

        .p-button-icon,
        .pi {
          font-size: 0.75rem;
          color: var(--text-color-secondary);
          transition: color 0.2s ease;
        }

        &:hover {
          background: var(--surface-100);

          .p-button-icon,
          .pi {
            color: var(--text-color);
          }
        }
      }
    }

    // Dark mode para header-right
    :host-context(:root.dark-mode) .widget-header-right,
    :host-context([data-theme="dark"]) .widget-header-right {
      :host ::ng-deep .p-button:hover {
        background: var(--surface-700);
      }
    }

    // Content
    .widget-content {
      flex: 1;
      padding: var(--spacing-4);
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: 0;

      &.no-header {
        padding-top: var(--spacing-4);
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
      gap: var(--spacing-3);
      color: var(--text-color-secondary);
      text-align: center;

      i {
        font-size: var(--font-size-4xl);
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

    // Barra de edición para widgets sin header (modo edición)
    .floating-edit-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-1) var(--spacing-3);
      background: var(--surface-100);
      border-bottom: 1px solid var(--surface-border);
      cursor: grab;
      min-height: 32px;
      z-index: 10;

      &:active {
        cursor: grabbing;
      }

      .drag-grip {
        display: flex;
        gap: 1px;
        color: var(--text-color-secondary);
        opacity: 0.5;

        i {
          font-size: var(--font-size-2xs);
        }
      }

      .floating-edit-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
      }
    }

    :host-context(:root.dark-mode) .floating-edit-bar,
    :host-context([data-theme="dark"]) .floating-edit-bar {
      background: var(--surface-700);
      border-bottom-color: var(--surface-600);
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
  @Output() onExport = new EventEmitter<DashboardWidget>();

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
    {
      label: 'Descargar',
      icon: 'pi pi-download',
      command: () => this.onExport.emit(this.widget)
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
