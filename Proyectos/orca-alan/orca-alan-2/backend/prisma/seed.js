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

  // ============================================================
  // Crear Reglas de Notificación por Defecto
  // ============================================================
  const notificationRulesData = [
    // Riesgos
    {
      nombre: 'Nuevo riesgo crítico creado',
      descripcion: 'Notifica cuando se crea un riesgo con nivel crítico',
      entidadTipo: 'RISK',
      eventoTipo: 'CREATE',
      activo: true,
      notificarCreador: false,
      notificarResponsable: true,
      notificarAprobadores: false,
      rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']),
      enviarInApp: true,
      enviarEmail: false,
      plantillaMensaje: 'Se ha identificado un nuevo riesgo crítico: {nombre}',
      severidad: 'critical'
    },
    {
      nombre: 'Riesgo actualizado',
      descripcion: 'Notifica cuando se actualiza un riesgo',
      entidadTipo: 'RISK',
      eventoTipo: 'UPDATE',
      activo: true,
      notificarResponsable: true,
      enviarInApp: true,
      severidad: 'info'
    },
    // Incidentes
    {
      nombre: 'Incidente de seguridad reportado',
      descripcion: 'Notifica cuando se reporta un nuevo incidente',
      entidadTipo: 'INCIDENT',
      eventoTipo: 'CREATE',
      activo: true,
      notificarResponsable: true,
      rolesDestino: JSON.stringify(['Director', 'Coordinador', 'Gestor Áreas']),
      enviarInApp: true,
      enviarEmail: false,
      plantillaMensaje: 'Se ha reportado un incidente de seguridad: {titulo}',
      severidad: 'warning'
    },
    {
      nombre: 'Incidente cerrado',
      descripcion: 'Notifica cuando se cierra un incidente',
      entidadTipo: 'INCIDENT',
      eventoTipo: 'UPDATE',
      activo: true,
      notificarCreador: true,
      notificarResponsable: true,
      enviarInApp: true,
      severidad: 'info'
    },
    // Cuestionarios
    {
      nombre: 'Cuestionario asignado',
      descripcion: 'Notifica cuando se asigna un cuestionario para revisión',
      entidadTipo: 'QUESTIONNAIRE',
      eventoTipo: 'CREATE',
      activo: true,
      notificarResponsable: true,
      enviarInApp: true,
      enviarEmail: false,
      plantillaMensaje: 'Se te ha asignado el cuestionario: {nombre}',
      severidad: 'info'
    },
    {
      nombre: 'Respuesta de cuestionario aprobada',
      descripcion: 'Notifica cuando una respuesta es aprobada',
      entidadTipo: 'QUESTIONNAIRE',
      eventoTipo: 'APPROVAL',
      activo: true,
      notificarCreador: true,
      notificarResponsable: true,
      enviarInApp: true,
      severidad: 'info'
    },
    {
      nombre: 'Respuesta de cuestionario rechazada',
      descripcion: 'Notifica cuando una respuesta es rechazada',
      entidadTipo: 'QUESTIONNAIRE',
      eventoTipo: 'REJECTION',
      activo: true,
      notificarCreador: true,
      notificarResponsable: true,
      enviarInApp: true,
      plantillaMensaje: 'Tu respuesta al cuestionario {nombre} ha sido rechazada. Por favor revisa los comentarios.',
      severidad: 'warning'
    },
    // Activos
    {
      nombre: 'Nuevo activo crítico creado',
      descripcion: 'Notifica cuando se crea un activo con criticidad crítica',
      entidadTipo: 'ASSET',
      eventoTipo: 'CREATE',
      activo: true,
      notificarResponsable: true,
      rolesDestino: JSON.stringify(['Gestor Áreas']),
      enviarInApp: true,
      severidad: 'info'
    },
    // Defectos
    {
      nombre: 'Defecto crítico reportado',
      descripcion: 'Notifica cuando se reporta un defecto con prioridad crítica',
      entidadTipo: 'DEFECT',
      eventoTipo: 'CREATE',
      activo: true,
      notificarResponsable: true,
      rolesDestino: JSON.stringify(['Coordinador', 'Gestor Áreas']),
      enviarInApp: true,
      severidad: 'critical'
    }
  ];
  await prisma.notificationRule.createMany({ data: notificationRulesData });
  console.log(`✓ Creadas ${notificationRulesData.length} reglas de notificación`);

  // ============================================================
  // Crear Reglas de Alertas por Umbral
  // ============================================================
  const alertRulesData = [
    {
      nombre: 'Riesgos críticos exceden umbral',
      descripcion: 'Alerta cuando hay más de 5 riesgos en estado crítico',
      entidadTipo: 'RISK',
      metricaNombre: 'count_critical',
      operador: 'GT',
      valorUmbral: 5,
      tipoAgregacion: 'COUNT',
      activo: true,
      rolesDestino: JSON.stringify(['Director', 'Gestor Áreas']),
      enviarInApp: true,
      severidad: 'critical',
      cooldownMinutos: 1440 // 24 horas
    },
    {
      nombre: 'Incidentes sin resolver',
      descripcion: 'Alerta cuando hay más de 3 incidentes sin resolver en 48h',
      entidadTipo: 'INCIDENT',
      metricaNombre: 'unresolved_48h',
      operador: 'GT',
      valorUmbral: 3,
      tipoAgregacion: 'COUNT',
      activo: true,
      rolesDestino: JSON.stringify(['Coordinador']),
      enviarInApp: true,
      severidad: 'warning',
      cooldownMinutos: 720 // 12 horas
    },
    {
      nombre: 'Cumplimiento bajo umbral',
      descripcion: 'Alerta cuando el cumplimiento general baja del 80%',
      entidadTipo: 'COMPLIANCE_REVIEW',
      metricaNombre: 'compliance_percentage',
      operador: 'LT',
      valorUmbral: 80,
      tipoAgregacion: 'AVG',
      activo: true,
      rolesDestino: JSON.stringify(['Director']),
      enviarInApp: true,
      enviarEmail: false,
      severidad: 'warning',
      cooldownMinutos: 2880 // 48 horas
    }
  ];
  await prisma.alertRule.createMany({ data: alertRulesData });
  console.log(`✓ Creadas ${alertRulesData.length} reglas de alertas por umbral`);

  // ============================================================
  // Crear Reglas de Vencimiento
  // ============================================================
  const expirationRulesData = [
    {
      nombre: 'Vencimiento de cuestionarios',
      descripcion: 'Recordatorios para cuestionarios próximos a vencer',
      entidadTipo: 'QUESTIONNAIRE',
      diasAnticipacion: JSON.stringify([30, 15, 7, 3, 1]),
      diasDespuesVencido: JSON.stringify([1, 7]),
      activo: true,
      notificarResponsable: true,
      notificarSupervisor: true,
      enviarInApp: true,
      enviarEmail: false
    },
    {
      nombre: 'Vencimiento de revisiones de cumplimiento',
      descripcion: 'Recordatorios para revisiones de cumplimiento',
      entidadTipo: 'COMPLIANCE_REVIEW',
      diasAnticipacion: JSON.stringify([15, 7, 1]),
      diasDespuesVencido: JSON.stringify([1, 3]),
      activo: true,
      notificarResponsable: true,
      notificarSupervisor: false,
      enviarInApp: true
    },
    {
      nombre: 'Vencimiento de controles',
      descripcion: 'Recordatorios para controles que requieren revisión',
      entidadTipo: 'ASSET',
      diasAnticipacion: JSON.stringify([30, 7]),
      activo: true,
      notificarResponsable: true,
      enviarInApp: true
    }
  ];
  await prisma.expirationRule.createMany({ data: expirationRulesData });
  console.log(`✓ Creadas ${expirationRulesData.length} reglas de vencimiento`);

  // ============================================================
  // Crear algunas notificaciones de ejemplo en inbox
  // ============================================================
  const notificationsData = [
    {
      usuarioId: usuarios[3].id, // CISO
      tipo: 'NOTIFICATION',
      titulo: 'Nuevo riesgo crítico identificado',
      mensaje: 'Se ha identificado un nuevo riesgo crítico en el Core Banking System: Acceso no autorizado a funciones administrativas.',
      severidad: 'critical',
      entidadTipo: 'RISK',
      entidadId: 'risk-001',
      entidadNombre: 'Acceso no autorizado a CBS',
      leida: false,
      acciones: JSON.stringify([
        { tipo: 'primary', label: 'Ver riesgo', url: '/riesgos/risk-001' },
        { tipo: 'secondary', label: 'Marcar como revisado' }
      ])
    },
    {
      usuarioId: usuarios[3].id,
      tipo: 'ALERT',
      titulo: 'Incidentes sin resolver exceden umbral',
      mensaje: 'Hay 5 incidentes que llevan más de 48 horas sin resolver. Se requiere atención inmediata.',
      severidad: 'warning',
      entidadTipo: 'INCIDENT',
      leida: false,
      acciones: JSON.stringify([
        { tipo: 'primary', label: 'Ver incidentes', url: '/incidentes?estado=abierto' }
      ])
    },
    {
      usuarioId: usuarios[8].id, // Oficial PLD
      tipo: 'EXPIRATION_REMINDER',
      titulo: 'Cuestionario AML próximo a vencer',
      mensaje: 'El cuestionario "Auditoría AML/PLD Semestral 2024-H2" vence en 7 días.',
      severidad: 'warning',
      entidadTipo: 'QUESTIONNAIRE',
      entidadNombre: 'Auditoría AML/PLD Semestral',
      leida: false,
      acciones: JSON.stringify([
        { tipo: 'primary', label: 'Completar cuestionario', url: '/cumplimiento/cuestionarios/aml-2024-h2' }
      ])
    },
    {
      usuarioId: usuarios[2].id, // CCO
      tipo: 'APPROVAL_REQUEST',
      titulo: 'Respuesta pendiente de aprobación',
      mensaje: 'Patricia Reyes Solís ha completado el cuestionario AML y requiere tu aprobación.',
      severidad: 'info',
      entidadTipo: 'QUESTIONNAIRE',
      entidadNombre: 'Evaluación KYC Reforzado',
      leida: false,
      acciones: JSON.stringify([
        { tipo: 'primary', label: 'Aprobar', action: 'approve' },
        { tipo: 'danger', label: 'Rechazar', action: 'reject' },
        { tipo: 'secondary', label: 'Ver detalles', url: '/cumplimiento/revisiones/kyc-reforzado' }
      ])
    },
    {
      usuarioId: usuarios[3].id,
      tipo: 'NOTIFICATION',
      titulo: 'Incidente de seguridad resuelto',
      mensaje: 'El incidente "Ataque de phishing masivo a clientes" ha sido resuelto exitosamente.',
      severidad: 'info',
      entidadTipo: 'INCIDENT',
      entidadNombre: 'Ataque de phishing masivo',
      leida: true,
      fechaLeida: new Date(Date.now() - 3600000) // hace 1 hora
    }
  ];
  await prisma.notification.createMany({ data: notificationsData });
  console.log(`✓ Creadas ${notificationsData.length} notificaciones de ejemplo`);

  // ============================================================
  // Crear Proyectos de ejemplo
  // ============================================================
  const proyectosData = [
    {
      name: 'Implementación ISO 27001',
      description: 'Proyecto de certificación del Sistema de Gestión de Seguridad de la Información bajo la norma ISO 27001:2022',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      responsibleUserId: usuarios[3].id, // CISO
      priority: 'critical',
      status: 'in_progress',
      progress: 45,
      reminderDays: JSON.stringify([30, 15, 7, 1]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Migración Core Banking a Nube',
      description: 'Migración del sistema Core Banking a infraestructura cloud con alta disponibilidad y cumplimiento regulatorio',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-03-31'),
      responsibleUserId: usuarios[4].id, // Director TI
      priority: 'high',
      status: 'in_progress',
      progress: 30,
      reminderDays: JSON.stringify([15, 7, 3]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Actualización Política AML/PLD',
      description: 'Revisión y actualización de políticas de Prevención de Lavado de Dinero conforme a nueva regulación CNBV',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-12-31'),
      responsibleUserId: usuarios[8].id, // Oficial PLD
      priority: 'high',
      status: 'in_progress',
      progress: 65,
      reminderDays: JSON.stringify([15, 7, 1]),
      createdBy: usuarios[2].id
    },
    {
      name: 'Plan de Continuidad de Negocio 2025',
      description: 'Desarrollo e implementación del Plan de Continuidad de Negocio y Recuperación ante Desastres',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-02-28'),
      responsibleUserId: usuarios[3].id,
      priority: 'medium',
      status: 'planning',
      progress: 15,
      reminderDays: JSON.stringify([7, 3, 1]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Automatización Reportes Regulatorios',
      description: 'Automatización de la generación de reportes regulatorios para CNBV, Banxico y SAT',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-10-30'),
      responsibleUserId: usuarios[2].id, // CCO
      priority: 'medium',
      status: 'completed',
      progress: 100,
      reminderDays: JSON.stringify([7, 3]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Implementación SOC 2 Type II',
      description: 'Preparación y certificación SOC 2 Type II para servicios de banca digital',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-07-31'),
      responsibleUserId: usuarios[3].id,
      priority: 'high',
      status: 'in_progress',
      progress: 25,
      reminderDays: JSON.stringify([30, 15, 7]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Evaluación Proveedores Críticos',
      description: 'Evaluación de riesgos de terceros y proveedores críticos del banco',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-11-30'),
      responsibleUserId: usuarios[5].id, // Gestor de Riesgos
      priority: 'medium',
      status: 'in_progress',
      progress: 70,
      reminderDays: JSON.stringify([7, 3]),
      createdBy: usuarios[3].id
    },
    {
      name: 'Programa Concientización Seguridad',
      description: 'Programa anual de concientización y capacitación en seguridad de la información para empleados',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-15'),
      responsibleUserId: usuarios[6].id, // Analista Seguridad
      priority: 'low',
      status: 'paused',
      progress: 55,
      reminderDays: JSON.stringify([7, 1]),
      createdBy: usuarios[3].id
    },
    // ========== NUEVOS PROYECTOS ==========
    {
      name: 'Modernización Banca Móvil',
      description: 'Rediseño completo de la aplicación de banca móvil con nuevas funcionalidades y mejor experiencia de usuario',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2025-06-30'),
      responsibleUserId: usuarios[4].id,
      priority: 'critical',
      status: 'in_progress',
      progress: 20,
      reminderDays: JSON.stringify([30, 15, 7, 1]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Implementación Open Banking',
      description: 'Desarrollo de APIs abiertas conforme a regulación de Open Banking para integración con fintechs',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-08-31'),
      responsibleUserId: usuarios[4].id,
      priority: 'high',
      status: 'planning',
      progress: 10,
      reminderDays: JSON.stringify([15, 7, 3]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Centro de Operaciones de Seguridad (SOC)',
      description: 'Implementación de SOC 24/7 para monitoreo continuo de amenazas y respuesta a incidentes',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2025-04-30'),
      responsibleUserId: usuarios[3].id,
      priority: 'critical',
      status: 'in_progress',
      progress: 40,
      reminderDays: JSON.stringify([30, 15, 7]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Transformación Digital Sucursales',
      description: 'Digitalización de procesos en sucursales incluyendo firma electrónica y expediente digital',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2025-02-28'),
      responsibleUserId: usuarios[4].id,
      priority: 'high',
      status: 'in_progress',
      progress: 55,
      reminderDays: JSON.stringify([15, 7, 3]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Modelo de Riesgo Crediticio ML',
      description: 'Desarrollo de modelo de scoring crediticio basado en Machine Learning para aprobación automatizada',
      startDate: new Date('2024-09-15'),
      endDate: new Date('2025-03-31'),
      responsibleUserId: usuarios[5].id,
      priority: 'high',
      status: 'in_progress',
      progress: 35,
      reminderDays: JSON.stringify([15, 7, 1]),
      createdBy: usuarios[3].id
    },
    {
      name: 'Cumplimiento GDPR/LFPDPPP',
      description: 'Implementación de controles para cumplimiento de regulaciones de protección de datos personales',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2025-01-31'),
      responsibleUserId: usuarios[2].id,
      priority: 'high',
      status: 'in_progress',
      progress: 60,
      reminderDays: JSON.stringify([15, 7, 3]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Sistema Antifraude Tiempo Real',
      description: 'Implementación de sistema de detección de fraude en tiempo real para transacciones digitales',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2025-01-15'),
      responsibleUserId: usuarios[5].id,
      priority: 'critical',
      status: 'in_progress',
      progress: 70,
      reminderDays: JSON.stringify([30, 15, 7]),
      createdBy: usuarios[3].id
    },
    {
      name: 'Certificación PCI-DSS v4.0',
      description: 'Actualización de controles y recertificación bajo el nuevo estándar PCI-DSS versión 4.0',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-12-31'),
      responsibleUserId: usuarios[3].id,
      priority: 'critical',
      status: 'in_progress',
      progress: 75,
      reminderDays: JSON.stringify([30, 15, 7, 1]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Plataforma de Pagos Instantáneos',
      description: 'Integración con CoDi y desarrollo de plataforma de pagos instantáneos 24/7',
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-11-30'),
      responsibleUserId: usuarios[4].id,
      priority: 'high',
      status: 'completed',
      progress: 100,
      reminderDays: JSON.stringify([15, 7]),
      createdBy: usuarios[0].id
    },
    {
      name: 'Gestión de Identidad Digital',
      description: 'Implementación de sistema IAM centralizado con MFA y SSO para todos los sistemas del banco',
      startDate: new Date('2024-10-15'),
      endDate: new Date('2025-05-31'),
      responsibleUserId: usuarios[3].id,
      priority: 'high',
      status: 'in_progress',
      progress: 25,
      reminderDays: JSON.stringify([15, 7, 3]),
      createdBy: usuarios[0].id
    }
  ];

  const proyectos = [];
  for (const proyectoData of proyectosData) {
    const proyecto = await prisma.project.create({ data: proyectoData });
    proyectos.push(proyecto);
  }
  console.log(`✓ Creados ${proyectos.length} proyectos`);

  // Crear fases para los primeros 3 proyectos
  const fasesData = [
    // Fases para ISO 27001
    { projectId: proyectos[0].id, name: 'Análisis de Brechas', description: 'Evaluación inicial del estado actual vs requisitos ISO 27001', orderNum: 1, startDate: new Date('2024-01-15'), endDate: new Date('2024-03-31'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[0].id, name: 'Diseño del SGSI', description: 'Diseño del Sistema de Gestión de Seguridad de la Información', orderNum: 2, startDate: new Date('2024-04-01'), endDate: new Date('2024-07-31'), status: 'completed', weight: 25, progress: 100 },
    { projectId: proyectos[0].id, name: 'Implementación de Controles', description: 'Implementación de controles del Anexo A', orderNum: 3, startDate: new Date('2024-08-01'), endDate: new Date('2025-02-28'), status: 'in_progress', weight: 35, progress: 40 },
    { projectId: proyectos[0].id, name: 'Auditoría Interna', description: 'Auditoría interna pre-certificación', orderNum: 4, startDate: new Date('2025-03-01'), endDate: new Date('2025-04-30'), status: 'pending', weight: 10, progress: 0 },
    { projectId: proyectos[0].id, name: 'Certificación', description: 'Auditoría de certificación por organismo acreditado', orderNum: 5, startDate: new Date('2025-05-01'), endDate: new Date('2025-06-30'), status: 'pending', weight: 10, progress: 0 },

    // Fases para Migración Cloud
    { projectId: proyectos[1].id, name: 'Evaluación y Planeación', description: 'Assessment de infraestructura actual y plan de migración', orderNum: 1, startDate: new Date('2024-03-01'), endDate: new Date('2024-05-31'), status: 'completed', weight: 15, progress: 100 },
    { projectId: proyectos[1].id, name: 'Arquitectura Cloud', description: 'Diseño de arquitectura cloud segura y escalable', orderNum: 2, startDate: new Date('2024-06-01'), endDate: new Date('2024-08-31'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[1].id, name: 'Migración Ambiente Dev/QA', description: 'Migración de ambientes de desarrollo y pruebas', orderNum: 3, startDate: new Date('2024-09-01'), endDate: new Date('2024-12-31'), status: 'in_progress', weight: 25, progress: 45 },
    { projectId: proyectos[1].id, name: 'Migración Producción', description: 'Migración del ambiente productivo', orderNum: 4, startDate: new Date('2025-01-01'), endDate: new Date('2025-02-28'), status: 'pending', weight: 30, progress: 0 },
    { projectId: proyectos[1].id, name: 'Estabilización', description: 'Período de estabilización y optimización', orderNum: 5, startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31'), status: 'pending', weight: 10, progress: 0 },

    // Fases para AML/PLD
    { projectId: proyectos[2].id, name: 'Análisis Regulatorio', description: 'Revisión de nueva regulación y análisis de impacto', orderNum: 1, startDate: new Date('2024-06-01'), endDate: new Date('2024-07-15'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[2].id, name: 'Actualización de Políticas', description: 'Redacción de nuevas políticas y procedimientos', orderNum: 2, startDate: new Date('2024-07-16'), endDate: new Date('2024-09-30'), status: 'completed', weight: 30, progress: 100 },
    { projectId: proyectos[2].id, name: 'Capacitación', description: 'Capacitación al personal en nuevas políticas', orderNum: 3, startDate: new Date('2024-10-01'), endDate: new Date('2024-11-15'), status: 'in_progress', weight: 25, progress: 60 },
    { projectId: proyectos[2].id, name: 'Implementación Sistemas', description: 'Actualización de sistemas de monitoreo AML', orderNum: 4, startDate: new Date('2024-11-16'), endDate: new Date('2024-12-31'), status: 'pending', weight: 25, progress: 0 },

    // ========== FASES PARA NUEVOS PROYECTOS ==========

    // Fases para Modernización Banca Móvil (proyectos[8])
    { projectId: proyectos[8].id, name: 'Investigación UX', description: 'Investigación de usuarios y análisis de competencia', orderNum: 1, startDate: new Date('2024-10-01'), endDate: new Date('2024-11-15'), status: 'completed', weight: 15, progress: 100 },
    { projectId: proyectos[8].id, name: 'Diseño UI/UX', description: 'Diseño de interfaces y prototipos interactivos', orderNum: 2, startDate: new Date('2024-11-16'), endDate: new Date('2025-01-15'), status: 'in_progress', weight: 20, progress: 60 },
    { projectId: proyectos[8].id, name: 'Desarrollo Frontend', description: 'Desarrollo de nueva app móvil en React Native', orderNum: 3, startDate: new Date('2025-01-16'), endDate: new Date('2025-04-15'), status: 'pending', weight: 35, progress: 0 },
    { projectId: proyectos[8].id, name: 'Integración Backend', description: 'Integración con APIs y servicios existentes', orderNum: 4, startDate: new Date('2025-04-16'), endDate: new Date('2025-05-31'), status: 'pending', weight: 20, progress: 0 },
    { projectId: proyectos[8].id, name: 'Lanzamiento', description: 'Pruebas finales y lanzamiento en tiendas', orderNum: 5, startDate: new Date('2025-06-01'), endDate: new Date('2025-06-30'), status: 'pending', weight: 10, progress: 0 },

    // Fases para Centro de Operaciones de Seguridad SOC (proyectos[10])
    { projectId: proyectos[10].id, name: 'Diseño del SOC', description: 'Arquitectura física y lógica del centro de operaciones', orderNum: 1, startDate: new Date('2024-08-15'), endDate: new Date('2024-10-15'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[10].id, name: 'Implementación SIEM', description: 'Instalación y configuración de plataforma SIEM', orderNum: 2, startDate: new Date('2024-10-16'), endDate: new Date('2024-12-31'), status: 'in_progress', weight: 30, progress: 55 },
    { projectId: proyectos[10].id, name: 'Contratación y Capacitación', description: 'Reclutamiento y formación del equipo SOC', orderNum: 3, startDate: new Date('2025-01-01'), endDate: new Date('2025-02-28'), status: 'pending', weight: 25, progress: 0 },
    { projectId: proyectos[10].id, name: 'Operación Piloto', description: 'Operación piloto 24/7 con soporte externo', orderNum: 4, startDate: new Date('2025-03-01'), endDate: new Date('2025-04-30'), status: 'pending', weight: 25, progress: 0 },

    // Fases para Transformación Digital Sucursales (proyectos[11])
    { projectId: proyectos[11].id, name: 'Análisis de Procesos', description: 'Mapeo de procesos actuales en sucursales', orderNum: 1, startDate: new Date('2024-05-01'), endDate: new Date('2024-06-30'), status: 'completed', weight: 15, progress: 100 },
    { projectId: proyectos[11].id, name: 'Desarrollo Plataforma', description: 'Desarrollo de plataforma digital para sucursales', orderNum: 2, startDate: new Date('2024-07-01'), endDate: new Date('2024-10-31'), status: 'completed', weight: 35, progress: 100 },
    { projectId: proyectos[11].id, name: 'Piloto Sucursales', description: 'Implementación piloto en 10 sucursales', orderNum: 3, startDate: new Date('2024-11-01'), endDate: new Date('2024-12-31'), status: 'in_progress', weight: 25, progress: 45 },
    { projectId: proyectos[11].id, name: 'Rollout Nacional', description: 'Despliegue en todas las sucursales', orderNum: 4, startDate: new Date('2025-01-01'), endDate: new Date('2025-02-28'), status: 'pending', weight: 25, progress: 0 },

    // Fases para Modelo de Riesgo Crediticio ML (proyectos[12])
    { projectId: proyectos[12].id, name: 'Recolección de Datos', description: 'Extracción y preparación de datos históricos', orderNum: 1, startDate: new Date('2024-09-15'), endDate: new Date('2024-10-31'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[12].id, name: 'Desarrollo del Modelo', description: 'Entrenamiento y validación del modelo ML', orderNum: 2, startDate: new Date('2024-11-01'), endDate: new Date('2025-01-15'), status: 'in_progress', weight: 35, progress: 50 },
    { projectId: proyectos[12].id, name: 'Validación Regulatoria', description: 'Validación del modelo con áreas de riesgo y cumplimiento', orderNum: 3, startDate: new Date('2025-01-16'), endDate: new Date('2025-02-28'), status: 'pending', weight: 25, progress: 0 },
    { projectId: proyectos[12].id, name: 'Producción', description: 'Puesta en producción e integración con sistemas', orderNum: 4, startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31'), status: 'pending', weight: 20, progress: 0 },

    // Fases para Sistema Antifraude Tiempo Real (proyectos[14])
    { projectId: proyectos[14].id, name: 'Análisis de Fraudes', description: 'Análisis de patrones de fraude históricos', orderNum: 1, startDate: new Date('2024-06-15'), endDate: new Date('2024-07-31'), status: 'completed', weight: 15, progress: 100 },
    { projectId: proyectos[14].id, name: 'Desarrollo Motor de Reglas', description: 'Desarrollo del motor de reglas antifraude', orderNum: 2, startDate: new Date('2024-08-01'), endDate: new Date('2024-10-15'), status: 'completed', weight: 30, progress: 100 },
    { projectId: proyectos[14].id, name: 'Integración Canales', description: 'Integración con todos los canales digitales', orderNum: 3, startDate: new Date('2024-10-16'), endDate: new Date('2024-12-15'), status: 'in_progress', weight: 35, progress: 70 },
    { projectId: proyectos[14].id, name: 'Operación y Ajustes', description: 'Operación en producción y ajuste de umbrales', orderNum: 4, startDate: new Date('2024-12-16'), endDate: new Date('2025-01-15'), status: 'pending', weight: 20, progress: 0 },

    // Fases para Certificación PCI-DSS v4.0 (proyectos[15])
    { projectId: proyectos[15].id, name: 'Gap Analysis', description: 'Análisis de brechas vs PCI-DSS v4.0', orderNum: 1, startDate: new Date('2024-04-01'), endDate: new Date('2024-05-31'), status: 'completed', weight: 20, progress: 100 },
    { projectId: proyectos[15].id, name: 'Remediación', description: 'Implementación de controles faltantes', orderNum: 2, startDate: new Date('2024-06-01'), endDate: new Date('2024-09-30'), status: 'completed', weight: 40, progress: 100 },
    { projectId: proyectos[15].id, name: 'Pre-Auditoría', description: 'Evaluación interna pre-certificación', orderNum: 3, startDate: new Date('2024-10-01'), endDate: new Date('2024-11-15'), status: 'in_progress', weight: 20, progress: 65 },
    { projectId: proyectos[15].id, name: 'Certificación QSA', description: 'Auditoría por QSA certificador', orderNum: 4, startDate: new Date('2024-11-16'), endDate: new Date('2024-12-31'), status: 'pending', weight: 20, progress: 0 },

    // Fases para Gestión de Identidad Digital (proyectos[17])
    { projectId: proyectos[17].id, name: 'Evaluación IAM', description: 'Evaluación de soluciones IAM del mercado', orderNum: 1, startDate: new Date('2024-10-15'), endDate: new Date('2024-11-30'), status: 'completed', weight: 15, progress: 100 },
    { projectId: proyectos[17].id, name: 'Diseño Arquitectura', description: 'Diseño de arquitectura IAM centralizada', orderNum: 2, startDate: new Date('2024-12-01'), endDate: new Date('2025-01-15'), status: 'in_progress', weight: 20, progress: 40 },
    { projectId: proyectos[17].id, name: 'Implementación Core', description: 'Implementación de directorio y SSO', orderNum: 3, startDate: new Date('2025-01-16'), endDate: new Date('2025-03-31'), status: 'pending', weight: 35, progress: 0 },
    { projectId: proyectos[17].id, name: 'Migración Aplicaciones', description: 'Migración de aplicaciones al nuevo IAM', orderNum: 4, startDate: new Date('2025-04-01'), endDate: new Date('2025-05-31'), status: 'pending', weight: 30, progress: 0 }
  ];

  const fases = [];
  for (const faseData of fasesData) {
    const fase = await prisma.projectPhase.create({ data: faseData });
    fases.push(fase);
  }
  console.log(`✓ Creadas ${fases.length} fases de proyecto`);

  // Crear tareas para las fases
  const tareasData = [
    // Tareas para ISO 27001 - Fase Implementación de Controles
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Implementar control de acceso basado en roles', description: 'Configurar RBAC en todos los sistemas críticos', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-08-01'), dueDate: new Date('2024-09-30'), progress: 100, status: 'completed', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Documentar procedimientos de gestión de incidentes', description: 'Crear y documentar procedimientos según ISO 27001', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-09-01'), dueDate: new Date('2024-10-31'), progress: 80, status: 'in_progress', priority: 'medium', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Implementar cifrado de datos en reposo', description: 'Cifrar bases de datos y almacenamiento sensible', assignedTo: usuarios[4].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-01'), dueDate: new Date('2024-12-15'), progress: 45, status: 'in_progress', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Configurar monitoreo de seguridad 24/7', description: 'Implementar SIEM y configurar alertas', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-11-01'), dueDate: new Date('2025-01-31'), progress: 20, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Revisar y actualizar política de contraseñas', description: 'Alinear política con requisitos ISO 27001', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-01'), dueDate: new Date('2025-01-15'), progress: 0, status: 'pending', priority: 'medium', taskType: 'manual', createdBy: usuarios[3].id },

    // Tareas para Migración Cloud - Fase Migración Dev/QA
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Migrar base de datos de desarrollo', description: 'Migrar BD del ambiente de desarrollo a RDS', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2024-09-01'), dueDate: new Date('2024-09-30'), progress: 100, status: 'completed', priority: 'high', taskType: 'manual', createdBy: usuarios[0].id },
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Configurar pipelines CI/CD en cloud', description: 'Implementar Jenkins/GitLab CI en infraestructura cloud', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2024-10-01'), dueDate: new Date('2024-10-31'), progress: 70, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[0].id },
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Pruebas de rendimiento en cloud', description: 'Ejecutar pruebas de stress y rendimiento', assignedTo: usuarios[7].id, assignedBy: usuarios[4].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-11-30'), progress: 30, status: 'in_progress', priority: 'medium', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Documentar arquitectura cloud', description: 'Documentar arquitectura y diagramas de red', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2024-11-15'), dueDate: new Date('2024-12-15'), progress: 10, status: 'in_progress', priority: 'low', taskType: 'manual', createdBy: usuarios[0].id },

    // Tareas para AML/PLD - Fase Capacitación
    { projectId: proyectos[2].id, phaseId: fases[12].id, title: 'Desarrollar material de capacitación', description: 'Crear presentaciones y manuales para el personal', assignedTo: usuarios[8].id, assignedBy: usuarios[2].id, startDate: new Date('2024-10-01'), dueDate: new Date('2024-10-15'), progress: 100, status: 'completed', priority: 'high', taskType: 'manual', createdBy: usuarios[2].id },
    { projectId: proyectos[2].id, phaseId: fases[12].id, title: 'Capacitar a oficiales de cumplimiento', description: 'Sesiones de capacitación intensiva', assignedTo: usuarios[8].id, assignedBy: usuarios[2].id, startDate: new Date('2024-10-16'), dueDate: new Date('2024-10-31'), progress: 100, status: 'completed', priority: 'critical', taskType: 'manual', createdBy: usuarios[2].id },
    { projectId: proyectos[2].id, phaseId: fases[12].id, title: 'Capacitar a personal de sucursales', description: 'Capacitación masiva al personal de front', assignedTo: usuarios[9].id, assignedBy: usuarios[8].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-11-10'), progress: 60, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[8].id },
    { projectId: proyectos[2].id, phaseId: fases[12].id, title: 'Evaluar conocimiento adquirido', description: 'Aplicar evaluaciones post-capacitación', assignedTo: usuarios[8].id, assignedBy: usuarios[2].id, startDate: new Date('2024-11-11'), dueDate: new Date('2024-11-15'), progress: 0, status: 'pending', priority: 'medium', taskType: 'manual', createdBy: usuarios[2].id },

    // ========== TAREAS PARA NUEVOS PROYECTOS ==========

    // Tareas para Modernización Banca Móvil - Fase Diseño UI/UX (fases[15])
    { projectId: proyectos[8].id, phaseId: fases[15].id, title: 'Diseñar flujo de login biométrico', description: 'Diseño UX para autenticación con huella y facial', assignedTo: usuarios[7].id, assignedBy: usuarios[4].id, startDate: new Date('2024-11-16'), dueDate: new Date('2024-12-15'), progress: 100, status: 'completed', priority: 'high', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[8].id, phaseId: fases[15].id, title: 'Crear sistema de diseño', description: 'Definir componentes UI reutilizables', assignedTo: usuarios[7].id, assignedBy: usuarios[4].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-31'), progress: 80, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[8].id, phaseId: fases[15].id, title: 'Prototipar dashboard principal', description: 'Prototipo interactivo en Figma', assignedTo: usuarios[7].id, assignedBy: usuarios[4].id, startDate: new Date('2024-12-15'), dueDate: new Date('2025-01-10'), progress: 40, status: 'in_progress', priority: 'medium', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[8].id, phaseId: fases[15].id, title: 'Pruebas de usabilidad', description: 'Testing con usuarios reales', assignedTo: usuarios[9].id, assignedBy: usuarios[7].id, startDate: new Date('2025-01-05'), dueDate: new Date('2025-01-15'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[7].id },

    // Tareas para SOC - Fase Implementación SIEM (fases[20])
    { projectId: proyectos[10].id, phaseId: fases[20].id, title: 'Instalar plataforma Splunk', description: 'Instalación y configuración inicial de Splunk Enterprise', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-16'), dueDate: new Date('2024-11-15'), progress: 100, status: 'completed', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[10].id, phaseId: fases[20].id, title: 'Configurar fuentes de datos', description: 'Integrar logs de firewalls, AD, endpoints', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-11-16'), dueDate: new Date('2024-12-15'), progress: 70, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[10].id, phaseId: fases[20].id, title: 'Desarrollar casos de uso', description: 'Crear reglas de correlación y alertas', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-31'), progress: 35, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[10].id, phaseId: fases[20].id, title: 'Crear dashboards operativos', description: 'Dashboards para analistas SOC', assignedTo: usuarios[7].id, assignedBy: usuarios[6].id, startDate: new Date('2024-12-15'), dueDate: new Date('2024-12-31'), progress: 20, status: 'in_progress', priority: 'medium', taskType: 'manual', createdBy: usuarios[6].id },

    // Tareas para Transformación Digital - Fase Piloto (fases[25])
    { projectId: proyectos[11].id, phaseId: fases[25].id, title: 'Desplegar en sucursales piloto', description: 'Instalación en 10 sucursales seleccionadas', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-11-30'), progress: 100, status: 'completed', priority: 'critical', taskType: 'manual', createdBy: usuarios[0].id },
    { projectId: proyectos[11].id, phaseId: fases[25].id, title: 'Capacitar personal de piloto', description: 'Entrenamiento a ejecutivos de sucursales', assignedTo: usuarios[9].id, assignedBy: usuarios[4].id, startDate: new Date('2024-11-15'), dueDate: new Date('2024-12-05'), progress: 80, status: 'in_review', priority: 'high', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[11].id, phaseId: fases[25].id, title: 'Monitorear adopción', description: 'Seguimiento de métricas de uso', assignedTo: usuarios[7].id, assignedBy: usuarios[4].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-31'), progress: 30, status: 'in_progress', priority: 'medium', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[11].id, phaseId: fases[25].id, title: 'Documentar lecciones aprendidas', description: 'Recopilar feedback y mejoras', assignedTo: usuarios[9].id, assignedBy: usuarios[4].id, startDate: new Date('2024-12-20'), dueDate: new Date('2024-12-31'), progress: 0, status: 'pending', priority: 'low', taskType: 'manual', createdBy: usuarios[4].id },

    // Tareas para Modelo ML - Fase Desarrollo (fases[28])
    { projectId: proyectos[12].id, phaseId: fases[28].id, title: 'Feature engineering', description: 'Desarrollo de variables predictivas', assignedTo: usuarios[7].id, assignedBy: usuarios[5].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-11-30'), progress: 100, status: 'completed', priority: 'high', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[12].id, phaseId: fases[28].id, title: 'Entrenamiento de modelos', description: 'Pruebas con XGBoost, Random Forest, Neural Networks', assignedTo: usuarios[7].id, assignedBy: usuarios[5].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-31'), progress: 60, status: 'in_progress', priority: 'critical', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[12].id, phaseId: fases[28].id, title: 'Validación cruzada', description: 'Cross-validation y tuning de hiperparámetros', assignedTo: usuarios[7].id, assignedBy: usuarios[5].id, startDate: new Date('2025-01-01'), dueDate: new Date('2025-01-10'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[12].id, phaseId: fases[28].id, title: 'Documentar modelo ganador', description: 'Documentación técnica y explicabilidad', assignedTo: usuarios[7].id, assignedBy: usuarios[5].id, startDate: new Date('2025-01-11'), dueDate: new Date('2025-01-15'), progress: 0, status: 'pending', priority: 'medium', taskType: 'manual', createdBy: usuarios[5].id },

    // Tareas para Sistema Antifraude - Fase Integración (fases[33])
    { projectId: proyectos[14].id, phaseId: fases[33].id, title: 'Integrar con banca móvil', description: 'API de scoring en tiempo real para app móvil', assignedTo: usuarios[4].id, assignedBy: usuarios[5].id, startDate: new Date('2024-10-16'), dueDate: new Date('2024-11-15'), progress: 100, status: 'completed', priority: 'critical', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[14].id, phaseId: fases[33].id, title: 'Integrar con banca web', description: 'Integración con portal de banca en línea', assignedTo: usuarios[4].id, assignedBy: usuarios[5].id, startDate: new Date('2024-11-16'), dueDate: new Date('2024-12-05'), progress: 90, status: 'in_review', priority: 'critical', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[14].id, phaseId: fases[33].id, title: 'Integrar con ATMs', description: 'Conexión con red de cajeros automáticos', assignedTo: usuarios[4].id, assignedBy: usuarios[5].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-15'), progress: 50, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[5].id },
    { projectId: proyectos[14].id, phaseId: fases[33].id, title: 'Pruebas E2E de fraude', description: 'Pruebas end-to-end con escenarios de fraude', assignedTo: usuarios[7].id, assignedBy: usuarios[5].id, startDate: new Date('2024-12-10'), dueDate: new Date('2024-12-15'), progress: 20, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[5].id },

    // Tareas para PCI-DSS - Fase Pre-Auditoría (fases[37])
    { projectId: proyectos[15].id, phaseId: fases[37].id, title: 'Ejecutar escaneos ASV', description: 'Escaneos de vulnerabilidades trimestrales', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-01'), dueDate: new Date('2024-10-15'), progress: 100, status: 'completed', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[15].id, phaseId: fases[37].id, title: 'Remediar hallazgos críticos', description: 'Corregir vulnerabilidades identificadas', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-16'), dueDate: new Date('2024-11-05'), progress: 85, status: 'in_progress', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[15].id, phaseId: fases[37].id, title: 'Preparar evidencias', description: 'Compilar evidencias para cada requisito', assignedTo: usuarios[7].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-20'), dueDate: new Date('2024-11-10'), progress: 60, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[15].id, phaseId: fases[37].id, title: 'Simulacro de auditoría', description: 'Ensayo interno de entrevistas QSA', assignedTo: usuarios[3].id, assignedBy: usuarios[0].id, startDate: new Date('2024-11-10'), dueDate: new Date('2024-11-15'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[0].id },

    // Tareas para Identidad Digital - Fase Diseño (fases[40])
    { projectId: proyectos[17].id, phaseId: fases[40].id, title: 'Definir políticas de acceso', description: 'Documentar políticas de acceso por rol', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-20'), progress: 70, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[17].id, phaseId: fases[40].id, title: 'Diseñar flujo MFA', description: 'Arquitectura de autenticación multifactor', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-10'), dueDate: new Date('2024-12-31'), progress: 40, status: 'in_progress', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[17].id, phaseId: fases[40].id, title: 'Evaluar proveedores IdP', description: 'Análisis de Okta, Azure AD, Ping', assignedTo: usuarios[4].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-15'), dueDate: new Date('2025-01-10'), progress: 15, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[17].id, phaseId: fases[40].id, title: 'POC con proveedor seleccionado', description: 'Prueba de concepto con 3 aplicaciones', assignedTo: usuarios[4].id, assignedBy: usuarios[3].id, startDate: new Date('2025-01-05'), dueDate: new Date('2025-01-15'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id }
  ];

  const tareas = [];
  for (const tareaData of tareasData) {
    const tarea = await prisma.task.create({ data: tareaData });
    tareas.push(tarea);
  }
  console.log(`✓ Creadas ${tareas.length} tareas de proyecto`);

  // ============================================================
  // Crear KPIs de Proyectos
  // ============================================================
  const kpisProyectoData = [
    // KPIs para ISO 27001
    { projectId: proyectos[0].id, name: 'Controles Implementados', description: 'Porcentaje de controles ISO 27001 implementados', targetValue: 114, currentValue: 68, unit: 'controles', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[0].id, name: 'Vulnerabilidades Críticas', description: 'Número de vulnerabilidades críticas abiertas', targetValue: 0, currentValue: 3, unit: 'vulnerabilidades', formulaType: 'count', status: 'at_risk' },
    { projectId: proyectos[0].id, name: 'Cobertura de Capacitación', description: 'Empleados capacitados en seguridad', targetValue: 100, currentValue: 78, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[0].id, name: 'Cumplimiento Anexo A', description: 'Cumplimiento de controles del Anexo A', targetValue: 95, currentValue: 72, unit: '%', formulaType: 'percentage', status: 'on_track' },

    // KPIs para Migración Cloud
    { projectId: proyectos[1].id, name: 'Servicios Migrados', description: 'Porcentaje de servicios migrados a cloud', targetValue: 100, currentValue: 45, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[1].id, name: 'Disponibilidad', description: 'SLA de disponibilidad del servicio', targetValue: 99.9, currentValue: 99.7, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[1].id, name: 'Reducción Costos Infra', description: 'Ahorro en costos de infraestructura', targetValue: 30, currentValue: 18, unit: '%', formulaType: 'percentage', status: 'at_risk' },
    { projectId: proyectos[1].id, name: 'Tiempo de Despliegue', description: 'Tiempo promedio de despliegue', targetValue: 15, currentValue: 25, unit: 'minutos', formulaType: 'average', status: 'off_track' },

    // KPIs para AML/PLD
    { projectId: proyectos[2].id, name: 'Personal Capacitado', description: 'Personal capacitado en nuevas políticas', targetValue: 500, currentValue: 380, unit: 'empleados', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[2].id, name: 'Alertas Procesadas', description: 'Alertas AML procesadas en tiempo', targetValue: 98, currentValue: 94, unit: '%', formulaType: 'percentage', status: 'at_risk' },
    { projectId: proyectos[2].id, name: 'Falsos Positivos', description: 'Reducción de falsos positivos', targetValue: 40, currentValue: 28, unit: '%', formulaType: 'percentage', status: 'on_track' },

    // KPIs para SOC 2
    { projectId: proyectos[5].id, name: 'Políticas Documentadas', description: 'Políticas SOC 2 documentadas', targetValue: 45, currentValue: 22, unit: 'políticas', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[5].id, name: 'Evidencias Recolectadas', description: 'Evidencias para auditoría', targetValue: 200, currentValue: 85, unit: 'evidencias', formulaType: 'count', status: 'on_track' },

    // KPIs para Evaluación Proveedores
    { projectId: proyectos[6].id, name: 'Proveedores Evaluados', description: 'Proveedores críticos evaluados', targetValue: 25, currentValue: 18, unit: 'proveedores', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[6].id, name: 'Score Promedio', description: 'Score promedio de proveedores', targetValue: 80, currentValue: 75, unit: 'puntos', formulaType: 'average', status: 'on_track' },

    // ========== KPIs PARA NUEVOS PROYECTOS ==========

    // KPIs para Modernización Banca Móvil
    { projectId: proyectos[8].id, name: 'Diseño Completado', description: 'Porcentaje de pantallas diseñadas', targetValue: 100, currentValue: 60, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[8].id, name: 'NPS Objetivo', description: 'Net Promoter Score objetivo', targetValue: 70, currentValue: 0, unit: 'puntos', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[8].id, name: 'Tiempo Carga App', description: 'Tiempo de carga inicial de la app', targetValue: 2, currentValue: 0, unit: 'segundos', formulaType: 'average', status: 'on_track' },

    // KPIs para Centro de Operaciones SOC
    { projectId: proyectos[10].id, name: 'Fuentes Integradas', description: 'Fuentes de logs integradas al SIEM', targetValue: 50, currentValue: 28, unit: 'fuentes', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[10].id, name: 'MTTD', description: 'Tiempo medio de detección de amenazas', targetValue: 15, currentValue: 45, unit: 'minutos', formulaType: 'average', status: 'off_track' },
    { projectId: proyectos[10].id, name: 'MTTR', description: 'Tiempo medio de respuesta a incidentes', targetValue: 60, currentValue: 120, unit: 'minutos', formulaType: 'average', status: 'at_risk' },
    { projectId: proyectos[10].id, name: 'Casos de Uso Activos', description: 'Reglas de correlación activas', targetValue: 100, currentValue: 35, unit: 'casos', formulaType: 'count', status: 'on_track' },

    // KPIs para Transformación Digital Sucursales
    { projectId: proyectos[11].id, name: 'Sucursales Digitalizadas', description: 'Sucursales con nueva plataforma', targetValue: 200, currentValue: 10, unit: 'sucursales', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[11].id, name: 'Reducción Papel', description: 'Reducción en uso de papel', targetValue: 80, currentValue: 45, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[11].id, name: 'Tiempo Atención', description: 'Reducción tiempo de atención', targetValue: 40, currentValue: 25, unit: '%', formulaType: 'percentage', status: 'on_track' },

    // KPIs para Modelo de Riesgo Crediticio ML
    { projectId: proyectos[12].id, name: 'AUC-ROC', description: 'Área bajo la curva ROC', targetValue: 0.85, currentValue: 0.78, unit: 'score', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[12].id, name: 'Precisión', description: 'Precisión del modelo', targetValue: 90, currentValue: 82, unit: '%', formulaType: 'percentage', status: 'at_risk' },
    { projectId: proyectos[12].id, name: 'Recall', description: 'Sensibilidad del modelo', targetValue: 85, currentValue: 79, unit: '%', formulaType: 'percentage', status: 'on_track' },

    // KPIs para Sistema Antifraude
    { projectId: proyectos[14].id, name: 'Transacciones Analizadas', description: 'Transacciones analizadas en tiempo real', targetValue: 100, currentValue: 85, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[14].id, name: 'Tasa Detección Fraude', description: 'Fraudes detectados vs total', targetValue: 95, currentValue: 88, unit: '%', formulaType: 'percentage', status: 'at_risk' },
    { projectId: proyectos[14].id, name: 'Falsos Positivos', description: 'Tasa de falsos positivos', targetValue: 5, currentValue: 8, unit: '%', formulaType: 'percentage', status: 'off_track' },
    { projectId: proyectos[14].id, name: 'Tiempo Respuesta', description: 'Tiempo de scoring por transacción', targetValue: 100, currentValue: 85, unit: 'ms', formulaType: 'average', status: 'on_track' },

    // KPIs para PCI-DSS v4.0
    { projectId: proyectos[15].id, name: 'Requisitos Cumplidos', description: 'Requisitos PCI-DSS cumplidos', targetValue: 300, currentValue: 245, unit: 'requisitos', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[15].id, name: 'Vulnerabilidades Abiertas', description: 'Vulnerabilidades críticas sin remediar', targetValue: 0, currentValue: 5, unit: 'vulnerabilidades', formulaType: 'count', status: 'at_risk' },
    { projectId: proyectos[15].id, name: 'Cobertura Escaneos', description: 'Sistemas escaneados trimestralmente', targetValue: 100, currentValue: 92, unit: '%', formulaType: 'percentage', status: 'on_track' },

    // KPIs para Gestión Identidad Digital
    { projectId: proyectos[17].id, name: 'Aplicaciones Integradas', description: 'Aplicaciones con SSO', targetValue: 50, currentValue: 8, unit: 'apps', formulaType: 'count', status: 'on_track' },
    { projectId: proyectos[17].id, name: 'Usuarios MFA', description: 'Usuarios con MFA habilitado', targetValue: 100, currentValue: 0, unit: '%', formulaType: 'percentage', status: 'on_track' },
    { projectId: proyectos[17].id, name: 'Tiempo Provisioning', description: 'Tiempo de alta de usuarios', targetValue: 1, currentValue: 24, unit: 'horas', formulaType: 'average', status: 'off_track' }
  ];

  await prisma.projectKPI.createMany({ data: kpisProyectoData });
  console.log(`✓ Creados ${kpisProyectoData.length} KPIs de proyecto`);

  // ============================================================
  // Crear Objetivos de Proyectos
  // ============================================================
  const objetivosProyectoData = [
    // Objetivos ISO 27001
    { projectId: proyectos[0].id, description: 'Lograr certificación ISO 27001:2022 antes del cierre fiscal', category: 'specific', status: 'in_progress', targetDate: new Date('2025-06-30') },
    { projectId: proyectos[0].id, description: 'Implementar el 100% de controles del Anexo A aplicables', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-02-28') },
    { projectId: proyectos[0].id, description: 'Reducir incidentes de seguridad en un 50%', category: 'achievable', status: 'pending', targetDate: new Date('2025-06-30') },
    { projectId: proyectos[0].id, description: 'Alinear prácticas con estándares internacionales', category: 'relevant', status: 'in_progress' },
    { projectId: proyectos[0].id, description: 'Completar pre-auditoría en Q1 2025', category: 'time_bound', status: 'pending', targetDate: new Date('2025-03-31') },

    // Objetivos Migración Cloud
    { projectId: proyectos[1].id, description: 'Migrar 100% de aplicaciones críticas a la nube', category: 'specific', status: 'in_progress', targetDate: new Date('2025-02-28') },
    { projectId: proyectos[1].id, description: 'Mantener SLA de 99.9% durante y después de la migración', category: 'measurable', status: 'in_progress' },
    { projectId: proyectos[1].id, description: 'Reducir costos de infraestructura en 30%', category: 'achievable', status: 'pending', targetDate: new Date('2025-03-31') },
    { projectId: proyectos[1].id, description: 'Cumplir con regulaciones CNBV para operación en nube', category: 'relevant', status: 'achieved', completedDate: new Date('2024-08-15') },

    // Objetivos AML/PLD
    { projectId: proyectos[2].id, description: 'Actualizar 100% de políticas AML conforme a nueva regulación', category: 'specific', status: 'achieved', completedDate: new Date('2024-09-30') },
    { projectId: proyectos[2].id, description: 'Capacitar al 100% del personal en nuevas políticas', category: 'measurable', status: 'in_progress', targetDate: new Date('2024-11-15') },
    { projectId: proyectos[2].id, description: 'Reducir falsos positivos en alertas AML en 40%', category: 'achievable', status: 'in_progress', targetDate: new Date('2024-12-31') },

    // Objetivos SOC 2
    { projectId: proyectos[5].id, description: 'Obtener certificación SOC 2 Type II', category: 'specific', status: 'pending', targetDate: new Date('2025-07-31') },
    { projectId: proyectos[5].id, description: 'Documentar todos los controles de seguridad, disponibilidad y confidencialidad', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-03-31') },

    // ========== OBJETIVOS PARA NUEVOS PROYECTOS ==========

    // Objetivos Modernización Banca Móvil
    { projectId: proyectos[8].id, description: 'Lanzar nueva app móvil en tiendas iOS y Android', category: 'specific', status: 'pending', targetDate: new Date('2025-06-30') },
    { projectId: proyectos[8].id, description: 'Alcanzar NPS de 70 puntos en primeros 3 meses', category: 'measurable', status: 'pending', targetDate: new Date('2025-09-30') },
    { projectId: proyectos[8].id, description: 'Reducir tiempo de carga a menos de 2 segundos', category: 'achievable', status: 'pending' },
    { projectId: proyectos[8].id, description: 'Mejorar experiencia de usuarios móviles del banco', category: 'relevant', status: 'in_progress' },

    // Objetivos Centro de Operaciones SOC
    { projectId: proyectos[10].id, description: 'Operar SOC 24/7 con equipo interno', category: 'specific', status: 'pending', targetDate: new Date('2025-04-30') },
    { projectId: proyectos[10].id, description: 'Reducir MTTD a menos de 15 minutos', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-04-30') },
    { projectId: proyectos[10].id, description: 'Integrar 50 fuentes de logs al SIEM', category: 'achievable', status: 'in_progress', targetDate: new Date('2025-02-28') },
    { projectId: proyectos[10].id, description: 'Mejorar postura de seguridad del banco', category: 'relevant', status: 'in_progress' },

    // Objetivos Transformación Digital Sucursales
    { projectId: proyectos[11].id, description: 'Digitalizar 200 sucursales a nivel nacional', category: 'specific', status: 'in_progress', targetDate: new Date('2025-02-28') },
    { projectId: proyectos[11].id, description: 'Reducir uso de papel en 80%', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-02-28') },
    { projectId: proyectos[11].id, description: 'Reducir tiempo de atención al cliente en 40%', category: 'achievable', status: 'in_progress' },
    { projectId: proyectos[11].id, description: 'Completar piloto exitoso en Q4 2024', category: 'time_bound', status: 'in_progress', targetDate: new Date('2024-12-31') },

    // Objetivos Modelo de Riesgo Crediticio ML
    { projectId: proyectos[12].id, description: 'Poner en producción modelo de scoring ML', category: 'specific', status: 'pending', targetDate: new Date('2025-03-31') },
    { projectId: proyectos[12].id, description: 'Alcanzar AUC-ROC mínimo de 0.85', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-01-15') },
    { projectId: proyectos[12].id, description: 'Reducir tasa de morosidad en 15%', category: 'achievable', status: 'pending', targetDate: new Date('2025-06-30') },
    { projectId: proyectos[12].id, description: 'Obtener aprobación regulatoria del modelo', category: 'relevant', status: 'pending', targetDate: new Date('2025-02-28') },

    // Objetivos Sistema Antifraude
    { projectId: proyectos[14].id, description: 'Analizar 100% de transacciones digitales en tiempo real', category: 'specific', status: 'in_progress', targetDate: new Date('2025-01-15') },
    { projectId: proyectos[14].id, description: 'Alcanzar tasa de detección de fraude del 95%', category: 'measurable', status: 'in_progress', targetDate: new Date('2025-01-15') },
    { projectId: proyectos[14].id, description: 'Reducir falsos positivos a menos del 5%', category: 'achievable', status: 'in_progress' },
    { projectId: proyectos[14].id, description: 'Proteger a clientes contra fraude digital', category: 'relevant', status: 'achieved', completedDate: new Date('2024-10-15') },

    // Objetivos PCI-DSS v4.0
    { projectId: proyectos[15].id, description: 'Obtener certificación PCI-DSS v4.0', category: 'specific', status: 'in_progress', targetDate: new Date('2024-12-31') },
    { projectId: proyectos[15].id, description: 'Cumplir 100% de requisitos PCI-DSS v4.0', category: 'measurable', status: 'in_progress', targetDate: new Date('2024-11-15') },
    { projectId: proyectos[15].id, description: 'Remediar todas las vulnerabilidades críticas', category: 'achievable', status: 'in_progress', targetDate: new Date('2024-11-05') },
    { projectId: proyectos[15].id, description: 'Completar pre-auditoría exitosa', category: 'time_bound', status: 'in_progress', targetDate: new Date('2024-11-15') },

    // Objetivos Gestión Identidad Digital
    { projectId: proyectos[17].id, description: 'Implementar IAM centralizado para todas las aplicaciones', category: 'specific', status: 'pending', targetDate: new Date('2025-05-31') },
    { projectId: proyectos[17].id, description: 'Habilitar MFA para 100% de usuarios', category: 'measurable', status: 'pending', targetDate: new Date('2025-05-31') },
    { projectId: proyectos[17].id, description: 'Reducir tiempo de provisioning a 1 hora', category: 'achievable', status: 'pending' },
    { projectId: proyectos[17].id, description: 'Mejorar seguridad de acceso a sistemas del banco', category: 'relevant', status: 'in_progress' }
  ];

  await prisma.projectObjective.createMany({ data: objetivosProyectoData });
  console.log(`✓ Creados ${objetivosProyectoData.length} objetivos de proyecto`);

  // ============================================================
  // Agregar más tareas para mejor visualización del Kanban
  // ============================================================
  const tareasAdicionalesData = [
    // Más tareas para ISO 27001 con diferentes estados
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Definir política de clasificación de datos', description: 'Crear esquema de clasificación de información', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2024-12-15'), dueDate: new Date('2025-01-30'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Implementar gestión de logs centralizados', description: 'Configurar sistema de logs centralizado con retención de 1 año', assignedTo: usuarios[4].id, assignedBy: usuarios[3].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-12-31'), progress: 65, status: 'in_review', priority: 'high', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[2].id, title: 'Validar controles de acceso físico', description: 'Verificar controles de acceso a data centers', assignedTo: usuarios[7].id, assignedBy: usuarios[3].id, startDate: new Date('2024-10-15'), dueDate: new Date('2024-11-30'), progress: 0, status: 'blocked', priority: 'medium', taskType: 'manual', createdBy: usuarios[3].id },
    { projectId: proyectos[0].id, phaseId: fases[3].id, title: 'Preparar documentación para auditoría', description: 'Compilar evidencias y documentación para pre-auditoría', assignedTo: usuarios[6].id, assignedBy: usuarios[3].id, startDate: new Date('2025-02-15'), dueDate: new Date('2025-03-15'), progress: 0, status: 'pending', priority: 'critical', taskType: 'manual', createdBy: usuarios[3].id },

    // Más tareas para Migración Cloud
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Configurar WAF en ambiente cloud', description: 'Implementar Web Application Firewall para proteger aplicaciones', assignedTo: usuarios[6].id, assignedBy: usuarios[4].id, startDate: new Date('2024-10-15'), dueDate: new Date('2024-11-15'), progress: 90, status: 'in_review', priority: 'critical', taskType: 'manual', createdBy: usuarios[4].id },
    { projectId: proyectos[1].id, phaseId: fases[7].id, title: 'Migrar servicios de autenticación', description: 'Migrar SSO y servicios de autenticación a cloud', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2024-11-01'), dueDate: new Date('2024-12-15'), progress: 25, status: 'in_progress', priority: 'critical', taskType: 'manual', createdBy: usuarios[0].id },
    { projectId: proyectos[1].id, phaseId: fases[8].id, title: 'Plan de rollback para producción', description: 'Documentar y probar plan de rollback en caso de fallo', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2025-01-01'), dueDate: new Date('2025-01-15'), progress: 0, status: 'pending', priority: 'high', taskType: 'manual', createdBy: usuarios[0].id },
    { projectId: proyectos[1].id, phaseId: fases[8].id, title: 'Migración de bases de datos productivas', description: 'Migrar BD Oracle y SQL Server a cloud', assignedTo: usuarios[4].id, assignedBy: usuarios[0].id, startDate: new Date('2025-01-15'), dueDate: new Date('2025-02-15'), progress: 0, status: 'pending', priority: 'critical', taskType: 'manual', createdBy: usuarios[0].id },

    // Más tareas para AML/PLD
    { projectId: proyectos[2].id, phaseId: fases[13].id, title: 'Actualizar reglas de monitoreo transaccional', description: 'Configurar nuevas reglas en sistema de monitoreo AML', assignedTo: usuarios[8].id, assignedBy: usuarios[2].id, startDate: new Date('2024-11-16'), dueDate: new Date('2024-12-15'), progress: 15, status: 'in_progress', priority: 'high', taskType: 'manual', createdBy: usuarios[2].id },
    { projectId: proyectos[2].id, phaseId: fases[13].id, title: 'Integrar con base de datos de sanciones', description: 'Conectar sistema con listas internacionales de sanciones', assignedTo: usuarios[4].id, assignedBy: usuarios[8].id, startDate: new Date('2024-12-01'), dueDate: new Date('2024-12-20'), progress: 0, status: 'pending', priority: 'critical', taskType: 'manual', createdBy: usuarios[8].id },
    { projectId: proyectos[2].id, phaseId: fases[13].id, title: 'Pruebas de rendimiento sistema AML', description: 'Validar rendimiento con carga de producción', assignedTo: usuarios[7].id, assignedBy: usuarios[8].id, startDate: new Date('2024-12-15'), dueDate: new Date('2024-12-30'), progress: 0, status: 'pending', priority: 'medium', taskType: 'manual', createdBy: usuarios[8].id }
  ];

  for (const tareaData of tareasAdicionalesData) {
    await prisma.task.create({ data: tareaData });
  }
  console.log(`✓ Creadas ${tareasAdicionalesData.length} tareas adicionales`);

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
  console.log('   - 4 alertas de cumplimiento');
  console.log('   - 9 reglas de notificación');
  console.log('   - 3 reglas de alertas por umbral');
  console.log('   - 3 reglas de vencimiento');
  console.log('   - 5 notificaciones de ejemplo');
  console.log('   - 18 proyectos');
  console.log('   - 45 fases de proyecto');
  console.log('   - 65+ tareas de proyecto');
  console.log('   - 40 KPIs de proyecto');
  console.log('   - 45 objetivos de proyecto\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
