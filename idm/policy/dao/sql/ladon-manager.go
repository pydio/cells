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

package sql

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"sync"

	"github.com/ory/ladon"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/pydio/cells/v4/common/proto/idm"
	storagesql "github.com/pydio/cells/v4/common/storage/sql"
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

type ScanPolicy struct {
	ID          string                          `gorm:"column:id"`
	Description string                          `gorm:"column:description;"`
	Subject     string                          `gorm:"column:subject;"`
	Resource    string                          `gorm:"column:resource;"`
	Action      string                          `gorm:"column:action;"`
	Effect      idm.PolicyEffect                `gorm:"column:effect;"`
	Conditions  map[string]*idm.PolicyCondition `gorm:"column:conditions;serializer:json;"`
}

func (s *managerWithContext) FindRequestCandidates(r *ladon.Request) (ladon.Policies, error) {
	var policies []*ScanPolicy

	db := s.instance(s.ctx)
	polTable := storagesql.TableNameFromModel(db, &idm.Policy{})
	acTable := storagesql.TableNameFromModel(db, &idm.PolicyAction{})
	resTable := storagesql.TableNameFromModel(db, &idm.PolicyResource{})
	subTable := storagesql.TableNameFromModel(db, &idm.PolicySubject{})
	acTableRel := storagesql.TableNameFromModel(db, &idm.PolicyActionRel{})
	resTableRel := storagesql.TableNameFromModel(db, &idm.PolicyResourceRel{})
	subTableRel := storagesql.TableNameFromModel(db, &idm.PolicySubjectRel{})

	polTable = storagesql.QuoteTo(db, polTable)
	acTable = storagesql.QuoteTo(db, acTable)
	resTable = storagesql.QuoteTo(db, resTable)
	subTable = storagesql.QuoteTo(db, subTable)
	acTableRel = storagesql.QuoteTo(db, acTableRel)
	resTableRel = storagesql.QuoteTo(db, resTableRel)
	subTableRel = storagesql.QuoteTo(db, subTableRel)

	query := db.Model(&idm.Policy{}).
		Select(fmt.Sprintf("%s.id, %s.effect, %s.conditions, %s.description, "+
			"subject.template AS subject, resource.template AS resource, action.template AS action", polTable, polTable, polTable, polTable)).
		Joins(fmt.Sprintf("INNER JOIN %s AS rs ON rs.policy = %s.id", subTableRel, polTable)).
		Joins(fmt.Sprintf("LEFT JOIN %s AS ra ON ra.policy = %s.id", acTableRel, polTable)).
		Joins(fmt.Sprintf("LEFT JOIN %s AS action ON ra.action = action.id", acTable)).
		Joins(fmt.Sprintf("INNER JOIN %s AS subject ON rs.subject = subject.id", subTable)).
		Joins(fmt.Sprintf("LEFT JOIN %s AS rr ON rr.policy = %s.id", resTableRel, polTable)).
		Joins(fmt.Sprintf("LEFT JOIN %s AS resource ON rr.resource = resource.id", resTable))

	var reg func(string) string
	switch db.Name() {
	case storagesql.PostgreDriver:
		reg = func(s string) string {
			return fmt.Sprintf("? ~ %s", s)
		}
	case storagesql.SqliteDriver:
		reg = func(s string) string {
			return fmt.Sprintf("REGEXP_LIKE(?, %s)", s)
		}
	default:
		reg = func(s string) string {
			return fmt.Sprintf("CAST(? AS BINARY) REGEXP BINARY %s", s)
		}
	}
	if r.Subject != "" {
		query = query.Where("(subject.has_regex = ? AND subject.template = ?) OR (subject.has_regex = ? AND "+reg("subject.compiled")+")", false, r.Subject, true, r.Subject)
	}
	if r.Resource != "" {
		query = query.Where("(resource.has_regex = ? AND resource.template = ?) OR (resource.has_regex = ? AND "+reg("resource.compiled")+")", false, r.Resource, true, r.Resource)
	}
	if r.Action != "" {
		query = query.Where("(action.has_regex = ? AND action.template = ?) OR (action.has_regex = ? AND "+reg("action.compiled")+")", false, r.Action, true, r.Action)
	}
	tx := query.Find(&policies)
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Now regroup retrieved rows by ID
	byID := make(map[string]*ladon.DefaultPolicy)
	for _, policy := range policies {
		if pol, ok := byID[policy.ID]; ok {
			pol.Actions = merge(pol.Actions, policy.Action)
			pol.Subjects = merge(pol.Subjects, policy.Subject)
			pol.Resources = merge(pol.Resources, policy.Resource)
		} else {
			idmPol := &idm.Policy{
				ID:          policy.ID,
				Description: policy.Description,
				Subjects:    []string{policy.Subject},
				Resources:   []string{policy.Resource},
				Actions:     []string{policy.Action},
				Effect:      policy.Effect,
				Conditions:  policy.Conditions,
			}
			byID[policy.ID] = converter.ProtoToLadonPolicy(idmPol).(*ladon.DefaultPolicy)
		}
	}

	var res ladon.Policies
	for _, policy := range byID {
		res = append(res, policy)
	}

	return res, nil
}

func merge(s1 []string, s2 string) []string {
	if !slices.Contains(s1, s2) {
		s1 = append(s1, s2)
	}
	return s1
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
		Preload("OrmActions").Preload("OrmResources").Preload("OrmSubjects").
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
	tx := s.instance(s.ctx).Preload("OrmActions").Preload("OrmResources").Preload("OrmSubjects").Where(&idm.Policy{ID: id}).Find(&policy)

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
