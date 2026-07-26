import { Router } from "express";
import { changePassword, getUser, updateUser } from "../controllers/PerfilController.js";

const router = Router();

router.get('/get-user', getUser);
router.put('/update-user', updateUser);
router.put('/change-password', changePassword);

export default router;