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

package grpc

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/update"
	"github.com/pydio/cells/common/service/context"
	update2 "github.com/pydio/cells/discovery/update"
)

type Handler struct{}

func (h *Handler) UpdateRequired(ctx context.Context, request *update.UpdateRequest, response *update.UpdateResponse) error {

	var configs common.ConfigValues
	var cMap config.Map
	if e := config.Get("services", servicecontext.GetServiceName(ctx)).Scan(&cMap); e == nil {
		configs = &cMap
	} else {
		log.Logger(ctx).Error("Cannot load last configs for update service, using context configs", zap.Error(e))
		configs = servicecontext.GetConfig(ctx)
	}
	binaries, e := update2.LoadUpdates(ctx, configs)
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return e
	}
	response.Channel = configs.String("channel")
	response.AvailableBinaries = binaries

	return nil
}

func (h *Handler) ApplyUpdate(ctx context.Context, request *update.ApplyUpdateRequest, response *update.ApplyUpdateResponse) error {

	var configs common.ConfigValues
	var cMap config.Map
	if e := config.Get("services", servicecontext.GetServiceName(ctx)).Scan(&cMap); e == nil {
		configs = &cMap
	} else {
		log.Logger(ctx).Error("Cannot load last configs for update service, using context configs", zap.Error(e))
		configs = servicecontext.GetConfig(ctx)
	}
	binaries, e := update2.LoadUpdates(ctx, configs)
	if e != nil {
		log.Logger(ctx).Error("Failed retrieving available updates", zap.Error(e))
		return e
	}
	var apply *update.Package
	for _, binary := range binaries {
		if binary.Version == request.TargetVersion {
			apply = binary
		}
	}
	if apply == nil {
		return fmt.Errorf("cannot find the requested version")
	}

	log.Logger(ctx).Info("Update binary now", zap.Any("package", apply))

	// Defining new Context
	newCtx := context.Background()
	err := update2.ApplyUpdate(newCtx, apply, configs, false)
	if err != nil {
		log.Logger(ctx).Error("Failed updating binary", zap.Error(err))
		return err
	}
	response.Success = true
	response.Message = "Update success - Please restart now!"

	log.Logger(ctx).Info("Update success - Please restart!")
	// Double check if we are on a protected port and log a hint in such case.
	intURL, _ := url.Parse(config.Get("defaults", "urlInternal").String(""))
	port, err := strconv.Atoi(intURL.Port())
	if err == nil && port < 1024 {
		log.Logger(ctx).Warn("*******************************************************************")
		log.Logger(ctx).Warn(fmt.Sprintf("   WARNING: you are using the reserved port %d.   ", port))
		log.Logger(ctx).Warn("   You must execute following command to authorize the new binary")
		log.Logger(ctx).Warn("   to use this port *before* restarting your instance:")
		log.Logger(ctx).Warn("   $ sudo setcap 'cap_net_bind_service=+ep' <path to your binary>")
		log.Logger(ctx).Warn("*******************************************************************")
	}

	return nil
}
