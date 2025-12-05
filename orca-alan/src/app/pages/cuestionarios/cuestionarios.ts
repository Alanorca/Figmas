import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { StepsModule } from 'primeng/steps';
import { MultiSelectModule } from 'primeng/multiselect';
// EditorModule removed - requires quill dependency
import { ChartModule } from 'primeng/chart';
import { TreeModule } from 'primeng/tree';
import { SplitterModule } from 'primeng/splitter';
// TabsModule already imported above
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// =============================================
// INTERFACES - MODELO DE DATOS COMPLETO
// =============================================

interface MarcoNormativo {
  id: string;
  nombre: string;
  acronimo: string;
  version: string;
  fechaVigencia: Date;
  descripcion: string;
  requisitos: RequisitoNormativo[];
  activo: boolean;
}

interface RequisitoNormativo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  marcoId: string;
  controlesAsociados: string[];
}

interface Cuestionario {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: 'ia' | 'manual';
  tipoEvaluacion: 'autoevaluacion' | 'auditoria_externa' | 'revision_controles';
  estado: 'borrador' | 'activo' | 'archivado';
  marcoNormativo: string;
  periodicidad: 'unica' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  preguntas: number;
  respuestas: number;
  tasaCompletado: number;
  fechaCreacion: Date;
  fechaModificacion: Date;
  umbrales: {
    deficiente: number;
    aceptable: number;
    sobresaliente: number;
  };
  secciones: Seccion[];
  areasObjetivo: string[];
  responsables: string[];
}

interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: Pregunta[];
  peso: number;
}

interface Pregunta {
  id: string;
  texto: string;
  tipo: 'texto' | 'opcionMultiple' | 'seleccionUnica' | 'escala' | 'fecha' | 'numero' | 'archivo' | 'matriz' | 'siNoNa' | 'grupo' | 'textoLargo' | 'radioButtons';
  requerida: boolean;
  peso: number;
  opciones?: string[];
  escalaMin?: number;
  escalaMax?: number;
  ayuda?: string;
  placeholder?: string;
  requisitoNormativoId?: string;
  controlAsociado?: string;
  requiereEvidencia: boolean;
  logicaCondicional?: {
    preguntaId: string;
    condicion: string;
    valor: string;
  };
}

interface AsignacionCuestionario {
  id: string;
  cuestionarioId: string;
  areaId: string;
  areaNombre: string;
  responsableId: string;
  responsableNombre: string;
  fechaAsignacion: Date;
  fechaInicio: Date;
  fechaVencimiento: Date;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'vencido' | 'revisado';
  progreso: number;
  instrucciones: string;
  recordatorios: boolean;
}

interface RespuestaCuestionario {
  id: string;
  asignacionId: string;
  cuestionarioId: string;
  respondidoPor: string;
  fechaInicio: Date;
  fechaEnvio: Date | null;
  estado: 'borrador' | 'enviado' | 'en_revision' | 'aprobado' | 'rechazado';
  respuestas: RespuestaPregunta[];
  puntuacionTotal: number;
  nivelCumplimiento: 'deficiente' | 'aceptable' | 'sobresaliente';
  comentariosGenerales: string;
}

interface RespuestaPregunta {
  preguntaId: string;
  valor: string | string[] | number | Date | null;
  comentario: string;
  evidencias: Evidencia[];
  marcadaParaRevision: boolean;
  estadoRevision: 'pendiente' | 'aprobada' | 'rechazada' | 'requiere_aclaracion';
  comentarioRevisor: string;
}

interface Evidencia {
  id: string;
  nombre: string;
  tipo: string;
  tamano: number;
  fechaCarga: Date;
  url: string;
  descripcion: string;
  vigencia: Date | null;
  estado: 'vigente' | 'proximo_vencer' | 'vencida';
}

interface Hallazgo {
  id: string;
  tipo: 'conformidad' | 'no_conformidad_menor' | 'no_conformidad_mayor' | 'observacion';
  descripcion: string;
  preguntaId: string;
  requisitoNormativo: string;
  accionCorrectiva: string;
  responsable: string;
  fechaLimite: Date;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
}

interface AlertaCumplimiento {
  id: string;
  tipo: 'cuestionario_vencido' | 'evidencia_faltante' | 'control_sin_validar' | 'brecha_cumplimiento';
  severidad: 'critica' | 'alta' | 'media' | 'baja';
  titulo: string;
  descripcion: string;
  entidadId: string;
  entidadTipo: string;
  fechaCreacion?: Date;
  fechaGeneracion: Date;
  estado: 'activa' | 'atendida' | 'ignorada';
  responsable?: string;
  marcoNormativo?: string;
}

interface ReporteCumplimiento {
  id: string;
  nombre: string;
  tipo: 'ejecutivo' | 'detallado' | 'hallazgos' | 'tendencias' | 'comparativo';
  formato: 'pdf' | 'excel' | 'word';
  marcoNormativo: string;
  periodo: { inicio: Date; fin: Date };
  fechaGeneracion: Date;
  generadoPor: string;
  contenido: {
    cumplimientoGeneral: number;
    totalPreguntas: number;
    preguntasRespondidas: number;
    hallazgos: number;
    evidenciasPendientes: number;
    areasEvaluadas: string[];
  };
  estado: 'generando' | 'completado' | 'error';
  urlDescarga?: string;
}

interface HistorialAuditoria {
  id: string;
  fecha: Date;
  accion: 'creacion' | 'modificacion' | 'eliminacion' | 'asignacion' | 'respuesta' | 'validacion' | 'exportacion';
  entidadTipo: 'cuestionario' | 'asignacion' | 'respuesta' | 'evidencia' | 'marco' | 'reporte';
  entidadId: string;
  entidadNombre: string;
  usuario: string;
  detalles: string;
  cambiosAnteriores?: string;
  cambiosNuevos?: string;
  ipAddress?: string;
}

interface MapeoControl {
  id: string;
  requisitoNormativoId: string;
  requisitoNormativoCodigo: string;
  requisitoNormativoNombre: string;
  marcoNormativo: string;
  controlId: string;
  controlNombre: string;
  tipoControl: 'preventivo' | 'detectivo' | 'correctivo';
  frecuenciaEvaluacion: 'continua' | 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
  responsable: string;
  estadoImplementacion: 'implementado' | 'parcial' | 'no_implementado' | 'no_aplica';
  efectividad: number; // 0-100
  ultimaEvaluacion: Date;
  evidenciasAsociadas: string[];
  preguntasAsociadas: string[];
}

// CU-14: Controles Faltantes
interface ControlFaltante {
  id: string;
  requisitoNormativoId: string;
  requisitoNormativoCodigo: string;
  requisitoNormativoNombre: string;
  marcoNormativo: string;
  riesgoAsociado: string;
  prioridadImplementacion: 'critica' | 'alta' | 'media' | 'baja';
  controlSugerido: string;
  descripcionControl: string;
  referenciaControlesSimilares: string[];
  fechaDeteccion: Date;
  estado: 'pendiente' | 'en_evaluacion' | 'aceptado' | 'rechazado';
  responsableSugerido: string;
}

// CU-15: Acciones Correctivas
interface AccionCorrectiva {
  id: string;
  titulo: string;
  descripcion: string;
  tipoAccion: 'inmediata' | 'corto_plazo' | 'mediano_plazo';
  prioridad: 'critica' | 'alta' | 'media';
  hallazgoOrigen: string;
  controlAfectado: string;
  marcoNormativo: string;
  responsable: string;
  fechaCreacion: Date;
  fechaVencimiento: Date;
  fechaCompletado: Date | null;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada';
  recursosRequeridos: string;
  resultadoEsperado: string;
  metricasVerificacion: string;
  evidenciaImplementacion: string | null;
  efectividadVerificada: boolean;
}

