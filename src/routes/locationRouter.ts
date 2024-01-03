import express from "express";
const router = express.Router();

import { getNearbyAddress, searchCafes } from "../controllers/locationController";

router.get("", getNearbyAddress);
router.get("/search", searchCafes);

export default router;
