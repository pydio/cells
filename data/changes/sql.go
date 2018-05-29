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
	"sync/atomic"

	"github.com/gobuffalo/packr"
	migrate "github.com/rubenv/sql-migrate"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sql"
)

var (
	tableName = "data_changes"
	queries   = map[string]string{
		"insert": `INSERT INTO data_changes (node_id, type, source, target) values (?, ?, ?, ?)`,
		//"select": `SELECT seq, node_id, type, source, target FROM data_changes WHERE seq >= ? and (source LIKE ? or target LIKE ?)`,
		// TO VERIFY: shall we order by (node_id,seq) so that events are grouped by node id ?
		"select":   `SELECT seq, node_id, type, source, target FROM data_changes WHERE seq > ? and (source LIKE ? or target LIKE ?) ORDER BY node_id,seq`,
		"lastSeq":  `SELECT MAX(seq) FROM data_changes`,
		"nodeById": `SELECT node_id FROM data_changes WHERE node_id = ? LIMIT 0,1`,
	}
	mu atomic.Value
)

// sqlimpl for the sql implementation
type sqlimpl struct {
	sql.DAO
}

// Add to the mysql DB
func (s *sqlimpl) Init(options config.Map) error {

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
func (h *sqlimpl) Put(c *tree.SyncChange) error {
	_, err := h.GetStmt("insert").Exec(
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

func (h *sqlimpl) HasNodeById(id string) (bool, error) {

	row := h.GetStmt("nodeById").QueryRow(id)
	var nodeID string
	if err := row.Scan(&nodeID); err != nil {
		return false, err
	}
	return nodeID != "", nil
}

// Get the list of SyncChange
func (h *sqlimpl) Get(seq uint64, prefix string) (chan *tree.SyncChange, error) {
	res := make(chan *tree.SyncChange)

	go func() {
		defer close(res)

		p := fmt.Sprintf("%s%%", prefix)
		r, err := h.GetStmt("select").Query(seq, p, p)
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

func (h *sqlimpl) LastSeq() (uint64, error) {
	var last uint64
	row := h.GetStmt("lastSeq").QueryRow()
	err := row.Scan(&last)
	return last, err
}
