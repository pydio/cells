package service

import (
	"context"
	"fmt"
	"net"
	"sort"
	"strconv"
	"strings"
	"sync/atomic"

	cluster "github.com/envoyproxy/go-control-plane/envoy/config/cluster/v3"
	core "github.com/envoyproxy/go-control-plane/envoy/config/core/v3"
	endpoint "github.com/envoyproxy/go-control-plane/envoy/config/endpoint/v3"
	listener "github.com/envoyproxy/go-control-plane/envoy/config/listener/v3"
	route "github.com/envoyproxy/go-control-plane/envoy/config/route/v3"
	router "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/http/router/v3"
	hcm "github.com/envoyproxy/go-control-plane/envoy/extensions/filters/network/http_connection_manager/v3"
	http "github.com/envoyproxy/go-control-plane/envoy/extensions/upstreams/http/v3"
	clusterservice "github.com/envoyproxy/go-control-plane/envoy/service/cluster/v3"
	discoveryservice "github.com/envoyproxy/go-control-plane/envoy/service/discovery/v3"
	endpointservice "github.com/envoyproxy/go-control-plane/envoy/service/endpoint/v3"
	listenerservice "github.com/envoyproxy/go-control-plane/envoy/service/listener/v3"
	routeservice "github.com/envoyproxy/go-control-plane/envoy/service/route/v3"
	runtimeservice "github.com/envoyproxy/go-control-plane/envoy/service/runtime/v3"
	secretservice "github.com/envoyproxy/go-control-plane/envoy/service/secret/v3"
	clientservice "github.com/envoyproxy/go-control-plane/envoy/service/status/v3"
	matcherv3 "github.com/envoyproxy/go-control-plane/envoy/type/matcher/v3"
	"github.com/envoyproxy/go-control-plane/pkg/cache/types"
	cachev3 "github.com/envoyproxy/go-control-plane/pkg/cache/v3"
	resource "github.com/envoyproxy/go-control-plane/pkg/resource/v3"
	xds "github.com/envoyproxy/go-control-plane/pkg/server/v3"
	test "github.com/envoyproxy/go-control-plane/pkg/test/v3"
	"github.com/envoyproxy/go-control-plane/pkg/wellknown"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/xds/csds"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/wrapperspb"
	istioApiNetworking "istio.io/api/networking/v1alpha3"
	istioNetworking "istio.io/client-go/pkg/apis/networking/v1beta1"
	istioClient "istio.io/client-go/pkg/clientset/versioned"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/dynamic/dynamicinformer"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client"
	clienthttp "github.com/pydio/cells/v5/common/client/http"
	"github.com/pydio/cells/v5/common/config/routing"
	pbregistry "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/server/generic"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	registry2 "github.com/pydio/cells/v5/discovery/registry"
)

type Convertible interface {
	As(interface{}) bool
}

const (
	listenerNameTemplate       = "xdstp://%s.cells.com/envoy.config.listener.v3.Listener/grpc/"
	serverListenerNameTemplate = listenerNameTemplate + "server/%s"
	clientListenerNameTemplate = listenerNameTemplate + "client/%s"
	routeConfigNameTemplate    = clientListenerNameTemplate + "-route"
	clusterNameTemplate        = clientListenerNameTemplate + "-cluster"
	virtualHostNameTemplate    = clientListenerNameTemplate + "-cluster"
)

const (
	namespace          = "cells"
	virtualServiceName = "my-virtualservice"
	istioRouteGroup    = "cells.io"
	istioRouteVersion  = "v1alpha1"
	istioRouteResource = "istioroutes"
)

// Define the IstioRoute CRD Group, Version, Resource
var istioRouteGVR = schema.GroupVersionResource{
	Group:    istioRouteGroup,
	Version:  istioRouteVersion,
	Resource: istioRouteResource,
}

