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

// Package error creates and parses common errors
package error

import (
	"regexp"
	"strconv"
	"strings"
)

const (
	ErrServiceStartNeedsRetry = "ErrServiceStartNeedsRetry"
)

// IsErrorPortPermissionDenied checks wether the passed error fits with the error returned when we cannot bind a protected port that is below 1024.
func IsErrorPortPermissionDenied(err error) (bool, int) {
	pattern := regexp.MustCompile(`listen tcp :\d{1,4}: bind: permission denied`)
	pattern2 := regexp.MustCompile(`\d{1,4}`)
	if pattern.MatchString(err.Error()) {
		port, _ := strconv.Atoi(pattern2.FindString(err.Error()))
		if port < 1024 {
			return true, port
		}
	}
	return false, 0
}

// IsErrorPortBusy checks wether the passed error fits with the error returned when trying to bind a port that is already in use.
func IsErrorPortBusy(err error) bool {
	return strings.HasSuffix(err.Error(), "bind: address already in use")
}

func IsServiceStartNeedsRetry(err error) bool {
	return strings.Contains(err.Error(), ErrServiceStartNeedsRetry)
}
