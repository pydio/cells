package grpc

import (
	"github.com/micro/go-micro/client"
)

type grpcPublication struct {
	topic       string
	contentType string
	message     interface{}
}

func newGRPCPublication(topic string, message interface{}, contentType string) client.Publication {
	return &grpcPublication{
		message:     message,
		topic:       topic,
		contentType: contentType,
	}
}

func (g *grpcPublication) ContentType() string {
	return g.contentType
}

func (g *grpcPublication) Topic() string {
	return g.topic
}

func (g *grpcPublication) Message() interface{} {
	return g.message
}
