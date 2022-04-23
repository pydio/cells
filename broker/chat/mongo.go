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

package chat

import (
	"context"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

var mongoModel = mongodb.Model{
	Collections: []mongodb.Collection{
		{
			Name: "rooms",
			Indexes: []map[string]int{
				{"uuid": 1},
				{"type": 1, "roomtypeobject": 1},
			},
		},
		{
			Name: "messages",
			Indexes: []map[string]int{
				{"roomuuid": 1},
				{"author": 1},
				{"timestamp": -1},
			},
		},
	},
}

type mongoImpl struct {
	mongodb.DAO
}

func (m *mongoImpl) Init(ctx context.Context, values configx.Values) error {
	if e := mongoModel.Init(context.Background(), m.DAO); e != nil {
		return e
	}
	return m.DAO.Init(ctx, values)
}

func (m *mongoImpl) PutRoom(ctx context.Context, room *chat.ChatRoom) (*chat.ChatRoom, error) {
	if room.Uuid == "" {
		room.Uuid = uuid.New()
		_, e := m.Collection("rooms").InsertOne(ctx, room)
		if e != nil {
			return nil, e
		} else {
			//fmt.Println("Inserted room", res.InsertedID)
			return room, nil
		}
	} else {
		upsert := true
		_, e := m.Collection("rooms").ReplaceOne(ctx, bson.D{{"uuid", room.Uuid}}, room, &options.ReplaceOptions{Upsert: &upsert})
		if e != nil {
			return nil, e
		} else {
			//fmt.Println("Upserted room (ModifiedCount)", res.ModifiedCount)
			return room, nil
		}
	}
}

func (m *mongoImpl) DeleteRoom(ctx context.Context, room *chat.ChatRoom) (bool, error) {
	res := m.Collection("rooms").FindOneAndDelete(ctx, bson.D{{"uuid", room.Uuid}})
	if res.Err() != nil && !strings.Contains(res.Err().Error(), "no documents in result") {
		return false, res.Err()
	} else {
		// Delete all messages for this room
		_, er := m.Collection("messages").DeleteMany(ctx, bson.D{{"roomuuid", room.Uuid}})
		if er != nil && !strings.Contains(er.Error(), "no documents in result") {
			return false, er
		} else {
			//fmt.Println("Deleted", res.DeletedCount, "messages for this room")
		}
	}
	return true, nil
}

func (m *mongoImpl) ListRooms(ctx context.Context, request *chat.ListRoomsRequest) (cc []*chat.ChatRoom, e error) {
	filter := bson.D{{"type", request.ByType}}
	if request.TypeObject != "" {
		filter = append(filter, primitive.E{Key: "roomtypeobject", Value: request.TypeObject})
	}
	cursor, err := m.Collection("rooms").Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	for cursor.Next(ctx) {
		room := &chat.ChatRoom{}
		if er := cursor.Decode(room); er == nil {
			cc = append(cc, room)
		} else {
			return cc, er
		}
	}
	return
}

func (m *mongoImpl) RoomByUuid(ctx context.Context, byType chat.RoomType, roomUUID string) (*chat.ChatRoom, error) {
	single := m.Collection("rooms").FindOne(ctx, bson.D{
		{"type", byType}, {"uuid", roomUUID},
	})
	if single.Err() != nil {
		return nil, single.Err()
	}
	res := &chat.ChatRoom{}
	er := single.Decode(res)
	return res, er
}

func (m *mongoImpl) ListMessages(ctx context.Context, request *chat.ListMessagesRequest) (cc []*chat.ChatMessage, e error) {
	filter := bson.D{{"roomuuid", request.RoomUuid}}
	opts := &options.FindOptions{}
	if request.Limit > 0 {
		opts.Limit = &request.Limit
	}
	if request.Offset > 0 {
		opts.Skip = &request.Offset
	}
	opts.Sort = bson.D{{"timestamp", -1}}
	cursor, err := m.Collection("messages").Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	for cursor.Next(ctx) {
		room := &chat.ChatMessage{}
		if er := cursor.Decode(room); er == nil {
			cc = append(cc, room)
		} else {
			return cc, er
		}
	}
	// Reverse slice
	for i, j := 0, len(cc)-1; i < j; i, j = i+1, j-1 {
		cc[i], cc[j] = cc[j], cc[i]
	}
	return
}

func (m *mongoImpl) PostMessage(ctx context.Context, request *chat.ChatMessage) (*chat.ChatMessage, error) {
	if request.Uuid == "" {
		request.Uuid = uuid.New()
	}
	_, e := m.Collection("messages").InsertOne(ctx, request)
	if e != nil {
		return nil, e
	} else {
		//fmt.Println("Inserted message", res.InsertedID)
		return request, nil
	}
}

func (m *mongoImpl) DeleteMessage(ctx context.Context, message *chat.ChatMessage) error {
	res := m.Collection("messages").FindOneAndDelete(ctx, bson.D{{"uuid", message.Uuid}})
	if res.Err() != nil {
		return res.Err()
	} else {
		return nil
	}
}

func (m *mongoImpl) CountMessages(ctx context.Context, room *chat.ChatRoom) (count int, e error) {
	c, e := m.Collection("messages").CountDocuments(ctx, bson.D{{"roomuuid", room.Uuid}})
	return int(c), e
}
