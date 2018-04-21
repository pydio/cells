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

// Package web is a service for providing additional plugins to PHP frontend
package web

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/pydio/cells/assets"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
)

func init() {
	service.NewService(
		service.Name(common.SERVICE_API_NAMESPACE_+common.SERVICE_FRONTPLUGS),
		service.Tag(common.SERVICE_TAG_FRONTEND),
		service.Description("REST service for providing additional plugins to PHP frontend"),
		service.Migrations([]*service.Migration{
			{
				TargetVersion: service.FirstRun(),
				Up:            DeployAssets,
			},
			{
				TargetVersion: service.Latest(), // Should be triggered whatever the version if there was a change
				Up:            OverrideAssets,
			},
		}),
		service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
			cfg := servicecontext.GetConfig(ctx)

			port := cfg.Int("port", 9025)

			return service.RunnerFunc(func() error {

					boxes := frontend.GetRegisteredPluginBoxes()
					httpFs := frontend.NewUnionHttpFs(boxes...)
					http.Handle("/", http.FileServer(httpFs))
					http.ListenAndServe(fmt.Sprintf(":%d", port), nil)

					return nil
				}), service.CheckerFunc(func() error {
					return nil
				}), service.StopperFunc(func() error {
					return nil
				}), nil
		}),
	)
}

func DeployAssets(ctx context.Context) error {
	// Assets are deployed at install time, but they could be deployed here?
	return nil
}

func OverrideAssets(ctx context.Context) error {

	dir := filepath.Join(config.ApplicationDataDir(), "static", "pydio")
	if _, e := os.Stat(dir); e != nil {
		// Frontend is probably not deployed here, just ignore
		return nil
	}
	// Installing the php data
	for _, replace := range []string{"conf", "plugins", "core"} {
		if _, e := os.Stat(filepath.Join(dir, replace)); e != nil {
			// Frontend is probably not deployed here, just ignore
			return nil
		}
		bakPath := filepath.Join(dir, fmt.Sprintf("%s.bak", replace))
		if _, e := os.Stat(bakPath); e == nil {
			os.RemoveAll(bakPath)
		}
		if err := os.Rename(filepath.Join(dir, replace), filepath.Join(dir, fmt.Sprintf("%s.bak", replace))); err != nil {
			return err
		}
	}

	// Remove files at the root
	infos, _ := ioutil.ReadDir(dir)
	for _, fInfo := range infos {
		if !fInfo.IsDir() {
			os.Remove(fInfo.Name())
		}
	}

	if err, _, _ := assets.RestoreAssets(dir, assets.PydioFrontBox, nil, "data"); err != nil {
		return err
	}

	// clear cache
	if err := os.RemoveAll(filepath.Join(dir, "data", "cache")); err != nil {
		return err
	}

	// TODO
	// Also clear php FMP caches & Apc Cache, we could eventually use a direct call
	// to the fast cgi service for that?
	// See https://github.com/tomasen/fcgi_client

	return nil
}
