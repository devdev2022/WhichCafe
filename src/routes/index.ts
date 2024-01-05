import express from "express";
const router = express.Router();

import userRouter from "./userRouter";
import locationRouter from "./locationRouter";

router.use("/users", userRouter);
router.use("/location", locationRouter);

export { router };
