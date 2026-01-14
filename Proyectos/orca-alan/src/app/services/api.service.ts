import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { IndexedDBService } from './indexeddb.service';

const API_URL = 'http://localhost:3000/api';

// Utility to simulate async delay (optional, for more realistic UX)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private db = inject(IndexedDBService);
  private http = inject(HttpClient);

  constructor() {
    // Initialize IndexedDB on service creation
    this.db.init();
  }

  // ============================================================
  // Usuarios
  // ============================================================

  getUsuarios(params?: Record<string, string>): Observable<any[]> {
    return from(this.db.getAll<any>('usuarios')).pipe(
      map(usuarios => {
        let filtered = usuarios;
        if (params) {
          if (params['estado']) {
            filtered = filtered.filter(u => u.estado === params['estado']);
          }
          if (params['departamento']) {
            filtered = filtered.filter(u => u.departamento === params['departamento']);
          }
          if (params['search']) {
            const search = params['search'].toLowerCase();
            filtered = filtered.filter(u =>
              u.nombre.toLowerCase().includes(search) ||
              u.apellido.toLowerCase().includes(search) ||
              u.email.toLowerCase().includes(search)
            );
          }
        }
        return filtered;
      }),
      switchMap(usuarios => this.enrichUsuariosWithRoles(usuarios))
    );
  }

  private async enrichUsuariosWithRoles(usuarios: any[]): Promise<any[]> {
    const usuariosRoles = await this.db.getAll<any>('usuarios_roles');
    const roles = await this.db.getAll<any>('roles');

    return usuarios.map(u => ({
      ...u,
      roles: usuariosRoles
        .filter(ur => ur.usuarioId === u.id)
        .map(ur => roles.find(r => r.id === ur.rolId))
        .filter(Boolean)
    }));
  }

  getUsuarioById(id: string): Observable<any> {
    return from(this.db.get<any>('usuarios', id)).pipe(
      switchMap(async usuario => {
        if (!usuario) return null;
        const usuariosRoles = await this.db.getAll<any>('usuarios_roles');
        const roles = await this.db.getAll<any>('roles');
        return {
          ...usuario,
          roles: usuariosRoles
            .filter(ur => ur.usuarioId === usuario.id)
            .map(ur => roles.find(r => r.id === ur.rolId))
            .filter(Boolean)
        };
      })
    );
  }

  createUsuario(data: any): Observable<any> {
    const usuario = {
      ...data,
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      password: 'hashed',
      cambioPasswordRequerido: true
    };
    return from(this.db.add('usuarios', usuario));
  }

  updateUsuario(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('usuarios', id)).pipe(
      switchMap(usuario => {
        if (!usuario) throw new Error('Usuario no encontrado');
        const updated = { ...usuario, ...data, updatedAt: new Date().toISOString() };
        return from(this.db.put('usuarios', updated));
      })
    );
  }

  deleteUsuario(id: string): Observable<void> {
    return from(this.db.delete('usuarios', id));
  }

  cambiarEstadoUsuario(id: string, estado: string): Observable<any> {
    return this.updateUsuario(id, { estado });
  }

  asignarRolAUsuario(usuarioId: string, rolId: string): Observable<void> {
    return from(this.db.add('usuarios_roles', { usuarioId, rolId })).pipe(map(() => void 0));
  }

  removerRolDeUsuario(usuarioId: string, rolId: string): Observable<void> {
    return from(this.db.delete('usuarios_roles', [usuarioId, rolId]));
  }

  // ============================================================
  // Roles
  // ============================================================

  getRoles(params?: Record<string, string>): Observable<any[]> {
    return from(this.db.getAll<any>('roles')).pipe(
      switchMap(async roles => {
        const rolesPermisos = await this.db.getAll<any>('roles_permisos');
        const permisos = await this.db.getAll<any>('permisos');
        const usuariosRoles = await this.db.getAll<any>('usuarios_roles');
        const usuarios = await this.db.getAll<any>('usuarios');

        return roles.map(rol => ({
          ...rol,
          permisos: rolesPermisos
            .filter(rp => rp.rolId === rol.id)
            .map(rp => permisos.find(p => p.id === rp.permisoId))
            .filter(Boolean),
          usuarios: usuariosRoles
            .filter(ur => ur.rolId === rol.id)
            .map(ur => usuarios.find(u => u.id === ur.usuarioId))
            .filter(Boolean),
          _count: {
            usuarios: usuariosRoles.filter(ur => ur.rolId === rol.id).length,
            permisos: rolesPermisos.filter(rp => rp.rolId === rol.id).length
          }
        }));
      })
    );
  }

  getRolById(id: string): Observable<any> {
    return from(this.db.get<any>('roles', id)).pipe(
      switchMap(async rol => {
        if (!rol) return null;
        const rolesPermisos = await this.db.getAll<any>('roles_permisos');
        const permisos = await this.db.getAll<any>('permisos');
        return {
          ...rol,
          permisos: rolesPermisos
            .filter(rp => rp.rolId === rol.id)
            .map(rp => permisos.find(p => p.id === rp.permisoId))
            .filter(Boolean)
        };
      })
    );
  }

  createRol(data: any): Observable<any> {
    const rol = {
      ...data,
      id: 'rol-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      activo: true,
      esRolSistema: false
    };
    return from(this.db.add('roles', rol));
  }

  updateRol(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('roles', id)).pipe(
      switchMap(async rol => {
        if (!rol) throw new Error('Rol no encontrado');
        if (rol.esRolSistema) throw new Error('No se puede modificar un rol del sistema');
        const updated = { ...rol, ...data, updatedAt: new Date().toISOString() };
        return this.db.put('roles', updated);
      })
    );
  }

  deleteRol(id: string): Observable<void> {
    return from(this.db.get<any>('roles', id)).pipe(
      switchMap(async rol => {
        if (!rol) throw new Error('Rol no encontrado');
        if (rol.esRolSistema) throw new Error('No se puede eliminar un rol del sistema');
        await this.db.delete('roles', id);
      })
    );
  }

  duplicarRol(id: string): Observable<any> {
    return from(this.db.get<any>('roles', id)).pipe(
      switchMap(async rol => {
        if (!rol) throw new Error('Rol no encontrado');
        const newRol = {
          ...rol,
          id: 'rol-' + Math.random().toString(36).substring(2, 9),
          nombre: rol.nombre + ' (copia)',
          esRolSistema: false,
          createdAt: new Date().toISOString()
        };
        await this.db.add('roles', newRol);
        // Copy permissions
        const rolesPermisos = await this.db.getAll<any>('roles_permisos');
        const permisosToCopy = rolesPermisos.filter(rp => rp.rolId === id);
        for (const rp of permisosToCopy) {
          await this.db.add('roles_permisos', { rolId: newRol.id, permisoId: rp.permisoId });
        }
        return newRol;
      })
    );
  }

  getUsuariosDeRol(rolId: string): Observable<any[]> {
    return from(this.db.getAll<any>('usuarios_roles')).pipe(
      switchMap(async usuariosRoles => {
        const usuarios = await this.db.getAll<any>('usuarios');
        return usuariosRoles
          .filter(ur => ur.rolId === rolId)
          .map(ur => usuarios.find(u => u.id === ur.usuarioId))
          .filter(Boolean);
      })
    );
  }

  getPermisosDeRol(rolId: string): Observable<any[]> {
    return from(this.db.getAll<any>('roles_permisos')).pipe(
      switchMap(async rolesPermisos => {
        const permisos = await this.db.getAll<any>('permisos');
        return rolesPermisos
          .filter(rp => rp.rolId === rolId)
          .map(rp => permisos.find(p => p.id === rp.permisoId))
          .filter(Boolean);
      })
    );
  }

  // ============================================================
  // Permisos
  // ============================================================

  getPermisos(): Observable<any[]> {
    return from(this.db.getAll<any>('permisos'));
  }

  getPermisosAgrupados(): Observable<any[]> {
    return from(this.db.getAll<any>('permisos')).pipe(
      map(permisos => {
        const grouped: Record<string, any> = {};
        permisos.forEach(p => {
          if (!grouped[p.modulo]) {
            grouped[p.modulo] = { modulo: p.modulo, permisos: [] };
          }
          grouped[p.modulo].permisos.push(p);
        });
        return Object.values(grouped);
      })
    );
  }

  // ============================================================
  // Módulos
  // ============================================================

  getModulos(): Observable<any[]> {
    return from(this.db.getAll<any>('modulos')).pipe(
      map(modulos => modulos.sort((a, b) => a.orden - b.orden))
    );
  }

  getPermisosRolPorModulo(rolId: string): Observable<any[]> {
    return from(this.db.getAll<any>('modulos')).pipe(
      switchMap(async modulos => {
        const rolesPermisos = await this.db.getAll<any>('roles_permisos');
        const permisos = await this.db.getAll<any>('permisos');
        const rolPermisoIds = rolesPermisos.filter(rp => rp.rolId === rolId).map(rp => rp.permisoId);

        return modulos.map(mod => ({
          ...mod,
          permisos: permisos.filter(p => p.modulo === mod.nombre.toLowerCase()),
          permisosAsignados: permisos.filter(p => p.modulo === mod.nombre.toLowerCase() && rolPermisoIds.includes(p.id))
        }));
      })
    );
  }

  // ============================================================
  // Activos de Acceso
  // ============================================================

  getActivosAcceso(): Observable<any[]> {
    return from(this.db.getAll<any>('activos_acceso'));
  }

  // ============================================================
  // Catálogos
  // ============================================================

  getCatalogos(): Observable<any> {
    return from(this.db.getAll<any>('catalogos')).pipe(
      map(catalogos => {
        const grouped: Record<string, any[]> = {};
        catalogos.filter(c => c.activo !== false).forEach(c => {
          if (!grouped[c.tipo]) grouped[c.tipo] = [];
          grouped[c.tipo].push(c);
        });
        return grouped;
      })
    );
  }

  getCatalogosPorTipo(tipo: string): Observable<any[]> {
    return from(this.db.getAll<any>('catalogos')).pipe(
      map(catalogos => catalogos.filter(c => c.tipo === tipo && c.activo !== false))
    );
  }

  createCatalogo(data: any): Observable<any> {
    const catalogo = {
      ...data,
      id: 'cat-' + Math.random().toString(36).substring(2, 9),
      activo: true,
      metadata: data.metadata || '{}'
    };
    return from(this.db.add('catalogos', catalogo));
  }

  updateCatalogo(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('catalogos', id)).pipe(
      switchMap(cat => {
        if (!cat) throw new Error('Catálogo no encontrado');
        return from(this.db.put('catalogos', { ...cat, ...data }));
      })
    );
  }

  deleteCatalogo(id: string): Observable<void> {
    return from(this.db.get<any>('catalogos', id)).pipe(
      switchMap(cat => {
        if (!cat) throw new Error('Catálogo no encontrado');
        return from(this.db.put('catalogos', { ...cat, activo: false }));
      }),
      map(() => void 0)
    );
  }

  // ============================================================
  // Plantillas de Activos
  // ============================================================

  getPlantillasActivo(): Observable<any[]> {
    return from(this.db.getAll<any>('plantillas_activo')).pipe(
      map(plantillas => plantillas.filter(p => p.activo !== false))
    );
  }

  getPlantillaActivoById(id: string): Observable<any> {
    return from(this.db.get<any>('plantillas_activo', id));
  }

  createPlantillaActivo(data: any): Observable<any> {
    const plantilla = {
      ...data,
      id: 'plt-' + Math.random().toString(36).substring(2, 9),
      activo: true,
      propiedades: typeof data.propiedades === 'string' ? data.propiedades : JSON.stringify(data.propiedades || [])
    };
    return from(this.db.add('plantillas_activo', plantilla));
  }

  updatePlantillaActivo(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('plantillas_activo', id)).pipe(
      switchMap(plantilla => {
        if (!plantilla) throw new Error('Plantilla no encontrada');
        const updated = {
          ...plantilla,
          ...data,
          propiedades: typeof data.propiedades === 'string' ? data.propiedades : JSON.stringify(data.propiedades || plantilla.propiedades)
        };
        return from(this.db.put('plantillas_activo', updated));
      })
    );
  }

  deletePlantillaActivo(id: string): Observable<void> {
    return from(this.db.delete('plantillas_activo', id));
  }

  // ============================================================
  // Activos de Negocio (usando Backend HTTP)
  // ============================================================

  getActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/activos`).pipe(
      map(activos => activos.map(a => ({
        ...a,
        propiedadesCustom: typeof a.propiedadesCustom === 'string'
          ? JSON.parse(a.propiedadesCustom || '[]')
          : (a.propiedadesCustom || []),
        riesgos: a.riesgos || [],
        incidentes: a.incidentes || [],
        defectos: a.defectos || []
      }))),
      catchError(err => {
        console.error('Error cargando activos desde backend:', err);
        return of([]);
      })
    );
  }

  getActivoById(id: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/activos/${id}`).pipe(
      map(activo => ({
        ...activo,
        propiedadesCustom: typeof activo.propiedadesCustom === 'string'
          ? JSON.parse(activo.propiedadesCustom || '[]')
          : (activo.propiedadesCustom || []),
        riesgos: activo.riesgos || [],
        incidentes: activo.incidentes || [],
        defectos: activo.defectos || []
      })),
      catchError(err => {
        console.error('Error cargando activo:', err);
        return of(null);
      })
    );
  }

  createActivo(data: any): Observable<any> {
    const activo = {
      ...data,
      propiedadesCustom: typeof data.propiedadesCustom === 'string'
        ? data.propiedadesCustom
        : JSON.stringify(data.propiedadesCustom || [])
    };
    return this.http.post<any>(`${API_URL}/activos`, activo);
  }

  updateActivo(id: string, data: any): Observable<any> {
    const updated = {
      ...data,
      propiedadesCustom: data.propiedadesCustom
        ? (typeof data.propiedadesCustom === 'string' ? data.propiedadesCustom : JSON.stringify(data.propiedadesCustom))
        : undefined
    };
    return this.http.put<any>(`${API_URL}/activos/${id}`, updated);
  }

  deleteActivo(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/activos/${id}`);
  }

  // ============================================================
  // Riesgos
  // ============================================================

  getRiesgos(): Observable<any[]> {
    return from(this.db.getAll<any>('riesgos')).pipe(
      switchMap(async riesgos => {
        const activos = await this.db.getAll<any>('activos');
        return riesgos.map(r => ({
          ...r,
          activo: activos.find(a => a.id === r.activoId)
        }));
      })
    );
  }

  getRiesgosByActivo(activoId: string): Observable<any[]> {
    return from(this.db.getAll<any>('riesgos')).pipe(
      map(riesgos => riesgos.filter(r => r.activoId === activoId))
    );
  }

  createRiesgo(data: any): Observable<any> {
    const riesgo = {
      ...data,
      id: 'rsk-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('riesgos', riesgo));
  }

  updateRiesgo(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('riesgos', id)).pipe(
      switchMap(riesgo => {
        if (!riesgo) throw new Error('Riesgo no encontrado');
        return from(this.db.put('riesgos', { ...riesgo, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteRiesgo(id: string): Observable<void> {
    return from(this.db.delete('riesgos', id));
  }

  // ============================================================
  // Incidentes
  // ============================================================

  getIncidentes(): Observable<any[]> {
    return from(this.db.getAll<any>('incidentes')).pipe(
      switchMap(async incidentes => {
        const activos = await this.db.getAll<any>('activos');
        return incidentes.map(i => ({
          ...i,
          activo: activos.find(a => a.id === i.activoId)
        }));
      })
    );
  }

  getIncidentesByActivo(activoId: string): Observable<any[]> {
    return from(this.db.getAll<any>('incidentes')).pipe(
      map(incidentes => incidentes.filter(i => i.activoId === activoId))
    );
  }

  createIncidente(data: any): Observable<any> {
    const incidente = {
      ...data,
      id: 'inc-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('incidentes', incidente));
  }

  updateIncidente(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('incidentes', id)).pipe(
      switchMap(incidente => {
        if (!incidente) throw new Error('Incidente no encontrado');
        return from(this.db.put('incidentes', { ...incidente, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteIncidente(id: string): Observable<void> {
    return from(this.db.delete('incidentes', id));
  }

  // ============================================================
  // Defectos
  // ============================================================

  getDefectos(): Observable<any[]> {
    return from(this.db.getAll<any>('defectos')).pipe(
      switchMap(async defectos => {
        const activos = await this.db.getAll<any>('activos');
        return defectos.map(d => ({
          ...d,
          activo: activos.find(a => a.id === d.activoId)
        }));
      })
    );
  }

  getDefectosByActivo(activoId: string): Observable<any[]> {
    return from(this.db.getAll<any>('defectos')).pipe(
      map(defectos => defectos.filter(d => d.activoId === activoId))
    );
  }

  createDefecto(data: any): Observable<any> {
    const defecto = {
      ...data,
      id: 'def-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('defectos', defecto));
  }

  updateDefecto(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('defectos', id)).pipe(
      switchMap(defecto => {
        if (!defecto) throw new Error('Defecto no encontrado');
        return from(this.db.put('defectos', { ...defecto, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteDefecto(id: string): Observable<void> {
    return from(this.db.delete('defectos', id));
  }

  // ============================================================
  // Procesos
  // ============================================================

  getProcesos(): Observable<any[]> {
    return from(this.db.getAll<any>('procesos')).pipe(
      switchMap(async procesos => {
        const nodes = await this.db.getAll<any>('process_nodes');
        const edges = await this.db.getAll<any>('process_edges');
        const objetivos = await this.db.getAll<any>('objetivos_proceso');
        const kpis = await this.db.getAll<any>('kpis_proceso');

        return procesos.map(p => ({
          ...p,
          nodes: nodes.filter(n => n.procesoId === p.id),
          edges: edges.filter(e => e.procesoId === p.id),
          objetivos: objetivos.filter(o => o.procesoId === p.id),
          kpis: kpis.filter(k => k.procesoId === p.id)
        }));
      })
    );
  }

  getProcesoById(id: string): Observable<any> {
    return from(this.db.get<any>('procesos', id)).pipe(
      switchMap(async proceso => {
        if (!proceso) return null;
        const nodes = await this.db.getAll<any>('process_nodes');
        const edges = await this.db.getAll<any>('process_edges');
        const objetivos = await this.db.getAll<any>('objetivos_proceso');
        const kpis = await this.db.getAll<any>('kpis_proceso');

        return {
          ...proceso,
          nodes: nodes.filter(n => n.procesoId === proceso.id),
          edges: edges.filter(e => e.procesoId === proceso.id),
          objetivos: objetivos.filter(o => o.procesoId === proceso.id),
          kpis: kpis.filter(k => k.procesoId === proceso.id)
        };
      })
    );
  }

  createProceso(data: any): Observable<any> {
    const proceso = {
      ...data,
      id: 'prc-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('procesos', proceso));
  }

  updateProceso(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('procesos', id)).pipe(
      switchMap(proceso => {
        if (!proceso) throw new Error('Proceso no encontrado');
        return from(this.db.put('procesos', { ...proceso, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteProceso(id: string): Observable<void> {
    return from(this.db.delete('procesos', id));
  }

  addNodoProceso(data: any): Observable<any> {
    const node = {
      ...data,
      id: 'pn-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('process_nodes', node));
  }

  updateNodoProceso(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('process_nodes', id)).pipe(
      switchMap(node => {
        if (!node) throw new Error('Nodo no encontrado');
        return from(this.db.put('process_nodes', { ...node, ...data }));
      })
    );
  }

  deleteNodoProceso(id: string): Observable<void> {
    return from(this.db.delete('process_nodes', id));
  }

  addEdgeProceso(data: any): Observable<any> {
    const edge = {
      ...data,
      id: 'pe-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('process_edges', edge));
  }

  deleteEdgeProceso(id: string): Observable<void> {
    return from(this.db.delete('process_edges', id));
  }

  getKpisProceso(procesoId: string): Observable<any[]> {
    return from(this.db.getAll<any>('kpis_proceso')).pipe(
      map(kpis => kpis.filter(k => k.procesoId === procesoId))
    );
  }

  createKpiProceso(data: any): Observable<any> {
    const kpi = {
      ...data,
      id: 'kpi-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('kpis_proceso', kpi));
  }

  updateKpiProceso(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('kpis_proceso', id)).pipe(
      switchMap(kpi => {
        if (!kpi) throw new Error('KPI no encontrado');
        return from(this.db.put('kpis_proceso', { ...kpi, ...data }));
      })
    );
  }

  deleteKpiProceso(id: string): Observable<void> {
    return from(this.db.delete('kpis_proceso', id));
  }

  // ============================================================
  // Cuestionarios
  // ============================================================

  getMarcosNormativos(): Observable<any[]> {
    return from(this.db.getAll<any>('marcos_normativos'));
  }

  getMarcoNormativoById(id: string): Observable<any> {
    return from(this.db.get<any>('marcos_normativos', id));
  }

  createMarcoNormativo(data: any): Observable<any> {
    const marco = {
      ...data,
      id: 'marco-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('marcos_normativos', marco));
  }

  updateMarcoNormativo(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('marcos_normativos', id)).pipe(
      switchMap(marco => {
        if (!marco) throw new Error('Marco normativo no encontrado');
        return from(this.db.put('marcos_normativos', { ...marco, ...data }));
      })
    );
  }

  deleteMarcoNormativo(id: string): Observable<void> {
    return from(this.db.delete('marcos_normativos', id));
  }

  getCuestionarios(): Observable<any[]> {
    return from(this.db.getAll<any>('cuestionarios')).pipe(
      switchMap(async cuestionarios => {
        const marcos = await this.db.getAll<any>('marcos_normativos');
        const secciones = await this.db.getAll<any>('secciones');
        const preguntas = await this.db.getAll<any>('preguntas');

        return cuestionarios.map(c => ({
          ...c,
          marcoNormativo: marcos.find(m => m.id === c.marcoNormativoId),
          secciones: secciones.filter(s => s.cuestionarioId === c.id).map(s => ({
            ...s,
            preguntas: preguntas.filter(p => p.seccionId === s.id)
          }))
        }));
      })
    );
  }

  getCuestionarioById(id: string): Observable<any> {
    return from(this.db.get<any>('cuestionarios', id)).pipe(
      switchMap(async cuestionario => {
        if (!cuestionario) return null;
        const marcos = await this.db.getAll<any>('marcos_normativos');
        const secciones = await this.db.getAll<any>('secciones');
        const preguntas = await this.db.getAll<any>('preguntas');

        return {
          ...cuestionario,
          marcoNormativo: marcos.find(m => m.id === cuestionario.marcoNormativoId),
          secciones: secciones.filter(s => s.cuestionarioId === cuestionario.id).map(s => ({
            ...s,
            preguntas: preguntas.filter(p => p.seccionId === s.id)
          }))
        };
      })
    );
  }

  createCuestionario(data: any): Observable<any> {
    const cuestionario = {
      ...data,
      id: 'cst-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('cuestionarios', cuestionario));
  }

  updateCuestionario(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('cuestionarios', id)).pipe(
      switchMap(cuestionario => {
        if (!cuestionario) throw new Error('Cuestionario no encontrado');
        return from(this.db.put('cuestionarios', { ...cuestionario, ...data }));
      })
    );
  }

  deleteCuestionario(id: string): Observable<void> {
    return from(this.db.delete('cuestionarios', id));
  }

  addSeccionCuestionario(data: any): Observable<any> {
    const seccion = {
      ...data,
      id: 'sec-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('secciones', seccion));
  }

  updateSeccionCuestionario(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('secciones', id)).pipe(
      switchMap(seccion => {
        if (!seccion) throw new Error('Sección no encontrada');
        return from(this.db.put('secciones', { ...seccion, ...data }));
      })
    );
  }

  deleteSeccionCuestionario(id: string): Observable<void> {
    return from(this.db.delete('secciones', id));
  }

  addPreguntaSeccion(data: any): Observable<any> {
    const pregunta = {
      ...data,
      id: 'prg-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('preguntas', pregunta));
  }

  updatePreguntaSeccion(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('preguntas', id)).pipe(
      switchMap(pregunta => {
        if (!pregunta) throw new Error('Pregunta no encontrada');
        return from(this.db.put('preguntas', { ...pregunta, ...data }));
      })
    );
  }

  deletePreguntaSeccion(id: string): Observable<void> {
    return from(this.db.delete('preguntas', id));
  }

  getAsignacionesCuestionario(): Observable<any[]> {
    return from(this.db.getAll<any>('asignaciones_cuestionario')).pipe(
      switchMap(async asignaciones => {
        const cuestionarios = await this.db.getAll<any>('cuestionarios');
        return asignaciones.map(a => ({
          ...a,
          cuestionario: cuestionarios.find(c => c.id === a.cuestionarioId)
        }));
      })
    );
  }

  getAsignacionById(id: string): Observable<any> {
    return from(this.db.get<any>('asignaciones_cuestionario', id));
  }

  createAsignacionCuestionario(data: any): Observable<any> {
    const asignacion = {
      ...data,
      id: 'asig-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('asignaciones_cuestionario', asignacion));
  }

  updateAsignacionCuestionario(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('asignaciones_cuestionario', id)).pipe(
      switchMap(asignacion => {
        if (!asignacion) throw new Error('Asignación no encontrada');
        return from(this.db.put('asignaciones_cuestionario', { ...asignacion, ...data }));
      })
    );
  }

  deleteAsignacionCuestionario(id: string): Observable<void> {
    return from(this.db.delete('asignaciones_cuestionario', id));
  }

  guardarRespuestaCuestionario(data: any): Observable<any> {
    const respuesta = {
      ...data,
      id: 'resp-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('respuestas_cuestionario', respuesta));
  }

  getRespuestasAsignacion(asignacionId: string): Observable<any[]> {
    return from(this.db.getAll<any>('respuestas_cuestionario')).pipe(
      map(respuestas => respuestas.filter(r => r.asignacionId === asignacionId))
    );
  }

  // ============================================================
  // Organigramas
  // ============================================================

  getOrganigramas(): Observable<any[]> {
    return from(this.db.getAll<any>('organigramas')).pipe(
      switchMap(async organigramas => {
        const nodos = await this.db.getAll<any>('nodos_organigrama');
        // Devolver el array plano de nodos para que el componente construya el árbol
        return organigramas.map(o => ({
          ...o,
          nodos: nodos.filter(n => n.organigramaId === o.id)
        }));
      })
    );
  }

  private buildOrgTree(nodos: any[]): any[] {
    const nodeMap = new Map(nodos.map(n => [n.id, { ...n, hijos: [] }]));
    const roots: any[] = [];

    nodos.forEach(n => {
      const node = nodeMap.get(n.id)!;
      if (n.padreId && nodeMap.has(n.padreId)) {
        nodeMap.get(n.padreId)!.hijos.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  getOrganigramaById(id: string): Observable<any> {
    return from(this.db.get<any>('organigramas', id)).pipe(
      switchMap(async organigrama => {
        if (!organigrama) return null;
        const nodos = await this.db.getAll<any>('nodos_organigrama');
        // Devolver el array plano de nodos para que el componente construya el árbol
        return {
          ...organigrama,
          nodos: nodos.filter(n => n.organigramaId === organigrama.id)
        };
      })
    );
  }

  createOrganigrama(data: any): Observable<any> {
    const organigrama = {
      ...data,
      id: 'org-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('organigramas', organigrama));
  }

  updateOrganigrama(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('organigramas', id)).pipe(
      switchMap(organigrama => {
        if (!organigrama) throw new Error('Organigrama no encontrado');
        return from(this.db.put('organigramas', { ...organigrama, ...data }));
      })
    );
  }

  deleteOrganigrama(id: string): Observable<void> {
    return from(this.db.delete('organigramas', id));
  }

  addNodoOrganigrama(data: any): Observable<any> {
    const nodo = {
      ...data,
      id: 'norg-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('nodos_organigrama', nodo));
  }

  updateNodoOrganigrama(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('nodos_organigrama', id)).pipe(
      switchMap(nodo => {
        if (!nodo) throw new Error('Nodo no encontrado');
        return from(this.db.put('nodos_organigrama', { ...nodo, ...data }));
      })
    );
  }

  deleteNodoOrganigrama(id: string): Observable<void> {
    return from(this.db.delete('nodos_organigrama', id));
  }

  resetOrganigramasData(): Observable<void> {
    return from((async () => {
      // Clear existing data
      await this.db.clear('organigramas');
      await this.db.clear('nodos_organigrama');

      // Import fresh seed data
      const seedData = await import('./seed-data');

      // Re-seed organigramas
      for (const org of seedData.organigramas) {
        await this.db.add('organigramas', org);
      }
      console.log(`✓ ${seedData.organigramas.length} organigramas reseeded`);

      // Re-seed nodos
      for (const nodo of seedData.nodosOrganigrama) {
        await this.db.add('nodos_organigrama', nodo);
      }
      console.log(`✓ ${seedData.nodosOrganigrama.length} nodos reseeded`);
    })());
  }

  // ============================================================
  // Dashboard
  // ============================================================

  getDashboardConfigs(): Observable<any[]> {
    return from(this.db.getAll<any>('dashboard_configs'));
  }

  getDashboardDefault(): Observable<any> {
    return from(this.db.getAll<any>('dashboard_configs')).pipe(
      switchMap(async configs => {
        let defaultConfig = configs.find(c => c.isDefault);
        if (!defaultConfig && configs.length > 0) {
          defaultConfig = configs[0];
        }
        if (!defaultConfig) {
          defaultConfig = {
            id: 'dash-default',
            nombre: 'Dashboard Principal',
            descripcion: 'Panel de control por defecto',
            isDefault: true,
            columns: 12,
            rowHeight: 50,
            gap: 10,
            createdAt: new Date().toISOString()
          };
          await this.db.add('dashboard_configs', defaultConfig);
        }
        const widgets = await this.db.getAll<any>('dashboard_widgets');
        return {
          ...defaultConfig,
          widgets: widgets.filter(w => w.dashboardId === defaultConfig.id)
        };
      })
    );
  }

  getDashboardById(id: string): Observable<any> {
    return from(this.db.get<any>('dashboard_configs', id)).pipe(
      switchMap(async config => {
        if (!config) return null;
        const widgets = await this.db.getAll<any>('dashboard_widgets');
        return {
          ...config,
          widgets: widgets.filter(w => w.dashboardId === config.id)
        };
      })
    );
  }

  createDashboardConfig(data: any): Observable<any> {
    const config = {
      ...data,
      id: 'dash-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('dashboard_configs', config));
  }

  updateDashboardConfig(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('dashboard_configs', id)).pipe(
      switchMap(config => {
        if (!config) throw new Error('Dashboard no encontrado');
        return from(this.db.put('dashboard_configs', { ...config, ...data }));
      })
    );
  }

  deleteDashboardConfig(id: string): Observable<void> {
    return from(this.db.delete('dashboard_configs', id));
  }

  addDashboardWidget(data: any): Observable<any> {
    const widget = {
      ...data,
      id: 'dw-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('dashboard_widgets', widget));
  }

  updateDashboardWidget(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('dashboard_widgets', id)).pipe(
      switchMap(widget => {
        if (!widget) throw new Error('Widget no encontrado');
        return from(this.db.put('dashboard_widgets', { ...widget, ...data }));
      })
    );
  }

  updateDashboardWidgetsLayout(layout: any[]): Observable<any> {
    return from(Promise.all(
      layout.map(async item => {
        const widget = await this.db.get<any>('dashboard_widgets', item.id);
        if (widget) {
          await this.db.put('dashboard_widgets', { ...widget, x: item.x, y: item.y, cols: item.cols, rows: item.rows });
        }
      })
    ));
  }

  deleteDashboardWidget(id: string): Observable<void> {
    return from(this.db.delete('dashboard_widgets', id));
  }

  // ============================================================
  // Estadísticas
  // ============================================================

  getEstadisticasUsuarios(): Observable<any> {
    return from(this.db.getAll<any>('usuarios')).pipe(
      map(usuarios => ({
        total: usuarios.length,
        activos: usuarios.filter(u => u.estado === 'activo').length,
        inactivos: usuarios.filter(u => u.estado === 'inactivo').length,
        pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
        bloqueados: usuarios.filter(u => u.estado === 'bloqueado').length,
        con2FA: usuarios.filter(u => u.autenticacionDosFactor).length,
        sinRoles: 0 // Would need additional query
      }))
    );
  }

  getEstadisticasRoles(): Observable<any> {
    return from(this.db.getAll<any>('roles')).pipe(
      map(roles => ({
        total: roles.length,
        activos: roles.filter(r => r.activo !== false).length,
        inactivos: roles.filter(r => r.activo === false).length,
        sistema: roles.filter(r => r.esRolSistema).length,
        personalizados: roles.filter(r => !r.esRolSistema).length
      }))
    );
  }

  getDashboard(): Observable<any> {
    return from(Promise.all([
      this.db.getAll<any>('usuarios'),
      this.db.getAll<any>('roles'),
      this.db.getAll<any>('permisos'),
      this.db.getAll<any>('riesgos'),
      this.db.getAll<any>('incidentes'),
      this.db.getAll<any>('procesos')
    ])).pipe(
      map(([usuarios, roles, permisos, riesgos, incidentes, procesos]) => ({
        usuarios: {
          total: usuarios.length,
          activos: usuarios.filter(u => u.estado === 'activo').length
        },
        roles: {
          total: roles.length,
          activos: roles.filter(r => r.activo !== false).length
        },
        permisos: {
          total: permisos.length
        },
        riesgos: {
          total: riesgos.length,
          criticos: riesgos.filter(r => r.estado === 'en_tratamiento').length
        },
        incidentes: {
          total: incidentes.length,
          abiertos: incidentes.filter(i => !['cerrado', 'resuelto'].includes(i.estado)).length
        },
        procesos: {
          total: procesos.length,
          activos: procesos.filter(p => p.estado === 'activo').length
        },
        ultimosUsuarios: usuarios.slice(-5).reverse()
      }))
    );
  }

  // ============================================================
  // Notificaciones
  // ============================================================

  getNotificationRules(): Observable<any[]> {
    return from(this.db.getAll<any>('notification_rules'));
  }

  getNotificationRuleById(id: string): Observable<any> {
    return from(this.db.get<any>('notification_rules', id));
  }

  createNotificationRule(data: any): Observable<any> {
    const rule = {
      ...data,
      id: 'nr-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('notification_rules', rule));
  }

  updateNotificationRule(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('notification_rules', id)).pipe(
      switchMap(rule => {
        if (!rule) throw new Error('Regla no encontrada');
        return from(this.db.put('notification_rules', { ...rule, ...data }));
      })
    );
  }

  deleteNotificationRule(id: string): Observable<void> {
    return from(this.db.delete('notification_rules', id));
  }

  getAlertRules(): Observable<any[]> {
    return from(this.db.getAll<any>('alert_rules'));
  }

  createAlertRule(data: any): Observable<any> {
    const rule = {
      ...data,
      id: 'ar-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('alert_rules', rule));
  }

  updateAlertRule(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('alert_rules', id)).pipe(
      switchMap(rule => {
        if (!rule) throw new Error('Regla no encontrada');
        return from(this.db.put('alert_rules', { ...rule, ...data }));
      })
    );
  }

  deleteAlertRule(id: string): Observable<void> {
    return from(this.db.delete('alert_rules', id));
  }

  getExpirationRules(): Observable<any[]> {
    return from(this.db.getAll<any>('expiration_rules'));
  }

  createExpirationRule(data: any): Observable<any> {
    const rule = {
      ...data,
      id: 'er-' + Math.random().toString(36).substring(2, 9)
    };
    return from(this.db.add('expiration_rules', rule));
  }

  updateExpirationRule(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('expiration_rules', id)).pipe(
      switchMap(rule => {
        if (!rule) throw new Error('Regla no encontrada');
        return from(this.db.put('expiration_rules', { ...rule, ...data }));
      })
    );
  }

  deleteExpirationRule(id: string): Observable<void> {
    return from(this.db.delete('expiration_rules', id));
  }

  getNotificationsInbox(params?: any): Observable<any> {
    return from(this.db.getAll<any>('notifications')).pipe(
      map(notifications => {
        let filtered = notifications;
        if (params) {
          if (params.leida !== undefined) {
            filtered = filtered.filter(n => n.leida === params.leida);
          }
          if (params.archivada !== undefined) {
            filtered = filtered.filter(n => n.archivada === params.archivada);
          }
          if (params.tipo) {
            filtered = filtered.filter(n => n.tipo === params.tipo);
          }
          if (params.severidad) {
            filtered = filtered.filter(n => n.severidad === params.severidad);
          }
        }
        const page = params?.page || 1;
        const limit = params?.limit || 20;
        const start = (page - 1) * limit;
        const paginated = filtered.slice(start, start + limit);

        return {
          data: paginated,
          total: filtered.length,
          page,
          limit,
          totalPages: Math.ceil(filtered.length / limit)
        };
      })
    );
  }

  getNotificationById(id: string): Observable<any> {
    return from(this.db.get<any>('notifications', id));
  }

  markNotificationAsRead(id: string): Observable<any> {
    return from(this.db.get<any>('notifications', id)).pipe(
      switchMap(notification => {
        if (!notification) throw new Error('Notificación no encontrada');
        return from(this.db.put('notifications', { ...notification, leida: true, fechaLeida: new Date().toISOString() }));
      })
    );
  }

  toggleNotificationArchive(id: string): Observable<any> {
    return from(this.db.get<any>('notifications', id)).pipe(
      switchMap(notification => {
        if (!notification) throw new Error('Notificación no encontrada');
        return from(this.db.put('notifications', { ...notification, archivada: !notification.archivada }));
      })
    );
  }

  toggleNotificationFollow(id: string): Observable<any> {
    return from(this.db.get<any>('notifications', id)).pipe(
      switchMap(notification => {
        if (!notification) throw new Error('Notificación no encontrada');
        return from(this.db.put('notifications', { ...notification, seguimiento: !notification.seguimiento }));
      })
    );
  }

  deleteNotification(id: string): Observable<void> {
    return from(this.db.delete('notifications', id));
  }

  markAllNotificationsAsRead(): Observable<any> {
    return from(this.db.getAll<any>('notifications')).pipe(
      switchMap(async notifications => {
        for (const n of notifications) {
          if (!n.leida) {
            await this.db.put('notifications', { ...n, leida: true, fechaLeida: new Date().toISOString() });
          }
        }
        return { updated: notifications.filter(n => !n.leida).length };
      })
    );
  }

  createNotification(data: any): Observable<any> {
    const notification = {
      ...data,
      id: 'ntf-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      leida: false
    };
    return from(this.db.add('notifications', notification));
  }

  getNotificationPreferences(): Observable<any> {
    return from(this.db.getAll<any>('user_notification_preferences')).pipe(
      map(prefs => prefs[0] || { emailEnabled: true, inAppEnabled: true })
    );
  }

  updateNotificationPreferences(data: any): Observable<any> {
    return from(this.db.getAll<any>('user_notification_preferences')).pipe(
      switchMap(async prefs => {
        if (prefs.length > 0) {
          return this.db.put('user_notification_preferences', { ...prefs[0], ...data });
        } else {
          return this.db.add('user_notification_preferences', { id: 'pref-001', ...data });
        }
      })
    );
  }

  getNotificationStats(): Observable<any> {
    return from(this.db.getAll<any>('notifications')).pipe(
      map(notifications => ({
        total: notifications.length,
        noLeidas: notifications.filter(n => !n.leida).length,
        criticas: notifications.filter(n => n.severidad === 'critical' && !n.leida).length,
        porTipo: {
          NOTIFICATION: notifications.filter(n => n.tipo === 'NOTIFICATION').length,
          ALERT: notifications.filter(n => n.tipo === 'ALERT').length,
          EXPIRATION_REMINDER: notifications.filter(n => n.tipo === 'EXPIRATION_REMINDER').length,
          APPROVAL_REQUEST: notifications.filter(n => n.tipo === 'APPROVAL_REQUEST').length
        }
      }))
    );
  }

  // ============================================================
  // Proyectos
  // ============================================================

  getProjects(params?: Record<string, string>): Observable<any[]> {
    return from(this.db.getAll<any>('projects')).pipe(
      switchMap(async projects => {
        const phases = await this.db.getAll<any>('project_phases');
        const tasks = await this.db.getAll<any>('tasks');
        const usuarios = await this.db.getAll<any>('usuarios');

        let filtered = projects;
        if (params) {
          if (params['status']) {
            filtered = filtered.filter(p => p.status === params['status']);
          }
          if (params['priority']) {
            filtered = filtered.filter(p => p.priority === params['priority']);
          }
        }

        return filtered.map(p => ({
          ...p,
          responsibleUser: usuarios.find(u => u.id === p.responsibleUserId),
          phases: phases.filter(ph => ph.projectId === p.id),
          _count: {
            phases: phases.filter(ph => ph.projectId === p.id).length,
            tasks: tasks.filter(t => t.projectId === p.id).length
          }
        }));
      })
    );
  }

  getProjectById(id: string): Observable<any> {
    return from(this.db.get<any>('projects', id)).pipe(
      switchMap(async project => {
        if (!project) return null;
        const phases = await this.db.getAll<any>('project_phases');
        const tasks = await this.db.getAll<any>('tasks');
        const usuarios = await this.db.getAll<any>('usuarios');

        return {
          ...project,
          responsibleUser: usuarios.find(u => u.id === project.responsibleUserId),
          phases: phases.filter(ph => ph.projectId === project.id).map(ph => ({
            ...ph,
            tasks: tasks.filter(t => t.phaseId === ph.id)
          })),
          tasks: tasks.filter(t => t.projectId === project.id)
        };
      })
    );
  }

  createProject(data: any): Observable<any> {
    const project = {
      ...data,
      id: 'prj-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      progress: 0
    };
    return from(this.db.add('projects', project));
  }

  updateProject(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('projects', id)).pipe(
      switchMap(project => {
        if (!project) throw new Error('Proyecto no encontrado');
        return from(this.db.put('projects', { ...project, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteProject(id: string): Observable<void> {
    return from(this.db.delete('projects', id));
  }

  updateProjectStatus(id: string, status: string): Observable<any> {
    return this.updateProject(id, { status });
  }

  getProjectObjectives(projectId: string): Observable<any[]> {
    return from(this.db.getAll<any>('project_objectives')).pipe(
      map(objectives => objectives.filter(o => o.projectId === projectId))
    );
  }

  createProjectObjective(projectId: string, data: any): Observable<any> {
    const objective = {
      ...data,
      id: 'pobj-' + Math.random().toString(36).substring(2, 9),
      projectId
    };
    return from(this.db.add('project_objectives', objective));
  }

  updateProjectObjective(projectId: string, objectiveId: string, data: any): Observable<any> {
    return from(this.db.get<any>('project_objectives', objectiveId)).pipe(
      switchMap(objective => {
        if (!objective) throw new Error('Objetivo no encontrado');
        return from(this.db.put('project_objectives', { ...objective, ...data }));
      })
    );
  }

  deleteProjectObjective(projectId: string, objectiveId: string): Observable<void> {
    return from(this.db.delete('project_objectives', objectiveId));
  }

  getProjectKPIs(projectId: string): Observable<any[]> {
    return from(this.db.getAll<any>('project_kpis')).pipe(
      map(kpis => kpis.filter(k => k.projectId === projectId))
    );
  }

  createProjectKPI(projectId: string, data: any): Observable<any> {
    const kpi = {
      ...data,
      id: 'pkpi-' + Math.random().toString(36).substring(2, 9),
      projectId
    };
    return from(this.db.add('project_kpis', kpi));
  }

  updateProjectKPI(projectId: string, kpiId: string, data: any): Observable<any> {
    return from(this.db.get<any>('project_kpis', kpiId)).pipe(
      switchMap(kpi => {
        if (!kpi) throw new Error('KPI no encontrado');
        return from(this.db.put('project_kpis', { ...kpi, ...data }));
      })
    );
  }

  deleteProjectKPI(projectId: string, kpiId: string): Observable<void> {
    return from(this.db.delete('project_kpis', kpiId));
  }

  getProjectPhases(projectId: string): Observable<any[]> {
    return from(this.db.getAll<any>('project_phases')).pipe(
      map(phases => phases.filter(p => p.projectId === projectId).sort((a, b) => a.orderNum - b.orderNum))
    );
  }

  createProjectPhase(projectId: string, data: any): Observable<any> {
    const phase = {
      ...data,
      id: 'phase-' + Math.random().toString(36).substring(2, 9),
      projectId
    };
    return from(this.db.add('project_phases', phase));
  }

  updateProjectPhase(projectId: string, phaseId: string, data: any): Observable<any> {
    return from(this.db.get<any>('project_phases', phaseId)).pipe(
      switchMap(phase => {
        if (!phase) throw new Error('Fase no encontrada');
        return from(this.db.put('project_phases', { ...phase, ...data }));
      })
    );
  }

  deleteProjectPhase(projectId: string, phaseId: string): Observable<void> {
    return from(this.db.delete('project_phases', phaseId));
  }

  updatePhaseStatus(projectId: string, phaseId: string, status: string): Observable<any> {
    return this.updateProjectPhase(projectId, phaseId, { status });
  }

  reorderProjectPhases(projectId: string, phases: { id: string; orderNum: number }[]): Observable<any[]> {
    return from(Promise.all(
      phases.map(async p => {
        const phase = await this.db.get<any>('project_phases', p.id);
        if (phase) {
          await this.db.put('project_phases', { ...phase, orderNum: p.orderNum });
        }
        return phase;
      })
    ));
  }

  getProjectDashboard(projectId: string): Observable<any> {
    return this.getProjectById(projectId).pipe(
      map(project => ({
        ...project,
        stats: {
          totalTasks: project?.tasks?.length || 0,
          completedTasks: project?.tasks?.filter((t: any) => t.status === 'completed').length || 0,
          inProgressTasks: project?.tasks?.filter((t: any) => t.status === 'in_progress').length || 0,
          pendingTasks: project?.tasks?.filter((t: any) => t.status === 'pending').length || 0
        }
      }))
    );
  }

  getProjectGantt(projectId: string): Observable<any> {
    return this.getProjectById(projectId);
  }

  getProjectCalendar(projectId: string, params?: { start?: string; end?: string }): Observable<any[]> {
    return from(this.db.getAll<any>('tasks')).pipe(
      map(tasks => {
        let filtered = tasks.filter(t => t.projectId === projectId);
        if (params?.start) {
          filtered = filtered.filter(t => t.dueDate >= params.start!);
        }
        if (params?.end) {
          filtered = filtered.filter(t => t.startDate <= params.end!);
        }
        return filtered.map(t => ({
          id: t.id,
          title: t.title,
          start: t.startDate,
          end: t.dueDate,
          status: t.status
        }));
      })
    );
  }

  // ============================================================
  // Tareas
  // ============================================================

  getTasks(params?: Record<string, string>): Observable<any[]> {
    return from(this.db.getAll<any>('tasks')).pipe(
      switchMap(async tasks => {
        const usuarios = await this.db.getAll<any>('usuarios');
        const projects = await this.db.getAll<any>('projects');
        const phases = await this.db.getAll<any>('project_phases');

        let filtered = tasks;
        if (params) {
          if (params['projectId']) {
            filtered = filtered.filter(t => t.projectId === params['projectId']);
          }
          if (params['phaseId']) {
            filtered = filtered.filter(t => t.phaseId === params['phaseId']);
          }
          if (params['status']) {
            filtered = filtered.filter(t => t.status === params['status']);
          }
          if (params['priority']) {
            filtered = filtered.filter(t => t.priority === params['priority']);
          }
          if (params['assignedTo']) {
            filtered = filtered.filter(t => t.assignedTo === params['assignedTo']);
          }
        }

        return filtered.map(t => ({
          ...t,
          assignedUser: usuarios.find(u => u.id === t.assignedTo),
          project: projects.find(p => p.id === t.projectId),
          phase: phases.find(ph => ph.id === t.phaseId)
        }));
      })
    );
  }

  getTaskById(id: string): Observable<any> {
    return from(this.db.get<any>('tasks', id)).pipe(
      switchMap(async task => {
        if (!task) return null;
        const usuarios = await this.db.getAll<any>('usuarios');
        const evidences = await this.db.getAll<any>('task_evidences');
        const history = await this.db.getAll<any>('task_history');

        return {
          ...task,
          assignedUser: usuarios.find(u => u.id === task.assignedTo),
          evidences: evidences.filter(e => e.taskId === task.id),
          history: history.filter(h => h.taskId === task.id)
        };
      })
    );
  }

  createTask(data: any): Observable<any> {
    const task = {
      ...data,
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      status: data.status || 'pending',
      progress: data.progress || 0
    };
    return from(this.db.add('tasks', task));
  }

  updateTask(id: string, data: any): Observable<any> {
    return from(this.db.get<any>('tasks', id)).pipe(
      switchMap(task => {
        if (!task) throw new Error('Tarea no encontrada');
        return from(this.db.put('tasks', { ...task, ...data, updatedAt: new Date().toISOString() }));
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return from(this.db.delete('tasks', id));
  }

  updateTaskStatus(id: string, status: string, userId?: string, comment?: string): Observable<any> {
    return this.updateTask(id, { status });
  }

  updateTaskProgress(id: string, progress: number, actualHours?: number, userId?: string, comment?: string): Observable<any> {
    const updates: any = { progress };
    if (actualHours !== undefined) updates.actualHours = actualHours;
    if (progress >= 100) updates.status = 'completed';
    else if (progress > 0) updates.status = 'in_progress';
    return this.updateTask(id, updates);
  }

  assignTask(id: string, assignedTo: string, assignedBy?: string, reason?: string): Observable<any> {
    return this.updateTask(id, { assignedTo });
  }

  getTaskEvidences(taskId: string): Observable<any[]> {
    return from(this.db.getAll<any>('task_evidences')).pipe(
      map(evidences => evidences.filter(e => e.taskId === taskId))
    );
  }

  createTaskEvidence(taskId: string, data: any): Observable<any> {
    const evidence = {
      ...data,
      id: 'evd-' + Math.random().toString(36).substring(2, 9),
      taskId,
      createdAt: new Date().toISOString()
    };
    return from(this.db.add('task_evidences', evidence));
  }

  deleteTaskEvidence(taskId: string, evidenceId: string): Observable<void> {
    return from(this.db.delete('task_evidences', evidenceId));
  }

  getMyTasks(userId: string, params?: { start?: string; end?: string }): Observable<any[]> {
    return from(this.db.getAll<any>('tasks')).pipe(
      map(tasks => {
        let filtered = tasks.filter(t => t.assignedTo === userId);
        if (params?.start) {
          filtered = filtered.filter(t => t.dueDate >= params.start!);
        }
        if (params?.end) {
          filtered = filtered.filter(t => t.startDate <= params.end!);
        }
        return filtered;
      })
    );
  }

  createTaskFromEntity(data: any): Observable<any> {
    return this.createTask(data);
  }

  // ============================================================
  // Estado de Salud de Activos (usando Backend HTTP)
  // ============================================================

  resetActivoHealth(id: string): Observable<any> {
    return this.http.patch<any>(`${API_URL}/activos/${id}/health/reset`, {});
  }

  recalculateAllActivosHealth(): Observable<any> {
    return this.http.post<any>(`${API_URL}/activos/health/recalculate`, {});
  }

  getHealthDiagnostic(): Observable<any> {
    return this.http.get<any>(`${API_URL}/activos/health/diagnostic`);
  }

  // ============================================================
  // Jerarquia de Activos (usando Backend HTTP)
  // ============================================================

  getActivoChildren(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/activos/${id}/children`);
  }

  getActivoParents(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/activos/${id}/parents`);
  }

  // ============================================================
  // Configuracion de Tolerancia (usando Backend HTTP)
  // ============================================================

  updateActivoTolerance(id: string, config: { incidentToleranceThreshold: number; incidentCountResetDays: number }): Observable<any> {
    return this.http.put<any>(`${API_URL}/activos/${id}/tolerance`, config);
  }

  // ============================================================
  // Apetito de Riesgo (usando Backend HTTP)
  // ============================================================

  getRiskAppetites(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/activos/risk-appetites`);
  }

  createRiskAppetite(data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/activos/risk-appetites`, data);
  }

  assignRiskAppetite(activoId: string, riskAppetiteId: string): Observable<any> {
    return this.http.put<any>(`${API_URL}/activos/${activoId}/risk-appetite`, { riskAppetiteId });
  }

  // ============================================================
  // Grafo de Relaciones de Activo (usando Backend HTTP)
  // ============================================================

  getActivoGraph(id: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/activos/${id}/graph`);
  }
}
