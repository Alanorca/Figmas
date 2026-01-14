const express = require('express');
const router = express.Router();
const controller = require('../controllers/organigramas.controller');

// ==================== ORGANIGRAMAS ====================
router.get('/', controller.getOrganigramas);
router.get('/:id', controller.getOrganigramaById);
router.post('/', controller.createOrganigrama);
router.put('/:id', controller.updateOrganigrama);
router.delete('/:id', controller.deleteOrganigrama);

// ==================== NODOS ====================
router.post('/nodos', controller.addNodo);
router.put('/nodos/:id', controller.updateNodo);
router.delete('/nodos/:id', controller.deleteNodo);

module.exports = router;
