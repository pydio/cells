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
	"net/http"
	"runtime/debug"
	"strings"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/utils/mtree"
	"github.com/pydio/cells/data/source/index"
	"github.com/pydio/cells/data/source/index/sessions"
)

// TreeServer definition.
type TreeServer struct {
	DataSourceName string
	client         client.Client
	sessionStore   sessions.DAO
}

/* =============================================================================
 *  Server public Methods
 * ============================================================================ */

func init() {}

func getDAO(ctx context.Context, session string) index.DAO {
	if session != "" {
		if dao := index.GetDAOCache(session); dao != nil {
			return dao.(index.DAO)
		}

		return index.NewDAOCache(session, servicecontext.GetDAO(ctx).(index.DAO)).(index.DAO)
	}

	return servicecontext.GetDAO(ctx).(index.DAO)
}

// NewTreeServer factory.
func NewTreeServer(dsn string) *TreeServer {
	return &TreeServer{
		DataSourceName: dsn,
		client:         client.NewClient(),
		sessionStore:   sessions.NewSessionMemoryStore(),
	}
}

// CreateNode implementation for the TreeServer.
func (s *TreeServer) CreateNode(ctx context.Context, req *tree.CreateNodeRequest, resp *tree.CreateNodeResponse) (err error) {

	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in CreateNode: %s. Node path was %s", r, req.Node.Path)
			fmt.Printf("%s\n", debug.Stack())
		}
	}()

	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	var node *mtree.TreeNode
	var previousEtag string
	eventType := tree.NodeChangeEvent_CREATE

	inSession := (req.IndexationSession != "")

	// Checking if we have a node with the same uuid
	reqUUID := req.GetNode().GetUuid()
	update := req.GetUpdateIfExists()

	log.Logger(ctx).Debug("CreateNode", zap.Any("request", req))

	if !inSession && reqUUID != "" {
		if node, err = dao.GetNodeByUUID(reqUUID); err != nil {
			return errors.Forbidden(name, "Could not retrieve by uuid: %s", err.Error())
		} else if node != nil && update {
			eventType = tree.NodeChangeEvent_UPDATE_CONTENT
			if node.IsLeaf() {
				previousEtag = node.Etag
			}
			if err = dao.DelNode(node); err != nil {
				return errors.Forbidden(name, "Could not replace previous node: %s", err.Error())
			}
		} else if node != nil {
			return errors.New(name, fmt.Sprintf("A node with same UUID already exists. Pass updateIfExists parameter if you are sure to override. %v", err), http.StatusConflict)
		}
	}

	// Checking if we have a node with the same path
	reqPath := safePath(req.GetNode().GetPath())
	path, created, err := dao.Path(reqPath, true, req.GetNode())
	if err != nil {
		return errors.InternalServerError(name, "Error while inserting node: %s", err.Error())
	}

	if len(created) == 0 {
		if update {
			eventType = tree.NodeChangeEvent_UPDATE_CONTENT
			node = mtree.NewTreeNode()
			node.SetMPath(path...)
			if previousNode, e := dao.GetNode(path); e == nil && previousNode != nil {
				previousEtag = previousNode.Etag
			}
			if err = dao.DelNode(node); err != nil {
				return errors.Forbidden(name, "Could not replace previous node: %s", err.Error())
			}

			_, _, err = dao.Path(reqPath, true, req.GetNode())
			if err != nil {
				return errors.InternalServerError(name, "Error while inserting node: %s", err.Error())
			}
		} else {
			return errors.New(name, "Node path already in use", http.StatusConflict)
		}
	} else if len(created) > 1 && !update && req.IndexationSession == "" {
		// Special case : when not in indexation mode, if node creation
		// has triggered creation of parents, send notifications for parents as well
		for _, parent := range created[:len(created)-1] {
			parent.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)
			client.Publish(ctx, client.NewPublication(common.TOPIC_INDEX_CHANGES, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_CREATE,
				Target: parent.Node,
			}))
		}
	}

	node, err = dao.GetNode(path)
	if err != nil || node == nil {
		return fmt.Errorf("could not retrieve node %s", reqPath)
	}

	if previousEtag == common.NODE_FLAG_ETAG_TEMPORARY {
		eventType = tree.NodeChangeEvent_CREATE
	}

	// Updating Commits and Parent Nodes in Batch
	// TODO - change that
	if !inSession {
		newEtag := req.GetNode().GetEtag()
		if node.IsLeaf() && newEtag != common.NODE_FLAG_ETAG_TEMPORARY && (previousEtag == "" || newEtag != previousEtag) {
			if err := dao.PushCommit(node); err != nil {
				log.Logger(ctx).Error("Error while pushing commit for node", node.Zap(), zap.Error(err))
			}
		}
	}

	node.Path = reqPath
	node.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)

	if err := s.UpdateParentsAndNotify(ctx, dao, req.GetNode().GetSize(), eventType, nil, node, req.IndexationSession); err != nil {
		return errors.InternalServerError(common.SERVICE_DATA_INDEX_, "Error while updating parents: %s", err.Error())
	}

	resp.Success = true
	resp.Node = node.Node

	return nil
}

