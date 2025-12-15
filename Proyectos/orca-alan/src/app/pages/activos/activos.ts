import { Component, inject, signal } from '@angular/core';
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
import { MenuItem } from 'primeng/api';
import { MockDataService } from '../../services/mock-data.service';
import { Activo, TipoActivo, Criticidad } from '../../models';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [
    FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, TooltipModule,
    TabsModule, MenuModule, ToolbarModule, CheckboxModule, MultiSelectModule, DrawerModule
  ],
  templateUrl: './activos.html',
  styleUrl: './activos.scss'
})
export class ActivosComponent {
  private mockData = inject(MockDataService);

  activos = this.mockData.activos;
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
      this.mockData.addActivo(activo);
      this.showDialog.set(false);
    }
  }

  viewDetail(activo: Activo): void {
    this.selectedActivo.set(activo);
    this.showDetailDialog.set(true);
  }

  getMenuItemsActivo(activo: Activo): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.viewDetail(activo) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => console.log('Editar', activo.id) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => console.log('Eliminar', activo.id) }
    ];
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
    console.log(`Guardando edición del activo ${activo.id}:`, valores);
    // Aquí iría la lógica para actualizar el activo
    this.activoEditando.set(null);
    this.valoresEdicion.set({});
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
