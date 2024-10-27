package main

import (
	"go-ws/chat"
	"go-ws/handlers"
	"go-ws/router"
	"log"
	"net/http"

	ws "github.com/gorilla/websocket"
)

var upgrader = &ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	r := router.New(chat.New(), upgrader)

	r.Use(handlers.CorsMiddleware)
	r.Use(handlers.Logging)

	r.Get("/api/users", handlers.GetUsers(r.Chat))
	r.Post("/api/username", handlers.PostUsername(r.Chat))
	r.Get("/api/ws", handlers.WsEndpoint(r.Chat, r.Upgrader))

	log.Println("Listening at port :8080")
	log.Fatal(r.Listen(":8080"))
}
