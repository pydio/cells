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

// Package versions provides a versioning mechanism for files modifications
package versions

import (
	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/dao/boltdb"
	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/tree"
)

type DAO interface {
	dao.DAO
	GetLastVersion(nodeUuid string) (*tree.ChangeLog, error)
	GetVersions(nodeUuid string) (chan *tree.ChangeLog, chan bool)
	GetVersion(nodeUuid string, versionId string) (*tree.ChangeLog, error)
	StoreVersion(nodeUuid string, log *tree.ChangeLog) error
	DeleteVersionsForNode(nodeUuid string, versions ...*tree.ChangeLog) error
	DeleteVersionsForNodes(nodeUuid []string) error
	ListAllVersionedNodesUuids() (chan string, chan bool, chan error)
}

func NewDAO(dao dao.DAO) dao.DAO {
	switch v := dao.(type) {
	case boltdb.DAO:
		bStore, _ := NewBoltStore(v, v.DB().Path(), false)
		return bStore
	case mongodb.DAO:
		mStore := &mongoStore{DAO: v}
		return mStore
	}
	return nil
}
