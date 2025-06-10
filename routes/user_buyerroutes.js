const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/user_buyer');
const verificarToken = require('../middlewares/verificarToken');

router.post('/cadastro', buyerController.cadastroComprador);
router.post('/login', buyerController.loginComprador);
router.get('/', buyerController.getComprador);
router.get('/:id', buyerController.getCompradorId);
router.patch('/:id', verificarToken, buyerController.editarComprador);
router.delete('/:id', verificarToken, buyerController.deletarComprador);

module.exports = router;