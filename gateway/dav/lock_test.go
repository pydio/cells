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

package dav

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"golang.org/x/net/webdav"

	"github.com/pydio/cells/v5/common/auth/claim"

	. "github.com/smartystreets/goconvey/convey"
)

const lockBody = `<?xml version="1.0"?><D:lockinfo xmlns:D="DAV:"><D:lockscope><D:exclusive/></D:lockscope><D:locktype><D:write/></D:locktype></D:lockinfo>`

func davRequest(h http.Handler, user, method, target, body string, headers map[string]string) *httptest.ResponseRecorder {
	r := httptest.NewRequest(method, target, strings.NewReader(body))
	r = r.WithContext(claim.ToContext(r.Context(), claim.Claims{Name: user}))
	for k, v := range headers {
		r.Header.Set(k, v)
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func TestPerUserLocks(t *testing.T) {
	Convey("WebDAV locks are isolated per user", t, func() {
		h := perUserLockHandler(context.Background(), webdav.NewMemFS(), "")
		lock := davRequest(h, "alice", "LOCK", "/", lockBody, map[string]string{"Depth": "infinity", "Timeout": "Infinite"})
		So(lock.Code, ShouldEqual, http.StatusOK)
		token := lock.Header().Get("Lock-Token")
		Reset(func() {
			davRequest(h, "alice", "UNLOCK", "/", "", map[string]string{"Lock-Token": token})
		})

		Convey("caps an infinite lock timeout to one hour", func() {
			So(lock.Body.String(), ShouldContainSubstring, "Second-3600")
		})

		Convey("another user can write under the locked path", func() {
			w := davRequest(h, "bob", "PUT", "/b.txt", "x", nil)
			So(w.Code, ShouldEqual, http.StatusCreated)
		})

		Convey("the lock owner cannot write without her token", func() {
			w := davRequest(h, "alice", "PUT", "/a.txt", "x", nil)
			So(w.Code, ShouldEqual, http.StatusLocked)
		})

		Convey("only the owner can release the lock, even when another user knows its token", func() {
			w := davRequest(h, "bob", "UNLOCK", "/", "", map[string]string{"Lock-Token": token})
			So(w.Code, ShouldNotEqual, http.StatusNoContent)

			w = davRequest(h, "alice", "UNLOCK", "/", "", map[string]string{"Lock-Token": token})
			So(w.Code, ShouldEqual, http.StatusNoContent)
		})
	})
}
