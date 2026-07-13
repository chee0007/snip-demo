# Snip CLI

Command-line interface for the Snip URL shortener.

## Installation

```bash
npm install -g .
# or link for development
npm link
```

## Configuration

Set the backend URL via environment variable:

```bash
export SNIP_API=http://localhost:3000  # default
```

## Usage

### Create a short link
```bash
snip add https://example.com
# Output: http://localhost:3000/aB3xY9
```

### List all links
```bash
snip ls
# Output:
# CODE    HITS  URL
# --------------------------------------------------
# aB3xY9  0     https://example.com
# xYz123  5     https://github.com
```

### Open a short link in browser
```bash
snip open aB3xY9
# Opens the original URL in your default browser
```

### Show help
```bash
snip help
# or just
snip
```

## Cross-Platform Wrappers

- **Unix/Linux/macOS**: `./snip` (shell script)
- **Windows Command Prompt**: `snip.cmd` (batch file)
- **Windows PowerShell**: `snip.ps1` (PowerShell script)

All wrappers forward arguments to `cli.js`.

## Requirements

- Node.js 18+ (for native `fetch` support)
- Backend server running at `SNIP_API` URL

## Error Handling

- Invalid URLs → exit code 1, error to stderr
- Unknown short codes → exit code 1, error to stderr
- Unreachable backend → exit code 1, error to stderr
- Successful commands → exit code 0
