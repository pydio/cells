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

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/storage/sql"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/uuid"
	"github.com/pydio/cells/v5/idm/policy"
	"github.com/pydio/cells/v5/idm/policy/converter"
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

// MigrateLegacy migrates v4 => v5 schema - MySQL only as PG was not supported in older versions!
func (s *sqlimpl) MigrateLegacy(ctx context.Context) error {
	db := s.instance(ctx)
	if db.Name() == sql.MySQLDriver {
		mig := db.Migrator()
		if mig.HasTable("idm_policy_group") {
			log.Logger(ctx).Info("Renaming existing tables idm_policy_group and idm_policy_rel")
			if er := mig.RenameTable("idm_policy_group", &idm.PolicyGroup{}); er != nil {
				return er
			}
			if er := mig.RenameTable("idm_policy_rel", &idm.PolicyRel{}); er != nil {
				return er
			}
		}

		if mig.HasTable("ladon_policy") {
			err := db.Transaction(func(tx *gorm.DB) error {
				tx = tx.Exec(`ALTER TABLE ladon_policy ADD COLUMN effect_int INT`)
				tx = tx.Exec(`UPDATE ladon_policy 
SET effect_int = CASE
    WHEN effect = 'deny' THEN 1
    WHEN effect = 'allow' THEN 2
    ELSE 0
END`)
				tx = tx.Exec(`ALTER TABLE ladon_policy DROP COLUMN effect`)
				tx = tx.Exec(`ALTER TABLE ladon_policy CHANGE COLUMN effect_int effect INT`)
				return tx.Error
			})

			if err != nil {
				return err
			}
			log.Logger(ctx).Info("Converted ladon_policy.effect from enum to int")
			if er := mig.RenameTable("ladon_policy", &idm.Policy{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_policy to idm_ladon_policy")
		}
		if mig.HasTable("ladon_subject") {
			if mig.HasTable("ladon_policy_subject") {
				if er := mig.DropTable("ladon_policy_subject"); er != nil {
					return er
				}
				log.Logger(ctx).Info("Dropped legacy table ladon_policy_subject")
			}
			if er := mig.RenameTable("ladon_subject", &idm.PolicySubject{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_subject to idm_ladon_policy_subject")
		}
		if mig.HasTable("ladon_resource") {
			if mig.HasTable("ladon_policy_resource") {
				if er := mig.DropTable("ladon_policy_resource"); er != nil {
					return er
				}
				log.Logger(ctx).Info("Dropped legacy table ladon_policy_resource")
			}
			if er := mig.RenameTable("ladon_resource", &idm.PolicyResource{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_resource to idm_ladon_policy_resource")
		}
		if mig.HasTable("ladon_action") {
			if er := mig.RenameTable("ladon_action", &idm.PolicyAction{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_action to idm_ladon_policy_action")
		}
		if mig.HasTable("ladon_policy_action_rel") {
			if er := mig.RenameTable("ladon_policy_action_rel", &idm.PolicyActionRel{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_policy_action_rel to idm_ladon_policy_action_rel")
		}
		if mig.HasTable("ladon_policy_subject_rel") {
			if er := mig.RenameTable("ladon_policy_subject_rel", &idm.PolicySubjectRel{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_policy_subject_rel to idm_ladon_policy_subject_rel")
		}
		if mig.HasTable("ladon_policy_resource_rel") {
			if er := mig.RenameTable("ladon_policy_resource_rel", &idm.PolicyResourceRel{}); er != nil {
				return er
			}
			log.Logger(ctx).Info("Renamed ladon_policy_resource_rel to idm_ladon_policy_resource_rel")
		}
	}
	return nil
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

	storeGroup := proto.Clone(group).(*idm.PolicyGroup)
	storeGroup.LastUpdated = int32(time.Now().Unix())
	deleteFirst := true

	if storeGroup.GetUuid() == "" {
		storeGroup.Uuid = uuid.New()
		deleteFirst = false
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
	er := s.instance(ctx).Transaction(func(tx *gorm.DB) error {
		if deleteFirst {
			if er := s.deleteInTransaction(ctx, tx, storeGroup); er != nil {
				return er
			}
		}
		tx = tx.Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "uuid"}},
			DoUpdates: clause.AssignmentColumns([]string{"name", "description", "owner_uuid", "resource_group", "last_updated"}), // column needed to be updated
		}).Create(storeGroup)
		return tx.Error
	})

	return storeGroup, er

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
			// These should not be exposed to outside world
			p.OrmActions = nil
			p.OrmResources = nil
			p.OrmSubjects = nil
		}
	}

	return
}

// DeletePolicyGroup deletes a policy group and all related policies.
func (s *sqlimpl) DeletePolicyGroup(ctx context.Context, group *idm.PolicyGroup) error {

	// TODO - cascade ?
	return s.instance(ctx).Transaction(func(tx *gorm.DB) error {
		return s.deleteInTransaction(ctx, tx, group)
	})

}

func (s *sqlimpl) deleteInTransaction(ctx context.Context, tx *gorm.DB, group *idm.PolicyGroup) error {
	var rels []*idm.PolicyRel
	tx1 := tx.Where(&idm.PolicyRel{GroupUUID: group.GetUuid()}).Find(&rels)
	if tx1.Error != nil {
		return tx1.Error
	}
	tx2 := tx.Where(&idm.PolicyRel{GroupUUID: group.GetUuid()}).Delete(&idm.PolicyRel{})
	if tx2.Error != nil {
		return tx2.Error
	}
	for _, rel := range rels {
		if err := s.deletePolicyById(ctx, tx, rel.PolicyID); err != nil {
			return err
		}
	}
	// Clean orphan rows
	if tx11 := tx.Where("id NOT IN (?)", tx.Model(&idm.PolicyActionRel{}).Select("DISTINCT action")).Delete(&idm.PolicyAction{}); tx11.Error != nil {
		return tx11.Error
	}
	if tx21 := tx.Where("id NOT IN (?)", tx.Model(&idm.PolicySubjectRel{}).Select("DISTINCT subject")).Delete(&idm.PolicySubject{}); tx21.Error != nil {
		return tx21.Error
	}
	if tx31 := tx.Where("id NOT IN (?)", tx.Model(&idm.PolicyResourceRel{}).Select("DISTINCT resource")).Delete(&idm.PolicyResource{}); tx31.Error != nil {
		return tx31.Error
	}
	tx = tx.Where(&idm.PolicyGroup{Uuid: group.GetUuid()}).Delete(&idm.PolicyGroup{})
	return tx.Error
}

func (s *sqlimpl) deletePolicyById(ctx context.Context, tx *gorm.DB, id string) error {
	if tx1 := tx.Where(&idm.PolicyActionRel{Policy: id}).Delete(&idm.PolicyActionRel{}); tx1.Error != nil {
		return tx1.Error
	}
	if tx2 := tx.Where(&idm.PolicySubjectRel{Policy: id}).Delete(&idm.PolicySubjectRel{}); tx2.Error != nil {
		return tx2.Error
	}
	if tx3 := tx.Where(&idm.PolicyResourceRel{Policy: id}).Delete(&idm.PolicyResourceRel{}); tx3.Error != nil {
		return tx3.Error
	}
	tx4 := tx.Where(&idm.Policy{ID: id}).Delete(&idm.Policy{})
	return tx4.Error
}

// IsAllowed implements API
func (s *sqlimpl) IsAllowed(ctx context.Context, r *ladon.Request) error {
	mg := NewManager(s.instance(ctx)).WithContext(ctx)
	return (&ladon.Ladon{Manager: mg}).IsAllowed(r)
}
