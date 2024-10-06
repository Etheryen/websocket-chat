package handlers

import (
	"encoding/json"
	"go-ws/chat"
	"log"
	"net/http"
	"strings"

	ws "github.com/gorilla/websocket"
)

func CorsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func Username(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		d := json.NewDecoder(r.Body)
		var body map[string]string
		if err := d.Decode(&body); err != nil {
			http.Error(
				w,
				"Couldn't decode request body",
				http.StatusBadRequest,
			)
			return
		}

		username := body["username"]
		if username == "" {
			http.Error(
				w,
				"No non-empty username provided in post body",
				http.StatusBadRequest,
			)
			return
		}

		if c.IsUsernameTaken(username) {
			http.Error(
				w,
				"Username is taken",
				http.StatusBadRequest,
			)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

var upgrader = ws.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func WsEndpoint(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := r.URL.Query().Get("username")
		if strings.TrimSpace(username) == "" {
			http.Error(
				w,
				"No userame provided in query param",
				http.StatusBadRequest,
			)
			return
		}

		if c.IsUsernameTaken(username) {
			log.Println("USER EXISTS")
			http.Error(
				w,
				"Username is taken",
				http.StatusBadRequest,
			)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			panic(err)
		}

		c.Join(conn, username)
	}
}
