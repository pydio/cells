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
	"crypto/tls"
	"fmt"
	"strconv"

	"github.com/pkg/errors"

	"go.uber.org/zap"
	gomail "gopkg.in/gomail.v2"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/mailer"
)

type Smtp struct {
	User               string
	Password           string
	Host               string
	Port               int
	InsecureSkipVerify bool
}

func (gm *Smtp) Configure(ctx context.Context, conf config.Map) error {

	val := conf.Get("user")
	if val == nil {
		return fmt.Errorf("cannot configure mailer: missing compulsory user name")
	}
	gm.User = val.(string)

	if clear := conf.Get("clearPass"); clear != nil {
		// Used by tests
		gm.Password = clear.(string)
	} else {
		val = conf.Get("password")
		if val == nil {
			return fmt.Errorf("cannot configure mailer: missing compulsory password")
		}
		passwordSecret := val.(string)
		gm.Password = config.GetSecret(passwordSecret).String("")
	}

	val = conf.Get("host")
	if val == nil {
		return fmt.Errorf("cannot configure mailer: missing compulsory host address")
	}
	gm.Host = val.(string)

	portConf := conf.Get("port")
	if portConf == nil {
		return fmt.Errorf("cannot configure mailer: missing compulsory port")
	}

	if sConf, ok := portConf.(string); ok && sConf != "" {
		parsed, _ := strconv.ParseInt(sConf, 10, 64)
		gm.Port = int(parsed)
	} else {
		gm.Port = int(portConf.(float64))
	}
	// Set defaul to be false.
	gm.InsecureSkipVerify = false
	if conf.Get("insecureSkipVerify") != nil {
		gm.InsecureSkipVerify = conf.Get("insecureSkipVerify").(bool)
	}
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
	tlsConfig := tls.Config{
		InsecureSkipVerify: gm.InsecureSkipVerify,
		ServerName:         gm.Host,
	}
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
	tlsConfig := tls.Config{
		InsecureSkipVerify: gm.InsecureSkipVerify,
		ServerName:         gm.Host,
	}
	d.TLSConfig = &tlsConfig
	return d.DialAndSend(m)
}
