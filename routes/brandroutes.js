const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand');
const verificarToken = require('../middlewares/verificarToken');

router.post('/', brandController.cadastroBrand);
router.get('/', brandController.getBrand);
router.get('/:id', brandController.getBrandId);
router.patch('/:id', verificarToken, brandController.editarBrand);

module.exports = router;
