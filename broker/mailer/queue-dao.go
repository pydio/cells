package mailer

import (
	"context"

	bolt "go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/proto/mailer"
	"github.com/pydio/cells/v4/common/runtime/manager"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/storage/mongodb"
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

func NewMongoDAO(db *mongodb.Database) Queue {
	return &mongoQueue{db: db}
}

// MigrateQueue is a MigratorFunc to move queued emails from one Queue to another.
func MigrateQueue(mainCtx, fromCtx, toCtx context.Context, dryRun bool, status chan service.MigratorStatus) (map[string]int, error) {
	out := map[string]int{
		"Emails": 0,
	}

	queueFrom, er := manager.Resolve[Queue](fromCtx)
	if er != nil {
		return nil, er
	}
	queueTo, er := manager.Resolve[Queue](toCtx)
	if er != nil {
		return nil, er
	}

	er = queueFrom.Consume(mainCtx, func(email *mailer.Mail) error {
		out["Emails"]++
		if dryRun {
			return nil
		}
		return queueTo.Push(nil, email)
	})
	return out, er
}
