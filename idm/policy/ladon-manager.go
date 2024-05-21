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

package policy

import (
	"context"
	"database/sql"
	"fmt"
	"sync"

	"github.com/ory/ladon"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/idm/policy/converter"
)

var _ ladon.Manager = (*gormManager)(nil)

var _ ladon.Manager = (*managerWithContext)(nil)

type Manager interface {
	WithContext(ctx context.Context) ladon.Manager
	ladon.Manager
	ladon.Warden
}

// Manager is a gorm implementation for Manager to store policies persistently.
type gormManager struct {
	db   *gorm.DB
	once *sync.Once
}

type managerWithContext struct {
	*gormManager
	ctx context.Context
}

//type Policy struct {
//	ID          string     `gorm:"column:id;type:varchar(255);primaryKey;notNull"`
//	Description string     `gorm:"column:description;"`
//	Effect      string     `gorm:"column:effect;"`
//	Conditions  string     `gorm:"column:conditions;"`
//	Actions     []Action   `gorm:"many2many:policy_action_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Action;constraint:OnDelete:CASCADE;"`
//	Resources   []Resource `gorm:"many2many:policy_resource_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Resource;constraint:OnDelete:CASCADE;"`
//	Subjects    []Subject  `gorm:"many2many:policy_subject_rel;foreignKey:ID;joinForeignKey:Policy;References:ID;joinReferences:Subject;constraint:OnDelete:CASCADE;"`
//}
//
//type Resource struct {
//	ID       string `gorm:"column:id;type:varchar(64);primaryKey;notNull"`
//	HasRegex bool   `gorm:"column:has_regex;"`
//	Compiled string `gorm:"column:compiled; unique"`
//	Template string `gorm:"column:template; unique"`
//}
//
//type Subject struct {
//	ID       string `gorm:"column:id;type:varchar(64);primaryKey;notNull"`
//	HasRegex bool   `gorm:"column:has_regex;"`
//	Compiled string `gorm:"column:compiled; unique"`
//	Template string `gorm:"column:template; unique"`
//}
//
//type Action struct {
//	ID       string `gorm:"column:id;type:varchar(64);primaryKey;notNull"`
//	HasRegex bool   `gorm:"column:has_regex;"`
//	Compiled string `gorm:"column:compiled; unique"`
//	Template string `gorm:"column:template; unique"`
//}
//
//type PolicyResourceRel struct {
//	Policy   string `gorm:"column:policy; primaryKey"`
//	Resource string `gorm:"column:resource; primaryKey"`
//}
//
//type PolicySubjectRel struct {
//	Policy  string `gorm:"column:policy; primaryKey"`
//	Subject string `gorm:"column:subject; primaryKey"`
//}
//
//type PolicyActionRel struct {
//	Policy string `gorm:"column:policy; primaryKey"`
//	Action string `gorm:"column:action; primaryKey"`
//}

// NewManager initializes a new SQLManager for given db instance.
func NewManager(db *gorm.DB) Manager {
	m := &gormManager{
		db: db,
	}

	return m
}

func (m *gormManager) WithContext(ctx context.Context) ladon.Manager {
	return &managerWithContext{
		gormManager: m,
		ctx:         ctx,
	}
}

func (m *gormManager) Create(policy ladon.Policy) error {
	panic("manager should be be called without context")
}

func (m *gormManager) Update(policy ladon.Policy) error {
	panic("manager should be be called without context")
}

func (m *gormManager) Get(id string) (ladon.Policy, error) {
	panic("manager should be be called without context")
}

func (m *gormManager) Delete(id string) error {
	panic("manager should be be called without context")
}

func (m *gormManager) GetAll(limit, offset int64) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *gormManager) FindRequestCandidates(r *ladon.Request) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *gormManager) FindPoliciesForSubject(subject string) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *gormManager) FindPoliciesForResource(resource string) (ladon.Policies, error) {
	panic("manager should be be called without context")
}

func (m *gormManager) IsAllowed(r *ladon.Request) error {
	panic("manager is not allowed")
}

func (s *managerWithContext) instance(ctx context.Context) *gorm.DB {
	if s.once == nil {
		s.once = &sync.Once{}
	}

	db := s.db.Session(&gorm.Session{SkipDefaultTransaction: true}).WithContext(ctx)

	//s.once.Do(func() {
	//	db.SetupJoinTable(&idm.Policy{}, "Subjects", &idm.PolicySubjectRel{})
	//	db.SetupJoinTable(&idm.Policy{}, "Resources", &idm.PolicyResourceRel{})
	//	db.SetupJoinTable(&idm.Policy{}, "Actions", &idm.PolicyActionRel{})
	//
	//	db.AutoMigrate(&idm.PolicyResource{}, &idm.PolicyAction{}, &idm.PolicySubject{}, &idm.Policy{})
	//})

	return db
}

