import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { EventoSubtiposService } from '../../services/evento-subtipos.service';
import {
  EventSubType,
  EventType,
  EVENT_TYPES,
  getEventTypeLabel,
  getEventTypeIcon,
  getEventTypeColor
} from '../../models/eventos.models';

@Component({
  selector: 'app-evento-subtipos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    MenuModule,
    ConfirmDialogModule,
    ToastModule,
    BadgeModule,
    DialogModule,
    TextareaModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './evento-subtipos.html',
  styleUrl: './evento-subtipos.scss'
})
export class EventoSubtiposComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  subTypesService = inject(EventoSubtiposService);

  // Filtros
  selectedEventType = signal<EventType | null>(null);
  searchText = signal('');

  // Opciones
  eventTypeOptions = [
    { label: 'Todos los tipos', value: null },
    ...EVENT_TYPES.map(t => ({ label: t.label, value: t.value, icon: t.icon }))
  ];

  // Subtipos filtrados
  filteredSubTypes = computed(() => {
    let result = this.subTypesService.eventSubTypes();

    if (this.selectedEventType() !== null) {
      result = result.filter(st => st.eventType === this.selectedEventType());
    }

    const search = this.searchText().toLowerCase();
    if (search) {
      result = result.filter(st =>
        st.name.toLowerCase().includes(search) ||
        st.code.toLowerCase().includes(search) ||
        st.description.toLowerCase().includes(search)
      );
    }

    return result;
  });

  // Context menu
  menuItems: MenuItem[] = [];
  selectedSubType: EventSubType | null = null;

  // Clone dialog
  showCloneDialog = signal(false);
  cloneName = signal('');
  cloneCode = signal('');

  // Import/Export
  showImportDialog = signal(false);
  importJson = signal('');

  async ngOnInit(): Promise<void> {
    await this.subTypesService.loadEventSubTypes();

    // Seed default subtypes if none exist
    if (this.subTypesService.eventSubTypes().length === 0) {
      await this.subTypesService.seedDefaultSubTypes();
    }
  }

  // ============ Navegación ============

  navigateToCreate(): void {
    this.router.navigate(['/evento-subtipos/crear']);
  }

  navigateToEdit(subType: EventSubType): void {
    this.router.navigate(['/evento-subtipos', subType.id, 'editar']);
  }

  // ============ Acciones ============

  async toggleActive(subType: EventSubType, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const result = await this.subTypesService.toggleActive(subType.id);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `La plantilla "${subType.name}" ahora está ${result.isActive ? 'activa' : 'inactiva'}`
      });
    }
  }

  async setAsDefault(subType: EventSubType, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const result = await this.subTypesService.setAsDefault(subType.id);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Plantilla predeterminada',
        detail: `"${subType.name}" es ahora la plantilla predeterminada para ${getEventTypeLabel(subType.eventType)}`
      });
    }
  }

  confirmDelete(subType: EventSubType, event: globalThis.Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de eliminar la plantilla "${subType.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.subTypesService.deleteEventSubType(subType.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Plantilla eliminada',
            detail: `La plantilla "${subType.name}" ha sido eliminada`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la plantilla'
          });
        }
      }
    });
  }

  // ============ Clone ============

  openCloneDialog(subType: EventSubType, event: globalThis.Event): void {
    event.stopPropagation();
    this.selectedSubType = subType;
    this.cloneName.set(`${subType.name} (Copia)`);
    this.cloneCode.set(`${subType.code}_copy`);
    this.showCloneDialog.set(true);
  }

  async confirmClone(): Promise<void> {
    if (!this.selectedSubType) return;

    const result = await this.subTypesService.cloneEventSubType(
      this.selectedSubType.id,
      this.cloneName(),
      this.cloneCode()
    );

    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Plantilla clonada',
        detail: `Se creó la plantilla "${result.name}"`
      });
      this.showCloneDialog.set(false);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo clonar la plantilla'
      });
    }
  }

  // ============ Export ============

  async exportSubType(subType: EventSubType, event: globalThis.Event): Promise<void> {
    event.stopPropagation();
    const json = await this.subTypesService.exportEventSubType(subType.id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subType.code}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.messageService.add({
        severity: 'success',
        summary: 'Exportación exitosa',
        detail: `Plantilla "${subType.name}" exportada`
      });
    }
  }

  // ============ Import ============

  openImportDialog(): void {
    this.importJson.set('');
    this.showImportDialog.set(true);
  }

  async confirmImport(): Promise<void> {
    const json = this.importJson();
    if (!json.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'JSON vacío',
        detail: 'Por favor ingrese el JSON de la plantilla'
      });
      return;
    }

    const result = await this.subTypesService.importEventSubType(json);
    if (result) {
      this.messageService.add({
        severity: 'success',
        summary: 'Importación exitosa',
        detail: `Se importó la plantilla "${result.name}"`
      });
      this.showImportDialog.set(false);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de importación',
        detail: 'El JSON no es válido o está corrupto'
      });
    }
  }

  // ============ Context Menu ============

  showMenu(subType: EventSubType, menu: any, event: globalThis.Event): void {
    event.stopPropagation();
    this.selectedSubType = subType;
    this.menuItems = [
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.navigateToEdit(subType)
      },
      {
        label: 'Clonar',
        icon: 'pi pi-copy',
        command: () => this.openCloneDialog(subType, event)
      },
      {
        label: 'Exportar JSON',
        icon: 'pi pi-download',
        command: () => this.exportSubType(subType, event)
      },
      { separator: true },
      {
        label: subType.isDefault ? 'Es predeterminada' : 'Establecer como predeterminada',
        icon: 'pi pi-star',
        disabled: subType.isDefault,
        command: () => this.setAsDefault(subType, event)
      },
      {
        label: subType.isActive ? 'Desactivar' : 'Activar',
        icon: subType.isActive ? 'pi pi-times-circle' : 'pi pi-check-circle',
        command: () => this.toggleActive(subType, event)
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete(subType, event)
      }
    ];
    menu.toggle(event);
  }

  // ============ Helpers ============

  getEventTypeLabel = getEventTypeLabel;
  getEventTypeIcon = getEventTypeIcon;
  getEventTypeColor = getEventTypeColor;

  getEventTypeSeverity(eventType: EventType): 'warn' | 'danger' | 'info' {
    switch (eventType) {
      case EventType.RISK: return 'warn';
      case EventType.INCIDENT: return 'danger';
      case EventType.DEFECT: return 'info';
      default: return 'info';
    }
  }

  onRowClick(subType: EventSubType): void {
    this.navigateToEdit(subType);
  }
}
