#!/usr/bin/env node
/**
 * Puts .next build output outside OneDrive to prevent sync/delete prompts.
 * Creates a junction (.next -> %TEMP%\benchmark-dashboard-next) on Windows.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const NEXT_LINK = path.join(PROJECT_ROOT, ".next");
const NEXT_TARGET = path.join(os.tmpdir(), "benchmark-dashboard-next");

function ensureNextOutsideOneDrive() {
  const stat = (() => {
    try {
      return fs.lstatSync(NEXT_LINK);
    } catch {
      return null;
    }
  })();

  if (stat?.isSymbolicLink?.()) {
    return; // already a link
  }

  if (stat) {
    try {
      fs.rmSync(NEXT_LINK, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
    } catch (e) {
      if (e.code === "EPERM" || e.code === "EBUSY") {
        console.error(
          "\nOneDrive has .next locked. Do this:\n" +
            "  1. Stop the dev server (Ctrl+C)\n" +
            "  2. Run: npm run clean\n" +
            '  3. When OneDrive asks, click "Delete all items"\n' +
            "  4. Run: npm run dev\n"
        );
        process.exit(1);
      }
      throw e;
    }
  }

  try {
    fs.mkdirSync(NEXT_TARGET, { recursive: true });
  } catch (e) {
    if (e.code !== "EEXIST") throw e;
  }

  fs.symlinkSync(NEXT_TARGET, NEXT_LINK, "junction");
}

ensureNextOutsideOneDrive();
