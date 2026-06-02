# FireAccess

![npm version](https://img.shields.io/npm/v/fireaccess)
![npm downloads](https://img.shields.io/npm/dm/fireaccess)
![license](https://img.shields.io/npm/l/fireaccess)
![node](https://img.shields.io/node/v/fireaccess)

Firebase Admin Authentication + MongoDB User Sync + RBAC + Permissions + Audit Logging for Express.js.

FireAccess is a production-ready authentication and authorization toolkit that combines Firebase Authentication, MongoDB user synchronization, role-based access control (RBAC), permission-based access control, and audit logging in one TypeScript-friendly package.

## Links

* npm package: https://www.npmjs.com/package/fireaccess
* GitHub repository: https://github.com/samshawon10/fireaccess
* Issues and feature requests: https://github.com/samshawon10/fireaccess/issues
* Changelog: https://github.com/samshawon10/fireaccess/blob/main/CHANGELOG.md

## Features

* Firebase Admin SDK token verification
* Automatic MongoDB user synchronization
* Express authentication middleware
* Role-Based Access Control (RBAC)
* Permission-Based Access Control
* Audit logging middleware
* Auto user creation from Firebase claims
* Role hierarchy support
* Inactive user blocking
* TypeScript support
* ESM and CommonJS builds
* Production-ready architecture

## Why FireAccess?

Most Firebase authentication solutions only verify tokens.

FireAccess additionally provides:

* Automatic MongoDB user synchronization
* Role hierarchy management
* Permission middleware
* Audit logging
* Express integration
* Strong TypeScript support

All in one package.

## Installation

```bash
npm install fireaccess express firebase-admin mongoose
```

## Requirements

| Package | Version |
| --- | --- |
| Node.js | >=20 |
| Express | >=4.18 |
| Firebase Admin | >=13 |
| Mongoose | >=8 |

## Architecture

```text
Client
  |
  v
Firebase Authentication
  |
  v
FireAccess Middleware
  |
  v
MongoDB User Sync
  |
  v
RBAC + Permissions
  |
  v
Route Controller
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

app.listen(3000);
```

Send Firebase ID tokens:

```http
Authorization: Bearer <firebase-id-token>
```

## Authentication

```ts
app.get("/profile", auth.authenticate(), controller);
```

Authentication middleware:

* Verifies Firebase token
* Synchronizes user with MongoDB
* Creates user automatically
* Blocks inactive users
* Attaches `req.user`
* Attaches `req.firebaseUser`

## Role-Based Access Control (RBAC)

### Single Role

```ts
app.get("/admin", auth.role("admin"), controller);
```

### Multiple Roles

```ts
app.get(
  "/staff",
  auth.role(["admin", "manager"]),
  controller,
);
```

### Role Hierarchy

```text
super_admin
  |
  v
admin
  |
  v
manager
  |
  v
agent
  |
  v
user
```

Higher roles automatically satisfy lower-level requirements.

## Permission-Based Access Control

### Single Permission

```ts
auth.permission("course.create");
```

### Multiple Permissions

```ts
auth.permission(["course.edit", "course.publish"]);
```

Example:

```ts
app.patch(
  "/courses/:id",
  auth.permission(["course.edit", "course.publish"]),
  controller,
);
```

Super administrators bypass permission checks.

## Audit Logging

```ts
app.delete(
  "/users/:id",
  auth.authenticate(),
  auth.audit("delete_user"),
  controller,
);
```

Audit records are automatically stored in MongoDB.

### Audit Schema

```ts
{
  action: string;
  performedBy?: string;
  target?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}
```

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

## API Reference

### Initialization

```ts
auth.initialize();
```

### Authentication

```ts
auth.authenticate();
```

### Role Middleware

```ts
auth.role("admin");
```

### Permission Middleware

```ts
auth.permission("course.create");
```

### Audit Middleware

```ts
auth.audit("delete_user");
```

### Error Handler

```ts
auth.errorHandler();
```

## Models

Advanced users can access internal models.

```ts
auth.models.UserModel;
auth.models.AuditModel;
```

## TypeScript Support

FireAccess augments Express request types.

```ts
req.user?.uid;
req.user?.email;
req.user?.role;
req.firebaseUser?.uid;
```

No additional typings are required.

## Error Responses

### 401 Unauthorized

```json
{
  "error": {
    "code": "FIREACCESS_UNAUTHORIZED",
    "message": "Invalid Firebase authentication token.",
    "statusCode": 401
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FIREACCESS_FORBIDDEN",
    "message": "You do not have permission to perform this action.",
    "statusCode": 403
  }
}
```

### 403 Inactive User

```json
{
  "error": {
    "code": "FIREACCESS_INACTIVE_USER",
    "message": "This user account is inactive.",
    "statusCode": 403
  }
}
```

## Development

```bash
npm run lint
npm run typecheck
npm test
npm pack --dry-run
```

Run all checks:

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

Publishing requires either npm 2FA enabled on your account or a granular access token with bypass 2FA enabled. If publish returns `E403 Forbidden` with a 2FA message, enable 2FA or publish with a valid one-time password:

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

Use provenance publishing only from a supported CI environment:

```bash
npm run publish:provenance
```

## Security

* Firebase token verification happens server-side
* MongoDB is the source of truth for roles and permissions
* Client role claims are never trusted
* Inactive users are blocked
* Stable JSON error responses
* Audit logs for sensitive actions

## Roadmap

### v1.1

* Redis cache support
* Better audit analytics
* Performance improvements

### v1.2

* React SDK
* React permission components

### v2.0

* Multi-tenant support
* Organization management
* Team management
* API key authentication

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Support

Issues and feature requests:

https://github.com/samshawon10/fireaccess/issues

## License

MIT (c) Sam Shawon
