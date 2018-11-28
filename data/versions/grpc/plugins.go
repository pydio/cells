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

// Package grpc is in charge of storing versions metadata
package grpc

import (
	"context"
	"encoding/json"
	"path"
	"time"

	"github.com/micro/go-micro"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/data/versions"
	"github.com/spf13/cobra"
)

var (
	Name = common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_VERSIONS
)

func init() {

	plugins.Register(func() {
		config.RegisterExposedConfigs(Name, ExposedConfigs)

		service.NewService(
			service.Name(Name),
			service.Tag(common.SERVICE_TAG_DATA),
			service.Description("Versioning service"),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, []string{}),
			service.Dependency(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_TREE, []string{}),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRun(),
					Up:            InitDefaults,
				},
			}),
			service.WithMicro(func(m micro.Service) error {

				serviceDir, e := config.ServiceDataDir(common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_VERSIONS)
				if e != nil {
					return e
				}
				store, err := versions.NewBoltStore(path.Join(serviceDir, "versions.db"))
				if err != nil {
					return err
				}

				engine := &Handler{
					db: store,
				}

				tree.RegisterNodeVersionerHandler(m.Options().Server, engine)

				jobsClient := jobs.NewJobServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_JOBS, defaults.NewClient())
				ctx, _ := context.WithTimeout(m.Options().Context, time.Second*1)
				for _, j := range getDefaultJobs() {
					jobsClient.PutJob(ctx, &jobs.PutJobRequest{Job: j})
				}

				return nil
			}),
		)
	})
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
		VersionsDataSourceBucket: "versions",
		VersionsDataSourceName:   "default",
	})

	keepAll, _ := json.Marshal(&tree.VersioningPolicy{
		Uuid:        "keep-all",
		Name:        "Keep all",
		Description: "Keep all versions forever",
		KeepPeriods: []*tree.VersioningKeepPeriod{
			{IntervalStart: "0", MaxNumber: -1},
		},
		VersionsDataSourceBucket: "versions",
		VersionsDataSourceName:   "default",
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
		VersionsDataSourceBucket: "versions",
		VersionsDataSourceName:   "default",
	})

	return service.Retry(func() error {

		dc := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
		_, e := dc.PutDocument(ctx, &docstore.PutDocumentRequest{
			StoreID:    common.DOCSTORE_ID_VERSIONING_POLICIES,
			DocumentID: "default-policy",
			Document: &docstore.Document{
				ID:    "default-policy",
				Owner: common.PYDIO_SYSTEM_USERNAME,
				Type:  docstore.DocumentType_JSON,
				Data:  string(max30),
			},
		})
		if e != nil {
			return e
		}

		_, e = dc.PutDocument(ctx, &docstore.PutDocumentRequest{
			StoreID:    common.DOCSTORE_ID_VERSIONING_POLICIES,
			DocumentID: "keep-all",
			Document: &docstore.Document{
				ID:    "keep-all",
				Owner: common.PYDIO_SYSTEM_USERNAME,
				Type:  docstore.DocumentType_JSON,
				Data:  string(keepAll),
			},
		})
		if e != nil {
			return e
		}

		_, e = dc.PutDocument(ctx, &docstore.PutDocumentRequest{
			StoreID:    common.DOCSTORE_ID_VERSIONING_POLICIES,
			DocumentID: "regular-pruning",
			Document: &docstore.Document{
				ID:    "regular-pruning",
				Owner: common.PYDIO_SYSTEM_USERNAME,
				Type:  docstore.DocumentType_JSON,
				Data:  string(regular),
			},
		})

		return e
	}, 3*time.Second, 10*time.Second)

}
