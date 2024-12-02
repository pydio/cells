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

package grpc

import (
	"context"
	"fmt"
	"runtime/debug"
	"slices"
	"strings"
	"time"

	"go.uber.org/zap"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/server"
	"github.com/pydio/cells/v5/common/proto/sync"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime/manager"
	cindex "github.com/pydio/cells/v5/common/storage/sql/index"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/data/source"
	index "github.com/pydio/cells/v5/data/source/index"
	"github.com/pydio/cells/v5/data/source/index/sessions"
)

// TreeServer definition.
type TreeServer struct {
	*source.Resolver[*object.DataSource]
	grpc_health_v1.HealthServer
	tree.UnimplementedNodeReceiverServer

	sessionStore sessions.DAO
	datasource   *object.DataSource

	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeReceiverStreamServer
	tree.UnimplementedNodeProviderStreamerServer
	tree.UnimplementedSessionIndexerServer
	object.UnimplementedResourceCleanerEndpointServer
	sync.UnimplementedSyncEndpointServer
	server.UnimplementedReadyzServer
}

/* =============================================================================
 *  Server public Methods
 * ============================================================================ */

func init() {}

// NewTreeServer factory.
func NewTreeServer(ds *object.DataSource) *TreeServer {

	// TODO
	// dao = cindex.NewFolderSizeCacheDAO(cindex.NewHiddenFileDuplicateRemoverDAO(dao))

	return &TreeServer{
		datasource:   ds,
		sessionStore: sessions.NewSessionMemoryStore(),
		HealthServer: health.NewServer(),
	}
}

func NewSharedTreeServer(resolver *source.Resolver[*object.DataSource]) *TreeServer {
	return &TreeServer{
		sessionStore: sessions.NewSessionMemoryStore(),
		Resolver:     resolver,
		HealthServer: health.NewServer(),
	}
}

func (s *TreeServer) getDAO(ctx context.Context, session string) (index.DAO, error) {
	dao, err := manager.Resolve[index.DAO](ctx)
	if err != nil {
		return nil, err
	}

	if session != "" {
		dao = index.WrapSessionDAO(session, dao)
	}

	return dao, nil
}

// setDataSourceMeta adds the datasource name as metadata, and eventually the internal flag
func (s *TreeServer) setDataSourceMeta(ctx context.Context, node tree.ITreeNode) error {
	ds := s.datasource
	var er error
	if s.datasource == nil {
		if ds, er = s.Resolve(ctx); er != nil {
			return er
		}
	}
	node.GetNode().MustSetMeta(common.MetaNamespaceDatasourceName, ds.GetName())
	node.GetNode().MustSetMeta(common.MetaNamespaceNodeName, node.GetName())
	if ds.IsInternal() {
		node.GetNode().MustSetMeta(common.MetaNamespaceDatasourceInternal, true)
	}
	return nil
}

// updateMeta simplifies the dao.SetNodeMeta call
func (s *TreeServer) updateMeta(ctx context.Context, dao index.DAO, node tree.ITreeNode, reqNode *tree.Node) (previousEtag string, contentChange bool, err error) {
	if node.GetNode().IsLeaf() {
		previousEtag = node.GetNode().GetEtag()
		if previousEtag != common.NodeFlagEtagTemporary {
			contentChange = true
		}
	}
	// Replace meta
	node.GetNode().SetSize(reqNode.Size)
	node.GetNode().SetEtag(reqNode.Etag)
	node.GetNode().SetType(reqNode.Type)
	node.GetNode().SetMTime(reqNode.MTime)
	node.GetNode().SetMode(reqNode.Mode)
	err = dao.UpdateNode(ctx, node)
	return
}

