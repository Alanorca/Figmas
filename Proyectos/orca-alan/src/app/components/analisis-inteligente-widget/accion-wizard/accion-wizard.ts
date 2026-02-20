// ============================================================================
// ACCION WIZARD COMPONENT
// ============================================================================
// Dialog modal de 3 pasos para crear entidades desde acciones sugeridas.
// Paso 1: Revision (datos pre-cargados)
// Paso 2: Campos adicionales (dinamicos por tipo de entidad)
// Paso 3: Confirmacion y creacion
// ============================================================================

import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { StepperModule } from 'primeng/stepper';
import { DividerModule } from 'primeng/divider';
import { AccionSugerida, TipoAccionEntidad } from '../../../models/analisis-inteligente.models';

// Interfaz para campos dinámicos
interface CampoDinamico {
  key: string;
  label: string;
  tipo: 'text' | 'select' | 'textarea' | 'number';
  opciones?: { label: string; value: string }[];
  valor: any;
  requerido: boolean;
  placeholder?: string;
}

@Component({
  selector: 'app-accion-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    TagModule,
    StepperModule,
    DividerModule
  ],
  template: `
    <p-dialog
      [visible]="visible"
      (onHide)="cerrarWizard()"
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      [style]="{ width: '580px', maxHeight: '85vh' }"
      [closable]="true"
      [closeOnEscape]="true"
      styleClass="accion-wizard-dialog"
    >
      <!-- ============================================================ -->
      <!-- HEADER -->
      <!-- ============================================================ -->
      <ng-template pTemplate="header">
        <div class="wizard-header">
          <div class="wizard-header-info">
            <i [class]="getTipoIcon()" class="wizard-header-icon"></i>
            <div>
              <h3 class="wizard-title">Crear {{ getTipoLabel() }}</h3>
              <span class="wizard-subtitle" *ngIf="accion">
                Basado en hallazgo IA
              </span>
            </div>
          </div>
          <p-tag
            *ngIf="accion"
            [value]="getPrioridadLabel()"
            [severity]="getPrioridadSeverity()"
            [rounded]="true"
          />
        </div>
      </ng-template>

      <!-- ============================================================ -->
      <!-- BODY: PASOS -->
      <!-- ============================================================ -->
      <div class="wizard-body" *ngIf="accion">

        <!-- INDICADOR DE PASOS -->
        <div class="wizard-steps-indicator">
          <div
            *ngFor="let paso of pasos; let i = index"
            class="step-item"
            [class.step-active]="pasoActual() === i"
            [class.step-completed]="pasoActual() > i"
            (click)="irAPaso(i)"
            (keydown.enter)="irAPaso(i)"
            role="button"
            tabindex="0"
            [attr.aria-label]="'Paso ' + (i + 1) + ': ' + paso.label"
          >
            <div class="step-circle">
              <i *ngIf="pasoActual() > i" class="pi pi-check"></i>
              <span *ngIf="pasoActual() <= i">{{ i + 1 }}</span>
            </div>
            <span class="step-label">{{ paso.label }}</span>
          </div>
        </div>

        <p-divider />

        <!-- ======================================================== -->
        <!-- PASO 1: REVISION -->
        <!-- ======================================================== -->
        <div class="wizard-step" *ngIf="pasoActual() === 0">
          <h4 class="step-title">Revise los datos generados</h4>
          <p class="step-description">
            Estos campos fueron pre-poblados por la IA. Puede editarlos antes de continuar.
          </p>

          <div class="form-group">
            <label for="accion-nombre" class="form-label">Nombre *</label>
            <input
              id="accion-nombre"
              pInputText
              type="text"
              [(ngModel)]="nombre"
              class="form-input"
              [style]="{ width: '100%' }"
              placeholder="Nombre de la entidad"
            />
          </div>

          <div class="form-group">
            <label for="accion-descripcion" class="form-label">Descripcion *</label>
            <textarea
              id="accion-descripcion"
              pInputTextarea
              [(ngModel)]="descripcion"
              [rows]="3"
              [autoResize]="true"
              class="form-input"
              [style]="{ width: '100%' }"
              placeholder="Descripcion detallada"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group form-half">
              <label for="accion-prioridad" class="form-label">Prioridad</label>
              <p-select
                id="accion-prioridad"
                [(ngModel)]="prioridad"
                [options]="opcionesPrioridad"
                optionLabel="label"
                optionValue="value"
                [style]="{ width: '100%' }"
                placeholder="Seleccionar prioridad"
              />
            </div>
            <div class="form-group form-half">
              <label class="form-label">Tipo de entidad</label>
              <div class="tipo-display">
                <i [class]="getTipoIcon()"></i>
                <span>{{ getTipoLabel() }}</span>
              </div>
            </div>
          </div>

          <div class="linked-insight" *ngIf="accion">
            <i class="pi pi-link"></i>
            <span>Vinculado al insight: <strong>{{ accion.insightOrigenId }}</strong></span>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- PASO 2: CAMPOS ADICIONALES (DINAMICOS POR TIPO) -->
        <!-- ======================================================== -->
        <div class="wizard-step" *ngIf="pasoActual() === 1">
          <h4 class="step-title">Campos adicionales</h4>
          <p class="step-description">
            Complete los campos especificos para {{ getTipoLabel() | lowercase }}.
          </p>

          <div
            class="form-group"
            *ngFor="let campo of camposDinamicos(); trackBy: trackByCampoKey"
          >
            <label [for]="'campo-' + campo.key" class="form-label">
              {{ campo.label }}
              <span *ngIf="campo.requerido" class="form-required">*</span>
            </label>

            <!-- Text input -->
            <input
              *ngIf="campo.tipo === 'text'"
              [id]="'campo-' + campo.key"
              pInputText
              type="text"
              [(ngModel)]="campo.valor"
              class="form-input"
              [style]="{ width: '100%' }"
              [placeholder]="campo.placeholder || ''"
            />

            <!-- Number input -->
            <input
              *ngIf="campo.tipo === 'number'"
              [id]="'campo-' + campo.key"
              pInputText
              type="number"
              [(ngModel)]="campo.valor"
              class="form-input"
              [style]="{ width: '100%' }"
              [placeholder]="campo.placeholder || ''"
            />

            <!-- Select -->
            <p-select
              *ngIf="campo.tipo === 'select'"
              [id]="'campo-' + campo.key"
              [(ngModel)]="campo.valor"
              [options]="campo.opciones || []"
              optionLabel="label"
              optionValue="value"
              [style]="{ width: '100%' }"
              [placeholder]="campo.placeholder || 'Seleccionar...'"
            />

            <!-- Textarea -->
            <textarea
              *ngIf="campo.tipo === 'textarea'"
              [id]="'campo-' + campo.key"
              pInputTextarea
              [(ngModel)]="campo.valor"
              [rows]="2"
              [autoResize]="true"
              class="form-input"
              [style]="{ width: '100%' }"
              [placeholder]="campo.placeholder || ''"
            ></textarea>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- PASO 3: CONFIRMACION -->
        <!-- ======================================================== -->
        <div class="wizard-step" *ngIf="pasoActual() === 2">
          <h4 class="step-title">Confirmar creacion</h4>
          <p class="step-description">
            Revise el resumen antes de crear la entidad.
          </p>

          <div class="confirm-card">
            <div class="confirm-header">
              <i [class]="getTipoIcon()" class="confirm-icon"></i>
              <div>
                <h5 class="confirm-nombre">{{ nombre }}</h5>
                <p-tag
                  [value]="getTipoLabel()"
                  severity="info"
                  [rounded]="true"
                  styleClass="confirm-tipo-tag"
                />
              </div>
            </div>

            <p-divider />

            <div class="confirm-field">
              <span class="confirm-label">Descripcion</span>
              <p class="confirm-value">{{ descripcion }}</p>
            </div>

            <div class="confirm-field">
              <span class="confirm-label">Prioridad</span>
              <p-tag
                [value]="getPrioridadLabel()"
                [severity]="getPrioridadSeverity()"
                [rounded]="true"
              />
            </div>

            <div
              class="confirm-field"
              *ngFor="let campo of camposDinamicos(); trackBy: trackByCampoKey"
            >
              <ng-container *ngIf="campo.valor">
                <span class="confirm-label">{{ campo.label }}</span>
                <span class="confirm-value-inline">{{ getValorDisplay(campo) }}</span>
              </ng-container>
            </div>

            <p-divider />

            <div class="confirm-insight-link">
              <i class="pi pi-sparkles"></i>
              <span>Generado por IA desde analisis inteligente</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- FOOTER: NAVEGACION -->
      <!-- ============================================================ -->
      <ng-template pTemplate="footer">
        <div class="wizard-footer">
          <button
            pButton
            label="Cancelar"
            icon="pi pi-times"
            class="p-button-text"
            (click)="cerrarWizard()"
          ></button>

          <div class="wizard-footer-right">
            <button
              *ngIf="pasoActual() > 0"
              pButton
              label="Anterior"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
              (click)="pasoAnterior()"
            ></button>

            <button
              *ngIf="pasoActual() < 2"
              pButton
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              (click)="siguientePaso()"
              [disabled]="!puedeAvanzar()"
            ></button>

            <button
              *ngIf="pasoActual() === 2"
              pButton
              label="Crear {{ getTipoLabel() }}"
              icon="pi pi-check"
              class="p-button-success"
              (click)="crearEntidad()"
              [loading]="creando()"
            ></button>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    /* ============================================================ */
    /* VARIABLES */
    /* ============================================================ */

    :host {
      --wiz-bg: #ffffff;
      --wiz-surface: #f8fafc;
      --wiz-border: #e2e8f0;
      --wiz-text: #1e293b;
      --wiz-text-secondary: #64748b;
      --wiz-text-muted: #94a3b8;
      --wiz-accent: #6366f1;
      --wiz-accent-bg: #eef2ff;
      --wiz-success: #16a34a;
      --wiz-success-bg: #f0fdf4;
    }

    :host-context(.dark) {
      --wiz-bg: #0f172a;
      --wiz-surface: #1e293b;
      --wiz-border: #334155;
      --wiz-text: #f1f5f9;
      --wiz-text-secondary: #94a3b8;
      --wiz-text-muted: #64748b;
      --wiz-accent: #818cf8;
      --wiz-accent-bg: #1e1b4b;
      --wiz-success: #4ade80;
      --wiz-success-bg: #052e16;
    }

    /* ============================================================ */
    /* HEADER */
    /* ============================================================ */

    .wizard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .wizard-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wizard-header-icon {
      font-size: 1.25rem;
      color: var(--wiz-accent);
    }

    .wizard-title {
      margin: 0;
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--wiz-text);
    }

    .wizard-subtitle {
      font-size: 0.75rem;
      color: var(--wiz-text-muted);
    }

    /* ============================================================ */
    /* STEPS INDICATOR */
    /* ============================================================ */

    .wizard-steps-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      padding: 4px 0;
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: opacity 0.2s ease;
    }

    .step-item:focus-visible {
      outline: 2px solid var(--wiz-accent);
      outline-offset: 4px;
      border-radius: 4px;
    }

    .step-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid var(--wiz-border);
      background: var(--wiz-bg);
      color: var(--wiz-text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .step-active .step-circle {
      border-color: var(--wiz-accent);
      background: var(--wiz-accent);
      color: #ffffff;
    }

    .step-completed .step-circle {
      border-color: var(--wiz-success);
      background: var(--wiz-success-bg);
      color: var(--wiz-success);
    }

    .step-label {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--wiz-text-muted);
    }

    .step-active .step-label {
      color: var(--wiz-text);
      font-weight: 600;
    }

    .step-completed .step-label {
      color: var(--wiz-success);
    }

    /* ============================================================ */
    /* WIZARD BODY / STEPS */
    /* ============================================================ */

    .wizard-body {
      min-height: 300px;
    }

    .wizard-step {
      padding: 4px 0;
    }

    .step-title {
      margin: 0 0 4px 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--wiz-text);
    }

    .step-description {
      margin: 0 0 16px 0;
      font-size: 0.8125rem;
      color: var(--wiz-text-secondary);
    }

    /* ============================================================ */
    /* FORM */
    /* ============================================================ */

    .form-group {
      margin-bottom: 14px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--wiz-text);
    }

    .form-required {
      color: #dc2626;
    }

    .form-input {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .form-half {
      flex: 1;
    }

    .tipo-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--wiz-accent-bg);
      border-radius: 6px;
      color: var(--wiz-accent);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .linked-insight {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 12px;
      background: var(--wiz-surface);
      border: 1px solid var(--wiz-border);
      border-radius: 6px;
      font-size: 0.75rem;
      color: var(--wiz-text-secondary);
    }

    .linked-insight i {
      color: var(--wiz-accent);
    }

    /* ============================================================ */
    /* CONFIRM CARD (PASO 3) */
    /* ============================================================ */

    .confirm-card {
      background: var(--wiz-surface);
      border: 1px solid var(--wiz-border);
      border-radius: 10px;
      padding: 16px;
    }

    .confirm-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .confirm-icon {
      font-size: 1.5rem;
      color: var(--wiz-accent);
    }

    .confirm-nombre {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--wiz-text);
    }

    :host ::ng-deep .confirm-tipo-tag {
      font-size: 0.6875rem !important;
    }

    .confirm-field {
      margin-bottom: 10px;
    }

    .confirm-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--wiz-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }

    .confirm-value {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--wiz-text-secondary);
      line-height: 1.5;
    }

    .confirm-value-inline {
      font-size: 0.8125rem;
      color: var(--wiz-text);
      font-weight: 500;
    }

    .confirm-insight-link {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--wiz-text-muted);
    }

    .confirm-insight-link i {
      color: var(--wiz-accent);
    }

    /* ============================================================ */
    /* FOOTER */
    /* ============================================================ */

    .wizard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .wizard-footer-right {
      display: flex;
      gap: 8px;
    }
  `]
})
export class AccionWizardComponent {
  // ==================== INPUTS / OUTPUTS ====================

