package handlers

import (
	"encoding/json"
	"go-ws/chat"
	"log"
	"net/http"
	"strings"

	ws "github.com/gorilla/websocket"
)

func GetUsers(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		users := c.GetActiveUsers()
		usersJson, err := json.Marshal(users)
		if err != nil {
			err := "Couldn't encode users"
			http.Error(w, err, http.StatusInternalServerError)
			return
		}

		if _, err = w.Write(usersJson); err != nil {
			err := "Couldn't write response"
			http.Error(w, err, http.StatusInternalServerError)
		}
	}
}

func GetHistory(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		history := c.GetHistory()
		historyJson, err := json.Marshal(history)
		if err != nil {
			err := "Couldn't encode history"
			http.Error(w, err, http.StatusInternalServerError)
			return
		}

		if _, err = w.Write(historyJson); err != nil {
			err := "Couldn't write response"
			http.Error(w, err, http.StatusInternalServerError)
		}
	}
}

func PostUsername(c *chat.Chat) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()

		d := json.NewDecoder(r.Body)
		var body map[string]string
		if err := d.Decode(&body); err != nil {
			err := "Couldn't decode request body"
			http.Error(w, err, http.StatusBadRequest)
			return
		}

		username := body["username"]
		if username == "" {
			err := "No non-empty username provided in post body"
			http.Error(w, err, http.StatusBadRequest)
			return
		}

		if c.IsUsernameTaken(username) {
			err := "Username is taken"
			http.Error(w, err, http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func WsEndpoint(c *chat.Chat, upgrader *ws.Upgrader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username := r.URL.Query().Get("username")
		if strings.TrimSpace(username) == "" {
			err := "No userame provided in query param"
			http.Error(w, err, http.StatusBadRequest)
			return
		}

		if c.IsUsernameTaken(username) {
			log.Println("User exists:", username)
			err := "Username is taken"
			http.Error(w, err, http.StatusBadRequest)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			panic(err)
		}

		c.Join(conn, username)
	}
}
