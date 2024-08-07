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
	"context"
	"testing"

	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"

	. "github.com/smartystreets/goconvey/convey"
)

const (
	// Put valid information below to test on your workstation.
	// Beware to *not* commit your password
	test_username        = "fromTest@example.com"
	test_pwd             = ""
	test_userDisplayName = "From Test"
	test_toAddress       = "toTest@example.com"
	test_toDisplayName   = "To Test"
)

func TestSmtp_Send(t *testing.T) {
	Convey("Test Sending w/ SMTP over gmail", t, func() {

		conf := configx.New()
		conf.Val("host").Set("smtp.gmail.com")
		conf.Val("port").Set(float64(587))

		// Put a working user/when testing on your workstation. Beware to *not* commit your password
		conf.Val("user").Set(test_username)
		conf.Val("clearPass").Set(test_pwd)

		email := &mailer.Mail{}
		email.From = &mailer.User{
			Address: test_username,
			Name:    test_userDisplayName,
		}
		email.To = []*mailer.User{{
			Address: test_toAddress,
			Name:    test_toDisplayName,
		}}

		email.Subject = "Test Email Sent from Go w. SMTP"
		email.ContentPlain = "Hey, how are you ? This is now a success test."

		buildFromWelcomeTemplate(email, email.To[0])

		smtp := &Smtp{}
		err := smtp.Configure(context.Background(), conf)
		So(err, ShouldBeNil)

		err = smtp.Send(context.Background(), email)
		if test_pwd == "" { // usual case when not in dev mode
			So(err, ShouldNotBeNil)
		} else {
			So(err, ShouldBeNil)
		}
	})
}
