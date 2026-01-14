// ============================================================================
// WIDGET PERSISTENCE SERVICE
// ============================================================================
// Servicio de persistencia backend-ready para configuraciones de dashboard
// Permite cambiar entre localStorage (actual) y API (futuro) fácilmente
// ============================================================================

import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, firstValueFrom } from 'rxjs';
import { DashboardConfig, DashboardState } from '../models/dashboard.models';

// ==================== INTERFACES ====================

/**
 * Interfaz abstracta para proveedores de persistencia
 * Implementar esta interfaz para diferentes backends
 */
export interface IWidgetPersistenceProvider {
  /**
   * Guardar configuración de dashboard
   * @param userId ID del usuario (para persistencia por perfil)
   * @param dashboardId ID del dashboard
   * @param config Configuración completa del dashboard
   */
  save(userId: string, dashboardId: string, config: DashboardConfig): Promise<void>;

  /**
   * Cargar configuración de dashboard
   * @param userId ID del usuario
   * @param dashboardId ID del dashboard
   * @returns Configuración o null si no existe
   */
  load(userId: string, dashboardId: string): Promise<DashboardConfig | null>;

  /**
   * Cargar todas las configuraciones de un usuario
   * @param userId ID del usuario
   * @returns Lista de configuraciones
   */
  loadAll(userId: string): Promise<DashboardConfig[]>;

  /**
   * Eliminar configuración de dashboard
   * @param userId ID del usuario
   * @param dashboardId ID del dashboard
   */
  delete(userId: string, dashboardId: string): Promise<void>;

  /**
   * Guardar estado del dashboard (última config usada, etc)
   * @param userId ID del usuario
   * @param state Estado a guardar
   */
  saveState(userId: string, state: Partial<DashboardState>): Promise<void>;

  /**
   * Cargar estado del dashboard
   * @param userId ID del usuario
   * @returns Estado o null
   */
  loadState(userId: string): Promise<Partial<DashboardState> | null>;
}

// Token de inyección para el proveedor
export const PERSISTENCE_PROVIDER = new InjectionToken<IWidgetPersistenceProvider>('PersistenceProvider');

// ==================== IMPLEMENTACIÓN LOCAL STORAGE ====================

const STORAGE_KEY_PREFIX = 'orca_dashboard';
const STORAGE_CONFIGS_KEY = `${STORAGE_KEY_PREFIX}_configs`;
const STORAGE_STATE_KEY = `${STORAGE_KEY_PREFIX}_state`;

/**
 * Implementación de persistencia usando localStorage
 * Esta es la implementación actual que funciona sin backend
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStoragePersistenceProvider implements IWidgetPersistenceProvider {

  async save(userId: string, dashboardId: string, config: DashboardConfig): Promise<void> {
    try {
      const key = this.getConfigsKey(userId);
      const configs = await this.loadAll(userId);

      // Buscar y actualizar o agregar
      const index = configs.findIndex(c => c.id === dashboardId);
      const updatedConfig = { ...config, updatedAt: new Date() };

      if (index >= 0) {
        configs[index] = updatedConfig;
      } else {
        configs.push(updatedConfig);
      }

      localStorage.setItem(key, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving dashboard config to localStorage:', error);
      throw error;
    }
  }

  async load(userId: string, dashboardId: string): Promise<DashboardConfig | null> {
    try {
      const configs = await this.loadAll(userId);
      const config = configs.find(c => c.id === dashboardId);

      if (config) {
        return this.restoreDates(config);
      }

      return null;
    } catch (error) {
      console.error('Error loading dashboard config from localStorage:', error);
      return null;
    }
  }

  async loadAll(userId: string): Promise<DashboardConfig[]> {
    try {
      const key = this.getConfigsKey(userId);
      const saved = localStorage.getItem(key);

      if (!saved) {
        return [];
      }

      const configs: DashboardConfig[] = JSON.parse(saved);
      return configs.map(c => this.restoreDates(c));
    } catch (error) {
      console.error('Error loading all dashboard configs from localStorage:', error);
      return [];
    }
  }

  async delete(userId: string, dashboardId: string): Promise<void> {
    try {
      const key = this.getConfigsKey(userId);
      const configs = await this.loadAll(userId);
      const filtered = configs.filter(c => c.id !== dashboardId);
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting dashboard config from localStorage:', error);
      throw error;
    }
  }

  async saveState(userId: string, state: Partial<DashboardState>): Promise<void> {
    try {
      const key = this.getStateKey(userId);
      const existing = await this.loadState(userId) || {};
      const merged = { ...existing, ...state };
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (error) {
      console.error('Error saving dashboard state to localStorage:', error);
      throw error;
    }
  }

  async loadState(userId: string): Promise<Partial<DashboardState> | null> {
    try {
      const key = this.getStateKey(userId);
      const saved = localStorage.getItem(key);

      if (!saved) {
        return null;
      }

      return JSON.parse(saved);
    } catch (error) {
      console.error('Error loading dashboard state from localStorage:', error);
      return null;
    }
  }

  // Helpers privados
  private getConfigsKey(userId: string): string {
    return `${STORAGE_CONFIGS_KEY}_${userId}`;
  }

  private getStateKey(userId: string): string {
    return `${STORAGE_STATE_KEY}_${userId}`;
  }

  private restoreDates(config: DashboardConfig): DashboardConfig {
    return {
      ...config,
      createdAt: new Date(config.createdAt),
      updatedAt: new Date(config.updatedAt),
      widgets: config.widgets.map(w => ({
        ...w,
        createdAt: w.createdAt ? new Date(w.createdAt) : undefined,
        updatedAt: w.updatedAt ? new Date(w.updatedAt) : undefined
      }))
    };
  }
}

// ==================== IMPLEMENTACIÓN API (FUTURA) ====================

/**
 * Implementación de persistencia usando API REST
 * Esta implementación se usará cuando el backend esté listo
 *
 * Endpoints esperados:
 * - GET    /api/dashboards/:userId                    -> Lista de configs
 * - GET    /api/dashboards/:userId/:dashboardId       -> Config específica
 * - POST   /api/dashboards/:userId                    -> Crear config
 * - PUT    /api/dashboards/:userId/:dashboardId       -> Actualizar config
 * - DELETE /api/dashboards/:userId/:dashboardId       -> Eliminar config
 * - GET    /api/dashboards/:userId/state              -> Estado del dashboard
 * - PUT    /api/dashboards/:userId/state              -> Guardar estado
 */
