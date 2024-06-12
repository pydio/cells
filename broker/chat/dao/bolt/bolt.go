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

package bolt

import (
	"context"
	"encoding/binary"
	"fmt"

	"go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/broker/chat"
	"github.com/pydio/cells/v4/common/errors"
	proto "github.com/pydio/cells/v4/common/proto/chat"
	"github.com/pydio/cells/v4/common/storage/boltdb"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

func init() {
	chat.Drivers.Register(NewBoltDAO)
}

func NewBoltDAO(db boltdb.DB) chat.DAO {
	return &boltdbimpl{db: db, HistorySize: 1000}
}

type boltdbimpl struct {
	db          boltdb.DB
	HistorySize int64
}

const (
	rooms         = "rooms"
	messages      = "messages"
	generalObject = "general"
)

func (h *boltdbimpl) Init(ctx context.Context, config configx.Values) error {
	return h.db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(rooms))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(messages))
		if err != nil {
			return err
		}
		return nil
	})
}

// Load a given sub-bucket
// Bucket are structured like this:
// rooms
//
//	-> Room Types
//	  -> Type Objects
//	   	-> UUID => Rooms
//
// messages
//
//	-> ROOM IDS
//	   -> UUID => messages
func (h *boltdbimpl) getMessagesBucket(tx *bbolt.Tx, createIfNotExist bool, roomUuid string) (*bbolt.Bucket, error) {

	mainBucket := tx.Bucket([]byte(messages))
	if createIfNotExist {

		objectBucket, err := mainBucket.CreateBucketIfNotExists([]byte(roomUuid))
		if err != nil {
			return nil, err
		}
		return objectBucket, nil

	} else {

		objectBucket := mainBucket.Bucket([]byte(roomUuid))
		if objectBucket == nil {
			return nil, nil
		}
		return objectBucket, nil
	}
}

func (h *boltdbimpl) getRoomsBucket(tx *bbolt.Tx, createIfNotExist bool, roomType proto.RoomType, roomObject string) (*bbolt.Bucket, error) {

	mainBucket := tx.Bucket([]byte(messages))
	if createIfNotExist {

		objectBucket, err := mainBucket.CreateBucketIfNotExists([]byte(roomType.String()))
		if err != nil {
			return nil, err
		}
		if len(roomObject) == 0 {
			return objectBucket, nil
		}
		targetBucket, err := objectBucket.CreateBucketIfNotExists([]byte(roomObject))
		if err != nil {
			return nil, err
		}
		return targetBucket, nil

	} else {

		objectBucket := mainBucket.Bucket([]byte(roomType.String()))
		if objectBucket == nil {
			return nil, nil
		}
		if len(roomObject) == 0 {
			return objectBucket, nil
		}
		targetBucket := objectBucket.Bucket([]byte(roomObject))
		if targetBucket == nil {
			return nil, nil
		}
		return targetBucket, nil
	}
}

func (h *boltdbimpl) PutRoom(ctx context.Context, room *proto.ChatRoom) (*proto.ChatRoom, error) {

	err := h.db.Update(func(tx *bbolt.Tx) error {

		bucket, err := h.getRoomsBucket(tx, true, room.Type, room.RoomTypeObject)
		if err != nil {
			return err
		}
		if room.Uuid == "" {
			room.Uuid = uuid.New()
		}
		serialized, _ := json.Marshal(room)
		return bucket.Put([]byte(room.Uuid), serialized)

	})

	return room, err
}

func (h *boltdbimpl) DeleteRoom(ctx context.Context, room *proto.ChatRoom) (bool, error) {

	var success bool
	err := h.db.Update(func(tx *bbolt.Tx) error {

		bucket, err := h.getRoomsBucket(tx, false, room.Type, room.RoomTypeObject)
		if bucket == nil {
			success = true
			return nil
		}
		if err != nil {
			return err
		}
		e := bucket.Delete([]byte(room.Uuid))
		if e == nil {
			success = true
		}
		return e
	})

	return success, err
}

func (h *boltdbimpl) ListRooms(ctx context.Context, request *proto.ListRoomsRequest) (rooms []*proto.ChatRoom, e error) {

	e = h.db.View(func(tx *bbolt.Tx) error {

		if request.TypeObject != "" {

			bucket, _ := h.getRoomsBucket(tx, false, request.ByType, request.TypeObject)
			if bucket == nil {
				return nil
			}
			err := bucket.ForEach(func(k, v []byte) error {
				var room proto.ChatRoom
				err := json.Unmarshal(v, &room)
				if err != nil {
					return err
				}
				rooms = append(rooms, &room)
				return nil
			})
			if err != nil {
				return err
			}

		} else {

			bucket, _ := h.getRoomsBucket(tx, false, request.ByType, "")
			if bucket == nil {
				return nil
			}
			return bucket.ForEach(func(k, v []byte) error {
				if v != nil {
					return nil
				}
				subBucket := bucket.Bucket(k)
				return subBucket.ForEach(func(k, v []byte) error {
					var room proto.ChatRoom
					err := json.Unmarshal(v, &room)
					if err != nil {
						return err
					}
					rooms = append(rooms, &room)
					return nil
				})
			})

		}

		return nil
	})

	return rooms, e
}

