const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateToken } = require("../utils/TokenValidation");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.get("/favorites", validateToken, userController.getFavorites);
router.post("/favorites", validateToken, userController.addFavorites);
router.delete("/favorites", validateToken, userController.deleteFavorites);

module.exports = router;
