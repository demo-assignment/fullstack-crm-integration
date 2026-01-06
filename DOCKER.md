## Docker (Frontend + Backend)

### 1) Create env file

This workspace blocks creating `.env*` via the editor tools, so:

- Copy `env.example` to a new file named `.env` at the repo root
- Fill in:
  - `NOTION_TOKEN`
  - `NOTION_DATA_SOURCE_ID`

### 2) Build & run

```bash
docker compose build
docker compose up
```

### 3) Open

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api`
