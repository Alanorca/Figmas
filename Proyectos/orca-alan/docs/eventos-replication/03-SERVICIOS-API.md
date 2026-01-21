# Servicios y API - Módulo Eventos

## Archivo: `src/app/services/eventos.service.ts`

---

## 1. EventSubTypesService (Gestión de Plantillas)

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  EventSubType,
  EventSubTypeProperty,
  EventSubTypePropertyGroup,
  EventType,
  CreateEventSubTypeRequest,
  UpdateEventSubTypeRequest,
  generateEventSubTypeId,
  generatePropertyId,
  generatePropertyGroupId
} from '../models/eventos.models';

@Injectable({ providedIn: 'root' })
export class EventSubTypesService {
  private db = inject(IndexedDBService);

  // Estado reactivo
  eventSubTypes = signal<EventSubType[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computados por tipo de evento
  riskSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.RISK)
  );
  incidentSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.INCIDENT)
  );
  defectSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.DEFECT)
  );

  // ============ CRUD de Subtipos ============

  async loadEventSubTypes(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.db.getAll<EventSubType>('eventSubTypes');
      this.eventSubTypes.set(data);
    } catch (err) {
      this.error.set('Error cargando subtipos de evento');
    } finally {
      this.loading.set(false);
    }
  }

  async getEventSubTypeById(id: string): Promise<EventSubType | undefined> {
    return this.db.getById<EventSubType>('eventSubTypes', id);
  }

  async getEventSubTypesByEventType(eventType: EventType): Promise<EventSubType[]> {
    return this.eventSubTypes().filter(e => e.eventType === eventType && e.isActive);
  }

  async getDefaultEventSubType(eventType: EventType): Promise<EventSubType | undefined> {
    return this.eventSubTypes().find(e => e.eventType === eventType && e.isDefault);
  }

  async createEventSubType(request: CreateEventSubTypeRequest): Promise<EventSubType> {
    const newSubType: EventSubType = {
      id: generateEventSubTypeId(),
      ...request,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add('eventSubTypes', newSubType);
    this.eventSubTypes.update(list => [...list, newSubType]);
    return newSubType;
  }

  async updateEventSubType(id: string, request: UpdateEventSubTypeRequest): Promise<EventSubType | null> {
    const existing = await this.getEventSubTypeById(id);
    if (!existing) return null;

    const updated: EventSubType = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString()
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === id ? updated : e)
    );
    return updated;
  }

  async deleteEventSubType(id: string): Promise<boolean> {
    try {
      await this.db.delete('eventSubTypes', id);
      this.eventSubTypes.update(list => list.filter(e => e.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  async setAsDefault(id: string): Promise<EventSubType | null> {
    const subType = await this.getEventSubTypeById(id);
    if (!subType) return null;

    // Quitar default de otros del mismo tipo
    const sameType = this.eventSubTypes().filter(e => e.eventType === subType.eventType);
    for (const st of sameType) {
      if (st.isDefault && st.id !== id) {
        await this.updateEventSubType(st.id, { ...st, isDefault: false });
      }
    }

    return this.updateEventSubType(id, { ...subType, isDefault: true });
  }

  // ============ Gestión de Propiedades ============

  async createPropertyGroup(
    eventSubTypeId: string,
    group: Omit<EventSubTypePropertyGroup, 'id'>
  ): Promise<EventSubTypePropertyGroup | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const newGroup: EventSubTypePropertyGroup = {
      id: generatePropertyGroupId(),
      ...group
    };

    const updated = {
      ...subType,
      propertyGroups: [...(subType.propertyGroups || []), newGroup]
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return newGroup;
  }

  async deletePropertyGroup(eventSubTypeId: string, groupId: string): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    const updated = {
      ...subType,
      propertyGroups: (subType.propertyGroups || []).filter(g => g.id !== groupId),
      properties: subType.properties.map(p =>
        p.propertyGroup?.id === groupId ? { ...p, propertyGroup: null } : p
      )
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  async createProperty(
    eventSubTypeId: string,
    property: Omit<EventSubTypeProperty, 'id'>
  ): Promise<EventSubTypeProperty | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const newProperty: EventSubTypeProperty = {
      id: generatePropertyId(),
      ...property,
      displayOrder: subType.properties.length
    };

    const updated = {
      ...subType,
      properties: [...subType.properties, newProperty]
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return newProperty;
  }

  async updateProperty(
    eventSubTypeId: string,
    propertyId: string,
    property: Partial<EventSubTypeProperty>
  ): Promise<EventSubTypeProperty | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const existingProperty = subType.properties.find(p => p.id === propertyId);
    if (!existingProperty) return null;

    const updatedProperty = { ...existingProperty, ...property };

    const updated = {
      ...subType,
      properties: subType.properties.map(p =>
        p.id === propertyId ? updatedProperty : p
      )
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return updatedProperty;
  }

  async deleteProperty(eventSubTypeId: string, propertyId: string): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    const updated = {
      ...subType,
      properties: subType.properties.filter(p => p.id !== propertyId)
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  async reorderProperties(eventSubTypeId: string, propertyIds: string[]): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    const reorderedProperties = propertyIds.map((id, index) => {
      const prop = subType.properties.find(p => p.id === id);
      return prop ? { ...prop, displayOrder: index } : null;
    }).filter(Boolean) as EventSubTypeProperty[];

    const updated = {
      ...subType,
      properties: reorderedProperties
    };

    await this.db.update('eventSubTypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  // ============ Import/Export ============

  async cloneEventSubType(id: string, newName: string): Promise<EventSubType | null> {
    const original = await this.getEventSubTypeById(id);
    if (!original) return null;

    const clone: EventSubType = {
      ...original,
      id: generateEventSubTypeId(),
      name: newName,
      code: `${original.code}_copy`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add('eventSubTypes', clone);
    this.eventSubTypes.update(list => [...list, clone]);
    return clone;
  }

  async exportEventSubType(id: string): Promise<string | null> {
    const subType = await this.getEventSubTypeById(id);
    if (!subType) return null;
    return JSON.stringify(subType, null, 2);
  }

  async importEventSubType(jsonData: string): Promise<EventSubType | null> {
    try {
      const data = JSON.parse(jsonData);
      data.id = generateEventSubTypeId();
      data.code = `${data.code}_imported`;
      data.isDefault = false;
      data.createdAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();

      await this.db.add('eventSubTypes', data);
      this.eventSubTypes.update(list => [...list, data]);
      return data;
    } catch {
      return null;
    }
  }

  // ============ Catálogos ============

  getPropertyDataTypes() {
    return PROPERTY_DATA_TYPES;
  }
}
```

---

## 2. EventosService (Gestión de Eventos)

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  Event,
  EventType,
  EventStatus,
  CreateEventRequest,
  UpdateEventRequest,
  EventPageable,
  EventListResponse,
  generateEventId
} from '../models/eventos.models';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private db = inject(IndexedDBService);

  // Estado reactivo
  events = signal<Event[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Contadores por tipo
  riskCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.RISK).length
  );
  incidentCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.INCIDENT).length
  );
  defectCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.DEFECT).length
  );

  // Contadores por estado
  openCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.OPEN).length
  );
  inProgressCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.IN_PROGRESS).length
  );
  resolvedCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.RESOLVED).length
  );

  // ============ CRUD de Eventos ============

  async loadEvents(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.db.getAll<Event>('events');
      this.events.set(data);
    } catch (err) {
      this.error.set('Error cargando eventos');
    } finally {
      this.loading.set(false);
    }
  }

  async getEvents(
    eventType: EventType,
    pageable: EventPageable,
    subTypeId?: string
  ): Promise<EventListResponse> {
    let filtered = this.events().filter(e => e.eventType === eventType);

    if (subTypeId) {
      filtered = filtered.filter(e => e.eventSubType?.id === subTypeId);
    }

    // Ordenamiento
    if (pageable.sort?.length) {
      const [field, direction] = pageable.sort[0].split(',');
      filtered.sort((a, b) => {
        const aVal = (a as any)[field];
        const bVal = (b as any)[field];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    }

    // Paginación
    const total = filtered.length;
    const start = pageable.page * pageable.size;
    const content = filtered.slice(start, start + pageable.size);

    return {
      content,
      page: {
        size: pageable.size,
        number: pageable.page,
        totalElements: total,
        totalPages: Math.ceil(total / pageable.size)
      }
    };
  }

  async getEventById(id: string): Promise<Event | undefined> {
    return this.db.getById<Event>('events', id);
  }

  async createEvent(request: CreateEventRequest): Promise<Event> {
    const newEvent: Event = {
      id: generateEventId(),
      title: request.title,
      description: request.description,
      eventType: request.eventTypeId,
      eventSubType: request.eventSubTypeId
        ? { id: request.eventSubTypeId, code: '', name: '' }
        : undefined,
      eventStatus: request.eventStatusId || EventStatus.DRAFT,
      initialSeverity: request.initialSeverityId,
      initialDate: request.initialDate,
      responsibleUserId: request.responsibleUserId,
      affectedAssetIds: request.affectedAssetIds,
      impactedProcessIds: request.impactedProcessIds,
      propertyValues: request.propertyValues?.map(pv => ({
        propertyId: pv.propertyId,
        propertyCode: '',
        value: pv.value
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.db.add('events', newEvent);
    this.events.update(list => [...list, newEvent]);
    return newEvent;
  }

  async updateEvent(id: string, request: UpdateEventRequest): Promise<Event | null> {
    const existing = await this.getEventById(id);
    if (!existing) return null;

    const updated: Event = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString()
    };

    if (request.propertyValues) {
      updated.propertyValues = request.propertyValues.map(pv => ({
        propertyId: pv.propertyId,
        propertyCode: '',
        value: pv.value
      }));
    }

    await this.db.update('events', updated);
    this.events.update(list =>
      list.map(e => e.id === id ? updated : e)
    );
    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await this.db.delete('events', id);
      this.events.update(list => list.filter(e => e.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  // ============ Cambio de Estado ============

  async changeStatus(id: string, newStatus: EventStatus): Promise<Event | null> {
    const event = await this.getEventById(id);
    if (!event) return null;

    const updates: Partial<Event> = { eventStatus: newStatus };

    if (newStatus === EventStatus.RESOLVED) {
      updates.resolvedAt = new Date().toISOString();
    }

    return this.updateEvent(id, updates as UpdateEventRequest);
  }

  // ============ Filtros ============

  filterEvents(params: {
    eventType?: EventType;
    eventSubTypeId?: string;
    status?: EventStatus;
    severity?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }): Event[] {
    return this.events().filter(event => {
      if (params.eventType && event.eventType !== params.eventType) return false;
      if (params.eventSubTypeId && event.eventSubType?.id !== params.eventSubTypeId) return false;
      if (params.status && event.eventStatus !== params.status) return false;
      if (params.severity && event.initialSeverity !== params.severity) return false;
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        if (!event.title.toLowerCase().includes(searchLower) &&
            !event.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }

  // ============ Estadísticas ============

  getStatsByType(eventType: EventType) {
    const filtered = this.events().filter(e => e.eventType === eventType);
    return {
      total: filtered.length,
      draft: filtered.filter(e => e.eventStatus === EventStatus.DRAFT).length,
      open: filtered.filter(e => e.eventStatus === EventStatus.OPEN).length,
      inProgress: filtered.filter(e => e.eventStatus === EventStatus.IN_PROGRESS).length,
      resolved: filtered.filter(e => e.eventStatus === EventStatus.RESOLVED).length,
      closed: filtered.filter(e => e.eventStatus === EventStatus.CLOSED).length
    };
  }

  getStatsBySeverity(eventType?: EventType) {
    let filtered = this.events();
    if (eventType) {
      filtered = filtered.filter(e => e.eventType === eventType);
    }
    return {
      critical: filtered.filter(e => e.initialSeverity === 'critical').length,
      high: filtered.filter(e => e.initialSeverity === 'high').length,
      medium: filtered.filter(e => e.initialSeverity === 'medium').length,
      low: filtered.filter(e => e.initialSeverity === 'low').length,
      informational: filtered.filter(e => e.initialSeverity === 'informational').length
    };
  }

  // ============ Seed Data ============

  async seedData(): Promise<void> {
    const existing = await this.db.getAll<Event>('events');
    if (existing.length > 0) return;

    // Crear datos de ejemplo...
  }
}
```

---

## 3. API Endpoints (Referencia del Backend Original)

### Event SubTypes API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/event-subtypes` | Listar todos los subtipos |
| GET | `/api/event-subtypes/:id` | Obtener subtipo por ID |
| GET | `/api/event-subtypes/by-event-type/:typeId` | Filtrar por tipo de evento |
| GET | `/api/event-subtypes/default/:typeId` | Obtener subtipo default |
| POST | `/api/event-subtypes` | Crear subtipo |
| PUT | `/api/event-subtypes/:id` | Actualizar subtipo |
| DELETE | `/api/event-subtypes/:id` | Eliminar subtipo |
| PUT | `/api/event-subtypes/:id/set-default` | Establecer como default |
| POST | `/api/event-subtypes/:id/clone` | Clonar subtipo |
| GET | `/api/event-subtypes/:id/export` | Exportar como JSON |
| POST | `/api/event-subtypes/import` | Importar desde JSON |

### Properties API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/event-subtypes/:id/property-groups` | Crear grupo |
| GET | `/api/event-subtypes/:id/property-groups` | Listar grupos |
| DELETE | `/api/event-subtypes/:id/property-groups/:groupId` | Eliminar grupo |
| POST | `/api/event-subtypes/:id/properties` | Crear propiedad |
| PUT | `/api/event-subtypes/:id/properties/:propId` | Actualizar propiedad |
| DELETE | `/api/event-subtypes/:id/properties/:propId` | Eliminar propiedad |
| PUT | `/api/event-subtypes/:id/properties/reorder` | Reordenar propiedades |

### Events API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/events` | Listar eventos (paginado) |
| GET | `/api/events/:id` | Obtener evento por ID |
| POST | `/api/events` | Crear evento |
| PUT | `/api/events/:id` | Actualizar evento |
| DELETE | `/api/events/:id` | Eliminar evento |
| PUT | `/api/events/:id/status` | Cambiar estado |

### Query Parameters (GET /api/events)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| eventTypeId | number | Filtrar por tipo (1=RISK, 2=INCIDENT, 3=DEFECT) |
| eventSubTypeId | string | Filtrar por subtipo |
| status | string | Filtrar por estado |
| page | number | Número de página (0-indexed) |
| size | number | Tamaño de página |
| sort | string | Campo,dirección (ej: "createdAt,desc") |
| search | string | Búsqueda en título/descripción |
