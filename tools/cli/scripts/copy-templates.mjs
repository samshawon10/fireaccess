import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(dirname, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const source = path.join(repoRoot, "templates", "fullstack-template");
const nextSource = path.join(repoRoot, "templates", "next-frontend-template");
const target = path.join(packageRoot, "templates", "fullstack-template");
const nextTarget = path.join(packageRoot, "templates", "next-frontend-template");

await rm(path.join(packageRoot, "templates"), {
  recursive: true,
  force: true,
});
await cp(source, target, {
  recursive: true,
});
await cp(nextSource, nextTarget, {
  recursive: true,
});
