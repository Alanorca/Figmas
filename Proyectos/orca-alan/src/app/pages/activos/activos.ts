import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MenuItem } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { Activo, TipoActivo, Criticidad } from '../../models';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [
    FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, TooltipModule,
    TabsModule, MenuModule, ToolbarModule, CheckboxModule, MultiSelectModule,
    DrawerModule, IconFieldModule, InputIconModule
  ],
  templateUrl: './activos.html',
  styleUrl: './activos.scss'
})
export class ActivosComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  activos = signal<Activo[]>([]);

  ngOnInit(): void {
    this.cargarActivos();
  }

  cargarActivos(): void {
    this.api.getActivos().subscribe({
      next: (data) => this.activos.set(data),
      error: (err) => console.error('Error cargando activos:', err)
    });
  }
  showDialog = signal(false);
  showDetailDialog = signal(false);
  selectedActivo = signal<Activo | null>(null);

  // Selección múltiple
  activosSeleccionados = signal<Activo[]>([]);

  // Edición in-place
  activoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  nuevoActivo = signal({
    nombre: '',
    descripcion: '',
    tipo: 'software' as TipoActivo,
    criticidad: 'media' as Criticidad,
    responsable: '',
    departamento: ''
  });

  tiposActivo = [
    { label: 'Hardware', value: 'hardware' },
    { label: 'Software', value: 'software' },
    { label: 'Datos', value: 'datos' },
    { label: 'Personas', value: 'personas' },
    { label: 'Instalaciones', value: 'instalaciones' }
  ];

  criticidades = [
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  getCriticidadSeverity(criticidad: string): 'danger' | 'warn' | 'success' {
    switch (criticidad) {
      case 'alta': return 'danger';
      case 'media': return 'warn';
      default: return 'success';
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'hardware': return 'memory';
      case 'software': return 'code';
      case 'datos': return 'storage';
      case 'personas': return 'people';
      case 'instalaciones': return 'business';
      default: return 'help';
    }
  }

  openNewDialog(): void {
    this.nuevoActivo.set({
      nombre: '',
      descripcion: '',
      tipo: 'software',
      criticidad: 'media',
      responsable: '',
      departamento: ''
    });
    this.showDialog.set(true);
  }

  saveActivo(): void {
    const activo = this.nuevoActivo();
    if (activo.nombre && activo.responsable && activo.departamento) {
      this.api.createActivo(activo).subscribe({
        next: () => {
          this.cargarActivos();
          this.showDialog.set(false);
        },
        error: (err) => console.error('Error creando activo:', err)
      });
    }
  }

  viewDetail(activo: Activo): void {
    this.selectedActivo.set(activo);
    this.showDetailDialog.set(true);
  }

  navigateToDetail(activo: Activo): void {
    this.router.navigate(['/activos', activo.id, 'detalle']);
  }

  getMenuItemsActivo(activo: Activo): MenuItem[] {
    return [
      { label: 'Ver detalle completo', icon: 'pi pi-external-link', command: () => this.navigateToDetail(activo) },
      { label: 'Ver resumen', icon: 'pi pi-eye', command: () => this.viewDetail(activo) },
      { label: 'Edicion rapida', icon: 'pi pi-pencil', command: () => this.iniciarEdicionDesdeMenu(activo) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarActivo(activo) }
    ];
  }

  iniciarEdicionDesdeMenu(activo: Activo): void {
    this.activoEditando.set(activo.id);
    this.valoresEdicion.set({
      nombre: activo.nombre,
      descripcion: activo.descripcion,
      tipo: activo.tipo,
      criticidad: activo.criticidad,
      responsable: activo.responsable,
      departamento: activo.departamento
    });
  }

  // Métodos para el resumen del footer
  getCountByCriticidad(criticidad: string): number {
    return this.activos().filter(a => a.criticidad === criticidad).length;
  }

  getTotalRiesgos(): number {
    return this.activos().reduce((total, a) => total + a.riesgos.length, 0);
  }

  getTotalIncidentes(): number {
    return this.activos().reduce((total, a) => total + a.incidentes.length, 0);
  }

  getTotalDefectos(): number {
    return this.activos().reduce((total, a) => total + a.defectos.length, 0);
  }

  // Métodos de edición in-place
  iniciarEdicion(activo: Activo, event: Event): void {
    event.stopPropagation();
    this.activoEditando.set(activo.id);
    this.valoresEdicion.set({
      nombre: activo.nombre,
      descripcion: activo.descripcion,
      tipo: activo.tipo,
      criticidad: activo.criticidad,
      responsable: activo.responsable,
      departamento: activo.departamento
    });
  }

  estaEditando(activoId: string): boolean {
    return this.activoEditando() === activoId;
  }

  getValorEdicion(campo: string): any {
    return this.valoresEdicion()[campo];
  }

  setValorEdicion(campo: string, valor: any): void {
    this.valoresEdicion.update(v => ({ ...v, [campo]: valor }));
  }

  guardarEdicion(activo: Activo, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    this.api.updateActivo(activo.id, valores).subscribe({
      next: () => {
        this.cargarActivos();
        this.activoEditando.set(null);
        this.valoresEdicion.set({});
      },
      error: (err) => console.error('Error actualizando activo:', err)
    });
  }

  eliminarActivo(activo: Activo): void {
    this.api.deleteActivo(activo.id).subscribe({
      next: () => this.cargarActivos(),
      error: (err) => console.error('Error eliminando activo:', err)
    });
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.activoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(activos: Activo[]): void {
    this.activosSeleccionados.set(activos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.activosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }
}
