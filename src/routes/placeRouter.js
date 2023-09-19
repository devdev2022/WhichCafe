const express = require("express");
const router = express.Router();

const placeController = require("../controllers/placeController");

router.get("/places", placeController.getPlaces);

module.exports = router;
