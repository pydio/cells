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

package grpc

import (
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/object"
	service "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/data/versions/lang"
)

func GetVersioningJob(language string) *jobs.Job {

	T := lang.Bundle().T(language)

	triggerCreate := &jobs.TriggerFilter{
		Label:       "Create/Update",
		Description: "Trigger on file creation or modification",
		Query: &service.Query{
			SubQueries: jobs.MustMarshalAnyMultiple(&jobs.TriggerFilterQuery{
				EventNames: []string{
					jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
					jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
				},
			}),
		},
	}

	triggerDelete := &jobs.TriggerFilter{
		Label:       "Delete",
		Description: "Trigger on file deletion",
		Query: &service.Query{
			SubQueries: jobs.MustMarshalAnyMultiple(&jobs.TriggerFilterQuery{
				EventNames: []string{
					jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
				},
			}),
		},
	}

	return &jobs.Job{
		ID:                "versioning-job",
		Owner:             common.PydioSystemUsername,
		Label:             T("Job.Version.Title"),
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
			jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
			jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
		},
		DataSourceFilter: &jobs.DataSourceSelector{
			Label:       "Is Versioned?",
			Description: "Excluded non versioned DataSources",
			Type:        jobs.DataSourceSelectorType_DataSource,
			Query: &service.Query{
				SubQueries: []*anypb.Any{jobs.MustMarshalAny(&object.DataSourceSingleQuery{
					IsVersioned: true,
				})},
			},
		},
		NodeEventFilter: &jobs.NodesSelector{
			Query: &service.Query{
				SubQueries: jobs.MustMarshalAnyMultiple(
					&service.Query{SubQueries: jobs.MustMarshalAnyMultiple(&tree.Query{
						Type: tree.NodeType_LEAF,
					})},
					&service.Query{SubQueries: jobs.MustMarshalAnyMultiple(&tree.Query{
						FileName: common.PydioSyncHiddenFile,
						Not:      true,
					})},
				),
				Operation: service.OperationType_AND,
			},
		},
		Actions: []*jobs.Action{
			{
				ID:            "actions.versioning.create",
				TriggerFilter: triggerCreate,
			},
			{
				ID:            "actions.versioning.ondelete",
				TriggerFilter: triggerDelete,
				Parameters: map[string]string{
					"rootFolder": "$DELETED$",
				},
			},
		},
	}

}
