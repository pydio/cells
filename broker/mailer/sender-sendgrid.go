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
	"context"
	"fmt"

	"github.com/sendgrid/sendgrid-go"
	"github.com/sendgrid/sendgrid-go/helpers/mail"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/x/configx"
)

// SendGrid is a passerelle to Sendgrid API. It holds the application API Key.
type SendGrid struct {
	ApiKey string
}

// Configure expects a valid sendgrid API key.
func (s *SendGrid) Configure(ctx context.Context, config configx.Values) error {
	s.ApiKey = config.Val("apiKey").String()

	if s.ApiKey == "" {
		return fmt.Errorf("cannot send mail via sendgrid without a valid API key")
	}

	log.Logger(ctx).Debug("SendGrid Configured")

	return nil
}

func (s *SendGrid) Check(ctx context.Context) error {
	return nil
}

// Send performs the real code to the sendgrid API.
func (s *SendGrid) Send(email *mailer.Mail) error {

	from := mail.NewEmail(email.From.Name, email.From.Address)
	// fmt.Printf("Sendgrid from mail: %s - %s \n", from.Name, from.Address)

	for _, u := range email.To {
		to := mail.NewEmail(u.Name, u.Address)
		// fmt.Printf("Sendgrid to mail: %s - %s \n", to.Name, to.Address)

		message := mail.NewSingleEmail(from, email.Subject, to, email.ContentPlain, email.ContentHtml)
		client := sendgrid.NewSendClient(s.ApiKey)
		resp, err := client.Send(message)
		if err != nil {
			return err
		} else if !(resp.StatusCode == 200 || resp.StatusCode == 202) {
			return fmt.Errorf("sending mail via sendgrid fail with status %d, message: %s", resp.StatusCode, resp.Body)
		}
	}
	return nil
}
