![npm](https://img.shields.io/npm/v/fireaccess)
![downloads](https://img.shields.io/npm/dm/fireaccess)
![license](https://img.shields.io/npm/l/fireaccess)

# FireAccess

Firebase Admin authentication, MongoDB user sync, RBAC, permissions, and audit logging for Express.js.

FireAccess is a production-ready authentication and authorization toolkit that combines Firebase Authentication, MongoDB user synchronization, role-based access control, permission checks, and audit logs in one TypeScript-friendly package.

## Features

* Firebase Admin SDK token verification
* Automatic MongoDB user synchronization
* Express middleware for authentication, roles, permissions, and audit logs
* Role hierarchy support
* Permission-based access control
* Auto user creation from Firebase token claims
* Inactive user blocking
* TypeScript types for `req.user` and `req.firebaseUser`
* Clean ESM and CommonJS builds

## Requirements

* Node.js 20 or newer
* Express 4 or 5
* Firebase Admin SDK 13 or newer
* Mongoose 8 or newer

## Installation

```bash
npm install fireaccess express firebase-admin mongoose
```

## Quick Start

```ts
import admin from "firebase-admin";
import express from "express";
import { createFireAccess } from "fireaccess";

admin.initializeApp();

const app = express();

const auth = createFireAccess({
  firebaseAdmin: admin,
  mongoUri: process.env.MONGO_URI!,
});

app.use(auth.initialize());

app.get("/profile", auth.authenticate(), (req, res) => {
  res.json(req.user);
});

app.use(auth.errorHandler());
```

Send Firebase ID tokens in the `Authorization` header:

```http
Authorization: Bearer <firebase-id-token>
```

## Authentication

```ts
app.get("/profile", auth.authenticate(), controller);
```

The authentication middleware:

* verifies the Firebase ID token
* connects to MongoDB
* creates or updates the local user record
* blocks inactive users
* attaches `req.user` and `req.firebaseUser`

## Roles

```ts
app.get("/admin", auth.role("admin"), controller);
```

Multiple roles are supported:

```ts
app.get("/staff", auth.role(["admin", "manager"]), controller);
```

Role hierarchy:

```txt
super_admin > admin > manager > agent > user
```

A higher role satisfies checks for lower roles.

## Permissions

```ts
app.post("/courses", auth.permission("course.create"), controller);
```

Multiple permissions require every listed permission:

```ts
app.patch(
  "/courses/:id",
  auth.permission(["course.edit", "course.publish"]),
  controller,
);
```

Users with the `super_admin` role bypass permission checks.

## Audit Logging

```ts
app.delete(
  "/users/:id",
  auth.authenticate(),
  auth.audit("delete_user"),
  controller,
);
```

Audit logs are stored in MongoDB through `AuditModel`.

## Configuration

```ts
const auth = createFireAccess({
  firebaseAdmin: admin,
  mongoUri: process.env.MONGO_URI!,
  defaultRole: "user",
  defaultPermissions: [],
  checkRevoked: false,
  audit: {
    includeParams: true,
    includeQuery: false,
    logFailedRequests: true,
    maxMetadataBytes: 8192,
  },
});
```

## API

```ts
auth.initialize();
auth.authenticate();
auth.role("admin");
auth.permission("course.create");
auth.audit("delete_user");
auth.errorHandler();
```

Models are also exposed for advanced workflows:

```ts
auth.models.UserModel;
auth.models.AuditModel;
```

## TypeScript

FireAccess augments Express request types:

```ts
req.user?.uid;
req.user?.email;
req.user?.role;
req.firebaseUser?.uid;
```

## Development

```bash
npm run lint
npm run typecheck
npm test
npm pack --dry-run
```

Run all publish checks:

```bash
npm run ci
```

Integration tests require a MongoDB URI:

```bash
FIREACCESS_INTEGRATION_MONGO_URI="mongodb://127.0.0.1:27017/fireaccess-test" npm test
```

## Publishing

First log in to npm:

```bash
npm login
npm whoami
```

If `npm whoami` returns `E401 Unauthorized`, the machine is not logged in and publishing will fail.

Publishing also requires either 2FA on your npm account or a granular access token with bypass 2FA enabled. If publish returns `E403 Forbidden` with a 2FA message, enable 2FA for your npm account or publish with a valid one-time password:

```bash
npm publish --access public --otp=123456
```

Before publishing, run:

```bash
npm run ci
```

Publish the package publicly:

```bash
npm run publish:public
```

If your npm account requires two-factor authentication, npm will prompt for an OTP. You can also pass one manually:

```bash
npm publish --access public --otp=123456
```

Use provenance publishing only from a supported CI environment:

```bash
npm run publish:provenance
```

## Security

* Firebase token verification happens server-side
* MongoDB is the role and permission source of truth
* Client token role claims are not trusted for authorization
* Inactive users are blocked
* FireAccess errors return stable JSON responses

## Roadmap

### v1.1

* Redis cache
* Better audit analytics

### v1.2

* React SDK

### v2.0

* Multi-tenant support
* Organization management
* Team management

## License

MIT