// Create inserts a new policy
func (s *managerWithContext) Create(policy ladon.Policy) (err error) {
	tx := s.instance(s.ctx).Clauses(clause.OnConflict{DoNothing: true}).Create(converter.LadonToProtoPolicy(policy))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

// Update updates an existing policy.
func (s *managerWithContext) Update(policy ladon.Policy) error {
	tx := s.instance(s.ctx).Updates(converter.LadonToProtoPolicy(policy))
	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *managerWithContext) FindRequestCandidates(r *ladon.Request) (ladon.Policies, error) {
	var policies []*idm.Policy

	db := s.instance(s.ctx)

	tx := db.Model(&idm.Policy{}).Preload("Actions").Preload("Resources").Preload("Subjects")

	if r.Subject != "" {
		qs1 := db.Model(&idm.PolicySubjectRel{}).Select("policy as rel_policy_id, subject as rel_subject_id")
		qs2 := db.Model(&idm.PolicySubject{}).Select("id as subject_id, has_regex as subject_regex, template as subject_template, compiled as subject_compiled")
		tx = tx.
			InnerJoins("inner join(?) qs1 on id = qs1.rel_policy_id", qs1).
			InnerJoins("inner join(?) qs2 on qs1.rel_subject_id = qs2.subject_id", qs2)
	}

	if r.Resource != "" {
		qr1 := db.Model(&idm.PolicyResourceRel{}).Select("policy as rel_policy_id, resource as rel_resource_id")
		qr2 := db.Model(&idm.PolicyResource{}).Select("id as resource_id, has_regex as resource_regex, template as resource_template, compiled as resource_compiled")
		tx = tx.
			InnerJoins("inner join(?) qr1 on id = qr1.rel_policy_id", qr1).
			InnerJoins("inner join(?) qr2 on qr1.rel_resource_id = qr2.resource_id", qr2) //.
	}

	if r.Action != "" {
		qa1 := db.Model(&idm.PolicyActionRel{}).Select("policy as rel_policy_id, action as rel_action_id")
		qa2 := db.Model(&idm.PolicyAction{}).Select("id as action_id, has_regex as action_regex, template as action_template, compiled as action_compiled")
		tx = tx.
			InnerJoins("inner join(?) qa1 on id = qa1.rel_policy_id", qa1).
			InnerJoins("inner join(?) qa2 on qa1.rel_action_id = qa2.action_id", qa2) //.
	}

	regexpBuilder := func(table, key string) string {
		return fmt.Sprintf("%s = true and CAST(? AS BINARY) REGEXP BINARY %s", table+"."+key+"_regex", table+"."+key+"_compiled")
	}
	if db.Name() == "sqlite" {
		// Warning, this requires sqlite3-extended driver with injected function REGEXP_LIKE
		regexpBuilder = func(table, key string) string {
			return fmt.Sprintf("%s = true and REGEXP_LIKE(?, %s)", table+"."+key+"_regex", table+"."+key+"_compiled")
		}
	}

	if r.Subject != "" {
		// This is required to force AND (a OR b) AND (c OR d), etc...
		tx1 := tx.Session(&gorm.Session{NewDB: true})
		tx = tx.Where(
			tx1.Where("qs2.subject_regex = false and qs2.subject_template = ?", r.Subject).
				Or(regexpBuilder("qs2", "subject"), r.Subject))
	}
	if r.Resource != "" {
		tx2 := tx.Session(&gorm.Session{NewDB: true})
		tx = tx.Where(
			tx2.Where("qr2.resource_regex = false and qr2.resource_template = ?", r.Resource).
				Or(regexpBuilder("qr2", "resource"), r.Resource))
	}
	if r.Action != "" {
		tx3 := tx.Session(&gorm.Session{NewDB: true})
		tx = tx.Where(
			tx3.Where("qa2.action_regex = false and qa2.action_template = ?", r.Action).
				Or(regexpBuilder("qa2", "action"), r.Action))
	}
	tx = tx.Find(&policies)
	if tx.Error != nil {
		return nil, tx.Error
	}

	var res ladon.Policies
	for _, policy := range policies {
		res = append(res, converter.ProtoToLadonPolicy(policy))
	}

	return res, nil
}

func (s *managerWithContext) FindPoliciesForResource(resource string) (ladon.Policies, error) {
	return s.FindRequestCandidates(&ladon.Request{Resource: resource})
}

func (s *managerWithContext) FindPoliciesForSubject(subject string) (ladon.Policies, error) {
	return s.FindRequestCandidates(&ladon.Request{Subject: subject})
}

// GetAll returns all policies
func (s *managerWithContext) GetAll(limit, offset int64) (ladon.Policies, error) {
	var policies []*idm.Policy
	tx := s.instance(s.ctx).
		Preload("Actions").Preload("Resources").Preload("Subjects").
		Limit(int(limit)).Offset(int(offset)).Find(&policies)

	if tx.Error != nil {
		return nil, tx.Error
	}

	var res ladon.Policies
	for _, policy := range policies {
		res = append(res, converter.ProtoToLadonPolicy(policy))
	}

	return res, nil
}

// Get retrieves a policy.
func (s *managerWithContext) Get(id string) (ladon.Policy, error) {
	var policy *idm.Policy
	tx := s.instance(s.ctx).Preload("Actions").Preload("Resources").Preload("Subjects").Where(&idm.Policy{ID: id}).Find(&policy)

	if tx.Error != nil {
		return nil, tx.Error
	}

	if tx.RowsAffected == 0 {
		return nil, ladon.NewErrResourceNotFound(sql.ErrNoRows)
	}

	return converter.ProtoToLadonPolicy(policy), nil
}

// Delete removes a policy.
func (s *managerWithContext) Delete(id string) error {
	tx := s.instance(s.ctx).Where(&idm.Policy{ID: id}).Delete(&idm.Policy{})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}
