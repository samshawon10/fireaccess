import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  UnauthorizedError,
  extractBearerToken,
  verifyFirebaseToken,
} from "../dist/index.js";

describe("Firebase token flow", () => {
  it("passes checkRevoked to Firebase Admin", async () => {
    const calls = [];
    const firebaseAuth = {
      async verifyIdToken(token, checkRevoked) {
        calls.push({ token, checkRevoked });
        return { uid: "uid-1" };
      },
    };

    const decoded = await verifyFirebaseToken(firebaseAuth, "token-123", true);

    assert.equal(decoded.uid, "uid-1");
    assert.deepEqual(calls, [{ token: "token-123", checkRevoked: true }]);
  });

  it("normalizes Firebase verification failures to UnauthorizedError", async () => {
    const firebaseAuth = {
      async verifyIdToken() {
        throw new Error("firebase internals should not leak");
      },
    };

    await assert.rejects(
      () => verifyFirebaseToken(firebaseAuth, "bad-token", true),
      UnauthorizedError,
    );
  });

  it("parses strict Bearer authorization headers", () => {
    assert.equal(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
    assert.throws(() => extractBearerToken("Bearer one two"), UnauthorizedError);
  });
});
