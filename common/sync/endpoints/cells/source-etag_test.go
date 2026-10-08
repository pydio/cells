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

package cells

import (
	"context"
	"encoding/hex"
	"fmt"
	"io"
	"sort"
	"sync"
	"testing"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/nodes/put"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/utils/uuid"

	. "github.com/smartystreets/goconvey/convey"
)

// fakeTree is an in-memory index answering as the router would (rooted paths, Cells hash as ETag).
type fakeTree struct {
	sync.Mutex
	nodes map[string]*tree.Node
	// hashLag is the number of reads after a PutObject during which the node
	// does not carry its Cells hash yet, as observed on a live server.
	hashLag     int
	pendingHash map[string]int
	// alterHash makes PutObject store a hash that does not match the content.
	alterHash bool
	// keepOldHash makes pending reads show the previous hash instead of none (update in progress).
	keepOldHash bool
	oldHash     map[string]string
}

func newFakeTree() *fakeTree {
	return &fakeTree{nodes: map[string]*tree.Node{}, pendingHash: map[string]int{}, oldHash: map[string]string{}}
}

func (t *fakeTree) set(n *tree.Node) {
	t.Lock()
	defer t.Unlock()
	t.nodes[n.Path] = n
}

func (t *fakeTree) get(p string) *tree.Node {
	t.Lock()
	defer t.Unlock()
	return t.nodes[p]
}

func (t *fakeTree) ReadNode(_ context.Context, in *tree.ReadNodeRequest, _ ...grpc.CallOption) (*tree.ReadNodeResponse, error) {
	t.Lock()
	defer t.Unlock()
	n, ok := t.nodes[in.GetNode().GetPath()]
	if !ok {
		return nil, errors.WithMessage(errors.NodeNotFound, in.GetNode().GetPath())
	}
	return &tree.ReadNodeResponse{Success: true, Node: t.view(n)}, nil
}

// view renders a node as the router returns it: the Cells hash replaces the
// storage ETag once it is visible (WithHashesAsETags).
func (t *fakeTree) view(n *tree.Node) *tree.Node {
	out := n.Clone()
	if t.pendingHash[n.Path] > 0 {
		t.pendingHash[n.Path]--
		delete(out.MetaStore, common.MetaNamespaceHash)
		if old := t.oldHash[n.Path]; t.keepOldHash && old != "" {
			out.MustSetMeta(common.MetaNamespaceHash, old)
			out.Etag = old
		}
		return out
	}
	if h := out.GetStringMeta(common.MetaNamespaceHash); h != "" {
		out.Etag = h
	}
	return out
}

func (t *fakeTree) ListNodes(_ context.Context, _ *tree.ListNodesRequest, _ ...grpc.CallOption) (tree.NodeProvider_ListNodesClient, error) {
	t.Lock()
	defer t.Unlock()
	var paths []string
	for p := range t.nodes {
		paths = append(paths, p)
	}
	sort.Strings(paths)
	st := &fakeListStream{}
	for _, p := range paths {
		st.nodes = append(st.nodes, t.view(t.nodes[p]))
	}
	return st, nil
}

type fakeListStream struct {
	grpc.ClientStream
	nodes []*tree.Node
}

func (s *fakeListStream) Recv() (*tree.ListNodesResponse, error) {
	if len(s.nodes) == 0 {
		return nil, io.EOF
	}
	n := s.nodes[0]
	s.nodes = s.nodes[1:]
	return &tree.ListNodesResponse{Node: n}, nil
}

// PutObject indexes the node synchronously with a Cells hash derived from its content, like a flat datasource.
func (t *fakeTree) PutObject(_ context.Context, node *tree.Node, reader io.Reader, _ *models.PutRequestData) (models.ObjectInfo, error) {
	data, er := io.ReadAll(reader)
	if er != nil {
		return models.ObjectInfo{}, er
	}
	t.Lock()
	defer t.Unlock()
	n, ok := t.nodes[node.Path]
	if !ok {
		n = &tree.Node{Path: node.Path, Uuid: uuid.New(), Type: tree.NodeType_LEAF}
		t.nodes[node.Path] = n
	}
	n.Size = int64(len(data))
	n.Etag = storageEtag(string(data))
	t.oldHash[n.Path] = n.GetStringMeta(common.MetaNamespaceHash)
	if t.alterHash {
		n.MustSetMeta(common.MetaNamespaceHash, cellsHash(string(data)+"-altered"))
	} else {
		n.MustSetMeta(common.MetaNamespaceHash, cellsHash(string(data)))
	}
	t.pendingHash[n.Path] = t.hashLag
	return models.ObjectInfo{}, nil
}

