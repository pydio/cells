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

package pydio8

import (
	"context"
	"testing"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/telemetry/log"
	json "github.com/pydio/cells/v5/common/utils/jsonx"

	. "github.com/smartystreets/goconvey/convey"
)

const globalMeta = `{"1":{"admin":{"/POE 3.2.pdf":{"WATCH":{"admin":"META_WATCH_CHANGE"},"BOOKMARK":{"admin":true}},"/Shared Folder":{"WATCH":{"admin":"META_WATCH_READ"},"BOOKMARK":{"admin":true}},"/Folder Only":{"BOOKMARK":{"admin":true}}},"user01":{"/logo.jpeg":{"BOOKMARK":{"admin":true}},"/logo.png":{"WATCH":{"user01":"META_WATCH_BOTH"}},"/Level1.tar.gz":{"WATCH":{"user01":"META_WATCH_READ"}}}},"66af766301b7f12199319d9555613657":{"AJXP_METADATA_SHAREDUSER":{"/SampleDOCFile_100kb.doc":{"WATCH":{"user01":"META_WATCH_CHANGE"},"BOOKMARK":{"admin":true}},"/SampleDOCFile_5000kb.doc":{"WATCH":{"user01":"META_WATCH_READ"},"BOOKMARK":{"admin":true}},"/SampleDOCFile_500kb.doc":{"WATCH":{"admin":"META_WATCH_BOTH"},"BOOKMARK":{"user01":true}},"/SamplePDFFile_5mb (1).pdf":{"WATCH":{"admin":"META_WATCH_CHANGE"}}}},"d0b6c9e4c7d42bb029a11f2020081410":{"AJXP_METADATA_SHAREDUSER":{"/":{"WATCH":{"links":"META_WATCH_BOTH"}}}}}`

func TestParseGlobalMeta(t *testing.T) {

	Convey("Test Parse Global Meta", t, func() {

		var data P8GlobalMeta
		e := json.Unmarshal([]byte(globalMeta), &data)
		So(e, ShouldBeNil)
		log.Logger(context.Background()).Info("data", zap.Any("data", data))
		So(data, ShouldHaveLength, 3)
		So(data["1"], ShouldNotBeNil)
		So(data["1"], ShouldHaveLength, 2)
		So(data["1"]["admin"], ShouldHaveLength, 3)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Watches, ShouldHaveLength, 1)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Bookmark, ShouldHaveLength, 1)
		So(data["1"]["admin"]["/POE 3.2.pdf"].Bookmark["admin"], ShouldBeTrue)

		So(data["1"]["admin"]["/Folder Only"].Watches, ShouldBeNil)
	})

}
