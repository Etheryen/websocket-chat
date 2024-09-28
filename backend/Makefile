FLAGS = 

dev:
	clear && gow -s -v -e go,html,js run cmd/main.go $(FLAGS)

build:
	go build -o bin/app cmd/main.go

run: build
	./bin/app $(FLAGS)

test:
	go test -v ./... -count=1
