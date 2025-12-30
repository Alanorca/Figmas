import { Component, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

// Interfaces
interface NotificationLog {
  id: string;
  notificationId?: string;
  usuarioId: string;
  usuarioNombre?: string;
  canal: string;
  estado: string;
  errorMensaje?: string;
  reglaId?: string;
  reglaTipo?: string;
  reglaNombre?: string;
  metadata?: Record<string, any>;
  fechaEnvio: Date;
}

interface LogStats {
  sent: number;
  failed: number;
  pending: number;
  skipped: number;
  total: number;
}

@Component({
  selector: 'app-notificaciones-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    CardModule,
    DialogModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
  ],
  template: `
    <!-- Toolbar -->
    <p-toolbar styleClass="toolbar-attached">
      <ng-template pTemplate="start">
        <div class="flex align-items-center gap-3">
          <!-- Stats Chips -->
          <div class="resumen-panel-compact">
            <div class="stat-chip stat-chip-green">
              <i class="pi pi-check-circle"></i>
              <span class="stat-label">Enviadas</span>
              <span class="stat-value">{{ stats().sent }}</span>
            </div>
            <div class="stat-chip stat-chip-red">
              <i class="pi pi-times-circle"></i>
              <span class="stat-label">Fallidas</span>
              <span class="stat-value">{{ stats().failed }}</span>
            </div>
            <div class="stat-chip stat-chip-orange">
              <i class="pi pi-clock"></i>
              <span class="stat-label">Pendientes</span>
              <span class="stat-value">{{ stats().pending }}</span>
            </div>
            <div class="stat-chip stat-chip-gray">
              <i class="pi pi-forward"></i>
              <span class="stat-label">Omitidas</span>
              <span class="stat-value">{{ stats().skipped }}</span>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="center">
        <p-iconfield>
          <p-inputicon styleClass="pi pi-search" />
          <input
            type="text"
            pInputText
            placeholder="Buscar en todos los campos..."
            (input)="dt.filterGlobal($any($event.target).value, 'contains')"
            style="width: 280px" />
        </p-iconfield>
      </ng-template>

      <ng-template pTemplate="end">
        <div class="flex gap-2 align-items-center">
          <p-menu #exportMenu [model]="exportMenuItems" [popup]="true" appendTo="body"></p-menu>
          <p-button
            icon="pi pi-download"
            severity="secondary"
            [rounded]="true"
            [text]="true"
            (onClick)="exportMenu.toggle($event)"
            pTooltip="Exportar"
            tooltipPosition="bottom" />
          <p-button
            icon="pi pi-refresh"
            severity="secondary"
            [rounded]="true"
            [text]="true"
            (onClick)="cargarLogs()"
            pTooltip="Actualizar"
            tooltipPosition="bottom"
            [loading]="cargando()" />
        </div>
      </ng-template>
    </p-toolbar>

    <!-- Tabla Principal -->
    <p-card styleClass="table-card">
      <p-table
        #dt
        [value]="logs()"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[10, 20, 50, 100]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        [globalFilterFields]="['usuarioNombre', 'usuarioId', 'canal', 'estado', 'reglaNombre', 'reglaTipo', 'errorMensaje']"
        [filterDelay]="300"
        [rowHover]="true"
        styleClass="p-datatable-sm"
        [loading]="cargando()"
        (onFilter)="onTableFilter($event)"
      >
        <!-- Header con filtros -->
        <ng-template pTemplate="header">
          <!-- Fila de títulos -->
          <tr>
            <th pSortableColumn="fechaEnvio" style="width: 160px">
              <div class="flex align-items-center">
                <span>Fecha</span>
                <p-sortIcon field="fechaEnvio" />
              </div>
            </th>
            <th pSortableColumn="usuarioNombre">
              <div class="flex align-items-center">
                <span>Usuario</span>
                <p-sortIcon field="usuarioNombre" />
              </div>
            </th>
            <th style="width: 120px">Canal</th>
            <th style="width: 120px">Estado</th>
            <th>Regla</th>
            <th>Mensaje/Error</th>
            <th style="width: 80px">
              <div class="flex align-items-center justify-content-between">
                <span>Acciones</span>
                <p-button
                  icon="pi pi-filter-slash"
                  [rounded]="true"
                  [text]="true"
                  severity="secondary"
                  size="small"
                  (onClick)="dt.clear()"
                  pTooltip="Limpiar filtros"
                  tooltipPosition="left" />
              </div>
            </th>
          </tr>
          <!-- Fila de filtros -->
          <tr>
            <th>
              <p-columnFilter type="date" field="fechaEnvio" display="menu" [showMenu]="true">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-datePicker
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    dateFormat="dd/mm/yy"
                    placeholder="Filtrar fecha"
                    [showIcon]="true" />
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter field="usuarioNombre" matchMode="in" [showMenu]="false">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-multiSelect
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    [options]="opcionesUsuarios()"
                    placeholder="Todos"
                    appendTo="body"
                    [filter]="true"
                    filterPlaceholder="Buscar usuario...">
                    <ng-template let-option pTemplate="item">
                      <div class="flex align-items-center gap-2">
                        <i class="pi pi-user"></i>
                        <span>{{ option.label }}</span>
                      </div>
                    </ng-template>
                  </p-multiSelect>
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter field="canal" matchMode="in" [showMenu]="false">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-multiSelect
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    [options]="opcionesCanal"
                    placeholder="Todos"
                    appendTo="body"
                    [showHeader]="false">
                    <ng-template let-option pTemplate="item">
                      <div class="flex align-items-center gap-2">
                        <i [class]="getCanalIcon(option.value)"></i>
                        <span>{{ option.label }}</span>
                      </div>
                    </ng-template>
                  </p-multiSelect>
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter field="estado" matchMode="in" [showMenu]="false">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-multiSelect
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    [options]="opcionesEstado"
                    placeholder="Todos"
                    appendTo="body"
                    [showHeader]="false">
                    <ng-template let-option pTemplate="item">
                      <p-tag [value]="option.label" [severity]="getEstadoSeverity(option.value)" />
                    </ng-template>
                  </p-multiSelect>
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter field="reglaTipo" matchMode="in" [showMenu]="false">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <p-multiSelect
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    [options]="opcionesReglaTipo"
                    placeholder="Todas"
                    appendTo="body"
                    [showHeader]="false">
                    <ng-template let-option pTemplate="item">
                      <span>{{ option.label }}</span>
                    </ng-template>
                  </p-multiSelect>
                </ng-template>
              </p-columnFilter>
            </th>
            <th>
              <p-columnFilter type="text" field="errorMensaje" [showMenu]="false">
                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                  <input
                    pInputText
                    type="text"
                    [ngModel]="value"
                    (ngModelChange)="filter($event)"
                    placeholder="Buscar..."
                    class="p-column-filter" />
                </ng-template>
              </p-columnFilter>
            </th>
            <th></th>
          </tr>
        </ng-template>

        <!-- Body -->
        <ng-template pTemplate="body" let-log>
          <tr>
            <td>
              <span class="fecha-log">{{ log.fechaEnvio | date:'dd/MM/yyyy HH:mm:ss' }}</span>
            </td>
            <td>
              <div class="usuario-info">
                <i class="pi pi-user"></i>
                <span>{{ log.usuarioNombre || log.usuarioId }}</span>
              </div>
            </td>
            <td>
              <p-tag
                [value]="getCanalLabel(log.canal)"
                [severity]="getCanalSeverity(log.canal)"
                [icon]="getCanalIcon(log.canal)"
              />
            </td>
            <td>
              <p-tag
                [value]="getEstadoLabel(log.estado)"
                [severity]="getEstadoSeverity(log.estado)"
              />
            </td>
            <td>
              @if (log.reglaNombre) {
                <div class="regla-info">
                  <span class="regla-nombre">{{ log.reglaNombre }}</span>
                  <small class="regla-tipo">{{ getReglaTipoLabel(log.reglaTipo) }}</small>
                </div>
              } @else if (log.reglaId) {
                <small class="text-muted">{{ log.reglaId }}</small>
              } @else {
                <span class="text-muted">-</span>
              }
            </td>
            <td>
              @if (log.errorMensaje) {
                <span class="error-mensaje" [pTooltip]="log.errorMensaje">
                  <i class="pi pi-exclamation-circle"></i>
                  {{ truncarTexto(log.errorMensaje, 50) }}
                </span>
              } @else if (log.metadata?.razon) {
                <span class="skip-razon" [pTooltip]="log.metadata.razon">
                  <i class="pi pi-info-circle"></i>
                  {{ truncarTexto(log.metadata.razon, 50) }}
                </span>
              } @else {
                <span class="text-muted">-</span>
              }
            </td>
            <td class="text-center">
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                pTooltip="Ver detalles"
                (onClick)="verDetalles(log)"
              />
            </td>
          </tr>
        </ng-template>

        <!-- Empty -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center py-6">
              <div class="empty-state">
                <i class="pi pi-inbox text-4xl text-secondary mb-3"></i>
                <p class="text-secondary">No se encontraron registros</p>
                <p-button
                  label="Limpiar filtros"
                  [text]="true"
                  (onClick)="dt.clear()" />
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Footer con totales -->
        <ng-template pTemplate="footer">
          <tr class="font-semibold surface-100">
            <td colspan="7">
              <span class="text-900">Total: {{ stats().total }} registros</span>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>

    <!-- Dialog: Detalles -->
    <p-dialog
      [(visible)]="dialogDetallesVisible"
      header="Detalles del Log"
      [modal]="true"
      [style]="{ width: '600px' }"
      [draggable]="false"
    >
      @if (logSeleccionado) {
        <div class="detalle-content">
          <div class="detalle-row">
            <span class="detalle-label">ID:</span>
            <span class="detalle-value">{{ logSeleccionado.id }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-label">Fecha:</span>
            <span class="detalle-value">{{ logSeleccionado.fechaEnvio | date:'dd/MM/yyyy HH:mm:ss' }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-label">Usuario:</span>
            <span class="detalle-value">{{ logSeleccionado.usuarioNombre || logSeleccionado.usuarioId }}</span>
          </div>
          <div class="detalle-row">
            <span class="detalle-label">Canal:</span>
            <span class="detalle-value">
              <p-tag [value]="getCanalLabel(logSeleccionado.canal)" [severity]="getCanalSeverity(logSeleccionado.canal)" />
            </span>
          </div>
          <div class="detalle-row">
            <span class="detalle-label">Estado:</span>
            <span class="detalle-value">
              <p-tag [value]="getEstadoLabel(logSeleccionado.estado)" [severity]="getEstadoSeverity(logSeleccionado.estado)" />
            </span>
          </div>
          @if (logSeleccionado.notificationId) {
            <div class="detalle-row">
              <span class="detalle-label">ID Notificación:</span>
              <span class="detalle-value">{{ logSeleccionado.notificationId }}</span>
            </div>
          }
          @if (logSeleccionado.reglaId) {
            <div class="detalle-row">
              <span class="detalle-label">Regla:</span>
              <span class="detalle-value">
                {{ logSeleccionado.reglaNombre || logSeleccionado.reglaId }}
                <small class="text-muted">({{ getReglaTipoLabel(logSeleccionado.reglaTipo) }})</small>
              </span>
            </div>
          }
          @if (logSeleccionado.errorMensaje) {
            <div class="detalle-row error">
              <span class="detalle-label">Error:</span>
              <span class="detalle-value">{{ logSeleccionado.errorMensaje }}</span>
            </div>
          }
          @if (logSeleccionado.metadata) {
            <div class="detalle-row">
              <span class="detalle-label">Metadata:</span>
              <pre class="detalle-json">{{ logSeleccionado.metadata | json }}</pre>
            </div>
          }
        </div>
      }
    </p-dialog>
  `,
  styles: [`
    // ============================================================================
    // TOOLBAR ATTACHED - Sin espacio entre toolbar y card
    // ============================================================================
    :host ::ng-deep .toolbar-attached {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      margin-bottom: 0;
    }

    :host ::ng-deep .table-card {
      border-top-left-radius: 0;
      border-top-right-radius: 0;
    }

    // ============================================================================
    // STAT CHIPS - Siguiendo patrón de COMPONENTES-REUTILIZABLES.md
    // ============================================================================
    .resumen-panel-compact {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .stat-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      transition: all 0.2s;

      .stat-label {
        color: var(--text-color-secondary);
      }

      .stat-value {
        font-weight: 600;
        color: var(--text-color);
      }
    }

    .stat-chip-green {
      background: rgba(34, 197, 94, 0.08);
      border-color: rgba(34, 197, 94, 0.2);
      i { color: #22c55e; }
      .stat-value { color: #16a34a; }
    }

    .stat-chip-red {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.2);
      i { color: #ef4444; }
      .stat-value { color: #dc2626; }
    }

    .stat-chip-orange {
      background: rgba(249, 115, 22, 0.08);
      border-color: rgba(249, 115, 22, 0.2);
      i { color: #f97316; }
      .stat-value { color: #ea580c; }
    }

    .stat-chip-gray {
      background: rgba(148, 163, 184, 0.08);
      border-color: rgba(148, 163, 184, 0.2);
      i { color: #94a3b8; }
      .stat-value { color: #64748b; }
    }

    // ============================================================================
    // TABLE STYLES
    // ============================================================================
    .fecha-log {
      font-family: monospace;
      font-size: 0.85rem;
    }

    .usuario-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .usuario-info i {
      color: var(--text-color-secondary);
    }

    .regla-info {
      display: flex;
      flex-direction: column;
    }

    .regla-nombre {
      font-weight: 500;
    }

    .regla-tipo {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .error-mensaje {
      color: var(--red-500);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .skip-razon {
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .text-muted {
      color: var(--text-color-secondary);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    // ============================================================================
    // COLUMN FILTER STYLES
    // ============================================================================
    .p-column-filter {
      width: 100%;
    }

    :host ::ng-deep {
      .p-multiselect {
        width: 100%;
      }

      .p-datatable .p-datatable-thead > tr > th {
        padding: 0.75rem;
      }

      .p-datatable .p-datatable-tbody > tr > td {
        padding: 0.75rem;
      }
    }

    // ============================================================================
    // DIALOG STYLES
    // ============================================================================
    .detalle-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detalle-row {
      display: flex;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--surface-border);
    }

    .detalle-row:last-child {
      border-bottom: none;
    }

    .detalle-row.error {
      background: rgba(239, 68, 68, 0.1);
      padding: 0.75rem;
      border-radius: 0.25rem;
      border-bottom: none;
    }

    .detalle-label {
      font-weight: 600;
      min-width: 120px;
      color: var(--text-color-secondary);
    }

    .detalle-value {
      flex: 1;
    }

    .detalle-json {
      background: var(--surface-ground);
      padding: 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.8rem;
      overflow-x: auto;
      margin: 0;
    }
  `],
})
export class NotificacionesLogsComponent implements OnInit {
  @ViewChild('dt') dt!: Table;

