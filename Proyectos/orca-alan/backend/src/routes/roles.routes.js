const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');

// GET /api/roles - Obtener todos los roles
router.get('/', rolesController.getRoles);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', rolesController.getRolById);

// POST /api/roles - Crear rol
router.post('/', rolesController.createRol);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', rolesController.updateRol);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', rolesController.deleteRol);

// POST /api/roles/:id/duplicar - Duplicar rol
router.post('/:id/duplicar', rolesController.duplicarRol);

// GET /api/roles/:id/usuarios - Obtener usuarios del rol
router.get('/:id/usuarios', rolesController.getUsuariosDeRol);

// GET /api/roles/:id/permisos - Obtener permisos del rol
router.get('/:id/permisos', rolesController.getPermisosDeRol);

module.exports = router;