// CreateNode implementation for the TreeServer.
func (s *TreeServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (resp *tree.CreateNodeResponse, err error) {

	resp = &tree.CreateNodeResponse{}

	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in CreateNode: %s. Node path was %s", r, req.Node.Path)
			fmt.Printf("%s\n", debug.Stack())
		}
	}()

	dao, err := s.getDAO(ctx, req.GetIndexationSession())
	if err != nil {
		return nil, err
	}

	var previousEtag string
	eventType := tree.NodeChangeEvent_CREATE

	inSession := req.IndexationSession != ""

	reqUUID := req.GetNode().GetUuid()
	updateIfExists := req.GetUpdateIfExists() || !req.GetNode().IsLeaf() // For COLLECTION, always UpdateIfExists

	log.Logger(ctx).Debug("CreateNode", req.GetNode().Zap())

	// Updating node based on UUID
	if reqUUID != "" {
		node, err := dao.GetNodeByUUID(ctx, reqUUID)
		if errors.Is(err, errors.NodeNotFound) {
			// Ignore and carry on searching by path
		} else if err != nil {
			// Return error
			return nil, errors.Tag(err, errors.StatusForbidden)
		} else if updateIfExists {
			// Try updating meta
			if etag, content, err := s.updateMeta(ctx, dao, node, req.GetNode()); err != nil {
				return nil, errors.Tag(err, errors.StatusForbidden) // Forbidden(name, "Could not replace previous node: %s", err.Error())
			} else {
				previousEtag = etag
				if content && previousEtag != common.NodeFlagEtagTemporary {
					eventType = tree.NodeChangeEvent_UPDATE_CONTENT
				}
				node.GetNode().SetPath(req.GetNode().GetPath())
				if h := req.GetNode().GetStringMeta(common.MetaNamespaceHash); h != "" {
					node.GetNode().MustSetMeta(common.MetaNamespaceHash, h)
				}
				s.setDataSourceMeta(ctx, node)
				if err := s.UpdateParentsAndNotify(ctx, dao, req.GetNode().GetSize(), eventType, nil, node, req.IndexationSession); err != nil {
					return nil, errors.Tag(err, errors.StatusInternalServerError) // InternalServerError(common.ServiceDataIndex_, "Error while updating parents: %s", err.Error())
				}
				resp.Success = true
				resp.Node = node.GetNode()
				return resp, nil
			}
		} else {
			// Do not update if not explicitely set
			return nil, errors.WithMessagef(errors.StatusConflict, "A node with same UUID already exists. Pass updateIfExists parameter if you are sure to override. %v", err)
		}
	}

	reqPath := safePath(req.GetNode().GetPath())
	node, created, err := dao.GetOrCreateNodeByPath(ctx, reqPath, req.GetNode())
	if err != nil {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "error while inserting node: %w", err)
	}

	// Checking if we have a node with the same path
	if len(created) == 0 {
		if updateIfExists {
			if etag, content, err := s.updateMeta(ctx, dao, node, req.GetNode()); err != nil {
				return nil, errors.WithMessagef(errors.StatusForbidden, "Could not replace previous node: %w", err)
			} else {
				previousEtag = etag
				if content && previousEtag != common.NodeFlagEtagTemporary {
					eventType = tree.NodeChangeEvent_UPDATE_CONTENT
				}
			}
		} else {
			return nil, errors.WithMessage(errors.NodeIndexConflict, "node path already in use")
		}
	} else if len(created) > 1 && !updateIfExists && !inSession {
		// Special case : when not in indexation mode, if node creation
		// has triggered creation of parents, send notifications for parents as well
		for _, parent := range created[:len(created)-1] {
			s.setDataSourceMeta(ctx, parent)
			broker.MustPublish(ctx, common.TopicIndexChanges, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_CREATE,
				Target: parent.GetNode(),
			})
		}
	}

	/*
		if node == nil {
			node, err = dao.GetNode(ctx, path)
			if err != nil || node == nil {
				return nil, fmt.Errorf("could not retrieve node %s", reqPath)
			}
			node.GetNode().SetPath(reqPath)
		}
	*/

	s.setDataSourceMeta(ctx, node)

	// Propagate mime meta
	if mime := req.GetNode().GetStringMeta(common.MetaNamespaceMime); mime != "" {
		node.GetNode().MustSetMeta(common.MetaNamespaceMime, mime)
	}
	// Propagate hash meta
	if hash := req.GetNode().GetStringMeta(common.MetaNamespaceHash); hash != "" {
		node.GetNode().MustSetMeta(common.MetaNamespaceHash, hash)
	}

	if err := s.UpdateParentsAndNotify(ctx, dao, req.GetNode().GetSize(), eventType, nil, node, req.IndexationSession); err != nil {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "Error while updating parents: %w", err)
	}

	resp.Success = true
	resp.Node = node.GetNode()

	return resp, nil
}

