import { Injectable } from '@angular/core';
import { TENANT_SCOPED_STORES } from '../models/tenant.models';

// Utility to generate unique IDs
function generateId(): string {
  return 'c' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

interface DBStore {
  name: string;
  keyPath: string | string[];
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[];
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'OrcaDB';
  private dbVersion = 4; // Bumped for tenant indexes
  private db: IDBDatabase | null = null;

  // Store definitions matching Prisma schema
  private stores: DBStore[] = [
    { name: 'usuarios', keyPath: 'id', indexes: [{ name: 'email', keyPath: 'email', unique: true }] },
    { name: 'roles', keyPath: 'id', indexes: [{ name: 'nombre', keyPath: 'nombre', unique: true }] },
    { name: 'permisos', keyPath: 'id', indexes: [{ name: 'codigo', keyPath: 'codigo', unique: true }] },
    { name: 'modulos', keyPath: 'id', indexes: [{ name: 'nombre', keyPath: 'nombre', unique: true }] },
    { name: 'usuarios_roles', keyPath: ['usuarioId', 'rolId'] },
    { name: 'roles_permisos', keyPath: ['rolId', 'permisoId'] },
    { name: 'usuarios_activos', keyPath: ['usuarioId', 'activoId'] },
    { name: 'logs_auditoria', keyPath: 'id', indexes: [{ name: 'usuarioId', keyPath: 'usuarioId' }] },
    { name: 'activos_acceso', keyPath: 'id', indexes: [{ name: 'padreId', keyPath: 'padreId' }] },
    { name: 'plantillas_activo', keyPath: 'id' },
    { name: 'activos', keyPath: 'id', indexes: [{ name: 'tipo', keyPath: 'tipo' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'riesgos', keyPath: 'id', indexes: [{ name: 'activoId', keyPath: 'activoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'incidentes', keyPath: 'id', indexes: [{ name: 'activoId', keyPath: 'activoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'defectos', keyPath: 'id', indexes: [{ name: 'activoId', keyPath: 'activoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'organigramas', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'nodos_organigrama', keyPath: 'id', indexes: [{ name: 'organigramaId', keyPath: 'organigramaId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'marcos_normativos', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'requisitos_normativos', keyPath: 'id', indexes: [{ name: 'marcoId', keyPath: 'marcoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'cuestionarios', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'secciones', keyPath: 'id', indexes: [{ name: 'cuestionarioId', keyPath: 'cuestionarioId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'preguntas', keyPath: 'id', indexes: [{ name: 'seccionId', keyPath: 'seccionId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'asignaciones_cuestionario', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'evaluados_externos', keyPath: 'id', indexes: [{ name: 'asignacionId', keyPath: 'asignacionId' }] },
    { name: 'respuestas_cuestionario', keyPath: 'id', indexes: [{ name: 'asignacionId', keyPath: 'asignacionId' }] },
    { name: 'respuestas_pregunta', keyPath: 'id' },
    { name: 'evidencias', keyPath: 'id' },
    { name: 'hallazgos', keyPath: 'id' },
    { name: 'mensajes_chat', keyPath: 'id' },
    { name: 'alertas_cumplimiento', keyPath: 'id' },
    { name: 'procesos', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'process_nodes', keyPath: 'id', indexes: [{ name: 'procesoId', keyPath: 'procesoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'process_edges', keyPath: 'id', indexes: [{ name: 'procesoId', keyPath: 'procesoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'objetivos_proceso', keyPath: 'id', indexes: [{ name: 'procesoId', keyPath: 'procesoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'kpis_proceso', keyPath: 'id', indexes: [{ name: 'procesoId', keyPath: 'procesoId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'kpi_historico', keyPath: 'id', indexes: [{ name: 'kpiId', keyPath: 'kpiId' }] },
    { name: 'dashboard_configs', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'dashboard_widgets', keyPath: 'id', indexes: [{ name: 'dashboardId', keyPath: 'dashboardId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'catalogos', keyPath: 'id', indexes: [{ name: 'tipo_codigo', keyPath: ['tipo', 'codigo'], unique: true }] },
    { name: 'notification_rules', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'alert_rules', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'expiration_rules', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'notifications', keyPath: 'id', indexes: [{ name: 'usuarioId', keyPath: 'usuarioId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'user_notification_preferences', keyPath: 'id', indexes: [{ name: 'usuarioId', keyPath: 'usuarioId', unique: true }] },
    { name: 'notification_logs', keyPath: 'id' },
    { name: 'notification_profiles', keyPath: 'id' },
    { name: 'projects', keyPath: 'id', indexes: [{ name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'project_objectives', keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'project_kpis', keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'project_phases', keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'tasks', keyPath: 'id', indexes: [{ name: 'projectId', keyPath: 'projectId' }, { name: 'phaseId', keyPath: 'phaseId' }, { name: 'tenantId', keyPath: 'tenantId' }] },
    { name: 'task_evidences', keyPath: 'id', indexes: [{ name: 'taskId', keyPath: 'taskId' }] },
    { name: 'task_history', keyPath: 'id', indexes: [{ name: 'taskId', keyPath: 'taskId' }] },
    { name: '_meta', keyPath: 'key' }, // For storing metadata like seeded flag
    // Integraciones - Radios y Pulsos
    { name: 'radios', keyPath: 'id', indexes: [
      { name: 'connectorType', keyPath: 'connectorType' },
      { name: 'status', keyPath: 'status' },
      { name: 'category', keyPath: 'category' },
      { name: 'tenantId', keyPath: 'tenantId' }
    ]},
    { name: 'pulses', keyPath: 'id', indexes: [
      { name: 'radioId', keyPath: 'radioId' },
      { name: 'status', keyPath: 'status' },
      { name: 'receivedAt', keyPath: 'receivedAt' },
      { name: 'tenantId', keyPath: 'tenantId' }
    ]},
    { name: 'radio_sync_logs', keyPath: 'id', indexes: [
      { name: 'radioId', keyPath: 'radioId' },
      { name: 'startedAt', keyPath: 'startedAt' },
      { name: 'tenantId', keyPath: 'tenantId' }
    ]},
    // Eventos - Subtipos y Eventos
    { name: 'event_subtypes', keyPath: 'id', indexes: [
      { name: 'eventType', keyPath: 'eventType' },
      { name: 'code', keyPath: 'code', unique: true },
      { name: 'isDefault', keyPath: 'isDefault' }
    ]},
    { name: 'events', keyPath: 'id', indexes: [
      { name: 'eventType', keyPath: 'eventType' },
      { name: 'eventSubTypeId', keyPath: 'eventSubType.id' },
      { name: 'eventStatus', keyPath: 'eventStatus' },
      { name: 'initialSeverity', keyPath: 'initialSeverity' },
      { name: 'createdAt', keyPath: 'createdAt' },
      { name: 'tenantId', keyPath: 'tenantId' }
    ]},
    { name: 'event_comments', keyPath: 'id', indexes: [
      { name: 'eventId', keyPath: 'eventId' }
    ]},
  ];

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);

      request.onsuccess = async () => {
        this.db = request.result;
        // Check if we need to seed
        const seeded = await this.get('_meta', 'seeded_v2');
        if (!seeded) {
          // Clear all stores and reseed with tenant data
          for (const store of this.stores) {
            if (store.name !== '_meta') {
              try { await this.clear(store.name); } catch { /* ignore */ }
            }
          }
          await this.seedDatabase();
          await this.put('_meta', { key: 'seeded_v2', value: true, timestamp: new Date().toISOString() });
        }
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = (event.target as IDBOpenDBRequest).transaction!;
        const oldVersion = event.oldVersion;

        for (const store of this.stores) {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, {
              keyPath: store.keyPath,
            });
            if (store.indexes) {
              for (const index of store.indexes) {
                objectStore.createIndex(index.name, index.keyPath, { unique: index.unique || false });
              }
            }
          } else if (oldVersion < 4) {
            // Migration: add tenantId index to existing tenant-scoped stores
            if (TENANT_SCOPED_STORES.includes(store.name)) {
              const objectStore = tx.objectStore(store.name);
              if (!objectStore.indexNames.contains('tenantId')) {
                objectStore.createIndex('tenantId', 'tenantId', { unique: false });
              }
            }
          }
        }
      };
    });
  }

  // Tenant-aware getAll: returns filtered records for tenant-scoped stores
  async getAllForTenant<T>(storeName: string, tenantId: string): Promise<T[]> {
    if (!TENANT_SCOPED_STORES.includes(storeName)) {
      return this.getAll<T>(storeName);
    }
    return this.getByIndex<T>(storeName, 'tenantId', tenantId);
  }

  // Generic CRUD operations
  async getAll<T>(storeName: string): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: any): Promise<T | undefined> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T>(storeName: string, data: T): Promise<T> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  async add<T>(storeName: string, data: T): Promise<T> {
    await this.init();
    // Only add generated ID if the store uses 'id' as keyPath and data doesn't have one
    const storeConfig = this.stores.find(s => s.name === storeName);
    const needsId = storeConfig?.keyPath === 'id' && !(data as any).id;
    const dataWithId = needsId ? { ...data, id: generateId() } : data;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(dataWithId);
      request.onsuccess = () => resolve(dataWithId as T);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async query<T>(storeName: string, filterFn: (item: T) => boolean): Promise<T[]> {
    const all = await this.getAll<T>(storeName);
    return all.filter(filterFn);
  }

  async count(storeName: string): Promise<number> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Bulk operations
  async bulkPut<T>(storeName: string, items: T[]): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Seed the database with initial data
  private async seedDatabase(): Promise<void> {
    console.log('🌱 Seeding IndexedDB database (v2 with tenantId)...');

    // Import seed data
    const seedData = await import('./seed-data');

    // Seed in order (respecting foreign key relationships)
    await this.bulkPut('permisos', seedData.permisos);
    console.log(`✓ ${seedData.permisos.length} permisos`);

    await this.bulkPut('modulos', seedData.modulos);
    console.log(`✓ ${seedData.modulos.length} módulos`);

    await this.bulkPut('roles', seedData.roles);
    console.log(`✓ ${seedData.roles.length} roles`);

    await this.bulkPut('roles_permisos', seedData.rolesPermisos);
    console.log(`✓ ${seedData.rolesPermisos.length} asignaciones rol-permiso`);

    await this.bulkPut('usuarios', seedData.usuarios);
    console.log(`✓ ${seedData.usuarios.length} usuarios`);

    await this.bulkPut('usuarios_roles', seedData.usuariosRoles);
    console.log(`✓ ${seedData.usuariosRoles.length} asignaciones usuario-rol`);

    await this.bulkPut('catalogos', seedData.catalogos);
    console.log(`✓ ${seedData.catalogos.length} catálogos`);

    await this.bulkPut('plantillas_activo', seedData.plantillasActivo);
    console.log(`✓ ${seedData.plantillasActivo.length} plantillas de activo`);

    await this.bulkPut('activos', seedData.activos);
    console.log(`✓ ${seedData.activos.length} activos`);

    await this.bulkPut('riesgos', seedData.riesgos);
    console.log(`✓ ${seedData.riesgos.length} riesgos`);

    await this.bulkPut('incidentes', seedData.incidentes);
    console.log(`✓ ${seedData.incidentes.length} incidentes`);

    await this.bulkPut('defectos', seedData.defectos);
    console.log(`✓ ${seedData.defectos.length} defectos`);

    await this.bulkPut('organigramas', seedData.organigramas);
    console.log(`✓ ${seedData.organigramas.length} organigramas`);

    await this.bulkPut('nodos_organigrama', seedData.nodosOrganigrama);
    console.log(`✓ ${seedData.nodosOrganigrama.length} nodos de organigrama`);

    await this.bulkPut('marcos_normativos', seedData.marcosNormativos);
    console.log(`✓ ${seedData.marcosNormativos.length} marcos normativos`);

    await this.bulkPut('cuestionarios', seedData.cuestionarios);
    console.log(`✓ ${seedData.cuestionarios.length} cuestionarios`);

    await this.bulkPut('secciones', seedData.secciones);
    console.log(`✓ ${seedData.secciones.length} secciones`);

    await this.bulkPut('preguntas', seedData.preguntas);
    console.log(`✓ ${seedData.preguntas.length} preguntas`);

    await this.bulkPut('asignaciones_cuestionario', seedData.asignaciones);
    console.log(`✓ ${seedData.asignaciones.length} asignaciones`);

    await this.bulkPut('procesos', seedData.procesos);
    console.log(`✓ ${seedData.procesos.length} procesos`);

    await this.bulkPut('process_nodes', seedData.processNodes);
    console.log(`✓ ${seedData.processNodes.length} nodos de proceso`);

    await this.bulkPut('process_edges', seedData.processEdges);
    console.log(`✓ ${seedData.processEdges.length} conexiones de proceso`);

    await this.bulkPut('objetivos_proceso', seedData.objetivosProceso);
    console.log(`✓ ${seedData.objetivosProceso.length} objetivos de proceso`);

    await this.bulkPut('kpis_proceso', seedData.kpisProceso);
    console.log(`✓ ${seedData.kpisProceso.length} KPIs de proceso`);

    await this.bulkPut('dashboard_configs', seedData.dashboardConfigs);
    console.log(`✓ ${seedData.dashboardConfigs.length} configuraciones de dashboard`);

    await this.bulkPut('dashboard_widgets', seedData.dashboardWidgets);
    console.log(`✓ ${seedData.dashboardWidgets.length} widgets de dashboard`);

    await this.bulkPut('notification_rules', seedData.notificationRules);
    console.log(`✓ ${seedData.notificationRules.length} reglas de notificación`);

    await this.bulkPut('alert_rules', seedData.alertRules);
    console.log(`✓ ${seedData.alertRules.length} reglas de alerta`);

    await this.bulkPut('notifications', seedData.notifications);
    console.log(`✓ ${seedData.notifications.length} notificaciones`);

    await this.bulkPut('projects', seedData.projects);
    console.log(`✓ ${seedData.projects.length} proyectos`);

    await this.bulkPut('project_phases', seedData.projectPhases);
    console.log(`✓ ${seedData.projectPhases.length} fases de proyecto`);

    await this.bulkPut('tasks', seedData.tasks);
    console.log(`✓ ${seedData.tasks.length} tareas`);

    console.log('✅ Database seeded successfully (v2 with tenantId)!');
  }

  // Reset database (for development)
  async resetDatabase(): Promise<void> {
    for (const store of this.stores) {
      if (store.name !== '_meta') {
        await this.clear(store.name);
      }
    }
    await this.delete('_meta', 'seeded');
    await this.delete('_meta', 'seeded_v2');
    await this.seedDatabase();
    await this.put('_meta', { key: 'seeded_v2', value: true, timestamp: new Date().toISOString() });
  }
}

// Export a singleton instance
export const db = new IndexedDBService();
