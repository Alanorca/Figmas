// ==================== ENUMS ====================

export enum ConnectorType {
  WEBHOOK = 'webhook',
  REST_API = 'rest_api',
  DATABASE = 'database',
  FOLDER = 'folder'
}

export enum RadioStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  CONFIGURING = 'configuring'
}

export enum PulseStatus {
  RECEIVED = 'received',
  PROCESSING = 'processing',
  VALIDATED = 'validated',
  INTEGRATED = 'integrated',
  REJECTED = 'rejected',
  ERROR = 'error'
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLSERVER = 'sqlserver',
  ORACLE = 'oracle'
}

export enum FolderLocationType {
  SMB = 'smb',
  S3 = 's3',
  AZURE_BLOB = 'azure_blob',
  GCS = 'gcs'
}

export enum ScheduleFrequency {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MANUAL = 'manual'
}

export enum EntityType {
  ASSET = 'ASSET',
  RISK = 'RISK',
  INCIDENT = 'INCIDENT',
  DEFECT = 'DEFECT',
  VULNERABILITY = 'VULNERABILITY',
  COMPLIANCE_FINDING = 'COMPLIANCE_FINDING'
}

export enum TransformationType {
  NONE = 'none',
  VALUE_MAP = 'value_map',
  DEFAULT = 'default',
  DATE_FORMAT = 'date_format',
  CONCAT = 'concat',
  REGEX = 'regex',
  CALCULATE = 'calculate'
}

export enum ValidationType {
  REQUIRED = 'required',
  FORMAT = 'format',
  IN_LIST = 'in_list',
  NUMERIC = 'numeric',
  DATE = 'date',
  REGEX = 'regex'
}

export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  BEARER = 'bearer',
  BASIC = 'basic'
}

export enum PaginationType {
  OFFSET = 'offset',
  CURSOR = 'cursor',
  PAGE = 'page'
}

export enum PostProcessAction {
  NONE = 'none',
  MOVE = 'move',
  DELETE = 'delete'
}

export enum SyncLogStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  PARTIAL = 'partial',
  FAILED = 'failed'
}

// ==================== CONNECTOR CONFIGS ====================

export interface WebhookConfig {
  type: 'WEBHOOK';
  webhookUrl: string;
  webhookToken: string;
  webhookSecret?: string;
  enableSignatureValidation: boolean;
  allowedIps?: string[];
}

export interface RestApiConfig {
  type: 'REST_API';
  baseUrl: string;
  endpoint: string;
  method: 'GET' | 'POST';
  authType: AuthType;
  authConfig: {
    headerName?: string;
    apiKey?: string;
    bearerToken?: string;
    username?: string;
    password?: string;
  };
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  bodyTemplate?: string;
  timeout: number;
  pagination?: {
    type: PaginationType;
    pageParam: string;
    sizeParam: string;
    pageSize: number;
    totalField: string;
    maxPages: number;
  };
}

export interface DatabaseConfig {
  type: 'DATABASE';
  dbType: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  query: string;
  syncMode: 'full' | 'incremental';
  incrementalField?: string;
  identifierField: string;
}

export interface FolderConfig {
  type: 'FOLDER';
  locationType: FolderLocationType;
  path: string;
  credentials: Record<string, string>;
  filePattern: string;
  includeSubdirs: boolean;
  postProcessAction: PostProcessAction;
  processedFolder?: string;
  errorFolder?: string;
}

export type ConnectorConfig = WebhookConfig | RestApiConfig | DatabaseConfig | FolderConfig;

// ==================== MAPPING CONFIG ====================

export interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: {
    type: TransformationType;
    config: Record<string, any>;
  };
  required: boolean;
}

export interface ValidationRule {
  id: string;
  field: string;
  type: ValidationType;
  config: Record<string, any>;
  errorMessage: string;
}

export interface MappingConfig {
  sourceFormat: 'json' | 'xml' | 'csv';
  rootPath?: string;
  fieldMappings: FieldMapping[];
  validations?: ValidationRule[];
}

// ==================== SCHEDULE CONFIG ====================

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  interval?: number;
  time?: string;
  dayOfWeek?: number;
  timezone: string;
  nextRunAt?: string;
  lastRunAt?: string;
}

// ==================== RADIO ====================

export interface RadioStats {
  totalPulses: number;
  pulsesLast24h: number;
  lastSyncAt?: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  errorCount: number;
}