// ReadNode implementation for the TreeServer.
func (s *TreeServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest) (resp *tree.ReadNodeResponse, err error) {
	resp = &tree.ReadNodeResponse{}

	defer track(log.Logger(ctx), "ReadNode", time.Now(), req, resp)

	var session = ""
	if md, has := propagator.CanonicalMeta(ctx, "x-indexation-session"); has {
		session = md
	}

	dao, err := s.getDAO(ctx, session)
	if err != nil {
		return nil, err
	}

	var node tree.ITreeNode

	if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {
		// Retrieve by UUID
		node, err = dao.GetNodeByUUID(ctx, req.GetNode().GetUuid())
		if err != nil {
			return nil, errors.WithMessagef(errors.NodeNotFound, "Could not find node by UUID with %s ", req.GetNode().GetUuid())
		}

		// In the case we've retrieve the node by uuid, we need to retrieve the path
		var path []string
		for pnode := range dao.GetNodesByMPaths(ctx, node.GetMPath().Parents()...) {
			path = append(path, pnode.GetName())
		}
		path = append(path, node.GetName())
		node.GetNode().SetPath(safePath(strings.Join(path, "/")))

	} else {
		// Retrieve By Path
		sp := safePath(req.GetNode().GetPath())
		node, err = dao.GetNodeByPath(ctx, sp)
		if err != nil {
			return nil, errors.WithMessagef(errors.NodeNotFound, "Could not retrieve path [%s], cause: %s", sp, err.Error())
		}
	}

	resp.Success = true

	s.setDataSourceMeta(ctx, node)

	if (req.WithExtendedStats || tree.StatFlags(req.StatFlags).FolderCounts()) && !node.GetNode().IsLeaf() {
		folderCount, fileCount := dao.GetNodeChildrenCounts(ctx, node.GetMPath(), false)
		node.GetNode().MustSetMeta(common.MetaFlagChildrenCount, folderCount+fileCount)
		node.GetNode().MustSetMeta(common.MetaFlagChildrenFolders, folderCount)
		node.GetNode().MustSetMeta(common.MetaFlagChildrenFiles, fileCount)
	}
	if tree.StatFlags(req.StatFlags).RecursiveCount() && !node.GetNode().IsLeaf() {
		total, _ := dao.GetNodeChildrenCounts(ctx, node.GetMPath(), true)
		node.GetNode().MustSetMeta(common.MetaFlagRecursiveCount, total)
	}

	resp.Node = node.GetNode()

	return resp, nil
}

