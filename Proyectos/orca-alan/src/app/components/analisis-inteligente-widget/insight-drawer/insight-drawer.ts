// ============================================================================
// INSIGHT DRAWER COMPONENT v2
// ============================================================================
// Panel lateral derecho (480px) con flujo de 2 pasos:
//   Paso 1 (summary): Resumen ejecutivo, hallazgos, comparativos, acciones
//   Paso 2 (action): Formulario pre-cargado con navegación a sección destino
// Sin modal — todo dentro del drawer. DSG-compliant (tokens PrimeNG).
// ============================================================================

import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import {
  ContenidoInsightDrawer,
  InsightIA,
  AccionSugerida,
  ComparativoBenchmark,
  SeveridadInsight,
  TipoAccionEntidad
} from '../../../models/analisis-inteligente.models';

// Ruta de creación por tipo de acción
const RUTAS_CREACION: Record<TipoAccionEntidad, string> = {
  riesgo: '/riesgos/crear',
  incidente: '/incidentes/crear',
  control: '/eventos/crear',
  mitigacion: '/riesgos/crear',
  oportunidad: '/eventos/crear',
  proyecto: '/proyectos/crear',
  activo: '/activos'
};

@Component({
  selector: 'app-insight-drawer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ChipModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    AutoCompleteModule,
    TooltipModule
  ],
  template: `
    <!-- Insight Drawer -->
    <p-drawer
      [visible]="visible"
      (onHide)="cerrarDrawer()"
      position="right"
      [modal]="false"
      [dismissible]="true"
      [showCloseIcon]="false"
      [style]="{ width: '480px' }"
      styleClass="insight-drawer"
    >
      <!-- ============================================================ -->
      <!-- HEADER -->
      <!-- ============================================================ -->
      <ng-template pTemplate="header">
        <div class="id-header">
          @if (drawerStep() === 'summary') {
            <div class="id-header-left">
              <i class="pi pi-sparkles id-header-icon"></i>
              <div>
                <h3 class="id-title">Insights IA</h3>
                @if (contenido?.fechaGeneracion) {
                  <span class="id-date">{{ formatearFecha(contenido!.fechaGeneracion) }}</span>
                }
              </div>
            </div>
          } @else {
            <div class="id-header-left">
              <button class="id-back-btn" (click)="volverAlResumen()" pTooltip="Regresar al resumen">
                <i class="pi pi-arrow-left"></i>
              </button>
              <div>
                <h3 class="id-title">Crear {{ getTipoLabel() }}</h3>
                <span class="id-date">Datos pre-cargados desde IA</span>
              </div>
            </div>
          }
          <button
            class="id-close-btn"
            (click)="cerrarDrawer()"
            aria-label="Cerrar"
            pTooltip="Cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </ng-template>

      <!-- ============================================================ -->
      <!-- PASO 1: SUMMARY -->
      <!-- ============================================================ -->
      @if (drawerStep() === 'summary' && contenido) {
        <div class="id-body">

          <!-- RESUMEN EJECUTIVO -->
          <section class="id-section">
            <h4 class="id-section-title">
              <i class="pi pi-file-edit"></i>
              Resumen Ejecutivo
            </h4>
            <p class="id-resumen-text">{{ contenido.resumenEjecutivo }}</p>
            <div class="id-meta-row">
              @if (contenido.fuentesAnalizadas.length > 0) {
                <div class="id-meta-item">
                  <i class="pi pi-database"></i>
                  <span>{{ contenido.fuentesAnalizadas.length }} fuentes</span>
                </div>
              }
              @if (contenido.periodoAnalisis) {
                <div class="id-meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ contenido.periodoAnalisis }}</span>
                </div>
              }
            </div>
            @if (contenido.fuentesAnalizadas.length > 0) {
              <div class="id-fuentes-chips">
                @for (fuente of contenido.fuentesAnalizadas; track fuente) {
                  <p-chip [label]="fuente" styleClass="id-fuente-chip" />
                }
              </div>
            }
          </section>

          <p-divider />

          <!-- HALLAZGOS -->
          <section class="id-section">
            <h4 class="id-section-title">
              <i class="pi pi-search"></i>
              Hallazgos
              <span class="id-count-badge">{{ contenido.hallazgos.length }}</span>
            </h4>

            @for (hallazgo of contenido.hallazgos; track hallazgo.id) {
              <div class="id-hallazgo" [class.id-hallazgo--accionado]="hallazgo.accionado">
                <div class="id-hallazgo-header">
                  <h5 class="id-hallazgo-titulo">{{ hallazgo.titulo }}</h5>
                  <div class="id-hallazgo-badges">
                    <p-tag
                      [value]="getSeveridadLabel(hallazgo.severidad)"
                      [severity]="getSeveridadSeverity(hallazgo.severidad)"
                      [rounded]="true"
                    />
                    @if (hallazgo.accionado) {
                      <span class="id-accionado-badge">
                        <i class="pi pi-check-circle"></i> Accionado
                      </span>
                    }
                  </div>
                </div>
                <p class="id-hallazgo-desc">{{ hallazgo.descripcion }}</p>
                <div class="id-hallazgo-stat">
                  <i class="pi pi-chart-bar"></i>
                  <span>{{ hallazgo.datoEstadistico }}</span>
                </div>
              </div>
            }
          </section>

          <p-divider />

          <!-- COMPARATIVA BENCHMARK -->
          @if (contenido.comparativos.length > 0) {
            <section class="id-section">
              <h4 class="id-section-title">
                <i class="pi pi-chart-line"></i>
                Comparativa
              </h4>
              <div class="id-comparativos-grid">
                @for (comp of contenido.comparativos; track comp.tipo) {
                  <div class="id-comp"
                    [class.id-comp--up]="comp.direccion === 'up'"
                    [class.id-comp--down]="comp.direccion === 'down'"
                    [class.id-comp--stable]="comp.direccion === 'stable'">
                    <div class="id-comp-header">
                      <span class="id-comp-tipo">{{ comp.tipo }}</span>
                      <span class="id-comp-etiqueta">{{ comp.etiqueta }}</span>
                    </div>
                    <div class="id-comp-value">
                      <i class="pi"
                        [class.pi-arrow-up]="comp.direccion === 'up'"
                        [class.pi-arrow-down]="comp.direccion === 'down'"
                        [class.pi-minus]="comp.direccion === 'stable'"></i>
                      <span class="id-comp-pct">
                        {{ comp.porcentajeCambio > 0 ? '+' : '' }}{{ comp.porcentajeCambio }}%
                      </span>
                    </div>
                    <div class="id-comp-detail">
                      {{ comp.valorAnterior }} &rarr; {{ comp.valorActual }}
                    </div>
                  </div>
                }
              </div>
            </section>
            <p-divider />
          }

          <!-- ACCIONES SUGERIDAS -->
          <section class="id-section">
            <h4 class="id-section-title">
              <i class="pi pi-bolt"></i>
              Acciones Sugeridas
              <span class="id-count-badge">{{ getAccionesVisibles().length }}</span>
            </h4>

            @for (accion of getAccionesVisibles(); track accion.id) {
              <div
                class="id-accion"
                [class.id-accion--ejecutada]="accion.ejecutada"
                (click)="seleccionarAccion(accion)"
                (keydown.enter)="seleccionarAccion(accion)"
                role="button"
                tabindex="0"
                [attr.aria-label]="'Accion: ' + accion.titulo">
                <div class="id-accion-icon">
                  <i [class]="getAccionIcon(accion.tipo)"></i>
                </div>
                <div class="id-accion-content">
                  <h5 class="id-accion-titulo">
                    {{ accion.titulo }}
                    @if (accion.ejecutada) {
                      <i class="pi pi-check-circle id-accion-done-icon"></i>
                    }
                  </h5>
                  <p class="id-accion-desc">{{ accion.descripcion }}</p>
                </div>
                @if (!accion.ejecutada) {
                  <div class="id-accion-arrow">
                    <i class="pi pi-chevron-right"></i>
                  </div>
                }
              </div>
            }

            @if (contenido.acciones.length > maxAccionesVisibles) {
              <p-button
                [label]="mostrarTodasAcciones() ? 'Ver menos' : 'Ver mas acciones'"
                icon="pi pi-list"
                [text]="true"
                size="small"
                styleClass="id-ver-mas-btn"
                (onClick)="toggleVerMasAcciones()">
              </p-button>
            }
          </section>
        </div>
      }

      <!-- ============================================================ -->
      <!-- PASO 2: FORMULARIO DE ACCION -->
      <!-- ============================================================ -->
      @if (drawerStep() === 'action' && selectedAction()) {
        <div class="id-body">

          <!-- Banner informativo -->
          <div class="id-prefill-banner">
            <i class="pi pi-info-circle"></i>
            <span>Datos pre-cargados desde el analisis inteligente. Revisa y edita antes de continuar.</span>
          </div>

          <!-- Tipo de entidad -->
          <div class="id-tipo-display">
            <i [class]="getAccionIcon(selectedAction()!.tipo)"></i>
            <span>{{ getTipoLabel() }}</span>
            <p-tag
              [value]="getPrioridadLabel()"
              [severity]="getPrioridadSeverity()"
              [rounded]="true"
              size="small"
            />
          </div>

          <!-- Formulario -->
          <div class="id-form">
            <!-- Nombre -->
            <div class="id-form-group">
              <label class="id-form-label">Nombre</label>
              <input pInputText [(ngModel)]="formNombre" [style]="{ width: '100%' }" placeholder="Nombre de la entidad" />
            </div>

            <!-- Descripcion -->
            <div class="id-form-group">
              <label class="id-form-label">Descripcion</label>
              <textarea pInputTextarea [(ngModel)]="formDescripcion" [rows]="3" [autoResize]="true" [style]="{ width: '100%' }" placeholder="Descripcion"></textarea>
            </div>

            <!-- Prioridad -->
            <div class="id-form-group">
              <label class="id-form-label">Prioridad</label>
              <p-select
                [(ngModel)]="formPrioridad"
                [options]="opcionesPrioridad"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar prioridad"
                [style]="{ width: '100%' }">
              </p-select>
            </div>

            <!-- Area (dropdown) -->
            <div class="id-form-group">
              <label class="id-form-label">Area</label>
              <p-select
                [(ngModel)]="formArea"
                [options]="areaOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar area"
                [style]="{ width: '100%' }"
                [showClear]="true">
              </p-select>
            </div>

            <!-- Activos Afectados (chips via AutoComplete multiple) -->
            <div class="id-form-group">
              <label class="id-form-label">Activos Afectados</label>
              <p-autoComplete
                [(ngModel)]="formActivosAfectados"
                [suggestions]="activosSugeridos"
                (completeMethod)="buscarActivos($event)"
                [multiple]="true"
                placeholder="Buscar activo..."
                styleClass="id-activos-autocomplete">
              </p-autoComplete>
              <span class="id-form-hint">Escribe para buscar o presiona Enter para agregar.</span>
            </div>

            <!-- Campos dinamicos por tipo -->
            @for (campo of camposDinamicos(); track campo.key) {
              <div class="id-form-group">
                <label class="id-form-label">
                  {{ campo.label }}
                  @if (campo.requerido) { <span class="id-form-required">*</span> }
                </label>
                @if (campo.tipo === 'text') {
                  <input pInputText [(ngModel)]="campo.valor" [style]="{ width: '100%' }" [placeholder]="campo.placeholder || ''" />
                }
                @if (campo.tipo === 'number') {
                  <input pInputText type="number" [(ngModel)]="campo.valor" [style]="{ width: '100%' }" [placeholder]="campo.placeholder || ''" />
                }
                @if (campo.tipo === 'select') {
                  <p-select
                    [(ngModel)]="campo.valor"
                    [options]="campo.opciones || []"
                    optionLabel="label"
                    optionValue="value"
                    [style]="{ width: '100%' }"
                    [placeholder]="campo.placeholder || 'Seleccionar...'">
                  </p-select>
                }
                @if (campo.tipo === 'textarea') {
                  <textarea pInputTextarea [(ngModel)]="campo.valor" [rows]="2" [autoResize]="true" [style]="{ width: '100%' }" [placeholder]="campo.placeholder || ''"></textarea>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- EMPTY STATE -->
      @if (!contenido && drawerStep() === 'summary') {
        <div class="id-empty">
          <i class="pi pi-sparkles id-empty-icon"></i>
          <p>Generando insights...</p>
        </div>
      }

      <!-- ============================================================ -->
      <!-- FOOTER -->
      <!-- ============================================================ -->
      <ng-template pTemplate="footer">
        @if (drawerStep() === 'action') {
          <div class="id-footer">
            <p-button
              label="Cancelar"
              icon="pi pi-arrow-left"
              [text]="true"
              severity="secondary"
              (onClick)="volverAlResumen()">
            </p-button>
            <p-button
              [label]="'Ir a crear ' + getTipoLabel()"
              icon="pi pi-external-link"
              iconPos="right"
              (onClick)="navegarACreacion()">
            </p-button>
          </div>
        }
      </ng-template>
    </p-drawer>
  `,
  styles: [`
    /* ============================================================ */
    /* Uses PrimeNG design tokens for DSG compliance               */
    /* ============================================================ */

    /* HEADER */
    .id-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .id-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .id-header-icon {
      font-size: 1.25rem;
      color: var(--primary-color);
    }
    .id-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.3;
    }
    .id-date {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }
    .id-back-btn, .id-close-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 8px;
      background: var(--surface-100);
      color: var(--text-color);
      cursor: pointer;
      transition: background 0.2s;
    }
    .id-back-btn:hover, .id-close-btn:hover {
      background: var(--surface-200);
    }
    .id-close-btn {
      background: transparent;
      color: var(--text-color-secondary);
    }

    /* BODY */
    .id-body {
      padding: 0 4px;
      overflow-y: auto;
    }
    .id-section {
      margin-bottom: 8px;
    }
    .id-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-color);
    }
    .id-section-title i {
      color: var(--primary-color);
      font-size: 1rem;
    }

    /* COUNT BADGE */
    .id-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      background: var(--primary-50);
      color: var(--primary-color);
      font-size: 0.6875rem;
      font-weight: 600;
    }

    /* RESUMEN */
    .id-resumen-text {
      margin: 0 0 12px 0;
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--text-color-secondary);
    }
    .id-meta-row {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
    }
    .id-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }
    .id-meta-item i { font-size: 0.75rem; }
    .id-fuentes-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    :host ::ng-deep .id-fuente-chip {
      font-size: 0.6875rem !important;
    }

    /* HALLAZGOS */
    .id-hallazgo {
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 10px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .id-hallazgo:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 10%, transparent);
    }
    .id-hallazgo--accionado { opacity: 0.7; }
    .id-hallazgo-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .id-hallazgo-titulo {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
      flex: 1;
    }
    .id-hallazgo-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .id-accionado-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.6875rem;
      color: var(--green-600);
      background: var(--green-50);
      padding: 2px 8px;
      border-radius: 12px;
      font-weight: 500;
    }
    .id-hallazgo-desc {
      margin: 0 0 8px 0;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: var(--text-color-secondary);
    }
    .id-hallazgo-stat {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: var(--primary-color);
      font-weight: 500;
    }
    .id-hallazgo-stat i { font-size: 0.75rem; }

    /* COMPARATIVOS */
    .id-comparativos-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .id-comp {
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .id-comp-header { margin-bottom: 8px; }
    .id-comp-tipo {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-color);
    }
    .id-comp-etiqueta {
      display: block;
      font-size: 0.625rem;
      color: var(--text-color-secondary);
      margin-top: 2px;
    }
    .id-comp-value {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-bottom: 4px;
    }
    .id-comp-pct {
      font-size: 1.125rem;
      font-weight: 700;
    }
    .id-comp--up .id-comp-value i, .id-comp--up .id-comp-pct { color: var(--green-500); }
    .id-comp--down .id-comp-value i, .id-comp--down .id-comp-pct { color: var(--red-500); }
    .id-comp--stable .id-comp-value i, .id-comp--stable .id-comp-pct { color: var(--text-color-secondary); }
    .id-comp-detail {
      font-size: 0.6875rem;
      color: var(--text-color-secondary);
    }

    /* ACCIONES */
    .id-accion {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
    }
    .id-accion:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--primary-color) 10%, transparent);
    }
    .id-accion:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    .id-accion--ejecutada {
      opacity: 0.6;
      cursor: default;
    }
    .id-accion--ejecutada:hover {
      border-color: var(--surface-border);
      box-shadow: none;
    }
    .id-accion-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--primary-50);
      color: var(--primary-color);
      flex-shrink: 0;
    }
    .id-accion-icon i { font-size: 1rem; }
    .id-accion-content { flex: 1; min-width: 0; }
    .id-accion-titulo {
      margin: 0 0 2px 0;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .id-accion-done-icon {
      color: var(--green-500);
      font-size: 0.75rem;
    }
    .id-accion-desc {
      margin: 0;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .id-accion-arrow {
      color: var(--text-color-secondary);
      flex-shrink: 0;
    }
    :host ::ng-deep .id-ver-mas-btn { width: 100%; margin-top: 4px; }

    /* EMPTY */
    .id-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-color-secondary);
      text-align: center;
    }
    .id-empty-icon {
      font-size: 2rem;
      margin-bottom: 12px;
      color: var(--primary-color);
      animation: id-pulse 1.5s ease-in-out infinite;
    }
    @keyframes id-pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    .id-empty p { margin: 0; font-size: 0.875rem; }

    /* ============================================================ */
    /* PASO 2: FORMULARIO DE ACCION                                */
    /* ============================================================ */

    .id-prefill-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      background: var(--blue-50);
      border: 1px solid var(--blue-200);
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--blue-700);
      margin-bottom: 16px;
    }
    .id-prefill-banner i {
      color: var(--blue-500);
      margin-top: 2px;
    }

    .id-tipo-display {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: var(--primary-50);
      border-radius: 8px;
      color: var(--primary-color);
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .id-tipo-display i { font-size: 1.125rem; }

    .id-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .id-form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .id-form-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-color);
    }
    .id-form-required { color: var(--red-500); }
    .id-form-hint {
      font-size: 0.6875rem;
      color: var(--text-color-secondary);
    }

    :host ::ng-deep .id-activos-autocomplete {
      width: 100%;
    }
    :host ::ng-deep .id-activos-autocomplete .p-autocomplete-multiple-container {
      width: 100%;
    }

    /* FOOTER */
    .id-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  `]
})
export class InsightDrawerComponent {
  private router = inject(Router);

