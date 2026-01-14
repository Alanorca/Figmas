/**
 * scoring.utils.ts
 * Utilidades para el cálculo de puntuación de cuestionarios de compliance
 *
 * Proporciona funciones para calcular:
 * - Puntuación por campo individual
 * - Puntuación por sección
 * - Progreso de completado
 * - Puntuación global de compliance
 */

import { Pregunta, Seccion, RespuestaPregunta } from '../models/cuestionarios.models';

// =============================================
// TIPOS E INTERFACES
// =============================================

export interface FieldScoreResult {
  fieldId: string;
  score: number;           // Puntuación obtenida (0-100)
  maxScore: number;        // Puntuación máxima posible
  weight: number;          // Peso del campo
  weightedScore: number;   // Puntuación ponderada
  isAnswered: boolean;     // Si el campo fue respondido
  isCalculated: boolean;   // Si es un campo calculado
}

export interface SectionScoreResult {
  sectionId: string;
  sectionName: string;
  score: number;           // Puntuación de la sección (0-100)
  maxScore: number;        // Puntuación máxima de la sección
  weight: number;          // Peso de la sección
  weightedScore: number;   // Puntuación ponderada
  fieldsAnswered: number;  // Campos respondidos
  fieldsTotal: number;     // Total de campos
  progress: number;        // Progreso de la sección (0-100)
  fieldScores: FieldScoreResult[];
}

export interface ProgressResult {
  totalFields: number;
  answeredFields: number;
  percentage: number;
  requiredAnswered: number;
  requiredTotal: number;
  optionalAnswered: number;
  optionalTotal: number;
}

export interface ComplianceResult {
  globalScore: number;           // Puntuación global (0-100)
  progress: ProgressResult;      // Progreso de completado
  sectionScores: SectionScoreResult[];
  totalWeight: number;
  weightedTotalScore: number;
}

export interface QuestionnaireScoreResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  sectionScores: SectionScoreResult[];
}

// =============================================
// CÁLCULO DE PUNTUACIÓN POR TIPO DE CAMPO
// =============================================

/**
 * Calcula la puntuación de un campo basado en su tipo y respuesta
 */
export function calculateFieldScore(
  pregunta: Pregunta,
  respuesta: RespuestaPregunta | undefined,
  allResponses?: Map<string, RespuestaPregunta>
): FieldScoreResult {
  const result: FieldScoreResult = {
    fieldId: pregunta.id,
    score: 0,
    maxScore: 100,
    weight: pregunta.peso || 1,
    weightedScore: 0,
    isAnswered: false,
    isCalculated: pregunta.isCalculated || false
  };

  // Si es un campo calculado, calcular con la fórmula
  if (pregunta.isCalculated && pregunta.formula && allResponses) {
    result.score = evaluateFormula(pregunta.formula, allResponses);
    result.isAnswered = true;
    result.weightedScore = result.score * result.weight;
    return result;
  }

  // Si no hay respuesta, retornar puntuación 0
  if (!respuesta || respuesta.valor === null || respuesta.valor === undefined || respuesta.valor === '') {
    return result;
  }

  result.isAnswered = true;

  // Calcular puntuación según el tipo de campo
  switch (pregunta.tipo) {
    case 'seleccionUnica':
    case 'radioButtons':
      result.score = calculateSingleSelectScore(pregunta, respuesta.valor as string);
      break;

    case 'opcionMultiple':
      result.score = calculateMultiSelectScore(pregunta, respuesta.valor as string[]);
      break;

    case 'escala':
      result.score = calculateScaleScore(pregunta, respuesta.valor as number);
      break;

    case 'starRating':
      result.score = calculateStarRatingScore(pregunta, respuesta.valor as number);
      break;

    case 'likertScale':
      result.score = calculateLikertScore(respuesta.valor as string);
      break;

    case 'siNoNa':
      result.score = calculateYesNoScore(respuesta.valor as string);
      break;

    case 'boolean':
      result.score = calculateBooleanScore(respuesta.valor as boolean | string);
      break;

    case 'numero':
      result.score = calculateNumericScore(pregunta, respuesta.valor as number);
      break;

    case 'ranking':
      // El ranking se evalúa según si fue completado
      result.score = Array.isArray(respuesta.valor) && respuesta.valor.length > 0 ? 100 : 0;
      break;

    case 'semanticDiff':
      result.score = calculateSemanticDiffScore(pregunta, respuesta.valor as number);
      break;

    // Tipos sin puntuación (texto, fecha, archivo, etc.)
    case 'texto':
    case 'textoLargo':
    case 'fecha':
    case 'archivo':
    case 'url':
    case 'matriz':
    case 'grupo':
      // Estos tipos solo cuentan como completados si tienen respuesta
      result.score = 100; // Considerados completos si tienen valor
      break;

    default:
      result.score = 0;
  }

  result.weightedScore = result.score * result.weight;
  return result;
}

