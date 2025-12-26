const express = require('express');
const router = express.Router();
const controller = require('../controllers/cuestionarios.controller');

// ==================== MARCOS NORMATIVOS ====================
router.get('/marcos', controller.getMarcosNormativos);
router.post('/marcos', controller.createMarcoNormativo);

// ==================== CUESTIONARIOS ====================
router.get('/', controller.getCuestionarios);
router.get('/:id', controller.getCuestionarioById);
router.post('/', controller.createCuestionario);
router.put('/:id', controller.updateCuestionario);
router.delete('/:id', controller.deleteCuestionario);

// ==================== ASIGNACIONES ====================
router.get('/asignaciones', controller.getAsignaciones);
router.post('/asignaciones', controller.createAsignacion);
router.put('/asignaciones/:id/estado', controller.updateAsignacionEstado);

// ==================== RESPUESTAS ====================
router.get('/respuestas', controller.getRespuestas);
router.post('/respuestas', controller.saveRespuesta);

module.exports = router;
