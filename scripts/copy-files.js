import { log } from "console";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const srcDir = join(rootDir, "src");
const distDir = join(rootDir, "dist");
const iconsDir = join(distDir, "icons");

// Ensure dist directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}
mkdirSync(iconsDir, { recursive: true });

// Copy manifest.json from src
copyFileSync(join(srcDir, "manifest.json"), join(distDir, "manifest.json"));
console.log("✓ Copied manifest.json");

// Copy background.js from src
copyFileSync(join(srcDir, "background.js"), join(distDir, "background.js"));
console.log("✓ Copied background.js");

// Copy styles.css from src
copyFileSync(join(srcDir, "styles.css"), join(distDir, "styles.css"));
console.log("✓ Copied styles.css");

// Copy all icon files from src to dist
const srcFiles = readdirSync(srcDir + "/icons");
const iconFiles = srcFiles.filter((file) => {
  console.log(file);
  return file.startsWith("icon") && file.endsWith(".png");
});
iconFiles.forEach((iconFile) => {
  copyFileSync(join(srcDir + "/icons", iconFile), join(iconsDir, iconFile));
  console.log(`✓ Copied ${iconFile}`);
});

if (iconFiles.length === 0) {
  console.warn("⚠ No icon files found in src/");
}

console.log("\n✅ All files copied to dist folder successfully!");
