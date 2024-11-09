package validation

import (
	"errors"
	"go-ws/internal/chat"
	"strings"
)

const (
	minUsernameLength = 3
	maxUsernameLength = 25
)

func ValidateUsername(c *chat.Chat, username string) error {
	if strings.TrimSpace(username) == "" {
		return errors.New("No userame provided")
	}

	if strings.ContainsAny(username, " \t") {
		return errors.New("Whitespace in username is disallowed")
	}

	if len(strings.TrimSpace(username)) < minUsernameLength {
		return errors.New("Username too short")
	}

	if len(strings.TrimSpace(username)) > maxUsernameLength {
		return errors.New("Username too long")
	}

	if c.IsUsernameTaken(username) {
		return errors.New("Username is taken")
	}

	return nil
}
