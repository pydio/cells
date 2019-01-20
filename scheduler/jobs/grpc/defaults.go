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
)

func getDefaultJobs() []*jobs.Job {

	searchQuery, _ := ptypes.MarshalAny(&tree.Query{
		Extension: "jpg,png,jpeg,gif,bmp,tiff",
	})

	searchQueryExif, _ := ptypes.MarshalAny(&tree.Query{
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
		Actions: []*jobs.Action{
			{
				ID:         "actions.images.thumbnails",
				Parameters: map[string]string{"ThumbSizes": `{"sm":300,"md":1024}`},
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{searchQuery},
					},
				},
			},
			{
				ID: "actions.images.exif",
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{searchQueryExif},
					},
				},
			},
		},
	}

	cleanThumbsJob := &jobs.Job{
		ID:             "clean-thumbs-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.ThumbsCache",
		Inactive:       false,
		MaxConcurrency: 5,
		EventNames: []string{
			jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.images.clean",
				NodesFilter: &jobs.NodesSelector{
					Query: &service.Query{
						SubQueries: []*any.Any{searchQuery},
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

	archiveChangesJob := &jobs.Job{
		ID:             "archive-changes-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.ArchiveJobs",
		MaxConcurrency: 1,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:03/PT10M",
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.changes.archive",
				Parameters: map[string]string{
					"remainingRows": "1000",
				},
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
				ID: "FAKE",
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
		Inactive:       false,
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
		ID:             "fake-long-job",
		Owner:          common.PYDIO_SYSTEM_USERNAME,
		Label:          "Jobs.Default.FakeGrpcJob",
		MaxConcurrency: 1,
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

	defJobs := []*jobs.Job{
		thumbnailsJob,
		cleanThumbsJob,
		stuckTasksJob,
		archiveChangesJob,
		// Testing Jobs
		fakeLongJob,
		fakeRPCJob,
		fakeUsersJob,
	}

	return defJobs

}
