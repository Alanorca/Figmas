const express = require('express');
const router = express.Router();
const controller = require('../controllers/procesos.controller');

// ==================== PROCESOS ====================
router.get('/', controller.getProcesos);
router.get('/:id', controller.getProcesoById);
router.post('/', controller.createProceso);
router.put('/:id', controller.updateProceso);
router.delete('/:id', controller.deleteProceso);

// ==================== KPIs ====================
router.get('/kpis', controller.getKpis);
router.put('/kpis/:id/valor', controller.updateKpiValor);

module.exports = router;
