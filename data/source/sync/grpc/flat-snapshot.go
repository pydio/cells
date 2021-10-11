package grpc

import (
	"context"
	"fmt"
	"io"
	"os"
	"path"

	"github.com/pborman/uuid"

	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/common/sync/model"
)

// FlatSnapshot is a composed sync endpoint combining a BoltDB and S3 client.
type FlatSnapshot struct {
	*snapshot.BoltSnapshot
	client model.Endpoint

	globalCtx   context.Context
	mode        string
	serviceName string
	snapName    string
	boltFile    string
}

func newFlatSnapshot(ctx context.Context, client model.Endpoint, serviceName, snapName, mode string) (*FlatSnapshot, error) {
	boltPath, e := config.ServiceDataDir(serviceName)
	if e != nil {
		return nil, e
	}
	boltUuid := uuid.New() + ".db"
	boltName := "snapshot-" + boltUuid
	boltFile := path.Join(boltPath, boltName)
	if mode == "read" {
		if e := loadSnapshot(client, snapName, boltFile); e != nil {
			return nil, e
		}
	}
	// Internal will prepend snapshot- to boltUuid
	db, e := snapshot.NewBoltSnapshot(boltPath, boltUuid)
	if e != nil {
		return nil, e
	}
	return &FlatSnapshot{
		globalCtx:    ctx,
		BoltSnapshot: db,
		client:       client,

		boltFile:    boltFile,
		mode:        mode,
		serviceName: serviceName,
		snapName:    snapName,
	}, nil
}

func (f *FlatSnapshot) Close(delete ...bool) error {
	// Close session on bolt and move bolt inside storage
	f.BoltSnapshot.Close()
	if f.mode == "write" {
		if e := writeSnapshot(f.client, f.boltFile, f.snapName); e != nil {
			return e
		}
	}
	if len(delete) > 0 && delete[0] {
		return os.RemoveAll(f.boltFile)
	}
	return nil
}

func (f *FlatSnapshot) Walk(walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	// Wrap Walker to make sure s3 object does exists
	stater := f.client.(model.PathSyncSource)
	wrapper := func(path string, node *tree.Node, err error) {
		if !node.IsLeaf() {
			walknFc(path, node, err)
			return
		}
		if _, e := stater.LoadNode(f.globalCtx, node.GetUuid()); e == nil {
			walknFc(path, node, err)
		} else {
			log.Logger(f.globalCtx).Warn("Ignoring node " + path + " from snapshot as object " + node.GetUuid() + " is not present on storage")
		}
	}
	return f.BoltSnapshot.Walk(wrapper, root, recursive)
}

func (f *FlatSnapshot) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI: "flatsnap://" + f.serviceName,
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
	}

}

func loadSnapshot(client model.Endpoint, storageKey, fsPath string) error {
	reader, ok := client.(model.DataSyncSource)
	if !ok {
		return fmt.Errorf("client must implement DataSyncSource")
	}
	tgt, e := os.OpenFile(fsPath, os.O_CREATE|os.O_WRONLY, 0755)
	if e != nil {
		return e
	}
	defer tgt.Close()
	src, e := reader.GetReaderOn(storageKey)
	if e != nil {
		return e
	}
	defer src.Close()
	_, e = io.Copy(tgt, src)
	return e
}

func writeSnapshot(client model.Endpoint, fsPath, storageKey string) error {

	target, ok := client.(model.DataSyncTarget)
	if !ok {
		return fmt.Errorf("client must implement DataSyncTarget")
	}
	stat, e := os.Stat(fsPath)
	if e != nil {
		return e
	}
	src, e := os.OpenFile(fsPath, os.O_RDONLY, 0755)
	if e != nil {
		return e
	}
	defer src.Close()
	writer, writeDone, writeErr, e := target.GetWriterOn(context.Background(), storageKey, stat.Size())
	if e != nil {
		return e
	}
	_, err := io.Copy(writer, src)
	writer.Close()
	if err == nil && writeDone != nil {
		// Wait for real write to be finished
		for {
			select {
			case <-writeDone:
				return nil
			case e := <-writeErr:
				return e
			}
		}
	} else {
		return err
	}
}

func deleteSnapshot(client model.Endpoint, storageKey string) error {
	target, ok := client.(model.DataSyncTarget)
	if !ok {
		return fmt.Errorf("client must implement DataSyncTarget")
	}
	return target.DeleteNode(context.Background(), storageKey)
}
