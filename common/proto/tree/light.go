package tree

import (
	"fmt"
	"strconv"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/reflect/protoreflect"

	"github.com/pydio/cells/v5/common"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

// N is the extracted interface from Node
type N interface {
	INode

	As(interface{}) bool
	AsProto() *Node

	IsLeaf() bool

	RenewUuidIfEmpty(force bool)

	SetChildrenSize(uint64)
	SetChildrenFiles(uint64)
	SetChildrenFolders(uint64)
	GetChildrenSize() (uint64, bool)
	GetChildrenFiles() (uint64, bool)
	GetChildrenFolders() (uint64, bool)
	SetRawMetadata(map[string]string)
	ListRawMetadata() map[string]string
	GetStringMeta(namespace string) string

	MarshalLogObject(encoder zapcore.ObjectEncoder) error
	Zap(key ...string) zapcore.Field
	ZapPath() zapcore.Field
	ZapUuid() zapcore.Field
}

// lightNode is a memory optimized-struct implementing the N interface.
// Beware of not reordering fields as they are memory-aligned
//
//	type lightNode struct {
//	 uuid               string             ■ ■ ■ ■ ■ ■ ■ ■
//	                                       ■ ■ ■ ■ ■ ■ ■ ■
//	 path               string             ■ ■ ■ ■ ■ ■ ■ ■
//	                                       ■ ■ ■ ■ ■ ■ ■ ■
//	 size               uint64             ■ ■ ■ ■ ■ ■ ■ ■
//	 mtime              uint64             ■ ■ ■ ■ ■ ■ ■ ■
//	 etag               string             ■ ■ ■ ■ ■ ■ ■ ■
//	                                       ■ ■ ■ ■ ■ ■ ■ ■
//	 rawMeta            map[string]string  ■ ■ ■ ■ ■ ■ ■ ■
//	 childrenSize       uint64             ■ ■ ■ ■ ■ ■ ■ ■
//	 childrenFiles      uint64             ■ ■ ■ ■ ■ ■ ■ ■
//	 childrenFolders    uint64             ■ ■ ■ ■ ■ ■ ■ ■
//	 mode               uint32             ■ ■ ■ ■
//	 nodeType           tree.NodeType              ■ ■ ■ ■
//	 leaf               bool               ■
//	 childrenSizeSet    bool                 ■
//	 childrenFilesSet   bool                   ■
//	 childrenFoldersSet bool                     ■ □ □ □ □
//	}
type lightNode struct {
	uuid    string
	path    string
	size    uint64
	mtime   uint64
	etag    string
	rawMeta map[string]string

	childrenSize    uint64
	childrenFiles   uint64
	childrenFolders uint64

	mode               uint32
	nodeType           NodeType
	childrenSizeSet    bool
	childrenFilesSet   bool
	childrenFoldersSet bool
}

func (l *lightNode) GetStringMeta(namespace string) (value string) {
	if l.rawMeta == nil {
		return
	}
	ns, ok := l.rawMeta[namespace]
	if !ok {
		return
	}
	_ = json.Unmarshal([]byte(ns), &value)
	return value
}

// LightNode create a lightNode
func LightNode(nodeType NodeType, uuid, path, eTag string, size, mTime int64, mode int32) N {
	return &lightNode{
		nodeType: nodeType,
		uuid:     uuid,
		path:     path,
		etag:     eTag,
		size:     uint64(size),
		mtime:    uint64(mTime),
		mode:     uint32(mode),
	}
}

func LightNodeFromProto(n N) N {
	ln := &lightNode{
		uuid:     n.GetUuid(),
		path:     n.GetPath(),
		size:     uint64(n.GetSize()),
		mtime:    uint64(n.GetMTime()),
		mode:     uint32(n.GetMode()),
		etag:     n.GetEtag(),
		nodeType: n.GetType(),
	}
	if metaStore := n.GetMetaStore(); metaStore != nil {
		var e error
		for k, v := range metaStore {
			if k == common.MetaNamespaceNodeName || k == common.MetaNamespaceDatasourceName {
				continue
			}
			if k == common.MetaRecursiveChildrenSize {
				if ln.childrenSize, e = strconv.ParseUint(v, 10, 64); e == nil {
					ln.childrenSizeSet = true
				}
			} else if k == common.MetaRecursiveChildrenFiles {
				if ln.childrenFiles, e = strconv.ParseUint(v, 10, 64); e == nil {
					ln.childrenFilesSet = true
				}
			} else if k == common.MetaRecursiveChildrenFolders {
				if ln.childrenFolders, e = strconv.ParseUint(v, 10, 64); e == nil {
					ln.childrenFoldersSet = true
				}
			} else {
				if ln.rawMeta == nil {
					ln.rawMeta = make(map[string]string)
				}
				ln.rawMeta[k] = v
			}
		}
	}
	/*
		if len(ln.rawMeta) > 0 {
			fmt.Println("Raw meta not empty", ln.rawMeta)
		}
	*/
	return ln
}

func (l *lightNode) GetUuid() string {
	return l.uuid
}

func (l *lightNode) GetPath() string {
	return l.path
}

func (l *lightNode) GetType() NodeType {
	return l.nodeType
}

func (l *lightNode) GetSize() int64 {
	return int64(l.size)
}

func (l *lightNode) GetMTime() int64 {
	return int64(l.mtime)
}

func (l *lightNode) GetMode() int32 {
	return int32(l.mode)
}

func (l *lightNode) GetModeString() string {
	return strconv.Itoa(int(l.mode))
}

func (l *lightNode) GetEtag() string {
	return l.etag
}

func (l *lightNode) IsLeaf() bool {
	return l.nodeType == NodeType_LEAF
}

func (l *lightNode) UpdatePath(p string) {
	l.path = p
}

func (l *lightNode) UpdateUuid(u string) {
	l.uuid = u
}

func (l *lightNode) UpdateEtag(e string) {
	l.etag = e
}

func (l *lightNode) UpdateSize(s int64) {
	l.size = uint64(s)
}

func (l *lightNode) UpdateMTime(s int64) {
	l.mtime = uint64(s)
}

func (l *lightNode) UpdateMode(s int32) {
	l.mode = uint32(s)
}

func (l *lightNode) SetType(t NodeType) {
	l.nodeType = t
}

func (l *lightNode) RenewUuidIfEmpty(force bool) {
	if l.uuid == "" || force {
		l.uuid = uuid.New()
	}
}

func (l *lightNode) SetChildrenSize(u uint64) {
	l.childrenSize = u
	l.childrenSizeSet = true
}

func (l *lightNode) SetChildrenFiles(u uint64) {
	l.childrenFiles = u
	l.childrenFilesSet = true
}

func (l *lightNode) SetChildrenFolders(u uint64) {
	l.childrenFolders = u
	l.childrenFoldersSet = true
}

func (l *lightNode) GetChildrenSize() (uint64, bool) {
	return l.childrenSize, l.childrenSizeSet
}

func (l *lightNode) GetChildrenFiles() (uint64, bool) {
	return l.childrenFiles, l.childrenFilesSet
}

func (l *lightNode) GetChildrenFolders() (uint64, bool) {
	return l.childrenFolders, l.childrenFoldersSet
}

func (l *lightNode) SetRawMetadata(m map[string]string) {
	if l.rawMeta == nil {
		l.rawMeta = make(map[string]string, len(m))
	}
	for k, v := range m {
		l.rawMeta[k] = v
	}
}

func (l *lightNode) ListRawMetadata() map[string]string {
	return l.rawMeta
}

func (l *lightNode) Zap(key ...string) zapcore.Field {
	if len(key) > 0 {
		return zap.Object(key[0], l)
	} else {
		return zap.Object(common.KeyNode, l)
	}
}

func (l *lightNode) ZapPath() zapcore.Field {
	return zap.String("path", l.path)
}

func (l *lightNode) ZapUuid() zapcore.Field {
	return zap.String("uuid", l.uuid)
}

func (l *lightNode) AsProto() *Node {
	n := &Node{}
	l.As(n)
	return n
}

func (l *lightNode) As(out any) bool {
	if v, ok := out.(*Node); ok {
		v.Uuid = l.uuid
		v.Path = l.path
		v.Type = l.nodeType
		v.Size = int64(l.size)
		v.MTime = int64(l.mtime)
		v.Mode = int32(l.mode)
		v.Etag = l.etag
		v.MetaStore = l.rawMeta

		if l.childrenFilesSet || l.childrenFoldersSet || l.childrenSizeSet {
			if v.MetaStore == nil {
				v.MetaStore = make(map[string]string)
			}
			if l.childrenSizeSet {
				v.MetaStore[common.MetaRecursiveChildrenSize] = fmt.Sprintf("%d", l.childrenSize)
			}
			if l.childrenFilesSet {
				v.MetaStore[common.MetaRecursiveChildrenFiles] = fmt.Sprintf("%d", l.childrenFiles)
			}
			if l.childrenFoldersSet {
				v.MetaStore[common.MetaRecursiveChildrenFolders] = fmt.Sprintf("%d", l.childrenFolders)
			}
		}

		return true
	}
	return false
}

func (l *lightNode) ProtoReflect() protoreflect.Message {
	var tn *Node
	if l.As(&tn) {
		return tn.ProtoReflect()
	}

	return nil
}

// MarshalLogObject implements custom marshalling for logs
func (l *lightNode) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if l == nil {
		return nil
	}
	if l.uuid != "" {
		encoder.AddString("Uuid", l.uuid)
	}
	if l.path != "" {
		encoder.AddString("Path", l.path)
	}
	if l.etag != "" {
		encoder.AddString("Etag", l.etag)
	}
	if l.mtime > 0 {
		encoder.AddTime("MTime", time.Unix(int64(l.mtime), 0))
	}
	if l.size > 0 {
		encoder.AddUint64("Size", l.size)
	}
	if l.rawMeta != nil {
		_ = encoder.AddReflected("MetaStore", l.rawMeta)
	}
	return nil
}

