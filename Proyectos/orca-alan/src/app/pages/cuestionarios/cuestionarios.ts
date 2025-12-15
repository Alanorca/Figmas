import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Components
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { StepperModule } from 'primeng/stepper';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { DatePickerModule } from 'primeng/datepicker';
import { DragDropModule } from 'primeng/dragdrop';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FileUploadModule } from 'primeng/fileupload';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitterModule } from 'primeng/splitter';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AvatarModule } from 'primeng/avatar';

// Shared Models
import {
  MarcoNormativo,
  RequisitoNormativo,
  Cuestionario,
  Seccion,
  Pregunta
} from '../../models/cuestionarios.models';

@Component({
  selector: 'app-cuestionarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    TagModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    ProgressBarModule,
    ChipModule,
    MenuModule,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule,
    TabsModule,
    StepperModule,
    CheckboxModule,
    RadioButtonModule,
    InputNumberModule,
    SliderModule,
    RatingModule,
    DatePickerModule,
    DragDropModule,
    PanelModule,
    DividerModule,
    AccordionModule,
    FieldsetModule,
    ToggleSwitchModule,
    FileUploadModule,
    MultiSelectModule,
    SplitterModule,
    MessageModule,
    ScrollPanelModule,
    AvatarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cuestionarios.html',
  styleUrl: './cuestionarios.scss'
})
export class CuestionariosComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // =============================================
  // ESTADO DE LA VISTA - Solo vistas de creación
  // =============================================
  vistaActual = signal<'lista' | 'editor' | 'wizard' | 'detalle'>('lista');

  // =============================================
  // FILTROS
  // =============================================
  busqueda = signal('');
  filtroEstado = signal<string | null>(null);
  filtroCategoria = signal<string | null>(null);
  filtroTipo = signal<string | null>(null);
  filtroMarco = signal<string | null>(null);

  // =============================================
  // DIALOGS
  // =============================================
  showNuevoDialog = signal(false);
  showIADialog = signal(false);

  // =============================================
  // SELECCIONES
  // =============================================
  cuestionarioSeleccionado = signal<Cuestionario | null>(null);
  editandoDetalle = signal(false);

  // =============================================
  // NUEVO CUESTIONARIO
  // =============================================
  nuevoCuestionario = signal<Partial<Cuestionario>>({
    nombre: '',
    descripcion: '',
    categoria: '',
    tipo: 'manual',
    tipoEvaluacion: 'autoevaluacion',
    estado: 'borrador',
    marcoNormativo: '',
    periodicidad: 'anual',
    umbrales: { deficiente: 50, aceptable: 70, sobresaliente: 90 },
    secciones: [],
    areasObjetivo: [],
    responsables: []
  });

  // =============================================
  // DETALLE STATE
  // =============================================
  tabDetalleActivo = signal<'componentes' | 'informacion'>('componentes');
  seccionSeleccionadaIndex = signal<number>(0);

  // =============================================
  // EDITOR STATE
  // =============================================
  seccionActiva = signal<string | null>(null);
  preguntaArrastrada = signal<Pregunta | null>(null);
  menuSeccionActual = signal<string>('');
  preguntaSeleccionada = signal<Pregunta | null>(null);

  // =============================================
  // IA
  // =============================================
  promptIA = signal('');
  generandoIA = signal(false);

  // =============================================
  // WIZARD NUEVO CUESTIONARIO
  // =============================================
  showWizardDialog = signal(false);
  wizardPaso = signal(0);
  metodoCreacion = signal<'manual' | 'ia' | null>(null);
  wizardDatosGenerales = signal<{
    nombre: string;
    descripcion: string;
    marcoNormativo: string;
    tipoEvaluacion: string;
    periodicidad: string;
    areasObjetivo: string[];
  }>({
    nombre: '',
    descripcion: '',
    marcoNormativo: '',
    tipoEvaluacion: 'autoevaluacion',
    periodicidad: 'anual',
    areasObjetivo: []
  });
  wizardUmbrales = signal<{
    deficiente: number;
    aceptable: number;
    sobresaliente: number;
  }>({
    deficiente: 50,
    aceptable: 70,
    sobresaliente: 90
  });
  wizardIAMetodo = signal<'prompt' | 'documento'>('prompt');
  wizardDocumento = signal<File | null>(null);
  wizardPreviewCuestionario = signal<Cuestionario | null>(null);

  // =============================================
  // OPCIONES DE FILTROS Y SELECT
  // =============================================
  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Borrador', value: 'borrador' },
    { label: 'Activo', value: 'activo' },
    { label: 'Archivado', value: 'archivado' }
  ];

  categoriaOptions = [
    { label: 'Todas', value: null },
    { label: 'Cumplimiento', value: 'cumplimiento' },
    { label: 'Seguridad', value: 'seguridad' },
    { label: 'Riesgos', value: 'riesgos' },
    { label: 'Auditoría', value: 'auditoria' },
    { label: 'Controles', value: 'controles' }
  ];

  tipoOptions = [
    { label: 'Todos', value: null },
    { label: 'IA', value: 'ia' },
    { label: 'Manual', value: 'manual' }
  ];

  tipoEvaluacionOptions = [
    { label: 'Autoevaluación', value: 'autoevaluacion' },
    { label: 'Auditoría Externa', value: 'auditoria_externa' },
    { label: 'Revisión de Controles', value: 'revision_controles' }
  ];

  periodicidadOptions = [
    { label: 'Única', value: 'unica' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Semestral', value: 'semestral' },
    { label: 'Anual', value: 'anual' }
  ];

  tiposPregunta: { label: string; value: Pregunta['tipo']; icon: string }[] = [
    { label: 'Texto libre', value: 'texto', icon: 'pi pi-align-left' },
    { label: 'Texto largo', value: 'textoLargo', icon: 'pi pi-align-justify' },
    { label: 'Opción múltiple', value: 'opcionMultiple', icon: 'pi pi-check-square' },
    { label: 'Selección única', value: 'seleccionUnica', icon: 'pi pi-circle' },
    { label: 'Radio Buttons', value: 'radioButtons', icon: 'pi pi-circle-fill' },
    { label: 'Escala numérica', value: 'escala', icon: 'pi pi-sliders-h' },
    { label: 'Sí/No/N/A', value: 'siNoNa', icon: 'pi pi-check' },
    { label: 'Fecha', value: 'fecha', icon: 'pi pi-calendar' },
    { label: 'Número', value: 'numero', icon: 'pi pi-hashtag' },
    { label: 'Archivo adjunto', value: 'archivo', icon: 'pi pi-paperclip' },
    { label: 'Matriz', value: 'matriz', icon: 'pi pi-table' },
    { label: 'Grupo', value: 'grupo', icon: 'pi pi-folder' },
    { label: 'URL', value: 'url', icon: 'pi pi-link' }
  ];

  areasOptions = [
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Finanzas', value: 'finanzas' },
    { label: 'Operaciones', value: 'operaciones' },
    { label: 'Recursos Humanos', value: 'rrhh' },
    { label: 'Legal', value: 'legal' },
    { label: 'Cumplimiento', value: 'cumplimiento' }
  ];

  // Marcos normativos seleccionados para multiselect
  marcosSeleccionados: MarcoNormativo[] = [];

  // =============================================
  // DATOS MOCK - MARCOS NORMATIVOS
  // =============================================
  marcosNormativos = signal<MarcoNormativo[]>([
    {
      id: 'iso27001',
      nombre: 'ISO/IEC 27001:2022',
      acronimo: 'ISO 27001',
      version: '2022',
      fechaVigencia: new Date('2022-10-25'),
      descripcion: 'Sistema de Gestión de Seguridad de la Información',
      activo: true,
      requisitos: [
        { id: 'r1', codigo: 'A.5.1', nombre: 'Políticas de seguridad de la información', descripcion: 'Directrices de gestión para seguridad de la información', marcoId: 'iso27001', controlesAsociados: [] },
        { id: 'r2', codigo: 'A.5.2', nombre: 'Roles y responsabilidades', descripcion: 'Segregación de funciones', marcoId: 'iso27001', controlesAsociados: [] },
        { id: 'r3', codigo: 'A.8.1', nombre: 'Gestión de activos', descripcion: 'Inventario de activos de información', marcoId: 'iso27001', controlesAsociados: [] }
      ]
    },
    {
      id: 'sox',
      nombre: 'Sarbanes-Oxley Act',
      acronimo: 'SOX',
      version: '2002',
      fechaVigencia: new Date('2002-07-30'),
      descripcion: 'Ley de protección al inversionista y reforma contable de empresas',
      activo: true,
      requisitos: [
        { id: 'r4', codigo: 'SOX 302', nombre: 'Certificación de informes', descripcion: 'Responsabilidad corporativa por informes financieros', marcoId: 'sox', controlesAsociados: [] },
        { id: 'r5', codigo: 'SOX 404', nombre: 'Evaluación de controles internos', descripcion: 'Evaluación de la gestión de controles internos', marcoId: 'sox', controlesAsociados: [] }
      ]
    },
    {
      id: 'gdpr',
      nombre: 'General Data Protection Regulation',
      acronimo: 'GDPR',
      version: '2016/679',
      fechaVigencia: new Date('2018-05-25'),
      descripcion: 'Reglamento General de Protección de Datos de la UE',
      activo: true,
      requisitos: [
        { id: 'r6', codigo: 'Art. 5', nombre: 'Principios del tratamiento', descripcion: 'Licitud, lealtad y transparencia', marcoId: 'gdpr', controlesAsociados: [] },
        { id: 'r7', codigo: 'Art. 32', nombre: 'Seguridad del tratamiento', descripcion: 'Medidas técnicas y organizativas', marcoId: 'gdpr', controlesAsociados: [] }
      ]
    },
    {
      id: 'pcidss',
      nombre: 'Payment Card Industry Data Security Standard',
      acronimo: 'PCI-DSS',
      version: '4.0',
      fechaVigencia: new Date('2022-03-31'),
      descripcion: 'Estándar de seguridad de datos para la industria de tarjetas de pago',
      activo: true,
      requisitos: [
        { id: 'r8', codigo: 'Req. 1', nombre: 'Firewall Configuration', descripcion: 'Instalar y mantener configuración de firewall', marcoId: 'pcidss', controlesAsociados: [] },
        { id: 'r9', codigo: 'Req. 3', nombre: 'Protect Stored Data', descripcion: 'Proteger datos del titular de la tarjeta', marcoId: 'pcidss', controlesAsociados: [] }
      ]
    }
  ]);

  // =============================================
  // DATOS MOCK - CUESTIONARIOS
  // =============================================
  cuestionarios = signal<Cuestionario[]>([
    {
      id: '1',
      nombre: 'Evaluación de Controles SOX',
      descripcion: 'Cuestionario anual de cumplimiento SOX para controles internos',
      categoria: 'cumplimiento',
      tipo: 'manual',
      tipoEvaluacion: 'revision_controles',
      estado: 'activo',
      marcoNormativo: 'sox',
      periodicidad: 'anual',
      preguntas: 45,
      respuestas: 128,
      tasaCompletado: 87,
      fechaCreacion: new Date('2024-01-15'),
      fechaModificacion: new Date('2024-11-20'),
      umbrales: { deficiente: 50, aceptable: 70, sobresaliente: 90 },
      areasObjetivo: ['finanzas', 'tecnologia'],
      responsables: ['user1', 'user2'],
      secciones: [
        {
          id: 's1',
          nombre: 'Ambiente de Control',
          descripcion: 'Evaluación del ambiente de control interno',
          peso: 30,
          preguntas: [
            { id: 'p1', texto: '¿Existe un código de ética documentado y comunicado a todos los empleados?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true, requisitoNormativoId: 'r4' },
            { id: 'p2', texto: '¿Se realiza capacitación anual sobre controles internos?', tipo: 'siNoNa', requerida: true, peso: 8, requiereEvidencia: true },
            { id: 'p3', texto: 'Describa los mecanismos de comunicación del código de ética', tipo: 'texto', requerida: false, peso: 5, requiereEvidencia: false }
          ]
        },
        {
          id: 's2',
          nombre: 'Evaluación de Riesgos',
          descripcion: 'Proceso de evaluación de riesgos financieros',
          peso: 35,
          preguntas: [
            { id: 'p4', texto: '¿Se realiza una evaluación de riesgos al menos anualmente?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true, requisitoNormativoId: 'r5' },
            { id: 'p5', texto: '¿Cuál es la frecuencia de revisión de la matriz de riesgos?', tipo: 'seleccionUnica', requerida: true, peso: 10, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Semestral', 'Anual'] }
          ]
        }
      ]
    },
    {
      id: '2',
      nombre: 'Análisis de Riesgos Operativos',
      descripcion: 'Identificación y evaluación de riesgos operativos por área',
      categoria: 'riesgos',
      tipo: 'ia',
      tipoEvaluacion: 'autoevaluacion',
      estado: 'activo',
      marcoNormativo: 'iso27001',
      periodicidad: 'trimestral',
      preguntas: 32,
      respuestas: 89,
      tasaCompletado: 72,
      fechaCreacion: new Date('2024-03-10'),
      fechaModificacion: new Date('2024-11-18'),
      umbrales: { deficiente: 40, aceptable: 65, sobresaliente: 85 },
      areasObjetivo: ['operaciones', 'tecnologia'],
      responsables: ['user3'],
      secciones: []
    },
    {
      id: '3',
      nombre: 'Evaluación de Seguridad TI',
      descripcion: 'Cuestionario de seguridad informática basado en ISO 27001',
      categoria: 'seguridad',
      tipo: 'manual',
      tipoEvaluacion: 'auditoria_externa',
      estado: 'borrador',
      marcoNormativo: 'iso27001',
      periodicidad: 'anual',
      preguntas: 78,
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date('2024-11-01'),
      fechaModificacion: new Date('2024-11-25'),
      umbrales: { deficiente: 60, aceptable: 75, sobresaliente: 92 },
      areasObjetivo: ['tecnologia'],
      responsables: ['user4'],
      secciones: []
    },
    {
      id: '4',
      nombre: 'Cumplimiento GDPR',
      descripcion: 'Evaluación de cumplimiento de protección de datos personales',
      categoria: 'cumplimiento',
      tipo: 'ia',
      tipoEvaluacion: 'autoevaluacion',
      estado: 'activo',
      marcoNormativo: 'gdpr',
      periodicidad: 'semestral',
      preguntas: 56,
      respuestas: 234,
      tasaCompletado: 95,
      fechaCreacion: new Date('2024-02-20'),
      fechaModificacion: new Date('2024-11-22'),
      umbrales: { deficiente: 55, aceptable: 72, sobresaliente: 88 },
      areasObjetivo: ['legal', 'tecnologia', 'rrhh'],
      responsables: ['user1', 'user5'],
      secciones: []
    }
  ]);

  // =============================================
  // ESTADÍSTICAS COMPUTADAS
  // =============================================
  totalCuestionarios = computed(() => this.cuestionarios().length);
  totalActivos = computed(() => this.cuestionarios().filter(c => c.estado === 'activo').length);
  totalBorradores = computed(() => this.cuestionarios().filter(c => c.estado === 'borrador').length);
  totalPreguntas = computed(() => this.cuestionarios().reduce((sum, c) => sum + c.preguntas, 0));

  // Métodos para totales del pie de tabla
  getCategoriasTotales(): number {
    const categorias = new Set(this.cuestionarios().map(c => c.categoria));
    return categorias.size;
  }

  getTotalPorTipo(tipo: 'ia' | 'manual'): number {
    return this.cuestionarios().filter(c => c.tipo === tipo).length;
  }

  getPromedioCumplimiento(): number {
    const cuestionarios = this.cuestionarios();
    if (cuestionarios.length === 0) return 0;
    const suma = cuestionarios.reduce((sum, c) => sum + c.tasaCompletado, 0);
    return Math.round(suma / cuestionarios.length);
  }

  // =============================================
  // CUESTIONARIOS FILTRADOS
  // =============================================
  cuestionariosFiltrados = computed(() => {
    let resultado = this.cuestionarios();

    if (this.busqueda()) {
      const busquedaLower = this.busqueda().toLowerCase();
      resultado = resultado.filter(c =>
        c.nombre.toLowerCase().includes(busquedaLower) ||
        c.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroEstado()) {
      resultado = resultado.filter(c => c.estado === this.filtroEstado());
    }

    if (this.filtroCategoria()) {
      resultado = resultado.filter(c => c.categoria === this.filtroCategoria());
    }

    if (this.filtroTipo()) {
      resultado = resultado.filter(c => c.tipo === this.filtroTipo());
    }

    if (this.filtroMarco()) {
      resultado = resultado.filter(c => c.marcoNormativo === this.filtroMarco());
    }

    return resultado;
  });

  // =============================================
  // MÉTODOS - UTILIDADES
  // =============================================
  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'activo': return 'success';
      case 'borrador': return 'warn';
      case 'archivado': return 'secondary';
      default: return 'info';
    }
  }

  getTipoSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return tipo === 'ia' ? 'info' : 'secondary';
  }

  getMarcoNombre(marcoId: string): string {
    const marco = this.marcosNormativos().find(m => m.id === marcoId);
    return marco ? marco.acronimo : marcoId;
  }

  getMarcoSeverity(marcoId: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'iso27001': 'info',
      'sox': 'warn',
      'gdpr': 'success',
      'pcidss': 'danger',
      'nist': 'secondary'
    };
    return severities[marcoId] || 'info';
  }

  agregarNuevoMarco(): void {
    // Por ahora solo mostrar mensaje, en implementación real se abriría un dialog
    this.messageService.add({
      severity: 'info',
      summary: 'Agregar Marco',
      detail: 'Esta funcionalidad permitirá agregar nuevos marcos normativos'
    });
  }

  eliminarMarcosSeleccionados(): void {
    if (!this.marcosSeleccionados || this.marcosSeleccionados.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar ${this.marcosSeleccionados.length} marco(s) normativo(s) seleccionado(s)?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const idsAEliminar = this.marcosSeleccionados.map(m => m.id);
        this.marcosNormativos.update(marcos =>
          marcos.filter(m => !idsAEliminar.includes(m.id))
        );
        this.marcosSeleccionados = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Marcos eliminados',
          detail: `Se eliminaron ${idsAEliminar.length} marco(s) normativo(s)`
        });
      }
    });
  }

  // =============================================
  // MÉTODOS - DRAG & DROP
  // =============================================
  iniciarArrastre(tipo: Pregunta['tipo']) {
    this.preguntaArrastrada.set({
      id: '',
      texto: '',
      tipo,
      requerida: true,
      peso: 10,
      requiereEvidencia: false
    });
  }

  getMenuItemsSeccion(seccionId: string) {
    return this.tiposPregunta.map(t => ({
      label: t.label,
      icon: t.icon,
      command: () => this.agregarPregunta(seccionId, t.value)
    }));
  }

  onDropPregunta(seccionId: string) {
    const tipo = this.preguntaArrastrada()?.tipo || 'texto';
    this.agregarPregunta(seccionId, tipo);
  }

  // =============================================
  // MÉTODOS - NAVEGACIÓN
  // =============================================
  volverALista() {
    this.vistaActual.set('lista');
    this.cuestionarioSeleccionado.set(null);
  }

  irACumplimiento() {
    this.router.navigate(['/cumplimiento']);
  }

  verDetalleCuestionario(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.editandoDetalle.set(false);
    this.tabDetalleActivo.set('componentes');
    this.vistaActual.set('detalle');
  }

  irADetalle(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.tabDetalleActivo.set('componentes');
    this.vistaActual.set('detalle');
  }

  volverADetalle() {
    this.vistaActual.set('detalle');
  }

  irAEditorDesdeDetalle() {
    this.vistaActual.set('editor');
  }

  toggleEditarDetalle() {
    this.editandoDetalle.update(v => !v);
  }

  guardarYCerrarEdicion() {
    this.guardarCuestionarioEditor();
    this.editandoDetalle.set(false);
  }

  cancelarEdicionDetalle() {
    this.editandoDetalle.set(false);
  }

  // =============================================
  // MÉTODOS - CUESTIONARIOS (WIZARD)
  // =============================================
  crearNuevoCuestionario() {
    this.wizardPaso.set(0);
    this.metodoCreacion.set(null);
    this.promptIA.set('');
    this.wizardDatosGenerales.set({
      nombre: '',
      descripcion: '',
      marcoNormativo: '',
      tipoEvaluacion: 'autoevaluacion',
      periodicidad: 'anual',
      areasObjetivo: []
    });
    this.wizardUmbrales.set({
      deficiente: 50,
      aceptable: 70,
      sobresaliente: 90
    });
    this.wizardIAMetodo.set('prompt');
    this.wizardDocumento.set(null);
    this.vistaActual.set('wizard');
  }

  seleccionarMetodoCreacion(metodo: 'manual' | 'ia') {
    this.metodoCreacion.set(metodo);
  }

  continuarWizard() {
    const paso = this.wizardPaso();
    const metodo = this.metodoCreacion();

    if (paso === 0 && !metodo) return;

    if (paso === 0) {
      this.wizardPaso.set(1);
      return;
    }

    if (paso === 1) {
      if (!this.wizardDatosGenerales().nombre.trim()) {
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'El nombre del cuestionario es requerido' });
        return;
      }
      this.wizardPaso.set(2);
      return;
    }

    if (paso === 2) {
      if (metodo === 'manual') {
        this.finalizarWizardManual();
      } else {
        this.wizardPaso.set(3);
      }
      return;
    }
  }

  puedeAvanzarWizard(): boolean {
    const paso = this.wizardPaso();

    if (paso === 0) return !!this.metodoCreacion();
    if (paso === 1) return !!this.wizardDatosGenerales().nombre.trim();
    if (paso === 2) return true;
    if (paso === 3) {
      const iaMetodo = this.wizardIAMetodo();
      if (iaMetodo === 'prompt') return !!this.promptIA().trim();
      if (iaMetodo === 'documento') return !!this.wizardDocumento();
    }
    return false;
  }

  finalizarWizardManual() {
    const datos = this.wizardDatosGenerales();
    const umbrales = this.wizardUmbrales();

    const nuevo: Cuestionario = {
      id: crypto.randomUUID(),
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria: 'cumplimiento',
      tipo: 'manual',
      tipoEvaluacion: datos.tipoEvaluacion as Cuestionario['tipoEvaluacion'],
      estado: 'borrador',
      marcoNormativo: datos.marcoNormativo,
      periodicidad: datos.periodicidad as Cuestionario['periodicidad'],
      preguntas: 0,
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      umbrales: { ...umbrales },
      secciones: [],
      areasObjetivo: datos.areasObjetivo,
      responsables: []
    };
    this.cuestionarioSeleccionado.set(nuevo);
    this.preguntaSeleccionada.set(null);
    this.showWizardDialog.set(false);
    this.vistaActual.set('editor');
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Cuestionario creado. Agrega secciones y preguntas.' });
  }

  async generarConIAWizard() {
    const iaMetodo = this.wizardIAMetodo();
    const datos = this.wizardDatosGenerales();
    const umbrales = this.wizardUmbrales();

    if (iaMetodo === 'prompt' && !this.promptIA()) return;
    if (iaMetodo === 'documento' && !this.wizardDocumento()) return;

    this.generandoIA.set(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const fuente = iaMetodo === 'documento'
      ? `documento: ${this.wizardDocumento()?.name}`
      : `prompt: "${this.promptIA().substring(0, 100)}..."`;

    const cuestionarioGenerado: Cuestionario = {
      id: crypto.randomUUID(),
      nombre: datos.nombre || 'Cuestionario generado por IA',
      descripcion: datos.descripcion || `Generado a partir de ${fuente}`,
      categoria: 'cumplimiento',
      tipo: 'ia',
      tipoEvaluacion: datos.tipoEvaluacion as Cuestionario['tipoEvaluacion'],
      estado: 'borrador',
      marcoNormativo: datos.marcoNormativo || 'iso27001',
      periodicidad: datos.periodicidad as Cuestionario['periodicidad'],
      preguntas: 8,
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      umbrales: { ...umbrales },
      areasObjetivo: datos.areasObjetivo,
      responsables: [],
      secciones: [
        {
          id: crypto.randomUUID(),
          nombre: 'Políticas y Procedimientos',
          descripcion: 'Evaluación de políticas de seguridad',
          peso: 40,
          preguntas: [
            { id: crypto.randomUUID(), texto: '¿Existe una política de seguridad de la información documentada y aprobada?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true },
            { id: crypto.randomUUID(), texto: '¿Se revisan las políticas de seguridad al menos anualmente?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
            { id: crypto.randomUUID(), texto: '¿Qué porcentaje de empleados ha recibido capacitación en seguridad?', tipo: 'escala', requerida: true, peso: 10, requiereEvidencia: false, escalaMin: 0, escalaMax: 100 }
          ]
        },
        {
          id: crypto.randomUUID(),
          nombre: 'Control de Accesos',
          descripcion: 'Gestión de identidades y accesos',
          peso: 35,
          preguntas: [
            { id: crypto.randomUUID(), texto: '¿Se aplica el principio de mínimo privilegio?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true },
            { id: crypto.randomUUID(), texto: '¿Con qué frecuencia se revisan los accesos de usuarios?', tipo: 'seleccionUnica', requerida: true, peso: 10, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Nunca'] },
            { id: crypto.randomUUID(), texto: '¿Se utiliza autenticación multifactor (MFA)?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true }
          ]
        },
        {
          id: crypto.randomUUID(),
          nombre: 'Gestión de Incidentes',
          descripcion: 'Procedimientos de respuesta a incidentes',
          peso: 25,
          preguntas: [
            { id: crypto.randomUUID(), texto: '¿Existe un procedimiento documentado de respuesta a incidentes?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true },
            { id: crypto.randomUUID(), texto: 'Describa brevemente el proceso de escalamiento de incidentes', tipo: 'texto', requerida: false, peso: 10, requiereEvidencia: false }
          ]
        }
      ]
    };

    this.generandoIA.set(false);
    this.wizardPreviewCuestionario.set(cuestionarioGenerado);
    this.wizardPaso.set(4);
    this.messageService.add({ severity: 'success', summary: 'IA', detail: 'Cuestionario generado. Revisa el preview.' });
  }

  irAEditorDesdePreview() {
    const preview = this.wizardPreviewCuestionario();
    if (!preview) return;

    this.cuestionarioSeleccionado.set(preview);
    this.preguntaSeleccionada.set(null);
    this.showWizardDialog.set(false);
    this.vistaActual.set('editor');
  }

  regenerarConIA() {
    this.wizardPaso.set(3);
    this.wizardPreviewCuestionario.set(null);
  }

  onSelectDocumentoIA(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.wizardDocumento.set(file);
    }
  }

  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.wizardDocumento.set(file);
    }
  }

  onDropDocumento(event: DragEvent) {
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const validTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (validTypes.includes(extension)) {
        this.wizardDocumento.set(file);
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Formato inválido', detail: 'Solo se permiten archivos PDF, Word o TXT' });
      }
    }
  }

  limpiarDocumentoIA() {
    this.wizardDocumento.set(null);
  }

  actualizarDatosGenerales(campo: string, valor: any) {
    this.wizardDatosGenerales.update(datos => ({ ...datos, [campo]: valor }));
  }

  actualizarUmbrales(campo: string, valor: number) {
    this.wizardUmbrales.update(umbrales => ({ ...umbrales, [campo]: valor }));
  }

  volverPasoWizard() {
    if (this.wizardPaso() > 0) {
      this.wizardPaso.update(p => p - 1);
    } else {
      this.vistaActual.set('lista');
    }
  }

  cancelarWizard() {
    this.vistaActual.set('lista');
    this.wizardPaso.set(0);
    this.metodoCreacion.set(null);
  }

  // =============================================
  // MÉTODOS - EDITOR
  // =============================================
  guardarCuestionarioEditor() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    if (!cuestionario.nombre || cuestionario.nombre.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingresa un nombre para el cuestionario' });
      return;
    }

    cuestionario.fechaModificacion = new Date();

    let totalPreguntas = 0;
    cuestionario.secciones.forEach(s => totalPreguntas += s.preguntas.length);
    cuestionario.preguntas = totalPreguntas;

    const existente = this.cuestionarios().find(c => c.id === cuestionario.id);
    if (existente) {
      this.cuestionarios.update(lista => lista.map(c => c.id === cuestionario.id ? cuestionario : c));
    } else {
      this.cuestionarios.update(lista => [...lista, cuestionario]);
    }

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Cuestionario guardado exitosamente' });
  }

  seleccionarPregunta(pregunta: Pregunta) {
    this.preguntaSeleccionada.set(pregunta);
  }

  getTipoPreguntaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'texto': 'Text Input',
      'textoLargo': 'Textarea',
      'boolean': 'True/False',
      'numero': 'Number',
      'seleccionUnica': 'Single Choice',
      'opcionMultiple': 'Multiple Choice',
      'radioButtons': 'Radio Buttons',
      'starRating': 'Star Rating',
      'likertScale': 'Likert Scale',
      'escala': 'Numeric Scale',
      'semanticDiff': 'Semantic Differential',
      'ranking': 'Ranking',
      'siNoNa': 'Yes/No/N/A',
      'fecha': 'Date',
      'archivo': 'File Upload',
      'matriz': 'Matrix',
      'grupo': 'Group',
      'url': 'URL'
    };
    return labels[tipo] || tipo;
  }

  agregarPreguntaSeccion(seccionId: string, tipo: string) {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    const nuevaPregunta: Pregunta = {
      id: crypto.randomUUID(),
      texto: '',
      tipo: tipo as Pregunta['tipo'],
      requerida: false,
      peso: 1,
      requiereEvidencia: false
    };

    if (tipo === 'seleccionUnica' || tipo === 'opcionMultiple' || tipo === 'radioButtons') {
      nuevaPregunta.opciones = ['Opción 1', 'Opción 2', 'Opción 3'];
    }
    if (tipo === 'escala') {
      nuevaPregunta.escalaMin = 1;
      nuevaPregunta.escalaMax = 5;
    }

    const seccionIndex = cuestionario.secciones.findIndex(s => s.id === seccionId);
    if (seccionIndex >= 0) {
      cuestionario.secciones[seccionIndex].preguntas.push(nuevaPregunta);
      this.cuestionarioSeleccionado.set({ ...cuestionario });
      this.preguntaSeleccionada.set(nuevaPregunta);
    }
  }

  onDropPreguntaNuevaSeccion() {
    const cuestionario = this.cuestionarioSeleccionado();
    const arrastrada = this.preguntaArrastrada();
    if (!cuestionario || !arrastrada) return;

    const nuevaSeccion: Seccion = {
      id: crypto.randomUUID(),
      nombre: 'Nueva Sección',
      descripcion: '',
      peso: 1,
      preguntas: []
    };

    cuestionario.secciones.push(nuevaSeccion);
    this.cuestionarioSeleccionado.set({ ...cuestionario });

    this.agregarPreguntaSeccion(nuevaSeccion.id, arrastrada.tipo);
  }

  agregarSeccion() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    const nuevaSeccion: Seccion = {
      id: crypto.randomUUID(),
      nombre: 'Nueva sección',
      descripcion: '',
      preguntas: [],
      peso: 0
    };

    cuestionario.secciones.push(nuevaSeccion);
    this.cuestionarioSeleccionado.set({ ...cuestionario });
    this.seccionActiva.set(nuevaSeccion.id);
  }

  agregarPregunta(seccionId: string, tipo: Pregunta['tipo']) {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    const seccion = cuestionario.secciones.find(s => s.id === seccionId);
    if (!seccion) return;

    const nuevaPregunta: Pregunta = {
      id: crypto.randomUUID(),
      texto: 'Nueva pregunta',
      tipo: tipo,
      requerida: true,
      peso: 10,
      requiereEvidencia: false
    };

    if (tipo === 'seleccionUnica' || tipo === 'opcionMultiple' || tipo === 'radioButtons') {
      nuevaPregunta.opciones = ['Opción 1', 'Opción 2', 'Opción 3'];
    }

    if (tipo === 'escala') {
      nuevaPregunta.escalaMin = 1;
      nuevaPregunta.escalaMax = 10;
    }

    if (tipo === 'siNoNa') {
      nuevaPregunta.opciones = ['Sí', 'No', 'N/A'];
    }

    seccion.preguntas.push(nuevaPregunta);
    this.cuestionarioSeleccionado.set({ ...cuestionario });
  }

  eliminarPregunta(seccionId: string, preguntaIndex: number) {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    const seccion = cuestionario.secciones.find(s => s.id === seccionId);
    if (!seccion) return;

    seccion.preguntas.splice(preguntaIndex, 1);
    this.cuestionarioSeleccionado.set({ ...cuestionario });
  }

  eliminarSeccion(seccionId: string) {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    cuestionario.secciones = cuestionario.secciones.filter(s => s.id !== seccionId);
    this.cuestionarioSeleccionado.set({ ...cuestionario });
  }

  guardarCuestionario() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    cuestionario.fechaModificacion = new Date();
    cuestionario.preguntas = cuestionario.secciones.reduce((sum, s) => sum + s.preguntas.length, 0);

    this.cuestionarios.update(lista =>
      lista.map(c => c.id === cuestionario.id ? cuestionario : c)
    );

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Cuestionario guardado exitosamente' });
  }

  publicarCuestionario() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    if (cuestionario.secciones.length === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El cuestionario debe tener al menos una sección con preguntas' });
      return;
    }

    const totalPreguntas = cuestionario.secciones.reduce((sum, s) => sum + s.preguntas.length, 0);
    if (totalPreguntas === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El cuestionario debe tener al menos una pregunta' });
      return;
    }

    cuestionario.estado = 'activo';
    this.guardarCuestionario();
    this.messageService.add({ severity: 'success', summary: 'Publicado', detail: 'Cuestionario publicado y activo' });
  }

  // =============================================
  // MÉTODOS - LISTA
  // =============================================
  editarCuestionario(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set({ ...cuestionario });
    this.vistaActual.set('editor');
  }

  duplicarCuestionario(cuestionario: Cuestionario) {
    // Crear copia profunda del cuestionario
    const copia: Cuestionario = JSON.parse(JSON.stringify(cuestionario));

    // Generar nuevos IDs
    copia.id = crypto.randomUUID();
    copia.nombre = `${cuestionario.nombre} (Copia)`;
    copia.estado = 'borrador';
    copia.fechaCreacion = new Date();
    copia.fechaModificacion = new Date();
    copia.respuestas = 0;
    copia.tasaCompletado = 0;

    // Generar nuevos IDs para secciones y preguntas
    copia.secciones = copia.secciones.map(seccion => ({
      ...seccion,
      id: crypto.randomUUID(),
      preguntas: seccion.preguntas.map(pregunta => ({
        ...pregunta,
        id: crypto.randomUUID()
      }))
    }));

    // Agregar a la lista
    this.cuestionarios.update(lista => [...lista, copia]);

    this.messageService.add({
      severity: 'success',
      summary: 'Duplicado',
      detail: `Se creó una copia de "${cuestionario.nombre}"`
    });

    // Abrir el editor con la copia
    this.cuestionarioSeleccionado.set(copia);
    this.vistaActual.set('editor');
  }

  eliminarCuestionario(cuestionario: Cuestionario) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar "${cuestionario.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.cuestionarios.update(lista => lista.filter(c => c.id !== cuestionario.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Cuestionario eliminado' });
      }
    });
  }

  archivarCuestionario(cuestionario: Cuestionario) {
    cuestionario.estado = 'archivado';
    this.cuestionarios.update(lista =>
      lista.map(c => c.id === cuestionario.id ? cuestionario : c)
    );
    this.messageService.add({ severity: 'info', summary: 'Archivado', detail: 'Cuestionario archivado' });
  }

  // =============================================
  // MÉTODOS - IMPORTAR DOCUMENTO
  // =============================================
  onUploadDocumento(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.messageService.add({
        severity: 'info',
        summary: 'Documento recibido',
        detail: `Procesando ${file.name}...`
      });
      // Simular procesamiento
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Documento procesado',
          detail: 'Las preguntas fueron extraídas del documento'
        });
      }, 2000);
    }
  }

  async generarConIA() {
    if (!this.promptIA()) return;

    this.generandoIA.set(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const cuestionarioGenerado: Cuestionario = {
      id: crypto.randomUUID(),
      nombre: 'Cuestionario generado por IA',
      descripcion: `Generado a partir de: "${this.promptIA().substring(0, 100)}..."`,
      categoria: 'cumplimiento',
      tipo: 'ia',
      tipoEvaluacion: 'autoevaluacion',
      estado: 'borrador',
      marcoNormativo: 'iso27001',
      periodicidad: 'anual',
      preguntas: 8,
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      umbrales: { deficiente: 50, aceptable: 70, sobresaliente: 90 },
      areasObjetivo: [],
      responsables: [],
      secciones: [
        {
          id: crypto.randomUUID(),
          nombre: 'Políticas y Procedimientos',
          descripcion: 'Evaluación de políticas de seguridad',
          peso: 40,
          preguntas: [
            { id: crypto.randomUUID(), texto: '¿Existe una política de seguridad documentada?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true },
            { id: crypto.randomUUID(), texto: '¿Se revisan las políticas anualmente?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true }
          ]
        },
        {
          id: crypto.randomUUID(),
          nombre: 'Control de Accesos',
          descripcion: 'Gestión de identidades y accesos',
          peso: 35,
          preguntas: [
            { id: crypto.randomUUID(), texto: '¿Se aplica el principio de mínimo privilegio?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true }
          ]
        }
      ]
    };

    this.generandoIA.set(false);
    this.cuestionarioSeleccionado.set(cuestionarioGenerado);
    this.showIADialog.set(false);
    this.vistaActual.set('editor');
    this.messageService.add({ severity: 'success', summary: 'IA', detail: 'Cuestionario generado exitosamente' });
  }

  // =============================================
  // METODOS - LOGICA CONDICIONAL
  // =============================================

  // Signal para toggle de logica condicional
  logicaCondicionalActiva = signal(false);

  // Obtiene todas las preguntas del cuestionario excepto la actual
  getPreguntasDisponiblesParaCondicion(): { label: string; value: string; tipo: string }[] {
    const cuestionario = this.cuestionarioSeleccionado();
    const preguntaActual = this.preguntaSeleccionada();
    if (!cuestionario || !preguntaActual) return [];

    const preguntas: { label: string; value: string; tipo: string }[] = [];

    cuestionario.secciones.forEach((seccion, secIdx) => {
      seccion.preguntas.forEach((pregunta, pregIdx) => {
        // Excluir la pregunta actual
        if (pregunta.id !== preguntaActual.id) {
          // Solo incluir tipos que tienen respuestas concretas
          const tiposValidos = ['siNoNa', 'seleccionUnica', 'radioButtons', 'opcionMultiple'];
          if (tiposValidos.includes(pregunta.tipo)) {
            preguntas.push({
              label: `S${secIdx + 1}.P${pregIdx + 1}: ${pregunta.texto.substring(0, 50)}${pregunta.texto.length > 50 ? '...' : ''}`,
              value: pregunta.id,
              tipo: pregunta.tipo
            });
          }
        }
      });
    });

    return preguntas;
  }

  // Obtiene las opciones de respuesta para una pregunta condicionante
  getOpcionesRespuestaCondicion(): { label: string; value: string }[] {
    const preguntaActual = this.preguntaSeleccionada();
    const cuestionario = this.cuestionarioSeleccionado();
    if (!preguntaActual || !cuestionario || !preguntaActual.displayConditionQuestionId) return [];

    // Buscar la pregunta condicionante
    let preguntaCondicionante: Pregunta | undefined;
    for (const seccion of cuestionario.secciones) {
      preguntaCondicionante = seccion.preguntas.find(p => p.id === preguntaActual.displayConditionQuestionId);
      if (preguntaCondicionante) break;
    }

    if (!preguntaCondicionante) return [];

    // Generar opciones segun el tipo de pregunta
    if (preguntaCondicionante.tipo === 'siNoNa') {
      return [
        { label: 'Si', value: 'Si' },
        { label: 'No', value: 'No' },
        { label: 'N/A', value: 'N/A' }
      ];
    }

    if (preguntaCondicionante.opciones && preguntaCondicionante.opciones.length > 0) {
      return preguntaCondicionante.opciones.map(op => {
        if (typeof op === 'string') {
          return { label: op, value: op };
        } else {
          return { label: op.text, value: op.text };
        }
      });
    }

    return [];
  }

  // Verificar si el tipo de pregunta es numérico (permite campos calculados)
  estipoNumerico(tipo: string): boolean {
    const tiposNumericos = ['numero', 'escala', 'starRating'];
    return tiposNumericos.includes(tipo);
  }

  // Verificar si el tipo de pregunta tiene opciones configurables
  tieneOpciones(tipo: string): boolean {
    const tiposConOpciones = ['seleccionUnica', 'opcionMultiple', 'radioButtons', 'siNoNa'];
    return tiposConOpciones.includes(tipo);
  }

  // Obtener opciones normalizadas con score
  getOpcionesConScore(): { text: string; score: number }[] {
    const pregunta = this.preguntaSeleccionada();
    if (!pregunta || !pregunta.opciones) {
      // Retornar opciones por defecto según el tipo
      if (pregunta?.tipo === 'siNoNa') {
        return [
          { text: 'Sí', score: 100 },
          { text: 'No', score: 0 },
          { text: 'N/A', score: 50 }
        ];
      }
      return [];
    }

    // Normalizar opciones a formato { text, score }
    return pregunta.opciones.map((opt, index) => {
      if (typeof opt === 'string') {
        // Si es string, calcular score proporcional inverso
        const totalOpciones = pregunta.opciones!.length;
        return {
          text: opt,
          score: Math.round(((totalOpciones - index) / totalOpciones) * 100)
        };
      }
      return opt as { text: string; score: number };
    });
  }

  // Obtener texto de una opción
  getOpcionTexto(opcion: string | { text: string; score: number }): string {
    return typeof opcion === 'string' ? opcion : opcion.text;
  }

  // Obtener score de una opción
  getOpcionScore(opcion: string | { text: string; score: number }): number {
    return typeof opcion === 'string' ? 0 : opcion.score;
  }

  // Actualizar texto de una opción
  actualizarOpcionTexto(index: number, texto: string): void {
    const pregunta = this.preguntaSeleccionada();
    if (!pregunta) return;

    const opciones = this.getOpcionesConScore();
    opciones[index].text = texto;
    pregunta.opciones = opciones;
    this.actualizarPreguntaSeleccionada();
  }

  // Actualizar score de una opción
  actualizarOpcionScore(index: number, score: number): void {
    const pregunta = this.preguntaSeleccionada();
    if (!pregunta) return;

    const opciones = this.getOpcionesConScore();
    opciones[index].score = score;
    pregunta.opciones = opciones;
    this.actualizarPreguntaSeleccionada();
  }

  // Agregar nueva opción
  agregarOpcion(): void {
    const pregunta = this.preguntaSeleccionada();
    if (!pregunta) return;

    const opciones = this.getOpcionesConScore();
    opciones.push({ text: `Opción ${opciones.length + 1}`, score: 0 });
    pregunta.opciones = opciones;
    this.actualizarPreguntaSeleccionada();
  }

  // Eliminar opción
  eliminarOpcion(index: number): void {
    const pregunta = this.preguntaSeleccionada();
    if (!pregunta) return;

    const opciones = this.getOpcionesConScore();
    opciones.splice(index, 1);
    pregunta.opciones = opciones;
    this.actualizarPreguntaSeleccionada();
  }

  // Toggle logica condicional
  toggleLogicaCondicional(activa: boolean) {
    this.logicaCondicionalActiva.set(activa);
    const pregunta = this.preguntaSeleccionada();
    if (pregunta && !activa) {
      // Limpiar configuracion si se desactiva
      pregunta.displayConditionQuestionId = undefined;
      pregunta.displayConditionAnswer = undefined;
      this.actualizarPreguntaSeleccionada();
    }
  }

  // Actualizar pregunta condicionante
  setCondicionPreguntaId(preguntaId: string) {
    const pregunta = this.preguntaSeleccionada();
    if (pregunta) {
      pregunta.displayConditionQuestionId = preguntaId;
      pregunta.displayConditionAnswer = undefined; // Reset la respuesta al cambiar pregunta
      this.actualizarPreguntaSeleccionada();
    }
  }

  // Actualizar respuesta condicionante
  setCondicionRespuesta(respuesta: string) {
    const pregunta = this.preguntaSeleccionada();
    if (pregunta) {
      pregunta.displayConditionAnswer = respuesta;
      this.actualizarPreguntaSeleccionada();
    }
  }

  // Actualiza la pregunta seleccionada en el cuestionario
  private actualizarPreguntaSeleccionada() {
    const cuestionario = this.cuestionarioSeleccionado();
    const pregunta = this.preguntaSeleccionada();
    if (!cuestionario || !pregunta) return;

    // Buscar y actualizar la pregunta
    for (const seccion of cuestionario.secciones) {
      const idx = seccion.preguntas.findIndex(p => p.id === pregunta.id);
      if (idx >= 0) {
        seccion.preguntas[idx] = { ...pregunta };
        break;
      }
    }
    this.cuestionarioSeleccionado.set({ ...cuestionario });
  }

  // Verifica si la pregunta tiene logica condicional configurada
  tieneLogicaCondicional(pregunta: Pregunta): boolean {
    return !!(pregunta.displayConditionQuestionId && pregunta.displayConditionAnswer);
  }

  // Obtiene el texto de la condicion para mostrar
  getTextoCondicion(pregunta: Pregunta): string {
    if (!this.tieneLogicaCondicional(pregunta)) return '';

    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return '';

    // Buscar la pregunta condicionante
    let preguntaCondicionante: Pregunta | undefined;
    for (const seccion of cuestionario.secciones) {
      preguntaCondicionante = seccion.preguntas.find(p => p.id === pregunta.displayConditionQuestionId);
      if (preguntaCondicionante) break;
    }

    if (!preguntaCondicionante) return '';

    return `Si "${preguntaCondicionante.texto.substring(0, 30)}..." = "${pregunta.displayConditionAnswer}"`;
  }

  // Menú contextual para cuestionarios
  getMenuItemsCuestionario(cuestionario: Cuestionario): MenuItem[] {
    return [
      { label: 'Ver detalle', icon: 'pi pi-eye', command: () => this.verDetalleCuestionario(cuestionario) },
      { label: 'Editar', icon: 'pi pi-pencil', command: () => this.editarCuestionario(cuestionario) },
      { label: 'Duplicar', icon: 'pi pi-copy', command: () => this.duplicarCuestionario(cuestionario) },
      { separator: true },
      { label: 'Eliminar', icon: 'pi pi-trash', styleClass: 'text-red-500', command: () => this.eliminarCuestionario(cuestionario) }
    ];
  }
}
