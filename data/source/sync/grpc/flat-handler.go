package grpc

import (
	"context"
	"fmt"

	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/index"
	"github.com/pydio/cells/common/sync/model"
	"github.com/pydio/cells/common/sync/task"
)

// FlatScanEmpty uses s3 client to feed index from bucket (basic mono-directional sync)
func (s *Handler) FlatScanEmpty(ctx context.Context, syncStatus chan model.Status, syncDone chan interface{}) (model.Stater, error) {
	// No snapshot passed, read the bucket content and index each node with its path Uuid
	stats := &flatSyncStater{source: "storage", target: "index"}
	source, ok := s.s3client.(model.PathSyncSource)
	if !ok {
		return nil, fmt.Errorf("cannot convert client to PathSyncSource")
	}
	session := &tree.IndexationSession{Uuid: uuid.New()}
	s.indexClientSession.OpenSession(ctx, &tree.OpenSessionRequest{Session: session})
	defer s.indexClientSession.CloseSession(ctx, &tree.CloseSessionRequest{Session: session})
	var nodesCreated int
	e := source.Walk(func(path string, node *tree.Node, err error) {
		// If set, Node.Uuid is read from s3 metadata. Set the Path as Uuid instead.
		clone := node.Clone()
		clone.Uuid = node.GetPath()
		_, e := s.indexClientWrite.CreateNode(ctx, &tree.CreateNodeRequest{
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
	}, "", true)
	if syncDone != nil {
		syncDone <- true
	}
	return stats.withData("nodesCreated", nodesCreated), e
}

// FlatSyncSnapshot can read or write a snapshot of the index inside the storage
func (s *Handler) FlatSyncSnapshot(ctx context.Context, mode string, snapName string, syncStatus chan model.Status, syncDone chan interface{}) (model.Stater, error) {

	if mode != "read" && mode != "write" && mode != "delete" {
		return nil, fmt.Errorf("please use one of read, write or delete for snapshoting mode")
	}
	if snapName == "" {
		return nil, fmt.Errorf("please provide the snapshot name to use")
	}

	if mode == "delete" {
		e := deleteSnapshot(s.s3client, snapName)
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
		return &flatSyncStater{source: s.dsName, target: "snapshot:delete"}, e
	}

	indexClient := index.NewClient(s.dsName, s.indexClientRead, s.indexClientWrite, s.indexClientSession)
	snapshotClient, e := newFlatSnapshot(ctx, s.s3client, common.ServiceGrpcNamespace_+common.ServiceDataSync_+s.dsName, snapName, mode)
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
		return &flatSyncStater{source: s.dsName, target: "snapshot:write"}, e
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
