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

package dav

import (
	"bytes"
	"context"
	"crypto/md5"
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"
	"golang.org/x/net/webdav"

	minio "github.com/pydio/minio-go"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
)

// File System is the pydio specific implementation of the generic webdav.FileSystem interface
// It adds among others a reference to the Router and a mutex
type FileSystem struct {
	mu     sync.Mutex
	Debug  bool
	Router *views.Router
}

type FileInfo struct {
	node *tree.Node
	ctx  context.Context
}

type File struct {
	fs   *FileSystem
	node *tree.Node
	ctx  context.Context
	// wrappedCtx context.Context
	name     string
	off      int64
	children []os.FileInfo
	// multipartId string
}

func (fi *FileInfo) Name() string {
	if fi.node.Path != "" {
		return path.Base(fi.node.Path)
	} else {
		return fi.node.GetStringMeta("name")
	}
}

func (fi *FileInfo) Size() int64 { return fi.node.Size }

func (fi *FileInfo) Mode() os.FileMode {
	mode := os.FileMode(fi.node.GetMode())
	if fi.node.Type == tree.NodeType_COLLECTION {
		mode = mode | os.ModeDir
	}
	return mode
}

func (fi *FileInfo) ModTime() time.Time { return fi.node.GetModTime() }

func (fi *FileInfo) IsDir() bool { return !fi.node.IsLeaf() }

func (fi *FileInfo) Sys() interface{} { return nil }

func (fi *FileInfo) String() string {
	return fi.Name() + "- Size:" + fmt.Sprintf("%v", fi.Size()) + "- Mode:" + fi.Mode().String()
}

func (fs *FileSystem) Mkdir(ctx context.Context, name string, perm os.FileMode) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	if fs.Debug {
		log.Logger(ctx).Debug("FileSystem.Mkdir", zap.String("name", name))
	}

	if strings.HasPrefix(path.Base(name), ".") {
		return errors.Forbidden("DAV", "Cannot create hidden files")
	}

	if !strings.HasSuffix(name, "/") {
		name += "/"
	}

	var err error
	if name, err = clearName(name); err != nil {
		return err
	}

	_, err = fs.stat(ctx, name)
	if err == nil {
		return os.ErrExist
	}

	base := ""
	for _, elem := range strings.Split(strings.Trim(name, "/"), "/") {
		base += "/" + elem
		_, err := fs.stat(ctx, base)
		if err == nil {
			continue
		}
		_, err = fs.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
			Path: base,
			Mode: int32(perm.Perm() | os.ModeDir),
			Type: tree.NodeType_COLLECTION,
		}})
		if err != nil {
			return err
		}
	}
	return nil
}

// OpenFile is called before a put or a simple get to retrieve a given file
func (fs *FileSystem) OpenFile(ctx context.Context, name string, flag int, perm os.FileMode) (webdav.File, error) {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	if fs.Debug {
		log.Logger(ctx).Debug("FileSystem.OpenFile", zap.String("name", name))
	}

	var err error
	if name, err = clearName(name); err != nil {
		return nil, err
	}

	var node *tree.Node

	//  O_CREATE: create a new file if none exists.
	if flag&os.O_CREATE != 0 {
		// file should not have / suffix
		if strings.HasSuffix(name, "/") {
			return nil, os.ErrInvalid
		}
		// parent directory should already exist
		dir, _ := path.Split(name)
		_, err := fs.stat(ctx, dir)
		if err != nil {
			return nil, os.ErrInvalid
		}

		readResp, err := fs.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: name}})
		if err == nil {
			if flag&os.O_EXCL != 0 { // O_EXCL flag: file must not exist
				return nil, os.ErrExist
			}
			node = readResp.Node
		} else {
			// new file
			if strings.HasPrefix(path.Base(name), ".") { // do not authorize hidden files
				return nil, os.ErrPermission
			}
			createNodeResponse, createErr := fs.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
				Path:  name,
				Mode:  0777,
				Type:  tree.NodeType_LEAF,
				MTime: time.Now().Unix(),
				Etag:  common.NODE_FLAG_ETAG_TEMPORARY,
			}})
			if createErr != nil {
				return &File{}, createErr
			}
			node = createNodeResponse.Node
		}
	} else { // Do not create when file does not exist
		readResp, err := fs.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: name}})
		if err == nil {
			node = readResp.Node
		} else {
			return nil, os.ErrNotExist
		}
	}

	return &File{fs: fs, node: node, name: name, off: 0, children: nil, ctx: ctx}, nil
}

