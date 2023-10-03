const express = require("express");
const router = express.Router();

const userRouter = require("./userRouter");
//const placeRouter = require("./placeRouter");
const locationRouter = require("./locationRouter");

router.use("/users", userRouter);
//router.use("/places", placeRouter);
router.use("/location", locationRouter);

module.exports = { router };