// ReadNode implementation for the TreeServer.
func (s *TreeServer) ReadNode(ctx context.Context, req *tree.ReadNodeRequest, resp *tree.ReadNodeResponse) error {

	defer track(ctx, "ReadNode", time.Now(), req, resp)

	dao := servicecontext.GetDAO(ctx).(index.DAO)
	name := servicecontext.GetServiceName(ctx)

	var node *mtree.TreeNode
	var err error

	if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {

		node, err = dao.GetNodeByUUID(req.GetNode().GetUuid())
		if err != nil || node == nil {
			return errors.NotFound(name, "Could not find node by UUID with %s ", req.GetNode().GetUuid())
		}

		// In the case we've retrieve the node by uuid, we need to retrieve the path
		var path []string
		for pnode := range dao.GetNodes(node.MPath.Parents()...) {
			path = append(path, pnode.Name())
		}
		path = append(path, node.Name())
		node.Path = safePath(strings.Join(path, "/"))

	} else {
		reqPath := safePath(req.GetNode().GetPath())

		path, _, err := dao.Path(reqPath, false)
		if err != nil {
			return errors.InternalServerError(name, "Error while retrieving path [%s], cause: %s", reqPath, err.Error())
		}
		if path == nil {
			//return errors.New("Could not retrieve file path")
			// Do not return error, or send a file not exists?
			return errors.NotFound(name, "Could not retrieve node %s", reqPath)
		}
		node, err = dao.GetNode(path)
		if err != nil {
			if len(path) == 1 && path[0] == 1 {
				// This is the root node, let's create it
				node = index.NewNode(&tree.Node{
					Uuid: "ROOT",
					Type: tree.NodeType_COLLECTION,
				}, path, []string{""})
				if err = dao.AddNode(node); err != nil {
					return err
				}
			} else {
				return errors.NotFound(name, "Could not retrieve node %s", reqPath)
			}
		}

		node.Path = reqPath
	}

	resp.Success = true

	node.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)

	if req.WithExtendedStats && !node.IsLeaf() {
		folderCount, fileCount := dao.GetNodeChildrenCounts(node.MPath)
		node.SetMeta("ChildrenCount", folderCount+fileCount)
		node.SetMeta("ChildrenFolders", folderCount)
		node.SetMeta("ChildrenFiles", fileCount)
	}

	if req.WithCommits && node.IsLeaf() {
		if commits, err := dao.ListCommits(node); err == nil {
			node.Commits = commits
		} else {
			log.Logger(ctx).Error("error while listing node commits", node.Zap(), zap.Error(err))
		}
	}

	resp.Node = node.Node

	return nil
}

