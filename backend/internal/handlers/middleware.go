package handlers

import (
	"bufio"
	"errors"
	"fmt"
	"go-ws/internal/utils"
	"log"
	"net"
	"net/http"
	"time"
)

// TODO: production url cors
func CorsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (rec *statusRecorder) WriteHeader(code int) {
	rec.status = code
	rec.ResponseWriter.WriteHeader(code)
}

func (rec *statusRecorder) Write(b []byte) (int, error) {
	if rec.status == 0 {
		rec.WriteHeader(http.StatusOK)
	}
	return rec.ResponseWriter.Write(b)
}

// Websocket requires Hijack to be supported
func (rec *statusRecorder) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	hj, ok := rec.ResponseWriter.(http.Hijacker)
	if !ok {
		return nil, nil, errors.New("statusRecorder does not support hijacking")
	}
	return hj.Hijack()
}

func Logging(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rec := &statusRecorder{ResponseWriter: w, status: 0}

		start := time.Now()
		next(rec, r)
		took := time.Since(start)

		var statusColorString string
		if rec.status >= 400 {
			// red
			statusColorString = fmt.Sprintf("\033[31m%d", rec.status)
		} else {
			// green (acutally blue but looks green in rose-pine)
			statusColorString = fmt.Sprintf("\033[34m%d", rec.status)
		}

		// Colorful print
		log.Printf(
			"\033[33m%s \033[36m%s \033[34m%s\033[0m in \033[35m%s\033[0m",
			r.Method,
			r.URL.Path,
			statusColorString,
			utils.RoundDuration(took),
		)
	}
}
