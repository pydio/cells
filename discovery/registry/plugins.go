package registry

import (
	"context"
	"fmt"
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	"github.com/envoyproxy/go-control-plane/pkg/wellknown"
	"github.com/golang/protobuf/ptypes"
	"google.golang.org/protobuf/types/known/wrapperspb"
	"log"
	"os"
	"sync"
	"sync/atomic"

	cluster "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	endpoint "github.com/envoyproxy/go-control-plane/envoy/config/endpoint/v3"
	listener "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	router "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/router/v3"
	hcm "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	types "github.com/envoyproxy/go-control-plane/pkg/cache/types"
	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	xds "github.com/envoyproxy/go-control-plane/pkg/server/v3"

	clusterservice "github.com/envoyproxy/go-control-plane/envoy/service/cluster/v3"
	discoveryservice "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	endpointservice "github.com/envoyproxy/go-control-plane/envoy/service/endpoint/v3"
	listenerservice "github.com/envoyproxy/go-control-plane/envoy/service/listener/v3"
	routeservice "github.com/envoyproxy/go-control-plane/envoy/service/route/v3"
	runtimeservice "github.com/envoyproxy/go-control-plane/envoy/service/runtime/v3"
	secretservice "github.com/envoyproxy/go-control-plane/envoy/service/secret/v3"

	"github.com/pydio/cells/v4/common"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"google.golang.org/grpc"
)

type Convertible interface {
	As(interface{}) bool
}

