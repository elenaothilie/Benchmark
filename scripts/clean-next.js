#!/usr/bin/env node
/**
 * Cleans .next (handles both real dir and junction).
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const NEXT_LINK = path.join(PROJECT_ROOT, ".next");
const NEXT_TARGET = path.join(os.tmpdir(), "benchmark-dashboard-next");

try {
  const stat = fs.lstatSync(NEXT_LINK);
  if (stat.isSymbolicLink?.()) {
    fs.unlinkSync(NEXT_LINK);
    if (fs.existsSync(NEXT_TARGET)) {
      fs.rmSync(NEXT_TARGET, { recursive: true, force: true });
    }
    console.log("Cleaned .next (junction and cache)");
  } else {
    fs.rmSync(NEXT_LINK, { recursive: true, force: true });
    console.log("Cleaned .next");
  }
} catch (e) {
  if (e.code === "ENOENT") {
    console.log("No .next folder");
  } else {
    console.error("Stop dev server first, then: npm run clean && npm run dev");
    process.exit(1);
  }
}
