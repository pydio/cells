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

package nodes

import (
	"context"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
)

// BranchInfo contains information about a given identifier
type BranchInfo struct {
	LoadedSource
	*idm.Workspace
	Root              *tree.Node
	Binary            bool
	TransparentBinary bool
	AncestorsList     map[string][]*tree.Node
}

// IsInternal check if either datasource is internal or branch has Binary flag
func (b BranchInfo) IsInternal() bool {
	return b.Binary || b.LoadedSource.IsInternal()
}

// WithBucketName creates a copy of a LoadedSource with a bucket name
func WithBucketName(s LoadedSource, bucket string) LoadedSource {
	out := LoadedSource{
		Client: s.Client,
	}
	out.DataSource = proto.Clone(s.DataSource).(*object.DataSource)
	out.DataSource.ObjectsBucket = bucket
	return out
}

type ctxBranchInfoKey struct{}

// WithBranchInfo stores a BranchInfo with a given identifier inside context
func WithBranchInfo(ctx context.Context, identifier string, branchInfo BranchInfo, reset ...bool) context.Context {
	value := ctx.Value(ctxBranchInfoKey{})
	var data map[string]BranchInfo
	if value != nil && len(reset) == 0 {
		data = value.(map[string]BranchInfo)
	} else {
		data = make(map[string]BranchInfo)
	}
	data[identifier] = branchInfo
	return context.WithValue(ctx, ctxBranchInfoKey{}, data)
}

// GetBranchInfo finds BranchInfo inside the context
func GetBranchInfo(ctx context.Context, identifier string) (BranchInfo, error) {
	value := ctx.Value(ctxBranchInfoKey{})
	if value != nil {
		data := value.(map[string]BranchInfo)
		if info, ok := data[identifier]; ok {
			return info, nil
		}
	}
	return BranchInfo{}, errors.WithStack(errors.BranchInfoMissing)
}

// AncestorsListFromContext tries to load ancestors or get them from cache
func AncestorsListFromContext(ctx context.Context, node *tree.Node, identifier string, orParents bool) (updatedContext context.Context, parentsList []*tree.Node, e error) {

	branchInfo, be := GetBranchInfo(ctx, identifier)
	hasBranchInfo := be == nil
	if hasBranchInfo && branchInfo.AncestorsList != nil {
		if ancestors, ok := branchInfo.AncestorsList[node.Path]; ok {
			return ctx, ancestors, nil
		}
	}
	searchFunc := BuildAncestorsList
	n := node.Clone()
	if orParents {
		n.Uuid = "" // Make sure to look by path
		searchFunc = BuildAncestorsListOrParent
	}
	parents, err := searchFunc(ctx, GetSourcesPool(ctx).GetTreeClient(), n)
	if err != nil {
		return ctx, nil, err
	}

	if hasBranchInfo {
		if branchInfo.AncestorsList == nil {
			branchInfo.AncestorsList = make(map[string][]*tree.Node, 1)
		}
		// Make sure to detect ws_root
		for _, rootId := range branchInfo.RootUUIDs {
			for i := 0; i < len(parents); i++ {
				if parents[i].Uuid == rootId {
					cloneNode := parents[i].Clone()
					cloneNode.MustSetMeta(common.MetaFlagWorkspaceRoot, "true")
					parents[i] = cloneNode
				}
			}
		}
		branchInfo.AncestorsList[node.Path] = parents
		ctx = WithBranchInfo(ctx, identifier, branchInfo)
	}
	if orParents && len(parents) > 0 && parents[0].Path != n.Path {
		parents = append([]*tree.Node{n}, parents...)
	}
	return ctx, parents, nil

}

// IsFlatStorage checks a context BranchInfo for the FlatStorage flag
func IsFlatStorage(ctx context.Context, identifier string) bool {
	if info, er := GetBranchInfo(ctx, identifier); er == nil && info.FlatStorage && !info.Binary {
		return true
	}
	return false
}

// IsInternal checks a context BranchInfo for the Internal flag
func IsInternal(ctx context.Context, identifier string) bool {
	if info, er := GetBranchInfo(ctx, identifier); er == nil && info.IsInternal() {
		return true
	}
	return false
}

// IsMinioServer checks a context BranchInfo for pure S3
func IsMinioServer(ctx context.Context, identifier string) bool {
	if info, er := GetBranchInfo(ctx, identifier); er == nil && info.ServerIsMinio() {
		return true
	}
	return false
}

type ctxSkipAclCheckKey struct{}

// WithSkipAclCheck instructs ACL-oriented handlers to be ignore. To be used with caution.
func WithSkipAclCheck(ctx context.Context) context.Context {
	return context.WithValue(ctx, ctxSkipAclCheckKey{}, true)
}

// HasSkipAclCheck checks if the SkipAclCheck flag is set in context
func HasSkipAclCheck(ctx context.Context) bool {
	return ctx.Value(ctxSkipAclCheckKey{}) != nil
}
