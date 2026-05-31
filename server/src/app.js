import express from "express";
import cors from "cors";
import { requestLogger } from "./middleware/requestLogger.js";
import { getAllProductsRouter } from "./modules/test/test.routes.js";
import { authRoute } from "./modules/auth/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(requestLogger);

app.get("/", (req, res) => res.send("Omnicommerce Backend"));
app.use("/api/auth", authRoute);

app.use("/api/products", getAllProductsRouter);
export default app;
