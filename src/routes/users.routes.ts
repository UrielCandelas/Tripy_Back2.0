import { Router } from "express";
import multer from "multer";
import {
	getUsersByRequest,
	registerNewCommentary,
	getComentariesByID,
	getContacts,
	registerNewMessage,
	getMessages,
	getComentsAndTravelsInactive,
	acceptRequest,
	declineRequest,
	getAccountRequest,
	identitySender,
	blobSender,
} from "../controllers/users.controller";

import { userCommentarySchema } from "../schemas/userCommentary.schema";
import { validateSchema } from "../middlewares/validateZodSchema";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024,
		files: 3,
	},
});

router.get("/user/request/:id", getUsersByRequest);

router.post(
	"/user/commentary",
	validateSchema(userCommentarySchema),
	registerNewCommentary
);

router.get("/user/commentary/all-commentaries/:id", getComentariesByID);

router.get("/user/contacts/:id", getContacts);

router.post("/user/message", registerNewMessage);

router.post("/user/coments/travels", getComentsAndTravelsInactive);

router.post("/user/get/messages", getMessages);

router.post(
	"/user/send/data",
	upload.fields([
		{ name: "image1", maxCount: 1 },
		{ name: "image2", maxCount: 1 },
		{ name: "image3", maxCount: 1 },
	]),
	identitySender
);

router.get("/admin/get/requests", getAccountRequest);

router.put("/admin/accept/requests/:id", acceptRequest);

router.put("/admin/decline/requests/:id", declineRequest);

router.post("/user/send/blob", blobSender);

export default router;
