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
	"context"
	"crypto/sha256"
	"fmt"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"golang.org/x/net/webdav"
	"golang.org/x/text/unicode/norm"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/posix"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
)

// FileSystem is the pydio specific implementation of the generic webdav.FileSystem interface
// It adds among others a reference to the Router and a mutex
type FileSystem struct {
	mu     *sync.Mutex
	Debug  bool
	Router nodes.Handler
}

func (fs *FileSystem) Mkdir(ctx context.Context, name string, perm os.FileMode) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	log.Logger(ctx).Debug("FileSystem.Mkdir", zap.String("name", name))

	if strings.HasPrefix(path.Base(name), ".") {
		return serviceerrors.Forbidden("DAV", "Cannot create hidden folders")
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
	// Stat parent
	if _, err = fs.stat(ctx, path.Dir(strings.TrimSuffix(name, "/"))); err != nil {
		log.Logger(ctx).Error("FileSystem.Mkdir check parent "+path.Dir(name), zap.Error(err))
		return os.ErrNotExist
	}
	_, err = fs.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
		Path: name,
		Mode: int32(os.ModePerm & os.ModeDir),
		Type: tree.NodeType_COLLECTION,
	}})
	return err
}

// OpenFile is called before a put or a simple get to retrieve a given file
func (fs *FileSystem) OpenFile(ctx context.Context, name string, flag int, perm os.FileMode) (webdav.File, error) {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	log.Logger(ctx).Debug("FileSystem.OpenFile", zap.String("name", name), zap.Any("create", flag&os.O_CREATE))

	var err error
	if name, err = clearName(name); err != nil {
		return nil, err
	}
	if strings.HasPrefix(path.Base(name), "._") {
		return nil, serviceerrors.Forbidden("DAV", "Server does not support MacOS hidden files")
	}

	var node *tree.Node
	var onErrorCallback func() error

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
			base := path.Base(name)
			if strings.HasPrefix(base, ".") && base != ".DS_Store" { // do not authorize hidden files
				return nil, os.ErrPermission
			}
			createNodeResponse, createErr := fs.Router.CreateNode(ctx, &tree.CreateNodeRequest{Node: &tree.Node{
				Path:  name,
				Mode:  0777,
				Type:  tree.NodeType_LEAF,
				MTime: time.Now().Unix(),
				Etag:  common.NodeFlagEtagTemporary,
			}})
			if createErr != nil {
				return &File{}, createErr
			}
			node = createNodeResponse.Node
			c := node.Clone()
			onErrorCallback = func() error {
				log.Logger(ctx).Info("-- DELETING TEMPORARY NODE", c.Zap())
				_, e := fs.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: c})
				return e
			}
		}
	} else { // Do not create when file does not exist
		readResp, err := fs.Router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: name}})
		if err == nil {
			node = readResp.Node
		} else {
			return nil, os.ErrNotExist
		}
	}

	return &File{
		fs:                  fs,
		node:                node,
		name:                name,
		off:                 0,
		children:            nil,
		ctx:                 ctx,
		createErrorCallback: onErrorCallback,
	}, nil
}

// RemoveAll deletes all resources starting at the given path
func (fs *FileSystem) RemoveAll(ctx context.Context, name string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	log.Logger(ctx).Debug("FileSystem.RemoveAll", zap.String("name", name))

	return fs.removeAll(ctx, name)
}

// Rename updates underlying node name
func (fs *FileSystem) Rename(ctx context.Context, oldName, newName string) error {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	log.Logger(ctx).Info("FileSystem.Rename", zap.String("from", oldName), zap.String("to", newName))

	var err error
	if oldName, err = clearName(oldName); err != nil {
		return err
	}
	if newName, err = clearName(newName); err != nil {
		return err
	}

	of, err := fs.stat(ctx, oldName)
	if err != nil {
		return os.ErrNotExist
	}

	if of.IsDir() && !strings.HasSuffix(oldName, "/") {
		//oldName += "/"
		newName += "/"
	}

	_, err = fs.stat(ctx, newName)
	if err == nil {
		return os.ErrExist
	}

	//_, err = fs.db.Exec(`update filesystem set name = ? where name = ?`, newName, oldName)
	fromNode := of.Sys().(*tree.Node)
	_, err = fs.Router.UpdateNode(ctx, &tree.UpdateNodeRequest{From: fromNode, To: &tree.Node{Path: newName}})
	if err != nil {
		log.Logger(ctx).Info("FileSystem.Rename", fromNode.Zap(), zap.String("to", newName), zap.Error(err))
	}
	return err
}

// Stat creates an os.FileInfo from the internal router.ReadNode() method
func (fs *FileSystem) Stat(ctx context.Context, name string) (os.FileInfo, error) {
	fs.mu.Lock()
	defer fs.mu.Unlock()

	if strings.HasPrefix(path.Base(name), "._") {
		return nil, serviceerrors.Forbidden("DAV", "Cannot stat hidden resources starting with ._")
	}

	fi, err := fs.stat(ctx, name)
	if err == nil {
		log.Logger(ctx).Debug("FileSystem.Stat", zap.String("name", name), zap.String("fi", (fi.(fmt.Stringer)).String()), zap.Error(err))
	} else {
		log.Logger(ctx).Debug("FileSystem.Stat - Not Found", zap.String("name", name))
		err = os.ErrNotExist
	}
	return fi, err
}

func (fs *FileSystem) removeAll(ctx context.Context, name string) error {
	var err error
	if name, err = clearName(name); err != nil {
		return err
	}
	var fi os.FileInfo
	fi, err = fs.stat(ctx, name)
	if err != nil {
		return err
	}
	node := fi.Sys().(*tree.Node)
	_, err = fs.Router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: node.Clone()})
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
		if serviceerrors.FromError(err).Code != 404 && !strings.Contains(err.Error(), " NotFound ") {
			log.Logger(ctx).Error("ReadNode Error", zap.Error(err))
		}
		return nil, err
	}

	fi := posix.NewFileInfo(response.GetNode())
	return fi, nil
}

/* LOCAL HELPERS */

// sum256 calculates sha256 sum for an input byte array.
func sum256(data []byte) []byte {
	hash := sha256.New()
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
	name = string(norm.NFC.Bytes([]byte(name)))
	return name, nil
}
