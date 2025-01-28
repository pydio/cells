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
	version "github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
)

func init() {
	v, _ := version.NewVersion("4.1.99")
	add(v, getMigration(upgradeDefaultWebTheme))
}

// upgradeDefaultWebTheme change preset theme value to material
func upgradeDefaultWebTheme(conf configx.Values) error {

	theme := conf.Val(config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "GUI_THEME")...)
	if theme.String() == "light" {
		_ = theme.Set("mui3")
	}

	return nil
}
