import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

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
  rolesDestino?: string[];
  enviarInApp: boolean;
  enviarEmail: boolean;
  severidad: string;
}

interface AlertRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  metricaNombre: string;
  operador: string;
  valorUmbral: number;
  activo: boolean;
  enviarInApp: boolean;
  enviarEmail: boolean;
  severidad: string;
  cooldownMinutos: number;
}

interface ExpirationRule {
  id: string;
  nombre: string;
  descripcion?: string;
  entidadTipo: string;
  diasAnticipacion: number[];
  diasDespuesVencido?: number[];
  activo: boolean;
  notificarResponsable: boolean;
  notificarSupervisor: boolean;
  enviarInApp: boolean;
  enviarEmail: boolean;
}

interface UserPreferences {
  id?: string;
  habilitado: boolean;
  emailHabilitado: boolean;
  inAppHabilitado: boolean;
  notificarInfo: boolean;
  notificarWarning: boolean;
  notificarCritical: boolean;
  frecuenciaEmail: string;
}

@Component({
  selector: 'app-notificaciones-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TabsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ToggleSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
    DividerModule,
    InputNumberModule,
    MultiSelectModule,
    TextareaModule,
    CheckboxModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="notificaciones-page">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Configuración de Notificaciones</h1>
          <p class="subtitle">Administra las reglas de notificación, alertas y preferencias del sistema</p>
        </div>
      </div>

      <!-- Tabs -->
      <p-tabs [(value)]="activeTab" styleClass="notificaciones-tabs">
        <p-tabpanel value="preferencias">
          <ng-template pTemplate="header">
            <i class="pi pi-cog"></i>
            <span>Preferencias</span>
          </ng-template>

          <div class="tab-content preferences-content">
            <div class="preferences-card">
              <h3>Preferencias Generales</h3>
              <p class="card-subtitle">Configura cómo deseas recibir las notificaciones</p>

              <div class="preferences-grid">
                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">Notificaciones habilitadas</span>
                    <span class="preference-desc">Activa o desactiva todas las notificaciones</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.habilitado" />
                </div>

                <p-divider />

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">Notificaciones In-App</span>
                    <span class="preference-desc">Recibe notificaciones dentro de la aplicación</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.inAppHabilitado" [disabled]="!preferences.habilitado" />
                </div>

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">Notificaciones por Email</span>
                    <span class="preference-desc">Recibe notificaciones en tu correo electrónico</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.emailHabilitado" [disabled]="!preferences.habilitado" />
                </div>

                <p-divider />

                <h4>Severidad de notificaciones</h4>

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">
                      <p-tag severity="info" value="Info" />
                      Informativas
                    </span>
                    <span class="preference-desc">Notificaciones de información general</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.notificarInfo" [disabled]="!preferences.habilitado" />
                </div>

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">
                      <p-tag severity="warn" value="Warning" />
                      Advertencias
                    </span>
                    <span class="preference-desc">Notificaciones de advertencia</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.notificarWarning" [disabled]="!preferences.habilitado" />
                </div>

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">
                      <p-tag severity="danger" value="Critical" />
                      Críticas
                    </span>
                    <span class="preference-desc">Notificaciones críticas y urgentes</span>
                  </div>
                  <p-toggleswitch [(ngModel)]="preferences.notificarCritical" [disabled]="!preferences.habilitado" />
                </div>

                <p-divider />

                <div class="preference-item">
                  <div class="preference-info">
                    <span class="preference-label">Frecuencia de email</span>
                    <span class="preference-desc">Con qué frecuencia recibir resúmenes por email</span>
                  </div>
                  <p-select
                    [(ngModel)]="preferences.frecuenciaEmail"
                    [options]="frecuenciaOptions"
                    optionLabel="label"
                    optionValue="value"
                    [disabled]="!preferences.emailHabilitado"
                    styleClass="w-12rem"
                  />
                </div>
              </div>

              <div class="preferences-actions">
                <button pButton label="Guardar preferencias" icon="pi pi-check" (click)="savePreferences()"></button>
              </div>
            </div>
          </div>
        </p-tabpanel>

        <p-tabpanel value="reglas">
          <ng-template pTemplate="header">
            <i class="pi pi-list"></i>
            <span>Reglas de Notificación</span>
            <p-tag [value]="notificationRules().length.toString()" severity="secondary" styleClass="ml-2" />
          </ng-template>

          <div class="tab-content">
            <div class="table-header">
              <span class="table-title">Reglas por evento</span>
              <button pButton label="Nueva regla" icon="pi pi-plus" (click)="openNotificationRuleDialog()"></button>
            </div>

            <p-table
              [value]="notificationRules()"
              [paginator]="true"
              [rows]="10"
              [showCurrentPageReport]="true"
              currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reglas"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Entidad</th>
                  <th>Evento</th>
                  <th>Canales</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th style="width: 100px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-rule>
                <tr>
                  <td>
                    <span class="font-medium">{{ rule.nombre }}</span>
                    @if (rule.descripcion) {
                      <br><small class="text-secondary">{{ rule.descripcion }}</small>
                    }
                  </td>
                  <td>
                    <p-tag [value]="getEntidadLabel(rule.entidadTipo)" severity="secondary" />
                  </td>
                  <td>{{ getEventoLabel(rule.eventoTipo) }}</td>
                  <td>
                    @if (rule.enviarInApp) {
                      <i class="pi pi-bell mr-2" pTooltip="In-App"></i>
                    }
                    @if (rule.enviarEmail) {
                      <i class="pi pi-envelope" pTooltip="Email"></i>
                    }
                  </td>
                  <td>
                    <p-tag [value]="rule.severidad" [severity]="getSeverityColor(rule.severidad)" />
                  </td>
                  <td>
                    <p-tag [value]="rule.activo ? 'Activo' : 'Inactivo'" [severity]="rule.activo ? 'success' : 'secondary'" />
                  </td>
                  <td>
                    <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editNotificationRule(rule)" pTooltip="Editar"></button>
                    <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteNotificationRule(rule)" pTooltip="Eliminar"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center p-4">
                    <i class="pi pi-inbox text-4xl text-secondary mb-3"></i>
                    <p>No hay reglas de notificación configuradas</p>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-tabpanel>

        <p-tabpanel value="alertas">
          <ng-template pTemplate="header">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Alertas por Umbral</span>
            <p-tag [value]="alertRules().length.toString()" severity="secondary" styleClass="ml-2" />
          </ng-template>

          <div class="tab-content">
            <div class="table-header">
              <span class="table-title">Alertas cuando se exceden umbrales</span>
              <button pButton label="Nueva alerta" icon="pi pi-plus" (click)="openAlertRuleDialog()"></button>
            </div>

            <p-table
              [value]="alertRules()"
              [paginator]="true"
              [rows]="10"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Entidad</th>
                  <th>Condición</th>
                  <th>Canales</th>
                  <th>Severidad</th>
                  <th>Cooldown</th>
                  <th>Estado</th>
                  <th style="width: 100px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-rule>
                <tr>
                  <td>
                    <span class="font-medium">{{ rule.nombre }}</span>
                  </td>
                  <td>
                    <p-tag [value]="getEntidadLabel(rule.entidadTipo)" severity="secondary" />
                  </td>
                  <td>
                    <code>{{ rule.metricaNombre }} {{ getOperadorLabel(rule.operador) }} {{ rule.valorUmbral }}</code>
                  </td>
                  <td>
                    @if (rule.enviarInApp) {
                      <i class="pi pi-bell mr-2" pTooltip="In-App"></i>
                    }
                    @if (rule.enviarEmail) {
                      <i class="pi pi-envelope" pTooltip="Email"></i>
                    }
                  </td>
                  <td>
                    <p-tag [value]="rule.severidad" [severity]="getSeverityColor(rule.severidad)" />
                  </td>
                  <td>{{ rule.cooldownMinutos }} min</td>
                  <td>
                    <p-tag [value]="rule.activo ? 'Activo' : 'Inactivo'" [severity]="rule.activo ? 'success' : 'secondary'" />
                  </td>
                  <td>
                    <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editAlertRule(rule)" pTooltip="Editar"></button>
                    <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteAlertRule(rule)" pTooltip="Eliminar"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center p-4">
                    <i class="pi pi-inbox text-4xl text-secondary mb-3"></i>
                    <p>No hay alertas por umbral configuradas</p>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-tabpanel>

        <p-tabpanel value="vencimientos">
          <ng-template pTemplate="header">
            <i class="pi pi-calendar"></i>
            <span>Vencimientos</span>
            <p-tag [value]="expirationRules().length.toString()" severity="secondary" styleClass="ml-2" />
          </ng-template>

          <div class="tab-content">
            <div class="table-header">
              <span class="table-title">Recordatorios de vencimiento</span>
              <button pButton label="Nueva regla" icon="pi pi-plus" (click)="openExpirationRuleDialog()"></button>
            </div>

            <p-table
              [value]="expirationRules()"
              [paginator]="true"
              [rows]="10"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Entidad</th>
                  <th>Días anticipación</th>
                  <th>Días después</th>
                  <th>Canales</th>
                  <th>Estado</th>
                  <th style="width: 100px">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-rule>
                <tr>
                  <td>
                    <span class="font-medium">{{ rule.nombre }}</span>
                  </td>
                  <td>
                    <p-tag [value]="getEntidadLabel(rule.entidadTipo)" severity="secondary" />
                  </td>
                  <td>
                    @for (dia of rule.diasAnticipacion; track dia) {
                      <p-tag [value]="dia + 'd'" severity="info" styleClass="mr-1" />
                    }
                  </td>
                  <td>
                    @if (rule.diasDespuesVencido?.length) {
                      @for (dia of rule.diasDespuesVencido; track dia) {
                        <p-tag [value]="'+' + dia + 'd'" severity="warn" styleClass="mr-1" />
                      }
                    } @else {
                      <span class="text-secondary">-</span>
                    }
                  </td>
                  <td>
                    @if (rule.enviarInApp) {
                      <i class="pi pi-bell mr-2" pTooltip="In-App"></i>
                    }
                    @if (rule.enviarEmail) {
                      <i class="pi pi-envelope" pTooltip="Email"></i>
                    }
                  </td>
                  <td>
                    <p-tag [value]="rule.activo ? 'Activo' : 'Inactivo'" [severity]="rule.activo ? 'success' : 'secondary'" />
                  </td>
                  <td>
                    <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editExpirationRule(rule)" pTooltip="Editar"></button>
                    <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="deleteExpirationRule(rule)" pTooltip="Eliminar"></button>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center p-4">
                    <i class="pi pi-inbox text-4xl text-secondary mb-3"></i>
                    <p>No hay reglas de vencimiento configuradas</p>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </p-tabpanel>
      </p-tabs>
    </div>

    <!-- Dialog: Notification Rule -->
    <p-dialog
      [(visible)]="showNotificationRuleDialog"
      [header]="editingNotificationRule ? 'Editar Regla' : 'Nueva Regla de Notificación'"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>Nombre *</label>
          <input pInputText [(ngModel)]="notificationRuleForm.nombre" class="w-full" placeholder="Nombre de la regla" />
        </div>

        <div class="form-field">
          <label>Descripción</label>
          <textarea pTextarea [(ngModel)]="notificationRuleForm.descripcion" class="w-full" rows="2" placeholder="Descripción opcional"></textarea>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Entidad *</label>
            <p-select [(ngModel)]="notificationRuleForm.entidadTipo" [options]="entidadOptions" optionLabel="label" optionValue="value" styleClass="w-full" placeholder="Seleccionar" />
          </div>
          <div class="form-field">
            <label>Evento *</label>
            <p-select [(ngModel)]="notificationRuleForm.eventoTipo" [options]="eventoOptions" optionLabel="label" optionValue="value" styleClass="w-full" placeholder="Seleccionar" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Severidad</label>
            <p-select [(ngModel)]="notificationRuleForm.severidad" [options]="severidadOptions" optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>
        </div>

        <p-divider />

        <h4>Destinatarios</h4>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.notificarCreador" [binary]="true" inputId="notifCreador" />
          <label for="notifCreador">Notificar al creador</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.notificarResponsable" [binary]="true" inputId="notifResp" />
          <label for="notifResp">Notificar al responsable</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.notificarAprobadores" [binary]="true" inputId="notifApprob" />
          <label for="notifApprob">Notificar a aprobadores</label>
        </div>

        <p-divider />

        <h4>Canales de envío</h4>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.enviarInApp" [binary]="true" inputId="inApp" />
          <label for="inApp"><i class="pi pi-bell mr-2"></i>In-App</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.enviarEmail" [binary]="true" inputId="email" />
          <label for="email"><i class="pi pi-envelope mr-2"></i>Email</label>
        </div>

        <p-divider />

        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="notificationRuleForm.activo" [binary]="true" inputId="activo" />
          <label for="activo">Regla activa</label>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="closeNotificationRuleDialog()"></button>
        <button pButton label="Guardar" icon="pi pi-check" (click)="saveNotificationRule()" [disabled]="!isNotificationRuleValid()"></button>
      </ng-template>
    </p-dialog>

    <!-- Dialog: Alert Rule -->
    <p-dialog
      [(visible)]="showAlertRuleDialog"
      [header]="editingAlertRule ? 'Editar Alerta' : 'Nueva Alerta por Umbral'"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>Nombre *</label>
          <input pInputText [(ngModel)]="alertRuleForm.nombre" class="w-full" placeholder="Nombre de la alerta" />
        </div>

        <div class="form-field">
          <label>Descripción</label>
          <textarea pTextarea [(ngModel)]="alertRuleForm.descripcion" class="w-full" rows="2"></textarea>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Entidad *</label>
            <p-select [(ngModel)]="alertRuleForm.entidadTipo" [options]="entidadOptions" optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>
          <div class="form-field">
            <label>Métrica *</label>
            <input pInputText [(ngModel)]="alertRuleForm.metricaNombre" class="w-full" placeholder="ej: count_critical" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Operador *</label>
            <p-select [(ngModel)]="alertRuleForm.operador" [options]="operadorOptions" optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>
          <div class="form-field">
            <label>Valor umbral *</label>
            <p-inputNumber [(ngModel)]="alertRuleForm.valorUmbral" styleClass="w-full" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label>Severidad</label>
            <p-select [(ngModel)]="alertRuleForm.severidad" [options]="severidadOptions" optionLabel="label" optionValue="value" styleClass="w-full" />
          </div>
          <div class="form-field">
            <label>Cooldown (minutos)</label>
            <p-inputNumber [(ngModel)]="alertRuleForm.cooldownMinutos" styleClass="w-full" [min]="1" />
          </div>
        </div>

        <p-divider />

        <h4>Canales de envío</h4>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="alertRuleForm.enviarInApp" [binary]="true" inputId="alertInApp" />
          <label for="alertInApp"><i class="pi pi-bell mr-2"></i>In-App</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="alertRuleForm.enviarEmail" [binary]="true" inputId="alertEmail" />
          <label for="alertEmail"><i class="pi pi-envelope mr-2"></i>Email</label>
        </div>

        <p-divider />

        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="alertRuleForm.activo" [binary]="true" inputId="alertActivo" />
          <label for="alertActivo">Alerta activa</label>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="closeAlertRuleDialog()"></button>
        <button pButton label="Guardar" icon="pi pi-check" (click)="saveAlertRule()" [disabled]="!isAlertRuleValid()"></button>
      </ng-template>
    </p-dialog>

    <!-- Dialog: Expiration Rule -->
    <p-dialog
      [(visible)]="showExpirationRuleDialog"
      [header]="editingExpirationRule ? 'Editar Regla' : 'Nueva Regla de Vencimiento'"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>Nombre *</label>
          <input pInputText [(ngModel)]="expirationRuleForm.nombre" class="w-full" placeholder="Nombre de la regla" />
        </div>

        <div class="form-field">
          <label>Descripción</label>
          <textarea pTextarea [(ngModel)]="expirationRuleForm.descripcion" class="w-full" rows="2"></textarea>
        </div>

        <div class="form-field">
          <label>Entidad *</label>
          <p-select [(ngModel)]="expirationRuleForm.entidadTipo" [options]="entidadOptions" optionLabel="label" optionValue="value" styleClass="w-full" />
        </div>

        <div class="form-field">
          <label>Días de anticipación (separados por coma) *</label>
          <input pInputText [(ngModel)]="expirationRuleForm.diasAnticipacionStr" class="w-full" placeholder="ej: 30, 15, 7, 1" />
          <small class="text-secondary">Cuántos días antes del vencimiento enviar recordatorios</small>
        </div>

        <div class="form-field">
          <label>Días después de vencido (separados por coma)</label>
          <input pInputText [(ngModel)]="expirationRuleForm.diasDespuesVencidoStr" class="w-full" placeholder="ej: 1, 7" />
          <small class="text-secondary">Recordatorios después del vencimiento (opcional)</small>
        </div>

        <p-divider />

        <h4>Destinatarios</h4>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="expirationRuleForm.notificarResponsable" [binary]="true" inputId="expResp" />
          <label for="expResp">Notificar al responsable</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="expirationRuleForm.notificarSupervisor" [binary]="true" inputId="expSup" />
          <label for="expSup">Notificar al supervisor</label>
        </div>

        <p-divider />

        <h4>Canales de envío</h4>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="expirationRuleForm.enviarInApp" [binary]="true" inputId="expInApp" />
          <label for="expInApp"><i class="pi pi-bell mr-2"></i>In-App</label>
        </div>
        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="expirationRuleForm.enviarEmail" [binary]="true" inputId="expEmail" />
          <label for="expEmail"><i class="pi pi-envelope mr-2"></i>Email</label>
        </div>

        <p-divider />

        <div class="checkbox-group">
          <p-checkbox [(ngModel)]="expirationRuleForm.activo" [binary]="true" inputId="expActivo" />
          <label for="expActivo">Regla activa</label>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="closeExpirationRuleDialog()"></button>
        <button pButton label="Guardar" icon="pi pi-check" (click)="saveExpirationRule()" [disabled]="!isExpirationRuleValid()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .notificaciones-page {
      padding: var(--spacing-6);
      max-width: 1400px;
      margin: 0 auto;
      background: var(--surface-ground);
      min-height: 100vh;
    }

    .page-header {
      margin-bottom: var(--spacing-6);

      h1 {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
        margin: 0 0 var(--spacing-1) 0;
      }

      .subtitle {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
        margin: 0;
      }
    }

    :host ::ng-deep .notificaciones-tabs {
      .p-tablist {
        background: var(--surface-card);
        border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
        border: 1px solid var(--surface-border);
        border-bottom: none;
        padding: var(--spacing-2) var(--spacing-4);
      }

      .p-tab {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-3) var(--spacing-4);
      }

      .p-tabpanels {
        background: var(--surface-card);
        border: 1px solid var(--surface-border);
        border-top: none;
        border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      }
    }

    .tab-content {
      padding: var(--spacing-4);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4);

      .table-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }
    }

    .preferences-content {
      max-width: 700px;
    }

    .preferences-card {
      h3 {
        margin: 0 0 var(--spacing-1) 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
      }

      h4 {
        margin: var(--spacing-2) 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color-secondary);
      }

      .card-subtitle {
        color: var(--text-color-secondary);
        font-size: var(--font-size-sm);
        margin: 0 0 var(--spacing-4) 0;
      }
    }

    .preferences-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-3) 0;
    }

    .preference-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);

      .preference-label {
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
      }

      .preference-desc {
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
      }
    }

    .preferences-actions {
      margin-top: var(--spacing-6);
      padding-top: var(--spacing-4);
      border-top: 1px solid var(--surface-border);
    }

    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);

      h4 {
        margin: 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color-secondary);
      }
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-4);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      label {
        cursor: pointer;
        display: flex;
        align-items: center;
      }
    }

    .text-secondary {
      color: var(--text-color-secondary);
    }

    .font-medium {
      font-weight: var(--font-weight-medium);
    }

    code {
      background: var(--surface-100);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: var(--font-size-sm);
    }
  `]
})
export class NotificacionesConfigComponent implements OnInit {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  activeTab = 'preferencias';

  // Data signals
  notificationRules = signal<NotificationRule[]>([]);
  alertRules = signal<AlertRule[]>([]);
  expirationRules = signal<ExpirationRule[]>([]);

  // Preferences
  preferences: UserPreferences = {
    habilitado: true,
    emailHabilitado: true,
    inAppHabilitado: true,
    notificarInfo: true,
    notificarWarning: true,
    notificarCritical: true,
    frecuenciaEmail: 'inmediato'
  };

  // Dialog states
  showNotificationRuleDialog = false;
  showAlertRuleDialog = false;
  showExpirationRuleDialog = false;

  editingNotificationRule: NotificationRule | null = null;
  editingAlertRule: AlertRule | null = null;
  editingExpirationRule: ExpirationRule | null = null;

  // Form models
  notificationRuleForm = this.getEmptyNotificationRuleForm();
  alertRuleForm = this.getEmptyAlertRuleForm();
  expirationRuleForm = this.getEmptyExpirationRuleForm();

  // Options
  entidadOptions = [
    { label: 'Activo', value: 'ASSET' },
    { label: 'Riesgo', value: 'RISK' },
    { label: 'Incidente', value: 'INCIDENT' },
    { label: 'Defecto', value: 'DEFECT' },
    { label: 'Proceso', value: 'PROCESS' },
    { label: 'Cuestionario', value: 'QUESTIONNAIRE' },
    { label: 'Revisión de Cumplimiento', value: 'COMPLIANCE_REVIEW' }
  ];

  eventoOptions = [
    { label: 'Creación', value: 'CREATE' },
    { label: 'Actualización', value: 'UPDATE' },
    { label: 'Eliminación', value: 'DELETE' },
    { label: 'Aprobación', value: 'APPROVAL' },
    { label: 'Rechazo', value: 'REJECTION' }
  ];

  severidadOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' }
  ];

  operadorOptions = [
    { label: 'Mayor que (>)', value: 'GT' },
    { label: 'Menor que (<)', value: 'LT' },
    { label: 'Mayor o igual (>=)', value: 'GTE' },
    { label: 'Menor o igual (<=)', value: 'LTE' }
  ];

  frecuenciaOptions = [
    { label: 'Inmediato', value: 'inmediato' },
    { label: 'Resumen diario', value: 'diario' },
    { label: 'Resumen semanal', value: 'semanal' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    try {
      const [rules, alerts, expirations, prefs] = await Promise.all([
        firstValueFrom(this.apiService.getNotificationRules()),
        firstValueFrom(this.apiService.getAlertRules()),
        firstValueFrom(this.apiService.getExpirationRules()),
        firstValueFrom(this.apiService.getNotificationPreferences()).catch(() => null)
      ]);

      this.notificationRules.set(rules.map((r: any) => ({
        ...r,
        rolesDestino: r.rolesDestino ? JSON.parse(r.rolesDestino) : []
      })));

      this.alertRules.set(alerts);

      this.expirationRules.set(expirations.map((r: any) => ({
        ...r,
        diasAnticipacion: r.diasAnticipacion ? JSON.parse(r.diasAnticipacion) : [],
        diasDespuesVencido: r.diasDespuesVencido ? JSON.parse(r.diasDespuesVencido) : []
      })));

      if (prefs) {
        this.preferences = { ...this.preferences, ...prefs };
      }
    } catch (err) {
      console.error('Error loading data:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos'
      });
    }
  }

  // Helpers
  getEntidadLabel(tipo: string): string {
    return this.entidadOptions.find(o => o.value === tipo)?.label || tipo;
  }

  getEventoLabel(evento: string): string {
    return this.eventoOptions.find(o => o.value === evento)?.label || evento;
  }

  getOperadorLabel(op: string): string {
    const labels: Record<string, string> = { GT: '>', LT: '<', GTE: '>=', LTE: '<=' };
    return labels[op] || op;
  }

  getSeverityColor(severity: string): 'info' | 'warn' | 'danger' | 'secondary' {
    const colors: Record<string, 'info' | 'warn' | 'danger'> = {
      info: 'info',
      warning: 'warn',
      critical: 'danger'
    };
    return colors[severity] || 'secondary';
  }

  // Preferences
  async savePreferences(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.updateNotificationPreferences(this.preferences));
      this.messageService.add({
        severity: 'success',
        summary: 'Guardado',
        detail: 'Preferencias actualizadas correctamente'
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron guardar las preferencias'
      });
    }
  }

  // Notification Rules
  getEmptyNotificationRuleForm() {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      eventoTipo: '',
      activo: true,
      notificarCreador: false,
      notificarResponsable: true,
      notificarAprobadores: false,
      enviarInApp: true,
      enviarEmail: false,
      severidad: 'info'
    };
  }

  openNotificationRuleDialog(): void {
    this.editingNotificationRule = null;
    this.notificationRuleForm = this.getEmptyNotificationRuleForm();
    this.showNotificationRuleDialog = true;
  }

  editNotificationRule(rule: NotificationRule): void {
    this.editingNotificationRule = rule;
    this.notificationRuleForm = {
      ...rule,
      descripcion: rule.descripcion || ''
    };
    this.showNotificationRuleDialog = true;
  }

  closeNotificationRuleDialog(): void {
    this.showNotificationRuleDialog = false;
    this.editingNotificationRule = null;
  }

  isNotificationRuleValid(): boolean {
    return !!(this.notificationRuleForm.nombre && this.notificationRuleForm.entidadTipo && this.notificationRuleForm.eventoTipo);
  }

  async saveNotificationRule(): Promise<void> {
    try {
      if (this.editingNotificationRule) {
        await firstValueFrom(this.apiService.updateNotificationRule(this.editingNotificationRule.id, this.notificationRuleForm));
      } else {
        await firstValueFrom(this.apiService.createNotificationRule(this.notificationRuleForm));
      }
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Regla guardada correctamente' });
      this.closeNotificationRuleDialog();
      this.loadData();
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la regla' });
    }
  }

  deleteNotificationRule(rule: NotificationRule): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la regla "${rule.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await firstValueFrom(this.apiService.deleteNotificationRule(rule.id));
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Regla eliminada' });
          this.loadData();
        } catch (err) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
        }
      }
    });
  }

  // Alert Rules
  getEmptyAlertRuleForm() {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      metricaNombre: '',
      operador: 'GT',
      valorUmbral: 0,
      activo: true,
      enviarInApp: true,
      enviarEmail: false,
      severidad: 'warning',
      cooldownMinutos: 60
    };
  }

  openAlertRuleDialog(): void {
    this.editingAlertRule = null;
    this.alertRuleForm = this.getEmptyAlertRuleForm();
    this.showAlertRuleDialog = true;
  }

  editAlertRule(rule: AlertRule): void {
    this.editingAlertRule = rule;
    this.alertRuleForm = {
      ...rule,
      descripcion: rule.descripcion || ''
    };
    this.showAlertRuleDialog = true;
  }

  closeAlertRuleDialog(): void {
    this.showAlertRuleDialog = false;
    this.editingAlertRule = null;
  }

  isAlertRuleValid(): boolean {
    return !!(this.alertRuleForm.nombre && this.alertRuleForm.entidadTipo && this.alertRuleForm.metricaNombre);
  }

  async saveAlertRule(): Promise<void> {
    try {
      if (this.editingAlertRule) {
        await firstValueFrom(this.apiService.updateAlertRule(this.editingAlertRule.id, this.alertRuleForm));
      } else {
        await firstValueFrom(this.apiService.createAlertRule(this.alertRuleForm));
      }
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Alerta guardada correctamente' });
      this.closeAlertRuleDialog();
      this.loadData();
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la alerta' });
    }
  }

  deleteAlertRule(rule: AlertRule): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la alerta "${rule.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await firstValueFrom(this.apiService.deleteAlertRule(rule.id));
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Alerta eliminada' });
          this.loadData();
        } catch (err) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
        }
      }
    });
  }

  // Expiration Rules
  getEmptyExpirationRuleForm() {
    return {
      nombre: '',
      descripcion: '',
      entidadTipo: '',
      diasAnticipacionStr: '30, 15, 7, 1',
      diasDespuesVencidoStr: '',
      activo: true,
      notificarResponsable: true,
      notificarSupervisor: false,
      enviarInApp: true,
      enviarEmail: false
    };
  }

  openExpirationRuleDialog(): void {
    this.editingExpirationRule = null;
    this.expirationRuleForm = this.getEmptyExpirationRuleForm();
    this.showExpirationRuleDialog = true;
  }

  editExpirationRule(rule: ExpirationRule): void {
    this.editingExpirationRule = rule;
    this.expirationRuleForm = {
      ...rule,
      diasAnticipacionStr: rule.diasAnticipacion.join(', '),
      diasDespuesVencidoStr: rule.diasDespuesVencido?.join(', ') || ''
    } as any;
    this.showExpirationRuleDialog = true;
  }

  closeExpirationRuleDialog(): void {
    this.showExpirationRuleDialog = false;
    this.editingExpirationRule = null;
  }

  isExpirationRuleValid(): boolean {
    return !!(this.expirationRuleForm.nombre && this.expirationRuleForm.entidadTipo && this.expirationRuleForm.diasAnticipacionStr);
  }

  async saveExpirationRule(): Promise<void> {
    try {
      const data = {
        ...this.expirationRuleForm,
        diasAnticipacion: JSON.stringify(this.expirationRuleForm.diasAnticipacionStr.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n))),
        diasDespuesVencido: this.expirationRuleForm.diasDespuesVencidoStr
          ? JSON.stringify(this.expirationRuleForm.diasDespuesVencidoStr.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n)))
          : null
      };
      delete (data as any).diasAnticipacionStr;
      delete (data as any).diasDespuesVencidoStr;

      if (this.editingExpirationRule) {
        await firstValueFrom(this.apiService.updateExpirationRule(this.editingExpirationRule.id, data));
      } else {
        await firstValueFrom(this.apiService.createExpirationRule(data));
      }
      this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Regla guardada correctamente' });
      this.closeExpirationRuleDialog();
      this.loadData();
    } catch (err) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la regla' });
    }
  }

  deleteExpirationRule(rule: ExpirationRule): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la regla "${rule.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await firstValueFrom(this.apiService.deleteExpirationRule(rule.id));
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Regla eliminada' });
          this.loadData();
        } catch (err) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
        }
      }
    });
  }
}
