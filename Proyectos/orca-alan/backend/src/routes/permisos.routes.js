const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisos.controller');

// GET /api/permisos - Obtener todos los permisos
router.get('/', permisosController.getPermisos);

// GET /api/permisos/agrupados - Obtener permisos agrupados por módulo
router.get('/agrupados', permisosController.getPermisosAgrupados);

// GET /api/permisos/:id - Obtener permiso por ID
router.get('/:id', permisosController.getPermisoById);

module.exports = router;
