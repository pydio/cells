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

package grpc

import (
	"github.com/pydio/cells/broker/mailer/lang"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
)

func init() {
	config.RegisterVaultKey("services", Name, "sender", "password")
}

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
			&forms.SwitchField{
				Name:        "fromCtl",
				Label:       "Mail.Config.FromCtl.Label",
				Description: "Mail.Config.FromCtl.Description",
				Mandatory:   false,
				Default:     "user",
				Values: []*forms.SwitchValue{
					{
						Name:  "name",
						Label: "Mail.Config.FromCtlUser.Label",
						Value: "user",
					},
					{
						Name:  "name",
						Label: "Mail.Config.FromCtlSender.Label",
						Value: "sender",
					},
					{
						Name:  "name",
						Label: "Mail.Config.FromCtlDefault.Label",
						Value: "default",
					},
				},
			},
			&forms.SwitchField{
				Name:        "sender",
				Label:       "Mail.Config.Mailer.Label",
				Description: "Mail.Config.Mailer.Description",
				Mandatory:   true,
				Default:     "smtp",
				Values: []*forms.SwitchValue{
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
								Name:        "insecureSkipVerify",
								Label:       "Mail.Config.Smtp.SkipVerify.Label",
								Description: "Mail.Config.Smtp.SkipVerify.Description",
								Mandatory:   false,
								Type:        forms.ParamBool,
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
			&forms.FormField{
				Name:        "queue",
				Type:        forms.ParamSelect,
				Label:       "Mail.Config.Queue.Label",
				Description: "Mail.Config.Queue.Description",
				ChoicePresetList: []map[string]string{
					{"boltdb": "Mail.Config.Queue.ValueBolt"},
					{"memory": "Mail.Config.Queue.ValueMemory"},
				},
				Default: "boltdb",
			},
		},
	}},
}
