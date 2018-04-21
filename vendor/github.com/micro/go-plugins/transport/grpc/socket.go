package grpc

import (
	"github.com/micro/go-micro/transport"
	pb "github.com/micro/go-plugins/transport/grpc/proto"
	"google.golang.org/grpc"
)

type grpcTransportClient struct {
	conn   *grpc.ClientConn
	stream pb.Transport_StreamClient
}

type grpcTransportSocket struct {
	stream pb.Transport_StreamServer
}

func (g *grpcTransportClient) Recv(m *transport.Message) error {
	if m == nil {
		return nil
	}

	msg, err := g.stream.Recv()
	if err != nil {
		return err
	}

	m.Header = msg.Header
	m.Body = msg.Body
	return nil
}

func (g *grpcTransportClient) Send(m *transport.Message) error {
	if m == nil {
		return nil
	}

	return g.stream.Send(&pb.Message{
		Header: m.Header,
		Body:   m.Body,
	})
}

func (g *grpcTransportClient) Close() error {
	return g.conn.Close()
}

func (g *grpcTransportSocket) Recv(m *transport.Message) error {
	if m == nil {
		return nil
	}

	msg, err := g.stream.Recv()
	if err != nil {
		return err
	}

	m.Header = msg.Header
	m.Body = msg.Body
	return nil
}

func (g *grpcTransportSocket) Send(m *transport.Message) error {
	if m == nil {
		return nil
	}

	return g.stream.Send(&pb.Message{
		Header: m.Header,
		Body:   m.Body,
	})
}

func (g *grpcTransportSocket) Close() error {
	return nil
}
