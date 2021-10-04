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

// Package lang provides i18n strings related to activities
package lang

import (
	"sync"

	"github.com/nicksnyder/go-i18n/i18n"
	i18n2 "github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/packr"
)

var (
	b *i18n2.I18nBundle
	o = sync.Once{}
)

func T(lang ...string) i18n.TranslateFunc {
	o.Do(func() {
		b = i18n2.NewI18nBundle(packr.NewBox("../../../broker/activity/lang/box"))
	})
	return b.GetTranslationFunc(lang...)
}
