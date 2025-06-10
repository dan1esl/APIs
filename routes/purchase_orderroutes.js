const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchase_order');

router.post('/create', purchaseOrderController.createOrder);
router.get('/', purchaseOrderController.getPurchaseOrder);

module.exports = router;