/**
 * Calcula puntuación para selección única (SINGLE_SELECT)
 */
function calculateSingleSelectScore(pregunta: Pregunta, valor: string): number {
  if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) return 0;

  // Si las opciones tienen score definido
  const opcionConScore = pregunta.opciones.find(opt => {
    if (typeof opt === 'object' && 'text' in opt) {
      return opt.text === valor;
    }
    return opt === valor;
  });

  if (opcionConScore && typeof opcionConScore === 'object' && 'score' in opcionConScore) {
    return opcionConScore.score;
  }

  // Si no hay scores, calcular basado en posición (primera = 100%, última = menor)
  const index = pregunta.opciones.findIndex(opt =>
    typeof opt === 'string' ? opt === valor : opt.text === valor
  );

  if (index === -1) return 0;

  // Score inversamente proporcional a la posición
  const totalOpciones = pregunta.opciones.length;
  return Math.round(((totalOpciones - index) / totalOpciones) * 100);
}

/**
 * Calcula puntuación para selección múltiple (MULTI_SELECT)
 */
function calculateMultiSelectScore(pregunta: Pregunta, valores: string[]): number {
  if (!pregunta.opciones || !Array.isArray(pregunta.opciones) || !valores || valores.length === 0) {
    return 0;
  }

  // Sumar scores de todas las opciones seleccionadas
  let totalScore = 0;
  let maxPossibleScore = 0;

  pregunta.opciones.forEach(opt => {
    const optText = typeof opt === 'string' ? opt : opt.text;
    const optScore = typeof opt === 'object' && 'score' in opt ? opt.score : 100 / pregunta.opciones!.length;

    maxPossibleScore += optScore;

    if (valores.includes(optText)) {
      totalScore += optScore;
    }
  });

  // Normalizar a 0-100
  return maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
}

/**
 * Calcula puntuación para escala numérica (NUMERIC_SCALE)
 */
function calculateScaleScore(pregunta: Pregunta, valor: number): number {
  const min = pregunta.escalaMin || 0;
  const max = pregunta.escalaMax || 10;

  if (valor < min || valor > max) return 0;

  // Normalizar el valor al rango 0-100
  return Math.round(((valor - min) / (max - min)) * 100);
}

/**
 * Calcula puntuación para calificación con estrellas (STAR_RATING)
 */
function calculateStarRatingScore(pregunta: Pregunta, valor: number): number {
  const maxStars = pregunta.maxStars || 5;
  if (valor < 1 || valor > maxStars) return 0;

  return Math.round((valor / maxStars) * 100);
}

/**
 * Calcula puntuación para escala Likert (LIKERT_SCALE)
 * Las opciones estándar son: Totalmente en desacuerdo, En desacuerdo, Neutral, De acuerdo, Totalmente de acuerdo
 */
function calculateLikertScore(valor: string): number {
  const likertScores: Record<string, number> = {
    // Variantes en español
    'Totalmente en desacuerdo': 0,
    'En desacuerdo': 25,
    'Neutral': 50,
    'De acuerdo': 75,
    'Totalmente de acuerdo': 100,
    // Variantes en inglés
    'Strongly Disagree': 0,
    'Disagree': 25,
    'Agree': 75,
    'Strongly Agree': 100
  };

  return likertScores[valor] ?? 50;
}

/**
 * Calcula puntuación para Sí/No/N/A (YES_NO)
 */
function calculateYesNoScore(valor: string): number {
  const yesNoScores: Record<string, number> = {
    'si': 100,
    'sí': 100,
    'yes': 100,
    'no': 0,
    'na': 50,
    'n/a': 50,
    'no aplica': 50
  };

  return yesNoScores[valor.toLowerCase()] ?? 0;
}

/**
 * Calcula puntuación para campos booleanos (BOOLEAN)
 */
