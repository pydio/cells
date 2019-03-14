// Package context manipulates context metadata
package context

import (
	"context"
	"net/http"
	"strings"

	"github.com/micro/go-micro/metadata"
	"golang.org/x/net/http/httpguts"

	"github.com/pydio/cells/common"
)

// MinioMetaFromContext prepares metadata for minio client, merging context medata
// and eventually the Context User Key value (X-Pydio-User). Used to prepare metadata
// sent by Minio Clients
func MinioMetaFromContext(ctx context.Context) (md map[string]string, ok bool) {
	md = make(map[string]string)
	if meta, mOk := metadata.FromContext(ctx); mOk {
		for k, v := range meta {
			if httpguts.ValidHeaderFieldName(k) && httpguts.ValidHeaderFieldValue(v) {
				md[k] = v
			}
		}
	}
	if user := ctx.Value(common.PYDIO_CONTEXT_USER_KEY); user != nil {
		md[common.PYDIO_CONTEXT_USER_KEY] = user.(string)
	}
	return md, len(md) > 0
}

// AppendCellsMetaFromContext extract valid header names from context and push them
// to the request Headers
func AppendCellsMetaFromContext(ctx context.Context, req *http.Request) {
	if meta, ok := MinioMetaFromContext(ctx); ok {
		for k, v := range meta {
			if strings.ToLower(k) == "authorization" {
				continue
			}
			if httpguts.ValidHeaderFieldName(k) && httpguts.ValidHeaderFieldValue(v) {
				req.Header.Set(k, v)
			}
		}
	}
}

// WithUserNameMetadata appends a user name to both the context metadata and as context key.
func WithUserNameMetadata(ctx context.Context, userName string) context.Context {
	md := make(map[string]string)
	if meta, ok := metadata.FromContext(ctx); ok {
		for k, v := range meta {
			md[k] = v
		}
	}
	md[common.PYDIO_CONTEXT_USER_KEY] = userName
	ctx = metadata.NewContext(ctx, md)
	// Add it as value for easier use inside the gateway, but this will not be transmitted
	ctx = context.WithValue(ctx, common.PYDIO_CONTEXT_USER_KEY, userName)
	return ctx
}

// ContextMetadata wraps micro lib metadata.FromContext call
func ContextMetadata(ctx context.Context) (map[string]string, bool) {
	return metadata.FromContext(ctx)
}

// WithMetadata wraps micro lib metadata.NewContext call
func WithMetadata(ctx context.Context, md map[string]string) context.Context {
	return metadata.NewContext(ctx, md)
}

// WithAdditionalMetadata retrieves existing meta, adds new key/values to the map and produces a new context
func WithAdditionalMetadata(ctx context.Context, meta map[string]string) context.Context {
	md := make(map[string]string)
	if meta, ok := metadata.FromContext(ctx); ok {
		for k, v := range meta {
			md[k] = v
		}
	}
	for k, v := range meta {
		md[k] = v
	}
	return metadata.NewContext(ctx, md)
}
