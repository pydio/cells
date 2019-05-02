/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package changes

import (
	"context"
	"fmt"

	"github.com/gobuffalo/packr"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
)

var (
	queries = map[string]interface{}{
		"insert": `INSERT INTO data_changes (node_id, type, source, target) values (?, ?, ?, ?)`,
		"bulkInsert": func(args ...interface{}) string {
			var num int
			if len(args) == 1 {
				num = args[0].(int)
			}

			str := `INSERT INTO data_changes (node_id, type, source, target) values `
			str = str + `(?, ?, ?, ?)`
			for i := 1; i < num; i++ {
				str = str + `, (?, ?, ?, ?)`
			}
			return str
		},
		// Order by (node_id,seq) so that events are grouped by node id
		"select":            `SELECT seq, node_id, type, source, target FROM data_changes WHERE seq > ? and (source LIKE ? or target LIKE ?) ORDER BY node_id,seq`,
		"selectFromArchive": `SELECT seq, node_id, type, source, target FROM data_changes_archive WHERE seq > ? and (source LIKE ? or target LIKE ?) ORDER BY node_id,seq`,
		"countChanges":      `SELECT COUNT(*) FROM data_changes`,
		"firstSeq":          `SELECT MIN(seq) FROM data_changes`,
		"lastSeq":           `SELECT MAX(seq) FROM data_changes`,
		"nodeById":          `SELECT node_id FROM data_changes WHERE node_id = ? LIMIT 0,1`,
		"delete":            `DELETE FROM data_changes where seq <= ?`,
		"archive":           `INSERT INTO data_changes_archive (seq, node_id, type, source, target) SELECT seq, node_id, type, source, target from data_changes where seq <= ?`,
	}
)

// sqlimpl for the SQL implementation.
type sqlimpl struct {
	sql.DAO
}

