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

package views

import (
	"context"
	"io"
	"path"
	"strings"
	"time"

	"github.com/allegro/bigcache"
	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"github.com/pydio/minio-go"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/cache"
	"github.com/pydio/cells/common/views/models"
	json "github.com/pydio/cells/x/jsonx"
)

var (
	syncCache       *cache.InstrumentedCache
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

// SynchronousCacheHandler maintains a cache of the nodes during modifying operations to make listings more reactive.
// It is used by basic APIs (like WebDAV) for better visual performances and to create pseudo-synchronous APIs.
type SynchronousCacheHandler struct {
	AbstractHandler
}

func NewSynchronousCacheHandler() *SynchronousCacheHandler {
	s := &SynchronousCacheHandler{}

	if syncCache == nil {
		c := bigcache.DefaultConfig(30 * time.Second)
		c.CleanWindow = time.Minute
		c.Shards = 64
		c.MaxEntriesInWindow = 10 * 60 * 64
		c.MaxEntrySize = 200
		c.HardMaxCacheSize = 8
		syncCache = cache.NewInstrumentedCache(VIEWS_LIBRARY_NAME, c)
		defaults.Broker().Subscribe(common.TopicTreeChanges, func(publication broker.Publication) error {
			var event tree.NodeChangeEvent
			if e := proto.Unmarshal(publication.Message().Body, &event); e == nil && !event.Optimistic {
				if event.Type == tree.NodeChangeEvent_CREATE || event.Type == tree.NodeChangeEvent_UPDATE_PATH || event.Type == tree.NodeChangeEvent_DELETE {
					ctx := metadata.NewContext(context.Background(), publication.Message().Header)
					ctx = servicecontext.WithServiceName(ctx, VIEWS_LIBRARY_NAME)
					s.cacheEvent(ctx, &event)
				}
			}
			return nil
		})
	}
	return s
}

func (s *SynchronousCacheHandler) cacheEvent(ctx context.Context, event *tree.NodeChangeEvent) {
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
		syncCache.Delete(cacheNodePrefix + add.GetPath())
		dir := path.Dir(add.GetPath())
		if diff, ok := s.cacheDiff(ctx, dir); ok {
			if _, o := diff.Adds[add.GetPath()]; o {
				log.Logger(ctx).Debug("Clearing Add key from diff " + add.GetPath())
				delete(diff.Adds, add.GetPath())
				if len(diff.Adds)+len(diff.Deletes) == 0 {
					syncCache.Delete(cacheDiffPrefix + dir)
				} else {
					diffData, _ := json.Marshal(diff)
					syncCache.Set(cacheDiffPrefix+dir, diffData)
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
					syncCache.Delete(cacheDiffPrefix + dir)
				} else {
					diffData, _ := json.Marshal(diff)
					syncCache.Set(cacheDiffPrefix+dir, diffData)
				}
			}
		}
	}
}

func (s *SynchronousCacheHandler) cacheAdd(ctx context.Context, node *tree.Node) {
	d, _ := json.Marshal(node)
	log.Logger(ctx).Debug("Storing node to cache", node.Zap())
	syncCache.Set(cacheNodePrefix+node.GetPath(), d)
	// Update diff
	diff := NewCacheDiff()
	dir := path.Dir(node.GetPath())
	if diffDat, e := syncCache.Get(cacheDiffPrefix + dir); e == nil {
		json.Unmarshal(diffDat, &diff)
	}
	diff.Adds[node.GetPath()] = struct{}{}
	if _, previouslyDeleted := diff.Deletes[node.GetPath()]; previouslyDeleted {
		delete(diff.Deletes, node.GetPath())
	}
	diffDat, _ := json.Marshal(diff)
	syncCache.Set(cacheDiffPrefix+dir, diffDat)
}

func (s *SynchronousCacheHandler) cacheDel(ctx context.Context, node *tree.Node) {
	// Update diff
	diff := NewCacheDiff()
	p := node.GetPath()
	if path.Base(p) == common.PydioSyncHiddenFile {
		p = path.Dir(p)
	}
	dir := path.Dir(p)
	if diffDat, e := syncCache.Get(cacheDiffPrefix + dir); e == nil {
		json.Unmarshal(diffDat, &diff)
	}
	// Register as deleted
	diff.Deletes[p] = struct{}{}
	// Remove from cache if just previously added
	if _, previouslyAdded := diff.Adds[p]; previouslyAdded {
		delete(diff.Adds, p)
	}
	if _, e := syncCache.Get(cacheNodePrefix + dir); e == nil {
		syncCache.Delete(cacheNodePrefix + dir)
	}
	diffDat, _ := json.Marshal(diff)
	log.Logger(ctx).Debug("SyncCache: registering node as deleted ", node.Zap(), zap.String("dir", dir), zap.Any("diff", diff))
	syncCache.Set(cacheDiffPrefix+dir, diffDat)
}

