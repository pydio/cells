/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package std

import (
	"regexp"
	"testing"
)

// TestRandKey checks the expected output of RandKey function.
func TestRandkey(t *testing.T) {
	tests := []struct {
		name string
		n    int
		want string
	}{
		{name: "length 4", n: 4},
		{name: "length 8", n: 8},
		{name: "length 16", n: 16},
		{name: "length 32", n: 32},
		{name: "length 64", n: 64},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Check that the returned string has the correct length
			got := Randkey(tt.n)
			if len(got) != tt.n {
				t.Errorf("Randkey() = %v, want length %v", got, tt.n)
			}

			// Check that the returned string only contains letters and numbers
			match, _ := regexp.MatchString("^[a-zA-Z0-9]+$", got)
			if !match {
				t.Errorf("Randkey() = %v, want only letters and numbers", got)
			}
		})
	}
}