@Component({
  selector: 'app-cuestionarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    TimelineModule,
    AvatarModule,
    StepsModule,
    MultiSelectModule,
    ChartModule,
    TreeModule,
    SplitterModule,
    MessageModule,
    ScrollPanelModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cuestionarios.html',
  styleUrl: './cuestionarios.scss'
})
export class CuestionariosComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // =============================================
  // ESTADO DE LA VISTA
  // =============================================
  vistaActual = signal<'lista' | 'editor' | 'responder' | 'revisar' | 'asignar' | 'dashboard' | 'marcos' | 'evidencias' | 'reportes' | 'historial' | 'mapeo'>('lista');

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
  pasoNuevoCuestionario = signal(0); // Multi-step: 0=Datos Generales, 1=Configuración, 2=Umbrales
  showIADialog = signal(false);
  showAsignarDialog = signal(false);
  showMarcoDialog = signal(false);
  showEvidenciaDialog = signal(false);
  showHallazgoDialog = signal(false);

  // =============================================
  // SELECCIONES
  // =============================================
  cuestionarioSeleccionado = signal<Cuestionario | null>(null);
  asignacionSeleccionada = signal<AsignacionCuestionario | null>(null);
  respuestaActual = signal<RespuestaCuestionario | null>(null);
  marcoSeleccionado = signal<MarcoNormativo | null>(null);

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
  // NUEVA ASIGNACIÓN
  // =============================================
  nuevaAsignacion = signal<Partial<AsignacionCuestionario>>({
    areaId: '',
    responsableId: '',
    fechaInicio: new Date(),
    fechaVencimiento: new Date(),
    instrucciones: '',
    recordatorios: true
  });

  // =============================================
  // NUEVO MARCO NORMATIVO
  // =============================================
  nuevoMarco = signal<Partial<MarcoNormativo>>({
    nombre: '',
    acronimo: '',
    version: '',
    descripcion: '',
    requisitos: [],
    activo: true
  });

  // =============================================
  // EDITOR STATE
  // =============================================
  seccionActiva = signal<string | null>(null);
  preguntaArrastrada = signal<Pregunta | null>(null);
  menuSeccionActual = signal<string>('');

  // =============================================
  // IA
  // =============================================
  promptIA = signal('');
  generandoIA = signal(false);

  // =============================================
  // WIZARD NUEVO CUESTIONARIO
  // Paso 0: Selector método (Manual/IA)
  // Paso 1: Datos generales
  // Paso 2: Umbrales
  // Paso 3: Config IA (solo si eligió IA) - prompt o documento
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
  wizardPreviewCuestionario = signal<Cuestionario | null>(null); // Para preview después de generar

  // =============================================
  // HALLAZGOS
  // =============================================
  nuevoHallazgo = signal<Partial<Hallazgo>>({
    tipo: 'observacion',
    descripcion: '',
    accionCorrectiva: '',
    responsable: '',
    estado: 'abierto'
  });

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
    { label: 'Opción múltiple', value: 'opcionMultiple', icon: 'pi pi-check-square' },
    { label: 'Selección única', value: 'seleccionUnica', icon: 'pi pi-circle' },
    { label: 'Escala numérica', value: 'escala', icon: 'pi pi-sliders-h' },
    { label: 'Sí/No/N/A', value: 'siNoNa', icon: 'pi pi-check' },
    { label: 'Fecha', value: 'fecha', icon: 'pi pi-calendar' },
    { label: 'Número', value: 'numero', icon: 'pi pi-hashtag' },
    { label: 'Archivo adjunto', value: 'archivo', icon: 'pi pi-paperclip' },
    { label: 'Matriz', value: 'matriz', icon: 'pi pi-table' }
  ];

  tipoHallazgoOptions = [
    { label: 'Conformidad', value: 'conformidad' },
    { label: 'No Conformidad Menor', value: 'no_conformidad_menor' },
    { label: 'No Conformidad Mayor', value: 'no_conformidad_mayor' },
    { label: 'Observación', value: 'observacion' }
  ];

  areasOptions = [
    { label: 'Tecnología', value: 'tecnologia' },
    { label: 'Finanzas', value: 'finanzas' },
    { label: 'Operaciones', value: 'operaciones' },
    { label: 'Recursos Humanos', value: 'rrhh' },
    { label: 'Legal', value: 'legal' },
    { label: 'Cumplimiento', value: 'cumplimiento' }
  ];

  responsablesOptions = [
    { label: 'Juan Pérez', value: 'user1' },
    { label: 'María García', value: 'user2' },
    { label: 'Carlos López', value: 'user3' },
    { label: 'Ana Martínez', value: 'user4' },
    { label: 'Roberto Sánchez', value: 'user5' }
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
  // DATOS MOCK - ASIGNACIONES
  // =============================================
  asignaciones = signal<AsignacionCuestionario[]>([
    {
      id: 'a1',
      cuestionarioId: '1',
      areaId: 'finanzas',
      areaNombre: 'Finanzas',
      responsableId: 'user1',
      responsableNombre: 'Juan Pérez',
      fechaAsignacion: new Date('2024-11-01'),
      fechaInicio: new Date('2024-11-01'),
      fechaVencimiento: new Date('2024-12-15'),
      estado: 'en_progreso',
      progreso: 65,
      instrucciones: 'Completar todas las secciones con evidencia documental',
      recordatorios: true
    },
    {
      id: 'a2',
      cuestionarioId: '1',
      areaId: 'tecnologia',
      areaNombre: 'Tecnología',
      responsableId: 'user2',
      responsableNombre: 'María García',
      fechaAsignacion: new Date('2024-11-01'),
      fechaInicio: new Date('2024-11-01'),
      fechaVencimiento: new Date('2024-12-15'),
      estado: 'completado',
      progreso: 100,
      instrucciones: 'Completar todas las secciones con evidencia documental',
      recordatorios: true
    },
    {
      id: 'a3',
      cuestionarioId: '2',
      areaId: 'operaciones',
      areaNombre: 'Operaciones',
      responsableId: 'user3',
      responsableNombre: 'Carlos López',
      fechaAsignacion: new Date('2024-11-15'),
      fechaInicio: new Date('2024-11-15'),
      fechaVencimiento: new Date('2024-12-01'),
      estado: 'vencido',
      progreso: 30,
      instrucciones: 'Evaluación trimestral de riesgos operativos',
      recordatorios: true
    },
    {
      id: 'a4',
      cuestionarioId: '4',
      areaId: 'legal',
      areaNombre: 'Legal',
      responsableId: 'user5',
      responsableNombre: 'Roberto Sánchez',
      fechaAsignacion: new Date('2024-11-20'),
      fechaInicio: new Date('2024-11-20'),
      fechaVencimiento: new Date('2025-01-20'),
      estado: 'pendiente',
      progreso: 0,
      instrucciones: 'Evaluación semestral de cumplimiento GDPR',
      recordatorios: true
    }
  ]);

  // =============================================
  // DATOS MOCK - ALERTAS
  // =============================================
  alertas = signal<AlertaCumplimiento[]>([
    {
      id: 'al1',
      tipo: 'cuestionario_vencido',
      severidad: 'alta',
      titulo: 'Cuestionario vencido sin completar',
      descripcion: 'El cuestionario "Análisis de Riesgos Operativos" asignado a Operaciones ha vencido con solo 30% de progreso',
      entidadId: 'a3',
      entidadTipo: 'asignacion',
      fechaGeneracion: new Date('2024-12-02'),
      estado: 'activa',
      responsable: 'Carlos López'
    },
    {
      id: 'al2',
      tipo: 'evidencia_faltante',
      severidad: 'media',
      titulo: 'Evidencia faltante en control',
      descripcion: 'El control "Política de contraseñas" no tiene evidencia documental adjunta',
      entidadId: 'ctrl1',
      entidadTipo: 'control',
      fechaGeneracion: new Date('2024-12-01'),
      estado: 'activa',
      responsable: 'María García',
      marcoNormativo: 'ISO 27001'
    },
    {
      id: 'al3',
      tipo: 'brecha_cumplimiento',
      severidad: 'critica',
      titulo: 'Brecha crítica de cumplimiento ISO 27001',
      descripcion: 'Se detectó que el requisito A.8.1 (Gestión de activos) tiene cumplimiento por debajo del 40%',
      entidadId: 'r3',
      entidadTipo: 'requisito',
      fechaGeneracion: new Date('2024-11-28'),
      estado: 'activa',
      responsable: 'Ana Martínez',
      marcoNormativo: 'ISO 27001'
    }
  ]);

  // =============================================
  // DATOS MOCK - HALLAZGOS
  // =============================================
  hallazgos = signal<Hallazgo[]>([
    {
      id: 'h1',
      tipo: 'no_conformidad_menor',
      descripcion: 'La política de contraseñas no incluye requisitos de complejidad actualizados',
      preguntaId: 'p1',
      requisitoNormativo: 'A.5.1',
      accionCorrectiva: 'Actualizar política de contraseñas con nuevos requisitos de complejidad',
      responsable: 'user2',
      fechaLimite: new Date('2025-01-15'),
      estado: 'en_proceso'
    },
    {
      id: 'h2',
      tipo: 'observacion',
      descripcion: 'Se recomienda automatizar el proceso de revisión de accesos',
      preguntaId: 'p4',
      requisitoNormativo: 'SOX 404',
      accionCorrectiva: 'Evaluar herramientas de automatización de revisión de accesos',
      responsable: 'user1',
      fechaLimite: new Date('2025-03-01'),
      estado: 'abierto'
    }
  ]);

  // =============================================
  // DATOS MOCK - REPORTES
  // =============================================
  reportes = signal<ReporteCumplimiento[]>([
    {
      id: 'rep1',
      nombre: 'Reporte Ejecutivo ISO 27001 - Q4 2024',
      tipo: 'ejecutivo',
      formato: 'pdf',
      marcoNormativo: 'iso27001',
      periodo: { inicio: new Date('2024-10-01'), fin: new Date('2024-12-31') },
      fechaGeneracion: new Date('2024-12-20'),
      generadoPor: 'María García',
      contenido: {
        cumplimientoGeneral: 85,
        totalPreguntas: 150,
        preguntasRespondidas: 142,
        hallazgos: 3,
        evidenciasPendientes: 2,
        areasEvaluadas: ['TI', 'Finanzas', 'RRHH']
      },
      estado: 'completado',
      urlDescarga: '/reportes/rep1.pdf'
    },
    {
      id: 'rep2',
      nombre: 'Reporte Detallado SOX 2024',
      tipo: 'detallado',
      formato: 'excel',
      marcoNormativo: 'sox',
      periodo: { inicio: new Date('2024-01-01'), fin: new Date('2024-12-31') },
      fechaGeneracion: new Date('2024-12-18'),
      generadoPor: 'Carlos López',
      contenido: {
        cumplimientoGeneral: 78,
        totalPreguntas: 200,
        preguntasRespondidas: 189,
        hallazgos: 5,
        evidenciasPendientes: 8,
        areasEvaluadas: ['Finanzas', 'Contabilidad', 'Auditoría Interna']
      },
      estado: 'completado',
      urlDescarga: '/reportes/rep2.xlsx'
    },
    {
      id: 'rep3',
      nombre: 'Reporte de Hallazgos GDPR',
      tipo: 'hallazgos',
      formato: 'word',
      marcoNormativo: 'gdpr',
      periodo: { inicio: new Date('2024-01-01'), fin: new Date('2024-12-31') },
      fechaGeneracion: new Date(),
      generadoPor: 'Ana Martínez',
      contenido: {
        cumplimientoGeneral: 0,
        totalPreguntas: 0,
        preguntasRespondidas: 0,
        hallazgos: 0,
        evidenciasPendientes: 0,
        areasEvaluadas: []
      },
      estado: 'generando'
    }
  ]);

  // =============================================
  // DATOS MOCK - HISTORIAL DE AUDITORÍA
  // =============================================
  historialAuditoria = signal<HistorialAuditoria[]>([
    {
      id: 'hist1',
      fecha: new Date('2024-12-20T10:30:00'),
      accion: 'validacion',
      entidadTipo: 'respuesta',
      entidadId: 'resp1',
      entidadNombre: 'Respuesta - Evaluación ISO 27001 TI',
      usuario: 'María García',
      detalles: 'Se validó la respuesta con puntaje 85%',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'hist2',
      fecha: new Date('2024-12-19T14:15:00'),
      accion: 'creacion',
      entidadTipo: 'cuestionario',
      entidadId: 'q5',
      entidadNombre: 'Evaluación PCI-DSS Pagos',
      usuario: 'Carlos López',
      detalles: 'Se creó nuevo cuestionario para evaluación de seguridad en pagos',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'hist3',
      fecha: new Date('2024-12-18T09:45:00'),
      accion: 'asignacion',
      entidadTipo: 'asignacion',
      entidadId: 'asig3',
      entidadNombre: 'Asignación - ISO 27001 a RRHH',
      usuario: 'Ana Martínez',
      detalles: 'Se asignó cuestionario ISO 27001 al departamento de RRHH',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'hist4',
      fecha: new Date('2024-12-17T16:20:00'),
      accion: 'modificacion',
      entidadTipo: 'marco',
      entidadId: 'iso27001',
      entidadNombre: 'ISO 27001:2022',
      usuario: 'María García',
      detalles: 'Se actualizaron los requisitos del marco normativo',
      cambiosAnteriores: 'Versión: 2022 v1.0',
      cambiosNuevos: 'Versión: 2022 v1.1',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'hist5',
      fecha: new Date('2024-12-16T11:00:00'),
      accion: 'exportacion',
      entidadTipo: 'reporte',
      entidadId: 'rep1',
      entidadNombre: 'Reporte Ejecutivo ISO 27001 - Q4 2024',
      usuario: 'Carlos López',
      detalles: 'Se exportó reporte en formato PDF',
      ipAddress: '192.168.1.101'
    }
  ]);

  // =============================================
  // DATOS MOCK - MAPEO DE CONTROLES
  // =============================================
  mapeoControles = signal<MapeoControl[]>([
    {
      id: 'map1',
      requisitoNormativoId: 'r1',
      requisitoNormativoCodigo: 'A.5.1',
      requisitoNormativoNombre: 'Políticas de seguridad de la información',
      marcoNormativo: 'ISO 27001',
      controlId: 'ctrl1',
      controlNombre: 'Control de Acceso a Sistemas',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'trimestral',
      responsable: 'CISO',
      estadoImplementacion: 'implementado',
      efectividad: 92,
      ultimaEvaluacion: new Date('2024-11-15'),
      evidenciasAsociadas: ['ev1', 'ev2'],
      preguntasAsociadas: ['p1', 'p2', 'p3']
    },
    {
      id: 'map2',
      requisitoNormativoId: 'r2',
      requisitoNormativoCodigo: 'A.8.2',
      requisitoNormativoNombre: 'Clasificación de la información',
      marcoNormativo: 'ISO 27001',
      controlId: 'ctrl2',
      controlNombre: 'Etiquetado de Información Sensible',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'mensual',
      responsable: 'DPO',
      estadoImplementacion: 'parcial',
      efectividad: 68,
      ultimaEvaluacion: new Date('2024-12-01'),
      evidenciasAsociadas: ['ev3'],
      preguntasAsociadas: ['p4', 'p5']
    },
    {
      id: 'map3',
      requisitoNormativoId: 'r3',
      requisitoNormativoCodigo: 'SOX 404',
      requisitoNormativoNombre: 'Control interno sobre información financiera',
      marcoNormativo: 'SOX',
      controlId: 'ctrl3',
      controlNombre: 'Segregación de Funciones',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'anual',
      responsable: 'CFO',
      estadoImplementacion: 'implementado',
      efectividad: 85,
      ultimaEvaluacion: new Date('2024-10-30'),
      evidenciasAsociadas: ['ev4', 'ev5'],
      preguntasAsociadas: ['p6', 'p7']
    },
    {
      id: 'map4',
      requisitoNormativoId: 'r4',
      requisitoNormativoCodigo: 'Art. 32',
      requisitoNormativoNombre: 'Seguridad del tratamiento',
      marcoNormativo: 'GDPR',
      controlId: 'ctrl4',
      controlNombre: 'Cifrado de Datos Personales',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'continua',
      responsable: 'DPO',
      estadoImplementacion: 'implementado',
      efectividad: 95,
      ultimaEvaluacion: new Date('2024-12-10'),
      evidenciasAsociadas: ['ev6'],
      preguntasAsociadas: ['p8']
    },
    {
      id: 'map5',
      requisitoNormativoId: 'r5',
      requisitoNormativoCodigo: 'Req. 3',
      requisitoNormativoNombre: 'Proteger datos de tarjetahabiente almacenados',
      marcoNormativo: 'PCI-DSS',
      controlId: 'ctrl5',
      controlNombre: 'Tokenización de Datos de Tarjeta',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'trimestral',
      responsable: 'IT Security',
      estadoImplementacion: 'implementado',
      efectividad: 98,
      ultimaEvaluacion: new Date('2024-11-20'),
      evidenciasAsociadas: ['ev7', 'ev8'],
      preguntasAsociadas: ['p9', 'p10']
    }
  ]);

  // =============================================
  // DATOS MOCK - CONTROLES FALTANTES (CU-14)
  // =============================================
  controlesFaltantes = signal<ControlFaltante[]>([
    {
      id: 'cf1',
      requisitoNormativoId: 'r10',
      requisitoNormativoCodigo: 'A.9.4',
      requisitoNormativoNombre: 'Control de acceso a sistemas y aplicaciones',
      marcoNormativo: 'ISO 27001',
      riesgoAsociado: 'Acceso no autorizado a sistemas críticos',
      prioridadImplementacion: 'alta',
      controlSugerido: 'Autenticación Multifactor (MFA)',
      descripcionControl: 'Implementar autenticación de dos o más factores para acceso a sistemas críticos',
      referenciaControlesSimilares: ['Control de Acceso a Sistemas', 'Gestión de Identidades'],
      fechaDeteccion: new Date('2024-12-15'),
      estado: 'pendiente',
      responsableSugerido: 'CISO'
    },
    {
      id: 'cf2',
      requisitoNormativoId: 'r11',
      requisitoNormativoCodigo: 'A.12.6',
      requisitoNormativoNombre: 'Gestión de vulnerabilidades técnicas',
      marcoNormativo: 'ISO 27001',
      riesgoAsociado: 'Vulnerabilidades no remediadas',
      prioridadImplementacion: 'critica',
      controlSugerido: 'Programa de Gestión de Parches',
      descripcionControl: 'Establecer un proceso formal para identificar, evaluar y aplicar parches de seguridad',
      referenciaControlesSimilares: ['Reporte de Vulnerabilidades'],
      fechaDeteccion: new Date('2024-12-10'),
      estado: 'en_evaluacion',
      responsableSugerido: 'IT Security'
    },
    {
      id: 'cf3',
      requisitoNormativoId: 'r12',
      requisitoNormativoCodigo: 'Art. 35',
      requisitoNormativoNombre: 'Evaluación de impacto en protección de datos',
      marcoNormativo: 'GDPR',
      riesgoAsociado: 'Procesamiento de datos sin evaluación de impacto',
      prioridadImplementacion: 'alta',
      controlSugerido: 'DPIA (Data Protection Impact Assessment)',
      descripcionControl: 'Implementar proceso de evaluación de impacto para nuevos tratamientos de datos personales',
      referenciaControlesSimilares: ['Cifrado de Datos Personales'],
      fechaDeteccion: new Date('2024-12-08'),
      estado: 'aceptado',
      responsableSugerido: 'DPO'
    }
  ]);

  // =============================================
  // DATOS MOCK - ACCIONES CORRECTIVAS (CU-15)
  // =============================================
  accionesCorrectivas = signal<AccionCorrectiva[]>([
    {
      id: 'ac1',
      titulo: 'Implementar MFA para sistemas críticos',
      descripcion: 'Configurar autenticación multifactor para todos los sistemas críticos de la organización incluyendo ERP, CRM y sistemas de nómina.',
      tipoAccion: 'corto_plazo',
      prioridad: 'alta',
      hallazgoOrigen: 'Cuestionario de Autoevaluación ISO 27001 - Pregunta A.9.4',
      controlAfectado: 'Control de Acceso',
      marcoNormativo: 'ISO 27001',
      responsable: 'Carlos Méndez',
      fechaCreacion: new Date('2024-12-15'),
      fechaVencimiento: new Date('2025-02-28'),
      fechaCompletado: null,
      estado: 'en_progreso',
      recursosRequeridos: 'Licencias de MFA, configuración de IdP, capacitación de usuarios',
      resultadoEsperado: '100% de sistemas críticos con MFA habilitado',
      metricasVerificacion: 'Porcentaje de sistemas con MFA activo, número de accesos sin MFA',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    },
    {
      id: 'ac2',
      titulo: 'Establecer programa de gestión de parches',
      descripcion: 'Crear un proceso documentado y automatizado para la gestión de parches de seguridad que incluya evaluación de riesgos, pruebas y despliegue.',
      tipoAccion: 'inmediata',
      prioridad: 'critica',
      hallazgoOrigen: 'Auditoría Externa - Control de Vulnerabilidades',
      controlAfectado: 'Gestión de Vulnerabilidades',
      marcoNormativo: 'ISO 27001',
      responsable: 'Ana Torres',
      fechaCreacion: new Date('2024-12-10'),
      fechaVencimiento: new Date('2025-01-31'),
      fechaCompletado: null,
      estado: 'pendiente',
      recursosRequeridos: 'Herramienta de gestión de parches, personal de TI dedicado',
      resultadoEsperado: 'Parches críticos aplicados en máximo 72 horas',
      metricasVerificacion: 'Tiempo promedio de aplicación de parches, sistemas sin parches críticos',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    },
    {
      id: 'ac3',
      titulo: 'Actualizar política de clasificación de información',
      descripcion: 'Revisar y actualizar la política de clasificación de información para alinearla con los requisitos de GDPR y las mejores prácticas actuales.',
      tipoAccion: 'mediano_plazo',
      prioridad: 'media',
      hallazgoOrigen: 'Revisión de Controles SOX - Control de Etiquetado',
      controlAfectado: 'Etiquetado de Información Sensible',
      marcoNormativo: 'SOX',
      responsable: 'Laura Sánchez',
      fechaCreacion: new Date('2024-11-20'),
      fechaVencimiento: new Date('2025-03-31'),
      fechaCompletado: new Date('2024-12-18'),
      estado: 'completada',
      recursosRequeridos: 'Consultoría legal, revisión por parte de DPO',
      resultadoEsperado: 'Política actualizada y aprobada por la dirección',
      metricasVerificacion: 'Aprobación de política, capacitación del personal',
      evidenciaImplementacion: 'Política de Clasificación v3.0 aprobada',
      efectividadVerificada: true
    },
    {
      id: 'ac4',
      titulo: 'Implementar proceso DPIA',
      descripcion: 'Establecer un proceso formal para realizar evaluaciones de impacto en protección de datos antes de iniciar nuevos tratamientos.',
      tipoAccion: 'corto_plazo',
      prioridad: 'alta',
      hallazgoOrigen: 'Cuestionario GDPR - Art. 35',
      controlAfectado: 'Evaluación de Impacto',
      marcoNormativo: 'GDPR',
      responsable: 'María García (DPO)',
      fechaCreacion: new Date('2024-12-08'),
      fechaVencimiento: new Date('2025-02-15'),
      fechaCompletado: null,
      estado: 'en_progreso',
      recursosRequeridos: 'Plantillas DPIA, formación del equipo de privacidad',
      resultadoEsperado: 'Proceso DPIA operativo y documentado',
      metricasVerificacion: 'Número de DPIAs realizados, tiempo de evaluación',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    }
  ]);

  // =============================================
  // DATOS MOCK - EVIDENCIAS DOCUMENTALES (CU-11)
  // =============================================
  evidencias = signal<Evidencia[]>([
    {
      id: 'ev1',
      nombre: 'Política de Seguridad de la Información v2.1.pdf',
      tipo: 'application/pdf',
      tamano: 2548000,
      fechaCarga: new Date('2024-11-15'),
      url: '/evidencias/politica_seguridad.pdf',
      descripcion: 'Política de seguridad de la información actualizada y aprobada por la dirección',
      vigencia: new Date('2025-11-15'),
      estado: 'vigente'
    },
    {
      id: 'ev2',
      nombre: 'Acta de Capacitación Q4-2024.pdf',
      tipo: 'application/pdf',
      tamano: 1250000,
      fechaCarga: new Date('2024-12-10'),
      url: '/evidencias/acta_capacitacion.pdf',
      descripcion: 'Acta de capacitación de seguridad de la información - cuarto trimestre 2024',
      vigencia: null,
      estado: 'vigente'
    },
    {
      id: 'ev3',
      nombre: 'Reporte de Vulnerabilidades - Diciembre 2024.xlsx',
      tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tamano: 856000,
      fechaCarga: new Date('2024-12-18'),
      url: '/evidencias/vulnerabilidades_dic2024.xlsx',
      descripcion: 'Reporte mensual de escaneo de vulnerabilidades',
      vigencia: new Date('2025-01-18'),
      estado: 'proximo_vencer'
    },
    {
      id: 'ev4',
      nombre: 'Matriz de Riesgos 2024.xlsx',
      tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tamano: 1450000,
      fechaCarga: new Date('2024-06-01'),
      url: '/evidencias/matriz_riesgos.xlsx',
      descripcion: 'Matriz de identificación y evaluación de riesgos',
      vigencia: new Date('2024-12-01'),
      estado: 'vencida'
    },
    {
      id: 'ev5',
      nombre: 'Plan de Continuidad de Negocio.docx',
      tipo: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      tamano: 3250000,
      fechaCarga: new Date('2024-08-20'),
      url: '/evidencias/plan_continuidad.docx',
      descripcion: 'Plan de continuidad de negocio y recuperación ante desastres',
      vigencia: new Date('2025-08-20'),
      estado: 'vigente'
    },
    {
      id: 'ev6',
      nombre: 'Certificado ISO 27001.pdf',
      tipo: 'application/pdf',
      tamano: 520000,
      fechaCarga: new Date('2024-03-15'),
      url: '/evidencias/certificado_iso27001.pdf',
      descripcion: 'Certificado de cumplimiento ISO 27001:2022',
      vigencia: new Date('2027-03-15'),
      estado: 'vigente'
    }
  ]);

  // Estado de evidencias
  filtroEvidenciaEstado = signal<string | null>(null);
  filtroEvidenciaTipo = signal<string | null>(null);
  busquedaEvidencia = signal('');

  // Estado de generación de reportes
  reporteEnGeneracion = signal(false);
  nuevoReporte = signal<Partial<ReporteCumplimiento>>({
    nombre: '',
    tipo: 'ejecutivo',
    formato: 'pdf',
    marcoNormativo: '',
    periodo: { inicio: new Date(), fin: new Date() }
  });

  // Filtros de historial
  filtroHistorialAccion = signal<string | null>(null);
  filtroHistorialEntidad = signal<string | null>(null);
  filtroHistorialFechaInicio = signal<Date | null>(null);
  filtroHistorialFechaFin = signal<Date | null>(null);

  // =============================================
  // ESTADÍSTICAS COMPUTADAS
  // =============================================
  totalCuestionarios = computed(() => this.cuestionarios().length);
  totalActivos = computed(() => this.cuestionarios().filter(c => c.estado === 'activo').length);
  totalRespuestas = computed(() => this.cuestionarios().reduce((sum, c) => sum + c.respuestas, 0));
  promedioCompletado = computed(() => {
    const activos = this.cuestionarios().filter(c => c.estado === 'activo');
    if (activos.length === 0) return 0;
    return Math.round(activos.reduce((sum, c) => sum + c.tasaCompletado, 0) / activos.length);
  });

  alertasCriticas = computed(() => this.alertas().filter(a => a.severidad === 'critica' && a.estado === 'activa').length);
  alertasActivas = computed(() => this.alertas().filter(a => a.estado === 'activa'));
  asignacionesPendientes = computed(() => this.asignaciones().filter(a => a.estado === 'pendiente' || a.estado === 'en_progreso').length);
  asignacionesVencidas = computed(() => this.asignaciones().filter(a => a.estado === 'vencido').length);

  // Cumplimiento por marco normativo
  cumplimientoPorMarco = computed(() => {
    return this.marcosNormativos().map(marco => {
      const cuestionariosMarco = this.cuestionarios().filter(c => c.marcoNormativo === marco.id && c.estado === 'activo');
      const promedio = cuestionariosMarco.length > 0
        ? Math.round(cuestionariosMarco.reduce((sum, c) => sum + c.tasaCompletado, 0) / cuestionariosMarco.length)
        : 0;
      return {
        marco: marco.acronimo,
        cumplimiento: promedio,
        cuestionarios: cuestionariosMarco.length
      };
    });
  });

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
      case 'activo': case 'completado': case 'aprobado': return 'success';
      case 'borrador': case 'pendiente': case 'en_progreso': return 'warn';
      case 'archivado': case 'rechazado': return 'secondary';
      case 'vencido': return 'danger';
      default: return 'info';
    }
  }

  getTipoSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return tipo === 'ia' ? 'info' : 'secondary';
  }

  getSeveridadAlerta(severidad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (severidad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      case 'baja': return 'secondary';
      default: return 'info';
    }
  }

  getMarcoNombre(marcoId: string): string {
    const marco = this.marcosNormativos().find(m => m.id === marcoId);
    return marco ? marco.acronimo : marcoId;
  }

  getCuestionarioNombre(cuestionarioId: string): string {
    const cuestionario = this.cuestionarios().find(c => c.id === cuestionarioId);
    return cuestionario ? cuestionario.nombre : cuestionarioId;
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
    this.asignacionSeleccionada.set(null);
    this.respuestaActual.set(null);
  }

  irADashboard() {
    this.vistaActual.set('dashboard');
  }

  irAMarcos() {
    this.vistaActual.set('marcos');
  }

  // =============================================
  // MÉTODOS - CUESTIONARIOS
  // =============================================
  // Abrir wizard para nuevo cuestionario
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
    this.showWizardDialog.set(true);
  }

  // Seleccionar método de creación
  seleccionarMetodoCreacion(metodo: 'manual' | 'ia') {
    this.metodoCreacion.set(metodo);
  }

  // Continuar en el wizard - navega entre pasos
  continuarWizard() {
    const paso = this.wizardPaso();
    const metodo = this.metodoCreacion();

    if (paso === 0 && !metodo) return;

    // Paso 0 -> Paso 1 (Datos generales)
    if (paso === 0) {
      this.wizardPaso.set(1);
      return;
    }

    // Paso 1 -> Paso 2 (Umbrales) - validar nombre
    if (paso === 1) {
      if (!this.wizardDatosGenerales().nombre.trim()) {
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'El nombre del cuestionario es requerido' });
        return;
      }
      this.wizardPaso.set(2);
      return;
    }

    // Paso 2 -> Finalizar (Manual) o Paso 3 (IA)
    if (paso === 2) {
      if (metodo === 'manual') {
        this.finalizarWizardManual();
      } else {
        this.wizardPaso.set(3);
      }
      return;
    }
  }

  // Validar si puede avanzar en el wizard
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

  // Finalizar wizard con creación manual
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

  // Generar cuestionario con IA desde wizard - va al preview
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
    this.wizardPaso.set(4); // Ir al preview
    this.messageService.add({ severity: 'success', summary: 'IA', detail: 'Cuestionario generado. Revisa el preview.' });
  }

  // Ir al editor desde el preview
  irAEditorDesdePreview() {
    const preview = this.wizardPreviewCuestionario();
    if (!preview) return;

    this.cuestionarioSeleccionado.set(preview);
    this.preguntaSeleccionada.set(null);
    this.showWizardDialog.set(false);
    this.vistaActual.set('editor');
  }

  // Regenerar cuestionario con IA
  regenerarConIA() {
    this.wizardPaso.set(3); // Volver al paso de IA
    this.wizardPreviewCuestionario.set(null);
  }

  // Manejar selección de documento para IA
  onSelectDocumentoIA(event: any) {
    const file = event.files?.[0];
    if (file) {
      this.wizardDocumento.set(file);
    }
  }

  // Manejar input file nativo para documento
  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.wizardDocumento.set(file);
    }
  }

  // Manejar drag and drop de documento
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

  // Limpiar documento seleccionado
  limpiarDocumentoIA() {
    this.wizardDocumento.set(null);
  }

  // Actualizar campo de datos generales
  actualizarDatosGenerales(campo: string, valor: any) {
    this.wizardDatosGenerales.update(datos => ({ ...datos, [campo]: valor }));
  }

  // Actualizar campo de umbrales
  actualizarUmbrales(campo: string, valor: number) {
    this.wizardUmbrales.update(umbrales => ({ ...umbrales, [campo]: valor }));
  }

  // Volver al paso anterior del wizard
  volverPasoWizard() {
    if (this.wizardPaso() > 0) {
      this.wizardPaso.update(p => p - 1);
    }
  }

  // Guardar cuestionario desde el editor
  guardarCuestionarioEditor() {
    const cuestionario = this.cuestionarioSeleccionado();
    if (!cuestionario) return;

    if (!cuestionario.nombre || cuestionario.nombre.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingresa un nombre para el cuestionario' });
      return;
    }

    // Actualizar fecha de modificacion
    cuestionario.fechaModificacion = new Date();

    // Contar preguntas
    let totalPreguntas = 0;
    cuestionario.secciones.forEach(s => totalPreguntas += s.preguntas.length);
    cuestionario.preguntas = totalPreguntas;

    // Verificar si ya existe
    const existente = this.cuestionarios().find(c => c.id === cuestionario.id);
    if (existente) {
      this.cuestionarios.update(lista => lista.map(c => c.id === cuestionario.id ? cuestionario : c));
    } else {
      this.cuestionarios.update(lista => [...lista, cuestionario]);
    }

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Cuestionario guardado exitosamente' });
  }

  // Estado para panel de propiedades
  preguntaSeleccionada = signal<Pregunta | null>(null);

  seleccionarPregunta(pregunta: Pregunta) {
    this.preguntaSeleccionada.set(pregunta);
  }

  // Obtener label legible para tipo de pregunta
  getTipoPreguntaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'texto': 'Text Input',
      'numero': 'Number',
      'textarea': 'Textarea',
      'seleccionUnica': 'Single Choice',
      'opcionMultiple': 'Multiple Choice',
      'escala': 'Scale/Rating',
      'siNoNa': 'Yes/No/N/A',
      'fecha': 'Date',
      'archivo': 'File Upload',
      'matriz': 'Matrix',
      'grupo': 'Group'
    };
    return labels[tipo] || tipo;
  }

  // Agregar pregunta a una sección existente
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

    // Agregar opciones por defecto para tipos que las requieren
    if (tipo === 'seleccionUnica' || tipo === 'opcionMultiple') {
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

  // Crear nueva sección y agregar pregunta al hacer drop en canvas vacío
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

    // Agregar la pregunta a la nueva sección
    this.agregarPreguntaSeccion(nuevaSeccion.id, arrastrada.tipo);
  }

  // Manejar upload de documento para generar cuestionario
  onUploadDocumento(event: any) {
    const file = event.files?.[0];
    if (!file) return;

    this.messageService.add({
      severity: 'info',
      summary: 'Procesando documento',
      detail: `Analizando ${file.name} para generar cuestionario...`
    });

    // Simular procesamiento del documento
    setTimeout(() => {
      const cuestionario = this.cuestionarioSeleccionado();
      if (!cuestionario) return;

      // Agregar secciones de ejemplo basadas en el documento
      const seccionGenerada: Seccion = {
        id: crypto.randomUUID(),
        nombre: 'Sección generada desde documento',
        descripcion: `Generada a partir de ${file.name}`,
        peso: 1,
        preguntas: [
          {
            id: crypto.randomUUID(),
            texto: '¿Se cumple con el requisito establecido?',
            tipo: 'siNoNa',
            requerida: true,
            peso: 1,
            requiereEvidencia: true
          },
          {
            id: crypto.randomUUID(),
            texto: 'Describa el nivel de implementación',
            tipo: 'texto',
            requerida: false,
            peso: 1,
            requiereEvidencia: false
          }
        ]
      };

      cuestionario.secciones.push(seccionGenerada);
      this.cuestionarioSeleccionado.set({ ...cuestionario });

      this.messageService.add({
        severity: 'success',
        summary: 'Documento procesado',
        detail: 'Se generaron preguntas a partir del documento'
      });
    }, 2000);
  }

  abrirIADialog() {
    this.promptIA.set('');
    this.showIADialog.set(true);
  }

  crearCuestionario() {
    const nuevo = this.nuevoCuestionario();
    const cuestionario: Cuestionario = {
      id: crypto.randomUUID(),
      nombre: nuevo.nombre || 'Sin nombre',
      descripcion: nuevo.descripcion || '',
      categoria: nuevo.categoria || 'cumplimiento',
      tipo: nuevo.tipo || 'manual',
      tipoEvaluacion: nuevo.tipoEvaluacion || 'autoevaluacion',
      estado: 'borrador',
      marcoNormativo: nuevo.marcoNormativo || '',
      periodicidad: nuevo.periodicidad || 'anual',
      preguntas: 0,
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
      umbrales: nuevo.umbrales || { deficiente: 50, aceptable: 70, sobresaliente: 90 },
      secciones: [],
      areasObjetivo: nuevo.areasObjetivo || [],
      responsables: nuevo.responsables || []
    };

    this.cuestionarios.update(lista => [...lista, cuestionario]);
    this.showNuevoDialog.set(false);
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Cuestionario creado exitosamente' });
    this.editarCuestionario(cuestionario);
  }

  async generarConIA() {
    if (!this.promptIA()) return;

    this.generandoIA.set(true);
    await new Promise(resolve => setTimeout(resolve, 2500));

    const cuestionarioGenerado: Cuestionario = {
      id: crypto.randomUUID(),
      nombre: 'Cuestionario generado por IA',
      descripcion: `Generado a partir del prompt: "${this.promptIA().substring(0, 100)}..."`,
      categoria: 'cumplimiento',
      tipo: 'ia',
      tipoEvaluacion: 'autoevaluacion',
      estado: 'borrador',
      marcoNormativo: 'iso27001',
      periodicidad: 'anual',
      preguntas: 15,
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
            { id: crypto.randomUUID(), texto: '¿Existe una política de seguridad de la información documentada y aprobada?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true, requisitoNormativoId: 'r1' },
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
            { id: crypto.randomUUID(), texto: '¿Con qué frecuencia se revisan los accesos de usuarios?', tipo: 'seleccionUnica', requerida: true, peso: 10, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Nunca'] }
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

    this.cuestionarios.update(lista => [...lista, cuestionarioGenerado]);
    this.generandoIA.set(false);
    this.showIADialog.set(false);
    this.messageService.add({ severity: 'success', summary: 'Generado', detail: 'Cuestionario generado con IA exitosamente' });
    this.editarCuestionario(cuestionarioGenerado);
  }

  editarCuestionario(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set({ ...cuestionario });
    this.vistaActual.set('editor');
  }

  duplicarCuestionario(cuestionario: Cuestionario) {
    const copia: Cuestionario = {
      ...cuestionario,
      id: crypto.randomUUID(),
      nombre: `${cuestionario.nombre} (copia)`,
      estado: 'borrador',
      respuestas: 0,
      tasaCompletado: 0,
      fechaCreacion: new Date(),
      fechaModificacion: new Date()
    };
    this.cuestionarios.update(lista => [...lista, copia]);
    this.messageService.add({ severity: 'success', summary: 'Duplicado', detail: 'Cuestionario duplicado exitosamente' });
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

  // =============================================
  // MÉTODOS - EDITOR
  // =============================================
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

    if (tipo === 'seleccionUnica' || tipo === 'opcionMultiple') {
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
  // MÉTODOS - ASIGNACIONES
  // =============================================
  abrirAsignarDialog(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.nuevaAsignacion.set({
      areaId: '',
      responsableId: '',
      fechaInicio: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      instrucciones: '',
      recordatorios: true
    });
    this.showAsignarDialog.set(true);
  }

  crearAsignacion() {
    const cuestionario = this.cuestionarioSeleccionado();
    const asignacion = this.nuevaAsignacion();
    if (!cuestionario || !asignacion.areaId || !asignacion.responsableId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete todos los campos requeridos' });
      return;
    }

    const area = this.areasOptions.find(a => a.value === asignacion.areaId);
    const responsable = this.responsablesOptions.find(r => r.value === asignacion.responsableId);

    const nuevaAsignacion: AsignacionCuestionario = {
      id: crypto.randomUUID(),
      cuestionarioId: cuestionario.id,
      areaId: asignacion.areaId,
      areaNombre: area?.label || '',
      responsableId: asignacion.responsableId,
      responsableNombre: responsable?.label || '',
      fechaAsignacion: new Date(),
      fechaInicio: asignacion.fechaInicio || new Date(),
      fechaVencimiento: asignacion.fechaVencimiento || new Date(),
      estado: 'pendiente',
      progreso: 0,
      instrucciones: asignacion.instrucciones || '',
      recordatorios: asignacion.recordatorios ?? true
    };

    this.asignaciones.update(lista => [...lista, nuevaAsignacion]);
    this.showAsignarDialog.set(false);
    this.messageService.add({ severity: 'success', summary: 'Asignado', detail: `Cuestionario asignado a ${area?.label}` });
  }

  verAsignaciones(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.vistaActual.set('asignar');
  }

  getAsignacionesCuestionario(cuestionarioId: string) {
    return this.asignaciones().filter(a => a.cuestionarioId === cuestionarioId);
  }

  // =============================================
  // MÉTODOS - RESPONDER CUESTIONARIO
  // =============================================
  responderCuestionario(asignacion: AsignacionCuestionario) {
    const cuestionario = this.cuestionarios().find(c => c.id === asignacion.cuestionarioId);
    if (!cuestionario) return;

    this.cuestionarioSeleccionado.set(cuestionario);
    this.asignacionSeleccionada.set(asignacion);

    // Inicializar respuesta si no existe
    const respuesta: RespuestaCuestionario = {
      id: crypto.randomUUID(),
      asignacionId: asignacion.id,
      cuestionarioId: cuestionario.id,
      respondidoPor: asignacion.responsableNombre,
      fechaInicio: new Date(),
      fechaEnvio: null,
      estado: 'borrador',
      respuestas: cuestionario.secciones.flatMap(s => s.preguntas.map(p => ({
        preguntaId: p.id,
        valor: null,
        comentario: '',
        evidencias: [],
        marcadaParaRevision: false,
        estadoRevision: 'pendiente' as const,
        comentarioRevisor: ''
      }))),
      puntuacionTotal: 0,
      nivelCumplimiento: 'deficiente',
      comentariosGenerales: ''
    };

    this.respuestaActual.set(respuesta);
    this.vistaActual.set('responder');
  }

  guardarRespuestaBorrador() {
    const respuesta = this.respuestaActual();
    const asignacion = this.asignacionSeleccionada();
    if (!respuesta || !asignacion) return;

    // Calcular progreso
    const totalPreguntas = respuesta.respuestas.length;
    const preguntasRespondidas = respuesta.respuestas.filter(r => r.valor !== null && r.valor !== '').length;
    const progreso = Math.round((preguntasRespondidas / totalPreguntas) * 100);

    asignacion.progreso = progreso;
    asignacion.estado = progreso > 0 ? 'en_progreso' : 'pendiente';

    this.asignaciones.update(lista =>
      lista.map(a => a.id === asignacion.id ? asignacion : a)
    );

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Borrador guardado exitosamente' });
  }

  enviarRespuesta() {
    const respuesta = this.respuestaActual();
    const asignacion = this.asignacionSeleccionada();
    const cuestionario = this.cuestionarioSeleccionado();
    if (!respuesta || !asignacion || !cuestionario) return;

    // Validar preguntas requeridas
    const preguntasRequeridas = cuestionario.secciones.flatMap(s =>
      s.preguntas.filter(p => p.requerida).map(p => p.id)
    );

    const respuestasVacias = respuesta.respuestas.filter(r =>
      preguntasRequeridas.includes(r.preguntaId) && (r.valor === null || r.valor === '')
    );

    if (respuestasVacias.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Hay ${respuestasVacias.length} preguntas requeridas sin responder`
      });
      return;
    }

    // Actualizar estado
    respuesta.estado = 'enviado';
    respuesta.fechaEnvio = new Date();
    asignacion.estado = 'completado';
    asignacion.progreso = 100;

    this.asignaciones.update(lista =>
      lista.map(a => a.id === asignacion.id ? asignacion : a)
    );

    // Incrementar contador de respuestas del cuestionario
    this.cuestionarios.update(lista =>
      lista.map(c => c.id === cuestionario.id ? { ...c, respuestas: c.respuestas + 1 } : c)
    );

    this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Cuestionario enviado para revisión' });
    this.volverALista();
  }

  getRespuestaPregunta(preguntaId: string): RespuestaPregunta | undefined {
    return this.respuestaActual()?.respuestas.find(r => r.preguntaId === preguntaId);
  }

  actualizarRespuesta(preguntaId: string, valor: any) {
    const respuesta = this.respuestaActual();
    if (!respuesta) return;

    const idx = respuesta.respuestas.findIndex(r => r.preguntaId === preguntaId);
    if (idx >= 0) {
      respuesta.respuestas[idx].valor = valor;
      this.respuestaActual.set({ ...respuesta });
    }
  }

  // =============================================
  // MÉTODOS - REVISAR CUESTIONARIO
  // =============================================
  revisarCuestionario(asignacion: AsignacionCuestionario) {
    const cuestionario = this.cuestionarios().find(c => c.id === asignacion.cuestionarioId);
    if (!cuestionario) return;

    this.cuestionarioSeleccionado.set(cuestionario);
    this.asignacionSeleccionada.set(asignacion);
    this.vistaActual.set('revisar');
  }

  aprobarRespuesta(preguntaId: string) {
    const respuesta = this.respuestaActual();
    if (!respuesta) return;

    const idx = respuesta.respuestas.findIndex(r => r.preguntaId === preguntaId);
    if (idx >= 0) {
      respuesta.respuestas[idx].estadoRevision = 'aprobada';
      this.respuestaActual.set({ ...respuesta });
    }
  }

  rechazarRespuesta(preguntaId: string) {
    const respuesta = this.respuestaActual();
    if (!respuesta) return;

    const idx = respuesta.respuestas.findIndex(r => r.preguntaId === preguntaId);
    if (idx >= 0) {
      respuesta.respuestas[idx].estadoRevision = 'rechazada';
      this.respuestaActual.set({ ...respuesta });
    }
  }

  aprobarCuestionario() {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    asignacion.estado = 'revisado';
    this.asignaciones.update(lista =>
      lista.map(a => a.id === asignacion.id ? asignacion : a)
    );

    this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Cuestionario aprobado exitosamente' });
    this.volverALista();
  }

  // =============================================
  // MÉTODOS - MARCOS NORMATIVOS
  // =============================================
  abrirMarcoDialog() {
    this.nuevoMarco.set({
      nombre: '',
      acronimo: '',
      version: '',
      descripcion: '',
      requisitos: [],
      activo: true
    });
    this.showMarcoDialog.set(true);
  }

  crearMarco() {
    const nuevo = this.nuevoMarco();
    if (!nuevo.nombre || !nuevo.acronimo) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos requeridos' });
      return;
    }

    const marco: MarcoNormativo = {
      id: crypto.randomUUID(),
      nombre: nuevo.nombre,
      acronimo: nuevo.acronimo,
      version: nuevo.version || '1.0',
      fechaVigencia: new Date(),
      descripcion: nuevo.descripcion || '',
      requisitos: [],
      activo: true
    };

    this.marcosNormativos.update(lista => [...lista, marco]);
    this.showMarcoDialog.set(false);
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Marco normativo creado exitosamente' });
  }

  editarMarco(marco: MarcoNormativo) {
    this.marcoSeleccionado.set({ ...marco });
    // Aquí se podría abrir un dialog de edición
  }

  // =============================================
  // MÉTODOS - HALLAZGOS
  // =============================================
  abrirHallazgoDialog() {
    this.nuevoHallazgo.set({
      tipo: 'observacion',
      descripcion: '',
      accionCorrectiva: '',
      responsable: '',
      estado: 'abierto'
    });
    this.showHallazgoDialog.set(true);
  }

  crearHallazgo() {
    const nuevo = this.nuevoHallazgo();
    if (!nuevo.descripcion) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'La descripción es requerida' });
      return;
    }

    const hallazgo: Hallazgo = {
      id: crypto.randomUUID(),
      tipo: nuevo.tipo || 'observacion',
      descripcion: nuevo.descripcion,
      preguntaId: '',
      requisitoNormativo: '',
      accionCorrectiva: nuevo.accionCorrectiva || '',
      responsable: nuevo.responsable || '',
      fechaLimite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      estado: 'abierto'
    };

    this.hallazgos.update(lista => [...lista, hallazgo]);
    this.showHallazgoDialog.set(false);
    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Hallazgo registrado exitosamente' });
  }

  // =============================================
  // MÉTODOS - ALERTAS
  // =============================================
  atenderAlerta(alerta: AlertaCumplimiento) {
    alerta.estado = 'atendida';
    this.alertas.update(lista =>
      lista.map(a => a.id === alerta.id ? alerta : a)
    );
    this.messageService.add({ severity: 'success', summary: 'Atendida', detail: 'Alerta marcada como atendida' });
  }

  // =============================================
  // DATOS PARA GRÁFICOS
  // =============================================
  chartData = computed(() => ({
    labels: this.cumplimientoPorMarco().map(c => c.marco),
    datasets: [
      {
        label: 'Cumplimiento %',
        data: this.cumplimientoPorMarco().map(c => c.cumplimiento),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }
    ]
  }));

  chartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  pieChartData = computed(() => ({
    labels: ['Completados', 'En Progreso', 'Pendientes', 'Vencidos'],
    datasets: [
      {
        data: [
          this.asignaciones().filter(a => a.estado === 'completado').length,
          this.asignaciones().filter(a => a.estado === 'en_progreso').length,
          this.asignaciones().filter(a => a.estado === 'pendiente').length,
          this.asignaciones().filter(a => a.estado === 'vencido').length
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
      }
    ]
  }));

  pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  // =============================================
  // MÉTODOS DE REPORTES (CU-06)
  // =============================================
  irAReportes() {
    this.vistaActual.set('reportes');
  }

  generarReporte() {
    const nuevo = this.nuevoReporte();
    if (!nuevo.nombre || !nuevo.marcoNormativo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    this.reporteEnGeneracion.set(true);

    // Simular generación
    setTimeout(() => {
      const reporte: ReporteCumplimiento = {
        id: crypto.randomUUID(),
        nombre: nuevo.nombre!,
        tipo: nuevo.tipo as ReporteCumplimiento['tipo'],
        formato: nuevo.formato as ReporteCumplimiento['formato'],
        marcoNormativo: nuevo.marcoNormativo!,
        periodo: nuevo.periodo!,
        fechaGeneracion: new Date(),
        generadoPor: 'Usuario Actual',
        contenido: {
          cumplimientoGeneral: Math.floor(Math.random() * 30) + 70,
          totalPreguntas: Math.floor(Math.random() * 100) + 50,
          preguntasRespondidas: Math.floor(Math.random() * 100) + 40,
          hallazgos: Math.floor(Math.random() * 10),
          evidenciasPendientes: Math.floor(Math.random() * 5),
          areasEvaluadas: ['TI', 'Finanzas', 'Operaciones']
        },
        estado: 'completado',
        urlDescarga: `/reportes/${nuevo.nombre?.replace(/\s/g, '_')}.${nuevo.formato}`
      };

      this.reportes.update(reportes => [...reportes, reporte]);
      this.reporteEnGeneracion.set(false);
      this.nuevoReporte.set({
        nombre: '',
        tipo: 'ejecutivo',
        formato: 'pdf',
        marcoNormativo: '',
        periodo: { inicio: new Date(), fin: new Date() }
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Reporte Generado',
        detail: `El reporte "${reporte.nombre}" ha sido generado exitosamente`
      });
    }, 3000);
  }

  descargarReporte(reporte: ReporteCumplimiento) {
    // Simular descarga
    this.messageService.add({
      severity: 'info',
      summary: 'Descarga iniciada',
      detail: `Descargando ${reporte.nombre}.${reporte.formato}`
    });

    // Registrar en historial
    this.registrarEnHistorial('exportacion', 'reporte', reporte.id, reporte.nombre, `Se descargó reporte en formato ${reporte.formato.toUpperCase()}`);
  }

  eliminarReporte(reporte: ReporteCumplimiento) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el reporte "${reporte.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reportes.update(reportes => reportes.filter(r => r.id !== reporte.id));
        this.messageService.add({
          severity: 'success',
          summary: 'Reporte Eliminado',
          detail: 'El reporte ha sido eliminado'
        });
      }
    });
  }

  getTipoReporteLabel(tipo: ReporteCumplimiento['tipo']): string {
    const labels: Record<ReporteCumplimiento['tipo'], string> = {
      'ejecutivo': 'Ejecutivo',
      'detallado': 'Detallado',
      'hallazgos': 'Hallazgos',
      'tendencias': 'Tendencias',
      'comparativo': 'Comparativo'
    };
    return labels[tipo];
  }

  getFormatoIcon(formato: ReporteCumplimiento['formato']): string {
    const icons: Record<ReporteCumplimiento['formato'], string> = {
      'pdf': 'pi pi-file-pdf',
      'excel': 'pi pi-file-excel',
      'word': 'pi pi-file-word'
    };
    return icons[formato];
  }

  // =============================================
  // MÉTODOS DE HISTORIAL (CU-12)
  // =============================================
  irAHistorial() {
    this.vistaActual.set('historial');
  }

  registrarEnHistorial(
    accion: HistorialAuditoria['accion'],
    entidadTipo: HistorialAuditoria['entidadTipo'],
    entidadId: string,
    entidadNombre: string,
    detalles: string
  ) {
    const registro: HistorialAuditoria = {
      id: crypto.randomUUID(),
      fecha: new Date(),
      accion,
      entidadTipo,
      entidadId,
      entidadNombre,
      usuario: 'Usuario Actual',
      detalles,
      ipAddress: '192.168.1.100'
    };
    this.historialAuditoria.update(historial => [registro, ...historial]);
  }

  historialFiltrado = computed(() => {
    let resultado = this.historialAuditoria();

    if (this.filtroHistorialAccion()) {
      resultado = resultado.filter(h => h.accion === this.filtroHistorialAccion());
    }

    if (this.filtroHistorialEntidad()) {
      resultado = resultado.filter(h => h.entidadTipo === this.filtroHistorialEntidad());
    }

    if (this.filtroHistorialFechaInicio()) {
      resultado = resultado.filter(h => h.fecha >= this.filtroHistorialFechaInicio()!);
    }

    if (this.filtroHistorialFechaFin()) {
      resultado = resultado.filter(h => h.fecha <= this.filtroHistorialFechaFin()!);
    }

    return resultado;
  });

  getAccionLabel(accion: HistorialAuditoria['accion']): string {
    const labels: Record<HistorialAuditoria['accion'], string> = {
      'creacion': 'Creación',
      'modificacion': 'Modificación',
      'eliminacion': 'Eliminación',
      'asignacion': 'Asignación',
      'respuesta': 'Respuesta',
      'validacion': 'Validación',
      'exportacion': 'Exportación'
    };
    return labels[accion];
  }

  getAccionSeverity(accion: HistorialAuditoria['accion']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<HistorialAuditoria['accion'], 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'creacion': 'success',
      'modificacion': 'info',
      'eliminacion': 'danger',
      'asignacion': 'warn',
      'respuesta': 'secondary',
      'validacion': 'success',
      'exportacion': 'info'
    };
    return severities[accion];
  }

  // =============================================
  // MÉTODOS DE MAPEO DE CONTROLES (CU-08)
  // =============================================
  irAMapeo() {
    this.vistaActual.set('mapeo');
  }

  getEstadoImplementacionLabel(estado: MapeoControl['estadoImplementacion']): string {
    const labels: Record<MapeoControl['estadoImplementacion'], string> = {
      'implementado': 'Implementado',
      'parcial': 'Parcial',
      'no_implementado': 'No Implementado',
      'no_aplica': 'No Aplica'
    };
    return labels[estado];
  }

  getEstadoImplementacionSeverity(estado: MapeoControl['estadoImplementacion']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<MapeoControl['estadoImplementacion'], 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'implementado': 'success',
      'parcial': 'warn',
      'no_implementado': 'danger',
      'no_aplica': 'secondary'
    };
    return severities[estado];
  }

  getTipoControlLabel(tipo: MapeoControl['tipoControl']): string {
    const labels: Record<MapeoControl['tipoControl'], string> = {
      'preventivo': 'Preventivo',
      'detectivo': 'Detectivo',
      'correctivo': 'Correctivo'
    };
    return labels[tipo];
  }

  getTipoControlSeverity(tipo: MapeoControl['tipoControl']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<MapeoControl['tipoControl'], 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'preventivo': 'success',
      'detectivo': 'info',
      'correctivo': 'warn'
    };
    return severities[tipo];
  }

  getEfectividadClass(efectividad: number): string {
    if (efectividad >= 90) return 'text-green-600';
    if (efectividad >= 70) return 'text-yellow-600';
    return 'text-red-600';
  }

  totalControlesImplementados = computed(() =>
    this.mapeoControles().filter(m => m.estadoImplementacion === 'implementado').length
  );

  totalControlesParciales = computed(() =>
    this.mapeoControles().filter(m => m.estadoImplementacion === 'parcial').length
  );

  promedioEfectividad = computed(() => {
    const controles = this.mapeoControles().filter(m => m.estadoImplementacion !== 'no_aplica');
    if (controles.length === 0) return 0;
    return Math.round(controles.reduce((sum, m) => sum + m.efectividad, 0) / controles.length);
  });

  // =============================================
  // OPCIONES PARA SELECT DE REPORTES
  // =============================================
  tiposReporte = [
    { label: 'Ejecutivo', value: 'ejecutivo' },
    { label: 'Detallado', value: 'detallado' },
    { label: 'Hallazgos', value: 'hallazgos' },
    { label: 'Tendencias', value: 'tendencias' },
    { label: 'Comparativo', value: 'comparativo' }
  ];

  formatosReporte = [
    { label: 'PDF', value: 'pdf' },
    { label: 'Excel', value: 'excel' },
    { label: 'Word', value: 'word' }
  ];

  accionesHistorial = [
    { label: 'Creación', value: 'creacion' },
    { label: 'Modificación', value: 'modificacion' },
    { label: 'Eliminación', value: 'eliminacion' },
    { label: 'Asignación', value: 'asignacion' },
    { label: 'Respuesta', value: 'respuesta' },
    { label: 'Validación', value: 'validacion' },
    { label: 'Exportación', value: 'exportacion' }
  ];

  entidadesHistorial = [
    { label: 'Cuestionario', value: 'cuestionario' },
    { label: 'Asignación', value: 'asignacion' },
    { label: 'Respuesta', value: 'respuesta' },
    { label: 'Evidencia', value: 'evidencia' },
    { label: 'Marco Normativo', value: 'marco' },
    { label: 'Reporte', value: 'reporte' }
  ];

  // =============================================
  // MÉTODOS DE EVIDENCIAS (CU-11)
  // =============================================
  irAEvidencias() {
    this.vistaActual.set('evidencias');
  }

  evidenciasFiltradas = computed(() => {
    let resultado = this.evidencias();

    if (this.busquedaEvidencia()) {
      const busquedaLower = this.busquedaEvidencia().toLowerCase();
      resultado = resultado.filter(e =>
        e.nombre.toLowerCase().includes(busquedaLower) ||
        e.descripcion.toLowerCase().includes(busquedaLower)
      );
    }

    if (this.filtroEvidenciaEstado()) {
      resultado = resultado.filter(e => e.estado === this.filtroEvidenciaEstado());
    }

    return resultado;
  });

  totalEvidencias = computed(() => this.evidencias().length);
  evidenciasVigentes = computed(() => this.evidencias().filter(e => e.estado === 'vigente').length);
  evidenciasProximasVencer = computed(() => this.evidencias().filter(e => e.estado === 'proximo_vencer').length);
  evidenciasVencidas = computed(() => this.evidencias().filter(e => e.estado === 'vencida').length);

  getEstadoEvidenciaLabel(estado: Evidencia['estado']): string {
    const labels: Record<Evidencia['estado'], string> = {
      'vigente': 'Vigente',
      'proximo_vencer': 'Próximo a Vencer',
      'vencida': 'Vencida'
    };
    return labels[estado];
  }

  getEstadoEvidenciaSeverity(estado: Evidencia['estado']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<Evidencia['estado'], 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      'vigente': 'success',
      'proximo_vencer': 'warn',
      'vencida': 'danger'
    };
    return severities[estado];
  }

  getTipoArchivoIcon(tipo: string): string {
    if (tipo.includes('pdf')) return 'pi pi-file-pdf';
    if (tipo.includes('spreadsheet') || tipo.includes('excel')) return 'pi pi-file-excel';
    if (tipo.includes('word') || tipo.includes('document')) return 'pi pi-file-word';
    if (tipo.includes('image')) return 'pi pi-image';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  subirEvidencia(event: any) {
    const files = event.files;
    for (const file of files) {
      const nuevaEvidencia: Evidencia = {
        id: crypto.randomUUID(),
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
        fechaCarga: new Date(),
        url: `/evidencias/${file.name}`,
        descripcion: '',
        vigencia: null,
        estado: 'vigente'
      };
      this.evidencias.update(evs => [...evs, nuevaEvidencia]);
      this.registrarEnHistorial('creacion', 'evidencia', nuevaEvidencia.id, nuevaEvidencia.nombre, 'Se cargó nueva evidencia documental');
    }
    this.messageService.add({
      severity: 'success',
      summary: 'Evidencias Cargadas',
      detail: `Se cargaron ${files.length} archivo(s)`
    });
  }

  descargarEvidencia(evidencia: Evidencia) {
    this.messageService.add({
      severity: 'info',
      summary: 'Descarga iniciada',
      detail: `Descargando ${evidencia.nombre}`
    });
  }

  eliminarEvidencia(evidencia: Evidencia) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${evidencia.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evidencias.update(evs => evs.filter(e => e.id !== evidencia.id));
        this.registrarEnHistorial('eliminacion', 'evidencia', evidencia.id, evidencia.nombre, 'Se eliminó evidencia documental');
        this.messageService.add({
          severity: 'success',
          summary: 'Evidencia Eliminada',
          detail: 'El archivo ha sido eliminado'
        });
      }
    });
  }

  estadosEvidencia = [
    { label: 'Vigente', value: 'vigente' },
    { label: 'Próximo a Vencer', value: 'proximo_vencer' },
    { label: 'Vencida', value: 'vencida' }
  ];

  // =============================================
  // MÉTODOS CU-13: VALIDAR CONTROLES DESDE CUESTIONARIOS
  // =============================================

  /**
   * Valida los controles asociados a un cuestionario completado
   * Evalúa la efectividad basándose en las respuestas del cuestionario
   */
  validarControlesDesdeCuestionario(cuestionarioId: string) {
    const cuestionario = this.cuestionarios().find(c => c.id === cuestionarioId);
    if (!cuestionario) return;

    // Obtener mapeos de controles asociados al cuestionario
    const mapeosRelacionados = this.mapeoControles().filter(m =>
      m.preguntasAsociadas.some(p =>
        cuestionario.secciones.some(s =>
          s.preguntas.some(preg => preg.id === p)
        )
      )
    );

    // Evaluar efectividad basándose en respuestas
    mapeosRelacionados.forEach(mapeo => {
      const nuevaEfectividad = this.calcularEfectividadControl(mapeo, cuestionario);
      const nuevoEstado = this.determinarEstadoControl(nuevaEfectividad);

      // Actualizar control
      this.mapeoControles.update(mapeos =>
        mapeos.map(m => m.id === mapeo.id ? {
          ...m,
          efectividad: nuevaEfectividad,
          estadoImplementacion: nuevoEstado,
          ultimaEvaluacion: new Date()
        } : m)
      );

      // Si el control es inefectivo, generar hallazgo y acción correctiva
      if (nuevaEfectividad < 70) {
        this.generarHallazgoControl(mapeo, nuevaEfectividad);
        this.generarAccionCorrectivaAutomatica(mapeo, nuevaEfectividad);
      }
    });

    this.registrarEnHistorial(
      'validacion',
      'cuestionario',
      cuestionarioId,
      cuestionario.nombre,
      `Se validaron ${mapeosRelacionados.length} controles asociados`
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Validación Completada',
      detail: `Se validaron ${mapeosRelacionados.length} controles`
    });
  }

  private calcularEfectividadControl(mapeo: MapeoControl, cuestionario: Cuestionario): number {
    // Simulación: en producción, esto evaluaría respuestas reales
    const baseEfectividad = mapeo.efectividad;
    const variacion = Math.floor(Math.random() * 10) - 5;
    return Math.min(100, Math.max(0, baseEfectividad + variacion));
  }

  private determinarEstadoControl(efectividad: number): MapeoControl['estadoImplementacion'] {
    if (efectividad >= 90) return 'implementado';
    if (efectividad >= 70) return 'parcial';
    return 'no_implementado';
  }

  private generarHallazgoControl(mapeo: MapeoControl, efectividad: number) {
    const nuevaAlerta: AlertaCumplimiento = {
      id: crypto.randomUUID(),
      titulo: `Control Inefectivo: ${mapeo.controlNombre}`,
      descripcion: `El control "${mapeo.controlNombre}" muestra una efectividad del ${efectividad}%, por debajo del umbral mínimo del 70%`,
      severidad: efectividad < 50 ? 'critica' : 'alta',
      tipo: 'control_sin_validar',
      entidadTipo: 'control',
      entidadId: mapeo.controlId,
      marcoNormativo: mapeo.marcoNormativo,
      fechaGeneracion: new Date(),
      estado: 'activa'
    };
    this.alertas.update(alertas => [...alertas, nuevaAlerta]);
  }

  // =============================================
  // MÉTODOS CU-14: DETECTAR CONTROLES FALTANTES
  // =============================================

  /**
   * Analiza requisitos normativos y detecta controles faltantes
   */
  detectarControlesFaltantes() {
    const requisitosEvaluados = this.marcosNormativos().flatMap(m => m.requisitos);
    const requisitosConControl = new Set(this.mapeoControles().map(m => m.requisitoNormativoId));

    const requisitosSinControl = requisitosEvaluados.filter(r =>
      !requisitosConControl.has(r.id)
    );

    // Generar recomendaciones para requisitos sin control
    requisitosSinControl.forEach(requisito => {
      const yaDetectado = this.controlesFaltantes().some(cf =>
        cf.requisitoNormativoId === requisito.id
      );

      if (!yaDetectado) {
        const marco = this.marcosNormativos().find(m => m.id === requisito.marcoId);
        const nuevoControlFaltante: ControlFaltante = {
          id: crypto.randomUUID(),
          requisitoNormativoId: requisito.id,
          requisitoNormativoCodigo: requisito.codigo,
          requisitoNormativoNombre: requisito.nombre,
          marcoNormativo: marco?.nombre || 'Desconocido',
          riesgoAsociado: `Incumplimiento del requisito ${requisito.codigo}`,
          prioridadImplementacion: 'alta',
          controlSugerido: this.sugerirControl(requisito),
          descripcionControl: `Control recomendado para cumplir con ${requisito.nombre}`,
          referenciaControlesSimilares: this.buscarControlesSimilares(requisito),
          fechaDeteccion: new Date(),
          estado: 'pendiente',
          responsableSugerido: 'Administrador de Cumplimiento'
        };
        this.controlesFaltantes.update(cf => [...cf, nuevoControlFaltante]);
      }
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Análisis Completado',
      detail: `Se identificaron ${this.controlesFaltantes().filter(c => c.estado === 'pendiente').length} controles faltantes`
    });
  }

  private sugerirControl(requisito: RequisitoNormativo): string {
    // En producción, esto usaría IA para sugerir controles apropiados
    return `Control para ${requisito.nombre}`;
  }

  private buscarControlesSimilares(requisito: RequisitoNormativo): string[] {
    // Buscar controles similares en otros marcos
    return this.mapeoControles()
      .filter(m => m.requisitoNormativoNombre.toLowerCase().includes(
        requisito.nombre.toLowerCase().split(' ')[0]
      ))
      .map(m => m.controlNombre)
      .slice(0, 3);
  }

  totalControlesFaltantes = computed(() => this.controlesFaltantes().length);
  controlesFaltantesCriticos = computed(() =>
    this.controlesFaltantes().filter(c => c.prioridadImplementacion === 'critica').length
  );
  controlesFaltantesPendientes = computed(() =>
    this.controlesFaltantes().filter(c => c.estado === 'pendiente').length
  );

  getPrioridadControlLabel(prioridad: ControlFaltante['prioridadImplementacion']): string {
    const labels: Record<ControlFaltante['prioridadImplementacion'], string> = {
      'critica': 'Crítica',
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    };
    return labels[prioridad];
  }

  getPrioridadControlSeverity(prioridad: ControlFaltante['prioridadImplementacion']): 'danger' | 'warn' | 'info' | 'secondary' {
    const severities: Record<ControlFaltante['prioridadImplementacion'], 'danger' | 'warn' | 'info' | 'secondary'> = {
      'critica': 'danger',
      'alta': 'warn',
      'media': 'info',
      'baja': 'secondary'
    };
    return severities[prioridad];
  }

  getEstadoControlFaltanteLabel(estado: ControlFaltante['estado']): string {
    const labels: Record<ControlFaltante['estado'], string> = {
      'pendiente': 'Pendiente',
      'en_evaluacion': 'En Evaluación',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado'
    };
    return labels[estado];
  }

  getEstadoControlFaltanteSeverity(estado: ControlFaltante['estado']): 'warn' | 'info' | 'success' | 'danger' {
    const severities: Record<ControlFaltante['estado'], 'warn' | 'info' | 'success' | 'danger'> = {
      'pendiente': 'warn',
      'en_evaluacion': 'info',
      'aceptado': 'success',
      'rechazado': 'danger'
    };
    return severities[estado];
  }

  aceptarControlFaltante(control: ControlFaltante) {
    this.controlesFaltantes.update(cf =>
      cf.map(c => c.id === control.id ? { ...c, estado: 'aceptado' as const } : c)
    );
    this.generarAccionCorrectivaDesdeControlFaltante(control);
    this.messageService.add({
      severity: 'success',
      summary: 'Control Aceptado',
      detail: 'Se ha generado una acción correctiva para implementar el control'
    });
  }

  rechazarControlFaltante(control: ControlFaltante) {
    this.confirmationService.confirm({
      message: '¿Está seguro de rechazar esta recomendación? Debe proporcionar una justificación.',
      header: 'Confirmar Rechazo',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.controlesFaltantes.update(cf =>
          cf.map(c => c.id === control.id ? { ...c, estado: 'rechazado' as const } : c)
        );
        this.registrarEnHistorial(
          'modificacion',
          'cuestionario',
          control.id,
          control.controlSugerido,
          `Control faltante rechazado: ${control.requisitoNormativoCodigo}`
        );
        this.messageService.add({
          severity: 'info',
          summary: 'Recomendación Rechazada',
          detail: 'La recomendación ha sido rechazada'
        });
      }
    });
  }

  // =============================================
  // MÉTODOS CU-15: RECOMENDAR ACCIONES CORRECTIVAS
  // =============================================

  private generarAccionCorrectivaAutomatica(mapeo: MapeoControl, efectividad: number) {
    const nuevaAccion: AccionCorrectiva = {
      id: crypto.randomUUID(),
      titulo: `Remediar Control: ${mapeo.controlNombre}`,
      descripcion: `El control "${mapeo.controlNombre}" requiere mejoras para alcanzar el nivel de efectividad mínimo. Efectividad actual: ${efectividad}%`,
      tipoAccion: efectividad < 50 ? 'inmediata' : 'corto_plazo',
      prioridad: efectividad < 50 ? 'critica' : 'alta',
      hallazgoOrigen: `Validación de Control - ${mapeo.requisitoNormativoCodigo}`,
      controlAfectado: mapeo.controlNombre,
      marcoNormativo: mapeo.marcoNormativo,
      responsable: mapeo.responsable,
      fechaCreacion: new Date(),
      fechaVencimiento: new Date(Date.now() + (efectividad < 50 ? 30 : 60) * 24 * 60 * 60 * 1000),
      fechaCompletado: null,
      estado: 'pendiente',
      recursosRequeridos: 'Por definir durante la evaluación',
      resultadoEsperado: `Efectividad del control >= 70%`,
      metricasVerificacion: 'Porcentaje de efectividad del control',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    };
    this.accionesCorrectivas.update(ac => [...ac, nuevaAccion]);
  }

  private generarAccionCorrectivaDesdeControlFaltante(control: ControlFaltante) {
    const nuevaAccion: AccionCorrectiva = {
      id: crypto.randomUUID(),
      titulo: `Implementar: ${control.controlSugerido}`,
      descripcion: control.descripcionControl,
      tipoAccion: control.prioridadImplementacion === 'critica' ? 'inmediata' : 'corto_plazo',
      prioridad: control.prioridadImplementacion === 'baja' ? 'media' : control.prioridadImplementacion as 'critica' | 'alta' | 'media',
      hallazgoOrigen: `Control Faltante - ${control.requisitoNormativoCodigo}`,
      controlAfectado: control.controlSugerido,
      marcoNormativo: control.marcoNormativo,
      responsable: control.responsableSugerido,
      fechaCreacion: new Date(),
      fechaVencimiento: new Date(Date.now() + (control.prioridadImplementacion === 'critica' ? 30 : 90) * 24 * 60 * 60 * 1000),
      fechaCompletado: null,
      estado: 'pendiente',
      recursosRequeridos: 'Por definir',
      resultadoEsperado: `Control ${control.controlSugerido} implementado y operativo`,
      metricasVerificacion: 'Implementación verificada, evidencia documental disponible',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    };
    this.accionesCorrectivas.update(ac => [...ac, nuevaAccion]);
  }

  // Computed properties para acciones correctivas
  totalAccionesCorrectivas = computed(() => this.accionesCorrectivas().length);
  accionesCorrectivasPendientes = computed(() =>
    this.accionesCorrectivas().filter(a => a.estado === 'pendiente').length
  );
  accionesCorrectivasEnProgreso = computed(() =>
    this.accionesCorrectivas().filter(a => a.estado === 'en_progreso').length
  );
  accionesCorrectivasVencidas = computed(() =>
    this.accionesCorrectivas().filter(a => a.estado === 'vencida').length
  );
  accionesCorrectivasCompletadas = computed(() =>
    this.accionesCorrectivas().filter(a => a.estado === 'completada').length
  );

  getTipoAccionLabel(tipo: AccionCorrectiva['tipoAccion']): string {
    const labels: Record<AccionCorrectiva['tipoAccion'], string> = {
      'inmediata': 'Inmediata',
      'corto_plazo': 'Corto Plazo',
      'mediano_plazo': 'Mediano Plazo'
    };
    return labels[tipo];
  }

  getTipoAccionSeverity(tipo: AccionCorrectiva['tipoAccion']): 'danger' | 'warn' | 'info' {
    const severities: Record<AccionCorrectiva['tipoAccion'], 'danger' | 'warn' | 'info'> = {
      'inmediata': 'danger',
      'corto_plazo': 'warn',
      'mediano_plazo': 'info'
    };
    return severities[tipo];
  }

  getEstadoAccionLabel(estado: AccionCorrectiva['estado']): string {
    const labels: Record<AccionCorrectiva['estado'], string> = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada',
      'vencida': 'Vencida',
      'cancelada': 'Cancelada'
    };
    return labels[estado];
  }

  getEstadoAccionSeverity(estado: AccionCorrectiva['estado']): 'warn' | 'info' | 'success' | 'danger' | 'secondary' {
    const severities: Record<AccionCorrectiva['estado'], 'warn' | 'info' | 'success' | 'danger' | 'secondary'> = {
      'pendiente': 'warn',
      'en_progreso': 'info',
      'completada': 'success',
      'vencida': 'danger',
      'cancelada': 'secondary'
    };
    return severities[estado];
  }

  iniciarAccionCorrectiva(accion: AccionCorrectiva) {
    this.accionesCorrectivas.update(ac =>
      ac.map(a => a.id === accion.id ? { ...a, estado: 'en_progreso' as const } : a)
    );
    this.registrarEnHistorial(
      'modificacion',
      'cuestionario',
      accion.id,
      accion.titulo,
      'Se inició trabajo en acción correctiva'
    );
    this.messageService.add({
      severity: 'info',
      summary: 'Acción Iniciada',
      detail: `Se ha iniciado "${accion.titulo}"`
    });
  }

  completarAccionCorrectiva(accion: AccionCorrectiva) {
    this.confirmationService.confirm({
      message: '¿Ha adjuntado evidencia de la implementación?',
      header: 'Confirmar Completado',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.accionesCorrectivas.update(ac =>
          ac.map(a => a.id === accion.id ? {
            ...a,
            estado: 'completada' as const,
            fechaCompletado: new Date()
          } : a)
        );
        this.registrarEnHistorial(
          'validacion',
          'cuestionario',
          accion.id,
          accion.titulo,
          'Se completó la acción correctiva'
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Acción Completada',
          detail: 'La acción correctiva ha sido completada'
        });
      }
    });
  }

  verificarEfectividadAccion(accion: AccionCorrectiva) {
    this.accionesCorrectivas.update(ac =>
      ac.map(a => a.id === accion.id ? { ...a, efectividadVerificada: true } : a)
    );
    this.messageService.add({
      severity: 'success',
      summary: 'Efectividad Verificada',
      detail: 'La efectividad de la acción correctiva ha sido verificada'
    });
  }
}
