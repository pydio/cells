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
	"os"
	"path/filepath"
	"strings"

	version "github.com/hashicorp/go-version"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

var (
	firstRun   *version.Version
	allUpdates *version.Version
)

func init() {
	firstRun, _ = version.NewVersion("0.0.0")
	allUpdates, _ = version.NewVersion("0.0.0+all")
}

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
	return firstRun
}

// FirstRunOrChange is interpreted to run on each version change
func FirstRunOrChange() *version.Version {
	return allUpdates
}

// DefaultConfigMigration registers a FirstRun to set configuration for service
func DefaultConfigMigration(serviceName string, data interface{}) *Migration {
	return &Migration{
		TargetVersion: FirstRun(),
		Up: func(ctx context.Context) error {
			return config.Set(ctx, data, "services", serviceName)
		},
	}
}

// UpdateServiceVersion applies migration(s) if necessary and stores new current version for future use.
func UpdateServiceVersion(ctx context.Context, opts *ServiceOptions) (bool, error) {

	tID := runtime.MultiContextManager().Current(ctx)
	refName := opts.Name
	if opts.MigrateIterator.ContextKey != nil {
		var s string
		if propagator.Get[string](ctx, opts.MigrateIterator.ContextKey, &s) {
			refName += "." + s
		}
	}
	var run bool
	opts.migrateOnceL.Lock()
	if !opts.migrateOnce[tID+"-"+refName] {
		run = true
		opts.migrateOnce[tID+"-"+refName] = true
	}
	opts.migrateOnceL.Unlock()
	if !run {
		return false, nil
	}

	prefix := []string{"versions", refName}

	var store config.Store
	if !propagator.Get(ctx, config.ContextKey, &store) {
		return false, fmt.Errorf("could not find config for %s during updateServiceVersion", refName)
	}

	newVersion, _ := version.NewVersion(opts.Version)
	lastVersion, e := lastKnownVersion(ctx, store, refName, prefix...)
	if e != nil {
		return false, fmt.Errorf("cannot update service version for %s (%v)", refName, e)
	}

	if len(opts.Migrations) > 0 {
		writeVersion, err := applyMigrations(ctx, lastVersion, newVersion, opts.Migrations)
		if err != nil {
			return false, fmt.Errorf("cannot update service version for %s (%v)", refName, err)
		}
		if writeVersion != nil {
			if e := updateVersion(ctx, store, refName, writeVersion, prefix...); e != nil {
				log.Logger(ctx).Error("could not write version file", zap.Error(e))
				return false, fmt.Errorf("cannot write version to file: %v", err)
			} else {
				return true, nil
			}
		}
	}
	return false, nil
}

// legacyVersionFile points to the old workingdir/services/serviceName/version
func legacyVersionFile(serviceName string) string {
	return filepath.Join(runtime.ApplicationWorkingDir(runtime.ApplicationDirServices), serviceName, "version")
}

// lastKnownVersion looks on this server if there was a previous version of this service
func lastKnownVersion(ctx context.Context, store config.Store, serviceName string, prefix ...string) (v *version.Version, e error) {

	def := strings.TrimSpace(store.Context(ctx).Val(prefix...).Default("0.0.0").String())
	if def == "0.0.0" {
		if data, err := os.ReadFile(legacyVersionFile(serviceName)); err == nil && len(data) > 0 {
			fileVersion := strings.TrimSpace(string(data))
			return version.NewVersion(fileVersion)
		}
	}
	return version.NewVersion(strings.TrimSpace(store.Context(ctx).Val(prefix...).Default("0.0.0").String()))
}

// updateVersion writes the version string to config, and eventually removes legacy version file
func updateVersion(ctx context.Context, store config.Store, serviceName string, v *version.Version, prefix ...string) error {
	if err := store.Context(ctx).Val(prefix...).Set(v.String()); err != nil {
		return err
	}

	if err := store.Save("system", "updating system version "+serviceName); err != nil {
		return err
	}

	legacy := legacyVersionFile(serviceName)
	if _, e := os.Stat(legacy); e == nil {
		// File exist, remove it now
		if os.Remove(legacy) == nil {
			// We can also remove parent folder now
			parent := filepath.Dir(legacy)
			if entries, er := os.ReadDir(parent); er == nil && len(entries) == 0 {
				fmt.Println("[config] Migrated legacy version file for " + serviceName + " (and its empty folder)")
				_ = os.Remove(parent)
			} else {
				fmt.Println("[config] Migrated legacy version file for " + serviceName)
			}
		} else {
			fmt.Println("[config] Could not remove legacy version file for " + serviceName + ": " + e.Error())
		}
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

	// Handle AllUpdates case, a.k.a run at every versions updates
	// If first run, make it a FirstRun() and prepend it to the beginning,
	// otherwise make it a Latest() and push it to the end of the list
	var mm, tcs, fr []*Migration
	isFirstRun := current.Equal(FirstRun())
	for _, m := range migrations {
		// if AllUpdates && firstRun, consider it as a FirstRun() and replace it to make sure it
		// appears in the right order
		if m.TargetVersion == allUpdates && isFirstRun {
			m = &Migration{TargetVersion: FirstRun(), Up: m.Up, Down: m.Down}
		}
		if m.TargetVersion == FirstRun() {
			fr = append(fr, m)
		} else if m.TargetVersion == allUpdates {
			// not first run, register for current and push to the end
			tcs = append(tcs, &Migration{TargetVersion: common.Version(), Up: m.Up, Down: m.Down})
		} else {
			mm = append(mm, m)
		}
	}
	if isFirstRun {
		// first runs + migrations
		migrations = append(fr, mm...)
	} else {
		// migrations + latest updates
		migrations = append(mm, tcs...)
	}

	// corner case of the fresh install, returns the current target version to be stored
	if current.Equal(FirstRun()) {

		for _, m := range migrations {
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