@Injectable({
  providedIn: 'root'
})
export class ApiPersistenceProvider implements IWidgetPersistenceProvider {

  private http = inject(HttpClient);
  private baseUrl = '/api/dashboards'; // Configurar según ambiente

  async save(userId: string, dashboardId: string, config: DashboardConfig): Promise<void> {
    const url = `${this.baseUrl}/${userId}/${dashboardId}`;

    try {
      await firstValueFrom(
        this.http.put(url, config).pipe(
          catchError(error => {
            console.error('API Error saving dashboard:', error);
            throw error;
          })
        )
      );
    } catch (error) {
      // Fallback a localStorage si la API falla
      console.warn('API unavailable, falling back to localStorage');
      const localProvider = new LocalStoragePersistenceProvider();
      await localProvider.save(userId, dashboardId, config);
    }
  }

  async load(userId: string, dashboardId: string): Promise<DashboardConfig | null> {
    const url = `${this.baseUrl}/${userId}/${dashboardId}`;

    try {
      const config = await firstValueFrom(
        this.http.get<DashboardConfig>(url).pipe(
          map(c => this.transformFromApi(c)),
          catchError(() => of(null))
        )
      );
      return config;
    } catch {
      // Fallback a localStorage
      const localProvider = new LocalStoragePersistenceProvider();
      return localProvider.load(userId, dashboardId);
    }
  }

  async loadAll(userId: string): Promise<DashboardConfig[]> {
    const url = `${this.baseUrl}/${userId}`;

    try {
      const configs = await firstValueFrom(
        this.http.get<DashboardConfig[]>(url).pipe(
          map(list => list.map(c => this.transformFromApi(c))),
          catchError(() => of([]))
        )
      );
      return configs;
    } catch {
      // Fallback a localStorage
      const localProvider = new LocalStoragePersistenceProvider();
      return localProvider.loadAll(userId);
    }
  }

  async delete(userId: string, dashboardId: string): Promise<void> {
    const url = `${this.baseUrl}/${userId}/${dashboardId}`;

    try {
      await firstValueFrom(
        this.http.delete(url).pipe(
          catchError(error => {
            console.error('API Error deleting dashboard:', error);
            throw error;
          })
        )
      );
    } catch {
      // Fallback a localStorage
      const localProvider = new LocalStoragePersistenceProvider();
      await localProvider.delete(userId, dashboardId);
    }
  }

  async saveState(userId: string, state: Partial<DashboardState>): Promise<void> {
    const url = `${this.baseUrl}/${userId}/state`;

    try {
      await firstValueFrom(
        this.http.put(url, state).pipe(
          catchError(error => {
            console.error('API Error saving state:', error);
            throw error;
          })
        )
      );
    } catch {
      // Fallback a localStorage
      const localProvider = new LocalStoragePersistenceProvider();
      await localProvider.saveState(userId, state);
    }
  }

