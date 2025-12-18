import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  EntidadML,
  ResultadoAnalisis,
  Tendencia,
  MitigacionSugerida,
  Oportunidad,
  RiesgoML,
  ContextoUsuario,
  FeedbackUsuario,
  TipoHallazgo,
  EstadoHallazgo,
  EstadoResultsML,
  FiltroResultsML,
  HallazgoBase
} from '../models/results-ml.models';
import { MockDataService } from './mock-data.service';
import { FeedbackMLService } from './feedback-ml.service';

@Injectable({
  providedIn: 'root'
})
export class ResultsMLService {
  private mockDataService = inject(MockDataService);
  private feedbackService = inject(FeedbackMLService);
  private router = inject(Router);
  // Estado del módulo
  private estado = signal<EstadoResultsML>({
    entidadSeleccionada: null,
    categoriaActiva: 'tendencia',
    filtros: [],
    ordenamiento: null
  });

  // Búsqueda
  busquedaEntidad = signal('');

  // Filtros para tabla unificada
  filtroTiposHallazgo = signal<TipoHallazgo[]>([]);
  filtroEstadosHallazgo = signal<EstadoHallazgo[]>([]);
  filtroConfianza = signal<string | null>(null);
  filtroFechaRango = signal<Date[] | null>(null);
  busquedaHallazgo = signal('');

  // Entidades recientes
  private entidadesRecientes = signal<EntidadML[]>([]);

  // Entidades derivadas de MockDataService (activos reales del sistema)
  private entidadesFromMock = computed<EntidadML[]>(() => {
    const activos = this.mockDataService.activos();
    return activos.map(activo => ({
      id: activo.id,
      nombre: activo.nombre,
      tipo: 'activo' as const,
      area: activo.departamento,
      responsable: activo.responsable,
      cantidadHallazgosPendientes: this.getHallazgosPendientesPorEntidad(activo.id)
    }));
  });

  // Entidades adicionales mock para procesos (no existen en MockDataService todavía)
  private entidadesProcesos = signal<EntidadML[]>([
    { id: 'PRO001', nombre: 'Proceso de Ventas', tipo: 'proceso', area: 'Comercial', responsable: 'Miguel Torres', cantidadHallazgosPendientes: 4 },
    { id: 'PRO002', nombre: 'Proceso de Compras', tipo: 'proceso', area: 'Operaciones', responsable: 'Patricia López', cantidadHallazgosPendientes: 6 },
    { id: 'PRO003', nombre: 'Proceso de Contratación', tipo: 'proceso', area: 'RRHH', responsable: 'Fernando Ruiz', cantidadHallazgosPendientes: 1 },
    { id: 'PRO004', nombre: 'Proceso de Atención al Cliente', tipo: 'proceso', area: 'Servicio', responsable: 'Diana Flores', cantidadHallazgosPendientes: 8 }
  ]);

  // Combina entidades de activos reales + procesos mock
  private entidadesMock = computed<EntidadML[]>(() => {
    return [...this.entidadesFromMock(), ...this.entidadesProcesos()];
  });

  // Helper para contar hallazgos pendientes
  private getHallazgosPendientesPorEntidad(entidadId: string): number {
    const resultado = this.resultadosMock.get(entidadId);
    if (!resultado) return Math.floor(Math.random() * 5) + 1; // Valor inicial aleatorio
    return [
      ...resultado.tendencias,
      ...resultado.mitigaciones,
      ...resultado.oportunidades,
      ...resultado.riesgos
    ].filter(h => h.estado === 'pendiente').length;
  }

  // Resultados mock por entidad
  private resultadosMock: Map<string, ResultadoAnalisis> = new Map();

  constructor() {
    this.inicializarDatosMock();
  }

  private inicializarDatosMock(): void {
    // Crear resultados mock para cada entidad
    this.entidadesMock().forEach(entidad => {
      const resultado: ResultadoAnalisis = {
        entidadId: entidad.id,
        entidadNombre: entidad.nombre,
        entidadTipo: entidad.tipo,
        fechaUltimoAnalisis: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        estadoAnalisis: 'completado',
        contadores: {
          totalTendencias: Math.floor(Math.random() * 8) + 2,
          totalMitigaciones: Math.floor(Math.random() * 6) + 1,
          totalOportunidades: Math.floor(Math.random() * 5) + 1,
          totalRiesgos: Math.floor(Math.random() * 4) + 1,
          pendientes: entidad.cantidadHallazgosPendientes,
          aprobados: Math.floor(Math.random() * 4),
          descartados: Math.floor(Math.random() * 2)
        },
        tendencias: this.generarTendenciasMock(entidad.id),
        mitigaciones: this.generarMitigacionesMock(entidad.id),
        oportunidades: this.generarOportunidadesMock(entidad.id),
        riesgos: this.generarRiesgosMock(entidad.id)
      };
      this.resultadosMock.set(entidad.id, resultado);
    });
  }

