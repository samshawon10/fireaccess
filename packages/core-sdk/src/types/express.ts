import type { AuthenticatedUser } from "@fireaccess/types";
import type { DecodedIdToken } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      firebaseUser?: DecodedIdToken;
    }
  }
}

export {};
