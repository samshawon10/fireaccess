import { Router } from "express";
import { accessRoutes } from "./access.routes.js";
import { auditRoutes } from "./audit.routes.js";
import { authRoutes } from "./auth.routes.js";
import { usersRoutes } from "./users.routes.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_request, response) => {
  response.json({
    data: {
      ok: true,
      service: "fireaccess-api",
      timestamp: new Date().toISOString(),
    },
  });
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/users", usersRoutes);
apiRoutes.use("/audit", auditRoutes);
apiRoutes.use("/access", accessRoutes);
