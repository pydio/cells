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
	"context"

	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage/mongodb"
)

type MessageMatcher func(msg *chat.ChatMessage) (matches bool, filtered *chat.ChatMessage, err error)

type DAO interface {
	// PutRoom creates a new ChatRoom
	PutRoom(ctx context.Context, room *chat.ChatRoom) (*chat.ChatRoom, error)
	// DeleteRoom deletes a whole ChatRoom
	DeleteRoom(ctx context.Context, room *chat.ChatRoom) (bool, error)
	// ListRooms lists all chat rooms with request criteria
	ListRooms(ctx context.Context, request *chat.ListRoomsRequest) ([]*chat.ChatRoom, error)
	// RoomByUuid loads a room by UUID
	RoomByUuid(ctx context.Context, byType chat.RoomType, roomUUID string) (*chat.ChatRoom, error)
	// ListMessages loads all message for a given room, with cursor information
	ListMessages(ctx context.Context, request *chat.ListMessagesRequest) ([]*chat.ChatMessage, error)
	// PostMessage appends a message to the list, generating a UUID if required.
	PostMessage(ctx context.Context, request *chat.ChatMessage) (*chat.ChatMessage, error)
	// UpdateMessage updates the content of a message. It must check that new message's author matches existing author.
	UpdateMessage(ctx context.Context, request *chat.ChatMessage, callback MessageMatcher) (*chat.ChatMessage, error)
	// DeleteMessage deletes a message by UUID
	DeleteMessage(ctx context.Context, message *chat.ChatMessage) error
	// CountMessages counts all messages in a ChatRoom
	CountMessages(ctx context.Context, room *chat.ChatRoom) (count int, e error)
}

func NewBoltDAO(db *bbolt.DB) DAO {
	return &boltdbimpl{db: db, HistorySize: 1000}
}

func NewMongoDAO(db *mongodb.Database) DAO {
	return &mongoImpl{db: db}
}

func Migrate(f, t any, dryRun bool, status chan service.MigratorStatus) (map[string]int, error) {
	ctx := context.Background()

	res := map[string]int{
		"Rooms":    0,
		"Messages": 0,
	}
	from := f.(DAO)
	to := t.(DAO)

	for _, roomType := range chat.RoomType_value {
		rooms, er := from.ListRooms(ctx, &chat.ListRoomsRequest{
			ByType: chat.RoomType(roomType),
		})
		if er != nil {
			return res, er
		}
		for _, room := range rooms {
			if dryRun {
				res["Rooms"]++
			} else if _, er := to.PutRoom(ctx, room); er != nil {
				return res, er
			} else {
				res["Rooms"]++
			}
			pageSize := int64(1000)
			page := int64(0)
			for {
				messages, er := from.ListMessages(ctx, &chat.ListMessagesRequest{
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
					} else if _, er := to.PostMessage(ctx, msg); er != nil {
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
