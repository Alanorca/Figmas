import { computed, Injectable, signal } from '@angular/core';
import { Tenant } from '../models/tenant.models';

const SEED_TENANTS: Tenant[] = [
  { id: 'tenant-001', name: 'Banco Global MX', code: 'BGM', industry: 'Banca', status: 'active', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'tenant-002', name: 'Seguros del Norte', code: 'SDN', industry: 'Seguros', status: 'active', createdAt: '2024-02-20T14:30:00Z' },
  { id: 'tenant-003', name: 'Fintech Solutions', code: 'FTS', industry: 'Fintech', status: 'active', createdAt: '2024-03-10T09:15:00Z' },
  { id: 'tenant-004', name: 'Casa de Bolsa MX', code: 'CBM', industry: 'Inversiones', status: 'inactive', createdAt: '2024-04-05T16:45:00Z' },
  { id: 'tenant-005', name: 'Banco Emisor - TPRM Embozado', code: 'BET', industry: 'Banca', status: 'active', createdAt: '2025-02-06T10:00:00Z' },
];

const TENANTS_STORAGE_KEY = 'orca-tenants';
const SELECTED_TENANT_KEY = 'orca-selected-tenant';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private _tenants = signal<Tenant[]>([]);
  private _selectedTenant = signal<Tenant | null>(null);

  readonly tenants = this._tenants.asReadonly();
  readonly selectedTenant = this._selectedTenant.asReadonly();
  readonly activeTenants = computed(() => this._tenants().filter(t => t.status === 'active'));

  constructor() {
    this.loadTenants();
    this.loadSelectedTenant();
  }

  private loadTenants(): void {
    try {
      const stored = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (stored) {
        this._tenants.set(JSON.parse(stored));
      } else {
        this._tenants.set(SEED_TENANTS);
        this.persistTenants();
      }
    } catch {
      this._tenants.set(SEED_TENANTS);
      this.persistTenants();
    }
  }

  private loadSelectedTenant(): void {
    try {
      const stored = localStorage.getItem(SELECTED_TENANT_KEY);
      if (stored) {
        const tenant = JSON.parse(stored) as Tenant;
        const exists = this._tenants().find(t => t.id === tenant.id);
        if (exists) {
          this._selectedTenant.set(exists);
        } else if (this._tenants().length > 0) {
          this.selectTenant(this._tenants()[0]);
        }
      } else if (this._tenants().length > 0) {
        this.selectTenant(this._tenants()[0]);
      }
    } catch {
      if (this._tenants().length > 0) {
        this.selectTenant(this._tenants()[0]);
      }
    }
  }

  selectTenant(tenant: Tenant): void {
    this._selectedTenant.set(tenant);
    localStorage.setItem(SELECTED_TENANT_KEY, JSON.stringify(tenant));
  }

  createTenant(data: Omit<Tenant, 'id' | 'createdAt'>): Tenant {
    const tenant: Tenant = {
      ...data,
      id: 'tenant-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this._tenants.update(list => [...list, tenant]);
    this.persistTenants();
    return tenant;
  }

  updateTenant(id: string, data: Partial<Omit<Tenant, 'id' | 'createdAt'>>): void {
    this._tenants.update(list =>
      list.map(t => (t.id === id ? { ...t, ...data } : t)),
    );
    this.persistTenants();
    const selected = this._selectedTenant();
    if (selected?.id === id) {
      const updated = this._tenants().find(t => t.id === id);
      if (updated) {
        this._selectedTenant.set(updated);
        localStorage.setItem(SELECTED_TENANT_KEY, JSON.stringify(updated));
      }
    }
  }

  deleteTenant(id: string): void {
    this._tenants.update(list => list.filter(t => t.id !== id));
    this.persistTenants();
    if (this._selectedTenant()?.id === id) {
      const remaining = this._tenants();
      if (remaining.length > 0) {
        this.selectTenant(remaining[0]);
      } else {
        this._selectedTenant.set(null);
        localStorage.removeItem(SELECTED_TENANT_KEY);
      }
    }
  }

  private persistTenants(): void {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(this._tenants()));
  }
}
