# Snip — URL Shortener

A demonstration of **one backend, two clients** architecture with a clean separation of concerns using Git branches and submodules.

## Architecture

**Snip** is organized as a monorepo with three independent layers, each living on its own branch:

- **backend** — Bun server with zero dependencies, in-memory storage
- **frontend** — Angular 19 SPA with Lovable.dev-inspired design
- **cli** — Node.js CLI tool for terminal access

Each layer is developed independently on its own orphan branch and mounted as a Git submodule in the `main` aggregator branch.

## API Contract

The backend exposes a simple REST API that both clients consume:

| Method | Endpoint       | Request                    | Response                                          | Notes                          |
|--------|----------------|----------------------------|---------------------------------------------------|--------------------------------|
| POST   | `/api/links`   | `{ "url": "https://…" }`   | `{ code, url, shortUrl, hits, createdAt }`        | 201 on success, 400 on invalid |
| GET    | `/api/links`   | —                          | Array of all links (same shape)                   | 200 always                     |
| GET    | `/:code`       | —                          | 302 redirect to original URL                      | Increments hits; 404 if unknown|

**Code format**: 6-character base62 string  
**Hits**: Counter incremented on each redirect  
**CreatedAt**: ISO 8601 timestamp

## Project Structure

```
snip-demo/
├── backend/    → backend branch (Bun server)
├── frontend/   → frontend branch (Angular app)
├── cli/        → cli branch (Node CLI)
├── bundle/     → bundle branch (generated deployment bundle)
├── scripts/
│   └── build-bundle.mjs  — Bundle build script
└── README.md   (this file)
```

Each folder is a **Git submodule** tracking its respective branch of the same repository.

**Note**: The `bundle/` submodule contains generated output assembled by `scripts/build-bundle.mjs`. Do not edit files in `bundle/` directly — they will be overwritten on the next build.

## Cloning

To clone the full project with all three layers:

```bash
git clone --recurse-submodules https://github.com/chee0007/snip-demo
cd snip-demo
```

**Important**: Without `--recurse-submodules`, the submodule directories will be empty placeholders.

If you already cloned without the flag, initialize submodules manually:

```bash
git submodule update --init --recursive
```

## Running the Project

### 1. Start the Backend

```bash
cd backend
bun install  # if dependencies are added later
bun start
# Server runs on http://localhost:3000
```

**Environment variables:**
- `PORT` — Server port (default: 3000)
- `BASE_URL` — Base URL for short links (default: localhost)
- `RAILWAY_PUBLIC_DOMAIN` — Auto-detected on Railway deployments
- `PUBLIC_DIR` — Optional static file directory

### 2. Start the Frontend

```bash
cd frontend
npm install
npx ng serve
# App runs on http://localhost:4200
```

The Angular app will connect to the backend at `http://localhost:3000`.

**Build for production:**
```bash
npx ng build
# Output: dist/snip-frontend/browser/
```

To serve the production build via the backend, set `PUBLIC_DIR`:
```bash
cd ../backend
PUBLIC_DIR=../frontend/dist/snip-frontend/browser bun start
```

### 3. Use the CLI

```bash
cd cli
npm install -g .
# or: npm link

# Set backend URL if not localhost:3000
export SNIP_API=http://localhost:3000

# Create short links
snip add https://example.com

# List all links
snip ls

# Open a link in browser
snip open <code>
```

## Bundle Build (Deployment Package)

The `bundle/` submodule contains a complete, ready-to-deploy package that combines all three layers:

- **server.js** — Backend server
- **cli.js** — CLI tool  
- **public/** — Built frontend (static files)
- **.env** — Environment config (`PUBLIC_DIR=./public`)
- **package.json** — Deployment manifest
- **Dockerfile** — Container image definition
- **railway.json** — Railway deployment config

### Building the Bundle

```bash
# Build and commit (but don't push)
node scripts/build-bundle.mjs

# Build, commit, and push to remote
node scripts/build-bundle.mjs --push
```

The script is **idempotent** — running it multiple times without changes is a safe no-op.

**What the script does:**
1. Updates all submodules to their latest commits
2. Builds the Angular frontend (`npm install` + `ng build`)
3. Copies backend, CLI, and built frontend to `bundle/`
4. Generates deployment config files
5. Commits in `bundle/` if there are changes
6. Updates the submodule pointer in `main`
7. Optionally pushes both branches with `--push`

### Deploying the Bundle

The bundle branch can be deployed directly:

```bash
# Clone just the bundle branch
git clone -b bundle --single-branch https://github.com/chee0007/snip-demo snip-deploy
cd snip-deploy
bun start
# Server runs on port 3000, serving both API and frontend
```

Or build a Docker image:

```bash
docker build -t snip .
docker run -p 3000:3000 snip
```

## Development Workflow

### Making Changes to a Layer

1. **Work inside the submodule folder:**
   ```bash
   cd backend  # or frontend, or cli
   # Make your changes
   git add .
   git commit -m "feat: your change"
   git push origin backend  # or frontend, or cli
   ```

2. **Update the pointer in the main branch:**
   ```bash
   cd ..  # back to the root
   git submodule update --remote backend  # or frontend, or cli
   git add backend
   git commit -m "chore: update backend to latest"
   git push origin main
   ```

### Pulling Latest Changes

To update all submodules to their latest commits:

```bash
git pull
git submodule update --remote --recursive
git add .
git commit -m "chore: update all submodules"
git push
```

## Why This Structure?

### Benefits

1. **Clean separation** — Each layer has its own commit history, dependencies, and build process
2. **Independent development** — Teams can work on frontend, backend, or CLI without conflicts
3. **Branch-per-layer** — Deployments can target specific branches (e.g., Railway deploys `backend`)
4. **Shared repository** — All code lives in one repo; no need for multiple repos or package management
5. **Version locking** — The main branch pins specific commits of each layer

### Trade-offs

- Requires `--recurse-submodules` flag when cloning
- Submodule updates need explicit commits in the main branch
- Developers must understand the submodule workflow

## Deployment

### Backend (Railway / Render / Fly.io)

Deploy the `backend` branch directly:
- **Branch**: `backend`
- **Start command**: `bun run server.js`
- **PORT**: Auto-detected via environment variable

### Frontend (Vercel / Netlify / Cloudflare Pages)

Option 1: Deploy the `frontend` branch directly:
- **Branch**: `frontend`
- **Build command**: `npm install && npx ng build`
- **Output directory**: `dist/snip-frontend/browser`

Option 2: Serve via backend's `PUBLIC_DIR` (single deployment)

### CLI

Publish to npm:
```bash
cd cli
npm publish
```

Or use directly from the repository:
```bash
npm install -g git+https://github.com/chee0007/snip-demo#cli
```

## Tech Stack

| Layer    | Runtime  | Framework        | Language   | Dependencies |
|----------|----------|------------------|------------|--------------|
| Backend  | Bun      | Express-like     | JavaScript | 0 (zero)     |
| Frontend | Node     | Angular 19       | TypeScript | Standard     |
| CLI      | Node 18+ | Native (CommonJS)| JavaScript | 0 (zero)     |

## Design System

The frontend uses a design language inspired by Lovable.dev:
- Vibrant gradient hero (blue → purple → pink → coral → orange)
- Pill-rounded chat-style inputs
- Generous spacing and soft shadows
- Clean sans-serif typography

See `frontend/design.md` for the complete design token specification.

## License

ISC

## Repository

https://github.com/chee0007/snip-demo

**Branches:**
- `main` — This aggregator (submodules only)
- `backend` — Bun server
- `frontend` — Angular app
- `cli` — Node CLI
