package idm

import (
	"context"

	"github.com/pydio/cells/common/forms"

	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/views"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	cleanUserDataName = "actions.idm.clean-user-data"
)

type CleanUserDataAction struct {
}

func (c *CleanUserDataAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:               cleanUserDataName,
		Label:            "User-data clean up",
		Icon:             "account",
		Description:      "Clean user data on deletion. Personal resources are moved to folder suffixed with the user UUID.",
		Category:         actions.ActionCategoryIDM,
		InputDescription: "Single-selection of one user, provided by the delete user event.",
		SummaryTemplate:  "",
		HasForm:          false,
	}
}

func (c *CleanUserDataAction) GetParametersForm() *forms.Form {
	return nil
}

func (c *CleanUserDataAction) GetName() string {
	return cleanUserDataName
}

func (c *CleanUserDataAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	return nil
}

func (c *CleanUserDataAction) ProvidesProgress() bool {
	return true
}

func (c *CleanUserDataAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	users := input.GetUsers()
	if users == nil || len(users) == 0 {
		return input.WithIgnore(), nil
	}
	u := users[0]
	if u.IsGroup {
		return input.WithIgnore(), nil
	}
	log.TasksLogger(ctx).Info("Cleaning data for user", u.Zap())

	status := make(chan string)
	progress := make(chan float32)
	done := make(chan bool)
	go func() {
		for {
			select {
			case <-done:
				return
			case s := <-status:
				log.Logger(ctx).Info(s)
				channels.StatusMsg <- s
			case pg := <-progress:
				channels.Progress <- pg
			}
		}
	}()

	router := views.NewStandardRouter(views.RouterOptions{AdminView: true, SynchronousTasks: true})
	clientsPool := router.GetClientsPool()
	// For the moment, just rename personal folder to user UUID to collision with new user with same Login
	vNodesManager := views.GetVirtualNodesManager()
	for _, vNode := range vNodesManager.ListNodes() {
		onDelete, ok := vNode.MetaStore["onDelete"]
		if !ok || onDelete != "rename-uuid" {
			continue
		}
		// Check if node exists
		resolved, e := vNodesManager.ResolvePathWithVars(ctx, vNode, map[string]string{"User.Name": u.Login}, clientsPool)
		if e != nil {
			done <- true
			return input.WithError(e), e
		}
		if resp, e := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved}); e == nil && resp.Node != nil {
			realNode := resp.Node
			// Resolve as Uuid - Move Node
			folderName := "deleted-" + u.Login + "-" + u.Uuid[0:13]
			targetNode, _ := vNodesManager.ResolvePathWithVars(ctx, vNode, map[string]string{"User.Name": folderName}, clientsPool)
			log.Logger(ctx).Info("Copy/Delete user personal folder", u.ZapLogin(), targetNode.ZapPath())
			log.TasksLogger(ctx).Info("Copy/Delete personal folder to " + targetNode.Path)
			// Make a Copy then Delete, to make sure UUID are changed and references are cleared
			if e := views.CopyMoveNodes(ctx, router, realNode, targetNode, false, true, false, status, progress); e != nil {
				done <- true
				return input.WithError(e), e
			}
			if _, e := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: realNode}); e != nil {
				done <- true
				return input.WithError(e), e
			}
		}
	}

	done <- true
	return input, nil

}
