package chat

import (
	"encoding/json"
	"fmt"
	"go-ws/utils"

	ws "github.com/gorilla/websocket"
)

type message struct {
	Id   uint32 `json:"id"`
	Kind string `json:"kind"`
	Data any    `json:"data"`
}

type usersMessageData = []string

type textMessageData struct {
	Author  string `json:"author"`
	Content string `json:"content"`
}

func newMessage(kind string, data any) *message {
	switch kind {
	case "text":
		if _, ok := data.(textMessageData); !ok {
			err := "Message kind `%s` cannot hold data `%d`"
			panic(fmt.Sprintf(err, kind, data))
		}
	case "users":
		if _, ok := data.(usersMessageData); !ok {
			err := "Message kind `%s` cannot hold data `%v`"
			panic(fmt.Sprintf(err, kind, data))
		}
	default:
		panic(fmt.Sprintf("Unrecognized message kind `%s`", kind))
	}

	return &message{Id: utils.GetId(), Kind: kind, Data: data}
}

func (m *message) send(conn *ws.Conn) error {
	wsMsg, err := json.Marshal(m)
	if err != nil {
		return err
	}

	if err = conn.WriteMessage(ws.TextMessage, wsMsg); err != nil {
		return err
	}

	return nil
}
