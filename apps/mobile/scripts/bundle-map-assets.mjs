#!/usr/bin/env node
// Pre-bundles all map assets (GLB + WebP textures) as base64 strings.
// Run: pnpm bundle:map
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "../assets/map/floor1");
const outPath = join(__dirname, "../src/lib/mapAssets.ts");

function toBase64(filePath) {
  return readFileSync(filePath).toString("base64");
}

const glb = toBase64(join(assetsDir, "model.glb"));

const textureKeys = [
  "none",
  "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "1.10", "1.11", "1.12",
  "1.15", "1.16", "1.17", "1.18", "1.19", "1.20", "1.21", "1.22", "1.23",
  "1.26", "1.27", "1.28", "1.29", "1.30", "1.31",
  "1.33", "1.34", "1.35", "1.36", "1.38", "1.39",
];

const textureEntries = textureKeys.map((key) => {
  const fileName = key.replace(/\./g, "_") + ".webp";
  const b64 = toBase64(join(assetsDir, fileName));
  return `  "${key}": "${b64}"`;
});

const ts = [
  "// Auto-generated — do not edit manually. Rebuild: pnpm bundle:map",
  `export const MAP_GLB_BASE64 = "${glb}";`,
  "",
  "export const MAP_TEXTURES: Record<string, string> = {",
  textureEntries.join(",\n"),
  "};",
  "",
].join("\n");

writeFileSync(outPath, ts);

const kb = (ts.length / 1024).toFixed(0);
console.log(`mapAssets.ts updated (${kb} KB)`);
