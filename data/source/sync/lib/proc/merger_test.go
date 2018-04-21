/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package proc

import (
	"context"
	"testing"
	"time"

	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	"github.com/pydio/cells/data/source/sync/lib/filters"
)

var (
	mergerTestCtx = context.Background()
)

func TestProcess(t *testing.T) {

	Convey("Test basic processing", t, func() {

		m := NewMerger(mergerTestCtx)
		defer m.Shutdown()
		So(m, ShouldNotBeNil)

		batch := filters.NewBatch()
		source := endpoints.NewMemDB()
		target := endpoints.NewMemDB()

		source.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/mkfile",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		source.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/mkdir",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/to-be-deleted",
			Type: tree.NodeType_LEAF,
			Etag: "delhash",
		}, true)
		target.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/to-be-moved",
			Type: tree.NodeType_LEAF,
			Etag: "mvhash",
		}, true)

		target.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/folder-to-be-moved",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid",
		}, true)
		target.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/folder-to-be-moved/subfolder",
			Type: tree.NodeType_COLLECTION,
			Uuid: "uuid1",
		}, true)
		target.CreateNode(mergerTestCtx, &tree.Node{
			Path: "/folder-to-be-moved/subfolder/subfile",
			Type: tree.NodeType_LEAF,
			Etag: "filehash",
		}, true)

		batch.CreateFiles["/mkfile"] = &filters.BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/mkfile",
			},
			Key: "/mkfile",
			Node: &tree.Node{
				Path: "/mkfile",
				Type: tree.NodeType_LEAF,
				Etag: "hash",
			},
			Source: source,
			Target: target,
		}
		batch.Deletes["/to-be-deleted"] = &filters.BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/to-be-deleted",
			},
			Key: "/to-be-deleted",
			Node: &tree.Node{
				Path: "/to-be-deleted",
				Type: tree.NodeType_LEAF,
				Etag: "delhash",
			},
			Source: source,
			Target: target,
		}
		batch.FileMoves["/to-be-moved"] = &filters.BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/moved-file",
			},
			Key: "/moved-file",
			Node: &tree.Node{
				Path: "/to-be-moved",
			},
			Source: source,
			Target: target,
		}
		batch.FolderMoves["/folder-to-be-moved"] = &filters.BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/moved-folder",
			},
			Key: "/moved-folder",
			Node: &tree.Node{
				Path: "/folder-to-be-moved",
			},
			Source: source,
			Target: target,
		}
		batch.CreateFolders["/mkdir"] = &filters.BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/mkdir",
			},
			Key: "/mkdir",
			Node: &tree.Node{
				Path: "/mkdir",
				Type: tree.NodeType_COLLECTION,
				Uuid: "uuid",
			},
			Source: source,
			Target: target,
		}

		m.process(batch)
		time.Sleep(2 * time.Second)

		newDir, derr := target.LoadNode(mergerTestCtx, "/mkdir")
		So(newDir, ShouldNotBeNil)
		So(derr, ShouldBeNil)

		newFile, ferr := target.LoadNode(mergerTestCtx, "/mkfile")
		So(newFile, ShouldNotBeNil)
		So(ferr, ShouldBeNil)

		delFile, delErr := target.LoadNode(mergerTestCtx, "/to-be-deleted")
		So(delFile, ShouldBeNil)
		So(delErr, ShouldNotBeNil)

		mvFile, _ := target.LoadNode(mergerTestCtx, "/to-be-moved")
		So(mvFile, ShouldBeNil)

		mvFile1, _ := target.LoadNode(mergerTestCtx, "/moved-file")
		So(mvFile1, ShouldNotBeNil)

		mvFolder, _ := target.LoadNode(mergerTestCtx, "/folder-to-be-moved/subfolder/subfile")
		So(mvFolder, ShouldBeNil)

		mvFolderFile, _ := target.LoadNode(mergerTestCtx, "/moved-folder/subfolder/subfile")
		So(mvFolderFile, ShouldNotBeNil)
		So(mvFolderFile.Etag, ShouldEqual, "filehash")

	})

}
