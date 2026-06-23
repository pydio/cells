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

// Package cells provides endpoints for speaking either with a local server using a views.Router (and
// connecting to the local NATS registry), or a remote Cells server using a GRPC gateway client.
package cells

import (
	"context"
	"fmt"
	"io"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/gobwas/glob"
	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/bus/events"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type ObjectsClient interface {
	GetObject(ctx context.Context, node *tree.Node, requestData *models.GetRequestData) (io.ReadCloser, error)
	PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *models.PutRequestData) (models.ObjectInfo, error)
	CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *models.CopyRequestData) (models.ObjectInfo, error)
}

type clientProviderFactory interface {
	GetNodeProviderClient(context.Context) (context.Context, tree.NodeProviderClient, error)
	GetNodeReceiverClient(context.Context) (context.Context, tree.NodeReceiverClient, error)
	GetNodeChangesStreamClient(context.Context) (context.Context, tree.NodeChangesStreamerClient, error)
	GetObjectsClient(context.Context) (context.Context, ObjectsClient, error)

	GetNodeProviderStreamClient(context.Context) (context.Context, tree.NodeProviderStreamerClient, error)
	GetNodeReceiverStreamClient(context.Context) (context.Context, tree.NodeReceiverStreamClient, error)
}

type Options struct {
	model.EndpointOptions
	// If router is started in an independent process, call basic initialization to connect to registry.
	LocalInitRegistry bool
	// When starting endpoint within a known runtime, set runtime context (e.g. scheduler task)
	LocalRuntimeContext context.Context
	// If a sync is connecting two endpoint of a same server, we have to make sure to avoid Uuid collision
	RenewFolderUuids bool
	// Define supported metadata
	MetadataGlobs []glob.Glob
}

type Abstract struct {
	sync.Mutex
	Factory clientProviderFactory
	Source  model.PathSyncSource

	ClientUUID   string
	Root         string
	Options      Options
	RecentMkDirs []tree.N
	GlobalCtx    context.Context

	watchConn         chan model.WatchConnectionInfo
	updateSnapshot    model.PathSyncTarget
	watchCtxCancelled bool
}

// SetUpdateSnapshot registers a snapshot to be updated when events are received from server
func (c *Abstract) SetUpdateSnapshot(target model.PathSyncTarget) {
	c.updateSnapshot = target
}

// PatchUpdateSnapshot does nothing
func (c *Abstract) PatchUpdateSnapshot(ctx context.Context, patch interface{}) {
	// Do nothing - we assume Snapshot was updated directly during Watch when receiving events
}

// Convert micro errors to user readable errors
func (c *Abstract) parseMicroErrors(e error) error {
	/*
		todo v5 ?
		er := serviceerrors.FromError(e)
		if er.Code == 408 {
			return fmt.Errorf("cannot connect (408 Timeout): the gRPC port may not be correctly opened in the server")
		} else if strings.Contains(er.Detail, "connection refused") {
			return fmt.Errorf("cannot connect (connection refused): there may be an issue with the SSL certificate")
		} else if er.Code == 401 || er.Code == 403 {
			return fmt.Errorf("cannot connect (authorization error %d) : %s", er.Code, er.Detail)
		} else if er.Detail != "" {
			return fmt.Errorf(er.Detail)
		}
	*/
	return e
}

// LoadNode forwards call to cli.ReadNode
func (c *Abstract) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node tree.N, err error) {
	ctx, cli, err := c.Factory.GetNodeProviderClient(c.getContext(ctx))
	if err != nil {
		return nil, err
	}
	var x bool
	if len(extendedStats) > 0 {
		x = extendedStats[0]
	}
	resp, e := cli.ReadNode(ctx, &tree.ReadNodeRequest{
		Node:              &tree.Node{Path: c.rooted(path)},
		WithExtendedStats: x,
	})
	if e != nil {
		return nil, c.parseMicroErrors(e)
	}
	out := resp.Node
	out.Path = c.unrooted(resp.Node.Path)
	if !resp.Node.IsLeaf() && resp.Node.Size > 0 {
		// We know that index answers with total size of folder
		resp.Node.MustSetMeta(common.MetaRecursiveChildrenSize, resp.Node.Size)
	}
	return out, nil
}

