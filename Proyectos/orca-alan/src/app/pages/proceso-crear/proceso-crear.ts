import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProcessService } from '../../services/process.service';

interface TipoProceso {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
}

interface KPI {
  id: string;
  nombre: string;
  valorObjetivo: number;
  unidad: string;
}

interface CeldaRiesgo {
  probabilidad: number;
  impacto: number;
  nivel: 'bajo' | 'medio' | 'alto' | 'critico';
}

@Component({
  selector: 'app-proceso-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './proceso-crear.html',
  styleUrl: './proceso-crear.scss'
})
export class ProcesoCrearComponent {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private processService = inject(ProcessService);

  // Paso actual del wizard
  pasoActual = signal(0);

  // Steps para el componente
  steps = [
    { label: 'Datos Básicos' },
    { label: 'Información' },
    { label: 'Apetito de Riesgo' },
    { label: 'KPIs' },
    { label: 'Resumen' }
  ];

  // Datos del formulario - Step 1
  nombre = signal('');
  descripcion = signal('');
  tipoSeleccionado = signal<string | null>(null);

  tiposProceso: TipoProceso[] = [
    { id: 'operativo', nombre: 'Operativo', icono: 'pi pi-cog', descripcion: 'Procesos del día a día' },
    { id: 'estrategico', nombre: 'Estratégico', icono: 'pi pi-chart-line', descripcion: 'Procesos de alto nivel' },
    { id: 'soporte', nombre: 'Soporte', icono: 'pi pi-wrench', descripcion: 'Procesos de apoyo' },
    { id: 'control', nombre: 'Control', icono: 'pi pi-shield', descripcion: 'Procesos de monitoreo' }
  ];

  // Datos del formulario - Step 2
  areaResponsable = signal('');
  fuenteDatos = signal('');
  categoria = signal('');
  propietario = signal('');

  areasOptions = [
    { label: 'TI', value: 'ti' },
    { label: 'Operaciones', value: 'operaciones' },
    { label: 'Finanzas', value: 'finanzas' },
    { label: 'Recursos Humanos', value: 'rrhh' },
    { label: 'Legal', value: 'legal' },
    { label: 'Cumplimiento', value: 'cumplimiento' }
  ];

  categoriasOptions = [
    { label: 'Core', value: 'core' },
    { label: 'Soporte', value: 'soporte' },
    { label: 'Gestión', value: 'gestion' }
  ];

  // Datos del formulario - Step 3 - Matriz de riesgo
  matrizRiesgo = signal<CeldaRiesgo[]>([]);
  toleranciaSeleccionada = signal<Set<string>>(new Set());

  // Labels para la matriz
  probabilidadLabels = ['Muy Baja', 'Baja', 'Media', 'Alta', 'Muy Alta'];
  impactoLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];

  // Datos del formulario - Step 4 - KPIs
  kpis = signal<KPI[]>([]);
  nuevoKpiNombre = signal('');
  nuevoKpiValor = signal<number | null>(null);
  nuevoKpiUnidad = signal('');

  unidadesOptions = [
    { label: '%', value: '%' },
    { label: 'Días', value: 'días' },
    { label: 'Horas', value: 'horas' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'USD', value: 'USD' }
  ];

  constructor() {
    this.inicializarMatriz();
  }

  inicializarMatriz(): void {
    const celdas: CeldaRiesgo[] = [];
    for (let p = 1; p <= 5; p++) {
      for (let i = 1; i <= 5; i++) {
        const score = p * i;
        let nivel: CeldaRiesgo['nivel'];
        if (score <= 4) nivel = 'bajo';
        else if (score <= 9) nivel = 'medio';
        else if (score <= 16) nivel = 'alto';
        else nivel = 'critico';
        celdas.push({ probabilidad: p, impacto: i, nivel });
      }
    }
    this.matrizRiesgo.set(celdas);
  }

  getCeldaNivel(prob: number, imp: number): string {
    const celda = this.matrizRiesgo().find(c => c.probabilidad === prob && c.impacto === imp);
    return celda?.nivel || 'bajo';
  }

  toggleCelda(prob: number, imp: number): void {
    const key = `${prob}-${imp}`;
    const current = new Set(this.toleranciaSeleccionada());
    if (current.has(key)) {
      current.delete(key);
    } else {
      current.add(key);
    }
    this.toleranciaSeleccionada.set(current);
  }

  isCeldaSeleccionada(prob: number, imp: number): boolean {
    return this.toleranciaSeleccionada().has(`${prob}-${imp}`);
  }

  // Navegación del wizard
  siguiente(): void {
    if (this.validarPasoActual()) {
      this.pasoActual.update(p => Math.min(p + 1, 4));
    }
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(p - 1, 0));
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual()) {
      case 0:
        if (!this.nombre().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
          return false;
        }
        if (!this.tipoSeleccionado()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Selecciona un tipo de proceso' });
          return false;
        }
        return true;
      case 1:
        return true; // Campos opcionales
      case 2:
        return true; // Matriz opcional
      case 3:
        return true; // KPIs opcionales
      default:
        return true;
    }
  }

  // KPIs
  agregarKPI(): void {
    if (!this.nuevoKpiNombre().trim() || this.nuevoKpiValor() === null) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Nombre y valor son requeridos' });
      return;
    }

    const nuevoKpi: KPI = {
      id: crypto.randomUUID(),
      nombre: this.nuevoKpiNombre(),
      valorObjetivo: this.nuevoKpiValor()!,
      unidad: this.nuevoKpiUnidad() || '%'
    };

    this.kpis.update(list => [...list, nuevoKpi]);
    this.nuevoKpiNombre.set('');
    this.nuevoKpiValor.set(null);
    this.nuevoKpiUnidad.set('');
  }

  eliminarKPI(id: string): void {
    this.kpis.update(list => list.filter(k => k.id !== id));
  }

  // Finalizar
  crearProceso(): void {
    const proceso = this.processService.createProceso(
      this.nombre(),
      this.descripcion()
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Proceso Creado',
      detail: `El proceso "${proceso.nombre}" fue creado exitosamente`
    });

    // Navegar al editor de nodos
    setTimeout(() => {
      this.router.navigate(['/procesos', proceso.id]);
    }, 500);
  }

  cancelar(): void {
    this.router.navigate(['/procesos']);
  }

  // Helper para obtener tipo seleccionado
  getTipoSeleccionado(): TipoProceso | undefined {
    return this.tiposProceso.find(t => t.id === this.tipoSeleccionado());
  }
}
