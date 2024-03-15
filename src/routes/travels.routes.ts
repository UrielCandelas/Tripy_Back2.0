import { Router } from "express";

import { validateSchema } from "../middlewares/validateZodSchema";
import { createTravelSchema } from "../schemas/travels.schema";
import {
  registerNewTravel,
  addSecondUser,
  deleteSecondUser,
  deleteTravel,
  getAllExtras,
  addTravelRequest,
  declineRequest,
  getTravelsI,
  getTravelsA,
  getRequest,
} from "../controllers/travels.controller";

const router = Router();

// Viajes Generales
router.put("/travels/shared", addSecondUser);

router.put("/travels/secondShared/:id", deleteSecondUser);

router.post(
  "/my-travels",
  validateSchema(createTravelSchema),
  registerNewTravel
);

router.delete("/travels/:id", deleteTravel);

router.get("/travels/extras/:id", getAllExtras);

router.post("/travels/requests/new", addTravelRequest);

router.put("/travels/requests/decline", declineRequest);

router.get("/travels/requested/inactive/:id", getTravelsI);

router.get("/travels/requested/active/:id", getTravelsA);

router.get("/request/get/:id", getRequest);

export default router;
