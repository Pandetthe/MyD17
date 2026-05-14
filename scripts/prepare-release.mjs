#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const version = (process.argv[2] ?? "").replace(/^v/, "");
const shouldUpdateChangelog = process.argv.includes("--changelog");
const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!semverPattern.test(version)) {
  console.error("Usage: pnpm release:prepare <version> [--changelog]");
  console.error("Example: pnpm release:prepare 1.2.0");
  process.exit(1);
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, data) => {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
};

const versionCodeFromSemver = (value) => {
  const [major, minor, patch] = value
    .split(/[+-]/, 1)[0]
    .split(".")
    .map(Number);
  const versionCode = major * 1_000_000 + minor * 1_000 + patch;

  if (versionCode < 1 || versionCode > 2_100_000_000) {
    throw new Error(`Android versionCode out of range: ${versionCode}`);
  }

  return versionCode;
};

const files = {
  strapiPackage: join(root, "apps/strapi/package.json"),
  mobilePackage: join(root, "apps/mobile/package.json"),
  mobileApp: join(root, "apps/mobile/app.json"),
  changelog: join(root, "CHANGELOG.md"),
};

const strapiPackage = readJson(files.strapiPackage);
const mobilePackage = readJson(files.mobilePackage);
const mobileApp = readJson(files.mobileApp);

strapiPackage.version = version;
mobilePackage.version = version;
mobileApp.expo.version = version;
mobileApp.expo.android ??= {};
mobileApp.expo.android.versionCode = versionCodeFromSemver(version);

writeJson(files.strapiPackage, strapiPackage);
writeJson(files.mobilePackage, mobilePackage);
writeJson(files.mobileApp, mobileApp);

if (shouldUpdateChangelog) {
  let previousTag = "";
  try {
    previousTag = execSync("git describe --tags --abbrev=0", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();
  } catch {
    previousTag = "";
  }

  const range = previousTag ? `${previousTag}..HEAD` : "HEAD";
  const changes = execSync(`git log --pretty=format:"- %s" ${range}`, {
    cwd: root,
    encoding: "utf8",
  }).trim();
  const date = new Date().toISOString().slice(0, 10);
  const entry = `# Changelog\n\n## v${version} - ${date}\n\n${changes || "- Initial release"}\n\n`;

  let existing = "";
  try {
    existing = readFileSync(files.changelog, "utf8");
  } catch {
    existing = "";
  }

  const withoutTitle = existing.replace(/^# Changelog\s*\n+/u, "");
  writeFileSync(files.changelog, `${entry}${withoutTitle}`);
}

console.log(`Prepared release v${version}`);
console.log(`Android versionCode: ${mobileApp.expo.android.versionCode}`);
