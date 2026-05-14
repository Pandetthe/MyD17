#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const androidDir = join(root, "apps/mobile/android");
const appDir = join(androidDir, "app");
const buildGradlePath = join(appDir, "build.gradle");
const gradlePropertiesPath = join(androidDir, "gradle.properties");
const keystorePath = join(appDir, "release.keystore");

const requiredEnv = [
  "ANDROID_KEYSTORE_BASE64",
  "ANDROID_KEYSTORE_PASSWORD",
  "ANDROID_KEY_ALIAS",
  "ANDROID_KEY_PASSWORD",
];
const missing = requiredEnv.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`Missing Android signing env vars: ${missing.join(", ")}`);
  process.exit(1);
}

mkdirSync(appDir, { recursive: true });
writeFileSync(
  keystorePath,
  Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, "base64"),
);

const properties = [
  "",
  "MYD17_RELEASE_STORE_FILE=release.keystore",
  `MYD17_RELEASE_STORE_PASSWORD=${process.env.ANDROID_KEYSTORE_PASSWORD}`,
  `MYD17_RELEASE_KEY_ALIAS=${process.env.ANDROID_KEY_ALIAS}`,
  `MYD17_RELEASE_KEY_PASSWORD=${process.env.ANDROID_KEY_PASSWORD}`,
  "",
].join("\n");

const gradleProperties = readFileSync(gradlePropertiesPath, "utf8");
writeFileSync(
  gradlePropertiesPath,
  gradleProperties.includes("MYD17_RELEASE_STORE_FILE")
    ? gradleProperties
    : `${gradleProperties.trimEnd()}${properties}`,
);

let buildGradle = readFileSync(buildGradlePath, "utf8");

if (!buildGradle.includes("MYD17_RELEASE_STORE_FILE")) {
  buildGradle = buildGradle.replace(
    /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\n\s*\})/,
    `$1
        release {
            storeFile file(MYD17_RELEASE_STORE_FILE)
            storePassword MYD17_RELEASE_STORE_PASSWORD
            keyAlias MYD17_RELEASE_KEY_ALIAS
            keyPassword MYD17_RELEASE_KEY_PASSWORD
        }`,
  );
}

const lines = buildGradle.split("\n");
let inBuildTypes = false;
let inReleaseBuildType = false;
let buildTypesDepth = 0;
let releaseDepth = 0;
let replacedReleaseSigning = false;

const braceDelta = (line) =>
  (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;

for (let index = 0; index < lines.length; index += 1) {
  const line = lines[index];

  if (!inBuildTypes && /^\s*buildTypes\s*\{/.test(line)) {
    inBuildTypes = true;
    buildTypesDepth = braceDelta(line);
    continue;
  }

  if (!inBuildTypes) {
    continue;
  }

  if (!inReleaseBuildType && /^\s*release\s*\{/.test(line)) {
    inReleaseBuildType = true;
    releaseDepth = braceDelta(line);
    continue;
  }

  if (inReleaseBuildType) {
    if (/signingConfig\s+signingConfigs\.debug/.test(line)) {
      lines[index] = line.replace(
        /signingConfig\s+signingConfigs\.debug/,
        "signingConfig signingConfigs.release",
      );
      replacedReleaseSigning = true;
    }

    releaseDepth += braceDelta(line);
    if (releaseDepth <= 0) {
      inReleaseBuildType = false;
    }
  }

  buildTypesDepth += braceDelta(line);
  if (buildTypesDepth <= 0) {
    inBuildTypes = false;
  }
}

buildGradle = lines.join("\n");

if (
  !replacedReleaseSigning &&
  !buildGradle.includes("signingConfigs.release")
) {
  console.error(
    "Could not find release signingConfig in android/app/build.gradle",
  );
  process.exit(1);
}

writeFileSync(buildGradlePath, buildGradle);
console.log("Configured Android release signing");
