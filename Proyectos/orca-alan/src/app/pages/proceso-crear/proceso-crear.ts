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

interface UmbralKPI {
  deficiente: { min: number; max: number };
  aceptable: { min: number; max: number };
  bueno: { min: number; max: number };
  sobresaliente: { min: number; max: number };
}

interface KPI {
  id: string;
  nombre: string;
  unidad: string;
  valorInicial: number;
  valorMeta: number;
  umbrales: UmbralKPI;
}

interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  progresoMeta: number;
  kpis: KPI[];
  expanded: boolean;
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
    { label: 'Objetivos' },
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

  // Datos del formulario - Step 4 - Objetivos y KPIs
  objetivos = signal<Objetivo[]>([]);

  // Para agregar/editar objetivos
  objetivoEditando = signal<Objetivo | null>(null);
  mostrarFormObjetivo = signal(false);
  nuevoObjetivoNombre = signal('');
  nuevoObjetivoDescripcion = signal('');
  nuevoObjetivoFechaLimite = signal('');
  nuevoObjetivoProgresoMeta = signal<number>(100);

  // Para agregar/editar KPIs
  objetivoParaKPI = signal<string | null>(null);
  mostrarFormKPI = signal(false);
  kpiEditando = signal<KPI | null>(null);
  nuevoKpiNombre = signal('');
  nuevoKpiUnidad = signal('%');
  nuevoKpiValorInicial = signal<number>(0);
  nuevoKpiValorMeta = signal<number>(100);
  // Umbrales
  umbralDeficienteMin = signal<number>(0);
  umbralDeficienteMax = signal<number>(25);
  umbralAceptableMin = signal<number>(26);
  umbralAceptableMax = signal<number>(50);
  umbralBuenoMin = signal<number>(51);
  umbralBuenoMax = signal<number>(75);
  umbralSobresalienteMin = signal<number>(76);
  umbralSobresalienteMax = signal<number>(100);

  unidadesOptions = [
    { label: '%', value: '%' },
    { label: 'Días', value: 'días' },
    { label: 'Horas', value: 'horas' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'USD', value: 'USD' },
    { label: 'Puntos', value: 'puntos' }
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

  // ========== OBJETIVOS ==========

  abrirFormObjetivo(objetivo?: Objetivo): void {
    if (objetivo) {
      this.objetivoEditando.set(objetivo);
      this.nuevoObjetivoNombre.set(objetivo.nombre);
      this.nuevoObjetivoDescripcion.set(objetivo.descripcion);
      this.nuevoObjetivoFechaLimite.set(objetivo.fechaLimite);
      this.nuevoObjetivoProgresoMeta.set(objetivo.progresoMeta);
    } else {
      this.objetivoEditando.set(null);
      this.nuevoObjetivoNombre.set('');
      this.nuevoObjetivoDescripcion.set('');
      this.nuevoObjetivoFechaLimite.set('');
      this.nuevoObjetivoProgresoMeta.set(100);
    }
    this.mostrarFormObjetivo.set(true);
  }

  cerrarFormObjetivo(): void {
    this.mostrarFormObjetivo.set(false);
    this.objetivoEditando.set(null);
  }

  guardarObjetivo(): void {
    if (!this.nuevoObjetivoNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del objetivo es requerido' });
      return;
    }

    if (this.objetivoEditando()) {
      // Editar existente
      this.objetivos.update(list =>
        list.map(o =>
          o.id === this.objetivoEditando()!.id
            ? {
                ...o,
                nombre: this.nuevoObjetivoNombre(),
                descripcion: this.nuevoObjetivoDescripcion(),
                fechaLimite: this.nuevoObjetivoFechaLimite(),
                progresoMeta: this.nuevoObjetivoProgresoMeta()
              }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Objetivo actualizado correctamente' });
    } else {
      // Crear nuevo
      const nuevoObjetivo: Objetivo = {
        id: crypto.randomUUID(),
        nombre: this.nuevoObjetivoNombre(),
        descripcion: this.nuevoObjetivoDescripcion(),
        fechaLimite: this.nuevoObjetivoFechaLimite(),
        progresoMeta: this.nuevoObjetivoProgresoMeta(),
        kpis: [],
        expanded: true
      };
      this.objetivos.update(list => [...list, nuevoObjetivo]);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Objetivo agregado correctamente' });
    }

    this.cerrarFormObjetivo();
  }

  eliminarObjetivo(id: string): void {
    this.objetivos.update(list => list.filter(o => o.id !== id));
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Objetivo eliminado' });
  }

  toggleObjetivo(id: string): void {
    this.objetivos.update(list =>
      list.map(o => (o.id === id ? { ...o, expanded: !o.expanded } : o))
    );
  }

  moverObjetivo(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.objetivos().length) return;

    this.objetivos.update(list => {
      const newList = [...list];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
      return newList;
    });
  }

  // ========== KPIs ==========

  abrirFormKPI(objetivoId: string, kpi?: KPI): void {
    this.objetivoParaKPI.set(objetivoId);

    if (kpi) {
      this.kpiEditando.set(kpi);
      this.nuevoKpiNombre.set(kpi.nombre);
      this.nuevoKpiUnidad.set(kpi.unidad);
      this.nuevoKpiValorInicial.set(kpi.valorInicial);
      this.nuevoKpiValorMeta.set(kpi.valorMeta);
      this.umbralDeficienteMin.set(kpi.umbrales.deficiente.min);
      this.umbralDeficienteMax.set(kpi.umbrales.deficiente.max);
      this.umbralAceptableMin.set(kpi.umbrales.aceptable.min);
      this.umbralAceptableMax.set(kpi.umbrales.aceptable.max);
      this.umbralBuenoMin.set(kpi.umbrales.bueno.min);
      this.umbralBuenoMax.set(kpi.umbrales.bueno.max);
      this.umbralSobresalienteMin.set(kpi.umbrales.sobresaliente.min);
      this.umbralSobresalienteMax.set(kpi.umbrales.sobresaliente.max);
    } else {
      this.kpiEditando.set(null);
      this.nuevoKpiNombre.set('');
      this.nuevoKpiUnidad.set('%');
      this.nuevoKpiValorInicial.set(0);
      this.nuevoKpiValorMeta.set(100);
      this.umbralDeficienteMin.set(0);
      this.umbralDeficienteMax.set(25);
      this.umbralAceptableMin.set(26);
      this.umbralAceptableMax.set(50);
      this.umbralBuenoMin.set(51);
      this.umbralBuenoMax.set(75);
      this.umbralSobresalienteMin.set(76);
      this.umbralSobresalienteMax.set(100);
    }

    this.mostrarFormKPI.set(true);
  }

  cerrarFormKPI(): void {
    this.mostrarFormKPI.set(false);
    this.kpiEditando.set(null);
    this.objetivoParaKPI.set(null);
  }

  guardarKPI(): void {
    if (!this.nuevoKpiNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del KPI es requerido' });
      return;
    }

    const objetivoId = this.objetivoParaKPI();
    if (!objetivoId) return;

    const nuevoKpi: KPI = {
      id: this.kpiEditando()?.id || crypto.randomUUID(),
      nombre: this.nuevoKpiNombre(),
      unidad: this.nuevoKpiUnidad(),
      valorInicial: this.nuevoKpiValorInicial(),
      valorMeta: this.nuevoKpiValorMeta(),
      umbrales: {
        deficiente: { min: this.umbralDeficienteMin(), max: this.umbralDeficienteMax() },
        aceptable: { min: this.umbralAceptableMin(), max: this.umbralAceptableMax() },
        bueno: { min: this.umbralBuenoMin(), max: this.umbralBuenoMax() },
        sobresaliente: { min: this.umbralSobresalienteMin(), max: this.umbralSobresalienteMax() }
      }
    };

    if (this.kpiEditando()) {
      // Editar existente
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: o.kpis.map(k => (k.id === nuevoKpi.id ? nuevoKpi : k)) }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'KPI actualizado correctamente' });
    } else {
      // Agregar nuevo
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId ? { ...o, kpis: [...o.kpis, nuevoKpi] } : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'KPI agregado correctamente' });
    }

    this.cerrarFormKPI();
  }

  eliminarKPI(objetivoId: string, kpiId: string): void {
    this.objetivos.update(list =>
      list.map(o =>
        o.id === objetivoId ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) } : o
      )
    );
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  getTotalKPIs(): number {
    return this.objetivos().reduce((total, obj) => total + obj.kpis.length, 0);
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
