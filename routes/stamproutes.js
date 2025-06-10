const express = require('express');
const router = express.Router();
const stampController = require('../controllers/stamp');

router.post('/', stampController.cadastroStamp);
router.get('/', stampController.getStamp);
router.get('/:id', stampController.getStampID);
router.patch('/:id', stampController.editarStamp);
router.delete('/:id', stampController.deletarStamp);

module.exports = router;