// ListNodes implementation for the TreeServer.
func (s *TreeServer) ListNodes(ctx context.Context, req *tree.ListNodesRequest, resp tree.NodeProvider_ListNodesStream) error {

	defer track(ctx, "ListNodes", time.Now(), req, resp)

	dao := servicecontext.GetDAO(ctx).(index.DAO)
	name := servicecontext.GetServiceName(ctx)

	defer resp.Close()

	if req.Ancestors && req.Recursive {
		return errors.InternalServerError(name, "Please use either Recursive (children) or Ancestors (parents) flag, but not both.")
	}

	var c chan *mtree.TreeNode

	// Special case for  "Ancestors", node can have either Path or Uuid
	if req.Ancestors {

		var node *mtree.TreeNode
		var err error
		if req.GetNode().GetPath() == "" && req.GetNode().GetUuid() != "" {

			node, err = dao.GetNodeByUUID(req.GetNode().GetUuid())
			if err != nil {
				return errors.NotFound(name, "could not find node by UUID with %s, cause: %s", req.GetNode().GetUuid(), err.Error())
			}

		} else {

			reqPath := safePath(req.GetNode().GetPath())
			path, _, err := dao.Path(reqPath, false)
			if err != nil {
				return errors.InternalServerError(name, "cannot retrieve path for %s, cause: %s", reqPath, err.Error())
			}
			if path == nil {
				return errors.NotFound(name, "Could not retrieve node %s", reqPath)
			}
			node, err = dao.GetNode(path)
			if err != nil {
				return errors.InternalServerError(name, "cannot get node at %s, cause: %s", reqPath, err.Error())
			}
		}

		// Get Ancestors tree and rebuild pathes for each
		var path []string
		nodes := []*mtree.TreeNode{}
		for pnode := range dao.GetNodes(node.MPath.Parents()...) {
			path = append(path, pnode.Name())
			pnode.Path = safePath(strings.Join(path, "/"))
			nodes = append(nodes, pnode)
		}
		// Now Reverse Slice
		last := len(nodes) - 1
		for i := 0; i < len(nodes)/2; i++ {
			nodes[i], nodes[last-i] = nodes[last-i], nodes[i]
		}
		for _, n := range nodes {
			resp.Send(&tree.ListNodesResponse{Node: n.Node})
		}

	} else {
		reqNode := req.GetNode()
		reqPath := safePath(reqNode.GetPath())

		path, _, err := dao.Path(reqPath, false)
		if err != nil {
			return errors.InternalServerError(name, "cannot resolve path %s, cause: %s", reqPath, err.Error())
		}

		if path == nil {
			return errors.NotFound(name, "Could not retrieve node %s", reqPath)
		}

		if req.WithCommits {
			rootNode, _ := dao.GetNode(path)
			if err := dao.ResyncDirtyEtags(rootNode); err != nil {
				log.Logger(ctx).Error("could not re-sync dirty etags", rootNode.Zap(), zap.Error(err))
			}
		}

		if req.Recursive {
			c = dao.GetNodeTree(path)
		} else {
			c = dao.GetNodeChildren(path)
		}

		// Additional filters
		metaFilter := &MetaFilter{
			reqNode: reqNode,
		}
		hasFilter := metaFilter.parse()

		names := strings.Split(reqPath, "/")
		for node := range c {

			if req.FilterType == tree.NodeType_COLLECTION && node.Type == tree.NodeType_LEAF {
				continue
			}
			if req.Recursive && node.Path == reqPath {
				continue
			}
			if hasFilter && !metaFilter.Match(node.Name(), node.Node) {
				continue
			}

			if node.Level > cap(names) {
				newNames := make([]string, len(names), node.Level)
				copy(newNames, names)
				names = newNames
			}

			names = names[0:node.Level]
			names[node.Level-1] = node.Name()

			node.Path = safePath(strings.Join(names, "/"))

			node.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)

			if req.FilterType == tree.NodeType_LEAF && node.Type == tree.NodeType_COLLECTION {
				continue
			}

			if req.WithCommits && node.IsLeaf() {
				if commits, e := dao.ListCommits(node); e == nil {
					node.Commits = commits
				} else {
					log.Logger(ctx).Error("could not list node commits", node.Zap(), zap.Error(err))
				}
			}
			resp.Send(&tree.ListNodesResponse{Node: node.Node})
		}
	}

	return nil
}

