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

package grpc

import (
	"context"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/endpoints/index"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/sync/task"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

// FlatScanEmpty uses s3 client to feed index from bucket (basic mono-directional sync)
func (s *Syncer) FlatScanEmpty(ctx context.Context, syncStatus chan model.Status, syncDone chan interface{}) (model.Stater, error) {
	// No snapshot passed, read the bucket content and index each node with its path Uuid
	stats := &flatSyncStater{source: "storage", target: "index"}
	source, ok := s.S3client.(model.PathSyncSource)
	if !ok {
		return nil, errors.New("cannot convert client to PathSyncSource")
	}
	session := &tree.IndexationSession{Uuid: uuid.New()}
	s.IndexClientSession.OpenSession(ctx, &tree.OpenSessionRequest{Session: session})
	defer s.IndexClientSession.CloseSession(ctx, &tree.CloseSessionRequest{Session: session})
	var nodesCreated int
	e := source.Walk(ctx, func(path string, node tree.N, err error) error {
		// If set, N.Uuid is read from s3 metadata. Set the Path as Uuid instead.
		clone := node.AsProto().Clone()
		clone.Uuid = node.GetPath()
		_, e := s.IndexClientWrite.CreateNode(ctx, &tree.CreateNodeRequest{
			Node:              clone,
			UpdateIfExists:    true,
			IndexationSession: session.Uuid,
			Silent:            true,
		})
		if e != nil {
			log.Logger(ctx).Error("Could not index s3 object", clone.Zap(), zap.Error(e))
			log.TasksLogger(ctx).Error(" - Could not index s3 object " + clone.GetPath() + ": " + e.Error())
		} else {
			nodesCreated++
			log.TasksLogger(ctx).Info(" - Indexing s3 object "+clone.GetPath(), clone.ZapPath(), clone.ZapUuid())
		}
		return nil
	}, "", true)
	if syncDone != nil {
		syncDone <- true
	}
	return stats.withData("nodesCreated", nodesCreated), e
}

// FlatSyncSnapshot can read or write a snapshot of the index inside the storage
func (s *Syncer) FlatSyncSnapshot(ctx context.Context, dsObject *object.DataSource, mode string, snapName string, syncStatus chan model.Status, syncDone chan interface{}) (model.Stater, error) {

	if mode != "read" && mode != "write" && mode != "delete" {
		return nil, errors.New("please use one of read, write or delete for snapshoting mode")
	}
	if snapName == "" {
		return nil, errors.New("please provide the snapshot name to use")
	}

	if mode == "delete" {
		e := deleteSnapshot(s.S3client, snapName)
		if syncStatus != nil {
			var status *model.ProcessingStatus
			if e != nil {
				status = model.NewProcessingStatus("Could not delete snapshot " + snapName)
				status.SetError(e)
			} else {
				status = model.NewProcessingStatus("Removed snapshot " + snapName + " from DB")
			}
			syncStatus <- status
		}
		if syncDone != nil {
			syncDone <- true
		}
		return &flatSyncStater{source: s.DsName, target: "snapshot:delete"}, e
	}

	indexClient := index.NewClient(s.DsName, s.IndexClientRead, s.IndexClientWrite, s.IndexClientSession)
	snapshotClient, e := newFlatSnapshot(ctx, dsObject, s.S3client, common.ServiceGrpcNamespace_+common.ServiceDataSync_+s.DsName, snapName, mode)
	if e != nil {
		return nil, e
	}
	defer func() {
		if e := snapshotClient.Close(true); e != nil {
			log.Logger(ctx).Error("Error while closing snapshot", zap.Error(e))
		} else {
			log.Logger(ctx).Info("Successfully closed " + snapName)
		}
	}()
	if mode == "write" {
		log.Logger(ctx).Info("Loading capture from index to boltdb (" + snapName + ")")
		e := snapshotClient.Capture(ctx, indexClient)
		if syncStatus != nil {
			status := model.NewProcessingStatus("Captured index into BoltDB " + snapName)
			if e != nil {
				status.SetError(e)
			}
			syncStatus <- status
		}
		if syncDone != nil {
			syncDone <- true
		}
		return &flatSyncStater{source: s.DsName, target: "snapshot:write"}, e
	} else {
		syncTask := task.NewSync(snapshotClient, indexClient, model.DirectionRight)
		syncTask.SkipTargetChecks = true
		syncTask.FailsafeDeletes = false
		syncTask.SetupEventsChan(syncStatus, syncDone, nil)

		syncTask.Start(ctx, false)
		return syncTask.Run(ctx, false, true)
	}

}

type flatSyncStater struct {
	source string
	target string
	other  map[string]interface{}
}

func (f *flatSyncStater) withData(key string, value interface{}) *flatSyncStater {
	if f.other == nil {
		f.other = make(map[string]interface{})
	}
	f.other[key] = value
	return f
}

func (f *flatSyncStater) String() string {
	return f.source + "=>" + f.target
}

func (f *flatSyncStater) Stats() (data map[string]interface{}) {
	if f.other != nil {
		data = f.other
	} else {
		data = make(map[string]interface{}, 2)
	}
	data["source"] = f.source
	data["target"] = f.target
	return
}
