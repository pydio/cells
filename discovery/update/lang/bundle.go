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

// Package lang provides update-related i18n strings
package lang

import (
	"embed"
	"sync"

	"github.com/pydio/cells/v5/common/utils/i18n"
	"github.com/pydio/cells/v5/common/utils/statics"
)

var (
	//go:embed box/*.json
	content embed.FS
	bundle  *i18n.I18nBundle
	o       = sync.Once{}
)

func Bundle() *i18n.I18nBundle {
	o.Do(func() {
		bundle = i18n.NewI18nBundle(statics.AsFS(content, "box"))
	})
	return bundle
}
