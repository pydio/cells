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

package websocket

import (
	"github.com/pydio/cells/v4/common/proto/chat"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type MessageType string

const (
	MsgSubscribe   MessageType = "subscribe"
	MsgUnsubscribe MessageType = "unsubscribe"
	MsgError       MessageType = "error"
)

// Message passes JWT
type Message struct {
	Type  MessageType `json:"@type"`
	JWT   string      `json:"jwt"`
	Error string      `json:"error"`
}

func NewErrorMessage(e error) []byte {
	return Marshal(Message{
		Type:  MsgError,
		Error: e.Error(),
	})
}

func NewErrorMessageString(e string) []byte {
	return Marshal(Message{
		Type:  MsgError,
		Error: e,
	})
}

func Marshal(m Message) []byte {
	data, _ := json.Marshal(m)
	return data
}

type ChatMessageType string

const (
	JoinRoom    ChatMessageType = "join"
	LeaveRoom   ChatMessageType = "leave"
	PostMessage ChatMessageType = "msg"
)

type ChatMessage struct {
	Type     ChatMessageType `json:"@type"`
	RoomType chat.RoomType
	Payload  string
}
