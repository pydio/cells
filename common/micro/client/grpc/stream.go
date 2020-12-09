package grpc

import (
	"context"
	"io"
	"sync"

	"github.com/micro/go-micro/client"

	"google.golang.org/grpc"
)

// Implements the streamer interface
type grpcStream struct {
	sync.RWMutex
	seq     uint64
	closed  chan bool
	err     error
	conn    *grpc.ClientConn
	request client.Request
	stream  grpc.ClientStream
	context context.Context
}

func (g *grpcStream) isClosed() bool {
	select {
	case <-g.closed:
		return true
	default:
		return false
	}
}

func (g *grpcStream) Context() context.Context {
	return g.context
}

func (g *grpcStream) Request() client.Request {
	return g.request
}

func (g *grpcStream) Send(msg interface{}) error {
	g.Lock()
	defer g.Unlock()

	if g.isClosed() {
		g.err = errShutdown
		return errShutdown
	}

	if err := g.stream.SendMsg(msg); err != nil {
		g.err = err
		return err
	}

	return nil
}

func (g *grpcStream) Recv(msg interface{}) error {
	g.Lock()
	defer g.Unlock()

	if g.isClosed() {
		g.err = errShutdown
		return errShutdown
	}

	if err := g.stream.RecvMsg(msg); err != nil {
		if err == io.EOF && !g.isClosed() {
			g.err = io.ErrUnexpectedEOF
			return io.ErrUnexpectedEOF
		}
		g.err = err
		return err
	}

	return nil
}

func (g *grpcStream) Error() error {
	g.RLock()
	defer g.RUnlock()
	return g.err
}

func (g *grpcStream) Close() error {
	select {
	case <-g.closed:
		return nil
	default:
		close(g.closed)
		g.stream.CloseSend()
		return g.conn.Close()
	}
}
