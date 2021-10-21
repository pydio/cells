/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package meta

import (
	"time"

	"github.com/micro/go-micro/errors"
	"github.com/pydio/packr"
	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/common/sql"
	"github.com/pydio/cells/x/configx"
)

var (
	queries = map[string]string{
		"upsert":     `INSERT INTO data_meta (node_id,namespace,data,author,timestamp,format) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE data=?,author=?,timestamp=?,format=?`,
		"deleteNS":   `DELETE FROM data_meta WHERE namespace=?`,
		"deleteUuid": `DELETE FROM data_meta WHERE node_id=?`,
		"select":     `SELECT * FROM data_meta WHERE node_id=?`,
		"selectAll":  `SELECT * FROM data_meta LIMIT 0, 500`,
	}
)

// Impl of the SQL interface
type sqlImpl struct {
	sql.DAO
}

// Init handler for the SQL DAO
func (h *sqlImpl) Init(options configx.Values) error {

	// super
	h.DAO.Init(options)

	// Doing the database migrations
	migrations := &sql.PackrMigrationSource{
		Box:         packr.NewBox("../../data/meta/migrations"),
		Dir:         h.Driver(),
		TablePrefix: h.Prefix(),
	}

	_, err := sql.ExecMigration(h.DB(), h.Driver(), migrations, migrate.Up, "data_meta_")
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := h.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

// SetMetadata creates or updates metadata for a node
func (h *sqlImpl) SetMetadata(nodeId string, author string, metadata map[string]string) (err error) {

	if len(metadata) == 0 {
		// Delete all metadata for node
		stmt, er := h.GetStmt("deleteUuid")
		if er != nil {
			return er
		}

		stmt.Exec(
			nodeId,
		)
	} else {

		for namespace, data := range metadata {
			/*if strings.HasPrefix(namespace, "pydio:") {
				continue
			}*/
			json := data
			ns := namespace
			if data == "" {
				// Delete namespace
				stmt, er := h.GetStmt("deleteNS")
				if er != nil {
					return er
				}

				stmt.Exec(ns)
			} else {
				// Insert or update namespace
				tStamp := time.Now().Unix()

				stmt, er := h.GetStmt("upsert")
				if er != nil {
					return er
				}

				stmt.Exec(
					nodeId,
					ns,
					json,
					author,
					tStamp,
					"json",
					json,
					author,
					tStamp,
					"json",
				)
			}
		}
	}

	return nil
}

// GetMetadata loads metadata for a node
func (h *sqlImpl) GetMetadata(nodeId string) (metadata map[string]string, err error) {

	stmt, er := h.GetStmt("select")
	if er != nil {
		return nil, er
	}

	r, err := stmt.Query(nodeId)
	if err != nil {
		return nil, err
	}
	metadata = make(map[string]string)
	defer r.Close()
	for r.Next() {
		row := struct {
			id        string
			namespace string
			author    string
			timestamp int64
			data      string
			format    string
		}{}
		r.Scan(
			&row.id,
			&row.namespace,
			&row.author,
			&row.timestamp,
			&row.data,
			&row.format,
		)
		metadata[row.namespace] = row.data
	}
	if r.Err() != nil {
		return nil, r.Err()
	}
	if len(metadata) == 0 {
		err = errors.NotFound("metadata-not-found", "Cannot find metadata for node "+nodeId)
		return nil, err
	}
	return metadata, nil

}

// ListMetadata lists all metadata by query
func (h *sqlImpl) ListMetadata(query string) (metaByUuid map[string]map[string]string, err error) {

	stmt, er := h.GetStmt("selectAll")
	if er != nil {
		return nil, er
	}

	r, err := stmt.Query()
	if err != nil {
		return nil, err
	}
	metaByUuid = make(map[string]map[string]string)

	defer r.Close()
	for r.Next() {
		row := struct {
			id        string
			namespace string
			author    string
			timestamp int64
			data      string
			format    string
		}{}
		r.Scan(
			&row.id,
			&row.namespace,
			&row.author,
			&row.timestamp,
			&row.data,
			&row.format,
		)
		metadata, ok := metaByUuid[row.id]
		if !ok {
			metadata = make(map[string]string)
			metaByUuid[row.id] = metadata
		}
		metadata[row.namespace] = row.data
		metadata[row.namespace] = row.data
	}
	if r.Err() != nil {
		return nil, r.Err()
	}
	return metaByUuid, nil

}
