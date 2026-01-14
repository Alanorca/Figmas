const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', usuariosController.getUsuarios);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', usuariosController.getUsuarioById);

// POST /api/usuarios - Crear usuario
router.post('/', usuariosController.createUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', usuariosController.updateUsuario);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', usuariosController.deleteUsuario);

// PATCH /api/usuarios/:id/estado - Cambiar estado
router.patch('/:id/estado', usuariosController.cambiarEstado);

// POST /api/usuarios/:id/roles - Asignar rol
router.post('/:id/roles', usuariosController.asignarRol);

// DELETE /api/usuarios/:id/roles/:rolId - Remover rol
router.delete('/:id/roles/:rolId', usuariosController.removerRol);

module.exports = router;
