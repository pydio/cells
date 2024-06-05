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

package grpc

import (
	"github.com/pydio/cells/v4/broker/mailer/lang"
	"github.com/pydio/cells/v4/common/forms"
)

var ExposedConfigs = &forms.Form{
	I18NBundle: lang.Bundle(),
	Groups: []*forms.Group{{
		Label: "Mail.Config.Title",
		Fields: []forms.Field{
			&forms.FormField{
				Name:        "from",
				Label:       "Mail.Config.From.Label",
				Description: "Mail.Config.From.Description",
				Mandatory:   true,
				Type:        forms.ParamString,
			},
			&forms.FormField{
				Name:        "fromName",
				Label:       "Mail.Config.FromName.Label",
				Description: "Mail.Config.FromName.Description",
				Mandatory:   false,
				Type:        forms.ParamString,
			},
			&forms.FormField{
				Name:        "fromCtl",
				Label:       "Mail.Config.FromCtl.Label",
				Description: "Mail.Config.FromCtl.Description",
				Mandatory:   false,
				Default:     "user",
				Type:        forms.ParamSelect,
				ChoicePresetList: []map[string]string{
					{"user": "Mail.Config.FromCtlUser.Label"},
					{"sender": "Mail.Config.FromCtlSender.Label"},
					{"default": "Mail.Config.FromCtlDefault.Label"},
				},
			},
			&forms.FormField{
				Name:      "disableCssInlining",
				Label:     "Mail.Config.FixOutlookDisplay",
				Mandatory: false,
				Type:      forms.ParamBool,
				Default:   true,
			},
			&forms.SwitchField{
				Name:        "sender",
				Label:       "Mail.Config.Mailer.Label",
				Description: "Mail.Config.Mailer.Description",
				Mandatory:   true,
				Default:     "disabled",
				Values: []*forms.SwitchValue{
					{
						Name:   "name",
						Label:  "Mail.Config.Disabled.Label",
						Value:  "disabled",
						Fields: []forms.Field{},
					},
					{
						Name:  "name",
						Label: "Mail.Config.NoOp.Label",
						Value: "noop",
						Fields: []forms.Field{
							&forms.FormField{
								Name:        "dump",
								Type:        forms.ParamBool,
								Default:     false,
								Label:       "Mail.Config.NoOp.Dump",
								Description: "Mail.Config.NoOp.Dump",
							},
							&forms.FormField{
								Name:        "dumpFolder",
								Type:        forms.ParamString,
								Default:     "{SERVICE_DIR}/mails",
								Label:       "Mail.Config.NoOp.DumpTarget",
								Description: "Mail.Config.NoOp.DumpTarget",
							},
						},
					},
					{
						Name:  "name",
						Label: "Mail.Config.Sendmail.Label",
						Value: "sendmail",
						Fields: []forms.Field{
							&forms.FormField{
								Name:        "legend",
								Type:        forms.ParamLegend,
								Description: "Mail.Config.Sendmail.Legend",
							},
						},
					},
					{
						Name:  "name",
						Label: "Mail.Config.Smtp.Label",
						Value: "smtp",
						Fields: []forms.Field{
							&forms.FormField{
								Name:        "host",
								Label:       "Mail.Config.Smtp.Host.Label",
								Description: "Mail.Config.Smtp.Host.Description",
								Mandatory:   true,
								Type:        forms.ParamString,
							},
							&forms.FormField{
								Name:        "port",
								Label:       "Mail.Config.Smtp.Port.Label",
								Description: "Mail.Config.Smtp.Port.Description",
								Mandatory:   true,
								Default:     465,
								Type:        forms.ParamInteger,
							},
							&forms.FormField{
								Name:        "user",
								Label:       "Mail.Config.Smtp.User.Label",
								Description: "Mail.Config.Smtp.User.Description",
								Mandatory:   true,
								Type:        forms.ParamString,
							},
							&forms.FormField{
								Name:        "password",
								Label:       "Mail.Config.Smtp.Password.Label",
								Description: "Mail.Config.Smtp.Password.Description",
								Mandatory:   true,
								Type:        forms.ParamPassword,
							},
							&forms.FormField{
								Name:        "connectionSecurity",
								Label:       "Mail.Config.Smtp.Security.Label",
								Description: "Mail.Config.Smtp.Security.Description",
								Mandatory:   true,
								Default:     "starttls",
								Type:        forms.ParamSelect,
								ChoicePresetList: []map[string]string{
									{"starttls": "StartTLS"},
									{"ssl": "SSL/TLS"},
								},
							},
							&forms.FormField{
								Name:        "insecureSkipVerify",
								Label:       "Mail.Config.Smtp.SkipVerify.Label",
								Description: "Mail.Config.Smtp.SkipVerify.Description",
								Mandatory:   false,
								Type:        forms.ParamBool,
							},
							&forms.FormField{
								Name:        "localName",
								Label:       "Mail.Config.Smtp.LocalName.Label",
								Description: "Mail.Config.Smtp.LocalName.Description",
								Mandatory:   false,
								Type:        forms.ParamString,
							},
						},
					},
					{
						Name:  "name",
						Label: "Mail.Config.SendGrid.Label",
						Value: "sendgrid",
						Fields: []forms.Field{
							&forms.FormField{
								Name:        "apiKey",
								Label:       "Mail.Config.SendGrid.ApiKey.Label",
								Description: "Mail.Config.SendGrid.ApiKey.Description",
								Mandatory:   true,
								Type:        forms.ParamString,
							},
						},
					},
				},
			},
		},
	}},
}
