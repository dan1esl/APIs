const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications');
const verificarToken = require('../middlewares/verificarToken');

router.post('/enviar', verificarToken, notificationsController.createNotification);
router.get('/', notificationsController.getNotifications);
router.patch('/atualizar/:id', verificarToken, notificationsController.updateNotification);
router.delete('/remover/:id', verificarToken, notificationsController.deleteNotification);

module.exports = router;