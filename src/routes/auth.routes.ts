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
	editUserAcount,
	verifyTokenMovil,
	changeEmail,
	resendOTP,
	verifyOTPMovil,
} from "../controllers/auth.controller";
import { validateSchema } from "../middlewares/validateZodSchema";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024,
		files: 1,
	},
});

router.post("/register", validateSchema(registerSchema), register);

router.post("/login", validateSchema(loginSchema), login);

router.post("/logout", logout);

router.put("/edit/acount", upload.single("image"), editUserAcount);

router.post("/auth/verify/mobile", verifyTokenMovil);

router.post("/auth/verify", verifyToken);

router.get("/oauth", googleAuth);

router.post("/request", getAuthorizedURL);

router.post("/auth/otp", verifyOTP);

router.post("/auth/otp/movil", verifyOTPMovil);

router.get("/auth/active", verifyIsActive);

router.put("/email/change/:id", changeEmail);

router.post("/resend/otp", resendOTP);

export default router;
