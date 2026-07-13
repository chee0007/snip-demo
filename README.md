# Snip Bundle (Generated Output)

⚠️ **DO NOT HAND-EDIT THIS BRANCH**

This branch contains generated deployment artifacts assembled from the `backend`, `frontend`, and `cli` branches.

## Contents

- `server.js` — Backend server (from backend branch)
- `cli.js` — CLI tool (from cli branch)
- `public/` — Built Angular frontend (from frontend branch)
- `.env` — Environment configuration (PUBLIC_DIR=./public)
- `package.json` — Deployment manifest
- `Dockerfile` — Container image definition
- `railway.json` — Railway deployment config

## How It's Generated

This branch is automatically assembled by running:

```bash
node scripts/build-bundle.mjs --push
```

from the `main` branch of the repository.

The build script:
1. Updates all submodules to their latest commits
2. Builds the Angular frontend
3. Copies and assembles all components
4. Commits and pushes this branch

## Deployment

Deploy this branch directly to:
- **Railway** (via Dockerfile)
- **Docker** (`docker build . && docker run -p 3000:3000`)
- **Bun** (`bun install && bun start`)

The server serves both the API and the static frontend.

## Manual Rebuild

If you need to regenerate this branch, clone the repository and run:

```bash
git clone --recurse-submodules https://github.com/chee0007/snip-demo
cd snip-demo
node scripts/build-bundle.mjs --push
```

**Last generated**: This file is updated with each build.
