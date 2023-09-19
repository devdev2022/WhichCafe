const express = require("express");
const router = express.Router();

const userRouter = require("./userRouter");
//const placeRouter = require("./placeRouter");

router.use("/users", userRouter);
//router.use("/places", placeRouter);

module.exports = { router };
