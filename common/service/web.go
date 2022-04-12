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
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/server"
	"github.com/pydio/cells/v4/common/server/middleware"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/frontend"
	dao2 "github.com/pydio/cells/v4/common/service/frontend/sessions"
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
	restful.RegisterEntityAccessor("application/json", new(ProtoEntityReaderWriter))
}

// WebHandler defines what functions a web handler must answer to
type WebHandler interface {
	SwaggerTags() []string
	Filter() func(string) string
}

func getWebMiddlewares(serviceName string) []func(ctx context.Context, handler http.Handler) http.Handler {
	wmOnce.Do(func() {
		wm = append(wm,
			servicecontext.HttpWrapperMetrics,
			middleware.HttpWrapperPolicy,
			middleware.HttpWrapperJWT,
			servicecontext.HttpWrapperSpan,
			servicecontext.HttpWrapperMeta,
		)
	})
	// Append dynamic wrapper to append service name to context
	sw := func(ctx context.Context, handler http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			c := servicecontext.WithServiceName(request.Context(), serviceName)
			handler.ServeHTTP(writer, request.WithContext(c))
		})
	}
	return append(wm, sw)
}

// WithWeb returns a web handler
func WithWeb(handler func(ctx context.Context) WebHandler) ServiceOption {

	return func(o *ServiceOptions) {

		rootPath := "/a/" + strings.TrimPrefix(o.Name, common.ServiceRestNamespace_)

		o.serverType = server.ServerType_HTTP
		o.serverStart = func() error {
			var mux server.HttpMux
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux", o.Name)
			}

			ctx := o.Context
			log.Logger(ctx).Info("starting", zap.String("service", o.Name), zap.String("hook router to", rootPath))

			ws := new(restful.WebService)
			ws.Consumes(restful.MIME_JSON, "application/x-www-form-urlencoded", "multipart/form-data")
			ws.Produces(restful.MIME_JSON, restful.MIME_OCTET, restful.MIME_XML)
			ws.Path(rootPath)

			h := handler(ctx)
			swaggerTags := h.SwaggerTags()
			filter := h.Filter()

			f := reflect.ValueOf(h)

			for path, pathItem := range SwaggerSpec().Spec().Paths.Paths {
				if pathItem.Get != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Get, filter, f)
					if shortPath != "" {
						ws.Route(ws.GET(shortPath).To(method))
					}
				}
				if pathItem.Delete != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Delete, filter, f)
					if shortPath != "" {
						ws.Route(ws.DELETE(shortPath).To(method))
					}
				}
				if pathItem.Put != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Put, filter, f)
					if shortPath != "" {
						ws.Route(ws.PUT(shortPath).To(method))
					}
				}
				if pathItem.Patch != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Patch, filter, f)
					if shortPath != "" {
						ws.Route(ws.PATCH(shortPath).To(method))
					}
				}
				if pathItem.Head != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Head, filter, f)
					if shortPath != "" {
						ws.Route(ws.HEAD(shortPath).To(method))
					}
				}
				if pathItem.Post != nil {
					shortPath, method := operationToRoute(rootPath, swaggerTags, path, pathItem.Post, filter, f)
					if shortPath != "" {
						ws.Route(ws.POST(shortPath).To(method))
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
					wrapped = wrap(o.Context, wrapped)
				}
			}
			if o.UseWebSession {
				if dao := servicecontext.GetDAO(o.Context); dao != nil {
					if sd, ok := dao.(dao2.DAO); ok {
						wrapped = frontend.NewSessionWrapper(wrapped, sd, o.WebSessionExcludes...)
					} else {
						fmt.Println("-- Not a SessionDAO, cannot wrap with SessionWrapper")
					}
				} else {
					fmt.Println("-- No DAO found, cannot wrap with SessionWrapper")
				}
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

			mux.Handle(ws.RootPath(), wrapped)
			mux.Handle(ws.RootPath()+"/", wrapped)

			return nil
		}

		o.serverStop = func() error {
			var mux server.PatternsProvider
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux", o.Name)
			}
			log.Logger(o.Context).Info("Deregistering pattern " + rootPath)
			mux.DeregisterPattern(rootPath)
			mux.DeregisterPattern(rootPath + "/")
			return nil
		}

		return
	}
}

// WithWebStop registers an optional callback to perform clean operations on stop
// WithWeb already registers a serverStop callback to remove rest patterns
func WithWebStop(handler func(ctx context.Context) error) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			return handler(o.Context)
		}
	}
}

func operationToRoute(rootPath string, swaggerTags []string, path string, operation *spec.Operation, pathFilter func(string) string, handlerValue reflect.Value) (string, func(req *restful.Request, rsp *restful.Response)) {

	if !containsTags(operation, swaggerTags) {
		return "", nil
	}

	method := handlerValue.MethodByName(operation.ID)
	if method.IsValid() {
		casted := method.Interface().(func(req *restful.Request, rsp *restful.Response))
		shortPath := strings.TrimPrefix(common.DefaultRouteREST+path, rootPath)
		if shortPath == "" {
			shortPath = "/"
		}
		if pathFilter != nil {
			shortPath = pathFilter(shortPath)
		}

		log.Logger(context.Background()).Debug("Registering path " + shortPath + " to handler method " + operation.ID)
		return shortPath, casted
	}

	log.Logger(context.Background()).Debug("Cannot find method " + operation.ID + " on handler, ignoring GET for path " + path)
	return "", nil
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
