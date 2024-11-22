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

package sql

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/proto/tree"
	cindex "github.com/pydio/cells/v5/common/storage/sql/index"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/data/source/index"
)

var (
	_ index.DAO = (*sqlimpl)(nil)
)

func init() {
	index.Drivers.Register(NewDAO)
}

// NewDAO for the common sql index
func NewDAO(db *gorm.DB) index.DAO {

	indexDAO := cindex.NewDAO[*tree.TreeNode](db)

	return &sqlimpl{db: db, IndexSQL: indexDAO.(IndexSQL)}
}

type IndexSQL cindex.DAO

type sqlimpl struct {
	db *gorm.DB

	IndexSQL
}

func (s *sqlimpl) Migrate(ctx context.Context) error {
	if er := s.IndexSQL.Migrate(ctx); er != nil {
		return er
	}
	treeNode := &tree.Node{
		Uuid:  "ROOT",
		Path:  "/",
		Type:  tree.NodeType_COLLECTION,
		MTime: time.Now().Unix(),
	}
	if _, created, err := s.IndexSQL.GetOrCreateNodeByPath(ctx, "/", treeNode); err != nil {
		log.Logger(ctx).Error("Error checking root node in index: " + err.Error())
		return err
	} else if len(created) > 0 {
		log.Logger(ctx).Info("Created root node in index")
	}
	return nil
}
