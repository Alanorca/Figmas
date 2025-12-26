const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== PROCESOS ====================

const getProcesos = async (req, res) => {
  try {
    const { estado } = req.query;

    const where = {};
    if (estado) where.estado = estado;

    const procesos = await prisma.proceso.findMany({
      where,
      include: {
        nodos: true,
        edges: true,
        objetivos: {
          include: { kpis: true }
        },
        kpis: {
          include: { historico: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transformar para el frontend
    const result = procesos.map(p => ({
      ...p,
      nodes: p.nodos.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        descripcion: n.descripcion,
        config: JSON.parse(n.config || '{}'),
        position: { x: n.positionX, y: n.positionY }
      })),
      edges: p.edges.map(e => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label
      })),
      objetivos: p.objetivos.map(o => ({
        ...o,
        kpis: o.kpis.map(k => ({
          id: k.id,
          nombre: k.nombre,
          meta: k.meta,
          escala: k.unidad
        }))
      })),
      kpis: p.kpis.map(k => ({
        ...k,
        alertas: {
          advertencia: k.alertaAdvertencia,
          critico: k.alertaCritico,
          direccion: k.alertaDireccion
        }
      }))
    }));

    // Eliminar campos internos
    result.forEach(p => {
      delete p.nodos;
    });

    res.json(result);
  } catch (error) {
    console.error('Error al obtener procesos:', error);
    res.status(500).json({ error: 'Error al obtener procesos' });
  }
};

const getProcesoById = async (req, res) => {
  try {
    const { id } = req.params;

    const proceso = await prisma.proceso.findUnique({
      where: { id },
      include: {
        nodos: true,
        edges: true,
        objetivos: {
          include: { kpis: true }
        },
        kpis: {
          include: { historico: true }
        }
      }
    });

    if (!proceso) {
      return res.status(404).json({ error: 'Proceso no encontrado' });
    }

    const result = {
      ...proceso,
      nodes: proceso.nodos.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        descripcion: n.descripcion,
        config: JSON.parse(n.config || '{}'),
        position: { x: n.positionX, y: n.positionY }
      })),
      edges: proceso.edges.map(e => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        label: e.label
      })),
      kpis: proceso.kpis.map(k => ({
        ...k,
        alertas: {
          advertencia: k.alertaAdvertencia,
          critico: k.alertaCritico,
          direccion: k.alertaDireccion
        }
      }))
    };

    delete result.nodos;

    res.json(result);
  } catch (error) {
    console.error('Error al obtener proceso:', error);
    res.status(500).json({ error: 'Error al obtener proceso' });
  }
};

const createProceso = async (req, res) => {
  try {
    const { nombre, descripcion, version, estado, nodes, edges, objetivos, kpis, createdBy } = req.body;

    const proceso = await prisma.proceso.create({
      data: {
        nombre,
        descripcion,
        version: version || '1.0',
        estado: estado || 'borrador',
        createdBy: createdBy || 'system',
        nodos: {
          create: (nodes || []).map(n => ({
            type: n.type,
            label: n.label,
            descripcion: n.descripcion,
            config: JSON.stringify(n.config || {}),
            positionX: n.position?.x || 0,
            positionY: n.position?.y || 0
          }))
        }
      },
      include: {
        nodos: true
      }
    });

    // Crear edges después de tener los nodos
    if (edges && edges.length > 0) {
      // Mapear IDs temporales a IDs reales
      const nodeIdMap = {};
      nodes.forEach((n, i) => {
        nodeIdMap[n.id] = proceso.nodos[i].id;
      });

      await prisma.processEdge.createMany({
        data: edges.map(e => ({
          procesoId: proceso.id,
          sourceNodeId: nodeIdMap[e.sourceNodeId] || e.sourceNodeId,
          targetNodeId: nodeIdMap[e.targetNodeId] || e.targetNodeId,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          label: e.label
        }))
      });
    }

    // Crear objetivos y KPIs
    if (objetivos && objetivos.length > 0) {
      for (const obj of objetivos) {
        const objetivo = await prisma.objetivoProceso.create({
          data: {
            procesoId: proceso.id,
            nombre: obj.nombre,
            descripcion: obj.descripcion,
            tipo: obj.tipo,
            progreso: obj.progreso || 0
          }
        });

        if (obj.kpis && obj.kpis.length > 0) {
          await prisma.kpiProceso.createMany({
            data: obj.kpis.map(k => ({
              procesoId: proceso.id,
              objetivoId: objetivo.id,
              nombre: k.nombre,
              descripcion: k.descripcion,
              unidad: k.escala || k.unidad || 'porcentaje',
              meta: k.meta,
              valorActual: k.valorActual || 0
            }))
          });
        }
      }
    }

    // Obtener proceso completo
    const procesoCompleto = await prisma.proceso.findUnique({
      where: { id: proceso.id },
      include: {
        nodos: true,
        edges: true,
        objetivos: { include: { kpis: true } },
        kpis: true
      }
    });

    res.status(201).json(procesoCompleto);
  } catch (error) {
    console.error('Error al crear proceso:', error);
    res.status(500).json({ error: 'Error al crear proceso' });
  }
};

