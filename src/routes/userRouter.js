const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateToken } = require("../utils/TokenValidation");

router.get("/duplicationCheck/:account", userController.duplicationCheck);

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.get("/favorites", validateToken, userController.getFavorites);
router.post("/favorites/:cafeId", validateToken, userController.addFavorites);
router.delete("/favorites/:cafeId", validateToken, userController.deleteFavorites);

router.get("/mypage", validateToken, userController.getUserInfo);
router.patch("/mypage", validateToken, userController.updateUserInfo);
router.delete("/mypage", validateToken, userController.deleteAccount);

router.patch("/search", userController.searchPassword);

module.exports = router;
