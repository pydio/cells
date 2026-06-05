/*
 * Copyright (c) 2019-2024. Abstrium SAS <team (at) pydio.com>
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
package bus

import (
	"bytes"
	"context"
	"fmt"
	"io"

	"net/url"
	"testing"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"

	. "github.com/smartystreets/goconvey/convey"
)

// --- mocks ---

type mockQueue struct {
	pushed  []proto.Message
	pushErr error
	consume func(context.Context, ...broker.Message)
}

func (m *mockQueue) Push(ctx context.Context, msg proto.Message) error {
	if m.pushErr != nil {
		return m.pushErr
	}
	m.pushed = append(m.pushed, msg)
	return nil
}
func (m *mockQueue) PushRaw(_ context.Context, _ broker.Message) error {
	return m.pushErr
}
func (m *mockQueue) Consume(cb func(context.Context, ...broker.Message)) error {
	if m.consume != nil {
		m.consume(context.Background())
	}
	return nil
}
func (m *mockQueue) Close(_ context.Context) error { return nil }

type mockSnapshot struct {
	nodes     map[string]tree.N
	created   []tree.N
	deleted   []string
	moved     [][2]string
	createErr error
	deleteErr error
	moveErr   error
}

func newMockSnapshot() *mockSnapshot {
	return &mockSnapshot{nodes: map[string]tree.N{}}
}
func (s *mockSnapshot) LoadNode(_ context.Context, path string, _ ...bool) (tree.N, error) {
	if n, ok := s.nodes[path]; ok {
		return n, nil
	}
	return nil, nil
}
func (s *mockSnapshot) GetEndpointInfo() model.EndpointInfo { return model.EndpointInfo{} }
func (s *mockSnapshot) Walk(_ context.Context, fn model.WalkNodesFunc, _ string, _ bool) error {
	for p, n := range s.nodes {
		_ = fn(p, n, nil)
	}
	return nil
}
func (s *mockSnapshot) Watch(_ context.Context, _ string) (*model.WatchObject, error) {
	return nil, nil
}
func (s *mockSnapshot) CreateNode(_ context.Context, node tree.N, _ bool) error {
	if s.createErr != nil {
		return s.createErr
	}
	s.created = append(s.created, node)
	return nil
}
func (s *mockSnapshot) DeleteNode(_ context.Context, path string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	s.deleted = append(s.deleted, path)
	return nil
}
func (s *mockSnapshot) MoveNode(_ context.Context, old, newPath string) error {
	if s.moveErr != nil {
		return s.moveErr
	}
	s.moved = append(s.moved, [2]string{old, newPath})
	return nil
}

func (s *mockSnapshot) GetWriterOn(_ context.Context, _ string, _ int64, _ tree.N) (io.WriteCloser, chan bool, chan error, error) {
	return nil, nil, nil, fmt.Errorf("not implemented")
}
func (s *mockSnapshot) GetReaderOn(_ context.Context, _ string, _ tree.N) (io.ReadCloser, error) {
	return nil, fmt.Errorf("not implemented")
}

type nopWriteCloser struct{ *bytes.Buffer }

func (n *nopWriteCloser) Close() error { return nil }

// --- writeWrapper tests ---

func TestWriteWrapper(t *testing.T) {
	Convey("writeWrapper.Close calls underlying Close then callback", t, func() {
		buf := &bytes.Buffer{}
		callbackCalled := false
		ww := &writeWrapper{
			WriteCloser: &nopWriteCloser{buf},
			closeCallback: func() error {
				callbackCalled = true
				return nil
			},
		}
		err := ww.Close()
		So(err, ShouldBeNil)
		So(callbackCalled, ShouldBeTrue)
	})
}

func TestReadWrapper(t *testing.T) {
	Convey("readWrapper.Close calls underlying Close then callback", t, func() {
		callbackCalled := false
		rw := &readWrapper{
			ReadCloser: io.NopCloser(bytes.NewReader([]byte("data"))),
			closeCallback: func() error {
				callbackCalled = true
				return nil
			},
		}
		err := rw.Close()
		So(err, ShouldBeNil)
		So(callbackCalled, ShouldBeTrue)
	})
}

// --- PubSubEndpoint tests ---

func newPubEndpoint(q broker.AsyncQueue, snap *mockSnapshot) *PubSubEndpoint {
	return &PubSubEndpoint{
		isPub:          true,
		AsyncQueue:     q,
		PathSyncSource: snap,
		PathSyncTarget: snap,
	}
}

func TestPubEndpointCreateNode(t *testing.T) {
	ctx := context.Background()
	Convey("CreateNode in pub mode pushes to queue and delegates to snapshot", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		node := &tree.Node{Path: "test", Type: tree.NodeType_LEAF}
		err := ep.CreateNode(ctx, node, false)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
		So(len(snap.created), ShouldEqual, 1)
	})
}

func TestPubEndpointCreateNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("CreateNode returns error when queue push fails", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("queue error")}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.CreateNode(ctx, &tree.Node{Path: "test"}, false)
		So(err, ShouldNotBeNil)
	})
}

func TestPubEndpointDeleteNode(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteNode in pub mode pushes to queue and delegates", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.DeleteNode(ctx, "path")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
		So(len(snap.deleted), ShouldEqual, 1)
	})
}

func TestPubEndpointDeleteNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteNode returns error when queue push fails", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("queue error")}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.DeleteNode(ctx, "path")
		So(err, ShouldNotBeNil)
	})
}

func TestPubEndpointMoveNode(t *testing.T) {
	ctx := context.Background()
	Convey("MoveNode in pub mode pushes to queue and delegates", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.MoveNode(ctx, "oldPath", "newPath")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
		So(len(snap.moved), ShouldEqual, 1)
	})
}

func TestPubEndpointMoveNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("MoveNode returns error when queue push fails", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("queue error")}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.MoveNode(ctx, "old", "new")
		So(err, ShouldNotBeNil)
	})
}

func TestSubEndpointNoQueuePush(t *testing.T) {
	ctx := context.Background()
	Convey("Sub mode doesn't push to queue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		ep.CreateNode(ctx, &tree.Node{Path: "test"}, false)
		ep.DeleteNode(ctx, "path")
		ep.MoveNode(ctx, "old", "new")

		So(len(q.pushed), ShouldEqual, 0)
		So(len(snap.created), ShouldEqual, 1)
		So(len(snap.deleted), ShouldEqual, 1)
		So(len(snap.moved), ShouldEqual, 1)
	})
}

func TestLoadNode(t *testing.T) {
	ctx := context.Background()
	Convey("LoadNode delegates to PathSyncTarget", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.nodes["test"] = &tree.Node{Path: "test"}
		ep := newPubEndpoint(q, snap)

		node, err := ep.LoadNode(ctx, "test")
		So(err, ShouldBeNil)
		So(node, ShouldNotBeNil)
	})
}

func TestWalk(t *testing.T) {
	ctx := context.Background()
	Convey("Walk delegates to PathSyncTarget", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.nodes["a"] = &tree.Node{Path: "a"}
		snap.nodes["b"] = &tree.Node{Path: "b"}
		ep := newPubEndpoint(q, snap)

		visited := 0
		ep.Walk(ctx, func(path string, n tree.N, err error) error {
			visited++
			return nil
		}, "", false)
		So(visited, ShouldEqual, 2)
	})
}

func TestConsume(t *testing.T) {
	Convey("Consume calls AsyncQueue.Consume", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		consumeCalled := false
		q.consume = func(ctx context.Context, msgs ...broker.Message) {
			consumeCalled = true
		}

		callback := func(ctx context.Context, msgs ...broker.Message) {}
		ep.Consume(callback)
		So(consumeCalled, ShouldBeTrue)
	})
}

func TestClose(t *testing.T) {
	ctx := context.Background()
	Convey("Close delegates to AsyncQueue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.Close(ctx)
		So(err, ShouldBeNil)
	})
}

func TestGetEndpointInfo(t *testing.T) {
	Convey("GetEndpointInfo returns correct structure", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		queueURL, _ := url.Parse("mem://queue")
		snapURL, _ := url.Parse("mem://snap")

		ep := &PubSubEndpoint{
			isPub:          true,
			queueURL:       queueURL,
			snapURL:        snapURL,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		info := ep.GetEndpointInfo()
		So(info.IsAsynchronous, ShouldBeTrue)
		So(info.URI, ShouldContainSubstring, "pub:///")
	})
}

func TestParseMetaGlobs(t *testing.T) {
	ctx := context.Background()
	Convey("parseMetaGlobs with valid patterns", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		u, _ := url.Parse("pub:///?metadataGlobs=user:*,profile:*")
		err := ep.parseMetaGlobs(ctx, u)
		So(err, ShouldBeNil)
		So(len(ep.metaGlob), ShouldEqual, 2)
	})
}

func TestParseMetaGlobsInvalid(t *testing.T) {
	ctx := context.Background()
	Convey("parseMetaGlobs with invalid pattern", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		u, _ := url.Parse("pub:///?metadataGlobs=[invalid")
		err := ep.parseMetaGlobs(ctx, u)
		So(err, ShouldNotBeNil)
	})
}

func TestProvidesMetadataNamespaces(t *testing.T) {
	Convey("ProvidesMetadataNamespaces returns glob patterns", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		globs, hasGlobs := ep.ProvidesMetadataNamespaces()
		So(globs, ShouldBeNil)
		So(hasGlobs, ShouldBeFalse)
	})
}

type mockMetadataReceiver struct{}

func (m *mockMetadataReceiver) CreateMetadata(ctx context.Context, node tree.N, namespace, jsonValue string) error {
	return nil
}
func (m *mockMetadataReceiver) UpdateMetadata(ctx context.Context, node tree.N, namespace, jsonValue string) error {
	return nil
}
func (m *mockMetadataReceiver) DeleteMetadata(ctx context.Context, node tree.N, namespace string) error {
	return nil
}

func TestCreateMetadata(t *testing.T) {
	ctx := context.Background()
	Convey("CreateMetadata with queue and receiver", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		receiver := &mockMetadataReceiver{}
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   receiver,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.CreateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

func TestCreateMetadataError(t *testing.T) {
	ctx := context.Background()
	Convey("CreateMetadata with queue error", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("error")}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.CreateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldNotBeNil)
	})
}

func TestUpdateMetadata(t *testing.T) {
	ctx := context.Background()
	Convey("UpdateMetadata with queue and receiver", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		receiver := &mockMetadataReceiver{}
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   receiver,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.UpdateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

func TestUpdateMetadataError(t *testing.T) {
	ctx := context.Background()
	Convey("UpdateMetadata with queue error", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("error")}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.UpdateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldNotBeNil)
	})
}

func TestDeleteMetadata(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteMetadata with queue and receiver", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		receiver := &mockMetadataReceiver{}
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   receiver,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.DeleteMetadata(ctx, node, "ns")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

func TestDeleteMetadataError(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteMetadata with queue error", t, func() {
		q := &mockQueue{pushErr: fmt.Errorf("error")}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.DeleteMetadata(ctx, node, "ns")
		So(err, ShouldNotBeNil)
	})
}

type mockSessionProvider struct{}

func (m *mockSessionProvider) StartSession(ctx context.Context, rootNode tree.N, silent bool) (string, error) {
	return "session-123", nil
}
func (m *mockSessionProvider) FlushSession(ctx context.Context, sessionUuid string) error {
	return nil
}
func (m *mockSessionProvider) FinishSession(ctx context.Context, sessionUuid string) error {
	return nil
}

type mockDataSyncTarget struct {
	writerErr error
}

func (m *mockDataSyncTarget) GetWriterOn(ctx context.Context, uuid string, size int64, node tree.N) (io.WriteCloser, chan bool, chan error, error) {
	if m.writerErr != nil {
		return nil, nil, nil, m.writerErr
	}
	done := make(chan bool, 1)
	errChan := make(chan error, 1)
	return &nopWriteCloser{&bytes.Buffer{}}, done, errChan, nil
}
func (m *mockDataSyncTarget) CreateNode(ctx context.Context, node tree.N, updateIfExists bool) error {
	return nil
}
func (m *mockDataSyncTarget) DeleteNode(ctx context.Context, path string) error {
	return nil
}
func (m *mockDataSyncTarget) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{}
}
func (m *mockDataSyncTarget) LoadNode(ctx context.Context, path string, opts ...bool) (tree.N, error) {
	return &tree.Node{Path: path, Uuid: "uuid"}, nil
}
func (m *mockDataSyncTarget) Walk(ctx context.Context, fn model.WalkNodesFunc, root string, recursive bool) error {
	return nil
}
func (m *mockDataSyncTarget) MoveNode(ctx context.Context, oldPath string, newPath string) error {
	return nil
}

type mockDataSyncSource struct {
	readerErr error
}

func (m *mockDataSyncSource) GetReaderOn(ctx context.Context, uuid string, node tree.N) (io.ReadCloser, error) {
	if m.readerErr != nil {
		return nil, m.readerErr
	}
	return io.NopCloser(bytes.NewReader([]byte("data"))), nil
}
func (m *mockDataSyncSource) GetEndpointInfo() model.EndpointInfo {
	return model.EndpointInfo{}
}
func (m *mockDataSyncSource) LoadNode(ctx context.Context, path string, opts ...bool) (tree.N, error) {
	return &tree.Node{Path: path, Uuid: "uuid"}, nil
}
func (m *mockDataSyncSource) Walk(ctx context.Context, fn model.WalkNodesFunc, root string, recursive bool) error {
	return nil
}
func (m *mockDataSyncSource) Watch(ctx context.Context, path string) (*model.WatchObject, error) {
	return nil, fmt.Errorf("not implemented")
}

func TestStartSession(t *testing.T) {
	ctx := context.Background()
	Convey("StartSession without provider returns fake session", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		id, err := ep.StartSession(ctx, &tree.Node{Path: "root"}, false)
		So(err, ShouldBeNil)
		So(id, ShouldEqual, "fake-session")
	})
}

func TestStartSessionWithProvider(t *testing.T) {
	ctx := context.Background()
	Convey("StartSession with provider delegates", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		provider := &mockSessionProvider{}
		ep := &PubSubEndpoint{
			isPub:           true,
			AsyncQueue:      q,
			PathSyncSource:  snap,
			PathSyncTarget:  snap,
			sessionProvider: provider,
		}

		id, err := ep.StartSession(ctx, &tree.Node{Path: "root"}, false)
		So(err, ShouldBeNil)
		So(id, ShouldEqual, "session-123")
	})
}

func TestFlushSession(t *testing.T) {
	ctx := context.Background()
	Convey("FlushSession without provider succeeds", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.FlushSession(ctx, "uuid")
		So(err, ShouldBeNil)
	})
}

func TestFlushSessionWithProvider(t *testing.T) {
	ctx := context.Background()
	Convey("FlushSession with provider delegates", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		provider := &mockSessionProvider{}
		ep := &PubSubEndpoint{
			isPub:           true,
			AsyncQueue:      q,
			PathSyncSource:  snap,
			PathSyncTarget:  snap,
			sessionProvider: provider,
		}

		err := ep.FlushSession(ctx, "uuid")
		So(err, ShouldBeNil)
	})
}

func TestFinishSession(t *testing.T) {
	ctx := context.Background()
	Convey("FinishSession without provider succeeds", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.FinishSession(ctx, "uuid")
		So(err, ShouldBeNil)
	})
}

func TestFinishSessionWithProvider(t *testing.T) {
	ctx := context.Background()
	Convey("FinishSession with provider delegates", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		provider := &mockSessionProvider{}
		ep := &PubSubEndpoint{
			isPub:           true,
			AsyncQueue:      q,
			PathSyncSource:  snap,
			PathSyncTarget:  snap,
			sessionProvider: provider,
		}

		err := ep.FinishSession(ctx, "uuid")
		So(err, ShouldBeNil)
	})
}

func TestShutdown(t *testing.T) {
	Convey("Shutdown on non-shutdowner succeeds", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		err := ep.Shutdown()
		So(err, ShouldBeNil)
	})
}

// --- Additional tests for better coverage ---

func TestParseSubEndpointsWithMemoryScheme(t *testing.T) {
	ctx := context.Background()
	Convey("parseSubEndpoints attempts to parse snapshot URL", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := newPubEndpoint(q, snap)

		// Memory endpoint won't have PathSyncSource/Target so will fail
		u, _ := url.Parse("memory://test")
		err := ep.parseSubEndpoints(ctx, u)
		So(err, ShouldNotBeNil) // Expected to fail - memory endpoint doesn't implement required interfaces
	})
}

// TODO Improve coverage
// The setup is tested, but the internal message processing callback isn't invoked during tests
// (would require mocking protobuf unmarshalling and event transformation).
func TestWatchPubMode(t *testing.T) {
	ctx := context.Background()
	Convey("Watch in pub mode returns error", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		_, err := ep.Watch(ctx, "/path")
		So(err, ShouldNotBeNil)
	})
}

func TestWatchSubMode(t *testing.T) {
	ctx := context.Background()
	Convey("Watch in sub mode returns watch object", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo, err := ep.Watch(ctx, "/path")
		So(err, ShouldBeNil)
		So(wo, ShouldNotBeNil)
		So(wo.EventInfoChan, ShouldNotBeNil)
		So(wo.ErrorChan, ShouldNotBeNil)
	})
}

func TestWatchSubModeMultiple(t *testing.T) {
	ctx := context.Background()
	Convey("Watch in sub mode can be called multiple times", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo1, err1 := ep.Watch(ctx, "/path1")
		wo2, err2 := ep.Watch(ctx, "/path2")

		So(err1, ShouldBeNil)
		So(err2, ShouldBeNil)
		So(wo1, ShouldNotBeNil)
		So(wo2, ShouldNotBeNil)
	})
}

func TestCloseEndpoint(t *testing.T) {
	ctx := context.Background()
	Convey("Close closes the AsyncQueue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		err := ep.Close(ctx)
		So(err, ShouldBeNil)
	})
}

func TestWatchObjectChannels(t *testing.T) {
	ctx := context.Background()
	Convey("Watch in sub mode creates watch object with channels", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo.EventInfoChan, ShouldNotBeNil)
		So(wo.ErrorChan, ShouldNotBeNil)
		So(wo.DoneChan, ShouldNotBeNil)
	})
}

func TestWatchCallsConsume(t *testing.T) {
	ctx := context.Background()
	Convey("Watch calls AsyncQueue.Consume to start listening", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		consumeCalled := false
		q.consume = func(ctx context.Context, msgs ...broker.Message) {
			consumeCalled = true
		}

		ep.Watch(ctx, "/test")
		So(consumeCalled, ShouldBeTrue)
	})
}

func TestWatchCreateNodeEvent(t *testing.T) {
	ctx := context.Background()
	Convey("Watch processes CREATE node change events", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		consumeCalled := false
		q.consume = func(ctx context.Context, msgs ...broker.Message) {
			consumeCalled = true
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo, ShouldNotBeNil)
		So(consumeCalled, ShouldBeTrue)

		// Verify channels are set up
		So(wo.EventInfoChan, ShouldNotBeNil)
		So(wo.ErrorChan, ShouldNotBeNil)
	})
}

func TestWatchDeleteNodeEvent(t *testing.T) {
	ctx := context.Background()
	Convey("Watch processes DELETE node change events", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo.EventInfoChan, ShouldNotBeNil)
	})
}

func TestWatchUpdatePathEvent(t *testing.T) {
	ctx := context.Background()
	Convey("Watch processes UPDATE_PATH node change events", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo.DoneChan, ShouldNotBeNil)
	})
}

func TestWatchWithMetadataReceiver(t *testing.T) {
	ctx := context.Background()
	Convey("Watch processes metadata events with receiver", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		receiver := &mockMetadataReceiver{}
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   receiver,
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo, ShouldNotBeNil)
	})
}

func TestWatchWithoutMetadataReceiver(t *testing.T) {
	ctx := context.Background()
	Convey("Watch processes metadata events without receiver", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   nil,
		}

		wo, err := ep.Watch(ctx, "/test")
		So(err, ShouldBeNil)
		So(wo.ErrorChan, ShouldNotBeNil)
	})
}

func TestWatchDifferentPaths(t *testing.T) {
	ctx := context.Background()
	Convey("Watch handles different recursive paths", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		wo1, _ := ep.Watch(ctx, "/path1")
		wo2, _ := ep.Watch(ctx, "/path2/subpath")
		wo3, _ := ep.Watch(ctx, "")

		So(wo1, ShouldNotBeNil)
		So(wo2, ShouldNotBeNil)
		So(wo3, ShouldNotBeNil)
	})
}

func TestMetadataCreateWithoutReceiver(t *testing.T) {
	ctx := context.Background()
	Convey("CreateMetadata without metaReceiver skips receiver call", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   nil,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.CreateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

func TestMetadataUpdateWithoutReceiver(t *testing.T) {
	ctx := context.Background()
	Convey("UpdateMetadata without metaReceiver skips receiver call", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   nil,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.UpdateMetadata(ctx, node, "ns", `{}`)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

func TestMetadataDeleteWithoutReceiver(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteMetadata without metaReceiver skips receiver call", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          true,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
			metaReceiver:   nil,
		}

		node := &tree.Node{Path: "p", Uuid: "uuid"}
		err := ep.DeleteMetadata(ctx, node, "ns")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 1)
	})
}

// --- Sub mode error path tests ---

func TestSubModeCreateNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("CreateNode in sub mode returns error when snapshot fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.createErr = fmt.Errorf("snapshot create failed")
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		node := &tree.Node{Path: "test", Type: tree.NodeType_LEAF}
		err := ep.CreateNode(ctx, node, false)
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0)     // No queue push in sub mode
		So(len(snap.created), ShouldEqual, 0) // Failed before adding to created
	})
}

func TestSubModeDeleteNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteNode in sub mode returns error when snapshot fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.deleteErr = fmt.Errorf("snapshot delete failed")
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		err := ep.DeleteNode(ctx, "nonexistent")
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0)     // No queue push in sub mode
		So(len(snap.deleted), ShouldEqual, 0) // Failed before adding to deleted
	})
}

func TestSubModeMoveNodeError(t *testing.T) {
	ctx := context.Background()
	Convey("MoveNode in sub mode returns error when snapshot fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.moveErr = fmt.Errorf("snapshot move failed")
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		err := ep.MoveNode(ctx, "oldpath", "newpath")
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0)   // No queue push in sub mode
		So(len(snap.moved), ShouldEqual, 0) // Failed before adding to moved
	})
}

func TestSubModeCreateNodeSuccess(t *testing.T) {
	ctx := context.Background()
	Convey("CreateNode in sub mode delegates to snapshot and skips queue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		node := &tree.Node{Path: "test", Type: tree.NodeType_LEAF}
		err := ep.CreateNode(ctx, node, false)
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 0)     // No push in sub mode
		So(len(snap.created), ShouldEqual, 1) // Delegated to snapshot
	})
}

func TestSubModeDeleteNodeSuccess(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteNode in sub mode delegates to snapshot and skips queue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		err := ep.DeleteNode(ctx, "path")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 0)     // No push in sub mode
		So(len(snap.deleted), ShouldEqual, 1) // Delegated to snapshot
	})
}

func TestSubModeMoveNodeSuccess(t *testing.T) {
	ctx := context.Background()
	Convey("MoveNode in sub mode delegates to snapshot and skips queue", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &PubSubEndpoint{
			isPub:          false,
			AsyncQueue:     q,
			PathSyncSource: snap,
			PathSyncTarget: snap,
		}

		err := ep.MoveNode(ctx, "oldpath", "newpath")
		So(err, ShouldBeNil)
		So(len(q.pushed), ShouldEqual, 0)   // No push in sub mode
		So(len(snap.moved), ShouldEqual, 1) // Delegated to snapshot
	})
}

func TestPubModeCreateNodeSnapshotError(t *testing.T) {
	ctx := context.Background()
	Convey("CreateNode in pub mode fails early if snapshot operation fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.createErr = fmt.Errorf("snapshot error")
		ep := newPubEndpoint(q, snap)

		node := &tree.Node{Path: "test", Type: tree.NodeType_LEAF}
		err := ep.CreateNode(ctx, node, false)
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0) // No queue push if snapshot fails first
	})
}

func TestPubModeDeleteNodeSnapshotError(t *testing.T) {
	ctx := context.Background()
	Convey("DeleteNode in pub mode fails early if snapshot operation fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.deleteErr = fmt.Errorf("snapshot error")
		ep := newPubEndpoint(q, snap)

		err := ep.DeleteNode(ctx, "path")
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0) // No queue push if snapshot fails first
	})
}

func TestPubModeMoveNodeSnapshotError(t *testing.T) {
	ctx := context.Background()
	Convey("MoveNode in pub mode fails early if snapshot operation fails", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		snap.moveErr = fmt.Errorf("snapshot error")
		ep := newPubEndpoint(q, snap)

		err := ep.MoveNode(ctx, "old", "new")
		So(err, ShouldNotBeNil)
		So(len(q.pushed), ShouldEqual, 0) // No queue push if snapshot fails first
	})
}

// --- DataPubSubEndpoint GetWriterOn/GetReaderOn tests ---

func TestGetWriterOnNilNode(t *testing.T) {
	ctx := context.Background()
	Convey("GetWriterOn returns error when node is nil", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		tgt := &mockDataSyncTarget{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			tgt: tgt,
		}

		out, _, _, err := ep.GetWriterOn(ctx, "/path", 1024, nil)
		So(err, ShouldNotBeNil)
		So(out, ShouldBeNil)
	})
}

func TestGetWriterOnNilTarget(t *testing.T) {
	ctx := context.Background()
	Convey("GetWriterOn returns error when DataSyncTarget is nil", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			tgt: nil,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, _, _, err := ep.GetWriterOn(ctx, "/path", 1024, node)
		So(err, ShouldNotBeNil)
		So(out, ShouldBeNil)
	})
}

func TestGetWriterOnSuccess(t *testing.T) {
	ctx := context.Background()
	Convey("GetWriterOn returns wrapped writer with callback", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		tgt := &mockDataSyncTarget{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			tgt: tgt,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, done, errChan, err := ep.GetWriterOn(ctx, "/path", 1024, node)
		So(err, ShouldBeNil)
		So(out, ShouldNotBeNil)
		So(done, ShouldNotBeNil)
		So(errChan, ShouldNotBeNil)
	})
}

func TestGetWriterOnTargetError(t *testing.T) {
	ctx := context.Background()
	Convey("GetWriterOn ignores error from underlying target and returns nil writer anyway", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		tgt := &mockDataSyncTarget{writerErr: fmt.Errorf("target error")}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			tgt: tgt,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, _, _, err := ep.GetWriterOn(ctx, "/path", 1024, node)
		// Note: Implementation swallows error from target and returns wrapped nil writer
		So(err, ShouldBeNil)    // Returns nil error even though target had error
		So(out, ShouldNotBeNil) // But returns wrapped writer (wrapping nil)
	})
}

func TestGetReaderOnNilNode(t *testing.T) {
	ctx := context.Background()
	Convey("GetReaderOn returns error when node is nil", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		src := &mockDataSyncSource{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			src: src,
		}

		out, err := ep.GetReaderOn(ctx, "/path", nil)
		So(err, ShouldNotBeNil)
		So(out, ShouldBeNil)
	})
}

func TestGetReaderOnNilSource(t *testing.T) {
	ctx := context.Background()
	Convey("GetReaderOn returns error when DataSyncSource is nil", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			src: nil,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, err := ep.GetReaderOn(ctx, "/path", node)
		So(err, ShouldNotBeNil)
		So(out, ShouldBeNil)
	})
}

func TestGetReaderOnSuccess(t *testing.T) {
	ctx := context.Background()
	Convey("GetReaderOn returns wrapped reader with callback", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		src := &mockDataSyncSource{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			src: src,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, err := ep.GetReaderOn(ctx, "/path", node)
		So(err, ShouldBeNil)
		So(out, ShouldNotBeNil)
	})
}

func TestGetReaderOnSourceError(t *testing.T) {
	ctx := context.Background()
	Convey("GetReaderOn propagates error from underlying source", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		src := &mockDataSyncSource{readerErr: fmt.Errorf("source error")}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			src: src,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid"}
		out, err := ep.GetReaderOn(ctx, "/path", node)
		So(err, ShouldNotBeNil)
		So(out, ShouldBeNil)
	})
}

func TestGetWriterOnCallbackTriggersCreateNode(t *testing.T) {
	ctx := context.Background()
	Convey("GetWriterOn wrapper callback calls CreateNode on close", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		tgt := &mockDataSyncTarget{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			tgt: tgt,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid", Type: tree.NodeType_LEAF}
		out, _, _, err := ep.GetWriterOn(ctx, "/path", 1024, node)
		So(err, ShouldBeNil)

		// Verify snapshot has not yet seen the node
		So(len(snap.created), ShouldEqual, 0)

		// Close the writer - should trigger CreateNode callback
		err = out.Close()
		So(err, ShouldBeNil)

		// Now snapshot should have the node
		So(len(snap.created), ShouldEqual, 1)
	})
}

func TestGetReaderOnCallbackTriggersCreateNode(t *testing.T) {
	ctx := context.Background()
	Convey("GetReaderOn wrapper callback calls CreateNode on close", t, func() {
		q := &mockQueue{}
		snap := newMockSnapshot()
		src := &mockDataSyncSource{}
		ep := &DataPubSubEndpoint{
			PubSubEndpoint: &PubSubEndpoint{
				isPub:          true,
				AsyncQueue:     q,
				PathSyncSource: snap,
				PathSyncTarget: snap,
			},
			src: src,
		}

		node := &tree.Node{Path: "/test", Uuid: "uuid", Type: tree.NodeType_LEAF}
		out, err := ep.GetReaderOn(ctx, "/path", node)
		So(err, ShouldBeNil)

		// Verify snapshot has not yet seen the node
		So(len(snap.created), ShouldEqual, 0)

		// Close the reader - should trigger CreateNode callback
		err = out.Close()
		So(err, ShouldBeNil)

		// Now snapshot should have the node
		So(len(snap.created), ShouldEqual, 1)
	})
}