  @Input() visible = false;
  @Input()
  set accion(value: AccionSugerida | null) {
    this._accion = value;
    if (value) {
      this.inicializarDesdeAccion(value);
    }
  }
  get accion(): AccionSugerida | null {
    return this._accion;
  }
  private _accion: AccionSugerida | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onCrear = new EventEmitter<{ accionId: string; entidadId: string }>();

  // ==================== STATE ====================

  pasoActual = signal(0);
  creando = signal(false);
  camposDinamicos = signal<CampoDinamico[]>([]);

  // Campos del paso 1
  nombre = '';
  descripcion = '';
  prioridad: 'alta' | 'media' | 'baja' = 'media';

  // Definicion de pasos
  readonly pasos = [
    { id: 'revision', label: 'Revision' },
    { id: 'campos', label: 'Campos' },
    { id: 'confirmar', label: 'Confirmar' }
  ];

  // Opciones
  readonly opcionesPrioridad = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  // ==================== INICIALIZACION ====================

  private inicializarDesdeAccion(accion: AccionSugerida): void {
    this.pasoActual.set(0);
    this.nombre = accion.datosPreCargados['nombre'] || accion.titulo;
    this.descripcion = accion.datosPreCargados['descripcion'] || accion.descripcion;
    this.prioridad = accion.prioridad;

    // Generar campos dinamicos segun tipo de entidad
    this.camposDinamicos.set(this.generarCamposPorTipo(accion.tipo, accion.datosPreCargados));
  }

