package error

import (
	"regexp"
	"strconv"
	"strings"
)

// IsErrorPortPermissionDenied checks wether the passed error fits with the error returned when we cannot bind a protected port that is below 1024.
func IsErrorPortPermissionDenied(err error) (bool, int) {
	pattern := regexp.MustCompile("listen tcp :\\d{1,4}: bind: permission denied")
	pattern2 := regexp.MustCompile("\\d{1,4}")
	if pattern.MatchString(err.Error()) {
		port, _ := strconv.Atoi(pattern2.FindString(err.Error()))
		if port < 1024 {
			return true, port
		}
	}
	return false, 0
}

// IsErrorPortBusy checks wether the passed error fits with the error returned when trying to bind a port that is already in use.
func IsErrorPortBusy(err error) bool {
	return strings.HasSuffix(err.Error(), "bind: address already in use")
}
