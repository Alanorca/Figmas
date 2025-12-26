const express = require('express');
const router = express.Router();
const controller = require('../controllers/activos-negocio.controller');

// ==================== PLANTILLAS ====================
router.get('/plantillas', controller.getPlantillas);
router.get('/plantillas/:id', controller.getPlantillaById);
router.post('/plantillas', controller.createPlantilla);
router.put('/plantillas/:id', controller.updatePlantilla);

// ==================== RIESGOS (antes de /:id para evitar conflicto) ====================
router.get('/riesgos', controller.getRiesgos);
router.post('/riesgos', controller.createRiesgo);
router.put('/riesgos/:id', controller.updateRiesgo);
router.delete('/riesgos/:id', controller.deleteRiesgo);

// ==================== INCIDENTES ====================
router.get('/incidentes', controller.getIncidentes);
router.post('/incidentes', controller.createIncidente);
router.put('/incidentes/:id', controller.updateIncidente);
router.delete('/incidentes/:id', controller.deleteIncidente);

// ==================== DEFECTOS ====================
router.get('/defectos', controller.getDefectos);
router.post('/defectos', controller.createDefecto);
router.put('/defectos/:id', controller.updateDefecto);
router.delete('/defectos/:id', controller.deleteDefecto);

// ==================== ACTIVOS (al final porque usa :id) ====================
router.get('/', controller.getActivos);
router.get('/:id', controller.getActivoById);
router.post('/', controller.createActivo);
router.put('/:id', controller.updateActivo);
router.delete('/:id', controller.deleteActivo);

module.exports = router;
