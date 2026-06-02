import type { Request, RequestHandler } from "express";
import type { NormalizedFireAccessConfig } from "../types/config";
import type { AuthenticatedUser } from "../types/user";
import { extractBearerToken, verifyFirebaseToken } from "../firebase/verifyToken";
import { connectMongo } from "../mongodb/connection";
import { syncFirebaseUser } from "../core/sync";
import { InactiveUserError, UnauthorizedError } from "../utils/errors";

const getTokenFromRequest = (
  request: Request,
  config: NormalizedFireAccessConfig,
): string => {
  if (!config.tokenExtractor) {
    return extractBearerToken(request.header("authorization"));
  }

  const token = config.tokenExtractor(request);

  if (typeof token !== "string" || token.trim().length === 0) {
    throw new UnauthorizedError("A valid authentication token is required.");
  }

  return token.trim();
};

export const authenticateRequest = async (
  request: Request,
  config: NormalizedFireAccessConfig,
): Promise<AuthenticatedUser> => {
  if (request.user && request.firebaseUser) {
    return request.user;
  }

  const token = getTokenFromRequest(request, config);
  const decodedToken = await verifyFirebaseToken(
    config.firebaseAdmin,
    token,
    config.checkRevoked,
  );
  await connectMongo(config.mongoUri, config.mongoOptions);
  const user = await syncFirebaseUser(decodedToken, config);

  if (!user.isActive) {
    throw new InactiveUserError();
  }

  request.firebaseUser = decodedToken;
  request.user = user;

  return user;
};

export const createAuthenticateMiddleware = (
  config: NormalizedFireAccessConfig,
): RequestHandler => {
  return (request, _response, next) => {
    void authenticateRequest(request, config)
      .then(() => {
        next();
      })
      .catch((error: unknown) => {
        next(error);
      });
  };
};
