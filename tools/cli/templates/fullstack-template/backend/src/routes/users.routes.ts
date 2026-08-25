import { Router } from "express";
import {
  getUserStats,
  listUsers,
  updateUserAccess,
} from "../controllers/users.controller.js";
import { fireaccess } from "../config/fireaccess.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const usersRoutes = Router();

usersRoutes.get(
  "/stats",
  fireaccess.permission("users:read"),
  fireaccess.audit("users.stats"),
  asyncHandler(getUserStats),
);

usersRoutes.get(
  "/",
  fireaccess.permission("users:read"),
  fireaccess.audit("users.list"),
  asyncHandler(listUsers),
);

usersRoutes.patch(
  "/:uid/access",
  fireaccess.permission(["users:update", "roles:manage"]),
  fireaccess.audit("users.update_access"),
  asyncHandler(updateUserAccess),
);
