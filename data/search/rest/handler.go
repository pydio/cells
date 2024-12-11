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

// Package rest provides a REST service for querying the search engine
package rest

import (
	"context"
	"regexp"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/service/resources"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/idm/share"
)

type Handler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (s *Handler) SwaggerTags() []string {
	return []string{"SearchService"}
}

// Filter returns a function to filter the swagger path
func (s *Handler) Filter() func(string) string {
	return nil
}

func (s *Handler) getRouter(ctx context.Context) nodes.Client {
	return compose.PathClient(ctx)
}

func (s *Handler) getClient(ctx context.Context) tree.SearcherClient {
	return tree.NewSearcherClient(grpc.ResolveConn(ctx, common.ServiceSearchGRPC))
}

func (s *Handler) sharedResourcesAsNodes(ctx context.Context, query *tree.Query) ([]*tree.Node, bool, error) {
	scope, freeString, active := s.extractSharedMeta(query.FreeString)
	if !active {
		return nil, false, nil
	}
	// Replace FS
	query.FreeString = freeString

	sc := share.NewClient(ctx, nil)
	rr, e := sc.ListSharedResources(ctx, "", scope, true, resources.ResourceProviderHandler{})
	if e != nil {
		return nil, false, e
	}
	var out []*tree.Node
	for _, r := range rr {
		out = append(out, r.Node)
	}
	return out, active, nil
}

// extractSharedMeta reads special meta from FreeString to detect searches on shared resources
func (s *Handler) extractSharedMeta(freeString string) (scope idm.WorkspaceScope, newString string, has bool) {
	rx, _ := regexp.Compile("((\\+)?Meta\\.shared_resource_type:(any|cell|link))")
	matches := rx.FindAllStringSubmatch(freeString, -1)
	if len(matches) == 1 && len(matches[0]) == 4 {
		has = true
		switch matches[0][3] {
		case "any":
			scope = idm.WorkspaceScope_ANY
		case "cell":
			scope = idm.WorkspaceScope_ROOM
		case "link":
			scope = idm.WorkspaceScope_LINK
		}
		newString = rx.ReplaceAllString(freeString, "")
		newString = strings.TrimSpace(newString)
	}
	return
}

// wsAsPrefixes translates idm.Workspace to a list of root prefixes
func (s *Handler) wsAsPrefixes(in []string, ws *idm.Workspace) []string {
	if len(ws.RootUUIDs) > 1 {
		for _, root := range ws.RootUUIDs {
			in = append(in, ws.Slug+"/"+root)
		}
	} else {
		in = append(in, ws.Slug)
	}
	return in
}

// factorizePathPrefixes finds uppermost prefixes and detect if they are slugs or not
func (s *Handler) factorizePathPrefixes(in []string) map[string]bool {
	// bool=true means it's a slug
	inputPrefixes := map[string]bool{}
	for _, ppf := range in {
		ppf = strings.Trim(ppf, "/")
		if ppf == "" {
			continue
		}
		var ignore bool
		for k := range inputPrefixes {
			if strings.HasPrefix(ppf, k) {
				// a key already targets a wider path
				ignore = true
			} else if strings.HasPrefix(k, ppf) {
				// ppf will override current key
				delete(inputPrefixes, k)
			}
		}
		if ignore {
			continue
		}
		if !strings.Contains(ppf, "/") {
			inputPrefixes[ppf] = true
		} else {
			inputPrefixes[ppf] = false
		}
	}
	return inputPrefixes
}

// Nodes performs a search query
func (s *Handler) Nodes(req *restful.Request, rsp *restful.Response) error {

	ctx := req.Request.Context()
	var searchRequest tree.SearchRequest
	if err := req.ReadEntity(&searchRequest); err != nil {
		return err
	}
	query := searchRequest.Query
	if query == nil {
		return rsp.WriteEntity(&rest.SearchResults{Total: 0})
	}
	nn, ff, pag, er := s.PerformSearch(ctx, &searchRequest)
	if er != nil {
		return er
	}
	result := &rest.SearchResults{
		Results: nn,
		Facets:  ff,
		Total:   pag.Total,
	}
	return rsp.WriteEntity(result)

}

