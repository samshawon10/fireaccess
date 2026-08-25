import type { Request, Response } from "express";
import { fireaccess } from "../config/fireaccess.js";

export const listAuditLogs = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const logs = await fireaccess.services.auditLogs.listAuditLogs({
    page: Number(request.query.page ?? 1),
    limit: Number(request.query.limit ?? 25),
    action:
      typeof request.query.action === "string" ? request.query.action : undefined,
    search:
      typeof request.query.search === "string" ? request.query.search : undefined,
  });

  response.json({ data: logs });
};
