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
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service/proto"
)

func getDefaultJobs() []*jobs.Job {

	imagesQuery, _ := ptypes.MarshalAny(&tree.Query{
		Extension: "jpg,png,jpeg,gif,bmp,tiff",
		MinSize:   1,
	})

	exifQuery, _ := ptypes.MarshalAny(&tree.Query{
		Extension: "jpg,jpeg",
	})

	thumbnailsJob := &jobs.Job{
		ID:                "thumbs-job",
		Owner:             common.PydioSystemUsername,
		Label:             "Jobs.Default.Thumbs",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
			jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
		},
		NodeEventFilter: &jobs.NodesSelector{
			Label: "Images Only",
			Query: &service.Query{
				SubQueries: []*any.Any{imagesQuery},
			},
		},
		Actions: []*jobs.Action{
			{
				ID:         "actions.images.thumbnails",
				Parameters: map[string]string{"ThumbSizes": `{"sm":300,"md":1024}`},
			},
			{
				ID: "actions.images.exif",
				NodesFilter: &jobs.NodesSelector{
					Label: "Jpg only",
					Query: &service.Query{
						SubQueries: []*any.Any{exifQuery},
					},
				},
			},
		},
	}

	cleanThumbsJob := &jobs.Job{
		ID:                "clean-thumbs-job",
		Owner:             common.PydioSystemUsername,
		Label:             "Jobs.Default.ThumbsCache",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
		},
		NodeEventFilter: &jobs.NodesSelector{
			Label: "Images Only",
			Query: &service.Query{
				SubQueries: []*any.Any{imagesQuery},
			},
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.images.clean",
			},
		},
	}

	stuckTasksJob := &jobs.Job{
		ID:             "internal-prune-jobs",
		Owner:          common.PydioSystemUsername,
		Label:          "Jobs.Default.PruneJobs",
		MaxConcurrency: 1,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:03/PT10M",
		},
		Actions: []*jobs.Action{
			{
				ID:         "actions.internal.prune-jobs",
				Parameters: map[string]string{},
			},
		},
	}

	usersOnlyQ, _ := ptypes.MarshalAny(&idm.UserSingleQuery{
		NodeType: idm.NodeType_USER,
	})
	cleanUserDataJob := &jobs.Job{
		ID:                "clean-user-data",
		Owner:             common.PydioSystemUsername,
		Label:             "Clean or transfer user data on deletion",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_DELETE),
		},
		IdmFilter: &jobs.IdmSelector{
			Type: jobs.IdmSelectorType_User,
			Query: &service.Query{
				SubQueries: []*any.Any{usersOnlyQ},
			},
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.idm.clean-user-data",
			},
		},
	}

	defJobs := []*jobs.Job{
		thumbnailsJob,
		cleanThumbsJob,
		stuckTasksJob,
		cleanUserDataJob,
	}

	return defJobs

}
