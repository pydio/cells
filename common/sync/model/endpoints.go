package model

import (
	"context"
	"fmt"
	"io"
	"path"
	"time"

	"github.com/pydio/cells/common"

	"github.com/pydio/cells/common/proto/tree"
)

func AsPathSyncSource(endpoint Endpoint) (PathSyncSource, bool) {
	i, ok := endpoint.(PathSyncSource)
	return i, ok
}
func AsPathSyncTarget(endpoint Endpoint) (PathSyncTarget, bool) {
	i, ok := endpoint.(PathSyncTarget)
	return i, ok
}
func AsDataSyncSource(endpoint Endpoint) (DataSyncSource, bool) {
	i, ok := endpoint.(DataSyncSource)
	return i, ok
}
func AsDataSyncTarget(endpoint Endpoint) (DataSyncTarget, bool) {
	i, ok := endpoint.(DataSyncTarget)
	return i, ok
}
func AsSessionProvider(endpoint Endpoint) (SessionProvider, bool) {
	i, ok := endpoint.(SessionProvider)
	return i, ok
}

func Ignores(endpoint Endpoint, name string) bool {
	base := path.Base(name)
	for _, n := range endpoint.GetEndpointInfo().Ignores {
		if n == base {
			return true
		}
	}
	return false
}

func IsFolderHiddenFile(name string) bool {
	return path.Base(name) == common.PYDIO_SYNC_HIDDEN_FILE_META
}

type WatchConnectionInfo int

const (
	WatchConnected WatchConnectionInfo = iota
	WatchDisconnected
)

type EndpointInfo struct {
	URI                   string
	RequiresNormalization bool
	RequiresFoldersRescan bool
	EchoTime              time.Duration
	Ignores               []string
}

type Endpoint interface {
	LoadNode(ctx context.Context, path string, leaf ...bool) (node *tree.Node, err error)
	GetEndpointInfo() EndpointInfo
}

type WalkNodesFunc func(path string, node *tree.Node, err error)

type PathSyncSource interface {
	Endpoint
	Walk(walknFc WalkNodesFunc, pathes ...string) (err error)
	Watch(recursivePath string, connectionInfo chan WatchConnectionInfo) (*WatchObject, error)
}

type ChecksumProvider interface {
	Endpoint
	ComputeChecksum(node *tree.Node) error
}

type PathSyncTarget interface {
	Endpoint
	CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error)
	UpdateNode(ctx context.Context, node *tree.Node) (err error)
	DeleteNode(ctx context.Context, path string) (err error)
	MoveNode(ctx context.Context, oldPath string, newPath string) (err error)
}

type DataSyncTarget interface {
	PathSyncTarget
	GetWriterOn(path string, targetSize int64) (out io.WriteCloser, err error)
}

type DataSyncSource interface {
	PathSyncSource
	GetReaderOn(path string) (out io.ReadCloser, err error)
}

type UuidProvider interface {
	LoadNodeByUuid(ctx context.Context, uuid string) (node *tree.Node, err error)
}

type UuidReceiver interface {
	UpdateNodeUuid(ctx context.Context, node *tree.Node) (*tree.Node, error)
}

type UuidFoldersRefresher interface {
	ExistingFolders(ctx context.Context) (map[string][]*tree.Node, error)
	UpdateFolderUuid(ctx context.Context, node *tree.Node) (*tree.Node, error)
}

type Versioner interface {
	Commit(node *tree.Node)
	ListVersions(node *tree.Node) (versions map[int]string, lastVersion int)
}

type SessionProvider interface {
	StartSession(ctx context.Context, rootNode *tree.Node) (*tree.IndexationSession, error)
	FlushSession(ctx context.Context, sessionUuid string) error
	FinishSession(ctx context.Context, sessionUuid string) error
}

type HashStoreConsumer interface {
	SetHashStore(store Endpoint)
}

type Snapshoter interface {
	PathSyncSource
	IsEmpty() bool
	Capture(ctx context.Context, source PathSyncSource) error
}

type SnapshotUpdater interface {
	SetUpdateSnapshot(PathSyncTarget)
}

type SnapshotFactory interface {
	Load(name string) (Snapshoter, error)
}

type Stater interface {
	fmt.Stringer
	Stats() map[string]interface{}
}
