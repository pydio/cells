package std

import (
	"strconv"
	"strings"
	"time"
)

// ParseCellsDuration wraps standard time.ParseDuration supporting the "d" unit (as day)
func ParseCellsDuration(s string) (time.Duration, error) {

	if strings.HasSuffix(s, "d") {
		n, e := strconv.Atoi(strings.TrimSuffix(s, "d"))
		if e != nil {
			return 0, nil
		}
		return time.Duration(n) * time.Hour * 24, nil
	} else {
		return time.ParseDuration(s)
	}

}
