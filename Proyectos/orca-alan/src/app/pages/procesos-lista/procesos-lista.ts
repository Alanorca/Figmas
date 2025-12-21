import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProcessService } from '../../services/process.service';
import { Proceso } from '../../models/process-nodes';

@Component({
  selector: 'app-procesos-lista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    DrawerModule,
    DividerModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    MenuModule,
    ToolbarModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './procesos-lista.html',
  styleUrl: './procesos-lista.scss'
})
export class ProcesosListaComponent {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  processService = inject(ProcessService);

  // Lista de procesos
  procesos = this.processService.procesos;

  // Drawer de detalle
  showDrawer = signal(false);
  procesoSeleccionado = signal<Proceso | null>(null);

  // Selección múltiple
  procesosSeleccionados = signal<Proceso[]>([]);

  // Edición in-place
  procesoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  // Opciones de estado para filtro
  estadoOptions: { label: string; value: Proceso['estado'] }[] = [
    { label: 'Borrador', value: 'borrador' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' },
    { label: 'Archivado', value: 'archivado' }
  ];

  // Estadísticas
  stats = computed(() => {
    const lista = this.procesos();
    return {
      total: lista.length,
      borradores: lista.filter(p => p.estado === 'borrador').length,
      activos: lista.filter(p => p.estado === 'activo').length,
      inactivos: lista.filter(p => p.estado === 'inactivo').length
    };
  });

  // Navegar a crear nuevo proceso
  crearProceso(): void {
    this.router.navigate(['/procesos/crear']);
  }

  // Ver detalle en pantalla completa
  verDetalle(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id, 'detalle']);
  }

  // Ver detalle en drawer (alternativo)
  verDetalleDrawer(proceso: Proceso): void {
    this.procesoSeleccionado.set(proceso);
    this.showDrawer.set(true);
  }

  // Editar proceso (navegar al editor)
  editarProceso(proceso: Proceso): void {
    this.router.navigate(['/procesos', proceso.id]);
  }

  // Duplicar proceso
  duplicarProceso(proceso: Proceso): void {
    const copia = this.processService.duplicateProceso(proceso.id);
    if (copia) {
      this.messageService.add({
        severity: 'success',
        summary: 'Duplicado',
        detail: `Proceso "${copia.nombre}" creado`
      });
    }
  }

  // Ejecutar proceso
  ejecutarProceso(proceso: Proceso): void {
    this.processService.loadProceso(proceso.id);
    this.processService.executeProcess();
    this.messageService.add({
      severity: 'info',
      summary: 'Ejecutando',
      detail: `Proceso "${proceso.nombre}" en ejecución`
    });
  }

  // Eliminar proceso
  eliminarProceso(proceso: Proceso): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${proceso.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.processService.deleteProceso(proceso.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Proceso eliminado exitosamente'
        });
        if (this.procesoSeleccionado()?.id === proceso.id) {
          this.showDrawer.set(false);
        }
      }
    });
  }

  // Cambiar estado del proceso
  cambiarEstado(proceso: Proceso, estado: Proceso['estado']): void {
    this.processService.updateProcesoEstado(proceso.id, estado);
    this.messageService.add({
      severity: 'success',
      summary: 'Estado actualizado',
      detail: `Proceso marcado como "${estado}"`
    });
  }

  // Helpers para tags de estado
  getEstadoSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
      'borrador': 'secondary',
      'activo': 'success',
      'inactivo': 'warn',
      'archivado': 'danger'
    };
    return severities[estado] || 'info';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'activo': 'Activo',
      'inactivo': 'Inactivo',
      'archivado': 'Archivado'
    };
    return labels[estado] || estado;
  }

  // Formatear fecha
  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Resetear datos de demo
  resetDemoData(): void {
    this.confirmationService.confirm({
      message: '¿Deseas cargar los 5 procesos de demostración? Esto reemplazará los procesos demo existentes.',
      header: 'Cargar Datos Demo',
      icon: 'pi pi-database',
      acceptLabel: 'Cargar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.processService.resetDemoProcesses();
        this.messageService.add({
          severity: 'success',
          summary: 'Demo cargado',
          detail: 'Se han cargado 5 procesos de demostración con nodos funcionales'
        });
      }
    });
  }

  // Generar items del menú contextual
  getMenuItems(proceso: Proceso): MenuItem[] {
    const items: MenuItem[] = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.verDetalle(proceso)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.editarProceso(proceso)
      },
      {
        label: 'Edición rápida',
        icon: 'pi pi-bolt',
        command: () => this.iniciarEdicionDesdeMenu(proceso)
      },
      {
        label: 'Duplicar',
        icon: 'pi pi-copy',
        command: () => this.duplicarProceso(proceso)
      }
    ];

    if (proceso.estado === 'activo') {
      items.push({
        label: 'Ejecutar',
        icon: 'pi pi-play',
        command: () => this.ejecutarProceso(proceso)
      });
    }

    items.push({
      separator: true
    });

    items.push({
      label: 'Eliminar',
      icon: 'pi pi-trash',
      styleClass: 'text-red-500',
      command: () => this.eliminarProceso(proceso)
    });

    return items;
  }

  // Métodos para el resumen del footer
  getCountByEstado(estado: string): number {
    return this.procesos().filter(p => p.estado === estado).length;
  }

  getTotalNodos(): number {
    return this.procesos().reduce((total, p) => total + (p.nodes?.length || 0), 0);
  }

  // Métodos de edición in-place
  iniciarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  iniciarEdicionDesdeMenu(proceso: Proceso): void {
    this.procesoEditando.set(proceso.id);
    this.valoresEdicion.set({
      nombre: proceso.nombre,
      descripcion: proceso.descripcion,
      estado: proceso.estado
    });
  }

  estaEditando(procesoId: string): boolean {
    return this.procesoEditando() === procesoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  guardarEdicion(proceso: Proceso, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    console.log(`Guardando edición del proceso ${proceso.id}:`, valores);
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.procesoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(procesos: Proceso[]): void {
    this.procesosSeleccionados.set(procesos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.procesosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }
}
