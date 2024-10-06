package main

import (
	"fmt"
	"go-ws/chat"
	"go-ws/handlers"
	"log"
	"net/http"
)

func main() {
	c := chat.New()

	http.Handle(
		"/static/",
		http.StripPrefix("/static/", http.FileServer(http.Dir("static"))),
	)

	mw := handlers.CorsMiddleware

	// TODO: only allow allowed methods (maybe use echo or chi)
	http.HandleFunc("/username", mw(handlers.Username(c)))
	http.HandleFunc("/ws", mw(handlers.WsEndpoint(c)))

	fmt.Println("Listening at port :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
