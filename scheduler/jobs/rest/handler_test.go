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

package rest

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/jobs"
)

func TestAssertCanControlJob(t *testing.T) {

	admin := claim.Claims{Name: "admin", Profile: common.PydioProfileAdmin}
	alice := claim.Claims{Name: "alice", Profile: common.PydioProfileStandard}

	systemJob := &jobs.Job{ID: "internal-prune-jobs", Owner: common.PydioSystemUsername}
	alicesJob := &jobs.Job{ID: "alice-job", Owner: "alice"}
	ownerlessJob := &jobs.Job{ID: "legacy-job", Owner: ""}

	Convey("An administrator can control any job, including system-owned ones", t, func() {
		So(assertCanControlJob(admin, systemJob), ShouldBeNil)
	})

	Convey("A standard user can control a job they own", t, func() {
		So(assertCanControlJob(alice, alicesJob), ShouldBeNil)
	})

	Convey("A standard user cannot control a system-owned job (the reported issue)", t, func() {
		err := assertCanControlJob(alice, systemJob)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})

	Convey("A standard user cannot control a job with no recorded owner (fail closed)", t, func() {
		err := assertCanControlJob(alice, ownerlessJob)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})

	Convey("A standard user cannot control a nil job (GetJob failed to resolve one)", t, func() {
		err := assertCanControlJob(alice, nil)
		So(err, ShouldNotBeNil)
		So(errors.Is(err, errors.StatusForbidden), ShouldBeTrue)
	})
}
