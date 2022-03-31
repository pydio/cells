package main

import (
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	dir := "./"
	if len(os.Args) > 1 {
		dir = os.Args[1]
	}
	_ = filepath.Walk(dir, func(path string, info fs.FileInfo, err error) error {
		if o, _ := filepath.Match("*.pb.go", filepath.Base(path)); o {
			//fmt.Println("Checking File " + path)
			if bb, e := ioutil.ReadFile(path); e == nil {
				content := string(bb)
				if strings.Contains(content, "\"github.com/pydio/cells/common/proto/") || strings.Contains(content, "proto \"github.com/golang/protobuf/proto\"") {
					fmt.Println(" - Patching imports for " + path)
					content = strings.ReplaceAll(string(bb), "\"github.com/pydio/cells/common/proto/", "\"github.com/pydio/cells/v4/common/proto/")
					content = strings.ReplaceAll(content, "proto \"github.com/golang/protobuf/proto\"", "proto \"google.golang.org/protobuf/proto\"")
					ioutil.WriteFile(path, []byte(content), 0644)
				}
			}
		}
		return nil
	})
}
