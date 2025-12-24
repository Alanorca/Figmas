const express = require('express');
const router = express.Router();
const modulosController = require('../controllers/modulos.controller');

// GET /api/modulos - Obtener todos los módulos
router.get('/', modulosController.getModulos);

// GET /api/modulos/:id - Obtener módulo por ID
router.get('/:id', modulosController.getModuloById);

// GET /api/modulos/rol/:rolId/permisos - Obtener permisos de un rol por módulo
router.get('/rol/:rolId/permisos', modulosController.getPermisosRolPorModulo);

module.exports = router;
