/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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

package merger

import (
	"context"
	"testing"

	"github.com/pydio/cells/common/proto/tree"
	. "github.com/smartystreets/goconvey/convey"

	"github.com/pydio/cells/common/sync/endpoints"
	"github.com/pydio/cells/common/sync/model"
)

var (
	bTestCtx = context.Background()
)

func TestBatch_Filter(t *testing.T) {

	Convey("Test simple case", t, func() {

		batch := NewBatch(endpoints.NewMemDB(), endpoints.NewMemDB())
		batch.Filter(bTestCtx)
		So(batch, ShouldNotBeNil)

	})

	Convey("Ignore Create file if not existing in source", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)
		batch.CreateFiles["/ignored-file"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Batch: batch,
		}
		batch.CreateFolders["/ignored-folder"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/ignored-folder",
			},
			Key:   "/ignored-folder",
			Batch: batch,
		}
		batch.Filter(bTestCtx)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.CreateFolders, ShouldHaveLength, 0)

	})

	Convey("Do not ignore create file if existing in source", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/ignored-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/ignored-file"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/ignored-file",
			},
			Key:   "/ignored-file",
			Batch: batch,
		}
		batch.Filter(bTestCtx)

		So(batch.CreateFiles, ShouldHaveLength, 1)

	})

	Convey("Detect file move/rename", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)

		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/a/file-moved"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Batch: batch,
		}
		batch.Deletes["/file-to-move"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Batch: batch,
		}
		batch.Filter(bTestCtx)
		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)
		So(batch.FileMoves, ShouldHaveLength, 1)

	})

	Convey("Detect multiple moves of nodes with same etags", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)
		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/file-to-move",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		target.CreateNode(bTestCtx, &tree.Node{
			Path: "/similar-file",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)
		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/similar-file-moved",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/a/file-moved"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-moved",
			},
			Key:   "/a/file-moved",
			Batch: batch,
		}
		batch.Deletes["/file-to-move"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/file-to-move",
			},
			Key:   "/file-to-move",
			Batch: batch,
		}
		batch.CreateFiles["/a/similar-file-moved"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/similar-file-moved",
			},
			Key:   "/a/similar-file-moved",
			Batch: batch,
		}
		batch.Deletes["/similar-file"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/similar-file",
			},
			Key:   "/similar-file",
			Batch: batch,
		}
		batch.Filter(bTestCtx)

		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)
		So(batch.FileMoves, ShouldHaveLength, 2)

	})

	Convey("Detect fast create/delete on same node and file does not exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)

		batch.CreateFiles["/a/file-touched"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Batch: batch,
		}
		batch.Deletes["/a/file-touched"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Batch: batch,
		}
		batch.Filter(bTestCtx)
		So(batch.CreateFiles, ShouldHaveLength, 0)
		So(batch.Deletes, ShouldHaveLength, 0)

	})

	Convey("Detect fast create/delete on same node and file does exist at the end", t, func() {

		source, target := endpoints.NewMemDB(), endpoints.NewMemDB()
		batch := NewBatch(source, target)

		source.CreateNode(bTestCtx, &tree.Node{
			Path: "/a/file-touched",
			Type: tree.NodeType_LEAF,
			Etag: "hash",
		}, true)

		batch.CreateFiles["/a/file-touched"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Batch: batch,
		}
		batch.Deletes["/a/file-touched"] = &BatchEvent{
			EventInfo: model.EventInfo{
				Path: "/a/file-touched",
			},
			Key:   "/a/file-touched",
			Batch: batch,
		}
		batch.Filter(bTestCtx)
		So(batch.CreateFiles, ShouldHaveLength, 1)
		So(batch.Deletes, ShouldHaveLength, 0)

	})

	Convey("Detect folder moves with children", t, func() {

	})

}
