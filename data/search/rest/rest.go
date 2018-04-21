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

// Package rest provides a REST service for querying the search engine
package rest

import (
	"strings"

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/views"
)

type Handler struct {
	router *views.Router
	client tree.SearcherClient
}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"SearchService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

func (s *Handler) getRouter() *views.Router {
	if s.router == nil {
		s.router = views.NewStandardRouter(views.RouterOptions{WatchRegistry: true, AuditEvent: false})
	}
	return s.router
}

func (s *Handler) getClient() tree.SearcherClient {
	if s.client == nil {
		s.client = tree.NewSearcherClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_SEARCH, defaults.NewClient())
	}
	return s.client
}

func (s *Handler) Nodes(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var searchRequest tree.SearchRequest
	if err := req.ReadEntity(&searchRequest); err != nil {
		rsp.WriteError(500, err)
		return
	}

	query := searchRequest.Query
	if query == nil {
		rsp.WriteEntity(&rest.SearchResults{Total: 0})
		return
	}

	router := s.getRouter()

	var nodes []*tree.Node
	prefixes := []string{}
	nodesPrefixes := map[string]string{}
	var passedPrefix string
	var passedWorkspaceSlug string
	if len(query.PathPrefix) > 0 {
		passedPrefix = strings.Trim(query.PathPrefix[0], "/")
		if len(strings.Split(passedPrefix, "/")) == 1 {
			passedWorkspaceSlug = passedPrefix
			passedPrefix = ""
		}
	}

	err := router.WrapCallback(func(inputFilter views.NodeFilter, outputFilter views.NodeFilter) error {

		var userWorkspaces map[string]*idm.Workspace
		if len(passedPrefix) > 0 {
			// Passed prefix
			prefixes = append(prefixes, passedPrefix)

		} else {
			// Fill a context with current user info
			// (Let inputFilter apply the various necessary middlewares).
			loaderCtx, _ := inputFilter(ctx, &tree.Node{Path: ""}, "tmp")
			userWorkspaces = views.UserWorkspacesFromContext(loaderCtx)
			for _, w := range userWorkspaces {
				if len(passedWorkspaceSlug) > 0 && w.Slug != passedWorkspaceSlug {
					continue
				}
				if len(w.RootNodes) > 1 {
					for _, root := range w.RootNodes {
						prefixes = append(prefixes, w.Slug+"/"+root)
					}
				} else {
					prefixes = append(prefixes, w.Slug)
				}
			}
		}
		query.PathPrefix = []string{}

		var e error
		for _, p := range prefixes {
			rootNode := &tree.Node{Path: p}
			ctx, e = inputFilter(ctx, rootNode, "search-"+p)
			if e != nil {
				return e
			}
			log.Logger(ctx).Info("Filtered Node & Context", zap.String("path", rootNode.Path))
			nodesPrefixes[rootNode.Path] = p
			query.PathPrefix = append(query.PathPrefix, rootNode.Path)
		}

		sClient, err := s.getClient().Search(ctx, &searchRequest)
		if err != nil {
			return err
		}

		defer sClient.Close()

		for {
			resp, rErr := sClient.Recv()
			if resp == nil {
				break
			} else if rErr != nil {
				return err
			}
			respNode := resp.Node
			for r, p := range nodesPrefixes {
				if strings.HasPrefix(respNode.Path, r) {
					_, err := outputFilter(ctx, respNode, "search-"+p)
					log.Logger(ctx).Debug("Response", zap.String("node", respNode.Path))
					if err != nil {
						return err
					}
					if userWorkspaces != nil {
						for _, w := range userWorkspaces {
							if strings.HasPrefix(respNode.Path, w.Slug+"/") {
								respNode.SetMeta("repository_id", w.UUID)
								respNode.SetMeta("repository_display", w.Label)
							}
						}
					}
					nodes = append(nodes, respNode.WithoutReservedMetas())
				}
			}
		}
		return nil

	})

	if err != nil {
		log.Logger(ctx).Error("Query", zap.Error(err))
		rsp.WriteError(500, err)
		return
	}

	result := &rest.SearchResults{
		Results: nodes,
		Total:   int32(len(nodes)),
	}
	rsp.WriteEntity(result)

}
