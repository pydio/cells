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

import "github.com/pydio/cells/v4/common/proto/mailer"

type memQueue struct {
	list []*mailer.Mail
}

func newInMemoryQueue() *memQueue {
	m := new(memQueue)
	m.list = make([]*mailer.Mail, 1)
	return m
}

func (m memQueue) Close() error {
	m.list = make([]*mailer.Mail, 1)
	return nil
}

func (m memQueue) Push(email *mailer.Mail) error {
	m.list = append(m.list, email)
	return nil
}

func (m memQueue) Consume(mh func(email *mailer.Mail) error) error {
	var i int = 0
	for i = range m.list {
		em := m.list[i]
		if err := mh(em); err != nil {
			i++
			break
		}
	}

	if i < len(m.list) {
		m.list = m.list[:i]
	}
	return nil
}
