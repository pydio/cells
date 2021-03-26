package sql

import (
	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"
)

func NewDAO(o dao.DAO) dao.DAO {
	switch v := o.(type) {
	case sql.DAO:
		return &sqlimpl{DAO: v}
	}
	return nil
}

type DAO interface {
	dao.DAO

	Get() ([]byte, error)
	Set([]byte) error
}

var queries = map[string]interface{}{
	"get": "select data from %%PREFIX%%_config where id = 1",
	"set": "insert into %%PREFIX%%_config(id, data) values (1, ?) on duplicate key update data = ?",
}

type sqlimpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(options configx.Values) error {

	// super
	s.DAO.Init(options)

	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../../common/config/sql/migrations"),
		Dir:         "./" + s.DAO.Driver(),
		TablePrefix: s.DAO.Prefix(),
	}

	_, err := sql.ExecMigration(s.DAO.DB(), s.DAO.Driver(), migrations, migrate.Up, s.DAO.Prefix())
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *sqlimpl) Get() ([]byte, error) {
	stmt, err := s.DAO.GetStmt("get")
	if err != nil {
		return nil, err
	}

	var b []byte

	row := stmt.QueryRow()
	row.Scan(&b)

	return b, nil
}

func (s *sqlimpl) Set(data []byte) error {
	stmt, err := s.DAO.GetStmt("set")
	if err != nil {
		return err
	}

	if _, err := stmt.Exec(data, data); err != nil {
		return err
	}

	return nil

}
