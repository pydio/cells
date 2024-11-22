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

package mongo

import (
	"context"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/storage/mongodb"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/data/versions"
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

func init() {
	versions.Drivers.Register(NewMongoDAO)
}

type mVersion struct {
	NodeUuid  string `bson:"node_uuid"`
	VersionId string `bson:"version_id"`
	Timestamp int64  `bson:"ts"`
	*tree.ChangeLog
}

func NewMongoDAO(db *mongodb.Indexer) versions.DAO {
	return &mongoStore{Database: db.Database}
}

type mongoStore struct {
	*mongodb.Database
}

//func (m *mongoStore) Init(ctx context.Context, values configx.Values) error {
//	if er := model.Init(context.Background(), m.DAO); er != nil {
//		return er
//	}
//	return m.DAO.Init(ctx, values)
//}

func (m *mongoStore) GetLastVersion(ctx context.Context, nodeUuid string) (*tree.ChangeLog, error) {
	res := m.Collection(collVersions).FindOne(ctx, bson.D{{"node_uuid", nodeUuid}}, &options.FindOneOptions{
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

func (m *mongoStore) GetVersions(ctx context.Context, nodeUuid string) (chan *tree.ChangeLog, error) {
	logs := make(chan *tree.ChangeLog)
	go func() {
		defer close(logs)
		cursor, er := m.Collection(collVersions).Find(ctx, bson.D{{"node_uuid", nodeUuid}}, &options.FindOptions{
			Sort: bson.M{"ts": -1},
		})
		if er != nil {
			return
		}
		for cursor.Next(ctx) {
			mv := &mVersion{}
			if e := cursor.Decode(mv); e != nil {
				continue
			}
			logs <- mv.ChangeLog
		}
	}()
	return logs, nil
}

func (m *mongoStore) GetVersion(ctx context.Context, nodeUuid string, versionId string) (*tree.ChangeLog, error) {
	res := m.Collection(collVersions).FindOne(ctx, bson.D{{"node_uuid", nodeUuid}, {"version_id", versionId}})
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

func (m *mongoStore) StoreVersion(ctx context.Context, nodeUuid string, log *tree.ChangeLog) error {
	mv := &mVersion{
		NodeUuid:  nodeUuid,
		VersionId: log.Uuid,
		Timestamp: time.Now().UnixNano(),
		ChangeLog: log,
	}
	_, e := m.Collection(collVersions).InsertOne(ctx, mv)
	return e
}

func (m *mongoStore) DeleteVersionsForNode(ctx context.Context, nodeUuid string, versions ...*tree.ChangeLog) error {
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
	res, e := m.Collection(collVersions).DeleteMany(ctx, filter)
	if e != nil {
		return e
	}
	log.Logger(ctx).Info(fmt.Sprintf("Deleted %d versions for node %s", res.DeletedCount, nodeUuid))
	return nil

}

func (m *mongoStore) DeleteVersionsForNodes(ctx context.Context, nodeUuid []string) error {
	res, e := m.Collection(collVersions).DeleteMany(ctx, bson.D{{"node_uuid", bson.M{"$in": nodeUuid}}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Info(fmt.Sprintf("Deleted %d versions for %d nodes", res.DeletedCount, len(nodeUuid)))
	return nil
}

func (m *mongoStore) ListAllVersionedNodesUuids(ctx context.Context) (chan string, chan bool, chan error) {
	logs := make(chan string)
	done := make(chan bool, 1)
	errs := make(chan error)
	go func() {
		defer close(done)
		pipeline := bson.A{}
		pipeline = append(pipeline, bson.M{"$group": bson.M{"_id": "$node_uuid"}})
		allowDiskUse := true
		cursor, e := m.Collection(collVersions).Aggregate(ctx, pipeline, &options.AggregateOptions{AllowDiskUse: &allowDiskUse})
		if e != nil {
			errs <- e
			return
		}
		for cursor.Next(ctx) {
			doc := make(map[string]interface{})
			if er := cursor.Decode(&doc); er != nil {
				continue
			}
			if id, ok := doc["_id"]; ok {
				logs <- id.(string)
			}
		}
	}()
	return logs, done, errs
}
