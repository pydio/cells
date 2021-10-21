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

// +build integration

package mailer

import (
	"context"
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/mailer"
)

const (
	// Put valid information below to test on your workstation.
	// Beware to *not* commit your password
	test_inte_username        = "euser02@vpydio.fr"
	test_inte_pwd             = "P@ssw0rd"
	test_inte_userDisplayName = "From Test"
	test_inte_toAddress       = "euser01@vpydio.fr"
	test_inte_toDisplayName   = "To Test"
)

func TestSmtpIntergrated_Send(t *testing.T) {
	Convey("Test Sending w/ SMTP over local smtp server", t, func() {

		conf := config.NewMap()
		conf.Set("host", "smtp.vpydio.fr")
		conf.Set("port", float64(465))
		// Should add self-signed CA cert into system trusted list
		// https://askubuntu.com/questions/1024300/set-company-certificate-as-trusted
		conf.Set("insecureSkipVerify", true)
		// Put a working user/when testing on your workstation. Beware to *not* commit your password
		conf.Set("user", test_inte_username)
		conf.Set("password", test_inte_pwd)

		email := &mailer.Mail{}
		email.From = &mailer.User{
			Address: test_inte_username,
			Name:    test_inte_userDisplayName,
		}
		email.To = []*mailer.User{{
			Address: test_inte_toAddress,
			Name:    test_inte_toDisplayName,
		}}

		email.Subject = "Test Email Sent from Go w. SMTP"
		email.ContentPlain = "Hey, how are you ? This is now a success test."

		buildFromWelcomeTemplate(email, email.To[0])

		smtp := &Smtp{}
		err := smtp.Configure(context.Background(), *conf)
		So(err, ShouldBeNil)

		err = smtp.Send(email)
		fmt.Printf("Error %v", err)
		So(err, ShouldBeNil)
	})
}
