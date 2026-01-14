import { Component, inject, signal, OnInit, computed, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { AccordionModule } from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TreeNode, MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import {
  NodoOrganigrama,
  TipoContenedorOrganizacional,
  PropiedadOrganizacion,
  TipoPropiedadOrganizacion,
  ObjetivoNegocioVinculado,
  ResponsableContenedor,
  ICONOS_CONTENEDOR,
  COLORES_CONTENEDOR,
  ETIQUETAS_CONTENEDOR
} from '../../models';

// Interfaces para Objetivos y KPIs (igual que en proceso-crear)
type AlertSeverity = 'info' | 'warning' | 'critical';
type NotificationChannel = 'email' | 'in-app' | 'webhook';
type EvaluationFrequency = 'inmediata' | 'diaria' | 'semanal' | 'mensual';

interface KPI {
  id: string;
  nombre: string;
  meta: number;
  actual: number;
  escala: string;
  umbralAlerta: number;
  umbralMaximo: number | null;
  severidad: AlertSeverity;
  canalesNotificacion: NotificationChannel[];
  frecuenciaEvaluacion: EvaluationFrequency;
  direccion: 'mayor_mejor' | 'menor_mejor';
}

interface Objetivo {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'estrategico' | 'operativo';
  progreso: number;
  kpis: KPI[];
}

interface ApetitoCelda {
  probabilidad: number;
  impacto: number;
}

@Component({
  selector: 'app-organigramas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    OrganizationChartModule,
    DialogModule,
    DrawerModule,
    AvatarModule,
    ToolbarModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    BreadcrumbModule,
    DividerModule,
    SplitterModule,
    SelectModule,
    MultiSelectModule,
    InputNumberModule,
    TagModule,
    TabsModule,
    AccordionModule,
    ChipModule,
    ProgressBarModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './organigramas.html',
  styleUrl: './organigramas.scss'
})
export class OrganigramasComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Constantes de iconos y colores
  readonly ICONOS = ICONOS_CONTENEDOR;
  readonly COLORES = COLORES_CONTENEDOR;
  readonly ETIQUETAS = ETIQUETAS_CONTENEDOR;

  // Opciones de tipo de contenedor
  tiposContenedor: { label: string; value: TipoContenedorOrganizacional; icon: string }[] = [
    { label: 'Organización', value: 'ORGANIZATION', icon: 'pi pi-building' },
    { label: 'Área', value: 'AREA', icon: 'pi pi-th-large' },
    { label: 'Subárea', value: 'SUBAREA', icon: 'pi pi-users' }
  ];

  // Opciones de tipo de propiedad custom
  tiposPropiedadCustom: { label: string; value: TipoPropiedadOrganizacion }[] = [
    { label: 'Texto', value: 'TEXT' },
    { label: 'Número', value: 'NUMBER' }
  ];

  // Usuarios disponibles para asignar como responsables (mock)
  usuariosDisponibles = signal<ResponsableContenedor[]>([
    { id: '1', nombre: 'Carlos Rodríguez', email: 'carlos@empresa.com', avatar: '' },
    { id: '2', nombre: 'María González', email: 'maria@empresa.com', avatar: '' },
    { id: '3', nombre: 'Juan Martínez', email: 'juan@empresa.com', avatar: '' },
    { id: '4', nombre: 'Ana López', email: 'ana@empresa.com', avatar: '' }
  ]);

  // Objetivos de negocio disponibles - sincronizados con objetivos-kpis
  // IDs y nombres coinciden con los definidos en el módulo de Objetivos y KPIs
  objetivosDisponibles = signal<ObjetivoNegocioVinculado[]>([
    { id: '1', nombre: 'Reducir riesgos Operacionales', descripcion: 'Evaluación de riesgos financieros, desarrollo de estrategias de mitigación, coordinación de auditorías y fortalecimiento de controles internos.', kpis: [{ nombre: 'Índice de Riesgo Operacional', valor: 3, meta: 5 }, { nombre: 'Cumplimiento de Auditorías', valor: 75, meta: 100 }] },
    { id: '2', nombre: 'Incrementar rentabilidad financiera', descripcion: 'Optimización de la cartera crediticia, diversificación de ingresos, mejora del margen financiero y reducción de costos operativos.', kpis: [] },
    { id: '3', nombre: 'Mejora experiencia del cliente', descripcion: 'Expansión de mercado, desarrollo de nuevos productos, captación de clientes y consolidación de la participación sectorial.', kpis: [{ nombre: 'NPS Score', valor: 68, meta: 75 }, { nombre: 'Tiempo de respuesta', valor: 18, meta: 24 }] },
    { id: '4', nombre: 'Fortalecer posicionamiento competitivo', descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.', kpis: [{ nombre: 'Market Share', valor: 8, meta: 15 }] }
  ]);

  // Estado principal
  organigrama = signal<any | null>(null);

  // Drawer de detalle (reemplaza Dialog)
  showDetailDrawer = false;
  selectedNode = signal<NodoOrganigrama | null>(null);

  // Búsqueda
  searchQuery = signal('');
  searchSubordinadosQuery = signal('');

  // Breadcrumb para navegación
  breadcrumbItems = signal<MenuItem[]>([]);
  breadcrumbHome: MenuItem = { icon: 'pi pi-home', command: () => this.navegarARaiz() };

  // ========== WIZARD DE CREACIÓN ==========
  showWizard = signal(false);
  wizardPasoActual = signal(0);
  parentNodeForNew = signal<NodoOrganigrama | null>(null);
  isCreatingRoot = signal(false);

  // Definición de pasos del wizard (6 pasos)
  wizardSteps = [
    { icon: 'pi pi-info-circle', label: 'Información Básica', description: 'Nombre y descripción del contenedor' },
    { icon: 'pi pi-user', label: 'Responsable', description: 'Asignar responsable del contenedor' },
    { icon: 'pi pi-list', label: 'Propiedades', description: 'Propiedades personalizadas' },
    { icon: 'pi pi-th-large', label: 'Apetito de Riesgo', description: 'Definir mapa de calor y apetito' },
    { icon: 'pi pi-bullseye', label: 'Objetivos y KPIs', description: 'Registrar objetivos e indicadores' },
    { icon: 'pi pi-check-circle', label: 'Revisión', description: 'Revisar y confirmar' }
  ];

  // Wizard form data
  wizardNombre = signal('');
  wizardDescripcion = signal('');
  wizardCargo = signal('');
  wizardDepartamento = signal('');
  wizardEmail = signal('');
  wizardTelefono = signal('');

  // Imagen o Icono
  modoImagen = signal<'icono' | 'imagen'>('icono');
  wizardIcono = signal<string>('pi pi-building');
  wizardImagen = signal<string | null>(null);

  // Iconos disponibles
  iconosDisponibles = [
    'pi pi-building', 'pi pi-th-large', 'pi pi-users', 'pi pi-sitemap',
    'pi pi-briefcase', 'pi pi-chart-bar', 'pi pi-cog', 'pi pi-globe',
    'pi pi-server', 'pi pi-database', 'pi pi-shield', 'pi pi-lock',
    'pi pi-wallet', 'pi pi-credit-card', 'pi pi-shopping-cart', 'pi pi-truck',
    'pi pi-box', 'pi pi-home', 'pi pi-map', 'pi pi-phone',
    'pi pi-envelope', 'pi pi-flag', 'pi pi-star', 'pi pi-heart'
  ];

  // ========== DRAWER DE EDICIÓN ==========
  showEditDrawer = signal(false);
  editingNode = signal<NodoOrganigrama | null>(null);

  // Propiedades custom
  propiedadesCustom = signal<PropiedadOrganizacion[]>([]);
  nuevaPropiedad = signal<Partial<PropiedadOrganizacion>>({ nombre: '', tipo: 'TEXT', requerido: false });

  // Objetivos de negocio seleccionados
  objetivosSeleccionados = signal<string[]>([]);

  // Responsable seleccionado
  responsableSeleccionado = signal<string | null>(null);

  // Tab activa en el drawer de edición
  editTabActiva = signal<string>('0');

  // ========== ZOOM Y PAN DEL ORGANIGRAMA ==========
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  zoom = signal<number>(1);
  panX = signal<number>(0);
  panY = signal<number>(0);
  isPanning = signal<boolean>(false);
  lastPanPosition = { x: 0, y: 0 };

  readonly MIN_ZOOM = 0.25;
  readonly MAX_ZOOM = 2;
  readonly ZOOM_STEP = 0.1;

  // Computed para el transform del canvas
  chartTransform = computed(() => {
    return `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoom()})`;
  });

  // Zoom percentage para mostrar en toolbar
  zoomPercentage = computed(() => Math.round(this.zoom() * 100));

  // ========== APETITO DE RIESGO (Mapa de calor) ==========
  modoApetito = signal<'seleccionar' | 'crear'>('crear');
  probabilidadInput = signal<number>(5);
  impactoInput = signal<number>(5);
  apetitoRiesgo = signal<number>(20);
  celdaSeleccionada = signal<ApetitoCelda | null>(null);

  // ========== OBJETIVOS Y KPIs ==========
  modoObjetivos = signal<'seleccionar' | 'crear'>('crear');
  objetivos = signal<Objetivo[]>([]);

  // Objetivos existentes para seleccionar (mock)
  objetivosExistentes = signal<Objetivo[]>([
    {
      id: 'OBJ-001',
      nombre: 'Reducir riesgos operacionales',
      descripcion: 'Evaluación de riesgos financieros y fortalecimiento de controles internos.',
      tipo: 'estrategico',
      progreso: 50,
      kpis: [
        { id: 'KPI-001', nombre: 'Índice de Riesgo', meta: 75, actual: 40, escala: 'Porcentaje', umbralAlerta: 50, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'diaria', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: 'OBJ-002',
      nombre: 'Mejorar cumplimiento normativo',
      descripcion: 'Asegurar adherencia a normativas y regulaciones vigentes.',
      tipo: 'operativo',
      progreso: 75,
      kpis: []
    }
  ]);

  // Form inline para nuevo objetivo
  mostrarFormObjetivoInline = signal(false);
  objetivoEditandoId = signal<string | null>(null);
  nuevoObjetivoNombre = signal('');
  nuevoObjetivoDescripcion = signal('');
  nuevoObjetivoTipo = signal<'estrategico' | 'operativo'>('estrategico');

  // Form inline para nuevo KPI
  mostrarFormKPIInline = signal<string | null>(null);
  kpiEditandoId = signal<string | null>(null);
  nuevoKPINombre = signal('');
  nuevoKPIMeta = signal<number>(75);
  nuevoKPIActual = signal<number>(0);
  nuevoKPIEscala = signal('Porcentaje');
  nuevoKPIUmbralAlerta = signal<number>(50);
  nuevoKPIUmbralMaximo = signal<number | null>(null);
  nuevoKPISeveridad = signal<AlertSeverity>('warning');
  nuevoKPIDireccion = signal<'mayor_mejor' | 'menor_mejor'>('mayor_mejor');
  nuevoKPICanales = signal<NotificationChannel[]>(['in-app']);
  nuevoKPIFrecuencia = signal<EvaluationFrequency>('diaria');

  // Opciones para selects de KPIs
  escalasOptions = [
    { label: 'Porcentaje', value: 'Porcentaje' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Días', value: 'Días' },
    { label: 'USD', value: 'USD' }
  ];

  direccionOptions = [
    { label: 'Mayor es mejor', value: 'mayor_mejor' },
    { label: 'Menor es mejor', value: 'menor_mejor' }
  ];

  severidadOptions = [
    { label: 'Info', value: 'info', icon: 'pi pi-info-circle', color: 'var(--blue-500)' },
    { label: 'Warning', value: 'warning', icon: 'pi pi-exclamation-triangle', color: 'var(--yellow-500)' },
    { label: 'Critical', value: 'critical', icon: 'pi pi-times-circle', color: 'var(--red-500)' }
  ];

  canalesOptions = [
    { label: 'Email', value: 'email', icon: 'pi pi-envelope' },
    { label: 'In-App', value: 'in-app', icon: 'pi pi-bell' },
    { label: 'Webhook', value: 'webhook', icon: 'pi pi-link' }
  ];

  frecuenciaOptions = [
    { label: 'Inmediata', value: 'inmediata' },
    { label: 'Diaria', value: 'diaria' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' }
  ];

  tipoObjetivoOptions = [
    { label: 'Estratégico', value: 'estrategico' },
    { label: 'Operativo', value: 'operativo' }
  ];

  // Computed: Total de KPIs
  totalKPIs = computed(() => {
    return this.objetivos().reduce((total, obj) => total + obj.kpis.length, 0);
  });

  // Computed: Progreso de objetivos del nodo seleccionado
  progresoObjetivosNodo = computed(() => {
    const nodo = this.selectedNode();
    if (!nodo || !nodo.objetivosNegocio || nodo.objetivosNegocio.length === 0) {
      return { progreso: 0, total: 0, completados: 0 };
    }

    const objetivos = nodo.objetivosNegocio;
    let totalKPIs = 0;
    let kpisCompletados = 0;

    for (const obj of objetivos) {
      if (obj.kpis && obj.kpis.length > 0) {
        for (const kpi of obj.kpis) {
          totalKPIs++;
          // Consideramos completado si valor >= meta
          if (kpi.valor >= kpi.meta) {
            kpisCompletados++;
          }
        }
      }
    }

    const progreso = totalKPIs > 0 ? Math.round((kpisCompletados / totalKPIs) * 100) : 0;
    return { progreso, total: totalKPIs, completados: kpisCompletados };
  });

  // Computed: Color del progreso basado en porcentaje
  progresoColor = computed(() => {
    const { progreso } = this.progresoObjetivosNodo();
    if (progreso >= 75) return 'success';
    if (progreso >= 50) return 'warning';
    if (progreso >= 25) return 'info';
    return 'danger';
  });

  // Legacy - mantener para compatibilidad
  showNodeDialog = false;
  dialogTabActiva = signal<string>('0');

  // Tipo de contenedor determinado automáticamente según el nivel
  tipoContenedorActual = computed<TipoContenedorOrganizacional>(() => {
    if (this.isCreatingRoot()) return 'ORGANIZATION';
    const parent = this.parentNodeForNew();
    if (!parent) return 'ORGANIZATION';
    // Si el padre es ORGANIZATION, el hijo es AREA
    // Si el padre es AREA, el hijo es SUBAREA
    if (parent.tipo === 'ORGANIZATION') return 'AREA';
    if (parent.tipo === 'AREA') return 'SUBAREA';
    return 'SUBAREA'; // Default fallback
  });

  // Formulario reactivo con descripción y tipo
  nodeForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(500)]],
    cargo: ['', [Validators.required, Validators.maxLength(100)]],
    departamento: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email]],
    telefono: ['', [Validators.maxLength(20)]]
  });

  // Estadísticas dinámicas
  totalEmpleados = computed(() => this.organigrama()?.nodos?.length || 0);

  departamentosUnicos = computed(() => {
    const nodos = this.organigrama()?.nodos || [];
    return new Set(nodos.map((n: any) => n.departamento).filter(Boolean)).size;
  });

  nivelesJerarquicos = computed(() => {
    const calcMaxDepth = (nodes: TreeNode[], depth: number): number => {
      if (!nodes || nodes.length === 0) return depth;
      let maxDepth = depth;
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          const childDepth = calcMaxDepth(node.children, depth + 1);
          if (childDepth > maxDepth) maxDepth = childDepth;
        }
      }
      return maxDepth;
    };
    const chartData = this.orgChartData();
    return chartData.length > 0 ? calcMaxDepth(chartData, 1) : 0;
  });

  direccionesGenerales = computed(() => {
    const nodos = this.organigrama()?.nodos || [];
    return nodos.filter((n: any) => !n.padreId).length;
  });

  // Subordinados filtrados
  subordinadosFiltrados = computed(() => {
    const node = this.selectedNode();
    if (!node || !node.subordinados) return [];
    const query = this.searchSubordinadosQuery().toLowerCase();
    if (!query) return node.subordinados;
    return node.subordinados.filter((s: NodoOrganigrama) =>
      s.nombre.toLowerCase().includes(query) ||
      s.cargo.toLowerCase().includes(query) ||
      s.departamento?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.cargarOrganigrama();
  }

  cargarOrganigrama(): void {
    this.api.getOrganigramas().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.organigrama.set(data[0]);
        }
      },
      error: (err) => {
        console.error('Error cargando organigrama:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el organigrama'
        });
      }
    });
  }

  // Computed signal para el chart data - evita recálculos innecesarios
  orgChartData = computed<TreeNode[]>(() => {
    const org = this.organigrama();
    if (!org || !org.nodos || org.nodos.length === 0) {
      return [];
    }

    // Build tree from flat list of nodes
    const nodesMap = new Map<string, any>();
    org.nodos.forEach((nodo: any) => {
      nodesMap.set(nodo.id, { ...nodo, children: [], subordinados: [] });
    });

    let rootNode: any = null;
    org.nodos.forEach((nodo: any) => {
      const node = nodesMap.get(nodo.id);
      if (nodo.padreId) {
        const parent = nodesMap.get(nodo.padreId);
        if (parent) {
          parent.children.push(node);
          parent.subordinados.push(node);
        }
      } else {
        rootNode = node;
      }
    });

    if (!rootNode) {
      return [];
    }

    // Helper function to convert to TreeNode
    const convertToTreeNode = (nodo: any): TreeNode => {
      return {
        label: nodo.nombre,
        type: 'person',
        styleClass: 'org-node',
        expanded: true,
        data: {
          ...nodo,
          subordinados: nodo.children || []
        },
        children: nodo.children?.map((sub: any) => convertToTreeNode(sub)) || []
      };
    };

    return [convertToTreeNode(rootNode)];
  });

  onNodeSelect(event: { node: TreeNode }): void {
    this.selectedNode.set(event.node.data);
    this.searchSubordinadosQuery.set('');
    this.actualizarBreadcrumb(event.node.data);
    this.showDetailDrawer = true;
  }

  // =====================
  // Breadcrumb Navigation
  // =====================

  actualizarBreadcrumb(nodo: NodoOrganigrama): void {
    const items: MenuItem[] = [];
    const nodos = this.organigrama()?.nodos || [];

    // Construir ruta desde raíz hasta el nodo actual
    const buildPath = (n: NodoOrganigrama): NodoOrganigrama[] => {
      const path: NodoOrganigrama[] = [n];
      let currentId = n.padreId;
      while (currentId) {
        const parent = nodos.find((node: any) => node.id === currentId);
        if (parent) {
          path.unshift(parent);
          currentId = parent.padreId;
        } else {
          break;
        }
      }
      return path;
    };

    const path = buildPath(nodo);
    path.forEach((p, index) => {
      items.push({
        label: p.nombre,
        command: () => this.navegarANodo(p)
      });
    });

    this.breadcrumbItems.set(items);
  }

  navegarARaiz(): void {
    const chartData = this.orgChartData();
    if (chartData.length > 0) {
      const raiz = chartData[0].data;
      this.selectedNode.set(raiz);
      this.searchSubordinadosQuery.set('');
      this.actualizarBreadcrumb(raiz);
    }
  }

  navegarANodo(nodo: NodoOrganigrama): void {
    // Buscar el nodo con sus subordinados
    const nodos = this.organigrama()?.nodos || [];
    const nodesMap = new Map<string, any>();
    nodos.forEach((n: any) => {
      nodesMap.set(n.id, { ...n, subordinados: [] });
    });
    nodos.forEach((n: any) => {
      if (n.padreId) {
        const parent = nodesMap.get(n.padreId);
        if (parent) {
          parent.subordinados.push(nodesMap.get(n.id));
        }
      }
    });

    const nodoCompleto = nodesMap.get(nodo.id);
    this.selectedNode.set(nodoCompleto);
    this.searchSubordinadosQuery.set('');
    this.actualizarBreadcrumb(nodoCompleto);
  }

  seleccionarSubordinado(subordinado: NodoOrganigrama): void {
    this.navegarANodo(subordinado);
  }

  // =====================
  // CRUD - Crear Nodo
  // =====================

  // =====================
  // WIZARD - Crear Nodo
  // =====================

  abrirCrearRaiz(): void {
    if (this.orgChartData().length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ya existe un nodo raíz',
        detail: 'Solo puede haber un nodo raíz en el organigrama'
      });
      return;
    }
    this.resetWizard();
    this.isCreatingRoot.set(true);
    this.parentNodeForNew.set(null);
    this.showWizard.set(true);
  }

  abrirCrearHijo(parentNode: NodoOrganigrama): void {
    // Validar jerarquía de 3 niveles: ORGANIZATION → AREA → SUBAREA
    const tipoParent = parentNode.tipo || this.determinarTipoPorProfundidad(parentNode);

    if (tipoParent === 'SUBAREA') {
      this.messageService.add({
        severity: 'error',
        summary: 'Profundidad máxima alcanzada',
        detail: 'Solo se permiten 3 niveles: Organización → Área → Subárea. Las subáreas no pueden tener hijos.'
      });
      return;
    }

    this.resetWizard();
    this.isCreatingRoot.set(false);
    this.parentNodeForNew.set(parentNode);
    this.showWizard.set(true);
    this.showDetailDrawer = false;
  }

  resetWizard(): void {
    this.wizardPasoActual.set(0);
    this.wizardNombre.set('');
    this.wizardDescripcion.set('');
    this.wizardCargo.set('');
    this.wizardDepartamento.set('');
    this.wizardEmail.set('');
    this.wizardTelefono.set('');
    // Reset imagen/icono
    this.modoImagen.set('icono');
    this.wizardIcono.set('pi pi-building');
    this.wizardImagen.set(null);
    // Reset propiedades
    this.propiedadesCustom.set([]);
    this.objetivosSeleccionados.set([]);
    this.responsableSeleccionado.set(null);
    // Reset apetito de riesgo
    this.probabilidadInput.set(5);
    this.impactoInput.set(5);
    this.apetitoRiesgo.set(20);
    this.celdaSeleccionada.set(null);
    // Reset objetivos y KPIs
    this.objetivos.set([]);
    this.cerrarFormObjetivo();
    this.cerrarFormKPI();
  }

  cancelarWizard(): void {
    this.showWizard.set(false);
    this.resetWizard();
  }

  wizardSiguiente(): void {
    if (this.validarPasoWizard()) {
      if (this.wizardPasoActual() < this.wizardSteps.length - 1) {
        this.wizardPasoActual.update(p => p + 1);
      }
    }
  }

  wizardAnterior(): void {
    if (this.wizardPasoActual() > 0) {
      this.wizardPasoActual.update(p => p - 1);
    }
  }

  wizardIrAPaso(paso: number): void {
    // Solo permitir ir a pasos anteriores o al actual
    if (paso <= this.wizardPasoActual()) {
      this.wizardPasoActual.set(paso);
    }
  }

  validarPasoWizard(): boolean {
    const paso = this.wizardPasoActual();

    switch (paso) {
      case 0: // Información básica
        if (!this.wizardNombre().trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'El nombre del contenedor es obligatorio'
          });
          return false;
        }
        if (!this.wizardCargo().trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Campo requerido',
            detail: 'El cargo es obligatorio'
          });
          return false;
        }
        return true;
      case 1: // Responsable (opcional)
        return true;
      case 2: // Propiedades (opcional)
        return true;
      case 3: // Apetito de Riesgo (opcional)
        return true;
      case 4: // Objetivos y KPIs (opcional)
        return true;
      case 5: // Revisión
        return true;
      default:
        return true;
    }
  }

  guardarDesdeWizard(): void {
    if (!this.validarPasoWizard()) return;

    // Obtener responsable seleccionado
    const responsable = this.responsableSeleccionado()
      ? this.usuariosDisponibles().find(u => u.id === this.responsableSeleccionado())
      : undefined;

    // Obtener objetivos de negocio seleccionados
    const objetivos = this.objetivosSeleccionados()
      .map(id => this.objetivosDisponibles().find(o => o.id === id))
      .filter(Boolean) as ObjetivoNegocioVinculado[];

    // Obtener organigramaId del organigrama actual o usar el default 'org-001'
    const orgId = this.organigrama()?.id || 'org-001';
    const padreId = this.parentNodeForNew()?.id || null;

    const nuevoNodo = {
      nombre: this.wizardNombre(),
      descripcion: this.wizardDescripcion(),
      cargo: this.wizardCargo(),
      departamento: this.wizardDepartamento(),
      email: this.wizardEmail(),
      telefono: this.wizardTelefono(),
      tipo: this.tipoContenedorActual(),
      organigramaId: orgId,
      padreId: padreId,
      responsable,
      propiedadesCustom: this.propiedadesCustom(),
      objetivosNegocio: objetivos,
      subordinados: [] // Inicializar array de subordinados vacío
    };

    this.api.addNodoOrganigrama(nuevoNodo).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contenedor creado',
          detail: `"${this.wizardNombre()}" (${this.ETIQUETAS[this.tipoContenedorActual()]}) se creó correctamente`
        });
        this.showWizard.set(false);
        this.resetWizard();
        this.cargarOrganigrama();
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al crear',
          detail: err.message || 'No se pudo crear el contenedor'
        });
      }
    });
  }

  // Determinar tipo basado en profundidad (para nodos sin tipo asignado)
  determinarTipoPorProfundidad(nodo: NodoOrganigrama): TipoContenedorOrganizacional {
    const depth = this.calcularProfundidad(nodo);
    if (depth === 1) return 'ORGANIZATION';
    if (depth === 2) return 'AREA';
    return 'SUBAREA';
  }

  calcularProfundidad(nodo: NodoOrganigrama): number {
    let depth = 1;
    let currentId = nodo.padreId;
    const nodos = this.organigrama()?.nodos || [];

    while (currentId) {
      const parent = nodos.find((n: any) => n.id === currentId);
      if (parent) {
        depth++;
        currentId = parent.padreId;
      } else {
        break;
      }
    }
    return depth;
  }

  // =====================
  // DRAWER - Editar Nodo
  // =====================

  abrirEditar(node: NodoOrganigrama): void {
    this.editingNode.set(node);

    // Cargar datos del nodo en los signals de edición
    this.wizardNombre.set(node.nombre);
    this.wizardDescripcion.set(node.descripcion || '');
    this.wizardCargo.set(node.cargo);
    this.wizardDepartamento.set(node.departamento || '');
    this.wizardEmail.set(node.email || '');
    this.wizardTelefono.set(node.telefono || '');

    // Cargar imagen/icono
    if ((node as any).imagen) {
      this.modoImagen.set('imagen');
      this.wizardImagen.set((node as any).imagen);
    } else {
      this.modoImagen.set('icono');
      this.wizardIcono.set((node as any).icono || this.getIconoTipo(node.tipo));
    }

    // Cargar propiedades custom
    this.propiedadesCustom.set(node.propiedadesCustom ? [...node.propiedadesCustom] : []);

    // Cargar objetivos seleccionados
    this.objetivosSeleccionados.set(node.objetivosNegocio?.map(o => o.id) || []);

    // Cargar responsable
    this.responsableSeleccionado.set(node.responsable?.id || null);

    this.editTabActiva.set('0');
    this.showEditDrawer.set(true);
    this.showDetailDrawer = false;
  }

  cerrarEditDrawer(): void {
    this.showEditDrawer.set(false);
    this.editingNode.set(null);
  }

  guardarEdicion(): void {
    const editing = this.editingNode();
    if (!editing) return;

    if (!this.wizardNombre().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre del contenedor es obligatorio'
      });
      return;
    }

    // Obtener responsable seleccionado
    const responsable = this.responsableSeleccionado()
      ? this.usuariosDisponibles().find(u => u.id === this.responsableSeleccionado())
      : undefined;

    // Obtener objetivos de negocio seleccionados
    const objetivos = this.objetivosSeleccionados()
      .map(id => this.objetivosDisponibles().find(o => o.id === id))
      .filter(Boolean) as ObjetivoNegocioVinculado[];

    const updateData = {
      nombre: this.wizardNombre(),
      descripcion: this.wizardDescripcion(),
      cargo: this.wizardCargo(),
      departamento: this.wizardDepartamento(),
      email: this.wizardEmail(),
      telefono: this.wizardTelefono(),
      tipo: editing.tipo, // Mantener el tipo original
      responsable,
      propiedadesCustom: this.propiedadesCustom(),
      objetivosNegocio: objetivos
    };

    this.api.updateNodoOrganigrama(editing.id, updateData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Contenedor actualizado',
          detail: `"${this.wizardNombre()}" se actualizó correctamente`
        });
        this.showEditDrawer.set(false);
        this.editingNode.set(null);
        this.cargarOrganigrama();
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al actualizar',
          detail: err.message || 'No se pudo actualizar el contenedor'
        });
      }
    });
  }

  // Legacy method - mantener para compatibilidad si es necesario
  guardarNodo(): void {
    // Redirigir a guardarEdicion si hay un nodo en edición
    if (this.editingNode()) {
      this.guardarEdicion();
    }
  }

  // =====================
  // CRUD - Eliminar Nodo
  // =====================

  confirmarEliminar(node: NodoOrganigrama): void {
    // Verificar si tiene hijos
    const tieneHijos = node.subordinados && node.subordinados.length > 0;

    if (tieneHijos) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No se puede eliminar',
        detail: 'Este nodo tiene subordinados. Elimínelos primero.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${node.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarNodo(node)
    });
  }

  eliminarNodo(node: NodoOrganigrama): void {
    this.api.deleteNodoOrganigrama(node.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Nodo eliminado',
          detail: `"${node.nombre}" se eliminó correctamente`
        });
        this.showDetailDrawer = false;
        this.selectedNode.set(null);
        this.cargarOrganigrama();
      },
      error: (err: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al eliminar',
          detail: err.message || 'No se pudo eliminar el nodo'
        });
      }
    });
  }

  // =====================
  // Helpers
  // =====================

  getWizardTitle(): string {
    if (this.isCreatingRoot()) {
      return 'Crear Organización';
    }
    const parent = this.parentNodeForNew();
    const tipoHijo = this.tipoContenedorActual();
    return parent ? `Nuevo ${this.ETIQUETAS[tipoHijo]} en "${parent.nombre}"` : 'Crear Contenedor';
  }

  getEditDrawerTitle(): string {
    const node = this.editingNode();
    return node ? `Editar: ${node.nombre}` : 'Editar Contenedor';
  }

  cancelarDialog(): void {
    // Legacy - redirigir a cancelarWizard
    this.cancelarWizard();
  }

  cerrarDrawer(): void {
    this.showDetailDrawer = false;
    this.selectedNode.set(null);
    this.breadcrumbItems.set([]);
  }

  // =====================
  // Propiedades Custom
  // =====================

  agregarPropiedadCustom(): void {
    const nueva = this.nuevaPropiedad();
    if (!nueva.nombre?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre de la propiedad es obligatorio'
      });
      return;
    }

    const propiedadCompleta: PropiedadOrganizacion = {
      id: Date.now().toString(),
      nombre: nueva.nombre.trim(),
      tipo: nueva.tipo || 'TEXT',
      valor: nueva.tipo === 'NUMBER' ? 0 : '',
      requerido: nueva.requerido || false
    };

    this.propiedadesCustom.update(props => [...props, propiedadCompleta]);
    this.nuevaPropiedad.set({ nombre: '', tipo: 'TEXT', requerido: false });
  }

  eliminarPropiedadCustom(id: string): void {
    this.propiedadesCustom.update(props => props.filter(p => p.id !== id));
  }

  actualizarValorPropiedad(id: string, valor: string | number): void {
    this.propiedadesCustom.update(props =>
      props.map(p => p.id === id ? { ...p, valor } : p)
    );
  }

  // =====================
  // Objetivos de Negocio
  // =====================

  getObjetivosVinculados(): ObjetivoNegocioVinculado[] {
    return this.objetivosSeleccionados()
      .map(id => this.objetivosDisponibles().find(o => o.id === id))
      .filter(Boolean) as ObjetivoNegocioVinculado[];
  }

  // =====================
  // Helpers para visualización
  // =====================

  getIconoTipo(tipo: TipoContenedorOrganizacional | undefined): string {
    return tipo ? this.ICONOS[tipo] : 'pi pi-circle';
  }

  getColorTipo(tipo: TipoContenedorOrganizacional | undefined): string {
    return tipo ? this.COLORES[tipo] : 'var(--surface-400)';
  }

  getEtiquetaTipo(tipo: TipoContenedorOrganizacional | undefined): string {
    return tipo ? this.ETIQUETAS[tipo] : 'Nodo';
  }

  getSeverityTipo(tipo: TipoContenedorOrganizacional | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!tipo) return 'secondary';
    switch (tipo) {
      case 'ORGANIZATION': return 'info';
      case 'AREA': return 'warn';
      case 'SUBAREA': return 'success';
      default: return 'secondary';
    }
  }

  // Verificar si un nodo puede tener hijos (solo ORGANIZATION y AREA)
  puedeAgregarHijo(nodo: NodoOrganigrama): boolean {
    const tipo = nodo.tipo || this.determinarTipoPorProfundidad(nodo);
    return tipo !== 'SUBAREA';
  }

  // Obtener el nombre del responsable de un nodo
  getNombreResponsable(nodo: NodoOrganigrama): string {
    return nodo.responsable?.nombre || 'Sin asignar';
  }

  // Helpers para actualizar nuevaPropiedad desde el template
  updateNuevaPropiedadNombre(nombre: string): void {
    this.nuevaPropiedad.update(p => ({ ...p, nombre }));
  }

  updateNuevaPropiedadTipo(tipo: TipoPropiedadOrganizacion): void {
    this.nuevaPropiedad.update(p => ({ ...p, tipo }));
  }

  updateNuevaPropiedadRequerido(requerido: boolean): void {
    this.nuevaPropiedad.update(p => ({ ...p, requerido }));
  }

  // =====================
  // Mapa de Calor / Apetito de Riesgo
  // =====================

  getProbabilidadArray(): number[] {
    const max = this.probabilidadInput();
    return Array.from({ length: max }, (_, i) => max - i);
  }

  getImpactoArray(): number[] {
    const max = this.impactoInput();
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  actualizarProbabilidad(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.probabilidadInput.set(v);
    const celda = this.celdaSeleccionada();
    if (celda && celda.probabilidad > v) {
      this.celdaSeleccionada.set(null);
    }
  }

  actualizarImpacto(valor: number): void {
    const v = Math.max(1, Math.min(10, valor));
    this.impactoInput.set(v);
    const celda = this.celdaSeleccionada();
    if (celda && celda.impacto > v) {
      this.celdaSeleccionada.set(null);
    }
  }

  seleccionarCeldaDirecta(prob: number, imp: number): void {
    this.celdaSeleccionada.set({ probabilidad: prob, impacto: imp });
  }

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

  isCeldaSeleccionadaDinamica(prob: number, imp: number): boolean {
    const celda = this.celdaSeleccionada();
    return celda?.probabilidad === prob && celda?.impacto === imp;
  }

  estaDentroApetitoDinamico(prob: number, imp: number): boolean {
    const maxProb = this.probabilidadInput();
    const maxImp = this.impactoInput();
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentajeRiesgo = (score / maxScore) * 100;
    return porcentajeRiesgo <= this.apetitoRiesgo();
  }

  incrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.min(v + 5, 100));
  }

  decrementarApetito(): void {
    this.apetitoRiesgo.update(v => Math.max(v - 5, 0));
  }

  // =====================
  // Objetivos y KPIs
  // =====================

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
            ? { ...o, nombre: this.nuevoObjetivoNombre(), descripcion: this.nuevoObjetivoDescripcion(), tipo: this.nuevoObjetivoTipo() }
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

  // KPIs
  abrirFormKPI(objetivoId: string, kpi?: KPI): void {
    this.cerrarFormObjetivo();
    if (kpi) {
      this.kpiEditandoId.set(kpi.id);
      this.nuevoKPINombre.set(kpi.nombre);
      this.nuevoKPIMeta.set(kpi.meta);
      this.nuevoKPIActual.set(kpi.actual);
      this.nuevoKPIEscala.set(kpi.escala);
      this.nuevoKPIUmbralAlerta.set(kpi.umbralAlerta);
      this.nuevoKPIUmbralMaximo.set(kpi.umbralMaximo);
      this.nuevoKPISeveridad.set(kpi.severidad);
      this.nuevoKPIDireccion.set(kpi.direccion);
      this.nuevoKPICanales.set([...kpi.canalesNotificacion]);
      this.nuevoKPIFrecuencia.set(kpi.frecuenciaEvaluacion);
    } else {
      this.kpiEditandoId.set(null);
      this.nuevoKPINombre.set('');
      this.nuevoKPIMeta.set(75);
      this.nuevoKPIActual.set(0);
      this.nuevoKPIEscala.set('Porcentaje');
      this.nuevoKPIUmbralAlerta.set(50);
      this.nuevoKPIUmbralMaximo.set(null);
      this.nuevoKPISeveridad.set('warning');
      this.nuevoKPIDireccion.set('mayor_mejor');
      this.nuevoKPICanales.set(['in-app']);
      this.nuevoKPIFrecuencia.set('diaria');
    }
    this.mostrarFormKPIInline.set(objetivoId);
  }

  cerrarFormKPI(): void {
    this.mostrarFormKPIInline.set(null);
    this.kpiEditandoId.set(null);
    this.nuevoKPINombre.set('');
    this.nuevoKPICanales.set(['in-app']);
    this.nuevoKPIFrecuencia.set('diaria');
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
      actual: this.nuevoKPIActual(),
      escala: this.nuevoKPIEscala(),
      umbralAlerta: this.nuevoKPIUmbralAlerta(),
      umbralMaximo: this.nuevoKPIUmbralMaximo(),
      severidad: this.nuevoKPISeveridad(),
      canalesNotificacion: this.nuevoKPICanales(),
      frecuenciaEvaluacion: this.nuevoKPIFrecuencia(),
      direccion: this.nuevoKPIDireccion()
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

  getTipoLabel(tipo: string): string {
    return tipo === 'estrategico' ? 'Estratégico' : 'Operativo';
  }

  getKPIProgreso(kpi: KPI): number {
    if (kpi.meta === 0) return 0;
    const progreso = Math.round((kpi.actual / kpi.meta) * 100);
    return Math.min(progreso, 100);
  }

  getSeveridadLabel(severidad: AlertSeverity): string {
    const opt = this.severidadOptions.find(o => o.value === severidad);
    return opt?.label || severidad;
  }

  getSeveridadIcon(severidad: AlertSeverity): string {
    const opt = this.severidadOptions.find(o => o.value === severidad);
    return opt?.icon || 'pi pi-info-circle';
  }

  getSeveridadColor(severidad: AlertSeverity): string {
    const opt = this.severidadOptions.find(o => o.value === severidad);
    return opt?.color || 'var(--blue-500)';
  }

  getCanalesLabel(canales: NotificationChannel[]): string {
    return canales.map(c => {
      const opt = this.canalesOptions.find(o => o.value === c);
      return opt?.label || c;
    }).join(', ');
  }

  getFrecuenciaLabel(frecuencia: EvaluationFrequency): string {
    const opt = this.frecuenciaOptions.find(o => o.value === frecuencia);
    return opt?.label || frecuencia;
  }

  toggleCanal(canalValue: string): void {
    const canal = canalValue as NotificationChannel;
    const canales = this.nuevoKPICanales();
    if (canales.includes(canal)) {
      this.nuevoKPICanales.set(canales.filter(c => c !== canal));
    } else {
      this.nuevoKPICanales.set([...canales, canal]);
    }
  }

  isCanalSelected(canalValue: string): boolean {
    return this.nuevoKPICanales().includes(canalValue as NotificationChannel);
  }

  // Navegación a objetivos-kpis
  verObjetivosKPIs(): void {
    const nodo = this.selectedNode();
    if (nodo) {
      this.router.navigate(['/organigramas', nodo.id, 'objetivos-kpis']);
    }
  }

  // Verifica si el nodo puede mostrar objetivos (ORGANIZATION o AREA)
  puedeVerObjetivos(nodo: NodoOrganigrama): boolean {
    return nodo.tipo === 'ORGANIZATION' || nodo.tipo === 'AREA';
  }

  // =====================
  // Mini Mapa de Calor (para acordeón)
  // =====================

  getMiniProbabilidadArray(nodo: NodoOrganigrama): number[] {
    const max = (nodo as any).apetitoRiesgo?.probabilidad || 5;
    return Array.from({ length: max }, (_, i) => max - i);
  }

  getMiniImpactoArray(nodo: NodoOrganigrama): number[] {
    const max = (nodo as any).apetitoRiesgo?.impacto || 5;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  getMiniCeldaNivel(prob: number, imp: number, nodo: NodoOrganigrama): string {
    const apetito = (nodo as any).apetitoRiesgo;
    const maxProb = apetito?.probabilidad || 5;
    const maxImp = apetito?.impacto || 5;
    const maxScore = maxProb * maxImp;
    const score = prob * imp;
    const porcentaje = (score / maxScore) * 100;
    if (porcentaje <= 16) return 'bajo';
    if (porcentaje <= 36) return 'medio';
    if (porcentaje <= 64) return 'alto';
    return 'critico';
  }

  isMiniCeldaSeleccionada(prob: number, imp: number, nodo: NodoOrganigrama): boolean {
    const apetito = (nodo as any).apetitoRiesgo;
    if (!apetito?.celdaSeleccionada) return false;
    return apetito.celdaSeleccionada.probabilidad === prob && apetito.celdaSeleccionada.impacto === imp;
  }

  // =====================
  // Imagen / Icono
  // =====================

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Archivo inválido',
          detail: 'Por favor seleccione una imagen'
        });
        return;
      }

      // Validar tamaño (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Archivo muy grande',
          detail: 'La imagen no debe superar 2MB'
        });
        return;
      }

      // Convertir a base64
      const reader = new FileReader();
      reader.onload = () => {
        this.wizardImagen.set(reader.result as string);
        this.modoImagen.set('imagen');
      };
      reader.readAsDataURL(file);
    }
  }

  seleccionarIcono(icono: string): void {
    this.wizardIcono.set(icono);
    this.modoImagen.set('icono');
    this.wizardImagen.set(null);
  }

  eliminarImagen(): void {
    this.wizardImagen.set(null);
    this.modoImagen.set('icono');
  }

  getIconoActual(): string {
    if (this.modoImagen() === 'imagen' && this.wizardImagen()) {
      return '';
    }
    return this.wizardIcono();
  }

  // ========== ZOOM Y PAN METHODS ==========

  zoomIn(): void {
    const newZoom = Math.min(this.zoom() + this.ZOOM_STEP, this.MAX_ZOOM);
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  zoomOut(): void {
    const newZoom = Math.max(this.zoom() - this.ZOOM_STEP, this.MIN_ZOOM);
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  resetZoom(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  fitToScreen(): void {
    // Reset to center and fit
    this.zoom.set(0.8);
    this.panX.set(0);
    this.panY.set(0);
  }

  // Mouse wheel zoom
  onChartWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = event.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
    const newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, this.zoom() + delta));
    this.zoom.set(Number(newZoom.toFixed(2)));
  }

  // Middle mouse button pan start (button 1 = middle/wheel click)
  onChartMouseDown(event: MouseEvent): void {
    // Only pan with middle click (button 1) - left click (0) passes through to nodes
    if (event.button === 1) {
      event.preventDefault();
      this.isPanning.set(true);
      this.lastPanPosition = { x: event.clientX, y: event.clientY };
    }
  }

  // Mouse move for panning
  onChartMouseMove(event: MouseEvent): void {
    if (this.isPanning()) {
      event.preventDefault();
      const deltaX = event.clientX - this.lastPanPosition.x;
      const deltaY = event.clientY - this.lastPanPosition.y;

      this.panX.update(x => x + deltaX);
      this.panY.update(y => y + deltaY);

      this.lastPanPosition = { x: event.clientX, y: event.clientY };
    }
  }

  // Mouse up to stop panning
  onChartMouseUp(event: MouseEvent): void {
    if (event.button === 1) {
      this.isPanning.set(false);
    }
  }

  // Mouse leave to stop panning
  onChartMouseLeave(): void {
    this.isPanning.set(false);
  }

  // Keyboard shortcuts
  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Only handle if not in an input field
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl/Cmd + Plus: Zoom in
    if ((event.ctrlKey || event.metaKey) && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      this.zoomIn();
    }
    // Ctrl/Cmd + Minus: Zoom out
    if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault();
      this.zoomOut();
    }
    // Ctrl/Cmd + 0: Reset zoom
    if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault();
      this.resetZoom();
    }
    // Arrow keys for panning (when not in input)
    const PAN_AMOUNT = 50;
    if (event.key === 'ArrowUp' && !event.ctrlKey) {
      this.panY.update(y => y + PAN_AMOUNT);
    }
    if (event.key === 'ArrowDown' && !event.ctrlKey) {
      this.panY.update(y => y - PAN_AMOUNT);
    }
    if (event.key === 'ArrowLeft' && !event.ctrlKey) {
      this.panX.update(x => x + PAN_AMOUNT);
    }
    if (event.key === 'ArrowRight' && !event.ctrlKey) {
      this.panX.update(x => x - PAN_AMOUNT);
    }
  }
}