// UpdateNode implementation for the TreeServer.
func (s *TreeServer) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest, resp *tree.UpdateNodeResponse) (err error) {
	defer track(ctx, "UpdateNode", time.Now(), req, resp)

	log.Logger(ctx).Debug("Entering UpdateNode")
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in UpdateNode: %s. Params From:%s, To:%s", r, req.From.Path, req.To.Path)
		}
		log.Logger(ctx).Debug("Finished UpdateNode")
	}()

	// dao := servicecontext.GetDAO(ctx).(index.DAO)
	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	reqFromPath := safePath(req.GetFrom().GetPath())
	reqToPath := safePath(req.GetTo().GetPath())

	var pathFrom, pathTo mtree.MPath
	var nodeFrom, nodeTo *mtree.TreeNode

	if pathFrom, _, err = dao.Path(reqFromPath, false); err != nil {
		return errors.InternalServerError(name, "cannot resolve pathFrom %s, cause: %s", reqFromPath, err.Error())
	}

	if pathTo, _, err = dao.Path(reqToPath, true); err != nil {
		return errors.InternalServerError(name, "cannot resolve pathTo %s, cause: %s", reqToPath, err.Error())
	}

	if pathFrom == nil {
		return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
	}
	if nodeFrom, err = dao.GetNode(pathFrom); err != nil {
		return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
	}

	if nodeTo, err = dao.GetNode(pathTo); err != nil {
		return errors.NotFound(name, "Could not retrieve node %s", req.From.Path)
	}

	// First of all, we delete the existing node
	if nodeTo != nil {
		if err = dao.DelNode(nodeTo); err != nil {
			return errors.InternalServerError(name, "Could not delete former to node at %s", req.To.Path)
		}
	}

	nodeFrom.Path = reqFromPath
	nodeTo.Path = reqToPath

	nodeFrom.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)
	nodeTo.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)

	if err = dao.MoveNodeTree(nodeFrom, nodeTo); err != nil {
		return err
	}

	newNode, err := dao.GetNode(pathTo)
	if err == nil && newNode != nil {
		newNode.Path = reqToPath
		newNode.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)

		if err := s.UpdateParentsAndNotify(ctx, dao, nodeFrom.GetSize(), tree.NodeChangeEvent_UPDATE_PATH, nodeFrom, newNode, req.IndexationSession); err != nil {
			return errors.InternalServerError(common.SERVICE_DATA_INDEX_, "error while updating parents:  %s", err.Error())
		}
	}

	resp.Success = true

	return nil
}

