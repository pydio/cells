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

// Package chat provides real-time chats linked to any topics for end users.
package chat

import (
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/chat"
)

type DAO interface {
	dao.DAO
	PutRoom(room *chat.ChatRoom) (*chat.ChatRoom, error)
	DeleteRoom(room *chat.ChatRoom) (bool, error)
	ListRooms(request *chat.ListRoomsRequest) ([]*chat.ChatRoom, error)
	RoomByUuid(byType chat.RoomType, roomUUID string) (*chat.ChatRoom, error)
	ListMessages(request *chat.ListMessagesRequest) ([]*chat.ChatMessage, error)
	PostMessage(request *chat.ChatMessage) (*chat.ChatMessage, error)
	DeleteMessage(message *chat.ChatMessage) error
	CountMessages(room *chat.ChatRoom) (count int, e error)
}

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case boltdb.DAO:
		return &boltdbimpl{DAO: v, HistorySize: 1000}
	case mongodb.DAO:
		return &mongoImpl{DAO: v}
	}
	return nil
}

func Migrate(f dao.DAO, t dao.DAO, dryRun bool) (map[string]int, error) {
	res := map[string]int{
		"Rooms":    0,
		"Messages": 0,
	}
	from := NewDAO(f).(DAO)
	to := NewDAO(t).(DAO)
	for _, roomType := range chat.RoomType_value {
		rooms, er := from.ListRooms(&chat.ListRoomsRequest{
			ByType: chat.RoomType(roomType),
		})
		if er != nil {
			return res, er
		}
		for _, room := range rooms {
			if dryRun {
				res["Rooms"]++
			} else if _, er := to.PutRoom(room); er != nil {
				return res, er
			} else {
				res["Rooms"]++
			}
			pageSize := int64(1000)
			page := int64(0)
			for {
				messages, er := from.ListMessages(&chat.ListMessagesRequest{
					RoomUuid: room.GetUuid(),
					Offset:   page * pageSize,
					Limit:    pageSize,
				})
				if er != nil {
					return res, er
				}
				for _, msg := range messages {
					if dryRun {
						res["Messages"]++
					} else if _, er := to.PostMessage(msg); er != nil {
						return res, er
					} else {
						res["Messages"]++
					}
				}
				if int64(len(messages)) < pageSize {
					break
				}
				page++
			}
		}
	}
	return res, nil
}
