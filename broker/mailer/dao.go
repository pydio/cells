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

// Package mailer acts a central mail server for the application.
//
// It implements various types of communication with actual mail servers (sendmail, smtp, sendgrid API) and a simple
// queue mechanism to avoid spamming these servers.
package mailer

import (
	"context"
	"path/filepath"

	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/mailer"
	"github.com/pydio/cells/common/service/context"
)

type Queue interface {
	Push(email *mailer.Mail) error
	Consume(func(email *mailer.Mail) error) error
	Close() error
}

type Sender interface {
	Configure(conf config.Map) error
	Send(email *mailer.Mail) error
}

func GetQueue(ctx context.Context, t string, conf common.ConfigValues) Queue {
	switch t {
	case "memory":
		return newInMemoryQueue()
	case "boltdb":
		dataDir, _ := config.ServiceDataDir(servicecontext.GetServiceName(ctx))
		queue, e := NewBoltQueue(filepath.Join(dataDir, "queue.db"), false)
		if e != nil {
			return nil
		} else {
			return queue
		}
	}
	return nil
}

func GetSender(t string, conf config.Map) (Sender, error) {

	var sender Sender

	switch t {
	case "smtp":
		sender = &Smtp{}

	case "sendgrid":
		sender = &SendGrid{}

	case "sendmail":
		sender = &Sendmail{}
	}

	if sender == nil {
		return nil, errors.NotFound(common.SERVICE_MAILER, "cannot find sender for type "+t)
	}

	err := sender.Configure(conf)
	if err != nil {
		return nil, errors.InternalServerError(common.SERVICE_MAILER, "cannot configure send type "+t)
	}

	return sender, nil
}
