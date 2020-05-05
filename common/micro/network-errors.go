package defaults

import (
	"context"
	"fmt"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"
)

type networkClientWrapper struct {
	client.Client
}

func NetworkClientWrapper(c client.Client) client.Client {
	wrapped := &networkClientWrapper{}
	wrapped.Client = c
	return wrapped
}

func (c *networkClientWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	e := c.Client.Call(ctx, req, rsp, opts...)
	if e != nil {
		er := errors.Parse(e.Error())
		if er.Id == "go.micro.client" || strings.Contains(er.Detail, "all SubConns are in TransientFailure") {
			// Add details about current services status.
			srv := req.Service()
			method := req.Method()
			er.Detail += " - Request was " + method + " on " + srv
			ss, _ := Registry().GetService(srv)
			var nodes []string
			for _, s := range ss {
				for _, n := range s.Nodes {
					nodes = append(nodes, fmt.Sprintf("%s:%p", n.Address, n.Port))
				}
			}
			er.Detail += fmt.Sprintf(" - Micro-registry had node(s) : [%s]", strings.Join(nodes, ","))
			return er
		} else {
			return e
		}
	}
	return nil
}
