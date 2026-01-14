import { Injectable, signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service';
import {
  Usuario,
  Rol,
  Permiso,
  ActivoAcceso,
  LogAuditoria,
  EstadoUsuario,
  NivelAcceso,
  ModuloPermisos,
  EstadisticasUsuarios,
  EstadisticasRoles,
  UsuarioFormData,
  RolFormData
} from '../models/usuarios-roles.models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosRolesService {
  private api = inject(ApiService);

  // ============================================================
  // Signals de Estado
  // ============================================================

  private _usuarios = signal<Usuario[]>([]);
  private _roles = signal<Rol[]>([]);
  private _permisos = signal<Permiso[]>([]);
  private _activos = signal<ActivoAcceso[]>([]);
  private _logsAuditoria = signal<LogAuditoria[]>([]);
  private _estadisticasUsuarios = signal<EstadisticasUsuarios>({
    total: 0, activos: 0, inactivos: 0, pendientes: 0, bloqueados: 0, conDosFactor: 0, sinRoles: 0
  });
  private _estadisticasRoles = signal<EstadisticasRoles>({
    total: 0, activos: 0, inactivos: 0, rolesSistema: 0, rolesPersonalizados: 0, promedioUsuariosPorRol: 0
  });
  private _isLoading = signal(false);

  // Señales públicas de solo lectura
  readonly usuarios = this._usuarios.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly permisos = this._permisos.asReadonly();
  readonly activos = this._activos.asReadonly();
  readonly logsAuditoria = this._logsAuditoria.asReadonly();
  readonly estadisticasUsuarios = this._estadisticasUsuarios.asReadonly();
  readonly estadisticasRoles = this._estadisticasRoles.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // ============================================================
  // Computeds
  // ============================================================

  readonly modulosPermisos = computed<ModuloPermisos[]>(() => {
    const permisos = this._permisos();
    const modulos: Record<string, ModuloPermisos> = {};

    permisos.forEach(permiso => {
      if (!modulos[permiso.modulo]) {
        modulos[permiso.modulo] = {
          id: permiso.modulo,
          nombre: this.formatModuloNombre(permiso.modulo),
          icono: this.getModuloIcono(permiso.modulo),
          permisos: []
        };
      }
      modulos[permiso.modulo].permisos.push(permiso);
    });

    return Object.values(modulos);
  });

  constructor() {
    // Cargar datos iniciales
    this.cargarDatos();
  }

  // ============================================================
  // Carga de Datos
  // ============================================================

  async cargarDatos(): Promise<void> {
    this._isLoading.set(true);
    try {
      await Promise.all([
        this.cargarUsuarios(),
        this.cargarRoles(),
        this.cargarPermisos(),
        this.cargarActivos(),
        this.cargarEstadisticas()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  async cargarUsuarios(): Promise<void> {
    try {
      const usuarios = await firstValueFrom(this.api.getUsuarios());
      this._usuarios.set(usuarios.map(u => this.mapearUsuario(u)));
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  async cargarRoles(): Promise<void> {
    try {
      const roles = await firstValueFrom(this.api.getRoles());
      this._roles.set(roles.map(r => this.mapearRol(r)));
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  }

  async cargarPermisos(): Promise<void> {
    try {
      const permisos = await firstValueFrom(this.api.getPermisos());
      this._permisos.set(permisos);
    } catch (error) {
      console.error('Error cargando permisos:', error);
    }
  }

  async cargarActivos(): Promise<void> {
    try {
      const activos = await firstValueFrom(this.api.getActivos());
      this._activos.set(activos.map(a => this.mapearActivo(a)));
    } catch (error) {
      console.error('Error cargando activos:', error);
    }
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      const [estUsuarios, estRoles] = await Promise.all([
        firstValueFrom(this.api.getEstadisticasUsuarios()),
        firstValueFrom(this.api.getEstadisticasRoles())
      ]);
      this._estadisticasUsuarios.set(estUsuarios);
      this._estadisticasRoles.set(estRoles);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  // ============================================================
  // Métodos CRUD de Usuarios
  // ============================================================

  getUsuarioById(id: string): Usuario | undefined {
    return this._usuarios().find(u => u.id === id);
  }

  async crearUsuario(formData: UsuarioFormData): Promise<Usuario> {
    const nuevoUsuario = await firstValueFrom(this.api.createUsuario(formData));
    await this.cargarUsuarios();
    await this.cargarEstadisticas();
    return this.mapearUsuario(nuevoUsuario);
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<Usuario | null> {
    const usuarioActualizado = await firstValueFrom(this.api.updateUsuario(id, datos));
    await this.cargarUsuarios();
    return this.mapearUsuario(usuarioActualizado);
  }

  async eliminarUsuario(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.deleteUsuario(id));
      await this.cargarUsuarios();
      await this.cargarEstadisticas();
      return true;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return false;
    }
  }

  async cambiarEstadoUsuario(id: string, estado: EstadoUsuario): Promise<void> {
    await firstValueFrom(this.api.cambiarEstadoUsuario(id, estado));
    await this.cargarUsuarios();
    await this.cargarEstadisticas();
  }

  // ============================================================
  // Métodos CRUD de Roles
  // ============================================================

  getRolById(id: string): Rol | undefined {
    return this._roles().find(r => r.id === id);
  }

  async crearRol(formData: RolFormData): Promise<Rol> {
    const nuevoRol = await firstValueFrom(this.api.createRol(formData));
    await this.cargarRoles();
    await this.cargarEstadisticas();
    return this.mapearRol(nuevoRol);
  }

  async actualizarRol(id: string, datos: Partial<Rol>): Promise<Rol | null> {
    const rolActualizado = await firstValueFrom(this.api.updateRol(id, datos));
    await this.cargarRoles();
    return this.mapearRol(rolActualizado);
  }

  async eliminarRol(id: string): Promise<boolean> {
    try {
      await firstValueFrom(this.api.deleteRol(id));
      await this.cargarRoles();
      await this.cargarEstadisticas();
      return true;
    } catch (error) {
      console.error('Error eliminando rol:', error);
      return false;
    }
  }

  async duplicarRol(id: string): Promise<Rol | null> {
    try {
      const rolDuplicado = await firstValueFrom(this.api.duplicarRol(id));
      await this.cargarRoles();
      return this.mapearRol(rolDuplicado);
    } catch (error) {
      console.error('Error duplicando rol:', error);
      return null;
    }
  }

  // ============================================================
  // Métodos de Asignación
  // ============================================================

  async asignarUsuarioARol(usuarioId: string, rolId: string): Promise<void> {
    await firstValueFrom(this.api.asignarRolAUsuario(usuarioId, rolId));
    await Promise.all([this.cargarUsuarios(), this.cargarRoles()]);
  }

  async removerUsuarioDeRol(usuarioId: string, rolId: string): Promise<void> {
    await firstValueFrom(this.api.removerRolDeUsuario(usuarioId, rolId));
    await Promise.all([this.cargarUsuarios(), this.cargarRoles()]);
  }

  // ============================================================
  // Métodos de Permisos
  // ============================================================

  getPermisosDeRol(rolId: string): Permiso[] {
    const rol = this.getRolById(rolId);
    if (!rol) return [];
    return this._permisos().filter(p => rol.permisos.includes(p.id));
  }

  getPermisosDeUsuario(usuarioId: string): Permiso[] {
    const usuario = this.getUsuarioById(usuarioId);
    if (!usuario) return [];

    const permisosIds = new Set<string>();

    usuario.roles.forEach(rolId => {
      const rol = this.getRolById(rolId);
      if (rol) {
        rol.permisos.forEach(permisoId => permisosIds.add(permisoId));
      }
    });

    return this._permisos().filter(p => permisosIds.has(p.id));
  }

  // ============================================================
  // Helpers
  // ============================================================

  private formatModuloNombre(modulo: string): string {
    return modulo
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getModuloIcono(modulo: string): string {
    const iconos: Record<string, string> = {
      usuarios: 'pi-users',
      roles: 'pi-shield',
      organizaciones: 'pi-building',
      activos: 'pi-box',
      procesos: 'pi-sitemap',
      riesgos: 'pi-exclamation-triangle',
      cumplimiento: 'pi-check-circle',
      reportes: 'pi-chart-bar',
      configuracion: 'pi-cog',
      auditoria: 'pi-history'
    };
    return iconos[modulo] || 'pi-circle';
  }

  getRolesDeUsuario(usuarioId: string): Rol[] {
    const usuario = this.getUsuarioById(usuarioId);
    if (!usuario) return [];
    return this._roles().filter(r => usuario.roles.includes(r.id));
  }

  getUsuariosDeRol(rolId: string): Usuario[] {
    const rol = this.getRolById(rolId);
    if (!rol) return [];
    return this._usuarios().filter(u => rol.usuariosAsignados.includes(u.id));
  }

  // ============================================================
  // Mappers
  // ============================================================

  private mapearUsuario(u: any): Usuario {
    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      telefono: u.telefono,
      avatar: u.avatar,
      estado: u.estado as EstadoUsuario,
      fechaCreacion: new Date(u.fechaCreacion),
      fechaExpiracion: u.fechaExpiracion ? new Date(u.fechaExpiracion) : undefined,
      ultimoAcceso: u.ultimoAcceso ? new Date(u.ultimoAcceso) : undefined,
      roles: u.roles || [],
      activosAcceso: u.activosAcceso || [],
      departamento: u.departamento,
      cargo: u.cargo,
      region: u.region,
      configuracionSeguridad: u.configuracionSeguridad || {
        autenticacionDosFactor: u.autenticacionDosFactor || false,
        cambioPasswordRequerido: u.cambioPasswordRequerido || false,
        sesionesActivas: u.sesionesActivas || 0,
        maxSesionesPermitidas: u.maxSesionesPermitidas || 3,
        ultimoCambioPassword: u.ultimoCambioPassword ? new Date(u.ultimoCambioPassword) : undefined,
        intentosFallidos: u.intentosFallidos || 0
      }
    };
  }

  private mapearRol(r: any): Rol {
    return {
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      nivelAcceso: r.nivelAcceso as NivelAcceso,
      region: r.region,
      tipoArbol: r.tipoArbol,
      permisos: r.permisos || [],
      usuariosAsignados: r.usuariosAsignados || [],
      fechaCreacion: new Date(r.fechaCreacion),
      fechaModificacion: new Date(r.fechaModificacion),
      activo: r.activo,
      esRolSistema: r.esRolSistema,
      color: r.color,
      icono: r.icono
    };
  }

  private mapearActivo(a: any): ActivoAcceso {
    return {
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo,
      icono: a.icono,
      hijos: a.hijos ? a.hijos.map((h: any) => this.mapearActivo(h)) : undefined,
      padre: a.padreId,
      nivelAcceso: a.nivelAcceso,
      expanded: a.expanded
    };
  }
}
