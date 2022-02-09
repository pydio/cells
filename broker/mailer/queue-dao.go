package mailer

import (
	"context"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"path/filepath"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/mailer"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type Queue interface {
	Push(email *mailer.Mail) error
	Consume(func(email *mailer.Mail) error) error
	Close() error
}

func GetQueue(ctx context.Context, t string, conf configx.Values) Queue {
	switch t {
	case "memory":
		return newInMemoryQueue()
	case "boltdb":
		dataDir, _ := config.ServiceDataDir(servicecontext.GetServiceName(ctx))
		queue, e := NewBoltQueue(filepath.Join(dataDir, "queue.db"), false)
		if e != nil {
			return nil
		} else {
			return queue
		}
	case "mongo":
		// Todo v4 WithStorage()
		coreDao, _ := mongodb.NewDAO("mongodb", "mongodb://localhost:8282/?maxPoolSize=20&w=majority", "mailer-queue")
		q, e := NewMongoQueue(coreDao, conf)
		if e != nil {
			return nil
		} else {
			return q
		}
	}
	return nil
}
