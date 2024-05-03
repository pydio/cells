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

package servicecontext

import (
	"context"
	"net/http"

	"google.golang.org/grpc"

	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type spanContextKey struct{}

const (
	SpanMetadataId           = "X-Pydio-Span-Id"
	SpanMetadataRootParentId = "X-Pydio-Span-Root-Id"
	OperationMetadataId      = "X-Pydio-Operation-Id"
)

type Span struct {
	SpanId       string
	ParentId     string
	RootParentId string
}

func NewSpan() *Span {
	return &Span{
		SpanId: uuid.New(),
	}
}

func NewSpanFromParent(s *Span) *Span {
	root := s.RootParentId
	if len(root) == 0 {
		root = s.SpanId
	}
	return &Span{
		SpanId:       uuid.New(),
		ParentId:     s.SpanId,
		RootParentId: root,
	}
}

func WithSpan(ctx context.Context, s *Span) context.Context {
	md := map[string]string{
		SpanMetadataId: s.SpanId,
	}
	if len(s.RootParentId) > 0 {
		md[SpanMetadataRootParentId] = s.RootParentId
	}
	ctx = metadata.WithAdditionalMetadata(ctx, md)
	return context.WithValue(ctx, spanContextKey{}, s)
}

func SpanFromContext(ctx context.Context) (*Span, bool) {
	if val := ctx.Value(spanContextKey{}); val != nil {
		return val.(*Span), true
	} else {
		return nil, false
	}
}

func SpanFromHeader(md map[string]string) (*Span, bool) {
	if md == nil {
		return nil, false
	}
	if id, ok := md[SpanMetadataId]; ok {
		s := &Span{
			SpanId: id,
		}
		if parent, ok := md[SpanMetadataRootParentId]; ok {
			s.RootParentId = parent
		}
		return s, true
	}
	return nil, false
}

func childOrNewSpan(ctx context.Context) context.Context {
	var s *Span
	if parent, ok := SpanFromContext(ctx); ok {
		s = NewSpanFromParent(parent)
	} else if md, ok := metadata.FromContextCopy(ctx); ok {
		if headSpan, okk := SpanFromHeader(md); okk {
			s = NewSpanFromParent(headSpan)
		}
	}
	if s == nil {
		s = NewSpan()
	}
	return WithSpan(ctx, s)
}

func ctxWithOpIdFromMeta(ctx context.Context) context.Context {
	if md, ok := metadata.FromContextRead(ctx); ok {
		if opId, o := md[OperationMetadataId]; o {
			ctx = runtimecontext.WithOperationID(ctx, opId)
		}
	}
	return ctx
}

// SpanUnaryClientInterceptor inserts specific meta in context (will be later to OutgoingContext meta)
func SpanUnaryClientInterceptor() grpc.UnaryClientInterceptor {
	return func(ctx context.Context, method string, req, reply interface{}, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
		//fmt.Println("Client Call", method)
		if _, ok := SpanFromContext(ctx); !ok {
			s := NewSpan()
			ctx = WithSpan(ctx, s)
		}
		if opID, _ := runtimecontext.GetOperationID(ctx); opID != "" {
			ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{OperationMetadataId: opID})
		}

		return invoker(ctx, method, req, reply, cc, opts...)
	}
}

// SpanStreamClientInterceptor inserts specific meta in context (will be later to OutgoingContext meta)
func SpanStreamClientInterceptor() grpc.StreamClientInterceptor {
	return func(ctx context.Context, desc *grpc.StreamDesc, cc *grpc.ClientConn, method string, streamer grpc.Streamer, opts ...grpc.CallOption) (grpc.ClientStream, error) {
		//fmt.Println("Client Stream", method)
		if _, ok := SpanFromContext(ctx); !ok {
			s := NewSpan()
			ctx = WithSpan(ctx, s)
		}
		if opID, _ := runtimecontext.GetOperationID(ctx); opID != "" {
			ctx = metadata.WithAdditionalMetadata(ctx, map[string]string{OperationMetadataId: opID})
		}

		return streamer(ctx, desc, cc, method, opts...)
	}
}

// SpanIncomingContext updates Spans Ids in context
func SpanIncomingContext(ctx context.Context) (context.Context, bool, error) {
	ctx = childOrNewSpan(ctx)
	ctx = ctxWithOpIdFromMeta(ctx)
	return ctx, true, nil
}

/*
// SpanSubscriberWrapper wraps a db connection for each subscriber
func SpanSubscriberWrapper(subscriberFunc server.SubscriberFunc) server.SubscriberFunc {
	return func(ctx context.Context, msg server.Publication) error {
		ctx = childOrNewSpan(ctx)
		ctx = ctxWithOpIdFromMeta(ctx)
		return subscriberFunc(ctx, msg)
	}
}
*/

// HttpWrapperSpan extracts data from request and put it in context Metadata field
func HttpWrapperSpan(ctx context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r = r.WithContext(childOrNewSpan(r.Context()))
		h.ServeHTTP(w, r)
	})
}
