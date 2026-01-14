import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { KnobModule } from 'primeng/knob';
import { AccordionModule } from 'primeng/accordion';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';

// Services
import { ApiService } from '../../services/api.service';

// Models
import {
  Activo,
  Riesgo,
  Incidente,
  Defecto,
  ActivoGraph,
  ActivoResumen,
  ToleranceConfig
} from '../../models/index';

// Constantes para mapeo de estados
const HEALTH_STATUS_CONFIG = {
  HEALTHY: { label: 'Saludable', severity: 'success' as const, icon: 'pi-check-circle', color: '#22c55e' },
  STRESSED: { label: 'Estresado', severity: 'warn' as const, icon: 'pi-exclamation-triangle', color: '#f59e0b' },
  CRITICAL: { label: 'Critico', severity: 'danger' as const, icon: 'pi-times-circle', color: '#ef4444' }
};

const CRITICIDAD_CONFIG: Record<string, { label: string; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'; color: string }> = {
  critica: { label: 'Critica', severity: 'danger', color: '#dc2626' },
  alta: { label: 'Alta', severity: 'danger', color: '#ef4444' },
  media: { label: 'Media', severity: 'warn', color: '#f59e0b' },
  baja: { label: 'Baja', severity: 'success', color: '#22c55e' }
};

const TIPO_ACTIVO_ICONS: Record<string, string> = {
  hardware: 'pi-server',
  software: 'pi-code',
  datos: 'pi-database',
  personas: 'pi-users',
  instalaciones: 'pi-building',
  servicios: 'pi-cloud',
  red: 'pi-wifi',
  seguridad: 'pi-shield'
};

