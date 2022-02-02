package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/pydio/cells/v4/common/server"
	"net/http"
	"reflect"
	"strings"
	"sync"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/go-openapi/loads"
	"github.com/go-openapi/spec"
	"github.com/rs/cors"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/server/middleware"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/frontend"
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
		o.serverType = server.ServerType_HTTP
		o.serverStart = func() error {
			var mux server.HttpMux
			if !o.Server.As(&mux) {
				return fmt.Errorf("server %s is not a mux", o.Name)
			}

			// TODO v4
			// if rateLimit, err := strconv.Atoi(os.Getenv("WEB_RATE_LIMIT")); err == nil {
			// 	opts = append(opts, micro.WrapHandler(limiter.NewHandlerWrapper(rateLimit)))
			//}

			// meta := registry.BuildServiceMeta()
			// meta["description"] = o.Description

			// svc.Init(
			// 	micro.Metadata(registry.BuildServiceMeta()),
			// )

			ctx := o.Context

			rootPath := "/a/" + strings.TrimPrefix(o.Name, common.ServiceRestNamespace_)
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
				wrapped = frontend.NewSessionWrapper(wrapped, o.WebSessionExcludes...)
			}
			// Add context

			//if wrapped, e = NewConfigHTTPHandlerWrapper(wrapped, name); e != nil {
			//	return e
			//}
			//wrapped = NewLogHTTPHandlerWrapper(wrapped, name)

			wrapped = cors.Default().Handler(wrapped)

			mux.Handle(ws.RootPath(), wrapped)
			mux.Handle(ws.RootPath()+"/", wrapped)

			return nil
		}

		return
	}
}

func WithWebStop(handler func() WebHandler) ServiceOption {
	return func(o *ServiceOptions) {
		o.serverStop = func() error {
			// TODO v4 - unregister all services
			return nil
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
