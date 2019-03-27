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

// ## Frontend-related services.
//
// This package contains services required to serve the web interface. It is composed of the following services :
//
// ### pydio.web.statics
// This is a simple HTTP server for accessing to the basic resources like
// the interface index, serving the front plugins contents, and handling some specific URLs.
//
// See web/plugins.go
//
// ### pydio.grpc.frontend
// Provides a couple of frontend-specific REST APIs that are used only by the frontend clients.
// It has the particularity to implement a Web Session mechanism (using a CookieStore).
//
// See rest/plugins.go
// Services under this folder are called directly by the Http frontend
package frontend
