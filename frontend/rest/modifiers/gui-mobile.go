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
	"strings"

	"github.com/mssola/user_agent"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/service/frontend"
)

// MobileRegModifier enables or disable gui.mobile depending on User-Agent request Header.
func MobileRegModifier(ctx context.Context, status frontend.RequestStatus, plugin frontend.Plugin) error {

	if plugin.GetId() != "gui.mobile" {
		return nil
	}
	mobileAgent := false
	req := status.Request
	if req != nil {
		header := strings.Join(req.Header["User-Agent"], "")
		if header != "" {
			ua := user_agent.New(header)
			mobileAgent = ua.Mobile()
		}
	}
	p := plugin.(*frontend.Cplugin)

	fullDisable := config.Get(ctx, "frontend", "plugin", "gui.mobile", "GUI_MOBILE_DISABLE").Bool()
	if mobileAgent && !fullDisable {
		p.Attrenabled = "true"
	} else {
		p.Attrenabled = "false"
	}

	return nil

}
