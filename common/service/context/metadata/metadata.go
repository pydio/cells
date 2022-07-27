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

package metadata

import (
	"context"
	"strings"

	"golang.org/x/net/http/httpguts"

	"github.com/pydio/cells/v4/common"
)

type metadataKey struct{}
type Metadata map[string]string

// FromContextCopy returns as COPY of the internal metadata, that can be subsequently modified
func FromContextCopy(ctx context.Context) (Metadata, bool) {
	return fromContextCopy(ctx)
}

// FromContextRead returns internal metadata as is. Beware of not modifying it to avoid r/w concurrent access,
// in that case you must use FromContextCopy instead.
func FromContextRead(ctx context.Context) (Metadata, bool) {
	return fromContext(ctx)
}

func fromContext(ctx context.Context) (Metadata, bool) {
	val := ctx.Value(metadataKey{})
	if val == nil {
		return nil, false
	}
	md, ok := ctx.Value(metadataKey{}).(Metadata)
	return md, ok
}

func fromContextCopy(ctx context.Context) (Metadata, bool) {
	md, ok := ctx.Value(metadataKey{}).(Metadata)
	if !ok {
		return nil, ok
	}

	// copy
	mm := make(Metadata, len(md))
	for k, v := range md {
		mm[k] = v
	}
	return mm, ok
}

func NewContext(ctx context.Context, md map[string]string) context.Context {
	// Make sure that keys are ok
	for k, v := range md {
		if k != strings.Title(k) {
			delete(md, k)
			md[strings.Title(k)] = v
		}
	}
	return context.WithValue(ctx, metadataKey{}, Metadata(md))
}

// MinioMetaFromContext prepares metadata for minio client, merging context medata
// and eventually the Context User Key value (X-Pydio-User). Used to prepare metadata
// sent by Minio Clients
func MinioMetaFromContext(ctx context.Context, validHeadersOnly bool) (md map[string]string, ok bool) {
	md = make(map[string]string)
	if meta, mOk := fromContext(ctx); mOk {
		for k, v := range meta {
			if validHeadersOnly && strings.HasPrefix(strings.ToLower(k), "x-pydio") {
				continue
			}
			if strings.ToLower(k) == "x-pydio-claims" {
				continue
			}
			if httpguts.ValidHeaderFieldName(k) && httpguts.ValidHeaderFieldValue(v) {
				md[k] = v
			}
		}
	}
	if user := ctx.Value(common.PydioContextUserKey); user != nil && !validHeadersOnly {
		md[common.PydioContextUserKey] = user.(string)
	}
	return md, len(md) > 0
}

// WithUserNameMetadata appends a user name to both the context metadata and as context key.
func WithUserNameMetadata(ctx context.Context, userName string) context.Context {
	md := make(map[string]string)
	if meta, ok := fromContext(ctx); ok {
		for k, v := range meta {
			//k = strings.Title(k)
			if strings.EqualFold(k, common.PydioContextUserKey) {
				continue
			}
			md[k] = v
		}
	}
	md[common.PydioContextUserKey] = userName
	ctx = NewContext(ctx, md)
	// Add it as value for easier use inside the gateway, but this will not be transmitted
	ctx = context.WithValue(ctx, common.PydioContextUserKey, userName)
	return ctx
}

// CanonicalMeta extract header name or its lowercase version
func CanonicalMeta(ctx context.Context, name string) (string, bool) {
	if md, o := fromContext(ctx); o {
		if val, ok := md[strings.Title(name)]; ok {
			return val, true
		}
	}
	return "", false
}

// WithAdditionalMetadata retrieves existing meta, adds new key/values to the map and produces a new context
// It enforces case-conflicts on all keys
func WithAdditionalMetadata(ctx context.Context, meta map[string]string) context.Context {
	md := make(map[string]string)
	if mm, ok := fromContext(ctx); ok {
		for k, v := range mm {
			ignore := false
			for nk := range meta {
				if strings.EqualFold(nk, k) {
					ignore = true
					break
				}
			}
			if ignore {
				continue
			}
			md[k] = v
		}
	}
	for k, v := range meta {
		md[k] = v
	}
	return NewContext(ctx, md)
}

func NewBackgroundWithUserKey(userName string) context.Context {
	return NewContext(context.Background(), map[string]string{
		common.PydioContextUserKey: userName,
	})
}

func NewBackgroundWithMetaCopy(ctx context.Context) context.Context {
	bgCtx := context.Background()
	if ctxMeta, ok := fromContextCopy(ctx); ok {
		bgCtx = NewContext(bgCtx, ctxMeta)
	}
	return bgCtx
}
