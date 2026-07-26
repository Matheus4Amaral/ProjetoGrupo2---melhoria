import { Router } from 'express'
import { 
  createStock, 
  getStock, 
  getStockById, 
  getStockByStatus,
  updateStock, 
  deleteStock,
  getStockProducts,
  addProductToStock,
  updateProductInStock,
  removeProductFromStock,
} from '../controllers/StockController.js'

const router = Router()

router.get('/', getStock)
router.get('/:id', getStockById)
router.post('/', createStock)
router.put('/:id', updateStock)
router.delete('/:id', deleteStock)
router.get('/status/:status', getStockByStatus)

router.get('/:id/produtos', getStockProducts)
router.post('/:id_estoque/produtos', addProductToStock)
router.put('/:id_estoque/produtos/:id_produto', updateProductInStock)
router.delete('/:id_estoque/produtos/:id_produto', removeProductFromStock)

export default router
