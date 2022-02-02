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

package chat

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common"
)

/* chat.go file enriches default generated proto structs with some custom pydio methods to ease development */

/* LOGGING SUPPORT */

// Zap simply returns a zapcore.Field object populated with this ChatRoom under a standard key
func (c *ChatRoom) Zap() zapcore.Field {
	return zap.Object(common.KeyChatRoom, c)
}

// MarshalLogObject implements custom marshalling for logs
func (c *ChatRoom) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if c == nil {
		return nil
	}
	if c.Uuid != "" {
		encoder.AddString("Uuid", c.Uuid)
	}
	if c.RoomLabel != "" {
		encoder.AddString("RoomLabel", c.RoomLabel)
	}
	if c.Type != 0 {
		encoder.AddInt32("Type", int32(c.Type))
	}
	if c.Users != nil {
		encoder.AddReflected("Users", c.Users)
	}
	return nil
}
