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

package mailer

import (
	"fmt"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/mailer"
)

const (
	sendmailtest_fromAddress = "" // "<an authorised user>@<host name>.<domain name>"
	sendmailtest_fromDName   = "" //"<sender Display Name>"
	sendmailtest_toAddress   = "" //"<recipient mail address>"
	sendmailtest_toDName     = "" //"<recipient Display Name>"

	// Leave this empty to use default
	sendmailtest_binaryPath = ""
	// On CentOS use:
	// sendmailtest_binaryPath = "/usr/sbin/sendmail"
)

func TestSendmail_Send(t *testing.T) {
	Convey("Test Sending w/ sendmail", t, func() {

		conf := config.NewMap()
		conf.Set("BINARY_PATH", sendmailtest_binaryPath)

		email := &mailer.Mail{}
		email.From = &mailer.User{
			Address: sendmailtest_fromAddress,
			Name:    sendmailtest_fromDName,
		}
		email.To = []*mailer.User{{
			Address: sendmailtest_toAddress,
			Name:    sendmailtest_toDName,
		}}

		email.Subject = "Test Email Sent from Go with sendmail"
		email.ContentPlain = "Hey, how are you ? This is now a success test."

		buildFromWelcomeTemplate(email, email.To[0])

		sendmail := &Sendmail{}
		err := sendmail.Configure(*conf)
		So(err, ShouldBeNil)

		err = sendmail.Send(email)
		if err != nil {
			fmt.Println("Send mail return message: " + err.Error())
		}
		// usual case when not in dev mode:
		// the sendmail application must be installed and correctly configured on this machine
		So(err, ShouldNotBeNil)
	})
}
