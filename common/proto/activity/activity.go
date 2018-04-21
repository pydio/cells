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

package activity

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
)

/* activity.go file enriches default generated proto structs with some custom pydio methods to ease development */

/* LOGGING SUPPORT */

// Zap simply returns a zapcore.Field object populated with this Activity Subscription under a standard key
func (s *Subscription) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACTIVITY_SUBSCRIPTION, s)
}

// Zap simply returns a zapcore.Field object populated with this StreamActivitiesRequest under a standard key
func (s *StreamActivitiesRequest) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACTIVITY_STREAM_REQUEST, s)
}

// Zap simply returns a zapcore.Field object populated with this PostActivityEvent under a standard key
func (e *PostActivityEvent) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACTIVITY_POST_EVENT, e)
}

// Zap simply returns a zapcore.Field object populated with this Activity OBJECT under a standard key
func (o *Object) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACTIVITY_OBJECT, o)
}