// ReadFrom bypasses the usual Reader interface to implement multipart uploads to the minio server,
// rather than using the default Write method that is called by webdav via io.Copy.
// It enables among others the definition of a part size that is more appropriate than the default 32K used by io.COPY
func (f *File) ReadFrom(r io.Reader) (n int64, err error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	inPath := f.node.Path

	// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode B4 mp create", zap.Any("f.node", f.node), zap.Any("f.ctx", f.ctx))

	// Initialize the multipart upload
	multipartId, err := f.fs.Router.MultipartCreate(f.ctx, f.node, &views.MultipartRequestData{})
	if err != nil {
		return 0, err
	}
	// FIXME reset the path to initial value (end user / external world point of view )
	f.node.Path = inPath

	// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode AFTER mp create", zap.Any("f.node", f.node), zap.Any("f.ctx", f.ctx))

	if f.fs.Debug {
		log.Logger(f.ctx).Debug("READ FROM - starting effective dav parts upload for " + f.name + " with id " + multipartId)
	}

	partsInfo := make(map[int]minio.ObjectPart)

	// Write by part
	var written int64
	// Minimum size is 5 MB, trying to upload parts that are smaller will fail with EntityTooSmall error
	minSize := 5 * 1024 * 1024
	// TODO put this in a go routine
	for i := 1; ; i++ {
		nr := 0
		longBuf := make([]byte, 0, 8*1024*1024)

		// Manually insure that the blocks are longer than 5MB:
		// when the input buffer is empty, Read might returns before EOF; even if the array is not yet full.
		for ii := 0; nr < minSize; ii++ {
			shortBuf := make([]byte, 2*1024*1024)
			sr, er := r.Read(shortBuf)
			longBuf = append(longBuf[:nr], shortBuf[:sr]...)
			nr += sr
			if f.fs.Debug {
				log.Logger(f.ctx).Debug(fmt.Sprintf("#%d - Sizes:  sr: %d, shortbuf: %d, longBuf: %d", ii, nr, len(shortBuf), len(longBuf)))
			}

			if er != nil {
				log.Logger(f.ctx).Error("Read buffer exception ", zap.Error(er))
				err = er
				break
			}
		}

		if nr > 0 {
			reqData := views.PutRequestData{
				Size:              int64(nr), // int64(len(buf)),
				MultipartUploadID: multipartId,
				MultipartPartID:   i, // must be >= 1
				Md5Sum:            sumMD5(longBuf),
				Sha256Sum:         sum256(longBuf),
				// TODO:     Metadata map[string]string, EncryptionMaterial encrypt.Materials
			}

			// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode B4 mp put part", zap.Any("f.node", f.node), zap.Any("f.ctx", f.ctx))

			objPart, ew := f.fs.Router.MultipartPutObjectPart(f.ctx, f.node, multipartId, i, bytes.NewBuffer(longBuf), &reqData)
			// FIXME reset the path to initial value
			f.node.Path = inPath

			// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode AFTER mp put part", zap.Any("f.node", f.node), zap.Any("f.ctx", f.ctx))

			written += objPart.Size

			if ew != nil {
				log.Logger(f.ctx).Error("MultipartPutObjectPart exception ", zap.Error(ew))
				// we might want to retry ?
				err = ew
				break
			}

			if int64(nr) != objPart.Size {
				err = io.ErrShortWrite
				break
			}
			// Save successfully uploaded part metadata.
			partsInfo[i] = objPart
		}
		if err != nil {
			if err == io.EOF {
				err = nil
			}
			break
		}
	}

	if err != nil {
		log.Logger(f.ctx).Error("fail to write multiple part ", zap.Error(err))
		return written, err
	}

	// Complete multipart write
	completeParts := make([]minio.CompletePart, len(partsInfo))
	// Loop over total uploaded parts to save them in completeParts array before completing the multipart request.
	for j := 1; j <= len(partsInfo); j++ {
		part, ok := partsInfo[j]
		if !ok {
			return written, minio.ErrInvalidArgument(fmt.Sprintf("Missing part number %d", j))
		}
		completeParts[j-1] = minio.CompletePart{
			ETag:       part.ETag,
			PartNumber: part.PartNumber,
		}
	}

	if f.fs.Debug {
		log.Logger(f.ctx).Debug(fmt.Sprintf("Uploaded %d parts", len(partsInfo)), zap.Any("CompleteParts", completeParts))
	}

	// Will be useful when we use goroutines and channels
	// // Sort all completed parts.
	// sort.Sort(completedParts(complMultipartUpload.Parts))
	// if _, err = c.completeMultipartUpload(ctx, bucketName, objectName, uploadID, complMultipartUpload); err != nil {
	// 	return totalUploadedSize, err
	// }

	// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode B4 mp complete", zap.Any("f.node", f.node))
	objInfo, err := f.fs.Router.MultipartComplete(f.ctx, f.node, multipartId, completeParts)

	// FIXME reset the path to initial value
	f.node.Path = inPath

	// log.Logger(f.ctx).Error("READ FROM ##### CheckeNode B4 after complete", zap.Any("f.node", f.node))

	if err != nil {
		return written, err
	}

	if written != objInfo.Size {
		err = io.ErrShortWrite
		return written, err
	}

	log.Logger(f.ctx).Info(fmt.Sprintf("Multipart upload of %s (%d parts for a total of %d bytes)", f.name, len(partsInfo), written))
	return written, err
}

