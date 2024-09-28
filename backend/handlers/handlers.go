package handlers

import (
	"encoding/json"
	"go-ws/chat"
	"log"
	"net/http"
	"strings"

	ws "github.com/gorilla/websocket"
)

type UsernamePostBody struct {
	Username string `json:"username"`
}

func Username(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		defer r.Body.Close()

		d := json.NewDecoder(r.Body)
		var body UsernamePostBody
		if err := d.Decode(&body); err != nil {
			http.Error(
				w,
				"No userame provided in post body",
				http.StatusBadRequest,
			)
			return
		}

		username := body.Username
		if username == "" {
			http.Error(
				w,
				"Username can't be empty",
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
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

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
