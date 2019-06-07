package cells

import (
	"context"
	"time"

	"github.com/micro/go-micro/client"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/merger"
)

func (c *Remote) ProcessOperations(ctx context.Context, opType int, operations []interface{}) (responses []interface{}, e error) {

	if opType != int(merger.OpCreateFolder) {
		return responses, errors.New("OpType not supported")
	}

	ctx, cli, err := c.factory.GetNodeReceiverStreamClient(ctx)
	if err != nil {
		return responses, err
	}
	streamer, err := cli.CreateNodeStream(ctx, client.WithRequestTimeout(5*time.Minute))
	if err != nil {
		return responses, err
	}
	defer streamer.Close()

	for _, o := range operations {
		op := o.(merger.Operation)
		request := &tree.CreateNodeRequest{Node: &tree.Node{
			Path: c.rooted(op.GetRefPath()),
			Type: tree.NodeType_COLLECTION,
			Uuid: op.GetNode().Uuid,
		}}
		if e = streamer.Send(request); e != nil {
			break
		}
		if response, e := streamer.Recv(); e == nil {
			response.Node.Path = c.unrooted(response.Node.Path)
			responses = append(responses, response)
		} else {
			break
		}
	}

	return
}