func init() {
	runtime.Register("discovery", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGenericNamespace_+common.ServiceRegistry),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc implementation of the registry"),
			service.WithGeneric(func(ctx context.Context, srv *generic.Server) error {
				// Create Kubernetes client
				cfg, err := rest.InClusterConfig()
				if err != nil {
					return err
				}

				cli, err := dynamic.NewForConfig(cfg)
				if err != nil {
					return err
				}

				factory := dynamicinformer.NewFilteredDynamicSharedInformerFactory(cli, 0, namespace, nil)

				informer := factory.ForResource(istioRouteGVR).Informer()

				informer.AddEventHandler(cache.ResourceEventHandlerFuncs{
					AddFunc: func(obj interface{}) {
						processIstioRoute(obj, cfg)
					},
					UpdateFunc: func(obj any, newObj any) {
						processIstioRoute(newObj, cfg)
					},
				})

				// Start informer
				stopCh := make(chan struct{})
				defer close(stopCh)
				go informer.Run(stopCh)

				// Keep running
				select {}

				return nil
			}),
		)

		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceRegistry),
			service.Context(ctx),
			service.Tag(common.ServiceTagDiscovery),
			service.Description("Grpc implementation of the registry"),
			service.WithGRPC(func(ctx context.Context, srv grpc.ServiceRegistrar) error {
				reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
				if err != nil {
					return err
				}

				handler := registry2.NewHandler(reg)
				pbregistry.RegisterRegistryServer(srv, handler)

				//signal := make(chan struct{})
				cache := cachev3.NewSnapshotCache(false, cachev3.IDHash{}, log.Logger(runtime.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceRegistry)).WithOptions(zap.IncreaseLevel(zap.ErrorLevel)))

				tcb := &test.Callbacks{Debug: true}
				discoveryHandler := xds.NewServer(ctx, cache, tcb)

				csdsHandler, err := csds.NewClientStatusDiscoveryServer()
				if err != nil {
					return err
				}

				discoveryservice.RegisterAggregatedDiscoveryServiceServer(srv, discoveryHandler)
				endpointservice.RegisterEndpointDiscoveryServiceServer(srv, discoveryHandler)
				clusterservice.RegisterClusterDiscoveryServiceServer(srv, discoveryHandler)
				routeservice.RegisterRouteDiscoveryServiceServer(srv, discoveryHandler)
				listenerservice.RegisterListenerDiscoveryServiceServer(srv, discoveryHandler)
				secretservice.RegisterSecretDiscoveryServiceServer(srv, discoveryHandler)
				runtimeservice.RegisterRuntimeDiscoveryServiceServer(srv, discoveryHandler)
				clientservice.RegisterClientStatusDiscoveryServiceServer(srv, csdsHandler)

				// TODO - make sure that this is ok
				cb, err := client.NewResolverCallback(reg)
				if err != nil {
					return err
				}

				httpBalancer := clienthttp.NewBalancer(ctx, "")

				var version int32 = 3

				nodeId := "test-id"

				cb.Add(func(reg registry.Registry) error {

					// Rebuilding the http endpoints
					err := httpBalancer.Build(reg)
					if err != nil {
						return err
					}

					// var eds []types.Resource
					var cds []types.Resource
					var rds []types.Resource
					var lds []types.Resource

					runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, name string) error {

						// -------------------------------------------
						// Creating the Endpoint Discovery Service
						// -------------------------------------------
						srvs, err := reg.List(registry.WithType(pbregistry.ItemType_SERVER))

						// We sort because we want a priority on the route chosen, must be part of the current cluster
						sort.Sort(ByCluster(srvs))

						// Loading the multiple sites
						proxyConfigs, err := routing.LoadSites(ctx)
						if err != nil {
							return err
						}

						// -------------------------------------------
						// Creating the Route Discovery Service
						// -------------------------------------------
						// We're grouping endpoints by services, and mapping to a server list
						httpEndpointsMap := make(map[string][]string)
						var httpRoutes []*route.Route
						for _, srvItem := range srvs {
							if srvItem.Name() == "grpc" {
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

								srvItems, ok := httpEndpointsMap[endpointItem.Name()]
								if !ok {
									srvItems = []string{}
								}

								srvItems = append(srvItems, srvItem.ID())

								httpEndpointsMap[endpointItem.Name()] = srvItems
							}
						}

						for endpointItem, srvItems := range httpEndpointsMap {
							var clusters []*route.WeightedCluster_ClusterWeight
							for _, srvItem := range srvItems {
								clusters = append(clusters, &route.WeightedCluster_ClusterWeight{
									Name:   srvItem,
									Weight: &wrapperspb.UInt32Value{Value: uint32(1)},
								})
							}

							path := strings.TrimSuffix(endpointItem, "/")

							if path == "" {
								httpRoutes = append(httpRoutes, &route.Route{
									Match: &route.RouteMatch{
										PathSpecifier: &route.RouteMatch_Prefix{
											Prefix: "/",
										},
									},
									Action: &route.Route_Route{
										Route: &route.RouteAction{
											ClusterSpecifier: &route.RouteAction_WeightedClusters{
												WeightedClusters: &route.WeightedCluster{
													Clusters: clusters,
												},
											},
										},
									},
								})
							} else {
								httpRoutes = append(httpRoutes, &route.Route{
									Match: &route.RouteMatch{
										PathSpecifier: &route.RouteMatch_PathSeparatedPrefix{
											PathSeparatedPrefix: path,
										},
									},
									Action: &route.Route_Route{
										Route: &route.RouteAction{
											ClusterSpecifier: &route.RouteAction_WeightedClusters{
												WeightedClusters: &route.WeightedCluster{
													Clusters: clusters,
												},
											},
										},
									},
								})
							}
						}

						proxyListeners := make(map[string][]string)
						for _, proxyConfig := range proxyConfigs {
							for _, bind := range proxyConfig.Binds {
								proxyListenerDomains, ok := proxyListeners[bind]
								if !ok {
									proxyListenerDomains = []string{}
								}
								domain := proxyConfig.ReverseProxyURL
								if domain == "" {
									domain = "*"
								}
								proxyListenerDomains = append(proxyListenerDomains, domain)
								proxyListeners[bind] = proxyListenerDomains
							}
						}

						// var routes []*route.Route
						for _, srvItem := range srvs {
							if srvItem.Name() == "grpc" {
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
								fmt.Println(endpointItem.Name())
							}
						}

						for addr, domains := range proxyListeners {
							routeConfigName := "http-route"
							virtualHostName := "http-virtual-host"

							routeConfig := &route.RouteConfiguration{
								Name:             routeConfigName,
								ValidateClusters: &wrapperspb.BoolValue{Value: false},
								VirtualHosts: []*route.VirtualHost{{
									Name:    virtualHostName,
									Domains: domains,
									Routes:  httpRoutes,
								}},
								RequestHeadersToAdd: []*core.HeaderValueOption{{
									Header: &core.HeaderValue{
										Key:   "X-Pydio-Site-Hash",
										Value: "549fde2729e666dcc54ed3893a38021b", // proxyConfig.Hash
									},
								}},
							}

							rds = append(rds, routeConfig)

							// -------------------------------------------
							// Creating the Listener Discovery Service
							// -------------------------------------------
							hcRds := &hcm.HttpConnectionManager_Rds{
								Rds: &hcm.Rds{
									RouteConfigName: routeConfigName,
									ConfigSource: &core.ConfigSource{
										ResourceApiVersion: resource.DefaultAPIVersion,
										ConfigSourceSpecifier: &core.ConfigSource_ApiConfigSource{
											ApiConfigSource: &core.ApiConfigSource{
												TransportApiVersion:       resource.DefaultAPIVersion,
												ApiType:                   core.ApiConfigSource_GRPC,
												SetNodeOnFirstMessageOnly: true,
												GrpcServices: []*core.GrpcService{{
													TargetSpecifier: &core.GrpcService_EnvoyGrpc_{
														EnvoyGrpc: &core.GrpcService_EnvoyGrpc{ClusterName: "xds_cluster"},
													},
												}},
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
								StatPrefix:     "http-server",
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

							host, port, err := net.SplitHostPort(addr)
							if err != nil {
								return err
							}

							portInt, err := strconv.Atoi(port)
							if err != nil {
								return err
							}

							lds = append(lds, &listener.Listener{
								Name: "listener-1",
								Address: &core.Address{
									Address: &core.Address_SocketAddress{
										SocketAddress: &core.SocketAddress{
											Address: host,
											PortSpecifier: &core.SocketAddress_PortValue{
												PortValue: uint32(portInt),
											},
										},
									},
								},
								FilterChains: []*listener.FilterChain{{
									Filters: []*listener.Filter{{
										Name: "http-connection-manager",
										ConfigType: &listener.Filter_TypedConfig{
											TypedConfig: apiListener,
										},
									}},
								}},
							})

						}

						if err != nil {
							return err
						}

						// -------------------------------------------
						// Creating the Cluster Discovery Service
						// -------------------------------------------
						for _, srvItem := range srvs {
							endpointItems := reg.ListAdjacentItems(
								registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
								registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ENDPOINT)),
							)

							addrItems := reg.ListAdjacentItems(
								registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
								registry.WithAdjacentEdgeOptions(registry.WithName("listener")),
								registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ADDRESS)),
							)

							if len(endpointItems) == 0 || len(addrItems) == 0 {
								continue
							}

							var endpoints []*endpoint.LbEndpoint
							for _, addrItem := range addrItems {
								_, portStr, err := net.SplitHostPort(addrItem.Metadata()[registry.MetaDescriptionKey])
								if err != nil {
									continue
								}
								port, err := strconv.Atoi(portStr)
								if err != nil {
									continue
								}

								hst := &core.Address{Address: &core.Address_SocketAddress{
									SocketAddress: &core.SocketAddress{
										Address:  "127.0.0.1",
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

							loadAssignment := &endpoint.ClusterLoadAssignment{
								ClusterName: srvItem.ID(),
								Endpoints: []*endpoint.LocalityLbEndpoints{{
									Locality: &core.Locality{
										Region: "us-central1",
										Zone:   "us-central1-a",
									},
									// Priority:            1,
									LoadBalancingWeight: &wrapperspb.UInt32Value{Value: uint32(1000)},
									LbEndpoints:         endpoints,
								}},
							}

							typedExtensionProtocolOptions := map[string]*anypb.Any{}

							if srvItem.Name() == "grpc" {

								// Create HTTP/2 protocol options
								http2ProtocolOptions := &http.HttpProtocolOptions{
									UpstreamProtocolOptions: &http.HttpProtocolOptions_ExplicitHttpConfig_{
										ExplicitHttpConfig: &http.HttpProtocolOptions_ExplicitHttpConfig{
											ProtocolConfig: &http.HttpProtocolOptions_ExplicitHttpConfig_Http2ProtocolOptions{},
										},
									},
								}

								http2ProtocolOptionsAny, err := anypb.New(http2ProtocolOptions)
								if err != nil {
									return err
								}

								typedExtensionProtocolOptions["envoy.extensions.upstreams.http.v3.HttpProtocolOptions"] = http2ProtocolOptionsAny
							}

							cds = append(cds, &cluster.Cluster{
								Name:     srvItem.ID(),
								LbPolicy: cluster.Cluster_ROUND_ROBIN,

								ClusterDiscoveryType:          &cluster.Cluster_Type{Type: cluster.Cluster_LOGICAL_DNS},
								DnsLookupFamily:               cluster.Cluster_V4_ONLY,
								TypedExtensionProtocolOptions: typedExtensionProtocolOptions,
								LoadAssignment:                loadAssignment,
							})
						}

						// -------------------------------------------
						// Creating the Route Discovery Service
						// -------------------------------------------
						// We're grouping endpoints by services, and mapping to a server list
						endpointsMap := make(map[string]map[string][]string)
						var routes []*route.Route
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

								svcItemsMap, ok := endpointsMap[endpointItem.Name()]
								if !ok {
									svcItemsMap = make(map[string][]string)
								}

								if len(svcItems) > 0 {
									for _, svcItem := range svcItems {

										srvItems, ok := svcItemsMap[svcItem.Name()]
										if !ok {
											srvItems = []string{}
										}

										srvItems = append(srvItems, srvItem.ID())

										svcItemsMap[svcItem.Name()] = srvItems
									}
								}

								endpointsMap[endpointItem.Name()] = svcItemsMap
							}
						}

						for endpointItem, svcItems := range endpointsMap {
							for svcItem, srvItems := range svcItems {
								var clusters []*route.WeightedCluster_ClusterWeight
								for _, srvItem := range srvItems {
									clusters = append(clusters, &route.WeightedCluster_ClusterWeight{
										Name:   srvItem,
										Weight: &wrapperspb.UInt32Value{Value: uint32(1)},
									})
								}

								routes = append(routes, &route.Route{
									Match: &route.RouteMatch{
										PathSpecifier: &route.RouteMatch_Path{
											Path: endpointItem,
										},
										Headers: []*route.HeaderMatcher{{
											Name: common.CtxTargetServiceName,
											HeaderMatchSpecifier: &route.HeaderMatcher_StringMatch{
												StringMatch: &matcherv3.StringMatcher{MatchPattern: &matcherv3.StringMatcher_Exact{Exact: svcItem}},
											},
										}},
									},
									Action: &route.Route_Route{
										Route: &route.RouteAction{
											ClusterSpecifier: &route.RouteAction_WeightedClusters{
												WeightedClusters: &route.WeightedCluster{
													Clusters: clusters,
												},
											},
										},
									},
								})
							}
						}

						//listenerName := fmt.Sprintf(clientListenerNameTemplate, name, name)
						routeConfigName := fmt.Sprintf(routeConfigNameTemplate, name, name)
						virtualHostName := fmt.Sprintf(virtualHostNameTemplate, name, name)

						//domains := []string{listenerName, name}
						domains := []string{"*"}

						routeConfig := &route.RouteConfiguration{
							Name:             routeConfigName,
							ValidateClusters: &wrapperspb.BoolValue{Value: false},
							VirtualHosts: []*route.VirtualHost{{
								Name:    virtualHostName,
								Domains: domains,
								Routes:  routes,
								//RetryPolicy: &route.RetryPolicy{
								//	RetryOn:    "unavailable",
								//	NumRetries: wrapperspb.UInt32(1),
								//	RetryBackOff: &route.RetryPolicy_RetryBackOff{
								//		BaseInterval: durationpb.New(1 * time.Second),
								//		MaxInterval:  durationpb.New(2 * time.Second),
								//	},
								//},
							}},
						}

						rds = append(rds, routeConfig)

						// -------------------------------------------
						// Creating the Listener Discovery Service
						// -------------------------------------------
						hcRds := &hcm.HttpConnectionManager_Rds{
							Rds: &hcm.Rds{
								RouteConfigName: routeConfigName,
								ConfigSource: &core.ConfigSource{
									ResourceApiVersion: resource.DefaultAPIVersion,
									ConfigSourceSpecifier: &core.ConfigSource_ApiConfigSource{
										ApiConfigSource: &core.ApiConfigSource{
											TransportApiVersion:       resource.DefaultAPIVersion,
											ApiType:                   core.ApiConfigSource_GRPC,
											SetNodeOnFirstMessageOnly: true,
											GrpcServices: []*core.GrpcService{{
												TargetSpecifier: &core.GrpcService_EnvoyGrpc_{
													EnvoyGrpc: &core.GrpcService_EnvoyGrpc{ClusterName: "xds_cluster"},
												},
											}},
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
							StatPrefix:     "grpc-server",
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

						// -------------------------------------------
						// Creating the Cluster Discovery Service
						// -------------------------------------------
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
								registry.WithAdjacentEdgeOptions(registry.WithName("listener")),
								registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ADDRESS)),
							)

							if len(endpointItems) == 0 || len(addrItems) == 0 {
								continue
							}

							for range addrItems {
								lds = append(lds, &listener.Listener{
									Name: "listener-0",
									Address: &core.Address{
										Address: &core.Address_SocketAddress{
											SocketAddress: &core.SocketAddress{
												Address: "0.0.0.0",
												PortSpecifier: &core.SocketAddress_PortValue{
													PortValue: 10000,
												},
											},
										},
									},
									FilterChains: []*listener.FilterChain{{
										Filters: []*listener.Filter{{
											Name: "http-connection-manager",
											ConfigType: &listener.Filter_TypedConfig{
												TypedConfig: apiListener,
											},
										}},
									}},
								})
							}

						}

						return nil
					})

					atomic.AddInt32(&version, 1)
					resources := make(map[resource.Type][]types.Resource, 4)
					resources[resource.ListenerType] = lds
					resources[resource.RouteType] = rds
					resources[resource.ClusterType] = cds

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

				return nil
			}),
		)
	})
}

