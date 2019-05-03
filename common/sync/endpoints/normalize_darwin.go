package endpoints

import (
	"fmt"
	"os"
	"strings"

	"golang.org/x/text/unicode/norm"
)

func CanonicalPath(path string) string {
	return path
}

func (c *FSClient) normalize(path string) string {
	path = strings.TrimLeft(path, string(os.PathSeparator))
	return string(norm.NFC.Bytes([]byte(path)))
}

func (c *FSClient) denormalize(path string) string {
	// Make sure it starts with a /
	path = fmt.Sprintf("/%v", strings.TrimLeft(path, "/"))
	return string(norm.NFD.Bytes([]byte(path)))
}
