package packr

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"runtime"
	"strings"
	"sync"
)

var gil = &sync.Mutex{}
var data = map[string]map[string][]byte{}

var gil2 = &sync.Mutex{}
var loaders = map[string]func(){}

var boxLockers = map[string]*sync.Mutex{}

// PackBytes packs bytes for a file into a box.
func PackBytes(box string, name string, bb []byte) {
	gil.Lock()
	defer gil.Unlock()
	if _, ok := data[box]; !ok {
		data[box] = map[string][]byte{}
		boxLockers[box] = &sync.Mutex{}
	}
	boxLockers[box].Lock()
	data[box][name] = bb
	boxLockers[box].Unlock()
}

func GetBox(box string) (map[string][]byte, bool, *sync.Mutex) {
	gil.Lock()
	defer gil.Unlock()
	if dd, ok := data[box]; ok {
		return dd, ok, boxLockers[box]
	}
	return nil, false, nil
}

// PackBytesGzip packets the gzipped compressed bytes into a box.
func PackBytesGzip(box string, name string, bb []byte) error {
	var buf bytes.Buffer
	w := gzip.NewWriter(&buf)
	_, err := w.Write(bb)
	if err != nil {
		return err
	}
	err = w.Close()
	if err != nil {
		return err
	}
	PackBytes(box, name, buf.Bytes())
	return nil
}

// PackJSONBytes packs JSON encoded bytes for a file into a box.
func PackJSONBytes(box string, name string, jbb string) error {
	var bb []byte
	err := json.Unmarshal([]byte(jbb), &bb)
	if err != nil {
		return err
	}
	PackBytes(box, name, bb)
	return nil
}

func PackBoxLoader(box string, loader func()) {
	gil2.Lock()
	defer gil2.Unlock()
	loaders[box] = loader
}

// UnpackBytes unpacks bytes for specific box.
func UnpackBytes(box string) {
	gil.Lock()
	defer gil.Unlock()
	delete(data, box)
}

func osPaths(paths ...string) []string {
	if runtime.GOOS == "windows" {
		for i, path := range paths {
			paths[i] = strings.Replace(path, "/", "\\", -1)
		}
	}

	return paths
}

func osPath(path string) string {
	if runtime.GOOS == "windows" {
		return strings.Replace(path, "/", "\\", -1)
	}
	return path
}
