import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { TabsModule } from 'primeng/tabs';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { DatePickerModule } from 'primeng/datepicker';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';
import { FieldsetModule } from 'primeng/fieldset';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FileUploadModule } from 'primeng/fileupload';
import { MultiSelectModule } from 'primeng/multiselect';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { ChartModule } from 'primeng/chart';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { StepperModule } from 'primeng/stepper';

// Shared Models
import {
  MarcoNormativo,
  Cuestionario,
  Seccion,
  Pregunta,
  AsignacionCuestionario,
  RespuestaCuestionario,
  RespuestaPregunta,
  Evidencia,
  AlertaCumplimiento,
  ReporteCumplimiento,
  HistorialAuditoria,
  MapeoControl,
  ControlFaltante,
  AccionCorrectiva,
  EvaluadoExterno,
  MensajeChat
} from '../../models/cuestionarios.models';

type VistasCumplimiento = 'dashboard' | 'asignar' | 'responder' | 'revisar' | 'marcos' | 'reportes' | 'historial' | 'mapeo' | 'evidencias' | 'portal-externo';

@Component({
  selector: 'app-cumplimiento',
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
    CheckboxModule,
    RadioButtonModule,
    InputNumberModule,
    SliderModule,
    RatingModule,
    DatePickerModule,
    PanelModule,
    DividerModule,
    AccordionModule,
    FieldsetModule,
    ToggleSwitchModule,
    FileUploadModule,
    MultiSelectModule,
    AvatarModule,
    TimelineModule,
    ChartModule,
    InputGroupModule,
    InputGroupAddonModule,
    StepperModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cumplimiento.html',
  styleUrl: './cumplimiento.scss'
})
export class CumplimientoComponent {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // =============================================
  // ESTADO DE LA VISTA
  // =============================================
  vistaActual = signal<VistasCumplimiento>('dashboard');

  // =============================================
  // FILTROS
  // =============================================
  busqueda = signal('');
  filtroEstado = signal<string | null>(null);
  filtroMarco = signal<string | null>(null);

  // =============================================
  // DIALOGS
  // =============================================
  showAsignarDialog = signal(false);
  showMarcoDialog = signal(false);
  modoEdicionAsignacion = signal(false);
  asignacionEditandoId = signal<string | null>(null);
  pasoAsignacion = signal(0); // 0: Tipo, 1: Info, 2: Asignados, 3: Config

  // =============================================
  // SELECCIONES
  // =============================================
  cuestionarioSeleccionado = signal<Cuestionario | null>(null);
  asignacionSeleccionada = signal<AsignacionCuestionario | null>(null);
  respuestaActual = signal<RespuestaCuestionario | null>(null);

  // =============================================
  // NUEVA ASIGNACION
  // =============================================
  nuevaAsignacion = signal<Partial<AsignacionCuestionario>>({
    titulo: '',
    tipoRevision: 'interna',
    cuestionarioIds: [],
    usuariosAsignados: [],
    emailsExternos: [],
    activosObjetivo: [],
    procesosObjetivo: [],
    aprobadores: [],
    evaluadosInternos: [],
    evaluadosExternos: [],
    responsableId: '',
    fechaInicio: new Date(),
    fechaVencimiento: new Date(),
    instrucciones: '',
    recordatorios: true,
    recurrencia: {
      habilitada: false,
      frecuencia: 'mensual',
      intervalo: 1
    }
  });

  // Estado para evaluado externo temporal
  nuevoEvaluadoExterno = signal<Partial<EvaluadoExterno>>({
    nombre: '',
    email: ''
  });

  // Tipo de alcance seleccionado para la evaluación (activos u objetivos/procesos)
  tipoAlcanceSeleccionado = signal<'activos' | 'objetivos'>('activos');

  // Portal externo
  loginExterno = signal<{ email: string; password: string }>({ email: '', password: '' });
  usuarioExternoAutenticado = signal<EvaluadoExterno | null>(null);

  // =============================================
  // REVISION DE RESPUESTAS
  // =============================================
  respuestaRevision = signal<RespuestaCuestionario | null>(null);
  showDialogRechazo = signal(false);
  showDialogAccionMasiva = signal(false);
  preguntaRechazoId = signal<string | null>(null);
  comentarioRechazo = signal<string>('');
  comentarioAccionMasiva = signal<string>('');
  comentarioGeneralRevisor = signal<string>('');
  accionMasivaAprobacion = signal(true); // true = aprobar, false = rechazar

  // Sidebar de revision - cuestionarios y activos/procesos
  cuestionarioRevisionSeleccionadoId = signal<string | null>(null);
  activoProcesoSeleccionadoId = signal<string | null>(null);

  // Chat sidebar
  showChatSidebar = signal(false);
  mensajeChat = signal('');
  mensajesChat = signal<MensajeChat[]>([]);

  // Usuarios del chat (evaluadores y aprobadores)
  usuarioActual = signal({ id: 'current', nombre: 'Usuario Actual', rol: 'evaluador' as 'evaluador' | 'aprobador' });

  // Computed: lista de cuestionarios en la revision actual
  cuestionariosEnRevision = computed(() => {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return [];

    const ids = asignacion.cuestionarioIds?.length
      ? asignacion.cuestionarioIds
      : asignacion.cuestionarioId
        ? [asignacion.cuestionarioId]
        : [];

    return ids.map(id => this.cuestionarios().find(c => c.id === id)).filter(c => c !== undefined);
  });

  // Computed: lista de activos o procesos siendo evaluados en la revision actual
  activosProcesosEnRevision = computed(() => {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return [];

    const items: { id: string; nombre: string; tipo: 'activo' | 'proceso'; progreso: number; estado: string }[] = [];

    // Activos objetivo
    asignacion.activosObjetivo?.forEach((activoId, idx) => {
      const nombre = asignacion.activosObjetivoNombres?.[idx] || 'Activo ' + (idx + 1);
      const respuesta = this.respuestasCuestionarios().find(
        r => r.asignacionId === asignacion.id && (r as any).activoProcesoId === activoId
      );
      items.push({
        id: activoId,
        nombre: nombre,
        tipo: 'activo',
        progreso: respuesta ? this.calcularProgresoRespuesta(respuesta) : 0,
        estado: respuesta?.estado || 'pendiente'
      });
    });

    // Procesos objetivo
    asignacion.procesosObjetivo?.forEach((procesoId, idx) => {
      const nombre = asignacion.procesosObjetivoNombres?.[idx] || 'Proceso ' + (idx + 1);
      const respuesta = this.respuestasCuestionarios().find(
        r => r.asignacionId === asignacion.id && (r as any).activoProcesoId === procesoId
      );
      items.push({
        id: procesoId,
        nombre: nombre,
        tipo: 'proceso',
        progreso: respuesta ? this.calcularProgresoRespuesta(respuesta) : 0,
        estado: respuesta?.estado || 'pendiente'
      });
    });

    return items;
  });

  // Computed: participantes del chat (evaluadores y aprobadores)
  participantesChat = computed(() => {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return [];

    const participantes: { id: string; nombre: string; rol: 'evaluador' | 'aprobador' }[] = [];

    // Evaluadores (personas que realizan la evaluacion)
    asignacion.usuariosAsignados?.forEach((userId, idx) => {
      participantes.push({
        id: userId,
        nombre: asignacion.usuariosAsignadosNombres?.[idx] || 'Evaluador ' + (idx + 1),
        rol: 'evaluador'
      });
    });

    // Aprobadores
    asignacion.aprobadores?.forEach((aprobadorId, idx) => {
      participantes.push({
        id: aprobadorId,
        nombre: asignacion.aprobadoresNombres?.[idx] || 'Aprobador ' + (idx + 1),
        rol: 'aprobador'
      });
    });

    return participantes;
  });

  // Cuestionario seleccionado en sidebar
  cuestionarioRevisionSeleccionado = computed(() => {
    const id = this.cuestionarioRevisionSeleccionadoId();
    if (!id) return null;
    return this.cuestionarios().find(c => c.id === id) || null;
  });

  // =============================================
  // REPORTES
  // =============================================
  nuevoReporte = signal<Partial<ReporteCumplimiento>>({
    nombre: '',
    tipo: 'ejecutivo',
    formato: 'pdf',
    marcoNormativo: '',
    periodo: { inicio: new Date(), fin: new Date() }
  });
  reporteEnGeneracion = signal(false);

  // =============================================
  // HISTORIAL
  // =============================================
  filtroHistorialAccion = signal<string | null>(null);
  filtroHistorialEntidad = signal<string | null>(null);
  filtroHistorialFechaInicio = signal<Date | null>(null);
  filtroHistorialFechaFin = signal<Date | null>(null);

