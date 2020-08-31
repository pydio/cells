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
	"os"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/x/configx"
)

var (
	tmpDbFilePath string
	conf          configx.Values
)

func init() {
	// Define parameters to shorten tests launch
	tmpDbFilePath = os.TempDir() + "/bolt-test.db"
	conf = configx.NewMap()
	conf.Val("QueueMaxSize").Set(int64(10))
}

func TestEmptyDao(t *testing.T) {

	Convey("Test initialize BoltDB DAO", t, func() {
		bq, e := NewBoltQueue(tmpDbFilePath, true)
		if e != nil {
			fmt.Println("Cannot initialise bolt queue at " + tmpDbFilePath)
			fmt.Println("error: " + e.Error())
		}
		So(e, ShouldBeNil)
		So(bq, ShouldNotBeNil)
		defer bq.db.Close()
	})

}

func TestEnqueueMail(t *testing.T) {

	queue, _ := NewBoltQueue(tmpDbFilePath, true)

	email := &mailer.Mail{
		To: []*mailer.User{{
			Address: "recipient@example.com",
			Name:    "Recipient",
		}},
		From: &mailer.User{
			Address: "sender@example.com",
			Name:    "Sender",
		},
		Subject:      "Pydio Services coverage test",
		ContentPlain: "This is a test",
	}

	email2 := &mailer.Mail{}
	*email2 = *email
	email2.Subject = "Second email"

	Convey("Test push", t, func() {

		err := queue.Push(email)
		So(err, ShouldBeNil)

		var consumedMail *mailer.Mail
		queue.Consume(func(email *mailer.Mail) error {
			consumedMail = email
			return nil
		})

		So(consumedMail, ShouldNotBeNil)
		So(consumedMail.GetFrom().Name, ShouldEqual, "Sender")

		err = queue.Push(email2)
		So(err, ShouldBeNil)

		// We should only retrieve 2nd email
		i := 0
		queue.Consume(func(email *mailer.Mail) error {
			consumedMail = email
			i++
			return nil
		})
		So(consumedMail, ShouldNotBeNil)
		So(consumedMail.GetSubject(), ShouldEqual, "Second email")
		So(i, ShouldEqual, 1)
	})
}