// ListNodes implementation for the TreeServer.
func (s *TreeServer) ListNodes(req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesServer) (err error) {

	ctx := resp.Context()

	defer track(log.Logger(ctx), "ListNodes", time.Now(), req, resp)

	dao, err := s.getDAO(ctx, "")
	if err != nil {
		return err
	}

	if req.Ancestors && req.Recursive {
		return errors.WithMessagef(errors.StatusInternalServerError, "Please use either Recursive (children) or Ancestors (parents) flag, but not both.")
	}

	// Special case for  "Ancestors", node can have either Path or Uuid
	// There is no need to compute additional stats here (folderSize)
	if req.Ancestors {

		var node tree.ITreeNode
		var er error
		if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {

			if node, er = dao.GetNodeByUUID(ctx, req.GetNode().GetUuid()); er != nil {
				return errors.WithMessagef(errors.NodeNotFound, "could not find node by UUID with %s, cause: %s", req.GetNode().GetUuid(), er.Error())
			}

		} else {

			if node, er = dao.GetNodeByPath(ctx, safePath(req.GetNode().GetPath())); er != nil {
				return errors.WithMessagef(errors.NodeNotFound, "cannot get node at %s, cause: %s", req.GetNode().GetPath(), er.Error())
			}
		}

		// Get Ancestors tree and rebuild pathes for each
		var path []string
		var nodes []tree.ITreeNode
		for pnode := range dao.GetNodesByMPaths(ctx, node.GetMPath().Parents()...) {
			path = append(path, pnode.GetName())
			pnode.GetNode().SetPath(safePath(strings.Join(path, "/")))
			s.setDataSourceMeta(ctx, pnode)
			nodes = append(nodes, pnode)
		}
		slices.Reverse(nodes)
		for _, n := range nodes {
			if er := resp.Send(&tree.ListNodesResponse{Node: n.GetNode()}); er != nil {
				return er
			}
		}

	} else {
		reqNode := req.GetNode()
		if reqNode == nil {
			reqNode = &tree.Node{}
		}

		reqPath := safePath(reqNode.GetPath())
		recursiveCounts := tree.StatFlags(req.StatFlags).RecursiveCount()

		rootNode, er := dao.GetNodeByPath(ctx, reqPath)
		if er != nil {
			return errors.WithMessagef(errors.NodeNotFound, "cannot resolve path %s, cause: %s", reqPath, er.Error())
		}

		if req.WithCommits {
			if er = dao.ResyncDirtyEtags(ctx, rootNode); er != nil {
				log.Logger(ctx).Error("could not re-sync dirty etags", rootNode.GetNode().Zap(), zap.Error(er))
			}
		}

		// Additional filters
		metaFilter := tree.NewMetaFilter(reqNode)
		metaFilter.ParseType(req.FilterType)
		if !req.Recursive {
			metaFilter.AddSort(tree.MetaSortName, req.SortField, req.SortDirDesc)
		} else {
			metaFilter.AddSort(tree.MetaSortMPath, req.SortField, req.SortDirDesc)
		}
		_ = metaFilter.Parse()
		sqlFilters := metaFilter.HasSQLFilters()
		limitDepth := metaFilter.LimitDepth()

		var c chan interface{}
		if req.Recursive {
			c = dao.GetNodeTree(ctx, rootNode.GetMPath(), metaFilter)
		} else {
			c = dao.GetNodeChildren(ctx, rootNode.GetMPath(), metaFilter)
		}

		log.Logger(ctx).Debug("Listing nodes on DS with Filter", zap.Int32("req.FilterType", int32(req.FilterType)), zap.Bool("true", req.FilterType == tree.NodeType_COLLECTION))

		names := strings.Split(reqPath, "/")
		parentsCache := map[string]string{}
		var receivedErr error
		for obj := range c {
			node, isNode := obj.(tree.ITreeNode)
			if !isNode {
				var ok bool
				receivedErr, ok = obj.(error)
				if !ok {
					receivedErr = fmt.Errorf("unknown error")
				}
				break
			}

			if req.Recursive && node.GetNode().GetPath() == reqPath {
				continue
			}

			if sqlFilters {
				// If there are filters, listing is not regular - we have to check parents for each
				parents := node.GetMPath().Parents()
				var lookups []*tree.MPath
				// Fill in the wholes
				for _, p := range parents {
					if _, o := parentsCache[p.ToString()]; !o {
						lookups = append(lookups, p)
					}
				}
				// Load missing ones
				for pnode := range dao.GetNodesByMPaths(ctx, lookups...) {
					parentsCache[pnode.GetMPath().ToString()] = pnode.GetName()
				}
				var fullName []string
				// Build name
				for _, p := range parents {
					fullName = append(fullName, parentsCache[p.ToString()])
				}
				fullName = append(fullName, node.GetName())
				node.GetNode().SetPath(safePath(strings.Join(fullName, "/")))

			} else {
				// This assumes that all nodes are received in correct order from parents to leafs
				if int(node.GetLevel()) > cap(names) {
					newNames := make([]string, len(names), node.GetLevel())
					copy(newNames, names)
					names = newNames
				}

				names = names[0:node.GetLevel()]
				names[node.GetLevel()-1] = node.GetName()

				node.GetNode().SetPath(safePath(strings.Join(names, "/")))
			}

			s.setDataSourceMeta(ctx, node)

			if !metaFilter.MatchForceGrep(node.GetName()) {
				continue
			}
			if limitDepth > 0 && int(node.GetLevel()) != limitDepth {
				continue
			}
			if recursiveCounts && !node.GetNode().IsLeaf() {
				total, _ := dao.GetNodeChildrenCounts(ctx, node.GetMPath(), true)
				node.GetNode().MustSetMeta(common.MetaFlagRecursiveCount, total)
			}
			if err := resp.Send(&tree.ListNodesResponse{Node: node.GetNode()}); err != nil {
				return err
			}
		}
		if receivedErr != nil {
			return receivedErr
		}
	}

	return nil
}

