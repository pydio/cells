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
	"path"
	"path/filepath"
	"time"

	servicecontext "github.com/pydio/cells/common/service/context"

	"github.com/pydio/cells/common/caddy"

	"github.com/gorilla/mux"
	"github.com/lpar/gzipped"
	"github.com/micro/go-micro"
	"github.com/micro/go-micro/broker"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/front"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/frontend/front-srv/web/index"
)

var (
	Name         = common.ServiceWebNamespace_ + common.ServiceFrontStatics
	RobotsString = `User-agent: *
Disallow: /`
)

func init() {

	plugins.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(common.ServiceGrpcNamespace_+common.ServiceFrontStatics),
			service.Context(ctx),
			service.Tag(common.ServiceTagFrontend),
			service.Description("Grpc service for internal requests about frontend manifest"),
			service.WithMicro(func(m micro.Service) error {
				mH := &index.ManifestHandler{}
				front.RegisterManifestServiceHandler(m.Server(), mH)
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
			service.WithHTTP(func() http.Handler {
				httpFs := frontend.GetPluginsFS()
				fs := gzipped.FileServer(httpFs)

				router := mux.NewRouter()

				router.Handle("/index.json", fs)
				router.PathPrefix("/plug/").Handler(http.StripPrefix("/plug/", fs))
				indexHandler := index.NewIndexHandler()
				router.HandleFunc("/robots.txt", func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(200)
					w.Header().Set("Content-Type", "text/plain")
					w.Write([]byte(RobotsString))
				})
				router.Handle("/gui", indexHandler)
				router.Handle("/user/reset-password/{resetPasswordKey}", indexHandler)
				router.Handle(path.Join(config.GetPublicBaseUri(), "{link}"), index.NewPublicHandler())

				routerWithTimeout := http.TimeoutHandler(
					router,
					15*time.Second,
					"There was a timeout while serving the request...",
				)

				// Adding subscriber
				if _, err := defaults.Broker().Subscribe(common.TopicReloadAssets, func(p broker.Publication) error {
					// Reload FS
					log.Logger(servicecontext.WithServiceName(ctx, common.ServiceGrpcNamespace_+common.ServiceFrontStatics)).Info("Reloading frontend plugins from file system")
					frontend.HotReload()
					httpFs = frontend.GetPluginsFS()
					return nil
				}); err != nil {
					return nil
				}

				return routerWithTimeout
			}),
			service.AfterStart(func(_ service.Service) error {
				return caddy.Restart()
			}),
		)
	})
}

// DropLegacyStatics removes files and references to old PHP data in configuration
func DropLegacyStatics(ctx context.Context) error {

	frontRoot := config.Get("defaults", "frontRoot").Default(filepath.Join(config.ApplicationWorkingDir(), "static", "pydio")).String()
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
