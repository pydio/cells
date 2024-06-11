package actions

import (
	"context"

	"google.golang.org/protobuf/types/known/anypb"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/commons/jobsc"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/telemetry/log"
)

func DigestJob() *jobs.Job {
	// Build queries for standard users
	q1, _ := anypb.New(&idm.UserSingleQuery{NodeType: idm.NodeType_USER})
	q2, _ := anypb.New(&idm.UserSingleQuery{AttributeName: idm.UserAttrHidden, AttributeAnyValue: true, Not: true})
	return &jobs.Job{
		ID:             "users-activity-digest",
		Label:          "Users activities digest",
		Owner:          common.PydioSystemUsername,
		MaxConcurrency: 1,
		AutoStart:      false,
		Schedule: &jobs.Schedule{
			Iso8601Schedule: "R/2012-06-04T19:25:16.828696-07:00/PT15M", // every 5 mn
		},
		Actions: []*jobs.Action{
			{
				ID: "broker.activity.actions.mail-digest",
				UsersSelector: &jobs.UsersSelector{
					Label: "All users except hidden",
					Query: &service.Query{
						SubQueries: []*anypb.Any{q1, q2},
						Operation:  service.OperationType_AND,
					},
				},
			},
		},
	}

}

func RegisterDigestJob(ctx context.Context) error {
	log.Logger(ctx).Info("Registering default job for creating activities digests")
	_, err := jobsc.JobServiceClient(ctx).PutJob(ctx, &jobs.PutJobRequest{Job: DigestJob()})
	return err
}
