import { Router } from "express";
import { getPermissions, getRoles } from "../controllers/access.controller.js";
import { fireaccess } from "../config/fireaccess.js";

export const accessRoutes = Router();

accessRoutes.get("/roles", fireaccess.authenticate(), getRoles);
accessRoutes.get("/permissions", fireaccess.authenticate(), getPermissions);
