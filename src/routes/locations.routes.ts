import { Router } from "express";

import { validateSchema } from "../middlewares/validateZodSchema";
import multer from "multer";

import { locationSchema } from "../schemas/locations.schema";
import {
	registerLocation,
	editLocation,
	getLocation,
	deleteLocation,
	getAllLocationsAndImages1,
	getTravelsAndImage2,
	getLocationsAndTransports,
	locationData,
} from "../controllers/locations.controller";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: {
		fileSize: 1024 * 1024,
		files: 2,
	},
});

router.post(
	"/locations",
	upload.fields([
		{ name: "image1", maxCount: 1 },
		{ name: "image2", maxCount: 1 },
	]),
	registerLocation
);
router.put(
	"/locations/:id",
	upload.fields([{ name: "image1" }, { name: "image2" }]),
	validateSchema(locationSchema),
	editLocation
);
router.get("/locations/transports", getLocationsAndTransports);
router.get("/locations/:id", getLocation);
router.delete("/locations/:id", deleteLocation);
router.get("/locations", getAllLocationsAndImages1);
router.get("/locations/second/:id", getTravelsAndImage2);
router.get("/locations/data/:id", locationData);

export default router;
