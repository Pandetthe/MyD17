#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rawTag = process.env.RELEASE_TAG || process.env.GITHUB_REF_NAME || "";
const tag = rawTag.replace(/^v/, "");
const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const readJson = (path) => JSON.parse(readFileSync(join(root, path), "utf8"));
const versionCodeFromSemver = (value) => {
  const [major, minor, patch] = value
    .split(/[+-]/, 1)[0]
    .split(".")
    .map(Number);

  return major * 1_000_000 + minor * 1_000 + patch;
};

if (!rawTag.startsWith("v") || !semverPattern.test(tag)) {
  console.error(
    `Release tag must be SemVer with a v prefix, got: ${rawTag || "<empty>"}`,
  );
  process.exit(1);
}

const strapiPackage = readJson("apps/strapi/package.json");
const mobilePackage = readJson("apps/mobile/package.json");
const mobileApp = readJson("apps/mobile/app.json");
const versions = {
  tag,
  strapi: strapiPackage.version,
  mobilePackage: mobilePackage.version,
  mobileApp: mobileApp.expo?.version,
};
const uniqueVersions = new Set(Object.values(versions));

if (uniqueVersions.size !== 1) {
  console.error("Release versions are not aligned:");
  console.error(JSON.stringify(versions, null, 2));
  process.exit(1);
}

const expectedVersionCode = versionCodeFromSemver(tag);
const actualVersionCode = mobileApp.expo?.android?.versionCode;

if (actualVersionCode !== expectedVersionCode) {
  console.error(
    `Android versionCode mismatch: expected ${expectedVersionCode}, got ${actualVersionCode}`,
  );
  process.exit(1);
}

console.log("Release versions are aligned:");
console.log(
  JSON.stringify({ ...versions, versionCode: actualVersionCode }, null, 2),
);
