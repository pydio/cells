package mailer

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type mongoQueue struct {
	mongodb.DAO
	runtime context.Context
}

type StoredEmail struct {
	ID    string `bson:"id"`
	Ts    int64  `bson:"ts"`
	Email *mailer.Mail
}

const (
	collMailerQueue = "mailqueues"
)

var (
	model = &mongodb.Model{Collections: []mongodb.Collection{
		{
			Name: collMailerQueue,
			Indexes: []map[string]int{
				{"ts": 1},
			},
		},
	}}
)

func (m *mongoQueue) Init(ctx context.Context, conf configx.Values) error {
	return model.Init(ctx, m.DAO)
}

func (m *mongoQueue) Push(email *mailer.Mail) error {
	store := &StoredEmail{
		Ts:    time.Now().UnixNano(),
		ID:    uuid.New(),
		Email: email,
	}
	_, e := m.Collection(collMailerQueue).InsertOne(m.runtime, store)
	return e
}

func (m *mongoQueue) Consume(f func(email *mailer.Mail) error) error {
	coll := m.Collection(collMailerQueue)
	ctx := m.runtime
	cursor, e := coll.Find(ctx, bson.D{}, &options.FindOptions{Sort: bson.D{{"ts", 1}}})
	if e != nil {
		return e
	}
	for cursor.Next(ctx) {
		mail := &StoredEmail{}
		if e := cursor.Decode(mail); e == nil {
			if e := f(mail.Email); e == nil || mail.Email.Retries > MaxSendRetries {
				if _, e := coll.DeleteOne(ctx, bson.D{{"id", mail.ID}}); e != nil {
					fmt.Println("Could not delete email after send", e)
				} else {
					fmt.Println("Deleted email after send (or max retries reached)")
				}
			} else {
				mail.Email.Retries += 1
				if _, e := coll.ReplaceOne(ctx, bson.D{{Key: "id", Value: mail.ID}}, mail); e != nil {
					fmt.Println("Could not update retry after send failed", e)
				} else {
					fmt.Println("Send failed, updated retry count")
				}
			}
		}
	}
	return nil
}

func (m *mongoQueue) Close(ctx context.Context) error {
	return m.DAO.CloseConn(ctx)
}
