package grpc

import (
	"context"
	"fmt"

	"github.com/pborman/uuid"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
	json "github.com/pydio/cells/x/jsonx"
)

// FlatScanEmpty uses s3 client to feed index from bucket (basic mono-directional sync)
func (s *Handler) FlatScanEmpty(ctx context.Context) error {
	// No snapshot passed, read the bucket content and index each node with its path Uuid
	source, ok := s.s3client.(model.PathSyncSource)
	if !ok {
		return fmt.Errorf("cannot convert client to PathSyncSource")
	}
	session := &tree.IndexationSession{Uuid: uuid.New()}
	s.indexClientSession.OpenSession(ctx, &tree.OpenSessionRequest{Session: session})
	defer s.indexClientSession.CloseSession(ctx, &tree.CloseSessionRequest{Session: session})
	return source.Walk(func(path string, node *tree.Node, err error) {
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
			log.TasksLogger(ctx).Info(" - Indexing s3 object "+clone.GetPath(), clone.ZapPath(), clone.ZapUuid())
		}
	}, "", true)
}

// FlatLoadFromSnapshot reads a snapshot file to feed index from bucket, checking if object actually exists
// TODO
func (s *Handler) FlatLoadFromSnapshot(ctx context.Context, snapshotPath string) error {
	dataSyncSource, ok := s.s3client.(model.DataSyncSource)
	if !ok {
		return fmt.Errorf("cannot convert client to DataSyncSource")
	}
	reader, er := dataSyncSource.GetReaderOn(snapshotPath)
	if er != nil {
		return er
	}
	defer reader.Close()
	var data []*tree.Node
	decoder := json.NewDecoder(reader)
	if e := decoder.Decode(data); e != nil {
		log.Logger(ctx).Error("Cannot decode snapshot file", zap.Error(e))
		return e
	}
	log.Logger(ctx).Info("Decoded Snapshot File", zap.Int("nodes", len(data)))
	return nil
}
