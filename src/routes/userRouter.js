const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { validateAccessToken, validateTokens } = require("../utils/TokenValidation");

router.get("/duplicationCheck/:account", userController.duplicationCheck);

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.delete("/logout", validateTokens, userController.logOut);

router.post("/refreshtoken", validateTokens, userController.reissueAccessToken);

router.get("/favorites", validateAccessToken, userController.getFavorites);
router.post("/favorites/:cafeId", validateAccessToken, userController.addFavorites);
router.delete("/favorites/:cafeId", validateAccessToken, userController.deleteFavorites);

router.get("/mypage", validateAccessToken, userController.getUserInfo);
router.patch("/mypage", validateAccessToken, userController.updateUserInfo);
router.delete("/mypage", validateAccessToken, userController.deleteAccount);

router.patch("/search", userController.searchPassword);

module.exports = router;
