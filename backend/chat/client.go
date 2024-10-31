package chat

import "strings"

type client struct {
	username string
	toSend   chan *message
}

func newClient(username string) *client {
	return &client{
		username: username,
		toSend:   make(chan *message),
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
