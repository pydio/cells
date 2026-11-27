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
	"errors"
	"testing"
	"time"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/sync/model"
)

// blockingChangesFactory serves change streams that block until their context is cancelled.
type blockingChangesFactory struct {
	clientProviderFactory
}

func (blockingChangesFactory) GetNodeChangesStreamClient(ctx context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	return ctx, blockingStreamer{}, nil
}

type blockingStreamer struct{}

func (blockingStreamer) StreamChanges(ctx context.Context, _ *tree.StreamChangesRequest, _ ...grpc.CallOption) (tree.NodeChangesStreamer_StreamChangesClient, error) {
	return &blockingStream{ctx: ctx}, nil
}

type blockingStream struct {
	grpc.ClientStream
	ctx context.Context
}

func (s *blockingStream) Recv() (*tree.NodeChangeEvent, error) {
	<-s.ctx.Done()
	return nil, s.ctx.Err()
}

func (s *blockingStream) CloseSend() error { return nil }

// Two watches on the same endpoint (watchers restarted without being stopped): stopping them
// closed the endpoint's current watchConn twice (panic: close of closed channel).
func TestWatchTwiceThenStop(t *testing.T) {
	c := &Abstract{Factory: blockingChangesFactory{}, GlobalCtx: context.Background()}
	var watches []*model.WatchObject
	for i := 0; i < 2; i++ {
		w, err := c.Watch(context.Background(), "")
		if err != nil {
			t.Fatal(err)
		}
		<-w.ConnectionInfo // connected
		watches = append(watches, w)
	}
	for _, w := range watches {
		w.DoneChan <- true
	}
	// Each watch closes its own connection channel, once.
	for i, w := range watches {
		select {
		case _, ok := <-w.ConnectionInfo:
			if ok {
				t.Fatalf("watch %d: unexpected connection info after stop", i)
			}
		case <-time.After(2 * time.Second):
			t.Fatalf("watch %d: connection channel not closed after stop", i)
		}
	}
}

// failingChangesFactory cannot reach the server, like remoteClientFactory: nil context and an error.
type failingChangesFactory struct {
	clientProviderFactory
}

func (failingChangesFactory) GetNodeChangesStreamClient(context.Context) (context.Context, tree.NodeChangesStreamerClient, error) {
	return nil, nil, errors.New("dial tcp 127.0.0.1:8080: connect: connection refused")
}

// Watching an unreachable server: reporting the error used the factory's nil context (panic: nil
// pointer dereference in receiveEvents). The watch must report a disconnection and stop cleanly.
func TestWatchServerUnreachable(t *testing.T) {
	c := &Abstract{Factory: failingChangesFactory{}, GlobalCtx: context.Background()}
	w, err := c.Watch(context.Background(), "")
	if err != nil {
		t.Fatal(err)
	}
	select {
	case info := <-w.ConnectionInfo:
		if info != model.WatchDisconnected {
			t.Fatalf("got %v, want WatchDisconnected", info)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("no disconnection reported")
	}
	w.DoneChan <- true
	select {
	case <-w.ConnectionInfo:
	case <-time.After(2 * time.Second):
		t.Fatal("connection channel not closed after stop")
	}
}
