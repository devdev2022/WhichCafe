const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateToken } = require("../utils/TokenValidation");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.get("/:account", userController.getUserInfo);
router.patch("/:account", userController.updateUserInfo);

router.get("/favorites", validateToken, userController.getFavorites);
router.post("/favorites/:cafeId", validateToken, userController.addFavorites);
router.delete("/favorites/:cafeId", validateToken, userController.deleteFavorites);

module.exports = router;