const updateProceso = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, version, estado, nodes, edges } = req.body;

    // Actualizar datos básicos
    const proceso = await prisma.proceso.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        version,
        estado
      }
    });

    // Si se envían nodos, actualizar
    if (nodes) {
      // Eliminar nodos existentes
      await prisma.processNode.deleteMany({ where: { procesoId: id } });

      // Crear nuevos nodos
      const nuevosNodos = await Promise.all(nodes.map(n =>
        prisma.processNode.create({
          data: {
            procesoId: id,
            type: n.type,
            label: n.label,
            descripcion: n.descripcion,
            config: JSON.stringify(n.config || {}),
            positionX: n.position?.x || 0,
            positionY: n.position?.y || 0
          }
        })
      ));

      // Mapear IDs
      const nodeIdMap = {};
      nodes.forEach((n, i) => {
        nodeIdMap[n.id] = nuevosNodos[i].id;
      });

      // Eliminar y recrear edges
      await prisma.processEdge.deleteMany({ where: { procesoId: id } });

      if (edges && edges.length > 0) {
        await prisma.processEdge.createMany({
          data: edges.map(e => ({
            procesoId: id,
            sourceNodeId: nodeIdMap[e.sourceNodeId] || e.sourceNodeId,
            targetNodeId: nodeIdMap[e.targetNodeId] || e.targetNodeId,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            label: e.label
          }))
        });
      }
    }

    // Obtener proceso actualizado
    const procesoActualizado = await prisma.proceso.findUnique({
      where: { id },
      include: {
        nodos: true,
        edges: true,
        objetivos: { include: { kpis: true } },
        kpis: true
      }
    });

    res.json(procesoActualizado);
  } catch (error) {
    console.error('Error al actualizar proceso:', error);
    res.status(500).json({ error: 'Error al actualizar proceso' });
  }
};

const deleteProceso = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.proceso.delete({ where: { id } });
    res.json({ message: 'Proceso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proceso:', error);
    res.status(500).json({ error: 'Error al eliminar proceso' });
  }
};

// ==================== KPIs ====================

const getKpis = async (req, res) => {
  try {
    const { procesoId } = req.query;

    const where = {};
    if (procesoId) where.procesoId = procesoId;

    const kpis = await prisma.kpiProceso.findMany({
      where,
      include: {
        proceso: true,
        objetivo: true,
        historico: {
          orderBy: { timestamp: 'desc' },
          take: 100
        }
      }
    });

    res.json(kpis.map(k => ({
      ...k,
      alertas: {
        advertencia: k.alertaAdvertencia,
        critico: k.alertaCritico,
        direccion: k.alertaDireccion
      }
    })));
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
};

const updateKpiValor = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, nodoId, metadatos } = req.body;

    // Actualizar valor actual
    const kpi = await prisma.kpiProceso.update({
      where: { id },
      data: {
        valorActual: valor,
        fechaUltimaActualizacion: new Date()
      }
    });

    // Guardar en histórico
    await prisma.kpiHistorico.create({
      data: {
        kpiId: id,
        valor,
        procesoId: kpi.procesoId,
        nodoId,
        metadatos: metadatos ? JSON.stringify(metadatos) : null
      }
    });

    res.json(kpi);
  } catch (error) {
    console.error('Error al actualizar KPI:', error);
    res.status(500).json({ error: 'Error al actualizar KPI' });
  }
};

module.exports = {
  getProcesos,
  getProcesoById,
  createProceso,
  updateProceso,
  deleteProceso,
  getKpis,
  updateKpiValor
};
