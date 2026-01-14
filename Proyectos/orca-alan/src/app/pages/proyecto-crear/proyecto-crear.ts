import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

interface ObjectiveForm {
  id: string;
  description: string;
  category: 'specific' | 'measurable' | 'achievable' | 'relevant' | 'time_bound';
  targetDate: Date | null;
}

interface KPIForm {
  id: string;
  name: string;
  description: string;
  targetValue: number;
  unit: string;
  formulaType: 'count' | 'average' | 'percentage' | 'custom';
}

@Component({
  selector: 'app-proyecto-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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

  // Steps del wizard
  steps = [
    {
      icon: 'pi pi-info-circle',
      label: 'Información Básica',
      descripcion: 'Define los datos generales del proyecto'
    },
    {
      icon: 'pi pi-bullseye',
      label: 'Objetivos SMART',
      descripcion: 'Establece objetivos específicos, medibles y alcanzables'
    },
    {
      icon: 'pi pi-chart-line',
      label: 'KPIs',
      descripcion: 'Define indicadores clave de desempeño'
    },
    {
      icon: 'pi pi-list-check',
      label: 'Fases',
      descripcion: 'Organiza el proyecto en fases y revisa la información'
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

  // ========== PASO 2: Objetivos SMART ==========
  objetivos = signal<ObjectiveForm[]>([]);

  categoriaOptions = [
    { label: 'Específico', value: 'specific', icon: 'pi pi-bullseye', description: 'Objetivo claro y definido' },
    { label: 'Medible', value: 'measurable', icon: 'pi pi-chart-bar', description: 'Cuantificable y verificable' },
    { label: 'Alcanzable', value: 'achievable', icon: 'pi pi-check-circle', description: 'Realista con recursos disponibles' },
    { label: 'Relevante', value: 'relevant', icon: 'pi pi-star', description: 'Alineado con metas estratégicas' },
    { label: 'Temporal', value: 'time_bound', icon: 'pi pi-clock', description: 'Con fecha límite definida' }
  ];

  mostrarFormObjetivo = signal(false);
  editandoObjetivoId = signal<string | null>(null);
  nuevoObjetivoDescripcion = signal('');
  nuevoObjetivoCategoria = signal<ObjectiveForm['category']>('specific');
  nuevoObjetivoFecha = signal<Date | null>(null);

  // ========== PASO 3: KPIs ==========
  kpis = signal<KPIForm[]>([]);

  formulaTypeOptions = [
    { label: 'Conteo', value: 'count', description: 'Suma total de elementos' },
    { label: 'Promedio', value: 'average', description: 'Media aritmética' },
    { label: 'Porcentaje', value: 'percentage', description: 'Proporción sobre 100' },
    { label: 'Personalizado', value: 'custom', description: 'Fórmula propia' }
  ];

  unidadOptions = [
    { label: 'Porcentaje (%)', value: '%' },
    { label: 'Unidades', value: 'unidades' },
    { label: 'Días', value: 'días' },
    { label: 'Horas', value: 'horas' },
    { label: 'Pesos (MXN)', value: 'MXN' },
    { label: 'Dólares (USD)', value: 'USD' }
  ];

  mostrarFormKPI = signal(false);
  editandoKPIId = signal<string | null>(null);
  nuevoKPINombre = signal('');
  nuevoKPIDescripcion = signal('');
  nuevoKPIValorMeta = signal<number>(100);
  nuevoKPIUnidad = signal('%');
  nuevoKPIFormulaType = signal<KPIForm['formulaType']>('percentage');

  // ========== PASO 4: Fases ==========
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
  totalKPIs = computed(() => this.kpis().length);
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

        // Cargar objetivos, KPIs y fases si existen
        if (project.objectives) {
          this.objetivos.set(project.objectives.map((o: ProjectObjective) => ({
            id: o.id,
            description: o.description,
            category: o.category as ObjectiveForm['category'],
            targetDate: o.targetDate ? new Date(o.targetDate) : null
          })));
        }

        if (project.kpis) {
          this.kpis.set(project.kpis.map((k: ProjectKPI) => ({
            id: k.id,
            name: k.name,
            description: k.description || '',
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
      this.pasoActual.update(p => Math.min(p + 1, 3));
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
      case 1: // Objetivos
        return true; // Opcional
      case 2: // KPIs
        return true; // Opcional
      case 3: // Fases
        return true; // Opcional
      default:
        return true;
    }
  }

  // ========== Objetivos SMART ==========
  abrirFormObjetivo(objetivo?: ObjectiveForm): void {
    if (objetivo) {
      this.editandoObjetivoId.set(objetivo.id);
      this.nuevoObjetivoDescripcion.set(objetivo.description);
      this.nuevoObjetivoCategoria.set(objetivo.category);
      this.nuevoObjetivoFecha.set(objetivo.targetDate);
    } else {
      this.editandoObjetivoId.set(null);
      this.nuevoObjetivoDescripcion.set('');
      this.nuevoObjetivoCategoria.set('specific');
      this.nuevoObjetivoFecha.set(null);
    }
    this.mostrarFormObjetivo.set(true);
  }

  cerrarFormObjetivo(): void {
    this.mostrarFormObjetivo.set(false);
    this.editandoObjetivoId.set(null);
    this.nuevoObjetivoDescripcion.set('');
  }

  guardarObjetivo(): void {
    if (!this.nuevoObjetivoDescripcion().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'La descripción es requerida' });
      return;
    }

    const editandoId = this.editandoObjetivoId();
    if (editandoId) {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === editandoId
            ? {
                ...o,
                description: this.nuevoObjetivoDescripcion(),
                category: this.nuevoObjetivoCategoria(),
                targetDate: this.nuevoObjetivoFecha()
              }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Objetivo actualizado' });
    } else {
      const nuevoObjetivo: ObjectiveForm = {
        id: `OBJ-${Date.now()}`,
        description: this.nuevoObjetivoDescripcion(),
        category: this.nuevoObjetivoCategoria(),
        targetDate: this.nuevoObjetivoFecha()
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

  getCategoriaLabel(category: string): string {
    return this.categoriaOptions.find(c => c.value === category)?.label || category;
  }

  getCategoriaIcon(category: string): string {
    return this.categoriaOptions.find(c => c.value === category)?.icon || 'pi pi-circle';
  }

  // ========== KPIs ==========
  abrirFormKPI(kpi?: KPIForm): void {
    if (kpi) {
      this.editandoKPIId.set(kpi.id);
      this.nuevoKPINombre.set(kpi.name);
      this.nuevoKPIDescripcion.set(kpi.description);
      this.nuevoKPIValorMeta.set(kpi.targetValue);
      this.nuevoKPIUnidad.set(kpi.unit);
      this.nuevoKPIFormulaType.set(kpi.formulaType);
    } else {
      this.editandoKPIId.set(null);
      this.nuevoKPINombre.set('');
      this.nuevoKPIDescripcion.set('');
      this.nuevoKPIValorMeta.set(100);
      this.nuevoKPIUnidad.set('%');
      this.nuevoKPIFormulaType.set('percentage');
    }
    this.mostrarFormKPI.set(true);
  }

  cerrarFormKPI(): void {
    this.mostrarFormKPI.set(false);
    this.editandoKPIId.set(null);
    this.nuevoKPINombre.set('');
    this.nuevoKPIDescripcion.set('');
  }

  guardarKPI(): void {
    if (!this.nuevoKPINombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    const editandoId = this.editandoKPIId();
    if (editandoId) {
      this.kpis.update(list =>
        list.map(k =>
          k.id === editandoId
            ? {
                ...k,
                name: this.nuevoKPINombre(),
                description: this.nuevoKPIDescripcion(),
                targetValue: this.nuevoKPIValorMeta(),
                unit: this.nuevoKPIUnidad(),
                formulaType: this.nuevoKPIFormulaType()
              }
            : k
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'KPI actualizado' });
    } else {
      const nuevoKPI: KPIForm = {
        id: `KPI-${Date.now()}`,
        name: this.nuevoKPINombre(),
        description: this.nuevoKPIDescripcion(),
        targetValue: this.nuevoKPIValorMeta(),
        unit: this.nuevoKPIUnidad(),
        formulaType: this.nuevoKPIFormulaType()
      };
      this.kpis.update(list => [...list, nuevoKPI]);
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'KPI creado' });
    }

    this.cerrarFormKPI();
  }

  eliminarKPI(id: string): void {
    this.kpis.update(list => list.filter(k => k.id !== id));
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  getFormulaTypeLabel(type: string): string {
    return this.formulaTypeOptions.find(f => f.value === type)?.label || type;
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

      // Crear objetivos SMART
      const objetivosActuales = this.objetivos();
      for (const objetivo of objetivosActuales) {
        // Solo crear si no tiene ID del servidor (IDs temporales empiezan con OBJ-)
        if (objetivo.id.startsWith('OBJ-')) {
          await this.proyectosService.createObjective(projectId, {
            description: objetivo.description,
            category: objetivo.category,
            targetDate: objetivo.targetDate?.toISOString()
          });
        }
      }

      // Crear KPIs
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
