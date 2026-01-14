// ============================================================================
// CALENDARIO WIDGET COMPONENT (W6)
// ============================================================================
// Widget de calendario para el dashboard con eventos y fechas importantes
// Basado en FullCalendar para Angular
// ============================================================================

import { Component, Input, Output, EventEmitter, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';
import { DateClickArg } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';

export interface CalendarioEvento {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  tipo: 'revision' | 'auditoria' | 'vencimiento' | 'capacitacion' | 'reunion' | 'otro';
  descripcion?: string;
  proceso?: string;
  responsable?: string;
  prioridad?: 'alta' | 'media' | 'baja';
  completado?: boolean;
}

@Component({
  selector: 'app-calendario-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    TagModule,
    BadgeModule
  ],
  template: `
    <div class="calendario-widget" [class.compact]="modo === 'compact'">
      <!-- Header con controles -->
      <div class="calendario-header">
        <div class="calendario-nav">
          <p-button
            icon="pi pi-chevron-left"
            [rounded]="true"
            [text]="true"
            size="small"
            (onClick)="navegarMes(-1)"
            pTooltip="Mes anterior">
          </p-button>
          <span class="calendario-titulo">{{ tituloMes() }}</span>
          <p-button
            icon="pi pi-chevron-right"
            [rounded]="true"
            [text]="true"
            size="small"
            (onClick)="navegarMes(1)"
            pTooltip="Mes siguiente">
          </p-button>
        </div>

        <div class="calendario-acciones">
          <p-button
            icon="pi pi-calendar"
            label="Hoy"
            [text]="true"
            size="small"
            (onClick)="irAHoy()">
          </p-button>
          @if (modo !== 'compact') {
            <p-button
              [icon]="vistaActual() === 'dayGridMonth' ? 'pi pi-list' : 'pi pi-th-large'"
              [text]="true"
              size="small"
              (onClick)="cambiarVista()"
              [pTooltip]="vistaActual() === 'dayGridMonth' ? 'Vista semanal' : 'Vista mensual'">
            </p-button>
          }
        </div>
      </div>

      <!-- Leyenda de tipos -->
      @if (mostrarLeyenda && modo !== 'compact') {
        <div class="calendario-leyenda">
          <span class="leyenda-item" *ngFor="let tipo of tiposEvento">
            <span class="leyenda-color" [style.background]="getColorTipo(tipo.value)"></span>
            {{ tipo.label }}
          </span>
        </div>
      }

      <!-- Calendario FullCalendar -->
      <div class="calendario-contenedor">
        <full-calendar [options]="calendarOptions()"></full-calendar>
      </div>

      <!-- Resumen de próximos eventos -->
      @if (mostrarResumen && modo !== 'compact') {
        <div class="calendario-resumen">
          <h4 class="resumen-titulo">
            <i class="pi pi-clock"></i>
            Próximos eventos
          </h4>
          <div class="resumen-lista">
            @for (evento of proximosEventos(); track evento.id) {
              <div class="resumen-evento" (click)="seleccionarEvento(evento)">
                <span class="evento-fecha" [style.borderLeftColor]="getColorTipo(evento.tipo)">
                  {{ formatFechaCorta(evento.start) }}
                </span>
                <div class="evento-info">
                  <span class="evento-titulo">{{ evento.title }}</span>
                  @if (evento.proceso) {
                    <span class="evento-proceso">{{ evento.proceso }}</span>
                  }
                </div>
                <p-tag
                  [value]="evento.tipo"
                  [severity]="getSeverityTipo(evento.tipo)"
                  [rounded]="true">
                </p-tag>
              </div>
            } @empty {
              <div class="resumen-vacio">
                <i class="pi pi-calendar-times"></i>
                <span>Sin eventos próximos</span>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Dialog de detalle de evento -->
    <p-dialog
      header="Detalle del Evento"
      [(visible)]="showEventoDialog"
      [modal]="true"
      [style]="{width: '400px'}"
      [draggable]="false"
      [resizable]="false">

      @if (eventoSeleccionado()) {
        <div class="evento-dialog-content">
          <div class="evento-dialog-header">
            <span class="evento-tipo-badge" [style.background]="getColorTipo(eventoSeleccionado()!.tipo)">
              {{ getLabelTipo(eventoSeleccionado()!.tipo) }}
            </span>
            @if (eventoSeleccionado()!.prioridad) {
              <p-tag
                [value]="'Prioridad ' + eventoSeleccionado()!.prioridad"
                [severity]="eventoSeleccionado()!.prioridad === 'alta' ? 'danger' : eventoSeleccionado()!.prioridad === 'media' ? 'warn' : 'secondary'">
              </p-tag>
            }
          </div>

          <h3 class="evento-dialog-titulo">{{ eventoSeleccionado()!.title }}</h3>

          <div class="evento-dialog-detalles">
            <div class="detalle-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatFechaCompleta(eventoSeleccionado()!.start) }}</span>
            </div>

            @if (eventoSeleccionado()!.end) {
              <div class="detalle-item">
                <i class="pi pi-calendar-plus"></i>
                <span>Hasta: {{ formatFechaCompleta(eventoSeleccionado()!.end!) }}</span>
              </div>
            }

            @if (eventoSeleccionado()!.proceso) {
              <div class="detalle-item">
                <i class="pi pi-sitemap"></i>
                <span>{{ eventoSeleccionado()!.proceso }}</span>
              </div>
            }

            @if (eventoSeleccionado()!.responsable) {
              <div class="detalle-item">
                <i class="pi pi-user"></i>
                <span>{{ eventoSeleccionado()!.responsable }}</span>
              </div>
            }

            @if (eventoSeleccionado()!.descripcion) {
              <div class="detalle-descripcion">
                <span>{{ eventoSeleccionado()!.descripcion }}</span>
              </div>
            }
          </div>

          @if (eventoSeleccionado()!.completado !== undefined) {
            <div class="evento-estado">
              @if (eventoSeleccionado()!.completado) {
                <span class="estado-completado">
                  <i class="pi pi-check-circle"></i>
                  Completado
                </span>
              } @else {
                <span class="estado-pendiente">
                  <i class="pi pi-clock"></i>
                  Pendiente
                </span>
              }
            </div>
          }
        </div>

        <ng-template pTemplate="footer">
          <p-button
            label="Cerrar"
            [text]="true"
            severity="secondary"
            (onClick)="showEventoDialog = false">
          </p-button>
          <p-button
            label="Ir al proceso"
            icon="pi pi-external-link"
            (onClick)="navegarAProceso()"
            *ngIf="eventoSeleccionado()!.proceso">
          </p-button>
        </ng-template>
      }
    </p-dialog>
  `,
  styles: [`
    .calendario-widget {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--spacing-3);
    }

    .calendario-widget.compact {
      .calendario-header {
        padding: var(--spacing-2);
      }

      .calendario-titulo {
        font-size: var(--font-size-sm);
      }

      :host ::ng-deep {
        .fc-daygrid-day-number {
          font-size: var(--font-size-xs) !important;
          padding: 2px !important;
        }

        .fc-col-header-cell-cushion {
          font-size: var(--font-size-xs) !important;
          padding: 4px 2px !important;
        }

        .fc-daygrid-day-events {
          min-height: 0 !important;
        }

        .fc-daygrid-event {
          font-size: 9px !important;
          padding: 1px 2px !important;
          margin-bottom: 1px !important;
        }
      }
    }

    .calendario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
    }

    .calendario-nav {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .calendario-titulo {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      min-width: 140px;
      text-align: center;
    }

    .calendario-acciones {
      display: flex;
      gap: var(--spacing-1);
    }

    .calendario-leyenda {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      font-size: var(--font-size-xs);
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--text-color-secondary);
    }

    .leyenda-color {
      width: 10px;
      height: 10px;
      border-radius: var(--border-radius-full);
    }

    .calendario-contenedor {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    // FullCalendar Overrides
    :host ::ng-deep {
      .fc {
        height: 100%;
        font-family: inherit;
      }

      .fc-theme-standard {
        .fc-scrollgrid {
          border: none;
        }

        td, th {
          border-color: var(--surface-200);
        }
      }

      .fc-col-header {
        background: var(--surface-50);
      }

      .fc-col-header-cell-cushion {
        color: var(--text-color-secondary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        text-transform: uppercase;
        padding: var(--spacing-2);
      }

      .fc-daygrid-day-number {
        color: var(--text-color);
        font-size: var(--font-size-sm);
        padding: var(--spacing-2);
      }

      .fc-day-today {
        background: var(--primary-50) !important;

        .fc-daygrid-day-number {
          color: var(--primary-color);
          font-weight: var(--font-weight-bold);
        }
      }

      .fc-day-other .fc-daygrid-day-number {
        color: var(--surface-400);
      }

      .fc-daygrid-event {
        border-radius: var(--border-radius-xs);
        padding: 2px 4px;
        font-size: var(--font-size-xs);
        border: none !important;
        cursor: pointer;
        transition: transform 0.1s;

        &:hover {
          transform: scale(1.02);
        }
      }

      .fc-daygrid-event-dot {
        display: none;
      }

      .fc-event-title {
        font-weight: var(--font-weight-medium);
      }

      .fc-daygrid-more-link {
        color: var(--primary-color);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-medium);
      }

      .fc-toolbar {
        display: none;
      }
    }

    // Resumen de eventos
    .calendario-resumen {
      border-top: 1px solid var(--surface-200);
      padding-top: var(--spacing-3);
      max-height: 200px;
      overflow-y: auto;
    }

    .resumen-titulo {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin: 0 0 var(--spacing-3) 0;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);

      i {
        color: var(--primary-color);
      }
    }

    .resumen-lista {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .resumen-evento {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-2) var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);

      &:hover {
        background: var(--surface-100);
      }
    }

    .evento-fecha {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      padding-left: var(--spacing-2);
      border-left: 3px solid;
      min-width: 50px;
    }

    .evento-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .evento-titulo {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .evento-proceso {
        font-size: var(--font-size-xs);
        color: var(--text-color-secondary);
      }
    }

    .resumen-vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4);
      color: var(--surface-400);
      gap: var(--spacing-2);

      i {
        font-size: var(--font-size-2xl);
      }

      span {
        font-size: var(--font-size-sm);
      }
    }

    // Dialog de evento
    .evento-dialog-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .evento-dialog-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .evento-tipo-badge {
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: white;
      text-transform: uppercase;
    }

    .evento-dialog-titulo {
      margin: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
    }

    .evento-dialog-detalles {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .detalle-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-sm);
      color: var(--text-color);

      i {
        color: var(--text-color-secondary);
        width: 18px;
      }
    }

    .detalle-descripcion {
      padding: var(--spacing-3);
      background: var(--surface-50);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
      line-height: var(--line-height-normal);
    }

    .evento-estado {
      padding: var(--spacing-3);
      border-radius: var(--border-radius-md);
      text-align: center;

      .estado-completado {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        color: var(--emerald-600);
        background: var(--emerald-50);
        padding: var(--spacing-2);
        border-radius: var(--border-radius-md);
      }

      .estado-pendiente {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-2);
        color: var(--amber-600);
        background: var(--amber-50);
        padding: var(--spacing-2);
        border-radius: var(--border-radius-md);
      }
    }
  `]
})
export class CalendarioWidgetComponent implements OnInit {
  @Input() eventos: CalendarioEvento[] = [];
  @Input() modo: 'full' | 'compact' = 'full';
  @Input() mostrarLeyenda = true;
  @Input() mostrarResumen = true;

