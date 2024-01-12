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
	"sort"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/activity"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

var (
	router *compose.Reverse
)

type sortedWs []*idm.Workspace

func (s sortedWs) Less(i, j int) bool {
	if s[i].Scope == s[j].Scope {
		return s[i].Label < s[j].Label
	}
	return s[i].Scope > s[j].Scope
}

func (s sortedWs) Len() int {
	return len(s)
}

func (s sortedWs) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

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
	if len(accessList.GetWorkspaces()) == 0 {
		log.Logger(ctx).Debug("no workspaces found while building activity digest, ignoring")
		return c, nil
	}

	r := getRouter(ctx)
	grouped := make(map[string]*activity.Object)
	for _, ac := range items {
		if ac.Type == activity.ObjectType_Event {
			ac.Markdown = "\n - " + ac.Markdown
			c.Items = append(c.Items, ac)
		}
	}

	acSet := make(map[string]struct{})
	var sorted sortedWs
	for _, ws := range accessList.GetWorkspaces() {
		sorted = append(sorted, ws)
	}
	sort.Sort(sorted)

	for _, workspace := range sorted {
		for _, ac := range items {
			if _, ok := acSet[ac.Id]; ok {
				continue
			}
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
					acSet[filteredActivity.Id] = struct{}{}
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
	wsColl.Href = workspace.Slug
	grouped[workspace.UUID] = wsColl
	wsColl.Items = []*activity.Object{}
	return wsColl
}

func getRouter(ctx context.Context) *compose.Reverse {
	if router == nil {
		router = compose.ReverseClient(ctx)
	}
	return router
}
