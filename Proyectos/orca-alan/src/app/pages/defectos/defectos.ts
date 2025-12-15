import { Component, inject, signal, computed } from '@angular/core';
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
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MockDataService } from '../../services/mock-data.service';
import { Defecto, TipoDefecto, Severidad, EstadoDefecto } from '../../models';

interface DefectoConActivo extends Defecto {
  activoNombre: string;
}

@Component({
  selector: 'app-defectos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, MenuModule, ToolbarModule,
    CheckboxModule, DrawerModule, TooltipModule
  ],
  templateUrl: './defectos.html',
  styleUrl: './defectos.scss'
})
export class DefectosComponent {
  private mockData = inject(MockDataService);

  activos = this.mockData.activos;
  showDialog = signal(false);

  // Selección múltiple
  defectosSeleccionados = signal<DefectoConActivo[]>([]);

  // Edición in-place
  defectoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  defectos = computed<DefectoConActivo[]>(() => {
    return this.activos().flatMap(activo =>
      activo.defectos.map(defecto => ({
        ...defecto,
        activoNombre: activo.nombre
      }))
    );
  });

  // Computed properties for KPIs (arrow functions not allowed in templates)
  defectosFuncionales = computed(() => this.defectos().filter(d => d.tipo === 'funcional').length);
  defectosSeguridad = computed(() => this.defectos().filter(d => d.tipo === 'seguridad').length);
  defectosRendimiento = computed(() => this.defectos().filter(d => d.tipo === 'rendimiento').length);
  defectosUsabilidad = computed(() => this.defectos().filter(d => d.tipo === 'usabilidad').length);

  nuevoDefecto = signal({
    activoId: '',
    titulo: '',
    descripcion: '',
    tipo: 'funcional' as TipoDefecto,
    prioridad: 'media' as Severidad,
    estado: 'nuevo' as EstadoDefecto,
    detectadoPor: ''
  });

  activosOptions = computed(() =>
    this.activos().map(a => ({ label: a.nombre, value: a.id }))
  );

  tiposDefecto = [
    { label: 'Funcional', value: 'funcional' },
    { label: 'Seguridad', value: 'seguridad' },
    { label: 'Rendimiento', value: 'rendimiento' },
    { label: 'Usabilidad', value: 'usabilidad' }
  ];

  prioridades = [
    { label: 'Critica', value: 'critica' },
    { label: 'Alta', value: 'alta' },
    { label: 'Media', value: 'media' },
    { label: 'Baja', value: 'baja' }
  ];

  estados = [
    { label: 'Nuevo', value: 'nuevo' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'En Correccion', value: 'en_correccion' },
    { label: 'Corregido', value: 'corregido' },
    { label: 'Verificado', value: 'verificado' }
  ];

  getPrioridadSeverity(prioridad: string): 'danger' | 'warn' | 'success' | 'info' {
    switch (prioridad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      default: return 'success';
    }
  }

  getEstadoSeverity(estado: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (estado) {
      case 'nuevo': return 'danger';
      case 'confirmado': return 'warn';
      case 'en_correccion': return 'info';
      case 'corregido': return 'success';
      case 'verificado': return 'secondary';
      default: return 'info';
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'funcional': return 'build';
      case 'seguridad': return 'security';
      case 'rendimiento': return 'speed';
      case 'usabilidad': return 'touch_app';
      default: return 'bug_report';
    }
  }

  openNewDialog(): void {
    this.nuevoDefecto.set({
      activoId: '',
      titulo: '',
      descripcion: '',
      tipo: 'funcional',
      prioridad: 'media',
      estado: 'nuevo',
      detectadoPor: ''
    });
    this.showDialog.set(true);
  }

  saveDefecto(): void {
    const defecto = this.nuevoDefecto();
    if (defecto.activoId && defecto.titulo && defecto.detectadoPor) {
      this.mockData.addDefecto(defecto.activoId, {
        titulo: defecto.titulo,
        descripcion: defecto.descripcion,
        tipo: defecto.tipo,
        prioridad: defecto.prioridad,
        estado: defecto.estado,
        detectadoPor: defecto.detectadoPor
      });
      this.showDialog.set(false);
    }
  }

  getMenuItemsDefecto(defecto: DefectoConActivo): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => console.log('Ver', defecto.id) },
      { label: 'Edición rápida', icon: 'pi pi-pencil', command: () => this.iniciarEdicionDesdeMenu(defecto) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => console.log('Eliminar', defecto.id) }
    ];
  }

  iniciarEdicionDesdeMenu(defecto: DefectoConActivo): void {
    this.defectoEditando.set(defecto.id);
    this.valoresEdicion.set({
      titulo: defecto.titulo,
      descripcion: defecto.descripcion,
      tipo: defecto.tipo,
      prioridad: defecto.prioridad,
      estado: defecto.estado,
      detectadoPor: defecto.detectadoPor
    });
  }

  getDefectosResueltos(): number {
    return this.defectos().filter(d => d.estado === 'corregido' || d.estado === 'verificado').length;
  }

  // Métodos de edición in-place
  iniciarEdicion(defecto: DefectoConActivo, event: Event): void {
    event.stopPropagation();
    this.defectoEditando.set(defecto.id);
    this.valoresEdicion.set({
      titulo: defecto.titulo,
      descripcion: defecto.descripcion,
      tipo: defecto.tipo,
      prioridad: defecto.prioridad,
      estado: defecto.estado,
      detectadoPor: defecto.detectadoPor
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

  guardarEdicion(defecto: DefectoConActivo, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    console.log(`Guardando edición del defecto ${defecto.id}:`, valores);
    this.defectoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.defectoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(defectos: DefectoConActivo[]): void {
    this.defectosSeleccionados.set(defectos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.defectosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }
}
