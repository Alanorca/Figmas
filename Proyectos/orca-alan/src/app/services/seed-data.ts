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
];

// ============================================================
// Activos
// ============================================================
export const activos = [
  { id: 'act-001', nombre: 'Core Banking System (CBS)', descripcion: 'Sistema central de operaciones bancarias que procesa todas las transacciones financieras del banco', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-001', propiedadesCustom: JSON.stringify([{ propiedadId: 'cb-1', campo: 'version', valor: '12.5.3' }, { propiedadId: 'cb-2', campo: 'proveedor', valor: 'Temenos' }]), createdAt: new Date().toISOString() },
  { id: 'act-002', nombre: 'Sistema de Banca en Línea', descripcion: 'Plataforma de banca digital para clientes (web y móvil)', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-001', propiedadesCustom: JSON.stringify([{ propiedadId: 'cb-1', campo: 'version', valor: '8.2.1' }]), createdAt: new Date().toISOString() },
  { id: 'act-003', nombre: 'Sistema SPEI/SPID', descripcion: 'Sistema de pagos electrónicos interbancarios', tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Tesorería', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-004', nombre: 'Sistema Anti-Lavado (AML)', descripcion: 'Sistema de detección y prevención de lavado de dinero', tipo: 'software', criticidad: 'alta', responsable: 'Patricia Reyes Solís', departamento: 'PLD/AML', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-005', nombre: 'Sistema de Gestión de Créditos', descripcion: 'Plataforma para originación y gestión del ciclo de crédito', tipo: 'software', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Crédito', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-006', nombre: 'Base de Datos de Clientes', descripcion: 'Repositorio central de información de clientes (KYC)', tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' }, { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Confidencial' }]), createdAt: new Date().toISOString() },
  { id: 'act-007', nombre: 'Base de Datos de Transacciones', descripcion: 'Almacén de todas las transacciones financieras', tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' }, { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Restringido' }]), createdAt: new Date().toISOString() },
  { id: 'act-008', nombre: 'Data Warehouse Analítico', descripcion: 'Almacén de datos para análisis y reportes regulatorios', tipo: 'datos', criticidad: 'alta', responsable: 'Ana Patricia López García', departamento: 'Riesgos', plantillaId: 'plt-003', propiedadesCustom: JSON.stringify([{ propiedadId: 'db-1', campo: 'motorBD', valor: 'Teradata' }]), createdAt: new Date().toISOString() },
  { id: 'act-009', nombre: 'Servidor Principal Core Banking', descripcion: 'Servidor de producción del sistema core bancario', tipo: 'hardware', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-004', propiedadesCustom: JSON.stringify([{ propiedadId: 'srv-1', campo: 'marca', valor: 'IBM' }, { propiedadId: 'srv-2', campo: 'modelo', valor: 'Power9' }]), createdAt: new Date().toISOString() },
  { id: 'act-010', nombre: 'Servidor de Contingencia', descripcion: 'Servidor de respaldo para continuidad de negocio', tipo: 'hardware', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'TI', plantillaId: 'plt-004', propiedadesCustom: JSON.stringify([{ propiedadId: 'srv-5', campo: 'ambiente', valor: 'DR' }]), createdAt: new Date().toISOString() },
  { id: 'act-011', nombre: 'Red de Cajeros Automáticos', descripcion: 'Flota de 450 cajeros automáticos a nivel nacional', tipo: 'hardware', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', plantillaId: 'plt-002', propiedadesCustom: JSON.stringify([{ propiedadId: 'atm-1', campo: 'marca', valor: 'NCR' }]), createdAt: new Date().toISOString() },
  { id: 'act-012', nombre: 'Servicio de Transferencias Internacionales', descripcion: 'Servicio SWIFT para transferencias internacionales', tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Tesorería', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-013', nombre: 'Servicio de Pagos con Tarjeta', descripcion: 'Procesamiento de pagos con tarjetas de crédito y débito', tipo: 'servicios', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-014', nombre: 'Red WAN Corporativa', descripcion: 'Red de área amplia que conecta sucursales y data centers', tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
  { id: 'act-015', nombre: 'Firewall Perimetral', descripcion: 'Sistema de protección perimetral de la red bancaria', tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad', propiedadesCustom: '[]', createdAt: new Date().toISOString() },
];

// ============================================================
// Riesgos
// ============================================================
export const riesgos = [
  { id: 'rsk-001', activoId: 'act-001', descripcion: 'Falla crítica del sistema core banking que impida operaciones', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-002', activoId: 'act-001', descripcion: 'Acceso no autorizado a funciones administrativas del core', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-003', activoId: 'act-002', descripcion: 'Ataque de phishing dirigido a clientes de banca en línea', probabilidad: 4, impacto: 4, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-004', activoId: 'act-002', descripcion: 'Vulnerabilidad XSS en portal de banca en línea', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-005', activoId: 'act-003', descripcion: 'Interrupción de conexión con Banco de México', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Carlos Hernández Mora', createdAt: new Date().toISOString() },
  { id: 'rsk-006', activoId: 'act-004', descripcion: 'Falla en detección de operaciones inusuales', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Patricia Reyes Solís', createdAt: new Date().toISOString() },
  { id: 'rsk-007', activoId: 'act-006', descripcion: 'Fuga de datos personales de clientes (datos KYC)', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-008', activoId: 'act-011', descripcion: 'Skimming de tarjetas en red de ATMs', probabilidad: 3, impacto: 4, estado: 'en_tratamiento', responsable: 'Jorge Vargas Luna', createdAt: new Date().toISOString() },
  { id: 'rsk-009', activoId: 'act-014', descripcion: 'Ataque DDoS contra infraestructura bancaria', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'rsk-010', activoId: 'act-015', descripcion: 'Intrusión a través de vulnerabilidad en firewall', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
];

// ============================================================
// Incidentes
// ============================================================
export const incidentes = [
  { id: 'inc-001', activoId: 'act-002', titulo: 'Ataque de phishing masivo a clientes', descripcion: 'Se detectaron más de 500 intentos de phishing dirigidos a clientes de banca en línea', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'inc-002', activoId: 'act-001', titulo: 'Degradación de rendimiento en Core Banking', descripcion: 'El sistema core experimentó lentitud durante 3 horas debido a un proceso batch mal configurado', severidad: 'media', estado: 'cerrado', reportadoPor: 'Ana Patricia López García', createdAt: new Date().toISOString() },
  { id: 'inc-003', activoId: 'act-011', titulo: 'Dispositivo de skimming detectado', descripcion: 'Se encontró un dispositivo de clonación de tarjetas en ATM de sucursal Polanco', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna', createdAt: new Date().toISOString() },
  { id: 'inc-004', activoId: 'act-003', titulo: 'Intermitencia en conexión SPEI', descripcion: 'Conexión intermitente con Banco de México durante ventana de operación matutina', severidad: 'critica', estado: 'cerrado', reportadoPor: 'Carlos Hernández Mora', createdAt: new Date().toISOString() },
  { id: 'inc-005', activoId: 'act-006', titulo: 'Acceso no autorizado detectado', descripcion: 'Se detectó intento de acceso no autorizado a base de datos de clientes desde IP externa', severidad: 'critica', estado: 'en_investigacion', reportadoPor: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'inc-006', activoId: 'act-004', titulo: 'Falla en generación de alertas AML', descripcion: 'El sistema AML no generó alertas durante 2 horas por error en servicio de monitoreo', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Patricia Reyes Solís', createdAt: new Date().toISOString() },
  { id: 'inc-007', activoId: 'act-013', titulo: 'Transacciones fraudulentas con tarjeta', descripcion: 'Se detectaron 25 transacciones fraudulentas en un período de 30 minutos', severidad: 'alta', estado: 'en_contencion', reportadoPor: 'Patricia Reyes Solís', createdAt: new Date().toISOString() },
  { id: 'inc-008', activoId: 'act-014', titulo: 'Caída de enlace principal WAN', descripcion: 'Pérdida de conectividad con 15 sucursales por falla en enlace de proveedor', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
];

// ============================================================
// Defectos
// ============================================================
export const defectos = [
  { id: 'def-001', activoId: 'act-001', titulo: 'Error en cálculo de intereses moratorios', descripcion: 'El módulo de créditos calcula incorrectamente los intereses moratorios para créditos con pagos parciales', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Ana Patricia López García', createdAt: new Date().toISOString() },
  { id: 'def-002', activoId: 'act-002', titulo: 'Timeout en consulta de movimientos', descripcion: 'La consulta de movimientos en banca en línea presenta timeout cuando hay más de 500 registros', tipo: 'rendimiento', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'def-003', activoId: 'act-002', titulo: 'Vulnerabilidad en autenticación de app móvil', descripcion: 'Se identificó vulnerabilidad que permite bypass de segundo factor en ciertas condiciones', tipo: 'seguridad', prioridad: 'critica', estado: 'en_correccion', detectadoPor: 'Roberto Torres Ramírez', createdAt: new Date().toISOString() },
  { id: 'def-004', activoId: 'act-004', titulo: 'Falsos positivos excesivos en alertas', descripcion: 'El sistema genera demasiados falsos positivos en alertas de operaciones inusuales', tipo: 'funcional', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Patricia Reyes Solís', createdAt: new Date().toISOString() },
  { id: 'def-005', activoId: 'act-005', titulo: 'Error en workflow de aprobación de crédito', descripcion: 'El flujo de aprobación no notifica correctamente al siguiente aprobador', tipo: 'funcional', prioridad: 'alta', estado: 'corregido', detectadoPor: 'Fernando Castillo Núñez', createdAt: new Date().toISOString() },
];

// ============================================================
// Procesos
// ============================================================
export const procesos = [
  { id: 'prc-001', nombre: 'Conoce a tu Cliente (KYC)', descripcion: 'Proceso de identificación y verificación de clientes para cumplimiento regulatorio', version: '2.1', estado: 'activo', createdBy: 'usr-003', createdAt: new Date().toISOString() },
  { id: 'prc-002', nombre: 'Prevención de Lavado de Dinero (AML)', descripcion: 'Proceso de monitoreo y detección de operaciones inusuales y sospechosas', version: '3.0', estado: 'activo', createdBy: 'usr-009', createdAt: new Date().toISOString() },
  { id: 'prc-003', nombre: 'Originación de Crédito', descripcion: 'Proceso end-to-end para la solicitud, evaluación y otorgamiento de créditos', version: '1.5', estado: 'activo', createdBy: 'usr-003', createdAt: new Date().toISOString() },
  { id: 'prc-004', nombre: 'Apertura de Cuenta', descripcion: 'Proceso de apertura de cuentas de captación para personas físicas y morales', version: '2.0', estado: 'activo', createdBy: 'usr-008', createdAt: new Date().toISOString() },
  { id: 'prc-005', nombre: 'Gestión de Incidentes de Seguridad', descripcion: 'Proceso de detección, respuesta y recuperación ante incidentes de seguridad', version: '1.2', estado: 'activo', createdBy: 'usr-004', createdAt: new Date().toISOString() },
];

export const processNodes = [
  { id: 'pn-001', procesoId: 'prc-001', nodeId: 'node-1', type: 'start', label: 'Inicio', position: JSON.stringify({ x: 100, y: 100 }) },
  { id: 'pn-002', procesoId: 'prc-001', nodeId: 'node-2', type: 'task', label: 'Recepción de documentos', position: JSON.stringify({ x: 250, y: 100 }) },
  { id: 'pn-003', procesoId: 'prc-001', nodeId: 'node-3', type: 'task', label: 'Verificación de identidad', position: JSON.stringify({ x: 400, y: 100 }) },
  { id: 'pn-004', procesoId: 'prc-001', nodeId: 'node-4', type: 'decision', label: 'Aprobado?', position: JSON.stringify({ x: 550, y: 100 }) },
  { id: 'pn-005', procesoId: 'prc-001', nodeId: 'node-5', type: 'end', label: 'Fin', position: JSON.stringify({ x: 700, y: 100 }) },
];

export const processEdges = [
  { id: 'pe-001', procesoId: 'prc-001', edgeId: 'edge-1', source: 'node-1', target: 'node-2' },
  { id: 'pe-002', procesoId: 'prc-001', edgeId: 'edge-2', source: 'node-2', target: 'node-3' },
  { id: 'pe-003', procesoId: 'prc-001', edgeId: 'edge-3', source: 'node-3', target: 'node-4' },
  { id: 'pe-004', procesoId: 'prc-001', edgeId: 'edge-4', source: 'node-4', target: 'node-5' },
];

export const objetivosProceso = [
  { id: 'obj-001', procesoId: 'prc-001', nombre: 'Reducir tiempo de onboarding', descripcion: 'Reducir el tiempo promedio de alta de clientes a 24 horas', progreso: 75 },
  { id: 'obj-002', procesoId: 'prc-002', nombre: 'Detectar operaciones sospechosas', descripcion: 'Detectar el 95% de operaciones sospechosas en tiempo real', progreso: 88 },
];

export const kpisProceso = [
  { id: 'kpi-001', procesoId: 'prc-001', nombre: 'Tiempo promedio de verificación', valorActual: 18, valorMeta: 24, unidad: 'horas', estado: 'verde' },
  { id: 'kpi-002', procesoId: 'prc-002', nombre: 'Tasa de detección', valorActual: 92, valorMeta: 95, unidad: '%', estado: 'amarillo' },
  { id: 'kpi-003', procesoId: 'prc-003', nombre: 'Tiempo de aprobación', valorActual: 72, valorMeta: 48, unidad: 'horas', estado: 'rojo' },
];

// ============================================================
// Marcos Normativos
// ============================================================
export const marcosNormativos = [
  { id: 'marco-001', nombre: 'Disposiciones de Carácter General aplicables a Instituciones de Crédito', acronimo: 'CUB', version: '2024', fechaVigencia: '2024-01-01', descripcion: 'Circular Única de Bancos emitida por la CNBV', activo: true },
  { id: 'marco-002', nombre: 'Disposiciones de Prevención de Lavado de Dinero', acronimo: 'PLD/FT', version: '2023', fechaVigencia: '2023-07-01', descripcion: 'Normatividad para la prevención de lavado de dinero', activo: true },
  { id: 'marco-003', nombre: 'Payment Card Industry Data Security Standard', acronimo: 'PCI-DSS', version: '4.0', fechaVigencia: '2024-03-31', descripcion: 'Estándar de seguridad de datos para tarjetas de pago', activo: true },
  { id: 'marco-004', nombre: 'Sistema de Gestión de Seguridad de la Información', acronimo: 'ISO 27001', version: '2022', fechaVigencia: '2022-10-25', descripcion: 'Estándar internacional para la gestión de seguridad', activo: true },
  { id: 'marco-005', nombre: 'Ley Federal de Protección de Datos Personales', acronimo: 'LFPDPPP', version: '2024', fechaVigencia: '2010-07-05', descripcion: 'Ley que regula el tratamiento de datos personales', activo: true },
];

// ============================================================
// Cuestionarios
// ============================================================
export const cuestionarios = [
  { id: 'cst-001', nombre: 'Autoevaluación PCI-DSS v4.0', descripcion: 'Cuestionario de autoevaluación para cumplimiento del estándar PCI-DSS', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'autoevaluacion', estado: 'activo', marcoNormativoId: 'marco-003', periodicidad: 'trimestral', umbrales: JSON.stringify({ deficiente: 60, aceptable: 80, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['TI', 'Seguridad']), responsables: JSON.stringify(['usr-004']), createdAt: new Date().toISOString() },
  { id: 'cst-002', nombre: 'Evaluación de Controles AML/PLD', descripcion: 'Evaluación de controles de prevención de lavado de dinero', categoria: 'cumplimiento', tipo: 'manual', tipoEvaluacion: 'auditoria_externa', estado: 'activo', marcoNormativoId: 'marco-002', periodicidad: 'semestral', umbrales: JSON.stringify({ deficiente: 70, aceptable: 85, sobresaliente: 95 }), areasObjetivo: JSON.stringify(['Cumplimiento', 'PLD/AML']), responsables: JSON.stringify(['usr-009']), createdAt: new Date().toISOString() },
  { id: 'cst-003', nombre: 'Auditoría Interna ISO 27001', descripcion: 'Revisión de controles del SGSI según ISO 27001:2022', categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'revision_controles', estado: 'activo', marcoNormativoId: 'marco-004', periodicidad: 'anual', umbrales: JSON.stringify({ deficiente: 65, aceptable: 80, sobresaliente: 92 }), areasObjetivo: JSON.stringify(['Seguridad', 'TI', 'Riesgos']), responsables: JSON.stringify(['usr-004', 'usr-010']), createdAt: new Date().toISOString() },
];

export const secciones = [
  { id: 'sec-001', cuestionarioId: 'cst-001', nombre: 'Protección de datos del titular de tarjeta', descripcion: 'Controles para proteger los datos del titular', orden: 1 },
  { id: 'sec-002', cuestionarioId: 'cst-001', nombre: 'Mantenimiento de un programa de seguridad', descripcion: 'Controles de seguridad de la información', orden: 2 },
  { id: 'sec-003', cuestionarioId: 'cst-002', nombre: 'Identificación del cliente', descripcion: 'Controles KYC y debida diligencia', orden: 1 },
  { id: 'sec-004', cuestionarioId: 'cst-002', nombre: 'Monitoreo de transacciones', descripcion: 'Controles de monitoreo y alertas', orden: 2 },
];

export const preguntas = [
  { id: 'prg-001', seccionId: 'sec-001', texto: '¿Se cifran los datos del titular de tarjeta durante la transmisión?', tipo: 'si_no', requerida: true, orden: 1 },
  { id: 'prg-002', seccionId: 'sec-001', texto: '¿Se utiliza cifrado fuerte para almacenar datos del titular?', tipo: 'si_no', requerida: true, orden: 2 },
  { id: 'prg-003', seccionId: 'sec-002', texto: '¿Existe un programa de concientización de seguridad?', tipo: 'si_no', requerida: true, orden: 1 },
  { id: 'prg-004', seccionId: 'sec-003', texto: '¿Se verifica la identidad del cliente al momento del alta?', tipo: 'si_no', requerida: true, orden: 1 },
  { id: 'prg-005', seccionId: 'sec-004', texto: '¿Cuántas alertas de operaciones inusuales se generan en promedio por día?', tipo: 'numero', requerida: false, orden: 1 },
];

export const asignaciones = [
  { id: 'asig-001', cuestionarioId: 'cst-001', titulo: 'Revisión Trimestral PCI-DSS Q4 2024', descripcion: 'Autoevaluación de cumplimiento PCI-DSS para el cuarto trimestre', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-004']), usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']), areaId: 'seguridad', areaNombre: 'Seguridad de Información', responsableId: 'usr-004', responsableNombre: 'Roberto Torres Ramírez', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 45 },
  { id: 'asig-002', cuestionarioId: 'cst-002', titulo: 'Auditoría AML/PLD Semestral 2024-H2', descripcion: 'Evaluación de controles anti lavado de dinero segundo semestre', tipoRevision: 'externa', usuariosAsignados: JSON.stringify(['usr-009', 'usr-006']), usuariosAsignadosNombres: JSON.stringify(['Patricia Reyes Solís', 'Fernando Castillo Núñez']), areaId: 'cumplimiento', areaNombre: 'Cumplimiento Normativo', responsableId: 'usr-009', responsableNombre: 'Patricia Reyes Solís', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), estado: 'en_progreso', progreso: 78 },
  { id: 'asig-003', cuestionarioId: 'cst-003', titulo: 'Auditoría Interna SGSI 2024', descripcion: 'Revisión anual del Sistema de Gestión de Seguridad de la Información', tipoRevision: 'interna', usuariosAsignados: JSON.stringify(['usr-007']), usuariosAsignadosNombres: JSON.stringify(['Laura Mendoza Díaz']), areaId: 'auditoria', areaNombre: 'Auditoría Interna', responsableId: 'usr-007', responsableNombre: 'Laura Mendoza Díaz', fechaInicio: new Date().toISOString(), fechaVencimiento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), estado: 'pendiente', progreso: 0 },
];

// ============================================================
// Organigramas
// ============================================================
export const organigramas = [
  { id: 'org-001', nombre: 'Organigrama Banco Global', descripcion: 'Estructura organizacional del banco', createdAt: new Date().toISOString() },
];

export const nodosOrganigrama = [
  { id: 'norg-001', organigramaId: 'org-001', nombre: 'Ricardo Salinas Pliego', cargo: 'Director General (CEO)', departamento: 'Dirección General', email: 'rsalinas@bancoglobal.mx', telefono: '+52 55 1234 0001', padreId: null },
  { id: 'norg-002', organigramaId: 'org-001', nombre: 'María Elena Gutiérrez Vega', cargo: 'Directora de Riesgos (CRO)', departamento: 'Riesgos', email: 'mgutierrez@bancoglobal.mx', padreId: 'norg-001' },
  { id: 'norg-003', organigramaId: 'org-001', nombre: 'Carlos Hernández Mora', cargo: 'Oficial de Cumplimiento (CCO)', departamento: 'Cumplimiento', email: 'chernandez@bancoglobal.mx', padreId: 'norg-001' },
  { id: 'norg-004', organigramaId: 'org-001', nombre: 'Roberto Torres Ramírez', cargo: 'Oficial de Seguridad (CISO)', departamento: 'Seguridad de Información', email: 'rtorres@bancoglobal.mx', padreId: 'norg-001' },
  { id: 'norg-005', organigramaId: 'org-001', nombre: 'Ana Patricia López García', cargo: 'Analista Senior de Riesgos', departamento: 'Riesgos', email: 'alopez@bancoglobal.mx', padreId: 'norg-002' },
  { id: 'norg-006', organigramaId: 'org-001', nombre: 'Fernando Castillo Núñez', cargo: 'Analista de Cumplimiento', departamento: 'Cumplimiento', email: 'fcastillo@bancoglobal.mx', padreId: 'norg-003' },
  { id: 'norg-007', organigramaId: 'org-001', nombre: 'Patricia Reyes Solís', cargo: 'Oficial PLD/AML', departamento: 'PLD/AML', email: 'preyes@bancoglobal.mx', padreId: 'norg-003' },
  { id: 'norg-008', organigramaId: 'org-001', nombre: 'Laura Mendoza Díaz', cargo: 'Auditora Interna Senior', departamento: 'Auditoría', email: 'lmendoza@bancoglobal.mx', padreId: 'norg-001' },
];

// ============================================================
// Dashboard
// ============================================================
export const dashboardConfigs = [
  { id: 'dash-001', nombre: 'Dashboard Principal', descripcion: 'Panel de control GRC bancario', isDefault: true, columns: 12, rowHeight: 50, gap: 10, createdAt: new Date().toISOString() },
];

export const dashboardWidgets = [
  { id: 'dw-001', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Cumplimiento General', config: JSON.stringify({ kpiType: 'cumplimiento', color: 'cyan' }), x: 0, y: 0, cols: 3, rows: 2 },
  { id: 'dw-002', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Procesos Activos', config: JSON.stringify({ kpiType: 'procesos', color: 'purple' }), x: 3, y: 0, cols: 3, rows: 2 },
  { id: 'dw-003', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Alertas Activas', config: JSON.stringify({ kpiType: 'alertas', color: 'orange' }), x: 6, y: 0, cols: 3, rows: 2 },
  { id: 'dw-004', dashboardId: 'dash-001', tipo: 'kpi-card', titulo: 'Objetivos Cumplidos', config: JSON.stringify({ kpiType: 'objetivos', color: 'emerald' }), x: 9, y: 0, cols: 3, rows: 2 },
  { id: 'dw-005', dashboardId: 'dash-001', tipo: 'graficas-interactivas', titulo: 'Gráficas Interactivas', subtitulo: 'Análisis visual de métricas', config: JSON.stringify({ chartType: 'donut' }), x: 0, y: 2, cols: 6, rows: 5 },
  { id: 'dw-006', dashboardId: 'dash-001', tipo: 'table-mini', titulo: 'Procesos', config: JSON.stringify({ entity: 'procesos' }), x: 6, y: 2, cols: 6, rows: 5 },
  { id: 'dw-007', dashboardId: 'dash-001', tipo: 'actividad-enhanced', titulo: 'Últimas Actividades', config: JSON.stringify({}), x: 0, y: 7, cols: 6, rows: 4 },
  { id: 'dw-008', dashboardId: 'dash-001', tipo: 'calendario', titulo: 'Calendario', config: JSON.stringify({}), x: 6, y: 7, cols: 6, rows: 4 },
];

// ============================================================
// Notificaciones
// ============================================================
export const notificationRules = [
  { id: 'nr-001', nombre: 'Nuevo riesgo crítico creado', descripcion: 'Notifica cuando se crea un riesgo con nivel crítico', entidadTipo: 'RISK', eventoTipo: 'CREATE', activo: true, notificarCreador: false, notificarResponsable: true, notificarAprobadores: false, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se ha identificado un nuevo riesgo crítico: {nombre}', severidad: 'critical' },
  { id: 'nr-002', nombre: 'Incidente de seguridad reportado', descripcion: 'Notifica cuando se reporta un nuevo incidente', entidadTipo: 'INCIDENT', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, rolesDestino: JSON.stringify(['Director', 'Coordinador', 'Gestor Áreas']), enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se ha reportado un incidente de seguridad: {titulo}', severidad: 'warning' },
  { id: 'nr-003', nombre: 'Cuestionario asignado', descripcion: 'Notifica cuando se asigna un cuestionario para revisión', entidadTipo: 'QUESTIONNAIRE', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, enviarInApp: true, enviarEmail: false, plantillaMensaje: 'Se te ha asignado el cuestionario: {nombre}', severidad: 'info' },
  { id: 'nr-004', nombre: 'Defecto crítico reportado', descripcion: 'Notifica cuando se reporta un defecto con prioridad crítica', entidadTipo: 'DEFECT', eventoTipo: 'CREATE', activo: true, notificarResponsable: true, rolesDestino: JSON.stringify(['Coordinador', 'Gestor Áreas']), enviarInApp: true, severidad: 'critical' },
];

export const alertRules = [
  { id: 'ar-001', nombre: 'Riesgos críticos exceden umbral', descripcion: 'Alerta cuando hay más de 5 riesgos en estado crítico', entidadTipo: 'RISK', metricaNombre: 'count_critical', operador: 'GT', valorUmbral: 5, tipoAgregacion: 'COUNT', activo: true, rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']), enviarInApp: true, severidad: 'critical', cooldownMinutos: 1440 },
  { id: 'ar-002', nombre: 'Incidentes sin resolver', descripcion: 'Alerta cuando hay más de 3 incidentes sin resolver en 48h', entidadTipo: 'INCIDENT', metricaNombre: 'unresolved_48h', operador: 'GT', valorUmbral: 3, tipoAgregacion: 'COUNT', activo: true, rolesDestino: JSON.stringify(['Coordinador']), enviarInApp: true, severidad: 'warning', cooldownMinutos: 720 },
  { id: 'ar-003', nombre: 'Cumplimiento bajo umbral', descripcion: 'Alerta cuando el cumplimiento general baja del 80%', entidadTipo: 'COMPLIANCE_REVIEW', metricaNombre: 'compliance_percentage', operador: 'LT', valorUmbral: 80, tipoAgregacion: 'AVG', activo: true, rolesDestino: JSON.stringify(['Director']), enviarInApp: true, enviarEmail: false, severidad: 'warning', cooldownMinutos: 2880 },
];

export const notifications = [
  { id: 'ntf-001', usuarioId: 'usr-004', tipo: 'NOTIFICATION', titulo: 'Nuevo riesgo crítico identificado', mensaje: 'Se ha identificado un nuevo riesgo crítico en el Core Banking System.', severidad: 'critical', entidadTipo: 'RISK', entidadId: 'rsk-002', entidadNombre: 'Acceso no autorizado a CBS', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver riesgo', url: '/riesgos/rsk-002' }]), createdAt: new Date().toISOString() },
  { id: 'ntf-002', usuarioId: 'usr-004', tipo: 'ALERT', titulo: 'Incidentes sin resolver exceden umbral', mensaje: 'Hay 5 incidentes que llevan más de 48 horas sin resolver.', severidad: 'warning', entidadTipo: 'INCIDENT', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Ver incidentes', url: '/incidentes?estado=abierto' }]), createdAt: new Date().toISOString() },
  { id: 'ntf-003', usuarioId: 'usr-009', tipo: 'EXPIRATION_REMINDER', titulo: 'Cuestionario AML próximo a vencer', mensaje: 'El cuestionario "Auditoría AML/PLD Semestral 2024-H2" vence en 7 días.', severidad: 'warning', entidadTipo: 'QUESTIONNAIRE', entidadNombre: 'Auditoría AML/PLD Semestral', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Completar cuestionario', url: '/cumplimiento/cuestionarios/aml-2024-h2' }]), createdAt: new Date().toISOString() },
  { id: 'ntf-004', usuarioId: 'usr-003', tipo: 'APPROVAL_REQUEST', titulo: 'Respuesta pendiente de aprobación', mensaje: 'Patricia Reyes Solís ha completado el cuestionario AML y requiere tu aprobación.', severidad: 'info', entidadTipo: 'QUESTIONNAIRE', entidadNombre: 'Evaluación KYC Reforzado', leida: false, acciones: JSON.stringify([{ tipo: 'primary', label: 'Aprobar', action: 'approve' }, { tipo: 'danger', label: 'Rechazar', action: 'reject' }]), createdAt: new Date().toISOString() },
  { id: 'ntf-005', usuarioId: 'usr-004', tipo: 'NOTIFICATION', titulo: 'Incidente de seguridad resuelto', mensaje: 'El incidente "Ataque de phishing masivo a clientes" ha sido resuelto exitosamente.', severidad: 'info', entidadTipo: 'INCIDENT', entidadNombre: 'Ataque de phishing masivo', leida: true, fechaLeida: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date().toISOString() },
];

// ============================================================
// Proyectos
// ============================================================
export const projects = [
  { id: 'prj-001', name: 'Implementación ISO 27001', description: 'Proyecto de certificación del Sistema de Gestión de Seguridad de la Información bajo la norma ISO 27001:2022', startDate: '2024-01-15', endDate: '2025-06-30', responsibleUserId: 'usr-004', priority: 'critical', status: 'in_progress', progress: 45, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
  { id: 'prj-002', name: 'Migración Core Banking a Nube', description: 'Migración del sistema Core Banking a infraestructura cloud con alta disponibilidad', startDate: '2024-03-01', endDate: '2025-03-31', responsibleUserId: 'usr-005', priority: 'high', status: 'in_progress', progress: 30, reminderDays: JSON.stringify([15, 7, 3]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
  { id: 'prj-003', name: 'Actualización Política AML/PLD', description: 'Revisión y actualización de políticas de Prevención de Lavado de Dinero', startDate: '2024-06-01', endDate: '2024-12-31', responsibleUserId: 'usr-009', priority: 'high', status: 'in_progress', progress: 65, reminderDays: JSON.stringify([15, 7, 1]), createdBy: 'usr-003', createdAt: new Date().toISOString() },
  { id: 'prj-004', name: 'Plan de Continuidad de Negocio 2025', description: 'Desarrollo e implementación del Plan de Continuidad de Negocio', startDate: '2024-09-01', endDate: '2025-02-28', responsibleUserId: 'usr-004', priority: 'medium', status: 'planning', progress: 15, reminderDays: JSON.stringify([7, 3, 1]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
  { id: 'prj-005', name: 'Automatización Reportes Regulatorios', description: 'Automatización de la generación de reportes regulatorios', startDate: '2024-04-15', endDate: '2024-10-30', responsibleUserId: 'usr-003', priority: 'medium', status: 'completed', progress: 100, reminderDays: JSON.stringify([7, 3]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
  { id: 'prj-006', name: 'Certificación PCI-DSS v4.0', description: 'Actualización de controles y recertificación bajo el nuevo estándar PCI-DSS versión 4.0', startDate: '2024-04-01', endDate: '2024-12-31', responsibleUserId: 'usr-004', priority: 'critical', status: 'in_progress', progress: 75, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
  { id: 'prj-007', name: 'Sistema Antifraude Tiempo Real', description: 'Implementación de sistema de detección de fraude en tiempo real', startDate: '2024-06-15', endDate: '2025-01-15', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 70, reminderDays: JSON.stringify([30, 15, 7]), createdBy: 'usr-004', createdAt: new Date().toISOString() },
  { id: 'prj-008', name: 'Modernización Banca Móvil', description: 'Rediseño completo de la aplicación de banca móvil', startDate: '2024-10-01', endDate: '2025-06-30', responsibleUserId: 'usr-005', priority: 'critical', status: 'in_progress', progress: 20, reminderDays: JSON.stringify([30, 15, 7, 1]), createdBy: 'usr-001', createdAt: new Date().toISOString() },
];

export const projectPhases = [
  { id: 'phase-001', projectId: 'prj-001', name: 'Análisis de Brechas', description: 'Evaluación inicial del estado actual vs requisitos ISO 27001', orderNum: 1, startDate: '2024-01-15', endDate: '2024-03-31', status: 'completed', weight: 20, progress: 100 },
  { id: 'phase-002', projectId: 'prj-001', name: 'Diseño del SGSI', description: 'Diseño del Sistema de Gestión de Seguridad de la Información', orderNum: 2, startDate: '2024-04-01', endDate: '2024-07-31', status: 'completed', weight: 25, progress: 100 },
  { id: 'phase-003', projectId: 'prj-001', name: 'Implementación de Controles', description: 'Implementación de controles del Anexo A', orderNum: 3, startDate: '2024-08-01', endDate: '2025-02-28', status: 'in_progress', weight: 35, progress: 40 },
  { id: 'phase-004', projectId: 'prj-001', name: 'Auditoría Interna', description: 'Auditoría interna pre-certificación', orderNum: 4, startDate: '2025-03-01', endDate: '2025-04-30', status: 'pending', weight: 10, progress: 0 },
  { id: 'phase-005', projectId: 'prj-001', name: 'Certificación', description: 'Auditoría de certificación por organismo acreditado', orderNum: 5, startDate: '2025-05-01', endDate: '2025-06-30', status: 'pending', weight: 10, progress: 0 },
  { id: 'phase-006', projectId: 'prj-002', name: 'Evaluación y Planeación', description: 'Assessment de infraestructura actual y plan de migración', orderNum: 1, startDate: '2024-03-01', endDate: '2024-05-31', status: 'completed', weight: 15, progress: 100 },
  { id: 'phase-007', projectId: 'prj-002', name: 'Arquitectura Cloud', description: 'Diseño de arquitectura cloud segura y escalable', orderNum: 2, startDate: '2024-06-01', endDate: '2024-08-31', status: 'completed', weight: 20, progress: 100 },
  { id: 'phase-008', projectId: 'prj-002', name: 'Migración Ambiente Dev/QA', description: 'Migración de ambientes de desarrollo y pruebas', orderNum: 3, startDate: '2024-09-01', endDate: '2024-12-31', status: 'in_progress', weight: 25, progress: 45 },
  { id: 'phase-009', projectId: 'prj-002', name: 'Migración Producción', description: 'Migración del ambiente productivo', orderNum: 4, startDate: '2025-01-01', endDate: '2025-02-28', status: 'pending', weight: 30, progress: 0 },
  { id: 'phase-010', projectId: 'prj-003', name: 'Análisis Regulatorio', description: 'Revisión de nueva regulación y análisis de impacto', orderNum: 1, startDate: '2024-06-01', endDate: '2024-07-15', status: 'completed', weight: 20, progress: 100 },
  { id: 'phase-011', projectId: 'prj-003', name: 'Actualización de Políticas', description: 'Redacción de nuevas políticas y procedimientos', orderNum: 2, startDate: '2024-07-16', endDate: '2024-09-30', status: 'completed', weight: 30, progress: 100 },
  { id: 'phase-012', projectId: 'prj-003', name: 'Capacitación', description: 'Capacitación al personal en nuevas políticas', orderNum: 3, startDate: '2024-10-01', endDate: '2024-11-15', status: 'in_progress', weight: 25, progress: 60 },
  { id: 'phase-013', projectId: 'prj-003', name: 'Implementación Sistemas', description: 'Actualización de sistemas de monitoreo AML', orderNum: 4, startDate: '2024-11-16', endDate: '2024-12-31', status: 'pending', weight: 25, progress: 0 },
];

export const tasks = [
  { id: 'task-001', projectId: 'prj-001', phaseId: 'phase-003', title: 'Implementar control A.5.1 - Políticas de seguridad', description: 'Desarrollar y documentar las políticas de seguridad de la información', type: 'implementation', priority: 'high', status: 'in_progress', progress: 60, assignedTo: 'usr-004', startDate: '2024-08-01', dueDate: '2024-09-15', estimatedHours: 40, actualHours: 28, createdBy: 'usr-004', createdAt: new Date().toISOString() },
  { id: 'task-002', projectId: 'prj-001', phaseId: 'phase-003', title: 'Implementar control A.8.2 - Clasificación de información', description: 'Establecer esquema de clasificación de información', type: 'implementation', priority: 'medium', status: 'pending', progress: 0, assignedTo: 'usr-005', startDate: '2024-09-16', dueDate: '2024-10-31', estimatedHours: 32, createdBy: 'usr-004', createdAt: new Date().toISOString() },
  { id: 'task-003', projectId: 'prj-001', phaseId: 'phase-003', title: 'Configurar controles de acceso lógico', description: 'Implementar controles de acceso basados en roles', type: 'implementation', priority: 'critical', status: 'in_progress', progress: 75, assignedTo: 'usr-004', startDate: '2024-08-15', dueDate: '2024-09-30', estimatedHours: 48, actualHours: 36, createdBy: 'usr-004', createdAt: new Date().toISOString() },
  { id: 'task-004', projectId: 'prj-002', phaseId: 'phase-008', title: 'Migrar base de datos de desarrollo', description: 'Migrar BD de desarrollo a instancia cloud', type: 'migration', priority: 'high', status: 'completed', progress: 100, assignedTo: 'usr-010', startDate: '2024-09-01', dueDate: '2024-09-30', estimatedHours: 24, actualHours: 20, createdBy: 'usr-005', createdAt: new Date().toISOString() },
  { id: 'task-005', projectId: 'prj-002', phaseId: 'phase-008', title: 'Configurar pipeline CI/CD', description: 'Establecer pipeline de integración continua en cloud', type: 'configuration', priority: 'high', status: 'in_progress', progress: 50, assignedTo: 'usr-010', startDate: '2024-10-01', dueDate: '2024-11-15', estimatedHours: 40, actualHours: 18, createdBy: 'usr-005', createdAt: new Date().toISOString() },
  { id: 'task-006', projectId: 'prj-003', phaseId: 'phase-012', title: 'Desarrollar material de capacitación', description: 'Crear presentaciones y guías para capacitación AML', type: 'documentation', priority: 'medium', status: 'completed', progress: 100, assignedTo: 'usr-009', startDate: '2024-10-01', dueDate: '2024-10-15', estimatedHours: 16, actualHours: 14, createdBy: 'usr-009', createdAt: new Date().toISOString() },
  { id: 'task-007', projectId: 'prj-003', phaseId: 'phase-012', title: 'Impartir capacitación a personal de cumplimiento', description: 'Sesiones de capacitación para el área de cumplimiento', type: 'training', priority: 'high', status: 'in_progress', progress: 70, assignedTo: 'usr-009', startDate: '2024-10-16', dueDate: '2024-10-31', estimatedHours: 24, actualHours: 16, createdBy: 'usr-009', createdAt: new Date().toISOString() },
  { id: 'task-008', projectId: 'prj-006', phaseId: null, title: 'Auditoría interna de controles PCI', description: 'Realizar auditoría interna de cumplimiento PCI-DSS', type: 'audit', priority: 'critical', status: 'in_progress', progress: 40, assignedTo: 'usr-007', startDate: '2024-11-01', dueDate: '2024-11-30', estimatedHours: 60, actualHours: 24, createdBy: 'usr-004', createdAt: new Date().toISOString() },
  { id: 'task-009', projectId: 'prj-007', phaseId: null, title: 'Integrar motor de reglas antifraude', description: 'Configurar e integrar motor de detección en tiempo real', type: 'integration', priority: 'critical', status: 'in_progress', progress: 65, assignedTo: 'usr-010', startDate: '2024-10-15', dueDate: '2024-12-15', estimatedHours: 80, actualHours: 52, createdBy: 'usr-005', createdAt: new Date().toISOString() },
  { id: 'task-010', projectId: 'prj-008', phaseId: null, title: 'Diseñar nuevo flujo de login', description: 'Diseñar experiencia de usuario para nuevo proceso de autenticación', type: 'design', priority: 'high', status: 'completed', progress: 100, assignedTo: 'usr-006', startDate: '2024-10-01', dueDate: '2024-10-20', estimatedHours: 20, actualHours: 18, createdBy: 'usr-005', createdAt: new Date().toISOString() },
];
