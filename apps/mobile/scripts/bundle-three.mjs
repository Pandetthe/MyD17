#!/usr/bin/env node
// Bundles three.js + GLTFLoader into src/lib/threeBundle.ts for offline WebView use.
// Run: pnpm bundle:three
import { execFileSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = join(__dirname, "..");
const require = createRequire(import.meta.url);

const threePkg = require.resolve("three/package.json");
const threeRoot = dirname(threePkg);

const entryPath = join(appRoot, "scripts", "_three_entry.js");
const outPath = "/tmp/three_bundle_out.js";

writeFileSync(
  entryPath,
  `import * as THREE from '${join(threeRoot, "build/three.module.js")}';\n` +
    `import { GLTFLoader } from '${join(threeRoot, "examples/jsm/loaders/GLTFLoader.js")}';\n` +
    `globalThis.THREE = THREE;\n` +
    `globalThis.GLTFLoader = GLTFLoader;\n`,
);

const esbuild = join(appRoot, "../../node_modules/.bin/esbuild");
execFileSync(esbuild, [
  entryPath,
  "--bundle",
  "--minify",
  "--format=iife",
  "--platform=browser",
  `--outfile=${outPath}`,
]);

const bundle = readFileSync(outPath, "utf8");
const escaped = bundle.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const ts =
  "// Auto-generated — do not edit manually. Rebuild: pnpm bundle:three\n" +
  "export const THREE_BUNDLE = `" +
  escaped +
  "`;\n";

writeFileSync(join(appRoot, "src/lib/threeBundle.ts"), ts);
console.log(`threeBundle.ts updated (${(ts.length / 1024).toFixed(0)} KB)`);
