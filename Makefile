.PHONY: help install dev-db dev kill down clean logs

help:
	@echo "Available commands:"
	@echo "  make install   - Install local dependencies (backend & frontend)"
	@echo "  make dev       - Run local dev environment with hot-reload"
	@echo "  make kill      - Kill processes on hanging ports (8000, 5173)"
	@echo "  make dev-db    - Start only the database (for local dev)"
	@echo "  make up        - Start everything in Docker"
	@echo "  make down      - Stop all containers"
	@echo "  make clean     - Stop containers and remove volumes"

install:
	@echo "Installing dependencies..."
	cd backend && uv sync
	cd frontend && pnpm install

dev-db:
	docker compose up -d db

dev: dev-db
	@echo "Starting backend and frontend in dev mode (Ctrl+C to stop)..."
	@bash -c "trap 'kill 0' INT; \
	  (cd backend && uv run uvicorn src.main:app --reload) & \
	  (cd frontend && pnpm dev) & \
	  wait"

kill:
	@echo "Cleaning up hanging ports 8000 (backend) and 5173 (frontend)..."
	@-lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@-lsof -ti:5173 | xargs kill -9 2>/dev/null || true

up:
	docker compose up -d --build

down:
	docker compose down

clean:
	docker compose down -v

logs:
	docker compose logs -f
