import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { TextareaModule } from 'primeng/textarea';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

// Services
import { EventosService } from '../../services/eventos.service';

// Models
import {
  Event,
  EventType,
  EventStatus,
  SeverityLevel,
  EVENT_STATUS_OPTIONS,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity,
  formatEventDate,
  formatEventDateTime
} from '../../models/eventos.models';

// Configuraciones
const STATUS_CONFIG: Record<string, { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'; icon: string; color: string }> = {
  [EventStatus.DRAFT]: { label: 'Borrador', severity: 'secondary', icon: 'pi-file', color: '#6b7280' },
  [EventStatus.OPEN]: { label: 'Abierto', severity: 'danger', icon: 'pi-exclamation-circle', color: '#ef4444' },
  [EventStatus.IN_PROGRESS]: { label: 'En Proceso', severity: 'warn', icon: 'pi-clock', color: '#f59e0b' },
  [EventStatus.RESOLVED]: { label: 'Resuelto', severity: 'success', icon: 'pi-check-circle', color: '#22c55e' },
  [EventStatus.CLOSED]: { label: 'Cerrado', severity: 'contrast', icon: 'pi-times-circle', color: '#374151' },
  [EventStatus.CANCELLED]: { label: 'Cancelado', severity: 'secondary', icon: 'pi-ban', color: '#9ca3af' }
};

const SEVERITY_CONFIG: Record<string, { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'; icon: string; color: string }> = {
  [SeverityLevel.CRITICAL]: { label: 'Critico', severity: 'danger', icon: 'pi-exclamation-triangle', color: '#ef4444' },
  [SeverityLevel.HIGH]: { label: 'Alto', severity: 'warn', icon: 'pi-arrow-up', color: '#f97316' },
  [SeverityLevel.MEDIUM]: { label: 'Medio', severity: 'info', icon: 'pi-minus', color: '#eab308' },
  [SeverityLevel.LOW]: { label: 'Bajo', severity: 'success', icon: 'pi-arrow-down', color: '#22c55e' },
  [SeverityLevel.INFORMATIONAL]: { label: 'Informativo', severity: 'secondary', icon: 'pi-info-circle', color: '#6b7280' }
};

@Component({
  selector: 'app-incidente-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    TableModule,
    ConfirmDialogModule,
    AvatarModule,
    TimelineModule,
    TextareaModule,
    MenuModule,
    DialogModule,
    ProgressSpinnerModule,
    ProgressBarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './incidente-detalle.html',
  styleUrl: './incidente-detalle.scss'
})
export class IncidenteDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventosService = inject(EventosService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Estado principal
  incidenteId = signal<string>('');
  loading = signal(true);

  // Navegacion por tabs
  mainTab = signal<'general' | 'impacto' | 'historial'>('general');
  secondaryTab = signal<'info' | 'respuesta' | 'propiedades'>('info');

  // Datos del incidente
  incidente = signal<Event | null>(null);

  // Menu de acciones
  menuItems: MenuItem[] = [];

  // Nuevo comentario
  newComment = signal('');

  // Configuraciones
  statusConfig = STATUS_CONFIG;
  severityConfig = SEVERITY_CONFIG;

  // Computed values
  statusInfo = computed(() => {
    const i = this.incidente();
    return STATUS_CONFIG[i?.eventStatus || EventStatus.OPEN];
  });

  severityInfo = computed(() => {
    const i = this.incidente();
    return SEVERITY_CONFIG[i?.initialSeverity || SeverityLevel.MEDIUM];
  });

  tiempoRespuesta = computed(() => {
    const i = this.incidente();
    if (!i?.initialDate) return 0;
    const start = new Date(i.initialDate);
    const acknowledged = i.acknowledgedAt ? new Date(i.acknowledgedAt) : new Date();
    return Math.floor((acknowledged.getTime() - start.getTime()) / (1000 * 60 * 60));
  });

  tiempoResolucion = computed(() => {
    const i = this.incidente();
    if (!i?.initialDate) return 0;
    const start = new Date(i.initialDate);
    const end = i.resolvedAt ? new Date(i.resolvedAt) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  });

  activosAfectados = computed(() => {
    const i = this.incidente();
    return i?.affectedAssetIds?.length || 0;
  });

  usuariosAfectados = computed(() => {
    const i = this.incidente();
    return i?.affectedUserCount || 0;
  });

  downtimeMinutes = computed(() => {
    const i = this.incidente();
    return i?.downtimeMinutes || 0;
  });

  comentarios = computed(() => this.incidente()?.comments || []);

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.incidenteId.set(params['id']);
        this.loadIncidente();
      }
    });
    this.initMenuItems();
  }

  async loadIncidente() {
    this.loading.set(true);
    await this.eventosService.loadEvents();
    const incidente = await this.eventosService.getEventById(this.incidenteId());

    if (incidente && incidente.eventType === EventType.INCIDENT) {
      this.incidente.set(incidente);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Incidente no encontrado'
      });
      this.router.navigate(['/incidentes']);
    }
    this.loading.set(false);
  }

  private initMenuItems(): void {
    this.menuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.navigateToEdit()
      },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => this.changeStatus(status.value)
        }))
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete()
      }
    ];
  }

  // Navegacion
  goBack() {
    this.router.navigate(['/incidentes']);
  }

  navigateToEdit() {
    this.router.navigate(['/incidentes', this.incidenteId(), 'editar']);
  }

  navigateToActivo(id: string) {
    this.router.navigate(['/activos', id, 'detalle']);
  }

  showMenu(menu: any, event: globalThis.Event) {
    menu.toggle(event);
  }

  // Acciones
  async changeStatus(newStatus: EventStatus) {
    const i = this.incidente();
    if (!i) return;

    const result = await this.eventosService.changeStatus(i.id, newStatus);
    if (result) {
      this.incidente.set(result);
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El incidente ahora esta ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete() {
    const i = this.incidente();
    if (!i) return;

    this.confirmationService.confirm({
      message: `Esta seguro de eliminar el incidente "${i.title}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(i.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Incidente eliminado',
            detail: 'El incidente ha sido eliminado'
          });
          setTimeout(() => this.router.navigate(['/incidentes']), 1000);
        }
      }
    });
  }

  // Comentarios
  async addComment() {
    const i = this.incidente();
    const content = this.newComment().trim();
    if (!i || !content) return;

    const result = await this.eventosService.addComment(i.id, content, 'current-user');
    if (result) {
      const updated = await this.eventosService.getEventById(i.id);
      if (updated) {
        this.incidente.set(updated);
      }
      this.newComment.set('');
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario agregado',
        detail: 'El comentario ha sido agregado'
      });
    }
  }

  // Helpers
  formatDate = formatEventDate;
  formatDateTime = formatEventDateTime;
  getEventStatusLabel = getEventStatusLabel;
  getEventStatusSeverity = getEventStatusSeverity;
  getSeverityLabel = getSeverityLabel;
  getSeveritySeverity = getSeveritySeverity;

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDuration(hours: number): string {
    if (hours < 1) return 'Menos de 1 hora';
    if (hours < 24) return `${hours} horas`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} dias`;
    return `${days}d ${remainingHours}h`;
  }
}