// UpdateNode implementation for the TreeServer.
func (s *TreeServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (resp *tree.UpdateNodeResponse, err error) {
	resp = &tree.UpdateNodeResponse{}

	defer track(log.Logger(ctx), "UpdateNode", time.Now(), req, resp)

	log.Logger(ctx).Debug("Entering UpdateNode")
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in UpdateNode: %s. Params From:%s, To:%s", r, req.From.Path, req.To.Path)
		}
		log.Logger(ctx).Debug("Finished UpdateNode")
	}()

	dao, err := s.getDAO(ctx, req.GetIndexationSession())
	if err != nil {
		return nil, err
	}

	reqFromPath := safePath(req.GetFrom().GetPath())
	reqToPath := safePath(req.GetTo().GetPath())

	var pathTo *tree.MPath
	var nodeFrom, nodeTo tree.ITreeNode

	nodeTo = tree.NewTreeNode(reqToPath)

	if nodeFrom, err = dao.GetNodeByPath(ctx, reqFromPath); err != nil {
		return nil, errors.WithMessagef(errors.NodeNotFound, "Could not retrieve node %s", req.From.Path)
	}

	if cache, o := dao.(cindex.CacheDAO); o {

		pathTo, nodeTo, err = cache.PathCreateNoAdd(ctx, reqToPath)

	} else {
		if nodeTo, _, err = dao.GetOrCreateNodeByPath(ctx, reqToPath, nil); err != nil {
			return nil, errors.WithMessagef(errors.NodeNotFound, "Could not retrieve node %s", req.To.Path)
		}
		pathTo = nodeTo.GetMPath()

		// Legacy : to Avoid Duplicate error when using a CacheDAO - Flush now and after delete.
		_ = dao.Flush(ctx, false)

		// First of all, we delete the existing node
		if err = dao.DelNode(ctx, nodeTo); err != nil {
			return nil, errors.WithMessagef(errors.StatusInternalServerError, "Could not delete former to node at %s %v", req.To.Path, err)
		}

		_ = dao.Flush(ctx, false)
	}

	if err = dao.MoveNodeTree(ctx, nodeFrom, nodeTo); err != nil {
		return nil, err
	}

	nodeFrom.GetNode().SetPath(reqFromPath)
	s.setDataSourceMeta(ctx, nodeFrom)

	if newNode, err := dao.GetNodeByMPath(ctx, pathTo); err == nil && newNode != nil {
		newNode.GetNode().SetPath(reqToPath)
		s.setDataSourceMeta(ctx, newNode)
		if err := s.UpdateParentsAndNotify(ctx, dao, nodeFrom.GetNode().GetSize(), tree.NodeChangeEvent_UPDATE_PATH, nodeFrom, newNode, req.IndexationSession); err != nil {
			return nil, errors.WithMessagef(errors.StatusInternalServerError, "error while updating parents:  %s", err.Error())
		}
		resp.Node = newNode.GetNode()
	}

	resp.Success = true

	return resp, nil
}

