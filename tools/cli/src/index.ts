#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  access,
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface ProjectOptions {
  projectName: string;
  backend: "express";
  frontend: "react" | "next";
  enableRbac: boolean;
  enableAudit: boolean;
  installDependencies: boolean;
}

const rl = createInterface({ input, output });

const colors = {
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
};

const sanitizePackageName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ask = async (question: string, defaultValue: string): Promise<string> => {
  const answer = await rl.question(`${question} (${defaultValue}): `);
  return answer.trim() || defaultValue;
};

const confirm = async (question: string, defaultValue = true): Promise<boolean> => {
  const suffix = defaultValue ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${suffix}): `)).trim().toLowerCase();

  if (!answer) {
    return defaultValue;
  }

  return ["y", "yes", "true", "1"].includes(answer);
};

const chooseFrontend = async (): Promise<"react" | "next"> => {
  const answer = (
    await ask("Frontend framework: react or next", "react")
  ).toLowerCase();

  return answer === "next" || answer === "nextjs" || answer === "next.js"
    ? "next"
    : "react";
};

const chooseBackend = async (): Promise<"express"> => {
  const answer = (await ask("Backend framework", "express")).toLowerCase();

  if (answer !== "express") {
    console.log("FireAccess currently generates the Express backend template.");
  }

  return "express";
};

const pathExists = async (target: string): Promise<boolean> => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const ensureEmptyTarget = async (target: string): Promise<void> => {
  if (!(await pathExists(target))) {
    return;
  }

  const entries = await readdir(target);

  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${target}`);
  }
};

const findTemplateDirectory = async (): Promise<string> => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(dirname, "../templates/fullstack-template"),
    path.resolve(dirname, "../../../templates/fullstack-template"),
    path.resolve(process.cwd(), "templates/fullstack-template"),
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to find the FireAccess fullstack template.");
};

const findNextFrontendTemplateDirectory = async (): Promise<string> => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(dirname, "../templates/next-frontend-template"),
    path.resolve(dirname, "../../../templates/next-frontend-template"),
    path.resolve(process.cwd(), "templates/next-frontend-template"),
  ];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to find the FireAccess Next.js frontend template.");
};

const isTextFile = (filePath: string): boolean =>
  [
    ".css",
    ".html",
    ".js",
    ".json",
    ".md",
    ".ts",
    ".tsx",
    ".txt",
    ".yml",
    ".yaml",
  ].includes(path.extname(filePath)) || path.basename(filePath).startsWith(".env");

const replaceInFiles = async (
  directory: string,
  replacer: (content: string, filePath: string) => string,
): Promise<void> => {
  const entries = await readdir(directory);

  for (const entry of entries) {
    const filePath = path.join(directory, entry);
    const info = await stat(filePath);

    if (info.isDirectory()) {
      await replaceInFiles(filePath, replacer);
      continue;
    }

    if (!isTextFile(filePath)) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const updated = replacer(content, filePath);

    if (updated !== content) {
      await writeFile(filePath, updated);
    }
  }
};

const copyEnvFiles = async (target: string): Promise<void> => {
  const pairs = [
    [".env.example", ".env"],
    ["backend/.env.example", "backend/.env"],
    ["frontend/.env.example", "frontend/.env"],
  ];

  for (const [source, destination] of pairs) {
    const sourcePath = path.join(target, source);

    if (await pathExists(sourcePath)) {
      await cp(sourcePath, path.join(target, destination), { force: true });
    }
  }
};

const applyFeatureFlags = async (
  target: string,
  options: ProjectOptions,
): Promise<void> => {
  await replaceInFiles(target, (content, filePath) => {
    let updated = content.replaceAll("{{projectName}}", options.projectName);

    if (!options.enableAudit && filePath.endsWith(".ts")) {
      updated = updated.replace(
        /\s*fireaccess\.audit\("[^"]+"\),\r?\n/g,
        "",
      );
    }

    if (!options.enableRbac && filePath.endsWith(".ts")) {
      updated = updated.replace(
        /fireaccess\.permission\((?:\[[^\]]+\]|"[^"]+")\)/g,
        "fireaccess.authenticate()",
      );
      updated = updated.replace(
        /fireaccess\.role\((?:\[[^\]]+\]|"[^"]+")\)/g,
        "fireaccess.authenticate()",
      );
    }

    return updated;
  });
};

const runInstall = async (cwd: string): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("npm", ["install"], {
      cwd,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm install exited with code ${code ?? "unknown"}.`));
    });
  });
};

const collectOptions = async (): Promise<ProjectOptions> => {
  const rawProjectName = await ask("Project name", "fireaccess-app");
  const projectName = sanitizePackageName(rawProjectName);

  if (!projectName) {
    throw new Error("Project name must include at least one letter or number.");
  }

  const backend = await chooseBackend();
  const frontend = await chooseFrontend();
  const enableRbac = await confirm("Enable RBAC", true);
  const enableAudit = await confirm("Enable audit logging", true);
  const installDependencies = await confirm("Install dependencies now", true);

  return {
    projectName,
    backend,
    frontend,
    enableRbac,
    enableAudit,
    installDependencies,
  };
};

const main = async (): Promise<void> => {
  console.log(`${colors.cyan}${colors.bold}FireAccess project generator${colors.reset}`);
  const options = await collectOptions();
  const target = path.resolve(process.cwd(), options.projectName);

  await ensureEmptyTarget(target);
  await mkdir(target, { recursive: true });

  const templateDir = await findTemplateDirectory();
  await cp(templateDir, target, { recursive: true });

  if (options.frontend === "next") {
    const nextTemplateDir = await findNextFrontendTemplateDirectory();
    await rm(path.join(target, "frontend"), { recursive: true, force: true });
    await cp(nextTemplateDir, path.join(target, "frontend"), { recursive: true });
  }

  await applyFeatureFlags(target, options);
  await copyEnvFiles(target);

  if (options.installDependencies) {
    await runInstall(target);
  }

  console.log(
    `${colors.green}FireAccess project created successfully. Run npm run dev${colors.reset}`,
  );
  console.log(`\nNext steps:\n  cd ${options.projectName}\n  edit .env\n  npm run dev`);
};

main()
  .catch((error: unknown) => {
    console.error(
      `${colors.red}${error instanceof Error ? error.message : String(error)}${colors.reset}`,
    );
    process.exitCode = 1;
  })
  .finally(() => {
    rl.close();
  });
