import express from "express";
import { login, me, signup } from "./auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", me);

export const authRoute = router;