const (
	localhost       = "127.0.0.1"
	Ads             = "ads"
	backendHostName = "0.0.0.0"
	listenerName    = "be-srv"
	routeConfigName = "be-srv-route"
	clusterName     = "be-srv-cluster"
	virtualHostName = "be-srv-vs"
	UpstreamHost    = "www.envoyproxy.io"
	UpstreamPort    = 80
	RouteName       = "local_route"
	ListenerName    = "listener_0"
	ListenerPort    = 10000
)

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceRegistry),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc implementation of the registry"),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				reg := servicecontext.GetRegistry(ctx)
				handler := NewHandler(reg)
				pbregistry.RegisterRegistryServer(srv, handler)

				if discoveryConvertible, ok := srv.(Convertible); ok {
					var discoveryServer *grpc.Server
					if discoveryConvertible.As(&discoveryServer) {

						signal := make(chan struct{})
						cb := &callbacks{
							signal:   signal,
							fetches:  0,
							requests: 0,
						}
						cache := cachev3.NewSnapshotCache(true, cachev3.IDHash{}, nil)

						discoveryHandler := xds.NewServer(ctx, cache, cb)
						discoveryservice.RegisterAggregatedDiscoveryServiceServer(discoveryServer, discoveryHandler)
						endpointservice.RegisterEndpointDiscoveryServiceServer(discoveryServer, discoveryHandler)
						clusterservice.RegisterClusterDiscoveryServiceServer(discoveryServer, discoveryHandler)
						routeservice.RegisterRouteDiscoveryServiceServer(discoveryServer, discoveryHandler)
						listenerservice.RegisterListenerDiscoveryServiceServer(discoveryServer, discoveryHandler)
						secretservice.RegisterSecretDiscoveryServiceServer(discoveryServer, discoveryHandler)
						runtimeservice.RegisterRuntimeDiscoveryServiceServer(discoveryServer, discoveryHandler)

						// TODO - make sure that this is ok
						go func() {

							nodeId := "test-id"

							var lbendpoints []*endpoint.LbEndpoint
							var version int32

							fmt.Printf(">>>>>>>>>>>>>>>>>>> creating ENDPOINT for remoteHost:port %s:%d\n", backendHostName, 8030)
							hst := &core.Address{Address: &core.Address_SocketAddress{
								SocketAddress: &core.SocketAddress{
									Address:  backendHostName,
									Protocol: core.SocketAddress_TCP,
									PortSpecifier: &core.SocketAddress_PortValue{
										PortValue: 8030,
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
							lbendpoints = append(lbendpoints, epp)

							eds := []types.Resource{
								&endpoint.ClusterLoadAssignment{
									ClusterName: clusterName,
									Endpoints: []*endpoint.LocalityLbEndpoints{{
										Locality: &core.Locality{
											Region: "us-central1",
											Zone:   "us-central1-a",
										},
										Priority:            0,
										LoadBalancingWeight: &wrapperspb.UInt32Value{Value: uint32(1000)},
										LbEndpoints:         lbendpoints,
									}},
								},
							}

							// CLUSTER
							fmt.Println(">>>>>>>>>>>>>>>>>>> creating CLUSTER " + clusterName)
							cls := []types.Resource{
								&cluster.Cluster{
									Name:                 clusterName,
									LbPolicy:             cluster.Cluster_ROUND_ROBIN,
									ClusterDiscoveryType: &cluster.Cluster_Type{Type: cluster.Cluster_EDS},
									EdsClusterConfig: &cluster.Cluster_EdsClusterConfig{
										EdsConfig: &core.ConfigSource{
											ConfigSourceSpecifier: &core.ConfigSource_Ads{},
										},
									},
								},
							}

							// RDS
							fmt.Println(">>>>>>>>>>>>>>>>>>> creating RDS " + virtualHostName)

							rds := []types.Resource{
								&route.RouteConfiguration{
									Name:             routeConfigName,
									ValidateClusters: &wrapperspb.BoolValue{Value: true},
									VirtualHosts: []*route.VirtualHost{{
										Name:    virtualHostName,
										Domains: []string{listenerName}, //******************* >> must match what is specified at xds:/// //
										Routes: []*route.Route{{
											Match: &route.RouteMatch{
												PathSpecifier: &route.RouteMatch_Prefix{
													Prefix: "",
												},
											},
											Action: &route.Route_Route{
												Route: &route.RouteAction{
													ClusterSpecifier: &route.RouteAction_Cluster{
														Cluster: clusterName,
													},
												},
											},
										},
										},
									}},
								},
								makeRoute(RouteName, clusterName),
							}

							// LISTENER
							fmt.Println(">>>>>>>>>>>>>>>>>>> creating LISTENER " + listenerName)
							hcRds := &hcm.HttpConnectionManager_Rds{
								Rds: &hcm.Rds{
									RouteConfigName: routeConfigName,
									ConfigSource: &core.ConfigSource{
										ResourceApiVersion: core.ApiVersion_V3,
										ConfigSourceSpecifier: &core.ConfigSource_Ads{
											Ads: &core.AggregatedConfigSource{},
										},
									},
								},
							}

							hff := &router.Router{}
							tctx, err := ptypes.MarshalAny(hff)
							if err != nil {
								fmt.Printf("could not unmarshall router: %v\n", err)
								os.Exit(1)
							}

							manager := &hcm.HttpConnectionManager{
								CodecType:      hcm.HttpConnectionManager_AUTO,
								RouteSpecifier: hcRds,
								HttpFilters: []*hcm.HttpFilter{{
									Name: wellknown.Router,
									ConfigType: &hcm.HttpFilter_TypedConfig{
										TypedConfig: tctx,
									},
								}},
							}

							pbst, err := ptypes.MarshalAny(manager)
							if err != nil {
								panic(err)
							}

							l := []types.Resource{
								&listener.Listener{
									Name: listenerName,
									ApiListener: &listener.ApiListener{
										ApiListener: pbst,
									},
								},
								makeHTTPListener(ListenerName, RouteName),
							}

							// rt := []types.Resource{}
							// sec := []types.Resource{}

							// =================================================================================
							atomic.AddInt32(&version, 1)
							fmt.Println(">>>>>>>>>>>>>>>>>>> creating snapshot Version " + fmt.Sprint(version))
							resources := make(map[resource.Type][]types.Resource, 4)
							resources[resource.ClusterType] = cls
							resources[resource.ListenerType] = l
							resources[resource.RouteType] = rds
							resources[resource.EndpointType] = eds

							snap, err := cachev3.NewSnapshot(fmt.Sprint(version), resources)
							if err != nil {
								log.Fatalf("Could not set snapshot %v", err)
							}
							// cant get the consistent snapshot thing working anymore...
							// https://github.com/envoyproxy/go-control-plane/issues/556
							// https://github.com/envoyproxy/go-control-plane/blob/main/pkg/cache/v3/snapshot.go#L110
							// if err := snap.Consistent(); err != nil {
							// 	log.Errorf("snapshot inconsistency: %+v\n%+v", snap, err)
							// 	os.Exit(1)
							// }

							//snap := cachev3.NewSnapshot(fmt.Sprint(version), eds, cls, rds, l, rt, sec)

							err = cache.SetSnapshot(ctx, nodeId, snap)
							if err != nil {
								log.Fatalf("Could not set snapshot %v", err)
							}
						}()
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
	fmt.Printf("OnStreamOpen %d open for Type [%s]\n", id, typ)
	return nil
}
func (cb *callbacks) OnStreamClosed(id int64, node *core.Node) {
	fmt.Printf("OnStreamClosed %d closed\n", id)
}
func (cb *callbacks) OnStreamRequest(id int64, r *discoveryservice.DiscoveryRequest) error {
	fmt.Printf("OnStreamRequest %d  Request[%v]\n", id, r.TypeUrl)
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
	fmt.Printf("OnStreamResponse... %d   Request [%v],  Response[%v]\n", id, req.TypeUrl, resp.TypeUrl)
	cb.Report()
}
func (cb *callbacks) OnFetchRequest(ctx context.Context, req *discoveryservice.DiscoveryRequest) error {
	fmt.Printf("OnFetchRequest... Request [%v]\n", req.TypeUrl)
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
	fmt.Printf("OnFetchResponse... Resquest[%v],  Response[%v]\n", req.TypeUrl, resp.TypeUrl)
}

func (cb *callbacks) OnDeltaStreamClosed(id int64, node *core.Node) {
	fmt.Printf("OnDeltaStreamClosed... %v\n", id)
}

func (cb *callbacks) OnDeltaStreamOpen(ctx context.Context, id int64, typ string) error {
	fmt.Printf("OnDeltaStreamOpen... %v  of type %s\n", id, typ)
	return nil
}

func (c *callbacks) OnStreamDeltaRequest(i int64, request *discoveryservice.DeltaDiscoveryRequest) error {
	fmt.Printf("OnStreamDeltaRequest... %v  of type %s\n", i, request)
	return nil
}

func (c *callbacks) OnStreamDeltaResponse(i int64, request *discoveryservice.DeltaDiscoveryRequest, response *discoveryservice.DeltaDiscoveryResponse) {
	fmt.Printf("OnStreamDeltaResponse... %v  of type %s\n", i, request)
}

func makeRoute(routeName string, clusterName string) *route.RouteConfiguration {
	return &route.RouteConfiguration{
		Name: routeName,
		VirtualHosts: []*route.VirtualHost{{
			Name:    "local_service",
			Domains: []string{"*"},
			Routes: []*route.Route{{
				Match: &route.RouteMatch{
					PathSpecifier: &route.RouteMatch_Prefix{
						Prefix: "/",
					},
				},
				Action: &route.Route_Route{
					Route: &route.RouteAction{
						ClusterSpecifier: &route.RouteAction_Cluster{
							Cluster: clusterName,
						},
						HostRewriteSpecifier: &route.RouteAction_HostRewriteLiteral{
							HostRewriteLiteral: UpstreamHost,
						},
					},
				},
			}},
		}},
	}
}

func makeHTTPListener(listenerName string, route string) *listener.Listener {
	routerConfig, _ := anypb.New(&router.Router{})
	// HTTP filter configuration
	manager := &hcm.HttpConnectionManager{
		CodecType:  hcm.HttpConnectionManager_AUTO,
		StatPrefix: "http",
		RouteSpecifier: &hcm.HttpConnectionManager_Rds{
			Rds: &hcm.Rds{
				ConfigSource:    makeConfigSource(),
				RouteConfigName: route,
			},
		},
		HttpFilters: []*hcm.HttpFilter{{
			Name:       wellknown.Router,
			ConfigType: &hcm.HttpFilter_TypedConfig{TypedConfig: routerConfig},
		}},
	}
	pbst, err := anypb.New(manager)
	if err != nil {
		panic(err)
	}

	return &listener.Listener{
		Name: listenerName,
		Address: &core.Address{
			Address: &core.Address_SocketAddress{
				SocketAddress: &core.SocketAddress{
					Protocol: core.SocketAddress_TCP,
					Address:  "0.0.0.0",
					PortSpecifier: &core.SocketAddress_PortValue{
						PortValue: ListenerPort,
					},
				},
			},
		},
		FilterChains: []*listener.FilterChain{{
			Filters: []*listener.Filter{{
				Name: wellknown.HTTPConnectionManager,
				ConfigType: &listener.Filter_TypedConfig{
					TypedConfig: pbst,
				},
			}},
		}},
	}
}

func makeConfigSource() *core.ConfigSource {
	source := &core.ConfigSource{}
	source.ResourceApiVersion = resource.DefaultAPIVersion
	source.ConfigSourceSpecifier = &core.ConfigSource_ApiConfigSource{
		ApiConfigSource: &core.ApiConfigSource{
			TransportApiVersion:       resource.DefaultAPIVersion,
			ApiType:                   core.ApiConfigSource_GRPC,
			SetNodeOnFirstMessageOnly: true,
			GrpcServices: []*core.GrpcService{{
				TargetSpecifier: &core.GrpcService_EnvoyGrpc_{
					EnvoyGrpc: &core.GrpcService_EnvoyGrpc{ClusterName: clusterName},
				},
			}},
		},
	}
	return source
}
