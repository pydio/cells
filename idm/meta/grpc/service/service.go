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

// Package service provides a GRPC persistence layer for user-defined metadata
package service

import (
	"context"

	"google.golang.org/grpc"
	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/broker"
	"github.com/pydio/cells/v5/common/errors"
	meta2 "github.com/pydio/cells/v5/common/nodes/meta"
	"github.com/pydio/cells/v5/common/proto/idm"
	service2 "github.com/pydio/cells/v5/common/proto/service"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/runtime/manager"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/idm/meta"
	grpc2 "github.com/pydio/cells/v5/idm/meta/grpc"
)

var (
	Name = common.ServiceGrpcNamespace_ + common.ServiceUserMeta
)

func init() {
	runtime.Register("main", func(ctx context.Context) {
		service.NewService(
			service.Name(Name),
			service.Context(ctx),
			service.Tag(common.ServiceTagIdm),
			service.Metadata(meta2.ServiceMetaProvider, "stream"),
			service.Metadata(meta2.ServiceMetaNsProvider, "list"),
			service.Metadata(meta2.ServiceMetaProviderRequired, "true"),
			service.Description("User-defined Metadata"),
			service.WithStorageDrivers(meta.Drivers),
			service.WithNamedStorageDrivers("meta-entities", meta.EntityDrivers),
			service.WithNamedStorageDrivers("meta-entity-values", meta.EntityValueDrivers),
			service.Migrations([]*service.Migration{
				{
					TargetVersion: service.FirstRunOrChange(),
					Up: func(ctx context.Context) error {
						return manager.StorageMigration()(ctx)
					},
				},
				{
					TargetVersion: service.FirstRun(),
					Up: func(ctx context.Context) error {
						// Migrate EntityDAO (Entities table)
						entityDAO, err := manager.Resolve[meta.EntityDAO](ctx, manager.WithName("meta-entities"))
						if err != nil {
							return err
						}
						if err = entityDAO.Migrate(ctx); err != nil {
							return err
						}
						// Migrate main DAO
						dao, err := manager.Resolve[meta.DAO](ctx)
						if err != nil {
							return err
						}
						if err = dao.Migrate(ctx); err != nil {
							return err
						}
						// Insert default metas and entities
						if err = defaultMetas(ctx, dao, entityDAO); err != nil {
							return err
						}
						// Migrate EntityValueDAO (EntityValues table and relations)
						entityValueDAO, err := manager.Resolve[meta.EntityValueDAO](ctx, manager.WithName("meta-entity-values"))
						if err != nil {
							return err
						}
						if err = entityValueDAO.Migrate(ctx); err != nil {
							return err
						}
						return nil

					},
				},
			}),
			service.Unique(true),
			service.WithGRPC(func(ctx context.Context, server grpc.ServiceRegistrar) error {

				handler := grpc2.NewHandler(ctx)
				idm.RegisterUserMetaServiceServer(server, handler)
				tree.RegisterNodeProviderStreamerServer(server, handler)

				// Clean role on user deletion
				if e := broker.SubscribeCancellable(ctx, common.TopicIdmEvent, func(ctx context.Context, message broker.Message) error {
					ev := &idm.ChangeEvent{}
					if ctx, e := message.Unmarshal(ctx, ev); e == nil {
						return grpc2.HandleClean(ctx, ev, Name)
					}
					return nil
				}, broker.WithCounterName("idm_meta")); e != nil {
					return e
				}

				return nil
			}),
		)
	})
}

func defaultMetas(ctx context.Context, dao meta.DAO, entityDAO meta.EntityDAO) error {
	err, _ := dao.GetNamespaceDao().Upsert(ctx, &idm.UserMetaNamespace{
		Namespace:      common.MetaNamespaceUserspacePrefix + "tags",
		Label:          "Tags",
		Indexable:      true,
		FieldType:      "tags",
		JsonDefinition: "{\"type\":\"tags\"}",
		Description:    "Default Tags",
		Policies: []*service2.ResourcePolicy{
			{Action: service2.ResourcePolicyAction_READ, Subject: "*", Effect: service2.ResourcePolicy_allow},
			{Action: service2.ResourcePolicyAction_WRITE, Subject: "*", Effect: service2.ResourcePolicy_allow},
		},
	})
	if err != nil && !errors.Is(err, gorm.ErrDuplicatedKey) {
		return err
	}
	log.Logger(ctx).Info("Inserted default namespace for metadata")

	// Insert default entities with admin-only policies
	defaultEntities := []*idm.MetaEntity{
		{
			Label:       "tags",
			Description: "Default tags entity",
			Policies: []*service2.ResourcePolicy{
				{Action: service2.ResourcePolicyAction_READ, Subject: "*", Effect: service2.ResourcePolicy_allow},
				{Action: service2.ResourcePolicyAction_WRITE, Subject: "*", Effect: service2.ResourcePolicy_allow},
			},
		},
	}
	for _, entity := range defaultEntities {
		if _, err = entityDAO.CreateEntity(ctx, entity); err != nil && !errors.Is(err, gorm.ErrDuplicatedKey) {
			log.Logger(ctx).Warn("could not insert default entity: " + entity.Label)
		}
	}
	log.Logger(ctx).Info("Inserted default entities")
	return nil
}
