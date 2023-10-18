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

package forms

import (
	"fmt"
	"strings"

	"github.com/nicksnyder/go-i18n/i18n"
)

type FormField struct {
	Name             string
	Type             ParamType
	Label            string
	Description      string
	Default          interface{}
	Mandatory        bool
	Editable         bool
	ChoicePresetList []map[string]string
	ChoiceJsonList   string
}

func (b *FormField) StringDefault() string {
	defaultValue := ""
	if b.Default != nil {
		switch b.Type {
		case ParamHidden, ParamString, ParamTextarea, ParamSelect, ParamAutoComplete, ParamAutoCompleteTree:
			if s, ok := b.Default.(string); ok {
				defaultValue = s
			} else {
				fmt.Println("[WARNING] Wrong Default Format, expected string, got", b.Default)
			}
		case ParamBool:
			defaultValue = "false"
			if bo, ok := b.Default.(bool); ok {
				if bo {
					defaultValue = "true"
				}
			} else {
				fmt.Println("[WARNING] Wrong Default Format, expected bool, got", b.Default, " for field ", b.Name, b.Label)
			}
		case ParamInteger, ParamIntegerBytes:
			if in, ok := b.Default.(int); ok {
				defaultValue = fmt.Sprintf("%v", in)
			} else {
				fmt.Println("[WARNING] Wrong Default Format, expected integer, got", b.Default)
			}
		}
	}
	return defaultValue
}

func (b *FormField) Serialize(T i18n.TranslateFunc) (params []*SerialFormParam) {

	s := &SerialFormParam{
		Name:        b.Name,
		Label:       T(b.Label),
		Description: T(b.Description),
		Type:        string(b.Type),
		Default:     b.StringDefault(),
		Mandatory:   b.Mandatory,
		Editable:    b.Editable,
	}

	if b.ChoicePresetList != nil {
		var values []string
		for _, value := range b.ChoicePresetList {
			for k, v := range value {
				values = append(values, fmt.Sprintf("%s|%s", k, T(v)))
			}
		}
		s.Choices = strings.Join(values, ",")
	} else if b.ChoiceJsonList != "" {
		s.Choices = fmt.Sprintf("json:%s", b.ChoiceJsonList)
	}

	params = append(params, s)

	return params
}
