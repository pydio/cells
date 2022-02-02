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

package mailer

import (
	"testing"

	"github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/mailer"
)

func TestBuildFromWelcomeTemplate(t *testing.T) {
	email := &mailer.Mail{
		To: []*mailer.User{{
			Address: "recipient@example.com",
			Name:    "Recipient",
		}},
		From: &mailer.User{
			Address: "sender@example.com",
			Name:    "sender",
		},
		Subject:      "Pydio Services coverage test",
		ContentPlain: "This is a test",
	}

	convey.Convey("Build html template", t, func() {
		err := buildFromWelcomeTemplate(email, email.To[0])
		convey.So(err, convey.ShouldBeNil)
		convey.So(email.ContentHtml, convey.ShouldNotBeEmpty)
	})

	/*
		convey.Convey("Send mail", t, func() {
			err := new(Sendmail).Send(email)
			convey.So(err, convey.ShouldBeNil)
		})
	*/
}
