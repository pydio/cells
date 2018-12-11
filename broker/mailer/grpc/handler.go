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

	protobuf "github.com/golang/protobuf/proto"
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
	"github.com/pydio/cells/common/service/context"
)

type Handler struct {
	queueName    string
	queueConfig  config.Map
	senderName   string
	senderConfig config.Map
	queue        mailer.Queue
	sender       mailer.Sender
}

func NewHandler(serviceCtx context.Context, conf common.ConfigValues) (*Handler, error) {
	h := new(Handler)
	h.initFromConf(serviceCtx, conf)
	return h, nil
}

// SendMail either queues or send a mail directly
func (h *Handler) SendMail(ctx context.Context, req *proto.SendMailRequest, rsp *proto.SendMailResponse) error {
	mail := req.Mail

	// Sanity checks
	if mail == nil || (len(mail.Subject) == 0 && mail.TemplateId == "") || len(mail.To) == 0 {
		e := errors.BadRequest(common.SERVICE_MAILER, "cannot send mail: some required fields are missing")
		log.Logger(ctx).Error("cannot process mail to send", zap.Any("Mail", mail), zap.Error(e))
		return e
	}
	if mail.ContentPlain == "" && mail.ContentMarkdown == "" && mail.ContentHtml == "" && mail.TemplateId == "" {
		e := errors.BadRequest(common.SERVICE_MAILER, "SendMail: please provide one of ContentPlain, ContentMarkdown or ContentHtml")
		log.Logger(ctx).Error("cannot process mail to send: empty body", zap.Any("Mail", mail), zap.Error(e))
		return e
	}
	h.checkConfigChange(ctx)

	for _, to := range mail.To {
		// Find language to be used
		var languages []string
		if to.Language != "" {
			languages = append(languages, to.Language)
		}
		configs := templates.GetApplicationConfig(languages...)
		// Clone email and set unique user
		m := protobuf.Clone(mail).(*proto.Mail)
		m.To = []*proto.User{to}
		if m.From == nil {
			m.From = &proto.User{
				Address: configs.From,
				Name:    configs.Title,
			}
		} else if m.From.Address == "" {
			m.From.Address = configs.From
		}
		he := templates.GetHermes(languages...)
		if m.ContentHtml == "" {
			var body hermes.Body
			if m.TemplateId != "" {
				var subject string
				subject, body = templates.BuildTemplateWithId(to, m.TemplateId, m.TemplateData, languages...)
				m.Subject = subject
				if m.ContentMarkdown != "" {
					body.FreeMarkdown = hermes.Markdown(m.ContentMarkdown)
				}
			} else {
				if m.ContentMarkdown != "" {
					body = hermes.Body{
						FreeMarkdown: hermes.Markdown(m.ContentMarkdown),
					}
				} else {
					body = hermes.Body{
						Intros: []string{m.ContentPlain},
					}
				}
			}
			hermesMail := hermes.Email{Body: body}
			var e error
			m.ContentHtml, _ = he.GenerateHTML(hermesMail)
			if m.ContentPlain, e = he.GenerateHTML(hermesMail); e != nil {
				return e
			}
		}

		if req.InQueue {
			log.Logger(ctx).Debug("SendMail: pushing email to queue", zap.Any("to", m.To), zap.Any("from", m.From), zap.Any("subject", m.Subject))
			if e := h.queue.Push(m); e != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot put mail in queue: %s", e.Error()), zap.Any("to", m.To), zap.Any("from", m.From), zap.Any("subject", m.Subject))
				return e
			}
		} else {
			log.Logger(ctx).Info("SendMail: sending email", zap.Any("to", m.To), zap.Any("from", m.From), zap.Any("subject", m.Subject))
			if e := h.sender.Send(m); e != nil {
				log.Logger(ctx).Error(fmt.Sprintf("could not directly send mail: %s", e.Error()), zap.Any("to", m.To), zap.Any("from", m.From), zap.Any("subject", m.Subject))
				return e
			}
		}
	}
	return nil
}

// ConsumeQueue browses current queue for emails to be sent
func (h *Handler) ConsumeQueue(ctx context.Context, req *proto.ConsumeQueueRequest, rsp *proto.ConsumeQueueResponse) error {

	h.checkConfigChange(ctx)

	counter := int64(0)
	c := func(em *proto.Mail) error {
		if em == nil {
			log.Logger(ctx).Error("ConsumeQueue: trying to send empty email")
			return fmt.Errorf("cannot send empty email")
		}
		counter++
		return h.sender.Send(em)
	}

	e := h.queue.Consume(c)
	if e != nil {
		return e
	}

	rsp.Message = fmt.Sprintf("Successfully sent %d messages", counter)
	rsp.EmailsSent = counter
	return nil
}

func (h *Handler) parseConf(conf common.ConfigValues) (queueName string, queueConfig config.Map, senderName string, senderConfig config.Map) {

	// Defaults
	queueName = "boltdb"
	senderName = "sendmail"
	senderConfig = conf.(config.Map)
	queueConfig = conf.(config.Map)

	// Parse configs for queue
	if q := conf.String("queue"); q != "" {
		var queueData struct {
			Value string `json:"@value"`
		}
		if e := json.Unmarshal([]byte(q), &queueData); e == nil && queueData.Value != "" {
			queueName = queueData.Value
		}

	}

	// Parse configs for sender
	var senderConf map[string]interface{}
	if s := conf.String("sender"); s != "" {
		json.Unmarshal([]byte(s), &senderConf)
	} else if m := conf.Map("sender"); m != nil {
		senderConf = m
	}
	if senderConf != nil {
		senderConfig = config.Map{}
		var name string
		for k, v := range senderConf {
			if k == forms.SwitchFieldValueKey {
				name = v.(string)
			} else {
				// Special case for sendmail executable path
				if k == "executable" && v == "other" {
					v = config.Get("services", Name, "sendmail").String("sendmail")
				}
				senderConfig.Set(k, v)
			}
		}
		log.Logger(context.Background()).Debug("Parsed config for mailer", zap.Any("c", senderConfig))
		senderName = name
	}
	return
}

func (h *Handler) initFromConf(ctx context.Context, conf common.ConfigValues) error {

	queueName, queueConfig, senderName, senderConfig := h.parseConf(conf)
	if h.queue != nil {
		h.queue.Close()
	}
	h.queue = mailer.GetQueue(ctx, queueName, queueConfig)
	if h.queue == nil {
		queueName = "boltdb"
		h.queue = mailer.GetQueue(ctx, "boltdb", conf)
	} else {
		log.Logger(ctx).Info("Starting mailer with queue '" + queueName + "'")
	}

	sender, err := mailer.GetSender(senderName, senderConfig)
	if err != nil {
		return err
	}
	log.Logger(ctx).Info("Starting mailer with sender '" + senderName + "'")
	h.sender = sender

	h.queueName = queueName
	h.queueConfig = queueConfig
	h.senderName = senderName
	h.senderConfig = senderConfig

	return nil
}

func (h *Handler) checkConfigChange(ctx context.Context) error {

	var cfg config.Map
	if e := config.Get("services", servicecontext.GetServiceName(ctx)).Scan(&cfg); e != nil {
		return e
	}
	queueName, _, senderName, senderConfig := h.parseConf(cfg)
	m1, _ := json.Marshal(senderConfig)
	m2, _ := json.Marshal(h.senderConfig)
	if queueName != h.queueName || senderName != h.senderName || string(m1) != string(m2) {
		log.Logger(ctx).Info("Mailer configuration has changed. Refreshing sender and queue")
		return h.initFromConf(ctx, cfg)
	}
	return nil
}
