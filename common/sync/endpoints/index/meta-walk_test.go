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

package index

import (
	"context"
	"errors"
	"io"
	"testing"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common/proto/tree"
)

// metaStream answers each ReadNodeRequest with a metadata, or fails on Recv with recvErr
type metaStream struct {
	grpc.ClientStream
	pending []*tree.Node
	recvErr error
}

func (m *metaStream) Send(r *tree.ReadNodeRequest) error {
	m.pending = append(m.pending, r.GetNode())
	return nil
}

func (m *metaStream) Recv() (*tree.ReadNodeResponse, error) {
	if m.recvErr != nil {
		return nil, m.recvErr
	}
	if len(m.pending) == 0 {
		return nil, io.EOF
	}
	n := m.pending[0].Clone()
	m.pending = m.pending[1:]
	n.MetaStore = map[string]string{"usermeta-tags": `"tag"`}
	return &tree.ReadNodeResponse{Node: n}, nil
}

type metaReader struct {
	tree.NodeProviderStreamerClient
	stream *metaStream
}

func (m *metaReader) ReadNodeStream(context.Context, ...grpc.CallOption) (tree.NodeProviderStreamer_ReadNodeStreamClient, error) {
	return m.stream, nil
}

func newTestClientWithMeta(stream *metaStream) *ClientWithMeta {
	p := &listProvider{nodes: []*tree.Node{{Path: "a.txt", Type: tree.NodeType_LEAF, Etag: "e"}}, end: io.EOF}
	return &ClientWithMeta{Client: *NewClient("ds", p, nil, nil), metaReader: &metaReader{stream: stream}}
}

func TestClientWithMetaWalk(t *testing.T) {
	t.Run("metadata are loaded on walked nodes", func(t *testing.T) {
		c := newTestClientWithMeta(&metaStream{})
		var tags string
		var e error
		func() {
			defer func() {
				if r := recover(); r != nil {
					t.Fatalf("Walk panicked: %v", r)
				}
			}()
			e = c.Walk(context.Background(), func(p string, n tree.N, err error) error {
				if err == nil {
					tags = n.GetStringMeta("usermeta-tags")
				}
				return err
			}, "/", true)
		}()
		if e != nil || tags != "tag" {
			t.Fatalf("expected the node metadata, got %q (error %v)", tags, e)
		}
	})

	t.Run("a metadata stream error fails the walk instead of dropping metadata", func(t *testing.T) {
		c := newTestClientWithMeta(&metaStream{recvErr: errors.New("meta service unavailable")})
		var e error
		func() {
			defer func() {
				if r := recover(); r != nil {
					t.Fatalf("Walk panicked: %v", r)
				}
			}()
			e = c.Walk(context.Background(), func(p string, n tree.N, err error) error { return err }, "/", true)
		}()
		if e == nil {
			t.Fatal("a metadata stream error should be reported")
		}
	})
}
