import { CommonModule } from '@angular/common';
import { Component, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, TreeNode, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TreeSelectModule } from 'primeng/treeselect';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ChipModule } from 'primeng/chip';
import { ApiService } from '../../services/api.service';

// Interfaces para Reglas de Notificación
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

// Interfaces para entidades asociadas
interface EntidadAsociada {
  id: string;
  nombre: string;
  tipo?: string;
}

interface NodoArbol {
  id: string;
  nombre: string;
  tipo?: string;
  icono?: string;
  hijos?: NodoArbol[];
}

// Interfaces según Historia de Usuario US-NOTIFICATIONS-001
interface ModuloNotificacion {
  id: string;
  nombre: string;
  codigo: string; // ASSET, RISK, INCIDENT, etc.
  icono: string;
  habilitado: boolean;
  eventos: EventoNotificacion[];
  // Tipo de selector: 'tree' para árbol jerárquico, 'multiselect' para lista plana
  tipoSelector: 'tree' | 'multiselect';
  entidadesAsociadas: EntidadAsociada[];
  nodosSeleccionados?: TreeNode[];
}

interface EventoNotificacion {
  tipo: string; // CREATE, UPDATE, DELETE, APPROVAL, REJECTION, EXPIRATION_REMINDER, KPI_CHANGE
  label: string;
  inApp: boolean;
  email: boolean;
  disponible: boolean; // Si aplica para este módulo
}

interface Destinatario {
  id: string;
  tipo: 'usuario' | 'email' | 'dinamico';
  valor: string;
  nombre?: string;
}

interface HorarioNoMolestar {
  habilitado: boolean;
  horaInicio: string;
  horaFin: string;
}

interface PreferenciasNotificacion {
  prioridades: {
    critical: { email: boolean; inApp: boolean };
    high: { email: boolean; inApp: boolean };
    medium: { email: boolean; inApp: boolean };
    low: { email: boolean; inApp: boolean };
  };
}

