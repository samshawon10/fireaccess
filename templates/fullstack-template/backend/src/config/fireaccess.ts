import { createFireAccess } from "fireaccess";
import { firebaseAdmin } from "./firebase.js";
import { env } from "./env.js";

export const fireaccess = createFireAccess({
  firebaseAdmin,
  mongoUri: env.MONGO_URI,
  defaultRole: "user",
  defaultPermissions: ["profile:read"],
  checkRevoked: true,
  audit: {
    includeParams: true,
    includeQuery: true,
    includeBody: false,
    logFailedRequests: true,
  },
});
