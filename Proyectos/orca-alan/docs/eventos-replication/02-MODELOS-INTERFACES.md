# Modelos e Interfaces - Módulo Eventos

## Archivo: `src/app/models/eventos.models.ts`

---

## 1. Enums

```typescript
// Tipos de evento principales
export enum EventType {
  RISK = 1,
  INCIDENT = 2,
  DEFECT = 3
}

// Estados de evento
export enum EventStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

// Niveles de severidad
export enum SeverityLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational'
}

// Niveles de probabilidad (para riesgos)
export enum ProbabilityLevel {
  VERY_HIGH = 'very_high',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  VERY_LOW = 'very_low'
}

// Niveles de impacto
export enum ImpactLevel {
  CATASTROPHIC = 'catastrophic',
  MAJOR = 'major',
  MODERATE = 'moderate',
  MINOR = 'minor',
  NEGLIGIBLE = 'negligible'
}

// Tipos de datos para propiedades personalizadas
export enum PropertyDataType {
  TEXT = 'TEXT',
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  AUTOINCREMENTAL = 'AUTOINCREMENTAL',
  JSON = 'JSON'
}
```

---

## 2. Interfaces de Event SubType (Plantillas)

```typescript
// Subtipo de evento (plantilla)
export interface EventSubType {
  id: string;
  name: string;
  code: string;
  description: string;
  eventType: EventType;
  iconPath?: string;
  color?: string;
  properties: EventSubTypeProperty[];
  propertyGroups?: EventSubTypePropertyGroup[];
  isDefault: boolean;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Grupo de propiedades
export interface EventSubTypePropertyGroup {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

// Propiedad de subtipo
export interface EventSubTypeProperty {
  id: string;
  code: string;
  name: string;
  description?: string;
  dataType: PropertyDataType;
  propertyGroup: EventSubTypePropertyGroup | null;
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

// Opción para propiedades tipo select
export interface EventSubTypePropertyOption {
  id: string;
  value: string;
  label: string;
  displayOrder: number;
  isDefault: boolean;
}

// Metadatos de propiedad
export interface PropertyMetadata {
  columns?: number;
  helpText?: string;
  placeholder?: string;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  decimals?: number;
}

// Lógica condicional
export interface ConditionalLogicConfig {
  conditions: ConditionalRule[];
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require';
}

export interface ConditionalRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  logic?: 'AND' | 'OR';
}
```

---

## 3. Interfaces de Evento

```typescript
// Evento principal
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

  // Fechas
  initialDate?: string;
  resolvedAt?: string;
  detectedAt?: string;

  // Solución
  solution?: string;

  // Propagación (para riesgos)
  propagationLevel?: string;
  propagationSpeed?: string;

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
  linkedControlCount?: number;

  // Propiedades dinámicas (valores de campos custom)
  propertyValues?: EventPropertyValue[];

  // Responsables
  responsibleUserId?: string;
  createdBy?: string;
  updatedBy?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

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

// Referencia a subtipo
export interface EventSubTypeRef {
  id: string;
  code: string;
  name: string;
}

// Valor de propiedad dinámica
export interface EventPropertyValue {
  propertyId: string;
  propertyCode: string;
  value: any;
  displayValue?: string;
}

// Detalle de costo
export interface EventCostDetail {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
}

// Comentario de evento
export interface EventComment {
  id: string;
  eventId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}
```

---

## 4. DTOs de Request/Response

```typescript
// Request para crear subtipo
export interface CreateEventSubTypeRequest {
  name: string;
  code: string;
  description: string;
  eventTypeId: EventType;
  iconPath?: string;
  color?: string;
  isDefault?: boolean;
  propertyGroups: Omit<EventSubTypePropertyGroup, 'id'>[];
  properties: Omit<EventSubTypeProperty, 'id'>[];
}

// Request para actualizar subtipo
export interface UpdateEventSubTypeRequest {
  name: string;
  code: string;
  description: string;
  iconPath?: string;
  color?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

// Request para crear evento
export interface CreateEventRequest {
  title: string;
  description: string;
  eventTypeId: EventType;
  eventSubTypeId: string;
  eventStatusId?: EventStatus;
  initialSeverityId?: SeverityLevel;
  initialDate?: string;
  responsibleUserId?: string;
  affectedAssetIds?: string[];
  impactedProcessIds?: string[];
  propertyValues?: { propertyId: string; value: any }[];
}

// Request para actualizar evento
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  eventStatusId?: EventStatus;
  initialSeverityId?: SeverityLevel;
  solution?: string;
  resolvedAt?: string;
  propertyValues?: { propertyId: string; value: any }[];
}

// Response paginado
export interface EventListResponse {
  content: Event[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

// Parámetros de paginación
export interface EventPageable {
  page: number;
  size: number;
  sort?: string[];
}
```

---

## 5. Constantes UI

