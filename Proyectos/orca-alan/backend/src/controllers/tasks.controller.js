const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// TAREAS
// ============================================================

const getTasks = async (req, res) => {
  try {
    const {
      projectId,
      phaseId,
      assignedTo,
      status,
      taskType,
      priority,
      dueBefore,
      linkedEntityType,
      linkedEntityId
    } = req.query;

    const where = {};
    if (projectId) where.projectId = projectId;
    if (phaseId) where.phaseId = phaseId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (status) {
      // Soportar múltiples estados separados por coma
      const statuses = status.split(',');
      where.status = statuses.length > 1 ? { in: statuses } : status;
    }
    if (taskType) {
      const types = taskType.split(',');
      where.taskType = types.length > 1 ? { in: types } : taskType;
    }
    if (priority) where.priority = priority;
    if (dueBefore) where.dueDate = { lte: new Date(dueBefore) };
    if (linkedEntityType) where.linkedEntityType = linkedEntityType;
    if (linkedEntityId) where.linkedEntityId = linkedEntityId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true }
        },
        phase: {
          select: { id: true, name: true }
        },
        evidences: true,
        _count: {
          select: { evidences: true, history: true }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        phase: true,
        evidences: true,
        history: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: true, message: 'Tarea no encontrada' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      projectId,
      phaseId,
      title,
      description,
      assignedTo,
      assignedBy,
      startDate,
      dueDate,
      priority,
      estimatedHours,
      taskType,
      linkedEntityType,
      linkedEntityId,
      createdBy
    } = req.body;

    const task = await prisma.task.create({
      data: {
        projectId,
        phaseId,
        title,
        description,
        assignedTo,
        assignedBy: assignedBy || createdBy || 'system',
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        estimatedHours,
        taskType: taskType || 'manual',
        linkedEntityType,
        linkedEntityId,
        createdBy: createdBy || 'system',
        history: {
          create: {
            userId: createdBy || 'system',
            action: 'created',
            changes: JSON.stringify({ title, assignedTo, status: 'pending' })
          }
        }
      },
      include: {
        project: { select: { id: true, name: true } },
        phase: { select: { id: true, name: true } },
        history: true
      }
    });

    // Actualizar progreso de la fase
    await updatePhaseProgress(phaseId);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startDate,
      dueDate,
      priority,
      estimatedHours,
      actualHours,
      taskType,
      linkedEntityType,
      linkedEntityId,
      userId
    } = req.body;

    // Obtener tarea actual para registrar cambios
    const currentTask = await prisma.task.findUnique({ where: { id } });
    const changes = {};
    if (title !== undefined && title !== currentTask.title) changes.title = { old: currentTask.title, new: title };
    if (description !== undefined && description !== currentTask.description) changes.description = { old: currentTask.description, new: description };
    if (priority !== undefined && priority !== currentTask.priority) changes.priority = { old: currentTask.priority, new: priority };

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        estimatedHours,
        actualHours,
        taskType,
        linkedEntityType,
        linkedEntityId,
        history: Object.keys(changes).length > 0 ? {
          create: {
            userId: userId || 'system',
            action: 'updated',
            changes: JSON.stringify(changes)
          }
        } : undefined
      },
      include: {
        project: { select: { id: true, name: true } },
        phase: { select: { id: true, name: true } },
        evidences: true
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    const phaseId = task.phaseId;

    await prisma.task.delete({
      where: { id }
    });

    // Actualizar progreso de la fase
    await updatePhaseProgress(phaseId);

    res.json({ success: true, message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId, comment } = req.body;

    const currentTask = await prisma.task.findUnique({ where: { id } });

    const updateData = { status };

    // Si se completa, registrar fecha
    if (status === 'completed') {
      updateData.completedDate = new Date();
      updateData.progress = 100;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        history: {
          create: {
            userId: userId || 'system',
            action: 'status_changed',
            changes: JSON.stringify({
              status: { old: currentTask.status, new: status }
            }),
            comment
          }
        }
      },
      include: {
        phase: true
      }
    });

    // Actualizar progreso de la fase
    await updatePhaseProgress(task.phaseId);

    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, actualHours, userId, comment } = req.body;

    const currentTask = await prisma.task.findUnique({ where: { id } });

    // Si el progreso es 100, marcar como completada
    const updateData = { progress };
    if (actualHours !== undefined) updateData.actualHours = actualHours;

    if (progress === 100 && currentTask.status !== 'completed') {
      updateData.status = 'completed';
      updateData.completedDate = new Date();
    } else if (progress > 0 && progress < 100 && currentTask.status === 'pending') {
      updateData.status = 'in_progress';
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...updateData,
        history: {
          create: {
            userId: userId || 'system',
            action: 'progress_updated',
            changes: JSON.stringify({
              progress: { old: currentTask.progress, new: progress }
            }),
            comment
          }
        }
      },
      include: {
        phase: true
      }
    });

    // Actualizar progreso de la fase
    await updatePhaseProgress(task.phaseId);

    res.json(task);
  } catch (error) {
    console.error('Error updating task progress:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedBy, reason } = req.body;

    const currentTask = await prisma.task.findUnique({ where: { id } });

    const task = await prisma.task.update({
      where: { id },
      data: {
        assignedTo,
        assignedBy: assignedBy || 'system',
        assignedAt: new Date(),
        history: {
          create: {
            userId: assignedBy || 'system',
            action: 'assigned',
            changes: JSON.stringify({
              assignedTo: { old: currentTask.assignedTo, new: assignedTo }
            }),
            comment: reason
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// EVIDENCIAS
// ============================================================

const getTaskEvidences = async (req, res) => {
  try {
    const { id } = req.params;

    const evidences = await prisma.taskEvidence.findMany({
      where: { taskId: id },
      orderBy: { uploadedAt: 'desc' }
    });

    res.json(evidences);
  } catch (error) {
    console.error('Error getting task evidences:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createTaskEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, fileType, fileSize, storageUrl, evidenceType, description, documentDate, uploadedBy } = req.body;

    const evidence = await prisma.taskEvidence.create({
      data: {
        taskId: id,
        fileName,
        fileType,
        fileSize,
        storageUrl,
        evidenceType: evidenceType || 'document',
        description,
        documentDate: documentDate ? new Date(documentDate) : null,
        uploadedBy: uploadedBy || 'system'
      }
    });

    // Registrar en historial de la tarea
    await prisma.taskHistory.create({
      data: {
        taskId: id,
        userId: uploadedBy || 'system',
        action: 'updated',
        changes: JSON.stringify({ evidenceAdded: fileName })
      }
    });

    res.status(201).json(evidence);
  } catch (error) {
    console.error('Error creating task evidence:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteTaskEvidence = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    await prisma.taskEvidence.delete({
      where: { id: evidenceId }
    });

    res.json({ success: true, message: 'Evidencia eliminada' });
  } catch (error) {
    console.error('Error deleting task evidence:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// CALENDARIO PERSONAL
// ============================================================

const getMyTasks = async (req, res) => {
  try {
    const { userId, start, end } = req.query;

    if (!userId) {
      return res.status(400).json({ error: true, message: 'userId es requerido' });
    }

    const where = { assignedTo: userId };
    if (start && end) {
      where.OR = [
        { startDate: { gte: new Date(start), lte: new Date(end) } },
        { dueDate: { gte: new Date(start), lte: new Date(end) } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        phase: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Formatear para calendario
    const events = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.startDate,
      end: task.dueDate,
      status: task.status,
      priority: task.priority,
      project: task.project.name,
      projectId: task.projectId,
      phase: task.phase.name,
      phaseId: task.phaseId,
      progress: task.progress
    }));

    res.json(events);
  } catch (error) {
    console.error('Error getting my tasks:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// VINCULACIÓN CON ENTIDADES
// ============================================================

const createTaskFromEntity = async (req, res) => {
  try {
    const {
      projectId,
      phaseId,
      title,
      description,
      assignedTo,
      assignedBy,
      dueDate,
      priority,
      taskType,
      linkedEntityType,
      linkedEntityId,
      createdBy
    } = req.body;

    // Validar que exista la entidad vinculada (según el tipo)
    // TODO: Implementar validación real según linkedEntityType

    const task = await prisma.task.create({
      data: {
        projectId,
        phaseId,
        title,
        description,
        assignedTo,
        assignedBy: assignedBy || createdBy || 'system',
        startDate: new Date(),
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        taskType,
        linkedEntityType,
        linkedEntityId,
        createdBy: createdBy || 'system',
        history: {
          create: {
            userId: createdBy || 'system',
            action: 'created',
            changes: JSON.stringify({
              title,
              linkedEntityType,
              linkedEntityId,
              source: `Creado desde ${linkedEntityType}: ${linkedEntityId}`
            })
          }
        }
      },
      include: {
        project: { select: { id: true, name: true } },
        phase: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task from entity:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// HELPERS
// ============================================================

async function updatePhaseProgress(phaseId) {
  const tasks = await prisma.task.findMany({
    where: { phaseId }
  });

  if (tasks.length === 0) return;

  const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
  const avgProgress = Math.round(totalProgress / tasks.length);

  // Determinar estado de la fase
  let phaseStatus = 'pending';
  const allCompleted = tasks.every(t => t.status === 'completed');
  const anyInProgress = tasks.some(t => t.status === 'in_progress' || t.status === 'in_review');

  if (allCompleted) {
    phaseStatus = 'completed';
  } else if (anyInProgress) {
    phaseStatus = 'in_progress';
  }

  await prisma.projectPhase.update({
    where: { id: phaseId },
    data: {
      progress: avgProgress,
      status: phaseStatus,
      actualEndDate: allCompleted ? new Date() : null
    }
  });

  // También actualizar progreso del proyecto
  const phase = await prisma.projectPhase.findUnique({
    where: { id: phaseId },
    select: { projectId: true }
  });

  if (phase) {
    await updateProjectProgress(phase.projectId);
  }
}

async function updateProjectProgress(projectId) {
  const phases = await prisma.projectPhase.findMany({
    where: { projectId }
  });

  if (phases.length === 0) return;

  // Calcular progreso ponderado
  const totalWeight = phases.reduce((sum, p) => sum + p.weight, 0);
  const weightedProgress = phases.reduce((sum, p) => {
    const phaseWeight = p.weight / totalWeight;
    return sum + (p.progress * phaseWeight);
  }, 0);

  await prisma.project.update({
    where: { id: projectId },
    data: { progress: Math.round(weightedProgress) }
  });
}

module.exports = {
  // Tareas
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskProgress,
  assignTask,
  // Evidencias
  getTaskEvidences,
  createTaskEvidence,
  deleteTaskEvidence,
  // Calendario personal
  getMyTasks,
  // Vinculación
  createTaskFromEntity
};
