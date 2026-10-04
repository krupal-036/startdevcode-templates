// scripts/clean.js
const fs = require("fs");
const path = require("path");

const TARGET_FOLDERS = new Set(["node_modules", "dist", ".next", "build", ".cache"]);
const TARGET_FILES = new Set(["package-lock.json"]);
const rootDir = process.cwd();

function clean(dir) {
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, entry.name);
            const rel = path.relative(rootDir, fullPath);

            if (entry.isDirectory()) {
                if (TARGET_FOLDERS.has(entry.name)) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    console.log("🗑️  Folder: " + rel);
                } else {
                    clean(fullPath);
                }
            } else if (entry.isFile() && TARGET_FILES.has(entry.name)) {
                fs.unlinkSync(fullPath);
                console.log("📄 File:   " + rel);
            }
        }
    } catch (err) {
        console.error("❌ Failed to remove " + dir + ":", err.message);
    }
}

clean(rootDir);
console.log("✨ Cleanup finished!");
