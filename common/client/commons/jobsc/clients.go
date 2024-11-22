package jobsc

import (
	"context"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/jobs"
)

// JobServiceClient provides a resolved jobs.JobServiceClient pointing to ServiceJobs by default
func JobServiceClient(ctx context.Context, opt ...grpc.Option) jobs.JobServiceClient {
	return jobs.NewJobServiceClient(grpc.ResolveConn(ctx, common.ServiceJobsGRPC, opt...))
}
