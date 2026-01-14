/**
 * thresholds.utils.ts
 * Utilidades para la evaluación de umbrales de compliance
 *
 * Define niveles de cumplimiento basados en umbrales configurables:
 * - Deficiente (rojo): Por debajo del umbral mínimo
 * - Aceptable (amarillo): Entre umbral mínimo y óptimo
 * - Sobresaliente (verde): Por encima del umbral óptimo
 */

// =============================================
// TIPOS E INTERFACES
// =============================================

export type ComplianceLevel = 'deficiente' | 'aceptable' | 'sobresaliente';

export interface Umbrales {
  deficiente: number;  // Umbral máximo para nivel deficiente (ej: 50)
  aceptable: number;   // Umbral máximo para nivel aceptable (ej: 75)
  sobresaliente: number; // Umbral mínimo para nivel sobresaliente (ej: 90)
}

export interface ThresholdResult {
  level: ComplianceLevel;
  label: string;
  labelEn: string;
  color: string;           // Color en formato CSS
  bgColor: string;         // Color de fondo
  borderColor: string;     // Color de borde
  icon: string;            // Icono PrimeNG
  severity: 'danger' | 'warn' | 'success';  // Para p-tag de PrimeNG
  percentage: number;      // Porcentaje del score
  description: string;     // Descripción del nivel
}

export interface ThresholdConfig {
  deficiente: ThresholdLevelConfig;
  aceptable: ThresholdLevelConfig;
  sobresaliente: ThresholdLevelConfig;
}

export interface ThresholdLevelConfig {
  label: string;
  labelEn: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  severity: 'danger' | 'warn' | 'success';
  description: string;
}

// =============================================
// CONFIGURACIÓN POR DEFECTO
// =============================================

export const DEFAULT_UMBRALES: Umbrales = {
  deficiente: 50,
  aceptable: 75,
  sobresaliente: 90
};

export const THRESHOLD_CONFIG: ThresholdConfig = {
  deficiente: {
    label: 'Deficiente',
    labelEn: 'Deficient',
    color: '#DC2626',           // red-600
    bgColor: '#FEE2E2',         // red-100
    borderColor: '#FECACA',     // red-200
    icon: 'pi pi-times-circle',
    severity: 'danger',
    description: 'El nivel de cumplimiento está por debajo de los estándares mínimos requeridos. Se requiere acción inmediata.'
  },
  aceptable: {
    label: 'Aceptable',
    labelEn: 'Acceptable',
    color: '#D97706',           // amber-600
    bgColor: '#FEF3C7',         // amber-100
    borderColor: '#FDE68A',     // amber-200
    icon: 'pi pi-exclamation-triangle',
    severity: 'warn',
    description: 'El nivel de cumplimiento cumple con los requisitos mínimos pero hay oportunidades de mejora.'
  },
  sobresaliente: {
    label: 'Sobresaliente',
    labelEn: 'Excellent',
    color: '#059669',           // emerald-600
    bgColor: '#D1FAE5',         // emerald-100
    borderColor: '#A7F3D0',     // emerald-200
    icon: 'pi pi-check-circle',
    severity: 'success',
    description: 'El nivel de cumplimiento excede los estándares esperados. Excelente desempeño.'
  }
};

// =============================================
// FUNCIONES DE EVALUACIÓN
// =============================================

/**
 * Evalúa un score contra los umbrales y retorna el resultado detallado
 *
 * @param score - Puntuación a evaluar (0-100)
 * @param umbrales - Configuración de umbrales (opcional, usa defaults)
 * @returns Resultado detallado de la evaluación
 */
export function evaluateThreshold(
  score: number,
  umbrales: Umbrales = DEFAULT_UMBRALES
): ThresholdResult {
  // Asegurar que el score esté en rango válido
  const normalizedScore = Math.max(0, Math.min(100, score));

  let level: ComplianceLevel;

  if (normalizedScore < umbrales.deficiente) {
    level = 'deficiente';
  } else if (normalizedScore < umbrales.sobresaliente) {
    level = 'aceptable';
  } else {
    level = 'sobresaliente';
  }

  const config = THRESHOLD_CONFIG[level];

  return {
    level,
    label: config.label,
    labelEn: config.labelEn,
    color: config.color,
    bgColor: config.bgColor,
    borderColor: config.borderColor,
    icon: config.icon,
    severity: config.severity,
    percentage: normalizedScore,
    description: config.description
  };
}

/**
 * Obtiene solo el nivel de compliance sin detalles adicionales
 */
export function getComplianceLevel(
  score: number,
  umbrales: Umbrales = DEFAULT_UMBRALES
): ComplianceLevel {
  if (score < umbrales.deficiente) return 'deficiente';
  if (score < umbrales.sobresaliente) return 'aceptable';
  return 'sobresaliente';
}

/**
 * Obtiene el color asociado a un nivel de compliance
 */
export function getComplianceColor(level: ComplianceLevel): string {
  return THRESHOLD_CONFIG[level].color;
}

/**
 * Obtiene el color de fondo asociado a un nivel
 */
export function getComplianceBgColor(level: ComplianceLevel): string {
  return THRESHOLD_CONFIG[level].bgColor;
}

/**
 * Obtiene la severidad para usar con p-tag de PrimeNG
 */
export function getComplianceSeverity(level: ComplianceLevel): 'danger' | 'warn' | 'success' {
  return THRESHOLD_CONFIG[level].severity;
}

