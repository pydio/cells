package ratelimit

import (
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"go.uber.org/ratelimit"

	"golang.org/x/net/context"
)

type clientWrapper struct {
	r ratelimit.Limiter
	client.Client
}

func (c *clientWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	c.r.Take()
	return c.Client.Call(ctx, req, rsp, opts...)
}

// NewClientWrapper creates a blocking side rate limiter
func NewClientWrapper(rate int) client.Wrapper {
	r := ratelimit.New(rate)

	return func(c client.Client) client.Client {
		return &clientWrapper{r, c}
	}
}

// NewHandlerWrapper creates a blocking server side rate limiter
func NewHandlerWrapper(rate int) server.HandlerWrapper {
	r := ratelimit.New(rate)

	return func(h server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			r.Take()
			return h(ctx, req, rsp)
		}
	}
}
