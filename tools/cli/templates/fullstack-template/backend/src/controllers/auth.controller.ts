import type { Request, Response } from "express";

export const getCurrentUser = (request: Request, response: Response): void => {
  response.json({
    data: request.user,
  });
};
