import cors from "cors";
import express from "express";
import morgan from "morgan";
import { fireaccess } from "./config/fireaccess.js";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { apiRoutes } from "./routes/index.js";

export const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(fireaccess.initialize());

app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(fireaccess.errorHandler());
