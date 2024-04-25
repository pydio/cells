package mailer

import (
	"context"

	bolt "go.etcd.io/bbolt"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/proto/mailer"
)

type Queue interface {
	Push(ctx context.Context, email *mailer.Mail) error
	Consume(context.Context, func(email *mailer.Mail) error) error
	Close(ctx context.Context) error
}

func NewBoltDAO(db *bolt.DB) Queue {
	bq := &BoltQueue{db: db}
	_ = bq.Init(nil)
	return bq
}

func NewMongoDAO(db *mongo.Database) Queue {
	return &mongoQueue{db: db}
}

// MigrateQueue is a MigratorFunc to move queued emails from one Queue to another.
func MigrateQueue(from any, to any, dryRun bool, status chan dao.MigratorStatus) (map[string]int, error) {
	out := map[string]int{
		"Emails": 0,
	}
	bg := context.Background()
	var queueFrom, queueTo Queue
	queueFrom = from.(Queue)
	queueTo = to.(Queue)
	er := queueFrom.Consume(bg, func(email *mailer.Mail) error {
		out["Emails"]++
		if dryRun {
			return nil
		}
		return queueTo.Push(nil, email)
	})
	return out, er
}
