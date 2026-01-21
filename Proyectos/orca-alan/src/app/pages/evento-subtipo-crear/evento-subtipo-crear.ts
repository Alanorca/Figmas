import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { StepsModule } from 'primeng/steps';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { PanelModule } from 'primeng/panel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { OrderListModule } from 'primeng/orderlist';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';

import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  EventSubType,
  EventSubTypeProperty,
  EventSubTypePropertyGroup,
  EventSubTypePropertyOption,
  EventType,
  PropertyDataType,
  EVENT_TYPES,
  PROPERTY_DATA_TYPES,
  getDefaultProperty,
  getDefaultPropertyGroup,
  generatePropertyId,
  generatePropertyGroupId,
  generatePropertyOptionId,
  getEventTypeLabel,
  getPropertyDataTypeLabel,
  getPropertyDataTypeIcon
} from '../../models/eventos.models';

@Component({
  selector: 'app-evento-subtipo-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    CheckboxModule,
    StepsModule,
    DividerModule,
    ToastModule,
    TagModule,
    TooltipModule,
    AccordionModule,
    PanelModule,
    InputNumberModule,
    ColorPickerModule,
    DialogModule,
    OrderListModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './evento-subtipo-crear.html',
  styleUrl: './evento-subtipo-crear.scss'
})
export class EventoSubtipoCrearComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private subTypesService = inject(EventoSubtiposService);

  // ============ Modo Edición ============
  isEditMode = signal(false);
  editingId = signal<string | null>(null);
  loading = signal(false);
  saving = signal(false);

  // ============ Wizard Steps ============
  activeStep = signal(0);
  steps: MenuItem[] = [
    { label: 'Información Básica' },
    { label: 'Grupos' },
    { label: 'Propiedades' }
  ];

  // ============ Step 1: Info Básica ============
  name = signal('');
  code = signal('');
  description = signal('');
  eventType = signal<EventType>(EventType.RISK);
  iconPath = signal('');
  color = signal('#10b981');
  isDefault = signal(false);

  // Opciones
  eventTypeOptions = EVENT_TYPES.map(t => ({
    label: t.label,
    value: t.value,
    icon: t.icon,
    color: t.color
  }));

  // ============ Step 2: Grupos ============
  propertyGroups = signal<EventSubTypePropertyGroup[]>([]);
  showGroupDialog = signal(false);
  editingGroup = signal<EventSubTypePropertyGroup | null>(null);
  groupName = signal('');
  groupDescription = signal('');

  // ============ Step 3: Propiedades ============
  properties = signal<EventSubTypeProperty[]>([]);
  showPropertyDialog = signal(false);
  editingProperty = signal<EventSubTypeProperty | null>(null);

  // Property form fields
  propCode = signal('');
  propName = signal('');
  propDescription = signal('');
  propDataType = signal<PropertyDataType>(PropertyDataType.TEXT);
  propGroupId = signal<string | null>(null);
  propIsRequired = signal(false);
  propIsReadOnly = signal(false);
  propIsHidden = signal(false);
  propDefaultValue = signal<string | null>(null);
  propOptions = signal<EventSubTypePropertyOption[]>([]);

  // Options for property dialog
  dataTypeOptions = PROPERTY_DATA_TYPES;

  groupOptions = computed(() => [
    { label: 'Sin grupo', value: null },
    ...this.propertyGroups().map(g => ({ label: g.name, value: g.id }))
  ]);

  // ============ Validaciones ============
  isStep1Valid = computed(() =>
    this.name().trim().length > 0 &&
    this.code().trim().length > 0
  );

  isStep2Valid = computed(() => true); // Grupos son opcionales

  isStep3Valid = computed(() =>
    this.properties().every(p =>
      p.name.trim().length > 0 &&
      p.code.trim().length > 0
    )
  );

  canSave = computed(() =>
    this.isStep1Valid() && this.isStep2Valid() && this.isStep3Valid()
  );

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editingId.set(id);
      await this.loadSubType(id);
    } else {
      // Set default color based on event type
      this.updateColorFromEventType(this.eventType());
    }
  }

  async loadSubType(id: string): Promise<void> {
    this.loading.set(true);
    try {
      await this.subTypesService.loadEventSubTypes();
      const subType = await this.subTypesService.getEventSubTypeById(id);
      if (subType) {
        this.name.set(subType.name);
        this.code.set(subType.code);
        this.description.set(subType.description);
        this.eventType.set(subType.eventType);
        this.iconPath.set(subType.iconPath || '');
        this.color.set(subType.color || '#10b981');
        this.isDefault.set(subType.isDefault);
        this.propertyGroups.set([...subType.propertyGroups]);
        this.properties.set([...subType.properties]);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró la plantilla'
        });
        this.router.navigate(['/evento-subtipos']);
      }
    } finally {
      this.loading.set(false);
    }
  }

  // ============ Navigation ============

  nextStep(): void {
    if (this.activeStep() < 2) {
      this.activeStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.activeStep() > 0) {
      this.activeStep.update(s => s - 1);
    }
  }

  goToStep(step: number): void {
    // Only allow going to previous steps or if current step is valid
    if (step < this.activeStep() || this.isCurrentStepValid()) {
      this.activeStep.set(step);
    }
  }

  isCurrentStepValid(): boolean {
    switch (this.activeStep()) {
      case 0: return this.isStep1Valid();
      case 1: return this.isStep2Valid();
      case 2: return this.isStep3Valid();
      default: return false;
    }
  }

  cancel(): void {
    this.router.navigate(['/evento-subtipos']);
  }

  // ============ Event Type Change ============

  onEventTypeChange(value: EventType): void {
    this.eventType.set(value);
    this.updateColorFromEventType(value);
  }

  updateColorFromEventType(type: EventType): void {
    const typeOption = this.eventTypeOptions.find(t => t.value === type);
    if (typeOption) {
      this.color.set(typeOption.color);
    }
  }

  // ============ Groups Management ============

  openAddGroupDialog(): void {
    this.editingGroup.set(null);
    this.groupName.set('');
    this.groupDescription.set('');
    this.showGroupDialog.set(true);
  }

  openEditGroupDialog(group: EventSubTypePropertyGroup): void {
    this.editingGroup.set(group);
    this.groupName.set(group.name);
    this.groupDescription.set(group.description || '');
    this.showGroupDialog.set(true);
  }

  saveGroup(): void {
    if (!this.groupName().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nombre requerido',
        detail: 'El nombre del grupo es obligatorio'
      });
      return;
    }

    if (this.editingGroup()) {
      // Update existing
      this.propertyGroups.update(groups =>
        groups.map(g =>
          g.id === this.editingGroup()!.id
            ? { ...g, name: this.groupName(), description: this.groupDescription() }
            : g
        )
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Grupo actualizado',
        detail: `El grupo "${this.groupName()}" ha sido actualizado`
      });
    } else {
      // Add new
      const newGroup: EventSubTypePropertyGroup = {
        id: generatePropertyGroupId(),
        name: this.groupName(),
        description: this.groupDescription(),
        displayOrder: this.propertyGroups().length,
        isActive: true
      };
      this.propertyGroups.update(groups => [...groups, newGroup]);
      this.messageService.add({
        severity: 'success',
        summary: 'Grupo creado',
        detail: `El grupo "${this.groupName()}" ha sido creado`
      });
    }

    this.showGroupDialog.set(false);
  }

  deleteGroup(group: EventSubTypePropertyGroup): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el grupo "${group.name}"? Las propiedades en este grupo quedarán sin grupo.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Remove group and unlink properties
        this.propertyGroups.update(groups => groups.filter(g => g.id !== group.id));
        this.properties.update(props =>
          props.map(p => p.propertyGroupId === group.id ? { ...p, propertyGroupId: null } : p)
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Grupo eliminado',
          detail: `El grupo "${group.name}" ha sido eliminado`
        });
      }
    });
  }

  // ============ Properties Management ============

  openAddPropertyDialog(): void {
    this.editingProperty.set(null);
    this.propCode.set('');
    this.propName.set('');
    this.propDescription.set('');
    this.propDataType.set(PropertyDataType.TEXT);
    this.propGroupId.set(null);
    this.propIsRequired.set(false);
    this.propIsReadOnly.set(false);
    this.propIsHidden.set(false);
    this.propDefaultValue.set(null);
    this.propOptions.set([]);
    this.showPropertyDialog.set(true);
  }

  openEditPropertyDialog(property: EventSubTypeProperty): void {
    this.editingProperty.set(property);
    this.propCode.set(property.code);
    this.propName.set(property.name);
    this.propDescription.set(property.description || '');
    this.propDataType.set(property.dataType);
    this.propGroupId.set(property.propertyGroupId);
    this.propIsRequired.set(property.isRequired);
    this.propIsReadOnly.set(property.isReadOnly);
    this.propIsHidden.set(property.isHidden);
    this.propDefaultValue.set(property.defaultValue);
    this.propOptions.set([...property.options]);
    this.showPropertyDialog.set(true);
  }

  saveProperty(): void {
    if (!this.propName().trim() || !this.propCode().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'El nombre y código son obligatorios'
      });
      return;
    }

    const propertyData: EventSubTypeProperty = {
      id: this.editingProperty()?.id || generatePropertyId(),
      code: this.propCode(),
      name: this.propName(),
      description: this.propDescription(),
      dataType: this.propDataType(),
      propertyGroupId: this.propGroupId(),
      isRequired: this.propIsRequired(),
      isReadOnly: this.propIsReadOnly(),
      isHidden: this.propIsHidden(),
      canBeList: false,
      isAutoIncrement: this.propDataType() === PropertyDataType.AUTOINCREMENTAL,
      formula: null,
      isSystemGenerated: false,
      defaultValue: this.propDefaultValue(),
      displayOrder: this.editingProperty()?.displayOrder ?? this.properties().length,
      options: this.propOptions(),
      isActive: true,
      metadata: {}
    };

    if (this.editingProperty()) {
      // Update existing
      this.properties.update(props =>
        props.map(p => p.id === this.editingProperty()!.id ? propertyData : p)
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Propiedad actualizada',
        detail: `La propiedad "${this.propName()}" ha sido actualizada`
      });
    } else {
      // Add new
      this.properties.update(props => [...props, propertyData]);
      this.messageService.add({
        severity: 'success',
        summary: 'Propiedad creada',
        detail: `La propiedad "${this.propName()}" ha sido creada`
      });
    }

    this.showPropertyDialog.set(false);
  }

  deleteProperty(property: EventSubTypeProperty): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la propiedad "${property.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.properties.update(props => props.filter(p => p.id !== property.id));
        this.messageService.add({
          severity: 'success',
          summary: 'Propiedad eliminada',
          detail: `La propiedad "${property.name}" ha sido eliminada`
        });
      }
    });
  }

  movePropertyUp(property: EventSubTypeProperty): void {
    const props = this.properties();
    const index = props.findIndex(p => p.id === property.id);
    if (index > 0) {
      const newProps = [...props];
      [newProps[index - 1], newProps[index]] = [newProps[index], newProps[index - 1]];
      // Update display orders
      newProps.forEach((p, i) => p.displayOrder = i);
      this.properties.set(newProps);
    }
  }

  movePropertyDown(property: EventSubTypeProperty): void {
    const props = this.properties();
    const index = props.findIndex(p => p.id === property.id);
    if (index < props.length - 1) {
      const newProps = [...props];
      [newProps[index], newProps[index + 1]] = [newProps[index + 1], newProps[index]];
      // Update display orders
      newProps.forEach((p, i) => p.displayOrder = i);
      this.properties.set(newProps);
    }
  }

  // ============ Property Options ============

  addOption(): void {
    const newOption: EventSubTypePropertyOption = {
      id: generatePropertyOptionId(),
      value: '',
      label: '',
      displayOrder: this.propOptions().length,
      isDefault: false
    };
    this.propOptions.update(opts => [...opts, newOption]);
  }

  updateOption(index: number, field: 'value' | 'label' | 'isDefault', value: any): void {
    this.propOptions.update(opts => {
      const newOpts = [...opts];
      newOpts[index] = { ...newOpts[index], [field]: value };

      // If setting as default, unset others
      if (field === 'isDefault' && value === true) {
        newOpts.forEach((opt, i) => {
          if (i !== index) opt.isDefault = false;
        });
      }

      return newOpts;
    });
  }

  removeOption(index: number): void {
    this.propOptions.update(opts => opts.filter((_, i) => i !== index));
  }

  // ============ Save ============

  async save(): Promise<void> {
    if (!this.canSave()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario incompleto',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.saving.set(true);

    try {
      if (this.isEditMode() && this.editingId()) {
        // Update existing
        const updated = await this.subTypesService.updateEventSubType(this.editingId()!, {
          name: this.name(),
          code: this.code(),
          description: this.description(),
          iconPath: this.iconPath(),
          color: this.color(),
          isDefault: this.isDefault()
        });

        if (updated) {
          // Update groups and properties by getting the subtype and updating it
          const current = await this.subTypesService.getEventSubTypeById(this.editingId()!);
          if (current) {
            const fullUpdate: EventSubType = {
              ...current,
              propertyGroups: this.propertyGroups(),
              properties: this.properties(),
              updatedAt: new Date().toISOString()
            };
            await this.subTypesService['db'].put('event_subtypes', fullUpdate);
            this.subTypesService.eventSubTypes.update(list =>
              list.map(e => e.id === this.editingId() ? fullUpdate : e)
            );
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Plantilla actualizada',
            detail: `La plantilla "${this.name()}" ha sido actualizada`
          });
          this.router.navigate(['/evento-subtipos']);
        }
      } else {
        // Create new
        const created = await this.subTypesService.createEventSubType({
          name: this.name(),
          code: this.code(),
          description: this.description(),
          eventType: this.eventType(),
          iconPath: this.iconPath(),
          color: this.color(),
          isDefault: this.isDefault(),
          propertyGroups: this.propertyGroups(),
          properties: this.properties()
        });

        if (created) {
          this.messageService.add({
            severity: 'success',
            summary: 'Plantilla creada',
            detail: `La plantilla "${this.name()}" ha sido creada`
          });
          this.router.navigate(['/evento-subtipos']);
        }
      }
    } catch (error) {
      console.error('Error saving subtype:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar la plantilla'
      });
    } finally {
      this.saving.set(false);
    }
  }

  // ============ Helpers ============

  getEventTypeLabel = getEventTypeLabel;
  getPropertyDataTypeLabel = getPropertyDataTypeLabel;
  getPropertyDataTypeIcon = getPropertyDataTypeIcon;

  needsOptions(dataType: PropertyDataType): boolean {
    return dataType === PropertyDataType.SELECT || dataType === PropertyDataType.MULTISELECT;
  }

  getGroupName(groupId: string | null): string {
    if (!groupId) return 'Sin grupo';
    const group = this.propertyGroups().find(g => g.id === groupId);
    return group?.name || 'Grupo no encontrado';
  }

  getPropertiesByGroup(groupId: string | null): EventSubTypeProperty[] {
    return this.properties()
      .filter(p => p.propertyGroupId === groupId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getUngroupedProperties(): EventSubTypeProperty[] {
    return this.getPropertiesByGroup(null);
  }
}
