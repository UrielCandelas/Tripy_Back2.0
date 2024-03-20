import { Router } from "express";

import {
  getUsersByRequest,
  registerNewCommentary,
  getComentariesByID,
  getContacts,
  registerNewMessage,
  getMessages,
  getComentsAndTravelsInactive,
} from "../controllers/users.controller";

import { userCommentarySchema } from "../schemas/userCommentary.schema";
import { validateSchema } from "../middlewares/validateZodSchema";

const router = Router();

router.get("/user/request/:id", getUsersByRequest);

router.post(
  "/user/commentary",
  validateSchema(userCommentarySchema),
  registerNewCommentary
);

router.get("/user/commentary/all-commentaries/:id", getComentariesByID);

router.get("/user/contacts/:id", getContacts);

router.post("/user/message", registerNewMessage);

router.post("/user/get/messages", getMessages);

router.get("/user/coments/travels/:id", getComentsAndTravelsInactive);

export default router;