// Walk uses cli.ListNodes() to browse nodes starting from a root (recursively or not).
// Temporary nodes are ignored.
// Workspaces nodes are ignored if they don't have the WorkspaceSyncable flag in their Metadata
func (c *Abstract) Walk(ctx context.Context, walkFunc model.WalkNodesFunc, root string, recursive bool) (err error) {
	log.Logger(c.GlobalCtx).Debug("Walking Router on " + c.rooted(root))
	ctx, cli, err := c.Factory.GetNodeProviderClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	send, can := context.WithTimeout(ctx, 10*time.Minute)
	defer can()
	s, e := cli.ListNodes(send, &tree.ListNodesRequest{
		Node:      &tree.Node{Path: c.rooted(root)},
		Recursive: recursive,
	})
	if e != nil {
		return e
	}
	for {
		resp, e := s.Recv()
		if e == io.EOF || e == io.ErrUnexpectedEOF || (e == nil && resp == nil) {
			break
		}
		if e != nil {
			return e
		}
		n := resp.Node
		if n.Etag == common.NodeFlagEtagTemporary {
			log.Logger(ctx).Debug("Temp nodes without ETAG YET API ROUTER ISSUE", zap.String("path", n.Path))
			continue
		}
		n.Path = c.unrooted(resp.Node.Path)
		if !n.IsLeaf() {
			n.Etag = "-1" // Force recomputing Etags for Folders
		}
		if c.Options.BrowseOnly {
			var s string
			if e := n.GetMeta(common.MetaFlagWorkspaceScope, &s); e == nil && s != "" {
				// This is a workspace or a cell. Check it has the syncable flag
				var canSync bool
				if e2 := n.GetMeta(common.MetaFlagWorkspaceSyncable, &canSync); e2 != nil || !canSync {
					log.Logger(ctx).Info("Skipping workspace as it is not flagged as syncable", n.ZapPath())
					continue
				}
			}
		}
		if er := walkFunc(n.Path, n, nil); er != nil {
			return er
		}
	}
	return
}

// GetCachedBranches implements CachedBranchProvider by loading branches in a MemDB
func (c *Abstract) GetCachedBranches(ctx context.Context, roots ...string) (model.PathSyncSource, error) {
	memDB := memory.NewMemDB()
	// Make sure to dedup roots
	rts := make(map[string]string)
	for _, root := range roots {
		rts[root] = root
	}
	for _, root := range rts {
		er := c.Walk(ctx, func(path string, node tree.N, err error) error {
			if err == nil {
				err = memDB.CreateNode(ctx, node, false)
			}
			return err
		}, root, true)
		if er != nil {
			return nil, er
		}
	}
	return memDB, nil
}

// Watch uses a GRPC connection to listen to events from the Grpc Gateway (wired to the Tree Service via a Router).
func (c *Abstract) Watch(ct context.Context, recursivePath string) (*model.WatchObject, error) {

	c.watchConn = make(chan model.WatchConnectionInfo)
	changes := make(chan *tree.NodeChangeEvent)
	finished := make(chan error)
	// Reset watchCtxCancelled if it's a Resume after a Pause
	c.watchCtxCancelled = false
	ctx, cancel := context.WithCancel(ct)

	obj := &model.WatchObject{
		EventInfoChan:  make(chan model.EventInfo),
		DoneChan:       make(chan bool, 1),
		ErrorChan:      make(chan error),
		ConnectionInfo: c.watchConn,
	}
	go func() {
		defer func() {
			close(obj.EventInfoChan)
			close(c.watchConn)
			cancel()
		}()
		for {
			select {
			case changeEvent := <-changes:
				if event, send := c.changeToEventInfo(changeEvent); send {
					obj.EventInfoChan <- event
				} else if changeEvent.Target != nil && changeEvent.Target.Etag == common.NodeFlagEtagTemporary &&
					(changeEvent.Type == tree.NodeChangeEvent_CREATE || changeEvent.Type == tree.NodeChangeEvent_UPDATE_CONTENT) {
					go c.deferEventUntilEtagReady(ctx, changeEvent, obj.EventInfoChan)
				}
			case er := <-finished:
				if !strings.Contains(er.Error(), "DeadlineExceeded") {
					log.Logger(c.GlobalCtx).Info("Connection finished " + er.Error())
				}
				if c.watchConn != nil {
					c.watchConn <- model.WatchDisconnected
				}
				<-time.After(5 * time.Second)
				log.Logger(c.GlobalCtx).Info("Restarting events watcher after 5s")
				go c.receiveEvents(ctx, changes, finished)
			case <-obj.DoneChan:
				log.Logger(c.GlobalCtx).Info("Stopping event watcher")
				c.watchCtxCancelled = true
				return
			}
		}
	}()

	go c.receiveEvents(ctx, changes, finished)

	if len(c.Options.MetadataGlobs) > 0 {
		_ = broker.SubscribeCancellable(ctx, common.TopicUserMetaDiffs, func(ctx context.Context, msg broker.Message) error {
			target := &idm.UpdateUserMetaEvent{}
			if ct, er := msg.Unmarshal(ctx, target); er == nil {
				ns := target.GetUserMeta().GetNamespace()
				for _, g := range c.Options.MetadataGlobs {
					if !g.Match(ns) {
						continue
					}
					if event, send := c.metaDiffToEventInfo(ct, target); send {
						obj.EventInfoChan <- event
					}
				}
			} else {
				return er
			}
			return nil
		}, broker.Queue("cells-endpoint-listener"))
	}

	return obj, nil
}

