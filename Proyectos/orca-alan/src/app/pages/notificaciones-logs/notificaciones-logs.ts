import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';

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
    TagModule,
    TooltipModule,
    DatePickerModule,
    CardModule,
    DialogModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1><i class="pi pi-history"></i> Logs de Notificaciones</h1>
          <p>Historial de todas las notificaciones enviadas, fallidas y omitidas</p>
        </div>
        <div class="header-actions">
          <p-button
            label="Exportar"
            icon="pi pi-download"
            severity="secondary"
            (onClick)="exportarLogs()"
          />
          <p-button
            label="Actualizar"
            icon="pi pi-refresh"
            (onClick)="cargarLogs()"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card sent">
          <div class="stat-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().sent }}</span>
            <span class="stat-label">Enviadas</span>
          </div>
        </div>
        <div class="stat-card failed">
          <div class="stat-icon">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().failed }}</span>
            <span class="stat-label">Fallidas</span>
          </div>
        </div>
        <div class="stat-card pending">
          <div class="stat-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().pending }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card skipped">
          <div class="stat-icon">
            <i class="pi pi-forward"></i>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats().skipped }}</span>
            <span class="stat-label">Omitidas</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Canal</label>
          <p-select
            [(ngModel)]="filtroCanal"
            [options]="opcionesCanal"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los canales"
            [showClear]="true"
            (onChange)="aplicarFiltros()"
          />
        </div>
        <div class="filter-group">
          <label>Estado</label>
          <p-select
            [(ngModel)]="filtroEstado"
            [options]="opcionesEstado"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los estados"
            [showClear]="true"
            (onChange)="aplicarFiltros()"
          />
        </div>
        <div class="filter-group">
          <label>Tipo de Regla</label>
          <p-select
            [(ngModel)]="filtroReglaTipo"
            [options]="opcionesReglaTipo"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los tipos"
            [showClear]="true"
            (onChange)="aplicarFiltros()"
          />
        </div>
        <div class="filter-group">
          <label>Desde</label>
          <p-datepicker
            [(ngModel)]="filtroDesde"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Fecha inicio"
            (onSelect)="aplicarFiltros()"
          />
        </div>
        <div class="filter-group">
          <label>Hasta</label>
          <p-datepicker
            [(ngModel)]="filtroHasta"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            placeholder="Fecha fin"
            (onSelect)="aplicarFiltros()"
          />
        </div>
        <div class="filter-group">
          <label>&nbsp;</label>
          <p-button
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            [text]="true"
            (onClick)="limpiarFiltros()"
          />
        </div>
      </div>

      <!-- Table -->
      <p-table
        [value]="logsFiltrados()"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[10, 20, 50, 100]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        [rowHover]="true"
        styleClass="p-datatable-sm p-datatable-striped"
        [loading]="cargando()"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 160px">Fecha</th>
            <th>Usuario</th>
            <th style="width: 100px">Canal</th>
            <th style="width: 100px">Estado</th>
            <th>Regla</th>
            <th>Mensaje/Error</th>
            <th style="width: 80px">Acciones</th>
          </tr>
        </ng-template>
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
            <td>
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
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="empty-message">
              <i class="pi pi-inbox"></i>
              <p>No se encontraron registros con los filtros aplicados</p>
            </td>
          </tr>
        </ng-template>
      </p-table>

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
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
    }

    .stat-card .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-card .stat-icon i {
      font-size: 1.5rem;
    }

    .stat-card.sent .stat-icon {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
    }

    .stat-card.failed .stat-icon {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .stat-card.pending .stat-icon {
      background: rgba(234, 179, 8, 0.1);
      color: #eab308;
    }

    .stat-card.skipped .stat-icon {
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .filters-section {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--surface-ground);
      border-radius: 0.5rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .filter-group label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-color-secondary);
    }

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

    .text-muted {
      color: var(--text-color-secondary);
    }

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

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `],
})
export class NotificacionesLogsComponent implements OnInit {
  // Data
  logs = signal<NotificationLog[]>([]);
  logsFiltrados = signal<NotificationLog[]>([]);
  stats = signal<LogStats>({ sent: 0, failed: 0, pending: 0, skipped: 0, total: 0 });
  cargando = signal(false);

  // Filters
  filtroCanal: string | null = null;
  filtroEstado: string | null = null;
  filtroReglaTipo: string | null = null;
  filtroDesde: Date | null = null;
  filtroHasta: Date | null = null;

  // Dialog
  dialogDetallesVisible = false;
  logSeleccionado: NotificationLog | null = null;

  // Options
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
      this.logsFiltrados.set(mockLogs);
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

  aplicarFiltros(): void {
    let resultado = this.logs();

    if (this.filtroCanal) {
      resultado = resultado.filter((l) => l.canal === this.filtroCanal);
    }

    if (this.filtroEstado) {
      resultado = resultado.filter((l) => l.estado === this.filtroEstado);
    }

    if (this.filtroReglaTipo) {
      resultado = resultado.filter((l) => l.reglaTipo === this.filtroReglaTipo);
    }

    if (this.filtroDesde) {
      resultado = resultado.filter((l) => new Date(l.fechaEnvio) >= this.filtroDesde!);
    }

    if (this.filtroHasta) {
      const hastaFin = new Date(this.filtroHasta);
      hastaFin.setHours(23, 59, 59, 999);
      resultado = resultado.filter((l) => new Date(l.fechaEnvio) <= hastaFin);
    }

    this.logsFiltrados.set(resultado);
    this.actualizarStats(resultado);
  }

  limpiarFiltros(): void {
    this.filtroCanal = null;
    this.filtroEstado = null;
    this.filtroReglaTipo = null;
    this.filtroDesde = null;
    this.filtroHasta = null;
    this.logsFiltrados.set(this.logs());
    this.actualizarStats(this.logs());
  }

  exportarLogs(): void {
    // En producción, esto generaría un CSV o Excel
    console.log('Exportando logs:', this.logsFiltrados());
    alert('Funcionalidad de exportación en desarrollo');
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
