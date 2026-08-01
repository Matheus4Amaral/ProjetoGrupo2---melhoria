import { Router } from "express";
import {
  login,
  register,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword
} from "../controllers/AuthController.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password', resetPassword);

router.get("/user", getUser);
router.put("/user/update", updateUser);

export default router;
