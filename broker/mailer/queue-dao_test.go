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
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	conf configx.Values
)

func init() {
	// Define parameters to shorten tests launch
	conf = configx.New()
	conf.Val("QueueMaxSize").Set(int64(10))
}

func TestEmptyDao(t *testing.T) {

	Convey("Test initialize BoltDB DAO", t, func() {
		bDir, e := ioutil.TempDir(os.TempDir(), "bolt-queue-1-*")
		So(e, ShouldBeNil)
		bPath := filepath.Join(bDir, "bolt-test.db")
		bq, e := NewBoltQueue(bPath, true)
		if e != nil {
			fmt.Println("Cannot initialise bolt queue at " + bPath)
			fmt.Println("error: " + e.Error())
		}
		So(e, ShouldBeNil)
		So(bq, ShouldNotBeNil)
		bq.Close()
	})

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

	email2.Subject = "Test 3 With Fail"
	err = queue.Push(email2)
	So(err, ShouldBeNil)
	queue.Consume(func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry")
	})

	queue.Consume(func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry _ 2")
	})

	i = 0
	queue.Consume(func(email *mailer.Mail) error {
		i++
		consumedMail = email
		return nil
	})
	So(i, ShouldEqual, 1)
	So(consumedMail.Retries, ShouldEqual, 2)

}

func TestEnqueueMail(t *testing.T) {

	Convey("Test push", t, func() {

		bDir, e := ioutil.TempDir(os.TempDir(), "bolt-queue-2-*")
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

	})

}
