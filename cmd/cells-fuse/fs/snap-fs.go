/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package fs

import (
	"context"
	"log"
	"os"
	"path"
	"syscall"
	"time"

	"github.com/hanwen/go-fuse/v2/fs"
	"github.com/hanwen/go-fuse/v2/fuse"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/endpoints/snapshot"
)

var (
	inoCount     uint64
	cacheEntries []string
)

type FileNodeProvider func(inode uint64, treeNode *tree.Node) fs.InodeEmbedder

type snapNode struct {
	*fs.Inode
	*tree.Node
	ino uint64
}

func (c *snapNode) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	if c.Node.IsLeaf() {
		out.Mode = 0644
	} else {
		out.Mode = syscall.S_IFDIR
	}
	out.Ino = c.ino
	out.Size = uint64(c.Node.Size)
	out.Mtime = uint64(c.Node.MTime)
	return 0
}

func NewSnapFS(snap *snapshot.BoltSnapshot, fileProvider FileNodeProvider) *SnapFS {
	return &SnapFS{
		snapshot:     snap,
		fileProvider: fileProvider,
	}
}

type SnapFS struct {
	fs.Inode
	snapshot     *snapshot.BoltSnapshot
	fileProvider FileNodeProvider
}

func (r *SnapFS) ClearCache() {
	for _, e := range cacheEntries {
		_ = os.Remove(e)
	}
}

func (r *SnapFS) newFolder(inode uint64, treeNode *tree.Node) fs.InodeEmbedder {
	return &snapNode{
		Inode: &fs.Inode{},
		Node:  treeNode,
		ino:   inode,
	}
}

func (r *SnapFS) recursiveCreate(ctx context.Context, parent *fs.Inode, snapFolder *tree.Node) error {
	return r.snapshot.Walk(ctx, func(pa string, node *tree.Node, err error) error {
		base := path.Base(pa)
		if node.IsLeaf() {
			// Add File Node
			//log.Println("Adding File", parent.Path(r.EmbeddedInode()), base)
			inode := parent.NewPersistentInode(ctx, r.fileProvider(inoCount, node), fs.StableAttr{Ino: inoCount})
			inoCount++
			parent.AddChild(base, inode, false)
		} else {
			ch := parent.NewPersistentInode(ctx, r.newFolder(inoCount, node), fs.StableAttr{Mode: syscall.S_IFDIR, Ino: inoCount})

			inoCount++
			// Add Folder Node
			//log.Println("Adding Folder", base)
			parent.AddChild(base, ch, true)
			if er := r.recursiveCreate(ctx, ch, node); er != nil {
				return er
			}
		}
		return nil
	}, snapFolder.GetPath(), false)
}

func (r *SnapFS) OnAdd(ctx context.Context) {

	root, _ := r.snapshot.LoadNode(ctx, "/", false)
	_ = r.recursiveCreate(ctx, r.EmbeddedInode(), root)
	log.Printf("Loaded %d nodes, now closing snapshot and serving...", inoCount)
	//r.snapshot.Close(true)

}

func (r *SnapFS) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR
	out.Mtime = uint64(time.Now().Unix())
	return 0
}

var _ = (fs.NodeGetattrer)((*SnapFS)(nil))

var _ = (fs.NodeOnAdder)((*SnapFS)(nil))
