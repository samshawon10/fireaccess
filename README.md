# FireAccess

FireAccess is a TypeScript-first authentication and authorization ecosystem for MERN developers. It combines Firebase Authentication, Firebase Admin token verification, MongoDB user synchronization, RBAC, permission checks, inactive user blocking, audit logging, Express middleware, React helpers, and a full project generator.

## Install The SDK

```bash
npm install fireaccess express firebase-admin mongoose
```

```ts
import express from "express";
import { createFireAccess } from "fireaccess";
import { firebaseAdmin } from "./firebase";

const app = express();
const auth = createFireAccess({
  firebaseAdmin,
  mongoUri: process.env.MONGO_URI!,
});

app.use(auth.initialize());

app.get("/profile", auth.authenticate(), (req, res) => {
  res.json(req.user);
});

app.get(
  "/admin/users",
  auth.permission("users:read"),
  auth.audit("users.list"),
  async (_req, res) => {
    res.json(await auth.services.users.listUsers());
  },
);
```

## Generate A Full Project

```bash
npx create-fireaccess
```

The CLI asks for:

- Project name
- Backend choice, currently Express
- Frontend choice: React or Next.js
- RBAC on/off
- Audit logging on/off
- Dependency installation

Then it creates a complete app from `templates/fullstack-template`, writes `.env` files from examples, installs dependencies when selected, and prints:

```txt
FireAccess project created successfully. Run npm run dev
```

Generated project flow:

```bash
cd your-project
# fill .env values
npm run dev
```

## Monorepo

```txt
packages/
  core-sdk/        fireaccess npm SDK
  express-adapter/ Express-focused adapter exports
  react-sdk/       React provider, hooks, guards, API client
  types/           Shared roles, users, audit, API types
templates/
  fullstack-template/
    backend/       Express + MongoDB + Firebase Admin + FireAccess
    frontend/      React + Tailwind admin dashboard
  next-frontend-template/
tools/
  cli/             create-fireaccess generator
apps/
  demo-backend/
  demo-frontend/
shared/
  architecture.md
```

## Core Features

- Firebase Admin ID token verification
- Automatic MongoDB user upsert from Firebase claims
- `req.user` and `req.firebaseUser` attachment
- Role hierarchy: `super_admin > admin > manager > agent > user`
- Permission middleware with `super_admin` bypass
- Inactive user blocking
- Audit middleware with metadata truncation and sensitive body redaction
- Admin services for users, roles, permissions, stats, and audit logs
- Standard JSON error response format
- TypeScript declarations for SDK consumers

## Workspace Commands

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm dev
```

The SDK publishes from `packages/core-sdk` as `fireaccess`. The generator publishes from `tools/cli` as `create-fireaccess`.
