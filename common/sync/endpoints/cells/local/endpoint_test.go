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

package local

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/sync/endpoints"

	. "github.com/smartystreets/goconvey/convey"
)

func TestRouterURLOpener(t *testing.T) {
	Convey("Router URL opener parses sourceEtags", t, func() {
		ep, er := endpoints.OpenEndpoint(context.Background(), "router:///personal/admin?sourceEtags=true&renewFolderUuids=true")
		So(er, ShouldBeNil)
		l, ok := ep.(*Local)
		So(ok, ShouldBeTrue)
		So(l.Options.SourceEtags, ShouldBeTrue)
		So(l.Options.RenewFolderUuids, ShouldBeTrue)
		So(l.CoreMetaWriter, ShouldNotBeNil)

		ep, er = endpoints.OpenEndpoint(context.Background(), "router:///personal/admin")
		So(er, ShouldBeNil)
		So(ep.(*Local).Options.SourceEtags, ShouldBeFalse)
	})
}
