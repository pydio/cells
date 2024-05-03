package registry

import (
	"context"
	"fmt"
	"net"
	"sort"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	cluster "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	endpoint "github.com/envoyproxy/go-control-plane/envoy/config/endpoint/v3"
	listener "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	router "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/router/v3"
	hcm "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	clusterservice "github.com/envoyproxy/go-control-plane/envoy/service/cluster/v3"
	discoveryservice "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	endpointservice "github.com/envoyproxy/go-control-plane/envoy/service/endpoint/v3"
	listenerservice "github.com/envoyproxy/go-control-plane/envoy/service/listener/v3"
	routeservice "github.com/envoyproxy/go-control-plane/envoy/service/route/v3"
	runtimeservice "github.com/envoyproxy/go-control-plane/envoy/service/runtime/v3"
	secretservice "github.com/envoyproxy/go-control-plane/envoy/service/secret/v3"
	matcherv3 "github.com/envoyproxy/go-control-plane/envoy/type/matcher/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	resource "github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	xds "github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/envoyproxy/go-control-plane/pkg/wellknown"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/durationpb"
	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client"
	"github.com/pydio/cells/v4/common/log"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/context/ckeys"
)

type Convertible interface {
	As(interface{}) bool
}

const (
	listenerNameTemplate    = "xdstp://%s.cells.com/envoy.config.listener.v3.Listener/grpc/client/cells"
	routeConfigNameTemplate = "xdstp://%s.cells.com/envoy.config.listener.v3.Listener/grpc/client/cells-route"
	clusterNameTemplate     = "xdstp://%s.cells.com/envoy.config.listener.v3.Listener/grpc/client/cells-cluster"
	virtualHostNameTemplate = "xdstp://%s.cells.com/envoy.config.listener.v3.Listener/grpc/client/cells-cluster"
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceRegistry),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc implementation of the registry"),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				var reg registry.Registry
				runtimecontext.Get(ctx, runtimecontext.RegistryKey, &reg)
				handler := NewHandler(reg)
				pbregistry.RegisterRegistryServer(srv, handler)

				if discoveryConvertible, ok := srv.(Convertible); ok {
					var discoveryServer *grpc.Server
					if discoveryConvertible.As(&discoveryServer) {

						listenerName := fmt.Sprintf(listenerNameTemplate, runtime.Cluster())
						routeConfigName := fmt.Sprintf(routeConfigNameTemplate, runtime.Cluster())
						virtualHostName := fmt.Sprintf(virtualHostNameTemplate, runtime.Cluster())
						domains := []string{listenerName}

						signal := make(chan struct{})
						cache := cachev3.NewSnapshotCache(true, cachev3.IDHash{}, log.Logger(ctx))

						discoveryHandler := xds.NewServer(ctx, cache, &callbacks{
							signal:   signal,
							fetches:  0,
							requests: 0,
						})
						discoveryservice.RegisterAggregatedDiscoveryServiceServer(discoveryServer, discoveryHandler)
						endpointservice.RegisterEndpointDiscoveryServiceServer(discoveryServer, discoveryHandler)
						clusterservice.RegisterClusterDiscoveryServiceServer(discoveryServer, discoveryHandler)
						routeservice.RegisterRouteDiscoveryServiceServer(discoveryServer, discoveryHandler)
						listenerservice.RegisterListenerDiscoveryServiceServer(discoveryServer, discoveryHandler)
						secretservice.RegisterSecretDiscoveryServiceServer(discoveryServer, discoveryHandler)
						runtimeservice.RegisterRuntimeDiscoveryServiceServer(discoveryServer, discoveryHandler)

						// TODO - make sure that this is ok
						cb, err := client.NewResolverCallback(reg)
						if err != nil {
							return err
						}

						var version int32 = 0

						nodeId := "test-id"

						cb.Add(func(reg registry.Registry) error {
							// -------------------------------------------
							// Creating the Endpoint Discovery Service
							// -------------------------------------------
							eds := []types.Resource{}
							srvs, err := reg.List(registry.WithType(pbregistry.ItemType_SERVER))

							// We sort because we want a priority on the route chosen, must be part of the current cluster
							sort.Sort(ByCluster(srvs))

							if err != nil {
								return err
							}
							for _, srvItem := range srvs {
								if srvItem.Name() != "grpc" {
									continue
								}

								endpointItems := reg.ListAdjacentItems(
									registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
									registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ENDPOINT)),
								)
								addrItems := reg.ListAdjacentItems(
									registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
									registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ADDRESS)),
								)
								if len(endpointItems) == 0 {
									continue
								}

								var endpoints []*endpoint.LbEndpoint

								for _, addrItem := range addrItems {
									host, portStr, err := net.SplitHostPort(addrItem.Name())
									if err != nil {
										continue
									}
									port, err := strconv.Atoi(portStr)
									if err != nil {
										continue
									}
									hst := &core.Address{Address: &core.Address_SocketAddress{
										SocketAddress: &core.SocketAddress{
											Address:  host,
											Protocol: core.SocketAddress_TCP,
											PortSpecifier: &core.SocketAddress_PortValue{
												PortValue: uint32(port),
											},
										},
									}}

									epp := &endpoint.LbEndpoint{
										HostIdentifier: &endpoint.LbEndpoint_Endpoint{
											Endpoint: &endpoint.Endpoint{
												Address: hst,
											}},
										HealthStatus: core.HealthStatus_HEALTHY,
									}
									endpoints = append(endpoints, epp)
								}

								var priority uint32 = 0
								if srvItem.Metadata()[runtime.NodeMetaCluster] != runtime.Cluster() && false {
									priority = 1
								}

								eds = append(eds, &endpoint.ClusterLoadAssignment{
									ClusterName: srvItem.ID(),
									Endpoints: []*endpoint.LocalityLbEndpoints{{
										Locality: &core.Locality{
											Region: "us-central1",
											Zone:   "us-central1-a",
										},
										Priority:            priority,
										LoadBalancingWeight: &wrapperspb.UInt32Value{Value: uint32(1000)},
										LbEndpoints:         endpoints,
									}},
								})
							}

							// -------------------------------------------
							// Creating the Cluster Discovery Service
							// -------------------------------------------
							cds := []types.Resource{}
							for _, srvItem := range srvs {
								if srvItem.Name() != "grpc" {
									continue
								}

								endpointItems := reg.ListAdjacentItems(
									registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
									registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ENDPOINT)),
								)
								if len(endpointItems) == 0 {
									continue
								}

								cds = append(cds, &cluster.Cluster{
									Name:                 srvItem.ID(),
									LbPolicy:             cluster.Cluster_ROUND_ROBIN,
									ClusterDiscoveryType: &cluster.Cluster_Type{Type: cluster.Cluster_EDS},

									EdsClusterConfig: &cluster.Cluster_EdsClusterConfig{
										EdsConfig: &core.ConfigSource{
											ResourceApiVersion: resource.DefaultAPIVersion,
											ConfigSourceSpecifier: &core.ConfigSource_Self{
												Self: &core.SelfConfigSource{
													TransportApiVersion: core.ApiVersion_V3,
												},
											},
										},
									},
								})
							}

							// -------------------------------------------
							// Creating the Route Discovery Service
							// -------------------------------------------
							routes := []*route.Route{}
							for _, srvItem := range srvs {
								if srvItem.Name() != "grpc" {
									continue
								}

								endpointItems := reg.ListAdjacentItems(
									registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
									registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ENDPOINT)),
								)
								if len(endpointItems) == 0 {
									continue
								}

								for _, endpointItem := range endpointItems {
									svcItems := reg.ListAdjacentItems(
										registry.WithAdjacentSourceItems([]registry.Item{endpointItem}),
										registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_SERVICE)),
									)
									if len(svcItems) == 0 {
										routes = append(routes, &route.Route{
											Name: endpointItem.ID(),
											Match: &route.RouteMatch{
												PathSpecifier: &route.RouteMatch_Path{
													Path: endpointItem.Name(),
												},
											},
											Action: &route.Route_Route{
												Route: &route.RouteAction{
													ClusterSpecifier: &route.RouteAction_Cluster{
														Cluster: srvItem.ID(),
													},
												},
											},
										})
									} else {
										for _, svcItem := range svcItems {
											routes = append(routes, &route.Route{
												Name: endpointItem.ID(),
												Match: &route.RouteMatch{
													PathSpecifier: &route.RouteMatch_Path{
														Path: endpointItem.Name(),
													},
													Headers: []*route.HeaderMatcher{{
														Name: ckeys.TargetServiceName,
														HeaderMatchSpecifier: &route.HeaderMatcher_StringMatch{
															StringMatch: &matcherv3.StringMatcher{MatchPattern: &matcherv3.StringMatcher_Exact{Exact: svcItem.Name()}},
														},
													}},
												},
												Action: &route.Route_Route{
													Route: &route.RouteAction{
														ClusterSpecifier: &route.RouteAction_Cluster{
															Cluster: srvItem.ID(),
														},
													},
												},
											})
										}
									}
								}
							}

							routeConfig := &route.RouteConfiguration{
								Name:             routeConfigName,
								ValidateClusters: &wrapperspb.BoolValue{Value: true},
								VirtualHosts: []*route.VirtualHost{{
									Name:    virtualHostName,
									Domains: domains,
									Routes:  routes,
									RetryPolicy: &route.RetryPolicy{
										RetryOn:    "unavailable",
										NumRetries: wrapperspb.UInt32(20),
										RetryBackOff: &route.RetryPolicy_RetryBackOff{
											BaseInterval: durationpb.New(1 * time.Second),
											MaxInterval:  durationpb.New(2 * time.Second),
										},
									},
								}},
							}

							var rds []types.Resource
							rds = append(rds, routeConfig)

							// -------------------------------------------
							// Creating the Listener Discovery Service
							// -------------------------------------------
							hcRds := &hcm.HttpConnectionManager_Rds{
								Rds: &hcm.Rds{
									RouteConfigName: routeConfigName,
									ConfigSource: &core.ConfigSource{
										ResourceApiVersion: resource.DefaultAPIVersion,
										ConfigSourceSpecifier: &core.ConfigSource_Self{
											Self: &core.SelfConfigSource{
												TransportApiVersion: core.ApiVersion_V3,
											},
										},
									},
								},
							}

							hff := &router.Router{}
							hffTypedConfig, err := anypb.New(hff)
							if err != nil {
								return err
							}

							manager := &hcm.HttpConnectionManager{
								CodecType:      hcm.HttpConnectionManager_AUTO,
								RouteSpecifier: hcRds,
								HttpFilters: []*hcm.HttpFilter{{
									Name: wellknown.Router,
									ConfigType: &hcm.HttpFilter_TypedConfig{
										TypedConfig: hffTypedConfig,
									},
								}},
							}

							apiListener, err := anypb.New(manager)
							if err != nil {
								panic(err)
							}

							lds := []types.Resource{
								&listener.Listener{
									Name: listenerName,
									ApiListener: &listener.ApiListener{
										ApiListener: apiListener,
									},
								},
							}

							atomic.AddInt32(&version, 1)
							resources := make(map[resource.Type][]types.Resource, 4)
							resources[resource.ListenerType] = lds
							resources[resource.RouteType] = rds
							resources[resource.ClusterType] = cds
							resources[resource.EndpointType] = eds

							snap, err := cachev3.NewSnapshot(fmt.Sprint(version), resources)
							if err != nil {
								log.Logger(ctx).Errorf("Could not set snapshot %v", err)
							}

							err = cache.SetSnapshot(ctx, nodeId, snap)
							if err != nil {
								log.Logger(ctx).Errorf("Could not set snapshot %v", err)
							}

							return nil
						})
					}
				}

				return nil
			}),
		)
	})
}