  @Input() visible = false;
  @Input() contenido: ContenidoInsightDrawer | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onAccionEjecutada = new EventEmitter<{ accionId: string; entidadId: string }>();

  // Drawer step flow
  drawerStep = signal<'summary' | 'action'>('summary');
  selectedAction = signal<AccionSugerida | null>(null);
  mostrarTodasAcciones = signal(false);

  readonly maxAccionesVisibles = 4;

  // Form fields (step 2)
  formNombre = '';
  formDescripcion = '';
  formPrioridad: 'alta' | 'media' | 'baja' = 'media';
  formArea = '';
  formActivosAfectados: string[] = [];
  camposDinamicos = signal<{ key: string; label: string; tipo: 'text' | 'select' | 'textarea' | 'number'; opciones?: { label: string; value: string }[]; valor: any; requerido: boolean; placeholder?: string }[]>([]);

  // Activos autocomplete
  activosSugeridos: string[] = [];
  private todosActivos = [
    'Servidor Principal', 'Base de Datos', 'Red Corporativa', 'Portal Web',
    'ERP', 'CRM', 'Correo Electronico', 'VPN', 'Firewall', 'Active Directory',
    'Sistema de Backup', 'Data Center', 'Servidores Cloud', 'API Gateway'
  ];

  // Options
  readonly opcionesPrioridad = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  readonly areaOptions = [
    { label: 'Tecnologia de la Informacion', value: 'TI' },
    { label: 'Operaciones', value: 'operaciones' },
    { label: 'Finanzas', value: 'finanzas' },
    { label: 'Recursos Humanos', value: 'rrhh' },
    { label: 'Legal', value: 'legal' },
    { label: 'Cumplimiento', value: 'cumplimiento' },
    { label: 'Seguridad', value: 'seguridad' },
    { label: 'Comercial', value: 'comercial' },
    { label: 'Direccion General', value: 'direccion' }
  ];

