// ============================================
// MÓDULO DE EVENTOS - Modelos e Interfaces
// ============================================

// ============ ENUMS ============

/**
 * Tipos de evento principales
 */
export enum EventType {
  RISK = 1,
  INCIDENT = 2,
  DEFECT = 3
}

/**
 * Estados de evento
 */
export enum EventStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

/**
 * Niveles de severidad
 */
export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

/**
 * Niveles de probabilidad (para riesgos)
 */
export enum ProbabilityLevel {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

/**
 * Niveles de impacto
 */
export enum ImpactLevel {
  CATASTROPHIC = 'catastrophic',
  MAJOR = 'major',
  MODERATE = 'moderate',
  MINOR = 'minor',
  NEGLIGIBLE = 'negligible'
}

/**
 * Tipos de datos para propiedades personalizadas
 */
export enum PropertyDataType {
  TEXT = 'TEXT',
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  AUTOINCREMENTAL = 'AUTOINCREMENTAL',
  JSON = 'JSON'
}

// ============ INTERFACES DE EVENT SUBTYPE (PLANTILLAS) ============

/**
 * Grupo de propiedades
 */
export interface EventSubTypePropertyGroup {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Opción para propiedades tipo select
 */
export interface EventSubTypePropertyOption {
  id: string;
  value: string;
  label: string;
  displayOrder: number;
  isDefault: boolean;
}

/**
 * Metadatos de propiedad
 */
export interface PropertyMetadata {
  columns?: number;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  decimals?: number;
  minLength?: number;
  maxLength?: number;
}

/**
 * Regla condicional
 */
export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logic?: 'AND' | 'OR';
}

/**
 * Configuración de lógica condicional
 */
export interface ConditionalLogicConfig {
  conditions: ConditionalRule[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

/**
 * Propiedad de subtipo de evento
 */
export interface EventSubTypeProperty {
  id: string;
  code: string;
  name: string;
  description?: string;
  dataType: PropertyDataType;
  propertyGroupId: string | null;
  isRequired: boolean;
  isReadOnly: boolean;
  isHidden: boolean;
  canBeList: boolean;
  isAutoIncrement: boolean;
  formula: string | null;
  isSystemGenerated: boolean;
  defaultValue: string | null;
  displayOrder: number;
  options: EventSubTypePropertyOption[];
  isActive: boolean;
  jsonSchema?: Record<string, unknown> | null;
  conditionalLogic?: ConditionalLogicConfig | null;
  metadata?: PropertyMetadata;
}

/**
 * Subtipo de evento (plantilla)
 */
export interface EventSubType {
  id: string;
  name: string;
  code: string;
  description: string;
  eventType: EventType;
  iconPath?: string;
  color?: string;
  properties: EventSubTypeProperty[];
  propertyGroups: EventSubTypePropertyGroup[];
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ INTERFACES DE EVENTO ============

/**
 * Referencia a subtipo
 */
export interface EventSubTypeRef {
  id: string;
  code: string;
  name: string;
}

/**
 * Valor de propiedad dinámica
 */
export interface EventPropertyValue {
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  value: any;
  displayValue?: string;
}

/**
 * Detalle de costo
 */
export interface EventCostDetail {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
}

/**
 * Comentario de evento
 */
export interface EventComment {
  id: string;
  eventId: string;
  content: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
}

/**
 * Evento principal
 */
export interface Event {
  id: string;
  title: string;
  description: string;

  // Clasificación
  eventType: EventType;
  eventSubType?: EventSubTypeRef;
  eventStatus: EventStatus;

  // Severidad e impacto
  initialSeverity?: SeverityLevel;
  calculatedImpactLevel?: SeverityLevel;
  probabilityLevel?: ProbabilityLevel;
  impactLevel?: ImpactLevel;

  // Fechas
  initialDate?: string;
  dueDate?: string;
  resolvedAt?: string;
  detectedAt?: string;
  closedAt?: string;

  // Solución
  solution?: string;

  // Costos
  costEvent?: number;
  costRemediation?: number;
  costDowntime?: number;
  costMitigation?: number;
  costDetails?: EventCostDetail[];

  // Relaciones
  rootCauseIds?: string[];
  affectedAssetIds?: string[];
  impactedProcessIds?: string[];
  linkedControlIds?: string[];
  relatedEventIds?: string[];

  // Propiedades dinámicas (valores de campos custom)
  propertyValues: EventPropertyValue[];

  // Comentarios
  comments?: EventComment[];

  // Responsables
  responsibleUserId?: string;
  responsibleUserName?: string;
  assignedToIds?: string[];

  // Auditoría
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;

  // Campos específicos de RISK
  manualConfidenceLevel?: number;
  propagatesToAssetIds?: string[];
  relatedProcessIds?: string[];

  // Campos específicos de INCIDENT
  materializedRiskIds?: string[];
  failedControlIds?: string[];
  realImpactScore?: number;
  acknowledgedAt?: string;
  resolutionTimeHours?: number;
  detectionTimeHours?: number;
  acknowledgementTimeHours?: number;
  escalationCount?: number;
  reopenCount?: number;
  affectedUserCount?: number;
  downtimeMinutes?: number;

  // Campos específicos de DEFECT
  generatedRiskIds?: string[];
  causedIncidentIds?: string[];
}

// ============ DTOs DE REQUEST/RESPONSE ============

/**
 * Request para crear subtipo
 */
export interface CreateEventSubTypeRequest {
  name: string;
  code: string;
  description: string;
  eventType: EventType;
  iconPath?: string;
  color?: string;
  isDefault?: boolean;
  propertyGroups: Omit<EventSubTypePropertyGroup, 'id'>[];
  properties: Omit<EventSubTypeProperty, 'id'>[];
}

/**
 * Request para actualizar subtipo
 */
export interface UpdateEventSubTypeRequest {
  name?: string;
  code?: string;
  description?: string;
  iconPath?: string;
  color?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Request para crear evento
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: EventType;
  eventSubTypeId?: string;
  eventStatus?: EventStatus;
  initialSeverity?: SeverityLevel;
  probabilityLevel?: ProbabilityLevel;
  impactLevel?: ImpactLevel;
  initialDate?: string;
  dueDate?: string;
  responsibleUserId?: string;
  affectedAssetIds?: string[];
  impactedProcessIds?: string[];
  propertyValues?: { propertyId: string; value: any }[];
}

/**
 * Request para actualizar evento
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventStatus?: EventStatus;
  initialSeverity?: SeverityLevel;
  probabilityLevel?: ProbabilityLevel;
  impactLevel?: ImpactLevel;
  solution?: string;
  dueDate?: string;
  resolvedAt?: string;
  responsibleUserId?: string;
  propertyValues?: { propertyId: string; value: any }[];
}

/**
 * Response paginado
 */
export interface EventListResponse {
  content: Event[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

/**
 * Parámetros de paginación
 */
export interface EventPageable {
  page: number;
  size: number;
  sort?: string[];
}

/**
 * Parámetros de filtro
 */
export interface EventFilterParams {
  eventType?: EventType;
  eventSubTypeId?: string;
  status?: EventStatus;
  severity?: SeverityLevel;
  fromDate?: string;
  toDate?: string;
  search?: string;
  responsibleUserId?: string;
}

// ============ CONSTANTES UI ============

/**
 * Opciones de tipo de evento
 */
export const EVENT_TYPES: { label: string; value: EventType; icon: string; color: string }[] = [
  { label: 'Riesgo', value: EventType.RISK, icon: 'pi pi-exclamation-triangle', color: '#f59e0b' },
  { label: 'Incidente', value: EventType.INCIDENT, icon: 'pi pi-bolt', color: '#ef4444' },
  { label: 'Defecto', value: EventType.DEFECT, icon: 'pi pi-bug', color: '#8b5cf6' }
];

/**
 * Opciones de estado
 */
export const EVENT_STATUS_OPTIONS: { label: string; value: EventStatus; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' }[] = [
  { label: 'Borrador', value: EventStatus.DRAFT, severity: 'secondary' },
  { label: 'Abierto', value: EventStatus.OPEN, severity: 'info' },
  { label: 'En Progreso', value: EventStatus.IN_PROGRESS, severity: 'warn' },
  { label: 'Resuelto', value: EventStatus.RESOLVED, severity: 'success' },
  { label: 'Cerrado', value: EventStatus.CLOSED, severity: 'contrast' },
  { label: 'Cancelado', value: EventStatus.CANCELLED, severity: 'danger' }
];

/**
 * Opciones de severidad
 */
export const SEVERITY_OPTIONS: { label: string; value: SeverityLevel; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' }[] = [
  { label: 'Crítico', value: SeverityLevel.CRITICAL, severity: 'danger' },
  { label: 'Alto', value: SeverityLevel.HIGH, severity: 'warn' },
  { label: 'Medio', value: SeverityLevel.MEDIUM, severity: 'info' },
  { label: 'Bajo', value: SeverityLevel.LOW, severity: 'success' },
  { label: 'Informativo', value: SeverityLevel.INFORMATIONAL, severity: 'secondary' }
];

/**
 * Opciones de probabilidad
 */
export const PROBABILITY_OPTIONS: { label: string; value: ProbabilityLevel; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' }[] = [
  { label: 'Muy Alta', value: ProbabilityLevel.VERY_HIGH, severity: 'danger' },
  { label: 'Alta', value: ProbabilityLevel.HIGH, severity: 'warn' },
  { label: 'Media', value: ProbabilityLevel.MEDIUM, severity: 'info' },
  { label: 'Baja', value: ProbabilityLevel.LOW, severity: 'success' },
  { label: 'Muy Baja', value: ProbabilityLevel.VERY_LOW, severity: 'secondary' }
];

/**
 * Opciones de impacto
 */
export const IMPACT_OPTIONS: { label: string; value: ImpactLevel; severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary' }[] = [
  { label: 'Catastrófico', value: ImpactLevel.CATASTROPHIC, severity: 'danger' },
  { label: 'Mayor', value: ImpactLevel.MAJOR, severity: 'warn' },
  { label: 'Moderado', value: ImpactLevel.MODERATE, severity: 'info' },
  { label: 'Menor', value: ImpactLevel.MINOR, severity: 'success' },
  { label: 'Despreciable', value: ImpactLevel.NEGLIGIBLE, severity: 'secondary' }
];

/**
 * Tipos de datos de propiedades
 */
export const PROPERTY_DATA_TYPES: { label: string; value: PropertyDataType; icon: string }[] = [
  { label: 'Texto', value: PropertyDataType.TEXT, icon: 'pi pi-align-left' },
  { label: 'Número Entero', value: PropertyDataType.INTEGER, icon: 'pi pi-hashtag' },
  { label: 'Número Decimal', value: PropertyDataType.DECIMAL, icon: 'pi pi-percentage' },
  { label: 'Fecha', value: PropertyDataType.DATE, icon: 'pi pi-calendar' },
  { label: 'Booleano', value: PropertyDataType.BOOLEAN, icon: 'pi pi-check-square' },
  { label: 'Selección', value: PropertyDataType.SELECT, icon: 'pi pi-list' },
  { label: 'Selección Múltiple', value: PropertyDataType.MULTISELECT, icon: 'pi pi-check-circle' },
  { label: 'Auto-incremental', value: PropertyDataType.AUTOINCREMENTAL, icon: 'pi pi-sort-numeric-up' },
  { label: 'JSON', value: PropertyDataType.JSON, icon: 'pi pi-code' }
];

// ============ FUNCIONES HELPER ============

/**
 * Obtener label de tipo de evento
 */
export function getEventTypeLabel(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.label ?? 'Desconocido';
}

/**
 * Obtener icono de tipo de evento
 */
export function getEventTypeIcon(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.icon ?? 'pi pi-question';
}

/**
 * Obtener color de tipo de evento
 */
export function getEventTypeColor(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.color ?? '#6b7280';
}

/**
 * Obtener label de estado
 */
export function getEventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_OPTIONS.find(s => s.value === status)?.label ?? 'Desconocido';
}

/**
 * Obtener severity de estado para p-tag
 */
export function getEventStatusSeverity(status: EventStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
  return EVENT_STATUS_OPTIONS.find(s => s.value === status)?.severity ?? 'secondary';
}

/**
 * Obtener label de severidad
 */
export function getSeverityLabel(level: SeverityLevel): string {
  return SEVERITY_OPTIONS.find(s => s.value === level)?.label ?? 'Desconocido';
}

/**
 * Obtener severity de severidad para p-tag
 */
export function getSeveritySeverity(level: SeverityLevel): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
  return SEVERITY_OPTIONS.find(s => s.value === level)?.severity ?? 'secondary';
}

/**
 * Obtener label de probabilidad
 */
export function getProbabilityLabel(level: ProbabilityLevel): string {
  return PROBABILITY_OPTIONS.find(p => p.value === level)?.label ?? 'Desconocido';
}

/**
 * Obtener label de impacto
 */
export function getImpactLabel(level: ImpactLevel): string {
  return IMPACT_OPTIONS.find(i => i.value === level)?.label ?? 'Desconocido';
}

/**
 * Obtener label de tipo de dato
 */
export function getPropertyDataTypeLabel(type: PropertyDataType): string {
  return PROPERTY_DATA_TYPES.find(t => t.value === type)?.label ?? 'Desconocido';
}

/**
 * Obtener icono de tipo de dato
 */
export function getPropertyDataTypeIcon(type: PropertyDataType): string {
  return PROPERTY_DATA_TYPES.find(t => t.value === type)?.icon ?? 'pi pi-question';
}

// ============ GENERADORES DE IDs ============

export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateEventSubTypeId(): string {
  return `est-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePropertyId(): string {
  return `prp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePropertyGroupId(): string {
  return `grp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePropertyOptionId(): string {
  return `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCommentId(): string {
  return `cmt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCostDetailId(): string {
  return `cst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ DEFAULTS ============

/**
 * Crear subtipo de evento por defecto
 */
export function getDefaultEventSubType(eventType: EventType): Partial<EventSubType> {
  return {
    name: '',
    code: '',
    description: '',
    eventType,
    color: eventType === EventType.RISK ? '#f59e0b' : eventType === EventType.INCIDENT ? '#ef4444' : '#8b5cf6',
    isDefault: false,
    isActive: true,
    properties: [],
    propertyGroups: []
  };
}

/**
 * Crear propiedad por defecto
 */
export function getDefaultProperty(): Partial<EventSubTypeProperty> {
  return {
    code: '',
    name: '',
    description: '',
    dataType: PropertyDataType.TEXT,
    propertyGroupId: null,
    isRequired: false,
    isReadOnly: false,
    isHidden: false,
    canBeList: false,
    isAutoIncrement: false,
    formula: null,
    isSystemGenerated: false,
    defaultValue: null,
    displayOrder: 0,
    options: [],
    isActive: true,
    metadata: {}
  };
}

/**
 * Crear grupo de propiedades por defecto
 */
export function getDefaultPropertyGroup(): Partial<EventSubTypePropertyGroup> {
  return {
    name: '',
    description: '',
    displayOrder: 0,
    isActive: true
  };
}

/**
 * Crear evento por defecto
 */
export function getDefaultEvent(eventType: EventType, subTypeId?: string): Partial<Event> {
  return {
    title: '',
    description: '',
    eventType,
    eventSubType: subTypeId ? { id: subTypeId, code: '', name: '' } : undefined,
    eventStatus: EventStatus.DRAFT,
    initialSeverity: SeverityLevel.MEDIUM,
    propertyValues: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ============ UTILIDADES ============

/**
 * Calcular nivel de riesgo basado en probabilidad e impacto
 */
export function calculateRiskLevel(probability: ProbabilityLevel, impact: ImpactLevel): SeverityLevel {
  const probWeight: Record<ProbabilityLevel, number> = {
    [ProbabilityLevel.VERY_HIGH]: 5,
    [ProbabilityLevel.HIGH]: 4,
    [ProbabilityLevel.MEDIUM]: 3,
    [ProbabilityLevel.LOW]: 2,
    [ProbabilityLevel.VERY_LOW]: 1
  };

  const impactWeight: Record<ImpactLevel, number> = {
    [ImpactLevel.CATASTROPHIC]: 5,
    [ImpactLevel.MAJOR]: 4,
    [ImpactLevel.MODERATE]: 3,
    [ImpactLevel.MINOR]: 2,
    [ImpactLevel.NEGLIGIBLE]: 1
  };

  const score = probWeight[probability] * impactWeight[impact];

  if (score >= 20) return SeverityLevel.CRITICAL;
  if (score >= 12) return SeverityLevel.HIGH;
  if (score >= 6) return SeverityLevel.MEDIUM;
  if (score >= 3) return SeverityLevel.LOW;
  return SeverityLevel.INFORMATIONAL;
}

/**
 * Formatear fecha para mostrar
 */
export function formatEventDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formatear fecha y hora para mostrar
 */
export function formatEventDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