export interface Radio {
  id: string;
  name: string;
  description?: string;
  connectorType: ConnectorType;
  category: string;
  targetEntityType: EntityType;
  responsibleUserId: string;
  responsibleUserName?: string;
  status: RadioStatus;
  connectorConfig: ConnectorConfig;
  mappingConfig: MappingConfig;
  schedule?: ScheduleConfig;
  stats: RadioStats;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// ==================== PULSE ====================

export interface PulseError {
  field: string;
  message: string;
  value: any;
}

export interface Pulse {
  id: string;
  radioId: string;
  radioName?: string;
  status: PulseStatus;
  rawData: Record<string, any>;
  transformedData?: Record<string, any>;
  integratedEntityType?: EntityType;
  integratedEntityId?: string;
  integrationAction?: 'created' | 'updated';
  errors?: PulseError[];
  receivedAt: string;
  processedAt?: string;
  integratedAt?: string;
  syncSessionId?: string;
  sourceFile?: string;
}

// ==================== SYNC LOGS ====================

export interface RadioSyncLog {
  id: string;
  radioId: string;
  radioName?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  status: SyncLogStatus;
  pulsesCreated: number;
  pulsesIntegrated: number;
  pulsesRejected: number;
  pulsesError: number;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  filesProcessed?: number;
  filesFailed?: number;
}

// ==================== UI HELPERS ====================

export interface RadioCategory {
  label: string;
  value: string;
  icon?: string;
}

export const RADIO_CATEGORIES: RadioCategory[] = [
  { label: 'Seguridad', value: 'seguridad', icon: 'pi pi-shield' },
  { label: 'Cumplimiento', value: 'cumplimiento', icon: 'pi pi-check-circle' },
  { label: 'Infraestructura', value: 'infraestructura', icon: 'pi pi-server' },
  { label: 'Operaciones', value: 'operaciones', icon: 'pi pi-cog' },
  { label: 'Monitoreo', value: 'monitoreo', icon: 'pi pi-chart-line' },
  { label: 'Otro', value: 'otro', icon: 'pi pi-folder' }
];

export interface ConnectorTypeOption {
  label: string;
  value: ConnectorType;
  icon: string;
  description: string;
  mode: 'push' | 'pull';
}

export const CONNECTOR_TYPES: ConnectorTypeOption[] = [
  {
    label: 'Webhook',
    value: ConnectorType.WEBHOOK,
    icon: 'pi pi-bolt',
    description: 'ORCA SNS expone endpoint para recibir datos externos',
    mode: 'push'
  },
  {
    label: 'REST API',
    value: ConnectorType.REST_API,
    icon: 'pi pi-globe',
    description: 'ORCA SNS consume APIs externas periódicamente',
    mode: 'pull'
  },
  {
    label: 'Base de Datos',
    value: ConnectorType.DATABASE,
    icon: 'pi pi-database',
    description: 'Conexión directa a BD (MySQL, PostgreSQL, SQL Server)',
    mode: 'pull'
  },
  {
    label: 'Carpeta Compartida',
    value: ConnectorType.FOLDER,
    icon: 'pi pi-folder-open',
    description: 'Lectura de archivos desde ubicación de red o cloud',
    mode: 'pull'
  }
];

export const DATABASE_TYPES = [
  { label: 'PostgreSQL', value: DatabaseType.POSTGRESQL, port: 5432 },
  { label: 'MySQL', value: DatabaseType.MYSQL, port: 3306 },
  { label: 'SQL Server', value: DatabaseType.SQLSERVER, port: 1433 },
  { label: 'Oracle', value: DatabaseType.ORACLE, port: 1521 }
];

export const FOLDER_LOCATION_TYPES = [
  { label: 'SMB/CIFS (Red Windows)', value: FolderLocationType.SMB },
  { label: 'AWS S3', value: FolderLocationType.S3 },
  { label: 'Azure Blob Storage', value: FolderLocationType.AZURE_BLOB },
  { label: 'Google Cloud Storage', value: FolderLocationType.GCS }
];

export const SCHEDULE_FREQUENCIES = [
  { label: 'Cada N minutos', value: ScheduleFrequency.MINUTES },
  { label: 'Cada N horas', value: ScheduleFrequency.HOURS },
  { label: 'Diaria', value: ScheduleFrequency.DAILY },
  { label: 'Semanal', value: ScheduleFrequency.WEEKLY },
  { label: 'Manual', value: ScheduleFrequency.MANUAL }
];

export const ENTITY_TYPES = [
  { label: 'Activo', value: EntityType.ASSET },
  { label: 'Riesgo', value: EntityType.RISK },
  { label: 'Incidente', value: EntityType.INCIDENT },
  { label: 'Defecto', value: EntityType.DEFECT },
  { label: 'Vulnerabilidad', value: EntityType.VULNERABILITY },
  { label: 'Hallazgo de Cumplimiento', value: EntityType.COMPLIANCE_FINDING }
];

export const RADIO_STATUS_OPTIONS = [
  { label: 'Activo', value: RadioStatus.ACTIVE, severity: 'success' },
  { label: 'Inactivo', value: RadioStatus.INACTIVE, severity: 'secondary' },
  { label: 'Error', value: RadioStatus.ERROR, severity: 'danger' },
  { label: 'Configurando', value: RadioStatus.CONFIGURING, severity: 'warn' }
];

export const PULSE_STATUS_OPTIONS = [
  { label: 'Recibido', value: PulseStatus.RECEIVED, severity: 'info' },
  { label: 'Procesando', value: PulseStatus.PROCESSING, severity: 'warn' },
  { label: 'Validado', value: PulseStatus.VALIDATED, severity: 'success' },
  { label: 'Integrado', value: PulseStatus.INTEGRATED, severity: 'success' },
  { label: 'Rechazado', value: PulseStatus.REJECTED, severity: 'danger' },
  { label: 'Error', value: PulseStatus.ERROR, severity: 'danger' }
];

// ==================== HELPER FUNCTIONS ====================

export function getConnectorTypeLabel(type: ConnectorType): string {
  const option = CONNECTOR_TYPES.find(c => c.value === type);
  return option?.label || type;
}

export function getConnectorTypeIcon(type: ConnectorType): string {
  const option = CONNECTOR_TYPES.find(c => c.value === type);
  return option?.icon || 'pi pi-question';
}

export function getRadioStatusSeverity(status: RadioStatus): 'success' | 'secondary' | 'danger' | 'warn' {
  const option = RADIO_STATUS_OPTIONS.find(s => s.value === status);
  return (option?.severity as any) || 'secondary';
}

export function getRadioStatusLabel(status: RadioStatus): string {
  const option = RADIO_STATUS_OPTIONS.find(s => s.value === status);
  return option?.label || status;
}

export function getPulseStatusSeverity(status: PulseStatus): 'info' | 'warn' | 'success' | 'danger' {
  const option = PULSE_STATUS_OPTIONS.find(s => s.value === status);
  return (option?.severity as any) || 'info';
}

export function getPulseStatusLabel(status: PulseStatus): string {
  const option = PULSE_STATUS_OPTIONS.find(s => s.value === status);
  return option?.label || status;
}

export function generateWebhookUrl(radioId: string): string {
  return `https://api.orcasns.com/radios/webhook/${radioId}`;
}

export function generateWebhookToken(): string {
  return 'Bearer ' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateWebhookSecret(): string {
  return 'whsec_' + Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateRadioId(): string {
  return 'radio_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generatePulseId(): string {
  return 'pulse_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function generateSyncLogId(): string {
  return 'sync_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ==================== DEFAULT CONFIGS ====================

export function getDefaultWebhookConfig(): WebhookConfig {
  return {
    type: 'WEBHOOK',
    webhookUrl: '',
    webhookToken: generateWebhookToken(),
    webhookSecret: generateWebhookSecret(),
    enableSignatureValidation: false,
    allowedIps: []
  };
}

export function getDefaultRestApiConfig(): RestApiConfig {
  return {
    type: 'REST_API',
    baseUrl: '',
    endpoint: '',
    method: 'GET',
    authType: AuthType.NONE,
    authConfig: {},
    headers: {},
    queryParams: {},
    timeout: 30000
  };
}

export function getDefaultDatabaseConfig(): DatabaseConfig {
  return {
    type: 'DATABASE',
    dbType: DatabaseType.POSTGRESQL,
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false,
    query: '',
    syncMode: 'incremental',
    identifierField: 'id'
  };
}

export function getDefaultFolderConfig(): FolderConfig {
  return {
    type: 'FOLDER',
    locationType: FolderLocationType.SMB,
    path: '',
    credentials: {},
    filePattern: '*.csv,*.json',
    includeSubdirs: false,
    postProcessAction: PostProcessAction.MOVE,
    processedFolder: '/processed',
    errorFolder: '/errors'
  };
}

export function getDefaultMappingConfig(): MappingConfig {
  return {
    sourceFormat: 'json',
    fieldMappings: [],
    validations: []
  };
}

export function getDefaultScheduleConfig(): ScheduleConfig {
  return {
    frequency: ScheduleFrequency.DAILY,
    interval: 1,
    time: '02:00',
    timezone: 'America/Mexico_City'
  };
}

export function getDefaultRadioStats(): RadioStats {
  return {
    totalPulses: 0,
    pulsesLast24h: 0,
    errorCount: 0
  };
}

export function createNewRadio(connectorType: ConnectorType): Partial<Radio> {
  let connectorConfig: ConnectorConfig;

  switch (connectorType) {
    case ConnectorType.WEBHOOK:
      connectorConfig = getDefaultWebhookConfig();
      break;
    case ConnectorType.REST_API:
      connectorConfig = getDefaultRestApiConfig();
      break;
    case ConnectorType.DATABASE:
      connectorConfig = getDefaultDatabaseConfig();
      break;
    case ConnectorType.FOLDER:
      connectorConfig = getDefaultFolderConfig();
      break;
  }

  return {
    id: generateRadioId(),
    connectorType,
    status: RadioStatus.CONFIGURING,
    connectorConfig,
    mappingConfig: getDefaultMappingConfig(),
    schedule: connectorType !== ConnectorType.WEBHOOK ? getDefaultScheduleConfig() : undefined,
    stats: getDefaultRadioStats(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