// DeleteNode implementation for the TreeServer.
func (s *TreeServer) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest) (resp *tree.DeleteNodeResponse, err error) {

	resp = &tree.DeleteNodeResponse{}

	log.Logger(ctx).Debug("DeleteNode", zap.Any("request", req))
	defer track(log.Logger(ctx), "DeleteNode", time.Now(), req, resp)
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in DeleteNode: %s. Node path was %s", r, req.Node.Path)
		}
	}()

	dao, err := s.getDAO(ctx, req.GetIndexationSession())
	if err != nil {
		return nil, err
	}

	reqPath := safePath(req.GetNode().GetPath())

	node, err := dao.GetNodeByPath(ctx, reqPath)
	if err != nil {
		return nil, errors.WithMessagef(errors.NodeNotFound, "Could not retrieve node %s", reqPath)
	}
	node.GetNode().SetPath(reqPath)

	s.setDataSourceMeta(ctx, node)
	var childrenEvents []*tree.NodeChangeEvent
	if node.GetNode().GetType() == tree.NodeType_COLLECTION {
		c := dao.GetNodeTree(ctx, node.GetMPath())
		names := strings.Split(reqPath, "/")
		var treeErr error
		for obj := range c {
			child, ok := obj.(tree.ITreeNode)
			if !ok {
				treeErr, ok = obj.(error)
				if !ok {
					treeErr = fmt.Errorf("unknown error")
				}
				break
			}
			if child.GetName() == common.PydioSyncHiddenFile {
				continue
			}
			if int(child.GetLevel()) > cap(names) {
				newNames := make([]string, len(names), child.GetLevel())
				copy(newNames, names)
				names = newNames
			}
			names = names[0:child.GetLevel()]
			names[child.GetLevel()-1] = child.GetName()
			child.GetNode().SetPath(safePath(strings.Join(names, "/")))
			s.setDataSourceMeta(ctx, child)
			childrenEvents = append(childrenEvents, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_DELETE,
				Source: child.GetNode(),
				Silent: true,
			})
		}
		if treeErr != nil {
			return nil, treeErr
		}
	}

	if err := dao.DelNode(ctx, node); err != nil {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "Could not delete node at %s, cause: %s", reqPath, err.Error())
	}

	if err := s.UpdateParentsAndNotify(ctx, dao, node.GetNode().GetSize(), tree.NodeChangeEvent_DELETE, node, nil, req.IndexationSession); err != nil {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "Error while updating parents: %s", err.Error())
	}

	if len(childrenEvents) > 0 {
		var batcher sessions.SessionBatcher
		if req.IndexationSession != "" {
			sess, batch, err := s.sessionStore.ReadSession(req.IndexationSession)
			if err == nil && sess != nil {
				batcher = batch
			}
		}
		for _, ev := range childrenEvents {
			if batcher != nil {
				batcher.Notify(common.TopicIndexChanges, ev)
			} else {
				broker.MustPublish(ctx, common.TopicIndexChanges, ev)
			}
			<-time.After(100 * time.Microsecond)
		}

	}

	resp.Success = true
	return resp, nil
}

// OpenSession opens an indexer session.
func (s *TreeServer) OpenSession(ctx context.Context, req *tree.OpenSessionRequest) (resp *tree.OpenSessionResponse, err error) {
	log.Logger(ctx).Info("Opening Indexation Session " + req.GetSession().GetUuid())

	if er := s.sessionStore.PutSession(req.GetSession()); er != nil {
		return nil, er
	}
	return &tree.OpenSessionResponse{Session: req.GetSession()}, nil

}

// FlushSession allows to flsuh what's in the dao cache for the current session to ensure we are up to date moving on to the next phase of the indexation.
func (s *TreeServer) FlushSession(ctx context.Context, req *tree.FlushSessionRequest) (resp *tree.FlushSessionResponse, err error) {
	session, _, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Flushing Indexation Session " + req.GetSession().GetUuid())

		dao, err := s.getDAO(ctx, session.GetUuid())
		if err != nil {
			return nil, err
		}

		if err := dao.Flush(ctx, false); err != nil {
			log.Logger(ctx).Error("Error while flushing indexation Session "+req.GetSession().GetUuid(), zap.Error(err))
			return nil, err
		}
	}

	return &tree.FlushSessionResponse{Session: req.GetSession()}, nil
}