  // =============================================
  // OPCIONES DE FILTROS Y SELECT
  // =============================================
  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Progreso', value: 'en_progreso' },
    { label: 'Completado', value: 'completado' },
    { label: 'Vencido', value: 'vencido' }
  ];

  tipoRevisionOptions = [
    { label: 'Interna', value: 'interna' },
    { label: 'Externa', value: 'externa' }
  ];

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
    { label: 'Todas', value: null },
    { label: 'Creacion', value: 'creacion' },
    { label: 'Modificacion', value: 'modificacion' },
    { label: 'Eliminacion', value: 'eliminacion' },
    { label: 'Asignacion', value: 'asignacion' },
    { label: 'Respuesta', value: 'respuesta' },
    { label: 'Validacion', value: 'validacion' }
  ];

  entidadesHistorial = [
    { label: 'Todas', value: null },
    { label: 'Cuestionario', value: 'cuestionario' },
    { label: 'Asignacion', value: 'asignacion' },
    { label: 'Respuesta', value: 'respuesta' },
    { label: 'Evidencia', value: 'evidencia' },
    { label: 'Marco', value: 'marco' }
  ];

  frecuenciaOptions = [
    { label: 'Diaria', value: 'diaria' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Anual', value: 'anual' }
  ];

  periodicidadOptions = [
    { label: 'Única', value: 'unica' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Semestral', value: 'semestral' },
    { label: 'Anual', value: 'anual' }
  ];

  usuariosDisponibles = [
    { label: 'Alice Johnson', value: 'user1' },
    { label: 'Bob Smith', value: 'user2' },
    { label: 'Carlos Garcia', value: 'user3' },
    { label: 'Diana Lopez', value: 'user4' },
    { label: 'Eduardo Martinez', value: 'user5' }
  ];

  areasOptions = [
    { label: 'Tecnologia', value: 'tecnologia', nombre: 'Tecnologia' },
    { label: 'Finanzas', value: 'finanzas', nombre: 'Finanzas' },
    { label: 'Operaciones', value: 'operaciones', nombre: 'Operaciones' },
    { label: 'Recursos Humanos', value: 'rrhh', nombre: 'Recursos Humanos' },
    { label: 'Legal', value: 'legal', nombre: 'Legal' }
  ];

  activosDisponibles = [
    { label: 'Servidor Principal', value: 'activo1' },
    { label: 'Base de Datos Produccion', value: 'activo2' },
    { label: 'Firewall Perimetral', value: 'activo3' },
    { label: 'Sistema ERP', value: 'activo4' }
  ];

  procesosDisponibles = [
    { label: 'Gestion de Incidentes', value: 'proc1' },
    { label: 'Control de Accesos', value: 'proc2' },
    { label: 'Backup y Recuperacion', value: 'proc3' },
    { label: 'Gestion de Cambios', value: 'proc4' },
    { label: 'Monitoreo de Seguridad', value: 'proc5' },
    { label: 'Auditoria Interna', value: 'proc6' }
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
      descripcion: 'Sistema de Gestion de Seguridad de la Informacion',
      activo: true,
      requisitos: [
        { id: 'r1', codigo: 'A.5.1', nombre: 'Politicas de seguridad de la informacion', descripcion: 'Directrices de gestion para seguridad de la informacion', marcoId: 'iso27001', controlesAsociados: [] },
        { id: 'r2', codigo: 'A.5.2', nombre: 'Roles y responsabilidades', descripcion: 'Segregacion de funciones', marcoId: 'iso27001', controlesAsociados: [] },
        { id: 'r3', codigo: 'A.8.1', nombre: 'Gestion de activos', descripcion: 'Inventario de activos de informacion', marcoId: 'iso27001', controlesAsociados: [] }
      ]
    },
    {
      id: 'sox',
      nombre: 'Sarbanes-Oxley Act',
      acronimo: 'SOX',
      version: '2002',
      fechaVigencia: new Date('2002-07-30'),
      descripcion: 'Ley de proteccion al inversionista y reforma contable de empresas',
      activo: true,
      requisitos: [
        { id: 'r4', codigo: 'SOX 302', nombre: 'Certificacion de informes', descripcion: 'Responsabilidad corporativa por informes financieros', marcoId: 'sox', controlesAsociados: [] },
        { id: 'r5', codigo: 'SOX 404', nombre: 'Evaluacion de controles internos', descripcion: 'Evaluacion de la gestion de controles internos', marcoId: 'sox', controlesAsociados: [] }
      ]
    },
    {
      id: 'gdpr',
      nombre: 'General Data Protection Regulation',
      acronimo: 'GDPR',
      version: '2016/679',
      fechaVigencia: new Date('2018-05-25'),
      descripcion: 'Reglamento General de Proteccion de Datos de la UE',
      activo: true,
      requisitos: [
        { id: 'r6', codigo: 'Art. 5', nombre: 'Principios del tratamiento', descripcion: 'Licitud, lealtad y transparencia', marcoId: 'gdpr', controlesAsociados: [] },
        { id: 'r7', codigo: 'Art. 32', nombre: 'Seguridad del tratamiento', descripcion: 'Medidas tecnicas y organizativas', marcoId: 'gdpr', controlesAsociados: [] }
      ]
    },
    {
      id: 'pcidss',
      nombre: 'Payment Card Industry Data Security Standard',
      acronimo: 'PCI-DSS',
      version: '4.0',
      fechaVigencia: new Date('2022-03-31'),
      descripcion: 'Estandar de seguridad de datos para la industria de tarjetas de pago',
      activo: true,
      requisitos: [
        { id: 'r8', codigo: 'Req. 1', nombre: 'Firewall Configuration', descripcion: 'Instalar y mantener configuracion de firewall', marcoId: 'pcidss', controlesAsociados: [] },
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
      nombre: 'Evaluacion de Controles SOX',
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
          descripcion: 'Evaluacion del ambiente de control interno',
          peso: 30,
          preguntas: [
            { id: 'p1', texto: 'Existe un codigo de etica documentado y comunicado a todos los empleados?', tipo: 'siNoNa', requerida: true, peso: 10, requiereEvidencia: true, requisitoNormativoId: 'r4' },
            { id: 'p2', texto: 'Se realiza capacitacion anual sobre controles internos?', tipo: 'siNoNa', requerida: true, peso: 8, requiereEvidencia: true },
            { id: 'p3', texto: 'Describa los mecanismos de comunicacion del codigo de etica', tipo: 'texto', requerida: false, peso: 5, requiereEvidencia: false }
          ]
        },
        {
          id: 's2',
          nombre: 'Evaluacion de Riesgos',
          descripcion: 'Proceso de evaluacion de riesgos financieros',
          peso: 35,
          preguntas: [
            { id: 'p4', texto: 'Se realiza una evaluacion de riesgos al menos anualmente?', tipo: 'siNoNa', requerida: true, peso: 15, requiereEvidencia: true, requisitoNormativoId: 'r5' },
            { id: 'p5', texto: 'Cual es la frecuencia de revision de la matriz de riesgos?', tipo: 'seleccionUnica', requerida: true, peso: 10, requiereEvidencia: false, opciones: ['Mensual', 'Trimestral', 'Semestral', 'Anual'] }
          ]
        }
      ]
    },
    {
      id: '2',
      nombre: 'Analisis de Riesgos Operativos',
      descripcion: 'Identificacion y evaluacion de riesgos operativos por area',
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
      nombre: 'Evaluacion de Seguridad TI',
      descripcion: 'Cuestionario de seguridad informatica basado en ISO 27001',
      categoria: 'seguridad',
      tipo: 'manual',
      tipoEvaluacion: 'auditoria_externa',
      estado: 'activo',
      marcoNormativo: 'iso27001',
      periodicidad: 'anual',
      preguntas: 78,
      respuestas: 45,
      tasaCompletado: 65,
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
      descripcion: 'Evaluacion de cumplimiento de proteccion de datos personales',
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
      titulo: 'Evaluacion SOX Q4 2024',
      tipoRevision: 'interna',
      usuariosAsignados: ['user1', 'user2'],
      usuariosAsignadosNombres: ['Alice Johnson', 'Bob Smith'],
      emailsExternos: [],
      activosObjetivo: ['activo1', 'activo2'],
      activosObjetivoNombres: ['Servidor Principal', 'Base de Datos'],
      procesosObjetivo: ['proc1', 'proc3'],
      procesosObjetivoNombres: ['Gestion de Incidentes', 'Backup y Recuperacion'],
      aprobadores: ['user3'],
      aprobadoresNombres: ['Carlos Garcia'],
      evaluadosInternos: ['user1', 'user2'],
      evaluadosInternosNombres: ['Alice Johnson', 'Bob Smith'],
      evaluadosExternos: [],
      areaId: '',
      areaNombre: '',
      responsableId: 'user1',
      responsableNombre: 'Alice Johnson',
      fechaAsignacion: new Date('2024-11-01'),
      fechaInicio: new Date('2024-11-15'),
      fechaVencimiento: new Date('2024-12-15'),
      estado: 'en_progreso',
      progreso: 65,
      instrucciones: 'Completar evaluacion de controles SOX para el cierre Q4',
      recordatorios: true
    },
    {
      id: 'a2',
      cuestionarioId: '2',
      titulo: 'Revision Trimestral ISO 27001',
      tipoRevision: 'interna',
      usuariosAsignados: ['user3'],
      usuariosAsignadosNombres: ['Carlos Garcia'],
      emailsExternos: [],
      activosObjetivo: ['activo3'],
      activosObjetivoNombres: ['Firewall Perimetral'],
      procesosObjetivo: ['proc2', 'proc5'],
      procesosObjetivoNombres: ['Control de Accesos', 'Monitoreo de Seguridad'],
      aprobadores: ['user1'],
      aprobadoresNombres: ['Alice Johnson'],
      evaluadosInternos: ['user3'],
      evaluadosInternosNombres: ['Carlos Garcia'],
      evaluadosExternos: [],
      areaId: '',
      areaNombre: '',
      responsableId: 'user3',
      responsableNombre: 'Carlos Garcia',
      fechaAsignacion: new Date('2024-10-01'),
      fechaInicio: new Date('2024-10-15'),
      fechaVencimiento: new Date('2024-11-30'),
      estado: 'pendiente',
      progreso: 0,
      instrucciones: 'Revision trimestral de controles de seguridad',
      recordatorios: true
    },
    {
      id: 'a3',
      cuestionarioId: '4',
      titulo: 'Auditoria GDPR Semestral',
      tipoRevision: 'externa',
      usuariosAsignados: [],
      usuariosAsignadosNombres: [],
      emailsExternos: ['auditor@external.com'],
      activosObjetivo: [],
      activosObjetivoNombres: [],
      procesosObjetivo: ['proc6'],
      procesosObjetivoNombres: ['Auditoria Interna'],
      aprobadores: ['user1', 'user5'],
      aprobadoresNombres: ['Alice Johnson', 'Eduardo Martinez'],
      evaluadosInternos: [],
      evaluadosInternosNombres: [],
      evaluadosExternos: [
        {
          id: 'ev1',
          nombre: 'Juan Auditor',
          email: 'auditor@external.com',
          invitacionEnviada: true,
          fechaInvitacion: new Date('2024-11-10'),
          haRespondido: false
        }
      ],
      tokenAccesoExterno: 'abc123xy',
      areaId: '',
      areaNombre: '',
      responsableId: 'user5',
      responsableNombre: 'Eduardo Martinez',
      fechaAsignacion: new Date('2024-11-10'),
      fechaInicio: new Date('2024-11-20'),
      fechaVencimiento: new Date('2024-12-20'),
      estado: 'completado',
      progreso: 100,
      instrucciones: 'Auditoria externa de cumplimiento GDPR',
      recordatorios: false
    }
  ]);

  // =============================================
  // DATOS MOCK - ALERTAS
  // =============================================
  alertas = signal<AlertaCumplimiento[]>([
    {
      id: 'al1',
      tipo: 'cuestionario_vencido',
      severidad: 'critica',
      titulo: 'Cuestionario SOX vencido',
      descripcion: 'El cuestionario de controles SOX tiene 5 dias de vencido',
      entidadId: 'a1',
      entidadTipo: 'asignacion',
      fechaGeneracion: new Date('2024-11-25'),
      estado: 'activa',
      responsable: 'user1',
      marcoNormativo: 'sox'
    },
    {
      id: 'al2',
      tipo: 'evidencia_faltante',
      severidad: 'alta',
      titulo: 'Evidencias pendientes ISO 27001',
      descripcion: '3 controles requieren evidencia documental',
      entidadId: '2',
      entidadTipo: 'cuestionario',
      fechaGeneracion: new Date('2024-11-24'),
      estado: 'activa',
      responsable: 'user3',
      marcoNormativo: 'iso27001'
    },
    {
      id: 'al3',
      tipo: 'brecha_cumplimiento',
      severidad: 'media',
      titulo: 'Brecha en cumplimiento GDPR',
      descripcion: 'El nivel de cumplimiento bajo del 80% al 72%',
      entidadId: '4',
      entidadTipo: 'cuestionario',
      fechaGeneracion: new Date('2024-11-23'),
      estado: 'activa',
      responsable: 'user5',
      marcoNormativo: 'gdpr'
    }
  ]);

  // =============================================
  // DATOS MOCK - REPORTES
  // =============================================
  reportes = signal<ReporteCumplimiento[]>([
    {
      id: 'r1',
      nombre: 'Reporte Ejecutivo SOX Q3 2024',
      tipo: 'ejecutivo',
      formato: 'pdf',
      marcoNormativo: 'sox',
      periodo: { inicio: new Date('2024-07-01'), fin: new Date('2024-09-30') },
      fechaGeneracion: new Date('2024-10-05'),
      generadoPor: 'Alice Johnson',
      contenido: {
        cumplimientoGeneral: 87,
        totalPreguntas: 45,
        preguntasRespondidas: 42,
        hallazgos: 3,
        evidenciasPendientes: 2,
        areasEvaluadas: ['Finanzas', 'Tecnologia']
      },
      estado: 'completado',
      urlDescarga: '/reports/sox-q3-2024.pdf'
    },
    {
      id: 'r2',
      nombre: 'Analisis de Hallazgos ISO 27001',
      tipo: 'hallazgos',
      formato: 'excel',
      marcoNormativo: 'iso27001',
      periodo: { inicio: new Date('2024-01-01'), fin: new Date('2024-11-30') },
      fechaGeneracion: new Date('2024-11-20'),
      generadoPor: 'Carlos Garcia',
      contenido: {
        cumplimientoGeneral: 72,
        totalPreguntas: 32,
        preguntasRespondidas: 28,
        hallazgos: 8,
        evidenciasPendientes: 5,
        areasEvaluadas: ['Operaciones', 'Tecnologia']
      },
      estado: 'completado',
      urlDescarga: '/reports/iso27001-hallazgos.xlsx'
    }
  ]);

  // =============================================
  // DATOS MOCK - HISTORIAL
  // =============================================
  historial = signal<HistorialAuditoria[]>([
    {
      id: 'h1',
      fecha: new Date('2024-11-25T14:30:00'),
      accion: 'respuesta',
      entidadTipo: 'asignacion',
      entidadId: 'a1',
      entidadNombre: 'Evaluacion SOX Q4 2024',
      usuario: 'Alice Johnson',
      detalles: 'Respondio 5 preguntas de la seccion Ambiente de Control'
    },
    {
      id: 'h2',
      fecha: new Date('2024-11-24T10:15:00'),
      accion: 'asignacion',
      entidadTipo: 'cuestionario',
      entidadId: '2',
      entidadNombre: 'Analisis de Riesgos Operativos',
      usuario: 'Admin Sistema',
      detalles: 'Asignado a Carlos Garcia con fecha limite 30/11/2024'
    },
    {
      id: 'h3',
      fecha: new Date('2024-11-23T16:45:00'),
      accion: 'validacion',
      entidadTipo: 'respuesta',
      entidadId: 'resp1',
      entidadNombre: 'Respuesta GDPR',
      usuario: 'Eduardo Martinez',
      detalles: 'Aprobo respuestas de la seccion Principios del Tratamiento'
    },
    {
      id: 'h4',
      fecha: new Date('2024-11-22T09:00:00'),
      accion: 'creacion',
      entidadTipo: 'cuestionario',
      entidadId: '3',
      entidadNombre: 'Evaluacion de Seguridad TI',
      usuario: 'Diana Lopez',
      detalles: 'Cuestionario creado con 78 preguntas en 6 secciones'
    },
    {
      id: 'h5',
      fecha: new Date('2024-11-21T11:30:00'),
      accion: 'modificacion',
      entidadTipo: 'cuestionario',
      entidadId: '1',
      entidadNombre: 'Evaluacion de Controles SOX',
      usuario: 'Alice Johnson',
      detalles: 'Actualizo umbrales de calificacion'
    }
  ]);

  // =============================================
  // DATOS MOCK - MAPEO DE CONTROLES
  // =============================================
  mapeoControles = signal<MapeoControl[]>([
    {
      id: 'm1',
      requisitoNormativoId: 'r1',
      requisitoNormativoCodigo: 'A.5.1',
      requisitoNormativoNombre: 'Politicas de seguridad',
      marcoNormativo: 'ISO 27001',
      controlId: 'ctrl1',
      controlNombre: 'POL-001 Politica de Seguridad',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'anual',
      responsable: 'CISO',
      estadoImplementacion: 'implementado',
      efectividad: 92,
      ultimaEvaluacion: new Date('2024-10-15'),
      evidenciasAsociadas: ['ev1', 'ev2'],
      preguntasAsociadas: ['p1']
    },
    {
      id: 'm2',
      requisitoNormativoId: 'r2',
      requisitoNormativoCodigo: 'A.5.2',
      requisitoNormativoNombre: 'Roles y responsabilidades',
      marcoNormativo: 'ISO 27001',
      controlId: 'ctrl2',
      controlNombre: 'ORG-002 Matriz RACI',
      tipoControl: 'preventivo',
      frecuenciaEvaluacion: 'trimestral',
      responsable: 'RRHH',
      estadoImplementacion: 'parcial',
      efectividad: 75,
      ultimaEvaluacion: new Date('2024-09-30'),
      evidenciasAsociadas: ['ev3'],
      preguntasAsociadas: ['p2']
    },
    {
      id: 'm3',
      requisitoNormativoId: 'r4',
      requisitoNormativoCodigo: 'SOX 302',
      requisitoNormativoNombre: 'Certificacion de informes',
      marcoNormativo: 'SOX',
      controlId: 'ctrl3',
      controlNombre: 'FIN-001 Revision de Estados',
      tipoControl: 'detectivo',
      frecuenciaEvaluacion: 'mensual',
      responsable: 'CFO',
      estadoImplementacion: 'implementado',
      efectividad: 88,
      ultimaEvaluacion: new Date('2024-11-01'),
      evidenciasAsociadas: ['ev4', 'ev5', 'ev6'],
      preguntasAsociadas: ['p1', 'p4']
    }
  ]);

  // =============================================
  // DATOS MOCK - CONTROLES FALTANTES
  // =============================================
  controlesFaltantes = signal<ControlFaltante[]>([
    {
      id: 'cf1',
      requisitoNormativoId: 'r3',
      requisitoNormativoCodigo: 'A.8.1',
      requisitoNormativoNombre: 'Gestion de activos',
      marcoNormativo: 'ISO 27001',
      riesgoAsociado: 'Perdida de activos criticos no inventariados',
      prioridadImplementacion: 'alta',
      controlSugerido: 'Inventario automatizado de activos',
      descripcionControl: 'Sistema de descubrimiento y registro automatico de activos de TI',
      referenciaControlesSimilares: ['ctrl1'],
      fechaDeteccion: new Date('2024-11-15'),
      estado: 'pendiente',
      responsableSugerido: 'IT Manager'
    },
    {
      id: 'cf2',
      requisitoNormativoId: 'r7',
      requisitoNormativoCodigo: 'Art. 32',
      requisitoNormativoNombre: 'Seguridad del tratamiento',
      marcoNormativo: 'GDPR',
      riesgoAsociado: 'Acceso no autorizado a datos personales',
      prioridadImplementacion: 'critica',
      controlSugerido: 'Encriptacion de datos en reposo',
      descripcionControl: 'Implementar cifrado AES-256 para bases de datos con datos personales',
      referenciaControlesSimilares: [],
      fechaDeteccion: new Date('2024-11-10'),
      estado: 'en_evaluacion',
      responsableSugerido: 'DPO'
    }
  ]);

  // =============================================
  // DATOS MOCK - ACCIONES CORRECTIVAS
  // =============================================
  accionesCorrectivas = signal<AccionCorrectiva[]>([
    {
      id: 'ac1',
      titulo: 'Implementar MFA en sistemas criticos',
      descripcion: 'Configurar autenticacion multifactor para todos los sistemas clasificados como criticos',
      tipoAccion: 'corto_plazo',
      prioridad: 'alta',
      hallazgoOrigen: 'h1',
      controlAfectado: 'ctrl2',
      marcoNormativo: 'ISO 27001',
      responsable: 'IT Security',
      fechaCreacion: new Date('2024-11-01'),
      fechaVencimiento: new Date('2024-12-15'),
      fechaCompletado: null,
      estado: 'en_progreso',
      recursosRequeridos: 'Licencias MFA, configuracion en IdP',
      resultadoEsperado: '100% de sistemas criticos con MFA activo',
      metricasVerificacion: 'Reporte de cobertura MFA',
      evidenciaImplementacion: null,
      efectividadVerificada: false
    },
    {
      id: 'ac2',
      titulo: 'Actualizar politica de retencion de datos',
      descripcion: 'Revisar y actualizar la politica de retencion de acuerdo a GDPR',
      tipoAccion: 'inmediata',
      prioridad: 'critica',
      hallazgoOrigen: 'h2',
      controlAfectado: 'ctrl1',
      marcoNormativo: 'GDPR',
      responsable: 'DPO',
      fechaCreacion: new Date('2024-10-20'),
      fechaVencimiento: new Date('2024-11-20'),
      fechaCompletado: new Date('2024-11-18'),
      estado: 'completada',
      recursosRequeridos: 'Revision legal, aprobacion direccion',
      resultadoEsperado: 'Politica actualizada y publicada',
      metricasVerificacion: 'Documento aprobado',
      evidenciaImplementacion: 'POL-RET-v2.pdf',
      efectividadVerificada: true
    }
  ]);

  // =============================================
  // DATOS MOCK - EVIDENCIAS
  // =============================================
  evidencias = signal<Evidencia[]>([
    {
      id: 'ev1',
      nombre: 'Politica de Seguridad v2.1.pdf',
      tipo: 'application/pdf',
      tamano: 245000,
      fechaCarga: new Date('2024-10-15'),
      url: '/evidencias/pol-seg-v2.1.pdf',
      descripcion: 'Politica de seguridad de la informacion aprobada',
      vigencia: new Date('2025-10-15'),
      estado: 'vigente'
    },
    {
      id: 'ev2',
      nombre: 'Acta Aprobacion Directorio.pdf',
      tipo: 'application/pdf',
      tamano: 125000,
      fechaCarga: new Date('2024-10-15'),
      url: '/evidencias/acta-aprobacion.pdf',
      descripcion: 'Acta de aprobacion de politicas por directorio',
      vigencia: null,
      estado: 'vigente'
    },
    {
      id: 'ev3',
      nombre: 'Matriz RACI Seguridad.xlsx',
      tipo: 'application/vnd.ms-excel',
      tamano: 85000,
      fechaCarga: new Date('2024-09-30'),
      url: '/evidencias/matriz-raci.xlsx',
      descripcion: 'Matriz de responsabilidades de seguridad',
      vigencia: new Date('2024-12-30'),
      estado: 'proximo_vencer'
    },
    {
      id: 'ev4',
      nombre: 'Reporte Revision EEFF Q3.pdf',
      tipo: 'application/pdf',
      tamano: 520000,
      fechaCarga: new Date('2024-11-01'),
      url: '/evidencias/revision-eeff-q3.pdf',
      descripcion: 'Reporte de revision de estados financieros Q3',
      vigencia: null,
      estado: 'vigente'
    }
  ]);

  // =============================================
  // DATOS MOCK - RESPUESTAS DE CUESTIONARIOS
  // =============================================
  respuestasCuestionarios = signal<RespuestaCuestionario[]>([
    {
      id: 'resp1',
      asignacionId: 'a1',
      cuestionarioId: '1',
      respondidoPor: 'user1',
      fechaInicio: new Date('2024-11-20'),
      fechaEnvio: new Date('2024-11-25'),
      estado: 'enviado',
      respuestas: [
        { preguntaId: 'p1', valor: 'Si', comentario: 'El codigo de etica fue actualizado en enero 2024', evidencias: [], marcadaParaRevision: false, estadoRevision: 'pendiente', comentarioRevisor: '' },
        { preguntaId: 'p2', valor: 'Si', comentario: 'Capacitacion anual completada en marzo', evidencias: [], marcadaParaRevision: false, estadoRevision: 'aprobada', comentarioRevisor: 'Evidencia verificada correctamente' },
        { preguntaId: 'p3', valor: 'Se utilizan correos corporativos, reuniones trimestrales y la intranet para comunicar el codigo', comentario: '', evidencias: [], marcadaParaRevision: false, estadoRevision: 'pendiente', comentarioRevisor: '' },
        { preguntaId: 'p4', valor: 'Si', comentario: 'Evaluacion realizada en Q2 2024', evidencias: [], marcadaParaRevision: false, estadoRevision: 'rechazada', comentarioRevisor: 'Falta el documento de la evaluacion de riesgos' },
        { preguntaId: 'p5', valor: 'Trimestral', comentario: '', evidencias: [], marcadaParaRevision: false, estadoRevision: 'pendiente', comentarioRevisor: '' }
      ],
      puntuacionTotal: 85,
      nivelCumplimiento: 'sobresaliente',
      comentariosGenerales: 'Evaluacion completada satisfactoriamente'
    },
    {
      id: 'resp2',
      asignacionId: 'a2',
      cuestionarioId: '2',
      respondidoPor: 'user3',
      fechaInicio: new Date('2024-11-10'),
      fechaEnvio: null,
      estado: 'borrador',
      respuestas: [],
      puntuacionTotal: 0,
      nivelCumplimiento: 'deficiente',
      comentariosGenerales: ''
    }
  ]);

  // =============================================
  // ESTADISTICAS COMPUTADAS
  // =============================================
  totalCuestionarios = computed(() => this.cuestionarios().length);
  totalAsignaciones = computed(() => this.asignaciones().length);
  asignacionesPendientes = computed(() => this.asignaciones().filter(a => a.estado === 'pendiente' || a.estado === 'en_progreso').length);
  alertasCriticas = computed(() => this.alertas().filter(a => a.severidad === 'critica' && a.estado === 'activa').length);
  alertasActivas = computed(() => this.alertas().filter(a => a.estado === 'activa'));

  promedioCompletado = computed(() => {
    const asignacionesActivas = this.asignaciones().filter(a => a.estado !== 'completado');
    if (asignacionesActivas.length === 0) return 0;
    return Math.round(asignacionesActivas.reduce((sum, a) => sum + a.progreso, 0) / asignacionesActivas.length);
  });

  totalControlesImplementados = computed(() => this.mapeoControles().filter(m => m.estadoImplementacion === 'implementado').length);
  totalControlesParciales = computed(() => this.mapeoControles().filter(m => m.estadoImplementacion === 'parcial').length);
  promedioEfectividad = computed(() => {
    const controles = this.mapeoControles();
    if (controles.length === 0) return 0;
    return Math.round(controles.reduce((sum, c) => sum + c.efectividad, 0) / controles.length);
  });

  accionesCorrectivasPendientes = computed(() => this.accionesCorrectivas().filter(a => a.estado === 'pendiente').length);
  accionesCorrectivasEnProgreso = computed(() => this.accionesCorrectivas().filter(a => a.estado === 'en_progreso').length);
  accionesCorrectivasCompletadas = computed(() => this.accionesCorrectivas().filter(a => a.estado === 'completada').length);

  historialFiltrado = computed(() => {
    let resultado = this.historial();

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

  // =============================================
  // CHART DATA
  // =============================================
  chartData = computed(() => ({
    labels: ['ISO 27001', 'SOX', 'GDPR', 'PCI-DSS'],
    datasets: [{
      label: 'Cumplimiento %',
      data: [72, 87, 95, 68],
      backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
    }]
  }));

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  pieChartData = computed(() => ({
    labels: ['Completados', 'En Progreso', 'Pendientes', 'Vencidos'],
    datasets: [{
      data: [
        this.asignaciones().filter(a => a.estado === 'completado').length,
        this.asignaciones().filter(a => a.estado === 'en_progreso').length,
        this.asignaciones().filter(a => a.estado === 'pendiente').length,
        this.asignaciones().filter(a => a.estado === 'vencido').length
      ],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
    }]
  }));

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // =============================================
  // METODOS - UTILIDADES
  // =============================================
  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'completado': case 'activo': case 'aprobado': return 'success';
      case 'en_progreso': case 'en_proceso': return 'info';
      case 'pendiente': case 'borrador': return 'warn';
      case 'vencido': case 'rechazado': return 'danger';
      default: return 'secondary';
    }
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

  getCuestionario(cuestionarioId: string): Cuestionario | undefined {
    return this.cuestionarios().find(c => c.id === cuestionarioId);
  }

  getAsignacionesCuestionario(cuestionarioId: string): AsignacionCuestionario[] {
    return this.asignaciones().filter(a => a.cuestionarioId === cuestionarioId);
  }

  // =============================================
  // METODOS - NAVEGACION
  // =============================================
  irACuestionarios() {
    this.router.navigate(['/cuestionarios']);
  }

  irADashboard() {
    this.vistaActual.set('dashboard');
  }

  irAMarcos() {
    this.vistaActual.set('marcos');
  }

  irAHistorial() {
    this.vistaActual.set('historial');
  }

  irAReportes() {
    this.vistaActual.set('reportes');
  }

  irAMapeo() {
    this.vistaActual.set('mapeo');
  }

  irAEvidencias() {
    this.vistaActual.set('evidencias');
  }

  verAsignaciones(cuestionario: Cuestionario) {
    this.cuestionarioSeleccionado.set(cuestionario);
    this.vistaActual.set('asignar');
  }

  // =============================================
  // METODOS - ASIGNACIONES
  // =============================================
  abrirAsignarDialog(cuestionario?: Cuestionario) {
    this.modoEdicionAsignacion.set(false);
    this.asignacionEditandoId.set(null);
    this.pasoAsignacion.set(0);
    if (cuestionario) {
      this.cuestionarioSeleccionado.set(cuestionario);
    }
    this.nuevaAsignacion.set({
      cuestionarioId: cuestionario?.id || '',
      titulo: '',
      tipoRevision: 'interna',
      usuariosAsignados: [],
      emailsExternos: [],
      activosObjetivo: [],
      procesosObjetivo: [],
      aprobadores: [],
      evaluadosInternos: [],
      evaluadosExternos: [],
      responsableId: '',
      fechaInicio: new Date(),
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      instrucciones: '',
      recordatorios: true,
      recurrencia: {
        habilitada: false,
        frecuencia: 'mensual',
        intervalo: 1
      }
    });
    this.nuevoEvaluadoExterno.set({ nombre: '', email: '' });
    this.showAsignarDialog.set(true);
  }

  editarAsignacion(asignacion: AsignacionCuestionario) {
    this.modoEdicionAsignacion.set(true);
    this.asignacionEditandoId.set(asignacion.id);
    this.pasoAsignacion.set(0);
    const cuestionario = this.getCuestionario(asignacion.cuestionarioId);
    if (cuestionario) {
      this.cuestionarioSeleccionado.set(cuestionario);
    }
    this.nuevaAsignacion.set({
      cuestionarioId: asignacion.cuestionarioId,
      titulo: asignacion.titulo,
      tipoRevision: asignacion.tipoRevision,
      usuariosAsignados: asignacion.usuariosAsignados,
      emailsExternos: asignacion.emailsExternos,
      activosObjetivo: asignacion.activosObjetivo,
      procesosObjetivo: asignacion.procesosObjetivo || [],
      aprobadores: asignacion.aprobadores,
      evaluadosInternos: asignacion.evaluadosInternos || [],
      evaluadosExternos: asignacion.evaluadosExternos || [],
      responsableId: asignacion.responsableId,
      fechaInicio: asignacion.fechaInicio,
      fechaVencimiento: asignacion.fechaVencimiento,
      instrucciones: asignacion.instrucciones,
      recordatorios: asignacion.recordatorios,
      recurrencia: asignacion.recurrencia
    });
    this.nuevoEvaluadoExterno.set({ nombre: '', email: '' });
    this.showAsignarDialog.set(true);
  }

  eliminarAsignacion(asignacion: AsignacionCuestionario) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la asignación "${asignacion.titulo}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.asignaciones.update(lista => lista.filter(a => a.id !== asignacion.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Asignación eliminada exitosamente' });
      }
    });
  }

  guardarAsignacion() {
    const nueva = this.nuevaAsignacion();

    if (!nueva.titulo || !nueva.cuestionarioIds || nueva.cuestionarioIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Complete los campos requeridos (título y al menos un cuestionario)' });
      return;
    }

    // Obtener nombres para mostrar
    const usuariosNombres = (nueva.usuariosAsignados || []).map(id =>
      this.usuariosDisponibles.find(u => u.value === id)?.label || ''
    ).filter(n => n);
    const activosNombres = (nueva.activosObjetivo || []).map(id =>
      this.activosDisponibles.find(a => a.value === id)?.label || ''
    ).filter(n => n);
    const procesosNombres = (nueva.procesosObjetivo || []).map(id =>
      this.procesosDisponibles.find(p => p.value === id)?.label || ''
    ).filter(n => n);
    const aprobadoresNombres = (nueva.aprobadores || []).map(id =>
      this.usuariosDisponibles.find(u => u.value === id)?.label || ''
    ).filter(n => n);
    const evaluadosInternosNombres = (nueva.evaluadosInternos || []).map(id =>
      this.usuariosDisponibles.find(u => u.value === id)?.label || ''
    ).filter(n => n);

    if (this.modoEdicionAsignacion() && this.asignacionEditandoId()) {
      // Modo edición
      this.asignaciones.update(lista => lista.map(a => {
        if (a.id === this.asignacionEditandoId()) {
          return {
            ...a,
            cuestionarioId: nueva.cuestionarioIds![0],
            cuestionarioIds: nueva.cuestionarioIds,
            titulo: nueva.titulo!,
            tipoRevision: nueva.tipoRevision as 'interna' | 'externa',
            usuariosAsignados: nueva.usuariosAsignados || [],
            usuariosAsignadosNombres: usuariosNombres,
            emailsExternos: nueva.emailsExternos || [],
            activosObjetivo: nueva.activosObjetivo || [],
            activosObjetivoNombres: activosNombres,
            procesosObjetivo: nueva.procesosObjetivo || [],
            procesosObjetivoNombres: procesosNombres,
            aprobadores: nueva.aprobadores || [],
            aprobadoresNombres: aprobadoresNombres,
            evaluadosInternos: nueva.evaluadosInternos || [],
            evaluadosInternosNombres: evaluadosInternosNombres,
            evaluadosExternos: nueva.evaluadosExternos || [],
            tokenAccesoExterno: nueva.tokenAccesoExterno,
            areaId: '',
            areaNombre: '',
            responsableId: nueva.responsableId || '',
            responsableNombre: this.usuariosDisponibles.find(u => u.value === nueva.responsableId)?.label || '',
            fechaInicio: nueva.fechaInicio!,
            fechaVencimiento: nueva.fechaVencimiento!,
            instrucciones: nueva.instrucciones || '',
            recordatorios: nueva.recordatorios!,
            recurrencia: nueva.recurrencia
          };
        }
        return a;
      }));
      this.showAsignarDialog.set(false);
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Asignación actualizada exitosamente' });
    } else {
      // Modo creación
      const asignacion: AsignacionCuestionario = {
        id: crypto.randomUUID(),
        cuestionarioId: nueva.cuestionarioIds![0],
        cuestionarioIds: nueva.cuestionarioIds,
        titulo: nueva.titulo!,
        tipoRevision: nueva.tipoRevision as 'interna' | 'externa',
        usuariosAsignados: nueva.usuariosAsignados || [],
        usuariosAsignadosNombres: usuariosNombres,
        emailsExternos: nueva.emailsExternos || [],
        activosObjetivo: nueva.activosObjetivo || [],
        activosObjetivoNombres: activosNombres,
        procesosObjetivo: nueva.procesosObjetivo || [],
        procesosObjetivoNombres: procesosNombres,
        aprobadores: nueva.aprobadores || [],
        aprobadoresNombres: aprobadoresNombres,
        evaluadosInternos: nueva.evaluadosInternos || [],
        evaluadosInternosNombres: evaluadosInternosNombres,
        evaluadosExternos: nueva.evaluadosExternos || [],
        tokenAccesoExterno: nueva.tokenAccesoExterno,
        areaId: '',
        areaNombre: '',
        responsableId: nueva.responsableId || '',
        responsableNombre: this.usuariosDisponibles.find(u => u.value === nueva.responsableId)?.label || '',
        fechaAsignacion: new Date(),
        fechaInicio: nueva.fechaInicio!,
        fechaVencimiento: nueva.fechaVencimiento!,
        estado: 'pendiente',
        progreso: 0,
        instrucciones: nueva.instrucciones || '',
        recordatorios: nueva.recordatorios!,
        recurrencia: nueva.recurrencia
      };

      this.asignaciones.update(lista => [...lista, asignacion]);
      this.showAsignarDialog.set(false);
      this.messageService.add({ severity: 'success', summary: 'Asignado', detail: 'Cuestionario asignado exitosamente' });
    }
  }

  responderCuestionario(asignacion: AsignacionCuestionario) {
    this.asignacionSeleccionada.set(asignacion);
    const cuestionario = this.getCuestionario(asignacion.cuestionarioId);
    if (cuestionario) {
      this.cuestionarioSeleccionado.set(cuestionario);
    }

    // Crear respuesta si no existe
    const respuesta: RespuestaCuestionario = {
      id: crypto.randomUUID(),
      asignacionId: asignacion.id,
      cuestionarioId: asignacion.cuestionarioId,
      respondidoPor: 'user1',
      fechaInicio: new Date(),
      fechaEnvio: null,
      estado: 'borrador',
      respuestas: [],
      puntuacionTotal: 0,
      nivelCumplimiento: 'deficiente',
      comentariosGenerales: ''
    };
    this.respuestaActual.set(respuesta);
    this.vistaActual.set('responder');
  }

  // =============================================
  // METODOS - RESPUESTAS
  // =============================================
  getRespuestaPregunta(preguntaId: string): RespuestaPregunta | undefined {
    return this.respuestaActual()?.respuestas.find(r => r.preguntaId === preguntaId);
  }

  actualizarRespuesta(preguntaId: string, valor: any) {
    const respuesta = this.respuestaActual();
    if (!respuesta) return;

    const existente = respuesta.respuestas.find(r => r.preguntaId === preguntaId);
    if (existente) {
      existente.valor = valor;
    } else {
      respuesta.respuestas.push({
        preguntaId,
        valor,
        comentario: '',
        evidencias: [],
        marcadaParaRevision: false,
        estadoRevision: 'pendiente',
        comentarioRevisor: ''
      });
    }
    this.respuestaActual.set({ ...respuesta });
  }

  guardarRespuestaBorrador() {
    this.messageService.add({ severity: 'info', summary: 'Guardado', detail: 'Respuestas guardadas como borrador' });
  }

  enviarRespuesta() {
    const respuesta = this.respuestaActual();
    if (!respuesta) return;

    respuesta.estado = 'enviado';
    respuesta.fechaEnvio = new Date();

    // Actualizar progreso de asignacion
    const asignacion = this.asignacionSeleccionada();
    if (asignacion) {
      asignacion.estado = 'completado';
      asignacion.progreso = 100;
      this.asignaciones.update(lista => lista.map(a => a.id === asignacion.id ? asignacion : a));
    }

    this.messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Respuestas enviadas para revision' });
    this.vistaActual.set('dashboard');
  }

  volverAAsignaciones() {
    this.vistaActual.set('asignar');
    this.asignacionSeleccionada.set(null);
  }

  // =============================================
  // METODOS - ALERTAS
  // =============================================
  atenderAlerta(alerta: AlertaCumplimiento) {
    alerta.estado = 'atendida';
    this.alertas.update(lista => lista.map(a => a.id === alerta.id ? alerta : a));
    this.messageService.add({ severity: 'success', summary: 'Atendida', detail: 'Alerta marcada como atendida' });
  }

  // =============================================
  // METODOS - MARCOS
  // =============================================
  abrirMarcoDialog() {
    this.showMarcoDialog.set(true);
  }

  // =============================================
  // METODOS - REPORTES
  // =============================================
  async generarReporte() {
    this.reporteEnGeneracion.set(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const nuevoReporte: ReporteCumplimiento = {
      id: crypto.randomUUID(),
      nombre: this.nuevoReporte().nombre || 'Nuevo Reporte',
      tipo: this.nuevoReporte().tipo as ReporteCumplimiento['tipo'],
      formato: this.nuevoReporte().formato as ReporteCumplimiento['formato'],
      marcoNormativo: this.nuevoReporte().marcoNormativo || '',
      periodo: this.nuevoReporte().periodo!,
      fechaGeneracion: new Date(),
      generadoPor: 'Usuario Actual',
      contenido: {
        cumplimientoGeneral: 85,
        totalPreguntas: 50,
        preguntasRespondidas: 45,
        hallazgos: 5,
        evidenciasPendientes: 3,
        areasEvaluadas: ['Tecnologia', 'Finanzas']
      },
      estado: 'completado',
      urlDescarga: '/reports/nuevo-reporte.pdf'
    };

    this.reportes.update(lista => [...lista, nuevoReporte]);
    this.reporteEnGeneracion.set(false);
    this.nuevoReporte.set({
      nombre: '',
      tipo: 'ejecutivo',
      formato: 'pdf',
      marcoNormativo: '',
      periodo: { inicio: new Date(), fin: new Date() }
    });
    this.messageService.add({ severity: 'success', summary: 'Generado', detail: 'Reporte generado exitosamente' });
  }

  descargarReporte(reporte: ReporteCumplimiento) {
    this.messageService.add({ severity: 'info', summary: 'Descarga', detail: `Descargando ${reporte.nombre}` });
  }

  eliminarReporte(reporte: ReporteCumplimiento) {
    this.confirmationService.confirm({
      message: `Eliminar el reporte "${reporte.nombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reportes.update(lista => lista.filter(r => r.id !== reporte.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Reporte eliminado' });
      }
    });
  }

  getTipoReporteLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'ejecutivo': 'Ejecutivo',
      'detallado': 'Detallado',
      'hallazgos': 'Hallazgos',
      'tendencias': 'Tendencias',
      'comparativo': 'Comparativo'
    };
    return labels[tipo] || tipo;
  }

  getFormatoIcon(formato: string): string {
    const icons: Record<string, string> = {
      'pdf': 'pi pi-file-pdf',
      'excel': 'pi pi-file-excel',
      'word': 'pi pi-file-word'
    };
    return icons[formato] || 'pi pi-file';
  }

  // =============================================
  // METODOS - HISTORIAL
  // =============================================
  getAccionLabel(accion: string): string {
    const labels: Record<string, string> = {
      'creacion': 'Creacion',
      'modificacion': 'Modificacion',
      'eliminacion': 'Eliminacion',
      'asignacion': 'Asignacion',
      'respuesta': 'Respuesta',
      'validacion': 'Validacion',
      'exportacion': 'Exportacion'
    };
    return labels[accion] || accion;
  }

  getAccionSeverity(accion: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (accion) {
      case 'creacion': return 'success';
      case 'modificacion': return 'info';
      case 'eliminacion': return 'danger';
      case 'asignacion': return 'warn';
      case 'respuesta': return 'info';
      case 'validacion': return 'success';
      default: return 'secondary';
    }
  }

  // =============================================
  // METODOS - MAPEO DE CONTROLES
  // =============================================
  getTipoControlLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'preventivo': 'Preventivo',
      'detectivo': 'Detectivo',
      'correctivo': 'Correctivo'
    };
    return labels[tipo] || tipo;
  }

  getTipoControlSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (tipo) {
      case 'preventivo': return 'info';
      case 'detectivo': return 'warn';
      case 'correctivo': return 'danger';
      default: return 'secondary';
    }
  }

  getEstadoImplementacionLabel(estado: string): string {
    const labels: Record<string, string> = {
      'implementado': 'Implementado',
      'parcial': 'Parcial',
      'no_implementado': 'No Implementado',
      'no_aplica': 'No Aplica'
    };
    return labels[estado] || estado;
  }

  getEstadoImplementacionSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'implementado': return 'success';
      case 'parcial': return 'warn';
      case 'no_implementado': return 'danger';
      case 'no_aplica': return 'secondary';
      default: return 'info';
    }
  }

  getEfectividadClass(efectividad: number): string {
    if (efectividad >= 80) return 'text-green-500';
    if (efectividad >= 60) return 'text-yellow-500';
    return 'text-red-500';
  }

  detectarControlesFaltantes() {
    this.messageService.add({ severity: 'info', summary: 'Analisis', detail: 'Analizando gaps de controles...' });
  }

  // =============================================
  // METODOS - CONTROLES FALTANTES
  // =============================================
  getPrioridadControlLabel(prioridad: string): string {
    const labels: Record<string, string> = {
      'critica': 'Critica',
      'alta': 'Alta',
      'media': 'Media',
      'baja': 'Baja'
    };
    return labels[prioridad] || prioridad;
  }

  getPrioridadControlSeverity(prioridad: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (prioridad) {
      case 'critica': return 'danger';
      case 'alta': return 'warn';
      case 'media': return 'info';
      case 'baja': return 'secondary';
      default: return 'info';
    }
  }

  getEstadoControlFaltanteLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en_evaluacion': 'En Evaluacion',
      'aceptado': 'Aceptado',
      'rechazado': 'Rechazado'
    };
    return labels[estado] || estado;
  }

  getEstadoControlFaltanteSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'aceptado': return 'success';
      case 'en_evaluacion': return 'info';
      case 'pendiente': return 'warn';
      case 'rechazado': return 'danger';
      default: return 'secondary';
    }
  }

  aceptarControlFaltante(control: ControlFaltante) {
    control.estado = 'aceptado';
    this.controlesFaltantes.update(lista => lista.map(c => c.id === control.id ? control : c));
    this.messageService.add({ severity: 'success', summary: 'Aceptado', detail: 'Control agregado al plan de implementacion' });
  }

  rechazarControlFaltante(control: ControlFaltante) {
    control.estado = 'rechazado';
    this.controlesFaltantes.update(lista => lista.map(c => c.id === control.id ? control : c));
    this.messageService.add({ severity: 'info', summary: 'Rechazado', detail: 'Control marcado como rechazado' });
  }

  // =============================================
  // METODOS - ACCIONES CORRECTIVAS
  // =============================================
  getTipoAccionLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'inmediata': 'Inmediata',
      'corto_plazo': 'Corto Plazo',
      'mediano_plazo': 'Mediano Plazo'
    };
    return labels[tipo] || tipo;
  }

  getTipoAccionSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (tipo) {
      case 'inmediata': return 'danger';
      case 'corto_plazo': return 'warn';
      case 'mediano_plazo': return 'info';
      default: return 'secondary';
    }
  }

  getEstadoAccionLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Progreso',
      'completada': 'Completada',
      'vencida': 'Vencida',
      'cancelada': 'Cancelada'
    };
    return labels[estado] || estado;
  }

  getEstadoAccionSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'completada': return 'success';
      case 'en_progreso': return 'info';
      case 'pendiente': return 'warn';
      case 'vencida': return 'danger';
      case 'cancelada': return 'secondary';
      default: return 'info';
    }
  }

  // =============================================
  // METODOS - EVIDENCIAS
  // =============================================
  getEstadoEvidenciaLabel(estado: string): string {
    const labels: Record<string, string> = {
      'vigente': 'Vigente',
      'proximo_vencer': 'Proximo a Vencer',
      'vencida': 'Vencida'
    };
    return labels[estado] || estado;
  }

  getEstadoEvidenciaSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'vigente': return 'success';
      case 'proximo_vencer': return 'warn';
      case 'vencida': return 'danger';
      default: return 'secondary';
    }
  }

  getTipoEvidenciaIcon(tipo: string): string {
    if (tipo.includes('pdf')) return 'pi pi-file-pdf';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'pi pi-file-excel';
    if (tipo.includes('word') || tipo.includes('document')) return 'pi pi-file-word';
    if (tipo.includes('image')) return 'pi pi-image';
    return 'pi pi-file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  descargarEvidencia(evidencia: Evidencia) {
    this.messageService.add({ severity: 'info', summary: 'Descarga', detail: `Descargando ${evidencia.nombre}` });
  }

  eliminarEvidencia(evidencia: Evidencia) {
    this.confirmationService.confirm({
      message: `Eliminar la evidencia "${evidencia.nombre}"?`,
      header: 'Confirmar eliminacion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evidencias.update(lista => lista.filter(e => e.id !== evidencia.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'Evidencia eliminada' });
      }
    });
  }

  onUploadEvidencia(event: any) {
    const file = event.files?.[0];
    if (file) {
      const nuevaEvidencia: Evidencia = {
        id: crypto.randomUUID(),
        nombre: file.name,
        tipo: file.type,
        tamano: file.size,
        fechaCarga: new Date(),
        url: URL.createObjectURL(file),
        descripcion: '',
        vigencia: null,
        estado: 'vigente'
      };
      this.evidencias.update(lista => [...lista, nuevaEvidencia]);
      this.messageService.add({ severity: 'success', summary: 'Cargada', detail: 'Evidencia cargada exitosamente' });
    }
  }

  // =============================================
  // METODOS HELPER - ACTUALIZACION DE REPORTES
  // =============================================
  actualizarReporteNombre(valor: string) {
    this.nuevoReporte.update(r => ({ ...r, nombre: valor }));
  }

  actualizarReporteTipo(valor: 'ejecutivo' | 'detallado' | 'hallazgos' | 'tendencias' | 'comparativo') {
    this.nuevoReporte.update(r => ({ ...r, tipo: valor }));
  }

  actualizarReporteFormato(valor: 'pdf' | 'excel' | 'word') {
    this.nuevoReporte.update(r => ({ ...r, formato: valor }));
  }

  actualizarReporteMarco(valor: string) {
    this.nuevoReporte.update(r => ({ ...r, marcoNormativo: valor }));
  }

  actualizarReportePeriodoInicio(valor: Date) {
    this.nuevoReporte.update(r => ({
      ...r,
      periodo: { ...r.periodo!, inicio: valor }
    }));
  }

  actualizarReportePeriodoFin(valor: Date) {
    this.nuevoReporte.update(r => ({
      ...r,
      periodo: { ...r.periodo!, fin: valor }
    }));
  }

  // =============================================
  // METODOS HELPER - AVATAR LABEL
  // =============================================
  getAvatarLabel(nombre: unknown): string {
    if (typeof nombre === 'string' && nombre.length > 0) {
      return nombre.charAt(0);
    }
    return '?';
  }

  // =============================================
  // METODOS HELPER - ACTUALIZACION DE ASIGNACION
  // =============================================
  actualizarAsignacionTitulo(valor: string) {
    this.nuevaAsignacion.update(a => ({ ...a, titulo: valor }));
  }

  actualizarAsignacionTipoRevision(valor: 'interna' | 'externa') {
    this.nuevaAsignacion.update(a => ({ ...a, tipoRevision: valor }));
  }

  actualizarAsignacionAreaId(valor: string) {
    this.nuevaAsignacion.update(a => ({ ...a, areaId: valor }));
  }

  actualizarAsignacionUsuarios(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, usuariosAsignados: valor }));
  }

  actualizarAsignacionEmails(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, emailsExternos: valor }));
  }

  actualizarAsignacionFechaInicio(valor: Date) {
    this.nuevaAsignacion.update(a => ({ ...a, fechaInicio: valor }));
  }

  actualizarAsignacionFechaVencimiento(valor: Date) {
    this.nuevaAsignacion.update(a => ({ ...a, fechaVencimiento: valor }));
  }

  actualizarAsignacionInstrucciones(valor: string) {
    this.nuevaAsignacion.update(a => ({ ...a, instrucciones: valor }));
  }

  actualizarAsignacionRecordatorios(valor: boolean) {
    this.nuevaAsignacion.update(a => ({ ...a, recordatorios: valor }));
  }

  actualizarAsignacionCuestionario(valor: string) {
    this.nuevaAsignacion.update(a => ({ ...a, cuestionarioId: valor }));
    const cuestionario = this.getCuestionario(valor);
    if (cuestionario) {
      this.cuestionarioSeleccionado.set(cuestionario);
    }
  }

  actualizarAsignacionCuestionarios(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, cuestionarioIds: valor }));
  }

  actualizarAsignacionActivos(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, activosObjetivo: valor }));
  }

  actualizarAsignacionProcesos(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, procesosObjetivo: valor }));
  }

  actualizarTipoAlcance(valor: 'activos' | 'objetivos') {
    this.tipoAlcanceSeleccionado.set(valor);
    // Limpiar el campo no seleccionado
    if (valor === 'activos') {
      this.nuevaAsignacion.update(a => ({ ...a, procesosObjetivo: [] }));
    } else {
      this.nuevaAsignacion.update(a => ({ ...a, activosObjetivo: [] }));
    }
  }

  actualizarAsignacionAprobadores(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, aprobadores: valor }));
  }

  actualizarAsignacionResponsable(valor: string) {
    this.nuevaAsignacion.update(a => ({ ...a, responsableId: valor }));
  }

  actualizarAsignacionRecurrenciaHabilitada(valor: boolean) {
    this.nuevaAsignacion.update(a => ({
      ...a,
      recurrencia: { ...a.recurrencia!, habilitada: valor }
    }));
  }

  actualizarAsignacionRecurrenciaFrecuencia(valor: 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual') {
    this.nuevaAsignacion.update(a => ({
      ...a,
      recurrencia: { ...a.recurrencia!, frecuencia: valor }
    }));
  }

  actualizarAsignacionRecurrenciaIntervalo(valor: number) {
    this.nuevaAsignacion.update(a => ({
      ...a,
      recurrencia: { ...a.recurrencia!, intervalo: valor }
    }));
  }

  // Computed para opciones de cuestionarios
  cuestionariosOptions = computed(() => {
    return this.cuestionarios()
      .filter(c => c.estado === 'activo')
      .map(c => ({
        label: c.nombre,
        value: c.id,
        marco: this.marcosNormativos().find(m => m.id === c.marcoNormativo)?.acronimo || c.marcoNormativo
      }));
  });

  // =============================================
  // METODOS - EVALUADOS
  // =============================================
  actualizarAsignacionEvaluadosInternos(valor: string[]) {
    this.nuevaAsignacion.update(a => ({ ...a, evaluadosInternos: valor }));
  }

  actualizarNuevoEvaluadoNombre(valor: string) {
    this.nuevoEvaluadoExterno.update(e => ({ ...e, nombre: valor }));
  }

  actualizarNuevoEvaluadoEmail(valor: string) {
    this.nuevoEvaluadoExterno.update(e => ({ ...e, email: valor }));
  }

  agregarEvaluadoExterno() {
    const nuevo = this.nuevoEvaluadoExterno();
    if (!nuevo.nombre || !nuevo.email) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Complete nombre y email del evaluado' });
      return;
    }

    // Generar contraseña aleatoria visible para el creador
    const password = this.generarPasswordAleatorio();

    const evaluado: EvaluadoExterno = {
      id: crypto.randomUUID(),
      nombre: nuevo.nombre,
      email: nuevo.email,
      password: password,
      invitacionEnviada: false,
      haRespondido: false
    };

    this.nuevaAsignacion.update(a => ({
      ...a,
      evaluadosExternos: [...(a.evaluadosExternos || []), evaluado]
    }));
    this.nuevoEvaluadoExterno.set({ nombre: '', email: '' });
    this.messageService.add({ severity: 'success', summary: 'Agregado', detail: `Evaluado agregado. Contraseña: ${password}` });
  }

  // Genera una contraseña aleatoria de 8 caracteres
  generarPasswordAleatorio(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Copiar contraseña al portapapeles
  copiarPassword(password: string) {
    navigator.clipboard.writeText(password);
    this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Contraseña copiada al portapapeles' });
  }

  // Descargar template de Excel para evaluados externos
  descargarTemplateExcel() {
    // Crear contenido CSV como template
    const headers = 'Nombre,Email';
    const ejemplo1 = 'Juan Perez,juan.perez@ejemplo.com';
    const ejemplo2 = 'Maria Garcia,maria.garcia@ejemplo.com';
    const contenido = `${headers}\n${ejemplo1}\n${ejemplo2}`;

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_evaluados_externos.csv';
    link.click();
    URL.revokeObjectURL(link.href);

    this.messageService.add({ severity: 'success', summary: 'Descargado', detail: 'Template descargado. Complete los datos y suba el archivo.' });
  }

  // Procesar archivo Excel/CSV subido con evaluados externos
  onUploadEvaluadosExcel(event: any) {
    const file = event.files?.[0] || event.currentFiles?.[0];
    if (!file) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo leer el archivo' });
      return;
    }

    this.messageService.add({ severity: 'info', summary: 'Procesando', detail: `Procesando archivo ${file.name}...` });

    // Leer el archivo CSV
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const contenido = e.target.result as string;
      const lineas = contenido.split('\n').filter(l => l.trim());

      // Saltar la primera línea (encabezados)
      const datosEvaluados = lineas.slice(1);
      let agregados = 0;

      datosEvaluados.forEach(linea => {
        const [nombre, email] = linea.split(',').map(s => s.trim());
        if (nombre && email && email.includes('@')) {
          const evaluado: EvaluadoExterno = {
            id: crypto.randomUUID(),
            nombre: nombre,
            email: email,
            password: this.generarPasswordAleatorio(),
            invitacionEnviada: false,
            haRespondido: false
          };
          this.nuevaAsignacion.update(a => ({
            ...a,
            evaluadosExternos: [...(a.evaluadosExternos || []), evaluado]
          }));
          agregados++;
        }
      });

      if (agregados > 0) {
        this.messageService.add({ severity: 'success', summary: 'Importado', detail: `${agregados} evaluados importados exitosamente` });
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'No se encontraron datos válidos en el archivo' });
      }
    };

    reader.onerror = () => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al leer el archivo' });
    };

    reader.readAsText(file);
  }

  eliminarEvaluadoExterno(evaluadoId: string) {
    this.nuevaAsignacion.update(a => ({
      ...a,
      evaluadosExternos: (a.evaluadosExternos || []).filter(e => e.id !== evaluadoId)
    }));
  }

  enviarInvitacionEvaluado(evaluado: EvaluadoExterno) {
    // Simular envío de invitación
    this.nuevaAsignacion.update(a => ({
      ...a,
      evaluadosExternos: (a.evaluadosExternos || []).map(e =>
        e.id === evaluado.id ? { ...e, invitacionEnviada: true, fechaInvitacion: new Date() } : e
      )
    }));
    this.messageService.add({ severity: 'success', summary: 'Enviado', detail: `Invitación enviada a ${evaluado.email}` });
  }

  generarLinkAccesoExterno(): string {
    const token = crypto.randomUUID().substring(0, 8);
    this.nuevaAsignacion.update(a => ({ ...a, tokenAccesoExterno: token }));
    return `${window.location.origin}/cumplimiento/portal/${token}`;
  }

  copiarLinkAcceso() {
    const link = this.generarLinkAccesoExterno();
    navigator.clipboard.writeText(link);
    this.messageService.add({ severity: 'info', summary: 'Copiado', detail: 'Link de acceso copiado al portapapeles' });
  }

  // =============================================
  // METODOS - PORTAL EXTERNO
  // =============================================
  irAPortalExterno() {
    this.vistaActual.set('portal-externo');
  }

  actualizarLoginEmail(valor: string) {
    this.loginExterno.update(l => ({ ...l, email: valor }));
  }

  actualizarLoginPassword(valor: string) {
    this.loginExterno.update(l => ({ ...l, password: valor }));
  }

  loginUsuarioExterno() {
    const login = this.loginExterno();
    if (!login.email || !login.password) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Ingrese email y contraseña' });
      return;
    }

    // Para fines ilustrativos, acepta cualquier email/password
    const usuarioExterno: EvaluadoExterno = {
      id: crypto.randomUUID(),
      nombre: login.email.split('@')[0],
      email: login.email,
      invitacionEnviada: true,
      fechaInvitacion: new Date(),
      haRespondido: false
    };

    this.usuarioExternoAutenticado.set(usuarioExterno);
    this.messageService.add({ severity: 'success', summary: 'Bienvenido', detail: `Sesión iniciada como ${usuarioExterno.nombre}` });
  }

  logoutUsuarioExterno() {
    this.usuarioExternoAutenticado.set(null);
    this.loginExterno.set({ email: '', password: '' });
    this.vistaActual.set('dashboard');
  }

  // Obtener asignaciones disponibles para usuario externo
  asignacionesParaUsuarioExterno = computed(() => {
    const usuario = this.usuarioExternoAutenticado();
    if (!usuario) return [];

    return this.asignaciones().filter(a =>
      a.evaluadosExternos?.some(e => e.email === usuario.email) ||
      a.emailsExternos?.includes(usuario.email)
    );
  });

  // =============================================
  // METODOS - REVISION DE CUESTIONARIOS
  // =============================================

  // Modificar revisarCuestionario para cargar respuestas
  revisarCuestionario(asignacion: AsignacionCuestionario) {
    this.asignacionSeleccionada.set(asignacion);

    // Obtener lista de cuestionarios
    const cuestionarioIds = asignacion.cuestionarioIds?.length
      ? asignacion.cuestionarioIds
      : asignacion.cuestionarioId
        ? [asignacion.cuestionarioId]
        : [];

    // Seleccionar primer cuestionario
    if (cuestionarioIds.length > 0) {
      this.cuestionarioRevisionSeleccionadoId.set(cuestionarioIds[0]);
      const cuestionario = this.getCuestionario(cuestionarioIds[0]);
      if (cuestionario) {
        this.cuestionarioSeleccionado.set(cuestionario);
      }
    }

    // Seleccionar primer activo/proceso
    const activosProcesos = this.activosProcesosEnRevision();
    if (activosProcesos.length > 0) {
      this.activoProcesoSeleccionadoId.set(activosProcesos[0].id);
      this.cargarRespuestaActivoProceso(activosProcesos[0].id, cuestionarioIds[0]);
    } else {
      this.respuestaRevision.set(null);
    }

    this.comentarioGeneralRevisor.set('');
    this.vistaActual.set('revisar');
  }

  // Seleccionar cuestionario en sidebar
  seleccionarCuestionarioRevision(cuestionarioId: string) {
    this.cuestionarioRevisionSeleccionadoId.set(cuestionarioId);
    const cuestionario = this.getCuestionario(cuestionarioId);
    if (cuestionario) {
      this.cuestionarioSeleccionado.set(cuestionario);
    }
    // Recargar respuesta del activo/proceso actual con el nuevo cuestionario
    const activoProcesoId = this.activoProcesoSeleccionadoId();
    if (activoProcesoId) {
      this.cargarRespuestaActivoProceso(activoProcesoId, cuestionarioId);
    }
  }

  // Cargar respuesta de un activo/proceso para un cuestionario (legacy - no usar)
  cargarRespuestaActivoProcesoLegacy(activoProcesoId: string, cuestionarioId: string) {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    // Buscar respuesta existente
    let respuesta = this.respuestasCuestionarios().find(
      r => r.asignacionId === asignacion.id &&
           r.cuestionarioId === cuestionarioId &&
           r.respondidoPor === activoProcesoId
    );

    if (!respuesta) {
      // Crear respuesta mock con datos de ejemplo si no existe
      const cuestionario = this.getCuestionario(cuestionarioId);
      respuesta = {
        id: crypto.randomUUID(),
        asignacionId: asignacion.id,
        cuestionarioId: cuestionarioId,
        respondidoPor: activoProcesoId,
        fechaInicio: new Date(),
        fechaEnvio: new Date(),
        estado: 'enviado',
        respuestas: cuestionario?.secciones.flatMap(s => s.preguntas.map(p => ({
          preguntaId: p.id,
          valor: this.generarRespuestaMock(p.tipo),
          comentario: '',
          evidencias: [],
          marcadaParaRevision: false,
          estadoRevision: 'pendiente' as const,
          comentarioRevisor: ''
        }))) || [],
        puntuacionTotal: Math.floor(Math.random() * 40) + 60,
        nivelCumplimiento: 'aceptable',
        comentariosGenerales: ''
      };
    }

    this.respuestaRevision.set(respuesta);
  }

  // Generar respuesta mock segun tipo de pregunta
  generarRespuestaMock(tipo: string): string | number | null {
    switch (tipo) {
      case 'siNoNa': return ['Si', 'No', 'N/A'][Math.floor(Math.random() * 3)];
      case 'texto': return 'Respuesta de ejemplo para esta pregunta';
      case 'textoLargo': return 'Esta es una respuesta mas detallada que incluye multiples puntos de informacion relevante para la evaluacion.';
      case 'numero': return Math.floor(Math.random() * 100);
      case 'escala': return Math.floor(Math.random() * 5) + 1;
      case 'seleccionUnica': return 'Opcion seleccionada';
      case 'fecha': return new Date().toISOString();
      default: return 'Respuesta generica';
    }
  }

  // Calcular progreso de una respuesta
  calcularProgresoRespuesta(respuesta: RespuestaCuestionario): number {
    if (!respuesta.respuestas || respuesta.respuestas.length === 0) return 0;
    const respondidas = respuesta.respuestas.filter(r => r.valor !== null && r.valor !== '').length;
    return Math.round((respondidas / respuesta.respuestas.length) * 100);
  }

  // Obtener estado badge para activo/proceso
  getEstadoActivoProcesoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'aprobado': return 'success';
      case 'enviado': return 'info';
      case 'en_revision': return 'info';
      case 'borrador': return 'warn';
      case 'rechazado': return 'danger';
      default: return 'secondary';
    }
  }

  // Seleccionar activo/proceso en sidebar
  seleccionarActivoProceso(id: string) {
    this.activoProcesoSeleccionadoId.set(id);
    const cuestionarioId = this.cuestionarioRevisionSeleccionadoId();
    if (cuestionarioId) {
      this.cargarRespuestaActivoProceso(id, cuestionarioId);
    }
    // Cargar mensajes del chat para este activo/proceso
    this.cargarMensajesChat();
  }

  // Obtener nombre del activo/proceso seleccionado
  getActivoProcesoNombre(): string {
    const id = this.activoProcesoSeleccionadoId();
    if (!id) return 'Sin seleccionar';
    const item = this.activosProcesosEnRevision().find(ap => ap.id === id);
    return item?.nombre || 'Sin nombre';
  }

  // Obtener tipo del activo/proceso seleccionado
  getActivoProcesoSeleccionadoTipo(): 'activo' | 'proceso' | null {
    const id = this.activoProcesoSeleccionadoId();
    if (!id) return null;
    const item = this.activosProcesosEnRevision().find(ap => ap.id === id);
    return item?.tipo || null;
  }

  // Cargar respuesta para un activo/proceso
  cargarRespuestaActivoProceso(activoProcesoId: string, cuestionarioId: string) {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    let respuesta = this.respuestasCuestionarios().find(
      r => r.asignacionId === asignacion.id &&
           r.cuestionarioId === cuestionarioId &&
           (r as any).activoProcesoId === activoProcesoId
    );

    if (!respuesta) {
      const cuestionario = this.getCuestionario(cuestionarioId);
      respuesta = {
        id: crypto.randomUUID(),
        asignacionId: asignacion.id,
        cuestionarioId: cuestionarioId,
        respondidoPor: asignacion.usuariosAsignados?.[0] || 'user1',
        fechaInicio: new Date(),
        fechaEnvio: new Date(),
        estado: 'enviado',
        respuestas: cuestionario?.secciones.flatMap(s => s.preguntas.map(p => ({
          preguntaId: p.id,
          valor: this.generarRespuestaMock(p.tipo),
          comentario: '',
          evidencias: [],
          marcadaParaRevision: false,
          estadoRevision: 'pendiente' as const,
          comentarioRevisor: ''
        }))) || [],
        puntuacionTotal: Math.floor(Math.random() * 40) + 60,
        nivelCumplimiento: 'aceptable',
        comentariosGenerales: ''
      } as any;
      (respuesta as any).activoProcesoId = activoProcesoId;
    }

    this.respuestaRevision.set(respuesta || null);
  }

  // =============================================
  // METODOS - CHAT
  // =============================================

  toggleChatSidebar() {
    this.showChatSidebar.update(v => !v);
    if (this.showChatSidebar()) {
      this.cargarMensajesChat();
    }
  }

  cargarMensajesChat() {
    const asignacion = this.asignacionSeleccionada();
    const cuestionarioId = this.cuestionarioRevisionSeleccionadoId();
    const activoProcesoId = this.activoProcesoSeleccionadoId();

    if (!asignacion) return;

    // Cargar mensajes mock o existentes
    const mensajesMock: MensajeChat[] = [
      {
        id: '1',
        asignacionId: asignacion.id,
        cuestionarioId: cuestionarioId || undefined,
        activoProcesoId: activoProcesoId || undefined,
        usuarioId: 'user1',
        usuarioNombre: 'Maria Garcia',
        usuarioRol: 'evaluador',
        mensaje: 'He completado la evaluacion del primer control. Adjunte las evidencias correspondientes.',
        fecha: new Date(Date.now() - 3600000 * 2),
        leido: true
      },
      {
        id: '2',
        asignacionId: asignacion.id,
        cuestionarioId: cuestionarioId || undefined,
        activoProcesoId: activoProcesoId || undefined,
        usuarioId: 'user2',
        usuarioNombre: 'Carlos Lopez',
        usuarioRol: 'aprobador',
        mensaje: 'Gracias Maria. Revise la evidencia del control 3, parece que falta el documento de aprobacion.',
        fecha: new Date(Date.now() - 3600000),
        leido: true
      },
      {
        id: '3',
        asignacionId: asignacion.id,
        cuestionarioId: cuestionarioId || undefined,
        activoProcesoId: activoProcesoId || undefined,
        usuarioId: 'user1',
        usuarioNombre: 'Maria Garcia',
        usuarioRol: 'evaluador',
        mensaje: 'Tiene razon, lo adjunto ahora mismo.',
        fecha: new Date(Date.now() - 1800000),
        leido: true
      }
    ];

    this.mensajesChat.set(mensajesMock);
  }

  enviarMensajeChat() {
    const mensaje = this.mensajeChat().trim();
    if (!mensaje) return;

    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return;

    const nuevoMensaje: MensajeChat = {
      id: crypto.randomUUID(),
      asignacionId: asignacion.id,
      cuestionarioId: this.cuestionarioRevisionSeleccionadoId() || undefined,
      activoProcesoId: this.activoProcesoSeleccionadoId() || undefined,
      usuarioId: this.usuarioActual().id,
      usuarioNombre: this.usuarioActual().nombre,
      usuarioRol: this.usuarioActual().rol,
      mensaje: mensaje,
      fecha: new Date(),
      leido: false
    };

    this.mensajesChat.update(msgs => [...msgs, nuevoMensaje]);
    this.mensajeChat.set('');
  }

  getMensajeHora(fecha: Date): string {
    return new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  esMensajePropio(mensaje: MensajeChat): boolean {
    return mensaje.usuarioId === this.usuarioActual().id;
  }

  getMensajesNoLeidos(): number {
    return this.mensajesChat().filter(m => !m.leido && m.usuarioId !== this.usuarioActual().id).length;
  }

  // Obtener respuesta de una pregunta especifica
  getRespuestaRevisionPregunta(preguntaId: string): RespuestaPregunta | undefined {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return undefined;
    return respuesta.respuestas.find(r => r.preguntaId === preguntaId);
  }

  // Obtener nombre del evaluado
  getEvaluadoNombre(): string {
    const asignacion = this.asignacionSeleccionada();
    if (!asignacion) return 'Desconocido';

    if (asignacion.usuariosAsignadosNombres?.length > 0) {
      return asignacion.usuariosAsignadosNombres[0];
    }
    if (asignacion.evaluadosExternos?.length > 0) {
      return asignacion.evaluadosExternos[0].nombre;
    }
    return 'Evaluado';
  }

  // Estadisticas de respuestas
  getRespuestasContestadas(): number {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return 0;
    return respuesta.respuestas.filter(r => r.valor !== null && r.valor !== '').length;
  }

  getRespuestasAprobadas(): number {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return 0;
    return respuesta.respuestas.filter(r => r.estadoRevision === 'aprobada').length;
  }

  getRespuestasRechazadas(): number {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return 0;
    return respuesta.respuestas.filter(r => r.estadoRevision === 'rechazada').length;
  }

  getRespuestasPendientesRevision(): number {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return 0;
    return respuesta.respuestas.filter(r => r.estadoRevision === 'pendiente' || !r.estadoRevision).length;
  }

  // Obtener label del tipo de pregunta
  getTipoPreguntaLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'texto': 'Texto',
      'textoLargo': 'Texto Largo',
      'siNoNa': 'Si/No/N.A.',
      'seleccionUnica': 'Seleccion Unica',
      'opcionMultiple': 'Opcion Multiple',
      'escala': 'Escala',
      'fecha': 'Fecha',
      'numero': 'Numero',
      'archivo': 'Archivo',
      'matriz': 'Matriz',
      'grupo': 'Grupo',
      'radioButtons': 'Radio Buttons',
      'calculado': 'Calculado',
      'url': 'URL'
    };
    return labels[tipo] || tipo;
  }

  // Aprobar una respuesta individual
  aprobarRespuesta(preguntaId: string) {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return;

    const respuestaPregunta = respuesta.respuestas.find(r => r.preguntaId === preguntaId);
    if (respuestaPregunta) {
      respuestaPregunta.estadoRevision = 'aprobada';
      respuestaPregunta.comentarioRevisor = '';
      this.respuestaRevision.set({ ...respuesta });
      this.messageService.add({ severity: 'success', summary: 'Aprobada', detail: 'Respuesta aprobada correctamente' });
    }
  }

  // Abrir dialog de rechazo
  abrirDialogRechazo(preguntaId: string) {
    this.preguntaRechazoId.set(preguntaId);
    this.comentarioRechazo.set('');
    this.showDialogRechazo.set(true);
  }

  cerrarDialogRechazo() {
    this.showDialogRechazo.set(false);
    this.preguntaRechazoId.set(null);
    this.comentarioRechazo.set('');
  }

  confirmarRechazo() {
    const preguntaId = this.preguntaRechazoId();
    const comentario = this.comentarioRechazo();
    const respuesta = this.respuestaRevision();

    if (!preguntaId || !comentario || !respuesta) return;

    const respuestaPregunta = respuesta.respuestas.find(r => r.preguntaId === preguntaId);
    if (respuestaPregunta) {
      respuestaPregunta.estadoRevision = 'rechazada';
      respuestaPregunta.comentarioRevisor = comentario;
      this.respuestaRevision.set({ ...respuesta });
      this.messageService.add({ severity: 'warn', summary: 'Rechazada', detail: 'Respuesta rechazada con comentario' });
    }

    this.cerrarDialogRechazo();
  }

  // Solicitar aclaracion
  solicitarAclaracion(preguntaId: string) {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return;

    const respuestaPregunta = respuesta.respuestas.find(r => r.preguntaId === preguntaId);
    if (respuestaPregunta) {
      respuestaPregunta.estadoRevision = 'requiere_aclaracion';
      this.respuestaRevision.set({ ...respuesta });
      this.messageService.add({ severity: 'info', summary: 'Aclaracion', detail: 'Se ha solicitado aclaracion al evaluado' });
    }
  }

  // Resetear estado de respuesta
  resetearEstadoRespuesta(preguntaId: string) {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return;

    const respuestaPregunta = respuesta.respuestas.find(r => r.preguntaId === preguntaId);
    if (respuestaPregunta) {
      respuestaPregunta.estadoRevision = 'pendiente';
      respuestaPregunta.comentarioRevisor = '';
      this.respuestaRevision.set({ ...respuesta });
      this.messageService.add({ severity: 'info', summary: 'Resetado', detail: 'Estado de respuesta restablecido' });
    }
  }

  // Acciones masivas
  abrirDialogAprobarTodo() {
    this.accionMasivaAprobacion.set(true);
    this.comentarioAccionMasiva.set('');
    this.showDialogAccionMasiva.set(true);
  }

  abrirDialogRechazarTodo() {
    this.accionMasivaAprobacion.set(false);
    this.comentarioAccionMasiva.set('');
    this.showDialogAccionMasiva.set(true);
  }

  cerrarDialogAccionMasiva() {
    this.showDialogAccionMasiva.set(false);
    this.comentarioAccionMasiva.set('');
  }

  confirmarAccionMasiva() {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return;

    const esAprobacion = this.accionMasivaAprobacion();
    const comentario = this.comentarioAccionMasiva();

    respuesta.respuestas.forEach(r => {
      if (r.estadoRevision === 'pendiente' || !r.estadoRevision) {
        r.estadoRevision = esAprobacion ? 'aprobada' : 'rechazada';
        r.comentarioRevisor = comentario;
      }
    });

    this.respuestaRevision.set({ ...respuesta });

    if (esAprobacion) {
      this.messageService.add({ severity: 'success', summary: 'Aprobado', detail: 'Todas las respuestas pendientes han sido aprobadas' });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Rechazado', detail: 'Todas las respuestas pendientes han sido rechazadas' });
    }

    this.cerrarDialogAccionMasiva();
  }

  // Guardar revision
  guardarRevision() {
    const respuesta = this.respuestaRevision();
    if (!respuesta) return;

    // Actualizar en la lista de respuestas
    this.respuestasCuestionarios.update(lista => {
      const idx = lista.findIndex(r => r.id === respuesta.id);
      if (idx >= 0) {
        lista[idx] = { ...respuesta };
      } else {
        lista.push(respuesta);
      }
      return [...lista];
    });

    this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Revision guardada correctamente' });
  }

  // Finalizar revision
  finalizarRevision() {
    const respuesta = this.respuestaRevision();
    const asignacion = this.asignacionSeleccionada();

    if (!respuesta || !asignacion) return;

    // Verificar que no hay respuestas pendientes
    if (this.getRespuestasPendientesRevision() > 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Debe revisar todas las respuestas antes de finalizar' });
      return;
    }

    // Actualizar estado de respuesta
    respuesta.estado = this.getRespuestasRechazadas() > 0 ? 'rechazado' : 'aprobado';

    // Actualizar asignacion
    asignacion.estado = 'revisado';

    // Guardar cambios
    this.respuestasCuestionarios.update(lista => {
      const idx = lista.findIndex(r => r.id === respuesta.id);
      if (idx >= 0) {
        lista[idx] = { ...respuesta };
      }
      return [...lista];
    });

    this.asignaciones.update(lista => lista.map(a => a.id === asignacion.id ? { ...asignacion } : a));

    // Registrar en historial
    const nuevoRegistro: HistorialAuditoria = {
      id: crypto.randomUUID(),
      fecha: new Date(),
      accion: 'validacion',
      entidadTipo: 'respuesta',
      entidadId: respuesta.id,
      entidadNombre: asignacion.titulo,
      usuario: 'Revisor Actual',
      detalles: `Revision finalizada. Aprobadas: ${this.getRespuestasAprobadas()}, Rechazadas: ${this.getRespuestasRechazadas()}`
    };
    this.historial.update(lista => [nuevoRegistro, ...lista]);

    this.messageService.add({ severity: 'success', summary: 'Finalizado', detail: 'Revision completada exitosamente' });
    this.irADashboard();
  }
}
