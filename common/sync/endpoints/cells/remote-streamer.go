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

package cells

import (
	"context"
	"fmt"
	"math"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

// BulkLoadNodes streams ReadNode requests from server
func (c *Remote) BulkLoadNodes(ctx context.Context, nodes map[string]string) (map[string]interface{}, error) {
	newCtx, cli, err := c.Factory.GetNodeProviderStreamClient(ctx)
	if err != nil {
		return nil, err
	}
	sendCtx, can := context.WithTimeout(newCtx, 5*time.Minute)
	defer can()
	streamer, err := cli.ReadNodeStream(sendCtx)
	if err != nil {
		return nil, err
	}
	defer streamer.CloseSend()
	results := make(map[string]interface{}, len(nodes))
	for path, nodePath := range nodes {
		if e := streamer.Send(&tree.ReadNodeRequest{
			Node: &tree.Node{Path: c.rooted(nodePath)},
		}); e != nil {
			return nil, e
		}
		resp, err := streamer.Recv()
		if err != nil || !resp.Success {
			results[path] = errors.NotFound("not.found", "node not found")
		} else {
			out := resp.Node
			out.Path = c.unrooted(out.Path)
			results[path] = out
		}
	}
	return results, nil
}

// CreateNode creates folder, eventually resetting their UUID if the options RenewFolderUuids is set.
// If an indexation session is started, it stacks all Creates in memory and perform them only at Flush.
func (c *Remote) CreateNode(ctx context.Context, node *tree.Node, updateIfExists bool) (err error) {
	if c.session != nil {
		n := node.Clone()
		n.Path = c.rooted(n.Path)
		if c.Options.RenewFolderUuids {
			n.Uuid = ""
		}
		c.sessionsCreates = append(c.sessionsCreates, &tree.CreateNodeRequest{
			Node:           n,
			UpdateIfExists: updateIfExists,
		})
		return nil
	} else {
		return c.Abstract.CreateNode(ctx, node, updateIfExists)
	}
}

// StartSession starts an indexation session.
func (c *Remote) StartSession(ctx context.Context, rootNode *tree.Node, silent bool) (*tree.IndexationSession, error) {
	c.session = &tree.IndexationSession{Uuid: uuid.New()}
	return c.session, nil
}

// FlushSession sends all creates as a stream to the target server
func (c *Remote) FlushSession(ctx context.Context, sessionUuid string) error {
	if len(c.sessionsCreates) == 0 {
		return nil
	}
	ctx, cli, err := c.Factory.GetNodeReceiverStreamClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	sendCtx, can := context.WithTimeout(c.getContext(ctx), 5*time.Minute)
	defer can()
	streamer, err := cli.CreateNodeStream(sendCtx)
	if err != nil {
		return err
	}
	var creates []*tree.CreateNodeRequest

	cut := int(math.Min(300, float64(len(c.sessionsCreates))))
	creates = c.sessionsCreates[:cut]
	c.sessionsCreates = c.sessionsCreates[cut:]

	// do not close stream deferred as it is recursive
	for _, create := range creates {
		if e := streamer.Send(create); e != nil {
			streamer.CloseSend()
			return e
		}
		if resp, e := streamer.Recv(); e == nil {
			var indexed bool
			if er := resp.GetNode().GetMeta(common.MetaFlagIndexed, &indexed); er != nil || !indexed {
				log.Logger(ctx).Debug("Got create node response in session - register as RecentMkDirs", zap.Any("r", resp.GetNode()))
				c.RecentMkDirs = append(c.RecentMkDirs, resp.Node)
			}
		} else {
			streamer.CloseSend()
			return e
		}
	}
	streamer.CloseSend()
	if len(c.sessionsCreates) > 0 {
		<-time.After(500 * time.Millisecond)
		log.Logger(ctx).Info(fmt.Sprintf("[Remote Streamer] Flushing creates session, there are %d left to apply", len(c.sessionsCreates)))
		return c.FlushSession(ctx, sessionUuid)
	}
	return nil
}

// FinishSession flushes the session and closes it.
func (c *Remote) FinishSession(ctx context.Context, sessionUuid string) error {
	e := c.FlushSession(ctx, sessionUuid)
	c.session = nil
	c.Lock()
	c.RecentMkDirs = nil
	c.Unlock()
	return e
}
