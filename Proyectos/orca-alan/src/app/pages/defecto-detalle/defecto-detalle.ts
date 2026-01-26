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

// Configuraciones de estado y severidad
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
  selector: 'app-defecto-detalle',
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
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './defecto-detalle.html',
  styleUrl: './defecto-detalle.scss'
})
export class DefectoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventosService = inject(EventosService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Estado principal
  defectoId = signal<string>('');
  loading = signal(true);

  // Navegacion por tabs
  mainTab = signal<'general' | 'activos' | 'historial'>('general');
  secondaryTab = signal<'info' | 'solucion' | 'propiedades'>('info');

  // Datos del defecto
  defecto = signal<Event | null>(null);

  // Menu de acciones
  menuItems: MenuItem[] = [];

  // Nuevo comentario
  newComment = signal('');

  // Configuraciones
  statusConfig = STATUS_CONFIG;
  severityConfig = SEVERITY_CONFIG;

  // Computed values
  statusInfo = computed(() => {
    const d = this.defecto();
    return STATUS_CONFIG[d?.eventStatus || EventStatus.OPEN];
  });

  severityInfo = computed(() => {
    const d = this.defecto();
    return SEVERITY_CONFIG[d?.initialSeverity || SeverityLevel.MEDIUM];
  });

  diasAbierto = computed(() => {
    const d = this.defecto();
    if (!d?.initialDate) return 0;
    const start = new Date(d.initialDate);
    const end = d.resolvedAt ? new Date(d.resolvedAt) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  });

  activosAfectados = computed(() => {
    const d = this.defecto();
    return d?.affectedAssetIds?.length || 0;
  });

  procesosImpactados = computed(() => {
    const d = this.defecto();
    return d?.impactedProcessIds?.length || 0;
  });

  comentarios = computed(() => this.defecto()?.comments || []);

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.defectoId.set(params['id']);
        this.loadDefecto();
      }
    });
    this.initMenuItems();
  }

  async loadDefecto() {
    this.loading.set(true);
    await this.eventosService.loadEvents();
    const defecto = await this.eventosService.getEventById(this.defectoId());

    if (defecto && defecto.eventType === EventType.DEFECT) {
      this.defecto.set(defecto);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Defecto no encontrado'
      });
      this.router.navigate(['/defectos']);
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
    this.router.navigate(['/defectos']);
  }

  navigateToEdit() {
    this.router.navigate(['/defectos', this.defectoId(), 'editar']);
  }

  navigateToActivo(id: string) {
    this.router.navigate(['/activos', id, 'detalle']);
  }

  navigateToProceso(id: string) {
    this.router.navigate(['/procesos', id, 'detalle']);
  }

  showMenu(menu: any, event: globalThis.Event) {
    menu.toggle(event);
  }

  // Acciones
  async changeStatus(newStatus: EventStatus) {
    const d = this.defecto();
    if (!d) return;

    const result = await this.eventosService.changeStatus(d.id, newStatus);
    if (result) {
      this.defecto.set(result);
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El defecto ahora esta ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete() {
    const d = this.defecto();
    if (!d) return;

    this.confirmationService.confirm({
      message: `Esta seguro de eliminar el defecto "${d.title}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(d.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Defecto eliminado',
            detail: 'El defecto ha sido eliminado'
          });
          setTimeout(() => this.router.navigate(['/defectos']), 1000);
        }
      }
    });
  }

  // Comentarios
  async addComment() {
    const d = this.defecto();
    const content = this.newComment().trim();
    if (!d || !content) return;

    const result = await this.eventosService.addComment(d.id, content, 'current-user');
    if (result) {
      // Recargar el defecto para obtener el comentario actualizado
      const updated = await this.eventosService.getEventById(d.id);
      if (updated) {
        this.defecto.set(updated);
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
}
