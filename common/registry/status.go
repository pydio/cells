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

package registry

type Status string

const (
	MetaStatusKey             = "status"
	StatusStopped      Status = "stopped"
	StatusStarting     Status = "starting"
	StatusReady        Status = "ready"
	StatusError        Status = "error"
	StatusStopping     Status = "stopping"
	StatusTransient    Status = "transient"
	StatusWaiting      Status = "waiting"
	MetaDescriptionKey        = "description"
	MetaUniqueKey             = "unique"
	MetaTimestampKey          = "timestamp"
	MetaScheme                = "scheme"
)
