package mailer

import (
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/mailer"
)

type Queue interface {
	dao.DAO
	Push(email *mailer.Mail) error
	Consume(func(email *mailer.Mail) error) error
	Close() error
}

func NewQueueDAO(dao dao.DAO) dao.DAO {
	switch v := dao.(type) {
	case boltdb.DAO:
		return &BoltQueue{DAO: v}
	case mongodb.DAO:
		return &mongoQueue{DAO: v}
	}
	return nil
}

// MigrateQueue is a MigratorFunc to move queued emails from one Queue to another.
func MigrateQueue(from dao.DAO, to dao.DAO, dryRun bool) (map[string]int, error) {
	out := map[string]int{
		"Emails": 0,
	}
	queueFrom := from.(Queue)
	queueTo := from.(Queue)
	er := queueFrom.Consume(func(email *mailer.Mail) error {
		out["Emails"]++
		if dryRun {
			return nil
		}
		return queueTo.Push(email)
	})
	return out, er
}
