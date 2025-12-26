const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuestionarios.controller');

// ==================== MARCOS NORMATIVOS ====================
router.get('/marcos', controller.getMarcosNormativos);
router.post('/marcos', controller.createMarcoNormativo);

// ==================== ASIGNACIONES (antes de /:id para evitar conflicto) ====================
router.get('/asignaciones', controller.getAsignaciones);
router.post('/asignaciones', controller.createAsignacion);
router.put('/asignaciones/:id/estado', controller.updateAsignacionEstado);

// ==================== RESPUESTAS ====================
router.get('/respuestas', controller.getRespuestas);
router.post('/respuestas', controller.saveRespuesta);

// ==================== CUESTIONARIOS ====================
router.get('/', controller.getCuestionarios);
router.get('/:id', controller.getCuestionarioById);
router.post('/', controller.createCuestionario);
router.put('/:id', controller.updateCuestionario);
router.delete('/:id', controller.deleteCuestionario);

module.exports = router;
