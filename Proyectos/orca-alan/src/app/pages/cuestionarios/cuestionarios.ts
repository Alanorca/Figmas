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
import { TimelineModule } from 'primeng/timeline';
import { ToolbarModule } from 'primeng/toolbar';

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
    AvatarModule,
    TimelineModule,
    ToolbarModule
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
  marcosSeleccionados: MarcoNormativo[] = [];
  mostrarDialogoMarco = signal(false);
  nuevoMarco = signal<{ acronimo: string; nombre: string; version: string; descripcion: string }>({ acronimo: '', nombre: '', version: '1.0', descripcion: '' });

  // Wizard - Marcos Normativos MultiSelect
  wizardMarcosSeleccionados: MarcoNormativo[] = [];
  mostrarDialogoMarcoWizard = signal(false);

  // Formulario inline para agregar marco
  mostrandoFormularioMarco = signal(false);
  nuevoMarcoInline = signal<{ acronimo: string; nombre: string; version: string }>({ acronimo: '', nombre: '', version: '' });

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
  tabDetalleActivo = signal<'componentes' | 'informacion' | 'reglas' | 'riesgos' | 'auditoria'>('informacion');
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
          nombre: 'Datos de Solicitud',
          descripcion: 'Información general de la solicitud',
          peso: 15,
          preguntas: [
            { id: 'p1', texto: 'Estatus', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['1. Encaptura', '2. En revisión', '3. Aprobado'] },
            { id: 'p2', texto: 'Fecha de registro', tipo: 'fecha', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p3', texto: 'Código de solicitud', tipo: 'texto', requerida: true, peso: 5, requiereEvidencia: false, placeholder: 'Número de Factura' }
          ]
        },
        {
          id: 's2',
          nombre: 'Identificación del Fideicomiso',
          descripcion: 'Datos del fideicomiso asociado',
          peso: 20,
          preguntas: [
            { id: 'p4', texto: 'Fideicomiso o Cartera', tipo: 'seleccionUnica', requerida: true, peso: 7, requiereEvidencia: false, opciones: ['Fideicomiso A', 'Fideicomiso B', 'Cartera C'] },
            { id: 'p5', texto: 'Administrador Primario', tipo: 'seleccionUnica', requerida: true, peso: 7, requiereEvidencia: false, opciones: ['Admin 1', 'Admin 2'] },
            { id: 'p6', texto: 'Administrador Maestro', tipo: 'seleccionUnica', requerida: true, peso: 6, requiereEvidencia: false, opciones: ['Maestro A', 'Maestro B'] },
            { id: 'p7', texto: 'Institución de Fondeo', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Banco X', 'Banco Y'] },
            { id: 'p8', texto: 'Tipo de Cartera', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Hipotecaria', 'Automotriz', 'Personal'] }
          ]
        },
        {
          id: 's3',
          nombre: 'Identificación del Gasto',
          descripcion: 'Clasificación y detalle del gasto',
          peso: 15,
          preguntas: [
            { id: 'p9', texto: 'Tipo de Gasto', tipo: 'seleccionUnica', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Operativo', 'Administrativo', 'Financiero'] },
            { id: 'p10', texto: 'Centro de Costos', tipo: 'texto', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p11', texto: 'Monto Total', tipo: 'numero', requerida: true, peso: 5, requiereEvidencia: true }
          ]
        },
        {
          id: 's4',
          nombre: 'Datos de Factura 01',
          descripcion: 'Primera factura asociada',
          peso: 12,
          preguntas: [
            { id: 'p12', texto: 'Número de Factura', tipo: 'texto', requerida: true, peso: 4, requiereEvidencia: false },
            { id: 'p13', texto: 'Fecha de Factura', tipo: 'fecha', requerida: true, peso: 4, requiereEvidencia: false },
            { id: 'p14', texto: 'Proveedor', tipo: 'seleccionUnica', requerida: true, peso: 4, requiereEvidencia: false, opciones: ['Proveedor A', 'Proveedor B'] },
            { id: 'p15', texto: 'Subtotal', tipo: 'numero', requerida: true, peso: 3, requiereEvidencia: false },
            { id: 'p16', texto: 'IVA', tipo: 'numero', requerida: true, peso: 3, requiereEvidencia: false },
            { id: 'p17', texto: 'Total', tipo: 'numero', requerida: true, peso: 3, requiereEvidencia: false }
          ]
        },
        {
          id: 's5',
          nombre: 'Datos de Factura 02',
          descripcion: 'Segunda factura asociada',
          peso: 12,
          preguntas: [
            { id: 'p18', texto: 'Número de Factura', tipo: 'texto', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p19', texto: 'Fecha de Factura', tipo: 'fecha', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p20', texto: 'Proveedor', tipo: 'seleccionUnica', requerida: false, peso: 4, requiereEvidencia: false, opciones: ['Proveedor A', 'Proveedor B'] }
          ]
        },
        {
          id: 's6',
          nombre: 'Datos de Factura 03',
          descripcion: 'Tercera factura asociada',
          peso: 12,
          preguntas: [
            { id: 'p21', texto: 'Número de Factura', tipo: 'texto', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p22', texto: 'Fecha de Factura', tipo: 'fecha', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p23', texto: 'Proveedor', tipo: 'seleccionUnica', requerida: false, peso: 4, requiereEvidencia: false, opciones: ['Proveedor A', 'Proveedor B'] }
          ]
        },
        {
          id: 's7',
          nombre: 'Datos de Factura 04',
          descripcion: 'Cuarta factura asociada',
          peso: 12,
          preguntas: [
            { id: 'p24', texto: 'Número de Factura', tipo: 'texto', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p25', texto: 'Fecha de Factura', tipo: 'fecha', requerida: false, peso: 4, requiereEvidencia: false },
            { id: 'p26', texto: 'Proveedor', tipo: 'seleccionUnica', requerida: false, peso: 4, requiereEvidencia: false, opciones: ['Proveedor A', 'Proveedor B'] }
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
      secciones: [
        {
          id: 's2-1',
          nombre: 'Identificación de Activos',
          descripcion: 'Inventario de activos críticos',
          peso: 25,
          preguntas: [
            { id: 'p2-1', texto: 'Nombre del Activo', tipo: 'texto', requerida: true, peso: 8, requiereEvidencia: false },
            { id: 'p2-2', texto: 'Tipo de Activo', tipo: 'seleccionUnica', requerida: true, peso: 8, requiereEvidencia: false, opciones: ['Hardware', 'Software', 'Datos', 'Personal'] },
            { id: 'p2-3', texto: 'Criticidad', tipo: 'seleccionUnica', requerida: true, peso: 9, requiereEvidencia: false, opciones: ['Alta', 'Media', 'Baja'] }
          ]
        },
        {
          id: 's2-2',
          nombre: 'Evaluación de Amenazas',
          descripcion: 'Análisis de amenazas potenciales',
          peso: 25,
          preguntas: [
            { id: 'p2-4', texto: '¿Existe análisis de amenazas documentado?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
            { id: 'p2-5', texto: 'Frecuencia de actualización', tipo: 'seleccionUnica', requerida: true, peso: 8, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Anual'] },
            { id: 'p2-6', texto: 'Responsable del análisis', tipo: 'texto', requerida: true, peso: 7, requiereEvidencia: false }
          ]
        },
        {
          id: 's2-3',
          nombre: 'Vulnerabilidades Identificadas',
          descripcion: 'Registro de vulnerabilidades',
          peso: 25,
          preguntas: [
            { id: 'p2-7', texto: 'Número de vulnerabilidades críticas', tipo: 'numero', requerida: true, peso: 10, requiereEvidencia: true },
            { id: 'p2-8', texto: 'Plan de remediación activo', tipo: 'siNoNa', requerida: true, peso: 8, requiereEvidencia: true },
            { id: 'p2-9', texto: 'Fecha última evaluación', tipo: 'fecha', requerida: true, peso: 7, requiereEvidencia: false }
          ]
        },
        {
          id: 's2-4',
          nombre: 'Controles Implementados',
          descripcion: 'Medidas de control existentes',
          peso: 25,
          preguntas: [
            { id: 'p2-10', texto: '¿Existen controles preventivos?', tipo: 'siNoNa', requerida: true, peso: 8, requiereEvidencia: true },
            { id: 'p2-11', texto: '¿Existen controles detectivos?', tipo: 'siNoNa', requerida: true, peso: 8, requiereEvidencia: true },
            { id: 'p2-12', texto: 'Efectividad general de controles', tipo: 'escala', requerida: true, peso: 9, requiereEvidencia: false, escalaMin: 1, escalaMax: 10 }
          ]
        }
      ]
    },
    {
      id: '3',
      nombre: 'Evaluación de Seguridad TI',
      descripcion: 'Cuestionario de seguridad informática basado en ISO 27001',
      categoria: 'seguridad',
      tipo: 'manual',
      tipoEvaluacion: 'auditoria_externa',
      estado: 'activo',
      marcoNormativo: 'iso27001',
      periodicidad: 'anual',
      preguntas: 78,
      respuestas: 156,
      tasaCompletado: 85,
      fechaCreacion: new Date('2024-11-01'),
      fechaModificacion: new Date('2024-11-25'),
      umbrales: { deficiente: 50, aceptable: 70, sobresaliente: 90 },
      areasObjetivo: ['tecnologia'],
      responsables: ['user4'],
      secciones: [
        {
          id: 's3-1',
          nombre: 'Políticas de Seguridad',
          descripcion: 'Documentación y comunicación de políticas',
          peso: 15,
          preguntas: [
            { id: 'p3-1', texto: '¿Existe una política de seguridad de la información documentada?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true },
            { id: 'p3-2', texto: 'Fecha de última actualización de la política', tipo: 'fecha', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p3-3', texto: '¿La política está aprobada por la alta dirección?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true }
          ]
        },
        {
          id: 's3-2',
          nombre: 'Control de Accesos',
          descripcion: 'Gestión de identidades y accesos',
          peso: 20,
          preguntas: [
            { id: 'p3-4', texto: '¿Existe un proceso formal de alta de usuarios?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p3-5', texto: '¿Se revisan los accesos periódicamente?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p3-6', texto: 'Frecuencia de revisión de accesos', tipo: 'seleccionUnica', requerida: true, peso: 6, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Semestral', 'Anual'] }
          ]
        },
        {
          id: 's3-3',
          nombre: 'Seguridad Física',
          descripcion: 'Protección de instalaciones y equipos',
          peso: 15,
          preguntas: [
            { id: 'p3-7', texto: '¿Existen controles de acceso físico al datacenter?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true },
            { id: 'p3-8', texto: 'Tipo de control de acceso físico', tipo: 'opcionMultiple', requerida: true, peso: 5, requiereEvidencia: false, opciones: ['Tarjeta', 'Biométrico', 'PIN', 'Guardia'] },
            { id: 'p3-9', texto: '¿Se registran los accesos?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true }
          ]
        },
        {
          id: 's3-4',
          nombre: 'Gestión de Incidentes',
          descripcion: 'Proceso de respuesta a incidentes',
          peso: 20,
          preguntas: [
            { id: 'p3-10', texto: '¿Existe un proceso documentado de gestión de incidentes?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p3-11', texto: 'Número de incidentes en el último año', tipo: 'numero', requerida: true, peso: 6, requiereEvidencia: false },
            { id: 'p3-12', texto: 'Tiempo promedio de resolución (horas)', tipo: 'numero', requerida: true, peso: 7, requiereEvidencia: false }
          ]
        },
        {
          id: 's3-5',
          nombre: 'Continuidad del Negocio',
          descripcion: 'Planes de recuperación y continuidad',
          peso: 15,
          preguntas: [
            { id: 'p3-13', texto: '¿Existe un plan de continuidad del negocio?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true },
            { id: 'p3-14', texto: 'Fecha de última prueba del plan', tipo: 'fecha', requerida: true, peso: 5, requiereEvidencia: true },
            { id: 'p3-15', texto: 'RTO definido (horas)', tipo: 'numero', requerida: true, peso: 5, requiereEvidencia: false }
          ]
        },
        {
          id: 's3-6',
          nombre: 'Seguridad en Redes',
          descripcion: 'Protección de infraestructura de red',
          peso: 15,
          preguntas: [
            { id: 'p3-16', texto: '¿Existe segmentación de red?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true },
            { id: 'p3-17', texto: '¿Se utilizan firewalls?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p3-18', texto: '¿Existe monitoreo de tráfico de red?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: true }
          ]
        }
      ]
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
      secciones: [
        {
          id: 's4-1',
          nombre: 'Consentimiento y Base Legal',
          descripcion: 'Verificación de bases legales para el tratamiento',
          peso: 20,
          preguntas: [
            { id: 'p4-1', texto: '¿Se obtiene consentimiento explícito para el tratamiento de datos?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p4-2', texto: '¿Existe registro de consentimientos?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p4-3', texto: 'Base legal principal utilizada', tipo: 'seleccionUnica', requerida: true, peso: 6, requiereEvidencia: false, opciones: ['Consentimiento', 'Contrato', 'Interés legítimo', 'Obligación legal'] }
          ]
        },
        {
          id: 's4-2',
          nombre: 'Derechos de los Interesados',
          descripcion: 'Mecanismos para ejercer derechos ARCO',
          peso: 25,
          preguntas: [
            { id: 'p4-4', texto: '¿Existe procedimiento para atender solicitudes de acceso?', tipo: 'siNoNa', requerida: true, peso: 6, requiereEvidencia: true },
            { id: 'p4-5', texto: '¿Existe procedimiento para atender solicitudes de rectificación?', tipo: 'siNoNa', requerida: true, peso: 6, requiereEvidencia: true },
            { id: 'p4-6', texto: '¿Existe procedimiento para atender solicitudes de supresión?', tipo: 'siNoNa', requerida: true, peso: 6, requiereEvidencia: true },
            { id: 'p4-7', texto: 'Tiempo promedio de respuesta (días)', tipo: 'numero', requerida: true, peso: 7, requiereEvidencia: false }
          ]
        },
        {
          id: 's4-3',
          nombre: 'Registro de Actividades',
          descripcion: 'Documentación de tratamientos',
          peso: 20,
          preguntas: [
            { id: 'p4-8', texto: '¿Existe un registro de actividades de tratamiento?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true },
            { id: 'p4-9', texto: 'Número de tratamientos registrados', tipo: 'numero', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p4-10', texto: 'Fecha de última actualización del registro', tipo: 'fecha', requerida: true, peso: 5, requiereEvidencia: false }
          ]
        },
        {
          id: 's4-4',
          nombre: 'Transferencias Internacionales',
          descripcion: 'Control de flujos transfronterizos de datos',
          peso: 15,
          preguntas: [
            { id: 'p4-11', texto: '¿Se realizan transferencias internacionales de datos?', tipo: 'siNoNa', requerida: true, peso: 5, requiereEvidencia: false },
            { id: 'p4-12', texto: 'Mecanismo de protección utilizado', tipo: 'seleccionUnica', requerida: false, peso: 5, requiereEvidencia: true, opciones: ['Cláusulas tipo', 'BCR', 'Decisión adecuación', 'Consentimiento'] },
            { id: 'p4-13', texto: 'Países destinatarios', tipo: 'texto', requerida: false, peso: 5, requiereEvidencia: false }
          ]
        },
        {
          id: 's4-5',
          nombre: 'Brechas de Seguridad',
          descripcion: 'Gestión de violaciones de datos',
          peso: 20,
          preguntas: [
            { id: 'p4-14', texto: '¿Existe procedimiento de notificación de brechas?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true },
            { id: 'p4-15', texto: 'Número de brechas notificadas en el último año', tipo: 'numero', requerida: true, peso: 6, requiereEvidencia: false },
            { id: 'p4-16', texto: '¿Se realizan simulacros de brechas?', tipo: 'siNoNa', requerida: true, peso: 7, requiereEvidencia: true }
          ]
        }
      ]
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

  tienePregunasRequeridas(seccion: Seccion): boolean {
    return seccion.preguntas?.some(p => p.requerida) ?? false;
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
    this.tabDetalleActivo.set('informacion');
    this.vistaActual.set('detalle');
  }

  irADetalle(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.tabDetalleActivo.set('informacion');
    this.vistaActual.set('detalle');
  }

  volverADetalle() {
    this.vistaActual.set('detalle');
  }

  irAEditorDesdeDetalle() {
    this.vistaActual.set('editor');
  }

  toggleEditarDetalle() {
    const nuevoEstado = !this.editandoDetalle();
    if (nuevoEstado) {
      this.inicializarMarcosSeleccionados();
    }
    this.editandoDetalle.set(nuevoEstado);
  }

  guardarYCerrarEdicion() {
    this.guardarCuestionarioEditor();
    this.editandoDetalle.set(false);
  }

  cancelarEdicionDetalle() {
    this.editandoDetalle.set(false);
    this.marcosSeleccionados = [];
  }

  // =============================================
  // MARCOS NORMATIVOS - MultiSelect
  // =============================================
  getMarcosArray(): string[] {
    if (this.marcosSeleccionados.length > 0) {
      return this.marcosSeleccionados.map(m => m.id);
    }
    const cuestionario = this.cuestionarioSeleccionado();
    if (cuestionario?.marcoNormativo) {
      return [cuestionario.marcoNormativo];
    }
    return [];
  }

  mostrarDialogoNuevoMarco() {
    this.nuevoMarco.set({ acronimo: '', nombre: '', version: '1.0', descripcion: '' });
    this.mostrarDialogoMarco.set(true);
  }

  cerrarDialogoMarco() {
    this.mostrarDialogoMarco.set(false);
  }

  agregarNuevoMarco() {
    const nuevo = this.nuevoMarco();
    if (nuevo.acronimo && nuevo.nombre) {
      const nuevoMarcoNormativo: MarcoNormativo = {
        id: nuevo.acronimo.toLowerCase().replace(/\s+/g, '-'),
        nombre: nuevo.nombre,
        acronimo: nuevo.acronimo,
        descripcion: nuevo.descripcion || '',
        version: nuevo.version || '1.0',
        fechaVigencia: new Date(),
        activo: true,
        requisitos: []
      };
      // Agregar a la lista de marcos
      this.marcosNormativos.update(marcos => [...marcos, nuevoMarcoNormativo]);
      // Seleccionarlo automáticamente
      this.marcosSeleccionados = [...this.marcosSeleccionados, nuevoMarcoNormativo];
      this.cerrarDialogoMarco();
      this.messageService.add({
        severity: 'success',
        summary: 'Marco agregado',
        detail: `${nuevo.acronimo} ha sido agregado exitosamente`
      });
    }
  }

  // =============================================
  // WIZARD - MARCOS NORMATIVOS MULTISELECT CRUD
  // =============================================
  mostrarDialogoNuevoMarcoWizard() {
    this.nuevoMarco.set({ acronimo: '', nombre: '', version: '1.0', descripcion: '' });
    this.mostrarDialogoMarcoWizard.set(true);
  }

  cerrarDialogoMarcoWizard() {
    this.mostrarDialogoMarcoWizard.set(false);
  }

  agregarNuevoMarcoWizard() {
    const nuevo = this.nuevoMarco();
    if (nuevo.acronimo && nuevo.nombre) {
      const nuevoMarcoNormativo: MarcoNormativo = {
        id: nuevo.acronimo.toLowerCase().replace(/\s+/g, '-'),
        nombre: nuevo.nombre,
        acronimo: nuevo.acronimo,
        descripcion: nuevo.descripcion || '',
        version: nuevo.version || '1.0',
        fechaVigencia: new Date(),
        activo: true,
        requisitos: []
      };
      // Agregar a la lista de marcos
      this.marcosNormativos.update(marcos => [...marcos, nuevoMarcoNormativo]);
      // Seleccionarlo automáticamente en el wizard
      this.wizardMarcosSeleccionados = [...this.wizardMarcosSeleccionados, nuevoMarcoNormativo];
      // Actualizar también el dato en wizardDatosGenerales
      this.actualizarMarcosSeleccionados(this.wizardMarcosSeleccionados);
      this.cerrarDialogoMarcoWizard();
      this.messageService.add({
        severity: 'success',
        summary: 'Marco agregado',
        detail: `${nuevo.acronimo} ha sido agregado y seleccionado`
      });
    }
  }

  actualizarMarcosSeleccionados(marcos: MarcoNormativo[]) {
    this.wizardMarcosSeleccionados = marcos;
    // Guardar los IDs de los marcos seleccionados en wizardDatosGenerales
    const marcosIds = marcos.map(m => m.id).join(',');
    this.wizardDatosGenerales.update(datos => ({ ...datos, marcoNormativo: marcosIds }));
  }

  limpiarMarcosSeleccionados() {
    this.wizardMarcosSeleccionados = [];
    this.wizardDatosGenerales.update(datos => ({ ...datos, marcoNormativo: '' }));
  }

  eliminarMarcoSeleccionado(marco: MarcoNormativo) {
    this.wizardMarcosSeleccionados = this.wizardMarcosSeleccionados.filter(m => m.id !== marco.id);
    this.actualizarMarcosSeleccionados(this.wizardMarcosSeleccionados);
  }

  // =============================================
  // FORMULARIO INLINE PARA AGREGAR MARCO
  // =============================================
  mostrarFormularioMarcoInline() {
    this.nuevoMarcoInline.set({ acronimo: '', nombre: '', version: '' });
    this.mostrandoFormularioMarco.set(true);
  }

  cancelarNuevoMarcoInline() {
    this.mostrandoFormularioMarco.set(false);
    this.nuevoMarcoInline.set({ acronimo: '', nombre: '', version: '' });
  }

  agregarMarcoInline() {
    const nuevo = this.nuevoMarcoInline();
    if (nuevo.acronimo && nuevo.nombre) {
      const nuevoMarcoNormativo: MarcoNormativo = {
        id: nuevo.acronimo.toLowerCase().replace(/\s+/g, '-'),
        nombre: nuevo.nombre,
        acronimo: nuevo.acronimo,
        descripcion: '',
        version: nuevo.version || '1.0',
        fechaVigencia: new Date(),
        activo: true,
        requisitos: []
      };
      // Agregar a la lista de marcos
      this.marcosNormativos.update(marcos => [...marcos, nuevoMarcoNormativo]);
      // Seleccionarlo automáticamente en el wizard
      this.wizardMarcosSeleccionados = [...this.wizardMarcosSeleccionados, nuevoMarcoNormativo];
      this.actualizarMarcosSeleccionados(this.wizardMarcosSeleccionados);
      // Limpiar y ocultar formulario
      this.cancelarNuevoMarcoInline();
      this.messageService.add({
        severity: 'success',
        summary: 'Marco agregado',
        detail: `${nuevo.acronimo} ha sido agregado y seleccionado`
      });
    }
  }

  inicializarMarcosSeleccionados() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (cuestionario?.marcoNormativo) {
      const marco = this.marcosNormativos().find(m => m.id === cuestionario.marcoNormativo);
      if (marco) {
        this.marcosSeleccionados = [marco];
      }
    }
  }

  // =============================================
  // MÉTODOS - CUESTIONARIOS (WIZARD)
  // =============================================
  crearNuevoCuestionario() {
    this.router.navigate(['/cuestionarios/crear']);
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
      // Si es IA, saltar umbrales e ir directo al paso de configuración IA
      if (metodo === 'ia') {
        this.wizardPaso.set(2); // Paso 2 ahora es configuración IA
      } else {
        this.finalizarWizardManual(); // Manual va directo al editor
      }
      return;
    }

    // Paso 2 ahora es configuración IA (antes era umbrales)
    // La generación se maneja en generarConIAWizard()
  }

  puedeAvanzarWizard(): boolean {
    const paso = this.wizardPaso();
    const metodo = this.metodoCreacion();

    if (paso === 0) return !!metodo;
    if (paso === 1) return !!this.wizardDatosGenerales().nombre.trim();
    // Paso 2 es configuración IA (para método IA)
    if (paso === 2 && metodo === 'ia') {
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
    this.wizardPaso.set(3); // Paso 3 es preview para flujo IA (saltamos umbrales)
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

  guardarYVolverALista() {
    const preview = this.wizardPreviewCuestionario();
    if (!preview) return;

    // Agregar el cuestionario a la lista
    this.cuestionarios.update(lista => [...lista, preview]);

    // Limpiar estado del wizard
    this.wizardPreviewCuestionario.set(null);
    this.wizardPaso.set(0);
    this.metodoCreacion.set(null);
    this.promptIA.set('');
    this.wizardDocumento.set(null);

    // Volver a la lista
    this.vistaActual.set('lista');

    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Cuestionario guardado exitosamente'
    });
  }

  regenerarConIA() {
    this.wizardPaso.set(2); // Volver al paso de configuración IA para regenerar
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
