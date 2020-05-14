package actions

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/pydio/cells/common/forms"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/etl/models"
	"github.com/pydio/cells/common/etl/stores"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/scheduler/actions"
)

type SyncWorkspacesAction struct {
	etlAction
}

var (
	SyncWorkspacesActionName = "actions.etl.p8-workspaces"
)

// Unique identifier
func (c *SyncWorkspacesAction) GetName() string {
	return SyncWorkspacesActionName
}

func (c *SyncWorkspacesAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              SyncWorkspacesActionName,
		Label:           "Sync. workspaces",
		Icon:            "",
		Description:     "Diff and merge workspaces from stores",
		Category:        actions.ActionCategoryETL,
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (c *SyncWorkspacesAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "left",
					Type:        forms.ParamString,
					Label:       "Left store",
					Description: "Type of left users store",
				},
				&forms.FormField{
					Name:        "right",
					Type:        forms.ParamString,
					Label:       "Right store",
					Description: "Type of right users store",
				},
				&forms.FormField{
					Name:        "splitUserRoles",
					Type:        forms.ParamString,
					Label:       "Split users and roles",
					Description: "Sequentially import users then roles",
				},
				&forms.FormField{
					Name:        "cellAdmin",
					Type:        forms.ParamString,
					Label:       "Cells admin",
					Description: "Login of cells administrator",
				},
			},
		},
	}}
}

// Pass parameters
func (c *SyncWorkspacesAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if err := c.parseStores(action.Parameters); err != nil {
		return err
	}
	if _, ok := action.Parameters["cellAdmin"]; !ok {
		return fmt.Errorf("task workspaces must take a cellAdmin parameter")
	}
	return nil
}

