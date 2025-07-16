package idm

import (
	"context"
	"fmt"
	"time"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/idmc"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	cleanACLName = "actions.idm.clean-expired-acl"
)

type CleanExpiredACLAction struct {
	common.RuntimeHolder
	expiredAfter  string
	expiredBefore string
}

// GetDescription returns action description
func (c *CleanExpiredACLAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:               cleanACLName,
		IsInternal:       true,
		Label:            "Expired ACLs clean up",
		Icon:             "account",
		Category:         actions.ActionCategoryIDM,
		Description:      "Definitely remove Expired ACLs",
		InputDescription: "",
		SummaryTemplate:  "",
		HasForm:          true,
	}
}

// GetParametersForm returns a UX form
func (c *CleanExpiredACLAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "expiredAfter",
					Type:        forms.ParamString,
					Label:       "Selection Start",
					Description: "Timestamp, or duration subtracted from current time",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "expiredBefore",
					Type:        forms.ParamString,
					Label:       "Selection End",
					Description: "Timestamp, or duration subtracted from current time",
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName provides unique identifier
func (c *CleanExpiredACLAction) GetName() string {
	return cleanUserDataName
}

// Init passes parameters
func (c *CleanExpiredACLAction) Init(job *jobs.Job, action *jobs.Action) error {
	if ea, o := action.Parameters["expiredAfter"]; o {
		c.expiredAfter = ea
	}
	if eb, o := action.Parameters["expiredBefore"]; o {
		c.expiredBefore = eb
	}
	return nil
}

// Run perform actual action code
func (c *CleanExpiredACLAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	req := &idm.DeleteACLRequest{}
	if ea, err := jobs.EvaluateFieldInt64(ctx, input, c.expiredAfter); err == nil && ea > 0 {
		req.ExpiredAfter = ea
	} else if d, er := time.ParseDuration(jobs.EvaluateFieldStr(ctx, input, c.expiredAfter)); er == nil {
		req.ExpiredAfter = time.Now().Add(-d).Unix()
	}
	if eb, err := jobs.EvaluateFieldInt64(ctx, input, c.expiredBefore); err == nil && eb > 0 {
		req.ExpiredBefore = eb
	} else if d, er := time.ParseDuration(jobs.EvaluateFieldStr(ctx, input, c.expiredBefore)); er == nil {
		req.ExpiredBefore = time.Now().Add(-d).Unix()
	}

	if req.ExpiredAfter == 0 && req.ExpiredBefore == 0 {
		e := errors.New("please provide at least one parameter")
		return input.WithError(e), e
	}

	aclClient := idmc.ACLServiceClient(ctx)
	resp, e := aclClient.DeleteACL(ctx, req)
	if e != nil {
		return input.WithError(e), e
	}
	if resp.GetRowsDeleted() > 0 {

		log.TasksLogger(ctx).Info(fmt.Sprintf("Definitely deleted %d ACLs (period %v-%v)", resp.GetRowsDeleted(), time.Unix(req.ExpiredAfter, 0), time.Unix(req.ExpiredBefore, 0)))
	} else {
		log.TasksLogger(ctx).Info(fmt.Sprintf("Nothing to delete for period %v-%v", time.Unix(req.ExpiredAfter, 0), time.Unix(req.ExpiredBefore, 0)))

	}

	return input, nil
}