function calculateBooleanScore(valor: boolean | string): number {
  if (typeof valor === 'boolean') {
    return valor ? 100 : 0;
  }
  return valor === 'true' || valor === '1' ? 100 : 0;
}

/**
 * Calcula puntuación para campos numéricos
 */
function calculateNumericScore(pregunta: Pregunta, valor: number): number {
  // Si hay rango definido, normalizar
  if (pregunta.escalaMin !== undefined && pregunta.escalaMax !== undefined) {
    return calculateScaleScore(pregunta, valor);
  }
  // Si no hay rango, considerar que cualquier valor > 0 es 100%
  return valor > 0 ? 100 : 0;
}

/**
 * Calcula puntuación para diferencial semántico
 */
function calculateSemanticDiffScore(pregunta: Pregunta, valor: number): number {
  // Asumiendo escala de 1-7 por defecto
  const min = pregunta.escalaMin || 1;
  const max = pregunta.escalaMax || 7;

  return Math.round(((valor - min) / (max - min)) * 100);
}

// =============================================
// CÁLCULO DE PUNTUACIÓN POR SECCIÓN
// =============================================

/**
 * Calcula la puntuación de una sección completa
 */
export function calculateSectionScore(
  seccion: Seccion,
  respuestas: Map<string, RespuestaPregunta>,
  allResponses?: Map<string, RespuestaPregunta>
): SectionScoreResult {
  const fieldScores: FieldScoreResult[] = [];
  let totalWeight = 0;
  let totalWeightedScore = 0;
  let fieldsAnswered = 0;

  seccion.preguntas.forEach(pregunta => {
    const respuesta = respuestas.get(pregunta.id);
    const fieldScore = calculateFieldScore(pregunta, respuesta, allResponses || respuestas);

    fieldScores.push(fieldScore);
    totalWeight += fieldScore.weight;
    totalWeightedScore += fieldScore.weightedScore;

    if (fieldScore.isAnswered) {
      fieldsAnswered++;
    }
  });

  const fieldsTotal = seccion.preguntas.length;
  const score = totalWeight > 0 ? Math.round((totalWeightedScore / (totalWeight * 100)) * 100) : 0;

  return {
    sectionId: seccion.id,
    sectionName: seccion.nombre,
    score,
    maxScore: 100,
    weight: seccion.peso || 1,
    weightedScore: score * (seccion.peso || 1),
    fieldsAnswered,
    fieldsTotal,
    progress: fieldsTotal > 0 ? Math.round((fieldsAnswered / fieldsTotal) * 100) : 0,
    fieldScores
  };
}

// =============================================
// CÁLCULO DE PROGRESO
// =============================================

/**
 * Calcula el progreso de completado del cuestionario
 */
export function calculateProgress(
  secciones: Seccion[],
  respuestas: Map<string, RespuestaPregunta>
): ProgressResult {
  let totalFields = 0;
  let answeredFields = 0;
  let requiredTotal = 0;
  let requiredAnswered = 0;
  let optionalTotal = 0;
  let optionalAnswered = 0;

  secciones.forEach(seccion => {
    seccion.preguntas.forEach(pregunta => {
      totalFields++;
      const respuesta = respuestas.get(pregunta.id);
      const isAnswered = respuesta &&
        respuesta.valor !== null &&
        respuesta.valor !== undefined &&
        respuesta.valor !== '';

      if (pregunta.requerida) {
        requiredTotal++;
        if (isAnswered) {
          requiredAnswered++;
          answeredFields++;
        }
      } else {
        optionalTotal++;
        if (isAnswered) {
          optionalAnswered++;
          answeredFields++;
        }
      }
    });
  });

  return {
    totalFields,
    answeredFields,
    percentage: totalFields > 0 ? Math.round((answeredFields / totalFields) * 100) : 0,
    requiredAnswered,
    requiredTotal,
    optionalAnswered,
    optionalTotal
  };
}

// =============================================
// CÁLCULO GLOBAL DE COMPLIANCE
// =============================================

/**
 * Calcula la puntuación global de compliance del cuestionario
 */
