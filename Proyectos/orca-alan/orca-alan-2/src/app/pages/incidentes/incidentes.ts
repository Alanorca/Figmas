import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuItem } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { Incidente, Severidad, EstadoIncidente, Activo } from '../../models';

interface IncidenteConActivo extends Incidente {
  activoNombre: string;
}

@Component({
  selector: 'app-incidentes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, TimelineModule, MenuModule,
    ToolbarModule, CheckboxModule, DrawerModule, TooltipModule, IconFieldModule, InputIconModule
  ],
  templateUrl: './incidentes.html',
  styleUrl: './incidentes.scss'
})
export class IncidentesComponent implements OnInit {
  private api = inject(ApiService);

  activos = signal<Activo[]>([]);
  incidentesData = signal<any[]>([]);
  showDialog = signal(false);

  // Selección múltiple
  incidentesSeleccionados = signal<IncidenteConActivo[]>([]);

  // Edición in-place
  incidenteEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.api.getActivos().subscribe({
      next: (data) => this.activos.set(data),
      error: (err) => console.error('Error cargando activos:', err)
    });
    this.api.getIncidentes().subscribe({
      next: (data) => this.incidentesData.set(data),
      error: (err) => console.error('Error cargando incidentes:', err)
    });
  }

  incidentes = computed<IncidenteConActivo[]>(() => {
    return this.incidentesData().map(incidente => ({
      ...incidente,
      activoNombre: incidente.activo?.nombre || 'Sin activo'
    }));
  });

  // Computed properties for KPIs (arrow functions not allowed in templates)
  incidentesAbiertos = computed(() => this.incidentes().filter(i => i.estado === 'abierto').length);
  incidentesEnProceso = computed(() => this.incidentes().filter(i => i.estado === 'en_proceso').length);
  incidentesResueltos = computed(() => this.incidentes().filter(i => i.estado === 'resuelto').length);
  incidentesCerrados = computed(() => this.incidentes().filter(i => i.estado === 'cerrado').length);

  nuevoIncidente = signal({
    activoId: '',
    titulo: '',
    descripcion: '',
    severidad: 'media' as Severidad,
    estado: 'abierto' as EstadoIncidente,
    reportadoPor: ''
  });

  activosOptions = computed(() =>
    this.activos().map(a => ({ label: a.nombre, value: a.id }))
  );

  severidades = [
    { label: 'Critica', value: 'critica' },
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  estados = [
    { label: 'Abierto', value: 'abierto' },
    { label: 'En Proceso', value: 'en_proceso' },
    { label: 'Resuelto', value: 'resuelto' },
    { label: 'Cerrado', value: 'cerrado' }
  ];

  getSeveridadSeverity(severidad: string): 'danger' | 'warn' | 'success' | 'info' {
    switch (severidad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      default: return 'success';
    }
  }

  getEstadoSeverity(estado: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (estado) {
      case 'abierto': return 'danger';
      case 'en_proceso': return 'warn';
      case 'resuelto': return 'success';
      case 'cerrado': return 'secondary';
      default: return 'info';
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'abierto': return 'pi pi-exclamation-circle';
      case 'en_proceso': return 'pi pi-spin pi-spinner';
      case 'resuelto': return 'pi pi-check-circle';
      case 'cerrado': return 'pi pi-lock';
      default: return 'pi pi-question-circle';
    }
  }

  openNewDialog(): void {
    this.nuevoIncidente.set({
      activoId: '',
      titulo: '',
      descripcion: '',
      severidad: 'media',
      estado: 'abierto',
      reportadoPor: ''
    });
    this.showDialog.set(true);
  }

  saveIncidente(): void {
    const incidente = this.nuevoIncidente();
    if (incidente.activoId && incidente.titulo && incidente.reportadoPor) {
      this.api.createIncidente({
        activoId: incidente.activoId,
        titulo: incidente.titulo,
        descripcion: incidente.descripcion,
        severidad: incidente.severidad,
        estado: incidente.estado,
        reportadoPor: incidente.reportadoPor
      }).subscribe({
        next: () => {
          this.cargarDatos();
          this.showDialog.set(false);
        },
        error: (err) => console.error('Error creando incidente:', err)
      });
    }
  }

  eliminarIncidente(incidente: IncidenteConActivo): void {
    this.api.deleteIncidente(incidente.id).subscribe({
      next: () => this.cargarDatos(),
      error: (err) => console.error('Error eliminando incidente:', err)
    });
  }

  getMenuItemsIncidente(incidente: IncidenteConActivo): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => console.log('Ver', incidente.id) },
      { label: 'Edición rápida', icon: 'pi pi-pencil', command: () => this.iniciarEdicionDesdeMenu(incidente) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarIncidente(incidente) }
    ];
  }

  iniciarEdicionDesdeMenu(incidente: IncidenteConActivo): void {
    this.incidenteEditando.set(incidente.id);
    this.valoresEdicion.set({
      titulo: incidente.titulo,
      descripcion: incidente.descripcion,
      severidad: incidente.severidad,
      estado: incidente.estado,
      reportadoPor: incidente.reportadoPor
    });
  }

  getIncidentesCriticos(): number {
    return this.incidentes().filter(i => i.severidad === 'critica').length;
  }

  // Métodos de edición in-place
  iniciarEdicion(incidente: IncidenteConActivo, event: Event): void {
    event.stopPropagation();
    this.incidenteEditando.set(incidente.id);
    this.valoresEdicion.set({
      titulo: incidente.titulo,
      descripcion: incidente.descripcion,
      severidad: incidente.severidad,
      estado: incidente.estado,
      reportadoPor: incidente.reportadoPor
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

  guardarEdicion(incidente: IncidenteConActivo, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    this.api.updateIncidente(incidente.id, valores).subscribe({
      next: () => {
        this.cargarDatos();
        this.incidenteEditando.set(null);
        this.valoresEdicion.set({});
      },
      error: (err) => console.error('Error actualizando incidente:', err)
    });
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.incidenteEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(incidentes: IncidenteConActivo[]): void {
    this.incidentesSeleccionados.set(incidentes);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.incidentesSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }
}
