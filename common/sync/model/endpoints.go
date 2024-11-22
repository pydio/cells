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

package model

import (
	"context"
	"io"
	"path"
	"time"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// AsPathSyncSource tries to cast an Endpoint to a PathSyncSource
func AsPathSyncSource(endpoint Endpoint) (PathSyncSource, bool) {
	i, ok := endpoint.(PathSyncSource)
	return i, ok
}

// AsPathSyncTarget tries to cast an Endpoint to a PathSyncTarget
func AsPathSyncTarget(endpoint Endpoint) (PathSyncTarget, bool) {
	i, ok := endpoint.(PathSyncTarget)
	return i, ok
}

// AsDataSyncSource tries to cast an Endpoint to a DataSyncSource
func AsDataSyncSource(endpoint Endpoint) (DataSyncSource, bool) {
	i, ok := endpoint.(DataSyncSource)
	return i, ok
}

// AsDataSyncTarget tries to cast an Endpoint to a DataSyncTarget
func AsDataSyncTarget(endpoint Endpoint) (DataSyncTarget, bool) {
	i, ok := endpoint.(DataSyncTarget)
	return i, ok
}

// AsSessionProvider tries to cast an Endpoint to a SessionProvider
func AsSessionProvider(endpoint Endpoint) (SessionProvider, bool) {
	i, ok := endpoint.(SessionProvider)
	return i, ok
}

// Ignores checks if a specific name should be ignored by the given Endpoint
func Ignores(endpoint Endpoint, name string) bool {
	base := path.Base(name)
	for _, n := range endpoint.GetEndpointInfo().Ignores {
		if n == base {
			return true
		}
	}
	return false
}

// IsFolderHiddenFile checks if file is .pydio
func IsFolderHiddenFile(name string) bool {
	return path.Base(name) == common.PydioSyncHiddenFile
}

// EndpointInfo provides static info about a given Endpoint (returned by GetEndpointInfo method)
type EndpointInfo struct {
	URI                   string
	RequiresNormalization bool
	RequiresFoldersRescan bool
	IsAsynchronous        bool
	EchoTime              time.Duration
	Ignores               []string
}

// EndpointOptions is used to configure an Endpoint at creation time
type EndpointOptions struct {
	BrowseOnly bool
	Properties map[string]string
}

// EndpointRootStat gives information about the size/files/folders of an endpoint
type EndpointRootStat struct {
	HasChildrenInfo bool
	HasSizeInfo     bool

	Size    int64
	Folders int64
	Files   int64

	PgSize     int64 `json:"-"`
	PgChildren int64 `json:"-"`
	PgFolders  int64 `json:"-"`
	PgFiles    int64 `json:"-"`

	LastPg float64 `json:"-"`
}

// Children returns the sum of Folders and Files
func (e *EndpointRootStat) Children() int64 {
	return e.Folders + e.Files
}

// IsKnown returns true if either HasSizeInfo or HasChildrenInfo is set
func (e *EndpointRootStat) IsKnown() bool {
	return e.HasSizeInfo || e.HasChildrenInfo
}

// IsEmpty checks if the given stat seems empty. Call to IsKnown should be done
// before otherwise it can be a false negative
func (e *EndpointRootStat) IsEmpty() bool {
	return e.HasChildrenInfo && (e.Folders+e.Files == 0) || e.HasSizeInfo && e.Size <= 36 // Size is just one folder...
}

// Endpoint is the most basic interface for representing an endpoint for synchronization. It is just able to
// return some info and to load a node
type Endpoint interface {
	// LoadNode loads a given node by its path from this endpoint
	LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error)
	// GetEndpointInfo returns static information about this endpoint
	GetEndpointInfo() EndpointInfo
}

type WalkNodesFunc func(path string, node tree.N, err error) error

// PathSyncSource is a type of endpoint that can be used as a source of tree.Nodes for synchronization. It can browse and
// watch the nodes, but not get the nodes actual content (see DataSyncSource).
type PathSyncSource interface {
	Endpoint
	// Walk walks the nodes with a callback
	Walk(ctx context.Context, walknFc WalkNodesFunc, root string, recursive bool) (err error)
	// Watch sets up an event watcher on the nodes
	Watch(recursivePath string) (*WatchObject, error)
}

// ChecksumProvider is able to compute a checksum for a given node (typically an Etag)
type ChecksumProvider interface {
	Endpoint
	ComputeChecksum(ctx context.Context, node tree.N) error
}

// A CachedBranchProvider can quickly load a full branch recursively in memory and expose it as a PathSyncSource
type CachedBranchProvider interface {
	Endpoint
	GetCachedBranches(ctx context.Context, roots ...string) (PathSyncSource, error)
}

// A BulkLoader can stream calls to ReadNode - Better use CachedBranchProvider
type BulkLoader interface {
	BulkLoadNodes(ctx context.Context, nodes map[string]string) (map[string]interface{}, error)
}

