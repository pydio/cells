package posix

import (
	"fmt"
	"io/fs"
	"os"
	"path"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/proto/tree"
)

var _ fs.FileInfo = &FileInfo{}

// NewFileInfo wraps a tree.N as posix FileInfo
func NewFileInfo(n tree.N) *FileInfo {
	return &FileInfo{N: n}
}

// FileInfo wraps a tree.Node as a posix os.FileInfo
type FileInfo struct {
	tree.N
}

// Name returns the basename of the current file
func (f *FileInfo) Name() string {
	if f.GetPath() != "" {
		return path.Base(f.GetPath())
	}
	if n, ok := f.N.(*tree.Node); ok {
		return n.GetStringMeta(common.MetaNamespaceNodeName)
	}
	return ""
}

// Size returns the node.GetSize() value
func (f *FileInfo) Size() int64 {
	return f.N.GetSize()
}

// Mode computes an os.FileMode based on the node.Type value
func (f *FileInfo) Mode() (mode os.FileMode) {
	m := f.GetMode()
	if f.GetType() == tree.NodeType_COLLECTION {
		if m == 0 {
			mode = os.FileMode(0755) | os.ModeDir
		} else {
			mode = os.FileMode(m) | os.ModeDir
		}
	} else {
		if m == 0 {
			mode = os.FileMode(0644)
		} else {
			mode = os.FileMode(m)
		}
	}
	return
}

// ModTime returns a time.Time from the node timestamp
func (f *FileInfo) ModTime() time.Time {
	return time.Unix(f.GetMTime(), 0)
}

// IsDir returns the opposite of node.IsLeaf()
func (f *FileInfo) IsDir() bool {
	return !f.IsLeaf()
}

// Sys returns the underlying *tree.Node
func (f *FileInfo) Sys() interface{} {
	return f.N
}

// String implements Stringer for the current FileInfo
func (f *FileInfo) String() string {
	return f.Name() + "- Size:" + fmt.Sprintf("%v", f.Size()) + "- Mode:" + f.Mode().String()
}