  private generarCamposPorTipo(tipo: TipoAccionEntidad, datosPreCargados: Record<string, any>): CampoDinamico[] {
    switch (tipo) {
      case 'riesgo':
        return [
          {
            key: 'probabilidad', label: 'Probabilidad', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Muy Alta', value: 'muy_alta' },
              { label: 'Alta', value: 'alta' },
              { label: 'Media', value: 'media' },
              { label: 'Baja', value: 'baja' },
              { label: 'Muy Baja', value: 'muy_baja' }
            ],
            valor: datosPreCargados['probabilidad'] || null,
            placeholder: 'Seleccionar probabilidad'
          },
          {
            key: 'impacto', label: 'Impacto', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Catastrofico', value: 'catastrofico' },
              { label: 'Mayor', value: 'mayor' },
              { label: 'Moderado', value: 'moderado' },
              { label: 'Menor', value: 'menor' },
              { label: 'Insignificante', value: 'insignificante' }
            ],
            valor: datosPreCargados['impacto'] || null,
            placeholder: 'Seleccionar impacto'
          },
          {
            key: 'area', label: 'Area', tipo: 'text', requerido: false,
            valor: datosPreCargados['area'] || '',
            placeholder: 'Area responsable'
          },
          {
            key: 'activosAfectados', label: 'Activos afectados', tipo: 'textarea', requerido: false,
            valor: datosPreCargados['activosAfectados'] || '',
            placeholder: 'Lista de activos afectados'
          }
        ];

