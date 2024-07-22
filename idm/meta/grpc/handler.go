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

package grpc

import (
	"context"
	"fmt"
	"strings"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/middleware/keys"
	"github.com/pydio/cells/v4/common/proto/idm"
	pbservice "github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/sql/resources"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/cache"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
	"github.com/pydio/cells/v4/idm/meta"
)

// Handler definition.
type Handler struct {
	idm.UnimplementedUserMetaServiceServer
	tree.UnimplementedNodeProviderStreamerServer
	pbservice.UnimplementedLoginModifierServer

	searchCachePool *openurl.Pool[cache.Cache]
}

func NewHandler(ctx context.Context) *Handler {
	h := &Handler{
		searchCachePool: cache.MustOpenPool(runtime.CacheURL(common.ServiceGrpcNamespace_ + common.ServiceUserMeta)),
	}
	go func() {
		<-ctx.Done()
		h.Stop()
	}()
	return h
}

func (h *Handler) Stop() {
	_ = h.searchCachePool.Close(context.Background())
}

// UpdateUserMeta adds, updates or deletes user meta.
func (h *Handler) UpdateUserMeta(ctx context.Context, request *idm.UpdateUserMetaRequest) (*idm.UpdateUserMetaResponse, error) {

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}

	response := &idm.UpdateUserMetaResponse{}
	namespaces, _ := dao.GetNamespaceDao().List(ctx)
	nodes := make(map[string]*tree.Node)
	sources := make(map[string]*tree.Node)
	for _, metaData := range request.MetaDatas {
		h.clearCacheForNode(ctx, metaData.NodeUuid)
		var prevValue string
		if request.Operation == idm.UpdateUserMetaRequest_PUT {
			// Check JsonValue is valid json
			var data interface{}
			if er := json.Unmarshal([]byte(metaData.GetJsonValue()), &data); er != nil {
				return nil, fmt.Errorf("make sure to use JSON format for metadata: %s", er.Error())
			}
			// ADD / UPDATE
			if newMeta, prev, err := dao.Set(ctx, metaData); err == nil {
				response.MetaDatas = append(response.MetaDatas, newMeta)
				prevValue = prev
			} else {
				return nil, err
			}
		} else {
			// DELETE
			if prev, err := dao.Del(ctx, metaData); err == nil {
				prevValue = prev
			} else {
				return nil, err
			}
		}
		var src *tree.Node
		if s, o := sources[metaData.NodeUuid]; o {
			src = s
		} else {
			// Create a fake container to publish just the changed metas and their previous value
			src = &tree.Node{Uuid: metaData.NodeUuid, MetaStore: make(map[string]string)}
			sources[metaData.NodeUuid] = src
		}
		// Attach previous value, and meta policies to Source node
		src.MetaStore[metaData.Namespace] = prevValue
		if pols, e := json.Marshal(metaData.Policies); e == nil {
			src.MetaStore["pydio:meta-policies"] = string(pols)
		}
		if metaData.ResolvedNode != nil {
			if metaData.ResolvedNode.MetaStore == nil {
				metaData.ResolvedNode.MetaStore = map[string]string{}
			}
			nodes[metaData.NodeUuid] = metaData.ResolvedNode
		}
	}

	go func() {
		bgCtx := propagator.NewBackgroundWithMetaCopy(ctx)
		bgCtx = propagator.ForkContext(bgCtx, ctx)
		subjects, _ := auth.SubjectsForResourcePolicyQuery(bgCtx, nil)

		for nodeId, source := range sources {
			// Reload Metas
			// Try to use resolved node or create fake one
			nCtx := bgCtx
			target := &tree.Node{Uuid: nodeId, MetaStore: make(map[string]string)}
			if resolved, ok := nodes[nodeId]; ok {
				target = resolved
				if len(resolved.AppearsIn) > 0 {
					nCtx = propagator.WithAdditionalMetadata(bgCtx, map[string]string{
						keys.CtxWorkspaceUuid: resolved.AppearsIn[0].WsUuid,
					})
				}
			}
			searchUserMetaAny, err := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{target.Uuid},
			})
			if err != nil {
				continue
			}

			resourceQueryAny, err := anypb.New(&pbservice.ResourcePolicyQuery{
				Subjects: subjects,
				Action:   pbservice.ResourcePolicyAction_READ,
			})
			if err != nil {
				continue
			}

			query := &pbservice.Query{
				SubQueries: []*anypb.Any{
					searchUserMetaAny, resourceQueryAny,
				},
				Operation: pbservice.OperationType_AND,
			}
			metas, e := dao.Search(ctx, query)
			if e != nil {
				continue
			}
			for _, val := range metas {
				if _, ok := namespaces[val.Namespace]; ok {
					target.MetaStore[val.Namespace] = val.JsonValue
				}
			}
			broker.MustPublish(nCtx, common.TopicMetaChanges, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_UPDATE_USER_META,
				Source: source,
				Target: target,
			})
		}
	}()

	return response, nil

}

