/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

	"github.com/gogo/protobuf/proto"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/memory"
	"github.com/pydio/cells/common/sync/model"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/views"
)

type objectsClient interface {
	GetObject(ctx context.Context, node *tree.Node, requestData *views.GetRequestData) (io.ReadCloser, error)
	PutObject(ctx context.Context, node *tree.Node, reader io.Reader, requestData *views.PutRequestData) (int64, error)
	CopyObject(ctx context.Context, from *tree.Node, to *tree.Node, requestData *views.CopyRequestData) (int64, error)
}

type clientProviderFactory interface {
	GetNodeProviderClient(context.Context) (context.Context, tree.NodeProviderClient, error)
	GetNodeReceiverClient(context.Context) (context.Context, tree.NodeReceiverClient, error)
	GetNodeChangesStreamClient(context.Context) (context.Context, tree.NodeChangesStreamerClient, error)
	GetObjectsClient(context.Context) (context.Context, objectsClient, error)

	GetNodeProviderStreamClient(context.Context) (context.Context, tree.NodeProviderStreamerClient, error)
	GetNodeReceiverStreamClient(context.Context) (context.Context, tree.NodeReceiverStreamClient, error)
}

type Options struct {
	model.EndpointOptions
	// If router is started in an independent process, call basic initialization to connect to registry.
	LocalInitRegistry bool
	// If a sync is connecting two endpoint of a same server, we have to make sure to avoid Uuid collision
	RenewFolderUuids bool
}

type abstract struct {
	sync.Mutex
	factory clientProviderFactory
	source  model.PathSyncSource

	clientUUID   string
	root         string
	options      Options
	recentMkDirs []*tree.Node

	watchConn         chan model.WatchConnectionInfo
	updateSnapshot    model.PathSyncTarget
	watchCtxCancelled bool
	globalCtx         context.Context
}

func (c *abstract) SetUpdateSnapshot(target model.PathSyncTarget) {
	c.updateSnapshot = target
}

func (c *abstract) PatchUpdateSnapshot(ctx context.Context, patch interface{}) {
	// Do nothing - we assume Snapshot was updated directly during Watch when receiving events
}

func (c *abstract) LoadNode(ctx context.Context, path string, extendedStats ...bool) (node *tree.Node, err error) {
	ctx, cli, err := c.factory.GetNodeProviderClient(c.getContext(ctx))
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
		return nil, e
	}
	out := resp.Node
	out.Path = c.unrooted(resp.Node.Path)
	if !resp.Node.IsLeaf() && resp.Node.Size > 0 {
		// We know that index answers with total size of folder
		resp.Node.SetMeta("RecursiveChildrenSize", resp.Node.Size)
	}
	return out, nil
}

func (c *abstract) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	log.Logger(c.globalCtx).Debug("Walking Router on " + c.rooted(root))
	ctx, cli, err := c.factory.GetNodeProviderClient(c.getContext())
	if err != nil {
		return err
	}
	s, e := cli.ListNodes(ctx, &tree.ListNodesRequest{
		Node:      &tree.Node{Path: c.rooted(root)},
		Recursive: recursive,
	}, client.WithRequestTimeout(2*time.Minute))
	if e != nil {
		return e
	}
	defer s.Close()
	for {
		resp, e := s.Recv()
		if e != nil {
			break
		}
		n := resp.Node
		if n.Etag == common.NODE_FLAG_ETAG_TEMPORARY {
			continue
		}
		n.Path = c.unrooted(resp.Node.Path)
		if !n.IsLeaf() {
			n.Etag = "-1" // Force recomputing Etags for Folders
		}
		walknFc(n.Path, n, nil)
	}
	return
}

func (c *abstract) GetCachedBranch(ctx context.Context, root string) model.PathSyncSource {
	memDB := memory.NewMemDB()
	c.Walk(func(path string, node *tree.Node, err error) {
		memDB.CreateNode(ctx, node, false)
	}, root, true)
	return memDB
}

