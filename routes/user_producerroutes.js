const express = require('express');
const router = express.Router();
const producerController = require('../controllers/user_producer');
const verificarToken = require('../middlewares/verificarToken');

router.post('/cadastro', producerController.cadastroProdutor);
router.post('/login', producerController.loginProdutor);
router.get('/', producerController.getProdutor);
router.get('/:id', producerController.getProdutorId);
router.patch('/:id', verificarToken, producerController.editarProdutor);
router.delete('/:id', verificarToken, producerController.deletarProdutor);
router.post('/forgot-password', producerController.requestPasswordReset);
router.post('/verify-reset-code', producerController.verifyResetCode);
router.post('/reset-password', producerController.resetPassword);

module.exports = router;