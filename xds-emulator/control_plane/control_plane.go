package main

import (
	"context"
	cluster "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	endpoint "github.com/envoyproxy/go-control-plane/envoy/config/endpoint/v3"
	discoveryv3 "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	"google.golang.org/grpc/reflection"
	"log"
	"net"
	"time"

	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	listener "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	http_connection_manager "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	"github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	"github.com/envoyproxy/go-control-plane/pkg/server/v3"
	"github.com/golang/protobuf/ptypes"
	"google.golang.org/grpc"
)

func main() {
	ctx := context.Background()
	snapshotCache := cache.NewSnapshotCache(false, cache.IDHash{}, nil)
	xdsServer := server.NewServer(ctx, snapshotCache, nil)

	grpcServer := grpc.NewServer()
	reflection.Register(grpcServer)
	discoveryv3.RegisterAggregatedDiscoveryServiceServer(grpcServer, xdsServer)

	lis, err := net.Listen("tcp", ":18000")
	if err != nil {
		log.Fatalf("Failed to listen on port 18000: %v", err)
	}

	log.Println("Control Plane is listening on port 18000")

	// Set up listener configurations
	listenerA := createHTTPListener("grpc/server/[::]:50051", "routeA")
	listenerB := createHTTPListener("grpc/server/[::]:50052", "routeB")

	// Create routes for each server
	routeConfigA := createRouteConfiguration("routeA", "ServerA")
	routeConfigB := createRouteConfiguration("routeB", "ServerB")

	// Create cluster configurations for each server
	clusterA := createCluster("ServerA", "127.0.0.1", 50051)
	clusterB := createCluster("ServerB", "127.0.0.1", 50052)

	// Load the snapshot with all configurations
	snapshot, err := cache.NewSnapshot("1", map[resource.Type][]types.Resource{
		resource.ListenerType: {listenerA, listenerB},
		resource.RouteType:    {routeConfigA, routeConfigB},
		resource.ClusterType:  {clusterA, clusterB},
	})
	if err != nil {
		log.Fatalf("Failed to set snapshot: %v", err)
	}

	if err := snapshotCache.SetSnapshot(ctx, "grpc_server_node", snapshot); err != nil {
		log.Fatalf("Failed to set snapshot: %v", err)
	}

	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

// Helper function to create a listener with HTTP connection manager
func createHTTPListener(listenerName, routeName string) *listener.Listener {
	manager := &http_connection_manager.HttpConnectionManager{
		StatPrefix: "http",
		RouteSpecifier: &http_connection_manager.HttpConnectionManager_Rds{
			Rds: &http_connection_manager.Rds{
				ConfigSource: &core.ConfigSource{
					ResourceApiVersion: resource.DefaultAPIVersion,
					ConfigSourceSpecifier: &core.ConfigSource_Ads{
						Ads: &core.AggregatedConfigSource{},
					},
				},
				RouteConfigName: routeName,
			},
		},
		HttpFilters: []*http_connection_manager.HttpFilter{
			{
				Name: "envoy.filters.http.router",
			},
		},
	}

	pbst, _ := ptypes.MarshalAny(manager)
	return &listener.Listener{
		Name: listenerName,
		Address: &core.Address{
			Address: &core.Address_SocketAddress{
				SocketAddress: &core.SocketAddress{
					Protocol: core.SocketAddress_TCP,
					Address:  "0.0.0.0",
					PortSpecifier: &core.SocketAddress_PortValue{
						PortValue: 0, // Any available port will be used.
					},
				},
			},
		},
		FilterChains: []*listener.FilterChain{
			{
				Filters: []*listener.Filter{
					{
						Name: "envoy.filters.network.http_connection_manager",
						ConfigType: &listener.Filter_TypedConfig{
							TypedConfig: pbst,
						},
					},
				},
			},
		},
	}
}

// Helper function to create a route configuration
func createRouteConfiguration(routeName, clusterName string) *route.RouteConfiguration {
	return &route.RouteConfiguration{
		Name: routeName,
		VirtualHosts: []*route.VirtualHost{
			{
				Name:    "local_service",
				Domains: []string{"*"},
				Routes: []*route.Route{
					{
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
							},
						},
					},
				},
			},
		},
	}
}

// Helper function to create a cluster
func createCluster(clusterName, address string, port uint32) *cluster.Cluster {
	return &cluster.Cluster{
		Name:                 clusterName,
		ConnectTimeout:       ptypes.DurationProto(1 * time.Second),
		ClusterDiscoveryType: &cluster.Cluster_Type{Type: cluster.Cluster_STRICT_DNS},
		LoadAssignment: &endpoint.ClusterLoadAssignment{
			ClusterName: clusterName,
			Endpoints: []*endpoint.LocalityLbEndpoints{
				{
					LbEndpoints: []*endpoint.LbEndpoint{
						{
							HostIdentifier: &endpoint.LbEndpoint_Endpoint{
								Endpoint: &endpoint.Endpoint{
									Address: &core.Address{
										Address: &core.Address_SocketAddress{
											SocketAddress: &core.SocketAddress{
												Protocol: core.SocketAddress_TCP,
												Address:  address,
												PortSpecifier: &core.SocketAddress_PortValue{
													PortValue: port,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}
}
