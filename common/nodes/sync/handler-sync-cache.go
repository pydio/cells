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

package sync

import (
	"context"
	"io"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/runtime"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/cache"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

var (
	cachePool *openurl.Pool[cache.Cache]
	//getCtxCache(ctx)       cache.Cache
	pkgOnce         sync.Once
	cacheNodePrefix = "__node__"
	cacheDiffPrefix = "__diff__"
)

type cacheDiff struct {
	Adds    map[string]struct{}
	Deletes map[string]struct{}
}

func NewCacheDiff() *cacheDiff {
	return &cacheDiff{Adds: make(map[string]struct{}), Deletes: make(map[string]struct{})}
}

func WithCache() nodes.Option {
	return func(options *nodes.RouterOptions) {
		if options.SynchronousCache {
			options.Wrappers = append(options.Wrappers, newCacheHandler())
		}
	}
}

// CacheHandler maintains a cache of the nodes during modifying operations to make listings more reactive.
// It is used by basic APIs (like WebDAV) for better visual performances and to create pseudo-synchronous APIs.
type CacheHandler struct {
	abstract.Handler
}

func (s *CacheHandler) Adapt(c nodes.Handler, options nodes.RouterOptions) nodes.Handler {
	s.AdaptOptions(c, options)
	return s
}

func newCacheHandler() *CacheHandler {
	s := &CacheHandler{}

	pkgOnce.Do(func() {
		cachePool = cache.MustOpenPool(runtime.CacheURL("nodes-cache", "evictionTime", "30s", "cleanWindow", "1m"))
		_, _ = broker.Subscribe(context.TODO(), common.TopicTreeChanges, func(ctx context.Context, publication broker.Message) error {
			var event tree.NodeChangeEvent
			if ctx, e := publication.Unmarshal(ctx, &event); e == nil && !event.Optimistic {
				if event.Type == tree.NodeChangeEvent_CREATE || event.Type == tree.NodeChangeEvent_UPDATE_PATH || event.Type == tree.NodeChangeEvent_DELETE {
					ctx = servicecontext.WithServiceName(ctx, nodes.ViewsLibraryName)
					s.cacheEvent(ctx, &event)
				}
			}
			return nil
		}, broker.WithCounterName("nodes-cache"))
	})

	return s
}

func getCtxCache(ctx context.Context) cache.Cache {
	if ca, er := cachePool.Get(ctx); er != nil {
		return cache.MustDiscard()
	} else {
		return ca
	}
}

func (s *CacheHandler) cacheEvent(ctx context.Context, event *tree.NodeChangeEvent) {
	log.Logger(ctx).Debug("Event received", zap.Any("e", event))
	var add, remove *tree.Node
	switch event.Type {
	case tree.NodeChangeEvent_CREATE:
		add = event.Target
	case tree.NodeChangeEvent_DELETE:
		remove = event.Source
	case tree.NodeChangeEvent_UPDATE_PATH:
		add = event.Target
		remove = event.Source
	}
	if add != nil {
		log.Logger(ctx).Debug("Clearing cache key " + add.GetPath())
		getCtxCache(ctx).Delete(cacheNodePrefix + add.GetPath())
		dir := path.Dir(add.GetPath())
		if diff, ok := s.cacheDiff(ctx, dir); ok {
			if _, o := diff.Adds[add.GetPath()]; o {
				log.Logger(ctx).Debug("Clearing Add key from diff " + add.GetPath())
				delete(diff.Adds, add.GetPath())
				if len(diff.Adds)+len(diff.Deletes) == 0 {
					getCtxCache(ctx).Delete(cacheDiffPrefix + dir)
				} else {
					diffData, _ := json.Marshal(diff)
					getCtxCache(ctx).Set(cacheDiffPrefix+dir, diffData)
				}
			}
		}
	}
	if remove != nil {
		dir := path.Dir(remove.GetPath())
		if diff, ok := s.cacheDiff(ctx, dir); ok {
			if _, o := diff.Deletes[remove.GetPath()]; o {
				log.Logger(ctx).Debug("Clearing Delete key from diff " + remove.GetPath())
				delete(diff.Deletes, remove.GetPath())
				if len(diff.Adds)+len(diff.Deletes) == 0 {
					getCtxCache(ctx).Delete(cacheDiffPrefix + dir)
				} else {
					diffData, _ := json.Marshal(diff)
					getCtxCache(ctx).Set(cacheDiffPrefix+dir, diffData)
				}
			}
		}
	}
}

func (s *CacheHandler) cacheAdd(ctx context.Context, node *tree.Node) {
	d, _ := json.Marshal(node)
	log.Logger(ctx).Debug("Storing node to cache", node.Zap())
	getCtxCache(ctx).Set(cacheNodePrefix+node.GetPath(), d)
	// Update diff
	diff := NewCacheDiff()
	dir := path.Dir(node.GetPath())
	if diffDat, ok := getCtxCache(ctx).GetBytes(cacheDiffPrefix + dir); ok {
		json.Unmarshal(diffDat, &diff)
	}
	diff.Adds[node.GetPath()] = struct{}{}
	delete(diff.Deletes, node.GetPath())
	diffDat, _ := json.Marshal(diff)
	getCtxCache(ctx).Set(cacheDiffPrefix+dir, diffDat)
}

func (s *CacheHandler) cacheDel(ctx context.Context, node *tree.Node) {
	// Update diff
	diff := NewCacheDiff()
	p := node.GetPath()
	if path.Base(p) == common.PydioSyncHiddenFile {
		p = path.Dir(p)
	}
	dir := path.Dir(p)
	if diffDat, ok := getCtxCache(ctx).GetBytes(cacheDiffPrefix + dir); ok {
		json.Unmarshal(diffDat, &diff)
	}
	// Register as deleted
	diff.Deletes[p] = struct{}{}
	// Remove from cache if just previously added
	delete(diff.Adds, p)

	getCtxCache(ctx).Delete(cacheNodePrefix + dir)

	diffDat, _ := json.Marshal(diff)
	log.Logger(ctx).Debug("SyncCache: registering node as deleted ", node.Zap(), zap.String("dir", dir), zap.Any("diff", diff))
	getCtxCache(ctx).Set(cacheDiffPrefix+dir, diffDat)
}

func (s *CacheHandler) cacheGet(ctx context.Context, path string) (*tree.Node, bool) {
	if c, ok := getCtxCache(ctx).GetBytes(cacheNodePrefix + path); ok {
		var dir *tree.Node
		if ee := json.Unmarshal(c, &dir); ee == nil {
			return dir, true
		}
	}
	return nil, false
}

func (s *CacheHandler) cacheDiff(ctx context.Context, path string) (*cacheDiff, bool) {
	log.Logger(ctx).Debug("Looking for cacheDiff for " + path)
	if c, ok := getCtxCache(ctx).GetBytes(cacheDiffPrefix + path); ok {
		var diff *cacheDiff
		if ee := json.Unmarshal(c, &diff); ee == nil {
			log.Logger(ctx).Debug("SyncCache cacheDiff for "+path, zap.Any("adds", diff.Adds), zap.Any("deletes", diff.Deletes))
			return diff, true
		}
	}
	return nil, false
}

func (s *CacheHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...grpc.CallOption) (*tree.CreateNodeResponse, error) {
	r, e := s.Next.CreateNode(ctx, in, opts...)
	if nodes.IsFlatStorage(ctx, "in") {
		return r, e
	}
	if e == nil {
		s.cacheAdd(ctx, r.GetNode())
	}
	return r, e
}

func (s *CacheHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...grpc.CallOption) (*tree.DeleteNodeResponse, error) {
	r, e := s.Next.DeleteNode(ctx, in, opts...)
	if e == nil && !nodes.IsFlatStorage(ctx, "in") {
		s.cacheDel(ctx, in.GetNode())
		time.Sleep(250 * time.Millisecond)
	}
	return r, e
}

func (s *CacheHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...grpc.CallOption) (*tree.UpdateNodeResponse, error) {
	if nodes.IsFlatStorage(ctx, "from") && nodes.IsFlatStorage(ctx, "to") {
		return s.Next.UpdateNode(ctx, in, opts...)
	}
	resp, err := s.Next.UpdateNode(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	// Cache changes
	s.cacheDel(ctx, in.From)
	s.cacheAdd(ctx, resp.Node)
	return resp, nil
}

func (s *CacheHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	r, e := s.Next.ListNodes(ctx, in, opts...)
	if nodes.IsFlatStorage(ctx, "in") {
		return r, e
	}
	if e != nil {
		if _, o := s.cacheGet(ctx, in.GetNode().GetPath()); o {
			emptyMock := nodes.NewWrappingStreamer(ctx)
			go emptyMock.CloseSend()
			return emptyMock, nil
		}
	} else if diff, o := s.cacheDiff(ctx, in.GetNode().GetPath()); o {
		wrap := nodes.NewWrappingStreamer(ctx)
		go func() {
			defer wrap.CloseSend()
			for {
				resp, e := r.Recv()
				if e != nil {
					break
				}
				delCheck := resp.GetNode().GetPath()
				if _, deleted := diff.Deletes[delCheck]; deleted {
					continue
				}
				delete(diff.Adds, resp.GetNode().GetPath())
				wrap.Send(resp)
			}
			for key := range diff.Adds {
				if child, ok := s.cacheGet(ctx, key); ok {
					wrap.Send(&tree.ListNodesResponse{Node: child})
				}
			}
		}()
		return wrap, nil
	}
	return r, e
}

func (s *CacheHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error) {
	w, e := s.Next.PutObject(ctx, node, reader, requestData)
	if nodes.IsFlatStorage(ctx, "in") {
		return w, e
	}
	if e == nil {
		newNode := node.Clone()
		newNode.Size = w.Size
		s.cacheAdd(ctx, newNode)
	}
	return w, e
}

func (s *CacheHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []models.MultipartObjectPart) (models.ObjectInfo, error) {
	log.Logger(ctx).Info("[SynchronousCache] MultipartComplete", target.Zap())
	o, e := s.Next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if nodes.IsFlatStorage(ctx, "in") {
		return o, e
	}
	if e == nil {
		updatedNode := target.Clone()
		updatedNode.Size = o.Size
		updatedNode.Etag = o.ETag
		updatedNode.MTime = o.LastModified.Unix()
		s.cacheAdd(ctx, updatedNode)
	}
	return o, e
}

func (s *CacheHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	resp, e := s.Next.ReadNode(ctx, in, opts...)
	if nodes.IsFlatStorage(ctx, "in") {
		return resp, e
	}
	notFound := e != nil && (errors.FromError(e).Code == 404 || strings.Contains(e.Error(), " NotFound "))
	tempo := e == nil && resp.Node.GetEtag() == "temporary"
	out, isCached := s.cacheGet(ctx, in.Node.GetPath())
	if e == nil && resp.Node != nil {
		// Check it was not recently removed
		if parentDiff, ok := s.cacheDiff(ctx, path.Dir(in.Node.GetPath())); ok {
			if _, o := parentDiff.Deletes[in.Node.GetPath()]; o {
				return nil, errors.NotFound("not.found.cache", " NotFound ")
			}
		}
	}
	if isCached && (notFound || tempo) {
		return &tree.ReadNodeResponse{
			Node:    out,
			Success: true,
		}, nil
	}

	return resp, e
}
