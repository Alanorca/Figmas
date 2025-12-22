import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { NotificationsService } from '../../services/notifications.service';

// Tipos para alertas
type AlertSeverity = 'info' | 'warning' | 'critical';
type NotificationChannel = 'email' | 'in-app' | 'webhook';
type EvaluationFrequency = 'inmediata' | 'diaria' | 'semanal' | 'mensual';
type AlertStatus = 'activa' | 'atendida' | 'resuelta';

// Interfaz de Alerta KPI
interface KPIAlert {
  id: string;
  kpiId: string;
  kpiNombre: string;
  objetivoId: string;
  objetivoNombre: string;
  severity: AlertSeverity;
  mensaje: string;
  valorActual: number;
  valorUmbral: number;
  tipoViolacion: 'bajo_minimo' | 'sobre_maximo';
  status: AlertStatus;
  fechaCreacion: Date;
  fechaAtendida?: Date;
  atendidaPor?: string;
  comentarioResolucion?: string;
  notificacionesEnviadas: { channel: NotificationChannel; fecha: Date; exitosa: boolean }[];
}

// Interfaces
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

@Component({
  selector: 'app-objetivos-kpis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TagModule,
    ToastModule,
    DialogModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './objetivos-kpis.html',
  styleUrl: './objetivos-kpis.scss'
})
export class ObjetivosKpisComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private notificationsService = inject(NotificationsService);

  // Modo de la página
  modo = signal<'ver' | 'editar'>('ver');
  procesoId = signal<string | null>(null);
  procesoNombre = signal('Proceso de Gestión de Riesgos');

  // Estado
  objetivoSeleccionadoId = signal<string | null>(null);
  busquedaObjetivos = signal('');

  // Objetivos con KPIs
  objetivos = signal<Objetivo[]>([
    {
      id: '1',
      nombre: 'Reducir riesgos Operacionales',
      descripcion: 'Evaluación de riesgos financieros, desarrollo de estrategias de mitigación, coordinación de auditorías y fortalecimiento de controles internos.',
      tipo: 'estrategico',
      progreso: 50,
      kpis: [
        { id: 'KPI-001', nombre: 'Índice de Riesgo Operacional', meta: 5, actual: 3, escala: 'Escala 1-5', umbralAlerta: 50, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'diaria', direccion: 'menor_mejor' },
        { id: 'KPI-002', nombre: 'Pérdidas por Riesgo Operacional', meta: 5, actual: 2, escala: '%', umbralAlerta: 50, umbralMaximo: null, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'inmediata', direccion: 'menor_mejor' },
        { id: 'KPI-003', nombre: 'Tiempo de Resolución de Incidentes', meta: 5, actual: 4, escala: 'Horas', umbralAlerta: 50, umbralMaximo: 120, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'diaria', direccion: 'menor_mejor' },
        { id: 'KPI-004', nombre: 'Cumplimiento de Auditorías', meta: 100, actual: 75, escala: '%', umbralAlerta: 70, umbralMaximo: null, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' },
        { id: 'KPI-005', nombre: 'Capacitaciones en Gestión de Riesgos', meta: 100, actual: 60, escala: '%', umbralAlerta: 70, umbralMaximo: null, severidad: 'info', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'mensual', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: '2',
      nombre: 'Incrementar rentabilidad financiera',
      descripcion: 'Optimización de la cartera crediticia, diversificación de ingresos, mejora del margen financiero y reducción de costos operativos.',
      tipo: 'operativo',
      progreso: 75,
      kpis: []
    },
    {
      id: '3',
      nombre: 'Mejora experiencia del cliente',
      descripcion: 'Expansión de mercado, desarrollo de nuevos productos, captación de clientes y consolidación de la participación sectorial.',
      tipo: 'estrategico',
      progreso: 80,
      kpis: [
        { id: 'KPI-006', nombre: 'NPS Score', meta: 75, actual: 68, escala: '%', umbralAlerta: 60, umbralMaximo: null, severidad: 'warning', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'semanal', direccion: 'mayor_mejor' },
        { id: 'KPI-007', nombre: 'Tiempo de respuesta', meta: 24, actual: 18, escala: 'Horas', umbralAlerta: 50, umbralMaximo: 48, severidad: 'critical', canalesNotificacion: ['in-app', 'email', 'webhook'], frecuenciaEvaluacion: 'inmediata', direccion: 'menor_mejor' }
      ]
    },
    {
      id: '4',
      nombre: 'Fortalecer posicionamiento competitivo',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'operativo',
      progreso: 30,
      kpis: [
        { id: 'KPI-008', nombre: 'Market Share', meta: 15, actual: 8, escala: '%', umbralAlerta: 50, umbralMaximo: null, severidad: 'info', canalesNotificacion: ['in-app'], frecuenciaEvaluacion: 'mensual', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: '5',
      nombre: 'Garantizar el cumplimiento regulatorio',
      descripcion: 'Adherencia a normativas financieras, prevención de lavado de activos, protección de datos y mantenimiento de ratios prudenciales.',
      tipo: 'operativo',
      progreso: 55,
      kpis: [
        { id: 'KPI-009', nombre: 'Cumplimiento normativo', meta: 100, actual: 85, escala: '%', umbralAlerta: 80, umbralMaximo: null, severidad: 'critical', canalesNotificacion: ['in-app', 'email'], frecuenciaEvaluacion: 'diaria', direccion: 'mayor_mejor' }
      ]
    },
    {
      id: '6',
      nombre: 'Optimizar gestión del talento humano',
      descripcion: 'Desarrollo profesional, retención de talento, cultura organizacional y productividad del equipo humano.',
      tipo: 'estrategico',
      progreso: 65,
      kpis: []
    }
  ]);

  // ========== ALERTAS ==========
  alertas = signal<KPIAlert[]>([
    {
      id: 'ALERT-001',
      kpiId: 'KPI-004',
      kpiNombre: 'Cumplimiento de Auditorías',
      objetivoId: '1',
      objetivoNombre: 'Reducir riesgos Operacionales',
      severity: 'critical',
      mensaje: 'El cumplimiento de auditorías está por debajo del umbral crítico (70%)',
      valorActual: 75,
      valorUmbral: 70,
      tipoViolacion: 'bajo_minimo',
      status: 'activa',
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      notificacionesEnviadas: [
        { channel: 'in-app', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), exitosa: true },
        { channel: 'email', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), exitosa: true }
      ]
    },
    {
      id: 'ALERT-002',
      kpiId: 'KPI-005',
      kpiNombre: 'Capacitaciones en Gestión de Riesgos',
      objetivoId: '1',
      objetivoNombre: 'Reducir riesgos Operacionales',
      severity: 'warning',
      mensaje: 'Las capacitaciones están por debajo del objetivo (60% vs 70%)',
      valorActual: 60,
      valorUmbral: 70,
      tipoViolacion: 'bajo_minimo',
      status: 'activa',
      fechaCreacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notificacionesEnviadas: [
        { channel: 'in-app', fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), exitosa: true }
      ]
    },
    {
      id: 'ALERT-003',
      kpiId: 'KPI-008',
      kpiNombre: 'Market Share',
      objetivoId: '4',
      objetivoNombre: 'Fortalecer posicionamiento competitivo',
      severity: 'info',
      mensaje: 'El Market Share está por debajo del objetivo esperado',
      valorActual: 53,
      valorUmbral: 50,
      tipoViolacion: 'bajo_minimo',
      status: 'atendida',
      fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fechaAtendida: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      atendidaPor: 'María García',
      comentarioResolucion: 'Se están implementando nuevas estrategias de mercado para Q1 2025. Se espera mejora gradual.',
      notificacionesEnviadas: [
        { channel: 'in-app', fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), exitosa: true }
      ]
    },
    {
      id: 'ALERT-004',
      kpiId: 'KPI-009',
      kpiNombre: 'Cumplimiento normativo',
      objetivoId: '5',
      objetivoNombre: 'Garantizar el cumplimiento regulatorio',
      severity: 'critical',
      mensaje: 'Cumplimiento normativo por debajo del umbral requerido (85% vs 80%)',
      valorActual: 85,
      valorUmbral: 80,
      tipoViolacion: 'bajo_minimo',
      status: 'activa',
      fechaCreacion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      notificacionesEnviadas: [
        { channel: 'in-app', fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), exitosa: true },
        { channel: 'email', fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), exitosa: true }
      ]
    }
  ]);

  // Tab activo en la sección de detalle
  tabActivo = signal<'kpis' | 'alertas'>('kpis');

  // Filtros para alertas
  filtroAlertaSeveridad = signal<AlertSeverity | null>(null);
  filtroAlertaStatus = signal<AlertStatus | null>(null);
  busquedaAlertas = signal('');

  // Dialog para atender alerta
  showAtenderAlertaDialog = signal(false);
  alertaSeleccionada = signal<KPIAlert | null>(null);
  comentarioAtencion = signal('');

  // Alertas filtradas
  alertasFiltradas = computed(() => {
    let resultado = this.alertas();

    const objetivoId = this.objetivoSeleccionadoId();
    if (objetivoId) {
      resultado = resultado.filter(a => a.objetivoId === objetivoId);
    }

    const severidad = this.filtroAlertaSeveridad();
    if (severidad) {
      resultado = resultado.filter(a => a.severity === severidad);
    }

    const status = this.filtroAlertaStatus();
    if (status) {
      resultado = resultado.filter(a => a.status === status);
    }

    const busqueda = this.busquedaAlertas().toLowerCase();
    if (busqueda) {
      resultado = resultado.filter(a =>
        a.kpiNombre.toLowerCase().includes(busqueda) ||
        a.mensaje.toLowerCase().includes(busqueda)
      );
    }

    return resultado;
  });

  // Contadores de alertas
  alertasActivasCount = computed(() =>
    this.alertas().filter(a => a.status === 'activa').length
  );

  alertasDelObjetivo = computed(() => {
    const objetivoId = this.objetivoSeleccionadoId();
    if (!objetivoId) return [];
    return this.alertas().filter(a => a.objetivoId === objetivoId);
  });

  tieneAlertasActivas = computed(() =>
    this.alertasDelObjetivo().some(a => a.status === 'activa')
  );

  alertasActivasDelObjetivoCount = computed(() =>
    this.alertasDelObjetivo().filter(a => a.status === 'activa').length
  );

  tieneAlertaCriticaActiva = computed(() =>
    this.alertasDelObjetivo().some(a => a.severity === 'critical' && a.status === 'activa')
  );

  // Objetivo seleccionado
  objetivoSeleccionado = computed(() => {
    const id = this.objetivoSeleccionadoId();
    if (!id) return null;
    return this.objetivos().find(o => o.id === id) || null;
  });

  // Objetivos filtrados
  objetivosFiltrados = computed(() => {
    const busqueda = this.busquedaObjetivos().toLowerCase();
    if (!busqueda) return this.objetivos();
    return this.objetivos().filter(o =>
      o.nombre.toLowerCase().includes(busqueda) ||
      o.descripcion.toLowerCase().includes(busqueda)
    );
  });

  // Estados de edición
  editandoObjetivo = signal(false);
  editandoKPIId = signal<string | null>(null);
  nuevoKPI = signal(false);

  // Form values
  formNombre = signal('');
  formDescripcion = signal('');
  formTipo = signal<'estrategico' | 'operativo'>('estrategico');
  formKPINombre = signal('');
  formKPIMeta = signal<number>(75);
  formKPIActual = signal<number>(0);
  formKPIEscala = signal('Porcentaje');
  formKPIUmbralAlerta = signal<number>(50);
  formKPIDireccion = signal<'mayor_mejor' | 'menor_mejor'>('mayor_mejor');

  escalasOptions = [
    { label: 'Porcentaje', value: 'Porcentaje' },
    { label: '%', value: '%' },
    { label: 'Unidades', value: 'Unidades' },
    { label: 'Días', value: 'Días' },
    { label: 'Horas', value: 'Horas' },
    { label: 'Escala 1-5', value: 'Escala 1-5' },
    { label: 'USD', value: 'USD' }
  ];

  direccionOptions = [
    { label: 'Mejor si es más', value: 'mayor_mejor' },
    { label: 'Mejor si es menos', value: 'menor_mejor' }
  ];

  severidadOptions = [
    { label: 'Info', value: 'info' },
    { label: 'Warning', value: 'warning' },
    { label: 'Critical', value: 'critical' }
  ];

  frecuenciaOptions = [
    { label: 'Inmediata', value: 'inmediata' },
    { label: 'Diaria', value: 'diaria' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' }
  ];

  // Signals para formulario KPI extendido
  formKPIUmbralMaximo = signal<number | null>(null);
  formKPISeveridad = signal<AlertSeverity>('warning');
  formKPICanales = signal<NotificationChannel[]>(['in-app']);
  formKPIFrecuencia = signal<EvaluationFrequency>('diaria');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const modoParam = this.route.snapshot.queryParamMap.get('modo');

    if (id) {
      this.procesoId.set(id);
    }

    if (modoParam === 'editar') {
      this.modo.set('editar');
    }

    // Seleccionar primer objetivo
    if (this.objetivos().length > 0) {
      this.objetivoSeleccionadoId.set(this.objetivos()[0].id);
    }
  }

  // Navegación
  volver(): void {
    const id = this.procesoId();
    if (id) {
      this.router.navigate(['/procesos', id, 'detalle']);
    } else {
      this.router.navigate(['/procesos']);
    }
  }

  cambiarModo(nuevoModo: 'ver' | 'editar'): void {
    this.modo.set(nuevoModo);
    if (nuevoModo === 'editar' && this.objetivoSeleccionado()) {
      this.iniciarEdicionObjetivo();
    } else {
      this.resetEditStates();
    }
  }

  seleccionarObjetivo(objetivoId: string): void {
    this.objetivoSeleccionadoId.set(objetivoId);
    this.resetEditStates();
  }

  resetEditStates(): void {
    this.editandoObjetivo.set(false);
    this.editandoKPIId.set(null);
    this.nuevoKPI.set(false);
  }

  // CRUD Objetivos
  iniciarEdicionObjetivo(): void {
    const obj = this.objetivoSeleccionado();
    if (obj) {
      this.formNombre.set(obj.nombre);
      this.formDescripcion.set(obj.descripcion);
      this.formTipo.set(obj.tipo);
      this.editandoObjetivo.set(true);
    }
  }

  cancelarEdicionObjetivo(): void {
    this.editandoObjetivo.set(false);
  }

  guardarObjetivo(): void {
    const id = this.objetivoSeleccionadoId();
    if (!id || !this.formNombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre es requerido' });
      return;
    }

    this.objetivos.update(list =>
      list.map(o =>
        o.id === id
          ? {
              ...o,
              nombre: this.formNombre(),
              descripcion: this.formDescripcion(),
              tipo: this.formTipo()
            }
          : o
      )
    );
    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Objetivo actualizado correctamente' });
    this.editandoObjetivo.set(false);
  }

  eliminarObjetivo(): void {
    const id = this.objetivoSeleccionadoId();
    if (!id) return;

    this.objetivos.update(list => list.filter(o => o.id !== id));
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Objetivo eliminado' });

    const remaining = this.objetivos();
    if (remaining.length > 0) {
      this.objetivoSeleccionadoId.set(remaining[0].id);
    } else {
      this.objetivoSeleccionadoId.set(null);
    }
    this.resetEditStates();
  }

  crearObjetivo(): void {
    const nuevoObjetivo: Objetivo = {
      id: `OBJ-${Date.now()}`,
      nombre: 'Nuevo Objetivo',
      descripcion: '',
      tipo: 'estrategico',
      progreso: 0,
      kpis: []
    };
    this.objetivos.update(list => [...list, nuevoObjetivo]);
    this.objetivoSeleccionadoId.set(nuevoObjetivo.id);
    this.iniciarEdicionObjetivo();
  }

  // CRUD KPIs
  iniciarNuevoKPI(): void {
    this.formKPINombre.set('');
    this.formKPIMeta.set(75);
    this.formKPIActual.set(0);
    this.formKPIEscala.set('Porcentaje');
    this.formKPIUmbralAlerta.set(50);
    this.formKPIUmbralMaximo.set(null);
    this.formKPISeveridad.set('warning');
    this.formKPICanales.set(['in-app']);
    this.formKPIFrecuencia.set('diaria');
    this.formKPIDireccion.set('mayor_mejor');
    this.nuevoKPI.set(true);
    this.editandoKPIId.set(null);
  }

  iniciarEdicionKPI(kpi: KPI): void {
    this.formKPINombre.set(kpi.nombre);
    this.formKPIMeta.set(kpi.meta);
    this.formKPIActual.set(kpi.actual);
    this.formKPIEscala.set(kpi.escala);
    this.formKPIUmbralAlerta.set(kpi.umbralAlerta);
    this.formKPIUmbralMaximo.set(kpi.umbralMaximo);
    this.formKPISeveridad.set(kpi.severidad);
    this.formKPICanales.set([...kpi.canalesNotificacion]);
    this.formKPIFrecuencia.set(kpi.frecuenciaEvaluacion);
    this.formKPIDireccion.set(kpi.direccion);
    this.editandoKPIId.set(kpi.id);
    this.nuevoKPI.set(false);
  }

  cancelarKPI(): void {
    this.nuevoKPI.set(false);
    this.editandoKPIId.set(null);
  }

  guardarKPI(): void {
    const objetivoId = this.objetivoSeleccionadoId();
    if (!objetivoId || !this.formKPINombre().trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre del KPI es requerido' });
      return;
    }

    const editandoId = this.editandoKPIId();
    const kpi: KPI = {
      id: editandoId || `KPI-${Date.now()}`,
      nombre: this.formKPINombre(),
      meta: this.formKPIMeta(),
      actual: this.formKPIActual(),
      escala: this.formKPIEscala(),
      umbralAlerta: this.formKPIUmbralAlerta(),
      umbralMaximo: this.formKPIUmbralMaximo(),
      severidad: this.formKPISeveridad(),
      canalesNotificacion: this.formKPICanales(),
      frecuenciaEvaluacion: this.formKPIFrecuencia(),
      direccion: this.formKPIDireccion()
    };

    if (editandoId) {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: o.kpis.map(k => k.id === kpi.id ? kpi : k) }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'KPI actualizado' });
    } else {
      this.objetivos.update(list =>
        list.map(o =>
          o.id === objetivoId
            ? { ...o, kpis: [...o.kpis, kpi] }
            : o
        )
      );
      this.messageService.add({ severity: 'success', summary: 'Agregado', detail: 'KPI agregado' });
    }

    // Verificar y generar alertas si el KPI viola los umbrales
    this.evaluarYGenerarAlerta(kpi, objetivoId);

    this.cancelarKPI();
  }

  // Evaluar KPI y generar alerta si viola umbrales
  private evaluarYGenerarAlerta(kpi: KPI, objetivoId: string): void {
    const objetivo = this.objetivos().find(o => o.id === objetivoId);
    if (!objetivo) return;

    const progreso = kpi.meta > 0 ? (kpi.actual / kpi.meta) * 100 : 0;
    let violacion: 'bajo_minimo' | 'sobre_maximo' | null = null;
    let valorUmbral = 0;

    // Verificar umbral mínimo
    if (progreso < kpi.umbralAlerta) {
      violacion = 'bajo_minimo';
      valorUmbral = kpi.umbralAlerta;
    }
    // Verificar umbral máximo (si está definido)
    else if (kpi.umbralMaximo !== null && progreso > kpi.umbralMaximo) {
      violacion = 'sobre_maximo';
      valorUmbral = kpi.umbralMaximo;
    }

    if (violacion) {
      const mensaje = violacion === 'bajo_minimo'
        ? `El KPI "${kpi.nombre}" está por debajo del umbral mínimo (${progreso.toFixed(1)}% < ${valorUmbral}%)`
        : `El KPI "${kpi.nombre}" excede el umbral máximo (${progreso.toFixed(1)}% > ${valorUmbral}%)`;

      // Enviar al servicio de notificaciones
      this.notificationsService.addKPIAlert({
        kpiId: kpi.id,
        kpiNombre: kpi.nombre,
        objetivoId: objetivoId,
        objetivoNombre: objetivo.nombre,
        severity: kpi.severidad,
        mensaje: mensaje,
        valorActual: progreso,
        valorUmbral: valorUmbral,
        tipoViolacion: violacion
      });

      // También agregar a las alertas locales
      const nuevaAlerta: KPIAlert = {
        id: `alert-${Date.now()}`,
        kpiId: kpi.id,
        kpiNombre: kpi.nombre,
        objetivoId: objetivoId,
        objetivoNombre: objetivo.nombre,
        severity: kpi.severidad,
        mensaje: mensaje,
        valorActual: progreso,
        valorUmbral: valorUmbral,
        tipoViolacion: violacion,
        status: 'activa',
        fechaCreacion: new Date(),
        notificacionesEnviadas: kpi.canalesNotificacion.map(channel => ({
          channel,
          fecha: new Date(),
          exitosa: true
        }))
      };

      this.alertas.update(list => [nuevaAlerta, ...list]);

      // Mostrar toast de alerta
      const severityMap: Record<AlertSeverity, 'info' | 'warn' | 'error'> = {
        info: 'info',
        warning: 'warn',
        critical: 'error'
      };

      this.messageService.add({
        severity: severityMap[kpi.severidad],
        summary: `Alerta ${this.getSeverityLabel(kpi.severidad)}`,
        detail: mensaje,
        life: 5000
      });
    }
  }

  eliminarKPI(kpiId: string): void {
    const objetivoId = this.objetivoSeleccionadoId();
    if (!objetivoId) return;

    this.objetivos.update(list =>
      list.map(o =>
        o.id === objetivoId
          ? { ...o, kpis: o.kpis.filter(k => k.id !== kpiId) }
          : o
      )
    );
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'KPI eliminado' });
  }

  // Helpers
  getProgresoColor(progreso: number): string {
    if (progreso >= 66) return 'progress-green';
    if (progreso >= 33) return 'progress-yellow';
    return 'progress-red';
  }

  getTipoLabel(tipo: string): string {
    return tipo === 'estrategico' ? 'Estratégico' : 'Operativo';
  }

  getKPIProgreso(kpi: KPI): number {
    if (kpi.meta === 0) return 0;

    if (kpi.direccion === 'menor_mejor') {
      // Para "mejor si es menos": si actual <= meta, es 100% o más
      // Si actual > meta, el progreso disminuye proporcionalmente
      if (kpi.actual <= kpi.meta) {
        return 100;
      }
      // Cuanto más exceda la meta, menos progreso (invertido)
      const exceso = (kpi.actual - kpi.meta) / kpi.meta;
      return Math.max(0, Math.round((1 - exceso) * 100));
    }

    // Para "mejor si es más": comportamiento normal
    const progreso = Math.round((kpi.actual / kpi.meta) * 100);
    return Math.min(progreso, 100);
  }

  tieneAlertaKPI(kpi: KPI): boolean {
    const progreso = this.getKPIProgreso(kpi);
    return progreso < kpi.umbralAlerta;
  }

  getDireccionLabel(direccion: 'mayor_mejor' | 'menor_mejor'): string {
    return direccion === 'mayor_mejor' ? 'Mejor +' : 'Mejor -';
  }

  // ========== MÉTODOS PARA ALERTAS ==========
  getSeverityLabel(severity: AlertSeverity): string {
    const labels: Record<AlertSeverity, string> = {
      'info': 'Info',
      'warning': 'Warning',
      'critical': 'Crítico'
    };
    return labels[severity];
  }

  getStatusLabel(status: AlertStatus): string {
    const labels: Record<AlertStatus, string> = {
      'activa': 'Activa',
      'atendida': 'Atendida',
      'resuelta': 'Resuelta'
    };
    return labels[status];
  }

  isChannelSelected(channel: NotificationChannel): boolean {
    return this.formKPICanales().includes(channel);
  }

  toggleChannel(channel: NotificationChannel): void {
    this.formKPICanales.update(channels => {
      if (channels.includes(channel)) {
        return channels.filter(c => c !== channel);
      }
      return [...channels, channel];
    });
  }

  abrirAtenderAlerta(alerta: KPIAlert): void {
    this.alertaSeleccionada.set(alerta);
    this.comentarioAtencion.set('');
    this.showAtenderAlertaDialog.set(true);
  }

  cancelarAtencion(): void {
    this.showAtenderAlertaDialog.set(false);
    this.alertaSeleccionada.set(null);
    this.comentarioAtencion.set('');
  }

  confirmarAtencion(): void {
    const alerta = this.alertaSeleccionada();
    const comentario = this.comentarioAtencion();

    if (!alerta || !comentario.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El comentario es requerido'
      });
      return;
    }

    this.alertas.update(alertas =>
      alertas.map(a =>
        a.id === alerta.id
          ? {
              ...a,
              status: 'atendida' as AlertStatus,
              fechaAtendida: new Date(),
              atendidaPor: 'Usuario Actual',
              comentarioResolucion: comentario
            }
          : a
      )
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Alerta Atendida',
      detail: 'La alerta ha sido marcada como atendida'
    });

    this.cancelarAtencion();
  }

  verHistorialKPI(kpiId: string): void {
    const historial = this.alertas().filter(a => a.kpiId === kpiId);
    console.log('Historial del KPI:', historial);
    this.messageService.add({
      severity: 'info',
      summary: 'Historial',
      detail: `Se encontraron ${historial.length} alertas para este KPI`
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
