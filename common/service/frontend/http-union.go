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

package frontend

import (
	"io"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/pydio/cells/common"

	"github.com/gin-gonic/gin/json"
	"github.com/pydio/packr"
)

type UnionHttpFs struct {
	boxes     []packr.Box
	indexFile http.File

	useTime bool
	time    time.Time
}

type timedFile struct {
	http.File
	t time.Time
}

func newTimedFile(f http.File, t time.Time) *timedFile {
	return &timedFile{
		File: f,
		t:    t,
	}
}

func (tf *timedFile) Stat() (os.FileInfo, error) {
	s, e := tf.File.Stat()
	if e != nil {
		return nil, e
	}
	ti := &timedInfo{
		FileInfo: s,
		t:        tf.t,
	}
	return ti, nil
}

type timedInfo struct {
	os.FileInfo
	t time.Time
}

func (ti *timedInfo) ModTime() time.Time {
	return ti.t
}

func NewUnionHttpFs(boxes ...PluginBox) *UnionHttpFs {

	var packrs []packr.Box
	var allRoots []string
	// Build index.json
	for _, b := range boxes {
		packrs = append(packrs, b.Box)
		allRoots = append(allRoots, b.Exposes...)
		if b.ExposeFunc != nil {
			allRoots = append(allRoots, b.ExposeFunc()...)
		}
	}
	ufs := &UnionHttpFs{
		boxes:     packrs,
		indexFile: NewIndexFile(allRoots),
	}

	if common.BuildRevision != "dev" && common.BuildStamp != "" {
		if t, e := time.Parse("2006-01-02T15:04:05", common.BuildStamp); e == nil {
			ufs.useTime = true
			ufs.time = t
		}
	}
	if ufs.useTime {
		ufs.indexFile = NewIndexFile(allRoots, ufs.time)
	} else {
		ufs.indexFile = NewIndexFile(allRoots)
	}

	return ufs
}

func (p *UnionHttpFs) Open(name string) (http.File, error) {

	safeName := strings.TrimLeft(name, "/")
	if safeName == "index.json" {
		return p.indexFile, nil
	}
	for _, b := range p.boxes {
		if o, e := b.Open(safeName); e == nil {
			if p.useTime {
				return newTimedFile(o, p.time), nil
			} else {
				return o, nil
			}
		}
	}
	return nil, os.ErrNotExist

}

func NewIndexFile(rootList []string, times ...time.Time) http.File {
	jsonData, _ := json.Marshal(rootList)
	t := time.Now()
	if len(times) > 0 {
		t = times[0]
	}
	return &IndexFile{
		data: string(jsonData),
		info: fileInfo{
			Path:     "index.json",
			Contents: jsonData,
			isDir:    false,
			modTime:  t,
			size:     int64(len(string(jsonData))),
		},
	}
}

type IndexFile struct {
	data   string
	info   fileInfo
	cursor int64
}

func (i *IndexFile) Close() error {
	i.cursor = 0
	return nil
}
func (i *IndexFile) Read(p []byte) (n int, err error) {
	//fmt.Println("Reading ", len(p), "bytes", i.cursor, len(i.data))
	data := i.data
	if i.cursor >= int64(len(data)) {
		return 0, io.EOF
	}
	if i.cursor > 0 {
		data = i.data[i.cursor:]
	}
	if len(data) > len(p) {
		data = data[0:len(p)]
	}
	//fmt.Println("Returning", string(data))
	b, e := strings.NewReader(data).Read(p)
	i.cursor += int64(math.Min(float64(len(data)), float64(len(p))))
	return b, e
}
func (i *IndexFile) Seek(offset int64, whence int) (int64, error) {
	return strings.NewReader(i.data).Seek(offset, whence)
}
func (i *IndexFile) Readdir(count int) ([]os.FileInfo, error) {
	return []os.FileInfo{i.info}, nil
}
func (i *IndexFile) Stat() (os.FileInfo, error) {
	return i.info, nil
}

type fileInfo struct {
	Path     string
	Contents []byte
	size     int64
	modTime  time.Time
	isDir    bool
}

func (f fileInfo) Name() string {
	return f.Path
}

func (f fileInfo) Size() int64 {
	return f.size
}

func (f fileInfo) Mode() os.FileMode {
	return 0444
}

func (f fileInfo) ModTime() time.Time {
	return f.modTime
}

func (f fileInfo) IsDir() bool {
	return f.isDir
}

func (f fileInfo) Sys() interface{} {
	return nil
}