// Write is unused but left to respect Writer interface. This method is bypassed by io.Copy to use ReadFrom (see above)
func (f *File) Write(p []byte) (int, error) {
	return 0, errors.BadRequest("unauthorized method", "this method must not be called, rather use ReadFrom")
	// f.fs.mu.Lock()
	// defer f.fs.mu.Unlock()
	// if f.fs.Debug {
	// 	log.Logger(context.Background()).Debug("File.Write", zap.Any("file", f))
	// }

	// var wrappedCtx context.Context
	// var inputNode = &tree.Node{Path: f.name}

	// if f.wrappedCtx == nil {
	// 	er := f.fs.Router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {
	// 		var er1 error
	// 		wrappedCtx, er1 = inputFilter(f.ctx, inputNode, "in")
	// 		return er1
	// 	})
	// 	if er != nil {
	// 		log.Logger(context.Background()).Error("WrapCallback Error", zap.Error(er))
	// 		return 0, er
	// 	}
	// 	f.node = inputNode
	// 	f.wrappedCtx = wrappedCtx
	// }

	// read, err := f.fs.Router.GetExecutor().PutObject(f.wrappedCtx, f.node, bytes.NewBuffer(p), &views.PutRequestData{
	// 	Size: int64(len(p)),
	// })
	// if err != nil {
	// 	return 0, err
	// }
	// return int(read), err
}

func (fs *FileSystem) RemoveAll(ctx context.Context, name string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	if fs.Debug {
		log.Logger(ctx).Debug("FileSystem.RemoveAll", zap.String("name", name))
	}

	return fs.removeAll(ctx, name)
}

func (fs *FileSystem) Rename(ctx context.Context, oldName, newName string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	if fs.Debug {
		log.Logger(ctx).Debug("FileSystem.Rename", zap.String("from", oldName), zap.String("to", newName))
	}

	var err error
	if oldName, err = clearName(oldName); err != nil {
		return err
	}
	if newName, err = clearName(newName); err != nil {
		return err
	}

	of, err := fs.stat(ctx, oldName)
	if err != nil {
		return os.ErrExist
	}

	if of.IsDir() && !strings.HasSuffix(oldName, "/") {
		oldName += "/"
		newName += "/"
	}

	_, err = fs.stat(ctx, newName)
	if err == nil {
		return os.ErrExist
	}

	//_, err = fs.db.Exec(`update filesystem set name = ? where name = ?`, newName, oldName)
	fromNode := of.(*FileInfo).node
	_, err = fs.Router.UpdateNode(ctx, &tree.UpdateNodeRequest{From: fromNode, To: &tree.Node{Path: newName}})
	return err
}

func (fs *FileSystem) Stat(ctx context.Context, name string) (os.FileInfo, error) {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	fi, err := fs.stat(ctx, name)
	if fs.Debug && err == nil {
		log.Logger(ctx).Debug("FileSystem.Stat", zap.String("name", name), zap.String("fi", (fi.(*FileInfo)).String()), zap.Error(err))
	} else {
		log.Logger(ctx).Error("FileSystem.Stat - Not Found", zap.String("name", name))
	}
	return fi, err
}

