import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { EditorModule } from 'primeng/editor';
import { MessageService, MenuItem } from 'primeng/api';

// Interfaces
interface NotificationRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  eventoTipo: string;
  activo: boolean;
  notificarCreador: boolean;
  notificarResponsable: boolean;
  notificarAprobadores: boolean;
  rolesDestino: string[];
  usuariosDestino: string[];
  enviarInApp: boolean;
  enviarEmail: boolean;
  plantillaMensaje?: string;
  severidad: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-notificacion-regla-nueva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    StepsModule,
    CardModule,
    DividerModule,
    InputNumberModule,
    MultiSelectModule,
    EditorModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="wizard-container">
      <!-- Header -->
      <div class="wizard-header">
        <div class="header-left">
          <p-button
            icon="pi pi-arrow-left"
            [text]="true"
            [rounded]="true"
            (onClick)="volver()"
            pTooltip="Volver"
          />
          <div class="header-title">
            <h1>{{ modoEdicion ? 'Editar Regla de Evento' : 'Nueva Regla de Evento' }}</h1>
            <p>Configure los parámetros de la regla de notificación</p>
          </div>
        </div>
        <div class="header-right">
          <p-button
            label="Guardar Regla"
            icon="pi pi-check"
            severity="success"
            (onClick)="guardarRegla()"
            [disabled]="!formularioValido()"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="wizard-main">
        <!-- Multi-Step Form -->
        <div class="wizard-form-panel full-width">
          <!-- Steps -->
          <div class="steps-container">
            <p-steps [model]="stepsItems" [activeIndex]="pasoActual()" [readonly]="false" (activeIndexChange)="cambiarPaso($event)" />
          </div>

          <!-- Form Content -->
          <div class="form-content">
            <!-- Paso 1: Información Básica -->
            @if (pasoActual() === 0) {
              <div class="step-content">
                <h2><i class="pi pi-info-circle"></i> Información Básica</h2>
                <p class="step-description">Define el nombre y descripción de la regla</p>

                <div class="form-grid">
                  <div class="form-field full-width">
                    <label for="nombre">Nombre de la Regla *</label>
                    <input
                      pInputText
                      id="nombre"
                      [(ngModel)]="reglaForm.nombre"
                      placeholder="Ej: Notificar nuevo activo creado"
                      class="input-lg"
                    />
                  </div>

                  <div class="form-field full-width">
                    <label for="descripcion">Descripción</label>
                    <textarea
                      pTextarea
                      id="descripcion"
                      [(ngModel)]="reglaForm.descripcion"
                      rows="3"
                      placeholder="Describe el propósito de esta regla..."
                    ></textarea>
                  </div>

                  <div class="form-field full-width">
                    <label for="severidad">Severidad *</label>
                    <p-select
                      id="severidad"
                      [(ngModel)]="reglaForm.severidad"
                      [options]="opcionesSeveridad"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccionar severidad"
                      styleClass="w-full"
                    />
                  </div>
                </div>
              </div>
            }

            <!-- Paso 2: Trigger -->
            @if (pasoActual() === 1) {
              <div class="step-content">
                <h2><i class="pi pi-bolt"></i> Trigger (Disparador)</h2>
                <p class="step-description">Define qué evento activará esta notificación</p>

                <div class="form-grid">
                  <div class="form-field full-width">
                    <label for="entidad">Tipo de Entidad *</label>
                    <p-select
                      id="entidad"
                      [(ngModel)]="reglaForm.entidadTipo"
                      [options]="opcionesEntidad"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccionar entidad"
                      styleClass="w-full"
                    />
                    <small class="hint">¿Sobre qué tipo de elemento se activará?</small>
                  </div>

                  <div class="form-field full-width">
                    <label for="evento">Tipo de Evento *</label>
                    <p-select
                      id="evento"
                      [(ngModel)]="reglaForm.eventoTipo"
                      [options]="opcionesEvento"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Seleccionar evento"
                      styleClass="w-full"
                    />
                    <small class="hint">¿Qué acción activará la notificación?</small>
                  </div>
                </div>

                <div class="trigger-preview">
                  <div class="preview-card">
                    <i class="pi pi-megaphone"></i>
                    <span>
                      @if (reglaForm.entidadTipo && reglaForm.eventoTipo) {
                        Cuando se realice <strong>{{ getEventoLabel(reglaForm.eventoTipo) }}</strong>
                        en <strong>{{ getEntidadLabel(reglaForm.entidadTipo) }}</strong>
                      } @else {
                        Selecciona entidad y evento para ver el trigger
                      }
                    </span>
                  </div>
                </div>
              </div>
            }

            <!-- Paso 3: Destinatarios -->
            @if (pasoActual() === 2) {
              <div class="step-content">
                <h2><i class="pi pi-users"></i> Destinatarios</h2>
                <p class="step-description">Define quién recibirá las notificaciones</p>

                <div class="destinatarios-section">
                  <h4>Destinatarios Automáticos</h4>
                  <p class="section-hint">Basados en la relación con la entidad</p>

                  <div class="checkbox-cards">
                    <div
                      class="checkbox-card"
                      [class.selected]="reglaForm.notificarCreador"
                      (click)="reglaForm.notificarCreador = !reglaForm.notificarCreador"
                    >
                      <p-checkbox [(ngModel)]="reglaForm.notificarCreador" [binary]="true" />
                      <div class="card-content">
                        <i class="pi pi-user"></i>
                        <span class="card-title">Creador</span>
                        <span class="card-desc">Quien creó la entidad</span>
                      </div>
                    </div>

                    <div
                      class="checkbox-card"
                      [class.selected]="reglaForm.notificarResponsable"
                      (click)="reglaForm.notificarResponsable = !reglaForm.notificarResponsable"
                    >
                      <p-checkbox [(ngModel)]="reglaForm.notificarResponsable" [binary]="true" />
                      <div class="card-content">
                        <i class="pi pi-user-edit"></i>
                        <span class="card-title">Responsable</span>
                        <span class="card-desc">Asignado como responsable</span>
                      </div>
                    </div>

                    <div
                      class="checkbox-card"
                      [class.selected]="reglaForm.notificarAprobadores"
                      (click)="reglaForm.notificarAprobadores = !reglaForm.notificarAprobadores"
                    >
                      <p-checkbox [(ngModel)]="reglaForm.notificarAprobadores" [binary]="true" />
                      <div class="card-content">
                        <i class="pi pi-users"></i>
                        <span class="card-title">Aprobadores</span>
                        <span class="card-desc">Pendientes de aprobar</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p-divider />

                <div class="destinatarios-section">
                  <h4>Destinatarios por Rol</h4>
                  <p class="section-hint">Selecciona roles específicos</p>

                  <p-multiSelect
                    [(ngModel)]="reglaForm.rolesDestino"
                    [options]="opcionesRoles"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccionar roles..."
                    styleClass="w-full"
                    display="chip"
                  />
                </div>
              </div>
            }

            <!-- Paso 4: Canales y Mensaje -->
            @if (pasoActual() === 3) {
              <div class="step-content">
                <h2><i class="pi pi-send"></i> Canales y Mensaje</h2>
                <p class="step-description">Configura cómo se enviará la notificación</p>

                <div class="canales-section">
                  <h4>Canales de Envío</h4>

                  <div class="checkbox-cards horizontal">
                    <div
                      class="checkbox-card"
                      [class.selected]="reglaForm.enviarInApp"
                      (click)="reglaForm.enviarInApp = !reglaForm.enviarInApp"
                    >
                      <p-checkbox [(ngModel)]="reglaForm.enviarInApp" [binary]="true" />
                      <div class="card-content">
                        <i class="pi pi-desktop"></i>
                        <span class="card-title">In-App</span>
                        <span class="card-desc">Notificación en la aplicación</span>
                      </div>
                    </div>

                    <div
                      class="checkbox-card"
                      [class.selected]="reglaForm.enviarEmail"
                      (click)="reglaForm.enviarEmail = !reglaForm.enviarEmail"
                    >
                      <p-checkbox [(ngModel)]="reglaForm.enviarEmail" [binary]="true" />
                      <div class="card-content">
                        <i class="pi pi-envelope"></i>
                        <span class="card-title">Email</span>
                        <span class="card-desc">Correo electrónico</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p-divider />

                <div class="mensaje-section">
                  <h4>Plantilla del Mensaje</h4>
                  <p class="section-hint">Personaliza el contenido usando el editor visual. Usa los botones de abajo para insertar placeholders.</p>

                  <p-editor
                    [(ngModel)]="reglaForm.plantillaMensaje"
                    [style]="{ height: '200px' }"
                    placeholder="Escribe el contenido de la notificación..."
                  >
                    <ng-template pTemplate="header">
                      <span class="ql-formats">
                        <button type="button" class="ql-bold" aria-label="Bold"></button>
                        <button type="button" class="ql-italic" aria-label="Italic"></button>
                        <button type="button" class="ql-underline" aria-label="Underline"></button>
                      </span>
                      <span class="ql-formats">
                        <button type="button" class="ql-list" value="ordered" aria-label="Ordered List"></button>
                        <button type="button" class="ql-list" value="bullet" aria-label="Unordered List"></button>
                      </span>
                      <span class="ql-formats">
                        <button type="button" class="ql-link" aria-label="Insert Link"></button>
                      </span>
                      <span class="ql-formats">
                        <button type="button" class="ql-clean" aria-label="Remove Styles"></button>
                      </span>
                    </ng-template>
                  </p-editor>

                  <div class="placeholders-help">
                    <span class="help-title">Insertar placeholder:</span>
                    <div class="placeholder-buttons">
                      @for (ph of placeholdersList; track ph.key) {
                        <p-button
                          [label]="ph.label"
                          size="small"
                          [outlined]="true"
                          (onClick)="insertarPlaceholder(ph.key)"
                        />
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Navigation Footer -->
          <div class="form-footer">
            <div class="footer-left">
              @if (pasoActual() > 0) {
                <p-button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  [outlined]="true"
                  (onClick)="pasoAnterior()"
                />
              }
            </div>
            <div class="footer-center">
              <span class="step-indicator">Paso {{ pasoActual() + 1 }} de 4</span>
            </div>
            <div class="footer-right">
              @if (pasoActual() < 3) {
                <p-button
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  (onClick)="pasoSiguiente()"
                  [disabled]="!puedeAvanzar()"
                />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--surface-ground);
    }

    // ============================================================================
    // HEADER
    // ============================================================================
    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-title h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header-title p {
      margin: 0.25rem 0 0 0;
      color: var(--text-color-secondary);
      font-size: 0.8rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .estado-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--surface-ground);
      border-radius: 8px;
    }

    .toggle-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    // ============================================================================
    // MAIN: TWO COLUMNS
    // ============================================================================
    .wizard-main {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    // ============================================================================
    // LEFT PANEL: FORM
    // ============================================================================
    .wizard-form-panel {
      width: 50%;
      display: flex;
      flex-direction: column;
      border-right: 1px solid var(--surface-border);
      background: var(--surface-card);
    }

    .wizard-form-panel.full-width {
      width: 100%;
      border-right: none;
    }

    .steps-container {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      background: var(--surface-ground);
    }

    :host ::ng-deep {
      .p-steps {
        .p-steps-item {
          flex: 1;
          &.p-disabled { opacity: 0.6; }
        }
        .p-steps-number {
          min-width: 2rem;
          height: 2rem;
          font-size: 0.875rem;
        }
        .p-steps-title {
          font-size: 0.75rem;
        }
      }
    }

    .form-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .step-content h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .step-content h2 i {
      color: var(--primary-color);
    }

    .step-description {
      color: var(--text-color-secondary);
      margin: 0 0 1.5rem 0;
      font-size: 0.875rem;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
    }

    .input-lg {
      font-size: 1rem;
      padding: 0.75rem 1rem;
    }

    .hint {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    .w-full { width: 100%; }

    // Trigger preview in form
    .trigger-preview {
      margin-top: 1.5rem;
    }

    .preview-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
    }

    .preview-card i {
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    // Destinatarios
    .destinatarios-section {
      margin-bottom: 1rem;
    }

    .destinatarios-section h4,
    .canales-section h4,
    .mensaje-section h4 {
      margin: 0 0 0.25rem 0;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .section-hint {
      color: var(--text-color-secondary);
      font-size: 0.8rem;
      margin: 0 0 1rem 0;
    }

    .section-hint code {
      background: var(--surface-ground);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .checkbox-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .checkbox-cards.horizontal {
      grid-template-columns: repeat(2, 1fr);
    }

    .checkbox-card {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--surface-ground);
      border: 2px solid var(--surface-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .checkbox-card:hover {
      border-color: var(--primary-color);
    }

    .checkbox-card.selected {
      border-color: var(--primary-color);
      background: color-mix(in srgb, var(--primary-color) 10%, transparent);
    }

    .checkbox-card .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .checkbox-card .card-content i {
      font-size: 1rem;
      color: var(--primary-color);
      margin-bottom: 0.125rem;
    }

    .checkbox-card .card-title {
      font-weight: 600;
      font-size: 0.8rem;
    }

    .checkbox-card .card-desc {
      color: var(--text-color-secondary);
      font-size: 0.7rem;
    }

    // Editor
    :host ::ng-deep {
      .p-editor {
        .p-editor-toolbar {
          background: var(--surface-ground);
          border-color: var(--surface-border);
        }
        .p-editor-content {
          background: var(--surface-card);
          .ql-editor {
            min-height: 150px;
          }
        }
      }
    }

    .placeholders-help {
      margin-top: 1rem;
      padding: 0.75rem;
      background: var(--surface-ground);
      border-radius: 8px;
    }

    .help-title {
      display: block;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.5rem;
    }

    .placeholder-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    // Form Footer
    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--surface-border);
      background: var(--surface-ground);
    }

    .footer-left,
    .footer-right {
      min-width: 120px;
    }

    .footer-center {
      text-align: center;
    }

    .step-indicator {
      font-size: 0.8rem;
      color: var(--text-color-secondary);
    }

    // ============================================================================
    // RIGHT PANEL: PREVIEW
    // ============================================================================
    .wizard-preview-panel {
      width: 50%;
      display: flex;
      flex-direction: column;
      background: var(--surface-ground);
    }

    .preview-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--surface-border);
      background: var(--surface-card);
    }

    .preview-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .preview-header h3 i {
      color: var(--primary-color);
    }

    .preview-content {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    // Preview Sections
    .preview-section {
      background: var(--surface-card);
      border-radius: 8px;
      border: 2px solid var(--surface-border);
      overflow: hidden;
      transition: all 0.2s;
    }

    .preview-section.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
    }

    .preview-section.completed .section-header {
      background: color-mix(in srgb, var(--green-500) 10%, transparent);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--surface-ground);
      border-bottom: 1px solid var(--surface-border);
    }

    .section-number {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .section-title {
      flex: 1;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .completed-icon {
      color: var(--green-500);
      font-size: 1rem;
    }

    .section-body {
      padding: 0.75rem 1rem;
    }

    .preview-item {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin-bottom: 0.5rem;
    }

    .preview-item:last-child {
      margin-bottom: 0;
    }

    .item-label {
      font-size: 0.7rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
    }

    .item-value {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .item-value.small {
      font-size: 0.8rem;
      font-weight: 400;
      color: var(--text-color-secondary);
    }

    .empty-state {
      color: var(--text-color-secondary);
      font-size: 0.8rem;
      font-style: italic;
    }

    // Trigger Flow in Preview
    .trigger-flow {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .flow-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      background: var(--surface-ground);
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .flow-item i {
      font-size: 0.875rem;
      color: var(--primary-color);
    }

    .flow-item.event i {
      color: var(--orange-500);
    }

    .flow-arrow {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    // Tags List
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    // Canales List
    .canales-list {
      display: flex;
      gap: 0.75rem;
    }

    .canal-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      background: var(--surface-ground);
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .canal-badge i {
      color: var(--primary-color);
    }

    // Notification Preview
    .notification-preview-section {
      margin-top: auto;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--surface-border);
    }

    .notification-preview-section h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.8rem;
      color: var(--text-color-secondary);
      text-transform: uppercase;
    }

    .notification-mock {
      background: var(--surface-card);
      border-radius: 10px;
      border: 1px solid var(--surface-border);
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .notification-mock-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
    }

    .notification-icon.severity-info { background: var(--blue-500); }
    .notification-icon.severity-warning { background: var(--orange-500); }
    .notification-icon.severity-critical { background: var(--red-500); }

    .notification-meta {
      display: flex;
      flex-direction: column;
    }

    .notification-title {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .notification-time {
      font-size: 0.7rem;
      color: var(--text-color-secondary);
    }

    .notification-mock-body {
      padding: 0.75rem;
      font-size: 0.85rem;
      line-height: 1.4;
      min-height: 40px;
    }

    .notification-mock-footer {
      padding: 0.5rem 0.75rem;
      background: var(--surface-ground);
      display: flex;
      gap: 0.375rem;
    }

    // ============================================================================
    // RESPONSIVE
    // ============================================================================
    @media (max-width: 1024px) {
      .wizard-main {
        flex-direction: column;
      }

      .wizard-form-panel,
      .wizard-preview-panel {
        width: 100%;
      }

      .wizard-form-panel {
        border-right: none;
        border-bottom: 1px solid var(--surface-border);
      }

      .checkbox-cards {
        grid-template-columns: 1fr;
      }

      .checkbox-cards.horizontal {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class NotificacionReglaNuevaComponent implements OnInit {
  pasoActual = signal(0);
  modoEdicion = false;
  reglaId: string | null = null;

  stepsItems: MenuItem[] = [
    { label: 'Info' },
    { label: 'Trigger' },
    { label: 'Destino' },
    { label: 'Mensaje' },
  ];

  reglaForm: Partial<NotificationRule> = this.getReglaFormDefault();

  placeholdersList = [
    { key: '{{nombre}}', label: 'Nombre' },
    { key: '{{entidad}}', label: 'Entidad' },
    { key: '{{usuario}}', label: 'Usuario' },
    { key: '{{fecha}}', label: 'Fecha' },
    { key: '{{responsable}}', label: 'Responsable' },
  ];

  // Opciones para selects
  opcionesEntidad = [
    { label: 'Activos', value: 'ASSET' },
    { label: 'Riesgos', value: 'RISK' },
    { label: 'Incidentes', value: 'INCIDENT' },
    { label: 'Defectos', value: 'DEFECT' },
    { label: 'Procesos', value: 'PROCESS' },
    { label: 'Cuestionarios', value: 'QUESTIONNAIRE' },
    { label: 'Revisiones de Cumplimiento', value: 'COMPLIANCE_REVIEW' },
    { label: 'Resultados ML', value: 'ML_RESULT' },
    { label: 'Contenedores Org', value: 'ORG_CONTAINER' },
  ];

  opcionesEvento = [
    { label: 'Creación', value: 'CREATE' },
    { label: 'Actualización', value: 'UPDATE' },
    { label: 'Eliminación', value: 'DELETE' },
    { label: 'Aprobación', value: 'APPROVAL' },
    { label: 'Rechazo', value: 'REJECTION' },
  ];

  opcionesSeveridad = [
    { label: 'Información', value: 'info' },
    { label: 'Advertencia', value: 'warning' },
    { label: 'Crítico', value: 'critical' },
  ];

  opcionesRoles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Gestor de Riesgos', value: 'RISK_MANAGER' },
    { label: 'Auditor', value: 'AUDITOR' },
    { label: 'Compliance Officer', value: 'COMPLIANCE_OFFICER' },
    { label: 'Supervisor', value: 'SUPERVISOR' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.reglaId = params.get('id');
      if (this.reglaId) {
        this.modoEdicion = true;
        this.cargarRegla(this.reglaId);
      }
    });
  }

  cargarRegla(id: string): void {
    console.log('Cargando regla:', id);
  }

  getReglaFormDefault(): Partial<NotificationRule> {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      eventoTipo: '',
      activo: true,
      notificarCreador: false,
      notificarResponsable: true,
      notificarAprobadores: false,
      rolesDestino: [],
      usuariosDestino: [],
      enviarInApp: true,
      enviarEmail: false,
      plantillaMensaje: '',
      severidad: 'info',
    };
  }

  // Navegación
  volver(): void {
    this.router.navigate(['/notificaciones-reglas']);
  }

  cambiarPaso(index: number): void {
    if (index < this.pasoActual() || this.puedeAvanzar()) {
      this.pasoActual.set(index);
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 0) {
      this.pasoActual.update(p => p - 1);
    }
  }

  pasoSiguiente(): void {
    if (this.pasoActual() < 3 && this.puedeAvanzar()) {
      this.pasoActual.update(p => p + 1);
    }
  }

  puedeAvanzar(): boolean {
    switch (this.pasoActual()) {
      case 0:
        return !!this.reglaForm.nombre && !!this.reglaForm.severidad;
      case 1:
        return !!this.reglaForm.entidadTipo && !!this.reglaForm.eventoTipo;
      case 2:
        return this.tieneDestinatarios();
      default:
        return true;
    }
  }

  tieneDestinatarios(): boolean {
    return !!(this.reglaForm.notificarCreador ||
           this.reglaForm.notificarResponsable ||
           this.reglaForm.notificarAprobadores ||
           (this.reglaForm.rolesDestino?.length || 0) > 0);
  }

  formularioValido(): boolean {
    return !!this.reglaForm.nombre &&
           !!this.reglaForm.entidadTipo &&
           !!this.reglaForm.eventoTipo &&
           !!(this.reglaForm.enviarInApp || this.reglaForm.enviarEmail);
  }

  // Helpers
  getEntidadLabel(valor: string): string {
    return this.opcionesEntidad.find(o => o.value === valor)?.label || valor || 'Entidad';
  }

  getEventoLabel(valor: string): string {
    return this.opcionesEvento.find(o => o.value === valor)?.label || valor || 'Evento';
  }

  getSeveridadLabel(valor: string): string {
    return this.opcionesSeveridad.find(o => o.value === valor)?.label || valor;
  }

  getSeveridadSeverity(valor: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (valor) {
      case 'info': return 'info';
      case 'warning': return 'warn';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  }

  getEventoSeverity(valor: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (valor) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'danger';
      case 'APPROVAL': return 'success';
      case 'REJECTION': return 'danger';
      default: return 'secondary';
    }
  }

  getRolLabel(valor: string): string {
    return this.opcionesRoles.find(o => o.value === valor)?.label || valor;
  }

  getMensajePreview(): string {
    if (this.reglaForm.plantillaMensaje) {
      let mensaje = this.reglaForm.plantillaMensaje
        .replace(/\{\{nombre\}\}/g, '<strong>Activo de ejemplo</strong>')
        .replace(/\{\{entidad\}\}/g, this.getEntidadLabel(this.reglaForm.entidadTipo || ''))
        .replace(/\{\{usuario\}\}/g, 'Juan Pérez')
        .replace(/\{\{fecha\}\}/g, new Date().toLocaleDateString())
        .replace(/\{\{responsable\}\}/g, 'María García');
      return mensaje;
    }
    return `Se ha realizado <strong>${this.getEventoLabel(this.reglaForm.eventoTipo || '').toLowerCase()}</strong> en ${this.getEntidadLabel(this.reglaForm.entidadTipo || '')}`;
  }

  insertarPlaceholder(placeholder: string): void {
    this.reglaForm.plantillaMensaje = (this.reglaForm.plantillaMensaje || '') + placeholder;
  }

  // Guardar
  guardarRegla(): void {
    if (!this.formularioValido()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    const regla: NotificationRule = {
      ...(this.reglaForm as NotificationRule),
      id: this.reglaId || Date.now().toString(),
      fechaCreacion: new Date(),
    };

    console.log('Guardando regla:', regla);

    this.messageService.add({
      severity: 'success',
      summary: this.modoEdicion ? 'Actualizado' : 'Creado',
      detail: `Regla "${regla.nombre}" ${this.modoEdicion ? 'actualizada' : 'creada'} correctamente`
    });

    setTimeout(() => {
      this.router.navigate(['/notificaciones-reglas']);
    }, 1500);
  }
}
