package chat

import (
	"log"
	"strings"
	"sync"

	ws "github.com/gorilla/websocket"
)

type Chat struct {
	clientSet map[*client]struct{}
	mu        sync.RWMutex
}

// TODO: add pong and ping

func New() *Chat {
	return &Chat{
		clientSet: make(map[*client]struct{}),
	}
}

func (c *Chat) GetActiveUsers() []string {
	c.mu.RLock()
	defer c.mu.RUnlock()

	usernames := make([]string, 0, len(c.clientSet))
	for cl := range c.clientSet {
		usernames = append(usernames, cl.username)
	}

	return usernames
}

func (c *Chat) IsUsernameTaken(username string) bool {
	c.mu.RLock()
	defer c.mu.RUnlock()

	for cl := range c.clientSet {
		if strings.EqualFold(cl.username, username) {
			return true
		}
	}

	return false
}

func (c *Chat) Join(conn *ws.Conn, username string) {
	cl := c.subscribe(username)
	log.Println(username, "joined")
	log.Println("Users:", len(c.clientSet))

	c.broadcast(newMessage("users", c.GetActiveUsers()))

	// TODO: maybe use context cancel instead
	var wg sync.WaitGroup
	exitChan := make(chan struct{})

	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case msg, ok := <-cl.toSend:
				if !ok {
					return
				}
				if err := msg.send(conn); err != nil {
					return
				}
			case <-exitChan:
				return
			}
		}
	}()

	wg.Add(1)
	// TODO: somehow abort this one also when sends exists
	go func() {
		defer wg.Done()
		for {
			_, bytes, err := conn.ReadMessage()
			if err != nil {
				close(exitChan)
				return
			}
			data := textMessageData{
				Author:  username,
				Content: string(bytes),
			}
			log.Printf("msg: %#v", data)
			c.broadcast(newMessage("text", data))
		}
	}()

	// Wait for both reads and writes to be closed
	wg.Wait()

	c.removeClient(cl)
	log.Println(username, "disconnected")
	c.broadcast(newMessage("users", c.GetActiveUsers()))

	c.mu.RLock()
	defer c.mu.RUnlock()

	log.Println("Users:", len(c.clientSet))
}

func (c *Chat) removeClient(cl *client) {
	c.mu.Lock()
	defer c.mu.Unlock()

	close(cl.toSend)
	delete(c.clientSet, cl)
}

func (c *Chat) subscribe(username string) *client {
	cl := newClient(username)

	c.mu.Lock()
	defer c.mu.Unlock()

	c.clientSet[cl] = struct{}{}
	return cl
}

func (c *Chat) broadcast(msg *message) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	for cl := range c.clientSet {
		go func() { cl.toSend <- msg }()
	}
}
