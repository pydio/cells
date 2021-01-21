package service

import (
	"context"
	"time"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
)

func backOffStraightAway(ctx context.Context, req client.Request, attempts int) (time.Duration, error) {
	return time.Duration(0), nil
}

type backoffWrapper struct {
	client.Client
}

func (c *backoffWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {

	opts = append(opts, client.WithBackoff(backOffStraightAway))

	return c.Client.Call(ctx, req, rsp, opts...)
}

// NewBackoffClientWrapper wraps a client with a backoff option
func NewBackoffClientWrapper() client.Wrapper {
	return func(c client.Client) client.Client {
		return &backoffWrapper{c}
	}
}

func newBackoffer(service micro.Service) {

	var options []micro.Option

	options = append(options, micro.WrapClient(NewBackoffClientWrapper()))

	service.Init(options...)
}