func (f *File) Close() error {
	if f.fs.Debug {
		log.Logger(f.ctx).Debug("File.Close", zap.Any("file", f))
	}
	return nil
}

func (f *File) Read(p []byte) (int, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()
	if f.fs.Debug {
		log.Logger(f.ctx).Debug("File.Read", zap.Any("fileNode", f.node), zap.Int("size", len(p)))
	}

	reader, err := f.fs.Router.GetObject(f.ctx, f.node, &views.GetRequestData{StartOffset: f.off, Length: int64(len(p))})
	if err != nil {
		log.Logger(f.ctx).Error("Getting Reader on node", zap.Error(err))
		return 0, err
	}
	defer reader.Close()
	length, err := reader.Read(p)
	f.off += int64(length)
	if length == 0 {
		return 0, io.EOF
	}
	return length, err
}

func (f *File) Readdir(count int) ([]os.FileInfo, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	if f.fs.Debug {
		log.Logger(f.ctx).Debug("File.Readdir", zap.Any("file", f))
	}

	if f.children == nil {

		nodesClient, err := f.fs.Router.ListNodes(f.ctx, &tree.ListNodesRequest{Node: f.node})
		if err != nil {
			return nil, err
		}
		defer nodesClient.Close()

		f.children = []os.FileInfo{}
		for {

			resp, err := nodesClient.Recv()
			if resp == nil || err != nil {
				break
			}
			f.children = append(f.children, &FileInfo{node: resp.Node})
		}
	}

	old := f.off
	if old >= int64(len(f.children)) {
		if count > 0 {
			return nil, io.EOF
		}
		return nil, nil
	}
	if count > 0 {
		f.off += int64(count)
		if f.off > int64(len(f.children)) {
			f.off = int64(len(f.children))
		}
	} else {
		f.off = int64(len(f.children))
		old = 0
	}
	return f.children[old:f.off], nil
}

func (f *File) Seek(offset int64, whence int) (int64, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()
	if f.fs.Debug {
		log.Logger(f.ctx).Debug("File.Seek", zap.Any("file", f), zap.Int64("offset", offset))
	}

	var err error
	switch whence {
	case 0:
		f.off = 0
	case 2:
		if fi, err := f.fs.stat(f.ctx, f.name); err != nil {
			return 0, err
		} else {
			f.off = fi.Size()
		}
	}
	f.off += offset
	return f.off, err
}

func (f *File) Stat() (os.FileInfo, error) {
	f.fs.mu.Lock()
	defer f.fs.mu.Unlock()

	if f.fs.Debug {
		log.Logger(f.ctx).Debug("File.Stat", zap.Any("file", f))
	}

	return f.fs.stat(f.ctx, f.name)
}

// Local functions

// sum256 calculates sha256 sum for an input byte array.
func sum256(data []byte) []byte {
	hash := sha256.New()
	hash.Write(data)
	return hash.Sum(nil)
}

// sumMD5 calculates sumMD5 sum for an input byte array.
func sumMD5(data []byte) []byte {
	hash := md5.New()
	hash.Write(data)
	return hash.Sum(nil)
}

func clearName(name string) (string, error) {
	slashed := strings.HasSuffix(name, "/")
	name = path.Clean(name)
	if !strings.HasSuffix(name, "/") && slashed {
		name += "/"
	}
	if !strings.HasPrefix(name, "/") {
		return "", os.ErrInvalid
	}
	base := filepath.Base(name)
	if base == ".DS_Store" /*|| strings.HasPrefix(base, "._")*/ {
		return "", os.ErrNotExist
	}

	return name, nil
}

func (fs *FileSystem) removeAll(ctx context.Context, name string) error {
	var err error
	if name, err = clearName(name); err != nil {
		return err
	}

	_, err = fs.stat(ctx, name)
	if err != nil {
		return err
	}
	//node := fi.(*FileInfo).node
	_, err = fs.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: &tree.Node{Path: name}})
	return err
}

func (fs *FileSystem) stat(ctx context.Context, name string) (os.FileInfo, error) {
	var err error
	if name, err = clearName(name); err != nil {
		log.Logger(ctx).Error("Clean Error", zap.Error(err))
		return nil, err
	}

	response, err := fs.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{
		Path: name,
	}})
	if err != nil {
		log.Logger(ctx).Error("ReadNode Error", zap.Error(err))
		return nil, err
	}

	node := response.Node
	fi := &FileInfo{
		node: node,
	}
	return fi, nil
}
