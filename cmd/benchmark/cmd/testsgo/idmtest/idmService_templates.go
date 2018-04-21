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

// Package idmtest performs benchmarks on Roles
package idmtest

func init() {

	// Roles
	register("RoleService.CreateRole.Label", `{"Role": {"Label": "{{.Random}}"}}`)
	register("RoleService.CreateRole.Uuid", `{"Role": {"Uuid": "{{.Random}}", "Label": "{{.Random}}"}}`)

	// Users
	register("UserService.CreateUser.Login", `{"User": 
		{
			"Login": "{{.Random}}", 
			"Password": "xxxxxxxx", 			
			"GroupPath": "/",
			"Attributes": {
				"displayName": "John Doe",
				"hidden":      "false",
				"active":      "true"
			}
		}
	}`)
	// Warning: parameters keys are uppercased when generated via protoc (First letter is lower case in the idm.proto file)
	register("UserService.BindUser.Login", `{"UserName": "{{.Random}}", "Password": "xxxxxxxx"}`)

	// Workspaces
	register("WorkspaceService.CreateWorkspace.Slug", `{"Workspace": {"Uuid": "{{.Random}}", "Label": "{{.Random}}", "Slug": "{{.Random}}"}}`)
}
