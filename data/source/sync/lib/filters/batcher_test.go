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

package filters

import (
	"context"
	"testing"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/data/source/sync/lib/common"
	"github.com/pydio/cells/data/source/sync/lib/endpoints"
	. "github.com/smartystreets/goconvey/convey"
)

var (
	batcherTestCtx = context.Background()
)

func TestEventsBatcher_FilterBatch(t *testing.T) {

	Convey("Test simple case", t, func() {

		batch := &Batch{}
		b := NewEventsBatcher(batcherTestCtx, endpoints.NewMemDB(), endpoints.NewMemDB())
		b.FilterBatch(batch)
		So(batch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		batch := NewBatch()
		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch.CreateFiles["/ignored-file"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/ignored-file",
			},
			Key:    "/ignored-file",
			Source: source,
			Target: target,
		}
		batch.CreateFolders["/ignored-folder"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/ignored-folder",
			},
			Key:    "/ignored-folder",
			Source: source,
			Target: target,
		}
		b := NewEventsBatcher(batcherTestCtx, source, target)
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.CreateFolders, ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		batch := NewBatch()
		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		source.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/ignored-file"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/ignored-file",
			},
			Key:    "/ignored-file",
			Source: source,
			Target: target,
		}
		b := NewEventsBatcher(batcherTestCtx, source, target)
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		batch := NewBatch()
		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()

		target.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/a/file-moved"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-moved",
			},
			Key:    "/a/file-moved",
			Source: source,
			Target: target,
		}
		batch.Deletes["/file-to-move"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/file-to-move",
			},
			Key:    "/file-to-move",
			Source: source,
			Target: target,
		}
		b := NewEventsBatcher(batcherTestCtx, source, target)
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)
		So(batch.FileMoves, ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		batch := NewBatch()
		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		target.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		target.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/similar-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/a/similar-file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/a/file-moved"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-moved",
			},
			Key:    "/a/file-moved",
			Source: source,
			Target: target,
		}
		batch.Deletes["/file-to-move"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/file-to-move",
			},
			Key:    "/file-to-move",
			Source: source,
			Target: target,
		}
		batch.CreateFiles["/a/similar-file-moved"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/similar-file-moved",
			},
			Key:    "/a/similar-file-moved",
			Source: source,
			Target: target,
		}
		batch.Deletes["/similar-file"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/similar-file",
			},
			Key:    "/similar-file",
			Source: source,
			Target: target,
		}
		b := NewEventsBatcher(batcherTestCtx, source, target)
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)
		So(batch.FileMoves, ShouldHaveLength, 2)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		b := NewEventsBatcher(batcherTestCtx, source, target)

		batch := NewBatch()

		batch.CreateFiles["/a/file-touched"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-touched",
			},
			Key:    "/a/file-touched",
			Source: source,
			Target: target,
		}
		batch.Deletes["/a/file-touched"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-touched",
			},
			Key:    "/a/file-touched",
			Source: source,
			Target: target,
		}
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		b := NewEventsBatcher(batcherTestCtx, source, target)
		source.CreateNode(batcherTestCtx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch := NewBatch()

		batch.CreateFiles["/a/file-touched"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-touched",
			},
			Key:    "/a/file-touched",
			Source: source,
			Target: target,
		}
		batch.Deletes["/a/file-touched"] = &BatchedEvent{
			EventInfo: common.EventInfo{
				Path: "/a/file-touched",
			},
			Key:    "/a/file-touched",
			Source: source,
			Target: target,
		}
		b.FilterBatch(batch)

		So(batch.CreateFiles, ShouldHaveLength, 1)
		So(batch.Deletes, ShouldHaveLength, 0)

	})

	Convey("Detect folder moves with children", t, func() {

	})

}
