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
  { id: 'act-001', nombre: 'Core Banking System (CBS)', descripcion: 'Sistema central de operaciones bancarias que procesa todas las transacciones financieras del banco', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-001', propiedadesCustom: JSON.stringify([{ propiedadId: 'cb-1', campo: 'version', valor: '12.5.3' }, { propiedadId: 'cb-2', campo: 'proveedor', valor: 'Temenos' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-002', nombre: 'Sistema de Banca en Línea', descripcion: 'Plataforma de banca digital para clientes (web y móvil)', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-001', propiedadesCustom: JSON.stringify([{ propiedadId: 'cb-1', campo: 'version', valor: '8.2.1' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-003', nombre: 'Sistema SPEI/SPID', descripcion: 'Sistema de pagos electrónicos interbancarios', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Tesorería', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-004', nombre: 'Sistema Anti-Lavado (AML)', descripcion: 'Sistema de detección y prevención de lavado de dinero', tipo: 'software', criticidad: 'alta', responsable: 'Patricia Reyes Solís', departamento: 'PLD/AML', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-005', nombre: 'Sistema de Gestión de Créditos', descripcion: 'Plataforma para originación y gestión del ciclo de crédito', tipo: 'software', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Crédito', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-006', nombre: 'Base de Datos de Clientes', descripcion: 'Repositorio central de información de clientes (KYC)', tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' }, { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Confidencial' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-007', nombre: 'Base de Datos de Transacciones', descripcion: 'Almacén de todas las transacciones financieras', tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' }, { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Restringido' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-008', nombre: 'Data Warehouse Analítico', descripcion: 'Almacén de datos para análisis y reportes regulatorios', tipo: 'datos', criticidad: 'alta', responsable: 'Ana Patricia López García', departamento: 'Riesgos', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Teradata' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-009', nombre: 'Servidor Principal Core Banking', descripcion: 'Servidor de producción del sistema core bancario', tipo: 'hardware', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-004', propiedadesCustom: JSON.stringify([{ propiedadId: 'srv-1', campo: 'marca', valor: 'IBM' }, { propiedadId: 'srv-2', campo: 'modelo', valor: 'Power9' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-010', nombre: 'Servidor de Contingencia', descripcion: 'Servidor de respaldo para continuidad de negocio', tipo: 'hardware', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-004', propiedadesCustom: JSON.stringify([{ propiedadId: 'srv-5', campo: 'ambiente', valor: 'DR' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-011', nombre: 'Red de Cajeros Automáticos', descripcion: 'Flota de 450 cajeros automáticos a nivel nacional', tipo: 'hardware', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-002', propiedadesCustom: JSON.stringify([{ propiedadId: 'atm-1', campo: 'marca', valor: 'NCR' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-012', nombre: 'Servicio de Transferencias Internacionales', descripcion: 'Servicio SWIFT para transferencias internacionales', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Tesorería', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-013', nombre: 'Servicio de Pagos con Tarjeta', descripcion: 'Procesamiento de pagos con tarjetas de crédito y débito', tipo: 'servicios', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-014', nombre: 'Red WAN Corporativa', descripcion: 'Red de área amplia que conecta sucursales y data centers', tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'act-015', nombre: 'Firewall Perimetral', descripcion: 'Sistema de protección perimetral de la red bancaria', tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', propiedadesCustom: '[]', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  // === TPRM: Proveedores de Embozado de Tarjetas ===
  { id: 'act-tprm-001', nombre: 'CPI Card Group México', descripcion: 'Proveedor principal de embozado, encoding de banda magnética y grabado de chip EMV para tarjetas de crédito y débito. Opera planta en Querétaro con capacidad de 2M tarjetas/mes.', tipo: 'servicios', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-002', nombre: 'IDEMIA México (ex-Oberthur)', descripcion: 'Proveedor alternativo de chips EMV, personalización de tarjetas contactless y fulfilment. Planta en CDMX con capacidad de 800K tarjetas/mes.', tipo: 'servicios', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-003', nombre: 'Thales DIS México', descripcion: 'Proveedor de personalización de tarjetas premium y soluciones de seguridad digital. Subcontrata impresión a tercero local.', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-004', nombre: 'Entrust Datacard Colombia', descripcion: 'Proveedor regional de personalización de tarjetas para operaciones en Latinoamérica. Atiende emisión de tarjetas para clientes corporativos y gobierno. Planta en Bogotá.', tipo: 'servicios', criticidad: 'alta', responsable: 'Ana Patricia López García', departamento: 'Riesgos', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-005', nombre: 'Matica Technologies Brasil', descripcion: 'Proveedor de soluciones de personalización de bajo costo para tarjetas de débito y prepago. Opera planta en São Paulo con equipo propio de desarrollo de firmware.', tipo: 'servicios', criticidad: 'media', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-006', nombre: 'Giesecke+Devrient (G+D) México', descripcion: 'Corporativo alemán, proveedor global de tarjetas y soluciones de seguridad. Planta de alta seguridad en Guadalajara con capacidad dual-site. Principal competidor de CPI.', tipo: 'servicios', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-007', nombre: 'Valid S.A. (ex-Gemalto LATAM)', descripcion: 'Proveedor brasileño con presencia en toda Latinoamérica. Especializado en tarjetas con biometría integrada y soluciones de identidad digital. Planta en CDMX y São Paulo.', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Cumplimiento', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  { id: 'act-tprm-008', nombre: 'Cardtec Perú', descripcion: 'Proveedor local peruano de bajo volumen. Especializado en tarjetas prepago y gift cards. Planta pequeña en Lima con controles de seguridad básicos. En evaluación para offboarding.', tipo: 'servicios', criticidad: 'media', responsable: 'Fernando Castillo Núñez', departamento: 'Cumplimiento', plantillaId: 'plt-005', propiedadesCustom: JSON.stringify([
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
  // === Tenant: Seguros del Norte (tenant-002) ===
  { id: 'act-sdn-001', nombre: 'Sistema de Pólizas', descripcion: 'Plataforma central de emisión y administración de pólizas de seguros', tipo: 'software', criticidad: 'critica', responsable: 'Laura Martínez', departamento: 'TI', propiedadesCustom: '[]', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  { id: 'act-sdn-002', nombre: 'Portal de Asegurados', descripcion: 'Portal web de autoservicio para asegurados con consulta de pólizas, pagos y reportes de siniestros', tipo: 'software', criticidad: 'alta', responsable: 'Laura Martínez', departamento: 'TI', propiedadesCustom: '[]', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  { id: 'act-sdn-003', nombre: 'Motor de Siniestros', descripcion: 'Sistema de gestión del ciclo de vida de siniestros: reporte, evaluación, ajuste y pago', tipo: 'software', criticidad: 'critica', responsable: 'Ricardo Navarro', departamento: 'Siniestros', propiedadesCustom: '[]', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  // === Tenant: Fintech Solutions (tenant-003) ===
  { id: 'act-fts-001', nombre: 'Plataforma de Pagos', descripcion: 'Plataforma de procesamiento de pagos digitales con integración a múltiples métodos de pago y pasarelas', tipo: 'software', criticidad: 'critica', responsable: 'Diego Fernández', departamento: 'Ingeniería', propiedadesCustom: '[]', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
  { id: 'act-fts-002', nombre: 'Sistema de Préstamos P2P', descripcion: 'Plataforma de préstamos peer-to-peer con scoring crediticio basado en machine learning', tipo: 'software', criticidad: 'alta', responsable: 'Diego Fernández', departamento: 'Ingeniería', propiedadesCustom: '[]', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
  { id: 'act-fts-003', nombre: 'App Móvil Fintech', descripcion: 'Aplicación móvil para usuarios finales con wallet digital, pagos QR y gestión de préstamos', tipo: 'software', criticidad: 'critica', responsable: 'María Soledad Ríos', departamento: 'Producto', propiedadesCustom: '[]', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
];

// ============================================================
// Riesgos
// ============================================================
export const riesgos = [
  { id: 'rsk-001', activoId: 'act-001', descripcion: 'Falla crítica del sistema core banking que impida operaciones', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-002', activoId: 'act-001', descripcion: 'Acceso no autorizado a funciones administrativas del core', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-003', activoId: 'act-002', descripcion: 'Ataque de phishing dirigido a clientes de banca en línea', probabilidad: 4, impacto: 4, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-004', activoId: 'act-002', descripcion: 'Vulnerabilidad XSS en portal de banca en línea', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-005', activoId: 'act-003', descripcion: 'Interrupción de conexión con Banco de México', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Carlos Hernández Mora', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-006', activoId: 'act-004', descripcion: 'Falla en detección de operaciones inusuales', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Patricia Reyes Solís', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-007', activoId: 'act-006', descripcion: 'Fuga de datos personales de clientes (datos KYC)', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-008', activoId: 'act-011', descripcion: 'Skimming de tarjetas en red de ATMs', probabilidad: 3, impacto: 4, estado: 'en_tratamiento', responsable: 'Jorge Vargas Luna', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-009', activoId: 'act-014', descripcion: 'Ataque DDoS contra infraestructura bancaria', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'rsk-010', activoId: 'act-015', descripcion: 'Intrusión a través de vulnerabilidad en firewall', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
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
  // === Tenant: Seguros del Norte (tenant-002) ===
  { id: 'rsk-sdn-001', activoId: 'act-sdn-001', descripcion: 'Falla en cálculo de primas que genere pérdidas actuariales significativas', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Laura Martínez', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  { id: 'rsk-sdn-002', activoId: 'act-sdn-003', descripcion: 'Fraude en reclamaciones de siniestros por validación insuficiente de documentación', probabilidad: 3, impacto: 4, estado: 'evaluado', responsable: 'Ricardo Navarro', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  // === Tenant: Fintech Solutions (tenant-003) ===
  { id: 'rsk-fts-001', activoId: 'act-fts-001', descripcion: 'Vulnerabilidad en API de pagos que permita transacciones no autorizadas o duplicadas', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Diego Fernández', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
  { id: 'rsk-fts-002', activoId: 'act-fts-002', descripcion: 'Sesgo en modelo de scoring crediticio ML que genere discriminación o pérdidas por mora', probabilidad: 3, impacto: 4, estado: 'evaluado', responsable: 'Diego Fernández', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
];

// ============================================================
// Incidentes
// ============================================================
export const incidentes = [
  { id: 'inc-001', activoId: 'act-002', titulo: 'Ataque de phishing masivo a clientes', descripcion: 'Se detectaron más de 500 intentos de phishing dirigidos a clientes de banca en línea', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-002', activoId: 'act-001', titulo: 'Degradación de rendimiento en Core Banking', descripcion: 'El sistema core experimentó lentitud durante 3 horas debido a un proceso batch mal configurado', severidad: 'media', estado: 'cerrado', reportadoPor: 'Ana Patricia López García', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-003', activoId: 'act-011', titulo: 'Dispositivo de skimming detectado', descripcion: 'Se encontró un dispositivo de clonación de tarjetas en ATM de sucursal Polanco', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-004', activoId: 'act-003', titulo: 'Intermitencia en conexión SPEI', descripcion: 'Conexión intermitente con Banco de México durante ventana de operación matutina', severidad: 'critica', estado: 'cerrado', reportadoPor: 'Carlos Hernández Mora', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-005', activoId: 'act-006', titulo: 'Acceso no autorizado detectado', descripcion: 'Se detectó intento de acceso no autorizado a base de datos de clientes desde IP externa', severidad: 'critica', estado: 'en_investigacion', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-006', activoId: 'act-004', titulo: 'Falla en generación de alertas AML', descripcion: 'El sistema AML no generó alertas durante 2 horas por error en servicio de monitoreo', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Patricia Reyes Solís', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-007', activoId: 'act-013', titulo: 'Transacciones fraudulentas con tarjeta', descripcion: 'Se detectaron 25 transacciones fraudulentas en un período de 30 minutos', severidad: 'alta', estado: 'en_contencion', reportadoPor: 'Patricia Reyes Solís', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'inc-008', activoId: 'act-014', titulo: 'Caída de enlace principal WAN', descripcion: 'Pérdida de conectividad con 15 sucursales por falla en enlace de proveedor', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
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
  { id: 'def-001', activoId: 'act-001', titulo: 'Error en cálculo de intereses moratorios', descripcion: 'El módulo de créditos calcula incorrectamente los intereses moratorios para créditos con pagos parciales', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Ana Patricia López García', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'def-002', activoId: 'act-002', titulo: 'Timeout en consulta de movimientos', descripcion: 'La consulta de movimientos en banca en línea presenta timeout cuando hay más de 500 registros', tipo: 'rendimiento', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'def-003', activoId: 'act-002', titulo: 'Vulnerabilidad en autenticación de app móvil', descripcion: 'Se identificó vulnerabilidad que permite bypass de segundo factor en ciertas condiciones', tipo: 'seguridad', prioridad: 'critica', estado: 'en_correccion', detectadoPor: 'Roberto Torres Ramírez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'def-004', activoId: 'act-004', titulo: 'Falsos positivos excesivos en alertas', descripcion: 'El sistema genera demasiados falsos positivos en alertas de operaciones inusuales', tipo: 'funcional', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Patricia Reyes Solís', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'def-005', activoId: 'act-005', titulo: 'Error en workflow de aprobación de crédito', descripcion: 'El flujo de aprobación no notifica correctamente al siguiente aprobador', tipo: 'funcional', prioridad: 'alta', estado: 'corregido', detectadoPor: 'Fernando Castillo Núñez', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
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
  { id: 'prc-001', nombre: 'Conoce a tu Cliente (KYC)', descripcion: 'Proceso de identificación y verificación de clientes para cumplimiento regulatorio', version: '2.1', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prc-002', nombre: 'Prevención de Lavado de Dinero (AML)', descripcion: 'Proceso de monitoreo y detección de operaciones inusuales y sospechosas', version: '3.0', estado: 'activo', createdBy: 'usr-009', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prc-003', nombre: 'Originación de Crédito', descripcion: 'Proceso end-to-end para la solicitud, evaluación y otorgamiento de créditos', version: '1.5', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prc-004', nombre: 'Apertura de Cuenta', descripcion: 'Proceso de apertura de cuentas de captación para personas físicas y morales', version: '2.0', estado: 'activo', createdBy: 'usr-008', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prc-005', nombre: 'Gestión de Incidentes de Seguridad', descripcion: 'Proceso de detección, respuesta y recuperación ante incidentes de seguridad', version: '1.2', estado: 'activo', createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  // === TPRM: Procesos del ciclo de gestión de terceros ===
  { id: 'prc-tprm-001', nombre: 'TPRM - Due Diligence de Embozadores', descripcion: 'Proceso de evaluación inicial (onboarding) de proveedores de embozado de tarjetas. Evalúa solvencia financiera, certificaciones PCI-DSS, seguridad física/lógica, modelo operativo, BCP/DRP y capacidad productiva.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-002', nombre: 'TPRM - Gestión de Contratos con Embozadores', descripcion: 'Proceso de gestión contractual con proveedores de embozado. Incluye definición de SLAs, cláusulas de auditoría, responsabilidades ante incidentes, protección de datos financieros y penalizaciones.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-003', nombre: 'TPRM - Monitoreo Continuo de Riesgos de Embozadores', descripcion: 'Proceso de monitoreo continuo de exposición al riesgo de proveedores de embozado. Evalúa riesgo residual, cambios en certificaciones, postura de seguridad, riesgos emergentes y dependencia operacional.', version: '1.0', estado: 'activo', createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-004', nombre: 'TPRM - Gestión de Desempeño de Embozadores', descripcion: 'Proceso de evaluación del desempeño operativo de proveedores de embozado. Mide cumplimiento de SLA, calidad de producción, defectos, tiempos de entrega y capacidad de respuesta.', version: '1.0', estado: 'activo', createdBy: 'usr-008', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-005', nombre: 'TPRM - Gestión de Incidentes con Embozadores', descripcion: 'Proceso de respuesta a incidentes originados en proveedores de embozado. Evalúa capacidad de respuesta, tiempo de detección, coordinación con el banco, impacto y tiempo de recuperación.', version: '1.0', estado: 'activo', createdBy: 'usr-004', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'prc-tprm-006', nombre: 'TPRM - Terminación / Offboarding de Embozadores', descripcion: 'Proceso de terminación controlada de relación con proveedores de embozado. Asegura eliminación segura de datos, transferencia operativa, cumplimiento de obligaciones finales y mitigación de riesgos residuales.', version: '1.0', estado: 'activo', createdBy: 'usr-003', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  // === Tenant: Seguros del Norte (tenant-002) ===
  { id: 'prc-sdn-001', nombre: 'Gestión de Siniestros', descripcion: 'Proceso end-to-end de gestión de siniestros: recepción del reporte, asignación de ajustador, evaluación de daños, dictamen y pago al asegurado', version: '1.0', estado: 'activo', createdBy: 'usr-001', tenantId: 'tenant-002', createdAt: new Date().toISOString() },
  // === Tenant: Fintech Solutions (tenant-003) ===
  { id: 'prc-fts-001', nombre: 'Proceso de Onboarding Digital', descripcion: 'Proceso de alta de nuevos usuarios en la plataforma fintech: verificación de identidad digital (eKYC), validación biométrica, scoring inicial y activación de cuenta', version: '2.0', estado: 'activo', createdBy: 'usr-001', tenantId: 'tenant-003', createdAt: new Date().toISOString() },
];

export const processNodes = [
  { id: 'pn-001', procesoId: 'prc-001', nodeId: 'node-1', type: 'start', label: 'Inicio', position: JSON.stringify({ x: 100, y: 100 }), tenantId: 'tenant-001' },
  { id: 'pn-002', procesoId: 'prc-001', nodeId: 'node-2', type: 'task', label: 'Recepción de documentos', position: JSON.stringify({ x: 250, y: 100 }), tenantId: 'tenant-001' },
  { id: 'pn-003', procesoId: 'prc-001', nodeId: 'node-3', type: 'task', label: 'Verificación de identidad', position: JSON.stringify({ x: 400, y: 100 }), tenantId: 'tenant-001' },
  { id: 'pn-004', procesoId: 'prc-001', nodeId: 'node-4', type: 'decision', label: 'Aprobado?', position: JSON.stringify({ x: 550, y: 100 }), tenantId: 'tenant-001' },
  { id: 'pn-005', procesoId: 'prc-001', nodeId: 'node-5', type: 'end', label: 'Fin', position: JSON.stringify({ x: 700, y: 100 }), tenantId: 'tenant-001' },
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
  { id: 'pe-001', procesoId: 'prc-001', edgeId: 'edge-1', source: 'node-1', target: 'node-2', tenantId: 'tenant-001' },
  { id: 'pe-002', procesoId: 'prc-001', edgeId: 'edge-2', source: 'node-2', target: 'node-3', tenantId: 'tenant-001' },
  { id: 'pe-003', procesoId: 'prc-001', edgeId: 'edge-3', source: 'node-3', target: 'node-4', tenantId: 'tenant-001' },
  { id: 'pe-004', procesoId: 'prc-001', edgeId: 'edge-4', source: 'node-4', target: 'node-5', tenantId: 'tenant-001' },
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
  { id: 'obj-001', procesoId: 'prc-001', nombre: 'Reducir tiempo de onboarding', descripcion: 'Reducir el tiempo promedio de alta de clientes a 24 horas', progreso: 75, tenantId: 'tenant-001' },
  { id: 'obj-002', procesoId: 'prc-002', nombre: 'Detectar operaciones sospechosas', descripcion: 'Detectar el 95% de operaciones sospechosas en tiempo real', progreso: 88, tenantId: 'tenant-001' },
  // === TPRM: Objetivos ===
  { id: 'obj-tprm-001', procesoId: 'prc-tprm-001', nombre: 'Due Diligence completo antes de contratación', descripcion: 'Completar evaluación integral del 100% de proveedores de embozado antes de firmar contrato', progreso: 67, tenantId: 'tenant-005' },
  { id: 'obj-tprm-002', procesoId: 'prc-tprm-003', nombre: 'Monitoreo continuo de riesgo de terceros', descripcion: 'Mantener risk score actualizado de todos los proveedores con evaluación trimestral', progreso: 80, tenantId: 'tenant-005' },
  { id: 'obj-tprm-003', procesoId: 'prc-tprm-004', nombre: 'Cumplimiento de SLA de embozado', descripcion: 'Asegurar que proveedores cumplan el 95% de los SLA acordados', progreso: 72, tenantId: 'tenant-005' },
];

export const kpisProceso = [
  { id: 'kpi-001', procesoId: 'prc-001', nombre: 'Tiempo promedio de verificación', valorActual: 18, valorMeta: 24, unidad: 'horas', estado: 'verde', tenantId: 'tenant-001' },
  { id: 'kpi-002', procesoId: 'prc-002', nombre: 'Tasa de detección', valorActual: 92, valorMeta: 95, unidad: '%', estado: 'amarillo', tenantId: 'tenant-001' },
  { id: 'kpi-003', procesoId: 'prc-003', nombre: 'Tiempo de aprobación', valorActual: 72, valorMeta: 48, unidad: 'horas', estado: 'rojo', tenantId: 'tenant-001' },
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
  { id: 'marco-001', nombre: 'Disposiciones de Carácter General aplicables a Instituciones de Crédito', acronimo: 'CUB', version: '2024', fechaVigencia: '2024-01-01', descripcion: 'Circular Única de Bancos emitida por la CNBV', activo: true, tenantId: 'tenant-001' },
  { id: 'marco-002', nombre: 'Disposiciones de Prevención de Lavado de Dinero', acronimo: 'PLD/FT', version: '2023', fechaVigencia: '2023-07-01', descripcion: 'Normatividad para la prevención de lavado de dinero', activo: true, tenantId: 'tenant-001' },
  { id: 'marco-003', nombre: 'Payment Card Industry Data Security Standard', acronimo: 'PCI-DSS', version: '4.0', fechaVigencia: '2024-03-31', descripcion: 'Estándar de seguridad de datos para tarjetas de pago', activo: true, tenantId: 'tenant-001' },
  { id: 'marco-004', nombre: 'Sistema de Gestión de Seguridad de la Información', acronimo: 'ISO 27001', version: '2022', fechaVigencia: '2022-10-25', descripcion: 'Estándar internacional para la gestión de seguridad', activo: true, tenantId: 'tenant-001' },
  { id: 'marco-005', nombre: 'Ley Federal de Protección de Datos Personales', acronimo: 'LFPDPPP', version: '2024', fechaVigencia: '2010-07-05', descripcion: 'Ley que regula el tratamiento de datos personales', activo: true, tenantId: 'tenant-001' },
  // === TPRM: Marcos Normativos ===
  { id: 'marco-tprm-001', nombre: 'Disposiciones CNBV sobre Servicios de Terceros', acronimo: 'CNBV-TPRM', version: '2024', fechaVigencia: '2024-01-01', descripcion: 'Disposiciones de la CNBV relativas a la contratación de servicios con terceros por parte de instituciones de crédito, incluyendo due diligence, monitoreo y offboarding', activo: true, tenantId: 'tenant-005' },
  { id: 'marco-tprm-002', nombre: 'Circular Banxico sobre Riesgo Operacional de Terceros', acronimo: 'BX-RO-3ROS', version: '2023', fechaVigencia: '2023-06-15', descripcion: 'Circular de Banco de México que establece requisitos de gestión de riesgo operacional derivado de la dependencia en proveedores terceros de servicios críticos', activo: true, tenantId: 'tenant-005' },
];

// ============================================================
// Cuestionarios
// ============================================================
export const cuestionarios = [
  { id: 'cst-001', nombre: 'Autoevaluación PCI-DSS v4.0', descripcion: 'Cuestionario de autoevaluación para cumplimiento del estándar PCI-DSS', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'autoevaluacion', estado: 'activo', marcoNormativoId: 'marco-003', periodicidad: 'trimestral', umbrales: JSON.stringify({ deficiente: 60, aceptable: 80, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['TI', 'Seguridad']), responsables: JSON.stringify(['usr-004']), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'cst-002', nombre: 'Evaluación de Controles AML/PLD', descripcion: 'Evaluación de controles de prevención de lavado de dinero', categoria: 'cumplimiento', tipo: 'manual', tipoEvaluacion: 'auditoria_externa', estado: 'activo', marcoNormativoId: 'marco-002', periodicidad: 'semestral', umbrales: JSON.stringify({ deficiente: 70, aceptable: 85, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Cumplimiento', 'PLD/AML']), responsables: JSON.stringify(['usr-009']), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'cst-003', nombre: 'Auditoría Interna ISO 27001', descripcion: 'Revisión de controles del SGSI según ISO 27001:2022', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'revision_controles', estado: 'activo', marcoNormativoId: 'marco-004', periodicidad: 'anual', umbrales: JSON.stringify({ deficiente: 65, aceptable: 80, sobresaliente: 92 }), areasObjetivo: JSON.stringify(['Seguridad', 'TI', 'Riesgos']), responsables: JSON.stringify(['usr-004', 'usr-010']), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  // === TPRM: Cuestionarios ===
  { id: 'cst-tprm-001', nombre: 'Due Diligence - Proveedor de Embozado', descripcion: 'Cuestionario de evaluación integral para onboarding de proveedores de embozado de tarjetas. Cubre seguridad física, PCI-DSS, BCP, subcontratistas y protección de datos de tarjetahabientes.', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'auditoria_externa', estado: 'activo', marcoNormativoId: 'marco-003', periodicidad: 'anual', umbrales: JSON.stringify({ deficiente: 70, aceptable: 85, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Operaciones', 'Seguridad', 'Cumplimiento', 'Riesgos']), responsables: JSON.stringify(['usr-004', 'usr-003']), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
  { id: 'cst-tprm-002', nombre: 'Evaluación de Desempeño Trimestral - Embozador', descripcion: 'Cuestionario de evaluación periódica del desempeño operativo de proveedores de embozado. Mide SLAs, calidad, incidentes y capacidad de respuesta.', categoria: 'operacional', tipo: 'manual', tipoEvaluacion: 'revision_controles', estado: 'activo', marcoNormativoId: 'marco-tprm-001', periodicidad: 'trimestral', umbrales: JSON.stringify({ deficiente: 60, aceptable: 80, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Operaciones', 'Riesgos']), responsables: JSON.stringify(['usr-008']), tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const secciones = [
  { id: 'sec-001', cuestionarioId: 'cst-001', nombre: 'Protección de datos del titular de tarjeta', descripcion: 'Controles para proteger los datos del titular', orden: 1, tenantId: 'tenant-001' },
  { id: 'sec-002', cuestionarioId: 'cst-001', nombre: 'Mantenimiento de un programa de seguridad', descripcion: 'Controles de seguridad de la información', orden: 2, tenantId: 'tenant-001' },
  { id: 'sec-003', cuestionarioId: 'cst-002', nombre: 'Identificación del cliente', descripcion: 'Controles KYC y debida diligencia', orden: 1, tenantId: 'tenant-001' },
  { id: 'sec-004', cuestionarioId: 'cst-002', nombre: 'Monitoreo de transacciones', descripcion: 'Controles de monitoreo y alertas', orden: 2, tenantId: 'tenant-001' },
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
  { id: 'prg-001', seccionId: 'sec-001', texto: '¿Se cifran los datos del titular de tarjeta durante la transmisión?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-001' },
  { id: 'prg-002', seccionId: 'sec-001', texto: '¿Se utiliza cifrado fuerte para almacenar datos del titular?', tipo: 'si_no', requerida: true, orden: 2, tenantId: 'tenant-001' },
  { id: 'prg-003', seccionId: 'sec-002', texto: '¿Existe un programa de concientización de seguridad?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-001' },
  { id: 'prg-004', seccionId: 'sec-003', texto: '¿Se verifica la identidad del cliente al momento del alta?', tipo: 'si_no', requerida: true, orden: 1, tenantId: 'tenant-001' },
  { id: 'prg-005', seccionId: 'sec-004', texto: '¿Cuántas alertas de operaciones inusuales se generan en promedio por día?', tipo: 'numero', requerida: false, orden: 1, tenantId: 'tenant-001' },
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
  { id: 'asig-001', cuestionarioId: 'cst-001', titulo: 'Revisión Trimestral PCI-DSS Q4 2024', descripcion: 'Autoevaluación de cumplimiento PCI-DSS para el cuarto trimestre', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-004']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 45, tenantId: 'tenant-001' },
  { id: 'asig-002', cuestionarioId: 'cst-002', titulo: 'Auditoría AML/PLD Semestral 2024-H2', descripcion: 'Evaluación de controles anti lavado de dinero segundo semestre', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-009', 'usr-006']), usuariosAsignadosNombres: JSON.stringify(['Patricia Reyes Solís', 'Fernando Castillo Núñez']), areaId: 'cumplimiento', areaNombre: 'Cumplimiento Normativo', responsableId: 'usr-009', responsableNombre: 'Patricia Reyes Solís', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 78, tenantId: 'tenant-001' },
  { id: 'asig-003', cuestionarioId: 'cst-003', titulo: 'Auditoría Interna SGSI 2024', descripcion: 'Revisión anual del Sistema de Gestión de Seguridad de la Información', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-007']), usuariosAsignadosNombres: JSON.stringify(['Laura Mendoza Díaz']), areaId: 'auditoria', areaNombre: 'Auditoría Interna', responsableId: 'usr-007', responsableNombre: 'Laura Mendoza Díaz', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), estado: 'pendiente', progreso: 0, tenantId: 'tenant-001' },
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
  { id: 'org-001', nombre: 'Grupo Financiero Atlas', descripcion: 'Estructura organizacional integral del grupo financiero con enfoque en GRC', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
];

export const nodosOrganigrama = [
  // ============================================================
  // NIVEL 1: ORGANIZATION (Raíz)
  // ============================================================
  {
    id: 'norg-001',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Grupo Financiero Atlas S.A. de C.V.',
    descripcion: 'Holding financiero líder en servicios bancarios, inversiones y seguros con presencia en Latinoamérica. Comprometidos con la excelencia operativa, cumplimiento regulatorio y gestión integral de riesgos.',
    cargo: 'Director General (CEO)',
    departamento: 'Dirección General',
    email: 'direccion@gfatlas.mx',
    telefono: '+52 55 5000 0001',
    padreId: null,
    tipo: 'ORGANIZATION',
    icono: 'pi pi-building',
    responsable: { id: 'usr-001', nombre: 'Ricardo Salinas Pliego', email: 'rsalinas@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    propiedadesCustom: [
      { id: 'pc-001', nombre: 'RFC', tipo: 'TEXT', valor: 'GFA920101ABC', requerido: true },
      { id: 'pc-002', nombre: 'Empleados totales', tipo: 'NUMBER', valor: 15000, requerido: false },
      { id: 'pc-003', nombre: 'Activos totales (USD MM)', tipo: 'NUMBER', valor: 45000, requerido: true },
      { id: 'pc-004', nombre: 'Fundación', tipo: 'TEXT', valor: '1992', requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'moderado',
      descripcion: 'Tolerancia moderada con enfoque en protección del capital y reputación institucional'
    },
    objetivosNegocio: [
      {
        id: 'obj-org-001',
        nombre: 'Excelencia en Gestión de Riesgos',
        descripcion: 'Mantener un marco robusto de gestión de riesgos que proteja los activos y la reputación del grupo',
        kpis: [
          { id: 'kpi-001', nombre: 'Índice de Riesgo Operacional', valor: 2.8, meta: 2.0, unidad: 'índice', umbralMaximo: 3.5, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-002', nombre: 'Pérdidas Operacionales vs Ingresos', valor: 0.15, meta: 0.10, unidad: '%', umbralMaximo: 0.25, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      },
      {
        id: 'obj-org-002',
        nombre: 'Cumplimiento Regulatorio Integral',
        descripcion: 'Asegurar adherencia total a regulaciones CNBV, Banxico, CONDUSEF y estándares internacionales',
        kpis: [
          { id: 'kpi-003', nombre: 'Cumplimiento Normativo General', valor: 94, meta: 100, unidad: '%', umbralMaximo: 85, canales: ['in-app', 'email'], frecuencia: 'mensual' },
          { id: 'kpi-004', nombre: 'Observaciones Regulatorias Abiertas', valor: 3, meta: 0, unidad: 'cantidad', umbralMaximo: 10, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' }
        ]
      },
      {
        id: 'obj-org-003',
        nombre: 'Ciberseguridad y Protección de Datos',
        descripcion: 'Proteger los activos de información y datos de clientes contra amenazas cibernéticas',
        kpis: [
          { id: 'kpi-005', nombre: 'Incidentes de Seguridad Críticos', valor: 0, meta: 0, unidad: 'cantidad', umbralMaximo: 2, canales: ['in-app', 'email', 'webhook'], frecuencia: 'diaria' },
          { id: 'kpi-006', nombre: 'Tiempo Medio de Respuesta (MTTR)', valor: 45, meta: 30, unidad: 'minutos', umbralMaximo: 60, canales: ['in-app'], frecuencia: 'semanal' }
        ]
      },
      {
        id: 'obj-org-004',
        nombre: 'Eficiencia Operativa',
        descripcion: 'Optimizar procesos para maximizar la productividad y reducir costos operacionales',
        kpis: [
          { id: 'kpi-007', nombre: 'Ratio de Eficiencia', valor: 52, meta: 45, unidad: '%', umbralMaximo: 60, canales: ['in-app'], frecuencia: 'mensual' },
          { id: 'kpi-008', nombre: 'Automatización de Procesos', valor: 68, meta: 80, unidad: '%', umbralMaximo: 50, canales: ['in-app'], frecuencia: 'trimestral' }
        ]
      }
    ]
  },

  // ============================================================
  // NIVEL 2: ÁREAS (4 áreas principales)
  // ============================================================

  // ÁREA 1: Dirección de Riesgos
  {
    id: 'norg-002',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Dirección de Riesgos',
    descripcion: 'Área responsable de la identificación, evaluación, mitigación y monitoreo de todos los riesgos del grupo financiero incluyendo riesgos operacionales, crediticios, de mercado y de liquidez.',
    cargo: 'Directora de Riesgos (CRO)',
    departamento: 'Gestión de Riesgos',
    email: 'riesgos@gfatlas.mx',
    telefono: '+52 55 5000 0002',
    padreId: 'norg-001',
    tipo: 'AREA',
    icono: 'pi pi-exclamation-triangle',
    responsable: { id: 'usr-002', nombre: 'María Elena Gutiérrez Vega', email: 'mgutierrez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
    propiedadesCustom: [
      { id: 'pc-005', nombre: 'Código de área', tipo: 'TEXT', valor: 'RISK-001', requerido: true },
      { id: 'pc-006', nombre: 'Personal asignado', tipo: 'NUMBER', valor: 85, requerido: false },
      { id: 'pc-007', nombre: 'Presupuesto anual (MXN)', tipo: 'NUMBER', valor: 45000000, requerido: true },
      { id: 'pc-008', nombre: 'Metodología', tipo: 'TEXT', valor: 'COSO ERM / ISO 31000', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 2,
      nivelTolerancia: 'bajo',
      descripcion: 'Tolerancia baja - El área de riesgos debe mantener los más altos estándares de control'
    },
    objetivosNegocio: [
      {
        id: 'obj-risk-001',
        nombre: 'Reducción de Riesgo Operacional',
        descripcion: 'Minimizar pérdidas por fallas en procesos, personas, sistemas o eventos externos',
        kpis: [
          { id: 'kpi-r001', nombre: 'Índice de Riesgo Operacional', valor: 2.5, meta: 2.0, unidad: 'índice', umbralMaximo: 3.0, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-r002', nombre: 'Eventos de Pérdida', valor: 12, meta: 5, unidad: 'cantidad', umbralMaximo: 20, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      },
      {
        id: 'obj-risk-002',
        nombre: 'Gestión de Riesgo Crediticio',
        descripcion: 'Mantener la calidad de la cartera crediticia dentro de los límites establecidos',
        kpis: [
          { id: 'kpi-r003', nombre: 'Índice de Morosidad', valor: 2.8, meta: 2.0, unidad: '%', umbralMaximo: 4.0, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-r004', nombre: 'Cobertura de Provisiones', valor: 145, meta: 150, unidad: '%', umbralMaximo: 120, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // ÁREA 2: Dirección de Cumplimiento
  {
    id: 'norg-003',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Dirección de Cumplimiento',
    descripcion: 'Área encargada de asegurar el cumplimiento de todas las regulaciones bancarias, prevención de lavado de dinero, protección al consumidor y normativas internacionales.',
    cargo: 'Director de Cumplimiento (CCO)',
    departamento: 'Cumplimiento Normativo',
    email: 'cumplimiento@gfatlas.mx',
    telefono: '+52 55 5000 0003',
    padreId: 'norg-001',
    tipo: 'AREA',
    icono: 'pi pi-check-circle',
    responsable: { id: 'usr-003', nombre: 'Carlos Hernández Mora', email: 'chernandez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
    propiedadesCustom: [
      { id: 'pc-009', nombre: 'Código de área', tipo: 'TEXT', valor: 'COMP-001', requerido: true },
      { id: 'pc-010', nombre: 'Personal asignado', tipo: 'NUMBER', valor: 62, requerido: false },
      { id: 'pc-011', nombre: 'Reguladores supervisores', tipo: 'TEXT', valor: 'CNBV, Banxico, CONDUSEF, UIF', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Cero tolerancia a incumplimientos regulatorios que afecten licencias o reputación'
    },
    objetivosNegocio: [
      {
        id: 'obj-comp-001',
        nombre: 'Cumplimiento Regulatorio CNBV',
        descripcion: 'Asegurar adherencia total a disposiciones de la Comisión Nacional Bancaria',
        kpis: [
          { id: 'kpi-c001', nombre: '% Cumplimiento CNBV', valor: 96, meta: 100, unidad: '%', umbralMaximo: 90, canales: ['in-app', 'email'], frecuencia: 'mensual' },
          { id: 'kpi-c002', nombre: 'Observaciones CNBV Abiertas', valor: 2, meta: 0, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' }
        ]
      },
      {
        id: 'obj-comp-002',
        nombre: 'Prevención de Lavado de Dinero',
        descripcion: 'Mantener controles efectivos para prevenir operaciones con recursos ilícitos',
        kpis: [
          { id: 'kpi-c003', nombre: 'Alertas PLD Procesadas', valor: 95, meta: 100, unidad: '%', umbralMaximo: 85, canales: ['in-app'], frecuencia: 'semanal' },
          { id: 'kpi-c004', nombre: 'Tiempo Promedio de Análisis', valor: 48, meta: 24, unidad: 'horas', umbralMaximo: 72, canales: ['in-app'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  // ÁREA 3: Dirección de Seguridad de la Información
  {
    id: 'norg-004',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Dirección de Seguridad de la Información',
    descripcion: 'Área responsable de la estrategia de ciberseguridad, protección de datos, respuesta a incidentes y continuidad del negocio tecnológico.',
    cargo: 'Director de Seguridad (CISO)',
    departamento: 'Seguridad de la Información',
    email: 'seguridad@gfatlas.mx',
    telefono: '+52 55 5000 0004',
    padreId: 'norg-001',
    tipo: 'AREA',
    icono: 'pi pi-shield',
    responsable: { id: 'usr-004', nombre: 'Roberto Torres Ramírez', email: 'rtorres@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
    propiedadesCustom: [
      { id: 'pc-012', nombre: 'Código de área', tipo: 'TEXT', valor: 'SEC-001', requerido: true },
      { id: 'pc-013', nombre: 'Personal asignado', tipo: 'NUMBER', valor: 78, requerido: false },
      { id: 'pc-014', nombre: 'Certificaciones', tipo: 'TEXT', valor: 'ISO 27001, PCI-DSS, SOC2', requerido: true },
      { id: 'pc-015', nombre: 'Presupuesto anual (MXN)', tipo: 'NUMBER', valor: 95000000, requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Tolerancia mínima a brechas de seguridad y exposición de datos sensibles'
    },
    objetivosNegocio: [
      {
        id: 'obj-sec-001',
        nombre: 'Protección contra Ciberataques',
        descripcion: 'Prevenir, detectar y responder efectivamente a amenazas cibernéticas',
        kpis: [
          { id: 'kpi-s001', nombre: 'Incidentes Críticos', valor: 0, meta: 0, unidad: 'cantidad', umbralMaximo: 1, canales: ['in-app', 'email', 'webhook'], frecuencia: 'diaria' },
          { id: 'kpi-s002', nombre: 'Tiempo de Detección (MTTD)', valor: 15, meta: 10, unidad: 'minutos', umbralMaximo: 30, canales: ['in-app'], frecuencia: 'semanal' }
        ]
      },
      {
        id: 'obj-sec-002',
        nombre: 'Madurez de Seguridad',
        descripcion: 'Elevar el nivel de madurez en controles de seguridad según NIST CSF',
        kpis: [
          { id: 'kpi-s003', nombre: 'Nivel de Madurez NIST', valor: 3.2, meta: 4.0, unidad: 'nivel', umbralMaximo: 2.5, canales: ['in-app'], frecuencia: 'trimestral' },
          { id: 'kpi-s004', nombre: 'Vulnerabilidades Críticas Abiertas', valor: 5, meta: 0, unidad: 'cantidad', umbralMaximo: 10, canales: ['in-app', 'email'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  // ÁREA 4: Dirección de Tecnología
  {
    id: 'norg-005',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Dirección de Tecnología',
    descripcion: 'Área responsable de la infraestructura tecnológica, desarrollo de sistemas, operaciones de TI y transformación digital del grupo financiero.',
    cargo: 'Director de Tecnología (CTO)',
    departamento: 'Tecnología de la Información',
    email: 'tecnologia@gfatlas.mx',
    telefono: '+52 55 5000 0005',
    padreId: 'norg-001',
    tipo: 'AREA',
    icono: 'pi pi-server',
    responsable: { id: 'usr-005', nombre: 'Jorge Méndez Fuentes', email: 'jmendez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
    propiedadesCustom: [
      { id: 'pc-016', nombre: 'Código de área', tipo: 'TEXT', valor: 'TECH-001', requerido: true },
      { id: 'pc-017', nombre: 'Personal asignado', tipo: 'NUMBER', valor: 245, requerido: false },
      { id: 'pc-018', nombre: 'Presupuesto anual (MXN)', tipo: 'NUMBER', valor: 320000000, requerido: true },
      { id: 'pc-019', nombre: 'Data Centers', tipo: 'NUMBER', valor: 3, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'moderado',
      descripcion: 'Tolerancia moderada balanceando innovación con estabilidad operacional'
    },
    objetivosNegocio: [
      {
        id: 'obj-tech-001',
        nombre: 'Disponibilidad de Servicios',
        descripcion: 'Garantizar alta disponibilidad de sistemas críticos bancarios',
        kpis: [
          { id: 'kpi-t001', nombre: 'Uptime Servicios Críticos', valor: 99.92, meta: 99.99, unidad: '%', umbralMaximo: 99.5, canales: ['in-app', 'email', 'webhook'], frecuencia: 'diaria' },
          { id: 'kpi-t002', nombre: 'Incidentes P1', valor: 2, meta: 0, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app', 'email'], frecuencia: 'semanal' }
        ]
      },
      {
        id: 'obj-tech-002',
        nombre: 'Transformación Digital',
        descripcion: 'Acelerar la digitalización de procesos y servicios bancarios',
        kpis: [
          { id: 'kpi-t003', nombre: 'Procesos Digitalizados', valor: 72, meta: 85, unidad: '%', umbralMaximo: 60, canales: ['in-app'], frecuencia: 'mensual' },
          { id: 'kpi-t004', nombre: 'Adopción Banca Digital', valor: 68, meta: 80, unidad: '%', umbralMaximo: 50, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // ============================================================
  // NIVEL 3: SUBÁREAS (8 subáreas - 2 por cada área)
  // ============================================================

  // SUBÁREAS de Riesgos (norg-002)
  {
    id: 'norg-006',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Riesgos Operacionales',
    descripcion: 'Subárea especializada en la identificación, medición y control de riesgos derivados de procesos, personas, sistemas y eventos externos.',
    cargo: 'Gerente de Riesgos Operacionales',
    departamento: 'Riesgo Operacional',
    email: 'riesgo.operacional@gfatlas.mx',
    telefono: '+52 55 5000 0006',
    padreId: 'norg-002',
    tipo: 'SUBAREA',
    icono: 'pi pi-cog',
    responsable: { id: 'usr-006', nombre: 'Ana Patricia López García', email: 'alopez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
    propiedadesCustom: [
      { id: 'pc-020', nombre: 'Metodología', tipo: 'TEXT', valor: 'Basel III - AMA', requerido: true },
      { id: 'pc-021', nombre: 'Analistas', tipo: 'NUMBER', valor: 18, requerido: false },
      { id: 'pc-022', nombre: 'Procesos mapeados', tipo: 'NUMBER', valor: 450, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 2,
      nivelTolerancia: 'bajo',
      descripcion: 'Enfoque preventivo con tolerancia limitada a fallas operacionales'
    },
    objetivosNegocio: [
      {
        id: 'obj-rop-001',
        nombre: 'Control de Eventos de Pérdida',
        descripcion: 'Reducir frecuencia e impacto de eventos de pérdida operacional',
        kpis: [
          { id: 'kpi-ro001', nombre: 'Eventos de Pérdida Mensuales', valor: 8, meta: 3, unidad: 'cantidad', umbralMaximo: 15, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-ro002', nombre: 'Pérdida Acumulada (MXN M)', valor: 2.5, meta: 1.0, unidad: 'millones', umbralMaximo: 5.0, canales: ['in-app', 'email'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  {
    id: 'norg-007',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Riesgos de Crédito',
    descripcion: 'Subárea dedicada a la evaluación, seguimiento y control del riesgo crediticio en todas las líneas de negocio.',
    cargo: 'Gerente de Riesgos de Crédito',
    departamento: 'Riesgo de Crédito',
    email: 'riesgo.credito@gfatlas.mx',
    telefono: '+52 55 5000 0007',
    padreId: 'norg-002',
    tipo: 'SUBAREA',
    icono: 'pi pi-credit-card',
    responsable: { id: 'usr-007', nombre: 'Fernando Vega Soto', email: 'fvega@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
    propiedadesCustom: [
      { id: 'pc-023', nombre: 'Cartera administrada (MXN MM)', tipo: 'NUMBER', valor: 85000, requerido: true },
      { id: 'pc-024', nombre: 'Modelos de scoring', tipo: 'NUMBER', valor: 12, requerido: false },
      { id: 'pc-025', nombre: 'Analistas de crédito', tipo: 'NUMBER', valor: 35, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 3,
      impacto: 3,
      nivelTolerancia: 'moderado',
      descripcion: 'Balance entre crecimiento de cartera y calidad crediticia'
    },
    objetivosNegocio: [
      {
        id: 'obj-rcr-001',
        nombre: 'Calidad de Cartera',
        descripcion: 'Mantener indicadores de morosidad dentro de límites aceptables',
        kpis: [
          { id: 'kpi-rc001', nombre: 'Índice de Morosidad 90+ días', valor: 2.8, meta: 2.0, unidad: '%', umbralMaximo: 4.0, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-rc002', nombre: 'Cobertura de Reservas', valor: 148, meta: 150, unidad: '%', umbralMaximo: 120, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // SUBÁREAS de Cumplimiento (norg-003)
  {
    id: 'norg-008',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Cumplimiento Regulatorio',
    descripcion: 'Subárea responsable del seguimiento y cumplimiento de disposiciones regulatorias de CNBV, Banxico y otras autoridades.',
    cargo: 'Gerente de Cumplimiento Regulatorio',
    departamento: 'Regulación Bancaria',
    email: 'regulatorio@gfatlas.mx',
    telefono: '+52 55 5000 0008',
    padreId: 'norg-003',
    tipo: 'SUBAREA',
    icono: 'pi pi-book',
    responsable: { id: 'usr-008', nombre: 'Sofía Delgado Cruz', email: 'sdelgado@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/8.jpg' },
    propiedadesCustom: [
      { id: 'pc-026', nombre: 'Regulaciones monitoreadas', tipo: 'NUMBER', valor: 85, requerido: false },
      { id: 'pc-027', nombre: 'Reportes regulatorios mensuales', tipo: 'NUMBER', valor: 42, requerido: true },
      { id: 'pc-028', nombre: 'Especialistas', tipo: 'NUMBER', valor: 22, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Sin tolerancia a incumplimientos que generen sanciones regulatorias'
    },
    objetivosNegocio: [
      {
        id: 'obj-creg-001',
        nombre: 'Reportería Regulatoria',
        descripcion: 'Entregar todos los reportes regulatorios en tiempo y forma',
        kpis: [
          { id: 'kpi-cr001', nombre: 'Reportes Entregados a Tiempo', valor: 98, meta: 100, unidad: '%', umbralMaximo: 95, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-cr002', nombre: 'Errores en Reportes', valor: 2, meta: 0, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  {
    id: 'norg-009',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Prevención de Lavado de Dinero (PLD/AML)',
    descripcion: 'Subárea especializada en prevención, detección y reporte de operaciones con recursos de procedencia ilícita.',
    cargo: 'Oficial PLD/AML',
    departamento: 'PLD/AML',
    email: 'pld@gfatlas.mx',
    telefono: '+52 55 5000 0009',
    padreId: 'norg-003',
    tipo: 'SUBAREA',
    icono: 'pi pi-search',
    responsable: { id: 'usr-009', nombre: 'Patricia Reyes Solís', email: 'preyes@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/9.jpg' },
    propiedadesCustom: [
      { id: 'pc-029', nombre: 'Marco normativo', tipo: 'TEXT', valor: 'Ley Federal PLD / FATF', requerido: true },
      { id: 'pc-030', nombre: 'Alertas mensuales promedio', tipo: 'NUMBER', valor: 2500, requerido: false },
      { id: 'pc-031', nombre: 'Analistas PLD', tipo: 'NUMBER', valor: 28, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Cero tolerancia a operaciones con recursos ilícitos'
    },
    objetivosNegocio: [
      {
        id: 'obj-pld-001',
        nombre: 'Efectividad en Detección',
        descripcion: 'Mantener sistemas efectivos de detección de operaciones inusuales',
        kpis: [
          { id: 'kpi-pld001', nombre: 'Alertas Procesadas', valor: 96, meta: 100, unidad: '%', umbralMaximo: 90, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-pld002', nombre: 'Tiempo de Análisis Promedio', valor: 36, meta: 24, unidad: 'horas', umbralMaximo: 72, canales: ['in-app'], frecuencia: 'semanal' },
          { id: 'kpi-pld003', nombre: 'ROIs Presentados', valor: 45, meta: 50, unidad: 'cantidad', umbralMaximo: 30, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // SUBÁREAS de Seguridad (norg-004)
  {
    id: 'norg-010',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Ciberseguridad',
    descripcion: 'Subárea dedicada a la protección de infraestructura tecnológica y datos contra amenazas cibernéticas.',
    cargo: 'Gerente de Ciberseguridad',
    departamento: 'Ciberseguridad',
    email: 'ciberseguridad@gfatlas.mx',
    telefono: '+52 55 5000 0010',
    padreId: 'norg-004',
    tipo: 'SUBAREA',
    icono: 'pi pi-lock',
    responsable: { id: 'usr-010', nombre: 'Miguel Ángel Ruiz', email: 'maruiz@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/10.jpg' },
    propiedadesCustom: [
      { id: 'pc-032', nombre: 'Certificaciones equipo', tipo: 'TEXT', valor: 'CISSP, CEH, OSCP', requerido: true },
      { id: 'pc-033', nombre: 'Herramientas de seguridad', tipo: 'NUMBER', valor: 35, requerido: false },
      { id: 'pc-034', nombre: 'Especialistas', tipo: 'NUMBER', valor: 32, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 1,
      impacto: 4,
      nivelTolerancia: 'muy bajo',
      descripcion: 'Tolerancia mínima a brechas de seguridad y accesos no autorizados'
    },
    objetivosNegocio: [
      {
        id: 'obj-cyber-001',
        nombre: 'Prevención de Intrusiones',
        descripcion: 'Prevenir accesos no autorizados y ataques cibernéticos exitosos',
        kpis: [
          { id: 'kpi-cy001', nombre: 'Intentos de Intrusión Bloqueados', valor: 99.8, meta: 100, unidad: '%', umbralMaximo: 99, canales: ['in-app', 'email'], frecuencia: 'diaria' },
          { id: 'kpi-cy002', nombre: 'Vulnerabilidades Críticas', valor: 3, meta: 0, unidad: 'cantidad', umbralMaximo: 10, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  {
    id: 'norg-011',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Centro de Operaciones de Seguridad (SOC)',
    descripcion: 'Centro de monitoreo 24/7 para detección, análisis y respuesta a incidentes de seguridad.',
    cargo: 'Gerente del SOC',
    departamento: 'SOC',
    email: 'soc@gfatlas.mx',
    telefono: '+52 55 5000 0011',
    padreId: 'norg-004',
    tipo: 'SUBAREA',
    icono: 'pi pi-eye',
    responsable: { id: 'usr-011', nombre: 'Sandra Pérez Luna', email: 'sperez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/11.jpg' },
    propiedadesCustom: [
      { id: 'pc-035', nombre: 'Operación', tipo: 'TEXT', valor: '24x7x365', requerido: true },
      { id: 'pc-036', nombre: 'Alertas diarias promedio', tipo: 'NUMBER', valor: 15000, requerido: false },
      { id: 'pc-037', nombre: 'Analistas por turno', tipo: 'NUMBER', valor: 8, requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Respuesta rápida y efectiva a todos los eventos de seguridad'
    },
    objetivosNegocio: [
      {
        id: 'obj-soc-001',
        nombre: 'Respuesta a Incidentes',
        descripcion: 'Detectar y responder rápidamente a eventos de seguridad',
        kpis: [
          { id: 'kpi-soc001', nombre: 'MTTD (Tiempo de Detección)', valor: 12, meta: 5, unidad: 'minutos', umbralMaximo: 30, canales: ['in-app', 'email'], frecuencia: 'diaria' },
          { id: 'kpi-soc002', nombre: 'MTTR (Tiempo de Respuesta)', valor: 45, meta: 30, unidad: 'minutos', umbralMaximo: 60, canales: ['in-app', 'email'], frecuencia: 'diaria' },
          { id: 'kpi-soc003', nombre: 'Incidentes Contenidos en SLA', valor: 94, meta: 98, unidad: '%', umbralMaximo: 85, canales: ['in-app'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  // SUBÁREAS de Tecnología (norg-005)
  {
    id: 'norg-012',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Infraestructura y Operaciones TI',
    descripcion: 'Subárea responsable de la gestión de data centers, servidores, redes y operaciones de TI.',
    cargo: 'Gerente de Infraestructura',
    departamento: 'Infraestructura TI',
    email: 'infraestructura@gfatlas.mx',
    telefono: '+52 55 5000 0012',
    padreId: 'norg-005',
    tipo: 'SUBAREA',
    icono: 'pi pi-database',
    responsable: { id: 'usr-012', nombre: 'Eduardo Sánchez Mora', email: 'esanchez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
    propiedadesCustom: [
      { id: 'pc-038', nombre: 'Servidores físicos', tipo: 'NUMBER', valor: 450, requerido: false },
      { id: 'pc-039', nombre: 'VMs activas', tipo: 'NUMBER', valor: 2800, requerido: false },
      { id: 'pc-040', nombre: 'SLA Uptime', tipo: 'TEXT', valor: '99.99%', requerido: true }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Prioridad máxima a disponibilidad y continuidad de servicios'
    },
    objetivosNegocio: [
      {
        id: 'obj-infra-001',
        nombre: 'Disponibilidad de Infraestructura',
        descripcion: 'Garantizar operación continua de la infraestructura tecnológica',
        kpis: [
          { id: 'kpi-inf001', nombre: 'Uptime General', valor: 99.95, meta: 99.99, unidad: '%', umbralMaximo: 99.5, canales: ['in-app', 'email', 'webhook'], frecuencia: 'diaria' },
          { id: 'kpi-inf002', nombre: 'Incidentes de Infraestructura P1', valor: 1, meta: 0, unidad: 'cantidad', umbralMaximo: 3, canales: ['in-app', 'email'], frecuencia: 'semanal' }
        ]
      }
    ]
  },

  {
    id: 'norg-013',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Desarrollo de Sistemas',
    descripcion: 'Subárea de desarrollo de aplicaciones bancarias, APIs y sistemas de integración.',
    cargo: 'Gerente de Desarrollo',
    departamento: 'Desarrollo de Software',
    email: 'desarrollo@gfatlas.mx',
    telefono: '+52 55 5000 0013',
    padreId: 'norg-005',
    tipo: 'SUBAREA',
    icono: 'pi pi-code',
    responsable: { id: 'usr-013', nombre: 'Diana Torres Campos', email: 'dtorres@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/13.jpg' },
    propiedadesCustom: [
      { id: 'pc-041', nombre: 'Desarrolladores', tipo: 'NUMBER', valor: 85, requerido: false },
      { id: 'pc-042', nombre: 'Stack principal', tipo: 'TEXT', valor: 'Java, Angular, React Native', requerido: true },
      { id: 'pc-043', nombre: 'Releases mensuales', tipo: 'NUMBER', valor: 12, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 3,
      impacto: 2,
      nivelTolerancia: 'moderado',
      descripcion: 'Balance entre velocidad de desarrollo y calidad de código'
    },
    objetivosNegocio: [
      {
        id: 'obj-dev-001',
        nombre: 'Calidad de Software',
        descripcion: 'Mantener altos estándares de calidad en el desarrollo de aplicaciones',
        kpis: [
          { id: 'kpi-dev001', nombre: 'Cobertura de Pruebas', valor: 78, meta: 85, unidad: '%', umbralMaximo: 70, canales: ['in-app'], frecuencia: 'semanal' },
          { id: 'kpi-dev002', nombre: 'Defectos en Producción', valor: 5, meta: 2, unidad: 'cantidad', umbralMaximo: 10, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-dev003', nombre: 'Lead Time to Production', valor: 12, meta: 7, unidad: 'días', umbralMaximo: 21, canales: ['in-app'], frecuencia: 'mensual' }
        ]
      }
    ]
  },

  // ============================================================
  // TPRM: Subárea de Gestión de Riesgo de Terceros (bajo Riesgos)
  // ============================================================
  {
    id: 'norg-tprm-001',
    organigramaId: 'org-001', tenantId: 'tenant-001',
    nombre: 'Gestión de Riesgo de Terceros (TPRM)',
    descripcion: 'Subárea especializada en la gestión integral del riesgo de proveedores terceros críticos, con enfoque en embozadores de tarjetas. Responsable del ciclo completo: Due Diligence, gestión contractual, monitoreo continuo, desempeño, incidentes y offboarding.',
    cargo: 'Gerente de Riesgo de Terceros',
    departamento: 'TPRM',
    email: 'tprm@gfatlas.mx',
    telefono: '+52 55 5000 0020',
    padreId: 'norg-002',
    tipo: 'SUBAREA',
    icono: 'pi pi-link',
    responsable: { id: 'usr-005', nombre: 'Ana Patricia López García', email: 'alopez@gfatlas.mx', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
    propiedadesCustom: [
      { id: 'pc-tprm-001', nombre: 'Proveedores gestionados', tipo: 'NUMBER', valor: 8, requerido: false },
      { id: 'pc-tprm-002', nombre: 'Proveedores críticos', tipo: 'NUMBER', valor: 2, requerido: true },
      { id: 'pc-tprm-003', nombre: 'Metodología', tipo: 'TEXT', valor: 'ISO 27036 / NIST SP 800-161', requerido: true },
      { id: 'pc-tprm-004', nombre: 'Analistas TPRM', tipo: 'NUMBER', valor: 6, requerido: false }
    ],
    apetitoRiesgo: {
      probabilidad: 2,
      impacto: 3,
      nivelTolerancia: 'bajo',
      descripcion: 'Tolerancia baja a riesgos de proveedores que puedan afectar operación de tarjetas y datos de clientes'
    },
    objetivosNegocio: [
      {
        id: 'obj-tprm-org-001',
        nombre: 'Control de Riesgo de Embozadores',
        descripcion: 'Mantener risk score de proveedores de embozado dentro de umbrales aceptables y asegurar cumplimiento PCI-DSS',
        kpis: [
          { id: 'kpi-tprm-org001', nombre: 'Risk Score Promedio Proveedores', valor: 66, meta: 50, unidad: 'puntos', umbralMaximo: 75, canales: ['in-app', 'email'], frecuencia: 'mensual' },
          { id: 'kpi-tprm-org002', nombre: 'SLA Compliance Rate Global', valor: 87, meta: 95, unidad: '%', umbralMaximo: 80, canales: ['in-app', 'email'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-org003', nombre: 'Hallazgos Críticos Abiertos', valor: 3, meta: 0, unidad: 'cantidad', umbralMaximo: 5, canales: ['in-app', 'email', 'webhook'], frecuencia: 'semanal' },
          { id: 'kpi-tprm-org004', nombre: 'Due Diligence Completados a Tiempo', valor: 67, meta: 100, unidad: '%', umbralMaximo: 80, canales: ['in-app'], frecuencia: 'trimestral' }
        ]
      }
    ]
  }
];

// ============================================================
// Dashboard
// ============================================================
export const dashboardConfigs = [
  { id: 'dash-001', nombre: 'Dashboard Principal', descripcion: 'Panel de control GRC bancario', isDefault: true, columns: 12, rowHeight: 50, gap: 10, tenantId: 'tenant-001', createdAt: new Date().toISOString() },
];

export const dashboardWidgets = [
  { id: 'dw-001', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Cumplimiento General', config: JSON.stringify({ kpiType: 'cumplimiento', color: 'cyan' }), x: 0, y: 0, cols: 3, rows: 2, tenantId: 'tenant-001' },
  { id: 'dw-002', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Procesos Activos', config: JSON.stringify({ kpiType: 'procesos', color: 'purple' }), x: 3, y: 0, cols: 3, rows: 2, tenantId: 'tenant-001' },
  { id: 'dw-003', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Alertas Activas', config: JSON.stringify({ kpiType: 'alertas', color: 'orange' }), x: 6, y: 0, cols: 3, rows: 2, tenantId: 'tenant-001' },
  { id: 'dw-004', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Objetivos Cumplidos', config: JSON.stringify({ kpiType: 'objetivos', color: 'emerald' }), x: 9, y: 0, cols: 3, rows: 2, tenantId: 'tenant-001' },
  { id: 'dw-005', dashboardId: 'dash-001', tipo: 'graficas-interactivas', titulo: 'Gráficas Interactivas', subtitulo: 'Análisis visual de métricas', config: JSON.stringify({ chartType: 'donut' }), x: 0, y: 2, cols: 6, rows: 5, tenantId: 'tenant-001' },
  { id: 'dw-006', dashboardId: 'dash-001', tipo: 'table-mini', titulo: 'Procesos', config: JSON.stringify({ entity: 'procesos' }), x: 6, y: 2, cols: 6, rows: 5, tenantId: 'tenant-001' },
  { id: 'dw-007', dashboardId: 'dash-001', tipo: 'actividad-enhanced', titulo: 'Últimas Actividades', config: JSON.stringify({}), x: 0, y: 7, cols: 6, rows: 4, tenantId: 'tenant-001' },
  { id: 'dw-008', dashboardId: 'dash-001', tipo: 'calendario', titulo: 'Calendario', config: JSON.stringify({}), x: 6, y: 7, cols: 6, rows: 4, tenantId: 'tenant-001' },
];

// ============================================================
// Notificaciones
// ============================================================
export const notificationRules = [
  { id: 'nr-001', nombre: 'Nuevo riesgo crítico creado', descripcion: 'Notifica cuando se crea un riesgo con nivel crítico', entidadTipo: 'RISK', eventoTipo: 'CREATE', activo: true, notificarCreador: false, notificarResponsable: true, notificarAprobadores: false, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se ha identificado un nuevo riesgo crítico: {nombre}', severidad: 'critical', tenantId: 'tenant-001' },
  { id: 'nr-002', nombre: 'Incidente de seguridad reportado', descripcion: 'Notifica cuando se reporta un nuevo incidente', entidadTipo: 'INCIDENT', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, rolesDestino: JSON.stringify(['Director', 'Coordinador', 'Gestor Áreas']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se ha reportado un incidente de seguridad: {titulo}', severidad: 'warning', tenantId: 'tenant-001' },
  { id: 'nr-003', nombre: 'Cuestionario asignado', descripcion: 'Notifica cuando se asigna un cuestionario para revisión', entidadTipo: 'QUESTIONNAIRE', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se te ha asignado el cuestionario: {nombre}', severidad: 'info', tenantId: 'tenant-001' },
  { id: 'nr-004', nombre: 'Defecto crítico reportado', descripcion: 'Notifica cuando se reporta un defecto con prioridad crítica', entidadTipo: 'DEFECT', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, rolesDestino: JSON.stringify(['Coordinador', 'Gestor Áreas']), enviarInApp: true, severidad: 'critical', tenantId: 'tenant-001' },
];

export const alertRules = [
  { id: 'ar-001', nombre: 'Riesgos críticos exceden umbral', descripcion: 'Alerta cuando hay más de 5 riesgos en estado crítico', entidadTipo: 'RISK', metricaNombre: 'count_critical', operador: 'GT', valorUmbral: 5, tipoAgregacion: 'COUNT', activo: true, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, severidad: 'critical', cooldownMinutos: 1440, tenantId: 'tenant-001' },
  { id: 'ar-002', nombre: 'Incidentes sin resolver', descripcion: 'Alerta cuando hay más de 3 incidentes sin resolver en 48h', entidadTipo: 'INCIDENT', metricaNombre: 'unresolved_48h', operador: 'GT', valorUmbral: 3, tipoAgregacion: 'COUNT', activo: true, rolesDestino: JSON.stringify(['Coordinador']), enviarInApp: true, severidad: 'warning', cooldownMinutos: 720, tenantId: 'tenant-001' },
  { id: 'ar-003', nombre: 'Cumplimiento bajo umbral', descripcion: 'Alerta cuando el cumplimiento general baja del 80%', entidadTipo: 'COMPLIANCE_REVIEW', metricaNombre: 'compliance_percentage', operador: 'LT', valorUmbral: 80, tipoAgregacion: 'AVG', activo: true, rolesDestino: JSON.stringify(['Director']), enviarInApp: true, enviarEmail: false, severidad: 'warning', cooldownMinutos: 2880, tenantId: 'tenant-001' },
];

export const notifications = [
  { id: 'ntf-001', usuarioId: 'usr-004', tipo: 'NOTIFICATION', titulo: 'Nuevo riesgo crítico identificado', mensaje: 'Se ha identificado un nuevo riesgo crítico en el Core Banking System.', severidad: 'critical', entidadTipo: 'RISK', entidadId: 'rsk-002', entidadNombre: 'Acceso no autorizado a CBS', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver riesgo', url: '/riesgos/rsk-002' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'ntf-002', usuarioId: 'usr-004', tipo: 'ALERT', titulo: 'Incidentes sin resolver exceden umbral', mensaje: 'Hay 5 incidentes que llevan más de 48 horas sin resolver.', severidad: 'warning', entidadTipo: 'INCIDENT', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver incidentes', url: '/incidentes?estado=abierto' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'ntf-003', usuarioId: 'usr-009', tipo: 'EXPIRATION_REMINDER', titulo: 'Cuestionario AML próximo a vencer', mensaje: 'El cuestionario "Auditoría AML/PLD Semestral 2024-H2" vence en 7 días.', severidad: 'warning', entidadTipo: 'QUESTIONNAIRE', entidadNombre: 'Auditoría AML/PLD Semestral', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Completar cuestionario', url: '/cumplimiento/cuestionarios/aml-2024-h2' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'ntf-004', usuarioId: 'usr-003', tipo: 'APPROVAL_REQUEST', titulo: 'Respuesta pendiente de aprobación', mensaje: 'Patricia Reyes Solís ha completado el cuestionario AML y requiere tu aprobación.', severidad: 'info', entidadTipo: 'QUESTIONNAIRE', entidadNombre: 'Evaluación KYC Reforzado', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Aprobar', action: 'approve' }, { tipo: 'danger', label: 'Rechazar', action: 'reject' }]), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'ntf-005', usuarioId: 'usr-004', tipo: 'NOTIFICATION', titulo: 'Incidente de seguridad resuelto', mensaje: 'El incidente "Ataque de phishing masivo a clientes" ha sido resuelto exitosamente.', severidad: 'info', entidadTipo: 'INCIDENT', entidadNombre: 'Ataque de phishing masivo', leida: true, fechaLeida: new Date(Date.now() - 3600000).toISOString(), tenantId: 'tenant-001', createdAt: new Date().toISOString() },
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
  { id: 'prj-001', name: 'Implementación ISO 27001', description: 'Proyecto de certificación del Sistema de Gestión de Seguridad de la Información bajo la norma ISO 27001:2022', startDate: '2024-01-15', endDate: '2025-06-30', responsibleUserId: 'usr-004', priority: 'critical', status: 'in_progress', progress: 45, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-002', name: 'Migración Core Banking a Nube', description: 'Migración del sistema Core Banking a infraestructura cloud con alta disponibilidad', startDate: '2024-03-01', endDate: '2025-03-31', responsibleUserId: 'usr-005', priority: 'high', status: 'in_progress', progress: 30, reminderDays: JSON.stringify([15, 7, 3]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-003', name: 'Actualización Política AML/PLD', description: 'Revisión y actualización de políticas de Prevención de Lavado de Dinero', startDate: '2024-06-01', endDate: '2024-12-31', responsibleUserId: 'usr-009', priority: 'high', status: 'in_progress', progress: 65, reminderDays: JSON.stringify([15, 7, 1]), createdBy: 'usr-003', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-004', name: 'Plan de Continuidad de Negocio 2025', description: 'Desarrollo e implementación del Plan de Continuidad de Negocio', startDate: '2024-09-01', endDate: '2025-02-28', responsibleUserId: 'usr-004', priority: 'medium', status: 'planning', progress: 15, reminderDays: JSON.stringify([7, 3, 1]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-005', name: 'Automatización Reportes Regulatorios', description: 'Automatización de la generación de reportes regulatorios', startDate: '2024-04-15', endDate: '2024-10-30', responsibleUserId: 'usr-003', priority: 'medium', status: 'completed', progress: 100, reminderDays: JSON.stringify([7, 3]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-006', name: 'Certificación PCI-DSS v4.0', description: 'Actualización de controles y recertificación bajo el nuevo estándar PCI-DSS versión 4.0', startDate: '2024-04-01', endDate: '2024-12-31', responsibleUserId: 'usr-004', priority: 'critical', status: 'in_progress', progress: 75, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-007', name: 'Sistema Antifraude Tiempo Real', description: 'Implementación de sistema de detección de fraude en tiempo real', startDate: '2024-06-15', endDate: '2025-01-15', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 70, reminderDays: JSON.stringify([30, 15, 7]), createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'prj-008', name: 'Modernización Banca Móvil', description: 'Rediseño completo de la aplicación de banca móvil', startDate: '2024-10-01', endDate: '2025-06-30', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 20, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  // === TPRM: Proyecto de implementación ===
  { id: 'prj-tprm-001', name: 'Implementación Programa TPRM - Embozadores', description: 'Implementación del programa integral de gestión de riesgo de terceros (TPRM) enfocado en proveedores de embozado de tarjetas. Incluye Due Diligence, gestión contractual, monitoreo continuo, evaluación de desempeño, gestión de incidentes y proceso de offboarding.', startDate: '2025-02-06', endDate: '2025-12-31', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 35, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-002', tenantId: 'tenant-005', createdAt: new Date().toISOString() },
];

export const projectPhases = [
  { id: 'phase-001', projectId: 'prj-001', name: 'Análisis de Brechas', description: 'Evaluación inicial del estado actual vs requisitos ISO 27001', orderNum: 1, startDate: '2024-01-15', endDate: '2024-03-31', status: 'completed', weight: 20, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-002', projectId: 'prj-001', name: 'Diseño del SGSI', description: 'Diseño del Sistema de Gestión de Seguridad de la Información', orderNum: 2, startDate: '2024-04-01', endDate: '2024-07-31', status: 'completed', weight: 25, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-003', projectId: 'prj-001', name: 'Implementación de Controles', description: 'Implementación de controles del Anexo A', orderNum: 3, startDate: '2024-08-01', endDate: '2025-02-28', status: 'in_progress', weight: 35, progress: 40, tenantId: 'tenant-001' },
  { id: 'phase-004', projectId: 'prj-001', name: 'Auditoría Interna', description: 'Auditoría interna pre-certificación', orderNum: 4, startDate: '2025-03-01', endDate: '2025-04-30', status: 'pending', weight: 10, progress: 0, tenantId: 'tenant-001' },
  { id: 'phase-005', projectId: 'prj-001', name: 'Certificación', description: 'Auditoría de certificación por organismo acreditado', orderNum: 5, startDate: '2025-05-01', endDate: '2025-06-30', status: 'pending', weight: 10, progress: 0, tenantId: 'tenant-001' },
  { id: 'phase-006', projectId: 'prj-002', name: 'Evaluación y Planeación', description: 'Assessment de infraestructura actual y plan de migración', orderNum: 1, startDate: '2024-03-01', endDate: '2024-05-31', status: 'completed', weight: 15, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-007', projectId: 'prj-002', name: 'Arquitectura Cloud', description: 'Diseño de arquitectura cloud segura y escalable', orderNum: 2, startDate: '2024-06-01', endDate: '2024-08-31', status: 'completed', weight: 20, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-008', projectId: 'prj-002', name: 'Migración Ambiente Dev/QA', description: 'Migración de ambientes de desarrollo y pruebas', orderNum: 3, startDate: '2024-09-01', endDate: '2024-12-31', status: 'in_progress', weight: 25, progress: 45, tenantId: 'tenant-001' },
  { id: 'phase-009', projectId: 'prj-002', name: 'Migración Producción', description: 'Migración del ambiente productivo', orderNum: 4, startDate: '2025-01-01', endDate: '2025-02-28', status: 'pending', weight: 30, progress: 0, tenantId: 'tenant-001' },
  { id: 'phase-010', projectId: 'prj-003', name: 'Análisis Regulatorio', description: 'Revisión de nueva regulación y análisis de impacto', orderNum: 1, startDate: '2024-06-01', endDate: '2024-07-15', status: 'completed', weight: 20, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-011', projectId: 'prj-003', name: 'Actualización de Políticas', description: 'Redacción de nuevas políticas y procedimientos', orderNum: 2, startDate: '2024-07-16', endDate: '2024-09-30', status: 'completed', weight: 30, progress: 100, tenantId: 'tenant-001' },
  { id: 'phase-012', projectId: 'prj-003', name: 'Capacitación', description: 'Capacitación al personal en nuevas políticas', orderNum: 3, startDate: '2024-10-01', endDate: '2024-11-15', status: 'in_progress', weight: 25, progress: 60, tenantId: 'tenant-001' },
  { id: 'phase-013', projectId: 'prj-003', name: 'Implementación Sistemas', description: 'Actualización de sistemas de monitoreo AML', orderNum: 4, startDate: '2024-11-16', endDate: '2024-12-31', status: 'pending', weight: 25, progress: 0, tenantId: 'tenant-001' },
  // === TPRM: Fases del proyecto ===
  { id: 'phase-tprm-001', projectId: 'prj-tprm-001', name: 'Due Diligence Inicial de Proveedores', description: 'Evaluación integral de los 3 proveedores actuales de embozado: CPI Card Group, IDEMIA y Thales DIS', orderNum: 1, startDate: '2025-02-06', endDate: '2025-04-30', status: 'in_progress', weight: 25, progress: 55, tenantId: 'tenant-005' },
  { id: 'phase-tprm-002', projectId: 'prj-tprm-001', name: 'Definición de Contratos y SLAs', description: 'Revisión y actualización de contratos con cláusulas de auditoría, SLAs, penalizaciones y obligaciones de reporting', orderNum: 2, startDate: '2025-05-01', endDate: '2025-07-31', status: 'pending', weight: 20, progress: 0, tenantId: 'tenant-005' },
  { id: 'phase-tprm-003', projectId: 'prj-tprm-001', name: 'Implementación de Monitoreo Continuo', description: 'Establecer framework de monitoreo continuo de riesgo de terceros con evaluaciones trimestrales', orderNum: 3, startDate: '2025-08-01', endDate: '2025-10-31', status: 'pending', weight: 30, progress: 0, tenantId: 'tenant-005' },
  { id: 'phase-tprm-004', projectId: 'prj-tprm-001', name: 'Procesos de Incidentes y Offboarding', description: 'Definir e implementar procesos de gestión de incidentes y terminación controlada de relaciones', orderNum: 4, startDate: '2025-11-01', endDate: '2025-12-31', status: 'pending', weight: 25, progress: 0, tenantId: 'tenant-005' },
];

export const tasks = [
  { id: 'task-001', projectId: 'prj-001', phaseId: 'phase-003', title: 'Implementar control A.5.1 - Políticas de seguridad', description: 'Desarrollar y documentar las políticas de seguridad de la información', type: 'implementation', priority: 'high', status: 'in_progress', progress: 60, assignedTo: 'usr-004', startDate: '2024-08-01', dueDate: '2024-09-15', estimatedHours: 40, actualHours: 28, createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-002', projectId: 'prj-001', phaseId: 'phase-003', title: 'Implementar control A.8.2 - Clasificación de información', description: 'Establecer esquema de clasificación de información', type: 'implementation', priority: 'medium', status: 'pending', progress: 0, assignedTo: 'usr-005', startDate: '2024-09-16', dueDate: '2024-10-31', estimatedHours: 32, createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-003', projectId: 'prj-001', phaseId: 'phase-003', title: 'Configurar controles de acceso lógico', description: 'Implementar controles de acceso basados en roles', type: 'implementation', priority: 'critical', status: 'in_progress', progress: 75, assignedTo: 'usr-004', startDate: '2024-08-15', dueDate: '2024-09-30', estimatedHours: 48, actualHours: 36, createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-004', projectId: 'prj-002', phaseId: 'phase-008', title: 'Migrar base de datos de desarrollo', description: 'Migrar BD de desarrollo a instancia cloud', type: 'migration', priority: 'high', status: 'completed', progress: 100, assignedTo: 'usr-010', startDate: '2024-09-01', dueDate: '2024-09-30', estimatedHours: 24, actualHours: 20, createdBy: 'usr-005', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-005', projectId: 'prj-002', phaseId: 'phase-008', title: 'Configurar pipeline CI/CD', description: 'Establecer pipeline de integración continua en cloud', type: 'configuration', priority: 'high', status: 'in_progress', progress: 50, assignedTo: 'usr-010', startDate: '2024-10-01', dueDate: '2024-11-15', estimatedHours: 40, actualHours: 18, createdBy: 'usr-005', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-006', projectId: 'prj-003', phaseId: 'phase-012', title: 'Desarrollar material de capacitación', description: 'Crear presentaciones y guías para capacitación AML', type: 'documentation', priority: 'medium', status: 'completed', progress: 100, assignedTo: 'usr-009', startDate: '2024-10-01', dueDate: '2024-10-15', estimatedHours: 16, actualHours: 14, createdBy: 'usr-009', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-007', projectId: 'prj-003', phaseId: 'phase-012', title: 'Impartir capacitación a personal de cumplimiento', description: 'Sesiones de capacitación para el área de cumplimiento', type: 'training', priority: 'high', status: 'in_progress', progress: 70, assignedTo: 'usr-009', startDate: '2024-10-16', dueDate: '2024-10-31', estimatedHours: 24, actualHours: 16, createdBy: 'usr-009', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-008', projectId: 'prj-006', phaseId: null, title: 'Auditoría interna de controles PCI', description: 'Realizar auditoría interna de cumplimiento PCI-DSS', type: 'audit', priority: 'critical', status: 'in_progress', progress: 40, assignedTo: 'usr-007', startDate: '2024-11-01', dueDate: '2024-11-30', estimatedHours: 60, actualHours: 24, createdBy: 'usr-004', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-009', projectId: 'prj-007', phaseId: null, title: 'Integrar motor de reglas antifraude', description: 'Configurar e integrar motor de detección en tiempo real', type: 'integration', priority: 'critical', status: 'in_progress', progress: 65, assignedTo: 'usr-010', startDate: '2024-10-15', dueDate: '2024-12-15', estimatedHours: 80, actualHours: 52, createdBy: 'usr-005', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
  { id: 'task-010', projectId: 'prj-008', phaseId: null, title: 'Diseñar nuevo flujo de login', description: 'Diseñar experiencia de usuario para nuevo proceso de autenticación', type: 'design', priority: 'high', status: 'completed', progress: 100, assignedTo: 'usr-006', startDate: '2024-10-01', dueDate: '2024-10-20', estimatedHours: 20, actualHours: 18, createdBy: 'usr-005', tenantId: 'tenant-001', createdAt: new Date().toISOString() },
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
