package docstorec

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/docstore"
)

// DocStoreClient provides a default client for common.ServiceDocStore
func DocStoreClient(ctx context.Context, opt ...grpc.Option) docstore.DocStoreClient {
	return docstore.NewDocStoreClient(grpc.ResolveConn(ctx, common.ServiceDocStoreGRPC, opt...))
}
