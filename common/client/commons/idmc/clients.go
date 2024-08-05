package idmc

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/proto/idm"
)

// UserServiceClient provides a resolved idm.UserServiceClient pointing to ServiceUser by default
func UserServiceClient(ctx context.Context, opt ...grpc.Option) idm.UserServiceClient {
	return idm.NewUserServiceClient(grpc.ResolveConn(ctx, common.ServiceUserGRPC, opt...))
}

// RoleServiceClient provides a resolved idm.RoleServiceClient pointing to ServiceRole by default
func RoleServiceClient(ctx context.Context, opt ...grpc.Option) idm.RoleServiceClient {
	return idm.NewRoleServiceClient(grpc.ResolveConn(ctx, common.ServiceRoleGRPC, opt...))
}

// WorkspaceServiceClient provides a resolved idm.WorkspaceServiceClient pointing to ServiceWorkspace by default
func WorkspaceServiceClient(ctx context.Context, opt ...grpc.Option) idm.WorkspaceServiceClient {
	return idm.NewWorkspaceServiceClient(grpc.ResolveConn(ctx, common.ServiceWorkspaceGRPC, opt...))
}

// ACLServiceClient provides a resolved idm.ACLServiceClient pointing to ServiceAcl by default
func ACLServiceClient(ctx context.Context, opt ...grpc.Option) idm.ACLServiceClient {
	return idm.NewACLServiceClient(grpc.ResolveConn(ctx, common.ServiceAclGRPC, opt...))
}

// UserMetaServiceClient provides a resolved idm.UserMetaServiceClient pointing to ServiceUserMeta by default
func UserMetaServiceClient(ctx context.Context, opt ...grpc.Option) idm.UserMetaServiceClient {
	return idm.NewUserMetaServiceClient(grpc.ResolveConn(ctx, common.ServiceUserMetaGRPC, opt...))
}
