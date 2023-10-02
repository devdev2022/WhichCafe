const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationContoller");

router.get("/nearby", locationController.getNearbyAddress);

module.exports = router;
