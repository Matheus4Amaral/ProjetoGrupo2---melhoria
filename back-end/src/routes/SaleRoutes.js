import { Router } from 'express'
import { createSale, getSales, getSaleById, deleteSale, incrementProduct, decrementProduct, updateSale, addProductToSale, updateProductInSale, updateSaleWithProducts } from '../controllers/SaleController.js'

const router = Router()

router.get('/', getSales)
router.get('/:id', getSaleById)
router.post('/', createSale)
router.put('/:id', updateSaleWithProducts)
router.delete('/:id', deleteSale)
router.post('/:id_venda/produto', addProductToSale)
router.put('/:id_venda/produto/:id_produto', updateProductInSale)
//para o modal de novo pedido na tela de vendas
router.patch('/:id_venda/produto/:id_produto/incrementar', incrementProduct)
router.patch('/:id_venda/produto/:id_produto/decrementar', decrementProduct)

export default router