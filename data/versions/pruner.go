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
	"strconv"
	"strings"
	"time"

	"github.com/pydio/cells/v4/common/proto/tree"
)

// Simple struct used for sorting
type distancedLog struct {
	tree.ChangeLog
	first    bool
	Distance time.Duration
}

// Sort Changes by Time DESC
type byTime []*tree.ChangeLog

func (s byTime) Len() int {
	return len(s)
}
func (s byTime) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s byTime) Less(i, j int) bool {
	return s[i].MTime > s[j].MTime
}

// Sort changes by Distance DESC
type byDistances []*distancedLog

func (s byDistances) Len() int {
	return len(s)
}
func (s byDistances) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}
func (s byDistances) Less(i, j int) bool {
	if s[i].first {
		return false
	} else if s[j].first {
		return true
	} else {
		return s[i].Distance > s[j].Distance
	}
}

// Keeps a list of records for a given period
type pruningPeriod struct {
	start   time.Time
	end     time.Time
	max     int32
	records []*tree.ChangeLog
}

// Utils
// String provides a custom representation of a pruningPeriod.
func (p *pruningPeriod) String() string {
	return fmt.Sprintf("Between %v and %v, max %v, has %v records",
		p.start, p.end, p.max, len(p.records))
}

// Prune decides which versions to delete for this period.
func (p *pruningPeriod) Prune() (toBeRemoved []*tree.ChangeLog) {
	var newRecords []*tree.ChangeLog
	if p.max == -1 {
		return
	} else if p.max == 0 {
		toBeRemoved = append(toBeRemoved, p.records...)
	} else if len(p.records) > int(p.max) {
		distances := recordsToDistances(p.records)
		sort.Sort(byDistances(distances))
		for k, dLog := range distances {
			if k < len(p.records)-int(p.max) {
				toBeRemoved = append(toBeRemoved, &dLog.ChangeLog)
			} else {
				newRecords = append(newRecords, &dLog.ChangeLog)
			}
		}
	}
	p.records = newRecords
	return toBeRemoved
}

// PruneAllWithMaxSize checks overall size and removes older versions. It should be called after pruning by periods.
func PruneAllWithMaxSize(periods []*pruningPeriod, maxSize int64) (toBeRemoved []*tree.ChangeLog, remaining []*tree.ChangeLog) {
	var allRecords []*tree.ChangeLog
	for _, p := range periods {
		allRecords = append(allRecords, p.records...)
	}
	sort.Sort(byTime(allRecords))
	var totalSize int64
	breakAt := -1
	for k, record := range allRecords {
		totalSize += record.Size
		if totalSize >= maxSize {
			breakAt = k
			break
		}
	}
	if breakAt != -1 && breakAt < len(allRecords)-1 {
		remaining = allRecords[0 : breakAt+1]
		toBeRemoved = allRecords[breakAt+1:]
	} else {
		remaining = allRecords
	}
	return
}

// recordsToDistances transforms a slice of ChangeLog to an ordered slice of distancedLog.
func recordsToDistances(records []*tree.ChangeLog) (distances []*distancedLog) {
	sort.Sort(byTime(records))
	for i := 0; i < len(records); i++ {
		dLog := &distancedLog{}
		dLog.ChangeLog = *records[i]
		if i == 0 {
			dLog.first = true
		} else {
			dLog.Distance = time.Unix(records[i].MTime, 0).Sub(time.Unix(records[i-1].MTime, 0))
		}
		distances = append(distances, dLog)
	}
	return
}

// PreparePeriods computes the actual periods from definitions.
func PreparePeriods(startTime time.Time, periods []*tree.VersioningKeepPeriod) ([]*pruningPeriod, error) {

	var pruningPeriods []*pruningPeriod
	var lastEnd time.Time

	for i := len(periods) - 1; i >= 0; i-- {
		p := periods[i]

		start := startTime
		if p.IntervalStart != "" && p.IntervalStart != "0" {
			duration, e := ParseDuration(p.IntervalStart)
			if e != nil {
				return pruningPeriods, e
			}
			start = startTime.Add(-duration)
		}
		pruningPeriods = append(pruningPeriods, &pruningPeriod{
			start: start,
			end:   lastEnd,
			max:   p.MaxNumber,
		})
		lastEnd = start
	}
	return pruningPeriods, nil
}

// DispatchChangeLogsByPeriod places each change in its corresponding period
func DispatchChangeLogsByPeriod(pruningPeriods []*pruningPeriod, changesChan chan *tree.ChangeLog) ([]*pruningPeriod, error) {
	for l := range changesChan {
		changeTime := time.Unix(l.MTime, 0)
		for _, period := range pruningPeriods {
			if changeTime.Before(period.start) && (period.end.IsZero() || changeTime.After(period.end)) {
				period.records = append(period.records, l)
				break
			}
		}
	}
	return pruningPeriods, nil
}

// ParseDuration is similar to time.ParseDuration, with specific case for "d" suffix on duration.
func ParseDuration(duration string) (d time.Duration, e error) {
	var number int64
	if strings.HasSuffix(duration, "d") {
		number, e = strconv.ParseInt(strings.TrimSuffix(duration, "d"), 10, 64)
		if e != nil {
			return d, e
		}
		d = time.Duration(number*24) * time.Hour
		return d, nil
	}
	return time.ParseDuration(duration)
}
