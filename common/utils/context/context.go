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
			md[k] = v
		}
	}
	if user := ctx.Value(common.PYDIO_CONTEXT_USER_KEY); user != nil {
		md[common.PYDIO_CONTEXT_USER_KEY] = user.(string)
	}
	return md, len(md) > 0
}

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
