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

package lib

import (
	"context"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/errors"
	sql2 "github.com/pydio/cells/v5/common/storage/sql"
)

func TestSpecificVersionsChecks(t *testing.T) {
	ctx := context.Background()

	cases := []struct {
		name      string
		driver    string
		version   string
		charset   string
		expectErr error
	}{
		{
			name:    "MariaDB 10.11 with utf8mb4 is allowed (regression: unescaped dot false positive)",
			driver:  "mysql",
			version: "10.11.14-MariaDB",
			charset: "utf8mb4",
		},
		{
			name:      "MariaDB 10.1.x with utf8mb4 is rejected",
			driver:    "mysql",
			version:   "10.1.48-MariaDB",
			charset:   "utf8mb4",
			expectErr: ErrMySQLCharsetNotSupported,
		},
		{
			name:      "MariaDB 10.1.x with distro suffix and utf8mb4 is rejected",
			driver:    "mysql",
			version:   "10.1.48-MariaDB-0+deb9u2",
			charset:   "utf8mb4",
			expectErr: ErrMySQLCharsetNotSupported,
		},
		{
			name:    "MariaDB 10.1.x with utf8mb3 is allowed",
			driver:  "mysql",
			version: "10.1.48-MariaDB",
			charset: "utf8mb3",
		},
		{
			name:      "MySQL 5.5.x with utf8mb4 is rejected",
			driver:    "mysql",
			version:   "5.5.62",
			charset:   "utf8mb4",
			expectErr: ErrMySQLCharsetNotSupported,
		},
		{
			name:      "MySQL 8.0.22 is not supported",
			driver:    "mysql",
			version:   "8.0.22",
			charset:   "utf8mb4",
			expectErr: ErrMySQLVersionNotSupported,
		},
		{
			name:    "non-mysql driver is skipped",
			driver:  "sqlite",
			version: "10.1.48-MariaDB",
			charset: "utf8mb4",
		},
	}

	Convey("specificVersionsChecks", t, func() {
		for _, tc := range cases {
			Convey(tc.name, func() {
				err := specificVersionsChecks(ctx, tc.driver, &sql2.ServerInfos{
					DbVersion: tc.version,
					DbCharset: tc.charset,
				})
				if tc.expectErr == nil {
					So(err, ShouldBeNil)
				} else {
					So(err, ShouldNotBeNil)
					So(errors.Is(err, tc.expectErr), ShouldBeTrue)
				}
			})
		}
	})
}