func (l *lightNode) GetCommits() []*ChangeLog {
	// deprecated
	return nil
}

func (l *lightNode) GetMetaStore() map[string]string {
	var metaStore = make(map[string]string)
	if l.childrenFilesSet || l.childrenFoldersSet || l.childrenSizeSet {
		if l.childrenSizeSet {
			metaStore[common.MetaRecursiveChildrenSize] = fmt.Sprintf("%d", l.childrenSize)
		}
		if l.childrenFilesSet {
			metaStore[common.MetaRecursiveChildrenFiles] = fmt.Sprintf("%d", l.childrenFiles)
		}
		if l.childrenFoldersSet {
			metaStore[common.MetaRecursiveChildrenFolders] = fmt.Sprintf("%d", l.childrenFolders)
		}
	}

	return metaStore
}

func (l *lightNode) GetAppearsIn() []*WorkspaceRelativePath {
	return []*WorkspaceRelativePath{}
}

func (l *lightNode) SetUuid(s string) {
	l.uuid = s
}

func (l *lightNode) SetPath(s string) {
	l.path = s
}

func (l *lightNode) SetSize(i int64) {
	l.size = uint64(i)
}

func (l *lightNode) SetMTime(i int64) {
	l.mtime = uint64(i)
}

func (l *lightNode) SetMode(i int32) {
	l.mode = uint32(i)
}

