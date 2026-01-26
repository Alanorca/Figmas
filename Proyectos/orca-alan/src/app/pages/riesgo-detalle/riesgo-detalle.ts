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
import { KnobModule } from 'primeng/knob';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

// Services
import { EventosService } from '../../services/eventos.service';

// Models
import {
  Event,
  EventType,
  EventStatus,
  SeverityLevel,
  ProbabilityLevel,
  ImpactLevel,
  EVENT_STATUS_OPTIONS,
  getEventStatusLabel,
  getEventStatusSeverity,
  getSeverityLabel,
  getSeveritySeverity,
  getProbabilityLabel,
  getImpactLabel,
  formatEventDate,
  formatEventDateTime,
  calculateRiskLevel
} from '../../models/eventos.models';

// Configuraciones
const STATUS_CONFIG: Record<string, { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'; icon: string; color: string }> = {
  [EventStatus.DRAFT]: { label: 'Borrador', severity: 'secondary', icon: 'pi-file', color: '#6b7280' },
  [EventStatus.OPEN]: { label: 'Identificado', severity: 'info', icon: 'pi-search', color: '#3b82f6' },
  [EventStatus.IN_PROGRESS]: { label: 'En Evaluacion', severity: 'warn', icon: 'pi-clock', color: '#f59e0b' },
  [EventStatus.RESOLVED]: { label: 'Mitigado', severity: 'success', icon: 'pi-shield', color: '#22c55e' },
  [EventStatus.CLOSED]: { label: 'Aceptado', severity: 'contrast', icon: 'pi-check', color: '#374151' },
  [EventStatus.CANCELLED]: { label: 'Descartado', severity: 'secondary', icon: 'pi-ban', color: '#9ca3af' }
};

const SEVERITY_CONFIG: Record<string, { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'; color: string; score: number }> = {
  [SeverityLevel.CRITICAL]: { label: 'Critico', severity: 'danger', color: '#ef4444', score: 5 },
  [SeverityLevel.HIGH]: { label: 'Alto', severity: 'warn', color: '#f97316', score: 4 },
  [SeverityLevel.MEDIUM]: { label: 'Medio', severity: 'info', color: '#eab308', score: 3 },
  [SeverityLevel.LOW]: { label: 'Bajo', severity: 'success', color: '#22c55e', score: 2 },
  [SeverityLevel.INFORMATIONAL]: { label: 'Informativo', severity: 'secondary', color: '#6b7280', score: 1 }
};

const PROBABILITY_SCORES: Record<ProbabilityLevel, number> = {
  [ProbabilityLevel.VERY_HIGH]: 5,
  [ProbabilityLevel.HIGH]: 4,
  [ProbabilityLevel.MEDIUM]: 3,
  [ProbabilityLevel.LOW]: 2,
  [ProbabilityLevel.VERY_LOW]: 1
};

const IMPACT_SCORES: Record<ImpactLevel, number> = {
  [ImpactLevel.CATASTROPHIC]: 5,
  [ImpactLevel.MAJOR]: 4,
  [ImpactLevel.MODERATE]: 3,
  [ImpactLevel.MINOR]: 2,
  [ImpactLevel.NEGLIGIBLE]: 1
};

