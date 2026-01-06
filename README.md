# Notion Sales CRM (Table View + Sort/Filter) - Fullstack

![Assignment background](assignment_bg.png)

This repo includes a **Backend (Bun + Elysia)** that queries data from a **Notion Data Source** and a **Frontend (Next.js)** that renders a Sales CRM table with **Sort/Filter**.

---

## 1) Features

- **Sales CRM Table**: displays sales data (fetched from a Notion Data Source)
- **Sort**: sends sort criteria to the backend (multi-sort)
- **Compound Filter**: `and/or` filter tree (with max nesting depth)
- **API Docs**:
  - **Scalar**: UI + OpenAPI JSON
  - **Swagger UI**: UI + OpenAPI JSON
- **Tests + Coverage (Backend)**: Jest + HTML report (`coverage/lcov-report/index.html`)
- **Docker**: run full stack with `docker compose`

---

## 2) Project structure

- `backend/`: Bun + Elysia API, queries Notion, validates + applies filters
- `frontend-application/`: Next.js app (Sales CRM UI)
- `docker-compose.yml`: run FE + BE together
- `env.example`: sample env vars (for docker compose)

---

## 3) Requirements

- **Backend**: install **Bun** (recommended)
- **Frontend**: **Node.js 18+** and **npm**
- **Docker** (optional): Docker Desktop + Docker Compose v2
- Required credentials:
  - `NOTION_TOKEN`
  - `NOTION_DATA_SOURCE_ID`

### Install Bun

If you already have Node.js installed, you can install Bun globally via npm:

```bash
npm i -g bun
bun --version
```

---

## 4) Run Backend (local/dev)

### 4.1. Install dependencies

```bash
cd backend
bun install
```

### 4.2. Set Backend env vars

Backend reads these environment variables:

- `PORT` (default `3001`)
- `ALLOWED_URLS` (CORS origins, CSV format, e.g. `http://localhost:3000`)
- `NOTION_TOKEN` (**required**)
- `NOTION_DATA_SOURCE_ID` (**required**)
- `MAX_FILTER_DEPTH` (default `2`)

Example (bash):

```bash
export PORT=3001
export ALLOWED_URLS=http://localhost:3000
export NOTION_TOKEN=...
export NOTION_DATA_SOURCE_ID=...
export MAX_FILTER_DEPTH=2
```

Windows PowerShell (equivalent):

```powershell
$env:PORT="3001"
$env:ALLOWED_URLS="http://localhost:3000"
$env:NOTION_TOKEN="..."
$env:NOTION_DATA_SOURCE_ID="..."
$env:MAX_FILTER_DEPTH="2"
```

### 4.3. Start the dev server

```bash
bun run dev
```

Backend runs at:

- API base: `http://localhost:3001/api`
- Health: `GET http://localhost:3001/api/` → `{ message: "BE API is running" }`

---

## 5) API Docs (Scalar + Swagger)

When the backend is running:

### 5.1. Scalar

- UI: `http://localhost:3001/api/scalar`
- OpenAPI JSON: `http://localhost:3001/api/scalar/json`

### 5.2. Swagger UI

- UI: `http://localhost:3001/api/swagger`
- OpenAPI JSON: `http://localhost:3001/api/swagger/json`

---

## 6) Run Frontend (local/dev)

### 6.1. Install dependencies

```bash
cd frontend-application
npm ci
```

### 6.2. Set Frontend env vars

Frontend calls the backend via:

- `NEXT_PUBLIC_BACKEND_API_URL` (expected default `http://localhost:3001`)
- (Optional) `NEXT_PUBLIC_MAX_FILTER_DEPTH` (default `2`, filter nesting limit in the UI)

Example (bash):

```bash
export NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001
export NEXT_PUBLIC_MAX_FILTER_DEPTH=2
```

Windows PowerShell:

```powershell
$env:NEXT_PUBLIC_BACKEND_API_URL="http://localhost:3001"
$env:NEXT_PUBLIC_MAX_FILTER_DEPTH="2"
```

### 6.3. Start the dev server

```bash
npm run dev
```

Open the UI:

- `http://localhost:3000`

---

## 7) API used by the Frontend

Frontend calls:

- `POST /api/sales`

Example payload:

```json
{
  "sorts": [
    { "property": "Estimated_value", "direction": "ascending" }
  ],
  "filter": {
    "and": [
      { "property": "status", "filterOperator": "is", "value": "Won" },
      { "or": [
        { "property": "accountOwner", "filterOperator": "contains", "value": "john" },
        { "property": "accountOwner", "filterOperator": "contains", "value": "anna" }
      ]}
    ]
  }
}
```

Notes:

- `sorts[].property`: FE sends **column display names with spaces replaced by `_`** (e.g. `"Estimated value"` → `"Estimated_value"`). Backend converts `_` back to `" "` to query Notion.
- `filter.property`: uses **camelCase keys** (backend parses Notion column names: `"Estimated value"` → `estimatedValue`)
- Filters support `and/or` groups and conditions via `filterOperator` (string/number/date/checkbox/multi_select…)
- If filters are nested too deeply, it will error based on `MAX_FILTER_DEPTH`

---

## 8) Test & Coverage (Backend)

### 8.1. Run tests

```bash
cd backend
bun run test
```

### 8.2. Run tests with coverage

```bash
cd backend
bun run test-coverage
```

After running, it generates:

- `backend/coverage/`
- HTML report: `backend/coverage/lcov-report/index.html`

### 8.3. Open the HTML report with Live Server

Common approach (VS Code):

- Open `backend/coverage/lcov-report/index.html`
- Right click → **Open with Live Server**

Or use any static server (example):

```bash
cd backend/coverage/lcov-report
npx --yes serve .
```

---

## 9) Run with Docker (Frontend + Backend)

### 9.1. Create `.env` at the repo root

Copy `env.example` → `.env` (at the **repo root**) and fill:

- `NOTION_TOKEN`
- `NOTION_DATA_SOURCE_ID`

> Note: In real projects, `.env` files should be added to `.gitignore` to avoid accidentally committing secrets.
> For this assignment, I’m intentionally documenting the `.env` setup here to make the app easier to test end-to-end.
> My Notion integration is configured with **read-only** access, so it’s lower risk for demonstrating/testing purposes.

Important `.env` vars:

- `FRONTEND_PORT` (default `3000`)
- `BACKEND_PORT` (default `3001`)
- `NEXT_PUBLIC_BACKEND_API_URL` (default `http://localhost:3001`)
- `ALLOWED_URLS` (default `http://localhost:3000`)
- `MAX_FILTER_DEPTH` (default `2`)

### 9.2. Build & run

```bash
docker compose build
docker compose up
```

### 9.3. Open

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api`
- Scalar: `http://localhost:3001/api/scalar`
- Swagger: `http://localhost:3001/api/swagger`

---

## 10) Quick troubleshooting

- **CORS error**: verify `ALLOWED_URLS` includes your FE origin (e.g. `http://localhost:3000`) and is in CSV format.
- **FE cannot reach BE**: verify `NEXT_PUBLIC_BACKEND_API_URL` (local/dev or docker) points to the correct host/port.
- **Notion auth/data source errors**: verify `NOTION_TOKEN` and `NOTION_DATA_SOURCE_ID`.
