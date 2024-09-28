package chat

import (
	"encoding/json"
	"go-ws/utils"
	"strings"
	"sync"

	ws "github.com/gorilla/websocket"
)

type Chat struct {
	clientSet map[string]struct{}
	mu        sync.Mutex
	subs      []chan Message
}

type Message struct {
	Id   uint32 `json:"id"`
	Kind string `json:"kind"`
	Data any    `json:"data"`
}

func New() *Chat {
	return &Chat{
		clientSet: make(map[string]struct{}),
		subs:      make([]chan Message, 0),
	}
}

func (c *Chat) IsUsernameTaken(username string) bool {
	for taken := range c.clientSet {
		if strings.EqualFold(taken, username) {
			return true
		}
	}

	return false
}

func (c *Chat) Join(conn *ws.Conn, username string) {
	toSendChan := c.subscribe(username)
	c.broadcast(Message{Id: utils.GetId(), Kind: "users", Data: c.getUserIds()})

	exitChan := make(chan struct{})

	go func() {
		defer func() { exitChan <- struct{}{} }()
		for msg := range toSendChan {
			if err := msg.send(conn); err != nil {
				break
			}
		}
	}()

	go func() {
		defer func() { exitChan <- struct{}{} }()
		for {
			_, bytes, err := conn.ReadMessage()
			if err != nil {
				break
			}
			data := map[string]any{
				"author":  username,
				"content": string(bytes),
			}
			c.broadcast(Message{Id: utils.GetId(), Kind: "text", Data: data})
		}
	}()

	<-exitChan

	c.removeClient(username)
	c.broadcast(Message{Id: utils.GetId(), Kind: "users", Data: c.getUserIds()})
}

func (m *Message) send(conn *ws.Conn) error {
	wsMsg, err := json.Marshal(m)
	if err != nil {
		return err
	}

	if err = conn.WriteMessage(ws.TextMessage, wsMsg); err != nil {
		return err
	}

	return nil
}

func (c *Chat) removeClient(username string) {
	c.mu.Lock()
	delete(c.clientSet, username)
	c.mu.Unlock()
}

func (c *Chat) subscribe(username string) chan Message {
	ch := make(chan Message)

	c.mu.Lock()
	c.subs = append(c.subs, ch)
	c.clientSet[username] = struct{}{}
	c.mu.Unlock()

	return ch
}

func (c *Chat) broadcast(msg Message) {
	c.mu.Lock()
	for _, sub := range c.subs {
		go func() { sub <- msg }()
	}
	c.mu.Unlock()
}

func (c *Chat) getUserIds() []string {
	c.mu.Lock()
	usernames := make([]string, 0, len(c.clientSet))
	for username := range c.clientSet {
		usernames = append(usernames, username)
	}
	c.mu.Unlock()

	return usernames
}
