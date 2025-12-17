import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProcessService } from '../../services/process.service';

// Interfaces
interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: KPI[];
}

interface KPI {
  id: string;
  nombre: string;
  meta: number;
  escala: string;
}

interface ApetitoCelda {
  probabilidad: number;
  impacto: number;
}

@Component({
  selector: 'app-proceso-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
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

  // Paso actual del wizard (0-3)
  pasoActual = signal(0);

  // Steps del wizard
  steps = [
    {
      icon: 'pi pi-info-circle',
      label: 'Información Básica',
      descripcion: 'Ingresa los datos básicos del proceso para realizar el registro'
    },
    {
      icon: 'pi pi-key',
      label: 'Apetito de riesgo',
      descripcion: 'Define o crea el apetito de riesgo para poderlo monitorear'
    },
    {
      icon: 'pi pi-bullseye',
      label: 'Objetivos y KPIS',
      descripcion: 'Registre objetivos y KPIS de acuerdo a tu proceso'
    },
    {
      icon: 'pi pi-list',
      label: 'Revisión',
      descripcion: 'Revisa toda la información y confirma antes de guardar el proceso'
    }
  ];

  // ========== PASO 1: Información Básica ==========
  nombreProceso = signal('');
  tipoProceso = signal<'estrategico' | 'operativo' | ''>('');
  descripcionProceso = signal('');

  tiposProcesoOptions = [
    { label: 'Estratégico', value: 'estrategico' },
    { label: 'Operativo', value: 'operativo' }
  ];

  // ========== PASO 2: Apetito de Riesgo ==========
  modoApetito = signal<'seleccionar' | 'crear'>('crear');

  // Inputs para la matriz - definen el TAMAÑO del mapa
  probabilidadInput = signal<number>(5);
  impactoInput = signal<number>(5);
  apetitoRiesgo = signal<number>(20);

  // Celda seleccionada en la matriz
  celdaSeleccionada = signal<ApetitoCelda | null>(null);

  // Arrays dinámicos para la matriz
  getProbabilidadArray(): number[] {
    const max = this.probabilidadInput();
    return Array.from({ length: max }, (_, i) => max - i);
  }

  getImpactoArray(): number[] {
    const max = this.impactoInput();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  // Labels de la matriz
  probabilidadLabels = ['Raro', 'Poco probable', 'Posible', 'Probable', 'Seguro'];
  impactoLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];

  // ========== PASO 3: Objetivos y KPIs ==========
  modoObjetivos = signal<'seleccionar' | 'crear'>('seleccionar');
  objetivos = signal<Objetivo[]>([]);

  // Objetivos existentes para seleccionar (mock)
  objetivosExistentes = signal<Objetivo[]>([
    {
      id: 'OBJ-001',
      nombre: 'Reducir riesgos operacionales',
      descripcion: 'Evaluación de riesgos financieros, desarrollo de estrategias de mitigación, coordinación de auditorías y fortalecimiento de controles internos.',
      tipo: 'estrategico',
      progreso: 50,
      kpis: [
        { id: 'KPI-001', nombre: 'Reducir riesgos operacionales', meta: 75, escala: 'Porcentaje' }
      ]
    }
  ]);

  // Form inline para nuevo objetivo
  mostrarFormObjetivoInline = signal(false);
  objetivoEditandoId = signal<string | null>(null);
  nuevoObjetivoNombre = signal('');
  nuevoObjetivoDescripcion = signal('');
  nuevoObjetivoTipo = signal<'estrategico' | 'operativo'>('estrategico');

  // Form inline para nuevo KPI
  mostrarFormKPIInline = signal<string | null>(null); // ID del objetivo donde mostrar el form
  kpiEditandoId = signal<string | null>(null);
  nuevoKPINombre = signal('');
  nuevoKPIMeta = signal<number>(75);
  nuevoKPIEscala = signal('Porcentaje');

  // Estado de colapso de objetivos (por ID)
  objetivosColapsados = signal<Set<string>>(new Set());

  escalasOptions = [
    { label: 'Porcentaje', value: 'Porcentaje' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Días', value: 'Días' },
    { label: 'Horas', value: 'Horas' },
    { label: 'USD', value: 'USD' }
  ];

  // Computed: Total de KPIs
  totalKPIs = computed(() => {
    return this.objetivos().reduce((total, obj) => total + obj.kpis.length, 0);
  });

  // ========== Navegación ==========
  siguiente(): void {
    if (this.validarPasoActual()) {
      this.pasoActual.update(p => Math.min(p + 1, 3));
    }
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(p - 1, 0));
  }

  irAPaso(paso: number): void {
    // Solo permitir ir a pasos anteriores o al actual
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual()) {
      case 0: // Información Básica
        if (!this.nombreProceso().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del proceso es requerido' });
          return false;
        }
        if (!this.tipoProceso()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Selecciona un tipo de proceso' });
          return false;
        }
        if (!this.descripcionProceso().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'La descripción es requerida' });
          return false;
        }
        return true;
      case 1: // Apetito de Riesgo
        return true; // Opcional
      case 2: // Objetivos y KPIs
        return true; // Opcional
      default:
        return true;
    }
  }

  // ========== Matriz de Riesgo ==========
  generarCelda(): void {
    const prob = this.probabilidadInput();
    const imp = this.impactoInput();

    // Mapear valores 1-10 a celdas 1-5
    const probCelda = Math.ceil(prob / 2);
    const impCelda = Math.ceil(imp / 2);

    this.celdaSeleccionada.set({
      probabilidad: probCelda,
      impacto: impCelda
    });
  }

  getCeldaNivel(prob: number, imp: number): string {
    const score = prob * imp;
    if (score <= 4) return 'bajo';
    if (score <= 9) return 'medio';
    if (score <= 16) return 'alto';
    return 'critico';
  }

  isCeldaSeleccionada(prob: number, imp: number): boolean {
    const celda = this.celdaSeleccionada();
    return celda?.probabilidad === prob && celda?.impacto === imp;
  }

  // ========== Matriz de Riesgo Dinámica con Apetito ==========

  // Seleccionar celda directamente desde el mapa
  seleccionarCeldaDirecta(prob: number, imp: number): void {
    this.celdaSeleccionada.set({
      probabilidad: prob,
      impacto: imp
    });
  }

  // Actualizar probabilidad (tamaño del eje Y)
  actualizarProbabilidad(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.probabilidadInput.set(v);
    // Limpiar selección si queda fuera del nuevo rango
    const celda = this.celdaSeleccionada();
    if (celda && celda.probabilidad > v) {
      this.celdaSeleccionada.set(null);
    }
  }

  // Actualizar impacto (tamaño del eje X)
  actualizarImpacto(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.impactoInput.set(v);
    // Limpiar selección si queda fuera del nuevo rango
    const celda = this.celdaSeleccionada();
    if (celda && celda.impacto > v) {
      this.celdaSeleccionada.set(null);
    }
  }

  // Nivel dinámico basado en el tamaño actual de la matriz
  getCeldaNivelDinamico(prob: number, imp: number): string {
    const maxProb = this.probabilidadInput();
    const maxImp = this.impactoInput();
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentaje = (score / maxScore) * 100;

    if (porcentaje <= 16) return 'bajo';
    if (porcentaje <= 36) return 'medio';
    if (porcentaje <= 64) return 'alto';
    return 'critico';
  }

  // Celda seleccionada dinámica
  isCeldaSeleccionadaDinamica(prob: number, imp: number): boolean {
    const celda = this.celdaSeleccionada();
    return celda?.probabilidad === prob && celda?.impacto === imp;
  }

  // Determinar si una celda está dentro del apetito de riesgo (dinámico)
  estaDentroApetitoDinamico(prob: number, imp: number): boolean {
    const maxProb = this.probabilidadInput();
    const maxImp = this.impactoInput();
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentajeRiesgo = (score / maxScore) * 100;
    return porcentajeRiesgo <= this.apetitoRiesgo();
  }

  // ========== Objetivos (Inline) ==========
  seleccionarObjetivoExistente(objetivo: Objetivo): void {
    const yaExiste = this.objetivos().find(o => o.id === objetivo.id);
    if (yaExiste) {
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Este objetivo ya está agregado' });
      return;
    }

    this.objetivos.update(list => [...list, { ...objetivo }]);
    this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Objetivo agregado correctamente' });
  }

  abrirFormObjetivo(objetivo?: Objetivo): void {
    // Cerrar form de KPI si está abierto
    this.cerrarFormKPI();

    if (objetivo) {
      this.objetivoEditandoId.set(objetivo.id);
      this.nuevoObjetivoNombre.set(objetivo.nombre);
      this.nuevoObjetivoDescripcion.set(objetivo.descripcion);
      this.nuevoObjetivoTipo.set(objetivo.tipo);
    } else {
      this.objetivoEditandoId.set(null);
      this.nuevoObjetivoNombre.set('');
      this.nuevoObjetivoDescripcion.set('');
      this.nuevoObjetivoTipo.set('estrategico');
    }
    this.mostrarFormObjetivoInline.set(true);
  }

  cerrarFormObjetivo(): void {
    this.mostrarFormObjetivoInline.set(false);
    this.objetivoEditandoId.set(null);
    this.nuevoObjetivoNombre.set('');
    this.nuevoObjetivoDescripcion.set('');
  }

  guardarObjetivo(): void {
    if (!this.nuevoObjetivoNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    const editandoId = this.objetivoEditandoId();
    if (editandoId) {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === editandoId
            ? {
                ...o,
                nombre: this.nuevoObjetivoNombre(),
                descripcion: this.nuevoObjetivoDescripcion(),
                tipo: this.nuevoObjetivoTipo()
              }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Objetivo actualizado' });
    } else {
      const nuevoObjetivo: Objetivo = {
        id: `OBJ-${Date.now()}`,
        nombre: this.nuevoObjetivoNombre(),
        descripcion: this.nuevoObjetivoDescripcion(),
        tipo: this.nuevoObjetivoTipo(),
        progreso: 0,
        kpis: []
      };
      this.objetivos.update(list => [...list, nuevoObjetivo]);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Objetivo creado' });
    }

    this.cerrarFormObjetivo();
  }

  eliminarObjetivo(id: string): void {
    this.objetivos.update(list => list.filter(o => o.id !== id));
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Objetivo eliminado' });
  }

  isEditandoObjetivo(objetivoId: string): boolean {
    return this.objetivoEditandoId() === objetivoId && this.mostrarFormObjetivoInline();
  }

  // ========== KPIs (Inline) ==========
  abrirFormKPI(objetivoId: string, kpi?: KPI): void {
    // Cerrar form de objetivo si está abierto
    this.cerrarFormObjetivo();

    if (kpi) {
      this.kpiEditandoId.set(kpi.id);
      this.nuevoKPINombre.set(kpi.nombre);
      this.nuevoKPIMeta.set(kpi.meta);
      this.nuevoKPIEscala.set(kpi.escala);
    } else {
      this.kpiEditandoId.set(null);
      this.nuevoKPINombre.set('');
      this.nuevoKPIMeta.set(75);
      this.nuevoKPIEscala.set('Porcentaje');
    }

    this.mostrarFormKPIInline.set(objetivoId);
  }

  cerrarFormKPI(): void {
    this.mostrarFormKPIInline.set(null);
    this.kpiEditandoId.set(null);
    this.nuevoKPINombre.set('');
    this.nuevoKPIMeta.set(75);
  }

  guardarKPI(): void {
    if (!this.nuevoKPINombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del KPI es requerido' });
      return;
    }

    const objetivoId = this.mostrarFormKPIInline();
    if (!objetivoId) return;

    const editandoId = this.kpiEditandoId();
    const nuevoKPI: KPI = {
      id: editandoId || `KPI-${Date.now()}`,
      nombre: this.nuevoKPINombre(),
      meta: this.nuevoKPIMeta(),
      escala: this.nuevoKPIEscala()
    };

    if (editandoId) {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: o.kpis.map(k => k.id === nuevoKPI.id ? nuevoKPI : k) }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'KPI actualizado' });
    } else {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: [...o.kpis, nuevoKPI] }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'KPI agregado' });
    }

    this.cerrarFormKPI();
  }

  eliminarKPI(objetivoId: string, kpiId: string): void {
    this.objetivos.update(list =>
      list.map(o =>
        o.id === objetivoId
          ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) }
          : o
      )
    );
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  isFormKPIVisible(objetivoId: string): boolean {
    return this.mostrarFormKPIInline() === objetivoId;
  }

  isEditandoKPI(kpiId: string): boolean {
    return this.kpiEditandoId() === kpiId;
  }

  // ========== Finalizar ==========
  guardarEIrEditor(): void {
    // Convertir objetivos al formato esperado por el servicio
    const objetivosParaGuardar = this.objetivos().map(obj => ({
      id: obj.id,
      nombre: obj.nombre,
      descripcion: obj.descripcion,
      tipo: obj.tipo,
      progreso: obj.progreso,
      kpis: obj.kpis.map(kpi => ({
        id: kpi.id,
        nombre: kpi.nombre,
        meta: kpi.meta,
        escala: kpi.escala
      }))
    }));

    const proceso = this.processService.createProceso(
      this.nombreProceso(),
      this.descripcionProceso(),
      objetivosParaGuardar
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Proceso Creado',
      detail: `El proceso "${proceso.nombre}" fue creado exitosamente`
    });

    setTimeout(() => {
      this.router.navigate(['/procesos', proceso.id]);
    }, 500);
  }

  cancelar(): void {
    this.router.navigate(['/procesos']);
  }

  // Helpers
  getTipoLabel(tipo: string): string {
    return tipo === 'estrategico' ? 'Estratégico' : 'Operativo';
  }

  // ========== Colapso de Objetivos ==========
  toggleObjetivoColapsado(objetivoId: string): void {
    this.objetivosColapsados.update(set => {
      const newSet = new Set(set);
      if (newSet.has(objetivoId)) {
        newSet.delete(objetivoId);
      } else {
        newSet.add(objetivoId);
      }
      return newSet;
    });
  }

  isObjetivoColapsado(objetivoId: string): boolean {
    return this.objetivosColapsados().has(objetivoId);
  }

  expandirTodosObjetivos(): void {
    this.objetivosColapsados.set(new Set());
  }

  colapsarTodosObjetivos(): void {
    const ids = this.objetivos().map(o => o.id);
    this.objetivosColapsados.set(new Set(ids));
  }

  // Métodos para actualizar valores numéricos (evitar arrow functions en template)
  incrementarProbabilidad(): void {
    this.probabilidadInput.update(v => Math.min(v + 1, 10));
  }

  decrementarProbabilidad(): void {
    this.probabilidadInput.update(v => Math.max(v - 1, 1));
  }

  incrementarImpacto(): void {
    this.impactoInput.update(v => Math.min(v + 1, 10));
  }

  decrementarImpacto(): void {
    this.impactoInput.update(v => Math.max(v - 1, 1));
  }

  incrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.min(v + 5, 100));
  }

  decrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.max(v - 5, 0));
  }
}
