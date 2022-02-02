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
	"fmt"

	"gopkg.in/gomail.v2"

	"github.com/pydio/cells/v4/common/proto/mailer"
)

// NewGomailMessage prepares a new Message to be sent.
func NewGomailMessage(email *mailer.Mail) (*gomail.Message, error) {

	m := gomail.NewMessage()
	if email.From == nil || email.From.Address == "" {
		return nil, fmt.Errorf("cannot create gomail: no FROM address")
	}
	// FROM
	m.SetAddressHeader("From", email.From.Address, email.From.Name)

	// SENDER
	if email.Sender != nil && email.Sender.Address != "" {
		m.SetAddressHeader("Sender", email.Sender.Address, email.Sender.Name)
	}

	// TO
	var to []string
	for _, u := range email.To {
		if u.Address != "" {
			to = append(to, u.Address)
		}
	}
	if len(to) == 0 {
		return nil, fmt.Errorf("cannot create gomail: no recipient address")
	}
	m.SetHeader("To", to...)
	// CC
	var cc []string
	for _, u := range email.Cc {
		cc = append(to, u.Address)
	}
	m.SetHeader("Cc", cc...)

	m.SetHeader("Subject", email.Subject)

	if len(email.ContentHtml) > 0 {
		m.SetBody("text/html", email.ContentHtml)
	} else {
		m.SetBody("text/plain", email.ContentPlain)
	}
	for _, a := range email.Attachments {
		m.Attach(a)
	}

	return m, nil
}