      case 'incidente':
        return [
          {
            key: 'severidad', label: 'Severidad', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Critica', value: 'critica' },
              { label: 'Alta', value: 'alta' },
              { label: 'Media', value: 'media' },
              { label: 'Baja', value: 'baja' }
            ],
            valor: datosPreCargados['severidad'] || null,
            placeholder: 'Seleccionar severidad'
          },
          {
            key: 'activosAfectados', label: 'Activos afectados', tipo: 'textarea', requerido: false,
            valor: datosPreCargados['activosAfectados'] || '',
            placeholder: 'Lista de activos afectados'
          },
          {
            key: 'reportador', label: 'Reportado por', tipo: 'text', requerido: false,
            valor: datosPreCargados['reportador'] || '',
            placeholder: 'Nombre del reportador'
          },
          {
            key: 'fechaDeteccion', label: 'Fecha de deteccion', tipo: 'text', requerido: false,
            valor: datosPreCargados['fechaDeteccion'] || new Date().toISOString().split('T')[0],
            placeholder: 'YYYY-MM-DD'
          }
        ];

      case 'control':
        return [
          {
            key: 'tipoControl', label: 'Tipo de control', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Preventivo', value: 'preventivo' },
              { label: 'Detectivo', value: 'detectivo' },
              { label: 'Correctivo', value: 'correctivo' },
              { label: 'Compensatorio', value: 'compensatorio' }
            ],
            valor: datosPreCargados['tipoControl'] || null,
            placeholder: 'Seleccionar tipo'
          },
          {
            key: 'frecuencia', label: 'Frecuencia de ejecucion', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Continuo', value: 'continuo' },
              { label: 'Diario', value: 'diario' },
              { label: 'Semanal', value: 'semanal' },
              { label: 'Mensual', value: 'mensual' },
              { label: 'Trimestral', value: 'trimestral' },
              { label: 'Anual', value: 'anual' }
            ],
            valor: datosPreCargados['frecuencia'] || null,
            placeholder: 'Seleccionar frecuencia'
          },
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datosPreCargados['responsable'] || '',
            placeholder: 'Persona o area responsable'
          },
          {
            key: 'costoEstimado', label: 'Costo estimado', tipo: 'number', requerido: false,
            valor: datosPreCargados['costoEstimado'] || null,
            placeholder: 'Costo en moneda local'
          }
        ];

      case 'mitigacion':
        return [
          {
            key: 'estrategia', label: 'Estrategia de mitigacion', tipo: 'select', requerido: true,
            opciones: [
              { label: 'Evitar', value: 'evitar' },
              { label: 'Transferir', value: 'transferir' },
              { label: 'Mitigar', value: 'mitigar' },
              { label: 'Aceptar', value: 'aceptar' }
            ],
            valor: datosPreCargados['estrategia'] || null,
            placeholder: 'Seleccionar estrategia'
          },
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datosPreCargados['responsable'] || '',
            placeholder: 'Persona responsable'
          },
          {
            key: 'fechaLimite', label: 'Fecha limite', tipo: 'text', requerido: false,
            valor: datosPreCargados['fechaLimite'] || '',
            placeholder: 'YYYY-MM-DD'
          }
        ];

      case 'oportunidad':
      case 'proyecto':
      case 'activo':
      default:
        return [
          {
            key: 'categoria', label: 'Categoria', tipo: 'text', requerido: false,
            valor: datosPreCargados['categoria'] || '',
            placeholder: 'Categoria de la entidad'
          },
          {
            key: 'responsable', label: 'Responsable', tipo: 'text', requerido: false,
            valor: datosPreCargados['responsable'] || '',
            placeholder: 'Persona responsable'
          },
          {
            key: 'notas', label: 'Notas adicionales', tipo: 'textarea', requerido: false,
            valor: datosPreCargados['notas'] || '',
            placeholder: 'Notas o comentarios adicionales'
          }
        ];
    }
  }

  // ==================== NAVEGACION ====================

  cerrarWizard(): void {
    this.pasoActual.set(0);
    this.onClose.emit();
  }

  irAPaso(paso: number): void {
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.set(this.pasoActual() - 1);
    }
  }

  siguientePaso(): void {
    if (this.puedeAvanzar() && this.pasoActual() < 2) {
      this.pasoActual.set(this.pasoActual() + 1);
    }
  }

  puedeAvanzar(): boolean {
    const paso = this.pasoActual();

    if (paso === 0) {
      return this.nombre.trim().length > 0 && this.descripcion.trim().length > 0;
    }

    if (paso === 1) {
      // Validar campos requeridos
      const campos = this.camposDinamicos();
      return campos
        .filter(c => c.requerido)
        .every(c => c.valor !== null && c.valor !== '' && c.valor !== undefined);
    }

    return true;
  }

  // ==================== CREAR ENTIDAD ====================

  async crearEntidad(): Promise<void> {
    if (!this.accion) return;

    this.creando.set(true);

    // Simular creacion de entidad (delay de red)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // Generar ID mock de la entidad creada
    const tipoPrefix = this.accion.tipo.toUpperCase().slice(0, 3);
    const entidadId = `${tipoPrefix}-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    this.creando.set(false);
    this.onCrear.emit({
      accionId: this.accion.id,
      entidadId
    });
  }

  // ==================== HELPERS ====================

  getTipoIcon(): string {
    if (!this.accion) return 'pi pi-circle';
    const icons: Record<TipoAccionEntidad, string> = {
      riesgo: 'pi pi-shield',
      incidente: 'pi pi-exclamation-triangle',
      control: 'pi pi-check-square',
      mitigacion: 'pi pi-sliders-h',
      oportunidad: 'pi pi-star',
      proyecto: 'pi pi-briefcase',
      activo: 'pi pi-box'
    };
    return icons[this.accion.tipo] || 'pi pi-circle';
  }

  getTipoLabel(): string {
    if (!this.accion) return 'Entidad';
    const labels: Record<TipoAccionEntidad, string> = {
      riesgo: 'Riesgo',
      incidente: 'Incidente',
      control: 'Control',
      mitigacion: 'Mitigacion',
      oportunidad: 'Oportunidad',
      proyecto: 'Proyecto',
      activo: 'Activo'
    };
    return labels[this.accion.tipo] || 'Entidad';
  }

  getPrioridadLabel(): string {
    const labels: Record<string, string> = {
      alta: 'Alta',
      media: 'Media',
      baja: 'Baja'
    };
    return labels[this.prioridad] || this.prioridad;
  }

  getPrioridadSeverity(): 'danger' | 'warn' | 'success' | 'info' | 'secondary' | 'contrast' | undefined {
    const map: Record<string, 'danger' | 'warn' | 'success'> = {
      alta: 'danger',
      media: 'warn',
      baja: 'success'
    };
    return map[this.prioridad] || 'secondary';
  }

  getValorDisplay(campo: CampoDinamico): string {
    if (campo.tipo === 'select' && campo.opciones) {
      const opcion = campo.opciones.find(o => o.value === campo.valor);
      return opcion?.label || String(campo.valor);
    }
    return String(campo.valor || '');
  }

  trackByCampoKey(_index: number, item: CampoDinamico): string {
    return item.key;
  }
}
