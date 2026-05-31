import express from "express";
import { login, signup } from "./auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

export const authRoute = router;
