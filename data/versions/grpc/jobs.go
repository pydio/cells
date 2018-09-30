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
	"github.com/micro/protobuf/ptypes"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
	"github.com/pydio/cells/common/utils"
	"github.com/pydio/cells/data/versions/lang"
)

func getDefaultJobs() []*jobs.Job {

	T := lang.Bundle().GetTranslationFunc(utils.GetDefaultLanguage())

	searchQuery, _ := ptypes.MarshalAny(&tree.Query{
		Type: tree.NodeType_LEAF,
	})

	return []*jobs.Job{
		{
			ID:                "versioning-job",
			Owner:             common.PYDIO_SYSTEM_USERNAME,
			Label:             T("Job.Version.Title"),
			Inactive:          false,
			MaxConcurrency:    10,
			TasksSilentUpdate: true,
			EventNames: []string{
				jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
				jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
			},
			Actions: []*jobs.Action{
				{
					ID: "actions.versioning.create",
					NodesFilter: &jobs.NodesSelector{
						Query: &service.Query{
							SubQueries: []*any.Any{searchQuery},
						},
					},
				},
			},
		},
		{
			ID:             "prune-versions-job",
			Owner:          common.PYDIO_SYSTEM_USERNAME,
			Label:          T("Job.Pruning.Title"),
			Inactive:       false,
			MaxConcurrency: 1,
			Schedule: &jobs.Schedule{
				Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT15M",
			},
			Actions: []*jobs.Action{{
				ID: "actions.versioning.prune",
			}},
		},
	}

}
