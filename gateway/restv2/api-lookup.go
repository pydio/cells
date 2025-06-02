/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package restv2

import (
	"context"
	"fmt"
	"math"
	"os"
	"slices"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/meta"
)

var (
	presignDefaultExpiration int64 = 900
	presignBucketName              = common.DefaultRouteBucketIO
)

func init() {
	runtime.RegisterEnvVariable("CELLS_PRESIGN_DEFAULT_EXPIRATION", "900s", "Override default expiration for pre-signed queries")
	runtime.RegisterEnvVariable("CELLS_PRESIGN_BUCKET_SECONDARY", "false", "Use secondary bucket for pre-signed queries")
	if exp := os.Getenv("CELLS_PRESIGN_DEFAULT_EXPIRATION"); exp != "" {
		if d, er := time.ParseDuration(exp); er == nil {
			presignDefaultExpiration = int64(math.Round(d.Seconds()))
		}
	}
	if sb := os.Getenv("CELLS_PRESIGN_BUCKET_SECONDARY"); sb == "true" {
		presignBucketName = common.DefaultRouteBucketData
	}
}

// Lookup Combines LS and FIND in one endpoint
func (h *Handler) Lookup(req *restful.Request, resp *restful.Response) error {

	input := &rest.LookupRequest{}
	if err := req.ReadEntity(input); err != nil {
		return err
	}
	ctx := req.Request.Context()
	coll := &rest.NodeCollection{}
	var nn []*tree.Node
	var er error

	oo := h.TNOptionsFromFlags(req, input.Flags)
	router := h.UuidClient(true)
	var searchQuery *tree.Query
	var bulkRequest *rest.GetBulkMetaRequest
	var bulkRecursive bool
	var statUuids []string
	var additionalPrefixes []*rest.LookupFilter_PathPrefix
	var recursive bool

	if input.Input != nil {
		// Legacy - should be deprecated
		switch input.Input.(type) {
		case *rest.LookupRequest_Query:
			searchQuery = input.GetQuery()
			recursive = true

		case *rest.LookupRequest_Locators:
			recursive = false
			if len(input.GetLocators().Many) == 0 {
				return errors.WithMessage(errors.InvalidParameters, "please provide at least path or uuid for locators")
			}
			var byPaths []string
			for _, l := range input.GetLocators().Many {
				if l.GetPath() != "" {
					byPaths = append(byPaths, l.GetPath())
				} else if u := l.GetUuid(); u != "" {
					statUuids = append(statUuids, u)
				}
			}
			if len(byPaths) > 0 && len(statUuids) > 0 {
				return errors.WithMessage(errors.InvalidParameters, "do not mix uuid and path locators")
			} else if len(byPaths) == 0 && len(statUuids) == 0 {
				return errors.WithMessage(errors.InvalidParameters, "please provide at least path or uuid for locators")
			}
			if len(byPaths) > 0 {
				bulkRequest = &rest.GetBulkMetaRequest{
					NodePaths: byPaths,
				}
			}
		}

	} else {

		var filter *rest.LookupFilter
		var scope *rest.LookupScope
		if scope = input.GetScope(); scope == nil {
			scope = &rest.LookupScope{}
		}
		recursive = scope.Recursive
		if filter = input.GetFilters(); filter == nil {
			filter = &rest.LookupFilter{}
		}
		var rootScope string
		var hasRootScope bool
		if scope.GetRoot() != nil {
			hasRootScope = true
			var e error
			rootScope, e = h.resolveRootPath(ctx, router, scope.GetRoot())
			if e != nil {
				return e
			}
		}

		// Transform deletedStatus to a pathPrefix or excluded prefix
		var deletedStatus rest.LookupFilter_StatusFilter_DeletedStatus
		if filter.Status != nil {
			deletedStatus = filter.Status.Deleted
		}
		additionalPrefixes = filter.GetPrefixes()

		if h.isListingLookup(scope, filter) {

			var statPaths []string
			if hasRootScope {
				if deletedStatus == rest.LookupFilter_StatusFilter_Only {
					// If listing deleted files at workspace level, list recycle_bin folder instead
					if r, modified, exists := h.handleRecycleRoot(ctx, h.TreeHandler.GetRouter(), rootScope); modified {
						if !exists {
							// Targeting a non-accessible recycle_bin, just return empty results
							log.Logger(ctx).Info("Recycle not found")
							coll.Nodes = []*rest.Node{}
							return resp.WriteEntity(coll)
						}
						rootScope = r
					}
				}
				statPaths = append(statPaths, strings.TrimRight(rootScope, "/")+"/*")
			}
			for _, node := range scope.GetNodes() {
				if node.Path != "" {
					statPaths = append(statPaths, node.GetPath())
				} else if node.Uuid != "" {
					statUuids = append(statUuids, node.GetUuid())
				}
			}
			if len(statPaths) > 0 {
				bulkRequest = &rest.GetBulkMetaRequest{
					NodePaths: statPaths,
					Filters:   make(map[string]string),
				}
				if filter.Type != tree.NodeType_UNKNOWN {
					bulkRequest.Filters["type"] = filter.Type.String()
				}
				if deletedStatus == rest.LookupFilter_StatusFilter_Not {
					bulkRequest.Filters[tree.MetaFilterNoGrep] = common.RecycleBinName
				}
			}
			bulkRecursive = scope.Recursive
			log.Logger(ctx).Info("LISTING nodes", zap.Any("bulk", bulkRequest), zap.Bool("recursive", bulkRecursive))

		} else {
			searchQuery = &tree.Query{}

			var rootScopeLength int
			if hasRootScope {
				searchQuery.PathPrefix = append(searchQuery.PathPrefix, rootScope)
				rootScopeLength = len(strings.Split(strings.Trim(rootScope, "/"), "/"))
			}

			if deletedStatus != rest.LookupFilter_StatusFilter_Any {
				exclude := deletedStatus == rest.LookupFilter_StatusFilter_Not
				if rootScopeLength <= 1 { // pass an additional prefixes only if root scope if "/" or "/ws-slug"
					additionalPrefixes = append(additionalPrefixes, &rest.LookupFilter_PathPrefix{
						Prefix:  common.RecycleBinName,
						Exclude: exclude,
					})
				}
			}

			searchQuery.Type = filter.Type

			if filter.Text != nil && filter.Text.Term != "" {
				switch filter.Text.SearchIn {
				case rest.LookupFilter_TextSearch_BaseName:
					searchQuery.FileName = filter.Text.Term
				case rest.LookupFilter_TextSearch_BaseOrContents:
					searchQuery.FileNameOrContent = filter.Text.Term
				case rest.LookupFilter_TextSearch_Contents:
					searchQuery.Content = filter.Text.Term
				}
			}
			if filter.Size != nil {
				searchQuery.MinSize = filter.Size.Min
				searchQuery.MaxSize = filter.Size.Max
			}
			if filter.Date != nil {
				searchQuery.MinDate = filter.Date.Min
				searchQuery.MaxDate = filter.Date.Max
				searchQuery.DurationDate = filter.Date.RelativeDuration
			}

			if status := filter.Status; status != nil {
				if status.GetIsDraft() {
					umc := meta.NewUserMetaClient()
					if m, ok := umc.DraftMetaNamespace(ctx, nil); ok {
						filter.Metadata = append(filter.Metadata, &rest.LookupFilter_MetaFilter{
							Namespace: m,
							Term:      "T*",
							Operation: rest.LookupFilter_MetaFilter_Must,
						})
					}
				}
				if status.HasPublicLink {
					filter.Metadata = append(filter.Metadata, &rest.LookupFilter_MetaFilter{
						Namespace: "shared_resource_type",
						Term:      "link",
						Operation: rest.LookupFilter_MetaFilter_Must,
					})
				}
			}

			if len(filter.Extensions) > 0 {
				searchQuery.Extension = strings.Join(filter.Extensions, ",")
			}

			// Now retransform Meta's to Bleve
			var qq []string
			for _, met := range filter.Metadata {
				op := ""
				switch met.Operation {
				case rest.LookupFilter_MetaFilter_Must:
					op = "+"
				case rest.LookupFilter_MetaFilter_Should:
					op = ""
				case rest.LookupFilter_MetaFilter_Not:
					op = "-"
				}
				qq = append(qq, fmt.Sprintf("%sMeta.%s:%s", op, met.Namespace, met.Term))
			}
			if len(qq) > 0 {
				searchQuery.FreeString += " " + strings.Join(qq, " ")
			}

			log.Logger(ctx).Info("SEARCHING nodes", zap.Any("query", searchQuery), zap.Any("prefixes", additionalPrefixes))

		}
	}

	// NOW PERFORM REQUEST
	if bulkRequest != nil {
		// Use TreeHandler
		bulkRequest.Offset = int32(input.GetOffset())
		bulkRequest.Limit = int32(input.GetLimit())
		if input.GetSortField() != "" {
			bulkRequest.SortField = input.GetSortField()
			bulkRequest.SortDirDesc = input.GetSortDirDesc()
		} else {
			bulkRequest.SortField = tree.MetaSortNatural
		}
		nn, coll.Pagination, er = h.TreeHandler.LoadNodes(ctx, bulkRequest, h.parseFlags(input.GetFlags()), bulkRecursive)
		if er != nil {
			return er
		}
		coll.Nodes = h.TreeNodesToNodes(ctx, nn, oo...)
	} else if searchQuery != nil {
		// Should switch to search
		searchRequest := &tree.SearchRequest{
			Query:       searchQuery,
			Size:        int32(input.GetLimit()),
			From:        int32(input.GetOffset()),
			StatFlags:   h.parseFlags(input.GetFlags()),
			SortField:   input.GetSortField(),
			SortDirDesc: input.GetSortDirDesc(),
		}
		nn, coll.Facets, coll.Pagination, er = h.SearchHandler.PerformSearch(ctx, searchRequest, !recursive, false, additionalPrefixes...)
		if er != nil {
			return er
		}
		coll.Nodes = h.TreeNodesToNodes(ctx, nn, oo...)
	} else if len(statUuids) > 0 {
		for _, u := range statUuids {
			if rr, er := router.ReadNode(ctx, &tree.ReadNodeRequest{
				Node:      &tree.Node{Uuid: u},
				StatFlags: h.parseFlags(input.GetFlags()),
			}); er != nil {
				return er
			} else {
				coll.Nodes = append(coll.Nodes, h.TreeNodeToNode(ctx, rr.GetNode(), oo...))
			}
		}
	}

	// Make sure Nodes field is not empty but {}
	if coll.Nodes == nil {
		coll.Nodes = []*rest.Node{}
	}

	log.Logger(ctx).Debug("FINISHED nodes", zap.Any("#", len(coll.Nodes)), zap.Any("pagination", coll.Pagination))

	return resp.WriteEntity(coll)

}

