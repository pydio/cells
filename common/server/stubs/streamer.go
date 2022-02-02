package stubs

import (
	"context"
	"io"

	"google.golang.org/grpc/metadata"
	"google.golang.org/protobuf/proto"
)

func AssignToInterface(m proto.Message, i interface{}) error {
	bb, _ := proto.Marshal(m)
	return proto.Unmarshal(bb, i.(proto.Message))
}

type StreamerStubCore struct {
	Ctx context.Context
}

func (s *StreamerStubCore) SetHeader(md metadata.MD) error {
	panic("implement me")
}

func (s *StreamerStubCore) SendHeader(md metadata.MD) error {
	panic("implement me")
}

func (s *StreamerStubCore) SetTrailer(md metadata.MD) {
	panic("implement me")
}

func (s *StreamerStubCore) Context() context.Context {
	return s.Ctx
}

func (s *StreamerStubCore) SendMsg(m interface{}) error {
	panic("implement me")
}

func (s *StreamerStubCore) RecvMsg(m interface{}) error {
	panic("implement me")
}

type ClientServerStreamerCore struct {
	Ctx         context.Context
	SendHandler func(interface{}) error

	RespChan chan proto.Message
	closed   bool
	header   metadata.MD
	trailer  metadata.MD
}

func (cs *ClientServerStreamerCore) Init(ctx context.Context, sendHandler func(interface{}) error) {
	cs.Ctx = ctx
	cs.RespChan = make(chan proto.Message, 1000)
	cs.SendHandler = sendHandler
}

func (cs *ClientServerStreamerCore) SetHeader(md metadata.MD) error {
	cs.header = md
	return nil
}

func (cs *ClientServerStreamerCore) SendHeader(md metadata.MD) error {
	return nil
}

func (cs *ClientServerStreamerCore) SetTrailer(md metadata.MD) {
	cs.trailer = md
}

func (cs *ClientServerStreamerCore) Header() (metadata.MD, error) {
	return cs.header, nil
}

func (cs *ClientServerStreamerCore) Trailer() metadata.MD {
	return cs.trailer
}

func (cs *ClientServerStreamerCore) CloseSend() error {
	// CloseSend only closes the request, not the response
	//  - For ClientStreamer only, close(st.RespChan) is called in defer
	//  - For ServerStreamer, CloseSend() is overridden
	return nil
}

func (cs *ClientServerStreamerCore) Context() context.Context {
	return cs.Ctx
}

func (cs *ClientServerStreamerCore) SendMsg(m interface{}) error {
	return cs.SendHandler(m)
}

func (cs *ClientServerStreamerCore) RecvMsg(m interface{}) error {
	if resp, o := <-cs.RespChan; o {
		return AssignToInterface(resp, m)
	} else {
		return io.EOF
	}
}

type BidirServerStreamerCore struct {
	ClientServerStreamerCore
	ReqChan chan proto.Message
	closed  bool
}

func (bd *BidirServerStreamerCore) Init(ctx context.Context) {
	bd.ReqChan = make(chan proto.Message, 1000)
	bd.ClientServerStreamerCore.Init(ctx, func(i interface{}) error {
		bd.ReqChan <- i.(proto.Message)
		return nil
	})
}

func (bd *BidirServerStreamerCore) CloseSend() error {
	if bd.closed {
		return nil
	}
	close(bd.ReqChan)
	bd.closed = true
	return nil
}
