/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package migrations

import (
	"strings"

	version "github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common/utils/configx"
)

func init() {
	v, _ := version.NewVersion("4.9.90")
	add(v, getMigration(upgradeDefaultDatabasesToV5))
}

func appendQueryPart(dsn, queryString string) string {
	if strings.Contains(dsn, "?") {
		return dsn + "&" + queryString
	} else {
		return dsn + "?" + queryString
	}
}

// upgradeDefaultWebTheme change preset theme value to material
func upgradeDefaultDatabasesToV5(conf configx.Values) error {
	type db struct {
		Driver string `json:"driver"`
		Dsn    string `json:"dsn"`
	}
	var databases map[string]*db
	err := conf.Val("databases").Scan(&databases)
	if err != nil {
		return err
	}
	if databases == nil {
		return nil
	}
	for _, d := range databases {
		switch d.Driver {
		case "mysql":
			d.Dsn = "mysql://" + d.Dsn
			d.Dsn = appendQueryPart(d.Dsn, "prefix={{.Meta.prefix}}&policies={{.Meta.policies}}&singular={{.Meta.singular}}")
		case "mongodb":
			d.Dsn = appendQueryPart(d.Dsn, "prefix={{.Meta.prefix}}")
		}
	}
	// Append bleve/bolt definitions
	databases["bolt"] = &db{
		Driver: "bolt",
		Dsn:    "boltdb://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}",
	}
	databases["bleve"] = &db{
		Driver: "bleve",
		Dsn:    "bleve://{{ autoMkdir (serviceDataDir .Service) }}/{{ .Meta.file }}",
	}

	return conf.Val("databases").Set(databases)
}
