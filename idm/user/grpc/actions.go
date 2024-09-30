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

func init() {
	actions.GetActionsManager().Register(DeleteUsersActionName, func() actions.ConcreteAction {
		return &DeleteUsersAction{}
	})
}

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
		Description:     "Batch-delete users and groups, based on parameters. Used internally when deleting groups. Prefer 'Delete Identity Data' action for more flexible input.",
		SummaryTemplate: "",
		Category:        actions.ActionCategoryIDM,
		HasForm:         true,
		IsInternal:      true,
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
		singleQ.Login = jobs.EvaluateFieldStr(ctx, input, login)
	} else if gPath, ok := a.params["groupPath"]; ok {
		singleQ.GroupPath = jobs.EvaluateFieldStr(ctx, input, gPath)
		singleQ.Recursive = true
	}

	if singleQ.Login == "" && singleQ.GroupPath == "" {
		return input.AsRunError(fmt.Errorf("params must provide either login or groupPath"))
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
