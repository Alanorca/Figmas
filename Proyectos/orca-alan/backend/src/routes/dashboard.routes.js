const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

// ==================== DASHBOARD CONFIGS ====================
router.get('/', controller.getDashboardConfigs);
router.get('/default', controller.getDashboardDefault);
router.get('/:id', controller.getDashboardById);
router.post('/', controller.createDashboardConfig);
router.put('/:id', controller.updateDashboardConfig);
router.delete('/:id', controller.deleteDashboardConfig);

// ==================== WIDGETS ====================
router.post('/widgets', controller.addWidget);
router.put('/widgets/:id', controller.updateWidget);
router.put('/widgets/layout', controller.updateWidgetsLayout);
router.delete('/widgets/:id', controller.deleteWidget);

module.exports = router;
