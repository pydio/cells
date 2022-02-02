package mailer

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

type mongoQueue struct {
	mongodb.DAO
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

func NewMongoQueue(mongoDAO mongodb.DAO, c configx.Values) (Queue, error) {
	m := &mongoQueue{DAO: mongoDAO}
	if e := m.Init(c); e != nil {
		return nil, e
	}
	return m, nil
}

func (m *mongoQueue) Init(conf configx.Values) error {
	return model.Init(context.Background(), m.DB())
}

func (m *mongoQueue) Push(email *mailer.Mail) error {
	store := &StoredEmail{
		Ts:    time.Now().UnixNano(),
		ID:    uuid.New(),
		Email: email,
	}
	_, e := m.DB().Collection(collMailerQueue).InsertOne(context.Background(), store)
	return e
}

func (m *mongoQueue) Consume(f func(email *mailer.Mail) error) error {
	coll := m.DB().Collection(collMailerQueue)
	ctx := context.Background()
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

func (m *mongoQueue) Close() error {
	return m.DAO.CloseConn()
}