func (c *SyncWorkspacesAction) migratePydio8(ctx context.Context, mapping map[string]string, progress chan etl.MergeOperation) {

	options := stores.CreateOptions(c.params)
	left, err := stores.LoadReadableStore(c.leftType, options)
	if err != nil {
		progress <- etl.MergeOperation{Error: err}
		return
	}

	right, err := stores.LoadWritableStore(c.rightType, options)
	if err != nil {
		progress <- etl.MergeOperation{Error: err}
		return
	}

	// First we retrieve the acls from the cells store
	acls, _ := right.ListACLs(ctx, nil)

	type info struct {
		WorkspaceID string
		NodeID      string
	}
	// From that list we get workspace pathes
	wsMapping := make(map[string]info)
	for _, acl := range acls {
		if acl.Action.Name == "workspace-path" {
			if v, ok := mapping[acl.WorkspaceID]; ok {
				wsMapping[v] = info{
					WorkspaceID: acl.WorkspaceID,
					NodeID:      acl.NodeID,
				}
			}
		}
	}

	var pydio8ACLs []*idm.ACL

	// All groups must already have been migrated
	apiGroups, er := right.ListGroups(ctx, nil)
	if er != nil {
		progress <- etl.MergeOperation{Error: er}
	} else {
		progress <- etl.MergeOperation{Description: "Loaded all groups for syncing ACLs"}
		for i, apiGroup := range apiGroups {
			pydio8GroupACLs, _ := left.ListACLs(ctx, map[string]interface{}{
				"path":   "AJXP_GRP_/" + apiGroup.GetGroupLabel(),
				"roleID": apiGroup.GetUuid(),
			})

			for _, acl := range pydio8GroupACLs {
				if a, ok := wsMapping[acl.GetWorkspaceID()]; ok {
					acl.RoleID = apiGroup.GetUuid()
					acl.WorkspaceID = a.WorkspaceID
					acl.NodeID = a.NodeID
					pydio8ACLs = append(pydio8ACLs, acl)
				}
			}
			progress <- etl.MergeOperation{
				Description: "Loaded ACLs for group " + apiGroup.GetGroupLabel(),
				Cursor:      i,
				Total:       len(apiGroups),
			}
		}
	}

	// All groups must already have been migrated
	apiUsers, err := right.ListUsers(ctx, nil, nil)
	if err != nil {
		progress <- etl.MergeOperation{Error: err}
	} else {
		progress <- etl.MergeOperation{Description: "Loading all users roles for syncing ACLs"}
		var i int
		for _, apiUser := range apiUsers {
			if apiUser.GetLogin() == c.params["cellAdmin"] {
				// Manually make sure that cellAdmin has access to all workspaces
				for wsId, wsInfo := range wsMapping {
					pydio8ACLs = append(pydio8ACLs, &idm.ACL{
						RoleID:      apiUser.GetUuid(),
						WorkspaceID: wsId,
						NodeID:      wsInfo.NodeID,
						Action:      permissions.AclRead,
					}, &idm.ACL{
						RoleID:      apiUser.GetUuid(),
						WorkspaceID: wsId,
						NodeID:      wsInfo.NodeID,
						Action:      permissions.AclWrite,
					})
				}
			} else {
				leftUsersACLs, _ := left.ListACLs(ctx, map[string]interface{}{
					"path":   "AJXP_USR_/" + apiUser.GetLogin(),
					"roleID": apiUser.GetUuid(),
				})

				for _, acl := range leftUsersACLs {
					if a, ok := wsMapping[acl.GetWorkspaceID()]; ok {
						acl.RoleID = apiUser.GetUuid()
						acl.WorkspaceID = a.WorkspaceID
						acl.NodeID = a.NodeID
						pydio8ACLs = append(pydio8ACLs, acl)
					}
				}
			}
			progress <- etl.MergeOperation{
				Description: "Loaded ACLs for user " + apiUser.GetLogin(),
				Cursor:      i,
				Total:       len(apiUsers),
			}
			i++
		}
	}

	// We pass a nil readableStore as we are not loading teams and it will not be used
	apiRoles, e := right.ListRoles(ctx, nil, map[string]interface{}{})
	if e != nil {
		progress <- etl.MergeOperation{Error: e}
	} else {
		progress <- etl.MergeOperation{Description: "Loading all roles for syncing ACLs"}
		for i, apiRole := range apiRoles {
			leftRolesAcls, _ := left.ListACLs(ctx, map[string]interface{}{
				"path":   apiRole.GetUuid(),
				"roleID": apiRole.GetUuid(),
			})
			log.Logger(ctx).Info("Loaded ACLs for role "+apiRole.GetUuid(), zap.Any("acls", leftRolesAcls))
			for _, acl := range leftRolesAcls {
				if a, ok := wsMapping[acl.GetWorkspaceID()]; ok {
					acl.RoleID = apiRole.GetUuid()
					acl.WorkspaceID = a.WorkspaceID
					acl.NodeID = a.NodeID
					pydio8ACLs = append(pydio8ACLs, acl)
				}
			}
			progress <- etl.MergeOperation{
				Description: "Loaded ACLs for role " + apiRole.GetLabel(),
				Cursor:      i,
				Total:       len(apiRoles),
			}
		}
	}

	merger := etl.NewMerger(left, right, &models.MergeOptions{})
	defer merger.Close()

	aclsDiff := new(models.ACLDiff)
	merger.Diff(pydio8ACLs, acls, aclsDiff)
	log.Logger(ctx).Info("After merge ACLs", zap.Any("add", aclsDiff.ToAdd()))
	merger.Save(ctx, aclsDiff, progress)
}

// Run the actual action code
func (c *SyncWorkspacesAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	channels.StatusMsg <- "Initializing workspaces list for diff/merge..."

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error

	go func() {
		for {
			select {
			case op := <-progress:
				channels.StatusMsg <- op.Description
				if op.Total > 0 {
					channels.Progress <- float32(op.Cursor) / float32(op.Total)
				}

				if op.Error != nil {
					pgErrors = append(pgErrors, op.Error)
				}
			case <-finished:
				return
			}
		}
	}()

	var mapping map[string]string
	mappingJSON, ok := c.params["mapping"]
	if !ok {
		return input, fmt.Errorf("missing mapping parameter")
	}
	if err := json.Unmarshal([]byte(mappingJSON), &mapping); err != nil {
		return input, err
	}

	c.migratePydio8(ctx, mapping, progress)

	finished <- true

	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Succesfully synced workspaces",
	})

	var gE error
	if len(pgErrors) > 0 {
		gE = pgErrors[0]
		for _, err := range pgErrors {
			output = output.WithError(err)
		}
	}
	return output, gE
}
