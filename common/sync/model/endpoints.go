package model

import (
	"context"
	"io"

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

type EndpointInfo struct {
	RequiresNormalization bool
	RequiresFoldersRescan bool
}

type Endpoint interface {
	LoadNode(ctx context.Context, path string, leaf ...bool) (node *tree.Node, err error)
	GetEndpointInfo() EndpointInfo
}

type WalkNodesFunc func(path string, node *tree.Node, err error)

type PathSyncSource interface {
	Endpoint
	Walk(walknFc WalkNodesFunc, pathes ...string) (err error)
	Watch(recursivePath string) (*WatchObject, error)
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

type Versioner interface {
	Commit(node *tree.Node)
	ListVersions(node *tree.Node) (versions map[int]string, lastVersion int)
}

type SessionProvider interface {
	StartSession(ctx context.Context, rootNode *tree.Node) (*tree.IndexationSession, error)
	FlushSession(ctx context.Context, sessionUuid string) error
	FinishSession(ctx context.Context, sessionUuid string) error
}
