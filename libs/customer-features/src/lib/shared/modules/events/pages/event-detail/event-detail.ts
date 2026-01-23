import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MenuItem, ConfirmationService } from 'primeng/api';

import { AuditHistoryTableComponent } from '../../../../components/audit-history-table/audit-history-table.component';
import { EntityComparisonComponent } from '../../../../components/entity-comparison/entity-comparison.component';
import { EventService } from '../../../assets/services/event.service';
import { Event as EventEntity, EventType } from '../../../assets/types/event.types';
import { AssetService } from '../../../assets/services/asset.service';
import { Asset } from '../../../assets/types/asset.types';
import { ToastService } from '../../../../services/toast.service';
import { BreadcrumbService } from '../../../../services/breadcrumb.service';
import { catchError, forkJoin, of } from 'rxjs';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

// Event Type Configuration
interface EventTypeConfig {
  label: string;
  labelPlural: string;
  icon: string;
  color: string;
  bgColor: string;
  routePrefix: string;
}

const EVENT_TYPE_CONFIG: Record<number, EventTypeConfig> = {
  [EventType.RISK]: {
    label: 'Riesgo',
    labelPlural: 'Riesgos',
    icon: 'pi pi-exclamation-triangle',
    color: '#F59E0B',
    bgColor: 'bg-amber-500',
    routePrefix: '/risks',
  },
  [EventType.INCIDENT]: {
    label: 'Incidente',
    labelPlural: 'Incidentes',
    icon: 'pi pi-bolt',
    color: '#EF4444',
    bgColor: 'bg-red-500',
    routePrefix: '/incidents',
  },
  [EventType.DEFECT]: {
    label: 'Defecto',
    labelPlural: 'Defectos',
    icon: 'pi pi-bug',
    color: '#8B5CF6',
    bgColor: 'bg-violet-500',
    routePrefix: '/defects',
  },
};

