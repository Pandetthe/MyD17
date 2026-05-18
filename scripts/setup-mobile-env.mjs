#!/usr/bin/env node
/**
 * Generates apps/mobile/.env.local with EXPO_PUBLIC_STRAPI_URL.
 *
 * Usage:
 *   pnpm mobile:setup           — phone over LAN (auto-detects your IP)
 *   pnpm mobile:setup emulator  — Android emulator (10.0.2.2)
 */

import { networkInterfaces } from "os";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2];

function getLocalIp() {
  const nets = networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

let strapiUrl;

if (mode === "emulator") {
  strapiUrl = "http://10.0.2.2:1337";
} else {
  const ip = getLocalIp();
  if (!ip) {
    console.error("Could not detect a local IP address. Connect to a network and try again.");
    process.exit(1);
  }
  strapiUrl = `http://${ip}:1337`;
}

const envPath = resolve(__dirname, "../apps/mobile/.env.local");
writeFileSync(envPath, `EXPO_PUBLIC_STRAPI_URL=${strapiUrl}\n`);

console.log(`✓ Created apps/mobile/.env.local`);
console.log(`  EXPO_PUBLIC_STRAPI_URL=${strapiUrl}`);
