package idm

import (
	"context"
	"fmt"
	"strings"

	"github.com/pydio/cells/common/log"
	"go.uber.org/zap"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	StoreActionName = "actions.idm.store"
)

type StoreAction struct {
	inputStoreType []string
	updateIfExists bool
	cl             client.Client
}

// GetName returns action name
func (i *StoreAction) GetName() string {
	return StoreActionName
}

// Init parses and validate parameters
func (i *StoreAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if s, ok := action.Parameters["objectTypes"]; !ok {
		return fmt.Errorf("please provide at least one objectType (comma-separated) of User, Acl, Role, Workspace")
	} else {
		i.inputStoreType = strings.Split(s, ",")
		for k, v := range i.inputStoreType {
			i.inputStoreType[k] = strings.TrimSpace(v)
		}
	}
	if b, ok := action.Parameters["updateIfExists"]; ok && b == "true" {
		i.updateIfExists = true
	}
	i.cl = cl
	return nil
}

// Run applies action by creating/updating Idm Inputs
func (i *StoreAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	output := input
	for _, t := range i.inputStoreType {
		switch t {
		case "User":
			log.Logger(ctx).Info("Idm Store Action, storing Users", zap.Int("number", len(input.Users)))
			if len(input.Users) > 0 {
				if uu, e := i.storeUsers(ctx, input.Users); e != nil {
					output = output.WithError(e)
				} else {
					output.Users = uu
				}
			}
		case "Role":
			log.Logger(ctx).Info("Idm Store Action, storing Roles", zap.Int("number", len(input.Roles)))
			if len(input.Roles) > 0 {
				if uu, e := i.storeRoles(ctx, input.Roles); e != nil {
					output = output.WithError(e)
				} else {
					output.Roles = uu
				}
			}
		case "Workspace":
			log.Logger(ctx).Info("Idm Store Action, storing Workspace", zap.Int("number", len(input.Workspaces)))
			if len(input.Workspaces) > 0 {
				if uu, e := i.storeWorkspaces(ctx, input.Workspaces); e != nil {
					output = output.WithError(e)
				} else {
					output.Workspaces = uu
				}
			}
		case "Acl":
			log.Logger(ctx).Info("Idm Store Action, storing Acl", zap.Int("number", len(input.Acls)))
			if len(input.Acls) > 0 {
				if uu, e := i.storeACLs(ctx, input.Acls); e != nil {
					output = output.WithError(e)
				} else {
					output.Acls = uu
				}
			}
		default:
			break
		}
	}
	return output, nil
}

func (i *StoreAction) storeUsers(ctx context.Context, users []*idm.User) (newUsers []*idm.User, er error) {
	uc := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, i.cl)
	for _, u := range users {
		if r, e := uc.CreateUser(ctx, &idm.CreateUserRequest{User: u}); e != nil {
			er = e
			return
		} else {
			newUsers = append(newUsers, r.User)
		}
	}
	return
}

func (i *StoreAction) storeWorkspaces(ctx context.Context, objects []*idm.Workspace) (stored []*idm.Workspace, er error) {
	wc := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, i.cl)
	for _, w := range objects {
		if r, e := wc.CreateWorkspace(ctx, &idm.CreateWorkspaceRequest{Workspace: w}); e != nil {
			er = e
			return
		} else {
			stored = append(stored, r.Workspace)
		}
	}
	return
}

func (i *StoreAction) storeRoles(ctx context.Context, objects []*idm.Role) (stored []*idm.Role, er error) {
	rc := idm.NewRoleServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ROLE, i.cl)
	for _, role := range objects {
		if r, e := rc.CreateRole(ctx, &idm.CreateRoleRequest{Role: role}); e != nil {
			er = e
			return
		} else {
			stored = append(stored, r.Role)
		}
	}
	return
}

func (i *StoreAction) storeACLs(ctx context.Context, objects []*idm.ACL) (stored []*idm.ACL, er error) {
	ac := idm.NewACLServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_ACL, i.cl)
	for _, acl := range objects {
		if r, e := ac.CreateACL(ctx, &idm.CreateACLRequest{ACL: acl}); e != nil {
			er = e
			return
		} else {
			stored = append(stored, r.ACL)
		}
	}
	return
}
