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

package test

import (
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

// NewTestResult creates a new TestResult
func NewTestResult(testName string) *TestResult {
	return &TestResult{
		Pass: true,
		Name: testName,
	}
}

// Log appends message and json serialized version of objects in result
func (t *TestResult) Log(msg string, objects ...interface{}) {
	if len(objects) > 0 {
		for _, o := range objects {
			if jsonObj, e := json.Marshal(o); e == nil {
				msg += " " + string(jsonObj)
			}
		}
	}
	t.Messages = append(t.Messages, msg)
}

// Fail send result.Pass to false and appends message and json serialized version of objects in result
func (t *TestResult) Fail(msg string, objects ...interface{}) {
	t.Pass = false
	t.Log(msg, objects...)
}
