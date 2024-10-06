FROM golang:1.22-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o bin/main cmd/main.go


FROM scratch
COPY --from=builder /app/bin/main /app
ENTRYPOINT ["/app"]
