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
	"crypto/tls"
	"fmt"

	"github.com/pkg/errors"
	"go.uber.org/zap"
	"gopkg.in/gomail.v2"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type Smtp struct {
	User               string
	Password           string
	Host               string
	Port               int
	LocalName          string
	InsecureSkipVerify bool
	UseSSL             bool
}

func (gm *Smtp) Configure(ctx context.Context, conf configx.Values) error {

	gm.User = conf.Val("user").String()
	if gm.User == "" {
		return fmt.Errorf("cannot configure mailer: missing compulsory user name")
	}

	gm.Password = conf.Val("clearPass").Default("NOT_SET").String()
	if gm.Password == "NOT_SET" {
		gm.Password = config.GetSecret(conf.Val("password").String()).Default("NOT_SET").String()
	}

	if gm.Password == "NOT_SET" {
		return fmt.Errorf("cannot configure mailer: missing compulsory password")
	}

	gm.Host = conf.Val("host").String()
	if gm.Host == "" {
		return fmt.Errorf("cannot configure mailer: missing compulsory host address")
	}

	gm.Port = conf.Val("port").Int()
	if gm.Port == 0 {
		return fmt.Errorf("cannot configure mailer: missing compulsory port")
	}

	if loc := conf.Val("localName").Default("").String(); loc != "" {
		gm.LocalName = loc
	}

	// Set default to be false.
	gm.InsecureSkipVerify = conf.Val("insecureSkipVerify").Bool()

	gm.UseSSL = conf.Val("connectionSecurity").Default("starttls").String() == "ssl"

	log.Logger(ctx).Debug("SMTP Configured", zap.String("u", gm.User), zap.String("h", gm.Host), zap.Int("p", gm.Port))

	return nil
}

func (gm *Smtp) Check(ctx context.Context) error {

	// Default value, unnecessary check
	if gm.Host == "my.smtp.server" {
		return errors.New("mailer not configured yet (my.smtp.server)")
	}
	// Test Config - Unfortunately we cannot set the Timeout here - 10s by default
	d := gomail.NewDialer(gm.Host, gm.Port, gm.User, gm.Password)
	if gm.LocalName != "" {
		d.LocalName = gm.LocalName
	}
	tlsConfig := tls.Config{
		InsecureSkipVerify: gm.InsecureSkipVerify,
		ServerName:         gm.Host,
	}
	d.SSL = gm.UseSSL

	// Check configuration
	d.TLSConfig = &tlsConfig
	if closer, err := d.Dial(); err != nil {
		log.Logger(ctx).Warn("Mailer check failed", zap.Error(err))
		return err
	} else {
		log.Logger(ctx).Info("Mailer check passed")
		closer.Close()
	}
	return nil

}

func (gm *Smtp) Send(email *mailer.Mail) error {
	log.Logger(context.Background()).Debug("Trying to send email", zap.String("smtpHost", gm.Host), zap.String("smtpUser", gm.User), zap.Any("mail", email))
	m, e := NewGomailMessage(email)
	if e != nil {
		return e
	}
	d := gomail.NewDialer(gm.Host, gm.Port, gm.User, gm.Password)
	if gm.LocalName != "" {
		d.LocalName = gm.LocalName
	}
	d.SSL = gm.UseSSL
	tlsConfig := tls.Config{
		InsecureSkipVerify: gm.InsecureSkipVerify,
		ServerName:         gm.Host,
	}
	d.TLSConfig = &tlsConfig
	return d.DialAndSend(m)
}
