const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticas.controller');

// GET /api/estadisticas/usuarios - Estadísticas de usuarios
router.get('/usuarios', estadisticasController.getEstadisticasUsuarios);

// GET /api/estadisticas/roles - Estadísticas de roles
router.get('/roles', estadisticasController.getEstadisticasRoles);

// GET /api/estadisticas/dashboard - Dashboard general
router.get('/dashboard', estadisticasController.getDashboard);

module.exports = router;
