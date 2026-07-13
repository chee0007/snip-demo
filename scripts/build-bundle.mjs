#!/usr/bin/env node

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const shouldPush = process.argv.includes('--push');

function exec(cmd, options = {}) {
  console.log(`\x1b[36m→\x1b[0m ${cmd}`);
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`\x1b[31m✗\x1b[0m Command failed: ${cmd}`);
      console.error(error.stderr || error.stdout || error.message);
      process.exit(1);
    }
    return '';
  }
}

function execQuiet(cmd, options = {}) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return '';
  }
}

function copyRecursive(src, dest) {
  const stat = existsSync(src);
  if (!stat) {
    throw new Error(`Source does not exist: ${src}`);
  }
  
  // Use platform-appropriate copy command
  if (process.platform === 'win32') {
    execSync(`xcopy /E /I /Y "${src}" "${dest}"`, { stdio: 'pipe' });
  } else {
    execSync(`cp -r "${src}" "${dest}"`, { stdio: 'pipe' });
  }
}

console.log('\x1b[1m📦 Snip Bundle Builder\x1b[0m\n');

// Step 1: Update submodules to branch tips
console.log('\x1b[1m1. Updating submodules to branch tips\x1b[0m');
exec('git submodule update --init --remote backend frontend cli');

// Step 2: Build the frontend
console.log('\n\x1b[1m2. Building frontend\x1b[0m');
const frontendDir = join(ROOT, 'frontend');
const frontendBuildOutput = join(frontendDir, 'dist', 'snip-frontend', 'browser', 'index.html');

exec('npm install', { cwd: frontendDir });
exec('npx ng build', { cwd: frontendDir });

if (!existsSync(frontendBuildOutput)) {
  console.error('\x1b[31m✗ Frontend build failed: missing dist/snip-frontend/browser/index.html\x1b[0m');
  process.exit(1);
}
console.log('\x1b[32m✓\x1b[0m Frontend built successfully');

// Step 3: Assemble bundle/
console.log('\n\x1b[1m3. Assembling bundle\x1b[0m');
const bundleDir = join(ROOT, 'bundle');

// Copy backend/server.js
const serverSrc = join(ROOT, 'backend', 'server.js');
const serverDest = join(bundleDir, 'server.js');
console.log(`  Copying server.js`);
copyFileSync(serverSrc, serverDest);

// Copy cli/cli.js
const cliSrc = join(ROOT, 'cli', 'cli.js');
const cliDest = join(bundleDir, 'cli.js');
console.log(`  Copying cli.js`);
copyFileSync(cliSrc, cliDest);

// Copy frontend build output to bundle/public
const publicDir = join(bundleDir, 'public');
if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true, force: true });
}
console.log(`  Copying frontend build to public/`);
copyRecursive(join(frontendDir, 'dist', 'snip-frontend', 'browser'), publicDir);

// Write .env
console.log(`  Writing .env`);
writeFileSync(join(bundleDir, '.env'), 'PUBLIC_DIR=./public\n');

// Write package.json
console.log(`  Writing package.json`);
const packageJson = {
  name: 'snip-bundle',
  version: '1.0.0',
  description: 'Snip URL shortener - complete deployment bundle',
  scripts: {
    start: 'bun server.js'
  },
  keywords: ['url-shortener', 'snip'],
  author: '',
  license: 'ISC'
};
writeFileSync(join(bundleDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

// Write Dockerfile
console.log(`  Writing Dockerfile`);
const dockerfile = `FROM oven/bun:1-alpine

WORKDIR /app

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "server.js"]
`;
writeFileSync(join(bundleDir, 'Dockerfile'), dockerfile);

// Write .dockerignore
console.log(`  Writing .dockerignore`);
const dockerignore = `node_modules
.git
.env.local
*.log
`;
writeFileSync(join(bundleDir, '.dockerignore'), dockerignore);

// Write railway.json
console.log(`  Writing railway.json`);
const railwayJson = {
  $schema: 'https://railway.app/railway.schema.json',
  build: {
    builder: 'DOCKERFILE'
  },
  deploy: {
    startCommand: 'bun server.js',
    restartPolicyType: 'ON_FAILURE',
    restartPolicyMaxRetries: 10
  }
};
writeFileSync(join(bundleDir, 'railway.json'), JSON.stringify(railwayJson, null, 2) + '\n');

console.log('\x1b[32m✓\x1b[0m Bundle assembled');

// Step 4: Commit in bundle/ if there are changes
console.log('\n\x1b[1m4. Committing bundle changes\x1b[0m');

// Add all files
exec('git add -A', { cwd: bundleDir });

// Check if there are changes
const status = execQuiet('git status --porcelain', { cwd: bundleDir });
if (!status.trim()) {
  console.log('\x1b[33m○\x1b[0m No changes in bundle/');
  
  // Still need to check if submodule pointer needs updating in main
  const mainStatus = execQuiet('git status --porcelain bundle');
  if (!mainStatus.trim()) {
    console.log('\n\x1b[33m○\x1b[0m Nothing to commit - bundle is up to date');
    process.exit(0);
  }
  console.log('\x1b[33m○\x1b[0m Bundle submodule pointer needs updating in main');
} else {
  // Commit in bundle
  const timestamp = new Date().toISOString();
  const commitMsg = `chore: update bundle (${timestamp})`;
  exec(`git commit -m "${commitMsg}"`, { cwd: bundleDir });
  console.log('\x1b[32m✓\x1b[0m Changes committed in bundle/');
  
  // Push bundle branch if --push
  if (shouldPush) {
    console.log('  Pushing bundle branch...');
    exec('git push origin HEAD:bundle', { cwd: bundleDir });
    console.log('\x1b[32m✓\x1b[0m Pushed bundle branch');
  }
}

// Step 5: Update submodule pointer in main
console.log('\n\x1b[1m5. Updating submodule pointer in main\x1b[0m');

exec('git add bundle');

const mainStatus = execQuiet('git status --porcelain bundle');
if (!mainStatus.trim()) {
  console.log('\x1b[33m○\x1b[0m No changes to submodule pointer');
  process.exit(0);
}

const commitMsg = 'chore: update bundle submodule pointer';
exec(`git commit -m "${commitMsg}"`);
console.log('\x1b[32m✓\x1b[0m Submodule pointer updated in main');

// Push main if --push
if (shouldPush) {
  console.log('  Pushing main branch...');
  exec('git push origin main');
  console.log('\x1b[32m✓\x1b[0m Pushed main branch');
}

console.log('\n\x1b[1m\x1b[32m✓ Bundle build complete!\x1b[0m');
if (!shouldPush) {
  console.log('\x1b[33m○\x1b[0m Changes not pushed (use --push to push)\x1b[0m');
}