@Component({
  selector: 'app-riesgo-detalle',
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
    ProgressBarModule,
    KnobModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './riesgo-detalle.html',
  styleUrl: './riesgo-detalle.scss'
})
export class RiesgoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventosService = inject(EventosService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Estado principal
  riesgoId = signal<string>('');
  loading = signal(true);

  // Navegacion por tabs
  mainTab = signal<'general' | 'controles' | 'costos' | 'historial'>('general');
  secondaryTab = signal<'info' | 'analisis' | 'propiedades'>('info');

  // Datos del riesgo
  riesgo = signal<Event | null>(null);

  // Menu de acciones
  menuItems: MenuItem[] = [];

  // Nuevo comentario
  newComment = signal('');

  // Configuraciones
  statusConfig = STATUS_CONFIG;
  severityConfig = SEVERITY_CONFIG;

  // Computed values
  statusInfo = computed(() => {
    const r = this.riesgo();
    return STATUS_CONFIG[r?.eventStatus || EventStatus.OPEN];
  });

  severityInfo = computed(() => {
    const r = this.riesgo();
    return SEVERITY_CONFIG[r?.initialSeverity || SeverityLevel.MEDIUM];
  });

  // Scores de riesgo
  probabilityScore = computed(() => {
    const r = this.riesgo();
    if (!r?.probabilityLevel) return 3;
    return PROBABILITY_SCORES[r.probabilityLevel] || 3;
  });

  impactScore = computed(() => {
    const r = this.riesgo();
    if (!r?.impactLevel) return 3;
    return IMPACT_SCORES[r.impactLevel] || 3;
  });

  riesgoInherente = computed(() => {
    return this.probabilityScore() * this.impactScore();
  });

  riesgoResidual = computed(() => {
    // Simulamos una reduccion del 40% por controles
    const controles = this.riesgo()?.linkedControlIds?.length || 0;
    const reduccion = Math.min(0.6, controles * 0.15);
    return Math.max(1, Math.round(this.riesgoInherente() * (1 - reduccion)));
  });

  reduccionPorcentaje = computed(() => {
    const inherente = this.riesgoInherente();
    const residual = this.riesgoResidual();
    if (inherente === 0) return 0;
    return Math.round(((inherente - residual) / inherente) * 100);
  });

  nivelRiesgoInherente = computed(() => {
    const score = this.riesgoInherente();
    if (score >= 20) return { label: 'Critico', color: '#ef4444' };
    if (score >= 12) return { label: 'Alto', color: '#f97316' };
    if (score >= 6) return { label: 'Medio', color: '#eab308' };
    if (score >= 3) return { label: 'Bajo', color: '#22c55e' };
    return { label: 'Muy Bajo', color: '#6b7280' };
  });

  nivelRiesgoResidual = computed(() => {
    const score = this.riesgoResidual();
    if (score >= 20) return { label: 'Critico', color: '#ef4444' };
    if (score >= 12) return { label: 'Alto', color: '#f97316' };
    if (score >= 6) return { label: 'Medio', color: '#eab308' };
    if (score >= 3) return { label: 'Bajo', color: '#22c55e' };
    return { label: 'Muy Bajo', color: '#6b7280' };
  });

  controlesAsociados = computed(() => {
    const r = this.riesgo();
    return r?.linkedControlIds?.length || 0;
  });

  activosAfectados = computed(() => {
    const r = this.riesgo();
    return r?.affectedAssetIds?.length || 0;
  });

  procesosImpactados = computed(() => {
    const r = this.riesgo();
    return r?.impactedProcessIds?.length || 0;
  });

  // Costos
  costoTotal = computed(() => {
    const r = this.riesgo();
    if (!r) return 0;
    return (r.costEvent || 0) + (r.costRemediation || 0) + (r.costDowntime || 0) + (r.costMitigation || 0);
  });

  comentarios = computed(() => this.riesgo()?.comments || []);

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.riesgoId.set(params['id']);
        this.loadRiesgo();
      }
    });
    this.initMenuItems();
  }

  async loadRiesgo() {
    this.loading.set(true);
    await this.eventosService.loadEvents();
    const riesgo = await this.eventosService.getEventById(this.riesgoId());

    if (riesgo && riesgo.eventType === EventType.RISK) {
      this.riesgo.set(riesgo);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Riesgo no encontrado'
      });
      this.router.navigate(['/riesgos']);
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
    this.router.navigate(['/riesgos']);
  }

  navigateToEdit() {
    this.router.navigate(['/riesgos', this.riesgoId(), 'editar']);
  }

  navigateToActivo(id: string) {
    this.router.navigate(['/activos', id, 'detalle']);
  }

  showMenu(menu: any, event: globalThis.Event) {
    menu.toggle(event);
  }

  // Acciones
  async changeStatus(newStatus: EventStatus) {
    const r = this.riesgo();
    if (!r) return;

    const result = await this.eventosService.changeStatus(r.id, newStatus);
    if (result) {
      this.riesgo.set(result);
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El riesgo ahora esta ${getEventStatusLabel(newStatus)}`
      });
    }
  }

  confirmDelete() {
    const r = this.riesgo();
    if (!r) return;

    this.confirmationService.confirm({
      message: `Esta seguro de eliminar el riesgo "${r.title}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.eventosService.deleteEvent(r.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Riesgo eliminado',
            detail: 'El riesgo ha sido eliminado'
          });
          setTimeout(() => this.router.navigate(['/riesgos']), 1000);
        }
      }
    });
  }

  // Comentarios
  async addComment() {
    const r = this.riesgo();
    const content = this.newComment().trim();
    if (!r || !content) return;

    const result = await this.eventosService.addComment(r.id, content, 'current-user');
    if (result) {
      const updated = await this.eventosService.getEventById(r.id);
      if (updated) {
        this.riesgo.set(updated);
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
  getProbabilityLabel = getProbabilityLabel;
  getImpactLabel = getImpactLabel;

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
