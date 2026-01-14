const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==================== MARCOS NORMATIVOS ====================

const getMarcosNormativos = async (req, res) => {
  try {
    const marcos = await prisma.marcoNormativo.findMany({
      where: { activo: true },
      include: { requisitos: true },
      orderBy: { nombre: 'asc' }
    });

    res.json(marcos.map(m => ({
      ...m,
      requisitos: m.requisitos.map(r => ({
        ...r,
        controlesAsociados: JSON.parse(r.controlesAsociados || '[]')
      }))
    })));
  } catch (error) {
    console.error('Error al obtener marcos normativos:', error);
    res.status(500).json({ error: 'Error al obtener marcos normativos' });
  }
};

const createMarcoNormativo = async (req, res) => {
  try {
    const { nombre, acronimo, version, fechaVigencia, descripcion, requisitos } = req.body;

    const marco = await prisma.marcoNormativo.create({
      data: {
        nombre,
        acronimo,
        version,
        fechaVigencia: new Date(fechaVigencia),
        descripcion,
        requisitos: {
          create: (requisitos || []).map(r => ({
            codigo: r.codigo,
            nombre: r.nombre,
            descripcion: r.descripcion,
            controlesAsociados: JSON.stringify(r.controlesAsociados || [])
          }))
        }
      },
      include: { requisitos: true }
    });

    res.status(201).json(marco);
  } catch (error) {
    console.error('Error al crear marco normativo:', error);
    res.status(500).json({ error: 'Error al crear marco normativo' });
  }
};

// ==================== CUESTIONARIOS ====================

const getCuestionarios = async (req, res) => {
  try {
    const { estado, categoria, marcoNormativoId } = req.query;

    const where = {};
    if (estado) where.estado = estado;
    if (categoria) where.categoria = categoria;
    if (marcoNormativoId) where.marcoNormativoId = marcoNormativoId;

    const cuestionarios = await prisma.cuestionario.findMany({
      where,
      include: {
        marcoNormativo: true,
        secciones: {
          include: { preguntas: true },
          orderBy: { orden: 'asc' }
        },
        asignaciones: true
      },
      orderBy: { fechaModificacion: 'desc' }
    });

    const result = cuestionarios.map(c => ({
      ...c,
      umbrales: JSON.parse(c.umbrales || '{}'),
      areasObjetivo: JSON.parse(c.areasObjetivo || '[]'),
      responsables: JSON.parse(c.responsables || '[]'),
      preguntas: c.secciones.reduce((acc, s) => acc + s.preguntas.length, 0),
      respuestas: 0, // Calcular desde asignaciones
      secciones: c.secciones.map(s => ({
        ...s,
        preguntas: s.preguntas.map(p => ({
          ...p,
          opciones: JSON.parse(p.opciones || '[]'),
          likertLabels: JSON.parse(p.likertLabels || '[]'),
          logicaCondicional: JSON.parse(p.logicaCondicional || 'null')
        }))
      }))
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener cuestionarios:', error);
    res.status(500).json({ error: 'Error al obtener cuestionarios' });
  }
};

const getCuestionarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const cuestionario = await prisma.cuestionario.findUnique({
      where: { id },
      include: {
        marcoNormativo: true,
        secciones: {
          include: { preguntas: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' }
        }
      }
    });

    if (!cuestionario) {
      return res.status(404).json({ error: 'Cuestionario no encontrado' });
    }

    res.json({
      ...cuestionario,
      umbrales: JSON.parse(cuestionario.umbrales || '{}'),
      areasObjetivo: JSON.parse(cuestionario.areasObjetivo || '[]'),
      responsables: JSON.parse(cuestionario.responsables || '[]'),
      secciones: cuestionario.secciones.map(s => ({
        ...s,
        preguntas: s.preguntas.map(p => ({
          ...p,
          opciones: JSON.parse(p.opciones || '[]'),
          likertLabels: JSON.parse(p.likertLabels || '[]'),
          logicaCondicional: JSON.parse(p.logicaCondicional || 'null')
        }))
      }))
    });
  } catch (error) {
    console.error('Error al obtener cuestionario:', error);
    res.status(500).json({ error: 'Error al obtener cuestionario' });
  }
};

const createCuestionario = async (req, res) => {
  try {
    const {
      nombre, descripcion, categoria, tipo, tipoEvaluacion, estado,
      marcoNormativoId, periodicidad, umbrales, areasObjetivo, responsables,
      secciones
    } = req.body;

    const cuestionario = await prisma.cuestionario.create({
      data: {
        nombre,
        descripcion,
        categoria,
        tipo,
        tipoEvaluacion,
        estado: estado || 'borrador',
        marcoNormativoId,
        periodicidad,
        umbrales: JSON.stringify(umbrales || { deficiente: 40, aceptable: 70, sobresaliente: 90 }),
        areasObjetivo: JSON.stringify(areasObjetivo || []),
        responsables: JSON.stringify(responsables || []),
        secciones: {
          create: (secciones || []).map((s, idx) => ({
            nombre: s.nombre,
            descripcion: s.descripcion,
            peso: s.peso || 1,
            requerida: s.requerida !== false,
            orden: idx,
            preguntas: {
              create: (s.preguntas || []).map((p, pIdx) => ({
                texto: p.texto,
                tipo: p.tipo,
                requerida: p.requerida !== false,
                peso: p.peso || 1,
                opciones: JSON.stringify(p.opciones || []),
                escalaMin: p.escalaMin,
                escalaMax: p.escalaMax,
                ayuda: p.ayuda,
                placeholder: p.placeholder,
                requisitoNormativoId: p.requisitoNormativoId,
                controlAsociado: p.controlAsociado,
                requiereEvidencia: p.requiereEvidencia || false,
                maxStars: p.maxStars,
                leftAnchor: p.leftAnchor,
                rightAnchor: p.rightAnchor,
                likertLabels: JSON.stringify(p.likertLabels || []),
                displayConditionQuestionId: p.displayConditionQuestionId,
                displayConditionAnswer: p.displayConditionAnswer,
                logicaCondicional: JSON.stringify(p.logicaCondicional || null),
                isCalculated: p.isCalculated || false,
                formula: p.formula,
                orden: pIdx
              }))
            }
          }))
        }
      },
      include: {
        secciones: { include: { preguntas: true } }
      }
    });

    res.status(201).json(cuestionario);
  } catch (error) {
    console.error('Error al crear cuestionario:', error);
    res.status(500).json({ error: 'Error al crear cuestionario' });
  }
};

const updateCuestionario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, categoria, tipo, tipoEvaluacion, estado,
      marcoNormativoId, periodicidad, umbrales, areasObjetivo, responsables
    } = req.body;

    const cuestionario = await prisma.cuestionario.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        categoria,
        tipo,
        tipoEvaluacion,
        estado,
        marcoNormativoId,
        periodicidad,
        umbrales: umbrales ? JSON.stringify(umbrales) : undefined,
        areasObjetivo: areasObjetivo ? JSON.stringify(areasObjetivo) : undefined,
        responsables: responsables ? JSON.stringify(responsables) : undefined
      },
      include: {
        secciones: { include: { preguntas: true } }
      }
    });

    res.json(cuestionario);
  } catch (error) {
    console.error('Error al actualizar cuestionario:', error);
    res.status(500).json({ error: 'Error al actualizar cuestionario' });
  }
};