func (s *Handler) PerformSearch(ctx context.Context, searchRequest *tree.SearchRequest) (nn []*tree.Node, facets []*tree.SearchFacet, pagination *rest.Pagination, err error) {

	query := searchRequest.GetQuery()
	router := s.getRouter(ctx)

	var prefixes []string
	nodesPrefixes := map[string]string{}
	inputPrefixes := s.factorizePathPrefixes(query.PathPrefix)

	readCtx := propagator.WithAdditionalMetadata(ctx, tree.StatFlags(searchRequest.StatFlags).AsMeta())
	nodeStreamer, e := treec.NodeProviderStreamerClient(ctx).ReadNodeStream(readCtx)
	if e == nil {
		defer nodeStreamer.CloseSend()
	}

	// TMP Load shared
	sharedNodes, shared, er := s.sharedResourcesAsNodes(ctx, query)
	if er != nil {
		err = er
		return
	}

	err = router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {

		var userWorkspaces map[string]*idm.Workspace
		// Fill a context with current user info
		// (Let inputFilter apply the various necessary middlewares).
		loaderCtx, _, _ := inputFilter(ctx, &tree.Node{Path: ""}, "tmp")
		if accessList, ok := acl.FromContext(loaderCtx); ok {
			userWorkspaces = accessList.GetWorkspaces()
		}

		if shared {
			if len(sharedNodes) == 0 {
				// Break now, return an empty result
				return nil
			}
			for _, n := range sharedNodes {
				p := n.GetPath()
				ctx, n, e = inputFilter(ctx, n, "search-"+p)
				if e != nil {
					continue
				}
				log.Logger(ctx).Debug("Filtered Node & Context", zap.String("path", n.Path))
				query.Paths = append(query.Paths, n.Path)
			}
		}

		if len(inputPrefixes) == 0 {
			// Nothing specified - lookup in all workspaces
			for _, w := range userWorkspaces {
				prefixes = s.wsAsPrefixes(prefixes, w)
			}
		} else {
			for pf, isSlug := range inputPrefixes {
				if isSlug {
					// Workspace slug: append various roots for this WS
					for _, w := range userWorkspaces {
						if w.Slug == pf {
							prefixes = s.wsAsPrefixes(prefixes, w)
							break
						}
					}
				} else {
					// Full path, just append
					prefixes = append(prefixes, pf)
				}
			}
		}

		// Now rebuild **resolved** PathPrefix list
		var e error
		ctx = acl.WithPresetACL(loaderCtx, nil) // Just set the key, acl is already set
		query.PathPrefix = []string{}
		for _, p := range prefixes {
			rootNode := &tree.Node{Path: p}
			ctx, rootNode, e = inputFilter(ctx, rootNode, "search-"+p)
			if e != nil {
				continue
			}
			log.Logger(ctx).Debug("Filtered Node & Context", zap.String("path", rootNode.Path))
			nodesPrefixes[rootNode.Path] = p
			query.PathPrefix = append(query.PathPrefix, rootNode.Path)
		}

		sClient, err := s.getClient(ctx).Search(ctx, searchRequest)
		if err != nil {
			return err
		}

		defer sClient.CloseSend()

		for {
			resp, rErr := sClient.Recv()
			if resp == nil {
				break
			} else if rErr != nil {
				return err
			}
			if resp.Facet != nil {
				facets = append(facets, resp.Facet)
				continue
			}
			respNode := resp.Node
			wrapperCtx, wrapperN, _ := inputFilter(ctx, respNode, "in-"+respNode.Uuid)
			if err := router.WrappedCanApply(wrapperCtx, wrapperCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: wrapperN}); err != nil {
				log.Logger(ctx).Debug("Skipping node in search results", respNode.ZapPath(), zap.Error(err))
				continue
			}
			for r, p := range nodesPrefixes {
				if strings.HasPrefix(respNode.Path, r+"/") || respNode.Path == r {
					log.Logger(ctx).Debug("Response", zap.String("node", respNode.Path))
					if nodeStreamer != nil {
						nodeStreamer.Send(&tree.ReadNodeRequest{Node: respNode.Clone()})
						if nsR, e := nodeStreamer.Recv(); e == nil {
							respNode = nsR.GetNode()
						}
					}
					_, filtered, err := outputFilter(ctx, respNode, "search-"+p)
					if err != nil {
						return err
					}
					if userWorkspaces != nil {
						for _, w := range userWorkspaces {
							if strings.HasPrefix(filtered.Path, w.Slug+"/") {
								filtered.MustSetMeta(common.MetaFlagWorkspaceRepoId, w.UUID)
								filtered.MustSetMeta(common.MetaFlagWorkspaceRepoDisplay, w.Label)
							}
						}
					}
					nn = append(nn, filtered.WithoutReservedMetas())
				}
			}
		}
		return nil

	})
	if err != nil {
		return
	}
	pagination = &rest.Pagination{Total: int32(len(nn))}
	return
}
