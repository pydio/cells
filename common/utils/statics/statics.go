/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package statics

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

type FS interface {
	fs.FS
	List() []string
}

// PackrBox avoids pulling in the packr library for everyone, mimicks the bits of
// packr.Box that we need.
type PackrBox interface {
	List() []string
	Open(name string) (http.File, error)
}

type packrFS struct {
	box PackrBox
}

func (p *packrFS) Open(name string) (fs.File, error) {
	return p.box.Open(name)
}

func (p *packrFS) List() []string {
	return p.box.List()
}

type embedFS struct {
	fs.FS
}

func (e *embedFS) List() []string {
	var output []string
	fs.WalkDir(e.FS, ".", func(path string, d fs.DirEntry, err error) error {
		if path != "." {
			output = append(output, path)
		}
		return nil
	})
	return output
}

type httpFS struct {
	http.FileSystem
}

func (h httpFS) Open(name string) (fs.File, error) {
	return h.FileSystem.Open(name)
}

func (h httpFS) List() []string {
	return []string{}
}

func AsFS(box interface{}, sub ...string) FS {
	if pb, ok := box.(PackrBox); ok {
		return &packrFS{box: pb}
	} else if efs, ok2 := box.(embed.FS); ok2 {
		if len(sub) > 0 {
			f, _ := fs.Sub(efs, sub[0])
			return &embedFS{FS: f}
		} else {
			return &embedFS{FS: efs}
		}
	} else if f, ok3 := box.(fs.FS); ok3 {
		if len(sub) > 0 {
			f, _ = fs.Sub(f, sub[0])
		}
		return &embedFS{FS: f}
	} else if hf, ok4 := box.(http.FileSystem); ok4 {
		return &httpFS{FileSystem: hf}
	} else {
		fmt.Println("Calling AsFS on unknown type, returning empty embedFS", box)
		empty := embed.FS{}
		return &embedFS{FS: empty}
	}
}

// GetAssets returns the location of the assets if they physically exist
func GetAssets(path string) (string, error) {

	var cd string
	if !filepath.IsAbs(path) {
		_, filename, _, _ := runtime.Caller(1)
		cd = filepath.Dir(filename)
	}

	// this little hack courtesy of the `-cover` flag!!
	cov := filepath.Join("_test", "_obj_test")
	cd = strings.Replace(cd, string(filepath.Separator)+cov, "", 1)
	if !filepath.IsAbs(cd) && cd != "" {
		cd = filepath.Join(os.Getenv("GOPATH"), "src", cd)
	}

	if _, err := os.Stat(cd); os.IsNotExist(err) {
		return "", err
	}

	return filepath.Join(cd, path), nil
}

// RestoreAssets copies the files from the binary to a hard location on the disk
// It returns an error, or the total number of files and the total size of all files written
func RestoreAssets(dir string, box FS, pg chan float64, excludes ...string) (int, int64, error) {

	if err := os.MkdirAll(dir, os.FileMode(0755)); err != nil {
		return 0, 0, err
	}

	index := 0
	totalSize := int64(0)
	fullList := box.List()
	filesCount := len(fullList)
	updatePg := func(i int) {
		if pg == nil {
			return
		}
		pg <- float64(i) / float64(filesCount)
	}

	for _, n := range fullList {

		var ex bool
		if len(excludes) > 0 {
			for _, exclude := range excludes {
				if strings.HasPrefix(n, exclude) {
					ex = true
				}
			}
		}
		if ex {
			continue
		}

		f, err := box.Open(n)
		if err != nil {
			return index, totalSize, err
		}

		info, err := f.Stat()
		if err != nil {
			f.Close()
			return index, totalSize, err
		}

		if info.IsDir() {
			if err := os.MkdirAll(_filePath(dir, n), os.FileMode(0755)); err != nil {
				f.Close()
				return index, totalSize, err
			}
			index++
			updatePg(index)
			continue
		}

		if err := os.MkdirAll(_filePath(dir, filepath.Dir(n)), os.FileMode(0755)); err != nil {
			f.Close()
			return index, totalSize, err
		}
		target, err := os.OpenFile(_filePath(dir, n), os.O_CREATE|os.O_WRONLY, os.FileMode(0755))
		if err != nil {
			f.Close()
			return index, totalSize, err
		}
		written, err := io.Copy(target, f)
		target.Close()
		f.Close()
		if err != nil {
			return index, totalSize, err
		}
		index++
		totalSize += written
		updatePg(index)
	}

	log.Printf("Extracted %d files for a total size of %d", index, totalSize)

	return index, totalSize, nil
}

func _filePath(dir, name string) string {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	return filepath.Join(append([]string{dir}, strings.Split(cannonicalName, "/")...)...)
}
