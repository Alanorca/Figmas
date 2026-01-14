const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const assetHealthService = require('../services/asset-health.service');

// ==================== PLANTILLAS ====================

const getPlantillas = async (req, res) => {
  try {
    const plantillas = await prisma.plantillaActivo.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    // Parsear propiedades JSON
    const result = plantillas.map(p => ({
      ...p,
      propiedades: JSON.parse(p.propiedades || '[]')
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    res.status(500).json({ error: 'Error al obtener plantillas' });
  }
};

const getPlantillaById = async (req, res) => {
  try {
    const { id } = req.params;
    const plantilla = await prisma.plantillaActivo.findUnique({
      where: { id }
    });

    if (!plantilla) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }

    res.json({
      ...plantilla,
      propiedades: JSON.parse(plantilla.propiedades || '[]')
    });
  } catch (error) {
    console.error('Error al obtener plantilla:', error);
    res.status(500).json({ error: 'Error al obtener plantilla' });
  }
};

const createPlantilla = async (req, res) => {
  try {
    const { nombre, tipoActivo, descripcion, icono, color, propiedades } = req.body;

    const plantilla = await prisma.plantillaActivo.create({
      data: {
        nombre,
        tipoActivo,
        descripcion,
        icono,
        color,
        propiedades: JSON.stringify(propiedades || [])
      }
    });

    res.status(201).json({
      ...plantilla,
      propiedades: JSON.parse(plantilla.propiedades)
    });
  } catch (error) {
    console.error('Error al crear plantilla:', error);
    res.status(500).json({ error: 'Error al crear plantilla' });
  }
};

const updatePlantilla = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipoActivo, descripcion, icono, color, propiedades, activo } = req.body;

    const plantilla = await prisma.plantillaActivo.update({
      where: { id },
      data: {
        nombre,
        tipoActivo,
        descripcion,
        icono,
        color,
        propiedades: propiedades ? JSON.stringify(propiedades) : undefined,
        activo
      }
    });

    res.json({
      ...plantilla,
      propiedades: JSON.parse(plantilla.propiedades)
    });
  } catch (error) {
    console.error('Error al actualizar plantilla:', error);
    res.status(500).json({ error: 'Error al actualizar plantilla' });
  }
};

// ==================== ACTIVOS ====================

const getActivos = async (req, res) => {
  try {
    const { tipo, criticidad, departamento } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (criticidad) where.criticidad = criticidad;
    if (departamento) where.departamento = departamento;

    const activos = await prisma.activo.findMany({
      where,
      include: {
        plantilla: true,
        riesgos: true,
        incidentes: true,
        defectos: true
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    // Parsear propiedades custom y plantilla
    const result = activos.map(a => ({
      ...a,
      propiedadesCustom: JSON.parse(a.propiedadesCustom || '[]'),
      plantilla: a.plantilla ? {
        ...a.plantilla,
        propiedades: JSON.parse(a.plantilla.propiedades || '[]')
      } : null
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({ error: 'Error al obtener activos' });
  }
};

const getActivoById = async (req, res) => {
  try {
    const { id } = req.params;

    const activo = await prisma.activo.findUnique({
      where: { id },
      include: {
        plantilla: true,
        riesgos: true,
        incidentes: true,
        defectos: true,
        riskAppetite: true,
        parentAsset: {
          select: { id: true, nombre: true, tipo: true, criticidad: true }
        },
        childAssets: {
          select: { id: true, nombre: true, tipo: true, criticidad: true, healthStatus: true }
        }
      }
    });

    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    res.json({
      ...activo,
      propiedadesCustom: JSON.parse(activo.propiedadesCustom || '[]'),
      plantilla: activo.plantilla ? {
        ...activo.plantilla,
        propiedades: JSON.parse(activo.plantilla.propiedades || '[]')
      } : null
    });
  } catch (error) {
    console.error('Error al obtener activo:', error);
    res.status(500).json({ error: 'Error al obtener activo' });
  }
};

const createActivo = async (req, res) => {
  try {
    const { nombre, descripcion, tipo, criticidad, responsable, departamento, plantillaId, propiedadesCustom } = req.body;

    const activo = await prisma.activo.create({
      data: {
        nombre,
        descripcion,
        tipo,
        criticidad,
        responsable,
        departamento,
        plantillaId,
        propiedadesCustom: JSON.stringify(propiedadesCustom || [])
      },
      include: {
        plantilla: true
      }
    });

    res.status(201).json({
      ...activo,
      propiedadesCustom: JSON.parse(activo.propiedadesCustom || '[]'),
      riesgos: [],
      incidentes: [],
      defectos: []
    });
  } catch (error) {
    console.error('Error al crear activo:', error);
    res.status(500).json({ error: 'Error al crear activo' });
  }
};

const updateActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, tipo, criticidad, responsable, departamento, plantillaId, propiedadesCustom } = req.body;

    const activo = await prisma.activo.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        tipo,
        criticidad,
        responsable,
        departamento,
        plantillaId,
        propiedadesCustom: propiedadesCustom ? JSON.stringify(propiedadesCustom) : undefined
      },
      include: {
        plantilla: true,
        riesgos: true,
        incidentes: true,
        defectos: true
      }
    });

    res.json({
      ...activo,
      propiedadesCustom: JSON.parse(activo.propiedadesCustom || '[]')
    });
  } catch (error) {
    console.error('Error al actualizar activo:', error);
    res.status(500).json({ error: 'Error al actualizar activo' });
  }
};

