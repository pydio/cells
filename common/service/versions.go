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
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pydio/cells/v4/common/runtime"

	version "github.com/hashicorp/go-version"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
)

// Migration defines a target version and functions to upgrade and/or downgrade.
type Migration struct {
	TargetVersion *version.Version
	Up            func(ctx context.Context) error
	Down          func(ctx context.Context) error
}

// ValidVersion creates a version.NewVersion ignoring the error.
func ValidVersion(v string) *version.Version {
	obj, _ := version.NewVersion(v)
	return obj
}

// FirstRun returns version "zero".
func FirstRun() *version.Version {
	obj, _ := version.NewVersion("0.0.0")
	return obj
}

// Latest retrieves current common Cells version.
func Latest() *version.Version {
	return common.Version()
}

// UpdateServiceVersion applies migration(s) if necessary and stores new current version for future use.
func UpdateServiceVersion(opts *ServiceOptions) error {
	newVersion, _ := version.NewVersion(opts.Version)
	lastVersion, e := lastKnownVersion(opts.Name)
	if e != nil {
		return fmt.Errorf("cannot update service version for %s (%v)", opts.Name, e)
	}

	writeVersion, err := applyMigrations(opts.Context, lastVersion, newVersion, opts.Migrations)
	if writeVersion != nil {
		if e := updateVersion(opts.Name, writeVersion); e != nil {
			log.Logger(opts.Context).Error("could not write version file", zap.Error(e))
		}
	}
	if err != nil {
		return fmt.Errorf("cannot update service version for %s (%v)", opts.Name, err)
	}
	return nil
}

// lastKnownVersion looks on this server if there was a previous version of this service
func lastKnownVersion(serviceName string) (v *version.Version, e error) {
	versionFile := runtime.ConfigURL() + "/" + filepath.Join("services", serviceName, "version")

	store, err := config.OpenStore(context.Background(), versionFile+"?encode=string")
	if err != nil {
		fmt.Println("Could not open store ?", err)
		return nil, err
	}

	return version.NewVersion(strings.TrimSpace(store.Get().Default("0.0.0").String()))
}

// updateVersion writes the version string to file
func updateVersion(serviceName string, v *version.Version) error {
	versionFile := runtime.ConfigURL() + "/" + filepath.Join("services", serviceName, "version")

	store, err := config.OpenStore(context.Background(), versionFile+"?encode=string")
	if err != nil {
		return err
	}

	if err := store.Set(v.String()); err != nil {
		return err
	}

	if err := store.Save("system", "updating system version"); err != nil {
		return err
	}

	return nil
}

// applyMigrations browse migrations upward on downward and apply them sequentially. It returns a version to be
// saved as the current valid version of the service, or nil if no changes were necessary. In specific case where
// current version is 0.0.0 (first run), it only applies first run migration (if any) and returns target version.
func applyMigrations(ctx context.Context, current *version.Version, target *version.Version, migrations []*Migration) (*version.Version, error) {

	if target.Equal(current) {
		return nil, nil
	}

	// Special case if we're in dev and moving from 0.2.0 to a dev
	if strings.HasSuffix(target.String(), "-dev") && current.String() == "0.2.0" {
		return target, nil
	}

	if migrations == nil {
		return target, nil
	}

	// corner case of the fresh install, returns the current target version to be stored
	if current.Equal(FirstRun()) {
		m := migrations[0]

		// Double check to insure we really only perform FirstRun initialisation
		if !m.TargetVersion.Equal(FirstRun()) {
			// no first run init, doing nothing
			return target, nil
		}

		log.Logger(ctx).Debug(fmt.Sprintf("About to initialise service at version %s", target.String()))
		err := m.Up(ctx)
		if err != nil {
			log.Logger(ctx).Error(fmt.Sprintf("could not initialise service at version %s", target.String()), zap.Error(err))
			return current, err
		}
		return target, nil
	}

	log.Logger(ctx).Debug(fmt.Sprintf("About to perform migration from %s to %s", current.String(), target.String()))

	if target.GreaterThan(current) {

		var successVersion *version.Version
		for _, migration := range migrations {
			v := migration.TargetVersion
			if migration.Up != nil && (current.String() == "0.0.0" || v.GreaterThan(current)) && (v.LessThan(target) || v.Equal(target)) {
				if err := migration.Up(ctx); err != nil {
					return successVersion, err
				}
				successVersion, _ = version.NewVersion(v.String())
			}
		}

	}

	if target.LessThan(current) {

		var successVersion *version.Version
		for i := len(migrations) - 1; i >= 0; i-- {
			migration := migrations[i]
			v := migration.TargetVersion
			if migration.Down != nil && v.GreaterThan(target) && (v.LessThan(current) || v.Equal(current)) {
				if err := migration.Down(ctx); err != nil {
					return successVersion, err
				}
				successVersion, _ = version.NewVersion(v.String())
			}
		}

	}

	return target, nil
}