/**
 * Obtiene el icono asociado a un nivel
 */
export function getComplianceIcon(level: ComplianceLevel): string {
  return THRESHOLD_CONFIG[level].icon;
}

/**
 * Obtiene la etiqueta localizada del nivel
 */
export function getComplianceLabel(level: ComplianceLevel, locale: 'es' | 'en' = 'es'): string {
  return locale === 'en' ? THRESHOLD_CONFIG[level].labelEn : THRESHOLD_CONFIG[level].label;
}

// =============================================
// FUNCIONES DE ESTILO PARA COMPONENTES
// =============================================

/**
 * Genera estilos CSS inline para un elemento basado en el nivel de compliance
 */
export function getComplianceStyles(level: ComplianceLevel): Record<string, string> {
  const config = THRESHOLD_CONFIG[level];
  return {
    color: config.color,
    backgroundColor: config.bgColor,
    borderColor: config.borderColor
  };
}

/**
 * Genera clases CSS para el nivel de compliance (usando PrimeFlex/PrimeNG)
 */
export function getComplianceClasses(level: ComplianceLevel): string {
  const classMap: Record<ComplianceLevel, string> = {
    deficiente: 'text-red-600 bg-red-100 border-red-200',
    aceptable: 'text-amber-600 bg-amber-100 border-amber-200',
    sobresaliente: 'text-green-600 bg-green-100 border-green-200'
  };
  return classMap[level];
}

/**
 * Obtiene el color para la barra de progreso basado en el score
 */
export function getProgressBarColor(
  score: number,
  umbrales: Umbrales = DEFAULT_UMBRALES
): string {
  const level = getComplianceLevel(score, umbrales);
  return THRESHOLD_CONFIG[level].color;
}

// =============================================
// FUNCIONES DE VALIDACIÓN Y UTILIDADES
// =============================================

/**
 * Valida que los umbrales estén correctamente configurados
 */
export function validateUmbrales(umbrales: Umbrales): boolean {
  return (
    umbrales.deficiente >= 0 &&
    umbrales.deficiente <= 100 &&
    umbrales.aceptable >= 0 &&
    umbrales.aceptable <= 100 &&
    umbrales.sobresaliente >= 0 &&
    umbrales.sobresaliente <= 100 &&
    umbrales.deficiente <= umbrales.aceptable &&
    umbrales.aceptable <= umbrales.sobresaliente
  );
}

/**
 * Normaliza umbrales para asegurar valores válidos
 */
export function normalizeUmbrales(umbrales: Partial<Umbrales>): Umbrales {
  return {
    deficiente: Math.max(0, Math.min(100, umbrales.deficiente ?? DEFAULT_UMBRALES.deficiente)),
    aceptable: Math.max(0, Math.min(100, umbrales.aceptable ?? DEFAULT_UMBRALES.aceptable)),
    sobresaliente: Math.max(0, Math.min(100, umbrales.sobresaliente ?? DEFAULT_UMBRALES.sobresaliente))
  };
}

/**
 * Calcula el porcentaje de avance hacia el siguiente nivel
 */
export function getProgressToNextLevel(
  score: number,
  umbrales: Umbrales = DEFAULT_UMBRALES
): { currentLevel: ComplianceLevel; nextLevel: ComplianceLevel | null; progress: number } {
  const currentLevel = getComplianceLevel(score, umbrales);

  if (currentLevel === 'sobresaliente') {
    return { currentLevel, nextLevel: null, progress: 100 };
  }

  if (currentLevel === 'deficiente') {
    const progress = (score / umbrales.deficiente) * 100;
    return { currentLevel, nextLevel: 'aceptable', progress: Math.round(progress) };
  }

  // Nivel aceptable
  const range = umbrales.sobresaliente - umbrales.deficiente;
  const progress = ((score - umbrales.deficiente) / range) * 100;
  return { currentLevel, nextLevel: 'sobresaliente', progress: Math.round(progress) };
}

/**
 * Obtiene una descripción del gap hacia el siguiente nivel
 */
export function getGapDescription(
  score: number,
  umbrales: Umbrales = DEFAULT_UMBRALES
): string {
  const level = getComplianceLevel(score, umbrales);

  if (level === 'sobresaliente') {
    return 'Has alcanzado el nivel máximo de cumplimiento.';
  }

  if (level === 'deficiente') {
    const gap = umbrales.deficiente - score;
    return `Necesitas ${gap} puntos más para alcanzar el nivel Aceptable.`;
  }

  const gap = umbrales.sobresaliente - score;
  return `Necesitas ${gap} puntos más para alcanzar el nivel Sobresaliente.`;
}

// =============================================
// EXPORTACIONES PARA USO COMÚN
// =============================================

export const ThresholdUtils = {
  evaluate: evaluateThreshold,
  getLevel: getComplianceLevel,
  getColor: getComplianceColor,
  getBgColor: getComplianceBgColor,
  getSeverity: getComplianceSeverity,
  getIcon: getComplianceIcon,
  getLabel: getComplianceLabel,
  getStyles: getComplianceStyles,
  getClasses: getComplianceClasses,
  getProgressBarColor,
  validate: validateUmbrales,
  normalize: normalizeUmbrales,
  getProgressToNext: getProgressToNextLevel,
  getGapDescription
};