// GetByUuid is a simple call on a node - it requires default stats
func (h *Handler) GetByUuid(req *restful.Request, resp *restful.Response) error {
	nodeUuid := req.PathParameter("Uuid")

	router := h.UuidClient(true)
	ctx := req.Request.Context()
	rr, er := router.ReadNode(ctx, &tree.ReadNodeRequest{
		Node: &tree.Node{Uuid: nodeUuid},
		StatFlags: []uint32{
			tree.StatFlagVersionsAll,
			tree.StatFlagFolderSize,
			tree.StatFlagFolderCounts,
		},
	})
	if er != nil {
		return er
	}
	oo := h.TNOptionsFromFlags(req, []rest.Flag{rest.Flag_WithPreSignedURLs})
	return resp.WriteEntity(h.TreeNodeToNode(ctx, rr.GetNode(), oo...))
}

func (h *Handler) TNOptionsFromFlags(req *restful.Request, ff []rest.Flag) (oo []TNOption) {
	if slices.Contains(ff, rest.Flag_WithPreSignedURLs) {
		if sig, err := NewV4SignerForRequest(req.Request, presignDefaultExpiration); err != nil {
			log.Logger(req.Request.Context()).Error("Cannot create signer", zap.Error(err))
		} else {
			oo = append(oo, WithPreSigner(sig))
		}
	}
	return oo
}

