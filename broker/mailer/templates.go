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

package mailer

import (
	hermes "github.com/matcornic/hermes/v2"

	"github.com/pydio/cells/v4/common/proto/mailer"
)

func buildFromWelcomeTemplate(msg *mailer.Mail, to *mailer.User) error {

	h := hermes.Hermes{
		Product: hermes.Product{
			Name: "Pydio",
			Link: "https://pydio.com/",
		},
	}
	email := hermes.Email{
		Body: hermes.Body{
			Name: to.Name,
			Intros: []string{
				"Welcome to Pydio! We're very excited to have you on board.",
			},
			Actions: []hermes.Action{
				{
					Instructions: "To download Pydio, please click here:",
					Button: hermes.Button{
						Color: "#22BC66",
						Text:  "Go to downloads",
						Link:  "https://pydio.com/downloads",
					},
				},
			},
			Outros: []string{
				"Need help, or have questions? Just reply to this email, we'd love to help.",
			},
		},
	}

	// Generate an HTML email with the provided contents (for modern clients)
	var err error
	h.DisableCSSInlining = true
	msg.ContentHtml, err = h.GenerateHTML(email)
	if err != nil {
		return err
	}

	// Generate the plaintext version of the e-mail (for clients that do not support xHTML)
	msg.ContentPlain, err = h.GeneratePlainText(email)
	return err
}
