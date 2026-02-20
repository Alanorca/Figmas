# Documentacion Completa del Sistema de Eventos

## Indice

1. [Arquitectura General](#arquitectura-general)
2. [Modelos de Datos](#modelos-de-datos)
3. [CRUD de Eventos (Incidentes, Defectos, Riesgos)](#crud-de-eventos)
4. [CRUD de Plantillas (Subtipos de Eventos)](#crud-de-plantillas)
5. [Servicios](#servicios)
6. [Componentes](#componentes)

---

## Arquitectura General

El sistema de eventos esta construido con:

- **Angular 18+** con componentes standalone
- **PrimeNG** para componentes UI (Tables, Cards, Dialogs, Tabs, Buttons, etc.)
- **IndexedDB** para almacenamiento local via `IndexedDBService`
- **Angular Signals** para manejo de estado reactivo
- **Sistema de plantillas dinamicas** para propiedades personalizables

### Estructura de Archivos

```
src/app/
├── models/
│   └── eventos.models.ts          # Modelos e interfaces
├── services/
│   ├── eventos.service.ts         # Servicio CRUD de eventos
│   └── evento-subtipos.service.ts # Servicio CRUD de plantillas
└── pages/
    ├── eventos/                   # Vista unificada de eventos
    ├── evento-subtipos/           # Gestion de plantillas
    └── evento-subtipo-crear/      # Wizard de creacion de plantillas
```

---

## Modelos de Datos

### Ubicacion: `src/app/models/eventos.models.ts`

### Enumeraciones Principales

#### EventType (Tipo de Evento)
```typescript
export enum EventType {
  RISK = 1,      // Riesgo
  INCIDENT = 2,  // Incidente
  DEFECT = 3     // Defecto
}
```

#### EventStatus (Estado del Evento)
```typescript
export enum EventStatus {
  DRAFT = 'draft',           // Borrador
  OPEN = 'open',             // Abierto
  IN_PROGRESS = 'in_progress', // En progreso
  RESOLVED = 'resolved',     // Resuelto
  CLOSED = 'closed',         // Cerrado
  CANCELLED = 'cancelled'    // Cancelado
}
```

#### EventSeverity (Severidad)
```typescript
export enum EventSeverity {
  CRITICAL = 'critical',         // Critica
  HIGH = 'high',                 // Alta
  MEDIUM = 'medium',             // Media
  LOW = 'low',                   // Baja
  INFORMATIONAL = 'informational' // Informativa
}
```

#### PropertyDataType (Tipos de Propiedades Dinamicas)
```typescript
export enum PropertyDataType {
  TEXT = 'TEXT',                   // Campo de texto
  INTEGER = 'INTEGER',             // Numero entero
  DECIMAL = 'DECIMAL',             // Numero decimal
  DATE = 'DATE',                   // Fecha
  BOOLEAN = 'BOOLEAN',             // Verdadero/Falso
  SELECT = 'SELECT',               // Selector unico
  MULTISELECT = 'MULTISELECT',     // Selector multiple
  AUTOINCREMENTAL = 'AUTOINCREMENTAL', // Autoincremental
  JSON = 'JSON'                    // Objeto JSON
}
```

### Interfaces Principales

#### Event (Evento)
```typescript
export interface Event {
  id: string;
  code: string;                    // Codigo unico (ej: INC-001, DEF-001, RSK-001)
  title: string;                   // Titulo del evento
  description: string;             // Descripcion detallada
  type: EventType;                 // Tipo (1=Riesgo, 2=Incidente, 3=Defecto)
  subTypeId?: string;              // ID de la plantilla asociada
  status: EventStatus;             // Estado actual
  severity: EventSeverity;         // Nivel de severidad
  priority: number;                // Prioridad (1-5)

  // Responsables
  reportedBy: string;              // Quien reporto
  assignedTo?: string;             // Asignado a

  // Fechas
  reportedAt: Date;                // Fecha de reporte
  occurredAt?: Date;               // Fecha de ocurrencia
  detectedAt?: Date;               // Fecha de deteccion
  resolvedAt?: Date;               // Fecha de resolucion
  closedAt?: Date;                 // Fecha de cierre
  dueDate?: Date;                  // Fecha limite

  // Impacto
  impactDescription?: string;      // Descripcion del impacto
  affectedAreas?: string[];        // Areas afectadas
  estimatedCost?: number;          // Costo estimado
  actualCost?: number;             // Costo real

  // Resolucion
  rootCause?: string;              // Causa raiz
  resolution?: string;             // Resolucion aplicada
  preventiveMeasures?: string;     // Medidas preventivas

  // Relaciones
  relatedAssetIds?: string[];      // Activos relacionados
  relatedProcessIds?: string[];    // Procesos relacionados
  relatedEventIds?: string[];      // Eventos relacionados

  // Propiedades dinamicas (de la plantilla)
  customProperties?: Record<string, any>;

  // Adjuntos y comentarios
  attachments?: EventAttachment[];
  comments?: EventComment[];

  // Historial
  history?: EventHistoryEntry[];

  // Metadata
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

#### EventSubType (Plantilla/Subtipo)
```typescript
export interface EventSubType {
  id: string;
  name: string;                    // Nombre de la plantilla
  description?: string;            // Descripcion
  eventType: EventType;            // Tipo de evento al que aplica
  code: string;                    // Codigo (ej: INC, DEF, RSK)
  icon?: string;                   // Icono PrimeNG
  color?: string;                  // Color de identificacion
  isActive: boolean;               // Activa/Inactiva
  isDefault: boolean;              // Plantilla por defecto para el tipo

  // Propiedades personalizadas
  properties: EventSubTypeProperty[];
  propertyGroups?: EventSubTypePropertyGroup[];

  // Workflow
  allowedStatuses?: EventStatus[];
  defaultStatus?: EventStatus;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

#### EventSubTypeProperty (Propiedad de Plantilla)
```typescript
export interface EventSubTypeProperty {
  id: string;
  name: string;                    // Nombre interno (clave)
  label: string;                   // Etiqueta visible
  description?: string;            // Descripcion/ayuda
  dataType: PropertyDataType;      // Tipo de dato
  isRequired: boolean;             // Obligatorio
  isUnique: boolean;               // Valor unico
  defaultValue?: any;              // Valor por defecto

  // Validaciones
  minValue?: number;               // Valor minimo (numeros)
  maxValue?: number;               // Valor maximo (numeros)
  minLength?: number;              // Longitud minima (texto)
  maxLength?: number;              // Longitud maxima (texto)
  pattern?: string;                // Patron regex

  // Para SELECT/MULTISELECT
  options?: PropertyOption[];      // Opciones disponibles

  // Organizacion
  groupId?: string;                // Grupo al que pertenece
  order: number;                   // Orden de aparicion

  // UI
  placeholder?: string;
  helpText?: string;
  showInTable?: boolean;           // Mostrar en tabla
  showInCard?: boolean;            // Mostrar en tarjeta
}
```

#### EventSubTypePropertyGroup (Grupo de Propiedades)
```typescript
export interface EventSubTypePropertyGroup {
  id: string;
  name: string;                    // Nombre del grupo
  description?: string;
  order: number;                   // Orden del grupo
  isCollapsible: boolean;          // Se puede colapsar
  isCollapsedByDefault: boolean;   // Colapsado por defecto
}
```

---

## CRUD de Eventos

### Servicio: `src/app/services/eventos.service.ts`

El servicio `EventosService` maneja todas las operaciones CRUD para los tres tipos de eventos (Incidentes, Defectos, Riesgos) de forma unificada.

### Signals de Estado

```typescript
// Estado principal
events = signal<Event[]>([]);
loading = signal<boolean>(false);
error = signal<string | null>(null);

// Filtros computados por tipo
risks = computed(() => this.events().filter(e => e.type === EventType.RISK));
incidents = computed(() => this.events().filter(e => e.type === EventType.INCIDENT));
defects = computed(() => this.events().filter(e => e.type === EventType.DEFECT));
```

### Operaciones CRUD

#### CREATE - Crear Evento
```typescript
async createEvent(eventData: Partial<Event>): Promise<Event>
```

**Descripcion:** Crea un nuevo evento (incidente, defecto o riesgo).

**Parametros:**
- `eventData`: Objeto parcial con los datos del evento

**Proceso:**
1. Genera un ID unico con `crypto.randomUUID()`
2. Genera el codigo automatico segun tipo (INC-XXX, DEF-XXX, RSK-XXX)
3. Asigna valores por defecto (status: OPEN, fechas, etc.)
4. Guarda en IndexedDB via `indexedDBService.saveItem('events', event)`
5. Actualiza el signal de eventos
6. Retorna el evento creado

**Ejemplo de uso:**
```typescript
const nuevoIncidente = await eventosService.createEvent({
  title: 'Fallo en servidor web',
  description: 'El servidor web no responde',
  type: EventType.INCIDENT,
  severity: EventSeverity.HIGH,
  reportedBy: 'admin@company.com'
});
```

#### READ - Leer Eventos
```typescript
async loadEvents(): Promise<void>
```

**Descripcion:** Carga todos los eventos desde IndexedDB.

**Proceso:**
1. Establece `loading(true)`
2. Obtiene datos de IndexedDB via `indexedDBService.getAll('events')`
3. Si no hay datos, carga datos semilla
4. Actualiza el signal `events`
5. Establece `loading(false)`

**Metodos de consulta adicionales:**
```typescript
getEventById(id: string): Event | undefined
getEventsByType(type: EventType): Event[]
getEventsByStatus(status: EventStatus): Event[]
getEventsBySeverity(severity: EventSeverity): Event[]
```

#### UPDATE - Actualizar Evento
```typescript
async updateEvent(id: string, updates: Partial<Event>): Promise<Event>
```

**Descripcion:** Actualiza un evento existente.

**Parametros:**
- `id`: ID del evento a actualizar
- `updates`: Campos a actualizar

**Proceso:**
1. Busca el evento existente
2. Fusiona los cambios con spread operator
3. Actualiza `updatedAt` y `updatedBy`
4. Registra en historial si hay cambios significativos
5. Guarda en IndexedDB
6. Actualiza el signal

**Ejemplo:**
```typescript
await eventosService.updateEvent('event-123', {
  status: EventStatus.IN_PROGRESS,
  assignedTo: 'tecnico@company.com'
});
```

#### DELETE - Eliminar Evento
```typescript
async deleteEvent(id: string): Promise<void>
```

**Descripcion:** Elimina un evento permanentemente.

**Proceso:**
1. Elimina de IndexedDB via `indexedDBService.deleteItem('events', id)`
2. Actualiza el signal removiendo el evento

### Operaciones Especiales

#### Cambio de Estado
```typescript
async changeStatus(id: string, newStatus: EventStatus, comment?: string): Promise<Event>
```

Cambia el estado de un evento con registro en historial.

#### Agregar Comentario
```typescript
async addComment(eventId: string, content: string, author: string): Promise<Event>
```

Agrega un comentario al evento.

#### Vincular Activo
```typescript
async linkAsset(eventId: string, assetId: string): Promise<Event>
```

Vincula un activo al evento.

#### Vincular Proceso
```typescript
async linkProcess(eventId: string, processId: string): Promise<Event>
```

Vincula un proceso al evento.

#### Vincular Evento Relacionado
```typescript
async linkRelatedEvent(eventId: string, relatedEventId: string): Promise<Event>
```

Vincula otro evento como relacionado.

### Estadisticas
```typescript
getStatsByType(): { risks: number; incidents: number; defects: number; total: number }
getStatsBySeverity(): Record<EventSeverity, number>
getStatsOverall(): {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number;
}
```

---

## CRUD de Plantillas

### Servicio: `src/app/services/evento-subtipos.service.ts`

El servicio `EventoSubtiposService` maneja las plantillas (subtipos) que definen propiedades personalizadas para los eventos.

### Signals de Estado

```typescript
eventSubTypes = signal<EventSubType[]>([]);
loading = signal<boolean>(false);
error = signal<string | null>(null);

// Filtros computados
riskSubTypes = computed(() => this.eventSubTypes().filter(s => s.eventType === EventType.RISK));
incidentSubTypes = computed(() => this.eventSubTypes().filter(s => s.eventType === EventType.INCIDENT));
defectSubTypes = computed(() => this.eventSubTypes().filter(s => s.eventType === EventType.DEFECT));
activeSubTypes = computed(() => this.eventSubTypes().filter(s => s.isActive));
```

### Operaciones CRUD de Plantillas

#### CREATE - Crear Plantilla
```typescript
async createEventSubType(data: Partial<EventSubType>): Promise<EventSubType>
```

**Descripcion:** Crea una nueva plantilla de evento.

**Parametros:**
- `data`: Datos de la plantilla

**Proceso:**
1. Genera ID unico
2. Asigna valores por defecto (isActive: true, arrays vacios)
3. Guarda en IndexedDB
4. Actualiza signal
5. Retorna plantilla creada

**Ejemplo:**
```typescript
const plantilla = await eventoSubtiposService.createEventSubType({
  name: 'Incidente de Seguridad',
  eventType: EventType.INCIDENT,
  code: 'SEC',
  description: 'Plantilla para incidentes de seguridad informatica',
  properties: [],
  propertyGroups: []
});
```

#### READ - Leer Plantillas
```typescript
async loadEventSubTypes(): Promise<void>
```

**Metodos de consulta:**
```typescript
getEventSubTypeById(id: string): EventSubType | undefined
getEventSubTypesByType(type: EventType): EventSubType[]
getDefaultSubType(type: EventType): EventSubType | undefined
```

#### UPDATE - Actualizar Plantilla
```typescript
async updateEventSubType(id: string, updates: Partial<EventSubType>): Promise<EventSubType>
```

#### DELETE - Eliminar Plantilla
```typescript
async deleteEventSubType(id: string): Promise<void>
```

### Gestion de Propiedades

#### Agregar Propiedad
```typescript
async addProperty(subTypeId: string, property: Partial<EventSubTypeProperty>): Promise<EventSubType>
```

**Ejemplo:**
```typescript
await eventoSubtiposService.addProperty('subtipo-123', {
  name: 'sistema_afectado',
  label: 'Sistema Afectado',
  dataType: PropertyDataType.SELECT,
  isRequired: true,
  options: [
    { value: 'erp', label: 'ERP' },
    { value: 'crm', label: 'CRM' },
    { value: 'web', label: 'Sitio Web' }
  ]
});
```

#### Actualizar Propiedad
```typescript
async updateProperty(
  subTypeId: string,
  propertyId: string,
  updates: Partial<EventSubTypeProperty>
): Promise<EventSubType>
```

#### Eliminar Propiedad
```typescript
async deleteProperty(subTypeId: string, propertyId: string): Promise<EventSubType>
```

#### Reordenar Propiedades
```typescript
async reorderProperties(subTypeId: string, propertyIds: string[]): Promise<EventSubType>
```

### Gestion de Grupos

#### Agregar Grupo
```typescript
async addPropertyGroup(
  subTypeId: string,
  group: Partial<EventSubTypePropertyGroup>
): Promise<EventSubType>
```

#### Actualizar Grupo
```typescript
async updatePropertyGroup(
  subTypeId: string,
  groupId: string,
  updates: Partial<EventSubTypePropertyGroup>
): Promise<EventSubType>
```

#### Eliminar Grupo
```typescript
async deletePropertyGroup(subTypeId: string, groupId: string): Promise<EventSubType>
```

### Operaciones Especiales

#### Clonar Plantilla
```typescript
async cloneEventSubType(id: string, newName: string): Promise<EventSubType>
```

Crea una copia de la plantilla con nuevo nombre.

#### Exportar Plantilla (JSON)
```typescript
exportEventSubType(id: string): string | null
```

Retorna la plantilla como string JSON para descarga.

#### Importar Plantilla (JSON)
```typescript
async importEventSubType(jsonString: string): Promise<EventSubType>
```

Importa una plantilla desde JSON, generando nuevos IDs.

#### Establecer como Predeterminada
```typescript
async setAsDefault(id: string): Promise<EventSubType>
```

Marca la plantilla como predeterminada para su tipo de evento.

#### Activar/Desactivar
```typescript
async toggleActive(id: string): Promise<EventSubType>
```

---

## Componentes

### EventosComponent

**Ubicacion:** `src/app/pages/eventos/eventos.ts`

**Descripcion:** Vista unificada con pestanas para gestionar los tres tipos de eventos.

#### Estructura de Tabs
```html
<p-tabs [value]="activeTab()" (valueChange)="onTabChange($event)">
  <p-tablist>
    <p-tab value="riesgos">Riesgos</p-tab>
    <p-tab value="incidentes">Incidentes</p-tab>
    <p-tab value="defectos">Defectos</p-tab>
  </p-tablist>
</p-tabs>
```

#### Signals de Estado
```typescript
activeTab = signal<'riesgos' | 'incidentes' | 'defectos'>('riesgos');
searchText = signal<string>('');
currentEventType = computed(() => {
  switch (this.activeTab()) {
    case 'riesgos': return EventType.RISK;
    case 'incidentes': return EventType.INCIDENT;
    case 'defectos': return EventType.DEFECT;
  }
});
```

#### Funcionalidades
- Listado en tabla con paginacion
- Busqueda por texto
- Filtros por estado y severidad
- Creacion de nuevos eventos
- Edicion inline
- Cambio de estado
- Eliminacion con confirmacion

### EventoSubtiposComponent

**Ubicacion:** `src/app/pages/evento-subtipos/evento-subtipos.ts`

**Descripcion:** Gestion de plantillas/subtipos de eventos.

#### Funcionalidades
- Listado de plantillas por tipo de evento
- Crear nueva plantilla (navega al wizard)
- Editar plantilla existente
- Clonar plantilla
- Exportar a JSON
- Importar desde JSON
- Activar/Desactivar plantilla
- Establecer como predeterminada
- Eliminar plantilla

#### Acciones de la Tabla
```typescript
// Clonar
async clonar(subtipo: EventSubType) {
  const nuevoNombre = `${subtipo.name} (Copia)`;
  await this.eventoSubtiposService.cloneEventSubType(subtipo.id, nuevoNombre);
}

// Exportar
exportar(subtipo: EventSubType) {
  const json = this.eventoSubtiposService.exportEventSubType(subtipo.id);
  if (json) {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subtipo.name}.json`;
    a.click();
  }
}

// Importar
async importar(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const text = await file.text();
    await this.eventoSubtiposService.importEventSubType(text);
  }
}
```

### EventoSubtipoCrearComponent

**Ubicacion:** `src/app/pages/evento-subtipo-crear/evento-subtipo-crear.ts`

**Descripcion:** Wizard de 3 pasos para crear/editar plantillas.

#### Pasos del Wizard

**Paso 1: Informacion Basica**
- Nombre de la plantilla
- Codigo
- Tipo de evento (Riesgo/Incidente/Defecto)
- Descripcion
- Icono
- Color

**Paso 2: Grupos de Propiedades**
- Crear grupos para organizar propiedades
- Nombre del grupo
- Descripcion
- Orden
- Colapsable (si/no)
- Colapsado por defecto

**Paso 3: Propiedades**
- Crear propiedades personalizadas
- Asignar a grupos
- Configurar tipo de dato
- Configurar validaciones
- Configurar opciones (para SELECT/MULTISELECT)

#### Signals del Componente
```typescript
currentStep = signal<number>(1);
isEditMode = signal<boolean>(false);
subTypeId = signal<string | null>(null);

// Formulario
form = signal<Partial<EventSubType>>({
  name: '',
  code: '',
  description: '',
  eventType: EventType.INCIDENT,
  icon: 'pi-exclamation-circle',
  color: '#3B82F6',
  properties: [],
  propertyGroups: []
});
```

#### Navegacion del Wizard
```typescript
nextStep() {
  if (this.currentStep() < 3) {
    this.currentStep.update(s => s + 1);
  }
}

prevStep() {
  if (this.currentStep() > 1) {
    this.currentStep.update(s => s - 1);
  }
}

async save() {
  if (this.isEditMode()) {
    await this.eventoSubtiposService.updateEventSubType(
      this.subTypeId()!,
      this.form()
    );
  } else {
    await this.eventoSubtiposService.createEventSubType(this.form());
  }
  this.router.navigate(['/evento-subtipos']);
}
```

---

## Flujos de Trabajo

### Flujo de Creacion de Evento

```
1. Usuario selecciona tipo de evento (Riesgo/Incidente/Defecto)
2. Sistema muestra formulario con campos base
3. Si hay plantillas disponibles, usuario selecciona una
4. Sistema carga propiedades dinamicas de la plantilla
5. Usuario completa formulario
6. Sistema genera codigo automatico (INC-001, DEF-001, RSK-001)
7. Sistema guarda en IndexedDB
8. Evento aparece en listado con estado OPEN
```

### Flujo de Creacion de Plantilla

```
1. Usuario accede a "Gestion de Plantillas"
2. Click en "Nueva Plantilla"
3. Wizard Paso 1: Datos basicos
   - Nombre, codigo, tipo, descripcion, icono, color
4. Wizard Paso 2: Grupos (opcional)
   - Crear grupos para organizar propiedades
5. Wizard Paso 3: Propiedades
   - Agregar propiedades personalizadas
   - Configurar tipo, validaciones, opciones
6. Guardar plantilla
7. Plantilla disponible para nuevos eventos del tipo seleccionado
```

### Flujo de Cambio de Estado

```
1. Usuario selecciona evento
2. Click en "Cambiar Estado"
3. Selecciona nuevo estado
4. Opcionalmente agrega comentario
5. Sistema registra cambio en historial
6. Actualiza fechas correspondientes (resolvedAt, closedAt)
7. Guarda cambios
```

---

## Codigos de Evento

El sistema genera codigos automaticos segun el tipo:

| Tipo | Prefijo | Ejemplo |
|------|---------|---------|
| Riesgo | RSK | RSK-001 |
| Incidente | INC | INC-001 |
| Defecto | DEF | DEF-001 |

El numero se incrementa automaticamente basado en el ultimo codigo existente del mismo tipo.

---

## Almacenamiento

### IndexedDB Stores

| Store | Descripcion |
|-------|-------------|
| `events` | Eventos (incidentes, defectos, riesgos) |
| `event-subtypes` | Plantillas de eventos |

### Estructura de Datos en IndexedDB

```typescript
// Store: events
{
  id: "uuid",
  code: "INC-001",
  title: "Titulo del evento",
  type: 2,
  status: "open",
  // ... resto de campos
}

// Store: event-subtypes
{
  id: "uuid",
  name: "Nombre plantilla",
  eventType: 2,
  properties: [...],
  propertyGroups: [...]
}
```

---

## Consideraciones Tecnicas

### Performance
- Los signals de Angular proporcionan reactividad eficiente
- Las consultas computadas evitan recalculos innecesarios
- IndexedDB permite almacenamiento local rapido

### Escalabilidad
- El sistema de plantillas permite extensibilidad sin cambios en codigo
- Las propiedades dinamicas soportan cualquier tipo de dato
- Los grupos permiten organizar formularios complejos

### Mantenibilidad
- Separacion clara entre modelos, servicios y componentes
- Servicios independientes para eventos y plantillas
- Reutilizacion de codigo via template references

---

## Apendice: Iconos Disponibles

Los iconos utilizan la libreria PrimeIcons:

- `pi-exclamation-circle` - Incidente
- `pi-exclamation-triangle` - Riesgo
- `pi-bug` - Defecto
- `pi-shield` - Seguridad
- `pi-server` - Infraestructura
- `pi-database` - Base de datos
- `pi-code` - Desarrollo
- `pi-users` - Personas

---

*Documentacion generada para el proyecto orca-alan*
*Fecha: Enero 2026*
