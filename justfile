list:
	@just --list

frontend-dev:
	cd frontend && pnpm dev

backend-dev:
	cd backend && gow -s -v run cmd/main.go

deploy:
	docker compose up --build
