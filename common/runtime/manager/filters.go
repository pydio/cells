/*
 * Copyright (c) 2025. Abstrium SAS <team (at) pydio.com>
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

package manager

import (
	"bytes"
	"regexp"
	"strings"
	"text/template"

	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/registry"
)

// makeRegistryFilterFunc creates a regex-based filter function to filter out listed items
func makeRegistryFilterFunc(filter string) func(item registry.Item) bool {
	serviceFilterTemplate := template.New("serviceFilter")

	return func(item registry.Item) bool {
		tmpl, err := serviceFilterTemplate.Funcs(map[string]any{
			"sliceToRegexpFmt": func(s []string) string {
				return "^(" + strings.Join(s, "|") + ")$"
			},
		}).Parse(filter)
		if err != nil {
			return false
		}
		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, item); err != nil {
			return false
		}

		ors := strings.Split(buf.String(), " or ")
		for _, or := range ors {
			f := strings.SplitN(or, " ", 3)
			var fn func(any, any) (bool, error)
			switch f[1] {
			case "=", "==":
				fn = func(a any, b any) (bool, error) {
					aa, ok := a.(string)
					if !ok {
						return false, errors.New("wrong format")
					}

					bb, ok := b.([]byte)
					if !ok {
						return false, errors.New("wrong format")
					}
					return aa == string(bb), nil
				}
			case "in":
				fn = func(a any, b any) (bool, error) {
					aa, ok := a.([]string)
					if !ok {
						return false, errors.New("wrong format")
					}

					bb, ok := b.(string)
					if !ok {
						return false, errors.New("wrong format")
					}

					for _, aaa := range aa {
						if bb == aaa {
							return true, nil
						}
					}

					return false, nil
				}
			case "~=":
				fn = func(a any, b any) (bool, error) {
					aa, ok := a.(string)
					if !ok {
						return false, errors.New("wrong format")
					}

					bb, ok := b.([]byte)
					if !ok {
						return false, errors.New("wrong format")
					}

					return regexp.Match(aa, bb)
				}
			case "!~=":
				fn = func(a any, b any) (bool, error) {
					aa, ok := a.(string)
					if !ok {
						return false, errors.New("wrong format")
					}

					bb, ok := b.([]byte)
					if !ok {
						return false, errors.New("wrong format")
					}

					m, err := regexp.Match(aa, bb)
					if err != nil {
						return false, err
					}

					return !m, nil
				}
			}

			if fn != nil {
				match, err := fn(f[2], []byte(f[0]))
				if err != nil {
					return false
				}

				if match {
					return true
				}
			}
		}

		return false
	}
}
