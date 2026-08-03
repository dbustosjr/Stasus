/**
 * Copy MediaPipe Vision WASM into public/ so feedback does not depend on
 * jsDelivr (CSP / CDN / offline). Run via postinstall and before deploy.
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules/@mediapipe/tasks-vision/wasm");
const dest = join(root, "public/mediapipe/wasm");

if (!existsSync(src)) {
  console.warn(
    "[copy-mediapipe-assets] skip — @mediapipe/tasks-vision not installed",
  );
  process.exit(0);
}

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log(`[copy-mediapipe-assets] ${src} → ${dest}`);
