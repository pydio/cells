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

package crypto

import (
	"crypto/rand"
	"encoding/base64"
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	password = "password"
	keySize  = 32
	key      []byte
	plain    []byte
	ciphered []byte
)

func Test(t *testing.T) {

	Convey("Derive password", t, func() {
		key = KeyFromPassword([]byte(password), keySize)
		So(key, ShouldNotBeNil)
		So(len(key), ShouldEqual, keySize)

		plain = make([]byte, 64)
		_, err := rand.Read(plain)
		So(err, ShouldBeNil)

		ciphered, err = Seal(key, plain)
		So(err, ShouldBeNil)
		So(ciphered, ShouldNotBeNil)

		deciphered, err := Open(key, ciphered[:12], ciphered[12:])
		So(err, ShouldBeNil)
		So(deciphered, ShouldNotBeNil)
		So(base64.StdEncoding.EncodeToString(deciphered), ShouldEqual, base64.StdEncoding.EncodeToString(plain))
	})

}
