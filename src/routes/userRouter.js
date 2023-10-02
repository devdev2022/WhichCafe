const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateToken } = require("../utils/TokenValidation");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.get("/favorites", validateToken, userController.getFavorites);
router.post("/favorites/:cafeId", validateToken, userController.addFavorites);
router.delete("/favorites/:cafeId", validateToken, userController.deleteFavorites);

router.get("/mypage", validateToken, userController.getUserInfo);
router.patch("/mypage", validateToken, userController.updateUserInfo);

module.exports = router;
