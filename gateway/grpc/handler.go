package grpc

import (
	"context"
	"io"
	"os"
	"strings"
	"sync"
	"time"

	hashiversion "github.com/hashicorp/go-version"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/service/serviceerrors"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

type TreeHandler struct {
	tree.UnimplementedNodeProviderServer
	tree.UnimplementedNodeReceiverServer
	tree.UnimplementedNodeChangesStreamerServer
	tree.UnimplementedNodeReceiverStreamServer
	tree.UnimplementedNodeProviderStreamerServer

	runtimeCtx context.Context
	router     nodes.Handler
	rOnce      sync.Once
	name       string
}

func (t *TreeHandler) Name() string {
	return t.name
}

func (t *TreeHandler) fixMode(n *tree.Node) {
	if n.IsLeaf() {
		n.Mode = int32(os.ModePerm)
	} else {
		n.Mode = int32(os.ModePerm & os.ModeDir)
		n.Size = 0
		n.MTime = time.Now().Unix()
	}
}

// syncAgentVersion tries to find User-Agent in context and parse a version like {appName}/X.X.X
func (t *TreeHandler) syncAgentVersion(ctx context.Context, appName string) (*hashiversion.Version, bool) {
	mm, o1 := propagator.FromContextRead(ctx)
	if !o1 {
		return nil, false
	}
	ua, o2 := mm["UserAgent"]
	if !o2 {
		return nil, false
	}
	if v, er := hashiversion.NewVersion(strings.TrimPrefix(ua, appName+"/")); er == nil {
		return v, true
	} else {
		return nil, false
	}
}

func (t *TreeHandler) ReadNodeStream(s tree.NodeProviderStreamer_ReadNodeStreamServer) error {
	router := t.getRouter()
	var err error
	for {
		r, e := s.Recv()
		if e != nil {
			if e != io.EOF && e != io.ErrUnexpectedEOF {
				s.SendMsg(e)
				err = e
			}
			break
		}
		resp, _ := router.ReadNode(s.Context(), r)
		if resp == nil {
			resp = &tree.ReadNodeResponse{Success: false}
		} else {
			resp.Success = true
		}
		sE := s.Send(resp)
		if sE != nil {
			// Error while sending
			break
		}
	}
	return err
}

func (t *TreeHandler) CreateNodeStream(s tree.NodeReceiverStream_CreateNodeStreamServer) error {
	router := t.getRouter()
	var err error
	for {
		r, e := s.Recv()
		if e != nil {
			if e != io.EOF {
				s.SendMsg(e)
				err = e
			}
			break
		}
		t.fixMode(r.Node)
		resp, er := router.CreateNode(s.Context(), r)
		if er != nil {
			s.SendMsg(er)
			err = er
			break
		}
		if err = s.Send(resp); err != nil {
			break
		}
	}
	return err //errors.BadRequest("not.implemented", "CreateNodeStream not implemented yet")
}

func (t *TreeHandler) UpdateNodeStream(tree.NodeReceiverStream_UpdateNodeStreamServer) error {
	return serviceerrors.BadRequest("not.implemented", "UpdateNodeStream not implemented yet")
}

func (t *TreeHandler) DeleteNodeStream(tree.NodeReceiverStream_DeleteNodeStreamServer) error {
	return serviceerrors.BadRequest("not.implemented", "DeleteNodeStream not implemented yet")
}

// ReadNode forwards to router
func (t *TreeHandler) ReadNode(ctx context.Context, request *tree.ReadNodeRequest) (*tree.ReadNodeResponse, error) {
	r, e := t.getRouter().ReadNode(ctx, request)
	response := &tree.ReadNodeResponse{}
	if e != nil {
		response.Success = false
		return response, e
	} else {
		response.Node = r.Node
		response.Success = r.Success
		return response, nil
	}
}

// ListNodes forwards to router
func (t *TreeHandler) ListNodes(request *tree.ListNodesRequest, stream tree.NodeProvider_ListNodesServer) error {

	ctx := stream.Context()
	ro := t.getRouter()

	var expectedHashing string
	if v, o := t.syncAgentVersion(ctx, "cells-sync"); o {
		ref, _ := hashiversion.NewVersion("0.9.2")
		if v.GreaterThan(ref) {
			expectedHashing = "v4"
		}
	}

	checkHashing := func(n *tree.Node) error {
		rr, er := ro.ReadNode(ctx, &tree.ReadNodeRequest{Node: n})
		if er != nil {
			return er
		}
		nodeHashing := rr.GetNode().GetStringMeta(common.MetaFlagHashingVersion)
		if nodeHashing != expectedHashing {
			log.Logger(ctx).Error("WARNING - Sync Client with wrong hashing constraints (client was " + expectedHashing + ", node " + rr.GetNode().GetPath() + " is " + nodeHashing + ")")
			if nodeHashing == "v4" { // server is v4, require app update
				return status.Errorf(codes.FailedPrecondition, "hashing formats differ, please make sure to update the sync application")
			} else {
				return status.Errorf(codes.FailedPrecondition, "hashing formats differ, please contact admin to rehash the datasource")
			}
		}
		return nil
	}

	isRoot := strings.Trim(request.GetNode().GetPath(), "/") == ""

	if !isRoot {
		// Check if requested node has expected hashing version
		if err := checkHashing(request.GetNode()); err != nil {
			return err
		}
	}

	st, e := ro.ListNodes(ctx, request)
	if e != nil {
		return e
	}
	defer st.CloseSend()

	for {
		r, e := st.Recv()
		if e == io.EOF || e == io.ErrUnexpectedEOF {
			break
		}
		if e != nil {
			return e
		}
		if isRoot {
			// When browsing root we are listing the workspaces, check their hashing version (based on their parent datasource)
			if err := checkHashing(r.GetNode()); err != nil {
				log.Logger(ctx).Warn("Ignoring node " + r.GetNode().GetPath() + " as hashing differs from expected")
				continue
			}
		}
		stream.Send(r)
	}

	return nil
}

// StreamChanges sends events to the client
func (t *TreeHandler) StreamChanges(req *tree.StreamChangesRequest, s tree.NodeChangesStreamer_StreamChangesServer) error {

	streamer, err := t.getRouter().StreamChanges(s.Context(), req)
	if err != nil {
		return err
	}
	defer streamer.CloseSend()
	for {
		r, e := streamer.Recv()
		if e != nil {
			break
		}
		s.Send(r)
	}

	return nil
}

// CreateNode is used for creating folders
func (t *TreeHandler) CreateNode(ctx context.Context, req *tree.CreateNodeRequest) (*tree.CreateNodeResponse, error) {
	resp := &tree.CreateNodeResponse{}
	t.fixMode(req.Node)
	r, e := t.getRouter().CreateNode(ctx, req)
	if e != nil {
		resp.Success = false
		return resp, e
	}
	resp.Node = r.Node
	resp.Success = r.Success
	return resp, nil
}

// UpdateNode is used for moving nodes paths
func (t *TreeHandler) UpdateNode(ctx context.Context, req *tree.UpdateNodeRequest) (*tree.UpdateNodeResponse, error) {
	resp := &tree.UpdateNodeResponse{}
	r, e := t.getRouter().UpdateNode(ctx, req)
	if e != nil {
		resp.Success = false
		return resp, e
	}
	resp.Success = r.Success
	resp.Node = r.Node
	return resp, nil
}

// DeleteNode is used to delete nodes
func (t *TreeHandler) DeleteNode(ctx context.Context, req *tree.DeleteNodeRequest) (*tree.DeleteNodeResponse, error) {
	resp := &tree.DeleteNodeResponse{}
	r, e := t.getRouter().DeleteNode(ctx, req)
	if e != nil {
		resp.Success = false
		return resp, e
	}
	resp.Success = r.Success
	return resp, nil
}

func (t *TreeHandler) getRouter() nodes.Handler {
	t.rOnce.Do(func() {
		t.router = compose.PathClient(
			t.runtimeCtx,
			nodes.WithSynchronousTasks(),
			nodes.WithHashesAsETags(),
		)
	})
	return t.router
}