const deleteActivo = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.activo.delete({
      where: { id }
    });

    res.json({ message: 'Activo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar activo:', error);
    res.status(500).json({ error: 'Error al eliminar activo' });
  }
};

// ==================== RIESGOS ====================

const getRiesgos = async (req, res) => {
  try {
    const { activoId, estado } = req.query;

    const where = {};
    if (activoId) where.activoId = activoId;
    if (estado) where.estado = estado;

    const riesgos = await prisma.riesgo.findMany({
      where,
      include: { activo: true },
      orderBy: { fechaIdentificacion: 'desc' }
    });

    res.json(riesgos);
  } catch (error) {
    console.error('Error al obtener riesgos:', error);
    res.status(500).json({ error: 'Error al obtener riesgos' });
  }
};

const createRiesgo = async (req, res) => {
  try {
    const { activoId, descripcion, probabilidad, impacto, estado, responsable } = req.body;

    const riesgo = await prisma.riesgo.create({
      data: {
        activoId,
        descripcion,
        probabilidad,
        impacto,
        estado: estado || 'identificado',
        responsable
      },
      include: { activo: true }
    });

    res.status(201).json(riesgo);
  } catch (error) {
    console.error('Error al crear riesgo:', error);
    res.status(500).json({ error: 'Error al crear riesgo' });
  }
};

const updateRiesgo = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, probabilidad, impacto, estado, responsable } = req.body;

    const riesgo = await prisma.riesgo.update({
      where: { id },
      data: { descripcion, probabilidad, impacto, estado, responsable },
      include: { activo: true }
    });

    res.json(riesgo);
  } catch (error) {
    console.error('Error al actualizar riesgo:', error);
    res.status(500).json({ error: 'Error al actualizar riesgo' });
  }
};

const deleteRiesgo = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.riesgo.delete({ where: { id } });
    res.json({ message: 'Riesgo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar riesgo:', error);
    res.status(500).json({ error: 'Error al eliminar riesgo' });
  }
};

// ==================== INCIDENTES ====================

const getIncidentes = async (req, res) => {
  try {
    const { activoId, estado, severidad } = req.query;

    const where = {};
    if (activoId) where.activoId = activoId;
    if (estado) where.estado = estado;
    if (severidad) where.severidad = severidad;

    const incidentes = await prisma.incidente.findMany({
      where,
      include: { activo: true },
      orderBy: { fechaReporte: 'desc' }
    });

    res.json(incidentes);
  } catch (error) {
    console.error('Error al obtener incidentes:', error);
    res.status(500).json({ error: 'Error al obtener incidentes' });
  }
};