type callbacks struct {
	signal   chan struct{}
	fetches  int
	requests int
	mu       sync.Mutex
}

func (cb *callbacks) Report() {
	cb.mu.Lock()
	defer cb.mu.Unlock()
}

func (cb *callbacks) OnStreamOpen(ctx context.Context, id int64, typ string) error {
	//fmt.Printf("OnStreamOpen %d open for Type [%s]\n", id, typ)
	return nil
}

func (cb *callbacks) OnStreamClosed(id int64, node *core.Node) {
	//fmt.Printf("OnStreamClosed %d closed\n", id)
}

func (cb *callbacks) OnStreamRequest(id int64, r *discoveryservice.DiscoveryRequest) error {
	//fmt.Printf("OnStreamRequest %d  Request[%v]\n", id, r.TypeUrl)
	cb.mu.Lock()
	defer cb.mu.Unlock()
	cb.requests++
	if cb.signal != nil {
		close(cb.signal)
		cb.signal = nil
	}
	return nil
}

func (cb *callbacks) OnStreamResponse(ctx context.Context, id int64, req *discoveryservice.DiscoveryRequest, resp *discoveryservice.DiscoveryResponse) {
	//fmt.Printf("OnStreamResponse... %d   Request [%v],  Response[%v]\n", id, req.TypeUrl, resp.TypeUrl)

	// fmt.Println(resp.Resources)
	cb.Report()
}

