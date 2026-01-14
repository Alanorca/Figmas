const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projects.controller');

// ============================================================
// PROYECTOS
// ============================================================

// GET /api/projects - Listar proyectos (con filtros)
router.get('/', projectsController.getProjects);

// POST /api/projects - Crear proyecto
router.post('/', projectsController.createProject);

// GET /api/projects/:id - Obtener proyecto por ID
router.get('/:id', projectsController.getProjectById);

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', projectsController.updateProject);

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', projectsController.deleteProject);

// PATCH /api/projects/:id/status - Cambiar estado del proyecto
router.patch('/:id/status', projectsController.updateProjectStatus);

// ============================================================
// OBJETIVOS SMART
// ============================================================

// GET /api/projects/:id/objectives - Listar objetivos del proyecto
router.get('/:id/objectives', projectsController.getProjectObjectives);

// POST /api/projects/:id/objectives - Crear objetivo
router.post('/:id/objectives', projectsController.createProjectObjective);

// PUT /api/projects/:id/objectives/:objectiveId - Actualizar objetivo
router.put('/:id/objectives/:objectiveId', projectsController.updateProjectObjective);

// DELETE /api/projects/:id/objectives/:objectiveId - Eliminar objetivo
router.delete('/:id/objectives/:objectiveId', projectsController.deleteProjectObjective);

// ============================================================
// KPIs
// ============================================================

// GET /api/projects/:id/kpis - Listar KPIs del proyecto
router.get('/:id/kpis', projectsController.getProjectKPIs);

// POST /api/projects/:id/kpis - Crear KPI
router.post('/:id/kpis', projectsController.createProjectKPI);

// PUT /api/projects/:id/kpis/:kpiId - Actualizar KPI
router.put('/:id/kpis/:kpiId', projectsController.updateProjectKPI);

// DELETE /api/projects/:id/kpis/:kpiId - Eliminar KPI
router.delete('/:id/kpis/:kpiId', projectsController.deleteProjectKPI);

// ============================================================
// FASES
// ============================================================

// GET /api/projects/:id/phases - Listar fases del proyecto
router.get('/:id/phases', projectsController.getProjectPhases);

// POST /api/projects/:id/phases - Crear fase
router.post('/:id/phases', projectsController.createProjectPhase);

// POST /api/projects/:id/phases/reorder - Reordenar fases
router.post('/:id/phases/reorder', projectsController.reorderPhases);

// PUT /api/projects/:id/phases/:phaseId - Actualizar fase
router.put('/:id/phases/:phaseId', projectsController.updateProjectPhase);

// DELETE /api/projects/:id/phases/:phaseId - Eliminar fase
router.delete('/:id/phases/:phaseId', projectsController.deleteProjectPhase);

// PATCH /api/projects/:id/phases/:phaseId/status - Cambiar estado de fase
router.patch('/:id/phases/:phaseId/status', projectsController.updatePhaseStatus);

// ============================================================
// VISTAS
// ============================================================

// GET /api/projects/:id/dashboard - Dashboard del proyecto
router.get('/:id/dashboard', projectsController.getProjectDashboard);

// GET /api/projects/:id/gantt - Datos para vista Gantt
router.get('/:id/gantt', projectsController.getProjectGantt);

// GET /api/projects/:id/calendar - Datos para vista Calendario
router.get('/:id/calendar', projectsController.getProjectCalendar);

module.exports = router;