export function calculateGlobalCompliance(
  secciones: Seccion[],
  respuestas: Map<string, RespuestaPregunta>
): ComplianceResult {
  const sectionScores: SectionScoreResult[] = [];
  let totalWeight = 0;
  let weightedTotalScore = 0;

  // Crear mapa de todas las respuestas para campos calculados
  const allResponses = new Map(respuestas);

  secciones.forEach(seccion => {
    const sectionScore = calculateSectionScore(seccion, respuestas, allResponses);
    sectionScores.push(sectionScore);
    totalWeight += sectionScore.weight;
    weightedTotalScore += sectionScore.weightedScore;
  });

  const globalScore = totalWeight > 0
    ? Math.round((weightedTotalScore / (totalWeight * 100)) * 100)
    : 0;

  return {
    globalScore,
    progress: calculateProgress(secciones, respuestas),
    sectionScores,
    totalWeight,
    weightedTotalScore
  };
}

// =============================================
// EVALUACIÓN DE FÓRMULAS
// =============================================

/**
 * Evalúa una fórmula de campo calculado
 * Sintaxis: Q1, Q2, etc. para referenciar otras preguntas
 */
function evaluateFormula(
  formula: string,
  respuestas: Map<string, RespuestaPregunta>
): number {
  try {
    // Reemplazar referencias Q1, Q2, etc. con valores
    let evaluableFormula = formula;

    // Patrón para encontrar referencias como Q1, Q2, field_id, etc.
    const refPattern = /Q(\d+)|([a-zA-Z_][a-zA-Z0-9_-]*)/g;

    // Crear contexto con valores de respuestas
    const context: Record<string, number> = {};

    respuestas.forEach((respuesta, id) => {
      const valor = respuesta.valor;
      if (typeof valor === 'number') {
        context[id] = valor;
      } else if (typeof valor === 'string' && !isNaN(Number(valor))) {
        context[id] = Number(valor);
      } else {
        context[id] = 0;
      }
    });

    // Reemplazar referencias en la fórmula
    evaluableFormula = formula.replace(refPattern, (match) => {
      const value = context[match];
      return value !== undefined ? String(value) : '0';
    });

    // Evaluar la fórmula de forma segura
    // Solo permitir operaciones matemáticas básicas
    const safeFormula = evaluableFormula
      .replace(/[^0-9+\-*/().Math\s]/g, '')
      .replace(/Math\.(min|max|round|floor|ceil|abs|sqrt|pow)/g, 'Math.$1');

    // Usar Function para evaluar de forma más segura que eval
    const result = new Function(`return ${safeFormula}`)();

    return typeof result === 'number' && !isNaN(result) ? Math.round(result) : 0;
  } catch {
    console.warn('Error evaluando fórmula:', formula);
    return 0;
  }
}

// =============================================
// UTILIDADES AUXILIARES
// =============================================

/**
 * Convierte un array de respuestas a un Map para acceso más rápido
 */
export function respuestasToMap(respuestas: RespuestaPregunta[]): Map<string, RespuestaPregunta> {
  return new Map(respuestas.map(r => [r.preguntaId, r]));
}

/**
 * Obtiene el score de una opción específica
 */
export function getOptionScore(opcion: string | { text: string; score: number }): number {
  if (typeof opcion === 'object' && 'score' in opcion) {
    return opcion.score;
  }
  return 0;
}

/**
 * Calcula el progreso de una sección específica
 */
export function calculateSectionProgress(
  seccion: Seccion,
  respuestas: RespuestaPregunta[]
): number {
  const respuestasMap = respuestasToMap(respuestas);
  let answered = 0;
  const total = seccion.preguntas.length;

  seccion.preguntas.forEach(pregunta => {
    const respuesta = respuestasMap.get(pregunta.id);
    if (isFieldAnswered(respuesta)) {
      answered++;
    }
  });

  return total > 0 ? Math.round((answered / total) * 100) : 0;
}

/**
 * Calcula el score total de un cuestionario
 */
export function calculateTotalScore(
  secciones: Seccion[],
  respuestas: RespuestaPregunta[]
): QuestionnaireScoreResult {
  const respuestasMap = respuestasToMap(respuestas);
  const compliance = calculateGlobalCompliance(secciones, respuestasMap);

  return {
    totalScore: compliance.globalScore,
    maxScore: 100,
    percentage: compliance.globalScore,
    sectionScores: compliance.sectionScores
  };
}

/**
 * Verifica si un campo ha sido respondido
 */
export function isFieldAnswered(respuesta: RespuestaPregunta | undefined): boolean {
  if (!respuesta) return false;
  if (respuesta.valor === null || respuesta.valor === undefined) return false;
  if (respuesta.valor === '') return false;
  if (Array.isArray(respuesta.valor) && respuesta.valor.length === 0) return false;
  return true;
}
