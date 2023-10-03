const express = require("express");
const router = express.Router();

const userRouter = require("./userRouter");
const locationRouter = require("./locationRouter");

router.use("/users", userRouter);
router.use("/location", locationRouter);

module.exports = { router };
