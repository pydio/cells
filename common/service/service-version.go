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
	"context"
	"io/ioutil"
	"os"
	"path/filepath"

	"github.com/hashicorp/go-version"
	"go.uber.org/zap"

	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

type Migration struct {
	TargetVersion *version.Version
	Up            func(ctx context.Context) error
	Down          func(ctx context.Context) error
}

// Create a version.NewVersion ignoring the error
func ValidVersion(v string) *version.Version {
	obj, _ := version.NewVersion(v)
	return obj
}

func FirstRun() *version.Version {
	obj, _ := version.NewVersion("0.0.0")
	return obj
}

func Latest() *version.Version {
	return common.Version()
}

// LastKnownVersion looks on this server if there was a previous version of this service
func LastKnownVersion(serviceName string) (v *version.Version, e error) {

	serviceDir, e := config.ServiceDataDir(serviceName)
	if e != nil {
		return nil, e
	}
	versionFile := filepath.Join(serviceDir, "version")
	if data, err := ioutil.ReadFile(versionFile); err != nil {
		if os.IsNotExist(err) {
			fake, _ := version.NewVersion("0.0.0")
			return fake, nil
		} else {
			return nil, err
		}
	} else {
		return version.NewVersion(strings.TrimSpace(string(data)))
	}

}

// UpdateVersion writes the version string to file
func UpdateVersion(serviceName string, v *version.Version) error {

	if dir, err := config.ServiceDataDir(serviceName); err == nil {
		versionFile := filepath.Join(dir, "version")
		return ioutil.WriteFile(versionFile, []byte(v.String()), 0755)
	} else {
		return err
	}

}

func UpdateServiceVersion(s Service) error {
	options := s.Options()
	newVersion, _ := version.NewVersion(options.Version)
	if lastVersion, e := LastKnownVersion(options.Name); e == nil {

		writeVersion, err := ApplyMigrations(options.Context, lastVersion, newVersion, options.Migrations)
		if writeVersion != nil {
			if e := UpdateVersion(options.Name, writeVersion); e != nil {
				log.Logger(options.Context).Error("could not write version file", zap.Error(e))
			}
		}
		return err
	} else {
		return e
	}

}

// ApplyMigrations browse migrations upward on downward and apply them sequentially. It returns a version to be
// saved as the current valid version of the service, or nil if no changes were necessary
func ApplyMigrations(ctx context.Context, current *version.Version, target *version.Version, migrations []*Migration) (*version.Version, error) {

	if target.Equal(current) {
		return nil, nil
	}

	if migrations == nil {
		return target, nil
	}

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
