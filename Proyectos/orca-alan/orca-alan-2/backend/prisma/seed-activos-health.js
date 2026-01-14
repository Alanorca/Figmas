const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando activos con datos de salud y relaciones...\n');

  // ============================================================
  // Crear Risk Appetites
  // ============================================================
  const riskAppetites = await Promise.all([
    prisma.riskAppetite.create({
      data: {
        nombre: 'Conservador - Sistemas Criticos',
        descripcion: 'Apetito de riesgo muy bajo para sistemas criticos de mision',
        riesgoInherente: 85,
        riesgoResidual: 25,
        apetitoRiesgo: 20,
        categoriaRiesgo: 'bajo'
      }
    }),
    prisma.riskAppetite.create({
      data: {
        nombre: 'Moderado - Operaciones',
        descripcion: 'Apetito de riesgo moderado para sistemas operativos',
        riesgoInherente: 70,
        riesgoResidual: 40,
        apetitoRiesgo: 35,
        categoriaRiesgo: 'medio'
      }
    }),
    prisma.riskAppetite.create({
      data: {
        nombre: 'Agresivo - Desarrollo',
        descripcion: 'Mayor tolerancia al riesgo en ambientes de desarrollo',
        riesgoInherente: 60,
        riesgoResidual: 55,
        apetitoRiesgo: 50,
        categoriaRiesgo: 'alto'
      }
    }),
    prisma.riskAppetite.create({
      data: {
        nombre: 'Regulatorio - PLD/AML',
        descripcion: 'Sin tolerancia a riesgos de cumplimiento regulatorio',
        riesgoInherente: 90,
        riesgoResidual: 15,
        apetitoRiesgo: 10,
        categoriaRiesgo: 'bajo'
      }
    })
  ]);
  console.log(`Creados ${riskAppetites.length} Risk Appetites`);

  // ============================================================
  // Obtener activos existentes
  // ============================================================
  const activos = await prisma.activo.findMany({
    orderBy: { nombre: 'asc' }
  });
  console.log(`Encontrados ${activos.length} activos existentes`);

  if (activos.length === 0) {
    console.log('No hay activos. Ejecuta primero el seed principal.');
    return;
  }

  // ============================================================
  // Actualizar activos con datos de salud y jerarquia
  // ============================================================

  // Core Banking System - activo padre principal
  const coreBanking = activos.find(a => a.nombre.includes('Core Banking'));
  if (coreBanking) {
    await prisma.activo.update({
      where: { id: coreBanking.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 2,
        incidentToleranceThreshold: 15,
        incidentCountResetDays: 365,
        assetValue: 15000000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id, // Conservador
        lastIncidentDate: new Date('2025-11-15')
      }
    });
    console.log('Actualizado: Core Banking System');

    // Crear sub-activos del Core Banking
    const subActivos = await Promise.all([
      prisma.activo.create({
        data: {
          nombre: 'Modulo de Cuentas CBS',
          descripcion: 'Modulo de gestion de cuentas del Core Banking System',
          tipo: 'software',
          criticidad: 'alta',
          responsable: 'Roberto Torres Ramirez',
          departamento: 'TI',
          parentAssetId: coreBanking.id,
          healthStatus: 'HEALTHY',
          currentIncidentCount: 0,
          incidentToleranceThreshold: 10,
          assetValue: 2000000,
          isActive: true,
          riskAppetiteId: riskAppetites[0].id
        }
      }),
      prisma.activo.create({
        data: {
          nombre: 'Modulo de Creditos CBS',
          descripcion: 'Modulo de originacion y gestion de creditos',
          tipo: 'software',
          criticidad: 'alta',
          responsable: 'Carlos Hernandez Mora',
          departamento: 'Credito',
          parentAssetId: coreBanking.id,
          healthStatus: 'STRESSED',
          currentIncidentCount: 6,
          incidentToleranceThreshold: 10,
          assetValue: 3500000,
          isActive: true,
          riskAppetiteId: riskAppetites[1].id,
          lastIncidentDate: new Date('2025-12-20')
        }
      }),
      prisma.activo.create({
        data: {
          nombre: 'Modulo de Inversiones CBS',
          descripcion: 'Modulo de gestion de inversiones y fondos',
          tipo: 'software',
          criticidad: 'media',
          responsable: 'Ana Patricia Lopez Garcia',
          departamento: 'Tesoreria',
          parentAssetId: coreBanking.id,
          healthStatus: 'HEALTHY',
          currentIncidentCount: 1,
          incidentToleranceThreshold: 8,
          assetValue: 1800000,
          isActive: true,
          riskAppetiteId: riskAppetites[1].id
        }
      })
    ]);
    console.log(`Creados ${subActivos.length} sub-activos del Core Banking`);
  }

  // Sistema de Banca en Linea
  const bancaLinea = activos.find(a => a.nombre.includes('Banca en Linea'));
  if (bancaLinea) {
    await prisma.activo.update({
      where: { id: bancaLinea.id },
      data: {
        healthStatus: 'STRESSED',
        currentIncidentCount: 7,
        incidentToleranceThreshold: 12,
        incidentCountResetDays: 180,
        assetValue: 8500000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id,
        lastIncidentDate: new Date('2026-01-02'),
        requiresImmediateAttention: true
      }
    });
    console.log('Actualizado: Sistema de Banca en Linea');
  }

  // Sistema SPEI/SPID
  const spei = activos.find(a => a.nombre.includes('SPEI'));
  if (spei) {
    await prisma.activo.update({
      where: { id: spei.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 1,
        incidentToleranceThreshold: 5,
        incidentCountResetDays: 90,
        assetValue: 12000000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id,
        lastIncidentDate: new Date('2025-09-10')
      }
    });
    console.log('Actualizado: Sistema SPEI/SPID');
  }

  // Sistema Anti-Lavado (AML)
  const aml = activos.find(a => a.nombre.includes('Anti-Lavado'));
  if (aml) {
    await prisma.activo.update({
      where: { id: aml.id },
      data: {
        healthStatus: 'CRITICAL',
        currentIncidentCount: 12,
        incidentToleranceThreshold: 8,
        incidentCountResetDays: 365,
        assetValue: 4500000,
        isActive: true,
        riskAppetiteId: riskAppetites[3].id, // Regulatorio
        lastIncidentDate: new Date('2026-01-03'),
        requiresImmediateAttention: true
      }
    });
    console.log('Actualizado: Sistema Anti-Lavado (CRITICAL)');
  }

  // Base de Datos de Clientes
  const bdClientes = activos.find(a => a.nombre.includes('Base de Datos de Clientes'));
  if (bdClientes) {
    await prisma.activo.update({
      where: { id: bdClientes.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 0,
        incidentToleranceThreshold: 5,
        incidentCountResetDays: 365,
        assetValue: 25000000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id
      }
    });
    console.log('Actualizado: Base de Datos de Clientes');
  }

  // Base de Datos de Transacciones
  const bdTxn = activos.find(a => a.nombre.includes('Base de Datos de Transacciones'));
  if (bdTxn) {
    await prisma.activo.update({
      where: { id: bdTxn.id },
      data: {
        healthStatus: 'STRESSED',
        currentIncidentCount: 3,
        incidentToleranceThreshold: 5,
        incidentCountResetDays: 180,
        assetValue: 35000000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id,
        lastIncidentDate: new Date('2025-12-28')
      }
    });
    console.log('Actualizado: Base de Datos de Transacciones');
  }

  // Red de Cajeros
  const atm = activos.find(a => a.nombre.includes('Cajeros'));
  if (atm) {
    await prisma.activo.update({
      where: { id: atm.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 4,
        incidentToleranceThreshold: 20,
        incidentCountResetDays: 90,
        assetValue: 45000000,
        isActive: true,
        riskAppetiteId: riskAppetites[1].id,
        lastIncidentDate: new Date('2025-12-15')
      }
    });
    console.log('Actualizado: Red de Cajeros');
  }

  // Servidor Principal
  const servidor = activos.find(a => a.nombre.includes('Servidor Principal'));
  if (servidor) {
    await prisma.activo.update({
      where: { id: servidor.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 1,
        incidentToleranceThreshold: 10,
        incidentCountResetDays: 365,
        assetValue: 2500000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id,
        lastIncidentDate: new Date('2025-08-20')
      }
    });
    console.log('Actualizado: Servidor Principal');
  }

  // Firewall Perimetral
  const firewall = activos.find(a => a.nombre.includes('Firewall'));
  if (firewall) {
    await prisma.activo.update({
      where: { id: firewall.id },
      data: {
        healthStatus: 'HEALTHY',
        currentIncidentCount: 2,
        incidentToleranceThreshold: 15,
        incidentCountResetDays: 365,
        assetValue: 850000,
        isActive: true,
        riskAppetiteId: riskAppetites[0].id,
        lastIncidentDate: new Date('2025-10-05')
      }
    });
    console.log('Actualizado: Firewall Perimetral');
  }

  // ============================================================
  // Crear mas incidentes para mostrar variedad
  // ============================================================
  const amlActivo = activos.find(a => a.nombre.includes('Anti-Lavado'));
  if (amlActivo) {
    await Promise.all([
      prisma.incidente.create({
        data: {
          activoId: amlActivo.id,
          titulo: 'Falla en generacion de reportes CNBV',
          descripcion: 'El sistema no pudo generar los reportes regulatorios a tiempo',
          severidad: 'critica',
          estado: 'abierto',
          reportadoPor: 'Patricia Reyes Solis',
          fechaReporte: new Date('2026-01-03')
        }
      }),
      prisma.incidente.create({
        data: {
          activoId: amlActivo.id,
          titulo: 'Alertas de operaciones inusuales no disparadas',
          descripcion: 'Se detectaron operaciones que debieron disparar alertas pero no lo hicieron',
          severidad: 'critica',
          estado: 'en_proceso',
          reportadoPor: 'Patricia Reyes Solis',
          fechaReporte: new Date('2026-01-02')
        }
      }),
      prisma.incidente.create({
        data: {
          activoId: amlActivo.id,
          titulo: 'Lentitud en procesamiento de reglas',
          descripcion: 'El motor de reglas tarda mas de 5 minutos en procesar transacciones',
          severidad: 'alta',
          estado: 'abierto',
          reportadoPor: 'Roberto Torres Ramirez',
          fechaReporte: new Date('2026-01-01')
        }
      })
    ]);
    console.log('Creados incidentes adicionales para AML');
  }

  // ============================================================
  // Crear defectos
  // ============================================================
  const bancaLineaActivo = activos.find(a => a.nombre.includes('Banca en Linea'));
  if (bancaLineaActivo) {
    await Promise.all([
      prisma.defecto.create({
        data: {
          activoId: bancaLineaActivo.id,
          titulo: 'Error en validacion de token 2FA',
          descripcion: 'En algunos casos el token de segundo factor no valida correctamente',
          tipo: 'seguridad',
          prioridad: 'critica',
          estado: 'confirmado',
          detectadoPor: 'QA Security Team',
          fechaDeteccion: new Date('2026-01-02')
        }
      }),
      prisma.defecto.create({
        data: {
          activoId: bancaLineaActivo.id,
          titulo: 'Fuga de memoria en sesiones largas',
          descripcion: 'Las sesiones de mas de 30 minutos causan fuga de memoria',
          tipo: 'rendimiento',
          prioridad: 'alta',
          estado: 'en_correccion',
          detectadoPor: 'Monitoreo',
          fechaDeteccion: new Date('2025-12-28')
        }
      }),
      prisma.defecto.create({
        data: {
          activoId: bancaLineaActivo.id,
          titulo: 'Boton de transferencia no responde en iOS',
          descripcion: 'En la app iOS el boton de nueva transferencia a veces no responde',
          tipo: 'funcional',
          prioridad: 'media',
          estado: 'nuevo',
          detectadoPor: 'Soporte al Cliente',
          fechaDeteccion: new Date('2026-01-04')
        }
      })
    ]);
    console.log('Creados defectos para Banca en Linea');
  }

  // ============================================================
  // Resumen final
  // ============================================================
  const stats = await prisma.activo.groupBy({
    by: ['healthStatus'],
    _count: { id: true }
  });

  console.log('\n========================================');
  console.log('Resumen de Estado de Salud:');
  stats.forEach(s => {
    console.log(`  ${s.healthStatus || 'SIN ESTADO'}: ${s._count.id} activos`);
  });

  const totalActivos = await prisma.activo.count();
  const totalRiesgos = await prisma.riesgo.count();
  const totalIncidentes = await prisma.incidente.count();
  const totalDefectos = await prisma.defecto.count();

  console.log('\nTotales:');
  console.log(`  Activos: ${totalActivos}`);
  console.log(`  Riesgos: ${totalRiesgos}`);
  console.log(`  Incidentes: ${totalIncidentes}`);
  console.log(`  Defectos: ${totalDefectos}`);
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
