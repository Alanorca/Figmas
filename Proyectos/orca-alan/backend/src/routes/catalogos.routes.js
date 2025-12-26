const express = require('express');
const router = express.Router();
const controller = require('../controllers/catalogos.controller');

// Obtener todos los catálogos agrupados
router.get('/', controller.getAllCatalogos);

// Seed de catálogos iniciales
router.post('/seed', controller.seedCatalogos);

// CRUD por tipo
router.get('/:tipo', controller.getCatalogosByTipo);
router.post('/', controller.createCatalogo);
router.put('/:id', controller.updateCatalogo);
router.delete('/:id', controller.deleteCatalogo);

module.exports = router;
