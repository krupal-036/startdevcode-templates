// getfilenames.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const INCLUDE_ROOT_DIR = false;

const EXCLUDE_DIRS = new Set([
    'dist', '.next', 'public', 'node_modules', 'myvenv', 'venv', '.git',
    '__pycache__', 'myvenv', 'coverage', '.turbo', 'build'
]);

const EXCLUDE_EXTS = new Set([
    '.json', '.lock', '.ico', '.png', '.jpg', '.jpeg', '.woff', '.woff2', '.md'
]);

const COMMENT_MAP = {
    '.txt': '#',
    '.py': '#',
    '.rb': '#',
    '.sh': '#',
    '.yaml': '#',
    '.yml': '#',
    '.toml': '#',
    '.js': '//',
    '.jsx': '//',
    '.mjs': '//',
    '.cjs': '//',
    '.ts': '//',
    '.tsx': '//',
    '.mts': '//',
    '.cts': '//',
    '.java': '//',
    '.c': '//',
    '.cpp': '//',
    '.cs': '//',
    '.go': '//',
    '.rs': '//',
    '.php': '//',
    '.css': '//',
    '.scss': '//',
    '.less': '//',
    '.env.example': '#',
    '.env_EXAMPLE': '#',
    '.md': '<!--',
    '.mdx': '<!--',
    '.html': '<!--',
};

function getCommentFormat(fileExt, pathStr) {
    const commentSymbol = COMMENT_MAP[fileExt.toLowerCase()];
    if (!commentSymbol) return null;

    // HTML / Markdown comment style
    if (commentSymbol === '<!--') {
        return `<!-- ${pathStr} -->`;
    }

    // Standard single-line comment style
    return `${commentSymbol} ${pathStr}`;
}

async function processFile(filePath, rootDirName, scriptName) {
    if (path.basename(filePath) === scriptName) return;

    const ext = path.extname(filePath);
    const relPath = path.relative(process.cwd(), filePath);
    const relPathClean = relPath.split(path.sep).join('/');

    const targetPath = INCLUDE_ROOT_DIR ? `${rootDirName}/${relPathClean}` : relPathClean;
    const expectedHeader = getCommentFormat(ext, targetPath);

    if (!expectedHeader) return;

    let content;
    try {
        content = await fs.readFile(filePath, 'utf-8');
    } catch (err) {
        console.error(`## Could not read ${filePath}: ${err.message}`);
        return;
    }

    const lines = content.split(/\r?\n/);
    const checkLimit = Math.min(5, lines.length);

    let matchedIndex = -1;
    let alreadyCorrect = false;

    for (let i = 0; i < checkLimit; i++) {
        const lineClean = lines[i].trim();

        // 1. Exact match check
        if (lineClean === expectedHeader) {
            alreadyCorrect = true;
            break;
        }

        // 2. Legacy "Path:" detection (e.g. "// Path: src/...")
        const isLegacy =
            lineClean.toLowerCase().includes('path:') &&
            (lineClean.startsWith('//') || lineClean.startsWith('#') || lineClean.startsWith('<!--'));

        // 3. Existing path comment with an outdated path/filename
        let isExistingPathComment = false;
        const commentSymbol = COMMENT_MAP[ext.toLowerCase()];

        if (commentSymbol && commentSymbol !== '<!--' && lineClean.startsWith(commentSymbol)) {
            const candidate = lineClean.slice(commentSymbol.length).trim();
            if (candidate.endsWith(path.basename(filePath)) || candidate.includes('/')) {
                isExistingPathComment = true;
            }
        } else if (lineClean.startsWith('<!--') && lineClean.endsWith('-->')) {
            const candidate = lineClean.slice(4, -3).trim();
            if (candidate.endsWith(path.basename(filePath)) || candidate.includes('/')) {
                isExistingPathComment = true;
            }
        }

        if (isLegacy || isExistingPathComment) {
            matchedIndex = i;
            break;
        }
    }

    if (alreadyCorrect) return;

    // Update existing header or insert new one
    if (matchedIndex !== -1) {
        lines[matchedIndex] = expectedHeader;
        console.log(`## Updated header in: ${relPathClean}`);
    } else {
        let insertIdx = 0;
        // If file begins with a shebang (e.g., #!/usr/bin/env node), place header after it
        if (lines.length > 0 && lines[0].startsWith('#!')) {
            insertIdx = 1;
        }
        lines.splice(insertIdx, 0, expectedHeader);
        console.log(`++ Added header to: ${relPathClean}`);
    }

    try {
        await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
    } catch (err) {
        console.error(`## Could not write changes to ${filePath}: ${err.message}`);
    }
}

async function walkDirectory(dir, onFile) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            if (!EXCLUDE_DIRS.has(entry.name)) {
                await walkDirectory(path.join(dir, entry.name), onFile);
            }
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (!EXCLUDE_EXTS.has(ext)) {
                await onFile(path.join(dir, entry.name));
            }
        }
    }
}

async function main() {
    const currentDir = process.cwd();
    const rootDirName = path.basename(currentDir);
    const scriptName = path.basename(fileURLToPath(import.meta.url));

    console.log(`\n-- Scanning repository from root: '${rootDirName}'...`);

    await walkDirectory(currentDir, async (filePath) => {
        await processFile(filePath, rootDirName, scriptName);
    });

    console.log('\n-- Header synchronization complete!');
}

main().catch((err) => {
    console.error('\nFatal error during execution:', err);
});