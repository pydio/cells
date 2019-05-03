// +build !darwin,!windows

package endpoints

import (
	"fmt"
	"os"
	"strings"
)

func CanonicalPath(path string) string {

	return path

}

func (c *FSClient) normalize(path string) string {
	path = strings.TrimLeft(path, string(os.PathSeparator))
	return path
}

func (c *FSClient) denormalize(path string) string {
	// Make sure it starts with a /
	return fmt.Sprintf("/%v", strings.TrimLeft(path, "/"))
}
