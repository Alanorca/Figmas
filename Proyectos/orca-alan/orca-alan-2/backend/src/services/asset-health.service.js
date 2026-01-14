/**
 * Asset Health Service
 * Servicio para calcular y gestionar el estado de salud de los activos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Constantes de estado de salud
const HEALTH_STATUS = {
  HEALTHY: 'HEALTHY',
  STRESSED: 'STRESSED',
  CRITICAL: 'CRITICAL'
};

/**
 * Calcula el estado de salud basado en el contador de incidentes y el umbral
 * @param {number} currentCount - Contador actual de incidentes
 * @param {number} threshold - Umbral de tolerancia
 * @returns {string} - Estado de salud: HEALTHY, STRESSED, CRITICAL
 */
function calculateHealthStatus(currentCount, threshold) {
  if (!threshold || threshold <= 0) {
    // Si no hay umbral definido, cualquier incidente causa STRESSED
    return currentCount === 0 ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.STRESSED;
  }

  const percentage = (currentCount / threshold) * 100;

  if (currentCount === 0 || percentage < 50) {
    return HEALTH_STATUS.HEALTHY;
  } else if (percentage >= 50 && percentage < 100) {
    return HEALTH_STATUS.STRESSED;
  } else {
    return HEALTH_STATUS.CRITICAL;
  }
}

/**
 * Determina si el activo requiere atención inmediata
 * @param {string} healthStatus - Estado de salud
 * @param {Date|null} lastIncidentDate - Fecha del último incidente
 * @returns {boolean}
 */
function requiresImmediateAttention(healthStatus, lastIncidentDate) {
  if (healthStatus === HEALTH_STATUS.CRITICAL) {
    return true;
  }

  // Si está STRESSED y tuvo un incidente en los últimos 7 días
  if (healthStatus === HEALTH_STATUS.STRESSED && lastIncidentDate) {
    const daysSinceLastIncident = Math.floor(
      (new Date() - new Date(lastIncidentDate)) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastIncident <= 7;
  }

  return false;
}

/**
 * Actualiza el estado de salud de un activo específico
 * @param {string} activoId - ID del activo
 * @returns {Promise<object>} - Activo actualizado
 */
async function updateAssetHealth(activoId) {
  const activo = await prisma.activo.findUnique({
    where: { id: activoId },
    include: {
      incidentes: {
        where: { estado: { not: 'cerrado' } }
      }
    }
  });

  if (!activo) {
    throw new Error(`Activo ${activoId} no encontrado`);
  }

  // Verificar si debe resetear el contador (días desde último incidente > resetDays)
  let shouldReset = false;
  if (activo.lastIncidentDate && activo.incidentCountResetDays) {
    const daysSinceLastIncident = Math.floor(
      (new Date() - new Date(activo.lastIncidentDate)) / (1000 * 60 * 60 * 24)
    );
    shouldReset = daysSinceLastIncident >= activo.incidentCountResetDays;
  }

  const currentCount = shouldReset ? 0 : activo.currentIncidentCount;
  const healthStatus = calculateHealthStatus(currentCount, activo.incidentToleranceThreshold);
  const needsAttention = requiresImmediateAttention(healthStatus, activo.lastIncidentDate);

  const updated = await prisma.activo.update({
    where: { id: activoId },
    data: {
      currentIncidentCount: currentCount,
      healthStatus,
      requiresImmediateAttention: needsAttention
    }
  });

  return updated;
}

/**
 * Incrementa el contador de incidentes de un activo
 * Solo incrementa si el incidente cumple la "Regla de Doble Impacto":
 * - Falla un control asociado
 * - Materializa un riesgo asociado
 * @param {string} activoId - ID del activo
 * @param {boolean} failsControl - Si el incidente falla un control
 * @param {boolean} materializesRisk - Si el incidente materializa un riesgo
 * @returns {Promise<object>} - Activo actualizado
 */
async function incrementIncidentCount(activoId, failsControl = false, materializesRisk = false) {
  // Regla de Doble Impacto: solo cuenta si falla control Y materializa riesgo
  const shouldIncrement = failsControl && materializesRisk;

  if (!shouldIncrement) {
    // Solo actualizar la fecha del último incidente
    return await prisma.activo.update({
      where: { id: activoId },
      data: { lastIncidentDate: new Date() }
    });
  }

  const activo = await prisma.activo.findUnique({
    where: { id: activoId }
  });

  if (!activo) {
    throw new Error(`Activo ${activoId} no encontrado`);
  }

  const newCount = activo.currentIncidentCount + 1;
  const healthStatus = calculateHealthStatus(newCount, activo.incidentToleranceThreshold);
  const needsAttention = requiresImmediateAttention(healthStatus, new Date());

  const updated = await prisma.activo.update({
    where: { id: activoId },
    data: {
      currentIncidentCount: newCount,
      lastIncidentDate: new Date(),
      healthStatus,
      requiresImmediateAttention: needsAttention
    }
  });

  return updated;
}

/**
 * Resetea el contador de incidentes de un activo
 * @param {string} activoId - ID del activo
 * @returns {Promise<object>} - Activo actualizado
 */
async function resetIncidentCount(activoId) {
  const updated = await prisma.activo.update({
    where: { id: activoId },
    data: {
      currentIncidentCount: 0,
      healthStatus: HEALTH_STATUS.HEALTHY,
      requiresImmediateAttention: false,
      lastIncidentDate: null
    }
  });

  return updated;
}

/**
 * Recalcula el estado de salud de todos los activos
 * @returns {Promise<object>} - Resultado con contadores
 */
async function recalculateAllHealth() {
  const activos = await prisma.activo.findMany({
    where: { isActive: true }
  });

  let updated = 0;
  let errors = 0;

  for (const activo of activos) {
    try {
      await updateAssetHealth(activo.id);
      updated++;
    } catch (error) {
      console.error(`Error actualizando salud de activo ${activo.id}:`, error);
      errors++;
    }
  }

  return {
    total: activos.length,
    updated,
    errors
  };
}

/**
 * Obtiene diagnóstico de salud de todos los activos
 * @returns {Promise<object>} - Estadísticas de salud
 */
async function getHealthDiagnostic() {
  const stats = await prisma.activo.groupBy({
    by: ['healthStatus'],
    _count: { id: true },
    where: { isActive: true }
  });

  const criticalAssets = await prisma.activo.findMany({
    where: {
      isActive: true,
      healthStatus: HEALTH_STATUS.CRITICAL
    },
    select: {
      id: true,
      nombre: true,
      currentIncidentCount: true,
      incidentToleranceThreshold: true,
      lastIncidentDate: true
    }
  });

  const attentionRequired = await prisma.activo.count({
    where: {
      isActive: true,
      requiresImmediateAttention: true
    }
  });

  return {
    summary: stats.reduce((acc, item) => {
      acc[item.healthStatus] = item._count.id;
      return acc;
    }, { HEALTHY: 0, STRESSED: 0, CRITICAL: 0 }),
    criticalAssets,
    attentionRequired
  };
}

module.exports = {
  HEALTH_STATUS,
  calculateHealthStatus,
  requiresImmediateAttention,
  updateAssetHealth,
  incrementIncidentCount,
  resetIncidentCount,
  recalculateAllHealth,
  getHealthDiagnostic
};
