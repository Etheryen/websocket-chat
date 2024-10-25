package server

import (
	"go-ws/chat"
	"net/http"

	ws "github.com/gorilla/websocket"
)

type MiddlewareFunc func(next http.HandlerFunc) http.HandlerFunc

type Server struct {
	Chat     *chat.Chat
	Upgrader *ws.Upgrader
	mux      *http.ServeMux
	mwFuncs  []MiddlewareFunc
}

func New(
	chat *chat.Chat,
	upgrader *ws.Upgrader,
) *Server {
	return &Server{
		Chat:     chat,
		Upgrader: upgrader,
		mux:      http.NewServeMux(),
	}
}

func (s *Server) Use(mw MiddlewareFunc) {
	s.mwFuncs = append(s.mwFuncs, mw)
}

func (s *Server) Listen(addr string) error {
	return http.ListenAndServe(addr, s.mux)
}

func (s *Server) withMw(handler http.HandlerFunc) http.HandlerFunc {
	for _, mw := range s.mwFuncs {
		handler = mw(handler)
	}

	return handler
}

func (s *Server) Get(pattern string, handler http.HandlerFunc) {
	mwHandler := s.withMw(handler)

	s.mux.HandleFunc("GET "+pattern, mwHandler)
	s.mux.HandleFunc("OPTIONS "+pattern, mwHandler)
}

func (s *Server) Post(pattern string, handler http.HandlerFunc) {
	mwHandler := s.withMw(handler)

	s.mux.HandleFunc("POST "+pattern, mwHandler)
	s.mux.HandleFunc("OPTIONS "+pattern, mwHandler)
}