  @Output() eventoClick = new EventEmitter<CalendarioEvento>();
  @Output() fechaClick = new EventEmitter<Date>();

  fechaActual = signal(new Date());
  vistaActual = signal<'dayGridMonth' | 'timeGridWeek'>('dayGridMonth');
  showEventoDialog = false;
  eventoSeleccionado = signal<CalendarioEvento | null>(null);

  tiposEvento = [
    { value: 'revision', label: 'Revisión' },
    { value: 'auditoria', label: 'Auditoría' },
    { value: 'vencimiento', label: 'Vencimiento' },
    { value: 'capacitacion', label: 'Capacitación' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'otro', label: 'Otro' }
  ];

  coloresTipo: Record<string, string> = {
    revision: '#6366f1',      // indigo
    auditoria: '#ef4444',     // red
    vencimiento: '#f59e0b',   // amber
    capacitacion: '#22c55e',  // green
    reunion: '#3b82f6',       // blue
    otro: '#8b5cf6'           // violet
  };

  tituloMes = computed(() => {
    const fecha = this.fechaActual();
    return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  });

  proximosEventos = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.eventos
      .filter(e => new Date(e.start) >= hoy)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5);
  });

  eventosFullCalendar = computed<EventInput[]>(() => {
    return this.eventos.map(evento => ({
      id: evento.id,
      title: evento.title,
      start: evento.start,
      end: evento.end,
      backgroundColor: this.getColorTipo(evento.tipo),
      borderColor: this.getColorTipo(evento.tipo),
      textColor: '#ffffff',
      extendedProps: {
        tipo: evento.tipo,
        descripcion: evento.descripcion,
        proceso: evento.proceso,
        responsable: evento.responsable,
        prioridad: evento.prioridad,
        completado: evento.completado
      }
    }));
  });

  calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: this.vistaActual(),
    initialDate: this.fechaActual(),
    events: this.eventosFullCalendar(),
    headerToolbar: false,
    locale: 'es',
    firstDay: 1,
    height: '100%',
    dayMaxEvents: this.modo === 'compact' ? 2 : 3,
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    dateClick: (arg: DateClickArg) => this.onDateClick(arg),
    eventDisplay: 'block'
  }));

  ngOnInit(): void {
    // Generar eventos de ejemplo si no hay eventos
    if (this.eventos.length === 0) {
      this.eventos = this.generarEventosEjemplo();
    }
  }

  getColorTipo(tipo: string): string {
    return this.coloresTipo[tipo] || this.coloresTipo['otro'];
  }

  getSeverityTipo(tipo: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    const mapping: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined> = {
      revision: 'info',
      auditoria: 'danger',
      vencimiento: 'warn',
      capacitacion: 'success',
      reunion: 'info',
      otro: 'secondary'
    };
    return mapping[tipo] || 'secondary';
  }

  getLabelTipo(tipo: string): string {
    const tipoObj = this.tiposEvento.find(t => t.value === tipo);
    return tipoObj?.label || 'Otro';
  }

  navegarMes(direccion: number): void {
    const nuevaFecha = new Date(this.fechaActual());
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    this.fechaActual.set(nuevaFecha);
  }

  irAHoy(): void {
    this.fechaActual.set(new Date());
  }

  cambiarVista(): void {
    this.vistaActual.update(v => v === 'dayGridMonth' ? 'timeGridWeek' : 'dayGridMonth');
  }

  onEventClick(arg: EventClickArg): void {
    const evento = this.eventos.find(e => e.id === arg.event.id);
    if (evento) {
      this.seleccionarEvento(evento);
    }
  }

  onDateClick(arg: DateClickArg): void {
    this.fechaClick.emit(arg.date);
  }

  seleccionarEvento(evento: CalendarioEvento): void {
    this.eventoSeleccionado.set(evento);
    this.showEventoDialog = true;
    this.eventoClick.emit(evento);
  }

  navegarAProceso(): void {
    // Aquí se podría navegar al proceso relacionado
    console.log('Navegar al proceso:', this.eventoSeleccionado()?.proceso);
    this.showEventoDialog = false;
  }

  formatFechaCorta(fecha: Date | string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  formatFechaCompleta(fecha: Date | string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private generarEventosEjemplo(): CalendarioEvento[] {
    const hoy = new Date();
    const eventos: CalendarioEvento[] = [];

    // Evento de revisión
    eventos.push({
      id: 'ev1',
      title: 'Revisión Trimestral ISO 27001',
      start: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 3),
      tipo: 'revision',
      descripcion: 'Revisión trimestral de controles de seguridad',
      proceso: 'Gestión de Seguridad',
      responsable: 'Juan Pérez',
      prioridad: 'alta'
    });

    // Evento de auditoría
    eventos.push({
      id: 'ev2',
      title: 'Auditoría Interna',
      start: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7),
      end: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 9),
      tipo: 'auditoria',
      descripcion: 'Auditoría interna de procesos de cumplimiento',
      proceso: 'Cumplimiento Normativo',
      responsable: 'María García',
      prioridad: 'alta'
    });

    // Evento de vencimiento
    eventos.push({
      id: 'ev3',
      title: 'Vencimiento Certificación',
      start: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 14),
      tipo: 'vencimiento',
      descripcion: 'Fecha límite para renovación de certificación',
      proceso: 'Certificaciones',
      prioridad: 'alta'
    });

    // Evento de capacitación
    eventos.push({
      id: 'ev4',
      title: 'Capacitación Seguridad',
      start: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 5),
      tipo: 'capacitacion',
      descripcion: 'Taller de concientización en seguridad',
      proceso: 'Recursos Humanos',
      responsable: 'Carlos López'
    });

    // Evento de reunión
    eventos.push({
      id: 'ev5',
      title: 'Comité de Riesgos',
      start: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1, 10, 0),
      tipo: 'reunion',
      descripcion: 'Reunión mensual del comité de riesgos',
      proceso: 'Gestión de Riesgos',
      prioridad: 'media'
    });

    return eventos;
  }
}