const createIncidente = async (req, res) => {
  try {
    const { activoId, titulo, descripcion, severidad, estado, reportadoPor } = req.body;

    const incidente = await prisma.incidente.create({
      data: {
        activoId,
        titulo,
        descripcion,
        severidad,
        estado: estado || 'abierto',
        reportadoPor
      },
      include: { activo: true }
    });

    res.status(201).json(incidente);
  } catch (error) {
    console.error('Error al crear incidente:', error);
    res.status(500).json({ error: 'Error al crear incidente' });
  }
};

const updateIncidente = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, severidad, estado, reportadoPor } = req.body;

    const incidente = await prisma.incidente.update({
      where: { id },
      data: { titulo, descripcion, severidad, estado, reportadoPor },
      include: { activo: true }
    });

    res.json(incidente);
  } catch (error) {
    console.error('Error al actualizar incidente:', error);
    res.status(500).json({ error: 'Error al actualizar incidente' });
  }
};

const deleteIncidente = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.incidente.delete({ where: { id } });
    res.json({ message: 'Incidente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar incidente:', error);
    res.status(500).json({ error: 'Error al eliminar incidente' });
  }
};

// ==================== DEFECTOS ====================

const getDefectos = async (req, res) => {
  try {
    const { activoId, estado, tipo, prioridad } = req.query;

    const where = {};
    if (activoId) where.activoId = activoId;
    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (prioridad) where.prioridad = prioridad;

    const defectos = await prisma.defecto.findMany({
      where,
      include: { activo: true },
      orderBy: { fechaDeteccion: 'desc' }
    });

    res.json(defectos);
  } catch (error) {
    console.error('Error al obtener defectos:', error);
    res.status(500).json({ error: 'Error al obtener defectos' });
  }
};

const createDefecto = async (req, res) => {
  try {
    const { activoId, titulo, descripcion, tipo, prioridad, estado, detectadoPor } = req.body;

    const defecto = await prisma.defecto.create({
      data: {
        activoId,
        titulo,
        descripcion,
        tipo,
        prioridad,
        estado: estado || 'nuevo',
        detectadoPor
      },
      include: { activo: true }
    });

    res.status(201).json(defecto);
  } catch (error) {
    console.error('Error al crear defecto:', error);
    res.status(500).json({ error: 'Error al crear defecto' });
  }
};

const updateDefecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, tipo, prioridad, estado, detectadoPor } = req.body;

    const defecto = await prisma.defecto.update({
      where: { id },
      data: { titulo, descripcion, tipo, prioridad, estado, detectadoPor },
      include: { activo: true }
    });

    res.json(defecto);
  } catch (error) {
    console.error('Error al actualizar defecto:', error);
    res.status(500).json({ error: 'Error al actualizar defecto' });
  }
};

const deleteDefecto = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.defecto.delete({ where: { id } });
    res.json({ message: 'Defecto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar defecto:', error);
    res.status(500).json({ error: 'Error al eliminar defecto' });
  }
};

// ==================== ESTADO DE SALUD ====================

const resetActivoHealth = async (req, res) => {
  try {
    const { id } = req.params;
    const activo = await assetHealthService.resetIncidentCount(id);
    res.json(activo);
  } catch (error) {
    console.error('Error al resetear salud del activo:', error);
    res.status(500).json({ error: 'Error al resetear salud del activo' });
  }
};

const recalculateAllHealth = async (req, res) => {
  try {
    const result = await assetHealthService.recalculateAllHealth();
    res.json(result);
  } catch (error) {
    console.error('Error al recalcular salud de activos:', error);
    res.status(500).json({ error: 'Error al recalcular salud de activos' });
  }
};

