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
	"testing"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/test"

	_ "github.com/pydio/cells/v4/common/storage/boltdb"
	_ "github.com/pydio/cells/v4/common/storage/mongodb"

	. "github.com/smartystreets/goconvey/convey"
)

var (
	conf      configx.Values
	testcases = []test.StorageTestCase{
		test.TemplateBoltWithPrefix(NewBoltDAO, "test_mailer"),
		test.TemplateMongoEnvWithPrefix(NewMongoDAO, "broker_"),
	}
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

	email2 := proto.Clone(email).(*mailer.Mail)
	email2.Subject = "Second email"

	err := queue.Push(nil, email)
	So(err, ShouldBeNil)

	var consumedMail *mailer.Mail
	e := queue.Consume(nil, func(email *mailer.Mail) error {
		consumedMail = email
		return nil
	})
	So(e, ShouldBeNil)
	So(consumedMail, ShouldNotBeNil)
	So(consumedMail.GetFrom().Name, ShouldEqual, "Sender")

	err = queue.Push(nil, email2)
	So(err, ShouldBeNil)

	// We should only retrieve 2nd email
	i := 0
	e = queue.Consume(nil, func(email *mailer.Mail) error {
		consumedMail = email
		i++
		return nil
	})
	So(e, ShouldBeNil)
	So(consumedMail, ShouldNotBeNil)
	So(consumedMail.GetSubject(), ShouldEqual, "Second email")
	So(i, ShouldEqual, 1)

	email2.Subject = "Test 3 With Fail"
	err = queue.Push(nil, email2)
	So(err, ShouldBeNil)
	e = queue.Consume(nil, func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry")
	})
	So(e, ShouldNotBeNil)

	e = queue.Consume(nil, func(email *mailer.Mail) error {
		return fmt.Errorf("Failed Sending Email - Should Update Retry _ 2")
	})
	So(e, ShouldNotBeNil)

	i = 0
	e = queue.Consume(nil, func(email *mailer.Mail) error {
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

		test.RunStorageTests(testcases, func(ctx context.Context) {
			queue, err := manager.Resolve[Queue](ctx)
			if err != nil {
				panic(err)
			}

			testQueue(t, queue)
		})

	})

}
