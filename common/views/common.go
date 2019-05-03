/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package views provides high-level clients for talking to the main data tree in certain context.
//
// It follows the "wrapper" pattern of http handlers to filter all requests inputs and outputs. The "Router" is object
// is used by all services or gateways when accessing to data as a given user.
// Between others, it will
// - Load ACLs and perform checks to make sure user is allowed to read/write the data
// - Perform other meta-related or acl-related checks like Quota management, locks, etc..
// - Perform encryption/decryption of actual data on the fly
// - Compress / Decompress archives,
// - Add metadata collected from any services on the nodes outputted by the responses,
// - etc...
package views

import (
	"context"
	"io"

	"github.com/pkg/errors"

	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/minio-go"
)

const (
	VIEWS_LIBRARY_NAME = "pydio.lib.views"
)

var (
	// IsUnitTestEnv flag prevents among others the ClientPool to look for declared
	// datasources in the registry. As none is present while running unit tests, it
	// otherwise times out.
	IsUnitTestEnv = false
)

// These keys may be enriched in Context depending on the middleware
type (
	CtxUserAccessListKey struct{}
	ctxAdminContextKey   struct{}
	ctxBranchInfoKey     struct{}
	CtxKeepAccessListKey struct{}

	LoadedSource struct {
		object.DataSource
		Client *minio.Core
	}

	BranchInfo struct {
		LoadedSource
		idm.Workspace
		Root          *tree.Node
		Binary        bool
		AncestorsList map[string][]*tree.Node
	}

	PutRequestData struct {
		Size              int64
		Md5Sum            []byte
		Sha256Sum         []byte
		Metadata          map[string]string
		MultipartUploadID string
		MultipartPartID   int
	}

	GetRequestData struct {
		StartOffset int64
		Length      int64
		VersionId   string
	}

	CopyRequestData struct {
		Metadata     map[string]string
		SrcVersionId string
	}

	MultipartRequestData struct {
		Metadata map[string]string

		ListKeyMarker      string
		ListUploadIDMarker string
		ListDelimiter      string
		ListMaxUploads     int
	}
)

type NodeFilter func(ctx context.Context, inputNode *tree.Node, identifier string) (context.Context, *tree.Node, error)
type NodesCallback func(inputFilter NodeFilter, outputFilter NodeFilter) error

type Handler interface {
	tree.NodeProviderClient
	tree.NodeReceiverClient
	GetObject(ctx context.Context, node *tree.Node, requestData *GetRequestData) (io.ReadCloser, error)
	PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *PutRequestData) (int64, error)
	CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *CopyRequestData) (int64, error)

	MultipartCreate(ctx context.Context, target *tree.Node, requestData *MultipartRequestData) (string, error)
	MultipartPutObjectPart(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, reader io.Reader, requestData *PutRequestData) (minio.ObjectPart, error)
	MultipartList(ctx context.Context, prefix string, requestData *MultipartRequestData) (minio.ListMultipartUploadsResult, error)
	MultipartAbort(ctx context.Context, target *tree.Node, uploadID string, requestData *MultipartRequestData) error
	MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error)
	MultipartListObjectParts(ctx context.Context, target *tree.Node, uploadID string, partNumberMarker int, maxParts int) (minio.ListObjectPartsResult, error)

	ExecuteWrapped(inputFilter NodeFilter, outputFilter NodeFilter, provider NodesCallback) error

	SetNextHandler(h Handler)
	SetClientsPool(p *ClientsPool)
}

func WithBranchInfo(ctx context.Context, identifier string, branchInfo BranchInfo, reset ...bool) context.Context {
	//log.Logger(ctx).Error("branchInfo", zap.Any("branchInfo", branchInfo))
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

func GetBranchInfo(ctx context.Context, identifier string) (BranchInfo, bool) {
	value := ctx.Value(ctxBranchInfoKey{})
	if value != nil {
		data := value.(map[string]BranchInfo)
		if info, ok := data[identifier]; ok {
			return info, true
		}
	}
	return BranchInfo{}, false
}

func UserWorkspacesFromContext(ctx context.Context) map[string]*idm.Workspace {
	if value := ctx.Value(CtxUserAccessListKey{}); value != nil {
		accessList := value.(*permissions.AccessList)
		return accessList.Workspaces
	} else {
		return make(map[string]*idm.Workspace)
	}
}

func AccessListFromContext(ctx context.Context) (*permissions.AccessList, error) {
	if value := ctx.Value(CtxUserAccessListKey{}); value != nil {
		accessList := value.(*permissions.AccessList)
		return accessList, nil
	} else {
		return nil, errors.New("Cannot find access list in context")
	}
}

func AncestorsListFromContext(ctx context.Context, node *tree.Node, identifier string, p *ClientsPool, orParents bool) (updatedContext context.Context, parentsList []*tree.Node, e error) {

	branchInfo, hasBranchInfo := GetBranchInfo(ctx, identifier)
	if hasBranchInfo && branchInfo.AncestorsList != nil {
		if ancestors, ok := branchInfo.AncestorsList[node.Path]; ok {
			return ctx, ancestors, nil
		}
	}
	searchFunc := tree.BuildAncestorsList
	if orParents {
		searchFunc = tree.BuildAncestorsListOrParent
	}
	if parents, err := searchFunc(ctx, p.GetTreeClient(), node); err != nil {
		return ctx, nil, err
	} else {
		if hasBranchInfo {
			if branchInfo.AncestorsList == nil {
				branchInfo.AncestorsList = make(map[string][]*tree.Node, 1)
			}
			branchInfo.AncestorsList[node.Path] = parents
			ctx = WithBranchInfo(ctx, identifier, branchInfo)
		}
		return ctx, parents, nil
	}

}
