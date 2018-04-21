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
	"fmt"

	"go.uber.org/zap"

	"encoding/json"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/utils"
)

type InstallProgressEvent struct {
	Progress int
	Message  string
}

func Install(ctx context.Context, c *install.InstallConfig, publisher func(event *InstallProgressEvent)) error {

	log.Logger(ctx).Info("Starting installation now", zap.String("bindUrl", c.InternalUrl))

	if err := actionDatabaseAdd(c); err != nil {
		log.Logger(ctx).Error("Error while adding database", zap.Error(err))
		return err
	}
	publisher(&InstallProgressEvent{Message: "Created main database", Progress: 10})

	if err := actionDatasourceAdd(c); err != nil {
		log.Logger(ctx).Error("Error while adding datasource", zap.Error(err))
		return err
	}
	publisher(&InstallProgressEvent{Message: "Created default datasources", Progress: 20})

	c.ExternalFrontPlugins = fmt.Sprintf("%d", utils.GetAvailablePort())
	if err := actionConfigsSet(c); err != nil {
		log.Logger(ctx).Error("Error while getting ports", zap.Error(err))
		return err
	}
	publisher(&InstallProgressEvent{Message: "Configuration of gateway services", Progress: 30})

	publisher(&InstallProgressEvent{Message: "Deploying interface assets: this may take some time...", Progress: 40})
	if msg, err := actionFrontendsAdd(c, publisher); err != nil {
		log.Logger(ctx).Error("Error while deploying interface assets", zap.Error(err))
		return err
	} else {
		publisher(&InstallProgressEvent{Message: "Interface assets: " + msg, Progress: 90})
	}

	if err := createConfigurationFiles(c); err != nil {
		log.Logger(ctx).Error("Error while creating configuration files", zap.Error(err))
		return err
	}
	publisher(&InstallProgressEvent{Message: "Created interface config files", Progress: 99})

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
		result.Success = true
		data, _ := json.Marshal(map[string]string{"message": "successfully connected to database"})
		result.JsonResult = string(data)
		break
	case "PHP":
		result = checkPhpFpm(c)
		break
	default:
		result.Success = false
		data, _ := json.Marshal(map[string]string{"error": "unsupported check type " + name})
		result.JsonResult = string(data)
		break
	}

	return result
}
