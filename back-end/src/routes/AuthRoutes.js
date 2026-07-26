import { Router } from "express";
import { login, register, getUser, updateUser, forgotPassword } from "../controllers/AuthController.js";

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);

router.get('/user', getUser);
router.put('/user/update', updateUser);

export default router;