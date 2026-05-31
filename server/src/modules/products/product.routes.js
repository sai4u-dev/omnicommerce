import express from "express";
import { getAllProducts } from "./product.controller.js";

const router = express.Router();

router.get("/testproduct", (req, res) => {
  res.send("API working product testing");
});

router.get("/getAllProducts", getAllProducts);
// router.get("/all");
// router.get("/:slug");
// router.post("/create");
// router.patch("/:id");
// router.delete("/:id");
// router.get("/search");
// router.post("/:id/images");

export const productRoutes = router;