func (c *abstract) Watch(recursivePath string) (*model.WatchObject, error) {

	c.watchConn = make(chan model.WatchConnectionInfo)
	changes := make(chan *tree.NodeChangeEvent)
	finished := make(chan error)
	ctx, cancel := context.WithCancel(c.globalCtx)

	obj := &model.WatchObject{
		EventInfoChan:  make(chan model.EventInfo),
		DoneChan:       make(chan bool, 1),
		ErrorChan:      make(chan error),
		ConnectionInfo: c.watchConn,
	}
	go func() {
		defer close(finished)
		defer close(obj.EventInfoChan)
		defer close(c.watchConn)
		for {
			select {
			case changeEvent := <-changes:
				if event, send := c.changeToEventInfo(changeEvent); send {
					obj.EventInfoChan <- event
				}
			case er := <-finished:
				log.Logger(c.globalCtx).Info("Connection finished " + er.Error())
				if c.watchConn != nil {
					c.watchConn <- model.WatchDisconnected
				}
				<-time.After(5 * time.Second)
				log.Logger(c.globalCtx).Info("Restarting events watcher after 5s")
				go c.receiveEvents(ctx, changes, finished)
			case <-obj.DoneChan:
				log.Logger(c.globalCtx).Info("Stopping event watcher")
				cancel()
				c.watchCtxCancelled = true
				return
			}
		}
	}()

	go c.receiveEvents(ctx, changes, finished)

	return obj, nil
}

func (c *abstract) changeValidPath(n *tree.Node) bool {
	if n == nil {
		return true
	}
	if n.Etag == common.NODE_FLAG_ETAG_TEMPORARY {
		return false
	}
	if strings.Trim(n.Path, "/") == "" {
		return false
	}
	if path.Base(n.Path) == common.PYDIO_SYNC_HIDDEN_FILE_META {
		return false
	}
	return true
}

func (c *abstract) changeToEventInfo(change *tree.NodeChangeEvent) (event model.EventInfo, send bool) {

	TimeFormatFS := "2006-01-02T15:04:05.000Z"
	now := time.Now().UTC().Format(TimeFormatFS)
	if c.updateSnapshot != nil && change.Type == tree.NodeChangeEvent_CREATE && path.Base(change.Target.Path) == common.PYDIO_SYNC_HIDDEN_FILE_META {
		// Special case for .pydio creations, to be updated in snapshot but ignored for event processed further
		c.updateSnapshot.CreateNode(c.globalCtx, change.Target, true)
	}
	if !c.changeValidPath(change.Target) || !c.changeValidPath(change.Source) {
		return
	}
	send = change.Metadata == nil || change.Metadata[common.XPydioClientUuid] != c.clientUUID
	if change.Type == tree.NodeChangeEvent_CREATE || change.Type == tree.NodeChangeEvent_UPDATE_CONTENT {
		log.Logger(c.globalCtx).Debug("Got Event " + change.Type.String() + " - " + change.Target.Path + " - " + change.Target.Etag)
		event = model.EventInfo{
			Type:     model.EventCreate,
			Path:     change.Target.Path,
			Etag:     change.Target.Etag,
			Time:     now,
			Folder:   !change.Target.IsLeaf(),
			Size:     change.Target.Size,
			Metadata: change.Metadata,
			Source:   c.source,
		}
		if c.updateSnapshot != nil {
			log.Logger(c.globalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Target.Path + "-" + change.Target.Etag)
			c.updateSnapshot.CreateNode(c.globalCtx, change.Target, true)
		}
	} else if change.Type == tree.NodeChangeEvent_DELETE {
		log.Logger(c.globalCtx).Debug("Got Event " + change.Type.String() + " - " + change.Source.Path)
		event = model.EventInfo{
			Type:     model.EventRemove,
			Path:     change.Source.Path,
			Time:     now,
			Metadata: change.Metadata,
			Source:   c.source,
		}
		if c.updateSnapshot != nil {
			log.Logger(c.globalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Source.Path)
			c.updateSnapshot.DeleteNode(c.globalCtx, change.Source.Path)
		}
	} else if change.Type == tree.NodeChangeEvent_UPDATE_PATH {
		log.Logger(c.globalCtx).Debug("Got Move Event " + change.Type.String() + " - " + change.Source.Path + " - " + change.Target.Path)
		event = model.EventInfo{
			Type:       model.EventSureMove,
			Path:       change.Target.Path,
			Folder:     !change.Target.IsLeaf(),
			Size:       change.Target.Size,
			Etag:       change.Target.Etag,
			MoveSource: change.Source,
			MoveTarget: change.Target,
			Metadata:   change.Metadata,
			Source:     c.source,
		}
		if c.updateSnapshot != nil {
			log.Logger(c.globalCtx).Debug("[Router] Updating Snapshot " + change.Type.String() + " - " + change.Source.Path)
			c.updateSnapshot.MoveNode(c.globalCtx, change.Source.Path, change.Target.Path)
		}
	}
	return
}

