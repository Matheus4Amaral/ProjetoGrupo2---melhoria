import express from 'express';
import { testarEmail } from '../controllers/emailController.js';

const router = express.Router();

router.get('/teste-email', testarEmail);

export default router;