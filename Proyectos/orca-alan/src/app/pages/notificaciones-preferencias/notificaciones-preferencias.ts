import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';

interface HorarioNoMolestar {
  habilitado: boolean;
  horaInicio: string;
  horaFin: string;
  diasSemana: number[];
}

interface PreferenciasNotificacion {
  prioridades: {
    critical: { email: boolean; inApp: boolean };
    high: { email: boolean; inApp: boolean };
    medium: { email: boolean; inApp: boolean };
    low: { email: boolean; inApp: boolean };
  };
  frecuenciaEmail: 'inmediato' | 'resumen_diario' | 'resumen_semanal';
  horaResumen: string;
}

interface DiaSemana {
  valor: number;
  label: string;
  labelCorto: string;
}

@Component({
  selector: 'app-notificaciones-preferencias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    SelectModule,
    TooltipModule,
    ToastModule,
    ToggleSwitchModule,
    CheckboxModule,
    TagModule,
    InputNumberModule
  ],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="preferencias-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <a routerLink="/notificaciones-config" class="back-link">
              <i class="pi pi-arrow-left"></i>
            </a>
            <div class="header-titles">
              <h1>Preferencias Personales</h1>
              <p class="subtitle">Configura cómo y cuándo recibir notificaciones</p>
            </div>
          </div>
        </div>
      </div>

      <div class="preferencias-content">
        <!-- Indicador de carga/guardado -->
        @if (guardandoPreferencias) {
          <div class="preferencias-loading">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Guardando preferencias...</span>
          </div>
        }

        <!-- Sección: Horario No Molestar -->
        <div class="preferencias-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-moon"></i>
              <h4>Horario No Molestar</h4>
            </div>
            <p-toggleswitch [(ngModel)]="horarioNoMolestar.habilitado" (onChange)="onPreferenceChange()" />
          </div>
          <p class="card-desc">Durante este horario no recibirás notificaciones, excepto las de prioridad crítica.</p>

          <div class="card-inputs" [class.disabled]="!horarioNoMolestar.habilitado">
            <!-- Días de la semana -->
            <div class="dias-section">
              <label>Días activos</label>
              <div class="dias-semana-grid">
                @for (dia of diasSemana; track dia.valor) {
                  <button
                    type="button"
                    class="dia-btn"
                    [class.active]="isDiaSeleccionado(dia.valor)"
                    [class.disabled]="!horarioNoMolestar.habilitado"
                    (click)="toggleDia(dia.valor)"
                    [pTooltip]="dia.label"
                    tooltipPosition="top"
                  >
                    {{ dia.labelCorto }}
                  </button>
                }
              </div>
            </div>

            <!-- Horas -->
            <div class="horas-section">
              <div class="hora-field">
                <label>Desde</label>
                <p-select
                  [(ngModel)]="horarioNoMolestar.horaInicio"
                  [options]="horasDisponibles"
                  optionLabel="label"
                  optionValue="value"
                  [disabled]="!horarioNoMolestar.habilitado"
                  styleClass="hora-select"
                  (onChange)="onPreferenceChange()"
                />
              </div>
              <div class="hora-separator">
                <i class="pi pi-arrow-right"></i>
              </div>
              <div class="hora-field">
                <label>Hasta</label>
                <p-select
                  [(ngModel)]="horarioNoMolestar.horaFin"
                  [options]="horasDisponibles"
                  optionLabel="label"
                  optionValue="value"
                  [disabled]="!horarioNoMolestar.habilitado"
                  styleClass="hora-select"
                  (onChange)="onPreferenceChange()"
                />
              </div>
            </div>
          </div>

          <div class="card-warning">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Las alertas con prioridad <strong>Crítica</strong> ignoran este horario</span>
          </div>
        </div>

        <!-- Sección: Rate Limiting Global -->
        <div class="preferencias-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-gauge"></i>
              <h4>Límite de Notificaciones</h4>
            </div>
            <p-toggleswitch [(ngModel)]="rateLimit.habilitado" (onChange)="onPreferenceChange()" />
          </div>
          <p class="card-desc">Limita el número máximo de notificaciones que puedes recibir por hora para evitar saturación.</p>

          <div class="card-inputs" [class.disabled]="!rateLimit.habilitado">
            <div class="rate-limit-field">
              <label>Máximo por hora</label>
              <div class="rate-limit-input-group">
                <p-inputNumber
                  [(ngModel)]="rateLimit.maxPorHora"
                  [min]="10"
                  [max]="1000"
                  [step]="10"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                  [disabled]="!rateLimit.habilitado"
                  (onInput)="onPreferenceChange()"
                  styleClass="rate-limit-input"
                />
                <span class="rate-limit-unit">notificaciones/hora</span>
              </div>
            </div>
          </div>

          <div class="card-info">
            <i class="pi pi-info-circle"></i>
            <span>Cuando se alcanza el límite, las notificaciones adicionales se omiten temporalmente</span>
          </div>
        </div>

        <!-- Sección: Frecuencia de Emails -->
        <div class="preferencias-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-envelope"></i>
              <h4>Frecuencia de Emails</h4>
            </div>
          </div>
          <p class="card-desc">¿Cómo prefieres recibir las notificaciones por email?</p>

          <div class="frecuencia-options">
            <div
              class="frecuencia-option"
              [class.selected]="preferenciasNotificacion.frecuenciaEmail === 'inmediato'"
              (click)="setFrecuenciaEmail('inmediato')"
            >
              <div class="frecuencia-option-icon">
                <i class="pi pi-bolt"></i>
              </div>
              <div class="frecuencia-option-content">
                <span class="frecuencia-option-title">Inmediato</span>
                <span class="frecuencia-option-desc">Recibe cada notificación al momento</span>
              </div>
              <div class="frecuencia-option-check">
                @if (preferenciasNotificacion.frecuenciaEmail === 'inmediato') {
                  <i class="pi pi-check-circle"></i>
                }
              </div>
            </div>

            <div
              class="frecuencia-option"
              [class.selected]="preferenciasNotificacion.frecuenciaEmail === 'resumen_diario'"
              (click)="setFrecuenciaEmail('resumen_diario')"
            >
              <div class="frecuencia-option-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="frecuencia-option-content">
                <span class="frecuencia-option-title">Resumen Diario</span>
                <span class="frecuencia-option-desc">Un email con todas las notificaciones del día</span>
              </div>
              <div class="frecuencia-option-check">
                @if (preferenciasNotificacion.frecuenciaEmail === 'resumen_diario') {
                  <i class="pi pi-check-circle"></i>
                }
              </div>
            </div>

            <div
              class="frecuencia-option"
              [class.selected]="preferenciasNotificacion.frecuenciaEmail === 'resumen_semanal'"
              (click)="setFrecuenciaEmail('resumen_semanal')"
            >
              <div class="frecuencia-option-icon">
                <i class="pi pi-calendar-plus"></i>
              </div>
              <div class="frecuencia-option-content">
                <span class="frecuencia-option-title">Resumen Semanal</span>
                <span class="frecuencia-option-desc">Un email semanal con el resumen de notificaciones</span>
              </div>
              <div class="frecuencia-option-check">
                @if (preferenciasNotificacion.frecuenciaEmail === 'resumen_semanal') {
                  <i class="pi pi-check-circle"></i>
                }
              </div>
            </div>
          </div>

          <!-- Hora del resumen (solo si es diario o semanal) -->
          @if (preferenciasNotificacion.frecuenciaEmail !== 'inmediato') {
            <div class="hora-resumen">
              <label>
                <i class="pi pi-clock"></i>
                Hora de envío del resumen
              </label>
              <p-select
                [(ngModel)]="preferenciasNotificacion.horaResumen"
                [options]="horasDisponibles"
                optionLabel="label"
                optionValue="value"
                styleClass="hora-select"
                (onChange)="onPreferenceChange()"
              />
            </div>
          }
        </div>

        <!-- Sección: Preferencias por Prioridad -->
        <div class="preferencias-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-flag"></i>
              <h4>Preferencias por Prioridad</h4>
            </div>
          </div>
          <p class="card-desc">Define qué canales usar según la prioridad de la notificación</p>

          <div class="prioridades-grid">
            <div class="prioridad-header">
              <span></span>
              <span>In-App</span>
              <span>Email</span>
            </div>
            <div class="prioridad-row">
              <span class="prioridad-label">
                <p-tag value="Crítica" severity="danger" />
              </span>
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.critical.inApp" [binary]="true" (onChange)="onPreferenceChange()" />
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.critical.email" [binary]="true" (onChange)="onPreferenceChange()" />
            </div>
            <div class="prioridad-row">
              <span class="prioridad-label">
                <p-tag value="Alta" severity="warn" />
              </span>
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.high.inApp" [binary]="true" (onChange)="onPreferenceChange()" />
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.high.email" [binary]="true" (onChange)="onPreferenceChange()" />
            </div>
            <div class="prioridad-row">
              <span class="prioridad-label">
                <p-tag value="Media" severity="info" />
              </span>
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.medium.inApp" [binary]="true" (onChange)="onPreferenceChange()" />
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.medium.email" [binary]="true" (onChange)="onPreferenceChange()" />
            </div>
            <div class="prioridad-row">
              <span class="prioridad-label">
                <p-tag value="Baja" severity="secondary" />
              </span>
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.low.inApp" [binary]="true" (onChange)="onPreferenceChange()" />
              <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.low.email" [binary]="true" (onChange)="onPreferenceChange()" />
            </div>
          </div>

          <div class="prioridades-footer">
            <span class="auto-save-hint" [class.visible]="preferenciasCambiadas">
              <i class="pi pi-info-circle"></i>
              Los cambios se guardan automáticamente
            </span>
            <button
              pButton
              label="Guardar preferencias"
              icon="pi pi-check"
              [loading]="guardandoPreferencias"
              (click)="guardarPreferencias()"
            ></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preferencias-page {
      padding: var(--spacing-6);
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: var(--spacing-6);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-lg);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      color: var(--text-color-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--surface-hover);
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
    }

    .header-titles {
      h1 {
        margin: 0;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }

      .subtitle {
        margin: var(--spacing-1) 0 0 0;
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }

    .preferencias-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
    }

    .preferencias-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-4);
      background: var(--blue-50);
      border-radius: var(--border-radius-md);
      color: var(--blue-700);
      font-size: var(--font-size-sm);

      i {
        font-size: 1rem;
      }
    }

    .preferencias-card {
      background: var(--surface-card);
      border-radius: var(--border-radius-xl);
      border: 1px solid var(--surface-border);
      padding: var(--spacing-6);
    }

    :host-context(.dark) .preferencias-card {
      background: var(--surface-900);
      border-color: var(--surface-700);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-2);
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      i {
        color: var(--primary-color);
        font-size: 1.25rem;
      }

      h4 {
        margin: 0;
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }
    }

    :host-context(.dark) .card-title h4 {
      color: var(--surface-0);
    }

    .card-desc {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      margin: 0 0 var(--spacing-4) 0;
    }

    :host-context(.dark) .card-desc {
      color: var(--surface-400);
    }

    .card-inputs {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-4);

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .dias-section {
      label {
        display: block;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
        margin-bottom: var(--spacing-2);
      }
    }

    :host-context(.dark) .dias-section label {
      color: var(--surface-0);
    }

    .dias-semana-grid {
      display: flex;
      gap: var(--spacing-2);
    }

    .dia-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--surface-border);
      background: var(--surface-ground);
      color: var(--text-color-secondary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(.disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }

      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    :host-context(.dark) .dia-btn {
      background: var(--surface-800);
      border-color: var(--surface-600);
      color: var(--surface-300);

      &:hover:not(.disabled) {
        border-color: var(--primary-color);
        color: var(--primary-color);
        background: var(--surface-700);
      }

      &.active {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
      }
    }

    .horas-section {
      display: flex;
      align-items: flex-end;
      gap: var(--spacing-3);
    }

    .hora-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
      }
    }

    :host-context(.dark) .hora-field label {
      color: var(--surface-0);
    }

    .hora-separator {
      padding-bottom: 10px;
      color: var(--text-color-secondary);
    }

    :host-context(.dark) .hora-separator {
      color: var(--surface-400);
    }

    :host ::ng-deep .hora-select {
      width: 120px;
    }

    .card-warning {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background: var(--orange-50);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--orange-700);

      i {
        color: var(--orange-500);
      }
    }

    :host-context(.dark) .card-warning {
      background: color-mix(in srgb, var(--orange-500) 15%, var(--surface-800));
      color: var(--orange-300);

      i {
        color: var(--orange-400);
      }
    }

    .card-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background: var(--blue-50);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--blue-700);

      i {
        color: var(--blue-500);
      }
    }

    :host-context(.dark) .card-info {
      background: color-mix(in srgb, var(--blue-500) 15%, var(--surface-800));
      color: var(--blue-300);

      i {
        color: var(--blue-400);
      }
    }

    .rate-limit-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
      }
    }

    :host-context(.dark) .rate-limit-field label {
      color: var(--surface-0);
    }

    .rate-limit-input-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .rate-limit-unit {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
    }

    :host-context(.dark) .rate-limit-unit {
      color: var(--surface-400);
    }

    :host ::ng-deep .rate-limit-input {
      width: 140px;
    }

    /* Frecuencia de Emails */
    .frecuencia-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--spacing-4);
    }

    @media (max-width: 768px) {
      .frecuencia-options {
        grid-template-columns: 1fr;
      }
    }

    .frecuencia-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-3);
      padding: var(--spacing-5);
      border: 2px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--surface-ground);
      position: relative;

      &:hover {
        border-color: var(--primary-400);
        background: var(--surface-100);
      }

      &.selected {
        border-color: var(--primary-color);
        background: color-mix(in srgb, var(--primary-color) 12%, var(--surface-ground));
      }
    }

    :host-context(.dark) .frecuencia-option {
      background: var(--surface-800);

      &:hover {
        background: var(--surface-700);
        border-color: var(--primary-400);
      }

      &.selected {
        background: color-mix(in srgb, var(--primary-color) 20%, var(--surface-800));
        border-color: var(--primary-color);
      }
    }

    .frecuencia-option-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.5rem;
        color: var(--text-color-secondary);
      }

      .selected & {
        background: var(--primary-color);

        i {
          color: white;
        }
      }
    }

    :host-context(.dark) .frecuencia-option-icon {
      background: var(--surface-600);

      i {
        color: var(--surface-300);
      }
    }

    :host-context(.dark) .frecuencia-option.selected .frecuencia-option-icon {
      background: var(--primary-color);

      i {
        color: white;
      }
    }

    .frecuencia-option-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .frecuencia-option-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      color: var(--text-color);
    }

    .frecuencia-option-desc {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      line-height: 1.4;
    }

    :host-context(.dark) .frecuencia-option-title {
      color: var(--surface-0);
    }

    :host-context(.dark) .frecuencia-option-desc {
      color: var(--surface-400);
    }

    .frecuencia-option-check {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
      }
    }

    .hora-resumen {
      margin-top: var(--spacing-4);
      padding: var(--spacing-4);
      background: var(--surface-100);
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: space-between;

      label {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);

        i {
          color: var(--text-color-secondary);
        }
      }
    }

    :host-context(.dark) .hora-resumen {
      background: var(--surface-700);

      label {
        color: var(--surface-0);

        i {
          color: var(--surface-400);
        }
      }
    }

    /* Prioridades Grid */
    .prioridades-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .prioridad-header,
    .prioridad-row {
      display: grid;
      grid-template-columns: 120px 80px 80px;
      align-items: center;
      gap: var(--spacing-2);
    }

    .prioridad-header {
      padding: var(--spacing-2) var(--spacing-3);

      span {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color-secondary);
        text-transform: uppercase;
        text-align: center;

        &:first-child {
          text-align: left;
        }
      }
    }

    .prioridad-row {
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--border-radius-md);

      &:hover {
        background: var(--surface-50);
      }

      :host ::ng-deep .p-checkbox {
        justify-content: center;
      }
    }

    .prioridad-label {
      display: flex;
      align-items: center;
    }

    .prioridades-footer {
      margin-top: var(--spacing-4);
      padding-top: var(--spacing-4);
      border-top: 1px solid var(--surface-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .auto-save-hint {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      opacity: 0;
      transition: opacity 0.3s ease;

      &.visible {
        opacity: 1;
      }

      i {
        color: var(--blue-500);
      }
    }
  `]
})
export class NotificacionesPreferenciasComponent implements OnInit {
  private messageService = inject(MessageService);

  // Estado de guardado
  guardandoPreferencias = false;
  preferenciasCambiadas = false;
  private autoSaveTimeout: any;

  // Horario No Molestar
  horarioNoMolestar: HorarioNoMolestar = {
    habilitado: false,
    horaInicio: '22:00',
    horaFin: '07:00',
    diasSemana: [1, 2, 3, 4, 5]
  };

  // Rate Limit
  rateLimit = {
    habilitado: false,
    maxPorHora: 100
  };

  // Días de la semana
  diasSemana: DiaSemana[] = [
    { valor: 0, label: 'Domingo', labelCorto: 'D' },
    { valor: 1, label: 'Lunes', labelCorto: 'L' },
    { valor: 2, label: 'Martes', labelCorto: 'M' },
    { valor: 3, label: 'Miércoles', labelCorto: 'X' },
    { valor: 4, label: 'Jueves', labelCorto: 'J' },
    { valor: 5, label: 'Viernes', labelCorto: 'V' },
    { valor: 6, label: 'Sábado', labelCorto: 'S' }
  ];

  // Horas disponibles
  horasDisponibles = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, '0')}:00`,
    value: `${i.toString().padStart(2, '0')}:00`
  }));

  // Preferencias de notificación
  preferenciasNotificacion: PreferenciasNotificacion = {
    prioridades: {
      critical: { email: true, inApp: true },
      high: { email: true, inApp: true },
      medium: { email: false, inApp: true },
      low: { email: false, inApp: true }
    },
    frecuenciaEmail: 'inmediato',
    horaResumen: '08:00'
  };

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  isDiaSeleccionado(dia: number): boolean {
    return this.horarioNoMolestar.diasSemana.includes(dia);
  }

  toggleDia(dia: number): void {
    if (!this.horarioNoMolestar.habilitado) return;

    const index = this.horarioNoMolestar.diasSemana.indexOf(dia);
    if (index > -1) {
      this.horarioNoMolestar.diasSemana.splice(index, 1);
    } else {
      this.horarioNoMolestar.diasSemana.push(dia);
      this.horarioNoMolestar.diasSemana.sort((a, b) => a - b);
    }
    this.onPreferenceChange();
  }

  setFrecuenciaEmail(frecuencia: 'inmediato' | 'resumen_diario' | 'resumen_semanal'): void {
    this.preferenciasNotificacion.frecuenciaEmail = frecuencia;
    this.onPreferenceChange();
  }

  onPreferenceChange(): void {
    this.preferenciasCambiadas = true;

    // Auto-save después de 2 segundos de inactividad
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    this.autoSaveTimeout = setTimeout(() => {
      this.guardarPreferencias();
    }, 2000);
  }

  guardarPreferencias(): void {
    this.guardandoPreferencias = true;

    // TODO: Implementar servicio real cuando esté disponible
    // Por ahora simulamos el guardado
    setTimeout(() => {
      this.guardandoPreferencias = false;
      this.preferenciasCambiadas = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Preferencias guardadas',
        detail: 'Tus preferencias han sido actualizadas'
      });
    }, 500);
  }

  private cargarPreferencias(): void {
    // TODO: Implementar servicio real cuando esté disponible
    // Por ahora usamos los valores por defecto
  }
}
