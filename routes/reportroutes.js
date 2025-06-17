const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report');
router.post('/', reportController.cadastroReport);
router.get('/', reportController.getReport);
router.get('/:id', reportController.getReportId);

module.exports = router;