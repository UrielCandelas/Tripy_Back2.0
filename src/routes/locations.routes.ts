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
  getAllLocationsAndImages2,
  getLocationsAndTransports,
  locationData,
} from "../controllers/locations.controller";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fieldSize: 1024 * 1024 * 0.5, files: 2 },
});

router.post(
  "/locations",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  validateSchema(locationSchema),
  registerLocation
);
router.put(
  "/locations/:id",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  validateSchema(locationSchema),
  editLocation
);
router.get("/locations/:id", getLocation);
router.get("/locations/transports", getLocationsAndTransports);
router.delete("/locations/:id", deleteLocation);
router.get("/locations", getAllLocationsAndImages1);
router.get("/locations/second", getAllLocationsAndImages2);
router.get("/locations/data/:id", locationData);

export default router;
