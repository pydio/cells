// +build ocr

package docconv

import (
	"fmt"
	"io"
	"sync"

	"github.com/otiai10/gosseract"
)

var langs = struct {
	sync.RWMutex
	lang string
}{lang: "eng"}

// ConvertImage converts images to text.
// Requires gosseract.
func ConvertImage(r io.Reader) (string, map[string]string, error) {
	f, err := NewLocalFile(r, "/tmp", "sajari-convert-")
	if err != nil {
		return "", nil, fmt.Errorf("error creating local file: %v", err)
	}
	defer f.Done()

	meta := make(map[string]string)
	out := make(chan string, 1)

	// TODO: Why is this done in a separate goroutine when ConvertImage blocks until it returns?
	go func(file *LocalFile) {
		langs.RLock()
		body := gosseract.Must(gosseract.Params{Src: file.Name(), Languages: langs.lang})
		langs.RUnlock()
		out <- string(body)
	}(f)

	return <-out, meta, nil
}

// SetImageLanguages sets the languages parameter passed to gosseract.
func SetImageLanguages(l string) {
	langs.Lock()
	langs.lang = l
	langs.Unlock()
}
