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
	"fmt"
	"io"
	"strings"

	"github.com/nicksnyder/go-i18n/v2/i18n"
	"golang.org/x/text/language"

	"github.com/pydio/cells/v4/common/utils/statics"
)

type I18nBundle struct {
	*i18n.Bundle
}

type TranslateFunc func(translationID string, args ...interface{}) string

func IdentityFunc(translationID string, args ...interface{}) string {
	return translationID
}

// NewI18nBundle creates a usable I18nBundle
func NewI18nBundle(box statics.FS) *I18nBundle {
	B := &I18nBundle{}
	B.Bundle = i18n.NewBundle(language.MustParse("en-US"))
	B.LoadBoxTranslationFiles(box)
	return B
}

// LoadBoxTranslationFiles loads goi18n translation files from boxes
func (b *I18nBundle) LoadBoxTranslationFiles(box statics.FS) {

	files := box.List()
	for _, f := range files {
		if !strings.HasSuffix(f, ".json") {
			continue
		}
		file, e := box.Open(f)
		if e != nil {
			continue
		}
		data, _ := io.ReadAll(file)
		_ = file.Close()

		if _, er := b.ParseMessageFileBytes(data, strings.ReplaceAll(f, ".all.json", ".json")); er != nil {
			fmt.Println("cannot load box file: ", er.Error())
		}
	}

}

// GetTranslationFunc provides the correct translation func for language or the IdentityFunc
// if language is not supported. Languages can be a list of weighted languages as provided
// in the http header Accept-Language
func (b *I18nBundle) GetTranslationFunc(languages ...string) TranslateFunc {

	l := i18n.NewLocalizer(b.Bundle, languages...)
	return func(id string, args ...interface{}) string {
		msg, err := l.Localize(&i18n.LocalizeConfig{
			MessageID: id,
		})
		if err != nil {
			return id
		}
		return msg
	}

}
