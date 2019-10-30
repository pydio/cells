package actions

import (
	"context"
	"fmt"
	"time"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/etl"
	"github.com/pydio/cells/common/etl/models"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

type SyncUsersAction struct {
	etlAction
}

type ConnectorConfigs struct {
	ldapStore    models.ReadableStore
	mappingRules []auth.MappingRule
	mergeOptions map[string]string
}

var (
	SyncUsersActionName = "actions.etl.users"
)

// GetName returns the Unique Identifier of this task.
func (c *SyncUsersAction) GetName() string {
	return SyncUsersActionName
}

// Init parses and validates parameters
func (c *SyncUsersAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	return c.parseStores(action.Parameters)
}

// Run the actual action code
func (c *SyncUsersAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	msg := "Starting synchronisation with external directory"
	log.TasksLogger(ctx).Info(msg)
	channels.StatusMsg <- msg
	channels.Status <- jobs.TaskStatus_Running

	// Add a small timer for the job to be ready to be launched. Superstition?
	<-time.After(2 * time.Second)

	progress := make(chan etl.MergeOperation)
	finished := make(chan bool)
	defer close(progress)
	defer close(finished)
	var pgErrors []error
	listProgress := make(chan float32)
	ratio := float32(1)
	var lastProgress float32

	go func() {
		// Send progress only if incremented by 0.1%
		sendProgress := func(newProgress float32) bool {
			if newProgress-lastProgress > 0.001 {
				channels.Progress <- newProgress
				lastProgress = newProgress
				return true
			}
			return false
		}
		for {
			select {
			case p := <-listProgress:
				sendProgress(p / ratio)
			case op := <-progress:
				log.TasksLogger(ctx).Info(op.Description)
				channels.StatusMsg <- op.Description
				if op.Total > 0 {
					sendProgress((float32(op.Cursor) / float32(op.Total) / ratio) + 1/ratio)
				}
				if op.Error != nil {
					pgErrors = append(pgErrors, op.Error)
				}
			case <-finished:
				return
			}
		}
	}()

	defer func() {
		finished <- true
	}()

	merger, err := c.initMerger()
	if err != nil {
		return input.WithError(err), err
	}

	if _, ok := c.params["splitUsersRoles"]; ok {

		cellAdmin, ok := c.params["cellAdmin"]
		if !ok {
			er := fmt.Errorf("missing 'cellAdmin' parameter")
			return input.WithError(er), er
		}

		log.Auditer(ctx).Info("Processing user import")

		// FIRST SYNC ONLY USERS
		usersDiff, _, err := merger.LoadAndDiffUsers(ctx, nil)
		if err != nil {
			return input.WithError(err), err
		}
		for k, u := range usersDiff.Delete {
			if u.Login == cellAdmin || u.Login == common.PYDIO_S3ANON_USERNAME || u.Uuid == "ROOT_GROUP" {
				delete(usersDiff.Delete, k)
			}
		}
		log.Logger(ctx).Debug("Diffs after listing users", zap.Any("users", usersDiff))
		merger.SaveUsers(ctx, usersDiff, new(models.RoleDiff), progress)

		// THEN SYNC ADMIN ROLES
		roleDiff, e := merger.LoadAndDiffRoles(ctx, map[string]interface{}{})
		if e != nil {
			return input.WithError(e), e
		}
		log.Logger(ctx).Debug("Admin roles diff", zap.Any("roles", roleDiff))
		merger.SaveUsers(ctx, models.NewUserDiff(), roleDiff, progress)

		// THEN SYNC TEAM ROLES
		roleDiff2, e := merger.LoadAndDiffRoles(ctx, map[string]interface{}{"teams": true})
		if e != nil {
			return input.WithError(e), e
		}
		log.Logger(ctx).Debug("Teams diff", zap.Any("teams", roleDiff2))
		merger.SaveUsers(ctx, models.NewUserDiff(), roleDiff2, progress)

	} else {

		msg = "Comparing internal and external directories"
		log.TasksLogger(ctx).Info(msg)
		channels.StatusMsg <- msg

		usersDiff, rolesDiff, err := merger.LoadAndDiffUsers(ctx, listProgress)
		if err != nil {
			return input.WithError(err), err
		}

		msg = "Persisting modifications"
		log.TasksLogger(ctx).Info(msg)
		channels.StatusMsg <- msg

		merger.SaveUsers(ctx, usersDiff, rolesDiff, progress)

		// Add a small timer to insure success message is displayed last
		<-time.After(2 * time.Second)
		msg = fmt.Sprintf("Synchronisation complete")
		log.TasksLogger(ctx).Info(msg)
		log.Auditer(ctx).Info("Synchronization with external directory complete")
		channels.StatusMsg <- msg

	}

	output := input
	output.AppendOutput(&jobs.ActionOutput{
		Success:    true,
		StringBody: "Successfully synchronized users",
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
