// ============================================================
// Modelos para el módulo de Usuarios y Roles (RBAC)
// ============================================================

// Estados posibles de un usuario
export type EstadoUsuario = 'activo' | 'inactivo' | 'pendiente' | 'bloqueado';

// Niveles de acceso para roles
export type NivelAcceso = 'lectura' | 'escritura' | 'admin' | 'super_admin';

// Regiones disponibles
export type Region = 'MX' | 'US' | 'EU' | 'LATAM' | 'GLOBAL';

// ============================================================
// Interfaces de Usuario
// ============================================================

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  avatar?: string;
  estado: EstadoUsuario;
  fechaCreacion: Date;
  fechaExpiracion?: Date;
  ultimoAcceso?: Date;
  roles: string[]; // IDs de roles asignados
  activosAcceso: string[]; // IDs de activos a los que tiene acceso
  departamento?: string;
  cargo?: string;
  region?: Region;
  configuracionSeguridad: ConfiguracionSeguridad;
}

export interface ConfiguracionSeguridad {
  autenticacionDosFactor: boolean;
  cambioPasswordRequerido: boolean;
  sesionesActivas: number;
  maxSesionesPermitidas: number;
  ultimoCambioPassword?: Date;
  intentosFallidos: number;
}

export interface UsuarioFormData {
  // Paso 1: Información Básica
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  departamento: string;
  cargo: string;

  // Paso 2: Estado de la Cuenta
  estado: EstadoUsuario;
  fechaExpiracion: Date | null;

  // Paso 3: Acceso de Activos
  activosSeleccionados: string[];

  // Paso 4: Configuración de Seguridad
  rolesAsignados: string[];
  autenticacionDosFactor: boolean;
  cambioPasswordRequerido: boolean;
}

// ============================================================
// Interfaces de Rol
// ============================================================

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  nivelAcceso: NivelAcceso;
  region: Region;
  tipoArbol: 'activos' | 'procesos' | 'ambos';
  permisos: string[]; // IDs de permisos asignados
  usuariosAsignados: string[]; // IDs de usuarios con este rol
  fechaCreacion: Date;
  fechaModificacion: Date;
  activo: boolean;
  esRolSistema: boolean; // Roles que no se pueden eliminar
  color?: string;
  icono?: string;
}

export interface RolFormData {
  nombre: string;
  descripcion: string;
  nivelAcceso: NivelAcceso;
  region: Region;
  tipoArbol: 'activos' | 'procesos' | 'ambos';
  permisosSeleccionados: string[];
  activo: boolean;
}

// ============================================================
// Interfaces de Permisos
// ============================================================

export interface Permiso {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  categoria: CategoriaPermiso;
  hijos?: Permiso[];
  padre?: string;
  activo: boolean;
}

export type CategoriaPermiso =
  | 'gestion_usuarios'
  | 'gestion_roles'
  | 'gestion_activos'
  | 'gestion_procesos'
  | 'gestion_riesgos'
  | 'gestion_cumplimiento'
  | 'reportes'
  | 'configuracion'
  | 'auditoria';

export interface ModuloPermisos {
  id: string;
  nombre: string;
  icono: string;
  permisos: Permiso[];
}

// ============================================================
// Interfaces de Activos (Árbol de acceso)
// ============================================================

export interface ActivoAcceso {
  id: string;
  nombre: string;
  tipo: 'carpeta' | 'archivo' | 'configuracion' | 'proceso';
  icono: string;
  hijos?: ActivoAcceso[];
  padre?: string;
  nivelAcceso?: NivelAcceso;
  expanded?: boolean;
  seleccionado?: boolean;
  parcialmenteSeleccionado?: boolean;
}

// ============================================================
// Interfaces de Auditoría
// ============================================================

export interface LogAuditoria {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  accion: AccionAuditoria;
  entidad: 'usuario' | 'rol' | 'permiso' | 'activo';
  entidadId: string;
  entidadNombre: string;
  detalles: string;
  fecha: Date;
  ip?: string;
  userAgent?: string;
}

export type AccionAuditoria =
  | 'crear'
  | 'modificar'
  | 'eliminar'
  | 'asignar_rol'
  | 'remover_rol'
  | 'asignar_permiso'
  | 'remover_permiso'
  | 'activar'
  | 'desactivar'
  | 'login'
  | 'logout'
  | 'cambio_password';

// ============================================================
// Interfaces de Filtros y Paginación
// ============================================================

export interface FiltrosUsuario {
  busqueda: string;
  estado: EstadoUsuario | null;
  rol: string | null;
  departamento: string | null;
  region: Region | null;
}

export interface FiltrosRol {
  busqueda: string;
  nivelAcceso: NivelAcceso | null;
  activo: boolean | null;
  region: Region | null;
}

export interface PaginacionConfig {
  pagina: number;
  filasPorPagina: number;
  totalRegistros: number;
  opcionesFilas: number[];
}

// ============================================================
// Interfaces de Estadísticas
// ============================================================

export interface EstadisticasUsuarios {
  total: number;
  activos: number;
  inactivos: number;
  pendientes: number;
  bloqueados: number;
  conDosFactor: number;
  sinRoles: number;
}

export interface EstadisticasRoles {
  total: number;
  activos: number;
  inactivos: number;
  rolesSistema: number;
  rolesPersonalizados: number;
  promedioUsuariosPorRol: number;
}

// ============================================================
// Opciones para Selectores
// ============================================================

export const ESTADOS_USUARIO: { label: string; value: EstadoUsuario; severity: string }[] = [
  { label: 'Activo', value: 'activo', severity: 'success' },
  { label: 'Inactivo', value: 'inactivo', severity: 'danger' },
  { label: 'Pendiente', value: 'pendiente', severity: 'warn' },
  { label: 'Bloqueado', value: 'bloqueado', severity: 'danger' }
];

export const NIVELES_ACCESO: { label: string; value: NivelAcceso; severity: string }[] = [
  { label: 'Lectura', value: 'lectura', severity: 'info' },
  { label: 'Escritura', value: 'escritura', severity: 'success' },
  { label: 'Administrador', value: 'admin', severity: 'warn' },
  { label: 'Super Admin', value: 'super_admin', severity: 'danger' }
];

export const REGIONES: { label: string; value: Region }[] = [
  { label: 'México', value: 'MX' },
  { label: 'Estados Unidos', value: 'US' },
  { label: 'Europa', value: 'EU' },
  { label: 'Latinoamérica', value: 'LATAM' },
  { label: 'Global', value: 'GLOBAL' }
];

export const CATEGORIAS_PERMISO: { label: string; value: CategoriaPermiso; icono: string }[] = [
  { label: 'Gestión de Usuarios', value: 'gestion_usuarios', icono: 'pi-users' },
  { label: 'Gestión de Roles', value: 'gestion_roles', icono: 'pi-shield' },
  { label: 'Gestión de Activos', value: 'gestion_activos', icono: 'pi-box' },
  { label: 'Gestión de Procesos', value: 'gestion_procesos', icono: 'pi-sitemap' },
  { label: 'Gestión de Riesgos', value: 'gestion_riesgos', icono: 'pi-exclamation-triangle' },
  { label: 'Gestión de Cumplimiento', value: 'gestion_cumplimiento', icono: 'pi-check-circle' },
  { label: 'Reportes', value: 'reportes', icono: 'pi-chart-bar' },
  { label: 'Configuración', value: 'configuracion', icono: 'pi-cog' },
  { label: 'Auditoría', value: 'auditoria', icono: 'pi-history' }
];
