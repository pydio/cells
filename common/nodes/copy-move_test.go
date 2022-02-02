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

package nodes

import (
	"context"
	"fmt"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"
)

type testSessionLocker struct {
	expiration time.Duration
}

func (t *testSessionLocker) Lock(ctx context.Context) error {
	return nil
}

func (t *testSessionLocker) UpdateExpiration(ctx context.Context, expireAfter time.Duration) error {
	t.expiration = expireAfter
	return nil
}

func (t *testSessionLocker) Unlock(ctx context.Context) error {
	return nil
}

func (t *testSessionLocker) AddChildTarget(parentUUID, targetChildName string) {
}

func Test_updateLockerForByteSize(t *testing.T) {
	Convey("Test update lock expiration time", t, func() {
		tester := &testSessionLocker{}
		updateLockerForByteSize(context.Background(), tester, 300*1024*1024*1024, 20000)
		fmt.Println(tester.expiration)
		So(tester.expiration, ShouldBeGreaterThan, 12*time.Minute)

		updateLockerForByteSize(context.Background(), tester, 30*1024*1024, 1)
		fmt.Println(tester.expiration)
	})
}
