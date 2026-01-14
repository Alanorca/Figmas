import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { PanelModule } from 'primeng/panel';

import { MessageService, ConfirmationService } from 'primeng/api';

import { IntegracionesService } from '../../services/integraciones.service';
import {
  Radio,
  Pulse,
  RadioSyncLog,
  RadioStatus,
  PulseStatus,
  ConnectorType,
  FieldMapping,
  CONNECTOR_TYPES,
  getConnectorTypeLabel,
  getConnectorTypeIcon,
  getRadioStatusLabel,
  getRadioStatusSeverity,
  getPulseStatusLabel,
  getPulseStatusSeverity
} from '../../models/integraciones.models';

@Component({
  selector: 'app-integraciones-detalle',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TabsModule,
    TableModule,
    TagModule,
    TooltipModule,
    ToastModule,
    DividerModule,
    ProgressSpinnerModule,
    BadgeModule,
    ConfirmDialogModule,
    DrawerModule,
    SelectModule,
    PanelModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './integraciones-detalle.html',
  styleUrl: './integraciones-detalle.scss'
})
export class IntegracionesDetalleComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  integracionesService = inject(IntegracionesService);

  // State
  radio = signal<Radio | null>(null);
  loading = signal(true);
  activeTab = signal(0);

  // Pulse detail drawer
  showPulseDrawer = signal(false);
  selectedPulse = signal<Pulse | null>(null);

  // Pulse filter
  pulseStatusFilter = signal<PulseStatus | null>(null);
  pulseStatusOptions = [
    { label: 'Todos', value: null },
    { label: 'Recibido', value: PulseStatus.RECEIVED },
    { label: 'Procesando', value: PulseStatus.PROCESSING },
    { label: 'Validado', value: PulseStatus.VALIDATED },
    { label: 'Integrado', value: PulseStatus.INTEGRATED },
    { label: 'Rechazado', value: PulseStatus.REJECTED },
    { label: 'Error', value: PulseStatus.ERROR }
  ];

  // Mapping configuration
  testingConnection = signal(false);
  sampleData = signal<Record<string, any>[] | null>(null);
  detectedFields = signal<string[]>([]);
  fieldMappings = signal<FieldMapping[]>([]);
  targetFields = signal<{ field: string; label: string; required: boolean }[]>([]);
  savingMappings = signal(false);
  mappingChanged = signal(false);

  // Computed
  filteredPulses = computed(() => {
    const status = this.pulseStatusFilter();
    if (!status) return this.integracionesService.pulses();
    return this.integracionesService.filterPulses({ status });
  });

  connectorConfig = computed(() => {
    const r = this.radio();
    if (!r) return null;
    return r.connectorConfig as any;
  });

  isWebhook = computed(() => this.radio()?.connectorType === ConnectorType.WEBHOOK);
  isRestApi = computed(() => this.radio()?.connectorType === ConnectorType.REST_API);
  isDatabase = computed(() => this.radio()?.connectorType === ConnectorType.DATABASE);
  isFolder = computed(() => this.radio()?.connectorType === ConnectorType.FOLDER);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Check for tab query parameter
      const tabParam = this.route.snapshot.queryParamMap.get('tab');
      if (tabParam) {
        this.activeTab.set(parseInt(tabParam, 10));
      }
      this.loadRadio(id);
    } else {
      this.router.navigate(['/integraciones']);
    }
  }

  async loadRadio(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const radio = await this.integracionesService.getRadioById(id);
      if (radio) {
        this.radio.set(radio);
        // Load existing mappings
        this.fieldMappings.set(radio.mappingConfig.fieldMappings || []);
        // Load target fields for the entity type
        this.targetFields.set(
          this.integracionesService.getTargetFieldsForEntityType(radio.targetEntityType)
        );
        await Promise.all([
          this.integracionesService.loadPulsesByRadio(id),
          this.integracionesService.loadSyncLogsByRadio(id)
        ]);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Radio no encontrado'
        });
        this.router.navigate(['/integraciones']);
      }
    } catch (err) {
      console.error('Error loading radio:', err);
    } finally {
      this.loading.set(false);
    }
  }

  navigateToEdit(): void {
    const radio = this.radio();
    if (radio) {
      this.router.navigate(['/integraciones', radio.id, 'editar']);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/integraciones']);
  }

  async toggleStatus(): Promise<void> {
    const radio = this.radio();
    if (!radio) return;

    const result = await this.integracionesService.toggleRadioStatus(radio.id);
    if (result) {
      this.radio.set(result);
      const action = result.status === RadioStatus.ACTIVE ? 'activado' : 'desactivado';
      this.messageService.add({
        severity: 'success',
        summary: 'Estado actualizado',
        detail: `El radio ha sido ${action}`
      });
    }
  }

  async triggerSync(): Promise<void> {
    const radio = this.radio();
    if (!radio || radio.status !== RadioStatus.ACTIVE) {
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
      detail: 'Iniciando sincronización manual'
    });

    const result = await this.integracionesService.triggerManualSync(radio.id);

    if (result) {
      await this.loadRadio(radio.id);
      this.messageService.add({
        severity: result.status === 'success' ? 'success' : 'warn',
        summary: 'Sincronización completada',
        detail: `${result.pulsesCreated} pulsos creados, ${result.pulsesIntegrated} integrados`
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo completar la sincronización'
      });
    }
  }

  confirmDelete(): void {
    const radio = this.radio();
    if (!radio) return;

    this.confirmationService.confirm({
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
            detail: 'El radio ha sido eliminado'
          });
          this.router.navigate(['/integraciones']);
        }
      }
    });
  }

  // Pulse methods
  showPulseDetail(pulse: Pulse): void {
    this.selectedPulse.set(pulse);
    this.showPulseDrawer.set(true);
  }

  closePulseDrawer(): void {
    this.showPulseDrawer.set(false);
    this.selectedPulse.set(null);
  }

  async reprocessPulse(pulse: Pulse): Promise<void> {
    if (pulse.status !== PulseStatus.ERROR && pulse.status !== PulseStatus.REJECTED) {
      return;
    }

    const radio = this.radio();
    if (!radio) return;

    const count = await this.integracionesService.reprocessPulses([pulse.id]);
    await this.integracionesService.loadPulsesByRadio(radio.id);

    this.messageService.add({
      severity: count > 0 ? 'success' : 'info',
      summary: 'Reprocesamiento',
      detail: count > 0 ? 'Pulso reprocesado exitosamente' : 'No se pudo reprocesar el pulso'
    });

    this.closePulseDrawer();
  }

  // Helpers
  getConnectorTypeLabel = getConnectorTypeLabel;
  getConnectorTypeIcon = getConnectorTypeIcon;
  getRadioStatusLabel = getRadioStatusLabel;
  getRadioStatusSeverity = getRadioStatusSeverity;
  getPulseStatusLabel = getPulseStatusLabel;
  getPulseStatusSeverity = getPulseStatusSeverity;

  getRadioHealth(): 'healthy' | 'warning' | 'critical' {
    const radio = this.radio();
    if (!radio) return 'warning';
    return this.integracionesService.getRadioHealth(radio);
  }

  getHealthSeverity(): 'success' | 'warn' | 'danger' {
    return this.integracionesService.getHealthSeverity(this.getRadioHealth());
  }

  getHealthLabel(): string {
    const health = this.getRadioHealth();
    switch (health) {
      case 'healthy': return 'Saludable';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Crítico';
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

  formatDuration(ms: number | undefined): string {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }

  formatJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'info',
        summary: 'Copiado',
        detail: 'Texto copiado al portapapeles'
      });
    });
  }

  // ==================== MAPPING CONFIGURATION ====================

  async testConnection(): Promise<void> {
    const radio = this.radio();
    if (!radio) return;

    this.testingConnection.set(true);
    this.messageService.add({
      severity: 'info',
      summary: 'Probando conexión',
      detail: 'Conectando con la fuente de datos...'
    });

    try {
      const result = await this.integracionesService.testConnectionAndGetSampleData(radio.id);

      if (result.success) {
        this.sampleData.set(result.sampleData);
        this.detectedFields.set(result.detectedFields);
        this.messageService.add({
          severity: 'success',
          summary: 'Conexión exitosa',
          detail: `Se detectaron ${result.detectedFields.length} campos en los datos`
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de conexión',
          detail: result.error || 'No se pudo conectar con la fuente de datos'
        });
      }
    } catch (err) {
      console.error('Connection test error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al probar la conexión'
      });
    } finally {
      this.testingConnection.set(false);
    }
  }

  addFieldMapping(): void {
    const currentMappings = this.fieldMappings();
    const newMapping: FieldMapping = {
      id: `mapping-${Date.now()}`,
      sourceField: '',
      targetField: '',
      required: false
    };
    this.fieldMappings.set([...currentMappings, newMapping]);
    this.mappingChanged.set(true);
  }

  removeFieldMapping(mappingId: string): void {
    const currentMappings = this.fieldMappings();
    this.fieldMappings.set(currentMappings.filter(m => m.id !== mappingId));
    this.mappingChanged.set(true);
  }

  updateMappingSource(mappingId: string, sourceField: string): void {
    const currentMappings = this.fieldMappings();
    this.fieldMappings.set(
      currentMappings.map(m =>
        m.id === mappingId ? { ...m, sourceField } : m
      )
    );
    this.mappingChanged.set(true);
  }

  updateMappingTarget(mappingId: string, targetField: string): void {
    const currentMappings = this.fieldMappings();
    const targetInfo = this.targetFields().find(t => t.field === targetField);
    this.fieldMappings.set(
      currentMappings.map(m =>
        m.id === mappingId ? { ...m, targetField, required: targetInfo?.required || false } : m
      )
    );
    this.mappingChanged.set(true);
  }

  updateMappingRequired(mappingId: string, required: boolean): void {
    const currentMappings = this.fieldMappings();
    this.fieldMappings.set(
      currentMappings.map(m =>
        m.id === mappingId ? { ...m, required } : m
      )
    );
    this.mappingChanged.set(true);
  }

  async saveMappings(): Promise<void> {
    const radio = this.radio();
    if (!radio) return;

    // Validate mappings
    const mappings = this.fieldMappings();
    const incompleteMappings = mappings.filter(m => !m.sourceField || !m.targetField);

    if (incompleteMappings.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Mapeos incompletos',
        detail: 'Por favor complete todos los campos de origen y destino'
      });
      return;
    }

    this.savingMappings.set(true);
    try {
      const result = await this.integracionesService.saveFieldMappings(radio.id, mappings);

      if (result) {
        this.radio.set(result);
        this.mappingChanged.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Mapeos guardados',
          detail: 'La configuración de mapeo ha sido guardada'
        });

        // If radio was in CONFIGURING status and now has mappings, offer to activate
        if (result.status === RadioStatus.CONFIGURING && mappings.length > 0) {
          this.confirmationService.confirm({
            message: '¿Desea activar el radio ahora que la configuración está completa?',
            header: 'Activar Radio',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Activar',
            rejectLabel: 'Más tarde',
            accept: async () => {
              await this.integracionesService.activateRadio(radio.id);
              await this.loadRadio(radio.id);
              this.messageService.add({
                severity: 'success',
                summary: 'Radio activado',
                detail: 'El radio está ahora activo y listo para recibir datos'
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error saving mappings:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron guardar los mapeos'
      });
    } finally {
      this.savingMappings.set(false);
    }
  }

  getSourceFieldOptions(): { label: string; value: string }[] {
    return this.detectedFields().map(f => ({ label: f, value: f }));
  }

  getTargetFieldOptions(): { label: string; value: string }[] {
    return this.targetFields().map(f => ({
      label: f.required ? `${f.label} *` : f.label,
      value: f.field
    }));
  }

  getTargetFieldLabel(field: string): string {
    const target = this.targetFields().find(t => t.field === field);
    return target?.label || field;
  }

  isTargetFieldRequired(field: string): boolean {
    const target = this.targetFields().find(t => t.field === field);
    return target?.required || false;
  }

  getMappingCompleteness(): number {
    const required = this.targetFields().filter(t => t.required);
    if (required.length === 0) return 100;

    const mappedRequired = required.filter(r =>
      this.fieldMappings().some(m => m.targetField === r.field && m.sourceField)
    );

    return Math.round((mappedRequired.length / required.length) * 100);
  }
}
