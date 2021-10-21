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
	"testing"

	. "github.com/smartystreets/goconvey/convey"
)

func TestI18NReplace(t *testing.T) {

	Convey("Test conf message extractions", t, func() {

		messages := map[string]string{
			"Hello World":           "Bonjour le monde",
			"This is weird, really": "C'est vraiment bizarre",
			"Test Value 2":          "Valeur 2",
		}

		t := "CONF_MESSAGE[Hello World]"
		t2 := i18nConfMessages(t, messages)

		t3 := "CONF_MESSAGE[This is weird, really]|CONF_MESSAGE[Test Value 2]"
		t4 := i18nConfMessages(t3, messages)

		t5 := "CONF_MESSAGE[No Replacement Found]"
		t6 := i18nConfMessages(t5, messages)

		So(t2, ShouldEqual, "Bonjour le monde")
		So(t4, ShouldEqual, "C'est vraiment bizarre|Valeur 2")
		So(t6, ShouldEqual, "No Replacement Found")

	})

}
