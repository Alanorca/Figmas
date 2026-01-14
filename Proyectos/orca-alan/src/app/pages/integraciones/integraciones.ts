import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Modules
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { MultiSelectModule } from 'primeng/multiselect';

import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';

import { IntegracionesService } from '../../services/integraciones.service';
import {
  Radio,
  RadioStatus,
  ConnectorType,
  CONNECTOR_TYPES,
  RADIO_CATEGORIES,
  RADIO_STATUS_OPTIONS,
  getConnectorTypeLabel,
  getConnectorTypeIcon,
  getRadioStatusLabel,
  getRadioStatusSeverity
} from '../../models/integraciones.models';

@Component({
  selector: 'app-integraciones',
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
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    BadgeModule,
    MultiSelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './integraciones.html',
  styleUrl: './integraciones.scss'
})
export class IntegracionesComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  integracionesService = inject(IntegracionesService);

  // Options for column filters (p-multiSelect)
  connectorTypeFilterOptions = CONNECTOR_TYPES.map(c => ({ label: c.label, value: c.value }));
  statusFilterOptions = RADIO_STATUS_OPTIONS.map(s => ({ label: s.label, value: s.value }));
  categoryFilterOptions = RADIO_CATEGORIES.map(c => ({ label: c.label, value: c.value }));

  // Context menu items
  menuItems: MenuItem[] = [];
  selectedRadio: Radio | null = null;

  async ngOnInit(): Promise<void> {
    // Seed data on first load (for demo purposes)
    await this.integracionesService.seedData();
    this.integracionesService.loadRadios();
  }

  // Navigation
  navigateToCreate(): void {
    this.router.navigate(['/integraciones/crear']);
  }

  navigateToDetail(radio: Radio): void {
    this.router.navigate(['/integraciones', radio.id]);
  }

  onRowSelect(event: any): void {
    if (event.data && !Array.isArray(event.data)) {
      this.navigateToDetail(event.data as Radio);
    }
  }

  navigateToEdit(radio: Radio): void {
    this.router.navigate(['/integraciones', radio.id, 'editar']);
  }

  // Actions
  async toggleStatus(radio: Radio, event: Event): Promise<void> {
    event.stopPropagation();
    const result = await this.integracionesService.toggleRadioStatus(radio.id);
    if (result) {
      const action = result.status === RadioStatus.ACTIVE ? 'activado' : 'desactivado';
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El radio "${radio.name}" ha sido ${action}`
      });
    }
  }

  async triggerSync(radio: Radio, event: Event): Promise<void> {
    event.stopPropagation();

    if (radio.status !== RadioStatus.ACTIVE) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Radio inactivo',
        detail: 'Solo se pueden sincronizar radios activos'
      });
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Sincronizando...',
      detail: `Iniciando sincronización de "${radio.name}"`
    });

    const result = await this.integracionesService.triggerManualSync(radio.id);

    if (result) {
      this.messageService.add({
        severity: result.status === 'success' ? 'success' : 'warn',
        summary: 'Sincronización completada',
        detail: `${result.pulsesCreated} pulsos creados, ${result.pulsesIntegrated} integrados`
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de sincronización',
        detail: 'No se pudo completar la sincronización'
      });
    }
  }

  confirmDelete(radio: Radio, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Está seguro de eliminar el radio "${radio.name}"? Esta acción eliminará también todos los pulsos y logs asociados.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        const deleted = await this.integracionesService.deleteRadio(radio.id);
        if (deleted) {
          this.messageService.add({
            severity: 'success',
            summary: 'Radio eliminado',
            detail: `El radio "${radio.name}" ha sido eliminado`
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el radio'
          });
        }
      }
    });
  }

  // Context menu
  showMenu(radio: Radio, menu: any, event: Event): void {
    event.stopPropagation();
    this.selectedRadio = radio;
    this.menuItems = [
      {
        label: 'Ver detalle',
        icon: 'pi pi-eye',
        command: () => this.navigateToDetail(radio)
      },
      {
        label: 'Editar',
        icon: 'pi pi-pencil',
        command: () => this.navigateToEdit(radio)
      },
      { separator: true },
      {
        label: radio.status === RadioStatus.ACTIVE ? 'Desactivar' : 'Activar',
        icon: radio.status === RadioStatus.ACTIVE ? 'pi pi-pause' : 'pi pi-play',
        command: () => this.integracionesService.toggleRadioStatus(radio.id)
      },
      {
        label: 'Sincronizar ahora',
        icon: 'pi pi-sync',
        disabled: radio.status !== RadioStatus.ACTIVE,
        command: () => this.triggerSync(radio, event)
      },
      { separator: true },
      {
        label: 'Eliminar',
        icon: 'pi pi-trash',
        styleClass: 'text-red-500',
        command: () => this.confirmDelete(radio, event)
      }
    ];
    menu.toggle(event);
  }

  // Helpers
  getConnectorTypeLabel = getConnectorTypeLabel;
  getConnectorTypeIcon = getConnectorTypeIcon;
  getRadioStatusLabel = getRadioStatusLabel;
  getRadioStatusSeverity = getRadioStatusSeverity;

  getRadioHealth(radio: Radio): 'healthy' | 'warning' | 'critical' {
    return this.integracionesService.getRadioHealth(radio);
  }

  getHealthSeverity(radio: Radio): 'success' | 'warn' | 'danger' {
    return this.integracionesService.getHealthSeverity(this.getRadioHealth(radio));
  }

  getHealthLabel(radio: Radio): string {
    const health = this.getRadioHealth(radio);
    switch (health) {
      case 'healthy': return 'Saludable';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Critico';
    }
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getConnectorMode(type: ConnectorType): string {
    const connector = CONNECTOR_TYPES.find(c => c.value === type);
    return connector?.mode === 'push' ? 'Push' : 'Pull';
  }
}
