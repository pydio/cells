package grpc

import (
	"context"
	"fmt"
	"time"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/idmc"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	DeleteUsersActionName = "actions.idm.users.delete"
)

type DeleteUsersAction struct {
	common.RuntimeHolder
	task   *jobs.Task
	params map[string]string
}

func (a *DeleteUsersAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              DeleteUsersActionName,
		Label:           "Remove Users",
		Icon:            "account-off",
		Description:     "Batch-delete users and groups, based on login or group path. Use one of the parameters.",
		SummaryTemplate: "",
		Category:        actions.ActionCategoryIDM,
		HasForm:         true,
	}
}

func (a *DeleteUsersAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{{Fields: []forms.Field{
		&forms.FormField{
			Name:        "login",
			Type:        forms.ParamString,
			Label:       "Login",
			Description: "Specific user login",
		},
		&forms.FormField{
			Name:        "groupPath",
			Type:        forms.ParamString,
			Label:       "groupPath",
			Description: "Path to group (all users and groups will be deleted)",
		},
	}}}}
}

func (a *DeleteUsersAction) GetName() string {
	return DeleteUsersActionName
}

// SetTask implements TaskUpdaterDelegateAction as the target
// service will update the task status on its side.
func (a *DeleteUsersAction) SetTask(task *jobs.Task) {
	a.task = task
}

func (a *DeleteUsersAction) ProvidesProgress() bool {
	return true
}

func (a *DeleteUsersAction) Init(job *jobs.Job, action *jobs.Action) error {
	a.params = action.Parameters
	return nil
}

func (a *DeleteUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	singleQ := &idm.UserSingleQuery{}
	if login, ok := a.params["login"]; ok {
		singleQ.Login = login
	} else if gPath, ok := a.params["groupPath"]; ok {
		singleQ.GroupPath = gPath
		singleQ.Recursive = true
	} else {
		e := fmt.Errorf("params must provide either login or groupPath")
		return input.WithError(e), e
	}
	q, _ := anypb.New(singleQ)
	uCl := idmc.UserServiceClient(ctx, grpc.WithCallTimeout(30*time.Minute))
	_, e := uCl.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{SubQueries: []*anypb.Any{q}}})
	if e != nil {
		input = input.WithError(e)
	} else {
		input.AppendOutput(&jobs.ActionOutput{
			Success: true,
		})
	}
	return input, nil
}
