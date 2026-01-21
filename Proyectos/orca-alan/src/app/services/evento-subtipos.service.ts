import { Injectable, inject, signal, computed } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  EventSubType,
  EventSubTypeProperty,
  EventSubTypePropertyGroup,
  EventSubTypePropertyOption,
  EventType,
  PropertyDataType,
  CreateEventSubTypeRequest,
  UpdateEventSubTypeRequest,
  generateEventSubTypeId,
  generatePropertyId,
  generatePropertyGroupId,
  generatePropertyOptionId,
  getDefaultProperty,
  getDefaultPropertyGroup,
  PROPERTY_DATA_TYPES
} from '../models/eventos.models';

@Injectable({ providedIn: 'root' })
export class EventoSubtiposService {
  private db = inject(IndexedDBService);

  // ============ Estado Reactivo ============
  eventSubTypes = signal<EventSubType[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // ============ Computados por Tipo de Evento ============
  riskSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.RISK && e.isActive)
  );

  incidentSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.INCIDENT && e.isActive)
  );

  defectSubTypes = computed(() =>
    this.eventSubTypes().filter(e => e.eventType === EventType.DEFECT && e.isActive)
  );

  // Contadores
  totalCount = computed(() => this.eventSubTypes().length);
  activeCount = computed(() => this.eventSubTypes().filter(e => e.isActive).length);

  // ============ CRUD de Subtipos ============

  async loadEventSubTypes(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.db.getAll<EventSubType>('event_subtypes');
      this.eventSubTypes.set(data);
    } catch (err) {
      console.error('Error loading event subtypes:', err);
      this.error.set('Error cargando subtipos de evento');
    } finally {
      this.loading.set(false);
    }
  }

  async getEventSubTypeById(id: string): Promise<EventSubType | undefined> {
    // Primero buscar en el estado local
    const local = this.eventSubTypes().find(e => e.id === id);
    if (local) return local;

    // Si no está, buscar en la base de datos
    return this.db.get<EventSubType>('event_subtypes', id);
  }

  async getEventSubTypesByEventType(eventType: EventType): Promise<EventSubType[]> {
    return this.eventSubTypes().filter(e => e.eventType === eventType && e.isActive);
  }

  async getDefaultEventSubType(eventType: EventType): Promise<EventSubType | undefined> {
    return this.eventSubTypes().find(e => e.eventType === eventType && e.isDefault && e.isActive);
  }

  async createEventSubType(request: CreateEventSubTypeRequest): Promise<EventSubType> {
    const now = new Date().toISOString();

    // Generar IDs para grupos
    const propertyGroups: EventSubTypePropertyGroup[] = request.propertyGroups.map((g, index) => ({
      id: generatePropertyGroupId(),
      name: g.name,
      description: g.description,
      displayOrder: g.displayOrder ?? index,
      isActive: g.isActive ?? true
    }));

    // Generar IDs para propiedades
    const properties: EventSubTypeProperty[] = request.properties.map((p, index) => ({
      id: generatePropertyId(),
      code: p.code,
      name: p.name,
      description: p.description,
      dataType: p.dataType,
      propertyGroupId: p.propertyGroupId,
      isRequired: p.isRequired ?? false,
      isReadOnly: p.isReadOnly ?? false,
      isHidden: p.isHidden ?? false,
      canBeList: p.canBeList ?? false,
      isAutoIncrement: p.isAutoIncrement ?? false,
      formula: p.formula ?? null,
      isSystemGenerated: p.isSystemGenerated ?? false,
      defaultValue: p.defaultValue ?? null,
      displayOrder: p.displayOrder ?? index,
      options: (p.options || []).map((opt, optIndex) => ({
        id: generatePropertyOptionId(),
        value: opt.value,
        label: opt.label,
        displayOrder: opt.displayOrder ?? optIndex,
        isDefault: opt.isDefault ?? false
      })),
      isActive: p.isActive ?? true,
      jsonSchema: p.jsonSchema ?? null,
      conditionalLogic: p.conditionalLogic ?? null,
      metadata: p.metadata ?? {}
    }));

    const newSubType: EventSubType = {
      id: generateEventSubTypeId(),
      name: request.name,
      code: request.code,
      description: request.description,
      eventType: request.eventType,
      iconPath: request.iconPath,
      color: request.color,
      properties,
      propertyGroups,
      isDefault: request.isDefault ?? false,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    // Si es default, quitar default de otros
    if (newSubType.isDefault) {
      await this.clearDefaultForEventType(request.eventType);
    }

    await this.db.add('event_subtypes', newSubType);
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

    // Si se está estableciendo como default, quitar default de otros
    if (request.isDefault && !existing.isDefault) {
      await this.clearDefaultForEventType(existing.eventType);
    }

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === id ? updated : e)
    );

    return updated;
  }

  async deleteEventSubType(id: string): Promise<boolean> {
    try {
      await this.db.delete('event_subtypes', id);
      this.eventSubTypes.update(list => list.filter(e => e.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting event subtype:', err);
      return false;
    }
  }

  async toggleActive(id: string): Promise<EventSubType | null> {
    const subType = await this.getEventSubTypeById(id);
    if (!subType) return null;

    return this.updateEventSubType(id, { isActive: !subType.isActive });
  }

  async setAsDefault(id: string): Promise<EventSubType | null> {
    const subType = await this.getEventSubTypeById(id);
    if (!subType) return null;

    // Quitar default de otros del mismo tipo
    await this.clearDefaultForEventType(subType.eventType);

    return this.updateEventSubType(id, { isDefault: true });
  }

  private async clearDefaultForEventType(eventType: EventType): Promise<void> {
    const sameType = this.eventSubTypes().filter(e => e.eventType === eventType && e.isDefault);
    for (const st of sameType) {
      const updated = { ...st, isDefault: false, updatedAt: new Date().toISOString() };
      await this.db.put('event_subtypes', updated);
      this.eventSubTypes.update(list =>
        list.map(e => e.id === st.id ? updated : e)
      );
    }
  }

  // ============ Gestión de Grupos de Propiedades ============

  async addPropertyGroup(
    eventSubTypeId: string,
    group: Partial<EventSubTypePropertyGroup>
  ): Promise<EventSubTypePropertyGroup | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const newGroup: EventSubTypePropertyGroup = {
      id: generatePropertyGroupId(),
      name: group.name || 'Nuevo Grupo',
      description: group.description,
      displayOrder: group.displayOrder ?? subType.propertyGroups.length,
      isActive: group.isActive ?? true
    };

    const updated: EventSubType = {
      ...subType,
      propertyGroups: [...subType.propertyGroups, newGroup],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return newGroup;
  }

  async updatePropertyGroup(
    eventSubTypeId: string,
    groupId: string,
    updates: Partial<EventSubTypePropertyGroup>
  ): Promise<EventSubTypePropertyGroup | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const groupIndex = subType.propertyGroups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return null;

    const updatedGroup = { ...subType.propertyGroups[groupIndex], ...updates };
    const updatedGroups = [...subType.propertyGroups];
    updatedGroups[groupIndex] = updatedGroup;

    const updated: EventSubType = {
      ...subType,
      propertyGroups: updatedGroups,
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return updatedGroup;
  }

  async deletePropertyGroup(eventSubTypeId: string, groupId: string): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    // Remover grupo y desvincular propiedades
    const updated: EventSubType = {
      ...subType,
      propertyGroups: subType.propertyGroups.filter(g => g.id !== groupId),
      properties: subType.properties.map(p =>
        p.propertyGroupId === groupId ? { ...p, propertyGroupId: null } : p
      ),
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  // ============ Gestión de Propiedades ============

  async addProperty(
    eventSubTypeId: string,
    property: Partial<EventSubTypeProperty>
  ): Promise<EventSubTypeProperty | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const defaultProp = getDefaultProperty();
    const newProperty: EventSubTypeProperty = {
      id: generatePropertyId(),
      code: property.code || `prop_${Date.now()}`,
      name: property.name || 'Nueva Propiedad',
      description: property.description ?? defaultProp.description,
      dataType: property.dataType ?? PropertyDataType.TEXT,
      propertyGroupId: property.propertyGroupId ?? null,
      isRequired: property.isRequired ?? false,
      isReadOnly: property.isReadOnly ?? false,
      isHidden: property.isHidden ?? false,
      canBeList: property.canBeList ?? false,
      isAutoIncrement: property.isAutoIncrement ?? false,
      formula: property.formula ?? null,
      isSystemGenerated: property.isSystemGenerated ?? false,
      defaultValue: property.defaultValue ?? null,
      displayOrder: property.displayOrder ?? subType.properties.length,
      options: (property.options || []).map((opt, index) => ({
        id: generatePropertyOptionId(),
        value: opt.value,
        label: opt.label,
        displayOrder: opt.displayOrder ?? index,
        isDefault: opt.isDefault ?? false
      })),
      isActive: property.isActive ?? true,
      jsonSchema: property.jsonSchema ?? null,
      conditionalLogic: property.conditionalLogic ?? null,
      metadata: property.metadata ?? {}
    };

    const updated: EventSubType = {
      ...subType,
      properties: [...subType.properties, newProperty],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return newProperty;
  }

  async updateProperty(
    eventSubTypeId: string,
    propertyId: string,
    updates: Partial<EventSubTypeProperty>
  ): Promise<EventSubTypeProperty | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const propIndex = subType.properties.findIndex(p => p.id === propertyId);
    if (propIndex === -1) return null;

    const updatedProperty = { ...subType.properties[propIndex], ...updates };
    const updatedProperties = [...subType.properties];
    updatedProperties[propIndex] = updatedProperty;

    const updated: EventSubType = {
      ...subType,
      properties: updatedProperties,
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return updatedProperty;
  }

  async deleteProperty(eventSubTypeId: string, propertyId: string): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    const updated: EventSubType = {
      ...subType,
      properties: subType.properties.filter(p => p.id !== propertyId),
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
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

    // Agregar propiedades que no están en la lista (por si acaso)
    const missingProps = subType.properties.filter(p => !propertyIds.includes(p.id));

    const updated: EventSubType = {
      ...subType,
      properties: [...reorderedProperties, ...missingProps],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  // ============ Opciones de Propiedad ============

  async addPropertyOption(
    eventSubTypeId: string,
    propertyId: string,
    option: Partial<EventSubTypePropertyOption>
  ): Promise<EventSubTypePropertyOption | null> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return null;

    const propIndex = subType.properties.findIndex(p => p.id === propertyId);
    if (propIndex === -1) return null;

    const newOption: EventSubTypePropertyOption = {
      id: generatePropertyOptionId(),
      value: option.value || '',
      label: option.label || '',
      displayOrder: option.displayOrder ?? subType.properties[propIndex].options.length,
      isDefault: option.isDefault ?? false
    };

    const updatedProperty = {
      ...subType.properties[propIndex],
      options: [...subType.properties[propIndex].options, newOption]
    };

    const updatedProperties = [...subType.properties];
    updatedProperties[propIndex] = updatedProperty;

    const updated: EventSubType = {
      ...subType,
      properties: updatedProperties,
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return newOption;
  }

  async deletePropertyOption(
    eventSubTypeId: string,
    propertyId: string,
    optionId: string
  ): Promise<boolean> {
    const subType = await this.getEventSubTypeById(eventSubTypeId);
    if (!subType) return false;

    const propIndex = subType.properties.findIndex(p => p.id === propertyId);
    if (propIndex === -1) return false;

    const updatedProperty = {
      ...subType.properties[propIndex],
      options: subType.properties[propIndex].options.filter(o => o.id !== optionId)
    };

    const updatedProperties = [...subType.properties];
    updatedProperties[propIndex] = updatedProperty;

    const updated: EventSubType = {
      ...subType,
      properties: updatedProperties,
      updatedAt: new Date().toISOString()
    };

    await this.db.put('event_subtypes', updated);
    this.eventSubTypes.update(list =>
      list.map(e => e.id === eventSubTypeId ? updated : e)
    );

    return true;
  }

  // ============ Clone / Import / Export ============

  async cloneEventSubType(id: string, newName: string, newCode?: string): Promise<EventSubType | null> {
    const original = await this.getEventSubTypeById(id);
    if (!original) return null;

    const now = new Date().toISOString();

    // Regenerar IDs para grupos
    const groupIdMap = new Map<string, string>();
    const newGroups = original.propertyGroups.map(g => {
      const newId = generatePropertyGroupId();
      groupIdMap.set(g.id, newId);
      return { ...g, id: newId };
    });

    // Regenerar IDs para propiedades y mapear grupos
    const newProperties = original.properties.map(p => ({
      ...p,
      id: generatePropertyId(),
      propertyGroupId: p.propertyGroupId ? groupIdMap.get(p.propertyGroupId) || null : null,
      options: p.options.map(o => ({ ...o, id: generatePropertyOptionId() }))
    }));

    const clone: EventSubType = {
      ...original,
      id: generateEventSubTypeId(),
      name: newName,
      code: newCode || `${original.code}_copy_${Date.now()}`,
      isDefault: false,
      propertyGroups: newGroups,
      properties: newProperties,
      createdAt: now,
      updatedAt: now
    };

    await this.db.add('event_subtypes', clone);
    this.eventSubTypes.update(list => [...list, clone]);

    return clone;
  }

  async exportEventSubType(id: string): Promise<string | null> {
    const subType = await this.getEventSubTypeById(id);
    if (!subType) return null;

    // Remover campos de auditoría para exportación
    const exportData = {
      ...subType,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: undefined,
      updatedBy: undefined
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importEventSubType(jsonData: string): Promise<EventSubType | null> {
    try {
      const data = JSON.parse(jsonData);
      const now = new Date().toISOString();

      // Generar nuevos IDs
      const groupIdMap = new Map<string, string>();
      const newGroups = (data.propertyGroups || []).map((g: any) => {
        const newId = generatePropertyGroupId();
        groupIdMap.set(g.id, newId);
        return { ...g, id: newId };
      });

      const newProperties = (data.properties || []).map((p: any) => ({
        ...p,
        id: generatePropertyId(),
        propertyGroupId: p.propertyGroupId ? groupIdMap.get(p.propertyGroupId) || null : null,
        options: (p.options || []).map((o: any) => ({ ...o, id: generatePropertyOptionId() }))
      }));

      const imported: EventSubType = {
        ...data,
        id: generateEventSubTypeId(),
        code: `${data.code}_imported_${Date.now()}`,
        isDefault: false,
        propertyGroups: newGroups,
        properties: newProperties,
        createdAt: now,
        updatedAt: now
      };

      await this.db.add('event_subtypes', imported);
      this.eventSubTypes.update(list => [...list, imported]);

      return imported;
    } catch (err) {
      console.error('Error importing event subtype:', err);
      return null;
    }
  }

  // ============ Catálogos ============

  getPropertyDataTypes() {
    return PROPERTY_DATA_TYPES;
  }

  // ============ Seed Data ============

  async seedDefaultSubTypes(): Promise<void> {
    const existing = await this.db.getAll<EventSubType>('event_subtypes');
    if (existing.length > 0) return;

    console.log('🌱 Seeding default event subtypes...');

    const now = new Date().toISOString();

    // Subtipo default para Riesgos
    const riskSubType: EventSubType = {
      id: generateEventSubTypeId(),
      name: 'Riesgo General',
      code: 'RISK_GENERAL',
      description: 'Plantilla general para registro de riesgos',
      eventType: EventType.RISK,
      color: '#f59e0b',
      iconPath: 'pi pi-exclamation-triangle',
      isDefault: true,
      isActive: true,
      propertyGroups: [
        {
          id: generatePropertyGroupId(),
          name: 'Evaluación',
          description: 'Campos de evaluación del riesgo',
          displayOrder: 0,
          isActive: true
        }
      ],
      properties: [
        {
          id: generatePropertyId(),
          code: 'categoria_riesgo',
          name: 'Categoría del Riesgo',
          description: 'Clasificación del tipo de riesgo',
          dataType: PropertyDataType.SELECT,
          propertyGroupId: null,
          isRequired: true,
          isReadOnly: false,
          isHidden: false,
          canBeList: false,
          isAutoIncrement: false,
          formula: null,
          isSystemGenerated: false,
          defaultValue: null,
          displayOrder: 0,
          options: [
            { id: generatePropertyOptionId(), value: 'operacional', label: 'Operacional', displayOrder: 0, isDefault: true },
            { id: generatePropertyOptionId(), value: 'financiero', label: 'Financiero', displayOrder: 1, isDefault: false },
            { id: generatePropertyOptionId(), value: 'tecnologico', label: 'Tecnológico', displayOrder: 2, isDefault: false },
            { id: generatePropertyOptionId(), value: 'legal', label: 'Legal', displayOrder: 3, isDefault: false },
            { id: generatePropertyOptionId(), value: 'reputacional', label: 'Reputacional', displayOrder: 4, isDefault: false }
          ],
          isActive: true,
          metadata: {}
        },
        {
          id: generatePropertyId(),
          code: 'control_existente',
          name: 'Control Existente',
          description: 'Descripción del control actual',
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
          displayOrder: 1,
          options: [],
          isActive: true,
          metadata: { placeholder: 'Describa el control existente...' }
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    // Subtipo default para Incidentes
    const incidentSubType: EventSubType = {
      id: generateEventSubTypeId(),
      name: 'Incidente General',
      code: 'INCIDENT_GENERAL',
      description: 'Plantilla general para registro de incidentes',
      eventType: EventType.INCIDENT,
      color: '#ef4444',
      iconPath: 'pi pi-bolt',
      isDefault: true,
      isActive: true,
      propertyGroups: [],
      properties: [
        {
          id: generatePropertyId(),
          code: 'tipo_incidente',
          name: 'Tipo de Incidente',
          description: 'Clasificación del incidente',
          dataType: PropertyDataType.SELECT,
          propertyGroupId: null,
          isRequired: true,
          isReadOnly: false,
          isHidden: false,
          canBeList: false,
          isAutoIncrement: false,
          formula: null,
          isSystemGenerated: false,
          defaultValue: null,
          displayOrder: 0,
          options: [
            { id: generatePropertyOptionId(), value: 'seguridad', label: 'Seguridad', displayOrder: 0, isDefault: true },
            { id: generatePropertyOptionId(), value: 'operativo', label: 'Operativo', displayOrder: 1, isDefault: false },
            { id: generatePropertyOptionId(), value: 'sistema', label: 'Sistema', displayOrder: 2, isDefault: false },
            { id: generatePropertyOptionId(), value: 'usuario', label: 'Usuario', displayOrder: 3, isDefault: false }
          ],
          isActive: true,
          metadata: {}
        },
        {
          id: generatePropertyId(),
          code: 'usuarios_afectados',
          name: 'Usuarios Afectados',
          description: 'Número de usuarios impactados',
          dataType: PropertyDataType.INTEGER,
          propertyGroupId: null,
          isRequired: false,
          isReadOnly: false,
          isHidden: false,
          canBeList: false,
          isAutoIncrement: false,
          formula: null,
          isSystemGenerated: false,
          defaultValue: '0',
          displayOrder: 1,
          options: [],
          isActive: true,
          metadata: { minValue: 0 }
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    // Subtipo default para Defectos
    const defectSubType: EventSubType = {
      id: generateEventSubTypeId(),
      name: 'Defecto General',
      code: 'DEFECT_GENERAL',
      description: 'Plantilla general para registro de defectos',
      eventType: EventType.DEFECT,
      color: '#8b5cf6',
      iconPath: 'pi pi-bug',
      isDefault: true,
      isActive: true,
      propertyGroups: [],
      properties: [
        {
          id: generatePropertyId(),
          code: 'tipo_defecto',
          name: 'Tipo de Defecto',
          description: 'Clasificación del defecto',
          dataType: PropertyDataType.SELECT,
          propertyGroupId: null,
          isRequired: true,
          isReadOnly: false,
          isHidden: false,
          canBeList: false,
          isAutoIncrement: false,
          formula: null,
          isSystemGenerated: false,
          defaultValue: null,
          displayOrder: 0,
          options: [
            { id: generatePropertyOptionId(), value: 'funcional', label: 'Funcional', displayOrder: 0, isDefault: true },
            { id: generatePropertyOptionId(), value: 'rendimiento', label: 'Rendimiento', displayOrder: 1, isDefault: false },
            { id: generatePropertyOptionId(), value: 'usabilidad', label: 'Usabilidad', displayOrder: 2, isDefault: false },
            { id: generatePropertyOptionId(), value: 'seguridad', label: 'Seguridad', displayOrder: 3, isDefault: false }
          ],
          isActive: true,
          metadata: {}
        },
        {
          id: generatePropertyId(),
          code: 'pasos_reproducir',
          name: 'Pasos para Reproducir',
          description: 'Instrucciones para reproducir el defecto',
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
          displayOrder: 1,
          options: [],
          isActive: true,
          metadata: { placeholder: '1. Paso uno\n2. Paso dos\n3. ...' }
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    await this.db.add('event_subtypes', riskSubType);
    await this.db.add('event_subtypes', incidentSubType);
    await this.db.add('event_subtypes', defectSubType);

    this.eventSubTypes.set([riskSubType, incidentSubType, defectSubType]);

    console.log('✅ Default event subtypes seeded');
  }
}
