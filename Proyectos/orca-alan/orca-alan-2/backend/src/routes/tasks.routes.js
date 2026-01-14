const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasks.controller');

// ============================================================
// TAREAS
// ============================================================

// GET /api/tasks - Listar tareas (con filtros)
// Filtros: projectId, phaseId, assignedTo, status, taskType, priority, dueBefore, linkedEntityType, linkedEntityId
router.get('/', tasksController.getTasks);

// POST /api/tasks - Crear tarea
router.post('/', tasksController.createTask);

// GET /api/tasks/:id - Obtener tarea por ID
router.get('/:id', tasksController.getTaskById);

// PUT /api/tasks/:id - Actualizar tarea
router.put('/:id', tasksController.updateTask);

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/:id', tasksController.deleteTask);

// PATCH /api/tasks/:id/status - Cambiar estado de tarea
router.patch('/:id/status', tasksController.updateTaskStatus);

// PATCH /api/tasks/:id/progress - Actualizar progreso de tarea
router.patch('/:id/progress', tasksController.updateTaskProgress);

// PATCH /api/tasks/:id/assign - Asignar/reasignar responsable
router.patch('/:id/assign', tasksController.assignTask);

// ============================================================
// EVIDENCIAS
// ============================================================

// GET /api/tasks/:id/evidences - Listar evidencias de tarea
router.get('/:id/evidences', tasksController.getTaskEvidences);

// POST /api/tasks/:id/evidences - Subir evidencia
router.post('/:id/evidences', tasksController.createTaskEvidence);

// DELETE /api/tasks/:id/evidences/:evidenceId - Eliminar evidencia
router.delete('/:id/evidences/:evidenceId', tasksController.deleteTaskEvidence);

// ============================================================
// CALENDARIO PERSONAL
// ============================================================

// GET /api/calendar/my-tasks - Calendario personal (todas las tareas del usuario)
router.get('/calendar/my-tasks', tasksController.getMyTasks);

// ============================================================
// VINCULACIÓN CON ENTIDADES
// ============================================================

// POST /api/tasks/link-entity - Crear tarea desde entidad (riesgo, incidente, defecto, ML)
router.post('/link-entity', tasksController.createTaskFromEntity);

module.exports = router;
