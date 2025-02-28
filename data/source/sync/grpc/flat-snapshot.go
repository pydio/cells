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
	"fmt"
	"io"
	"os"
	"path"

	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/sync/endpoints/snapshot"
	"github.com/pydio/cells/v5/common/sync/model"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

// FlatSnapshot is a composed sync endpoint combining a BoltDB and S3 client.
type FlatSnapshot struct {
	*snapshot.BoltSnapshot
	client model.Endpoint

	globalCtx   context.Context
	mode        string
	serviceName string
	snapName    string
	ds          *object.DataSource
	boltFile    string
}

func newFlatSnapshot(ctx context.Context, ds *object.DataSource, client model.Endpoint, serviceName, snapName, mode string) (*FlatSnapshot, error) {
	boltPath, e := runtime.ServiceDataDir(serviceName)
	if e != nil {
		return nil, e
	}
	boltUuid := uuid.New() + ".db"
	boltName := "snapshot-" + boltUuid
	boltFile := path.Join(boltPath, boltName)
	if mode == "read" {
		if e := loadSnapshot(ctx, client, snapName, boltFile); e != nil {
			return nil, e
		}
	}
	// Internal will prepend snapshot- to boltUuid
	db, e := snapshot.NewBoltSnapshot(ctx, boltPath, boltUuid)
	if e != nil {
		return nil, e
	}
	return &FlatSnapshot{
		globalCtx:    ctx,
		BoltSnapshot: db,
		client:       client,
		ds:           ds,

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

func (f *FlatSnapshot) Walk(ctx context.Context, walknFc model.WalkNodesFunc, root string, recursive bool) (err error) {
	// Wrap Walker to make sure s3 object does exist
	stater := f.client.(model.PathSyncSource)
	wrapper := func(path string, node tree.N, err error) error {
		if !node.IsLeaf() {
			return walknFc(path, node, err)
		}
		if _, e := stater.LoadNode(ctx, f.ds.FlatShardedPath(node.GetUuid())); e == nil {
			return walknFc(path, node, err)
		}

		log.Logger(ctx).Warn("Ignoring node " + path + " from snapshot as object " + node.GetUuid() + " is not present on storage")
		return nil
	}
	return f.BoltSnapshot.Walk(nil, wrapper, root, recursive)
}

func (f *FlatSnapshot) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{
		URI:                   "flatsnap://" + f.serviceName,
		RequiresNormalization: false,
		RequiresFoldersRescan: false,
	}

}

func loadSnapshot(ctx context.Context, client model.Endpoint, storageKey, fsPath string) error {
	reader, ok := client.(model.DataSyncSource)
	if !ok {
		return fmt.Errorf("client must implement DataSyncSource")
	}
	tgt, e := os.OpenFile(fsPath, os.O_CREATE|os.O_WRONLY, 0755)
	if e != nil {
		return e
	}
	defer tgt.Close()
	src, e := reader.GetReaderOn(ctx, storageKey)
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
