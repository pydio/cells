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

package crypto

import (
	"crypto/rand"
	"encoding/base64"
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	password = "password"
	keySize  = 32
	key      []byte
	plain    []byte
	ciphered []byte
)

func Test(t *testing.T) {

	convey.Convey("Derive password", t, func() {
		key = KeyFromPassword([]byte(password), keySize)
		convey.So(key, convey.ShouldNotBeNil)
		convey.So(len(key), convey.ShouldEqual, keySize)

		plain = make([]byte, 64)
		_, err := rand.Read(plain)
		convey.So(err, convey.ShouldBeNil)

		ciphered, err = Seal(key, plain)
		convey.So(err, convey.ShouldBeNil)
		convey.So(ciphered, convey.ShouldNotBeNil)

		deciphered, err := Open(key, ciphered[:12], ciphered[12:])
		convey.So(err, convey.ShouldBeNil)
		convey.So(deciphered, convey.ShouldNotBeNil)
		convey.So(base64.StdEncoding.EncodeToString(deciphered), convey.ShouldEqual, base64.StdEncoding.EncodeToString(plain))
	})

}