  // ==================== DRAWER CONTROL ====================

  cerrarDrawer(): void {
    this.drawerStep.set('summary');
    this.selectedAction.set(null);
    this.onClose.emit();
  }

  volverAlResumen(): void {
    this.drawerStep.set('summary');
    this.selectedAction.set(null);
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ==================== HALLAZGOS ====================

  getSeveridadLabel(severidad: SeveridadInsight): string {
    const labels: Record<SeveridadInsight, string> = {
      critica: 'Critica', alta: 'Alta', media: 'Media', baja: 'Baja'
    };
    return labels[severidad] || severidad;
  }

  getSeveridadSeverity(severidad: SeveridadInsight): 'danger' | 'warn' | 'success' | 'secondary' {
    const map: Record<SeveridadInsight, 'danger' | 'warn' | 'success' | 'secondary'> = {
      critica: 'danger', alta: 'warn', media: 'warn', baja: 'success'
    };
    return map[severidad] || 'secondary';
  }

  // ==================== ACCIONES ====================

  getAccionesVisibles(): AccionSugerida[] {
    if (!this.contenido) return [];
    return this.mostrarTodasAcciones()
      ? this.contenido.acciones
      : this.contenido.acciones.slice(0, this.maxAccionesVisibles);
  }

  toggleVerMasAcciones(): void {
    this.mostrarTodasAcciones.set(!this.mostrarTodasAcciones());
  }

  getAccionIcon(tipo: TipoAccionEntidad): string {
    const icons: Record<TipoAccionEntidad, string> = {
      riesgo: 'pi pi-shield',
      incidente: 'pi pi-exclamation-triangle',
      control: 'pi pi-check-square',
      mitigacion: 'pi pi-sliders-h',
      oportunidad: 'pi pi-star',
      proyecto: 'pi pi-briefcase',
      activo: 'pi pi-box'
    };
    return icons[tipo] || 'pi pi-circle';
  }

  // ==================== STEP 2: SELECCIONAR ACCION ====================

  seleccionarAccion(accion: AccionSugerida): void {
    if (accion.ejecutada) return;

    this.selectedAction.set(accion);
    this.formNombre = accion.datosPreCargados['nombre'] || accion.titulo;
    this.formDescripcion = accion.datosPreCargados['descripcion'] || accion.descripcion;
    this.formPrioridad = accion.prioridad;
    this.formArea = accion.datosPreCargados['area'] || '';
    this.formActivosAfectados = this.parseActivos(accion.datosPreCargados['activosAfectados']);
    this.camposDinamicos.set(this.generarCamposPorTipo(accion.tipo, accion.datosPreCargados));
    this.drawerStep.set('action');
  }

  private parseActivos(valor: any): string[] {
    if (Array.isArray(valor)) return valor;
    if (typeof valor === 'string' && valor.trim()) {
      return valor.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  }

  // ==================== ACTIVOS AUTOCOMPLETE ====================

  buscarActivos(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.activosSugeridos = this.todosActivos
      .filter(a => a.toLowerCase().includes(query))
      .filter(a => !this.formActivosAfectados.includes(a));
  }

  // ==================== NAVIGATION ====================

  navegarACreacion(): void {
    const accion = this.selectedAction();
    if (!accion) return;

    const payload: Record<string, any> = {
      nombre: this.formNombre,
      descripcion: this.formDescripcion,
      prioridad: this.formPrioridad,
      area: this.formArea,
      activosAfectados: this.formActivosAfectados,
      insightOrigenId: accion.insightOrigenId,
      origenAnalisis: true
    };

    // Add dynamic fields
    for (const campo of this.camposDinamicos()) {
      if (campo.valor !== null && campo.valor !== '') {
        payload[campo.key] = campo.valor;
      }
    }

    const ruta = RUTAS_CREACION[accion.tipo] || '/eventos/crear';

    // Mark action as executed
    this.onAccionEjecutada.emit({
      accionId: accion.id,
      entidadId: `PREFILL-${Date.now()}`
    });

    // Close drawer and navigate
    this.onClose.emit();

    this.router.navigate([ruta], {
      queryParams: { source: 'widget-analisis' },
      state: { prefill: payload, source: 'widget-analisis' }
    });
  }

  // ==================== HELPERS ====================

  getTipoLabel(): string {
    const accion = this.selectedAction();
    if (!accion) return 'Entidad';
    const labels: Record<TipoAccionEntidad, string> = {
      riesgo: 'Riesgo', incidente: 'Incidente', control: 'Control',
      mitigacion: 'Mitigacion', oportunidad: 'Oportunidad',
      proyecto: 'Proyecto', activo: 'Activo'
    };
    return labels[accion.tipo] || 'Entidad';
  }

  getPrioridadLabel(): string {
    const labels: Record<string, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };
    return labels[this.formPrioridad] || this.formPrioridad;
  }

  getPrioridadSeverity(): 'danger' | 'warn' | 'success' {
    const map: Record<string, 'danger' | 'warn' | 'success'> = {
      alta: 'danger', media: 'warn', baja: 'success'
    };
    return map[this.formPrioridad] || 'warn';
  }

  // ==================== DYNAMIC FIELDS ====================

  private generarCamposPorTipo(tipo: TipoAccionEntidad, datos: Record<string, any>): { key: string; label: string; tipo: 'text' | 'select' | 'textarea' | 'number'; opciones?: { label: string; value: string }[]; valor: any; requerido: boolean; placeholder?: string }[] {
    switch (tipo) {
      case 'riesgo':
        return [
          {
            key: 'probabilidad', label: 'Probabilidad', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Muy Alta', value: 'muy_alta' }, { label: 'Alta', value: 'alta' },
              { label: 'Media', value: 'media' }, { label: 'Baja', value: 'baja' },
              { label: 'Muy Baja', value: 'muy_baja' }
            ],
            valor: datos['probabilidad'] || null, placeholder: 'Seleccionar'
          },
          {
            key: 'impacto', label: 'Impacto', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Catastrofico', value: 'catastrofico' }, { label: 'Mayor', value: 'mayor' },
              { label: 'Moderado', value: 'moderado' }, { label: 'Menor', value: 'menor' },
              { label: 'Insignificante', value: 'insignificante' }
            ],
            valor: datos['impacto'] || null, placeholder: 'Seleccionar'
          }
        ];
      case 'incidente':
        return [
          {
            key: 'severidad', label: 'Severidad', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Critica', value: 'critica' }, { label: 'Alta', value: 'alta' },
              { label: 'Media', value: 'media' }, { label: 'Baja', value: 'baja' }
            ],
            valor: datos['severidad'] || null, placeholder: 'Seleccionar'
          },
          {
            key: 'reportador', label: 'Reportado por', tipo: 'text', requerido: false,
            valor: datos['reportador'] || '', placeholder: 'Nombre del reportador'
          }
        ];
      case 'control':
        return [
          {
            key: 'tipoControl', label: 'Tipo de control', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Preventivo', value: 'preventivo' }, { label: 'Detectivo', value: 'detectivo' },
              { label: 'Correctivo', value: 'correctivo' }, { label: 'Compensatorio', value: 'compensatorio' }
            ],
            valor: datos['tipoControl'] || null, placeholder: 'Seleccionar'
          },
          {
            key: 'frecuencia', label: 'Frecuencia', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Continuo', value: 'continuo' }, { label: 'Diario', value: 'diario' },
              { label: 'Semanal', value: 'semanal' }, { label: 'Mensual', value: 'mensual' },
              { label: 'Trimestral', value: 'trimestral' }, { label: 'Anual', value: 'anual' }
            ],
            valor: datos['frecuencia'] || null, placeholder: 'Seleccionar'
          },
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datos['responsable'] || '', placeholder: 'Persona o area'
          }
        ];
      case 'mitigacion':
        return [
          {
            key: 'estrategia', label: 'Estrategia', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Evitar', value: 'evitar' }, { label: 'Transferir', value: 'transferir' },
              { label: 'Mitigar', value: 'mitigar' }, { label: 'Aceptar', value: 'aceptar' }
            ],
            valor: datos['estrategia'] || null, placeholder: 'Seleccionar'
          },
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datos['responsable'] || '', placeholder: 'Persona responsable'
          },
          {
            key: 'fechaLimite', label: 'Fecha limite', tipo: 'text', requerido: false,
            valor: datos['fechaLimite'] || '', placeholder: 'YYYY-MM-DD'
          }
        ];
      default:
        return [
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datos['responsable'] || '', placeholder: 'Persona responsable'
          },
          {
            key: 'notas', label: 'Notas adicionales', tipo: 'textarea', requerido: false,
            valor: datos['notas'] || '', placeholder: 'Notas o comentarios'
          }
        ];
    }
  }
}
