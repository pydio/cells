/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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

package modifiers

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/service/frontend"
)

func MetaUserPluginModifier(ctx context.Context, status frontend.RequestStatus, plugin frontend.Plugin) error {
	if plugin.GetId() != "meta.user" {
		return nil
	}
	if status.User == nil || !status.User.Logged {
		log.Logger(ctx).Debug("Skipping Meta-User Registry Modifier as no user in context")
		return nil
	}
	if config.Get("services", common.ServiceGrpcNamespace_+common.ServiceSearch, "indexContent").Default(false).Bool() {
		plugin.ExposeConfigs(map[string]interface{}{
			"indexContent": true,
		})
	}

	return nil
}
