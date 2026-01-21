import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SliderModule } from 'primeng/slider';
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
  ProbabilityLevel,
  ImpactLevel,
  CreateEventRequest,
  EVENT_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  PROBABILITY_OPTIONS,
  IMPACT_OPTIONS,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity,
  getProbabilityLabel,
  getImpactLabel,
  calculateRiskLevel
} from '../../models/eventos.models';

@Component({
  selector: 'app-riesgos',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
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
    DialogModule,
    TextareaModule,
    SliderModule,
    DrawerModule,
    CheckboxModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './riesgos.html',
  styleUrl: './riesgos.scss'
})
export class RiesgosComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Diálogo de nuevo riesgo
  showDialog = signal(false);

  // Selección múltiple
  riesgosSeleccionados = signal<Event[]>([]);

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Edición in-place
  riesgoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Nuevo riesgo
  nuevoRiesgo = signal({
    title: '',
    description: '',
    probabilityLevel: ProbabilityLevel.MEDIUM,
    impactLevel: ImpactLevel.MODERATE,
    eventStatus: EventStatus.OPEN,
    eventSubTypeId: null as string | null
  });

  // Riesgos
  riesgos = computed(() => this.eventosService.risks());

  // Subtipos de riesgo disponibles
  riskSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === EventType.RISK && st.isActive
    )
  );

  // KPIs
  riesgosCriticos = computed(() =>
    this.riesgos().filter(r => r.initialSeverity === SeverityLevel.CRITICAL).length
  );

  riesgosAltos = computed(() =>
    this.riesgos().filter(r => r.initialSeverity === SeverityLevel.HIGH).length
  );

  riesgosControlados = computed(() =>
    this.riesgos().filter(r =>
      r.eventStatus === EventStatus.RESOLVED ||
      r.eventStatus === EventStatus.CLOSED
    ).length
  );

  // Opciones
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;
  probabilityOptions = PROBABILITY_OPTIONS;
  impactOptions = IMPACT_OPTIONS;

  subTypeOptions = computed(() =>
    this.riskSubTypes().map(st => ({ label: st.name, value: st.id }))
  );

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    this.router.navigate(['/riesgos/crear']);
  }

  navigateToDetail(risk: Event): void {
    this.router.navigate(['/riesgos', risk.id]);
  }

  navigateToEdit(risk: Event): void {
    this.router.navigate(['/riesgos', risk.id, 'editar']);
  }

  // ============ Diálogo Nuevo Riesgo ============

  openNewDialog(): void {
    const defaultSubType = this.riskSubTypes().find(st => st.isDefault);
    this.nuevoRiesgo.set({
      title: '',
      description: '',
      probabilityLevel: ProbabilityLevel.MEDIUM,
      impactLevel: ImpactLevel.MODERATE,
      eventStatus: EventStatus.OPEN,
      eventSubTypeId: defaultSubType?.id ?? null
    });
    this.showDialog.set(true);
  }

  async saveRiesgo(): Promise<void> {
    const riesgo = this.nuevoRiesgo();
    if (!riesgo.title.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El título es requerido'
      });
      return;
    }

    const calculatedSeverity = calculateRiskLevel(riesgo.probabilityLevel, riesgo.impactLevel);

    const request: CreateEventRequest = {
      title: riesgo.title,
      description: riesgo.description,
      eventType: EventType.RISK,
      eventSubTypeId: riesgo.eventSubTypeId ?? undefined,
      eventStatus: riesgo.eventStatus,
      initialSeverity: calculatedSeverity,
      probabilityLevel: riesgo.probabilityLevel,
      impactLevel: riesgo.impactLevel,
      initialDate: new Date().toISOString()
    };

    const result = await this.eventosService.createEvent(request);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Riesgo creado',
        detail: `El riesgo "${riesgo.title}" ha sido creado`
      });
      this.showDialog.set(false);
    }
  }

  // ============ Nivel de Riesgo ============

  getNivelRiesgo(probability: ProbabilityLevel | undefined, impact: ImpactLevel | undefined): number {
    if (!probability || !impact) return 0;

    const probWeight: Record<ProbabilityLevel, number> = {
      [ProbabilityLevel.VERY_HIGH]: 5,
      [ProbabilityLevel.HIGH]: 4,
      [ProbabilityLevel.MEDIUM]: 3,
      [ProbabilityLevel.LOW]: 2,
      [ProbabilityLevel.VERY_LOW]: 1
    };

    const impactWeight: Record<ImpactLevel, number> = {
      [ImpactLevel.CATASTROPHIC]: 5,
      [ImpactLevel.MAJOR]: 4,
      [ImpactLevel.MODERATE]: 3,
      [ImpactLevel.MINOR]: 2,
      [ImpactLevel.NEGLIGIBLE]: 1
    };

    return probWeight[probability] * impactWeight[impact];
  }

  getNivelSeverity(nivel: number): 'danger' | 'warn' | 'success' | 'info' {
    if (nivel >= 15) return 'danger';
    if (nivel >= 10) return 'warn';
    if (nivel >= 5) return 'info';
    return 'success';
  }

  getNivelLabel(nivel: number): string {
    if (nivel >= 15) return 'Crítico';
    if (nivel >= 10) return 'Alto';
    if (nivel >= 5) return 'Medio';
    return 'Bajo';
  }

  getPromedioNivel(): number {
    const risks = this.riesgos();
    if (risks.length === 0) return 0;
    const suma = risks.reduce((total, r) =>
      total + this.getNivelRiesgo(r.probabilityLevel, r.impactLevel), 0);
    return suma / risks.length;
  }

  // ============ Acciones ============

  async changeStatus(risk: Event, newStatus: EventStatus): Promise<void> {
    const result = await this.eventosService.changeStatus(risk.id, newStatus);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El riesgo "${risk.title}" ahora está ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete(risk: Event): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el riesgo "${risk.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(risk.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Riesgo eliminado',
            detail: `El riesgo "${risk.title}" ha sido eliminado`
          });
        }
      }
    });
  }

  getMenuItemsRiesgo(riesgo: Event): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.navigateToDetail(riesgo) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.navigateToEdit(riesgo) },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: EVENT_STATUS_OPTIONS.map(status => ({
          label: status.label,
          command: () => this.changeStatus(riesgo, status.value)
        }))
      },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.confirmDelete(riesgo) }
    ];
  }

  // ============ Edición In-Place ============

  iniciarEdicion(riesgo: Event, event: globalThis.Event): void {
    event.stopPropagation();
    this.riesgoEditando.set(riesgo.id);
    this.valoresEdicion.set({
      title: riesgo.title,
      description: riesgo.description,
      probabilityLevel: riesgo.probabilityLevel,
      impactLevel: riesgo.impactLevel,
      eventStatus: riesgo.eventStatus
    });
  }

  estaEditando(riesgoId: string): boolean {
    return this.riesgoEditando() === riesgoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  async guardarEdicion(riesgo: Event, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const valores = this.valoresEdicion();

    const calculatedSeverity = calculateRiskLevel(
      valores['probabilityLevel'],
      valores['impactLevel']
    );

    await this.eventosService.updateEvent(riesgo.id, {
      title: valores['title'],
      description: valores['description'],
      eventStatus: valores['eventStatus'],
      probabilityLevel: valores['probabilityLevel'],
      impactLevel: valores['impactLevel'],
      initialSeverity: calculatedSeverity
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Riesgo actualizado',
      detail: `El riesgo ha sido actualizado`
    });

    this.riesgoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: globalThis.Event): void {
    event.stopPropagation();
    this.riesgoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // ============ Selección Masiva ============

  onSelectionChange(riesgos: Event[]): void {
    this.riesgosSeleccionados.set(riesgos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.riesgosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }

  // ============ Helpers ============

  getEventStatusLabel = getEventStatusLabel;
  getEventStatusSeverity = getEventStatusSeverity;
  getSeverityLabel = getSeverityLabel;
  getSeveritySeverity = getSeveritySeverity;
  getProbabilityLabel = getProbabilityLabel;
  getImpactLabel = getImpactLabel;

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getProbabilityValue(level: ProbabilityLevel | undefined): number {
    if (!level) return 0;
    const values: Record<ProbabilityLevel, number> = {
      [ProbabilityLevel.VERY_HIGH]: 5,
      [ProbabilityLevel.HIGH]: 4,
      [ProbabilityLevel.MEDIUM]: 3,
      [ProbabilityLevel.LOW]: 2,
      [ProbabilityLevel.VERY_LOW]: 1
    };
    return values[level];
  }

  getImpactValue(level: ImpactLevel | undefined): number {
    if (!level) return 0;
    const values: Record<ImpactLevel, number> = {
      [ImpactLevel.CATASTROPHIC]: 5,
      [ImpactLevel.MAJOR]: 4,
      [ImpactLevel.MODERATE]: 3,
      [ImpactLevel.MINOR]: 2,
      [ImpactLevel.NEGLIGIBLE]: 1
    };
    return values[level];
  }
}
