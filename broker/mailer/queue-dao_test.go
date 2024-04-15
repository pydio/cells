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
	"os"
	"path/filepath"
	"testing"

	"github.com/pydio/cells/v4/common/dao/test"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	conf configx.Values
)

func init() {
	// Define parameters to shorten tests launch
	conf = configx.New()
	conf.Val("QueueMaxSize").Set(int64(10))
}

func testQueue(t *testing.T, queue Queue) {

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

	err := queue.Push(email)
	So(err, ShouldBeNil)

	var consumedMail *mailer.Mail
	e := queue.Consume(func(email *mailer.Mail) error {
		consumedMail = email
		return nil
	})
	So(e, ShouldBeNil)
	So(consumedMail, ShouldNotBeNil)
	So(consumedMail.GetFrom().Name, ShouldEqual, "Sender")

	err = queue.Push(email2)
	So(err, ShouldBeNil)

	// We should only retrieve 2nd email
	i := 0
	e = queue.Consume(func(email *mailer.Mail) error {
		consumedMail = email
		i++
		return nil
	})
	So(e, ShouldBeNil)
	So(consumedMail, ShouldNotBeNil)
	So(consumedMail.GetSubject(), ShouldEqual, "Second email")
	So(i, ShouldEqual, 1)

	email2.Subject = "Test 3 With Fail"
	err = queue.Push(email2)
	So(err, ShouldBeNil)
	e = queue.Consume(func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry")
	})
	So(e, ShouldNotBeNil)

	e = queue.Consume(func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry _ 2")
	})
	So(e, ShouldNotBeNil)

	i = 0
	e = queue.Consume(func(email *mailer.Mail) error {
		i++
		consumedMail = email
		return nil
	})
	So(e, ShouldBeNil)
	So(i, ShouldEqual, 1)
	So(consumedMail.Retries, ShouldEqual, 2)

}

func TestEnqueueMail(t *testing.T) {

	Convey("Test Queue DAO", t, func() {

		d, c, e := test.OnFileTestDAO("boltdb", filepath.Join(os.TempDir(), "test-mail-queue.db"), "", "mailqueue-test", false, NewBoltDAO)
		So(e, ShouldBeNil)
		queue := d.(Queue)
		defer c()
		testQueue(t, queue)

	})

	/*
		Convey("Test push", t, func() {

			bDir, e := os.CreateTemp(os.TempDir(), "bolt-queue-2-*")
			So(e, ShouldBeNil)
			bPath := filepath.Join(bDir, "bolt-test.db")

			queue, e := NewBoltQueue(bPath, true)
			So(e, ShouldBeNil)
			defer queue.Close()

			testQueue(t, queue)

		})

		mDsn := os.Getenv("CELLS_TEST_MONGODB_DSN")
		if mDsn == "" {
			return
		}

		Convey("Test Mongo if found in ENV", t, func() {

			dao, _ := mongodb.NewDAO("mongodb", mDsn, "mailqueue-test")
			queue, e := NewMongoQueue(dao.(mongodb.DAO), configx.New())
			So(e, ShouldBeNil)
			defer func() {
				queue.(*mongoQueue).DB().Drop(context.Background())
				queue.Close()

			}()

			testQueue(t, queue)

		})*/

}
