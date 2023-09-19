const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/signup", userController.signUp);
router.post("/signin", userController.signIn);

router.get("/favorites", userController.getFavorites);
router.post("/favorites", userController.addFavorites);
router.delete("/favorites", userController.deleteFavorites);

module.exports = router;
