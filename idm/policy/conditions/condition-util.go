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

// Package conditions provides implementation of basic condition rules to enable building elaborated policies.
package conditions

import (
	"strconv"
	"strings"
	"time"
)

const (
	timeLayout        = "2006-01-02T15:04-0700"
	officeHoursLayout = "Monday-Tuesday/15:04-0700/18:04"
)

var (
	// Ease implementation by defining this map
	daysMap = map[string]uint{
		time.Sunday.String():    0,
		time.Monday.String():    1,
		time.Tuesday.String():   2,
		time.Wednesday.String(): 3,
		time.Thursday.String():  4,
		time.Friday.String():    5,
		time.Saturday.String():  6,
	}
)

func isWeekdayValid(validDays uint, day time.Weekday) bool {
	return validDays&(1<<uint(day)) > 0
}

// Warning only check time, we assume we are in the same time zone and that the day has been priorly checked
func isWithinValidHours(minuteBegin int, minuteEnd int, time time.Time) bool {
	toCheck := time.Hour()*60 + time.Minute()
	return toCheck >= minuteBegin && toCheck <= minuteEnd
}

func parseOfficeHours(pattern string) (days uint, minuteBegin int, minuteEnd int, err error) {

	tokens := strings.Split(pattern, "/")

	// manage days of week: transform valid days to a bitwise flag unsigned integer
	days = 0
	cleaned := strings.Replace(tokens[0], " ", "", -1) // clean by removing all spaces

	if strings.Contains(cleaned, "-") {

		ds := strings.Split(cleaned, "-")

		dayBegin := daysMap[ds[0]]
		dayEnd := daysMap[ds[1]]

		var i uint
		for i = dayBegin; i <= dayEnd; i++ {
			days += 1 << i
		}

	} else if strings.Contains(cleaned, ",") {

		dayStrs := strings.Split(cleaned, ",")

		for _, val := range dayStrs {
			days += 1 << daysMap[val]
		}

	} else {
		days += 1 << daysMap[cleaned]
	}

	// Then transforms hours that have a 15:04 format to minutes from midnight
	// TODO manage time zone

	minuteBegin = timeStringToMinutes(tokens[1])
	minuteEnd = timeStringToMinutes(tokens[2])

	return
}

// timeStringToMinutes assumes a correctly formatted string
func timeStringToMinutes(str string) int {
	tokens := strings.Split(str, ":")
	hours, _ := strconv.Atoi(tokens[0])
	minutes, _ := strconv.Atoi(tokens[1])
	return hours*60 + minutes
}
