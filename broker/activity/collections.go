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

package activity

import (
	"context"

	"github.com/golang/protobuf/proto"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/activity"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

var (
	router *views.RouterEventFilter
)

// CountCollection is a simple container for N activities.
func CountCollection(count int32) (c *activity.Object) {

	c = createObject()
	c.Type = activity.ObjectType_Collection
	c.TotalItems = count

	return c

}

// Collection groups activities into a collection.
func Collection(items []*activity.Object) (c *activity.Object) {

	c = createObject()
	c.Type = activity.ObjectType_Collection
	c.Items = items
	c.TotalItems = int32(len(items))

	return c
}

// Digest builds a digest based on user Claims that are retrieved from the context.
func Digest(ctx context.Context, items []*activity.Object) (*activity.Object, error) {

	c := createObject()
	c.Type = activity.ObjectType_Digest

	accessList, _ := permissions.AccessListFromContextClaims(ctx)
	if len(accessList.Workspaces) == 0 {
		log.Logger(ctx).Error("no workspaces found while building activity digest")
		return c, nil
	}

	r := getRouter()
	grouped := make(map[string]*activity.Object)
	for _, ac := range items {
		if ac.Type == activity.ObjectType_Event {
			ac.Markdown = "\n - " + ac.Markdown
			c.Items = append(c.Items, ac)
		}
	}
	for _, workspace := range accessList.Workspaces {
		for _, ac := range items {
			if ac.Object != nil && (ac.Object.Type == activity.ObjectType_Folder || ac.Object.Type == activity.ObjectType_Document) {
				node := &tree.Node{Uuid: ac.Object.Id, Path: ac.Object.Name}
				if filtered, ok := r.WorkspaceCanSeeNode(ctx, accessList, workspace, node); ok {
					wsColl := getOrCreateWorkspaceCollection(workspace, grouped)
					filteredActivity := proto.Clone(ac).(*activity.Object)
					filteredActivity.Object.Name = filtered.Path
					// Filter Target Path
					if filteredActivity.Target != nil {
						targetNode := &tree.Node{Path: filteredActivity.Target.Name, Uuid: filteredActivity.Target.Id}
						if targetFiltered, ok2 := r.WorkspaceCanSeeNode(ctx, accessList, workspace, targetNode); ok2 {
							filteredActivity.Target.Name = targetFiltered.Path
						} else {
							filteredActivity.Target = nil
						}
					}
					// Filter Origin Path
					if filteredActivity.Origin != nil {
						originNode := &tree.Node{Path: filteredActivity.Origin.Name, Uuid: filteredActivity.Origin.Id}
						if originFiltered, ok2 := r.WorkspaceCanSeeNode(ctx, accessList, workspace, originNode); ok2 {
							filteredActivity.Origin.Name = originFiltered.Path
						} else {
							filteredActivity.Origin = nil
						}
					}
					wsColl.Items = append(wsColl.Items, filteredActivity)
				}
			} else if ac.Type == activity.ObjectType_Share && ac.Object != nil && ac.Object.Id == workspace.UUID {
				wsColl := getOrCreateWorkspaceCollection(workspace, grouped)
				wsColl.Items = append(wsColl.Items, ac)
			}
		}
	}
	for _, workspaceCollection := range grouped {
		c.Items = append(c.Items, workspaceCollection)
	}
	c.TotalItems = int32(len(c.Items))

	return c, nil
}

// Create a simple activity object with correct JsonLdContext
func createObject() *activity.Object {
	return &activity.Object{
		JsonLdContext: "https://www.w3.org/ns/activitystreams",
	}
}

func getOrCreateWorkspaceCollection(workspace *idm.Workspace, grouped map[string]*activity.Object) *activity.Object {
	if wsColl, exists := grouped[workspace.UUID]; exists {
		return wsColl
	}
	wsColl := createObject()
	if workspace.Scope == idm.WorkspaceScope_ADMIN {
		wsColl.Type = activity.ObjectType_Workspace
	} else {
		wsColl.Type = activity.ObjectType_Cell
	}
	wsColl.Id = workspace.UUID
	wsColl.Name = workspace.Label
	grouped[workspace.UUID] = wsColl
	wsColl.Items = []*activity.Object{}
	return wsColl
}

func getRouter() *views.RouterEventFilter {
	if router == nil {
		router = views.NewRouterEventFilter(views.RouterOptions{})
	}
	return router
}
