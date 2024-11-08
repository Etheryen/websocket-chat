list:
	@just --list

frontend-dev:
	@cd frontend && pnpm dev

backend-dev:
	@cd backend && gow -v run cmd/main.go

dev:
	@concurrently -k -p "[{name}]" -c "magenta.bold,blue.bold" -n "frontend,backend" "just frontend-dev" "just backend-dev"

deploy:
	docker compose up --build

background:
	docker compose up --build -d

redeploy:
	git pull && docker container stop websocket-chat-frontend-1 websocket-chat-backend-1 && just background
