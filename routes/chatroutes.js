const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat');
const verificarToken = require('../middlewares/verificarToken');

router.post('/chat', verificarToken, chatController.createChatMessage);
router.get('/', verificarToken, chatController.getChat);
router.delete('/chat/:id', verificarToken, chatController.deleteChatMessage);


module.exports = router