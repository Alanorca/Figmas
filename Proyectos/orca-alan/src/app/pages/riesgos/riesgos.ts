import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { SliderModule } from 'primeng/slider';
import { MenuModule } from 'primeng/menu';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { DrawerModule } from 'primeng/drawer';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { MockDataService } from '../../services/mock-data.service';
import { Riesgo, EstadoRiesgo } from '../../models';

interface RiesgoConActivo extends Riesgo {
  activoNombre: string;
}

@Component({
  selector: 'app-riesgos',
  standalone: true,
  imports: [
    DecimalPipe, FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, SliderModule, MenuModule,
    ToolbarModule, CheckboxModule, DrawerModule, TooltipModule
  ],
  templateUrl: './riesgos.html',
  styleUrl: './riesgos.scss'
})
export class RiesgosComponent {
  private mockData = inject(MockDataService);

  activos = this.mockData.activos;
  showDialog = signal(false);

  // Selección múltiple
  riesgosSeleccionados = signal<RiesgoConActivo[]>([]);

  // Edición in-place
  riesgoEditando = signal<string | null>(null);
  valoresEdicion = signal<Record<string, any>>({});

  // Drawer de acciones masivas
  showAccionesMasivasDrawer = signal(false);

  riesgos = computed<RiesgoConActivo[]>(() => {
    return this.activos().flatMap(activo =>
      activo.riesgos.map(riesgo => ({
        ...riesgo,
        activoNombre: activo.nombre
      }))
    );
  });

  // Computed properties for KPIs (arrow functions not allowed in templates)
  riesgosCriticos = computed(() => this.riesgos().filter(r => this.getNivelRiesgo(r.probabilidad, r.impacto) >= 15).length);
  riesgosAltos = computed(() => this.riesgos().filter(r => {
    const nivel = this.getNivelRiesgo(r.probabilidad, r.impacto);
    return nivel >= 10 && nivel < 15;
  }).length);
  riesgosControlados = computed(() => this.riesgos().filter(r => r.estado === 'mitigado' || r.estado === 'aceptado').length);

  nuevoRiesgo = signal({
    activoId: '',
    descripcion: '',
    probabilidad: 3 as 1 | 2 | 3 | 4 | 5,
    impacto: 3 as 1 | 2 | 3 | 4 | 5,
    estado: 'identificado' as EstadoRiesgo,
    responsable: ''
  });

  activosOptions = computed(() =>
    this.activos().map(a => ({ label: a.nombre, value: a.id }))
  );

  estadosRiesgo = [
    { label: 'Identificado', value: 'identificado' },
    { label: 'Evaluado', value: 'evaluado' },
    { label: 'Mitigado', value: 'mitigado' },
    { label: 'Aceptado', value: 'aceptado' }
  ];

  getNivelRiesgo(probabilidad: number, impacto: number): number {
    return probabilidad * impacto;
  }

  getNivelSeverity(nivel: number): 'danger' | 'warn' | 'success' | 'info' {
    if (nivel >= 15) return 'danger';
    if (nivel >= 10) return 'warn';
    if (nivel >= 5) return 'info';
    return 'success';
  }

  getNivelLabel(nivel: number): string {
    if (nivel >= 15) return 'Critico';
    if (nivel >= 10) return 'Alto';
    if (nivel >= 5) return 'Medio';
    return 'Bajo';
  }

  getEstadoSeverity(estado: string): 'danger' | 'warn' | 'success' | 'info' | 'secondary' {
    switch (estado) {
      case 'identificado': return 'danger';
      case 'evaluado': return 'warn';
      case 'mitigado': return 'success';
      case 'aceptado': return 'info';
      default: return 'secondary';
    }
  }

  openNewDialog(): void {
    this.nuevoRiesgo.set({
      activoId: '',
      descripcion: '',
      probabilidad: 3,
      impacto: 3,
      estado: 'identificado',
      responsable: ''
    });
    this.showDialog.set(true);
  }

  saveRiesgo(): void {
    const riesgo = this.nuevoRiesgo();
    if (riesgo.activoId && riesgo.descripcion && riesgo.responsable) {
      this.mockData.addRiesgo(riesgo.activoId, {
        descripcion: riesgo.descripcion,
        probabilidad: riesgo.probabilidad,
        impacto: riesgo.impacto,
        estado: riesgo.estado,
        responsable: riesgo.responsable
      });
      this.showDialog.set(false);
    }
  }

  getMenuItemsRiesgo(riesgo: RiesgoConActivo): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => console.log('Ver', riesgo.id) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => console.log('Editar', riesgo.id) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => console.log('Eliminar', riesgo.id) }
    ];
  }

  getPromedioNivel(): number {
    const riesgos = this.riesgos();
    if (riesgos.length === 0) return 0;
    const suma = riesgos.reduce((total, r) => total + this.getNivelRiesgo(r.probabilidad, r.impacto), 0);
    return suma / riesgos.length;
  }

  // Métodos de edición in-place
  iniciarEdicion(riesgo: RiesgoConActivo, event: Event): void {
    event.stopPropagation();
    this.riesgoEditando.set(riesgo.id);
    this.valoresEdicion.set({
      descripcion: riesgo.descripcion,
      probabilidad: riesgo.probabilidad,
      impacto: riesgo.impacto,
      estado: riesgo.estado,
      responsable: riesgo.responsable
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

  guardarEdicion(riesgo: RiesgoConActivo, event: Event): void {
    event.stopPropagation();
    const valores = this.valoresEdicion();
    console.log(`Guardando edición del riesgo ${riesgo.id}:`, valores);
    this.riesgoEditando.set(null);
    this.valoresEdicion.set({});
  }

  cancelarEdicion(event: Event): void {
    event.stopPropagation();
    this.riesgoEditando.set(null);
    this.valoresEdicion.set({});
  }

  // Métodos de selección
  onSelectionChange(riesgos: RiesgoConActivo[]): void {
    this.riesgosSeleccionados.set(riesgos);
  }

  abrirAccionesMasivasDrawer(): void {
    this.showAccionesMasivasDrawer.set(true);
  }

  aplicarAccionesMasivas(): void {
    console.log('Aplicando acciones masivas a:', this.riesgosSeleccionados());
    this.showAccionesMasivasDrawer.set(false);
  }
}
