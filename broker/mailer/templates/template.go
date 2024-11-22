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

// Package templates defines ready-to-use templates to send email in a nice formatting.
//
// It is based on the Hermes package, and other services can use some specific templates Ids when sending emails
// to apply the formatting.
package templates

import (
	"context"
	"fmt"
	"strings"

	hermes "github.com/matcornic/hermes/v2"

	"github.com/pydio/cells/v5/broker/mailer/lang"
	"github.com/pydio/cells/v5/common/proto/mailer"
)

func GetHermes(ctx context.Context, languages ...string) hermes.Hermes {

	configs := GetApplicationConfig(ctx, languages...)
	return hermes.Hermes{
		Theme:              configs.Theme,
		DisableCSSInlining: configs.DisableCSSInlining,
		Product: hermes.Product{
			Name:        configs.Title,
			Link:        configs.Url,
			Logo:        configs.Logo,
			TroubleText: configs.TroubleText,
			Copyright:   configs.Copyright,
		},
	}

}

// PrepareSimpleBody builds a simple hermes.Body with pre-translated Name, Greeting and Signature
func PrepareSimpleBody(ctx context.Context, user *mailer.User, languages ...string) hermes.Body {
	configs := GetApplicationConfig(ctx, languages...)
	body := hermes.Body{
		Name:      user.Name,
		Greeting:  configs.Greeting,
		Signature: configs.Signature,
	}
	if user.Name == "" {
		body.Name = user.Address
	}
	return body
}

// BuildTemplateWithId prepares a hermes.Body from a templateId
func BuildTemplateWithId(ctx context.Context, user *mailer.User, templateId string, templateData map[string]string, languages ...string) (subject string, body hermes.Body) {

	T := lang.Bundle().T(languages...)
	configs := GetApplicationConfig(ctx, languages...)
	var intros, outros []string
	var actions []hermes.Action
	if templateData == nil {
		templateData = map[string]string{}
	}

	i18nTemplateData := struct {
		TplData map[string]string
		User    *mailer.User
		Configs ApplicationConfigs
	}{
		TplData: templateData,
		User:    user,
		Configs: configs,
	}

	// Try to get intros/outros from bundle.
	// If T function returns the ID, the string is not present.
	introId := fmt.Sprintf("Mail.%s.Intros", templateId)
	outroId := fmt.Sprintf("Mail.%s.Outros", templateId)
	splitTrim := func(s string) (out []string) {
		ss := strings.Split(s, "\n")
		for _, st := range ss {
			if strings.TrimSpace(st) != "" {
				out = append(out, st)
			}
		}
		return
	}
	if T(introId) != introId {
		sentences := splitTrim(T(introId, i18nTemplateData))
		intros = append(intros, sentences...)
	}
	if T(outroId) != outroId {
		sentences := splitTrim(T(outroId, i18nTemplateData))
		outros = append(outros, sentences...)
	}

	// Init button with link if needed
	actionLabelId := fmt.Sprintf("Mail.%s.LinkLabel", templateId)
	if T(actionLabelId) != actionLabelId {
		var link string
		if linkPath, has := templateData["LinkPath"]; has {
			link = fmt.Sprintf("%s%s", configs.LinkUrl, linkPath)
		} else if linkFull, has := templateData["LinkUrl"]; has {
			link = linkFull
		} else {
			link = configs.Url
		}
		instructions := ""
		actionInstructionId := fmt.Sprintf("Mail.%s.LinkInstructions", templateId)
		if T(actionInstructionId) != actionInstructionId {
			instructions = T(actionInstructionId, i18nTemplateData)
		}
		actions = append(actions, hermes.Action{
			Button: hermes.Button{
				Link:  link,
				Text:  T(actionLabelId, i18nTemplateData),
				Color: configs.ButtonsColor,
			},
			Instructions: instructions,
		})
	}

	body = hermes.Body{
		Name:      user.Name,
		Greeting:  configs.Greeting,
		Signature: configs.Signature,
		Intros:    intros,
		Outros:    outros,
		Actions:   actions,
	}

	subject = T(fmt.Sprintf("Mail.%s.Subject", templateId), i18nTemplateData)

	return

}