func (c *abstract) receiveEvents(ctx context.Context, changes chan *tree.NodeChangeEvent, finished chan error) {
	ctx, cli, err := c.factory.GetNodeChangesStreamClient(c.getContext(ctx))
	if err != nil {
		if !c.watchCtxCancelled {
			finished <- err
		}
		return
	}
	streamer, e := cli.StreamChanges(ctx, &tree.StreamChangesRequest{RootPath: c.root}, client.WithRequestTimeout(10*time.Minute))
	if e != nil {
		if !c.watchCtxCancelled {
			finished <- e
		}
		return
	}
	if c.watchConn != nil {
		c.watchConn <- model.WatchConnected
	}
	for {
		change, e := streamer.Recv()
		if c.watchCtxCancelled {
			return
		}
		if e != nil {
			log.Logger(c.globalCtx).Error("Stopping watcher on error" + e.Error())
			finished <- e
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

func (c *abstract) ComputeChecksum(node *tree.Node) error {
	return fmt.Errorf("not.implemented")
}

func (c *abstract) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {
	ctx, cli, err := c.factory.GetNodeReceiverClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	n := node.Clone()
	n.Path = c.rooted(n.Path)
	if c.options.RenewFolderUuids {
		n.Uuid = ""
	}
	_, e := cli.CreateNode(ctx, &tree.CreateNodeRequest{Node: n})
	if e == nil {
		c.Lock()
		c.recentMkDirs = append(c.recentMkDirs, n)
		c.Unlock()
	}
	return e
}

func (c *abstract) DeleteNode(ctx context.Context, name string) (err error) {
	// Ignore .pydio files !
	if path.Base(name) == common.PYDIO_SYNC_HIDDEN_FILE_META {
		log.Logger(ctx).Debug("[router] Ignoring " + name)
		return nil
	}
	c.flushRecentMkDirs()
	ctx, cliRead, err := c.factory.GetNodeProviderClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	read, e := cliRead.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: c.rooted(name)}})
	if e != nil {
		if errors.Parse(e.Error()).Code == 404 {
			return nil
		} else {
			return e
		}
	}
	_, cliWrite, err := c.factory.GetNodeReceiverClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	_, err = cliWrite.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: proto.Clone(read.Node).(*tree.Node)}, client.WithRequestTimeout(5*time.Minute))
	return
}

// MoveNode renames a file or folder and *blocks* until the node has been properly moved (sync)
func (c *abstract) MoveNode(ct context.Context, oldPath string, newPath string) (err error) {
	c.flushRecentMkDirs()
	ctx, cli, err := c.factory.GetNodeReceiverClient(c.getContext(ct))
	if err != nil {
		return err
	}
	if from, err := c.LoadNode(ctx, oldPath); err == nil {
		to := from.Clone()
		to.Path = c.rooted(newPath)
		from.Path = c.rooted(from.Path)
		_, e := cli.UpdateNode(ctx, &tree.UpdateNodeRequest{From: from, To: to}, client.WithRequestTimeout(5*time.Minute))
		if e == nil && to.Type == tree.NodeType_COLLECTION {
			c.readNodeBlocking(to)
		}
		return e
	} else {
		return err
	}
}