@Component({
  selector: 'app-notificaciones-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DividerModule,
    TooltipModule,
    ToastModule,
    ToggleSwitchModule,
    CheckboxModule,
    MultiSelectModule,
    TagModule,
    AutoCompleteModule,
    TreeSelectModule,
    TabsModule,
    TableModule,
    DialogModule,
    TextareaModule,
    ConfirmDialogModule,
    InputNumberModule,
    ChipModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="notificaciones-page">
      <!-- Header -->
      <div class="page-header">
        <h1>Configuración de Notificaciones</h1>
        <p class="subtitle">Configura las notificaciones por módulo y tus preferencias personales</p>
      </div>

      <div class="notificaciones-content">
        <!-- Tabs principales -->
        <p-tabs [(value)]="tabActivo">
          <p-tablist>
            <p-tab [value]="0">
              <i class="pi pi-cog mr-2"></i>
              Configuración por Módulo
            </p-tab>
            <p-tab [value]="1">
              <i class="pi pi-user mr-2"></i>
              Preferencias Personales
            </p-tab>
            <p-tab [value]="2">
              <i class="pi pi-cog mr-2"></i>
              Gestión de Reglas
            </p-tab>
          </p-tablist>

          <p-tabpanels>
            <!-- Tab 1: Configuración por Módulo -->
            <p-tabpanel [value]="0">
              <div class="notificaciones-layout">
                <!-- Panel Izquierdo: Lista de Módulos -->
                <div class="modulos-panel">
                  <div class="modulos-header">
                    <span class="modulos-title">Módulos</span>
                  </div>
                  <div class="modulos-list">
                    @for (modulo of modulos(); track modulo.id) {
                      <button
                        class="modulo-item"
                        [class.active]="moduloSeleccionado()?.id === modulo.id"
                        [class.habilitado]="modulo.habilitado"
                        (click)="seleccionarModulo(modulo)"
                      >
                        <div class="modulo-icon">
                          <i [class]="modulo.icono"></i>
                        </div>
                        <div class="modulo-info">
                          <span class="modulo-nombre">{{ modulo.nombre }}</span>
                          <span class="modulo-estado">
                            @if (modulo.habilitado) {
                              <i class="pi pi-check-circle"></i> Activo
                            } @else {
                              <i class="pi pi-circle"></i> Inactivo
                            }
                          </span>
                        </div>
                      </button>
                    }
                  </div>
                </div>

                <!-- Panel Derecho: Configuración del Módulo -->
                <div class="config-panel">
                  @if (moduloSeleccionado()) {
                    <div class="config-header">
                      <div class="config-title-row">
                        <div class="config-title">
                          <i [class]="moduloSeleccionado()!.icono"></i>
                          <h3>{{ moduloSeleccionado()!.nombre }}</h3>
                        </div>
                        <p-toggleswitch
                          [(ngModel)]="moduloSeleccionado()!.habilitado"
                          (onChange)="onModuloToggle()"
                        />
                      </div>
                      <p class="config-subtitle">Configura las notificaciones para este módulo</p>
                    </div>

                    <div class="config-body" [class.disabled]="!moduloSeleccionado()!.habilitado">
                <!-- Sección: Eventos -->
                <div class="config-section">
                  <h4 class="section-title">
                    <i class="pi pi-bolt"></i>
                    Eventos
                  </h4>
                  <p class="section-desc">Selecciona qué eventos generan notificaciones y por qué canal</p>

                  <div class="eventos-grid">
                    <div class="eventos-header">
                      <span class="evento-col-label">Evento</span>
                      <span class="canal-col-label">In-App</span>
                      <span class="canal-col-label">Email</span>
                    </div>
                    @for (evento of moduloSeleccionado()!.eventos; track evento.tipo) {
                      @if (evento.disponible) {
                        <div class="evento-row">
                          <span class="evento-label">{{ evento.label }}</span>
                          <div class="canal-check">
                            <p-checkbox
                              [(ngModel)]="evento.inApp"
                              [binary]="true"
                              [disabled]="!moduloSeleccionado()!.habilitado"
                            />
                          </div>
                          <div class="canal-check">
                            <p-checkbox
                              [(ngModel)]="evento.email"
                              [binary]="true"
                              [disabled]="!moduloSeleccionado()!.habilitado"
                            />
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>

                <p-divider />

                <!-- Sección: Aplica a (Entidades Asociadas) -->
                <div class="config-section">
                  <h4 class="section-title">
                    <i class="pi pi-sitemap"></i>
                    Aplica a
                  </h4>
                  <p class="section-desc">
                    @if (moduloSeleccionado()!.tipoSelector === 'tree') {
                      Selecciona los activos o contenedores específicos para los que aplicará esta configuración
                    } @else {
                      Selecciona las entidades específicas para las que aplicará esta configuración
                    }
                  </p>

                  @if (moduloSeleccionado()!.tipoSelector === 'tree') {
                    <!-- TreeSelect para Activos y Procesos -->
                    <div class="aplica-a-field">
                      <p-treeSelect
                        [(ngModel)]="moduloSeleccionado()!.nodosSeleccionados"
                        [options]="arbolEntidades()"
                        [metaKeySelection]="false"
                        selectionMode="checkbox"
                        placeholder="Buscar y seleccionar activos o procesos..."
                        [filter]="true"
                        filterPlaceholder="Buscar en el árbol..."
                        [showClear]="true"
                        styleClass="aplica-a-tree-select w-full"
                        [propagateSelectionUp]="true"
                        [propagateSelectionDown]="true"
                        scrollHeight="350px"
                      >
                        <ng-template pTemplate="value" let-nodes>
                          @if (!nodes || nodes.length === 0) {
                            <span class="placeholder-text">Buscar y seleccionar activos o procesos...</span>
                          } @else if (nodes.length <= 2) {
                            <div class="selected-chips">
                              @for (node of nodes; track node.key) {
                                <span class="selected-chip">
                                  <i [class]="node.icon" class="chip-icon"></i>
                                  {{ node.label }}
                                </span>
                              }
                            </div>
                          } @else {
                            <span class="selected-count">
                              <i class="pi pi-check-circle"></i>
                              {{ nodes.length }} elementos seleccionados
                            </span>
                          }
                        </ng-template>
                      </p-treeSelect>
                    </div>
                  } @else {
                    <!-- MultiSelect para otras entidades -->
                    <div class="aplica-a-field">
                      <p-multiSelect
                        [(ngModel)]="moduloSeleccionado()!.entidadesAsociadas"
                        [options]="entidadesDisponibles()"
                        optionLabel="nombre"
                        placeholder="Buscar y seleccionar..."
                        [filter]="true"
                        filterPlaceHolder="Buscar entidades..."
                        [showClear]="true"
                        display="chip"
                        styleClass="aplica-a-multiselect w-full"
                        scrollHeight="300px"
                      >
                        <ng-template let-item pTemplate="item">
                          <div class="entidad-option">
                            <i [class]="getEntidadIcon(item)"></i>
                            <span>{{ item.nombre }}</span>
                            @if (item.tipo) {
                              <p-tag [value]="item.tipo" severity="secondary" styleClass="ml-2" />
                            }
                          </div>
                        </ng-template>
                      </p-multiSelect>
                    </div>
                  }

                  <!-- Indicador de selección -->
                  <div class="aplica-a-info">
                    @if (moduloSeleccionado()!.tipoSelector === 'tree') {
                      @if (moduloSeleccionado()!.nodosSeleccionados && moduloSeleccionado()!.nodosSeleccionados!.length > 0) {
                        <i class="pi pi-check-circle"></i>
                        <span>{{ moduloSeleccionado()!.nodosSeleccionados!.length }} elemento(s) seleccionado(s)</span>
                      } @else {
                        <i class="pi pi-info-circle"></i>
                        <span>Si no seleccionas ninguno, la configuración aplicará a <strong>todos</strong> los elementos</span>
                      }
                    } @else {
                      @if (moduloSeleccionado()!.entidadesAsociadas && moduloSeleccionado()!.entidadesAsociadas.length > 0) {
                        <i class="pi pi-check-circle"></i>
                        <span>{{ moduloSeleccionado()!.entidadesAsociadas.length }} entidad(es) seleccionada(s)</span>
                      } @else {
                        <i class="pi pi-info-circle"></i>
                        <span>Si no seleccionas ninguna, la configuración aplicará a <strong>todas</strong> las entidades</span>
                      }
                    }
                  </div>
                </div>

                <p-divider />

                <!-- Sección: Destinatarios Adicionales -->
                <div class="config-section">
                  <h4 class="section-title">
                    <i class="pi pi-users"></i>
                    Destinatarios Adicionales
                  </h4>
                  <p class="section-desc">Agrega usuarios o correos que recibirán las notificaciones de este módulo</p>

                  <div class="destinatarios-list">
                    @for (dest of getDestinatariosModulo(); track dest.id) {
                      <div class="destinatario-item">
                        <div class="destinatario-info">
                          @if (dest.tipo === 'usuario') {
                            <i class="pi pi-user"></i>
                          } @else if (dest.tipo === 'email') {
                            <i class="pi pi-envelope"></i>
                          } @else {
                            <i class="pi pi-code"></i>
                          }
                          <span>{{ dest.nombre || dest.valor }}</span>
                          <p-tag
                            [value]="getDestinatarioTipoLabel(dest.tipo)"
                            [severity]="getDestinatarioSeverity(dest.tipo)"
                            styleClass="ml-2"
                          />
                        </div>
                        <button
                          pButton
                          icon="pi pi-times"
                          class="p-button-text p-button-danger p-button-sm"
                          (click)="eliminarDestinatario(dest.id)"
                          pTooltip="Eliminar"
                        ></button>
                      </div>
                    }

                    @if (getDestinatariosModulo().length === 0) {
                      <div class="destinatarios-empty">
                        <i class="pi pi-inbox"></i>
                        <span>No hay destinatarios adicionales</span>
                      </div>
                    }
                  </div>

                  <div class="agregar-destinatario">
                    <p-select
                      [(ngModel)]="nuevoDestinatarioTipo"
                      [options]="tiposDestinatario"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Tipo"
                      styleClass="tipo-select"
                    />
                    @if (nuevoDestinatarioTipo === 'usuario') {
                      <p-autoComplete
                        [(ngModel)]="nuevoDestinatarioValor"
                        [suggestions]="usuariosSugeridos()"
                        (completeMethod)="buscarUsuarios($event)"
                        field="nombre"
                        placeholder="Buscar usuario..."
                        styleClass="valor-input"
                      />
                    } @else {
                      <input
                        pInputText
                        [(ngModel)]="nuevoDestinatarioValor"
                        [placeholder]="getPlaceholderDestinatario()"
                        class="valor-input"
                      />
                    }
                    <button
                      pButton
                      icon="pi pi-plus"
                      label="Agregar"
                      [disabled]="!nuevoDestinatarioValor"
                      (click)="agregarDestinatario()"
                    ></button>
                  </div>

                  <div class="destinatarios-dinamicos-info">
                    <i class="pi pi-info-circle"></i>
                    <span>Variables dinámicas: <code>{{'{{entity.owner}}'}}</code>, <code>{{'{{entity.assignedTo}}'}}</code>, <code>{{'{{entity.createdBy}}'}}</code>, <code>{{'{{entity.approvers}}'}}</code></span>
                  </div>
                </div>
                    </div>

                    <div class="config-footer">
                      <button
                        pButton
                        label="Guardar configuración"
                        icon="pi pi-check"
                        (click)="guardarConfiguracionModulo()"
                      ></button>
                    </div>
                  } @else {
                    <div class="config-empty">
                      <i class="pi pi-arrow-left"></i>
                      <span>Selecciona un módulo para configurar sus notificaciones</span>
                    </div>
                  }
                </div>
              </div>
            </p-tabpanel>

            <!-- Tab 2: Preferencias Personales -->
            <p-tabpanel [value]="1">
              <div class="preferencias-container">
                <!-- Sección: Horario No Molestar -->
                <div class="horario-no-molestar-card">
                  <div class="horario-header">
                    <div class="horario-title">
                      <i class="pi pi-moon"></i>
                      <h4>Horario No Molestar</h4>
                    </div>
                    <p-toggleswitch [(ngModel)]="horarioNoMolestar.habilitado" />
                  </div>
                  <p class="horario-desc">Durante este horario no recibirás notificaciones, excepto las de prioridad crítica.</p>

                  <div class="horario-inputs" [class.disabled]="!horarioNoMolestar.habilitado">
                    <div class="horario-field">
                      <label>Desde</label>
                      <p-select
                        [(ngModel)]="horarioNoMolestar.horaInicio"
                        [options]="horasDisponibles"
                        optionLabel="label"
                        optionValue="value"
                        [disabled]="!horarioNoMolestar.habilitado"
                        styleClass="hora-select"
                      />
                    </div>
                    <div class="horario-field">
                      <label>Hasta</label>
                      <p-select
                        [(ngModel)]="horarioNoMolestar.horaFin"
                        [options]="horasDisponibles"
                        optionLabel="label"
                        optionValue="value"
                        [disabled]="!horarioNoMolestar.habilitado"
                        styleClass="hora-select"
                      />
                    </div>
                  </div>

                  <div class="horario-warning">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>Las alertas con prioridad <strong>Crítica</strong> ignoran este horario</span>
                  </div>
                </div>

                <!-- Sección: Preferencias por Prioridad -->
                <div class="prioridades-card">
                  <div class="prioridades-header">
                    <i class="pi pi-flag"></i>
                    <h4>Preferencias por Prioridad</h4>
                  </div>
                  <p class="prioridades-desc">Define qué canales usar según la prioridad de la notificación</p>

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
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.critical.inApp" [binary]="true" />
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.critical.email" [binary]="true" />
                    </div>
                    <div class="prioridad-row">
                      <span class="prioridad-label">
                        <p-tag value="Alta" severity="warn" />
                      </span>
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.high.inApp" [binary]="true" />
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.high.email" [binary]="true" />
                    </div>
                    <div class="prioridad-row">
                      <span class="prioridad-label">
                        <p-tag value="Media" severity="info" />
                      </span>
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.medium.inApp" [binary]="true" />
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.medium.email" [binary]="true" />
                    </div>
                    <div class="prioridad-row">
                      <span class="prioridad-label">
                        <p-tag value="Baja" severity="secondary" />
                      </span>
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.low.inApp" [binary]="true" />
                      <p-checkbox [(ngModel)]="preferenciasNotificacion.prioridades.low.email" [binary]="true" />
                    </div>
                  </div>

                  <div class="prioridades-footer">
                    <button
                      pButton
                      label="Guardar preferencias"
                      icon="pi pi-check"
                      (click)="guardarPreferencias()"
                    ></button>
                  </div>
                </div>
              </div>
            </p-tabpanel>

            <!-- Tab 3: Gestión de Reglas -->
            <p-tabpanel [value]="2">
              <div class="reglas-container">
                <!-- Toolbar con select y botón -->
                <div class="rules-toolbar">
                  <div class="rules-toolbar-left">
                    <h3>Gestión de Reglas</h3>
                    <div class="rules-type-selector">
                      <p-select
                        [(ngModel)]="tipoReglaSeleccionado"
                        [options]="opcionesTipoRegla"
                        optionLabel="label"
                        optionValue="value"
                        styleClass="rules-select"
                      >
                        <ng-template pTemplate="selectedItem" let-selected>
                          <div class="rules-select-item">
                            <i [class]="getIconoTipoRegla(selected.value)"></i>
                            <span>{{ selected.label }}</span>
                            <span class="rules-select-badge">{{ getConteoReglas(selected.value) }}</span>
                          </div>
                        </ng-template>
                        <ng-template pTemplate="item" let-option>
                          <div class="rules-select-item">
                            <i [class]="getIconoTipoRegla(option.value)"></i>
                            <span>{{ option.label }}</span>
                            <span class="rules-select-badge">{{ getConteoReglas(option.value) }}</span>
                          </div>
                        </ng-template>
                      </p-select>
                    </div>
                  </div>
                  <div class="rules-toolbar-right">
                    <p-button
                      [label]="getBotonNuevaReglaLabel()"
                      icon="pi pi-plus"
                      (onClick)="abrirDialogNuevaReglaPorTipo()"
                    />
                  </div>
                </div>

                <!-- Layout Lista-Detalle -->
                <div class="rules-list-detail">
                  <!-- Panel Izquierdo: Lista de Reglas -->
                  <div class="rules-list-panel">
                    <!-- Reglas de Eventos -->
                    @if (tipoReglaSeleccionado === 'todos' || tipoReglaSeleccionado === 'eventos') {
                      @if (tipoReglaSeleccionado === 'todos') {
                        <div class="rules-list-section-header">
                          <i class="pi pi-bell"></i>
                          <span>Reglas de Eventos</span>
                          <span class="rules-section-badge">{{ notificationRules().length }}</span>
                        </div>
                      }
                      @for (regla of notificationRules(); track regla.id) {
                        <div
                          class="rule-list-item"
                          [class.selected]="reglaSeleccionada()?.id === regla.id && tipoReglaSeleccionadaDetalle === 'evento'"
                          (click)="seleccionarRegla(regla, 'evento')"
                        >
                          <div class="rule-list-item-icon">
                            <i class="pi pi-bell"></i>
                          </div>
                          <div class="rule-list-item-content">
                            <div class="rule-list-item-title">{{ regla.nombre }}</div>
                            <div class="rule-list-item-meta">
                              <p-tag [value]="getEntidadLabel(regla.entidadTipo)" severity="info" [rounded]="true" />
                              <p-tag [value]="getEventoLabel(regla.eventoTipo)" [severity]="getEventoSeverity(regla.eventoTipo)" [rounded]="true" />
                            </div>
                          </div>
                          <div class="rule-list-item-status">
                            <i class="pi" [class.pi-check-circle]="regla.activo" [class.pi-times-circle]="!regla.activo" [class.text-success]="regla.activo" [class.text-muted]="!regla.activo"></i>
                          </div>
                        </div>
                      } @empty {
                        <div class="rules-list-empty">
                          <i class="pi pi-inbox"></i>
                          <p>No hay reglas de eventos</p>
                        </div>
                      }
                    }

                    <!-- Alertas por Umbral -->
                    @if (tipoReglaSeleccionado === 'todos' || tipoReglaSeleccionado === 'alertas') {
                      @if (tipoReglaSeleccionado === 'todos') {
                        <div class="rules-list-section-header">
                          <i class="pi pi-exclamation-triangle"></i>
                          <span>Alertas por Umbral</span>
                          <span class="rules-section-badge">{{ alertRules().length }}</span>
                        </div>
                      }
                      @for (alerta of alertRules(); track alerta.id) {
                        <div
                          class="rule-list-item"
                          [class.selected]="reglaSeleccionada()?.id === alerta.id && tipoReglaSeleccionadaDetalle === 'alerta'"
                          (click)="seleccionarRegla(alerta, 'alerta')"
                        >
                          <div class="rule-list-item-icon">
                            <i class="pi pi-exclamation-triangle"></i>
                          </div>
                          <div class="rule-list-item-content">
                            <div class="rule-list-item-title">{{ alerta.nombre }}</div>
                            <div class="rule-list-item-meta">
                              <p-tag [value]="alerta.entidadTipo" severity="info" [rounded]="true" />
                              <code class="condition-code">{{ getOperadorLabel(alerta.operador) }} {{ alerta.valorUmbral }}</code>
                            </div>
                          </div>
                          <div class="rule-list-item-status">
                            <i class="pi" [class.pi-check-circle]="alerta.activo" [class.pi-times-circle]="!alerta.activo" [class.text-success]="alerta.activo" [class.text-muted]="!alerta.activo"></i>
                          </div>
                        </div>
                      } @empty {
                        <div class="rules-list-empty">
                          <i class="pi pi-chart-line"></i>
                          <p>No hay alertas por umbral</p>
                        </div>
                      }
                    }

                    <!-- Reglas de Vencimiento -->
                    @if (tipoReglaSeleccionado === 'todos' || tipoReglaSeleccionado === 'vencimientos') {
                      @if (tipoReglaSeleccionado === 'todos') {
                        <div class="rules-list-section-header">
                          <i class="pi pi-calendar-clock"></i>
                          <span>Reglas de Vencimiento</span>
                          <span class="rules-section-badge">{{ expirationRules().length }}</span>
                        </div>
                      }
                      @for (regla of expirationRules(); track regla.id) {
                        <div
                          class="rule-list-item"
                          [class.selected]="reglaSeleccionada()?.id === regla.id && tipoReglaSeleccionadaDetalle === 'vencimiento'"
                          (click)="seleccionarRegla(regla, 'vencimiento')"
                        >
                          <div class="rule-list-item-icon">
                            <i class="pi pi-calendar-clock"></i>
                          </div>
                          <div class="rule-list-item-content">
                            <div class="rule-list-item-title">{{ regla.nombre }}</div>
                            <div class="rule-list-item-meta">
                              <p-tag [value]="getEntidadLabel(regla.entidadTipo)" severity="info" [rounded]="true" />
                            </div>
                          </div>
                          <div class="rule-list-item-status">
                            <i class="pi" [class.pi-check-circle]="regla.activo" [class.pi-times-circle]="!regla.activo" [class.text-success]="regla.activo" [class.text-muted]="!regla.activo"></i>
                          </div>
                        </div>
                      } @empty {
                        <div class="rules-list-empty">
                          <i class="pi pi-calendar"></i>
                          <p>No hay reglas de vencimiento</p>
                        </div>
                      }
                    }
                  </div>

                  <!-- Panel Derecho: Detalle y Edición -->
                  <div class="rules-detail-panel">
                    @if (reglaSeleccionada()) {
                      <!-- Header del detalle -->
                      <div class="detail-header">
                        <div class="detail-header-info">
                          <h3>{{ reglaSeleccionada()!.nombre }}</h3>
                          <p-tag
                            [value]="reglaSeleccionada()!.activo ? 'Activa' : 'Inactiva'"
                            [severity]="reglaSeleccionada()!.activo ? 'success' : 'secondary'"
                          />
                        </div>
                        <div class="detail-header-actions">
                          <p-button
                            icon="pi pi-trash"
                            severity="danger"
                            [text]="true"
                            [rounded]="true"
                            pTooltip="Eliminar regla"
                            (onClick)="eliminarReglaSeleccionada()"
                          />
                        </div>
                      </div>

                      <!-- Contenido editable -->
                      <div class="detail-content">
                        <!-- Información General -->
                        <div class="detail-section">
                          <h4>Información General</h4>
                          <div class="detail-form-grid">
                            <div class="detail-field">
                              <label>Nombre</label>
                              <input
                                pInputText
                                [(ngModel)]="reglaSeleccionada()!.nombre"
                                (ngModelChange)="marcarCambios()"
                              />
                            </div>
                            <div class="detail-field">
                              <label>Descripción</label>
                              <textarea
                                pTextarea
                                [(ngModel)]="reglaSeleccionada()!.descripcion"
                                (ngModelChange)="marcarCambios()"
                                rows="2"
                              ></textarea>
                            </div>
                            <div class="detail-field-row">
                              <div class="detail-field">
                                <label>Estado</label>
                                <p-toggleSwitch
                                  [(ngModel)]="reglaSeleccionada()!.activo"
                                  (ngModelChange)="marcarCambios()"
                                />
                              </div>
                              <div class="detail-field">
                                <label>Severidad</label>
                                <p-select
                                  [(ngModel)]="reglaSeleccionada()!.severidad"
                                  [options]="opcionesSeveridad"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Canales de Notificación -->
                        <div class="detail-section">
                          <h4>Canales de Notificación</h4>
                          <div class="channels-grid">
                            <div class="channel-option">
                              <p-checkbox
                                [(ngModel)]="reglaSeleccionada()!.enviarInApp"
                                [binary]="true"
                                (ngModelChange)="marcarCambios()"
                              />
                              <i class="pi pi-desktop"></i>
                              <span>Notificación In-App</span>
                            </div>
                            <div class="channel-option">
                              <p-checkbox
                                [(ngModel)]="reglaSeleccionada()!.enviarEmail"
                                [binary]="true"
                                (ngModelChange)="marcarCambios()"
                              />
                              <i class="pi pi-envelope"></i>
                              <span>Correo Electrónico</span>
                            </div>
                          </div>
                        </div>

                        <!-- Plantilla de Notificación (solo si enviarEmail está activo) -->
                        @if (reglaSeleccionada()!.enviarEmail) {
                          <div class="detail-section email-builder-section">
                            <h4>
                              <i class="pi pi-envelope mr-2"></i>
                              Plantilla de Notificación
                            </h4>

                            <!-- Resumen de la plantilla -->
                            <div class="email-template-summary">
                              <div class="template-info">
                                <div class="template-subject">
                                  <span class="subject-label">Asunto:</span>
                                  <span class="subject-value">{{ reglaSeleccionada()!.plantillaTitulo || 'Sin asunto definido' }}</span>
                                </div>
                                <div class="template-blocks-count">
                                  <i class="pi pi-th-large"></i>
                                  <span>{{ emailBlocks().length }} bloques</span>
                                </div>
                              </div>
                              <button
                                pButton
                                type="button"
                                label="Abrir Editor"
                                icon="pi pi-external-link"
                                class="p-button-outlined"
                                (click)="abrirEditorEmail()"
                              ></button>
                            </div>
                          </div>
                        }

                        <!-- Configuración específica según tipo -->
                        @if (tipoReglaSeleccionadaDetalle === 'evento') {
                          <div class="detail-section">
                            <h4>Configuración de Evento</h4>
                            <div class="detail-field-row">
                              <div class="detail-field">
                                <label>Tipo de Entidad</label>
                                <p-select
                                  [(ngModel)]="reglaSeleccionada()!.entidadTipo"
                                  [options]="opcionesEntidad"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                              <div class="detail-field">
                                <label>Tipo de Evento</label>
                                <p-select
                                  [(ngModel)]="reglaSeleccionada()!.eventoTipo"
                                  [options]="opcionesEvento"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                            </div>
                            <div class="detail-field">
                              <label>Destinatarios</label>
                              <div class="checkbox-group-vertical">
                                <p-checkbox [(ngModel)]="reglaSeleccionada()!.notificarCreador" [binary]="true" label="Notificar al creador" (ngModelChange)="marcarCambios()" />
                                <p-checkbox [(ngModel)]="reglaSeleccionada()!.notificarResponsable" [binary]="true" label="Notificar al responsable" (ngModelChange)="marcarCambios()" />
                                <p-checkbox [(ngModel)]="reglaSeleccionada()!.notificarAprobadores" [binary]="true" label="Notificar a aprobadores" (ngModelChange)="marcarCambios()" />
                              </div>
                            </div>
                          </div>
                        }

                        @if (tipoReglaSeleccionadaDetalle === 'alerta') {
                          <div class="detail-section">
                            <h4>Configuración de Alerta</h4>
                            <div class="detail-field-row">
                              <div class="detail-field">
                                <label>Tipo de Métrica</label>
                                <p-select
                                  [(ngModel)]="reglaSeleccionada()!.entidadTipo"
                                  [options]="opcionesMetrica"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                              <div class="detail-field">
                                <label>Nombre de Métrica</label>
                                <input pInputText [(ngModel)]="reglaSeleccionada()!.metricaNombre" (ngModelChange)="marcarCambios()" />
                              </div>
                            </div>
                            <div class="detail-field-row">
                              <div class="detail-field">
                                <label>Operador</label>
                                <p-select
                                  [(ngModel)]="reglaSeleccionada()!.operador"
                                  [options]="opcionesOperador"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                              <div class="detail-field">
                                <label>Valor Umbral</label>
                                <p-inputNumber [(ngModel)]="reglaSeleccionada()!.valorUmbral" (ngModelChange)="marcarCambios()" mode="decimal" />
                              </div>
                              <div class="detail-field">
                                <label>Cooldown (min)</label>
                                <p-inputNumber [(ngModel)]="reglaSeleccionada()!.cooldownMinutos" (ngModelChange)="marcarCambios()" [min]="1" />
                              </div>
                            </div>
                          </div>
                        }

                        @if (tipoReglaSeleccionadaDetalle === 'vencimiento') {
                          <div class="detail-section">
                            <h4>Configuración de Vencimiento</h4>
                            <div class="detail-field">
                              <label>Tipo de Entidad</label>
                              <p-select
                                [(ngModel)]="reglaSeleccionada()!.entidadTipo"
                                [options]="opcionesEntidadVencimiento"
                                optionLabel="label"
                                optionValue="value"
                                (ngModelChange)="marcarCambios()"
                                [style]="{ width: '100%' }"
                              />
                            </div>
                            <div class="detail-field-row">
                              <div class="detail-field">
                                <label>Días de Anticipación</label>
                                <p-multiSelect
                                  [(ngModel)]="reglaSeleccionada()!.diasAnticipacion"
                                  [options]="opcionesDias"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                              <div class="detail-field">
                                <label>Días Después</label>
                                <p-multiSelect
                                  [(ngModel)]="reglaSeleccionada()!.diasDespuesVencido"
                                  [options]="opcionesDiasDespues"
                                  optionLabel="label"
                                  optionValue="value"
                                  (ngModelChange)="marcarCambios()"
                                  [style]="{ width: '100%' }"
                                />
                              </div>
                            </div>
                            <div class="detail-field">
                              <label>Destinatarios</label>
                              <div class="checkbox-group-vertical">
                                <p-checkbox [(ngModel)]="reglaSeleccionada()!.notificarResponsable" [binary]="true" label="Notificar al responsable" (ngModelChange)="marcarCambios()" />
                                <p-checkbox [(ngModel)]="reglaSeleccionada()!.notificarSupervisor" [binary]="true" label="Notificar al supervisor" (ngModelChange)="marcarCambios()" />
                              </div>
                            </div>
                          </div>
                        }
                      </div>

                      <!-- Footer con botón guardar -->
                      @if (hayCambiosPendientes) {
                        <div class="detail-footer">
                          <p-button label="Descartar" icon="pi pi-times" [text]="true" (onClick)="descartarCambios()" />
                          <p-button label="Guardar Cambios" icon="pi pi-check" (onClick)="guardarCambiosInline()" />
                        </div>
                      }
                    } @else {
                      <!-- Estado vacío -->
                      <div class="detail-empty">
                        <i class="pi pi-arrow-left"></i>
                        <h4>Selecciona una regla</h4>
                        <p>Elige una regla de la lista para ver sus detalles y editarla</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>

      <!-- Dialog: Regla de Evento -->
      <p-dialog
        [(visible)]="dialogReglaVisible"
        [header]="reglaEditando ? 'Editar Regla de Evento' : 'Nueva Regla de Evento'"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="regla-nombre">Nombre *</label>
              <input pInputText id="regla-nombre" [(ngModel)]="reglaForm.nombre" placeholder="Nombre de la regla" />
            </div>

            <div class="form-field full-width">
              <label for="regla-descripcion">Descripción</label>
              <textarea pTextarea id="regla-descripcion" [(ngModel)]="reglaForm.descripcion" rows="2" placeholder="Descripción opcional"></textarea>
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
                [style]="{ width: '100%' }"
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
                [style]="{ width: '100%' }"
              />
            </div>

            <div class="form-field">
              <label for="regla-severidad">Severidad *</label>
              <p-select
                id="regla-severidad"
                [(ngModel)]="reglaForm.severidad"
                [options]="opcionesSeveridad"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar severidad"
                [style]="{ width: '100%' }"
              />
            </div>

            <div class="form-field">
              <label>Estado</label>
              <p-checkbox [(ngModel)]="reglaForm.activo" [binary]="true" label="Regla activa" />
            </div>

            <div class="form-section full-width">
              <h4>Destinatarios</h4>
              <div class="checkbox-group">
                <p-checkbox [(ngModel)]="reglaForm.notificarCreador" [binary]="true" label="Notificar al creador" />
                <p-checkbox [(ngModel)]="reglaForm.notificarResponsable" [binary]="true" label="Notificar al responsable" />
                <p-checkbox [(ngModel)]="reglaForm.notificarAprobadores" [binary]="true" label="Notificar a aprobadores" />
              </div>
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-group">
                <p-checkbox [(ngModel)]="reglaForm.enviarInApp" [binary]="true" label="Notificación In-App" />
                <p-checkbox [(ngModel)]="reglaForm.enviarEmail" [binary]="true" label="Correo electrónico" />
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
        [header]="alertaEditando ? 'Editar Alerta' : 'Nueva Alerta por Umbral'"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="alerta-nombre">Nombre *</label>
              <input pInputText id="alerta-nombre" [(ngModel)]="alertaForm.nombre" placeholder="Nombre de la alerta" />
            </div>

            <div class="form-field full-width">
              <label for="alerta-descripcion">Descripción</label>
              <textarea pTextarea id="alerta-descripcion" [(ngModel)]="alertaForm.descripcion" rows="2" placeholder="Descripción opcional"></textarea>
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
                [style]="{ width: '100%' }"
              />
            </div>

            <div class="form-field">
              <label for="alerta-metrica">Nombre de la Métrica</label>
              <input pInputText id="alerta-metrica" [(ngModel)]="alertaForm.metricaNombre" placeholder="ej: valorActual" />
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
                [style]="{ width: '100%' }"
              />
            </div>

            <div class="form-field">
              <label for="alerta-umbral">Valor Umbral *</label>
              <p-inputNumber id="alerta-umbral" [(ngModel)]="alertaForm.valorUmbral" mode="decimal" [minFractionDigits]="0" [maxFractionDigits]="2" />
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
                [style]="{ width: '100%' }"
              />
            </div>

            <div class="form-field">
              <label for="alerta-cooldown">Cooldown (minutos)</label>
              <p-inputNumber id="alerta-cooldown" [(ngModel)]="alertaForm.cooldownMinutos" [min]="1" [max]="1440" />
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-group">
                <p-checkbox [(ngModel)]="alertaForm.enviarInApp" [binary]="true" label="Notificación In-App" />
                <p-checkbox [(ngModel)]="alertaForm.enviarEmail" [binary]="true" label="Correo electrónico" />
              </div>
            </div>

            <div class="form-field full-width">
              <label>Estado</label>
              <p-checkbox [(ngModel)]="alertaForm.activo" [binary]="true" label="Alerta activa" />
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
        [header]="vencimientoEditando ? 'Editar Regla de Vencimiento' : 'Nueva Regla de Vencimiento'"
        [modal]="true"
        [style]="{ width: '650px' }"
        [draggable]="false"
      >
        <div class="dialog-content">
          <div class="form-grid">
            <div class="form-field full-width">
              <label for="venc-nombre">Nombre *</label>
              <input pInputText id="venc-nombre" [(ngModel)]="vencimientoForm.nombre" placeholder="Nombre de la regla" />
            </div>

            <div class="form-field full-width">
              <label for="venc-descripcion">Descripción</label>
              <textarea pTextarea id="venc-descripcion" [(ngModel)]="vencimientoForm.descripcion" rows="2" placeholder="Descripción opcional"></textarea>
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
                [style]="{ width: '100%' }"
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
                [style]="{ width: '100%' }"
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
                [style]="{ width: '100%' }"
              />
              <small class="hint">Cuántos días después del vencimiento seguir notificando</small>
            </div>

            <div class="form-section full-width">
              <h4>Destinatarios</h4>
              <div class="checkbox-group">
                <p-checkbox [(ngModel)]="vencimientoForm.notificarResponsable" [binary]="true" label="Notificar al responsable" />
                <p-checkbox [(ngModel)]="vencimientoForm.notificarSupervisor" [binary]="true" label="Notificar al supervisor" />
              </div>
            </div>

            <div class="form-section full-width">
              <h4>Canales de Notificación</h4>
              <div class="checkbox-group">
                <p-checkbox [(ngModel)]="vencimientoForm.enviarInApp" [binary]="true" label="Notificación In-App" />
                <p-checkbox [(ngModel)]="vencimientoForm.enviarEmail" [binary]="true" label="Correo electrónico" />
              </div>
            </div>

            <div class="form-field full-width">
              <label>Estado</label>
              <p-checkbox [(ngModel)]="vencimientoForm.activo" [binary]="true" label="Regla activa" />
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button label="Cancelar" icon="pi pi-times" [text]="true" (onClick)="dialogVencimientoVisible = false" />
          <p-button label="Guardar" icon="pi pi-check" (onClick)="guardarVencimiento()" />
        </ng-template>
      </p-dialog>

      <!-- Drawer del Editor de Email -->
      @if (emailDrawerVisible && reglaSeleccionada()) {
        <div class="email-drawer-overlay visible" (click)="cerrarEditorEmail()"></div>
        <div class="email-drawer open">
          <div class="drawer-header">
            <div class="drawer-title">
              <i class="pi pi-bell"></i>
              <span>Diseño de Notificación</span>
            </div>
            <button type="button" class="drawer-close-btn" (click)="cerrarEditorEmail()">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <div class="drawer-content">
            <!-- Asunto del correo -->
            <div class="drawer-section">
              <label class="drawer-label">Asunto del correo</label>
              <input
                pInputText
                [(ngModel)]="reglaSeleccionada()!.plantillaTitulo"
                (ngModelChange)="marcarCambios()"
                placeholder="Ej: Nueva notificación - [nombre]"
                class="drawer-input"
              />
            </div>

          <!-- Layout del editor: Editor + Preview -->
          <div class="drawer-editor-layout">
            <!-- Panel de edición -->
            <div class="drawer-editor-panel">
              <div class="panel-header">
                <span class="panel-title">Editor de Bloques</span>
              </div>

              <!-- Barra de herramientas -->
              <div class="drawer-toolbar">
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
              <div class="drawer-canvas">
                @if (emailBlocks().length === 0) {
                  <div class="drawer-empty-state">
                    <i class="pi pi-file-edit"></i>
                    <p>Agrega bloques usando los botones de arriba</p>
                  </div>
                }
                @for (block of emailBlocks(); track block.id; let i = $index) {
                  <div class="drawer-block" [class.selected]="bloqueSeleccionado === block.id" (click)="seleccionarBloque(block.id)">
                    <div class="drawer-block-drag">
                      <i class="pi pi-bars"></i>
                    </div>
                    <div class="drawer-block-content">
                      @switch (block.type) {
                        @case ('header') {
                          <input
                            type="text"
                            class="drawer-block-input drawer-block-header"
                            [(ngModel)]="block.content"
                            (ngModelChange)="actualizarBloque(block)"
                            placeholder="Escribe un título..."
                            [style.text-align]="block.styles?.alignment || 'left'"
                          />
                        }
                        @case ('paragraph') {
                          <textarea
                            class="drawer-block-input drawer-block-paragraph"
                            [(ngModel)]="block.content"
                            (ngModelChange)="actualizarBloque(block)"
                            placeholder="Escribe un párrafo..."
                            rows="3"
                            [style.text-align]="block.styles?.alignment || 'left'"
                          ></textarea>
                        }
                        @case ('variable') {
                          <div class="drawer-block-variable">
                            <span class="variable-label">Variable:</span>
                            <p-select
                              [(ngModel)]="block.content"
                              [options]="opcionesVariables"
                              optionLabel="label"
                              optionValue="value"
                              placeholder="Seleccionar"
                              (ngModelChange)="actualizarBloque(block)"
                              [style]="{ width: '100%' }"
                            />
                          </div>
                        }
                        @case ('button') {
                          <div class="drawer-block-button">
                            <input
                              type="text"
                              class="drawer-block-input"
                              [(ngModel)]="block.content"
                              (ngModelChange)="actualizarBloque(block)"
                              placeholder="Texto del botón..."
                            />
                            <div class="button-preview-small">
                              <span>{{ block.content || 'Botón' }}</span>
                            </div>
                          </div>
                        }
                        @case ('divider') {
                          <div class="drawer-block-divider">
                            <hr />
                          </div>
                        }
                        @case ('list') {
                          <textarea
                            class="drawer-block-input drawer-block-list"
                            [(ngModel)]="block.content"
                            (ngModelChange)="actualizarBloque(block)"
                            placeholder="Elementos separados por líneas..."
                            rows="3"
                          ></textarea>
                        }
                        @case ('alert') {
                          <div class="drawer-block-alert">
                            <div class="alert-types">
                              <button type="button" [class.active]="block.styles?.color === 'info' || !block.styles?.color" (click)="setAlertType(block, 'info')">
                                <i class="pi pi-info-circle"></i>
                              </button>
                              <button type="button" [class.active]="block.styles?.color === 'warning'" (click)="setAlertType(block, 'warning')">
                                <i class="pi pi-exclamation-triangle"></i>
                              </button>
                              <button type="button" [class.active]="block.styles?.color === 'danger'" (click)="setAlertType(block, 'danger')">
                                <i class="pi pi-times-circle"></i>
                              </button>
                            </div>
                            <textarea
                              class="drawer-block-input"
                              [(ngModel)]="block.content"
                              (ngModelChange)="actualizarBloque(block)"
                              placeholder="Mensaje de alerta..."
                              rows="2"
                            ></textarea>
                          </div>
                        }
                      }
                    </div>
                    <div class="drawer-block-actions">
                      @if (block.type !== 'divider' && block.type !== 'variable') {
                        <button type="button" (click)="setBlockAlignment(block, 'left')" [class.active]="block.styles?.alignment === 'left' || !block.styles?.alignment" pTooltip="Izquierda">
                          <i class="pi pi-align-left"></i>
                        </button>
                        <button type="button" (click)="setBlockAlignment(block, 'center')" [class.active]="block.styles?.alignment === 'center'" pTooltip="Centro">
                          <i class="pi pi-align-center"></i>
                        </button>
                        <button type="button" (click)="setBlockAlignment(block, 'right')" [class.active]="block.styles?.alignment === 'right'" pTooltip="Derecha">
                          <i class="pi pi-align-right"></i>
                        </button>
                        <span class="actions-divider"></span>
                      }
                      <button type="button" (click)="moverBloque(i, -1)" [disabled]="i === 0" pTooltip="Subir">
                        <i class="pi pi-arrow-up"></i>
                      </button>
                      <button type="button" (click)="moverBloque(i, 1)" [disabled]="i === emailBlocks().length - 1" pTooltip="Bajar">
                        <i class="pi pi-arrow-down"></i>
                      </button>
                      <button type="button" class="delete-btn" (click)="eliminarBloque(block.id)" pTooltip="Eliminar">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Panel de vista previa -->
            <div class="drawer-preview-panel">
              <div class="panel-header">
                <span class="panel-title">Vista Previa</span>
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

              <div class="drawer-preview-content" [class.dark-mode]="previewDarkMode">
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
                        <h1 class="preview-header" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Título de la Notificación' }}</h1>
                      }
                      @case ('paragraph') {
                        <p class="preview-paragraph" [style.text-align]="block.styles?.alignment || 'left'">{{ block.content || 'Contenido del párrafo...' }}</p>
                      }
                      @case ('variable') {
                        @switch (block.content) {
                          @case ('nombre') {
                            <div class="variable-card">
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                              <div class="variable-label">
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
                          <span class="inapp-title">{{ reglaSeleccionada()?.nombre || 'Nueva Notificación' }}</span>
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
                        <!-- Mensaje principal -->
                        <p class="inapp-message">
                          @if (emailBlocks().length > 0) {
                            @for (block of emailBlocks(); track block.id) {
                              @if (block.type === 'paragraph') {
                                {{ block.content }}
                              }
                              @if (block.type === 'variable' && block.content === 'nombre') {
                                <strong>{{ previewData.nombre }}</strong>
                              }
                            }
                          } @else {
                            Se ha detectado un evento en <strong>{{ previewData.nombre }}</strong> que requiere su atención.
                          }
                        </p>

                        <!-- Variables en cards compactas -->
                        <div class="inapp-variables">
                          <!-- Nombre/Entidad -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-tag"></i>
                              Entidad
                            </span>
                            <div class="inapp-var-value">
                              <span class="inapp-entity-badge">
                                <i [class]="previewData.entidad.icono"></i>
                                {{ previewData.nombre }}
                              </span>
                            </div>
                          </div>

                          <!-- Severidad -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-exclamation-triangle"></i>
                              Severidad
                            </span>
                            <div class="inapp-var-value">
                              <p-tag
                                [value]="previewData.severidad.label"
                                [severity]="previewData.severidad.severity"
                                [rounded]="true"
                              />
                            </div>
                          </div>

                          <!-- Estado -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-info-circle"></i>
                              Estado
                            </span>
                            <div class="inapp-var-value">
                              <span class="inapp-status-badge" [class]="'status-' + previewData.estado.color">
                                <i class="pi pi-circle-fill"></i>
                                {{ previewData.estado.label }}
                              </span>
                            </div>
                          </div>

                          <!-- Fecha -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-calendar"></i>
                              Fecha
                            </span>
                            <div class="inapp-var-value">
                              <span class="inapp-date">{{ previewData.fecha }}</span>
                            </div>
                          </div>

                          <!-- Responsable -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-user"></i>
                              Responsable
                            </span>
                            <div class="inapp-var-value">
                              <span class="inapp-user-chip">
                                <span class="inapp-avatar">{{ previewData.responsable.iniciales }}</span>
                                {{ previewData.responsable.nombre }}
                              </span>
                            </div>
                          </div>

                          <!-- Creador -->
                          <div class="inapp-var-row">
                            <span class="inapp-var-label">
                              <i class="pi pi-user-plus"></i>
                              Creado por
                            </span>
                            <div class="inapp-var-value">
                              <span class="inapp-user-chip">
                                <span class="inapp-avatar">{{ previewData.creador.iniciales }}</span>
                                {{ previewData.creador.nombre }}
                              </span>
                            </div>
                          </div>
                        </div>
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
                        <span class="toast-title">{{ reglaSeleccionada()?.nombre || 'Nueva Notificación' }}</span>
                        <span class="toast-message">{{ previewData.nombre }}</span>
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
          </div>
        </div>

        <div class="drawer-footer">
          <button pButton type="button" label="Cerrar" icon="pi pi-times" class="p-button-text" (click)="cerrarEditorEmail()"></button>
          <button pButton type="button" label="Guardar Plantilla" icon="pi pi-check" (click)="guardarPlantillaEmail()"></button>
        </div>
      </div>
      }
    </div>
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

    .notificaciones-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);

      :host ::ng-deep {
        .p-tabs {
          .p-tablist {
            background: var(--surface-card);
            border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
            border: 1px solid var(--surface-border);
            border-bottom: none;
            padding: var(--spacing-2);
          }

          .p-tab {
            padding: var(--spacing-3) var(--spacing-4);
            font-weight: var(--font-weight-medium);
          }

          .p-tabpanels {
            background: transparent;
            padding: 0;
          }

          .p-tabpanel {
            padding: 0;
          }
        }
      }
    }

    .preferencias-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-6);
      padding: var(--spacing-4) 0;
    }

    .notificaciones-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: var(--spacing-6);
      background: var(--surface-card);
      border-radius: var(--border-radius-xl);
      border: 1px solid var(--surface-border);
      overflow: hidden;
    }

    @media (max-width: 900px) {
      .notificaciones-layout {
        grid-template-columns: 1fr;
      }
    }

    /* Panel de Módulos */
    .modulos-panel {
      background: var(--surface-50);
      border-right: 1px solid var(--surface-border);
    }

    .modulos-header {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);
    }

    .modulos-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .modulos-list {
      display: flex;
      flex-direction: column;
    }

    .modulo-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: transparent;
      border: none;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
      border-left: 3px solid transparent;

      &:hover {
        background: var(--surface-100);
      }

      &.active {
        background: var(--surface-card);
        border-left-color: var(--primary-color);
      }

      &.habilitado .modulo-estado {
        color: var(--green-500);
      }

      &:not(.habilitado) .modulo-estado {
        color: var(--text-color-secondary);
      }
    }

    .modulo-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--border-radius-lg);
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1rem;
        color: var(--text-color-secondary);
      }
    }

    .modulo-item.active .modulo-icon {
      background: var(--primary-100);

      i {
        color: var(--primary-color);
      }
    }

    .modulo-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .modulo-nombre {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .modulo-estado {
      font-size: var(--font-size-xs);
      display: flex;
      align-items: center;
      gap: var(--spacing-1);

      i {
        font-size: 0.7rem;
      }
    }

    /* Panel de Configuración */
    .config-panel {
      display: flex;
      flex-direction: column;
      min-height: 500px;
    }

    .config-header {
      padding: var(--spacing-4) var(--spacing-6);
      border-bottom: 1px solid var(--surface-border);
    }

    .config-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-2);
    }

    .config-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
      }

      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }
    }

    .config-subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      margin: 0;
    }

    .config-body {
      flex: 1;
      padding: var(--spacing-6);
      overflow-y: auto;

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .config-section {
      margin-bottom: var(--spacing-4);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-2) 0;

      i {
        color: var(--primary-color);
      }
    }

    .section-desc {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      margin: 0 0 var(--spacing-4) 0;
    }

    /* Grid de Eventos */
    .eventos-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .eventos-header,
    .evento-row {
      display: grid;
      grid-template-columns: 1fr 80px 80px;
      align-items: center;
      gap: var(--spacing-2);
    }

    .eventos-header {
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
    }

    .evento-col-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color-secondary);
      text-transform: uppercase;
    }

    .canal-col-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color-secondary);
      text-transform: uppercase;
      text-align: center;
    }

    .evento-row {
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--border-radius-md);

      &:hover {
        background: var(--surface-50);
      }
    }

    .evento-label {
      font-size: var(--font-size-sm);
      color: var(--text-color);
    }

    .canal-check {
      display: flex;
      justify-content: center;
    }

    /* Destinatarios */
    .destinatarios-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-4);
    }

    .destinatario-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--surface-border);
    }

    .destinatario-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      i {
        color: var(--text-color-secondary);
      }

      span {
        font-size: var(--font-size-sm);
        color: var(--text-color);
      }
    }

    .destinatarios-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-6);
      color: var(--text-color-secondary);
      gap: var(--spacing-2);

      i {
        font-size: 2rem;
        opacity: 0.5;
      }

      span {
        font-size: var(--font-size-sm);
      }
    }

    .agregar-destinatario {
      display: flex;
      gap: var(--spacing-2);
      align-items: flex-end;
    }

    :host ::ng-deep {
      .tipo-select {
        width: 120px;
      }

      .valor-input {
        flex: 1;
      }
    }

    .destinatarios-dinamicos-info {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);
      margin-top: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--blue-50);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-xs);
      color: var(--blue-700);

      i {
        margin-top: 2px;
      }

      code {
        background: var(--blue-100);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
      }
    }

    /* Sección Aplica a */
    .aplica-a-field {
      margin-bottom: var(--spacing-3);
    }

    :host ::ng-deep {
      .aplica-a-tree-select,
      .aplica-a-multiselect {
        width: 100%;

        .p-treeselect-label,
        .p-multiselect-label {
          padding: var(--spacing-3);
        }

        .p-treeselect-panel,
        .p-multiselect-panel {
          max-height: 350px;
        }

        .p-treeselect-items-wrapper,
        .p-multiselect-items-wrapper {
          max-height: 300px;
          overflow-y: auto;
        }

        .p-treeselect-filter-container,
        .p-multiselect-filter-container {
          padding: var(--spacing-2);
        }

        .p-chip {
          background: var(--primary-100);
          color: var(--primary-700);
          font-size: var(--font-size-xs);
          padding: 2px 8px;
          margin: 2px;

          .p-chip-remove-icon {
            font-size: 0.7rem;
          }
        }
      }

      .aplica-a-tree-select {
        .p-treeselect-trigger {
          width: 2.5rem;
        }

        .p-tree-toggler {
          margin-right: var(--spacing-2);
        }

        .p-tree-node-icon {
          margin-right: var(--spacing-2);
          color: var(--text-color-secondary);
        }

        .p-tree-node-label {
          font-size: var(--font-size-sm);
        }

        .p-checkbox {
          margin-right: var(--spacing-2);
        }
      }
    }

    .entidad-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      i {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }

      span {
        flex: 1;
        font-size: var(--font-size-sm);
      }
    }

    .aplica-a-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);

      i.pi-check-circle {
        color: var(--green-500);
      }

      i.pi-info-circle {
        color: var(--blue-500);
      }

      strong {
        color: var(--text-color);
      }
    }

    /* Estilos para el value template del TreeSelect */
    .placeholder-text {
      color: var(--text-color-secondary);
      font-size: var(--font-size-sm);
    }

    .selected-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-2);
      align-items: center;
    }

    .selected-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--primary-100);
      color: var(--primary-700);
      padding: 4px 10px;
      border-radius: 16px;
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);

      .chip-icon {
        font-size: 0.75rem;
      }
    }

    .selected-count {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--primary-600);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);

      i {
        color: var(--green-500);
      }
    }

    .config-footer {
      padding: var(--spacing-4) var(--spacing-6);
      border-top: 1px solid var(--surface-border);
      display: flex;
      justify-content: flex-end;
    }

    .config-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      gap: var(--spacing-3);

      i {
        font-size: 3rem;
        opacity: 0.3;
      }

      span {
        font-size: var(--font-size-sm);
      }
    }

    /* Horario No Molestar Card */
    .horario-no-molestar-card,
    .prioridades-card {
      background: var(--surface-card);
      border-radius: var(--border-radius-xl);
      border: 1px solid var(--surface-border);
      padding: var(--spacing-6);
    }

    .horario-header,
    .prioridades-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-2);
    }

    .horario-title,
    .prioridades-header {
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

    .horario-desc,
    .prioridades-desc {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      margin: 0 0 var(--spacing-4) 0;
    }

    .horario-inputs {
      display: flex;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-4);

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }

    .horario-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      label {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
      }
    }

    :host ::ng-deep .hora-select {
      width: 120px;
    }

    .horario-warning {
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
      display: flex;
      justify-content: flex-end;
    }

    /* === ESTILOS PARA GESTIÓN DE REGLAS === */
    .reglas-container {
      padding: var(--spacing-4) 0;
    }

    .rules-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4);
      padding: var(--spacing-4) var(--spacing-5);
      background: var(--surface-card);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--surface-border);
      gap: var(--spacing-4);
    }

    .rules-toolbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);

      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }
    }

    .rules-type-selector {
      display: flex;
      align-items: center;
    }

    :host ::ng-deep .rules-select {
      min-width: 220px;

      .p-select-label {
        padding: var(--spacing-2) var(--spacing-3);
      }
    }

    .rules-select-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      width: 100%;

      i {
        color: var(--primary-color);
        font-size: 1rem;
        flex-shrink: 0;
      }

      > span:first-of-type {
        font-size: var(--font-size-sm);
        flex: 1;
      }
    }

    .rules-select-badge {
      background: var(--primary-color);
      color: white;
      padding: 0.15rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.7rem;
      font-weight: var(--font-weight-semibold);
      flex-shrink: 0;
    }

    /* Header de sección cuando se muestran todas las reglas */
    .rules-section-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--surface-50);
      border: 1px solid var(--surface-border);
      border-bottom: none;
      border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
      margin-top: var(--spacing-4);

      &:first-of-type {
        margin-top: 0;
      }

      i {
        color: var(--primary-color);
        font-size: 1.1rem;
      }

      > span:first-of-type {
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-base);
        color: var(--text-color);
        flex: 1;
      }
    }

    .rules-section-badge {
      background: var(--primary-color);
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: var(--font-weight-semibold);
    }

    /* === LAYOUT LISTA-DETALLE === */
    .rules-list-detail {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: var(--spacing-4);
      min-height: 500px;
    }

    .rules-list-panel {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      overflow-y: auto;
      max-height: calc(100vh - 400px);
    }

    .rules-list-section-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
      position: sticky;
      top: 0;
      z-index: 1;

      i {
        color: var(--primary-color);
      }

      > span:first-of-type {
        flex: 1;
        font-weight: var(--font-weight-semibold);
        font-size: var(--font-size-sm);
      }
    }

    .rule-list-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background: var(--surface-50);
      }

      &.selected {
        background: var(--primary-50);
        border-left: 3px solid var(--primary-color);
      }

      &:last-child {
        border-bottom: none;
      }
    }

    .rule-list-item-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-100);
      border-radius: var(--border-radius-md);
      flex-shrink: 0;

      i {
        color: var(--text-color-secondary);
        font-size: 0.9rem;
      }
    }

    .rule-list-item.selected .rule-list-item-icon {
      background: var(--primary-100);

      i {
        color: var(--primary-color);
      }
    }

    .rule-list-item-content {
      flex: 1;
      min-width: 0;
    }

    .rule-list-item-title {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rule-list-item-meta {
      display: flex;
      gap: var(--spacing-1);
      margin-top: var(--spacing-1);
      flex-wrap: wrap;

      :host ::ng-deep .p-tag {
        font-size: 0.65rem;
        padding: 0.1rem 0.4rem;
      }
    }

    .condition-code {
      font-size: 0.7rem;
      background: var(--surface-100);
      padding: 0.1rem 0.4rem;
      border-radius: var(--border-radius-sm);
      color: var(--text-color-secondary);
    }

    .rule-list-item-status {
      flex-shrink: 0;

      .text-success {
        color: var(--green-500);
      }

      .text-muted {
        color: var(--text-color-secondary);
      }
    }

    .rules-list-empty {
      padding: var(--spacing-6);
      text-align: center;
      color: var(--text-color-secondary);

      i {
        font-size: 2rem;
        opacity: 0.5;
        margin-bottom: var(--spacing-2);
        display: block;
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    /* Panel de Detalle */
    .rules-detail-panel {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 400px);
      overflow: hidden;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);
      background: var(--surface-50);
    }

    .detail-header-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);

      h3 {
        margin: 0;
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
      }
    }

    .detail-content {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-4);
    }

    .detail-section {
      margin-bottom: var(--spacing-5);
      padding-bottom: var(--spacing-4);
      border-bottom: 1px solid var(--surface-border);

      &:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      h4 {
        margin: 0 0 var(--spacing-3) 0;
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color-secondary);
        display: flex;
        align-items: center;
      }
    }

    .detail-form-grid {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .detail-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);

      label {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
        color: var(--text-color-secondary);
      }

      input, textarea {
        width: 100%;
      }
    }

    .detail-field-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--spacing-3);
    }

    .channels-grid {
      display: flex;
      gap: var(--spacing-4);
      flex-wrap: wrap;
    }

    .channel-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--surface-border);

      i {
        color: var(--primary-color);
      }

      span {
        font-size: var(--font-size-sm);
      }
    }

    .checkbox-group-vertical {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    /* Editor de Plantilla de Notificación */
    .email-template-editor {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .template-placeholders {
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-3);

      .placeholders-label {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
        display: block;
        margin-bottom: var(--spacing-2);
      }

      .placeholders-list {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-2);

        code {
          background: var(--surface-card);
          border: 1px solid var(--surface-border);
          padding: 0.2rem 0.5rem;
          border-radius: var(--border-radius-sm);
          font-size: var(--font-size-xs);
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: var(--primary-50);
            border-color: var(--primary-color);
            color: var(--primary-color);
          }
        }
      }
    }

    .detail-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      border-top: 1px solid var(--surface-border);
      background: var(--surface-50);
    }

    .detail-empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-6);
      color: var(--text-color-secondary);

      i {
        font-size: 3rem;
        opacity: 0.3;
        margin-bottom: var(--spacing-3);
      }

      h4 {
        margin: 0 0 var(--spacing-2) 0;
        font-size: var(--font-size-lg);
        color: var(--text-color);
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
        text-align: center;
      }
    }

    @media (max-width: 992px) {
      .rules-list-detail {
        grid-template-columns: 1fr;
      }

      .rules-list-panel,
      .rules-detail-panel {
        max-height: 400px;
      }
    }

    .rules-toolbar-right {
      display: flex;
      align-items: center;
    }

    @media (max-width: 768px) {
      .rules-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-3);
      }

      .rules-toolbar-left {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-3);

        h3 {
          text-align: center;
        }
      }

      :host ::ng-deep .rules-select {
        min-width: 100%;
      }

      .rules-toolbar-right {
        justify-content: center;
      }
    }

    .canales-icons {
      display: flex;
      gap: 0.5rem;

      i {
        font-size: 1.1rem;
        color: var(--text-color-secondary);
      }
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .empty-message {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-color-secondary);

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
        opacity: 0.5;
      }

      p {
        margin: 0 0 1rem 0;
      }
    }

    .text-muted {
      color: var(--text-color-secondary);
    }

    .mr-1 {
      margin-right: 0.25rem;
    }

    .mr-2 {
      margin-right: 0.5rem;
    }

    /* Dialog styles */
    .dialog-content {
      padding: var(--spacing-2) 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-4);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);

      label {
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);
        color: var(--text-color);
      }

      input, textarea {
        width: 100%;
      }
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-section {
      margin-top: var(--spacing-2);
      padding-top: var(--spacing-4);
      border-top: 1px solid var(--surface-border);

      h4 {
        margin: 0 0 var(--spacing-3) 0;
        font-size: var(--font-size-sm);
        color: var(--text-color-secondary);
        font-weight: var(--font-weight-semibold);
      }
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-4);
    }

    .hint {
      color: var(--text-color-secondary);
      font-size: var(--font-size-xs);
    }

    :host ::ng-deep {
      .reglas-container .p-datatable {
        background: var(--surface-card);
        border-radius: var(--border-radius-lg);
        border: 1px solid var(--surface-border);
        overflow: hidden;

        .p-datatable-header {
          background: var(--surface-50);
          border-bottom: 1px solid var(--surface-border);
        }

        .p-datatable-thead > tr > th {
          background: var(--surface-50);
          border-bottom: 1px solid var(--surface-border);
          padding: var(--spacing-3) var(--spacing-4);
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-sm);
        }

        .p-datatable-tbody > tr > td {
          padding: var(--spacing-3) var(--spacing-4);
          border-bottom: 1px solid var(--surface-border);
        }

        .p-datatable-tbody > tr:last-child > td {
          border-bottom: none;
        }

        .p-datatable-tbody > tr:hover {
          background: var(--surface-50);
        }
      }
    }

    /* === EDITOR VISUAL DE EMAIL === */
    .email-visual-editor {
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      background: var(--surface-card);
    }

    .email-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
    }

    .email-toolbar-blocks {
      display: flex;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .email-toolbar-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    .email-canvas {
      min-height: 300px;
      max-height: 400px;
      overflow-y: auto;
      padding: var(--spacing-4);
      background: linear-gradient(135deg, var(--surface-ground) 0%, var(--surface-card) 100%);
    }

    .email-canvas-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--text-color-secondary);
      text-align: center;

      i {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-3);
        opacity: 0.4;
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    .email-block {
      position: relative;
      padding: var(--spacing-3);
      margin-bottom: var(--spacing-2);
      border: 2px solid transparent;
      border-radius: var(--border-radius-md);
      background: var(--surface-card);
      transition: all 0.2s ease;
      cursor: pointer;

      &:hover {
        border-color: var(--surface-border);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      &.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px var(--primary-100);
      }
    }

    .block-header {
      display: none;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2);
      padding-bottom: var(--spacing-2);
      border-bottom: 1px solid var(--surface-border);
    }

    .email-block.selected .block-header {
      display: flex;
    }

    .block-type-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .block-actions {
      display: flex;
      gap: var(--spacing-1);
    }

    .block-content {
      width: 100%;
    }

    .block-content-header {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      border: none;
      background: transparent;
      padding: var(--spacing-2);
      width: 100%;
      color: var(--text-color);

      &:focus {
        outline: 2px solid var(--primary-color);
        border-radius: var(--border-radius-sm);
      }
    }

    .block-content-paragraph {
      font-size: var(--font-size-base);
      line-height: 1.6;
      border: none;
      background: transparent;
      padding: var(--spacing-2);
      width: 100%;
      min-height: 80px;
      resize: none;
      color: var(--text-color);
      font-family: inherit;

      &:focus {
        outline: 2px solid var(--primary-color);
        border-radius: var(--border-radius-sm);
      }
    }

    .block-divider {
      border: none;
      border-top: 2px solid var(--surface-border);
      margin: var(--spacing-3) 0;
    }

    .block-variable {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-2);

      .variable-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        background: var(--primary-100);
        color: var(--primary-700);
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);

        i {
          font-size: 0.8rem;
        }
      }
    }

    .block-button-container {
      padding: var(--spacing-2);
    }

    .block-button-preview {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-medium);
      text-align: center;
      cursor: default;
    }

    .block-button-input {
      margin-top: var(--spacing-2);
      width: 100%;
    }

    .block-list-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .block-list-items {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);

      li {
        display: flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-1) 0;

        &::before {
          content: '•';
          color: var(--primary-color);
          font-weight: bold;
        }
      }
    }

    .block-alert {
      padding: var(--spacing-3);
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);

      &.alert-info {
        background: var(--blue-50);
        border-left: 4px solid var(--blue-500);

        i {
          color: var(--blue-500);
        }
      }

      &.alert-success {
        background: var(--green-50);
        border-left: 4px solid var(--green-500);

        i {
          color: var(--green-500);
        }
      }

      &.alert-warning {
        background: var(--orange-50);
        border-left: 4px solid var(--orange-500);

        i {
          color: var(--orange-500);
        }
      }

      &.alert-error {
        background: var(--red-50);
        border-left: 4px solid var(--red-500);

        i {
          color: var(--red-500);
        }
      }
    }

    .block-alert-content {
      flex: 1;

      textarea {
        width: 100%;
        border: none;
        background: transparent;
        resize: none;
        font-size: var(--font-size-sm);
        line-height: 1.5;

        &:focus {
          outline: none;
        }
      }
    }

    .block-styles-bar {
      display: flex;
      gap: var(--spacing-2);
      margin-top: var(--spacing-2);
      padding-top: var(--spacing-2);
      border-top: 1px dashed var(--surface-border);
      flex-wrap: wrap;
    }

    /* Email Preview Mode */
    .email-preview {
      padding: var(--spacing-4);
      min-height: 300px;
      max-height: 400px;
      overflow-y: auto;
      background: white;
    }

    .email-preview-content {
      max-width: 600px;
      margin: 0 auto;
      padding: var(--spacing-4);
      background: white;
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .preview-header {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin-bottom: var(--spacing-3);
    }

    .preview-paragraph {
      font-size: var(--font-size-base);
      line-height: 1.6;
      color: var(--text-color);
      margin-bottom: var(--spacing-3);
      white-space: pre-wrap;
    }

    .preview-variable {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      background: var(--primary-100);
      color: var(--primary-700);
      padding: 2px var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);

      i {
        font-size: 0.7rem;
      }
    }

    .preview-button {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-medium);
      text-decoration: none;
      margin: var(--spacing-2) 0;
    }

    .preview-divider {
      border: none;
      border-top: 1px solid var(--surface-border);
      margin: var(--spacing-4) 0;
    }

    .preview-list {
      margin: var(--spacing-2) 0;
      padding-left: var(--spacing-4);

      li {
        margin-bottom: var(--spacing-1);
        line-height: 1.5;
      }
    }

    .preview-alert {
      padding: var(--spacing-3);
      border-radius: var(--border-radius-md);
      margin: var(--spacing-3) 0;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);

      &.alert-info {
        background: var(--blue-50);
        border-left: 4px solid var(--blue-500);
        color: var(--blue-700);

        i {
          color: var(--blue-500);
        }
      }

      &.alert-success {
        background: var(--green-50);
        border-left: 4px solid var(--green-500);
        color: var(--green-700);

        i {
          color: var(--green-500);
        }
      }

      &.alert-warning {
        background: var(--orange-50);
        border-left: 4px solid var(--orange-500);
        color: var(--orange-700);

        i {
          color: var(--orange-500);
        }
      }

      &.alert-error {
        background: var(--red-50);
        border-left: 4px solid var(--red-500);
        color: var(--red-700);

        i {
          color: var(--red-500);
        }
      }
    }

    /* Text alignment utilities for email blocks */
    .text-left {
      text-align: left;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    /* Toolbar styles */
    .toolbar-label {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      font-weight: var(--font-weight-medium);
      margin-right: var(--spacing-2);
    }

    .toolbar-blocks {
      display: flex;
      gap: var(--spacing-1);
      flex-wrap: wrap;
      flex: 1;
    }

    .block-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md);
      background: var(--surface-card);
      cursor: pointer;
      transition: all 0.2s;
      color: var(--text-color-secondary);

      &:hover {
        background: var(--primary-50);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      i {
        font-size: 0.9rem;
      }
    }

    .toolbar-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    .preview-btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-2) var(--spacing-3);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md);
      background: var(--surface-card);
      cursor: pointer;
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--surface-50);
      }

      &.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
    }

    /* Email canvas empty state */
    .email-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--text-color-secondary);
      text-align: center;
      padding: var(--spacing-6);

      i {
        font-size: 3rem;
        margin-bottom: var(--spacing-3);
        opacity: 0.3;
        color: var(--primary-color);
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    /* Block drag handle */
    .block-drag-handle {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-50);
      border-right: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
      cursor: grab;
      opacity: 0;
      transition: opacity 0.2s;

      i {
        font-size: 0.8rem;
        color: var(--text-color-secondary);
      }
    }

    .email-block:hover .block-drag-handle,
    .email-block.selected .block-drag-handle {
      opacity: 1;
    }

    .email-block {
      padding-left: 32px;
    }

    /* Block inputs */
    .block-input {
      width: 100%;
      border: 1px solid transparent;
      background: transparent;
      padding: var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-family: inherit;
      transition: all 0.2s;

      &:hover {
        background: var(--surface-50);
      }

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        background: var(--surface-card);
      }
    }

    .block-input.block-header {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
    }

    .block-input.block-paragraph {
      font-size: var(--font-size-base);
      line-height: 1.6;
      resize: none;
      min-height: 60px;
    }

    .block-input.block-list {
      font-size: var(--font-size-sm);
      resize: none;
      min-height: 80px;
      font-family: inherit;
    }

    /* Block actions */
    .email-block .block-actions {
      position: absolute;
      right: var(--spacing-2);
      top: var(--spacing-2);
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
      background: var(--surface-card);
      border-radius: var(--border-radius-md);
      padding: 2px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .email-block:hover .block-actions,
    .email-block.selected .block-actions {
      opacity: 1;
    }

    .block-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: var(--border-radius-sm);
      background: transparent;
      cursor: pointer;
      color: var(--text-color-secondary);
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: var(--surface-100);
        color: var(--primary-color);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &.active {
        background: var(--primary-100);
        color: var(--primary-color);
      }

      &.delete:hover {
        background: var(--red-50);
        color: var(--red-500);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .block-actions-divider {
      width: 1px;
      height: 16px;
      background: var(--surface-border);
      margin: 0 var(--spacing-1);
      align-self: center;
    }

    /* Block variable */
    .block-variable {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
    }

    .variable-prefix {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      white-space: nowrap;
    }

    /* Block button editor */
    .block-button-editor {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
    }

    .button-preview {
      display: flex;
      justify-content: center;
      padding: var(--spacing-2);
    }

    .btn-preview {
      display: inline-block;
      background: var(--primary-color);
      color: white;
      padding: var(--spacing-2) var(--spacing-4);
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-sm);
    }

    /* Block divider */
    .block-divider {
      padding: var(--spacing-2) 0;

      hr {
        border: none;
        border-top: 2px solid var(--surface-border);
        margin: 0;
      }
    }

    /* Block alert editor */
    .block-alert-editor {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
      padding: var(--spacing-2);
    }

    .alert-type-selector {
      display: flex;
      gap: var(--spacing-1);

      button {
        padding: var(--spacing-1) var(--spacing-2);
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius-sm);
        background: var(--surface-card);
        cursor: pointer;
        font-size: var(--font-size-xs);
        transition: all 0.2s;

        &:hover {
          background: var(--surface-50);
        }

        &.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      }
    }

    /* Email preview styles */
    .email-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
    }

    .preview-label {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .preview-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .preview-type-toggle {
      display: flex;
      align-items: center;
      background: var(--surface-100);
      border-radius: var(--border-radius-md);
      padding: 2px;

      .type-btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-1);
        padding: var(--spacing-1) var(--spacing-3);
        border: none;
        border-radius: var(--border-radius-sm);
        background: transparent;
        cursor: pointer;
        color: var(--text-color-secondary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
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
          font-size: 0.85rem;
        }

        span {
          font-size: var(--font-size-xs);
        }
      }
    }

    .preview-mode-toggle {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);

      .mode-label {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
      }

      .mode-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius-sm);
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
          font-size: 0.85rem;
        }
      }
    }

    .preview-button-container {
      margin: var(--spacing-3) 0;
    }

    /* Email Preview Content - Light Mode (default) */
    .email-preview-content {
      background: #ffffff;
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

      /* Light mode CSS variables - Design System ORCA */
      --email-bg: #ffffff;
      --email-text: #18181b;                /* zinc-900 */
      --email-text-secondary: #71717a;      /* zinc-500 */
      --email-border: #e4e4e7;              /* zinc-200 */
      --email-surface: #fafafa;             /* zinc-50 */
      --email-primary: #10b981;             /* emerald-500 - Primary */
      --email-primary-light: #ecfdf5;       /* emerald-50 */
      --email-primary-hover: #059669;       /* emerald-600 */
      --email-success: #22c55e;             /* green-500 */
      --email-success-light: #f0fdf4;       /* green-50 */
      --email-warning: #f59e0b;             /* amber-500 */
      --email-warning-light: #fffbeb;       /* amber-50 */
      --email-danger: #ef4444;              /* red-500 */
      --email-danger-light: #fef2f2;        /* red-50 */
      --email-info: #10b981;                /* emerald-500 (info = primary) */
      --email-info-light: #ecfdf5;          /* emerald-50 */
    }

    /* Email Preview Content - Dark Mode */
    .email-preview-content.dark-mode {
      background: #18181b;                  /* zinc-900 */
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

      --email-bg: #18181b;                  /* zinc-900 */
      --email-text: #fafafa;                /* zinc-50 */
      --email-text-secondary: #a1a1aa;      /* zinc-400 */
      --email-border: #3f3f46;              /* zinc-700 */
      --email-surface: #27272a;             /* zinc-800 */
      --email-primary: #34d399;             /* emerald-400 */
      --email-primary-light: #065f46;       /* emerald-800 */
      --email-primary-hover: #6ee7b7;       /* emerald-300 */
      --email-success: #4ade80;             /* green-400 */
      --email-success-light: #14532d;       /* green-900 */
      --email-warning: #fbbf24;             /* amber-400 */
      --email-warning-light: #451a03;       /* amber-950 */
      --email-danger: #f87171;              /* red-400 */
      --email-danger-light: #450a0a;        /* red-950 */
      --email-info: #34d399;                /* emerald-400 */
      --email-info-light: #065f46;          /* emerald-800 */
    }

    /* Simulated Email Header */
    .email-simulated-header {
      padding: var(--spacing-5) var(--spacing-4);
      background: var(--email-surface);
      border-bottom: 1px solid var(--email-border);
      text-align: center;
    }

    .email-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      .logo-img {
        height: 40px;
        width: auto;
        transition: filter 0.2s;
      }
    }

    /* En modo oscuro invertir el logo */
    .drawer-preview-content.dark-mode .email-logo .logo-img {
      filter: invert(1) brightness(2);
    }

    /* Email Body */
    .email-body {
      padding: var(--spacing-5);
      background: var(--email-bg);
      color: var(--email-text);
    }

    /* Preview Header (H1/H2) */
    .preview-header {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--email-text);
      margin: 0 0 var(--spacing-4) 0;
      line-height: 1.3;
    }

    /* Preview Paragraph */
    .preview-paragraph {
      font-size: var(--font-size-base);
      line-height: 1.7;
      color: var(--email-text);
      margin: 0 0 var(--spacing-3) 0;
    }

    /* === VARIABLE CARD STYLES === */
    .variable-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--email-surface);
      border: 1px solid var(--email-border);
      border-radius: var(--border-radius-md);
      margin: var(--spacing-2) 0;

      &.vertical {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-2);
      }
    }

    .variable-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--email-text-secondary);
      white-space: nowrap;

      i {
        font-size: 0.9rem;
        color: var(--email-primary);
      }
    }

    .variable-value {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      min-width: 0;

      .variable-card.vertical & {
        justify-content: flex-start;
        width: 100%;
      }
    }

    /* Entity Badge */
    .entity-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      background: var(--email-primary-light);
      border: 1px solid var(--email-primary);
      border-radius: var(--border-radius-md);
      color: var(--email-primary);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-sm);

      i {
        font-size: 0.9rem;
      }

      span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }
    }

    /* Description Text */
    .description-text {
      margin: 0;
      font-size: var(--font-size-sm);
      line-height: 1.6;
      color: var(--email-text);
    }

    /* Date Value */
    .date-value {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--email-text);
    }

    /* User Chip Inline */
    .user-chip-inline {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3) var(--spacing-1) var(--spacing-1);
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 50px;

      .chip-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: var(--font-weight-bold);
        font-size: 0.7rem;
      }

      .chip-name {
        font-weight: var(--font-weight-medium);
        color: var(--email-text);
        font-size: var(--font-size-sm);
      }
    }

    /* Entity Type Chip */
    .entity-type-chip {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--email-text);

      i {
        font-size: 0.9rem;
        color: var(--email-primary);
      }
    }

    /* Status Chip */
    .status-chip {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);

      i {
        font-size: 0.5rem;
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

    /* Action Link Inline */
    .action-link-inline {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-3);
      background: var(--email-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: all 0.2s;

      &:hover {
        background: var(--email-primary-hover);
      }

      i {
        font-size: 0.8rem;
      }
    }

    /* Fallback Value */
    .fallback-value {
      color: var(--email-text-secondary);
      font-style: italic;
    }

    /* Preview Variable Components (legacy - kept for compatibility) */
    .preview-var-nombre {
      margin: var(--spacing-3) 0;

      .entity-name {
        display: flex;
        align-items: center;
        gap: var(--spacing-3);
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        color: var(--email-text);
        margin: 0;
        padding: var(--spacing-3);
        background: var(--email-surface);
        border-radius: var(--border-radius-lg);
        border-left: 4px solid var(--email-primary);

        i {
          color: var(--email-primary);
          font-size: 1.25rem;
        }
      }
    }

    .preview-var-descripcion {
      margin: var(--spacing-3) 0;
      padding: var(--spacing-3);
      background: var(--email-surface);
      border-radius: var(--border-radius-md);
      border: 1px solid var(--email-border);

      .entity-description {
        font-size: var(--font-size-sm);
        line-height: 1.6;
        color: var(--email-text-secondary);
        margin: 0 0 var(--spacing-2) 0;
      }

      :host ::ng-deep .p-tag {
        font-size: 0.7rem;
      }
    }

    .preview-var-fecha {
      margin: var(--spacing-2) 0;

      .date-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        background: var(--email-primary-light);
        color: var(--email-primary);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);

        i {
          font-size: 0.9rem;
        }
      }
    }

    .preview-var-responsable {
      margin: var(--spacing-3) 0;

      &.centered {
        display: flex;
        justify-content: center;
      }

      :host ::ng-deep .responsable-chip {
        background: var(--email-surface);
        border: 1px solid var(--email-border);
        padding: var(--spacing-2) var(--spacing-4);
        border-radius: 50px;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);

        .chip-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-xs);
        }

        .chip-name {
          font-weight: var(--font-weight-semibold);
          color: var(--email-text);
          font-size: var(--font-size-sm);
        }
      }

      .user-chip {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-3);
        padding: var(--spacing-2) var(--spacing-3);
        background: var(--email-surface);
        border: 1px solid var(--email-border);
        border-radius: 50px;

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: var(--font-size-sm);
        }

        .user-info {
          display: flex;
          flex-direction: column;

          .user-name {
            font-weight: var(--font-weight-semibold);
            color: var(--email-text);
            font-size: var(--font-size-sm);
          }

          .user-email {
            font-size: var(--font-size-xs);
            color: var(--email-text-secondary);
          }
        }

        &.small {
          padding: var(--spacing-1) var(--spacing-2);

          .user-avatar {
            width: 28px;
            height: 28px;
            font-size: 0.7rem;
          }

          .user-name {
            font-size: var(--font-size-xs);
          }
        }
      }
    }

    .preview-var-entidad {
      margin: var(--spacing-2) 0;

      .entity-type-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        background: var(--email-surface);
        border: 1px solid var(--email-border);
        border-radius: var(--border-radius-md);
        color: var(--email-text);

        i {
          color: var(--email-primary);
          font-size: 1rem;
        }

        span {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
        }
      }
    }

    .preview-var-severidad {
      margin: var(--spacing-2) 0;

      :host ::ng-deep .p-tag {
        font-size: var(--font-size-sm);
        padding: var(--spacing-1) var(--spacing-3);
      }
    }

    .preview-var-estado {
      margin: var(--spacing-2) 0;

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--border-radius-md);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);

        i {
          font-size: 0.5rem;
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
    }

    .preview-var-creador {
      margin: var(--spacing-2) 0;
    }

    .preview-var-enlace {
      margin: var(--spacing-3) 0;

      .action-link {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        color: var(--email-primary);
        text-decoration: none;
        font-weight: var(--font-weight-medium);
        font-size: var(--font-size-sm);

        &:hover {
          text-decoration: underline;
        }

        i {
          font-size: 0.85rem;
        }
      }
    }

    .preview-variable-fallback {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-1);
      background: var(--email-surface);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-sm);
      color: var(--email-text-secondary);

      i {
        font-size: 0.75rem;
      }
    }

    /* Preview Button */
    .preview-button {
      display: inline-block;
      padding: var(--spacing-3) var(--spacing-5);
      background: var(--email-primary);
      color: white;
      text-decoration: none;
      border-radius: var(--border-radius-md);
      font-weight: var(--font-weight-semibold);
      font-size: var(--font-size-base);
      transition: all 0.2s;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);

      &:hover {
        background: var(--email-primary-hover);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
      }
    }

    /* Preview Divider */
    .preview-divider {
      border: none;
      border-top: 1px solid var(--email-border);
      margin: var(--spacing-4) 0;
    }

    /* Preview List */
    .preview-list {
      margin: var(--spacing-3) 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-2);
        padding: var(--spacing-2) 0;
        color: var(--email-text);
        font-size: var(--font-size-sm);
        line-height: 1.5;

        i {
          color: var(--email-success);
          font-size: 0.9rem;
          margin-top: 2px;
          flex-shrink: 0;
        }
      }
    }

    /* Preview Alert */
    .preview-alert {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      border-radius: var(--border-radius-md);
      margin: var(--spacing-3) 0;
      font-size: var(--font-size-sm);
      line-height: 1.5;

      i {
        font-size: 1.1rem;
        flex-shrink: 0;
        margin-top: 1px;
      }

      span {
        flex: 1;
      }

      &.alert-info {
        background: var(--email-primary-light);
        color: var(--email-primary);
        border: 1px solid var(--email-primary);
      }

      &.alert-warning {
        background: var(--email-warning-light);
        color: var(--email-warning);
        border: 1px solid var(--email-warning);
      }

      &.alert-danger {
        background: var(--email-danger-light);
        color: var(--email-danger);
        border: 1px solid var(--email-danger);
      }
    }

    /* Preview Empty */
    .preview-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-6);
      color: var(--email-text-secondary);
      text-align: center;

      i {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-3);
        opacity: 0.3;
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    /* Simulated Email Footer */
    .email-simulated-footer {
      padding: var(--spacing-4);
      background: var(--email-surface);
      border-top: 1px solid var(--email-border);
      text-align: center;

      p {
        margin: 0;
        font-size: var(--font-size-xs);
        color: var(--email-text-secondary);
        line-height: 1.6;

        &:first-child {
          margin-bottom: var(--spacing-1);
        }
      }
    }

    /* === IN-APP NOTIFICATION PREVIEW STYLES === */

    .inapp-preview-container {
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .inapp-section-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--email-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: var(--spacing-2);

      i {
        font-size: 0.85rem;
        color: var(--email-primary);
      }
    }

    .inapp-notification {
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .inapp-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--email-surface);
      border-bottom: 1px solid var(--email-border);
    }

    .inapp-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--border-radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;

      i {
        font-size: 1.1rem;
      }

      &.severity-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      &.severity-warn, &.severity-warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }

      &.severity-info {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      &.severity-success {
        background: linear-gradient(135deg, #22c55e, #16a34a);
      }
    }

    .inapp-title-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .inapp-title {
      font-weight: var(--font-weight-semibold);
      color: var(--email-text);
      font-size: var(--font-size-base);
    }

    .inapp-time {
      font-size: var(--font-size-xs);
      color: var(--email-text-secondary);
    }

    .inapp-close {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: var(--border-radius-sm);
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
        font-size: 0.85rem;
      }
    }

    .inapp-body {
      padding: var(--spacing-4);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
    }

    .inapp-message {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--email-text);
      line-height: 1.6;

      strong {
        color: var(--email-primary);
      }
    }

    /* In-App Variables Section */
    .inapp-variables {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
      margin-top: var(--spacing-2);
    }

    .inapp-var-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--email-surface);
      border-radius: var(--border-radius-sm);
      min-height: 36px;
    }

    .inapp-var-label {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--email-text-secondary);
      white-space: nowrap;

      i {
        font-size: 0.8rem;
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
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-2);
      background: var(--email-primary-light);
      border: 1px solid var(--email-primary);
      border-radius: var(--border-radius-sm);
      color: var(--email-primary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      max-width: 180px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      i {
        font-size: 0.8rem;
        flex-shrink: 0;
      }
    }

    .inapp-status-badge {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);

      i {
        font-size: 0.4rem;
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
      font-size: var(--font-size-xs);
      color: var(--email-text);
      font-weight: var(--font-weight-medium);
    }

    .inapp-user-chip {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-1) var(--spacing-2) var(--spacing-1) var(--spacing-1);
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: 50px;
      font-size: var(--font-size-xs);
      color: var(--email-text);
      font-weight: var(--font-weight-medium);

      .inapp-avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: var(--font-weight-bold);
        font-size: 0.6rem;
      }
    }

    .inapp-header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .inapp-unread-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--email-primary);
    }

    /* Badge Preview */
    .inapp-badge-preview {
      background: var(--email-surface);
      border: 1px solid var(--email-border);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-3);
    }

    .badge-demo-navbar {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--email-bg);
      border-radius: var(--border-radius-sm);
    }

    .badge-nav-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-sm);
      color: var(--email-text-secondary);
      cursor: pointer;
      position: relative;

      &:hover {
        color: var(--email-text);
      }

      &.with-badge {
        color: var(--email-text);

        i {
          font-size: 1.1rem;
        }
      }

      .notification-badge {
        position: absolute;
        top: -6px;
        right: -8px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 50px;
        background: #ef4444;
        color: white;
        font-size: 0.65rem;
        font-weight: var(--font-weight-bold);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .inapp-entity {
      :host ::ng-deep .entity-chip {
        background: var(--email-primary-light);
        border: 1px solid var(--email-primary);
        color: var(--email-primary);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--border-radius-md);
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-2);
        font-size: var(--font-size-sm);

        i {
          font-size: 1rem;
        }
      }
    }

    .inapp-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-3);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      color: var(--email-text-secondary);

      i {
        font-size: 0.85rem;
      }

      :host ::ng-deep .responsable-chip-small {
        background: var(--email-surface);
        border: 1px solid var(--email-border);
        padding: var(--spacing-1) var(--spacing-2);
        border-radius: 50px;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        font-size: var(--font-size-xs);

        .chip-avatar-small {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: var(--font-weight-bold);
          font-size: 0.6rem;
        }
      }
    }

    .inapp-footer {
      display: flex;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--email-surface);
      border-top: 1px solid var(--email-border);
    }

    .inapp-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2) var(--spacing-3);
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.85rem;
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

    /* Toast Preview */
    .inapp-toast-preview {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .toast-label {
      font-size: var(--font-size-xs);
      color: var(--email-text-secondary);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .toast-notification {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--email-bg);
      border: 1px solid var(--email-border);
      border-radius: var(--border-radius-md);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &.severity-danger {
        border-left: 4px solid #ef4444;

        .toast-icon {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }
      }

      &.severity-warn, &.severity-warning {
        border-left: 4px solid #f59e0b;

        .toast-icon {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }
      }

      &.severity-info {
        border-left: 4px solid #10b981;

        .toast-icon {
          background: linear-gradient(135deg, #10b981, #059669);
        }
      }

      &.severity-success {
        border-left: 4px solid #22c55e;

        .toast-icon {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
      }
    }

    .toast-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;

      i {
        font-size: 0.9rem;
      }
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .toast-title {
      font-weight: var(--font-weight-semibold);
      color: var(--email-text);
      font-size: var(--font-size-sm);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-message {
      font-size: var(--font-size-xs);
      color: var(--email-text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast-close {
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: var(--border-radius-sm);
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
        font-size: 0.75rem;
      }
    }

    /* === ESTILOS PARA EL DRAWER DEL EDITOR DE EMAIL === */

    /* Email template summary card */
    .email-template-summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--surface-50);
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md);
    }

    .template-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .template-subject {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);

      .subject-label {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
      }

      .subject-value {
        font-size: var(--font-size-sm);
        color: var(--text-color);
        font-weight: var(--font-weight-medium);
      }
    }

    .template-blocks-count {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);

      i {
        font-size: 0.75rem;
      }
    }

    /* Drawer overlay */
    .email-drawer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;

      &.visible {
        opacity: 1;
        visibility: visible;
      }
    }

    /* Drawer panel */
    .email-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 50vw;
      min-width: 800px;
      max-width: 1200px;
      height: 100vh;
      background: var(--surface-card);
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s ease;

      &.open {
        transform: translateX(0);
      }
    }

    @media (max-width: 1200px) {
      .email-drawer {
        width: 70vw;
        min-width: 600px;
      }
    }

    @media (max-width: 768px) {
      .email-drawer {
        width: 100vw;
        min-width: unset;
      }
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-4);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
    }

    .drawer-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);

      i {
        font-size: 1.25rem;
        color: var(--primary-color);
      }

      span {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--text-color);
      }
    }

    .drawer-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--border-radius-md);
      background: transparent;
      cursor: pointer;
      color: var(--text-color-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--surface-200);
        color: var(--text-color);
      }

      i {
        font-size: 1.25rem;
      }
    }

    .drawer-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: var(--spacing-4);
      gap: var(--spacing-4);
    }

    .drawer-section {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .drawer-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .drawer-input {
      width: 100%;
    }

    /* Editor layout - side by side */
    .drawer-editor-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-4);
      overflow: hidden;
    }

    .drawer-editor-panel,
    .drawer-preview-panel {
      display: flex;
      flex-direction: column;
      background: var(--surface-ground);
      border-radius: var(--border-radius-lg);
      border: 1px solid var(--surface-border);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3);
      background: var(--surface-50);
      border-bottom: 1px solid var(--surface-border);
    }

    .panel-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
    }

    /* Drawer toolbar */
    .drawer-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
    }

    .toolbar-block-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: var(--spacing-2);
      min-width: 60px;
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius-md);
      background: var(--surface-card);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--primary-50);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }

      i {
        font-size: 1rem;
        color: var(--text-color-secondary);
      }

      span {
        font-size: 0.65rem;
        color: var(--text-color-secondary);
      }

      &:hover i,
      &:hover span {
        color: var(--primary-color);
      }
    }

    /* Drawer canvas */
    .drawer-canvas {
      flex: 1;
      overflow-y: auto;
      padding: var(--spacing-3);
      background: var(--surface-card);
    }

    .drawer-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 200px;
      color: var(--text-color-secondary);
      text-align: center;

      i {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-3);
        opacity: 0.3;
        color: var(--primary-color);
      }

      p {
        margin: 0;
        font-size: var(--font-size-sm);
      }
    }

    /* Drawer blocks */
    .drawer-block {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
      margin-bottom: var(--spacing-2);
      background: var(--surface-ground);
      border: 2px solid transparent;
      border-radius: var(--border-radius-md);
      transition: all 0.2s;
      cursor: pointer;

      &:hover {
        border-color: var(--surface-border);
      }

      &.selected {
        border-color: var(--primary-color);
        background: var(--primary-50);
      }
    }

    .drawer-block-drag {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-1);
      cursor: grab;
      color: var(--text-color-secondary);
      opacity: 0;
      transition: opacity 0.2s;

      i {
        font-size: 0.8rem;
      }
    }

    .drawer-block:hover .drawer-block-drag,
    .drawer-block.selected .drawer-block-drag {
      opacity: 1;
    }

    .drawer-block-content {
      flex: 1;
      min-width: 0;
    }

    .drawer-block-input {
      width: 100%;
      border: 1px solid transparent;
      background: transparent;
      padding: var(--spacing-2);
      border-radius: var(--border-radius-sm);
      font-family: inherit;
      transition: all 0.2s;
      color: var(--text-color);

      &:hover {
        background: var(--surface-card);
      }

      &:focus {
        outline: none;
        border-color: var(--primary-color);
        background: var(--surface-card);
      }
    }

    .drawer-block-header {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-bold);
    }

    .drawer-block-paragraph {
      font-size: var(--font-size-sm);
      line-height: 1.5;
      resize: none;
    }

    .drawer-block-list {
      font-size: var(--font-size-sm);
      resize: none;
    }

    .drawer-block-variable {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-2);

      .variable-label {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
        white-space: nowrap;
      }
    }

    .drawer-block-button {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .button-preview-small {
      text-align: center;

      span {
        display: inline-block;
        padding: var(--spacing-1) var(--spacing-3);
        background: var(--primary-color);
        color: white;
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
      }
    }

    .drawer-block-divider {
      padding: var(--spacing-2) 0;

      hr {
        border: none;
        border-top: 2px solid var(--surface-border);
        margin: 0;
      }
    }

    .drawer-block-alert {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .alert-types {
      display: flex;
      gap: var(--spacing-1);

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: 1px solid var(--surface-border);
        border-radius: var(--border-radius-sm);
        background: var(--surface-card);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--surface-50);
        }

        &.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        i {
          font-size: 0.85rem;
        }
      }
    }

    /* Drawer block actions */
    .drawer-block-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        border-radius: var(--border-radius-sm);
        background: transparent;
        cursor: pointer;
        color: var(--text-color-secondary);
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: var(--surface-200);
          color: var(--primary-color);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.active {
          background: var(--primary-100);
          color: var(--primary-color);
        }

        &.delete-btn:hover {
          background: var(--red-50);
          color: var(--red-500);
        }

        i {
          font-size: 0.75rem;
        }
      }
    }

    .drawer-block:hover .drawer-block-actions,
    .drawer-block.selected .drawer-block-actions {
      opacity: 1;
    }

    .actions-divider {
      width: 1px;
      height: 16px;
      background: var(--surface-border);
      margin: 0 var(--spacing-1);
      align-self: center;
    }

    /* Drawer preview panel */
    .drawer-preview-content {
      flex: 1;
      overflow-y: auto;
      background: #ffffff;

      /* Light mode CSS variables - Design System ORCA */
      --email-bg: #ffffff;
      --email-text: #18181b;                /* zinc-900 */
      --email-text-secondary: #71717a;      /* zinc-500 */
      --email-border: #e4e4e7;              /* zinc-200 */
      --email-surface: #fafafa;             /* zinc-50 */
      --email-primary: #10b981;             /* emerald-500 - Primary */
      --email-primary-light: #ecfdf5;       /* emerald-50 */
      --email-primary-hover: #059669;       /* emerald-600 */
      --email-success: #22c55e;             /* green-500 */
      --email-success-light: #f0fdf4;       /* green-50 */
      --email-warning: #f59e0b;             /* amber-500 */
      --email-warning-light: #fffbeb;       /* amber-50 */
      --email-danger: #ef4444;              /* red-500 */
      --email-danger-light: #fef2f2;        /* red-50 */
      --email-info: #10b981;                /* emerald-500 */
      --email-info-light: #ecfdf5;          /* emerald-50 */

      &.dark-mode {
        background: #18181b;                /* zinc-900 */

        --email-bg: #18181b;                /* zinc-900 */
        --email-text: #fafafa;              /* zinc-50 */
        --email-text-secondary: #a1a1aa;    /* zinc-400 */
        --email-border: #3f3f46;            /* zinc-700 */
        --email-surface: #27272a;           /* zinc-800 */
        --email-primary: #34d399;           /* emerald-400 */
        --email-primary-light: #065f46;     /* emerald-800 */
        --email-primary-hover: #6ee7b7;     /* emerald-300 */
        --email-success: #4ade80;           /* green-400 */
        --email-success-light: #14532d;     /* green-900 */
        --email-warning: #fbbf24;           /* amber-400 */
        --email-warning-light: #451a03;     /* amber-950 */
        --email-danger: #f87171;            /* red-400 */
        --email-danger-light: #450a0a;      /* red-950 */
        --email-info: #34d399;              /* emerald-400 */
        --email-info-light: #065f46;        /* emerald-800 */
      }
    }

    /* Drawer footer */
    .drawer-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
      padding: var(--spacing-4);
      border-top: 1px solid var(--surface-border);
      background: var(--surface-50);
    }
  `]
})
export class NotificacionesConfigComponent implements OnInit {
  private api = inject(ApiService);

  // Tab activo
  tabActivo = 0;

  // Tipo de regla seleccionado en el select
  tipoReglaSeleccionado: 'todos' | 'eventos' | 'alertas' | 'vencimientos' = 'todos';

  opcionesTipoRegla = [
    { label: 'Todas las Reglas', value: 'todos' },
    { label: 'Reglas de Eventos', value: 'eventos' },
    { label: 'Alertas por Umbral', value: 'alertas' },
    { label: 'Reglas de Vencimiento', value: 'vencimientos' }
  ];

  // === GESTIÓN DE REGLAS ===
  // Data signals para reglas
  notificationRules = signal<NotificationRule[]>([]);
  alertRules = signal<AlertRule[]>([]);
  expirationRules = signal<ExpirationRule[]>([]);

  // Regla seleccionada para edición
  reglaSeleccionada = signal<any>(null);
  tipoReglaSeleccionadaDetalle: 'evento' | 'alerta' | 'vencimiento' | null = null;
  hayCambiosPendientes = false;
  reglaOriginal: any = null;

  // Editor visual de email
  emailBlocks = signal<EmailBlock[]>([]);
  bloqueSeleccionado: string | null = null;
  modoPreviewEmail = false;
  previewDarkMode = false;
  previewType: 'email' | 'inapp' = 'email';
  emailDrawerVisible = false;

  // Datos de ejemplo para la vista previa
  previewData = {
    nombre: 'Servidor Principal de Producción',
    descripcion: 'Servidor crítico que aloja los servicios principales de la aplicación. Requiere monitoreo constante y mantenimiento programado.',
    fecha: '29 de Diciembre, 2024 - 14:30 hrs',
    responsable: {
      nombre: 'María García López',
      email: 'maria.garcia@empresa.com',
      iniciales: 'MG'
    },
    entidad: {
      tipo: 'Activo de TI',
      icono: 'pi pi-server'
    },
    severidad: {
      label: 'Alta',
      severity: 'danger' as const
    },
    estado: {
      label: 'En Revisión',
      color: 'warning'
    },
    creador: {
      nombre: 'Carlos Mendoza',
      iniciales: 'CM'
    }
  };

  opcionesVariables = [
    { label: 'Nombre de la entidad', value: 'nombre' },
    { label: 'Descripción', value: 'descripcion' },
    { label: 'Fecha del evento', value: 'fecha' },
    { label: 'Responsable', value: 'responsable' },
    { label: 'Tipo de entidad', value: 'entidad' },
    { label: 'Severidad', value: 'severidad' },
    { label: 'Estado', value: 'estado' },
    { label: 'Creado por', value: 'creador' },
    { label: 'Enlace al detalle', value: 'enlace' },
  ];

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

  // Opciones para selects de reglas
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

  // Árbol de entidades para TreeSelect (Activos y Procesos)
  arbolEntidades = signal<TreeNode[]>([]);

  // Entidades disponibles para MultiSelect (otras entidades)
  entidadesDisponibles = signal<EntidadAsociada[]>([]);

  // Módulos disponibles según HU US-NOTIFICATIONS-001
  modulos = signal<ModuloNotificacion[]>([
    {
      id: '1',
      nombre: 'Activos',
      codigo: 'ASSET',
      icono: 'pi pi-box',
      habilitado: true,
      tipoSelector: 'tree',
      entidadesAsociadas: [],
      nodosSeleccionados: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'EXPIRATION_REMINDER', label: 'Vencimiento', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '2',
      nombre: 'Riesgos',
      codigo: 'RISK',
      icono: 'pi pi-exclamation-triangle',
      habilitado: true,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'EXPIRATION_REMINDER', label: 'Vencimiento', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '3',
      nombre: 'Incidentes',
      codigo: 'INCIDENT',
      icono: 'pi pi-bolt',
      habilitado: false,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'EXPIRATION_REMINDER', label: 'Vencimiento', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '4',
      nombre: 'Cumplimiento',
      codigo: 'COMPLIANCE_REVIEW',
      icono: 'pi pi-check-square',
      habilitado: true,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'APPROVAL', label: 'Aprobación', inApp: true, email: true, disponible: true },
        { tipo: 'REJECTION', label: 'Rechazo', inApp: true, email: true, disponible: true },
        { tipo: 'EXPIRATION_REMINDER', label: 'Vencimiento', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '5',
      nombre: 'Procesos',
      codigo: 'PROCESS',
      icono: 'pi pi-sitemap',
      habilitado: false,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'KPI_CHANGE', label: 'Cambio en KPI', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '6',
      nombre: 'Cuestionarios',
      codigo: 'QUESTIONNAIRE',
      icono: 'pi pi-file-edit',
      habilitado: false,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '7',
      nombre: 'Defectos',
      codigo: 'DEFECT',
      icono: 'pi pi-times-circle',
      habilitado: false,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true },
        { tipo: 'EXPIRATION_REMINDER', label: 'Vencimiento', inApp: true, email: true, disponible: true }
      ]
    },
    {
      id: '8',
      nombre: 'Resultados ML',
      codigo: 'ML_RESULT',
      icono: 'pi pi-chart-line',
      habilitado: false,
      tipoSelector: 'multiselect',
      entidadesAsociadas: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true }
      ]
    },
    {
      id: '9',
      nombre: 'Contenedores',
      codigo: 'ORG_CONTAINER',
      icono: 'pi pi-building',
      habilitado: false,
      tipoSelector: 'tree',
      entidadesAsociadas: [],
      nodosSeleccionados: [],
      eventos: [
        { tipo: 'CREATE', label: 'Creación', inApp: true, email: false, disponible: true },
        { tipo: 'UPDATE', label: 'Modificación', inApp: true, email: false, disponible: true },
        { tipo: 'DELETE', label: 'Eliminación', inApp: true, email: true, disponible: true }
      ]
    }
  ]);

  // Módulo seleccionado actualmente
  moduloSeleccionado = signal<ModuloNotificacion | null>(null);

  // Destinatarios por módulo (mapa moduloId -> destinatarios)
  destinatariosPorModulo = signal<Map<string, Destinatario[]>>(new Map([
    ['1', [
      { id: 'd1', tipo: 'email', valor: 'ciso@empresa.com', nombre: 'CISO' },
      { id: 'd2', tipo: 'dinamico', valor: '{{entity.owner}}', nombre: 'Dueño del activo' }
    ]],
    ['4', [
      { id: 'd3', tipo: 'usuario', valor: 'user-123', nombre: 'Juan Martínez' },
      { id: 'd4', tipo: 'dinamico', valor: '{{entity.approvers}}', nombre: 'Aprobadores' }
    ]]
  ]));

  // Para agregar nuevos destinatarios
  nuevoDestinatarioTipo: 'usuario' | 'email' | 'dinamico' = 'email';
  nuevoDestinatarioValor: any = '';
  usuariosSugeridos = signal<any[]>([]);

  tiposDestinatario = [
    { label: 'Usuario', value: 'usuario' },
    { label: 'Email', value: 'email' },
    { label: 'Dinámico', value: 'dinamico' }
  ];

  // Horario No Molestar
  horarioNoMolestar: HorarioNoMolestar = {
    habilitado: true,
    horaInicio: '22:00',
    horaFin: '07:00'
  };

  horasDisponibles = Array.from({ length: 24 }, (_, i) => ({
    label: `${i.toString().padStart(2, '0')}:00`,
    value: `${i.toString().padStart(2, '0')}:00`
  }));

  // Preferencias por prioridad
  preferenciasNotificacion: PreferenciasNotificacion = {
    prioridades: {
      critical: { email: true, inApp: true },
      high: { email: true, inApp: true },
      medium: { email: false, inApp: true },
      low: { email: false, inApp: true }
    }
  };

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarArbolActivos();
    this.cargarDatosReglas();
  }

  // === MÉTODOS PARA CARGAR ENTIDADES ===

  cargarArbolActivos(): void {
    // Cargar activos con estructura de árbol
    this.api.getActivos().subscribe({
      next: (activos: any[]) => {
        const arbol = this.convertirActivosATreeNodes(activos);
        this.arbolEntidades.set(arbol);
      },
      error: (err) => {
        console.error('Error cargando activos:', err);
        // Datos mock para desarrollo
        this.arbolEntidades.set(this.getMockArbolActivos());
      }
    });
  }

  private convertirActivosATreeNodes(activos: any[]): TreeNode[] {
    return activos.map(activo => ({
      key: activo.id,
      label: activo.nombre,
      data: activo,
      icon: this.getIconoTipoActivo(activo.tipo),
      expanded: false,
      children: activo.hijos ? this.convertirActivosATreeNodes(activo.hijos) : []
    }));
  }

  private getIconoTipoActivo(tipo: string): string {
    const iconos: Record<string, string> = {
      'hardware': 'pi pi-server',
      'software': 'pi pi-code',
      'datos': 'pi pi-database',
      'personas': 'pi pi-users',
      'instalaciones': 'pi pi-building',
      'contenedor': 'pi pi-folder'
    };
    return iconos[tipo] || 'pi pi-box';
  }

  private getMockArbolActivos(): TreeNode[] {
    return [
      // Sección de Activos
      {
        key: 'activos',
        label: 'Activos',
        icon: 'pi pi-box',
        expanded: true,
        styleClass: 'tree-section-header',
        children: [
          {
            key: 'cont-1',
            label: 'Tecnología',
            icon: 'pi pi-building',
            expanded: true,
            children: [
              {
                key: 'act-1',
                label: 'Servidor Principal',
                icon: 'pi pi-server',
                data: { id: 'act-1', nombre: 'Servidor Principal', tipo: 'hardware' },
                children: [
                  {
                    key: 'act-1-1',
                    label: 'Base de Datos Producción',
                    icon: 'pi pi-database',
                    data: { id: 'act-1-1', nombre: 'Base de Datos Producción', tipo: 'datos' }
                  },
                  {
                    key: 'act-1-2',
                    label: 'API Backend',
                    icon: 'pi pi-code',
                    data: { id: 'act-1-2', nombre: 'API Backend', tipo: 'software' }
                  }
                ]
              },
              {
                key: 'act-2',
                label: 'Servidor de Respaldo',
                icon: 'pi pi-server',
                data: { id: 'act-2', nombre: 'Servidor de Respaldo', tipo: 'hardware' }
              }
            ]
          },
          {
            key: 'cont-2',
            label: 'Recursos Humanos',
            icon: 'pi pi-building',
            expanded: false,
            children: [
              {
                key: 'act-3',
                label: 'Sistema de Nómina',
                icon: 'pi pi-code',
                data: { id: 'act-3', nombre: 'Sistema de Nómina', tipo: 'software' }
              },
              {
                key: 'act-4',
                label: 'Datos de Empleados',
                icon: 'pi pi-database',
                data: { id: 'act-4', nombre: 'Datos de Empleados', tipo: 'datos' }
              }
            ]
          },
          {
            key: 'cont-3',
            label: 'Operaciones',
            icon: 'pi pi-building',
            expanded: false,
            children: [
              {
                key: 'act-5',
                label: 'ERP Principal',
                icon: 'pi pi-code',
                data: { id: 'act-5', nombre: 'ERP Principal', tipo: 'software' }
              },
              {
                key: 'act-6',
                label: 'Planta Industrial',
                icon: 'pi pi-building',
                data: { id: 'act-6', nombre: 'Planta Industrial', tipo: 'instalaciones' }
              }
            ]
          }
        ]
      },
      // Sección de Procesos
      {
        key: 'procesos',
        label: 'Procesos',
        icon: 'pi pi-sitemap',
        expanded: true,
        styleClass: 'tree-section-header',
        children: [
          {
            key: 'proc-1',
            label: 'Gestión de TI',
            icon: 'pi pi-cog',
            expanded: false,
            children: [
              {
                key: 'proc-1-1',
                label: 'Gestión de Cambios',
                icon: 'pi pi-sync',
                data: { id: 'proc-1-1', nombre: 'Gestión de Cambios', tipo: 'proceso' }
              },
              {
                key: 'proc-1-2',
                label: 'Gestión de Incidentes',
                icon: 'pi pi-exclamation-circle',
                data: { id: 'proc-1-2', nombre: 'Gestión de Incidentes', tipo: 'proceso' }
              },
              {
                key: 'proc-1-3',
                label: 'Gestión de Problemas',
                icon: 'pi pi-question-circle',
                data: { id: 'proc-1-3', nombre: 'Gestión de Problemas', tipo: 'proceso' }
              }
            ]
          },
          {
            key: 'proc-2',
            label: 'Seguridad',
            icon: 'pi pi-shield',
            expanded: false,
            children: [
              {
                key: 'proc-2-1',
                label: 'Gestión de Accesos',
                icon: 'pi pi-key',
                data: { id: 'proc-2-1', nombre: 'Gestión de Accesos', tipo: 'proceso' }
              },
              {
                key: 'proc-2-2',
                label: 'Respuesta a Incidentes de Seguridad',
                icon: 'pi pi-bolt',
                data: { id: 'proc-2-2', nombre: 'Respuesta a Incidentes de Seguridad', tipo: 'proceso' }
              }
            ]
          },
          {
            key: 'proc-3',
            label: 'Recursos Humanos',
            icon: 'pi pi-users',
            expanded: false,
            children: [
              {
                key: 'proc-3-1',
                label: 'Onboarding',
                icon: 'pi pi-user-plus',
                data: { id: 'proc-3-1', nombre: 'Onboarding', tipo: 'proceso' }
              },
              {
                key: 'proc-3-2',
                label: 'Offboarding',
                icon: 'pi pi-user-minus',
                data: { id: 'proc-3-2', nombre: 'Offboarding', tipo: 'proceso' }
              }
            ]
          }
        ]
      }
    ];
  }

  cargarEntidadesPorModulo(codigoModulo: string): void {
    // Cargar entidades según el módulo seleccionado
    switch (codigoModulo) {
      case 'RISK':
        this.cargarRiesgos();
        break;
      case 'INCIDENT':
        this.cargarIncidentes();
        break;
      case 'COMPLIANCE_REVIEW':
        this.cargarCumplimiento();
        break;
      case 'PROCESS':
        this.cargarProcesos();
        break;
      case 'QUESTIONNAIRE':
        this.cargarCuestionarios();
        break;
      case 'DEFECT':
        this.cargarDefectos();
        break;
      case 'ML_RESULT':
        this.cargarResultadosML();
        break;
      default:
        this.entidadesDisponibles.set([]);
    }
  }

  private cargarRiesgos(): void {
    // Mock de riesgos
    this.entidadesDisponibles.set([
      { id: 'r1', nombre: 'Riesgo de Ciberseguridad', tipo: 'Alto' },
      { id: 'r2', nombre: 'Riesgo de Fuga de Datos', tipo: 'Crítico' },
      { id: 'r3', nombre: 'Riesgo Operacional', tipo: 'Medio' },
      { id: 'r4', nombre: 'Riesgo de Cumplimiento', tipo: 'Alto' },
      { id: 'r5', nombre: 'Riesgo Tecnológico', tipo: 'Medio' }
    ]);
  }

  private cargarIncidentes(): void {
    this.entidadesDisponibles.set([
      { id: 'i1', nombre: 'Incidente de Seguridad #001', tipo: 'Abierto' },
      { id: 'i2', nombre: 'Caída de Sistema', tipo: 'Resuelto' },
      { id: 'i3', nombre: 'Acceso No Autorizado', tipo: 'En Proceso' }
    ]);
  }

  private cargarCumplimiento(): void {
    this.entidadesDisponibles.set([
      { id: 'c1', nombre: 'Revisión ISO 27001', tipo: 'Pendiente' },
      { id: 'c2', nombre: 'Auditoría GDPR', tipo: 'Completado' },
      { id: 'c3', nombre: 'Evaluación SOC 2', tipo: 'En Progreso' }
    ]);
  }

  private cargarProcesos(): void {
    this.entidadesDisponibles.set([
      { id: 'p1', nombre: 'Proceso de Onboarding', tipo: 'Activo' },
      { id: 'p2', nombre: 'Gestión de Cambios', tipo: 'Activo' },
      { id: 'p3', nombre: 'Respuesta a Incidentes', tipo: 'Activo' },
      { id: 'p4', nombre: 'Revisión de Accesos', tipo: 'Inactivo' }
    ]);
  }

  private cargarCuestionarios(): void {
    this.entidadesDisponibles.set([
      { id: 'q1', nombre: 'Evaluación de Seguridad 2024', tipo: 'Activo' },
      { id: 'q2', nombre: 'Cuestionario de Proveedores', tipo: 'Activo' },
      { id: 'q3', nombre: 'Autoevaluación de Controles', tipo: 'Borrador' }
    ]);
  }

  private cargarDefectos(): void {
    this.entidadesDisponibles.set([
      { id: 'd1', nombre: 'Vulnerabilidad SQL Injection', tipo: 'Crítico' },
      { id: 'd2', nombre: 'XSS en Formulario Login', tipo: 'Alto' },
      { id: 'd3', nombre: 'Configuración SSL Débil', tipo: 'Medio' }
    ]);
  }

  private cargarResultadosML(): void {
    this.entidadesDisponibles.set([
      { id: 'ml1', nombre: 'Modelo de Detección de Anomalías', tipo: 'Producción' },
      { id: 'ml2', nombre: 'Clasificador de Riesgos', tipo: 'Testing' }
    ]);
  }

  getEntidadIcon(entidad: EntidadAsociada): string {
    const modulo = this.moduloSeleccionado();
    if (!modulo) return 'pi pi-circle';

    const iconos: Record<string, string> = {
      'RISK': 'pi pi-exclamation-triangle',
      'INCIDENT': 'pi pi-bolt',
      'COMPLIANCE_REVIEW': 'pi pi-check-square',
      'PROCESS': 'pi pi-sitemap',
      'QUESTIONNAIRE': 'pi pi-file-edit',
      'DEFECT': 'pi pi-times-circle',
      'ML_RESULT': 'pi pi-chart-line'
    };
    return iconos[modulo.codigo] || 'pi pi-circle';
  }

  // === MÉTODOS ===

  seleccionarModulo(modulo: ModuloNotificacion): void {
    this.moduloSeleccionado.set(modulo);
    // Cargar entidades según el tipo de módulo
    if (modulo.tipoSelector === 'multiselect') {
      this.cargarEntidadesPorModulo(modulo.codigo);
    }
  }

  onModuloToggle(): void {
    const modulos = this.modulos();
    const index = modulos.findIndex(m => m.id === this.moduloSeleccionado()?.id);
    if (index !== -1) {
      modulos[index] = { ...this.moduloSeleccionado()! };
      this.modulos.set([...modulos]);
    }
  }

  getDestinatariosModulo(): Destinatario[] {
    const moduloId = this.moduloSeleccionado()?.id;
    if (!moduloId) return [];
    return this.destinatariosPorModulo().get(moduloId) || [];
  }

  getDestinatarioTipoLabel(tipo: string): string {
    const map: Record<string, string> = {
      'usuario': 'Usuario',
      'email': 'Email',
      'dinamico': 'Dinámico'
    };
    return map[tipo] || tipo;
  }

  getPlaceholderDestinatario(): string {
    return this.nuevoDestinatarioTipo === 'email'
      ? 'correo@ejemplo.com'
      : '{{entity.owner}}';
  }

  getDestinatarioSeverity(tipo: string): 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'info' | 'success' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'usuario': 'info',
      'email': 'success',
      'dinamico': 'warn'
    };
    return map[tipo] || 'secondary';
  }

  agregarDestinatario(): void {
    const moduloId = this.moduloSeleccionado()?.id;
    if (!moduloId || !this.nuevoDestinatarioValor) return;

    const nuevoId = `d${Date.now()}`;
    let valor = '';
    let nombre = '';

    if (this.nuevoDestinatarioTipo === 'usuario') {
      valor = this.nuevoDestinatarioValor.id || this.nuevoDestinatarioValor;
      nombre = this.nuevoDestinatarioValor.nombre || this.nuevoDestinatarioValor;
    } else {
      valor = this.nuevoDestinatarioValor;
      nombre = this.nuevoDestinatarioValor;
    }

    const nuevoDestinatario: Destinatario = {
      id: nuevoId,
      tipo: this.nuevoDestinatarioTipo,
      valor,
      nombre
    };

    const mapa = new Map(this.destinatariosPorModulo());
    const actuales = mapa.get(moduloId) || [];
    mapa.set(moduloId, [...actuales, nuevoDestinatario]);
    this.destinatariosPorModulo.set(mapa);

    this.nuevoDestinatarioValor = '';

    this.messageService.add({
      severity: 'success',
      summary: 'Destinatario agregado',
      detail: 'El destinatario ha sido agregado correctamente'
    });
  }

  eliminarDestinatario(destinatarioId: string): void {
    const moduloId = this.moduloSeleccionado()?.id;
    if (!moduloId) return;

    const mapa = new Map(this.destinatariosPorModulo());
    const actuales = mapa.get(moduloId) || [];
    mapa.set(moduloId, actuales.filter(d => d.id !== destinatarioId));
    this.destinatariosPorModulo.set(mapa);

    this.messageService.add({
      severity: 'info',
      summary: 'Destinatario eliminado',
      detail: 'El destinatario ha sido eliminado'
    });
  }

  buscarUsuarios(event: any): void {
    const query = event.query.toLowerCase();
    const usuarios = [
      { id: 'u1', nombre: 'Juan Martínez', email: 'juan@empresa.com' },
      { id: 'u2', nombre: 'María García', email: 'maria@empresa.com' },
      { id: 'u3', nombre: 'Carlos López', email: 'carlos@empresa.com' },
      { id: 'u4', nombre: 'Ana Rodríguez', email: 'ana@empresa.com' },
      { id: 'u5', nombre: 'Pedro Sánchez', email: 'pedro@empresa.com' }
    ];
    this.usuariosSugeridos.set(
      usuarios.filter(u => u.nombre.toLowerCase().includes(query))
    );
  }

  guardarConfiguracionModulo(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Configuración guardada',
      detail: `La configuración de ${this.moduloSeleccionado()?.nombre} ha sido guardada`
    });
  }

  guardarPreferencias(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Preferencias guardadas',
      detail: 'Tus preferencias de notificación han sido actualizadas'
    });
  }

  // === MÉTODOS PARA TOOLBAR DE REGLAS ===

  getIconoTipoRegla(tipo: string): string {
    switch (tipo) {
      case 'todos': return 'pi pi-list';
      case 'eventos': return 'pi pi-bell';
      case 'alertas': return 'pi pi-exclamation-triangle';
      case 'vencimientos': return 'pi pi-calendar-clock';
      default: return 'pi pi-cog';
    }
  }

  getConteoReglas(tipo: string): number {
    switch (tipo) {
      case 'todos': return this.notificationRules().length + this.alertRules().length + this.expirationRules().length;
      case 'eventos': return this.notificationRules().length;
      case 'alertas': return this.alertRules().length;
      case 'vencimientos': return this.expirationRules().length;
      default: return 0;
    }
  }

  getBotonNuevaReglaLabel(): string {
    switch (this.tipoReglaSeleccionado) {
      case 'todos': return 'Nueva Regla';
      case 'eventos': return 'Nueva Regla';
      case 'alertas': return 'Nueva Alerta';
      case 'vencimientos': return 'Nueva Regla';
      default: return 'Nuevo';
    }
  }

  abrirDialogNuevaReglaPorTipo(): void {
    switch (this.tipoReglaSeleccionado) {
      case 'todos':
      case 'eventos':
        this.abrirDialogNuevaRegla();
        break;
      case 'alertas':
        this.abrirDialogNuevaAlerta();
        break;
      case 'vencimientos':
        this.abrirDialogNuevoVencimiento();
        break;
    }
  }

  // === MÉTODOS PARA LISTA-DETALLE ===

  seleccionarRegla(regla: any, tipo: 'evento' | 'alerta' | 'vencimiento'): void {
    // Si hay cambios pendientes, preguntar antes de cambiar
    if (this.hayCambiosPendientes) {
      this.confirmationService.confirm({
        message: 'Hay cambios sin guardar. ¿Desea descartarlos?',
        header: 'Cambios pendientes',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.cambiarReglaSeleccionada(regla, tipo);
        }
      });
    } else {
      this.cambiarReglaSeleccionada(regla, tipo);
    }
  }

  private cambiarReglaSeleccionada(regla: any, tipo: 'evento' | 'alerta' | 'vencimiento'): void {
    this.reglaSeleccionada.set({ ...regla });
    this.reglaOriginal = JSON.parse(JSON.stringify(regla));
    this.tipoReglaSeleccionadaDetalle = tipo;
    this.hayCambiosPendientes = false;

    // Cargar bloques de email si tiene email habilitado
    if (regla.enviarEmail) {
      this.cargarBloquesDeRegla();
    }
  }

  marcarCambios(): void {
    this.hayCambiosPendientes = true;
  }

  descartarCambios(): void {
    if (this.reglaOriginal) {
      this.reglaSeleccionada.set({ ...this.reglaOriginal });
    }
    this.hayCambiosPendientes = false;
  }

  guardarCambiosInline(): void {
    const regla = this.reglaSeleccionada();
    if (!regla) return;

    switch (this.tipoReglaSeleccionadaDetalle) {
      case 'evento':
        const reglas = this.notificationRules();
        const indexEvento = reglas.findIndex(r => r.id === regla.id);
        if (indexEvento >= 0) {
          reglas[indexEvento] = { ...regla };
          this.notificationRules.set([...reglas]);
        }
        break;
      case 'alerta':
        const alertas = this.alertRules();
        const indexAlerta = alertas.findIndex(a => a.id === regla.id);
        if (indexAlerta >= 0) {
          alertas[indexAlerta] = { ...regla };
          this.alertRules.set([...alertas]);
        }
        break;
      case 'vencimiento':
        const vencimientos = this.expirationRules();
        const indexVenc = vencimientos.findIndex(v => v.id === regla.id);
        if (indexVenc >= 0) {
          vencimientos[indexVenc] = { ...regla };
          this.expirationRules.set([...vencimientos]);
        }
        break;
    }

    this.reglaOriginal = JSON.parse(JSON.stringify(regla));
    this.hayCambiosPendientes = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Los cambios se han guardado correctamente'
    });
  }

  eliminarReglaSeleccionada(): void {
    const regla = this.reglaSeleccionada();
    if (!regla) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${regla.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        switch (this.tipoReglaSeleccionadaDetalle) {
          case 'evento':
            this.notificationRules.update(reglas => reglas.filter(r => r.id !== regla.id));
            break;
          case 'alerta':
            this.alertRules.update(alertas => alertas.filter(a => a.id !== regla.id));
            break;
          case 'vencimiento':
            this.expirationRules.update(vencimientos => vencimientos.filter(v => v.id !== regla.id));
            break;
        }
        this.reglaSeleccionada.set(null);
        this.tipoReglaSeleccionadaDetalle = null;
        this.hayCambiosPendientes = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'La regla se ha eliminado correctamente'
        });
      }
    });
  }

  insertarPlaceholder(placeholder: string): void {
    const regla = this.reglaSeleccionada();
    if (!regla) return;

    const texto = `{{${placeholder}}}`;
    regla.plantillaMensaje = (regla.plantillaMensaje || '') + texto;
    this.reglaSeleccionada.set({ ...regla });
    this.marcarCambios();
  }

  // === MÉTODOS PARA EDITOR VISUAL DE EMAIL ===

  agregarBloque(tipo: EmailBlockType): void {
    const nuevoBloque: EmailBlock = {
      id: `block-${Date.now()}`,
      type: tipo,
      content: '',
      styles: {
        alignment: tipo === 'button' ? 'center' : 'left',
        color: tipo === 'alert' ? 'info' : undefined
      }
    };

    this.emailBlocks.update(blocks => [...blocks, nuevoBloque]);
    this.bloqueSeleccionado = nuevoBloque.id;
    this.marcarCambios();
  }

  eliminarBloque(id: string): void {
    this.emailBlocks.update(blocks => blocks.filter(b => b.id !== id));
    if (this.bloqueSeleccionado === id) {
      this.bloqueSeleccionado = null;
    }
    this.marcarCambios();
  }

  moverBloque(index: number, direccion: number): void {
    const blocks = [...this.emailBlocks()];
    const nuevoIndex = index + direccion;

    if (nuevoIndex < 0 || nuevoIndex >= blocks.length) return;

    const temp = blocks[index];
    blocks[index] = blocks[nuevoIndex];
    blocks[nuevoIndex] = temp;

    this.emailBlocks.set(blocks);
    this.marcarCambios();
  }

  seleccionarBloque(id: string): void {
    this.bloqueSeleccionado = id;
  }

  actualizarBloque(block: EmailBlock): void {
    this.emailBlocks.update(blocks =>
      blocks.map(b => b.id === block.id ? { ...block } : b)
    );
    this.marcarCambios();
  }

  setBlockAlignment(block: EmailBlock, alignment: 'left' | 'center' | 'right'): void {
    block.styles = { ...block.styles, alignment };
    this.actualizarBloque(block);
  }

  setAlertType(block: EmailBlock, tipo: string): void {
    block.styles = { ...block.styles, color: tipo };
    this.actualizarBloque(block);
  }

  togglePreviewEmail(): void {
    this.modoPreviewEmail = !this.modoPreviewEmail;
  }

  // Métodos para el drawer del editor de email
  abrirEditorEmail(): void {
    this.emailDrawerVisible = true;
    // Cargar bloques si no están cargados
    if (this.emailBlocks().length === 0) {
      this.cargarBloquesDeRegla();
    }
  }

  cerrarEditorEmail(): void {
    this.emailDrawerVisible = false;
  }

  guardarPlantillaEmail(): void {
    // Guardar los bloques en la regla seleccionada
    const regla = this.reglaSeleccionada();
    if (regla) {
      regla.emailBlocks = [...this.emailBlocks()];
      this.marcarCambios();
      this.messageService.add({
        severity: 'success',
        summary: 'Plantilla guardada',
        detail: 'La plantilla de correo se ha guardado correctamente'
      });
    }
    this.emailDrawerVisible = false;
  }

  // Cargar bloques cuando se selecciona una regla con email habilitado
  cargarBloquesDeRegla(): void {
    const regla = this.reglaSeleccionada();
    if (regla?.emailBlocks) {
      this.emailBlocks.set([...regla.emailBlocks]);
    } else {
      // Cargar plantilla por defecto si no hay bloques
      this.emailBlocks.set([
        {
          id: 'block-default-1',
          type: 'header',
          content: 'Nueva Notificación',
          styles: { alignment: 'center' }
        },
        {
          id: 'block-default-2',
          type: 'paragraph',
          content: 'Se ha generado una nueva notificación en el sistema.',
          styles: { alignment: 'left' }
        },
        {
          id: 'block-default-3',
          type: 'variable',
          content: 'nombre',
          styles: {}
        },
        {
          id: 'block-default-4',
          type: 'divider',
          content: '',
          styles: {}
        },
        {
          id: 'block-default-5',
          type: 'button',
          content: 'Ver Detalles',
          styles: { alignment: 'center' }
        }
      ]);
    }
    this.modoPreviewEmail = false;
  }

  // === MÉTODOS PARA GESTIÓN DE REGLAS ===

  cargarDatosReglas(): void {
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

  // Helpers para labels
  getEntidadLabel(valor: string): string {
    return this.opcionesEntidad.find((o) => o.value === valor)?.label ||
           this.opcionesEntidadVencimiento.find((o) => o.value === valor)?.label ||
           valor;
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
    const op = this.opcionesOperador.find((o) => o.value === valor);
    if (!op) return valor;
    // Return just the symbol
    switch (valor) {
      case 'GT': return '>';
      case 'LT': return '<';
      case 'GTE': return '>=';
      case 'LTE': return '<=';
      case 'EQ': return '=';
      case 'NE': return '!=';
      default: return valor;
    }
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
