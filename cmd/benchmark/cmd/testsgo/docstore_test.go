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

package tests

func init() {

	register("DocStore", map[string]map[string]string{
		"create": {
			"PutDocument": `{"StoreId": "test", "DocumentId": "{{.Random}}", "Document": {"ID": "{{.Random}}", "Type": 0, "Owner": "test", "Data": "test"}}`,
		},
		"update": {
			"GetDocument":    `{"StoreId": "test", "DocumentId": "{{.Random}}"}`,
			"CountDocuments": `{"StoreId": "test", "Query": {"ID": "{{.Random}}", "Owner": "test", "MetaQuery": "t"}}`,
			"ListDocuments":  `{"StoreId": "test", "Query": {"ID": "{{.Random}}", "Owner": "test", "MetaQuery": "t"}}`,
		},
		"delete2": {
			"DeleteDocuments": `{}`,
		},
	})
}
