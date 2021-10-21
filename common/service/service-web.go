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

package service

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"reflect"
	"strconv"
	"strings"
	"sync"

	limiter "github.com/micro/go-plugins/wrapper/ratelimiter/uber"
	// json "github.com/pydio/cells/x/jsonx"

	"github.com/emicklei/go-restful"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"
	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/server"
	"github.com/rs/cors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	servicecontext "github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
)

var (
	swaggerSyncOnce       = &sync.Once{}
	swaggerJSONStrings    []string
	swaggerMergedDocument *loads.Document
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

// WithWeb returns a web handler
func WithWeb(handler func() WebHandler, opts ...micro.Option) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()

		opts = append([]micro.Option{
			micro.Name(o.Name),
		}, opts...)

		o.Micro = micro.NewService(
			opts...,
		)

		o.MicroInit = func(s Service) error {
			svc := micro.NewService(
				micro.Cmd(command),
			)

			name := s.Options().Name
			ctx := servicecontext.WithServiceName(s.Options().Context, name)

			s.Init(
				Micro(svc),
			)

			srv := defaults.NewHTTPServer(
				server.Name(name),
				server.Id(o.ID),
				server.RegisterTTL(DefaultRegisterTTL),
			)

			opts := []micro.Option{
				micro.Name(name),
				micro.Version(o.Version),
				micro.Server(srv),
				micro.Registry(defaults.Registry()),
				micro.RegisterTTL(DefaultRegisterTTL),
				micro.RegisterInterval(randomTimeout(DefaultRegisterTTL / 2)),
				micro.Context(ctx),
				micro.AfterStart(func() error {
					log.Logger(ctx).Info("Started")
					return nil
				}),
				micro.BeforeStop(func() error {
					log.Logger(ctx).Info("Stopping")
					return nil
				}),
			}

			if rateLimit, err := strconv.Atoi(os.Getenv("WEB_RATE_LIMIT")); err == nil {
				opts = append(opts, micro.WrapHandler(limiter.NewHandlerWrapper(rateLimit)))
			}

			svc.Init(
				opts...,
			)

			meta := registry.BuildServiceMeta()
			meta["description"] = o.Description

			svc.Init(
				micro.Metadata(registry.BuildServiceMeta()),
			)

			rootPath := "/" + strings.TrimPrefix(s.Options().Name, common.ServiceRestNamespace_)

			ws := new(restful.WebService)
			ws.Consumes(restful.MIME_JSON, "application/x-www-form-urlencoded", "multipart/form-data")
			ws.Produces(restful.MIME_JSON, restful.MIME_OCTET, restful.MIME_XML)
			ws.Path(rootPath)

			h := handler()
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

			var e error
			wrapped := http.Handler(wc)

			for _, wrap := range s.Options().webHandlerWraps {
				wrapped = wrap(wrapped)
			}

			if wrapped, e = NewConfigHTTPHandlerWrapper(wrapped, name); e != nil {
				return e
			}
			wrapped = NewLogHTTPHandlerWrapper(wrapped, name)

			wrapped = cors.Default().Handler(wrapped)

			hd := srv.NewHandler(wrapped)

			return srv.Handle(hd)
		}
		o.AfterStart = append(o.AfterStart, func(service Service) error {
			return UpdateServiceVersion(service)
		})
	}
}

// WithWebAuth adds auth wrappers to auth handlers
func WithWebAuth() ServiceOption {
	return func(o *ServiceOptions) {

		o.Dependencies = append(o.Dependencies, &dependency{common.ServiceGrpcNamespace_ + common.ServicePolicy, []string{}})
		o.Dependencies = append(o.Dependencies, &dependency{common.ServiceGrpcNamespace_ + common.ServiceUser, []string{}})

		o.webHandlerWraps = append(o.webHandlerWraps, func(handler http.Handler) http.Handler {
			wrapped := servicecontext.NewMetricsHttpWrapper(handler)
			wrapped = PolicyHTTPWrapper(wrapped)
			wrapped = JWTHttpWrapper(wrapped)
			wrapped = servicecontext.HttpSpanHandlerWrapper(wrapped)
			wrapped = servicecontext.HttpMetaExtractorWrapper(wrapped)

			return wrapped
		})
	}
}

// WithWebSession option for a service
func WithWebSession(excludes ...string) ServiceOption {
	return func(o *ServiceOptions) {
		o.webHandlerWraps = append(o.webHandlerWraps, func(handler http.Handler) http.Handler {
			return frontend.NewSessionWrapper(handler, excludes...)
		})
	}
}

// WithWebHandler option for a service
func WithWebHandler(h func(http.Handler) http.Handler) ServiceOption {
	return func(o *ServiceOptions) {
		o.webHandlerWraps = append(o.webHandlerWraps, h)
	}
}

func operationToRoute(rootPath string, swaggerTags []string, path string, operation *spec.Operation, pathFilter func(string) string, handlerValue reflect.Value) (string, func(req *restful.Request, rsp *restful.Response)) {

	if !containsTags(operation, swaggerTags) {
		return "", nil
	}

	method := handlerValue.MethodByName(operation.ID)
	if method.IsValid() {
		casted := method.Interface().(func(req *restful.Request, rsp *restful.Response))
		shortPath := strings.TrimPrefix(path, rootPath)
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
			json.Unmarshal([]byte(data), rawMessage)
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
		log.Logger(context.Background()).Fatal("Could not find any valid json spec for swagger")
	}

	return swaggerMergedDocument
}