func (c *abstract) GetWriterOn(p string, targetSize int64) (out io.WriteCloser, writeDone chan bool, writeErr chan error, err error) {
	if targetSize == 0 {
		return nil, writeDone, writeErr, fmt.Errorf("cannot create empty files")
	}
	writeDone = make(chan bool, 1)
	writeErr = make(chan error, 1)
	if path.Base(p) == common.PYDIO_SYNC_HIDDEN_FILE_META {
		log.Logger(c.globalCtx).Debug("[router] Ignoring " + p)
		defer close(writeDone)
		defer close(writeErr)
		return &NoopWriter{}, writeDone, writeErr, nil
	}
	c.flushRecentMkDirs()
	n := &tree.Node{Path: c.rooted(p)}
	reader, out := io.Pipe()

	ctx, cli, err := c.factory.GetObjectsClient(c.getContext())
	if err != nil {
		return nil, writeDone, writeErr, err
	}
	meta := make(map[string]string)
	if md, ok := metadata.FromContext(ctx); ok {
		for k, v := range md {
			meta[k] = v
		}
	}
	go func() {
		defer func() {
			close(writeDone)
			close(writeErr)
		}()
		_, e := cli.PutObject(ctx, n, reader, &views.PutRequestData{Size: targetSize, Metadata: meta})
		if e != nil {
			fmt.Println("[ERROR]", "Cannot PutObject", e.Error())
			writeErr <- e
		}
		reader.Close()
	}()
	return out, writeDone, writeErr, nil

}

func (c *abstract) GetReaderOn(p string) (out io.ReadCloser, err error) {
	n := &tree.Node{Path: c.rooted(p)}
	ctx, cli, err := c.factory.GetObjectsClient(c.getContext())
	if err != nil {
		return nil, err
	}
	o, e := cli.GetObject(ctx, n, &views.GetRequestData{StartOffset: 0, Length: -1})
	return o, e
}

func (c *abstract) flushRecentMkDirs() {
	if len(c.recentMkDirs) > 0 {
		c.Lock()
		c.readNodesBlocking(c.recentMkDirs)
		c.recentMkDirs = []*tree.Node{}
		c.Unlock()
	}
}

func (c *abstract) readNodeBlocking(n *tree.Node) {
	// Block until move is correctly indexed
	model.Retry(func() error {
		ctx, cli, err := c.factory.GetNodeProviderClient(c.getContext())
		if err != nil {
			return err
		}
		_, e := cli.ReadNode(ctx, &tree.ReadNodeRequest{Node: n}, client.WithRequestTimeout(1*time.Second))
		return e
	}, 1*time.Second, 10*time.Second)
}

func (c *abstract) readNodesBlocking(nodes []*tree.Node) {
	if len(nodes) == 0 {
		return
	}
	// fmt.Println("Checking recent readNodesBlockings", nodes)
	// Check target nodes are found in remote index
	wg := &sync.WaitGroup{}
	wg.Add(len(nodes))
	for _, n := range nodes {
		go func() {
			defer wg.Done()
			c.readNodeBlocking(n)
		}()
	}
	wg.Wait()
}

func (c *abstract) rooted(p string) string {
	return path.Join(c.root, p)
}

func (c *abstract) unrooted(p string) string {
	return strings.TrimLeft(strings.TrimPrefix(p, c.root), "/")
}

func (c *abstract) getContext(ctx ...context.Context) context.Context {
	var ct context.Context
	if len(ctx) > 0 {
		ct = ctx[0]
	} else {
		ct = context.Background()
	}
	ct = context2.WithAdditionalMetadata(ct, map[string]string{
		common.XPydioClientUuid: c.clientUUID,
	})
	return ct
}

type NoopWriter struct{}

func (nw *NoopWriter) Write(p []byte) (n int, err error) {
	return len(p), nil
}

func (nw *NoopWriter) Close() error {
	return nil
}
