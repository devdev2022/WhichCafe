const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationController");

router.get("", locationController.getNearbyAddress);
router.get("/search", locationController.searchCafes);

module.exports = router;