type ByCluster []registry.Item

func (a ByCluster) Len() int { return len(a) }

func (a ByCluster) Swap(i, j int) { a[i], a[j] = a[j], a[i] }

func (a ByCluster) Less(i, j int) bool {
	return a[j].Metadata()[runtime.NodeMetaCluster] != runtime.Cluster() && a[i].Metadata()[runtime.NodeMetaCluster] == runtime.Cluster()
}

// **Process an IstioRoute CRD and update VirtualService**
func processIstioRoute(obj interface{}, cfg *rest.Config) {
	fmt.Println("Detected IstioRoute change...")

	// Convert object to Unstructured for dynamic handling
	route, ok := obj.(*unstructured.Unstructured)
	if !ok {
		fmt.Println("Failed to parse IstioRoute object.")
		return
	}

	// Extract spec field from IstioRoute CRD
	spec, found, err := unstructured.NestedMap(route.Object, "spec")
	if err != nil || !found {
		fmt.Println("Error extracting IstioRoute spec.")
		return
	}

	newDestination, exists := spec["destination"].(string)
	if !exists {
		fmt.Println("Destination field missing in IstioRoute spec.")
		return
	}

	fmt.Printf("Updating VirtualService to route traffic to: %s", newDestination)

	// Apply VirtualService update
	updateVirtualService(newDestination, cfg)
}

