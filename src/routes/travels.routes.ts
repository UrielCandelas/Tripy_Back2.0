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
	addExpenseToTravel,
	getTravelExpenses,
	getTravelsAndUsers,
	registerComentTr,
} from "../controllers/travels.controller";

const router = Router();

// Viajes Generales
router.put("/travels/shared", addSecondUser);

router.put("/travels/secondShared/:id", deleteSecondUser);

router.post(
	"/travels/add/new",
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

router.post("/travels/expenses/add", addExpenseToTravel);

//no creo que este sea necesario puedo meterlo en otra func
router.get("/travels/expenses/get/:id", getTravelExpenses);

router.get("/travels/expenses/users/:id", getTravelsAndUsers);

router.post("/travels/locacionComentario", registerComentTr);

export default router;