// PathSyncTarget is a type of endpoint that can be used as a target for synchronization, typically an Index. It can be
// updated with a tree of nodes, but cannot store actual data (see DataSyncTarget)
type PathSyncTarget interface {
	Endpoint
	// CreateNode is used to create a node in the tree
	CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error)
	// DeleteNode is used to remove a node (and all its children) from the tree
	DeleteNode(ctx context.Context, path string) (err error)
	// MoveNode is used to move a node (and all its children) from one place to another in the tree.
	MoveNode(ctx context.Context, oldPath string, newPath string) (err error)
}

// DataSyncTarget provides a way to write some actual content to the nodes
type DataSyncTarget interface {
	PathSyncTarget
	// GetWriterOn provides a writeCloser for writing content to a given path.
	GetWriterOn(cancel context.Context, path string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error)
}

// DataSyncSource provides a way to read the actual content of the nodes
type DataSyncSource interface {
	PathSyncSource
	// GetReaderOn provides a ReadCloser for reading content of a node located at a given path
	GetReaderOn(ctx context.Context, path string) (out io.ReadCloser, err error)
}

// UuidProvider declares an endpoint to be able to load a node by its unique UUID
type UuidProvider interface {
	// LoadNodeByUuid loads a node by UUID.
	LoadNodeByUuid(ctx context.Context, uuid string) (node tree.N, err error)
}

// UuidReceiver is able to update an existing node UUID
type UuidReceiver interface {
	// UpdateNodeUuid refresh node UUID and returns the new node
	UpdateNodeUuid(ctx context.Context, node tree.N) (tree.N, error)
}

// UuidFoldersRefresher provides tools to detect UUID duplicates and update them if necessary
type UuidFoldersRefresher interface {
	// ExistingFolders lists all folders with their UUID
	ExistingFolders(ctx context.Context) (map[string][]tree.N, error)
	// UpdateFolderUuid refreshes a given folder UUID and return it.
	UpdateFolderUuid(ctx context.Context, node tree.N) (tree.N, error)
}

// MetadataProvider declares metadata namespaces that may be mapped to target metadata
type MetadataProvider interface {
	// ProvidesMetadataNamespaces returns a list of patterns to check on provider nodes MetaStore.
	ProvidesMetadataNamespaces() ([]glob.Glob, bool)
}

// MetadataReceiver implements methods for updating nodes metadata
type MetadataReceiver interface {
	// CreateMetadata add a metadata to the node
	CreateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error
	// UpdateMetadata updates an existing metadata value
	UpdateMetadata(ctx context.Context, node tree.N, namespace string, jsonValue string) error
	// DeleteMetadata deletes a metadata by namespace
	DeleteMetadata(ctx context.Context, node tree.N, namespace string) error
}

type Versioner interface {
	Commit(node tree.N)
	ListVersions(node tree.N) (versions map[int]string, lastVersion int)
}

// SessionProvider has internal mechanism to start/flush/finish an IndexationSession
type SessionProvider interface {
	// StartSession opens a new indexation session and returns it
	StartSession(ctx context.Context, rootNode tree.N, silent bool) (string, error)
	// FlushSession calls the Flush method on the underlying service without closing the session yet
	FlushSession(ctx context.Context, sessionUuid string) error
	// FinishSession closes the indexation session
	FinishSession(ctx context.Context, sessionUuid string) error
}

// LockBranchProvider can set/remove a lock on a branch, with automatic expiration
type LockBranchProvider interface {
	// LockBranch sets a lock on a branch, with a preset sessionUUID and an expiration time
	LockBranch(ctx context.Context, node tree.N, sessionUUID string, expireAfter time.Duration) error
	// UnlockBranch removes lock manually from this branch, if it was not expired already
	UnlockBranch(ctx context.Context, sessionUUID string) error
}

// Snapshoter is an extended version of PathSyncSource that can capture another source at once.
type Snapshoter interface {
	PathSyncSource
	// IsEmpty indicates whether this snapshot is properly initialized or not (e.g. underlying DB not found)
	IsEmpty() bool
	// Capture walks the source and stores all paths inside snapshot. The paths parameter allows to filter the branches to capture.
	Capture(ctx context.Context, source PathSyncSource, paths ...string) error
}

// SnapshotUpdater is an endpoint that can embed a reference to a snapshot and update it afterward
type SnapshotUpdater interface {
	// SetUpdateSnapshot stores internal reference to a Snapshot
	SetUpdateSnapshot(PathSyncTarget)
	// PatchUpdateSnapshot applies a patch of operations to the internal snapshot
	PatchUpdateSnapshot(ctx context.Context, patch interface{})
}

// SnapshotFactory provides dependency injection for creating snapshots using a specific persistence layer.
type SnapshotFactory interface {
	// Load creates the snapshot and return it
	Load(source PathSyncSource) (Snapshoter, error)
	Close(ctx context.Context) error
	Reset(ctx context.Context) error
}

// HashStoreReader can maintain a reference to a snapshot to quickly find hashes for nodes directly from the snapshot if they
// have not been modified
type HashStoreReader interface {
	// SetRefHashStore passes a reference to a loaded snapshot
	SetRefHashStore(source PathSyncSource)
}
