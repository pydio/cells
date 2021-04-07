/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"github.com/golang/protobuf/ptypes/any"
	"github.com/pydio/cells/common/proto/object"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	service "github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils/i18n"
	"github.com/pydio/cells/data/versions/lang"
)

func getDefaultJobs() []*jobs.Job {

	T := lang.Bundle().GetTranslationFunc(i18n.GetDefaultLanguage(config.Get()))

	triggerCreate := &jobs.TriggerFilter{
		Label:       "Create/Update",
		Description: "Trigger on file creation or modification",
		Query: &service.Query{SubQueries: []*any.Any{
			jobs.MustMarshalAny(&jobs.TriggerFilterQuery{
				EventNames: []string{
					jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
					jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
				},
			}),
		}},
	}

	triggerPrune := &jobs.TriggerFilter{
		Label:       "Prune",
		Description: "Schedule-based pruning",
		Query: &service.Query{
			SubQueries: jobs.MustMarshalAnyMultiple(&jobs.TriggerFilterQuery{
				IsSchedule: true,
			}, &jobs.TriggerFilterQuery{
				IsManual: true,
			}),
			Operation: service.OperationType_OR,
		},
	}

	return []*jobs.Job{
		{
			ID:                "versioning-job",
			Owner:             common.PydioSystemUsername,
			Label:             T("Job.Version.Title"),
			Inactive:          false,
			MaxConcurrency:    5,
			TasksSilentUpdate: true,
			EventNames: []string{
				jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
				jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
			},
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT60M",
			},
			DataSourceFilter: &jobs.DataSourceSelector{
				Label:       "Versioned?",
				Description: "Excluded non versioned datasources",
				Type:        jobs.DataSourceSelectorType_DataSource,
				Query: &service.Query{
					SubQueries: []*any.Any{jobs.MustMarshalAny(&object.DataSourceSingleQuery{
						IsVersioned: true,
					})},
				},
			},
			Actions: []*jobs.Action{
				{
					ID: "actions.versioning.create",
					NodesFilter: &jobs.NodesSelector{
						Query: &service.Query{
							SubQueries: []*any.Any{
								jobs.MustMarshalAny(&tree.Query{
									Type: tree.NodeType_LEAF,
								}),
							},
						},
					},
					TriggerFilter: triggerCreate,
				},
				{
					ID:            "actions.versioning.prune",
					TriggerFilter: triggerPrune,
				},
			},
		},
		/*
			{
				ID:             "prune-versions-job",
				Owner:          common.PydioSystemUsername,
				Label:          T("Job.Pruning.Title"),
				Inactive:       true,
				MaxConcurrency: 1,
				Schedule: &jobs.Schedule{
					Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT60M",
				},
				Actions: []*jobs.Action{{
					ID: "actions.versioning.prune",
				}},
			},
		*/
	}

}
