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

// Package assets is based on Packr to embed static data inside the binary.
//
// It embeds the small pure-js frontend loaded at install time and the pure-JS frontend
// served to the end-users (packages separately, not committed and added a build time).
package assets

import (
	"embed"

	"github.com/pydio/cells/v5/common/utils/statics"
)

var (
	//go:embed src
	installSrc embed.FS

	// PydioInstallBox holds the root of the pydio install static files
	PydioInstallBox = statics.AsFS(installSrc, "src")
)
