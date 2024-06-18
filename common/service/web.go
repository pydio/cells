/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"
	"github.com/rs/cors"
	"github.com/sethvargo/go-limiter/httplimit"
	"github.com/sethvargo/go-limiter/memorystore"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/middleware/authorizations"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

const (
	APIRoute = "api"
)

var (
	swaggerSyncOnce       = &sync.Once{}
	swaggerJSONStrings    []string
	swaggerMergedDocument *loads.Document

	wm     []func(context.Context, http.Handler) http.Handler
	wmOnce = &sync.Once{}
)

// RegisterSwaggerJSON receives a json string and adds it to the swagger definition
func RegisterSwaggerJSON(json string) {
	swaggerSyncOnce = &sync.Once{}
	swaggerJSONStrings = append(swaggerJSONStrings, json)
}

func init() {
	// Instanciate restful framework
	routing.RegisterRoute(APIRoute, "Main REST API Endpoint", common.DefaultRouteREST)
	runtime.RegisterEnvVariable("CELLS_WEB_RATE_LIMIT", "0", "Http API rate-limiter, as a number of token allowed per seconds. 0 means no limit.")
	restful.RegisterEntityAccessor("application/json", new(middleware.ProtoEntityReaderWriter))
}

// WebHandler defines what functions a web handler must answer to
type WebHandler interface {
	SwaggerTags() []string
	Filter() func(string) string
}

func getWebMiddlewares(serviceName string) []func(ctx context.Context, handler http.Handler) http.Handler {
	wmOnce.Do(func() {
		wm = append(wm,
			middleware.HttpWrapperMetrics,
			authorizations.HttpWrapperPolicy,
			authorizations.HttpWrapperJWT,
			authorizations.HttpWrapperLanguage,
			middleware.HttpWrapperMeta,
		)
	})
	// Append dynamic wrapper to append service name to context
	sw := func(ctx context.Context, handler http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			c := runtime.WithServiceName(request.Context(), serviceName)
			handler.ServeHTTP(writer, request.WithContext(c))
		})
	}
	return append(wm, sw)
}

type swaggerRestMapper struct {
	name         string
	operation    *spec.Operation
	routeBuilder func(string) *restful.RouteBuilder
}

