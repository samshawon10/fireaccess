# FireAccess Architecture

FireAccess is organized as a pnpm workspace with publishable packages, runnable apps, and a project generator.

## Package Responsibilities

- `packages/core-sdk`: Publishes as `fireaccess`. Owns Firebase Admin verification, MongoDB synchronization, RBAC, permissions, audit logging, Express middleware, models, and admin services.
- `packages/express-middleware`: Narrow Express package that re-exports middleware-oriented APIs from `fireaccess`.
- `packages/react-sdk`: Client auth context, Firebase client integration, role and permission helpers, and route guards.
- `packages/nextjs-sdk`: App Router helpers for server-side session fetching and client provider re-exports.
- `packages/types`: Shared role, permission, user, audit, and API response types.
- `packages/ui-components`: Tailwind-ready admin components used by the dashboard and available to consumers.

## Runtime Flow

1. Express receives a request with a Firebase ID token.
2. `auth.authenticate()` verifies the token with Firebase Admin.
3. The decoded Firebase user is upserted into MongoDB.
4. FireAccess attaches `req.firebaseUser` and `req.user`.
5. Role and permission middleware enforce access decisions.
6. Sensitive routes use `auth.audit(action)` to persist request metadata.

## Default Role Hierarchy

`super_admin > admin > manager > agent > user`
