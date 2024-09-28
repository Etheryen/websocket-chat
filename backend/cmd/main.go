package main

import (
	"fmt"
	"go-ws/chat"
	"go-ws/handlers"
	"log"
	"net/http"
)

// TODO: dockerize
func main() {
	c := chat.New()

	http.Handle(
		"/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir("static"))),
	)

	// http.HandleFunc("GET /", handlers.HomeHandler)
	http.HandleFunc("/username", handlers.Username(c))
	http.HandleFunc("/ws", handlers.WsEndpoint(c))

	fmt.Println("Listening at: http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
