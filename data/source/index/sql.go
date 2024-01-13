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

package index

import (
	"context"
	"gorm.io/gorm"
	"time"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/sql"
	cindex "github.com/pydio/cells/v4/common/sql/indexgorm"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/mtree"
)

var (
	queries     = map[string]interface{}{}
	_       DAO = (*sqlimpl)(nil)
)

type IndexSQL cindex.DAO

type sqlimpl struct {
	db *gorm.DB

	IndexSQL
}

func (s *sqlimpl) GetSQLDAO() sql.DAO {
	//TODO implement me
	panic("implement me")
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

func (s *sqlimpl) Name() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) ID() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Metadata() map[string]string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) As(i interface{}) bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Driver() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Dsn() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) GetConn(ctx context.Context) (dao.Conn, error) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) SetConn(ctx context.Context, conn dao.Conn) {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) CloseConn(ctx context.Context) error {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Prefix() string {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) LocalAccess() bool {
	//TODO implement me
	panic("implement me")
}

func (s *sqlimpl) Stats() map[string]interface{} {
	//TODO implement me
	panic("implement me")
}

// Init handler for the SQL DAO
func (s *sqlimpl) Init(ctx context.Context, options configx.Values) error {

	// super
	// s.DAO.Init(ctx, options)

	// Preparing the index
	if err := s.IndexSQL.Init(ctx, options); err != nil {
		return err
	}

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
