# Snip Backend

A tiny URL shortener built with Bun. Zero dependencies, in-memory storage.

## Setup

```bash
bun run server.js
# or
bun start
```

## Environment Variables

- **PORT** — Server port (default: 3000)
- **BASE_URL** — Base URL for short links (e.g., `https://snip.example.com`)
- **RAILWAY_PUBLIC_DOMAIN** — Fallback for Railway deployments (auto-constructs BASE_URL)
- **PUBLIC_DIR** — Optional path to serve static files (e.g., a frontend build)

## API

### Create Short Link
```bash
POST /api/links
Content-Type: application/json

{ "url": "https://example.com" }
```
**Response (201):**
```json
{
  "code": "aB3xY9",
  "url": "https://example.com",
  "shortUrl": "http://localhost:3000/aB3xY9",
  "hits": 0,
  "createdAt": "2026-07-13T12:00:00.000Z"
}
```

### List All Links
```bash
GET /api/links
```
**Response (200):** Array of all links

### Redirect
```bash
GET /:code
```
**Response:** 302 redirect to the original URL (or 404 if not found)

## Features

- 6-character base62 short codes
- Hit counter incremented on each redirect
- Open CORS for cross-origin browser access
- Static file serving when PUBLIC_DIR is set (files take precedence over short codes)
