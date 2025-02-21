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

// Package gateway spins an S3 gateway for serving files using the Amazon S3 protocol.
package gateway

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	minio "github.com/minio/minio/cmd"
	"github.com/minio/minio/pkg/auth"
	"github.com/minio/minio/pkg/console"
	"github.com/sethvargo/go-limiter/httplimit"
	"github.com/sethvargo/go-limiter/memorystore"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/net"
	"github.com/pydio/cells/v5/common/utils/propagator"
	pydio "github.com/pydio/cells/v5/gateway/data/gw"
	"github.com/pydio/cells/v5/gateway/data/hooks"

	_ "github.com/pydio/cells/v5/gateway/data/gw"
)

// rewriteListBucketRequest intercepts is registered as a top-level rewriter to catch specific s3 requests
// that are sent to the server root
func rewriteListBucketRequest(request *http.Request, registrar routing.RouteRegistrar) {
	pa := request.URL.Path
	if strings.Contains(request.Header.Get("Authorization"), "AWS4-HMAC-SHA256") && (pa == "/" || pa == "" || strings.HasPrefix(pa, "/probe-bucket-sign")) {
		// Find resolved pattern for main bucket (.e.g /io)
		if pp := registrar.Patterns(common.RouteBucketIO); len(pp) > 0 {
			resolvedPattern := strings.TrimSuffix(pp[0], "/")
			resolvedPattern = path.Join(resolvedPattern, pa)
			if strings.HasSuffix(pa, "/") {
				resolvedPattern += "/"
			}
			request.URL.Path = resolvedPattern
			request.URL.RawPath = resolvedPattern
			log.Logger(request.Context()).Debug("S3 - Recognized ListBucket request on root, re-attach '" + pa + "' to correct endpoint " + request.URL.RawPath)
			request.RequestURI = request.URL.RequestURI()
		}
	}
}

// patchListBucketRequest post-processes top-level requests modified by rewriteListBucketRequest to rewrite the route
// for proper signature computation
func patchListBucketRequest(request *http.Request) {
	route := routing.ResolvedURIFromContext(request.Context())
	testURI := strings.Replace(request.RequestURI, "?x-id=ListBuckets", "", 1)
	if testURI == route {
		request.RequestURI = ""
		request.URL.Path = ""
	} else if testURI == route+"/" {
		request.RequestURI = "/"
		request.URL.Path = "/"
	} else if strings.HasPrefix(request.RequestURI, route+"/probe-bucket-sign") {
		request.RequestURI = strings.TrimPrefix(request.RequestURI, route)
		request.URL.Path = request.RequestURI
	}
}

var (
	srv *gatewayDataServer
)

func init() {

	routing.RegisterRoute(common.RouteBucketIO, "Main I/O bucket for transferring data", common.DefaultRouteBucketIO)
	routing.RegisterRoute(common.RouteBucketData, "Secondary I/O bucket with name longer than 3 characters, may be required by some AWS clients", common.DefaultRouteBucketData)

	runtime.Register("main", func(ctx context.Context) {

		port := net.GetAvailablePort()
		service.NewService(
			service.Name(common.ServiceGatewayData),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("S3 Gateway to tree service"),
			service.WithHTTP(func(c context.Context, mux routing.RouteRegistrar) error {
				c = runtime.WithServiceName(c, common.ServiceGatewayData)

				console.Printf = func(format string, data ...interface{}) {
					if strings.HasPrefix(format, "WARNING: ") {
						format = strings.TrimPrefix(format, "WARNING: ")
						log.Logger(c).Warn(strings.Trim(fmt.Sprintf(format, data...), "\n"))
					} else {
						log.Logger(c).Info(strings.Trim(fmt.Sprintf(format, data...), "\n"))
					}
				}
				console.Println = func(data ...interface{}) {
					l := log.Logger(c)
					for _, d := range data {
						if ss, ok := d.(string); ok {
							ss = strings.Trim(ss, "\n")
							err := strings.Contains(ss, "Error: ")
							for _, s := range strings.Split(ss, "\n") {
								if err {
									l.Error(s)
								} else {
									l.Info(s)
								}
							}
						} else {
							l.Info(strings.Trim(fmt.Sprintf("%v", d), "\n"))
						}
					}
				}

				var certFile, keyFile string
				/*
					if config.Get("cert", "http", "ssl").Bool() {
						certFile = config.Get("cert", "http", "certFile").String()
						keyFile = config.Get("cert", "http", "keyFile").String()
					}
				*/
				srv = &gatewayDataServer{
					port:     port,
					certFile: certFile,
					keyFile:  keyFile,
				}
				if er := srv.Init(ctx, mux); er != nil {
					return er
				}
				return srv.Start(c)

			}),
			service.WithHTTPStop(func(ctx context.Context, mux routing.RouteRegistrar) error {
				mux.DeregisterRoute(common.RouteBucketIO)
				mux.DeregisterRoute(common.RouteBucketData)
				mux.DeregisterRewrite("ListBucket")
				if srv != nil {
					_ = srv.Stop()
				}
				return nil
			}),
		)
	})
}

