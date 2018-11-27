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

package mailer

import (
	"context"
	"strconv"

	"go.uber.org/zap"
	"gopkg.in/gomail.v2"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/mailer"
)

type Smtp struct {
	User     string
	Password string
	Host     string
	Port     int
}

func (gm *Smtp) Configure(conf config.Map) error {

	gm.User = conf.Get("user").(string)
	// Used by tests
	if clear := conf.Get("clearPass"); clear != nil {
		gm.Password = clear.(string)
	} else {
		passwordSecret := conf.Get("password").(string)
		gm.Password = config.GetSecret(passwordSecret).String("")
	}
	gm.Host = conf.Get("host").(string)
	portConf := conf.Get("port")
	if sConf, ok := portConf.(string); ok && sConf != "" {
		parsed, _ := strconv.ParseInt(sConf, 10, 64)
		gm.Port = int(parsed)
	} else {
		gm.Port = int(portConf.(float64))
	}

	log.Logger(context.Background()).Debug("SMTP Configured", zap.String("user", gm.User), zap.String("host", gm.Host), zap.Int("port", gm.Port))

	return nil
}

func (gm *Smtp) Send(email *mailer.Mail) error {
	log.Logger(context.Background()).Debug("Trying to send email", zap.String("smtpHost", gm.Host), zap.String("smtpUser", gm.User), zap.Any("mail", email))
	m, e := NewGomailMessage(email)
	if e != nil {
		return e
	}
	d := gomail.NewDialer(gm.Host, gm.Port, gm.User, gm.Password)
	return d.DialAndSend(m)
}
