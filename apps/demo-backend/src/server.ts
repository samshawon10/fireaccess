import cors from "cors";
import express from "express";
import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { createFireAccess } from "fireaccess";

const firebaseAdmin =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(),
  });

const auth = createFireAccess({
  firebaseAdmin,
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/fireaccess_demo",
  defaultPermissions: ["profile:read"],
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(auth.initialize());

app.get("/health", (_request, response) => {
  response.json({ data: { ok: true } });
});

app.get("/profile", auth.authenticate(), (request, response) => {
  response.json({ data: request.user });
});

app.get(
  "/admin/users",
  auth.permission("users:read"),
  auth.audit("demo.users.list"),
  async (_request, response) => {
    response.json({ data: await auth.services.users.listUsers() });
  },
);

app.use(auth.errorHandler());

app.listen(4100, () => {
  console.log("FireAccess demo backend listening on http://localhost:4100");
});
