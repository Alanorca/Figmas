import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';

import { MessageService } from 'primeng/api';

import { EventosService } from '../../services/eventos.service';
import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  Event,
  EventType,
  EventStatus,
  SeverityLevel,
  ProbabilityLevel,
  ImpactLevel,
  PropertyDataType,
  EventSubType,
  EventSubTypeProperty,
  EventPropertyValue,
  CreateEventRequest,
  EVENT_TYPES,
  EVENT_STATUS_OPTIONS,
  SEVERITY_OPTIONS,
  PROBABILITY_OPTIONS,
  IMPACT_OPTIONS,
  getEventTypeLabel,
  getEventTypeIcon,
  getPropertyDataTypeIcon,
  generateEventId,
  getDefaultEvent
} from '../../models/eventos.models';

@Component({
  selector: 'app-eventos-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    InputNumberModule,
    CheckboxModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    TagModule,
    PanelModule
  ],
  providers: [MessageService],
  templateUrl: './eventos-crear.html',
  styleUrl: './eventos-crear.scss'
})
export class EventosCrearComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  eventosService = inject(EventosService);
  subTypesService = inject(EventoSubtiposService);

  // Modo edición
  isEditMode = signal(false);
  editingId = signal<string | null>(null);

  // Campos básicos
  title = signal('');
  description = signal('');
  eventType = signal<EventType>(EventType.RISK);
  eventSubTypeId = signal<string | null>(null);
  eventStatus = signal<EventStatus>(EventStatus.DRAFT);
  initialSeverity = signal<SeverityLevel | null>(null);
  probabilityLevel = signal<ProbabilityLevel | null>(null);
  impactLevel = signal<ImpactLevel | null>(null);
  initialDate = signal<Date | null>(null);
  dueDate = signal<Date | null>(null);
  solution = signal('');

  // Valores de propiedades dinámicas
  propertyValues = signal<Record<string, any>>({});

  // Subtipos disponibles para el tipo actual
  availableSubTypes = computed(() =>
    this.subTypesService.eventSubTypes().filter(
      st => st.eventType === this.eventType() && st.isActive
    )
  );

  // Subtipo seleccionado
  selectedSubType = computed(() =>
    this.subTypesService.eventSubTypes().find(st => st.id === this.eventSubTypeId())
  );

  // Propiedades agrupadas
  groupedProperties = computed(() => {
    const subType = this.selectedSubType();
    if (!subType) return [];

    const groups = subType.propertyGroups
      .filter(g => g.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Propiedades sin grupo
    const ungroupedProps = subType.properties
      .filter(p => p.isActive && !p.propertyGroupId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const result: { group: any; properties: EventSubTypeProperty[] }[] = [];

    if (ungroupedProps.length > 0) {
      result.push({
        group: { id: null, name: 'General', description: null },
        properties: ungroupedProps
      });
    }

    groups.forEach(group => {
      const props = subType.properties
        .filter(p => p.isActive && p.propertyGroupId === group.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      if (props.length > 0) {
        result.push({ group, properties: props });
      }
    });

    return result;
  });

  // Opciones
  eventTypeOptions = EVENT_TYPES;
  statusOptions = EVENT_STATUS_OPTIONS;
  severityOptions = SEVERITY_OPTIONS;
  probabilityOptions = PROBABILITY_OPTIONS;
  impactOptions = IMPACT_OPTIONS;

  // Validación
  isValid = computed(() =>
    this.title().trim().length > 0
  );

  // Título de la página
  pageTitle = computed(() => {
    const typeLabel = getEventTypeLabel(this.eventType());
    return this.isEditMode() ? `Editar ${typeLabel}` : `Nuevo ${typeLabel}`;
  });

  constructor() {
    // Inicializar valores de propiedades cuando cambia el subtipo
    effect(() => {
      const subType = this.selectedSubType();
      if (subType) {
        this.initializePropertyValues(subType);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();
    await this.eventosService.loadEvents();

    // Verificar si es modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      this.loadEventData(id);
    } else {
      // Verificar parámetro de tipo de evento
      const typeParam = this.route.snapshot.queryParamMap.get('type');
      if (typeParam) {
        const type = parseInt(typeParam, 10) as EventType;
        if ([EventType.RISK, EventType.INCIDENT, EventType.DEFECT].includes(type)) {
          this.eventType.set(type);
        }
      }

      // Seleccionar subtipo por defecto si existe
      const defaultSubType = this.availableSubTypes().find(st => st.isDefault);
      if (defaultSubType) {
        this.eventSubTypeId.set(defaultSubType.id);
      }
    }
  }

  private loadEventData(id: string): void {
    const event = this.eventosService.events().find(e => e.id === id);
    if (!event) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Evento no encontrado'
      });
      this.router.navigate(['/eventos']);
      return;
    }

    this.title.set(event.title);
    this.description.set(event.description);
    this.eventType.set(event.eventType);
    this.eventSubTypeId.set(event.eventSubType?.id ?? null);
    this.eventStatus.set(event.eventStatus);
    this.initialSeverity.set(event.initialSeverity ?? null);
    this.probabilityLevel.set(event.probabilityLevel ?? null);
    this.impactLevel.set(event.impactLevel ?? null);
    this.initialDate.set(event.initialDate ? new Date(event.initialDate) : null);
    this.dueDate.set(event.dueDate ? new Date(event.dueDate) : null);
    this.solution.set(event.solution ?? '');

    // Cargar valores de propiedades
    const values: Record<string, any> = {};
    event.propertyValues.forEach(pv => {
      values[pv.propertyId] = pv.value;
    });
    this.propertyValues.set(values);
  }

  private initializePropertyValues(subType: EventSubType): void {
    const currentValues = this.propertyValues();
    const newValues: Record<string, any> = { ...currentValues };

    subType.properties
      .filter(p => p.isActive)
      .forEach(prop => {
        if (!(prop.id in newValues)) {
          newValues[prop.id] = this.getDefaultValueForProperty(prop);
        }
      });

    this.propertyValues.set(newValues);
  }

  private getDefaultValueForProperty(prop: EventSubTypeProperty): any {
    if (prop.defaultValue !== null) {
      switch (prop.dataType) {
        case PropertyDataType.BOOLEAN:
          return prop.defaultValue === 'true';
        case PropertyDataType.INTEGER:
          return parseInt(prop.defaultValue, 10) || 0;
        case PropertyDataType.DECIMAL:
          return parseFloat(prop.defaultValue) || 0;
        case PropertyDataType.DATE:
          return new Date(prop.defaultValue);
        case PropertyDataType.SELECT:
          return prop.defaultValue;
        case PropertyDataType.MULTISELECT:
          try {
            return JSON.parse(prop.defaultValue);
          } catch {
            return [];
          }
        default:
          return prop.defaultValue;
      }
    }

    switch (prop.dataType) {
      case PropertyDataType.BOOLEAN:
        return false;
      case PropertyDataType.INTEGER:
      case PropertyDataType.DECIMAL:
        return null;
      case PropertyDataType.MULTISELECT:
        return [];
      default:
        return null;
    }
  }

  updatePropertyValue(propertyId: string, value: any): void {
    this.propertyValues.update(current => ({
      ...current,
      [propertyId]: value
    }));
  }

  onSubTypeChange(subTypeId: string | null): void {
    this.eventSubTypeId.set(subTypeId);
  }

  // Helpers de UI
  getEventTypeLabel = getEventTypeLabel;
  getEventTypeIcon = getEventTypeIcon;
  getPropertyDataTypeIcon = getPropertyDataTypeIcon;

  isRisk(): boolean {
    return this.eventType() === EventType.RISK;
  }

  // Navegación
  cancel(): void {
    this.router.navigate(['/eventos']);
  }

  async save(): Promise<void> {
    if (!this.isValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete los campos requeridos'
      });
      return;
    }

    const subType = this.selectedSubType();

    // Construir valores de propiedades
    const propertyValuesList: EventPropertyValue[] = [];
    if (subType) {
      subType.properties.filter(p => p.isActive).forEach(prop => {
        const value = this.propertyValues()[prop.id];
        if (value !== null && value !== undefined && value !== '') {
          propertyValuesList.push({
            propertyId: prop.id,
            propertyCode: prop.code,
            propertyName: prop.name,
            value
          });
        }
      });
    }

    const eventData: CreateEventRequest = {
      title: this.title(),
      description: this.description(),
      eventType: this.eventType(),
      eventSubTypeId: subType?.id,
      eventStatus: this.eventStatus(),
      initialSeverity: this.initialSeverity() ?? undefined,
      probabilityLevel: this.probabilityLevel() ?? undefined,
      impactLevel: this.impactLevel() ?? undefined,
      initialDate: this.initialDate()?.toISOString(),
      dueDate: this.dueDate()?.toISOString(),
      propertyValues: propertyValuesList.map(pv => ({ propertyId: pv.propertyId, value: pv.value }))
    };

    try {
      if (this.isEditMode() && this.editingId()) {
        await this.eventosService.updateEvent(this.editingId()!, {
          title: eventData.title,
          description: eventData.description,
          eventStatus: eventData.eventStatus,
          initialSeverity: eventData.initialSeverity,
          probabilityLevel: eventData.probabilityLevel,
          impactLevel: eventData.impactLevel,
          solution: this.solution() || undefined,
          dueDate: eventData.dueDate,
          propertyValues: eventData.propertyValues
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Evento actualizado',
          detail: `El evento "${this.title()}" ha sido actualizado`
        });
      } else {
        await this.eventosService.createEvent(eventData);
        this.messageService.add({
          severity: 'success',
          summary: 'Evento creado',
          detail: `El evento "${this.title()}" ha sido creado`
        });
      }

      // Navegar de vuelta a la lista
      setTimeout(() => {
        this.router.navigate(['/eventos']);
      }, 1000);
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el evento'
      });
    }
  }
}
