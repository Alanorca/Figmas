import { Injectable, inject, signal, computed } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import { EventoSubtiposService } from './evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  SeverityLevel,
  ProbabilityLevel,
  ImpactLevel,
  EventPropertyValue,
  EventComment,
  CreateEventRequest,
  UpdateEventRequest,
  EventPageable,
  EventListResponse,
  EventFilterParams,
  generateEventId,
  generateCommentId,
  calculateRiskLevel
} from '../models/eventos.models';

@Injectable({ providedIn: 'root' })
export class EventosService {
  private db = inject(IndexedDBService);
  private subTypesService = inject(EventoSubtiposService);

  // ============ Estado Reactivo ============
  events = signal<Event[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // ============ Contadores por Tipo ============
  riskCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.RISK).length
  );

  incidentCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.INCIDENT).length
  );

  defectCount = computed(() =>
    this.events().filter(e => e.eventType === EventType.DEFECT).length
  );

  totalCount = computed(() => this.events().length);

  // ============ Contadores por Estado ============
  draftCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.DRAFT).length
  );

  openCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.OPEN).length
  );

  inProgressCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.IN_PROGRESS).length
  );

  resolvedCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.RESOLVED).length
  );

  closedCount = computed(() =>
    this.events().filter(e => e.eventStatus === EventStatus.CLOSED).length
  );

  // ============ Eventos por Tipo ============
  risks = computed(() =>
    this.events().filter(e => e.eventType === EventType.RISK)
  );

  incidents = computed(() =>
    this.events().filter(e => e.eventType === EventType.INCIDENT)
  );

  defects = computed(() =>
    this.events().filter(e => e.eventType === EventType.DEFECT)
  );

  // ============ CRUD de Eventos ============

  async loadEvents(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let data = await this.db.getAll<Event>('events');

      // Seed demo data if empty or incomplete
      if (data.length === 0) {
        await this.forceSeedEvents();
        data = await this.db.getAll<Event>('events');
      } else {
        // Check if data is incomplete (missing defects or too few records)
        const hasDefects = data.some(e => e.eventType === EventType.DEFECT);
        const hasEnoughData = data.length >= 30; // We expect 37 records total
        if (!hasDefects || !hasEnoughData) {
          await this.forceSeedEvents();
          data = await this.db.getAll<Event>('events');
        }
      }

      // Ordenar por fecha de creación descendente
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.events.set(data);
    } catch (err) {
      console.error('Error loading events:', err);
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
        const aVal = this.getNestedValue(a, field);
        const bVal = this.getNestedValue(b, field);
        let comparison = 0;
        if (aVal > bVal) comparison = 1;
        else if (aVal < bVal) comparison = -1;
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

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  async getEventById(id: string): Promise<Event | undefined> {
    // Primero buscar en el estado local
    const local = this.events().find(e => e.id === id);
    if (local) return local;

    // Si no está, buscar en la base de datos
    return this.db.get<Event>('events', id);
  }

  async createEvent(request: CreateEventRequest): Promise<Event> {
    const now = new Date().toISOString();

    // Obtener info del subtipo si se especificó
    let eventSubTypeRef = undefined;
    if (request.eventSubTypeId) {
      const subType = await this.subTypesService.getEventSubTypeById(request.eventSubTypeId);
      if (subType) {
        eventSubTypeRef = {
          id: subType.id,
          code: subType.code,
          name: subType.name
        };
      }
    }

    // Calcular severidad si hay probabilidad e impacto
    let calculatedSeverity = request.initialSeverity;
    if (request.probabilityLevel && request.impactLevel) {
      calculatedSeverity = calculateRiskLevel(request.probabilityLevel, request.impactLevel);
    }

    // Mapear valores de propiedades
    const propertyValues: EventPropertyValue[] = (request.propertyValues || []).map(pv => ({
      propertyId: pv.propertyId,
      propertyCode: '',
      propertyName: '',
      value: pv.value
    }));

    const newEvent: Event = {
      id: generateEventId(),
      title: request.title,
      description: request.description,
      eventType: request.eventType,
      eventSubType: eventSubTypeRef,
      eventStatus: request.eventStatus || EventStatus.DRAFT,
      initialSeverity: request.initialSeverity,
      calculatedImpactLevel: calculatedSeverity,
      probabilityLevel: request.probabilityLevel,
      impactLevel: request.impactLevel,
      initialDate: request.initialDate || now,
      dueDate: request.dueDate,
      responsibleUserId: request.responsibleUserId,
      affectedAssetIds: request.affectedAssetIds || [],
      impactedProcessIds: request.impactedProcessIds || [],
      propertyValues,
      comments: [],
      createdAt: now,
      updatedAt: now
    };

    await this.db.add('events', newEvent);
    this.events.update(list => [newEvent, ...list]);

    return newEvent;
  }

  async updateEvent(id: string, request: UpdateEventRequest): Promise<Event | null> {
    const existing = await this.getEventById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    // Recalcular severidad si cambian probabilidad o impacto
    let calculatedSeverity = existing.calculatedImpactLevel;
    const probability = request.probabilityLevel ?? existing.probabilityLevel;
    const impact = request.impactLevel ?? existing.impactLevel;
    if (probability && impact) {
      calculatedSeverity = calculateRiskLevel(probability, impact);
    }

    // Mapear valores de propiedades si se proporcionan
    let propertyValues = existing.propertyValues;
    if (request.propertyValues) {
      propertyValues = request.propertyValues.map(pv => ({
        propertyId: pv.propertyId,
        propertyCode: '',
        propertyName: '',
        value: pv.value
      }));
    }

    const updated: Event = {
      ...existing,
      title: request.title ?? existing.title,
      description: request.description ?? existing.description,
      eventStatus: request.eventStatus ?? existing.eventStatus,
      initialSeverity: request.initialSeverity ?? existing.initialSeverity,
      calculatedImpactLevel: calculatedSeverity,
      probabilityLevel: request.probabilityLevel ?? existing.probabilityLevel,
      impactLevel: request.impactLevel ?? existing.impactLevel,
      solution: request.solution ?? existing.solution,
      dueDate: request.dueDate ?? existing.dueDate,
      resolvedAt: request.resolvedAt ?? existing.resolvedAt,
      responsibleUserId: request.responsibleUserId ?? existing.responsibleUserId,
      propertyValues,
      updatedAt: now
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === id ? updated : e)
    );

    return updated;
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      // Eliminar comentarios asociados
      const comments = await this.db.getByIndex<EventComment>('event_comments', 'eventId', id);
      for (const comment of comments) {
        await this.db.delete('event_comments', comment.id);
      }

      await this.db.delete('events', id);
      this.events.update(list => list.filter(e => e.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      return false;
    }
  }

  // ============ Cambio de Estado ============

  async changeStatus(id: string, newStatus: EventStatus): Promise<Event | null> {
    const event = await this.getEventById(id);
    if (!event) return null;

    const now = new Date().toISOString();
    const updates: Partial<Event> = {
      eventStatus: newStatus,
      updatedAt: now
    };

    // Establecer fechas según el estado
    if (newStatus === EventStatus.RESOLVED && !event.resolvedAt) {
      updates.resolvedAt = now;
    }
    if (newStatus === EventStatus.CLOSED && !event.closedAt) {
      updates.closedAt = now;
    }

    const updated = { ...event, ...updates };
    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === id ? updated : e)
    );

    return updated;
  }

  // ============ Comentarios ============

  async addComment(eventId: string, content: string, userId?: string): Promise<EventComment | null> {
    const event = await this.getEventById(eventId);
    if (!event) return null;

    const now = new Date().toISOString();
    const newComment: EventComment = {
      id: generateCommentId(),
      eventId,
      content,
      createdBy: userId || 'system',
      createdByName: 'Usuario',
      createdAt: now
    };

    // Guardar en store separado
    await this.db.add('event_comments', newComment);

    // Actualizar evento con referencia al comentario
    const updatedComments = [...(event.comments || []), newComment];
    const updated = { ...event, comments: updatedComments, updatedAt: now };
    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return newComment;
  }

  async getComments(eventId: string): Promise<EventComment[]> {
    return this.db.getByIndex<EventComment>('event_comments', 'eventId', eventId);
  }

  async deleteComment(eventId: string, commentId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    try {
      await this.db.delete('event_comments', commentId);

      const updatedComments = (event.comments || []).filter(c => c.id !== commentId);
      const updated = { ...event, comments: updatedComments, updatedAt: new Date().toISOString() };
      await this.db.put('events', updated);
      this.events.update(list =>
        list.map(e => e.id === eventId ? updated : e)
      );

      return true;
    } catch {
      return false;
    }
  }

  // ============ Filtros ============

  filterEvents(params: EventFilterParams): Event[] {
    return this.events().filter(event => {
      if (params.eventType !== undefined && event.eventType !== params.eventType) return false;
      if (params.eventSubTypeId && event.eventSubType?.id !== params.eventSubTypeId) return false;
      if (params.status && event.eventStatus !== params.status) return false;
      if (params.severity && event.initialSeverity !== params.severity) return false;
      if (params.responsibleUserId && event.responsibleUserId !== params.responsibleUserId) return false;

      if (params.fromDate) {
        const fromDate = new Date(params.fromDate);
        const eventDate = new Date(event.createdAt);
        if (eventDate < fromDate) return false;
      }

      if (params.toDate) {
        const toDate = new Date(params.toDate);
        const eventDate = new Date(event.createdAt);
        if (eventDate > toDate) return false;
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesDescription = event.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDescription) return false;
      }

      return true;
    });
  }

  getEventsByType(eventType: EventType): Event[] {
    return this.events().filter(e => e.eventType === eventType);
  }

  getEventsByStatus(status: EventStatus): Event[] {
    return this.events().filter(e => e.eventStatus === status);
  }

  getEventsBySeverity(severity: SeverityLevel): Event[] {
    return this.events().filter(e => e.initialSeverity === severity);
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
      closed: filtered.filter(e => e.eventStatus === EventStatus.CLOSED).length,
      cancelled: filtered.filter(e => e.eventStatus === EventStatus.CANCELLED).length
    };
  }

  getStatsBySeverity(eventType?: EventType) {
    let filtered = this.events();
    if (eventType !== undefined) {
      filtered = filtered.filter(e => e.eventType === eventType);
    }
    return {
      critical: filtered.filter(e => e.initialSeverity === SeverityLevel.CRITICAL).length,
      high: filtered.filter(e => e.initialSeverity === SeverityLevel.HIGH).length,
      medium: filtered.filter(e => e.initialSeverity === SeverityLevel.MEDIUM).length,
      low: filtered.filter(e => e.initialSeverity === SeverityLevel.LOW).length,
      informational: filtered.filter(e => e.initialSeverity === SeverityLevel.INFORMATIONAL).length
    };
  }

  getStatsOverall() {
    const events = this.events();
    return {
      total: events.length,
      risks: this.riskCount(),
      incidents: this.incidentCount(),
      defects: this.defectCount(),
      open: this.openCount(),
      inProgress: this.inProgressCount(),
      resolved: this.resolvedCount(),
      closed: this.closedCount()
    };
  }

  // ============ Relaciones ============

  async linkAsset(eventId: string, assetId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    if (event.affectedAssetIds?.includes(assetId)) return true;

    const updated = {
      ...event,
      affectedAssetIds: [...(event.affectedAssetIds || []), assetId],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return true;
  }

  async unlinkAsset(eventId: string, assetId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    const updated = {
      ...event,
      affectedAssetIds: (event.affectedAssetIds || []).filter(id => id !== assetId),
      updatedAt: new Date().toISOString()
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return true;
  }

  async linkProcess(eventId: string, processId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    if (event.impactedProcessIds?.includes(processId)) return true;

    const updated = {
      ...event,
      impactedProcessIds: [...(event.impactedProcessIds || []), processId],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return true;
  }

  async unlinkProcess(eventId: string, processId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    const updated = {
      ...event,
      impactedProcessIds: (event.impactedProcessIds || []).filter(id => id !== processId),
      updatedAt: new Date().toISOString()
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return true;
  }

  async linkRelatedEvent(eventId: string, relatedEventId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    if (event.relatedEventIds?.includes(relatedEventId)) return true;

    const updated = {
      ...event,
      relatedEventIds: [...(event.relatedEventIds || []), relatedEventId],
      updatedAt: new Date().toISOString()
    };

    await this.db.put('events', updated);
    this.events.update(list =>
      list.map(e => e.id === eventId ? updated : e)
    );

    return true;
  }

  // ============ Seed Data ============

  async seedSampleEvents(): Promise<void> {
    const existing = await this.db.getAll<Event>('events');
    if (existing.length > 0) return;

    await this.forceSeedEvents();
  }

  // Método público para forzar la recarga de datos de muestra
  async forceSeedEvents(): Promise<void> {
    console.log('🌱 Seeding sample events...');

    // Limpiar eventos existentes
    await this.db.clear('events');
    await this.db.clear('event_comments');

    // Asegurarse de que hay subtipos
    await this.subTypesService.loadEventSubTypes();
    if (this.subTypesService.eventSubTypes().length === 0) {
      await this.subTypesService.seedDefaultSubTypes();
    }

    const riskSubTypes = this.subTypesService.riskSubTypes();
    const incidentSubTypes = this.subTypesService.incidentSubTypes();
    const defectSubTypes = this.subTypesService.defectSubTypes();

    const now = new Date();

    const sampleEvents: Partial<Event>[] = [
      // =====================================================
      // RIESGOS (15 registros variados)
      // =====================================================
      {
        title: 'Riesgo de fuga de datos sensibles',
        description: 'Se ha identificado una vulnerabilidad potencial en el sistema de almacenamiento que podría exponer datos sensibles de clientes. Es necesario implementar cifrado adicional y revisar los controles de acceso.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.CRITICAL,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Riesgo de interrupción del servicio por capacidad',
        description: 'El servidor principal está alcanzando su capacidad máxima (85%), lo que podría causar interrupciones del servicio durante horas pico.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.HIGH,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de incumplimiento normativo PCI-DSS',
        description: 'Vencimiento de certificación PCI-DSS en 60 días. Es necesario programar auditoría y preparar documentación.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[1] ? { id: riskSubTypes[1].id, code: riskSubTypes[1].code, name: riskSubTypes[1].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Riesgo de pérdida de personal clave',
        description: 'El arquitecto principal del sistema ha recibido ofertas de la competencia. Sin plan de sucesión documentado.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.MEDIUM,
        probabilityLevel: ProbabilityLevel.LOW,
        impactLevel: ImpactLevel.MODERATE,
        initialDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se negoció retención con aumento salarial y se documentó el conocimiento crítico.',
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Riesgo de obsolescencia tecnológica',
        description: 'El sistema de base de datos Oracle 11g dejará de tener soporte en 12 meses. Se requiere plan de migración.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        probabilityLevel: ProbabilityLevel.VERY_HIGH,
        impactLevel: ImpactLevel.MODERATE,
        initialDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de ataque ransomware',
        description: 'Incremento de ataques ransomware en el sector. Los controles actuales de endpoint pueden ser insuficientes.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.CRITICAL,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Riesgo de incumplimiento GDPR',
        description: 'Procesos de gestión de datos personales no están completamente documentados según requerimientos GDPR.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[1] ? { id: riskSubTypes[1].id, code: riskSubTypes[1].code, name: riskSubTypes[1].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Riesgo de fraude interno',
        description: 'Controles de segregación de funciones en el módulo financiero son débiles. Un usuario podría crear y aprobar transacciones.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.LOW,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de dependencia de proveedor único',
        description: 'El 90% de la infraestructura cloud depende de un solo proveedor sin plan de contingencia.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        probabilityLevel: ProbabilityLevel.LOW,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Riesgo de vulnerabilidad en API pública',
        description: 'La API de integración no implementa rate limiting ni validación estricta de tokens.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.CLOSED,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.HIGH,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        closedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se implementó rate limiting, validación de JWT y monitoreo de uso anómalo.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de desastre natural',
        description: 'El datacenter principal está en zona de riesgo sísmico sin redundancia geográfica completa.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.LOW,
        probabilityLevel: ProbabilityLevel.VERY_LOW,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Riesgo de falla en autenticación',
        description: 'Sistema legacy no soporta MFA y almacena credenciales con hash MD5 obsoleto.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.CRITICAL,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de pérdida de licencias',
        description: 'Contratos de software crítico vencen en 90 días sin renovación confirmada.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[1] ? { id: riskSubTypes[1].id, code: riskSubTypes[1].code, name: riskSubTypes[1].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Riesgo de inyección SQL',
        description: 'Auditoría de código reveló 15 puntos vulnerables a inyección SQL en módulos heredados.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.CRITICAL,
        probabilityLevel: ProbabilityLevel.HIGH,
        impactLevel: ImpactLevel.CATASTROPHIC,
        initialDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Riesgo de acceso privilegiado no controlado',
        description: '25 usuarios tienen acceso de administrador sin justificación de negocio documentada.',
        eventType: EventType.RISK,
        eventSubType: riskSubTypes[0] ? { id: riskSubTypes[0].id, code: riskSubTypes[0].code, name: riskSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.HIGH,
        probabilityLevel: ProbabilityLevel.MEDIUM,
        impactLevel: ImpactLevel.MAJOR,
        initialDate: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },

      // =====================================================
      // INCIDENTES (12 registros variados)
      // =====================================================
      {
        title: 'Incidente de acceso no autorizado',
        description: 'Se detectó un intento de acceso no autorizado al sistema de administración desde una IP desconocida en Rusia. Se realizaron 50 intentos de login fallidos.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.CRITICAL,
        initialDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se bloqueó la IP origen, se implementó geoblocking y se reforzaron las políticas de acceso con MFA obligatorio.',
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Caída del servicio de correo',
        description: 'El servicio de correo electrónico estuvo inaccesible durante 2 horas afectando a 500 usuarios. Causa: saturación del servidor SMTP.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.CLOSED,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        closedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se reinició el servicio SMTP y se aumentó la capacidad del servidor.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Phishing masivo a empleados',
        description: 'Se detectó campaña de phishing dirigida a empleados de finanzas. 3 usuarios hicieron clic en el enlace malicioso.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Falla en backup nocturno',
        description: 'El proceso de backup nocturno falló 3 noches consecutivas. No hay respaldo reciente de la base de datos de producción.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.CRITICAL,
        initialDate: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Pérdida de laptop corporativa',
        description: 'Un empleado reportó la pérdida de su laptop corporativa en el transporte público. El equipo contenía datos de clientes.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se activó el borrado remoto del equipo. Se verificó que el disco estaba cifrado con BitLocker.',
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Ataque DDoS al sitio web',
        description: 'El sitio web corporativo sufrió un ataque DDoS que lo dejó inaccesible por 45 minutos.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.CLOSED,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(),
        closedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se activaron protecciones DDoS del CDN y se bloquearon rangos de IP maliciosos.',
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Exposición de credenciales en repositorio',
        description: 'Se encontraron credenciales de base de datos en un commit de código en repositorio público.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.CRITICAL,
        initialDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se rotaron las credenciales, se eliminó el commit y se implementó escaneo de secretos en CI/CD.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Fuga de datos por empleado',
        description: 'Se detectó que un empleado envió listado de clientes a correo personal antes de renunciar.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.CRITICAL,
        initialDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Malware detectado en estación de trabajo',
        description: 'El antivirus detectó un troyano en la computadora de un usuario del área de compras.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se aisló el equipo, se realizó análisis forense y se reimaginó la máquina.',
        responsibleUserId: 'usr-001'
      },
      {
        title: 'Interrupción de servicio por actualización fallida',
        description: 'Una actualización de software en producción causó caída del sistema CRM por 3 horas.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.CLOSED,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
        closedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se realizó rollback a versión anterior y se mejoró el proceso de pruebas.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Acceso indebido a datos de nómina',
        description: 'Un usuario de TI accedió a datos de nómina sin autorización aprovechando permisos excesivos.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-003'
      },
      {
        title: 'Certificado SSL expirado',
        description: 'El certificado SSL del portal de clientes expiró causando alertas de seguridad a los usuarios.',
        eventType: EventType.INCIDENT,
        eventSubType: incidentSubTypes[0] ? { id: incidentSubTypes[0].id, code: incidentSubTypes[0].code, name: incidentSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        solution: 'Se renovó el certificado y se implementó monitoreo de vencimiento.',
        responsibleUserId: 'usr-001'
      },

      // =====================================================
      // DEFECTOS (10 registros variados)
      // =====================================================
      {
        title: 'Error en cálculo de reportes financieros',
        description: 'Los reportes mensuales muestran valores incorrectos en la columna de totales. El error es de aproximadamente 0.01% debido a redondeo.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Problema de rendimiento en búsqueda',
        description: 'La función de búsqueda de clientes tarda más de 10 segundos en mostrar resultados cuando hay más de 100,000 registros.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.LOW,
        initialDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Botón de guardar no responde en Safari',
        description: 'En navegador Safari, el botón "Guardar" del formulario de registro no funciona. Afecta a usuarios Mac.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Fechas incorrectas en zona horaria UTC',
        description: 'Los usuarios en zona horaria diferente a la del servidor ven fechas incorrectas en el calendario de eventos.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se implementó conversión de zona horaria usando Intl.DateTimeFormat.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Memory leak en dashboard',
        description: 'El dashboard consume cada vez más memoria RAM si se deja abierto por más de 2 horas. Causa eventual crash del navegador.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Error de validación en formulario de registro',
        description: 'El formulario acepta correos electrónicos con formato inválido y números de teléfono con caracteres especiales.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Exportación a Excel genera archivo corrupto',
        description: 'Al exportar más de 10,000 registros a Excel, el archivo resultante no se puede abrir.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.LOW,
        initialDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Notificaciones duplicadas',
        description: 'Los usuarios reciben notificaciones por correo duplicadas para el mismo evento.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.RESOLVED,
        initialSeverity: SeverityLevel.LOW,
        initialDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        solution: 'Se agregó control de idempotencia en el servicio de notificaciones.',
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Error 500 al subir archivos mayores a 5MB',
        description: 'La carga de documentos falla con error 500 cuando el archivo supera los 5MB.',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.IN_PROGRESS,
        initialSeverity: SeverityLevel.MEDIUM,
        initialDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-002'
      },
      {
        title: 'Sesión no expira correctamente',
        description: 'Las sesiones de usuario no expiran después del tiempo de inactividad configurado (30 minutos).',
        eventType: EventType.DEFECT,
        eventSubType: defectSubTypes[0] ? { id: defectSubTypes[0].id, code: defectSubTypes[0].code, name: defectSubTypes[0].name } : undefined,
        eventStatus: EventStatus.OPEN,
        initialSeverity: SeverityLevel.HIGH,
        initialDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        responsibleUserId: 'usr-001'
      }
    ];

    for (const eventData of sampleEvents) {
      const event: Event = {
        id: generateEventId(),
        title: eventData.title!,
        description: eventData.description!,
        eventType: eventData.eventType!,
        eventSubType: eventData.eventSubType,
        eventStatus: eventData.eventStatus!,
        initialSeverity: eventData.initialSeverity,
        calculatedImpactLevel: eventData.probabilityLevel && eventData.impactLevel
          ? calculateRiskLevel(eventData.probabilityLevel, eventData.impactLevel)
          : eventData.initialSeverity,
        probabilityLevel: eventData.probabilityLevel,
        impactLevel: eventData.impactLevel,
        initialDate: eventData.initialDate,
        resolvedAt: eventData.resolvedAt,
        closedAt: eventData.closedAt,
        solution: eventData.solution,
        responsibleUserId: eventData.responsibleUserId,
        propertyValues: [],
        comments: [],
        createdAt: eventData.initialDate || now.toISOString(),
        updatedAt: now.toISOString()
      };

      await this.db.add('events', event);
    }

    await this.loadEvents();
    console.log('✅ Sample events seeded: 15 riesgos, 12 incidentes, 10 defectos');
  }

}