```typescript
// Opciones de tipo de evento
export const EVENT_TYPES: { label: string; value: EventType; icon: string; color: string }[] = [
  { label: 'Riesgo', value: EventType.RISK, icon: 'pi pi-exclamation-triangle', color: '#f59e0b' },
  { label: 'Incidente', value: EventType.INCIDENT, icon: 'pi pi-bolt', color: '#ef4444' },
  { label: 'Defecto', value: EventType.DEFECT, icon: 'pi pi-bug', color: '#8b5cf6' }
];

// Opciones de estado
export const EVENT_STATUS_OPTIONS: { label: string; value: EventStatus; severity: string }[] = [
  { label: 'Borrador', value: EventStatus.DRAFT, severity: 'secondary' },
  { label: 'Abierto', value: EventStatus.OPEN, severity: 'info' },
  { label: 'En Progreso', value: EventStatus.IN_PROGRESS, severity: 'warn' },
  { label: 'Resuelto', value: EventStatus.RESOLVED, severity: 'success' },
  { label: 'Cerrado', value: EventStatus.CLOSED, severity: 'contrast' },
  { label: 'Cancelado', value: EventStatus.CANCELLED, severity: 'danger' }
];

// Opciones de severidad
export const SEVERITY_OPTIONS: { label: string; value: SeverityLevel; severity: string }[] = [
  { label: 'Crítico', value: SeverityLevel.CRITICAL, severity: 'danger' },
  { label: 'Alto', value: SeverityLevel.HIGH, severity: 'warn' },
  { label: 'Medio', value: SeverityLevel.MEDIUM, severity: 'info' },
  { label: 'Bajo', value: SeverityLevel.LOW, severity: 'success' },
  { label: 'Informativo', value: SeverityLevel.INFORMATIONAL, severity: 'secondary' }
];

// Tipos de datos de propiedades
export const PROPERTY_DATA_TYPES: { label: string; value: PropertyDataType; icon: string }[] = [
  { label: 'Texto', value: PropertyDataType.TEXT, icon: 'pi pi-align-left' },
  { label: 'Número Entero', value: PropertyDataType.INTEGER, icon: 'pi pi-hashtag' },
  { label: 'Número Decimal', value: PropertyDataType.DECIMAL, icon: 'pi pi-percentage' },
  { label: 'Fecha', value: PropertyDataType.DATE, icon: 'pi pi-calendar' },
  { label: 'Booleano', value: PropertyDataType.BOOLEAN, icon: 'pi pi-check-square' },
  { label: 'Auto-incremental', value: PropertyDataType.AUTOINCREMENTAL, icon: 'pi pi-sort-numeric-up' },
  { label: 'JSON', value: PropertyDataType.JSON, icon: 'pi pi-code' }
];
```

---

## 6. Funciones Helper

```typescript
// Obtener label de tipo de evento
export function getEventTypeLabel(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.label ?? 'Desconocido';
}

// Obtener icono de tipo de evento
export function getEventTypeIcon(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.icon ?? 'pi pi-question';
}

// Obtener color de tipo de evento
export function getEventTypeColor(type: EventType): string {
  return EVENT_TYPES.find(t => t.value === type)?.color ?? '#6b7280';
}

// Obtener label de estado
export function getEventStatusLabel(status: EventStatus): string {
  return EVENT_STATUS_OPTIONS.find(s => s.value === status)?.label ?? 'Desconocido';
}

// Obtener severity de estado
export function getEventStatusSeverity(status: EventStatus): string {
  return EVENT_STATUS_OPTIONS.find(s => s.value === status)?.severity ?? 'secondary';
}

// Obtener label de severidad
export function getSeverityLabel(level: SeverityLevel): string {
  return SEVERITY_OPTIONS.find(s => s.value === level)?.label ?? 'Desconocido';
}

// Obtener severity de severidad
export function getSeveritySeverity(level: SeverityLevel): string {
  return SEVERITY_OPTIONS.find(s => s.value === level)?.severity ?? 'secondary';
}

// Generadores de IDs
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

// Defaults
export function getDefaultEventSubType(eventType: EventType): Partial<EventSubType> {
  return {
    name: '',
    code: '',
    description: '',
    eventType,
    isDefault: false,
    isActive: true,
    properties: [],
    propertyGroups: []
  };
}

export function getDefaultEvent(eventType: EventType, subTypeId?: string): Partial<Event> {
  return {
    title: '',
    description: '',
    eventType,
    eventSubType: subTypeId ? { id: subTypeId, code: '', name: '' } : undefined,
    eventStatus: EventStatus.DRAFT,
    initialSeverity: SeverityLevel.MEDIUM,
    propertyValues: [],
    createdAt: new Date().toISOString()
  };
}

export function getDefaultProperty(): Partial<EventSubTypeProperty> {
  return {
    code: '',
    name: '',
    description: '',
    dataType: PropertyDataType.TEXT,
    propertyGroup: null,
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
```