const getHealthDiagnostic = async (req, res) => {
  try {
    const diagnostic = await assetHealthService.getHealthDiagnostic();
    res.json(diagnostic);
  } catch (error) {
    console.error('Error al obtener diagnóstico de salud:', error);
    res.status(500).json({ error: 'Error al obtener diagnóstico de salud' });
  }
};

// ==================== JERARQUÍA DE ACTIVOS ====================

const getActivoChildren = async (req, res) => {
  try {
    const { id } = req.params;

    const children = await prisma.activo.findMany({
      where: { parentAssetId: id },
      select: {
        id: true,
        nombre: true,
        tipo: true,
        criticidad: true,
        healthStatus: true,
        isActive: true,
        _count: {
          select: { childAssets: true, riesgos: true, incidentes: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    res.json(children);
  } catch (error) {
    console.error('Error al obtener hijos del activo:', error);
    res.status(500).json({ error: 'Error al obtener hijos del activo' });
  }
};

const getActivoParents = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener cadena de ancestros
    const parents = [];
    let currentId = id;

    while (currentId) {
      const activo = await prisma.activo.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          parentAssetId: true
        }
      });

      if (!activo || !activo.parentAssetId) break;

      const parent = await prisma.activo.findUnique({
        where: { id: activo.parentAssetId },
        select: {
          id: true,
          nombre: true,
          tipo: true,
          criticidad: true,
          parentAssetId: true
        }
      });

      if (parent) {
        parents.push(parent);
        currentId = parent.id;
      } else {
        break;
      }
    }

    res.json(parents.reverse()); // Ordenar desde la raíz hacia abajo
  } catch (error) {
    console.error('Error al obtener padres del activo:', error);
    res.status(500).json({ error: 'Error al obtener padres del activo' });
  }
};

// ==================== CONFIGURACIÓN DE TOLERANCIA ====================

const updateActivoTolerance = async (req, res) => {
  try {
    const { id } = req.params;
    const { incidentToleranceThreshold, incidentCountResetDays } = req.body;

    const activo = await prisma.activo.update({
      where: { id },
      data: {
        incidentToleranceThreshold,
        incidentCountResetDays
      }
    });

    // Recalcular estado de salud con nuevo umbral
    const updatedActivo = await assetHealthService.updateAssetHealth(id);

    res.json(updatedActivo);
  } catch (error) {
    console.error('Error al actualizar tolerancia del activo:', error);
    res.status(500).json({ error: 'Error al actualizar tolerancia del activo' });
  }
};

// ==================== APETITO DE RIESGO ====================

const getRiskAppetites = async (req, res) => {
  try {
    const appetites = await prisma.riskAppetite.findMany({
      orderBy: { nombre: 'asc' }
    });
    res.json(appetites);
  } catch (error) {
    console.error('Error al obtener apetitos de riesgo:', error);
    res.status(500).json({ error: 'Error al obtener apetitos de riesgo' });
  }
};

const createRiskAppetite = async (req, res) => {
  try {
    const { nombre, descripcion, riesgoInherente, riesgoResidual, apetitoRiesgo, categoriaRiesgo } = req.body;

    const appetite = await prisma.riskAppetite.create({
      data: {
        nombre,
        descripcion,
        riesgoInherente,
        riesgoResidual,
        apetitoRiesgo,
        categoriaRiesgo
      }
    });

    res.status(201).json(appetite);
  } catch (error) {
    console.error('Error al crear apetito de riesgo:', error);
    res.status(500).json({ error: 'Error al crear apetito de riesgo' });
  }
};

const assignRiskAppetite = async (req, res) => {
  try {
    const { id } = req.params;
    const { riskAppetiteId } = req.body;

    const activo = await prisma.activo.update({
      where: { id },
      data: { riskAppetiteId },
      include: { riskAppetite: true }
    });

    res.json(activo);
  } catch (error) {
    console.error('Error al asignar apetito de riesgo:', error);
    res.status(500).json({ error: 'Error al asignar apetito de riesgo' });
  }
};

// ==================== DATOS PARA GRAFO ====================

