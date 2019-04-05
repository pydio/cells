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

package templates

import (
	"fmt"

	"github.com/matcornic/hermes"

	"strings"

	"github.com/pydio/cells/broker/mailer/lang"
	"github.com/pydio/cells/common/config"
)

type ApplicationConfigs struct {
	Title        string
	Url          string
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
	configs := config.Default()
	url := configs.Get("defaults", "url").String("URL NOT SET")
	from := configs.Get("services", "pydio.grpc.mailer", "from").String("do-not-reply@pydio.com")
	fromName := configs.Get("services", "pydio.grpc.mailer", "fromName").String("")
	fromCtl := configs.Get("services", "pydio.grpc.mailer", "fromCtl", "@value").String("user")

	if fromName == "" {
		fromName = "Pydio"
        }

	return ApplicationConfigs{
		Title:        "Pydio",
		Url:          url,
		From:         from,
		FromName:     fromName,
		FromCtl:      fromCtl,
		Logo:         fmt.Sprintf("%s/plug/gui.ajax/res/themes/common/images/PydioLogo250.png", strings.TrimRight(url, "/")),
		Copyright:    T("Mail.Main.Copyright"),
		TroubleText:  T("Mail.Main.Troubleshoot"),
		Greeting:     T("Mail.Main.Greeting"),
		Signature:    T("Mail.Main.Signature"),
		Theme:        new(hermes.Flat),
		ButtonsColor: "#22BC66",
	}
}
