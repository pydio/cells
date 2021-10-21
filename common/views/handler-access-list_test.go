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

package views

import (
	"testing"

	"context"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewAccessListHandler(t *testing.T) {

	Convey("Test Simple Admin Auth", t, func() {

		h := NewAccessListHandler(true)
		So(h, ShouldNotBeNil)
		ctx := context.Background()
		out, e := h.CtxWrapper(ctx)
		So(e, ShouldBeNil)

		So(out.Value(CtxUserAccessListKey{}), ShouldBeNil)
		So(out.Value(ctxAdminContextKey{}).(bool), ShouldBeTrue)

	})
}

func TestUserAccessListHandler(t *testing.T) {

	// TODO: this fails because we don't have a real working environment
	// -> h.CtxWrapper times out after 10 minutes

	// Convey("Test Simple User Auth", t, func() {

	// 	h := NewAccessListHandler(false)
	// 	So(h, ShouldNotBeNil)

	// 	ctx := context.Background()
	// 	fakeClaims := claim.Claims{
	// 		Name:  "gateway-user",
	// 		Roles: "roles",
	// 	}

	// 	ctx = context.WithValue(ctx, claim.ContextKey, fakeClaims)
	// 	out, e := h.CtxWrapper(ctx)

	// 	So(e, ShouldBeNil)
	// 	So(out.Value(ctxAdminContextKey{}), ShouldBeNil)

	// 	workspacesKey := out.Value(ctxUserAccessListKey{})
	// 	So(workspacesKey, ShouldNotBeNil)

	// })
}

// TODO same problem as above: ReadNode times out when calling underlying wrapContext method
// func TestWrapperIsCalled(t *testing.T) {

// 	Convey("Test Wrapper is wrapping", t, func() {

// 		h := NewAccessListHandler(false)
// 		mock := NewHandlerMock()
// 		h.SetNextHandler(mock)
// 		ctx := context.Background()
// 		fakeClaims := claim.Claims{
// 			Name:  "gateway-user",
// 			Roles: "roles",
// 		}

// 		ctx = context.WithValue(ctx, claim.ContextKey, fakeClaims)
// 		h.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: "/test"}})
// 		So(mock.Context.Value(claim.ContextKey), ShouldNotBeNil)

// 	})

// }