// WithWeb returns a web handler
func WithWeb(handler func(ctx context.Context) WebHandler) ServiceOption {

	return func(o *ServiceOptions) {

		serviceRoute := "/" + strings.TrimPrefix(o.Name, common.ServiceRestNamespace_)

		o.serverType = server.TypeHttp
		o.serverStart = func(ctx context.Context) error {
			var mux routing.RouteRegistrar
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux", o.Name)
			}

			mux = &httpServiceRegistrar{
				RouteRegistrar: mux,
				reg:            o.GetRegistry(),
				srvId:          o.Server.ID(),
				svcId:          o.ID,
			}

			log.Logger(ctx).Info("starting", zap.String("service", o.Name), zap.String("hook router to", serviceRoute))

			ws := new(restful.WebService)
			ws.Consumes(restful.MIME_JSON, "application/x-www-form-urlencoded", "multipart/form-data")
			ws.Produces(restful.MIME_JSON, restful.MIME_OCTET, restful.MIME_XML)
			ws.Path("/")

			h := handler(ctx)
			swaggerTags := h.SwaggerTags()
			filter := h.Filter()

			f := reflect.ValueOf(h)

			for path, pathItem := range SwaggerSpec().Spec().Paths.Paths {
				for _, route := range []swaggerRestMapper{
					{name: "GET", operation: pathItem.Get, routeBuilder: ws.GET},
					{name: "DELETE", operation: pathItem.Delete, routeBuilder: ws.DELETE},
					{name: "PUT", operation: pathItem.Put, routeBuilder: ws.PUT},
					{name: "PATCH", operation: pathItem.Patch, routeBuilder: ws.PATCH},
					{name: "HEAD", operation: pathItem.Head, routeBuilder: ws.HEAD},
					{name: "POST", operation: pathItem.Post, routeBuilder: ws.POST},
				} {
					if route.operation != nil {
						shortPath, method := operationToRoute(ctx, serviceRoute, route.name, swaggerTags, path, route.operation, filter, f)
						if shortPath != "" {
							ws.Route(route.routeBuilder(shortPath).To(method))
						}
					}
				}
			}

			wc := restful.NewContainer()
			// Enable globally gzip,deflate encoding globally
			wc.EnableContentEncoding(true)
			wc.Add(ws)
			wc.RecoverHandler(func(e interface{}, writer http.ResponseWriter) {
				writer.WriteHeader(500)
				log.Logger(ctx).Error("Recovered from panic")
				writer.Write([]byte("Internal Server Error"))
			})
			// var e error
			wrapped := http.Handler(wc)

			if o.Name != common.ServiceRestNamespace_+common.ServiceInstall {
				for _, wrap := range getWebMiddlewares(o.Name) {
					wrapped = wrap(ctx, wrapped)
				}
			}

			for _, m := range o.WebMiddlewares {
				wrapped = m(wrapped)
			}

			wrapped = cors.Default().Handler(wrapped)

			if rateLimit, err := strconv.Atoi(os.Getenv("CELLS_WEB_RATE_LIMIT")); err == nil {
				limiterConfig := &memorystore.Config{
					// Number of tokens allowed per interval.
					Tokens: uint64(rateLimit),
					// Interval until tokens reset.
					Interval: time.Second,
				}
				if store, err := memorystore.New(limiterConfig); err == nil {
					if mw, er := httplimit.NewMiddleware(store, httplimit.IPKeyFunc()); er == nil {
						log.Logger(ctx).Debug("Wrapping WebMiddleware into Rate Limiter", zap.Int("reqpersec", rateLimit))
						wrapped = mw.Handle(wrapped)
					} else {
						log.Logger(ctx).Warn("Could not initialize RateLimiter "+er.Error(), zap.Error(er))
					}
				} else {
					log.Logger(ctx).Warn("Could not initialize RateLimiter "+err.Error(), zap.Error(err))
				}
			}

			testServiceContext := func(h http.Handler, o *ServiceOptions) http.Handler {
				return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
					ctx := propagator.ForkContext(req.Context(), ctx)

					var reg registry.Registry
					propagator.Get(ctx, registry.ContextKey, &reg)

					path := strings.TrimSuffix(req.RequestURI, req.URL.Path)

					endpoints := reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{o.Server}),
						registry.WithAdjacentTargetOptions(registry.WithName(path), registry.WithType(pb.ItemType_ENDPOINT)),
					)

					for _, endpoint := range endpoints {
						services := reg.ListAdjacentItems(
							registry.WithAdjacentSourceItems([]registry.Item{endpoint}),
							registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_SERVICE)),
						)

						if len(services) != 1 {
							continue
						}

						ctx = propagator.With(ctx, ContextKey, services[0])
					}

					ctx, _, _ = middleware.TenantIncomingContext(nil)(ctx)

					h.ServeHTTP(rw, req.WithContext(ctx))
				})
			}

			wrapped = UpdateServiceVersionWrapper(wrapped, o)
			wrapped = testServiceContext(wrapped, o)

			sub := mux.Route(APIRoute)
			sub.Handle(serviceRoute, wrapped, routing.WithStripPrefix(), routing.WithEnsureTrailing())
			return nil
		}

		o.serverStop = func(c context.Context) error {
			var mux routing.RouteRegistrar
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux", o.Name)
			}
			mux.Route(APIRoute).Deregister(serviceRoute)
			return nil
		}

		return
	}
}

// WithWebStop registers an optional callback to perform clean operations on stop
// WithWeb already registers a serverStop callback to remove rest patterns
func WithWebStop(handler func(ctx context.Context) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func(c context.Context) error {
			return handler(c)
		}
	}
}

func operationToRoute(ctx context.Context, rootPath, httpMethod string, swaggerTags []string, path string, operation *spec.Operation, pathFilter func(string) string, handlerValue reflect.Value) (shortPath string, handleFunc restful.RouteFunction) {

	if !containsTags(operation, swaggerTags) {
		return
	}

	method := handlerValue.MethodByName(operation.ID)
	if method.IsValid() {
		if casted, ok := method.Interface().(func(req *restful.Request, rsp *restful.Response)); ok {
			handleFunc = casted
		} else if erHandler, ok2 := method.Interface().(func(req *restful.Request, rsp *restful.Response) error); ok2 {
			handleFunc = middleware.WrapErrorHandlerToRoute(erHandler)
		} else {
			log.Logger(ctx).Warn("Cannot map method " + operation.ID + " type, ignoring " + httpMethod + " for path " + path)
			return "", nil
		}
		shortPath = strings.TrimPrefix(path, rootPath)
		if shortPath == "" {
			shortPath = "/"
		}
		if pathFilter != nil {
			shortPath = pathFilter(shortPath)
		}

		log.Logger(ctx).Debug("Registering path " + shortPath + " to handler method " + operation.ID)
		return
	}

	log.Logger(ctx).Warn("Cannot find method " + operation.ID + " on handler, ignoring " + httpMethod + " for path " + path)
	return
}

