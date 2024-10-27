package utils

import "time"

func RoundDuration(d time.Duration) time.Duration {
	switch {
	case d > time.Second:
		d = d.Round(time.Second)
	case d > time.Millisecond:
		d = d.Round(time.Millisecond)
	case d > time.Microsecond:
		d = d.Round(time.Microsecond)
	}
	return d
}
