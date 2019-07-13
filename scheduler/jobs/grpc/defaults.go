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
	})

	exifQuery, _ := ptypes.MarshalAny(&tree.Query{
		Extension: "jpg",
	})

	thumbnailsJob := &jobs.Job{
		ID:                "thumbs-job",
		Owner:             common.PYDIO_SYSTEM_USERNAME,
		Label:             "Jobs.Default.Thumbs",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
			jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
		},
		NodeEventFilter: &jobs.NodesSelector{
			Query: &service.Query{
				SubQueries: []*any.Any{imagesQuery},
			},
		},
		Actions: []*jobs.Action{
			{
				ID:         "actions.images.thumbnails",
				Parameters: map[string]string{"ThumbSizes": `{"sm":300,"md":1024}`},
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{imagesQuery},
					},
				},
			},
			{
				ID: "actions.images.exif",
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{exifQuery},
					},
				},
			},
		},
	}

	cleanThumbsJob := &jobs.Job{
		ID:                "clean-thumbs-job",
		Owner:             common.PYDIO_SYSTEM_USERNAME,
		Label:             "Jobs.Default.ThumbsCache",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
		},
		NodeEventFilter: &jobs.NodesSelector{
			Query: &service.Query{
				SubQueries: []*any.Any{imagesQuery},
			},
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.images.clean",
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{imagesQuery},
					},
				},
			},
		},
	}

	stuckTasksJob := &jobs.Job{
		ID:             "internal-prune-jobs",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
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

	cleanUserDataJob := &jobs.Job{
		ID:                "clean-user-data",
		Owner:             common.PYDIO_SYSTEM_USERNAME,
		Label:             "Clean or transfer user data on deletion",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.IdmChangeEventName(jobs.IdmEventObjectUser, idm.ChangeEventType_DELETE),
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.idm.clean-user-data",
			},
		},
	}

	fakeLongJob := &jobs.Job{
		ID:             "fake-long-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.FakeLongJob",
		Inactive:       true,
		MaxConcurrency: 1,
		Actions: []*jobs.Action{
			{
				ID: "actions.test.fake",
				Parameters: map[string]string{
					"timer":  "10000",
					"ticker": "5",
				},
			},
		},
	}

	fakeUsersJob := &jobs.Job{
		ID:             "fake-users-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.FakeUsersJob",
		Inactive:       true,
		MaxConcurrency: 1,
		Actions: []*jobs.Action{
			{
				ID: "fake.users.creation",
				Parameters: map[string]string{
					"number": "100",
					"prefix": "fakeUser-",
				},
			},
		},
	}

	fakeRPCJob := &jobs.Job{
		ID:             "fake-rpc-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.FakeGrpcJob",
		MaxConcurrency: 1,
		Inactive:       true,
		Actions: []*jobs.Action{
			{
				ID: "actions.cmd.rpc",
				Parameters: map[string]string{
					"service": "pydio.grpc.role",
					"method":  "RoleService.CreateRole",
					"request": `{"Role": {"Label": "test"}}`,
				},
			},
		},
	}

	selectorQuery, _ := ptypes.MarshalAny(&tree.Query{
		// Use the Tree search
		MaxSize:    5 * 1024 * 1024,
		Type:       tree.NodeType_LEAF,
		PathPrefix: []string{"/"},
		Extension:  "jpg|png",
		// Use the Search Server instead
		//FreeString: "+Meta.ImageDimensions.Height:>=2000",
	})
	fakeSelectorJob := &jobs.Job{
		ID:             "fake-nodes-selector",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Perform a fake action on a subset (images smaller than 5MB)",
		MaxConcurrency: 1,
		Inactive:       true,
		Actions: []*jobs.Action{
			{
				ID: "actions.test.fake",
				Parameters: map[string]string{
					"timer":  "100",
					"ticker": "1",
				},
				NodesSelector: &jobs.NodesSelector{
					Query: &service.Query{SubQueries: []*any.Any{selectorQuery}},
				},
			},
		},
	}

	defJobs := []*jobs.Job{
		thumbnailsJob,
		cleanThumbsJob,
		stuckTasksJob,
		cleanUserDataJob,
		// Testing Jobs
		fakeLongJob,
		fakeRPCJob,
		fakeUsersJob,
		fakeSelectorJob,
	}

	return defJobs

}
