/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package cells

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/micro/go-micro/client"
	muerrors "github.com/micro/go-micro/errors"
	"github.com/micro/go-micro/registry"
	"github.com/micro/go-plugins/registry/memory"
	"github.com/pkg/errors"

	"github.com/pydio/cells/common/sync/endpoints/cells/transport"
	"github.com/pydio/cells/common/sync/model"
	json "github.com/pydio/cells/x/jsonx"
)

var (
	RemoteCellsServiceName = "pydio.gateway.grpc"
	detectedGrpcPorts      map[string]string
)

// detectGrpcPort contacts the discovery service to find the grpc port
func detectGrpcPort(config *transport.SdkConfig, reload bool) (host string, port string, err error) {

	u, e := url.Parse(config.Url)
	if e != nil {
		err = errors.Wrap(model.NewConfigError(e), "cannot parse url")
		return
	}
	var mainPort string
	if strings.Contains(u.Host, ":") {
		host, mainPort, err = net.SplitHostPort(u.Host)
		if err != nil {
			return "", "", errors.Wrap(model.NewConfigError(err), "cannot split host/port")
		}
	} else {
		host = u.Host
	}

	var ok bool
	if detectedGrpcPorts == nil {
		detectedGrpcPorts = make(map[string]string)
	}
	if port, ok = detectedGrpcPorts[host]; !ok || reload {
		httpClient := http.DefaultClient
		if config.SkipVerify {
			httpClient = &http.Client{
				Transport: &http.Transport{
					TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
				},
			}
		}
		resp, e := httpClient.Get(fmt.Sprintf("%s/a/config/discovery", config.Url))
		if e != nil {
			err = errors.Wrap(e, "cannot connect to discovery endpoint")
			return
		} else if resp.StatusCode != 200 {
			err = errors.New("cannot connect to discovery endpoint")
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
			// If no port is declared, we consider gRPC should be accessible on the main port
			if mainPort == "" {
				port = "443"
			} else {
				port = mainPort
			}
			detectedGrpcPorts[host] = port
			return
		}
	}
	return

}

// DynamicRegistry is an implementation of a Micro Registry that automatically
// detect the target GRPC port from the discovery endpoint of the target server.
type DynamicRegistry struct {
	Micro          registry.Registry
	config         *transport.SdkConfig
	detectionError error
}

// NewDynamicRegistry creates a new DynamicRegistry from a standard SdkConfig
func NewDynamicRegistry(config *transport.SdkConfig) *DynamicRegistry {
	d := &DynamicRegistry{
		config: config,
		Micro:  memory.NewRegistry(),
	}
	if s, e := d.detectService(false); e == nil {
		d.Micro.Register(s)
	}
	return d
}

// Refresh deregisters all services and tries to detect service
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

// detectService detects target GRPC port and register a fake service to the registry, that
// will then be used by micro clients.
func (d *DynamicRegistry) detectService(reload bool) (*registry.Service, error) {
	host, port, err := detectGrpcPort(d.config, reload)
	if err != nil {
		d.detectionError = err
		return nil, err
	} else {
		d.detectionError = nil
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

func (d *DynamicRegistry) parseNotFound(e error) error {
	if e == nil {
		return nil
	}
	er := muerrors.Parse(e.Error())
	if er.Code == 500 && er.Id == "go.micro.client" && er.Detail == "not found" {
		if d.detectionError != nil {
			return d.detectionError
		} else {
			return fmt.Errorf("cannot initiate gRPC client to server, please check your configuration")
		}
	}
	return er
}

// RegistryRefreshClient is an implementation of a Micro Client that tries to refresh the registry if a streamer
// connection is broken (GRPC port may change across server restart).
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
	return r.r.parseNotFound(r.w.Call(ctx, req, rsp, opts...))
}

func (r *RegistryRefreshClient) CallRemote(ctx context.Context, addr string, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	return r.r.parseNotFound(r.w.CallRemote(ctx, addr, req, rsp, opts...))
}

func (r *RegistryRefreshClient) Stream(ctx context.Context, req client.Request, opts ...client.CallOption) (client.Streamer, error) {
	s, e := r.w.Stream(ctx, req, opts...)
	if e != nil && req.Method() == "NodeChangesStreamer.StreamChanges" {
		mE := muerrors.Parse(e.Error())
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
