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
	"google.golang.org/protobuf/proto"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/telemetry/log"
	"github.com/pydio/cells/v4/common/utils/uuid"
	"github.com/pydio/cells/v4/idm/policy"
	"github.com/pydio/cells/v4/idm/policy/converter"
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
		db.SetupJoinTable(&idm.Policy{}, "OrmActions", &idm.PolicyActionRel{})
		db.SetupJoinTable(&idm.Policy{}, "OrmResources", &idm.PolicyResourceRel{})
		db.SetupJoinTable(&idm.Policy{}, "OrmSubjects", &idm.PolicySubjectRel{})
	})

	return db
}

type LegacyPolicyGroup struct{}

func (g LegacyPolicyGroup) TableName() string {
	return "idm_policy_group"
}

type LegacyPolicyRel struct{}

func (g LegacyPolicyRel) TableName() string {
	return "idm_policy_rel"
}

func (s *sqlimpl) Migrate(ctx context.Context) error {

	mig := s.instance(ctx).Migrator()
	if mig.HasTable(&LegacyPolicyGroup{}) {
		log.Logger(ctx).Info("Renaming existing tables idm_policy_group and idm_policy_rel")
		if er := mig.RenameTable(&LegacyPolicyGroup{}, &idm.PolicyGroup{}); er != nil {
			return er
		}
		if er := mig.RenameTable(&LegacyPolicyRel{}, &idm.PolicyRel{}); er != nil {
			return er
		}
	}
	if err := s.instance(ctx).AutoMigrate(&idm.PolicyAction{}, &idm.PolicyResource{}, &idm.PolicySubject{}, &idm.Policy{}, &idm.PolicyGroup{}); err != nil {
		return err
	}

	return nil
}

// StorePolicyGroup first upserts policies (and fail fast) before upserting the passed policy group
// and recreating corresponding relations.
func (s *sqlimpl) StorePolicyGroup(ctx context.Context, group *idm.PolicyGroup) (*idm.PolicyGroup, error) {

	storeGroup := proto.Clone(group).(*idm.PolicyGroup)
	storeGroup.LastUpdated = int32(time.Now().Unix())

	if storeGroup.GetUuid() == "" {
		storeGroup.Uuid = uuid.New()
	} else {
		if err := s.DeletePolicyGroup(ctx, storeGroup); err != nil {
			return nil, err
		}
	}

	for _, p := range storeGroup.Policies {
		for _, template := range p.GetActions() {
			action := &idm.PolicyAction{}
			if err := converter.StringToTemplate(template, action); err == nil {
				p.OrmActions = append(p.OrmActions, action)
			}
		}
		for _, template := range p.GetResources() {
			resource := &idm.PolicyResource{}
			if err := converter.StringToTemplate(template, resource); err == nil {
				p.OrmResources = append(p.OrmResources, resource)
			}
		}
		for _, template := range p.GetSubjects() {
			subject := &idm.PolicySubject{}
			if err := converter.StringToTemplate(template, subject); err == nil {
				p.OrmSubjects = append(p.OrmSubjects, subject)
			}
		}
	}

	// Insert Policy Group
	s.instance(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "uuid"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "description", "owner_uuid", "resource_group", "last_updated"}), // column needed to be updated
	}).Create(storeGroup)

	return storeGroup, nil

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

		tx = tx.Where(&idm.PolicyGroup{Uuid: id})
	} else if strings.HasPrefix(filter, "like:") {
		like := "%" + strings.TrimPrefix(filter, "like:") + "%"

		tx = tx.Where(clause.Like{Column: "name", Value: like}).Or(clause.Like{Column: "description", Value: like})
	}

	tx = tx.Preload("Policies.OrmActions").Preload("Policies.OrmResources").Preload("Policies.OrmSubjects").Preload("Policies").Find(&groups)
	if tx.Error != nil {
		return nil, tx.Error
	}
	// Convert OrmXX to XX
	for _, gr := range groups {
		for _, p := range gr.Policies {
			for _, a := range p.OrmActions {
				p.Actions = append(p.Actions, a.Template)
			}
			for _, r := range p.OrmResources {
				p.Resources = append(p.Resources, r.Template)
			}
			for _, sub := range p.OrmSubjects {
				p.Subjects = append(p.Subjects, sub.Template)
			}
		}
	}

	return
}

// DeletePolicyGroup deletes a policy group and all related policies.
func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	// TODO - cascade ?
	tx := s.instance(ctx).Where(&idm.PolicyGroup{Uuid: group.GetUuid()}).Delete(&idm.PolicyGroup{})
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
