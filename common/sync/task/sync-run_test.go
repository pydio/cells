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

package task

import (
	"context"
	"testing"

	"github.com/gobwas/glob"
	"github.com/pydio/cells/v5/common/sync/endpoints/memory"
	"github.com/pydio/cells/v5/common/sync/merger"
	"github.com/pydio/cells/v5/common/sync/model"
	. "github.com/smartystreets/goconvey/convey"
)

type fakeDiff struct {
	status chan model.Status
	done   chan interface{}
}

func (f *fakeDiff) String() string { return "fakeDiff" }
func (f *fakeDiff) Stats() map[string]interface{} {
	return map[string]interface{}{"fake": true}
}

func (f *fakeDiff) SetupChannels(status chan model.Status, done chan interface{}, cmd *model.Command) {
	f.status = status
	f.done = done
}

func (f *fakeDiff) Status(s model.Status) {
	if f.status != nil {
		f.status <- s
	}
}

func (f *fakeDiff) Done(info interface{}) {
	if f.done != nil {
		f.done <- info
	}
}

func (f *fakeDiff) Compute(
	ctx context.Context,
	root string,
	lock chan bool,
	rootStats map[string]*model.EndpointRootStat,
	ignores ...glob.Glob, // must match merger.Diff exactly
) error {
	return nil
}

func (f *fakeDiff) ToUnidirectionalPatch(ctx context.Context, direction model.DirectionType, patch merger.Patch) error {
	return nil
}

func (f *fakeDiff) ToBidirectionalPatch(ctx context.Context, leftTarget model.PathSyncTarget, rightTarget model.PathSyncTarget, patch *merger.BidirectionalPatch) error {
	return nil
}

func TestRunShouldFailWhenRunUniFails(t *testing.T) {
	Convey("Given a sync with an invalid direction", t, func() {
		left := memory.NewMemDB()
		right := memory.NewMemDB()

		s := NewSync(left, right, model.DirectionType(99))

		_, err := s.run(context.Background(), false, false)
		So(err, ShouldNotBeNil)

	})
}

func TestMonitorDiffMustNotCloseDiffOwnedChannels(t *testing.T) {
	Convey("Given a sync with a diff, when monitorDiff is called, then it should not close channels owned by the diff", t, func() {
		s := &Sync{}
		d := &fakeDiff{}

		uri := "test://endpoint"
		rootsInfo := map[string]*model.EndpointRootStat{
			uri: {},
		}

		finished := s.monitorDiff(context.Background(), d, rootsInfo)

		d.Status(model.NewProcessingStatus("first").SetEndpoint(uri))
		d.Done(true)
		<-finished

		So(func() { close(d.status) }, ShouldNotPanic)
		So(func() { close(d.done) }, ShouldNotPanic)
	})
}