func (t *fakeTree) GetObject(context.Context, *tree.Node, *models.GetRequestData) (io.ReadCloser, error) {
	return nil, fmt.Errorf("not implemented")
}

func (t *fakeTree) CopyObject(context.Context, *tree.Node, *tree.Node, *models.CopyRequestData) (models.ObjectInfo, error) {
	return models.ObjectInfo{}, fmt.Errorf("not implemented")
}

// writeMeta simulates the meta service: values are merged by namespace, json-encoded empty string deletes.
func (t *fakeTree) writeMeta(node *tree.Node) {
	t.Lock()
	defer t.Unlock()
	for _, n := range t.nodes {
		if n.Uuid != node.Uuid {
			continue
		}
		for k, v := range node.MetaStore {
			if v == `""` {
				delete(n.MetaStore, k)
			} else {
				if n.MetaStore == nil {
					n.MetaStore = map[string]string{}
				}
				n.MetaStore[k] = v
			}
		}
	}
}

// setPair stores a pair on a node the way the meta service returns it (raw JSON value).
func setPair(n *tree.Node, hash, etag string) {
	v, _ := (&SourceEtag{Hash: hash, Etag: etag}).Marshal()
	n.SetRawMetadata(map[string]string{MetaSyncSourceEtag: v})
}

func storageEtag(content string) string {
	return fmt.Sprintf("s3-%x", len(content)) + content
}

// cellsHash is the hash the router computes for content (x-cells-hash).
func cellsHash(content string) string {
	h := put.HashFunc()
	h.Write([]byte(content))
	return hex.EncodeToString(h.Sum(nil))
}

type fakeFactory struct {
	t *fakeTree
}

func (f *fakeFactory) GetNodeProviderClient(ctx context.Context) (context.Context, tree.NodeProviderClient, error) {
	return ctx, f.t, nil
}

func (f *fakeFactory) GetNodeReceiverClient(ctx context.Context) (context.Context, tree.NodeReceiverClient, error) {
	return ctx, nil, fmt.Errorf("not implemented")
}

func (f *fakeFactory) GetNodeChangesStreamClient(ctx context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	return ctx, nil, fmt.Errorf("not implemented")
}

func (f *fakeFactory) GetObjectsClient(ctx context.Context) (context.Context, ObjectsClient, error) {
	return ctx, f.t, nil
}

func (f *fakeFactory) GetNodeProviderStreamClient(ctx context.Context) (context.Context, tree.NodeProviderStreamerClient, error) {
	return ctx, nil, fmt.Errorf("not implemented")
}

func (f *fakeFactory) GetNodeReceiverStreamClient(ctx context.Context) (context.Context, tree.NodeReceiverStreamClient, error) {
	return ctx, nil, fmt.Errorf("not implemented")
}

// metaRecorder is a fake CoreMetaWriter recording calls and whether writeDone was already closed.
type metaRecorder struct {
	sync.Mutex
	t          *fakeTree
	calls      []*tree.Node
	err        error
	writeDone  chan bool
	doneBefore bool
}

func (m *metaRecorder) write(_ context.Context, node *tree.Node) error {
	m.Lock()
	defer m.Unlock()
	m.calls = append(m.calls, node.Clone())
	if m.writeDone != nil {
		select {
		case <-m.writeDone:
			m.doneBefore = true
		default:
		}
	}
	if m.err != nil {
		return m.err
	}
	m.t.writeMeta(node)
	return nil
}

func newTestAbstract(sourceEtags bool) (*Abstract, *fakeTree, *metaRecorder) {
	ft := newFakeTree()
	ft.set(&tree.Node{Path: "root", Uuid: "root-uuid", Type: tree.NodeType_COLLECTION, Etag: "folder-etag"})
	rec := &metaRecorder{t: ft}
	c := &Abstract{
		Factory:        &fakeFactory{t: ft},
		Root:           "root",
		ClientUUID:     "client",
		GlobalCtx:      context.Background(),
		Options:        Options{SourceEtags: sourceEtags},
		CoreMetaWriter: rec.write,
	}
	return c, ft, rec
}

