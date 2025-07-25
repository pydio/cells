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
	"path"
	"regexp"
	"strings"
	"sync"

	restful "github.com/emicklei/go-restful/v3"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/treec"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/compose"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/service/resources"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/telemetry/tracing"
	"github.com/pydio/cells/v5/common/utils/propagator"
	rest2 "github.com/pydio/cells/v5/data/meta/rest"
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
	return compose.PathClient()
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

	sc := share.NewClient(nil)
	rr, e := sc.ListSharedResources(ctx, "", scope, true, resources.ResourceProviderHandler{}, query.PathPrefix...)
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
	nn, ff, pag, er := s.PerformSearch(ctx, &searchRequest, false, true, false)
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

func (s *Handler) PerformSearch(ctx context.Context, searchRequest *tree.SearchRequest, firstLevelSearch, filterReserved bool, ensurePrefixesTrailingSlash bool, additionalPrefixes ...*rest.LookupFilter_PathPrefix) (nn []*tree.Node, facets []*tree.SearchFacet, pagination *rest.Pagination, err error) {

	var span trace.Span
	ctx, span = tracing.StartLocalSpan(ctx, "PerformSearch")
	defer span.End()

	query := searchRequest.GetQuery()
	router := s.getRouter(ctx)

	var prefixes []string
	nodesPrefixes := map[string]string{}
	inputPrefixes := s.factorizePathPrefixes(query.PathPrefix)

	readCtx := propagator.WithAdditionalMetadata(ctx, tree.StatFlags(searchRequest.StatFlags).AsMeta())
	nodeStreamer, e := treec.NodeProviderStreamerClient(ctx).ReadNodeStream(readCtx)
	if e != nil {
		err = e
		return
	}
	defer nodeStreamer.CloseSend()

	// TMP Load shared
	sharedNodes, shared, er := s.sharedResourcesAsNodes(ctx, query)
	if er != nil {
		err = er
		return
	}
	skipped := 0

	log.Logger(ctx).Debug("Start WrapCallback")

	err = router.WrapCallback(func(inputFilter nodes.FilterFunc, outputFilter nodes.FilterFunc) error {

		var userWorkspaces map[string]*idm.Workspace
		// Fill a context with current user info
		// (Let inputFilter apply the various necessary middlewares).
		loaderCtx, _, _ := inputFilter(ctx, &tree.Node{Path: ""}, "tmp")
		if accessList, ok := acl.FromContext(loaderCtx); ok {
			userWorkspaces = accessList.GetWorkspaces()
		}

		log.Logger(ctx).Debug("Loaded Workspaces")

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
		log.Logger(ctx).Debug("Rebuild PathPrefix List")
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
			if len(additionalPrefixes) > 0 {
				for _, pf := range additionalPrefixes {
					if pf.Exclude {
						// Include original, and exclude sub-path
						query.PathPrefix = append(query.PathPrefix, rootNode.Path)
						query.ExcludedPathPrefix = append(query.ExcludedPathPrefix, path.Join(rootNode.Path, pf.Prefix))
					} else {
						query.PathPrefix = append(query.PathPrefix, path.Join(rootNode.Path, pf.Prefix))
					}
				}
			} else {
				query.PathPrefix = append(query.PathPrefix, rootNode.Path)
			}
		}
		if ensurePrefixesTrailingSlash {
			for i, pf := range query.PathPrefix {
				query.PathPrefix[i] = strings.TrimRight(pf, "/") + "/"
			}
		}
		if firstLevelSearch && len(query.PathPrefix) > 0 {
			depth := len(strings.Split(strings.Trim(query.PathPrefix[0], "/"), "/"))
			query.PathDepth = int32(depth) + 1
		}

		sClient, err := s.getClient(ctx).Search(ctx, searchRequest)
		if err != nil {
			return err
		}

		defer sClient.CloseSend()

		log.Logger(ctx).Debug("Start Searching", zap.Any("Query", query))
		var ordered []string
		var resolved []*tree.Node

		// Create a worker pool with dedicated streamers
		type workItem struct {
			node *tree.Node
		}
		numWorkers := 5
		jobs := make(chan workItem)
		results := make(chan *tree.Node)
		var wg sync.WaitGroup

		// Start workers
		for i := 0; i < numWorkers; i++ {
			// Create dedicated streamer for each worker
			workerStreamer, err := treec.NodeProviderStreamerClient(ctx).ReadNodeStream(ctx)
			if err != nil {
				return err
			}
			defer workerStreamer.CloseSend()

			wg.Add(1)
			go func(streamer tree.NodeProviderStreamer_ReadNodeStreamClient) {
				defer wg.Done()
				for job := range jobs {
					node := job.node
					log.Logger(ctx).Debug("Search received " + node.Path)
					wrapperCtx, wrapperN, _ := inputFilter(ctx, node, "in-"+node.Uuid)
					if checkErr := router.WrappedCanApply(wrapperCtx, wrapperCtx, &tree.NodeChangeEvent{Type: tree.NodeChangeEvent_READ, Source: wrapperN}); checkErr != nil {
						log.Logger(ctx).Debug("Skipping node in search results", node.ZapPath(), zap.Error(checkErr))
						skipped++
						continue
					}
					log.Logger(ctx).Debug("READ permission checked for " + node.Path)

					if sErr := streamer.Send(&tree.ReadNodeRequest{Node: node.Clone()}); sErr != nil {
						log.Logger(ctx).Warn("Cannot send "+node.Path, zap.Error(sErr))
						skipped++
						continue
					}

					if nsR, e := streamer.Recv(); e == nil && nsR.GetNode() != nil {
						node = nsR.GetNode()
					} else {
						log.Logger(ctx).Warn("Cannot read "+node.Path, zap.Error(e))
						skipped++
						continue
					}

					for r, p := range nodesPrefixes {
						if strings.HasPrefix(node.Path, r+"/") || node.Path == r {
							_, filtered, outErr := outputFilter(ctx, node, "search-"+p)
							if outErr != nil {
								log.Logger(ctx).Warn("OutputFiltering node in search results has an error, this is unexpected", zap.Error(outErr))
								continue
							}
							if userWorkspaces != nil {
								for _, w := range userWorkspaces {
									if strings.HasPrefix(filtered.Path, w.Slug+"/") {
										filtered.MustSetMeta(common.MetaFlagWorkspaceRepoId, w.UUID)
										filtered.MustSetMeta(common.MetaFlagWorkspaceRepoDisplay, w.Label)
										filtered.MustSetMeta(common.MetaFlagWorkspaceSlug, w.Slug)
										filtered.MustSetMeta(common.MetaFlagWorkspaceScope, w.Scope.String())
										filtered.MustSetMeta(common.MetaFlagWorkspaceDescription, w.Description)
									}
								}
							}
							log.Logger(ctx).Debug("Append result " + filtered.Path)
							if filterReserved {
								results <- filtered.WithoutReservedMetas()
							} else {
								results <- filtered
							}
						}
					}
				}
			}(workerStreamer)
		}

		// Start result collector
		resultsDone := make(chan struct{})
		go func() {
			for n := range results {
				resolved = append(resolved, n)
			}
			close(resultsDone)
		}()

		// Send jobs to workers
		for {
			resp, rErr := sClient.Recv()
			if errors.IsStreamFinished(rErr) {
				break
			} else if rErr != nil {
				return rErr
			}
			if resp.GetFacet() != nil {
				facets = append(facets, resp.GetFacet())
				continue
			} else if resp.GetNode() != nil {
				ordered = append(ordered, resp.GetNode().GetUuid())
				jobs <- workItem{node: resp.GetNode().Clone()}
			} else if resp.GetPagination() != nil {
				pagination = rest2.PopulatePagination(searchRequest.GetFrom(), searchRequest.GetSize(), int32(resp.GetPagination().GetTotalHits()))
			}
		}

		// Close jobs channel and wait for workers to finish
		close(jobs)
		wg.Wait()
		close(results)
		<-resultsDone

		// Reorder results that may have been messed-up by concurrency!
		for _, id := range ordered {
			for _, n := range resolved {
				if n.GetUuid() == id {
					nn = append(nn, n)
					break
				}
			}
		}

		return nil

	})
	if err != nil {
		return
	}
	if skipped > 0 {
		log.Logger(ctx).Info("Search skipped some results", zap.Int("skipped", skipped))
	}

	if pagination == nil {
		pagination = &rest.Pagination{
			CurrentOffset: searchRequest.GetFrom(),
			Total:         int32(len(nn)),
		}
	}
	return
}
