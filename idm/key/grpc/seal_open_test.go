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

package grpc

import (
	"crypto/rand"
	"encoding/base64"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/encryption"
)

var data *encryption.Key

var k []byte

func TestAll(t *testing.T) {

	Convey("Test INIT AND OPEN AND SEAL data", t, func() {
		k := make([]byte, 32)
		n, err := rand.Read(k)

		So(n, ShouldEqual, 32)
		So(err, ShouldBeNil)

		bytes := make([]byte, 100)
		n, err = rand.Read(bytes)
		So(n, ShouldEqual, 100)
		So(err, ShouldBeNil)

		data := new(encryption.Key)
		data.Content = base64.StdEncoding.EncodeToString(bytes)

		err = seal(data, k)
		So(err, ShouldBeNil)

		err = open(data, k)
		So(err, ShouldBeNil)
	})
}
