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

package config

import (
	"time"

	proto "github.com/pydio/config-srv/proto/config"
	micro "github.com/pydio/go-os/config"
)

type Watcher interface {
	Next() (*micro.ChangeSet, error)
	Stop()
}

type sourceWatcher struct {
	w proto.Config_WatchClient
}

func (w *sourceWatcher) Next() (*micro.ChangeSet, error) {
	c, err := w.w.Recv()
	if err != nil {
		return nil, err
	}
	return &micro.ChangeSet{
		Timestamp: time.Unix(c.ChangeSet.Timestamp, 0),
		Data:      []byte(c.ChangeSet.Data),
		Checksum:  c.ChangeSet.Checksum,
		Source:    c.ChangeSet.Source,
	}, nil
}

func (w *sourceWatcher) Stop() error {
	return w.w.Close()
}
