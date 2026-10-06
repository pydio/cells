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

package wopi

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common"
	auth2 "github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/config/mock"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/tree"
)

func TestCollaboraFileInfo(t *testing.T) {
	Convey("TestCollaboraFileInfo", t, func() {
		_ = mock.RegisterMockConfig()
		ctx := context.Background()
		ctx = auth2.WithImpersonate(ctx, &idm.User{
			Login: "user1",
			Attributes: map[string]string{
				idm.UserAttrDisplayName: "User One",
			},
		})
		node := &tree.Node{
			Uuid: "uuid1",
			Path: "/path/to/file",
			MetaStore: map[string]string{
				common.MetaNamespaceNodeName: `"baseName.docs"`,
				common.MetaFlagReadonly:      `"false"`,
			},
			MTime: 1736938281,
			Size:  36,
		}

		Convey("With COLLABORA_DISABLE_PRINT=true", func() {
			So(config.Set(true, "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_PRINT"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.HidePrintOption, ShouldBeTrue)
			So(f.DisablePrint, ShouldBeTrue)
		})

		Convey("With COLLABORA_DISABLE_EXPORT=true", func() {
			So(config.Set(true, "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_EXPORT"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.HideExportOption, ShouldBeTrue)
			So(f.DisableExport, ShouldBeTrue)
		})

		Convey("With COLLABORA_DISABLE_SAVE=true", func() {
			So(config.Set(true, "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_SAVE"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.HideSaveOption, ShouldBeTrue)
			So(f.UserCanNotWriteRelative, ShouldBeTrue)
		})

		Convey("With COLLABORA_DISABLE_COPY=true", func() {
			So(config.Set(true, "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_COPY"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.DisableCopy, ShouldBeTrue)
		})

		Convey("With COLLABORA_DISABLE_MODE=readonly", func() {
			So(config.Set("readonly", "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_MODE"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.UserCanWrite, ShouldBeFalse)
		})

		Convey("With COLLABORA_DISABLE_MODE=comment", func() {
			So(config.Set("comment", "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_MODE"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.UserCanWrite, ShouldBeTrue)
			So(f.UserCanOnlyComment, ShouldBeTrue)
		})

		Convey("With COLLABORA_DISABLE_REPAIR=true", func() {
			So(config.Set(true, "frontend", "plugin", "editor.libreoffice", "COLLABORA_DISABLE_REPAIR"), ShouldBeNil)
			f := buildFileFromNode(ctx, node)
			So(f.HideRepairOption, ShouldBeTrue)
		})
	})
}