// **Update Istio VirtualService dynamically**
func updateVirtualService(newHost string, cfg *rest.Config) error {
	clientset, err := istioClient.NewForConfig(cfg)
	if err != nil {
		panic(err)
	}

	ctx := context.TODO()

	reg, err := registry.OpenRegistry(ctx, runtime.RegistryURL())
	if err != nil {
		return err
	}

	// TODO - make sure that this is ok
	cb, err := client.NewResolverCallback(reg)
	if err != nil {
		return err
	}

	//httpBalancer := clienthttp.NewBalancer(ctx, "")

	cb.Add(func(reg registry.Registry) error {
		runtime.MultiContextManager().Iterate(ctx, func(ctx context.Context, name string) error {

			// -------------------------------------------
			// Creating the Endpoint Discovery Service
			// -------------------------------------------
			srvs, err := reg.List(registry.WithType(pbregistry.ItemType_SERVER))

			// We sort because we want a priority on the route chosen, must be part of the current cluster
			sort.Sort(ByCluster(srvs))

			// -------------------------------------------
			// Creating the Cluster Discovery Service
			// -------------------------------------------
			// We're grouping endpoints by services, and mapping to a server list
			endpointsMap := make(map[string][]string)
			for _, srvItem := range srvs {
				endpointItems := reg.ListAdjacentItems(
					registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
					registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ENDPOINT)),
				)

				addrItems := reg.ListAdjacentItems(
					registry.WithAdjacentSourceItems([]registry.Item{srvItem}),
					// registry.WithAdjacentEdgeOptions(registry.WithName("listener")),
					registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ADDRESS)),
				)

				if len(endpointItems) == 0 || len(addrItems) == 0 {
					continue
				}

				for _, endpointItem := range endpointItems {
					addrItemsSlice, ok := endpointsMap[endpointItem.Name()]
					if !ok {
						addrItemsSlice = []string{}
					}

					for _, addrItem := range addrItems {
						addr := addrItem.Metadata()[registry.MetaDescriptionKey]
						_, port, err := net.SplitHostPort(addr)
						if err != nil {
							fmt.Println("I have a problem here ", err)
							continue
						}

						host := srvItem.Metadata()["advertise_address"]
						addrItemsSlice = append(addrItemsSlice, fmt.Sprintf("%s:%s", host, port))
					}

					endpointsMap[endpointItem.Name()] = addrItemsSlice
				}
			}

			var routes []*istioApiNetworking.HTTPRoute
			var matches []*istioApiNetworking.HTTPMatchRequest
			var destinations []*istioApiNetworking.HTTPRouteDestination

			for endpointItem, addrItems := range endpointsMap {
				var matches []*istioApiNetworking.HTTPMatchRequest
				var destinations []*istioApiNetworking.HTTPRouteDestination

				for _, addrItem := range addrItems {
					host, portStr, err := net.SplitHostPort(addrItem)
					if err != nil {
						fmt.Println("I have a problem here ", err)
						continue
					}

					port, err := strconv.Atoi(portStr)
					if err != nil {
						fmt.Println("I have a problem there ", err)
						continue
					}

					destinations = append(destinations, &istioApiNetworking.HTTPRouteDestination{
						Destination: &istioApiNetworking.Destination{
							Host: host,
							Port: &istioApiNetworking.PortSelector{
								Number: uint32(port),
							},
						},
						Weight: 1,
					})
				}

				matches = append(matches, &istioApiNetworking.HTTPMatchRequest{
					Name: endpointItem,
					Uri: &istioApiNetworking.StringMatch{
						MatchType: &istioApiNetworking.StringMatch_Exact{
							Exact: endpointItem,
						},
					},
				})

				routes = append(routes, &istioApiNetworking.HTTPRoute{
					Match: matches,
					Route: destinations,
				})
			}

			// Define the VirtualService.
			// This VirtualService routes gRPC traffic (identified by a matching
			// content-type header and URI prefix) to the "my-grpc-service" on port 50051.
			vs := &istioNetworking.VirtualService{
				ObjectMeta: v1.ObjectMeta{
					Name:      virtualServiceName,
					Namespace: namespace, // change this as needed
				},
				Spec: istioApiNetworking.VirtualService{
					Hosts:    []string{"my-grpc-service.example.com"},
					Gateways: []string{"cells-gateway"},
					Http:     routes,
				},
			}

			fmt.Println(matches, destinations)

			fmt.Println("Updating VirtualService dynamically...")

			// Create the VirtualService in the "default" namespace.
			createdVS, err := clientset.NetworkingV1beta1().VirtualServices(namespace).Create(context.Background(), vs, v1.CreateOptions{})
			if err != nil {
				fmt.Println("Error creating VirtualService dynamically. ", err)
				return err
			}

			fmt.Printf("VirtualService %q created successfully\n", createdVS.Name)

			return nil
		})

		return nil
	})

	return nil
}
