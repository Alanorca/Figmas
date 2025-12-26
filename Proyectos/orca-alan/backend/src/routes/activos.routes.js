const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');

// GET /api/activos - Obtener todos los activos (árbol)
router.get('/', activosController.getActivos);

// GET /api/activos/:id - Obtener activo por ID
router.get('/:id', activosController.getActivoById);

module.exports = router;
