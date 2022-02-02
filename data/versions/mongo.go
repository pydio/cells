/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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

package versions

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v4/common/dao/mongodb"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const (
	collVersions = "versions"
)

var (
	model = mongodb.Model{Collections: []mongodb.Collection{
		{
			Name: collVersions,
			Indexes: []map[string]int{
				{"node_uuid": 1},
				{"node_uuid": 1, "version_id": 1},
				{"ts": -1},
			},
		},
	}}
)

type mVersion struct {
	NodeUuid  string `bson:"node_uuid"`
	VersionId string `bson:"version_id"`
	Timestamp int64  `bson:"ts"`
	*tree.ChangeLog
}

type mongoStore struct {
	mongodb.DAO
}

func (m *mongoStore) Init(values configx.Values) error {
	if er := model.Init(context.Background(), m.DB()); er != nil {
		return er
	}
	return m.DAO.Init(values)
}

func (m *mongoStore) GetLastVersion(nodeUuid string) (*tree.ChangeLog, error) {
	c := context.Background()
	res := m.DB().Collection(collVersions).FindOne(c, bson.D{{"node_uuid", nodeUuid}}, &options.FindOneOptions{
		Sort: bson.M{"ts": -1},
	})
	if res.Err() != nil {
		if strings.Contains(res.Err().Error(), "no documents in result") {
			return nil, nil
		}
		return nil, res.Err()
	}
	mv := &mVersion{}
	if e := res.Decode(mv); e != nil {
		return nil, e
	} else {
		return mv.ChangeLog, nil
	}
}

func (m *mongoStore) GetVersions(nodeUuid string) (chan *tree.ChangeLog, chan bool) {
	logs := make(chan *tree.ChangeLog)
	done := make(chan bool, 1)
	go func() {
		defer close(done)
		c := context.Background()
		cursor, er := m.DB().Collection(collVersions).Find(c, bson.D{{"node_uuid", nodeUuid}}, &options.FindOptions{
			Sort: bson.M{"ts": -1},
		})
		if er != nil {
			return
		}
		for cursor.Next(c) {
			mv := &mVersion{}
			if e := cursor.Decode(mv); e != nil {
				continue
			}
			logs <- mv.ChangeLog
		}
	}()
	return logs, done
}

func (m *mongoStore) GetVersion(nodeUuid string, versionId string) (*tree.ChangeLog, error) {
	c := context.Background()
	res := m.DB().Collection(collVersions).FindOne(c, bson.D{{"node_uuid", nodeUuid}, {"version_id", versionId}})
	if res.Err() != nil {
		if strings.Contains(res.Err().Error(), "no documents in result") {
			return &tree.ChangeLog{}, nil
		}
		return nil, res.Err()
	}
	mv := &mVersion{}
	if e := res.Decode(mv); e != nil {
		return nil, e
	} else {
		return mv.ChangeLog, nil
	}
}

func (m *mongoStore) StoreVersion(nodeUuid string, log *tree.ChangeLog) error {
	mv := &mVersion{
		NodeUuid:  nodeUuid,
		VersionId: log.Uuid,
		Timestamp: time.Now().UnixNano(),
		ChangeLog: log,
	}
	c := context.Background()
	_, e := m.DB().Collection(collVersions).InsertOne(c, mv)
	return e
}

func (m *mongoStore) DeleteVersionsForNode(nodeUuid string, versions ...*tree.ChangeLog) error {
	c := context.Background()
	filter := bson.D{
		{"node_uuid", nodeUuid},
	}
	if len(versions) > 0 {
		var versionsIds []string
		for _, v := range versions {
			versionsIds = append(versionsIds, v.Uuid)
		}
		filter = append(filter, bson.E{Key: "version_id", Value: bson.M{"$in": versionsIds}})
	}
	res, e := m.DB().Collection(collVersions).DeleteMany(c, filter)
	if e != nil {
		return e
	}
	fmt.Println("Deleted", res.DeletedCount, "versions for node", nodeUuid)
	return nil

}

func (m *mongoStore) DeleteVersionsForNodes(nodeUuid []string) error {
	c := context.Background()
	res, e := m.DB().Collection(collVersions).DeleteMany(c, bson.D{{"node_uuid", bson.M{"$in": nodeUuid}}})
	if e != nil {
		return e
	}
	fmt.Println("Deleted", res.DeletedCount, "for node", nodeUuid)
	return nil
}

func (m *mongoStore) ListAllVersionedNodesUuids() (chan string, chan bool, chan error) {
	c := context.Background()
	logs := make(chan string)
	done := make(chan bool, 1)
	errs := make(chan error)
	go func() {
		defer close(done)
		ii, er := m.DB().Collection(collVersions).Distinct(c, "node_uuid", bson.D{})
		if er != nil {
			errs <- er
			return
		}
		for _, i := range ii {
			logs <- i.(string)
		}
	}()
	return logs, done, errs
}