func containsTags(operation *spec.Operation, filtersTags []string) (found bool) {
	for _, tag := range operation.Tags {
		for _, filter := range filtersTags {
			if tag == filter {
				found = true
				break
			}
		}
	}
	return
}

// SwaggerSpec returns the swagger specification as a document
func SwaggerSpec() *loads.Document {
	swaggerSyncOnce.Do(func() {
		var swaggerDocuments []*loads.Document
		for _, data := range append([]string{rest.SwaggerJson}, swaggerJSONStrings...) {
			// Reading swagger json
			rawMessage := new(json.RawMessage)
			if e := json.Unmarshal([]byte(data), rawMessage); e != nil {
				log.Fatal("Failed to load swagger row data", zap.Error(e))
			}
			j, err := loads.Analyzed(*rawMessage, "")
			if err != nil {
				log.Fatal("Failed to load swagger", zap.Error(err))
			}

			swaggerDocuments = append(swaggerDocuments, j)
		}

		for _, j := range swaggerDocuments {
			if swaggerMergedDocument == nil { // First pass
				swaggerMergedDocument = j
			} else { // other passes : merge all Paths
				for p, i := range j.Spec().Paths.Paths {
					if existing, ok := swaggerMergedDocument.Spec().Paths.Paths[p]; ok {
						if i.Get != nil {
							existing.Get = i.Get
						}
						if i.Put != nil {
							existing.Put = i.Put
						}
						if i.Post != nil {
							existing.Post = i.Post
						}
						if i.Options != nil {
							existing.Options = i.Options
						}
						if i.Delete != nil {
							existing.Delete = i.Delete
						}
						if i.Head != nil {
							existing.Head = i.Head
						}
						swaggerMergedDocument.Spec().Paths.Paths[p] = existing
					} else {
						swaggerMergedDocument.Spec().Paths.Paths[p] = i
					}
				}
				for name, schema := range j.Spec().Definitions {
					swaggerMergedDocument.Spec().Definitions[name] = schema
				}
			}
		}
	})

	if swaggerMergedDocument == nil {
		// log.Logger(context.Background()).Fatal("Could not find any valid json spec for swagger")
	}

	return swaggerMergedDocument
}

type httpServiceRegistrar struct {
	routing.RouteRegistrar
	reg   registry.Registry
	srvId string
	svcId string
}

type regRoute struct {
	routing.Route
	reg   registry.Registry
	svcId string
	srvId string
}

// Route overrides parent to wrap Route
func (r *httpServiceRegistrar) Route(id string) routing.Route {

	route := r.RouteRegistrar.Route(id)

	return &regRoute{
		Route: route,
		svcId: r.svcId,
		srvId: r.srvId,
		reg:   r.reg,
	}
}

func (r *regRoute) Handle(pattern string, handler http.Handler, opts ...routing.HandleOption) {
	r.Route.Handle(pattern, handler, opts...)

	name := r.Route.Endpoint(pattern)

	eps := r.reg.ListAdjacentItems(
		registry.WithAdjacentSourceOptions(registry.WithID(r.srvId), registry.WithType(pb.ItemType_SERVER)),
		registry.WithAdjacentTargetOptions(registry.WithName(name), registry.WithType(pb.ItemType_ENDPOINT)),
	)

	var ep registry.Item
	if len(eps) == 1 {
		ep = eps[0]
	} else {
		ep = util.CreateEndpoint(r.Route.Endpoint(pattern), handler, map[string]string{"type": "http"})
	}

	_ = r.reg.Register(ep, registry.WithEdgeTo(r.svcId, "handler", map[string]string{}))
}
