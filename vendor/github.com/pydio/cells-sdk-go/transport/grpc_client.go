package transport

import (
	"context"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/go-openapi/strfmt"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/metadata"
	"github.com/micro/go-micro/registry"
	microgrpc "github.com/micro/go-plugins/client/grpc"
	"github.com/micro/go-plugins/registry/memory"

	cells_sdk "github.com/pydio/cells-sdk-go"
	"github.com/pydio/cells-sdk-go/client/config_service"
)

var (
	detectedGrpcPorts map[string]string
	TargetServiceName = "pydio.gateway.grpc"
)

// GetMicroClient initialize a Micro GRPC client.
func GetMicroClient(ctx context.Context, config *cells_sdk.SdkConfig) (context.Context, client.Client, error) {

	jwt, host, port, err := DetectGrpcPort(config)
	if err != nil {
		return ctx, nil, err
	}
	p, _ := strconv.ParseInt(port, 10, 32)
	services := map[string][]*registry.Service{
		TargetServiceName: {
			&registry.Service{
				Name:    TargetServiceName,
				Version: "latest",
				Nodes: []*registry.Node{
					{
						Id:      "cells.server",
						Address: host,
						Port:    int(p),
					},
				},
			},
		},
	}
	// create registry
	r := memory.NewRegistry(
		memory.Services(services),
	)
	microClient := microgrpc.NewClient(
		client.Registry(r),
	)
	md := metadata.Metadata{"x-pydio-bearer": jwt}
	ctx = metadata.NewContext(ctx, md)
	return ctx, microClient, nil

}

// DetectGrpcPort contacts the discovery service to find the grpc port and loads a valid JWT.
func DetectGrpcPort(config *cells_sdk.SdkConfig) (jwt string, host string, port string, err error) {

	u, e := url.Parse(config.Url)
	if e != nil {
		err = e
		return
	}

	h, _, _ := net.SplitHostPort(u.Host)
	var ok bool
	if detectedGrpcPorts == nil {
		detectedGrpcPorts = make(map[string]string)
	}
	if port, ok = detectedGrpcPorts[h]; !ok {
		_, t, e := GetRestClientTransport(config, true)
		if e != nil {
			err = e
			return
		}
		restClient := config_service.New(t, strfmt.Default)
		res, ok := restClient.EndpointsDiscovery(nil)
		if ok != nil {
			err = ok
			return
		}
		if pp, ok := res.Payload.Endpoints["grpc"]; ok && len(pp) > 0 {
			port = strings.Split(pp, ",")[0]
			detectedGrpcPorts[h] = port
		} else {
			err = fmt.Errorf("no port declared for GRPC endpoint")
			return
		}
	}
	fmt.Println("Found GRPC Port " + port)
	jwt, err = retrieveToken(config)
	return

}
