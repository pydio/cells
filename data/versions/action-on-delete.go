/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package versions

import (
	"context"
	"fmt"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/forms"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/scheduler/actions"
)

var (
	onDeleteVersionsActionName = "actions.versioning.ondelete"
)

type OnDeleteVersionsAction struct {
	common.RuntimeHolder
	Handler    nodes.Handler
	Pool       nodes.SourcesPool
	rootFolder string
}

func (c *OnDeleteVersionsAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              onDeleteVersionsActionName,
		Label:           "Backup Versions",
		Icon:            "delete-sweep",
		Category:        actions.ActionCategoryTree,
		Description:     "Backup versions for deleted files inside a specific folder",
		SummaryTemplate: "",
		HasForm:         true,
		IsInternal:      true,
	}
}

func (c *OnDeleteVersionsAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "rootFolder",
					Type:        forms.ParamString,
					Label:       "Backup Folder",
					Description: "Folder where to backup versions for deleted files",
					Mandatory:   true,
					Editable:    true,
					Default:     "$DELETED",
				},
			},
		},
	}}
}

// GetName returns the Unique identifier.
func (c *OnDeleteVersionsAction) GetName() string {
	return onDeleteVersionsActionName
}

// Init passes the parameters to a newly created PruneVersionsAction.
func (c *OnDeleteVersionsAction) Init(job *jobs.Job, action *jobs.Action) error {

	c.Handler = getRouter(c.GetRuntimeContext())
	c.Pool = getRouter(c.GetRuntimeContext()).GetClientsPool(c.GetRuntimeContext())
	var ok bool
	if c.rootFolder, ok = action.Parameters["rootFolder"]; !ok {
		c.rootFolder = "$DELETED"
	}
	return nil
}

// Run processes the actual action code.
func (c *OnDeleteVersionsAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	if len(input.Nodes) == 0 {
		return input.WithIgnore(), nil // Ignore
	}
	node := input.Nodes[0]

	if node.Etag == common.NodeFlagEtagTemporary || tree.IgnoreNodeForOutput(ctx, node) {
		return input.WithIgnore(), nil // Ignore
	}
	policy := PolicyForNode(ctx, node)
	if policy == nil {
		return input.WithIgnore(), nil
	}
	ds, e := DataSourceForPolicy(c.GetRuntimeContext(), policy)
	if e != nil {
		return input.WithError(e), e
	}

	rootFolder := jobs.EvaluateFieldStr(ctx, input, c.rootFolder)
	dir := path.Join(ds.Name, rootFolder, path.Dir(node.GetPath()))
	base := path.Base(node.GetPath())
	ext := path.Ext(base)
	prefix := strings.TrimSuffix(base, ext)
	parentCreated := false

	versionClient := tree.NewNodeVersionerClient(grpc.ResolveConn(c.GetRuntimeContext(), common.ServiceVersionsGRPC))

	if response, err := versionClient.PruneVersions(ctx, &tree.PruneVersionsRequest{UniqueNode: node}); err == nil {
		deleteStrategy := policy.GetNodeDeletedStrategy()
		for i, version := range response.DeletedVersions {
			move := true
			if deleteStrategy == tree.VersioningNodeDeletedStrategy_KeepNone || (deleteStrategy == tree.VersioningNodeDeletedStrategy_KeepLast && i > 0) {
				move = false
			}
			deleteNode := version.GetLocation()
			if move {
				backupNode := deleteNode.Clone()
				// Create base-{DATE}-001-vUUID.ext
				seeded := fmt.Sprintf("%s-%03d-%s-%s%s", prefix, i+1, time.Now().Format("2006-01-02"), strings.Split(version.GetUuid(), "-")[0], ext)
				backupNode.Path = path.Join(dir, seeded)
				// Create parents if they do not exist
				if !parentCreated {
					if err := c.CreateParents(ctx, dir); err != nil {
						log.TasksLogger(ctx).Error("Error while trying to create folder "+dir, zap.Error(err))
					} else {
						parentCreated = true
					}
				}
				_, err := c.Handler.UpdateNode(ctx, &tree.UpdateNodeRequest{From: deleteNode, To: backupNode})
				if err != nil {
					log.TasksLogger(ctx).Error("Error while trying to move version "+deleteNode.Uuid+" to "+backupNode.Path, zap.Error(err))
				} else {
					log.TasksLogger(ctx).Info("[Delete Versions Task] Moved version to "+backupNode.Path, zap.String("fileId", deleteNode.Uuid))
				}
			} else {
				_, err := c.Handler.DeleteNode(ctx, &tree.DeleteNodeRequest{Node: deleteNode})
				if err != nil {
					log.TasksLogger(ctx).Error("Error while trying to delete version "+deleteNode.Uuid, zap.Error(err))
				} else {
					log.TasksLogger(ctx).Info("[Delete Versions Task] Deleted version "+deleteNode.Uuid, zap.String("fileId", deleteNode.Uuid))
				}
			}
		}
	} else {
		return input.WithError(err), err
	}

	output := input
	output.AppendOutput(&jobs.ActionOutput{Success: true})
	log.TasksLogger(ctx).Info("Finished moving deleted versions")

	return output, nil
}

func (c *OnDeleteVersionsAction) CreateParents(ctx context.Context, dirPath string) error {
	parts := strings.Split(dirPath, "/")
	crt := ""
	for _, p := range parts {
		crt = path.Join(crt, p)
		dirNode := &tree.Node{Path: crt, Type: tree.NodeType_COLLECTION, MTime: time.Now().Unix()}
		if _, e := c.Handler.ReadNode(ctx, &tree.ReadNodeRequest{Node: dirNode}); e == nil {
			// Already exists
			continue
		}
		log.TasksLogger(ctx).Info("Creating folder " + dirNode.GetPath())
		dirNode.Uuid = uuid.New()
		if _, er := c.Handler.CreateNode(ctx, &tree.CreateNodeRequest{Node: dirNode}); er != nil {
			return er
		}
	}
	return nil
}
