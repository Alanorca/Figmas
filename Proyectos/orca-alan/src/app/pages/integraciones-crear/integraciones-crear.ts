import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { IntegracionesService } from '../../services/integraciones.service';
import {
  Radio,
  ConnectorType,
  EntityType,
  AuthType,
  DatabaseType,
  FolderLocationType,
  ScheduleFrequency,
  CONNECTOR_TYPES,
  RADIO_CATEGORIES,
  ENTITY_TYPES,
  DATABASE_TYPES,
  FOLDER_LOCATION_TYPES,
  SCHEDULE_FREQUENCIES,
  WebhookConfig,
  RestApiConfig,
  DatabaseConfig,
  FolderConfig,
  MappingConfig,
  ScheduleConfig,
  getDefaultWebhookConfig,
  getDefaultRestApiConfig,
  getDefaultDatabaseConfig,
  getDefaultFolderConfig,
  getDefaultMappingConfig,
  getDefaultScheduleConfig,
  generateWebhookUrl,
  generateWebhookToken,
  generateWebhookSecret
} from '../../models/integraciones.models';

@Component({
  selector: 'app-integraciones-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './integraciones-crear.html',
  styleUrl: './integraciones-crear.scss'
})
export class IntegracionesCrearComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private integracionesService = inject(IntegracionesService);

  // Mode
  isEditMode = signal(false);
  editingRadioId = signal<string | null>(null);

  // Form state
  activeStep = 0;
  saving = signal(false);

  // Step 1: Basic Info
  name = signal('');
  description = signal('');
  category = signal('seguridad');
  targetEntityType = signal<EntityType>(EntityType.ASSET);
  responsibleUserId = signal('usr-admin');

  // Step 2: Connector Type and Config
  connectorType = signal<ConnectorType>(ConnectorType.WEBHOOK);

  // Webhook Config
  webhookConfig = signal<WebhookConfig>(getDefaultWebhookConfig());

  // REST API Config
  restApiConfig = signal<RestApiConfig>(getDefaultRestApiConfig());

  // Database Config
  databaseConfig = signal<DatabaseConfig>(getDefaultDatabaseConfig());

  // Folder Config
  folderConfig = signal<FolderConfig>(getDefaultFolderConfig());

  // Step 3: Mapping Config
  mappingConfig = signal<MappingConfig>(getDefaultMappingConfig());

  // Step 4: Schedule Config
  scheduleConfig = signal<ScheduleConfig>(getDefaultScheduleConfig());
  scheduleEnabled = signal(true);

  // Options
  connectorTypeOptions = CONNECTOR_TYPES;
  categoryOptions = RADIO_CATEGORIES;
  entityTypeOptions = ENTITY_TYPES;
  databaseTypeOptions = DATABASE_TYPES;
  folderLocationOptions = FOLDER_LOCATION_TYPES;
  scheduleFrequencyOptions = SCHEDULE_FREQUENCIES;
  authTypeOptions = [
    { label: 'Sin autenticación', value: AuthType.NONE },
    { label: 'API Key', value: AuthType.API_KEY },
    { label: 'Bearer Token', value: AuthType.BEARER },
    { label: 'Basic Auth', value: AuthType.BASIC }
  ];
  httpMethodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' }
  ];
  sourceFormatOptions = [
    { label: 'JSON', value: 'json' },
    { label: 'XML', value: 'xml' },
    { label: 'CSV', value: 'csv' }
  ];

  // Computed
  currentConnectorConfig = computed(() => {
    switch (this.connectorType()) {
      case ConnectorType.WEBHOOK:
        return this.webhookConfig();
      case ConnectorType.REST_API:
        return this.restApiConfig();
      case ConnectorType.DATABASE:
        return this.databaseConfig();
      case ConnectorType.FOLDER:
        return this.folderConfig();
    }
  });

  isWebhook = computed(() => this.connectorType() === ConnectorType.WEBHOOK);
  isRestApi = computed(() => this.connectorType() === ConnectorType.REST_API);
  isDatabase = computed(() => this.connectorType() === ConnectorType.DATABASE);
  isFolder = computed(() => this.connectorType() === ConnectorType.FOLDER);

  isPullConnector = computed(() =>
    this.connectorType() !== ConnectorType.WEBHOOK
  );

  ngOnInit(): void {
    // Check if we're editing an existing radio
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.editingRadioId.set(id);
      this.loadRadio(id);
    }
  }

  async loadRadio(id: string): Promise<void> {
    const radio = await this.integracionesService.getRadioById(id);
    if (!radio) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se encontró el radio'
      });
      this.router.navigate(['/integraciones']);
      return;
    }

    // Load basic info
    this.name.set(radio.name);
    this.description.set(radio.description || '');
    this.category.set(radio.category);
    this.targetEntityType.set(radio.targetEntityType);
    this.responsibleUserId.set(radio.responsibleUserId);

    // Load connector config
    this.connectorType.set(radio.connectorType);
    switch (radio.connectorType) {
      case ConnectorType.WEBHOOK:
        this.webhookConfig.set(radio.connectorConfig as WebhookConfig);
        break;
      case ConnectorType.REST_API:
        this.restApiConfig.set(radio.connectorConfig as RestApiConfig);
        break;
      case ConnectorType.DATABASE:
        this.databaseConfig.set(radio.connectorConfig as DatabaseConfig);
        break;
      case ConnectorType.FOLDER:
        this.folderConfig.set(radio.connectorConfig as FolderConfig);
        break;
    }

    // Load mapping config
    this.mappingConfig.set(radio.mappingConfig);

    // Load schedule config
    if (radio.schedule) {
      this.scheduleConfig.set(radio.schedule);
      this.scheduleEnabled.set(true);
    } else {
      this.scheduleEnabled.set(false);
    }
  }

  onConnectorTypeChange(): void {
    // Reset configs when connector type changes
    if (!this.isEditMode()) {
      switch (this.connectorType()) {
        case ConnectorType.WEBHOOK:
          this.webhookConfig.set(getDefaultWebhookConfig());
          break;
        case ConnectorType.REST_API:
          this.restApiConfig.set(getDefaultRestApiConfig());
          break;
        case ConnectorType.DATABASE:
          this.databaseConfig.set(getDefaultDatabaseConfig());
          break;
        case ConnectorType.FOLDER:
          this.folderConfig.set(getDefaultFolderConfig());
          break;
      }
    }
  }

  onDatabaseTypeChange(): void {
    const dbType = this.databaseConfig().dbType;
    const defaultPort = DATABASE_TYPES.find(d => d.value === dbType)?.port || 5432;
    this.databaseConfig.update(config => ({ ...config, port: defaultPort }));
  }

  generateNewWebhookCredentials(): void {
    this.webhookConfig.update(config => ({
      ...config,
      webhookToken: generateWebhookToken(),
      webhookSecret: generateWebhookSecret()
    }));
  }

  // Validation
  isStep1Valid(): boolean {
    return this.name().trim().length > 0 && this.category().length > 0;
  }

  isStep2Valid(): boolean {
    const config = this.currentConnectorConfig();

    switch (this.connectorType()) {
      case ConnectorType.WEBHOOK:
        return true; // Webhook doesn't require additional config

      case ConnectorType.REST_API: {
        const restConfig = config as RestApiConfig;
        return restConfig.baseUrl.trim().length > 0 && restConfig.endpoint.trim().length > 0;
      }

      case ConnectorType.DATABASE: {
        const dbConfig = config as DatabaseConfig;
        return (
          dbConfig.host.trim().length > 0 &&
          dbConfig.port > 0 &&
          dbConfig.database.trim().length > 0 &&
          dbConfig.username.trim().length > 0 &&
          dbConfig.query.trim().length > 0
        );
      }

      case ConnectorType.FOLDER: {
        const folderConfig = config as FolderConfig;
        return folderConfig.path.trim().length > 0;
      }
    }

    return false;
  }

  isStep3Valid(): boolean {
    // Mapping is optional for now
    return true;
  }

  canProceed(): boolean {
    switch (this.activeStep) {
      case 0: return this.isStep1Valid();
      case 1: return this.isStep2Valid();
      case 2: return this.isStep3Valid();
      case 3: return true;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.activeStep < 3) {
      this.activeStep++;
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  goToStep(step: number): void {
    this.activeStep = step;
  }

  async save(): Promise<void> {
    if (!this.isStep1Valid() || !this.isStep2Valid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    this.saving.set(true);

    try {
      const radioData: Partial<Radio> = {
        name: this.name(),
        description: this.description() || undefined,
        category: this.category(),
        targetEntityType: this.targetEntityType(),
        responsibleUserId: this.responsibleUserId(),
        connectorType: this.connectorType(),
        connectorConfig: this.currentConnectorConfig(),
        mappingConfig: this.mappingConfig(),
        schedule: this.isPullConnector() && this.scheduleEnabled()
          ? this.scheduleConfig()
          : undefined
      };

      if (this.isEditMode() && this.editingRadioId()) {
        await this.integracionesService.updateRadio(this.editingRadioId()!, radioData);
        this.messageService.add({
          severity: 'success',
          summary: 'Radio actualizado',
          detail: 'Los cambios han sido guardados'
        });
        setTimeout(() => {
          this.router.navigate(['/integraciones', this.editingRadioId()]);
        }, 1500);
      } else {
        const newRadio = await this.integracionesService.createRadio(radioData);
        this.messageService.add({
          severity: 'success',
          summary: 'Radio creado',
          detail: 'Ahora configura el mapeo de campos con datos reales'
        });
        // Redirect to detail page with mapping tab selected
        setTimeout(() => {
          this.router.navigate(['/integraciones', newRadio.id], { queryParams: { tab: 1 } });
        }, 1500);
      }

    } catch (err) {
      console.error('Error saving radio:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo guardar el radio'
      });
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/integraciones']);
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

  // Helper methods for template config updates
  updateScheduleFrequency(value: ScheduleFrequency): void {
    this.scheduleConfig.update(c => ({ ...c, frequency: value }));
  }

  updateScheduleInterval(value: number | null): void {
    this.scheduleConfig.update(c => ({ ...c, interval: value || 1 }));
  }

  updateScheduleTime(value: string): void {
    this.scheduleConfig.update(c => ({ ...c, time: value || '' }));
  }

  updateWebhookSignatureValidation(value: boolean): void {
    this.webhookConfig.update(c => ({ ...c, enableSignatureValidation: value }));
  }

  updateRestApiBaseUrl(value: string): void {
    this.restApiConfig.update(c => ({ ...c, baseUrl: value }));
  }

  updateRestApiEndpoint(value: string): void {
    this.restApiConfig.update(c => ({ ...c, endpoint: value }));
  }

  updateRestApiMethod(value: 'GET' | 'POST'): void {
    this.restApiConfig.update(c => ({ ...c, method: value }));
  }

  updateRestApiAuthType(value: AuthType): void {
    this.restApiConfig.update(c => ({ ...c, authType: value }));
  }

  updateRestApiTimeout(value: number | null): void {
    this.restApiConfig.update(c => ({ ...c, timeout: value || 30000 }));
  }

  updateRestApiAuthHeader(value: string): void {
    this.restApiConfig.update(c => ({ ...c, authConfig: { ...c.authConfig, headerName: value } }));
  }

  updateRestApiAuthKey(value: string): void {
    this.restApiConfig.update(c => ({ ...c, authConfig: { ...c.authConfig, apiKey: value } }));
  }

  updateRestApiAuthBearer(value: string): void {
    this.restApiConfig.update(c => ({ ...c, authConfig: { ...c.authConfig, bearerToken: value } }));
  }

  updateRestApiAuthUsername(value: string): void {
    this.restApiConfig.update(c => ({ ...c, authConfig: { ...c.authConfig, username: value } }));
  }

  updateRestApiAuthPassword(value: string): void {
    this.restApiConfig.update(c => ({ ...c, authConfig: { ...c.authConfig, password: value } }));
  }

  updateDatabaseType(value: DatabaseType): void {
    this.databaseConfig.update(c => ({ ...c, dbType: value }));
    this.onDatabaseTypeChange();
  }

  updateDatabaseHost(value: string): void {
    this.databaseConfig.update(c => ({ ...c, host: value }));
  }

  updateDatabasePort(value: number | null): void {
    this.databaseConfig.update(c => ({ ...c, port: value || 5432 }));
  }

  updateDatabaseName(value: string): void {
    this.databaseConfig.update(c => ({ ...c, database: value }));
  }

  updateDatabaseUsername(value: string): void {
    this.databaseConfig.update(c => ({ ...c, username: value }));
  }

  updateDatabasePassword(value: string): void {
    this.databaseConfig.update(c => ({ ...c, password: value }));
  }

  updateDatabaseSsl(value: boolean): void {
    this.databaseConfig.update(c => ({ ...c, ssl: value }));
  }

  updateDatabaseQuery(value: string): void {
    this.databaseConfig.update(c => ({ ...c, query: value }));
  }

  updateFolderLocationType(value: FolderLocationType): void {
    this.folderConfig.update(c => ({ ...c, locationType: value }));
  }

  updateFolderPath(value: string): void {
    this.folderConfig.update(c => ({ ...c, path: value }));
  }

  updateFolderPattern(value: string): void {
    this.folderConfig.update(c => ({ ...c, filePattern: value }));
  }

  updateFolderSubdirs(value: boolean): void {
    this.folderConfig.update(c => ({ ...c, includeSubdirs: value }));
  }

  updateMappingFormat(value: 'json' | 'xml' | 'csv'): void {
    this.mappingConfig.update(c => ({ ...c, sourceFormat: value }));
  }

  updateMappingRootPath(value: string): void {
    this.mappingConfig.update(c => ({ ...c, rootPath: value }));
  }
}