// DeleteNode implementation for the TreeServer.
func (s *TreeServer) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest, resp *tree.DeleteNodeResponse) (err error) {

	log.Logger(ctx).Debug("DeleteNode", zap.Any("request", req))
	defer track(ctx, "DeleteNode", time.Now(), req, resp)
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic recovered in DeleteNode: %s. Node path was %s", r, req.Node.Path)
		}
	}()

	dao := getDAO(ctx, req.GetIndexationSession())
	name := servicecontext.GetServiceName(ctx)

	reqPath := safePath(req.GetNode().GetPath())

	path, _, _ := dao.Path(reqPath, false)
	if path == nil {
		return errors.NotFound(name, "Could not retrieve node %s", reqPath)
	}

	node, err := dao.GetNode(path)
	if err != nil {
		return errors.NotFound(name, "Could not retrieve node %s", reqPath)
	}
	node.Path = reqPath
	node.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)
	var childrenEvents []*tree.NodeChangeEvent
	if node.Type == tree.NodeType_COLLECTION {
		c := dao.GetNodeTree(path)
		names := strings.Split(reqPath, "/")
		for child := range c {
			if child.Name() == common.PYDIO_SYNC_HIDDEN_FILE_META {
				continue
			}
			if child.Level > cap(names) {
				newNames := make([]string, len(names), child.Level)
				copy(newNames, names)
				names = newNames
			}
			names = names[0:child.Level]
			names[child.Level-1] = child.Name()
			child.Path = safePath(strings.Join(names, "/"))
			child.SetMeta(common.META_NAMESPACE_DATASOURCE_NAME, s.DataSourceName)
			childrenEvents = append(childrenEvents, &tree.NodeChangeEvent{
				Type:   tree.NodeChangeEvent_DELETE,
				Source: child.Node,
			})
		}
	}

	if err := dao.DelNode(node); err != nil {
		return errors.InternalServerError(name, "Could not delete node at %s, cause: %s", reqPath, err.Error())
	}

	if err := dao.DeleteCommits(node); err != nil {
		return errors.InternalServerError(name, "Could not delete node commits for %s, cause: %s", reqPath, err.Error())
	}

	if err := s.UpdateParentsAndNotify(ctx, dao, node.Size, tree.NodeChangeEvent_DELETE, node, nil, req.IndexationSession); err != nil {
		return errors.InternalServerError(common.SERVICE_DATA_INDEX_, "Error while updating parents: %s", err.Error())
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
				batcher.Notify(common.TOPIC_INDEX_CHANGES, ev)
			} else {
				client.Publish(ctx, client.NewPublication(common.TOPIC_INDEX_CHANGES, ev))
			}
		}

	}

	resp.Success = true
	return nil
}

// OpenSession opens an indexer session.
func (s *TreeServer) OpenSession(ctx context.Context, req *tree.OpenSessionRequest, resp *tree.OpenSessionResponse) error {
	log.Logger(ctx).Info("Opening Indexation Session " + req.GetSession().GetUuid())

	s.sessionStore.PutSession(req.GetSession())
	resp.Session = req.GetSession()
	return nil

}

// FlushSession allows to flsuh what's in the dao cache for the current session to ensure we are up to date moving on to the next phase of the indexation.
func (s *TreeServer) FlushSession(ctx context.Context, req *tree.FlushSessionRequest, resp *tree.FlushSessionResponse) error {
	session, _, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Flushing Indexation Session " + req.GetSession().GetUuid())

		dao := getDAO(ctx, session.GetUuid())
		dao.Flush(false)
	}

	resp.Session = req.GetSession()
	return nil
}

// CloseSession closes an indexer session.
func (s *TreeServer) CloseSession(ctx context.Context, req *tree.CloseSessionRequest, resp *tree.CloseSessionResponse) error {

	session, batcher, _ := s.sessionStore.ReadSession(req.GetSession().GetUuid())
	if session != nil {
		log.Logger(ctx).Info("Closing Indexation Session " + req.GetSession().GetUuid())

		dao := getDAO(ctx, session.GetUuid())

		dao.Flush(true)
		batcher.Flush(ctx, dao)

		s.sessionStore.DeleteSession(req.GetSession())
	}
	resp.Session = req.GetSession()
	return nil

}

// CleanResourcesBeforeDelete ensure all resources are cleant before deleting.
func (s *TreeServer) CleanResourcesBeforeDelete(ctx context.Context, request *object.CleanResourcesRequest, response *object.CleanResourcesResponse) error {
	dao := servicecontext.GetDAO(ctx).(index.DAO)
	err, msg := dao.CleanResourcesOnDeletion()
	if err != nil {
		response.Success = false
	} else {
		response.Success = true
		response.Message = msg
	}
	return err
}

