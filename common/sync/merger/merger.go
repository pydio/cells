/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package merger

import (
	"context"
	"fmt"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type ConflictType int

const (
	ConflictFolderUUID ConflictType = iota
	ConflictFileContent
	ConflictNodeType
)

// Conflict represent a conflict between two nodes at the same path
type Conflict struct {
	Type      ConflictType
	NodeLeft  *tree.Node
	NodeRight *tree.Node
}

type PatchOptions struct {
	MoveDetection bool
	NoRescan      bool
}

type OpWalker func(Operation)

// Patch represents a set of operations to be processed
type Patch interface {
	model.Stater
	StatusProvider

	// Source get or set the source of this patch
	Source(newSource ...model.PathSyncSource) model.PathSyncSource
	// Target get or set the target of this patch
	Target(newTarget ...model.PathSyncTarget) model.PathSyncTarget

	// Enqueue stacks a Operation - By default, it is registered with the event.Key, but an optional key can be passed.
	// TODO : check this key param is really necessary
	Enqueue(event Operation, key ...string)
	// WalkOperations crawls operations in correct order, with an optional filter (no filter = all operations)
	WalkOperations(opTypes []OperationType, callback OpWalker)
	// EventsByTypes retrieves all events of a given type
	OperationsByType(types []OperationType, sorted ...bool) (events []Operation)

	// Filter tries to detect unnecessary changes locally
	Filter(ctx context.Context)
	// FilterToTarget tries to compare changes to target and remove unnecessary ones
	FilterToTarget(ctx context.Context)

	// HasTransfers tels if the source and target will exchange actual data.
	HasTransfers() bool
	// Size returns the total number of operations
	Size() int
	// ProgressTotal returns the total number of bytes to be processed, to be used for progress.
	// Basically, file transfers operations returns the file size, but other operations return a 1 byte size.
	ProgressTotal() int64

	// Set a global error status on this patch
	SetError(error)
	// Check if this patch has a global error status
	HasError() (error, bool)

	// SetSessionProvider registers a target as supporting the SessionProvider interface
	SetSessionProvider(providerContext context.Context, provider model.SessionProvider, silentSession bool)
	// StartSessionProvider calls StartSession on the underlying provider if it is set
	StartSessionProvider(rootNode *tree.Node) (*tree.IndexationSession, error)
	// FlushSessionProvider calls FlushSession on the underlying provider if it is set
	FlushSessionProvider(sessionUuid string) error
	// FinishSessionProvider calls FinishSession on the underlying provider if it is set
	FinishSessionProvider(sessionUuid string) error
}

// OperationType describes the type of operation to be applied
type OperationType int

const (
	OpCreateFile OperationType = iota
	OpUpdateFile
	OpCreateFolder
	OpMoveFolder
	OpMoveFile
	OpDelete
	OpRefreshUuid
	OpUnknown
)

// String gives a string representation of this integer type
func (t OperationType) String() string {
	switch t {
	case OpCreateFolder:
		return "CreateFolder"
	case OpCreateFile:
		return "CreateFile"
	case OpMoveFolder:
		return "MoveFolder"
	case OpMoveFile:
		return "MoveFile"
	case OpUpdateFile:
		return "UpdateFile"
	case OpDelete:
		return "Delete"
	case OpRefreshUuid:
		return "RefreshUuid"
	}
	return ""
}

type OperationDirection int

const (
	OperationDirDefault OperationDirection = iota
	OperationDirLeft
	OperationDirRight
)

// Operation describes an atomic operation to be passed to a processor and applied to an endpoint
type Operation interface {
	fmt.Stringer

	Type() OperationType
	GetNode() *tree.Node
	IsScanEvent() bool
	IsTypeMove() bool
	IsTypeData() bool
	IsTypePath() bool
	IsProcessed() bool
	Status(status ProcessStatus)
	GetStatus() ProcessStatus
	GetRefPath() string
	GetMoveOriginPath() string

	SetProcessed()
	SetDirection(OperationDirection) Operation
	SetNode(n *tree.Node)
	UpdateRefPath(p string)
	UpdateMoveOriginPath(p string)
	UpdateType(t OperationType)

	AttachToPatch(p Patch)
	Source() model.PathSyncSource
	Target() model.PathSyncTarget
	NodeFromSource(ctx context.Context) (node *tree.Node, err error)
	NodeInTarget(ctx context.Context) (node *tree.Node, found bool)

	Clone(replaceType ...OperationType) Operation
	CreateContext(ctx context.Context) context.Context
}

// Diff represents basic differences between two sources
// It can be then transformed to Patch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type Diff interface {
	model.Stater
	StatusProvider

	// Compute performs the actual Diff operation
	Compute(root string) error
	// ToUnidirectionalPatch transforms current diff into a set of patch operations
	ToUnidirectionalPatch(direction model.DirectionType) (patch Patch, err error)
	// ToBidirectionalPatch transforms current diff into a set of 2 batches of operations
	ToBidirectionalPatches(leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget) (leftPatch Patch, rightPatch Patch)
	// conflicts list discovered conflicts
	Conflicts() []*Conflict
}

// ProcessStatus informs about the status of an operation
type ProcessStatus struct {
	StatusString     string
	IsError          bool
	Error            error
	Progress         float32
	IsProgressAtomic bool

	EndpointURI string
	Node        *tree.Node
}

// StatusProvider can register channels to send status/done events during processing
type StatusProvider interface {
	// SetupChannels register channels for listening to status and done infos
	SetupChannels(status chan ProcessStatus, done chan interface{}, cmd *model.Command)
	// Status notify of a new ProcessStatus
	Status(s ProcessStatus)
	// Done notify the patch is processed, can send any useful info to the associated channel
	Done(info interface{})
}

// NewDiff creates a new Diff implementation
func NewDiff(ctx context.Context, left model.PathSyncSource, right model.PathSyncSource) Diff {
	return newTreeDiff(ctx, left, right)
}

// NewPatch creates a new Patch implementation
func NewPatch(source model.PathSyncSource, target model.PathSyncTarget, options PatchOptions) Patch {
	return newTreePatch(source, target, options)
}

// ClonePatch creates a new patch with the same operations but different source/targets
func ClonePatch(source model.PathSyncSource, target model.PathSyncTarget, origin Patch) Patch {
	patch := newTreePatch(source, target, PatchOptions{
		MoveDetection: false,
		NoRescan:      true,
	})
	for _, op := range origin.OperationsByType([]OperationType{}) {
		patch.Enqueue(op.Clone()) // Will update patch reference
	}
	return patch
}

// ConflictsByType filters a slice of conflicts for a given type
func ConflictsByType(cc []*Conflict, conflictType ConflictType) (conflicts []*Conflict) {
	for _, c := range cc {
		if c.Type == conflictType {
			conflicts = append(conflicts, c)
		}
	}
	return
}

// MostRecentNode compares two nodes Modification Time and returns the most recent one
func MostRecentNode(n1, n2 *tree.Node) *tree.Node {
	if n1.Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		return n2
	} else if n2.Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		return n1
	} else if n1.MTime > n2.MTime {
		return n1
	} else {
		return n2
	}
}
