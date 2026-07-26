import { Router } from "express";
import { getDashboardData, replacement } from '../controllers/DashboardController.js'

const router = Router();

router.get('/getDashboardData', getDashboardData);
router.post('/replacement', replacement);

export default router;