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
	"context"
	"fmt"

	hermes "github.com/matcornic/hermes/v2"
	"go.uber.org/zap"
	protobuf "google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/broker/mailer"
	"github.com/pydio/cells/v5/broker/mailer/templates"
	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	proto "github.com/pydio/cells/v5/common/proto/mailer"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
)

type Handler struct {
	proto.UnimplementedMailerServiceServer
	svcName string
}

func NewHandler(svcName string) *Handler {
	return &Handler{svcName: svcName}
}

// SendMail either queues or send a mail directly
func (h *Handler) SendMail(ctx context.Context, req *proto.SendMailRequest) (*proto.SendMailResponse, error) {

	dao, err := manager.Resolve[mailer.Queue](ctx)
	if err != nil {
		return nil, err
	}

	mail := req.Mail

	// Sanity checks
	if mail == nil || (len(mail.Subject) == 0 && mail.TemplateId == "") || len(mail.To) == 0 {
		e := errors.WithMessage(errors.InvalidParameters, "cannot send mail: some required fields are missing")
		log.Logger(ctx).Error("cannot process mail to send", zap.Any("Mail", mail), zap.Error(e))
		return nil, e
	}
	if mail.ContentPlain == "" && mail.ContentMarkdown == "" && mail.ContentHtml == "" && mail.TemplateId == "" {
		e := errors.WithMessage(errors.InvalidParameters, "cannot send mail: please provide one of ContentPlain, ContentMarkdown or ContentHtml")
		log.Logger(ctx).Error("cannot process mail to send: empty body", zap.Any("Mail", mail), zap.Error(e))
		return nil, e
	}

	sender, er := h.getSender(ctx, config.Get(ctx, "services", h.svcName))
	if er != nil {
		return nil, errors.Tag(er, errors.StatusServiceUnavailable)
	}

	for _, to := range mail.To {
		// Find language to be used
		var languages []string
		if to.Language != "" {
			languages = append(languages, to.Language)
		}
		configs := templates.GetApplicationConfig(ctx, languages...)
		// Clone email and set unique user
		m := protobuf.Clone(mail).(*proto.Mail)
		m.To = []*proto.User{to}
		if configs.FromCtl == "default" {
			if m.From == nil {
				m.From = &proto.User{
					Address: configs.From,
					Name:    configs.FromName,
				}
			} else {
				m.From.Address = configs.From
				m.From.Name = configs.FromName
			}
		} else if configs.FromCtl == "sender" {
			if m.From == nil {
				m.From = &proto.User{
					Address: configs.From,
					Name:    configs.FromName,
				}
			} else if m.From.Address == "" {
				m.From.Address = configs.From
			}
			if m.From.Address != configs.From {
				m.Sender = &proto.User{
					Address: configs.From,
					Name:    configs.FromName,
				}
			}
		} else {
			if m.From == nil {
				m.From = &proto.User{
					Address: configs.From,
					Name:    configs.FromName,
				}
			} else if m.From.Address == "" {
				m.From.Address = configs.From
			}
		}
		he := templates.GetHermes(ctx, languages...)
		if m.ContentHtml == "" {
			var body hermes.Body
			if m.TemplateId != "" {
				var subject string
				subject, body = templates.BuildTemplateWithId(ctx, to, m.TemplateId, m.TemplateData, languages...)
				m.Subject = subject
				if m.ContentMarkdown != "" {
					body.FreeMarkdown = hermes.Markdown(m.ContentMarkdown)
				}
			} else {
				body = templates.PrepareSimpleBody(ctx, to, languages...)
				if m.ContentMarkdown != "" {
					body.FreeMarkdown = hermes.Markdown(m.ContentMarkdown)
				} else {
					body.Intros = []string{m.ContentPlain}
				}
			}
			hermesMail := hermes.Email{Body: body}
			var e error
			m.ContentHtml, _ = he.GenerateHTML(hermesMail)
			if m.ContentPlain, e = he.GeneratePlainText(hermesMail); e != nil {
				return nil, e
			}
		}

		// Restrict number of logged To
		tt := m.To
		if len(tt) > 20 {
			tt = tt[:20]
		}
		if req.InQueue {
			log.Logger(ctx).Debug("SendMail: pushing email to queue", log.DangerouslyZapSmallSlice("to", tt), zap.Any("from", *m.From), zap.String("subject", m.Subject))
			if e := dao.Push(ctx, m); e != nil {
				log.Logger(ctx).Error(fmt.Sprintf("cannot put mail in queue: %s", e.Error()), log.DangerouslyZapSmallSlice("to", tt), zap.Any("from", *m.From), zap.String("subject", m.Subject))
				return nil, e
			}
		} else {
			log.Logger(ctx).Info("SendMail: sending email", log.DangerouslyZapSmallSlice("to", tt), zap.Any("from", *m.From), zap.String("subject", m.Subject))
			if e := sender.Send(ctx, m); e != nil {
				log.Logger(ctx).Error(fmt.Sprintf("could not directly send mail: %s", e.Error()), log.DangerouslyZapSmallSlice("to", tt), zap.Any("from", *m.From), zap.String("subject", m.Subject))
				return nil, e
			}
		}
	}
	return &proto.SendMailResponse{Success: true}, nil
}

// ConsumeQueue browses current queue for emails to be sent
func (h *Handler) ConsumeQueue(ctx context.Context, req *proto.ConsumeQueueRequest) (*proto.ConsumeQueueResponse, error) {

	dao, err := manager.Resolve[mailer.Queue](ctx)
	if err != nil {
		return nil, err
	}

	sender, er := h.getSender(ctx, config.Get(ctx, "services", h.svcName))
	if er != nil {
		return nil, errors.Tag(er, errors.StatusServiceUnavailable)
	}

	counter := int64(0)
	c := func(em *proto.Mail) error {
		if em == nil {
			log.Logger(ctx).Error("ConsumeQueue: trying to send empty email")
			return fmt.Errorf("cannot send empty email")
		}
		counter++
		return sender.Send(ctx, em)
	}

	e := dao.Consume(ctx, c)
	if e != nil {
		return nil, e
	}

	rsp := &proto.ConsumeQueueResponse{}
	rsp.Message = fmt.Sprintf("Successfully sent %d messages", counter)
	log.TasksLogger(ctx).Info(rsp.Message)
	rsp.EmailsSent = counter
	return rsp, nil
}

func (h *Handler) parseConf(conf configx.Values) (senderName string, senderConfig configx.Values) {

	senderConfig = conf.Val("sender")
	senderName = senderConfig.Val("@value").Default("noop").String()

	return
}

func (h *Handler) getSender(ctx context.Context, conf configx.Values) (sender mailer.Sender, e error) {

	//conf := config.Get(ctx, "services", h.svcName)
	initialConfig := conf.Val("valid").Bool()
	var senderName string
	var senderConfig configx.Values

	defer func() {
		var newConfig bool
		if e != nil {
			newConfig = false
		} else {
			newConfig = true
		}
		if newConfig != initialConfig {
			log.Logger(ctx).Info("Updating mailer validity for sender '" + senderName + "'")
			_ = conf.Val("valid").Set(newConfig)
			_ = config.Save(ctx, common.PydioSystemUsername, "Update mailer valid config")
		}
	}()

	senderName, senderConfig = h.parseConf(conf)
	sender, e = mailer.GetSender(ctx, senderName, senderConfig)
	return
}

func (h *Handler) CheckSender(ctx context.Context, conf configx.Values) error {
	sender, e := h.getSender(ctx, conf)
	if e != nil {
		return e
	}
	return sender.Check(ctx)
}
