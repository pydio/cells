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

package frontend

import (
	"fmt"
	"regexp"
	"strings"
)

var debugMissingStrings = false

type I18nMessages struct {
	Messages     map[string]string
	ConfMessages map[string]string
}

func i18nConfMessages(i string, messages map[string]string) string {

	r := regexp.MustCompile(`CONF_MESSAGE\[([^\]]+)\]`)
	matches := r.FindAllStringSubmatch(i, -1)
	for _, match := range matches {
		orig := match[0]
		key := match[1]
		if translation, ok := messages[key]; ok {
			i = strings.Replace(i, orig, translation, -1)
		} else {
			if debugMissingStrings {
				fmt.Println(" -- CONF_MESSAGE not found: " + key)
			}
			i = strings.Replace(i, orig, key, -1)
		}
	}
	return i
}
