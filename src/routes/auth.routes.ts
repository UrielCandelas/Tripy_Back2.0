import { Router } from "express";
import {
  register,
  login,
  logout,
  getAuthorizedURL,
  googleAuth,
  verifyToken,
  verifyOTP,
  verifyIsActive,
} from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validateZodSchema";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validateSchema(registerSchema), register);

router.post("/login", validateSchema(loginSchema), login);

router.post("/logout", logout);

router.get("/oauth", googleAuth);

router.post("/request", getAuthorizedURL);

router.get("/auth/verify", verifyToken);

router.post("/auth/otp", verifyOTP);

router.get("/auth/active/:id", verifyIsActive);

export default router;