type gatewayDataServer struct {
	ctx      context.Context
	cancel   context.CancelFunc
	port     int
	certFile string
	keyFile  string
	globals  *minio.Globals
}

func (g *gatewayDataServer) Start(ctx context.Context) error {
	go minio.StartGatewayWithGlobals(g.globals, &pydio.Pydio{RuntimeCtx: ctx})
	return nil
}

func (g *gatewayDataServer) Init(ctx context.Context, mux routing.RouteRegistrar) error {
	g.ctx, g.cancel = context.WithCancel(ctx)
	g.globals = minio.NewGlobals()
	g.globals.HTTPServerExternal = true

	if rateLimit, err := strconv.Atoi(os.Getenv("CELLS_WEB_RATE_LIMIT")); err == nil {
		limiterConfig := &memorystore.Config{
			// Number of tokens allowed per interval.
			Tokens: uint64(rateLimit),
			// Interval until tokens reset.
			Interval: time.Second,
		}
		if store, err := memorystore.New(limiterConfig); err == nil {
			if mw, er := httplimit.NewMiddleware(store, httplimit.IPKeyFunc()); er == nil {
				log.Logger(ctx).Debug("Wrapping MinioMiddleware into Rate Limiter", zap.Int("reqpersec", rateLimit))
				g.globals.CustomHandlers = append(g.globals.CustomHandlers, mw.Handle)
			} else {
				log.Logger(ctx).Warn("Could not initialize RateLimiter for minio: "+er.Error(), zap.Error(er))
			}
		} else {
			log.Logger(ctx).Warn("Could not initialize RateLimiter for minio: "+err.Error(), zap.Error(err))
		}
	}

	g.globals.CustomHandlers = append(g.globals.CustomHandlers,
		middleware.HttpTracingMiddleware("minio"),
		propagator.HttpContextMiddleware(middleware.ClientConnIncomingContext(ctx)),
		propagator.HttpContextMiddleware(middleware.RegistryIncomingContext(ctx)),
		hooks.GetPydioAuthHandlerFunc(ctx),
	)

	configDir, _ := runtime.ServiceDataDir(common.ServiceGatewayData)
	g.globals.CliContext = &minio.CliContext{
		Quiet:      true,
		ConfigDir:  minio.NewConfigDir(filepath.Join(configDir, "cfg")),
		CertsDir:   minio.NewConfigDir(filepath.Join(configDir, "certs")),
		CertsCADir: minio.NewConfigDir(filepath.Join(configDir, "certs", "CAs")),
	}
	g.globals.ActiveCred, _ = auth.CreateCredentials(common.S3GatewayRootUser, common.S3GatewayRootPassword)
	g.globals.ConfigEncrypted = true
	g.globals.Context = g.ctx

	router := minio.CreateGatewayRouter(g.globals)
	// Wrap to patch list bucket request
	handler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		patchListBucketRequest(request)
		// Underlying Gateway middlewares expect the ResponseWriter to be http.Flusher
		// Make sure it conforms to this interface
		router.ServeHTTP(&flusher{ResponseWriter: writer}, request)
	})
	mux.Route(common.RouteBucketIO).Handle("", handler)
	mux.Route(common.RouteBucketIO).Handle("/", handler)
	mux.Route(common.RouteBucketData).Handle("", handler)
	mux.Route(common.RouteBucketData).Handle("/", handler)
	mux.RegisterRewrite("ListBucket", rewriteListBucketRequest)

	return nil
}

func (g *gatewayDataServer) Stop() error {
	if g.cancel != nil {
		g.cancel()
	}

	return nil
}

type flusher struct {
	http.ResponseWriter
}

func (f *flusher) Flush() {
	if fl, ok := f.ResponseWriter.(http.Flusher); ok {
		fl.Flush()
	}
}