// UpdateParentsAndNotify update the parents nodes and notify the tree of the event that occurred.
func (s *TreeServer) UpdateParentsAndNotify(ctx context.Context, dao index.DAO, deltaSize int64, eventType tree.NodeChangeEvent_EventType, sourceNode *mtree.TreeNode, targetNode *mtree.TreeNode, sessionUuid string) error {

	var batcher sessions.SessionBatcher
	if sessionUuid != "" {
		sess, batch, err := s.sessionStore.ReadSession(sessionUuid)
		if err == nil && sess != nil {
			batcher = batch
		}
	}

	//
	// INIT EVENTS AND PATHES TO UPDATE
	//
	var event *tree.NodeChangeEvent
	mpathes := make(map[*mtree.MPath]int64)
	if sourceNode == nil {
		// CREATE
		mpathes[&targetNode.MPath] = deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Target: targetNode.Node,
		}
	} else if targetNode == nil {
		// DELETE
		mpathes[&sourceNode.MPath] = -deltaSize
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.Node,
		}
	} else {
		// UPDATE
		mpathFrom := sourceNode.MPath
		mpathTo := targetNode.MPath
		if mpathFrom.Parent().String() == mpathTo.Parent().String() {
			mpathes[&mpathFrom] = 0
		} else {
			mpathes[&mpathFrom] = -sourceNode.Size
			mpathes[&mpathTo] = sourceNode.Size
		}
		event = &tree.NodeChangeEvent{
			Type:   eventType,
			Source: sourceNode.Node,
			Target: targetNode.Node,
		}
	}

	//
	// NOW SEND REAL EVENTS OR STACK THEM IN SESSION BATCHER
	//
	if event != nil {
		//pub := client.NewPublication(common.TOPIC_INDEX_CHANGES, event)
		if batcher != nil {
			event.Silent = true
			batcher.Notify(common.TOPIC_INDEX_CHANGES, event)
		} else {
			client.Publish(ctx, client.NewPublication(common.TOPIC_INDEX_CHANGES, event))
		}
	}

	/*
		for mp, delta := range mpathes {
			if batcher != nil {
				s.batcherUpdateParents(batcher, delta, *mp)
			} else {
				s.daoUpdateParents(dao, delta, *mp)
			}
		}
	*/

	return nil
}

func (s *TreeServer) batcherUpdateParents(batcher sessions.SessionBatcher, delta int64, mPath mtree.MPath) {

	mp := mPath.Parent()
	for len(mp) > 0 {
		batcher.UpdateMPath(mp, delta)
		mp = mp.Parent()
	}

}

// Batch update nodes on parents.
func (s *TreeServer) daoUpdateParents(dao index.DAO, delta int64, mPath mtree.MPath) error {

	b := dao.SetNodes("-1", delta)
	mp := mPath.Parent()
	for len(mp) > 0 {
		parent := mtree.NewTreeNode()
		parent.SetMPath(mp...)
		b.Send(parent)
		mp = mp.Parent()
	}
	return b.Close()

}

// CreateNodeStream implementation for the TreeServer.
func (s *TreeServer) CreateNodeStream(ctx context.Context, stream tree.NodeReceiverStream_CreateNodeStreamStream) error {
	var (
		err error
		req *tree.CreateNodeRequest
	)
	for {
		req, err = stream.Recv()
		if err != nil {
			break
		}

		rsp := &tree.CreateNodeResponse{}
		err = s.CreateNode(ctx, req, rsp)
		if err != nil {
			break
		}

		err = stream.Send(rsp)
		if err != nil {
			break
		}
	}

	stream.Close()
	return err
}

func track(ctx context.Context, fn string, start time.Time, req interface{}, resp interface{}) {
	log.Logger(ctx).Debug(fn, zap.Duration("time", time.Since(start)), zap.Any("req", req), zap.Any("resp", resp))
}

func safePath(str string) string {
	return fmt.Sprintf("/%s", strings.TrimLeft(str, "/"))
}

func dirWithInternalSeparator(filePath string) string {
	segments := strings.Split(filePath, "/")
	return strings.Join(segments[:len(segments)-1], "/")
}
