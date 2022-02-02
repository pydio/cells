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

package permissions

import (
	"context"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/broker"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/utils/cache"
)

var (
	aclCache cache.Short
)

func initAclCache() {
	aclCache = cache.NewShort(cache.WithEviction(500*time.Millisecond), cache.WithCleanWindow(30*time.Second))
	_, _ = broker.Subscribe(context.TODO(), common.TopicIdmEvent, func(message broker.Message) error {
		event := &idm.ChangeEvent{}
		if _, e := message.Unmarshal(event); e != nil {
			return e
		}
		switch event.Type {
		case idm.ChangeEventType_CREATE, idm.ChangeEventType_UPDATE, idm.ChangeEventType_DELETE:
			return aclCache.Reset()
		}
		return nil
	})
}

func getAclCache() cache.Short {
	if aclCache == nil {
		initAclCache()
	}
	return aclCache
}
