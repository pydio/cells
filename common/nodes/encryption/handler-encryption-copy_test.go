//go:build storage || sql

package encryption

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/models"
	omock "github.com/pydio/cells/v5/common/nodes/objects/mock"
	"github.com/pydio/cells/v5/common/proto/encryption"
	"github.com/pydio/cells/v5/common/proto/object"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/storage/test"
	srv "github.com/pydio/cells/v5/data/key/grpc"

	. "github.com/smartystreets/goconvey/convey"
)

func branch(name string, encrypted bool, client nodes.StorageClient) nodes.BranchInfo {
	bi := nodes.BranchInfo{LoadedSource: nodes.LoadedSource{DataSource: &object.DataSource{Name: name}, Client: client}}
	if encrypted {
		bi.EncryptionMode = object.EncryptionMode_MASTER
	}
	return bi
}

func dsNode(p, nodeUuid, ds string, size int64) *tree.Node {
	n := &tree.Node{Path: p, Uuid: nodeUuid, Size: size, Type: tree.NodeType_LEAF}
	n.MustSetMeta(common.MetaNamespaceDatasourceName, ds)
	return n
}

func TestHandler_CopyMultipartAndEdgeCases(t *testing.T) {

	test.RunStorageTests(testcases, t, func(ctx context.Context) {
		mock := nodes.NewHandlerMock()
		mock.RootDir = t.TempDir()
		handler := &Handler{}
		handler.SetNextHandler(mock)
		handler.SetUserKeyTool(NewMockUserKeyTool())
		grpc.RegisterMock(common.ServiceEncKeyGRPC, &setNodeInfoErrStub{NodeKeyManagerStub: encryption.NodeKeyManagerStub{
			NodeKeyManagerServer: srv.NewNodeKeyManagerHandler(),
		}})
		keyClient := encryption.NewNodeKeyManagerClient(grpc.ResolveConn(ctx, common.ServiceEncKeyGRPC))

		storage1, storage2, storage3 := omock.New(), omock.New(), omock.New()
		enc1 := branch("enc1", true, storage1)
		enc1bis := branch("enc1bis", true, storage1) // shares enc1 storage client
		enc2 := branch("enc2", true, storage2)
		clear1 := branch("clear1", false, storage3)
		in := func(bi nodes.BranchInfo) context.Context { return nodes.WithBranchInfo(ctx, "in", bi) }
		fromTo := func(from, to nodes.BranchInfo) context.Context {
			return nodes.WithBranchInfo(nodes.WithBranchInfo(ctx, "from", from), "to", to)
		}

		data := strings.Repeat("encrypted content ", 1000)
		size := int64(len(data))

		put := func(bi nodes.BranchInfo, n *tree.Node, content string) {
			_, e := handler.PutObject(in(bi), n, strings.NewReader(content), &models.PutRequestData{Size: int64(len(content))})
			So(e, ShouldBeNil)
		}
		read := func(bi nodes.BranchInfo, n *tree.Node, offset, length int64) (string, error) {
			r, e := handler.GetObject(in(bi), n, &models.GetRequestData{StartOffset: offset, Length: length})
			if e != nil {
				return "", e
			}
			defer r.Close()
			b, e := io.ReadAll(r)
			return string(b), e
		}
		raw := func(p string) string {
			b, _ := os.ReadFile(filepath.Join(mock.RootDir, p))
			return string(b)
		}
		plainSize := func(nodeUuid, ds string) int64 {
			ps, e := keyClient.GetNodePlainSize(ctx, &encryption.GetNodePlainSizeRequest{NodeId: nodeUuid, UserId: "ds:" + ds})
			So(e, ShouldBeNil)
			return ps.GetSize()
		}

		// Resolve and migrate the DB before streams are opened in goroutines
		Convey("Force DB resolution", t, func() {
			_, e := keyClient.GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{NodeId: "none", UserId: "ds:enc1"})
			So(errors.Is(e, errors.KeyNotFound), ShouldBeTrue)
		})

		Convey("Adapt and router option", t, func() {
			So((&Handler{}).Adapt(mock, nodes.RouterOptions{}), ShouldNotBeNil)
			opts := &nodes.RouterOptions{}
			WithEncryption()(opts)
			So(opts.Wrappers, ShouldHaveLength, 1)
		})

		Convey("Clear datasource and sync hidden files are passed through untouched", t, func() {
			put(clear1, dsNode("clear.txt", "clear-uuid", "clear1", size), data)
			So(raw("clear.txt"), ShouldEqual, data)
			s, e := read(clear1, dsNode("clear.txt", "clear-uuid", "clear1", size), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, data)

			put(enc1, dsNode(common.PydioSyncHiddenFile, "hidden-uuid", "enc1", 36), "hidden-uuid")
			So(raw(common.PydioSyncHiddenFile), ShouldEqual, "hidden-uuid")
			s, e = read(enc1, dsNode(common.PydioSyncHiddenFile, "hidden-uuid", "enc1", 36), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, "hidden-uuid")
		})

		Convey("Put then Get resolve missing uuid, size and datasource name", t, func() {
			mock.Nodes["resolve.txt"] = &tree.Node{Path: "resolve.txt", Uuid: "resolve-uuid", Size: size}
			_, e := handler.PutObject(in(enc1), &tree.Node{Path: "resolve.txt"}, strings.NewReader(data), &models.PutRequestData{Size: size})
			So(e, ShouldBeNil)
			So(raw("resolve.txt"), ShouldNotEqual, data)

			s, e := read(enc1, &tree.Node{Path: "resolve.txt"}, 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, data)
			So(plainSize("resolve-uuid", "enc1"), ShouldEqual, size)
		})

		Convey("Get errors", t, func() {
			_, e := read(enc1, &tree.Node{Path: "missing.txt"}, 0, -1)
			So(errors.Is(e, errors.NodeNotFound), ShouldBeTrue)

			put(enc1, dsNode("range.txt", "range-uuid", "enc1", size), data)
			_, e = read(enc1, dsNode("range.txt", "range-uuid", "enc1", size), size+1, -1)
			So(e, ShouldNotBeNil)
			_, e = read(enc1, dsNode("range.txt", "range-uuid", "enc1", size), 10, size)
			So(errors.Is(e, errors.StatusOutOfRange), ShouldBeTrue)

			_, e = read(enc1, dsNode("nokey.txt", "nokey-uuid", "enc1", size), 0, -1)
			So(e, ShouldNotBeNil)
		})

		Convey("Overwrite keeps the key and replaces the blocks", t, func() {
			n := dsNode("overwrite.txt", "overwrite-uuid", "enc1", size)
			put(enc1, n, data)
			info1, e := keyClient.GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{NodeId: "overwrite-uuid", UserId: "ds:enc1"})
			So(e, ShouldBeNil)

			other := strings.Repeat("shorter ", 100)
			put(enc1, dsNode("overwrite.txt", "overwrite-uuid", "enc1", int64(len(other))), other)
			info2, e := keyClient.GetNodeInfo(ctx, &encryption.GetNodeInfoRequest{NodeId: "overwrite-uuid", UserId: "ds:enc1"})
			So(e, ShouldBeNil)
			So(info2.GetNodeInfo().GetNodeKey().GetKeyData(), ShouldResemble, info1.GetNodeInfo().GetNodeKey().GetKeyData())
			So(plainSize("overwrite-uuid", "enc1"), ShouldEqual, len(other))

			s, e := read(enc1, dsNode("overwrite.txt", "overwrite-uuid", "enc1", int64(len(other))), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, other)
		})

		Convey("Copy between clear datasources is passed through", t, func() {
			put(clear1, dsNode("cc-src.txt", "cc-uuid", "clear1", size), data)
			_, e := handler.CopyObject(fromTo(clear1, clear1), dsNode("cc-src.txt", "cc-uuid", "clear1", size), &tree.Node{Path: "cc-dst.txt"}, &models.CopyRequestData{})
			So(e, ShouldBeNil)
			So(raw("cc-dst.txt"), ShouldEqual, data)
		})

		Convey("Move on the same storage client is passed through, encryption info stays on the uuid", t, func() {
			put(enc1, dsNode("mv-src.txt", "mv-uuid", "enc1", size), data)
			_, e := handler.CopyObject(fromTo(enc1, enc1bis), dsNode("mv-src.txt", "mv-uuid", "enc1", size), &tree.Node{Path: "mv-dst.txt"},
				&models.CopyRequestData{Metadata: map[string]string{common.XAmzMetaDirective: "COPY"}})
			So(e, ShouldBeNil)
			So(raw("mv-dst.txt"), ShouldEqual, raw("mv-src.txt"))
			s, e := read(enc1, dsNode("mv-dst.txt", "mv-uuid", "enc1", size), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, data)
		})

		Convey("Copy on the same storage client copies the encryption info to a new uuid", t, func() {
			put(enc1, dsNode("sc-src.txt", "sc-uuid", "enc1", size), data)
			req := &models.CopyRequestData{}
			_, e := handler.CopyObject(fromTo(enc1, enc1), dsNode("sc-src.txt", "sc-uuid", "enc1", size), &tree.Node{Path: "sc-dst.txt"}, req)
			So(e, ShouldBeNil)
			newUuid := req.Metadata[common.XAmzMetaNodeUuid]
			So(newUuid, ShouldNotBeEmpty)
			So(newUuid, ShouldNotEqual, "sc-uuid")
			So(req.Metadata[common.XAmzMetaClearSize], ShouldEqual, "18000")

			s, e := read(enc1, dsNode("sc-dst.txt", newUuid, "enc1", size), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, data)
			s, e = read(enc1, dsNode("sc-src.txt", "sc-uuid", "enc1", size), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, data)
		})

		for _, c := range []struct {
			label    string
			src, dst nodes.BranchInfo
			move     bool
		}{
			{"copy enc1 => enc2", enc1, enc2, false},
			{"move enc1 => enc2", enc1, enc2, true},
			{"copy enc1 => clear1", enc1, clear1, false},
			{"move enc1 => clear1", enc1, clear1, true},
			{"copy clear1 => enc2", clear1, enc2, false},
			{"move clear1 => enc2", clear1, enc2, true},
		} {
			Convey("Cross storage "+c.label, t, func() {
				srcEnc, dstEnc := c.src.EncryptionMode == object.EncryptionMode_MASTER, c.dst.EncryptionMode == object.EncryptionMode_MASTER
				srcPath := strings.ReplaceAll(c.label, " ", "_") + "-src"
				srcUuid := srcPath + "-uuid"
				put(c.src, dsNode(srcPath, srcUuid, c.src.Name, size), data)

				meta := map[string]string{}
				if c.move {
					meta[common.XAmzMetaDirective] = "COPY"
				}
				req := &models.CopyRequestData{Metadata: meta}
				oi, e := handler.CopyObject(fromTo(c.src, c.dst), dsNode(srcPath, srcUuid, c.src.Name, size), &tree.Node{Path: srcPath + "-dst"}, req)
				So(e, ShouldBeNil)
				So(oi.Size, ShouldBeGreaterThan, 0)

				dstUuid := req.Metadata[common.XAmzMetaNodeUuid]
				if c.move {
					So(dstUuid, ShouldEqual, srcUuid)
				} else {
					So(dstUuid, ShouldNotEqual, srcUuid)
				}
				So(req.Metadata[common.XAmzMetaClearSize], ShouldEqual, "18000")

				if dstEnc {
					So(raw(srcPath+"-dst"), ShouldNotEqual, data)
					So(plainSize(dstUuid, c.dst.Name), ShouldEqual, size)
				} else {
					So(raw(srcPath+"-dst"), ShouldEqual, data)
				}
				s, e := read(c.dst, dsNode(srcPath+"-dst", dstUuid, c.dst.Name, size), 0, -1)
				So(e, ShouldBeNil)
				So(s, ShouldEqual, data)

				// Source is untouched (the caller deletes it after a move)
				s, e = read(c.src, dsNode(srcPath, srcUuid, c.src.Name, size), 0, -1)
				So(e, ShouldBeNil)
				So(s, ShouldEqual, data)
				if srcEnc {
					So(plainSize(srcUuid, c.src.Name), ShouldEqual, size)
				}
			})
		}

		Convey("Cross storage copy fails on unreadable source", t, func() {
			_, e := handler.CopyObject(fromTo(enc1, enc2), dsNode("ghost.txt", "ghost-uuid", "enc1", size), &tree.Node{Path: "ghost-dst.txt"}, &models.CopyRequestData{})
			So(e, ShouldNotBeNil)
			_, e = handler.CopyObject(fromTo(enc1, enc2), &tree.Node{Path: "ghost.txt"}, &tree.Node{Path: "ghost-dst.txt"}, &models.CopyRequestData{})
			So(errors.Is(e, errors.NodeNotFound), ShouldBeTrue)
		})

		Convey("Multipart upload on an encrypted datasource", t, func() {
			part1, part2 := strings.Repeat("part one ", 500), strings.Repeat("part two ", 300)
			target := dsNode("multipart.txt", "mp-uuid", "enc1", 0)
			meta := map[string]string{}
			_, e := handler.MultipartCreate(in(enc1), target, &models.MultipartRequestData{Metadata: meta})
			So(e, ShouldBeNil)
			So(meta[common.XAmzMetaClearSize], ShouldEqual, common.XAmzMetaClearSizeUnknown)

			for i, p := range []string{part1, part2} {
				part, e := handler.MultipartPutObjectPart(in(enc1), target, "upload", i+1, strings.NewReader(p), &models.PutRequestData{Size: int64(len(p))})
				So(e, ShouldBeNil)
				So(part.Size, ShouldEqual, len(p))
			}
			total := int64(len(part1) + len(part2))
			So(plainSize("mp-uuid", "enc1"), ShouldEqual, total)
			s, e := read(enc1, dsNode("multipart.txt", "mp-uuid", "enc1", total), 0, -1)
			So(e, ShouldBeNil)
			So(s, ShouldEqual, part1+part2)

			Convey("Restarting the upload reuses the key and drops previous blocks", func() {
				_, e := handler.MultipartCreate(in(enc1), target, &models.MultipartRequestData{Metadata: map[string]string{common.XAmzMetaClearSize: "100"}})
				So(e, ShouldBeNil)
				So(plainSize("mp-uuid", "enc1"), ShouldEqual, 0)
			})
		})

		Convey("Multipart on unknown node or clear datasource", t, func() {
			_, e := handler.MultipartCreate(in(enc1), &tree.Node{Path: "mp-missing.txt"}, &models.MultipartRequestData{Metadata: map[string]string{}})
			So(errors.Is(e, errors.NodeNotFound), ShouldBeTrue)
			_, e = handler.MultipartPutObjectPart(in(enc1), &tree.Node{Path: "mp-missing.txt"}, "upload", 1, strings.NewReader("x"), &models.PutRequestData{Size: 1})
			So(e, ShouldNotBeNil)
			// Part without a previous MultipartCreate: no key
			_, e = handler.MultipartPutObjectPart(in(enc1), dsNode("mp-nokey.txt", "mp-nokey-uuid", "enc1", 0), "upload", 1, strings.NewReader("x"), &models.PutRequestData{Size: 1})
			So(e, ShouldNotBeNil)

			meta := map[string]string{common.XAmzMetaClearSize: "10"}
			_, e = handler.MultipartCreate(in(clear1), dsNode("mp-clear.txt", "mp-clear-uuid", "clear1", 0), &models.MultipartRequestData{Metadata: meta})
			So(e, ShouldBeNil)
			So(meta, ShouldNotContainKey, common.XAmzMetaClearSize)
			_, e = handler.MultipartPutObjectPart(in(clear1), dsNode("mp-clear.txt", "mp-clear-uuid", "clear1", 0), "upload", 1, strings.NewReader("clear part"), &models.PutRequestData{Size: 10})
			So(e, ShouldBeNil)
			So(raw("mp-clear.txt"), ShouldEqual, "clear part")
		})
	})
}