// deferEventUntilEtagReady waits for a temporary-etag node to be fully indexed, then re-injects
// the change event into the Watch pipeline. Bounded by ctx; warns and discards if etag never resolves.
func (c *Abstract) deferEventUntilEtagReady(ctx context.Context, change *tree.NodeChangeEvent, out chan<- model.EventInfo) {
	const (
		pollInterval = 500 * time.Millisecond
		maxWait      = 30 * time.Second
	)
	nodePath := change.Target.Path
	deadline := time.Now().Add(maxWait)
	for {
		select {
		case <-ctx.Done():
			return
		case <-time.After(pollInterval):
		}
		if time.Now().After(deadline) {
			log.Logger(c.GlobalCtx).Info("[Watch] Timed out waiting for temporary etag to resolve, file event dropped",
				zap.String("path", nodePath))
			return
		}
		n, err := c.LoadNode(ctx, c.unrooted(nodePath))
		if err != nil {
			continue
		}
		if n.GetEtag() == common.NodeFlagEtagTemporary || n.GetEtag() == "" {
			continue
		}
		// Etag is now real — clone the original event and patch only the etag so the path stays rooted
		resolved := proto.Clone(change).(*tree.NodeChangeEvent)
		resolved.Target.Etag = n.GetEtag()
		if event, send := c.changeToEventInfo(resolved); send {
			select {
			case out <- event:
			case <-ctx.Done():
			}
		}
		return
	}
}

// changeValidPath checks if a change event received is to be processed or ignored
func (c *Abstract) changeValidPath(n *tree.Node) bool {
	if n == nil {
		return true
	}
	if n.Etag == common.NodeFlagEtagTemporary {
		return false
	}
	if strings.Trim(n.Path, "/") == "" {
		return false
	}
	if path.Base(n.Path) == common.PydioSyncHiddenFile {
		return false
	}
	return true
}

