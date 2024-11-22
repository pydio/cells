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

package versions

import (
	"fmt"
	"sort"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func generateChanges(durations ...string) (changes []*tree.ChangeLog) {
	for k, dString := range durations {
		d, _ := ParseDuration(dString)
		t := time.Now().Add(-d)
		changes = append(changes, &tree.ChangeLog{
			Uuid:        fmt.Sprintf("id-%v", k+1),
			Description: fmt.Sprintf("Duration:%s", dString),
			MTime:       t.Unix(),
			Size:        20,
		})
	}
	return
}

func sortedUuids(distances []*distancedLog) (s []string) {
	for _, d := range distances {
		s = append(s, d.Uuid)
	}
	return
}

func dispatch(start time.Time, periods []*tree.VersioningKeepPeriod, changes []*tree.ChangeLog) ([]*pruningPeriod, error) {

	pruningPeriods, e := PreparePeriods(start, periods)
	if e != nil {
		return pruningPeriods, e
	}

	c := make(chan *tree.ChangeLog)
	go func() {
		for _, change := range changes {
			c <- change
		}
		close(c)
	}()

	return DispatchChangeLogsByPeriod(pruningPeriods, c)

}
func TestParseDuration(t *testing.T) {
	Convey("Test Parse Durations", t, func() {
		// Standard duration
		t, e := ParseDuration("3s")
		So(e, ShouldBeNil)
		compare, _ := time.ParseDuration("3s")
		So(t, ShouldEqual, compare)

		// Added support for d suffix
		t2, e := ParseDuration("3d")
		So(e, ShouldBeNil)
		So(t2, ShouldEqual, time.Duration(3*24)*time.Hour)

		// Wrong use of d suffix
		_, e1 := ParseDuration("34dYd")
		So(e1, ShouldNotBeNil)

		// Anything else non compatible
		_, e2 := ParseDuration("3Y")
		So(e2, ShouldNotBeNil)
	})
}
func TestByDistances(t *testing.T) {

	Convey("Test Sorting By Distances", t, func() {
		changes := generateChanges("1s", "1s450ms", "10s", "11s", "13s", "4m", "3d", "6d")
		distances := recordsToDistances(changes)
		sort.Sort(byDistances(distances))
		So(distances, ShouldHaveLength, 8)
		for _, d := range distances {
			fmt.Printf("\n%s: %v", d.Description, d.Distance)
		}
		So(sortedUuids(distances), ShouldResemble, []string{"id-2", "id-4", "id-5", "id-3", "id-6", "id-7", "id-8", "id-1"})
	})

	Convey("Test Pruning By Distances", t, func() {
		changes := generateChanges("1s", "1s450ms", "10s", "11s", "13s", "4m", "3d", "6d")
		noPrunePeriod := &pruningPeriod{
			records: changes,
			max:     -1,
		}
		toPrune := noPrunePeriod.Prune()
		So(toPrune, ShouldHaveLength, 0)
		So(noPrunePeriod.records, ShouldHaveLength, len(changes))

		pruneAllPeriod := &pruningPeriod{
			records: changes,
			max:     0,
		}
		toPrune = pruneAllPeriod.Prune()
		So(toPrune, ShouldHaveLength, len(changes))
		So(pruneAllPeriod.records, ShouldHaveLength, 0)

		pruneTo3Period := &pruningPeriod{
			records: changes,
			max:     3,
		}
		toPrune = pruneTo3Period.Prune()
		So(toPrune, ShouldHaveLength, len(changes)-3)
		So(toPrune[0].Uuid, ShouldEqual, "id-2")
		So(toPrune[1].Uuid, ShouldEqual, "id-4")
		So(toPrune[2].Uuid, ShouldEqual, "id-5")
		So(toPrune[3].Uuid, ShouldEqual, "id-3")
		So(toPrune[4].Uuid, ShouldEqual, "id-6")
		So(pruneTo3Period.records, ShouldHaveLength, 3)

	})
}
func TestByMaxSize(t *testing.T) {

	Convey("Test Pruning With Max Size", t, func() {

		changes := generateChanges("1s", "1s450ms", "10s", "11s", "13s", "4m", "3d", "6d")
		noPrunePeriod := &pruningPeriod{
			records: changes,
			max:     -1,
		}

		toPrune, remaining := PruneAllWithMaxSize([]*pruningPeriod{noPrunePeriod}, 60)
		So(toPrune, ShouldHaveLength, 5)
		So(remaining, ShouldHaveLength, 3)
		// Check values : oldest versions should be removed
		So(remaining[0].Uuid, ShouldEqual, "id-1")
		So(remaining[1].Uuid, ShouldEqual, "id-2")
		So(remaining[2].Uuid, ShouldEqual, "id-3")
		So(toPrune[0].Uuid, ShouldEqual, "id-4")
		So(toPrune[1].Uuid, ShouldEqual, "id-5")
		So(toPrune[2].Uuid, ShouldEqual, "id-6")
		So(toPrune[3].Uuid, ShouldEqual, "id-7")
		So(toPrune[4].Uuid, ShouldEqual, "id-8")

		toPrune, remaining = PruneAllWithMaxSize([]*pruningPeriod{noPrunePeriod}, 140)
		So(toPrune, ShouldHaveLength, 1)
		So(remaining, ShouldHaveLength, 7)

		toPrune, remaining = PruneAllWithMaxSize([]*pruningPeriod{noPrunePeriod}, 160)
		So(toPrune, ShouldHaveLength, 0)
		So(remaining, ShouldHaveLength, 8)

		// Special case, keep always at least one version
		toPrune, remaining = PruneAllWithMaxSize([]*pruningPeriod{noPrunePeriod}, 10)
		So(toPrune, ShouldHaveLength, 7)
		So(remaining, ShouldHaveLength, 1)

	})

}
func TestDispatchChangeLogs(t *testing.T) {

	Convey("Test parse error", t, func() {
		keepPeriods := []*tree.VersioningKeepPeriod{
			{
				IntervalStart: "1YzF",
				MaxNumber:     -1,
			},
		}
		startTime := time.Now()
		changes := generateChanges("1s", "10s", "20m")
		_, e := dispatch(startTime, keepPeriods, changes)
		So(e, ShouldNotBeNil)
	})

	Convey("Test one simple period", t, func() {

		keepPeriods := []*tree.VersioningKeepPeriod{
			{
				IntervalStart: "0",
				MaxNumber:     -1,
			},
		}
		startTime := time.Now()
		changes := generateChanges("1s", "10s", "20m")
		result, e := dispatch(startTime, keepPeriods, changes)
		So(e, ShouldBeNil)
		So(result, ShouldHaveLength, 1)
		res := result[0]
		So(res.start, ShouldResemble, startTime)
		So(res.end, ShouldBeZeroValue)
		So(res.max, ShouldEqual, -1)
		So(res.records, ShouldHaveLength, 3)

	})

	Convey("Test three periods", t, func() {

		keepPeriods := []*tree.VersioningKeepPeriod{
			{
				IntervalStart: "0",
				MaxNumber:     -1,
			},
			{
				IntervalStart: "15m",
				MaxNumber:     10,
			},
			{
				IntervalStart: "1d",
				MaxNumber:     20,
			},
		}
		startTime := time.Now()
		changes := generateChanges("1s", "10s", "20m", "22m", "30m", "1d")
		result, e := dispatch(startTime, keepPeriods, changes)
		So(e, ShouldBeNil)
		So(result, ShouldHaveLength, 3)
		fmt.Printf("\nStart %v\n", startTime)
		fmt.Println(result[0])
		fmt.Println(result[1])
		fmt.Println(result[2])

		dur1, _ := ParseDuration("-1d")
		dur2, _ := ParseDuration("-15m")

		// Between -infinite & -1d
		So(result[0].start, ShouldResemble, startTime.Add(dur1))
		So(result[0].end, ShouldBeZeroValue)
		So(result[0].max, ShouldEqual, 20)
		So(result[0].records, ShouldHaveLength, 1)

		// Between -1d & -15
		So(result[1].start, ShouldResemble, startTime.Add(dur2))
		So(result[1].end, ShouldResemble, startTime.Add(dur1))
		So(result[1].max, ShouldEqual, 10)
		So(result[1].records, ShouldHaveLength, 3)

		// Between -15 and now
		So(result[2].start, ShouldResemble, startTime)
		So(result[2].end, ShouldResemble, startTime.Add(dur2))
		So(result[2].max, ShouldEqual, -1)
		So(result[2].records, ShouldHaveLength, 2)

	})

}
