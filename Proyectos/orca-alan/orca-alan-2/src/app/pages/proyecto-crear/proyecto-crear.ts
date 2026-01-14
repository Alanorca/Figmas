import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';

// Services
import { ProyectosService } from '../../services/proyectos.service';
import { UsuariosRolesService } from '../../services/usuarios-roles.service';
import { ApiService } from '../../services/api.service';
import { firstValueFrom } from 'rxjs';

// Models
import {
  Project,
  ProjectPriority,
  ProjectObjective,
  ProjectKPI,
  ProjectPhase,
  PROJECT_PRIORITY_OPTIONS,
  CreateProjectData
} from '../../models/proyectos.models';

// Interfaces locales
interface PhaseForm {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  weight: number;
  orderNum: number;
}

interface KPIForm {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  formulaType: 'count' | 'average' | 'percentage' | 'custom';
}

interface ObjectiveForm {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: KPIForm[];
}

@Component({
  selector: 'app-proyecto-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ToastModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
    TagModule,
    CardModule,
    DividerModule,
    InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './proyecto-crear.html',
  styleUrl: './proyecto-crear.scss'
})
export class ProyectoCrearComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private proyectosService = inject(ProyectosService);
  private api = inject(ApiService);

  // Modo edición
  isEditMode = signal(false);
  projectId = signal<string | null>(null);

  // Paso actual del wizard (0-3)
  pasoActual = signal(0);

  // Steps del wizard (3 pasos como proceso-crear)
  steps = [
    {
      icon: 'pi pi-info-circle',
      label: 'Información Básica',
      descripcion: 'Define los datos generales del proyecto'
    },
    {
      icon: 'pi pi-bullseye',
      label: 'Objetivos y KPIs',
      descripcion: 'Establece objetivos y sus indicadores clave'
    },
    {
      icon: 'pi pi-check-circle',
      label: 'Revisión',
      descripcion: 'Revisa y confirma la información del proyecto'
    }
  ];

  // ========== PASO 1: Información Básica ==========
  nombreProyecto = signal('');
  descripcionProyecto = signal('');
  fechaInicio = signal<Date>(new Date());
  fechaFin = signal<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // +30 días
  prioridad = signal<ProjectPriority>('medium');
  responsableId = signal('');
  unidadOrganizacionalId = signal('');

  prioridadOptions = PROJECT_PRIORITY_OPTIONS;

  // Mock de responsables y unidades (en producción vendrían de un servicio)
  responsablesOptions = signal([
    { label: 'Juan García', value: 'user-1' },
    { label: 'María López', value: 'user-2' },
    { label: 'Carlos Rodríguez', value: 'user-3' }
  ]);

  unidadesOptions = signal([
    { label: 'Dirección General', value: 'org-1' },
    { label: 'Tecnología', value: 'org-2' },
    { label: 'Operaciones', value: 'org-3' }
  ]);

  // ========== PASO 2: Objetivos y KPIs (unificado como proceso-crear) ==========
  objetivos = signal<ObjectiveForm[]>([]);

  // Modo de visualización (seleccionar existentes o crear nuevos)
  modoObjetivos = signal<'seleccionar' | 'crear'>('crear');
  objetivosExistentes = signal<{id: string, nombre: string}[]>([]);

  tipoOptions = [
    { label: 'Estratégico', value: 'estrategico' },
    { label: 'Operativo', value: 'operativo' }
  ];

  // Estado de objetivos (colapsados, editando)
  objetivosColapsados = signal<Set<string>>(new Set());
  objetivoEditandoId = signal<string | null>(null);

  // Form de nuevo objetivo
  mostrarFormObjetivoInline = signal(false);
  nuevoObjetivoNombre = signal('');
  nuevoObjetivoDescripcion = signal('');
  nuevoObjetivoTipo = signal<'estrategico' | 'operativo'>('estrategico');

  // Form de KPI (dentro de objetivo)
  kpiFormVisibleParaObjetivo = signal<string | null>(null);
  kpiEditandoId = signal<string | null>(null);
  nuevoKPINombre = signal('');
  nuevoKPIDescripcion = signal('');
  nuevoKPIActual = signal<number>(0);
  nuevoKPIMeta = signal<number>(100);
  nuevoKPIUnidad = signal('%');
  nuevoKPIFormulaType = signal<KPIForm['formulaType']>('percentage');

  unidadOptions = [
    { label: 'Porcentaje (%)', value: '%' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'Días', value: 'días' },
    { label: 'Horas', value: 'horas' },
    { label: 'Pesos (MXN)', value: 'MXN' },
    { label: 'Dólares (USD)', value: 'USD' }
  ];

  formulaTypeOptions = [
    { label: 'Conteo', value: 'count' },
    { label: 'Promedio', value: 'average' },
    { label: 'Porcentaje', value: 'percentage' },
    { label: 'Personalizado', value: 'custom' }
  ];

  // Para compatibilidad con el guardado
  kpis = signal<KPIForm[]>([]);
  fases = signal<PhaseForm[]>([]);

  mostrarFormFase = signal(false);
  editandoFaseId = signal<string | null>(null);
  nuevaFaseNombre = signal('');
  nuevaFaseDescripcion = signal('');
  nuevaFaseInicio = signal<Date>(new Date());
  nuevaFaseFin = signal<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  nuevaFasePeso = signal<number>(100);

  // ========== Computed ==========
  totalObjetivos = computed(() => this.objetivos().length);
  totalKPIs = computed(() => this.objetivos().reduce((acc, obj) => acc + obj.kpis.length, 0));
  totalFases = computed(() => this.fases().length);

  duracionProyecto = computed(() => {
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();
    if (!inicio || !fin) return 0;
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  });

  // ========== Lifecycle ==========
  ngOnInit(): void {
    this.loadUsuarios();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  async loadUsuarios(): Promise<void> {
    try {
      const usuarios = await firstValueFrom(this.api.getUsuarios());
      this.responsablesOptions.set(
        usuarios.map((u: any) => ({
          label: u.nombre || `${u.email}`,
          value: u.id
        }))
      );
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      // Mantener opciones mock si falla
    }
  }

  async loadProject(id: string): Promise<void> {
    try {
      const project = await this.proyectosService.loadProjectById(id);
      if (project) {
        this.nombreProyecto.set(project.name);
        this.descripcionProyecto.set(project.description || '');
        this.fechaInicio.set(new Date(project.startDate));
        this.fechaFin.set(new Date(project.endDate));
        this.prioridad.set(project.priority);
        this.responsableId.set(project.responsibleUserId);
        this.unidadOrganizacionalId.set(project.orgUnitId || '');

        // Cargar objetivos con KPIs anidados
        if (project.objectives) {
          // Mapear KPIs a objetivos (por ahora sin relación directa, los agregamos vacíos)
          const kpisList = project.kpis || [];
          this.objetivos.set(project.objectives.map((o: ProjectObjective) => ({
            id: o.id,
            nombre: o.description, // Usamos description como nombre
            descripcion: '',
            tipo: 'estrategico' as const,
            progreso: 0,
            kpis: [] // KPIs se añadirán manualmente
          })));
        }

        // Mantener compatibilidad con kpis standalone
        if (project.kpis) {
          this.kpis.set(project.kpis.map((k: ProjectKPI) => ({
            id: k.id,
            name: k.name,
            description: k.description || '',
            currentValue: k.currentValue || 0,
            targetValue: k.targetValue,
            unit: k.unit,
            formulaType: k.formulaType as KPIForm['formulaType']
          })));
        }

        if (project.phases) {
          this.fases.set(project.phases.map((p: ProjectPhase) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            startDate: new Date(p.startDate),
            endDate: new Date(p.endDate),
            weight: p.weight,
            orderNum: p.orderNum
          })));
        }
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el proyecto'
      });
    }
  }

  // ========== Navegación ==========
  siguiente(): void {
    if (this.validarPasoActual()) {
      this.pasoActual.update(p => Math.min(p + 1, 2));
    }
  }

  anterior(): void {
    this.pasoActual.update(p => Math.max(p - 1, 0));
  }

  irAPaso(paso: number): void {
    if (paso <= this.pasoActual()) {
      this.pasoActual.set(paso);
    }
  }

  validarPasoActual(): boolean {
    switch (this.pasoActual()) {
      case 0: // Información Básica
        if (!this.nombreProyecto().trim()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del proyecto es requerido' });
          return false;
        }
        if (!this.fechaInicio() || !this.fechaFin()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'Las fechas son requeridas' });
          return false;
        }
        if (this.fechaFin() < this.fechaInicio()) {
          this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'La fecha de fin debe ser posterior a la de inicio' });
          return false;
        }
        return true;
      case 1: // Objetivos y KPIs
        return true; // Opcional
      case 2: // Revisión
        return true;
      default:
        return true;
    }
  }

  // ========== Objetivos con KPIs anidados (como proceso-crear) ==========

  // Helpers para estado de objetivos
  isObjetivoColapsado(id: string): boolean {
    return this.objetivosColapsados().has(id);
  }

  toggleObjetivoColapsado(id: string): void {
    this.objetivosColapsados.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  expandirTodosObjetivos(): void {
    this.objetivosColapsados.set(new Set());
  }

  colapsarTodosObjetivos(): void {
    const ids = this.objetivos().map(o => o.id);
    this.objetivosColapsados.set(new Set(ids));
  }

  isEditandoObjetivo(id: string): boolean {
    return this.objetivoEditandoId() === id;
  }

  // Form de objetivos
  abrirFormObjetivo(objetivo?: ObjectiveForm): void {
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
      this.mostrarFormObjetivoInline.set(true);
    }
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
      const nuevoObjetivo: ObjectiveForm = {
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

  getTipoLabel(tipo: string): string {
    return this.tipoOptions.find(t => t.value === tipo)?.label || tipo;
  }

  // ========== KPIs dentro de objetivos ==========
  isFormKPIVisible(objetivoId: string): boolean {
    return this.kpiFormVisibleParaObjetivo() === objetivoId;
  }

  abrirFormKPI(objetivoId: string, kpi?: KPIForm): void {
    this.kpiFormVisibleParaObjetivo.set(objetivoId);
    if (kpi) {
      this.kpiEditandoId.set(kpi.id);
      this.nuevoKPINombre.set(kpi.name);
      this.nuevoKPIDescripcion.set(kpi.description || '');
      this.nuevoKPIActual.set(kpi.currentValue);
      this.nuevoKPIMeta.set(kpi.targetValue);
      this.nuevoKPIUnidad.set(kpi.unit);
      this.nuevoKPIFormulaType.set(kpi.formulaType);
    } else {
      this.kpiEditandoId.set(null);
      this.nuevoKPINombre.set('');
      this.nuevoKPIDescripcion.set('');
      this.nuevoKPIActual.set(0);
      this.nuevoKPIMeta.set(100);
      this.nuevoKPIUnidad.set('%');
      this.nuevoKPIFormulaType.set('percentage');
    }
  }

  cerrarFormKPI(): void {
    this.kpiFormVisibleParaObjetivo.set(null);
    this.kpiEditandoId.set(null);
    this.nuevoKPINombre.set('');
    this.nuevoKPIDescripcion.set('');
  }

  guardarKPI(objetivoId: string): void {
    if (!this.nuevoKPINombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    const editandoId = this.kpiEditandoId();

    this.objetivos.update(list =>
      list.map(objetivo => {
        if (objetivo.id !== objetivoId) return objetivo;

        if (editandoId) {
          // Actualizar KPI existente
          return {
            ...objetivo,
            kpis: objetivo.kpis.map(k =>
              k.id === editandoId
                ? {
                    ...k,
                    name: this.nuevoKPINombre(),
                    description: this.nuevoKPIDescripcion(),
                    currentValue: this.nuevoKPIActual(),
                    targetValue: this.nuevoKPIMeta(),
                    unit: this.nuevoKPIUnidad(),
                    formulaType: this.nuevoKPIFormulaType()
                  }
                : k
            )
          };
        } else {
          // Crear nuevo KPI
          const nuevoKPI: KPIForm = {
            id: `KPI-${Date.now()}`,
            name: this.nuevoKPINombre(),
            description: this.nuevoKPIDescripcion(),
            currentValue: this.nuevoKPIActual(),
            targetValue: this.nuevoKPIMeta(),
            unit: this.nuevoKPIUnidad(),
            formulaType: this.nuevoKPIFormulaType()
          };
          return {
            ...objetivo,
            kpis: [...objetivo.kpis, nuevoKPI]
          };
        }
      })
    );

    this.messageService.add({
      severity: 'success',
      summary: editandoId ? 'Actualizado' : 'Agregado',
      detail: editandoId ? 'KPI actualizado' : 'KPI creado'
    });
    this.cerrarFormKPI();
  }

  eliminarKPI(objetivoId: string, kpiId: string): void {
    this.objetivos.update(list =>
      list.map(objetivo => {
        if (objetivo.id !== objetivoId) return objetivo;
        return {
          ...objetivo,
          kpis: objetivo.kpis.filter(k => k.id !== kpiId)
        };
      })
    );
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  getFormulaTypeLabel(type: string): string {
    return this.formulaTypeOptions.find(f => f.value === type)?.label || type;
  }

  // Calcular progreso de objetivo basado en KPIs
  calcularProgresoObjetivo(objetivo: ObjectiveForm): number {
    if (objetivo.kpis.length === 0) return 0;
    const progresos = objetivo.kpis.map(kpi => {
      if (kpi.targetValue === 0) return 100;
      return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
    });
    return Math.round(progresos.reduce((a, b) => a + b, 0) / progresos.length);
  }

  // ========== Fases ==========
  abrirFormFase(fase?: PhaseForm): void {
    if (fase) {
      this.editandoFaseId.set(fase.id);
      this.nuevaFaseNombre.set(fase.name);
      this.nuevaFaseDescripcion.set(fase.description);
      this.nuevaFaseInicio.set(fase.startDate);
      this.nuevaFaseFin.set(fase.endDate);
      this.nuevaFasePeso.set(fase.weight);
    } else {
      this.editandoFaseId.set(null);
      this.nuevaFaseNombre.set('');
      this.nuevaFaseDescripcion.set('');
      // Por defecto usar fechas del proyecto
      this.nuevaFaseInicio.set(this.fechaInicio());
      this.nuevaFaseFin.set(this.fechaFin());
      this.nuevaFasePeso.set(100);
    }
    this.mostrarFormFase.set(true);
  }

  cerrarFormFase(): void {
    this.mostrarFormFase.set(false);
    this.editandoFaseId.set(null);
    this.nuevaFaseNombre.set('');
    this.nuevaFaseDescripcion.set('');
  }

  guardarFase(): void {
    if (!this.nuevaFaseNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    const editandoId = this.editandoFaseId();
    if (editandoId) {
      this.fases.update(list =>
        list.map(f =>
          f.id === editandoId
            ? {
                ...f,
                name: this.nuevaFaseNombre(),
                description: this.nuevaFaseDescripcion(),
                startDate: this.nuevaFaseInicio(),
                endDate: this.nuevaFaseFin(),
                weight: this.nuevaFasePeso()
              }
            : f
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Fase actualizada' });
    } else {
      const nuevaFase: PhaseForm = {
        id: `PHASE-${Date.now()}`,
        name: this.nuevaFaseNombre(),
        description: this.nuevaFaseDescripcion(),
        startDate: this.nuevaFaseInicio(),
        endDate: this.nuevaFaseFin(),
        weight: this.nuevaFasePeso(),
        orderNum: this.fases().length + 1
      };
      this.fases.update(list => [...list, nuevaFase]);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'Fase creada' });
    }

    this.cerrarFormFase();
  }

  eliminarFase(id: string): void {
    this.fases.update(list => {
      const filtered = list.filter(f => f.id !== id);
      // Reordenar
      return filtered.map((f, i) => ({ ...f, orderNum: i + 1 }));
    });
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Fase eliminada' });
  }

  moverFase(id: string, direction: 'up' | 'down'): void {
    this.fases.update(list => {
      const index = list.findIndex(f => f.id === id);
      if (index === -1) return list;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return list;

      const newList = [...list];
      [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];

      return newList.map((f, i) => ({ ...f, orderNum: i + 1 }));
    });
  }

  getFaseDuracion(fase: PhaseForm): number {
    const diff = fase.endDate.getTime() - fase.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // ========== Finalizar ==========
  saving = signal(false);

  async guardarProyecto(): Promise<void> {
    if (!this.validarPasoActual()) return;

    this.saving.set(true);

    // Construir datos del proyecto
    const projectData: CreateProjectData = {
      name: this.nombreProyecto(),
      description: this.descripcionProyecto() || undefined,
      startDate: this.fechaInicio().toISOString(),
      endDate: this.fechaFin().toISOString(),
      responsibleUserId: this.responsableId() || 'user-default',
      orgUnitId: this.unidadOrganizacionalId() || undefined,
      priority: this.prioridad(),
      status: 'planning',
      createdBy: 'current-user' // TODO: obtener del servicio de auth
    };

    try {
      let projectId: string;

      if (this.isEditMode()) {
        projectId = this.projectId()!;
        // Para edición, actualizar datos básicos
        await this.proyectosService.updateProject(projectId, {
          name: projectData.name,
          description: projectData.description,
          startDate: new Date(projectData.startDate),
          endDate: new Date(projectData.endDate),
          priority: projectData.priority!,
          responsibleUserId: projectData.responsibleUserId
        });
      } else {
        // Para creación, crear proyecto primero
        const project = await this.proyectosService.createProject(projectData);
        projectId = project.id;
      }

      // Crear objetivos con KPIs anidados
      const objetivosActuales = this.objetivos();
      for (const objetivo of objetivosActuales) {
        // Solo crear si no tiene ID del servidor (IDs temporales empiezan con OBJ-)
        if (objetivo.id.startsWith('OBJ-')) {
          // Crear objetivo
          const nuevoObjetivo = await this.proyectosService.createObjective(projectId, {
            description: objetivo.nombre, // Usamos nombre como description
            category: objetivo.tipo === 'estrategico' ? 'specific' : 'measurable',
            targetDate: undefined
          });

          // Crear KPIs asociados al objetivo
          for (const kpi of objetivo.kpis) {
            if (kpi.id.startsWith('KPI-')) {
              await this.proyectosService.createKPI(projectId, {
                name: kpi.name,
                description: kpi.description || undefined,
                targetValue: kpi.targetValue,
                unit: kpi.unit,
                formulaType: kpi.formulaType
              });
            }
          }
        }
      }

      // KPIs standalone (para compatibilidad)
      const kpisActuales = this.kpis();
      for (const kpi of kpisActuales) {
        // Solo crear si no tiene ID del servidor
        if (kpi.id.startsWith('KPI-')) {
          await this.proyectosService.createKPI(projectId, {
            name: kpi.name,
            description: kpi.description || undefined,
            targetValue: kpi.targetValue,
            unit: kpi.unit,
            formulaType: kpi.formulaType
          });
        }
      }

      // Crear fases
      const fasesActuales = this.fases();
      for (const fase of fasesActuales) {
        // Solo crear si no tiene ID del servidor
        if (fase.id.startsWith('PHASE-')) {
          await this.proyectosService.createPhase(projectId, {
            name: fase.name,
            description: fase.description || undefined,
            startDate: fase.startDate.toISOString(),
            endDate: fase.endDate.toISOString(),
            weight: fase.weight,
            orderNum: fase.orderNum
          });
        }
      }

      this.messageService.add({
        severity: 'success',
        summary: this.isEditMode() ? 'Proyecto Actualizado' : 'Proyecto Creado',
        detail: `El proyecto "${this.nombreProyecto()}" fue ${this.isEditMode() ? 'actualizado' : 'creado'} exitosamente con ${objetivosActuales.length} objetivos, ${kpisActuales.length} KPIs y ${fasesActuales.length} fases`
      });

      setTimeout(() => {
        this.router.navigate(['/proyectos']);
      }, 1000);
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el proyecto. Intente nuevamente.'
      });
    } finally {
      this.saving.set(false);
    }
  }

  cancelar(): void {
    this.router.navigate(['/proyectos']);
  }

  // ========== Helpers ==========
  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getPrioridadLabel(priority: string): string {
    return this.prioridadOptions.find(p => p.value === priority)?.label || priority;
  }

  getPrioridadSeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      low: 'secondary',
      medium: 'info',
      high: 'warn',
      critical: 'danger'
    };
    return severities[priority] || 'secondary';
  }
}
