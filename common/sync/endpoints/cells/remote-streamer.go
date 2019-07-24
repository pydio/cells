package cells

import (
	"context"
	"time"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/micro/go-micro/errors"

	"github.com/pborman/uuid"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/proto/tree"
)

// BulkLoadNodes streams ReadNode requests from server
func (c *Remote) BulkLoadNodes(ctx context.Context, nodes map[string]string) (map[string]interface{}, error) {
	newCtx, cli, err := c.factory.GetNodeProviderStreamClient(ctx)
	if err != nil {
		return nil, err
	}
	streamer, err := cli.ReadNodeStream(newCtx, client.WithRequestTimeout(5*time.Minute))
	if err != nil {
		return nil, err
	}
	defer streamer.Close()
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
		if c.options.RenewFolderUuids {
			n.Uuid = ""
		}
		c.sessionsCreates = append(c.sessionsCreates, &tree.CreateNodeRequest{
			Node:           n,
			UpdateIfExists: updateIfExists,
		})
		return nil
	} else {
		return c.abstract.CreateNode(ctx, node, updateIfExists)
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
	ctx, cli, err := c.factory.GetNodeReceiverStreamClient(c.getContext(ctx))
	if err != nil {
		return err
	}
	streamer, err := cli.CreateNodeStream(c.getContext(ctx), client.WithRequestTimeout(5*time.Minute))
	if err != nil {
		return err
	}
	defer func() {
		streamer.Close()
		c.sessionsCreates = []*tree.CreateNodeRequest{}
	}()
	for _, create := range c.sessionsCreates {
		if e := streamer.Send(create); e != nil {
			return e
		}
		if resp, e := streamer.Recv(); e == nil {
			log.Logger(ctx).Debug("Got create node response in session", zap.Any("r", resp))
			c.recentMkDirs = append(c.recentMkDirs, resp.Node)
		} else {
			return e
		}
	}
	return nil
}

// FinishSession flushes the session and closes it.
func (c *Remote) FinishSession(ctx context.Context, sessionUuid string) error {
	c.FlushSession(ctx, sessionUuid)
	c.session = nil
	c.Lock()
	c.recentMkDirs = nil
	c.Unlock()
	return nil
}