// SearchUserMeta retrieves meta based on various criteria.
func (h *Handler) SearchUserMeta(request *idm.SearchUserMetaRequest, stream idm.UserMetaService_SearchUserMetaServer) error {

	ctx := stream.Context()

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	searchUserMetaAny, err := anypb.New(request)
	if err != nil {
		return err
	}

	request.ResourceQuery.Action = pbservice.ResourcePolicyAction_READ
	resourceQueryAny, err := anypb.New(request.ResourceQuery)
	if err != nil {
		return err
	}

	query := &pbservice.Query{
		SubQueries: []*anypb.Any{
			searchUserMetaAny, resourceQueryAny,
		},
		Operation: pbservice.OperationType_AND,
	}

	results, err := dao.Search(ctx, query)
	if err != nil {
		return err
	}
	for _, result := range results {
		if e := stream.Send(&idm.SearchUserMetaResponse{UserMeta: result}); e != nil {
			return e
		}
	}
	return nil

}

// ReadNodeStream Implements ReadNodeStream to be a meta provider.
func (h *Handler) ReadNodeStream(stream tree.NodeProviderStreamer_ReadNodeStreamServer) error {

	ctx := stream.Context()

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	bgCtx := propagator.NewBackgroundWithMetaCopy(ctx)
	//bgCtx = clientcontext.WithClientConn(bgCtx, clientcontext.GetClientConn(ctx))
	//bgCtx = middleware.WithRegistry(bgCtx, middleware.GetRegistry(ctx))
	bgCtx = propagator.ForkContext(bgCtx, ctx)
	subjects, e := auth.SubjectsForResourcePolicyQuery(bgCtx, nil)
	if e != nil {
		return e
	}

	for {
		req, er := stream.Recv()
		if req == nil {
			break
		}
		if er != nil {
			return er
		}
		node := req.Node
		var results []*idm.UserMeta
		var err error
		if r, ok := h.resultsFromCache(ctx, node.Uuid, subjects); ok {
			results = r
		} else {
			searchUserMetaAny, err := anypb.New(&idm.SearchUserMetaRequest{
				NodeUuids: []string{node.Uuid},
			})
			if err != nil {
				return err
			}

			resourceQueryAny, err := anypb.New(&pbservice.ResourcePolicyQuery{
				Subjects: subjects,
				Action:   pbservice.ResourcePolicyAction_READ,
			})
			if err != nil {
				return err
			}

			query := &pbservice.Query{
				SubQueries: []*anypb.Any{
					searchUserMetaAny, resourceQueryAny,
				},
				Operation: pbservice.OperationType_AND,
			}

			results, err = dao.Search(ctx, query)
			log.Logger(ctx).Debug(fmt.Sprintf("Got %d results for node", len(results)), node.ZapUuid())
			if err == nil {
				h.resultsToCache(ctx, node.Uuid, subjects, results)
			}
		}
		if err == nil && len(results) > 0 {
			for _, result := range results {
				node.MetaStore[result.Namespace] = result.JsonValue
			}
		}
		stream.Send(&tree.ReadNodeResponse{Node: node})
	}

	return nil
}

