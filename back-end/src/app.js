import cors from "cors";
import express from "express";
import AuthRoutes from "./routes/AuthRoutes.js";
import DashboardRoutes from "./routes/DashboardRoutes.js";
import StockRoutes from "./routes/StockRoutes.js";
import SaleRoutes from "./routes/SaleRoutes.js";
import ProductRoutes from "./routes/ProductRoutes.js";
import SupplierRoutes from "./routes/SupplierRoutes.js";
import PerfilRoutes from "./routes/PerfilRoutes.js";
import EmailRoutes from './routes/EmailRoutes.js';
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT;;

app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/stock", StockRoutes);
app.use("/api/sales", SaleRoutes);
app.use("/api/products", ProductRoutes);
app.use("/api/supplier", SupplierRoutes);
app.use("/api/perfil", PerfilRoutes);
app.use('/api/email', EmailRoutes);

app.use(express.static(path.join(__dirname, '../front-end/dist')));

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso ${PORT}`);
});