func (h *boltdbimpl) RoomByUuid(ctx context.Context, byType proto.RoomType, roomUUID string) (*proto.ChatRoom, error) {
	if byType == proto.RoomType_ANY {
		log.Logger(ctx).Debug("--- Lookup room with UUID only")
		types := []proto.RoomType{proto.RoomType_WORKSPACE, proto.RoomType_NODE, proto.RoomType_USER, proto.RoomType_GLOBAL}
		for _, t := range types {
			if cr, er := h.roomByTypeUuid(ctx, t, roomUUID); er == nil && cr != nil {
				return cr, nil
			}
		}
		return nil, fmt.Errorf("room %s not found", roomUUID)
	}
	return h.roomByTypeUuid(ctx, byType, roomUUID)
}

// roomByTypeUuid expects a specific type, not proto.RoomType_ANY
func (h *boltdbimpl) roomByTypeUuid(ctx context.Context, byType proto.RoomType, roomUUID string) (*proto.ChatRoom, error) {

	var foundRoom proto.ChatRoom
	var found bool
	e := h.db.View(func(tx *bbolt.Tx) error {
		bucket, _ := h.getRoomsBucket(tx, false, byType, "")
		if bucket == nil {
			return fmt.Errorf("rooms bucket %s not initialized", byType.String())
		}
		c := bucket.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			if v != nil {
				continue
			}
			subBucket := bucket.Bucket(k)
			r := subBucket.Get([]byte(roomUUID))
			if r != nil {
				err := json.Unmarshal(r, &foundRoom)
				if err != nil {
					return err
				}
				found = true
				break
			}
		}
		return nil
	})
	if e != nil {
		return nil, e
	}
	if !found {
		return nil, fmt.Errorf("room %s not found", roomUUID)
	}
	return &foundRoom, nil
}

func (h *boltdbimpl) CountMessages(ctx context.Context, room *proto.ChatRoom) (count int, e error) {
	e = h.db.View(func(tx *bbolt.Tx) error {
		if bucket, e := h.getMessagesBucket(tx, false, room.Uuid); e != nil {
			return e
		} else {
			count = bucket.Stats().KeyN
			return nil
		}
	})
	return
}

func (h *boltdbimpl) ListMessages(ctx context.Context, request *proto.ListMessagesRequest) (messages []*proto.ChatMessage, e error) {

	bounds := request.Limit > 0 || request.Offset > 0
	e = h.db.View(func(tx *bbolt.Tx) error {

		bucket, _ := h.getMessagesBucket(tx, false, request.RoomUuid)
		if bucket == nil {
			return nil
		}
		if bounds {
			cursor := int64(0)
			c := bucket.Cursor()
			c.Last()
			for k, v := c.Last(); k != nil; k, v = c.Prev() {
				if request.Offset > 0 && cursor < request.Offset {
					cursor++
					continue
				}
				var msg proto.ChatMessage
				if err := json.Unmarshal(v, &msg); err != nil {
					continue
				}
				if request.Limit > 0 && int64(len(messages)) >= request.Limit {
					break
				}
				messages = append(messages, &msg)
				cursor++
			}
			return nil
		} else {
			return bucket.ForEach(func(k, v []byte) error {
				var msg proto.ChatMessage
				err := json.Unmarshal(v, &msg)
				if err != nil {
					return err
				}
				messages = append(messages, &msg)
				return nil
			})
		}

	})

	if bounds {
		// Put back messages in correct order
		for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
			messages[i], messages[j] = messages[j], messages[i]
		}
	}

	return messages, e
}

func (h *boltdbimpl) PostMessage(ctx context.Context, request *proto.ChatMessage) (*proto.ChatMessage, error) {

	if request.Uuid == "" {
		request.Uuid = uuid.New()
	}

	err := h.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := h.getMessagesBucket(tx, true, request.RoomUuid)
		if err != nil {
			return nil
		}

		objectKey, _ := bucket.NextSequence()
		k := make([]byte, 8)
		binary.BigEndian.PutUint64(k, objectKey)
		serial, _ := json.Marshal(request)
		return bucket.Put(k, serial)
	})

	return request, err
}

func (h *boltdbimpl) UpdateMessage(ctx context.Context, request *proto.ChatMessage, callback chat.MessageMatcher) (out *proto.ChatMessage, err error) {

	err = h.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := h.getMessagesBucket(tx, false, request.RoomUuid)
		if err != nil {
			return nil
		}
		c := bucket.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var msg proto.ChatMessage
			if er := json.Unmarshal(v, &msg); er != nil {
				continue
			}
			matches, newMsg, er := callback(&msg)
			if er != nil {
				return er
			}
			if matches {
				out = newMsg
				newData, _ := json.Marshal(newMsg)
				return bucket.Put(k, newData)
			}
		}
		return nil
	})
	return
}

func (h *boltdbimpl) DeleteMessage(ctx context.Context, message *proto.ChatMessage) error {

	if message.Uuid == "" {
		return errors.WithMessage(errors.InvalidParameters, "Cannot delete a message without Uuid")
	}

	err := h.db.Update(func(tx *bbolt.Tx) error {
		bucket, err := h.getMessagesBucket(tx, false, message.RoomUuid)
		if err != nil || bucket == nil {
			return nil
		}
		return bucket.ForEach(func(k, v []byte) error {
			var msg proto.ChatMessage
			if err := json.Unmarshal(v, &msg); err == nil && msg.Uuid == message.Uuid {
				return bucket.Delete(k)
			}
			return nil
		})
	})

	return err
}