func (h *Handler) parseFlags(ff []rest.Flag) (flags tree.Flags) {
	for _, f := range ff {
		switch f {
		case rest.Flag_WithMetaCoreOnly:
			flags = append(flags, tree.StatFlagMetaMinimal)
		case rest.Flag_WithVersionsAll:
			flags = append(flags, tree.StatFlagVersionsAll)
		case rest.Flag_WithVersionsDraft:
			flags = append(flags, tree.StatFlagVersionsDraft)
		case rest.Flag_WithVersionsPublished:
			flags = append(flags, tree.StatFlagVersionsPublished)
		case rest.Flag_WithMetaNone:
			flags = append(flags, tree.StatFlagNone)
		}
	}
	return
}

func (h *Handler) resolveRootPath(ctx context.Context, router nodes.Handler, root *rest.NodeLocator) (string, error) {
	if root.Uuid != "" {
		if resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: root.Uuid}}); er != nil {
			return "", er
		} else {
			return resp.GetNode().GetPath(), nil
		}
	}
	return root.Path, nil
}

func (h *Handler) handleRecycleRoot(ctx context.Context, pathHandler nodes.Handler, root string) (string, bool, bool) {
	pp := strings.Split(strings.Trim(root, "/"), "/")
	if len(pp) == 1 { // only append recycle to the workspace slug
		pp = append(pp, common.RecycleBinName)
		recyclePath := strings.Join(pp, "/")
		// Check that it exists
		if _, er := pathHandler.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: recyclePath}}); er != nil {
			return recyclePath, true, false
		} else {
			return recyclePath, true, true
		}
	}
	return root, false, false
}

// isListingLookup tries to detect if input should trigger a List or Search operation.
// scope and filters parameters are assumed to be non-nil.
func (h *Handler) isListingLookup(scope *rest.LookupScope, filters *rest.LookupFilter) bool {
	if scope.Root == nil && len(scope.Nodes) == 0 {
		// No roots passed, switch to search
		return false
	}
	// Looking for deleted nodes at the root
	if scope.Root != nil && (scope.Root.Path == "/" || scope.Root.Path == "") && filters.Status != nil && filters.Status.Deleted == rest.LookupFilter_StatusFilter_Only {
		return false
	}
	if filters.Status != nil && (filters.Status.IsBookmarked || filters.Status.IsDraft || filters.Status.HasPublicLink) ||
		len(filters.Metadata) > 0 ||
		filters.FreeExpression != "" ||
		filters.Prefixes != nil ||
		filters.Text != nil && filters.Text.Term != "" ||
		// following ones could be supported by listing
		filters.Size != nil || filters.Date != nil || len(filters.Extensions) > 0 {
		return false
	}
	return true
}
