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

package migrations

import (
	"log"
	"path"

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/utils/configx"
)

func init() {

	v, _ := version.NewVersion("2.1.0")
	add(v, getMigration(moveConnectors))
	add(v, getMigration(movePydioConnectors))
}

func moveConnectors(config configx.Values) error {
	return UpdateKeys(config, map[string]string{
		"services/pydio.grpc.auth/dex/connectors": "services/" + common.ServiceWebNamespace_ + common.ServiceOAuth + "/connectors",
	})
}

func movePydioConnectors(config configx.Values) error {

	var c interface{}
	var connectors []map[string]interface{}

	err := config.Val("services/" + common.ServiceWebNamespace_ + common.ServiceOAuth + "/connectors").Scan(&c)
	if err != nil {
		return err
	}

	var changed = false
	for _, connector := range connectors {
		typ, ok := connector["type"].(string)
		if !ok {
			log.Println("Connector type missing, skipping")
			continue
		}
		if typ == "pydio" {
			config, ok := connector["config"].(map[string][]map[string]interface{})
			if !ok {
				log.Println("Config for connector type pydio missing, skipping")
				continue
			}

			pydioconnectors, ok := config["pydioconnectors"]
			if !ok {
				log.Println("Config pydioconnectors missing, skipping")
			}

			for _, pydioconnector := range pydioconnectors {
				typ, ok := pydioconnector["type"].(string)
				if !ok {
					log.Println("Pydio Connector type missing, skipping")
					continue
				}

				if typ != "pydioapi" {
					connectors = append(connectors, pydioconnectors...)
					changed = true
				}
			}

			// deleting pydio connector config
			delete(config, "pydioconnectors")
		}
	}

	if !changed {
		return nil

	}

	d, f := path.Split("services/" + common.ServiceWebNamespace_ + common.ServiceOAuth + "/connectors")
	config.Val(d, f).Set(connectors)

	return nil
}
