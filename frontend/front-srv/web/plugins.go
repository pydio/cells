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
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/frontend/front-srv/web/index"
)

var (
	Name = common.SERVICE_API_NAMESPACE_ + common.SERVICE_FRONTPLUGS
)

func init() {
	service.NewService(
		service.Name(Name),
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
					httpFs := frontend.GetPluginsFS()
					http.Handle("/", http.FileServer(httpFs))

					h := index.NewHandler()
					http.Handle("/gui", h)

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

// DeployAssets is called at the very first run
func DeployAssets(ctx context.Context) error {
	// Assets are deployed at install time, but they could be deployed here?
	return nil
}

// OverrideAssets is called whenever there is a version change to update the PHP resources
func OverrideAssets(ctx context.Context) error {

	dir := filepath.Join(config.ApplicationDataDir(), "static", "pydio")
	if _, e := os.Stat(dir); e != nil {
		// Frontend is probably not deployed here, just ignore
		return nil
	}

	// Restore assets inside a new directory
	updateDir := filepath.Join(dir, "update")
	os.Mkdir(updateDir, 0755)
	log.Logger(ctx).Info("Deploying new PHP assets in " + updateDir + "...")
	if err, _, _ := assets.RestoreAssets(updateDir, assets.PydioFrontBox, nil, "data"); err != nil {
		return err
	}
	log.Logger(ctx).Info("Deploying new PHP assets in " + updateDir + ": done")

	contents, _ := ioutil.ReadDir(updateDir)
	for _, info := range contents {
		base := info.Name()
		orig := filepath.Join(dir, base)
		if info.IsDir() {
			// Folders : create a .bak version
			bakPath := filepath.Join(dir, fmt.Sprintf("%s.bak", base))
			if _, e := os.Stat(bakPath); e == nil {
				os.RemoveAll(bakPath)
			}
			log.Logger(ctx).Info("Creating bak version of " + orig)
			if err := os.Rename(orig, bakPath); err != nil {
				return err
			}
		} else {
			// root files : remove original version
			if _, e := os.Stat(orig); e == nil {
				os.Remove(orig)
			}
		}
		log.Logger(ctx).Info("Now moving " + info.Name() + " to " + orig)
		if err := os.Rename(filepath.Join(updateDir, info.Name()), orig); err != nil {
			return err
		}
	}

	// Now remove update folder
	if err := os.RemoveAll(updateDir); err != nil {
		return err
	}

	// clear cache (ignore errors)
	os.RemoveAll(filepath.Join(dir, "data", "cache"))

	// TODO : clear php FMP caches & Apc Cache ?

	return nil
}
