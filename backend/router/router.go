package router

import (
	"go-ws/chat"
	"net/http"

	ws "github.com/gorilla/websocket"
)

type MiddlewareFunc func(next http.HandlerFunc) http.HandlerFunc

type Router struct {
	Chat     *chat.Chat
	Upgrader *ws.Upgrader
	mux      *http.ServeMux
	mwFuncs  []MiddlewareFunc
}

func New(
	chat *chat.Chat,
	upgrader *ws.Upgrader,
) *Router {
	return &Router{
		Chat:     chat,
		Upgrader: upgrader,
		mux:      http.NewServeMux(),
	}
}

func (r *Router) Use(mw MiddlewareFunc) {
	r.mwFuncs = append(r.mwFuncs, mw)
}

func (r *Router) Listen(addr string) error {
	return http.ListenAndServe(addr, r.mux)
}

func (r *Router) withMw(handler http.HandlerFunc) http.HandlerFunc {
	for _, mw := range r.mwFuncs {
		handler = mw(handler)
	}

	return handler
}

func (r *Router) Get(pattern string, handler http.HandlerFunc) {
	mwHandler := r.withMw(handler)

	r.mux.HandleFunc("GET "+pattern, mwHandler)
	r.mux.HandleFunc("OPTIONS "+pattern, mwHandler)
}

func (r *Router) Post(pattern string, handler http.HandlerFunc) {
	mwHandler := r.withMw(handler)

	r.mux.HandleFunc("POST "+pattern, mwHandler)
	r.mux.HandleFunc("OPTIONS "+pattern, mwHandler)
}
