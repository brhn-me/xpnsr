# xpnsr - Expense Tracking App

A modern expense tracking application built with FastAPI and React.

## Stack
- **Backend**: Python (FastAPI), SQLModel, AsyncPG, Alembic.
- **Frontend**: React (Vite), Tailwind CSS v4.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker Compose.

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Make (optional, for convenience)
- backend: `uv` (for local dev)
- frontend: `pnpm` (for local dev)

### Quick Start (Docker)

To run the entire stack (Backend, Frontend, and Database) in Docker:

```bash
make up
# OR
docker-compose up -d --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs

To stop the containers:
```bash
make down
```

### Local Development

If you prefer to run the apps locally while keeping the database in Docker:

1. **Start Database**:
   ```bash
   make dev-db
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   uv sync
   uv run alembic upgrade head
   uv run uvicorn src.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

## API Documentation

The API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## Project Structure

- `backend/`: FastAPI application.
- `frontend/`: React Vite application.
- `docker-compose.yml`: Container orchestration.
- `Makefile`: Convenience commands.
