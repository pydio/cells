package mailer

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type mongoQueue struct {
	db *mongo.Database
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
	return model.Init(ctx, m.db)
}

func (m *mongoQueue) Push(ctx context.Context, email *mailer.Mail) error {
	store := &StoredEmail{
		Ts:    time.Now().UnixNano(),
		ID:    uuid.New(),
		Email: email,
	}
	_, e := m.db.Collection(collMailerQueue).InsertOne(ctx, store)
	return e
}

func (m *mongoQueue) Consume(ctx context.Context, f func(email *mailer.Mail) error) error {
	coll := m.db.Collection(collMailerQueue)
	cursor, e := coll.Find(ctx, bson.D{}, &options.FindOptions{Sort: bson.D{{"ts", 1}}})
	if e != nil {
		return e
	}
	var errStack []string
	var i int
	for cursor.Next(ctx) {
		mail := &StoredEmail{}
		if de := cursor.Decode(mail); de == nil {
			i++
			if err := f(mail.Email); err == nil || mail.Email.Retries > MaxSendRetries {
				if _, delE := coll.DeleteOne(ctx, bson.D{{"id", mail.ID}}); delE != nil {
					fmt.Println("Could not delete email after send", delE)
					errStack = append(errStack, delE.Error())
				} else {
					fmt.Println("Deleted email after send (or max retries reached)")
				}
			} else {
				mail.Email.Retries += 1
				if _, ue := coll.ReplaceOne(ctx, bson.D{{Key: "id", Value: mail.ID}}, mail); ue != nil {
					fmt.Println("Could not update retry after send failed", ue)
					errStack = append(errStack, ue.Error())
				} else if err != nil {
					fmt.Println("Send failed, updated retry count")
					errStack = append(errStack, err.Error())
				}
			}
		}
	}
	if len(errStack) > 0 {
		return fmt.Errorf("batch sent %d mails and failed %d times, errors were: %s", i, len(errStack), strings.Join(errStack, ", "))
	}
	return nil
}

func (m *mongoQueue) Close(ctx context.Context) error {
	return nil
	// return m.DAO.CloseConn(ctx)
}
