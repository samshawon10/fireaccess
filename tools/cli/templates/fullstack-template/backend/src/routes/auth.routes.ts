import { Router } from "express";
import { getCurrentUser } from "../controllers/auth.controller.js";
import { fireaccess } from "../config/fireaccess.js";

export const authRoutes = Router();

authRoutes.get(
  "/me",
  fireaccess.authenticate(),
  fireaccess.audit("auth.me"),
  getCurrentUser,
);
