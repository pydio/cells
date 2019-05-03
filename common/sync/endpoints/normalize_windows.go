package endpoints

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func CanonicalPath(path string) string {

	// Remove any leading slash/backslash
	path = strings.TrimLeft(path, "/\\")

	// Handle SymLinks
	if p, e := filepath.EvalSymlinks(path); e != nil {

		return path

	} else if p != path {

		// Make sure drive letter is lowerCase
		volume := filepath.VolumeName(p)
		if strings.HasSuffix(volume, ":") {
			p = strings.ToLower(volume) + strings.TrimPrefix(p, volume)
		}
		return p

	} else {

		return path

	}

}

func (c *FSClient) normalize(path string) string {
	path = strings.TrimLeft(path, string(os.PathSeparator))
	return strings.Replace(path, string(os.PathSeparator), "/", -1)
}

func (c *FSClient) denormalize(path string) string {
	// Make sure it starts with a /
	path = fmt.Sprintf("/%v", strings.TrimLeft(path, "/"))
	return strings.Replace(path, "/", string(os.PathSeparator), -1)
}
