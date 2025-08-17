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
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	minio "github.com/minio/minio/cmd"
	"github.com/minio/minio/pkg/console"
	"github.com/sethvargo/go-limiter/httplimit"
	"github.com/sethvargo/go-limiter/memorystore"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/server"
	serverhttp "github.com/pydio/cells/v4/common/server/http"
	"github.com/pydio/cells/v4/common/server/middleware"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/net"
	_ "github.com/pydio/cells/v4/gateway/data/gw"
	pydio "github.com/pydio/cells/v4/gateway/data/gw"
	"github.com/pydio/cells/v4/gateway/data/hooks"
)

func patchListBucketRequest(route string, request *http.Request) {
	testURI := strings.Replace(request.RequestURI, "?x-id=ListBuckets", "", 1)
	if testURI == route || testURI == route+"/" {
		request.RequestURI = "/"
		request.URL.Path = "/"
	} else if strings.HasPrefix(request.RequestURI, route+"/probe-bucket-sign*") {
		request.RequestURI = strings.TrimPrefix(request.RequestURI, route)
		request.URL.Path = request.RequestURI
	}
}

var (
	srv *gatewayDataServer
)

func init() {

	runtime.Register("main", func(ctx context.Context) {

		port := net.GetAvailablePort()

		service.NewService(
			service.Name(common.ServiceGatewayData),
			service.Context(ctx),
			service.Tag(common.ServiceTagGateway),
			service.Description("S3 Gateway to tree service"),
			service.Fork(true),
			service.WithHTTP(func(c context.Context, mux server.HttpMux) error {
				c = servicecontext.WithServiceName(ctx, common.ServiceGatewayData)
				console.Printf = func(format string, data ...interface{}) {
					if strings.HasPrefix(format, "WARNING: ") {
						format = strings.TrimPrefix(format, "WARNING: ")
						log.Logger(c).Warn(fmt.Sprintf(format, data...))
					} else {
						log.Logger(c).Info(fmt.Sprintf(format, data...))
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
							l.Info(fmt.Sprintf("%v", d))
						}
					}
				}

				u, _ := url.Parse(fmt.Sprintf("http://localhost:%d", port))
				proxy := httputil.NewSingleHostReverseProxy(u)
				mux.HandleFunc("/io/", func(writer http.ResponseWriter, request *http.Request) {
					patchListBucketRequest("/io", request)
					proxy.ServeHTTP(writer, request)
				})
				mux.HandleFunc("/data/", func(writer http.ResponseWriter, request *http.Request) {
					patchListBucketRequest("/data", request)
					proxy.ServeHTTP(writer, request)
				})

				if srv == nil {
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
					go srv.Start(c)
				}

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, mux server.HttpMux) error {
				if m, ok := mux.(server.PatternsProvider); ok {
					m.DeregisterPattern("/io/")
					m.DeregisterPattern("/data/")
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
}

func (g *gatewayDataServer) Start(ctx context.Context) error {
	os.Setenv("MINIO_BROWSER", "off")
	os.Setenv("MINIO_ROOT_USER", common.S3GatewayRootUser)
	os.Setenv("MINIO_ROOT_PASSWORD", common.S3GatewayRootPassword)

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
				minio.HookRegisterGlobalHandler(mw.Handle)
			} else {
				log.Logger(ctx).Warn("Could not initialize RateLimiter for minio: "+er.Error(), zap.Error(er))
			}
		} else {
			log.Logger(ctx).Warn("Could not initialize RateLimiter for minio: "+err.Error(), zap.Error(err))
		}
	}

	minio.HookRegisterGlobalHandler(serverhttp.ContextMiddlewareHandler(middleware.ClientConnIncomingContext(ctx)))
	minio.HookRegisterGlobalHandler(serverhttp.ContextMiddlewareHandler(middleware.RegistryIncomingContext(ctx)))
	minio.HookRegisterGlobalHandler(hooks.GetPydioAuthHandlerFunc("gateway"))
	pydio.PydioGateway = &pydio.Pydio{
		RuntimeCtx: ctx,
	}

	params := []string{"minio", "gateway", "pydio", "--address", fmt.Sprintf(":%d", g.port), "--quiet"}
	minio.Main(params)
	/*
		console := &logger{ctx: g.ctx}
		ctx, cancel := context.WithCancel(g.ctx)
		g.cancel = cancel
		gw := &pydio.Pydio{}
		go minio.StartPydioGateway(ctx, gw, fmt.Sprintf(":%d", g.port), "gateway", "gatewaysecret", console, g.certFile, g.keyFile)
	*/
	return nil
}

func (g *gatewayDataServer) Stop() error {
	if g.cancel != nil {
		g.cancel()
	}

	return nil
}
