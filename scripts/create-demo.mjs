import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const dbFile = resolve(process.cwd(), "prisma", "portfolio-demo.sqlite");
if (existsSync(dbFile)) {
  console.error("Refusing to overwrite an existing demo database.");
  console.error("This command never deletes a database. Back up and clean up any disposable demo yourself before retrying.");
  process.exit(1);
}

mkdirSync(resolve(process.cwd(), "prisma"), { recursive: true });
const env = {
  ...process.env,
  DATABASE_URL: `file:${dbFile}`,
  DEMO_MODE: "true",
  DEMO_SEED_ALLOWED: "isolated-portfolio-database",
};

function execute(cmd, args) {
  const run = spawnSync(cmd, args, {
    cwd: process.cwd(),
    env,
    shell: false,
    stdio: "inherit",
  });
  if (run.error) throw run.error;
  if (run.status !== 0) process.exit(run.status ?? 1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
execute(npx, ["--no-install", "prisma", "db", "push"]);
execute(process.execPath, ["prisma/seed-demo.mjs"]);
execute(process.execPath, ["scripts/verify-demo.mjs"]);

console.log("\nStart the demo without OpenAI calls:");
console.log(`  DATABASE_URL="file:${dbFile}" DEMO_MODE=true npm run dev`);
console.log("Synthetic demo data stays in an ignored local file, never in your tracked study DB.");
