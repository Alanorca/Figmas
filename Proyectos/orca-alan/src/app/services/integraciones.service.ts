import { Injectable, inject, signal, computed } from '@angular/core';
import { IndexedDBService } from './indexeddb.service';
import {
  Radio,
  Pulse,
  RadioSyncLog,
  RadioStatus,
  PulseStatus,
  ConnectorType,
  SyncLogStatus,
  generateRadioId,
  generatePulseId,
  generateSyncLogId,
  generateWebhookUrl,
  generateWebhookToken,
  generateWebhookSecret,
  getDefaultRadioStats,
  WebhookConfig
} from '../models/integraciones.models';

@Injectable({
  providedIn: 'root'
})
export class IntegracionesService {
  private db = inject(IndexedDBService);

  // Signals for reactive state
  radios = signal<Radio[]>([]);
  selectedRadio = signal<Radio | null>(null);
  pulses = signal<Pulse[]>([]);
  syncLogs = signal<RadioSyncLog[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed properties
  activeRadios = computed(() => this.radios().filter(r => r.status === RadioStatus.ACTIVE));
  radiosWithError = computed(() => this.radios().filter(r => r.status === RadioStatus.ERROR));

  // Count computed properties for template usage
  activeRadiosCount = computed(() => this.activeRadios().length);
  errorRadiosCount = computed(() => this.radiosWithError().length);

  totalPulsesLast24h = computed(() => {
    return this.radios().reduce((sum, r) => sum + r.stats.pulsesLast24h, 0);
  });

  pulsesLast24hCount = computed(() => this.totalPulsesLast24h());

  radioStats = computed(() => ({
    total: this.radios().length,
    active: this.activeRadios().length,
    inactive: this.radios().filter(r => r.status === RadioStatus.INACTIVE).length,
    error: this.radiosWithError().length,
    configuring: this.radios().filter(r => r.status === RadioStatus.CONFIGURING).length
  }));

  // ==================== RADIOS CRUD ====================

  async loadRadios(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const radios = await this.db.getAll<Radio>('radios');
      this.radios.set(radios.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (err) {
      console.error('Error loading radios:', err);
      this.error.set('Error al cargar los radios');
    } finally {
      this.loading.set(false);
    }
  }

  async getRadioById(id: string): Promise<Radio | undefined> {
    try {
      return await this.db.get<Radio>('radios', id);
    } catch (err) {
      console.error('Error getting radio:', err);
      return undefined;
    }
  }

  async createRadio(data: Partial<Radio>): Promise<Radio> {
    const now = new Date().toISOString();
    const id = generateRadioId();

    // Generate webhook config if it's a webhook type
    let connectorConfig = data.connectorConfig;
    if (data.connectorType === ConnectorType.WEBHOOK && connectorConfig?.type === 'WEBHOOK') {
      const webhookConfig = connectorConfig as WebhookConfig;
      connectorConfig = {
        ...webhookConfig,
        webhookUrl: generateWebhookUrl(id),
        webhookToken: webhookConfig.webhookToken || generateWebhookToken(),
        webhookSecret: webhookConfig.webhookSecret || generateWebhookSecret()
      };
    }

    const radio: Radio = {
      id,
      name: data.name || 'Nuevo Radio',
      description: data.description,
      connectorType: data.connectorType || ConnectorType.WEBHOOK,
      category: data.category || 'otro',
      targetEntityType: data.targetEntityType!,
      responsibleUserId: data.responsibleUserId || 'usr-admin',
      responsibleUserName: data.responsibleUserName,
      status: RadioStatus.CONFIGURING,
      connectorConfig: connectorConfig!,
      mappingConfig: data.mappingConfig!,
      schedule: data.schedule,
      stats: getDefaultRadioStats(),
      createdAt: now,
      createdBy: data.createdBy || 'usr-admin',
      updatedAt: now
    };

    await this.db.add('radios', radio);
    await this.loadRadios();
    return radio;
  }

  async updateRadio(id: string, data: Partial<Radio>): Promise<Radio | null> {
    const existing = await this.getRadioById(id);
    if (!existing) return null;

    const updated: Radio = {
      ...existing,
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    await this.db.put('radios', updated);
    await this.loadRadios();

    if (this.selectedRadio()?.id === id) {
      this.selectedRadio.set(updated);
    }

    return updated;
  }

  async deleteRadio(id: string): Promise<boolean> {
    try {
      // Delete associated pulses
      const pulses = await this.db.getByIndex<Pulse>('pulses', 'radioId', id);
      for (const pulse of pulses) {
        await this.db.delete('pulses', pulse.id);
      }

      // Delete associated sync logs
      const logs = await this.db.getByIndex<RadioSyncLog>('radio_sync_logs', 'radioId', id);
      for (const log of logs) {
        await this.db.delete('radio_sync_logs', log.id);
      }

      // Delete the radio
      await this.db.delete('radios', id);
      await this.loadRadios();

      if (this.selectedRadio()?.id === id) {
        this.selectedRadio.set(null);
      }

      return true;
    } catch (err) {
      console.error('Error deleting radio:', err);
      return false;
    }
  }

  async toggleRadioStatus(id: string): Promise<Radio | null> {
    const radio = await this.getRadioById(id);
    if (!radio) return null;

    const newStatus = radio.status === RadioStatus.ACTIVE
      ? RadioStatus.INACTIVE
      : RadioStatus.ACTIVE;

    return this.updateRadio(id, { status: newStatus });
  }

  async activateRadio(id: string): Promise<Radio | null> {
    return this.updateRadio(id, { status: RadioStatus.ACTIVE });
  }

  async deactivateRadio(id: string): Promise<Radio | null> {
    return this.updateRadio(id, { status: RadioStatus.INACTIVE });
  }

  // ==================== PULSES CRUD ====================

  async loadPulsesByRadio(radioId: string): Promise<void> {
    this.loading.set(true);
    try {
      const pulses = await this.db.getByIndex<Pulse>('pulses', 'radioId', radioId);
      this.pulses.set(pulses.sort((a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      ));
    } catch (err) {
      console.error('Error loading pulses:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async getPulseById(id: string): Promise<Pulse | undefined> {
    return this.db.get<Pulse>('pulses', id);
  }

  async createPulse(radioId: string, rawData: Record<string, any>): Promise<Pulse> {
    const radio = await this.getRadioById(radioId);

    const pulse: Pulse = {
      id: generatePulseId(),
      radioId,
      radioName: radio?.name,
      status: PulseStatus.RECEIVED,
      rawData,
      receivedAt: new Date().toISOString()
    };

    await this.db.add('pulses', pulse);

    // Update radio stats
    if (radio) {
      await this.updateRadioStats(radioId);
    }

    return pulse;
  }

  async updatePulseStatus(id: string, status: PulseStatus, data?: Partial<Pulse>): Promise<Pulse | null> {
    const pulse = await this.getPulseById(id);
    if (!pulse) return null;

    const updated: Pulse = {
      ...pulse,
      ...data,
      status,
      processedAt: status !== PulseStatus.RECEIVED ? new Date().toISOString() : pulse.processedAt,
      integratedAt: status === PulseStatus.INTEGRATED ? new Date().toISOString() : pulse.integratedAt
    };

    await this.db.put('pulses', updated);
    return updated;
  }

  async reprocessPulses(pulseIds: string[]): Promise<number> {
    let processed = 0;
    for (const id of pulseIds) {
      const pulse = await this.getPulseById(id);
      if (pulse && (pulse.status === PulseStatus.ERROR || pulse.status === PulseStatus.REJECTED)) {
        await this.updatePulseStatus(id, PulseStatus.RECEIVED);
        // In a real implementation, this would trigger actual reprocessing
        await this.simulateProcessPulse(id);
        processed++;
      }
    }
    return processed;
  }

  private async simulateProcessPulse(pulseId: string): Promise<void> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const pulse = await this.getPulseById(pulseId);
    if (!pulse) return;

    // Simulate transformation
    const transformedData = { ...pulse.rawData, _processed: true, _processedAt: new Date().toISOString() };

    // Randomly succeed or fail for demo purposes
    const success = Math.random() > 0.2;

    if (success) {
      await this.updatePulseStatus(pulseId, PulseStatus.INTEGRATED, {
        transformedData,
        integrationAction: 'created',
        integratedEntityType: pulse.integratedEntityType
      });
    } else {
      await this.updatePulseStatus(pulseId, PulseStatus.ERROR, {
        errors: [{ field: 'simulation', message: 'Error simulado para demo', value: null }]
      });
    }
  }

  // ==================== SYNC LOGS ====================

  async loadSyncLogsByRadio(radioId: string): Promise<void> {
    try {
      const logs = await this.db.getByIndex<RadioSyncLog>('radio_sync_logs', 'radioId', radioId);
      this.syncLogs.set(logs.sort((a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ));
    } catch (err) {
      console.error('Error loading sync logs:', err);
    }
  }

  async createSyncLog(radioId: string): Promise<RadioSyncLog> {
    const radio = await this.getRadioById(radioId);

    const log: RadioSyncLog = {
      id: generateSyncLogId(),
      radioId,
      radioName: radio?.name,
      startedAt: new Date().toISOString(),
      status: SyncLogStatus.RUNNING,
      pulsesCreated: 0,
      pulsesIntegrated: 0,
      pulsesRejected: 0,
      pulsesError: 0
    };

    await this.db.add('radio_sync_logs', log);
    return log;
  }

  async completeSyncLog(
    logId: string,
    status: SyncLogStatus,
    results: Partial<RadioSyncLog>
  ): Promise<RadioSyncLog | null> {
    const log = await this.db.get<RadioSyncLog>('radio_sync_logs', logId);
    if (!log) return null;

    const completedAt = new Date().toISOString();
    const duration = new Date(completedAt).getTime() - new Date(log.startedAt).getTime();

    const updated: RadioSyncLog = {
      ...log,
      ...results,
      status,
      completedAt,
      duration
    };

    await this.db.put('radio_sync_logs', updated);
    return updated;
  }

  // ==================== SYNC SIMULATION ====================

  async triggerManualSync(radioId: string): Promise<RadioSyncLog | null> {
    const radio = await this.getRadioById(radioId);
    if (!radio || radio.status !== RadioStatus.ACTIVE) {
      return null;
    }

    // Create sync log
    const syncLog = await this.createSyncLog(radioId);

    // Simulate sync process
    try {
      // Simulate fetching data (1-5 pulses)
      const pulseCount = Math.floor(Math.random() * 5) + 1;
      let created = 0, integrated = 0, rejected = 0, errors = 0;

      for (let i = 0; i < pulseCount; i++) {
        // Create mock pulse
        const pulse = await this.createPulse(radioId, {
          id: `data-${Date.now()}-${i}`,
          source: radio.name,
          timestamp: new Date().toISOString(),
          data: { field1: `value${i}`, field2: Math.random() * 100 }
        });
        created++;

        // Simulate processing
        await this.simulateProcessPulse(pulse.id);
        const processedPulse = await this.getPulseById(pulse.id);

        if (processedPulse?.status === PulseStatus.INTEGRATED) {
          integrated++;
        } else if (processedPulse?.status === PulseStatus.REJECTED) {
          rejected++;
        } else if (processedPulse?.status === PulseStatus.ERROR) {
          errors++;
        }
      }

      // Complete sync log
      const status = errors > 0 ? SyncLogStatus.PARTIAL : SyncLogStatus.SUCCESS;
      await this.completeSyncLog(syncLog.id, status, {
        pulsesCreated: created,
        pulsesIntegrated: integrated,
        pulsesRejected: rejected,
        pulsesError: errors
      });

      // Update radio stats
      await this.updateRadioStats(radioId);
      await this.loadRadios();
      await this.loadSyncLogsByRadio(radioId);

      return await this.db.get<RadioSyncLog>('radio_sync_logs', syncLog.id) || null;

    } catch (err) {
      console.error('Sync error:', err);
      await this.completeSyncLog(syncLog.id, SyncLogStatus.FAILED, {
        errorMessage: err instanceof Error ? err.message : 'Error desconocido'
      });

      // Mark radio as error
      await this.updateRadio(radioId, { status: RadioStatus.ERROR });

      return null;
    }
  }

  // ==================== STATS ====================

  private async updateRadioStats(radioId: string): Promise<void> {
    const radio = await this.getRadioById(radioId);
    if (!radio) return;

    const allPulses = await this.db.getByIndex<Pulse>('pulses', 'radioId', radioId);
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const pulsesLast24h = allPulses.filter(p => new Date(p.receivedAt) >= last24h).length;
    const errorCount = allPulses.filter(p => p.status === PulseStatus.ERROR).length;

    const lastSync = allPulses.length > 0
      ? allPulses.reduce((latest, p) =>
          new Date(p.receivedAt) > new Date(latest) ? p.receivedAt : latest,
          allPulses[0].receivedAt
        )
      : undefined;

    const lastSuccess = allPulses.filter(p => p.status === PulseStatus.INTEGRATED).length > 0
      ? allPulses
          .filter(p => p.status === PulseStatus.INTEGRATED)
          .reduce((latest, p) =>
            new Date(p.integratedAt || '') > new Date(latest) ? (p.integratedAt || latest) : latest,
            ''
          )
      : undefined;

    const lastError = allPulses.filter(p => p.status === PulseStatus.ERROR).length > 0
      ? allPulses
          .filter(p => p.status === PulseStatus.ERROR)
          .reduce((latest, p) =>
            new Date(p.processedAt || '') > new Date(latest) ? (p.processedAt || latest) : latest,
            ''
          )
      : undefined;

    await this.updateRadio(radioId, {
      stats: {
        totalPulses: allPulses.length,
        pulsesLast24h,
        lastSyncAt: lastSync,
        lastSuccessAt: lastSuccess || undefined,
        lastErrorAt: lastError || undefined,
        errorCount
      }
    });
  }

  // ==================== FILTERS ====================

  filterRadios(params: {
    connectorType?: ConnectorType;
    status?: RadioStatus;
    category?: string;
    search?: string;
  }): Radio[] {
    let filtered = this.radios();

    if (params.connectorType) {
      filtered = filtered.filter(r => r.connectorType === params.connectorType);
    }

    if (params.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }

    if (params.category) {
      filtered = filtered.filter(r => r.category === params.category);
    }

    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(search) ||
        r.description?.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  filterPulses(params: {
    status?: PulseStatus;
    from?: Date;
    to?: Date;
    hasErrors?: boolean;
  }): Pulse[] {
    let filtered = this.pulses();

    if (params.status) {
      filtered = filtered.filter(p => p.status === params.status);
    }

    if (params.from) {
      filtered = filtered.filter(p => new Date(p.receivedAt) >= params.from!);
    }

    if (params.to) {
      filtered = filtered.filter(p => new Date(p.receivedAt) <= params.to!);
    }

    if (params.hasErrors !== undefined) {
      filtered = filtered.filter(p =>
        params.hasErrors
          ? (p.errors && p.errors.length > 0)
          : (!p.errors || p.errors.length === 0)
      );
    }

    return filtered;
  }

  // ==================== HEALTH CHECK ====================

  getRadioHealth(radio: Radio): 'healthy' | 'warning' | 'critical' {
    if (radio.status === RadioStatus.ERROR) return 'critical';
    if (radio.status === RadioStatus.INACTIVE) return 'warning';
    if (radio.status === RadioStatus.CONFIGURING) return 'warning';

    // Check error rate
    if (radio.stats.totalPulses > 0) {
      const errorRate = radio.stats.errorCount / radio.stats.totalPulses;
      if (errorRate > 0.2) return 'critical';
      if (errorRate > 0.1) return 'warning';
    }

    // Check last sync (for pull connectors)
    if (radio.schedule && radio.stats.lastSyncAt) {
      const lastSync = new Date(radio.stats.lastSyncAt);
      const now = new Date();
      const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSync > 48) return 'critical';
      if (hoursSinceLastSync > 24) return 'warning';
    }

    return 'healthy';
  }

  getHealthColor(health: 'healthy' | 'warning' | 'critical'): string {
    switch (health) {
      case 'healthy': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
    }
  }

  getHealthSeverity(health: 'healthy' | 'warning' | 'critical'): 'success' | 'warn' | 'danger' {
    switch (health) {
      case 'healthy': return 'success';
      case 'warning': return 'warn';
      case 'critical': return 'danger';
    }
  }

  // ==================== CONNECTION TEST & SAMPLE DATA ====================

  /**
   * Tests the connection and retrieves sample data to detect available fields
   */
  async testConnectionAndGetSampleData(radioId: string): Promise<{
    success: boolean;
    sampleData: Record<string, any>[] | null;
    detectedFields: string[];
    error?: string;
  }> {
    const radio = await this.getRadioById(radioId);
    if (!radio) {
      return { success: false, sampleData: null, detectedFields: [], error: 'Radio no encontrado' };
    }

    // Simulate connection test based on connector type
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

    // For demo purposes, generate sample data based on connector type
    const sampleData = this.generateSampleDataForConnector(radio);
    const detectedFields = this.extractFieldsFromData(sampleData);

    return {
      success: true,
      sampleData,
      detectedFields
    };
  }

  private generateSampleDataForConnector(radio: Radio): Record<string, any>[] {
    // Generate mock sample data based on category/type
    switch (radio.category) {
      case 'seguridad':
        return [
          { id: 'vuln-001', severity: 'high', asset_name: 'web-server-01', cve_id: 'CVE-2024-1234', description: 'SQL Injection vulnerability', discovered_at: '2024-01-15T10:30:00Z', status: 'open' },
          { id: 'vuln-002', severity: 'critical', asset_name: 'db-server-02', cve_id: 'CVE-2024-5678', description: 'Remote code execution', discovered_at: '2024-01-15T11:00:00Z', status: 'open' },
          { id: 'vuln-003', severity: 'medium', asset_name: 'app-server-03', cve_id: 'CVE-2024-9012', description: 'Cross-site scripting (XSS)', discovered_at: '2024-01-15T11:30:00Z', status: 'remediated' }
        ];
      case 'activos':
        return [
          { ci_id: 'CI0001', name: 'Production Web Server', type: 'Server', ip_address: '192.168.1.100', owner: 'IT Ops', environment: 'Production', last_updated: '2024-01-14T08:00:00Z' },
          { ci_id: 'CI0002', name: 'Database Cluster', type: 'Database', ip_address: '192.168.1.101', owner: 'DBA Team', environment: 'Production', last_updated: '2024-01-14T09:00:00Z' }
        ];
      case 'proveedores':
        return [
          { vendor_id: 'V001', company_name: 'Acme Corp', contact_email: 'vendor@acme.com', risk_level: 'low', contract_end: '2025-12-31', category: 'Software' },
          { vendor_id: 'V002', company_name: 'TechParts Inc', contact_email: 'sales@techparts.com', risk_level: 'medium', contract_end: '2024-06-30', category: 'Hardware' }
        ];
      case 'auditoría':
        return [
          { finding_id: 'F001', audit_name: 'Q1 Security Audit', finding_type: 'Non-compliance', severity: 'high', department: 'Finance', due_date: '2024-02-28', assignee: 'John Doe' },
          { finding_id: 'F002', audit_name: 'Q1 Security Audit', finding_type: 'Gap', severity: 'low', department: 'IT', due_date: '2024-03-15', assignee: 'Jane Smith' }
        ];
      default:
        return [
          { id: 'REC001', name: 'Sample Record 1', value: 100, status: 'active', created_at: '2024-01-15T10:00:00Z' },
          { id: 'REC002', name: 'Sample Record 2', value: 200, status: 'pending', created_at: '2024-01-15T11:00:00Z' }
        ];
    }
  }

  private extractFieldsFromData(data: Record<string, any>[]): string[] {
    if (!data || data.length === 0) return [];

    const fields = new Set<string>();
    for (const record of data) {
      this.extractFieldsRecursive(record, '', fields);
    }

    return Array.from(fields).sort();
  }

  private extractFieldsRecursive(obj: any, prefix: string, fields: Set<string>): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        const fieldPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          this.extractFieldsRecursive(value, fieldPath, fields);
        } else {
          fields.add(fieldPath);
        }
      }
    }
  }

  /**
   * Gets available target fields based on entity type
   */
  getTargetFieldsForEntityType(entityType: string): { field: string; label: string; required: boolean }[] {
    switch (entityType) {
      case 'asset':
        return [
          { field: 'name', label: 'Nombre del Activo', required: true },
          { field: 'type', label: 'Tipo de Activo', required: true },
          { field: 'description', label: 'Descripción', required: false },
          { field: 'ipAddress', label: 'Dirección IP', required: false },
          { field: 'owner', label: 'Propietario', required: false },
          { field: 'department', label: 'Departamento', required: false },
          { field: 'location', label: 'Ubicación', required: false },
          { field: 'criticality', label: 'Criticidad', required: false },
          { field: 'status', label: 'Estado', required: false }
        ];
      case 'risk':
        return [
          { field: 'name', label: 'Nombre del Riesgo', required: true },
          { field: 'description', label: 'Descripción', required: true },
          { field: 'category', label: 'Categoría', required: false },
          { field: 'probability', label: 'Probabilidad', required: false },
          { field: 'impact', label: 'Impacto', required: false },
          { field: 'owner', label: 'Responsable', required: false },
          { field: 'status', label: 'Estado', required: false }
        ];
      case 'incident':
        return [
          { field: 'title', label: 'Título', required: true },
          { field: 'description', label: 'Descripción', required: true },
          { field: 'severity', label: 'Severidad', required: true },
          { field: 'source', label: 'Fuente', required: false },
          { field: 'affectedAsset', label: 'Activo Afectado', required: false },
          { field: 'detectedAt', label: 'Fecha de Detección', required: false },
          { field: 'status', label: 'Estado', required: false }
        ];
      case 'finding':
        return [
          { field: 'title', label: 'Título del Hallazgo', required: true },
          { field: 'description', label: 'Descripción', required: true },
          { field: 'type', label: 'Tipo', required: false },
          { field: 'severity', label: 'Severidad', required: false },
          { field: 'recommendation', label: 'Recomendación', required: false },
          { field: 'dueDate', label: 'Fecha Límite', required: false },
          { field: 'assignee', label: 'Responsable', required: false }
        ];
      case 'supplier':
        return [
          { field: 'name', label: 'Nombre del Proveedor', required: true },
          { field: 'contactEmail', label: 'Email de Contacto', required: false },
          { field: 'riskLevel', label: 'Nivel de Riesgo', required: false },
          { field: 'category', label: 'Categoría', required: false },
          { field: 'contractEndDate', label: 'Fin de Contrato', required: false },
          { field: 'status', label: 'Estado', required: false }
        ];
      default:
        return [
          { field: 'name', label: 'Nombre', required: true },
          { field: 'description', label: 'Descripción', required: false },
          { field: 'status', label: 'Estado', required: false }
        ];
    }
  }

  /**
   * Saves field mappings for a radio
   */
  async saveFieldMappings(radioId: string, mappings: import('../models/integraciones.models').FieldMapping[]): Promise<Radio | null> {
    const radio = await this.getRadioById(radioId);
    if (!radio) return null;

    const updatedMappingConfig = {
      ...radio.mappingConfig,
      fieldMappings: mappings
    };

    return this.updateRadio(radioId, { mappingConfig: updatedMappingConfig });
  }

  // ==================== SEED DATA ====================

  async seedData(): Promise<void> {
    // Check if data already exists
    const existingRadios = await this.db.getAll<Radio>('radios');
    if (existingRadios.length > 0) {
      console.log('Seed data already exists');
      return;
    }

    console.log('Seeding integraciones data...');

    // Create sample radios
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Radio 1: Webhook - Active, healthy
    const radio1 = await this.createRadio({
      name: 'Nessus Vulnerability Scanner',
      description: 'Recibe alertas de vulnerabilidades desde Tenable Nessus',
      category: 'seguridad',
      targetEntityType: 'asset' as any,
      connectorType: ConnectorType.WEBHOOK,
      connectorConfig: {
        type: 'WEBHOOK',
        webhookUrl: '',
        webhookToken: '',
        webhookSecret: '',
        enableSignatureValidation: true
      }
    });
    await this.updateRadio(radio1.id, {
      status: RadioStatus.ACTIVE,
      stats: {
        totalPulses: 156,
        pulsesLast24h: 12,
        lastSyncAt: twoHoursAgo.toISOString(),
        lastSuccessAt: twoHoursAgo.toISOString(),
        errorCount: 2
      }
    });

    // Radio 2: REST API - Active, with some errors
    const radio2 = await this.createRadio({
      name: 'ServiceNow CMDB',
      description: 'Sincroniza activos desde ServiceNow CMDB',
      category: 'activos',
      targetEntityType: 'asset' as any,
      connectorType: ConnectorType.REST_API,
      connectorConfig: {
        type: 'REST_API',
        baseUrl: 'https://acme.service-now.com',
        endpoint: '/api/now/table/cmdb_ci',
        method: 'GET',
        authType: 'api_key' as any,
        authConfig: {
          headerName: 'X-API-Key',
          apiKey: 'sk-demo-12345'
        },
        timeout: 30000,
        headers: {}
      },
      schedule: {
        frequency: 'hours' as any,
        interval: 4,
        timezone: 'America/Mexico_City'
      }
    });
    await this.updateRadio(radio2.id, {
      status: RadioStatus.ACTIVE,
      stats: {
        totalPulses: 2340,
        pulsesLast24h: 89,
        lastSyncAt: yesterday.toISOString(),
        lastSuccessAt: yesterday.toISOString(),
        lastErrorAt: lastWeek.toISOString(),
        errorCount: 15
      }
    });

    // Radio 3: Database - Active
    const radio3 = await this.createRadio({
      name: 'Oracle ERP Database',
      description: 'Consulta datos de proveedores desde Oracle ERP',
      category: 'proveedores',
      targetEntityType: 'supplier' as any,
      connectorType: ConnectorType.DATABASE,
      connectorConfig: {
        type: 'DATABASE',
        dbType: 'oracle' as any,
        host: 'oracle-erp.internal.acme.com',
        port: 1521,
        database: 'ERPDB',
        username: 'orca_reader',
        password: '********',
        ssl: true,
        query: 'SELECT * FROM vendors WHERE last_updated > :lastSync',
        syncMode: 'incremental',
        incrementalField: 'last_updated',
        identifierField: 'vendor_id'
      },
      schedule: {
        frequency: 'daily' as any,
        time: '02:00',
        timezone: 'America/Mexico_City'
      }
    });
    await this.updateRadio(radio3.id, {
      status: RadioStatus.ACTIVE,
      stats: {
        totalPulses: 450,
        pulsesLast24h: 45,
        lastSyncAt: yesterday.toISOString(),
        lastSuccessAt: yesterday.toISOString(),
        errorCount: 0
      }
    });

    // Radio 4: Folder - Inactive
    const radio4 = await this.createRadio({
      name: 'Reportes de Auditoría',
      description: 'Procesa reportes CSV de auditoría depositados en carpeta compartida',
      category: 'auditoría',
      targetEntityType: 'finding' as any,
      connectorType: ConnectorType.FOLDER,
      connectorConfig: {
        type: 'FOLDER',
        locationType: 'smb' as any,
        path: '\\\\fileserver\\audit\\reports',
        filePattern: '*.csv',
        includeSubdirs: true,
        credentials: {},
        postProcessAction: 'move' as any,
        processedFolder: '/processed'
      },
      schedule: {
        frequency: 'hours' as any,
        interval: 1,
        timezone: 'America/Mexico_City'
      }
    });
    await this.updateRadio(radio4.id, {
      status: RadioStatus.INACTIVE,
      stats: {
        totalPulses: 78,
        pulsesLast24h: 0,
        lastSyncAt: lastWeek.toISOString(),
        lastSuccessAt: lastWeek.toISOString(),
        errorCount: 3
      }
    });

    // Radio 5: REST API - Error state
    const radio5 = await this.createRadio({
      name: 'Crowdstrike EDR',
      description: 'Recibe detecciones de endpoint desde Crowdstrike',
      category: 'seguridad',
      targetEntityType: 'incident' as any,
      connectorType: ConnectorType.REST_API,
      connectorConfig: {
        type: 'REST_API',
        baseUrl: 'https://api.crowdstrike.com',
        endpoint: '/detects/queries/detects/v1',
        method: 'GET',
        authType: 'bearer' as any,
        authConfig: {
          bearerToken: 'expired-token-xxxxx'
        },
        timeout: 60000,
        headers: {}
      },
      schedule: {
        frequency: 'minutes' as any,
        interval: 15,
        timezone: 'America/Mexico_City'
      }
    });
    await this.updateRadio(radio5.id, {
      status: RadioStatus.ERROR,
      stats: {
        totalPulses: 1250,
        pulsesLast24h: 0,
        lastSyncAt: lastWeek.toISOString(),
        lastSuccessAt: lastWeek.toISOString(),
        lastErrorAt: yesterday.toISOString(),
        errorCount: 47
      }
    });

    // Create sample pulses for first radio
    for (let i = 0; i < 5; i++) {
      const pulseTime = new Date(now.getTime() - i * 60 * 60 * 1000);
      const pulse = await this.createPulse(radio1.id, {
        id: `vuln-${Date.now()}-${i}`,
        severity: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
        asset: `server-${Math.floor(Math.random() * 100)}`,
        vulnerability: `CVE-2024-${1000 + i}`,
        description: 'Sample vulnerability finding'
      });

      // Update pulse status
      const statuses = [PulseStatus.INTEGRATED, PulseStatus.INTEGRATED, PulseStatus.INTEGRATED, PulseStatus.ERROR, PulseStatus.REJECTED];
      const status = statuses[i % statuses.length];
      await this.updatePulseStatus(pulse.id, status, {
        processedAt: pulseTime.toISOString(),
        transformedData: status === PulseStatus.INTEGRATED ? { processed: true } : undefined,
        errors: status === PulseStatus.ERROR ? [{ field: 'asset', message: 'Asset not found', value: 'server-unknown' }] : undefined,
        integratedAt: status === PulseStatus.INTEGRATED ? pulseTime.toISOString() : undefined
      });
    }

    // Create sample sync logs for radio2
    for (let i = 0; i < 3; i++) {
      const logTime = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
      const log: RadioSyncLog = {
        id: generateSyncLogId(),
        radioId: radio2.id,
        radioName: radio2.name,
        startedAt: logTime.toISOString(),
        completedAt: new Date(logTime.getTime() + 5000).toISOString(),
        duration: 5000,
        status: i === 0 ? SyncLogStatus.SUCCESS : (i === 1 ? SyncLogStatus.PARTIAL : SyncLogStatus.SUCCESS),
        pulsesCreated: 15 + Math.floor(Math.random() * 10),
        pulsesIntegrated: 12 + Math.floor(Math.random() * 5),
        pulsesRejected: Math.floor(Math.random() * 3),
        pulsesError: i === 1 ? 2 : 0
      };
      await this.db.add('radio_sync_logs', log);
    }

    console.log('Seed data created successfully');
    await this.loadRadios();
  }
}
