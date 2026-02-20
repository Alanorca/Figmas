// Seed data for IndexedDB - migrated from backend/prisma/seed.js

// ============================================================
// Permisos
// ============================================================
export const permisos = [
  { id: 'perm-001', codigo: 'USR_VIEW', nombre: 'Ver Usuarios', descripcion: 'Permite visualizar la lista de usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' },
  { id: 'perm-002', codigo: 'USR_CREATE', nombre: 'Crear Usuarios', descripcion: 'Permite crear nuevos usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' },
  { id: 'perm-003', codigo: 'USR_EDIT', nombre: 'Editar Usuarios', descripcion: 'Permite modificar usuarios existentes', modulo: 'usuarios', categoria: 'gestion_usuarios' },
  { id: 'perm-004', codigo: 'USR_DELETE', nombre: 'Eliminar Usuarios', descripcion: 'Permite eliminar usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' },
  { id: 'perm-005', codigo: 'ROL_VIEW', nombre: 'Ver Roles', descripcion: 'Permite visualizar roles y permisos', modulo: 'roles', categoria: 'gestion_roles' },
  { id: 'perm-006', codigo: 'ROL_CREATE', nombre: 'Crear Roles', descripcion: 'Permite crear nuevos roles', modulo: 'roles', categoria: 'gestion_roles' },
  { id: 'perm-007', codigo: 'ROL_EDIT', nombre: 'Editar Roles', descripcion: 'Permite modificar roles existentes', modulo: 'roles', categoria: 'gestion_roles' },
  { id: 'perm-008', codigo: 'ROL_DELETE', nombre: 'Eliminar Roles', descripcion: 'Permite eliminar roles', modulo: 'roles', categoria: 'gestion_roles' },
  { id: 'perm-009', codigo: 'ORG_VIEW', nombre: 'Ver Organizaciones', descripcion: 'Permite visualizar organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' },
  { id: 'perm-010', codigo: 'ORG_CREATE', nombre: 'Crear Organizaciones', descripcion: 'Permite crear nuevas organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' },
  { id: 'perm-011', codigo: 'ORG_EDIT', nombre: 'Editar Organizaciones', descripcion: 'Permite modificar organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' },
  { id: 'perm-012', codigo: 'ACT_VIEW', nombre: 'Ver Activos', descripcion: 'Permite ver activos de información', modulo: 'activos', categoria: 'gestion_activos' },
  { id: 'perm-013', codigo: 'ACT_MANAGE', nombre: 'Gestionar Activos', descripcion: 'Permite gestionar activos de información', modulo: 'activos', categoria: 'gestion_activos' },
  { id: 'perm-014', codigo: 'RSK_VIEW', nombre: 'Ver Riesgos', descripcion: 'Permite visualizar el inventario de riesgos', modulo: 'riesgos', categoria: 'gestion_riesgos' },
  { id: 'perm-015', codigo: 'RSK_EDIT', nombre: 'Gestionar Riesgos', descripcion: 'Permite crear y modificar riesgos', modulo: 'riesgos', categoria: 'gestion_riesgos' },
  { id: 'perm-016', codigo: 'INC_VIEW', nombre: 'Ver Incidentes', descripcion: 'Permite ver incidentes de seguridad', modulo: 'incidentes', categoria: 'gestion_incidentes' },
  { id: 'perm-017', codigo: 'INC_MANAGE', nombre: 'Gestionar Incidentes', descripcion: 'Permite gestionar incidentes', modulo: 'incidentes', categoria: 'gestion_incidentes' },
  { id: 'perm-018', codigo: 'CMP_VIEW', nombre: 'Ver Cumplimiento', descripcion: 'Acceso a módulo de cumplimiento', modulo: 'cumplimiento', categoria: 'gestion_cumplimiento' },
  { id: 'perm-019', codigo: 'CMP_MANAGE', nombre: 'Gestionar Cumplimiento', descripcion: 'Gestión completa de cuestionarios y evaluaciones', modulo: 'cumplimiento', categoria: 'gestion_cumplimiento' },
  { id: 'perm-020', codigo: 'PRC_VIEW', nombre: 'Ver Procesos', descripcion: 'Permite ver procesos', modulo: 'procesos', categoria: 'gestion_procesos' },
  { id: 'perm-021', codigo: 'PRC_MANAGE', nombre: 'Gestionar Procesos', descripcion: 'Permite gestionar procesos', modulo: 'procesos', categoria: 'gestion_procesos' },
  { id: 'perm-022', codigo: 'AUD_VIEW', nombre: 'Ver Auditorías', descripcion: 'Acceso a informes de auditoría', modulo: 'auditoria', categoria: 'auditoria' },
  { id: 'perm-023', codigo: 'AUD_EXPORT', nombre: 'Exportar Auditorías', descripcion: 'Permite exportar logs de auditoría', modulo: 'auditoria', categoria: 'auditoria' },
  { id: 'perm-024', codigo: 'RPT_VIEW', nombre: 'Ver Reportes', descripcion: 'Acceso a reportes y dashboards', modulo: 'reportes', categoria: 'reportes' },
  { id: 'perm-025', codigo: 'RPT_EXPORT', nombre: 'Exportar Reportes', descripcion: 'Permite exportar reportes', modulo: 'reportes', categoria: 'reportes' },
];

// ============================================================
// Módulos
// ============================================================
export const modulos = [
  { id: 'mod-001', nombre: 'Dashboard', descripcion: 'Panel principal de indicadores', icono: 'pi-chart-bar', orden: 0, permisoCreacion: false, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false },
  { id: 'mod-002', nombre: 'Usuarios', descripcion: 'Gestión de usuarios del sistema', icono: 'pi-users', orden: 1, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true },
  { id: 'mod-003', nombre: 'Roles', descripcion: 'Gestión de roles y permisos', icono: 'pi-shield', orden: 2, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true },
  { id: 'mod-004', nombre: 'Activos', descripcion: 'Gestión de activos de información', icono: 'pi-box', orden: 3, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true },
  { id: 'mod-005', nombre: 'Riesgos', descripcion: 'Gestión de riesgos', icono: 'pi-exclamation-triangle', orden: 4, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true },
  { id: 'mod-006', nombre: 'Incidentes', descripcion: 'Gestión de incidentes de seguridad', icono: 'pi-bolt', orden: 5, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false },
  { id: 'mod-007', nombre: 'Cumplimiento', descripcion: 'Gestión de cumplimiento normativo', icono: 'pi-check-circle', orden: 6, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false },
  { id: 'mod-008', nombre: 'Procesos', descripcion: 'Gestión de procesos de negocio', icono: 'pi-sitemap', orden: 7, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true },
];

// ============================================================
// Roles
// ============================================================
export const roles = [
  { id: 'rol-001', nombre: 'Admin Backoffice', descripcion: 'Administrador técnico con acceso total al sistema y configuraciones.', nivelAcceso: 'super_admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#7c3aed', icono: 'pi-server', esRolSistema: true, activo: true },
  { id: 'rol-002', nombre: 'Administrador', descripcion: 'Administrador de la organización con gestión de usuarios, roles y configuración.', nivelAcceso: 'super_admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#ef4444', icono: 'pi-shield', esRolSistema: true, activo: true },
  { id: 'rol-003', nombre: 'Gestor Áreas', descripcion: 'Responsable de la gestión de áreas, activos y procesos de su departamento.', nivelAcceso: 'admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#3b82f6', icono: 'pi-th-large', esRolSistema: true, activo: true },
  { id: 'rol-004', nombre: 'Director', descripcion: 'Nivel directivo con visión estratégica, aprobaciones y acceso a reportes ejecutivos.', nivelAcceso: 'admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#dc2626', icono: 'pi-briefcase', esRolSistema: true, activo: true },
  { id: 'rol-005', nombre: 'Coordinador', descripcion: 'Coordinación de equipos, seguimiento de tareas y gestión operativa.', nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'ambos', color: '#f59e0b', icono: 'pi-users', esRolSistema: true, activo: true },
  { id: 'rol-006', nombre: 'Gerente', descripcion: 'Gestión de área específica con responsabilidad sobre procesos y riesgos.', nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'ambos', color: '#22c55e', icono: 'pi-id-card', esRolSistema: true, activo: true },
  { id: 'rol-007', nombre: 'Analista', descripcion: 'Análisis de información, ejecución de tareas y registro de datos.', nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'activos', color: '#0891b2', icono: 'pi-search', esRolSistema: true, activo: true },
  { id: 'rol-008', nombre: 'Invitado', descripcion: 'Usuario externo que solo puede responder cuestionarios asignados.', nivelAcceso: 'lectura', region: 'MX', tipoArbol: 'activos', color: '#64748b', icono: 'pi-user', esRolSistema: true, activo: true },
];

// ============================================================
// Roles - Permisos
// ============================================================
const allPermisoIds = permisos.map(p => p.id);
const gestorAreasPermisos = ['perm-001', 'perm-005', 'perm-009', 'perm-010', 'perm-011', 'perm-012', 'perm-013', 'perm-014', 'perm-015', 'perm-016', 'perm-017', 'perm-018', 'perm-019', 'perm-022', 'perm-024', 'perm-025'];
const directorPermisos = ['perm-001', 'perm-005', 'perm-009', 'perm-012', 'perm-014', 'perm-016', 'perm-018', 'perm-019', 'perm-022', 'perm-023', 'perm-024', 'perm-025'];
const coordinadorPermisos = ['perm-009', 'perm-012', 'perm-013', 'perm-014', 'perm-015', 'perm-016', 'perm-017', 'perm-018', 'perm-019', 'perm-024', 'perm-025'];
const gerentePermisos = ['perm-009', 'perm-012', 'perm-014', 'perm-015', 'perm-016', 'perm-017', 'perm-018', 'perm-020', 'perm-021', 'perm-024', 'perm-025'];
const analistaPermisos = ['perm-009', 'perm-012', 'perm-014', 'perm-015', 'perm-016', 'perm-017', 'perm-018', 'perm-024'];
const invitadoPermisos = ['perm-018'];

export const rolesPermisos: { rolId: string; permisoId: string }[] = [
  ...allPermisoIds.map(permisoId => ({ rolId: 'rol-001', permisoId })),
  ...allPermisoIds.map(permisoId => ({ rolId: 'rol-002', permisoId })),
  ...gestorAreasPermisos.map(permisoId => ({ rolId: 'rol-003', permisoId })),
  ...directorPermisos.map(permisoId => ({ rolId: 'rol-004', permisoId })),
  ...coordinadorPermisos.map(permisoId => ({ rolId: 'rol-005', permisoId })),
  ...gerentePermisos.map(permisoId => ({ rolId: 'rol-006', permisoId })),
  ...analistaPermisos.map(permisoId => ({ rolId: 'rol-007', permisoId })),
  ...invitadoPermisos.map(permisoId => ({ rolId: 'rol-008', permisoId })),
];

