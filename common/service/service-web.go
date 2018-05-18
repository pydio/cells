/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"encoding/json"
	"net/http"
	"reflect"
	"strings"

	"github.com/emicklei/go-restful"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-web"
	"github.com/pborman/uuid"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/defaults"
)

var (
	serviceWebJSONSpec *loads.Document
)

func init() {
	// Reading swagger json
	rawMessage := new(json.RawMessage)
	json.Unmarshal([]byte(rest.SwaggerJson), rawMessage)

	if j, err := loads.Analyzed(*rawMessage, ""); err != nil {
		log.Logger(nil).Fatal("Could not instanciate json")
	} else {
		serviceWebJSONSpec = j
	}

	// Instanciate RESTful
	restful.RegisterEntityAccessor("application/json", new(ProtoEntityReaderWriter))
}

// WebHandler defines what functions a web handler must answer to
type WebHandler interface {
	SwaggerTags() []string
	Filter() func(string) string
}

// WithWeb returns a web handler
func WithWeb(handler func() WebHandler, opts ...web.Option) ServiceOption {
	return func(o *ServiceOptions) {
		o.Version = common.Version().String()
		o.Web = web.NewService()
		o.Dependencies = append(o.Dependencies, &dependency{common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_AUTH, []string{}})
		o.Dependencies = append(o.Dependencies, &dependency{common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_POLICY, []string{}})
		o.Dependencies = append(o.Dependencies, &dependency{common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_USER, []string{}})
		o.BeforeStart = append(o.BeforeStart, func(s Service) error {
			name := s.Options().Name
			ctx := servicecontext.WithServiceName(s.Options().Context, name)
			reg := defaults.Registry()
			cm := cmd.NewCmd(cmd.Registry(&reg))
			s.Options().Web.Init(
				web.Cmd(cm),
				web.Id(uuid.NewUUID().String()),
				web.Registry(defaults.Registry()),
				web.Name(name),
				web.Context(ctx),
				web.AfterStart(func() error {
					log.Logger(ctx).Info("started")
					return nil
				}),
				web.BeforeStop(func() error {
					log.Logger(ctx).Info("stopping")
					return nil
				}),
			)

			rootPath := "/" + strings.TrimPrefix(s.Options().Name, common.SERVICE_REST_NAMESPACE_)

			ws := new(restful.WebService)
			ws.Consumes(restful.MIME_JSON)
			ws.Produces(restful.MIME_JSON)
			ws.Path(rootPath)

			h := handler()
			swaggerTags := h.SwaggerTags()
			filter := h.Filter()

			f := reflect.ValueOf(h)

			for path, pathItem := range serviceWebJSONSpec.Spec().Paths.Paths {
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
			wc.Add(ws)

			var e error
			wrapped := http.Handler(wc)

			if s.Options().Name != common.SERVICE_REST_NAMESPACE_+common.SERVICE_INSTALL {
				wrapped = PolicyHttpWrapper(wrapped)
				wrapped = JWTHttpWrapper(wrapped)
				wrapped = servicecontext.HttpSpanHandlerWrapper(wrapped)
				wrapped = servicecontext.HttpMetaExtractorWrapper(wrapped)
			}
			if wrapped, e = NewConfigHttpHandlerWrapper(wrapped, name); e != nil {
				return e
			}
			wrapped = NewLogHttpHandlerWrapper(wrapped, name, servicecontext.GetServiceColor(ctx))

			s.Options().Web.Handle("/", wrapped)

			return nil
		})
		o.AfterStart = append(o.AfterStart, func(service Service) error {
			return UpdateServiceVersion(service)
		})
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

		log.Logger(nil).Debug("Registering path " + shortPath + " to handler method " + operation.ID)
		return shortPath, casted
	}

	log.Logger(nil).Debug("Cannot find method " + operation.ID + " on handler, ignoring GET for path " + path)
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
