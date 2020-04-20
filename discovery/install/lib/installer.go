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

// Package lib is in charge of installing cells. Used by both the Rest service and the CLI-based install.
package lib

import (
	"context"
	"encoding/json"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
)

const (
	INSTALL_ALL = 1 << iota
	INSTALL_DB
	INSTALL_DS
	INSTALL_CONFIG
	INSTALL_FRONTEND
)

type InstallProgressEvent struct {
	Progress int
	Message  string
}

func Install(ctx context.Context, c *install.InstallConfig, flags byte, publisher func(event *InstallProgressEvent)) error {

	log.Logger(ctx).Info("Starting installation now", zap.String("bindUrl", c.InternalUrl))

	if (flags&INSTALL_ALL) != 0 || (flags&INSTALL_DB) != 0 {
		if err := actionDatabaseAdd(c); err != nil {
			log.Logger(ctx).Error("Error while adding database", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created main database", Progress: 30})
	}

	if (flags&INSTALL_ALL) != 0 || (flags&INSTALL_DS) != 0 {
		if err := actionDatasourceAdd(c); err != nil {
			log.Logger(ctx).Error("Error while adding datasource", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Created default datasources", Progress: 60})
	}

	if (flags&INSTALL_ALL) != 0 || (flags&INSTALL_CONFIG) != 0 {
		if err := actionConfigsSet(c); err != nil {
			log.Logger(ctx).Error("Error while getting ports", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Configuration of gateway services", Progress: 80})
	}

	if (flags&INSTALL_ALL) != 0 || (flags&INSTALL_FRONTEND) != 0 {
		if err := actionFrontendsAdd(c); err != nil {
			log.Logger(ctx).Error("Error while creating logs directory", zap.Error(err))
			return err
		}
		publisher(&InstallProgressEvent{Message: "Creation of logs directory", Progress: 99})
	}
	return nil

}

func PerformCheck(ctx context.Context, name string, c *install.InstallConfig) *install.CheckResult {

	result := &install.CheckResult{}

	switch name {
	case "DB":
		// Create DSN
		dsn, e := dsnFromInstallConfig(c)
		if e != nil {
			result.Success = false
			data, _ := json.Marshal(map[string]string{"error": e.Error()})
			result.JsonResult = string(data)
			break
		}
		if e := checkConnection(dsn); e != nil {
			result.Success = false
			data, _ := json.Marshal(map[string]string{"error": e.Error()})
			result.JsonResult = string(data)
			break
		}
		jData := map[string]interface{}{"message": "successfully connected to database"}
		if installExists, adminExists, err := checkCellsInstallExists(dsn); err == nil {
			if installExists {
				jData["tablesFound"] = true
			}
			if adminExists {
				jData["adminFound"] = true
			}
		}
		result.Success = true
		data, _ := json.Marshal(jData)
		result.JsonResult = string(data)
		break
	default:
		result.Success = false
		data, _ := json.Marshal(map[string]string{"error": "unsupported check type " + name})
		result.JsonResult = string(data)
		break
	}

	return result
}
