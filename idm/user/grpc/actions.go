package grpc

import (
	"context"
	"fmt"
	"time"

	"github.com/pydio/cells/common/forms"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	DeleteUsersActionName = "actions.idm.users.delete"
)

type DeleteUsersAction struct {
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

func (a *DeleteUsersAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	a.params = action.Parameters
	return nil
}

func (a *DeleteUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

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
	q, _ := ptypes.MarshalAny(singleQ)
	uCl := idm.NewUserServiceClient(registry.GetClient(common.ServiceUser))
	_, e := uCl.DeleteUser(ctx, &idm.DeleteUserRequest{Query: &service.Query{SubQueries: []*any.Any{q}}}, client.WithRequestTimeout(30*time.Minute))
	if e != nil {
		input = input.WithError(e)
	} else {
		input.AppendOutput(&jobs.ActionOutput{
			Success: true,
		})
	}
	return input, nil
}
