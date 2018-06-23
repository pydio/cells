package main

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"

	"encoding/xml"

	"strings"

	"github.com/pydio/cells/frontend/registry"
)

func main() {
	path := os.Args[1]
	var files []string
	if strings.HasSuffix(path, "manifest.xml") {
		files = append(files, path)
	} else {
		files, _ = filepath.Glob(path + "/*/manifest.xml")
		if len(os.Args) > 2 {
			f2, _ := filepath.Glob(os.Args[2] + "/*/manifest.xml")
			files = append(files, f2...)
		}
	}
	plugins := &registry.Cplugins{}
	for _, f := range files {
		if data, e := ioutil.ReadFile(f); e == nil {
			if err := parse(plugins, data, f); err != nil {
				fmt.Println(err)
			}
		}
	}
	remarsh, _ := xml.MarshalIndent(plugins, "", "  ")
	fmt.Println(string(remarsh))
}

func parse(plugins *registry.Cplugins, data []byte, filename string) error {
	baseDir := filepath.Base(filepath.Dir(filename))
	plugType := strings.Split(baseDir, ".")[0]
	switch plugType {
	case "editor":
		var target registry.Ceditor
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = baseDir
			}
			plugins.Ceditor = append(plugins.Ceditor, &target)
		} else {
			return fmt.Errorf("Could not load "+baseDir, e1)
		}
	case "meta":
		var target registry.Cmeta
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = baseDir
			}
			plugins.Cmeta = append(plugins.Cmeta, &target)
		} else {
			return fmt.Errorf("Could not load "+baseDir, e1)
		}
	case "access":
		var target registry.Cajxpdriver
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = baseDir
			}
			plugins.Cajxpdriver = append(plugins.Cajxpdriver, &target)
		} else {
			return fmt.Errorf("Could not load "+baseDir, e1)
		}
	case "uploader":
		var target registry.Cuploader
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = baseDir
			}
			plugins.Cuploader = append(plugins.Cuploader, &target)
		} else {
			return fmt.Errorf("Could not load "+baseDir, e1)
		}
	default:
		var target registry.Cplugin
		if e1 := xml.Unmarshal(data, &target); e1 == nil {
			if target.Attrid == "" {
				target.Attrid = baseDir
			}
			plugins.Cplugin = append(plugins.Cplugin, &target)
		} else {
			return fmt.Errorf("Could not load "+baseDir, e1)
		}
	}
	return nil
}
