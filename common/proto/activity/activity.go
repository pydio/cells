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

package activity

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v5/common"
)

/* activity.go file enriches default generated proto structs with some custom pydio methods to ease development */

/* LOGGING SUPPORT */

// MarshalLogObject implements custom marshalling for logs
func (s *Subscription) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if s.UserId != "" {
		encoder.AddString("UserId", s.UserId)
	}
	if s.ObjectId != "" {
		encoder.AddString("ObjectId", s.ObjectId)
	}
	if s.Events != nil && len(s.Events) > 0 {
		encoder.AddReflected("Events", s.Events)
	}
	if s.ObjectType != 0 {
		encoder.AddInt32("ObjectType", int32(s.ObjectType))
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this Activity Subscription under a standard key
func (s *Subscription) Zap() zapcore.Field {
	return zap.Object(common.KeyActivitySubscription, s)
}

// MarshalLogObject implements custom marshalling for logs
func (s *StreamActivitiesRequest) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if s.BoxName != "" {
		encoder.AddString("BoxName", s.BoxName)
	}
	if s.Language != "" {
		encoder.AddString("Language", s.Language)
	}
	if s.ContextData != "" {
		encoder.AddString("ContextData", s.ContextData)
	}
	if s.StreamFilter != "" {
		encoder.AddString("StreamFilter", s.StreamFilter)
	}
	if s.Offset != 0 {
		encoder.AddInt64("Offset", int64(s.Offset))
	}
	if s.Limit != 0 {
		encoder.AddInt64("Limit", int64(s.Limit))
	}
	encoder.AddBool("UnreadCountOnly", s.UnreadCountOnly)
	encoder.AddBool("AsDigest", s.AsDigest)
	return nil
}

// Zap simply returns a zapcore.Field object populated with this StreamActivitiesRequest under a standard key
func (s *StreamActivitiesRequest) Zap() zapcore.Field {
	return zap.Object(common.KeyActivityStreamRequest, s)
}

// MarshalLogObject implements custom marshalling for logs
func (p *PostActivityEvent) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if p.BoxName != "" {
		encoder.AddString("BoxName", p.BoxName)
	}
	if p.JsonType != "" {
		encoder.AddString("JsonType", p.JsonType)
	}
	if p.OwnerId != "" {
		encoder.AddString("OwnerId", p.OwnerId)
	}
	if p.OwnerType != 0 {
		encoder.AddInt32("OwnerType", int32(p.OwnerType))
	}
	return nil
}

// Zap simply returns a zapcore.Field object populated with this PostActivityEvent under a standard key
func (p *PostActivityEvent) Zap() zapcore.Field {
	return zap.Object(common.KeyActivityPostEvent, p)
}

// // Zap simply returns a zapcore.Field object populated with this Activity OBJECT under a standard key
// func (o *Object) Zap() zapcore.Field {
// 	return zap.Any(common.KeyActivityObject, o)
// }