const getActivoGraph = async (req, res) => {
  try {
    const { id } = req.params;

    const activo = await prisma.activo.findUnique({
      where: { id },
      include: {
        riesgos: { select: { id: true, descripcion: true, probabilidad: true, impacto: true, estado: true } },
        incidentes: { select: { id: true, titulo: true, severidad: true, estado: true } },
        defectos: { select: { id: true, titulo: true, tipo: true, prioridad: true, estado: true } },
        parentAsset: { select: { id: true, nombre: true, tipo: true } },
        childAssets: { select: { id: true, nombre: true, tipo: true, healthStatus: true } }
      }
    });

    if (!activo) {
      return res.status(404).json({ error: 'Activo no encontrado' });
    }

    // Construir nodos
    const nodes = [
      { id: activo.id, label: activo.nombre, type: 'activo', data: activo }
    ];

    // Agregar nodo padre si existe
    if (activo.parentAsset) {
      nodes.push({
        id: activo.parentAsset.id,
        label: activo.parentAsset.nombre,
        type: 'activo-padre',
        data: activo.parentAsset
      });
    }

    // Agregar nodos hijos
    activo.childAssets.forEach(child => {
      nodes.push({
        id: child.id,
        label: child.nombre,
        type: 'activo-hijo',
        data: child
      });
    });

    // Agregar nodos de riesgos
    activo.riesgos.forEach(riesgo => {
      nodes.push({
        id: riesgo.id,
        label: riesgo.descripcion.substring(0, 30) + '...',
        type: 'riesgo',
        data: riesgo
      });
    });

    // Agregar nodos de incidentes
    activo.incidentes.forEach(incidente => {
      nodes.push({
        id: incidente.id,
        label: incidente.titulo,
        type: 'incidente',
        data: incidente
      });
    });

    // Construir edges
    const edges = [];

    // Edge del padre al activo
    if (activo.parentAsset) {
      edges.push({
        id: `${activo.parentAsset.id}-${activo.id}`,
        source: activo.parentAsset.id,
        target: activo.id,
        label: 'padre de'
      });
    }

    // Edges del activo a hijos
    activo.childAssets.forEach(child => {
      edges.push({
        id: `${activo.id}-${child.id}`,
        source: activo.id,
        target: child.id,
        label: 'contiene'
      });
    });

    // Edges a riesgos
    activo.riesgos.forEach(riesgo => {
      edges.push({
        id: `${activo.id}-${riesgo.id}`,
        source: activo.id,
        target: riesgo.id,
        label: 'tiene riesgo'
      });
    });

    // Edges a incidentes
    activo.incidentes.forEach(incidente => {
      edges.push({
        id: `${activo.id}-${incidente.id}`,
        source: activo.id,
        target: incidente.id,
        label: 'tiene incidente'
      });
    });

    res.json({ nodes, edges });
  } catch (error) {
    console.error('Error al obtener grafo del activo:', error);
    res.status(500).json({ error: 'Error al obtener grafo del activo' });
  }
};

module.exports = {
  // Plantillas
  getPlantillas,
  getPlantillaById,
  createPlantilla,
  updatePlantilla,
  // Activos
  getActivos,
  getActivoById,
  createActivo,
  updateActivo,
  deleteActivo,
  // Riesgos
  getRiesgos,
  createRiesgo,
  updateRiesgo,
  deleteRiesgo,
  // Incidentes
  getIncidentes,
  createIncidente,
  updateIncidente,
  deleteIncidente,
  // Defectos
  getDefectos,
  createDefecto,
  updateDefecto,
  deleteDefecto,
  // Estado de Salud
  resetActivoHealth,
  recalculateAllHealth,
  getHealthDiagnostic,
  // Jerarquía
  getActivoChildren,
  getActivoParents,
  // Tolerancia
  updateActivoTolerance,
  // Apetito de Riesgo
  getRiskAppetites,
  createRiskAppetite,
  assignRiskAppetite,
  // Grafo
  getActivoGraph
};
