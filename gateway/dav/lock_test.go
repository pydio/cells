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
	h := perUserLockHandler(context.Background(), webdav.NewMemFS(), "")

	lock := davRequest(h, "alice", "LOCK", "/", lockBody, map[string]string{"Depth": "infinity", "Timeout": "Infinite"})
	if lock.Code != http.StatusOK {
		t.Fatalf("alice LOCK /: got %d", lock.Code)
	}
	token := lock.Header().Get("Lock-Token")
	if !strings.Contains(lock.Body.String(), "Second-3600") {
		t.Errorf("Infinite timeout should be capped to one hour, got %s", lock.Body.String())
	}

	if w := davRequest(h, "bob", "PUT", "/b.txt", "x", nil); w.Code != http.StatusCreated {
		t.Errorf("bob PUT under alice's lock on /: got %d, want 201", w.Code)
	}
	if w := davRequest(h, "alice", "PUT", "/a.txt", "x", nil); w.Code != http.StatusLocked {
		t.Errorf("alice PUT without her token: got %d, want 423", w.Code)
	}
	if w := davRequest(h, "bob", "UNLOCK", "/", "", map[string]string{"Lock-Token": token}); w.Code == http.StatusNoContent {
		t.Errorf("bob must not release alice's lock")
	}
	if w := davRequest(h, "alice", "UNLOCK", "/", "", map[string]string{"Lock-Token": token}); w.Code != http.StatusNoContent {
		t.Errorf("alice UNLOCK: got %d, want 204", w.Code)
	}
}
