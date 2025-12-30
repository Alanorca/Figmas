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
import { TooltipModule } from 'primeng/tooltip';
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
  emailBlocks?: EmailBlock[];
}

// Interfaces para Editor Visual de Email
type EmailBlockType = 'header' | 'paragraph' | 'button' | 'divider' | 'variable' | 'list' | 'alert';

interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: string;
  styles?: {
    alignment?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    bold?: boolean;
  };
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
    TooltipModule,
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
        <!-- Steps - Full Width -->
        <div class="steps-container">
          <p-steps [model]="stepsItems" [activeIndex]="pasoActual()" [readonly]="false" (activeIndexChange)="cambiarPaso($event)" />
        </div>

        <!-- Two Column Layout -->
        <div class="content-layout">
          <!-- Left Column - Form Content -->
          <div class="form-column">
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
                  <h4>Diseño de Notificación</h4>
                  <p class="section-hint">Construye el contenido de la notificación arrastrando bloques.</p>

                  <!-- Barra de herramientas de bloques -->
                  <div class="editor-toolbar">
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('header')" pTooltip="Título">
                      <i class="pi pi-heading"></i>
                      <span>Título</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('paragraph')" pTooltip="Párrafo">
                      <i class="pi pi-align-left"></i>
                      <span>Párrafo</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('variable')" pTooltip="Variable">
                      <i class="pi pi-code"></i>
                      <span>Variable</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('button')" pTooltip="Botón">
                      <i class="pi pi-external-link"></i>
                      <span>Botón</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('divider')" pTooltip="Separador">
                      <i class="pi pi-minus"></i>
                      <span>Línea</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('list')" pTooltip="Lista">
                      <i class="pi pi-list"></i>
                      <span>Lista</span>
                    </button>
                    <button type="button" class="toolbar-block-btn" (click)="agregarBloque('alert')" pTooltip="Alerta">
                      <i class="pi pi-exclamation-triangle"></i>
                      <span>Alerta</span>
                    </button>
                  </div>

                  <!-- Canvas del editor -->
                  <div class="editor-canvas">
                    @if (emailBlocks().length === 0) {
                      <div class="editor-empty-state">
                        <i class="pi pi-file-edit"></i>
                        <p>Agrega bloques usando los botones de arriba</p>
                      </div>
                    }
                    @for (block of emailBlocks(); track block.id; let i = $index) {
                      <div class="editor-block" [class.selected]="bloqueSeleccionado === block.id" (click)="seleccionarBloque(block.id)">
                        <!-- Primera fila: Tipo de bloque + Acciones -->
                        <div class="editor-block-header-row">
                          <div class="editor-block-type">
                            <i class="pi pi-bars editor-drag-icon"></i>
                            @switch (block.type) {
                              @case ('header') { <span class="block-type-label">Título</span> }
                              @case ('paragraph') { <span class="block-type-label">Párrafo</span> }
                              @case ('variable') { <span class="block-type-label">Variable</span> }
                              @case ('button') { <span class="block-type-label">Botón</span> }
                              @case ('divider') { <span class="block-type-label">Divisor</span> }
                              @case ('list') { <span class="block-type-label">Lista</span> }
                              @case ('alert') { <span class="block-type-label">Alerta</span> }
                            }
                          </div>
                          <div class="editor-block-actions">
                            @if (block.type !== 'divider' && block.type !== 'variable') {
                              <button type="button" (click)="setBlockAlignment(block, 'left'); $event.stopPropagation()" [class.active]="block.styles?.alignment === 'left' || !block.styles?.alignment" pTooltip="Izquierda">
                                <i class="pi pi-align-left"></i>
                              </button>
                              <button type="button" (click)="setBlockAlignment(block, 'center'); $event.stopPropagation()" [class.active]="block.styles?.alignment === 'center'" pTooltip="Centro">
                                <i class="pi pi-align-center"></i>
                              </button>
                              <button type="button" (click)="setBlockAlignment(block, 'right'); $event.stopPropagation()" [class.active]="block.styles?.alignment === 'right'" pTooltip="Derecha">
                                <i class="pi pi-align-right"></i>
                              </button>
                              <span class="actions-divider"></span>
                            }
                            @if (block.type === 'alert') {
                              <div class="alert-types">
                                <button type="button" [class.active]="block.styles?.color === 'info' || !block.styles?.color" (click)="setAlertType(block, 'info'); $event.stopPropagation()">
                                  <i class="pi pi-info-circle"></i>
                                </button>
                                <button type="button" [class.active]="block.styles?.color === 'warning'" (click)="setAlertType(block, 'warning'); $event.stopPropagation()">
                                  <i class="pi pi-exclamation-triangle"></i>
                                </button>
                                <button type="button" [class.active]="block.styles?.color === 'danger'" (click)="setAlertType(block, 'danger'); $event.stopPropagation()">
                                  <i class="pi pi-times-circle"></i>
                                </button>
                              </div>
                              <span class="actions-divider"></span>
                            }
                            <button type="button" (click)="moverBloque(i, -1); $event.stopPropagation()" [disabled]="i === 0" pTooltip="Subir">
                              <i class="pi pi-arrow-up"></i>
                            </button>
                            <button type="button" (click)="moverBloque(i, 1); $event.stopPropagation()" [disabled]="i === emailBlocks().length - 1" pTooltip="Bajar">
                              <i class="pi pi-arrow-down"></i>
                            </button>
                            <button type="button" class="delete-btn" (click)="eliminarBloque(block.id); $event.stopPropagation()" pTooltip="Eliminar">
                              <i class="pi pi-trash"></i>
                            </button>
                          </div>
                        </div>
                        <!-- Segunda fila: Contenido editable (ancho completo) -->
                        <div class="editor-block-content">
                          @switch (block.type) {
                            @case ('header') {
                              <input
                                type="text"
                                class="editor-block-input editor-block-header"
                                [ngModel]="block.content"
                                (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                placeholder="Escribe un título..."
                                [style.text-align]="block.styles?.alignment || 'left'"
                                (click)="$event.stopPropagation()"
                              />
                            }
                            @case ('paragraph') {
                              <textarea
                                class="editor-block-input editor-block-paragraph"
                                [ngModel]="block.content"
                                (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                placeholder="Escribe un párrafo..."
                                rows="3"
                                [style.text-align]="block.styles?.alignment || 'left'"
                                (click)="$event.stopPropagation()"
                              ></textarea>
                            }
                            @case ('variable') {
                              <div class="editor-block-variable">
                                <p-select
                                  [ngModel]="block.content"
                                  (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                  [options]="opcionesVariables"
                                  optionLabel="label"
                                  optionValue="value"
                                  placeholder="Seleccionar variable"
                                  styleClass="variable-select-full"
                                  (click)="$event.stopPropagation()"
                                />
                              </div>
                            }
                            @case ('button') {
                              <div class="editor-block-button">
                                <input
                                  type="text"
                                  class="editor-block-input"
                                  [ngModel]="block.content"
                                  (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                  placeholder="Texto del botón..."
                                  (click)="$event.stopPropagation()"
                                />
                                <div class="button-preview-small" [style.text-align]="block.styles?.alignment || 'center'">
                                  <span>{{ block.content || 'Botón' }}</span>
                                </div>
                              </div>
                            }
                            @case ('divider') {
                              <div class="editor-block-divider">
                                <hr />
                              </div>
                            }
                            @case ('list') {
                              <textarea
                                class="editor-block-input editor-block-list"
                                [ngModel]="block.content"
                                (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                placeholder="Elementos separados por líneas..."
                                rows="3"
                                (click)="$event.stopPropagation()"
                              ></textarea>
                            }
                            @case ('alert') {
                              <textarea
                                class="editor-block-input"
                                [ngModel]="block.content"
                                (ngModelChange)="actualizarContenidoBloque(block.id, $event)"
                                placeholder="Mensaje de alerta..."
                                rows="2"
                                (click)="$event.stopPropagation()"
                              ></textarea>
                            }
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Right Column - Preview Panel (Solo visible en paso 4) -->
          <div class="preview-column">
            @if (pasoActual() === 3) {
            <div class="preview-panel">
              <div class="preview-header">
                <span class="preview-title">
                  <i class="pi pi-eye"></i>
                  Vista Previa
                </span>
                <div class="preview-controls">
                  <!-- Toggle Email/In-App -->
                  <div class="preview-type-toggle">
                    <button
                      type="button"
                      class="type-btn"
                      [class.active]="previewType === 'email'"
                      (click)="previewType = 'email'"
                      pTooltip="Vista de correo electrónico"
                    >
                      <i class="pi pi-envelope"></i>
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      class="type-btn"
                      [class.active]="previewType === 'inapp'"
                      (click)="previewType = 'inapp'"
                      pTooltip="Vista de notificación en la app"
                    >
                      <i class="pi pi-bell"></i>
                      <span>In-App</span>
                    </button>
                  </div>
                  <!-- Toggle Light/Dark -->
                  <div class="preview-mode-toggle">
                    <button
                      type="button"
                      class="mode-btn"
                      [class.active]="!previewDarkMode"
                      (click)="previewDarkMode = false"
                      pTooltip="Modo claro"
                    >
                      <i class="pi pi-sun"></i>
                    </button>
                    <button
                      type="button"
                      class="mode-btn"
                      [class.active]="previewDarkMode"
                      (click)="previewDarkMode = true"
                      pTooltip="Modo oscuro"
                    >
                      <i class="pi pi-moon"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="preview-content" [class.dark-mode]="previewDarkMode">
                <!-- Preview Email -->
                @if (previewType === 'email') {
                  <!-- Header del email simulado -->
                  <div class="email-simulated-header">
                    <div class="email-logo">
                      <img src="/logo-orca.svg" alt="ORCA" class="logo-img" />
                    </div>
                  </div>

                  <div class="email-body">
                    @for (block of emailBlocks(); track block.id) {
                      @switch (block.type) {
                        @case ('header') {
                          <h1 class="preview-header-text" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Título de la Notificación' }}</h1>
                        }
                        @case ('paragraph') {
                          <p class="preview-paragraph" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Contenido del párrafo...' }}</p>
                        }
                        @case ('variable') {
                          @switch (block.content) {
                            @case ('nombre') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-tag"></i>
                                  <span>Nombre</span>
                                </div>
                                <div class="variable-value">
                                  <div class="entity-badge">
                                    <i class="pi pi-building"></i>
                                    <span>{{ previewData.nombre }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                            @case ('descripcion') {
                              <div class="variable-card vertical">
                                <div class="variable-label-preview">
                                  <i class="pi pi-align-left"></i>
                                  <span>Descripción</span>
                                </div>
                                <div class="variable-value">
                                  <p class="description-text">{{ previewData.descripcion }}</p>
                                </div>
                              </div>
                            }
                            @case ('fecha') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-calendar"></i>
                                  <span>Fecha</span>
                                </div>
                                <div class="variable-value">
                                  <span class="date-value">{{ previewData.fecha }}</span>
                                </div>
                              </div>
                            }
                            @case ('responsable') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-user"></i>
                                  <span>Responsable</span>
                                </div>
                                <div class="variable-value">
                                  <div class="user-chip-inline">
                                    <div class="chip-avatar">{{ previewData.responsable.iniciales }}</div>
                                    <span class="chip-name">{{ previewData.responsable.nombre }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                            @case ('entidad') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-box"></i>
                                  <span>Tipo de Entidad</span>
                                </div>
                                <div class="variable-value">
                                  <div class="entity-type-chip">
                                    <i [class]="previewData.entidad.icono"></i>
                                    <span>{{ previewData.entidad.tipo }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                            @case ('severidad') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-exclamation-triangle"></i>
                                  <span>Severidad</span>
                                </div>
                                <div class="variable-value">
                                  <p-tag
                                    [value]="previewData.severidad.label"
                                    [severity]="previewData.severidad.severity"
                                    [rounded]="true"
                                  />
                                </div>
                              </div>
                            }
                            @case ('estado') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-info-circle"></i>
                                  <span>Estado</span>
                                </div>
                                <div class="variable-value">
                                  <div class="status-chip" [class]="'status-' + previewData.estado.color">
                                    <i class="pi pi-circle-fill"></i>
                                    <span>{{ previewData.estado.label }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                            @case ('creador') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-user-plus"></i>
                                  <span>Creado por</span>
                                </div>
                                <div class="variable-value">
                                  <div class="user-chip-inline">
                                    <div class="chip-avatar">{{ previewData.creador.iniciales }}</div>
                                    <span class="chip-name">{{ previewData.creador.nombre }}</span>
                                  </div>
                                </div>
                              </div>
                            }
                            @case ('enlace') {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-link"></i>
                                  <span>Enlace</span>
                                </div>
                                <div class="variable-value">
                                  <a class="action-link-inline" href="#">
                                    <span>Ver detalles en ORCA</span>
                                    <i class="pi pi-external-link"></i>
                                  </a>
                                </div>
                              </div>
                            }
                            @default {
                              <div class="variable-card">
                                <div class="variable-label-preview">
                                  <i class="pi pi-code"></i>
                                  <span>{{ block.content }}</span>
                                </div>
                                <div class="variable-value">
                                  <span class="fallback-value">—</span>
                                </div>
                              </div>
                            }
                          }
                        }
                        @case ('button') {
                          <div [style.text-align]="block.styles?.alignment || 'center'" class="preview-button-container">
                            <a class="preview-button">{{ block.content || 'Ver más' }}</a>
                          </div>
                        }
                        @case ('divider') {
                          <hr class="preview-divider" />
                        }
                        @case ('list') {
                          <ul class="preview-list">
                            @for (item of (block.content || '').split('\n'); track item) {
                              @if (item.trim()) {
                                <li>
                                  <i class="pi pi-check-circle"></i>
                                  {{ item }}
                                </li>
                              }
                            }
                          </ul>
                        }
                        @case ('alert') {
                          <div class="preview-alert" [class]="'alert-' + (block.styles?.color || 'info')">
                            <i class="pi" [class.pi-info-circle]="block.styles?.color === 'info' || !block.styles?.color"
                               [class.pi-exclamation-triangle]="block.styles?.color === 'warning'"
                               [class.pi-times-circle]="block.styles?.color === 'danger'"></i>
                            <span>{{ block.content || 'Mensaje de alerta' }}</span>
                          </div>
                        }
                      }
                    }
                    @if (emailBlocks().length === 0) {
                      <div class="preview-empty">
                        <i class="pi pi-inbox"></i>
                        <p>Agrega bloques para ver la vista previa</p>
                      </div>
                    }
                  </div>

                  <!-- Footer del email simulado -->
                  <div class="email-simulated-footer">
                    <p>Este correo fue enviado automáticamente por el sistema ORCA.</p>
                    <p>© 2024 ORCA - Sistema de Gestión de Riesgos y Cumplimiento</p>
                  </div>
                }

                <!-- Preview In-App -->
                @if (previewType === 'inapp') {
                  <div class="inapp-preview-container">
                    <!-- Notification Panel Preview -->
                    <div class="inapp-section-label">
                      <i class="pi pi-inbox"></i>
                      <span>Panel de Notificaciones</span>
                    </div>
                    <div class="inapp-notification">
                      <div class="inapp-header">
                        <div class="inapp-icon" [class]="'severity-' + previewData.severidad.severity">
                          <i class="pi pi-bell"></i>
                        </div>
                        <div class="inapp-title-section">
                          <span class="inapp-title">{{ reglaForm.nombre || 'Nueva Notificación' }}</span>
                          <span class="inapp-time">Hace 2 minutos</span>
                        </div>
                        <div class="inapp-header-actions">
                          <span class="inapp-unread-dot"></span>
                          <button class="inapp-close" pTooltip="Cerrar notificación">
                            <i class="pi pi-times"></i>
                          </button>
                        </div>
                      </div>
                      <div class="inapp-body">
                        @if (emailBlocks().length === 0) {
                          <p class="inapp-message">
                            Se ha detectado un evento en <strong>{{ previewData.nombre }}</strong> que requiere su atención.
                          </p>
                        }
                        <!-- Renderizar bloques dinámicamente -->
                        @for (block of emailBlocks(); track block.id) {
                          @switch (block.type) {
                            @case ('header') {
                              <h3 class="inapp-block-header" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Título' }}</h3>
                            }
                            @case ('paragraph') {
                              <p class="inapp-block-paragraph" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Contenido...' }}</p>
                            }
                            @case ('variable') {
                              <div class="inapp-var-row">
                                @switch (block.content) {
                                  @case ('nombre') {
                                    <span class="inapp-var-label"><i class="pi pi-tag"></i> Nombre</span>
                                    <div class="inapp-var-value">
                                      <span class="inapp-entity-badge"><i class="pi pi-building"></i> {{ previewData.nombre }}</span>
                                    </div>
                                  }
                                  @case ('descripcion') {
                                    <span class="inapp-var-label"><i class="pi pi-align-left"></i> Descripción</span>
                                    <div class="inapp-var-value"><span class="inapp-desc-text">{{ previewData.descripcion }}</span></div>
                                  }
                                  @case ('fecha') {
                                    <span class="inapp-var-label"><i class="pi pi-calendar"></i> Fecha</span>
                                    <div class="inapp-var-value"><span class="inapp-date">{{ previewData.fecha }}</span></div>
                                  }
                                  @case ('responsable') {
                                    <span class="inapp-var-label"><i class="pi pi-user"></i> Responsable</span>
                                    <div class="inapp-var-value">
                                      <span class="inapp-user-chip"><span class="inapp-avatar">{{ previewData.responsable.iniciales }}</span> {{ previewData.responsable.nombre }}</span>
                                    </div>
                                  }
                                  @case ('entidad') {
                                    <span class="inapp-var-label"><i class="pi pi-box"></i> Entidad</span>
                                    <div class="inapp-var-value">
                                      <span class="inapp-entity-badge"><i [class]="previewData.entidad.icono"></i> {{ previewData.entidad.tipo }}</span>
                                    </div>
                                  }
                                  @case ('severidad') {
                                    <span class="inapp-var-label"><i class="pi pi-exclamation-triangle"></i> Severidad</span>
                                    <div class="inapp-var-value">
                                      <p-tag [value]="previewData.severidad.label" [severity]="previewData.severidad.severity" [rounded]="true" />
                                    </div>
                                  }
                                  @case ('estado') {
                                    <span class="inapp-var-label"><i class="pi pi-info-circle"></i> Estado</span>
                                    <div class="inapp-var-value">
                                      <span class="inapp-status-badge" [class]="'status-' + previewData.estado.color"><i class="pi pi-circle-fill"></i> {{ previewData.estado.label }}</span>
                                    </div>
                                  }
                                  @case ('creador') {
                                    <span class="inapp-var-label"><i class="pi pi-user-plus"></i> Creado por</span>
                                    <div class="inapp-var-value">
                                      <span class="inapp-user-chip"><span class="inapp-avatar">{{ previewData.creador.iniciales }}</span> {{ previewData.creador.nombre }}</span>
                                    </div>
                                  }
                                  @case ('enlace') {
                                    <span class="inapp-var-label"><i class="pi pi-link"></i> Enlace</span>
                                    <div class="inapp-var-value"><a class="inapp-link" href="#">Ver en ORCA <i class="pi pi-external-link"></i></a></div>
                                  }
                                  @default {
                                    <span class="inapp-var-label"><i class="pi pi-code"></i> {{ block.content }}</span>
                                    <div class="inapp-var-value"><span>—</span></div>
                                  }
                                }
                              </div>
                            }
                            @case ('button') {
                              <div class="inapp-block-button-container" [style.text-align]="block.styles?.alignment || 'center'">
                                <button class="inapp-block-button">{{ block.content || 'Ver más' }}</button>
                              </div>
                            }
                            @case ('divider') {
                              <hr class="inapp-block-divider" />
                            }
                            @case ('list') {
                              <ul class="inapp-block-list">
                                @for (item of (block.content || '').split('\n'); track item) {
                                  @if (item.trim()) {
                                    <li><i class="pi pi-check"></i> {{ item }}</li>
                                  }
                                }
                              </ul>
                            }
                            @case ('alert') {
                              <div class="inapp-block-alert" [class]="'alert-' + (block.styles?.color || 'info')">
                                <i class="pi" [class.pi-info-circle]="block.styles?.color === 'info' || !block.styles?.color"
                                   [class.pi-exclamation-triangle]="block.styles?.color === 'warning'"
                                   [class.pi-times-circle]="block.styles?.color === 'danger'"></i>
                                <span>{{ block.content || 'Mensaje de alerta' }}</span>
                              </div>
                            }
                          }
                        }
                      </div>
                      <div class="inapp-footer">
                        <button class="inapp-action secondary">
                          <i class="pi pi-eye-slash"></i>
                          Marcar como leída
                        </button>
                        <button class="inapp-action primary">
                          <i class="pi pi-external-link"></i>
                          Ver detalles
                        </button>
                      </div>
                    </div>

                    <!-- Toast preview -->
                    <div class="inapp-section-label">
                      <i class="pi pi-comment"></i>
                      <span>Toast de Notificación</span>
                    </div>
                    <div class="toast-notification" [class]="'severity-' + previewData.severidad.severity">
                      <div class="toast-icon">
                        <i class="pi pi-bell"></i>
                      </div>
                      <div class="toast-content">
                        <span class="toast-title">{{ reglaForm.nombre || 'Nueva Notificación' }}</span>
                        <span class="toast-message">{{ getFirstParagraphContent() || previewData.nombre }}</span>
                      </div>
                      <button class="toast-close">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>

                    <!-- Badge preview -->
                    <div class="inapp-section-label">
                      <i class="pi pi-bell"></i>
                      <span>Badge de Notificación</span>
                    </div>
                    <div class="inapp-badge-preview">
                      <div class="badge-demo-navbar">
                        <span class="badge-nav-item">Dashboard</span>
                        <span class="badge-nav-item">Activos</span>
                        <span class="badge-nav-item with-badge">
                          <i class="pi pi-bell"></i>
                          <span class="notification-badge">3</span>
                        </span>
                        <span class="badge-nav-item">
                          <i class="pi pi-user"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
            }
          </div>
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
    // MAIN LAYOUT
    // ============================================================================
    .wizard-main {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .steps-container {
      padding: 1rem 2rem;
      border-bottom: 1px solid var(--surface-border);
      background: var(--surface-card);
    }

    // ============================================================================
    // TWO COLUMN LAYOUT
    // ============================================================================
    .content-layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .form-column {
      width: 50%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 1.5rem 2rem;
      background: var(--surface-card);
      border-right: 1px solid var(--surface-border);
    }

    .preview-column {
      width: 50%;
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

    // ============================================================================
    // EDITOR DE BLOQUES DE EMAIL
    // ============================================================================
    .editor-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      margin-bottom: 0.75rem;
    }

    .toolbar-block-btn {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      font-size: 0.75rem;
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
        color: var(--text-color-secondary);
      }

      &:hover {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);

        i {
          color: var(--primary-color);
        }
      }
    }

    .editor-canvas {
      min-height: 250px;
      max-height: 450px;
      overflow-y: auto;
      padding: 0.75rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
    }

    .editor-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 3rem;
      color: var(--text-color-secondary);

      i {
        font-size: 2rem;
        opacity: 0.5;
        color: var(--primary-color);
      }

      p {
        font-size: 0.875rem;
        margin: 0;
      }
    }

    /* Editor blocks - Layout de 2 filas */
    .editor-block {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--surface-card);
      border: 2px solid var(--surface-border);
      border-radius: 8px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
      cursor: pointer;

      &:last-child {
        margin-bottom: 0;
      }

      &:hover {
        border-color: var(--primary-200);
      }

      &.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
      }
    }

    /* Primera fila: Tipo + Acciones */
    .editor-block-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .editor-block-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .editor-drag-icon {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      cursor: grab;
      opacity: 0.5;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    .editor-block:hover .editor-drag-icon {
      opacity: 0.8;
    }

    .block-type-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    /* Segunda fila: Contenido editable (ancho completo) */
    .editor-block-content {
      width: 100%;
    }

    .editor-block-input {
      width: 100%;
      padding: 0.5rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 4px;
      color: var(--text-color);
      font-size: 0.875rem;
      resize: none;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      &.editor-block-header {
        font-size: 1.1rem;
        font-weight: 600;
      }

      &.editor-block-paragraph {
        min-height: 60px;
      }

      &.editor-block-list {
        min-height: 60px;
        font-family: inherit;
      }
    }

    .editor-block-variable {
      width: 100%;

      :host ::ng-deep .variable-select-full {
        width: 100%;

        .p-select {
          width: 100%;
        }
      }
    }

    .editor-block-button {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .button-preview-small {
      span {
        display: inline-block;
        padding: 0.375rem 0.75rem;
        background: var(--primary-color);
        color: white;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
      }
    }

    .editor-block-divider {
      padding: 0.5rem 0;

      hr {
        border: none;
        border-top: 2px solid var(--surface-border);
        margin: 0;
      }
    }

    /* Alert types ahora en la primera fila con las acciones */
    .alert-types {
      display: flex;
      gap: 2px;

      button {
        width: 26px;
        height: 26px;
        border: none;
        border-radius: 4px;
        background: var(--surface-ground);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        color: var(--text-color-secondary);

        i {
          font-size: 0.75rem;
        }

        &:hover {
          background: var(--surface-hover);
          color: var(--text-color);
        }

        &.active {
          background: var(--primary-color);
          color: var(--primary-contrast-color, white);
        }

        &:nth-child(1) i { color: var(--blue-500); }
        &:nth-child(2) i { color: var(--orange-500); }
        &:nth-child(3) i { color: var(--red-500); }

        &.active i { color: white; }
      }
    }

    /* Editor block actions - Siempre visible en la primera fila */
    .editor-block-actions {
      display: flex;
      align-items: center;
      gap: 2px;

      button {
        width: 26px;
        height: 26px;
        border: none;
        background: var(--surface-ground);
        color: var(--text-color-secondary);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        i {
          font-size: 0.75rem;
        }

        &:hover:not(:disabled) {
          background: var(--surface-hover);
          color: var(--primary-color);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.active {
          background: color-mix(in srgb, var(--primary-color) 15%, transparent);
          color: var(--primary-color);
        }

        &.delete-btn:hover {
          background: color-mix(in srgb, var(--red-500) 15%, transparent);
          color: var(--red-500);
        }
      }

      .actions-divider {
        width: 1px;
        height: 16px;
        background: var(--surface-border);
        margin: 0 2px;
        align-self: center;
      }
    }

    // ============================================================================
    // PREVIEW PANEL
    // ============================================================================
    .preview-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-card);
    }

    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--surface-border);
      background: var(--surface-ground);
    }

    .preview-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;

      i {
        color: var(--primary-color);
      }
    }

    .preview-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .preview-type-toggle {
      display: flex;
      align-items: center;
      background: var(--surface-100);
      border-radius: 6px;
      padding: 2px;

      .type-btn {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.375rem 0.75rem;
        border: none;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
        color: var(--text-color-secondary);
        font-size: 0.75rem;
        font-weight: 500;
        transition: all 0.2s;

        &:hover {
          color: var(--text-color);
        }

        &.active {
          background: var(--surface-card);
          color: var(--primary-color);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        i {
          font-size: 0.8rem;
        }
      }
    }

    .preview-mode-toggle {
      display: flex;
      align-items: center;
      gap: 2px;

      .mode-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
        background: var(--surface-card);
        cursor: pointer;
        color: var(--text-color-secondary);
        transition: all 0.2s;

        &:hover {
          background: var(--surface-100);
        }

        &.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        i {
          font-size: 0.8rem;
        }
      }
    }

    .preview-content {
      flex: 1;
      overflow-y: auto;
      background: #ffffff;
      border-radius: 8px;
      margin: 0.75rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      /* Light mode CSS variables */
      --email-bg: #ffffff;
      --email-text: #18181b;
      --email-text-secondary: #71717a;
      --email-border: #e4e4e7;
      --email-surface: #fafafa;
      --email-primary: #10b981;
      --email-primary-light: #ecfdf5;
      --email-primary-hover: #059669;
      --email-success: #22c55e;
      --email-success-light: #f0fdf4;
      --email-warning: #f59e0b;
      --email-warning-light: #fffbeb;
      --email-danger: #ef4444;
      --email-danger-light: #fef2f2;
      --email-info: #10b981;
      --email-info-light: #ecfdf5;
    }

    .preview-content.dark-mode {
      background: #18181b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      --email-bg: #18181b;
      --email-text: #fafafa;
      --email-text-secondary: #a1a1aa;
      --email-border: #3f3f46;
      --email-surface: #27272a;
      --email-primary: #34d399;
      --email-primary-light: #065f46;
      --email-primary-hover: #6ee7b7;
      --email-success: #4ade80;
      --email-success-light: #14532d;
      --email-warning: #fbbf24;
      --email-warning-light: #451a03;
      --email-danger: #f87171;
      --email-danger-light: #450a0a;
      --email-info: #34d399;
      --email-info-light: #065f46;
    }

    /* Email Simulated Header */
    .email-simulated-header {
      padding: 1.25rem 1rem;
      background: var(--email-surface);
      border-bottom: 1px solid var(--email-border);
      text-align: center;
    }

    .email-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      .logo-img {
        height: 32px;
        width: auto;
        transition: filter 0.2s;
      }
    }

    .preview-content.dark-mode .email-logo .logo-img {
      filter: invert(1) brightness(2);
    }

    /* Email Body */
    .email-body {
      padding: 1.25rem;
      background: var(--email-bg);
      color: var(--email-text);
    }

    .preview-header-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--email-text);
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
    }

    .preview-paragraph {
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--email-text);
      margin: 0 0 0.75rem 0;
      white-space: pre-wrap;
    }

    /* Variable Cards */
    .variable-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      background: var(--email-surface);
      border: 1px solid var(--email-border);
      border-radius: 6px;
      margin-bottom: 0.5rem;

      &.vertical {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .variable-label-preview {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--email-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;

      i {
        font-size: 0.75rem;
        color: var(--email-primary);
      }
    }

    .variable-value {
      display: flex;
      align-items: center;
    }

    .entity-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background: var(--email-primary-light);
      border: 1px solid var(--email-primary);
      border-radius: 4px;
      color: var(--email-primary);
      font-size: 0.75rem;
      font-weight: 500;

      i {
        font-size: 0.7rem;
      }
    }

    .entity-type-chip {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem;
      background: var(--email-surface);
      border: 1px solid var(--email-border);
      border-radius: 4px;
      color: var(--email-text);
      font-size: 0.75rem;
      font-weight: 500;

      i {
        font-size: 0.7rem;
        color: var(--email-primary);
      }
    }

    .date-value {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--email-text);
    }

    .description-text {
      font-size: 0.8rem;
      color: var(--email-text-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .user-chip-inline {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.5rem 0.25rem 0.25rem;
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 50px;
      font-size: 0.75rem;
      color: var(--email-text);
      font-weight: 500;
    }

    .chip-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 0.55rem;
    }

    .status-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;

      i {
        font-size: 0.35rem;
      }

      &.status-success {
        background: var(--email-success-light);
        color: var(--email-success);
      }

      &.status-warning {
        background: var(--email-warning-light);
        color: var(--email-warning);
      }

      &.status-danger {
        background: var(--email-danger-light);
        color: var(--email-danger);
      }

      &.status-info {
        background: var(--email-primary-light);
        color: var(--email-primary);
      }
    }

    .action-link-inline {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--email-primary);
      font-size: 0.75rem;
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }

      i {
        font-size: 0.7rem;
      }
    }

    .fallback-value {
      color: var(--email-text-secondary);
      font-size: 0.8rem;
    }

    /* Preview Button */
    .preview-button-container {
      margin: 0.75rem 0;
    }

    .preview-button {
      display: inline-block;
      background: var(--email-primary);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;
      text-decoration: none;
      transition: background 0.2s;

      &:hover {
        background: var(--email-primary-hover);
      }
    }

    /* Preview Divider */
    .preview-divider {
      border: none;
      border-top: 1px solid var(--email-border);
      margin: 0.75rem 0;
    }

    /* Preview List */
    .preview-list {
      margin: 0.5rem 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.375rem 0;
        font-size: 0.8rem;
        color: var(--email-text);

        i {
          color: var(--email-primary);
          font-size: 0.75rem;
        }
      }
    }

    /* Preview Alert */
    .preview-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: 6px;
      margin: 0.5rem 0;
      font-size: 0.8rem;

      &.alert-info {
        background: var(--email-info-light);
        border-left: 3px solid var(--email-info);
        color: var(--email-text);

        i { color: var(--email-info); }
      }

      &.alert-warning {
        background: var(--email-warning-light);
        border-left: 3px solid var(--email-warning);
        color: var(--email-text);

        i { color: var(--email-warning); }
      }

      &.alert-danger {
        background: var(--email-danger-light);
        border-left: 3px solid var(--email-danger);
        color: var(--email-text);

        i { color: var(--email-danger); }
      }

      i {
        font-size: 0.9rem;
        margin-top: 0.1rem;
      }
    }

    /* Preview Empty State */
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--email-text-secondary);

      i {
        font-size: 2rem;
        opacity: 0.4;
      }

      p {
        margin: 0;
        font-size: 0.8rem;
      }
    }

    /* Email Simulated Footer */
    .email-simulated-footer {
      padding: 1rem;
      background: var(--email-surface);
      border-top: 1px solid var(--email-border);
      text-align: center;

      p {
        margin: 0;
        font-size: 0.7rem;
        color: var(--email-text-secondary);
        line-height: 1.5;
      }
    }

    /* ===================== IN-APP PREVIEW ===================== */
    .inapp-preview-container {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .inapp-section-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--email-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-top: 0.5rem;

      i {
        font-size: 0.75rem;
        color: var(--email-primary);
      }
    }

    .inapp-notification {
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .inapp-header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem;
      border-bottom: 1px solid var(--email-border);
    }

    .inapp-icon {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      &.severity-info, &.severity-success {
        background: linear-gradient(135deg, #10b981, #059669);
      }
      &.severity-warn, &.severity-warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }
      &.severity-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      i {
        font-size: 0.9rem;
      }
    }

    .inapp-title-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .inapp-title {
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--email-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .inapp-time {
      font-size: 0.7rem;
      color: var(--email-text-secondary);
    }

    .inapp-header-actions {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .inapp-unread-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--email-primary);
    }

    .inapp-close {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: var(--email-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: var(--email-border);
        color: var(--email-text);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .inapp-body {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .inapp-message {
      margin: 0;
      font-size: 0.8rem;
      color: var(--email-text);
      line-height: 1.5;

      strong {
        color: var(--email-primary);
      }
    }

    /* In-App Block Styles */
    .inapp-block-header {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--email-text);
      line-height: 1.3;
    }

    .inapp-block-paragraph {
      margin: 0;
      font-size: 0.8rem;
      color: var(--email-text);
      line-height: 1.5;
    }

    .inapp-block-button-container {
      margin: 0.25rem 0;
    }

    .inapp-block-button {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background: var(--email-primary);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
    }

    .inapp-block-divider {
      border: none;
      border-top: 1px solid var(--email-border);
      margin: 0.25rem 0;
    }

    .inapp-block-list {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.75rem;
        color: var(--email-text);
        padding: 0.125rem 0;

        i {
          color: var(--email-primary);
          font-size: 0.6rem;
        }
      }
    }

    .inapp-block-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.375rem;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;

      &.alert-info {
        background: var(--email-info-light);
        border-left: 2px solid var(--email-info);
        color: var(--email-text);
        i { color: var(--email-info); }
      }

      &.alert-warning {
        background: var(--email-warning-light);
        border-left: 2px solid var(--email-warning);
        color: var(--email-text);
        i { color: var(--email-warning); }
      }

      &.alert-danger {
        background: var(--email-danger-light);
        border-left: 2px solid var(--email-danger);
        color: var(--email-text);
        i { color: var(--email-danger); }
      }

      i {
        font-size: 0.8rem;
        margin-top: 0.05rem;
      }
    }

    .inapp-desc-text {
      font-size: 0.7rem;
      color: var(--email-text-secondary);
      max-width: 150px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .inapp-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--email-primary);
      font-size: 0.7rem;
      font-weight: 500;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }

      i {
        font-size: 0.6rem;
      }
    }

    .inapp-variables {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .inapp-var-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      background: var(--email-surface);
      border-radius: 4px;
    }

    .inapp-var-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.7rem;
      font-weight: 500;
      color: var(--email-text-secondary);

      i {
        font-size: 0.7rem;
        color: var(--email-primary);
      }
    }

    .inapp-var-value {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      min-width: 0;
    }

    .inapp-entity-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.375rem;
      background: var(--email-primary-light);
      border: 1px solid var(--email-primary);
      border-radius: 4px;
      color: var(--email-primary);
      font-size: 0.65rem;
      font-weight: 500;
      max-width: 140px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      i {
        font-size: 0.6rem;
        flex-shrink: 0;
      }
    }

    .inapp-status-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 500;

      i {
        font-size: 0.3rem;
      }

      &.status-success {
        background: var(--email-success-light);
        color: var(--email-success);
      }

      &.status-warning {
        background: var(--email-warning-light);
        color: var(--email-warning);
      }

      &.status-danger {
        background: var(--email-danger-light);
        color: var(--email-danger);
      }

      &.status-info {
        background: var(--email-primary-light);
        color: var(--email-primary);
      }
    }

    .inapp-date {
      font-size: 0.7rem;
      color: var(--email-text);
      font-weight: 500;
    }

    .inapp-user-chip {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.125rem 0.375rem 0.125rem 0.125rem;
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 50px;
      font-size: 0.65rem;
      color: var(--email-text);
      font-weight: 500;

      .inapp-avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: 0.5rem;
      }
    }

    .inapp-footer {
      display: flex;
      gap: 0.375rem;
      padding: 0.625rem 0.75rem;
      background: var(--email-surface);
      border-top: 1px solid var(--email-border);
    }

    .inapp-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      padding: 0.375rem 0.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.7rem;
      }

      &.secondary {
        background: transparent;
        color: var(--email-text-secondary);

        &:hover {
          background: var(--email-border);
          color: var(--email-text);
        }
      }

      &.primary {
        background: var(--email-primary);
        color: white;

        &:hover {
          background: var(--email-primary-hover);
        }
      }
    }

    /* Toast Notification */
    .toast-notification {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem;
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      &.severity-danger {
        border-left: 3px solid #ef4444;

        .toast-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
      }

      &.severity-warn, &.severity-warning {
        border-left: 3px solid #f59e0b;

        .toast-icon {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
      }

      &.severity-info, &.severity-success {
        border-left: 3px solid #10b981;

        .toast-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }
      }
    }

    .toast-icon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      i {
        font-size: 0.8rem;
      }
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      color: var(--email-text);
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-message {
      font-size: 0.7rem;
      color: var(--email-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-close {
      width: 22px;
      height: 22px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      color: var(--email-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s;

      &:hover {
        background: var(--email-border);
        color: var(--email-text);
      }

      i {
        font-size: 0.65rem;
      }
    }

    /* Badge Preview */
    .inapp-badge-preview {
      background: var(--email-surface);
      border: 1px solid var(--email-border);
      border-radius: 6px;
      padding: 0.625rem;
    }

    .badge-demo-navbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.375rem 0.625rem;
      background: var(--email-bg);
      border-radius: 4px;
    }

    .badge-nav-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.7rem;
      color: var(--email-text-secondary);
      cursor: pointer;
      position: relative;

      &:hover {
        color: var(--email-text);
      }

      &.with-badge {
        color: var(--email-text);

        i {
          font-size: 0.9rem;
        }
      }

      .notification-badge {
        position: absolute;
        top: -5px;
        right: -7px;
        min-width: 14px;
        height: 14px;
        padding: 0 3px;
        border-radius: 50px;
        background: #ef4444;
        color: white;
        font-size: 0.55rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
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

  // Editor de bloques de email
  emailBlocks = signal<EmailBlock[]>([]);
  bloqueSeleccionado: string | null = null;

  opcionesVariables = [
    { label: 'Nombre de la entidad', value: 'nombre' },
    { label: 'Descripción', value: 'descripcion' },
    { label: 'Fecha', value: 'fecha' },
    { label: 'Responsable', value: 'responsable' },
    { label: 'Tipo de entidad', value: 'entidad' },
    { label: 'Severidad', value: 'severidad' },
    { label: 'Estado', value: 'estado' },
    { label: 'Creado por', value: 'creador' },
    { label: 'Enlace', value: 'enlace' },
  ];

  // Preview
  previewType: 'email' | 'inapp' = 'email';
  previewDarkMode = false;

  previewData = {
    nombre: 'Activo de Ejemplo',
    descripcion: 'Este es un ejemplo de descripción para el activo de prueba que se mostrará en la notificación.',
    fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    responsable: {
      nombre: 'María García',
      iniciales: 'MG',
    },
    creador: {
      nombre: 'Juan Pérez',
      iniciales: 'JP',
    },
    entidad: {
      tipo: 'Activo',
      icono: 'pi pi-box',
    },
    severidad: {
      label: 'Media',
      severity: 'warn' as const,
    },
    estado: {
      label: 'En Proceso',
      color: 'warning',
    },
  };

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
    this.router.navigate(['/notificaciones-config']);
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

  // ============================================================================
  // EDITOR DE BLOQUES DE EMAIL
  // ============================================================================

  agregarBloque(tipo: EmailBlockType): void {
    const nuevoBloque: EmailBlock = {
      id: Date.now().toString(),
      type: tipo,
      content: this.getDefaultContent(tipo),
      styles: {
        alignment: 'left',
        color: tipo === 'alert' ? 'info' : undefined,
      },
    };
    this.emailBlocks.update(blocks => [...blocks, nuevoBloque]);
    this.bloqueSeleccionado = nuevoBloque.id;
  }

  getDefaultContent(tipo: EmailBlockType): string {
    switch (tipo) {
      case 'header':
        return '';
      case 'paragraph':
        return '';
      case 'variable':
        return 'nombre';
      case 'button':
        return 'Ver detalles';
      case 'divider':
        return '';
      case 'list':
        return '';
      case 'alert':
        return '';
      default:
        return '';
    }
  }

  eliminarBloque(id: string): void {
    this.emailBlocks.update(blocks => blocks.filter(b => b.id !== id));
    if (this.bloqueSeleccionado === id) {
      this.bloqueSeleccionado = null;
    }
  }

  moverBloque(index: number, direccion: number): void {
    const blocks = [...this.emailBlocks()];
    const nuevoIndex = index + direccion;
    if (nuevoIndex >= 0 && nuevoIndex < blocks.length) {
      [blocks[index], blocks[nuevoIndex]] = [blocks[nuevoIndex], blocks[index]];
      this.emailBlocks.set(blocks);
    }
  }

  actualizarContenidoBloque(id: string, contenido: string): void {
    this.emailBlocks.update(blocks =>
      blocks.map(b => b.id === id ? { ...b, content: contenido } : b)
    );
  }

  setBlockAlignment(block: EmailBlock, alignment: 'left' | 'center' | 'right'): void {
    this.emailBlocks.update(blocks =>
      blocks.map(b => b.id === block.id ? {
        ...b,
        styles: { ...b.styles, alignment }
      } : b)
    );
  }

  setAlertType(block: EmailBlock, tipo: string): void {
    this.emailBlocks.update(blocks =>
      blocks.map(b => b.id === block.id ? {
        ...b,
        styles: { ...b.styles, color: tipo }
      } : b)
    );
  }

  seleccionarBloque(id: string): void {
    this.bloqueSeleccionado = id;
  }

  getFirstParagraphContent(): string {
    const paragraph = this.emailBlocks().find(b => b.type === 'paragraph' && b.content);
    return paragraph?.content || '';
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
      this.router.navigate(['/notificaciones-config']);
    }, 1500);
  }
}
