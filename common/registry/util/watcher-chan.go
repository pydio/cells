/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package util

import (
	"github.com/pydio/cells/v5/common/errors"
	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/registry"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func NewChanStatusWatcher(item registry.Item, input chan map[string]interface{}) registry.StatusWatcher {

	s := &chanStatusWatcher{
		item:  item,
		exit:  make(chan bool),
		input: input,
	}
	return s

}

type chanStatusWatcher struct {
	item  registry.Item
	exit  chan bool
	input chan map[string]interface{}
}

func (s *chanStatusWatcher) Next() (registry.Item, error) {
	for {
		select {
		case ss := <-s.input:
			js, _ := json.Marshal(ss)
			gen := &pb.Item{
				Id:       s.item.ID() + "-stats",
				Name:     "stats",
				Metadata: map[string]string{"Data": string(js)},
			}
			return ToGeneric(gen, &pb.Generic{Type: pb.ItemType_STATS}), nil
		case <-s.exit:
			return nil, errors.New("watcher stopped")
		}
	}
}

func (s *chanStatusWatcher) Stop() {
	select {
	case <-s.exit:
		return
	default:
		close(s.exit)
	}
}