// UpdateUserMetaNamespace Update/Delete a namespace.
func (h *Handler) UpdateUserMetaNamespace(ctx context.Context, request *idm.UpdateUserMetaNamespaceRequest) (*idm.UpdateUserMetaNamespaceResponse, error) {

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}

	response := &idm.UpdateUserMetaNamespaceResponse{}
	namespaceDAO := dao.GetNamespaceDao()
	for _, metaNameSpace := range request.Namespaces {
		if err := namespaceDAO.Del(ctx, metaNameSpace); err != nil {
			return nil, err
		} else {
			broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
				Type:          idm.ChangeEventType_DELETE,
				MetaNamespace: metaNameSpace,
			})
		}
	}
	if request.Operation == idm.UpdateUserMetaNamespaceRequest_PUT {
		for _, metaNameSpace := range request.Namespaces {
			if err := namespaceDAO.Add(ctx, metaNameSpace); err != nil {
				return nil, err
			} else {
				broker.MustPublish(ctx, common.TopicIdmEvent, &idm.ChangeEvent{
					Type:          idm.ChangeEventType_CREATE,
					MetaNamespace: metaNameSpace,
				})
			}
			response.Namespaces = append(response.Namespaces, metaNameSpace)
		}
	}
	return response, nil

}

// ListUserMetaNamespace List all namespaces from underlying DAO.
func (h *Handler) ListUserMetaNamespace(request *idm.ListUserMetaNamespaceRequest, stream idm.UserMetaService_ListUserMetaNamespaceServer) error {

	ctx := stream.Context()

	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return err
	}

	namespaceDAO := dao.GetNamespaceDao()
	if results, err := namespaceDAO.List(ctx); err == nil {
		for _, result := range results {
			stream.Send(&idm.ListUserMetaNamespaceResponse{UserMetaNamespace: result})
		}
	}
	return nil
}

func (h *Handler) ModifyLogin(ctx context.Context, req *pbservice.ModifyLoginRequest) (*pbservice.ModifyLoginResponse, error) {
	dao, err := manager.Resolve[meta.DAO](ctx)
	if err != nil {
		return nil, err
	}

	return resources.ModifyLogin(ctx, dao, req)
}

func (h *Handler) resultsToCache(ctx context.Context, nodeId string, searchSubjects []string, results []*idm.UserMeta) {
	sc, _ := h.searchCachePool.Get(ctx)
	if sc == nil {
		return
	}
	key := fmt.Sprintf("%s-%s", nodeId, strings.Join(searchSubjects, "-"))
	//log.Logger(context.Background()).Info("User-Meta - Store Cache Key: " + key)
	if data, e := json.Marshal(results); e == nil {
		sc.Set(key, data)
	}
}

func (h *Handler) resultsFromCache(ctx context.Context, nodeId string, searchSubjects []string) (results []*idm.UserMeta, found bool) {
	sc, _ := h.searchCachePool.Get(ctx)
	if sc == nil {
		return
	}
	key := fmt.Sprintf("%s-%s", nodeId, strings.Join(searchSubjects, "-"))
	if data, ok := sc.GetBytes(key); ok {
		if er := json.Unmarshal(data, &results); er == nil {
			//log.Logger(context.Background()).Info("User-Meta - Got Cache Key: " + key)
			return results, true
		}
	}

	return
}

func (h *Handler) clearCacheForNode(ctx context.Context, nodeId string) {
	sc, _ := h.searchCachePool.Get(ctx)
	if sc == nil {
		return
	}
	if clears, e := sc.KeysByPrefix(nodeId + "-"); e == nil {
		for _, k := range clears {
			//log.Logger(context.Background()).Info("User-Meta - Clear Cache Key: " + k)
			_ = sc.Delete(k)
		}
	}

}
