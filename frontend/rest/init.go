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

// Package rest is a service for serving specific requests directly to frontend
package rest

import (
	"encoding/gob"
	"os"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/service/frontend"
	front "github.com/pydio/cells/v5/frontend"
	"github.com/pydio/cells/v5/frontend/rest/modifiers"
)

var BasePluginsBox = service.PluginBox{
	Box: front.FrontendAssets,
	Exposes: []string{
		"access.directory",
		"access.gateway",
		"access.homepage",
		"access.settings",
		"action.compression",
		"action.migration",
		"action.share",
		"action.user",
		"auth.pydio",
		"authfront.session_login",
		"core.activitystreams",
		"core.auth",
		"core.authfront",
		"core.conf",
		"core.mailer",
		"core.pydio",
		"core.uploader",
		"editor.browser",
		"editor.bnote",
		"editor.ckeditor",
		"editor.codemirror",
		"editor.diaporama",
		"editor.exif",
		"editor.infopanel",
		"editor.libreoffice",
		"editor.openlayer",
		"editor.pdfjs",
		"editor.soundmanager",
		"editor.text",
		"editor.video",
		"gui.ajax",
		"gui.mobile",
		"meta.comments",
		"meta.exif",
		"meta.simple_lock",
		"meta.user",
		"meta.versions",
		"uploader.html",
		"uploader.http",
		"uploader.uppy",
	},
}

func init() {

	runtime.RegisterEnvVariable("CELLS_ENABLE_FORMS_DEVEL", "", "Display a basic UX form with all possible fields types in the UX (for React developers)", true)

	gob.Register(map[string]string{})

	frontend.RegisterPluginModifier(modifiers.MetaUserPluginModifier)
	frontend.RegisterPluginModifier(modifiers.MobileRegModifier)

	frontend.WrapAuthMiddleware(modifiers.LogoutAuth)
	frontend.WrapAuthMiddleware(modifiers.RefreshAuth)

	frontend.WrapAuthMiddleware(modifiers.LoginPasswordAuth)
	frontend.WrapAuthMiddleware(modifiers.LoginExternalAuth)
	frontend.WrapAuthMiddleware(modifiers.AuthorizationCodeAuth)

	frontend.WrapAuthMiddleware(modifiers.LoginSuccessWrapper)
	frontend.WrapAuthMiddleware(modifiers.LoginFailedWrapper)

	frontend.WrapAuthMiddleware(modifiers.AuthorizationExchangePAT)

	if os.Getenv("CELLS_ENABLE_FORMS_DEVEL") == "1" {
		config.RegisterExposedConfigs("pydio.rest.forms-devel", formDevelConfigs)
	}

}
