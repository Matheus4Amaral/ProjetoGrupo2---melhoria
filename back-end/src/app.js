import cors from 'cors'
import express from 'express'
import { pathToFileURL } from 'node:url'
import swaggerUi from 'swagger-ui-express'
import AuthRoutes from './routes/AuthRoutes.js'
import DashboardRoutes from './routes/DashboardRoutes.js'
import StockRoutes from './routes/StockRoutes.js'
import SaleRoutes from './routes/SaleRoutes.js'
import ProductRoutes from './routes/ProductRoutes.js'
import SupplierRoutes from './routes/SupplierRoutes.js';
import PerfilRoutes from './routes/PerfilRoutes.js';
import { swaggerSpec } from './config/swagger.js'
import {
    finalErrorHandler,
    normalizeErrorResponses,
    notFoundHandler,
} from './utils/apiErrors.js'

const app = express();

app.use(cors())
app.use(normalizeErrorResponses)
app.use(express.json());

app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', AuthRoutes)
app.use('/api/dashboard', DashboardRoutes)
app.use('/api/stock', StockRoutes)
app.use('/api/sales', SaleRoutes)
app.use('/api/products', ProductRoutes)
app.use('/api/supplier', SupplierRoutes);
app.use('/api/perfil', PerfilRoutes)

app.use(notFoundHandler)
app.use(finalErrorHandler)

const PORT = 3001;

const isMainModule =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isMainModule) {
    app.listen(PORT, ()=>{
        console.log(`Servidor rodando com sucesso ${PORT}`)
    })
}

export default app
