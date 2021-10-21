/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package assets is based on Packr to embed static data inside the binary.
//
// It embeds the small pure-js frontend loaded at install time and the pure-JS frontend
// served to the end-users (packages separately, not committed and added a build time).
package assets

import (
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/pydio/packr"
)

var (
	// PydioInstallBox holds the root of the pydio install static files
	PydioInstallBox = packr.NewBox("./src")
)

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
		cd = filepath.Join(packr.GoPath(), "src", cd)
	}

	if _, err := os.Stat(cd); os.IsNotExist(err) {
		return "", err
	}

	return filepath.Join(cd, path), nil
}

// RestoreAssets copies the files from the binary to a hard location on the disk
// It returns an error, or the total number of files and the total size of all files written
func RestoreAssets(dir string, box packr.Box, pg chan float64, excludes ...string) (int, int64, error) {

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