// writeFile runs GetWriterOn the way the sync processor does and returns the errors sent on writeErr.
func writeFile(c *Abstract, rec *metaRecorder, p, content string, source tree.N) []error {
	out, done, errc, err := c.GetWriterOn(context.Background(), p, int64(len(content)), source)
	So(err, ShouldBeNil)
	rec.Lock()
	rec.writeDone = done
	rec.Unlock()
	_, _ = out.Write([]byte(content))
	_ = out.Close()
	<-done
	var errs []error
	for e := range errc {
		errs = append(errs, e)
	}
	return errs
}

func walkAll(c *Abstract) map[string]tree.N {
	res := map[string]tree.N{}
	er := c.Walk(context.Background(), func(path string, node tree.N, err error) error {
		res[path] = node
		return nil
	}, "", true)
	So(er, ShouldBeNil)
	return res
}

func TestSourceEtagPair(t *testing.T) {
	Convey("SourceEtag marshals to and from a JSON object", t, func() {
		v, er := (&SourceEtag{Hash: "h", Etag: "e"}).Marshal()
		So(er, ShouldBeNil)
		So(v, ShouldEqual, `{"hash":"h","etag":"e"}`)
		s, er := UnmarshalSourceEtag(v)
		So(er, ShouldBeNil)
		So(s.Hash, ShouldEqual, "h")
		So(s.Etag, ShouldEqual, "e")
		_, er = UnmarshalSourceEtag("not-json")
		So(er, ShouldNotBeNil)
	})
}

func TestSourceEtagsOff(t *testing.T) {
	Convey("With option off, write and read behave as before", t, func() {
		c, ft, rec := newTestAbstract(false)
		errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"})
		So(errs, ShouldBeEmpty)
		So(rec.calls, ShouldBeEmpty)
		So(ft.get("root/file.txt").GetStringMeta(common.MetaNamespaceHash), ShouldEqual, cellsHash("content"))

		// Even a stored pair is ignored
		setPair(ft.get("root/file.txt"), cellsHash("content"), "sha1")
		n, er := c.LoadNode(context.Background(), "file.txt")
		So(er, ShouldBeNil)
		So(n.GetEtag(), ShouldEqual, cellsHash("content"))
		So(walkAll(c)["file.txt"].GetEtag(), ShouldEqual, cellsHash("content"))
	})
}

func TestSourceEtagsWrite(t *testing.T) {
	Convey("With option on, writing a file", t, func() {
		c, ft, rec := newTestAbstract(true)

		Convey("records the pair after PutObject and before writeDone", func() {
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"})
			So(errs, ShouldBeEmpty)
			So(rec.calls, ShouldHaveLength, 1)
			So(rec.doneBefore, ShouldBeFalse)
			written := ft.get("root/file.txt")
			So(rec.calls[0].Uuid, ShouldEqual, written.Uuid)
			pair, er := UnmarshalSourceEtag(rec.calls[0].MetaStore[MetaSyncSourceEtag])
			So(er, ShouldBeNil)
			So(pair.Hash, ShouldEqual, cellsHash("content"))
			So(pair.Etag, ShouldEqual, "sha1")
			// Index still holds the Cells hash
			So(written.GetStringMeta(common.MetaNamespaceHash), ShouldEqual, cellsHash("content"))
		})

		Convey("records nothing when source etag equals the Cells hash", func() {
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: cellsHash("content")})
			So(errs, ShouldBeEmpty)
			So(rec.calls, ShouldBeEmpty)
		})

		Convey("clears a stale pair when source etag equals the Cells hash", func() {
			So(writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"}), ShouldBeEmpty)
			So(writeFile(c, rec, "file.txt", "other", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: cellsHash("other")}), ShouldBeEmpty)
			So(rec.calls, ShouldHaveLength, 2)
			So(ft.get("root/file.txt").GetMetaStore(), ShouldNotContainKey, MetaSyncSourceEtag)
		})

		Convey("records nothing when source etag is empty", func() {
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF})
			So(errs, ShouldBeEmpty)
			So(rec.calls, ShouldBeEmpty)
		})

		Convey("ignores .pydio hidden files", func() {
			errs := writeFile(c, rec, "folder/.pydio", "uuid", &tree.Node{Path: "folder/.pydio", Type: tree.NodeType_LEAF, Etag: "sha1"})
			So(errs, ShouldBeEmpty)
			So(rec.calls, ShouldBeEmpty)
			So(ft.get("root/folder/.pydio"), ShouldBeNil)
		})

		Convey("surfaces a recording failure on writeErr", func() {
			rec.err = fmt.Errorf("meta service down")
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"})
			So(errs, ShouldHaveLength, 1)
			So(errs[0].Error(), ShouldContainSubstring, "meta service down")
		})

		Convey("fails when no core meta writer is set", func() {
			c.CoreMetaWriter = nil
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"})
			So(errs, ShouldHaveLength, 1)
		})
	})
}

