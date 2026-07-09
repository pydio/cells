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

package sql

import (
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestNewStorageDSN(t *testing.T) {
	Convey("NewStorageDSN", t, func() {

		Convey("Unix socket connections", func() {
			cases := []struct {
				name   string
				dsn    string
				dbName string
			}{
				{
					name:   "standard socket path",
					dsn:    "mysql://pydio:pydio@unix(/run/mysqld/mysqld.sock)/cells?parseTime=true",
					dbName: "cells",
				},
				{
					name:   "root user no password",
					dsn:    "mysql://root@unix(/var/run/mysqld/mysqld.sock)/cells?parseTime=true",
					dbName: "cells",
				},
				{
					name:   "tmp socket path",
					dsn:    "mysql://admin:secret@unix(/tmp/mysql.sock)/mydb?parseTime=true",
					dbName: "mydb",
				},
			}

			for _, tc := range cases {
				Convey(tc.name, func() {
					sd, err := NewStorageDSN(tc.dsn)
					So(err, ShouldBeNil)
					So(sd.Driver(), ShouldEqual, "mysql")
					So(sd.DBName(), ShouldEqual, tc.dbName)
					So(sd.DSN(), ShouldContainSubstring, "unix(")
					So(sd.DSN(), ShouldNotContainSubstring, "missing port")
				})
			}
		})

		Convey("Unix socket reserved vars are extracted and not leaked", func() {
			dsn := "mysql://pydio:pydio@unix(/run/mysqld/mysqld.sock)/cells?parseTime=true&prefix=mypfx&singular=true&policies=pol1"
			sd, err := NewStorageDSN(dsn)
			So(err, ShouldBeNil)
			So(sd.GetReservedVar("prefix"), ShouldEqual, "mypfx")
			So(sd.GetReservedVar("singular"), ShouldEqual, "true")
			So(sd.GetReservedVar("policies"), ShouldEqual, "pol1")
			So(sd.DSN(), ShouldNotContainSubstring, "prefix=")
			So(sd.DSN(), ShouldNotContainSubstring, "singular=")
		})

		Convey("TCP connections still work after unix socket fix", func() {
			cases := []struct {
				name   string
				dsn    string
				dbName string
			}{
				{
					name:   "tcp with port",
					dsn:    "mysql://admin:admin@tcp(127.0.0.1:3306)/cells?parseTime=true",
					dbName: "cells",
				},
				{
					name:   "tcp localhost",
					dsn:    "mysql://root:secret@tcp(localhost:3306)/mydb?parseTime=true",
					dbName: "mydb",
				},
			}

			for _, tc := range cases {
				Convey(tc.name, func() {
					sd, err := NewStorageDSN(tc.dsn)
					So(err, ShouldBeNil)
					So(sd.Driver(), ShouldEqual, "mysql")
					So(sd.DBName(), ShouldEqual, tc.dbName)
					So(strings.Contains(sd.DSN(), "unix("), ShouldBeFalse)
				})
			}
		})

		Convey("SQLite DSNs are unaffected", func() {
			sd, err := NewStorageDSN("sqlite:///tmp/cells.db?prefix=test")
			So(err, ShouldBeNil)
			So(sd.Driver(), ShouldEqual, "sqlite")
		})

		Convey("Error cases", func() {
			Convey("Missing scheme returns error", func() {
				_, err := NewStorageDSN("admin:admin@unix(/run/mysqld/mysqld.sock)/cells")
				So(err, ShouldNotBeNil)
			})

			Convey("Unsupported scheme returns error", func() {
				_, err := NewStorageDSN("ftp://admin:admin@localhost/cells")
				So(err, ShouldNotBeNil)
			})

			Convey("Empty DSN returns error", func() {
				_, err := NewStorageDSN("")
				So(err, ShouldNotBeNil)
			})
		})
	})
}
