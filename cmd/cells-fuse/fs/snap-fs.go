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
	"github.com/schollz/progressbar/v3"

	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v4/common/utils/uuid"
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

	folderLoaded bool
	folderFS     *SnapFS
}

func (c *snapNode) Readdir(ctx context.Context) (fs.DirStream, syscall.Errno) {
	if !c.folderLoaded {
		log.Println("Loading children for ", c.Node.GetPath())
		c.folderFS.recursiveCreate(ctx, c.Inode, c.Node, false)
		c.folderLoaded = true
	}
	var r []fuse.DirEntry
	for k, child := range c.Inode.Children() {
		d := fuse.DirEntry{
			Name: k,
			Ino:  child.StableAttr().Ino,
			Mode: child.Mode(),
		}
		r = append(r, d)
	}
	return fs.NewListDirStream(r), 0
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

func NewSnapFS(snap *snapshot.BoltSnapshot, fileProvider FileNodeProvider, total int, generate bool) *SnapFS {
	return &SnapFS{
		snapshot:     snap,
		fileProvider: fileProvider,
		total:        total,
		generate:     generate,
	}
}

type SnapFS struct {
	fs.Inode
	snapshot     *snapshot.BoltSnapshot
	fileProvider FileNodeProvider
	total        int
	bar          *progressbar.ProgressBar
	generate     bool
}

func (r *SnapFS) ClearCache() {
	for _, e := range cacheEntries {
		_ = os.Remove(e)
	}
}

func (r *SnapFS) newFolder(inode uint64, treeNode *tree.Node, sfs *SnapFS, loaded bool) fs.InodeEmbedder {
	return &snapNode{
		Inode:        &fs.Inode{},
		Node:         treeNode,
		ino:          inode,
		folderFS:     sfs,
		folderLoaded: loaded,
	}
}

func (r *SnapFS) recursiveCreate(ctx context.Context, parent *fs.Inode, snapFolder *tree.Node, recursive bool) error {
	return r.snapshot.Walk(ctx, func(pa string, node *tree.Node, err error) error {
		base := path.Base(pa)
		if node.IsLeaf() {
			// Add File N
			//log.Println("Adding File", parent.Path(r.EmbeddedInode()), base)
			var emb fs.InodeEmbedder
			if r.generate {
				content := ""
				if node.HasMetaKey("captured_content") {
					content = node.GetStringMeta("captured_content")
				} else {
					content = uuid.New() + uuid.New()
				}
				emb = &fs.MemRegularFile{
					Data: []byte(content),
					Attr: fuse.Attr{Mode: 0666},
				}
			} else {
				emb = r.fileProvider(inoCount, node)
			}

			inode := parent.NewPersistentInode(ctx, emb, fs.StableAttr{Ino: inoCount})
			inoCount++
			if r.bar != nil {
				_ = r.bar.Set64(int64(inoCount))
			}
			parent.AddChild(base, inode, false)
		} else {
			ch := parent.NewPersistentInode(ctx, r.newFolder(inoCount, node, r, recursive), fs.StableAttr{Mode: syscall.S_IFDIR, Ino: inoCount})
			inoCount++
			if r.bar != nil {
				_ = r.bar.Set64(int64(inoCount))
			}
			// Add Folder N
			//log.Println("Adding Folder", base)
			parent.AddChild(base, ch, true)
			if recursive {
				if er := r.recursiveCreate(ctx, ch, node, true); er != nil {
					return er
				}
			}
		}
		return nil
	}, snapFolder.GetPath(), false)
}

func (r *SnapFS) OnAdd(ctx context.Context) {

	root, _ := r.snapshot.LoadNode(ctx, "/", false)
	if r.total > 20000 {
		log.Printf("Snapshot contains %d nodes, using dynamic loading for each folder\n", r.total)
		_ = r.recursiveCreate(ctx, r.EmbeddedInode(), root, false)
	} else {
		log.Printf("Snapshot contains %d nodes, loading whole tree in memory\n", r.total)
		r.bar = progressbar.Default(int64(r.total))
		_ = r.recursiveCreate(ctx, r.EmbeddedInode(), root, true)
	}
	log.Printf("Loaded %d nodes, now serving...", inoCount)

}

func (r *SnapFS) Getattr(_ context.Context, _ fs.FileHandle, out *fuse.AttrOut) syscall.Errno {
	out.Mode = syscall.S_IFDIR
	out.Mtime = uint64(time.Now().Unix())
	return 0
}

var _ = (fs.NodeGetattrer)((*SnapFS)(nil))

var _ = (fs.NodeOnAdder)((*SnapFS)(nil))
