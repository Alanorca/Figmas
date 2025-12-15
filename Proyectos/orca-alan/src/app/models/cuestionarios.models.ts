// =============================================
// INTERFACES - MODELO DE DATOS CUESTIONARIOS Y CUMPLIMIENTO
// =============================================

export interface MarcoNormativo {
  id: string;
  nombre: string;
  acronimo: string;
  version: string;
  fechaVigencia: Date;
  descripcion: string;
  requisitos: RequisitoNormativo[];
  activo: boolean;
}

export interface RequisitoNormativo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  marcoId: string;
  controlesAsociados: string[];
}

export interface Cuestionario {
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

export interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
  preguntas: Pregunta[];
  peso: number;
  requerida?: boolean;
}

// Tipos de pregunta soportados según documentación
export type TipoPregunta =
  | 'texto'           // FREE_TEXT - Texto corto
  | 'textoLargo'      // FREE_TEXT - Texto largo (textarea)
  | 'boolean'         // BOOLEAN - Verdadero/Falso
  | 'numero'          // NUMBER - Campo numérico
  | 'siNoNa'          // YES_NO - Sí/No/N/A
  | 'seleccionUnica'  // SINGLE_SELECT / DROPDOWN - Opción única
  | 'opcionMultiple'  // MULTI_SELECT - Selección múltiple
  | 'radioButtons'    // Radio buttons para opciones
  | 'starRating'      // STAR_RATING - Calificación con estrellas (1-5 o 1-10)
  | 'likertScale'     // LIKERT_SCALE - Escala de acuerdo (5 opciones fijas)
  | 'escala'          // NUMERIC_SCALE - Escala numérica con slider
  | 'semanticDiff'    // SEMANTIC_DIFFERENTIAL - Escala entre opuestos
  | 'ranking'         // RANKING - Ordenamiento por preferencia
  | 'fecha'           // Date picker
  | 'archivo'         // File upload
  | 'matriz'          // Matriz de preguntas
  | 'grupo'           // Agrupador de preguntas
  | 'url';            // URL/Link

export interface Pregunta {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  requerida: boolean;
  peso: number;
  opciones?: string[] | { text: string; score: number }[];  // Opciones con puntaje para cálculo de compliance
  escalaMin?: number;
  escalaMax?: number;
  ayuda?: string;
  placeholder?: string;
  requisitoNormativoId?: string;
  controlAsociado?: string;
  requiereEvidencia: boolean;
  // Campos para STAR_RATING
  maxStars?: number;  // 5 o 10 estrellas
  // Campos para SEMANTIC_DIFFERENTIAL
  leftAnchor?: string;   // Etiqueta izquierda (ej: "Muy malo")
  rightAnchor?: string;  // Etiqueta derecha (ej: "Excelente")
  // Campos para LIKERT_SCALE (opciones predefinidas)
  likertLabels?: string[];  // Ej: ["Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"]
  // Logica condicional - segun especificacion del documento
  displayConditionQuestionId?: string;  // ID de la pregunta condicionante
  displayConditionAnswer?: string;       // Respuesta esperada para mostrar esta pregunta
  // Mantener compatibilidad con estructura anterior
  logicaCondicional?: {
    preguntaId: string;
    condicion: string;
    valor: string;
  };
  // Campos calculados - Solo para tipos numéricos (numero, escala, starRating)
  isCalculated?: boolean;  // Si es true, el campo se calcula con la fórmula
  formula?: string;        // Fórmula JavaScript para calcular el valor (ej: "Q1 + Q2 * 0.5")
}

export interface AsignacionCuestionario {
  id: string;
  cuestionarioId: string;
  cuestionarioIds?: string[]; // Múltiples cuestionarios
  titulo: string;
  descripcion?: string;
  tipoRevision: 'interna' | 'externa';
  usuariosAsignados: string[];
  usuariosAsignadosNombres: string[];
  emailsExternos: string[];
  contrasenaAcceso?: string;
  activosObjetivo: string[];
  activosObjetivoNombres: string[];
  procesosObjetivo: string[];
  procesosObjetivoNombres: string[];
  aprobadores: string[];
  aprobadoresNombres: string[];
  // Evaluados - personas que serán evaluadas
  evaluadosInternos: string[];
  evaluadosInternosNombres: string[];
  evaluadosExternos: EvaluadoExterno[];
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
  // Token para acceso externo
  tokenAccesoExterno?: string;
  recurrencia?: {
    habilitada: boolean;
    frecuencia: 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'anual';
    intervalo: number;
    fechaFin?: Date;
    maxOcurrencias?: number;
    proximaFechaGeneracion?: Date;
  };
}

export interface EvaluadoExterno {
  id: string;
  nombre: string;
  email: string;
  password?: string; // Contraseña generada visible para el creador
  invitacionEnviada: boolean;
  fechaInvitacion?: Date;
  haRespondido: boolean;
  fechaRespuesta?: Date;
}

export interface RespuestaCuestionario {
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

export interface RespuestaPregunta {
  preguntaId: string;
  valor: string | string[] | number | Date | null;
  comentario: string;
  evidencias: Evidencia[];
  archivosAdjuntos?: string[]; // Lista de nombres de archivos adjuntos
  marcadaParaRevision: boolean;
  estadoRevision: 'pendiente' | 'aprobada' | 'rechazada' | 'requiere_aclaracion';
  comentarioRevisor: string;
}

export interface Evidencia {
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

export interface Hallazgo {
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

export interface AlertaCumplimiento {
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

export interface ReporteCumplimiento {
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

export interface HistorialAuditoria {
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

export interface MapeoControl {
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
  efectividad: number;
  ultimaEvaluacion: Date;
  evidenciasAsociadas: string[];
  preguntasAsociadas: string[];
}

export interface ControlFaltante {
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

export interface AccionCorrectiva {
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

export interface MensajeChat {
  id: string;
  asignacionId: string;
  cuestionarioId?: string;
  activoProcesoId?: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: 'evaluador' | 'aprobador';
  mensaje: string;
  fecha: Date;
  leido: boolean;
}
