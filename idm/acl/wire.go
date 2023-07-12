//go:build wireinject
// +build wireinject

// The build tag makes sure the stub is not built in the final build.

package acl

import (
	"context"
	"github.com/google/wire"
	commonsql "github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type MyDAO struct {
	DAO
}

func NewMyDAO(dao DAO) MyDAO {
	return MyDAO{
		DAO: dao,
	}
}

func InitializeDAO() MyDAO {
	wire.Build(NewMyDAO,
		wire.Bind(new(DAO), new(*sqlimpl)), newSQLImpl,
		newSQLDAO,
		newConfigStore,
		newContext,
	)
	return MyDAO{}
}

func newSQLImpl(dao commonsql.DAO) *sqlimpl {
	return &sqlimpl{dao}
}

func newSQLDAO(ctx context.Context, store configx.Values) commonsql.DAO {
	dao, _ := commonsql.NewDAO(ctx, store.Val("driver").String(), store.Val("dsn").String(), store.Val("prefix").String())
	return dao.(commonsql.DAO)
}

func newConfigStore() configx.Values {
	c := configx.New()
	c.Val("driver").Set("mysql")
	c.Val("dsn").Set("root:P@ssw0rd@tcp(localhost:3306)/cells?parseTime=true")
	c.Val("prefix").Set("idm_acl_")

	return c
}

func newContext() context.Context {
	return context.TODO()
}