@Component({
  selector: 'app-activo-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TabsModule,
    TagModule,
    ProgressBarModule,
    CardModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    DrawerModule,
    TableModule,
    ConfirmDialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    SliderModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    AvatarModule,
    BadgeModule,
    ChartModule,
    KnobModule,
    AccordionModule,
    DatePickerModule,
    CheckboxModule,
    DialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './activo-detalle.html',
  styleUrl: './activo-detalle.scss'
})
export class ActivoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Estado principal
  activoId = signal<string>('');
  loading = signal(true);

  // Navegacion por tabs
  mainTab = signal<'general' | 'reglas' | 'riesgos' | 'incidentes' | 'auditoria'>('general');
  secondaryTab = signal<'info' | 'salud' | 'tolerancia' | 'propiedades'>('info');
  showContent = signal(true);

  // Dialog del grafo
  showGraphDialog = signal(false);
  graphZoom = signal(1);
  graphPanX = signal(0);
  graphPanY = signal(0);
  isDragging = signal(false);
  lastMouseX = signal(0);
  lastMouseY = signal(0);
  graphLayout = 'vertical';
  layoutOptions = [
    { label: 'Jerarquico Vertical', value: 'vertical' },
    { label: 'Jerarquico Horizontal', value: 'horizontal' },
    { label: 'Radial', value: 'radial' },
    { label: 'Circular', value: 'circular' }
  ];

  // Datos del activo
  activo = signal<Activo | null>(null);
  graphData = signal<ActivoGraph | null>(null);
  parentAssets = signal<ActivoResumen[]>([]);
  childAssets = signal<ActivoResumen[]>([]);

  // Drawer de configuracion
  showToleranceDrawer = signal(false);
  toleranceForm = signal<ToleranceConfig>({
    incidentToleranceThreshold: 10,
    incidentCountResetDays: 365
  });

  // Configuraciones
  healthStatusConfig = HEALTH_STATUS_CONFIG;
  criticidadConfig = CRITICIDAD_CONFIG;
  tipoActivoIcons = TIPO_ACTIVO_ICONS;

  // Computed values
  healthPercentage = computed(() => {
    const a = this.activo();
    if (!a) return 0;
    const threshold = a.incidentToleranceThreshold || 10;
    const count = a.currentIncidentCount || 0;
    return Math.min(100, (count / threshold) * 100);
  });

  healthConfig = computed(() => {
    const a = this.activo();
    return HEALTH_STATUS_CONFIG[a?.healthStatus || 'HEALTHY'];
  });

  criticidadConfigComputed = computed(() => {
    const a = this.activo();
    const criticidad = a?.criticidad || 'media';
    return CRITICIDAD_CONFIG[criticidad] || CRITICIDAD_CONFIG['media'];
  });

  tipoIcon = computed(() => {
    const a = this.activo();
    const tipo = a?.tipo || 'software';
    return TIPO_ACTIVO_ICONS[tipo] || 'pi-box';
  });

  riesgosCount = computed(() => this.activo()?.riesgos?.length || 0);
  incidentesCount = computed(() => this.activo()?.incidentes?.length || 0);
  defectosCount = computed(() => this.activo()?.defectos?.length || 0);

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.activoId.set(params['id']);
        this.loadActivo();
      }
    });
  }

  loadActivo() {
    this.loading.set(true);

    this.apiService.getActivoById(this.activoId()).subscribe({
      next: (activo) => {
        this.activo.set(activo);
        this.loadGraphData();
        this.loadHierarchy();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando activo:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el activo'
        });
        this.loading.set(false);
      }
    });
  }

  loadGraphData() {
    this.apiService.getActivoGraph(this.activoId()).subscribe({
      next: (graph) => this.graphData.set(graph),
      error: (err) => console.error('Error cargando grafo:', err)
    });
  }

  loadHierarchy() {
    this.apiService.getActivoParents(this.activoId()).subscribe({
      next: (parents) => this.parentAssets.set(parents),
      error: (err) => console.error('Error cargando padres:', err)
    });

    this.apiService.getActivoChildren(this.activoId()).subscribe({
      next: (children) => this.childAssets.set(children),
      error: (err) => console.error('Error cargando hijos:', err)
    });
  }

  // Acciones
  goBack() {
    this.router.navigate(['/activos']);
  }

  editActivo() {
    this.router.navigate(['/activos', this.activoId(), 'editar']);
  }

  openToleranceConfig() {
    const a = this.activo();
    if (a) {
      this.toleranceForm.set({
        incidentToleranceThreshold: a.incidentToleranceThreshold || 10,
        incidentCountResetDays: a.incidentCountResetDays || 365
      });
    }
    this.showToleranceDrawer.set(true);
  }

  saveToleranceConfig() {
    this.apiService.updateActivoTolerance(this.activoId(), this.toleranceForm()).subscribe({
      next: (updated) => {
        this.activo.set({ ...this.activo()!, ...updated });
        this.showToleranceDrawer.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Configuracion de tolerancia actualizada'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la configuracion'
        });
      }
    });
  }

  resetHealth() {
    this.confirmationService.confirm({
      message: 'Esto reiniciara el contador de incidentes a 0 y el estado a Saludable. Continuar?',
      header: 'Confirmar reset',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.apiService.resetActivoHealth(this.activoId()).subscribe({
          next: (updated) => {
            this.activo.set({ ...this.activo()!, ...updated });
            this.messageService.add({
              severity: 'success',
              summary: 'Reseteado',
              detail: 'Estado de salud reiniciado'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo resetear el estado'
            });
          }
        });
      }
    });
  }

  // Navegacion a entidades relacionadas
  navigateToRiesgo(riesgo: Riesgo) {
    // Implementar navegacion a detalle de riesgo
  }

  navigateToIncidente(incidente: Incidente) {
    // Implementar navegacion a detalle de incidente
  }

  navigateToDefecto(defecto: Defecto) {
    // Implementar navegacion a detalle de defecto
  }

  navigateToActivo(id: string) {
    this.router.navigate(['/activos', id, 'detalle']);
  }

  // Helpers para templates
  getSeveridadSeverity(severidad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      critica: 'danger',
      alta: 'danger',
      media: 'warn',
      baja: 'success'
    };
    return map[severidad] || 'secondary';
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      identificado: 'info',
      evaluado: 'warn',
      mitigado: 'success',
      aceptado: 'secondary',
      abierto: 'danger',
      en_proceso: 'warn',
      resuelto: 'success',
      cerrado: 'secondary',
      nuevo: 'info',
      confirmado: 'warn',
      en_correccion: 'warn',
      corregido: 'success',
      verificado: 'success'
    };
    return map[estado] || 'secondary';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Metodos para calculos
  calculateProgress(current: number, target: number): number {
    if (target === 0) return 100;
    return Math.min(100, (current / target) * 100);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getShortName(name: string): string {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  }

  // Metodos para el grafo visual
  getOrbitalX(index: number, total: number): number {
    const radius = 130;
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return radius * Math.cos(angle);
  }

  getOrbitalY(index: number, total: number): number {
    const radius = 130;
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return radius * Math.sin(angle);
  }

  getEdgeIndex(nodeId: string): number {
    const graph = this.graphData();
    if (!graph) return 0;
    const edgeIndex = graph.edges.findIndex(e => e.target === nodeId || e.source === nodeId);
    return edgeIndex >= 0 ? edgeIndex : 0;
  }

  getNodeTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'activo-padre': 'Padre',
      'activo-hijo': 'Hijo',
      'riesgo': 'Riesgo',
      'incidente': 'Incidente',
      'defecto': 'Defecto'
    };
    return labels[type] || type;
  }

  onNodeClick(node: any) {
    if (node.type === 'activo-padre' || node.type === 'activo-hijo') {
      this.navigateToActivo(node.id);
    } else if (node.type === 'riesgo') {
      this.navigateToRiesgo(node.data);
    } else if (node.type === 'incidente') {
      this.navigateToIncidente(node.data);
    } else if (node.type === 'defecto') {
      this.navigateToDefecto(node.data);
    }
  }

  // Metodos para el dialog del grafo
  openGraphDialog() {
    this.showGraphDialog.set(true);
  }

  zoomIn() {
    this.graphZoom.update(z => Math.min(z + 0.2, 2));
  }

  zoomOut() {
    this.graphZoom.update(z => Math.max(z - 0.2, 0.5));
  }

  resetZoom() {
    this.graphZoom.set(1);
    this.graphPanX.set(0);
    this.graphPanY.set(0);
  }

  // Metodos para pan y zoom con mouse
  onGraphWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.3, Math.min(3, this.graphZoom() + delta));
    this.graphZoom.set(newZoom);
  }

  onGraphMouseDown(event: MouseEvent) {
    // Solo activar pan con click derecho (button === 2)
    if (event.button === 2) {
      event.preventDefault();
      this.isDragging.set(true);
      this.lastMouseX.set(event.clientX);
      this.lastMouseY.set(event.clientY);
    }
  }

  onGraphMouseMove(event: MouseEvent) {
    if (this.isDragging()) {
      const deltaX = event.clientX - this.lastMouseX();
      const deltaY = event.clientY - this.lastMouseY();

      // Ajustar el movimiento segun el zoom actual
      const zoomFactor = this.graphZoom();
      this.graphPanX.update(x => x + deltaX / zoomFactor);
      this.graphPanY.update(y => y + deltaY / zoomFactor);

      this.lastMouseX.set(event.clientX);
      this.lastMouseY.set(event.clientY);
    }
  }

  onGraphMouseUp() {
    this.isDragging.set(false);
  }

  getTypePercentage(type: string): number {
    const total = this.riesgosCount() + this.incidentesCount() + this.defectosCount() + this.childAssets().length + this.parentAssets().length;
    if (total === 0) return 0;

    switch (type) {
      case 'incidente':
        return (this.incidentesCount() / total) * 100;
      case 'riesgo':
        return (this.riesgosCount() / total) * 100;
      case 'activo':
        return ((this.childAssets().length + this.parentAssets().length) / total) * 100;
      default:
        return 0;
    }
  }
}
