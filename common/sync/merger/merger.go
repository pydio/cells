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

// Package merger implements all logic to compare trees and create set of operations to be applied
package merger

import (
	"context"
	"fmt"
	"time"

	"github.com/gobwas/glob"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type ConflictType int

const (
	ConflictFolderUUID ConflictType = iota
	ConflictFileContent
	ConflictNodeType
	ConflictPathOperation
	ConflictMoveSameSource
	ConflictMoveSameTarget
	ConflictMetaChanged
)

type OperationDirection int

const (
	OperationDirDefault OperationDirection = iota
	OperationDirLeft
	OperationDirRight
)

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
	OpConflict
	OpUnknown
	OpDeleteMeta
	OpCreateMeta
	OpUpdateMeta
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
	case OpUpdateMeta:
		return "UpdateMetadata"
	case OpCreateMeta:
		return "CreateMetadata"
	case OpDeleteMeta:
		return "DeleteMetadata"
	}
	return ""
}

// NewDiff creates a new Diff implementation
func NewDiff(ctx context.Context, left model.PathSyncSource, right model.PathSyncSource) Diff {
	return newTreeDiff(ctx, left, right)
}

// NewPatch creates a new Patch implementation
func NewPatch(source model.PathSyncSource, target model.PathSyncTarget, options PatchOptions) Patch {
	return newTreePatch(source, target, options)
}

// Operation describes an atomic operation to be passed to a processor and applied to an endpoint
type Operation interface {
	fmt.Stringer

	// Type describes the operation type
	Type() OperationType
	// GetNode returns the attached node. For a create, it is the original node, for a delete or a move,
	// it is the node that is to be deleted/moved inside the target.
	GetNode() *tree.Node
	// IsScanEvent tells whether this operation was triggered by a manual scan (true) or by a Watch event (false)
	IsScanEvent() bool
	// IsTypeMove is a shortcut for OpMoveFile / OpMoveFolder types
	IsTypeMove() bool
	// IsTypeData is a shortcut for OpCreateFile / OpUpdateFile types
	IsTypeData() bool
	// IsTypePath is a shortcut for non-data operations
	IsTypePath() bool
	// IsProcessed tells wether this operation has been succesfully processed or not.
	IsProcessed() bool
	// Error returns any error attached to this operation processing
	Error() error
	// ErrorString returns the error as a string
	ErrorString() string
	// CleanError removes current error - it is called before reprocessing an operation
	CleanError()
	// Status sets the last known status of this operation
	Status(status model.Status)
	// GetStatus returns the last known status of this operation
	GetStatus() model.Status
	// GetRefPath returns the reference path used to check a node being present or not. For a move, it is the target path.
	// This path is dynamically computed based on the the parent operations being already processed or not.
	GetRefPath() string
	// GetMoveOriginPath returns the source path if operation is a move.
	// This path is dynamically computed based on the the parent operations being already processed or not.
	GetMoveOriginPath() string

	// SetProcessed flags operation as succesfully processed
	SetProcessed()
	// SetDirection updates the operation direction. This is use for BiDirectionalPatches that can contain operations to be
	// applied in both directions
	SetDirection(OperationDirection) Operation
	// SetNode updates the reference node
	SetNode(n *tree.Node)
	// UpdateRefPath updates the reference path
	UpdateRefPath(p string)
	// UpdateMoveOriginPath updates the origin path for a move
	UpdateMoveOriginPath(p string)
	// UpdateType changes the internal type
	UpdateType(t OperationType)

	// AttachToPath links this operation to a given patch
	AttachToPatch(p Patch)
	// Source returns the operation source from the attached Patch
	Source() model.PathSyncSource
	// Target returns the operation target from the attached Patch
	Target() model.PathSyncTarget
	// NodeFromSource tries to load the node from the attached Patch source
	NodeFromSource(ctx context.Context) (node *tree.Node, err error)
	// NodeInTarget tries to find the node in the attached Patch target
	NodeInTarget(ctx context.Context, cache ...model.PathSyncSource) (node *tree.Node, found bool)

	// Clone creates a clone of this operation, eventually replacing its type.
	Clone(replaceType ...OperationType) Operation
	// CreateContext creates an appropriate context to be used by a Processor to pass useful informations to endpoints
	CreateContext(ctx context.Context) context.Context
}

