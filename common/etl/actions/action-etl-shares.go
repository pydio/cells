package actions

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

type syncShareLoadedUser struct {
	accessList *permissions.AccessList
	user       *idm.User
	ctx        context.Context
}

type SyncSharesAction struct {
	etlAction

	// Mandatory Parameters
	mapping map[string]string

	// Optional Parameters
	shareType string
	ownerId   string

	// Internals
	loadedUsers map[string]*syncShareLoadedUser
	router      *views.Router
	slugs       map[string]string
}

var (
	SyncSharesActionName = "actions.etl.shares"
)

// Unique identifier
func (c *SyncSharesAction) GetName() string {
	return SyncSharesActionName
}

// Pass parameters
func (c *SyncSharesAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if err := c.parseStores(action.Parameters); err != nil {
		return err
	}
	if mappingJson, ok := action.Parameters["mapping"]; !ok {
		return fmt.Errorf("task sync user must take a mapping parameter")
	} else {
		if e := json.Unmarshal([]byte(mappingJson), &c.mapping); e != nil {
			return fmt.Errorf("task sync cannot parse json parameter: " + e.Error())
		}
	}
	if sType, ok := action.Parameters["shareType"]; ok {
		c.shareType = sType
	}
	if oId, ok := action.Parameters["ownerId"]; ok {
		c.ownerId = oId
	}

	c.loadedUsers = make(map[string]*syncShareLoadedUser)
	return nil
}

// Run the actual action code
func (c *SyncSharesAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	channels.StatusMsg <- "Initializing shares list for diff/merge..."

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error
	var messages []string

	go func() {
		for {
			select {
			case op := <-progress:
				if op.Total > 0 {
					channels.Progress <- float32(op.Cursor) / float32(op.Total)
				}
				if op.Error != nil {
					channels.StatusMsg <- "Error: " + op.Error.Error()
					log.TasksLogger(ctx).Error(op.Error.Error())
					pgErrors = append(pgErrors, op.Error)
				} else {
					channels.StatusMsg <- op.Description
					log.TasksLogger(ctx).Info(op.Description)
					messages = append(messages, op.Description)
				}
			case <-finished:
				return
			}
		}
	}()

	defer func() {
		finished <- true
	}()

	params := map[string]interface{}{"mapping": c.mapping}
	if len(c.shareType) > 0 {
		params["shareType"] = c.shareType
	}
	if len(c.ownerId) > 0 {
		params["ownerId"] = c.ownerId
	}

	merger, err := c.initMerger()
	if err != nil {
		return input.WithError(err), err
	}

	diff, err := merger.LoadAndDiffShares(ctx, params)
	if err != nil {
		return input.WithError(err), err
	}
	merger.SaveShares(ctx, diff, progress, params)

	// Compute message output
	output := input
	data, _ := json.Marshal(map[string]interface{}{
		"msg":    messages,
		"errors": pgErrors,
	})
	s := fmt.Sprintf("Finished syncing shares: %d successes, %d errors \n", len(messages), len(pgErrors))
	log.TasksLogger(ctx).Info(s)
	actionOutput := &jobs.ActionOutput{
		Success:    len(pgErrors) == 0,
		StringBody: s,
		JsonBody:   data,
	}
	output.AppendOutput(actionOutput)
	return output, nil
}
