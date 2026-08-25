import type { Request, Response } from "express";
import { FIREACCESS_ROLE_DEFINITIONS } from "fireaccess";
import { permissions } from "../services/permissions.service.js";

export const getRoles = (_request: Request, response: Response): void => {
  response.json({ data: FIREACCESS_ROLE_DEFINITIONS });
};

export const getPermissions = (_request: Request, response: Response): void => {
  response.json({ data: permissions });
};
