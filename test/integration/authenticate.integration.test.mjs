import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";
import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import {
  AuditModel,
  UserModel,
  createFireAccess,
} from "../../dist/index.js";

const mongoUri = process.env.FIREACCESS_INTEGRATION_MONGO_URI;

const silentLogger = {
  info() {},
  warn() {},
  error() {},
};

const tokenClaims = {
  "valid-user": {
    uid: "uid-user",
    email: "user@example.com",
    name: "User One",
    picture: "https://example.com/user.png",
  },
  "admin-token": {
    uid: "uid-admin",
    email: "admin@example.com",
    name: "Admin One",
  },
  "course-token": {
    uid: "uid-course",
    email: "course@example.com",
    name: "Course Author",
  },
  "inactive-token": {
    uid: "uid-inactive",
    email: "inactive@example.com",
  },
  "client-admin-claim": {
    uid: "uid-client-claim",
    email: "claim@example.com",
    role: "admin",
    permissions: ["course.create"],
  },
};

const createFirebaseAdmin = (calls) => ({
  auth() {
    return {
      async verifyIdToken(token, checkRevoked) {
        calls.push({ token, checkRevoked });
        const claims = tokenClaims[token];

        if (!claims) {
          throw new Error("invalid token");
        }

        return claims;
      },
    };
  },
});

const waitFor = async (predicate) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const value = await predicate();

    if (value) {
      return value;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }

  throw new Error("Timed out waiting for integration side effect.");
};

if (mongoUri) {
  describe("FireAccess MongoDB integration", () => {
    before(async () => {
      await mongoose.connect(mongoUri);
    });

    afterEach(async () => {
      await UserModel.deleteMany({}).exec();
      await AuditModel.deleteMany({}).exec();
    });

    after(async () => {
      await mongoose.disconnect();
    });

    const createApp = (calls = []) => {
      const auth = createFireAccess({
        firebaseAdmin: createFirebaseAdmin(calls),
        mongoUri,
        checkRevoked: true,
        logger: silentLogger,
      });
      const app = express();

      app.use(express.json());
      app.use(auth.initialize());
      app.get("/profile", auth.authenticate(), (request, response) => {
        response.json({
          uid: request.user?.uid,
          role: request.user?.role,
          email: request.user?.email,
        });
      });
      app.delete(
        "/users/:id",
        auth.role("admin"),
        auth.audit("delete_user"),
        (_request, response) => {
          response.status(204).send();
        },
      );
      app.post("/courses", auth.permission("course.create"), (_request, response) => {
        response.status(201).json({ ok: true });
      });
      app.get("/admin", auth.role("admin"), (_request, response) => {
        response.json({ ok: true });
      });
      app.use(auth.errorHandler());

      return app;
    };

    it("verifies Firebase tokens and auto-creates MongoDB users", async () => {
      const calls = [];
      const app = createApp(calls);

      const response = await request(app)
        .get("/profile")
        .set("Authorization", "Bearer valid-user")
        .expect(200);

      assert.equal(response.body.uid, "uid-user");
      assert.equal(response.body.role, "user");
      assert.equal(response.body.email, "user@example.com");
      assert.deepEqual(calls, [{ token: "valid-user", checkRevoked: true }]);

      const user = await UserModel.findOne({ uid: "uid-user" }).lean().exec();

      assert.equal(user?.role, "user");
      assert.deepEqual(user?.permissions, []);
      assert.equal(user?.isActive, true);
    });

    it("uses MongoDB role instead of client token claims", async () => {
      await UserModel.create({
        uid: "uid-client-claim",
        role: "manager",
        permissions: [],
        isActive: true,
      });

      const response = await request(createApp())
        .get("/admin")
        .set("Authorization", "Bearer client-admin-claim")
        .expect(403);

      assert.equal(response.body.error.code, "FIREACCESS_FORBIDDEN");
    });

    it("authorizes permissions from MongoDB and rejects inactive users", async () => {
      await UserModel.create({
        uid: "uid-course",
        role: "user",
        permissions: ["course.create"],
        isActive: true,
      });
      await UserModel.create({
        uid: "uid-inactive",
        role: "user",
        permissions: ["course.create"],
        isActive: false,
      });

      await request(createApp())
        .post("/courses")
        .set("Authorization", "Bearer course-token")
        .expect(201);

      const response = await request(createApp())
        .post("/courses")
        .set("Authorization", "Bearer inactive-token")
        .expect(403);

      assert.equal(response.body.error.code, "FIREACCESS_INACTIVE_USER");
    });

    it("writes audit logs after protected actions finish", async () => {
      await UserModel.create({
        uid: "uid-admin",
        role: "admin",
        permissions: [],
        isActive: true,
      });

      await request(createApp())
        .delete("/users/target-user")
        .set("Authorization", "Bearer admin-token")
        .expect(204);

      const auditLog = await waitFor(() =>
        AuditModel.findOne({ action: "delete_user" }).lean().exec(),
      );

      assert.equal(auditLog.performedBy, "uid-admin");
      assert.equal(auditLog.target, "target-user");
      assert.equal(auditLog.metadata.statusCode, 204);
    });
  });
} else {
  describe("FireAccess MongoDB integration", () => {
    it("skips when FIREACCESS_INTEGRATION_MONGO_URI is not set", { skip: true }, () => {});
  });
}
