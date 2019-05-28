package cells

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/memory"
	sdk "github.com/pydio/cells-sdk-go"
)

var (
	RemoteCellsServiceName = "pydio.gateway.grpc"
	detectedGrpcPorts      map[string]string
)

// detectGrpcPort contacts the discovery service to find the grpc port
func detectGrpcPort(config *sdk.SdkConfig, reload bool) (host string, port string, err error) {

	u, e := url.Parse(config.Url)
	if e != nil {
		err = e
		return
	}

	if strings.Contains(u.Host, ":") {
		host, _, err = net.SplitHostPort(u.Host)
		if err != nil {
			return "", "", err
		}
	} else {
		host = u.Host
	}
	var ok bool
	if detectedGrpcPorts == nil {
		detectedGrpcPorts = make(map[string]string)
	}
	if port, ok = detectedGrpcPorts[host]; !ok || reload {
		resp, e := http.DefaultClient.Get(fmt.Sprintf("%s/a/config/discovery", config.Url))
		if e != nil {
			err = e
			return
		}
		var data map[string]interface{}
		var found bool
		decoder := json.NewDecoder(resp.Body)
		if e := decoder.Decode(&data); e == nil {
			if ep, ok := data["Endpoints"]; ok {
				if endpoints, ok := ep.(map[string]interface{}); ok {
					if p, ok := endpoints["grpc"]; ok {
						port = strings.Split(p.(string), ",")[0]
						detectedGrpcPorts[host] = port
						found = true
					}
				}
			}
		}
		if !found {
			err = fmt.Errorf("no port declared for GRPC endpoint")
			return
		}
	}
	return

}

type DynamicRegistry struct {
	config *sdk.SdkConfig
	Micro  registry.Registry
}

func NewDynamicRegistry(config *sdk.SdkConfig) *DynamicRegistry {
	d := &DynamicRegistry{
		config: config,
		Micro:  memory.NewRegistry(),
	}
	if s, e := d.detectService(false); e == nil {
		d.Micro.Register(s)
	}
	return d
}

func (d *DynamicRegistry) Refresh() error {
	ss, _ := d.Micro.ListServices()
	for _, s := range ss {
		d.Micro.Deregister(s)
	}
	s, e := d.detectService(true)
	if e != nil {
		return e
	}
	d.Micro.Register(s)
	return nil
}

func (d *DynamicRegistry) detectService(reload bool) (*registry.Service, error) {
	host, port, err := detectGrpcPort(d.config, reload)
	if err != nil {
		return nil, err
	}
	p, _ := strconv.ParseInt(port, 10, 32)
	return &registry.Service{
		Name:    RemoteCellsServiceName,
		Version: "latest",
		Nodes: []*registry.Node{
			{
				Id:      "cells.server",
				Address: host,
				Port:    int(p),
			},
		},
	}, nil
}

type RegistryRefreshClient struct {
	w client.Client
	r *DynamicRegistry
}

func (r *RegistryRefreshClient) Init(o ...client.Option) error {
	return r.w.Init(o...)
}

func (r *RegistryRefreshClient) Options() client.Options {
	return r.w.Options()
}

func (r *RegistryRefreshClient) NewPublication(topic string, msg interface{}) client.Publication {
	return r.w.NewPublication(topic, msg)
}

func (r *RegistryRefreshClient) NewRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return r.w.NewRequest(service, method, req, reqOpts...)
}

func (r *RegistryRefreshClient) NewProtoRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return r.w.NewProtoRequest(service, method, req, reqOpts...)
}

func (r *RegistryRefreshClient) NewJsonRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return r.w.NewJsonRequest(service, method, req, reqOpts...)
}

func (r *RegistryRefreshClient) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	return r.w.Call(ctx, req, rsp, opts...)
}

func (r *RegistryRefreshClient) CallRemote(ctx context.Context, addr string, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	return r.w.CallRemote(ctx, addr, req, rsp, opts...)
}

func (r *RegistryRefreshClient) Stream(ctx context.Context, req client.Request, opts ...client.CallOption) (client.Streamer, error) {
	s, e := r.w.Stream(ctx, req, opts...)
	if e != nil && req.Method() == "NodeChangesStreamer.StreamChanges" {
		mE := errors.Parse(e.Error())
		if strings.Contains(mE.Detail, "connect: connection refused") || (mE.Id == "go.micro.client" && mE.Detail == "not found") {
			if er := r.r.Refresh(); er == nil {
				// Retry call with refreshed registry
				return r.w.Stream(ctx, req, opts...)
			}
		}
	}
	return s, e
}

func (r *RegistryRefreshClient) StreamRemote(ctx context.Context, addr string, req client.Request, opts ...client.CallOption) (client.Streamer, error) {
	return r.w.StreamRemote(ctx, addr, req, opts...)
}

func (r *RegistryRefreshClient) Publish(ctx context.Context, p client.Publication, opts ...client.PublishOption) error {
	return r.w.Publish(ctx, p, opts...)
}

func (r *RegistryRefreshClient) String() string {
	return r.w.String()
}
