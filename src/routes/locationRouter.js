const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationController");

router.get("/nearby", locationController.getNearbyAddress);
router.get("/searchcafe", locationController.searchCafes);

module.exports = router;
