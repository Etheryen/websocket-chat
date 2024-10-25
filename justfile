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
