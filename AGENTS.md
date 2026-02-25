# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Portfolio Manager OCR (持仓整理工具 v1.1) — a single-service Node.js/Express app that uses AI vision APIs (MiniMax, Gemini, OpenAI) to OCR brokerage screenshots into structured portfolio data. No database; all state is client-side.

### Running the app

- **Dev server**: `npm run dev` (uses nodemon, port 3011 by default)
- **Production**: `npm start`
- **Health check**: `GET http://localhost:3011/health`
- **Version/engines**: `GET http://localhost:3011/api/version`
- Frontend is served at `GET /` (file: `持仓整理工具.html`)

### Testing

- No formal test framework (no ESLint, Jest, etc.). Syntax-check JS files with `node --check <file>`.
- Integration test: `npm run test:ocr` — tests health endpoint and MiniMax OCR endpoint. Passes without API keys (gracefully handles auth errors as expected).

### Environment variables

Copy `.env.example` to `.env`. All API keys are optional for starting the server; at least one is needed for actual OCR functionality. See `.env.example` for the full list.

### Gotchas

- The main HTML file uses a Chinese filename (`持仓整理工具.html`). Be careful with shell quoting when referencing it.
- The `checkOcrService()` function in the frontend checks for `version === 2` from `/api/version`, but server returns `version: 4`. This means the OCR calculation flow works with the current version.
- `nodemon` watches for changes and auto-restarts; however, changes to `.env` require a manual restart of the dev server.