type ConflictOperation interface {
	ConflictInfo() (t ConflictType, left Operation, right Operation)
}

// OpWalker is a callback passed to the Walk functions of a patch
type OpWalker func(Operation)

// Diff represents basic differences between two sources
// It can be then transformed to Patch, depending on the sync being
// unidirectional (transform to Creates and Deletes) or bidirectional (transform only to Creates)
type Diff interface {
	model.Stater
	model.StatusProvider

	// Compute performs the actual Diff operation
	Compute(root string, lock chan bool, rootStats map[string]*model.EndpointRootStat, ignores ...glob.Glob) error
	// ToUnidirectionalPatch transforms current diff into a set of patch operations
	ToUnidirectionalPatch(direction model.DirectionType, patch Patch) (err error)
	// ToBidirectionalPatch transforms current diff into a bidirectional patch of operations
	ToBidirectionalPatch(leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget, patch *BidirectionalPatch) (err error)
}

// PatchOptions contains various options for initializing a patch
type PatchOptions struct {
	MoveDetection bool
	NoRescan      bool
}

// Patch represents a set of operations to be processed
type Patch interface {
	model.Stater
	model.StatusProvider

	// GetUUID provides a unique ID for this patch
	GetUUID() string
	// SetUUID set the uuid
	SetUUID(string)
	// GetStamp returns a last modified date
	GetStamp() time.Time
	// Stamp set the last modified date on this patch
	Stamp(time.Time)

	// Source get or set the source of this patch
	Source(newSource ...model.PathSyncSource) model.PathSyncSource
	// Target get or set the target of this patch
	Target(newTarget ...model.PathSyncTarget) model.PathSyncTarget

	// Enqueue stacks a Operation - By default, it is registered with the event.Key, but an optional key can be passed.
	Enqueue(event Operation)
	// WalkOperations crawls operations in correct order, with an optional filter (no filter = all operations)
	WalkOperations(opTypes []OperationType, callback OpWalker)
	// EventsByTypes retrieves all events of a given type
	OperationsByType(types []OperationType, sorted ...bool) (events []Operation)

	// Filter tries to detect unnecessary changes locally
	Filter(ctx context.Context, ignores ...glob.Glob)
	// FilterToTarget tries to compare changes to target and remove unnecessary ones
	FilterToTarget(ctx context.Context)
	// SkipTargetChecks set a flag to skip FilterToTarget
	SkipFilterToTarget(bool)
	// PostFilter gets or sets a callback to be triggered after filtering
	PostFilter(...func() error) []func() error
	// Validate browses target to verify all changes are correctly reflected (and indexed)
	Validate(ctx context.Context) error

	// HasTransfers tels if the source and target will exchange actual data.
	HasTransfers() bool
	// Size returns the total number of operations
	Size() int
	// ProgressTotal returns the total number of bytes to be processed, to be used for progress.
	// Basically, file transfers operations returns the file size, but other operations return a 1 byte size.
	ProgressTotal() int64

	// SetPatchError sets a global error on this patch
	SetPatchError(e error) error
	// HasErrors checks if this patch has a global error status
	HasErrors() ([]error, bool)
	// CleanErrors cleans errors from patch before trying to reapply it
	CleanErrors()

	// SetSessionData sets some internal information to be used if Source or Target
	// implement the SessionProvider interface
	SetSessionData(providerContext context.Context, silentSession bool)
	// SetLockSessionData sets some internal information to be used if Source or Target
	// implement the LockBranchProvider interface
	SetLockSessionData(providerContext context.Context, lockSession string)
	// StartSession calls StartSession on the underlying provider if it is set
	StartSession(rootNode *tree.Node) (*tree.IndexationSession, error)
	// FlushSession calls FlushSession on the underlying provider if it is set
	FlushSession(sessionUuid string) error
	// FinishSession calls FinishSession on the underlying provider if it is set
	FinishSession(sessionUuid string) error
}

// PatchListener has a PublishPatch method
type PatchListener interface {
	PublishPatch(patch Patch)
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