  async loadState(userId: string): Promise<Partial<DashboardState> | null> {
    const url = `${this.baseUrl}/${userId}/state`;

    try {
      const state = await firstValueFrom(
        this.http.get<Partial<DashboardState>>(url).pipe(
          catchError(() => of(null))
        )
      );
      return state;
    } catch {
      // Fallback a localStorage
      const localProvider = new LocalStoragePersistenceProvider();
      return localProvider.loadState(userId);
    }
  }

  // Transforma respuesta de API a formato interno
  private transformFromApi(config: DashboardConfig): DashboardConfig {
    return {
      ...config,
      createdAt: new Date(config.createdAt),
      updatedAt: new Date(config.updatedAt),
      widgets: config.widgets.map(w => ({
        ...w,
        createdAt: w.createdAt ? new Date(w.createdAt) : undefined,
        updatedAt: w.updatedAt ? new Date(w.updatedAt) : undefined
      }))
    };
  }
}

// ==================== SERVICIO PRINCIPAL ====================

/**
 * Servicio principal de persistencia
 * Actúa como facade y permite cambiar el proveedor fácilmente
 */
@Injectable({
  providedIn: 'root'
})
export class WidgetPersistenceService {

  // Proveedor actual - cambiar a ApiPersistenceProvider cuando el backend esté listo
  private provider = inject(LocalStoragePersistenceProvider);

  // ID de usuario actual - en producción vendría del servicio de auth
  private currentUserId = 'default-user';

  /**
   * Configurar el ID del usuario actual
   * Llamar esto después del login
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  /**
   * Obtener el ID del usuario actual
   */
  getCurrentUser(): string {
    return this.currentUserId;
  }

  /**
   * Guardar configuración de dashboard
   */
  async saveDashboard(dashboardId: string, config: DashboardConfig): Promise<void> {
    return this.provider.save(this.currentUserId, dashboardId, config);
  }

  /**
   * Cargar configuración de dashboard
   */
  async loadDashboard(dashboardId: string): Promise<DashboardConfig | null> {
    return this.provider.load(this.currentUserId, dashboardId);
  }

  /**
   * Cargar todas las configuraciones del usuario actual
   */
  async loadAllDashboards(): Promise<DashboardConfig[]> {
    return this.provider.loadAll(this.currentUserId);
  }

  /**
   * Eliminar configuración de dashboard
   */
  async deleteDashboard(dashboardId: string): Promise<void> {
    return this.provider.delete(this.currentUserId, dashboardId);
  }

  /**
   * Guardar estado del dashboard
   */
  async saveState(state: Partial<DashboardState>): Promise<void> {
    return this.provider.saveState(this.currentUserId, state);
  }

  /**
   * Cargar estado del dashboard
   */
  async loadState(): Promise<Partial<DashboardState> | null> {
    return this.provider.loadState(this.currentUserId);
  }

  // ==================== MÉTODOS DE CONVENIENCIA ====================

  /**
   * Guardar última configuración usada
   */
  async saveLastUsedConfig(configId: string): Promise<void> {
    await this.saveState({ configActual: { id: configId } as DashboardConfig });
  }

  /**
   * Migrar datos de localStorage antiguo al nuevo formato
   * Útil para usuarios existentes
   */
  async migrateFromLegacyStorage(): Promise<void> {
    const legacyConfigKey = 'orca_dashboard_config';
    const legacyStateKey = 'orca_dashboard_state';

    try {
      // Migrar configuraciones
      const legacyConfigs = localStorage.getItem(legacyConfigKey);
      if (legacyConfigs) {
        const configs: DashboardConfig[] = JSON.parse(legacyConfigs);
        for (const config of configs) {
          await this.saveDashboard(config.id, config);
        }
        // Opcional: eliminar datos legacy después de migrar
        // localStorage.removeItem(legacyConfigKey);
      }

      // Migrar estado
      const legacyState = localStorage.getItem(legacyStateKey);
      if (legacyState) {
        const state = JSON.parse(legacyState);
        if (state.lastConfigId) {
          await this.saveLastUsedConfig(state.lastConfigId);
        }
        // Opcional: eliminar datos legacy después de migrar
        // localStorage.removeItem(legacyStateKey);
      }

      console.log('Migration from legacy storage completed');
    } catch (error) {
      console.error('Error migrating from legacy storage:', error);
    }
  }
}
