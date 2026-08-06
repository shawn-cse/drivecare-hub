import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const sourceRoots = ["client/src", "server", "scripts"];
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else if (/\.(js|jsx|mjs)$/.test(entry.name) && !entry.name.endsWith("lint.mjs")) files.push(fullPath);
  }
}

for (const directory of sourceRoots) await walk(path.join(root, directory));

const errors = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (/type="date"\s+type="date"/.test(content)) errors.push(`${path.relative(root, file)}: duplicate type attribute`);
  if (/console\.log\(/.test(content) && !file.endsWith("server/index.mjs")) errors.push(`${path.relative(root, file)}: unexpected console.log`);
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${path.relative(root, file)}: ${result.stderr.trim()}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Checked ${files.length} source files.`);