func (cb *callbacks) OnFetchRequest(ctx context.Context, req *discoveryservice.DiscoveryRequest) error {
	//fmt.Printf("OnFetchRequest... Request [%v]\n", req.TypeUrl)
	cb.mu.Lock()
	defer cb.mu.Unlock()
	cb.fetches++
	if cb.signal != nil {
		close(cb.signal)
		cb.signal = nil
	}
	return nil
}

func (cb *callbacks) OnFetchResponse(req *discoveryservice.DiscoveryRequest, resp *discoveryservice.DiscoveryResponse) {
	//fmt.Printf("OnFetchResponse... Resquest[%v],  Response[%v]\n", req.TypeUrl, resp.TypeUrl)
}

func (cb *callbacks) OnDeltaStreamClosed(id int64, node *core.Node) {
	//fmt.Printf("OnDeltaStreamClosed... %v\n", id)
}

func (cb *callbacks) OnDeltaStreamOpen(ctx context.Context, id int64, typ string) error {
	//fmt.Printf("OnDeltaStreamOpen... %v  of type %s\n", id, typ)
	return nil
}

func (c *callbacks) OnStreamDeltaRequest(i int64, request *discoveryservice.DeltaDiscoveryRequest) error {
	//fmt.Printf("OnStreamDeltaRequest... %v  of type %s\n", i, request)
	return nil
}

func (c *callbacks) OnStreamDeltaResponse(i int64, request *discoveryservice.DeltaDiscoveryRequest, response *discoveryservice.DeltaDiscoveryResponse) {
	//fmt.Printf("OnStreamDeltaResponse... %v  of type %s\n", i, request)
}

type ByCluster []registry.Item

func (a ByCluster) Len() int { return len(a) }

func (a ByCluster) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

func (a ByCluster) Less(i, j int) bool {
	return a[j].Metadata()[runtime.NodeMetaCluster] != runtime.Cluster() && a[i].Metadata()[runtime.NodeMetaCluster] == runtime.Cluster()
}
