import { Router } from 'express'
import { 
  createProduct, 
  getProducts, 
  getProductById, 
  getProductByName, 
  updateProduct, 
  deleteProduct 
} from '../controllers/ProductController.js'

const router = Router()

router.get('/', getProducts)
router.get('/search/nome', getProductByName)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
