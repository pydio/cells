/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package wopi

import (
	"context"
	"testing"
	"time"

	"github.com/pydio/cells/v5/common"
	auth2 "github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

func TestFileInfo(t *testing.T) {
	Convey("TestFileInfo", t, func() {
		builder := GetFileInfoResponseBuilder()
		ctx := context.Background()
		ctx = auth2.WithImpersonate(ctx, &idm.User{
			Login: "user1",
			Attributes: map[string]string{
				idm.UserAttrDisplayName: "User One",
			},
		})
		mtime, _ := time.Parse(time.RFC3339, "2026-01-15T12:51:21+01:00")
		node := &tree.Node{
			Path:  "/path/to/file",
			Size:  36,
			MTime: mtime.Unix(),
			MetaStore: map[string]string{
				common.MetaNamespaceNodeName: "\"baseName.docs\"",
			},
		}
		f, e := builder.Build(ctx, node, nil)
		So(e, ShouldBeNil)
		bb, _ := json.Marshal(f)
		So(string(bb), ShouldEqual, `{"BaseFileName":"baseName.docs","OwnerId":"pydio","Size":36,"UserId":"user1","Version":"1768477881","UserFriendlyName":"User One","UserCanWrite":true,"LastModifiedTime":"2026-01-15T12:51:21+01:00","PydioPath":"/path/to/file"}`)
	})
}