const deleteCuestionario = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cuestionario.delete({ where: { id } });
    res.json({ message: 'Cuestionario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cuestionario:', error);
    res.status(500).json({ error: 'Error al eliminar cuestionario' });
  }
};

// ==================== ASIGNACIONES ====================

const getAsignaciones = async (req, res) => {
  try {
    const { cuestionarioId, estado } = req.query;

    const where = {};
    if (cuestionarioId) where.cuestionarioId = cuestionarioId;
    if (estado) where.estado = estado;

    const asignaciones = await prisma.asignacionCuestionario.findMany({
      where,
      include: {
        cuestionario: true,
        evaluadosExternos: true,
        respuestas: true
      },
      orderBy: { fechaAsignacion: 'desc' }
    });

    const result = asignaciones.map(a => ({
      ...a,
      cuestionarioIds: JSON.parse(a.cuestionarioIds || '[]'),
      usuariosAsignados: JSON.parse(a.usuariosAsignados || '[]'),
      usuariosAsignadosNombres: JSON.parse(a.usuariosAsignadosNombres || '[]'),
      emailsExternos: JSON.parse(a.emailsExternos || '[]'),
      activosObjetivo: JSON.parse(a.activosObjetivo || '[]'),
      activosObjetivoNombres: JSON.parse(a.activosObjetivoNombres || '[]'),
      procesosObjetivo: JSON.parse(a.procesosObjetivo || '[]'),
      procesosObjetivoNombres: JSON.parse(a.procesosObjetivoNombres || '[]'),
      aprobadores: JSON.parse(a.aprobadores || '[]'),
      aprobadoresNombres: JSON.parse(a.aprobadoresNombres || '[]'),
      evaluadosInternos: JSON.parse(a.evaluadosInternos || '[]'),
      evaluadosInternosNombres: JSON.parse(a.evaluadosInternosNombres || '[]'),
      recurrencia: JSON.parse(a.recurrencia || 'null')
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
};

const createAsignacion = async (req, res) => {
  try {
    const data = req.body;

    const asignacion = await prisma.asignacionCuestionario.create({
      data: {
        cuestionarioId: data.cuestionarioId,
        cuestionarioIds: JSON.stringify(data.cuestionarioIds || []),
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipoRevision: data.tipoRevision,
        usuariosAsignados: JSON.stringify(data.usuariosAsignados || []),
        usuariosAsignadosNombres: JSON.stringify(data.usuariosAsignadosNombres || []),
        emailsExternos: JSON.stringify(data.emailsExternos || []),
        contrasenaAcceso: data.contrasenaAcceso,
        activosObjetivo: JSON.stringify(data.activosObjetivo || []),
        activosObjetivoNombres: JSON.stringify(data.activosObjetivoNombres || []),
        procesosObjetivo: JSON.stringify(data.procesosObjetivo || []),
        procesosObjetivoNombres: JSON.stringify(data.procesosObjetivoNombres || []),
        aprobadores: JSON.stringify(data.aprobadores || []),
        aprobadoresNombres: JSON.stringify(data.aprobadoresNombres || []),
        evaluadosInternos: JSON.stringify(data.evaluadosInternos || []),
        evaluadosInternosNombres: JSON.stringify(data.evaluadosInternosNombres || []),
        areaId: data.areaId,
        areaNombre: data.areaNombre,
        responsableId: data.responsableId,
        responsableNombre: data.responsableNombre,
        fechaInicio: new Date(data.fechaInicio),
        fechaVencimiento: new Date(data.fechaVencimiento),
        instrucciones: data.instrucciones,
        recordatorios: data.recordatorios !== false,
        recurrencia: JSON.stringify(data.recurrencia || null),
        evaluadosExternos: {
          create: (data.evaluadosExternos || []).map(e => ({
            nombre: e.nombre,
            email: e.email,
            password: e.password
          }))
        }
      },
      include: {
        cuestionario: true,
        evaluadosExternos: true
      }
    });

    res.status(201).json(asignacion);
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ error: 'Error al crear asignación' });
  }
};

const updateAsignacionEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, progreso } = req.body;

    const asignacion = await prisma.asignacionCuestionario.update({
      where: { id },
      data: { estado, progreso }
    });

    res.json(asignacion);
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ error: 'Error al actualizar asignación' });
  }
};

