import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ForbiddenError,
  UnauthorizedError,
  assertPermissions,
  assertRole,
  extractBearerToken,
  hasPermissions,
} from "../dist/index.js";

describe("role hierarchy", () => {
  it("allows higher roles to satisfy lower required roles", () => {
    assert.doesNotThrow(() => assertRole("super_admin", "admin"));
    assert.doesNotThrow(() => assertRole("admin", "admin"));
    assert.doesNotThrow(() => assertRole("manager", "agent"));
  });

  it("rejects lower roles for higher required roles", () => {
    assert.throws(() => assertRole("manager", "admin"), ForbiddenError);
    assert.throws(() => assertRole("user", "agent"), ForbiddenError);
  });
});

describe("permissions", () => {
  it("requires every requested permission", () => {
    assert.equal(
      hasPermissions(
        { role: "user", permissions: ["course.create", "course.edit"] },
        ["course.create", "course.edit"],
      ),
      true,
    );

    assert.throws(
      () =>
        assertPermissions(
          { role: "user", permissions: ["course.create"] },
          ["course.create", "course.edit"],
        ),
      ForbiddenError,
    );
  });

  it("allows super_admin to bypass permission checks", () => {
    assert.equal(
      hasPermissions({ role: "super_admin", permissions: [] }, "course.delete"),
      true,
    );
  });
});

describe("bearer token extraction", () => {
  it("extracts bearer tokens case-insensitively", () => {
    assert.equal(extractBearerToken("bearer token-123"), "token-123");
    assert.equal(extractBearerToken("Bearer token-456"), "token-456");
  });

  it("rejects missing and malformed authorization headers", () => {
    assert.throws(() => extractBearerToken(), UnauthorizedError);
    assert.throws(() => extractBearerToken("Basic abc"), UnauthorizedError);
    assert.throws(() => extractBearerToken("Bearer"), UnauthorizedError);
  });
});
