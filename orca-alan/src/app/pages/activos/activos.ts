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
import { MockDataService } from '../../services/mock-data.service';
import { Activo, TipoActivo, Criticidad } from '../../models';

@Component({
  selector: 'app-activos',
  standalone: true,
  imports: [
    FormsModule, TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, SelectModule, TextareaModule, TagModule, TooltipModule, TabsModule
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
}
