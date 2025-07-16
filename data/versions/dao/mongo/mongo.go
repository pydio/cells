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
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common/errors"
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
				{"draft": 1},
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

type mRevision struct {
	NodeUuid  string `bson:"node_uuid"`
	VersionId string `bson:"version_id"`
	Draft     bool   `bson:"draft"`
	OwnerUuid string `bson:"owner_uuid"`
	Timestamp int64  `bson:"ts"`
	*tree.ContentRevision
}

type Decoder interface {
	Decode(v interface{}) error
}

func NewMongoDAO(db *mongodb.Indexer) versions.DAO {
	return &MongoStore{Database: db.Database}
}

type MongoStore struct {
	*mongodb.Database
}

func (m *MongoStore) GetLastVersion(ctx context.Context, nodeUuid string) (*tree.ContentRevision, error) {
	res := m.Collection(collVersions).FindOne(ctx, bson.D{{"node_uuid", nodeUuid}}, &options.FindOneOptions{
		Sort: bson.M{"ts": -1},
	})
	if res.Err() != nil {
		if strings.Contains(res.Err().Error(), "no documents in result") {
			return nil, nil
		}
		return nil, res.Err()
	}
	return m.decodeRevision(res)
}

func (m *MongoStore) GetVersions(ctx context.Context, nodeUuid string, offset int64, limit int64, sortField string, sortDesc bool, filters map[string]any) (chan *tree.ContentRevision, error) {
	logs := make(chan *tree.ContentRevision)

	go func() {
		defer close(logs)
		search := bson.D{{"node_uuid", nodeUuid}}
		for k, v := range filters {
			switch k {
			case "draftStatus":
				filterByType := v.(string)
				if filterByType == "draft" {
					search = append(search, bson.E{"draft", true})
				} else if filterByType == "published" {
					search = append(search, bson.E{"draft", false})
				}
			case "ownerUuid":
				search = append(search, bson.E{"owner_uuid", v.(string)})
			}
		}
		cursor, er := m.Collection(collVersions).Find(ctx, search, &options.FindOptions{
			Sort: bson.M{"ts": -1},
		})
		if er != nil {
			return
		}
		for cursor.Next(ctx) {
			if cr, err := m.decodeRevision(cursor); err == nil {
				logs <- cr
			} else {
				log.Logger(ctx).Warn("Could not decode content revision", zap.Error(err))
			}
		}
	}()
	return logs, nil
}

func (m *MongoStore) GetVersion(ctx context.Context, nodeUuid string, versionId string) (*tree.ContentRevision, error) {
	res := m.Collection(collVersions).FindOne(ctx, bson.D{{"node_uuid", nodeUuid}, {"version_id", versionId}})
	if res.Err() != nil {
		if strings.Contains(res.Err().Error(), "no documents in result") {
			return nil, errors.WithStack(errors.VersionNotFound)
		}
		return nil, res.Err()
	}
	return m.decodeRevision(res)
}

func (m *MongoStore) StoreVersion(ctx context.Context, nodeUuid string, revision *tree.ContentRevision) error {
	mv := &mRevision{
		NodeUuid:        nodeUuid,
		VersionId:       revision.VersionId,
		Timestamp:       time.Now().UnixNano(),
		Draft:           revision.Draft,
		OwnerUuid:       revision.OwnerUuid,
		ContentRevision: revision,
	}
	_, e := m.Collection(collVersions).InsertOne(ctx, mv)
	return e
}

func (m *MongoStore) DeleteVersionsForNode(ctx context.Context, nodeUuid string, versions ...string) error {
	filter := bson.D{
		{"node_uuid", nodeUuid},
	}
	if len(versions) > 0 {
		filter = append(filter, bson.E{Key: "version_id", Value: bson.M{"$in": versions}})
	}
	res, e := m.Collection(collVersions).DeleteMany(ctx, filter)
	if e != nil {
		return e
	}
	log.Logger(ctx).Info(fmt.Sprintf("Deleted %d versions for node %s", res.DeletedCount, nodeUuid))
	return nil

}

func (m *MongoStore) DeleteVersionsForNodes(ctx context.Context, nodeUuid []string) error {
	res, e := m.Collection(collVersions).DeleteMany(ctx, bson.D{{"node_uuid", bson.M{"$in": nodeUuid}}})
	if e != nil {
		return e
	}
	log.Logger(ctx).Info(fmt.Sprintf("Deleted %d versions for %d nodes", res.DeletedCount, len(nodeUuid)))
	return nil
}

func (m *MongoStore) ListAllVersionedNodesUuids(ctx context.Context) (chan string, chan bool, chan error) {
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

func (m *MongoStore) decodeRevision(d Decoder) (*tree.ContentRevision, error) {
	mrv := &mRevision{}
	if err := d.Decode(mrv); err == nil && mrv.ContentRevision != nil {
		return mrv.ContentRevision, nil
	}
	cv := &mVersion{}
	if err := d.Decode(cv); err == nil {
		cLog := cv.ChangeLog
		return &tree.ContentRevision{
			VersionId:   cLog.Uuid,
			Description: cLog.Description,
			MTime:       cLog.MTime,
			Size:        cLog.Size,
			ETag:        string(cLog.Data),
			OwnerName:   cLog.OwnerUuid, // This is normal
			Event:       cLog.Event,
			Location:    cLog.Location,
		}, nil
	}
	return nil, errors.New("invalid format (tree.ContentRevision or tree.ChangeLog expected)")
}