// CloseSession closes an indexer session.
func (s *TreeServer) CloseSession(ctx context.Context, req *tree.CloseSessionRequest) (resp *tree.CloseSessionResponse, err error) {

	session, batcher, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Closing Indexation Session " + req.GetSession().GetUuid())

		dao, err := s.getDAO(ctx, session.GetUuid())
		if err != nil {
			return nil, err
		}

		if err := dao.Flush(ctx, true); err != nil {
			log.Logger(ctx).Error("Error while closing (flush) indexation Session "+req.GetSession().GetUuid(), zap.Error(err))
			return nil, err
		}
		batcher.Flush(ctx, dao)

		if err := s.sessionStore.DeleteSession(req.GetSession()); err != nil {
			log.Logger(ctx).Error("Error while closing (DeleteSession) indexation Session "+req.GetSession().GetUuid(), zap.Error(err))
			return nil, err
		}
	}
	return &tree.CloseSessionResponse{Session: req.GetSession()}, nil

}

// CleanResourcesBeforeDelete ensure all resources are cleaned before deleting.
func (s *TreeServer) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest) (resp *object.CleanResourcesResponse, err error) {
	resp = &object.CleanResourcesResponse{}

	dao, err := s.getDAO(ctx, "")
	if err != nil {
		return nil, err
	}

	msg, err := dao.CleanResourcesOnDeletion(ctx)
	if err != nil {
		resp.Success = false
	} else {
		resp.Success = true
		resp.Message = msg
	}
	return resp, err
}

// UpdateParentsAndNotify update the parents nodes and notify the tree of the event that occurred.
func (s *TreeServer) UpdateParentsAndNotify(ctx context.Context, dao index.DAO, deltaSize int64, eventType tree.NodeChangeEvent_EventType, sourceNode tree.ITreeNode, targetNode tree.ITreeNode, sessionUuid string) error {

	var batcher sessions.SessionBatcher
	var session *tree.IndexationSession
	if sessionUuid != "" {
		sess, batch, err := s.sessionStore.ReadSession(sessionUuid)
		if err == nil && sess != nil {
			session = sess
			batcher = batch
		}
	}

	// Init Event from source/target parameters
	var event *tree.NodeChangeEvent
	mpathes := make(map[*tree.MPath]int64)
	if sourceNode == nil {
		// CREATE
		mpathes[targetNode.GetMPath()] = deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Target: targetNode.GetNode(),
		}
	} else if targetNode == nil {
		// DELETE
		mpathes[sourceNode.GetMPath()] = -deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.GetNode(),
		}
	} else {
		// UPDATE
		mpathFrom := sourceNode.GetMPath()
		mpathTo := targetNode.GetMPath()
		if mpathFrom.Parent().String() == mpathTo.Parent().String() {
			mpathes[mpathFrom] = 0
		} else {
			mpathes[mpathFrom] = -sourceNode.GetNode().GetSize()
			mpathes[mpathTo] = sourceNode.GetNode().GetSize()
		}
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.GetNode(),
			Target: targetNode.GetNode(),
		}
	}

	// Enrich Event Metadata field
	if md, ok := propagator.FromContextRead(ctx); ok {
		if event.Metadata == nil {
			event.Metadata = make(map[string]string, len(md))
		}
		for k, v := range md {
			for _, header := range common.XSpecialPydioHeaders {
				// May return special headers in lowercase, we don't want that.
				if k == strings.ToLower(header) {
					k = header
					break
				}
			}
			event.Metadata[k] = v
		}
	}

	// Publish either to batcher or to broker directly
	if batcher != nil && session != nil {
		event.Silent = session.Silent
		batcher.Notify(common.TopicIndexChanges, event)
	} else {
		broker.MustPublish(ctx, common.TopicIndexChanges, event)
	}

	return nil
}

func track(logger log.ZapLogger, fn string, start time.Time, req interface{}, resp interface{}) {
	logger.Debug(fn, zap.Duration("time", time.Since(start)), zap.Any("req", req), zap.Any("resp", resp))
}

func safePath(str string) string {
	return fmt.Sprintf("/%s", strings.TrimLeft(str, "/"))
}
