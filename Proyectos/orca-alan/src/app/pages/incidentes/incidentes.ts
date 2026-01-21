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
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { EventosService } from '../../services/eventos.service';
import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  SeverityLevel,
  CreateEventRequest,
  EVENT_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity
} from '../../models/eventos.models';

@Component({
  selector: 'app-incidentes',
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
    BadgeModule,
    DialogModule,
    TextareaModule,
    DrawerModule,
    CheckboxModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './incidentes.html',
  styleUrl: './incidentes.scss'
})
export class IncidentesComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Diálogo de nuevo incidente
  showDialog = signal(false);

  // Selección múltiple
  incidentesSeleccionados = signal<Event[]>([]);

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Edición in-place
  incidenteEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Nuevo incidente
  nuevoIncidente = signal({
    title: '',
    description: '',
    initialSeverity: SeverityLevel.MEDIUM,
    eventStatus: EventStatus.OPEN,
    eventSubTypeId: null as string | null
  });

  // Incidentes
  incidentes = computed(() => this.eventosService.incidents());

  // Subtipos de incidente disponibles
  incidentSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === EventType.INCIDENT && st.isActive
    )
  );

  // KPIs
  incidentesCriticos = computed(() =>
    this.incidentes().filter(i => i.initialSeverity === SeverityLevel.CRITICAL).length
  );

  incidentesAltos = computed(() =>
    this.incidentes().filter(i => i.initialSeverity === SeverityLevel.HIGH).length
  );

  incidentesAbiertos = computed(() =>
    this.incidentes().filter(i =>
      i.eventStatus === EventStatus.OPEN ||
      i.eventStatus === EventStatus.IN_PROGRESS
    ).length
  );

  incidentesResueltos = computed(() =>
    this.incidentes().filter(i =>
      i.eventStatus === EventStatus.RESOLVED ||
      i.eventStatus === EventStatus.CLOSED
    ).length
  );

  // Opciones
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;

  subTypeOptions = computed(() =>
    this.incidentSubTypes().map(st => ({ label: st.name, value: st.id }))
  );

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    this.router.navigate(['/incidentes/crear']);
  }

  navigateToDetail(incident: Event): void {
    this.router.navigate(['/incidentes', incident.id]);
  }

  navigateToEdit(incident: Event): void {
    this.router.navigate(['/incidentes', incident.id, 'editar']);
  }

  // ============ Diálogo Nuevo Incidente ============

  openNewDialog(): void {
    const defaultSubType = this.incidentSubTypes().find(st => st.isDefault);
    this.nuevoIncidente.set({
      title: '',
      description: '',
      initialSeverity: SeverityLevel.MEDIUM,
      eventStatus: EventStatus.OPEN,
      eventSubTypeId: defaultSubType?.id ?? null
    });
    this.showDialog.set(true);
  }

  async saveIncidente(): Promise<void> {
    const incidente = this.nuevoIncidente();
    if (!incidente.title.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El título es requerido'
      });
      return;
    }

    const request: CreateEventRequest = {
      title: incidente.title,
      description: incidente.description,
      eventType: EventType.INCIDENT,
      eventSubTypeId: incidente.eventSubTypeId ?? undefined,
      eventStatus: incidente.eventStatus,
      initialSeverity: incidente.initialSeverity,
      initialDate: new Date().toISOString()
    };

    const result = await this.eventosService.createEvent(request);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Incidente creado',
        detail: `El incidente "${incidente.title}" ha sido creado`
      });
      this.showDialog.set(false);
    }
  }

  // ============ Acciones ============

  async changeStatus(incident: Event, newStatus: EventStatus): Promise<void> {
    const result = await this.eventosService.changeStatus(incident.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El incidente "${incident.title}" ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(incident: Event): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el incidente "${incident.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(incident.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Incidente eliminado',
            detail: `El incidente "${incident.title}" ha sido eliminado`
          });
        }
      }
    });
  }

  getMenuItemsIncidente(incidente: Event): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.navigateToDetail(incidente) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.navigateToEdit(incidente) },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => this.changeStatus(incidente, status.value)
        }))
      },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.confirmDelete(incidente) }
    ];
  }

  // ============ Edición In-Place ============

  iniciarEdicion(incidente: Event, event: globalThis.Event): void {
    event.stopPropagation();
    this.incidenteEditando.set(incidente.id);
    this.valoresEdicion.set({
      title: incidente.title,
      description: incidente.description,
      initialSeverity: incidente.initialSeverity,
      eventStatus: incidente.eventStatus
    });
  }

  estaEditando(incidenteId: string): boolean {
    return this.incidenteEditando() === incidenteId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  async guardarEdicion(incidente: Event, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const valores = this.valoresEdicion();

    await this.eventosService.updateEvent(incidente.id, {
      title: valores['title'],
      description: valores['description'],
      eventStatus: valores['eventStatus'],
      initialSeverity: valores['initialSeverity']
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Incidente actualizado',
      detail: `El incidente ha sido actualizado`
    });

    this.incidenteEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: globalThis.Event): void {
    event.stopPropagation();
    this.incidenteEditando.set(null);
    this.valoresEdicion.set({});
  }

  // ============ Selección Masiva ============

  onSelectionChange(incidentes: Event[]): void {
    this.incidentesSeleccionados.set(incidentes);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.incidentesSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }

  // ============ Helpers ============

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
}
