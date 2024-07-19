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

package put

import (
	"bytes"
	"context"
	"crypto/md5"
	"encoding/hex"
	"hash"
	"io"
	"math"
	"os"
	"strings"
	"testing"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/models"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/utils/hasher"

	. "github.com/smartystreets/goconvey/convey"
)

func testMkFileResources() (*Handler, context.Context, *nodes.HandlerMock) {

	// Create dummy client pool
	nodes.IsUnitTestEnv = true
	tc := &tree.NodeProviderMock{
		Nodes: map[string]tree.Node{"existing/node": tree.Node{
			Uuid: "found-uuid",
			Path: "existing/node",
		}},
	}
	tw := &tree.NodeReceiverMock{}
	pool := nodes.NewTestPool(context.Background(), nodes.MakeFakeClientsPool(tc, tw))

	// create dummy handler
	h := &Handler{}
	mock := nodes.NewHandlerMock()
	h.Next = mock
	h.SetClientsPool(pool)

	ctx := context.Background()

	return h, ctx, mock
}

func TestHandler_GetOrCreatePutNode(t *testing.T) {

	h, ctx, _ := testMkFileResources()
	Convey("getOrCreatePutNode", t, func() {
		node, errFunc, err := h.getOrCreatePutNode(ctx, "existing/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "existing/node")
	})

	Convey("getOrCreatePutNode", t, func() {

		node, errFunc, err := h.getOrCreatePutNode(ctx, "other/node", &models.PutRequestData{Size: 12})
		So(err, ShouldBeNil)
		So(errFunc, ShouldNotBeNil)
		So(node, ShouldNotBeNil)
		So(node.Path, ShouldEqual, "other/node")

		errFunc()

	})

}

func TestHandler_PutObject(t *testing.T) {

	h, ctx, _ := testMkFileResources()
	Convey("PutObject 1", t, func() {
		size, err := h.PutObject(ctx, &tree.Node{Path: "/path/" + common.PydioSyncHiddenFile}, strings.NewReader(""), &models.PutRequestData{})
		So(err, ShouldBeNil)
		So(size, ShouldBeZeroValue)

	})

	Convey("PutObject 2", t, func() {
		size, err := h.PutObject(ctx, &tree.Node{Path: "/path/node"}, strings.NewReader(""), &models.PutRequestData{})
		So(err, ShouldBeNil)
		So(size, ShouldBeZeroValue)

	})

}

func TestHandler_TestMultipartHash(t *testing.T) {
	file := "../testdata/actions.zip"
	blockSize := 500 * 1024
	partSize := blockSize * 2
	hFunc := func() hash.Hash {
		return hasher.NewBlockHash(md5.New(), blockSize)
	}
	Convey("Test block hash in multipart context", t, func() {
		data, e := os.ReadFile(file)
		So(e, ShouldBeNil)
		bh := hFunc()
		_, e = io.Copy(bh, bytes.NewBuffer(data))
		So(e, ShouldBeNil)
		hx := hex.EncodeToString(bh.Sum(nil))
		t.Log("Found hx", hx)
		// Create parts
		var parts [][]byte
		cursor := 0
		for cursor < len(data) {
			last := math.Min(float64(cursor+partSize), float64(len(data)))
			part := data[cursor:int(last)]
			cursor += len(part)
			parts = append(parts, part)
		}
		t.Logf("We have %d parts", len(parts))

		partsHasher := md5.New()
		for _, part := range parts {
			r := hasher.Tee(bytes.NewBuffer(part), hFunc, "hashMetaName", func(s string, hashes [][]byte) {
				t.Log("Tee complete", s, len(hashes))
				for _, h := range hashes {
					partsHasher.Write(h)
				}
			})
			_, e := io.Copy(bh, r)
			So(e, ShouldBeNil)
			mm, ok := r.(common.ReaderMetaExtractor).ExtractedMeta()
			So(ok, ShouldBeTrue)
			So(mm["hashMetaName"], ShouldNotBeEmpty)

		}
		hx2 := hex.EncodeToString(partsHasher.Sum(nil))
		t.Log("Found hx2", hx2)
		So(hx2, ShouldEqual, hx)

	})

}
