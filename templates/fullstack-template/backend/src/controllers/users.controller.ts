import type { Request, Response } from "express";
import { fireaccess } from "../config/fireaccess.js";

export const listUsers = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 25);
  const role =
    typeof request.query.role === "string" && request.query.role
      ? request.query.role
      : undefined;
  const search =
    typeof request.query.search === "string" ? request.query.search : undefined;
  const isActive =
    request.query.isActive === undefined
      ? undefined
      : request.query.isActive === "true";

  const users = await fireaccess.services.users.listUsers({
    page,
    limit,
    search,
    role: role as never,
    isActive,
  });

  response.json({ data: users });
};

export const updateUserAccess = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = await fireaccess.services.users.updateUserAccess(
    request.params.uid,
    request.body,
  );

  response.json({ data: user });
};

export const getUserStats = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  const stats = await fireaccess.services.users.getStats();
  response.json({ data: stats });
};
