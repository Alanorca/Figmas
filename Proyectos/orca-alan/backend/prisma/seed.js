const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // ============================================================
  // Crear Permisos
  // ============================================================
  const permisos = await Promise.all([
    // Gestión de Usuarios
    prisma.permiso.create({
      data: {
        codigo: 'USR_VIEW',
        nombre: 'Ver Usuarios',
        descripcion: 'Permite visualizar la lista de usuarios',
        modulo: 'usuarios',
        categoria: 'gestion_usuarios'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'USR_CREATE',
        nombre: 'Crear Usuarios',
        descripcion: 'Permite crear nuevos usuarios',
        modulo: 'usuarios',
        categoria: 'gestion_usuarios'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'USR_EDIT',
        nombre: 'Editar Usuarios',
        descripcion: 'Permite modificar usuarios existentes',
        modulo: 'usuarios',
        categoria: 'gestion_usuarios'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'USR_DELETE',
        nombre: 'Eliminar Usuarios',
        descripcion: 'Permite eliminar usuarios',
        modulo: 'usuarios',
        categoria: 'gestion_usuarios'
      }
    }),

    // Gestión de Roles
    prisma.permiso.create({
      data: {
        codigo: 'ROL_VIEW',
        nombre: 'Ver Roles',
        descripcion: 'Permite visualizar roles y permisos',
        modulo: 'roles',
        categoria: 'gestion_roles'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'ROL_CREATE',
        nombre: 'Crear Roles',
        descripcion: 'Permite crear nuevos roles',
        modulo: 'roles',
        categoria: 'gestion_roles'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'ROL_EDIT',
        nombre: 'Editar Roles',
        descripcion: 'Permite modificar roles existentes',
        modulo: 'roles',
        categoria: 'gestion_roles'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'ROL_DELETE',
        nombre: 'Eliminar Roles',
        descripcion: 'Permite eliminar roles',
        modulo: 'roles',
        categoria: 'gestion_roles'
      }
    }),

    // Organizaciones
    prisma.permiso.create({
      data: {
        codigo: 'ORG_VIEW',
        nombre: 'Ver Organizaciones',
        descripcion: 'Permite visualizar organizaciones',
        modulo: 'organizaciones',
        categoria: 'gestion_activos'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'ORG_CREATE',
        nombre: 'Crear Organizaciones',
        descripcion: 'Permite crear nuevas organizaciones',
        modulo: 'organizaciones',
        categoria: 'gestion_activos'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'ORG_EDIT',
        nombre: 'Editar Organizaciones',
        descripcion: 'Permite modificar organizaciones',
        modulo: 'organizaciones',
        categoria: 'gestion_activos'
      }
    }),

    // Gestión de Riesgos
    prisma.permiso.create({
      data: {
        codigo: 'RSK_VIEW',
        nombre: 'Ver Riesgos',
        descripcion: 'Permite visualizar el inventario de riesgos',
        modulo: 'riesgos',
        categoria: 'gestion_riesgos'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'RSK_EDIT',
        nombre: 'Gestionar Riesgos',
        descripcion: 'Permite crear y modificar riesgos',
        modulo: 'riesgos',
        categoria: 'gestion_riesgos'
      }
    }),

    // Cumplimiento
    prisma.permiso.create({
      data: {
        codigo: 'CMP_VIEW',
        nombre: 'Ver Cumplimiento',
        descripcion: 'Acceso a módulo de cumplimiento',
        modulo: 'cumplimiento',
        categoria: 'gestion_cumplimiento'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'CMP_MANAGE',
        nombre: 'Gestionar Cumplimiento',
        descripcion: 'Gestión completa de cuestionarios y evaluaciones',
        modulo: 'cumplimiento',
        categoria: 'gestion_cumplimiento'
      }
    }),

    // Auditoría
    prisma.permiso.create({
      data: {
        codigo: 'AUD_VIEW',
        nombre: 'Ver Auditorías',
        descripcion: 'Acceso a informes de auditoría',
        modulo: 'auditoria',
        categoria: 'auditoria'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'AUD_EXPORT',
        nombre: 'Exportar Auditorías',
        descripcion: 'Permite exportar logs de auditoría',
        modulo: 'auditoria',
        categoria: 'auditoria'
      }
    }),

    // Reportes
    prisma.permiso.create({
      data: {
        codigo: 'RPT_VIEW',
        nombre: 'Ver Reportes',
        descripcion: 'Acceso a reportes y dashboards',
        modulo: 'reportes',
        categoria: 'reportes'
      }
    }),
    prisma.permiso.create({
      data: {
        codigo: 'RPT_EXPORT',
        nombre: 'Exportar Reportes',
        descripcion: 'Permite exportar reportes',
        modulo: 'reportes',
        categoria: 'reportes'
      }
    })
  ]);

  console.log(`Creados ${permisos.length} permisos`);

  // ============================================================
  // Crear Módulos
  // ============================================================
  const modulos = await Promise.all([
    prisma.modulo.create({
      data: {
        nombre: 'Usuarios',
        descripcion: 'Gestión de usuarios del sistema',
        icono: 'pi-users',
        orden: 1,
        permisoCreacion: true,
        permisoEdicion: true,
        permisoVisualizacion: true,
        permisoEliminacion: true
      }
    }),
    prisma.modulo.create({
      data: {
        nombre: 'Roles',
        descripcion: 'Gestión de roles y permisos',
        icono: 'pi-shield',
        orden: 2,
        permisoCreacion: true,
        permisoEdicion: true,
        permisoVisualizacion: true,
        permisoEliminacion: true
      }
    }),
    prisma.modulo.create({
      data: {
        nombre: 'Organizaciones',
        descripcion: 'Gestión de estructura organizacional',
        icono: 'pi-building',
        orden: 3,
        permisoCreacion: true,
        permisoEdicion: true,
        permisoVisualizacion: true,
        permisoEliminacion: false
      }
    })
  ]);

  console.log(`Creados ${modulos.length} módulos`);

  // ============================================================
  // Crear Roles
  // ============================================================
  const adminPermisos = permisos.map(p => ({ permisoId: p.id }));

  const roles = await Promise.all([
    prisma.rol.create({
      data: {
        nombre: 'Administrador',
        descripcion: 'Líder funcional responsable de la estrategia y operación completa del programa GRC, define políticas corporativas, gestiona esquemas y el cumplimiento normativo.',
        nivelAcceso: 'super_admin',
        region: 'GLOBAL',
        tipoArbol: 'ambos',
        color: '#ef4444',
        icono: 'pi-shield',
        esRolSistema: true,
        permisos: {
          create: adminPermisos
        }
      }
    }),
    prisma.rol.create({
      data: {
        nombre: 'Gestor de Áreas',
        descripcion: 'Administrador del programa GRC a nivel departamental/sucursal, establece políticas locales congruentes con la regulación, operativas y administrativas para cada división.',
        nivelAcceso: 'admin',
        region: 'MX',
        tipoArbol: 'activos',
        color: '#3b82f6',
        icono: 'pi-sitemap',
        permisos: {
          create: permisos.filter(p =>
            ['USR_VIEW', 'USR_EDIT', 'ROL_VIEW', 'ORG_VIEW', 'ORG_EDIT', 'RSK_VIEW', 'RSK_EDIT'].includes(p.codigo)
          ).map(p => ({ permisoId: p.id }))
        }
      }
    }),
    prisma.rol.create({
      data: {
        nombre: 'Operador',
        descripcion: 'Administrador del programa GRC a nivel departamental/sucursal, establece políticas locales congruentes con la regulación operativas y administrativas para cada división.',
        nivelAcceso: 'escritura',
        region: 'MX',
        tipoArbol: 'activos',
        color: '#22c55e',
        icono: 'pi-cog',
        permisos: {
          create: permisos.filter(p =>
            ['USR_VIEW', 'ROL_VIEW', 'ORG_VIEW', 'RSK_VIEW', 'CMP_VIEW'].includes(p.codigo)
          ).map(p => ({ permisoId: p.id }))
        }
      }
    }),
    prisma.rol.create({
      data: {
        nombre: 'Coordinador',
        descripcion: 'Nivel directivo o táctico que supervisa estratégicamente todo el programa GRC, toma decisiones de alto nivel e implicaciones de negocio, coordina y reporta el estatus de riesgos de Gobernanza.',
        nivelAcceso: 'admin',
        region: 'LATAM',
        tipoArbol: 'procesos',
        color: '#f59e0b',
        icono: 'pi-users',
        permisos: {
          create: permisos.filter(p =>
            ['USR_VIEW', 'ROL_VIEW', 'ORG_VIEW', 'RSK_VIEW', 'RSK_EDIT', 'CMP_VIEW', 'CMP_MANAGE', 'RPT_VIEW'].includes(p.codigo)
          ).map(p => ({ permisoId: p.id }))
        }
      }
    }),
    prisma.rol.create({
      data: {
        nombre: 'Usuarios',
        descripcion: 'Responsable de las unidades de negocio asistenciales en controles operativos, monitoreos y gestión de equipos de respuesta.',
        nivelAcceso: 'lectura',
        region: 'MX',
        tipoArbol: 'activos',
        color: '#6366f1',
        icono: 'pi-user',
        permisos: {
          create: permisos.filter(p =>
            ['USR_VIEW', 'ROL_VIEW', 'ORG_VIEW'].includes(p.codigo)
          ).map(p => ({ permisoId: p.id }))
        }
      }
    }),
    prisma.rol.create({
      data: {
        nombre: 'Analista',
        descripcion: 'Especialista técnico en análisis de datos e investigación, realiza análisis estadísticos de riesgo, desarrolla modelos, métricas y reportes científicos para decisiones.',
        nivelAcceso: 'lectura',
        region: 'MX',
        tipoArbol: 'activos',
        color: '#8b5cf6',
        icono: 'pi-chart-line',
        permisos: {
          create: permisos.filter(p =>
            ['RSK_VIEW', 'CMP_VIEW', 'RPT_VIEW', 'RPT_EXPORT', 'AUD_VIEW'].includes(p.codigo)
          ).map(p => ({ permisoId: p.id }))
        }
      }
    })
  ]);

  console.log(`Creados ${roles.length} roles`);

  // ============================================================
  // Crear Usuarios
  // ============================================================
  const hashedPassword = await bcrypt.hash('password123', 10);

  const usuarios = await Promise.all([
    prisma.usuario.create({
      data: {
        nombre: 'Carlos',
        apellido: 'García Mendoza',
        email: 'carlos.garcia@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 1234 5678',
        estado: 'activo',
        departamento: 'Tecnología',
        cargo: 'Administrador de Sistemas',
        region: 'MX',
        autenticacionDosFactor: true,
        cambioPasswordRequerido: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'María',
        apellido: 'López Torres',
        email: 'maria.lopez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 2345 6789',
        estado: 'activo',
        departamento: 'Cumplimiento',
        cargo: 'Analista de Cumplimiento',
        region: 'MX',
        autenticacionDosFactor: true,
        cambioPasswordRequerido: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Roberto',
        apellido: 'Hernández Ruiz',
        email: 'roberto.hernandez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 3456 7890',
        estado: 'pendiente',
        departamento: 'Auditoría',
        cargo: 'Auditor Junior',
        region: 'MX',
        cambioPasswordRequerido: true
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Ana',
        apellido: 'Martínez Sánchez',
        email: 'ana.martinez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 4567 8901',
        estado: 'activo',
        departamento: 'Gerencia',
        cargo: 'Gerente de Operaciones',
        region: 'MX',
        autenticacionDosFactor: true,
        cambioPasswordRequerido: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Luis',
        apellido: 'Pérez Vega',
        email: 'luis.perez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 5678 9012',
        estado: 'inactivo',
        departamento: 'Riesgos',
        cargo: 'Analista de Riesgos',
        region: 'MX'
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Patricia',
        apellido: 'González Luna',
        email: 'patricia.gonzalez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 6789 0123',
        estado: 'activo',
        departamento: 'Cumplimiento',
        cargo: 'Coordinadora de Cumplimiento',
        region: 'LATAM',
        autenticacionDosFactor: true,
        cambioPasswordRequerido: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Fernando',
        apellido: 'Ramírez Ortiz',
        email: 'fernando.ramirez@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 7890 1234',
        estado: 'bloqueado',
        departamento: 'Tecnología',
        cargo: 'Desarrollador Senior',
        region: 'MX',
        intentosFallidos: 5
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Diana',
        apellido: 'Castro Morales',
        email: 'diana.castro@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 8901 2345',
        estado: 'activo',
        departamento: 'Dirección',
        cargo: 'Directora de Riesgos y Cumplimiento',
        region: 'GLOBAL',
        autenticacionDosFactor: true,
        cambioPasswordRequerido: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'George',
        apellido: 'Wilson Smith',
        email: 'george.wilson@empresa.com',
        password: hashedPassword,
        telefono: '+1 555 1234 567',
        estado: 'activo',
        departamento: 'Operaciones',
        cargo: 'Operations Manager',
        region: 'US',
        autenticacionDosFactor: true,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Laura',
        apellido: 'Díaz Wright',
        email: 'laura.diaz@empresa.com',
        password: hashedPassword,
        telefono: '+52 55 9012 3456',
        estado: 'activo',
        departamento: 'Riesgos',
        cargo: 'Head Risk Analyst',
        region: 'MX',
        autenticacionDosFactor: false,
        ultimoAcceso: new Date()
      }
    }),
    prisma.usuario.create({
      data: {
        nombre: 'Michael',
        apellido: 'Brown Carter',
        email: 'michael.brown@empresa.com',
        password: hashedPassword,
        telefono: '+1 555 2345 678',
        estado: 'activo',
        departamento: 'Tecnología',
        cargo: 'IT Director',
        region: 'US',
        autenticacionDosFactor: true,
        ultimoAcceso: new Date()
      }
    })
  ]);

  console.log(`Creados ${usuarios.length} usuarios`);

  // ============================================================
  // Asignar Roles a Usuarios
  // ============================================================
  const asignaciones = [
    { usuario: usuarios[0], roles: [roles[0], roles[2]] }, // Carlos - Admin, Operador
    { usuario: usuarios[1], roles: [roles[1]] }, // María - Gestor de Áreas
    { usuario: usuarios[3], roles: [roles[0]] }, // Ana - Admin
    { usuario: usuarios[4], roles: [roles[5]] }, // Luis - Analista
    { usuario: usuarios[5], roles: [roles[1], roles[5]] }, // Patricia - Gestor, Analista
    { usuario: usuarios[6], roles: [roles[2]] }, // Fernando - Operador
    { usuario: usuarios[7], roles: [roles[0], roles[1]] }, // Diana - Admin, Gestor
    { usuario: usuarios[8], roles: [roles[3]] }, // George - Coordinador
    { usuario: usuarios[9], roles: [roles[5]] }, // Laura - Analista
    { usuario: usuarios[10], roles: [roles[0]] } // Michael - Admin
  ];

  for (const asig of asignaciones) {
    for (const rol of asig.roles) {
      await prisma.usuarioRol.create({
        data: {
          usuarioId: asig.usuario.id,
          rolId: rol.id
        }
      });
    }
  }

  console.log('Asignaciones de roles completadas');

  // ============================================================
  // Crear Activos
  // ============================================================
  const carpetaProcesos = await prisma.activo.create({
    data: {
      nombre: 'Procesos Corporativos',
      tipo: 'carpeta',
      icono: 'pi-folder',
      expanded: true
    }
  });

  await Promise.all([
    prisma.activo.create({
      data: {
        nombre: 'Gestión de Riesgos',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Control Interno',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Cumplimiento Normativo',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    })
  ]);

  const carpetaDocs = await prisma.activo.create({
    data: {
      nombre: 'Documentación',
      tipo: 'carpeta',
      icono: 'pi-folder'
    }
  });

  const carpetaPoliticas = await prisma.activo.create({
    data: {
      nombre: 'Políticas',
      tipo: 'carpeta',
      icono: 'pi-folder',
      padreId: carpetaDocs.id
    }
  });

  await Promise.all([
    prisma.activo.create({
      data: {
        nombre: 'Política de Seguridad.pdf',
        tipo: 'archivo',
        icono: 'pi-file-pdf',
        padreId: carpetaPoliticas.id
      }
    }),
    prisma.activo.create({
      data: {
        nombre: 'Política de Privacidad.pdf',
        tipo: 'archivo',
        icono: 'pi-file-pdf',
        padreId: carpetaPoliticas.id
      }
    })
  ]);

  console.log('Activos creados');

  console.log('Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
