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

package render

import (
	"net/url"
	"testing"

	"github.com/pydio/cells/v5/common/proto/activity"
	"github.com/pydio/cells/v5/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

func TestMarkdown(t *testing.T) {

	user := &activity.Object{
		Type: activity.ObjectType_Person,
		Id:   "john",
		Name: "John Doe",
	}

	workspace1 := &activity.Object{
		Type: activity.ObjectType_Workspace,
		Id:   "my-ws",
		Name: "User Workspace",
	}

	workspace2 := &activity.Object{
		Type: activity.ObjectType_Workspace,
		Id:   "my-ws-2",
		Name: "Other Workspace",
	}

	Convey("Test markdown rendering", t, func() {

		create := &activity.Object{
			Id:    uuid.New(),
			Type:  activity.ObjectType_Create,
			Name:  "File Create",
			Actor: user,
			Object: &activity.Object{
				Type: activity.ObjectType_Document,
				Name: "path/to/document.txt",
				Id:   "doc1",
			},
		}

		update := &activity.Object{
			Id:    uuid.New(),
			Name:  "File Update",
			Type:  activity.ObjectType_Update,
			Actor: user,
			Object: &activity.Object{
				Type: activity.ObjectType_Document,
				Name: "path/to/document.txt",
				Id:   "doc2",
			},
		}

		update2 := &activity.Object{
			Id:    uuid.New(),
			Name:  "File Update",
			Type:  activity.ObjectType_Update,
			Actor: user,
			Object: &activity.Object{
				Type: activity.ObjectType_Document,
				Name: "path/to/document2.txt",
				Id:   "doc3",
			},
		}

		folder := &activity.Object{
			Id:    uuid.New(),
			Name:  "Folder Accessed",
			Type:  activity.ObjectType_Read,
			Actor: user,
			Object: &activity.Object{
				Type: activity.ObjectType_Folder,
				Name: "path/to/Watched Folder",
				Id:   "doc4",
			},
		}

		workspace1.Items = append(workspace1.Items, create)
		workspace1.Items = append(workspace1.Items, update)
		workspace2.Items = append(workspace2.Items, update2)
		workspace2.Items = append(workspace2.Items, folder)

		digest := &activity.Object{
			Type: activity.ObjectType_Digest,
			Items: []*activity.Object{
				workspace1,
				workspace2,
			},
		}

		md := Markdown(digest, activity.SummaryPointOfView_GENERIC, "")

		So(md, ShouldEqual, `

## Workspace User Workspace
 - Document document.txt was created by John Doe
 - Document document.txt was modified by John Doe

## Workspace Other Workspace
 - Document document2.txt was modified by John Doe
 - Folder Watched Folder was accessed by John Doe`)

		serverLinks := NewServerLinks()
		serverLinks.URLS[ServerUrlTypeDocs], _ = url.Parse("http://localhost/docs/")
		serverLinks.URLS[ServerUrlTypeUsers], _ = url.Parse("http://localhost/users/")
		serverLinks.URLS[ServerUrlTypeWorkspaces], _ = url.Parse("http://localhost/workspaces/")

		md2 := Markdown(digest, activity.SummaryPointOfView_GENERIC, "", serverLinks)

		So(md2, ShouldEqual, `

## Workspace [User Workspace](http://localhost/workspaces/my-ws)
 - Document [document.txt](http://localhost/docs/doc1) was created by [John Doe](http://localhost/users/john)
 - Document [document.txt](http://localhost/docs/doc2) was modified by [John Doe](http://localhost/users/john)

## Workspace [Other Workspace](http://localhost/workspaces/my-ws-2)
 - Document [document2.txt](http://localhost/docs/doc3) was modified by [John Doe](http://localhost/users/john)
 - Folder [Watched Folder](http://localhost/docs/doc4) was accessed by [John Doe](http://localhost/users/john)`)

		md3 := Markdown(digest, activity.SummaryPointOfView_ACTOR, "", serverLinks)

		So(md3, ShouldEqual, `

## Workspace [User Workspace](http://localhost/workspaces/my-ws)
 - Created document [document.txt](http://localhost/docs/doc1)
 - Modified document [document.txt](http://localhost/docs/doc2)

## Workspace [Other Workspace](http://localhost/workspaces/my-ws-2)
 - Modified document [document2.txt](http://localhost/docs/doc3)
 - Accessed folder [Watched Folder](http://localhost/docs/doc4)`)

		t.Log(md3)

		md4 := Markdown(digest, activity.SummaryPointOfView_SUBJECT, "", serverLinks)

		So(md4, ShouldEqual, `

## Workspace [User Workspace](http://localhost/workspaces/my-ws)
 - Created by [John Doe](http://localhost/users/john)
 - Modified by [John Doe](http://localhost/users/john)

## Workspace [Other Workspace](http://localhost/workspaces/my-ws-2)
 - Modified by [John Doe](http://localhost/users/john)
 - Accessed by [John Doe](http://localhost/users/john)`)

		t.Log(md4)

		serverLinks.URLS[ServerUrlTypeDocs], _ = url.Parse("doc://")
		serverLinks.URLS[ServerUrlTypeUsers], _ = url.Parse("user://")
		serverLinks.URLS[ServerUrlTypeWorkspaces], _ = url.Parse("ws://")

		md5 := Markdown(digest, activity.SummaryPointOfView_GENERIC, "", serverLinks)

		So(md5, ShouldEqual, `

## Workspace [User Workspace](ws://my-ws)
 - Document [document.txt](doc://doc1) was created by [John Doe](user://john)
 - Document [document.txt](doc://doc2) was modified by [John Doe](user://john)

## Workspace [Other Workspace](ws://my-ws-2)
 - Document [document2.txt](doc://doc3) was modified by [John Doe](user://john)
 - Folder [Watched Folder](doc://doc4) was accessed by [John Doe](user://john)`)

		md6 := Markdown(digest, activity.SummaryPointOfView_GENERIC, "fr", serverLinks)
		t.Log(md6)

		So(md6, ShouldNotEqual, `

## Workspace [User Workspace](ws://my-ws)
 - Document [document.txt](doc://doc1) was created by [John Doe](user://john)
 - Document [document.txt](doc://doc2) was modified by [John Doe](user://john)

## Workspace [Other Workspace](ws://my-ws-2)
 - Document [document2.txt](doc://doc3) was modified by [John Doe](user://john)
 - Folder [Watched Folder](doc://doc4) was accessed by [John Doe](user://john)`)

	})

}
