const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🏦 Iniciando seed de base de datos - Sistema GRC Bancario...\n');

  // ============================================================
  // Crear Permisos
  // ============================================================
  const permisos = await Promise.all([
    // Gestión de Usuarios
    prisma.permiso.create({ data: { codigo: 'USR_VIEW', nombre: 'Ver Usuarios', descripcion: 'Permite visualizar la lista de usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' } }),
    prisma.permiso.create({ data: { codigo: 'USR_CREATE', nombre: 'Crear Usuarios', descripcion: 'Permite crear nuevos usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' } }),
    prisma.permiso.create({ data: { codigo: 'USR_EDIT', nombre: 'Editar Usuarios', descripcion: 'Permite modificar usuarios existentes', modulo: 'usuarios', categoria: 'gestion_usuarios' } }),
    prisma.permiso.create({ data: { codigo: 'USR_DELETE', nombre: 'Eliminar Usuarios', descripcion: 'Permite eliminar usuarios', modulo: 'usuarios', categoria: 'gestion_usuarios' } }),
    // Gestión de Roles
    prisma.permiso.create({ data: { codigo: 'ROL_VIEW', nombre: 'Ver Roles', descripcion: 'Permite visualizar roles y permisos', modulo: 'roles', categoria: 'gestion_roles' } }),
    prisma.permiso.create({ data: { codigo: 'ROL_CREATE', nombre: 'Crear Roles', descripcion: 'Permite crear nuevos roles', modulo: 'roles', categoria: 'gestion_roles' } }),
    prisma.permiso.create({ data: { codigo: 'ROL_EDIT', nombre: 'Editar Roles', descripcion: 'Permite modificar roles existentes', modulo: 'roles', categoria: 'gestion_roles' } }),
    prisma.permiso.create({ data: { codigo: 'ROL_DELETE', nombre: 'Eliminar Roles', descripcion: 'Permite eliminar roles', modulo: 'roles', categoria: 'gestion_roles' } }),
    // Organizaciones y Activos
    prisma.permiso.create({ data: { codigo: 'ORG_VIEW', nombre: 'Ver Organizaciones', descripcion: 'Permite visualizar organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' } }),
    prisma.permiso.create({ data: { codigo: 'ORG_CREATE', nombre: 'Crear Organizaciones', descripcion: 'Permite crear nuevas organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' } }),
    prisma.permiso.create({ data: { codigo: 'ORG_EDIT', nombre: 'Editar Organizaciones', descripcion: 'Permite modificar organizaciones', modulo: 'organizaciones', categoria: 'gestion_activos' } }),
    prisma.permiso.create({ data: { codigo: 'ACT_VIEW', nombre: 'Ver Activos', descripcion: 'Permite ver activos de información', modulo: 'activos', categoria: 'gestion_activos' } }),
    prisma.permiso.create({ data: { codigo: 'ACT_MANAGE', nombre: 'Gestionar Activos', descripcion: 'Permite gestionar activos de información', modulo: 'activos', categoria: 'gestion_activos' } }),
    // Gestión de Riesgos
    prisma.permiso.create({ data: { codigo: 'RSK_VIEW', nombre: 'Ver Riesgos', descripcion: 'Permite visualizar el inventario de riesgos', modulo: 'riesgos', categoria: 'gestion_riesgos' } }),
    prisma.permiso.create({ data: { codigo: 'RSK_EDIT', nombre: 'Gestionar Riesgos', descripcion: 'Permite crear y modificar riesgos', modulo: 'riesgos', categoria: 'gestion_riesgos' } }),
    // Incidentes
    prisma.permiso.create({ data: { codigo: 'INC_VIEW', nombre: 'Ver Incidentes', descripcion: 'Permite ver incidentes de seguridad', modulo: 'incidentes', categoria: 'gestion_incidentes' } }),
    prisma.permiso.create({ data: { codigo: 'INC_MANAGE', nombre: 'Gestionar Incidentes', descripcion: 'Permite gestionar incidentes', modulo: 'incidentes', categoria: 'gestion_incidentes' } }),
    // Cumplimiento
    prisma.permiso.create({ data: { codigo: 'CMP_VIEW', nombre: 'Ver Cumplimiento', descripcion: 'Acceso a módulo de cumplimiento', modulo: 'cumplimiento', categoria: 'gestion_cumplimiento' } }),
    prisma.permiso.create({ data: { codigo: 'CMP_MANAGE', nombre: 'Gestionar Cumplimiento', descripcion: 'Gestión completa de cuestionarios y evaluaciones', modulo: 'cumplimiento', categoria: 'gestion_cumplimiento' } }),
    // Procesos
    prisma.permiso.create({ data: { codigo: 'PRC_VIEW', nombre: 'Ver Procesos', descripcion: 'Permite ver procesos', modulo: 'procesos', categoria: 'gestion_procesos' } }),
    prisma.permiso.create({ data: { codigo: 'PRC_MANAGE', nombre: 'Gestionar Procesos', descripcion: 'Permite gestionar procesos', modulo: 'procesos', categoria: 'gestion_procesos' } }),
    // Auditoría y Reportes
    prisma.permiso.create({ data: { codigo: 'AUD_VIEW', nombre: 'Ver Auditorías', descripcion: 'Acceso a informes de auditoría', modulo: 'auditoria', categoria: 'auditoria' } }),
    prisma.permiso.create({ data: { codigo: 'AUD_EXPORT', nombre: 'Exportar Auditorías', descripcion: 'Permite exportar logs de auditoría', modulo: 'auditoria', categoria: 'auditoria' } }),
    prisma.permiso.create({ data: { codigo: 'RPT_VIEW', nombre: 'Ver Reportes', descripcion: 'Acceso a reportes y dashboards', modulo: 'reportes', categoria: 'reportes' } }),
    prisma.permiso.create({ data: { codigo: 'RPT_EXPORT', nombre: 'Exportar Reportes', descripcion: 'Permite exportar reportes', modulo: 'reportes', categoria: 'reportes' } })
  ]);
  console.log(`✓ Creados ${permisos.length} permisos`);

  // ============================================================
  // Crear Módulos
  // ============================================================
  const modulos = await Promise.all([
    prisma.modulo.create({ data: { nombre: 'Dashboard', descripcion: 'Panel principal de indicadores', icono: 'pi-chart-bar', orden: 0, permisoCreacion: false, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false } }),
    prisma.modulo.create({ data: { nombre: 'Usuarios', descripcion: 'Gestión de usuarios del sistema', icono: 'pi-users', orden: 1, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true } }),
    prisma.modulo.create({ data: { nombre: 'Roles', descripcion: 'Gestión de roles y permisos', icono: 'pi-shield', orden: 2, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true } }),
    prisma.modulo.create({ data: { nombre: 'Activos', descripcion: 'Gestión de activos de información', icono: 'pi-box', orden: 3, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true } }),
    prisma.modulo.create({ data: { nombre: 'Riesgos', descripcion: 'Gestión de riesgos', icono: 'pi-exclamation-triangle', orden: 4, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true } }),
    prisma.modulo.create({ data: { nombre: 'Incidentes', descripcion: 'Gestión de incidentes de seguridad', icono: 'pi-bolt', orden: 5, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false } }),
    prisma.modulo.create({ data: { nombre: 'Cumplimiento', descripcion: 'Gestión de cumplimiento normativo', icono: 'pi-check-circle', orden: 6, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: false } }),
    prisma.modulo.create({ data: { nombre: 'Procesos', descripcion: 'Gestión de procesos de negocio', icono: 'pi-sitemap', orden: 7, permisoCreacion: true, permisoEdicion: true, permisoVisualizacion: true, permisoEliminacion: true } }),
  ]);
  console.log(`✓ Creados ${modulos.length} módulos`);

  // ============================================================
  // Crear Roles Fijos del Sistema (Según matriz de permisos)
  // ============================================================
  // Referencia de permisos disponibles:
  // USR_VIEW, USR_CREATE, USR_EDIT, USR_DELETE - Usuarios
  // ROL_VIEW, ROL_CREATE, ROL_EDIT, ROL_DELETE - Roles
  // ORG_VIEW, ORG_CREATE, ORG_EDIT - Organigrama
  // ACT_VIEW, ACT_MANAGE - Activos
  // PRC_VIEW, PRC_MANAGE - Procesos
  // RSK_VIEW, RSK_EDIT - Riesgos
  // INC_VIEW, INC_MANAGE - Incidentes
  // CMP_VIEW, CMP_MANAGE - Cumplimiento
  // AUD_VIEW, AUD_EXPORT - Auditoría
  // RPT_VIEW, RPT_EXPORT - Reportes/Dashboard

  const adminPermisos = permisos.map(p => ({ permisoId: p.id }));

  // ROL-003: Gestor Áreas - Gestión de áreas, activos y procesos
  // Matriz: Dashboard ✅, Results ML ✅, Activos C/E/V ✅, Procesos C/E/V ✅, Riesgos C/E/V ✅,
  //         Incidentes C/E/V ✅, Defectos C/E/V ✅, Controles C/E/V ✅, Cumplimiento V ✅ (responder, aprobar),
  //         Config: Ver usuarios ✅, Ver roles ✅, Ver/Edit org ✅
  const gestorAreasPermisos = ['USR_VIEW', 'ROL_VIEW', 'ORG_VIEW', 'ORG_CREATE', 'ORG_EDIT',
    'ACT_VIEW', 'ACT_MANAGE', 'PRC_VIEW', 'PRC_MANAGE', 'RSK_VIEW', 'RSK_EDIT',
    'INC_VIEW', 'INC_MANAGE', 'CMP_VIEW', 'CMP_MANAGE', 'AUD_VIEW', 'RPT_VIEW', 'RPT_EXPORT'];

  // ROL-004: Director - Visión estratégica, aprobaciones y reportes
  // Matriz: Dashboard V ✅, Results ML V/Aprobar ✅, Activos V ✅, Procesos V ✅, Riesgos V ✅,
  //         Incidentes V/Cerrar ✅, Defectos V/Cerrar ✅, Controles V/Evaluar ✅,
  //         Cumplimiento V/Aprobar ✅, Config: Ver usuarios ✅, Ver roles ✅, Ver org ✅
  const directorPermisos = ['USR_VIEW', 'ROL_VIEW', 'ORG_VIEW',
    'ACT_VIEW', 'PRC_VIEW', 'RSK_VIEW', 'INC_VIEW',
    'CMP_VIEW', 'CMP_MANAGE', 'AUD_VIEW', 'AUD_EXPORT', 'RPT_VIEW', 'RPT_EXPORT'];

  // ROL-005: Coordinador - Coordinación de equipos y gestión operativa
  // Matriz: Dashboard C/E/V ✅, Results ML V/Aprobar ✅, Activos C/E/V ✅, Procesos C/E/V ✅,
  //         Riesgos C/E/V ✅, Incidentes C/E/V ✅, Defectos C/E/V ✅, Controles C/E/V ✅,
  //         Cumplimiento C/E/V ✅, Config: Ver org ✅
  const coordinadorPermisos = ['ORG_VIEW',
    'ACT_VIEW', 'ACT_MANAGE', 'PRC_VIEW', 'PRC_MANAGE', 'RSK_VIEW', 'RSK_EDIT',
    'INC_VIEW', 'INC_MANAGE', 'CMP_VIEW', 'CMP_MANAGE', 'RPT_VIEW', 'RPT_EXPORT'];

  // ROL-006: Gerente - Gestión de área con procesos y riesgos
  // Matriz: Dashboard V/E ✅, Results ML V ✅, Activos V ✅, Procesos C/E/V ✅, Riesgos C/E/V ✅,
  //         Incidentes C/E/V ✅, Defectos C/E/V ✅, Controles C/E/V ✅,
  //         Cumplimiento V/Responder ✅, Config: Ver org ✅
  const gerentePermisos = ['ORG_VIEW',
    'ACT_VIEW', 'PRC_VIEW', 'PRC_MANAGE', 'RSK_VIEW', 'RSK_EDIT',
    'INC_VIEW', 'INC_MANAGE', 'CMP_VIEW', 'RPT_VIEW', 'RPT_EXPORT'];

  // ROL-007: Analista - Análisis de información y ejecución de tareas
  // Matriz: Dashboard V ✅, Results ML V ✅, Activos V ✅, Procesos V ✅,
  //         Riesgos V/Evaluar ✅ (propios), Incidentes C/V ✅, Defectos C/V ✅,
  //         Controles V/Evaluar ✅, Cumplimiento V/Responder ✅, Config: Ver org ✅
  const analistaPermisos = ['ORG_VIEW',
    'ACT_VIEW', 'PRC_VIEW', 'RSK_VIEW', 'RSK_EDIT',
    'INC_VIEW', 'INC_MANAGE', 'CMP_VIEW', 'RPT_VIEW'];

  // ROL-008: Invitado - Solo puede responder cuestionarios asignados
  // Matriz: Cumplimiento - Ver cuestionarios asignados ✅, Responder revisión ✅
  const invitadoPermisos = ['CMP_VIEW'];

  const roles = await Promise.all([
    // ROL-001: Admin Backoffice - Acceso total al sistema
    prisma.rol.create({
      data: {
        nombre: 'Admin Backoffice',
        descripcion: 'Administrador técnico con acceso total al sistema y configuraciones.',
        nivelAcceso: 'super_admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#7c3aed', icono: 'pi-server', esRolSistema: true,
        permisos: { create: adminPermisos }
      }
    }),
    // ROL-002: Administrador - Gestión completa de la organización
    prisma.rol.create({
      data: {
        nombre: 'Administrador',
        descripcion: 'Administrador de la organización con gestión de usuarios, roles y configuración.',
        nivelAcceso: 'super_admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#ef4444', icono: 'pi-shield', esRolSistema: true,
        permisos: { create: adminPermisos }
      }
    }),
    // ROL-003: Gestor Áreas
    prisma.rol.create({
      data: {
        nombre: 'Gestor Áreas',
        descripcion: 'Responsable de la gestión de áreas, activos y procesos de su departamento.',
        nivelAcceso: 'admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#3b82f6', icono: 'pi-th-large', esRolSistema: true,
        permisos: { create: permisos.filter(p => gestorAreasPermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    }),
    // ROL-004: Director
    prisma.rol.create({
      data: {
        nombre: 'Director',
        descripcion: 'Nivel directivo con visión estratégica, aprobaciones y acceso a reportes ejecutivos.',
        nivelAcceso: 'admin', region: 'GLOBAL', tipoArbol: 'ambos', color: '#dc2626', icono: 'pi-briefcase', esRolSistema: true,
        permisos: { create: permisos.filter(p => directorPermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    }),
    // ROL-005: Coordinador
    prisma.rol.create({
      data: {
        nombre: 'Coordinador',
        descripcion: 'Coordinación de equipos, seguimiento de tareas y gestión operativa.',
        nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'ambos', color: '#f59e0b', icono: 'pi-users', esRolSistema: true,
        permisos: { create: permisos.filter(p => coordinadorPermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    }),
    // ROL-006: Gerente
    prisma.rol.create({
      data: {
        nombre: 'Gerente',
        descripcion: 'Gestión de área específica con responsabilidad sobre procesos y riesgos.',
        nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'ambos', color: '#22c55e', icono: 'pi-id-card', esRolSistema: true,
        permisos: { create: permisos.filter(p => gerentePermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    }),
    // ROL-007: Analista
    prisma.rol.create({
      data: {
        nombre: 'Analista',
        descripcion: 'Análisis de información, ejecución de tareas y registro de datos.',
        nivelAcceso: 'escritura', region: 'MX', tipoArbol: 'activos', color: '#0891b2', icono: 'pi-search', esRolSistema: true,
        permisos: { create: permisos.filter(p => analistaPermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    }),
    // ROL-008: Invitado
    prisma.rol.create({
      data: {
        nombre: 'Invitado',
        descripcion: 'Usuario externo que solo puede responder cuestionarios asignados.',
        nivelAcceso: 'lectura', region: 'MX', tipoArbol: 'activos', color: '#64748b', icono: 'pi-user', esRolSistema: true,
        permisos: { create: permisos.filter(p => invitadoPermisos.includes(p.codigo)).map(p => ({ permisoId: p.id })) }
      }
    })
  ]);
  console.log(`✓ Creados ${roles.length} roles fijos del sistema`);

  // ============================================================
  // Crear Usuarios Bancarios
  // ============================================================
  const hashedPassword = await bcrypt.hash('Banco2024!', 10);

  const usuarios = await Promise.all([
    prisma.usuario.create({ data: { nombre: 'Ricardo', apellido: 'Salinas Pliego', email: 'rsalinas@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0001', estado: 'activo', departamento: 'Dirección General', cargo: 'Director General (CEO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'María Elena', apellido: 'Gutiérrez Vega', email: 'mgutierrez@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0002', estado: 'activo', departamento: 'Riesgos', cargo: 'Directora de Riesgos (CRO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Carlos', apellido: 'Hernández Mora', email: 'chernandez@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0003', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Oficial de Cumplimiento (CCO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Roberto', apellido: 'Torres Ramírez', email: 'rtorres@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0004', estado: 'activo', departamento: 'Seguridad de Información', cargo: 'Oficial de Seguridad (CISO)', region: 'GLOBAL', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Ana Patricia', apellido: 'López García', email: 'alopez@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0005', estado: 'activo', departamento: 'Riesgos', cargo: 'Analista Senior de Riesgos', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Fernando', apellido: 'Castillo Núñez', email: 'fcastillo@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0006', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Analista de Cumplimiento', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Laura', apellido: 'Mendoza Díaz', email: 'lmendoza@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0007', estado: 'activo', departamento: 'Auditoría Interna', cargo: 'Auditora Interna Senior', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Jorge', apellido: 'Vargas Luna', email: 'jvargas@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0008', estado: 'activo', departamento: 'Sucursal Centro', cargo: 'Gerente de Sucursal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Patricia', apellido: 'Reyes Solís', email: 'preyes@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0009', estado: 'activo', departamento: 'PLD/AML', cargo: 'Oficial PLD/AML', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Miguel', apellido: 'Ángel Ruiz', email: 'maruiz@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0010', estado: 'activo', departamento: 'Riesgos', cargo: 'Analista de Riesgos Jr.', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Guadalupe', apellido: 'Flores Ortiz', email: 'gflores@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0011', estado: 'activo', departamento: 'Operaciones', cargo: 'Cajera Principal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Alejandro', apellido: 'Moreno Vega', email: 'amoreno@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0012', estado: 'pendiente', departamento: 'TI', cargo: 'Administrador de Sistemas', region: 'MX', cambioPasswordRequerido: true } }),
    prisma.usuario.create({ data: { nombre: 'Sofía', apellido: 'Delgado Cruz', email: 'sdelgado@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0013', estado: 'activo', departamento: 'Cumplimiento', cargo: 'Coordinadora de Cumplimiento', region: 'MX', autenticacionDosFactor: true, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
    prisma.usuario.create({ data: { nombre: 'Daniel', apellido: 'Jiménez Pérez', email: 'djimenez@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0014', estado: 'inactivo', departamento: 'Riesgos', cargo: 'Analista de Riesgos', region: 'MX' } }),
    prisma.usuario.create({ data: { nombre: 'Verónica', apellido: 'Sánchez Martínez', email: 'vsanchez@bancoglobal.mx', password: hashedPassword, telefono: '+52 55 1234 0015', estado: 'activo', departamento: 'Sucursal Norte', cargo: 'Gerente de Sucursal', region: 'MX', autenticacionDosFactor: false, cambioPasswordRequerido: false, ultimoAcceso: new Date() } }),
  ]);
  console.log(`✓ Creados ${usuarios.length} usuarios bancarios`);

  // Asignar Roles a Usuarios
  // [0] Admin Backoffice, [1] Administrador, [2] Gestor Áreas
  // [3] Director, [4] Coordinador, [5] Gerente, [6] Analista, [7] Invitado
  const asignaciones = [
    { usuario: usuarios[0], roles: [roles[1]] },              // CEO - Administrador
    { usuario: usuarios[1], roles: [roles[3]] },              // CRO - Director
    { usuario: usuarios[2], roles: [roles[3]] },              // CCO - Director
    { usuario: usuarios[3], roles: [roles[0], roles[2]] },    // CISO - Admin Backoffice + Gestor Áreas
    { usuario: usuarios[4], roles: [roles[6]] },              // Analista Senior - Analista
    { usuario: usuarios[5], roles: [roles[6]] },              // Analista Cumplimiento - Analista
    { usuario: usuarios[6], roles: [roles[4]] },              // Auditora - Coordinador
    { usuario: usuarios[7], roles: [roles[5]] },              // Gerente Sucursal - Gerente
    { usuario: usuarios[8], roles: [roles[4]] },              // Oficial PLD - Coordinador
    { usuario: usuarios[9], roles: [roles[6]] },              // Analista Riesgos Jr - Analista
    { usuario: usuarios[10], roles: [roles[7]] },             // Cajera - Invitado
    { usuario: usuarios[12], roles: [roles[4]] },             // Coordinadora Cumplimiento - Coordinador
    { usuario: usuarios[14], roles: [roles[5]] },             // Gerente Sucursal Norte - Gerente
  ];
  for (const asig of asignaciones) {
    for (const rol of asig.roles) {
      await prisma.usuarioRol.create({ data: { usuarioId: asig.usuario.id, rolId: rol.id } });
    }
  }
  console.log('✓ Asignaciones de roles completadas');

  // ============================================================
  // Crear Catálogos Bancarios
  // ============================================================
  const catalogos = [
    // Tipos de Activo
    { tipo: 'tipoActivo', codigo: 'hardware', nombre: 'Hardware', orden: 1, icono: 'computer', color: '#3b82f6' },
    { tipo: 'tipoActivo', codigo: 'software', nombre: 'Software', orden: 2, icono: 'code', color: '#8b5cf6' },
    { tipo: 'tipoActivo', codigo: 'datos', nombre: 'Datos', orden: 3, icono: 'database', color: '#06b6d4' },
    { tipo: 'tipoActivo', codigo: 'red', nombre: 'Infraestructura de Red', orden: 4, icono: 'lan', color: '#f59e0b' },
    { tipo: 'tipoActivo', codigo: 'personas', nombre: 'Personas', orden: 5, icono: 'people', color: '#22c55e' },
    { tipo: 'tipoActivo', codigo: 'instalaciones', nombre: 'Instalaciones', orden: 6, icono: 'business', color: '#64748b' },
    { tipo: 'tipoActivo', codigo: 'servicios', nombre: 'Servicios Financieros', orden: 7, icono: 'account_balance', color: '#dc2626' },
    // Criticidad
    { tipo: 'criticidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d' },
    { tipo: 'criticidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626' },
    { tipo: 'criticidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b' },
    { tipo: 'criticidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e' },
    // Severidad
    { tipo: 'severidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d' },
    { tipo: 'severidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626' },
    { tipo: 'severidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b' },
    { tipo: 'severidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e' },
    // Estados de Riesgo
    { tipo: 'estadoRiesgo', codigo: 'identificado', nombre: 'Identificado', orden: 1, color: '#6366f1' },
    { tipo: 'estadoRiesgo', codigo: 'evaluado', nombre: 'Evaluado', orden: 2, color: '#f59e0b' },
    { tipo: 'estadoRiesgo', codigo: 'en_tratamiento', nombre: 'En Tratamiento', orden: 3, color: '#3b82f6' },
    { tipo: 'estadoRiesgo', codigo: 'mitigado', nombre: 'Mitigado', orden: 4, color: '#22c55e' },
    { tipo: 'estadoRiesgo', codigo: 'aceptado', nombre: 'Aceptado', orden: 5, color: '#64748b' },
    { tipo: 'estadoRiesgo', codigo: 'transferido', nombre: 'Transferido', orden: 6, color: '#8b5cf6' },
    // Estados de Incidente
    { tipo: 'estadoIncidente', codigo: 'reportado', nombre: 'Reportado', orden: 1, color: '#ef4444' },
    { tipo: 'estadoIncidente', codigo: 'en_investigacion', nombre: 'En Investigación', orden: 2, color: '#f59e0b' },
    { tipo: 'estadoIncidente', codigo: 'en_contencion', nombre: 'En Contención', orden: 3, color: '#3b82f6' },
    { tipo: 'estadoIncidente', codigo: 'resuelto', nombre: 'Resuelto', orden: 4, color: '#22c55e' },
    { tipo: 'estadoIncidente', codigo: 'cerrado', nombre: 'Cerrado', orden: 5, color: '#64748b' },
    // Tipos de Incidente
    { tipo: 'tipoIncidente', codigo: 'fraude', nombre: 'Fraude', orden: 1, color: '#dc2626' },
    { tipo: 'tipoIncidente', codigo: 'ciberataque', nombre: 'Ciberataque', orden: 2, color: '#7c3aed' },
    { tipo: 'tipoIncidente', codigo: 'fuga_datos', nombre: 'Fuga de Datos', orden: 3, color: '#be185d' },
    { tipo: 'tipoIncidente', codigo: 'indisponibilidad', nombre: 'Indisponibilidad de Servicio', orden: 4, color: '#f59e0b' },
    { tipo: 'tipoIncidente', codigo: 'error_operativo', nombre: 'Error Operativo', orden: 5, color: '#0891b2' },
    // Departamentos Bancarios
    { tipo: 'departamento', codigo: 'direccion', nombre: 'Dirección General', orden: 1 },
    { tipo: 'departamento', codigo: 'riesgos', nombre: 'Gestión de Riesgos', orden: 2 },
    { tipo: 'departamento', codigo: 'cumplimiento', nombre: 'Cumplimiento Normativo', orden: 3 },
    { tipo: 'departamento', codigo: 'seguridad', nombre: 'Seguridad de Información', orden: 4 },
    { tipo: 'departamento', codigo: 'auditoria', nombre: 'Auditoría Interna', orden: 5 },
    { tipo: 'departamento', codigo: 'operaciones', nombre: 'Operaciones Bancarias', orden: 6 },
    { tipo: 'departamento', codigo: 'ti', nombre: 'Tecnología de Información', orden: 7 },
    { tipo: 'departamento', codigo: 'credito', nombre: 'Crédito y Cobranza', orden: 8 },
    { tipo: 'departamento', codigo: 'tesoreria', nombre: 'Tesorería', orden: 9 },
    { tipo: 'departamento', codigo: 'pld', nombre: 'PLD/AML', orden: 10 },
  ];
  for (const cat of catalogos) {
    await prisma.catalogo.upsert({
      where: { tipo_codigo: { tipo: cat.tipo, codigo: cat.codigo } },
      update: cat,
      create: { ...cat, metadata: '{}' }
    });
  }
  console.log(`✓ Creados ${catalogos.length} catálogos bancarios`);

  // ============================================================
  // Crear Plantillas de Activos Bancarios
  // ============================================================
  const plantillaCoreBanking = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Sistema Core Bancario',
      tipoActivo: 'software',
      descripcion: 'Plantilla para sistemas core banking',
      icono: 'account_balance',
      color: '#1e40af',
      propiedades: JSON.stringify([
        { id: 'cb-1', nombre: 'Versión', campo: 'version', tipo: 'texto', requerido: true },
        { id: 'cb-2', nombre: 'Proveedor', campo: 'proveedor', tipo: 'texto', requerido: true },
        { id: 'cb-3', nombre: 'Módulos Activos', campo: 'modulos', tipo: 'multiseleccion', requerido: true },
        { id: 'cb-4', nombre: 'Transacciones Diarias', campo: 'txnDiarias', tipo: 'numero', requerido: false },
        { id: 'cb-5', nombre: 'Fecha Última Actualización', campo: 'fechaActualizacion', tipo: 'fecha', requerido: true },
      ])
    }
  });

  const plantillaATM = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Cajero Automático (ATM)',
      tipoActivo: 'hardware',
      descripcion: 'Plantilla para cajeros automáticos',
      icono: 'local_atm',
      color: '#059669',
      propiedades: JSON.stringify([
        { id: 'atm-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true },
        { id: 'atm-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true },
        { id: 'atm-3', nombre: 'Número de Serie', campo: 'numeroSerie', tipo: 'texto', requerido: true },
        { id: 'atm-4', nombre: 'Ubicación', campo: 'ubicacion', tipo: 'texto', requerido: true },
        { id: 'atm-5', nombre: 'Capacidad Billetes', campo: 'capacidadBilletes', tipo: 'numero', requerido: false },
      ])
    }
  });

  const plantillaBaseDatos = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Base de Datos Financiera',
      tipoActivo: 'datos',
      descripcion: 'Plantilla para bases de datos con información financiera',
      icono: 'storage',
      color: '#7c3aed',
      propiedades: JSON.stringify([
        { id: 'db-1', nombre: 'Motor de BD', campo: 'motorBD', tipo: 'seleccion', requerido: true },
        { id: 'db-2', nombre: 'Clasificación de Datos', campo: 'clasificacion', tipo: 'seleccion', requerido: true },
        { id: 'db-3', nombre: 'Registros Aproximados', campo: 'registros', tipo: 'numero', requerido: false },
        { id: 'db-4', nombre: 'Cifrado', campo: 'cifrado', tipo: 'booleano', requerido: true },
        { id: 'db-5', nombre: 'Respaldos Automáticos', campo: 'respaldos', tipo: 'booleano', requerido: true },
      ])
    }
  });

  const plantillaServidor = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Servidor Bancario',
      tipoActivo: 'hardware',
      descripcion: 'Plantilla para servidores de infraestructura bancaria',
      icono: 'dns',
      color: '#0891b2',
      propiedades: JSON.stringify([
        { id: 'srv-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true },
        { id: 'srv-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true },
        { id: 'srv-3', nombre: 'CPU (Cores)', campo: 'cpuCores', tipo: 'numero', requerido: true },
        { id: 'srv-4', nombre: 'RAM (GB)', campo: 'ramGb', tipo: 'numero', requerido: true },
        { id: 'srv-5', nombre: 'Ambiente', campo: 'ambiente', tipo: 'seleccion', requerido: true },
      ])
    }
  });
  console.log('✓ Plantillas de activos bancarios creadas');

  // ============================================================
  // Crear Activos Bancarios
  // ============================================================
  const activos = await Promise.all([
    // Sistemas Core
    prisma.activo.create({
      data: {
        nombre: 'Core Banking System (CBS)',
        descripcion: 'Sistema central de operaciones bancarias que procesa todas las transacciones financieras del banco',
        tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaCoreBanking.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'cb-1', campo: 'version', valor: '12.5.3' },
          { propiedadId: 'cb-2', campo: 'proveedor', valor: 'Temenos' },
          { propiedadId: 'cb-3', campo: 'modulos', valor: ['Cuentas', 'Créditos', 'Inversiones', 'Pagos'] },
          { propiedadId: 'cb-4', campo: 'txnDiarias', valor: 2500000 },
        ])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Sistema de Banca en Línea',
        descripcion: 'Plataforma de banca digital para clientes (web y móvil)',
        tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaCoreBanking.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'cb-1', campo: 'version', valor: '8.2.1' },
          { propiedadId: 'cb-2', campo: 'proveedor', valor: 'Desarrollo Interno' },
          { propiedadId: 'cb-4', campo: 'txnDiarias', valor: 850000 },
        ])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Sistema SPEI/SPID',
        descripcion: 'Sistema de pagos electrónicos interbancarios',
        tipo: 'software', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Tesorería',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Sistema Anti-Lavado (AML)',
        descripcion: 'Sistema de detección y prevención de lavado de dinero',
        tipo: 'software', criticidad: 'alta', responsable: 'Patricia Reyes Solís', departamento: 'PLD/AML',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Sistema de Gestión de Créditos',
        descripcion: 'Plataforma para originación y gestión del ciclo de crédito',
        tipo: 'software', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Crédito',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    // Bases de Datos
    prisma.activo.create({
      data: {
        nombre: 'Base de Datos de Clientes',
        descripcion: 'Repositorio central de información de clientes (KYC)',
        tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaBaseDatos.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' },
          { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Confidencial' },
          { propiedadId: 'db-3', campo: 'registros', valor: 5200000 },
          { propiedadId: 'db-4', campo: 'cifrado', valor: true },
          { propiedadId: 'db-5', campo: 'respaldos', valor: true },
        ])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Base de Datos de Transacciones',
        descripcion: 'Almacén de todas las transacciones financieras',
        tipo: 'datos', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaBaseDatos.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'db-1', campo: 'motorBD', valor: 'Oracle 19c' },
          { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Restringido' },
          { propiedadId: 'db-3', campo: 'registros', valor: 890000000 },
          { propiedadId: 'db-4', campo: 'cifrado', valor: true },
          { propiedadId: 'db-5', campo: 'respaldos', valor: true },
        ])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Data Warehouse Analítico',
        descripcion: 'Almacén de datos para análisis y reportes regulatorios',
        tipo: 'datos', criticidad: 'alta', responsable: 'Ana Patricia López García', departamento: 'Riesgos',
        plantillaId: plantillaBaseDatos.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'db-1', campo: 'motorBD', valor: 'Teradata' },
          { propiedadId: 'db-2', campo: 'clasificacion', valor: 'Interno' },
        ])
      }
    }),
    // Hardware
    prisma.activo.create({
      data: {
        nombre: 'Servidor Principal Core Banking',
        descripcion: 'Servidor de producción del sistema core bancario',
        tipo: 'hardware', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaServidor.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'srv-1', campo: 'marca', valor: 'IBM' },
          { propiedadId: 'srv-2', campo: 'modelo', valor: 'Power9' },
          { propiedadId: 'srv-3', campo: 'cpuCores', valor: 64 },
          { propiedadId: 'srv-4', campo: 'ramGb', valor: 512 },
          { propiedadId: 'srv-5', campo: 'ambiente', valor: 'Producción' },
        ])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Servidor de Contingencia',
        descripcion: 'Servidor de respaldo para continuidad de negocio',
        tipo: 'hardware', criticidad: 'alta', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        plantillaId: plantillaServidor.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'srv-1', campo: 'marca', valor: 'IBM' },
          { propiedadId: 'srv-2', campo: 'modelo', valor: 'Power9' },
          { propiedadId: 'srv-5', campo: 'ambiente', valor: 'DR' },
        ])
      }
    }),
    // ATMs
    prisma.activo.create({
      data: {
        nombre: 'Red de Cajeros Automáticos',
        descripcion: 'Flota de 450 cajeros automáticos a nivel nacional',
        tipo: 'hardware', criticidad: 'alta', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones',
        plantillaId: plantillaATM.id,
        propiedadesCustom: JSON.stringify([
          { propiedadId: 'atm-1', campo: 'marca', valor: 'NCR' },
          { propiedadId: 'atm-2', campo: 'modelo', valor: 'SelfServ 80' },
        ])
      }
    }),
    // Servicios
    prisma.activo.create({
      data: {
        nombre: 'Servicio de Transferencias Internacionales',
        descripcion: 'Servicio SWIFT para transferencias internacionales',
        tipo: 'servicios', criticidad: 'alta', responsable: 'Carlos Hernández Mora', departamento: 'Tesorería',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Servicio de Pagos con Tarjeta',
        descripcion: 'Procesamiento de pagos con tarjetas de crédito y débito',
        tipo: 'servicios', criticidad: 'critica', responsable: 'Jorge Vargas Luna', departamento: 'Operaciones',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    // Infraestructura de Red
    prisma.activo.create({
      data: {
        nombre: 'Red WAN Corporativa',
        descripcion: 'Red de área amplia que conecta sucursales y data centers',
        tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'TI',
        propiedadesCustom: JSON.stringify([])
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Firewall Perimetral',
        descripcion: 'Sistema de protección perimetral de la red bancaria',
        tipo: 'red', criticidad: 'critica', responsable: 'Roberto Torres Ramírez', departamento: 'Seguridad',
        propiedadesCustom: JSON.stringify([])
      }
    }),
  ]);
  console.log(`✓ Creados ${activos.length} activos bancarios`);

  // ============================================================
  // Crear Riesgos Bancarios
  // ============================================================
  const riesgosData = [
    // Riesgos del Core Banking
    { activoId: activos[0].id, descripcion: 'Falla crítica del sistema core banking que impida operaciones', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[0].id, descripcion: 'Acceso no autorizado a funciones administrativas del core', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[0].id, descripcion: 'Inconsistencia en saldos por error de procesamiento batch', probabilidad: 2, impacto: 4, estado: 'evaluado', responsable: 'Ana Patricia López García' },
    // Riesgos de Banca en Línea
    { activoId: activos[1].id, descripcion: 'Ataque de phishing dirigido a clientes de banca en línea', probabilidad: 4, impacto: 4, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[1].id, descripcion: 'Vulnerabilidad XSS en portal de banca en línea', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[1].id, descripcion: 'Fraude por suplantación de identidad digital', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Patricia Reyes Solís' },
    // Riesgos de SPEI
    { activoId: activos[2].id, descripcion: 'Interrupción de conexión con Banco de México', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Carlos Hernández Mora' },
    { activoId: activos[2].id, descripcion: 'Transferencias fraudulentas por compromiso de credenciales', probabilidad: 2, impacto: 5, estado: 'evaluado', responsable: 'Patricia Reyes Solís' },
    // Riesgos de AML
    { activoId: activos[3].id, descripcion: 'Falla en detección de operaciones inusuales', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Patricia Reyes Solís' },
    { activoId: activos[3].id, descripcion: 'Incumplimiento de reportes regulatorios por falla del sistema', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Patricia Reyes Solís' },
    // Riesgos de Base de Datos
    { activoId: activos[5].id, descripcion: 'Fuga de datos personales de clientes (datos KYC)', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[5].id, descripcion: 'Corrupción de datos por falla de almacenamiento', probabilidad: 1, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[6].id, descripcion: 'Pérdida de integridad en registros de transacciones', probabilidad: 1, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    // Riesgos de Hardware
    { activoId: activos[8].id, descripcion: 'Falla de hardware en servidor principal', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[10].id, descripcion: 'Robo de efectivo en cajeros automáticos', probabilidad: 3, impacto: 3, estado: 'aceptado', responsable: 'Jorge Vargas Luna' },
    { activoId: activos[10].id, descripcion: 'Skimming de tarjetas en red de ATMs', probabilidad: 3, impacto: 4, estado: 'en_tratamiento', responsable: 'Jorge Vargas Luna' },
    // Riesgos de Red
    { activoId: activos[13].id, descripcion: 'Ataque DDoS contra infraestructura bancaria', probabilidad: 3, impacto: 4, estado: 'mitigado', responsable: 'Roberto Torres Ramírez' },
    { activoId: activos[14].id, descripcion: 'Intrusión a través de vulnerabilidad en firewall', probabilidad: 2, impacto: 5, estado: 'en_tratamiento', responsable: 'Roberto Torres Ramírez' },
    // Riesgos de Servicios
    { activoId: activos[11].id, descripcion: 'Fraude en transferencias SWIFT por BEC', probabilidad: 2, impacto: 5, estado: 'evaluado', responsable: 'Carlos Hernández Mora' },
    { activoId: activos[12].id, descripcion: 'Fraude masivo con tarjetas clonadas', probabilidad: 3, impacto: 5, estado: 'en_tratamiento', responsable: 'Patricia Reyes Solís' },
  ];
  await prisma.riesgo.createMany({ data: riesgosData });
  console.log(`✓ Creados ${riesgosData.length} riesgos bancarios`);

  // ============================================================
  // Crear Incidentes Bancarios
  // ============================================================
  const incidentesData = [
    { activoId: activos[1].id, titulo: 'Ataque de phishing masivo a clientes', descripcion: 'Se detectaron más de 500 intentos de phishing dirigidos a clientes de banca en línea mediante correos falsos que simulaban ser del banco', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez' },
    { activoId: activos[0].id, titulo: 'Degradación de rendimiento en Core Banking', descripcion: 'El sistema core experimentó lentitud durante 3 horas debido a un proceso batch mal configurado', severidad: 'media', estado: 'cerrado', reportadoPor: 'Ana Patricia López García' },
    { activoId: activos[10].id, titulo: 'Dispositivo de skimming detectado', descripcion: 'Se encontró un dispositivo de clonación de tarjetas en ATM de sucursal Polanco', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Jorge Vargas Luna' },
    { activoId: activos[2].id, titulo: 'Intermitencia en conexión SPEI', descripcion: 'Conexión intermitente con Banco de México durante ventana de operación matutina', severidad: 'critica', estado: 'cerrado', reportadoPor: 'Carlos Hernández Mora' },
    { activoId: activos[5].id, titulo: 'Acceso no autorizado detectado', descripcion: 'Se detectó intento de acceso no autorizado a base de datos de clientes desde IP externa', severidad: 'critica', estado: 'en_investigacion', reportadoPor: 'Roberto Torres Ramírez' },
    { activoId: activos[3].id, titulo: 'Falla en generación de alertas AML', descripcion: 'El sistema AML no generó alertas durante 2 horas por error en servicio de monitoreo', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Patricia Reyes Solís' },
    { activoId: activos[12].id, titulo: 'Transacciones fraudulentas con tarjeta', descripcion: 'Se detectaron 25 transacciones fraudulentas en un período de 30 minutos', severidad: 'alta', estado: 'en_contencion', reportadoPor: 'Patricia Reyes Solís' },
    { activoId: activos[13].id, titulo: 'Caída de enlace principal WAN', descripcion: 'Pérdida de conectividad con 15 sucursales por falla en enlace de proveedor', severidad: 'alta', estado: 'resuelto', reportadoPor: 'Roberto Torres Ramírez' },
  ];
  await prisma.incidente.createMany({ data: incidentesData });
  console.log(`✓ Creados ${incidentesData.length} incidentes bancarios`);

  // ============================================================
  // Crear Defectos
  // ============================================================
  const defectosData = [
    { activoId: activos[0].id, titulo: 'Error en cálculo de intereses moratorios', descripcion: 'El módulo de créditos calcula incorrectamente los intereses moratorios para créditos con pagos parciales', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Ana Patricia López García' },
    { activoId: activos[1].id, titulo: 'Timeout en consulta de movimientos', descripcion: 'La consulta de movimientos en banca en línea presenta timeout cuando hay más de 500 registros', tipo: 'rendimiento', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Roberto Torres Ramírez' },
    { activoId: activos[1].id, titulo: 'Vulnerabilidad en autenticación de app móvil', descripcion: 'Se identificó vulnerabilidad que permite bypass de segundo factor en ciertas condiciones', tipo: 'seguridad', prioridad: 'critica', estado: 'en_correccion', detectadoPor: 'Roberto Torres Ramírez' },
    { activoId: activos[3].id, titulo: 'Falsos positivos excesivos en alertas', descripcion: 'El sistema genera demasiados falsos positivos en alertas de operaciones inusuales', tipo: 'funcional', prioridad: 'media', estado: 'confirmado', detectadoPor: 'Patricia Reyes Solís' },
    { activoId: activos[4].id, titulo: 'Error en workflow de aprobación de crédito', descripcion: 'El flujo de aprobación no notifica correctamente al siguiente aprobador', tipo: 'funcional', prioridad: 'alta', estado: 'corregido', detectadoPor: 'Fernando Castillo Núñez' },
  ];
  await prisma.defecto.createMany({ data: defectosData });
  console.log(`✓ Creados ${defectosData.length} defectos`);

  // ============================================================
  // Crear Procesos Bancarios
  // ============================================================
  const procesoKYC = await prisma.proceso.create({
    data: {
      nombre: 'Conoce a tu Cliente (KYC)',
      descripcion: 'Proceso de identificación y verificación de clientes para cumplimiento regulatorio',
      version: '2.1', estado: 'activo', createdBy: usuarios[2].id
    }
  });

  const procesoAML = await prisma.proceso.create({
    data: {
      nombre: 'Prevención de Lavado de Dinero (AML)',
      descripcion: 'Proceso de monitoreo y detección de operaciones inusuales y sospechosas',
      version: '3.0', estado: 'activo', createdBy: usuarios[8].id
    }
  });

  const procesoCredito = await prisma.proceso.create({
    data: {
      nombre: 'Originación de Crédito',
      descripcion: 'Proceso end-to-end para la solicitud, evaluación y otorgamiento de créditos',
      version: '1.5', estado: 'activo', createdBy: usuarios[2].id
    }
  });

  const procesoApertura = await prisma.proceso.create({
    data: {
      nombre: 'Apertura de Cuenta',
      descripcion: 'Proceso de apertura de cuentas de captación para personas físicas y morales',
      version: '2.0', estado: 'activo', createdBy: usuarios[7].id
    }
  });

  const procesoIncidentes = await prisma.proceso.create({
    data: {
      nombre: 'Gestión de Incidentes de Seguridad',
      descripcion: 'Proceso de detección, respuesta y recuperación ante incidentes de seguridad',
      version: '1.2', estado: 'activo', createdBy: usuarios[3].id
    }
  });
  console.log('✓ Creados 5 procesos bancarios');

  // ============================================================
  // Crear Marcos Normativos Bancarios
  // ============================================================
  const marcoCNBV = await prisma.marcoNormativo.create({
    data: {
      nombre: 'Disposiciones de Carácter General aplicables a Instituciones de Crédito',
      acronimo: 'CUB', version: '2024', fechaVigencia: new Date('2024-01-01'),
      descripcion: 'Circular Única de Bancos emitida por la CNBV que establece los requisitos operativos y de cumplimiento para instituciones de crédito',
      activo: true
    }
  });

  const marcoPLD = await prisma.marcoNormativo.create({
    data: {
      nombre: 'Disposiciones de Prevención de Lavado de Dinero',
      acronimo: 'PLD/FT', version: '2023', fechaVigencia: new Date('2023-07-01'),
      descripcion: 'Normatividad para la prevención e identificación de operaciones con recursos de procedencia ilícita',
      activo: true
    }
  });

  const marcoPCI = await prisma.marcoNormativo.create({
    data: {
      nombre: 'Payment Card Industry Data Security Standard',
      acronimo: 'PCI-DSS', version: '4.0', fechaVigencia: new Date('2024-03-31'),
      descripcion: 'Estándar de seguridad de datos para la industria de tarjetas de pago',
      activo: true
    }
  });

  const marcoISO27001 = await prisma.marcoNormativo.create({
    data: {
      nombre: 'Sistema de Gestión de Seguridad de la Información',
      acronimo: 'ISO 27001', version: '2022', fechaVigencia: new Date('2022-10-25'),
      descripcion: 'Estándar internacional para la gestión de seguridad de la información',
      activo: true
    }
  });

  const marcoLFPDPPP = await prisma.marcoNormativo.create({
    data: {
      nombre: 'Ley Federal de Protección de Datos Personales',
      acronimo: 'LFPDPPP', version: '2024', fechaVigencia: new Date('2010-07-05'),
      descripcion: 'Ley que regula el tratamiento de datos personales por particulares',
      activo: true
    }
  });
  console.log('✓ Creados 5 marcos normativos');

  // ============================================================
  // Crear Organigrama Bancario
  // ============================================================
  const organigrama = await prisma.organigrama.create({
    data: { nombre: 'Organigrama Banco Global', descripcion: 'Estructura organizacional del banco' }
  });

  const ceo = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Ricardo Salinas Pliego', cargo: 'Director General (CEO)', departamento: 'Dirección General', email: 'rsalinas@bancoglobal.mx', telefono: '+52 55 1234 0001' }
  });

  const cro = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'María Elena Gutiérrez Vega', cargo: 'Directora de Riesgos (CRO)', departamento: 'Riesgos', email: 'mgutierrez@bancoglobal.mx', padreId: ceo.id }
  });

  const cco = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Carlos Hernández Mora', cargo: 'Oficial de Cumplimiento (CCO)', departamento: 'Cumplimiento', email: 'chernandez@bancoglobal.mx', padreId: ceo.id }
  });

  const ciso = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Roberto Torres Ramírez', cargo: 'Oficial de Seguridad (CISO)', departamento: 'Seguridad de Información', email: 'rtorres@bancoglobal.mx', padreId: ceo.id }
  });

  await prisma.nodoOrganigrama.createMany({
    data: [
      { organigramaId: organigrama.id, nombre: 'Ana Patricia López García', cargo: 'Analista Senior de Riesgos', departamento: 'Riesgos', email: 'alopez@bancoglobal.mx', padreId: cro.id },
      { organigramaId: organigrama.id, nombre: 'Fernando Castillo Núñez', cargo: 'Analista de Cumplimiento', departamento: 'Cumplimiento', email: 'fcastillo@bancoglobal.mx', padreId: cco.id },
      { organigramaId: organigrama.id, nombre: 'Patricia Reyes Solís', cargo: 'Oficial PLD/AML', departamento: 'PLD/AML', email: 'preyes@bancoglobal.mx', padreId: cco.id },
      { organigramaId: organigrama.id, nombre: 'Laura Mendoza Díaz', cargo: 'Auditora Interna Senior', departamento: 'Auditoría', email: 'lmendoza@bancoglobal.mx', padreId: ceo.id },
    ]
  });
  console.log('✓ Organigrama bancario creado');

  // ============================================================
  // Crear Dashboard Bancario
  // ============================================================
  await prisma.dashboardConfig.create({
    data: {
      nombre: 'Dashboard Principal',
      descripcion: 'Panel de control GRC bancario',
      isDefault: true, columns: 12, rowHeight: 50, gap: 10,
      widgets: {
        create: [
          { tipo: 'kpi-card', titulo: 'Cumplimiento General', config: JSON.stringify({ kpiType: 'cumplimiento', color: 'cyan' }), x: 0, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Procesos Activos', config: JSON.stringify({ kpiType: 'procesos', color: 'purple' }), x: 3, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Alertas Activas', config: JSON.stringify({ kpiType: 'alertas', color: 'orange' }), x: 6, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Objetivos Cumplidos', config: JSON.stringify({ kpiType: 'objetivos', color: 'emerald' }), x: 9, y: 0, cols: 3, rows: 2 },
          { tipo: 'graficas-interactivas', titulo: 'Gráficas Interactivas', subtitulo: 'Análisis visual de métricas', config: JSON.stringify({ chartType: 'donut' }), x: 0, y: 2, cols: 6, rows: 5 },
          { tipo: 'table-mini', titulo: 'Procesos', config: JSON.stringify({ entity: 'procesos' }), x: 6, y: 2, cols: 6, rows: 5 },
          { tipo: 'actividad-enhanced', titulo: 'Últimas Actividades', config: JSON.stringify({}), x: 0, y: 7, cols: 6, rows: 4 },
          { tipo: 'calendario', titulo: 'Calendario', config: JSON.stringify({}), x: 6, y: 7, cols: 6, rows: 4 },
        ]
      }
    }
  });
  console.log('✓ Dashboard bancario creado');

  // ============================================================
  // Crear Cuestionarios
  // ============================================================
  const cuestionarioPCI = await prisma.cuestionario.create({
    data: {
      nombre: 'Autoevaluación PCI-DSS v4.0',
      descripcion: 'Cuestionario de autoevaluación para cumplimiento del estándar PCI-DSS',
      categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'autoevaluacion',
      estado: 'activo', marcoNormativoId: marcoPCI.id, periodicidad: 'trimestral',
      umbrales: JSON.stringify({ deficiente: 60, aceptable: 80, sobresaliente: 95 }),
      areasObjetivo: JSON.stringify(['TI', 'Seguridad']),
      responsables: JSON.stringify([usuarios[3].id])
    }
  });

  const cuestionarioAML = await prisma.cuestionario.create({
    data: {
      nombre: 'Evaluación de Controles AML/PLD',
      descripcion: 'Evaluación de controles de prevención de lavado de dinero',
      categoria: 'cumplimiento', tipo: 'manual', tipoEvaluacion: 'auditoria_externa',
      estado: 'activo', marcoNormativoId: marcoPLD.id, periodicidad: 'semestral',
      umbrales: JSON.stringify({ deficiente: 70, aceptable: 85, sobresaliente: 95 }),
      areasObjetivo: JSON.stringify(['Cumplimiento', 'PLD/AML']),
      responsables: JSON.stringify([usuarios[8].id])
    }
  });

  const cuestionarioISO = await prisma.cuestionario.create({
    data: {
      nombre: 'Auditoría Interna ISO 27001',
      descripcion: 'Revisión de controles del SGSI según ISO 27001:2022',
      categoria: 'seguridad', tipo: 'manual', tipoEvaluacion: 'revision_controles',
      estado: 'activo', marcoNormativoId: marcoISO27001.id, periodicidad: 'anual',
      umbrales: JSON.stringify({ deficiente: 65, aceptable: 80, sobresaliente: 92 }),
      areasObjetivo: JSON.stringify(['Seguridad', 'TI', 'Riesgos']),
      responsables: JSON.stringify([usuarios[3].id, usuarios[9].id])
    }
  });
  console.log('✓ Creados 3 cuestionarios');

  // ============================================================
  // Crear Asignaciones de Cuestionarios (Revisiones)
  // ============================================================
  const fechaHoy = new Date();
  const fechaInicio = new Date(fechaHoy);
  fechaInicio.setDate(fechaInicio.getDate() - 7);
  const fechaVencimiento = new Date(fechaHoy);
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
  const fechaVencimientoProximo = new Date(fechaHoy);
  fechaVencimientoProximo.setDate(fechaVencimientoProximo.getDate() + 7);

  await prisma.asignacionCuestionario.createMany({
    data: [
      {
        cuestionarioId: cuestionarioPCI.id,
        titulo: 'Revisión Trimestral PCI-DSS Q4 2024',
        descripcion: 'Autoevaluación de cumplimiento PCI-DSS para el cuarto trimestre',
        tipoRevision: 'interna',
        usuariosAsignados: JSON.stringify([usuarios[3].id]),
        usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']),
        activosObjetivo: JSON.stringify([activos[12].id]),
        activosObjetivoNombres: JSON.stringify(['Servicio de Pagos con Tarjeta']),
        procesosObjetivo: JSON.stringify([]),
        procesosObjetivoNombres: JSON.stringify([]),
        aprobadores: JSON.stringify([usuarios[1].id]),
        aprobadoresNombres: JSON.stringify(['María Elena Gutiérrez Vega']),
        areaId: 'seguridad',
        areaNombre: 'Seguridad de Información',
        responsableId: usuarios[3].id,
        responsableNombre: 'Roberto Torres Ramírez',
        fechaInicio: fechaInicio,
        fechaVencimiento: fechaVencimiento,
        estado: 'en_progreso',
        progreso: 45
      },
      {
        cuestionarioId: cuestionarioAML.id,
        titulo: 'Auditoría AML/PLD Semestral 2024-H2',
        descripcion: 'Evaluación de controles anti lavado de dinero segundo semestre',
        tipoRevision: 'externa',
        usuariosAsignados: JSON.stringify([usuarios[8].id, usuarios[6].id]),
        usuariosAsignadosNombres: JSON.stringify(['Patricia Reyes Solís', 'Fernando Castillo Núñez']),
        activosObjetivo: JSON.stringify([activos[3].id]),
        activosObjetivoNombres: JSON.stringify(['Sistema AML/PLD']),
        procesosObjetivo: JSON.stringify([procesoAML.id]),
        procesosObjetivoNombres: JSON.stringify(['Prevención de Lavado de Dinero (AML)']),
        aprobadores: JSON.stringify([usuarios[2].id]),
        aprobadoresNombres: JSON.stringify(['Carlos Hernández Mora']),
        areaId: 'cumplimiento',
        areaNombre: 'Cumplimiento Normativo',
        responsableId: usuarios[8].id,
        responsableNombre: 'Patricia Reyes Solís',
        fechaInicio: new Date(fechaHoy.setDate(fechaHoy.getDate() - 14)),
        fechaVencimiento: fechaVencimientoProximo,
        estado: 'en_progreso',
        progreso: 78
      },
      {
        cuestionarioId: cuestionarioISO.id,
        titulo: 'Auditoría Interna SGSI 2024',
        descripcion: 'Revisión anual del Sistema de Gestión de Seguridad de la Información',
        tipoRevision: 'interna',
        usuariosAsignados: JSON.stringify([usuarios[9].id]),
        usuariosAsignadosNombres: JSON.stringify(['Laura Mendoza Díaz']),
        activosObjetivo: JSON.stringify([activos[13].id, activos[14].id]),
        activosObjetivoNombres: JSON.stringify(['Red WAN Corporativa', 'Firewall Perimetral']),
        procesosObjetivo: JSON.stringify([procesoIncidentes.id]),
        procesosObjetivoNombres: JSON.stringify(['Gestión de Incidentes de Seguridad']),
        aprobadores: JSON.stringify([usuarios[3].id]),
        aprobadoresNombres: JSON.stringify(['Roberto Torres Ramírez']),
        areaId: 'auditoria',
        areaNombre: 'Auditoría Interna',
        responsableId: usuarios[9].id,
        responsableNombre: 'Laura Mendoza Díaz',
        fechaInicio: new Date(),
        fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() + 2)),
        estado: 'pendiente',
        progreso: 0
      },
      {
        cuestionarioId: cuestionarioPCI.id,
        titulo: 'Revisión Trimestral PCI-DSS Q3 2024',
        descripcion: 'Autoevaluación de cumplimiento PCI-DSS para el tercer trimestre',
        tipoRevision: 'interna',
        usuariosAsignados: JSON.stringify([usuarios[3].id]),
        usuariosAsignadosNombres: JSON.stringify(['Roberto Torres Ramírez']),
        activosObjetivo: JSON.stringify([activos[12].id]),
        activosObjetivoNombres: JSON.stringify(['Servicio de Pagos con Tarjeta']),
        procesosObjetivo: JSON.stringify([]),
        procesosObjetivoNombres: JSON.stringify([]),
        aprobadores: JSON.stringify([usuarios[1].id]),
        aprobadoresNombres: JSON.stringify(['María Elena Gutiérrez Vega']),
        areaId: 'seguridad',
        areaNombre: 'Seguridad de Información',
        responsableId: usuarios[3].id,
        responsableNombre: 'Roberto Torres Ramírez',
        fechaInicio: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        fechaVencimiento: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        estado: 'completado',
        progreso: 100
      },
      {
        cuestionarioId: cuestionarioAML.id,
        titulo: 'Evaluación KYC Reforzado',
        descripcion: 'Revisión de procesos de conocimiento del cliente para clientes de alto riesgo',
        tipoRevision: 'interna',
        usuariosAsignados: JSON.stringify([usuarios[8].id]),
        usuariosAsignadosNombres: JSON.stringify(['Patricia Reyes Solís']),
        activosObjetivo: JSON.stringify([activos[5].id]),
        activosObjetivoNombres: JSON.stringify(['Base de Datos de Clientes (KYC)']),
        procesosObjetivo: JSON.stringify([procesoKYC.id]),
        procesosObjetivoNombres: JSON.stringify(['Conoce a tu Cliente (KYC)']),
        aprobadores: JSON.stringify([usuarios[2].id]),
        aprobadoresNombres: JSON.stringify(['Carlos Hernández Mora']),
        areaId: 'cumplimiento',
        areaNombre: 'PLD/AML',
        responsableId: usuarios[8].id,
        responsableNombre: 'Patricia Reyes Solís',
        fechaInicio: new Date(),
        fechaVencimiento: new Date(new Date().setDate(new Date().getDate() + 45)),
        estado: 'en_progreso',
        progreso: 25
      }
    ]
  });
  console.log('✓ Creadas 5 asignaciones de cuestionarios (revisiones)');

  // ============================================================
  // Crear Alertas de Cumplimiento
  // ============================================================
  const alertasData = [
    { tipo: 'cuestionario_vencido', severidad: 'alta', titulo: 'Cuestionario PCI-DSS vencido', descripcion: 'El cuestionario de autoevaluación PCI-DSS Q4 2024 no ha sido completado', entidadId: marcoPCI.id, entidadTipo: 'marco_normativo', estado: 'activa', responsable: 'Roberto Torres Ramírez', marcoNormativo: 'PCI-DSS' },
    { tipo: 'brecha_cumplimiento', severidad: 'critica', titulo: 'Brecha en cumplimiento AML', descripcion: 'Se identificó una brecha del 15% en el cumplimiento del programa AML', entidadId: marcoPLD.id, entidadTipo: 'marco_normativo', estado: 'activa', responsable: 'Patricia Reyes Solís', marcoNormativo: 'PLD/FT' },
    { tipo: 'evidencia_faltante', severidad: 'media', titulo: 'Evidencias pendientes ISO 27001', descripcion: 'Faltan 5 evidencias para completar la auditoría del dominio A.12', entidadId: marcoISO27001.id, entidadTipo: 'marco_normativo', estado: 'activa', responsable: 'Roberto Torres Ramírez', marcoNormativo: 'ISO 27001' },
    { tipo: 'control_sin_validar', severidad: 'media', titulo: 'Controles CNBV sin validar', descripcion: '3 controles del artículo 166 bis no han sido validados en este trimestre', entidadId: marcoCNBV.id, entidadTipo: 'marco_normativo', estado: 'activa', responsable: 'Carlos Hernández Mora', marcoNormativo: 'CUB' },
  ];
  await prisma.alertaCumplimiento.createMany({ data: alertasData });
  console.log(`✓ Creadas ${alertasData.length} alertas de cumplimiento`);

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('📊 Resumen de datos creados:');
  console.log('   - 25 permisos');
  console.log('   - 8 módulos');
  console.log('   - 8 roles fijos del sistema');
  console.log('   - 15 usuarios');
  console.log('   - 41 catálogos');
  console.log('   - 15 activos bancarios');
  console.log('   - 20 riesgos');
  console.log('   - 8 incidentes');
  console.log('   - 5 defectos');
  console.log('   - 5 procesos');
  console.log('   - 5 marcos normativos (cumplimiento)');
  console.log('   - 3 cuestionarios');
  console.log('   - 5 revisiones (asignaciones de cuestionarios)');
  console.log('   - 4 alertas de cumplimiento\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
