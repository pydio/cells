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

package sql

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/ory/ladon"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/policy"
)

func init() {
	policy.Drivers.Register(NewDAO)
}

func NewDAO(db *gorm.DB) policy.DAO {
	return &sqlimpl{DB: db, Manager: NewManager(db)}
}

type sqlimpl struct {
	DB *gorm.DB

	Manager

	once *sync.Once
}

func (s *sqlimpl) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.DB.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	s.once.Do(func() {
		db.SetupJoinTable(&idm.PolicyGroup{}, "Policies", &idm.PolicyRel{})
		db.SetupJoinTable(&idm.Policy{}, "Actions", &idm.PolicyActionRel{})
		db.SetupJoinTable(&idm.Policy{}, "Resources", &idm.PolicyResourceRel{})
		db.SetupJoinTable(&idm.Policy{}, "Subjects", &idm.PolicySubjectRel{})
	})

	return db
}

func (s *sqlimpl) Migrate(ctx context.Context) error {
	if err := s.instance(ctx).AutoMigrate(&idm.PolicyAction{}, &idm.PolicyResource{}, &idm.PolicySubject{}, &idm.Policy{}, &idm.PolicyGroup{}); err != nil {
		return err
	}

	return nil
}

// StorePolicyGroup first upserts policies (and fail fast) before upserting the passed policy group
// and recreating corresponding relations.
func (s *sqlimpl) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {

	if group.GetUUID() == "" {
		group.UUID = uuid.New()
	} else {
		if err := s.DeletePolicyGroup(ctx, group); err != nil {
			return nil, err
		}
	}

	// Insert Policy Group
	s.instance(ctx).Clauses(clause.OnConflict{
		DoUpdates: clause.AssignmentColumns([]string{"name", "description", "owner_uuid", "resource_group", "last_updated"}), // column needed to be updated
	}).Create(&idm.PolicyGroup{
		UUID:          group.GetUUID(),
		Name:          group.Name,
		Description:   group.Description,
		OwnerUUID:     group.GetOwnerUUID(),
		ResourceGroup: group.ResourceGroup,
		LastUpdated:   int32(time.Now().Unix()),
		Policies:      group.Policies,
	})

	return group, nil

}

// ListPolicyGroups searches the db and returns an array of PolicyGroup.
func (s *sqlimpl) ListPolicyGroups(ctx context.Context, filter string) (groups []*idm.PolicyGroup, e error) {

	tx := s.instance(ctx)

	if strings.HasPrefix(filter, "resource_group:") {

		res := strings.TrimPrefix(filter, "resource_group:")
		if resId, ok := idm.PolicyResourceGroup_value[res]; ok {
			tx = tx.Where(&idm.PolicyGroup{ResourceGroup: idm.PolicyResourceGroup(resId)})
		}
	} else if strings.HasPrefix(filter, "uuid:") {
		id := strings.TrimPrefix(filter, "uuid:")

		tx = tx.Where(&idm.PolicyGroup{UUID: id})
	} else if strings.HasPrefix(filter, "like:") {
		like := "%" + strings.TrimPrefix(filter, "like:") + "%"

		tx = tx.Where(clause.Like{Column: "name", Value: like}).Or(clause.Like{Column: "description", Value: like})
	}

	tx = tx.Preload("Policies.Actions").Preload("Policies.Resources").Preload("Policies.Subjects").Preload("Policies").Find(&groups)
	if tx.Error != nil {
		return nil, tx.Error
	}

	return
}

// DeletePolicyGroup deletes a policy group and all related policies.
func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	// TODO - cascade ?
	tx := s.instance(ctx).Where(&idm.PolicyGroup{UUID: group.GetUUID()}).Delete(&idm.PolicyGroup{})
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// IsAllowed implements API
func (s *sqlimpl) IsAllowed(ctx context.Context, r *ladon.Request) error {
	mg := NewManager(s.instance(ctx)).WithContext(ctx)
	return (&ladon.Ladon{Manager: mg}).IsAllowed(r)
}
