package idm

import (
	"context"
	"path"
	"time"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/nodes/abstract"
	"github.com/pydio/cells/v4/common/nodes/compose"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/std"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	cleanUserDataName = "actions.idm.clean-user-data"
)

type CleanUserDataAction struct {
	common.RuntimeHolder
	targetParent string
}

// GetDescription returns action description
func (c *CleanUserDataAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:               cleanUserDataName,
		IsInternal:       true,
		Label:            "User-data clean up",
		Icon:             "account",
		Description:      "Clean user data on deletion. Personal resources are moved to folder suffixed with the user UUID.",
		Category:         actions.ActionCategoryIDM,
		InputDescription: "Single-selection of one user, provided by the delete user event.",
		SummaryTemplate:  "",
		HasForm:          true,
	}
}

// GetParametersForm returns a UX form
func (c *CleanUserDataAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "targetParent",
					Type:        forms.ParamString,
					Label:       "Data copy destination",
					Description: "Where to copy or move original files (sibling folder by default)",
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName provides unique identifier
func (c *CleanUserDataAction) GetName() string {
	return cleanUserDataName
}

// Init passes parameters
func (c *CleanUserDataAction) Init(job *jobs.Job, action *jobs.Action) error {
	if tp, o := action.Parameters["targetParent"]; o {
		c.targetParent = tp
	}
	return nil
}

// ProvidesProgress implements interface
func (c *CleanUserDataAction) ProvidesProgress() bool {
	return true
}

// Run perform actual action code
func (c *CleanUserDataAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	users := input.GetUsers()
	if len(users) == 0 {
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

	tp := c.targetParent
	if tp != "" {
		tp = jobs.EvaluateFieldStr(ctx, input, tp)
	}

	router := compose.PathClient(c.GetRuntimeContext(), nodes.AsAdmin(), nodes.WithSynchronousTasks())
	clientsPool := router.GetClientsPool()
	var cleaned bool
	// For the moment, just rename personal folder to user UUID to collision with new user with same Login
	vNodesManager := abstract.GetVirtualNodesManager(c.GetRuntimeContext())
	for _, vNode := range vNodesManager.ListNodes() {
		onDelete, ok := vNode.MetaStore["onDelete"]
		if !ok || onDelete != "rename-uuid" {
			continue
		}
		// Check if node exists
		resolved, e := vNodesManager.ResolveInContext(auth.WithImpersonate(ctx, u), vNode, false)
		if e != nil {
			if errors.Is(e, errors.StatusNotFound) {
				continue
			}
			done <- true
			return input.WithError(e), e
		}
		resp, e := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: resolved})
		if e != nil || resp.Node == nil {
			continue
		}
		realNode := resp.Node
		var targetParentNode *tree.Node
		if tp != "" {
			// Make sure parent exists
			targetParent := &tree.Node{Path: tp, Type: tree.NodeType_COLLECTION}
			if tpEx, er := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: targetParent}); er == nil {
				targetParentNode = tpEx.GetNode()
			} else if _, e := clientsPool.GetTreeClientWrite().CreateNode(ctx, &tree.CreateNodeRequest{Node: targetParent}); e == nil {
				// Wait for indexation
				std.Retry(ctx, func() error {
					tpEx, er := clientsPool.GetTreeClient().ReadNode(ctx, &tree.ReadNodeRequest{Node: targetParent})
					if er == nil {
						targetParentNode = tpEx.GetNode()
					}
					return er
				}, 1*time.Second, 5*time.Second)
			}
		}
		if targetParentNode == nil {
			// Parent not defined or not found/not created - just point to resolved sibling
			targetParentNode = &tree.Node{Path: path.Dir(realNode.GetPath())}
		}

		// Resolve as Uuid - Move Node
		folderName := "deleted-" + u.Login + "-" + u.Uuid[0:13]
		targetNode := &tree.Node{Path: path.Join(targetParentNode.GetPath(), folderName)}
		log.Logger(ctx).Info("Copy/Delete user personal folder", u.ZapLogin(), targetNode.ZapPath())
		log.TasksLogger(ctx).Info("Moving personal folder for deleted user to " + targetNode.Path)
		cleaned = true
		// Make a Copy then Delete, to make sure UUID are changed and references are cleared
		if e := nodes.CopyMoveNodes(ctx, router, realNode, targetNode, false, false, status, progress); e != nil {
			done <- true
			return input.WithError(e), e
		}
		if _, e := router.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: realNode}); e != nil {
			done <- true
			return input.WithError(e), e
		}
	}
	if !cleaned {
		log.TasksLogger(ctx).Info("Nothing to do")
	}

	done <- true
	return input, nil

}