func TestSourceEtagsHashLag(t *testing.T) {
	Convey("Given a router where the Cells hash shows up only later after PutObject", t, func() {
		c, ft, rec := newTestAbstract(true)
		ft.hashLag = 1 << 20

		Convey("the pair is recorded at once, with the hash of the written content", func() {
			errs := writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"})
			So(errs, ShouldBeEmpty)
			So(rec.calls, ShouldHaveLength, 1)
			pair, er := UnmarshalSourceEtag(rec.calls[0].MetaStore[MetaSyncSourceEtag])
			So(er, ShouldBeNil)
			So(pair.Hash, ShouldEqual, cellsHash("content"))

			// Until the hash is visible, the node reports its storage ETag...
			n, er := c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, storageEtag("content"))
			// ...then the source ETag.
			ft.pendingHash["root/file.txt"] = 0
			n, er = c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, "sha1")
		})
	})

	Convey("Given a router storing a hash that differs from the written content", t, func() {
		c, ft, rec := newTestAbstract(true)
		ft.alterHash = true

		Convey("the pair never applies: the node keeps reporting its Cells hash", func() {
			So(writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"}), ShouldBeEmpty)
			n, er := c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, cellsHash("content-altered"))
		})
	})

	Convey("Given an update while the previous hash is still visible", t, func() {
		c, ft, rec := newTestAbstract(true)
		So(writeFile(c, rec, "file.txt", "v1", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1-v1"}), ShouldBeEmpty)

		Convey("the new pair is recorded and applies once the new hash is visible", func() {
			ft.hashLag = 1 << 20
			ft.keepOldHash = true
			So(writeFile(c, rec, "file.txt", "v2", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1-v2"}), ShouldBeEmpty)
			pair, er := UnmarshalSourceEtag(rec.calls[len(rec.calls)-1].MetaStore[MetaSyncSourceEtag])
			So(er, ShouldBeNil)
			So(pair.Hash, ShouldEqual, cellsHash("v2"))
			So(pair.Etag, ShouldEqual, "sha1-v2")

			ft.keepOldHash = false
			ft.pendingHash["root/file.txt"] = 0
			n, er := c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, "sha1-v2")
		})
	})
}

func TestSourceEtagsRead(t *testing.T) {
	Convey("With option on, reading nodes", t, func() {
		c, ft, rec := newTestAbstract(true)
		So(writeFile(c, rec, "file.txt", "content", &tree.Node{Path: "file.txt", Type: tree.NodeType_LEAF, Etag: "sha1"}), ShouldBeEmpty)
		ft.set(&tree.Node{Path: "root/folder", Uuid: "folder-uuid", Type: tree.NodeType_COLLECTION, Etag: "folder-etag"})
		ft.set(&tree.Node{Path: "root/plain.txt", Uuid: "plain-uuid", Type: tree.NodeType_LEAF, Etag: "plain-hash"})

		Convey("reports the source etag while content is unchanged", func() {
			n, er := c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, "sha1")
			walked := walkAll(c)
			So(walked["file.txt"].GetEtag(), ShouldEqual, "sha1")
			So(walked["plain.txt"].GetEtag(), ShouldEqual, "plain-hash")

			cached, er := c.GetCachedBranches(context.Background(), "")
			So(er, ShouldBeNil)
			cn, er := cached.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(cn.GetEtag(), ShouldEqual, "sha1")
		})

		Convey("reports the Cells hash once content has changed", func() {
			ft.get("root/file.txt").MustSetMeta(common.MetaNamespaceHash, cellsHash("modified"))
			n, er := c.LoadNode(context.Background(), "file.txt")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, cellsHash("modified"))
			So(walkAll(c)["file.txt"].GetEtag(), ShouldEqual, cellsHash("modified"))
		})

		Convey("leaves folders untouched", func() {
			f := ft.get("root/folder")
			setPair(f, "folder-etag", "sha1")
			n, er := c.LoadNode(context.Background(), "folder")
			So(er, ShouldBeNil)
			So(n.GetEtag(), ShouldEqual, "folder-etag")
			So(walkAll(c)["folder"].GetEtag(), ShouldEqual, "-1")
		})
	})
}
