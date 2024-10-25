package main

import (
	"fmt"
	"go-ws/chat"
	"go-ws/handlers"
	"go-ws/server"
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
	s := server.New(chat.New(), upgrader)

	s.Use(handlers.CorsMiddleware)

	s.Get("/api/users", handlers.GetUsers(s.Chat))
	s.Post("/api/username", handlers.PostUsername(s.Chat))
	s.Get("/api/ws", handlers.WsEndpoint(s.Chat, s.Upgrader))

	fmt.Println("Listening at port :8080")
	log.Fatal(s.Listen(":8080"))
}
