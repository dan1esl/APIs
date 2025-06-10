const express = require('express');
const router = express.Router();
const unityController = require('../controllers/unity_data');

router.post('/',unityController.cadastroUnity);
router.get('/',unityController.getUnity);
router.patch('/:id',  unityController.editarUnity);

module.exports = router;