package idm

import (
	"context"
	"fmt"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	DeleteActionName = "actions.idm.delete"
)

type DeleteAction struct {
	inputStoreType []string
	cl             client.Client
}

// GetName returns action name
func (i *DeleteAction) GetName() string {
	return DeleteActionName
}

// Init parses and validate parameters
func (i *DeleteAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if s, ok := action.Parameters["objectTypes"]; !ok {
		return fmt.Errorf("please provide at least one objectType (comma-separated) of user, acl, role, workspace")
	} else {
		i.inputStoreType = strings.Split(s, ",")
		for k, v := range i.inputStoreType {
			i.inputStoreType[k] = strings.TrimSpace(v)
		}
	}
	i.cl = cl
	return nil
}

// Run applies action by deleting Idm Inputs
func (i *DeleteAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	output := input
	for _, t := range i.inputStoreType {
		switch t {
		case "User":
			if len(input.Users) > 0 {
				if e := i.deleteUsers(ctx, input.Users); e != nil {
					output = output.WithError(e)
				}
				output.Users = nil
			}
		case "Role":
			if len(input.Roles) > 0 {
				if e := i.deleteRoles(ctx, input.Roles); e != nil {
					output = output.WithError(e)
				}
				output.Roles = nil
			}
		case "Workspace":
			if len(input.Workspaces) > 0 {
				if e := i.deleteWorkspaces(ctx, input.Workspaces); e != nil {
					output = output.WithError(e)
				}
				output.Workspaces = nil
			}
		case "Acl":
			if len(input.Acls) > 0 {
				if e := i.deleteACLs(ctx, input.Acls); e != nil {
					output = output.WithError(e)
				}
				output.Acls = nil
			}
		default:
			break
		}
	}
	return output, nil
}

// Delete users by their UUID
func (i *DeleteAction) deleteUsers(ctx context.Context, users []*idm.User) error {
	uc := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, i.cl)
	var qq []*any.Any
	for _, u := range users {
		q, _ := ptypes.MarshalAny(&idm.UserSingleQuery{Uuid: u.Uuid})
		qq = append(qq, q)
	}
	_, e := uc.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{
		SubQueries: qq,
		Operation:  service.OperationType_OR,
	}})
	return e
}

func (i *DeleteAction) deleteWorkspaces(ctx context.Context, objects []*idm.Workspace) error {
	wc := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, i.cl)
	var qq []*any.Any
	for _, u := range objects {
		q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{Uuid: u.UUID})
		qq = append(qq, q)
	}
	_, e := wc.DeleteWorkspace(ctx, &idm.DeleteWorkspaceRequest{Query: &service.Query{
		SubQueries: qq,
		Operation:  service.OperationType_OR,
	}})
	return e
}

func (i *DeleteAction) deleteRoles(ctx context.Context, objects []*idm.Role) error {
	rc := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, i.cl)
	var ids []string
	for _, o := range objects {
		ids = append(ids, o.Uuid)
	}
	q, _ := ptypes.MarshalAny(&idm.RoleSingleQuery{Uuid: ids})
	_, e := rc.DeleteRole(ctx, &idm.DeleteRoleRequest{Query: &service.Query{
		SubQueries: []*any.Any{q},
		Operation:  service.OperationType_OR,
	}})
	return e
}

func (i *DeleteAction) deleteACLs(ctx context.Context, objects []*idm.ACL) error {
	ac := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, i.cl)
	var qq []*any.Any
	for _, u := range objects {
		q, _ := ptypes.MarshalAny(&idm.ACLSingleQuery{
			NodeIDs:      []string{u.NodeID},
			RoleIDs:      []string{u.RoleID},
			WorkspaceIDs: []string{u.WorkspaceID},
		})
		qq = append(qq, q)
	}
	_, e := ac.DeleteACL(ctx, &idm.DeleteACLRequest{Query: &service.Query{
		SubQueries: qq,
		Operation:  service.OperationType_OR,
	}})
	return e
}
