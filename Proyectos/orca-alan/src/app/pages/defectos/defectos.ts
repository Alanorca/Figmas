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
  selector: 'app-defectos',
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
  templateUrl: './defectos.html',
  styleUrl: './defectos.scss'
})
export class DefectosComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Diálogo de nuevo defecto
  showDialog = signal(false);

  // Selección múltiple
  defectosSeleccionados = signal<Event[]>([]);

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Edición in-place
  defectoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Nuevo defecto
  nuevoDefecto = signal({
    title: '',
    description: '',
    initialSeverity: SeverityLevel.MEDIUM,
    eventStatus: EventStatus.OPEN,
    eventSubTypeId: null as string | null
  });

  // Defectos
  defectos = computed(() => this.eventosService.defects());

  // Subtipos de defecto disponibles
  defectSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === EventType.DEFECT && st.isActive
    )
  );

  // KPIs
  defectosCriticos = computed(() =>
    this.defectos().filter(d => d.initialSeverity === SeverityLevel.CRITICAL).length
  );

  defectosAltos = computed(() =>
    this.defectos().filter(d => d.initialSeverity === SeverityLevel.HIGH).length
  );

  defectosAbiertos = computed(() =>
    this.defectos().filter(d =>
      d.eventStatus === EventStatus.OPEN ||
      d.eventStatus === EventStatus.IN_PROGRESS
    ).length
  );

  defectosResueltos = computed(() =>
    this.defectos().filter(d =>
      d.eventStatus === EventStatus.RESOLVED ||
      d.eventStatus === EventStatus.CLOSED
    ).length
  );

  // Opciones
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;

  subTypeOptions = computed(() =>
    this.defectSubTypes().map(st => ({ label: st.name, value: st.id }))
  );

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    this.router.navigate(['/defectos/crear']);
  }

  navigateToDetail(defect: Event): void {
    this.router.navigate(['/defectos', defect.id]);
  }

  navigateToEdit(defect: Event): void {
    this.router.navigate(['/defectos', defect.id, 'editar']);
  }

  // ============ Diálogo Nuevo Defecto ============

  openNewDialog(): void {
    const defaultSubType = this.defectSubTypes().find(st => st.isDefault);
    this.nuevoDefecto.set({
      title: '',
      description: '',
      initialSeverity: SeverityLevel.MEDIUM,
      eventStatus: EventStatus.OPEN,
      eventSubTypeId: defaultSubType?.id ?? null
    });
    this.showDialog.set(true);
  }

  async saveDefecto(): Promise<void> {
    const defecto = this.nuevoDefecto();
    if (!defecto.title.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El título es requerido'
      });
      return;
    }

    const request: CreateEventRequest = {
      title: defecto.title,
      description: defecto.description,
      eventType: EventType.DEFECT,
      eventSubTypeId: defecto.eventSubTypeId ?? undefined,
      eventStatus: defecto.eventStatus,
      initialSeverity: defecto.initialSeverity,
      initialDate: new Date().toISOString()
    };

    const result = await this.eventosService.createEvent(request);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Defecto creado',
        detail: `El defecto "${defecto.title}" ha sido creado`
      });
      this.showDialog.set(false);
    }
  }

  // ============ Acciones ============

  async changeStatus(defect: Event, newStatus: EventStatus): Promise<void> {
    const result = await this.eventosService.changeStatus(defect.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El defecto "${defect.title}" ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(defect: Event): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el defecto "${defect.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(defect.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Defecto eliminado',
            detail: `El defecto "${defect.title}" ha sido eliminado`
          });
        }
      }
    });
  }

  getMenuItemsDefecto(defecto: Event): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.navigateToDetail(defecto) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.navigateToEdit(defecto) },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => this.changeStatus(defecto, status.value)
        }))
      },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.confirmDelete(defecto) }
    ];
  }

  // ============ Edición In-Place ============

  iniciarEdicion(defecto: Event, event: globalThis.Event): void {
    event.stopPropagation();
    this.defectoEditando.set(defecto.id);
    this.valoresEdicion.set({
      title: defecto.title,
      description: defecto.description,
      initialSeverity: defecto.initialSeverity,
      eventStatus: defecto.eventStatus
    });
  }

  estaEditando(defectoId: string): boolean {
    return this.defectoEditando() === defectoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  async guardarEdicion(defecto: Event, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const valores = this.valoresEdicion();

    await this.eventosService.updateEvent(defecto.id, {
      title: valores['title'],
      description: valores['description'],
      eventStatus: valores['eventStatus'],
      initialSeverity: valores['initialSeverity']
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Defecto actualizado',
      detail: `El defecto ha sido actualizado`
    });

    this.defectoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: globalThis.Event): void {
    event.stopPropagation();
    this.defectoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // ============ Selección Masiva ============

  onSelectionChange(defectos: Event[]): void {
    this.defectosSeleccionados.set(defectos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.defectosSeleccionados());
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

  // ============ Actualizacion de nuevoDefecto ============

  updateNuevoDefectoField(field: string, value: any): void {
    this.nuevoDefecto.update(d => ({ ...d, [field]: value }));
  }
}
