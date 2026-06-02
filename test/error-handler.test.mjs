import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import request from "supertest";
import {
  FireAccessError,
  UnauthorizedError,
  createErrorHandlerMiddleware,
} from "../dist/index.js";

describe("error handler", () => {
  it("serializes FireAccess errors as stable JSON", async () => {
    const app = express();

    app.get("/private", (_request, _response, next) => {
      next(new UnauthorizedError("Token missing."));
    });

    app.use(createErrorHandlerMiddleware());

    const response = await request(app).get("/private").expect(401);

    assert.deepEqual(response.body, {
      error: {
        code: "FIREACCESS_UNAUTHORIZED",
        message: "Token missing.",
        statusCode: 401,
      },
    });
  });

  it("does not expose non-public FireAccess errors", async () => {
    const app = express();

    app.get("/boom", (_request, _response, next) => {
      next(
        new FireAccessError(
          "Configuration secret.",
          500,
          "FIREACCESS_CONFIGURATION_ERROR",
          false,
        ),
      );
    });

    app.use(createErrorHandlerMiddleware());

    const response = await request(app).get("/boom").expect(500);

    assert.equal(response.body.error.message, "Internal server error.");
  });
});
