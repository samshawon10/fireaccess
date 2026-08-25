import { Router } from "express";
import { listAuditLogs } from "../controllers/audit.controller.js";
import { fireaccess } from "../config/fireaccess.js";
import { asyncHandler } from "../middleware/async-handler.js";

export const auditRoutes = Router();

auditRoutes.get(
  "/",
  fireaccess.permission("audit:read"),
  fireaccess.audit("audit.list"),
  asyncHandler(listAuditLogs),
);
