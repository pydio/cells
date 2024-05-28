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

// Package web is serving the main entry points for the JS frontend
package web

import (
	"context"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/lpar/gzipped"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/routing"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/proto/front"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/service/frontend"
	"github.com/pydio/cells/v4/frontend/front-srv/web/index"
)

const (
	Name         = common.ServiceWebNamespace_ + common.ServiceFrontStatics
	RobotsString = `User-agent: *
Disallow: /`
	ResetPasswordPath = "/user/reset-password/"

	RouteFrontend = "frontend"
	RoutePublic   = "public"
)

func init() {

	routing.RegisterRoute(RouteFrontend, "Main Frontend", "/")
	routing.RegisterRoute(RoutePublic, "Public links access", "/public", routing.WithCustomResolver(func(ctx context.Context) string {
		return routing.GetPublicBaseUri()
	}))

	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceFrontStatics),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				mH := &index.ManifestHandler{HandlerName: common.ServiceGrpcNamespace_ + common.ServiceFrontStatics}
				front.RegisterManifestServiceServer(server, mH)
				return nil
			}),
		)
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.Description("WEB service for serving statics"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.ValidVersion("1.2.0"),
					Up:            DropLegacyStatics,
				},
			}),
			service.WithHTTP(func(ctx context.Context, mux routing.RouteRegistrar) error {
				httpFs := http.FS(frontend.GetPluginsFS())

				fs := gzipped.FileServer(httpFs)
				timeoutWrap := func(handler http.Handler) http.Handler {
					return http.TimeoutHandler(handler, 15*time.Second, "There was a timeout while serving the frontend resources...")
				}
				fs = timeoutWrap(fs)

				m := mux.Route(RouteFrontend)
				m.Handle("index.json", fs)
				m.Handle("plug/", fs, routing.WithStripPrefix())
				indexHandler := index.NewIndexHandler(ctx, ResetPasswordPath)
				m.Handle("robots.txt", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(200)
					w.Header().Set("Content-Type", "text/plain")
					w.Write([]byte(RobotsString))
				}))
				m.Handle("/", indexHandler, routing.WithRewriteCatchAll())
				m.Handle(ResetPasswordPath, indexHandler)

				// /public endpoint : special handler for index, redirect to /plug/ for the rest
				ph := index.NewPublicHandler(ctx)
				handler := middleware.HttpWrapperMeta(ctx, ph)
				handler = timeoutWrap(handler)
				pub := mux.Route(RoutePublic)
				pub.Handle("/", handler)
				pub.Handle("plug/", fs, routing.WithStripPrefix())

				// Adding subscriber
				_ = broker.SubscribeCancellable(ctx, common.TopicReloadAssets, func(_ context.Context, message broker.Message) error {
					log.Logger(ctx).Info("Reloading frontend plugins from file system")
					frontend.HotReload()
					httpFs = http.FS(frontend.GetPluginsFS())
					return nil
				}, broker.WithCounterName("frontend"))

				return nil
			}),
			service.WithHTTPStop(func(ctx context.Context, reg routing.RouteRegistrar) error {
				reg.DeregisterRoute(RouteFrontend)
				reg.DeregisterRoute(RoutePublic)
				return nil
			}),
		)
	})
}

// DropLegacyStatics removes files and references to old PHP data in configuration
func DropLegacyStatics(ctx context.Context) error {

	frontRoot := config.Get("defaults", "frontRoot").Default(filepath.Join(runtime.ApplicationWorkingDir(), "static", "pydio")).String()
	if frontRoot != "" {
		if er := os.RemoveAll(frontRoot); er != nil {
			log.Logger(ctx).Error("Could not remove old PHP data from "+frontRoot+". You may safely delete this folder. Error was", zap.Error(er))
		} else {
			log.Logger(ctx).Info("Successfully removed old PHP data from " + frontRoot)
		}
	}

	log.Logger(ctx).Info("Clearing unused configurations")
	config.Del("defaults", "frontRoot")
	config.Del("defaults", "fpm")
	config.Del("defaults", "fronts")
	config.Del("services", "pydio.frontends")
	if config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").String() == "" {
		config.Set("Pydio Cells", "frontend", "plugin", "core.pydio", "APPLICATION_TITLE")
	}
	if e := config.Save(common.PydioSystemUsername, "Upgrade to 1.2.0"); e == nil {
		log.Logger(ctx).Info("[Upgrade] Cleaned unused configurations")
	}

	return nil
}
