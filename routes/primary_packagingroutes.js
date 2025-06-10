const express = require('express');
const router = express.Router();
const primaryPackagingController = require('../controllers/primary_packaging');

router.post('/primary_packaging', primaryPackagingController.createPrimaryPackaging);
router.get('/primary_packaging', primaryPackagingController.getPrimaryPackaging);
router.get('/primary_packaging/:id', primaryPackagingController.getPrimaryPackagingId);
router.put('/primary_packaging/:id', primaryPackagingController.updatePrimaryPackaging);
router.delete('/primary_packaging/:id', primaryPackagingController.deletePrimaryPackaging);


module.exports = router;