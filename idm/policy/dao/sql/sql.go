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
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/ory/ladon"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/service"
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
				tx = tx.Exec(`ALTER TABLE ladon_policy MODIFY COLUMN conditions LONGTEXT NULL`)
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

	if deleteFirst {
		if er := sql.WithTxRetry(ctx, s.instance(ctx), 3, "storing policy group "+storeGroup.GetUuid(), func(tx *gorm.DB) error {
			// Insert Policy Group - with transaction retries
			if er := s.deleteInTransaction(ctx, tx, storeGroup); er != nil {
				return er
			}
			return tx.Error
		}); er != nil {
			return nil, er
		}
	}

	tx2 := s.instance(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "uuid"}},
		DoUpdates: clause.AssignmentColumns([]string{"name", "description", "owner_uuid", "resource_group", "last_updated"}), // column needed to be updated
	}).Create(storeGroup)
	if tx2.Error != nil {
		return nil, tx2.Error
	}

	if deleteFirst {
		if err := s.cleanupOrphans(ctx); err != nil {
			return nil, err
		}
	}

	return storeGroup, nil

}

// ListPolicyGroups searches the db and returns an array of PolicyGroup.
func (s *sqlimpl) ListPolicyGroups(ctx context.Context, query service.Enquirer) (groups []*idm.PolicyGroup, e error) {

	tx, err := service.NewQueryBuilder[*gorm.DB](query, new(queryConverter)).Build(ctx, s.instance(ctx))
	if err != nil {
		return nil, err
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

	if err := s.instance(ctx).Transaction(func(tx *gorm.DB) error {
		return s.deleteInTransaction(ctx, tx, group)
	}); err != nil {
		return err
	}

	return s.cleanupOrphans(ctx)
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

	// Orphan rows cleaning is done outside of the transaction to avoid Deadlocks
	// see cleanupOrphans function

	tx = tx.Where(&idm.PolicyGroup{Uuid: group.GetUuid()}).Delete(&idm.PolicyGroup{})
	return tx.Error
}

func (s *sqlimpl) cleanupOrphans(ctx context.Context) error {
	db := s.instance(ctx)
	// --- 3. Clean up orphan rows using LEFT JOIN (no NOT IN) ---
	// Table names are dynamically derived from the model metadata.
	actionTable := sql.TableNameFromModel(db, &idm.PolicyAction{})
	actionRelTable := sql.TableNameFromModel(db, &idm.PolicyActionRel{})
	subjectTable := sql.TableNameFromModel(db, &idm.PolicySubject{})
	subjectRelTable := sql.TableNameFromModel(db, &idm.PolicySubjectRel{})
	resourceTable := sql.TableNameFromModel(db, &idm.PolicyResource{})
	resourceRelTable := sql.TableNameFromModel(db, &idm.PolicyResourceRel{})

	driver := strings.ToLower(db.Name())
	var sqls []string

	switch driver {

	case sql.MySQLDriver:
		sqls = []string{
			fmt.Sprintf(`DELETE a FROM %s AS a LEFT JOIN %s AS r ON a.id = r.action WHERE r.action IS NULL`, actionTable, actionRelTable),
			fmt.Sprintf(`DELETE s FROM %s AS s LEFT JOIN %s AS r ON s.id = r.subject WHERE r.subject IS NULL`, subjectTable, subjectRelTable),
			fmt.Sprintf(`DELETE r FROM %s AS r LEFT JOIN %s AS rr ON r.id = rr.resource WHERE rr.resource IS NULL`, resourceTable, resourceRelTable),
		}

	case sql.SqliteDriver:
		fallthrough
	case sql.PostgreDriver:
		sqls = []string{
			fmt.Sprintf(`DELETE FROM %s WHERE NOT EXISTS (SELECT 1 FROM %s WHERE %s.action = %s.id)`, actionTable, actionRelTable, actionRelTable, actionTable),
			fmt.Sprintf(`DELETE FROM %s WHERE NOT EXISTS (SELECT 1 FROM %s WHERE %s.subject = %s.id)`, subjectTable, subjectRelTable, subjectRelTable, subjectTable),
			fmt.Sprintf(`DELETE FROM %s WHERE NOT EXISTS (SELECT 1 FROM %s WHERE %s.resource = %s.id)`, resourceTable, resourceRelTable, resourceRelTable, resourceTable),
		}

	default:
		return fmt.Errorf("unsupported SQL dialect: %s", driver)
	}

	for _, q := range sqls {
		if res := db.Exec(q); res.Error != nil {
			return res.Error
		} else {
			log.Logger(ctx).Debugf("Cleaned %d rows", res.RowsAffected)
		}
	}
	return nil
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
	mg := NewManager(s.instance(ctx))
	return (&ladon.Ladon{Manager: mg}).IsAllowed(ctx, r)
}

type queryConverter idm.PolicyGroupSingleQuery

func (c *queryConverter) Convert(ctx context.Context, val *anypb.Any, db *gorm.DB) (*gorm.DB, bool, error) {

	q := new(idm.PolicyGroupSingleQuery)

	if err := anypb.UnmarshalTo(val, q, proto.UnmarshalOptions{}); err != nil {
		return nil, false, nil
	}
	count := 0

	where := db.Where
	if q.GetNot() {
		where = db.Not
	}

	if res := q.GetResourceGroup(); res != "" {
		if resId, ok := idm.PolicyResourceGroup_value[res]; ok {
			if !q.GetLike() {
				cl := clause.Eq{Column: "resource_group", Value: resId}
				db = where(cl)
			} else {
				cl := clause.Like{Column: "resource_group", Value: resId}
				db = where(cl)
			}
		}

		count++
	}

	if uuid := q.GetUuid(); uuid != "" {
		if !q.GetLike() {
			cl := clause.Eq{Column: "uuid", Value: uuid}
			db = where(cl)
		} else {
			cl := clause.Like{Column: "uuid", Value: uuid}
			db = where(cl)
		}
		count++
	}

	if name := q.GetName(); name != "" {
		if !q.GetLike() {
			cl := clause.Eq{Column: "name", Value: name}
			db = where(cl)
		} else {
			cl := clause.Like{Column: "name", Value: name}
			db = where(cl)
		}

		count++
	}

	if desc := q.GetDescription(); desc != "" {
		if !q.GetLike() {
			cl := clause.Eq{Column: "description", Value: desc}
			db = where(cl)
		} else {
			cl := clause.Like{Column: "description", Value: desc}
			db = where(cl)
		}
	}

	if len(q.GetPolicySubject()) > 0 {
		subjectTable := sql.TableNameFromModel(db, &idm.PolicySubject{})
		subjectRelTable := sql.TableNameFromModel(db, &idm.PolicySubjectRel{})
		policyGroupTable := sql.TableNameFromModel(db, &idm.PolicyGroup{})
		policyRelTable := sql.TableNameFromModel(db, &idm.PolicyRel{})
		policyTable := sql.TableNameFromModel(db, &idm.Policy{})

		subjects := strings.Join(q.GetPolicySubject(), "|")

		// Joins won't apply to the main queries because it is wrapped in a where clause - so we do an intermediate query to retrieve the ids
		var policyGroups []*idm.PolicyGroup
		tx := db.Session(&gorm.Session{}).Joins("LEFT JOIN "+policyRelTable+" AS pr ON pr.group_uuid = "+policyGroupTable+".uuid").
			Joins("LEFT JOIN "+policyTable+" AS p ON p.id = pr.policy_id").
			Joins("LEFT JOIN "+subjectRelTable+" AS psr ON psr.policy = p.id").
			Joins("LEFT JOIN "+subjectTable+" AS ps ON ps.id = psr.subject").
			Where("ps.template = ?", subjects).
			Find(&policyGroups)

		if tx.Error != nil {
			return nil, false, tx.Error
		}

		db = where(policyGroups)

		count++
	}

	return db, count > 0, nil
}