// ==================== RESPUESTAS ====================

const getRespuestas = async (req, res) => {
  try {
    const { asignacionId, cuestionarioId } = req.query;

    const where = {};
    if (asignacionId) where.asignacionId = asignacionId;
    if (cuestionarioId) where.cuestionarioId = cuestionarioId;

    const respuestas = await prisma.respuestaCuestionario.findMany({
      where,
      include: {
        respondidoPor: true,
        respuestas: {
          include: {
            pregunta: true,
            evidencias: true
          }
        }
      }
    });

    res.json(respuestas.map(r => ({
      ...r,
      respuestas: r.respuestas.map(rp => ({
        ...rp,
        valor: JSON.parse(rp.valor || 'null'),
        archivosAdjuntos: JSON.parse(rp.archivosAdjuntos || '[]')
      }))
    })));
  } catch (error) {
    console.error('Error al obtener respuestas:', error);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
};

const saveRespuesta = async (req, res) => {
  try {
    const { asignacionId, cuestionarioId, respondidoPorId, respuestas } = req.body;

    // Buscar o crear respuesta de cuestionario
    let respuestaCuestionario = await prisma.respuestaCuestionario.findFirst({
      where: { asignacionId, cuestionarioId, respondidoPorId }
    });

    if (!respuestaCuestionario) {
      respuestaCuestionario = await prisma.respuestaCuestionario.create({
        data: {
          asignacionId,
          cuestionarioId,
          respondidoPorId
        }
      });
    }

    // Guardar respuestas individuales
    for (const resp of respuestas) {
      await prisma.respuestaPregunta.upsert({
        where: {
          id: resp.id || 'new'
        },
        create: {
          respuestaCuestionarioId: respuestaCuestionario.id,
          preguntaId: resp.preguntaId,
          valor: JSON.stringify(resp.valor),
          comentario: resp.comentario,
          archivosAdjuntos: JSON.stringify(resp.archivosAdjuntos || []),
          marcadaParaRevision: resp.marcadaParaRevision || false
        },
        update: {
          valor: JSON.stringify(resp.valor),
          comentario: resp.comentario,
          archivosAdjuntos: JSON.stringify(resp.archivosAdjuntos || []),
          marcadaParaRevision: resp.marcadaParaRevision || false
        }
      });
    }

    res.json({ message: 'Respuestas guardadas correctamente' });
  } catch (error) {
    console.error('Error al guardar respuestas:', error);
    res.status(500).json({ error: 'Error al guardar respuestas' });
  }
};

module.exports = {
  // Marcos Normativos
  getMarcosNormativos,
  createMarcoNormativo,
  // Cuestionarios
  getCuestionarios,
  getCuestionarioById,
  createCuestionario,
  updateCuestionario,
  deleteCuestionario,
  // Asignaciones
  getAsignaciones,
  createAsignacion,
  updateAsignacionEstado,
  // Respuestas
  getRespuestas,
  saveRespuesta
};
