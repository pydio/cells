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

package auth

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

const (
	md5pw  = "33d8bdb9f1bf67a7467bca59eccb18b0"
	testPw = `sha256:1000:Xx6Kf8nBRb/RnJJvZGMdgricbJFpZQlahrDOeWf/Ycw=:LlCexjaB6aWT3QuYoMz2YdbymCjPFo2V`
)

func TestCheckLegacyPasswordPydio(t *testing.T) {

	Convey("Test Legacy Password", t, func() {
		hasher := PydioPW{
			PBKDF2_HASH_ALGORITHM: "sha256",
			PBKDF2_ITERATIONS:     1000,
			PBKDF2_SALT_BYTE_SIZE: 32,
			PBKDF2_HASH_BYTE_SIZE: 24,
			HASH_SECTIONS:         4,
			HASH_ALGORITHM_INDEX:  0,
			HASH_ITERATION_INDEX:  1,
			HASH_SALT_INDEX:       2,
			HASH_PBKDF2_INDEX:     3,
		}

		ok, err := hasher.CheckDBKDF2PydioPwd("P@ssw0rd", testPw, true)
		So(ok, ShouldBeTrue)
		So(err, ShouldBeNil)
	})
}

func TestCreatedPasswordPydio(t *testing.T) {

	Convey("Test Created Password", t, func() {

		hasher := PydioPW{
			PBKDF2_HASH_ALGORITHM: "sha256",
			PBKDF2_ITERATIONS:     1000,
			PBKDF2_SALT_BYTE_SIZE: 32,
			PBKDF2_HASH_BYTE_SIZE: 24,
			HASH_SECTIONS:         4,
			HASH_ALGORITHM_INDEX:  0,
			HASH_ITERATION_INDEX:  1,
			HASH_SALT_INDEX:       2,
			HASH_PBKDF2_INDEX:     3,
		}

		hash := hasher.CreateHash("P@ssw0rd")
		ok, err := hasher.CheckDBKDF2PydioPwd("P@ssw0rd", hash)

		So(ok, ShouldBeTrue)
		So(err, ShouldBeNil)

	})

}

func TestCheckPasswordMd5(t *testing.T) {

	Convey("Test MD5 Password", t, func() {

		hasher := PydioPW{
			PBKDF2_HASH_ALGORITHM: "sha256",
			PBKDF2_ITERATIONS:     1000,
			PBKDF2_SALT_BYTE_SIZE: 32,
			PBKDF2_HASH_BYTE_SIZE: 24,
			HASH_SECTIONS:         4,
			HASH_ALGORITHM_INDEX:  0,
			HASH_ITERATION_INDEX:  1,
			HASH_SALT_INDEX:       2,
			HASH_PBKDF2_INDEX:     3,
		}

		ok, err := hasher.CheckDBKDF2PydioPwd("pbkdf2", md5pw)
		So(ok, ShouldBeTrue)
		So(err, ShouldBeNil)

	})

}