@Component({
  selector: 'orca-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    DividerModule,
    MenuModule,
    AvatarModule,
    TabsModule,
    BadgeModule,
    TextareaModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    AuditHistoryTableComponent,
    EntityComparisonComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private assetService = inject(AssetService);
  private toastService = inject(ToastService);
  private breadcrumbService = inject(BreadcrumbService);
  private confirmationService = inject(ConfirmationService);

  // State
  eventId = signal<number | null>(null);
  eventTypeId = signal<number>(EventType.INCIDENT);
  activeTab = signal<string>('0');
  isLoading = signal(true);

  // Audit history tab
  showComparison = signal(false);
  comparisonTargetDate = signal<string | null>(null);
  comparisonTargetRevision = signal<number | null>(null);

  // Return URL for navigation back
  returnUrl = signal<string>('/incidents/list');

  // Event data
  event = signal<EventEntity | null>(null);

  // Affected Assets
  affectedAssets = signal<Asset[]>([]);
  loadingAffectedAssets = signal(false);

  // Comments
  newComment = signal('');

  // Context menu
  menuItems: MenuItem[] = [];

  // Computed values for event config
  eventTypeConfig = computed(() => {
    const typeId = this.event()?.eventType?.id ?? this.eventTypeId();
    return EVENT_TYPE_CONFIG[typeId] || EVENT_TYPE_CONFIG[EventType.INCIDENT];
  });

  // Computed values for display
  eventTitle = computed(() => this.event()?.title || 'Cargando...');
  eventDescription = computed(() => this.event()?.description || '');
  eventTypeName = computed(() => this.eventTypeConfig().label);
  eventSubTypeName = computed(() => this.event()?.eventSubType?.name || null);
  eventStatusName = computed(() => this.event()?.eventStatus?.name || '-');
  eventStatusCode = computed(() => this.event()?.eventStatus?.code || '');
  severityName = computed(() => this.event()?.initialSeverity?.name || '-');
  severityCode = computed(() => this.event()?.initialSeverity?.code || '');

  // Affected Assets and Processes
  affectedAssetIds = computed(() => this.event()?.affectedAssetIds || []);
  impactedProcessIds = computed(() => this.event()?.impactedProcessIds || []);

  // Property Values (custom properties)
  propertyValues = computed(() => this.event()?.propertyValues || []);
  hasPropertyValues = computed(() => this.propertyValues().length > 0);

  // Grouped property values
  groupedPropertyValues = computed(() => {
    const props = this.propertyValues();
    if (!props.length) return [];

    const groups: Map<string, typeof props> = new Map();

    props.forEach(prop => {
      const groupName = prop.groupName || 'General';
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }
      groups.get(groupName)!.push(prop);
    });

    return Array.from(groups.entries()).map(([name, properties]) => ({
      name,
      properties: properties.sort((a, b) => a.displayOrder - b.displayOrder),
    }));
  });

  // Propagation
  propagationLevel = computed(() => this.event()?.propagationLevel?.name || null);
  propagationSpeed = computed(() => this.event()?.propagationSpeed?.name || null);

  // Solution
  solution = computed(() => this.event()?.solution || null);

  // Risk-specific
  riskAnalysis = computed(() => this.event()?.riskAnalysis || null);
  isRisk = computed(() => this.event()?.eventType?.id === EventType.RISK);

  // Incident-specific metrics
  resolutionTimeHours = computed(() => this.event()?.resolutionTimeHours || null);
  detectionTimeHours = computed(() => this.event()?.detectionTimeHours || null);
  affectedUserCount = computed(() => this.event()?.affectedUserCount || null);
  downtimeMinutes = computed(() => this.event()?.downtimeMinutes || null);

  // Comments
  comments = computed(() => this.event()?.comments || []);

  // Dates
  initialDate = computed(() => {
    const e = this.event();
    if (!e?.initialDate) return '-';
    return this.formatDate(e.initialDate);
  });

  createdAt = computed(() => {
    const e = this.event();
    if (!e?.createdAt) return '-';
    return this.formatDateTime(e.createdAt);
  });

  updatedAt = computed(() => {
    const e = this.event();
    if (!e?.updatedAt) return '-';
    return this.formatDateTime(e.updatedAt);
  });

  resolvedAt = computed(() => {
    const e = this.event();
    if (!e?.resolvedAt) return null;
    return this.formatDateTime(e.resolvedAt);
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.eventId.set(parseInt(params['id'], 10));
        this.loadEventData();
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['tab']) {
        const tabIndex = queryParams['tab'];
        this.activeTab.set(tabIndex);
      }

      if (queryParams['returnUrl']) {
        this.returnUrl.set(queryParams['returnUrl']);
      }

      if (queryParams['eventType']) {
        const typeMap: Record<string, number> = {
          RISK: EventType.RISK,
          INCIDENT: EventType.INCIDENT,
          DEFECT: EventType.DEFECT,
        };
        this.eventTypeId.set(typeMap[queryParams['eventType']] || EventType.INCIDENT);
      }
    });

    this.initMenuItems();
  }

  private initMenuItems(): void {
    this.menuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editEvent(),
      },
      { separator: true },
      {
        label: 'Cambiar estado',
        icon: 'pi pi-sync',
        items: [
          { label: 'Abierto', command: () => this.changeStatus('OPEN') },
          { label: 'En progreso', command: () => this.changeStatus('IN_PROGRESS') },
          { label: 'Resuelto', command: () => this.changeStatus('RESOLVED') },
          { label: 'Cerrado', command: () => this.changeStatus('CLOSED') },
        ],
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete(),
      },
    ];
  }

  private loadEventData() {
    const id = this.eventId();
    if (!id) return;

    this.isLoading.set(true);

    this.eventService
      .getEventById(id)
      .pipe(
        catchError((error) => {
          console.error('[EventDetail] Error loading event:', error);
          this.toastService.showError('Error', 'No se pudo cargar el evento.');
          return of(null);
        })
      )
      .subscribe({
        next: (event) => {
          this.event.set(event);

          if (event) {
            this.updateBreadcrumbs(event.title);
            this.loadAffectedAssets(event.affectedAssetIds || []);
          }

          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private loadAffectedAssets(assetIds: number[]) {
    if (!assetIds || assetIds.length === 0) {
      this.affectedAssets.set([]);
      return;
    }

    this.loadingAffectedAssets.set(true);

    const assetRequests = assetIds.map((id) =>
      this.assetService.getAssetById(id).pipe(
        catchError((error) => {
          console.error(`[EventDetail] Error loading asset ${id}:`, error);
          return of(null);
        })
      )
    );

    forkJoin(assetRequests).subscribe((assets) => {
      this.affectedAssets.set(assets.filter((a): a is Asset => a !== null));
      this.loadingAffectedAssets.set(false);
    });
  }

  private updateBreadcrumbs(eventTitle: string): void {
    const config = this.eventTypeConfig();
    this.breadcrumbService.setBreadcrumbs([
      { label: config.labelPlural, routerLink: [`${config.routePrefix}/list`] },
      { label: eventTitle },
    ]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatPropertyValue(prop: any): string {
    if (prop.textValue) return prop.textValue;
    if (prop.numericValue !== null && prop.numericValue !== undefined) return String(prop.numericValue);
    if (prop.booleanValue !== null && prop.booleanValue !== undefined) return prop.booleanValue ? 'Si' : 'No';
    if (prop.selectedOption) return prop.selectedOption.label;
    if (prop.dateValue) return this.formatDate(prop.dateValue);
    return '-';
  }

  onTabChange(value: string | number | undefined) {
    if (value !== undefined) {
      this.activeTab.set(String(value));
    }
  }

  editEvent() {
    const id = this.eventId();
    const config = this.eventTypeConfig();
    if (!id) return;

    this.router.navigate(['/events/create'], {
      queryParams: {
        eventType: this.event()?.eventType?.code || 'INCIDENT',
        eventId: id,
        returnTo: `${config.routePrefix}/detail/${id}`,
      },
    });
  }

  goBack() {
    this.router.navigateByUrl(this.returnUrl());
  }

  navigateToAsset(assetId: number) {
    this.router.navigate(['/assets/detail', assetId]);
  }

  navigateToProcess(processId: number) {
    this.router.navigate(['/processes/detail', processId]);
  }

  showMenu(menu: any, event: globalThis.Event): void {
    menu.toggle(event);
  }

  changeStatus(newStatus: string): void {
    // TODO: Implement status change via service
    this.toastService.showInfo('Info', `Cambiando estado a ${newStatus}...`);
  }

  confirmDelete(): void {
    const evt = this.event();
    if (!evt) return;

    this.confirmationService.confirm({
      message: `Esta seguro de eliminar el evento "${evt.title}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.eventService.deleteEvent(evt.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Exito', 'Evento eliminado correctamente');
            setTimeout(() => this.goBack(), 1000);
          },
          error: () => {
            this.toastService.showError('Error', 'No se pudo eliminar el evento');
          },
        });
      },
    });
  }

  addComment(): void {
    const content = this.newComment().trim();
    if (!content) return;

    // TODO: Implement add comment via service
    this.toastService.showInfo('Info', 'Comentario agregado');
    this.newComment.set('');
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Audit history methods
  onCompareRequested(event: { revision: number; date: string }) {
    this.comparisonTargetDate.set(event.date);
    this.comparisonTargetRevision.set(event.revision);
    this.showComparison.set(true);
  }

  toggleComparisonView() {
    this.showComparison.update((v) => !v);
  }

  getSeveritySeverity(code: string | undefined): Severity {
    switch (code) {
      case 'CRITICAL':
        return 'danger';
      case 'HIGH':
        return 'warn';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'success';
      case 'INFO':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(code: string | undefined): Severity {
    switch (code) {
      case 'OPEN':
      case 'NEW':
        return 'info';
      case 'IN_PROGRESS':
      case 'UNDER_REVIEW':
        return 'warn';
      case 'RESOLVED':
      case 'CLOSED':
      case 'MITIGATED':
        return 'success';
      case 'REJECTED':
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