func (s *SynchronousCacheHandler) cacheGet(ctx context.Context, path string) (*tree.Node, bool) {
	if c, o := syncCache.Get(cacheNodePrefix + path); o == nil {
		var dir *tree.Node
		if ee := json.Unmarshal(c, &dir); ee == nil {
			return dir, true
		}
	}
	return nil, false
}

func (s *SynchronousCacheHandler) cacheDiff(ctx context.Context, path string) (*cacheDiff, bool) {
	log.Logger(ctx).Debug("Looking for cacheDiff for " + path)
	if c, o := syncCache.Get(cacheDiffPrefix + path); o == nil {
		var diff *cacheDiff
		if ee := json.Unmarshal(c, &diff); ee == nil {
			log.Logger(ctx).Debug("SyncCache cacheDiff for "+path, zap.Any("adds", diff.Adds), zap.Any("deletes", diff.Deletes))
			return diff, true
		}
	}
	return nil, false
}

func (s *SynchronousCacheHandler) CreateNode(ctx context.Context, in *tree.CreateNodeRequest, opts ...client.CallOption) (*tree.CreateNodeResponse, error) {
	r, e := s.next.CreateNode(ctx, in, opts...)
	if e == nil {
		s.cacheAdd(ctx, r.GetNode())
	}
	return r, e
}

func (s *SynchronousCacheHandler) DeleteNode(ctx context.Context, in *tree.DeleteNodeRequest, opts ...client.CallOption) (*tree.DeleteNodeResponse, error) {
	r, e := s.next.DeleteNode(ctx, in, opts...)
	if e == nil {
		s.cacheDel(ctx, in.GetNode())
	}
	return r, e
}

func (s *SynchronousCacheHandler) UpdateNode(ctx context.Context, in *tree.UpdateNodeRequest, opts ...client.CallOption) (*tree.UpdateNodeResponse, error) {
	resp, err := s.next.UpdateNode(ctx, in, opts...)
	if err != nil {
		return nil, err
	}
	// Cache changes
	s.cacheDel(ctx, in.From)
	s.cacheAdd(ctx, resp.Node)
	return resp, nil
}

func (s *SynchronousCacheHandler) ListNodes(ctx context.Context, in *tree.ListNodesRequest, opts ...client.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	r, e := s.next.ListNodes(ctx, in, opts...)
	if e != nil {
		if _, o := s.cacheGet(ctx, in.GetNode().GetPath()); o {
			emptyMock := NewWrappingStreamer()
			go emptyMock.Close()
			return emptyMock, nil
		}
	} else if diff, o := s.cacheDiff(ctx, in.GetNode().GetPath()); o {
		wrap := NewWrappingStreamer()
		go func() {
			defer wrap.Close()
			for {
				resp, e := r.Recv()
				if e != nil {
					break
				}
				delCheck := resp.GetNode().GetPath()
				if _, deleted := diff.Deletes[delCheck]; deleted {
					continue
				}
				if _, added := diff.Adds[resp.GetNode().GetPath()]; added {
					delete(diff.Adds, resp.GetNode().GetPath())
				}
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

func (s *SynchronousCacheHandler) PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (int64, error) {
	w, e := s.next.PutObject(ctx, node, reader, requestData)
	if e == nil {
		newNode := node.Clone()
		newNode.Size = w
		s.cacheAdd(ctx, newNode)
	}
	return w, e
}

func (s *SynchronousCacheHandler) MultipartComplete(ctx context.Context, target *tree.Node, uploadID string, uploadedParts []minio.CompletePart) (minio.ObjectInfo, error) {
	log.Logger(ctx).Info("[SynchronousCache] MultipartComplete", target.Zap())
	o, e := s.next.MultipartComplete(ctx, target, uploadID, uploadedParts)
	if e == nil {
		updatedNode := target.Clone()
		updatedNode.Size = o.Size
		updatedNode.Etag = o.ETag
		updatedNode.MTime = o.LastModified.Unix()
		s.cacheAdd(ctx, updatedNode)
	}
	return o, e
}

func (s *SynchronousCacheHandler) ReadNode(ctx context.Context, in *tree.ReadNodeRequest, opts ...client.CallOption) (*tree.ReadNodeResponse, error) {
	resp, e := s.next.ReadNode(ctx, in, opts...)
	notFound := e != nil && (errors.Parse(e.Error()).Code == 404 || strings.Contains(e.Error(), " NotFound "))
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
