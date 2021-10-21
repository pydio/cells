/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package forms

import "github.com/nicksnyder/go-i18n/i18n"

type ReplicableFields struct {
	Id          string
	Title       string
	Description string
	Mandatory   bool
	Fields      []Field
}

func (r *ReplicableFields) Serialize(T i18n.TranslateFunc) (params []*SerialFormParam) {

	mandatory := "false"
	if r.Mandatory {
		mandatory = "true"
	}

	for _, field := range r.Fields {
		serials := field.Serialize(T)
		for _, serial := range serials {
			serial.ReplicationGroup = r.Id
			serial.ReplicationTitle = T(r.Title)
			serial.ReplicationDescription = T(r.Description)
			serial.ReplicationMandatory = mandatory
			params = append(params, serial)
		}
	}

	return params
}
