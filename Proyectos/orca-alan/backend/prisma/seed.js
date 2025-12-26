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
  // Crear Activos de Acceso (estructura de árbol)
  // ============================================================
  const carpetaProcesos = await prisma.activoAcceso.create({
    data: {
      nombre: 'Procesos Corporativos',
      tipo: 'carpeta',
      icono: 'pi-folder',
      expanded: true
    }
  });

  await Promise.all([
    prisma.activoAcceso.create({
      data: {
        nombre: 'Gestión de Riesgos',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    }),
    prisma.activoAcceso.create({
      data: {
        nombre: 'Control Interno',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    }),
    prisma.activoAcceso.create({
      data: {
        nombre: 'Cumplimiento Normativo',
        tipo: 'proceso',
        icono: 'pi-sitemap',
        padreId: carpetaProcesos.id
      }
    })
  ]);

  const carpetaDocs = await prisma.activoAcceso.create({
    data: {
      nombre: 'Documentación',
      tipo: 'carpeta',
      icono: 'pi-folder'
    }
  });

  const carpetaPoliticas = await prisma.activoAcceso.create({
    data: {
      nombre: 'Políticas',
      tipo: 'carpeta',
      icono: 'pi-folder',
      padreId: carpetaDocs.id
    }
  });

  await Promise.all([
    prisma.activoAcceso.create({
      data: {
        nombre: 'Política de Seguridad.pdf',
        tipo: 'archivo',
        icono: 'pi-file-pdf',
        padreId: carpetaPoliticas.id
      }
    }),
    prisma.activoAcceso.create({
      data: {
        nombre: 'Política de Privacidad.pdf',
        tipo: 'archivo',
        icono: 'pi-file-pdf',
        padreId: carpetaPoliticas.id
      }
    })
  ]);

  console.log('Activos de acceso creados');

  // ============================================================
  // Crear Catálogos
  // ============================================================
  console.log('Creando catálogos...');

  const catalogos = [
    { tipo: 'tipoActivo', codigo: 'hardware', nombre: 'Hardware', orden: 1, icono: 'computer' },
    { tipo: 'tipoActivo', codigo: 'software', nombre: 'Software', orden: 2, icono: 'code' },
    { tipo: 'tipoActivo', codigo: 'datos', nombre: 'Datos', orden: 3, icono: 'database' },
    { tipo: 'tipoActivo', codigo: 'personas', nombre: 'Personas', orden: 4, icono: 'people' },
    { tipo: 'tipoActivo', codigo: 'instalaciones', nombre: 'Instalaciones', orden: 5, icono: 'business' },
    { tipo: 'criticidad', codigo: 'alta', nombre: 'Alta', orden: 1, color: '#dc2626' },
    { tipo: 'criticidad', codigo: 'media', nombre: 'Media', orden: 2, color: '#f59e0b' },
    { tipo: 'criticidad', codigo: 'baja', nombre: 'Baja', orden: 3, color: '#22c55e' },
    { tipo: 'severidad', codigo: 'critica', nombre: 'Crítica', orden: 1, color: '#7f1d1d' },
    { tipo: 'severidad', codigo: 'alta', nombre: 'Alta', orden: 2, color: '#dc2626' },
    { tipo: 'severidad', codigo: 'media', nombre: 'Media', orden: 3, color: '#f59e0b' },
    { tipo: 'severidad', codigo: 'baja', nombre: 'Baja', orden: 4, color: '#22c55e' },
    { tipo: 'estadoRiesgo', codigo: 'identificado', nombre: 'Identificado', orden: 1 },
    { tipo: 'estadoRiesgo', codigo: 'evaluado', nombre: 'Evaluado', orden: 2 },
    { tipo: 'estadoRiesgo', codigo: 'mitigado', nombre: 'Mitigado', orden: 3 },
    { tipo: 'estadoRiesgo', codigo: 'aceptado', nombre: 'Aceptado', orden: 4 },
    { tipo: 'estadoIncidente', codigo: 'abierto', nombre: 'Abierto', orden: 1 },
    { tipo: 'estadoIncidente', codigo: 'en_proceso', nombre: 'En Proceso', orden: 2 },
    { tipo: 'estadoIncidente', codigo: 'resuelto', nombre: 'Resuelto', orden: 3 },
    { tipo: 'estadoIncidente', codigo: 'cerrado', nombre: 'Cerrado', orden: 4 },
    { tipo: 'estadoDefecto', codigo: 'nuevo', nombre: 'Nuevo', orden: 1 },
    { tipo: 'estadoDefecto', codigo: 'confirmado', nombre: 'Confirmado', orden: 2 },
    { tipo: 'estadoDefecto', codigo: 'en_correccion', nombre: 'En Corrección', orden: 3 },
    { tipo: 'estadoDefecto', codigo: 'corregido', nombre: 'Corregido', orden: 4 },
    { tipo: 'estadoDefecto', codigo: 'verificado', nombre: 'Verificado', orden: 5 },
    { tipo: 'tipoDefecto', codigo: 'funcional', nombre: 'Funcional', orden: 1 },
    { tipo: 'tipoDefecto', codigo: 'seguridad', nombre: 'Seguridad', orden: 2 },
    { tipo: 'tipoDefecto', codigo: 'rendimiento', nombre: 'Rendimiento', orden: 3 },
    { tipo: 'tipoDefecto', codigo: 'usabilidad', nombre: 'Usabilidad', orden: 4 },
    { tipo: 'departamento', codigo: 'ti', nombre: 'TI', orden: 1 },
    { tipo: 'departamento', codigo: 'operaciones', nombre: 'Operaciones', orden: 2 },
    { tipo: 'departamento', codigo: 'ventas', nombre: 'Ventas', orden: 3 },
    { tipo: 'departamento', codigo: 'infraestructura', nombre: 'Infraestructura', orden: 4 },
  ];

  for (const cat of catalogos) {
    await prisma.catalogo.upsert({
      where: { tipo_codigo: { tipo: cat.tipo, codigo: cat.codigo } },
      update: cat,
      create: { ...cat, metadata: '{}' }
    });
  }
  console.log(`Creados ${catalogos.length} catálogos`);

  // ============================================================
  // Crear Plantillas de Activos
  // ============================================================
  console.log('Creando plantillas de activos...');

  const plantillaHardware = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Servidor',
      tipoActivo: 'hardware',
      descripcion: 'Plantilla para servidores físicos y virtuales',
      icono: 'dns',
      color: '#4CAF50',
      propiedades: JSON.stringify([
        { id: 'hw-1', nombre: 'Marca', campo: 'marca', tipo: 'texto', requerido: true },
        { id: 'hw-2', nombre: 'Modelo', campo: 'modelo', tipo: 'texto', requerido: true },
        { id: 'hw-3', nombre: 'Número de Serie', campo: 'numeroSerie', tipo: 'texto', requerido: true },
        { id: 'hw-4', nombre: 'CPU (Cores)', campo: 'cpuCores', tipo: 'numero', requerido: false },
        { id: 'hw-5', nombre: 'RAM (GB)', campo: 'ramGb', tipo: 'numero', requerido: false },
      ])
    }
  });

  const plantillaSoftware = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Aplicación Empresarial',
      tipoActivo: 'software',
      descripcion: 'Plantilla para aplicaciones de software empresarial',
      icono: 'apps',
      color: '#2196F3',
      propiedades: JSON.stringify([
        { id: 'sw-1', nombre: 'Versión', campo: 'version', tipo: 'texto', requerido: true },
        { id: 'sw-2', nombre: 'Proveedor', campo: 'proveedor', tipo: 'texto', requerido: true },
        { id: 'sw-3', nombre: 'Tipo de Licencia', campo: 'tipoLicencia', tipo: 'seleccion', requerido: true },
      ])
    }
  });

  const plantillaDatos = await prisma.plantillaActivo.create({
    data: {
      nombre: 'Base de Datos',
      tipoActivo: 'datos',
      descripcion: 'Plantilla para bases de datos',
      icono: 'storage',
      color: '#9C27B0',
      propiedades: JSON.stringify([
        { id: 'dt-1', nombre: 'Tipo de Datos', campo: 'tipoDatos', tipo: 'seleccion', requerido: true },
        { id: 'dt-2', nombre: 'Clasificación', campo: 'clasificacion', tipo: 'seleccion', requerido: true },
        { id: 'dt-3', nombre: 'Volumen (Registros)', campo: 'volumenRegistros', tipo: 'numero', requerido: false },
      ])
    }
  });

  console.log('Plantillas de activos creadas');

  // ============================================================
  // Crear Activos de Negocio
  // ============================================================
  console.log('Creando activos de negocio...');

  const activo1 = await prisma.activo.create({
    data: {
      nombre: 'Servidor Principal',
      descripcion: 'Servidor de base de datos principal de producción',
      tipo: 'hardware',
      criticidad: 'alta',
      responsable: 'Carlos Rodriguez',
      departamento: 'TI',
      plantillaId: plantillaHardware.id,
      propiedadesCustom: JSON.stringify([
        { propiedadId: 'hw-1', campo: 'marca', valor: 'Dell' },
        { propiedadId: 'hw-2', campo: 'modelo', valor: 'PowerEdge R740' },
        { propiedadId: 'hw-4', campo: 'cpuCores', valor: 32 },
        { propiedadId: 'hw-5', campo: 'ramGb', valor: 128 },
      ])
    }
  });

  const activo2 = await prisma.activo.create({
    data: {
      nombre: 'Sistema ERP',
      descripcion: 'Sistema de planificación de recursos empresariales',
      tipo: 'software',
      criticidad: 'alta',
      responsable: 'Maria Garcia',
      departamento: 'Operaciones',
      plantillaId: plantillaSoftware.id,
      propiedadesCustom: JSON.stringify([
        { propiedadId: 'sw-1', campo: 'version', valor: '4.2.1' },
        { propiedadId: 'sw-2', campo: 'proveedor', valor: 'SAP' },
      ])
    }
  });

  const activo3 = await prisma.activo.create({
    data: {
      nombre: 'Base de Datos Clientes',
      descripcion: 'Almacén de información de clientes',
      tipo: 'datos',
      criticidad: 'alta',
      responsable: 'Ana Martinez',
      departamento: 'Ventas',
      plantillaId: plantillaDatos.id,
      propiedadesCustom: JSON.stringify([
        { propiedadId: 'dt-1', campo: 'tipoDatos', valor: 'clientes' },
        { propiedadId: 'dt-2', campo: 'clasificacion', valor: 'confidencial' },
        { propiedadId: 'dt-3', campo: 'volumenRegistros', valor: 250000 },
      ])
    }
  });

  console.log('Activos de negocio creados');

  // ============================================================
  // Crear Riesgos
  // ============================================================
  console.log('Creando riesgos...');

  await prisma.riesgo.createMany({
    data: [
      { activoId: activo1.id, descripcion: 'Falla por sobrecalentamiento', probabilidad: 2, impacto: 5, estado: 'evaluado', responsable: 'Carlos Rodriguez' },
      { activoId: activo1.id, descripcion: 'Acceso no autorizado', probabilidad: 3, impacto: 5, estado: 'mitigado', responsable: 'Ana Martinez' },
      { activoId: activo2.id, descripcion: 'Vulnerabilidad de inyección SQL', probabilidad: 2, impacto: 4, estado: 'identificado', responsable: 'Pedro Lopez' },
      { activoId: activo3.id, descripcion: 'Fuga de datos personales', probabilidad: 2, impacto: 5, estado: 'mitigado', responsable: 'Ana Martinez' },
    ]
  });
  console.log('Riesgos creados');

  // ============================================================
  // Crear Incidentes
  // ============================================================
  console.log('Creando incidentes...');

  await prisma.incidente.createMany({
    data: [
      { activoId: activo1.id, titulo: 'Caída del servicio por 2 horas', descripcion: 'El servidor presentó una caída no planificada', severidad: 'alta', estado: 'cerrado', reportadoPor: 'Juan Perez' },
    ]
  });
  console.log('Incidentes creados');

  // ============================================================
  // Crear Defectos
  // ============================================================
  console.log('Creando defectos...');

  await prisma.defecto.createMany({
    data: [
      { activoId: activo2.id, titulo: 'Error en cálculo de inventario', descripcion: 'El módulo de inventario muestra cantidades incorrectas', tipo: 'funcional', prioridad: 'alta', estado: 'en_correccion', detectadoPor: 'Laura Sanchez' },
    ]
  });
  console.log('Defectos creados');

  // ============================================================
  // Crear Organigrama
  // ============================================================
  console.log('Creando organigrama...');

  const organigrama = await prisma.organigrama.create({
    data: { nombre: 'Organigrama Corporativo', descripcion: 'Estructura organizacional de la empresa' }
  });

  const ceo = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Francisco Puente', cargo: 'Director General', departamento: 'Dirección', email: 'fpuente@empresa.com', telefono: '+52 55 1234 5678' }
  });

  const directorTI = await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Carlos Rodriguez', cargo: 'Director de TI', departamento: 'Tecnología', email: 'crodriguez@empresa.com', padreId: ceo.id }
  });

  await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Maria Garcia', cargo: 'Directora de Operaciones', departamento: 'Operaciones', email: 'mgarcia@empresa.com', padreId: ceo.id }
  });

  await prisma.nodoOrganigrama.create({
    data: { organigramaId: organigrama.id, nombre: 'Roberto Fernandez', cargo: 'Gerente de Desarrollo', departamento: 'TI', email: 'rfernandez@empresa.com', padreId: directorTI.id }
  });

  console.log('Organigrama creado');

  // ============================================================
  // Crear Dashboard por defecto
  // ============================================================
  console.log('Creando dashboard...');

  await prisma.dashboardConfig.create({
    data: {
      nombre: 'Dashboard Principal',
      descripcion: 'Dashboard por defecto del sistema',
      isDefault: true,
      columns: 12,
      rowHeight: 50,
      gap: 10,
      widgets: {
        create: [
          { tipo: 'kpi-card', titulo: 'Total Activos', config: '{"kpiType":"activos"}', x: 0, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Riesgos Críticos', config: '{"kpiType":"riesgos"}', x: 3, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Incidentes Abiertos', config: '{"kpiType":"incidentes"}', x: 6, y: 0, cols: 3, rows: 2 },
          { tipo: 'kpi-card', titulo: 'Cumplimiento', config: '{"kpiType":"cumplimiento"}', x: 9, y: 0, cols: 3, rows: 2 },
        ]
      }
    }
  });
  console.log('Dashboard creado');

  console.log('\n✅ Seed completado exitosamente!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