// changeToEventInfo transforms a *tree.NodeChangeEvent to the sync model EventInfo.
func (c *Abstract) changeToEventInfo(change *tree.NodeChangeEvent) (event model.EventInfo, send bool) {

	if c.updateSnapshot != nil && change.Type == tree.NodeChangeEvent_CREATE && path.Base(change.Target.Path) == common.PydioSyncHiddenFile {
		// Special case for .pydio creations, to be updated in snapshot but ignored for event processed further
		if e := c.updateSnapshot.CreateNode(c.GlobalCtx, change.Target, true); e != nil {
			log.Logger(c.GlobalCtx).Warn("Failed to create node in snapshot", zap.Error(e))
		}
	}
	if !c.changeValidPath(change.Target) || !c.changeValidPath(change.Source) {
		return
	}
	send = change.Metadata == nil || change.Metadata[common.XPydioClientUuid] != c.ClientUUID
	if change.Type == tree.NodeChangeEvent_CREATE || change.Type == tree.NodeChangeEvent_UPDATE_CONTENT {
		log.Logger(c.GlobalCtx).Debug("Got Event " + change.Type.String() + " - " + change.Target.Path + " - " + change.Target.Etag)
		event, _ = events.TreeNodeChangeToModelEvent(change, time.Now(), c.Source)
		if c.updateSnapshot != nil {
			log.Logger(c.GlobalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Target.Path + "-" + change.Target.Etag)
			if e := c.updateSnapshot.CreateNode(c.GlobalCtx, change.Target, true); e != nil {
				log.Logger(c.GlobalCtx).Warn("Failed to create node in snapshot", zap.Error(e))
			}
		}
	} else if change.Type == tree.NodeChangeEvent_DELETE {
		log.Logger(c.GlobalCtx).Debug("Got Event " + change.Type.String() + " - " + change.Source.Path)
		event, _ = events.TreeNodeChangeToModelEvent(change, time.Now(), c.Source)
		if c.updateSnapshot != nil {
			log.Logger(c.GlobalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Source.Path)
			if e := c.updateSnapshot.DeleteNode(c.GlobalCtx, change.Source.Path); e != nil {
				log.Logger(c.GlobalCtx).Warn("Failed to delete node in snapshot", zap.Error(e))
			}
		}
	} else if change.Type == tree.NodeChangeEvent_UPDATE_PATH {
		log.Logger(c.GlobalCtx).Debug("Got Move Event " + change.Type.String() + " - " + change.Source.Path + " - " + change.Target.Path)
		event, _ = events.TreeNodeChangeToModelEvent(change, time.Now(), c.Source)
		if c.updateSnapshot != nil {
			log.Logger(c.GlobalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Source.Path)
			if e := c.updateSnapshot.MoveNode(c.GlobalCtx, change.Source.Path, change.Target.Path); e != nil {
				log.Logger(c.GlobalCtx).Warn("Failed to move node in snapshot", zap.Error(e))
			}
		}
	}
	return
}

func (c *Abstract) metaDiffToEventInfo(ct context.Context, ev *idm.UpdateUserMetaEvent) (event model.EventInfo, send bool) {
	m := ev.GetUserMeta()
	if m.GetResolvedNode() == nil {
		ct, cli, er := c.Factory.GetNodeProviderClient(ct)
		if er != nil {
			log.Logger(ct).Warn("Failed to create client in meta diff", zap.Error(er))
			return model.EventInfo{}, false
		}
		rsp, er := cli.ReadNode(ct, &tree.ReadNodeRequest{Node: &tree.Node{Uuid: m.GetNodeUuid()}})
		if er != nil {
			log.Logger(ct).Warn("Failed to resolve node in meta diff", zap.Error(er))
			return model.EventInfo{}, false
		}
		m.ResolvedNode = rsp.GetNode()
	}
	pa := m.ResolvedNode.GetPath()
	// Check it is under current root and fix the path
	if !strings.HasPrefix(pa, c.Root) {
		log.Logger(ct).Debug("Skipping node as path is not under root", zap.String("path", pa), zap.String("root", c.Root))
		return model.EventInfo{}, false
	}
	m.ResolvedNode.Path = c.unrooted(pa)

	log.Logger(ct).Debug("Sending meta event info", zap.Any("op", ev.GetOperation().String()), zap.Any("meta", m))
	modelEvent, _ := events.UserMetaToModelEvent(ev, time.Now(), c.Source)
	return modelEvent, true

}

// receiveEvents starts a streamer to the GRPC gateway
func (c *Abstract) receiveEvents(ctx context.Context, changes chan *tree.NodeChangeEvent, finished chan error) {
	ctx, cli, err := c.Factory.GetNodeChangesStreamClient(c.getContext(ctx))
	if err != nil {
		if !c.watchCtxCancelled {
			finished <- err
		}
		return
	}
	// sendCtx, can := context.WithTimeout(ctx, 10*time.Minute)
	// defer can()
	streamer, e := cli.StreamChanges(ctx, &tree.StreamChangesRequest{RootPath: c.Root})
	if e != nil {
		if !c.watchCtxCancelled {
			finished <- e
		}
		return
	}
	defer streamer.CloseSend()
	if c.watchConn != nil {
		c.watchConn <- model.WatchConnected
	}
	for {
		change, e := streamer.Recv()
		if c.watchCtxCancelled {
			return
		}
		if e != nil {
			log.Logger(c.GlobalCtx).Error("Stopping watcher on error" + e.Error())
			if !c.watchCtxCancelled {
				finished <- e
			}
			break
		}
		if change.Source != nil {
			change.Source.Path = c.unrooted(change.Source.Path)
		}
		if change.Target != nil {
			change.Target.Path = c.unrooted(change.Target.Path)
		}
		changes <- change
	}
}

