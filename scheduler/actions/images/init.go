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

// Package images provides default implementation of image related tasks.
package images

import (
	"github.com/pydio/cells/scheduler/actions"
	"github.com/pydio/cells/common/views"
)

// init auto registers image-related tasks.
func init() {

	manager := actions.GetActionsManager()

	manager.Register(thumbnailsActionName, func() actions.ConcreteAction {
		return &ThumbnailExtractor{}
	})

	manager.Register(exifTaskName, func() actions.ConcreteAction {
		return &ExifProcessor{}
	})

	manager.Register(cleanThumbTaskName, func() actions.ConcreteAction {
		return &CleanThumbsTask{}
	})

}

var (
	router *views.Router
)

func getRouter() *views.Router {
	if router == nil {
		router = views.NewStandardRouter(views.RouterOptions{AdminView: true, WatchRegistry:true})
	}
	return router
}
