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

package templates

import (
	"fmt"
	"strings"

	hermes "github.com/matcornic/hermes/v2"

	"github.com/pydio/cells/v4/broker/mailer/lang"
	"github.com/pydio/cells/v4/common/config"
)

var templateFilters []FilterFunc

type FilterFunc func(configs ApplicationConfigs) ApplicationConfigs

func RegisterTemplateFilter(filterFunc FilterFunc) {
	templateFilters = append(templateFilters, filterFunc)
}

type ApplicationConfigs struct {
	Title        string
	Url          string
	LinkUrl      string
	From         string
	FromName     string
	FromCtl      string
	Logo         string
	Copyright    string
	TroubleText  string
	Greeting     string
	Signature    string
	Theme        hermes.Theme
	ButtonsColor string
}

func GetApplicationConfig(languages ...string) ApplicationConfigs {
	T := lang.Bundle().GetTranslationFunc(languages...)

	url := config.Get("services", "pydio.grpc.mailer", "url").Default(config.GetDefaultSiteURL()).String()
	linkUrl := config.Get("services", "pydio.rest.share", "url").Default(url).String()

	from := config.Get("services", "pydio.grpc.mailer", "from").Default("do-not-reply@pydio.com").String()
	fromName := config.Get("services", "pydio.grpc.mailer", "fromName").Default("").String()

	// "default" value is interpreted by the configs internal - read map directly instead of looking for "@value"
	fromCtl := "user"
	fromMap := config.Get("services", "pydio.grpc.mailer", "fromCtl").Map()
	if tt, ok := fromMap["@value"]; ok {
		if s, o := tt.(string); o {
			fromCtl = s
		}
	}

	if fromName == "" {
		fromName = "Pydio"
	}

	a := ApplicationConfigs{
		Title:        "Pydio",
		Url:          url,
		LinkUrl:      linkUrl,
		From:         from,
		FromName:     fromName,
		FromCtl:      fromCtl,
		Logo:         fmt.Sprintf("%s/plug/gui.ajax/res/themes/common/images/PydioLogo250.png", strings.TrimRight(url, "/")),
		Copyright:    T("Mail.Main.Copyright"),
		TroubleText:  T("Mail.Main.Troubleshoot"),
		Greeting:     T("Mail.Main.Greeting"),
		Signature:    T("Mail.Main.Signature"),
		Theme:        new(pydioTheme),
		ButtonsColor: "#22BC66",
	}

	if len(templateFilters) > 0 {
		for _, f := range templateFilters {
			a = f(a)
		}
	}

	return a
}

type pydioTheme struct {
	hermes.Flat
}

func (p pydioTheme) HTMLTemplate() string {
	s := p.Flat.HTMLTemplate()
	s = strings.Replace(s, "mso-hide: all;", "", -1)
	return s
}