// Init also performs migrations when necessary.
func (s *sqlimpl) Init(options common.ConfigValues) error {

	// super
	s.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../data/changes/migrations"),
		Dir:         s.Driver(),
		TablePrefix: s.Prefix(),
	}

	_, err := sql.ExecMigration(s.DB(), s.Driver(), migrations, migrate.Up, "data_changes_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Bool("prepare", true) {
		for key, query := range queries {
			if err := s.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// Put SyncChange in database
func (s *sqlimpl) Put(c *tree.SyncChange) error {
	stmt := s.GetStmt("insert")
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	_, err := stmt.Exec(
		c.NodeId,
		c.Type.String(),
		c.Source,
		c.Target,
	)

	if err != nil {
		return err
	}

	return nil
}

// Put a slice of changes at once
func (s *sqlimpl) BulkPut(changes []*tree.SyncChange) error {
	stmt := s.GetStmt("bulkInsert", len(changes))
	if stmt == nil {
		return fmt.Errorf("Unknown statement")
	}

	var values []interface{}
	for _, change := range changes {
		values = append(values, change.NodeId, change.Type.String(), change.Source, change.Target)
	}
	_, err := stmt.Exec(values...)
	return err
}

// HasNodeById checks wether a node with this ID exists.
func (s *sqlimpl) HasNodeById(id string) (bool, error) {

	stmt := s.GetStmt("nodeById")
	if stmt == nil {
		return false, fmt.Errorf("Unknown statement")
	}

	row := stmt.QueryRow(id)
	var nodeID string
	if err := row.Scan(&nodeID); err != nil {
		return false, err
	}
	return nodeID != "", nil
}

// Get the list of SyncChange
func (s *sqlimpl) Get(seq uint64, prefix string) (chan *tree.SyncChange, error) {
	res := make(chan *tree.SyncChange)

	go func() {
		defer close(res)

		p := fmt.Sprintf("%s%%", prefix)

		// Checking if we need to retrieve from archive
		if first, err := s.FirstSeq(); err != nil || first > seq {

			stmt := s.GetStmt("selectFromArchive")
			if stmt == nil {
				return
			}

			rarch, err := stmt.Query(seq, p, p)
			if err != nil {
				return
			}

			defer rarch.Close()
			for rarch.Next() {

				row := new(tree.SyncChange)
				var stringType string
				rarch.Scan(
					&row.Seq,
					&row.NodeId,
					&stringType,
					&row.Source,
					&row.Target,
				)

				if row.Source == "" {
					row.Source = "NULL"
				}
				if row.Target == "" {
					row.Target = "NULL"
				}
				row.Type = tree.SyncChange_Type(tree.SyncChange_Type_value[stringType])
				log.Logger(context.Background()).Debug("[Grpc Changes] Reading Row",
					zap.String("type", stringType),
					zap.Any("r", row),
					zap.Any("intType", tree.SyncChange_Type_value[stringType]))
				res <- row
			}
		}

		stmt := s.GetStmt("select")
		if stmt == nil {
			return
		}

		r, err := stmt.Query(seq, p, p)
		if err != nil {
			return
		}

		defer r.Close()
		for r.Next() {
			row := new(tree.SyncChange)
			var stringType string
			r.Scan(
				&row.Seq,
				&row.NodeId,
				&stringType,
				&row.Source,
				&row.Target,
			)

			if row.Source == "" {
				row.Source = "NULL"
			}
			if row.Target == "" {
				row.Target = "NULL"
			}
			row.Type = tree.SyncChange_Type(tree.SyncChange_Type_value[stringType])
			log.Logger(context.Background()).Debug("[Grpc Changes] Reading Row",
				zap.String("type", stringType),
				zap.Any("r", row),
				zap.Any("intType", tree.SyncChange_Type_value[stringType]))
			res <- row
		}
	}()

	return res, nil
}

// FirstSeq returns the first sequence id in the data changes table (without archive) or 0 if the table is empty.
func (s *sqlimpl) FirstSeq() (uint64, error) {

	var last uint64
	stmt := s.GetStmt("firstSeq")
	if stmt == nil {
		return 0, fmt.Errorf("Unknown statement")
	}

	row := stmt.QueryRow()
	err := row.Scan(&last)
	if err != nil {
		// address empty db corner case only on error
		// rather than checking if the table is empty at each iteration
		stmt := s.GetStmt("countChanges")
		if stmt == nil {
			return 0, fmt.Errorf("Unknown statement")
		}

		rowtmp := stmt.QueryRow()
		var count uint64
		err2 := rowtmp.Scan(&count)
		if err2 != nil {
			fmt.Println("Error: unable to count changes, " + err2.Error())
			return last, err // return root cause
		}
		if count == 0 {
			// empty db
			return 0, nil
		}
		fmt.Println("Error: unable to retrieve first sequence id. " + err.Error())
	}
	return last, err
}

// LastSeq returns the last sequence id in the data changes table or 0 if the table is empty.
func (s *sqlimpl) LastSeq() (uint64, error) {
	var last uint64
	stmt := s.GetStmt("lastSeq")
	if stmt == nil {
		return 0, fmt.Errorf("Unknown statement")
	}
	row := stmt.QueryRow()
	err := row.Scan(&last)
	if err != nil {
		stmt := s.GetStmt("countChanges")
		if stmt == nil {
			return 0, fmt.Errorf("Unknown statement")
		}
		rowtmp := stmt.QueryRow()
		var count uint64
		err2 := rowtmp.Scan(&count)
		if err2 != nil {
			fmt.Println("Error: unable to count changes, " + err2.Error())
			return last, err // return root cause
		}
		if count == 0 {
			// empty db
			return 0, nil
		}
		fmt.Println("Error: unable to retrieve last sequence id. " + err.Error())
	}

	return last, err
}

// Archive places all rows before the sequence id in an archive table and delete them from the main table
func (s *sqlimpl) Archive(seq uint64) error {

	db := s.DB()

	// Starting a transaction
	tx, err := db.BeginTx(context.Background(), nil)
	if err != nil {
		return err
	}

	// Checking transaction went fine
	defer func() {
		if err != nil {
			tx.Rollback()
		} else {
			tx.Commit()
		}
	}()

	archive := s.GetStmt("archive")
	if archive == nil {
		return fmt.Errorf("Unknown statement")
	}

	delete := s.GetStmt("delete")
	if delete == nil {
		return fmt.Errorf("Unknown statement")
	}

	if stmt := tx.Stmt(archive); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(seq); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	if stmt := tx.Stmt(delete); stmt != nil {
		defer stmt.Close()

		if _, err = stmt.Exec(seq); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("Empty statement")
	}

	return nil
}
