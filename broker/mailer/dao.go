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

// Package mailer acts a central mail server for the application.
//
// It implements various types of communication with actual mail servers (sendmail, smtp, sendgrid API) and a simple
// queue mechanism to avoid spamming these servers.
package mailer

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const (
	// MaxSendRetries defines number of retries in case of connection failure.
	MaxSendRetries = 5
)

var Drivers = service.StorageDrivers{}

type Sender interface {
	Configure(ctx context.Context, conf configx.Values) error
	Send(email *mailer.Mail) error
	Check(ctx context.Context) error
}

func GetSender(ctx context.Context, t string, conf configx.Values) (Sender, error) {

	var sender Sender

	switch t {
	case "smtp":
		sender = &Smtp{}

	case "sendgrid":
		sender = &SendGrid{}

	case "noop":
		sender = &NoOpSender{valid: true}

	case "disabled":
		sender = &NoOpSender{valid: false}

	case "sendmail":
		sender = &Sendmail{}
	}

	if sender == nil {
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "cannot find sender for type %s", t)
	}

	err := sender.Configure(ctx, conf)
	if err != nil {
		log.Logger(ctx).Error("Error while configuring sender", zap.Error(err))
		return nil, errors.WithMessagef(errors.StatusInternalServerError, "cannot configure sender for type %s", t)
	}

	return sender, nil
}

type Queue interface {
	Push(ctx context.Context, email *mailer.Mail) error
	Consume(context.Context, func(email *mailer.Mail) error) error
	Close(ctx context.Context) error
}

// MigrateQueue is a MigratorFunc to move queued emails from one Queue to another.
func MigrateQueue(mainCtx, fromCtx, toCtx context.Context, dryRun bool, status chan service.MigratorStatus) (map[string]int, error) {
	out := map[string]int{
		"Emails": 0,
	}

	queueFrom, er := manager.Resolve[Queue](fromCtx)
	if er != nil {
		return nil, er
	}
	queueTo, er := manager.Resolve[Queue](toCtx)
	if er != nil {
		return nil, er
	}

	er = queueFrom.Consume(mainCtx, func(email *mailer.Mail) error {
		out["Emails"]++
		if dryRun {
			return nil
		}
		return queueTo.Push(nil, email)
	})
	return out, er
}
