list:
	@just --list


# --- DEV ---

frontend-dev:
	@cd frontend && pnpm dev

backend-dev:
	@cd backend && gow -v run cmd/main.go

dev:
	@concurrently -k -p "[{name}]" -c "magenta.bold,blue.bold" -n "frontend,backend" "just frontend-dev" "just backend-dev"


# --- PROD ---

build:
	docker compose build

run:
	docker compose up

deploy: build run

bg-run:
	docker compose up -d

redeploy:
	git pull && just build && docker container stop websocket-chat-frontend-1 websocket-chat-backend-1 && just bg-run
