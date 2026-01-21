import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { EventosService } from '../../services/eventos.service';
import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  EventComment,
  EVENT_STATUS_OPTIONS,
  getEventTypeLabel,
  getEventTypeIcon,
  getEventTypeColor,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity,
  getProbabilityLabel,
  getImpactLabel,
  formatEventDate,
  formatEventDateTime,
  generateCommentId
} from '../../models/eventos.models';

@Component({
  selector: 'app-eventos-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule,
    MenuModule,
    AvatarModule,
    TimelineModule,
    TextareaModule,
    PanelModule,
    TabsModule,
    BadgeModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos-detalle.html',
  styleUrl: './eventos-detalle.scss'
})
export class EventosDetalleComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Estado
  loading = signal(true);
  eventId = signal<string | null>(null);
  activeTab = signal<string>('0');

  // Evento actual
  event = computed(() =>
    this.eventosService.events().find(e => e.id === this.eventId())
  );

  // Subtipo del evento
  eventSubType = computed(() => {
    const evt = this.event();
    if (!evt?.eventSubType?.id) return null;
    return this.subTypesService.eventSubTypes().find(st => st.id === evt.eventSubType?.id);
  });

  // Propiedades agrupadas con valores
  groupedPropertyValues = computed(() => {
    const evt = this.event();
    const subType = this.eventSubType();
    if (!evt || !subType) return [];

    const groups = subType.propertyGroups
      .filter(g => g.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const result: { group: any; properties: { property: any; value: any }[] }[] = [];

    // Propiedades sin grupo
    const ungroupedProps = subType.properties
      .filter(p => p.isActive && !p.propertyGroupId && !p.isHidden)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    if (ungroupedProps.length > 0) {
      result.push({
        group: { id: null, name: 'General' },
        properties: ungroupedProps.map(prop => ({
          property: prop,
          value: evt.propertyValues.find(pv => pv.propertyId === prop.id)?.value
        }))
      });
    }

    groups.forEach(group => {
      const props = subType.properties
        .filter(p => p.isActive && p.propertyGroupId === group.id && !p.isHidden)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      if (props.length > 0) {
        result.push({
          group,
          properties: props.map(prop => ({
            property: prop,
            value: evt.propertyValues.find(pv => pv.propertyId === prop.id)?.value
          }))
        });
      }
    });

    return result;
  });

  // Comentarios del evento
  comments = computed(() => this.event()?.comments ?? []);

  // Nuevo comentario
  newComment = signal('');

  // Context menu
  menuItems: MenuItem[] = [];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/eventos']);
      return;
    }

    this.eventId.set(id);

    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();

    this.loading.set(false);

    if (!this.event()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Evento no encontrado'
      });
      this.router.navigate(['/eventos']);
    }

    this.initMenuItems();
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

  // Navegación
  goBack(): void {
    this.router.navigate(['/eventos']);
  }

  navigateToEdit(): void {
    const evt = this.event();
    if (evt) {
      this.router.navigate(['/eventos', evt.id, 'editar']);
    }
  }

  showMenu(menu: any, event: globalThis.Event): void {
    menu.toggle(event);
  }

  // Acciones
  async changeStatus(newStatus: EventStatus): Promise<void> {
    const evt = this.event();
    if (!evt) return;

    const result = await this.eventosService.changeStatus(evt.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El evento ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(): void {
    const evt = this.event();
    if (!evt) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el evento "${evt.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(evt.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Evento eliminado',
            detail: `El evento ha sido eliminado`
          });
          setTimeout(() => this.router.navigate(['/eventos']), 1000);
        }
      }
    });
  }

  // Comentarios
  async addComment(): Promise<void> {
    const evt = this.event();
    const content = this.newComment().trim();
    if (!evt || !content) return;

    const result = await this.eventosService.addComment(evt.id, content, 'current-user');
    if (result) {
      this.newComment.set('');
      this.messageService.add({
        severity: 'success',
        summary: 'Comentario agregado',
        detail: 'El comentario ha sido agregado al evento'
      });
    }
  }

  // Helpers
  getEventTypeLabel = getEventTypeLabel;
  getEventTypeIcon = getEventTypeIcon;
  getEventTypeColor = getEventTypeColor;
  getEventStatusLabel = getEventStatusLabel;
  getEventStatusSeverity = getEventStatusSeverity;
  getSeverityLabel = getSeverityLabel;
  getSeveritySeverity = getSeveritySeverity;
  getProbabilityLabel = getProbabilityLabel;
  getImpactLabel = getImpactLabel;
  formatDate = formatEventDate;
  formatDateTime = formatEventDateTime;

  formatPropertyValue(value: any, dataType: string): string {
    if (value === null || value === undefined) return '-';

    switch (dataType) {
      case 'BOOLEAN':
        return value ? 'Sí' : 'No';
      case 'DATE':
        return formatEventDate(value);
      case 'MULTISELECT':
        return Array.isArray(value) ? value.join(', ') : String(value);
      case 'JSON':
        return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      default:
        return String(value);
    }
  }

  isRisk(): boolean {
    return this.event()?.eventType === EventType.RISK;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
