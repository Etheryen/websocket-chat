package chat

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
