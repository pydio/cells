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
	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/scheduler/lang"
)

func GetDefaultJobs() []*jobs.Job {

	triggerCreate := &jobs.TriggerFilter{
		Label:       "Create/Update",
		Description: "Trigger on image creation or modification",
		Query: &service.Query{SubQueries: []*anypb.Any{jobs.MustMarshalAny(&jobs.TriggerFilterQuery{
			EventNames: []string{
				jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE),
				jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT),
			},
		})}},
	}

	triggerDelete := &jobs.TriggerFilter{
		Label:       "Delete",
		Description: "Trigger on image deletion",
		Query: &service.Query{SubQueries: []*anypb.Any{jobs.MustMarshalAny(&jobs.TriggerFilterQuery{
			EventNames: []string{
				jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
			},
		})}},
	}

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
			jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE),
		},
		NodeEventFilter: &jobs.NodesSelector{
			Label: "Images Only",
			Query: &service.Query{
				SubQueries: []*anypb.Any{jobs.MustMarshalAny(&tree.Query{
					Extension: "jpg,png,jpeg,gif,bmp,tiff",
					MinSize:   1,
				})},
			},
		},
		Actions: []*jobs.Action{
			{
				ID: "middleware.tree.meta",
				Parameters: map[string]string{
					"metaJSON": "{\"ImageThumbnails\":{\"Processing\": true, \"ContentType\": \"image/jpg\"}}",
				},
				ChainedActions: []*jobs.Action{
					{
						ID:            "actions.images.thumbnails",
						Parameters:    map[string]string{"ThumbSizes": `{"sm":300,"md":1024}`},
						TriggerFilter: triggerCreate,
					},
					{
						ID:            "actions.images.exif",
						TriggerFilter: triggerCreate,
						NodesFilter: &jobs.NodesSelector{
							Label: "Jpg only",
							Query: &service.Query{
								SubQueries: []*anypb.Any{jobs.MustMarshalAny(&tree.Query{
									Extension: "jpg,jpeg",
								})},
							},
						},
					},
					{
						ID:            "actions.images.clean",
						TriggerFilter: triggerDelete,
					},
				},
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

	cleanUserDataJob := &jobs.Job{
		ID:                "clean-user-data",
		Owner:             common.PydioSystemUsername,
		Label:             "Jobs.Default.CleanUserData",
		Inactive:          false,
		MaxConcurrency:    5,
		TasksSilentUpdate: true,
		EventNames: []string{
			jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_DELETE),
		},
		IdmFilter: &jobs.IdmSelector{
			Type: jobs.IdmSelectorType_User,
			Query: &service.Query{
				SubQueries: []*anypb.Any{jobs.MustMarshalAny(&idm.UserSingleQuery{
					NodeType: idm.NodeType_USER,
				})},
			},
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.idm.clean-user-data",
			},
		},
	}

	q, _ := anypb.New(&tree.Query{
		DurationDate: ">24h",
		ETag:         "^temporary$",
	})

	cleanTemporaryOrphans := &jobs.Job{
		ID:    "clean-orphans-nodes",
		Label: "Jobs.Default.CleanOrphanFiles",
		Owner: common.PydioSystemUsername,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-01-01T02:30:00.828Z/PT24H",
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.tree.delete",
				NodesSelector: &jobs.NodesSelector{
					Label: "Select temporary files older than 24h",
					Query: &service.Query{
						SubQueries: []*anypb.Any{q},
						Operation:  service.OperationType_AND,
					},
				},
				Parameters: map[string]string{
					"childrenOnly": "false",
				},
			},
		},
	}

	cleanExpiredACLs := &jobs.Job{
		ID:    "clean-expired-acls",
		Label: "Jobs.Default.CleanExpiredACLs",
		Owner: common.PydioSystemUsername,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-01-01T01:30:00.828Z/PT24H",
		},
		Actions: []*jobs.Action{
			{
				ID: "actions.idm.clean-expired-acl",
				Parameters: map[string]string{
					"expiredBefore": "240h",
				},
			},
		},
	}

	defJobs := []*jobs.Job{
		thumbnailsJob,
		stuckTasksJob,
		cleanUserDataJob,
		cleanTemporaryOrphans,
		cleanExpiredACLs,
	}

	return defJobs

}

func BuildDataSourceSyncJob(dsName string, flat, autoStart bool, languages ...string) *jobs.Job {
	sName := common.ServiceGrpcNamespace_ + common.ServiceDataSync_ + dsName

	if flat {
		return &jobs.Job{
			ID:             "snapshot-" + dsName,
			Owner:          common.PydioSystemUsername,
			Label:          "Snapshot DB index for Datasource " + dsName,
			MaxConcurrency: 1,
			AutoStart:      autoStart,
			Actions: []*jobs.Action{
				{
					ID:    "actions.cmd.resync",
					Label: "Dump Snapshot",
					Parameters: map[string]string{
						"service": sName,
						"path":    "write/snapshot.db",
					},
				},
			},
		}

	} else {

		T := lang.Bundle().T(languages...)
		ap, _ := anypb.New(&tree.Query{
			Type:       tree.NodeType_LEAF,
			PathPrefix: []string{dsName},
		})

		return &jobs.Job{
			ID:             "resync-ds-" + dsName,
			Owner:          common.PydioSystemUsername,
			Label:          T("Jobs.User.ResyncDS", map[string]string{"DsName": dsName}),
			Inactive:       false,
			MaxConcurrency: 1,
			AutoStart:      autoStart,
			Actions: []*jobs.Action{
				{
					ID: "actions.cmd.resync",
					Parameters: map[string]string{
						"service": sName,
					},
					ChainedActions: []*jobs.Action{
						{
							ID: "actions.tree.cells-hash",
							Parameters: map[string]string{
								"hashType": "cells",
								"metaName": common.MetaNamespaceHash,
							},
							NodesSelector: &jobs.NodesSelector{
								Query: &service.Query{
									SubQueries: []*anypb.Any{ap},
									Operation:  service.OperationType_AND,
								},
								Label: "Files selection",
							},
						},
					},
				},
			},
		}
	}

}
