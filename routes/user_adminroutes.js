const express = require('express');
const router = express.Router();
const adminController = require('../controllers/user_admin');
const verificarToken = require('../middlewares/verificarToken');

router.post('/cadastro', adminController.cadastroAdmin);
router.post('/login', adminController.loginAdmin);
router.get('/', adminController.getAdmin);
router.get('/:id', adminController.getAdminId);
router.patch('/:id', verificarToken, adminController.editarAdmin);
router.delete('/:id', verificarToken, adminController.deletarAdmin);
router.post('/forgot-password', adminController.requestPasswordReset);
router.post('/verify-reset-code', adminController.verifyResetCode);
router.post('/reset-password', adminController.resetPassword);

module.exports = router;