// ComputeChecksum is not implemented
func (c *Abstract) ComputeChecksum(ctx context.Context, node tree.N) error {
	return errors.New("not.implemented")
	// if c.Options.BrowseOnly {
	// 	log.Logger(c.GlobalCtx).Debug("skipping checksum, storage is readonly", node.Zap())
	// 	return nil // ← Change this
	// }
	// return nil
}

// CreateNode is used for creating folders only
func (c *Abstract) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) (err error) {
	ctx, cli, err := c.Factory.GetNodeReceiverClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	n := node.AsProto().Clone()
	n.SetPath(c.rooted(n.Path))
	if c.Options.RenewFolderUuids {
		n.Uuid = ""
	}
	resp, e := cli.CreateNode(ctx, &tree.CreateNodeRequest{Node: n})

	if e == nil {
		var indexed bool
		if er := resp.GetNode().GetMeta(common.MetaFlagIndexed, &indexed); er != nil || !indexed {
			log.Logger(ctx).Debug("Create Node Response :", zap.Any("node", resp.GetNode()))
			c.Lock()
			c.RecentMkDirs = append(c.RecentMkDirs, n)
			c.Unlock()
		}
	}
	return e
}

// DeleteNode forwards call to the grpc gateway. For folders, the recursive deletion
// will happen on the gateway side. It may take some time, thus a request timeout of 5 minutes.
func (c *Abstract) DeleteNode(ctx context.Context, name string) (err error) {
	// Ignore .pydio files !
	if path.Base(name) == common.PydioSyncHiddenFile {
		log.Logger(ctx).Debug("[router] Ignoring " + name)
		return nil
	}
	c.flushRecentMkDirs(ctx)
	ctx, cliRead, err := c.Factory.GetNodeProviderClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	read, e := cliRead.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: c.rooted(name)}})
	if e != nil {
		if errors.Is(e, errors.StatusNotFound) {
			return nil
		} else {
			return e
		}
	}
	_, cliWrite, err := c.Factory.GetNodeReceiverClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	sendCtx, can := context.WithTimeout(ctx, 5*time.Minute)
	defer can()
	_, err = cliWrite.DeleteNode(sendCtx, &tree.DeleteNodeRequest{Node: proto.Clone(read.Node).(*tree.Node)})
	return
}

// MoveNode renames a file or folder and *blocks* until the node has been properly moved (sync)
func (c *Abstract) MoveNode(ct context.Context, oldPath string, newPath string) (err error) {
	c.flushRecentMkDirs(ct)
	ctx, cli, err := c.Factory.GetNodeReceiverClient(c.getContext(ct))
	if err != nil {
		return err
	}
	if from, err := c.LoadNode(ctx, oldPath); err == nil {
		to := from.AsProto().Clone()
		to.SetPath(c.rooted(newPath))
		from.SetPath(c.rooted(from.GetPath()))
		sendCtx, can := context.WithTimeout(ctx, 5*time.Minute)
		defer can()
		_, e := cli.UpdateNode(sendCtx, &tree.UpdateNodeRequest{From: from.AsProto(), To: to})
		if e == nil && to.GetType() == tree.NodeType_COLLECTION {
			c.readNodeBlocking(ctx, to)
		}
		return e
	} else {
		return err
	}
}

