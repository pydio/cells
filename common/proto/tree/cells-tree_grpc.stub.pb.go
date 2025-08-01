// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-client-stub v1.1.0
// - protoc             (unknown)
// source: cells-tree.proto

package tree

import (
	context "context"
	fmt "fmt"
	"github.com/pydio/cells/v5/common/errors"
	stubs "github.com/pydio/cells/v5/common/server/stubs"
	grpc "google.golang.org/grpc"
	io "io"
	time "time"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

type NodeProviderStub struct {
	NodeProviderServer
}

func (s *NodeProviderStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/tree.NodeProvider/ReadNode":
		resp, er := s.NodeProviderServer.ReadNode(ctx, args.(*ReadNodeRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeProviderStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeProvider/ListNodes":
		st := &NodeProviderStub_ListNodesStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.NodeProviderServer.ListNodes(i.(*ListNodesRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeProviderStub_ListNodesStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *NodeProviderStub_ListNodesStreamer) Send(response *ListNodesResponse) error {
	s.RespChan <- response
	return nil
}

type NodeProviderStreamerStub struct {
	NodeProviderStreamerServer
}

func (s *NodeProviderStreamerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeProviderStreamerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeProviderStreamer/ReadNodeStream":
		st := &NodeProviderStreamerStub_ReadNodeStreamStreamer{}
		st.Init(ctx)
		go s.NodeProviderStreamerServer.ReadNodeStream(st)
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeProviderStreamerStub_ReadNodeStreamStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *NodeProviderStreamerStub_ReadNodeStreamStreamer) Recv() (*ReadNodeRequest, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*ReadNodeRequest), nil
	} else {
		return nil, io.EOF
	}
}
func (s *NodeProviderStreamerStub_ReadNodeStreamStreamer) Send(response *ReadNodeResponse) error {
	s.RespChan <- response
	return nil
}

type NodeChangesStreamerStub struct {
	NodeChangesStreamerServer
}

func (s *NodeChangesStreamerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeChangesStreamerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeChangesStreamer/StreamChanges":
		st := &NodeChangesStreamerStub_StreamChangesStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.NodeChangesStreamerServer.StreamChanges(i.(*StreamChangesRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeChangesStreamerStub_StreamChangesStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *NodeChangesStreamerStub_StreamChangesStreamer) Send(response *NodeChangeEvent) error {
	s.RespChan <- response
	return nil
}

type NodeChangesReceiverStreamerStub struct {
	NodeChangesReceiverStreamerServer
}

func (s *NodeChangesReceiverStreamerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeChangesReceiverStreamerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeChangesReceiverStreamer/PostNodeChanges":
		st := &NodeChangesReceiverStreamerStub_PostNodeChangesStreamer{}
		st.Init(ctx)
		go s.NodeChangesReceiverStreamerServer.PostNodeChanges(st)
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeChangesReceiverStreamerStub_PostNodeChangesStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *NodeChangesReceiverStreamerStub_PostNodeChangesStreamer) Recv() (*NodeChangeEvent, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*NodeChangeEvent), nil
	} else {
		return nil, io.EOF
	}
}
func (s *NodeChangesReceiverStreamerStub_PostNodeChangesStreamer) Send(response *NodeChangeEvent) error {
	s.RespChan <- response
	return nil
}

type NodeReceiverStub struct {
	NodeReceiverServer
}

func (s *NodeReceiverStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/tree.NodeReceiver/CreateNode":
		resp, er := s.NodeReceiverServer.CreateNode(ctx, args.(*CreateNodeRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeReceiver/UpdateNode":
		resp, er := s.NodeReceiverServer.UpdateNode(ctx, args.(*UpdateNodeRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeReceiver/DeleteNode":
		resp, er := s.NodeReceiverServer.DeleteNode(ctx, args.(*DeleteNodeRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeReceiverStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeReceiverStreamStub struct {
	NodeReceiverStreamServer
}

func (s *NodeReceiverStreamStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeReceiverStreamStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeReceiverStream/CreateNodeStream":
		st := &NodeReceiverStreamStub_CreateNodeStreamStreamer{}
		st.Init(ctx)
		go s.NodeReceiverStreamServer.CreateNodeStream(st)
		return st, nil
	case "/tree.NodeReceiverStream/UpdateNodeStream":
		st := &NodeReceiverStreamStub_UpdateNodeStreamStreamer{}
		st.Init(ctx)
		go s.NodeReceiverStreamServer.UpdateNodeStream(st)
		return st, nil
	case "/tree.NodeReceiverStream/DeleteNodeStream":
		st := &NodeReceiverStreamStub_DeleteNodeStreamStreamer{}
		st.Init(ctx)
		go s.NodeReceiverStreamServer.DeleteNodeStream(st)
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeReceiverStreamStub_CreateNodeStreamStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *NodeReceiverStreamStub_CreateNodeStreamStreamer) Recv() (*CreateNodeRequest, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*CreateNodeRequest), nil
	} else {
		return nil, io.EOF
	}
}
func (s *NodeReceiverStreamStub_CreateNodeStreamStreamer) Send(response *CreateNodeResponse) error {
	s.RespChan <- response
	return nil
}

type NodeReceiverStreamStub_UpdateNodeStreamStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *NodeReceiverStreamStub_UpdateNodeStreamStreamer) Recv() (*UpdateNodeRequest, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*UpdateNodeRequest), nil
	} else {
		return nil, io.EOF
	}
}
func (s *NodeReceiverStreamStub_UpdateNodeStreamStreamer) Send(response *UpdateNodeResponse) error {
	s.RespChan <- response
	return nil
}

type NodeReceiverStreamStub_DeleteNodeStreamStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *NodeReceiverStreamStub_DeleteNodeStreamStreamer) Recv() (*DeleteNodeRequest, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*DeleteNodeRequest), nil
	} else {
		return nil, io.EOF
	}
}
func (s *NodeReceiverStreamStub_DeleteNodeStreamStreamer) Send(response *DeleteNodeResponse) error {
	s.RespChan <- response
	return nil
}

type SessionIndexerStub struct {
	SessionIndexerServer
}

func (s *SessionIndexerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/tree.SessionIndexer/OpenSession":
		resp, er := s.SessionIndexerServer.OpenSession(ctx, args.(*OpenSessionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.SessionIndexer/FlushSession":
		resp, er := s.SessionIndexerServer.FlushSession(ctx, args.(*FlushSessionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.SessionIndexer/CloseSession":
		resp, er := s.SessionIndexerServer.CloseSession(ctx, args.(*CloseSessionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *SessionIndexerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeEventsProviderStub struct {
	NodeEventsProviderServer
}

func (s *NodeEventsProviderStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeEventsProviderStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeEventsProvider/WatchNode":
		st := &NodeEventsProviderStub_WatchNodeStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.NodeEventsProviderServer.WatchNode(i.(*WatchNodeRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeEventsProviderStub_WatchNodeStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *NodeEventsProviderStub_WatchNodeStreamer) Send(response *WatchNodeResponse) error {
	s.RespChan <- response
	return nil
}

type SearcherStub struct {
	SearcherServer
}

func (s *SearcherStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *SearcherStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.Searcher/Search":
		st := &SearcherStub_SearchStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.SearcherServer.Search(i.(*SearchRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type SearcherStub_SearchStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *SearcherStub_SearchStreamer) Send(response *SearchResponse) error {
	s.RespChan <- response
	return nil
}

type NodeContentReaderStub struct {
	NodeContentReaderServer
}

func (s *NodeContentReaderStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeContentReaderStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeContentWriterStub struct {
	NodeContentWriterServer
}

func (s *NodeContentWriterStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeContentWriterStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeVersionerStub struct {
	NodeVersionerServer
}

func (s *NodeVersionerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/tree.NodeVersioner/CreateVersion":
		resp, er := s.NodeVersionerServer.CreateVersion(ctx, args.(*CreateVersionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeVersioner/StoreVersion":
		resp, er := s.NodeVersionerServer.StoreVersion(ctx, args.(*StoreVersionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeVersioner/HeadVersion":
		resp, er := s.NodeVersionerServer.HeadVersion(ctx, args.(*HeadVersionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeVersioner/DeleteVersion":
		resp, er := s.NodeVersionerServer.DeleteVersion(ctx, args.(*HeadVersionRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	case "/tree.NodeVersioner/PruneVersions":
		resp, er := s.NodeVersionerServer.PruneVersions(ctx, args.(*PruneVersionsRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *NodeVersionerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.NodeVersioner/ListVersions":
		st := &NodeVersionerStub_ListVersionsStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.NodeVersionerServer.ListVersions(i.(*ListVersionsRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	case "/tree.NodeVersioner/ListVersioningPolicies":
		st := &NodeVersionerStub_ListVersioningPoliciesStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.NodeVersionerServer.ListVersioningPolicies(i.(*ListVersioningPoliciesRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type NodeVersionerStub_ListVersionsStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *NodeVersionerStub_ListVersionsStreamer) Send(response *ListVersionsResponse) error {
	s.RespChan <- response
	return nil
}

type NodeVersionerStub_ListVersioningPoliciesStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *NodeVersionerStub_ListVersioningPoliciesStreamer) Send(response *VersioningPolicy) error {
	s.RespChan <- response
	return nil
}

type FileKeyManagerStub struct {
	FileKeyManagerServer
}

func (s *FileKeyManagerStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	case "/tree.FileKeyManager/GetEncryptionKey":
		resp, er := s.FileKeyManagerServer.GetEncryptionKey(ctx, args.(*GetEncryptionKeyRequest))
		if er == nil {
			e = stubs.AssignToInterface(resp, reply)
		} else {
			e = er
		}
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *FileKeyManagerStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	}
	return nil, errors.New(method + "  not implemented")
}

type SyncChangesStub struct {
	SyncChangesServer
}

func (s *SyncChangesStub) Invoke(ctx context.Context, method string, args interface{}, reply interface{}, opts ...grpc.CallOption) error {
	fmt.Println("Serving", method, args, reply, opts)
	var e error
	switch method {
	default:
		e = errors.New(method + " not implemented")
	}
	return e
}
func (s *SyncChangesStub) NewStream(ctx context.Context, desc *grpc.StreamDesc, method string, opts ...grpc.CallOption) (grpc.ClientStream, error) {
	fmt.Println("Serving", method)
	switch method {
	case "/tree.SyncChanges/Put":
		st := &SyncChangesStub_PutStreamer{}
		st.Init(ctx)
		go s.SyncChangesServer.Put(st)
		return st, nil
	case "/tree.SyncChanges/Search":
		st := &SyncChangesStub_SearchStreamer{}
		st.Init(ctx, func(i interface{}) error {
			var e error
			go func() {
				defer func() {
					close(st.RespChan)
				}()
				e = s.SyncChangesServer.Search(i.(*SearchSyncChangeRequest), st)
			}()
			<-time.After(100 * time.Millisecond)
			return e
		})
		return st, nil
	}
	return nil, errors.New(method + "  not implemented")
}

type SyncChangesStub_PutStreamer struct {
	stubs.BidirServerStreamerCore
}

func (s *SyncChangesStub_PutStreamer) Recv() (*SyncChange, error) {
	if req, o := <-s.ReqChan; o {
		return req.(*SyncChange), nil
	} else {
		return nil, io.EOF
	}
}
func (s *SyncChangesStub_PutStreamer) Send(response *PutSyncChangeResponse) error {
	s.RespChan <- response
	return nil
}
func (s *SyncChangesStub_PutStreamer) SendAndClose(*PutSyncChangeResponse) error {
	return nil
}

type SyncChangesStub_SearchStreamer struct {
	stubs.ClientServerStreamerCore
}

func (s *SyncChangesStub_SearchStreamer) Send(response *SyncChange) error {
	s.RespChan <- response
	return nil
}
