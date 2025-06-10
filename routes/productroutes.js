const express = require('express');
const router = express.Router();
const productController = require('../controllers/product');

router.post('/', productController.cadastroProduto);
router.get('/', productController.getProdutos);
router.get('/:id', productController.getProdutosId);
router.patch('/:id', productController.editarProdutos);
router.delete('/:id', productController.deletarProduto);

module.exports = router;
