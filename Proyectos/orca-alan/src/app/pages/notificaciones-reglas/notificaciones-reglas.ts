import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';

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

interface AlertRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  entidadId?: string;
  metricaNombre: string;
  operador: string;
  valorUmbral: number;
  tipoAgregacion: string;
  periodoEvaluacion?: { cantidad: number; unidad: string };
  activo: boolean;
  rolesDestino: string[];
  usuariosDestino: string[];
  enviarInApp: boolean;
  enviarEmail: boolean;
  severidad: string;
  cooldownMinutos: number;
  fechaCreacion: Date;
}

interface ExpirationRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  diasAnticipacion: number[];
  diasDespuesVencido: number[];
  activo: boolean;
  notificarResponsable: boolean;
  notificarSupervisor: boolean;
  rolesDestino: string[];
  enviarInApp: boolean;
  enviarEmail: boolean;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-notificaciones-reglas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    TabsModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    InputNumberModule,
    MultiSelectModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="pi pi-cog"></i> Gestión de Reglas de Notificación</h1>
          <p>Configure las reglas que determinan cuándo y cómo se envían las notificaciones</p>
        </div>
      </div>

      <p-tabs [(value)]="tabActivo">
        <p-tablist>
          <p-tab [value]="0">
            <i class="pi pi-bell"></i>
            Reglas de Eventos
            <span class="badge">{{ notificationRules().length }}</span>
          </p-tab>
          <p-tab [value]="1">
            <i class="pi pi-exclamation-triangle"></i>
            Alertas por Umbral
            <span class="badge">{{ alertRules().length }}</span>
          </p-tab>
          <p-tab [value]="2">
            <i class="pi pi-calendar-clock"></i>
            Reglas de Vencimiento
            <span class="badge">{{ expirationRules().length }}</span>
          </p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- Tab: Reglas de Eventos -->
          <p-tabpanel [value]="0">
            <div class="tab-header">
              <h3>Reglas de Notificación por Eventos</h3>
              <p-button
                label="Nueva Regla"
                icon="pi pi-plus"
                (onClick)="abrirDialogNuevaRegla()"
              />
            </div>

            <p-table
              [value]="notificationRules()"
              [paginator]="true"
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reglas"
              [rowHover]="true"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Entidad</th>
                  <th>Evento</th>
                  <th>Severidad</th>
                  <th>Canales</th>
                  <th>Estado</th>
                  <th style="width: 120px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-regla>
                <tr>
                  <td>
                    <strong>{{ regla.nombre }}</strong>
                    @if (regla.descripcion) {
                      <br><small class="text-muted">{{ regla.descripcion }}</small>
                    }
                  </td>
                  <td>
                    <p-tag [value]="getEntidadLabel(regla.entidadTipo)" severity="info" />
                  </td>
                  <td>
                    <p-tag [value]="getEventoLabel(regla.eventoTipo)" [severity]="getEventoSeverity(regla.eventoTipo)" />
                  </td>
                  <td>
                    <p-tag [value]="regla.severidad" [severity]="getSeveridadSeverity(regla.severidad)" />
                  </td>
                  <td>
                    <div class="canales-icons">
                      @if (regla.enviarInApp) {
                        <i class="pi pi-desktop" pTooltip="In-App"></i>
                      }
                      @if (regla.enviarEmail) {
                        <i class="pi pi-envelope" pTooltip="Email"></i>
                      }
                    </div>
                  </td>
                  <td>
                    <p-tag
                      [value]="regla.activo ? 'Activa' : 'Inactiva'"
                      [severity]="regla.activo ? 'success' : 'secondary'"
                    />
                  </td>
                  <td>
                    <div class="action-buttons">
                      <p-button
                        icon="pi pi-pencil"
                        [rounded]="true"
                        [text]="true"
                        severity="info"
                        pTooltip="Editar"
                        (onClick)="editarRegla(regla)"
                      />
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        pTooltip="Eliminar"
                        (onClick)="confirmarEliminarRegla(regla)"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="empty-message">
                    <i class="pi pi-inbox"></i>
                    <p>No hay reglas de eventos configuradas</p>
                    <p-button label="Crear primera regla" icon="pi pi-plus" (onClick)="abrirDialogNuevaRegla()" />
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- Tab: Alertas por Umbral -->
          <p-tabpanel [value]="1">
            <div class="tab-header">
              <h3>Alertas por Umbral</h3>
              <p-button
                label="Nueva Alerta"
                icon="pi pi-plus"
                (onClick)="abrirDialogNuevaAlerta()"
              />
            </div>

            <p-table
              [value]="alertRules()"
              [paginator]="true"
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} alertas"
              [rowHover]="true"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Métrica</th>
                  <th>Condición</th>
                  <th>Severidad</th>
                  <th>Cooldown</th>
                  <th>Estado</th>
                  <th style="width: 120px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-alerta>
                <tr>
                  <td>
                    <strong>{{ alerta.nombre }}</strong>
                    @if (alerta.descripcion) {
                      <br><small class="text-muted">{{ alerta.descripcion }}</small>
                    }
                  </td>
                  <td>
                    <p-tag [value]="alerta.entidadTipo" severity="info" />
                    <br><small>{{ alerta.metricaNombre }}</small>
                  </td>
                  <td>
                    <code>{{ getOperadorLabel(alerta.operador) }} {{ alerta.valorUmbral }}</code>
                  </td>
                  <td>
                    <p-tag [value]="alerta.severidad" [severity]="getSeveridadSeverity(alerta.severidad)" />
                  </td>
                  <td>{{ alerta.cooldownMinutos }} min</td>
                  <td>
                    <p-tag
                      [value]="alerta.activo ? 'Activa' : 'Inactiva'"
                      [severity]="alerta.activo ? 'success' : 'secondary'"
                    />
                  </td>
                  <td>
                    <div class="action-buttons">
                      <p-button
                        icon="pi pi-pencil"
                        [rounded]="true"
                        [text]="true"
                        severity="info"
                        pTooltip="Editar"
                        (onClick)="editarAlerta(alerta)"
                      />
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        pTooltip="Eliminar"
                        (onClick)="confirmarEliminarAlerta(alerta)"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="empty-message">
                    <i class="pi pi-chart-line"></i>
                    <p>No hay alertas por umbral configuradas</p>
                    <p-button label="Crear primera alerta" icon="pi pi-plus" (onClick)="abrirDialogNuevaAlerta()" />
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>

          <!-- Tab: Reglas de Vencimiento -->
          <p-tabpanel [value]="2">
            <div class="tab-header">
              <h3>Reglas de Vencimiento</h3>
              <p-button
                label="Nueva Regla"
                icon="pi pi-plus"
                (onClick)="abrirDialogNuevoVencimiento()"
              />
            </div>

            <p-table
              [value]="expirationRules()"
              [paginator]="true"
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reglas"
              [rowHover]="true"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Entidad</th>
                  <th>Días Anticipación</th>
                  <th>Días Después</th>
                  <th>Canales</th>
                  <th>Estado</th>
                  <th style="width: 120px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-regla>
                <tr>
                  <td>
                    <strong>{{ regla.nombre }}</strong>
                    @if (regla.descripcion) {
                      <br><small class="text-muted">{{ regla.descripcion }}</small>
                    }
                  </td>
                  <td>
                    <p-tag [value]="getEntidadLabel(regla.entidadTipo)" severity="info" />
                  </td>
                  <td>
                    @for (dia of regla.diasAnticipacion; track dia) {
                      <p-tag [value]="'-' + dia + 'd'" severity="warn" styleClass="mr-1" />
                    }
                  </td>
                  <td>
                    @for (dia of regla.diasDespuesVencido; track dia) {
                      <p-tag [value]="'+' + dia + 'd'" severity="danger" styleClass="mr-1" />
                    }
                  </td>
                  <td>
                    <div class="canales-icons">
                      @if (regla.enviarInApp) {
                        <i class="pi pi-desktop" pTooltip="In-App"></i>
                      }
                      @if (regla.enviarEmail) {
                        <i class="pi pi-envelope" pTooltip="Email"></i>
                      }
                    </div>
                  </td>
                  <td>
                    <p-tag
                      [value]="regla.activo ? 'Activa' : 'Inactiva'"
                      [severity]="regla.activo ? 'success' : 'secondary'"
                    />
                  </td>
                  <td>
                    <div class="action-buttons">
                      <p-button
                        icon="pi pi-pencil"
                        [rounded]="true"
                        [text]="true"
                        severity="info"
                        pTooltip="Editar"
                        (onClick)="editarVencimiento(regla)"
                      />
                      <p-button
                        icon="pi pi-trash"
                        [rounded]="true"
                        [text]="true"
                        severity="danger"
                        pTooltip="Eliminar"
                        (onClick)="confirmarEliminarVencimiento(regla)"
                      />
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="empty-message">
                    <i class="pi pi-calendar"></i>
                    <p>No hay reglas de vencimiento configuradas</p>
                    <p-button label="Crear primera regla" icon="pi pi-plus" (onClick)="abrirDialogNuevoVencimiento()" />
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>

      <!-- Dialog: Regla de Evento -->
      <p-dialog
        [(visible)]="dialogReglaVisible"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <ng-template pTemplate="header">
          <div class="dialog-header-custom">
            <span class="dialog-title">{{ reglaEditando ? 'Editar Regla de Evento' : 'Nueva Regla de Evento' }}</span>
            <div class="dialog-header-toggle">
              <span class="toggle-label">Estado</span>
              <p-tag [value]="reglaForm.activo ? 'Activa' : 'Inactiva'" [severity]="reglaForm.activo ? 'success' : 'secondary'" />
              <p-checkbox [(ngModel)]="reglaForm.activo" [binary]="true" />
            </div>
          </div>
        </ng-template>

        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="regla-nombre">Nombre *</label>
              <input pInputText id="regla-nombre" [(ngModel)]="reglaForm.nombre" placeholder="Nombre de la regla" class="input-contrast" />
            </div>

            <div class="form-field full-width">
              <label for="regla-descripcion">Descripción</label>
              <textarea pTextarea id="regla-descripcion" [(ngModel)]="reglaForm.descripcion" rows="2" placeholder="Descripción opcional" class="input-contrast"></textarea>
            </div>

            <div class="form-field">
              <label for="regla-entidad">Tipo de Entidad *</label>
              <p-select
                id="regla-entidad"
                [(ngModel)]="reglaForm.entidadTipo"
                [options]="opcionesEntidad"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar entidad"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field">
              <label for="regla-evento">Tipo de Evento *</label>
              <p-select
                id="regla-evento"
                [(ngModel)]="reglaForm.eventoTipo"
                [options]="opcionesEvento"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar evento"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field full-width">
              <label for="regla-severidad">Severidad *</label>
              <p-select
                id="regla-severidad"
                [(ngModel)]="reglaForm.severidad"
                [options]="opcionesSeveridad"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar severidad"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-section full-width">
              <h4>Destinatarios</h4>
              <div class="checkbox-tags-group">
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="reglaForm.notificarCreador" [binary]="true" />
                  <p-tag value="Creador" severity="info" icon="pi pi-user" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="reglaForm.notificarResponsable" [binary]="true" />
                  <p-tag value="Responsable" severity="warn" icon="pi pi-user-edit" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="reglaForm.notificarAprobadores" [binary]="true" />
                  <p-tag value="Aprobadores" severity="success" icon="pi pi-users" />
                </div>
              </div>
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-tags-group">
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="reglaForm.enviarInApp" [binary]="true" />
                  <p-tag value="In-App" severity="info" icon="pi pi-desktop" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="reglaForm.enviarEmail" [binary]="true" />
                  <p-tag value="Email" severity="warn" icon="pi pi-envelope" />
                </div>
              </div>
            </div>

            <div class="form-field full-width">
              <label for="regla-plantilla">Plantilla del Mensaje</label>
              <textarea
                pTextarea
                id="regla-plantilla"
                [(ngModel)]="reglaForm.plantillaMensaje"
                rows="3"
                [placeholder]="'Usa ' + '{{nombre}}' + ', ' + '{{entidad.campo}}' + ' para placeholders'"
              ></textarea>
              <small class="hint">Placeholders disponibles: nombre, descripcion, responsable, etc.</small>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="dialogReglaVisible = false" />
          <p-button label="Guardar" icon="pi pi-check" (onClick)="guardarRegla()" />
        </ng-template>
      </p-dialog>

      <!-- Dialog: Alerta por Umbral -->
      <p-dialog
        [(visible)]="dialogAlertaVisible"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <ng-template pTemplate="header">
          <div class="dialog-header-custom">
            <span class="dialog-title">{{ alertaEditando ? 'Editar Alerta' : 'Nueva Alerta por Umbral' }}</span>
            <div class="dialog-header-toggle">
              <span class="toggle-label">Estado</span>
              <p-tag [value]="alertaForm.activo ? 'Activa' : 'Inactiva'" [severity]="alertaForm.activo ? 'success' : 'secondary'" />
              <p-checkbox [(ngModel)]="alertaForm.activo" [binary]="true" />
            </div>
          </div>
        </ng-template>

        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="alerta-nombre">Nombre *</label>
              <input pInputText id="alerta-nombre" [(ngModel)]="alertaForm.nombre" placeholder="Nombre de la alerta" class="input-contrast" />
            </div>

            <div class="form-field full-width">
              <label for="alerta-descripcion">Descripción</label>
              <textarea pTextarea id="alerta-descripcion" [(ngModel)]="alertaForm.descripcion" rows="2" placeholder="Descripción opcional" class="input-contrast"></textarea>
            </div>

            <div class="form-field">
              <label for="alerta-entidad">Tipo de Métrica *</label>
              <p-select
                id="alerta-entidad"
                [(ngModel)]="alertaForm.entidadTipo"
                [options]="opcionesMetrica"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar métrica"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field">
              <label for="alerta-metrica">Nombre de la Métrica</label>
              <input pInputText id="alerta-metrica" [(ngModel)]="alertaForm.metricaNombre" placeholder="ej: valorActual" class="input-contrast" />
            </div>

            <div class="form-field">
              <label for="alerta-operador">Operador *</label>
              <p-select
                id="alerta-operador"
                [(ngModel)]="alertaForm.operador"
                [options]="opcionesOperador"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field">
              <label for="alerta-umbral">Valor Umbral *</label>
              <p-inputNumber id="alerta-umbral" [(ngModel)]="alertaForm.valorUmbral" mode="decimal" [minFractionDigits]="0" [maxFractionDigits]="2" styleClass="input-contrast" />
            </div>

            <div class="form-field">
              <label for="alerta-severidad">Severidad *</label>
              <p-select
                id="alerta-severidad"
                [(ngModel)]="alertaForm.severidad"
                [options]="opcionesSeveridad"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field">
              <label for="alerta-cooldown">Cooldown (minutos)</label>
              <p-inputNumber id="alerta-cooldown" [(ngModel)]="alertaForm.cooldownMinutos" [min]="1" [max]="1440" styleClass="input-contrast" />
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-tags-group">
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="alertaForm.enviarInApp" [binary]="true" />
                  <p-tag value="In-App" severity="info" icon="pi pi-desktop" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="alertaForm.enviarEmail" [binary]="true" />
                  <p-tag value="Email" severity="warn" icon="pi pi-envelope" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="dialogAlertaVisible = false" />
          <p-button label="Guardar" icon="pi pi-check" (onClick)="guardarAlerta()" />
        </ng-template>
      </p-dialog>

      <!-- Dialog: Regla de Vencimiento -->
      <p-dialog
        [(visible)]="dialogVencimientoVisible"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <ng-template pTemplate="header">
          <div class="dialog-header-custom">
            <span class="dialog-title">{{ vencimientoEditando ? 'Editar Regla de Vencimiento' : 'Nueva Regla de Vencimiento' }}</span>
            <div class="dialog-header-toggle">
              <span class="toggle-label">Estado</span>
              <p-tag [value]="vencimientoForm.activo ? 'Activa' : 'Inactiva'" [severity]="vencimientoForm.activo ? 'success' : 'secondary'" />
              <p-checkbox [(ngModel)]="vencimientoForm.activo" [binary]="true" />
            </div>
          </div>
        </ng-template>

        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="venc-nombre">Nombre *</label>
              <input pInputText id="venc-nombre" [(ngModel)]="vencimientoForm.nombre" placeholder="Nombre de la regla" class="input-contrast" />
            </div>

            <div class="form-field full-width">
              <label for="venc-descripcion">Descripción</label>
              <textarea pTextarea id="venc-descripcion" [(ngModel)]="vencimientoForm.descripcion" rows="2" placeholder="Descripción opcional" class="input-contrast"></textarea>
            </div>

            <div class="form-field full-width">
              <label for="venc-entidad">Tipo de Entidad *</label>
              <p-select
                id="venc-entidad"
                [(ngModel)]="vencimientoForm.entidadTipo"
                [options]="opcionesEntidadVencimiento"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar entidad"
                styleClass="select-contrast"
              />
            </div>

            <div class="form-field full-width">
              <label>Días de Anticipación</label>
              <p-multiSelect
                [(ngModel)]="vencimientoForm.diasAnticipacion"
                [options]="opcionesDias"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar días"
                styleClass="select-contrast"
              />
              <small class="hint">Cuántos días antes del vencimiento enviar recordatorio</small>
            </div>

            <div class="form-field full-width">
              <label>Días Después del Vencimiento</label>
              <p-multiSelect
                [(ngModel)]="vencimientoForm.diasDespuesVencido"
                [options]="opcionesDiasDespues"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar días"
                styleClass="select-contrast"
              />
              <small class="hint">Cuántos días después del vencimiento seguir notificando</small>
            </div>

            <div class="form-section full-width">
              <h4>Destinatarios</h4>
              <div class="checkbox-tags-group">
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="vencimientoForm.notificarResponsable" [binary]="true" />
                  <p-tag value="Responsable" severity="warn" icon="pi pi-user-edit" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="vencimientoForm.notificarSupervisor" [binary]="true" />
                  <p-tag value="Supervisor" severity="info" icon="pi pi-user" />
                </div>
              </div>
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-tags-group">
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="vencimientoForm.enviarInApp" [binary]="true" />
                  <p-tag value="In-App" severity="info" icon="pi pi-desktop" />
                </div>
                <div class="checkbox-tag-item">
                  <p-checkbox [(ngModel)]="vencimientoForm.enviarEmail" [binary]="true" />
                  <p-tag value="Email" severity="warn" icon="pi pi-envelope" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="dialogVencimientoVisible = false" />
          <p-button label="Guardar" icon="pi pi-check" (onClick)="guardarVencimiento()" />
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header p {
      margin: 0;
      color: var(--text-color-secondary);
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .tab-header h3 {
      margin: 0;
    }

    .badge {
      background: var(--primary-color);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }

    .canales-icons {
      display: flex;
      gap: 0.5rem;
    }

    .canales-icons i {
      font-size: 1.1rem;
      color: var(--text-color-secondary);
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .empty-message {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-color-secondary);
    }

    .empty-message i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-message p {
      margin: 0 0 1rem 0;
    }

    .dialog-content {
      padding: 1rem 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
    }

    .form-section {
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    .form-section h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .hint {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    .text-muted {
      color: var(--text-color-secondary);
    }

    .mr-1 {
      margin-right: 0.25rem;
    }

    // ============================================================================
    // DIALOG HEADER CUSTOM - Toggle a la altura del título
    // ============================================================================
    .dialog-header-custom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 1rem;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .dialog-header-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    // ============================================================================
    // CHECKBOX WITH TAGS - Destinatarios y Canales
    // ============================================================================
    .checkbox-tags-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .checkbox-tag-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: var(--surface-ground);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--surface-hover);
        border-color: var(--primary-color);
      }
    }

    // ============================================================================
    // CONTRAST STYLES - Dark/Light Mode
    // ============================================================================
    :host ::ng-deep {
      .select-contrast,
      .input-contrast {
        width: 100%;
      }

      .select-contrast .p-select,
      .select-contrast.p-select {
        background: var(--surface-ground);
        border-color: var(--surface-border);

        .p-select-label {
          color: var(--text-color);
        }
      }

      .p-multiselect.select-contrast,
      .select-contrast .p-multiselect {
        background: var(--surface-ground);
        border-color: var(--surface-border);
        width: 100%;

        .p-multiselect-label {
          color: var(--text-color);
        }
      }

      .p-dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--surface-border);
      }

      .p-dialog-content {
        padding: 1.5rem;
      }

      .p-dialog-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid var(--surface-border);
      }
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color);
    }

    .form-section h4 {
      font-weight: 600;
      color: var(--text-color);
    }
  `],
})
export class NotificacionesReglasComponent implements OnInit {
  tabActivo = 0;

  // Data signals
  notificationRules = signal<NotificationRule[]>([]);
  alertRules = signal<AlertRule[]>([]);
  expirationRules = signal<ExpirationRule[]>([]);

  // Dialog visibility
  dialogReglaVisible = false;
  dialogAlertaVisible = false;
  dialogVencimientoVisible = false;

  // Editing states
  reglaEditando: NotificationRule | null = null;
  alertaEditando: AlertRule | null = null;
  vencimientoEditando: ExpirationRule | null = null;

  // Forms
  reglaForm: Partial<NotificationRule> = this.getReglaFormDefault();
  alertaForm: Partial<AlertRule> = this.getAlertaFormDefault();
  vencimientoForm: Partial<ExpirationRule> = this.getVencimientoFormDefault();

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

  opcionesMetrica = [
    { label: 'KPI', value: 'KPI' },
    { label: 'Conteo de Riesgos', value: 'RISK_COUNT' },
    { label: 'Conteo de Incidentes', value: 'INCIDENT_COUNT' },
    { label: 'Score de Cumplimiento', value: 'COMPLIANCE_SCORE' },
  ];

  opcionesOperador = [
    { label: 'Mayor que (>)', value: 'GT' },
    { label: 'Menor que (<)', value: 'LT' },
    { label: 'Mayor o igual (>=)', value: 'GTE' },
    { label: 'Menor o igual (<=)', value: 'LTE' },
    { label: 'Igual (=)', value: 'EQ' },
    { label: 'Diferente (!=)', value: 'NE' },
  ];

  opcionesEntidadVencimiento = [
    { label: 'Asignación de Cuestionario', value: 'QUESTIONNAIRE_ASSIGNMENT' },
    { label: 'Evidencia', value: 'EVIDENCE' },
    { label: 'Riesgo', value: 'RISK' },
    { label: 'Incidente', value: 'INCIDENT' },
  ];

  opcionesDias = [
    { label: '30 días antes', value: 30 },
    { label: '15 días antes', value: 15 },
    { label: '7 días antes', value: 7 },
    { label: '3 días antes', value: 3 },
    { label: '1 día antes', value: 1 },
  ];

  opcionesDiasDespues = [
    { label: '1 día después', value: 1 },
    { label: '3 días después', value: 3 },
    { label: '7 días después', value: 7 },
    { label: '15 días después', value: 15 },
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    // Simular carga de datos (en producción sería una llamada HTTP)
    this.notificationRules.set([
      {
        id: '1',
        nombre: 'Nuevo Activo Creado',
        descripcion: 'Notifica cuando se crea un nuevo activo',
        entidadTipo: 'ASSET',
        eventoTipo: 'CREATE',
        activo: true,
        notificarCreador: false,
        notificarResponsable: true,
        notificarAprobadores: false,
        rolesDestino: [],
        usuariosDestino: [],
        enviarInApp: true,
        enviarEmail: false,
        severidad: 'info',
        fechaCreacion: new Date(),
      },
      {
        id: '2',
        nombre: 'Incidente Crítico',
        descripcion: 'Alerta para incidentes de alta severidad',
        entidadTipo: 'INCIDENT',
        eventoTipo: 'CREATE',
        activo: true,
        notificarCreador: true,
        notificarResponsable: true,
        notificarAprobadores: true,
        rolesDestino: [],
        usuariosDestino: [],
        enviarInApp: true,
        enviarEmail: true,
        severidad: 'critical',
        fechaCreacion: new Date(),
      },
    ]);

    this.alertRules.set([
      {
        id: '1',
        nombre: 'KPI bajo nivel',
        descripcion: 'Alerta cuando un KPI baja del 70%',
        entidadTipo: 'KPI',
        metricaNombre: 'valorActual',
        operador: 'LT',
        valorUmbral: 70,
        tipoAgregacion: 'CURRENT',
        activo: true,
        rolesDestino: [],
        usuariosDestino: [],
        enviarInApp: true,
        enviarEmail: true,
        severidad: 'warning',
        cooldownMinutos: 60,
        fechaCreacion: new Date(),
      },
    ]);

    this.expirationRules.set([
      {
        id: '1',
        nombre: 'Vencimiento Cuestionarios',
        descripcion: 'Recordatorios para cuestionarios próximos a vencer',
        entidadTipo: 'QUESTIONNAIRE_ASSIGNMENT',
        diasAnticipacion: [7, 3, 1],
        diasDespuesVencido: [1, 7],
        activo: true,
        notificarResponsable: true,
        notificarSupervisor: false,
        rolesDestino: [],
        enviarInApp: true,
        enviarEmail: true,
        fechaCreacion: new Date(),
      },
    ]);
  }

  // Helpers
  getEntidadLabel(valor: string): string {
    return this.opcionesEntidad.find((o) => o.value === valor)?.label || valor;
  }

  getEventoLabel(valor: string): string {
    return this.opcionesEvento.find((o) => o.value === valor)?.label || valor;
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

  getSeveridadSeverity(valor: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (valor) {
      case 'info': return 'info';
      case 'warning': return 'warn';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  }

  getOperadorLabel(valor: string): string {
    return this.opcionesOperador.find((o) => o.value === valor)?.label || valor;
  }

  // Default form values
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

  getAlertaFormDefault(): Partial<AlertRule> {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      metricaNombre: '',
      operador: 'GT',
      valorUmbral: 0,
      tipoAgregacion: 'CURRENT',
      activo: true,
      rolesDestino: [],
      usuariosDestino: [],
      enviarInApp: true,
      enviarEmail: false,
      severidad: 'warning',
      cooldownMinutos: 60,
    };
  }

  getVencimientoFormDefault(): Partial<ExpirationRule> {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      diasAnticipacion: [7, 3, 1],
      diasDespuesVencido: [1, 7],
      activo: true,
      notificarResponsable: true,
      notificarSupervisor: false,
      rolesDestino: [],
      enviarInApp: true,
      enviarEmail: false,
    };
  }

  // Dialog handlers - Reglas
  abrirDialogNuevaRegla(): void {
    this.reglaEditando = null;
    this.reglaForm = this.getReglaFormDefault();
    this.dialogReglaVisible = true;
  }

  editarRegla(regla: NotificationRule): void {
    this.reglaEditando = regla;
    this.reglaForm = { ...regla };
    this.dialogReglaVisible = true;
  }

  guardarRegla(): void {
    if (!this.reglaForm.nombre || !this.reglaForm.entidadTipo || !this.reglaForm.eventoTipo) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
      return;
    }

    if (this.reglaEditando) {
      // Actualizar
      const reglas = this.notificationRules();
      const index = reglas.findIndex((r) => r.id === this.reglaEditando!.id);
      if (index >= 0) {
        reglas[index] = { ...reglas[index], ...this.reglaForm };
        this.notificationRules.set([...reglas]);
      }
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Regla actualizada correctamente' });
    } else {
      // Crear
      const nuevaRegla: NotificationRule = {
        ...(this.reglaForm as NotificationRule),
        id: Date.now().toString(),
        fechaCreacion: new Date(),
      };
      this.notificationRules.update((reglas) => [...reglas, nuevaRegla]);
      this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Regla creada correctamente' });
    }

    this.dialogReglaVisible = false;
  }

  confirmarEliminarRegla(regla: NotificationRule): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la regla "${regla.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.notificationRules.update((reglas) => reglas.filter((r) => r.id !== regla.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Regla eliminada correctamente' });
      },
    });
  }

  // Dialog handlers - Alertas
  abrirDialogNuevaAlerta(): void {
    this.alertaEditando = null;
    this.alertaForm = this.getAlertaFormDefault();
    this.dialogAlertaVisible = true;
  }

  editarAlerta(alerta: AlertRule): void {
    this.alertaEditando = alerta;
    this.alertaForm = { ...alerta };
    this.dialogAlertaVisible = true;
  }

  guardarAlerta(): void {
    if (!this.alertaForm.nombre || !this.alertaForm.entidadTipo || !this.alertaForm.operador) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
      return;
    }

    if (this.alertaEditando) {
      const alertas = this.alertRules();
      const index = alertas.findIndex((a) => a.id === this.alertaEditando!.id);
      if (index >= 0) {
        alertas[index] = { ...alertas[index], ...this.alertaForm };
        this.alertRules.set([...alertas]);
      }
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Alerta actualizada correctamente' });
    } else {
      const nuevaAlerta: AlertRule = {
        ...(this.alertaForm as AlertRule),
        id: Date.now().toString(),
        fechaCreacion: new Date(),
      };
      this.alertRules.update((alertas) => [...alertas, nuevaAlerta]);
      this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Alerta creada correctamente' });
    }

    this.dialogAlertaVisible = false;
  }

  confirmarEliminarAlerta(alerta: AlertRule): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la alerta "${alerta.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.alertRules.update((alertas) => alertas.filter((a) => a.id !== alerta.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Alerta eliminada correctamente' });
      },
    });
  }

  // Dialog handlers - Vencimientos
  abrirDialogNuevoVencimiento(): void {
    this.vencimientoEditando = null;
    this.vencimientoForm = this.getVencimientoFormDefault();
    this.dialogVencimientoVisible = true;
  }

  editarVencimiento(regla: ExpirationRule): void {
    this.vencimientoEditando = regla;
    this.vencimientoForm = { ...regla };
    this.dialogVencimientoVisible = true;
  }

  guardarVencimiento(): void {
    if (!this.vencimientoForm.nombre || !this.vencimientoForm.entidadTipo) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
      return;
    }

    if (this.vencimientoEditando) {
      const reglas = this.expirationRules();
      const index = reglas.findIndex((r) => r.id === this.vencimientoEditando!.id);
      if (index >= 0) {
        reglas[index] = { ...reglas[index], ...this.vencimientoForm };
        this.expirationRules.set([...reglas]);
      }
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Regla actualizada correctamente' });
    } else {
      const nuevaRegla: ExpirationRule = {
        ...(this.vencimientoForm as ExpirationRule),
        id: Date.now().toString(),
        fechaCreacion: new Date(),
      };
      this.expirationRules.update((reglas) => [...reglas, nuevaRegla]);
      this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Regla creada correctamente' });
    }

    this.dialogVencimientoVisible = false;
  }

  confirmarEliminarVencimiento(regla: ExpirationRule): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la regla "${regla.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.expirationRules.update((reglas) => reglas.filter((r) => r.id !== regla.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Regla eliminada correctamente' });
      },
    });
  }
}
