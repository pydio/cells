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

	"github.com/pydio/cells/v4/common/proto/tree"
	cindex "github.com/pydio/cells/v4/common/sql/indexgorm"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/mtree"
	"github.com/pydio/cells/v4/data/source/index"
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

func (s *sqlimpl) LostAndFounds(ctx context.Context) ([]cindex.LostAndFound, error) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) FixLostAndFound(ctx context.Context, lost cindex.LostAndFound) error {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) FixRandHash2(ctx context.Context, excludes ...cindex.LostAndFound) (int64, error) {
	//TODO implement me
	panic("implement me")
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	log.Logger(context.Background()).Debug("Finished IndexSQL Init")

	// Preparing the db statements
	//if options.Val("prepare").Default(true).Bool() {
	//	for key, query := range queries {
	//		if err := s.Prepare(key, query); err != nil {
	//			return err
	//		}
	//	}
	//}

	log.Logger(context.Background()).Debug("Local sql Prepares")

	if _, err := s.GetNode(ctx, mtree.NewMPath(1)); err != nil {
		log.Logger(context.Background()).Info("Creating root node in index ")
		treeNode := &tree.TreeNode{}
		treeNode.SetMPath(tree.NewMPath(1))
		treeNode.SetNode(&tree.Node{
			Type:  tree.NodeType_COLLECTION,
			Uuid:  "ROOT",
			MTime: time.Now().Unix(),
		})
		s.AddNode(ctx, treeNode)
	}

	return nil
}
