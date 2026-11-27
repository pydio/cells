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

package auth

import (
	"testing"
	"time"

	"github.com/pydio/cells/v5/common/auth/claim"
)

func TestValidBasicUser(t *testing.T) {
	now := time.Now()
	cases := map[string]struct {
		entry validBasicUser
		pass  string
		want  bool
	}{
		"fresh":          {validBasicUser{Hash: "pw"}, "pw", true},
		"wrong password": {validBasicUser{Hash: "pw"}, "other", false},
		"claims expired": {validBasicUser{Hash: "pw", Claims: claim.Claims{Expiry: now.Add(-time.Second)}}, "pw", false},
		"claims valid":   {validBasicUser{Hash: "pw", Claims: claim.Claims{Expiry: now.Add(time.Minute)}}, "pw", true},
	}
	for name, c := range cases {
		if got := c.entry.valid(c.pass, now); got != c.want {
			t.Errorf("%s: got %v, want %v", name, got, c.want)
		}
	}
}
