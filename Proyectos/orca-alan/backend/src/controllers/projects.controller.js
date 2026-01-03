const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================================
// PROYECTOS
// ============================================================

const getProjects = async (req, res) => {
  try {
    const { status, priority, responsibleUserId, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (responsibleUserId) where.responsibleUserId = responsibleUserId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        objectives: true,
        kpis: true,
        phases: {
          orderBy: { orderNum: 'asc' },
          include: {
            tasks: true
          }
        },
        _count: {
          select: { tasks: true, phases: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular progreso real de cada proyecto
    const projectsWithProgress = projects.map(project => {
      const totalTasks = project.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
      const completedTasks = project.phases.reduce((sum, phase) =>
        sum + phase.tasks.filter(t => t.status === 'completed').length, 0);

      const calculatedProgress = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

      return {
        ...project,
        calculatedProgress,
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          pending: project.phases.reduce((sum, phase) =>
            sum + phase.tasks.filter(t => t.status === 'pending').length, 0),
          inProgress: project.phases.reduce((sum, phase) =>
            sum + phase.tasks.filter(t => t.status === 'in_progress').length, 0),
          blocked: project.phases.reduce((sum, phase) =>
            sum + phase.tasks.filter(t => t.status === 'blocked').length, 0)
        }
      };
    });

    res.json(projectsWithProgress);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        objectives: true,
        kpis: true,
        phases: {
          orderBy: { orderNum: 'asc' },
          include: {
            tasks: {
              include: {
                evidences: true,
                history: {
                  orderBy: { timestamp: 'desc' },
                  take: 10
                }
              }
            },
            dependsOn: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: true, message: 'Proyecto no encontrado' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      responsibleUserId,
      orgUnitId,
      priority,
      status,
      reminderDays,
      objectives,
      kpis,
      phases,
      createdBy
    } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        responsibleUserId,
        orgUnitId,
        priority: priority || 'medium',
        status: status || 'planning',
        reminderDays: JSON.stringify(reminderDays || [7, 3, 1]),
        createdBy: createdBy || 'system',
        objectives: objectives?.length > 0 ? {
          create: objectives.map(obj => ({
            description: obj.description,
            category: obj.category,
            status: obj.status || 'pending',
            targetDate: obj.targetDate ? new Date(obj.targetDate) : null
          }))
        } : undefined,
        kpis: kpis?.length > 0 ? {
          create: kpis.map(kpi => ({
            name: kpi.name,
            description: kpi.description,
            targetValue: kpi.targetValue,
            currentValue: kpi.currentValue || 0,
            unit: kpi.unit,
            formulaType: kpi.formulaType,
            formula: kpi.formula
          }))
        } : undefined,
        phases: phases?.length > 0 ? {
          create: phases.map((phase, index) => ({
            name: phase.name,
            description: phase.description,
            orderNum: phase.orderNum || index + 1,
            startDate: new Date(phase.startDate),
            endDate: new Date(phase.endDate),
            weight: phase.weight || 100,
            status: phase.status || 'pending'
          }))
        } : undefined
      },
      include: {
        objectives: true,
        kpis: true,
        phases: true
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      responsibleUserId,
      orgUnitId,
      priority,
      status,
      reminderDays,
      progress
    } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        responsibleUserId,
        orgUnitId,
        priority,
        status,
        reminderDays: reminderDays ? JSON.stringify(reminderDays) : undefined,
        progress
      },
      include: {
        objectives: true,
        kpis: true,
        phases: true
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Proyecto eliminado' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: { status }
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// OBJETIVOS SMART
// ============================================================

const getProjectObjectives = async (req, res) => {
  try {
    const { id } = req.params;

    const objectives = await prisma.projectObjective.findMany({
      where: { projectId: id }
    });

    res.json(objectives);
  } catch (error) {
    console.error('Error getting objectives:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createProjectObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category, status, targetDate } = req.body;

    const objective = await prisma.projectObjective.create({
      data: {
        projectId: id,
        description,
        category,
        status: status || 'pending',
        targetDate: targetDate ? new Date(targetDate) : null
      }
    });

    res.status(201).json(objective);
  } catch (error) {
    console.error('Error creating objective:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateProjectObjective = async (req, res) => {
  try {
    const { id, objectiveId } = req.params;
    const { description, category, status, targetDate, completedDate } = req.body;

    const objective = await prisma.projectObjective.update({
      where: { id: objectiveId },
      data: {
        description,
        category,
        status,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined
      }
    });

    res.json(objective);
  } catch (error) {
    console.error('Error updating objective:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteProjectObjective = async (req, res) => {
  try {
    const { objectiveId } = req.params;

    await prisma.projectObjective.delete({
      where: { id: objectiveId }
    });

    res.json({ success: true, message: 'Objetivo eliminado' });
  } catch (error) {
    console.error('Error deleting objective:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// KPIs
// ============================================================

const getProjectKPIs = async (req, res) => {
  try {
    const { id } = req.params;

    const kpis = await prisma.projectKPI.findMany({
      where: { projectId: id }
    });

    res.json(kpis);
  } catch (error) {
    console.error('Error getting KPIs:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createProjectKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, targetValue, unit, formulaType, formula } = req.body;

    const kpi = await prisma.projectKPI.create({
      data: {
        projectId: id,
        name,
        description,
        targetValue,
        unit,
        formulaType,
        formula
      }
    });

    res.status(201).json(kpi);
  } catch (error) {
    console.error('Error creating KPI:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateProjectKPI = async (req, res) => {
  try {
    const { kpiId } = req.params;
    const { name, description, targetValue, currentValue, unit, formulaType, formula, status } = req.body;

    const kpi = await prisma.projectKPI.update({
      where: { id: kpiId },
      data: {
        name,
        description,
        targetValue,
        currentValue,
        unit,
        formulaType,
        formula,
        status
      }
    });

    res.json(kpi);
  } catch (error) {
    console.error('Error updating KPI:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteProjectKPI = async (req, res) => {
  try {
    const { kpiId } = req.params;

    await prisma.projectKPI.delete({
      where: { id: kpiId }
    });

    res.json({ success: true, message: 'KPI eliminado' });
  } catch (error) {
    console.error('Error deleting KPI:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// FASES
// ============================================================

const getProjectPhases = async (req, res) => {
  try {
    const { id } = req.params;

    const phases = await prisma.projectPhase.findMany({
      where: { projectId: id },
      include: {
        tasks: true,
        dependsOn: true
      },
      orderBy: { orderNum: 'asc' }
    });

    res.json(phases);
  } catch (error) {
    console.error('Error getting phases:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const createProjectPhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, orderNum, startDate, endDate, weight, dependsOnPhaseId } = req.body;

    // Obtener el último orderNum si no se proporciona
    let finalOrderNum = orderNum;
    if (!finalOrderNum) {
      const lastPhase = await prisma.projectPhase.findFirst({
        where: { projectId: id },
        orderBy: { orderNum: 'desc' }
      });
      finalOrderNum = (lastPhase?.orderNum || 0) + 1;
    }

    const phase = await prisma.projectPhase.create({
      data: {
        projectId: id,
        name,
        description,
        orderNum: finalOrderNum,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        weight: weight || 100,
        dependsOnPhaseId
      },
      include: {
        dependsOn: true
      }
    });

    res.status(201).json(phase);
  } catch (error) {
    console.error('Error creating phase:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updateProjectPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const { name, description, orderNum, startDate, endDate, actualStartDate, actualEndDate, status, weight, dependsOnPhaseId, progress } = req.body;

    const phase = await prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        name,
        description,
        orderNum,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        actualStartDate: actualStartDate ? new Date(actualStartDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
        status,
        weight,
        dependsOnPhaseId,
        progress
      },
      include: {
        tasks: true,
        dependsOn: true
      }
    });

    res.json(phase);
  } catch (error) {
    console.error('Error updating phase:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const deleteProjectPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;

    await prisma.projectPhase.delete({
      where: { id: phaseId }
    });

    res.json({ success: true, message: 'Fase eliminada' });
  } catch (error) {
    console.error('Error deleting phase:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const updatePhaseStatus = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const { status } = req.body;

    const updateData = { status };

    // Si cambia a in_progress, registrar fecha real de inicio
    if (status === 'in_progress') {
      updateData.actualStartDate = new Date();
    }
    // Si cambia a completed, registrar fecha real de fin
    if (status === 'completed') {
      updateData.actualEndDate = new Date();
    }

    const phase = await prisma.projectPhase.update({
      where: { id: phaseId },
      data: updateData
    });

    res.json(phase);
  } catch (error) {
    console.error('Error updating phase status:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const reorderPhases = async (req, res) => {
  try {
    const { id } = req.params;
    const { phases } = req.body; // Array de { id, orderNum }

    const updates = phases.map(phase =>
      prisma.projectPhase.update({
        where: { id: phase.id },
        data: { orderNum: phase.orderNum }
      })
    );

    await prisma.$transaction(updates);

    const updatedPhases = await prisma.projectPhase.findMany({
      where: { projectId: id },
      orderBy: { orderNum: 'asc' }
    });

    res.json(updatedPhases);
  } catch (error) {
    console.error('Error reordering phases:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================================
// VISTAS: DASHBOARD, GANTT, CALENDARIO
// ============================================================

const getProjectDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        objectives: true,
        kpis: true,
        phases: {
          include: { tasks: true },
          orderBy: { orderNum: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: true, message: 'Proyecto no encontrado' });
    }

    // Calcular estadísticas
    const allTasks = project.phases.flatMap(p => p.tasks);
    const today = new Date();

    const dashboard = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        daysRemaining: Math.ceil((new Date(project.endDate) - today) / (1000 * 60 * 60 * 24))
      },
      progress: {
        overall: allTasks.length > 0
          ? Math.round(allTasks.filter(t => t.status === 'completed').length / allTasks.length * 100)
          : 0,
        byPhase: project.phases.map(phase => ({
          id: phase.id,
          name: phase.name,
          progress: phase.tasks.length > 0
            ? Math.round(phase.tasks.filter(t => t.status === 'completed').length / phase.tasks.length * 100)
            : 0,
          status: phase.status
        }))
      },
      tasks: {
        total: allTasks.length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        inProgress: allTasks.filter(t => t.status === 'in_progress').length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
        overdue: allTasks.filter(t =>
          t.status !== 'completed' && new Date(t.dueDate) < today
        ).length
      },
      objectives: project.objectives.map(obj => ({
        id: obj.id,
        description: obj.description,
        category: obj.category,
        status: obj.status
      })),
      kpis: project.kpis.map(kpi => ({
        id: kpi.id,
        name: kpi.name,
        currentValue: kpi.currentValue,
        targetValue: kpi.targetValue,
        unit: kpi.unit,
        status: kpi.status,
        percentage: kpi.targetValue > 0
          ? Math.round((kpi.currentValue / kpi.targetValue) * 100)
          : 0
      })),
      upcomingTasks: allTasks
        .filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error getting project dashboard:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getProjectGantt = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        phases: {
          include: {
            tasks: true,
            dependsOn: true
          },
          orderBy: { orderNum: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: true, message: 'Proyecto no encontrado' });
    }

    // Formatear datos para vista Gantt/Timeline
    const ganttData = {
      project: {
        id: project.id,
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate
      },
      items: []
    };

    project.phases.forEach(phase => {
      // Agregar fase
      ganttData.items.push({
        id: phase.id,
        type: 'phase',
        title: phase.name,
        startDate: phase.startDate,
        endDate: phase.endDate,
        progress: phase.progress,
        status: phase.status,
        dependsOn: phase.dependsOnPhaseId,
        children: phase.tasks.map(task => task.id)
      });

      // Agregar tareas de la fase
      phase.tasks.forEach(task => {
        ganttData.items.push({
          id: task.id,
          type: 'task',
          title: task.title,
          startDate: task.startDate,
          endDate: task.dueDate,
          progress: task.progress,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo,
          phaseId: phase.id
        });
      });
    });

    res.json(ganttData);
  } catch (error) {
    console.error('Error getting project Gantt:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

const getProjectCalendar = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    const where = { projectId: id };
    if (start && end) {
      where.OR = [
        { startDate: { gte: new Date(start), lte: new Date(end) } },
        { dueDate: { gte: new Date(start), lte: new Date(end) } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        phase: true
      }
    });

    // Formatear para calendario
    const events = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.startDate,
      end: task.dueDate,
      status: task.status,
      priority: task.priority,
      phase: task.phase.name,
      phaseId: task.phaseId,
      assignedTo: task.assignedTo,
      progress: task.progress,
      extendedProps: {
        taskType: task.taskType,
        linkedEntityType: task.linkedEntityType,
        linkedEntityId: task.linkedEntityId
      }
    }));

    res.json(events);
  } catch (error) {
    console.error('Error getting project calendar:', error);
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  // Proyectos
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  // Objetivos
  getProjectObjectives,
  createProjectObjective,
  updateProjectObjective,
  deleteProjectObjective,
  // KPIs
  getProjectKPIs,
  createProjectKPI,
  updateProjectKPI,
  deleteProjectKPI,
  // Fases
  getProjectPhases,
  createProjectPhase,
  updateProjectPhase,
  deleteProjectPhase,
  updatePhaseStatus,
  reorderPhases,
  // Vistas
  getProjectDashboard,
  getProjectGantt,
  getProjectCalendar
};