  private generarTendenciasMock(entidadId: string): Tendencia[] {
    const tendencias: Tendencia[] = [
      {
        id: `TEN-${entidadId}-001`,
        tipoHallazgo: 'tendencia',
        tipoTendencia: 'correlacion',
        titulo: 'Correlación entre tiempo de respuesta y carga de usuarios',
        descripcion: 'Se detectó una fuerte correlación positiva (r=0.87) entre el número de usuarios concurrentes y el tiempo de respuesta del sistema. El análisis sugiere que cuando la carga supera 150 usuarios, el rendimiento se degrada significativamente.',
        confianza: 87,
        fechaDeteccion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Logs del servidor', 'Métricas APM', 'Analytics'],
        entidadId,
        datosInvolucrados: ['usuarios_concurrentes', 'tiempo_respuesta_ms'],
        metricasEstadisticas: [
          { nombre: 'Coeficiente de correlación', valor: 0.87 },
          { nombre: 'P-value', valor: '< 0.001' },
          { nombre: 'Intervalo de confianza', valor: '0.82 - 0.92' }
        ],
        periodoAnalisis: { desde: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), hasta: new Date() },
        impactoEstimado: 'Alto - Puede afectar la experiencia del usuario durante horas pico',
        visualizacionTipo: 'scatter'
      },
      {
        id: `TEN-${entidadId}-002`,
        tipoHallazgo: 'tendencia',
        tipoTendencia: 'anomalia',
        titulo: 'Picos inusuales de errores los viernes por la tarde',
        descripcion: 'Se detectaron anomalías recurrentes en la tasa de errores que ocurren específicamente los viernes entre 14:00 y 18:00 horas. La tasa de errores aumenta un 340% comparado con el promedio.',
        confianza: 92,
        fechaDeteccion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Logs de errores', 'Incidentes reportados'],
        entidadId,
        metricasEstadisticas: [
          { nombre: 'Tasa de errores normal', valor: '0.5%' },
          { nombre: 'Tasa de errores anómala', valor: '2.2%' },
          { nombre: 'Frecuencia', valor: '4 de 4 viernes' }
        ],
        impactoEstimado: 'Medio - Afecta operaciones de cierre semanal',
        visualizacionTipo: 'line'
      },
      {
        id: `TEN-${entidadId}-003`,
        tipoHallazgo: 'tendencia',
        tipoTendencia: 'patron_temporal',
        titulo: 'Incremento gradual en tiempo de procesamiento de transacciones',
        descripcion: 'Durante los últimos 3 meses, el tiempo promedio de procesamiento de transacciones ha aumentado un 15% de forma gradual. Esta tendencia indica una posible degradación del rendimiento que requiere atención.',
        confianza: 78,
        fechaDeteccion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estado: 'aprobado',
        fuentesDatos: ['Métricas de transacciones', 'Base de datos'],
        entidadId,
        periodoAnalisis: { desde: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), hasta: new Date() },
        impactoEstimado: 'Medio - Degradación progresiva de la experiencia'
      },
      {
        id: `TEN-${entidadId}-004`,
        tipoHallazgo: 'tendencia',
        tipoTendencia: 'cluster',
        titulo: 'Agrupación de incidentes por tipo de usuario',
        descripcion: 'El análisis de clustering identificó que el 72% de los incidentes están asociados a usuarios del departamento de Contabilidad durante el período de cierre mensual.',
        confianza: 85,
        fechaDeteccion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Tickets de soporte', 'Directorio de usuarios'],
        entidadId,
        impactoEstimado: 'Alto - Afecta procesos críticos de negocio'
      }
    ];

    return tendencias.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generarMitigacionesMock(entidadId: string): MitigacionSugerida[] {
    const mitigaciones: MitigacionSugerida[] = [
      {
        id: `MIT-${entidadId}-001`,
        tipoHallazgo: 'mitigacion',
        tipoMitigacion: 'reducir',
        titulo: 'Implementar balanceo de carga automático',
        descripcion: 'Basado en la correlación detectada entre usuarios concurrentes y tiempo de respuesta, se sugiere implementar un sistema de balanceo de carga automático que distribuya la carga cuando se superen 120 usuarios.',
        confianza: 89,
        fechaDeteccion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Análisis de tendencias', 'Benchmarks'],
        entidadId,
        riesgoAsociado: 'Degradación de rendimiento por alta carga de usuarios',
        prioridadSugerida: 'alta',
        tendenciaOrigenId: `TEN-${entidadId}-001`,
        beneficioEsperado: 'Reducción del 60% en tiempos de respuesta durante picos de carga',
        esfuerzoEstimado: 'medio',
        justificacionModelo: 'El análisis predictivo indica que sin intervención, el sistema alcanzará tiempos de respuesta inaceptables en 2-3 meses.'
      },
      {
        id: `MIT-${entidadId}-002`,
        tipoHallazgo: 'mitigacion',
        tipoMitigacion: 'evitar',
        titulo: 'Programar mantenimiento preventivo los viernes',
        descripcion: 'Para evitar los picos de errores detectados los viernes por la tarde, se sugiere programar tareas de mantenimiento preventivo antes del horario problemático.',
        confianza: 76,
        fechaDeteccion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estado: 'en_evaluacion',
        fuentesDatos: ['Análisis de anomalías'],
        entidadId,
        riesgoAsociado: 'Incremento de errores durante cierre semanal',
        prioridadSugerida: 'media',
        tendenciaOrigenId: `TEN-${entidadId}-002`,
        beneficioEsperado: 'Eliminación del 80% de errores recurrentes',
        esfuerzoEstimado: 'bajo',
        justificacionModelo: 'El patrón de errores es consistente y predecible, permitiendo intervención preventiva.'
      },
      {
        id: `MIT-${entidadId}-003`,
        tipoHallazgo: 'mitigacion',
        tipoMitigacion: 'transferir',
        titulo: 'Contratar servicio de monitoreo externo',
        descripcion: 'Dada la complejidad del entorno y los patrones de fallo detectados, se recomienda contratar un servicio especializado de monitoreo 24/7.',
        confianza: 65,
        fechaDeteccion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Análisis de incidentes', 'Evaluación de riesgos'],
        entidadId,
        riesgoAsociado: 'Falta de visibilidad en horarios no laborales',
        prioridadSugerida: 'baja',
        beneficioEsperado: 'Detección temprana de incidentes fuera de horario',
        esfuerzoEstimado: 'bajo'
      }
    ];

    return mitigaciones.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private generarOportunidadesMock(entidadId: string): Oportunidad[] {
    const oportunidades: Oportunidad[] = [
      {
        id: `OPO-${entidadId}-001`,
        tipoHallazgo: 'oportunidad',
        tipoOportunidad: 'optimizacion',
        titulo: 'Optimizar consultas de base de datos más frecuentes',
        descripcion: 'El análisis identificó 5 consultas SQL que representan el 78% del tiempo de procesamiento. Optimizando estas consultas se podría mejorar significativamente el rendimiento general.',
        confianza: 91,
        fechaDeteccion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Query analyzer', 'Performance logs'],
        entidadId,
        impactoEstimado: 'Alto',
        areaImpacto: 'Rendimiento del sistema',
        beneficioCuantificado: 'Reducción del 45% en tiempo de respuesta promedio',
        riesgosImplementacion: 'Posibles efectos secundarios en reportes que dependen de estas consultas',
        analisisModelo: 'Las consultas identificadas tienen patrones de acceso ineficientes que pueden ser optimizados con índices adicionales y reestructuración.'
      },
      {
        id: `OPO-${entidadId}-002`,
        tipoHallazgo: 'oportunidad',
        tipoOportunidad: 'eficiencia',
        titulo: 'Automatizar proceso de validación de datos',
        descripcion: 'Se detectó que el 35% del tiempo del proceso se dedica a validaciones manuales que pueden ser automatizadas con reglas de negocio predefinidas.',
        confianza: 84,
        fechaDeteccion: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        estado: 'aprobado',
        fuentesDatos: ['Process mining', 'Logs de actividad'],
        entidadId,
        impactoEstimado: 'Medio',
        areaImpacto: 'Operaciones',
        beneficioCuantificado: 'Ahorro de 15 horas-hombre semanales',
        analisisModelo: 'Las reglas de validación son consistentes y pueden ser codificadas sin ambigüedad.'
      },
      {
        id: `OPO-${entidadId}-003`,
        tipoHallazgo: 'oportunidad',
        tipoOportunidad: 'reduccion_costos',
        titulo: 'Consolidar servidores con baja utilización',
        descripcion: 'El análisis de utilización de recursos muestra que 3 servidores operan consistentemente por debajo del 20% de su capacidad. Consolidarlos reduciría costos de infraestructura.',
        confianza: 88,
        fechaDeteccion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Métricas de infraestructura', 'Costos de hosting'],
        entidadId,
        impactoEstimado: 'Alto',
        areaImpacto: 'Infraestructura',
        beneficioCuantificado: 'Ahorro estimado de $2,400 USD mensuales',
        riesgosImplementacion: 'Requiere planificación cuidadosa de la migración para evitar downtime'
      }
    ];

    return oportunidades.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  private generarRiesgosMock(entidadId: string): RiesgoML[] {
    const riesgos: RiesgoML[] = [
      {
        id: `RIE-${entidadId}-001`,
        tipoHallazgo: 'riesgo',
        nivelRiesgo: 'alta',
        titulo: 'Riesgo de interrupción del servicio por sobrecarga',
        descripcion: 'El análisis predictivo indica alta probabilidad de interrupción del servicio durante períodos de alta demanda.',
        confianza: 88,
        fechaDeteccion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Métricas de rendimiento', 'Logs de sistema'],
        entidadId,
        probabilidad: 4,
        impacto: 5,
        factoresRiesgo: ['Alta carga de usuarios', 'Recursos limitados'],
        controlSugerido: 'Implementar escalado automático'
      },
      {
        id: `RIE-${entidadId}-002`,
        tipoHallazgo: 'riesgo',
        nivelRiesgo: 'alta',
        titulo: 'Vulnerabilidad potencial en autenticación',
        descripcion: 'Se detectaron patrones de acceso sospechosos que podrían indicar intentos de acceso no autorizado.',
        confianza: 92,
        fechaDeteccion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        estado: 'pendiente',
        fuentesDatos: ['Logs de autenticación', 'Análisis de IPs'],
        entidadId,
        probabilidad: 3,
        impacto: 5,
        factoresRiesgo: ['Intentos de login fallidos', 'IPs sospechosas'],
        controlSugerido: 'Implementar MFA y bloqueo de IPs'
      },
      {
        id: `RIE-${entidadId}-003`,
        tipoHallazgo: 'riesgo',
        nivelRiesgo: 'media',
        titulo: 'Posible incumplimiento de retención de datos',
        descripcion: 'Los datos están siendo retenidos más allá del período permitido según las políticas de la organización.',
        confianza: 75,
        fechaDeteccion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estado: 'en_evaluacion',
        fuentesDatos: ['Metadatos de almacenamiento', 'Políticas de retención'],
        entidadId,
        probabilidad: 2,
        impacto: 4,
        factoresRiesgo: ['Datos antiguos sin purgar', 'Sin política de archivado'],
        controlSugerido: 'Implementar política de retención automática'
      }
    ];

    return riesgos.slice(0, Math.floor(Math.random() * 2) + 1);
  }

  // Computed: Entidades filtradas por búsqueda
  entidadesFiltradas = computed(() => {
    const busqueda = this.busquedaEntidad().toLowerCase();
    const entidades = this.entidadesMock();

    if (!busqueda) {
      return entidades;
    }

    return entidades.filter(e =>
      e.nombre.toLowerCase().includes(busqueda) ||
      e.id.toLowerCase().includes(busqueda) ||
      e.area?.toLowerCase().includes(busqueda)
    );
  });

  // Computed: Resultado actual
  resultadoActual = computed<ResultadoAnalisis | null>(() => {
    const entidad = this.estado().entidadSeleccionada;
    if (!entidad) return null;
    return this.resultadosMock.get(entidad.id) || null;
  });

  // Computed: Todos los hallazgos unificados (para tabla sin tabs)
  todosLosHallazgos = computed(() => {
    const resultado = this.resultadoActual();
    if (!resultado) return [];

    let hallazgos: HallazgoBase[] = [
      ...resultado.tendencias,
      ...resultado.mitigaciones,
      ...resultado.oportunidades,
      ...resultado.riesgos
    ];

    // Filtrar por tipos de hallazgo seleccionados
    const tiposFiltro = this.filtroTiposHallazgo();
    if (tiposFiltro.length > 0) {
      hallazgos = hallazgos.filter(h => tiposFiltro.includes(h.tipoHallazgo));
    }

    // Filtrar por estados seleccionados
    const estadosFiltro = this.filtroEstadosHallazgo();
    if (estadosFiltro.length > 0) {
      hallazgos = hallazgos.filter(h => estadosFiltro.includes(h.estado));
    }

    // Filtrar por confianza
    const confianzaFiltro = this.filtroConfianza();
    if (confianzaFiltro) {
      hallazgos = hallazgos.filter(h => {
        switch (confianzaFiltro) {
          case 'alta': return h.confianza >= 80;
          case 'media': return h.confianza >= 50 && h.confianza < 80;
          case 'baja': return h.confianza < 50;
          default: return true;
        }
      });
    }

    // Filtrar por rango de fechas
    const fechaRango = this.filtroFechaRango();
    if (fechaRango && fechaRango.length === 2 && fechaRango[0] && fechaRango[1]) {
      const fechaInicio = new Date(fechaRango[0]);
      fechaInicio.setHours(0, 0, 0, 0);
      const fechaFin = new Date(fechaRango[1]);
      fechaFin.setHours(23, 59, 59, 999);
      hallazgos = hallazgos.filter(h => {
        const fechaHallazgo = new Date(h.fechaDeteccion);
        return fechaHallazgo >= fechaInicio && fechaHallazgo <= fechaFin;
      });
    }

    // Filtrar por búsqueda
    const busqueda = this.busquedaHallazgo().toLowerCase();
    if (busqueda) {
      hallazgos = hallazgos.filter(h =>
        h.titulo.toLowerCase().includes(busqueda) ||
        h.descripcion.toLowerCase().includes(busqueda)
      );
    }

    // Ordenar por fecha de detección (más recientes primero)
    return hallazgos.sort((a, b) =>
      new Date(b.fechaDeteccion).getTime() - new Date(a.fechaDeteccion).getTime()
    );
  });

  // Computed: Hallazgos filtrados según categoría activa
  hallazgosFiltrados = computed(() => {
    const resultado = this.resultadoActual();
    if (!resultado) return [];

    const categoria = this.estado().categoriaActiva;
    let hallazgos: HallazgoBase[] = [];

    switch (categoria) {
      case 'tendencia':
        hallazgos = resultado.tendencias;
        break;
      case 'mitigacion':
        hallazgos = resultado.mitigaciones;
        break;
      case 'oportunidad':
        hallazgos = resultado.oportunidades;
        break;
    }

    // Aplicar filtros
    const filtros = this.estado().filtros;
    filtros.forEach(filtro => {
      hallazgos = hallazgos.filter(h => this.aplicarFiltro(h, filtro));
    });

    // Aplicar ordenamiento
    const orden = this.estado().ordenamiento;
    if (orden) {
      hallazgos = [...hallazgos].sort((a, b) => {
        const valorA = (a as any)[orden.campo];
        const valorB = (b as any)[orden.campo];
        const comparacion = valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
        return orden.direccion === 'asc' ? comparacion : -comparacion;
      });
    }

    return hallazgos;
  });

  // Computed: Contadores por estado
  contadoresPorEstado = computed(() => {
    const resultado = this.resultadoActual();
    if (!resultado) {
      return { pendientes: 0, aprobados: 0, descartados: 0 };
    }

    const categoria = this.estado().categoriaActiva;
    let hallazgos: HallazgoBase[] = [];

    switch (categoria) {
      case 'tendencia':
        hallazgos = resultado.tendencias;
        break;
      case 'mitigacion':
        hallazgos = resultado.mitigaciones;
        break;
      case 'oportunidad':
        hallazgos = resultado.oportunidades;
        break;
    }

    return {
      pendientes: hallazgos.filter(h => h.estado === 'pendiente').length,
      aprobados: hallazgos.filter(h => h.estado === 'aprobado' || h.estado === 'implementado').length,
      descartados: hallazgos.filter(h => h.estado === 'descartado').length
    };
  });

  // Métodos públicos
  getEstado() {
    return this.estado;
  }

  getEntidadesRecientes() {
    return this.entidadesRecientes;
  }

  seleccionarEntidad(entidad: EntidadML): void {
    this.estado.update(s => ({ ...s, entidadSeleccionada: entidad }));

    // Agregar a recientes
    const recientes = this.entidadesRecientes();
    const yaExiste = recientes.findIndex(e => e.id === entidad.id);
    if (yaExiste >= 0) {
      recientes.splice(yaExiste, 1);
    }
    this.entidadesRecientes.set([entidad, ...recientes.slice(0, 4)]);
  }

  limpiarSeleccion(): void {
    this.estado.update(s => ({ ...s, entidadSeleccionada: null }));
  }

  setCategoriaActiva(categoria: TipoHallazgo): void {
    this.estado.update(s => ({ ...s, categoriaActiva: categoria, filtros: [] }));
  }

  agregarFiltro(filtro: FiltroResultsML): void {
    this.estado.update(s => ({ ...s, filtros: [...s.filtros, filtro] }));
  }

  eliminarFiltro(index: number): void {
    this.estado.update(s => ({
      ...s,
      filtros: s.filtros.filter((_, i) => i !== index)
    }));
  }

  limpiarFiltros(): void {
    this.estado.update(s => ({ ...s, filtros: [] }));
  }

  setOrdenamiento(campo: string, direccion: 'asc' | 'desc'): void {
    this.estado.update(s => ({ ...s, ordenamiento: { campo, direccion } }));
  }

  // Acciones sobre hallazgos
  aprobarHallazgo(hallazgoId: string, opciones: { crearRiesgo?: boolean; crearTarea?: boolean; comentarios?: string }): void {
    const entidad = this.estado().entidadSeleccionada;
    if (!entidad) return;

    const hallazgo = this.obtenerHallazgoPorId(hallazgoId);
    if (!hallazgo) return;

    // Actualizar estado del hallazgo
    this.actualizarEstadoHallazgo(hallazgoId, 'aprobado');

    // Guardar feedback en FeedbackService
    this.feedbackService.agregarAprobacion(hallazgoId, {
      crearRiesgo: opciones.crearRiesgo,
      crearTarea: opciones.crearTarea,
      comentarios: opciones.comentarios
    });

    // Crear riesgo real en MockDataService si se solicitó
    if (opciones.crearRiesgo && entidad.tipo === 'activo') {
      const activo = this.mockDataService.getActivoById(entidad.id);
      if (activo) {
        this.mockDataService.addRiesgo(entidad.id, {
          descripcion: `[ML] ${hallazgo.titulo}: ${hallazgo.descripcion}`,
          probabilidad: this.calcularProbabilidadDesdeConfianza(hallazgo.confianza),
          impacto: this.calcularImpactoDesdeHallazgo(hallazgo),
          estado: 'identificado',
          responsable: entidad.responsable || 'Sin asignar'
        });
        console.log('✅ Riesgo creado en módulo de Riesgos para activo:', entidad.nombre);
      }
    }

    // TODO: Crear tarea real cuando exista el módulo de tareas
    if (opciones.crearTarea) {
      console.log('📋 Tarea pendiente de implementación para hallazgo:', hallazgoId);
    }

    console.log('✅ Hallazgo aprobado:', hallazgoId, opciones);
  }

  descartarHallazgo(hallazgoId: string, motivo: string, justificacion: string): void {
    // Actualizar estado del hallazgo
    this.actualizarEstadoHallazgo(hallazgoId, 'descartado');

    // Guardar feedback en FeedbackService
    this.feedbackService.agregarDescarte(hallazgoId, motivo, justificacion);

    console.log('❌ Hallazgo descartado:', hallazgoId, { motivo, justificacion });
  }

  // Obtener hallazgo por ID
  private obtenerHallazgoPorId(hallazgoId: string): HallazgoBase | null {
    const resultado = this.resultadoActual();
    if (!resultado) return null;

    const todosHallazgos = [
      ...resultado.tendencias,
      ...resultado.mitigaciones,
      ...resultado.oportunidades,
      ...resultado.riesgos
    ];

    return todosHallazgos.find(h => h.id === hallazgoId) || null;
  }

  // Calcular probabilidad desde confianza del modelo
  private calcularProbabilidadDesdeConfianza(confianza: number): 1 | 2 | 3 | 4 | 5 {
    // Mapear confianza (0-100) a probabilidad (1-5)
    if (confianza >= 90) return 5;
    if (confianza >= 75) return 4;
    if (confianza >= 60) return 3;
    if (confianza >= 40) return 2;
    return 1;
  }

  // Calcular impacto desde el hallazgo
  private calcularImpactoDesdeHallazgo(hallazgo: HallazgoBase): 1 | 2 | 3 | 4 | 5 {
    const impactoTexto = (hallazgo as any).impactoEstimado || '';
    if (impactoTexto.toLowerCase().includes('alto') || impactoTexto.toLowerCase().includes('crítico')) return 5;
    if (impactoTexto.toLowerCase().includes('medio')) return 3;
    if (impactoTexto.toLowerCase().includes('bajo')) return 2;
    return 3; // Default medio
  }

  // Navegar al módulo de riesgos
  navegarARiesgos(activoId?: string): void {
    if (activoId) {
      this.router.navigate(['/riesgos'], { queryParams: { activo: activoId } });
    } else {
      this.router.navigate(['/riesgos']);
    }
  }

  // Navegar al módulo de activos
  navegarAActivo(activoId: string): void {
    this.router.navigate(['/activos'], { queryParams: { selected: activoId } });
  }

  // Obtener estadísticas de feedback
  getEstadisticasFeedback() {
    return this.feedbackService.estadisticas;
  }

  private actualizarEstadoHallazgo(hallazgoId: string, nuevoEstado: EstadoHallazgo): void {
    const entidad = this.estado().entidadSeleccionada;
    if (!entidad) return;

    const resultado = this.resultadosMock.get(entidad.id);
    if (!resultado) return;

    // Buscar y actualizar en todas las categorías
    const actualizarEnLista = (lista: HallazgoBase[]) => {
      const idx = lista.findIndex(h => h.id === hallazgoId);
      if (idx >= 0) {
        lista[idx] = { ...lista[idx], estado: nuevoEstado };
      }
    };

    actualizarEnLista(resultado.tendencias);
    actualizarEnLista(resultado.mitigaciones);
    actualizarEnLista(resultado.oportunidades);
    actualizarEnLista(resultado.riesgos);

    // Actualizar contadores
    resultado.contadores.pendientes = [
      ...resultado.tendencias,
      ...resultado.mitigaciones,
      ...resultado.oportunidades,
      ...resultado.riesgos
    ].filter(h => h.estado === 'pendiente').length;

    // Forzar actualización
    this.resultadosMock.set(entidad.id, { ...resultado });
    this.estado.update(s => ({ ...s }));
  }

  private aplicarFiltro(hallazgo: HallazgoBase, filtro: FiltroResultsML): boolean {
    const valor = (hallazgo as any)[filtro.campo];

    if (filtro.campo === 'estado') {
      return Array.isArray(filtro.valor)
        ? filtro.valor.includes(valor)
        : valor === filtro.valor;
    }

    if (filtro.campo === 'confianza') {
      const min = filtro.valor.min || 0;
      const max = filtro.valor.max || 100;
      return valor >= min && valor <= max;
    }

    return true;
  }

  // Helpers
  getConfianzaTag(confianza: number): 'success' | 'warn' | 'danger' {
    if (confianza >= 80) return 'success';
    if (confianza >= 50) return 'warn';
    return 'danger';
  }

  getEstadoTag(estado: EstadoHallazgo): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (estado) {
      case 'pendiente': return 'warn';
      case 'aprobado':
      case 'implementado': return 'success';
      case 'descartado': return 'secondary';
      case 'en_evaluacion': return 'info';
      default: return 'secondary';
    }
  }

  getPrioridadTag(prioridad: string): 'danger' | 'warn' | 'success' {
    switch (prioridad) {
      case 'alta': return 'danger';
      case 'media': return 'warn';
      case 'baja': return 'success';
      default: return 'warn';
    }
  }

  formatearEstado(estado: string): string {
    const mapeo: Record<string, string> = {
      'pendiente': 'Pendiente',
      'aprobado': 'Aprobado',
      'descartado': 'Descartado',
      'en_evaluacion': 'En Evaluación',
      'implementado': 'Implementado'
    };
    return mapeo[estado] || estado;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
