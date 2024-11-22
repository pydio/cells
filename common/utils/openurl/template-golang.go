/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package openurl

import (
	"context"
	"strings"
	"text/template"

	"github.com/pydio/cells/v5/common/utils/uuid"
)

type goTpl struct {
	tpl *template.Template
}

func openGoTemplate(s string) (Template, error) {
	gt := &goTpl{}
	var er error
	fm := template.FuncMap{}
	tplRegLock.RLock()
	for k, v := range tplFuncs {
		fm[k] = v
	}
	tplRegLock.RUnlock()

	gt.tpl, er = template.New(uuid.New()).Funcs(fm).Parse(s)
	if er != nil {
		return nil, er
	}
	return &urlParseWrapper{
		t: gt,
	}, nil
}

func (g *goTpl) Resolve(ctx context.Context, data ...map[string]interface{}) (string, error) {
	tplData, er := dataFromContext(ctx, data...)
	if er != nil {
		return "", er
	}
	pathBuilder := &strings.Builder{}
	er = g.tpl.Execute(pathBuilder, tplData)
	return pathBuilder.String(), er
}