// ============================================================
// Usuarios
// ============================================================
export const usuarios = [
  { id: 'usr-001', nombre: 'Ricardo', apellido: 'Salinas Pliego', email: 'rsalinas@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0001', estado: 'activo', departamento: 'Dirección General', cargo: 'Director General (CEO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-002', nombre: 'María Elena', apellido: 'Gutiérrez Vega', email: 'mgutierrez@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0002', estado: 'activo', departamento: 'Riesgos', cargo: 'Directora de Riesgos (CRO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-003', nombre: 'Carlos', apellido: 'Hernández Mora', email: 'chernandez@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0003', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Oficial de Cumplimiento (CCO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-004', nombre: 'Roberto', apellido: 'Torres Ramírez', email: 'rtorres@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0004', estado: 'activo', departamento: 'Seguridad de Información', cargo: 'Oficial de Seguridad (CISO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-005', nombre: 'Ana Patricia', apellido: 'López García', email: 'alopez@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0005', estado: 'activo', departamento: 'Riesgos', cargo: 'Analista Senior de Riesgos', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-006', nombre: 'Fernando', apellido: 'Castillo Núñez', email: 'fcastillo@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0006', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Analista de Cumplimiento', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-007', nombre: 'Laura', apellido: 'Mendoza Díaz', email: 'lmendoza@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0007', estado: 'activo', departamento: 'Auditoría Interna', cargo: 'Auditora Interna Senior', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-008', nombre: 'Jorge', apellido: 'Vargas Luna', email: 'jvargas@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0008', estado: 'activo', departamento: 'Sucursal Centro', cargo: 'Gerente de Sucursal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-009', nombre: 'Patricia', apellido: 'Reyes Solís', email: 'preyes@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0009', estado: 'activo', departamento: 'PLD/AML', cargo: 'Oficial PLD/AML', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-010', nombre: 'Miguel', apellido: 'Ángel Ruiz', email: 'maruiz@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0010', estado: 'activo', departamento: 'Riesgos', cargo: 'Analista de Riesgos Jr.', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-011', nombre: 'Guadalupe', apellido: 'Flores Ortiz', email: 'gflores@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0011', estado: 'activo', departamento: 'Operaciones', cargo: 'Cajera Principal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-012', nombre: 'Alejandro', apellido: 'Moreno Vega', email: 'amoreno@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0012', estado: 'pendiente', departamento: 'TI', cargo: 'Administrador de Sistemas', region: 'MX', cambioPasswordRequerido: true, createdAt: new Date().toISOString() },
  { id: 'usr-013', nombre: 'Sofía', apellido: 'Delgado Cruz', email: 'sdelgado@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0013', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Coordinadora de Cumplimiento', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: 'usr-014', nombre: 'Daniel', apellido: 'Jiménez Pérez', email: 'djimenez@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0014', estado: 'inactivo', departamento: 'Riesgos', cargo: 'Analista de Riesgos', region: 'MX', createdAt: new Date().toISOString() },
  { id: 'usr-015', nombre: 'Verónica', apellido: 'Sánchez Martínez', email: 'vsanchez@bancoglobal.mx', password: 'hashed', telefono: '+52 55 1234 0015', estado: 'activo', departamento: 'Sucursal Norte', cargo: 'Gerente de Sucursal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date().toISOString(), createdAt: new Date().toISOString() },
];

// ============================================================
// Usuarios - Roles
// ============================================================
export const usuariosRoles = [
  { usuarioId: 'usr-001', rolId: 'rol-002' },
  { usuarioId: 'usr-002', rolId: 'rol-004' },
  { usuarioId: 'usr-003', rolId: 'rol-004' },
  { usuarioId: 'usr-004', rolId: 'rol-001' },
  { usuarioId: 'usr-004', rolId: 'rol-003' },
  { usuarioId: 'usr-005', rolId: 'rol-007' },
  { usuarioId: 'usr-006', rolId: 'rol-007' },
  { usuarioId: 'usr-007', rolId: 'rol-005' },
  { usuarioId: 'usr-008', rolId: 'rol-006' },
  { usuarioId: 'usr-009', rolId: 'rol-005' },
  { usuarioId: 'usr-010', rolId: 'rol-007' },
  { usuarioId: 'usr-011', rolId: 'rol-008' },
  { usuarioId: 'usr-013', rolId: 'rol-005' },
  { usuarioId: 'usr-015', rolId: 'rol-006' },
];

// ============================================================
// Catálogos
// ============================================================
export const catalogos = [
  { id: 'cat-001', tipo: 'tipoActivo', codigo: 'hardware', nombre: 'Hardware', orden: 1, icono: 'computer', color: '#3b82f6', activo: true, metadata: '{}' },
  { id: 'cat-002', tipo: 'tipoActivo', codigo: 'software', nombre: 'Software', orden: 2, icono: 'code', color: '#8b5cf6', activo: true, metadata: '{}' },
  { id: 'cat-003', tipo: 'tipoActivo', codigo: 'datos', nombre: 'Datos', orden: 3, icono: 'database', color: '#06b6d4', activo: true, metadata: '{}' },
  { id: 'cat-004', tipo: 'tipoActivo', codigo: 'red', nombre: 'Infraestructura de Red', orden: 4, icono: 'lan', color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-005', tipo: 'tipoActivo', codigo: 'personas', nombre: 'Personas', orden: 5, icono: 'people', color: '#22c55e', activo: true, metadata: '{}' },
  { id: 'cat-006', tipo: 'tipoActivo', codigo: 'instalaciones', nombre: 'Instalaciones', orden: 6, icono: 'business', color: '#64748b', activo: true, metadata: '{}' },
  { id: 'cat-007', tipo: 'tipoActivo', codigo: 'servicios', nombre: 'Servicios Financieros', orden: 7, icono: 'account_balance', color: '#dc2626', activo: true, metadata: '{}' },
  { id: 'cat-008', tipo: 'criticidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d', activo: true, metadata: '{}' },
  { id: 'cat-009', tipo: 'criticidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626', activo: true, metadata: '{}' },
  { id: 'cat-010', tipo: 'criticidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-011', tipo: 'criticidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e', activo: true, metadata: '{}' },
  { id: 'cat-012', tipo: 'severidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d', activo: true, metadata: '{}' },
  { id: 'cat-013', tipo: 'severidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626', activo: true, metadata: '{}' },
  { id: 'cat-014', tipo: 'severidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-015', tipo: 'severidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e', activo: true, metadata: '{}' },
  { id: 'cat-016', tipo: 'estadoRiesgo', codigo: 'identificado', nombre: 'Identificado', orden: 1, color: '#6366f1', activo: true, metadata: '{}' },
  { id: 'cat-017', tipo: 'estadoRiesgo', codigo: 'evaluado', nombre: 'Evaluado', orden: 2, color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-018', tipo: 'estadoRiesgo', codigo: 'en_tratamiento', nombre: 'En Tratamiento', orden: 3, color: '#3b82f6', activo: true, metadata: '{}' },
  { id: 'cat-019', tipo: 'estadoRiesgo', codigo: 'mitigado', nombre: 'Mitigado', orden: 4, color: '#22c55e', activo: true, metadata: '{}' },
  { id: 'cat-020', tipo: 'estadoRiesgo', codigo: 'aceptado', nombre: 'Aceptado', orden: 5, color: '#64748b', activo: true, metadata: '{}' },
  { id: 'cat-021', tipo: 'estadoRiesgo', codigo: 'transferido', nombre: 'Transferido', orden: 6, color: '#8b5cf6', activo: true, metadata: '{}' },
  { id: 'cat-022', tipo: 'estadoIncidente', codigo: 'reportado', nombre: 'Reportado', orden: 1, color: '#ef4444', activo: true, metadata: '{}' },
  { id: 'cat-023', tipo: 'estadoIncidente', codigo: 'en_investigacion', nombre: 'En Investigación', orden: 2, color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-024', tipo: 'estadoIncidente', codigo: 'en_contencion', nombre: 'En Contención', orden: 3, color: '#3b82f6', activo: true, metadata: '{}' },
  { id: 'cat-025', tipo: 'estadoIncidente', codigo: 'resuelto', nombre: 'Resuelto', orden: 4, color: '#22c55e', activo: true, metadata: '{}' },
  { id: 'cat-026', tipo: 'estadoIncidente', codigo: 'cerrado', nombre: 'Cerrado', orden: 5, color: '#64748b', activo: true, metadata: '{}' },
  { id: 'cat-027', tipo: 'tipoIncidente', codigo: 'fraude', nombre: 'Fraude', orden: 1, color: '#dc2626', activo: true, metadata: '{}' },
  { id: 'cat-028', tipo: 'tipoIncidente', codigo: 'ciberataque', nombre: 'Ciberataque', orden: 2, color: '#7c3aed', activo: true, metadata: '{}' },
  { id: 'cat-029', tipo: 'tipoIncidente', codigo: 'fuga_datos', nombre: 'Fuga de Datos', orden: 3, color: '#be185d', activo: true, metadata: '{}' },
  { id: 'cat-030', tipo: 'tipoIncidente', codigo: 'indisponibilidad', nombre: 'Indisponibilidad de Servicio', orden: 4, color: '#f59e0b', activo: true, metadata: '{}' },
  { id: 'cat-031', tipo: 'tipoIncidente', codigo: 'error_operativo', nombre: 'Error Operativo', orden: 5, color: '#0891b2', activo: true, metadata: '{}' },
  { id: 'cat-032', tipo: 'departamento', codigo: 'direccion', nombre: 'Dirección General', orden: 1, activo: true, metadata: '{}' },
  { id: 'cat-033', tipo: 'departamento', codigo: 'riesgos', nombre: 'Gestión de Riesgos', orden: 2, activo: true, metadata: '{}' },
  { id: 'cat-034', tipo: 'departamento', codigo: 'cumplimiento', nombre: 'Cumplimiento Normativo', orden: 3, activo: true, metadata: '{}' },
  { id: 'cat-035', tipo: 'departamento', codigo: 'seguridad', nombre: 'Seguridad de Información', orden: 4, activo: true, metadata: '{}' },
  { id: 'cat-036', tipo: 'departamento', codigo: 'auditoria', nombre: 'Auditoría Interna', orden: 5, activo: true, metadata: '{}' },
  { id: 'cat-037', tipo: 'departamento', codigo: 'operaciones', nombre: 'Operaciones Bancarias', orden: 6, activo: true, metadata: '{}' },
  { id: 'cat-038', tipo: 'departamento', codigo: 'ti', nombre: 'Tecnología de Información', orden: 7, activo: true, metadata: '{}' },
  { id: 'cat-039', tipo: 'departamento', codigo: 'credito', nombre: 'Crédito y Cobranza', orden: 8, activo: true, metadata: '{}' },
  { id: 'cat-040', tipo: 'departamento', codigo: 'tesoreria', nombre: 'Tesorería', orden: 9, activo: true, metadata: '{}' },
  { id: 'cat-041', tipo: 'departamento', codigo: 'pld', nombre: 'PLD/AML', orden: 10, activo: true, metadata: '{}' },
];

// ============================================================
// Plantillas de Activos
// ============================================================
export const plantillasActivo = [
  { id: 'plt-001', nombre: 'Sistema Core Bancario', tipoActivo: 'software', descripcion: 'Plantilla para sistemas core banking', icono: 'account_balance', color: '#1e40af', activo: true, propiedades: JSON.stringify([{ id: 'cb-1', nombre: 'Versión', campo: 'version', tipo: 'texto', requerido: true }, { id: 'cb-2', nombre: 'Proveedor', campo: 'proveedor', tipo: 'texto', requerido: true }, { id: 'cb-3', nombre: 'Módulos Activos', campo: 'modulos', tipo: 'multiseleccion', requerido: true }, { id: 'cb-4', nombre: 'Transacciones Diarias', campo: 'txnDiarias', tipo: 'numero', requerido: false }]) },
  { id: 'plt-002', nombre: 'Cajero Automático (ATM)', tipoActivo: 'hardware', descripcion: 'Plantilla para cajeros automáticos', icono: 'local_atm', color: '#059669', activo: true, propiedades: JSON.stringify([{ id: 'atm-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true }, { id: 'atm-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true }, { id: 'atm-3', nombre: 'Número de Serie', campo: 'numeroSerie', tipo: 'texto', requerido: true }]) },
  { id: 'plt-003', nombre: 'Base de Datos Financiera', tipoActivo: 'datos', descripcion: 'Plantilla para bases de datos con información financiera', icono: 'storage', color: '#7c3aed', activo: true, propiedades: JSON.stringify([{ id: 'db-1', nombre: 'Motor de BD', campo: 'motorBD', tipo: 'seleccion', requerido: true }, { id: 'db-2', nombre: 'Clasificación de Datos', campo: 'clasificacion', tipo: 'seleccion', requerido: true }, { id: 'db-4', nombre: 'Cifrado', campo: 'cifrado', tipo: 'booleano', requerido: true }]) },
  { id: 'plt-004', nombre: 'Servidor Bancario', tipoActivo: 'hardware', descripcion: 'Plantilla para servidores de infraestructura bancaria', icono: 'dns', color: '#0891b2', activo: true, propiedades: JSON.stringify([{ id: 'srv-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true }, { id: 'srv-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true }, { id: 'srv-5', nombre: 'Ambiente', campo: 'ambiente', tipo: 'seleccion', requerido: true }]) },
  { id: 'plt-005', nombre: 'Proveedor de Embozado de Tarjetas', tipoActivo: 'servicios', descripcion: 'Plantilla para proveedores terceros de personalización y embozado de tarjetas bancarias (TPRM)', icono: 'credit_card', color: '#1e40af', activo: true, propiedades: JSON.stringify([
    { id: 'emb-1', nombre: 'Certificación PCI-DSS', campo: 'pci_version', tipo: 'texto', requerido: true },
    { id: 'emb-2', nombre: 'País de operación', campo: 'pais_operacion', tipo: 'texto', requerido: true },
    { id: 'emb-3', nombre: 'Volumen anual de tarjetas', campo: 'volumen_anual', tipo: 'numero', requerido: true },
    { id: 'emb-4', nombre: 'Tipo de personalización', campo: 'tipo_personalizacion', tipo: 'texto', requerido: true },
    { id: 'emb-5', nombre: 'Risk Score Inicial', campo: 'risk_score', tipo: 'numero', requerido: true },
    { id: 'emb-6', nombre: 'Fecha última auditoría', campo: 'fecha_ultima_auditoria', tipo: 'fecha', requerido: false },
    { id: 'emb-7', nombre: 'Contrato vigente hasta', campo: 'vigencia_contrato', tipo: 'fecha', requerido: true },
    { id: 'emb-8', nombre: 'Concentración de riesgo (%)', campo: 'concentracion_riesgo', tipo: 'numero', requerido: false },
    { id: 'emb-9', nombre: 'Tiene BCP/DRP probado', campo: 'bcp_probado', tipo: 'booleano', requerido: true },
    { id: 'emb-10', nombre: 'Subcontrata servicios', campo: 'subcontrata', tipo: 'booleano', requerido: true }
  ]) },
];

// ============================================================
// Activos
// ============================================================
export const activos = [
  // === TPRM: Programa Paraguas ===
  { id: 'act-tprm-000', nombre: 'Programa TPRM - Embozado de Tarjetas', descripcion: 'Programa de gestión de riesgo de terceros (TPRM) para proveedores de embozado, personalización y distribución de tarjetas bancarias. Agrupa 8 proveedores críticos con operaciones en México, Colombia, Brasil y Perú.', tipo: 'servicios', criticidad: 'critica', responsable: 'Ana Patricia López García', departamento: 'Riesgos', tenantId: 'tenant-005', createdAt: '2023-01-15T10:00:00Z' },

  // === TPRM: Proveedores de Embozado de Tarjetas ===
  { id: 'act-tprm-001', nombre: 'CPI Card Group México', descripcion: 'Proveedor principal de embozado, encoding de banda magnética y grabado de chip EMV para tarjetas de crédito y débito. Opera planta en Querétaro con capacidad de 2M tarjetas/mes.', tipo: 'servicios', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'México' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 18000000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Embossing, Encoding banda, Grabado chip EMV, Impresión digital' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 72 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-08-15' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2026-12-31' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 65 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: false }
  ]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'act-tprm-002', nombre: 'IDEMIA México (ex-Oberthur)', descripcion: 'Proveedor alternativo de chips EMV, personalización de tarjetas contactless y fulfilment. Planta en CDMX con capacidad de 800K tarjetas/mes.', tipo: 'servicios', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'México' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 7000000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Grabado chip EMV, Contactless, Fulfilment y envío' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 58 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-11-20' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2027-06-30' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 25 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: false }
  ]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'act-tprm-003', nombre: 'Thales DIS México', descripcion: 'Proveedor de personalización de tarjetas premium y soluciones de seguridad digital. Subcontrata impresión a tercero local.', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v3.2.1 (en migración a v4.0)' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'México / Francia' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 3500000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Embossing premium, Metal cards, Contactless' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 68 },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2026-03-31' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 10 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: false },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: true }
  ]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'act-tprm-004', nombre: 'Entrust Datacard Colombia', descripcion: 'Proveedor regional de personalización de tarjetas para operaciones en Latinoamérica. Atiende emisión de tarjetas para clientes corporativos y gobierno. Planta en Bogotá.', tipo: 'servicios', criticidad: 'alta', responsable: 'Ana Patricia López García', departamento: 'Riesgos', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'Colombia' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 5200000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Embossing, Encoding banda, Grabado chip EMV, Instant Issuance' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 55 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-06-10' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2027-12-31' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 0 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: false }
  ]), tenantId: 'tenant-005', createdAt: '2024-03-15T10:00:00Z' },
  { id: 'act-tprm-005', nombre: 'Matica Technologies Brasil', descripcion: 'Proveedor de soluciones de personalización de bajo costo para tarjetas de débito y prepago. Opera planta en São Paulo con equipo propio de desarrollo de firmware.', tipo: 'servicios', criticidad: 'media', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'Brasil' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 12000000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Encoding banda, Grabado chip EMV, Impresión digital, Prepago' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 62 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-09-22' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2026-06-30' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 0 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: false }
  ]), tenantId: 'tenant-005', createdAt: '2024-06-20T14:00:00Z' },
  { id: 'act-tprm-006', nombre: 'Giesecke+Devrient (G+D) México', descripcion: 'Corporativo alemán, proveedor global de tarjetas y soluciones de seguridad. Planta de alta seguridad en Guadalajara con capacidad dual-site. Principal competidor de CPI.', tipo: 'servicios', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'México / Alemania' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 25000000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Embossing, Encoding banda, Grabado chip EMV, Contactless, Metal cards, Biometric cards' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 42 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-12-05' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2028-12-31' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 0 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: false }
  ]), tenantId: 'tenant-005', createdAt: '2023-11-01T09:00:00Z' },
  { id: 'act-tprm-007', nombre: 'Valid S.A. (ex-Gemalto LATAM)', descripcion: 'Proveedor brasileño con presencia en toda Latinoamérica. Especializado en tarjetas con biometría integrada y soluciones de identidad digital. Planta en CDMX y São Paulo.', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v4.0' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'México / Brasil' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 9500000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Embossing, Grabado chip EMV, Contactless, Biometric fingerprint, Fulfilment' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 51 },
    { propiedadId: 'emb-6', campo: 'fecha_ultima_auditoria', valor: '2025-10-18' },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2027-09-30' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 0 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: true },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: true }
  ]), tenantId: 'tenant-005', createdAt: '2024-01-10T11:00:00Z' },
  { id: 'act-tprm-008', nombre: 'Cardtec Perú', descripcion: 'Proveedor local peruano de bajo volumen. Especializado en tarjetas prepago y gift cards. Planta pequeña en Lima con controles de seguridad básicos. En evaluación para offboarding.', tipo: 'servicios', criticidad: 'media', responsable: 'Fernando Castillo Núñez', departamento: 'Cumplimiento', plantillaId: 'plt-005', parentAssetId: 'act-tprm-000', propiedadesCustom: JSON.stringify([
    { propiedadId: 'emb-1', campo: 'pci_version', valor: 'PCI-DSS v3.2.1 (expirada)' },
    { propiedadId: 'emb-2', campo: 'pais_operacion', valor: 'Perú' },
    { propiedadId: 'emb-3', campo: 'volumen_anual', valor: 800000 },
    { propiedadId: 'emb-4', campo: 'tipo_personalizacion', valor: 'Impresión digital, Prepago, Gift cards' },
    { propiedadId: 'emb-5', campo: 'risk_score', valor: 85 },
    { propiedadId: 'emb-7', campo: 'vigencia_contrato', valor: '2026-03-31' },
    { propiedadId: 'emb-8', campo: 'concentracion_riesgo', valor: 0 },
    { propiedadId: 'emb-9', campo: 'bcp_probado', valor: false },
    { propiedadId: 'emb-10', campo: 'subcontrata', valor: true }
  ]), tenantId: 'tenant-005', createdAt: '2023-06-15T08:00:00Z' },

  // === TPRM: Sub-activos de infraestructura y servicios de proveedores ===
  // CPI Card Group - sub-activos
  { id: 'act-tprm-001-hsm', nombre: 'CPI - Sistema HSM Embozado', descripcion: 'Hardware Security Module utilizado por CPI Card Group para cifrado de PAN, CVV y datos de banda magnética durante el proceso de embozado. Modelo Thales payShield 10K.', tipo: 'hardware', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-001', tenantId: 'tenant-005', createdAt: '2023-11-20T10:00:00Z' },
  { id: 'act-tprm-001-planta', nombre: 'CPI - Planta Querétaro', descripcion: 'Planta principal de embozado y personalización en Querétaro. Capacidad instalada: 2M tarjetas/mes. Sala limpia con controles ambientales.', tipo: 'infraestructura', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', parentAssetId: 'act-tprm-001', tenantId: 'tenant-005', createdAt: '2023-11-20T10:00:00Z' },
  { id: 'act-tprm-001-sftp', nombre: 'CPI - Canal SFTP Personalización', descripcion: 'Canal seguro SFTP para transmisión de archivos de personalización al proveedor. Actualmente con TLS 1.1 (pendiente migración a 1.3).', tipo: 'software', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-001', tenantId: 'tenant-005', createdAt: '2024-02-10T09:00:00Z' },
  { id: 'act-tprm-001-siem', nombre: 'CPI - Monitoreo SIEM', descripcion: 'Sistema SIEM contratado por CPI para monitoreo 24/7 de eventos de seguridad en planta de embozado. Correlación de eventos y alertas en tiempo real.', tipo: 'software', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-001', tenantId: 'tenant-005', createdAt: '2024-03-05T11:00:00Z' },

  // Thales DIS - sub-activos
  { id: 'act-tprm-003-sub', nombre: 'Thales - Subcontratista Impresión', descripcion: 'Subcontratista local de impresión contratado por Thales DIS. Sin certificación PCI verificada. Sujeto a auditoría 4th party.', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', parentAssetId: 'act-tprm-003', tenantId: 'tenant-005', createdAt: '2024-06-15T10:00:00Z' },
  { id: 'act-tprm-003-premium', nombre: 'Thales - Línea Metal Cards', descripcion: 'Línea de producción especializada en tarjetas metálicas premium. Incluye grabado láser y NFC embedding. 8% de falla en antena NFC reportada.', tipo: 'hardware', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', parentAssetId: 'act-tprm-003', tenantId: 'tenant-005', createdAt: '2024-04-20T09:00:00Z' },

  // G+D - sub-activos
  { id: 'act-tprm-006-gdl', nombre: 'G+D - Planta Guadalajara', descripcion: 'Planta principal de G+D en México. Alta seguridad, capacidad dual-site con failover automático a planta CDMX.', tipo: 'infraestructura', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-006', tenantId: 'tenant-005', createdAt: '2023-11-01T09:00:00Z' },
  { id: 'act-tprm-006-cdmx', nombre: 'G+D - Planta CDMX (DR)', descripcion: 'Planta secundaria de G+D en CDMX. Sitio de disaster recovery con capacidad de asumir 100% de producción en caso de falla de Guadalajara.', tipo: 'infraestructura', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-006', tenantId: 'tenant-005', createdAt: '2023-11-01T09:00:00Z' },

  // Valid S.A. - sub-activos
  { id: 'act-tprm-007-bio', nombre: 'Valid - Módulo Biométrico', descripcion: 'Módulo de personalización de tarjetas con sensor de huella dactilar integrado. Algoritmo propietario no certificado NIST. Falla en humedad >80%.', tipo: 'hardware', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', parentAssetId: 'act-tprm-007', tenantId: 'tenant-005', createdAt: '2024-07-08T10:00:00Z' },

  // Cardtec Perú - sub-activos
  { id: 'act-tprm-008-almacen', nombre: 'Cardtec - Almacén Subcontratado Lima', descripcion: 'Bodega subcontratada para almacenamiento de plásticos blancos y hologramas. Sin controles de seguridad física adecuados. Robo de 3,000 plásticos reportado.', tipo: 'infraestructura', criticidad: 'alta', responsable: 'Fernando Castillo Núñez', departamento: 'Cumplimiento', parentAssetId: 'act-tprm-008', tenantId: 'tenant-005', createdAt: '2024-11-01T09:00:00Z' },
  { id: 'act-tprm-008-tintas', nombre: 'Cardtec - Insumos UV No Certificados', descripcion: 'Tintas UV de proveedor no certificado por Visa/Mastercard para impresión de elementos de seguridad. Incumple especificaciones de marca.', tipo: 'datos', criticidad: 'media', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', parentAssetId: 'act-tprm-008', tenantId: 'tenant-005', createdAt: '2025-01-28T11:00:00Z' },
];

// ============================================================
// Riesgos
// ============================================================
export const riesgos = [
  // === TPRM: Riesgos de Proveedores de Embozado ===
  { id: 'rsk-tprm-001', activoId: 'act-tprm-001', descripcion: 'Fuga de datos de tarjetahabientes (PAN, CVV) durante proceso de embozado por acceso no autorizado a sistemas del proveedor', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-002', activoId: 'act-tprm-001', descripcion: 'Incumplimiento de certificación PCI-DSS por el proveedor principal de embozado, exponiendo al banco a sanciones de las marcas (Visa/Mastercard)', probabilidad: 3, impacto: 5, estado: 'identificado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-003', activoId: 'act-tprm-001', descripcion: 'Interrupción de operación del proveedor principal por desastre natural o falla de BCP no probado, afectando emisión de tarjetas', probabilidad: 3, impacto: 4, estado: 'en_tratamiento', responsable: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-004', activoId: 'act-tprm-001', descripcion: 'Concentración excesiva del 65% del volumen de embozado en un solo proveedor (CPI Card Group), sin capacidad alternativa inmediata', probabilidad: 4, impacto: 4, estado: 'evaluado', responsable: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-005', activoId: 'act-tprm-001', descripcion: 'Errores en encoding de datos del chip EMV que generen tarjetas no funcionales y reprocesos masivos', probabilidad: 2, impacto: 3, estado: 'mitigado', responsable: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-006', activoId: 'act-tprm-002', descripcion: 'Suplantación de identidad mediante tarjetas clonadas por vulnerabilidad en el proceso de personalización de IDEMIA', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-007', activoId: 'act-tprm-003', descripcion: 'Riesgo de cuarto nivel (4th party): Thales subcontrata impresión a tercero local sin controles PCI verificados', probabilidad: 3, impacto: 4, estado: 'identificado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-008', activoId: 'act-tprm-003', descripcion: 'Thales no ha completado migración a PCI-DSS v4.0, con vencimiento del período de gracia en marzo 2026', probabilidad: 4, impacto: 4, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-009', activoId: 'act-tprm-001', descripcion: 'Incumplimiento de SLA de tiempos de entrega de tarjetas embozadas por sobrecarga operativa del proveedor', probabilidad: 3, impacto: 3, estado: 'evaluado', responsable: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'rsk-tprm-010', activoId: 'act-tprm-002', descripcion: 'Exposición de información sensible del banco ante terminación no controlada del contrato (offboarding incompleto)', probabilidad: 2, impacto: 5, estado: 'identificado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === TPRM: Riesgos de nuevos proveedores y datos históricos ===
  { id: 'rsk-tprm-011', activoId: 'act-tprm-004', descripcion: 'Riesgo regulatorio por diferencias en normativa colombiana vs mexicana para manejo de datos de tarjetas', probabilidad: 3, impacto: 3, estado: 'evaluado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: '2024-05-10T10:00:00Z' },
  { id: 'rsk-tprm-012', activoId: 'act-tprm-004', descripcion: 'Latencia en transmisión de archivos de personalización por distancia geográfica Colombia-México', probabilidad: 3, impacto: 2, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-06-15T09:00:00Z' },
  { id: 'rsk-tprm-013', activoId: 'act-tprm-005', descripcion: 'Inestabilidad cambiaria BRL/MXN impacta costos de servicio de Matica al ser facturado en reales brasileños', probabilidad: 4, impacto: 3, estado: 'aceptado', responsable: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-08-20T11:00:00Z' },
  { id: 'rsk-tprm-014', activoId: 'act-tprm-005', descripcion: 'Firmware propietario de Matica sin auditoría de seguridad independiente. Posible backdoor en sistema de grabado', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-09-05T14:00:00Z' },
  { id: 'rsk-tprm-015', activoId: 'act-tprm-006', descripcion: 'Dependencia tecnológica: G+D usa chips propios que crean lock-in con el proveedor', probabilidad: 4, impacto: 3, estado: 'aceptado', responsable: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'rsk-tprm-016', activoId: 'act-tprm-006', descripcion: 'Requerimientos de compliance europeo (GDPR) imponen restricciones adicionales en manejo de datos procesados por G+D', probabilidad: 2, impacto: 3, estado: 'mitigado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: '2024-02-10T09:00:00Z' },
  { id: 'rsk-tprm-017', activoId: 'act-tprm-007', descripcion: 'Valid S.A. en proceso de reestructuración corporativa post-adquisición. Riesgo de pérdida de personal clave y degradación del servicio', probabilidad: 3, impacto: 4, estado: 'en_tratamiento', responsable: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-04-12T15:00:00Z' },
  { id: 'rsk-tprm-018', activoId: 'act-tprm-007', descripcion: 'Tarjetas biométricas de Valid almacenan templates de huella dactilar con algoritmo propietario no certificado por NIST', probabilidad: 2, impacto: 5, estado: 'evaluado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-07-08T10:00:00Z' },
  { id: 'rsk-tprm-019', activoId: 'act-tprm-008', descripcion: 'CRÍTICO: Cardtec Perú tiene certificación PCI-DSS expirada desde hace 6 meses. Incumple requisito contractual obligatorio', probabilidad: 5, impacto: 5, estado: 'en_tratamiento', responsable: 'Fernando Castillo Núñez', tenantId: 'tenant-005', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'rsk-tprm-020', activoId: 'act-tprm-008', descripcion: 'Cardtec subcontrata almacenamiento de plásticos a bodega sin controles de seguridad física adecuados', probabilidad: 4, impacto: 4, estado: 'identificado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2025-01-20T11:00:00Z' },
  // Riesgos históricos ya cerrados/mitigados
  { id: 'rsk-tprm-021', activoId: 'act-tprm-001', descripcion: 'Vulnerabilidad en API de envío de archivos de personalización (CVE-2024-3456). Parcheado en 48hrs.', probabilidad: 3, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-04-15T08:00:00Z' },
  { id: 'rsk-tprm-022', activoId: 'act-tprm-002', descripcion: 'Cambio de dirección general en IDEMIA generó incertidumbre sobre continuidad de compromisos contractuales', probabilidad: 3, impacto: 3, estado: 'mitigado', responsable: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-07-20T10:00:00Z' },
  { id: 'rsk-tprm-023', activoId: 'act-tprm-006', descripcion: 'Huelga en planta de G+D Guadalajara por negociación laboral. Riesgo de interrupción de 2 semanas.', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2024-11-05T09:00:00Z' },
];

// ============================================================
// Incidentes
// ============================================================
export const incidentes = [
  // === TPRM: Incidentes con Proveedores de Embozado ===
  { id: 'inc-tprm-001', activoId: 'act-tprm-001', titulo: 'Lote de 15,000 tarjetas con chip EMV defectuoso', descripcion: 'CPI Card Group entregó lote de tarjetas con error en encoding del chip EMV, provocando rechazo de transacciones en POS. Se detectó en pruebas de calidad previo a distribución. Impacto: retraso de 5 días en emisión.', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'inc-tprm-002', activoId: 'act-tprm-001', titulo: 'Acceso no autorizado detectado en planta de embozado', descripcion: 'Auditoría de seguridad reveló que un ex-empleado de CPI conservaba credenciales activas de acceso al sistema de personalización. Se bloqueó inmediatamente y se solicitó análisis forense.', severidad: 'critica', estado: 'en_investigacion', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'inc-tprm-003', activoId: 'act-tprm-002', titulo: 'Retraso de 10 días en entrega de tarjetas contactless', descripcion: 'IDEMIA reportó retraso por falla en equipo de grabado contactless. SLA de 5 días hábiles incumplido. Afectó emisión de 8,000 tarjetas para campaña comercial.', severidad: 'media', estado: 'resuelto', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'inc-tprm-004', activoId: 'act-tprm-003', titulo: 'Subcontratista de Thales sin certificación PCI vigente', descripcion: 'Se descubrió durante auditoría que el subcontratista de impresión de Thales dejó vencer su certificación PCI-DSS hace 4 meses sin notificar. Suspensión inmediata de operaciones con ese subcontratista.', severidad: 'critica', estado: 'en_contencion', reportadoPor: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'inc-tprm-005', activoId: 'act-tprm-001', titulo: 'Falla en destrucción segura de tarjetas rechazadas', descripcion: 'Auditoría detectó que CPI no destruía correctamente tarjetas rechazadas del proceso de calidad. Se encontraron 200 tarjetas con datos impresos en contenedor no seguro.', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === TPRM: Incidentes históricos y de nuevos proveedores ===
  { id: 'inc-tprm-006', activoId: 'act-tprm-006', titulo: 'Interrupción de 3 días en planta G+D por actualización de firmware', descripcion: 'G+D realizó actualización no programada de firmware en línea de embozado. Causó parada de 3 días. No se notificó al banco con anticipación según SLA (72hrs previas).', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2024-03-18T08:00:00Z' },
  { id: 'inc-tprm-007', activoId: 'act-tprm-006', titulo: 'Huelga parcial en planta Guadalajara de G+D', descripcion: 'Paro parcial de trabajadores por negociación salarial. Producción reducida al 40% durante 5 días. Se activó plan de contingencia con IDEMIA.', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-11-08T10:00:00Z' },
  { id: 'inc-tprm-008', activoId: 'act-tprm-007', titulo: 'Pérdida temporal de conectividad con HSM de Valid', descripcion: 'El Hardware Security Module de Valid quedó inaccesible por 6 horas debido a falla eléctrica en data center de São Paulo. No se pudieron procesar claves criptográficas.', severidad: 'critica', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-08-12T15:00:00Z' },
  { id: 'inc-tprm-009', activoId: 'act-tprm-004', titulo: 'Error en lote de tarjetas de Entrust con CVV incorrecto', descripcion: 'Entrust Colombia entregó 5,000 tarjetas con CVV2 generado incorrectamente. Detectado en pruebas de validación del banco antes de distribución.', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-09-25T11:00:00Z' },
  { id: 'inc-tprm-010', activoId: 'act-tprm-005', titulo: 'Matica envió tarjetas de débito con datos de otro banco', descripcion: 'Error de segregación de datos: Matica personalizó 1,200 tarjetas con datos de otro cliente bancario. Incidente de confidencialidad. Destrucción total del lote y análisis forense.', severidad: 'critica', estado: 'cerrado', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2025-01-08T09:00:00Z' },
  { id: 'inc-tprm-011', activoId: 'act-tprm-008', titulo: 'Cardtec reportó robo de plásticos blancos de almacén', descripcion: 'Robo de 3,000 plásticos blancos del almacén subcontratado por Cardtec Perú. Sin datos personalizados pero con hologramas de seguridad del banco. Reporte policial presentado.', severidad: 'alta', estado: 'en_investigacion', reportadoPor: 'Fernando Castillo Núñez', tenantId: 'tenant-005', createdAt: '2025-02-01T16:00:00Z' },
  { id: 'inc-tprm-012', activoId: 'act-tprm-008', titulo: 'Cardtec no entregó evidencia de prueba de DRP', descripcion: 'Cardtec incumplió obligación contractual de entregar evidencia de prueba anual de DRP. Proveedor en proceso de offboarding.', severidad: 'media', estado: 'resuelto', reportadoPor: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: '2024-12-15T10:00:00Z' },
  // Incidentes históricos ya cerrados (timeline)
  { id: 'inc-tprm-013', activoId: 'act-tprm-001', titulo: 'CPI: Falla de climatización en sala de embozado', descripcion: 'Aire acondicionado de sala limpia falló por 8 horas. Temperatura subió a 32°C, fuera de rango operativo para adhesión de hologramas. Producción suspendida.', severidad: 'media', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2024-02-14T07:00:00Z' },
  { id: 'inc-tprm-014', activoId: 'act-tprm-002', titulo: 'IDEMIA: Vulnerabilidad en portal de tracking de producción', descripcion: 'Se detectó vulnerabilidad XSS en portal web que permite dar tracking al estatus de producción. Se expusieron datos de volúmenes y números de lote. Parcheado en 24hrs.', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-05-20T14:00:00Z' },
  { id: 'inc-tprm-015', activoId: 'act-tprm-001', titulo: 'CPI: Personal no autorizado en área de personalización', descripcion: 'Visitante de área comercial de CPI ingresó a zona de personalización sin escolta de seguridad ni registro en bitácora. Detectado por CCTV.', severidad: 'media', estado: 'cerrado', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-08-03T11:00:00Z' },
  { id: 'inc-tprm-016', activoId: 'act-tprm-007', titulo: 'Valid: Retraso de 15 días en entrega de tarjetas biométricas', descripcion: 'Escasez global de sensores de huella dactilar retrasó producción de tarjetas biométricas. Impacto en lanzamiento de producto premium del banco.', severidad: 'media', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2024-10-10T09:00:00Z' },
];

// ============================================================
// Defectos
// ============================================================
export const defectos = [
  // === TPRM: Defectos en Servicios de Embozado ===
  { id: 'def-tprm-001', activoId: 'act-tprm-001', titulo: 'Defecto en calidad de impresión de datos en tarjeta', descripcion: 'Impresión del nombre del tarjetahabiente desalineada en 3% de las tarjetas del lote mensual. Fuera de tolerancia de calidad del SLA.', tipo: 'funcional', prioridad: 'media', estado: 'en_correccion', detectadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'def-tprm-002', activoId: 'act-tprm-001', titulo: 'Vulnerabilidad en canal de transmisión de datos de personalización', descripcion: 'Canal SFTP usado para enviar archivos de personalización al proveedor usa cifrado TLS 1.1 (deprecated). Requiere actualización a TLS 1.3.', tipo: 'seguridad', prioridad: 'critica', estado: 'en_correccion', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'def-tprm-003', activoId: 'act-tprm-002', titulo: 'Inconsistencia en reportes de producción de IDEMIA', descripcion: 'Los reportes diarios de producción de IDEMIA presentan discrepancias del 2-5% respecto al volumen real procesado. Dificulta reconciliación.', tipo: 'funcional', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'def-tprm-004', activoId: 'act-tprm-003', titulo: 'Tarjetas metálicas premium sin grabado NFC funcional', descripcion: 'El 8% de tarjetas metálicas premium de Thales presentan falla en antena NFC. Impacto en experiencia de cliente de segmento alto.', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === TPRM: Defectos históricos de proveedores adicionales ===
  { id: 'def-tprm-005', activoId: 'act-tprm-004', titulo: 'Entrust: Código de barras ilegible en 7% de tarjetas corporativas', descripcion: 'Lote de tarjetas corporativas de Entrust Colombia presenta código de barras 2D ilegible por lectores POS estándar. Problema de calibración de impresora láser.', tipo: 'funcional', prioridad: 'alta', estado: 'corregido', detectadoPor: 'Ana Patricia López García', tenantId: 'tenant-005', createdAt: '2024-10-05T09:00:00Z' },
  { id: 'def-tprm-006', activoId: 'act-tprm-005', titulo: 'Matica: Adhesión deficiente de holograma de seguridad', descripcion: 'Hologramas de seguridad se despegan en tarjetas de débito personalizadas por Matica. Afecta 12% del lote de noviembre. Temperatura de laminación incorrecta.', tipo: 'funcional', prioridad: 'critica', estado: 'corregido', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-11-22T14:00:00Z' },
  { id: 'def-tprm-007', activoId: 'act-tprm-005', titulo: 'Matica: Resolución baja en impresión de foto del tarjetahabiente', descripcion: 'Fotos impresas en tarjetas premium de Matica tienen resolución inferior a 300dpi requeridos. Impacto en verificación visual del portador.', tipo: 'funcional', prioridad: 'media', estado: 'en_correccion', detectadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'def-tprm-008', activoId: 'act-tprm-006', titulo: 'G+D: Desalineación de chip EMV en tarjetas contactless', descripcion: 'Chip EMV desalineado 0.5mm en 2% de producción de tarjetas contactless. Dentro de tolerancia ISO pero causa fallos intermitentes en ciertos terminales NFC.', tipo: 'funcional', prioridad: 'media', estado: 'corregido', detectadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-005', createdAt: '2024-04-08T11:00:00Z' },
  { id: 'def-tprm-009', activoId: 'act-tprm-006', titulo: 'G+D: Incompatibilidad de firmware en tarjetas dual-interface', descripcion: 'Firmware v2.3 de chips G+D presenta incompatibilidad con terminales Ingenico de generación anterior. Afecta 15% de red de POS del banco.', tipo: 'funcional', prioridad: 'alta', estado: 'corregido', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-06-20T08:00:00Z' },
  { id: 'def-tprm-010', activoId: 'act-tprm-007', titulo: 'Valid: Sensor biométrico no reconoce huellas en clima húmedo', descripcion: 'Sensor de huella dactilar integrado en tarjetas biométricas de Valid falla en condiciones de humedad >80%. Afecta operación en zonas costeras.', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-005', createdAt: '2024-09-10T10:00:00Z' },
  { id: 'def-tprm-011', activoId: 'act-tprm-007', titulo: 'Valid: Inconsistencia en PIN offset de tarjetas migradas', descripcion: 'Error en cálculo de PIN offset durante migración de tarjetas de la antigua plataforma Gemalto. 1,500 tarjetas afectadas requieren re-emisión de PIN.', tipo: 'seguridad', prioridad: 'critica', estado: 'corregido', detectadoPor: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: '2024-05-18T16:00:00Z' },
  { id: 'def-tprm-012', activoId: 'act-tprm-008', titulo: 'Cardtec: Plástico de baja calidad con decoloración prematura', descripcion: 'Tarjetas prepago de Cardtec presentan decoloración visible después de 3 meses de uso. Material PVC de proveedor local no cumple estándar ISO 7810.', tipo: 'funcional', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Fernando Castillo Núñez', tenantId: 'tenant-005', createdAt: '2024-12-01T09:00:00Z' },
  { id: 'def-tprm-013', activoId: 'act-tprm-008', titulo: 'Cardtec: Uso de tintas no certificadas para impresión UV', descripcion: 'Auditoría reveló que Cardtec usa tintas UV de proveedor no certificado por Visa/Mastercard para elementos de seguridad. Incumplimiento de especificaciones de marca.', tipo: 'seguridad', prioridad: 'critica', estado: 'en_correccion', detectadoPor: 'Carlos Hernández Mora', tenantId: 'tenant-005', createdAt: '2025-01-28T11:00:00Z' },
];

// ============================================================
// Procesos
// ============================================================
export const procesos = [
  // === TPRM: Procesos del ciclo de gestión de terceros ===
  { id: 'prc-tprm-001', nombre: 'TPRM - Due Diligence de Embozadores', descripcion: 'Proceso de evaluación inicial (onboarding) de proveedores de embozado de tarjetas. Evalúa solvencia financiera, certificaciones PCI-DSS, seguridad física/lógica, modelo operativo, BCP/DRP y capacidad productiva.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-002', nombre: 'TPRM - Gestión de Contratos con Embozadores', descripcion: 'Proceso de gestión contractual con proveedores de embozado. Incluye definición de SLAs, cláusulas de auditoría, responsabilidades ante incidentes, protección de datos financieros y penalizaciones.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-003', nombre: 'TPRM - Monitoreo Continuo de Riesgos de Embozadores', descripcion: 'Proceso de monitoreo continuo de exposición al riesgo de proveedores de embozado. Evalúa riesgo residual, cambios en certificaciones, postura de seguridad, riesgos emergentes y dependencia operacional.', version: '1.0', estado: 'activo', createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-004', nombre: 'TPRM - Gestión de Desempeño de Embozadores', descripcion: 'Proceso de evaluación del desempeño operativo de proveedores de embozado. Mide cumplimiento de SLA, calidad de producción, defectos, tiempos de entrega y capacidad de respuesta.', version: '1.0', estado: 'activo', createdBy: 'usr-008', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-005', nombre: 'TPRM - Gestión de Incidentes con Embozadores', descripcion: 'Proceso de respuesta a incidentes originados en proveedores de embozado. Evalúa capacidad de respuesta, tiempo de detección, coordinación con el banco, impacto y tiempo de recuperación.', version: '1.0', estado: 'activo', createdBy: 'usr-004', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-006', nombre: 'TPRM - Terminación / Offboarding de Embozadores', descripcion: 'Proceso de terminación controlada de relación con proveedores de embozado. Asegura eliminación segura de datos, transferencia operativa, cumplimiento de obligaciones finales y mitigación de riesgos residuales.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const processNodes = [
  // === TPRM: Nodos del proceso Due Diligence ===
  { id: 'pn-tprm-001', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-1', type: 'start', label: 'Solicitud de Onboarding', position: JSON.stringify({ x: 50, y: 100 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-002', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-2', type: 'task', label: 'Evaluación de Solvencia Financiera', position: JSON.stringify({ x: 200, y: 100 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-003', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-3', type: 'task', label: 'Verificación PCI-DSS', position: JSON.stringify({ x: 350, y: 100 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-004', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-4', type: 'task', label: 'Evaluación Seguridad Física y Lógica', position: JSON.stringify({ x: 500, y: 100 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-005', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-5', type: 'task', label: 'Evaluación BCP/DRP', position: JSON.stringify({ x: 650, y: 100 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-006', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-6', type: 'task', label: 'Clasificación de Criticidad', position: JSON.stringify({ x: 200, y: 250 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-007', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-7', type: 'task', label: 'Gap Analysis de Controles', position: JSON.stringify({ x: 350, y: 250 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-008', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-8', type: 'decision', label: '¿Aprobado?', position: JSON.stringify({ x: 500, y: 250 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-009', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-9', type: 'end', label: 'Proveedor Aprobado', position: JSON.stringify({ x: 650, y: 250 }), tenantId: 'tenant-005' },
  { id: 'pn-tprm-010', procesoId: 'prc-tprm-001', nodeId: 'tprm-node-10', type: 'end', label: 'Proveedor Rechazado', position: JSON.stringify({ x: 500, y: 400 }), tenantId: 'tenant-005' },
];

export const processEdges = [
  // === TPRM: Edges del proceso Due Diligence ===
  { id: 'pe-tprm-001', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-1', source: 'tprm-node-1', target: 'tprm-node-2', tenantId: 'tenant-005' },
  { id: 'pe-tprm-002', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-2', source: 'tprm-node-2', target: 'tprm-node-3', tenantId: 'tenant-005' },
  { id: 'pe-tprm-003', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-3', source: 'tprm-node-3', target: 'tprm-node-4', tenantId: 'tenant-005' },
  { id: 'pe-tprm-004', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-4', source: 'tprm-node-4', target: 'tprm-node-5', tenantId: 'tenant-005' },
  { id: 'pe-tprm-005', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-5', source: 'tprm-node-5', target: 'tprm-node-6', tenantId: 'tenant-005' },
  { id: 'pe-tprm-006', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-6', source: 'tprm-node-6', target: 'tprm-node-7', tenantId: 'tenant-005' },
  { id: 'pe-tprm-007', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-7', source: 'tprm-node-7', target: 'tprm-node-8', tenantId: 'tenant-005' },
  { id: 'pe-tprm-008', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-8', source: 'tprm-node-8', target: 'tprm-node-9', tenantId: 'tenant-005' },
  { id: 'pe-tprm-009', procesoId: 'prc-tprm-001', edgeId: 'tprm-edge-9', source: 'tprm-node-8', target: 'tprm-node-10', tenantId: 'tenant-005' },
];

export const objetivosProceso = [
  // === TPRM: Objetivos ===
  { id: 'obj-tprm-001', procesoId: 'prc-tprm-001', nombre: 'Due Diligence completo antes de contratación', descripcion: 'Completar evaluación integral del 100% de proveedores de embozado antes de firmar contrato', progreso: 67, tenantId: 'tenant-005' },
  { id: 'obj-tprm-002', procesoId: 'prc-tprm-003', nombre: 'Monitoreo continuo de riesgo de terceros', descripcion: 'Mantener risk score actualizado de todos los proveedores con evaluación trimestral', progreso: 80, tenantId: 'tenant-005' },
  { id: 'obj-tprm-003', procesoId: 'prc-tprm-004', nombre: 'Cumplimiento de SLA de embozado', descripcion: 'Asegurar que proveedores cumplan el 95% de los SLA acordados', progreso: 72, tenantId: 'tenant-005' },
];

export const kpisProceso = [
  // === TPRM: KPIs ===
  { id: 'kpi-tprm-001', procesoId: 'prc-tprm-004', nombre: 'SLA Compliance Rate', valorActual: 87, valorMeta: 95, unidad: '%', estado: 'amarillo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-002', procesoId: 'prc-tprm-004', nombre: 'Tiempo promedio entrega de tarjetas', valorActual: 6.2, valorMeta: 5, unidad: 'días', estado: 'rojo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-003', procesoId: 'prc-tprm-004', nombre: 'Tasa de defectos en producción', valorActual: 1.8, valorMeta: 1.0, unidad: '%', estado: 'amarillo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-004', procesoId: 'prc-tprm-005', nombre: 'MTTR incidentes del proveedor', valorActual: 8, valorMeta: 4, unidad: 'horas', estado: 'rojo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-005', procesoId: 'prc-tprm-005', nombre: 'Incidentes con causa raíz completada', valorActual: 78, valorMeta: 95, unidad: '%', estado: 'amarillo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-006', procesoId: 'prc-tprm-003', nombre: 'Cumplimiento de controles del banco', valorActual: 82, valorMeta: 95, unidad: '%', estado: 'amarillo', tenantId: 'tenant-005' },
  { id: 'kpi-tprm-007', procesoId: 'prc-tprm-003', nombre: 'Findings abiertos vs cerrados', valorActual: 12, valorMeta: 0, unidad: 'hallazgos', estado: 'rojo', tenantId: 'tenant-005' },
];

// ============================================================
// Marcos Normativos
// ============================================================
export const marcosNormativos = [
  // === TPRM: Marcos Normativos ===
  { id: 'marco-tprm-001', nombre: 'Disposiciones CNBV sobre Servicios de Terceros', acronimo: 'CNBV-TPRM', version: '2024', fechaVigencia: '2024-01-01', descripcion: 'Disposiciones de la CNBV relativas a la contratación de servicios con terceros por parte de instituciones de crédito, incluyendo due diligence, monitoreo y offboarding', activo: true, tenantId: 'tenant-005' },
  { id: 'marco-tprm-002', nombre: 'Circular Banxico sobre Riesgo Operacional de Terceros', acronimo: 'BX-RO-3ROS', version: '2023', fechaVigencia: '2023-06-15', descripcion: 'Circular de Banco de México que establece requisitos de gestión de riesgo operacional derivado de la dependencia en proveedores terceros de servicios críticos', activo: true, tenantId: 'tenant-005' },
];

// ============================================================
// Cuestionarios
// ============================================================
export const cuestionarios = [
  // === TPRM: Cuestionarios ===
  { id: 'cst-tprm-001', nombre: 'Due Diligence - Proveedor de Embozado', descripcion: 'Cuestionario de evaluación integral para onboarding de proveedores de embozado de tarjetas. Cubre seguridad física, PCI-DSS, BCP, subcontratistas y protección de datos de tarjetahabientes.', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'auditoria_externa', estado: 'activo', marcoNormativoId: 'marco-003', periodicidad: 'anual', umbrales: JSON.stringify({ deficiente: 70, aceptable: 85, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Operaciones', 'Seguridad', 'Cumplimiento', 'Riesgos']), responsables: JSON.stringify(['usr-004', 'usr-003']), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'cst-tprm-002', nombre: 'Evaluación de Desempeño Trimestral - Embozador', descripcion: 'Cuestionario de evaluación periódica del desempeño operativo de proveedores de embozado. Mide SLAs, calidad, incidentes y capacidad de respuesta.', categoria: 'operacional', tipo: 'manual', tipoEvaluacion: 'revision_controles', estado: 'activo', marcoNormativoId: 'marco-tprm-001', periodicidad: 'trimestral', umbrales: JSON.stringify({ deficiente: 60, aceptable: 80, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Operaciones', 'Riesgos']), responsables: JSON.stringify(['usr-008']), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const secciones = [
  // === TPRM: Secciones del cuestionario Due Diligence ===
  { id: 'sec-tprm-001', cuestionarioId: 'cst-tprm-001', nombre: 'Seguridad Física de Instalaciones', descripcion: 'Controles de seguridad física en la planta de personalización de tarjetas', orden: 1, tenantId: 'tenant-005' },
  { id: 'sec-tprm-002', cuestionarioId: 'cst-tprm-001', nombre: 'Controles PCI-DSS del Proveedor', descripcion: 'Verificación de cumplimiento PCI-DSS v4.0 obligatorio para embozadores', orden: 2, tenantId: 'tenant-005' },
  { id: 'sec-tprm-003', cuestionarioId: 'cst-tprm-001', nombre: 'Plan de Continuidad del Negocio (BCP/DRP)', descripcion: 'Evaluación de capacidad de recuperación y continuidad operativa del proveedor', orden: 3, tenantId: 'tenant-005' },
  { id: 'sec-tprm-004', cuestionarioId: 'cst-tprm-001', nombre: 'Gestión de Subcontratistas (4th Parties)', descripcion: 'Evaluación de riesgos derivados de la cadena de subcontratación del proveedor', orden: 4, tenantId: 'tenant-005' },
  { id: 'sec-tprm-005', cuestionarioId: 'cst-tprm-001', nombre: 'Protección de Datos de Tarjetahabientes', descripcion: 'Controles para proteger PAN, CVV, datos de banda magnética y chip durante el proceso de personalización', orden: 5, tenantId: 'tenant-005' },
  { id: 'sec-tprm-006', cuestionarioId: 'cst-tprm-001', nombre: 'Capacidad Operativa y Solvencia', descripcion: 'Evaluación de la capacidad productiva vs demanda del banco y estabilidad financiera del proveedor', orden: 6, tenantId: 'tenant-005' },
  { id: 'sec-tprm-007', cuestionarioId: 'cst-tprm-001', nombre: 'Gestión de Incidentes del Proveedor', descripcion: 'Evaluación de la capacidad de detección, respuesta y comunicación ante incidentes de seguridad', orden: 7, tenantId: 'tenant-005' },
  // === TPRM: Secciones del cuestionario de desempeño ===
  { id: 'sec-tprm-008', cuestionarioId: 'cst-tprm-002', nombre: 'Cumplimiento de SLAs', descripcion: 'Evaluación del cumplimiento de acuerdos de nivel de servicio', orden: 1, tenantId: 'tenant-005' },
  { id: 'sec-tprm-009', cuestionarioId: 'cst-tprm-002', nombre: 'Calidad de Producción', descripcion: 'Evaluación de la calidad del embozado y personalización de tarjetas', orden: 2, tenantId: 'tenant-005' },
];

export const preguntas = [
  // === TPRM: Preguntas Due Diligence ===
  { id: 'prg-tprm-001', seccionId: 'sec-tprm-001', texto: '¿Las instalaciones de personalización cuentan con control de acceso biométrico y CCTV 24/7?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-002', seccionId: 'sec-tprm-001', texto: '¿Existe separación física entre las áreas de almacenamiento de plásticos, personalización y despacho?', tipo: 'si_no', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-003', seccionId: 'sec-tprm-001', texto: '¿Se realiza destrucción certificada de tarjetas rechazadas y desechos de producción?', tipo: 'si_no', requerida: true, orden: 3, tenantId: 'tenant-005' },
  { id: 'prg-tprm-004', seccionId: 'sec-tprm-002', texto: '¿El proveedor cuenta con certificación PCI-DSS v4.0 vigente?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-005', seccionId: 'sec-tprm-002', texto: '¿Cuál es la fecha de expiración de la certificación PCI-DSS actual?', tipo: 'fecha', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-006', seccionId: 'sec-tprm-002', texto: '¿Se cifran los datos del tarjetahabiente (PAN) durante la transmisión al proveedor?', tipo: 'si_no', requerida: true, orden: 3, tenantId: 'tenant-005' },
  { id: 'prg-tprm-007', seccionId: 'sec-tprm-003', texto: '¿El proveedor tiene un Plan de Continuidad del Negocio (BCP) documentado y probado?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-008', seccionId: 'sec-tprm-003', texto: '¿Cuándo fue la última prueba del plan de recuperación ante desastres (DRP)?', tipo: 'fecha', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-009', seccionId: 'sec-tprm-003', texto: '¿Cuál es el RTO (Recovery Time Objective) comprometido para el servicio de embozado?', tipo: 'numero', requerida: true, orden: 3, tenantId: 'tenant-005' },
  { id: 'prg-tprm-010', seccionId: 'sec-tprm-004', texto: '¿El proveedor subcontrata algún componente del servicio de personalización?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-011', seccionId: 'sec-tprm-004', texto: '¿Los subcontratistas cuentan con certificación PCI-DSS vigente?', tipo: 'si_no', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-012', seccionId: 'sec-tprm-005', texto: '¿Se utilizan HSM (Hardware Security Modules) para el manejo de claves criptográficas?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-013', seccionId: 'sec-tprm-005', texto: '¿Existe segregación de funciones en el acceso a datos de tarjetahabientes?', tipo: 'si_no', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-014', seccionId: 'sec-tprm-006', texto: '¿Cuál es la capacidad máxima mensual de personalización de tarjetas?', tipo: 'numero', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-015', seccionId: 'sec-tprm-006', texto: '¿El proveedor tiene estados financieros auditados de los últimos 2 ejercicios?', tipo: 'si_no', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-016', seccionId: 'sec-tprm-007', texto: '¿El proveedor tiene un proceso formal de gestión de incidentes con tiempos de notificación definidos?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-017', seccionId: 'sec-tprm-007', texto: '¿Cuál es el tiempo máximo de notificación al banco ante un incidente de seguridad?', tipo: 'numero', requerida: true, orden: 2, tenantId: 'tenant-005' },
  // === TPRM: Preguntas de Desempeño ===
  { id: 'prg-tprm-018', seccionId: 'sec-tprm-008', texto: '¿Se cumplió el SLA de tiempo de entrega (5 días hábiles) en el trimestre?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-005' },
  { id: 'prg-tprm-019', seccionId: 'sec-tprm-008', texto: '¿Cuántos incidentes operativos reportó el proveedor este trimestre?', tipo: 'numero', requerida: true, orden: 2, tenantId: 'tenant-005' },
  { id: 'prg-tprm-020', seccionId: 'sec-tprm-009', texto: '¿Cuál fue la tasa de reprocesos por defectos de calidad?', tipo: 'numero', requerida: true, orden: 1, tenantId: 'tenant-005' },
];

export const asignaciones = [
  // === TPRM: Asignaciones de cuestionarios ===
  { id: 'asig-tprm-001', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Anual CPI Card Group 2026', descripcion: 'Evaluación integral anual del proveedor principal de embozado CPI Card Group', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-004', 'usr-003']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez', 'Carlos Hernández Mora']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 35, tenantId: 'tenant-005' },
  { id: 'asig-tprm-002', cuestionarioId: 'cst-tprm-002', titulo: 'Evaluación Desempeño Q1 2026 - IDEMIA', descripcion: 'Evaluación trimestral de desempeño del proveedor alternativo IDEMIA', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-008']), usuariosAsignadosNombres: JSON.stringify(['Jorge Vargas Luna']), areaId: 'operaciones', areaNombre: 'Operaciones', responsableId: 'usr-008', responsableNombre: 'Jorge Vargas Luna', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 60, tenantId: 'tenant-005' },
  { id: 'asig-tprm-003', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Anual Thales DIS 2026', descripcion: 'Evaluación integral del proveedor Thales DIS con enfoque especial en migración PCI-DSS v4.0 y gestión de subcontratistas', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-003', 'usr-006']), usuariosAsignadosNombres: JSON.stringify(['Carlos Hernández Mora', 'Fernando Castillo Núñez']), areaId: 'cumplimiento', areaNombre: 'Cumplimiento Normativo', responsableId: 'usr-003', responsableNombre: 'Carlos Hernández Mora', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), estado: 'pendiente', progreso: 0, tenantId: 'tenant-005' },
  // === TPRM: Asignaciones históricas completadas ===
  { id: 'asig-tprm-004', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Inicial G+D México 2024', descripcion: 'Evaluación integral de onboarding de Giesecke+Devrient como proveedor alternativo de embozado', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-004']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: '2024-01-15T00:00:00Z', fechaVencimiento: '2024-03-15T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-005', cuestionarioId: 'cst-tprm-002', titulo: 'Evaluación Desempeño Q2 2025 - CPI Card Group', descripcion: 'Evaluación trimestral de desempeño del proveedor principal CPI. Resultado: 78/100 - SLA parcialmente cumplido', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-008']), usuariosAsignadosNombres: JSON.stringify(['Jorge Vargas Luna']), areaId: 'operaciones', areaNombre: 'Operaciones', responsableId: 'usr-008', responsableNombre: 'Jorge Vargas Luna', fechaInicio: '2025-07-01T00:00:00Z', fechaVencimiento: '2025-07-31T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-006', cuestionarioId: 'cst-tprm-002', titulo: 'Evaluación Desempeño Q3 2025 - CPI Card Group', descripcion: 'Evaluación trimestral Q3 de CPI. Resultado: 82/100 - Mejora en tiempos de entrega pero persisten defectos de calidad', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-008']), usuariosAsignadosNombres: JSON.stringify(['Jorge Vargas Luna']), areaId: 'operaciones', areaNombre: 'Operaciones', responsableId: 'usr-008', responsableNombre: 'Jorge Vargas Luna', fechaInicio: '2025-10-01T00:00:00Z', fechaVencimiento: '2025-10-31T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-007', cuestionarioId: 'cst-tprm-002', titulo: 'Evaluación Desempeño Q4 2025 - CPI Card Group', descripcion: 'Evaluación trimestral Q4 de CPI. Resultado: 85/100 - Mejora sostenida en calidad. Aún pendiente actualización canal SFTP', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-008']), usuariosAsignadosNombres: JSON.stringify(['Jorge Vargas Luna']), areaId: 'operaciones', areaNombre: 'Operaciones', responsableId: 'usr-008', responsableNombre: 'Jorge Vargas Luna', fechaInicio: '2026-01-06T00:00:00Z', fechaVencimiento: '2026-01-31T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-008', cuestionarioId: 'cst-tprm-002', titulo: 'Evaluación Desempeño Q3 2025 - G+D México', descripcion: 'Evaluación trimestral Q3 de G+D. Resultado: 91/100 - Excelente desempeño, mejor risk score del portafolio', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-008']), usuariosAsignadosNombres: JSON.stringify(['Jorge Vargas Luna']), areaId: 'operaciones', areaNombre: 'Operaciones', responsableId: 'usr-008', responsableNombre: 'Jorge Vargas Luna', fechaInicio: '2025-10-01T00:00:00Z', fechaVencimiento: '2025-10-31T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-009', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Inicial Valid S.A. 2024', descripcion: 'Evaluación inicial de onboarding de Valid S.A. para tarjetas biométricas. Aprobado con observaciones en manejo de templates biométricos', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-003', 'usr-004']), usuariosAsignadosNombres: JSON.stringify(['Carlos Hernández Mora', 'Roberto Torres Ramírez']), areaId: 'cumplimiento', areaNombre: 'Cumplimiento Normativo', responsableId: 'usr-003', responsableNombre: 'Carlos Hernández Mora', fechaInicio: '2024-03-01T00:00:00Z', fechaVencimiento: '2024-05-30T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-010', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Inicial Matica Technologies 2024', descripcion: 'Evaluación de onboarding de Matica Brasil. Aprobado con plan de acción para auditoría de firmware propietario', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-004']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: '2024-07-01T00:00:00Z', fechaVencimiento: '2024-09-30T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-011', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Anual CPI Card Group 2025', descripcion: 'Evaluación anual 2025 de CPI. Resultado: 76/100 - Hallazgos en destrucción de tarjetas y canal SFTP', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-004', 'usr-003']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez', 'Carlos Hernández Mora']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: '2025-02-01T00:00:00Z', fechaVencimiento: '2025-03-31T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
  { id: 'asig-tprm-012', cuestionarioId: 'cst-tprm-001', titulo: 'Due Diligence Especial Cardtec Perú - Pre-Offboarding', descripcion: 'Evaluación especial de Cardtec tras expiración de PCI-DSS. Resultado: 45/100 - DEFICIENTE. Inicia proceso de offboarding', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-003', 'usr-006']), usuariosAsignadosNombres: JSON.stringify(['Carlos Hernández Mora', 'Fernando Castillo Núñez']), areaId: 'cumplimiento', areaNombre: 'Cumplimiento Normativo', responsableId: 'usr-003', responsableNombre: 'Carlos Hernández Mora', fechaInicio: '2025-01-20T00:00:00Z', fechaVencimiento: '2025-02-15T00:00:00Z', estado: 'completado', progreso: 100, tenantId: 'tenant-005' },
];

// ============================================================
// Organigramas
// ============================================================
export const organigramas = [
  { id: 'org-tprm-001', nombre: 'Banco Emisor - Programa TPRM Embozadores', descripcion: 'Estructura organizacional del programa de gestión de riesgo de terceros (TPRM) para proveedores de embozado de tarjetas', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const nodosOrganigrama = [
  // ============================================================
  // NIVEL 1: ORGANIZATION (Raíz) - TPRM
  // ============================================================
  {
    id: 'norg-tprm-root',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Programa TPRM Embozadores',
    descripcion: 'Programa integral de gestión de riesgo de terceros (TPRM) para proveedores de embozado de tarjetas bancarias. Cubre el ciclo completo de vida del proveedor: due diligence, onboarding, gestión contractual, monitoreo continuo, evaluación de desempeño, gestión de incidentes y offboarding.',
    cargo: 'Director del Programa TPRM',
    departamento: 'Gestión de Riesgos',
    email: 'tprm@bancoglobal.mx',
    telefono: '+52 55 1234 0020',
    padreId: null,
    tipo: 'ORGANIZATION',
    icono: 'pi pi-sitemap',
    responsable: { id: 'usr-002', nombre: 'María Elena Gutiérrez Vega', email: 'mgutierrez@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-r01', nombre: 'Proveedores gestionados', tipo: 'NUMBER', valor: 8, requerido: true },
      { id: 'pc-tprm-r02', nombre: 'Proveedores críticos', tipo: 'NUMBER', valor: 2, requerido: true },
      { id: 'pc-tprm-r03', nombre: 'Metodología', tipo: 'TEXT', valor: 'ISO 27036 / NIST SP 800-161 / PCI-DSS v4.0', requerido: true },
      { id: 'pc-tprm-r04', nombre: 'Volumen total tarjetas/año', tipo: 'NUMBER', valor: 81000000, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 4,
      nivelTolerancia: 'bajo',
      descripcion: 'Tolerancia baja a riesgos de proveedores que puedan afectar operación de tarjetas, datos de clientes o certificaciones PCI-DSS'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-root-001',
        nombre: 'Gestión Integral de Riesgo de Embozadores',
        descripcion: 'Mantener un programa robusto de gestión de riesgo de terceros que proteja al banco de exposiciones derivadas de proveedores de embozado',
        kpis: [
          { id: 'kpi-tprm-r001', nombre: 'Risk Score Promedio Proveedores', valor: 61.6, meta: 50, unidad: 'puntos', umbralMaximo: 75, canales: ['in-app', 'email'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-r002', nombre: 'SLA Compliance Rate Global', valor: 87, meta: 95, unidad: '%', umbralMaximo: 80, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-r003', nombre: 'Proveedores con PCI vigente', valor: 6, meta: 8, unidad: 'cantidad', umbralMaximo: 6, canales: ['in-app', 'email', 'webhook'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-r004', nombre: 'Concentración máxima en un proveedor', valor: 65, meta: 40, unidad: '%', umbralMaximo: 50, canales: ['in-app', 'email'], frecuencia: 'trimestral' }
        ]
      }
    ]
  },

  // ============================================================
  // NIVEL 2: ÁREAS (4 áreas)
  // ============================================================

  // ÁREA 1: Due Diligence y Onboarding
  {
    id: 'norg-tprm-area-001',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Due Diligence y Onboarding',
    descripcion: 'Área responsable de la evaluación integral de proveedores de embozado antes de su contratación. Cubre solvencia financiera, certificaciones PCI-DSS, seguridad física/lógica, BCP/DRP, capacidad productiva y gestión de subcontratistas.',
    cargo: 'Gerente de Due Diligence TPRM',
    departamento: 'Due Diligence',
    email: 'tprm.dd@bancoglobal.mx',
    telefono: '+52 55 1234 0021',
    padreId: 'norg-tprm-root',
    tipo: 'AREA',
    icono: 'pi pi-search',
    responsable: { id: 'usr-003', nombre: 'Carlos Hernández Mora', email: 'chernandez@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-a101', nombre: 'Código de área', tipo: 'TEXT', valor: 'TPRM-DD-001', requerido: true },
      { id: 'pc-tprm-a102', nombre: 'Analistas asignados', tipo: 'NUMBER', valor: 4, requerido: false },
      { id: 'pc-tprm-a103', nombre: 'Evaluaciones en curso', tipo: 'NUMBER', valor: 3, requerido: false },
      { id: 'pc-tprm-a104', nombre: 'Frecuencia de evaluación', tipo: 'TEXT', valor: 'Anual + ad-hoc para nuevos proveedores', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Cero tolerancia a la contratación de proveedores sin evaluación completa de due diligence'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-dd-001',
        nombre: 'Evaluación Rigurosa de Proveedores',
        descripcion: 'Completar due diligence integral del 100% de proveedores antes de contratación y renovación anual',
        kpis: [
          { id: 'kpi-tprm-dd001', nombre: 'Due Diligence Completados a Tiempo', valor: 67, meta: 100, unidad: '%', umbralMaximo: 80, canales: ['in-app', 'email'], frecuencia: 'trimestral' },
          { id: 'kpi-tprm-dd002', nombre: 'Proveedores con DD vigente', valor: 7, meta: 8, unidad: 'cantidad', umbralMaximo: 6, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // ÁREA 2: Gestión de Contratos y SLAs
  {
    id: 'norg-tprm-area-002',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Gestión de Contratos y SLAs',
    descripcion: 'Área encargada de la gestión contractual con proveedores de embozado. Incluye definición de SLAs, cláusulas de auditoría, esquemas de penalización, protección de datos financieros y obligaciones de reporting.',
    cargo: 'Gerente de Contratos TPRM',
    departamento: 'Contratos y SLAs',
    email: 'tprm.contratos@bancoglobal.mx',
    telefono: '+52 55 1234 0022',
    padreId: 'norg-tprm-root',
    tipo: 'AREA',
    icono: 'pi pi-file',
    responsable: { id: 'usr-007', nombre: 'Laura Mendoza Díaz', email: 'lmendoza@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/women/7.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-a201', nombre: 'Código de área', tipo: 'TEXT', valor: 'TPRM-CTR-001', requerido: true },
      { id: 'pc-tprm-a202', nombre: 'Contratos vigentes', tipo: 'NUMBER', valor: 7, requerido: false },
      { id: 'pc-tprm-a203', nombre: 'Contratos por vencer (6 meses)', tipo: 'NUMBER', valor: 2, requerido: false },
      { id: 'pc-tprm-a204', nombre: 'SLA estándar entrega', tipo: 'TEXT', valor: '5 días hábiles', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Tolerancia baja a cláusulas contractuales débiles que expongan al banco ante incumplimientos del proveedor'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-ctr-001',
        nombre: 'Cumplimiento Contractual y SLAs',
        descripcion: 'Asegurar que todos los contratos incluyan cláusulas robustas y que los SLAs se cumplan consistentemente',
        kpis: [
          { id: 'kpi-tprm-ctr001', nombre: 'SLA Compliance Rate', valor: 87, meta: 95, unidad: '%', umbralMaximo: 80, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-ctr002', nombre: 'Contratos con cláusula right-to-audit', valor: 6, meta: 8, unidad: 'cantidad', umbralMaximo: 6, canales: ['in-app'], frecuencia: 'trimestral' }
        ]
      }
    ]
  },

  // ÁREA 3: Monitoreo Continuo y Riesgos
  {
    id: 'norg-tprm-area-003',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Monitoreo Continuo y Riesgos',
    descripcion: 'Área responsable del monitoreo continuo de exposición al riesgo de proveedores de embozado. Evalúa risk scores, cambios en certificaciones PCI, postura de seguridad, riesgos emergentes y concentración operacional.',
    cargo: 'Gerente de Monitoreo de Riesgos TPRM',
    departamento: 'Monitoreo de Riesgos',
    email: 'tprm.riesgos@bancoglobal.mx',
    telefono: '+52 55 1234 0023',
    padreId: 'norg-tprm-root',
    tipo: 'AREA',
    icono: 'pi pi-chart-line',
    responsable: { id: 'usr-005', nombre: 'Ana Patricia López García', email: 'alopez@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-a301', nombre: 'Código de área', tipo: 'TEXT', valor: 'TPRM-MON-001', requerido: true },
      { id: 'pc-tprm-a302', nombre: 'Riesgos activos', tipo: 'NUMBER', valor: 23, requerido: false },
      { id: 'pc-tprm-a303', nombre: 'Hallazgos abiertos', tipo: 'NUMBER', valor: 12, requerido: false },
      { id: 'pc-tprm-a304', nombre: 'Frecuencia de monitoreo', tipo: 'TEXT', valor: 'Continuo + evaluación trimestral', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Monitoreo proactivo de riesgos con tolerancia baja a exposiciones no detectadas'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-mon-001',
        nombre: 'Control de Riesgo de Embozadores',
        descripcion: 'Mantener risk score de todos los proveedores dentro de umbrales aceptables y detectar riesgos emergentes',
        kpis: [
          { id: 'kpi-tprm-mon001', nombre: 'Risk Score Promedio', valor: 61.6, meta: 50, unidad: 'puntos', umbralMaximo: 75, canales: ['in-app', 'email'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-mon002', nombre: 'Hallazgos Críticos Abiertos', valor: 3, meta: 0, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-mon003', nombre: 'Evaluaciones trimestrales al día', valor: 80, meta: 100, unidad: '%', umbralMaximo: 75, canales: ['in-app'], frecuencia: 'trimestral' }
        ]
      }
    ]
  },

  // ÁREA 4: Operaciones y Desempeño
  {
    id: 'norg-tprm-area-004',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Operaciones y Desempeño',
    descripcion: 'Área responsable del seguimiento operativo de proveedores de embozado. Mide cumplimiento de SLAs, calidad de producción, tasas de defectos, tiempos de entrega, capacidad de respuesta y gestión de incidentes operativos.',
    cargo: 'Gerente de Operaciones TPRM',
    departamento: 'Operaciones TPRM',
    email: 'tprm.operaciones@bancoglobal.mx',
    telefono: '+52 55 1234 0024',
    padreId: 'norg-tprm-root',
    tipo: 'AREA',
    icono: 'pi pi-cog',
    responsable: { id: 'usr-008', nombre: 'Jorge Vargas Luna', email: 'jvargas@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-a401', nombre: 'Código de área', tipo: 'TEXT', valor: 'TPRM-OPS-001', requerido: true },
      { id: 'pc-tprm-a402', nombre: 'Incidentes activos', tipo: 'NUMBER', valor: 4, requerido: false },
      { id: 'pc-tprm-a403', nombre: 'Defectos en seguimiento', tipo: 'NUMBER', valor: 13, requerido: false },
      { id: 'pc-tprm-a404', nombre: 'MTTR objetivo', tipo: 'TEXT', valor: '4 horas', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 3,
      impacto: 3,
      nivelTolerancia: 'moderado',
      descripcion: 'Tolerancia moderada a incidentes operativos menores, pero baja para incidentes que afecten datos de tarjetahabientes'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-ops-001',
        nombre: 'Excelencia Operativa de Embozadores',
        descripcion: 'Asegurar que proveedores cumplan SLAs, mantengan calidad de producción y respondan oportunamente a incidentes',
        kpis: [
          { id: 'kpi-tprm-ops001', nombre: 'Tiempo promedio entrega tarjetas', valor: 6.2, meta: 5, unidad: 'días', umbralMaximo: 7, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-ops002', nombre: 'Tasa de defectos producción', valor: 1.8, meta: 1.0, unidad: '%', umbralMaximo: 2.5, canales: ['in-app'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-ops003', nombre: 'MTTR incidentes proveedor', valor: 8, meta: 4, unidad: 'horas', umbralMaximo: 12, canales: ['in-app', 'email'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  // ============================================================
  // NIVEL 3: SUBÁREAS (4 subáreas - 1 por cada área)
  // ============================================================

  // SUBÁREA 1: Evaluación de Proveedores (bajo Due Diligence)
  {
    id: 'norg-tprm-sub-001',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Evaluación de Proveedores',
    descripcion: 'Subárea especializada en la ejecución de evaluaciones de due diligence, cuestionarios PCI-DSS, verificación de certificaciones, auditoría de controles de seguridad y análisis de capacidad operativa de embozadores.',
    cargo: 'Coordinador de Evaluaciones TPRM',
    departamento: 'Evaluaciones',
    email: 'tprm.evaluaciones@bancoglobal.mx',
    telefono: '+52 55 1234 0025',
    padreId: 'norg-tprm-area-001',
    tipo: 'SUBAREA',
    icono: 'pi pi-list',
    responsable: { id: 'usr-006', nombre: 'Fernando Castillo Núñez', email: 'fcastillo@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/men/6.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-s101', nombre: 'Cuestionarios activos', tipo: 'NUMBER', valor: 2, requerido: false },
      { id: 'pc-tprm-s102', nombre: 'Evaluaciones completadas 2025', tipo: 'NUMBER', valor: 12, requerido: false },
      { id: 'pc-tprm-s103', nombre: 'Framework', tipo: 'TEXT', valor: 'PCI-DSS v4.0 / ISO 27036', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Sin tolerancia a evaluaciones incompletas o sesgadas que permitan onboarding de proveedores riesgosos'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-eval-001',
        nombre: 'Calidad de Evaluaciones',
        descripcion: 'Ejecutar evaluaciones rigurosas y completas que identifiquen todos los riesgos relevantes del proveedor',
        kpis: [
          { id: 'kpi-tprm-eval001', nombre: 'Cobertura de controles evaluados', valor: 92, meta: 100, unidad: '%', umbralMaximo: 85, canales: ['in-app'], frecuencia: 'trimestral' },
          { id: 'kpi-tprm-eval002', nombre: 'Hallazgos detectados por evaluación', valor: 4.2, meta: 5, unidad: 'promedio', umbralMaximo: 2, canales: ['in-app'], frecuencia: 'trimestral' }
        ]
      }
    ]
  },

  // SUBÁREA 2: Cumplimiento Contractual (bajo Gestión de Contratos)
  {
    id: 'norg-tprm-sub-002',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Cumplimiento Contractual',
    descripcion: 'Subárea dedicada al seguimiento del cumplimiento de obligaciones contractuales, penalizaciones por incumplimiento de SLA, vigencia de contratos y renovaciones.',
    cargo: 'Coordinador de Cumplimiento Contractual',
    departamento: 'Cumplimiento Contractual',
    email: 'tprm.cumplimiento.contractual@bancoglobal.mx',
    telefono: '+52 55 1234 0026',
    padreId: 'norg-tprm-area-002',
    tipo: 'SUBAREA',
    icono: 'pi pi-check-square',
    responsable: { id: 'usr-013', nombre: 'Sofía Delgado Cruz', email: 'sdelgado@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-s201', nombre: 'Penalizaciones aplicadas YTD', tipo: 'NUMBER', valor: 3, requerido: false },
      { id: 'pc-tprm-s202', nombre: 'Contratos con cláusula PCI', tipo: 'NUMBER', valor: 7, requerido: true },
      { id: 'pc-tprm-s203', nombre: 'Renovaciones pendientes', tipo: 'NUMBER', valor: 2, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Tolerancia baja a incumplimientos contractuales que afecten la seguridad de datos de tarjetahabientes'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-cc-001',
        nombre: 'Gestión Contractual Efectiva',
        descripcion: 'Mantener contratos actualizados con cláusulas robustas y monitorear su cumplimiento',
        kpis: [
          { id: 'kpi-tprm-cc001', nombre: 'Contratos con cláusulas actualizadas', valor: 6, meta: 8, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app'], frecuencia: 'trimestral' },
          { id: 'kpi-tprm-cc002', nombre: 'Tiempo de resolución de incumplimientos', valor: 15, meta: 10, unidad: 'días', umbralMaximo: 30, canales: ['in-app', 'email'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // SUBÁREA 3: Inteligencia de Riesgos de Terceros (bajo Monitoreo Continuo)
  {
    id: 'norg-tprm-sub-003',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Inteligencia de Riesgos de Terceros',
    descripcion: 'Subárea especializada en la recopilación y análisis de inteligencia de riesgos de proveedores: monitoreo de certificaciones, cambios regulatorios, riesgos geopolíticos, estabilidad financiera y amenazas emergentes.',
    cargo: 'Coordinador de Inteligencia de Riesgos',
    departamento: 'Inteligencia de Riesgos',
    email: 'tprm.inteligencia@bancoglobal.mx',
    telefono: '+52 55 1234 0027',
    padreId: 'norg-tprm-area-003',
    tipo: 'SUBAREA',
    icono: 'pi pi-eye',
    responsable: { id: 'usr-010', nombre: 'Miguel Ángel Ruiz', email: 'maruiz@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-s301', nombre: 'Fuentes de inteligencia', tipo: 'NUMBER', valor: 12, requerido: false },
      { id: 'pc-tprm-s302', nombre: 'Alertas generadas/mes', tipo: 'NUMBER', valor: 8, requerido: false },
      { id: 'pc-tprm-s303', nombre: 'Herramientas de monitoreo', tipo: 'TEXT', valor: 'BitSight, SecurityScorecard, Moody\'s', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Detección temprana de riesgos para prevenir materialización de amenazas'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-intel-001',
        nombre: 'Detección Temprana de Riesgos',
        descripcion: 'Identificar y comunicar riesgos emergentes de proveedores antes de que impacten la operación',
        kpis: [
          { id: 'kpi-tprm-int001', nombre: 'Tiempo de detección de riesgos', valor: 5, meta: 2, unidad: 'días', umbralMaximo: 10, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-int002', nombre: 'Riesgos identificados proactivamente', valor: 70, meta: 90, unidad: '%', umbralMaximo: 50, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // SUBÁREA 4: Gestión de Incidentes y Offboarding (bajo Operaciones)
  {
    id: 'norg-tprm-sub-004',
    organigramaId: 'org-tprm-001', tenantId: 'tenant-005',
    nombre: 'Gestión de Incidentes y Offboarding',
    descripcion: 'Subárea encargada de la respuesta a incidentes originados en proveedores de embozado y de la terminación controlada de relaciones comerciales. Coordina contención, análisis forense, comunicación a reguladores y transferencia operativa.',
    cargo: 'Coordinador de Incidentes y Offboarding',
    departamento: 'Incidentes y Offboarding',
    email: 'tprm.incidentes@bancoglobal.mx',
    telefono: '+52 55 1234 0028',
    padreId: 'norg-tprm-area-004',
    tipo: 'SUBAREA',
    icono: 'pi pi-exclamation-triangle',
    responsable: { id: 'usr-004', nombre: 'Roberto Torres Ramírez', email: 'rtorres@bancoglobal.mx', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-s401', nombre: 'Incidentes activos', tipo: 'NUMBER', valor: 4, requerido: false },
      { id: 'pc-tprm-s402', nombre: 'Offboardings en proceso', tipo: 'NUMBER', valor: 1, requerido: false },
      { id: 'pc-tprm-s403', nombre: 'SLA notificación incidente', tipo: 'TEXT', valor: '2 horas', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 4,
      nivelTolerancia: 'bajo',
      descripcion: 'Respuesta rápida y efectiva a todos los incidentes de proveedores que afecten datos o servicios'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-inc-001',
        nombre: 'Respuesta Efectiva a Incidentes',
        descripcion: 'Contener y resolver incidentes de proveedores minimizando impacto al banco y tarjetahabientes',
        kpis: [
          { id: 'kpi-tprm-inc001', nombre: 'MTTR incidentes proveedor', valor: 8, meta: 4, unidad: 'horas', umbralMaximo: 12, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-inc002', nombre: 'Incidentes con causa raíz', valor: 78, meta: 95, unidad: '%', umbralMaximo: 70, canales: ['in-app'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-inc003', nombre: 'Offboardings completados sin fuga', valor: 100, meta: 100, unidad: '%', umbralMaximo: 100, canales: ['in-app', 'email'], frecuencia: 'trimestral' }
        ]
      }
    ]
  }
];

// ============================================================
// Dashboard
// ============================================================
export const dashboardConfigs = [
  { id: 'dash-tprm-001', nombre: 'Dashboard TPRM Embozadores', descripcion: 'Panel de monitoreo de proveedores de embozado de tarjetas', isDefault: true, columns: 12, rowHeight: 50, gap: 10, tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const dashboardWidgets = [
  { id: 'dw-tprm-001', dashboardId: 'dash-tprm-001', tipo: 'kpi-card', titulo: 'Risk Score Promedio', config: JSON.stringify({ kpiType: 'risk_score', color: 'orange' }), x: 0, y: 0, cols: 3, rows: 2, tenantId: 'tenant-005' },
  { id: 'dw-tprm-002', dashboardId: 'dash-tprm-001', tipo: 'kpi-card', titulo: 'SLA Compliance Rate', config: JSON.stringify({ kpiType: 'sla_compliance', color: 'cyan' }), x: 3, y: 0, cols: 3, rows: 2, tenantId: 'tenant-005' },
  { id: 'dw-tprm-003', dashboardId: 'dash-tprm-001', tipo: 'kpi-card', titulo: 'Incidentes Activos', config: JSON.stringify({ kpiType: 'incidents', color: 'red' }), x: 6, y: 0, cols: 3, rows: 2, tenantId: 'tenant-005' },
  { id: 'dw-tprm-004', dashboardId: 'dash-tprm-001', tipo: 'kpi-card', titulo: 'Hallazgos Abiertos', config: JSON.stringify({ kpiType: 'findings', color: 'purple' }), x: 9, y: 0, cols: 3, rows: 2, tenantId: 'tenant-005' },
  { id: 'dw-tprm-005', dashboardId: 'dash-tprm-001', tipo: 'graficas-interactivas', titulo: 'Riesgo por Proveedor', subtitulo: 'Risk score y tendencia por embozador', config: JSON.stringify({ chartType: 'bar' }), x: 0, y: 2, cols: 6, rows: 5, tenantId: 'tenant-005' },
  { id: 'dw-tprm-006', dashboardId: 'dash-tprm-001', tipo: 'table-mini', titulo: 'Proveedores', config: JSON.stringify({ entity: 'activos' }), x: 6, y: 2, cols: 6, rows: 5, tenantId: 'tenant-005' },
  { id: 'dw-tprm-007', dashboardId: 'dash-tprm-001', tipo: 'actividad-enhanced', titulo: 'Últimas Actividades TPRM', config: JSON.stringify({}), x: 0, y: 7, cols: 6, rows: 4, tenantId: 'tenant-005' },
  { id: 'dw-tprm-008', dashboardId: 'dash-tprm-001', tipo: 'calendario', titulo: 'Vencimientos y Evaluaciones', config: JSON.stringify({}), x: 6, y: 7, cols: 6, rows: 4, tenantId: 'tenant-005' },
];

// ============================================================
// Notificaciones
// ============================================================
export const notificationRules = [
  // === TPRM: Reglas de notificación ===
  { id: 'nr-tprm-001', nombre: 'Certificación PCI-DSS próxima a vencer', descripcion: 'Notifica cuando la certificación PCI-DSS de un proveedor de embozado está a 90 días de expirar', entidadTipo: 'RISK', eventoTipo: 'EXPIRATION', activo: true, notificarCreador: false, notificarResponsable: true, notificarAprobadores: true, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas', 'Coordinador']), enviarInApp: true, enviarEmail: true, plantillaMensaje: 'ALERTA: La certificación PCI-DSS del proveedor {nombre} vence en {dias} días. Se requiere iniciar proceso de renovación o evaluación de alternativas.', severidad: 'warning', tenantId: 'tenant-005' },
  { id: 'nr-tprm-002', nombre: 'Evaluación de Due Diligence completada', descripcion: 'Notifica cuando se completa una evaluación de due diligence de un proveedor de embozado', entidadTipo: 'QUESTIONNAIRE', eventoTipo: 'COMPLETE', activo: true, notificarCreador: true, notificarResponsable: true, notificarAprobadores: false, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se ha completado la evaluación de Due Diligence del proveedor de embozado: {nombre}. Resultado: {resultado}/100.', severidad: 'info', tenantId: 'tenant-005' },
  { id: 'nr-tprm-003', nombre: 'Incidente de proveedor reportado', descripcion: 'Notifica cuando se reporta un incidente originado en un proveedor de embozado de tarjetas', entidadTipo: 'INCIDENT', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, notificarAprobadores: false, rolesDestino: JSON.stringify(['Director', 'Coordinador', 'Gestor Áreas']), enviarInApp: true, enviarEmail: true, plantillaMensaje: 'Se ha reportado un incidente del proveedor de embozado: {titulo}. Severidad: {severidad}. Se requiere acción inmediata.', severidad: 'critical', tenantId: 'tenant-005' },
  { id: 'nr-tprm-004', nombre: 'SLA compliance bajo umbral', descripcion: 'Notifica cuando el cumplimiento de SLA de un proveedor de embozado cae por debajo del 80%', entidadTipo: 'RISK', eventoTipo: 'THRESHOLD', activo: true, notificarCreador: false, notificarResponsable: true, notificarAprobadores: false, rolesDestino: JSON.stringify(['Director', 'Coordinador']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'ALERTA: El cumplimiento de SLA del proveedor {nombre} ha caído a {valor}%, por debajo del umbral mínimo del 80%.', severidad: 'warning', tenantId: 'tenant-005' },
];

export const alertRules = [
  // === TPRM: Reglas de alerta ===
  { id: 'ar-tprm-001', nombre: 'Risk score excede umbral', descripcion: 'Alerta cuando el risk score de un proveedor de embozado supera 75 puntos', entidadTipo: 'RISK', metricaNombre: 'vendor_risk_score', operador: 'GT', valorUmbral: 75, tipoAgregacion: 'MAX', activo: true, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, enviarEmail: true, severidad: 'critical', cooldownMinutos: 1440, tenantId: 'tenant-005' },
  { id: 'ar-tprm-002', nombre: 'SLA compliance bajo 80%', descripcion: 'Alerta cuando el cumplimiento de SLA de proveedores de embozado cae por debajo del 80%', entidadTipo: 'RISK', metricaNombre: 'sla_compliance_rate', operador: 'LT', valorUmbral: 80, tipoAgregacion: 'AVG', activo: true, rolesDestino: JSON.stringify(['Director', 'Coordinador']), enviarInApp: true, enviarEmail: false, severidad: 'warning', cooldownMinutos: 2880, tenantId: 'tenant-005' },
  { id: 'ar-tprm-003', nombre: 'Incidentes críticos abiertos >48h', descripcion: 'Alerta cuando hay incidentes críticos de proveedores de embozado sin resolver por más de 48 horas', entidadTipo: 'INCIDENT', metricaNombre: 'critical_unresolved_48h', operador: 'GT', valorUmbral: 0, tipoAgregacion: 'COUNT', activo: true, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas', 'Coordinador']), enviarInApp: true, enviarEmail: true, severidad: 'critical', cooldownMinutos: 720, tenantId: 'tenant-005' },
];

export const notifications = [
  // === TPRM: Notificaciones ===
  { id: 'ntf-tprm-001', usuarioId: 'usr-004', tipo: 'ALERT', titulo: 'Subcontratista de Thales sin PCI vigente', mensaje: 'ALERTA CRÍTICA: Se detectó que el subcontratista de impresión de Thales DIS no tiene certificación PCI-DSS vigente. Se requiere acción inmediata.', severidad: 'critical', entidadTipo: 'INCIDENT', entidadId: 'inc-tprm-004', entidadNombre: 'Subcontratista sin PCI', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver incidente', url: '/incidentes/inc-tprm-004' }]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'ntf-tprm-002', usuarioId: 'usr-008', tipo: 'NOTIFICATION', titulo: 'Lote defectuoso de CPI Card Group', mensaje: 'CPI Card Group reportó un lote de 15,000 tarjetas con chip EMV defectuoso. El proveedor está procesando reposición.', severidad: 'warning', entidadTipo: 'INCIDENT', entidadId: 'inc-tprm-001', entidadNombre: 'Lote defectuoso', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver detalle', url: '/incidentes/inc-tprm-001' }]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'ntf-tprm-003', usuarioId: 'usr-003', tipo: 'EXPIRATION_REMINDER', titulo: 'Contrato Thales DIS próximo a vencer', mensaje: 'El contrato con Thales DIS vence el 31 de marzo de 2026. Se debe iniciar proceso de renovación o offboarding.', severidad: 'warning', entidadTipo: 'RISK', entidadId: 'rsk-tprm-008', entidadNombre: 'Contrato Thales', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver proveedor', url: '/activos/act-tprm-003' }]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'ntf-tprm-004', usuarioId: 'usr-004', tipo: 'ALERT', titulo: 'Cardtec Perú: PCI-DSS expirado - Offboarding requerido', mensaje: 'URGENTE: Cardtec Perú tiene certificación PCI-DSS expirada desde hace 6 meses. Due Diligence especial resultó 45/100 (Deficiente). Se inició proceso de offboarding.', severidad: 'critical', entidadTipo: 'RISK', entidadId: 'rsk-tprm-019', entidadNombre: 'PCI Cardtec', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver proveedor', url: '/activos/act-tprm-008' }, { tipo: 'danger', label: 'Ver offboarding', url: '/procesos/prc-tprm-006' }]), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'ntf-tprm-005', usuarioId: 'usr-008', tipo: 'NOTIFICATION', titulo: 'Evaluación Q4 CPI completada: 85/100', mensaje: 'La evaluación de desempeño Q4 2025 de CPI Card Group ha sido completada con resultado 85/100. Mejora sostenida respecto a Q3 (82/100).', severidad: 'info', entidadTipo: 'QUESTIONNAIRE', entidadNombre: 'Evaluación Q4 CPI', leida: true, fechaLeida: '2026-02-01T10:00:00Z', acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver evaluación', url: '/cumplimiento/asignaciones/asig-tprm-007' }]), tenantId: 'tenant-005', createdAt: '2026-01-31T16:00:00Z' },
  { id: 'ntf-tprm-006', usuarioId: 'usr-005', tipo: 'NOTIFICATION', titulo: 'Matica envió datos de otro banco - Incidente crítico', mensaje: 'Matica Technologies personalizó 1,200 tarjetas con datos de otro cliente bancario. Incidente de confidencialidad escalado a dirección.', severidad: 'critical', entidadTipo: 'INCIDENT', entidadId: 'inc-tprm-010', entidadNombre: 'Segregación Matica', leida: true, fechaLeida: '2025-01-09T08:00:00Z', acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver incidente', url: '/incidentes/inc-tprm-010' }]), tenantId: 'tenant-005', createdAt: '2025-01-08T09:30:00Z' },
  { id: 'ntf-tprm-007', usuarioId: 'usr-004', tipo: 'NOTIFICATION', titulo: 'G+D México: Mejor risk score del portafolio (42)', mensaje: 'G+D obtuvo un risk score de 42 en la última evaluación, el más bajo (mejor) de todos los proveedores de embozado. Modelo de referencia para otros proveedores.', severidad: 'info', entidadTipo: 'RISK', entidadNombre: 'Risk Score G+D', leida: true, fechaLeida: '2026-01-15T10:00:00Z', acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver proveedor', url: '/activos/act-tprm-006' }]), tenantId: 'tenant-005', createdAt: '2026-01-14T14:00:00Z' },
];

// ============================================================
// Proyectos
// ============================================================
export const projects = [
  // === TPRM: Proyecto de implementación ===
  { id: 'prj-tprm-001', name: 'Implementación Programa TPRM - Embozadores', description: 'Implementación del programa integral de gestión de riesgo de terceros (TPRM) enfocado en proveedores de embozado de tarjetas. Incluye Due Diligence, gestión contractual, monitoreo continuo, evaluación de desempeño, gestión de incidentes y proceso de offboarding.', startDate: '2025-02-06', endDate: '2025-12-31', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 35, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const projectPhases = [
  // === TPRM: Fases del proyecto ===
  { id: 'phase-tprm-001', projectId: 'prj-tprm-001', name: 'Due Diligence Inicial de Proveedores', description: 'Evaluación integral de los 3 proveedores actuales de embozado: CPI Card Group, IDEMIA y Thales DIS', orderNum: 1, startDate: '2025-02-06', endDate: '2025-04-30', status: 'in_progress', weight: 25, progress: 55, tenantId: 'tenant-005' },
  { id: 'phase-tprm-002', projectId: 'prj-tprm-001', name: 'Definición de Contratos y SLAs', description: 'Revisión y actualización de contratos con cláusulas de auditoría, SLAs, penalizaciones y obligaciones de reporting', orderNum: 2, startDate: '2025-05-01', endDate: '2025-07-31', status: 'pending', weight: 20, progress: 0, tenantId: 'tenant-005' },
  { id: 'phase-tprm-003', projectId: 'prj-tprm-001', name: 'Implementación de Monitoreo Continuo', description: 'Establecer framework de monitoreo continuo de riesgo de terceros con evaluaciones trimestrales', orderNum: 3, startDate: '2025-08-01', endDate: '2025-10-31', status: 'pending', weight: 30, progress: 0, tenantId: 'tenant-005' },
  { id: 'phase-tprm-004', projectId: 'prj-tprm-001', name: 'Procesos de Incidentes y Offboarding', description: 'Definir e implementar procesos de gestión de incidentes y terminación controlada de relaciones', orderNum: 4, startDate: '2025-11-01', endDate: '2025-12-31', status: 'pending', weight: 25, progress: 0, tenantId: 'tenant-005' },
];

export const tasks = [
  // === TPRM: Tareas del proyecto ===
  { id: 'task-tprm-001', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Completar Due Diligence de CPI Card Group', description: 'Ejecutar cuestionario completo de evaluación: seguridad física, PCI-DSS, BCP, datos de tarjetahabientes', type: 'audit', priority: 'critical', status: 'in_progress', progress: 35, assignedTo: 'usr-004', startDate: '2025-02-10', dueDate: '2025-03-15', estimatedHours: 60, actualHours: 22, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-002', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Evaluación de riesgo de concentración en CPI', description: 'Analizar nivel de concentración del 65% del volumen en CPI y definir plan de mitigación', type: 'analysis', priority: 'high', status: 'in_progress', progress: 50, assignedTo: 'usr-005', startDate: '2025-02-15', dueDate: '2025-03-30', estimatedHours: 24, actualHours: 12, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-003', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Verificar migración PCI-DSS v4.0 de Thales', description: 'Evaluar plan de migración de Thales de PCI-DSS v3.2.1 a v4.0 y validar timeline', type: 'audit', priority: 'critical', status: 'pending', progress: 0, assignedTo: 'usr-003', startDate: '2025-03-01', dueDate: '2025-03-31', estimatedHours: 32, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-004', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Auditar subcontratista de impresión de Thales', description: 'Verificar controles PCI y seguridad del subcontratista de impresión utilizado por Thales DIS', type: 'audit', priority: 'critical', status: 'in_progress', progress: 20, assignedTo: 'usr-004', startDate: '2025-02-20', dueDate: '2025-04-15', estimatedHours: 40, actualHours: 8, createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-005', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Clasificar criticidad y risk score de cada proveedor', description: 'Calcular risk score basado en evaluaciones y clasificar criticidad de CPI, IDEMIA y Thales', type: 'analysis', priority: 'high', status: 'pending', progress: 0, assignedTo: 'usr-005', startDate: '2025-04-01', dueDate: '2025-04-30', estimatedHours: 16, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-006', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Due Diligence de G+D, Valid, Matica y Entrust', description: 'Completar evaluación de onboarding de los 4 proveedores adicionales incorporados al portafolio TPRM', type: 'audit', priority: 'high', status: 'completed', progress: 100, assignedTo: 'usr-004', startDate: '2025-02-15', dueDate: '2025-04-15', estimatedHours: 80, actualHours: 72, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: '2025-02-15T00:00:00Z' },
  { id: 'task-tprm-007', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-001', title: 'Iniciar proceso de offboarding de Cardtec Perú', description: 'Tras resultado deficiente en DD especial (45/100) y PCI expirado, iniciar terminación controlada de relación con Cardtec', type: 'implementation', priority: 'critical', status: 'in_progress', progress: 30, assignedTo: 'usr-003', startDate: '2025-02-20', dueDate: '2025-05-31', estimatedHours: 48, actualHours: 14, createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: '2025-02-20T00:00:00Z' },
  // === TPRM: Tareas Fase 2 - Contratos y SLAs ===
  { id: 'task-tprm-008', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-002', title: 'Revisar cláusulas de auditoría en contratos vigentes', description: 'Analizar y actualizar cláusulas de right-to-audit en los 7 contratos activos de embozado. Asegurar acceso a instalaciones, sistemas y subcontratistas.', type: 'review', priority: 'high', status: 'pending', progress: 0, assignedTo: 'usr-003', startDate: '2025-05-01', dueDate: '2025-06-15', estimatedHours: 40, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-009', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-002', title: 'Definir SLAs estandarizados para todos los embozadores', description: 'Crear framework de SLAs unificado: tiempo entrega (5d), defect rate (<1%), MTTR incidentes (<4h), notificación (<2h)', type: 'documentation', priority: 'high', status: 'pending', progress: 0, assignedTo: 'usr-008', startDate: '2025-05-15', dueDate: '2025-06-30', estimatedHours: 32, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-010', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-002', title: 'Negociar penalizaciones por incumplimiento de SLA', description: 'Definir esquema de penalizaciones financieras y operativas por incumplimiento de SLA con cada proveedor', type: 'implementation', priority: 'medium', status: 'pending', progress: 0, assignedTo: 'usr-003', startDate: '2025-06-15', dueDate: '2025-07-31', estimatedHours: 24, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === TPRM: Tareas Fase 3 - Monitoreo Continuo ===
  { id: 'task-tprm-011', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-003', title: 'Implementar dashboard de monitoreo TPRM en tiempo real', description: 'Configurar dashboard con KPIs de todos los proveedores: risk score, SLA compliance, incidents, defect rate, contract expiry', type: 'implementation', priority: 'critical', status: 'pending', progress: 0, assignedTo: 'usr-005', startDate: '2025-08-01', dueDate: '2025-09-30', estimatedHours: 60, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-012', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-003', title: 'Definir alertas automáticas de riesgo de terceros', description: 'Configurar alertas automáticas: PCI a punto de vencer, risk score >75, SLA compliance <80%, concentración >50%', type: 'configuration', priority: 'high', status: 'pending', progress: 0, assignedTo: 'usr-004', startDate: '2025-09-01', dueDate: '2025-10-15', estimatedHours: 24, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === TPRM: Tareas Fase 4 - Incidentes y Offboarding ===
  { id: 'task-tprm-013', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-004', title: 'Documentar playbook de respuesta a incidentes de proveedores', description: 'Crear guía paso a paso de respuesta ante incidentes originados en embozadores: escalamiento, contención, comunicación a reguladores, plan de remediación', type: 'documentation', priority: 'high', status: 'pending', progress: 0, assignedTo: 'usr-004', startDate: '2025-11-01', dueDate: '2025-11-30', estimatedHours: 32, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'task-tprm-014', projectId: 'prj-tprm-001', phaseId: 'phase-tprm-004', title: 'Crear checklist de offboarding seguro de embozadores', description: 'Definir proceso de terminación controlada: destrucción de datos, revocación de accesos, transferencia operativa, retención documental', type: 'documentation', priority: 'medium', status: 'pending', progress: 0, assignedTo: 'usr-003', startDate: '2025-12-01', dueDate: '2025-12-31', estimatedHours: 20, createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

// ============================================================
// TPRM Dashboard - Métricas Trimestrales
// ============================================================
export const tprmQuarterlyMetrics = [
  // CPI Card Group - Q4-2025
  { id: 'tqm-001', providerId: 'act-tprm-001', providerName: 'CPI Card Group', quarter: 'Q4-2025', incidents: 3, defects: 5, avgRiskScore: 78, slaCompliance: 82, volume: 1950000, tenantId: 'tenant-005' },
  // CPI Card Group - Q1-2026
  { id: 'tqm-002', providerId: 'act-tprm-001', providerName: 'CPI Card Group', quarter: 'Q1-2026', incidents: 4, defects: 7, avgRiskScore: 85, slaCompliance: 76, volume: 2100000, tenantId: 'tenant-005' },
  // IDEMIA - Q4-2025
  { id: 'tqm-003', providerId: 'act-tprm-002', providerName: 'IDEMIA', quarter: 'Q4-2025', incidents: 1, defects: 2, avgRiskScore: 42, slaCompliance: 94, volume: 780000, tenantId: 'tenant-005' },
  // IDEMIA - Q1-2026
  { id: 'tqm-004', providerId: 'act-tprm-002', providerName: 'IDEMIA', quarter: 'Q1-2026', incidents: 0, defects: 1, avgRiskScore: 35, slaCompliance: 97, volume: 800000, tenantId: 'tenant-005' },
  // Thales DIS - Q4-2025
  { id: 'tqm-005', providerId: 'act-tprm-003', providerName: 'Thales DIS', quarter: 'Q4-2025', incidents: 2, defects: 4, avgRiskScore: 68, slaCompliance: 85, volume: 600000, tenantId: 'tenant-005' },
  // Thales DIS - Q1-2026
  { id: 'tqm-006', providerId: 'act-tprm-003', providerName: 'Thales DIS', quarter: 'Q1-2026', incidents: 3, defects: 6, avgRiskScore: 74, slaCompliance: 79, volume: 580000, tenantId: 'tenant-005' },
  // Entrust Datacard - Q4-2025
  { id: 'tqm-007', providerId: 'act-tprm-004', providerName: 'Entrust Datacard', quarter: 'Q4-2025', incidents: 1, defects: 1, avgRiskScore: 45, slaCompliance: 91, volume: 420000, tenantId: 'tenant-005' },
  // Entrust Datacard - Q1-2026
  { id: 'tqm-008', providerId: 'act-tprm-004', providerName: 'Entrust Datacard', quarter: 'Q1-2026', incidents: 1, defects: 2, avgRiskScore: 48, slaCompliance: 89, volume: 430000, tenantId: 'tenant-005' },
  // Matica Tech - Q4-2025
  { id: 'tqm-009', providerId: 'act-tprm-005', providerName: 'Matica Tech', quarter: 'Q4-2025', incidents: 2, defects: 3, avgRiskScore: 55, slaCompliance: 87, volume: 350000, tenantId: 'tenant-005' },
  // Matica Tech - Q1-2026
  { id: 'tqm-010', providerId: 'act-tprm-005', providerName: 'Matica Tech', quarter: 'Q1-2026', incidents: 1, defects: 1, avgRiskScore: 44, slaCompliance: 93, volume: 360000, tenantId: 'tenant-005' },
  // G+D - Q4-2025
  { id: 'tqm-011', providerId: 'act-tprm-006', providerName: 'G+D', quarter: 'Q4-2025', incidents: 0, defects: 1, avgRiskScore: 22, slaCompliance: 98, volume: 500000, tenantId: 'tenant-005' },
  // G+D - Q1-2026
  { id: 'tqm-012', providerId: 'act-tprm-006', providerName: 'G+D', quarter: 'Q1-2026', incidents: 0, defects: 0, avgRiskScore: 18, slaCompliance: 99, volume: 520000, tenantId: 'tenant-005' },
  // Valid S.A. - Q4-2025
  { id: 'tqm-013', providerId: 'act-tprm-007', providerName: 'Valid S.A.', quarter: 'Q4-2025', incidents: 1, defects: 2, avgRiskScore: 50, slaCompliance: 90, volume: 300000, tenantId: 'tenant-005' },
  // Valid S.A. - Q1-2026
  { id: 'tqm-014', providerId: 'act-tprm-007', providerName: 'Valid S.A.', quarter: 'Q1-2026', incidents: 2, defects: 3, avgRiskScore: 58, slaCompliance: 84, volume: 310000, tenantId: 'tenant-005' },
  // Cardtec Perú - Q4-2025 only (offboarding)
  { id: 'tqm-015', providerId: 'act-tprm-008', providerName: 'Cardtec Perú', quarter: 'Q4-2025', incidents: 4, defects: 8, avgRiskScore: 92, slaCompliance: 62, volume: 150000, tenantId: 'tenant-005' },
];

// ============================================================
// TPRM Dashboard - Impacto en Servicios Internos
// ============================================================
export const tprmServiceImpacts = [
  { id: 'tsi-001', providerId: 'act-tprm-001', providerName: 'CPI Card Group', contractedService: 'Embozado y personalización de tarjetas', internalServices: [
    { name: 'Entrega producto Volaris', businessArea: 'Comercial', criticality: 'alta' },
    { name: 'Programa lealtad BBVA', businessArea: 'Marketing', criticality: 'alta' },
    { name: 'Emisión tarjetas débito estándar', businessArea: 'Operaciones', criticality: 'critica' },
    { name: 'Reposición tarjetas pérdida/robo', businessArea: 'Atención al Cliente', criticality: 'critica' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-002', providerId: 'act-tprm-002', providerName: 'IDEMIA', contractedService: 'Chips EMV y personalización contactless', internalServices: [
    { name: 'Tarjetas contactless premium', businessArea: 'Productos', criticality: 'alta' },
    { name: 'Migración chip EMV dual', businessArea: 'Tecnología', criticality: 'media' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-003', providerId: 'act-tprm-003', providerName: 'Thales DIS', contractedService: 'Personalización tarjetas premium', internalServices: [
    { name: 'Tarjetas Infinite/Signature', businessArea: 'Banca Premium', criticality: 'alta' },
    { name: 'Tarjetas corporativas empresariales', businessArea: 'Banca Empresas', criticality: 'media' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-004', providerId: 'act-tprm-004', providerName: 'Entrust Datacard', contractedService: 'Personalización tarjetas LATAM', internalServices: [
    { name: 'Emisión tarjetas Colombia', businessArea: 'Operaciones LATAM', criticality: 'media' },
    { name: 'Tarjetas gobierno convenio', businessArea: 'Sector Público', criticality: 'baja' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-005', providerId: 'act-tprm-005', providerName: 'Matica Tech', contractedService: 'Tarjetas débito y prepago bajo costo', internalServices: [
    { name: 'Tarjetas prepago nómina', businessArea: 'Productos Masivos', criticality: 'media' },
    { name: 'Gift cards y tarjetas regalo', businessArea: 'Comercial', criticality: 'baja' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-006', providerId: 'act-tprm-006', providerName: 'G+D', contractedService: 'Embozado y seguridad avanzada', internalServices: [
    { name: 'Tarjetas alta seguridad gobierno', businessArea: 'Sector Público', criticality: 'critica' },
    { name: 'Backup embozado emergencia', businessArea: 'Continuidad', criticality: 'critica' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-007', providerId: 'act-tprm-007', providerName: 'Valid S.A.', contractedService: 'Tarjetas biométricas e identidad', internalServices: [
    { name: 'Tarjeta biométrica BBVA piloto', businessArea: 'Innovación', criticality: 'alta' },
    { name: 'Soluciones identidad digital', businessArea: 'Digital', criticality: 'media' }
  ], tenantId: 'tenant-005' },
  { id: 'tsi-008', providerId: 'act-tprm-008', providerName: 'Cardtec Perú', contractedService: 'Tarjetas prepago y gift cards Perú', internalServices: [
    { name: 'Operación tarjetas Perú', businessArea: 'Operaciones LATAM', criticality: 'alta' },
    { name: 'Expansión mercado peruano', businessArea: 'Estrategia', criticality: 'alta' }
  ], tenantId: 'tenant-005' },
];

// ============================================================
// TPRM Dashboard - Objetivos de Negocio
// ============================================================
export const tprmBusinessObjectives = [
  { id: 'tbo-001', name: 'Crecimiento 20% Volaris', description: 'Incrementar volumen de tarjetas co-branded Volaris en 20% vs año anterior', targetValue: 20, currentValue: 13, unit: '%', linkedProviders: ['act-tprm-001'], riskLevel: 'alto', riskDescription: 'CPI concentra 65% del volumen. Incidentes recurrentes amenazan entrega.', tenantId: 'tenant-005' },
  { id: 'tbo-002', name: 'Lanzamiento tarjeta biométrica BBVA', description: 'Lanzar piloto de tarjeta con autenticación biométrica integrada para clientes BBVA', targetValue: 100, currentValue: 45, unit: '%', linkedProviders: ['act-tprm-007'], riskLevel: 'medio', riskDescription: 'Valid S.A. presenta incremento de incidentes en Q1-2026.', tenantId: 'tenant-005' },
  { id: 'tbo-003', name: 'Reducción costos embozado 15%', description: 'Reducir costo unitario de embozado un 15% mediante negociación y diversificación de proveedores', targetValue: 15, currentValue: 8, unit: '%', linkedProviders: ['act-tprm-001', 'act-tprm-002', 'act-tprm-003', 'act-tprm-005', 'act-tprm-006'], riskLevel: 'medio', riskDescription: 'Concentración en CPI limita poder de negociación.', tenantId: 'tenant-005' },
  { id: 'tbo-004', name: 'Expansión operación Perú', description: 'Establecer operación de emisión de tarjetas en mercado peruano', targetValue: 100, currentValue: 0, unit: '%', linkedProviders: ['act-tprm-008', 'act-tprm-006'], riskLevel: 'critico', riskDescription: 'BLOQUEADO: Cardtec en offboarding. G+D activado como alterno.', tenantId: 'tenant-005' },
];

// ============================================================
// TPRM Dashboard - Acciones de Remediación
// ============================================================
export const tprmRemediationActions = [
  { id: 'tra-001', type: 'penalization', providerId: 'act-tprm-001', providerName: 'CPI Card Group', status: 'in_progress', description: 'Penalización contractual por incidente de acceso no autorizado a sistema de embozado detectado en Q4-2025', linkedIncidentId: 'inc-tprm-001', linkedRiskId: 'rsk-tprm-001', expectedImpact: 'Reducción 5% facturación mensual durante 3 meses', createdAt: '2025-11-15T10:00:00Z', dueDate: '2026-02-28', tenantId: 'tenant-005' },
  { id: 'tra-002', type: 'stop_payment', providerId: 'act-tprm-003', providerName: 'Thales DIS', status: 'pending', description: 'Detener pago parcial (30%) hasta completar auditoría de subcontratista de impresión sin PCI verificado', linkedIncidentId: null, linkedRiskId: 'rsk-tprm-007', expectedImpact: 'Retención $180K USD hasta remediación', createdAt: '2026-01-10T09:00:00Z', dueDate: '2026-03-31', tenantId: 'tenant-005' },
  { id: 'tra-003', type: 'cancel_contract', providerId: 'act-tprm-008', providerName: 'Cardtec Perú', status: 'in_progress', description: 'Cancelación de contrato por PCI-DSS expirado y score de due diligence de 45/100. Offboarding controlado en proceso.', linkedIncidentId: null, linkedRiskId: 'rsk-tprm-016', expectedImpact: 'Eliminación de riesgo regulatorio en operación Perú', createdAt: '2025-12-01T08:00:00Z', dueDate: '2026-05-31', tenantId: 'tenant-005' },
  { id: 'tra-004', type: 'activate_alternate', providerId: 'act-tprm-006', providerName: 'G+D', status: 'in_progress', description: 'Activar G+D como proveedor alterno para Perú, reemplazando a Cardtec. Incluye setup operativo y validación PCI.', linkedIncidentId: null, linkedRiskId: 'rsk-tprm-016', expectedImpact: 'Continuidad de operación Perú con proveedor Tier-1', createdAt: '2026-01-15T10:00:00Z', dueDate: '2026-04-30', tenantId: 'tenant-005' },
  { id: 'tra-005', type: 'penalization', providerId: 'act-tprm-005', providerName: 'Matica Tech', status: 'completed', description: 'Penalización aplicada por error en segregación de datos de tarjetahabientes entre clientes en Q4-2025', linkedIncidentId: 'inc-tprm-005', linkedRiskId: null, expectedImpact: 'Descuento 3% aplicado y controles reforzados', createdAt: '2025-10-20T11:00:00Z', dueDate: '2026-01-31', tenantId: 'tenant-005' },
];

// ============================================================
// TPRM Dashboard - Controles y Reducción de Riesgo
// ============================================================
export const tprmControls = [
  // CPI Card Group
  { id: 'tc-001', providerId: 'act-tprm-001', providerName: 'CPI Card Group', controlName: 'Cifrado HSM de datos de tarjeta', inherentRisk: 9, residualRisk: 3, effectiveness: 67, description: 'Hardware Security Module para cifrado de PAN, CVV y datos de banda magnética durante el proceso de embozado', tenantId: 'tenant-005' },
  { id: 'tc-002', providerId: 'act-tprm-001', providerName: 'CPI Card Group', controlName: 'Monitoreo SIEM 24/7', inherentRisk: 8, residualRisk: 4, effectiveness: 50, description: 'Centro de operaciones de seguridad con correlación de eventos y alertas en tiempo real', tenantId: 'tenant-005' },
  { id: 'tc-003', providerId: 'act-tprm-001', providerName: 'CPI Card Group', controlName: 'Control acceso biométrico', inherentRisk: 7, residualRisk: 2, effectiveness: 71, description: 'Acceso a zona de embozado exclusivamente con autenticación biométrica y doble factor', tenantId: 'tenant-005' },
  // Thales DIS
  { id: 'tc-004', providerId: 'act-tprm-003', providerName: 'Thales DIS', controlName: 'PCI-DSS v4.0 (parcial)', inherentRisk: 8, residualRisk: 5, effectiveness: 38, description: 'Migración parcial a PCI-DSS v4.0. Pendientes: gestión de vulnerabilidades y MFA en accesos.', tenantId: 'tenant-005' },
  { id: 'tc-005', providerId: 'act-tprm-003', providerName: 'Thales DIS', controlName: 'Auditoría 4th party', inherentRisk: 9, residualRisk: 6, effectiveness: 33, description: 'Auditoría a subcontratista de impresión. Deficiencias encontradas en segregación de ambiente y acceso físico.', tenantId: 'tenant-005' },
  // IDEMIA
  { id: 'tc-006', providerId: 'act-tprm-002', providerName: 'IDEMIA', controlName: 'Certificación PCI-DSS v4.0 completa', inherentRisk: 7, residualRisk: 2, effectiveness: 71, description: 'Certificación PCI-DSS v4.0 vigente con QSA acreditado. Próxima auditoría: Sep 2026.', tenantId: 'tenant-005' },
  { id: 'tc-007', providerId: 'act-tprm-002', providerName: 'IDEMIA', controlName: 'Seguro cibernético', inherentRisk: 8, residualRisk: 3, effectiveness: 63, description: 'Póliza de seguro cibernético con cobertura de $5M USD para incidentes de datos de tarjetas.', tenantId: 'tenant-005' },
  // G+D
  { id: 'tc-008', providerId: 'act-tprm-006', providerName: 'G+D', controlName: 'Dual-site redundancia', inherentRisk: 8, residualRisk: 2, effectiveness: 75, description: 'Capacidad dual-site con failover automático entre plantas Guadalajara y CDMX.', tenantId: 'tenant-005' },
  { id: 'tc-009', providerId: 'act-tprm-006', providerName: 'G+D', controlName: 'ISO 27001 + PCI-DSS v4.0', inherentRisk: 7, residualRisk: 2, effectiveness: 71, description: 'Doble certificación ISO 27001:2022 y PCI-DSS v4.0 vigente. Máximo nivel de madurez.', tenantId: 'tenant-005' },
  // Cardtec Perú - Sin controles efectivos
  { id: 'tc-010', providerId: 'act-tprm-008', providerName: 'Cardtec Perú', controlName: 'Controles básicos (deficientes)', inherentRisk: 9, residualRisk: 8, effectiveness: 11, description: 'PCI-DSS expirado, sin SIEM, control de acceso básico con tarjeta. Score DD: 45/100.', tenantId: 'tenant-005' },
  // Valid S.A.
  { id: 'tc-011', providerId: 'act-tprm-007', providerName: 'Valid S.A.', controlName: 'Tokenización de datos', inherentRisk: 7, residualRisk: 3, effectiveness: 57, description: 'Sistema de tokenización propio para protección de datos sensibles durante el proceso de personalización.', tenantId: 'tenant-005' },
  // Entrust Datacard
  { id: 'tc-012', providerId: 'act-tprm-004', providerName: 'Entrust Datacard', controlName: 'Cifrado end-to-end', inherentRisk: 7, residualRisk: 3, effectiveness: 57, description: 'Cifrado punto a punto en toda la cadena de personalización de tarjetas.', tenantId: 'tenant-005' },
  // Matica Tech
  { id: 'tc-013', providerId: 'act-tprm-005', providerName: 'Matica Tech', controlName: 'Segregación de datos mejorada', inherentRisk: 8, residualRisk: 4, effectiveness: 50, description: 'Post-incidente: segregación reforzada de datos entre clientes con auditoría trimestral.', tenantId: 'tenant-005' },
];
