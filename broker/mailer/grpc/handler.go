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
	"context"
	"encoding/json"
	"fmt"

	"github.com/matcornic/hermes"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/broker/mailer"
	"github.com/pydio/cells/broker/mailer/templates"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	proto "github.com/pydio/cells/common/proto/mailer"
)

type Handler struct {
	Queue  mailer.Queue
	sender mailer.Sender
}

func NewHandler(serviceCtx context.Context, conf config.Map) (*Handler, error) {
	h := new(Handler)
	if q := conf.String("queue"); q != "" {
		var queueData struct {
			Value string `json:"@value"`
		}
		if e := json.Unmarshal([]byte(q), &queueData); e == nil && queueData.Value != "" {
			h.Queue = mailer.GetQueue(serviceCtx, queueData.Value, conf)
		}

	}

	if h.Queue == nil {
		h.Queue = mailer.GetQueue(serviceCtx, "boltdb", conf)
	}

	var sender mailer.Sender
	var err error

	var senderConf map[string]interface{}
	if s := conf.String("sender"); s != "" {
		json.Unmarshal([]byte(s), &senderConf)
	} else if m := conf.Map("sender"); m != nil {
		senderConf = m
	}

	if senderConf != nil {
		conf := config.Map{}
		var name string
		for k, v := range senderConf {
			if k == forms.SwitchFieldValueKey {
				name = v.(string)
			} else {
				conf.Set(k, v)
			}
		}
		log.Logger(serviceCtx).Info("Starting mailer with sender '" + name + "'")
		sender, err = mailer.GetSender(name, conf)
		if err != nil {
			return nil, err
		}

		h.sender = sender
		return h, nil
	}

	sender, err = mailer.GetSender("sendmail", conf)
	if err != nil {
		return nil, err
	}

	h.sender = sender
	log.Logger(serviceCtx).Info("Starting mailer using default sender 'sendmail'")

	return h, nil
}

func (m *Handler) SendMail(ctx context.Context, req *proto.SendMailRequest, rsp *proto.SendMailResponse) error {
	mail := req.Mail
	if mail == nil || (len(mail.Subject) == 0 && mail.TemplateId == "") || len(mail.To) == 0 {
		e := errors.BadRequest(common.SERVICE_MAILER, "SendMail: some required fields are missing")
		log.Logger(ctx).Error("SendMail", zap.Error(e))
		return e
	}
	if mail.ContentPlain == "" && mail.ContentMarkdown == "" && mail.ContentHtml == "" && mail.TemplateId == "" {
		e := errors.BadRequest(common.SERVICE_MAILER, "SendMail: please provide one of ContentPlain, ContentMarkdown or ContentHtml")
		log.Logger(ctx).Error("SendMail", zap.Error(e))
		return e
	}

	for _, to := range mail.To {
		// To find language
		var languages []string
		if to.Language != "" {
			languages = append(languages, to.Language)
		}
		configs := templates.GetApplicationConfig(languages...)

		if mail.From == nil {
			mail.From = &proto.User{
				Address: configs.From,
				Name:    configs.Title,
			}
		}
		h := templates.GetHermes(languages...)
		if mail.ContentHtml == "" {
			var body hermes.Body
			if mail.TemplateId != "" {
				var subject string
				subject, body = templates.BuildTemplateWithId(to, mail.TemplateId, mail.TemplateData, languages...)
				mail.Subject = subject
				if mail.ContentMarkdown != "" {
					body.FreeMarkdown = hermes.Markdown(mail.ContentMarkdown)
				}
			} else {
				if mail.ContentMarkdown != "" {
					body = hermes.Body{
						FreeMarkdown: hermes.Markdown(mail.ContentMarkdown),
					}
				} else {
					body = hermes.Body{
						Intros: []string{mail.ContentPlain},
					}
				}
			}
			hermesMail := hermes.Email{Body: body}
			var e error
			mail.ContentHtml, _ = h.GenerateHTML(hermesMail)
			if mail.ContentPlain, e = h.GenerateHTML(hermesMail); e != nil {
				return e
			}
		}

		if req.InQueue {
			log.Logger(ctx).Info("SendMail: pushing email to queue", zap.Any("to", mail.To), zap.Any("subject", mail.Subject))
			if e := m.Queue.Push(mail); e != nil {
				return e
			}
		} else {
			log.Logger(ctx).Info("SendMail: sending email", zap.Any("to", mail.To), zap.Any("subject", mail.Subject))
			if e := m.sender.Send(mail); e != nil {
				return e
			}
		}

	}
	return nil
}

func (m *Handler) ConsumeQueue(ctx context.Context, req *proto.ConsumeQueueRequest, rsp *proto.ConsumeQueueResponse) error {

	counter := int64(0)
	c := func(em *proto.Mail) error {
		if em == nil {
			log.Logger(ctx).Error("ConsumeQueue: trying to send empty email")
			return fmt.Errorf("cannot send empty email")
		}
		counter++
		return m.sender.Send(em)
	}

	if e := m.Queue.Consume(c); e == nil {
		rsp.Message = fmt.Sprintf("Successfully sent %d messages", counter)
		rsp.EmailsSent = counter
		return nil
	} else {
		return e
	}

}
