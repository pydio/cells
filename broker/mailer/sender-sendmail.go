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
	"os"
	"os/exec"
	"regexp"

	"github.com/pkg/errors"

	"github.com/pydio/cells/v5/common/proto/mailer"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/filex"
)

type Sendmail struct {
	BinPath   string
	BinParams []string
}

func (s *Sendmail) Configure(ctx context.Context, conf configx.Values) error {
	s.BinPath = conf.Val("#/defaults/sendmail").Default("/usr/bin/sendmail").String()
	log.Logger(ctx).Info("Configuring sendmail with binary path: " + s.BinPath)
	params := conf.Val("#/defaults/sendmailParams").StringArray()
	if len(params) > 0 {
		s.BinParams = params
	}
	return nil
}

func (s *Sendmail) Check(ctx context.Context) error {
	// Check that executable path is correct
	if !filex.Exists(s.BinPath) {
		return errors.New("cannot find executable path")
	}
	return nil

}

func (d *Sendmail) Send(ctx context.Context, email *mailer.Mail) error {

	m, e := NewGomailMessage(email)
	if e != nil {
		return e
	}

	// TODO must be fine tuned. On centOS, the email is sent but sendmail returns
	// an error code 67: "addressee unknown", see for instance: https://fossies.org/dox/sendmail.8.15.2/include_2sm_2sysexits_8h.html

	// Sendmail expect explicit recipients as argument
	var toStr string
	var rxEmail = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")
	for _, user := range email.To {
		if len(user.Address) > 254 || !rxEmail.MatchString(user.Address) {
			return errors.New("string does not seems a valid email address")
		}
		toStr += user.Address + ", "
	}
	if toStr == "" {
		return errors.New("cannot send mail without any recipient")
	}
	toStr = "\"" + toStr + "\""

	// Call the system command
	params := d.BinParams
	params = append(params, "-t", toStr)
	cmd := exec.Command(d.BinPath, params...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	pw, err := cmd.StdinPipe()
	if err != nil {
		return err
	}

	err = cmd.Start()
	if err != nil {
		return err
	}

	var errs [3]error
	_, errs[0] = m.WriteTo(pw)
	errs[1] = pw.Close()
	errs[2] = cmd.Wait()
	for _, err = range errs {
		if err != nil {
			return err
		}
	}
	return nil
}
