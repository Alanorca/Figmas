import { Component, OnInit, inject, signal, computed, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { DrawerModule } from 'primeng/drawer';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MenuModule, Menu } from 'primeng/menu';
import { PopoverModule, Popover } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToolbarModule } from 'primeng/toolbar';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

// Services
import { ProyectosService } from '../../services/proyectos.service';

// Models
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  PROJECT_STATUS_OPTIONS,
  PROJECT_PRIORITY_OPTIONS,
  getStatusColor,
  getPriorityColor,
  calculateDaysRemaining
} from '../../models/proyectos.models';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    DrawerModule,
    CardModule,
    TabsModule,
    ConfirmDialogModule,
    ToastModule,
    MenuModule,
    PopoverModule,
    AvatarModule,
    DividerModule,
    ToolbarModule,
    MultiSelectModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss'
})
export class ProyectosComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);
  proyectosService = inject(ProyectosService);

  // ViewChild
  @ViewChild('opAcciones') opAcciones!: Popover;

  // Estado local
  showDrawer = signal(false);
  proyectoSeleccionado = signal<Project | null>(null);
  activeTab = signal(0);
  proyectosSeleccionados = signal<Project[]>([]);
  showAccionesMasivasDrawer = signal(false);
  proyectoMenuActual: Project | null = null;

  // Acciones masivas
  accionMasivaEstado = signal<ProjectStatus | null>(null);
  accionMasivaPrioridad = signal<ProjectPriority | null>(null);

  // Opciones para filtros (con opción "Todos" al inicio)
  statusOptions = PROJECT_STATUS_OPTIONS;
  priorityOptions = PROJECT_PRIORITY_OPTIONS;
  statusOptionsWithAll = [{ value: '', label: 'Todos los estados', color: '', icon: '' }, ...PROJECT_STATUS_OPTIONS];
  priorityOptionsWithAll = [{ value: '', label: 'Todas las prioridades', color: '', severity: '' }, ...PROJECT_PRIORITY_OPTIONS];

  // Opciones para filtros inline
  statusFilterOptions = PROJECT_STATUS_OPTIONS.map(s => ({ label: s.label, value: s.value }));
  priorityFilterOptions = PROJECT_PRIORITY_OPTIONS.map(p => ({ label: p.label, value: p.value }));

  // Menú de acciones
  exportMenuItems: MenuItem[] = [
    { label: 'Exportar a Excel', icon: 'pi pi-file-excel', command: () => this.exportarExcel() },
    { label: 'Exportar a PDF', icon: 'pi pi-file-pdf', command: () => this.exportarPDF() }
  ];

  // Para usar Math en el template
  Math = Math;

  // Computed
  stats = computed(() => this.proyectosService.projectStats());
  projects = computed(() => this.proyectosService.filteredProjects());
  loading = computed(() => this.proyectosService.loading());

  ngOnInit(): void {
    this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    try {
      await this.proyectosService.loadProjects();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los proyectos'
      });
    }
  }

  crearProyecto(): void {
    this.router.navigate(['/proyectos/crear']);
  }

  verProyecto(proyecto: Project): void {
    console.log('verProyecto:', proyecto.id);
    this.router.navigate(['/proyectos', proyecto.id]);
  }

  editarProyecto(proyecto: Project): void {
    console.log('editarProyecto:', proyecto.id);
    this.router.navigate(['/proyectos', proyecto.id, 'editar']);
  }

  abrirDrawer(proyecto: Project): void {
    this.proyectoSeleccionado.set(proyecto);
    this.showDrawer.set(true);
  }

  cerrarDrawer(): void {
    this.showDrawer.set(false);
    this.proyectoSeleccionado.set(null);
  }

  async cambiarEstado(proyecto: Project, nuevoEstado: ProjectStatus): Promise<void> {
    try {
      await this.proyectosService.updateProjectStatus(proyecto.id, nuevoEstado);
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El proyecto "${proyecto.name}" cambió a ${this.getStatusLabel(nuevoEstado)}`
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cambiar el estado del proyecto'
      });
    }
  }

  confirmarEliminar(proyecto: Project): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el proyecto "${proyecto.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          await this.proyectosService.deleteProject(proyecto.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Proyecto eliminado',
            detail: `El proyecto "${proyecto.name}" ha sido eliminado`
          });
          this.cerrarDrawer();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el proyecto'
          });
        }
      }
    });
  }

  // Helpers para el template
  getStatusLabel(status: ProjectStatus): string {
    return this.statusOptions.find(s => s.value === status)?.label || status;
  }

  getStatusColor(status: ProjectStatus): string {
    return getStatusColor(status);
  }

  getStatusSeverity(status: ProjectStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<ProjectStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      planning: 'secondary',
      in_progress: 'info',
      paused: 'warn',
      completed: 'success',
      cancelled: 'danger'
    };
    return severities[status];
  }

  getPriorityLabel(priority: ProjectPriority): string {
    return this.priorityOptions.find(p => p.value === priority)?.label || priority;
  }

  getPrioritySeverity(priority: ProjectPriority): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<ProjectPriority, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warn',
      critical: 'danger'
    };
    return severities[priority];
  }

  getDaysRemaining(endDate: Date | string): number {
    return calculateDaysRemaining(endDate);
  }

  getAbsoluteDays(days: number): number {
    return Math.abs(days);
  }

  // Para fases (PhaseStatus es compatible con ProjectStatus para los valores comunes)
  getPhaseStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  getPhaseStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      pending: 'secondary',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger'
    };
    return severities[status] || 'secondary';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'var(--green-500)';
    if (progress >= 50) return 'var(--blue-500)';
    if (progress >= 25) return 'var(--orange-500)';
    return 'var(--red-500)';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.proyectosService.searchFilter.set(value);
  }

  onStatusFilter(status: ProjectStatus | ''): void {
    this.proyectosService.statusFilter.set(status);
  }

  onPriorityFilter(priority: ProjectPriority | ''): void {
    this.proyectosService.priorityFilter.set(priority);
  }

  limpiarFiltros(): void {
    this.proyectosService.resetFilters();
  }

  abrirPopover(event: Event, proyecto: Project): void {
    this.proyectoMenuActual = proyecto;
    this.opAcciones.toggle(event);
  }

  // Selección múltiple
  onSelectionChange(proyectos: Project[]): void {
    this.proyectosSeleccionados.set(proyectos);
  }

  // Exportación
  exportarExcel(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportación',
      detail: 'Exportando a Excel...'
    });
    // TODO: Implementar exportación real
  }

  exportarPDF(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportación',
      detail: 'Exportando a PDF...'
    });
    // TODO: Implementar exportación real
  }

  // Contadores para el pie de tabla
  getContadores() {
    const all = this.projects();
    return {
      total: all.length,
      planning: all.filter(p => p.status === 'planning').length,
      inProgress: all.filter(p => p.status === 'in_progress').length,
      paused: all.filter(p => p.status === 'paused').length,
      completed: all.filter(p => p.status === 'completed').length,
      cancelled: all.filter(p => p.status === 'cancelled').length,
      critical: all.filter(p => p.priority === 'critical').length,
      high: all.filter(p => p.priority === 'high').length
    };
  }

  // Acciones masivas
  abrirAccionesMasivasDrawer(): void {
    this.accionMasivaEstado.set(null);
    this.accionMasivaPrioridad.set(null);
    this.showAccionesMasivasDrawer.set(true);
  }

  async aplicarAccionesMasivas(): Promise<void> {
    const seleccionados = this.proyectosSeleccionados();
    if (seleccionados.length === 0) return;

    const estado = this.accionMasivaEstado();
    const prioridad = this.accionMasivaPrioridad();

    if (!estado && !prioridad) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin cambios',
        detail: 'Selecciona al menos un campo para modificar'
      });
      return;
    }

    try {
      for (const proyecto of seleccionados) {
        const updates: any = {};
        if (estado) updates.status = estado;
        if (prioridad) updates.priority = prioridad;

        await this.proyectosService.updateProject(proyecto.id, updates);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Cambios aplicados',
        detail: `Se actualizaron ${seleccionados.length} proyectos`
      });

      this.showAccionesMasivasDrawer.set(false);
      this.proyectosSeleccionados.set([]);
      await this.loadProjects();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron aplicar los cambios'
      });
    }
  }

  async eliminarSeleccionados(): Promise<void> {
    const seleccionados = this.proyectosSeleccionados();
    if (seleccionados.length === 0) return;

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar ${seleccionados.length} proyecto(s)? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación masiva',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        try {
          for (const proyecto of seleccionados) {
            await this.proyectosService.deleteProject(proyecto.id);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Proyectos eliminados',
            detail: `Se eliminaron ${seleccionados.length} proyectos`
          });

          this.showAccionesMasivasDrawer.set(false);
          this.proyectosSeleccionados.set([]);
          await this.loadProjects();
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron eliminar los proyectos'
          });
        }
      }
    });
  }

  getCantidadCambiosPendientes(): number {
    let count = 0;
    if (this.accionMasivaEstado()) count++;
    if (this.accionMasivaPrioridad()) count++;
    return count;
  }
}