// GetWriterOn retrieves a WriteCloser wired to the S3 gateway to PUT a file.
func (c *Abstract) GetWriterOn(cancel context.Context, p string, targetSize int64, node tree.N) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {
	writeDone = make(chan bool, 1)
	writeErr = make(chan error, 1)
	if path.Base(p) == common.PydioSyncHiddenFile {
		log.Logger(c.GlobalCtx).Debug("[router] Ignoring " + p)
		defer close(writeDone)
		defer close(writeErr)
		return &NoopWriter{}, writeDone, writeErr, nil
	}
	c.flushRecentMkDirs(cancel)
	n := &tree.Node{Path: c.rooted(p)}
	reader, out := io.Pipe()

	ctx, cli, err := c.Factory.GetObjectsClient(c.getContext(cancel))
	if err != nil {
		return nil, writeDone, writeErr, err
	}
	meta := make(map[string]string)
	if md, ok := propagator.FromContextRead(ctx); ok {
		for k, v := range md {
			meta[k] = v
		}
	}
	go func() {
		defer func() {
			close(writeDone)
			close(writeErr)
		}()
		_, e := cli.PutObject(ctx, n, reader, &models.PutRequestData{Size: targetSize, Metadata: meta})
		if e != nil {
			fmt.Println("[ERROR]", "Cannot PutObject", e.Error())
			writeErr <- e
		}
		reader.Close()
	}()
	return out, writeDone, writeErr, nil

}

// GetReaderOn retrieves an io.ReadCloser from the S3 Get operation
func (c *Abstract) GetReaderOn(ctx context.Context, p string, node tree.N) (out io.ReadCloser, err error) {
	n := &tree.Node{Path: c.rooted(p)}
	ct, cli, err := c.Factory.GetObjectsClient(c.getContext(ctx))
	if err != nil {
		return nil, err
	}
	o, e := cli.GetObject(ct, n, &models.GetRequestData{StartOffset: 0, Length: -1})
	return o, e
}

// flushRecentMkDirs makes sure all CreateNode request that have been sent are indeed
// reflected in the server index.
func (c *Abstract) flushRecentMkDirs(ctx context.Context) {
	if len(c.RecentMkDirs) > 0 {
		log.Logger(ctx).Info("Cells Endpoint: checking that recently created folders are ready...")
		c.Lock()
		c.readNodesBlocking(ctx, c.RecentMkDirs)
		c.RecentMkDirs = nil
		c.Unlock()
		log.Logger(ctx).Info("Cells Endpoint: checking that recently created folders are ready - OK")
	}
}

// readNodeBlocking retries to read a node until it is available (it may habe just been indexed).
func (c *Abstract) readNodeBlocking(ctx context.Context, n tree.N) {
	// Block until move is correctly indexed
	model.Retry(func() error {
		ctx, cli, err := c.Factory.GetNodeProviderClient(c.getContext(ctx))
		if err != nil {
			return err
		}
		sendCtx, can := context.WithTimeout(ctx, 1*time.Second)
		defer can()
		_, e := cli.ReadNode(sendCtx, &tree.ReadNodeRequest{Node: n.AsProto(), StatFlags: []uint32{tree.StatFlagNone}})
		return e
	}, 1*time.Second, 10*time.Second)
}

// readNodesBlocking wraps many parallel calls to readNodeBlocking.
func (c *Abstract) readNodesBlocking(ctx context.Context, nodes []tree.N) {
	if len(nodes) == 0 {
		return
	}
	// Check target nodes are found in remote index
	wg := &sync.WaitGroup{}
	wg.Add(len(nodes))
	throttle := make(chan struct{}, 8) // for readNodesBlocking verification
	for _, n := range nodes {
		throttle <- struct{}{}
		go func(no tree.N) {
			defer func() {
				wg.Done()
				<-throttle
			}()
			c.readNodeBlocking(ctx, no)
		}(n)
	}
	wg.Wait()
}

// rooted returns the path with the root prefix
func (c *Abstract) rooted(p string) string {
	return path.Join(c.Root, p)
}

// unrooted returns the path without the root prefix
func (c *Abstract) unrooted(p string) string {
	return strings.TrimLeft(strings.TrimPrefix(p, c.Root), "/")
}

// getContext prepares a context (either from Background() or from the passed parent
// context that includes the XPydioClientUuid header.
func (c *Abstract) getContext(ctx ...context.Context) context.Context {
	var ct context.Context
	if len(ctx) > 0 {
		ct = ctx[0]
	} else {
		ct = context.Background()
	}
	ct = propagator.WithAdditionalMetadata(ct, map[string]string{
		common.XPydioClientUuid: c.ClientUUID,
	})
	return ct
}

// NoopWriter is a simple writer for ignoring contents
type NoopWriter struct{}

func (nw *NoopWriter) Write(p []byte) (n int, err error) {
	return len(p), nil
}

func (nw *NoopWriter) Close() error {
	return nil
}
