import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { TabsModule } from 'primeng/tabs';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { EventosService } from '../../services/eventos.service';
import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  EVENT_TYPES,
  EVENT_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  getEventTypeLabel,
  getEventTypeIcon,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity
} from '../../models/eventos.models';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    BadgeModule,
    TabsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './eventos.html',
  styleUrl: './eventos.scss'
})
export class EventosComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Tab activo (0=Riesgos, 1=Incidentes, 2=Defectos)
  activeTab = signal<string>('0');

  // Búsqueda por texto
  searchText = signal('');

  // Tipo de evento actual basado en tab
  currentEventType = computed(() => {
    switch (this.activeTab()) {
      case '0': return EventType.RISK;
      case '1': return EventType.INCIDENT;
      case '2': return EventType.DEFECT;
      default: return EventType.RISK;
    }
  });

  // Eventos filtrados por tipo actual y texto de búsqueda
  filteredEvents = computed(() => {
    const events = this.eventosService.events().filter(e => e.eventType === this.currentEventType());
    const search = this.searchText().toLowerCase().trim();

    if (!search) return events;

    return events.filter(e =>
      e.title.toLowerCase().includes(search) ||
      e.description.toLowerCase().includes(search) ||
      e.eventSubType?.name.toLowerCase().includes(search)
    );
  });

  // Subtipos del tipo actual
  currentSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === this.currentEventType() && st.isActive
    )
  );

  // Stats del tipo actual
  currentStats = computed(() =>
    this.eventosService.getStatsByType(this.currentEventType())
  );

  // Opciones para filtros
  eventTypeOptions = EVENT_TYPES;
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;

  // Context menu
  menuItems: MenuItem[] = [];
  selectedEvent: Event | null = null;

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    // Navegar a la página de creación específica según el tipo de evento
    switch (this.currentEventType()) {
      case EventType.RISK:
        this.router.navigate(['/riesgos/crear']);
        break;
      case EventType.INCIDENT:
        this.router.navigate(['/incidentes/crear']);
        break;
      case EventType.DEFECT:
        this.router.navigate(['/defectos/crear']);
        break;
      default:
        this.router.navigate(['/eventos/crear'], {
          queryParams: { type: this.currentEventType() }
        });
    }
  }

  navigateToDetail(event: Event): void {
    switch (event.eventType) {
      case EventType.RISK:
        this.router.navigate(['/riesgos', event.id]);
        break;
      case EventType.INCIDENT:
        this.router.navigate(['/incidentes', event.id]);
        break;
      case EventType.DEFECT:
        this.router.navigate(['/defectos', event.id]);
        break;
      default:
        this.router.navigate(['/eventos', event.id]);
    }
  }

  navigateToEdit(event: Event): void {
    // Navegar a la página de edición específica según el tipo de evento
    switch (event.eventType) {
      case EventType.RISK:
        this.router.navigate(['/riesgos', event.id, 'editar']);
        break;
      case EventType.INCIDENT:
        this.router.navigate(['/incidentes', event.id, 'editar']);
        break;
      case EventType.DEFECT:
        this.router.navigate(['/defectos', event.id, 'editar']);
        break;
      default:
        this.router.navigate(['/eventos', event.id, 'editar']);
    }
  }

  onRowClick(event: Event): void {
    this.navigateToDetail(event);
  }

  // ============ Acciones ============

  async changeStatus(event: Event, newStatus: EventStatus): Promise<void> {
    const result = await this.eventosService.changeStatus(event.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El evento "${event.title}" ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(event: Event, clickEvent: globalThis.Event): void {
    clickEvent.stopPropagation();
    this.confirmationService.confirm({
      target: clickEvent.target as EventTarget,
      message: `¿Está seguro de eliminar el evento "${event.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(event.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Evento eliminado',
            detail: `El evento "${event.title}" ha sido eliminado`
          });
        }
      }
    });
  }

  showMenu(event: Event, menu: any, clickEvent: globalThis.Event): void {
    clickEvent.stopPropagation();
    this.selectedEvent = event;
    this.menuItems = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => {
          if (this.selectedEvent) {
            this.navigateToDetail(this.selectedEvent);
          }
        }
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => {
          if (this.selectedEvent) {
            this.navigateToEdit(this.selectedEvent);
          }
        }
      },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => {
            if (this.selectedEvent) {
              this.changeStatus(this.selectedEvent, status.value);
            }
          }
        }))
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => {
          if (this.selectedEvent) {
            this.confirmDelete(this.selectedEvent, clickEvent);
          }
        }
      }
    ];
    menu.toggle(clickEvent);
  }

  // ============ Helpers ============

  getEventTypeLabel = getEventTypeLabel;
  getEventTypeIcon = getEventTypeIcon;
  getEventStatusLabel = getEventStatusLabel;
  getEventStatusSeverity = getEventStatusSeverity;
  getSeverityLabel = getSeverityLabel;
  getSeveritySeverity = getSeveritySeverity;

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case '0': return 'pi pi-exclamation-triangle';
      case '1': return 'pi pi-bolt';
      case '2': return 'pi pi-bug';
      default: return 'pi pi-list';
    }
  }

  getTabLabel(tab: string): string {
    switch (tab) {
      case '0': return 'Riesgos';
      case '1': return 'Incidentes';
      case '2': return 'Defectos';
      default: return 'Eventos';
    }
  }

  getTabCount(tab: string): number {
    switch (tab) {
      case '0': return this.eventosService.risks().length;
      case '1': return this.eventosService.incidents().length;
      case '2': return this.eventosService.defects().length;
      default: return 0;
    }
  }

  onTabChange(value: string | number | undefined): void {
    this.activeTab.set(String(value ?? '0'));
  }
}