func (l *lightNode) SetModeString(m string) {
	im, _ := strconv.Atoi(m)
	l.mode = uint32(im)
}

func (l *lightNode) SetEtag(s string) {
	l.etag = s
}

func (l *lightNode) SetCommits(logs []*ChangeLog) {
	// deprecated
}

func (l *lightNode) SetMetaStore(m map[string]string) {
	if childrenSizeStr, ok := m[common.MetaRecursiveChildrenSize]; ok {
		childrenSize, err := strconv.ParseUint(childrenSizeStr, 10, 64)
		if err != nil {
			l.childrenSize = childrenSize
		}
	}

	if childrenFilesStr, ok := m[common.MetaRecursiveChildrenFiles]; ok {
		childrenFiles, err := strconv.ParseUint(childrenFilesStr, 10, 64)
		if err != nil {
			l.childrenFiles = childrenFiles
		}
	}

	if childrenFoldersStr, ok := m[common.MetaRecursiveChildrenFolders]; ok {
		childrenFolders, err := strconv.ParseUint(childrenFoldersStr, 10, 64)
		if err != nil {
			l.childrenFolders = childrenFolders
			l.childrenFoldersSet = true
		}
	}
}

func (l *lightNode) SetAppearsIn(paths []*WorkspaceRelativePath) {
}