  // Data
  logs = signal<NotificationLog[]>([]);
  stats = signal<LogStats>({ sent: 0, failed: 0, pending: 0, skipped: 0, total: 0 });
  cargando = signal(false);

  // Dialog
  dialogDetallesVisible = false;
  logSeleccionado: NotificationLog | null = null;

  // Options for filters
  opcionesCanal = [
    { label: 'In-App', value: 'IN_APP' },
    { label: 'Email', value: 'EMAIL' },
  ];

  opcionesEstado = [
    { label: 'Enviado', value: 'SENT' },
    { label: 'Fallido', value: 'FAILED' },
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Omitido', value: 'SKIPPED' },
  ];

  opcionesReglaTipo = [
    { label: 'Regla de Evento', value: 'NOTIFICATION_RULE' },
    { label: 'Alerta por Umbral', value: 'ALERT_RULE' },
    { label: 'Regla de Vencimiento', value: 'EXPIRATION_RULE' },
  ];

  // Computed: usuarios únicos de los logs
  opcionesUsuarios = computed(() => {
    const usuarios = this.logs();
    const uniqueUsers = new Map<string, string>();
    usuarios.forEach(log => {
      const nombre = log.usuarioNombre || log.usuarioId;
      if (!uniqueUsers.has(nombre)) {
        uniqueUsers.set(nombre, nombre);
      }
    });
    return Array.from(uniqueUsers.entries()).map(([value, label]) => ({ label, value }));
  });

