import express from "express";
const router = express.Router();

import userController from "../controllers/userController";
import { validateAccessToken, validateTokens } from "../utils/TokenValidation";

router.get("/duplicationCheck/:account", userController.duplicationCheck);

router.post("/signup", userController.signUp);
router.patch("/signin", userController.signIn);

router.delete("/logout", validateAccessToken, userController.logOut);

router.post("/refreshtoken", validateTokens, userController.reissueAccessToken);

router.get("/favorites", validateAccessToken, userController.getFavorites);
router.post("/favorites/:cafeId", validateAccessToken, userController.addFavorites);
router.delete("/favorites/:cafeId", validateAccessToken, userController.deleteFavorites);

router.get("/mypage", validateAccessToken, userController.getUserInfo);
router.patch("/mypage", validateAccessToken, userController.updateUserInfo);
router.delete("/mypage", validateAccessToken, userController.deleteAccount);

router.patch("/search", userController.searchPassword);

export default router;
