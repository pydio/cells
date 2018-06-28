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

// Package rest is a service for serving specific requests directly to frontend
package rest

import (
	"github.com/gobuffalo/packr"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/frontend"
)

var BasePluginsBox = frontend.PluginBox{
	Box: packr.NewBox("../../../frontend/front-srv/assets"),
	Exposes: []string{
		"access.gateway",
		"access.homepage",
		"access.settings",
		"action.share",
		"auth.pydio",
		"authfront.duosecurity",
		"authfront.http_basic",
		"authfront.http_server",
		"authfront.keystore",
		"authfront.session_login",
		"boot.conf",
		"conf.pydio",
		"core.access",
		"core.auth",
		"core.authfront",
		"core.conf",
		"core.index",
		"core.log",
		"core.mailer",
		"core.metastore",
		"core.pydio",
		"core.uploader",
		"editor.libreoffice",
		"gui.ajax",
		"gui.mobile",
		"gui.user",
		"index.pydio",
		"meta.user",
		"action.avatar",
		"action.compression",
		"action.demo_counter",
		"action.user",
		"core.activitystreams",
		"editor.browser",
		"editor.ckeditor",
		"editor.codemirror",
		"editor.diaporama",
		"editor.exif",
		"editor.infopanel",
		"editor.openlayer",
		"editor.pdfjs",
		"editor.soundmanager",
		"editor.text",
		"editor.video",
		"editor.webodf",
		"meta.comments",
		"meta.exif",
		"meta.simple_lock",
		"meta.versions",
		"uploader.html",
		"uploader.http",
	},
}

func init() {
	service.NewService(
		service.Name(common.SERVICE_REST_NAMESPACE_+common.SERVICE_FRONTEND),
		service.Tag(common.SERVICE_TAG_FRONTEND),
		service.Description("REST service for serving specific requests directly to frontend"),
		service.PluginBoxes(BasePluginsBox),
		service.WithWebSession(),
		service.WithWeb(func() service.WebHandler {
			return NewFrontendHandler()
		}),
	)
}