  // Export menu
  exportMenuItems: MenuItem[] = [
    { label: 'Excel (.xlsx)', icon: 'pi pi-file-excel', command: () => this.exportarLogs('excel') },
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.exportarLogs('pdf') },
    { label: 'CSV', icon: 'pi pi-file', command: () => this.exportarLogs('csv') },
  ];

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando.set(true);

    // Simular carga de datos (en producción sería una llamada HTTP)
    setTimeout(() => {
      const mockLogs: NotificationLog[] = [
        {
          id: '1',
          notificationId: 'notif-1',
          usuarioId: 'user-1',
          usuarioNombre: 'Juan Pérez',
          canal: 'IN_APP',
          estado: 'SENT',
          reglaId: 'rule-1',
          reglaTipo: 'NOTIFICATION_RULE',
          reglaNombre: 'Nuevo Activo Creado',
          fechaEnvio: new Date(),
        },
        {
          id: '2',
          notificationId: 'notif-2',
          usuarioId: 'user-2',
          usuarioNombre: 'María García',
          canal: 'EMAIL',
          estado: 'SENT',
          reglaId: 'rule-1',
          reglaTipo: 'NOTIFICATION_RULE',
          reglaNombre: 'Nuevo Activo Creado',
          fechaEnvio: new Date(Date.now() - 3600000),
        },
        {
          id: '3',
          usuarioId: 'user-3',
          usuarioNombre: 'Carlos López',
          canal: 'IN_APP',
          estado: 'SKIPPED',
          reglaId: 'rule-2',
          reglaTipo: 'ALERT_RULE',
          reglaNombre: 'KPI bajo nivel',
          metadata: { razon: 'Horario No Molestar activo (solo se envían notificaciones críticas)' },
          fechaEnvio: new Date(Date.now() - 7200000),
        },
        {
          id: '4',
          usuarioId: 'user-4',
          usuarioNombre: 'Ana Martínez',
          canal: 'EMAIL',
          estado: 'FAILED',
          errorMensaje: 'SMTP connection failed: timeout after 30000ms',
          reglaId: 'rule-3',
          reglaTipo: 'EXPIRATION_RULE',
          reglaNombre: 'Vencimiento Cuestionarios',
          fechaEnvio: new Date(Date.now() - 10800000),
        },
        {
          id: '5',
          notificationId: 'notif-5',
          usuarioId: 'user-5',
          usuarioNombre: 'Pedro Sánchez',
          canal: 'IN_APP',
          estado: 'SENT',
          reglaId: 'rule-3',
          reglaTipo: 'EXPIRATION_RULE',
          reglaNombre: 'Vencimiento Cuestionarios',
          fechaEnvio: new Date(Date.now() - 86400000),
        },
        {
          id: '6',
          usuarioId: 'user-1',
          usuarioNombre: 'Juan Pérez',
          canal: 'IN_APP',
          estado: 'SKIPPED',
          reglaId: 'rule-2',
          reglaTipo: 'ALERT_RULE',
          reglaNombre: 'KPI bajo nivel',
          metadata: { razon: 'Severidad info deshabilitada por preferencias del usuario' },
          fechaEnvio: new Date(Date.now() - 172800000),
        },
      ];

      this.logs.set(mockLogs);
      this.actualizarStats(mockLogs);
      this.cargando.set(false);
    }, 500);
  }

  actualizarStats(logs: NotificationLog[]): void {
    const stats: LogStats = {
      sent: logs.filter((l) => l.estado === 'SENT').length,
      failed: logs.filter((l) => l.estado === 'FAILED').length,
      pending: logs.filter((l) => l.estado === 'PENDING').length,
      skipped: logs.filter((l) => l.estado === 'SKIPPED').length,
      total: logs.length,
    };
    this.stats.set(stats);
  }

  onTableFilter(event: any): void {
    // Actualizar stats basados en los registros filtrados
    if (event.filteredValue) {
      this.actualizarStats(event.filteredValue);
    }
  }

  exportarLogs(formato: string): void {
    console.log('Exportando logs en formato:', formato);
    // En producción, esto generaría el archivo correspondiente
  }

  verDetalles(log: NotificationLog): void {
    this.logSeleccionado = log;
    this.dialogDetallesVisible = true;
  }

  // Helpers
  getCanalLabel(canal: string): string {
    switch (canal) {
      case 'IN_APP': return 'In-App';
      case 'EMAIL': return 'Email';
      default: return canal;
    }
  }

  getCanalSeverity(canal: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (canal) {
      case 'IN_APP': return 'info';
      case 'EMAIL': return 'warn';
      default: return 'secondary';
    }
  }

  getCanalIcon(canal: string): string {
    switch (canal) {
      case 'IN_APP': return 'pi pi-desktop';
      case 'EMAIL': return 'pi pi-envelope';
      default: return '';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'SENT': return 'Enviado';
      case 'FAILED': return 'Fallido';
      case 'PENDING': return 'Pendiente';
      case 'SKIPPED': return 'Omitido';
      case 'DELIVERED': return 'Entregado';
      default: return estado;
    }
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'SENT': return 'success';
      case 'DELIVERED': return 'success';
      case 'FAILED': return 'danger';
      case 'PENDING': return 'warn';
      case 'SKIPPED': return 'secondary';
      default: return 'secondary';
    }
  }

  getReglaTipoLabel(tipo?: string): string {
    switch (tipo) {
      case 'NOTIFICATION_RULE': return 'Regla de Evento';
      case 'ALERT_RULE': return 'Alerta por Umbral';
      case 'EXPIRATION_RULE': return 'Regla de Vencimiento';
      default: return tipo || '';
    }
  }

  truncarTexto(texto: string, maxLength: number): string {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  }
}
