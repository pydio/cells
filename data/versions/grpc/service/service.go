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

// Package service is in charge of storing versions metadata
package service

import (
	"context"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/client/commons/jobsc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/jobs"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/data/versions"
	grpc2 "github.com/pydio/cells/v5/data/versions/grpc"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceVersions
)

func init() {

	jobs.RegisterDefault(grpc2.GetVersioningJob("en-us"), Name)
	runtime.Register("main", func(ctx context.Context) {
		config.RegisterExposedConfigs(Name, grpc2.ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagData),
			service.Description("Versioning service"),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            InitDefaults,
				},
				{
					TargetVersion: service.FirstRun(),
					Up:            RegisterJobs,
				},
			}),
			service.WithStorageMigrator(versions.Migrate),
			service.WithStorageDrivers(versions.Drivers...),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {
				tree.RegisterNodeVersionerServer(server, &grpc2.Handler{})
				return nil
			}),
		)
	})
}

func RegisterJobs(ctx context.Context) error {
	jobsClient := jobsc.JobServiceClient(ctx)
	var reinsert bool
	if _, e := jobsClient.GetJob(ctx, &jobs.GetJobRequest{JobID: "prune-versions-job"}); e == nil {
		_, _ = jobsClient.DeleteJob(ctx, &jobs.DeleteJobRequest{JobID: "prune-versions-job"})
		reinsert = true
	}
	vJob := grpc2.GetVersioningJob(languages.GetDefaultLanguage(ctx))
	if _, err := jobsClient.GetJob(ctx, &jobs.GetJobRequest{JobID: vJob.ID}); err != nil || reinsert {
		if _, er := jobsClient.PutJob(ctx, &jobs.PutJobRequest{Job: vJob}); er != nil {
			log.Logger(ctx).Error("Cannot insert versioning job", zap.Error(er))
		} else {
			log.Logger(ctx).Info("Inserted versioning job")
		}
		return nil
	}
	return nil
}

func InitDefaults(ctx context.Context) error {

	log.Logger(ctx).Info("Inserting default versioning policies")

	max30, _ := json.Marshal(&tree.VersioningPolicy{
		Uuid:        "default-policy",
		Name:        "30 days max",
		Description: "Remove versions after 30 days",
		KeepPeriods: []*tree.VersioningKeepPeriod{
			{IntervalStart: "0", MaxNumber: -1},
			{IntervalStart: "15d", MaxNumber: 10},
			{IntervalStart: "30d"},
		},
		VersionsDataSourceName: "versions",
		NodeDeletedStrategy:    tree.VersioningNodeDeletedStrategy_KeepLast,
	})

	keepAll, _ := json.Marshal(&tree.VersioningPolicy{
		Uuid:        "keep-all",
		Name:        "Keep all",
		Description: "Keep all versions forever",
		KeepPeriods: []*tree.VersioningKeepPeriod{
			{IntervalStart: "0", MaxNumber: -1},
		},
		VersionsDataSourceName: "versions",
		NodeDeletedStrategy:    tree.VersioningNodeDeletedStrategy_KeepAll,
	})

	regular, _ := json.Marshal(&tree.VersioningPolicy{
		Uuid:        "regular-pruning",
		Name:        "Regular Pruning",
		Description: "Prune versions regularly at various intervals and remove after 30 days",
		KeepPeriods: []*tree.VersioningKeepPeriod{
			{IntervalStart: "0", MaxNumber: 10},
			{IntervalStart: "10m", MaxNumber: 10},
			{IntervalStart: "3h", MaxNumber: 10},
			{IntervalStart: "1d", MaxNumber: 10},
			{IntervalStart: "10d", MaxNumber: 10},
			{IntervalStart: "30d", MaxNumber: 0},
		},
		VersionsDataSourceName: "versions",
		NodeDeletedStrategy:    tree.VersioningNodeDeletedStrategy_KeepLast,
	})

	dc := docstorec.DocStoreClient(ctx)
	if _, err := dc.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID:    common.DocStoreIdVersioningPolicies,
		DocumentID: "default-policy",
		Document: &docstore.Document{
			ID:    "default-policy",
			Owner: common.PydioSystemUsername,
			Type:  docstore.DocumentType_JSON,
			Data:  string(max30),
		},
	}); err != nil {
		return err
	}

	if _, err := dc.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID:    common.DocStoreIdVersioningPolicies,
		DocumentID: "keep-all",
		Document: &docstore.Document{
			ID:    "keep-all",
			Owner: common.PydioSystemUsername,
			Type:  docstore.DocumentType_JSON,
			Data:  string(keepAll),
		},
	}); err != nil {
		return err
	}

	if _, err := dc.PutDocument(ctx, &docstore.PutDocumentRequest{
		StoreID:    common.DocStoreIdVersioningPolicies,
		DocumentID: "regular-pruning",
		Document: &docstore.Document{
			ID:    "regular-pruning",
			Owner: common.PydioSystemUsername,
			Type:  docstore.DocumentType_JSON,
			Data:  string(regular),
		},
	}); err != nil {
		return err
	}

	return nil
}
