package mailer

import (
	"context"

	bolt "go.etcd.io/bbolt"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/mailer"
)

type Queue interface {
	Push(email *mailer.Mail) error
	Consume(func(email *mailer.Mail) error) error
	Close(ctx context.Context) error
}

func NewBoltDAO(db *bolt.DB) Queue {
	return &BoltQueue{db: db}
}

func NewMongoDAO(db *mongo.Database) Queue {
	return &mongoQueue{db: db, runtime: context.TODO()}
}

// MigrateQueue is a MigratorFunc to move queued emails from one Queue to another.
func MigrateQueue(from dao.DAO, to dao.DAO, dryRun bool, status chan dao.MigratorStatus) (map[string]int, error) {
	out := map[string]int{
		"Emails": 0,
	}
	var queueFrom, queueTo Queue
	/*
		// TODO  HERE
			ctx := context.Background()
			if qf, e := NewQueueDAO(ctx, from); e == nil {
			queueFrom = qf.(Queue)
		} else {
			return nil, e
		}
		if qt, e := NewQueueDAO(ctx, to); e == nil {
			queueTo = qt.(Queue)
		} else {
			return nil, e
		}*/
	er := queueFrom.Consume(func(email *mailer.Mail) error {
		out["Emails"]++
		if dryRun {
			return nil
		}
		return queueTo.Push(email)
	})
	return out, er
}
