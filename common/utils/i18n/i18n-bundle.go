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

package i18n

import (
	"strings"

	"github.com/nicksnyder/go-i18n/i18n"
	"github.com/nicksnyder/go-i18n/i18n/bundle"
	"github.com/pydio/packr"
)

type I18nBundle struct {
	bundle.Bundle
}

func NewI18nBundle(box packr.Box) *I18nBundle {
	b := bundle.New()
	B := &I18nBundle{}
	B.Bundle = *b
	B.LoadPackrTranslationFiles(box)
	return B
}

// LoadPackrTranslationFiles loads goi18n translation
// files from packr boxes
func (b *I18nBundle) LoadPackrTranslationFiles(box packr.Box) {

	files := box.List()
	for _, f := range files {
		if strings.HasSuffix(f, ".json") {
			data := box.Bytes(f)
			b.ParseTranslationFileBytes(f, data)
		}
	}

}

// GetTranslationFunc provides the correct translation func for language or the IdentityFunc
// if language is not supported. Languages can be a list of weighted languages as provided
// in the http header Accept-Language
func (b *I18nBundle) GetTranslationFunc(languages ...string) i18n.TranslateFunc {

	var t bundle.TranslateFunc
	var e error
	if len(languages) > 0 {
		t, e = b.Tfunc(languages[0], "en-US")
	} else {
		t, e = b.Tfunc("en-US")
	}
	if e != nil {
		return i18n.IdentityTfunc()
	} else {
		return i18n.TranslateFunc(t)
	}

}
